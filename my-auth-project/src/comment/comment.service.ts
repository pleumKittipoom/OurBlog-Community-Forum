// src/comment/comment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './comment.entity';
import { Note } from 'src/note/note.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) { }

  // (ดึง Comment ทั้งหมดของ Note 1 อัน)
  async getForNote(noteId: number): Promise<Comment[]> {
    // 1. ดึง Comment ที่เป็นราก (Root) เท่านั้น (ที่ไม่มี parent)
    return this.commentRepository.find({
      where: {
        note: { id: noteId },
        parent: IsNull()
      },
      // 2. โหลด User และ Children 
      relations: [
        'user', 
        'commentReactions', 
        'commentReactions.user',
        'children', 
        'children.user', 
        'children.commentReactions', 
        'children.commentReactions.user',
        'children.children',
        'children.children.user',
        'children.children.commentReactions', 
        'children.children.commentReactions.user' 
      ],
      order: { createdAt: 'ASC' },
    });
  }

  // (สร้าง Comment ใหม่)
  async create(
    noteId: number,
    content: string,
    user: User,
    parentId?: number
  ): Promise<Comment> {
    const note = await this.noteRepository.findOneBy({ id: noteId });
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // ตรวจสอบ Parent Comment ถ้ามี
    let parent: Comment | null = null;
    if (parentId) {
      parent = await this.commentRepository.findOneBy({ id: parentId });
      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = this.commentRepository.create({
      content,
      note,
      user,
      parent,
    });

    // return comment ที่มี user และ parent กลับไปเลย
    const savedComment = await this.commentRepository.save(comment);
    savedComment.user = user; 
    savedComment.parent = parent;
    savedComment.commentReactions = []; 
    return savedComment;
  }
}