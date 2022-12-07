const Student={
    person(parent, args, {prisma, user}, info){
        return prisma.student.findOne({
            where:{
                id:parent.id
            }
        }).person()
    },
}

export default Student
