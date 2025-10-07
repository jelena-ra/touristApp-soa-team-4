import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Blog, BlogForm, Comment, ApiResponse, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/blogs`);
  }

  getBlog(id: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/blogs/${id}`);
  }

  createBlog(blogData: BlogForm): Observable<ApiResponse<Blog>> {
    return this.http.post<ApiResponse<Blog>>(`${this.apiUrl}/blogs`, blogData);
  }

  updateBlog(id: string, blogData: BlogForm): Observable<ApiResponse<Blog>> {
    return this.http.put<ApiResponse<Blog>>(`${this.apiUrl}/blogs/${id}`, blogData);
  }

  deleteBlog(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/blogs/${id}`);
  }

  likeBlog(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/blogs/${id}/like`, {});
  }

  unlikeBlog(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/blogs/${id}/like`);
  }

  getComments(blogId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/blogs/${blogId}/comments`);
  }

  createComment(blogId: string, content: string): Observable<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(`${this.apiUrl}/blogs/${blogId}/comments`, { content });
  }

  deleteComment(blogId: string, commentId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/blogs/${blogId}/comments/${commentId}`);
  }
}