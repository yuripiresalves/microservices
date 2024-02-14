/*
  Warnings:

  - Added the required column `purchaseId` to the `Access` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Access` ADD COLUMN `purchaseId` VARCHAR(191) NOT NULL;
