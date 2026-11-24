// Entry point: build, first render, event wiring. Logic lives in the modules it calls.
(() => {
  const { $$, exporters, view, table, logo } = Invoice;

  view.build();
  table.addRow();
  logo.apply();
  view.applyLayout();
  view.applyMode();

  table.bind();
  view.bind(); // also binds the fields panel, logo picker and signature blocks

  // Export buttons — attach only if the exporter exists, otherwise log clearly.
  $$("[data-export]").forEach((btn) => {
    const fn = exporters[btn.dataset.export];
    if (typeof fn === "function") {
      btn.addEventListener("click", fn);
    } else {
      console.warn(`Invoice: no exporter for "${btn.dataset.export}"`);
    }
  });
})();
