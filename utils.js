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
    money: (n) => `${cfg.currency} ${n.toLocaleString(cfg.locale)}`,
    state: { layout: null, sections: {} }, // runtime state; a future toggle panel edits `sections`
  };
})();
