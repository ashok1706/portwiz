import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function run(cmd: string): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(cmd, { timeout: 5000 });
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; code?: number };
    return { stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}
