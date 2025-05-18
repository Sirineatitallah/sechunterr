import * as L from 'leaflet';

declare module 'leaflet' {
  interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: Record<string, string>;
  }

  function heatLayer(latlngs: Array<[number, number, number]>, options?: HeatLayerOptions): L.Layer;
}
