// src/comment/comment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, Tree, TreeChildren, TreeParent } from 'typeorm';
import { User } from '../user/user.entity';
import { Note } from '../note/note.entity';
import { CommentReaction } from '../comment-reaction/comment-reaction.entity';


@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Note, (note) => note.comments)
  note: Note;

  @ManyToOne(() => Comment, (comment) => comment.children, { nullable: true, onDelete: 'CASCADE' })
  parent: Comment | null;

  // Comment นี้มีลูกใครบ้าง
  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];

  @OneToMany(() => CommentReaction, (commentReaction) => commentReaction.comment)
  commentReactions: CommentReaction[];

}