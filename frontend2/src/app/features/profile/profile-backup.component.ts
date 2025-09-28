import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-background/95 backdrop-blur-sm">
      <div class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Profile Header -->
        <div class="minimal-card mb-8 p-6 rounded-lg bg-card border border-border">
          <div class="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
            <div class="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-primary">JD</div>
            <div class="flex-1">
              <div class="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 class="text-2xl font-light mb-2">John Doe</h1>
                  <p class="text-muted-foreground">&#64;johndoe</p>
                </div>
                <div class="flex items-center space-x-3 mt-4 md:mt-0">
                  <a routerLink="/profile/edit" class="btn btn-ghost flex items-center space-x-2">
                    <span class="material-icons text-base">edit</span>
                    <span>Izmeni profil</span>
                  </a>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex items-center space-x-6 text-sm">
                  <span class="px-3 py-1 text-xs font-medium capitalize bg-gradient-to-r from-primary to-accent text-primary-foreground rounded">vodič</span>
                  <div class="flex items-center space-x-1 text-muted-foreground">
                    <span class="material-icons text-base">calendar_today</span>
                    <span>Pridružen jul 2024</span>
                  </div>
                </div>
                <div class="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span class="material-icons text-base">mail</span>
                  <span>john.doe&#64;example.com</span>
                </div>
                <p class="text-foreground leading-relaxed">Passionate traveler exploring the world one destination at a time.</p>
                <div class="flex items-start space-x-2 text-sm italic text-muted-foreground">
                  <span class="material-icons text-base">format_quote</span>
                  <span>"Wander often, wonder always."</span>
                </div>
                <div class="flex items-center space-x-6 text-sm">
                  <div class="flex items-center space-x-1">
                    <span class="material-icons text-base">group</span>
                    <span>243 pratilaca</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <span class="material-icons text-base">person</span>
                    <span>89 prati</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Tabs -->
        <div class="space-y-6">
          <div class="flex border-b border-border mb-4">
            <button class="tab-btn active">Moji blogovi (2)</button>
            <button class="tab-btn">Lajkovani (0)</button>
            <button class="tab-btn">Prati (3)</button>
          </div>
          <!-- Moji blogovi tab -->
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div class="minimal-card group hover:shadow-glow transition-all duration-300 h-full bg-card border border-border rounded-lg p-4">
              <h3 class="text-lg font-medium mb-2 leading-tight">Amazing Adventure in Japan</h3>
              <p class="text-muted-foreground text-sm leading-relaxed mb-2">Exploring the beautiful landscapes and culture...</p>
              <div class="flex items-center justify-between text-xs text-muted-foreground">
                <div class="flex items-center space-x-3">
                  <span class="material-icons text-base">favorite</span>
                  <span>12</span>
                  <span class="material-icons text-base">chat_bubble</span>
                  <span>3</span>
                </div>
                <span>2 dana</span>
              </div>
            </div>
            <div class="minimal-card group hover:shadow-glow transition-all duration-300 h-full bg-card border border-border rounded-lg p-4">
              <h3 class="text-lg font-medium mb-2 leading-tight">Hidden Gems of Europe</h3>
              <p class="text-muted-foreground text-sm leading-relaxed mb-2">Discovering off-the-beaten-path destinations...</p>
              <div class="flex items-center justify-between text-xs text-muted-foreground">
                <div class="flex items-center space-x-3">
                  <span class="material-icons text-base">favorite</span>
                  <span>8</span>
                  <span class="material-icons text-base">chat_bubble</span>
                  <span>1</span>
                </div>
                <span>1 nedelja</span>
              </div>
            </div>
          </div>
          <!-- Lajkovani tab (empty) -->
          <div class="hidden">
            <div class="col-span-full text-center py-12">
              <span class="material-icons text-6xl text-muted-foreground mb-4">favorite_border</span>
              <h3 class="text-xl font-medium mb-2">Nemate lajkovanih blogova</h3>
            </div>
          </div>
          <!-- Prati tab -->
          <div class="hidden grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div class="minimal-card group hover:shadow-glow transition-all duration-300 bg-card border border-border rounded-lg p-4 flex items-center space-x-3">
              <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold">U1</div>
              <div>
                <div class="font-medium">Korisnik 1</div>
                <div class="text-sm text-muted-foreground">Prati od 12. jul 2024</div>
              </div>
            </div>
            <div class="minimal-card group hover:shadow-glow transition-all duration-300 bg-card border border-border rounded-lg p-4 flex items-center space-x-3">
              <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold">U2</div>
              <div>
                <div class="font-medium">Korisnik 2</div>
                <div class="text-sm text-muted-foreground">Prati od 1. avg 2024</div>
              </div>
            </div>
            <div class="minimal-card group hover:shadow-glow transition-all duration-300 bg-card border border-border rounded-lg p-4 flex items-center space-x-3">
              <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold">U3</div>
              <div>
                <div class="font-medium">Korisnik 3</div>
                <div class="text-sm text-muted-foreground">Prati od 20. avg 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {

}