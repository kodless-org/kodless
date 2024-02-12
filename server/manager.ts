import fs from "fs";
import { execSync } from "child_process";
import { readdir } from "./fsutil";

const projectsDir = process.env.PROJECTS_DIRECTORY as string;

export const getProjects = async () => {
  const projects = await fs.promises.readdir(projectsDir);
  return projects;
};

const validateProjectName = async (name: string) => {
  if (!name) {
    throw createError({
      status: 400,
      message: "Missing project name",
    });
  }

  if (name === "template") {
    throw createError({
      status: 400,
      message: `Cannot use reserved project name ${name}`,
    });
  }

  const projects = await getProjects();
  if (!projects.includes(name)) {
    throw createError({
      status: 404,
      message: `Project ${name} not found`,
    });
  }
}

export const createProject = async (name: string) => {
  validateProjectName(name);

  // Create the project directory
  await fs.promises.mkdir(`${projectsDir}/${name}`);

  // Copy the template files to the new project
  const templateDir = `${projectsDir}/template`;
  await fs.promises.cp(templateDir, `${projectsDir}/${name}`, {
    recursive: true,
  });

  return { message: `Project ${name} created` };
};

export const deleteProject = async (name: string) => {
  validateProjectName(name);

  // Delete the project directory
  await fs.promises.rm(`${projectsDir}/${name}`, {
    recursive: true,
  });

  return { message: `Project ${name} deleted` };
}

export const getProject = async (name: string) => {
  validateProjectName(name);

  // Get all the files in the project directory, recursively
  const { files, excluded } = await readdir(`${projectsDir}/${name}`, {
    recursive: true,
    exclude: ["node_modules"],
  });

  // Found node_modules, so just add that as a directory
  if (excluded.length) {
    files.push("node_modules");
  }

  return files;
};

export const installDependencies = async (name: string) => {
  

  // Run npm install in the project directory
  const output = execSync("npm i", {
    cwd: `${projectsDir}/${name}`,
  });

  return {output, message: `Dependencies installed for project ${name}`};
};

export const uninstallDependencies = async (name: string) => {
  if (name === "template") {
    throw createError({
      status: 400,
      message: `Project ${name} cannot be uninstalled`,
    });
  }

  const projects = await getProjects();
  if (!projects.includes(name)) {
    throw createError({
      status: 404,
      message: `Project ${name} not found`,
    });
  }

  // Remove node_modules and package-lock.json from the project directory
  await fs.promises.rm(`${projectsDir}/${name}/node_modules`, {
    recursive: true,
  });
  await fs.promises.rm(`${projectsDir}/${name}/package-lock.json`);

  // execSync("rm -rf node_modules", {
  //   cwd: `${projectsDir}/${name}`,
  // });
  // execSync("rm -rf package-lock.json", {
  //   cwd: `${projectsDir}/${name}`,
  // });

  return { message: `Dependencies uninstalled for project ${name}` };
}