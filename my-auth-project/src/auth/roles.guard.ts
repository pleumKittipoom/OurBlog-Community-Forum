import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../user/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ดูว่า Endpoint นี้ต้องการ Role อะไร (จาก @Roles)
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true; // ไม่กำหนด Role = ผ่าน
    }

    // ดึง User ที่แนบมาโดย JwtStrategy
    const { user } = context.switchToHttp().getRequest();

    // เช็กว่า Role ของ User ตรงกับที่ Endpoint ต้องการหรือไม่
    return requiredRoles.some((role) => user.role === role);
  }
}