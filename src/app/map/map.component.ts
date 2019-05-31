import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LocationService } from '../../service/location';
import { firestore } from 'firebase';
import { Location } from '../../models/location';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: [ './map.component.scss' ],
})
export class MapComponent implements AfterViewInit {
  SCALE = 20;
  HEIGHT = 200;
  WIDTH = 200;

  currentLocation: firestore.GeoPoint = new firestore.GeoPoint(0, 0);
  locations$ = this.location.locations$
    .pipe(
      filter((locations) => !!locations),
      tap((locations) => this.redraw(locations)),
    );

  @ViewChild('mapCanvas') myCanvas: ElementRef;
  public ctx: CanvasRenderingContext2D;

  constructor(private location: LocationService) { }

  ngAfterViewInit(): void {
    this.ctx = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
  }

  xPxRelativeToCurrent(location: Location): number {
    const lat = this.currentLocation.latitude - location.pos.latitude;
    return (lat * this.SCALE) + (this.WIDTH / 2);
  }

  yPxRelativeToCurrent(location: Location): number {
    const long = this.currentLocation.longitude - location.pos.longitude;
    return (long * this.SCALE) + (this.HEIGHT / 2);
  }

  redraw(locations: Location[]) {

    // tslint:disable: no-magic-numbers
    this.ctx.canvas.height = this.HEIGHT;
    this.ctx.canvas.width = this.WIDTH;

    this.ctx.strokeStyle = '#D3D3D3';
    this.ctx.strokeRect(0, 0, 200, 200);

    this.ctx.fillStyle = '#A9A9A9';
    locations.forEach((location) => {
      const x = this.xPxRelativeToCurrent(location);
      const y = this.yPxRelativeToCurrent(location);
      this.ctx.fillRect(x - 5, y - 5, 10, 10);
    });

    // tslint:enable: no-magic-numbers
  }

}
