export interface Blog {
  id?: string; 
  title: string;
  content: string;
  authorId?: string; 
  createdAt?: Date;
  likes?: string[];
  images: string[]; 
  comments?: any[]; 
  deleted: boolean;
}