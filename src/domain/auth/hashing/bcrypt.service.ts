import { Injectable } from '@nestjs/common';
import { HashingService } from './hashing.service.js';
import { compare, genSalt, hash } from 'bcryptjs';

@Injectable()
export class BcryptService implements HashingService {
  async hash(data: string) {
    const salt = await genSalt(12);
    return hash(data, salt);
  }
  compare(data: string, encrypted: string) {
    return compare(data, encrypted);
  }
}
