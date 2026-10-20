/**
 * Chatbot Configuration
 * Centralized settings for vector search, LLM, and document processing.
 */

export const chatbotConfig = {
  /** Document storage and type settings. */
  general: {
    namespace: 'nira-global',
    maxFileSize: 20 * 1024 * 1024, // 20MB
    allowedMimeTypes: [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    allowedExtensions: ['.pdf', '.txt', '.md', '.docx'],
  },

  /** Logic for splitting documents into searchable segments. */
  chunking: {
    minChunkSize: 400,
    maxChunkSize: 1200,
    targetChunkSize: 800,
    overlapPercentage: 25,
    sentenceEndMarkers: ['.', '!', '?', '\n\n'],
  },

  /** HuggingFace BGE-M3 model parameters. */
  embedding: {
    modelName: 'BAAI/bge-m3',
    dimensions: 1024,
    maxBatchSize: 15,
    maxTextLength: 8192,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  /** Pinecone vector search thresholds. */
  search: {
    defaultTopK: 5,
    maxTopK: 20,
    minSimilarityThreshold: 0.3,
    denseWeight: 0.7,
    sparseWeight: 0.3,
  },

  /** Groq LLM model and generation settings. */
  llm: {
    provider: 'groq',
    defaultModel: 'llama-3.3-70b-versatile',
    availableModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    maxTokens: 2048,
    temperature: 0.7,
  },

  /** AI context and session title limits. */
  chat: {
    maxContextMessages: 5,
    maxContextChars: 4000,
    sessionTitleMaxLength: 100,
  },

  /** Standard multi-window rate limits. */
  rateLimit: {
    chat: { windowMs: 60 * 1000, max: 30 },
    upload: { windowMs: 60 * 60 * 1000, max: 10 },
    general: { windowMs: 60 * 1000, max: 60 },
  },

  /** Base instructions for the AI behavior. */
  systemPrompt: `You are a helpful AI assistant for the Anant Enterprises platform. Your purpose is to answer questions based on the provided context from uploaded documents.

Guidelines:
1. Only answer questions based on the provided context
2. If the context doesn't contain relevant information, politely say so
3. Be concise but thorough in your responses
4. Cite which document(s) your answer is based on when possible
5. If asked about topics outside the documents, explain that you can only answer questions about the uploaded content
6. Be professional and helpful

Context from documents:
{context}

Remember: Only use information from the provided context above.`,
};

export const { general, chunking, embedding, search, llm, chat, rateLimit, systemPrompt } =
  chatbotConfig;

export default chatbotConfig;
