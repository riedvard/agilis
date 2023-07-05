import {ComponentFixture, TestBed} from '@angular/core/testing';

import {KiadstatsComponent} from './kiadstats.component';

describe('KiadstatsComponent', () => {
  let component: KiadstatsComponent;
  let fixture: ComponentFixture<KiadstatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KiadstatsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KiadstatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
