// Pure helpers + terbilang + totals
window.Invoice = (() => {
  const cfg = window.InvoiceConfig;
  const state = {
    layout: null,
    sections: {},
    documentType: cfg.defaultDocumentType,
  };
  const pad = (n) => String(n).padStart(2, "0");
  const byId = (id) => document.getElementById(id);
  const opt = (key) => state.layout?.[key] ?? cfg[key];
  const activeMode = () => cfg.modes[state.documentType] || cfg.modes.invoice;
  const layers = () =>
    [
      state.layout,
      activeMode(),
      state.layout?.modes?.[state.documentType],
    ].filter(Boolean);
  const merged = (key, base = {}) =>
    Object.assign({}, base, ...layers().map((l) => l[key]));
  const layered = (key, fallback) =>
    layers()
      .map((l) => l[key])
      .filter((v) => v !== undefined)
      .pop() ?? fallback;
  const tpl = (text, vars) =>
    String(text ?? "").replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
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

  const UNITS = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];
  const SCALES = [
    [1e9, "Milyar"],
    [1e6, "Juta"],
    [1e3, "Ribu"],
    [100, "Ratus"],
  ];
  const ONE = { 1e3: "Seribu", 100: "Seratus" };
  const spell = (n) => {
    if (n < 12) return UNITS[n];
    if (n < 20) return `${UNITS[n - 10]} Belas`;
    if (n < 100)
      return `${UNITS[Math.floor(n / 10)]} Puluh ${spell(n % 10)}`.trim();
    const [unit, name] = SCALES.find(([v]) => n >= v);
    const q = Math.floor(n / unit);
    const head = q === 1 && ONE[unit] ? ONE[unit] : `${spell(q)} ${name}`;
    return `${head} ${spell(n % unit)}`.trim();
  };
  const terbilang = (n) => {
    const v = Math.floor(Math.abs(n));
    return v ? (n < 0 ? "Minus " : "") + spell(v) : "Nol";
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  // Decimal separator of the locale ("," for id-ID): "Rp 1.500.000,50" -> 1500000.5 ("." is the group separator).
  const DEC = new Intl.NumberFormat(cfg.locale)
    .formatToParts(1.1)
    .find((p) => p.type === "decimal").value;
  const NOT_NUM = new RegExp(`[^\\d${DEC}]`, "g");
  const num = (s) =>
    Number(String(s).replace(NOT_NUM, "").replace(DEC, ".")) || 0;
  const curCode = () => activeMode().currency || cfg.currency;
  const currencySymbol = () => cfg.currencies?.[curCode()] || curCode();
  const currencyWord = () => cfg.currencyWords?.[curCode()] || cfg.currencyWord;
  const decimals = () => cfg.currencyDecimals?.[curCode()] ?? 2;
  const round = (n) => {
    const f = 10 ** decimals();
    return Math.round(n * f) / f;
  };
  const pct = (s) => parseFloat(String(s).replace(",", ".")) || 0;
  const fmt = (n) =>
    n ? n.toLocaleString(cfg.locale, { maximumFractionDigits: 2 }) : "";
  const fmtPct = (n) =>
    n.toLocaleString(cfg.locale, { maximumFractionDigits: 2 });
  const money = (n) =>
    `${currencySymbol()} ${n.toLocaleString(cfg.locale, { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

  const exclusive = () => opt("taxMode") === "exclusive";
  const rowFigures = (tr) => {
    const rate = num($(".rate-input", tr).value);
    const rowPct = pct($(".tax-input", tr).value);
    const base = (num($(".qty-input", tr).value) || 1) * rate;
    return { rate, pct: rowPct, base, tax: (base * rowPct) / 100 };
  };
  const rowAmount = (f) => round(exclusive() ? f.base : f.base + f.tax);
  const totals = () => {
    const rows = $$("#tableBody tr:not(.category-row)");
    const subtotal = round(
      rows.reduce((sum, tr) => sum + num($(".amount-input", tr).value), 0),
    );
    const byRate = new Map();
    if (exclusive() && byId("rateTaxToggle").checked) {
      rows.forEach((tr) => {
        const f = rowFigures(tr);
        if (f.rate && f.pct > 0)
          byRate.set(f.pct, (byRate.get(f.pct) || 0) + f.tax);
      });
    }
    const taxes = [...byRate]
      .sort((a, b) => a[0] - b[0])
      .map(([rate, amount]) => ({ pct: rate, amount: round(amount) }));
    return {
      subtotal,
      taxes,
      grand: round(taxes.reduce((sum, t) => sum + t.amount, subtotal)),
    };
  };
  const totalLines = (t) => {
    const L = merged("labels", cfg.labels);
    return [
      ...(t.taxes.length
        ? [{ kind: "sub", label: L.subtotal, value: t.subtotal }]
        : []),
      ...t.taxes.map((x) => ({
        kind: "tax",
        label: tpl(L.taxLine, { pct: fmtPct(x.pct) }),
        value: x.amount,
      })),
      { kind: "grand", label: L.total, value: t.grand },
    ];
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
      el.innerHTML = items
        .map(
          (i) =>
            `<option value="${i[key]}"${i[key] === selected ? " selected" : ""}>${i.name}</option>`,
        )
        .join("");
    },
    $,
    $$,
    byId,
    num,
    pct,
    fmt,
    fmtPct,
    money,
    terbilang,
    DEC,
    currencySymbol,
    currencyWord,
    decimals,
    round,
    rowFigures,
    rowAmount,
    totals,
    totalLines,
  };
})();
