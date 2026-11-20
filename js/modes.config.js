// Document modes. Each mode can override labels, placeholders, sections (visibility), and filePrefix.
//   Invoice   = a bill: due date + bank transfer instructions.
//   Quotation = an offer: validity period + terms & conditions (no due date, no bank details).
Object.assign(window.InvoiceConfig, {
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
});
