import { Component, OnInit } from '@angular/core';
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

  selectedItemUnits: string[] = [];
  itemSearch = '';
  showSuggestions = false;
  private searchSubject = new Subject<string>();

  newEntry = {
    item: '' as any,
    quantity: 1,
    unit: 'NONE',
    expiration_date: '',
  };

  units = [
    'PCS', 'PACK', 'BOX', 'BAG', 'BOTTLE', 'CAN', 'JAR',
    'G', 'KG', 'ML', 'L', 'TSP', 'TBSP', 'CUP', 'CUPS',
    'SLICE', 'SLICES', 'LEAVES', 'CLOVE', 'CLOVES', 'PINCH', 'NONE',
  ];

  constructor(private pantryService: PantryService) {}

  ngOnInit() {
    this.loadPantry();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.pantryService.searchItems(query))
    ).subscribe({
      next: data => this.suggestions = data,
      error: err => console.error('Search failed:', err)
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
    this.pantryService.getPantry().subscribe((data) => {
      this.pantryItems = data;
      const cats = [...new Set(data.map((e: any) => e.item_category).filter(Boolean))] as string[];
      this.categories = ['ALL', ...cats];
    });
  }

  get filteredPantry() {
    if (this.selectedCategory === 'ALL') return this.pantryItems;
    return this.pantryItems.filter(entry => entry.item_category === this.selectedCategory);
  }

  selectItem(item: any) {
    this.newEntry.item = item.id;
    this.newEntry.unit = item.allowed_units?.[0] ?? 'NONE';
    this.itemSearch = item.name;
    this.suggestions = [];
    this.showSuggestions = false;
    this.selectedItemUnits = item.allowed_units ?? [];
  }

  getItemName(itemId: number): string {
    return this.pantryItems.find(e => e.item === itemId)?.item_name ?? 'Unknown';
  }

  getItemCategory(itemId: number): string {
    return this.pantryItems.find(e => e.item === itemId)?.item_category ?? '';
  }

  addEntry() {
    this.pantryService.addToPantry(this.newEntry).subscribe(() => {
      this.loadPantry();
      this.newEntry = { item: '', quantity: 1, unit: 'NONE', expiration_date: '' };
      this.itemSearch = '';
      this.selectedItemUnits = [];
    });
  }

  deleteEntry(id: number) {
    this.pantryService.deleteFromPantry(id).subscribe(() => this.loadPantry());
  }
}
