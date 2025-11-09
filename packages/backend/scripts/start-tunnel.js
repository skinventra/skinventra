#!/usr/bin/env node

/**
 * Start Cloudflare Named Tunnel
 * Reads configuration from .env file
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

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

const token = process.env.CLOUDFLARE_TUNNEL_TOKEN;
const realm = process.env.STEAM_REALM;
const port = process.env.PORT || 3000;

if (!token) {
  log('\n❌ Error: CLOUDFLARE_TUNNEL_TOKEN not set in .env file!', colors.red);
  log('   Please add your tunnel token to packages/backend/.env\n', colors.yellow);
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
log('  🚇 Starting Cloudflare Tunnel', colors.bright);
console.log('='.repeat(60));
log(`  Domain:  ${realm}`, colors.cyan);
log(`  Target:  localhost:${port}\n`, colors.cyan);

const tunnel = spawn('cloudflared', ['tunnel', '--token', token], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

tunnel.on('error', (error) => {
  if (error.code === 'ENOENT') {
    log('\n❌ cloudflared not found!', colors.reset);
    log('   Please install Cloudflare Tunnel:', colors.yellow);
    log('   Windows: winget install --id Cloudflare.cloudflared', colors.yellow);
    log('   macOS:   brew install cloudflare/cloudflare/cloudflared', colors.yellow);
    log('   Linux:   https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/\n', colors.yellow);
  } else {
    log(`\n❌ Error starting tunnel: ${error.message}`, colors.reset);
  }
  process.exit(1);
});

tunnel.on('close', (code) => {
  if (code !== 0) {
    log(`\n⚠️  Tunnel exited with code ${code}`, colors.yellow);
  }
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n🛑 Stopping tunnel...', colors.yellow);
  tunnel.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  tunnel.kill();
  process.exit(0);
});

