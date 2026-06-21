import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash },
    });

    return this.buildAuthResponse(user.id, user.email, user.name);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user.id, user.email, user.name);
  }

  /** Step 1 of password reset: confirm an account exists for this email. */
  async checkEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('No account found for that email');
    }
    return { ok: true };
  }

  /** Step 2: set a new password (no email verification) and sign the user in. */
  async resetPassword(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('No account found for that email');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    return this.buildAuthResponse(user.id, user.email, user.name);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private buildAuthResponse(id: string, email: string, name: string) {
    const payload: JwtPayload = { sub: id, email };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      user: { id, name, email },
    };
  }
}
