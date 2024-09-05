import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import yahooFinance from 'yahoo-finance2';
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
    const currentDateKorea = DateTime.now().setZone('Asia/Seoul');
    await this.getStockData('2024-09-04');
    // 모델 로드 여부 확인
    if (!this.tensorflowService) {
      console.error('TensorflowService가 초기화되지 않았습니다.');
      return;
    }

    try {
      const predicted = await this.tensorflowService.kospiPredict([
        [-0.003, 0.0009, -0.0016],
      ]);
      console.log(predicted);
    } catch (error) {
      console.error('예측 중 오류 발생:', error.message);
    }
  }

  async getStockData(date: string) {
    const symbols = ['^IXIC', '^DJI', '^GSPC']; // 나스닥, 다우존스, S&P 500 심볼
    const indices = ['NASDAQ', 'Dow Jones', 'S&P 500'];

    // date를 Date 객체로 변환
    const currentDate = new Date(date);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    // 지정된 날짜 이전으로부터 데이터를 찾는 재귀 함수
    const fetchPreviousData = async (
      symbol: string,
      currentDate: Date,
      attempt: number = 1,
    ) => {
      if (attempt > 5) {
        // 최대 5일 전까지의 데이터를 확인합니다.
        throw new Error(`No sufficient data found for symbol ${symbol}`);
      }

      const previousDate = new Date(currentDate);
      previousDate.setDate(currentDate.getDate() - attempt);

      try {
        const previousData = await yahooFinance.historical(symbol, {
          period1: previousDate.toISOString().split('T')[0],
          period2: currentDate.toISOString().split('T')[0],
          interval: '1d',
        });

        if (previousData && previousData.length > 0) {
          return previousData[0];
        } else {
          return await fetchPreviousData(symbol, currentDate, attempt + 1);
        }
      } catch (error) {
        // 만약 에러가 발생하면 다음 날짜로 재귀 호출
        return await fetchPreviousData(symbol, currentDate, attempt + 1);
      }
    };

    try {
      const marketDataPromises = symbols.map(async (symbol) => {
        // 전날과 현재 날짜 데이터를 가져오기
        const previousData = await fetchPreviousData(symbol, currentDate);

        const currentData = await yahooFinance.historical(symbol, {
          period1: currentDate.toISOString().split('T')[0],
          period2: nextDate.toISOString().split('T')[0], // 당일
          interval: '1d',
        });

        return { previousData, currentData };
      });

      const marketData = await Promise.all(marketDataPromises);

      marketData.forEach((data, index) => {
        const previousClose = data.previousData?.close; // 전날 종가
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

  async getKoreanStockData(date: string) {
    const symbols = ['^KS11', '^KQ11']; // 코스피, 코스닥 심볼
    const indices = ['KOSPI', 'KOSDAQ'];

    // date를 Date 객체로 변환
    const currentDate = new Date(date);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    // 지정된 날짜 이전으로부터 데이터를 찾는 재귀 함수
    const fetchPreviousData = async (
      symbol: string,
      currentDate: Date,
      attempt: number = 1,
    ) => {
      if (attempt > 5) {
        // 최대 5일 전까지의 데이터를 확인합니다.
        throw new Error(`No sufficient data found for symbol ${symbol}`);
      }

      const previousDate = new Date(currentDate);
      previousDate.setDate(currentDate.getDate() - attempt);

      try {
        const previousData = await yahooFinance.historical(symbol, {
          period1: previousDate.toISOString().split('T')[0],
          period2: currentDate.toISOString().split('T')[0],
          interval: '1d',
        });

        if (previousData && previousData.length > 0) {
          return previousData[0];
        } else {
          return await fetchPreviousData(symbol, currentDate, attempt + 1);
        }
      } catch (error) {
        // 만약 에러가 발생하면 다음 날짜로 재귀 호출
        return await fetchPreviousData(symbol, currentDate, attempt + 1);
      }
    };

    try {
      const marketDataPromises = symbols.map(async (symbol) => {
        // 전날과 현재 날짜 데이터를 가져오기
        const previousData = await fetchPreviousData(symbol, currentDate);

        const currentData = await yahooFinance.historical(symbol, {
          period1: currentDate.toISOString().split('T')[0],
          period2: nextDate.toISOString().split('T')[0], // 당일
          interval: '1d',
        });

        return { previousData, currentData };
      });

      const marketData = await Promise.all(marketDataPromises);

      marketData.forEach((data, index) => {
        const previousClose = data.previousData?.close; // 전날 종가
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
