/*
  Warnings:

  - You are about to drop the column `discountPercentage` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `discountPrice` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `soldQuantity` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `totalReviews` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `totalStars` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `orders` table. All the data in the column will be lost.
  - Added the required column `total_price` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "books" DROP COLUMN "discountPercentage",
DROP COLUMN "discountPrice",
DROP COLUMN "soldQuantity",
DROP COLUMN "totalReviews",
DROP COLUMN "totalStars",
ADD COLUMN     "avg_stars" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discount_percentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "discount_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sold_quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_reviews" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "totalPrice",
ADD COLUMN     "total_price" DOUBLE PRECISION NOT NULL;
