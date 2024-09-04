import { Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-node';

@Injectable()
export class TensorflowService {
  private model: tf.LayersModel;

  async loadModel(modelPath: string) {
    // 모델 로드
    this.model = await tf.loadLayersModel(`file://${modelPath}`);
    console.log('모델이 성공적으로 로드되었습니다.');
  }

  async predict(predictData: number[][]): Promise<number[][]> {
    if (!this.model) {
      throw new Error('모델이 아직 로드되지 않았습니다.');
    }
    // 입력 데이터를 Tensor로 변환
    const inputData = tf.tensor(predictData);

    // 예측 수행
    const prediction = this.model.predict(inputData) as tf.Tensor;

    // 예측 결과를 배열로 변환하여 반환
    const predictionArray = await prediction.array();

    return predictionArray as number[][];
  }
}
