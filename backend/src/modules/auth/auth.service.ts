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

    // Check if user exists; if not, we'll create on verify
    const user = await this.prisma.user.findUnique({ where: { phone } });

    // Generate and store OTP (in Redis via OtpService)
    const otp = await this.otpService.generateOtp(phone);

    // Send OTP via SMS (MSG91)
    await this.otpService.sendSms(phone, otp);

    this.logger.log(`OTP sent to ${phone}`);

    return {
      message: 'OTP sent successfully',
      phone,
      isNewUser: !user,
    };
  }

  // -------------------------------------------------------
  // VERIFY OTP
  // -------------------------------------------------------
  async verifyOtp(dto: VerifyOtpDto) {
    const { phone, otp } = dto;

    // Validate OTP
    const isValid = await this.otpService.verifyOtp(phone, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Upsert user — create if first time, fetch if returning
    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { phone, isVerified: true },
      });
      this.logger.log(`New user registered: ${phone}`);
    } else {
      await this.prisma.user.update({
        where: { phone },
        data: { isVerified: true },
      });
    }

    // Issue JWT tokens
    const tokens = await this.generateTokens(user.id, user.phone, user.role);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        isNewUser: !user.name, // no name = new user, needs onboarding
      },
      ...tokens,
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
        throw new UnauthorizedException('User not found or inactive');
      }

      const tokens = await this.generateTokens(user.id, user.phone, user.role);
      return { message: 'Token refreshed', ...tokens };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // -------------------------------------------------------
  // GET ME
  // -------------------------------------------------------
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        role: true,
        city: true,
        state: true,
        isVerified: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  // -------------------------------------------------------
  // PRIVATE: Generate Access + Refresh tokens
  // -------------------------------------------------------
  private async generateTokens(userId: string, phone: string, role: string) {
    const payload = { sub: userId, phone, role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return { accessToken, refreshToken };
  }
}
