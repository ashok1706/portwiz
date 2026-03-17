import { getProcessOnPort } from "../platform/detector.js";
import { killAndVerify } from "../platform/killer.js";
import { info, success, warn, error, showProcess } from "../ui/output.js";
import { confirmKill } from "../ui/prompts.js";
import { validatePort } from "../utils/ports.js";

export async function freePort(portStr: string, options: { force?: boolean }): Promise<void> {
  const port = validatePort(portStr);

  info(`Checking port ${port}...`);
  const proc = await getProcessOnPort(port);

  if (!proc) {
    success(`Port ${port} is already free`);
    return;
  }

  warn(`Port ${port} is in use`);
  showProcess(proc);

  if (!options.force) {
    const confirmed = await confirmKill(proc.name, proc.pid);
    if (!confirmed) {
      info("Aborted");
      return;
    }
  }

  info(`Killing ${proc.name} (PID ${proc.pid})...`);
  const freed = await killAndVerify(proc.pid, port, options.force);

  if (freed) {
    success(`Port ${port} is now free`);
  } else {
    error(`Failed to free port ${port}. Try running with administrator/sudo privileges.`);
    process.exitCode = 1;
  }
}

/** Shared helper: free a port silently, returns true if freed or already free */
export async function ensurePortFree(port: number, force: boolean): Promise<boolean> {
  const proc = await getProcessOnPort(port);
  if (!proc) return true;

  warn(`Port ${port} is in use by ${proc.name} (PID ${proc.pid})`);

  if (!force) {
    const confirmed = await confirmKill(proc.name, proc.pid);
    if (!confirmed) return false;
  }

  info(`Killing ${proc.name} (PID ${proc.pid})...`);
  const freed = await killAndVerify(proc.pid, port, force);

  if (freed) {
    success(`Port ${port} is now free`);
    return true;
  } else {
    error(`Failed to free port ${port}`);
    return false;
  }
}
