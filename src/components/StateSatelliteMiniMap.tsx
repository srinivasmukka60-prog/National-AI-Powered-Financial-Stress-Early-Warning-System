import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { StateData, DistrictData } from '../types';
import { STATE_GEO_COORDS, DISTRICT_GEO_COORDS } from '../data/indiaData';
import { getRiskColor } from '../services/mlEngine';
import {
  Satellite,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Crosshair,
  MapPin,
  Flame,
  Moon,
  Sun,
  Activity,
  Zap,
  Building2,
  TrendingUp,
  AlertTriangle,
  Compass,
  Radio,
  Eye,
  Radar
} from 'lucide-react';

interface StateSatelliteMiniMapProps {
  state: StateData;
  selectedDistrict: DistrictData | null;
  darkMode: boolean;
  onSelectDistrict?: (districtId: string) => void;
  onExpand?: () => void;
  height?: string;
}

type SatelliteImageryMode = 'orbital' | 'night_lights' | 'topo';

const SATELLITE_TILES: Record<SatelliteImageryMode, { url: string; maxZoom: number; label: string; icon: string }> = {
  orbital: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 18,
    label: 'Orbital HD',
    icon: '🛰️',
  },
  night_lights: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    maxZoom: 18,
    label: 'Night Activity',
    icon: '🌃',
  },
  topo: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 18,
    label: 'Industrial Topo',
    icon: '🗺️',
  },
};

