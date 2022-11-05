import Fastify from "fastify";
import cors from '@fastify/cors';
import { z } from 'zod';
import ShortUniqueId from 'short-unique-id'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query'],
})

async function bootstrap() {
    const fastify = Fastify({
        logger: true,
    })

    await fastify.register(cors, {
        origin: true,
    })

    fastify.get('/pools/count', async () => {
        const count = await prisma.pool.count()
        return { count }
    })

    fastify.post('/pools', async (request, reply) => {
        const createPoolBody = z.object({
            title: z.string(),
        });

        try {
            const { title } = createPoolBody.parse(request.body);
            const generate = new ShortUniqueId({ length: 6 });
            const code = String(generate()).toUpperCase();

            await prisma.pool.create({
                data: {
                    title,
                    code
                }
            })

            return reply.status(201).send({ code });

        } catch (error) {
            return reply.status(500).send({ error });
        }

    })

    fastify.get('/pools', async () => {
        const pools = await prisma.pool.findMany({
            // where: {
            //     code: {
            //         startsWith: 'D'
            //     }
            // }
        })

        return { pools }
    })

    await fastify.listen({ port: 3333, host: '0.0.0.0' })
}

bootstrap()