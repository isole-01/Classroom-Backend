# Migration `20200722192905-init`

This migration has been generated by isole-01 at 7/22/2020, 7:29:05 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."Answersheet" (
"answers" integer []  ,
"exam_id" integer  NOT NULL ,
"id" SERIAL,
"student_id" integer  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Course" (
"id" SERIAL,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Exam" (
"course_id" integer  NOT NULL ,
"id" SERIAL,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Owner" (
"course_id" integer  NOT NULL ,
"id" SERIAL,
"person_id" integer  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Person" (
"email" text   ,
"id" SERIAL,
"password" text  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Question" (
"answer" integer  NOT NULL ,
"choices" text []  ,
"exam_id" integer  NOT NULL ,
"id" SERIAL,
"text" text   ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Student" (
"course_id" integer  NOT NULL ,
"id" SERIAL,
"person_id" integer  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE UNIQUE INDEX "Person.email" ON "public"."Person"("email")

ALTER TABLE "public"."Answersheet" ADD FOREIGN KEY ("exam_id")REFERENCES "public"."Exam"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Answersheet" ADD FOREIGN KEY ("student_id")REFERENCES "public"."Student"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Exam" ADD FOREIGN KEY ("course_id")REFERENCES "public"."Course"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Owner" ADD FOREIGN KEY ("course_id")REFERENCES "public"."Course"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Owner" ADD FOREIGN KEY ("person_id")REFERENCES "public"."Person"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Question" ADD FOREIGN KEY ("exam_id")REFERENCES "public"."Exam"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Student" ADD FOREIGN KEY ("course_id")REFERENCES "public"."Course"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Student" ADD FOREIGN KEY ("person_id")REFERENCES "public"."Person"("id") ON DELETE CASCADE  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200722192905-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,66 @@
+generator client {
+  provider = "prisma-client-js"
+}
+
+datasource db {
+  provider = "postgresql"
+  url = "***"
+}
+
+model Answersheet {
+  answers    Int[]
+  exam_id    Int
+  id         Int     @default(autoincrement()) @id
+  student_id Int
+  exam       Exam    @relation(fields: [exam_id], references: [id])
+  student    Student @relation(fields: [student_id], references: [id])
+}
+
+model Course {
+  id      Int       @default(autoincrement()) @id
+  exams    Exam[]
+  owners   Owner[]
+  students Student[]
+}
+
+model Exam {
+  course_id   Int
+  id          Int           @default(autoincrement()) @id
+  course      Course        @relation(fields: [course_id], references: [id])
+  answersheets Answersheet[]
+  questions    Question[]
+}
+
+model Owner {
+  course_id Int
+  id        Int    @default(autoincrement()) @id
+  person_id Int
+  course    Course @relation(fields: [course_id], references: [id])
+  person    Person @relation(fields: [person_id], references: [id])
+}
+
+model Person {
+  email   String?   @unique
+  password String
+  id      Int       @default(autoincrement()) @id
+  owners   Owner[]
+  students Student[]
+}
+
+model Question {
+  answer  Int
+  choices String[]
+  exam_id Int
+  id      Int      @default(autoincrement()) @id
+  text    String?
+  exam    Exam     @relation(fields: [exam_id], references: [id])
+}
+
+model Student {
+  course_id   Int
+  id          Int           @default(autoincrement()) @id
+  person_id   Int
+  course      Course        @relation(fields: [course_id], references: [id])
+  person      Person        @relation(fields: [person_id], references: [id])
+  answersheets Answersheet[]
+}
```

