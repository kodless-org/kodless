import fs from "fs";
import path from "path";
import { execSync, spawn, ChildProcess } from "child_process";
import { readdir } from "~/server/fsutil";
import { fileURLToPath } from "url";
import AsyncLock from "async-lock";

import {
  generateAppDefinition,
  generateConcept,
  generateConceptSpec,
  generateRoute,
  generateUpdatedConcept,
} from "~/server/project/ai";

import { WebSocketServer, WebSocket } from "ws";
import { parseRouterFunctions } from "./parse";

const wss = new WebSocketServer({ port: 8080 });

let sockets: WebSocket[] = [];
wss.on("connection", (ws) => {
  sockets.push(ws);
});

export const lock = new AsyncLock();

export const projectsDir = process.env.PROJECTS_DIRECTORY as string;

const PROJECT_RUNNERS: Record<string, ChildProcess> = {};

export const getProjects = async () => {
  const projects = await fs.promises.readdir(projectsDir);
  if (projects.includes(".git")) {
    projects.splice(projects.indexOf(".git"), 1);
  }
  return projects;
};

export const validateProjectName = async (project: string) => {
  if (!project) {
    throw createError({
      status: 400,
      message: "Project name is required",
    });
  }

  if (project === "template") {
    throw createError({
      status: 401,
      message: "Project name cannot be template",
    });
  }

  const projects = await getProjects();
  if (!projects.includes(project)) {
    throw createError({
      status: 404,
      message: `Project ${project} not found`,
    });
  }
};

export const createProject = async (project: string) => {
  const projects = await getProjects();
  if (projects.includes(project)) {
    throw createError({
      status: 400,
      message: `Project ${project} already exists`,
    });
  }

  // Create the project directory
  await fs.promises.mkdir(`${projectsDir}/${project}`);

  // Copy the template files to the new project
  // The template directory is under ./server/project/template
  const templateDir = path.join(
    fileURLToPath(import.meta.url),
    "../../../template"
  );

  await fs.promises.cp(templateDir, `${projectsDir}/${project}`, {
    recursive: true,
  });

  const env = await getProjectEnvironment(project);
  env["DB_NAME"] = project;
  await updateProjectEnvironment(project, env);

  return { message: `Project ${project} created` };
};

export const deleteProject = async (project: string) => {
  await validateProjectName(project);

  // Delete the project directory
  await fs.promises.rm(`${projectsDir}/${project}`, {
    recursive: true,
  });

  return { message: `Project ${project} deleted` };
};

type Config = {
  concepts: {
    [concept: string]: {
      prompt: string;
      spec: string;
    };
  };
};

export const getProjectConfig = async (project: string): Promise<Config> => {
  await validateProjectName(project);

  const configFile = `${projectsDir}/${project}/kodless.json`;
  let config;

  if (!fs.existsSync(configFile)) {
    config = { concepts: {} };
  } else {
    config = JSON.parse(await fs.promises.readFile(configFile, "utf8"));
  }

  return config;
};

export const updateProjectConfig = async (project: string, config: Config) => {
  await validateProjectName(project);

  const configFile = `${projectsDir}/${project}/kodless.json`;
  const content = JSON.stringify(config, null, 2);

  await fs.promises.writeFile(configFile, content);

  return { message: `Config updated for project ${project}` };
};

export const getProjectFiles = async (project: string) => {
  await validateProjectName(project);

  // Get all the files in the project directory, recursively
  const { files, excluded } = await readdir(`${projectsDir}/${project}`, {
    recursive: true,
    exclude: ["node_modules", "dist"],
  });

  // Push excluded files to the end of the list
  files.push(...excluded);

  return files;
};

export const getProjectStatus = async (
  project: string
): Promise<{ status: "running" | "stopped" }> => {
  await validateProjectName(project);
  return { status: PROJECT_RUNNERS[project] ? "running" : "stopped" };
};

export const installDependencies = async (project: string) => {
  await validateProjectName(project);

  // Run npm install in the project directory
  const output = execSync("npm i", {
    cwd: `${projectsDir}/${project}`,
  });

  return { output, message: `Dependencies installed for project ${project}` };
};

