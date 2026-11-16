// Shared helpers, exposed on the single global namespace `Invoice`.
window.Invoice = (() => {
  const cfg = window.InvoiceConfig;
  const today = () => {
    const d = new Date();
    return `${d.getDate()} ${cfg.monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };
  return {
    cfg,
    today,
    $: (sel, root = document) => root.querySelector(sel),
    $$: (sel, root = document) => [...root.querySelectorAll(sel)],
    byId: (id) => document.getElementById(id),
    num: (s) => Number(String(s).replace(/\D/g, "")) || 0, // "1.500.000" -> 1500000
    fmt: (n) => (n ? n.toLocaleString(cfg.locale) : ""), // 1500000 -> "1.500.000"
    money: (n) => `${cfg.currency} ${n.toLocaleString(cfg.locale)}`,
    state: { layout: null, sections: {}, documentType: window.InvoiceConfig.defaultDocumentType }, // runtime state; a future toggle panel edits `sections`
  };
})();
