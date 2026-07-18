-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETE');

-- CreateEnum
CREATE TYPE "JourneyMediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "JourneyMediaRole" AS ENUM ('COVER', 'HERO', 'GALLERY', 'INSPECTION', 'DETAIL', 'PACKAGING', 'DISPATCH', 'CERTIFICATE', 'CARE_GUIDE', 'INVOICE');

-- CreateEnum
CREATE TYPE "AuthorType" AS ENUM ('ADMIN', 'SYSTEM', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "StageEventType" AS ENUM ('STAGE_STARTED', 'STATUS_CHANGED', 'MEDIA_ADDED', 'MESSAGE_POSTED', 'STAGE_PUBLISHED', 'STAGE_COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('STAGE_PUBLISHED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'PUBLISHER', 'VIEWER');

-- CreateTable
CREATE TABLE "crafttrack_customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crafttrack_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crafttrack_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crafttrack_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crafttrack_journey_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crafttrack_journey_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crafttrack_template_stages" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "crafttrack_template_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crafttrack_journeys" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "journeyTemplateId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productSlug" TEXT,
    "currentStageId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crafttrack_journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crafttrack_journey_stages" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "templateStageId" TEXT,
    "sequence" INTEGER NOT NULL,
    "draftName" TEXT NOT NULL,
    "draftMessage" TEXT,
    "draftStatus" "StageStatus" NOT NULL DEFAULT 'PENDING',
    "publishedName" TEXT,
    "publishedMessage" TEXT,
    "publishedStatus" "StageStatus",
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,

    CONSTRAINT "crafttrack_journey_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crafttrack_journey_media" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT,
    "stageId" TEXT,
    "mediaType" "JourneyMediaType" NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "altText" TEXT,
    "role" "JourneyMediaRole" NOT NULL DEFAULT 'GALLERY',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "crafttrack_journey_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crafttrack_journey_messages" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorType" "AuthorType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crafttrack_journey_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crafttrack_stage_events" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "type" "StageEventType" NOT NULL,
    "summary" TEXT,
    "fromStatus" "StageStatus",
    "toStatus" "StageStatus",
    "snapshot" JSONB,
    "visibleToCustomer" BOOLEAN NOT NULL DEFAULT false,
    "actor" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crafttrack_stage_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crafttrack_notifications" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'STAGE_PUBLISHED',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'EMAIL',
    "recipientEmail" TEXT NOT NULL,
    "stageId" TEXT,
    "stageName" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'SENT',
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crafttrack_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crafttrack_admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crafttrack_admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crafttrack_customers_email_key" ON "crafttrack_customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "crafttrack_orders_orderNumber_key" ON "crafttrack_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "crafttrack_orders_customerId_idx" ON "crafttrack_orders"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "crafttrack_journey_templates_name_key" ON "crafttrack_journey_templates"("name");

-- CreateIndex
CREATE INDEX "crafttrack_template_stages_templateId_idx" ON "crafttrack_template_stages"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "crafttrack_journeys_currentStageId_key" ON "crafttrack_journeys"("currentStageId");

-- CreateIndex
CREATE INDEX "crafttrack_journeys_orderId_idx" ON "crafttrack_journeys"("orderId");

-- CreateIndex
CREATE INDEX "crafttrack_journeys_journeyTemplateId_idx" ON "crafttrack_journeys"("journeyTemplateId");

-- CreateIndex
CREATE INDEX "crafttrack_journey_stages_journeyId_idx" ON "crafttrack_journey_stages"("journeyId");

-- CreateIndex
CREATE INDEX "crafttrack_journey_media_journeyId_idx" ON "crafttrack_journey_media"("journeyId");

-- CreateIndex
CREATE INDEX "crafttrack_journey_media_stageId_idx" ON "crafttrack_journey_media"("stageId");

-- CreateIndex
CREATE INDEX "crafttrack_journey_messages_journeyId_idx" ON "crafttrack_journey_messages"("journeyId");

-- CreateIndex
CREATE INDEX "crafttrack_stage_events_stageId_idx" ON "crafttrack_stage_events"("stageId");

-- CreateIndex
CREATE INDEX "crafttrack_notifications_journeyId_idx" ON "crafttrack_notifications"("journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "crafttrack_admin_users_email_key" ON "crafttrack_admin_users"("email");

-- AddForeignKey
ALTER TABLE "crafttrack_orders" ADD CONSTRAINT "crafttrack_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crafttrack_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crafttrack_template_stages" ADD CONSTRAINT "crafttrack_template_stages_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "crafttrack_journey_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crafttrack_journeys" ADD CONSTRAINT "crafttrack_journeys_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "crafttrack_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crafttrack_journeys" ADD CONSTRAINT "crafttrack_journeys_journeyTemplateId_fkey" FOREIGN KEY ("journeyTemplateId") REFERENCES "crafttrack_journey_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crafttrack_journeys" ADD CONSTRAINT "crafttrack_journeys_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "crafttrack_journey_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crafttrack_journey_stages" ADD CONSTRAINT "crafttrack_journey_stages_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "crafttrack_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crafttrack_journey_media" ADD CONSTRAINT "crafttrack_journey_media_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "crafttrack_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crafttrack_journey_media" ADD CONSTRAINT "crafttrack_journey_media_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "crafttrack_journey_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crafttrack_journey_messages" ADD CONSTRAINT "crafttrack_journey_messages_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "crafttrack_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crafttrack_stage_events" ADD CONSTRAINT "crafttrack_stage_events_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "crafttrack_journey_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crafttrack_notifications" ADD CONSTRAINT "crafttrack_notifications_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "crafttrack_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
