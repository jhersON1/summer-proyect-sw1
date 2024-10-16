import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMateriaComponent } from './edit-materia.component';

describe('EditMateriaComponent', () => {
  let component: EditMateriaComponent;
  let fixture: ComponentFixture<EditMateriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditMateriaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditMateriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
