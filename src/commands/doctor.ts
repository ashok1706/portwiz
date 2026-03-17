import { getPortStatuses } from "../platform/detector.js";
import { killAndVerify } from "../platform/killer.js";
import { info, success, warn, error, showPortTable } from "../ui/output.js";
import { confirmKillAll } from "../ui/prompts.js";
import { COMMON_DEV_PORTS } from "../utils/ports.js";

export async function doctor(options: { force?: boolean; ports?: string }): Promise<void> {
  const ports = options.ports
    ? options.ports.split(",").map((p) => parseInt(p.trim(), 10))
    : COMMON_DEV_PORTS;

  info("Scanning development ports...");
  const statuses = await getPortStatuses(ports);

  showPortTable(statuses);

  const busy = statuses.filter((s) => s.inUse && s.process);
  if (busy.length === 0) {
    success("All ports are free");
    return;
  }

  warn(`${busy.length} port${busy.length > 1 ? "s are" : " is"} in use`);

  if (!options.force) {
    const confirmed = await confirmKillAll(busy.length);
    if (!confirmed) {
      info("Aborted");
      return;
    }
  }

  let allFreed = true;
  for (const s of busy) {
    const proc = s.process!;
    info(`Killing ${proc.name} (PID ${proc.pid}) on port ${s.port}...`);
    const freed = await killAndVerify(proc.pid, s.port, !!options.force);
    if (!freed) {
      error(`Failed to free port ${s.port}`);
      allFreed = false;
    }
  }

  if (allFreed) {
    success("All ports are now free");
  } else {
    warn("Some ports could not be freed. Try running with administrator/sudo privileges.");
    process.exitCode = 1;
  }
}
