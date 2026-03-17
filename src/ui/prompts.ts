import confirm from "@inquirer/confirm";

export async function confirmKill(processName: string, pid: number): Promise<boolean> {
  if (!process.stdin.isTTY) return false;
  return confirm({
    message: `Kill ${processName} (PID ${pid}) to free the port?`,
    default: false,
  });
}

export async function confirmKillAll(count: number): Promise<boolean> {
  if (!process.stdin.isTTY) return false;
  return confirm({
    message: `Free all ${count} busy port${count > 1 ? "s" : ""}?`,
    default: false,
  });
}
