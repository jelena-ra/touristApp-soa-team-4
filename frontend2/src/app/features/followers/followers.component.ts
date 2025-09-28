import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

@Component({
  selector: 'app-followers',
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
      <div class="relative z-10 min-h-screen">
        <div class="max-w-7xl mx-auto px-6 py-12">
          
          <!-- Page Header Constellation -->
          <div class="page-header-constellation mb-16" [@pageHeaderReveal]>
            <div class="header-content">
              <h1 class="page-title">Vaši Pratioci</h1>
              <div class="cosmic-line"></div>
              <p class="page-subtitle">Otkrijte ko vas prati i povežite se sa novim ljudima</p>
            </div>
            
            <!-- Stats Overview -->
            <div class="stats-constellation mt-8">
              <div class="stat-card" [@statFloat]>
                <span class="stat-icon">👥</span>
                <span class="stat-number">{{ followersList.length }}</span>
                <span class="stat-label">Pratioci</span>
              </div>
              <div class="stat-card" [@statFloat] [style.animation-delay]="'0.1s'">
                <span class="stat-icon">✨</span>
                <span class="stat-number">{{ suggestedUsers.length }}</span>
                <span class="stat-label">Predlozi</span>
              </div>
              <div class="stat-card" [@statFloat] [style.animation-delay]="'0.2s'">
                <span class="stat-icon">🌟</span>
                <span class="stat-number">{{ mutualConnectionsCount }}</span>
                <span class="stat-label">Zajedničke veze</span>
              </div>
            </div>
          </div>

          <!-- Search and Filter Controls -->
          <div class="controls-constellation mb-8" [@controlsReveal]>
            <div class="search-constellation">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                [ngModelOptions]="{standalone: true}"
                (input)="filterFollowers()"
                placeholder="Pretražite pratioce..." 
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

          <!-- Followers Grid -->
          <div class="followers-section mb-16">
            <h2 class="section-title">Vaši Pratioci</h2>
            <div class="cosmic-line-small"></div>
            
            <div class="followers-galaxy mt-8">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div *ngFor="let follower of filteredFollowers; let i = index" 
                     [@followerCardFloat]
                     [style.animation-delay]="i * 0.05 + 's'"
                     class="follower-card constellation-card"
                     (mouseenter)="showFollowerConnections(follower)"
                     (mouseleave)="hideFollowerConnections()">
                  <div class="card-content">
                    <div class="user-avatar" 
                         [style.background-image]="follower.profilePicture ? 'url(' + follower.profilePicture + ')' : ''">
                      <span *ngIf="!follower.profilePicture" class="avatar-placeholder">
                        {{ follower.username[0].toUpperCase() }}
                      </span>
                    </div>
                    
                    <h3 class="user-name">{{ follower.username }}</h3>
                    
                    <div class="user-role" [ngClass]="follower.role">
                      <span class="role-icon">{{ getRoleIcon(follower.role) }}</span>
                      <span class="role-text">{{ getRoleText(follower.role) }}</span>
                    </div>
                    
                    <p class="user-motto">"{{ follower.motto }}"</p>
                    <p class="user-bio-short">{{ follower.bio | slice:0:60 }}{{ follower.bio.length > 60 ? '...' : '' }}</p>
                    
                    <!-- User Stats Mini -->
                    <div class="user-stats-mini">
                      <div class="stat-mini">
                        <span class="stat-icon">👥</span>
                        <span class="stat-text">{{ follower.followersCount }}</span>
                      </div>
                      <div class="stat-mini">
                        <span class="stat-icon">🗺️</span>
                        <span class="stat-text">{{ follower.toursCount }}</span>
                      </div>
                      <div class="stat-mini">
                        <span class="stat-icon">📖</span>
                        <span class="stat-text">{{ follower.blogsCount }}</span>
                      </div>
                    </div>

                    <div class="action-buttons-mini">
                      <button 
                        *ngIf="!follower.isFollowing"
                        (click)="followBack(follower)"
                        [@followBackButton]
                        class="follow-back-button">
                        <span class="button-particles"></span>
                        <span>Prati Nazad</span>
                      </button>
                      <button 
                        *ngIf="follower.isFollowing"
                        (click)="unfollowUser(follower)"
                        [@unfollowButton]
                        class="unfollow-button">
                        <span class="button-particles"></span>
                        <span>Prekini Praćenje</span>
                      </button>
                      <button 
                        (click)="viewProfile(follower)"
                        class="view-profile-button">
                        <span class="button-icon">👁️</span>
                      </button>
                      <button 
                        (click)="removeFollower(follower)"
                        class="remove-follower-button">
                        <span class="button-icon">🚫</span>
                      </button>
                    </div>
                  </div>
                  
                  <div class="card-glow"></div>
                  
                  <!-- Connection Lines for Followers -->
                  <div class="follower-connections" *ngIf="showingFollowerConnections === follower.id">
                    <div *ngFor="let connection of followerConnectionLines" 
                         class="follower-connection-line"
                         [style.transform]="'rotate(' + connection.angle + 'deg)'"
                         [style.width.px]="connection.length"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Suggested Users Section -->
          <div class="suggested-section">
            <h2 class="section-title">Ljudi koje možda poznajete</h2>
            <div class="cosmic-line-small"></div>
            <p class="section-subtitle">Na osnovu zajedničkih veza i interesovanja</p>
            
            <div class="suggestions-galaxy mt-8">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <div *ngFor="let suggestion of suggestedUsers; let i = index" 
                     [@suggestionCardFloat]
                     [style.animation-delay]="i * 0.1 + 's'"
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
                      <span class="mutual-icon">🔗</span>
                      {{ suggestion.mutualFollowers.length }} zajedničkih pratioca
                    </p>
                    
                    <p class="suggestion-reason">{{ getSuggestionReason(suggestion) }}</p>
                    
                    <button 
                      (click)="followUser(suggestion)"
                      [@followSuggestion]
                      class="follow-suggestion-button">
                      <span class="button-particles"></span>
                      <span class="button-icon">✨</span>
                      <span>Prati</span>
                    </button>
                  </div>
                  
                  <div class="card-glow suggestion-glow"></div>
                  
                  <!-- Mutual Connection Lines -->
                  <div class="mutual-connections" *ngIf="showingMutuals === suggestion.id">
                    <div *ngFor="let line of mutualConnectionLines" 
                         class="mutual-line"
                         [style.transform]="'rotate(' + line.angle + 'deg)'"
                         [style.width.px]="line.length"></div>
                  </div>
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
    

    
    .page-header-constellation {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 2rem;
      padding: 3rem;
      text-align: center;
      box-shadow: 
        0 0 40px rgba(96, 165, 250, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    
    .page-title {
      font-size: 3rem;
      font-weight: 300;
      color: white;
      text-shadow: 0 0 30px rgba(96, 165, 250, 0.6);
      margin-bottom: 1rem;
      animation: titleGlow 4s ease-in-out infinite alternate;
    }
    
    @keyframes titleGlow {
      from { text-shadow: 0 0 30px rgba(96, 165, 250, 0.6); }
      to { text-shadow: 0 0 50px rgba(52, 211, 153, 0.8); }
    }
    
    .cosmic-line {
      width: 300px;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.6), rgba(52, 211, 153, 0.6), transparent);
      margin: 1.5rem auto;
      animation: lineGlow 3s ease-in-out infinite alternate;
    }
    
    .cosmic-line-small {
      width: 150px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.6), transparent);
      margin: 0 auto;
      animation: lineGlow 2s ease-in-out infinite alternate;
    }
    
    @keyframes lineGlow {
      from { box-shadow: 0 0 10px rgba(96, 165, 250, 0.4); }
      to { box-shadow: 0 0 20px rgba(52, 211, 153, 0.7); }
    }
    
    .page-subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.2rem;
      font-weight: 300;
    }
    
    .stats-constellation {
      display: flex;
      justify-content: center;
      gap: 3rem;
      flex-wrap: wrap;
    }
    
    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 1.5rem;
      transition: all 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      border-color: rgba(96, 165, 250, 0.4);
      box-shadow: 0 10px 30px rgba(96, 165, 250, 0.2);
    }
    
    .stat-icon {
      font-size: 2rem;
    }
    
    .stat-number {
      font-size: 2rem;
      font-weight: 500;
      color: rgba(96, 165, 250, 0.9);
      text-shadow: 0 0 15px rgba(96, 165, 250, 0.5);
    }
    
    .stat-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
      font-weight: 300;
    }
    
    .controls-constellation {
      background: rgba(15, 23, 42, 0.3);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 1.5rem;
      padding: 2rem;
    }
    
    .search-constellation {
      position: relative;
      margin-bottom: 1.5rem;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .cosmic-search {
      width: 100%;
      padding: 1rem 1rem 1rem 3.5rem;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 2rem;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(10px);
      color: white;
      font-size: 1rem;
      font-weight: 300;
      transition: all 0.3s ease;
    }
    
    .cosmic-search:focus {
      outline: none;
      border-color: rgba(96, 165, 250, 0.5);
      box-shadow: 0 0 25px rgba(96, 165, 250, 0.3);
    }
    
    .cosmic-search::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    
    .search-icon {
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.2rem;
      opacity: 0.7;
    }
    
    .filter-stars {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .filter-star {
      padding: 0.875rem 1.75rem;
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
      box-shadow: 0 0 20px rgba(167, 139, 250, 0.3);
    }
    
    .filter-star:hover:not(.active) {
      background: rgba(148, 163, 184, 0.1);
      border-color: rgba(148, 163, 184, 0.3);
    }
    
    .section-title {
      font-size: 2.5rem;
      font-weight: 300;
      color: white;
      text-align: center;
      margin-bottom: 1rem;
      text-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
    }
    
    .section-subtitle {
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1rem;
      font-weight: 300;
      margin-top: 1rem;
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
    
    .follower-card:hover {
      transform: translateY(-8px);
      border-color: rgba(96, 165, 250, 0.4);
      box-shadow: 0 15px 50px rgba(96, 165, 250, 0.3);
    }
    
    .suggestion-card:hover {
      transform: translateY(-8px);
      border-color: rgba(52, 211, 153, 0.4);
      box-shadow: 0 15px 50px rgba(52, 211, 153, 0.3);
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
      animation: cardGlow 4s ease-in-out infinite;
    }
    
    .suggestion-glow {
      background: linear-gradient(45deg, rgba(52, 211, 153, 0.2), rgba(167, 139, 250, 0.2));
    }
    
    @keyframes cardGlow {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.5; }
    }
    
    .user-avatar {
      width: 5rem;
      height: 5rem;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(52, 211, 153, 0.3));
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      border: 3px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }
    
    .constellation-card:hover .user-avatar {
      border-color: rgba(96, 165, 250, 0.4);
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
    }
    
    .avatar-placeholder {
      color: white;
      font-size: 1.5rem;
      font-weight: 500;
    }
    
    .user-name {
      color: white;
      font-size: 1.2rem;
      font-weight: 400;
      text-align: center;
      margin-bottom: 0.5rem;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
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
    
    .user-motto {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
      font-style: italic;
      text-align: center;
      margin-bottom: 0.75rem;
      min-height: 1.25rem;
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
    
    .stat-mini .stat-icon {
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
      flex-wrap: wrap;
    }
    
    .follow-back-button, .unfollow-button, .follow-suggestion-button {
      flex: 1;
      min-width: 120px;
      padding: 0.625rem 1rem;
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
      gap: 0.5rem;
    }
    
    .follow-back-button:hover {
      border-color: rgba(52, 211, 153, 0.4);
      box-shadow: 0 0 20px rgba(52, 211, 153, 0.3);
    }
    
    .unfollow-button {
      background: rgba(52, 211, 153, 0.2);
      border-color: rgba(52, 211, 153, 0.4);
    }
    
    .unfollow-button:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
    }
    
    .follow-suggestion-button:hover {
      border-color: rgba(167, 139, 250, 0.4);
      box-shadow: 0 0 20px rgba(167, 139, 250, 0.3);
    }
    
    .view-profile-button, .remove-follower-button {
      padding: 0.625rem;
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
      width: 2.75rem;
      height: 2.75rem;
    }
    
    .view-profile-button:hover {
      border-color: rgba(96, 165, 250, 0.4);
      background: rgba(96, 165, 250, 0.1);
      box-shadow: 0 0 15px rgba(96, 165, 250, 0.3);
    }
    
    .remove-follower-button {
      color: rgba(239, 68, 68, 0.8);
    }
    
    .remove-follower-button:hover {
      border-color: rgba(239, 68, 68, 0.4);
      background: rgba(239, 68, 68, 0.1);
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
    }
    
    .button-particles {
      position: absolute;
      inset: 0;
      background: linear-gradient(45deg, transparent, rgba(96, 165, 250, 0.2), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .follow-back-button:hover .button-particles,
    .unfollow-button:hover .button-particles,
    .follow-suggestion-button:hover .button-particles {
      opacity: 1;
      animation: particleFlow 1.5s ease-in-out infinite;
    }
    
    @keyframes particleFlow {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    .mutual-info {
      color: rgba(52, 211, 153, 0.9);
      font-size: 0.8rem;
      text-align: center;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .mutual-icon {
      font-size: 0.9rem;
    }
    
    .suggestion-reason {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.75rem;
      text-align: center;
      margin-bottom: 1rem;
      font-style: italic;
    }
    
    .follower-connections, .mutual-connections {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    
    .follower-connection-line, .mutual-line {
      position: absolute;
      top: 50%;
      left: 50%;
      height: 1px;
      transform-origin: left center;
      animation: connectionPulse 3s ease-in-out infinite;
    }
    
    .follower-connection-line {
      background: linear-gradient(90deg, rgba(96, 165, 250, 0.7), transparent);
    }
    
    .mutual-line {
      background: linear-gradient(90deg, rgba(52, 211, 153, 0.7), transparent);
    }
    
    @keyframes connectionPulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    
    .suggested-section {
      margin-top: 4rem;
      padding-top: 3rem;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }
  `],
  animations: [
    trigger('pageHeaderReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9) translateY(30px)' }),
        animate('1s ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ]),
    trigger('controlsReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s 0.2s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('statFloat', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px) scale(0.9)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ]),
    trigger('followerCardFloat', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px) scale(0.95)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ]),
    trigger('suggestionCardFloat', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px) scale(0.9)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ]),
    trigger('followBackButton', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
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
        animate('0.5s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class FollowersComponent implements OnInit {
  particles: Particle[] = [];

  mouseX: number = 0;
  mouseY: number = 0;
  
  // Search and filter properties
  searchQuery: string = '';
  activeFilter: string = 'all';
  
  // Connection display state
  showingFollowerConnections: string | null = null;
  showingMutuals: string | null = null;
  followerConnectionLines: any[] = [];
  mutualConnectionLines: any[] = [];
  
  // Stats
  mutualConnectionsCount: number = 12;

  userFilters = [
    { value: 'all', label: 'Svi', icon: '🌟' },
    { value: 'guide', label: 'Vodiči', icon: '🧭' },
    { value: 'tourist', label: 'Turisti', icon: '🎒' },
    { value: 'admin', label: 'Admini', icon: '👑' }
  ];

  followersList: User[] = [
    {
      id: 'f1',
      username: 'ana_mountain_guide',
      role: 'guide',
      bio: 'Profesionalna vodiča sa 10 godina iskustva u planinskim turama',
      motto: 'Svaki vrh je nova avantura',
      followersCount: 567,
      followingCount: 234,
      isFollowing: true,
      toursCount: 28,
      blogsCount: 15,
      reviewsCount: 142,
      joinedDate: new Date('2024-02-15'),
      mutualFollowers: ['stefan_foto', 'marko_hiker']
    },
    {
      id: 'f2',
      username: 'petar_explorer',
      role: 'tourist',
      bio: 'Avanturista koji voli da istražuje skrivene bisere prirode',
      motto: 'Putovanje je najbolji učitelj',
      followersCount: 234,
      followingCount: 445,
      isFollowing: false,
      toursCount: 8,
      blogsCount: 23,
      reviewsCount: 67,
      joinedDate: new Date('2024-04-20'),
      mutualFollowers: ['ana_mountain_guide', 'jovana_admin']
    },
    {
      id: 'f3',
      username: 'milica_photographer',
      role: 'tourist',
      bio: 'Fotografkinja koja dokumentuje lepote Srbije kroz objektiv',
      motto: 'Slika govori hiljadu reči',
      followersCount: 892,
      followingCount: 356,
      isFollowing: true,
      toursCount: 12,
      blogsCount: 45,
      reviewsCount: 198,
      joinedDate: new Date('2024-01-10'),
      mutualFollowers: ['stefan_foto', 'ana_mountain_guide', 'petar_explorer']
    },
    {
      id: 'f4',
      username: 'jovana_admin',
      role: 'admin',
      bio: 'Administrator platforme i organizator grupnih putovanja',
      motto: 'Zajedno je uvek bolje',
      followersCount: 1234,
      followingCount: 567,
      isFollowing: true,
      toursCount: 15,
      blogsCount: 8,
      reviewsCount: 45,
      joinedDate: new Date('2023-12-05'),
      mutualFollowers: ['ana_mountain_guide', 'milica_photographer']
    },
    {
      id: 'f5',
      username: 'stefan_adventurer',
      role: 'guide',
      bio: 'Specijalizovan za ekstremne sportove i avanturističke aktivnosti',
      motto: 'Život bez rizika nije život',
      followersCount: 445,
      followingCount: 178,
      isFollowing: false,
      toursCount: 22,
      blogsCount: 12,
      reviewsCount: 89,
      joinedDate: new Date('2024-03-22'),
      mutualFollowers: ['petar_explorer']
    },
    {
      id: 'f6',
      username: 'nina_culture_lover',
      role: 'tourist',
      bio: 'Ljubiteljka kulturnih znamenitosti i istorijskih mesta',
      motto: 'Prošlost oblikuje budućnost',
      followersCount: 678,
      followingCount: 432,
      isFollowing: true,
      toursCount: 6,
      blogsCount: 34,
      reviewsCount: 156,
      joinedDate: new Date('2024-05-08'),
      mutualFollowers: ['jovana_admin', 'milica_photographer']
    }
  ];

  suggestedUsers: User[] = [
    {
      id: 's1',
      username: 'marko_wilderness',
      role: 'guide',
      bio: 'Vodič za divljinu i survival ekspert',
      motto: 'Priroda je najbolji učitelj',
      followersCount: 789,
      followingCount: 234,
      isFollowing: false,
      toursCount: 31,
      blogsCount: 18,
      reviewsCount: 203,
      joinedDate: new Date('2024-02-28'),
      mutualFollowers: ['ana_mountain_guide', 'stefan_adventurer', 'petar_explorer']
    },
    {
      id: 's2',
      username: 'sara_city_tours',
      role: 'guide',
      bio: 'Stručnjak za urbani turizam i gradske ture',
      motto: 'Svaki grad ima svoju dušu',
      followersCount: 456,
      followingCount: 189,
      isFollowing: false,
      toursCount: 24,
      blogsCount: 21,
      reviewsCount: 134,
      joinedDate: new Date('2024-03-12'),
      mutualFollowers: ['jovana_admin', 'nina_culture_lover']
    },
    {
      id: 's3',
      username: 'luka_foodie',
      role: 'tourist',
      bio: 'Gastronomski entuzijasta i ljubitelj lokalnih specijaliteta',
      motto: 'Hrana spaja kulturen',
      followersCount: 332,
      followingCount: 567,
      isFollowing: false,
      toursCount: 4,
      blogsCount: 67,
      reviewsCount: 289,
      joinedDate: new Date('2024-04-15'),
      mutualFollowers: ['milica_photographer', 'nina_culture_lover']
    },
    {
      id: 's4',
      username: 'elena_wellness',
      role: 'guide',
      bio: 'Instruktor joge i vodič za wellness retreats',
      motto: 'Balans uma, tela i duše',
      followersCount: 543,
      followingCount: 221,
      isFollowing: false,
      toursCount: 16,
      blogsCount: 29,
      reviewsCount: 178,
      joinedDate: new Date('2024-01-25'),
      mutualFollowers: ['ana_mountain_guide']
    },
    {
      id: 's5',
      username: 'dusan_historian',
      role: 'tourist',
      bio: 'Istoričar koji voli da istražuje istorijska mesta',
      motto: 'Istorija živi u svakom kamenu',
      followersCount: 234,
      followingCount: 345,
      isFollowing: false,
      toursCount: 7,
      blogsCount: 45,
      reviewsCount: 123,
      joinedDate: new Date('2024-06-02'),
      mutualFollowers: ['nina_culture_lover', 'jovana_admin']
    }
  ];

  filteredFollowers: User[] = [];

  constructor() {}

  ngOnInit() {
    this.generateParticles();
    this.setupMouseListener();
    this.animateParticles();
    this.initializeFollowers();
  }

  initializeFollowers() {
    this.filteredFollowers = [...this.followersList];
  }

  generateParticles() {
    const particleCount = 120;
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
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        if (particle.type === 'silhouette') {
          particle.targetX = particle.x + (dx / distance) * force * 25;
          particle.targetY = particle.y + (dy / distance) * force * 25;
        } else {
          particle.targetX = particle.x - (dx / distance) * force * 35;
          particle.targetY = particle.y - (dy / distance) * force * 35;
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

  filterFollowers() {
    let filtered = [...this.followersList];
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.bio.toLowerCase().includes(query) ||
        user.motto.toLowerCase().includes(query)
      );
    }
    
    // Apply role filter
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(user => user.role === this.activeFilter);
    }
    
    this.filteredFollowers = filtered;
  }

  setUserFilter(filterValue: string) {
    this.activeFilter = filterValue;
    this.filterFollowers();
  }

  showFollowerConnections(follower: User) {
    this.showingFollowerConnections = follower.id;
    this.generateFollowerConnectionLines();
  }

  hideFollowerConnections() {
    this.showingFollowerConnections = null;
    this.followerConnectionLines = [];
  }

  generateFollowerConnectionLines() {
    this.followerConnectionLines = [];
    for (let i = 0; i < 5; i++) {
      this.followerConnectionLines.push({
        angle: Math.random() * 360,
        length: Math.random() * 150 + 80
      });
    }
  }

  showMutualConnections(user: User) {
    this.showingMutuals = user.id;
    this.generateMutualConnectionLines();
  }

  hideMutualConnections() {
    this.showingMutuals = null;
    this.mutualConnectionLines = [];
  }

  generateMutualConnectionLines() {
    this.mutualConnectionLines = [];
    for (let i = 0; i < 3; i++) {
      this.mutualConnectionLines.push({
        angle: Math.random() * 360,
        length: Math.random() * 100 + 60
      });
    }
  }

  followBack(user: User) {
    user.isFollowing = true;
    // Add particle burst effect
    this.createParticleBurst();
  }

  unfollowUser(user: User) {
    user.isFollowing = false;
    this.createParticleBurst();
  }

  followUser(user: User) {
    user.isFollowing = true;
    // Move from suggestions to followers
    this.suggestedUsers = this.suggestedUsers.filter(u => u.id !== user.id);
    this.followersList.push(user);
    this.filterFollowers();
    this.createParticleBurst();
  }

  removeFollower(user: User) {
    // Remove from followers list
    this.followersList = this.followersList.filter(u => u.id !== user.id);
    this.filterFollowers();
    this.createParticleBurst();
  }

  viewProfile(user: User) {
    console.log('Viewing profile:', user.username);
    // In real app: navigate to profile
  }

  createParticleBurst() {
    // Create temporary particle burst effect
    const burstParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      burstParticles.push({
        x: this.mouseX,
        y: this.mouseY,
        targetX: this.mouseX + (Math.random() - 0.5) * 200,
        targetY: this.mouseY + (Math.random() - 0.5) * 200,
        delay: 0,
        type: 'type-1',
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        opacity: 1,
        size: 2
      });
    }
    
    this.particles.push(...burstParticles);
    
    setTimeout(() => {
      this.particles = this.particles.filter(p => !burstParticles.includes(p));
    }, 1500);
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

  getSuggestionReason(user: User): string {
    if (user.mutualFollowers && user.mutualFollowers.length > 0) {
      return `Zajedničke veze sa ${user.mutualFollowers.length} osoba`;
    }
    if (user.role === 'guide') {
      return 'Iskusan vodič u vašoj oblasti';
    }
    if (user.role === 'admin') {
      return 'Deo administrative zajednice';
    }
    return 'Sličnih je interesovanja kao vi';
  }
}