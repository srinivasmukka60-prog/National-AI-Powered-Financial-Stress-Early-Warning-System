import React, { useState, useEffect } from 'react';
import { STATES_DATA, SECTORS_DATA, SUPPLY_CHAIN_VECTORS, LIVE_TELEMETRY_STREAM } from '../data/indiaData';
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
} from 'lucide-react';

interface IndiaMapProps {
  darkMode: boolean;
  onGenerateBriefing?: (state: StateData) => void;
}

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

  // Time-Travel Scrubber: '0' | '30' | '60' | '90'
  const [forecastHorizon, setForecastHorizon] = useState<'0' | '30' | '60' | '90'>('0');

  // Zoom / Scale state
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Compare mode
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [compareStateId, setCompareStateId] = useState<string>('TN');

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

  // Dynamic score calculator based on forecast scrubber and sector filter
  const calculateEffectiveStateScore = (st: StateData): number => {
    let score = st.stressScore;
    if (forecastHorizon === '30') score = st.forecast30;
    if (forecastHorizon === '60') score = st.forecast60;
    if (forecastHorizon === '90') score = st.forecast90;

    // If shock wave triggered, add dynamic surge
    if (shockWaveTriggered) {
      if (st.id === 'GJ' || st.id === 'TN' || st.id === 'PB') score = Math.min(98, score + 8.5);
      else score = Math.min(95, score + 4.2);
    }

    // Sector specific modulation
    if (sectorFilter !== 'all') {
      const sectorObj = SECTORS_DATA.find((s) => s.id === sectorFilter);
      if (sectorObj && st.keySectors.some((ks) => ks.toLowerCase().includes(sectorObj.name.toLowerCase().slice(0, 5)))) {
        score = (score * 0.6) + (sectorObj.stressScore * 0.4);
      }
    }

    return Math.round(score * 10) / 10;
  };

  const handleTriggerShock = () => {
    setShockWaveTriggered(true);
    setTimeout(() => setShockWaveTriggered(false), 8000);
  };

  const currentEntityScore = selectedDistrict
    ? selectedDistrict.stressScore + (forecastHorizon === '30' ? 3.5 : forecastHorizon === '60' ? 7.2 : forecastHorizon === '90' ? 10.1 : 0)
    : calculateEffectiveStateScore(selectedState);

  const currentEntityLevel = getRiskLevel(currentEntityScore);
  const riskColor = getRiskColor(currentEntityLevel);

  // Filtered states for lists
  const displayStates = riskFilter === 'all'
    ? STATES_DATA
    : STATES_DATA.filter((s) => getRiskLevel(calculateEffectiveStateScore(s)) === riskFilter);

  return (
    <div className="space-y-6">
      {/* Live Operational Control Bar */}
      <div className={`p-4 md:p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Live Streaming Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold uppercase tracking-wider">
                <span className={`w-2 h-2 rounded-full bg-red-500 ${isLiveStreamActive ? 'animate-ping' : ''}`}></span>
                <span>Live Sentinel Telemetry</span>
              </div>
              <span className="text-slate-500 font-mono">·</span>
              <span className="text-slate-400 font-mono font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{liveTime || 'Live Syncing'}</span>
              </span>
              <span className="text-slate-500 font-mono">·</span>
              <span className="text-slate-400 font-medium hidden sm:inline">
                National MSME Registry · 23 Monitored States & Clusters
              </span>
            </div>

            <h2 className={`text-xl md:text-2xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Live National SME Risk & Contagion Map
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Real-time geospatial early-warning intelligence with live supply chain vectors, predictive horizon scrubbing, and cluster drilldown.
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

        {/* Center: Layer Selector */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Layer:</span>
          </span>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/80 border border-slate-700">
            {[
              { id: 'stress', label: 'Stress Score' },
              { id: 'credit', label: 'Credit Volume' },
              { id: 'receivables', label: 'DSO Heatmap' },
              { id: 'warnings', label: 'Alert Pins' },
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id as any)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeLayer === layer.id
                    ? 'bg-blue-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Contagion Vectors Toggle & Sector Filter */}
        <div className="flex items-center gap-3">
          {/* Supply Chain Vectors Toggle */}
          <button
            onClick={() => setShowSupplyChainVectors(!showSupplyChainVectors)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
              showSupplyChainVectors
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                : 'border-slate-700 bg-slate-800 text-slate-400'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Supply Chain Vectors</span>
          </button>

          {/* Sector filter */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className={`py-1.5 px-3 rounded-lg border cursor-pointer font-medium ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="all">All Sectors (Composite)</option>
            {SECTORS_DATA.map((s) => (
              <option key={s.id} value={s.id}>
                Sector: {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map + Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Vector Map Canvas */}
        <div className={`lg:col-span-7 p-4 md:p-6 rounded-2xl border flex flex-col justify-between transition-colors relative ${
          darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Top Canvas Bar */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-400">Risk Scale:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-400">0–30 (Low)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-400">31–60 (Mod)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-slate-400">61–80 (High)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="text-slate-400">81–100 (Crit)</span>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
                className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Canvas Container */}
          <div className="relative w-full aspect-[4/3] flex items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 overflow-hidden">
            {/* Background High-Tech Hex/Radar Visuals */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
              <div className="w-72 h-72 rounded-full border border-amber-500/30 animate-pulse"></div>
              <div className="w-[420px] h-[420px] rounded-full border border-slate-700/40"></div>
              <div className="w-[580px] h-[580px] rounded-full border border-slate-800/30"></div>
            </div>

            <svg
              viewBox="120 140 370 540"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
              className="w-full h-full max-h-[530px] select-none"
            >
              <defs>
                <filter id="live-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="vector-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Supply Chain Contagion Vectors (Animated Flow Lines) */}
              {showSupplyChainVectors && (
                <g className="transition-opacity duration-300">
                  {SUPPLY_CHAIN_VECTORS.map((vec) => {
                    const fromSt = STATES_DATA.find((s) => s.id === vec.fromState);
                    const toSt = STATES_DATA.find((s) => s.id === vec.toState);
                    if (!fromSt || !toSt) return null;

                    return (
                      <g key={vec.id}>
                        {/* Flow trajectory path */}
                        <line
                          x1={fromSt.labelCoord[0]}
                          y1={fromSt.labelCoord[1]}
                          x2={toSt.labelCoord[0]}
                          y2={toSt.labelCoord[1]}
                          stroke="url(#vector-grad)"
                          strokeWidth={vec.intensity === 'high' ? '1.8' : '1.2'}
                          strokeDasharray="4 4"
                          opacity="0.75"
                          className="animate-pulse"
                        />
                        {/* Mid-point flow particle */}
                        <circle
                          cx={(fromSt.labelCoord[0] + toSt.labelCoord[0]) / 2}
                          cy={(fromSt.labelCoord[1] + toSt.labelCoord[1]) / 2}
                          r="2.5"
                          fill="#f59e0b"
                          opacity="0.9"
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* State Shapes & Click Targets */}
              {STATES_DATA.map((st) => {
                const isSelected = selectedStateId === st.id;
                const isHovered = hoveredStateId === st.id;
                const effectiveScore = calculateEffectiveStateScore(st);
                const level = getRiskLevel(effectiveScore);
                const stateColor = getRiskColor(level);

                // Layer-based color tuning
                let fillColor = stateColor.hex;
                if (activeLayer === 'credit') {
                  fillColor = st.creditAtRiskCr > 40000 ? '#ef4444' : st.creditAtRiskCr > 20000 ? '#f97316' : '#10b981';
                } else if (activeLayer === 'receivables') {
                  fillColor = (st.id === 'GJ' || st.id === 'TN' || st.id === 'UP') ? '#ef4444' : '#f59e0b';
                }

                const isFilteredOut = riskFilter !== 'all' && level !== riskFilter;

                return (
                  <g
                    key={st.id}
                    onClick={() => {
                      setSelectedStateId(st.id);
                      setSelectedDistrictId(st.districts[0]?.id || null);
                    }}
                    onMouseEnter={() => setHoveredStateId(st.id)}
                    onMouseLeave={() => setHoveredStateId(null)}
                    className="cursor-pointer transition-all duration-200"
                    opacity={isFilteredOut ? 0.2 : 1}
                  >
                    {/* SVG State Region Polygon */}
                    <path
                      d={st.svgPath}
                      fill={fillColor}
                      fillOpacity={isSelected ? 0.48 : isHovered ? 0.38 : 0.22}
                      stroke={isSelected ? '#ffffff' : fillColor}
                      strokeWidth={isSelected ? 2.8 : isHovered ? 2.2 : 1.3}
                      filter={isSelected ? 'url(#live-glow)' : undefined}
                      className="transition-all"
                    />

                    {/* State Center Hub Node Circle */}
                    <circle
                      cx={st.labelCoord[0]}
                      cy={st.labelCoord[1]}
                      r={isSelected ? 10.5 : 7.5}
                      fill={fillColor}
                      fillOpacity={0.92}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="transition-all"
                    />

                    {/* Shock / Critical pulse ring */}
                    {(level === 'critical' || shockWaveTriggered) && (
                      <circle
                        cx={st.labelCoord[0]}
                        cy={st.labelCoord[1]}
                        r={isSelected ? 18 : 13}
                        fill="none"
                        stroke={fillColor}
                        strokeWidth="1.2"
                        opacity="0.8"
                        className="animate-ping"
                      />
                    )}

                    {/* State Name Label */}
                    <text
                      x={st.labelCoord[0]}
                      y={st.labelCoord[1] - 12}
                      textAnchor="middle"
                      fill={darkMode ? '#ffffff' : '#0f172a'}
                      fontSize={isSelected ? '11.5' : '9.5'}
                      fontWeight={isSelected ? '800' : '600'}
                      className="pointer-events-none drop-shadow-sm font-sans"
                    >
                      {st.name}
                    </text>

                    {/* Stress Score number inside circle */}
                    <text
                      x={st.labelCoord[0]}
                      y={st.labelCoord[1] + 3}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="7.5"
                      fontWeight="800"
                      className="pointer-events-none font-mono tabular-nums"
                    >
                      {effectiveScore.toFixed(0)}
                    </text>

                    {/* Warning layer pin icon indicator */}
                    {activeLayer === 'warnings' && (st.id === 'GJ' || st.id === 'TN' || st.id === 'PB' || st.id === 'UP') && (
                      <g transform={`translate(${st.labelCoord[0] + 8}, ${st.labelCoord[1] - 16})`}>
                        <circle cx="0" cy="0" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                        <text x="0" y="2.5" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">!</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* District Cluster Markers for the selected state */}
              {selectedState.districts.map((d, idx) => {
                const offsetX = (idx % 2 === 0 ? -20 : 20) * (idx + 1);
                const offsetY = (idx > 1 ? 20 : -20);
                const cx = selectedState.labelCoord[0] + offsetX;
                const cy = selectedState.labelCoord[1] + offsetY;
                const isSelectedCluster = selectedDistrictId === d.id;
                const distColor = getRiskColor(d.riskLevel);

                return (
                  <g
                    key={d.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDistrictId(d.id);
                    }}
                    className="cursor-pointer"
                  >
                    <line
                      x1={selectedState.labelCoord[0]}
                      y1={selectedState.labelCoord[1]}
                      x2={cx}
                      y2={cy}
                      stroke="rgba(245, 158, 11, 0.45)"
                      strokeWidth="1.2"
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelectedCluster ? 6.5 : 4.5}
                      fill={distColor.hex}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={cx}
                      y={cy - 7}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="7.5"
                      fontWeight="700"
                      className="pointer-events-none drop-shadow-sm"
                    >
                      {d.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating Live Telemetry Status Banner on Canvas */}
            <div className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-xl border text-xs backdrop-blur-md shadow-lg ${
              darkMode ? 'bg-slate-900/90 border-slate-700 text-slate-200' : 'bg-white/90 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-white">Live Focused:</span>
                <span className="text-amber-400 font-extrabold">{selectedState.name}</span>
                {selectedDistrict && (
                  <>
                    <span className="text-slate-500">/</span>
                    <span className="text-amber-300 font-semibold">{selectedDistrict.name}</span>
                  </>
                )}
                <span className="font-mono tabular-nums font-extrabold text-amber-300">
                  ({currentEntityScore.toFixed(1)})
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {forecastHorizon === '0' ? 'Live Now' : `+${forecastHorizon}d Forecast`}
                </span>
              </div>
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
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setSelectedStateId(st.id);
                      setSelectedDistrictId(st.districts[0]?.id || null);
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

        {/* Right: Detailed Contextual Inspector Drawer */}
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

          {/* Aggregate Exposure Indicators */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[11px] text-slate-400 font-medium">Bank Credit at Risk</div>
              <div className="text-lg font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                ₹{selectedState.creditAtRiskCr.toLocaleString()} Cr
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Commercial Banks & NBFCs</div>
            </div>

            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-[11px] text-slate-400 font-medium">Stressed MSME Units</div>
              <div className="text-lg font-bold font-mono tabular-nums text-red-400 mt-0.5">
                {selectedState.activeStressedSMEs.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {((selectedState.activeStressedSMEs / selectedState.totalSMEs) * 100).toFixed(1)}% of total state base
              </div>
            </div>
          </div>

          {/* District Clusters Drilldown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase">
              <span>Industrial Clusters in {selectedState.name}</span>
              <Building className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-1.5">
              {selectedState.districts.map((dist) => {
                const isSelected = selectedDistrictId === dist.id;
                const dColor = getRiskColor(dist.riskLevel);
                return (
                  <button
                    key={dist.id}
                    onClick={() => setSelectedDistrictId(dist.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15'
                        : darkMode
                        ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{dist.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({dist.mainSectors.join(', ')})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        {dist.dominantIssue}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-mono tabular-nums text-xs font-bold ${dColor.text}`}>
                        {dist.stressScore.toFixed(0)}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Major Risk Factors */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase">
              Top Structural Stress Drivers
            </div>
            <div className="space-y-1.5">
              {selectedState.topRiskFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                    darkMode ? 'bg-slate-950/40 text-slate-300' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-mono text-amber-500 font-bold">0{idx + 1}.</span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Policy Interventions */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase">
              Recommended Policy Interventions
            </div>
            <div className="space-y-1.5">
              {selectedState.recommendedInterventions.map((rec, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                    darkMode ? 'bg-emerald-950/20 border border-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger AI Policy Briefing */}
          {onGenerateBriefing && (
            <button
              onClick={() => onGenerateBriefing(selectedState)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Gemini AI Policy Briefing for {selectedState.name}</span>
            </button>
          )}
        </div>
      </div>

      {/* Side-by-Side State Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl p-6 space-y-6 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                <Split className="w-4 h-4" />
                <span>State MSME Stress Comparison</span>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Selectors for State A and State B */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">State A</label>
                <select
                  value={selectedStateId}
                  onChange={(e) => setSelectedStateId(e.target.value)}
                  className={`w-full p-2 text-xs rounded-lg border font-bold ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                >
                  {STATES_DATA.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.stressScore.toFixed(0)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">State B</label>
                <select
                  value={compareStateId}
                  onChange={(e) => setCompareStateId(e.target.value)}
                  className={`w-full p-2 text-xs rounded-lg border font-bold ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                >
                  {STATES_DATA.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.stressScore.toFixed(0)})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direct Comparison Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 text-xs">
              <div className="grid grid-cols-3 p-3 bg-slate-950/60 font-semibold text-slate-400">
                <span>Metric</span>
                <span>{selectedState.name}</span>
                <span>{compareState.name}</span>
              </div>

              <div className="grid grid-cols-3 p-3">
                <span className="text-slate-400">Stress Score</span>
                <span className={`font-mono font-bold text-base ${getRiskColor(selectedState.riskLevel).text}`}>
                  {selectedState.stressScore.toFixed(1)} ({selectedState.riskLevel})
                </span>
                <span className={`font-mono font-bold text-base ${getRiskColor(compareState.riskLevel).text}`}>
                  {compareState.stressScore.toFixed(1)} ({compareState.riskLevel})
                </span>
              </div>

              <div className="grid grid-cols-3 p-3">
                <span className="text-slate-400">60-Day Predictive Trajectory</span>
                <span className="font-mono text-amber-400 font-bold">{selectedState.forecast60.toFixed(1)}</span>
                <span className="font-mono text-amber-400 font-bold">{compareState.forecast60.toFixed(1)}</span>
              </div>

              <div className="grid grid-cols-3 p-3">
                <span className="text-slate-400">Bank Credit at Risk</span>
                <span className="font-mono font-bold text-white">₹{selectedState.creditAtRiskCr.toLocaleString()} Cr</span>
                <span className="font-mono font-bold text-white">₹{compareState.creditAtRiskCr.toLocaleString()} Cr</span>
              </div>

              <div className="grid grid-cols-3 p-3">
                <span className="text-slate-400">Stressed Enterprise Share</span>
                <span className="font-mono text-red-400 font-bold">
                  {((selectedState.activeStressedSMEs / selectedState.totalSMEs) * 100).toFixed(1)}%
                </span>
                <span className="font-mono text-red-400 font-bold">
                  {((compareState.activeStressedSMEs / compareState.totalSMEs) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="grid grid-cols-3 p-3">
                <span className="text-slate-400">Dominant Cluster Issue</span>
                <span className="text-slate-300">{selectedState.topRiskFactors[0]}</span>
                <span className="text-slate-300">{compareState.topRiskFactors[0]}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
