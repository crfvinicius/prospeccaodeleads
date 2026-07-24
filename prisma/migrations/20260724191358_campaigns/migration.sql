-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('RODANDO', 'PAUSADA', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "CampaignLeadStatus" AS ENUM ('PENDENTE', 'ENVIADO', 'FALHOU', 'PULADO');

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'RODANDO',
    "intervaloMinSegundos" INTEGER NOT NULL DEFAULT 8,
    "intervaloMaxSegundos" INTEGER NOT NULL DEFAULT 20,
    "totalLeads" INTEGER NOT NULL,
    "enviados" INTEGER NOT NULL DEFAULT 0,
    "falhas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignLead" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "status" "CampaignLeadStatus" NOT NULL DEFAULT 'PENDENTE',
    "messageId" TEXT,
    "erro" TEXT,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "CampaignLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignLead_campaignId_idx" ON "CampaignLead"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignLead_campaignId_leadId_key" ON "CampaignLead"("campaignId", "leadId");

-- AddForeignKey
ALTER TABLE "CampaignLead" ADD CONSTRAINT "CampaignLead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignLead" ADD CONSTRAINT "CampaignLead_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
