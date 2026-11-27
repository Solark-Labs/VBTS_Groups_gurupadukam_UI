import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Loader2, ExternalLink, CheckCircle2, Compass } from 'lucide-react';
import { GeoLocation } from '../types';

interface LocationPickerProps {
  value?: GeoLocation;
  onChange: (loc: GeoLocation) => void;
  onAddressDetected?: (details: { address?: string; city?: string; pincode?: string }) => void;
  compact?: boolean;
}

const DEFAULT_CENTER = { lat: 17.2473, lng: 80.1514 }; // Khammam, Telangana

const KHAMMAM_PRESETS = [
  { label: 'Madhuranagar', lat: 17.2518, lng: 80.1489, address: 'Madhuranagar, Khammam', city: 'Khammam', pincode: '507002' },
  { label: 'Gollagudem', lat: 17.2602, lng: 80.1574, address: 'Gollagudem, Khammam', city: 'Khammam', pincode: '507002' },
  { label: 'Wyra Road', lat: 17.2431, lng: 80.1582, address: 'Wyra Road, Khammam', city: 'Khammam', pincode: '507001' },
  { label: 'Mamillagudem', lat: 17.2489, lng: 80.1394, address: 'Mamillagudem, Khammam', city: 'Khammam', pincode: '507001' },
];

export const buildGeoLocation = (lat: number, lng: number, formattedAddress?: string): GeoLocation => {
  const fixedLat = Number(lat.toFixed(6));
  const fixedLng = Number(lng.toFixed(6));
  return {
    lat: fixedLat,
    lng: fixedLng,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${fixedLat},${fixedLng}`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${fixedLat},${fixedLng}`,
    formattedAddress,
  };
};

/**
 * Parses Google Maps links or raw "lat, lng" coordinate strings.
 */
