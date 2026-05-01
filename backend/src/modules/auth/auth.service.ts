import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {}

  // -------------------------------------------------------
  // SEND OTP
  // -------------------------------------------------------
  async sendOtp(dto: SendOtpDto) {
    const { phone } = dto;

    // Rate-limit: max 5 OTP requests per phone per 10 minutes
    await this.otpService.checkRateLimit(phone);

    // Generate OTP and persist to Redis (TTL: 10 min)
    const otp = await this.otpService.generateOtp(phone);

    // Dispatch SMS via MSG91 (or log to console in dev)
    await this.otpService.sendSms(phone, otp);

    this.logger.log(`OTP sent to ${phone}`);

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  // -------------------------------------------------------
  // VERIFY OTP
  // -------------------------------------------------------
  async verifyOtp(dto: VerifyOtpDto) {
    const { phone, otp } = dto;

    // Validate OTP from Redis
    const isValid = await this.otpService.verifyOtp(phone, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Upsert user — create if first login, update lastLogin if returning
    const user = await this.prisma.user.upsert({
      where:  { phone },
      update: { lastLoginAt: new Date() },
      create: {
        phone,
        isVerified: true,
        isActive:   true,
      },
    });

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated. Please contact support.');
    }

    const tokens = await this.generateTokenPair(user.id, user.role);
    this.logger.log(`User ${user.id} authenticated via OTP`);

    return {
      success: true,
      data: {
        accessToken:  tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id:         user.id,
          phone:      user.phone,
          name:       user.name,
          email:      user.email,
          role:       user.role,
          isVerified: user.isVerified,
        },
      },
    };
  }

  // -------------------------------------------------------
  // REFRESH TOKEN
  // -------------------------------------------------------
  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or deactivated');
      }

      const tokens = await this.generateTokenPair(user.id, user.role);

      return {
        success: true,
        data:    tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // -------------------------------------------------------
  // Helpers
  // -------------------------------------------------------
  private async generateTokenPair(userId: string, role: string) {
    const payload = { sub: userId, role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret:    this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    return { accessToken, refreshToken };
  }
}
