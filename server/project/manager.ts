import fs from "fs";
import path from "path";
import { execSync, spawn, ChildProcessWithoutNullStreams } from "child_process";
import { readdir } from "~/server/fsutil";
import { fileURLToPath } from 'url';

const projectsDir = process.env.PROJECTS_DIRECTORY as string;

const PROJECT_RUNNERS: Record<string, ChildProcessWithoutNullStreams> = {};

export const getProjects = async () => {
  const projects = await fs.promises.readdir(projectsDir);
  return projects;
};

const validateProjectName = async (project: string) => {
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
  const templateDir = path.join(fileURLToPath(import.meta.url), "../../../template");

  await fs.promises.cp(templateDir, `${projectsDir}/${project}`, {
    recursive: true,
  });

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

export const getProjectFiles = async (project: string) => {
  await validateProjectName(project);

  // Get all the files in the project directory, recursively
  const { files, excluded } = await readdir(`${projectsDir}/${project}`, {
    recursive: true,
    exclude: ["node_modules"],
  });

  // Found node_modules, so just add that as a directory
  if (excluded.length) {
    files.push("node_modules");
  }

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

  console.log("concept", concept);

  // make sure the concept file exists
  const conceptFile = `${projectsDir}/${project}/server/concepts/${concept.toLowerCase()}`;
  if (!fs.existsSync(conceptFile)) {
    throw createError({
      status: 404,
      message: `Concept ${concept} not found for project ${project}`,
    });
  }

  // Get the file contents
  const content = await fs.promises.readFile(conceptFile, "utf8");
  return content;
};

export const getProjectEnv = async (project: string) => {
  await validateProjectName(project);

  const envFile = `${projectsDir}/${project}/.env`;
  if (!fs.existsSync(envFile)) {
    throw createError({
      status: 404,
      message: `Environment file not found for project ${project}`,
    });
  }

  const env = await fs.promises.readFile(envFile, "utf8");
  return env;
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

  PROJECT_RUNNERS[project] = runner;

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
