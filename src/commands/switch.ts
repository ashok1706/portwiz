import { getProcessOnPort } from "../platform/detector.js";
import { info, success } from "../ui/output.js";
import { validatePort, findNextFreePort } from "../utils/ports.js";

export async function switchPort(portStr: string): Promise<void> {
  const port = validatePort(portStr);

  const proc = await getProcessOnPort(port);

  if (!proc) {
    success(`Port ${port} is already available`);
    return;
  }

  info(`Port ${port} is in use by ${proc.name} (PID ${proc.pid})`);
  const nextPort = await findNextFreePort(port + 1);
  success(`Port ${nextPort} is available`);
}
