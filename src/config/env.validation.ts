import * as Joi from 'joi';

export function validateEnvironment(config: Record<string, unknown>) {
  const schema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'test', 'production')
      .default('development'),
    PORT: Joi.number().integer().min(1).max(65535).default(3000),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().integer().min(1).max(65535).default(5432),
    DB_NAME: Joi.string().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
  }).unknown(true);

  const { error, value } = schema.validate(config, { abortEarly: false });

  if (error) {
    throw new Error(`Environment validation error: ${error.message}`);
  }

  return value;
}
