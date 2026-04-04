// src/note/note.controller.ts
import {
    Controller, Get, Post, Body, Delete, Param, UseGuards, Req, Patch,
    Query, ParseIntPipe, DefaultValuePipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NoteService } from './note.service';
import type { Request } from 'express';
import { ReactionService } from 'src/reaction/reaction.service';
import { ReactionType } from 'src/reaction/reaction.entity';


@UseGuards(AuthGuard('jwt'))
@Controller('note')
export class NoteController {
    constructor(
        private readonly noteService: NoteService,
        private readonly reactionService: ReactionService,
    ) { }

    // POST /note
    @Post()
    create(
        @Body('title') title: string,
        @Body('content') content: string,
        @Body('imageUrl') imageUrl: string,
        @Req() req: Request, // ดึง Request ทั้งหมด
    ) {
        // req.user ถูกแนบเข้ามาโดย JwtStrategy
        const user = (req as any).user;
        return this.noteService.create(title, content, imageUrl, user);
    }

    // GET /note
    @Get()
    findMyNotes(@Req() req: Request) {
        const user = (req as any).user;
        return this.noteService.findAllForUser(user);
    }

    // GET /note/all
    @Get('all')
    findAllPublic(
        // (รับค่า ?page=... ถ้าไม่มี ให้ใช้ 1)
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        // (รับค่า ?limit=... ถ้าไม่มี ให้ใช้ 5)
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
        // (รับค่า ?sortBy=... ถ้าไม่มี ให้ใช้ 'createdAt')
        @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy: string,
        // (รับค่า ?sortOrder=... ถ้าไม่มี ให้ใช้ 'DESC' = ใหม่สุด)
        @Query('sortOrder', new DefaultValuePipe('DESC')) sortOrder: 'ASC' | 'DESC',
        // Query Param สำหรับการค้นหา
        @Query('search', new DefaultValuePipe('')) search: string,
    ) {
        return this.noteService.findAllPublic({ page, limit, sortBy, sortOrder, search });
    }

    // DELETE /note/:id
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: Request) {
        const user = (req as any).user;
        return this.noteService.remove(+id, user);
    }

    // PATCH /note/:id
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Req() req: Request,
        @Body('title') title: string,
        @Body('content') content: string,
        @Body('imageUrl') imageUrl: string,
    ) {
        const user = (req as any).user;
        return this.noteService.update(+id, user, title, content, imageUrl);
    }

    // POST /note/:id/react
    @Post(':id/react')
    setReaction(
        @Param('id') id: string,
        @Req() req: Request,
        @Body('type') type: ReactionType, // รับ 'type' จาก body
    ) {
        const user = (req as any).user;
        return this.reactionService.setReaction(+id, user, type);
    }

    // GET /note/:id (ดึงโน้ต 1 ชิ้น)
    @Get(':id')
    findOnePublic(@Param('id') id: string) {
        return this.noteService.findOnePublic(+id);
    }
}