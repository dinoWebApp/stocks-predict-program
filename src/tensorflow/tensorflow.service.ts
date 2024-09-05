import { Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-node';

@Injectable()
export class TensorflowService {
  private kospiModel: tf.LayersModel;
  private kosdaqModel: tf.LayersModel;

  async loadModel(kospiModelPath: string, kosdaqModelPath: string) {
    // 모델 로드
    this.kospiModel = await tf.loadLayersModel(`file://${kospiModelPath}`);
    this.kosdaqModel = await tf.loadLayersModel(`file://${kosdaqModelPath}`);
    console.log('모델이 성공적으로 로드되었습니다.');
  }

  async kospiPredict(predictData: number[][]): Promise<number[][]> {
    if (!this.kospiModel) {
      throw new Error('모델이 아직 로드되지 않았습니다.');
    }
    // 입력 데이터를 Tensor로 변환
    const inputData = tf.tensor(predictData);

    // 예측 수행
    const prediction = this.kospiModel.predict(inputData) as tf.Tensor;

    // 예측 결과를 배열로 변환하여 반환
    const predictionArray = await prediction.array();
    console.log('코스피 예상 확률');

    return predictionArray as number[][];
  }

  async kosdaqPredict(predictData: number[][]): Promise<number[][]> {
    if (!this.kosdaqModel) {
      throw new Error('모델이 아직 로드되지 않았습니다.');
    }
    // 입력 데이터를 Tensor로 변환
    const inputData = tf.tensor(predictData);

    // 예측 수행
    const prediction = this.kosdaqModel.predict(inputData) as tf.Tensor;

    // 예측 결과를 배열로 변환하여 반환
    const predictionArray = await prediction.array();
    console.log('코스닥 예상 확률');

    return predictionArray as number[][];
  }
}
