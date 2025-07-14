import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextTrailComponent } from './text-trail.component';

describe('TextTrailComponent', () => {
  let component: TextTrailComponent;
  let fixture: ComponentFixture<TextTrailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextTrailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextTrailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
