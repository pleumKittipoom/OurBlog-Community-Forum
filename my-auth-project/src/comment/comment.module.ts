// src/comment/comment.module.ts
import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { Note } from 'src/note/note.entity';  
import { CommentReaction } from 'src/comment-reaction/comment-reaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Note, CommentReaction])],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}