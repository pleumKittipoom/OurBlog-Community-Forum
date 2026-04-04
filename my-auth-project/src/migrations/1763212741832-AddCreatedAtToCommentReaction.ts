import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAtToCommentReaction1763212741832 implements MigrationInterface {
    name = 'AddCreatedAtToCommentReaction1763212741832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment_reaction" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment_reaction" DROP COLUMN "createdAt"`);
    }

}
