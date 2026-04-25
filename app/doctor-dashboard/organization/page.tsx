"use client";

import { useState, useEffect, useRef } from "react";
import {
  apiRegisterOrganization,
  apiGetMyOrganizations,
  type BackendOrganization,
} from "../../_lib/api";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

function LocationPicker({
  lat,
  lng,
  onSelect,
}: {
  lat: string;
  lng: string;
  onSelect: (lat: string, lng: string, label: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const MEDICAL_TYPES = new Set([
    "hospital", "clinic", "doctors", "dentist",
    "health_centre", "pharmacy", "nursing_home", "healthcare",
  ]);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    setResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=20&countrycodes=pk&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: NominatimResult[] = await res.json();
      const medical = data.filter((r) => MEDICAL_TYPES.has((r as unknown as Record<string, string>).type));
      if (medical.length === 0) {
        setSearchError("No hospitals or clinics found in Pakistan. Try a different name or area.");
      } else {
        setResults(medical.slice(0, 5));
      }
    } catch {
      setSearchError("Could not reach location search. Check your connection.");
    }
    setSearching(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); search(); }
  };

  const pick = (r: NominatimResult) => {
    setSelectedLabel(r.display_name);
    setQuery(r.display_name);
    setResults([]);
    onSelect(r.lat, r.lon, r.display_name);
  };

  const clear = () => {
    setQuery("");
    setSelectedLabel("");
    setResults([]);
    onSelect("", "", "");
  };

  const mapSrc = lat && lng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng) - 0.02},${parseFloat(lat) - 0.02},${parseFloat(lng) + 0.02},${parseFloat(lat) + 0.02}&layer=mapnik&marker=${lat},${lng}`
    : null;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-ink2 mb-1">Location</label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (selectedLabel) clear(); }}
            onKeyDown={handleKey}
            placeholder="Search for your clinic address…"
            className="w-full h-10 rounded-xl border border-[#e7e5e4] bg-bg2 px-3 pr-8 text-sm text-ink placeholder:text-ink3 outline-none focus:border-accent transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink3 hover:text-ink text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={search}
          disabled={searching || !query.trim()}
          className="h-10 px-4 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-40 shrink-0"
        >
          {searching ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Searching
            </span>
          ) : "Search"}
        </button>
      </div>

      {searchError && (
        <p className="text-xs text-red-600">{searchError}</p>
      )}

      {results.length > 0 && (
        <div ref={dropdownRef} className="border border-[#e7e5e4] rounded-xl overflow-hidden bg-white shadow-sm">
          {results.map((r) => (
            <button
              key={r.place_id}
              type="button"
              onClick={() => pick(r)}
              className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-bg2 transition-colors border-b border-[#e7e5e4] last:border-0 flex items-start gap-2"
            >
              <svg className="w-3.5 h-3.5 text-ink3 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="leading-snug">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {mapSrc && (
        <div className="rounded-xl overflow-hidden border border-[#e7e5e4] mt-1">
          <iframe
            src={mapSrc}
            width="100%"
            height="200"
            style={{ border: 0 }}
            loading="lazy"
            title="Selected location"
          />
          <div className="px-3 py-2 bg-bg2 flex items-center justify-between gap-2">
            <p className="text-[11px] text-ink3 truncate">{selectedLabel}</p>
            <p className="text-[11px] text-ink2 shrink-0 font-medium">
              {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrganizationPage() {
  const [myOrgs, setMyOrgs] = useState<BackendOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchMyOrgs = async () => {
    setLoading(true);
    const result = await apiGetMyOrganizations();
    if (result.ok && result.organizations) setMyOrgs(result.organizations);
    setLoading(false);
  };

  useEffect(() => {
    fetchMyOrgs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    const result = await apiRegisterOrganization({
      Name: name.trim(),
      CustomerSupportEmail: supportEmail.trim() || undefined,
      Latitude: lat ? parseFloat(lat) : undefined,
      Longitude: lng ? parseFloat(lng) : undefined,
    });

    setSubmitting(false);

    if (!result.ok) {
      setErrorMsg(result.error ?? "Failed to register clinic.");
      return;
    }

    setSuccessMsg(`"${name.trim()}" registered successfully.`);
    setName("");
    setSupportEmail("");
    setLat("");
    setLng("");
    fetchMyOrgs();
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Organization</h1>
        <p className="text-xs text-ink3 mt-0.5">Register your clinic so patients can find and book appointments with you.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
        <h2 className="text-sm font-semibold text-ink mb-4">Register a Clinic</h2>

        {successMsg && (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-100 px-4 py-2.5">
            <p className="text-sm text-green-800">{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">
              Clinic Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ANAM Health Clinic"
              required
              className="w-full h-10 rounded-xl border border-[#e7e5e4] bg-bg2 px-3 text-sm text-ink placeholder:text-ink3 outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@clinic.com"
              className="w-full h-10 rounded-xl border border-[#e7e5e4] bg-bg2 px-3 text-sm text-ink placeholder:text-ink3 outline-none focus:border-accent transition-colors"
            />
          </div>

          <LocationPicker
            lat={lat}
            lng={lng}
            onSelect={(la, lo) => { setLat(la); setLng(lo); }}
          />

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="h-10 px-6 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Registering…" : "Register Clinic"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink mb-3">My Clinics</h2>
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-ink3 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        ) : myOrgs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 text-center">
            <p className="text-sm text-ink3">No clinics registered yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myOrgs.map((org) => (
              <div key={org.ID} className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{org.Name}</p>
                  {org.CustomerSupportEmail && (
                    <p className="text-xs text-ink3 mt-0.5">{org.CustomerSupportEmail}</p>
                  )}
                  {org.Latitude !== 0 && org.Longitude !== 0 && (
                    <a
                      href={`https://maps.google.com/?q=${org.Latitude},${org.Longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {org.Latitude.toFixed(4)}, {org.Longitude.toFixed(4)}
                    </a>
                  )}
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">Active</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
