import { describe, it, expect } from "vitest";
import { fork } from "node:child_process";
import { createServer } from "node:net";
import { killProcess, killAndVerify } from "../../platform/killer.js";

function spawnDummyServer(port: number): Promise<{ pid: number; cleanup: () => void }> {
  return new Promise((resolve, reject) => {
    const child = fork(
      "-e",
      [`require("net").createServer().listen(${port}, () => process.send("ready"))`],
      { execArgv: [], stdio: ["pipe", "pipe", "pipe", "ipc"] }
    );

    child.on("message", (msg) => {
      if (msg === "ready") {
        resolve({
          pid: child.pid!,
          cleanup: () => {
            try { child.kill("SIGKILL"); } catch {}
          },
        });
      }
    });

    child.on("error", reject);

    setTimeout(() => reject(new Error("Timed out waiting for child server")), 5000);
  });
}

describe("killProcess", () => {
  it("kills a running process", async () => {
    const child = fork("-e", ["setTimeout(() => {}, 60000)"], {
      execArgv: [],
      stdio: "pipe",
    });

    // Give it a moment to start
    await new Promise((r) => setTimeout(r, 200));

    const result = await killProcess(child.pid!, true);
    expect(result).toBe(true);

    // Verify the process is gone
    await new Promise((r) => setTimeout(r, 500));
    let alive = true;
    try {
      process.kill(child.pid!, 0);
    } catch {
      alive = false;
    }
    expect(alive).toBe(false);
  });

  it("returns false for a non-existent PID", async () => {
    const result = await killProcess(999999, true);
    expect(result).toBe(false);
  });
});

describe("killAndVerify", () => {
  it("kills a process and verifies the port is freed", async () => {
    const port = 49321;
    let helper: { pid: number; cleanup: () => void } | null = null;

    try {
      helper = await spawnDummyServer(port);

      const result = await killAndVerify(helper.pid, port, true);
      expect(result).toBe(true);
    } finally {
      if (helper) helper.cleanup();
    }
  });
});
