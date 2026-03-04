import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

/** Matches slugify output: lowercase letters, digits, hyphens (no leading/trailing). */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 80;

@Injectable()
export class ParseSlugPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== 'string') {
      throw new BadRequestException('Slug must be a string');
    }
    const trimmed = value.trim();
    if (!trimmed.length) {
      throw new BadRequestException('Slug is required');
    }
    if (trimmed.length > MAX_SLUG_LENGTH) {
      throw new BadRequestException(
        `Slug must be at most ${MAX_SLUG_LENGTH} characters`,
      );
    }
    if (!SLUG_REGEX.test(trimmed)) {
      throw new BadRequestException(
        'Slug must contain only lowercase letters, numbers, and hyphens (e.g. fresh-basil)',
      );
    }
    return trimmed;
  }
}
