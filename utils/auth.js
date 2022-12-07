import jwt from 'jsonwebtoken';

export const generateToken=async (payload)=>{
    return jwt.sign(payload,process.env.JWT_KEY,{expiresIn:"8h"})
}

export const validateToken=async (token)=>{
    return jwt.verify(token,process.env.JWT_KEY,{maxAge:"8h"})
}

export default {generateToken,validateToken}
