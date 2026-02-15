/*
  Warnings:

  - Added the required column `tokenPrefix` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "tokenPrefix" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "RefreshToken_tokenPrefix_idx" ON "RefreshToken"("tokenPrefix");
