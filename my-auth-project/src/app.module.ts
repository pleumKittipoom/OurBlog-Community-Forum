// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
// import { User } from './user/user.entity'; 
import { NoteModule } from './note/note.module';
// import { Note } from './note/note.entity';     
import { AdminModule } from './admin/admin.module';
import { ReactionModule } from './reaction/reaction.module'; 
// import { Reaction } from './reaction/reaction.entity';
import { CommentModule } from './comment/comment.module';
// import { Comment } from './comment/comment.entity';
import { CommentReactionModule } from './comment-reaction/comment-reaction.module';
// import { CommentReaction } from './comment-reaction/comment-reaction.entity';



@Module({
  imports: [
    // โหลด ConfigModule ก่อน (isGlobal: true เพื่อให้ใช้ได้ทุกที่)
    ConfigModule.forRoot({ isGlobal: true }),

    // ตั้งค่า TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule มาใช้
      inject: [ConfigService], // ฉีด ConfigService เข้ามา
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        // entities: [User, Note, Reaction, Comment, CommentReaction], // ระบุ Entity ที่จะใช้
        synchronize: false, 
        autoLoadEntities: true,

        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      }),
    }),
    
    // Import Modules
    UserModule,
    AuthModule,
    NoteModule,
    AdminModule,
    ReactionModule,
    CommentModule,
    CommentReactionModule,
  ],
})
export class AppModule {}