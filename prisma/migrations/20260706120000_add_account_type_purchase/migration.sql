-- AlterTable: Account - add full account fields
ALTER TABLE "Account" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'profile';
ALTER TABLE "Account" ADD COLUMN "isOccupied" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Account" ADD COLUMN "assignedToId" INTEGER;
ALTER TABLE "Account" ADD COLUMN "assignedAt" TIMESTAMP(3);
ALTER TABLE "Account" ADD CONSTRAINT "Account_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: Purchase - make profileId optional, add accountId
ALTER TABLE "Purchase" ALTER COLUMN "profileId" DROP NOT NULL;
ALTER TABLE "Purchase" ADD COLUMN "accountId" INTEGER;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_accountId_key" UNIQUE ("accountId");
