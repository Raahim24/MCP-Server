# MCP-Server: Your AI-Powered Coding Assistant

**A robust Next.js application leveraging the Model Context Protocol (MCP) to provide an intelligent, context-aware AI coding assistant. Designed to streamline development workflows and empower engineers with cutting-edge AI capabilities.**

This project integrates a powerful AI assistant into a Next.js environment, enabling dynamic interaction with your codebase, comprehensive learning resource management, and automated development tasks. It is finely tuned to offer expert guidance and automate processes across critical domains such as **IceMaskNet, Mask R-CNN, PyTorch, TensorFlow, NumPy, OpenCV, dataset labeling, and auto-labeling pipelines.**

## Key Features

Our AI Coding Assistant is equipped with a suite of tools to supercharge your productivity:

*   **Intelligent Codebase Navigation:** Perform semantic searches, read files, list directory contents, and execute terminal commands directly within your project context.
*   **Automated Code Modification:** Generate, edit, and create files with intelligent code suggestions and refactoring capabilities, adhering to best practices.
*   **Real-time Information Retrieval:** Conduct web searches for up-to-date information and leverage an internal knowledge base to answer complex queries.
*   **Personalized Learning Assistant:**
    *   **Resource Discovery:** Search for and identify relevant learning resources on any technical topic.
    *   **Curated Resource Lists:** Display and save comprehensive lists of educational materials.
    *   **Dynamic Learning Roadmaps:** Generate structured, focused learning paths tailored to specific subjects.
    *   **Notion Integration:** Seamlessly upload generated roadmaps and resource lists to your Notion database for organized knowledge management and easy access.
*   **Structured Task Management:** Utilize a built-in TODO list to effectively track progress, organize multi-step tasks, and ensure systematic project completion.

## Getting Started

Follow these steps to set up and run the MCP-Server on your local machine.

### Prerequisites

*   Node.js (LTS version recommended)
*   pnpm (or npm/yarn)
*   A Notion Integration Token and Database ID for full functionality (see Environment Variables).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [repository_url]
    cd MCP-Server
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory of your project (or copy `.env.local.example`) and populate it with your API keys and configuration details. Essential variables include:
    ```
    NOTION_API_KEY=your_notion_integration_token
    NOTION_DATABASE_ID=your_notion_database_id
    # Add other API keys (e.g., for Google Generative AI, OpenAI, Exa) as needed
    ```
    *Ensure your Notion Integration has access to the specified database.*

### Running the Application

*   **Development Server:**
    ```bash
    pnpm dev
    ```
    This will start the Next.js development server, typically on `http://localhost:3000`.

*   **Build for Production:**
    ```bash
    pnpm build
    ```

*   **Start Production Server:**
    ```bash
    pnpm start
    ```

## Project Structure

Understanding the project's layout is key to navigating and extending its capabilities. Here's an overview of the main directories and files:

