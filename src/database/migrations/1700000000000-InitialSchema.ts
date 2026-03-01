import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(100) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "programs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" text NOT NULL,
        "description" text NOT NULL,
        "type" text NOT NULL CHECK ("type" IN ('podcast', 'documentary')),
        "category_id" uuid NOT NULL,
        "language" varchar(5) NOT NULL,
        "duration" int,
        "published_at" timestamptz,
        "source" text,
        "external_program_id" text,
        "search_vector" tsvector,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_programs_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_programs_source_external" UNIQUE ("source", "external_program_id"),
        CONSTRAINT "FK_programs_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "episodes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "program_id" uuid NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "duration" int NOT NULL,
        "published_at" timestamptz NOT NULL,
        "source" text,
        "source_id" text,
        "search_vector" tsvector,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_episodes_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_episodes_source_source_id" UNIQUE ("source", "source_id"),
        CONSTRAINT "FK_episodes_program" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "idx_program_search_vector" ON "programs" USING GIN("search_vector")',
    );

    await queryRunner.query(
      'CREATE INDEX "idx_episode_search_vector" ON "episodes" USING GIN("search_vector")',
    );

    await queryRunner.query(
      'CREATE INDEX "idx_episode_program_id" ON "episodes" ("program_id")',
    );

    await queryRunner.query(
      'CREATE INDEX "idx_episode_published_at" ON "episodes" ("published_at" DESC)',
    );

    await queryRunner.query(
      'CREATE INDEX "idx_program_published_at" ON "programs" ("published_at" DESC)',
    );

    await queryRunner.query(
      'CREATE INDEX "idx_program_category_language_created" ON "programs" ("category_id", "language", "created_at" DESC)',
    );

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_program_search_vector() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := to_tsvector('simple', coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, ''));
        RETURN NEW;
      END
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trig_update_program_search_vector
      BEFORE INSERT OR UPDATE ON "programs"
      FOR EACH ROW
      EXECUTE FUNCTION update_program_search_vector();
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_episode_search_vector() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := to_tsvector('simple', coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, ''));
        RETURN NEW;
      END
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trig_update_episode_search_vector
      BEFORE INSERT OR UPDATE ON "episodes"
      FOR EACH ROW
      EXECUTE FUNCTION update_episode_search_vector();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS trig_update_episode_search_vector ON "episodes"',
    );
    await queryRunner.query(
      'DROP FUNCTION IF EXISTS update_episode_search_vector()',
    );
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS trig_update_program_search_vector ON "programs"',
    );
    await queryRunner.query(
      'DROP FUNCTION IF EXISTS update_program_search_vector()',
    );
    await queryRunner.query('DROP TABLE "episodes"');
    await queryRunner.query('DROP TABLE "programs"');
    await queryRunner.query('DROP TABLE "categories"');
  }
}
