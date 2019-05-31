import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabButtonComponent } from './tab-button.component';

describe('TabButtonComponent', () => {
  let component: TabButtonComponent;
  let fixture: ComponentFixture<TabButtonComponent>;

  beforeEach(async(() => {
    // tslint:disable-next-line: no-floating-promises
    TestBed.configureTestingModule({
      declarations: [ TabButtonComponent ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // tslint:disable-next-line: no-floating-promises
    expect(component)
      .toBeTruthy();
  });
});
