// Single place that builds the layouts dropdown.
window.InvoiceConfig.layouts = [
  window.InvoiceLayouts["modern-plus"],
  window.InvoiceLayouts["new-days"],
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
];
