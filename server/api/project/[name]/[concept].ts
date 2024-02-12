import { createRouter, defineEventHandler, useBase } from 'h3';
import { getConcept } from '~/server/manager';

const router = createRouter();

router.get('/:name/:concept', defineEventHandler(async (event) => {
  return await getConcept(event.context.params?.name!, event.context.params?.concept!);
}));

export default useBase('/api/project', router.handler);