export const uninstallDependencies = async (project: string) => {
  await validateProjectName(project);

  // Remove node_modules and package-lock.json from the project directory
  await fs.promises.rm(`${projectsDir}/${project}/node_modules`, {
    recursive: true,
  });
  await fs.promises.rm(`${projectsDir}/${project}/package-lock.json`);

  return { message: `Dependencies uninstalled for project ${project}` };
};

export const getConcept = async (project: string, concept: string) => {
  await validateProjectName(project);

  if (!concept.endsWith(".ts")) {
    concept += ".ts";
  }

  // make sure the concept file exists
  const conceptFile = `${projectsDir}/${project}/server/concepts/${concept.toLowerCase()}`;
  if (!fs.existsSync(conceptFile)) {
    throw createError({
      status: 404,
      message: `Concept ${concept} not found for project ${project}`,
    });
  }

  const code = await fs.promises.readFile(conceptFile, "utf8");

  const config = await getProjectConfig(project);
  const conceptConfig = config.concepts[concept] || { prompt: "", spec: "" };

  return {
    code,
    prompt: conceptConfig.prompt,
    spec: conceptConfig.spec,
  };
};

const convertToFileName = (concept: string) => {
  if (!concept.endsWith(".ts")) {
    concept += ".ts";
  }
  return concept.toLowerCase().replace(/\s/g, "");
};

const conceptTitleCase = (concept: string) => {
  return concept
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .replace(/\s/g, "");
};

export const createConcept = async (
  project: string,
  concept: string,
  prompt: string,
  noOverride: boolean = false
) => {
  await validateProjectName(project);

  const conceptFileName = convertToFileName(concept);
  const conceptName = conceptTitleCase(concept);

  // make sure the concept file does not exist
  const conceptFile = `${projectsDir}/${project}/server/concepts/${conceptFileName}`;
  if (noOverride && fs.existsSync(conceptFile)) {
    throw createError({
      status: 400,
      message: `Concept ${conceptFileName} already exists for project ${project}`,
    });
  }

  const response = await generateConcept(conceptFileName, prompt);

  // Create the concept file
  await fs.promises.writeFile(conceptFile, response);

  await lock.acquire(project, async (): Promise<void> => {
    const config = await getProjectConfig(project);
    config.concepts[conceptFileName] = { prompt, spec: "" };
    await updateProjectConfig(project, config);
  });

  // Update the concept spec, happens in the "background"
  await updateConceptSpec(project, conceptFileName);

  //await instantiateConcept(project, conceptName);

  //await importInstantiatedConcept(project, conceptFileName, conceptName);

  return { message: `Concept ${concept} created for project ${project}` };
};

export const updateConcept = async (
  project: string,
  concept: string,
  prompt: string
) => {
  await validateProjectName(project);

  if (!concept.endsWith(".ts")) {
    concept += ".ts";
  }

  const conceptFile = `${projectsDir}/${project}/server/concepts/${concept.toLowerCase()}`;
  if (!fs.existsSync(conceptFile)) {
    throw createError({
      status: 404,
      message: `Concept ${concept} not found for project ${project}`,
    });
  }

  const conceptSrc = await fs.promises.readFile(conceptFile, "utf8");

  const response = await generateUpdatedConcept(concept, conceptSrc, prompt);

  // Update the concept file
  await fs.promises.writeFile(conceptFile, response);

  await lock.acquire(project, async (): Promise<void> => {
    const config = await getProjectConfig(project);
    const oldPrompt = config.concepts[concept]?.prompt;
    config.concepts[concept] = {
      prompt: (oldPrompt ? `${oldPrompt}\n` : "") + "Revision: " + prompt,
      spec: "",
    };
    await updateProjectConfig(project, config);
  });

  // Update the concept spec, happens in the "background"
  await updateConceptSpec(project, concept);

  return { message: `Concept ${concept} updated for project ${project}` };
};

