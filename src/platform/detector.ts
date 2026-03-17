import { run } from "../utils/exec.js";
import type { ProcessInfo, PortStatus } from "./types.js";

const platform = process.platform;

async function getProcessOnPortWin32(port: number): Promise<ProcessInfo | null> {
  const { stdout } = await run(`netstat -ano | findstr :${port}`);
  if (!stdout.trim()) return null;

  for (const line of stdout.trim().split("\n")) {
    const parts = line.trim().split(/\s+/);
    // Look for LISTENING state with our port in local address
    if (parts.length < 5) continue;
    const localAddr = parts[1];
    const state = parts[3];
    if (state !== "LISTENING") continue;
    // localAddr is like 0.0.0.0:3000 or [::]:3000
    const addrPort = localAddr.split(":").pop();
    if (addrPort !== String(port)) continue;

    const pid = parseInt(parts[4], 10);
    if (isNaN(pid) || pid === 0) continue;

    const name = await getProcessNameWin32(pid);
    return { pid, name, port, protocol: "tcp" };
  }

  return null;
}

async function getProcessNameWin32(pid: number): Promise<string> {
  const { stdout } = await run(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
  if (!stdout.trim()) return "unknown";
  // Output: "name.exe","PID","Session Name","Session#","Mem Usage"
  const match = stdout.match(/"([^"]+)"/);
  return match ? match[1].replace(/\.exe$/i, "") : "unknown";
}

async function getProcessOnPortUnix(port: number): Promise<ProcessInfo | null> {
  const { stdout } = await run(`lsof -iTCP:${port} -sTCP:LISTEN -n -P`);
  if (!stdout.trim()) return null;

  const lines = stdout.trim().split("\n");
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length < 2) continue;
    const name = parts[0];
    const pid = parseInt(parts[1], 10);
    if (isNaN(pid)) continue;
    return { pid, name, port, protocol: "tcp" };
  }

  return null;
}

async function getProcessOnPortLinuxSs(port: number): Promise<ProcessInfo | null> {
  const { stdout } = await run(`ss -tlnp sport = :${port}`);
  if (!stdout.trim()) return null;

  const lines = stdout.trim().split("\n");
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Match users:(("name",pid=1234,fd=5))
    const match = line.match(/users:\(\("([^"]+)",pid=(\d+)/);
    if (match) {
      return { pid: parseInt(match[2], 10), name: match[1], port, protocol: "tcp" };
    }
  }

  return null;
}

export async function getProcessOnPort(port: number): Promise<ProcessInfo | null> {
  if (platform === "win32") {
    return getProcessOnPortWin32(port);
  }

  // Try lsof first (macOS + Linux)
  const result = await getProcessOnPortUnix(port);
  if (result) return result;

  // Fallback to ss on Linux
  if (platform === "linux") {
    return getProcessOnPortLinuxSs(port);
  }

  return null;
}

export async function getPortStatuses(ports: number[]): Promise<PortStatus[]> {
  const results: PortStatus[] = [];
  // Run all checks in parallel
  const checks = await Promise.all(ports.map((port) => getProcessOnPort(port)));
  for (let i = 0; i < ports.length; i++) {
    const proc = checks[i];
    results.push({
      port: ports[i],
      inUse: proc !== null,
      process: proc ?? undefined,
    });
  }
  return results;
}
