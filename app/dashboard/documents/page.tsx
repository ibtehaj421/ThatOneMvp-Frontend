"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "../../_components/providers/LocaleProvider";
import { Button } from "../../_components/ui/Button";
import { apiListDocuments, apiUploadDocument } from "../../_lib/api";

type FileCategory = "all" | "reports" | "prescriptions" | "imaging" | "other";

interface Doc {
  id: string;
  name: string;
  category: Exclude<FileCategory, "all">;
  date: string;
  size: string;
  type: string;
}


function fileIcon(type: string, category: string) {
  if (category === "imaging")
    return (
      <svg className="w-5 h-5 text-accent-cool" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  if (category === "prescriptions")
    return (
      <svg className="w-5 h-5 text-accent-warm" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    );
  return (
    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

const iconBg: Record<string, string> = {
  reports: "bg-orange-50",
  imaging: "bg-cyan-50",
  prescriptions: "bg-amber-50",
  other: "bg-bg2",
};

export default function DocumentsPage() {
  const { t } = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<FileCategory>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Doc | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  // Load documents from backend on mount.
  useEffect(() => {
    apiListDocuments().then((result) => {
      if (result.ok && result.files) {
        const backendDocs: Doc[] = result.files.map((filename, i) => ({
          id: `backend-${i}`,
          name: filename,
          category: "other" as const,
          date: "",
          size: "",
          type: filename.toLowerCase().endsWith(".pdf") ? "PDF" : "Image",
        }));
        setDocs(backendDocs);
      }
      setLoadingDocs(false);
    });
  }, []);

  const categories: { key: FileCategory; label: string }[] = [
    { key: "all", label: t.documents.all },
    { key: "reports", label: t.documents.reports },
    { key: "prescriptions", label: t.documents.prescriptions },
    { key: "imaging", label: t.documents.imaging },
    { key: "other", label: t.documents.other },
  ];

  const filtered = docs.filter((d) => {
    const matchCat = category === "all" || d.category === category;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      await apiUploadDocument(file);
      const newDoc: Doc = {
        id: `d${Date.now()}-${Math.random()}`,
        name: file.name,
        category: "other",
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.type.includes("image") ? "Image" : "PDF",
      };
      setDocs((prev) => [newDoc, ...prev]);
    }
  };

  const handleDelete = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="flex h-full">
      {/* ── Left panel: file list ── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#e7e5e4]">
        {/* Toolbar */}
        <div className="p-3 border-b border-[#e7e5e4] bg-white flex items-center gap-2">
          <div className="flex-1 relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder={t.documents.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#e7e5e4] bg-bg2 text-sm text-ink placeholder:text-ink3 outline-none focus:border-accent transition-colors"
            />
          </div>
          <Button
            size="sm"
            onClick={() => fileRef.current?.click()}
            className="shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {t.documents.upload}
          </Button>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-3 py-2 border-b border-[#e7e5e4] bg-white overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                category === c.key
                  ? "bg-accent text-white"
                  : "text-ink3 hover:bg-bg2 hover:text-ink2",
              ].join(" ")}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Drop zone */}
        <div
          className={[
            "flex-1 overflow-y-auto",
            dragOver ? "bg-orange-50" : "",
          ].join(" ")}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        >
          {loadingDocs ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-ink3">Loading documents…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 p-8">
              <svg className="w-12 h-12 text-ink3/30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-ink3">{t.documents.drop_hint}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f5f5f4]">
              {filtered.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelected(doc)}
                  className={[
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                    selected?.id === doc.id ? "bg-orange-50" : "hover:bg-bg2",
                  ].join(" ")}
                >
                  <div className={`w-9 h-9 rounded-xl ${iconBg[doc.category]} flex items-center justify-center shrink-0`}>
                    {fileIcon(doc.type, doc.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{doc.name}</p>
                    <p className="text-xs text-ink3">{doc.date} · {doc.size}</p>
                  </div>
                  {selected?.id === doc.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel: preview ── */}
      <div className="hidden md:flex w-72 flex-col bg-white shrink-0">
        {selected ? (
          <>
            {/* Preview area */}
            <div className="flex-1 flex flex-col items-center justify-center bg-bg2 border-b border-[#e7e5e4] p-6">
              <div className={`w-20 h-20 rounded-2xl ${iconBg[selected.category]} flex items-center justify-center mb-4`}>
                {fileIcon(selected.type, selected.category)}
              </div>
              <p className="text-sm font-medium text-ink text-center break-all">{selected.name}</p>
              <p className="text-xs text-ink3 mt-1">{selected.type} Document</p>
            </div>

            {/* File info */}
            <div className="p-4 space-y-3">
              <p className="text-xs font-semibold text-ink2 uppercase tracking-wider">{t.documents.file_info}</p>
              {[
                { label: t.documents.uploaded, value: selected.date },
                { label: t.documents.size, value: selected.size },
                { label: t.documents.type, value: selected.type },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-xs text-ink3">{row.label}</span>
                  <span className="text-xs font-medium text-ink">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
              <Button variant="secondary" size="sm" fullWidth>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t.documents.download}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(selected.id)}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
            <svg className="w-10 h-10 text-ink3/30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
            </svg>
            <p className="text-sm text-ink3 text-center">{t.documents.no_preview}</p>
          </div>
        )}
      </div>
    </div>
  );
}
