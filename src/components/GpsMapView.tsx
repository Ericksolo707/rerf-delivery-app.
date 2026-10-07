/**
 * GpsMapView.tsx - Visor Cartográfico Interactivo con OpenStreetMap y Leaflet.js
 * Programación II - UMG / RerF Logistics
 *
 * Responsabilidad:
 * - Renderizado multiplataforma (iOS, Android y Web) de mapas viales reales.
 * - Marcadores geográficos en vivo: Bodega Central (origen), Camión (piloto) y Destino (cliente).
 * - Trazado de ruta (Polyline) y rotación dinámica del vehículo según el rumbo (Bearing).
 * - Soporte nativo mediante react-native-webview y web mediante iframe interactivo.
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { GpsCoordinates } from '../services/gpsTrackingService';

export interface GpsMapViewProps {
  origin: GpsCoordinates;
  destination: GpsCoordinates;
  currentPosition: GpsCoordinates;
  waypoints?: GpsCoordinates[];
  pilotName?: string;
  destinationLabel?: string;
  speedKmh?: number;
  bearing?: number;
  isSimulating?: boolean;
}

export const GpsMapView: React.FC<GpsMapViewProps> = ({
  origin,
  destination,
  currentPosition,
  waypoints = [],
  pilotName = 'Piloto RerF',
  destinationLabel = 'Dirección de Destino',
  speedKmh = 38,
  bearing = 0,
}) => {
  const webViewRef = useRef<WebView>(null);

  // Generador del HTML de Leaflet con OpenStreetMap
  const generateMapHtml = (): string => {
    const waypointsJson = JSON.stringify(waypoints.map(w => [w.latitude, w.longitude]));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #E2E8F0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .custom-div-icon {
            background: transparent;
            border: none;
          }
          .truck-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: 22px;
            background: #2563EB;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45);
            border: 2.5px solid #FFFFFF;
            transition: transform 0.4s ease-out;
          }
          .truck-icon {
            width: 22px;
            height: 22px;
            fill: #FFFFFF;
          }
          .pin-warehouse {
            background: #10B981;
            width: 32px;
            height: 32px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4);
            border: 2px solid #FFFFFF;
          }
          .pin-dest {
            background: #EF4444;
            width: 32px;
            height: 32px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(239, 68, 68, 0.4);
            border: 2px solid #FFFFFF;
          }
          .leaflet-popup-content-wrapper {
            border-radius: 10px;
            font-size: 12px;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const originCoords = [${origin.latitude}, ${origin.longitude}];
          const destCoords = [${destination.latitude}, ${destination.longitude}];
          const currentCoords = [${currentPosition.latitude}, ${currentPosition.longitude}];
          const allWaypoints = ${waypointsJson};

          // Inicializar mapa de OpenStreetMap
          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          }).setView(currentCoords, 14);

          L.control.zoom({ position: 'topright' }).addTo(map);

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          // Icono Bodega Central (Origen)
          const warehouseIcon = L.divIcon({
            className: 'custom-div-icon',
            html: '<div class="pin-warehouse"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 21h18M3 7l9-4 9 4v14H3V7z"/></svg></div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          // Icono Destino
          const destIcon = L.divIcon({
            className: 'custom-div-icon',
            html: '<div class="pin-dest"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          // Icono Camión Piloto
          const truckIcon = L.divIcon({
            className: 'custom-div-icon',
            html: '<div id="truckBox" class="truck-container" style="transform: rotate(${bearing}deg);"><svg class="truck-icon" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg></div>',
            iconSize: [44, 44],
            iconAnchor: [22, 22]
          });

          // Marcadores
          L.marker(originCoords, { icon: warehouseIcon }).addTo(map).bindPopup('<b>Bodega Central RerF</b><br>Calzada Aguilar Batres, Z.12');
          L.marker(destCoords, { icon: destIcon }).addTo(map).bindPopup('<b>Destino de Entrega</b><br>${destinationLabel.replace(/'/g, "\\'")}');
          const truckMarker = L.marker(currentCoords, { icon: truckIcon, zIndexOffset: 1000 }).addTo(map).bindPopup('<b>Piloto: ${pilotName.replace(/'/g, "\\'")}</b><br>Velocidad: ${speedKmh} km/h');

          // Trazar línea de ruta completa
          if (allWaypoints.length > 0) {
            L.polyline(allWaypoints, {
              color: '#3B82F6',
              weight: 5,
              opacity: 0.8,
              dashArray: '6, 8'
            }).addTo(map);

            // Ajustar encuadre para que se vean todos los puntos
            const bounds = L.latLngBounds(allWaypoints);
            map.fitBounds(bounds, { padding: [40, 40] });
          }

          // Función global para actualizar la posición desde React Native sin recargar
          window.updateTruckPosition = function(lat, lng, newBearing, speed) {
            const newPos = [lat, lng];
            truckMarker.setLatLng(newPos);
            const box = document.getElementById('truckBox');
            if (box) {
              box.style.transform = 'rotate(' + (newBearing || 0) + 'deg)';
            }
            truckMarker.setPopupContent('<b>Piloto: ${pilotName.replace(/'/g, "\\'")}</b><br>Velocidad: ' + speed + ' km/h');
            map.panTo(newPos, { animate: true, duration: 0.8 });
          };
        </script>
      </body>
      </html>
    `;
  };

  // Inyectar JavaScript cuando cambian las coordenadas para una animación fluida
  useEffect(() => {
    if (webViewRef.current && Platform.OS !== 'web') {
      const script = `
        if (window.updateTruckPosition) {
          window.updateTruckPosition(${currentPosition.latitude}, ${currentPosition.longitude}, ${bearing}, ${speedKmh});
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [currentPosition.latitude, currentPosition.longitude, bearing, speedKmh]);

  const mapHtml = generateMapHtml();

  // En entorno Web, usamos un iframe estándar con srcDoc
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          title="GPS Map"
          srcDoc={mapHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </View>
    );
  }

  // En iOS y Android, usamos el componente nativo WebView
  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webView}
        scrollEnabled={false}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  webView: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
