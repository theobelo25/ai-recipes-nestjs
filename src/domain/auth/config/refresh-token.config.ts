import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';
import { env } from 'src/env/env';

export default registerAs('refreshToken', () => ({
  ttl: env.REFRESH_TOKEN_TTL as StringValue,
  prefixSecret: env.REFRESH_PREFIX_SECRET,
}));
