import pc from "picocolors";
import type { ProcessInfo, PortStatus } from "../platform/types.js";

export const info = (msg: string) => console.log(pc.cyan("i") + " " + msg);
export const success = (msg: string) => console.log(pc.green("\u2714") + " " + msg);
export const warn = (msg: string) => console.log(pc.yellow("!") + " " + msg);
export const error = (msg: string) => console.error(pc.red("\u2716") + " " + msg);

export function showProcess(p: ProcessInfo): void {
  console.log();
  console.log(`  ${pc.dim("PID:")}     ${pc.bold(String(p.pid))}`);
  console.log(`  ${pc.dim("Process:")} ${pc.bold(p.name)}`);
  console.log();
}

export function showPortTable(statuses: PortStatus[]): void {
  console.log();
  console.log(
    `  ${pc.bold(pad("PORT", 8))}${pc.bold(pad("STATUS", 10))}${pc.bold("PROCESS")}`
  );

  for (const s of statuses) {
    const port = pad(String(s.port), 8);
    const status = s.inUse
      ? pc.red(pad("in use", 10))
      : pc.green(pad("free", 10));
    const proc = s.process
      ? `${s.process.name} (PID ${s.process.pid})`
      : pc.dim("-");
    console.log(`  ${port}${status}${proc}`);
  }
  console.log();
}

function pad(str: string, len: number): string {
  return str.padEnd(len);
}
