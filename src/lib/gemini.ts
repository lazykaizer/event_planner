/**
 * Server-side AI client wrapper supporting Google Gemini and Groq ultra-fast inference.
 *
 * CRITICAL ARCHITECTURE RULE:
 * This module is imported ONLY in server route handlers (app/api/...).
 * The API keys are never exposed to the client.
 */

import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI, type GenerationConfig } from '@google/generative-ai';

function loadEnvLocalIfNeeded(): void {
  if (process.env.GROQ_API_KEY && process.env.GEMINI_API_KEY) return;
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [k, ...v] = trimmed.split('=');
        if (k && v.length && !process.env[k]) {
          process.env[k] = v.join('=').trim();
        }
      }
    }
  } catch {
    // Ignore in read-only environments
  }
}

/**
 * Initializes and returns the GoogleGenerativeAI instance.
 * Throws an explicit error if GEMINI_API_KEY is missing.
 */
export function getGeminiClient(): GoogleGenerativeAI {
  loadEnvLocalIfNeeded();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'AI service is not configured. Please check server environment settings.'
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Calls Groq chat completions with native JSON mode.
 */
async function callGroqJSON<T>(
  apiKey: string,
  prompt: string,
  systemInstruction?: string,
  modelName: string = 'openai/gpt-oss-120b'
): Promise<T> {
  const messages: { role: 'system' | 'user'; content: string }[] = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Groq API error HTTP ${res.status}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response received from Groq API');
  }

  return JSON.parse(content) as T;
}

/**
 * Calls AI with automatic JSON response parsing and 1 retry on invalid output.
 * Prefers Groq if GROQ_API_KEY is configured (or if GEMINI_API_KEY starts with gsk_),
 * otherwise uses Google Gemini 2.5 Flash.
 *
 * @param prompt - Formatted prompt string.
 * @param systemInstruction - Optional system persona instruction.
 * @param modelName - Model to use (default: gemini-2.5-flash).
 * @returns Parsed JSON object from AI.
 */
export async function callGeminiJSON<T>(
  prompt: string,
  systemInstruction?: string,
  modelName: string = 'gemini-2.5-flash'
): Promise<T> {
  loadEnvLocalIfNeeded();
  const groqKey =
    process.env.GROQ_API_KEY ||
    (process.env.GEMINI_API_KEY?.startsWith('gsk_') ? process.env.GEMINI_API_KEY : undefined);
  const geminiKey =
    process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('gsk_')
      ? process.env.GEMINI_API_KEY
      : undefined;

  // 1. If Groq Key is available, use Groq ultra-fast inference
  if (groqKey) {
    try {
      return await callGroqJSON<T>(groqKey, prompt, systemInstruction);
    } catch (err: unknown) {
      if (!geminiKey) {
        throw err instanceof Error ? err : new Error(String(err));
      }
      // If Gemini is also configured, fall through to try Gemini
    }
  }

  // 2. Use Google Gemini
  if (!geminiKey || geminiKey.trim() === '' || geminiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'AI service is not configured. Please set GEMINI_API_KEY or GROQ_API_KEY.'
    );
  }

  const client = new GoogleGenerativeAI(geminiKey);
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });

  const generationConfig: GenerationConfig = {
    responseMimeType: 'application/json',
    temperature: 0.2,
  };

  let lastError: Error | null = null;

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
      if (
        lastError.message.includes('API_KEY_INVALID') ||
        lastError.message.includes('API_KEY_SERVICE_BLOCKED') ||
        lastError.message.includes('AI service is not configured')
      ) {
        throw lastError;
      }
    }
  }

  throw new Error(
    `Failed to get valid JSON from AI after 2 attempts: ${lastError?.message || 'Unknown error'}`
  );
}
