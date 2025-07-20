import OpenAI from 'openai';
import { env } from '../config/env';

const openai = new OpenAI({
  apiKey: env.GPT_API_KEY,
});

const defaultConfig = {
  model: 'gpt-3.5-turbo',
  temperature: 0.7
};

// Simplified and faster roadmap creation
export const createLearningRoadmap = async (topic: string, allResources: any) => {
  const resourcesString = typeof allResources === 'string'
    ? allResources
    : JSON.stringify(allResources, null, 2);

  const prompt = `You are an expert in ${topic}. Your task is to create the best roadmap for the learner using the JSON file search results. Use only that and nothing else and include links.Try to use most of the resoruces and Always be smart!

Resources: ${resourcesString}`;

  const response = await openai.chat.completions.create({
    ...defaultConfig,
    messages: [
      {
        role: 'system',
        content: `You are an expert learning roadmap creator. Create comprehensive yet concise roadmaps using only the provided resources. Always include URLs and organize by difficulty/progression.`
      },
      { role: 'user', content: prompt }
    ]
  });

  return response.choices[0].message.content;
};

// Simplified resource listing
export const listAllResources = async (topic: string, allResources: any) => {
  const resourcesString = typeof allResources === 'string'
    ? allResources
    : JSON.stringify(allResources, null, 2);

  const prompt = `List ALL ${topic} resources from the data in this format:

# ${topic} Resources

## Tutorials Section:
1. **[Title]** - [Author]
   - URL: [URL]
   - Summary: [Brief summary]

2. **[Title]** - [Author]
   - URL: [URL]
   - Summary: [Brief summary]

## Practice Section:
1. **[Title]**
   - URL: [URL]
   - Summary: [Brief summary]

## Projects Section:
1. **[Title]**
   - URL: [URL]
   - Summary: [Brief summary]

Include ALL resources from tutorials.results, practice.results, and projects.results.

Resources: ${resourcesString}`;

  const response = await openai.chat.completions.create({
    ...defaultConfig,
    messages: [
      {
        role: 'system',
        content: 'List ALL resources from the data. Be organized and complete. Include every resource.'
      },
      { role: 'user', content: prompt }
    ]
  });

  return response.choices[0].message.content;
};