const parseCoordinatesFromInput = (input: string): { lat: number; lng: number } | null => {
  const atMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

  const qMatch = input.match(/[?&](?:q|query|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };

  const rawMatch = input.trim().match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  if (rawMatch) return { lat: parseFloat(rawMatch[1]), lng: parseFloat(rawMatch[2]) };

  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  onAddressDetected,
  compact = false,
}) => {
  const [lat, setLat] = useState<number>(value?.lat || DEFAULT_CENTER.lat);
  const [lng, setLng] = useState<number>(value?.lng || DEFAULT_CENTER.lng);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [pinnedLabel, setPinnedLabel] = useState<string>(value?.formattedAddress || '');
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const googleMapsApiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  useEffect(() => {
    if (value?.lat && value?.lng) {
      setLat(value.lat);
      setLng(value.lng);
      if (value.formattedAddress) setPinnedLabel(value.formattedAddress);
    }
  }, [value?.lat, value?.lng, value?.formattedAddress]);

  // Optional native Google Maps JS SDK upgrade when VITE_GOOGLE_MAPS_API_KEY is configured
  useEffect(() => {
    if (!googleMapsApiKey || !mapContainerRef.current) return;

    const initGoogleMap = () => {
      const g = (window as any).google;
      if (!g?.maps || !mapContainerRef.current) return;

      const map = new g.maps.Map(mapContainerRef.current, {
        center: { lat, lng },
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
      });

      const marker = new g.maps.Marker({
        position: { lat, lng },
        map,
        draggable: true,
        title: 'Devotee Location',
      });

      const updatePin = (newLat: number, newLng: number) => {
        setLat(newLat);
        setLng(newLng);
        onChange(buildGeoLocation(newLat, newLng, pinnedLabel));
        reverseGeocode(newLat, newLng);
      };

      map.addListener('click', (e: any) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        marker.setPosition({ lat: newLat, lng: newLng });
        updatePin(newLat, newLng);
      });

      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        updatePin(pos.lat(), pos.lng());
      });
    };

    if ((window as any).google?.maps) {
      initGoogleMap();
      return;
    }

    const existingScript = document.getElementById('gp-google-maps-sdk');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'gp-google-maps-sdk';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.onload = initGoogleMap;
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener('load', initGoogleMap);
    }
  }, [googleMapsApiKey]);

  const reverseGeocode = async (targetLat: number, targetLng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${targetLat}&lon=${targetLng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data?.display_name) {
        setPinnedLabel(data.display_name);
        onChange(buildGeoLocation(targetLat, targetLng, data.display_name));

        const addr = data.address || {};
        const streetParts = [
          addr.house_number,
          addr.road,
          addr.neighbourhood || addr.suburb || addr.residential,
        ].filter(Boolean);
        const city = addr.city || addr.town || addr.village || addr.county || 'Khammam';
        const pincode = (addr.postcode || '').replace(/\D/g, '').slice(0, 6);

        if (onAddressDetected) {
          onAddressDetected({
            address: streetParts.length > 0 ? streetParts.join(', ') : data.display_name.split(',').slice(0, 3).join(', '),
            city,
            pincode: pincode || undefined,
          });
        }
      }
    } catch {
      // Silently keep coordinates even if reverse geocoding is offline
    }
  };

  const handleUseCurrentLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('GPS location is not supported by your browser. Please search or select an area.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        onChange(buildGeoLocation(newLat, newLng, 'Current GPS Location'));
        await reverseGeocode(newLat, newLng);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setGeoError('Location permission denied or unavailable. Please search your street or paste a Google Maps link.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setGeoError(null);

    // Check if user pasted a Google Maps URL or raw coordinates
    const parsed = parseCoordinatesFromInput(q);
    if (parsed) {
      setLat(parsed.lat);
      setLng(parsed.lng);
      setSearchResults([]);
      onChange(buildGeoLocation(parsed.lat, parsed.lng));
      await reverseGeocode(parsed.lat, parsed.lng);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const results = await res.json();
        setSearchResults(results || []);
        if (!results || results.length === 0) {
          setGeoError('No matching location found. Try adding city name like "Madhuranagar, Khammam".');
        }
      }
    } catch {
      setGeoError('Could not reach location search. Try GPS or area presets below.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: any) => {
    const newLat = parseFloat(item.lat);
    const newLng = parseFloat(item.lon);
    setLat(newLat);
    setLng(newLng);
    setPinnedLabel(item.display_name);
    setSearchResults([]);
    onChange(buildGeoLocation(newLat, newLng, item.display_name));

    const addr = item.address || {};
    const streetParts = [addr.road, addr.neighbourhood || addr.suburb].filter(Boolean);
    const city = addr.city || addr.town || addr.village || addr.county || 'Khammam';
    const pincode = (addr.postcode || '').replace(/\D/g, '').slice(0, 6);
    if (onAddressDetected) {
      onAddressDetected({
        address: streetParts.length > 0 ? streetParts.join(', ') : item.display_name.split(',').slice(0, 2).join(', '),
        city,
        pincode: pincode || undefined,
      });
    }
  };

  const handlePresetClick = (preset: typeof KHAMMAM_PRESETS[number]) => {
    setGeoError(null);
    setLat(preset.lat);
    setLng(preset.lng);
    setPinnedLabel(preset.address);
    onChange(buildGeoLocation(preset.lat, preset.lng, preset.address));
    if (onAddressDetected) {
      onAddressDetected({
        address: preset.address,
        city: preset.city,
        pincode: preset.pincode,
      });
    }
  };

  const currentGeo = buildGeoLocation(lat, lng, pinnedLabel);

  return (
    <div className="bg-white border border-gold/30 rounded-sm p-3.5 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 font-cinzel text-xs font-bold tracking-wider uppercase text-maroon">
          <MapPin size={14} className="text-maroon shrink-0" />
          <span>Google Maps Location Pin *</span>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-maroon text-gold-pale px-2.5 py-1.5 rounded-sm hover:bg-maroon-md transition-colors disabled:opacity-60"
        >
          {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
          {isLocating ? 'Detecting GPS…' : 'Use My Current GPS'}
        </button>
      </div>

      {/* Search street, landmark, or paste Google Maps URL */}
      <div className="relative">
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-lt" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Search street/landmark or paste Google Maps link…"
              className="w-full pl-8 pr-2.5 py-2 text-xs border border-gold/30 bg-cream/30 focus:outline-none focus:border-maroon rounded-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="px-3 py-2 text-xs font-bold bg-gold/20 text-maroon border border-gold/40 rounded-sm hover:bg-gold/30 transition-colors"
          >
            {isSearching ? <Loader2 size={13} className="animate-spin" /> : 'Locate'}
          </button>
        </div>

        {/* Search Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gold/40 shadow-xl rounded-sm z-30 max-h-44 overflow-y-auto divide-y divide-gold/10">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className="w-full text-left px-3 py-2 text-xs text-text-dk hover:bg-cream transition-colors flex items-start gap-2"
              >
                <MapPin size={12} className="text-maroon shrink-0 mt-0.5" />
                <span className="line-clamp-2">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Khammam Area Presets */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold text-text-lt uppercase tracking-wider flex items-center gap-1">
          <Compass size={10} /> Quick Areas:
        </span>
        {KHAMMAM_PRESETS.map(p => (
          <button
            key={p.label}
            type="button"
            onClick={() => handlePresetClick(p)}
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gold/30 bg-cream hover:bg-maroon hover:text-gold-pale text-maroon transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {geoError && (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-sm">
          {geoError}
        </p>
      )}

      {/* Interactive Google Maps View */}
      <div className={`w-full overflow-hidden rounded-sm border border-gold/30 bg-ivory relative ${compact ? 'h-36' : 'h-48'}`}>
        {googleMapsApiKey ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          <iframe
            title="Devotee Location on Google Maps"
            src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>

      {/* Pinned Coordinates & Direct Link */}
      <div className="flex items-center justify-between gap-2 text-[11px] bg-green-50/80 border border-green-200 px-2.5 py-1.5 rounded-sm flex-wrap">
        <div className="flex items-center gap-1.5 text-green-800 font-medium truncate max-w-[240px]">
          <CheckCircle2 size={13} className="text-green-600 shrink-0" />
          <span className="truncate">
            Pinned: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
          </span>
        </div>
        <a
          href={currentGeo.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-bold text-maroon hover:underline shrink-0"
        >
          Verify in Google Maps <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
};
