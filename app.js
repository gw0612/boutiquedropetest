// ---------- Config ----------
const FREE_SHIPPING = 100;
const SHIPPING_COST = 5.9;
const CART_KEY = "drope-cart";
const CAT_LABELS = { hauts: "Hauts", bas: "Bas", accessoires: "Accessoires" };

const $ = (sel) => document.querySelector(sel);
const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const fmt = (n) => euro.format(n).replace(",00", "");

// ---------- Silhouettes SVG (viewBox 200x200) ----------
// Pas de photos dans le proto : chaque type de vêtement est dessiné et recoloré à la volée.
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * (1 - amt))));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

const SHAPES = {
  tee: (c, d) => `
    <path d="M68 32 L42 42 L14 72 L36 96 L54 84 L54 176 L146 176 L146 84 L164 96 L186 72 L158 42 L132 32 C124 46 76 46 68 32 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M68 32 C76 46 124 46 132 32" fill="none" stroke="${d}" stroke-width="5"/>
    <path d="M36 96 L54 84 M164 96 L146 84" stroke="${d}" stroke-width="2"/>`,
  sweat: (c, d) => `
    <path d="M68 32 L44 40 L22 120 L20 168 L42 170 L50 124 L56 96 L56 176 L144 176 L144 96 L150 124 L158 170 L180 168 L178 120 L156 40 L132 32 C124 46 76 46 68 32 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M68 32 C76 46 124 46 132 32" fill="none" stroke="${d}" stroke-width="6"/>
    <path d="M21 158 L43 160 M179 158 L157 160 M56 164 L144 164" stroke="${d}" stroke-width="2"/>`,
  hoodie: (c, d) => `
    <path d="M70 36 C62 4 138 4 130 36 C120 52 80 52 70 36 Z" fill="${d}" stroke="${d}" stroke-width="2"/>
    <path d="M68 32 L44 40 L22 120 L20 168 L42 170 L50 124 L56 96 L56 176 L144 176 L144 96 L150 124 L158 170 L180 168 L178 120 L156 40 L132 32 C124 50 76 50 68 32 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M74 128 L126 128 L134 158 L66 158 Z" fill="none" stroke="${d}" stroke-width="2"/>
    <path d="M90 46 L88 78 M110 46 L112 78" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M21 158 L43 160 M179 158 L157 160 M56 166 L144 166" stroke="${d}" stroke-width="2"/>`,
  jacket: (c, d) => `
    <path d="M68 32 L44 40 L22 120 L20 168 L42 170 L50 124 L56 96 L56 176 L144 176 L144 96 L150 124 L158 170 L180 168 L178 120 L156 40 L132 32 L100 44 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M68 32 L82 58 L100 44 L118 58 L132 32" fill="${d}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M100 44 L100 176" stroke="${d}" stroke-width="3"/>
    <rect x="66" y="112" width="24" height="26" rx="3" fill="none" stroke="${d}" stroke-width="2"/>
    <rect x="110" y="112" width="24" height="26" rx="3" fill="none" stroke="${d}" stroke-width="2"/>`,
  pants: (c, d) => `
    <path d="M58 18 L142 18 L150 182 L110 182 L100 74 L90 182 L50 182 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M58 30 L142 30" stroke="${d}" stroke-width="3"/>
    <path d="M100 30 L100 70" stroke="${d}" stroke-width="2"/>
    <rect x="57" y="100" width="22" height="30" rx="3" fill="none" stroke="${d}" stroke-width="2"/>
    <rect x="121" y="100" width="22" height="30" rx="3" fill="none" stroke="${d}" stroke-width="2"/>`,
  shorts: (c, d) => `
    <path d="M54 48 L146 48 L156 138 L110 144 L100 92 L90 144 L44 138 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M54 60 L146 60" stroke="${d}" stroke-width="3"/>
    <path d="M70 66 C66 84 62 90 52 92 M130 66 C134 84 138 90 148 92" fill="none" stroke="${d}" stroke-width="2"/>`,
  cap: (c, d) => `
    <path d="M40 128 L160 128 C188 130 192 148 170 150 L40 140 Z" fill="${d}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M44 128 C44 62 156 62 156 128 Z" fill="${c}" stroke="${d}" stroke-width="2"/>
    <path d="M100 68 L100 128 M72 76 C66 96 66 112 68 128 M128 76 C134 96 134 112 132 128" fill="none" stroke="${d}" stroke-width="1.5"/>
    <circle cx="100" cy="66" r="5" fill="${d}"/>`,
  beanie: (c, d) => `
    <circle cx="100" cy="40" r="16" fill="${c}" stroke="${d}" stroke-width="2"/>
    <path d="M54 130 L54 98 C54 46 146 46 146 98 L146 130 Z" fill="${c}" stroke="${d}" stroke-width="2"/>
    <rect x="48" y="120" width="104" height="44" rx="6" fill="${c}" stroke="${d}" stroke-width="2"/>
    <path d="M62 124 V160 M76 124 V160 M90 124 V160 M104 124 V160 M118 124 V160 M132 124 V160 M146 124 V160" stroke="${d}" stroke-width="1.5" opacity=".7"/>`,
  tote: (c, d) => `
    <path d="M72 76 C72 18 128 18 128 76" fill="none" stroke="${d}" stroke-width="7"/>
    <path d="M46 74 L154 74 L162 184 L38 184 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>
    <text x="100" y="140" text-anchor="middle" font-family="Archivo Black, Impact, sans-serif" font-size="22" fill="${d}">DROPE</text>`,
};

