import { KeyPointInterface } from "./key-point.interface";

export interface TourInterface {
    id: string;
    authorId: string;
    name: string;
    description: string;
    difficulty: TourDifficulty;
    tags: TourTag[];
    status: TourStatus;
    price: number;
    keyPoints: KeyPointInterface[];
}

export type TourDifficulty = 
    'EASY' 
    | 'MEDIUM' 
    | 'HARD';

export type TourTag =
  'Nature'
  | 'Historical'
  | 'Adventure'
  | 'Cultural'
  | 'Wildlife'
  | 'Relaxation'
  | 'Beach'
  | 'Mountain'
  | 'Urban';

export type TourStatus = 'DRAFT';