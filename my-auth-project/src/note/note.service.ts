// src/note/note.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Note } from './note.entity';
import { User } from 'src/user/user.entity';


interface FindAllPublicOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  search: string;
}

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
  ) { }

  // CREATE
  async create(title: string, content: string, imageUrl: string, user: User): Promise<Note> {
    const note = this.notesRepository.create({
      title,
      content,
      imageUrl,
      user: user,
    });
    return this.notesRepository.save(note);
  }

  // READ (All for user)
  async findAllForUser(user: User): Promise<Note[]> {
    return this.notesRepository.find({
      where: { user: { id: user.id } },
    });
  }

  // (ดึงโน้ตทั้งหมด)
  async findAllPublic(
    options: FindAllPublicOptions,
  ): Promise<{ data: Note[]; total: number }> {

    const { page, limit, sortBy, sortOrder, search } = options;
    const skip = (page - 1) * limit;

    const whereConditions: any = {
      // isPublic: true, 
    };

    if (search) {
      // ให้เพิ่มเงื่อนไขค้นหา 'title' ด้วย Like (ค้นหาแบบมี % นำหน้า/ตามหลัง)
      whereConditions.title = ILike(`%${search}%`);
    }

    const [data, total] = await this.notesRepository.findAndCount({
      where: whereConditions,
      relations: ['user', 'reactions', 'reactions.user'],
      order: { [sortBy]: sortOrder }, 
      take: limit, 
      skip: skip,
    });

    return { data, total };
  }

  // (ดึงโน้ต 1 ชิ้น แบบสาธารณะ)
  async findOnePublic(id: number): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id },
      relations: ['user', 'reactions', 'reactions.user'],
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  // DELETE
  async remove(id: number, user: User): Promise<void> {
    const note = await this.notesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.user.id !== user.id) {
      throw new UnauthorizedException('You do not own this note');
    }
    await this.notesRepository.remove(note);
  }

  /// UPDATE
  async update(id: number, user: User, title: string, content: string, imageUrl: string): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id },
      relations: ['user'], // (ค้นหาแค่ 'user' ตอนเช็กสิทธิ์)
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.user.id !== user.id) {
      throw new UnauthorizedException('You do not own this note');
    }

    note.title = title;
    note.content = content;
    note.imageUrl = imageUrl;

    return this.notesRepository.save(note);
  }



}