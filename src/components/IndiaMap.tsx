import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  STATES_DATA,
  SECTORS_DATA,
  SUPPLY_CHAIN_VECTORS,
  LIVE_TELEMETRY_STREAM,
  STATE_GEO_COORDS,
  DISTRICT_GEO_COORDS,
} from '../data/indiaData';
import { StateData, RiskLevel } from '../types';
import { getRiskColor, getRiskLevel } from '../services/mlEngine';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Building,
  Radio,
  Play,
  Pause,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Zap,
  Clock,
  GitBranch,
  Split,
  ChevronRight,
  ShieldAlert,
  Flame,
  Globe,
  MapPin,
  Compass,
  Satellite,
  Maximize2,
} from 'lucide-react';
import { StateSatelliteMiniMap } from './StateSatelliteMiniMap';

interface IndiaMapProps {
  darkMode: boolean;
  onGenerateBriefing?: (state: StateData) => void;
}

type TileStyle = 'satellite' | 'streets' | 'topo' | 'dark';

const TILE_CONFIG: Record<TileStyle, { url: string; referenceUrl?: string; subdomains?: string; attribution: string; label: string; icon: string }> = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    referenceUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
    label: 'Satellite HD',
    icon: '🛰️',
  },
  streets: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    label: 'Street Atlas',
    icon: '🗺️',
  },
  topo: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, HERE, Garmin, USGS',
    label: 'Topography',
    icon: '🏔️',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    label: 'Dark Tactical',
    icon: '🌃',
  },
};

