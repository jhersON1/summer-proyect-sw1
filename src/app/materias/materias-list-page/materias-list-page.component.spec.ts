import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriasListPageComponent } from './materias-list-page.component';

describe('MateriasListPageComponent', () => {
  let component: MateriasListPageComponent;
  let fixture: ComponentFixture<MateriasListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MateriasListPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MateriasListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
