import { createRouter, defineEventHandler, useBase } from "h3";
import {
  createProject,
  deleteProject,
  getConcept,
  getProjectFiles,
  getProjectStatus,
  getProjects,
  installDependencies,
  runProject,
  stopProject,
  uninstallDependencies,
} from "~/server/project/manager";

const router = createRouter();

// Get project files
router.get(
  "/:name/files",
  defineEventHandler(async (event) => {
    return await getProjectFiles(event.context.params?.name!);
  })
);

// Get running status of project
router.get(
  "/:name/status",
  defineEventHandler(async (event) => {
    return await getProjectStatus(event.context.params?.name!);
  })
);

// Delete project (deletes all files too!)
router.delete(
  "/:name",
  defineEventHandler(async (event) => {
    return await deleteProject(event.context.params?.name!);
  })
);

// Install dependencies for project (runs "npm install")
router.post(
  "/:name/install",
  defineEventHandler(async (event) => {
    return installDependencies(event.context.params?.name!);
  })
);

// Uninstall dependencies for project (deletes node_modules and package-lock.json)
router.post(
  "/:name/uninstall",
  defineEventHandler(async (event) => {
    return uninstallDependencies(event.context.params?.name!);
  })
);

// Run the project
router.post(
  "/:name/run",
  defineEventHandler(async (event) => {
    return runProject(event.context.params?.name!);
  })
);

// Stop the project
router.post(
  "/:name/stop",
  defineEventHandler(async (event) => {
    return stopProject(event.context.params?.name!);
  })
);

// Get concept source code
router.get(
  "/:name/concepts/:concept",
  defineEventHandler(async (event) => {
    return await getConcept(
      event.context.params?.name!,
      event.context.params?.concept!
    );
  })
);

export default useBase("/api/projects", router.handler);
