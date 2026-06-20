"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { MapPin, Users, AlertTriangle, RefreshCw, X, ZoomIn, ZoomOut } from "lucide-react"

/* ─────────── Types ─────────── */
interface SuspectInfo {
  id: string
  fullName: string
  address: string | null
  status: string
  aliases: string | null
}
interface LocationData {
  address: string
  count: number
  suspects: SuspectInfo[]
}
interface Props {
  locations: LocationData[]
  totalCount: number
  noAddressCount: number
}
interface GeoResult extends LocationData {
  lat: number
  lon: number
}

/* ─────────── Web Mercator helpers ─────────── */
/** Returns continuous tile coordinate (not floored) at given zoom */
function exactTile(lat: number, lon: number, zoom: number) {
  const n = Math.pow(2, zoom)
  const ex = ((lon + 180) / 360) * n
  const latR = (lat * Math.PI) / 180
  const ey = ((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n
  return { ex, ey }
}

/** Convert geographic point → screen pixel given center + zoom + canvas size */
function geo2px(
  lat: number, lon: number,
  cLat: number, cLon: number,
  zoom: number, W: number, H: number
) {
  const { ex, ey } = exactTile(lat, lon, zoom)
  const { ex: cx, ey: cy } = exactTile(cLat, cLon, zoom)
  return { x: W / 2 + (ex - cx) * 256, y: H / 2 + (ey - cy) * 256 }
}

/* ─────────── Geocoding ─────────── */
async function geocode(address: string): Promise<{ lat: number; lon: number } | null> {
  for (const suffix of [", Khánh Hòa, Việt Nam", ", Việt Nam"]) {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + suffix)}&limit=1&accept-language=vi&countrycodes=vn`,
        { headers: { "User-Agent": "CriminalRecordApp/1.0" } }
      )
      const d = await r.json()
      if (d?.length > 0) return { lat: +d[0].lat, lon: +d[0].lon }
    } catch {}
  }
  return null
}

/* ─────────── Status labels ─────────── */
const STATUS_LABEL: Record<string, string> = {
  WANTED: "Truy nã", IN_PRISON: "Thụ án", RELEASED: "Mãn hạn", UNKNOWN: "Chưa rõ",
}
const STATUS_CLS: Record<string, string> = {
  WANTED: "text-red-500 bg-red-500/10 border-red-500/30",
  IN_PRISON: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  RELEASED: "text-zinc-400 bg-zinc-700/40 border-zinc-600/30",
  UNKNOWN: "text-blue-400 bg-blue-500/10 border-blue-500/30",
}

/* ─────────── Map tile component ─────────── */
interface TileLayerProps {
  cLat: number; cLon: number; zoom: number; W: number; H: number
}
function TileLayer({ cLat, cLon, zoom, W, H }: TileLayerProps) {
  const { ex: cx, ey: cy } = exactTile(cLat, cLon, zoom)
  const tileRadius = Math.ceil(W / 256 / 2) + 1
  const tileRadiusY = Math.ceil(H / 256 / 2) + 1
  const tileX0 = Math.floor(cx) - tileRadius
  const tileY0 = Math.floor(cy) - tileRadiusY
  const tileX1 = Math.floor(cx) + tileRadius
  const tileY1 = Math.floor(cy) + tileRadiusY
  const nTiles = Math.pow(2, zoom)

  const tiles: { tx: number; ty: number; sx: number; sy: number }[] = []
  for (let ty = tileY0; ty <= tileY1; ty++) {
    for (let tx = tileX0; tx <= tileX1; tx++) {
      const sx = W / 2 + (tx - cx) * 256
      const sy = H / 2 + (ty - cy) * 256
      tiles.push({ tx, ty, sx, sy })
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ filter: "invert(90%) hue-rotate(180deg) brightness(0.88) contrast(0.9)" }}>
      {tiles.map(({ tx, ty, sx, sy }) => {
        // Wrap tile X coordinate
        const wtx = ((tx % nTiles) + nTiles) % nTiles
        const wty = ty
        if (wty < 0 || wty >= nTiles) return null
        const url = `https://tile.openstreetmap.org/${zoom}/${wtx}/${wty}.png`
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${tx}-${ty}`}
            src={url}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              left: sx,
              top: sy,
              width: 256,
              height: 256,
              imageRendering: "pixelated",
              userSelect: "none",
            }}
          />
        )
      })}
    </div>
  )
}

/* ─────────── Main component ─────────── */
export default function SuspectMap({ locations, totalCount, noAddressCount }: Props) {
  // Map state: center + zoom
  const [cLat, setCLat] = useState(12.25)
  const [cLon, setCLon] = useState(109.18)
  const [zoom, setZoom] = useState(10)

  const [geoResults, setGeoResults] = useState<GeoResult[]>([])
  const [loading, setLoading] = useState(false)
  const [geocoded, setGeocoded] = useState(0)
  const [selected, setSelected] = useState<GeoResult | null>(null)

  const W = 900, H = 540
  const containerRef = useRef<HTMLDivElement>(null)

  // Pan support
  const dragging = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const lastMouse = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    setIsDragging(true)
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    lastMouse.current = { x: e.clientX, y: e.clientY }
    const pixelsPerTile = 256
    const tilesPerDeg_lon = Math.pow(2, zoom) / 360
    const dLon = -dx / pixelsPerTile / tilesPerDeg_lon
    // Approximate: latitude shift proportional to cos(lat)
    const dLat = dy / pixelsPerTile / (Math.pow(2, zoom) / 360) * Math.cos(cLat * Math.PI / 180) * 0.7
    setCLon(v => v + dLon)
    setCLat(v => Math.max(-85, Math.min(85, v + dLat)))
  }, [zoom, cLat])
  
  const handleMouseUp = useCallback(() => {
    dragging.current = false
    setIsDragging(false)
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Scroll-to-zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(z => Math.max(6, Math.min(18, z + (e.deltaY < 0 ? 1 : -1))))
  }

  // Geocode addresses
  useEffect(() => {
    if (locations.length === 0) return
    let cancelled = false
    
    ;(async () => {
      setLoading(true)
      setGeocoded(0)
      setGeoResults([])

      for (let i = 0; i < locations.length; i++) {
        if (cancelled) break
        const loc = locations[i]
        const geo = await geocode(loc.address)
        if (geo && !cancelled) {
          setGeoResults(prev => [...prev, { ...loc, ...geo }])
        }
        if (!cancelled) setGeocoded(i + 1)
        await new Promise(r => setTimeout(r, 1300))
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [locations])

  const maxCount = Math.max(...geoResults.map(r => r.count), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <MapPin size={26} className="text-red-500" />
            Bản đồ Đối tượng
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Phân bố địa lý · Chấm đỏ càng to = Càng đông đối tượng · Kéo để di chuyển, cuộn để zoom
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-lg">
            <RefreshCw size={14} className="animate-spin" />
            Đang định vị {geocoded}/{locations.length}...
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng đối tượng", value: totalCount, icon: <Users size={20} />, cls: "text-red-500 bg-red-500/10" },
          { label: "Đã định vị", value: geoResults.length, icon: <MapPin size={20} />, cls: "text-green-500 bg-green-500/10" },
          { label: "Chưa có địa chỉ", value: noAddressCount, icon: <AlertTriangle size={20} />, cls: "text-yellow-500 bg-yellow-500/10" },
        ].map((s, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.cls}`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div
          ref={containerRef}
          className="relative select-none"
          style={{ width: "100%", height: H, cursor: isDragging ? "grabbing" : "grab" }}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
        >
          {/* Tile layer */}
          <TileLayer cLat={cLat} cLon={cLon} zoom={zoom} W={W} H={H} />

          {/* SVG dot overlay — uses SAME Mercator projection as tiles */}
          <svg className="absolute inset-0" style={{ width: W, height: H, zIndex: 10, pointerEvents: "none" }}>
            <defs>
              <filter id="redglow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {geoResults.map((loc, i) => {
              const { x, y } = geo2px(loc.lat, loc.lon, cLat, cLon, zoom, W, H)
              if (x < -60 || x > W + 60 || y < -60 || y > H + 60) return null
              const ratio = loc.count / maxCount
              const r = 8 + ratio * 28
              return (
                <g key={i} style={{ pointerEvents: "all", cursor: "pointer" }}
                  onClick={() => setSelected(loc)}>
                  {/* Pulse ring */}
                  <circle cx={x} cy={y} r={r} fill="none" stroke="#ef4444" strokeWidth="2" opacity="0">
                    <animate attributeName="r" values={`${r};${r + 16};${r}`} dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  {/* Main dot */}
                  <circle cx={x} cy={y} r={r}
                    fill="#ef4444" fillOpacity={0.65 + ratio * 0.35}
                    stroke="rgba(255,255,255,0.85)" strokeWidth="1.5"
                    filter="url(#redglow)" />
                  {/* Count */}
                  {loc.count > 1 && (
                    <text x={x} y={y + r * 0.38}
                      textAnchor="middle"
                      fontSize={Math.max(10, r * 0.72)}
                      fontWeight="900" fill="white" fontFamily="Arial,sans-serif"
                      style={{ pointerEvents: "none" }}>
                      {loc.count}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-1 z-20" style={{ pointerEvents: "all" }}>
            <button onClick={() => setZoom(z => Math.min(18, z + 1))}
              className="w-9 h-9 bg-zinc-900/95 border border-zinc-700 rounded-lg flex items-center justify-center hover:bg-zinc-700 text-white shadow-lg transition-colors">
              <ZoomIn size={17} />
            </button>
            <button onClick={() => setZoom(z => Math.max(6, z - 1))}
              className="w-9 h-9 bg-zinc-900/95 border border-zinc-700 rounded-lg flex items-center justify-center hover:bg-zinc-700 text-white shadow-lg transition-colors">
              <ZoomOut size={17} />
            </button>
            <button onClick={() => { setCLat(12.25); setCLon(109.18); setZoom(10) }}
              className="w-9 h-9 bg-zinc-900/95 border border-zinc-700 rounded-lg flex items-center justify-center hover:bg-zinc-700 text-zinc-400 shadow-lg transition-colors text-sm font-bold"
              title="Reset về Khánh Hòa">⌂</button>
          </div>

          {/* Zoom level badge */}
          <div className="absolute bottom-4 right-4 z-20 bg-zinc-900/90 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-400">
            Zoom {zoom}
          </div>

          {/* Legend */}
          <div className="absolute top-3 right-3 bg-zinc-950/90 border border-zinc-700 rounded-xl p-3 z-20 text-xs text-zinc-300">
            <p className="font-bold text-white mb-2">Chú giải</p>
            {[
              { size: 16, label: "1 đối tượng" },
              { size: 22, label: "2–5 đối tượng" },
              { size: 30, label: "Điểm nóng" },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <div className="rounded-full bg-red-500 opacity-85 border border-white/40 flex-shrink-0"
                  style={{ width: l.size, height: l.size }} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Loading overlay */}
          {loading && geoResults.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-zinc-950/75">
              <div className="text-center">
                <RefreshCw size={36} className="animate-spin text-red-500 mx-auto mb-3" />
                <p className="text-white font-semibold text-lg">Đang định vị địa chỉ...</p>
                <p className="text-zinc-400 text-sm mt-1">{geocoded} / {locations.length}</p>
              </div>
            </div>
          )}

          {/* Attribution */}
          <div className="absolute bottom-1 right-16 z-20 text-[10px] text-zinc-600">
            © OpenStreetMap contributors
          </div>
        </div>
      </div>

      {/* Selected popup */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelected(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-red-500 flex-shrink-0" />
                  <h3 className="font-bold text-white truncate">{selected.address}</h3>
                </div>
                <p className="text-red-500 text-sm font-semibold pl-6">{selected.count} đối tượng</p>
              </div>
              <button onClick={() => setSelected(null)}
                className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 ml-2 flex-shrink-0">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {selected.suspects.map(s => (
                <Link href={`/suspects/detail?id=${s.id}`} key={s.id} onClick={() => setSelected(null)}
                  className="flex items-center justify-between p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition-colors group">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors truncate">{s.fullName}</p>
                    {s.aliases && <p className="text-xs text-zinc-500 truncate">Bí danh: {s.aliases}</p>}
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg border ml-2 flex-shrink-0 ${STATUS_CLS[s.status] || "text-zinc-400 bg-zinc-800 border-zinc-700"}`}>
                    {STATUS_LABEL[s.status] || s.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hotspot list */}
      {geoResults.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-red-500" />
            Điểm nóng ({geoResults.length} vị trí)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...geoResults].sort((a, b) => b.count - a.count).map((loc, i) => {
              const ratio = loc.count / maxCount
              const sz = Math.round(24 + ratio * 20)
              return (
                <button key={i} onClick={() => { setSelected(loc); setCLat(loc.lat); setCLon(loc.lon); setZoom(14) }}
                  className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition-colors text-left w-full">
                  <div className="flex-shrink-0 rounded-full bg-red-500 text-white font-bold text-sm flex items-center justify-center"
                    style={{ width: sz, height: sz, opacity: 0.65 + ratio * 0.35 }}>
                    {loc.count}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate font-medium">{loc.address}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{loc.count} đối tượng</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {!loading && locations.length === 0 && (
        <div className="text-center py-20 bg-zinc-900 rounded-2xl border border-zinc-800">
          <MapPin size={52} className="mx-auto mb-4 opacity-20 text-red-500" />
          <p className="text-lg font-semibold text-zinc-300">Chưa có đối tượng nào có địa chỉ</p>
          <p className="text-zinc-500 text-sm mt-2">Hãy cập nhật địa chỉ cho đối tượng để hiển thị trên bản đồ.</p>
        </div>
      )}
    </div>
  )
}
