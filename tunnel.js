const { spawn } = require('child_process');

console.log('🚀 Starting ngrok tunnel for doorbell-spry-judgingly.ngrok-free.dev on port 5000...');

const ngrokCmd = process.platform === 'win32' ? 'ngrok.exe' : 'ngrok';

// Use shell: false and stdio: 'ignore' to prevent Command Prompt popups on Windows
const ngrok = spawn(ngrokCmd, ['http', '5000', '--url=doorbell-spry-judgingly.ngrok-free.dev'], { stdio: 'ignore', shell: false });

ngrok.on('close', (code) => {
  console.log(`ngrok exited with code ${code}`);
  process.exit(code);
});
