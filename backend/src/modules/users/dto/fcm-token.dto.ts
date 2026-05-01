import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterFcmTokenDto {
  @ApiProperty({
    description: 'Expo / FCM device push token',
    example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
    minLength: 10,
    maxLength: 512,
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 512)
  fcmToken: string;
}
