import {ApolloError, AuthenticationError, ForbiddenError} from 'apollo-server-koa';
import {compare} from "../../utils/hash";
import {generateToken} from "../../utils/auth";
import {findUser} from "../../utils/db_functions";
import moment from "moment";

const Query = {
    async login(parent, args, {prisma, ctx}, info) {
        const person = await prisma.person.findOne({
            where: {
                email: args.email
            }
        })
        if (!person) {
            throw new ApolloError("Email Doesn't Exist!")
        }
        const passwordVerified = await compare(args.password, person.password)
        if (passwordVerified) {
            const token = await generateToken({
                email: args.email,
                id: person.id
            })
            // ctx.cookies.set('jwt', token,{maxAge:100000})
            return token
        }
        throw new AuthenticationError('Invalid Credentials')
    },

    async courseLink(parent, args, {ctx, user, prisma}, info) {
        if (user) {
            const exists = await findUser(user.email, prisma)
            if (exists) {
                const courseOwner = await prisma.course.findOne({
                    where: {
                        id: args.courseId
                    },
                }).owner().person()
                if (!courseOwner)
                    throw new ApolloError("This course does not exist")
                if (courseOwner.email === user.email) {
                    return generateToken({
                        courseId: args.courseId
                    })
                } else
                    throw new ForbiddenError("You do not own this course")
            }
        } else
            throw new AuthenticationError("You are not logged in")
    },

    async ownedCourses(parent, args, {ctx, user, prisma}, info) {
        if (user) {
            const person = await findUser(user.email, prisma)
            if (person) {
                return prisma.course.findMany({
                    where: {
                        owner: {
                            person: {
                                id: person.id
                            }
                        }
                    }
                })
            }
        } else
            throw new AuthenticationError("You are not logged in")
    },
    async enrolledCourses(parent, args, {ctx, user, prisma}, info) {
        if (user) {
            const person = await findUser(user.email, prisma)
            if (person) {
                const personStudents = await prisma.student.findMany({
                    where: {
                        person: {
                            id: person.id
                        }
                    },
                    include: {
                        course: true
                    }
                })
                return personStudents.map((student) => {
                    return student.course
                })
            }
        } else
            throw new AuthenticationError("You are not logged in")
    },
    async courseById(parent, args, {ctx, user, prisma}, info) {
        if (user) {
            const exists = await findUser(user.email, prisma)
            if (exists) {
                const courseOwner = await prisma.course.findOne({
                    where: {
                        id: args.courseId
                    },
                }).owner().person()
                if (!courseOwner)
                    throw new ApolloError("This course does not exist")
                if (courseOwner.email === user.email) {
                    const data = await prisma.course.findOne({
                        where: {
                            id: args.courseId
                        }
                    })
                    data.identity = await generateToken({
                        courseId: args.courseId
                    })
                    return data
                } else
                    throw new ForbiddenError("You do not own this course")
            }
        } else
            throw new AuthenticationError("You are not logged in")
    },
    async courseByIdStu(parent, args, {ctx, user, prisma}, info) {
        if (user) {
            const person = await prisma.person.findOne({
                where: {
                    email: user.email
                },
                include: {
                    students: {
                        include: {
                            course: true
                        }

                    }
                }
            });
            const student = person.students.find((student) => {
                return student.course_id === args.courseId
            })
            if (student) {
                ctx.isStudent = true
                return student.course
            }
            throw new ApolloError("The course was not found in your enrolled courses")

        } else
            throw new AuthenticationError("You are not logged in")
    },
    async examById(parent, args, {ctx, user, prisma}, info) {
        if (user) {
            const person = await findUser(user.email, prisma)
            const exam = await prisma.exam.findOne({
                where: {
                    id: args.examId,
                },
                include: {
                    course: {
                        select: {
                            students: true
                        }
                    }
                }
            })
            if (exam) {
                const isEnrolled = exam.course.students.some((student) => {
                    return student.person_id === person.id
                });
                if (isEnrolled) {
                    ctx.isStudent = true
                    const end = moment(exam.date).add(exam.duration, 'minutes')
                    // const end=start.add(parent.duration,'minutes')
                    const now = moment()
                    const remainingTime = end.diff(now, 'ms')
                    if (remainingTime > 0) {
                        exam.remainingTime = remainingTime
                        return exam
                    }
                    throw new ForbiddenError("Exam is not started")
                }
                throw new ForbiddenError("You are not enrolled")
            }
            throw new ApolloError("Invalid exam ID")

        } else
            throw new AuthenticationError("You are not logged in")
    },
    async examByIdOwner(parent, args, {prisma, user, ctx}, info) {
        if (user) {
            const exists = await findUser(user.email, prisma)
            if (exists) {
                const courseOwner = await prisma.exam.findOne({
                    where: {
                        id: args.examId
                    }
                }).course().owner().person()
                if (!courseOwner)
                    throw new ApolloError("Invalid Exam ID")
                if (courseOwner.email === user.email) {
                    const exam = await prisma.exam.findOne({
                        where: {
                            id: args.examId
                        },
                        include: {
                            questions: {
                                select: {
                                    answer: true
                                }
                            }
                        }
                    })
                    ctx.isOwner = true
                    ctx.questions = exam.questions
                    const end = moment(exam.date).add(exam.duration, 'minutes')
                    const now = moment()
                    exam.remainingTime = end.diff(now, 'ms')
                    return exam
                } else
                    throw new ForbiddenError("You do not own this course")
            }
        } else
            throw new AuthenticationError("You are not logged in")
    },
    async examResultStu(parent, args, {prisma, user, ctx}, info) {
        const examId = args.examId
        const person = await findUser(user.email, prisma)
        const students = await prisma.exam.findOne({
            where: {
                id: examId
            }
        }).course().students({
            include: {
                person: true
            }
        })
        let studentId
        let isEnrolled = students.some((student) => {
            if (student.person.id === person.id) {
                studentId = student.id
                return true
            }
        })
        if (isEnrolled) {
            const sheets = await prisma.exam.findOne({
                where: {
                    id: examId
                }
            }).answersheets({
                include: {
                    student: {
                        include: {
                            person: true
                        }
                    }
                }
            })
            let sheet = sheets.find((sheet) => {
                if (sheet.student.id === studentId)
                    return sheet
            })
            if (sheet) {
                const exam = await prisma.exam.findOne({
                    where: {
                        id: args.examId
                    },
                    include: {
                        questions: {
                            select: {
                                answer: true
                            }
                        }
                    }
                })
                const end = moment(exam.date).add(exam.duration, 'minutes')
                const now = moment()
                exam.remainingTime = end.diff(now, 'ms')
                if(exam.remainingTime>0)
                    throw new ForbiddenError("Exam is not finished yet")
                const correctAnswers = exam.questions.map((question) => {
                    return question.answer
                })
                if (sheet.score)
                    return {
                        ...exam,
                        correctAnswers,
                        sheet,
                    }
                let score = 0
                sheet.answers.forEach((personAnswer, index) => {
                    if(personAnswer === correctAnswers[index])
                        score++
                })
                sheet=prisma.answersheet.update({
                    where:{
                        id:sheet.id,
                    },
                    data:{
                        score,
                    }
                })
                return {
                    ...exam,
                    correctAnswers,
                    sheet,
                }

            }
            throw new ApolloError("You have not Submitted")
        }
        throw new ApolloError("You are not enrolled in this course")
    }
}

export default Query;
