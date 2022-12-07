CREATE TABLE "Person" (
	id SERIAL PRIMARY KEY,
	password VARCHAR (80),

	email VARCHAR (50) UNIQUE


);

CREATE TABLE "Student"(
	id SERIAL PRIMARY KEY,

	course_id BIGINT NOT NULL,
	person_id BIGINT NOT NULL



);


CREATE TABLE "Owner"(
	id SERIAL PRIMARY KEY,

	course_id BIGINT NOT NULL,
	person_id BIGINT NOT NULL




);


CREATE TABLE "Course"(
	id SERIAL PRIMARY KEY

);


CREATE TABLE "Exam"(
	id SERIAL PRIMARY KEY,

	course_id BIGINT NOT NULL

);


CREATE TABLE "Question"(
	id SERIAL PRIMARY KEY,

	answer INTEGER NOT NULL,
	text VARCHAR (400),
	choices Text [],

	exam_id BIGINT NOT NULL


);

CREATE TABLE "Answersheet"(
	id SERIAL PRIMARY KEY,


	answers INTEGER [],

	exam_id BIGINT NOT NULL,

	student_id BIGINT NOT NULL


);
