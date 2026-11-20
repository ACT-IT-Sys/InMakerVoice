// Shared helpers, exposed on the single global namespace `Invoice`.
window.Invoice = (() => {
  const cfg = window.InvoiceConfig;
  const state = { layout: null, sections: {}, documentType: cfg.defaultDocumentType }; // runtime state
  const pad = (n) => String(n).padStart(2, "0");
  const byId = (id) => document.getElementById(id);

  // Scalar option: the active layout may override any global option (taxMode, dateFormat, ...).
  const opt = (key) => state.layout?.[key] ?? cfg[key];
  const activeMode = () => cfg.modes[state.documentType] || cfg.modes.invoice;
  // Override layers, lowest to highest: layout < document mode < the layout's own entry for that mode.
  const layers = () => [state.layout, activeMode(), state.layout?.modes?.[state.documentType]].filter(Boolean);
  const merged = (key, base = {}) => Object.assign({}, base, ...layers().map((l) => l[key]));
  const layered = (key, fallback) => layers().map((l) => l[key]).filter((v) => v !== undefined).pop() ?? fallback;

  const tpl = (text, vars) => String(text ?? "").replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ""); // "{a}" -> vars.a
  const today = () => {
    const d = new Date();
    return opt("dateFormat") === "short"
      ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
      : `${d.getDate()} ${cfg.monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };
  const autosize = (el) => {
    el.style.height = "auto";
    if (el.scrollHeight) el.style.height = `${el.scrollHeight}px`;
  };

  return {
    cfg,
    state,
    opt,
    activeMode,
    layers,
    merged,
    layered,
    tpl,
    today,
    autosize,
    labels: () => merged("labels", cfg.labels),
    placeholders: () => merged("placeholders", cfg.placeholders),
    fitFields: () => cfg.autosizeFields.forEach((id) => autosize(byId(id))),
    fillSelect: (el, items, key, selected) => {
      el.innerHTML = items.map((i) => `<option value="${i[key]}"${i[key] === selected ? " selected" : ""}>${i.name}</option>`).join("");
    },
    $: (sel, root = document) => root.querySelector(sel),
    $$: (sel, root = document) => [...root.querySelectorAll(sel)],
    byId,
    num: (s) => Number(String(s).replace(/\D/g, "")) || 0, // "Rp 1.500.000" -> 1500000
    pct: (s) => parseFloat(String(s).replace(",", ".")) || 0, // "1,1%" -> 1.1
    fmt: (n) => (n ? n.toLocaleString(cfg.locale) : ""), // 1500000 -> "1.500.000"
    fmtPct: (n) => n.toLocaleString(cfg.locale, { maximumFractionDigits: 2 }), // 1.1 -> "1,1"
    money: (n) => `${cfg.currency} ${n.toLocaleString(cfg.locale)}`,
  };
})();
