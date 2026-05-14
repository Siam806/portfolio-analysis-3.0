import type { AIProviderConfig, ChatMessage, PersonalityConfig } from "@/types/portfolio";
import { buildSystemPrompt } from "./prompts";
import { executeToolCall } from "./tool-registry";

interface AIResponse {
  content: string;
  toolCalls?: { name: string; params: Record<string, unknown>; result: unknown }[];
}

// Extract tool calls from response text
function extractToolCalls(
  text: string
): { name: string; params: Record<string, unknown> }[] {
  const pattern = /\[TOOL_CALL:\s*(\w+)\((\{[^}]*\})\)\]/g;
  const calls: { name: string; params: Record<string, unknown> }[] = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    try {
      const params = JSON.parse(match[2]);
      calls.push({ name: match[1], params });
    } catch {
      // Skip malformed tool calls
    }
  }
  return calls;
}

async function callGemini(
  config: AIProviderConfig,
  messages: { role: string; content: string }[]
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
}

async function callOpenAICompatible(
  config: AIProviderConfig,
  messages: { role: string; content: string }[]
): Promise<string> {
  const baseUrl = config.baseUrl || "https://api.openai.com/v1";
  const url = `${baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "I couldn't generate a response.";
}

async function callProvider(
  config: AIProviderConfig,
  messages: { role: string; content: string }[]
): Promise<string> {
  switch (config.provider) {
    case "gemini":
      return callGemini(config, messages);
    case "openai":
    case "anthropic":
    case "custom":
      return callOpenAICompatible(config, messages);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

export async function sendMessage(
  userMessage: string,
  chatHistory: ChatMessage[],
  aiConfig: AIProviderConfig,
  personalityConfig: PersonalityConfig
): Promise<AIResponse> {
  if (!aiConfig.enabled || !aiConfig.apiKey) {
    throw new Error("AI features are not enabled. Please configure an API key in Settings.");
  }

  const systemPrompt = buildSystemPrompt(personalityConfig);

  // Build message list
  const messages: { role: string; content: string }[] = [
    { role: "user", content: `[SYSTEM INSTRUCTIONS]\n${systemPrompt}` },
  ];

  // Add recent chat history (last 20 messages)
  const recentHistory = chatHistory.slice(-20);
  for (const msg of recentHistory) {
    if (msg.role === "user" || msg.role === "assistant") {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: "user", content: userMessage });

  // First pass: get initial response with potential tool calls
  let responseText = await callProvider(aiConfig, messages);
  const toolCallResults: { name: string; params: Record<string, unknown>; result: unknown }[] = [];

  // Process tool calls (up to 3 iterations)
  for (let i = 0; i < 3; i++) {
    const toolCalls = extractToolCalls(responseText);
    if (toolCalls.length === 0) break;

    // Execute all tool calls
    for (const call of toolCalls) {
      const result = executeToolCall(call.name, call.params);
      toolCallResults.push({ ...call, result });
    }

    // Build tool results message
    const toolResultsStr = toolCallResults
      .map((tc) => `[TOOL_RESULT: ${tc.name}]\n${JSON.stringify(tc.result, null, 2)}`)
      .join("\n\n");

    // Second pass: have LLM synthesize with tool results
    messages.push({ role: "assistant", content: responseText });
    messages.push({
      role: "user",
      content: `Here are the results from the tools you called:\n\n${toolResultsStr}\n\nNow synthesize these results into a natural, first-person response. Do NOT include any more TOOL_CALL tags.`,
    });

    responseText = await callProvider(aiConfig, messages);
  }

  // Clean any remaining tool call tags from the final response
  const cleanedContent = responseText
    .replace(/\[TOOL_CALL:[^\]]*\]/g, "")
    .replace(/\[TOOL_RESULT:[^\]]*\]/g, "")
    .trim();

  return {
    content: cleanedContent,
    toolCalls: toolCallResults.map((tc) => ({
      name: tc.name,
      params: tc.params,
      result: tc.result,
    })),
  };
}

export async function runWorkflow(
  workflowPrompt: string,
  aiConfig: AIProviderConfig,
  personalityConfig: PersonalityConfig
): Promise<AIResponse> {
  return sendMessage(workflowPrompt, [], aiConfig, personalityConfig);
}
