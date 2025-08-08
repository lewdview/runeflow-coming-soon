#!/usr/bin/env node
/*
  Smart start script for multi-service repo.
  Usage:
    SERVICE=runerush npm start   # starts Runerush backend
    SERVICE=api npm start        # starts API service
    SERVICE=dashboard npm start  # starts Next.js dashboard
  Defaults to SERVICE=runerush.
*/

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SERVICE = (process.env.SERVICE || 'runerush').toLowerCase();
const SERVICE_DIRS = {
  api: 'api',
  runerush: 'runerush',
  dashboard: 'dashboard'
};

if (!Object.keys(SERVICE_DIRS).includes(SERVICE)) {
  console.error(`Unknown SERVICE="${SERVICE}". Valid options: ${Object.keys(SERVICE_DIRS).join(', ')}`);
  process.exit(1);
}

const cwd = path.join(__dirname, SERVICE_DIRS[SERVICE]);
const pkgPath = path.join(cwd, 'package.json');

if (!fs.existsSync(pkgPath)) {
  console.error(`No package.json found for service "${SERVICE}" at ${pkgPath}`);
  process.exit(1);
}

// Ensure PORT defaults to 8080 to match Railway/Netlify expectations
process.env.PORT = process.env.PORT || '8080';

console.log(`Starting service: ${SERVICE} (cwd: ${cwd}) on port ${process.env.PORT}`);

const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['start'], {
  cwd,
  stdio: 'inherit',
  env: process.env,
  shell: false
});

child.on('exit', (code) => process.exit(code));
