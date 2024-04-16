import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY!,
});

const cleanCode = (code: string) => {
  if (code.startsWith("```")) {
    // remove first and last line
    code = code.split("\n").slice(1, -1).join("\n");
  }

  code = code.trim();
  if (code[0] === '"') {
    code = code.slice(1, -1);
  }

  return code;
};

const CONCEPT_GENIE_PROMPT = fs.readFileSync("prompts/concept_genie.txt", "utf-8");
const CONCEPT_SPECTOR_PROMPT = fs.readFileSync("prompts/concept_spector.txt", "utf-8");
const APP_DEFINER_PROMPT = fs.readFileSync("prompts/app_definer.txt", "utf-8");
const ROUTE_GENIE_PROMPT = fs.readFileSync("prompts/route_genie.txt", "utf-8");

type Assistant = "concept_genie" | "concept_spector" | "app_definer" | "route_genie";

const assistants: Record<Assistant, string> = {
  concept_genie: CONCEPT_GENIE_PROMPT,
  concept_spector: CONCEPT_SPECTOR_PROMPT,
  app_definer: APP_DEFINER_PROMPT,
  route_genie: ROUTE_GENIE_PROMPT,
}

const getResponse = async (assistant: Assistant, prompt: string) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: assistants[assistant] },
      { role: "user", content: prompt },
    ],
  });

  return completion.choices[0].message.content!;
}

export const generateConcept = async (concept: string, prompt: string) => {
  prompt += `\nThe name of the concept is: ${concept}.`;
  let code = await getResponse("concept_genie", prompt);
  return cleanCode(code);
};

export const generateUpdatedConcept = async (concept: string, conceptSrc: string, prompt: string) => {
  prompt += `\nThe name of the concept is: ${concept}. The current concept code is: \n ${conceptSrc} \n`;
  let code = await getResponse("concept_genie", prompt);
  return cleanCode(code);
}

export const generateConceptSpec = async (conceptSrc: string) => {
  const code = await getResponse("concept_spector", conceptSrc);
  return cleanCode(code);
}

export const generateAppDefinition = async (spec: string, currentApp: string, prompt: string) => {
  prompt = `The spec for the app is:\n${spec}\nCurrent app definition:\n${currentApp}\nPrompt: ${prompt}`;
  let code = await getResponse("app_definer", prompt);
  return cleanCode(code);
}

export const generateRoute = async (spec: string, appDefinition: string, prompt: string) => {
  prompt = `The spec for the app is: \n ${spec} \nHere is the app definition: ${appDefinition}\nPrompt: ` + prompt;
  let code = await getResponse("route_genie", prompt);
  return cleanCode(code);
}

export const generateUpdatedRoute = async (spec: string, appDefinition: string, routeSrc: string, prompt: string) => {
  prompt = `The spec for the app is:\n${spec} \nHere is the app definition: ${appDefinition}\nThe source code for the current route:\n${routeSrc}\nPrompt: ` + prompt;
  let code = await getResponse("route_genie", prompt);
  return cleanCode(code);
}