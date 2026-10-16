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

  // Invoice content visibility (global). Missing key = visible; false = hidden.
  // Hideable keys are the [data-section] values in index.html. "items" and "total"
  // are protected (not hideable); unknown keys are ignored with a console warning.
  sections: {
    logo: false,
    companyName: true,
    title: true,
    perihal: true,
    tanggal: true,
    kepada: true,
    terbilang: true,
    transfer: false, // optional, not all invoices need transfer instructions
    signatureDate: true,
    signatureName: true,
  },

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
  },

  placeholders: {
    company: "CV. atau PT. Nama",
    item: "Isi keterangan item...",
    transfer: "Masukkan detail instruksi transfer bank di sini...",
    signatureName: "( Nama Jelas & Tanda Tangan )",
  },

  // Meta rows. Omitted placeholder = today's date.
  metaFields: [
    { key: "perihal", label: "Perihal", placeholder: "Contoh: Tagihan Ocean" },
    { key: "tanggal", label: "Tanggal" },
    {
      key: "kepada",
      label: "Kepada Yth",
      placeholder: "Contoh: INDOREX di Tempat",
    },
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
  defaultLogoFile: "L1.webp",
};
