// Layout registry. Each layout lives in its own file under js/layouts/.
// defaultLayoutId controls which layout is selected on first load.
Object.assign(window.InvoiceConfig, {
  defaultLayoutId: "modern-plus",
  docOrder: ["brand", "title", "meta", "items", "total", "terbilang", "transfer", "signature"],
  layouts: [
    window.InvoiceLayouts["modern-plus"],
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
