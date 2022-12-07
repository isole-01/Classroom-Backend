import moment from "moment";

const Course = {
    students(parent, args, {prisma, user,ctx}, info) {
        if (ctx.isStudent)
            return null
        return prisma.student.findMany({
            where: {
                course: {
                    id: parent.id
                }
            }
        })
    },
    async exams(parent, args, {prisma, user}, info) {
        const exams = await prisma.exam.findMany({
            where: {
                course: {
                    id: parent.id
                }
            }
        })
        const upcoming=[]
        const finished=[]
        exams.forEach((exam) => {
            let start = moment(exam.date)
            console.log(start.toString())
            const end=start.add(exam.duration, 'minutes')
            console.log(end.toString())
            const now=moment()
            console.log(now.toString())
            const delta=end.diff(now,'seconds')
            console.log(delta)
            if ( delta> 0)
                upcoming.push(exam)
            else finished.push(exam)
        })
        return {
            upcomingExams:upcoming,
            finishedExams:finished
        }
    },



}
export default Course
