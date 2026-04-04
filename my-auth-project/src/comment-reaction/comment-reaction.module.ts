// src/comment-reaction/comment-reaction.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentReactionService } from './comment-reaction.service';
import { CommentReactionController } from './comment-reaction.controller';
import { CommentReaction } from './comment-reaction.entity';
import { Comment } from '../comment/comment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CommentReaction, Comment])],
    providers: [CommentReactionService],
    controllers: [CommentReactionController],
})
export class CommentReactionModule { }