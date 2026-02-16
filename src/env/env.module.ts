import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      validate: (config) => {
        const parsed = envSchema.safeParse(config);

        if (!parsed.success) {
          // Make Nest fail fast with readable errors
          throw new Error(
            `Invalid environment variables:\n${JSON.stringify(parsed.error.format(), null, 2)}`,
          );
        }

        return parsed.data;
      },
    }),
  ],
})
export class EnvModule {}
