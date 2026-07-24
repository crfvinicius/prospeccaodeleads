-- CreateEnum
CREATE TYPE "KanbanStage" AS ENUM ('NOVO', 'CONTATADO', 'RESPONDEU', 'NEGOCIANDO', 'FECHADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "LeadOrigem" AS ENUM ('GOOGLE_PLACES', 'UPLOAD_XLSX', 'UPLOAD_MARKDOWN', 'MANUAL');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('ENVIADA', 'RECEBIDA');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDENTE', 'ENVIADA', 'ENTREGUE', 'LIDA', 'FALHOU');

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL,
    "localidade" TEXT NOT NULL,
    "nicho" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "avaliacaoMinima" DOUBLE PRECISION,
    "somenteComSite" BOOLEAN,
    "somenteComWhatsapp" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "endereco" TEXT,
    "localidade" TEXT,
    "nicho" TEXT,
    "avaliacaoGoogle" DOUBLE PRECISION,
    "totalAvaliacoes" INTEGER,
    "site" TEXT,
    "temSite" BOOLEAN NOT NULL DEFAULT false,
    "temWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "origem" "LeadOrigem" NOT NULL DEFAULT 'MANUAL',
    "estagio" "KanbanStage" NOT NULL DEFAULT 'NOVO',
    "googlePlaceId" TEXT,
    "observacoes" TEXT,
    "searchQueryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "direcao" "MessageDirection" NOT NULL,
    "conteudo" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_googlePlaceId_key" ON "Lead"("googlePlaceId");

-- CreateIndex
CREATE INDEX "Lead_estagio_idx" ON "Lead"("estagio");

-- CreateIndex
CREATE INDEX "Lead_localidade_idx" ON "Lead"("localidade");

-- CreateIndex
CREATE INDEX "Lead_nicho_idx" ON "Lead"("nicho");

-- CreateIndex
CREATE INDEX "Message_leadId_idx" ON "Message"("leadId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_searchQueryId_fkey" FOREIGN KEY ("searchQueryId") REFERENCES "SearchQuery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
