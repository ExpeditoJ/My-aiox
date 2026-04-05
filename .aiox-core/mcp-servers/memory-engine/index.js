#!/usr/bin/env node

/**
 * AIOX Memory MCP Server
 * Native context persistence for OpenClaude IDE and tools.
 * Exposes methods to store, read, and search long-term memory across sessions.
 */

const fs = require('fs');
const path = require('path');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} = require('@modelcontextprotocol/sdk/types.js');

// Database structure
const MEMORY_FILE = path.join(process.cwd(), '.aiox-core', 'local', 'global-memory.json');

// Ensure DB directory and file exist
if (!fs.existsSync(path.dirname(MEMORY_FILE))) {
  fs.mkdirSync(path.dirname(MEMORY_FILE), { recursive: true });
}
if (!fs.existsSync(MEMORY_FILE)) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify({ entries: [] }, null, 2), 'utf8');
}

const server = new Server(
  {
    name: 'aiox-memory-engine',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// DB Handlers
function loadMemory() {
  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
  } catch (e) {
    return { entries: [] };
  }
}

function saveMemory(data) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Setup Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'store_memory',
        description: 'Records a new memory/context for future sessions. Use it to journal your progress, save notes, state, or decisions.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Short description of the memory' },
            content: { type: 'string', description: 'Detailed context, code, or progress' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags to easily search this context later' }
          },
          required: ['title', 'content'],
        },
      },
      {
        name: 'read_memory',
        description: 'Retrieves the most recent memories recorded (limits to last 10 entries). Always call this at the start of a session if you feel out of context.',
        inputSchema: {
          type: 'object',
          properties: {
             limit: { type: 'number', description: 'Number of recent entries to fetch (max 20)' }
          }
        },
      },
      {
        name: 'search_memory',
        description: 'Searches all historical memory entries using a keyword or tag.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Keyword or tag to search for' }
          },
          required: ['query'],
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const db = loadMemory();

  if (request.params.name === 'store_memory') {
    const { title, content, tags = [] } = request.params.arguments;
    
    const entry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      title,
      content,
      tags
    };
    
    db.entries.push(entry);
    saveMemory(db);
    
    return {
      content: [{ type: 'text', text: `Memory stored successfully with ID: ${entry.id}` }],
    };
  }

  if (request.params.name === 'read_memory') {
    const limit = request.params.arguments?.limit || 10;
    const sorted = db.entries.sort((a, b) => b.id - a.id);
    const recent = sorted.slice(0, Math.min(limit, 20));
    
    return {
      content: [{ type: 'text', text: JSON.stringify({ total: db.entries.length, data: recent }, null, 2) }],
    };
  }

  if (request.params.name === 'search_memory') {
    const { query } = request.params.arguments;
    const q = query.toLowerCase();
    
    const results = db.entries.filter(e => 
      e.title.toLowerCase().includes(q) || 
      e.content.toLowerCase().includes(q) || 
      (e.tags && e.tags.some(t => t.toLowerCase().includes(q)))
    );
    
    const sorted = results.sort((a, b) => b.id - a.id);
    
    return {
      content: [{ type: 'text', text: JSON.stringify({ matches: sorted.length, data: sorted }, null, 2) }],
    };
  }

  throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${request.params.name}`);
});

// Boot Stdio Transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('🧠 AIOX Memory MCP Engine running on stdio\n');
}

main().catch((error) => {
  process.stderr.write(`Fatal error: ${error}\n`);
  process.exit(1);
});
