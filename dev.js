const { spawn, execSync } = require('child_process');

console.log('\n🧹 Checking and cleaning ports 5000 and 5001...');
try {
  execSync('powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000,5001 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue"', { stdio: 'ignore' });
} catch (e) {
  // Ignore errors if no processes are bound to these ports
}

console.log('\n🚀 Starting SmartFood Frontend & Backend concurrently...\n');

const client = spawn('npm', ['run', 'dev', '--prefix', 'client'], { stdio: 'inherit', shell: true });
const server = spawn('npm', ['start', '--prefix', 'server'], { stdio: 'inherit', shell: true });

client.on('close', (code) => {
  server.kill();
  process.exit(code);
});

server.on('close', (code) => {
  client.kill();
  process.exit(code);
});
