import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Blog } from '../models/Blog';

export interface BlogPayload {
  blogInput: {
    title: string;
    content: string;
    authorId: string;
    images?: string[];
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
}