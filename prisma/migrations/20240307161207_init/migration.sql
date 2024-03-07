-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "lastDaily" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId","guildId")
);
