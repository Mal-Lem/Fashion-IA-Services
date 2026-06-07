-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_design_id_fkey";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "description" TEXT,
ALTER COLUMN "design_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "designs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
