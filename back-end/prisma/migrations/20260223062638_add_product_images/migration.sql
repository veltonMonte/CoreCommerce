/*
  Warnings:

  - Added the required column `hoverImage` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mainImage` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "hoverImage" TEXT NOT NULL,
ADD COLUMN     "mainImage" TEXT NOT NULL;
