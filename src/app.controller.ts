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
    let minusDays = 3;
    const koreanDate = DateTime.now()
      .setZone('Asia/Seoul')
      .minus({ days: minusDays })
      .toFormat('yyyy-MM-dd');
    const koreanRateOfChangeArr =
      await this.appService.getKoreanStockData(koreanDate);
    if (koreanRateOfChangeArr.length !== 0) {
      let predicted = false;
      while (predicted) {
        const americanDate = DateTime.now()
          .setZone('Asia/Seoul')
          .minus({ days: minusDays + 1 })
          .toFormat('yyyy-MM-dd');
        const americanRateOfChangeArr =
          await this.appService.getStockData(americanDate);
        if (americanRateOfChangeArr.length !== 0) {
          try {
            const kospiPredicted = await this.tensorflowService.kospiPredict([
              americanRateOfChangeArr,
            ]);
            const kosdaqPredicted = await this.tensorflowService.kosdaqPredict([
              americanRateOfChangeArr,
            ]);
            predictResults.push({
              date: koreanDate,
              kospiPredicted,
              kosdaqPredicted,
              kospiResult: koreanRateOfChangeArr[0],
              kosdaqResult: koreanRateOfChangeArr[1],
            });
            predicted = true;
          } catch (error) {
            console.error('예측 중 오류 발생:', error.message);
            break;
          }
        }
      }
    }

    console.log(predictResults);
  }
}
