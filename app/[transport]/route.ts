import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import { env } from "../../config/env";
import { find_resources } from "../../utils/exaClient";

const handler = createMcpHandler(
  async (server) => {
    // Echo tool
    server.tool(
      "echo",
      "Echo a message",
      {
        message: z.string(),
      },
      async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }],
      })
    );

    // Exa tool
    server.tool(
      "find_resources",
      "Search Exa for learning resources based on a user query.",
      {
        query: z.string(),
      },
      async ({ query }) => {
        const result = await find_resources(query);
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) }
          ]
        };
      }
    );
  },
  {
    capabilities: {
      tools: {
        echo: {
          description: "Echo a message",
        },
        find_resources: {
          description: "Search Exa for learning resources based on a user query.",
        }
      },
    },
  },
  { 
    redisUrl: env.REDIS_URL,
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
