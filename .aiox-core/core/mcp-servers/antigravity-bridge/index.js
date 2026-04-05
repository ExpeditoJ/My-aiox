#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');

// Caminho absoluto para o cérebro local do Antigravity
const ANTIGRAVITY_BRAIN_PATH = 'C:\\Users\\expea\\.gemini\\antigravity\\brain';
const HANDOFFS_DIR = path.resolve(process.cwd(), '../../../..', '.aiox', 'handoffs');

const server = new Server(
  {
    name: 'aiox-antigravity-bridge',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define as ferramentas exponíveis
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_antigravity_context',
        description: 'Lê o contexto dinâmico do agente Antigravity buscando a última conversa, planos arquiteturais e status de execução da master branch atual. Útil para entender o que o Antigravity IDE Agent acabou de codificar, planejar ou investigar no projeto.',
        inputSchema: {
          type: 'object',
          properties: {
             historical_depth: {
               type: 'number',
               description: 'Número de conversas passadas para buscar (default: 1, max: 3)'
             }
          },
        },
      },
      {
        name: 'send_handoff_to_antigravity',
        description: 'Registra um estado formal na pasta de transferência (.aiox/handoffs/) para que o agente da IDE (Antigravity) assuma a partir do seu último ponto. Permite comunicação cooperativa assíncrona entre o CLI e a IDE.',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'O que o Antigravity precisa saber?' },
            next_command: { type: 'string', description: 'Próxima ação/comando recomendado para ele (Ex: *task compile, *validate)' }
          },
          required: ['message'],
        },
      }
    ],
  };
});

// Executa as ferramentas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'get_antigravity_context') {
    try {
      if (!fs.existsSync(ANTIGRAVITY_BRAIN_PATH)) {
        return {
          content: [{ type: 'text', text: 'Antigravity Brain directory not currently accessible.' }],
          isError: true,
        };
      }

      // Procura a última conversa
      const items = fs.readdirSync(ANTIGRAVITY_BRAIN_PATH, { withFileTypes: true });
      const dirs = items.filter(item => item.isDirectory())
                        .map(item => ({
                           name: item.name,
                           time: fs.statSync(path.join(ANTIGRAVITY_BRAIN_PATH, item.name)).mtime.getTime()
                        }))
                        .sort((a, b) => b.time - a.time);

      if (dirs.length === 0) {
        return { content: [{ type: 'text', text: 'No Antigravity conversations found.' }] };
      }

      let depth = args?.historical_depth || 1;
      depth = Math.min(Math.max(depth, 1), 3);
      
      let report = `## ANTIGRAVITY BRAIN CONTEXT (Last ${depth} Conversations)\n\n`;

      for (let i = 0; i < depth && i < dirs.length; i++) {
        const convDir = path.join(ANTIGRAVITY_BRAIN_PATH, dirs[i].name);
        report += `### CONVERSATION ID: ${dirs[i].name}\n`;
        
        // Extrai artefatos críticos (sempre lendo o arquivo principal "resolved")
        const tryReadFile = (fileName) => {
          const filePath = path.join(convDir, fileName);
          return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
        };

        const plan = tryReadFile('implementation_plan.md');
        const task = tryReadFile('task.md');
        const wt = tryReadFile('walkthrough.md');

        if (plan) report += `\n[IMPLEMENTATION PLAN]\n${plan}\n`;
        if (task) report += `\n[TASK TRACKER]\n${task}\n`;
        if (wt) report += `\n[WALKTHROUGH/CONCLUSION]\n${wt}\n`;
        
        if (!plan && !task && !wt) {
           report += `[No structural artifacts found in this session]\n`;
        }
        report += `\n---\n`;
      }

      return {
        content: [{ type: 'text', text: report }],
      };

    } catch (error) {
      return {
        content: [{ type: 'text', text: `Failed reading brain: ${error.message}` }],
        isError: true,
      };
    }
  }

  if (name === 'send_handoff_to_antigravity') {
     try {
        if (!fs.existsSync(HANDOFFS_DIR)) {
           fs.mkdirSync(HANDOFFS_DIR, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const msg = args.message || 'No message';
        const cmd = args.next_command || 'status';
        
        const yamlData = `from_agent: openclaude
last_command: auto-handoff
consumed: false
timestamp: ${timestamp}
message: |
  ${msg.split('\\n').join('\\n  ')}
next_command: "${cmd}"
`;
        
        const filePath = path.join(HANDOFFS_DIR, `handoff-${timestamp}.yaml`);
        fs.writeFileSync(filePath, yamlData, 'utf8');

        return { content: [{ type: 'text', text: `Handoff successfully registered at ${filePath}` }] };
     } catch (e) {
        return {
           content: [{ type: 'text', text: `Failed to save handoff: ${e.message}` }],
           isError: true
        };
     }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Boot the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('🚀 Antigravity Bridge MCP Server started on stdio\n');
}

main().catch((error) => {
  process.stderr.write(`Fatal Error: ${error}\\n`);
  process.exit(1);
});
