#!/usr/bin/env node

/**
 * Script to ensure Docker containers are running before starting the application
 */

const { execSync } = require('child_process');

const CONTAINER_NAME = 'skinventra-postgres';
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 1000; // 1 second

/**
 * Check if Docker is running
 */
function isDockerRunning() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if container exists and is running
 */
function isContainerRunning() {
  try {
    const output = execSync(
      `docker ps --filter "name=${CONTAINER_NAME}" --format "{{.Names}}"`,
      { encoding: 'utf8' }
    );
    return output.trim() === CONTAINER_NAME;
  } catch {
    return false;
  }
}

/**
 * Check if container is healthy
 */
function isContainerHealthy() {
  try {
    const output = execSync(
      `docker inspect --format="{{.State.Health.Status}}" ${CONTAINER_NAME}`,
      { encoding: 'utf8' }
    );
    return output.trim() === 'healthy';
  } catch {
    return false;
  }
}

/**
 * Start Docker containers
 */
function startDocker() {
  console.log('🐳 Starting Docker containers...');
  try {
    execSync('docker-compose up -d', { stdio: 'inherit' });
    console.log('✅ Docker containers started successfully');
  } catch (error) {
    console.error('❌ Failed to start Docker containers');
    process.exit(1);
  }
}

/**
 * Wait for container to become healthy
 */
async function waitForHealthy() {
  console.log('⏳ Waiting for PostgreSQL to become healthy...');
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    if (isContainerHealthy()) {
      console.log('✅ PostgreSQL is healthy and ready');
      return;
    }
    
    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
  }
  
  console.log('\n⚠️  PostgreSQL health check timeout, but continuing...');
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Checking Docker status...');
  
  // Check if Docker is running
  if (!isDockerRunning()) {
    console.error('❌ Docker is not running. Please start Docker Desktop and try again.');
    process.exit(1);
  }
  
  // Check if container is running
  if (isContainerRunning()) {
    console.log('✅ Docker container is already running');
    
    // Check if healthy
    if (isContainerHealthy()) {
      console.log('✅ PostgreSQL is healthy');
    } else {
      await waitForHealthy();
    }
  } else {
    // Start containers
    startDocker();
    
    // Wait for health check
    await waitForHealthy();
  }
  
  console.log('🚀 Ready to start application\n');
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

