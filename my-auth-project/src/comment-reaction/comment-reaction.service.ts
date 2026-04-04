// src/comment-reaction/comment-reaction.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentReaction } from './comment-reaction.entity';
import { Comment } from '../comment/comment.entity';
import { User } from '../user/user.entity';

@Injectable()
export class CommentReactionService {
    constructor(
        @InjectRepository(CommentReaction)
        private commentReactionRepository: Repository<CommentReaction>,
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
    ) { }

    async reactToComment(commentId: number, type: 'like' | 'dislike', user: User): Promise<Comment> {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
            relations: [
                'user',
                'commentReactions',
                'commentReactions.user'
            ],
        });

        // 2. เช็ค null ตั้งแต่ต้น
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        // หา Reaction เดิมของ User คนนี้สำหรับ Comment นี้
        const existingReaction = comment.commentReactions.find(
            (r) => r.user.id === user.id,
        );

        if (existingReaction) {
            if (existingReaction.type === type) {
                // ถ้ากด Reaction เดิมซ้ำ: ลบ Reaction ออก
                await this.commentReactionRepository.remove(existingReaction);
                // อัปเดต 'comment' object ใน memory
                comment.commentReactions = comment.commentReactions.filter(
                    (r) => r.id !== existingReaction.id,
                );
            } else {
                // ถ้าเปลี่ยน Reaction: อัปเดต Reaction
                existingReaction.type = type;
                await this.commentReactionRepository.save(existingReaction);
            }
        } else {
            // ถ้ายังไม่มี Reaction: สร้างใหม่
            const newReaction = this.commentReactionRepository.create({
                type,
                user,
                comment,
            });
            const savedReaction = await this.commentReactionRepository.save(newReaction);
            savedReaction.user = user;
            comment.commentReactions.push(savedReaction);
        }

        // 5. ลบ findOne สุดท้ายทิ้ง แล้ว return 'comment' ที่เราแก้ใน memory
        return comment;
    }
}