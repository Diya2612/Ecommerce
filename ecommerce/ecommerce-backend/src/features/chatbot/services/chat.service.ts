/**
 * Chat Service
 * Handles AI interactions and response generation using the Groq LLM.
 */

import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { logger } from '../../../utils';
import { HttpException } from '../../../utils';
import { config } from '../../../utils/config/validate-env';
import { chatbotConfig } from '../config/chatbot.config';
import {
  searchDocuments,
  buildContextFromResults,
  extractSourceReferences,
  hasDocuments,
} from './search.service';
import { MessageSource } from '../shared/interface';

const { llm: llmConfig, chat: chatConfig } = chatbotConfig;

const groq = createGroq({
  apiKey: config.GROQ_API_KEY,
});

/** Generate an AI response based on a user message and conversation history. */
export async function generateChatResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
): Promise<{ message: string; sources: MessageSource[] }> {
  try {
    logger.info(`💬 Processing chat message: "${userMessage.substring(0, 50)}..."`);

    const documentsExist = await hasDocuments();
    if (!documentsExist) {
      return {
        message:
          "I don't have any documents to reference yet. Please ask an administrator to upload some documents first.",
        sources: [],
      };
    }

    const searchResults = await searchDocuments(userMessage, chatConfig.maxContextMessages);
    const context = buildContextFromResults(searchResults);
    const sources = extractSourceReferences(searchResults);
    const systemPrompt = buildSystemPrompt(context);
    const messages = buildMessagesArray(systemPrompt, conversationHistory, userMessage);

    const response = await generateText({
      model: groq(llmConfig.defaultModel),
      messages,
      maxTokens: llmConfig.maxTokens,
      temperature: llmConfig.temperature,
    } as Parameters<typeof generateText>[0]);

    const assistantMessage = response.text;
    logger.info(`✅ Generated response (${assistantMessage.length} chars)`);

    return {
      message: assistantMessage,
      sources,
    };
  } catch (error) {
    logger.error('❌ Chat response generation failed:', error);
    if (error instanceof HttpException) throw error;

    throw new HttpException(
      500,
      `Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/** Prepares the system instructions including provided document context. */
function buildSystemPrompt(context: string): string {
  if (!context || context.trim().length === 0) {
    return `You are a helpful AI assistant for the Anant Enterprises platform. 
I couldn't find any relevant information in the uploaded documents. 
Let the user know that their question may not be covered or they can try rephrasing.`;
  }

  return chatbotConfig.systemPrompt.replace('{context}', context);
}

/** Constructs the full message thread for the LLM request. */
function buildMessagesArray(
  systemPrompt: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string,
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  const recentHistory = conversationHistory.slice(-chatConfig.maxContextMessages * 2);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  messages.push({
    role: 'user',
    content: userMessage,
  });

  return messages;
}

/** Generates a brief summary title for a chat session. */
export async function generateSessionTitle(firstMessage: string): Promise<string> {
  try {
    const words = firstMessage.split(/\s+/).slice(0, 6);
    let title = words.join(' ');

    if (title.length > chatConfig.sessionTitleMaxLength) {
      title = title.substring(0, chatConfig.sessionTitleMaxLength - 3) + '...';
    }

    return title || 'New Chat';
  } catch (error) {
    logger.error('Error generating session title:', error);
    return 'New Chat';
  }
}

/** Lists supported AI model identifiers. */
export function getAvailableModels(): string[] {
  return llmConfig.availableModels;
}
