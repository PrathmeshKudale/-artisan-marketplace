"use client";

import React, { useState } from "react";

const LANGS = [
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "bn", label: "Bengali" },
  { code: "mr", label: "Marathi" },
  { code: "en", label: "English" },
];

export default function PageTranslator() {
  const [target, setTarget] = useState("hi");
  const [loading, setLoading] = useState(false);
  const [lastCount, setLastCount] = useState<number | null>(null);

  async function handleTranslate() {
    try {
      setLoading(true);
      // Find all elements that opted into translation via data-translate
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-translate]"));
      if (!els.length) {
        alert("No elements found with [data-translate] attribute. Add data-translate to elements you want translated.");
        setLoading(false);
        return;
      }

      const texts = els.map((el) => (el.innerText || el.textContent || "").trim());
      setLastCount(texts.length);

      // send to backend translate endpoint
      const res = await fetch("/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: texts, target }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Translation failed");
      }

      const translations: string[] = json.translations || [];
      // Apply translations back to elements
      for (let i = 0; i < els.length; i++) {
        const t = translations[i] ?? "";
        els[i].innerText = t;
      }
    } catch (err: any) {
      console.error(err);
      alert("Translation error: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="translate-ui" style={{ margin: "1rem 0", padding: "0.5rem", border: "1px dashed #ccc", borderRadius: 6 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label htmlFor="lang-select" style={{ fontSize: 14, fontWeight: 500 }}>Translate page to</label>
        <select id="lang-select" value={target} onChange={(e) => setTarget(e.target.value)}>
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <button onClick={handleTranslate} disabled={loading} style={{ padding: "6px 10px" }}>
          {loading ? "Translating..." : "Translate visible strings"}
        </button>
        {lastCount !== null && <span style={{ marginLeft: 8, color: "#666" }}>{lastCount} items</span>}
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>Tip: add <code>data-translate</code> to elements you want translated (e.g. headings, paragraphs).</div>
    </div>
  );
}
