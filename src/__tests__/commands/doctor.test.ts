import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../platform/detector.js", () => ({
  getPortStatuses: vi.fn(),
}));
vi.mock("../../platform/killer.js", () => ({
  killAndVerify: vi.fn(),
}));
vi.mock("../../ui/prompts.js", () => ({
  confirmKillAll: vi.fn(),
}));
vi.mock("../../ui/output.js", () => ({
  info: vi.fn(),
  success: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  showPortTable: vi.fn(),
}));

import { doctor } from "../../commands/doctor.js";
import { getPortStatuses } from "../../platform/detector.js";
import { killAndVerify } from "../../platform/killer.js";
import { confirmKillAll } from "../../ui/prompts.js";
import { success, warn, error } from "../../ui/output.js";

const mockGetStatuses = vi.mocked(getPortStatuses);
const mockKillAndVerify = vi.mocked(killAndVerify);
const mockConfirmAll = vi.mocked(confirmKillAll);

beforeEach(() => {
  vi.clearAllMocks();
  process.exitCode = undefined;
});

describe("doctor", () => {
  it("reports all ports free when nothing is busy", async () => {
    mockGetStatuses.mockResolvedValue([
      { port: 3000, inUse: false },
      { port: 8080, inUse: false },
    ]);

    await doctor({});

    expect(success).toHaveBeenCalledWith(expect.stringContaining("All ports are free"));
  });

  it("shows busy ports and prompts to kill", async () => {
    mockGetStatuses.mockResolvedValue([
      { port: 3000, inUse: true, process: { pid: 1234, name: "node", port: 3000, protocol: "tcp" } },
      { port: 8080, inUse: false },
    ]);
    mockConfirmAll.mockResolvedValue(true);
    mockKillAndVerify.mockResolvedValue(true);

    await doctor({});

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("1 port is in use"));
    expect(mockKillAndVerify).toHaveBeenCalledWith(1234, 3000, false);
    expect(success).toHaveBeenCalledWith(expect.stringContaining("All ports are now free"));
  });

  it("aborts when user declines", async () => {
    mockGetStatuses.mockResolvedValue([
      { port: 3000, inUse: true, process: { pid: 1234, name: "node", port: 3000, protocol: "tcp" } },
    ]);
    mockConfirmAll.mockResolvedValue(false);

    await doctor({});

    expect(mockKillAndVerify).not.toHaveBeenCalled();
  });

  it("force-kills without prompting", async () => {
    mockGetStatuses.mockResolvedValue([
      { port: 3000, inUse: true, process: { pid: 1234, name: "node", port: 3000, protocol: "tcp" } },
      { port: 5173, inUse: true, process: { pid: 5678, name: "vite", port: 5173, protocol: "tcp" } },
    ]);
    mockKillAndVerify.mockResolvedValue(true);

    await doctor({ force: true });

    expect(mockConfirmAll).not.toHaveBeenCalled();
    expect(mockKillAndVerify).toHaveBeenCalledTimes(2);
    expect(success).toHaveBeenCalledWith(expect.stringContaining("All ports are now free"));
  });

  it("uses custom port list when provided", async () => {
    mockGetStatuses.mockResolvedValue([
      { port: 4000, inUse: false },
      { port: 4001, inUse: false },
    ]);

    await doctor({ ports: "4000,4001" });

    expect(mockGetStatuses).toHaveBeenCalledWith([4000, 4001]);
  });

  it("sets exitCode when some kills fail", async () => {
    mockGetStatuses.mockResolvedValue([
      { port: 3000, inUse: true, process: { pid: 1234, name: "node", port: 3000, protocol: "tcp" } },
    ]);
    mockKillAndVerify.mockResolvedValue(false);

    await doctor({ force: true });

    expect(error).toHaveBeenCalledWith(expect.stringContaining("Failed"));
    expect(process.exitCode).toBe(1);
  });
});
