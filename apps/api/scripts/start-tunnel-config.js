#!/usr/bin/env node

/**
 * Start Cloudflare Named Tunnel with config file
 * Uses path-based routing for frontend and backend on same domain
 */

const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Config file location
const configPath = path.join(os.homedir(), '.cloudflared', 'config.yml');

// Check if config exists
if (!fs.existsSync(configPath)) {
  log('\n❌ Error: Cloudflare config file not found!', colors.red);
  log(`   Expected location: ${configPath}`, colors.yellow);
  log('\n   Please create the config file first.', colors.yellow);
  log('   See apps/api/.cloudflared-config-example.yml for template\n', colors.yellow);
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
log('  🚇 Starting Cloudflare Named Tunnel', colors.bright);
console.log('='.repeat(60));
log(`  Config: ${configPath}`, colors.cyan);
log(`  Hostname: skinventra.org`, colors.cyan);
log(`  Frontend: localhost:5173 (/)`, colors.green);
log(`  Backend:  localhost:3000 (/auth, /api)\n`, colors.green);

const tunnel = spawn('cloudflared', ['tunnel', '--config', configPath, 'run'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

tunnel.on('error', (error) => {
  if (error.code === 'ENOENT') {
    log('\n❌ cloudflared not found!', colors.red);
    log('   Please install Cloudflare Tunnel:', colors.yellow);
    log('   Windows: winget install --id Cloudflare.cloudflared', colors.yellow);
    log('   macOS:   brew install cloudflare/cloudflare/cloudflared', colors.yellow);
    log('   Linux:   https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/\n', colors.yellow);
  } else {
    log(`\n❌ Error starting tunnel: ${error.message}`, colors.red);
  }
  process.exit(1);
});

tunnel.on('close', (code) => {
  if (code !== 0) {
    log(`\n⚠️  Tunnel exited with code ${code}`, colors.yellow);
  }
  process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
  log('\n\n🛑 Stopping tunnel...', colors.yellow);
  tunnel.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  tunnel.kill();
  process.exit(0);
});

