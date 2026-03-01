/*
  Warnings:

  - You are about to drop the column `category` on the `Ingredient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ingredient" DROP COLUMN "category";

-- DropEnum
DROP TYPE "IngredientCategory";
