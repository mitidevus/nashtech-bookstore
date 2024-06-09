/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `promotion_lists` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "promotion_lists" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "promotion_lists_slug_key" ON "promotion_lists"("slug");
