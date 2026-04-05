const http = require('http');

const payload = JSON.stringify({
  model: 'qwen2.5-coder:7b', // Model that OpenClaude would request for Ollama
  messages: [{ role: 'user', content: 'Test from Antigravity Bridge - please respond with OK' }]
});

const req = http.request({
  hostname: 'localhost',
  port: 3100,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer aiox-pool-token',
    'Content-Length': Buffer.byteLength(payload)
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('--- RESPONSE STATUS:', res.statusCode);
    console.log('--- RESPONSE BODY:', body);
    process.exit(0);
  });
});

req.on('error', err => {
  console.error('--- REQUEST ERROR:', err.message);
  process.exit(1);
});

console.log('Sending request to proxy testing Ollama model configuration...');
req.write(payload);
req.end();
