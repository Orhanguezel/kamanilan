import type { RouteHandler } from 'fastify';
import {
  listIntegrationSettingsQuerySchema,
  providerParamSchema,
  upsertIntegrationSettingsSchema,
} from './validation';
import {
  deleteIntegrationSettings,
  getIntegrationSettings,
  listIntegrationSettings,
  upsertIntegrationSettings,
} from './service';

export const adminListIntegrationSettings: RouteHandler = async (req, reply) => {
  try {
    const q = listIntegrationSettingsQuerySchema.parse((req.query || {}) as unknown);
    const items = await listIntegrationSettings({
      provider: q.provider,
      includeSecrets: q.include_secrets,
    });
    return reply.send(items);
  } catch (e) {
    req.log.error(e);
    return reply.code(400).send({ error: { message: 'validation_error' } });
  }
};

export const adminGetIntegrationSettingsByProvider: RouteHandler = async (req, reply) => {
  try {
    const { provider } = providerParamSchema.parse(req.params || {});
    const item = await getIntegrationSettings(provider, true);
    if (!item) {
      return reply.code(404).send({ error: { message: 'not_found' } });
    }
    return reply.send(item);
  } catch (e) {
    req.log.error(e);
    return reply.code(400).send({ error: { message: 'validation_error' } });
  }
};

export const adminUpsertIntegrationSettings: RouteHandler = async (req, reply) => {
  try {
    const { provider } = providerParamSchema.parse(req.params || {});
    const body = upsertIntegrationSettingsSchema.parse(req.body || {});
    const item = await upsertIntegrationSettings(provider, body);
    return reply.send(item);
  } catch (e) {
    req.log.error(e);
    return reply.code(400).send({ error: { message: 'validation_error' } });
  }
};

export const adminDeleteIntegrationSettingsByProvider: RouteHandler = async (req, reply) => {
  try {
    const { provider } = providerParamSchema.parse(req.params || {});
    await deleteIntegrationSettings(provider);
    return reply.code(204).send();
  } catch (e) {
    req.log.error(e);
    return reply.code(400).send({ error: { message: 'validation_error' } });
  }
};
