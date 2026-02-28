import { Injectable } from '@nestjs/common';
import { HashingService } from './hashing.service';
import { hash, verify } from 'argon2';

@Injectable()
export class Argon2Service implements HashingService {
  async hash(data: string) {
    return hash(data);
  }
  compare(data: string, encrypted: string) {
    return verify(encrypted, data);
  }
}
