import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DryerTableComponent } from './dryer-table.component';

describe('DryerTableComponent', () => {
  let component: DryerTableComponent;
  let fixture: ComponentFixture<DryerTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DryerTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DryerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
