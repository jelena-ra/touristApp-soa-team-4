import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Blog } from '../models/Blog';
import { Comment } from '../models/Comment';

export interface BlogPayload {
  blogInput: {
    title: string;
    content: string;
    authorId: string;
    images?: string[];
  }
}

export interface CommentPayload {
  commentInput: {
    blogId: string;
    userId: string;
    content: string;
  }
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://localhost:8000/api/blogs';

  constructor(private http: HttpClient) { }

  createBlog(blogData: BlogPayload): Observable<Blog> {
    return this.http.post<Blog>(this.apiUrl, blogData);
  }

  getBlogById(blogId: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${blogId}`);
  }

  likeBlog(blogId: string, userId: string): Observable<Blog> {
    return this.http.put<Blog>(`${this.apiUrl}/${blogId}/like/${userId}`, {});
  }

  unlikeBlog(blogId: string, userId: string): Observable<Blog> {
    return this.http.delete<Blog>(`${this.apiUrl}/${blogId}/unlike/${userId}`);
  }

  createComment(commentData: CommentPayload): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/comments`, commentData);
  }
}