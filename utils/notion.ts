import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function uploadToNotion(topic: string) {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      return "Error: NOTION_DATABASE_ID not found in environment variables";
    }
    
    // Find the files we created
    const roadmapFile = path.join(process.cwd(), 'data', `${topic.toLowerCase().replace(/\s+/g, '-')}-roadmap.txt`);
    const resourceFile = path.join(process.cwd(), 'data', `${topic.toLowerCase().replace(/\s+/g, '-')}-resource-list.txt`);
    
    // Check if files exist
    const roadmapExists = fs.existsSync(roadmapFile);
    const resourceExists = fs.existsSync(resourceFile);
    
    if (!roadmapExists && !resourceExists) {
      return "No files found. Please run the search and generate tools first.";
    }
    
    // Read and combine content
    let combinedContent = '';
    
    if (roadmapExists) {
      const roadmapContent = fs.readFileSync(roadmapFile, 'utf8');
      // Remove any existing roadmap headers from the content
      const cleanedRoadmapContent = roadmapContent.replace(/^# .+ Learning Roadmap\s*\n/gm, '');
      combinedContent += `# ${topic.charAt(0).toUpperCase() + topic.slice(1)} Learning Roadmap\n\n${cleanedRoadmapContent}\n\n---\n\n`;
    }
    
    if (resourceExists) {
      const resourceContent = fs.readFileSync(resourceFile, 'utf8');
      // Remove duplicate headers from resource content
      const cleanedResourceContent = resourceContent.replace(/^# .+ Resources\s*\n/gm, '');
      combinedContent += `# ${topic.charAt(0).toUpperCase() + topic.slice(1)} Resources\n\n${cleanedResourceContent}`;
    }
    
    // Parse markdown to Notion blocks instead of raw text
    const blocks = parseMarkdownToNotionBlocks(combinedContent);
    
    // Break into batches (Notion limits batches to 100 blocks)
    const batchSize = 100;

    // Create database entry (without children first)
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId
      },
      properties: {
        // Topic (Title property)
        Topic: {
          title: [
            {
              text: {
                content: topic
              }
            }
          ]
        },
        // Date Created (Date property)
        "Date Created": {
          date: {
            start: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
          }
        }
        // Temporarily removing Status to test
      }
    });

    // Now add all content blocks in batches
    for (let i = 0; i < blocks.length; i += batchSize) {
      const batch = blocks.slice(i, i + batchSize);
      await notion.blocks.children.append({
        block_id: response.id,
        children: batch as any
      });
    }
    
    return `✅ Successfully created database entry for "${topic}"!\n📊 Database ID: ${response.id}`;
    
  } catch (error) {
    return `❌ Error creating database entry: ${error}`;
  }
}

// Main parsing function
function parseMarkdownToNotionBlocks(content: string) {
  const blocks = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stripped = line.trim();
    
    // Skip empty lines
    if (!stripped) {
      continue;
    }
    
    // Headings
    if (stripped.startsWith('# ')) {
      blocks.push(makeHeading(stripped.slice(2), 1));
    } else if (stripped.startsWith('## ')) {
      blocks.push(makeHeading(stripped.slice(3), 2));
    } else if (stripped.startsWith('### ')) {
      blocks.push(makeHeading(stripped.slice(4), 3));
    }
    // Numbered list (1. 2. 3.)
    else if (stripped.match(/^\d+\.\s/)) {
      const leadingSpaces = line.length - line.trimStart().length;
      
      if (leadingSpaces > 0) {
        // Skip sub-items for now, they'll be handled by the main item
        continue;
      } else {
        // Main numbered item - collect its children
        const mainItem = makeNumberedItem(stripped);
        const children = [];
        
        // Look for sub-items (both numbered and bulleted)
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j];
          const nextStripped = nextLine.trim();
          const nextSpaces = nextLine.length - nextLine.trimStart().length;
          
          if (((nextStripped.startsWith('- ') || nextStripped.startsWith('* ')) || nextStripped.match(/^\d+\.\s/)) && nextSpaces > 0) {
            children.push({
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: {
                rich_text: parseText(nextStripped.replace(/^(\d+\.\s|-\s|\*\s)/, ''))
              }
            });
            j++;
          } else {
            break;
          }
        }
        
        // Add children if any
        if (children.length > 0) {
          (mainItem.numbered_list_item as any).children = children;
        }
        
        blocks.push(mainItem);
        i = j - 1; // Skip processed lines
      }
    }
    // Bullet list
    else if (stripped.startsWith('- ') || stripped.startsWith('* ')) {
      const leadingSpaces = line.length - line.trimStart().length;
      
      if (leadingSpaces > 0) {
        // Skip sub-bullets for now, they'll be handled by the main bullet
        continue;
      } else {
        // Main bullet - collect its children
        const mainBullet = makeBullet(stripped.slice(2));
        const children = [];
        
        // Look for sub-bullets
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j];
          const nextStripped = nextLine.trim();
          const nextSpaces = nextLine.length - nextLine.trimStart().length;
          
          if ((nextStripped.startsWith('- ') || nextStripped.startsWith('* ')) && nextSpaces > 0) {
            children.push({
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: {
                rich_text: parseText(nextStripped.slice(2))
              }
            });
            j++;
          } else {
            break;
          }
        }
        
        // Add children if any
        if (children.length > 0) {
          (mainBullet.bulleted_list_item as any).children = children;
        }
        
        blocks.push(mainBullet);
        i = j - 1; // Skip processed lines
      }
    }
    // Divider
    else if (stripped.startsWith('---')) {
      blocks.push(makeDivider());
    }
    // Code block fences (skip)
    else if (stripped.startsWith('```')) {
      continue;
    }
    // Paragraph fallback
    else {
      blocks.push(makeParagraph(stripped));
    }
  }
  
  return blocks;
}

