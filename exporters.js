// Print / PDF / .doc / .xlsx. All formats read one collect() snapshot that already
// respects section visibility, so hidden sections never reach any output.
(() => {
  const { cfg, $, $$, byId, money, today, state } = Invoice;
  const L = cfg.labels;
  const sheet = byId("invoiceSheet");
  const DOC_COLUMNS = [["no", "center", 8], ["description", "left", 62], ["amount", "right", 30]];

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const val = (id) => byId(id).value.trim();
  const on = (key) => state.sections[key];
  const pick = (key, id) => (on(key) ? val(id) : null); // null = section hidden

  const fillDefaults = () => {
    const date = byId("tanggal");
    date.value = date.value.trim() || today();
    const sig = byId("signatureLocationDate");
    sig.value = sig.value.trim() || `${cfg.signatureCity}, ${date.value}`;
  };

  const collect = () => {
    const rows = $$("#tableBody tr").map((tr) => ({
      no: $(".index-cell", tr).textContent,
      desc: tr.cells[1].firstElementChild.value,
      amount: parseFloat(tr.cells[2].firstElementChild.value) || 0,
    }));
    return {
      company: on("companyName") ? val("companyNameInput") : "",
      title: on("title") ? byId("invoiceTitle").textContent : "",
      meta: cfg.metaFields.filter((f) => on(f.key)).map((f) => [f.label, val(f.key)]),
      rows,
      total: rows.reduce((sum, r) => sum + r.amount, 0),
      terbilang: pick("terbilang", "terbilangField"),
      transfer: pick("transfer", "transferDetails"),
      sigDate: pick("signatureDate", "signatureLocationDate"),
      sigName: pick("signatureName", "signatureName"),
    };
  };

  const fileName = (ext) => `${cfg.filePrefix}_${(val("companyNameInput") || cfg.filePrefix).replace(/\s+/g, "_")}.${ext}`;

  const download = (blob, name) => {
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  // .doc: same visual family (colors/skin/font read from the live sheet), zones in linear order.
  const buildDoc = (d) => {
    const cs = getComputedStyle(sheet);
    const v = (name) => cs.getPropertyValue(name).trim();
    const cell = `border:1px solid ${v("--border-color")};padding:8px;`;
    const th = `background:${v("--th-bg")};color:${v("--th-fg")};border:1px solid ${v("--primary-color")};padding:10px;`;
    const para = (html, style = "") => `<p style="${style}">${html}</p>`;

    const zones = {
      brand: () => d.company && para(`<b>${esc(d.company)}</b>`, "font-size:16pt"),
      title: () => d.title && para(esc(d.title), `font-size:22pt;font-weight:bold;color:${v("--primary-color")};text-align:right`),
      meta: () => d.meta.length > 0 && `<table>${d.meta.map(([l, x]) => `<tr><td width="120"><b>${esc(l)}</b></td><td>: ${esc(x)}</td></tr>`).join("")}</table>`,
      items: () =>
        `<table width="100%" style="border-collapse:collapse"><tr>${DOC_COLUMNS.map(([k, align, w]) => `<th width="${w}%" style="${th}text-align:${align}">${esc(L[k])}</th>`).join("")}</tr>` +
        d.rows.map((r) => `<tr><td style="${cell}text-align:center">${r.no}</td><td style="${cell}">${esc(r.desc)}</td><td style="${cell}text-align:right">${money(r.amount)}</td></tr>`).join("") +
        "</table>",
      total: () => para(`<b>${esc(L.total)} ${money(d.total)}</b>`, "text-align:right"),
      terbilang: () => d.terbilang !== null && para(`<b>${esc(L.terbilang)}</b> ${esc(d.terbilang)}`),
      transfer: () => d.transfer !== null && para(`<b>${esc(L.transfer)}</b><br>${esc(d.transfer).replace(/\n/g, "<br>")}`),
      signature: () =>
        (d.sigDate !== null || d.sigName !== null) &&
        para(`${esc(d.sigDate ?? "")}<br><br><br><br>${d.sigName === null ? "" : `<b>${esc(d.sigName || cfg.placeholders.signatureName)}</b>`}`, "text-align:right"),
    };

    const body = (state.layout.docOrder || cfg.docOrder).map((z) => zones[z]()).filter(Boolean).join("");
    return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${esc(d.title || cfg.filePrefix)}</title><style>body{font-family:${cs.fontFamily}}</style></head><body>${body}</body></html>`;
  };

  // Every export runs the same wrapper: fill defaults, switch on "exporting" styles, always restore.
  const run = (fn) => async () => {
    fillDefaults();
    document.body.classList.add("exporting");
    try {
      await fn();
    } finally {
      document.body.classList.remove("exporting");
    }
  };

  Invoice.exporters = {
    print: run(() => window.print()),

    pdf: run(() => {
      if (!window.html2pdf) return console.warn("Invoice: html2pdf failed to load.");
      const { margin, format, scale } = cfg.pdf;
      return window
        .html2pdf()
        .set({
          margin,
          filename: fileName("pdf"),
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale, useCORS: true },
          jsPDF: { unit: "in", format, orientation: "portrait" },
        })
        .from(sheet)
        .save();
    }),

    doc: run(() => download(new Blob(["\ufeff" + buildDoc(collect())], { type: "application/msword" }), fileName("doc"))),

    xlsx: run(() => {
      const d = collect();
      const aoa = [
        [d.title, "", d.company],
        [],
        ...d.meta.map(([l, x]) => [l, `: ${x}`]),
        [],
        [L.no, L.description, L.amount],
        ...d.rows.map((r) => [r.no, r.desc, r.amount]),
        ["", L.total, d.total],
        ...(d.terbilang === null ? [] : [[], [L.terbilang, d.terbilang]]),
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Invoice Data");
      XLSX.writeFile(wb, fileName("xlsx"));
    }),
  };
})();
