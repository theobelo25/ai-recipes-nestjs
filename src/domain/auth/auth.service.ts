import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dtos/createUser.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RequestUser } from './interfaces/request-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser)
      throw new ConflictException(
        'A user with this email address already exists.',
      );

    const hashedPassword = await this.hashingService.hash(password);

    return await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async validateLocal(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials.');

    const isMatch = await this.hashingService.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials.');

    const requestUser: RequestUser = { id: user.id };
    return requestUser;
  }

  async validateJwt({ sub }: JwtPayload) {
    const user = await this.usersService.findOneById(sub);
    if (!user) throw new UnauthorizedException('Invalid token.');

    const requestUser: RequestUser = { id: sub };
    return requestUser;
  }

  async signAccessToken(userId: string): Promise<string> {
    const payload: JwtPayload = { sub: userId };
    const accessToken = await this.jwtService.signAsync(payload);
    if (!accessToken) throw new UnauthorizedException('Problem signing token.');

    return accessToken;
  }
}
