// Core Types for Travel Platform

export type UserRole = 'admin' | 'vodič' | 'turista';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  bio?: string;
  motto?: string;
  profileImage?: string;
  isBlocked: boolean;
  createdAt: string;
  lastActivity?: string;
}

export interface AuthUser extends User {
  token: string;
}

export type TourStatus = 'draft' | 'published' | 'archived';
export type TravelMode = 'walk' | 'bike' | 'car';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Keypoint {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image?: string;
  order: number;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  authorId: string;
  author?: User;
  difficulty: Difficulty;
  tags: string[];
  price: number;
  status: TourStatus;
  keypoints: Keypoint[];
  travelModes: {
    walk?: number; // duration in minutes
    bike?: number;
    car?: number;
  };
  totalDistance?: number; // in km
  averageRating?: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string; // markdown
  authorId: string;
  author?: User;
  image?: string;
  likes: string[]; // user IDs
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author?: User;
  blogId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  tourId: string;
  userId: string;
  user?: User;
  rating: number; // 1-5
  comment: string;
  visitDate: string;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followedId: string;
  createdAt: string;
}

export interface CartItem {
  tourId: string;
  tour: Tour;
  quantity: number;
}

export interface PurchaseToken {
  id: string;
  userId: string;
  tourId: string;
  tour?: Tour;
  purchaseDate: string;
  expiresAt?: string;
}

export interface TourExecution {
  id: string;
  userId: string;
  tourId: string;
  tokenId: string;
  startedAt: string;
  completedAt?: string;
  abandonedAt?: string;
  lastActivity: string;
  currentPosition?: {
    latitude: number;
    longitude: number;
  };
  completedKeypoints: {
    keypointId: string;
    completedAt: string;
  }[];
}

export interface Position {
  latitude: number;
  longitude: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Form types
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  bio: string;
  motto: string;
  profileImage?: File;
}

export interface TourForm {
  name: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  price: number;
  travelModes: {
    walk?: number;
    bike?: number;
    car?: number;
  };
}

export interface BlogForm {
  title: string;
  content: string;
  image?: File;
}

export interface ReviewForm {
  rating: number;
  comment: string;
  visitDate: string;
  images?: File[];
}