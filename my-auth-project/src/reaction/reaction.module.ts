import { Module } from '@nestjs/common';
import { ReactionService } from './reaction.service'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reaction } from './reaction.entity'; 
import { Note } from 'src/note/note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction, Note])],
  providers: [ReactionService], 
  exports: [ReactionService], 
})
export class ReactionModule {} 