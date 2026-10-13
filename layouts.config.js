// Layout registry. Adding a layout = one entry here + one [data-layout] block in style.css.
//   skin      : table skin (classic | band | boxed | minimal | editorial)
//   docOrder  : optional .doc zone order (falls back to the global docOrder)
//   sections  : optional per-layout visibility override, e.g. { transfer: false }
//               precedence: global sections < layout sections < runtime toggles
Object.assign(window.InvoiceConfig, {
  defaultLayoutId: "standard",
  docOrder: ["brand", "title", "meta", "items", "total", "terbilang", "transfer", "signature"],
  layouts: [
    { id: "standard", name: "Standard Classic", skin: "classic" },
    { id: "fit-two-bar", name: "Fit Two Bar", skin: "band" },
    {
      id: "modern-corporate",
      name: "Modern Corporate",
      skin: "minimal",
      docOrder: ["title", "brand", "meta", "items", "total", "terbilang", "signature", "transfer"],
    },
    { id: "bold-border", name: "Bold Border", skin: "boxed" },
    { id: "compact-clean", name: "Compact Clean", skin: "classic" },
    { id: "elegant-serif", name: "Elegant Serif", skin: "editorial" },
  ],
});
