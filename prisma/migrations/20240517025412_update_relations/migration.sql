/*
  Warnings:

  - You are about to drop the column `author_id` on the `books` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "fk_book_author";

-- AlterTable
ALTER TABLE "books" DROP COLUMN "author_id";
