import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { load } from 'cheerio'; // cheerio에서 load 함수만 가져옴
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

enum Country {
  korea = 'ko',
  us = 'us',
}

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  async getStockData() {
    return this.getStockDataFromUrl(Country.us);
  }
  async getKoreanStockData() {
    return this.getStockDataFromUrl(Country.korea);
  }

  async getStockDataFromUrl(country: Country) {
    const stockUrl: string = this.configService.get<string>('STOCK_URL');
    let result: number[] = [];
    if (country === Country.korea) {
      let isHoliday = false;
      const stockSymbols: string[] = [
        this.configService.get('FIRST_DOMESTIC_STOCK_SYMBOL'),
        this.configService.get('SECOND_DOMESTIC_STOCK_SYMBOL'),
      ];
      const yesterday = DateTime.now()
        .setZone('Asia/Seoul')
        .minus({ days: 1 })
        .setLocale('en');

      const yesterdayDate = yesterday.toLocaleString({
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
      for (const symbol of stockSymbols) {
        const url = `${stockUrl}/${symbol}`;
        if (isHoliday) return;
        try {
          let yesterdayChangeStr: string;
          const response = await axios.get(url);
          const $ = load(response.data); // load 함수를 사용해 데이터를 파싱

          $('table tbody tr').each((index, element) => {
            const date = $(element).find('td:nth-child(1)').text().trim(); // 날짜
            const change = $(element).find('td:nth-child(7)').text().trim(); // 종가

            if (date === yesterdayDate) {
              console.log(`${country} Date: ${date}, Change: ${change}`);
              yesterdayChangeStr = change;
            }
          });

          if (!yesterdayChangeStr) {
            isHoliday = true;
            return;
          }
          const yesterdayChange =
            Number(yesterdayChangeStr.replace(/[%+]/g, '')) / 100;
          result.push(yesterdayChange);
          console.log(result);
        } catch (error) {
          console.log(error);
        }
      }
      console.log(result);
      return result;
    }

    if (country === Country.us) {
      const stockSymbols: string[] = [
        this.configService.get('FIRST_STOCK_SYMBOL'),
        this.configService.get('SECOND_STOCK_SYMBOL'),
        this.configService.get('THIRD_STOCK_SYMBOL'),
      ];
      let selectedDate: string;
      let minusDate = 1;
      for (const symbol of stockSymbols) {
        const url = `${stockUrl}/${symbol}`;
        if (!selectedDate) {
          while (!selectedDate) {
            const previousDay = DateTime.now()
              .setZone('Asia/Seoul')
              .minus({ days: minusDate })
              .setLocale('en');

            const previousDate = previousDay.toLocaleString({
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            });
            try {
              let previousChangeStr: string;
              const response = await axios.get(url);
              const $ = load(response.data); // load 함수를 사용해 데이터를 파싱

              $('table tbody tr').each((index, element) => {
                const date = $(element).find('td:nth-child(1)').text().trim(); // 날짜
                const change = $(element).find('td:nth-child(7)').text().trim(); // 종가

                if (date === previousDate) {
                  console.log(`${country} Date: ${date}, Change: ${change}`);
                  previousChangeStr = change;
                }
              });

              if (previousChangeStr) {
                selectedDate = previousDate;
                const previousChange =
                  Number(previousChangeStr.replace(/[%+]/g, '')) / 100;
                result.push(previousChange);
                break;
              }
              minusDate++;
            } catch (error) {
              console.log(error);
            }
          }
          continue;
        }
        const previousDay = DateTime.now()
          .setZone('Asia/Seoul')
          .minus({ days: minusDate })
          .setLocale('en');

        const previousDate = previousDay.toLocaleString({
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });
        try {
          let previousChangeStr: string;
          const response = await axios.get(url);
          const $ = load(response.data); // load 함수를 사용해 데이터를 파싱

          $('table tbody tr').each((index, element) => {
            const date = $(element).find('td:nth-child(1)').text().trim(); // 날짜
            const change = $(element).find('td:nth-child(7)').text().trim(); // 종가

            if (date === previousDate) {
              console.log(`Date: ${date}, Change: ${change}`);
              previousChangeStr = change;
            }
          });

          if (previousChangeStr) {
            selectedDate = previousDate;
            const previousChange =
              Number(previousChangeStr.replace(/[%+]/g, '')) / 100;
            result.push(previousChange);
          }
        } catch (error) {
          console.log(error);
        }
      }
      return result;
    }
  }
}
