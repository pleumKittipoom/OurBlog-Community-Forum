import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction, ReactionType } from './reaction.entity';
import { Note } from 'src/note/note.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class ReactionService { 
  constructor(
    @InjectRepository(Reaction) 
    private reactionRepository: Repository<Reaction>,
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}

  async setReaction(noteId: number, user: User, type: ReactionType): Promise<Note> {
    
    // ค้นหา Reaction เดิม (ถ้ามี)
    const existingReaction = await this.reactionRepository.findOne({
      where: {
        note: { id: noteId },
        user: { id: user.id },
      },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // ถ้ากดซ้ำ "ยกเลิก" (ลบ)
        await this.reactionRepository.remove(existingReaction);
      } else {
        // ถ้ากดอันใหม่ "เปลี่ยน" (อัปเดต type)
        existingReaction.type = type;
        await this.reactionRepository.save(existingReaction);
      }
    } else {
      // ถ้าไม่เคยมี "สร้างใหม่"
      const newReaction = this.reactionRepository.create({
        note: { id: noteId },
        user: { id: user.id },
        type: type, // ระบุ Type
      });
      await this.reactionRepository.save(newReaction);
    }

    // คืนค่า Note ที่อัปเดตแล้ว (พร้อม Reactions ทั้งหมด)
    return (await this.noteRepository.findOne({
      where: { id: noteId },
      relations: ['user', 'reactions', 'reactions.user'],
    }))!;
  }
}