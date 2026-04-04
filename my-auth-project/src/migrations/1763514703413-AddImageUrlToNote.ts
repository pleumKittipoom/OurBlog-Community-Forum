import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageUrlToNote1763514703413 implements MigrationInterface {
    name = 'AddImageUrlToNote1763514703413'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "note" ADD "imageUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "imageUrl"`);
    }

}
