import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatListModule,
  MatFormFieldModule,
  MatInputModule,
  MatGridListModule,
  MatToolbarModule,
  MatOptionModule,
  MatSelectModule,
  MatSnackBarModule,
  MatCheckboxModule,
} from '@angular/material';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoryService } from '../service/story';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabButtonComponent } from './tab-button/tab-button.component';
import { AuthService } from '../service/auth';
import { LocationService } from '../service/location';
import { MapComponent } from './map/map.component';
import { StoryComponent } from './story/story.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    TabButtonComponent,
    MapComponent,
    StoryComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatGridListModule,
    MatToolbarModule,
    MatSelectModule,
    MatOptionModule,
    MatSnackBarModule,
    MatCheckboxModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    HttpClientModule,
  ],
  providers: [ AngularFirestore, StoryService, AuthService, LocationService ],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
