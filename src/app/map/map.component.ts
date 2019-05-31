import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LocationService } from '../../service/location';
import { Location } from '../../models/location';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: [ './map.component.scss' ],
})
export class MapComponent implements AfterViewInit {
  SCALE = 30;
  HEIGHT = 200;
  WIDTH = 200;

  currentLocation = { x: 0, y: 0 };
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

  yPxRelativeToCurrent(location: Location): number {
    const lat = this.currentLocation.y - location.y;
    return (lat * this.SCALE) + (this.WIDTH / 2);
  }

  xPxRelativeToCurrent(location: Location): number {
    const long = this.currentLocation.x - location.x;
    return (-long * this.SCALE) + (this.HEIGHT / 2);
  }

  async redraw (locations: Location[]) {

    // tslint:disable: no-magic-numbers
    this.ctx.canvas.height = this.HEIGHT;
    this.ctx.canvas.width = this.WIDTH;

    this.ctx.strokeStyle = '#D3D3D3';
    this.ctx.strokeRect(0, 0, 200, 200);

    locations.forEach(async (location) => {
      // Draw directions
      const x = this.xPxRelativeToCurrent(location);
      const y = this.yPxRelativeToCurrent(location);
      this.ctx.fillStyle = '#494949';
      if (location.N) {
        this.ctx.fillRect(x - 2, y - 15, 4, 17);
      }
      if (location.S) {
        this.ctx.fillRect(x - 2, y - 2, 4, 17);
      }
      if (location.W) {
        this.ctx.fillRect(x - 15, y - 2, 17, 4);
      }
      if (location.E) {
        this.ctx.fillRect(x - 2, y - 2, 17, 4);
      }
      if (!location.road) {
        this.ctx.fillStyle = '#A9A9A9';
        this.ctx.fillRect(x - 5, y - 5, 10, 10);
      }
    });

    // tslint:enable: no-magic-numbers
  }

}
