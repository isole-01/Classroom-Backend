export async function findUser(email,prisma) {
    return await prisma.person.findOne({
        where: {
            email: email
        }
    });
}

export async function coursePersons(courseId,prisma) {
    return await prisma.course.findOne(
        {
            where: {
                id: courseId
            }
        }
    ).students({
        include: {
            person: true
        }
    })
}
