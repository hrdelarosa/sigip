import * as Joi from 'joi';

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['mysql'] })
    .required(),

  SESSION_COOKIE_NAME: Joi.string().min(1).required(),
  SESSION_IDLE_MINUTES: Joi.number().integer().positive().default(30),
  SESSION_ABSOLUTE_MINUTES: Joi.number()
    .integer()
    .min(Joi.ref('SESSION_IDLE_MINUTES'))
    .default(600),
  FRONTEND_ORIGIN: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  TRUST_PROXY_HOPS: Joi.number().integer().min(0).default(0),
  STORAGE_ROOT: Joi.string().min(1).default('storage'),
  ALLOW_DEVELOPMENT_SEED: Joi.boolean().default(false),
});
