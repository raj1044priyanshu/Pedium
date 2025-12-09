export interface UserProfile {
  $id: string;
  name: string;
  email: string;
  registration: string;
}

export interface Article {
  $id: string;
  title: string;
  content: string; // Now stores JSON string from Editor.js
  summary: string;
  userId: string;
  authorName: string;
  tags: string[];
  $createdAt: string; // Using Appwrite system attribute
  coverImageId?: string;
  views?: number;
  likedBy?: string[]; // Array of User IDs
}

export interface Comment {
  $id: string;
  content: string;
  articleId: string;
  userId: string;
  authorName: string;
  $createdAt: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}