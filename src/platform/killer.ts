import { run } from "../utils/exec.js";
import { getProcessOnPort } from "./detector.js";

const platform = process.platform;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function killProcess(pid: number, force: boolean = false): Promise<boolean> {
  try {
    if (platform === "win32") {
      const flag = force ? " /F" : "";
      const { stderr } = await run(`taskkill /PID ${pid}${flag}`);
      return !stderr.includes("ERROR");
    } else {
      const signal = force ? "SIGKILL" : "SIGTERM";
      process.kill(pid, signal);
      return true;
    }
  } catch {
    return false;
  }
}

export async function killAndVerify(
  pid: number,
  port: number,
  force: boolean = false
): Promise<boolean> {
  const killed = await killProcess(pid, force);
  if (!killed) return false;

  // Verify port is freed (retry up to 3 times)
  for (let i = 0; i < 3; i++) {
    await sleep(500);
    const proc = await getProcessOnPort(port);
    if (!proc) return true;
  }

  return false;
}
