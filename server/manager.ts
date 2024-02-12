import fs from "fs";
import { execSync } from "child_process";
import { readdir } from "./fsutil";

const projectsDir = process.env.PROJECTS_DIRECTORY as string;

export const getProjects = async () => {
  const projects = await fs.promises.readdir(projectsDir);
  return projects;
};

const validateProjectName = async (project: string) => {
  if (!project) {
    throw new Error("Missing project project");
  }

  if (project === "template") {
    throw new Error(`Cannot use reserved project project ${project}`);
  }

  const projects = await getProjects();
  if (!projects.includes(project)) {
    throw new Error(`Project ${project} not found`);
  }
};

export const createProject = async (project: string) => {
  const projects = await getProjects();
  if (projects.includes(project)) {
    throw new Error(`Project ${project} already exists`);
  }

  // Create the project directory
  await fs.promises.mkdir(`${projectsDir}/${project}`);

  // Copy the template files to the new project
  const templateDir = `${projectsDir}/template`;
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

export const getProject = async (project: string) => {
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
      statusCode: 404,
      message: `Concept ${concept} not found for project ${project}`,
    });
  }

  // Get the file contents
  const content = await fs.promises.readFile(conceptFile, "utf8");

  return content;
};
