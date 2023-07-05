import {ComponentFixture, TestBed} from '@angular/core/testing';

import {KiadasUpdateComponent} from './kiadas-update.component';

describe('KiadasUpdateComponent', () => {
  let component: KiadasUpdateComponent;
  let fixture: ComponentFixture<KiadasUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KiadasUpdateComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KiadasUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
