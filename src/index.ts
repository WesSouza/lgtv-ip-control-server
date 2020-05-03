import fastifyFactory, { FastifyRequest } from 'fastify';
import { IncomingMessage } from 'http';
import { EnergySavingLevels, LGTV } from 'lgtv-ip-control';

const fastify = fastifyFactory({ logger: true });

interface LGTVSetup {
  ip: string;
  mac: string;
  keycode: string;
}

fastify.post(
  '/setEnergySaving',
  async (
    request: FastifyRequest<
      IncomingMessage,
      {},
      {},
      {},
      LGTVSetup & { level: string }
    >,
    reply
  ) => {
    try {
      const { ip, mac, keycode, level } = request.body;
      const tv = new LGTV(ip, mac, keycode);

      await tv.connect();
      await tv.setEnergySaving(level as EnergySavingLevels);
      await tv.disconnect();

      return { ok: true };
    } catch (error) {
      reply.status(500);
      return { ok: false, error: error.toString() };
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
