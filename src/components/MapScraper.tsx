import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMapEvents, Rectangle, LayersControl, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, Target, Scan, Search, Globe, Map as MapIcon, Satellite, Trash2, Box, Twitter, Video, Send, Ghost } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import TacticalGlobe from './TacticalGlobe';
import { useNotifications } from './NotificationProvider';

interface Region {
  start: L.LatLng;
  end: L.LatLng;
}

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  
  React.useEffect(() => {
    // Immediate sync
    map.setView(center, zoom);
    
    const invalidate = () => {
      map.invalidateSize({ animate: false });
    };

    // Force recalculation at specific intervals during potential animations
    const schedule = [10, 50, 100, 250, 500, 1000, 2000];
    const timeouts = schedule.map(delay => setTimeout(invalidate, delay));

    // Watch for actual container size changes
    const observer = new ResizeObserver(() => {
      invalidate();
      // Ensure we don't drop the world view
      if (map.getZoom() < 2) map.setZoom(2);
    });

    // Handle full window events too
    window.addEventListener('resize', invalidate);
    
    const container = map.getContainer();
    if (container) {
      observer.observe(container);
    }

    // Force a fresh tile load
    map.fire('viewreset');

    return () => {
      timeouts.forEach(t => clearTimeout(t));
      observer.disconnect();
      window.removeEventListener('resize', invalidate);
    };
  }, [center, zoom, map]);

  return null;
}

// Fix for default Leaflet markers in Vite/React
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function RegionPicker({ onRegionSelected, active }: { onRegionSelected: (region: Region) => void, active: boolean }) {
  const [start, setStart] = useState<L.LatLng | null>(null);
  const [current, setCurrent] = useState<L.LatLng | null>(null);

  const map = useMapEvents({
    mousedown: (e) => {
      // Use active tool OR shift key
      if (active || e.originalEvent.shiftKey) {
          // Disable map dragging while selecting
          map.dragging.disable();
          setStart(e.latlng);
          setCurrent(e.latlng);
      }
    },
    mousemove: (e) => {
      if (start) setCurrent(e.latlng);
    },
    mouseup: (e) => {
      if (start && current) {
        onRegionSelected({ start, end: current });
      }
      setStart(null);
      setCurrent(null);
      map.dragging.enable();
    }
  });

  if (!start || !current) return null;

  return <Rectangle bounds={[[start.lat, start.lng], [current.lat, current.lng]]} pathOptions={{ color: '#00f2ff', weight: 1, fillOpacity: 0.2, dashArray: '4' }} />;
}

