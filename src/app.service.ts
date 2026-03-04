import { Injectable } from '@nestjs/common';

/** Minimal root-level app info (health/identity). For detailed health checks, consider @nestjs/terminus. */
@Injectable()
export class AppService {
  getRoot(): { name: string; status: string } {
    return { name: 'ai-recipes', status: 'ok' };
  }
}