function garment(type, hex) {
  const dark = shade(hex, hex === "#1a1a1a" ? -0.9 : 0.28); // sur du noir, on éclaircit les détails
  return `<svg viewBox="0 0 200 200" aria-hidden="true">${SHAPES[type](hex, dark)}</svg>`;
}

// ---------- Storage (protégé : le proto doit marcher même sans localStorage) ----------
function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
}

// ---------- State ----------
let cart = loadCart().filter((l) => PRODUCTS.some((p) => p.id === l.id));
let filter = "all";
let sortBy = "featured";
let current = null; // { product, colorIdx, size }

const byId = (id) => PRODUCTS.find((p) => p.id === id);

// ---------- Grille produits ----------
function renderGrid() {
  let list = PRODUCTS.filter((p) => filter === "all" || p.cat === filter);
  if (sortBy === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sortBy === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "fr"));

  $("#grid").innerHTML = list.map((p, i) => {
    const single = p.sizes.length === 1;
    return `
      <article class="card" data-id="${p.id}" style="animation-delay:${i * 40}ms">
        <div class="card-media">
          ${p.badge ? `<span class="badge ${p.badge === "Stock limité" ? "hot" : ""}">${p.badge}</span>` : ""}
          ${garment(p.type, p.colors[0].hex)}
          <button class="quick" data-quick="${p.id}">${single ? "Ajout rapide" : "Choisir la taille"}</button>
        </div>
        <div class="card-info">
          <div>
            <div class="card-name">${p.name}</div>
            <div class="card-dots">${p.colors.map((c) => `<span class="dot" style="background:${c.hex}" title="${c.name}"></span>`).join("")}</div>
          </div>
          <div class="card-price">${fmt(p.price)}</div>
        </div>
      </article>`;
  }).join("");
}

$("#grid").addEventListener("click", (e) => {
  const quick = e.target.closest("[data-quick]");
  if (quick) {
    e.stopPropagation();
    const p = byId(quick.dataset.quick);
    if (p.sizes.length === 1) return addToCart(p.id, 0, p.sizes[0]);
    return openProduct(p.id);
  }
  const card = e.target.closest(".card");
  if (card) openProduct(card.dataset.id);
});

function setFilter(cat) {
  filter = cat;
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c.dataset.cat === cat));
  renderGrid();
}
$("#chips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (chip) setFilter(chip.dataset.cat);
});
document.querySelectorAll("[data-nav]").forEach((a) => a.addEventListener("click", () => setFilter(a.dataset.nav)));
$("#sort").addEventListener("change", (e) => { sortBy = e.target.value; renderGrid(); });

// ---------- Fiche produit ----------
function openProduct(id) {
  const p = byId(id);
  current = { product: p, colorIdx: 0, size: p.sizes.length === 1 ? p.sizes[0] : null, perso: null };
  $("#pmCat").textContent = CAT_LABELS[p.cat];
  $("#pmName").textContent = p.name;
  $("#pmPrice").textContent = fmt(p.price);
  $("#pmDesc").textContent = p.desc;
  $("#pmError").hidden = true;
  // Fiche partagée : Drope relit data-drope-produit au clic, il suffit de le changer ici.
  const slot = $("#pmDrape");
  slot.hidden = !p.drape;
  if (p.drape) {
    slot.dataset.dropeProduit = p.drape;
    slot.dataset.dropeTitre = p.name;
  }
  renderPerso();
  renderProductOptions();
  openOverlay("#productOverlay");
}

function renderProductOptions() {
  const { product: p, colorIdx, size } = current;
  const color = p.colors[colorIdx];
  $("#pmVisual").innerHTML = garment(p.type, color.hex);
  $("#pmColorName").textContent = color.name;
  $("#pmColors").innerHTML = p.colors.map((c, i) =>
    `<button class="swatch ${i === colorIdx ? "active" : ""}" data-color="${i}" style="background:${c.hex}" aria-label="${c.name}"></button>`
  ).join("");
  $("#pmSizes").innerHTML = p.sizes.map((s) =>
    `<button class="size ${s === size ? "active" : ""}" data-size="${s}">${s}</button>`
  ).join("");
}

