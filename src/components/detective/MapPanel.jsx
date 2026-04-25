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
 * @param { { positions: L.LatLngExpression[] } } props
 */
function FitMapBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 0) return
    if (positions.length === 1) {
      const p = positions[0]
      const [lat, lng] = Array.isArray(p) ? p : [p.lat, p.lng]
      map.setView([lat, lng], 14)
      return
    }
    const b = L.latLngBounds(positions)
    map.fitBounds(b, { padding: [32, 32], maxZoom: 15 })
  }, [map, positions])
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
 */
export function MapPanel() {
  const { searchFilteredEvidences, selectedPerson, searchQuery } = useDetective()
  const { leads, addLead, updateNote, removeLead } = useManualLeads()
  const pendingOpenIdRef = useRef(/** @type {string | null} */ (null))

  const personKey = selectedPerson.trim().toLowerCase()
  const hasSearch = searchQuery.trim().length > 0
  const isPersonView = personKey.length > 0

  const personEvidences = useMemo(
    () => filterEvidencesByPersonKey(searchFilteredEvidences, personKey),
    [searchFilteredEvidences, personKey],
  )

  const mapSourceEvidences = useMemo(() => {
    if (isPersonView) return personEvidences
    if (hasSearch) return searchFilteredEvidences
    return []
  }, [isPersonView, hasSearch, personEvidences, searchFilteredEvidences])

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

  const evFitPositions = useMemo(
    () => geoEvidences.map((x) => [x.pos.lat, x.pos.lng]),
    [geoEvidences],
  )

  const allFitPoints = useMemo(() => {
    const manual = leads.map((l) => [l.lat, l.lng])
    if (evFitPositions.length === 0 && manual.length === 0) {
      return /** @type {L.LatLngExpression[]} */ ([[...IZMIR_CENTER]])
    }
    if (evFitPositions.length === 0) {
      return /** @type {L.LatLngExpression[]} */ (manual)
    }
    if (manual.length === 0) {
      return /** @type {L.LatLngExpression[]} */ (evFitPositions)
    }
    return /** @type {L.LatLngExpression[]} */ ([...evFitPositions, ...manual])
  }, [evFitPositions, leads])

  const handleMapClick = useCallback(
    (lat, lng) => {
      const id = addLead(lat, lng)
      pendingOpenIdRef.current = id
    },
    [addLead],
  )

  const canInteract = isPersonView || hasSearch

  return (
    <div className="relative h-48 min-h-[12rem] w-full min-w-0 overflow-hidden rounded border border-zinc-800/90 bg-zinc-900/50 sm:h-56">
      <MapContainer
        center={IZMIR_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full [&_.leaflet-tile-pane]:opacity-90"
        scrollWheelZoom
      >
        <TileLayer
          attribution={CARTO_DARK.attribution}
          url={CARTO_DARK.url}
          subdomains={CARTO_DARK.subdomains}
        />
        <FitMapBounds positions={allFitPoints} />
        {canInteract && (
          <MapClickToLead onAdd={handleMapClick} enabled={canInteract} />
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
          return (
            <CircleMarker
              key={ev.id}
              center={[pos.lat, pos.lng]}
              radius={8}
              pathOptions={{
                color: pal.border,
                fillColor: pal.fill,
                fillOpacity: 0.9,
                weight: 2,
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
