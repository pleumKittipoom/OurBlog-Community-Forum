import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from 'src/note/note.entity';
import { OneToMany } from 'typeorm';
import { Reaction } from '../reaction/reaction.entity';
import { Comment } from '../comment/comment.entity';
import { CommentReaction } from '../comment-reaction/comment-reaction.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) //ไม่ต้องดึงรหัสผ่านออกมาโชว์ตอน Query ปกติ
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER, //ผู้ใช้ใหม่ทุกคน default เป็น 'user'
  })
  role: UserRole;

  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: Reaction[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => CommentReaction, (commentReaction) => commentReaction.user)
  commentReactions: CommentReaction[];

}