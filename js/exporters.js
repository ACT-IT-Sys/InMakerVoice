// Print / PDF / .doc / .xlsx. All formats read one collect() snapshot that already
// respects section visibility, so hidden sections never reach any output.
(() => {
  const { cfg, $, $$, byId, money, today, state, num, tpl, labels } = Invoice;
  const sheet = byId("invoiceSheet");
  const DOC_COLUMNS = [["no", "center", 8], ["description", "left", 62], ["amount", "right", 30]];

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const val = (id) => byId(id).value.trim();
  const on = (key) => state.sections[key];
  const pick = (key, id) => (on(key) ? val(id) : null); // null = section hidden
  const isCategory = (r) => r.category !== undefined;

  const fillDefaults = () => {
    const date = byId("tanggal");
    date.value = date.value.trim() || today();
    const lead = tpl(Invoice.placeholders().signatureLead, { city: cfg.signatureCity, date: date.value });
    $$(".sig-date").forEach((i) => (i.value = i.value.trim() || lead));
  };

  const collect = () => {
    const L = labels();
    const rows = $$("#tableBody tr").map((tr) =>
      tr.classList.contains("category-row")
        ? { category: $(".category-input", tr).value.trim() }
        : {
            no: $(".index-cell", tr).textContent,
            desc: $(".desc-input", tr).value,
            amount: num($(".amount-input", tr).value),
          },
    );
    const t = Invoice.totals();
    return {
      documentType: state.documentType,
      company: on("companyName") ? val("companyNameInput") : "",
      companyLines: cfg.companyLines.filter(on).map(val).filter(Boolean),
      title: on("title") ? byId("invoiceTitle").textContent : "",
      meta: cfg.metaFields.filter((f) => on(f.key)).map((f) => [L["meta_" + f.key] || f.key, val(f.key)]),
      rows,
      total: t.grand,
      totalLines: Invoice.totalLines(t),
      terbilang: pick("terbilang", "terbilangField"),
      transfer: pick("transfer", "transferDetails"),
      signatures: $$(".sig-block")
        .map((b) => Object.fromEntries(cfg.signatureFields.map((f) => [f.key, on(f.section) ? $(`.sig-${f.key}`, b).value.trim() : null])))
        .filter((s) => Object.values(s).some((v) => v !== null)),
    };
  };

  const fileName = (ext) => {
    const mode = Invoice.activeMode().filePrefix || cfg.filePrefix;
    const data = {
      mode: mode.toUpperCase(),
      serial: val("serial") || "NO-SERIAL",
      weightVolume: val("weightVolume") || "",
      incoterms: val("incoterms") || "",
      company: val("companyNameInput") || "",
      date: today().replace(/[\s/]+/g, "-"),
    };
    let name = tpl(cfg.fileNameTemplate || "{mode} - {serial}", data);
    name = name.replace(/\s*-\s*\(\s*-\s*\)/g, "").replace(/\(\s*\)/g, "").replace(/\s+/g, " ").trim();
    return `${name || mode}.${ext}`;
  };

  const download = (blob, name) => {
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  // .doc: same visual family (colors/skin/font read from the live sheet), zones in linear order.
  const buildDoc = (d) => {
    const L = labels();
    const cs = getComputedStyle(sheet);
    const v = (name) => cs.getPropertyValue(name).trim();
    const cell = `border:1px solid ${v("--border-color")};padding:8px;`;
    const th = `background:${v("--th-bg")};color:${v("--th-fg")};border:1px solid ${v("--primary-color")};padding:10px;`;
    const para = (html, style = "") => `<p style="${style}">${html}</p>`;
    const sigHtml = (s) =>
      [
        s.date && esc(s.date),
        s.party && `<b>${esc(s.party)}</b>`,
        "<br><br><br>",
        s.name !== null && `<b>${esc(s.name || cfg.placeholders.signatureName)}</b>`,
        s.role && esc(s.role),
      ]
        .filter(Boolean)
        .join("<br>");

    const zones = {
      brand: () => (d.company || d.companyLines.length > 0) && (d.company ? para(`<b>${esc(d.company)}</b>`, "font-size:16pt") : "") + d.companyLines.map((l) => para(esc(l), `font-size:9pt;color:${v("--muted")}`)).join(""),
      title: () => d.title && para(esc(d.title), `font-size:22pt;font-weight:bold;color:${v("--primary-color")};text-align:right`),
      meta: () => d.meta.length > 0 && `<table>${d.meta.map(([l, x]) => `<tr><td width="120"><b>${esc(l)}</b></td><td>: ${esc(x)}</td></tr>`).join("")}</table>`,
      items: () =>
        `<table width="100%" style="border-collapse:collapse"><tr>${DOC_COLUMNS.map(([k, align, w]) => `<th width="${w}%" style="${th}text-align:${align}">${esc(L[k])}</th>`).join("")}</tr>` +
        d.rows
          .map((r) =>
            isCategory(r)
              ? `<tr><td colspan="${DOC_COLUMNS.length}" style="${cell}font-weight:bold;color:${v("--primary-color")}">${esc(r.category)}</td></tr>`
              : `<tr><td style="${cell}text-align:center">${r.no}</td><td style="${cell}">${esc(r.desc)}</td><td style="${cell}text-align:right">${money(r.amount)}</td></tr>`,
          )
          .join("") +
        "</table>",
      total: () => d.totalLines.map((l) => para(l.kind === "tax" ? `${esc(l.label)} ${money(l.value)}` : `<b>${esc(l.label)} ${money(l.value)}</b>`, "text-align:right")).join(""),
      terbilang: () => d.terbilang !== null && para(`<b>${esc(L.terbilang)}</b> ${esc(d.terbilang)}`),
      transfer: () => d.transfer !== null && para(`<b>${esc(L.transfer)}</b><br>${esc(d.transfer).replace(/\n/g, "<br>")}`),
      signature: () => d.signatures.length > 0 && para(d.signatures.map(sigHtml).join("<br><br>"), "text-align:right"),
    };

    const body = (state.layout.docOrder || cfg.docOrder).map((z) => zones[z]?.()).filter(Boolean).join("");
    return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${esc(d.title || Invoice.activeMode().filePrefix || cfg.filePrefix)}</title><style>body{font-family:${cs.fontFamily}}</style></head><body>${body}</body></html>`;
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
      const L = labels();
      const aoa = [
        [d.title, "", d.company],
        [],
        ...d.meta.map(([l, x]) => [l, `: ${x}`]),
        [],
        [L.no, L.description, L.amount],
        ...d.rows.map((r) => (isCategory(r) ? ["", r.category, ""] : [r.no, r.desc, r.amount])),
        ...d.totalLines.map((l) => ["", l.label, l.value]),
        ...(d.terbilang === null ? [] : [[], [L.terbilang, d.terbilang]]),
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Invoice Data");
      XLSX.writeFile(wb, fileName("xlsx"));
    }),
  };
})();
