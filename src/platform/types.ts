export interface ProcessInfo {
  pid: number;
  name: string;
  port: number;
  protocol: "tcp" | "udp";
}

export interface PortStatus {
  port: number;
  inUse: boolean;
  process?: ProcessInfo;
}
