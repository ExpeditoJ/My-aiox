const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configurações e caminhos
const args = process.argv.slice(2);
const modpackPath = args[0] || process.env.MODPACK_PATH;
const obsidianPath = args[1] || process.env.OBSIDIAN_PATH;

if (!modpackPath || !obsidianPath) {
    console.error("❌ ERRO: Necessário informar o caminho dos Mods e do Obsidian.");
    console.log("Uso: node analyze-mods-descarga.js <MODPACK_PATH> <OBSIDIAN_PATH>");
    process.exit(1);
}

// Caminho da Memória do AIOX (MCP Hub)
const MEMORY_FILE = path.join(process.cwd(), '.aiox-core', 'local', 'global-memory.json');

// Chaves de API
const groqApiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

// Limpar e padronizar nomes de mods
function extractModName(filename) {
    let name = filename.replace(/\.jar$/i, '');
    name = name.replace(/-?\d+\.\d+(\.\d+)*(-[a-zA-Z0-9.\-]+)?/g, ''); 
    return name.replace(/[-_]$/, '').trim();
}

async function storeInAioxMemory(title, content, tags = []) {
    try {
        if (!fs.existsSync(MEMORY_FILE)) return;
        const db = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
        const entry = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toISOString(),
            title: `[MOD-AUDIT] ${title}`,
            content,
            tags: [...tags, 'mod-audit', 'minecraft-1.20.1']
        };
        db.entries.push(entry);
        fs.writeFileSync(MEMORY_FILE, JSON.stringify(db, null, 2), 'utf8');
    } catch (e) {
        console.error("⚠️ Falha ao salvar na memória MCP:", e.message);
    }
}

async function analyzeWithOllama(modListText) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: "gemma3:4b", // Atualizado para o modelo otimizado para GTX 1650
            prompt: `Como um Engenheiro de Modpacks especialista em Minecraft 1.20.1 Forge, analise este lote de mods e liste conflitos conhecidos, dependências ausentes e recomendações de performance para hardware limitado (GTX 1650). 
            
            Lista de Mods: ${modListText}
            
            Responda de forma concisa e técnica.`,
            stream: false
        });

        const req = http.request('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data).response); }
                catch (e) { resolve("Sem resposta estruturada do Ollama local."); }
            });
        });

        req.on('error', (e) => resolve("Ollama Offline ou não acessível na porta 11434."));
        req.write(body);
        req.end();
    });
}

async function analyzeWithGroq(modListText) {
    if (!groqApiKey) return "⚠️ Chave do Groq/OpenClaude não configurada na variável de ambiente OPENAI_API_KEY. Ignorando análise profunda.";
    
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{
                role: "system",
                content: "Você é um AI Assistente de Otimização (AIOX Master). Analise a configuração de hardware (VRAM Mínima, GTX 1650) e crie um relatório avançado focado na estabilidade de performance da Forge 1.20.1 para estes mods. Destaque mods que drenam memória indiscriminadamente."
            }, {
                role: "user",
                content: `Gere uma auditoria estruturada em Markdown dos seguintes mods:\n${modListText}`
            }]
        });

        const req = https.request('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqApiKey}`
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data).choices[0].message.content); }
                catch (e) { resolve("Falha ao analisar resposta do Groq."); }
            });
        });

        req.on('error', (e) => resolve("Erro de conexão com o remetente Groq."));
        req.write(body);
        req.end();
    });
}

function dumpToObsidian(chunkIndex, mods, ollamaRes, groqRes) {
    const dataAtual = new Date().toISOString().split('T')[0];
    const timestamp = new Date().getTime();
    
    const markdownContent = `---
title: Relatório de Triagem - Chunk ${chunkIndex}
date: ${dataAtual}
tags: [aiox, automação, mods, forge-1.20.1, relatorio]
---

# 🛡️ Auditoria AIOX - Lote ${chunkIndex}
_Auditado por Gemma 3 (4B) Local via OpenClaw Gateway._

## 📦 Lista de Mods Analisados:
${mods.map(m => `- [[${m}]]`).join('\n')}

---

## ⚡ Diagnóstico Rápido (Gemma 3 Local)
${ollamaRes}

---

## 🧠 Auditoria Profunda (AIOX Cloud-Bridge)
${groqRes}
`;

    const targetDir = path.join(obsidianPath, "AIOX-Analises", "Mods");
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const filePath = path.join(targetDir, `Relatorio-Audit-${timestamp}-Chunk${chunkIndex}.md`);
    fs.writeFileSync(filePath, markdownContent, 'utf-8');
    
    // Salvar na memória MCP para persistência de longo prazo
    storeInAioxMemory(`Análise Lote ${chunkIndex}`, ollamaRes, mods);
    
    console.log(`✅ Relatório salvo no Obsidian: ${filePath}`);
}

async function startBatchProcess() {
    console.log(`\n🚀 Iniciando DESCARGA (Lote): Mapeamento de Modpack para Obsidian`);
    console.log(`-> Modpack: ${modpackPath}`);
    console.log(`-> Obsidian: ${obsidianPath}`);
    
    if (!fs.existsSync(modpackPath)) return console.error("❌ O diretório dos mods não foi localizado.");
    
    const allFiles = fs.readdirSync(modpackPath);
    const modFiles = allFiles.filter(f => f.endsWith('.jar'));
    
    console.log(`📦 O script identificou ${modFiles.length} arquivos .jar para análise.\n`);

    // Chunk size: 12 mods para maior precisão do Gemma 3 (4B)
    const CHUNK_SIZE = 12;
    let chunks = [];
    
    for (let i = 0; i < modFiles.length; i += CHUNK_SIZE) {
        chunks.push(modFiles.slice(i, i + CHUNK_SIZE).map(extractModName));
    }

    console.log(`🔥 Separado em ${chunks.length} lotes para auditoria paralela`);
    
    for (let i = 0; i < chunks.length; i++) {
        console.log(`\n⏳ Processando Lote ${i + 1}/${chunks.length} (${chunks[i].length} mods)...`);
        const modSummary = chunks[i].join(', ');
        
        // Chamadas paralelas para reduzir tempo
        const [ollamaReport, groqReport] = await Promise.all([
            analyzeWithOllama(modSummary),
            analyzeWithGroq(modSummary)
        ]);

        dumpToObsidian(i + 1, chunks[i], ollamaReport, groqReport);
        console.log(`✔️ Lote ${i + 1} finalizado e descarregado.`);
    }

    console.log("\n🎉 Descarga Finalizada! Confira os novos arquivos MD em seu Obsidian.");
}

startBatchProcess().catch(err => {
    console.error("❌ Ocorreu um erro no pipeline de análise:", err);
});
