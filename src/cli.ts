#!/usr/bin/env node

import { Command } from "commander";
import { freePort } from "./commands/free.js";
import { switchPort } from "./commands/switch.js";
import { devMode } from "./commands/dev.js";
import { doctor } from "./commands/doctor.js";
import { error } from "./ui/output.js";

const program = new Command();

program
  .name("portwiz")
  .description("Fix port conflicts instantly and run your dev server without interruptions")
  .version("1.0.0")
  .enablePositionalOptions();

// Default command: portwiz <port>
program
  .argument("[port]", "port number to check/free")
  .option("-f, --force", "kill process without confirmation")
  .option("-s, --switch", "find next available port instead of killing")
  .action(async (port: string | undefined, options: { force?: boolean; switch?: boolean }) => {
    if (!port) {
      program.help();
      return;
    }
    try {
      if (options.switch) {
        await switchPort(port);
      } else {
        await freePort(port, options);
      }
    } catch (err: unknown) {
      error((err as Error).message);
      process.exitCode = 1;
    }
  });

// Dev command: portwiz dev <port> -- <cmd>
program
  .command("dev")
  .description("free a port and start your dev server")
  .argument("<port>", "port number to free")
  .argument("<cmd...>", "command to run after freeing the port")
  .option("-f, --force", "kill process without confirmation")
  .passThroughOptions()
  .action(async (port: string, cmd: string[], options: { force?: boolean }) => {
    try {
      await devMode(port, cmd, options);
    } catch (err: unknown) {
      error((err as Error).message);
      process.exitCode = 1;
    }
  });

// Doctor command: portwiz doctor
program
  .command("doctor")
  .description("scan common dev ports and report status")
  .option("-f, --force", "kill all busy processes without confirmation")
  .option("--ports <list>", "custom comma-separated port list")
  .action(async (options: { force?: boolean; ports?: string }) => {
    try {
      await doctor(options);
    } catch (err: unknown) {
      error((err as Error).message);
      process.exitCode = 1;
    }
  });

program.parse();