export default function MapScraper({ onScrape, isScraping }: { onScrape: (query: string, source: string, locationName: string | null, region: Region) => void, isScraping: boolean }) {
  const { addNotification } = useNotifications();
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('Google Maps');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectionMode, setSelectionMode] = useState(true);
  const [mapView, setMapView] = useState<{center: [number, number], zoom: number}>({
    center: [20, 0], // Start more global
    zoom: 2
  });

  const [locationName, setLocationName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'orbital' | 'tactical'>('orbital');

  React.useEffect(() => {
    if (selectedRegion) {
      const fetchLocation = async () => {
        try {
          const lat = (selectedRegion.start.lat + selectedRegion.end.lat) / 2;
          const lng = (selectedRegion.start.lng + selectedRegion.end.lng) / 2;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
          const data = await res.json();
          const name = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.state || data.address.country || "Target Sector";
          setLocationName(name);
        } catch (err) {
          setLocationName("Target Sector Alpha");
        }
      };
      fetchLocation();
    } else {
      setLocationName(null);
    }
  }, [selectedRegion]);

  const sources = [
      { name: 'Google Maps', icon: MapIcon, color: 'text-green-400' },
      { name: 'LinkedIn', icon: Globe, color: 'text-blue-400' },
      { name: 'Instagram', icon: Scan, color: 'text-pink-400' },
      { name: 'Facebook', icon: Search, color: 'text-blue-500' },
      { name: 'X / Twitter', icon: Twitter, color: 'text-white' },
      { name: 'TikTok', icon: Video, color: 'text-brand-primary' },
      { name: 'Telegram', icon: Send, color: 'text-sky-400' },
      { name: 'Snapchat', icon: Ghost, color: 'text-yellow-400' }
  ];

  const handleRegionSelected = (region: Region) => {
    setSelectedRegion(region);
    setSelectionMode(false);
  };

  const startScrape = () => {
    if (!query || !selectedRegion || isScraping) return;
    onScrape(query, source, locationName, selectedRegion);
  };

  const handleGlobeSelect = (lat: number, lng: number) => {
    setMapView({ center: [lat, lng], zoom: 12 });
    setViewMode('tactical');
  };

  return (
    <div className="flex flex-col h-full gap-4 p-8 animate-in fade-in duration-1000 relative z-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col shrink-0">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-black glow shrink-0">
                <Satellite size={28} />
            </div>
            Map Search
          </h2>
          <p className="text-white/40 mt-1 text-sm font-medium">Select an area on the map to find business info.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center glass p-3 rounded-[28px] pointer-events-auto relative overflow-hidden">
            <div className="flex gap-1.5 mr-2 border-r border-white/10 pr-4">
                {sources.map(s => (
                    <button
                        key={s.name}
                        onClick={() => setSource(s.name)}
                        className={cn(
                            "p-2.5 rounded-xl transition-all relative group",
                            source === s.name ? "bg-white/10 text-white" : "text-white/30 hover:bg-white/5"
                        )}
                    >
                        <s.icon size={20} className={cn(source === s.name ? s.color : "")} />
                    </button>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input 
                    type="text" 
                    placeholder="Search query..." 
                    className="bg-white/5 rounded-2xl pl-12 pr-6 py-3 w-64 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all font-mono"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isScraping}
                />
            </div>

            <button 
                onClick={startScrape}
                disabled={!query || !selectedRegion || isScraping}
                className={cn(
                    "px-8 py-3 rounded-2xl font-black text-xs tracking-widest uppercase transition-all flex items-center gap-3",
                    (!query || !selectedRegion) ? "bg-white/5 text-white/20 cursor-not-allowed" : isScraping ? "bg-brand-primary/20 text-brand-primary" : "bg-brand-primary text-black hover:scale-105 active:scale-95 shadow-xl hover:shadow-brand-primary/20"
                )}
            >
                {isScraping ? (
                    <>
                        <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        Scanning
                    </>
                ) : (
                    <>
                        <Target size={18} />
                        Launch Scrap
                    </>
                )}
            </button>

            {/* Expanding Loader Bar */}
            <AnimatePresence>
                {isScraping && (
                    <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary origin-left shadow-[0_0_15px_#00f2ff]"
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                )}
            </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 relative rounded-[44px] overflow-hidden group border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] bg-black z-30">
        <AnimatePresence mode="wait">
          {viewMode === 'orbital' ? (
            <motion.div 
              key="globe"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 z-10"
            >
              <TacticalGlobe onLocationSelect={handleGlobeSelect} />
              
              <div className="absolute top-8 right-8 z-[1000]">
                <button 
                  onClick={() => setViewMode('tactical')}
                  className="glass-dark px-6 py-3 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#00f2ff] hover:bg-white/10 transition-all border border-[#00f2ff]/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] active:scale-95 pointer-events-auto"
                >
                  <Target size={16} />
                  Deploy Tactical Zoom
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10"
            >
              <MapContainer 
                center={mapView.center} 
                zoom={mapView.zoom} 
                minZoom={2}
                maxZoom={18}
                worldCopyJump={true}
                style={{ height: '100%', width: '100%', background: '#000' }}
                zoomControl={false}
                className="z-10"
                scrollWheelZoom={true}
              >
                <ZoomControl position="bottomright" />
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Tactical High-Res">
                    <TileLayer
                      url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                      attribution='&copy; Google'
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Grounded Satellite">
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='&copy; Esri'
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Neural Flux (Dark)">
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; CartoDB'
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
                
                <MapController center={mapView.center} zoom={mapView.zoom} />
                <RegionPicker onRegionSelected={handleRegionSelected} active={selectionMode && !isScraping} />
                
                {selectedRegion && (
                  <Rectangle 
                    bounds={[[selectedRegion.start.lat, selectedRegion.start.lng], [selectedRegion.end.lat, selectedRegion.end.lng]]} 
                    pathOptions={{ 
                        color: '#00f2ff', 
                        fillOpacity: isScraping ? 0.3 : 0.1, 
                        weight: 2,
                        dashArray: isScraping ? '10, 10' : '0',
                        className: isScraping ? 'scanning-rect' : ''
                    }} 
                  >
                    {locationName && (
                      <Tooltip permanent direction="top" className="tactical-tooltip">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[9px] font-black tracking-[0.2em] text-[#00f2ff] uppercase">SEC_LOCKED</span>
                          <span className="text-white text-[10px] font-bold uppercase">{locationName}</span>
                        </div>
                      </Tooltip>
                    )}
                  </Rectangle>
                )}
              </MapContainer>

              <div className="absolute top-8 right-8 z-[1000] pointer-events-auto">
                <button 
                  onClick={() => setViewMode('orbital')}
                  className="glass-dark px-6 py-3 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#00f2ff] hover:bg-white/10 transition-all border border-[#00f2ff]/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] active:scale-95"
                >
                  <Box size={16} />
                  Return to Orbit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD Elements */}
        <div className="absolute top-8 left-8 pointer-events-none z-[900] flex flex-col gap-4">
            <motion.div 
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="glass-dark px-5 py-3 rounded-2xl flex items-center gap-4 border-l-2 border-brand-primary"
            >
                <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
                <div>
                   <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Satellite Status</p>
                   <p className="text-xs font-mono font-bold mt-0.5">UPLINK ESTABLISHED</p>
                </div>
            </motion.div>

            <div className="flex gap-2 pointer-events-auto">
                <button 
                  onClick={() => setSelectionMode(!selectionMode)}
                  className={cn(
                    "px-4 py-3 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                    selectionMode ? "bg-brand-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.4)]" : "glass-dark text-white hover:bg-white/10"
                  )}
                >
                  <Crosshair size={14} className={selectionMode ? "animate-spin" : ""} />
                  {selectionMode ? "Selection Active" : "Enable Selector"}
                </button>
                {selectedRegion && (
                  <button 
                    onClick={() => setSelectedRegion(null)}
                    className="px-4 py-3 glass-dark text-white hover:text-red-400 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Clear Area
                  </button>
                )}
            </div>
        </div>

        <div className="absolute top-8 right-[280px] z-[800] flex flex-col items-end gap-3 pointer-events-none">
           <div className="glass-dark px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-brand-primary bg-black/90 pointer-events-none flex flex-col items-end shadow-2xl border border-brand-primary/20 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", selectedRegion ? "bg-brand-primary" : "bg-white/20")} />
                <span>Target Lock: {selectedRegion ? 'CONFIRMED' : 'WAITING'}</span>
              </div>
              {locationName && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white mt-1 border-t border-white/10 pt-1 w-full text-right"
                >
                  SECTOR: {locationName}
                </motion.span>
              )}
           </div>
           
           <div className="glass-dark p-2 rounded-2xl flex items-center gap-2 border border-white/10 pointer-events-auto shadow-2xl bg-black/60 backdrop-blur-md">
              <Search className="text-white/30 ml-2" size={16} />
              <input 
                type="text" 
                placeholder="Jump to city..."
                className="bg-transparent border-none text-[10px] uppercase font-black tracking-widest focus:outline-none w-48 placeholder:text-white/20 text-white"
                onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                        const q = (e.target as HTMLInputElement).value;
                        if (!q) return;
                        addNotification(`LOCATING SECTOR: ${q.toUpperCase()}...`, 'process');
                        try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
                            const data = await res.json();
                            if (data.length > 0) {
                                addNotification(`VECTOR ESTABLISHED: ${q.toUpperCase()}`, 'success');
                                const lat = parseFloat(data[0].lat);
                                const lon = parseFloat(data[0].lon);
                                setMapView({
                                    center: [lat, lon],
                                    zoom: 14
                                });
                                
                                if (data[0].boundingbox) {
                                  const bbox = data[0].boundingbox;
                                  setSelectedRegion({
                                    start: L.latLng(parseFloat(bbox[0]), parseFloat(bbox[2])),
                                    end: L.latLng(parseFloat(bbox[1]), parseFloat(bbox[3]))
                                  });
                                }
                                setViewMode('tactical');
                            } else {
                                addNotification(`ERROR: SECTOR ${q.toUpperCase()} NOT FOUND`, 'error');
                            }
                        } catch (err) {
                            addNotification(`SYSTEM ERROR: GEOLOCATION NODE TIMEOUT`, 'error');
                        }
                    }
                }}
              />
           </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[800]">
           <AnimatePresence>
             {!selectedRegion && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 20 }}
                 className="glass-dark px-10 py-5 rounded-[30px] flex items-center gap-6 border border-white/10 shadow-2xl"
               >
                 <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Crosshair className="text-brand-primary" size={24} />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-black tracking-tight uppercase">Define Search Perimeter</span>
                    <span className="text-[10px] text-white/40 font-medium mt-1 uppercase tracking-widest leading-relaxed">
                        {selectionMode 
                          ? "Click and Drag on the map to highlight your target area" 
                          : "Toggle Crosshairs or Hold Shift + Drag to select sector"}
                    </span>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {isScraping && (
            <div className="absolute inset-0 z-[500] pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-brand-primary/5 transition-opacity" />
                <motion.div 
                    initial={{ top: '-10%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-brand-primary shadow-[0_0_100px_rgba(0,242,255,0.3)] to-transparent opacity-40"
                />
            </div>
        )}
      </div>
    </div>
  );
}
