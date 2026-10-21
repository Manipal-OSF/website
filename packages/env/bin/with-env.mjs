#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { constants } from 'node:os';
import { loadRootEnv } from '../load.mjs';

const [mode, command, ...args] = process.argv.slice(2);

if (!command) {
  console.error(
    'Usage: with-env <development|production|test> <command> [args...]'
  );
  process.exit(1);
}

loadRootEnv(mode);

const child = spawn(command, args, { stdio: 'inherit', env: process.env });
const forwardSignal = (signal) => child.kill(signal);
process.on('SIGINT', forwardSignal);
process.on('SIGTERM', forwardSignal);

child.on('error', (error) => {
  console.error(`Unable to run ${command}: ${error.message}`);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  process.removeListener('SIGINT', forwardSignal);
  process.removeListener('SIGTERM', forwardSignal);
  process.exitCode = code ?? 128 + (constants.signals[signal] ?? 1);
});
