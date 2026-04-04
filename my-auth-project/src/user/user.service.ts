import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
  }

  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  // (สำหรับ Admin) ดึงผู้ใช้ทั้งหมด
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // (สำหรับ Admin) บันทึกการอัปเดต (เช่น เปลี่ยน Role)
  async update(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}