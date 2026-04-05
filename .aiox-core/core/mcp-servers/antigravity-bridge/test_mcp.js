const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const path = require("path");

async function runTest() {
  const serverPath = path.resolve(__dirname, "index.js");
  const transport = new StdioClientTransport({
    command: "node",
    args: [serverPath],
  });

  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  console.log("Connecting to MCP Server...");
  await client.connect(transport);
  console.log("Connected successfully!");

  console.log("\nFetching Available Tools...");
  const tools = await client.listTools();
  console.log("Tools available:", tools.tools.map(t => t.name));

  console.log("\nCalling get_antigravity_context...");
  try {
    const result = await client.callTool({
      name: "get_antigravity_context",
      arguments: { historical_depth: 1 }
    });
    console.log("--- RESULT ---");
    console.log(result.content[0].text);
    console.log("--------------");
  } catch(e) {
    console.error("Tool call failed:", e);
  }

  console.log("\nCalling send_handoff_to_antigravity...");
  try {
    const result2 = await client.callTool({
      name: "send_handoff_to_antigravity",
      arguments: { 
        message: "This is a test E2E handoff from the simulated client.",
        next_command: "*status"
      }
    });
    console.log("Result:", result2.content[0].text);
  } catch(e) {
    console.error("Handoff failed:", e);
  }

  console.log("\nTests finished.");
  process.exit(0);
}

runTest().catch(console.error);
