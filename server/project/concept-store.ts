import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { readdir } from "~/server/fsutil";
import {
  getProjectConfig,
  lock,
  projectsDir,
  updateProjectConfig,
  validateProjectName,
} from "./manager";

const storeDir = path.join(fileURLToPath(import.meta.url), "../../../concepts");

export const getConceptStore = async () => {
  const concepts = (await readdir(storeDir)).files;

  const metas: Record<string, string>[] = [];
  for (const concept of concepts) {
    const metaFile = path.join(storeDir, concept, "meta.js");
    if (fs.existsSync(metaFile)) {
      const meta = (await import(metaFile)).default;

      // Do some cleaning of output just for nice display
      for (const key in meta) {
        let value = meta[key] as string;
        if (typeof value === "string") {
          const lines = value.split("\n").filter((line) => line.trim() !== "");
          const removeBegin = Math.min(
            ...lines.map((line) => line.match(/^\s*/)![0].length ?? 0)
          );
          meta[key] = value
            .split("\n")
            .map((line) => line.slice(removeBegin))
            .join("\n");
        }
      }

      metas.push(meta.default || meta);
    } else {
      metas.push({});
    }
  }

  return concepts.map((concept, i) => ({
    name: concept,
    meta: metas[i],
  }));
};

export const getConceptFromStore = async (concept: string) => {
  const conceptDir = path.join(storeDir, concept);
  if (!fs.existsSync(conceptDir)) {
    throw createError({
      status: 404,
      message: `Concept ${concept} not found in the store`,
    });
  }

  const src = fs.readFileSync(path.join(conceptDir, "src.ts"), "utf-8");
  const meta = (await import(path.join(conceptDir, "meta.js"))).default;

  return { src, meta };
};

export const importConcept = async (project: string, concept: string) => {
  validateProjectName(project);
  const projectDir = path.join(projectsDir, project);

  const conceptFilename = concept + ".ts";

  const conceptPath = path.join(
    projectDir,
    "server",
    "concepts",
    conceptFilename
  );

  // check if this concept is already imported
  if (fs.existsSync(conceptPath)) {
    throw createError({
      status: 400,
      message: `Concept ${conceptFilename} is already exists in project ${project}`,
    });
  }

  const { src, meta } = await getConceptFromStore(concept);

  await fs.promises.writeFile(conceptPath, src);

  await lock.acquire(project, async (): Promise<void> => {
    const config = await getProjectConfig(project);
    config.concepts[conceptFilename] = { prompt: meta.prompt, spec: meta.spec };
    await updateProjectConfig(project, config);
  });

  return { message: `Concept ${concept} imported successfully` };
};