export const deleteConcept = async (project: string, concept: string) => {
  await validateProjectName(project);

  if (!concept.endsWith(".ts")) {
    concept += ".ts";
  }

  const conceptFile = `${projectsDir}/${project}/server/concepts/${concept.toLowerCase()}`;
  if (!fs.existsSync(conceptFile)) {
    throw createError({
      status: 404,
      message: `Concept ${concept} not found for project ${project}`,
    });
  }

  // Delete the concept file
  await fs.promises.rm(conceptFile);

  await lock.acquire(project, async (): Promise<void> => {
    const config = await getProjectConfig(project);
    delete config.concepts[concept];
    await updateProjectConfig(project, config);
  });

  return { message: `Concept ${concept} deleted for project ${project}` };
};

export const getProjectSpec = async (project: string) => {
  const config = await getProjectConfig(project);
  const specs = Object.values(config.concepts)
    .map((c) => c.spec)
    .join("\n");
  return specs;
};

export const updateConceptSpec = async (project: string, concept: string) => {
  await validateProjectName(project);

  if (!concept.endsWith(".ts")) {
    concept += ".ts";
  }

  const conceptFile = `${projectsDir}/${project}/server/concepts/${concept.toLowerCase()}`;
  if (!fs.existsSync(conceptFile)) {
    throw createError({
      status: 404,
      message: `Concept ${concept} not found for project ${project}`,
    });
  }

  const conceptSrc = await fs.promises.readFile(conceptFile, "utf8");

  const spec = await generateConceptSpec(conceptSrc);

  await lock.acquire(project, async (): Promise<void> => {
    const config = await getProjectConfig(project);
    config.concepts[concept].spec = spec;
    await updateProjectConfig(project, config);
  });

  return { message: `Spec for ${concept} updated for project ${project}` };
};

export const getProjectEnvironment = async (project: string) => {
  await validateProjectName(project);

  const envFile = `${projectsDir}/${project}/.env`;
  if (!fs.existsSync(envFile)) {
    throw createError({
      status: 404,
      message: `Environment file not found for project ${project}`,
    });
  }

  const envText = await fs.promises.readFile(envFile, "utf8");

  const lines = envText.split("\n");
  const env: Record<string, string> = {};

  for (const line of lines) {
    if (!line) continue;
    const [key, ...value] = line.split("=");
    env[key.trim()] = value.join("=").trim();
  }

  return env;
};

export const instantiateConcept = async (
  project: string,
  conceptName: string
) => {
  await validateProjectName(project);

  const appFile = `${projectsDir}/${project}/server/app.ts`;

  if (!fs.existsSync(appFile)) {
    throw createError({
      status: 404,
      message: `App file not found for project ${project}`,
    });
  }

  lock.acquire(project + "_concept", async (): Promise<void> => {
    const content = await fs.promises.readFile(appFile, "utf8");

    const conceptImportExport = `import ${conceptName}Concept from "./concepts/${conceptName.toLowerCase()}";\nexport const ${conceptName} = new ${conceptName}Concept("${conceptName.toLowerCase()}s");`;
    const newContent = content + "\n" + conceptImportExport;

    await fs.promises.writeFile(appFile, newContent);
  });
};

export const importInstantiatedConcept = async (
  project: string,
  conceptFileName: string,
  conceptName: string
) => {
  await validateProjectName(project);

  const routesFile = `${projectsDir}/${project}/server/routes.ts`;

  if (!fs.existsSync(routesFile)) {
    throw createError({
      status: 404,
      message: `Routes file not found for project ${project}`,
    });
  }

  lock.acquire(project + "_op", async (): Promise<void> => {
    const content = await fs.promises.readFile(routesFile, "utf8");

    const index = content.indexOf(' } from "./app"');
    const newContent = `${content.slice(
      0,
      index
    )}, ${conceptName}${content.slice(index)}`;

    await fs.promises.writeFile(routesFile, newContent);
  });
};

export const updateProjectEnvironment = async (
  project: string,
  env: Record<string, string>
) => {
  await validateProjectName(project);

  const envFile = `${projectsDir}/${project}/.env`;
  const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  const content = lines.join("\n");

  await fs.promises.writeFile(envFile, content);

  return { message: `Environment updated for project ${project}` };
};

