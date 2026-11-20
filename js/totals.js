// Row amounts and document totals. One source of truth for the screen, print, PDF, .doc and .xlsx.
(() => {
  const { $, $$, byId, num, pct, opt, tpl, fmtPct, labels } = Invoice;
  const exclusive = () => opt("taxMode") === "exclusive";

  // Figures of one item row from its qty / rate / tax inputs.
  Invoice.rowFigures = (tr) => {
    const rate = num($(".rate-input", tr).value);
    const rowPct = pct($(".tax-input", tr).value);
    const base = (num($(".qty-input", tr).value) || 1) * rate;
    return { rate, pct: rowPct, base, tax: (base * rowPct) / 100 };
  };
  Invoice.rowAmount = (f) => Math.round(exclusive() ? f.base : f.base + f.tax);

  // subtotal = sum of amounts; in exclusive mode the tax is grouped per rate and added on top.
  Invoice.totals = () => {
    const rows = $$("#tableBody tr:not(.category-row)");
    const subtotal = rows.reduce((sum, tr) => sum + num($(".amount-input", tr).value), 0);
    const byRate = new Map();
    if (exclusive() && byId("rateTaxToggle").checked) {
      rows.forEach((tr) => {
        const f = Invoice.rowFigures(tr);
        if (f.rate && f.pct > 0) byRate.set(f.pct, (byRate.get(f.pct) || 0) + f.tax);
      });
    }
    const taxes = [...byRate].sort((a, b) => a[0] - b[0]).map(([rate, amount]) => ({ pct: rate, amount: Math.round(amount) }));
    return { subtotal, taxes, grand: taxes.reduce((sum, t) => sum + t.amount, subtotal) };
  };

  // Display lines: [subtotal, tax per rate...] only when tax is added on top, always ending with the grand total.
  Invoice.totalLines = (t) => {
    const L = labels();
    return [
      ...(t.taxes.length ? [{ kind: "sub", label: L.subtotal, value: t.subtotal }] : []),
      ...t.taxes.map((x) => ({ kind: "tax", label: tpl(L.taxLine, { pct: fmtPct(x.pct) }), value: x.amount })),
      { kind: "grand", label: L.total, value: t.grand },
    ];
  };
})();
