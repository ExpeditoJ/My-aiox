#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const server = new Server(
  {
    name: 'aiox-unified-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const poolPath = path.join(__dirname, '..', '.aiox-core', 'local', 'api-pool.json');

// Get pool logic
function getPool() {
  if (fs.existsSync(poolPath)) {
    return JSON.parse(fs.readFileSync(poolPath, 'utf8'));
  }
  return { providers: [] };
}

function savePool(pool) {
  fs.writeFileSync(poolPath, JSON.stringify(pool, null, 2));
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'aiox_get_pool_status',
        description: 'Returns the current API provider priority and hardware status of the AIOX engine.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'aiox_rotate_providers',
        description: 'Alters the priority of the LLM API providers in the AIOX cluster. Use this if you realize the local PC environment is struggling, to shift priority back to OpenRouter or Groq.',
        inputSchema: {
          type: 'object',
          properties: {
            highest_priority_id: {
              type: 'string',
              description: "The provider ID that should be priority 0. (e.g. 'openrouter-1', 'ollama-local', 'groq-1', 'gemini-1')",
            },
          },
          required: ['highest_priority_id'],
        },
      },
      {
        name: 'aiox_toggle_gaming_mode',
        description: 'Force-kills any background Ollama or local LLM engine processes to clear VRAM immediately.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'obsidian_neural_link',
        description: 'Interact with the local Obsidian Neural Database (Python-Rewrite Architecture), allowing the AI to scan and assemble any of the 100 Agents and 500 Skills currently synced.',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', description: "Action to perform: 'scan_network', 'fetch_skill', 'link_agent'" },
            target: { type: 'string', description: 'The ID or name of the Agent/Skill.' },
          },
          required: ['action', 'target'],
        },
      },
      {
        name: 'jarvis_system_monitor',
        description: 'Executes a system check to monitor RAM/CPU usage of specific apps (Discord, Brave) and checks system uptime. Useful for Jarvis to do PC analytics.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'aiox_get_pool_status') {
    const pool = getPool();
    return {
      content: [
        {
          type: 'text',
          text: `AIOX Proxy Engine is routing based on these priorities (lowest number is used first):\n${JSON.stringify(pool.providers.map(p => ({id: p.id, priority: p.priority, model: p.model})), null, 2)}`,
        },
      ],
    };
  }

  if (request.params.name === 'aiox_rotate_providers') {
    const targetId = request.params.arguments.highest_priority_id;
    const pool = getPool();
    const target = pool.providers.find(p => p.id === targetId);
    if (!target) {
      return { content: [{ type: 'text', text: `Error: Provider ID '${targetId}' not found in pool.`}], isError: true };
    }
    
    // Shift others down, set target to 0
    pool.providers.forEach(p => p.priority++);
    target.priority = 0;
    pool.providers.sort((a,b) => a.priority - b.priority); // Normalize sorting
    
    // Ensure priority numbers are strictly normalized (0, 1, 2...)
    pool.providers.forEach((p, idx) => p.priority = idx);
    savePool(pool);

    return { content: [{ type: 'text', text: `Successfully rotated AIOX API pool. The infrastructure is now prioritizing '${targetId}' (${target.model}).`}] };
  }

  if (request.params.name === 'aiox_toggle_gaming_mode') {
    try {
      if (process.platform === 'win32') {
        execSync('taskkill /f /im ollama* /t', { stdio: 'ignore' });
      } else {
        execSync('pkill -f ollama', { stdio: 'ignore' });
      }
      return { content: [{ type: 'text', text: 'Gaming Mode activated. VRAM cleared successfully. All hardware components are released.'}] };
    } catch(e) {
      // Typically taskkill exits with non-zero if no process found
      return { content: [{ type: 'text', text: 'No background LLM local engine process was found running.'}] };
    }
  }

  if (request.params.name === 'obsidian_neural_link') {
    const action = request.params.arguments.action;
    const target = request.params.arguments.target;
    const obsPath = 'C:\\Users\\expea\\OneDrive\\Documentos\\DIto\\AIOX-Neural-Node';
    
    if (action === 'scan_network') {
      const skills = fs.readdirSync(path.join(obsPath, 'Skills')).length;
      const agents = fs.readdirSync(path.join(obsPath, 'Agents')).length;
      return { content: [{ type: 'text', text: `[Python Engine Bridge] Neural Database Synchronized.\nActive Nodes: ${agents} Agents, ${skills} Skills stored locally.`}] };
    }
    if (action === 'fetch_skill' || action === 'link_agent') {
      const folder = action === 'fetch_skill' ? 'Skills' : 'Agents';
      const file = target.endsWith('.md') ? target : `${target}.md`;
      const fullPath = path.join(obsPath, folder, file);
      if (fs.existsSync(fullPath)) {
        return { content: [{ type: 'text', text: fs.readFileSync(fullPath, 'utf8') }] };
      }
      return { content: [{ type: 'text', text: `Node ${target} not found in the Neural Graph.`}], isError: true };
    }
  }

  if (request.params.name === 'jarvis_system_monitor') {
    try {
      if (process.platform === 'win32') {
        const script = `
          $brave = Get-Process brave -ErrorAction SilentlyContinue | Measure-Object WorkingSet -Sum | Select-Object -ExpandProperty Sum
          $discord = Get-Process Discord -ErrorAction SilentlyContinue | Measure-Object WorkingSet -Sum | Select-Object -ExpandProperty Sum
          $uptime = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
          $now = Get-Date
          $upStr = ($now - $uptime).ToString("d' days 'h' hours 'm' minutes'")
          @{
            BraveBrowserMB = [math]::Round($brave / 1MB, 2)
            DiscordMB = [math]::Round($discord / 1MB, 2)
            SystemUptime = $upStr
            RequiresUpdate = ($now - $uptime).TotalDays -gt 30
          } | ConvertTo-Json
        `;
        const result = execSync(`powershell -Command "${script}"`).toString();
        return { content: [{ type: 'text', text: result }] };
      }
      return { content: [{ type: 'text', text: 'Currently only supported on Windows.'}] };
    } catch(e) {
      return { content: [{ type: 'text', text: 'Failed to gather System Metrics: ' + e.message }] };
    }
  }

  throw new Error('Tool not found');
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AIOX Unified MCP Server running on stdio');
}

main().catch(console.error);
