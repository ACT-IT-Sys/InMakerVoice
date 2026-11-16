// Indonesian number-to-words, driven by a scale table instead of one branch per magnitude.
(() => {
  const UNITS = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  const SCALES = [[1e9, "Milyar"], [1e6, "Juta"], [1e3, "Ribu"], [100, "Ratus"]];
  const ONE = { 1e3: "Seribu", 100: "Seratus" };

  const spell = (n) => {
    if (n < 12) return UNITS[n];
    if (n < 20) return `${UNITS[n - 10]} Belas`;
    if (n < 100) return `${UNITS[Math.floor(n / 10)]} Puluh ${spell(n % 10)}`.trim();
    const [unit, name] = SCALES.find(([v]) => n >= v);
    const q = Math.floor(n / unit);
    const head = q === 1 && ONE[unit] ? ONE[unit] : `${spell(q)} ${name}`;
    return `${head} ${spell(n % unit)}`.trim();
  };

  Invoice.terbilang = (n) => {
    const v = Math.floor(Math.abs(n));
    return v ? (n < 0 ? "Minus " : "") + spell(v) : "Nol";
  };
})();
