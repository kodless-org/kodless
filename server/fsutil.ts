import fs from "fs";
import path from "path";

/**
 * Read the contents of a directory
 */
export const readdir = async (
  dir: string,
  options?: { recursive?: boolean; exclude?: string[] }
) => {
  if (!options) {
    options = { recursive: false, exclude: [] };
  }

  options.recursive = options.recursive || false;
  options.exclude = options.exclude || [];

  let fileList: string[] = [];
  let excluded: string[] = [];

  async function walk(dir: string) {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (options?.exclude?.includes(file.name)) {
        excluded.push(fullPath);
        continue;
      }
      fileList.push(fullPath);
      if (file.isDirectory()) {
        await walk(fullPath);
      }
    }
  }

  await walk(dir);

  const dirNormalized = dir.endsWith(path.sep) ? dir : dir + path.sep;
  const normalize = (file: string) => file.replace(dirNormalized, "");

  return {
    files: fileList.map(normalize),
    excluded: excluded.map(normalize),
  };
};
