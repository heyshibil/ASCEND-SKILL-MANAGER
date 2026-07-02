-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('mcq', 'code');

-- CreateEnum
CREATE TYPE "QuestionLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "questionId" VARCHAR(30) NOT NULL,
    "skill" VARCHAR(50) NOT NULL,
    "level" "QuestionLevel" NOT NULL,
    "topic" VARCHAR(200) NOT NULL,
    "type" "QuestionType" NOT NULL,
    "question" TEXT,
    "options" TEXT[],
    "correctAnswerIndex" INTEGER,
    "starterCode" TEXT,
    "validationScript" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTestCase" (
    "id" SERIAL NOT NULL,
    "questionPk" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,

    CONSTRAINT "QuestionTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Question_questionId_key" ON "Question"("questionId");

-- CreateIndex
CREATE INDEX "Question_skill_idx" ON "Question"("skill");

-- CreateIndex
CREATE INDEX "Question_level_idx" ON "Question"("level");

-- CreateIndex
CREATE INDEX "Question_skill_level_idx" ON "Question"("skill", "level");

-- CreateIndex
CREATE INDEX "Question_type_idx" ON "Question"("type");

-- CreateIndex
CREATE INDEX "Question_skill_level_type_idx" ON "Question"("skill", "level", "type");

-- CreateIndex
CREATE INDEX "QuestionTestCase_questionPk_idx" ON "QuestionTestCase"("questionPk");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTestCase_questionPk_sortOrder_key" ON "QuestionTestCase"("questionPk", "sortOrder");

-- AddForeignKey
ALTER TABLE "QuestionTestCase" ADD CONSTRAINT "QuestionTestCase_questionPk_fkey" FOREIGN KEY ("questionPk") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
