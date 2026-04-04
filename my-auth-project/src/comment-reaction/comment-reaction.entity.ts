// src/comment-reaction/comment-reaction.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { User } from '../user/user.entity';
import { Comment } from '../comment/comment.entity';


@Unique(['user', 'comment'])
@Entity()
export class CommentReaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: ['like', 'dislike'],
    })
    type: 'like' | 'dislike';

    @ManyToOne(() => User, (user) => user.commentReactions, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Comment, (comment) => comment.commentReactions, { onDelete: 'CASCADE' })
    comment: Comment;
}