import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module'; 
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy'; 

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // อ่าน Secret Key จาก .env
        signOptions: { expiresIn: '1h' }, // Token หมดอายุใน 1 ชั่วโมง
      }),
    }),
  ],
  // เพิ่ม JwtStrategy ใน providers
  providers: [AuthService , JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}