$("#pmColors").addEventListener("click", (e) => {
  const b = e.target.closest("[data-color]");
  if (!b) return;
  current.colorIdx = +b.dataset.color;
  renderProductOptions();
});
$("#pmSizes").addEventListener("click", (e) => {
  const b = e.target.closest("[data-size]");
  if (!b) return;
  current.size = b.dataset.size;
  $("#pmError").hidden = true;
  renderProductOptions();
});
$("#pmAdd").addEventListener("click", () => {
  if (!current.size) {
    $("#pmError").hidden = false;
    const sizes = $("#pmSizes");
    sizes.classList.remove("shake");
    void sizes.offsetWidth; // relance l'animation
    sizes.classList.add("shake");
    return;
  }
  addToCart(current.product.id, current.colorIdx, current.size, current.perso);
  current.perso = null;
  closeOverlay("#productOverlay");
});

// ---------- Personnalisation 3D (Drope) ----------
// Le bouton est posé par drope-bouton.js (voir index.html) ; on écoute ses événements.
// Les fichiers et captures restent en mémoire : un vrai site les enverrait à son serveur.
const persoMedia = new Map(); // clé de ligne panier -> { fichiers, face }

const persoLabel = (n) => `Personnalisé · ${n} emplacement${n > 1 ? "s" : ""}`;

function renderPerso() {
  const perso = current.perso;
  $("#pmPerso").hidden = !perso;
  $("#pmAdd").textContent = perso ? "Ajouter au panier (personnalisé)" : "Ajouter au panier";
  if (!perso) return;
  $("#pmPerso").innerHTML = `
    ${perso.face ? `<img src="${perso.face}" alt="Aperçu de ta personnalisation">` : ""}
    <div><b>Personnalisation prête</b><span>${persoLabel(perso.brief.emplacements.length)}</span></div>
    <button class="remove" data-perso-remove>Retirer</button>`;
}

$("#pmPerso").addEventListener("click", (e) => {
  if (!e.target.closest("[data-perso-remove]")) return;
  if (current.perso.face) URL.revokeObjectURL(current.perso.face);
  current.perso = null;
  renderPerso();
});

document.addEventListener("drope:devis", (e) => {
  if (!current) return;
  const { brief, fichiers, captures } = e.detail;
  console.log("Drope : devis reçu", e.detail);
  if (current.perso?.face) URL.revokeObjectURL(current.perso.face);
  current.perso = { brief, fichiers, face: captures ? URL.createObjectURL(captures.face) : null };
  renderPerso();
  toast(current.size ? "Personnalisation prête, ajoute-la au panier" : "Personnalisation prête, choisis ta taille");
});

function forgetPerso(key) {
  const media = persoMedia.get(key);
  if (media?.face) URL.revokeObjectURL(media.face);
  persoMedia.delete(key);
}

// ---------- Panier ----------
function addToCart(id, colorIdx, size, perso = null) {
  // Une ligne personnalisée est unique : on ne la fusionne jamais avec une autre.
  const key = `${id}|${colorIdx}|${size}` + (perso ? `|perso-${Date.now()}` : "");
  const line = !perso && cart.find((l) => l.key === key);
  if (line) line.qty++;
  else cart.push({ key, id, colorIdx, size, qty: 1, ...(perso && { perso: perso.brief.emplacements.length }) });
  if (perso) persoMedia.set(key, { fichiers: perso.fichiers, face: perso.face });
  saveCart();
  renderCart();
  const badge = $("#cartCount");
  badge.classList.remove("bump");
  void badge.offsetWidth;
  badge.classList.add("bump");
  const p = byId(id);
  toast(`${p.name}${perso ? " personnalisé" : ""} (${p.colors[colorIdx].name}, ${size}) ajouté au panier`);
}

