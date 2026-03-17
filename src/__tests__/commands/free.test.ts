import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules before importing the command
vi.mock("../../platform/detector.js", () => ({
  getProcessOnPort: vi.fn(),
}));
vi.mock("../../platform/killer.js", () => ({
  killAndVerify: vi.fn(),
}));
vi.mock("../../ui/prompts.js", () => ({
  confirmKill: vi.fn(),
}));
vi.mock("../../ui/output.js", () => ({
  info: vi.fn(),
  success: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  showProcess: vi.fn(),
}));

import { freePort, ensurePortFree } from "../../commands/free.js";
import { getProcessOnPort } from "../../platform/detector.js";
import { killAndVerify } from "../../platform/killer.js";
import { confirmKill } from "../../ui/prompts.js";
import { success, warn, error } from "../../ui/output.js";

const mockGetProcess = vi.mocked(getProcessOnPort);
const mockKillAndVerify = vi.mocked(killAndVerify);
const mockConfirmKill = vi.mocked(confirmKill);

beforeEach(() => {
  vi.clearAllMocks();
  process.exitCode = undefined;
});

describe("freePort", () => {
  it("reports port is free when nothing is using it", async () => {
    mockGetProcess.mockResolvedValue(null);

    await freePort("3000", {});

    expect(success).toHaveBeenCalledWith(expect.stringContaining("already free"));
  });

  it("kills process with --force without prompting", async () => {
    mockGetProcess.mockResolvedValue({ pid: 1234, name: "node", port: 3000, protocol: "tcp" });
    mockKillAndVerify.mockResolvedValue(true);

    await freePort("3000", { force: true });

    expect(mockConfirmKill).not.toHaveBeenCalled();
    expect(mockKillAndVerify).toHaveBeenCalledWith(1234, 3000, true);
    expect(success).toHaveBeenCalledWith(expect.stringContaining("now free"));
  });

  it("prompts for confirmation and aborts when declined", async () => {
    mockGetProcess.mockResolvedValue({ pid: 1234, name: "node", port: 3000, protocol: "tcp" });
    mockConfirmKill.mockResolvedValue(false);

    await freePort("3000", {});

    expect(mockKillAndVerify).not.toHaveBeenCalled();
  });

  it("prompts for confirmation and kills when accepted", async () => {
    mockGetProcess.mockResolvedValue({ pid: 1234, name: "node", port: 3000, protocol: "tcp" });
    mockConfirmKill.mockResolvedValue(true);
    mockKillAndVerify.mockResolvedValue(true);

    await freePort("3000", {});

    expect(mockKillAndVerify).toHaveBeenCalledWith(1234, 3000, undefined);
    expect(success).toHaveBeenCalledWith(expect.stringContaining("now free"));
  });

  it("sets exitCode when kill fails", async () => {
    mockGetProcess.mockResolvedValue({ pid: 1234, name: "node", port: 3000, protocol: "tcp" });
    mockKillAndVerify.mockResolvedValue(false);

    await freePort("3000", { force: true });

    expect(error).toHaveBeenCalledWith(expect.stringContaining("Failed"));
    expect(process.exitCode).toBe(1);
  });

  it("throws for invalid port", async () => {
    await expect(freePort("abc", {})).rejects.toThrow("Invalid port");
  });
});

describe("ensurePortFree", () => {
  it("returns true when port is already free", async () => {
    mockGetProcess.mockResolvedValue(null);

    const result = await ensurePortFree(3000, false);
    expect(result).toBe(true);
  });

  it("returns false when user declines kill", async () => {
    mockGetProcess.mockResolvedValue({ pid: 1234, name: "node", port: 3000, protocol: "tcp" });
    mockConfirmKill.mockResolvedValue(false);

    const result = await ensurePortFree(3000, false);
    expect(result).toBe(false);
  });

  it("force-kills without prompting", async () => {
    mockGetProcess.mockResolvedValue({ pid: 1234, name: "node", port: 3000, protocol: "tcp" });
    mockKillAndVerify.mockResolvedValue(true);

    const result = await ensurePortFree(3000, true);
    expect(result).toBe(true);
    expect(mockConfirmKill).not.toHaveBeenCalled();
  });
});
