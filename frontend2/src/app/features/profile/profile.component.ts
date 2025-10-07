import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, state } from '@angular/animations';

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  delay: number;
  type: string;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
}



interface User {
  id: string;
  username: string;
  profilePicture?: string;
  role: 'guide' | 'tourist' | 'admin';
  bio: string;
  motto: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  toursCount: number;
  blogsCount: number;
  reviewsCount: number;
  joinedDate: Date;
  email?: string;
  mutualFollowers?: string[];
}

interface Tour {
  id: string;
  title: string;
  difficulty: string;
  price: number;
  rating: number;
  createdAt: Date;
}

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  createdAt: Date;
  readTime: string;
}

interface Review {
  id: string;
  tourTitle: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="relative min-h-screen bg-black overflow-hidden">
      <!-- Cosmic Particle Background -->
      <div class="absolute inset-0 particle-container">
        <div class="particle" *ngFor="let particle of particles; trackBy: trackParticle" 
             [style.left.px]="particle.x" 
             [style.top.px]="particle.y"
             [style.animation-delay]="particle.delay + 's'"
             [style.opacity]="particle.opacity"
             [style.width.px]="particle.size"
             [style.height.px]="particle.size"
             [ngClass]="particle.type"></div>
        

      </div>

      <!-- Main Content -->
      <div class="relative z-10 min-h-screen" *ngIf="currentUser">
        <div class="max-w-7xl mx-auto px-6 py-12">
          
          <!-- Profile Header Constellation -->
          <div class="profile-constellation mb-16" [@profileReveal]>
            <div class="profile-header">
              <!-- Profile Picture with Glowing Rim -->
              <div class="profile-avatar-container">
                <div class="profile-avatar" 
                     [style.background-image]="currentUser.profilePicture ? 'url(' + currentUser.profilePicture + ')' : ''">
                  <span *ngIf="!currentUser.profilePicture" class="avatar-placeholder">
                    {{ currentUser.username[0].toUpperCase() }}
                  </span>
                  <div class="avatar-glow"></div>
                </div>
                <div class="role-badge" [ngClass]="currentUser.role">
                  <span class="role-icon">{{ getRoleIcon(currentUser.role) }}</span>
                </div>
              </div>

              <!-- User Info -->
              <div class="profile-info">
                <h1 class="profile-username">{{ currentUser.username }}</h1>
                <div class="profile-role">
                  <span class="role-text">{{ getRoleText(currentUser.role) }}</span>
                </div>
                <p class="profile-bio">{{ currentUser.bio }}</p>
                <div class="profile-motto">
                  <span class="quote-icon">"</span>
                  <span class="motto-text">{{ currentUser.motto }}</span>
                  <span class="quote-icon">"</span>
                </div>
              </div>

