const { spawn } = require('child_process');
const path = require('path');

const env = { ...process.env };
env.CLAUDE_CODE_USE_OPENAI = '1';
env.OPENAI_BASE_URL = 'http://127.0.0.1:3100/v1';
env.OPENAI_API_KEY = 'local-engine';
env.OPENAI_MODEL = 'aiox-muscle-v4';

const args = [
  path.join(__dirname, '..', 'packages', 'openclaude-src', 'dist', 'cli.mjs'),
  'liste os arquivos do diretorio atual usando ls ou dir',
  '--dangerously-skip-permissions'
];

console.log('Spawning...', args.join(' '));
const child = spawn('node', args, { env, cwd: path.join(__dirname, '..') });

child.stdout.on('data', d => process.stdout.write('OUT: ' + d.toString()));
child.stderr.on('data', d => process.stdout.write('ERR: ' + d.toString()));
child.on('close', c => console.log('Exit', c));
