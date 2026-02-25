/*
  Warnings:

  - The values [VEGETABLE,FRUIT,MEAT,DAIRY,GRAIN,SPICE,OTHER] on the enum `IngredientCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IngredientCategory_new" AS ENUM ('vegetable', 'fruit', 'meat', 'dairy', 'grain', 'spice', 'other');
ALTER TABLE "Ingredient" ALTER COLUMN "category" TYPE "IngredientCategory_new" USING ("category"::text::"IngredientCategory_new");
ALTER TYPE "IngredientCategory" RENAME TO "IngredientCategory_old";
ALTER TYPE "IngredientCategory_new" RENAME TO "IngredientCategory";
DROP TYPE "public"."IngredientCategory_old";
COMMIT;
