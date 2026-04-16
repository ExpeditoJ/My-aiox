const fs = require('fs');
const path = require('path');

const mode = process.argv[2];
const poolPath = path.join(process.cwd(), '.aiox-core', 'local', 'api-pool.json');

if (!['turbo', 'logic', 'heavy'].includes(mode)) {
    console.log('Uso: node switch-muscle.js [turbo|logic|heavy]');
    process.exit(1);
}

try {
    const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
    
    pool.providers.forEach(p => {
        if (p.id.startsWith('ollama-')) {
            p.enabled = (p.id === `ollama-${mode}`);
            // Se habilitado, ganha prioridade 0 (primeiro da fila)
            p.priority = p.enabled ? 0 : 10;
        }
    });

    fs.writeFileSync(poolPath, JSON.stringify(pool, null, 2));
    console.log(`\x1b[32m[ROUTER] Marcha engatada: ${mode.toUpperCase()}\x1b[0m`);
} catch (e) {
    console.error('Erro ao trocar de marcha:', e.message);
}