export const runProject = async (project: string) => {
  await validateProjectName(project);

  if (PROJECT_RUNNERS[project]) {
    throw createError({
      status: 400,
      message: `Project ${project} is already running`,
    });
  }

  const runner = spawn("npm", ["run", "start"], {
    cwd: `${projectsDir}/${project}`,
  });

  sockets.forEach((ws) => {
    for (const pipe of ["stdout", "stderr"] as const) {
      runner[pipe].on("data", (data) => {
        ws.send(
          JSON.stringify({
            project,
            data: data.toString(),
          })
        );
      });
    }
  });

  PROJECT_RUNNERS[project] = runner;

  runner.on("exit", () => {
    delete PROJECT_RUNNERS[project];
  });

  return {
    message: `Project ${project} is running.`,
    pid: runner.pid,
  };
};

export const stopProject = async (project: string) => {
  await validateProjectName(project);

  const runner = PROJECT_RUNNERS[project];
  if (!runner) {
    throw createError({
      status: 400,
      message: `Project ${project} is not running`,
    });
  }

  runner.kill("SIGTERM");
  delete PROJECT_RUNNERS[project];

  return { message: `Project ${project} stopped` };
};

export const getRoutes = async (project: string) => {
  await validateProjectName(project);

  const routesFile = `${projectsDir}/${project}/server/routes.ts`;
  if (!fs.existsSync(routesFile)) {
    throw createError({
      status: 404,
      message: `Routes file not found for project ${project}`,
    });
  }

  const content = await fs.promises.readFile(routesFile, "utf8");

  return parseRouterFunctions(content);
};

const formatCalls = new Set<NodeJS.Timeout>();

const addRoute = async (project: string, routeSrc: string) => {
  await validateProjectName(project);

  const routesFile = `${projectsDir}/${project}/server/routes.ts`;
  if (!fs.existsSync(routesFile)) {
    throw createError({
      status: 404,
      message: `Routes file not found for project ${project}`,
    });
  }
  lock.acquire(project + "_route", async (): Promise<void> => {
    const content = await fs.promises.readFile(routesFile, "utf8");

    // Find the last router function and add the new route after it
    // Hack: find the last occurence of } and add the new route right before it
    const index = content.lastIndexOf("}");
    const newContent = `${content.slice(
      0,
      index
    )}\n${routeSrc}\n${content.slice(index)}`;

    await fs.promises.writeFile(routesFile, newContent);
  });

  const t = setTimeout(() => {
    for (const call of formatCalls) {
      clearTimeout(call);
    }
    execSync("npm run format", {
      cwd: `${projectsDir}/${project}`,
    });
  }, 1000);
  formatCalls.add(t);

  return { message: `Route added to project ${project}` };
};

export const processRouteForTestingClient = (
  name: string,
  method: string,
  endpoint: string,
  params: string[]
) => {
  let fields = "{";
  if (params.length > 0) {
    params.forEach((param, index) => {
      fields += `${param}: "input"`;
      if (index !== params.length - 1) {
        fields += ", ";
      }
    });
  }
  fields += "}";

  const processedName = name.replace(/([A-Z])/g, " $1").trim();

  return `
  {
    name: "${processedName.charAt(0).toUpperCase() + processedName.slice(1)}",
    endpoint: "/api${endpoint}",
    method: "${method.toUpperCase()}",
    fields: ${fields}
  }`;
};

export const generateRoutesForTestingClient = async (project: string) => {
  await validateProjectName(project);

  const operationsFile = `${projectsDir}/${project}/public/util.ts`;

  if (!fs.existsSync(operationsFile)) {
    throw createError({
      status: 404,
      message: `Operations file not found for project ${project}`,
    });
  }

  const routes = await getRoutes(project);
  const processedRoutes = routes.map((route) => {
    const { name, method, endpoint, params } = route;
    return processRouteForTestingClient(name, method, endpoint, params);
  });
  const operationsCode = `const operations: operation[] = [${processedRoutes.join(
    ",\n"
  )}\n`;

  lock.acquire(project + "_op", async (): Promise<void> => {
    const content = await fs.promises.readFile(operationsFile, "utf8");
    const startIndex = content.indexOf("const operations: operation[] = [");
    const endIndex = content.indexOf("];", startIndex);

    const newContent =
      content.substring(0, startIndex) +
      operationsCode +
      content.substring(endIndex);

    await fs.promises.writeFile(operationsFile, newContent);
  });
};

