export interface KeyPointInterface {
  id: string;
  tourID: string;
  longitude: number;
  latitude: number;
  name: string;
  description: string;
  imageUrl?: string;
  order: number;
}