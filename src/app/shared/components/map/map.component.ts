import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() mode: 'readonly' | 'edit' = 'readonly';
  @Input() latitude = 7.1254;
  @Input() longitude = -73.1198;
  @Input() zoom = 13;

  @Output() coordinateSelected = new EventEmitter<{ latitude: number; longitude: number }>();

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private marker!: L.Marker;
  private mapInitialized = false;

  private static readonly defaultIcon = L.icon({
    iconUrl: 'assets/leaflet/marker-icon.png',
    iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
    shadowUrl: 'assets/leaflet/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.mapInitialized) {
      return;
    }

    if (changes['latitude'] || changes['longitude']) {
      const latLng = L.latLng(this.latitude, this.longitude);
      this.marker.setLatLng(latLng);
      this.map.setView(latLng, this.map.getZoom());
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap(): void {
    const latLng = L.latLng(this.latitude, this.longitude);

    this.map = L.map(this.mapContainer.nativeElement, {
      center: latLng,
      zoom: this.zoom,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.marker = L.marker(latLng, { icon: MapComponent.defaultIcon }).addTo(this.map);

    if (this.mode === 'edit') {
      this.map.on('click', (event: L.LeafletMouseEvent) => {
        const { lat, lng } = event.latlng;
        this.marker.setLatLng(event.latlng);
        this.coordinateSelected.emit({ latitude: lat, longitude: lng });
      });
    }

    this.mapInitialized = true;
  }
}
