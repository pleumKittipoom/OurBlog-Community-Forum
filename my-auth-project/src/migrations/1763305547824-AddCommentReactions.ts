import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommentReactions1763305547824 implements MigrationInterface {
    name = 'AddCommentReactions1763305547824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment_reaction" DROP CONSTRAINT "FK_92536a1358ea6b6611812f62f3a"`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" DROP CONSTRAINT "FK_88bb607240417f03c0592da6824"`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."comment_reaction_type_enum" AS ENUM('like', 'dislike')`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" ADD "type" "public"."comment_reaction_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" ADD CONSTRAINT "FK_92536a1358ea6b6611812f62f3a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" ADD CONSTRAINT "FK_88bb607240417f03c0592da6824" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment_reaction" DROP CONSTRAINT "FK_88bb607240417f03c0592da6824"`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" DROP CONSTRAINT "FK_92536a1358ea6b6611812f62f3a"`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."comment_reaction_type_enum"`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" ADD "type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" ADD CONSTRAINT "FK_88bb607240417f03c0592da6824" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_reaction" ADD CONSTRAINT "FK_92536a1358ea6b6611812f62f3a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
