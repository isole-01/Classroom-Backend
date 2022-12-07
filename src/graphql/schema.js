import {gql} from "apollo-server-koa";

const typeDefs = gql`
    type Answersheet {
        answers: [Int]
        score:  Int
        exam:    Exam
        id:      ID
        student: Student
    }

    type Course {
        id:      ID
        name:    String
        identity: String
        description: String
        startdate: String
        exams:examsOut
        owners:   [Owner]
        students: [Student]
    }
    
    type examsOut{
        upcomingExams:[Exam]
        finishedExams:[Exam]
    }

    type Exam{
        id:          ID
        course:      Course
        title:  String
        date:   String
        remainingTime:  Int
        duration:   Int
        answersheets: [Answersheet]
        questions:    [Question]
    }

    type Owner {
        id:     ID
        course: Course
        person: Person
    }

    type Person {
        email:   String
        name:  String
        id:      Int
        owners:   [Owner]
        students: [Student]
    }

    type Question {
        id:    ID
        answer:  Int
        choices: [String]
        text:    String
        exam:    Exam
    }

    type Student {
        id:          ID
        course:      Course
        person:      Person
        answersheets: [Answersheet]
    }
    type Query {
        login(email:String!,password:String!):String
        logout:Int
        test:Int
        courseLink(courseId:Int!):String
        ownedCourses:[Course]!
        enrolledCourses:[Course]
        courseById(courseId:Int!):Course
        courseByIdStu(courseId:Int!):Course
        examById(examId:Int!):Exam
        examByIdOwner(examId:Int!):Exam
        examResultStu(examId:Int!):Result
    }

    type Mutation{
        createUser(email:String!,password:String!,name:String!): Person
        createCourse(name:String!,startDate:String!,description:String): Course
        addExam(title:String!,duration:Int!,courseId:Int!,questions:[QuestionIn!]!,date:String!):Exam
        enroll(identifier:String!):Course
        fillExam(examId:Int!,answers:[Int!]!):Exam
    }
    input QuestionIn{
        text:String!
        choices:[String!]!
        answer:Int!
    }
    type Result{
        title:  String
        date:   String
        duration:   Int
        correctAnswers:[Int]
        sheet:Answersheet
    }
`;

export default typeDefs;
