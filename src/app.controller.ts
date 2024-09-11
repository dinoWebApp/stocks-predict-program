import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { DateTime } from 'luxon';
import { TensorflowService } from './tensorflow/tensorflow.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly tensorflowService: TensorflowService,
  ) {}

  @Get()
  @Render('index')
  async index() {
    //Todo: 밑에처럼 매번 5개씩 가져오는 것이 아닌 하나씩 db 에 저장해서 불러오는 로직으로 수정 필요
    let predictResults = [];
    const americanRateOfChangeArr = await this.appService.getStockData();
    console.log(
      await this.tensorflowService.kospiPredict([americanRateOfChangeArr]),
      await this.tensorflowService.kosdaqPredict([americanRateOfChangeArr]),
    );
  }
}
