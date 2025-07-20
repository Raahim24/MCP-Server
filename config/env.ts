// config/env.ts
import dotenv from 'dotenv';
import { Logger } from "../utils/logger";

const logger = new Logger("EnvConfig");
dotenv.config();

function requireEnv(variable: string | undefined, name: string): string {
  if (!variable) {
    logger.error(`Missing environment variable: ${name}`);
    throw new Error(`Missing environment variable: ${name}`);
  }
  return variable;
}

logger.info("Loading environment variables...");

export const env = {
  EXA_API_KEY: requireEnv(process.env.EXA_API_KEY, "EXA_API_KEY"),
  GPT_API_KEY: requireEnv(process.env.GPT_API_KEY, "GPT_API_KEY"),
  NOTION_API_KEY: requireEnv(process.env.NOTION_API_KEY, "NOTION_API_KEY"),
  NOTION_PAGE_ID: requireEnv(process.env.NOTION_PAGE_ID, "NOTION_PAGE_ID"),
  NOTION_DATABASE_ID: requireEnv(process.env.NOTION_DATABASE_ID,"NOTION_DATABASE_ID"),
  GMAIL_SENDER_EMAIL: requireEnv(process.env.GMAIL_SENDER_EMAIL, "GMAIL_SENDER_EMAIL"),
  REDIS_URL: requireEnv(process.env.REDIS_URL, "REDIS_URL")
  /*
  KV_REST_API_URL: requireEnv(process.env.KV_REST_API_URL, "KV_REST_API_URL"),
  KV_REST_API_TOKEN: requireEnv(process.env.KV_REST_API_TOKEN, "KV_REST_API_TOKEN"),
  KV_REST_API_READ_ONLY_TOKEN: requireEnv(process.env.KV_REST_API_READ_ONLY_TOKEN, "KV_REST_API_READ_ONLY_TOKEN"),
  KV_URL: requireEnv(process.env.KV_URL, "KV_URL"),
  */
};

logger.action("All environment variables loaded successfully");