# Learning Resource MCP Server

A powerful MCP (Model Context Protocol) server that automatically searches for learning resources, generates personalized roadmaps, and organizes everything in Notion databases.

## Features

- Smart Resource Discovery: Uses Exa API to find tutorials, practice problems, and project ideas
- AI-Powered Roadmaps: Generates structured learning paths with OpenAI
- Notion Integration: Automatically creates organized database entries with beautiful formatting
- Batch Processing: Handles large content efficiently with proper batching
- Markdown Parsing: Converts markdown to properly formatted Notion blocks

## Tech Stack

- Next.js 15 - Framework
- TypeScript - Type safety
- Exa API - Web search for learning resources
- OpenAI API - Roadmap generation
- Notion API - Database storage
- Redis - Caching (via Vercel MCP Adapter)

## Prerequisites

### API Keys Required
1. Exa API Key - Get from exa.ai
2. OpenAI API Key - Get from platform.openai.com
3. Notion Integration Token - Create at developers.notion.com
4. Redis URL - Get from upstash.com or any Redis provider

### Notion Database Setup
Create a new Notion database with these exact property names:
- Topic (Title property)
- Date Created (Date property) 
- Status (Select property) with options: "Not started", "In progress", "Done"

## Installation

### Clone and Install
```bash
git clone <your-repo-url>
cd learning-resource-mcp-server
npm install
```

### Environment Setup
Create .env.local file in the root directory:
```env
EXA_API_KEY=your_exa_api_key_here
GPT_API_KEY=your_openai_api_key_here
NOTION_API_KEY=your_notion_integration_token_here
NOTION_DATABASE_ID=your_notion_database_id_here
NOTION_PAGE_ID=your_notion_page_id_here
REDIS_URL=your_redis_connection_string
```

### Start Development Server
```bash
npm run dev
```

Your MCP server will be available at: http://localhost:3000

## Usage

### Step 1: Search for Resources
```json
{
  "tool": "search_learning_resources",
  "parameters": {
    "topic": "Python"
  }
}
```
Result: Creates data/python-resources.json with tutorials, practice problems, and projects

### Step 2: Generate Learning Roadmap
```json
{
  "tool": "create_learning_roadmap",
  "parameters": {
    "topic": "Python"
  }
}
```
Result: Creates data/python-roadmap.txt with AI-generated learning path

### Step 3: List All Resources
```json
{
  "tool": "list_all_resources",
  "parameters": {
    "topic": "Python"
  }
}
```
Result: Creates data/python-resource-list.txt with formatted resource list

### Step 4: Upload to Notion
```json
{
  "tool": "upload_to_notion",
  "parameters": {
    "topic": "Python"
  }
}
```
Result: Creates beautiful database entry in Notion with roadmap + resources

## Project Structure

```
learning-resource-mcp-server/
├── app/
│   └── [transport]/
│       └── route.ts          # Main MCP server endpoints
├── config/
│   └── env.ts               # Environment variable validation
├── utils/
│   ├── exaClient.ts         # Exa search integration
│   ├── openai.ts            # AI roadmap generation
│   ├── notion.ts            # Notion database operations
│   └── logger.ts            # Logging system
├── data/                    # Generated files (auto-created)
├── .env.local              # Your API keys (create this)
├── package.json
└── README.md
```

## Complete Workflow Example

1. Search: search_learning_resources("React")
2. Roadmap: create_learning_roadmap("React")  
3. List: list_all_resources("React")
4. Upload: upload_to_notion("React")

Result: Organized Notion database entry with React learning roadmap and curated resources

## Notion Setup Guide

### Create Integration
1. Go to notion.so/my-integrations
2. Click "New integration"
3. Name it "Learning Resources"
4. Copy the Internal Integration Token (this is your NOTION_API_KEY)

### Create Database
1. Create a new Notion page
2. Add a database with these properties:
   - Topic (Title)
   - Date Created (Date)
   - Status (Select: "Not started", "In progress", "Done")
3. Share the page with your integration
4. Copy database ID from URL (this is your NOTION_DATABASE_ID)

### Get Database ID
From URL like: https://notion.so/workspace/abc123def456...
The database ID is: abc123def456

## Connecting to MCP Clients

### Add to Cursor

1. Open your Cursor settings
2. Find the mcp.json file (usually in ~/.cursor/)
3. Add your server configuration:

```json
{
  "mcpServers": {
    "learning-assistant": {
      "url": "http://localhost:3000/sse"
    }
  }
}
```

### Add to Claude Desktop

Add to your Claude Desktop MCP settings:
```json
{
  "mcpServers": {
    "learning-assistant": {
      "url": "http://localhost:3000/sse"
    }
  }
}
```

### Start Your Server

Make sure your server is running:
```bash
npm run dev
```

Available tools in Cursor/Claude:
- search_learning_resources
- create_learning_roadmap  
- list_all_resources
- upload_to_notion

## What You Get

Your Notion database will contain beautifully formatted entries with:
- Proper headings and subheadings
- Clickable links to all resources
- Numbered lists for roadmap steps
- Bold text for emphasis
- Organized sections for tutorials, practice, projects

## License

MIT License - see LICENSE file for details.
