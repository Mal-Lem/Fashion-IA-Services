-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" VARCHAR(20),
ADD COLUMN     "morphology_json" JSONB NOT NULL DEFAULT '{}';
