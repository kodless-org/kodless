import OpenAI from "openai";

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

const getResponse = async (assistantId: string, prompt: string) => {
  const thread = await openai.beta.threads.create();
  await openai.beta.threads.messages.create(thread.id, {
    content: prompt,
    role: "user",
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
  });

  let check = await openai.beta.threads.runs.retrieve(
    thread.id,
    run.id
  );
  while (check.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    check = await openai.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );
  }

  const messages = await openai.beta.threads.messages.list(thread.id);
  const thing = messages.data.map((message) => message.content) as any[];
  return thing[0][0].text.value as string;
}

const CONCEPT_GENIE = process.env.CONCEPT_GENIE!;
const CONCEPT_SPECTOR = process.env.CONCEPT_SPECTOR!;
const ROUTE_GENIE = process.env.ROUTE_GENIE!;
const APP_DEFINER = process.env.APP_DEFINER!;

export const generateConcept = async (concept: string, prompt: string) => {
  prompt += `\nThe name of the concept is: ${concept}.`;
  let code = await getResponse(CONCEPT_GENIE, prompt);
  return cleanCode(code);
};

export const generateUpdatedConcept = async (concept: string, conceptSrc: string, prompt: string) => {
  prompt += `\nThe name of the concept is: ${concept}. The current concept code is: \n ${conceptSrc} \n`;
  let code = await getResponse(CONCEPT_GENIE, prompt);
  return cleanCode(code);
}

export const generateConceptSpec = async (conceptSrc: string) => {
  const code = await getResponse(CONCEPT_SPECTOR, conceptSrc);
  return cleanCode(code);
}

export const generateAppDefinition = async (spec: string, currentApp: string, prompt: string) => {
  prompt = `The spec for the app is:\n${spec}\nCurrent app definition:\n${currentApp}\nPrompt: ${prompt}`;
  let code = await getResponse(APP_DEFINER, prompt);
  return cleanCode(code);
}

export const generateRoute = async (spec: string, appDefinition: string, prompt: string) => {
  prompt = `The spec for the app is: \n ${spec} \nHere is the app definition: ${appDefinition}\nPrompt: ` + prompt;
  let code = await getResponse(ROUTE_GENIE, prompt);
  return cleanCode(code);
}

export const generateUpdatedRoute = async (spec: string, appDefinition: string, routeSrc: string, prompt: string) => {
  prompt = `The spec for the app is:\n${spec} \nHere is the app definition: ${appDefinition}\nThe source code for the current route:\n${routeSrc}\nPrompt: ` + prompt;
  let code = await getResponse(ROUTE_GENIE, prompt);
  return cleanCode(code);
}