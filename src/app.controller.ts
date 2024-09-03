import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import yahooFinance from 'yahoo-finance2';
import { DateTime } from 'luxon';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  index() {
    const currentDateKorea = DateTime.now().setZone('Asia/Seoul');
  }

  async getStockData(date: string) {
    const symbols = ['^IXIC', '^DJI', '^GSPC']; // 나스닥, 다우존스, S&P 500 심볼
    const indices = ['NASDAQ', 'Dow Jones', 'S&P 500'];

    // date를 Date 객체로 변환
    const currentDate = new Date(date);
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1); // 전날 설정

    // 다음날 설정
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    try {
      const marketDataPromises = symbols.map(async (symbol) => {
        // 전날과 현재 날짜 데이터를 가져오기
        const previousData = await yahooFinance.historical(symbol, {
          period1: previousDate.toISOString().split('T')[0],
          period2: currentDate.toISOString().split('T')[0], // 전날부터 당일 전날까지
          interval: '1d',
        });

        const currentData = await yahooFinance.historical(symbol, {
          period1: currentDate.toISOString().split('T')[0],
          period2: nextDate.toISOString().split('T')[0], // 당일
          interval: '1d',
        });

        return { previousData, currentData };
      });

      const marketData = await Promise.all(marketDataPromises);

      marketData.forEach((data, index) => {
        const previousClose = data.previousData[0]?.close; // 전날 종가
        const currentClose = data.currentData[0]?.close; // 당일 종가

        if (previousClose && currentClose) {
          const changePercent =
            ((currentClose - previousClose) / previousClose) * 100;

          console.log(`${indices[index]} (${symbols[index]})`);
          console.log(`전날 종가: ${previousClose}`);
          console.log(`당일 종가: ${currentClose}`);
          console.log(`변동률: ${changePercent.toFixed(2)}%\n`);
        } else {
          console.log(
            `${indices[index]} (${symbols[index]})에 대한 충분한 데이터가 없습니다.\n`,
          );
        }
      });
    } catch (error) {
      console.error('데이터를 가져오는 중 오류 발생:', error);
    }
  }
}
