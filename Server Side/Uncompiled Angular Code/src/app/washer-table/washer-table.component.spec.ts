import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasherTableComponent } from './washer-table.component';

describe('WasherTableComponent', () => {
  let component: WasherTableComponent;
  let fixture: ComponentFixture<WasherTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasherTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WasherTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
