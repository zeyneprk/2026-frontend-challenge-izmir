import L from 'leaflet'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { useDetective } from '../../hooks/useDetective.js'
import { useManualLeads } from '../../hooks/useManualLeads.js'
import {
  filterEvidencesByPersonKey,
  getEvidenceLatLng,
  PODO_PERSON_KEY,
  toTimeNumber,
} from '../../utils/detectiveLogic.js'

const IZMIR_CENTER = [38.42, 27.14]
const DEFAULT_ZOOM = 12

const CARTO_DARK = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  subdomains: 'abcd',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
}

const CHECKIN = { fill: '#22c55e', border: '#14532d' }
const SIGHTING = { fill: '#a855f7', border: '#581c87' }
const TIP = { fill: '#eab308', border: '#a16207' }
const MANUAL = { fill: '#f97316', border: '#9a3412' }
const PING = { fill: '#22d3ee', border: '#0e7490' }

/**
 * @param { { target: { lat: number, lng: number } | null, onClear: () => void } } props
 */
function MapFlyToPing({ target, onClear }) {
  const map = useMap()
  useEffect(() => {
    if (!target) return
    map.flyTo([target.lat, target.lng], 16, { duration: 0.55 })
    const t = setTimeout(() => onClear(), 3000)
    return () => clearTimeout(t)
  }, [map, target, onClear])
  return null
}

/**
 * Re-fit tiles when the map container is resized (e.g. drag handle).
 * @param { { dep: number } } props
 */
function InvalidateSizeOnResize({ dep }) {
  const map = useMap()
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      map.invalidateSize()
    })
    return () => cancelAnimationFrame(id)
  }, [map, dep])
  return null
}

/**
 * @param { { onAdd: (lat: number, lng: number) => void, enabled: boolean } } props
 */
