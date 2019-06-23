import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LocationService } from '../../service/location';
import { Location } from '../../models/location';
import { filter, tap, distinctUntilChanged } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: [ './map.component.scss' ],
})
export class MapComponent implements AfterViewInit {
  SCALE = 30;
  HEIGHT = 200;
  WIDTH = 200;

  locations$ = combineLatest(this.location.currentLocation$, this.location.locations$)
    .pipe(
      distinctUntilChanged(),
      tap((results) => this.redraw(results[0], results[1])),
    );

  @ViewChild('mapCanvas') myCanvas: ElementRef;
  public ctx: CanvasRenderingContext2D;

  constructor(private location: LocationService) { }

  ngAfterViewInit(): void {
    this.ctx = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
  }

  yPxRelativeToCurrent(current: Location, location: Location): number {
    const lat = current.y - location.y;
    return (lat * this.SCALE) + (this.WIDTH / 2);
  }

  xPxRelativeToCurrent(current: Location, location: Location): number {
    const long = current.x - location.x;
    return (-long * this.SCALE) + (this.HEIGHT / 2);
  }

  clipArc(ctx, x, y, r, f) { /// context, x, y, radius, feather size
    /// create off-screen temporary canvas where we draw in the shadow
    const temp = document.createElement('canvas');
    const tx = temp.getContext('2d');

    temp.width = ctx.canvas.width;
    temp.height = ctx.canvas.height;

    /// offset the context so shape itself is drawn outside canvas
    tx.translate(-temp.width, 0);

    /// offset the shadow to compensate, draws shadow only on canvas
    tx.shadowOffsetX = temp.width;
    tx.shadowOffsetY = 0;

    /// black so alpha gets solid
    tx.shadowColor = '#000';

    /// "feather"
    tx.shadowBlur = f;

    /// draw the arc, only the shadow will be inside the context
    tx.beginPath();
    tx.arc(x, y, r, 0, 2 * Math.PI);
    tx.closePath();
    tx.fill();

    /// now punch a hole in main canvas with the blurred shadow
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(temp, 0, 0);
    ctx.restore();
  }

  // tslint:disable: no-magic-numbers

  triangle(x: number, y: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 3);
    this.ctx.lineTo(x + 3, y + 3);
    this.ctx.lineTo(x - 3, y + 3);
    this.ctx.closePath();
    // the outline
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#000000';
    this.ctx.stroke();
    // the fill color
    this.ctx.fillStyle = '#FFCC00';
    this.ctx.fill();
  }

  async redraw (current: Location, locations: Location[]) {
    this.ctx.canvas.height = this.HEIGHT;
    this.ctx.canvas.width = this.WIDTH;
    this.ctx.strokeStyle = '#D3D3D3';
    // this.ctx.strokeRect(0, 0, 200, 200);

    locations.forEach(async (location) => {
      // Draw directions
      const x = this.xPxRelativeToCurrent(current, location);
      const y = this.yPxRelativeToCurrent(current, location);
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
      if (location.name) {
        this.ctx.fillStyle = '#A9A9A9';
        this.ctx.fillRect(x - 5, y - 5, 10, 10);
      }
    });

    this.triangle(this.WIDTH / 2, this.HEIGHT / 2);
    this.clipArc(this.ctx, this.WIDTH / 2, this.HEIGHT / 2, this.HEIGHT / 3, 10);
  }

  // tslint:enable: no-magic-numbers

}
