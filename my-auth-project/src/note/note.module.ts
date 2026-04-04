// src/note/note.module.ts
import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './note.entity';
import { ReactionModule } from 'src/reaction/reaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Note]),
    ReactionModule,
  ],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}