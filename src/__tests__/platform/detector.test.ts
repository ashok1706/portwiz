import { describe, it, expect } from "vitest";
import { createServer } from "node:net";
import { getProcessOnPort, getPortStatuses } from "../../platform/detector.js";

describe("getProcessOnPort", () => {
  it("returns null for a port that is not in use", async () => {
    // Use a high ephemeral port unlikely to be in use
    const result = await getProcessOnPort(59999);
    expect(result).toBeNull();
  });

  it("detects a process listening on a port", async () => {
    const server = createServer();
    const port = await new Promise<number>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr !== "string") {
          resolve(addr.port);
        }
      });
    });

    try {
      const result = await getProcessOnPort(port);
      expect(result).not.toBeNull();
      expect(result!.port).toBe(port);
      expect(result!.pid).toBe(process.pid);
      expect(result!.protocol).toBe("tcp");
      expect(typeof result!.name).toBe("string");
      expect(result!.name.length).toBeGreaterThan(0);
    } finally {
      server.close();
    }
  });
});

describe("getPortStatuses", () => {
  it("returns statuses for multiple ports", async () => {
    const server = createServer();
    const busyPort = await new Promise<number>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr !== "string") {
          resolve(addr.port);
        }
      });
    });

    try {
      const statuses = await getPortStatuses([busyPort, 59998]);

      expect(statuses).toHaveLength(2);

      const busyStatus = statuses.find((s) => s.port === busyPort)!;
      expect(busyStatus.inUse).toBe(true);
      expect(busyStatus.process).toBeDefined();
      expect(busyStatus.process!.pid).toBe(process.pid);

      const freeStatus = statuses.find((s) => s.port === 59998)!;
      expect(freeStatus.inUse).toBe(false);
      expect(freeStatus.process).toBeUndefined();
    } finally {
      server.close();
    }
  });

  it("returns empty array for empty input", async () => {
    const statuses = await getPortStatuses([]);
    expect(statuses).toHaveLength(0);
  });
});
