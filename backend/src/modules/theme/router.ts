import type { FastifyInstance } from 'fastify';
import { getThemePublic } from './controller';

export async function registerTheme(app: FastifyInstance) {
  app.get('/theme', { config: { public: true } }, getThemePublic);
}
