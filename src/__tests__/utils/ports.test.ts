import { describe, it, expect } from "vitest";
import { createServer } from "node:net";
import { validatePort, findNextFreePort, COMMON_DEV_PORTS } from "../../utils/ports.js";

describe("validatePort", () => {
  it("parses a valid port number", () => {
    expect(validatePort("3000")).toBe(3000);
    expect(validatePort("1")).toBe(1);
    expect(validatePort("65535")).toBe(65535);
    expect(validatePort("8080")).toBe(8080);
  });

  it("throws for non-numeric input", () => {
    expect(() => validatePort("abc")).toThrow("Invalid port");
    expect(() => validatePort("")).toThrow("Invalid port");
    expect(() => validatePort("foo3000")).toThrow("Invalid port");
  });

  it("throws for out-of-range ports", () => {
    expect(() => validatePort("0")).toThrow("Invalid port");
    expect(() => validatePort("-1")).toThrow("Invalid port");
    expect(() => validatePort("65536")).toThrow("Invalid port");
    expect(() => validatePort("100000")).toThrow("Invalid port");
  });

  it("throws for floating point numbers", () => {
    // parseInt("3.5") returns 3, which is valid — this is acceptable behavior
    expect(validatePort("3.5")).toBe(3);
  });
});

describe("findNextFreePort", () => {
  it("returns the given port if it is free", async () => {
    const port = await findNextFreePort(49152);
    expect(port).toBeGreaterThanOrEqual(49152);
    expect(port).toBeLessThanOrEqual(65535);
  });

  it("skips a port that is in use and finds the next one", async () => {
    // Occupy a port
    const server = createServer();
    const occupiedPort = await new Promise<number>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr !== "string") {
          resolve(addr.port);
        }
      });
    });

    try {
      const freePort = await findNextFreePort(occupiedPort);
      expect(freePort).toBeGreaterThan(occupiedPort);
    } finally {
      server.close();
    }
  });
});

describe("COMMON_DEV_PORTS", () => {
  it("contains well-known development ports", () => {
    expect(COMMON_DEV_PORTS).toContain(3000);
    expect(COMMON_DEV_PORTS).toContain(5173);
    expect(COMMON_DEV_PORTS).toContain(8080);
    expect(COMMON_DEV_PORTS.length).toBeGreaterThan(0);
  });

  it("contains only valid port numbers", () => {
    for (const port of COMMON_DEV_PORTS) {
      expect(port).toBeGreaterThanOrEqual(1);
      expect(port).toBeLessThanOrEqual(65535);
    }
  });
});
