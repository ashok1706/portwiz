import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../platform/detector.js", () => ({
  getProcessOnPort: vi.fn(),
}));
vi.mock("../../ui/output.js", () => ({
  info: vi.fn(),
  success: vi.fn(),
}));
vi.mock("../../utils/ports.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../utils/ports.js")>();
  return {
    ...actual,
    findNextFreePort: vi.fn(),
  };
});

import { switchPort } from "../../commands/switch.js";
import { getProcessOnPort } from "../../platform/detector.js";
import { info, success } from "../../ui/output.js";
import { findNextFreePort } from "../../utils/ports.js";

const mockGetProcess = vi.mocked(getProcessOnPort);
const mockFindNext = vi.mocked(findNextFreePort);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("switchPort", () => {
  it("reports port is available when not in use", async () => {
    mockGetProcess.mockResolvedValue(null);

    await switchPort("3000");

    expect(success).toHaveBeenCalledWith(expect.stringContaining("already available"));
  });

  it("finds next free port when port is busy", async () => {
    mockGetProcess.mockResolvedValue({ pid: 1234, name: "node", port: 3000, protocol: "tcp" });
    mockFindNext.mockResolvedValue(3001);

    await switchPort("3000");

    expect(info).toHaveBeenCalledWith(expect.stringContaining("in use"));
    expect(mockFindNext).toHaveBeenCalledWith(3001);
    expect(success).toHaveBeenCalledWith(expect.stringContaining("3001"));
  });
});
