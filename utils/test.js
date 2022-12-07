import {compare} from "./hash";
async function f() {
    const res=await compare('1234','afddfasfasfwf')
    console.log(res)
}

f()
