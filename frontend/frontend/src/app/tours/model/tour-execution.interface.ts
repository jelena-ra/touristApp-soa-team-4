import { KeyPointInterface } from "./key-point.interface";

export interface CompletedKeyPoint {
  keyPointId: string;
  completionTime: string; 
}

export interface TouristPosition {
  latitude: number;
  longitude: number;
}

export interface TourExecution {
  id: string;
  tourId: string;
  touristId: string;
  status: 'Active' | 'Completed' | 'Abandoned';
  startTime: string;
  lastActivity: string;
  completionTime?: string; 
  completedKeyPoints: CompletedKeyPoint[];
  currentPosition: TouristPosition;
//   name?: string; 
//   keyPoints?: KeyPointInterface[]; // Opciona lista svih ključnih tačaka ture
}

export interface Location {
    latitude: number;
    longitude: number;
}