import { ConflictException, Injectable } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dtos/createUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
  ) {}
  async signup(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    console.log('HERE');

    // Check for existing user
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser)
      throw new ConflictException(
        'A user with this email address already exists.',
      );

    const hashedPassword = await this.hashingService.hash(password);
    const newUser: CreateUserDto = {
      ...createUserDto,
      password: hashedPassword,
    };

    return this.usersService.create(newUser);
  }
}
