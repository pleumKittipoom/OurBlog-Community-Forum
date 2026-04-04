import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // ฟังก์ชันนี้จะทำงาน *หลังจาก* Token ถูกตรวจสอบว่าถูกต้องแล้ว
  async validate(payload: any) {
    // ดึง User จาก DB เพื่อแน่ใจว่า User ยังมีตัวตน
    const user = await this.userService.findOneById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}