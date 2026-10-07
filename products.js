// Catalogue du prototype : uniquement des pulls, tous personnalisables avec le même
// configurateur Drope (référence "sweat"). Pour ajouter un pull, ajoute un objet ici.
const SIZES = ["XS", "S", "M", "L", "XL"];

const PRODUCTS = [
  {
    id: "pull-bleu",
    name: "Pull Bleu",
    price: 79,
    badge: "Best-seller",
    desc: "Maille épaisse, col rond côtelé, coupe droite. Personnalise-le en 3D avant de commander.",
    colors: [
      { name: "Bleu roi", hex: "#2b4fd6" },
      { name: "Bleu marine", hex: "#1f2a44" },
    ],
  },
  {
    id: "pull-essentiel",
    name: "Pull Col Rond Essentiel",
    price: 69,
    desc: "Molleton 380 g/m², bord-côtes épais aux poignets et à la taille. Simple, solide.",
    colors: [
      { name: "Écru", hex: "#ece6d8" },
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Gris chiné", hex: "#9a9a9a" },
    ],
  },
  {
    id: "pull-heavyweight",
    name: "Pull Heavyweight",
    price: 89,
    badge: "Nouveau",
    desc: "Molleton gratté 450 g/m², lavé pour un toucher déjà rodé. Le plus chaud de la collection.",
    colors: [
      { name: "Bordeaux", hex: "#5e1f2a" },
      { name: "Vert forêt", hex: "#2f4a3a" },
    ],
  },
  {
    id: "pull-merinos",
    name: "Pull Laine Mérinos",
    price: 109,
    desc: "Mérinos extra-fin, ne gratte pas, régule la chaleur. Se porte seul ou sous une veste.",
    colors: [
      { name: "Camel", hex: "#a8773f" },
      { name: "Marine", hex: "#1f2a44" },
    ],
  },
  {
    id: "pull-oversize",
    name: "Pull Oversize",
    price: 75,
    desc: "Épaules tombantes, manches longues, coupe ample. Prends ta taille habituelle.",
    colors: [
      { name: "Kaki", hex: "#6b6a4b" },
      { name: "Sable", hex: "#c8b48e" },
    ],
  },
  {
    id: "pull-cotele",
    name: "Pull Côtelé",
    price: 85,
    badge: "Stock limité",
    desc: "Grosse côte verticale, col rond serré. Produit en petite série.",
    colors: [
      { name: "Orange", hex: "#d4622a" },
      { name: "Noir", hex: "#1a1a1a" },
    ],
  },
].map((p) => ({ ...p, type: "sweat", drape: "sweat", sizes: SIZES }));
