import { createServer } from "node:net";

export const COMMON_DEV_PORTS = [
  3000, 3001, 4200, 5000, 5173, 5174, 8000, 8080, 8081, 8443, 9000, 9090,
];

export function validatePort(input: string): number {
  const port = parseInt(input, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${input}. Must be between 1 and 65535.`);
  }
  return port;
}

export function findNextFreePort(startFrom: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const tryPort = (port: number) => {
      if (port > 65535) {
        reject(new Error("No free port found"));
        return;
      }
      const server = createServer();
      server.once("error", () => tryPort(port + 1));
      server.once("listening", () => {
        server.close(() => resolve(port));
      });
      server.listen(port);
    };
    tryPort(startFrom);
  });
}
