
export enum ParticleModel {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  BUDDHA = 'Zen',
  FIREWORKS = 'Fireworks'
}

export interface HandData {
  isOpen: boolean;
  span: number; // 0 to 1
  centerX: number;
  centerY: number;
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
