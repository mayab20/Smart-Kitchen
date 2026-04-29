import { TestBed } from '@angular/core/testing';
import { PantryService } from './pantry.service';
import { provideHttpClient } from '@angular/common/http';

describe('PantryService', () => {
  let service: PantryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(PantryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
