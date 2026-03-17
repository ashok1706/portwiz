import { spawn } from "node:child_process";
import { ensurePortFree } from "./free.js";
import { info, error } from "../ui/output.js";
import { validatePort } from "../utils/ports.js";

export async function devMode(
  portStr: string,
  command: string[],
  options: { force?: boolean }
): Promise<void> {
  const port = validatePort(portStr);

  const freed = await ensurePortFree(port, !!options.force);
  if (!freed) {
    error("Cannot start — port is still in use");
    process.exitCode = 1;
    return;
  }

  const cmd = command.join(" ");
  info(`Starting: ${cmd}`);

  const child = spawn(cmd, {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, PORT: String(port) },
  });

  const forwardSignal = (signal: NodeJS.Signals) => {
    child.kill(signal);
  };
  process.on("SIGINT", forwardSignal);
  process.on("SIGTERM", forwardSignal);

  child.on("exit", (code) => {
    process.exitCode = code ?? 1;
  });
}
