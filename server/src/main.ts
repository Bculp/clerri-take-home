import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

const PORT = 3000;
const CLIENT_ORIGIN = 'http://localhost:5173';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  app.useBodyParser('json');
  app.enableCors({ origin: CLIENT_ORIGIN });
  await app.listen(PORT);
  console.log(`API listening on http://localhost:${PORT}`);
}

bootstrap();
