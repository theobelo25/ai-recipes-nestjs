import { ConflictException, Injectable } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dtos/createUser.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}
  async signup(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    // Check for existing user
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser)
      throw new ConflictException(
        'A user with this email address already exists.',
      );

    const hashedPassword = await this.hashingService.hash(password);
    const userData: CreateUserDto = {
      ...createUserDto,
      password: hashedPassword,
    };

    const user = await this.usersService.create(userData);

    const payload: JwtPayload = { sub: user.id };
    return this.jwtService.sign(payload);
  }
}
