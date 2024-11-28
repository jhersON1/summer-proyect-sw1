import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachImagesComponent } from './attach-images.component';

describe('AttachImagesComponent', () => {
  let component: AttachImagesComponent;
  let fixture: ComponentFixture<AttachImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttachImagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttachImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
