import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { JwtPayload } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Step 1: verify the email exists so the UI can reveal the new-password field.
  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.checkEmail(dto.email);
  }

  // Step 2: set the new password and sign the user in.
  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }
  // command line 
}