              <!-- Stats & Actions -->
              <div class="profile-actions">
                <div class="profile-stats">
                  <div class="stat-item">
                    <span class="stat-number">{{ currentUser.followersCount }}</span>
                    <span class="stat-label">Pratioci</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ currentUser.followingCount }}</span>
                    <span class="stat-label">Prati</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ currentUser.toursCount }}</span>
                    <span class="stat-label">Ture</span>
                  </div>
                </div>
                
                <div class="action-buttons" *ngIf="!isOwnProfile">
                  <button 
                    (click)="toggleFollow()"
                    [@followButton]="currentUser.isFollowing ? 'following' : 'notFollowing'"
                    class="follow-button"
                    [class.following]="currentUser.isFollowing">
                    <span class="button-particles"></span>
                    <span class="button-text">
                      {{ currentUser.isFollowing ? 'Prekini praćenje' : 'Prati' }}
                    </span>
                  </button>
                  <button class="message-button">
                    <span class="button-icon">💬</span>
                    <span>Poruka</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="tab-constellation mb-12">
            <div class="tab-nav">
              <button 
                *ngFor="let tab of tabs"
                [class.active]="activeTab === tab.id"
                (click)="setActiveTab(tab.id)"
                class="tab-button">
                <span class="tab-icon">{{ tab.icon }}</span>
                <span class="tab-label">{{ tab.label }}</span>
                <span class="tab-count" *ngIf="tab.count">{{ tab.count }}</span>
              </button>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            
            <!-- Tours Tab -->
            <div *ngIf="activeTab === 'tours'" [@tabContent] class="tab-panel">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div *ngFor="let tour of userTours; let i = index" 
                     [@cardFloat]
                     [style.animation-delay]="i * 0.1 + 's'"
                     class="tour-card constellation-card">
                  <div class="card-content">
                    <h3 class="card-title">{{ tour.title }}</h3>
                    <div class="card-meta">
                      <span class="difficulty">{{ tour.difficulty }}</span>
                      <span class="price">{{ tour.price === 0 ? 'Besplatno' : tour.price + ' RSD' }}</span>
                    </div>
                    <div class="card-rating">
                      <div class="stars">
                        <span *ngFor="let star of getStarArray(tour.rating)" class="star">⭐</span>
                      </div>
                      <span class="rating-value">{{ tour.rating }}</span>
                    </div>
                  </div>
                  <div class="card-glow"></div>
                </div>
              </div>
            </div>

            <!-- Blogs Tab -->
            <div *ngIf="activeTab === 'blogs'" [@tabContent] class="tab-panel">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngFor="let blog of userBlogs; let i = index" 
                     [@cardFloat]
                     [style.animation-delay]="i * 0.1 + 's'"
                     class="blog-card constellation-card">
                  <div class="card-content">
                    <h3 class="card-title">{{ blog.title }}</h3>
                    <p class="card-excerpt">{{ blog.excerpt }}</p>
                    <div class="card-meta">
                      <span class="read-time">{{ blog.readTime }}</span>
                      <span class="date">{{ formatDate(blog.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="card-glow"></div>
                </div>
              </div>
            </div>

            <!-- Reviews Tab -->
            <div *ngIf="activeTab === 'reviews'" [@tabContent] class="tab-panel">
              <div class="space-y-6">
                <div *ngFor="let review of userReviews; let i = index" 
                     [@cardFloat]
                     [style.animation-delay]="i * 0.1 + 's'"
                     class="review-card constellation-card">
                  <div class="card-content">
                    <div class="review-header">
                      <h3 class="card-title">{{ review.tourTitle }}</h3>
                      <div class="review-rating">
                        <span *ngFor="let star of getStarArray(review.rating)" class="star">⭐</span>
                      </div>
                    </div>
                    <p class="review-comment">{{ review.comment }}</p>
                    <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                  </div>
                  <div class="card-glow"></div>
                </div>
              </div>
            </div>

            <!-- Following Tab -->
            <div *ngIf="activeTab === 'following'" [@tabContent] class="tab-panel">
              
              <!-- Following Sub-Navigation -->
              <div class="following-nav-constellation mb-8">
                <div class="sub-nav">
                  <button 
                    *ngFor="let subTab of followingSubTabs"
                    [class.active]="activeFollowingTab === subTab.id"
                    (click)="setActiveFollowingTab(subTab.id)"
                    class="sub-tab-button">
                    <span class="sub-tab-icon">{{ subTab.icon }}</span>
                    <span class="sub-tab-label">{{ subTab.label }}</span>
                    <span class="sub-tab-count" *ngIf="subTab.count">{{ subTab.count }}</span>
                  </button>
                </div>
              </div>

              <!-- Following Users -->
              <div *ngIf="activeFollowingTab === 'following'" [@subTabContent]>
                <h3 class="subsection-title">Pratite</h3>
                <div class="cosmic-line-small mb-6"></div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div *ngFor="let user of followingUsers; let i = index" 
                       [@cardFloat]
                       [style.animation-delay]="i * 0.1 + 's'"
                       class="user-card constellation-card"
                       (mouseenter)="showConnections(user)"
                       (mouseleave)="hideConnections()">
                    <div class="card-content">
                      <div class="user-avatar" 
                           [style.background-image]="user.profilePicture ? 'url(' + user.profilePicture + ')' : ''">
                        <span *ngIf="!user.profilePicture" class="avatar-placeholder">
                          {{ user.username[0].toUpperCase() }}
                        </span>
                      </div>
                      <h3 class="user-name">{{ user.username }}</h3>
                      <div class="user-role" [ngClass]="user.role">
                        <span class="role-icon">{{ getRoleIcon(user.role) }}</span>
                        <span class="role-text">{{ getRoleText(user.role) }}</span>
                      </div>
                      <p class="user-bio">{{ user.bio }}</p>
                      <button 
                        (click)="unfollowUser(user)"
                        [@unfollowButton]
                        class="unfollow-button">
                        <span class="button-particles"></span>
                        <span>Prekini praćenje</span>
                      </button>
                    </div>
                    <div class="card-glow"></div>
                    <div class="connection-lines" *ngIf="showingConnections === user.id">
                      <div *ngFor="let connection of connectionLines" 
                           class="connection-line"
                           [style.transform]="'rotate(' + connection.angle + 'deg)'"
                           [style.width.px]="connection.length"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Suggested Users -->
              <div *ngIf="activeFollowingTab === 'suggestions'" [@subTabContent]>
                <h3 class="subsection-title">Predlozi za Praćenje</h3>
                <div class="cosmic-line-small mb-6"></div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div *ngFor="let suggestion of suggestedUsers; let i = index" 
                       [@suggestionFloat]
                       [style.animation-delay]="i * 0.15 + 's'"
                       class="suggestion-card constellation-card"
                       (mouseenter)="showMutualConnections(suggestion)"
                       (mouseleave)="hideMutualConnections()">
                    <div class="card-content">
                      <div class="user-avatar" 
                           [style.background-image]="suggestion.profilePicture ? 'url(' + suggestion.profilePicture + ')' : ''">
                        <span *ngIf="!suggestion.profilePicture" class="avatar-placeholder">
                          {{ suggestion.username[0].toUpperCase() }}
                        </span>
                      </div>
                      <h3 class="user-name">{{ suggestion.username }}</h3>
                      <div class="user-role" [ngClass]="suggestion.role">
                        <span class="role-icon">{{ getRoleIcon(suggestion.role) }}</span>
                      </div>
                      <p class="mutual-info" *ngIf="suggestion.mutualFollowers && suggestion.mutualFollowers.length > 0">
                        {{ suggestion.mutualFollowers.length }} zajedničkih
                      </p>
                      <button 
                        (click)="followUser(suggestion)"
                        [@followSuggestion]
                        class="follow-suggestion-button">
                        <span class="button-particles"></span>
                        <span>Prati</span>
                      </button>
                    </div>
                    <div class="card-glow"></div>
                    <div class="mutual-connections" *ngIf="showingMutuals === suggestion.id">
                      <div *ngFor="let line of mutualConnectionLines" 
                           class="mutual-line"
                           [style.transform]="'rotate(' + line.angle + 'deg)'"
                           [style.width.px]="line.length"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- All Users Galaxy -->
              <div *ngIf="activeFollowingTab === 'discover'" [@subTabContent]>
                <h3 class="subsection-title">Otkrijte Korisnike</h3>
                <div class="cosmic-line-small mb-6"></div>
                
                <!-- Search and Filter Controls -->
                <div class="discovery-controls mb-8">
                  <div class="search-constellation">
                    <input 
                      type="text" 
                      [(ngModel)]="searchQuery"
                      [ngModelOptions]="{standalone: true}"
                      (input)="filterAllUsers()"
                      placeholder="Pretražite korisnike..." 
                      class="cosmic-search">
                    <span class="search-icon">🔍</span>
                  </div>
                  
                  <div class="filter-stars">
                    <button 
                      *ngFor="let filter of userFilters"
                      [class.active]="activeFilter === filter.value"
                      (click)="setUserFilter(filter.value)"
                      class="filter-star">
                      <span class="filter-icon">{{ filter.icon }}</span>
                      <span class="filter-label">{{ filter.label }}</span>
                    </button>
                  </div>
                </div>

                <!-- All Users Grid -->
                <div class="users-galaxy">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div *ngFor="let user of filteredAllUsers; let i = index" 
                         [@galaxyFloat]
                         [style.animation-delay]="i * 0.05 + 's'"
                         class="galaxy-user-card constellation-card"
                         (mouseenter)="showUserConnections(user)"
                         (mouseleave)="hideUserConnections()">
                      <div class="card-content">
                        <div class="user-avatar" 
                             [style.background-image]="user.profilePicture ? 'url(' + user.profilePicture + ')' : ''">
                          <span *ngIf="!user.profilePicture" class="avatar-placeholder">
                            {{ user.username[0].toUpperCase() }}
                          </span>
                        </div>
                        <h3 class="user-name">{{ user.username }}</h3>
                        <div class="user-role" [ngClass]="user.role">
                          <span class="role-icon">{{ getRoleIcon(user.role) }}</span>
                          <span class="role-text">{{ getRoleText(user.role) }}</span>
                        </div>
                        <p class="user-bio-short">{{ user.bio | slice:0:50 }}{{ user.bio.length > 50 ? '...' : '' }}</p>
                        
                        <!-- User Stats Constellation -->
                        <div class="user-stats-mini">
                          <div class="stat-mini">
                            <span class="stat-icon">👥</span>
                            <span class="stat-text">{{ user.followersCount }}</span>
                          </div>
                          <div class="stat-mini">
                            <span class="stat-icon">🗺️</span>
                            <span class="stat-text">{{ user.toursCount }}</span>
                          </div>
                          <div class="stat-mini">
                            <span class="stat-icon">📖</span>
                            <span class="stat-text">{{ user.blogsCount }}</span>
                          </div>
                        </div>

                        <div class="action-buttons-mini">
                          <button 
                            *ngIf="!user.isFollowing"
                            (click)="followUser(user)"
                            [@followSuggestion]
                            class="follow-mini-button">
                            <span class="button-particles"></span>
                            <span>Prati</span>
                          </button>
                          <button 
                            *ngIf="user.isFollowing"
                            (click)="unfollowUser(user)"
                            [@unfollowButton]
                            class="unfollow-mini-button">
                            <span class="button-particles"></span>
                            <span>Pratite</span>
                          </button>
                          <button 
                            (click)="viewProfile(user)"
                            class="view-profile-button">
                            <span class="button-icon">👁️</span>
                          </button>
                        </div>
                      </div>
                      <div class="card-glow"></div>
                      <div class="user-connections" *ngIf="showingUserConnections === user.id">
                        <div *ngFor="let connection of userConnectionLines" 
                             class="user-connection-line"
                             [style.transform]="'rotate(' + connection.angle + 'deg)'"
                             [style.width.px]="connection.length"></div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Load More Button -->
                  <div class="load-more-constellation mt-12" *ngIf="hasMoreUsers">
                    <button 
                      (click)="loadMoreUsers()"
                      [@loadMoreFloat]
                      class="load-more-button">
                      <span class="button-particles"></span>
                      <span class="button-text">Učitajte Više Korisnika</span>
                      <span class="button-icon">🌌</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .particle-container {
      pointer-events: none;
    }
    
    .particle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.8;
    }
    
    .particle.type-1 {
      background: radial-gradient(circle, rgba(96, 165, 250, 0.9) 0%, transparent 70%);
      animation: float1 8s infinite ease-in-out;
    }
    
    .particle.type-2 {
      background: radial-gradient(circle, rgba(52, 211, 153, 0.8) 0%, transparent 70%);
      animation: float2 12s infinite ease-in-out;
    }
    
    .particle.type-3 {
      background: radial-gradient(circle, rgba(167, 139, 250, 0.7) 0%, transparent 70%);
      animation: float3 10s infinite ease-in-out;
    }
    
    .particle.silhouette {
      background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
      animation: silhouetteFloat 15s infinite ease-in-out;
    }
    
    @keyframes float1 {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
      25% { transform: translate(80px, -40px) scale(1.2); opacity: 1; }
      50% { transform: translate(-40px, -80px) scale(0.8); opacity: 0.7; }
      75% { transform: translate(-60px, 40px) scale(1.1); opacity: 0.9; }
    }
    
    @keyframes float2 {
      0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }
      33% { transform: translate(-100px, -60px) rotate(120deg); opacity: 1; }
      66% { transform: translate(60px, -40px) rotate(240deg); opacity: 0.6; }
    }
    
    @keyframes float3 {
      0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.7; }
      50% { transform: translate(40px, -100px) scale(1.5) rotate(180deg); opacity: 1; }
    }
    
    @keyframes silhouetteFloat {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
      25% { transform: translate(120px, -80px) scale(0.7); opacity: 0.7; }
      50% { transform: translate(-80px, -120px) scale(1.3); opacity: 0.3; }
      75% { transform: translate(-100px, 60px) scale(0.9); opacity: 0.6; }
    }
    

    
    .profile-constellation {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 2rem;
      padding: 3rem;
      box-shadow: 
        0 0 40px rgba(96, 165, 250, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    
    .profile-header {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 2rem;
      align-items: center;
    }
    
    @media (max-width: 768px) {
      .profile-header {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 1.5rem;
      }
    }
    
    .profile-avatar-container {
      position: relative;
    }
    
    .profile-avatar {
      width: 8rem;
      height: 8rem;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(52, 211, 153, 0.3));
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border: 3px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
    }
    
    .avatar-placeholder {
      color: white;
      font-size: 2rem;
      font-weight: 500;
    }
    
    .avatar-glow {
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      background: linear-gradient(45deg, rgba(96, 165, 250, 0.6), rgba(52, 211, 153, 0.6));
      opacity: 0;
      animation: avatarGlow 4s ease-in-out infinite;
      z-index: -1;
    }
    
    @keyframes avatarGlow {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
    
    .role-badge {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    
    .role-badge.guide {
      background: rgba(52, 211, 153, 0.3);
      box-shadow: 0 0 20px rgba(52, 211, 153, 0.4);
    }
    
    .role-badge.tourist {
      background: rgba(96, 165, 250, 0.3);
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
    }
    
    .role-badge.admin {
      background: rgba(167, 139, 250, 0.3);
      box-shadow: 0 0 20px rgba(167, 139, 250, 0.4);
    }
    
    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .profile-username {
      font-size: 2.5rem;
      font-weight: 300;
      color: white;
      text-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
      animation: usernameGlow 3s ease-in-out infinite alternate;
    }
    
    @keyframes usernameGlow {
      from { text-shadow: 0 0 20px rgba(96, 165, 250, 0.5); }
      to { text-shadow: 0 0 30px rgba(52, 211, 153, 0.7); }
    }
    
    .profile-role .role-text {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.1rem;
      font-weight: 300;
      text-transform: capitalize;
    }
    
    .profile-bio {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1rem;
      line-height: 1.6;
      font-weight: 300;
    }
    
    .profile-motto {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-style: italic;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .quote-icon {
      font-size: 1.5rem;
      color: rgba(96, 165, 250, 0.6);
    }
    
    .profile-stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-number {
      display: block;
      font-size: 1.5rem;
      font-weight: 400;
      color: rgba(96, 165, 250, 0.9);
      text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 300;
    }
    
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .follow-button, .message-button, .unfollow-button, .follow-suggestion-button {
      position: relative;
      padding: 0.75rem 2rem;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 2rem;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(10px);
      color: white;
      font-weight: 300;
      transition: all 0.3s ease;
      overflow: hidden;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .follow-button:hover, .message-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 30px rgba(96, 165, 250, 0.3);
      border-color: rgba(96, 165, 250, 0.4);
    }
    
    .follow-button.following {
      background: rgba(52, 211, 153, 0.2);
      border-color: rgba(52, 211, 153, 0.4);
    }
    
    .follow-button.following:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
      box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
    }
    
    .button-particles {
      position: absolute;
      inset: 0;
      background: linear-gradient(45deg, transparent, rgba(96, 165, 250, 0.2), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .follow-button:hover .button-particles,
    .message-button:hover .button-particles,
    .unfollow-button:hover .button-particles,
    .follow-suggestion-button:hover .button-particles {
      opacity: 1;
      animation: particleFlow 1s ease-in-out infinite;
    }
    
    @keyframes particleFlow {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    .tab-constellation {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 1.5rem;
      padding: 1rem;
    }
    
    .tab-nav {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .tab-button {
      padding: 1rem 2rem;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 1rem;
      background: rgba(15, 23, 42, 0.4);
      color: rgba(255, 255, 255, 0.7);
      font-weight: 300;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }
    
    .tab-button.active {
      background: rgba(96, 165, 250, 0.2);
      border-color: rgba(96, 165, 250, 0.4);
      color: white;
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
    }
    
    .tab-button:hover:not(.active) {
      background: rgba(148, 163, 184, 0.1);
      border-color: rgba(148, 163, 184, 0.3);
    }
    
    .tab-icon {
      font-size: 1.2rem;
    }
    
    .tab-count {
      padding: 0.25rem 0.5rem;
      background: rgba(96, 165, 250, 0.3);
      border-radius: 0.75rem;
      font-size: 0.75rem;
      min-width: 1.5rem;
      text-align: center;
    }
    
    .constellation-card {
      position: relative;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 1.5rem;
      padding: 1.5rem;
      transition: all 0.4s ease;
      overflow: hidden;
    }
    
    .constellation-card:hover {
      transform: translateY(-4px);
      border-color: rgba(96, 165, 250, 0.3);
    }
    
    .constellation-card:hover .card-glow {
      opacity: 1;
    }
    
    .card-glow {
      position: absolute;
      inset: -2px;
      background: linear-gradient(45deg, rgba(96, 165, 250, 0.2), rgba(52, 211, 153, 0.2));
      border-radius: 1.5rem;
      opacity: 0;
      transition: opacity 0.4s ease;
      z-index: -1;
      animation: cardGlow 3s ease-in-out infinite;
    }
    
    @keyframes cardGlow {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.4; }
    }
    
    .card-title {
      color: white;
      font-size: 1.25rem;
      font-weight: 400;
      margin-bottom: 1rem;
      line-height: 1.4;
    }
    
    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
    }
    
    .difficulty {
      padding: 0.25rem 0.75rem;
      background: rgba(96, 165, 250, 0.2);
      border: 1px solid rgba(96, 165, 250, 0.3);
      border-radius: 1rem;
      font-size: 0.75rem;
    }
    
    .price {
      color: rgba(34, 197, 94, 0.9);
      font-weight: 500;
    }
    
    .card-rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .stars {
      display: flex;
      gap: 0.125rem;
    }
    
    .star {
      font-size: 0.875rem;
      filter: drop-shadow(0 0 5px rgba(255, 193, 7, 0.5));
    }
    
    .user-avatar {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(52, 211, 153, 0.3));
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    .user-name {
      color: white;
      font-size: 1.1rem;
      font-weight: 400;
      text-align: center;
      margin-bottom: 0.5rem;
    }
    
    .user-role {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    
    .user-role.guide .role-text { color: rgba(52, 211, 153, 0.9); }
    .user-role.tourist .role-text { color: rgba(96, 165, 250, 0.9); }
    .user-role.admin .role-text { color: rgba(167, 139, 250, 0.9); }
    
    .user-bio {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
      text-align: center;
      line-height: 1.4;
      margin-bottom: 1rem;
    }
    
    .connection-lines, .mutual-connections {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    
    .connection-line, .mutual-line {
      position: absolute;
      top: 50%;
      left: 50%;
      height: 1px;
      background: linear-gradient(90deg, rgba(96, 165, 250, 0.6), transparent);
      transform-origin: left center;
      animation: connectionPulse 2s ease-in-out infinite;
    }
    
    .mutual-line {
      background: linear-gradient(90deg, rgba(52, 211, 153, 0.6), transparent);
    }
    
    @keyframes connectionPulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
    
    .section-title {
      font-size: 2rem;
      font-weight: 300;
      color: white;
      text-align: center;
      margin-bottom: 1rem;
    }
    
    .cosmic-line {
      width: 200px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.5), rgba(52, 211, 153, 0.5), transparent);
      animation: lineGlow 2s ease-in-out infinite alternate;
    }
    
    @keyframes lineGlow {
      from { box-shadow: 0 0 5px rgba(96, 165, 250, 0.3); }
      to { box-shadow: 0 0 15px rgba(52, 211, 153, 0.6); }
    }
    
    .mutual-info {
      color: rgba(52, 211, 153, 0.8);
      font-size: 0.75rem;
      text-align: center;
      margin-bottom: 0.5rem;
    }
    
    .suggested-section {
      margin-top: 3rem;
      padding-top: 3rem;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }

    /* New styles for enhanced following functionality */
    .following-nav-constellation {
      background: rgba(15, 23, 42, 0.3);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 1rem;
      padding: 0.75rem;
      margin-bottom: 2rem;
    }

    .sub-nav {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .sub-tab-button {
      padding: 0.75rem 1.5rem;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 0.75rem;
      background: rgba(15, 23, 42, 0.4);
      color: rgba(255, 255, 255, 0.7);
      font-weight: 300;
      font-size: 0.875rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .sub-tab-button.active {
      background: rgba(52, 211, 153, 0.2);
      border-color: rgba(52, 211, 153, 0.4);
      color: white;
      box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
    }

    .sub-tab-button:hover:not(.active) {
      background: rgba(148, 163, 184, 0.1);
      border-color: rgba(148, 163, 184, 0.3);
    }

    .sub-tab-count {
      padding: 0.125rem 0.375rem;
      background: rgba(52, 211, 153, 0.3);
      border-radius: 0.5rem;
      font-size: 0.6875rem;
      min-width: 1.25rem;
      text-align: center;
    }

    .subsection-title {
      font-size: 1.5rem;
      font-weight: 300;
      color: white;
      text-align: center;
      margin-bottom: 1rem;
      text-shadow: 0 0 15px rgba(96, 165, 250, 0.3);
    }

    .cosmic-line-small {
      width: 120px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.6), transparent);
      margin: 0 auto;
      animation: lineGlow 2s ease-in-out infinite alternate;
    }

    .discovery-controls {
      background: rgba(15, 23, 42, 0.3);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 1.5rem;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .search-constellation {
      position: relative;
      margin-bottom: 1.5rem;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .cosmic-search {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 2rem;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(10px);
      color: white;
      font-size: 0.875rem;
      font-weight: 300;
      transition: all 0.3s ease;
    }

    .cosmic-search:focus {
      outline: none;
      border-color: rgba(96, 165, 250, 0.5);
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.2);
    }

    .cosmic-search::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      opacity: 0.7;
    }

    .filter-stars {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .filter-star {
      padding: 0.75rem 1.5rem;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 1.5rem;
      background: rgba(15, 23, 42, 0.4);
      color: rgba(255, 255, 255, 0.7);
      font-weight: 300;
      font-size: 0.875rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .filter-star.active {
      background: rgba(167, 139, 250, 0.2);
      border-color: rgba(167, 139, 250, 0.4);
      color: white;
      box-shadow: 0 0 15px rgba(167, 139, 250, 0.3);
    }

    .filter-star:hover:not(.active) {
      background: rgba(148, 163, 184, 0.1);
      border-color: rgba(148, 163, 184, 0.3);
    }

    .galaxy-user-card {
      position: relative;
      background: rgba(15, 23, 42, 0.35);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 1.25rem;
      padding: 1.25rem;
      transition: all 0.4s ease;
      overflow: hidden;
    }

    .galaxy-user-card:hover {
      transform: translateY(-6px);
      border-color: rgba(167, 139, 250, 0.4);
      box-shadow: 0 10px 40px rgba(167, 139, 250, 0.2);
    }

    .user-bio-short {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.8rem;
      text-align: center;
      line-height: 1.3;
      margin-bottom: 1rem;
      min-height: 2.6rem;
    }

    .user-stats-mini {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 0.75rem;
    }

    .stat-mini {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .stat-icon {
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .stat-text {
      font-size: 0.75rem;
      color: rgba(96, 165, 250, 0.8);
      font-weight: 500;
    }

    .action-buttons-mini {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .follow-mini-button, .unfollow-mini-button {
      flex: 1;
      padding: 0.5rem 1rem;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 1rem;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(10px);
      color: white;
      font-weight: 300;
      font-size: 0.75rem;
      transition: all 0.3s ease;
      overflow: hidden;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .follow-mini-button:hover {
      border-color: rgba(52, 211, 153, 0.4);
      box-shadow: 0 0 15px rgba(52, 211, 153, 0.2);
    }

    .unfollow-mini-button {
      background: rgba(52, 211, 153, 0.2);
      border-color: rgba(52, 211, 153, 0.4);
    }

    .unfollow-mini-button:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
    }

    .view-profile-button {
      padding: 0.5rem;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(10px);
      color: rgba(96, 165, 250, 0.8);
      transition: all 0.3s ease;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
    }

    .view-profile-button:hover {
      border-color: rgba(96, 165, 250, 0.4);
      background: rgba(96, 165, 250, 0.1);
      box-shadow: 0 0 15px rgba(96, 165, 250, 0.2);
    }

    .user-connections {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .user-connection-line {
      position: absolute;
      top: 50%;
      left: 50%;
      height: 1px;
      background: linear-gradient(90deg, rgba(167, 139, 250, 0.6), transparent);
      transform-origin: left center;
      animation: connectionPulse 2.5s ease-in-out infinite;
    }

    .load-more-constellation {
      text-align: center;
    }

    .load-more-button {
      position: relative;
      padding: 1rem 3rem;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 2rem;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(20px);
      color: white;
      font-weight: 300;
      font-size: 1rem;
      transition: all 0.4s ease;
      overflow: hidden;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 1rem;
    }

    .load-more-button:hover {
      transform: translateY(-3px);
      border-color: rgba(167, 139, 250, 0.5);
      box-shadow: 0 0 30px rgba(167, 139, 250, 0.3);
    }

    .load-more-button:hover .button-particles {
      opacity: 1;
      animation: particleFlow 1.5s ease-in-out infinite;
    }
  `],
  animations: [
    trigger('profileReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9) translateY(20px)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ]),
    trigger('tabContent', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('cardFloat', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px) scale(0.95)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ]),
    trigger('suggestionFloat', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px) scale(0.9)' }),
        animate('0.7s ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ]),
    trigger('followButton', [
      state('notFollowing', style({ transform: 'scale(1)' })),
      state('following', style({ transform: 'scale(1)' })),
      transition('notFollowing => following', [
        animate('0.3s ease-in-out', style({ transform: 'scale(1.1)' })),
        animate('0.2s ease-in-out', style({ transform: 'scale(1)' }))
      ])
    ]),
    trigger('unfollowButton', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ]),
    trigger('followSuggestion', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('subTabContent', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('galaxyFloat', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ]),
    trigger('loadMoreFloat', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProfileComponent implements OnInit {
  particles: Particle[] = [];

  mouseX: number = 0;
  mouseY: number = 0;
  
  currentUser: User | null = null;
  isOwnProfile: boolean = false;
  activeTab: string = 'tours';
  activeFollowingTab: string = 'following';
  showingConnections: string | null = null;
  showingMutuals: string | null = null;
  showingUserConnections: string | null = null;
  connectionLines: any[] = [];
  mutualConnectionLines: any[] = [];
  userConnectionLines: any[] = [];
  
  // Search and filter properties
  searchQuery: string = '';
  activeFilter: string = 'all';
  hasMoreUsers: boolean = true;
  currentPage: number = 1;

  tabs = [
    { id: 'tours', label: 'Ture', icon: '🗺️', count: 12 },
    { id: 'blogs', label: 'Blogovi', icon: '📖', count: 8 },
    { id: 'reviews', label: 'Recenzije', icon: '⭐', count: 15 },
    { id: 'following', label: 'Praćenje', icon: '👥', count: 45 }
  ];

  userTours: Tour[] = [
    {
      id: '1',
      title: 'Magični Beograd: Kroz Istoriju',
      difficulty: 'Lako',
      price: 1500,
      rating: 4.8,
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Divlja Lepota Tare',
      difficulty: 'Teško',
      price: 3500,
      rating: 4.9,
      createdAt: new Date()
    }
  ];

  userBlogs: Blog[] = [
    {
      id: '1',
      title: 'Skriveni Biseri Srbije',
      excerpt: 'Otkrijte najlepše destinacije koje turisti retko posećuju...',
      readTime: '5 min čitanja',
      createdAt: new Date()
    }
  ];

  userReviews: Review[] = [
    {
      id: '1',
      tourTitle: 'Fruška Gora: Manastiri i Vinogradi',
      rating: 5,
      comment: 'Nezaboravno iskustvo! Preporučujem svima koji vole istoriju i prirodu.',
      createdAt: new Date()
    }
  ];

  followingUsers: User[] = [
    {
      id: '2',
      username: 'ana_jovanovic',
      role: 'guide',
      bio: 'Ljubiteljka planina i divlje prirode',
      motto: 'Svaki korak vodi ka novom otkriću',
      followersCount: 234,
      followingCount: 156,
      isFollowing: true,
      toursCount: 18,
      blogsCount: 12,
      reviewsCount: 89,
      joinedDate: new Date()
    }
  ];

  suggestedUsers: User[] = [
    {
      id: '3',
      username: 'marko_petrovic',
      role: 'tourist',
      bio: 'Fotografkinja prirode',
      motto: 'Kroz objektiv vidim svet',
      followersCount: 445,
      followingCount: 289,
      isFollowing: false,
      toursCount: 0,
      blogsCount: 24,
      reviewsCount: 67,
      joinedDate: new Date(),
      mutualFollowers: ['ana_jovanovic', 'stefan_nikolic']
    }
  ];

  followingSubTabs = [
    { id: 'following', label: 'Pratim', icon: '👥', count: 45 },
    { id: 'suggestions', label: 'Predlozi', icon: '✨', count: 12 },
    { id: 'discover', label: 'Otkrijte', icon: '🌌', count: 234 }
  ];

  userFilters = [
    { value: 'all', label: 'Svi', icon: '🌟' },
    { value: 'guide', label: 'Vodiči', icon: '🧭' },
    { value: 'tourist', label: 'Turisti', icon: '🎒' },
    { value: 'admin', label: 'Admini', icon: '👑' }
  ];

  allUsers: User[] = [
    {
      id: '4',
      username: 'milica_travel',
      role: 'guide',
      bio: 'Profesionalna vodiča za planinske ture sa 8 godina iskustva',
      motto: 'Svaki vrh ima svoju priču',
      followersCount: 678,
      followingCount: 234,
      isFollowing: false,
      toursCount: 23,
      blogsCount: 15,
      reviewsCount: 142,
      joinedDate: new Date('2024-03-15'),
      mutualFollowers: ['ana_jovanovic']
    },
    {
      id: '5',
      username: 'stefan_fotografer',
      role: 'tourist',
      bio: 'Putujući fotograf koji dokumentuje lepote Balkana',
      motto: 'Svaka slika je jedan trenutak večnosti',
      followersCount: 1234,
      followingCount: 567,
      isFollowing: false,
      toursCount: 5,
      blogsCount: 67,
      reviewsCount: 89,
      joinedDate: new Date('2024-01-20'),
      mutualFollowers: ['marko_petrovic', 'ana_jovanovic']
    },
    {
      id: '6',
      username: 'jovana_admin',
      role: 'admin',
      bio: 'Moderator zajednice i organizator najvećih turističkih događaja',
      motto: 'Zajedno stvaramo nezaboravna iskustva',
      followersCount: 892,
      followingCount: 123,
      isFollowing: false,
      toursCount: 12,
      blogsCount: 34,
      reviewsCount: 156,
      joinedDate: new Date('2024-02-10'),
      mutualFollowers: []
    },
    {
      id: '7',
      username: 'petar_explorer',
      role: 'guide',
      bio: 'Specijalizovan za avanturističke ture i ekstremne sportove',
      motto: 'Granice postoje samo u našoj glavi',
      followersCount: 445,
      followingCount: 178,
      isFollowing: true,
      toursCount: 18,
      blogsCount: 9,
      reviewsCount: 67,
      joinedDate: new Date('2024-05-05'),
      mutualFollowers: ['milica_travel']
    },
    {
      id: '8',
      username: 'ana_blogger',
      role: 'tourist',
      bio: 'Lifestyle blogger koja deli svoje putničke avanture',
      motto: 'Život je kratak za dugo planiranje',
      followersCount: 2345,
      followingCount: 789,
      isFollowing: false,
      toursCount: 3,
      blogsCount: 89,
      reviewsCount: 234,
      joinedDate: new Date('2024-04-12'),
      mutualFollowers: ['stefan_fotografer', 'jovana_admin']
    }
  ];

  filteredAllUsers: User[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.generateParticles();
    this.setupMouseListener();
    this.animateParticles();
    this.loadUserProfile();
    this.initializeAllUsers();
  }

  loadUserProfile() {
    // Mock data - in real app, load based on route params
    this.currentUser = {
      id: '1',
      username: 'marko_traveler',
      role: 'guide',
      bio: 'Strastven putnik koji istražuje svet jednu destinaciju po destinaciju. Volim da delim svoja iskustva i pomažem drugima da otkuju magiju putovanja.',
      motto: 'Putuj često, čudi se uvek',
      followersCount: 243,
      followingCount: 156,
      isFollowing: false,
      toursCount: 12,
      blogsCount: 8,
      reviewsCount: 15,
      joinedDate: new Date('2024-07-01'),
      email: 'marko@example.com'
    };
    
    this.isOwnProfile = true; // Mock - in real app, check if viewing own profile
  }

  generateParticles() {
    const particleCount = 150;
    this.particles = [];
    
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * screenWidth;
      const y = Math.random() * screenHeight;
      const type = Math.random() < 0.1 ? 'silhouette' : `type-${Math.floor(Math.random() * 3) + 1}`;
      
      this.particles.push({
        x: x,
        y: y,
        targetX: x,
        targetY: y,
        delay: Math.random() * 10,
        type: type,
        vx: 0,
        vy: 0,
        opacity: Math.random() * 0.7 + 0.3,
        size: type === 'silhouette' ? Math.random() * 4 + 3 : Math.random() * 2 + 1
      });
    }
  }



  setupMouseListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.updateParticleTargets();
      });
    }
  }

  updateParticleTargets() {
    this.particles.forEach(particle => {
      const dx = this.mouseX - particle.x;
      const dy = this.mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 120) {
        const force = (120 - distance) / 120;
        if (particle.type === 'silhouette') {
          // Silhouette particles cluster together
          particle.targetX = particle.x + (dx / distance) * force * 30;
          particle.targetY = particle.y + (dy / distance) * force * 30;
        } else {
          // Regular particles scatter away
          particle.targetX = particle.x - (dx / distance) * force * 40;
          particle.targetY = particle.y - (dy / distance) * force * 40;
        }
      } else {
        particle.targetX = particle.x;
        particle.targetY = particle.y;
      }
    });
  }

  animateParticles() {
    if (typeof window !== 'undefined') {
      const animate = () => {
        this.particles.forEach(particle => {
          const dx = particle.targetX - particle.x;
          const dy = particle.targetY - particle.y;
          
          particle.vx += dx * 0.01;
          particle.vy += dy * 0.01;
          
          particle.vx *= 0.95;
          particle.vy *= 0.95;
          
          particle.x += particle.vx;
          particle.y += particle.vy;
        });
        
        requestAnimationFrame(animate);
      };
      animate();
    }
  }



  trackParticle(index: number, particle: Particle): number {
    return index;
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  toggleFollow() {
    if (this.currentUser) {
      this.currentUser.isFollowing = !this.currentUser.isFollowing;
      // Trigger particle burst effect
      this.createParticleBurst();
    }
  }

  unfollowUser(user: User) {
    user.isFollowing = false;
    // Remove from following list
    this.followingUsers = this.followingUsers.filter(u => u.id !== user.id);
    this.createParticleBurst();
  }

  followUser(user: User) {
    user.isFollowing = true;
    // Add to following list
    this.followingUsers.push(user);
    // Remove from suggestions
    this.suggestedUsers = this.suggestedUsers.filter(u => u.id !== user.id);
    this.createParticleBurst();
  }

  createParticleBurst() {
    // Create temporary particle burst effect
    const burstParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      burstParticles.push({
        x: this.mouseX,
        y: this.mouseY,
        targetX: this.mouseX + (Math.random() - 0.5) * 200,
        targetY: this.mouseY + (Math.random() - 0.5) * 200,
        delay: 0,
        type: 'type-1',
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        opacity: 1,
        size: 2
      });
    }
    
    // Add burst particles temporarily
    this.particles.push(...burstParticles);
    
    // Remove them after animation
    setTimeout(() => {
      this.particles = this.particles.filter(p => !burstParticles.includes(p));
    }, 2000);
  }

  showConnections(user: User) {
    this.showingConnections = user.id;
    this.generateConnectionLines();
  }

  hideConnections() {
    this.showingConnections = null;
    this.connectionLines = [];
  }

  showMutualConnections(user: User) {
    this.showingMutuals = user.id;
    this.generateMutualConnectionLines();
  }

  hideMutualConnections() {
    this.showingMutuals = null;
    this.mutualConnectionLines = [];
  }

  generateConnectionLines() {
    this.connectionLines = [];
    for (let i = 0; i < 3; i++) {
      this.connectionLines.push({
        angle: Math.random() * 360,
        length: Math.random() * 100 + 50
      });
    }
  }

  generateMutualConnectionLines() {
    this.mutualConnectionLines = [];
    for (let i = 0; i < 2; i++) {
      this.mutualConnectionLines.push({
        angle: Math.random() * 360,
        length: Math.random() * 80 + 40
      });
    }
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'guide': return '🧭';
      case 'tourist': return '🎒';
      case 'admin': return '👑';
      default: return '👤';
    }
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'guide': return 'Vodič';
      case 'tourist': return 'Turista';
      case 'admin': return 'Administrator';
      default: return 'Korisnik';
    }
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('sr-RS', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // New methods for enhanced following functionality
  initializeAllUsers() {
    this.filteredAllUsers = [...this.allUsers];
  }

  setActiveFollowingTab(tabId: string) {
    this.activeFollowingTab = tabId;
  }

  filterAllUsers() {
    let filtered = [...this.allUsers];
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.bio.toLowerCase().includes(query)
      );
    }
    
    // Apply role filter
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(user => user.role === this.activeFilter);
    }
    
    this.filteredAllUsers = filtered;
  }

  setUserFilter(filterValue: string) {
    this.activeFilter = filterValue;
    this.filterAllUsers();
  }

  showUserConnections(user: User) {
    this.showingUserConnections = user.id;
    this.generateUserConnectionLines();
  }

  hideUserConnections() {
    this.showingUserConnections = null;
    this.userConnectionLines = [];
  }

  generateUserConnectionLines() {
    this.userConnectionLines = [];
    for (let i = 0; i < 4; i++) {
      this.userConnectionLines.push({
        angle: Math.random() * 360,
        length: Math.random() * 120 + 60
      });
    }
  }

  viewProfile(user: User) {
    // Navigate to user profile
    console.log('Viewing profile:', user.username);
    // In real app: this.router.navigate(['/profile', user.id]);
  }

  loadMoreUsers() {
    // Simulate loading more users
    this.currentPage++;
    
    // Generate random roles
    const roles: ('guide' | 'tourist' | 'admin')[] = ['guide', 'tourist', 'admin'];
    
    // Mock additional users
    const moreUsers: User[] = [];
    
    for (let i = 1; i <= 2; i++) {
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      
      moreUsers.push({
        id: `page${this.currentPage}_user${i}`,
        username: `putnik_${this.currentPage}${i}`,
        role: randomRole,
        bio: `Entuzijastični ${randomRole === 'guide' ? 'vodič' : randomRole === 'admin' ? 'administrator' : 'putnik'} sa strašću za istraživanjem`,
        motto: `Svaki put vodi ka novom iskustvu - ${this.currentPage}${i}`,
        followersCount: Math.floor(Math.random() * 800) + 50,
        followingCount: Math.floor(Math.random() * 400) + 20,
        isFollowing: false,
        toursCount: Math.floor(Math.random() * 15) + 1,
        blogsCount: Math.floor(Math.random() * 25) + 2,
        reviewsCount: Math.floor(Math.random() * 80) + 10,
        joinedDate: new Date(),
        mutualFollowers: []
      });
    }
    
    // Add to all users
    this.allUsers.push(...moreUsers);
    this.filterAllUsers();
    
    // Check if we should show more (limit to 5 pages for demo)
    this.hasMoreUsers = this.currentPage < 5;
  }
}