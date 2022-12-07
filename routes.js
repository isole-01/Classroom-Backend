import router from 'koa-router';
import {generateToken} from './utils/auth'
const r=new router()


r.get('/login',async function login(ctx) {
    console.dir(ctx.request.headers)
    const token=await generateToken({user:"hashem"})
    ctx.cookies.set('jwt',token,{httpOnly:true,maxAge:360000})
    ctx.body=token
})

r.get('/home',async function f(ctx) {
    console.log(ctx.user)

})


export default r;
