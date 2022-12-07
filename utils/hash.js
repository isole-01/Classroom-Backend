import bcrypt from "bcrypt"

const saltRounds = 10;

export const hasher=async (password)=>{
    return bcrypt.hash(password, saltRounds)
}
export const compare=async (password,hashedPassword)=>{
    return bcrypt.compare(password,hashedPassword)
}

