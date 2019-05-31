import { Component } from '@angular/core';
import { LocationService } from '../../service/location';
import { firestore } from 'firebase';
import { Location } from '../../models/location';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: [ './map.component.scss' ]
})
export class MapComponent {
  SCALE = 20;
  currentLocation: firestore.GeoPoint = new firestore.GeoPoint(0, 0);
  locations$ = this.location.locations$;

  constructor(private location: LocationService) { }

  xPxRelativeToCurrent(location: Location): number {
    const lat = this.currentLocation.latitude - location.pos.latitude;
    return lat * this.SCALE;
  }

  yPxRelativeToCurrent(location: Location): number {
    const long = this.currentLocation.longitude - location.pos.longitude;
    return long * this.SCALE;
  }

}
