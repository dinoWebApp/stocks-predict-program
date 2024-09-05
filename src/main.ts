import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as exphbs from 'express-handlebars';
import { join } from 'path';
import { TensorflowService } from './tensorflow/tensorflow.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const tensorflowService = app.get(TensorflowService);
  app.engine(
    'hbs',
    exphbs.create({
      extname: 'hbs',
      defaultLayout: null, // 기본 레이아웃 사용 안 함
      partialsDir: join(__dirname, '..', 'views/partials'), // Partial 디렉토리 설정
    }).engine,
  );

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await tensorflowService.loadModel(
    './ai-model/kospi-predict/model.json',
    './ai-model/kosdaq-predict/model.json',
  );
  await app.listen(3000);
}
bootstrap();
