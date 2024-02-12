import { createRouter, defineEventHandler, useBase } from 'h3';
import { deleteProject, getProject, installDependencies, uninstallDependencies } from '~/server/manager';

const router = createRouter();

router.get('/:name', defineEventHandler(async (event) => {
  return await getProject(event.context.params?.name!);
}));

router.delete('/:name', defineEventHandler(async (event) => {
  return await deleteProject(event.context.params?.name!);
}));

router.post('/:name/install', defineEventHandler(async (event) => {
  return installDependencies(event.context.params?.name!);
}));

router.post('/:name/uninstall', defineEventHandler(async (event) => {
  return uninstallDependencies(event.context.params?.name!);
}));

export default useBase('/api/project', router.handler);