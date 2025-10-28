import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { TourInterface } from "../model/tour.interface";
import { TourService } from "../services/tour.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from "@angular/material/card";
import { CommonModule } from "@angular/common";
import { MatChipsModule } from '@angular/material/chips';
import { MatButton } from "@angular/material/button";
import { RouterLink } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { CreateTourDialog } from "../create-tour/create-tour.component";
import { MatDialogModule } from "@angular/material/dialog";
import { TourExecution } from "../model/tour-execution.interface";
import { TourExecutionService } from "../services/tour-execution.service";
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from "../../auth/auth.service";
import { User } from "../../auth/model/user.model";
import { PurchaseService, TourPurchaseToken } from "../../purchase/service/purchase.service";
import { OrderItem } from "../../purchase/model/order-item.interface";
import { MatSnackBar } from '@angular/material/snack-bar';
import { TourDetailsDialogComponent } from "../tour-details/tourist/tour-details-dialog.component";
import { RecensionListComponent } from "../recension-list/recension-list";


@Component({
    selector: 'view-tours',
    templateUrl: './view-tours.component.html',
    styleUrl: './view-tours.component.scss',
    imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    CommonModule,
    MatCardSubtitle,
    MatCardContent,
    MatChipsModule,
    MatCardActions,
    MatButton,
    RouterLink,
    MatDialogModule,
    RecensionListComponent
]
})
export class ViewToursPage implements OnInit{
    tours: TourInterface[] = []
    openBuyDialog: boolean = false;
    isRecensionListVisible = false;
    selectedTourIdForRecensions: string | null = null;

    tourSelected:TourInterface={
        id: "",
            authorId: "",
            name: "",
            description: "",
            difficulty: "EASY",
            tags: ["Nature"],
            status: "DRAFT",
            price: 0,
            length: null,
            travelTimes: null,
            keyPoints: []};
    
    readonly dialog = inject(MatDialog);
    activeExecution: TourExecution | null = null;
    
    private userId: string = "";
    userTokens: TourPurchaseToken[] = [];  
    user: User | null = null;
    userTours: TourInterface[] = []

    constructor(private tourService: TourService,
        private destroyRef: DestroyRef,
        private snackBar: MatSnackBar,
        private tourExecutionService: TourExecutionService,
        private purchaseService: PurchaseService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.getAllTours()
        this.authService.getUser().subscribe(user => {
            this.userId = user.id;
            this.user = user;
            console.log('Trenutni korisnik:', this.userId);
            console.log('Trenutni korisnik:', this.user);
            this.loadUserToursWithTokens();
        });
    }

    getAllTours(): void {
        this.tourService.getAll()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((response) => {
            console.log("User role: ", this.user?.role)
            if(this.user?.role === "author") {
                this.tours = response.filter(t => {
                    return t.authorId == this.user?.id
                })
            } else {
                this.tours = response.filter(t => {
                    return t.status === "PUBLISHED"
                })
            }
            this.checkActiveExecution();
            });
    }

    buyTour():void{
        this.openBuyDialog=false;
          const payload = {
        user_id: this.userId, 
        item: {
            tour_id: this.tourSelected.id,
            name: this.tourSelected.name,
            price: this.tourSelected.price
        }
    };
        
    this.purchaseService.addToCart(payload).subscribe({
        next: (response) => {
            console.log("Tour added to cart:", response);
             this.snackBar.open('Tour successfully added to cart!', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
            });
        },
        error: (err) => {
            console.error("Error adding tour to cart:", err);
             this.snackBar.open('Failed to add tour to cart.', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
            });
        }
    });
    }
    cancelBuying():void{
        this.openBuyDialog=false;
    }
    openbuyTour(itemSelected: TourInterface):void{
        this.openBuyDialog=true; 
        this.tourSelected =itemSelected;
    }
    openCreateTour(): void {
        if(this.userId === '' || this.userId === '0') {
            alert('You must be logged in to create a tour.');
            return;
        }
        const dialogRef = this.dialog.open(CreateTourDialog);

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                console.log(result)
                this.tours = [...this.tours, result]
            }
        })
    }

    checkActiveExecution(): void {
        this.tourExecutionService.getActiveTour().pipe(
        
            catchError(error => of(null)) 
        ).subscribe(execution => {
            this.activeExecution = execution;
            console.log('Aktivna tura:', this.activeExecution);
        });
    }

    openTourDetailsDialog(tour: TourInterface): void {
        if (!tour) return;
        this.tourService.getById(tour.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
        next: (response) => {
            var bought = this.isBought(tour.id);
            this.dialog.open(TourDetailsDialogComponent, {
                data: {
                    tour: response,
                    bought: bought
                }
            });
        }
        })
    }

    private loadUserToursWithTokens(): void {
        this.purchaseService.getTokens(this.userId).pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((tokens: TourPurchaseToken[]) => {
            this.userTokens = tokens; 
            console.log("Tokens: ", tokens)
            if (tokens.length === 0) {
            return of([]);
            }

            const tourIdsFromTokens = tokens.map(token => token. tour_id);
        
            const uniqueTourIds = [...new Set(tourIdsFromTokens)];

        
            return this.tourService.getAll().pipe(
            map((allTours: TourInterface[]) => {
                console.log("AllTours: ", allTours)
                return allTours.filter(tour => uniqueTourIds.includes(tour.id));
            }),
            catchError(error => {
                console.error('Error fetching all tours:', error);
        
                return of([]);
            })
            );
        }),
        catchError(error => {
            console.error('Error fetching user tokens:', error);
        
            return of([]);
        })
        ).subscribe((filteredTours: TourInterface[]) => {
            this.userTours = filteredTours;
            console.log('User-specific tours loaded:', this.userTours);
        });
    }

    isBought(id: string): boolean {
        let t = this.userTours.find(t => {
            return t.id == id;
        })
        if(t) return true;
        return false;
    }

    openRecensionListModal(tour: TourInterface): void {
        this.selectedTourIdForRecensions = tour.id;
        this.isRecensionListVisible = true;
    }

    onRecensionListModalClose(): void {
        this.isRecensionListVisible = false;
        this.selectedTourIdForRecensions = null;
    }
}