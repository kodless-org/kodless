import fs from "fs";

const projectsDir = process.env.PROJECTS_DIRECTORY as string;

export const getProjects = async () => {
  const projects = await fs.promises.readdir(projectsDir);
  return projects;
};

export const createProject = async (name: string) => {
  // Make sure the project doesn't already exist
  const projects = await getProjects();
  if (projects.includes(name)) {
    throw createError({
      status: 400,
      message: `Project ${name} already exists`,
    });
  }

  // Create the project directory
  await fs.promises.mkdir(`${projectsDir}/${name}`);

  // Copy the template files to the new project
  const templateDir = `${projectsDir}/template`;
  await fs.promises.cp(templateDir, `${projectsDir}/${name}`, {
    recursive: true,
  });

  return { message: `Project ${name} created` };
};

export const getProject = async (name: string) => {
  const projects = await getProjects();
  if (!projects.includes(name)) {
    throw createError({
      status: 404,
      message: `Project ${name} not found`,
    });
  }
  // Get all the files in the project directory, recursively
  const files = await fs.promises.readdir(`${projectsDir}/${name}`, {
    recursive: true,
  });

  // Sort by name and make subdirectories appear after their parent directory
  files.sort((a, b) => {
    const partsA = a.split("/");
    const partsB = b.split("/");
    for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
      if (partsA[i] !== partsB[i]) {
        return partsA[i].localeCompare(partsB[i]);
      }
    }
    return partsA.length - partsB.length;
  });

  return files;
};
