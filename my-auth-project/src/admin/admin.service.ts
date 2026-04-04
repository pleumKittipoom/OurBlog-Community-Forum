import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User, UserRole } from 'src/user/user.entity';

@Injectable()
export class AdminService {
  constructor(
    private userService: UserService,
  ) {}

  // (ดึงผู้ใช้ทั้งหมด)
  async getAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  // (เปลี่ยนสิทธิ์ผู้ใช้)
  async setUserRole(id: number, role: UserRole): Promise<User> {
    const user = await this.userService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.role = role;
    return this.userService.update(user);
  }
}