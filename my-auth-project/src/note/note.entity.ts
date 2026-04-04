// src/note/note.entity.ts
import { User } from 'src/user/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Reaction } from '../reaction/reaction.entity';
import { Comment } from '../comment/comment.entity';


@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  imageUrl: string;

  // สร้างความสัมพันธ์: โน้ต "หลาย" อัน เป็นของ User "หนึ่ง" คน
  @ManyToOne(() => User, (user) => user.notes)
  user: User;

  @OneToMany(() => Reaction, (reaction) => reaction.note)
  reactions: Reaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.note)
  comments: Comment[];
}