export const deleteRoute = async (project: string, route: string) => {
  await validateProjectName(project);

  const routesFile = `${projectsDir}/${project}/server/routes.ts`;
  if (!fs.existsSync(routesFile)) {
    throw createError({
      status: 404,
      message: `Routes file not found for project ${project}`,
    });
  }

  const content = await fs.promises.readFile(routesFile, "utf8");

  const pattern = new RegExp(
    `\\s*//.*\\n\\s*@Router\\..*?\\/.*"\\)\\s*` +
      `async\\s+${route}\\s*\\([^\\)]*\\)\\s*\\{` +
      `[^{}]*` + // Match method body without nesting
      `(?:\\{[^{}]*\\}[^{}]*)*` + // Match method body with simple nesting
      `\\}`
  );

  const newContent = content.replace(pattern, "");

  await fs.promises.writeFile(routesFile, newContent);

  // Also run "npm run format" (TODO: make this async later)
  // execSync("npm run format", {
  //   cwd: `${projectsDir}/${project}`,
  // });

  await generateRoutesForTestingClient(project);

  return { message: `Route deleted from project ${project}` };
};

export const createRoute = async (
  project: string,
  routeDescription: string
) => {
  await validateProjectName(project);

  const routesFile = `${projectsDir}/${project}/server/routes.ts`;
  if (!fs.existsSync(routesFile)) {
    throw createError({
      status: 404,
      message: `Routes file not found for project ${project}`,
    });
  }

  const appDefinition = await getAppDefinition(project);
  const spec = await getProjectSpec(project);

  const code = await generateRoute(spec, appDefinition, routeDescription);

  if (
    code.startsWith("HERE IS THE CODE ERROR:") ||
    code.toLowerCase().startsWith("error")
  ) {
    throw createError({
      status: 400,
      message: code,
    });
  }

  await addRoute(project, code);

  await generateRoutesForTestingClient(project);

  return { message: `Route created for project ${project}` };
};

export const getAppDefinition = async (project: string) => {
  await validateProjectName(project);

  const appFile = `${projectsDir}/${project}/server/app.ts`;
  if (!fs.existsSync(appFile)) {
    throw createError({
      status: 404,
      message: `App file not found for project ${project}`,
    });
  }

  const content = await fs.promises.readFile(appFile, "utf8");
  return content;
};

const updateRouteImports = async (project: string) => {
  const appDefinition = await getAppDefinition(project);
  const exportRegex = /export const (\w+)/g;

  const exportedNames = [];
  let match;
  while ((match = exportRegex.exec(appDefinition)) !== null) {
    exportedNames.push(match[1]);
  }

  const routesFile = `${projectsDir}/${project}/server/routes.ts`;
  const routesContent = await fs.promises.readFile(routesFile, "utf8");

  // Replace the import line with the new list of exported names
  const importLine = `import { ${exportedNames.join(", ")} } from "./app";`;
  const newRoutesContent = routesContent.replace(
    /import { .* } from "\.\/app";/,
    importLine
  );

  await fs.promises.writeFile(routesFile, newRoutesContent);

  return { message: `Route imports updated for project ${project}` };
};

export const updateAppDefinition = async (project: string, prompt: string) => {
  await validateProjectName(project);

  const appFile = `${projectsDir}/${project}/server/app.ts`;
  if (!fs.existsSync(appFile)) {
    throw createError({
      status: 404,
      message: `App file not found for project ${project}`,
    });
  }

  const spec = await getProjectSpec(project);
  const appDefinition = await getAppDefinition(project);

  const code = await generateAppDefinition(spec, appDefinition, prompt);
  await fs.promises.writeFile(appFile, code);
  await updateRouteImports(project);

  return { message: `App definition updated for project ${project}` };
};
