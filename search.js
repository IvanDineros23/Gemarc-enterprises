/* =========================================================
   GEMARC - Unified Search (Pages + Product Suggestions)
   - Works with .products-search .search-input + .search-btn
   - Suggests Pages/Categories (from mappings) and Products
   ========================================================= */

/* -------------------------
   1) Setup core search
   ------------------------- */
// Product list for search suggestions (code, name, page)
const allProducts = [
  // Aggregates
  { code: "A024N", name: "Ceramic Muffle Furnace", page: "aggregates.html" },
  { code: "A075N", name: "LOS ANGELES ABRASION MACHINE", page: "aggregates.html" },
  { code: "A125N", name: "Digital Point Load Tester 56 KN (ROCK STRENGTH INDEX)", page: "aggregates.html" },
  { code: "NL 1015 X / 011", name: "Sieve Shaker, Triple Motion (From 200 up to 450 mm Dia.)", page: "aggregates.html" },
  { code: "NL 1003 X", name: "Bulk Density Measure", page: "aggregates.html" },
  { code: "LDO-060E", name: "Natural Convection Oven", page: "aggregates.html" },
  { code: "LBD-2045D", name: "Hotplate & Stirrer", page: "aggregates.html" },
  { code: "LWB-111D", name: "Digital Water Bath", page: "aggregates.html" },

  // Asphalt & Bitumen
  { code: "B011", name: "Centrifuge Extractor", page: "asphalt-bitumen.html" },
  { code: "B043 KIT", name: "Digital Marshall Tester 50kN Capacity", page: "asphalt-bitumen.html" },
  { code: "B055", name: "Ductilometer with Cooling System", page: "asphalt-bitumen.html" },
  { code: "NL 1012 X / 008", name: "Point Load Tester, Digimatic", page: "asphalt-bitumen.html" },
  { code: "NL 2001 X / 005", name: "Digital Penetrometer", page: "asphalt-bitumen.html" },
  { code: "NL 2007 X", name: "Vacuum Pyknometer", page: "asphalt-bitumen.html" },

  // Cement & Mortar
  { code: "E070", name: "Autoclave", page: "cement-mortar.html" },
  { code: "E009-KIT", name: "Manual Blaine Air Permeability Apparatus", page: "cement-mortar.html" },
  { code: "E138", name: "Large Capacity Curing Cabinet", page: "cement-mortar.html" },
  { code: "NL 3031 X / 006", name: "Mortar Mixer (Automatic)", page: "cement-mortar.html" },
  { code: "NL 3004 A / 001", name: "Flow Cone Apparatus", page: "cement-mortar.html" },
  { code: "NL 3012 X / 004", name: "Vicat Apparatus, Manual, ASTM & AASHTO", page: "cement-mortar.html" },

  // Concrete & Mortar
  { code: "C386M", name: "Digital Concrete Test Hammer with Microprocessor", page: "concrete-mortar.html" },
  { code: "C093-05", name: "Concrete Pipe Testing Machine", page: "concrete-mortar.html" },
  { code: "C089-21N", name: "Compression Testing Machine (High end)", page: "concrete-mortar.html" },
  { code: "NL 4000 X / 016U", name: "Automatic Compression Machine 2000kN Touch Screen", page: "concrete-mortar.html" },
  { code: "NL 4021 X / 004", name: "Digital Concrete Test Hammer", page: "concrete-mortar.html" },
  { code: "NL4023X / 002 & 003", name: "Air Entrainment Meter", page: "concrete-mortar.html" },
  { code: "CAPSTONE S-350", name: "CAPSTONE S-350", page: "concrete-mortar.html" },
  { code: "CAPSTONE S-560", name: "CAPSTONE S-560", page: "concrete-mortar.html" },
  { code: "CAPSTONE S-630", name: "CAPSTONE S-630", page: "concrete-mortar.html" },
  { code: "EHWA-CB-001", name: "Core Bits for Drilling", page: "concrete-mortar.html" },
  { code: "TBTCTM-2000N", name: "Compression Testing Machine w/ Digital Display", page: "concrete-mortar.html" },

  // Drilling Machine
  { code: "AK-01", name: "Air operated Drill type", page: "drilling-machine.html" },
  { code: "D2-K92", name: "Spindle Type", page: "drilling-machine.html" },
  { code: "DM-03", name: "Drilling Machine", page: "drilling-machine.html" },
  { code: "TS-IDCB-001", name: "Impregnated Diamond Core Bits", page: "drilling-machine.html" },
  { code: "TS-DRS-002", name: "Diamond Reaming Shells", page: "drilling-machine.html" },
  { code: "TS-SSDCB-003", name: "Surface Set Diamond Core Bits", page: "drilling-machine.html" },
  { code: "TS-IDCS-004", name: "Impregnated Diamond Casing Shoe", page: "drilling-machine.html" },
  { code: "TS-PDC-005", name: "PDC Bits & Tricone Bits", page: "drilling-machine.html" },
  { code: "TS-CB-006", name: "Core Barrels", page: "drilling-machine.html" },
  { code: "TS-DRC-007", name: "Drill Rods & Casing Pipe", page: "drilling-machine.html" },

  // Industrial Equipment
  { code: "GT-7010-D2ELP", name: "Micro-Computer Tensile Strength Tester", page: "industrial-equipment.html" },
  { code: "GT-7013-MPA", name: "Digital Type Bursting Strength Tester", page: "industrial-equipment.html" },
  { code: "GT-7001-DSU", name: "Servo Control Container Compression Tester", page: "industrial-equipment.html" },

  // Soil
  { code: "S172-01N", name: "Motorized liquid limit device, NF", page: "soil.html" },
  { code: "S165-02", name: "Semiautomatic cone digital penetrometer", page: "soil.html" },
  { code: "S276-01M", name: "Auto ShearLab - Direct and Residual Shear Testing Machine", page: "soil.html" },
  { code: "NL 5002 X / 010", name: "Eco Smartz Advanced CBR Loading Tester 50kN", page: "soil.html" },
  { code: "NL 5032 X / 001", name: "Electrical Density Gauge (EDG)", page: "soil.html" },
  { code: "NL 5025 X / SAS", name: "Automatic CBR or MOD Soil Compactor", page: "soil.html" },
  { code: "PSK-001", name: "Polycarbonate Sieve Kits", page: "soil.html" },
  { code: "MFS-001", name: "Metric Frame Sieves", page: "soil.html" },

  // Steel
  { code: "AI-7000-LAU", name: "Servo Control System Universal Testing Machine", page: "steel.html" },
  { code: "WA-100C/WA-300C/WA-600C/WA-1000C", name: "Universal Testing Machine with PC&Servo Control", page: "steel.html" },

  // Pavetest
  { code: "B210", name: "Pavement Deflectometer", page: "pavetest.html" },
  { code: "B220-01-KIT", name: "Servo-pneumatic Dynamic Testing System - DTS-16 Manual", page: "pavetest.html" },
  { code: "B265", name: "SmartPulse | Electro-Mechanical Dynamic Testing System", page: "pavetest.html" }
];
function setupSearch() {
  // A) Main navigation / top-level pages
  const searchMappings = {
    home: "index.html",
    news: "news.html",
    services: "services.html",
    about: "about.html",
    contact: "contact.html",
  };

  // B) Content sections / product category landing pages
  const contentMappings = {
    aggregates: "aggregates.html",
    asphalt: "asphalt-bitumen.html",
    asphaltbitumen: "asphalt-bitumen.html",
    cement: "cement-mortar.html",
    concrete: "concrete-mortar.html",
    drilling: "drilling-machine.html",
    industrial: "industrial-equipment.html",
    soil: "soil.html",
    steel: "steel.html"
  };

  // Expose combined mappings so suggestions (and other scripts) can reuse them
  const allMappings = { ...searchMappings, ...contentMappings };
  window.__allMappings = allMappings;

  // Hook up every search bar on the page
  document.querySelectorAll(".products-search").forEach(wrap => {
    const input = wrap.querySelector(".search-input");
    const btn   = wrap.querySelector(".search-btn");
    if (!input) return;

    const performSearch = () => {
      const q = (input.value || "").trim().toLowerCase();
      if (!q) return;

      // 1) Exact match
      if (allMappings[q]) {
        window.location.href = allMappings[q];
        return;
      }

      // 2) Partial match by key includes query
      const hit = Object.entries(allMappings).find(([k]) => k.includes(q));
      if (hit) {
        window.location.href = hit[1];
        return;
      }

      // 3) Partial match by query includes key (e.g., "asphalt testing" should hit "asphalt")
      const hit2 = Object.entries(allMappings).find(([k]) => q.includes(k));
      if (hit2) {
        window.location.href = hit2[1];
        return;
      }

      // 4) If no page match, try to open the first product suggestion (if dropdown is visible)
      const dd = wrap.querySelector(".search-suggest");
      const first = dd?.querySelector('.search-suggest-item[data-type="prod"]');
      if (first) {
        first.click(); // triggers product select
        return;
      }

      // 5) Fallback: stay on page (or you can redirect to products.html)
      // window.location.href = "products.html";
    };

    btn?.addEventListener("click", performSearch);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        // If dropdown is open, Enter is handled by the suggestion module
        const ddOpen = wrap.querySelector(".search-suggest.show");
        if (!ddOpen) performSearch();
      }
    });
  });
}

