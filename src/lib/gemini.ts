/**
 * Server-side Google Gemini client wrapper.
 *
 * CRITICAL ARCHITECTURE RULE:
 * This module is imported ONLY in server route handlers (app/api/...).
 * The GEMINI_API_KEY environment variable is never exposed to the client.
 */

import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';

/**
 * Initializes and returns the GoogleGenerativeAI instance.
 * Throws an explicit error if GEMINI_API_KEY is missing.
 */
export function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add your Google Gemini API key to .env.local.'
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Calls Gemini with automatic JSON response parsing and 1 retry on invalid output.
 *
 * @param prompt - Formatted prompt string.
 * @param systemInstruction - Optional system persona instruction.
 * @param modelName - Gemini model to use (default: gemini-2.5-flash).
 * @returns Parsed JSON object from Gemini.
 */
export async function callGeminiJSON<T>(
  prompt: string,
  systemInstruction?: string,
  modelName: string = 'gemini-2.5-flash'
): Promise<T> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });

  const generationConfig: GenerationConfig = {
    responseMimeType: 'application/json',
    temperature: 0.2, // Low temperature for high adherence to JSON structure & math
  };

  let lastError: Error | null = null;

  // Try twice (1 initial + 1 retry on parse failure)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      const responseText = result.response.text();
      if (!responseText) {
        throw new Error('Empty response received from Gemini API');
      }

      const parsed = JSON.parse(responseText) as T;
      return parsed;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // If it's an API key error or quota error, do not retry
      if (
        lastError.message.includes('API_KEY_INVALID') ||
        lastError.message.includes('GEMINI_API_KEY is not configured')
      ) {
        throw lastError;
      }
    }
  }

  throw new Error(
    `Failed to get valid JSON from Gemini after 2 attempts: ${lastError?.message || 'Unknown error'}`
  );
}
