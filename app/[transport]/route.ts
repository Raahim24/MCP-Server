import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import { env } from "../../config/env";
import { exaSearch } from "../../utils/exaClient";
import { createLearningRoadmap, listAllResources } from "../../utils/openai";
import { uploadToNotion } from "../../utils/notion";
import fs from 'fs';
import path from 'path';

const handler = createMcpHandler(
  async (server) => {
    // Tool 1: Search for Learning Resources (Saves to data folder)
    server.tool(
      "search_learning_resources",
      "Search for learning resources and save results to data folder",
      {
        topic: z.string(),
      },
      async ({ topic }) => {
        try {
          // Run 3 specialized searches in parallel
          const [tutorials, practice, projects] = await Promise.all([
            exaSearch(`${topic} tutorial course video youtube`),
            exaSearch(`${topic} practice problems challenges exercises`),
            exaSearch(`${topic} project ideas build hands-on`)
          ]);

          const results = {
            tutorials,
            practice,
            projects
          };

          // Save to data folder
          const fileName = `${topic.toLowerCase().replace(/\s+/g, '-')}-resources.json`;
          const filePath = path.join(process.cwd(), 'data', fileName);
          
          // Ensure data directory exists
          const dataDir = path.join(process.cwd(), 'data');
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
          }

          // Save JSON file
          fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

          return {
            content: [
              { type: "text", text: `Resources saved to ${fileName}. Use 'list_all_resources' or 'create_learning_roadmap' next.` }
            ]
          };
        } catch (error) {
          return {
            content: [
              { type: "text", text: "Search Error: " + String(error) }
            ]
          };
        }
      }
    );

    // Tool 2: List All Resources (Saves the formatted list)
    server.tool(
      "list_all_resources",
      "Display complete list of all found resources and save formatted list",
      {
        topic: z.string(),
      },
      async ({ topic }) => {
        try {
          // Read saved JSON file
          const fileName = `${topic.toLowerCase().replace(/\s+/g, '-')}-resources.json`;
          const filePath = path.join(process.cwd(), 'data', fileName);

          if (!fs.existsSync(filePath)) {
            return {
              content: [
                { type: "text", text: `No saved resources found for ${topic}. Run search_learning_resources first.` }
              ]
            };
          }

          // Read the file
          const savedData = fs.readFileSync(filePath, 'utf8');
          
          // List all resources
          const resourceList = await listAllResources(topic, savedData);

          // Save the formatted resource list to a separate file
          const listFileName = `${topic.toLowerCase().replace(/\s+/g, '-')}-resource-list.txt`;
          const listFilePath = path.join(process.cwd(), 'data', listFileName);
          
          if (resourceList) {
            fs.writeFileSync(listFilePath, resourceList);
          }

          return {
            content: [
              { type: "text", text: `${resourceList || 'Failed to list resources'}\n\n📁 Formatted list saved to: ${listFileName}` }
            ]
          };
        } catch (error) {
          return {
            content: [
              { type: "text", text: "Resource List Error: " + String(error) }
            ]
          };
        }
      }
    );

    // Tool 3: Create Learning Roadmap (Saves the roadmap)
    server.tool(
      "create_learning_roadmap",
      "Create focused learning roadmap using saved resource data and save roadmap",
      {
        topic: z.string(),
      },
      async ({ topic }) => {
        try {
          // Read saved JSON file
          const fileName = `${topic.toLowerCase().replace(/\s+/g, '-')}-resources.json`;
          const filePath = path.join(process.cwd(), 'data', fileName);

          if (!fs.existsSync(filePath)) {
            return {
              content: [
                { type: "text", text: `No saved resources found for ${topic}. Run search_learning_resources first.` }
              ]
            };
          }

          // Read the file
          const savedData = fs.readFileSync(filePath, 'utf8');
          
          // Create roadmap
          const roadmap = await createLearningRoadmap(topic, savedData);

          // Save the roadmap to a separate file
          const roadmapFileName = `${topic.toLowerCase().replace(/\s+/g, '-')}-roadmap.txt`;
          const roadmapFilePath = path.join(process.cwd(), 'data', roadmapFileName);
          
          if (roadmap) {
            fs.writeFileSync(roadmapFilePath, roadmap);
          }

          return {
            content: [
              { type: "text", text: `${roadmap || 'Failed to create roadmap'}\n\n📁 Roadmap saved to: ${roadmapFileName}` }
            ]
          };
        } catch (error) {
          return {
            content: [
              { type: "text", text: "Roadmap Error: " + String(error) }
            ]
          };
        }
      }
    );

    // Tool 4: Upload to Notion
    server.tool(
      "upload_to_notion",
      "Upload saved roadmap and resources to Notion page",
      {
        topic: z.string(),
      },
      async ({ topic }) => {
        try {
          const result = await uploadToNotion(topic);
          
          return {
            content: [
              { type: "text", text: result }
            ]
          };
        } catch (error) {
          return {
            content: [
              { type: "text", text: "Notion Upload Error: " + String(error) }
            ]
          };
        }
      }
    );
  },
  {
    capabilities: {
      tools: {
        search_learning_resources: {
          description: "Search for learning resources and save results to data folder",
        },
        list_all_resources: {
          description: "Display complete list of all found resources and save formatted list",
        },
        create_learning_roadmap: {
          description: "Create focused learning roadmap using saved resource data and save roadmap",
        },
        upload_to_notion: {
          description: "Upload saved roadmap and resources to Notion page",
        },
      },
    },
  },
  {
    redisUrl: env.REDIS_URL,
    basePath: "",
    verboseLogs: true,
    maxDuration: 90,
  }
);

export { handler as GET, handler as POST, handler as DELETE };