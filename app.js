// Konfigurasi Jumlah Chunk Data
const TOTAL_BUKHARI_CHUNKS = 14;
let allHadiths = [];
let filteredHadiths = [];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const hadithContainer = document.getElementById('hadithContainer');

// 1. Fungsi Memuat Semua Data JSON Pecahan
async function loadAllHadiths() {
  hadithContainer.innerHTML = `
    <div class="text-center py-12 text-slate-400">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3"></div>
      <p>Memuat database Sahih Bukhari...</p>
    </div>
  `;

  try {
    const fetchPromises = [];
    for (let i = 1; i <= TOTAL_BUKHARI_CHUNKS; i++) {
      fetchPromises.push(
        fetch(`data/bukhari/bukhari_part_${i}.json`).then(res => {
          if (!res.ok) throw new Error(`Gagal memuat part ${i}`);
          return res.json();
        })
      );
    }

    // Tunggu seluruh chunk selesai di-load
    const chunksData = await Promise.all(fetchPromises);
    allHadiths = chunksData.flat(); // Gabungkan seluruh array hadits
    filteredHadiths = [...allHadiths];

    // Render 20 hadits pertama
    renderHadiths(filteredHadiths.slice(0, 20));
  } catch (error) {
    console.error(error);
    hadithContainer.innerHTML = `
      <div class="glass-card p-6 rounded-xl text-red-400 text-center">
        Gagal memuat data hadits. Pastikan struktur folder di GitHub sudah sesuai (data/bukhari/).
      </div>
    `;
  }
}

// 2. Fungsi Rendering Kartu Hadits ke UI
function renderHadiths(hadithList) {
  if (hadithList.length === 0) {
    hadithContainer.innerHTML = `
      <div class="glass-card p-8 rounded-xl text-center text-slate-400">
        Hadits yang kamu cari tidak ditemukan.
      </div>
    `;
    return;
  }

  hadithContainer.innerHTML = hadithList.map(item => `
    <div class="glass-card p-6 sm:p-8 rounded-2xl relative overflow-hidden transition hover:border-slate-700">
      <div class="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
        <span class="px-3 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-xs font-bold uppercase tracking-wider">
          Bukhari No. ${item.number || item.id}
        </span>
        <button onclick="copyHadith('${item.number || item.id}')" class="text-slate-400 hover:text-amber-400 text-xs font-medium flex items-center gap-1 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          Salin
        </button>
      </div>

      <p class="font-arabic text-2xl sm:text-3xl text-right text-amber-100/90 mb-6 leading-relaxed" dir="rtl">
        ${item.arab || item.ar}
      </p>

      <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
        "${item.id || item.terjemah || item.id_text}"
      </p>
    </div>
  `).join('');
}

// 3. Pencarian Instant & Responsif (Debounced)
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const keyword = e.target.value.toLowerCase().trim();

  searchTimeout = setTimeout(() => {
    if (!keyword) {
      renderHadiths(allHadiths.slice(0, 20));
      return;
    }

    filteredHadiths = allHadiths.filter(item => {
      const numMatch = (item.number || item.id || '').toString() === keyword;
      const textMatch = (item.id || item.terjemah || item.id_text || '').toLowerCase().includes(keyword);
      return numMatch || textMatch;
    });

    renderHadiths(filteredHadiths.slice(0, 50));
  }, 250);
});

// Jalankan saat halaman dibuka
document.addEventListener('DOMContentLoaded', loadAllHadiths);
