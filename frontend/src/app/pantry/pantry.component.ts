import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PantryService } from '../services/pantry.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-pantry',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './pantry.component.html',
  styleUrl: './pantry.component.scss',
})
export class PantryComponent implements OnInit {
  pantryItems: any[] = [];
  suggestions: any[] = [];
  categories: string[] = [];
  selectedCategory = 'ALL';
  expiresBefore = '';
  expiresAfter = '';

  selectedItemUnits: string[] = [];
  itemSearch = '';
  showSuggestions = false;
  private searchSubject = new Subject<string>();

  // Use number | null for type safety
  newEntry: {
    item: number | null;
    quantity: number;
    unit: string;
    expiration_date: string;
  } = {
    item: null,
    quantity: 1,
    unit: 'NONE',
    expiration_date: '',
  };

  units = [
    'PCS',
    'PACK',
    'BOX',
    'BAG',
    'BOTTLE',
    'CAN',
    'JAR',
    'G',
    'KG',
    'ML',
    'L',
    'TSP',
    'TBSP',
    'CUP',
    'CUPS',
    'SLICE',
    'SLICES',
    'LEAVES',
    'CLOVE',
    'CLOVES',
    'PINCH',
    'NONE',
  ];

  // Error message for user feedback
  addError: string | null = null;

  constructor(
    private pantryService: PantryService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadPantry();

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.pantryService.searchItems(query)),
      )
      .subscribe({
        next: (data) => (this.suggestions = data),
        error: (err) => console.error('Search failed:', err),
      });
  }

  onSearchInput() {
    if (!this.itemSearch.trim()) {
      this.suggestions = [];
      return;
    }
    this.searchSubject.next(this.itemSearch);
  }

  loadPantry() {
    const filters: any = {};
    if (this.selectedCategory && this.selectedCategory !== 'ALL')
      filters.category = this.selectedCategory;
    if (this.expiresBefore) filters.expires_before = this.expiresBefore;
    if (this.expiresAfter) filters.expires_after = this.expiresAfter;

    this.pantryService.getPantry(filters).subscribe((data) => {
      this.pantryItems = [...data];
      const cats = [
        ...new Set(
          data
            .map(
              (e: any) =>
                e.item_category ||
                e.item?.category ||
                e.item?.category?.toString(),
            )
            .filter(Boolean),
        ),
      ] as string[];
      this.categories = ['ALL', ...cats];
      this.cdr.markForCheck();
    });
  }

  get filteredPantry() {
    if (this.selectedCategory === 'ALL') return this.pantryItems;
    return this.pantryItems.filter(
      (entry) =>
        (entry.item_category || entry.item?.category) === this.selectedCategory,
    );
  }

  applyFilters() {
    this.loadPantry();
  }

  clearFilters() {
    this.selectedCategory = 'ALL';
    this.expiresBefore = '';
    this.expiresAfter = '';
    this.loadPantry();
  }

  selectItem(item: any) {
    this.newEntry.item = item.id;
    this.newEntry.unit = item.allowed_units?.[0] ?? 'NONE';
    this.itemSearch = item.name;
    this.suggestions = [];
    this.showSuggestions = false;
    this.selectedItemUnits = item.allowed_units ?? [];
    this.addError = null; // Clear error if user selects an item
  }

  addEntry() {
    // Prevent submission if item is not selected
    if (!this.newEntry.item) {
      this.addError = 'Please select an item from the suggestions.';
      return;
    }

    if (!this.newEntry.expiration_date) {
      this.addError = 'Please enter expiration date.';
      return;
    }

    this.pantryService.addToPantry(this.newEntry).subscribe({
      next: () => {
        this.resetForm();
        this.loadPantry();
      },
      error: () => {
        this.addError = 'Failed to add item.';
      },
    });
  }

  isExpired(expirationDate: string): boolean {
    if (!expirationDate) {
      return false;
    }

    const now = new Date();
    const expiry = new Date(expirationDate);

    return expiry < now;
  }

  isExpiringSoon(expirationDate: string): boolean {
    if (!expirationDate) {
      return false;
    }

    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 3;
  }

  deleteEntry(id: number) {
    this.pantryService.deleteFromPantry(id).subscribe(() => this.loadPantry());
  }

  updateQuantity(id: number, quantity: number) {
    this.pantryService.updateQuantity(id, quantity).subscribe(() => {
      this.loadPantry();
    });
  }

  private resetForm() {
    this.newEntry = {
      item: null,
      quantity: 1,
      unit: 'NONE',
      expiration_date: '',
    };

    this.itemSearch = '';
    this.selectedItemUnits = [];
    this.addError = null;
  }
}
