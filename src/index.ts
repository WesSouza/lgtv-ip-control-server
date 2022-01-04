import fastifyFactory, { FastifyRequest } from 'fastify';
import { RouteGenericInterface } from 'fastify/types/route';
import { EnergySavingLevels, LGTV } from 'lgtv-ip-control';

const fastify = fastifyFactory({ logger: true });

interface LGTVSetup extends RouteGenericInterface {
  Body: {
    ip: string;
    mac: string;
    keycode: string;
    level: string;
  };
}

fastify.post(
  '/setEnergySaving',
  async (request: FastifyRequest<LGTVSetup>, reply) => {
    try {
      const { ip, mac, keycode, level } = request.body;
      const tv = new LGTV(ip, mac, keycode);

      await tv.connect();
      await tv.setEnergySaving(level as EnergySavingLevels);
      await tv.disconnect();

      return { ok: true };
    } catch (error) {
      reply.status(500);
      return { ok: false, error: String(error) };
    }
  }
);

const start = async () => {
  try {
    await fastify.listen(33000, '0.0.0.0');
    fastify.log.info(
      `server listening on ${fastify.server.address()?.toString()}`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
