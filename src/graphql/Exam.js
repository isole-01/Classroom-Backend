import moment from "moment";
import {ForbiddenError} from "apollo-server-koa"
import {ApolloError} from "apollo-server-errors";

const Exam = {
    questions(parent, args, {prisma, user, ctx}, info) {
        if (ctx.isOwner) {
            return ctx.questions
        } else {
            const start = moment(parent.date)
            // const end=start.add(parent.duration,'minutes')
            const now = moment()
            const delta = now.diff(start)
            if (delta > 0)
                return prisma.question.findMany({
                    where: {
                        exam: {
                            id: parent.id
                        }
                    },
                    select: {
                        choices: true,
                        text: true
                    }
                })
            else throw new ForbiddenError("The exam has not been started yet!")
        }
    },
    async answersheets(parent, args, {prisma, user, ctx}, info) {
        if (parent.remainingTime < 0) {
            if (ctx.isOwner) {

                const sheets = await prisma.answersheet.findMany({
                    where: {
                        exam_id: parent.id
                    },
                    include:{
                        student:true
                    }
                })
                if (parent.isCalculated) {
                    return sheets
                }
                console.log(parent)
                const correctAnswers = parent.questions.map((question)=>{
                    return question.answer
                })
                let last=0
                sheets.map((sheet) => {
                    let score = 0
                    sheet.answers.forEach((personAnswer, index) => {
                        if(personAnswer === correctAnswers[index])
                            score++
                    })
                    last=prisma.answersheet.update({
                        where:{
                            id:sheet.id,
                        },
                        data:{
                            score,
                        }
                    })
                })
                let b=await last
                b= await prisma.exam.update({
                    where:{
                        id:parent.id
                    },
                    data:{
                        isCalculated:true
                    }
                })
                return prisma.answersheet.findMany({
                    where: {
                        exam_id: parent.id
                    },
                    include:{
                        student:{
                            person:true
                        }
                    }
                })

            }
        }
        throw new ApolloError("The exam is not finished yet")
    }


}
export default Exam