function MapClickToLead({ onAdd, enabled }) {
  useMapEvents({
    click(e) {
      if (enabled) onAdd(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

/**
 * Bounds use check-ins + sightings (plus manual leads) so the frame matches “spatial evidence”.
 * `mapAutoFitKey` changes on suspect, search, filter, or when marker coordinates change; `mapPanelHeightPx` re-runs the same fit after resize.
 * Empty set: Podo’s latest check-in/sight coords if any, else central Izmir.
 * @param { { mapAutoFitKey: string, checkinSightingLatLng: L.LatLngExpression[], manualLatLng: L.LatLngExpression[], defaultCenter: L.LatLngExpression } } props
 */
function AutoFitMapBounds({
  mapAutoFitKey,
  checkinSightingLatLng,
  manualLatLng,
  defaultCenter,
}) {
  const map = useMap()

  useEffect(() => {
    const all = [
      ...checkinSightingLatLng,
      ...manualLatLng,
    ]
    if (all.length === 0) {
      const c = L.latLng(defaultCenter)
      map.flyTo(c, DEFAULT_ZOOM, { duration: 0.5 })
      return
    }
    if (all.length === 1) {
      const c = L.latLng(/** @type {L.LatLngExpression} */ (all[0]))
      map.flyTo(c, 14, { duration: 0.5 })
      return
    }
    const b = L.latLngBounds(all)
    map.flyToBounds(b, {
      padding: [50, 50],
      maxZoom: 16,
      duration: 0.6,
    })
  }, [map, mapAutoFitKey, checkinSightingLatLng, manualLatLng, defaultCenter])

  return null
}

/**
 * @param { { type: string } } ev
 * @returns {'sighting' | 'tip' | 'checkin'}
 */
function typePaletteKey(ev) {
  if (ev.type === 'sighting') return 'sighting'
  if (ev.type === 'tip') return 'tip'
  return 'checkin'
}

/**
 * Leaflet map: path + markers for a suspect, or all matching geo results for a global search; manual pins in localStorage.
 * @param { { compact?: boolean, fillHeight?: boolean } } [props]
 */
export function MapPanel({ compact = false, fillHeight = false } = {}) {
  const {
    searchFilteredEvidences,
    viewEvidences,
    evidenceTypeFilter,
    selectedPerson,
    searchQuery,
    mapPing,
    setMapPing,
    highlightedGeoEvidenceId,
    setHighlightedGeoEvidenceId,
    mapPanelHeightPx,
  } = useDetective()
  const { leads, addLead, updateNote, removeLead } = useManualLeads()
  const pendingOpenIdRef = useRef(/** @type {string | null} */ (null))

  const personKey = selectedPerson.trim().toLowerCase()
  const hasSearch = searchQuery.trim().length > 0
  const isPersonView = personKey.length > 0

  const personEvidences = useMemo(
    () => filterEvidencesByPersonKey(searchFilteredEvidences, personKey),
    [searchFilteredEvidences, personKey],
  )

  const personFiltered = useMemo(() => {
    const pk = selectedPerson.trim().toLowerCase()
    if (pk.length === 0) return searchFilteredEvidences
    return filterEvidencesByPersonKey(searchFilteredEvidences, pk)
  }, [searchFilteredEvidences, selectedPerson])

  const mapSourceEvidences = useMemo(() => {
    if (evidenceTypeFilter === 'all') {
      return personFiltered.filter(
        (e) =>
          getEvidenceLatLng(e) &&
          (e.type === 'checkin' || e.type === 'sighting' || e.type === 'tip'),
      )
    }
    if (evidenceTypeFilter === 'checkin' || evidenceTypeFilter === 'sighting') {
      return viewEvidences
    }
    if (isPersonView) return personEvidences
    if (hasSearch) return searchFilteredEvidences
    return []
  }, [
    evidenceTypeFilter,
    personFiltered,
    viewEvidences,
    isPersonView,
    hasSearch,
    personEvidences,
    searchFilteredEvidences,
  ])

  const geoEvidences = useMemo(() => {
    const out = []
    for (const ev of mapSourceEvidences) {
      const pos = getEvidenceLatLng(ev)
      if (pos) out.push({ ev, pos })
    }
    return out
  }, [mapSourceEvidences])

  const pathPositions = useMemo(() => {
    if (!isPersonView) return /** @type {L.LatLngExpression[]} */ ([])
    const ordered = [...geoEvidences]
      .filter(
        ({ ev }) =>
          ev.type === 'checkin' ||
          ev.type === 'sighting' ||
          ev.type === 'tip',
      )
      .sort(
        (a, b) => toTimeNumber(a.ev.timestamp) - toTimeNumber(b.ev.timestamp),
      )
    return ordered.map((x) => [x.pos.lat, x.pos.lng])
  }, [geoEvidences, isPersonView])

  /** Check-in + sighting pins only (bounds + fly; tips stay on map but use padding, not extent). */
  const checkinSightingLatLng = useMemo(
    () =>
      geoEvidences
        .filter(
          ({ ev }) => ev.type === 'checkin' || ev.type === 'sighting',
        )
        .map(({ pos }) =>
          /** @type {L.LatLngExpression} */ ([pos.lat, pos.lng]),
        ),
    [geoEvidences],
  )

  const manualLatLng = useMemo(
    () =>
      leads.map((l) =>
        /** @type {L.LatLngExpression} */ ([l.lat, l.lng]),
      ),
    [leads],
  )

  const podoLastKnownCenter = useMemo(() => {
    const forPodo = filterEvidencesByPersonKey(
      searchFilteredEvidences,
      PODO_PERSON_KEY,
    )
    const spatial = forPodo.filter(
      (e) =>
        (e.type === 'checkin' || e.type === 'sighting') &&
        getEvidenceLatLng(e),
    )
    const sorted = [...spatial].sort(
      (a, b) => toTimeNumber(b.timestamp) - toTimeNumber(a.timestamp),
    )
    const latest = sorted[0]
    if (!latest) return null
    return getEvidenceLatLng(latest)
  }, [searchFilteredEvidences])

  const mapDefaultCenter = useMemo(() => {
    if (podoLastKnownCenter) {
      return /** @type {L.LatLngExpression} */ ([
        podoLastKnownCenter.lat,
        podoLastKnownCenter.lng,
      ])
    }
    return /** @type {L.LatLngExpression} */ ([...IZMIR_CENTER])
  }, [podoLastKnownCenter])

  const mapAutoFitKey = useMemo(
    () =>
      [
        personKey,
        searchQuery.trim(),
        evidenceTypeFilter,
        checkinSightingLatLng.map((p) => `${p[0]},${p[1]}`).join(';'),
        manualLatLng.map((p) => `${p[0]},${p[1]}`).join(';'),
        mapDefaultCenter.map((n) => String(n)).join(','),
      ].join('|'),
    [
      personKey,
      searchQuery,
      evidenceTypeFilter,
      checkinSightingLatLng,
      manualLatLng,
      mapDefaultCenter,
    ],
  )

  const handleMapClick = useCallback(
    (lat, lng) => {
      const id = addLead(lat, lng)
      pendingOpenIdRef.current = id
    },
    [addLead],
  )

  const canInteract =
    isPersonView ||
    hasSearch ||
    evidenceTypeFilter === 'checkin' ||
    evidenceTypeFilter === 'sighting' ||
    evidenceTypeFilter === 'all'

  const clearPing = useCallback(() => setMapPing(null), [setMapPing])

  const onMarkerSelect = useCallback(
    (ev, pos) => {
      setHighlightedGeoEvidenceId(String(ev.id))
      setMapPing({ lat: pos.lat, lng: pos.lng, evidenceId: String(ev.id) })
    },
    [setHighlightedGeoEvidenceId, setMapPing],
  )

  return (
    <div
      className={[
        'relative w-full min-w-0 overflow-hidden rounded border border-zinc-800/90 bg-zinc-900/50',
        fillHeight
          ? 'h-full min-h-0'
          : compact
            ? 'h-36 min-h-36'
            : 'h-48 min-h-[12rem] sm:h-56',
      ].join(' ')}
    >
      <MapContainer
        center={IZMIR_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full [&_.leaflet-tile-pane]:opacity-90"
        scrollWheelZoom
      >
        <InvalidateSizeOnResize dep={mapPanelHeightPx} />
        <TileLayer
          attribution={CARTO_DARK.attribution}
          url={CARTO_DARK.url}
          subdomains={CARTO_DARK.subdomains}
        />
        {mapPing && (
          <MapFlyToPing target={mapPing} onClear={clearPing} />
        )}
        <AutoFitMapBounds
          mapAutoFitKey={mapAutoFitKey}
          checkinSightingLatLng={checkinSightingLatLng}
          manualLatLng={manualLatLng}
          defaultCenter={mapDefaultCenter}
        />
        {canInteract && (
          <MapClickToLead onAdd={handleMapClick} enabled={canInteract} />
        )}

        {mapPing && (
          <CircleMarker
            key={`ping-${mapPing.lat}-${mapPing.lng}`}
            center={[mapPing.lat, mapPing.lng]}
            radius={14}
            pathOptions={{
              color: PING.border,
              fillColor: PING.fill,
              fillOpacity: 0.35,
              weight: 3,
            }}
          />
        )}

        {isPersonView && pathPositions.length > 1 && (
          <Polyline
            positions={pathPositions}
            pathOptions={{
              color: '#f59e0b',
              weight: 3,
              opacity: 0.75,
            }}
          />
        )}

        {geoEvidences.map(({ ev, pos }) => {
          const k = typePaletteKey(ev)
          const pal = k === 'sighting' ? SIGHTING : k === 'tip' ? TIP : CHECKIN
          const isHi = String(ev.id) === highlightedGeoEvidenceId
          return (
            <CircleMarker
              key={ev.id}
              center={[pos.lat, pos.lng]}
              radius={isHi ? 12 : 8}
              pathOptions={{
                color: isHi ? '#fbbf24' : pal.border,
                fillColor: pal.fill,
                fillOpacity: isHi ? 1 : 0.9,
                weight: isHi ? 4 : 2,
              }}
              eventHandlers={{
                click: (e) => {
                  e?.originalEvent?.stopPropagation?.()
                  onMarkerSelect(ev, pos)
                },
              }}
            >
              <Popup>
                <div className="min-w-40 text-xs text-zinc-800">
                  <p className="font-semibold capitalize">{ev.type}</p>
                  {ev.location && <p className="mt-0.5">{ev.location}</p>}
                  {ev.content && (
                    <p className="mt-1 line-clamp-4 text-zinc-700">
                      {ev.content}
                    </p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          )
        })}

        {leads.map((lead) => (
          <CircleMarker
            key={lead.id}
            center={[lead.lat, lead.lng]}
            radius={7}
            pathOptions={{
              color: MANUAL.border,
              fillColor: MANUAL.fill,
              fillOpacity: 0.95,
              weight: 2,
            }}
            eventHandlers={{
              add: (e) => {
                if (pendingOpenIdRef.current === lead.id) {
                  /** @type {L.CircleMarker} */ (e.target).openPopup()
                  pendingOpenIdRef.current = null
                }
              },
            }}
          >
            <Popup>
              <div className="min-w-44 text-xs text-zinc-800">
                <p className="mb-1 font-semibold">Manual lead</p>
                <label className="mb-0.5 block text-[10px] uppercase text-zinc-500">
                  Note
                </label>
                <textarea
                  className="mb-1 w-full rounded border border-zinc-300 bg-white p-1 text-zinc-900"
                  rows={3}
                  value={lead.note}
                  onChange={(e) => updateNote(lead.id, e.target.value)}
                  placeholder="Detective’s intuition…"
                />
                <button
                  type="button"
                  className="mt-0.5 text-[10px] text-rose-600 underline"
                  onClick={() => removeLead(lead.id)}
                >
                  Remove pin
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {canInteract && (
        <p className="pointer-events-none absolute bottom-1 left-1.5 z-[1000] rounded bg-zinc-950/80 px-1.5 py-0.5 text-[9px] text-zinc-500">
          Click map to drop a manual lead
        </p>
      )}
    </div>
  )
}
