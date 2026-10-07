// ---------- Config ----------
const FREE_SHIPPING = 100;
const SHIPPING_COST = 5.9;
const CART_KEY = "drope-cart";

const $ = (sel) => document.querySelector(sel);
const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const fmt = (n) => euro.format(n).replace(",00", "");

// ---------- Silhouettes SVG (viewBox 200x200) ----------
// Pas de photos dans le proto : le pull est dessiné et recoloré à la volée.
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * (1 - amt))));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

const SHAPES = {
  sweat: (c, d) => `
    <path d="M68 32 L44 40 L22 120 L20 168 L42 170 L50 124 L56 96 L56 176 L144 176 L144 96 L150 124 L158 170 L180 168 L178 120 L156 40 L132 32 C124 46 76 46 68 32 Z" fill="${c}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M68 32 C76 46 124 46 132 32" fill="none" stroke="${d}" stroke-width="6"/>
    <path d="M21 158 L43 160 M179 158 L157 160 M56 164 L144 164" stroke="${d}" stroke-width="2"/>`,
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
let sortBy = "featured";
let current = null; // { product, colorIdx, size }

const byId = (id) => PRODUCTS.find((p) => p.id === id);

// ---------- Grille produits ----------
function renderGrid() {
  let list = PRODUCTS;
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

$("#sort").addEventListener("change", (e) => { sortBy = e.target.value; renderGrid(); });

// ---------- Fiche produit ----------
function openProduct(id) {
  const p = byId(id);
  current = { product: p, colorIdx: 0, size: p.sizes.length === 1 ? p.sizes[0] : null, perso: null };
  $("#pmCat").textContent = "Pull · personnalisable en 3D";
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
$("#heroVisual").innerHTML = garment("sweat", "#2b4fd6");
renderGrid();
renderCart();
tick();
setInterval(tick, 1000);
