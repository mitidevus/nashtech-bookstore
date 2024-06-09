/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `authors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "authors" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "books" ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "authors_slug_key" ON "authors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