function totals() {
  const subtotal = cart.reduce((s, l) => s + byId(l.id).price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING_COST;
  return { subtotal, shipping, total: subtotal + shipping };
}

function renderCart() {
  const count = cart.reduce((s, l) => s + l.qty, 0);
  $("#cartCount").textContent = count;
  $("#cartCount").hidden = count === 0;

  const { subtotal, shipping, total } = totals();
  const left = FREE_SHIPPING - subtotal;
  $("#shippingBar").innerHTML = count === 0 ? "" : `
    ${left > 0 ? `Plus que <b>${fmt(left)}</b> pour la livraison offerte` : "Livraison offerte débloquée ✓"}
    <div class="shipping-track"><div class="shipping-fill" style="width:${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%"></div></div>`;

  $("#cartItems").innerHTML = count === 0
    ? `<div class="cart-empty"><p>Ton panier est vide.</p><button class="btn btn-primary" data-close>Découvrir la collection</button></div>`
    : cart.map((l) => {
        const p = byId(l.id);
        const c = p.colors[l.colorIdx];
        const face = persoMedia.get(l.key)?.face;
        return `
          <div class="line">
            <div class="line-media">${face ? `<img src="${face}" alt="">` : garment(p.type, c.hex)}</div>
            <div>
              <div class="line-name">${p.name}</div>
              <div class="line-meta">${c.name} · ${l.size}</div>
              ${l.perso ? `<div class="line-meta">${persoLabel(l.perso)}</div>` : ""}
              <div class="qty">
                <button data-dec="${l.key}" aria-label="Retirer un">−</button>
                <span>${l.qty}</span>
                <button data-inc="${l.key}" aria-label="Ajouter un">+</button>
              </div>
            </div>
            <div class="line-right">
              <b>${fmt(p.price * l.qty)}</b>
              <button class="remove" data-remove="${l.key}">Retirer</button>
            </div>
          </div>`;
      }).join("");

  $("#subtotal").textContent = fmt(subtotal);
  $("#shipping").textContent = count === 0 ? "—" : shipping === 0 ? "Offerte" : fmt(shipping);
  $("#total").textContent = fmt(total);
  $("#toCheckout").disabled = count === 0;
}

$("#cartItems").addEventListener("click", (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  const key = t.dataset.inc || t.dataset.dec || t.dataset.remove;
  const line = cart.find((l) => l.key === key);
  if (!line) return;
  if (t.dataset.inc) line.qty++;
  if (t.dataset.dec) line.qty--;
  if (t.dataset.remove || line.qty <= 0) {
    cart = cart.filter((l) => l !== line);
    forgetPerso(line.key);
  }
  saveCart();
  renderCart();
});

$("#openCart").addEventListener("click", () => openOverlay("#cartOverlay"));

// ---------- Checkout (simulé) ----------
$("#toCheckout").addEventListener("click", () => {
  const { subtotal, shipping, total } = totals();
  $("#coSummary").innerHTML = `
    <div class="row"><span>${cart.reduce((s, l) => s + l.qty, 0)} article(s)</span><span>${fmt(subtotal)}</span></div>
    <div class="row"><span>Livraison</span><span>${shipping === 0 ? "Offerte" : fmt(shipping)}</span></div>
    <div class="row"><b>Total</b><b>${fmt(total)}</b></div>`;
  $("#checkoutForm").hidden = false;
  $("#checkoutDone").hidden = true;
  closeOverlay("#cartOverlay");
  openOverlay("#checkoutOverlay");
});

$("#coForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  $("#doneName").textContent = data.get("firstname");
  $("#orderId").textContent = "DRP-" + Math.floor(100000 + Math.random() * 900000);
  cart.forEach((l) => forgetPerso(l.key));
  cart = [];
  saveCart();
  renderCart();
  e.target.reset();
  $("#checkoutForm").hidden = true;
  $("#checkoutDone").hidden = false;
});

// ---------- Overlays ----------
function openOverlay(sel) {
  $(sel).hidden = false;
  document.body.classList.add("locked");
}
function closeOverlay(sel) {
  $(sel).hidden = true;
  if (!document.querySelector(".overlay:not([hidden])")) document.body.classList.remove("locked");
}
document.querySelectorAll(".overlay").forEach((ov) => {
  ov.addEventListener("click", (e) => {
    if (e.target === ov || e.target.closest("[data-close]")) closeOverlay("#" + ov.id);
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  document.querySelectorAll(".overlay:not([hidden])").forEach((ov) => closeOverlay("#" + ov.id));
});

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

// ---------- Newsletter ----------
$("#newsletter").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.reset();
  toast("C'est noté, tu seras prévenu·e du prochain drop.");
});

// ---------- Compte à rebours : prochain vendredi 18h ----------
function nextDrop() {
  const d = new Date();
  d.setHours(18, 0, 0, 0);
  let add = (5 - d.getDay() + 7) % 7;
  if (add === 0 && Date.now() >= d.getTime()) add = 7;
  d.setDate(d.getDate() + add);
  return d;
}
let dropAt = nextDrop();
function tick() {
  let ms = dropAt - Date.now();
  if (ms <= 0) { dropAt = nextDrop(); ms = dropAt - Date.now(); }
  const s = Math.floor(ms / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  $("#cd-d").textContent = pad(Math.floor(s / 86400));
  $("#cd-h").textContent = pad(Math.floor((s % 86400) / 3600));
  $("#cd-m").textContent = pad(Math.floor((s % 3600) / 60));
  $("#cd-s").textContent = pad(s % 60);
}

// ---------- Init ----------
$("#heroVisual").innerHTML = garment("hoodie", "#e4572e");
renderGrid();
renderCart();
tick();
setInterval(tick, 1000);
