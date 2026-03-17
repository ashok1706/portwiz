import { describe, it, expect } from "vitest";
import { run } from "../../utils/exec.js";

describe("run", () => {
  it("executes a simple command and returns stdout", async () => {
    const { stdout } = await run("echo hello");
    expect(stdout.trim()).toBe("hello");
  });

  it("returns stderr on error without throwing", async () => {
    const result = await run("node -e \"process.stderr.write('oops'); process.exit(1)\"");
    expect(result.stderr).toContain("oops");
  });

  it("returns empty strings for a command that produces no output", async () => {
    const result = await run("node -e \"\"");
    expect(result.stdout).toBe("");
  });

  it("handles non-existent commands gracefully", async () => {
    const result = await run("nonexistentcommand12345");
    // Should not throw, returns empty or error output
    expect(result).toHaveProperty("stdout");
    expect(result).toHaveProperty("stderr");
  });
});