export const StateSatelliteMiniMap: React.FC<StateSatelliteMiniMapProps> = ({
  state,
  selectedDistrict,
  darkMode,
  onSelectDistrict,
  onExpand,
  height = '230px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseTileRef = useRef<L.TileLayer | null>(null);
  const labelsTileRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const heatCirclesGroupRef = useRef<L.LayerGroup | null>(null);

  // States
  const [imageryMode, setImageryMode] = useState<SatelliteImageryMode>('orbital');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showThermalStress, setShowThermalStress] = useState<boolean>(true);
  const [cursorCoords, setCursorCoords] = useState<[number, number] | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictData | null>(null);

  const stateCoords = state.geoCoord || STATE_GEO_COORDS[state.id] || [20.5937, 78.9629];
  const activeDistrict = selectedDistrict || state.districts[0] || null;
  const activeCoords = (activeDistrict && (activeDistrict.geoCoord || DISTRICT_GEO_COORDS[activeDistrict.id])) || stateCoords;

  // Initialize Satellite Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: activeCoords,
      zoom: 7,
      minZoom: 5,
      maxZoom: 17,
      zoomControl: false,
      attributionControl: false,
    });

    // Base Tile
    const initialTile = L.tileLayer(SATELLITE_TILES[imageryMode].url, {
      maxZoom: SATELLITE_TILES[imageryMode].maxZoom,
      subdomains: 'abcd',
    }).addTo(map);
    baseTileRef.current = initialTile;

    // Reference Labels Tile Layer
    const labelsTile = L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        opacity: 0.9,
      }
    ).addTo(map);
    labelsTileRef.current = labelsTile;

    // Heat & Markers layer groups
    const heatGroup = L.layerGroup().addTo(map);
    heatCirclesGroupRef.current = heatGroup;

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    // Live mouse telemetry
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords([e.latlng.lat, e.latlng.lng]);
    });

    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer on imageryMode changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (baseTileRef.current) {
      map.removeLayer(baseTileRef.current);
    }

    const newTile = L.tileLayer(SATELLITE_TILES[imageryMode].url, {
      maxZoom: SATELLITE_TILES[imageryMode].maxZoom,
      subdomains: 'abcd',
    }).addTo(map);

    baseTileRef.current = newTile;

    // Keep labels above base if enabled
    if (showLabels && labelsTileRef.current) {
      labelsTileRef.current.bringToFront();
    }
  }, [imageryMode]);

  // Update center when state or district changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo(activeCoords, selectedDistrict ? 9 : 7, {
      duration: 1.1,
      easeLinearity: 0.25,
    });
  }, [state.id, selectedDistrict?.id]);

  // Toggle Road & Town Labels overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (showLabels) {
      if (!labelsTileRef.current) {
        labelsTileRef.current = L.tileLayer(
          'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 18, opacity: 0.9 }
        ).addTo(map);
        labelsTileRef.current.bringToFront();
      }
    } else {
      if (labelsTileRef.current) {
        map.removeLayer(labelsTileRef.current);
        labelsTileRef.current = null;
      }
    }
  }, [showLabels]);

  // Render Industrial Zones, Stress Halos & Satellite Markers
  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    const heatGroup = heatCirclesGroupRef.current;
    if (!markersGroup || !heatGroup) return;

    markersGroup.clearLayers();
    heatGroup.clearLayers();

    // 1. Regional State Boundary Radar Halo
    const stateHalo = L.circle(stateCoords, {
      radius: 52000,
      color: '#06b6d4',
      fillColor: '#0891b2',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '5 5',
    });
    markersGroup.addLayer(stateHalo);

    // 2. Render District Clusters with satellite thermal stress footprint
    state.districts.forEach((d) => {
      const coords = d.geoCoord || DISTRICT_GEO_COORDS[d.id];
      if (!coords) return;

      const isSelected = selectedDistrict?.id === d.id;
      const riskColor = getRiskColor(d.riskLevel);

      // Thermal Stress Radiance Rings around factory clusters
      if (showThermalStress) {
        const radius = isSelected ? 32000 : 20000;
        const stressHalo = L.circle(coords, {
          radius,
          color: riskColor.hex,
          fillColor: riskColor.hex,
          fillOpacity: isSelected ? 0.35 : 0.18,
          weight: isSelected ? 2.5 : 1.2,
          dashArray: isSelected ? undefined : '3 3',
        });

        stressHalo.on('click', () => {
          if (onSelectDistrict) onSelectDistrict(d.id);
        });

        heatGroup.addLayer(stressHalo);
      }

      // High-Fidelity Tactical Cluster Pin
      const markerHtml = `
        <div class="relative flex flex-col items-center cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-40' : 'hover:scale-110 z-20'
        }">
          <div class="w-5 h-5 rounded-full border-2 border-white shadow-2xl flex items-center justify-center relative ${isSelected ? 'ring-4 ring-cyan-400/90 animate-pulse' : ''
        }" style="background-color: ${riskColor.hex}">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
            ${d.riskLevel === 'critical'
          ? '<span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 animate-ping"></span>'
          : ''
        }
          </div>
          <div class="px-2 py-0.5 rounded-md text-[9px] font-bold text-white bg-slate-950/95 border border-slate-700 shadow-xl whitespace-nowrap mt-1 flex items-center gap-1 backdrop-blur-md">
            <span>${d.name}</span>
            <span class="font-mono text-cyan-300 font-extrabold">${d.stressScore.toFixed(0)}</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'satellite-cluster-pin',
        html: markerHtml,
        iconSize: [84, 44],
        iconAnchor: [42, 10],
      });

      const marker = L.marker(coords, { icon });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onSelectDistrict) {
          onSelectDistrict(d.id);
        }
      });
      marker.on('mouseover', () => {
        setHoveredDistrict(d);
      });
      marker.on('mouseout', () => {
        setHoveredDistrict(null);
      });

      markersGroup.addLayer(marker);
    });
  }, [state.id, selectedDistrict?.id, showThermalStress]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    mapRef.current?.flyTo(activeCoords, selectedDistrict ? 9 : 7, { duration: 0.8 });
  };

  const inspectedDistrict = hoveredDistrict || selectedDistrict || state.districts[0];

  return (
    <div className="relative rounded-2xl border border-slate-800/90 overflow-hidden bg-slate-950 shadow-2xl flex flex-col group">
      {/* Top HUD Controls Strip */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Telemetry & State Identity */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-200 pointer-events-auto shadow-xl">
          <div className="flex items-center gap-1.5">
            <Satellite className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-extrabold text-white tracking-wide uppercase">{state.name} Space Telemetry</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-cyan-300 text-[10px]">
            {cursorCoords
              ? `${cursorCoords[0].toFixed(3)}°N, ${cursorCoords[1].toFixed(3)}°E`
              : `${activeCoords[0].toFixed(2)}°N, ${activeCoords[1].toFixed(2)}°E`}
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
            Sentinel-2 Active
          </span>
        </div>

        {/* Right: Multi-Band Mode Switcher & Overlays */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Imagery Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800">
            {(['orbital', 'night_lights', 'topo'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setImageryMode(mode)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${imageryMode === mode
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                  }`}
                title={`Switch to ${SATELLITE_TILES[mode].label}`}
              >
                <span>{SATELLITE_TILES[mode].icon}</span>
                <span className="hidden md:inline">{SATELLITE_TILES[mode].label}</span>
              </button>
            ))}
          </div>

          {/* Toggle Thermal Stress Radiance */}
          <button
            onClick={() => setShowThermalStress(!showThermalStress)}
            className={`p-1.5 rounded-lg text-[10px] font-bold border backdrop-blur-md transition-colors cursor-pointer flex items-center gap-1 ${showThermalStress
                ? 'bg-amber-500/25 border-amber-500/50 text-amber-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-500'
              }`}
            title="Toggle Financial Stress Thermal Radiance"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stress Radiance</span>
          </button>

          {/* Toggle Place Names */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`p-1.5 rounded-lg text-[10px] font-bold border backdrop-blur-md transition-colors cursor-pointer ${showLabels
                ? 'bg-cyan-500/25 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-500'
              }`}
            title="Toggle Road & City Names Overlay"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Expand Fullscreen Modal */}
          {onExpand && (
            <button
              onClick={onExpand}
              className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white backdrop-blur-md cursor-pointer hover:bg-slate-800 transition-colors shadow-lg"
              title="Expand Fullscreen Satellite Map"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Real Satellite Map Leaflet Canvas */}
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="w-full z-0 select-none relative"
      />

      {/* Floating Factory Telemetry Inspection Card on Hover */}
      {hoveredDistrict && (
        <div className="absolute top-16 left-3 z-[400] max-w-xs p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-slate-200 pointer-events-auto shadow-2xl transition-all">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-bold text-xs text-white truncate">{hoveredDistrict.name}</span>
            </div>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                getRiskColor(hoveredDistrict.riskLevel).text
              }`}
            >
              {hoveredDistrict.riskLevel}
            </span>
          </div>

          <div className="text-[10px] text-slate-300 font-medium mb-1 truncate">
            {hoveredDistrict.clusterName}
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            <div className="p-1 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 block">Stress Index:</span>
              <span className="font-mono font-bold text-amber-400">
                {hoveredDistrict.stressScore.toFixed(1)} / 100
              </span>
            </div>
            <div className="p-1 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 block">Dominant Issue:</span>
              <span className="text-red-300 font-semibold truncate block">
                {hoveredDistrict.dominantIssue}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom District Jump Bar & Zoom Controls */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-none">
        {/* District Quick Jump Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto max-w-full">
          {state.districts.map((d) => {
            const isSelected = selectedDistrict?.id === d.id;
            const c = getRiskColor(d.riskLevel);
            return (
              <button
                key={d.id}
                onClick={() => onSelectDistrict && onSelectDistrict(d.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border backdrop-blur-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-md ${isSelected
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/40'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.hex }}></span>
                <span>{d.name}</span>
                <span className="font-mono text-slate-400 font-bold">({d.stressScore.toFixed(0)})</span>
              </button>
            );
          })}
        </div>

        {/* Zoom & Recenter Controls */}
        <div className="flex items-center gap-1 pointer-events-auto self-end sm:self-auto shrink-0">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white backdrop-blur-md cursor-pointer transition-colors shadow-md"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white backdrop-blur-md cursor-pointer transition-colors shadow-md"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRecenter}
            className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white backdrop-blur-md cursor-pointer transition-colors shadow-md"
            title="Recenter State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

