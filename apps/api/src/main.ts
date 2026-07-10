import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    cors: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle("StockIQ API")
    .setDescription(
      "Analiza ~130 grandes empresas cotizadas con datos fundamentales, scores explicables e informes generados por IA. Solo acciones -- nunca ETFs, cripto, forex, opciones o penny stocks.",
    )
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, "0.0.0.0");
  Logger.log(`StockIQ API listening on http://0.0.0.0:${port} (docs at /docs)`, "Bootstrap");
}

bootstrap();
