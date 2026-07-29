const { spawn } = require('child_process');

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
