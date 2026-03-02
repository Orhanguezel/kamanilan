import type { RouteHandler } from 'fastify';
import { providerParamSchema } from './validation';
import {
  getPublicIntegrationSettings,
  listPublicIntegrationSettings,
} from './service';

export const listPublicIntegrations: RouteHandler = async (_req, reply) => {
  const items = await listPublicIntegrationSettings();
  return reply.send(items);
};

export const getPublicIntegrationByProvider: RouteHandler = async (req, reply) => {
  try {
    const { provider } = providerParamSchema.parse(req.params || {});
    const item = await getPublicIntegrationSettings(provider);

    if (!item) {
      return reply.code(404).send({ error: { message: 'not_found_or_disabled' } });
    }

    return reply.send(item);
  } catch (e) {
    req.log.error(e);
    return reply.code(400).send({ error: { message: 'validation_error' } });
  }
};
