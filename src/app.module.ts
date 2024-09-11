import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TensorflowService } from './tensorflow/tensorflow.service';
import { TensorflowModule } from './tensorflow/tensorflow.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TensorflowModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
