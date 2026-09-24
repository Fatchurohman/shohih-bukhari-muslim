// Mengambil data langsung dari CDN publik tepercaya
const BUKHARI_URL = 'https://cdn.jsdelivr.net/gh/gadingnst/hadith-api@master/books/bukhari.json';

let allHadiths = [];
let filteredHadiths = [];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const hadithContainer = document.getElementById('hadithContainer');

// 1. Fetch Data dari CDN dengan Error Handling dan Validasi Aman
async function loadHadiths() {
  if (!hadithContainer) return;

  hadithContainer.innerHTML = `
    <div class="text-center py-12 text-slate-400">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3"></div>
      <p class="text-sm">Memuat database Sahih Bukhari...</p>
    </div>
  `;

  try {
    const response = await fetch(BUKHARI_URL);
    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validasi struktur JSON secara aman
    if (data && Array.isArray(data.hadiths)) {
      allHadiths = data.hadiths;
    } else if (Array.isArray(data)) {
      allHadiths = data;
    } else {
      throw new Error('Format data JSON tidak sesuai harapan.');
    }

    filteredHadiths = [...allHadiths];

    // Tampilkan 20 hadits pertama
    renderHadiths(filteredHadiths.slice(0, 20));
  } catch (error) {
    console.error('Gagal memuat hadits:', error);
    hadithContainer.innerHTML = `
      <div class="glass-card p-6 rounded-xl text-red-400 text-center text-sm">
        Gagal memuat data hadits dari CDN. Pastikan koneksi internet stabil atau coba muat ulang halaman.
      </div>
    `;
  }
}

// 2. Render Hadits ke Tampilan
function renderHadiths(list) {
  if (!hadithContainer) return;

  if (!Array.isArray(list) || list.length === 0) {
    hadithContainer.innerHTML = `
      <div class="glass-card p-8 rounded-xl text-center text-slate-400 text-sm">
        Hadits tidak ditemukan. Cobalah kata kunci lain.
      </div>
    `;
    return;
  }

  hadithContainer.innerHTML = list.map(item => {
    const number = item.number || item.id || '-';
    const arab = item.arab || item.ar || '';
    const idText = item.id || item.terjemah || '';

    return `
      <div class="glass-card p-6 sm:p-8 rounded-2xl relative overflow-hidden transition hover:border-slate-700">
        <div class="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <span class="px-3 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-xs font-bold uppercase tracking-wider">
            Bukhari No. ${number}
          </span>
          <button onclick="copyText('${encodeURIComponent(idText)}')" class="text-slate-400 hover:text-amber-400 text-xs font-medium flex items-center gap-1 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            Salin
          </button>
        </div>

        <p class="font-arabic text-2xl sm:text-3xl text-right text-amber-100/90 mb-6 leading-relaxed" dir="rtl">
          ${arab}
        </p>

        <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
          "${idText}"
        </p>
      </div>
    `;
  }).join('');
}

// 3. Salin Teks
function copyText(text) {
  if (!text) return;
  navigator.clipboard.writeText(decodeURIComponent(text));
  alert('Teks hadits berhasil disalin!');
}

// 4. Pencarian Responsif Instan
let searchTimeout;
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const keyword = e.target.value.toLowerCase().trim();

    searchTimeout = setTimeout(() => {
      if (!keyword) {
        renderHadiths(allHadiths.slice(0, 20));
        return;
      }

      filteredHadiths = allHadiths.filter(item => {
        const numberStr = (item.number || item.id || '').toString();
        const textStr = (item.id || item.terjemah || '').toLowerCase();
        return numberStr === keyword || textStr.includes(keyword);
      });

      renderHadiths(filteredHadiths.slice(0, 50));
    }, 250);
  });
}

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', loadHadiths);
