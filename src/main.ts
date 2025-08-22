import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SeederService } from './services/seeder/seeder.service';
// import { WrapResponseInterceptor } from './interceptors/wrap-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const seederService = app.get(SeederService);
  await seederService.seed();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, //remove invalid properties in the body ..
      forbidNonWhitelisted: false,
      transform: true, //transform dto to instance
      transformOptions: {
        enableImplicitConversion: true, //when set @Type in paginationQueryDto is not needed
      },
    }),
  );

  // app.useGlobalInterceptors(new WrapResponseInterceptor());
  app.enableCors({
    // origin: 'https://helpdesk.nmdpra.gov.ng',
    // methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'HEAD'],
    // credentials: true,
  });

  const options = new DocumentBuilder()
    .setTitle('NMDPRA Support')
    .setDescription('The Support API Documenation')
    .setVersion('1.0')
    .addTag('support')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;

  await app.listen(port);
}
bootstrap();
