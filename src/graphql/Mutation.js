import {hasher} from '../../utils/hash'
import {ApolloError, AuthenticationError, ForbiddenError} from 'apollo-server-koa'
import {coursePersons, findUser} from "../../utils/db_functions";
import {validateToken} from "../../utils/auth";
import moment from "moment";

const Mutation = {
    async createUser(parent, args, {prisma, user}, info) {
        const exists = await findUser(args.email, prisma)
        if (!exists) {
            const user = {
                email: args.email,
                name: args.name,
                password: await hasher(args.password)
            }
            return await prisma.person.create({data: user})
        }
        throw new ApolloError('Email Already Exists!')
    },
    async createCourse(parent, args, {prisma, user}, info) {
        const us = await findUser(user.email, prisma)
        if (us) {
            const data = {
                name: args.name,
                startdate: args.startDate,
                description: args.description,
                owner: {
                    create: {
                        person: {
                            connect: {
                                email: user.email
                            }
                        }
                    }
                },
            }
            return prisma.course.create({data})
        }
        throw new AuthenticationError('You ARE NOT LOGGED IN!!!!!!!')
    },
    async addExam(parent, args, {prisma, user}, info) {
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
                    const data = {
                        date: args.date,
                        title: args.title,
                        duration: args.duration,
                        questions: {
                            create: args.questions.map(el => {
                                return {
                                    text: el.text,
                                    answer: el.answer,
                                    choices: {set: el.choices}
                                }
                            })
                        },
                        course: {
                            connect: {
                                id: args.courseId
                            }
                        }
                    }

                    return prisma.exam.create({
                        data
                    })
                } else
                    throw new ForbiddenError("You do not own this course")
            }
        } else
            throw new AuthenticationError("You are not logged in")
    },
    async enroll(parent, args, {prisma, user}, info) {
        if (user) {
            const person = await findUser(user.email, prisma)
            if(person){

                const {courseId} = await validateToken(args.identifier).catch((err) => {
                    throw new ApolloError("Invalid Link")
                })
                const students = await coursePersons(courseId, prisma)
                students.forEach((student) => {
                    if (student.person.id === person.id) {
                        throw new ApolloError("You have already enrolled")
                    }
                })
                return prisma.student.create({
                    data: {
                        course: {
                            connect: {
                                id: courseId
                            }
                        },
                        person: {
                            connect: {
                                id: person.id
                            }
                        }
                    }
                })
            }throw new AuthenticationError("invalid user")
        }
        throw new AuthenticationError("You are not logged in")
    }
    ,
    async fillExam(parent, args, {prisma, user}, info) {
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
            //check if the bastard has submitted before
            const sheets = await prisma.exam.findOne({
                where: {
                    id: examId
                }
            }).answersheets({
                include: {
                    student: true
                }
            })
            const hasSubmitted = sheets.some((sheet) => {
                if (sheet.student.id === studentId)
                    return true
            })
            if (!hasSubmitted) {
                const exam = await prisma.exam.findOne({
                    where: {
                        id: examId
                    }
                })
                let start = moment(exam.date)
                let end = start.add(parseInt(exam.duration), 'minutes')
                if (end.diff(moment()) >= 0)
                    return prisma.answersheet.create({
                        data: {
                            date: moment().toISOString(),
                            answers: {
                                set: args.answers
                            },
                            exam: {
                                connect: {
                                    id: examId
                                }
                            },
                            student: {
                                connect: {
                                    id: studentId
                                }
                            }
                        }
                    })
                throw new ApolloError("Time's up bitch!!")
            }
            throw new ApolloError("You have already submitted")
        }
        throw new ApolloError("You are not enrolled in this course")
    }


}
export default Mutation;
