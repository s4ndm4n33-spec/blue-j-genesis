import type { IncomingHttpHeaders } from "http";
import OpenAI from "openai";
import { openai as defaultOpenAI } from "@workspace/integrations-openai-ai-server";

export function getOpenAIClient(headers: IncomingHttpHeaders): OpenAI {
  const userKey = headers["x-openai-key"];
  if (typeof userKey === "string" && userKey.startsWith("sk-")) {
    return new OpenAI({
      apiKey: userKey,
      baseURL: "https://api.openai.com/v1",
    });
  }
  return defaultOpenAI;
}
