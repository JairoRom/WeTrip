import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet (bug conocido con webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

// Icono rojo para la ciudad principal
const cityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapView({ city, places }) {
  if (!city || !city.latitude || !city.longitude) {
    return (
      <div className="map-placeholder">
        <p>📍 No hay coordenadas disponibles para esta ciudad</p>
      </div>
    );
  }

  const center = [parseFloat(city.latitude), parseFloat(city.longitude)];

  return (
    <div className="map-container">
      <MapContainer
        key={city.id}
        center={center}
        zoom={13}
        style={{ height: '400px', width: '100%', borderRadius: '12px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={center} icon={cityIcon}>
          <Popup>
            <strong>{city.name}</strong>
            <br />
            {city.country}
          </Popup>
        </Marker>

        {places && places.map((place) => {
          if (!place.latitude || !place.longitude) return null;
          return (
            <Marker
              key={place.id}
              position={[parseFloat(place.latitude), parseFloat(place.longitude)]}
            >
              <Popup>
                <strong>{place.name}</strong>
                <br />
                {place.category}
                {place.rating && <><br />⭐ {place.rating}</>}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;