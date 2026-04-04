// src/comment-reaction/comment-reaction.controller.ts
import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentReactionService } from './comment-reaction.service';
import type { Request } from 'express';

class CreateCommentReactionDto {
    type: 'like' | 'dislike';
}

@Controller('comment/:commentId/react')
@UseGuards(AuthGuard('jwt'))
export class CommentReactionController {
    constructor(private commentReactionService: CommentReactionService) { }

    @Post()
    async reactToComment(
        @Param('commentId') commentId: string,
        @Body() body: CreateCommentReactionDto,
        @Req() req: Request,
    ) {
        const user = (req as any).user;
        return this.commentReactionService.reactToComment(+commentId, body.type, user);
    }
}