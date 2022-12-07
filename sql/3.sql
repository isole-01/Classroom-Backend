ALTER TABLE "Student" ADD CONSTRAINT stu_user_fkey  FOREIGN KEY (person_id) REFERENCES "Person" (id);
ALTER TABLE "Student" ADD CONSTRAINT stu_course_fkey  FOREIGN KEY (course_id) REFERENCES "Course" (id);

ALTER TABLE "Owner" ADD CONSTRAINT owner_user_fkey  FOREIGN KEY (person_id) REFERENCES "Person" (id);
ALTER TABLE "Owner" ADD CONSTRAINT owner_course_fkey  FOREIGN KEY (course_id) REFERENCES "Course" (id);

ALTER TABLE "Exam" ADD CONSTRAINT exam_course_fkey  FOREIGN KEY (course_id) REFERENCES "Course" (id);

ALTER TABLE "Question" ADD CONSTRAINT question_exam_fkey  FOREIGN KEY (exam_id) REFERENCES "Exam" (id);

ALTER TABLE "Answersheet" ADD CONSTRAINT answersheet_exam_fkey  FOREIGN KEY (exam_id) REFERENCES "Exam" (id);
ALTER TABLE "Answersheet" ADD CONSTRAINT answersheet_stu_fkey  FOREIGN KEY (student_id) REFERENCES "Student" (id);