// Simple helper functions
function makeHeading(text: string, level: number) {
  let type: string;
  
  if (level === 1) {
    type = 'heading_1';
  } else if (level === 2) {
    type = 'heading_2';
  } else {
    type = 'heading_3';
  }
  
  return {
    object: 'block',
    type: type as any,
    [type]: {
      rich_text: [{
        type: 'text',
        text: { content: text }
      }]
    }
  };
}

function makeBullet(text: string) {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: parseText(text)
    }
  };
}

function makeNumberedItem(text: string) {
  // Remove the number prefix (1. 2. etc.)
  const cleanText = text.replace(/^\d+\.\s/, '');
  return {
    object: 'block',
    type: 'numbered_list_item',
    numbered_list_item: {
      rich_text: parseText(cleanText)
    }
  };
}

function makeParagraph(text: string) {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: parseText(text)
    }
  };
}

function makeDivider() {
  return {
    object: 'block',
    type: 'divider',
    divider: {}
  };
}

// Parse text for markdown links [text](url) and formatting
function parseText(text: string) {
  const result = [];
  
  // Handle markdown links [text](url) first
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;
  
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      result.push(...parseFormatting(before));
    }
    
    // Add the markdown link
    result.push({
      type: 'text',
      text: {
        content: match[1], // The text part
        link: { url: match[2] } // The URL part
      }
    });
    
    lastIndex = markdownLinkRegex.lastIndex;
  }
  
  // Handle remaining text after last link
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    
    // Handle plain URLs in remaining text
    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    const parts = remaining.split(urlRegex);
    
    for (const part of parts) {
      if (part.match(urlRegex)) {
        // Plain URL
        result.push({
          type: 'text',
          text: { content: part, link: { url: part } }
        });
      } else if (part.trim()) {
        // Regular text with bold/italic
        result.push(...parseFormatting(part));
      }
    }
  }
  
  // If no links found, just handle the whole text
  if (result.length === 0) {
    result.push(...parseFormatting(text));
  }
  
  return result;
}

// Handle **bold** and *italic*
function parseFormatting(text: string) {
  if (!text || !text.trim()) {
    return [];
  }
  
  const result = [];
  
  // Handle **bold** first
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Text before bold
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      result.push(...parseItalic(before));
    }
    
    // Bold text
    result.push({
      type: 'text',
      text: { content: match[1] },
      annotations: { bold: true }
    });
    
    lastIndex = boldRegex.lastIndex;
  }
  
  // Remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    result.push(...parseItalic(remaining));
  }
  
  // If no bold found, just parse italic
  if (result.length === 0) {
    result.push(...parseItalic(text));
  }
  
  return result;
}

// Handle *italic*
function parseItalic(text: string) {
  if (!text || !text.trim()) {
    return [];
  }
  
  const result = [];
  const italicRegex = /\*([^*]+)\*/g;
  let lastIndex = 0;
  let match;
  
  while ((match = italicRegex.exec(text)) !== null) {
    // Text before italic
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      if (before) {
        result.push({
          type: 'text',
          text: { content: before }
        });
      }
    }
    
    // Italic text
    result.push({
      type: 'text',
      text: { content: match[1] },
      annotations: { italic: true }
    });
    
    lastIndex = italicRegex.lastIndex;
  }
  
  // Remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining) {
      result.push({
        type: 'text',
        text: { content: remaining }
      });
    }
  }
  
  // If no italic found, return plain text
  if (result.length === 0 && text.trim()) {
    result.push({
      type: 'text',
      text: { content: text }
    });
  }
  
  return result;
}