export const IndiaMap: React.FC<IndiaMapProps> = ({ darkMode, onGenerateBriefing }) => {
  const [selectedStateId, setSelectedStateId] = useState<string>('GJ');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>('GJ-SUR');
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);

  // Live Mode & Real-time Telemetry state
  const [isLiveStreamActive, setIsLiveStreamActive] = useState<boolean>(true);
  const [liveStreamIndex, setLiveStreamIndex] = useState<number>(0);
  const [liveTime, setLiveTime] = useState<string>('');
  const [shockWaveTriggered, setShockWaveTriggered] = useState<boolean>(false);

  // Layer state: 'stress' | 'credit' | 'receivables' | 'warnings'
  const [activeLayer, setActiveLayer] = useState<'stress' | 'credit' | 'receivables' | 'warnings'>('stress');
  const [showSupplyChainVectors, setShowSupplyChainVectors] = useState<boolean>(true);
  const [tileStyle, setTileStyle] = useState<TileStyle>('satellite');

  // Time-Travel Scrubber: '0' | '30' | '60' | '90'
  const [forecastHorizon, setForecastHorizon] = useState<'0' | '30' | '60' | '90'>('0');

  // Compare mode
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [compareStateId, setCompareStateId] = useState<string>('TN');

  // Satellite modal
  const [isSatelliteModalOpen, setIsSatelliteModalOpen] = useState<boolean>(false);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const tileReferenceLayerRef = useRef<L.TileLayer | null>(null);
  const stateLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const clusterLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const vectorLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Live Clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('en-US', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live Stream cycling effect
  useEffect(() => {
    if (!isLiveStreamActive) return;
    const interval = setInterval(() => {
      setLiveStreamIndex((prev) => (prev + 1) % LIVE_TELEMETRY_STREAM.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isLiveStreamActive]);

  const currentLiveEvent = LIVE_TELEMETRY_STREAM[liveStreamIndex];

  // Selected State and District
  const selectedState = STATES_DATA.find((s) => s.id === selectedStateId) || STATES_DATA[0];
  const selectedDistrict = selectedState.districts.find((d) => d.id === selectedDistrictId) || selectedState.districts[0] || null;

  // Compare state
  const compareState = STATES_DATA.find((s) => s.id === compareStateId) || STATES_DATA[1];

  // Dynamic score calculator based on horizon & live shock
  const calculateEffectiveStateScore = (st: StateData) => {
    let score = st.stressScore;
    if (forecastHorizon === '30') score = st.forecast30;
    else if (forecastHorizon === '60') score = st.forecast60;
    else if (forecastHorizon === '90') score = st.forecast90;

    if (shockWaveTriggered) {
      score = Math.min(99.4, score + 8.2);
    }
    return score;
  };

  const currentEntityScore = selectedDistrict
    ? Math.min(99, selectedDistrict.stressScore + (forecastHorizon === '0' ? 0 : forecastHorizon === '30' ? 3.5 : forecastHorizon === '60' ? 7.2 : 9.5))
    : calculateEffectiveStateScore(selectedState);

  const currentEntityLevel = getRiskLevel(currentEntityScore);
  const riskColor = getRiskColor(currentEntityLevel);

  // Initialize Real-World Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    // Centered on geographic center of India
    const map = L.map(mapContainerRef.current, {
      center: [22.8, 79.5],
      zoom: 5,
      minZoom: 4,
      maxZoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    const tileCfg = TILE_CONFIG[tileStyle];
    const initialTileLayer = L.tileLayer(tileCfg.url, {
      maxZoom: 19,
      subdomains: tileCfg.subdomains || 'abc',
    }).addTo(map);
    tileLayerRef.current = initialTileLayer;

    if (tileCfg.referenceUrl) {
      const initialRefLayer = L.tileLayer(tileCfg.referenceUrl, {
        maxZoom: 19,
        pane: 'overlayPane',
        subdomains: tileCfg.subdomains || 'abc',
      }).addTo(map);
      tileReferenceLayerRef.current = initialRefLayer;
    }

    // Layer groups for markers and vector lines
    const stateGroup = L.layerGroup().addTo(map);
    const clusterGroup = L.layerGroup().addTo(map);
    const vectorGroup = L.layerGroup().addTo(map);

    stateLayerGroupRef.current = stateGroup;
    clusterLayerGroupRef.current = clusterGroup;
    vectorLayerGroupRef.current = vectorGroup;

    mapRef.current = map;

    // Invalidate size on initial mount after render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer when tileStyle changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (tileReferenceLayerRef.current) {
      map.removeLayer(tileReferenceLayerRef.current);
      tileReferenceLayerRef.current = null;
    }

    const tileCfg = TILE_CONFIG[tileStyle];
    const newTileLayer = L.tileLayer(tileCfg.url, {
      maxZoom: 19,
      subdomains: tileCfg.subdomains || 'abc',
    }).addTo(map);
    tileLayerRef.current = newTileLayer;

    if (tileCfg.referenceUrl) {
      const newRefLayer = L.tileLayer(tileCfg.referenceUrl, {
        maxZoom: 19,
        pane: 'overlayPane',
        subdomains: tileCfg.subdomains || 'abc',
      }).addTo(map);
      tileReferenceLayerRef.current = newRefLayer;
    }
  }, [tileStyle]);

  // Render State Markers, Halos & District Pins on the Real Map
  useEffect(() => {
    const map = mapRef.current;
    const stateGroup = stateLayerGroupRef.current;
    const clusterGroup = clusterLayerGroupRef.current;
    if (!map || !stateGroup || !clusterGroup) return;

    stateGroup.clearLayers();
    clusterGroup.clearLayers();

    STATES_DATA.forEach((st) => {
      const coords = st.geoCoord || STATE_GEO_COORDS[st.id];
      if (!coords) return;

      const effectiveScore = calculateEffectiveStateScore(st);
      const level = getRiskLevel(effectiveScore);
      const stateColor = getRiskColor(level);
      const isSelected = selectedStateId === st.id;

      // Filter check
      if (riskFilter !== 'all' && level !== riskFilter) return;

      // Color based on active metric layer
      let markerColor = stateColor.hex;
      if (activeLayer === 'credit') {
        markerColor = st.creditAtRiskCr > 40000 ? '#ef4444' : st.creditAtRiskCr > 20000 ? '#f97316' : '#10b981';
      } else if (activeLayer === 'receivables') {
        markerColor = (st.id === 'GJ' || st.id === 'TN' || st.id === 'UP') ? '#ef4444' : '#f59e0b';
      }

      // 1. Regional Stress Heat Halo
      const haloRadius = isSelected ? 85000 : 55000;
      const halo = L.circle(coords, {
        radius: haloRadius,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: isSelected ? 0.38 : 0.18,
        weight: isSelected ? 2.5 : 1.2,
        dashArray: isSelected ? undefined : '4 4',
      });

      halo.on('click', () => {
        setSelectedStateId(st.id);
        setSelectedDistrictId(st.districts[0]?.id || null);
        map.flyTo(coords, 7, { duration: 0.8 });
      });

      stateGroup.addLayer(halo);

      // 2. Interactive Tactical State Badge
      const stateBadgeHtml = `
        <div class="group relative flex flex-col items-center cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'
        }">
          <div class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg flex items-center gap-1 border ${
            isSelected
              ? 'border-white ring-2 ring-amber-400 bg-slate-900 shadow-amber-500/30'
              : 'border-slate-700 bg-slate-900/90'
          }" style="box-shadow: 0 4px 14px rgba(0,0,0,0.6)">
            <span class="w-2 h-2 rounded-full ${isSelected ? 'animate-pulse' : ''}" style="background-color: ${markerColor}"></span>
            <span class="font-sans font-bold text-slate-100">${st.name}</span>
            <span class="font-mono font-black ml-0.5" style="color: ${markerColor}">
              ${effectiveScore.toFixed(0)}
            </span>
          </div>
          ${
            level === 'critical' || shockWaveTriggered
              ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>'
              : ''
          }
        </div>
      `;

      const stateIcon = L.divIcon({
        className: 'custom-state-pin',
        html: stateBadgeHtml,
        iconSize: [110, 26],
        iconAnchor: [55, 13],
      });

      const stateMarker = L.marker(coords, { icon: stateIcon });
      stateMarker.on('click', () => {
        setSelectedStateId(st.id);
        setSelectedDistrictId(st.districts[0]?.id || null);
        map.flyTo(coords, 7, { duration: 0.8 });
      });

      stateGroup.addLayer(stateMarker);

      // 3. Render District / Industrial Cluster Markers when this state is selected
      if (isSelected) {
        st.districts.forEach((d) => {
          const distCoords = d.geoCoord || DISTRICT_GEO_COORDS[d.id];
          if (!distCoords) return;

          const isDistSelected = selectedDistrictId === d.id;
          const distLevel = d.riskLevel;
          const distRiskColor = getRiskColor(distLevel);

          const clusterHtml = `
            <div class="flex flex-col items-center cursor-pointer transition-transform duration-150 ${
              isDistSelected ? 'scale-125 z-40' : 'hover:scale-110 z-20'
            }">
              <div class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md flex items-center justify-center ${
                isDistSelected ? 'ring-2 ring-amber-400' : ''
              }" style="background-color: ${distRiskColor.hex}">
              </div>
              <div class="px-1.5 py-0.2 rounded text-[9px] font-bold text-slate-200 bg-slate-950/90 border border-slate-700 shadow-xs whitespace-nowrap mt-0.5">
                ${d.name} <span class="font-mono text-amber-400">(${d.stressScore.toFixed(0)})</span>
              </div>
            </div>
          `;

          const clusterIcon = L.divIcon({
            className: 'custom-district-pin',
            html: clusterHtml,
            iconSize: [70, 36],
            iconAnchor: [35, 7],
          });

          const clusterMarker = L.marker(distCoords, { icon: clusterIcon });
          clusterMarker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedDistrictId(d.id);
          });

          clusterGroup.addLayer(clusterMarker);
        });
      }
    });
  }, [
    selectedStateId,
    selectedDistrictId,
    riskFilter,
    activeLayer,
    forecastHorizon,
    shockWaveTriggered,
  ]);

  // Render Supply Chain Contagion Vectors
  useEffect(() => {
    const vectorGroup = vectorLayerGroupRef.current;
    if (!vectorGroup) return;

    vectorGroup.clearLayers();
    if (!showSupplyChainVectors) return;

    SUPPLY_CHAIN_VECTORS.forEach((vec) => {
      const fromCoords = STATE_GEO_COORDS[vec.fromState];
      const toCoords = STATE_GEO_COORDS[vec.toState];
      if (!fromCoords || !toCoords) return;

      const isConnectedToSelected =
        selectedStateId === vec.fromState || selectedStateId === vec.toState;

      const polyline = L.polyline([fromCoords, toCoords], {
        color: isConnectedToSelected ? '#f59e0b' : '#ef4444',
        weight: isConnectedToSelected ? 2.8 : 1.4,
        opacity: isConnectedToSelected ? 0.9 : 0.45,
        dashArray: isConnectedToSelected ? '6 6' : '3 6',
      });

      polyline.bindTooltip(
        `<div class="text-[11px] font-sans">
          <strong>${vec.label}</strong><br/>
          <span class="text-slate-400">${vec.commodities}</span>
        </div>`,
        { sticky: true }
      );

      vectorGroup.addLayer(polyline);
    });
  }, [showSupplyChainVectors, selectedStateId]);

  // Handlers
  const handleTriggerShock = () => {
    setShockWaveTriggered(true);
    setTimeout(() => {
      setShockWaveTriggered(false);
    }, 7000);
  };

  const handleResetOverview = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([22.8, 79.5], 5, { duration: 1.0 });
    setSelectedStateId('GJ');
    setSelectedDistrictId('GJ-SUR');
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  // Filtered states for quick list
  const displayStates = STATES_DATA.filter((st) => {
    const effectiveScore = calculateEffectiveStateScore(st);
    const level = getRiskLevel(effectiveScore);
    if (riskFilter !== 'all' && level !== riskFilter) return false;
    if (sectorFilter !== 'all' && !st.keySectors.some((k) => k.toLowerCase().includes(sectorFilter.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Live Map Control Header */}
      <div className={`p-4 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Geospatial Radar Telemetry</span>
              </span>
              <span className="text-slate-500 font-mono">·</span>
              <span className="text-slate-400 font-medium hidden sm:inline">
                Real-World India Cartography · 23 Monitored Industrial Clusters
              </span>
            </div>

            <h2 className={`text-xl md:text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Live National SME Risk & Contagion Map
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Real-world geographic early-warning intelligence with live supply chain vectors, satellite imagery, and cluster drilldown.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Play / Pause */}
            <button
              onClick={() => setIsLiveStreamActive(!isLiveStreamActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isLiveStreamActive
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isLiveStreamActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isLiveStreamActive ? 'Stream Live' : 'Paused'}</span>
            </button>

            {/* Trigger Shock Button */}
            <button
              onClick={handleTriggerShock}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs ${
                shockWaveTriggered
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{shockWaveTriggered ? 'Shock Active (+8 pts)' : 'Inject Live Shock'}</span>
            </button>

            {/* Compare States CTA */}
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <Split className="w-3.5 h-3.5 text-blue-400" />
              <span>Compare States</span>
            </button>
          </div>
        </div>

        {/* Live Incoming Telemetry Event Ticker Bar */}
        <div className={`mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
          darkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Live Inflow</span>
            </span>
            <div className="truncate">
              <strong>{currentLiveEvent.cluster} ({currentLiveEvent.state}):</strong>{' '}
              <span className="text-slate-400">{currentLiveEvent.metric} moved </span>
              <span className="font-mono font-bold text-amber-400">{currentLiveEvent.delta}</span>{' '}
              <span className="text-slate-500 hidden md:inline">· {currentLiveEvent.note}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono shrink-0">
            {currentLiveEvent.timestamp} · Signal #{liveStreamIndex + 1}
          </div>
        </div>
      </div>

      {/* Map Control Toolbar: Scrubbing, Layers & Filters */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
        darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        {/* Left: Time Horizon Scrubber */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Horizon:</span>
          </span>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/80 border border-slate-700">
            {(['0', '30', '60', '90'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setForecastHorizon(h)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  forecastHorizon === h
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h === '0' ? 'Live Now' : `+${h} Days`}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Real Map Tile Style Switcher */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Map Style:</span>
          </span>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/80 border border-slate-700">
            {(['satellite', 'streets', 'topo', 'dark'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setTileStyle(st)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  tileStyle === st
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{TILE_CONFIG[st].icon}</span>
                <span>{TILE_CONFIG[st].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Layer Switcher & Supply Chain Vectors Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveLayer('stress')}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                activeLayer === 'stress'
                  ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Stress Score
            </button>
            <button
              onClick={() => setActiveLayer('credit')}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                activeLayer === 'credit'
                  ? 'border-red-500 bg-red-500/20 text-red-300 font-bold'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Credit at Risk
            </button>
            <button
              onClick={() => setActiveLayer('receivables')}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                activeLayer === 'receivables'
                  ? 'border-orange-500 bg-orange-500/20 text-orange-300 font-bold'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Receivables Delays
            </button>
          </div>

          {/* Supply Chain Vectors Toggle */}
          <button
            onClick={() => setShowSupplyChainVectors(!showSupplyChainVectors)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              showSupplyChainVectors
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                : 'border-slate-700 bg-slate-800 text-slate-500'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Contagion Arcs</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Real Leaflet Map (Left) & Context Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Real-World Interactive Leaflet Map (7 cols) */}
        <div className={`lg:col-span-7 p-4 md:p-5 rounded-2xl border flex flex-col justify-between transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Map Top Indicator Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-200">Focused:</span>
                <span className="font-bold text-amber-400">{selectedState.name}</span>
                {selectedDistrict && (
                  <>
                    <span className="text-slate-500">/</span>
                    <span className="text-amber-300 font-semibold">{selectedDistrict.name}</span>
                  </>
                )}
                <span className="font-mono text-cyan-300 font-extrabold ml-1">
                  ({currentEntityScore.toFixed(0)}/100)
                </span>
              </div>
            </div>

            {/* Map Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer transition-colors shadow-xs"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer transition-colors shadow-xs"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetOverview}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                title="Reset to National Overview"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset View</span>
              </button>
            </div>
          </div>

          {/* Clean Real-World Interactive Leaflet Map Canvas */}
          <div className="relative w-full h-[540px] rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl">
            <div
              ref={mapContainerRef}
              className="w-full h-full z-0 select-none"
              style={{ minHeight: '540px' }}
            />

            {/* Floating Live Telemetry Status Banner on Canvas */}
            <div className={`absolute bottom-3 left-3 px-3 py-2 rounded-xl border text-xs backdrop-blur-md shadow-xl z-[400] ${
              darkMode ? 'bg-slate-950/90 border-slate-800 text-slate-200' : 'bg-white/90 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className={`font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedState.name}</span>
                {selectedDistrict && (
                  <>
                    <span className="text-slate-500">·</span>
                    <span className={`font-semibold ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>{selectedDistrict.clusterName}</span>
                  </>
                )}
                <span className={`font-mono tabular-nums font-black ml-1 ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>
                  {currentEntityScore.toFixed(1)}
                </span>
                <span className="text-slate-500">|</span>
                <span className={`text-[10px] uppercase font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {forecastHorizon === '0' ? 'Live Now' : `+${forecastHorizon}d Forecast`}
                </span>
              </div>
            </div>

            {/* Floating Map Hint */}
            <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg border text-[10px] backdrop-blur-xs z-[400] flex items-center gap-1.5 pointer-events-none ${
              darkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-white/90 border-slate-200 text-slate-700 shadow-sm'
            }`}>
              <MapPin className="w-3 h-3 text-amber-500" />
              <span>Click any state badge or cluster pin to drill down</span>
            </div>
          </div>

          {/* Quick Regional Priority Grid below map */}
          <div className="mt-4 pt-4 border-t border-slate-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">
                Live Hotspots & Contagion Epicenters:
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {displayStates.length} Regions Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {displayStates.slice(0, 4).map((st) => {
                const isSelected = selectedStateId === st.id;
                const effScore = calculateEffectiveStateScore(st);
                const c = getRiskColor(getRiskLevel(effScore));
                const coords = st.geoCoord || STATE_GEO_COORDS[st.id];

                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setSelectedStateId(st.id);
                      setSelectedDistrictId(st.districts[0]?.id || null);
                      if (coords && mapRef.current) {
                        mapRef.current.flyTo(coords, 7, { duration: 0.8 });
                      }
                    }}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15'
                        : darkMode
                        ? 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{st.name}</span>
                      <span className={`font-mono tabular-nums font-bold ${c.text}`}>
                        {effScore.toFixed(0)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {st.districts[0]?.clusterName || st.keySectors[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Detailed Contextual Inspector Drawer (5 cols) */}
        <div className={`lg:col-span-5 p-5 md:p-6 rounded-2xl border space-y-6 transition-colors ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Header of Inspector */}
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {selectedDistrict ? `${selectedState.name} · Sub-District Cluster` : 'Live State Telemetry'}
              </span>
              <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${riskColor.bg} ${riskColor.text} border ${riskColor.border}`}>
                {currentEntityLevel} RISK
              </div>
            </div>

            <h3 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {selectedDistrict ? selectedDistrict.clusterName : `${selectedState.name} MSME Industrial Base`}
            </h3>

            {selectedDistrict && (
              <p className="text-xs text-amber-400 font-medium mt-1">
                Dominant Stress Driver: {selectedDistrict.dominantIssue}
              </p>
            )}
          </div>

          {/* Current Score & 30-60-90 Day Forecast Strip */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Dynamic Stress & Contagion Trajectory
              </span>
              <div className="flex items-center gap-1 text-xs">
                {selectedState.trend === 'worsening' && (
                  <span className="text-red-400 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" /> Contagion Spreading
                  </span>
                )}
                {selectedState.trend === 'stable' && (
                  <span className="text-amber-400 flex items-center gap-1 font-medium">
                    <Minus className="w-3.5 h-3.5" /> Stable
                  </span>
                )}
                {selectedState.trend === 'improving' && (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <TrendingDown className="w-3.5 h-3.5" /> Improving
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className={`p-2.5 rounded-xl border text-center ${
                forecastHorizon === '0'
                  ? 'border-amber-500/60 bg-amber-500/15'
                  : darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Live Now</div>
                <div className={`text-xl font-extrabold font-mono tabular-nums mt-0.5 ${riskColor.text}`}>
                  {currentEntityScore.toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Oct 2026</div>
              </div>

              <div className={`p-2.5 rounded-xl border text-center ${
                forecastHorizon === '30'
                  ? 'border-amber-500/60 bg-amber-500/15'
                  : darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">+30d</div>
                <div className="text-xl font-extrabold font-mono tabular-nums text-amber-400 mt-0.5">
                  {selectedState.forecast30.toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Nov 2026</div>
              </div>

              <div className={`p-2.5 rounded-xl border text-center ${
                forecastHorizon === '60'
                  ? 'border-amber-500/60 bg-amber-500/15'
                  : darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">+60d</div>
                <div className="text-xl font-extrabold font-mono tabular-nums text-orange-400 mt-0.5">
                  {selectedState.forecast60.toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Dec 2026</div>
              </div>

              <div className={`p-2.5 rounded-xl border text-center ${
                forecastHorizon === '90'
                  ? 'border-amber-500/60 bg-amber-500/15'
                  : darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">+90d</div>
                <div className="text-xl font-extrabold font-mono tabular-nums text-red-400 mt-0.5">
                  {selectedState.forecast90.toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Jan 2027</div>
              </div>
            </div>
          </div>

          {/* Sub-District Clusters in this State */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2.5 flex items-center justify-between">
              <span>Industrial Clusters in {selectedState.name}</span>
              <span className="text-[10px] text-slate-500">{selectedState.districts.length} Monitored</span>
            </h4>

            <div className="space-y-2">
              {selectedState.districts.map((d) => {
                const isSelected = selectedDistrictId === d.id;
                const c = getRiskColor(d.riskLevel);
                const distCoords = d.geoCoord || DISTRICT_GEO_COORDS[d.id];

                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDistrictId(d.id);
                      if (distCoords && mapRef.current) {
                        mapRef.current.flyTo(distCoords, 9, { duration: 0.8 });
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15'
                        : darkMode
                        ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{d.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                        {d.clusterName}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-mono tabular-nums font-bold text-xs ${c.text}`}>
                        {d.stressScore.toFixed(1)}
                      </div>
                      <div className="text-[10px] uppercase text-slate-500 font-semibold">
                        {d.riskLevel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Macro Exposure Metrics Strip */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-slate-400 text-[11px]">Total MSME Units</div>
              <div className="text-base font-bold text-slate-200 mt-0.5">
                {(selectedState.totalSMEs / 100000).toFixed(1)} Lakh
              </div>
              <div className="text-[10px] text-red-400 mt-1">
                {(selectedState.activeStressedSMEs / 1000).toFixed(0)}k Units in Distress
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-slate-400 text-[11px]">Banking Credit at Risk</div>
              <div className="text-base font-bold text-amber-400 mt-0.5">
                ₹{selectedState.creditAtRiskCr.toLocaleString()} Cr
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Monitored by SLBC / RBI
              </div>
            </div>
          </div>

          {/* Top Contributing Risk Drivers */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">
              Top Structural Stress Drivers
            </h4>
            <div className="space-y-1.5 text-xs">
              {selectedState.topRiskFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border flex items-center gap-2 ${
                    darkMode ? 'bg-slate-950/40 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                  <span className="text-[11px] leading-tight">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Interventions */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">
              Actionable Policy Interventions
            </h4>
            <div className="space-y-1.5 text-xs">
              {selectedState.recommendedInterventions.map((intervention, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border flex items-start gap-2 ${
                    darkMode ? 'bg-slate-950/40 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">{intervention}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Executive Intelligence Briefing CTA */}
          {onGenerateBriefing && (
            <button
              onClick={() => onGenerateBriefing(selectedState)}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Executive Briefing for {selectedState.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* State Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-4xl p-6 rounded-2xl border shadow-2xl space-y-6 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Split className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold">Inter-State Financial Contagion Comparison</h3>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* State A (Primary) */}
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase font-bold text-amber-400">Region A</span>
                  <select
                    value={selectedStateId}
                    onChange={(e) => setSelectedStateId(e.target.value)}
                    className="text-xs p-1 rounded bg-slate-800 border border-slate-700 text-white"
                  >
                    {STATES_DATA.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <h4 className="text-xl font-bold">{selectedState.name}</h4>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Stress Score:</span>
                    <span className="font-mono font-bold text-amber-400">{selectedState.stressScore}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">+60d Forecast:</span>
                    <span className="font-mono font-bold">{selectedState.forecast60}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Credit at Risk:</span>
                    <span className="font-mono font-bold">₹{selectedState.creditAtRiskCr.toLocaleString()} Cr</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Key Sectors:</span>
                    <span className="text-slate-300">{selectedState.keySectors.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* State B (Comparison) */}
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase font-bold text-blue-400">Region B</span>
                  <select
                    value={compareStateId}
                    onChange={(e) => setCompareStateId(e.target.value)}
                    className="text-xs p-1 rounded bg-slate-800 border border-slate-700 text-white"
                  >
                    {STATES_DATA.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <h4 className="text-xl font-bold">{compareState.name}</h4>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Stress Score:</span>
                    <span className="font-mono font-bold text-blue-400">{compareState.stressScore}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">+60d Forecast:</span>
                    <span className="font-mono font-bold">{compareState.forecast60}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Credit at Risk:</span>
                    <span className="font-mono font-bold">₹{compareState.creditAtRiskCr.toLocaleString()} Cr</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Key Sectors:</span>
                    <span className="text-slate-300">{compareState.keySectors.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Full-Screen State Satellite Map Modal */}
      {isSatelliteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className={`w-full max-w-5xl p-5 rounded-2xl border shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Satellite className="w-5 h-5 text-cyan-400 animate-pulse" />
                <div>
                  <h3 className="text-base font-bold">
                    {selectedState.name} · High-Resolution Real-World Satellite Orbital Map
                  </h3>
                  <p className="text-xs text-slate-400">
                    Multispectral orbital view of {selectedDistrict ? `${selectedDistrict.clusterName} (${selectedDistrict.name})` : `${selectedState.name} region`} with road, town, and cluster overlays.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSatelliteModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <StateSatelliteMiniMap
              state={selectedState}
              selectedDistrict={selectedDistrict}
              darkMode={darkMode}
              onSelectDistrict={(distId) => setSelectedDistrictId(distId)}
              height="520px"
            />
          </div>
        </div>
      )}
    </div>
  );
};
