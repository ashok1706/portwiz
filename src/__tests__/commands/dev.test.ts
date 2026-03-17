import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../commands/free.js", () => ({
  ensurePortFree: vi.fn(),
}));
vi.mock("../../ui/output.js", () => ({
  info: vi.fn(),
  error: vi.fn(),
}));

// Mock child_process.spawn
const mockSpawn = vi.fn();
vi.mock("node:child_process", () => ({
  spawn: (...args: unknown[]) => mockSpawn(...args),
}));

import { devMode } from "../../commands/dev.js";
import { ensurePortFree } from "../../commands/free.js";
import { info, error } from "../../ui/output.js";

const mockEnsureFree = vi.mocked(ensurePortFree);

beforeEach(() => {
  vi.clearAllMocks();
  process.exitCode = undefined;

  // Default spawn mock: returns an EventEmitter-like object
  mockSpawn.mockReturnValue({
    kill: vi.fn(),
    on: vi.fn(),
  });
});

describe("devMode", () => {
  it("frees port and spawns the command", async () => {
    mockEnsureFree.mockResolvedValue(true);

    await devMode("3000", ["npm", "run", "dev"], {});

    expect(mockEnsureFree).toHaveBeenCalledWith(3000, false);
    expect(info).toHaveBeenCalledWith(expect.stringContaining("Starting: npm run dev"));
    expect(mockSpawn).toHaveBeenCalledWith(
      "npm run dev",
      expect.objectContaining({
        stdio: "inherit",
        shell: true,
      })
    );
  });

  it("sets PORT env variable", async () => {
    mockEnsureFree.mockResolvedValue(true);

    await devMode("4000", ["node", "server.js"], {});

    const spawnCall = mockSpawn.mock.calls[0];
    expect(spawnCall[1].env.PORT).toBe("4000");
  });

  it("errors when port cannot be freed", async () => {
    mockEnsureFree.mockResolvedValue(false);

    await devMode("3000", ["npm", "start"], {});

    expect(error).toHaveBeenCalledWith(expect.stringContaining("port is still in use"));
    expect(process.exitCode).toBe(1);
    expect(mockSpawn).not.toHaveBeenCalled();
  });

  it("passes force option through", async () => {
    mockEnsureFree.mockResolvedValue(true);

    await devMode("3000", ["npm", "start"], { force: true });

    expect(mockEnsureFree).toHaveBeenCalledWith(3000, true);
  });
});
