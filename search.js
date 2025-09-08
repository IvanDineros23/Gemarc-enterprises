/* =========================================================
   GEMARC - Unified Search (Pages + Product Suggestions)
   - Works with .products-search .search-input + .search-btn
   - Suggests Pages/Categories (from mappings) and Products
   ========================================================= */

/* -------------------------
   1) Setup core search
   ------------------------- */
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
        ${pages.map((p,i)=>`
          <div class="search-suggest-item" data-type="page" data-i="${i}">
            <div>
              <div class="suggest-title">${mark(p.key, q)}</div>
              <div class="suggest-meta">${escH(p.href)}</div>
            </div>
          </div>`).join("")}
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
        window.location.href = row.href;
        return;
      }
      if (type === "prod"){
        const row = results.prods[idx]; if(!row) return;
        try {
          if (typeof openProductModal === "function"){
            openProductModal({
              code: row.code, name: row.name, standard: row.standard,
              description: row.description, image: row.image
            });
            return;
          }
        } catch {}
        if (row.card?.scrollIntoView) {
          row.card.scrollIntoView({behavior:"smooth", block:"center"});
          row.card.classList.add("card-pulse");
          setTimeout(()=>row.card.classList.remove("card-pulse"), 1200);
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
