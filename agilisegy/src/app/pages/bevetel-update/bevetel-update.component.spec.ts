import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BevetelUpdateComponent} from './bevetel-update.component';

describe('BevetelUpdateComponent', () => {
  let component: BevetelUpdateComponent;
  let fixture: ComponentFixture<BevetelUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BevetelUpdateComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BevetelUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
