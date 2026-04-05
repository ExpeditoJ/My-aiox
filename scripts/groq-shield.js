const http = require('http');
const https = require('https');

// Limite rigoroso pra domar "Request Too Large" em janelas de 8K tokens
const MAX_STRING_LENGTH = 10000; 
const GROQ_API = "https://api.groq.com/openai/v1"; 
const GROQ_HOST = "api.groq.com";

const boldCyan = (str) => `\x1b[1;36m${str}\x1b[0m`;
const red = (str) => `\x1b[31m${str}\x1b[0m`;
const yellow = (str) => `\x1b[33m${str}\x1b[0m`;

const server = http.createServer((req, res) => {
    if (req.url === '/v1/models') {
        const headers = { ...req.headers, host: GROQ_HOST };
        const groqReq = https.request(`https://${GROQ_HOST}${req.url}`, { method: req.method, headers: headers }, groqRes => {
            res.writeHead(groqRes.statusCode, groqRes.headers);
            groqRes.pipe(res);
        });
        groqReq.on('error', () => { res.statusCode = 500; res.end(); });
        groqReq.end();
        return;
    }

    if (req.method === 'POST') {
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', () => {
            try {
                const rawBuffer = Buffer.concat(body).toString();
                const data = JSON.parse(rawBuffer);
                
                let originalSize = rawBuffer.length;
                let chopped = false;

                // SHIELD: Slice gigantescas arranjos pra salvar sua LPU
                if (data.messages && Array.isArray(data.messages)) {
                    data.messages = data.messages.map(msg => {
                        // Corte implacável no System Prompt das cli (onde fica o grosso inútil)
                        if (msg.role === 'system' && msg.content && msg.content.length > MAX_STRING_LENGTH) {
                            console.log(`[SHIELD] 🛡️  ${yellow("Esmagando System Prompt Inimigo:")} De ${msg.content.length} bytes -> ${MAX_STRING_LENGTH} bytes`);
                            msg.content = msg.content.substring(0, MAX_STRING_LENGTH) + "\n...[TRUNCATED BY ORION SHIELD]...";
                            chopped = true;
                        }
                        // Limite em envios massivos do user (files arrays)
                        if (msg.role === 'user' && typeof msg.content === 'string' && msg.content.length > MAX_STRING_LENGTH) {
                            console.log(`[SHIELD] 🛡️  ${yellow("Atenuando Documento de Usuário:")} De ${msg.content.length} bytes -> ${MAX_STRING_LENGTH} bytes`);
                            msg.content = msg.content.substring(0, MAX_STRING_LENGTH) + "\n...[TRUNCATED BY ORION SHIELD]...";
                            chopped = true;
                        }
                        if (msg.role === 'user' && Array.isArray(msg.content)) {
                            msg.content.forEach(c => {
                                if (c.type === 'text' && c.text && c.text.length > MAX_STRING_LENGTH) {
                                     console.log(`[SHIELD] 🛡️  ${yellow("Encolhendo Multi-Text Chunk:")} De ${c.text.length} bytes -> ${MAX_STRING_LENGTH} bytes`);
                                     c.text = c.text.substring(0, MAX_STRING_LENGTH) + "\n...[TRUNCATED BY ORION SHIELD]...";
                                     chopped = true;
                                }
                            });
                        }
                        return msg;
                    });
                }
                
                const payload = JSON.stringify(data);
                if (chopped) {
                    console.log(`[SHIELD LOG] Payload massivo reduzido com sucesso! (${originalSize} -> ${payload.length} bytes). Submetendo...`);
                }

                const options = {
                    hostname: GROQ_HOST,
                    path: `/openai${req.url}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': req.headers['authorization'],
                        'Content-Length': Buffer.byteLength(payload)
                    }
                };

                const groqReq = https.request(options, groqRes => {
                    res.writeHead(groqRes.statusCode, groqRes.headers);
                    groqRes.pipe(res);
                });
                
                groqReq.on('error', e => {
                    console.error(red("[SHIELD ERRO NO REPASSE API]"), e);
                    res.statusCode = 500; res.end();
                });
                
                groqReq.write(payload);
                groqReq.end();
            } catch(e) {
                console.error(red("[SHIELD] Falha parse do emissor OpenClaude:"), e);
                res.statusCode = 400; res.end();
            }
        });
    } else {
        res.statusCode = 404; res.end();
    }
});

server.listen(3000, () => {
    console.log(boldCyan("\n=============================================="));
    console.log(boldCyan(" 🛡️  AIOX GROQ-SHIELD ATIVO - LPU BYPASS ENGINE "));
    console.log(boldCyan("=============================================="));
    console.log(yellow("Interceptando porta 3000... Aguardando lixo da CLI!"));
});
