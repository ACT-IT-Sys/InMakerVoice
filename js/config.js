// Core settings. Lengthy/structured lists live in their own files (layouts.config.js).
window.InvoiceConfig = {
  locale: "id-ID",
  currency: "Rp",
  currencyWord: "Rupiah",
  filePrefix: "Invoice",
  signatureCity: "Lembar",
  defaultCompany: "CV. ",
  pdf: { margin: 0.5, format: "letter", scale: 2 },

  // Toolbar buttons. Missing key = visible; false = hidden.
  exports: { print: true, pdf: true, doc: true, xlsx: false },

  // Content visibility (global). Missing key = visible; false = hidden.
  // Hideable keys are the [data-section] values in index.html (meta field keys included).
  // "items" and "total" are protected (not hideable); unknown keys are ignored with a console warning.
  // Mode-specific fields (jatuhTempo, berlakuHingga) are switched per mode in `modes` below.
  sections: {
    logo: true,
    companyName: true,
    title: true,
    perihal: true,
    tanggal: true,
    kepada: true,
    jatuhTempo: true,
    berlakuHingga: true,
    terbilang: true,
    transfer: true,
    signatureDate: true,
    signatureName: true,
  },

  // Base labels. Meta row labels use the `meta_<key>` convention so modes can rename them.
  labels: {
    title: "INVOICE",
    no: "NO",
    description: "KETERANGAN",
    amount: "JUMLAH (Rp)",
    total: "TOTAL:",
    terbilang: "Terbilang :",
    lock: "Kunci Edit",
    transfer: "Please Transfer details :",
    addRow: "+ Add Row",
    logoPick: "Klik untuk memilih logo dari komputer",
    meta_perihal: "Perihal",
    meta_tanggal: "Tanggal",
    meta_kepada: "Kepada Yth",
    meta_jatuhTempo: "Jatuh Tempo",
    meta_berlakuHingga: "Berlaku Hingga",
  },

  placeholders: {
    company: "CV. atau PT. Nama",
    item: "Isi keterangan item...",
    transfer: "Masukkan detail instruksi transfer bank di sini...",
    signatureName: "( Nama Jelas & Tanda Tangan )",
  },

  // Meta rows (all modes). Omitted placeholder = today's date.
  // Which rows actually show is decided by `sections` (global < layout < mode).
  metaFields: [
    { key: "perihal", placeholder: "Contoh: Tagihan Ocean" },
    { key: "tanggal" },
    { key: "kepada", placeholder: "Contoh: INDOREX di Tempat" },
    { key: "jatuhTempo", placeholder: "Contoh: 14 hari setelah invoice" },
    { key: "berlakuHingga", placeholder: "Contoh: 30 hari sejak tanggal penawaran" },
  ],

  monthNames: [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ],

  logos: [
    { file: "img/L1.webp", name: "Logo 1" },
    { file: "img/L2.webp", name: "Logo 2" },
    { file: "img/L3.webp", name: "Logo 3" },
    { file: "img/L4.webp", name: "Logo 4" },
  ],
  defaultLogoFile: "img/L1.webp",

  // Document modes. Each mode can override labels, placeholders, sections (visibility), and filePrefix.
  // Precedence for sections: global < layout < mode < runtime toggles.
  //   Invoice   = a bill: due date + bank transfer instructions.
  //   Quotation = an offer: validity period + terms & conditions (no due date, no bank details).
  defaultDocumentType: "invoice",
  modes: {
    invoice: {
      filePrefix: "Invoice",
      labels: {
        title: "INVOICE",
        amount: "JUMLAH (Rp)",
        transfer: "Please Transfer details :",
        meta_perihal: "Perihal",
      },
      placeholders: {
        transfer: "Masukkan detail instruksi transfer bank di sini...",
      },
      sections: { jatuhTempo: true, berlakuHingga: false, transfer: true },
    },
    quotation: {
      filePrefix: "Quotation",
      labels: {
        title: "QUOTATION",
        amount: "HARGA (Rp)",
        transfer: "Syarat & Ketentuan :",
        meta_perihal: "Perihal Penawaran",
      },
      placeholders: {
        transfer: "Contoh: Harga belum termasuk PPN. Pembayaran DP 50% di muka...",
      },
      sections: { jatuhTempo: false, berlakuHingga: true, transfer: true },
    },
  },
};