```
MCP-Server/
├── app/
│   └── [transport]/
│       └── route.ts             # Primary API route for the MCP server. This file orchestrates how the AI assistant's tools respond to requests, acting as the central hub for AI functionality.
├── config/
│   └── env.ts                   # Manages all environment variables, ensuring secure configuration of API keys and external service integrations.
├── data/
│   ├── prompt-engineering-resource-list.txt # Generated list of learning resources for Prompt Engineering.
│   ├── prompt-engineering-resources.json    # Structured JSON data pertaining to Prompt Engineering resources.
│   ├── prompt-engineering-roadmap.txt       # Comprehensive learning roadmap for Prompt Engineering.
│   ├── python-resource-list.txt             # Generated list of learning resources for Python programming.
│   ├── python-resources.json                # Structured JSON data pertaining to Python resources.
│   └── python-roadmap-minimal.txt           # A concise learning roadmap specifically for Python.
├── public/
│   └── index.html               # Static assets and the main entry HTML file for the web interface.
├── scripts/
│   ├── test-client.mjs          # A utility script to test the MCP server's API endpoints and tool invocations.
│   └── test-streamable-http-client.mjs # A client script specifically for testing streamable HTTP responses from the server.
├── utils/
│   ├── exaClient.ts             # Handles API interactions with Exa, enabling web search capabilities for the AI assistant.
│   ├── logger.ts                # A centralized logging utility for recording application events, errors, and debugging information.
│   ├── notion.ts                # Provides an interface for interacting with the Notion API, used for uploading and managing learning content.
│   └── openai.ts                # Manages communication with the OpenAI API, facilitating the use of advanced language models.
├── .env.local.example           # An example file for local environment variables, detailing required configurations.
├── next.config.ts               # The main configuration file for Next.js, defining build settings, routes, and server behavior.
├── package.json                 # Defines project metadata, scripts for development tasks, and lists all project dependencies.
├── pnpm-lock.yaml               # Ensures consistent dependency installations across environments by locking exact package versions.
├── README.md                    # This document, providing a comprehensive guide to the project.
└── tsconfig.json                # TypeScript configuration file, specifying compiler options and project settings.
```

## Core Principles & Development Guidelines

This project adheres to a set of guiding principles to ensure the development of high-quality, maintainable, and efficient code. These guidelines are crucial for contributors and for understanding the underlying design philosophy:

*   **Simplicity & Readability:** Code is designed to be clear, concise, and easy to understand, utilizing early returns and a modular design approach.
*   **Maintainability & Testability:** Emphasis is placed on comprehensive type hinting, detailed docstrings, and a structure that facilitates easy testing and future modifications.
*   **Reusability:** Functions and components are designed with reusability in mind, minimizing redundancy.
*   **Cross-Platform Compatibility:** `pathlib` is preferred for file handling to ensure consistent behavior across different operating systems.
*   **Robustness:** Hardcoded values are avoided in favor of configuration constants, and robust error handling with proper logging is implemented.
*   **Descriptive Naming:** Clear and descriptive names are used for variables, functions, and constants to enhance code comprehension.
*   **Production Readiness:** All implemented functionalities are complete and production-ready, without placeholders or partial code.
*   **Flexible Outputs:** Where applicable (e.g., mask saving), outputs are designed to be flexible, supporting various formats and optional visualization.

## Technologies Used

*   **Framework:** Next.js
*   **AI & Model Context Protocol:**
    *   `@google/generative-ai`: Integration with Google's Generative AI models.
    *   `@modelcontextprotocol/sdk`: Core SDK for interacting with the Model Context Protocol.
    *   `@vercel/mcp-adapter`: Adapter for deploying MCP servers on Vercel with Next.js.
    *   `openai`: Integration with OpenAI's API for advanced language models.
*   **Notion API:** `@notionhq/client`: For seamless integration with Notion databases.
*   **Search & Data:**
    *   `exa-js`: Utilized for advanced web search capabilities.
    *   `redis`: For caching and real-time data handling (especially for SSE transport).
*   **Utilities:** `dotenv`, `node-fetch`, `zod`.
*   **Development:** `typescript`, `react`, `react-dom`.

## Notes for Running on Vercel

*   **Redis Requirement:** To enable the SSE (Server-Sent Events) transport, a Redis instance must be attached to the project, accessible via `process.env.REDIS_URL`.
*   **Fluid Compute:** Ensure [Fluid compute](https://vercel.com/docs/functions/fluid-compute) is enabled for efficient function execution.
*   **Max Duration:** For Vercel Pro or Enterprise accounts, consider adjusting `maxDuration` to `800` in `app/route.ts` for longer-running operations.
*   **Vercel Template:** You can also [deploy the Next.js MCP template directly on Vercel](https://vercel.com/templates/next.js/model-context-protocol-mcp-with-next-js).

## Sample Client

A basic client is provided to help you test the MCP server's invocations:

```bash
node scripts/test-client.mjs https://mcp-for-next-js.vercel.app
```
