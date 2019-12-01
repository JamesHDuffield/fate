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
  MatSnackBarModule,
  MatButtonToggleModule,
  MatTooltipModule,
  MatDialogModule,
  MatSelectModule,
  MatOptionModule,
  MatSlideToggleModule,
} from '@angular/material';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoryService } from '../service/story';
import { EncyclopediaService } from '../service/encyclopedia';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabButtonComponent } from './tab-button/tab-button.component';
import { AuthService } from '../service/auth';
import { StoryComponent } from './story/story.component';
import { HttpClientModule } from '@angular/common/http';
import { MomentComponent } from './moment/moment.component';
import { OptionsComponent } from './options/options.component';
import { LocationComponent } from './location/location.component';
import { TextDisplayComponent } from './text-display/text-display.component';
import { SplashComponent } from './splash/splash.component';
import { HeaderComponent } from './header/header.component';
import { AccountComponent } from './account/account.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AdminComponent } from './admin/admin.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { FlagComponent } from './flag/flag.component';
import { ChooseComponent } from './flag/choose/choose.component';
import { DocPipe } from './doc.pipe';
import { FlagIconComponent } from './flag/flag-icon/flag-icon.component';

@NgModule({
  declarations: [
    AppComponent,
    TabButtonComponent,
    StoryComponent,
    MomentComponent,
    OptionsComponent,
    LocationComponent,
    TextDisplayComponent,
    SplashComponent,
    HeaderComponent,
    AccountComponent,
    AdminComponent,
    ConfirmComponent,
    FlagComponent,
    ChooseComponent,
    DocPipe,
    FlagIconComponent,
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
    MatSnackBarModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
    MatOptionModule,
    MatSlideToggleModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [ AngularFirestore, StoryService, AuthService, EncyclopediaService ],
  bootstrap: [ AppComponent ],
  entryComponents: [ LocationComponent, AccountComponent, AdminComponent, ConfirmComponent, FlagComponent, ChooseComponent ],
})
export class AppModule { }