/* ----------------------------------------------------------
   2) Suggestions (Pages + Products) – attaches to all bars
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Ensure core search is initialized
  try { setupSearch(); } catch(e) { console.warn("setupSearch init failed:", e); }

  // Small CSS helpers if not present (safe no-op if duplicates exist)
  ensureSuggestionStyles();

  // Build shared product index from any product cards on the page
  function buildProductIndex() {
    const cards = document.querySelectorAll(".product-card, [data-product-card]");
    const list = [];
    cards.forEach(card => {
      const name = card.querySelector(".product-name, [data-product-name]")?.textContent.trim() || "";
      const code = card.querySelector(".product-code, [data-product-code]")?.textContent.trim() || "";
      const std  = card.querySelector(".product-standard, [data-product-standard]")?.textContent.replace(/^Standard:\s*/i,"").trim() || "";
      const desc = card.querySelector(".product-description, [data-product-desc]")?.textContent.trim() || "";
      const img  = card.querySelector("img")?.getAttribute("src") || "";
      if (name || code) list.push({ name, code, standard: std, description: desc, image: img, card });
    });
    return list;
  }
  let productIndex = buildProductIndex();
  window.addEventListener("load", () => { productIndex = buildProductIndex(); });

  // Attach suggestion UI to each search bar
  document.querySelectorAll(".products-search").forEach(initSearchBox);

  function initSearchBox(wrap) {
    const input = wrap.querySelector(".search-input");
    if (!input) return;

    // Create dropdown
    const dd = document.createElement("div");
    dd.className = "search-suggest";
    wrap.appendChild(dd);

    // Utilities
    const escH = (s) => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const escR = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const mark = (t,q) => { if(!t) return ""; try{ return escH(t).replace(new RegExp(`(${escR(q)})`,"ig"),"<mark>$1</mark>"); }catch{ return escH(t);} };

    function rankPages(dict, q){
      const Q = q.toLowerCase();
      const rows = [];
      for (const [k, href] of Object.entries(dict || {})) {
        const kk = String(k).toLowerCase();
        if (!Q || kk.includes(Q) || Q.includes(kk) || kk.split(" ").some(w=>Q.includes(w)) || Q.split(" ").some(w=>kk.includes(w))) {
          const score = !Q ? 50 : Math.min(
            kk.indexOf(Q) >= 0 ? kk.indexOf(Q) : 999,
            ...Q.split(" ").map(w => kk.indexOf(w)).filter(i => i >= 0)
          );
          rows.push({ key:k, href, _score: isFinite(score) ? score : 999 });
        }
      }
      return rows.sort((a,b)=>a._score-b._score).slice(0,6);
    }

    function rankProducts(list, q){
      if (!list.length) return [];
      if (!q) return list.slice(0,6);
      const Q = q.toLowerCase();
      const out = [];
      for (const it of list) {
        const name = it.name.toLowerCase(), code = it.code.toLowerCase(), std = (it.standard||"").toLowerCase();
        let score = Infinity;
        if (code.includes(Q)) score = Math.min(score, code.indexOf(Q));
        if (name.includes(Q)) score = Math.min(score, name.indexOf(Q));
        if (std.includes(Q))  score = Math.min(score, std.indexOf(Q));
        if (score !== Infinity) out.push({ ...it, _score: score });
      }
      return out.sort((a,b)=>a._score-b._score || (a.code>b.code?1:-1)).slice(0,6);
    }

    let active = -1;
    let results = { pages:[], prods:[] };

    function render(q) {
  const pages = rankPages(window.__allMappings || {}, q);
  const prods = rankProducts(productIndex, q);

  if (!pages.length && !prods.length) {
    dd.classList.remove("show");
    dd.innerHTML = "";
    return;
  }

  dd.innerHTML = `
    ${pages.length ? `
      <div class="search-suggest-group" data-group="pages">
        <div class="search-suggest-header">Pages & Categories</div>
        ${pages.map((p,i)=>{
          // Remove .html for display
          const cleanTitle = p.key;
          return `
          <div class="search-suggest-item" data-type="page" data-i="${i}">
            <div>
              <div class="suggest-title">${mark(cleanTitle, q)}</div>
            </div>
          </div>`;
        }).join("")}
      </div>` : ""}

    ${prods.length ? `
      <div class="search-suggest-group" data-group="prods">
        <div class="search-suggest-header">Products</div>
        ${prods.map((r,i)=>`
          <div class="search-suggest-item" data-type="prod" data-i="${i}">
            <img class="suggest-thumb" src="${escH(r.image || "")}" alt="">
            <div>
              <div class="suggest-title">${mark(r.name || "", q)}</div>
              <div class="suggest-meta">${mark(r.standard || "", q)}</div>
            </div>
            <div class="suggest-code">${mark(r.code || "", q)}</div>
          </div>`).join("")}
      </div>` : ""}
  `;
  dd.classList.add("show");
  active = -1;
  results = { pages, prods };
}

    // Show top suggestions on focus; filter on input
    const DEBOUNCE = 120; let t;
    input.addEventListener("focus", () => { render((input.value||"").trim()); });
    input.addEventListener("input", () => { clearTimeout(t); t=setTimeout(()=>render(input.value.trim()), DEBOUNCE); });

    // Click suggestion
    dd.addEventListener("click", (e) => {
      const item = e.target.closest(".search-suggest-item");
      if (!item) return;
      select(item.dataset.type, Number(item.dataset.i));
    });

    // Keyboard nav
    input.addEventListener("keydown", (e) => {
      if (!dd.classList.contains("show")) return;
      const items = Array.from(dd.querySelectorAll(".search-suggest-item"));
      if (!items.length) return;

      if (e.key === "ArrowDown") { e.preventDefault(); active = (active + 1) % items.length; setActive(items, active); }
      else if (e.key === "ArrowUp") { e.preventDefault(); active = (active - 1 + items.length) % items.length; setActive(items, active); }
      else if (e.key === "Enter")   { e.preventDefault(); const it = items[Math.max(active,0)]; if (it) it.click(); }
      else if (e.key === "Escape")  { dd.classList.remove("show"); }
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!dd.contains(e.target) && e.target !== input) dd.classList.remove("show");
    });

    function setActive(items, i){ items.forEach(el=>el.classList.remove("active")); if (i>=0) items[i].classList.add("active"); }

    function select(type, idx){
      dd.classList.remove("show");
      if (type === "page"){
        const row = results.pages[idx]; if(!row) return;
        // Remove .html for URL, but keep for local navigation
        let cleanUrl = row.href.replace(/\.html$/, "");
        // If running locally (file:// or localhost), still use .html for navigation
        if (window.location.protocol === "file:" || window.location.hostname === "localhost") {
          window.location.href = row.href;
        } else {
          window.location.href = cleanUrl;
        }
        return;
      }
      if (type === "prod"){
        const row = results.prods[idx]; if(!row) return;
        // Redirect to category page if available
        const card = row.card;
        const categoryPage = card?.getAttribute("data-category-page");
        if (categoryPage) {
          // Remove .html for live site, keep for localhost/file
          let cleanUrl = categoryPage.replace(/\.html$/, "");
          if (window.location.protocol === "file:" || window.location.hostname === "localhost") {
            window.location.href = categoryPage;
          } else {
            window.location.href = cleanUrl;
          }
          return;
        }
        // Fallback: open modal or scroll to card
        try {
          if (typeof openProductModal === "function"){
            openProductModal({
              code: row.code, name: row.name, standard: row.standard,
              description: row.description, image: row.image
            });
            return;
          }
        } catch {}
        if (card?.scrollIntoView) {
          card.scrollIntoView({behavior:"smooth", block:"center"});
          card.classList.add("card-pulse");
          setTimeout(()=>card.classList.remove("card-pulse"), 1200);
        }
      }
    }
  }

  /* Injects minimal CSS if your main CSS didn't include it.
     Safe to keep; does nothing if class exists. */
  function ensureSuggestionStyles(){
    if (document.getElementById("gemarc-suggest-style")) return;
    const css = `
.products-search{position:relative}
.search-suggest{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:9999;background:#fff;border:1px solid #e5e9ee;border-radius:12px;box-shadow:0 10px 24px rgba(0,0,0,.08);overflow:hidden;display:none}
.search-suggest.show{display:block}
.search-suggest-group{padding:6px 0}
.search-suggest-header{font-size:.75rem;font-weight:800;opacity:.65;padding:6px 12px;text-transform:uppercase;letter-spacing:.04em}
.search-suggest-item{display:grid;grid-template-columns:44px 1fr auto;gap:10px;align-items:center;padding:10px 12px;cursor:pointer;border-top:1px solid #f2f4f7}
.search-suggest-item:hover,..search-suggest-item.active{background:#f5fbf7}
.suggest-thumb{width:44px;height:44px;border-radius:8px;object-fit:contain;background:#f6f7f8;border:1px solid #edf0f3}
.suggest-title{font-weight:700;line-height:1.2}
.suggest-meta{font-size:.82rem;color:#567}
.suggest-code{font:600 .82rem ui-monospace,Menlo,Consolas,monospace;color:#1f8e3b}
.card-pulse{box-shadow:0 0 0 3px #b8eec7,0 10px 24px rgba(0,0,0,.12)!important;animation:cardPulse 1.2s ease-out 1}
@keyframes cardPulse{0%{box-shadow:0 0 0 0 rgba(31,142,59,.35)}100%{box-shadow:0 0 0 3px rgba(31,142,59,0)}}
    `.trim();
    const style = document.createElement("style");
    style.id = "gemarc-suggest-style";
    style.textContent = css;
    document.head.appendChild(style);
  }
});
