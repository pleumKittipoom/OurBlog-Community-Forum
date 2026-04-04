import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard'; 
import { Roles } from 'src/auth/roles.decorator'; 
import { UserRole } from 'src/user/user.entity';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard) // ล็อกด้วย Token และ Guardเช็กสิทธิ์
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @Roles(UserRole.ADMIN)
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/role')
  @Roles(UserRole.ADMIN) 
  setUserRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ) {
    return this.adminService.setUserRole(+id, role);
  }
}