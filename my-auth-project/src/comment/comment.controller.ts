// src/comment/comment.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentService } from './comment.service';
import type { Request } from 'express';

// 🚀 สร้าง DTO สำหรับ Body
class CreateCommentDto {
  content: string;
  parentId?: number;
}

@Controller('comment')
@UseGuards(AuthGuard('jwt')) 
export class CommentController {
  constructor(private commentService: CommentService) { }

  // GET /comment/note/:noteId (ดึง Comment ของ Note)
  @Get('note/:noteId')
  getCommentsForNote(@Param('noteId') noteId: string) {
    return this.commentService.getForNote(+noteId);
  }

  // POST /comment/note/:noteId (สร้าง Comment)
  @Post('note/:noteId')
  createComment(
    @Param('noteId') noteId: string,
    @Body() body: CreateCommentDto, 
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const { content, parentId } = body;
    return this.commentService.create(+noteId, content, user, parentId);
  }
}