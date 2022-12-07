import {PrismaClient} from "@prisma/client";
import Koa from 'koa';
import {ApolloServer,AuthenticationError} from "apollo-server-koa";
import r from "./routes"
import typeDefs from './src/graphql/schema'
import resolvers from "./src/graphql/resolvers";
import {validateToken} from "./utils/auth";
import cors from "@koa/cors";

require('dotenv').config();

const prisma = new PrismaClient();
const app = new Koa()
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

const server = new ApolloServer({
    typeDefs, resolvers, context: async ({ctx}) => {
        let user = ''
        let token = ''
        if (ctx.req.headers.authorization || '') {
            token = ctx.req.headers.authorization.split(' ')[1]
        } else if (ctx.cookies.get('jwt')) {
            token = ctx.cookies.get('jwt')
        }
        if (token)
            user = await validateToken(token).catch(
                (err) => {
                    throw new AuthenticationError("Invalid token")
                }
            )
        return {
            prisma, user, ctx
        }
    }
});


async function main() {
    prisma.course.findMany({})
    server.applyMiddleware({app});
    app.use(r.routes())
    app.listen({port: process.env.PORT || 4000}, () =>
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`))

}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.disconnect()
    })

