import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/user/user.entity'; 


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // --- Logic สำหรับ Register ---
  async register(registerDto: any): Promise<User> {
    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // บันทึก User ลง DB
    try {
      const user = await this.userService.create({
        email: registerDto.email,
        password: hashedPassword,
      });
      
      delete (user as any).password;
      return user;
    } catch (error) {
      throw new UnauthorizedException('Email already exists'); 
    }
  }

  // --- Logic สำหรับ Login ---
  async login(loginDto: any): Promise<{ access_token: string }> {
    // หา User
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // เช็ค Password 
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // สร้าง JWT Token
    const payload = { email: user.email, sub: user.id, role: user.role,}; 
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}