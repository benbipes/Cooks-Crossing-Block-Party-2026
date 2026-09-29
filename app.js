/**
 * Cooks Crossing Block Party 2026
 * Interactive Potluck & Event Coordination Script
 */

// ================= INITIAL SEED DATA =================
const DEFAULT_DISHES = [
  {
    id: "dish-host-pig",
    name: "Whole Roasted Pig & Signature Carolina BBQ Sauces",
    contributor: "James Strickland",
    street: "104 Wiembley",
    category: "warm-sides",
    servings: "20+",
    dietary: ["Contains Meat"],
    notes: "Slow-roasted over hickory all day! Provided for the entire neighborhood along with fresh slider buns.",
    isHostProvided: true,
    likes: 24,
    createdAt: 1759400000000
  },
  {
    id: "dish-host-cornbread",
    name: "Cast-Iron Sweet Southern Cornbread with Honey Butter",
    contributor: "Julie Byers (Party Host)",
    street: "Corner of Wiembley & Brentford",
    category: "breads",
    servings: "20+",
    dietary: ["Vegetarian"],
    notes: "Baked fresh in cast-iron skillets. Honey butter served on the side.",
    isHostProvided: true,
    likes: 19,
    createdAt: 1759405000000
  },
  {
    id: "dish-3",
    name: "Loaded Red Potato Salad with Bacon & Chives",
    contributor: "Marcus & Elena Vance",
    street: "118 Brentford",
    category: "salads",
    servings: "16-20",
    dietary: ["Gluten-Free"],
    notes: "Creamy dressing with Dijon, sour cream, and crispy Applewood smoked bacon.",
    isHostProvided: false,
    likes: 14,
    createdAt: 1759410000000
  },
  {
    id: "dish-4",
    name: "Triple Cheese Smoked Gouda Macaroni & Cheese",
    contributor: "The Robinson Family",
    street: "204 Wiembley",
    category: "warm-sides",
    servings: "16-20",
    dietary: ["Vegetarian", "Needs Outlet"],
    notes: "In a slow-cooker. Will need an electrical outlet at the food table to stay warm.",
    isHostProvided: false,
    likes: 18,
    createdAt: 1759415000000
  },
  {
    id: "dish-5",
    name: "Crisp Watermelon, Fresh Mint & Crumbled Feta Salad",
    contributor: "David & Priya Patel",
    street: "109 Brentford",
    category: "salads",
    servings: "12-15",
    dietary: ["Vegetarian", "Gluten-Free", "Nut-Free"],
    notes: "Light and refreshing tossed with balsamic glaze drizzle. Served chilled.",
    isHostProvided: false,
    likes: 11,
    createdAt: 1759420000000
  },
  {
    id: "dish-6",
    name: "Grilled Sweet Corn with Lime-Cotija Compound Butter",
    contributor: "Tom & Becky Larson",
    street: "221 Wiembley",
    category: "veggies",
    servings: "20+",
    dietary: ["Vegetarian", "Gluten-Free"],
    notes: "Fresh local sweet corn skewers grilled with chili-lime cotija butter.",
    isHostProvided: false,
    likes: 15,
    createdAt: 1759425000000
  },
  {
    id: "dish-7",
    name: "Warm Cinnamon Apple Crisp with Vanilla Bean Cream",
    contributor: "The Martinez Family",
    street: "135 Wiembley",
    category: "desserts",
    servings: "16-20",
    dietary: ["Vegetarian"],
    notes: "Made with local Honeycrisp apples and oat streusel topping.",
    isHostProvided: false,
    likes: 21,
    createdAt: 1759430000000
  },
  {
    id: "dish-8",
    name: "Fresh Strawberry Lemonade & Sweet Iced Tea Dispensers",
    contributor: "Karen & Steve Miller",
    street: "102 Brentford",
    category: "drinks",
    servings: "20+",
    dietary: ["Gluten-Free", "Nut-Free", "Dairy-Free", "Vegan"],
    notes: "Two 3-gallon glass drink dispensers with cups and ice included.",
    isHostProvided: false,
    likes: 12,
    createdAt: 1759435000000
  }
];

const DEFAULT_CORNHOLE_TEAMS = [
  { id: "c-1", name: "The Smokin' Ringers (James Strickland & Dave)", street: "Wiembley" },
  { id: "c-2", name: "Julie's Cornhole Crew (Julie Byers & Sam)", street: "Wiembley & Brentford" },
  { id: "c-3", name: "Brentford Board Masters (Marcus & Elena)", street: "118 Brentford" }
];

const DEFAULT_VOLLEYBALL_PLAYERS = [
  { id: "v-1", name: "Sarah & Mike Thompson", street: "140 Wiembley" },
  { id: "v-2", name: "Kevin Lin", street: "112 Brentford" },
  { id: "v-3", name: "Becky Larson", street: "221 Wiembley" },
  { id: "v-4", name: "David Patel", street: "109 Brentford" }
];

// ================= STORAGE KEYS =================
const STORAGE_KEYS = {
  DISHES: "cooks_crossing_dishes_v2",
  CORNHOLE: "cooks_crossing_cornhole_v2",
  VOLLEYBALL: "cooks_crossing_volleyball_v2",
  FIREBASE_CONFIG: "cooks_crossing_firebase_config_v2"
};

// ================= STATE MANAGEMENT =================
let dishesState = [];
let cornholeState = [];
let volleyballState = [];
let activeCategoryFilter = "all";
let activeDietaryFilters = new Set();
let searchQuery = "";
let sortMode = "newest";
let firebaseDb = null;

// ================= INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  initCountdown();
  setupEventListeners();
  checkUrlParamsForData();
  renderAll();
  lucide.createIcons();
});

// Load persistent data from LocalStorage
function loadData() {
  try {
    const savedDishes = localStorage.getItem(STORAGE_KEYS.DISHES);
    if (savedDishes) {
      dishesState = JSON.parse(savedDishes);
    } else {
      dishesState = [...DEFAULT_DISHES];
      saveDishes();
    }
  } catch (e) {
    console.error("Error loading dishes from localStorage:", e);
    dishesState = [...DEFAULT_DISHES];
  }

  try {
    const savedCornhole = localStorage.getItem(STORAGE_KEYS.CORNHOLE);
    cornholeState = savedCornhole ? JSON.parse(savedCornhole) : [...DEFAULT_CORNHOLE_TEAMS];
  } catch (e) {
    cornholeState = [...DEFAULT_CORNHOLE_TEAMS];
  }

  try {
    const savedVolleyball = localStorage.getItem(STORAGE_KEYS.VOLLEYBALL);
    volleyballState = savedVolleyball ? JSON.parse(savedVolleyball) : [...DEFAULT_VOLLEYBALL_PLAYERS];
  } catch (e) {
    volleyballState = [...DEFAULT_VOLLEYBALL_PLAYERS];
  }

  // Attempt Firebase Cloud connection if configured
  initFirebaseIfConfigured();
}

function saveDishes() {
  try {
    localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(dishesState));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }

  // If Firebase is active, sync to cloud
  if (firebaseDb) {
    syncToFirebase();
  }
}

function saveCornhole() {
  try {
    localStorage.setItem(STORAGE_KEYS.CORNHOLE, JSON.stringify(cornholeState));
  } catch (e) {}
}

function saveVolleyball() {
  try {
    localStorage.setItem(STORAGE_KEYS.VOLLEYBALL, JSON.stringify(volleyballState));
  } catch (e) {}
}

// ================= EVENT COUNTDOWN TIMER =================
function initCountdown() {
  // Event: Saturday, October 3, 2026 at 4:00 PM (16:00:00) EDT
  const eventDate = new Date("2026-10-03T16:00:00-04:00").getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance <= 0) {
      const timerEl = document.getElementById("countdown-timer");
      if (timerEl) {
        timerEl.innerHTML = `<div class="col-span-4 bg-emerald-500/20 text-emerald-300 font-bold py-2 rounded-xl border border-emerald-400/30">The Block Party is Live! Welcome Neighbors!</div>`;
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const dEl = document.getElementById("count-days");
    const hEl = document.getElementById("count-hours");
    const mEl = document.getElementById("count-mins");
    const sEl = document.getElementById("count-secs");

    if (dEl) dEl.textContent = String(days).padStart(2, "0");
    if (hEl) hEl.textContent = String(hours).padStart(2, "0");
    if (mEl) mEl.textContent = String(minutes).padStart(2, "0");
    if (sEl) sEl.textContent = String(seconds).padStart(2, "0");
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// ================= RENDER LOGIC =================
function renderAll() {
  renderDishes();
  renderStats();
  renderGames();
  lucide.createIcons();
}

function renderDishes() {
  const container = document.getElementById("dishes-list-container");
  const emptyState = document.getElementById("empty-dishes-state");
  if (!container) return;

  // Filter dishes
  let filtered = dishesState.filter((dish) => {
    // Category filter
    if (activeCategoryFilter !== "all" && dish.category !== activeCategoryFilter) {
      return false;
    }

    // Dietary filters
    if (activeDietaryFilters.size > 0) {
      for (const diet of activeDietaryFilters) {
        if (!dish.dietary || !dish.dietary.includes(diet)) {
          return false;
        }
      }
    }

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = dish.name.toLowerCase().includes(q);
      const matchContrib = dish.contributor.toLowerCase().includes(q);
      const matchStreet = dish.street ? dish.street.toLowerCase().includes(q) : false;
      const matchNotes = dish.notes ? dish.notes.toLowerCase().includes(q) : false;
      if (!matchName && !matchContrib && !matchStreet && !matchNotes) {
        return false;
      }
    }

    return true;
  });

  // Sort dishes
  filtered.sort((a, b) => {
    if (sortMode === "newest") {
      return (b.createdAt || 0) - (a.createdAt || 0);
    } else if (sortMode === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortMode === "category") {
      return a.category.localeCompare(b.category);
    } else if (sortMode === "servings") {
      const parseServings = (s) => parseInt(s) || 10;
      return parseServings(b.servings) - parseServings(a.servings);
    }
    return 0;
  });

  // Render cards or empty state
  if (filtered.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
  } else {
    if (emptyState) emptyState.classList.add("hidden");
    container.innerHTML = filtered.map((dish) => createDishCardHtml(dish)).join("");
  }

  // Update counts in category tabs
  updateCategoryCounts();
}

function createDishCardHtml(dish) {
  const categoryMeta = getCategoryMeta(dish.category);
  const dietaryBadgesHtml = (dish.dietary || [])
    .map((tag) => {
      let colorClass = "bg-stone-100 text-stone-700 border-stone-200";
      if (tag === "Vegetarian" || tag === "Vegan") colorClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
      if (tag === "Gluten-Free") colorClass = "bg-amber-50 text-amber-800 border-amber-200";
      if (tag === "Nut-Free") colorClass = "bg-blue-50 text-blue-800 border-blue-200";
      if (tag === "Needs Outlet") colorClass = "bg-purple-50 text-purple-800 border-purple-200";
      if (tag === "Contains Meat") colorClass = "bg-terracotta-50 text-terracotta-800 border-terracotta-200";

      return `<span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${colorClass}">${tag}</span>`;
    })
    .join(" ");

  const hostBadge = dish.isHostProvided
    ? `<span class="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
         <i data-lucide="crown" class="w-3 h-3 text-amber-700"></i> Provided for All
       </span>`
    : "";

  return `
    <article class="dish-card bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm relative group" data-dish-id="${dish.id}">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        
        <!-- Left: Dish info -->
        <div class="space-y-1.5 flex-grow">
          
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg ${categoryMeta.badgeClass}">
              <span>${categoryMeta.emoji}</span>
              <span>${categoryMeta.label}</span>
            </span>
            ${hostBadge}
            <span class="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-lg">
              ${dish.servings} servings
            </span>
          </div>

          <h4 class="font-display font-extrabold text-lg sm:text-xl text-stone-900 leading-snug">
            ${escapeHtml(dish.name)}
          </h4>

          <!-- Contributor & Address -->
          <div class="flex items-center gap-2 text-xs font-medium text-stone-600 flex-wrap">
            <span class="font-bold text-stone-900 flex items-center gap-1">
              <i data-lucide="user" class="w-3.5 h-3.5 text-amber-600"></i>
              ${escapeHtml(dish.contributor)}
            </span>
            ${
              dish.street
                ? `<span class="text-stone-300">•</span>
                   <span class="text-stone-500 flex items-center gap-1">
                     <i data-lucide="map-pin" class="w-3 h-3 text-stone-400"></i>
                     ${escapeHtml(dish.street)}
                   </span>`
                : ""
            }
          </div>

          <!-- Notes -->
          ${
            dish.notes
              ? `<p class="text-xs text-stone-600 bg-stone-50/80 p-2.5 rounded-xl border border-stone-100 mt-2 italic">
                   "${escapeHtml(dish.notes)}"
                 </p>`
              : ""
          }

          <!-- Dietary Tags -->
          ${
            dietaryBadgesHtml
              ? `<div class="flex items-center gap-1.5 flex-wrap pt-2">
                   ${dietaryBadgesHtml}
                 </div>`
              : ""
          }

        </div>

        <!-- Right: Actions (Cheer reaction & Delete) -->
        <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
          
          <button 
            type="button" 
            onclick="likeDish('${dish.id}')"
            title="Cheer for this dish!" 
            class="reaction-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all border border-amber-200"
          >
            <span>😋</span>
            <span>Can't wait!</span>
            <span class="bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-md font-extrabold text-[11px]">${dish.likes || 0}</span>
          </button>

          ${
            !dish.isHostProvided
              ? `<button 
                   type="button" 
                   onclick="deleteDish('${dish.id}')"
                   title="Remove this dish" 
                   class="text-stone-400 hover:text-rose-600 text-xs p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                 >
                   <i data-lucide="trash-2" class="w-4 h-4"></i>
                 </button>`
              : ""
          }

        </div>

      </div>
    </article>
  `;
}

function getCategoryMeta(cat) {
  switch (cat) {
    case "salads":
      return { label: "Salads & Slaws", emoji: "🥗", badgeClass: "bg-emerald-100 text-emerald-900" };
    case "warm-sides":
      return { label: "Warm Sides", emoji: "🍲", badgeClass: "bg-amber-100 text-amber-900" };
    case "veggies":
      return { label: "Potatoes & Veggies", emoji: "🥔", badgeClass: "bg-yellow-100 text-yellow-900" };
    case "breads":
      return { label: "Breads & Cornbread", emoji: "🍞", badgeClass: "bg-orange-100 text-orange-900" };
    case "appetizers":
      return { label: "Appetizers", emoji: "🧀", badgeClass: "bg-rose-100 text-rose-900" };
    case "desserts":
      return { label: "Desserts & Treats", emoji: "🍰", badgeClass: "bg-pink-100 text-pink-900" };
    case "drinks":
      return { label: "Drinks & Refreshments", emoji: "🥤", badgeClass: "bg-sky-100 text-sky-900" };
    case "supplies":
      return { label: "Supplies & Extras", emoji: "🍴", badgeClass: "bg-stone-100 text-stone-900" };
    default:
      return { label: "Side Dish", emoji: "🍽️", badgeClass: "bg-stone-100 text-stone-900" };
  }
}

function updateCategoryCounts() {
  const counts = {
    all: dishesState.length,
    salads: 0,
    "warm-sides": 0,
    veggies: 0,
    breads: 0,
    appetizers: 0,
    desserts: 0,
    drinks: 0,
    supplies: 0
  };

  dishesState.forEach((d) => {
    if (counts[d.category] !== undefined) {
      counts[d.category]++;
    }
  });

  const ids = [
    { id: "filter-count-all", count: counts.all },
    { id: "filter-count-salads", count: counts.salads },
    { id: "filter-count-warm-sides", count: counts["warm-sides"] },
    { id: "filter-count-veggies", count: counts.veggies },
    { id: "filter-count-breads", count: counts.breads },
    { id: "filter-count-appetizers", count: counts.appetizers },
    { id: "filter-count-desserts", count: counts.desserts },
    { id: "filter-count-drinks", count: counts.drinks + counts.supplies }
  ];

  ids.forEach((item) => {
    const el = document.getElementById(item.id);
    if (el) el.textContent = item.count;
  });

  // Top Nav Badge & Hero Count
  const navBadge = document.getElementById("nav-dish-count-badge");
  if (navBadge) navBadge.textContent = dishesState.length;

  const heroTag = document.getElementById("hero-dish-count-tag");
  if (heroTag) heroTag.textContent = `${dishesState.length} dishes`;
}

function renderStats() {
  const totalDishesEl = document.getElementById("stat-total-dishes");
  const totalServingsEl = document.getElementById("stat-total-servings");
  const dietaryDishesEl = document.getElementById("stat-dietary-dishes");
  const totalPlayersEl = document.getElementById("stat-total-players");

  if (totalDishesEl) totalDishesEl.textContent = dishesState.length;

  // Estimate total servings
  let servings = 0;
  dishesState.forEach((d) => {
    if (d.servings === "8-10") servings += 9;
    else if (d.servings === "12-15") servings += 14;
    else if (d.servings === "16-20") servings += 18;
    else if (d.servings === "20+") servings += 25;
    else servings += 12;
  });
  if (totalServingsEl) totalServingsEl.textContent = `${servings}+`;

  // Count dietary dishes (Vegetarian or GF)
  const dietaryCount = dishesState.filter(
    (d) => d.dietary && (d.dietary.includes("Vegetarian") || d.dietary.includes("Gluten-Free"))
  ).length;
  if (dietaryDishesEl) dietaryDishesEl.textContent = dietaryCount;

  // Games players count
  const cornholePlayers = cornholeState.length * 2;
  const volleyballPlayers = volleyballState.length;
  if (totalPlayersEl) totalPlayersEl.textContent = cornholePlayers + volleyballPlayers;
}

function renderGames() {
  // Render Cornhole
  const cList = document.getElementById("cornhole-teams-list");
  const cCount = document.getElementById("cornhole-count");
  if (cCount) cCount.textContent = cornholeState.length;
  if (cList) {
    cList.innerHTML = cornholeState
      .map(
        (t) => `
        <li class="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span class="font-bold text-stone-900">${escapeHtml(t.name)}</span>
            ${t.street ? `<span class="text-stone-400">(${escapeHtml(t.street)})</span>` : ""}
          </div>
          <button onclick="removeCornholeTeam('${t.id}')" class="text-stone-300 hover:text-rose-500 p-1">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </li>
      `
      )
      .join("");
  }

  // Render Volleyball
  const vList = document.getElementById("volleyball-players-list");
  const vCount = document.getElementById("volleyball-count");
  if (vCount) vCount.textContent = volleyballState.length;
  if (vList) {
    vList.innerHTML = volleyballState
      .map(
        (p) => `
        <li class="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span class="font-bold text-stone-900">${escapeHtml(p.name)}</span>
            ${p.street ? `<span class="text-stone-400">(${escapeHtml(p.street)})</span>` : ""}
          </div>
          <button onclick="removeVolleyballPlayer('${p.id}')" class="text-stone-300 hover:text-rose-500 p-1">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </li>
      `
      )
      .join("");
  }
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  // Potluck Dish Form Submission
  const dishForm = document.getElementById("potluck-dish-form");
  if (dishForm) {
    dishForm.addEventListener("submit", handleAddDish);
  }

  // Cornhole Sign-up Form
  const cornholeForm = document.getElementById("cornhole-signup-form");
  if (cornholeForm) {
    cornholeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("cornhole-team-name");
      const streetInput = document.getElementById("cornhole-street");
      if (!nameInput || !nameInput.value.trim()) return;

      const newTeam = {
        id: "c-" + Date.now(),
        name: nameInput.value.trim(),
        street: streetInput ? streetInput.value.trim() : ""
      };

      cornholeState.push(newTeam);
      saveCornhole();
      renderGames();
      renderStats();
      nameInput.value = "";
      if (streetInput) streetInput.value = "";
      showToast("Cornhole team registered! See you on the boards!");
      triggerCelebration();
    });
  }

  // Volleyball Sign-up Form
  const volleyballForm = document.getElementById("volleyball-signup-form");
  if (volleyballForm) {
    volleyballForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("volleyball-player-name");
      const streetInput = document.getElementById("volleyball-street");
      if (!nameInput || !nameInput.value.trim()) return;

      const newPlayer = {
        id: "v-" + Date.now(),
        name: nameInput.value.trim(),
        street: streetInput ? streetInput.value.trim() : ""
      };

      volleyballState.push(newPlayer);
      saveVolleyball();
      renderGames();
      renderStats();
      nameInput.value = "";
      if (streetInput) streetInput.value = "";
      showToast("You're signed up for volleyball! Get ready to bump, set, spike!");
      triggerCelebration();
    });
  }

  // Category Filter Pills
  const categoryPills = document.querySelectorAll(".category-pill");
  categoryPills.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryPills.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      activeCategoryFilter = btn.dataset.filter || "all";
      renderDishes();
      lucide.createIcons();
    });
  });

  // Dietary Filter Pills
  const dietFilters = [
    { id: "dietary-filter-veg", tag: "Vegetarian" },
    { id: "dietary-filter-gf", tag: "Gluten-Free" },
    { id: "dietary-filter-nut", tag: "Nut-Free" }
  ];

  dietFilters.forEach((item) => {
    const el = document.getElementById(item.id);
    if (el) {
      el.addEventListener("click", () => {
        if (activeDietaryFilters.has(item.tag)) {
          activeDietaryFilters.delete(item.tag);
          el.classList.remove("active");
        } else {
          activeDietaryFilters.add(item.tag);
          el.classList.add("active");
        }
        renderDishes();
        lucide.createIcons();
      });
    }
  });

  // Search input & clear button
  const searchInput = document.getElementById("search-dishes-input");
  const clearBtn = document.getElementById("clear-search-btn");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (clearBtn) {
        if (searchQuery.trim().length > 0) {
          clearBtn.classList.remove("hidden");
        } else {
          clearBtn.classList.add("hidden");
        }
      }
      renderDishes();
      lucide.createIcons();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchQuery = "";
      clearBtn.classList.add("hidden");
      renderDishes();
      lucide.createIcons();
    });
  }

  // Reset Filters button in empty state
  const resetFiltersBtn = document.getElementById("reset-filters-btn");
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      activeCategoryFilter = "all";
      activeDietaryFilters.clear();
      searchQuery = "";
      if (searchInput) searchInput.value = "";
      if (clearBtn) clearBtn.classList.add("hidden");

      document.querySelectorAll(".category-pill").forEach((p) => p.classList.remove("active"));
      const allPill = document.querySelector('.category-pill[data-filter="all"]');
      if (allPill) allPill.classList.add("active");

      document.querySelectorAll(".dietary-pill").forEach((p) => p.classList.remove("active"));

      renderDishes();
      lucide.createIcons();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById("sort-dishes-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      sortMode = e.target.value;
      renderDishes();
      lucide.createIcons();
    });
  }

  // CSV Export Button
  const exportBtn = document.getElementById("export-csv-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportPotluckToCsv);
  }

  // Sync Modal Trigger & Close
  const syncBtn = document.getElementById("cloud-sync-modal-btn");
  const footerSyncBtn = document.getElementById("footer-sync-btn");
  const syncModal = document.getElementById("sync-modal");
  const closeSyncModal = document.getElementById("close-sync-modal");
  const dismissSyncModal = document.getElementById("dismiss-sync-modal");

  const openModal = () => syncModal && syncModal.classList.remove("hidden");
  const closeModal = () => syncModal && syncModal.classList.add("hidden");

  if (syncBtn) syncBtn.addEventListener("click", openModal);
  if (footerSyncBtn) footerSyncBtn.addEventListener("click", openModal);
  if (closeSyncModal) closeSyncModal.addEventListener("click", closeModal);
  if (dismissSyncModal) dismissSyncModal.addEventListener("click", closeModal);

  // Copy share URL button
  const copyShareBtn = document.getElementById("copy-share-url-btn");
  if (copyShareBtn) {
    copyShareBtn.addEventListener("click", copyShareableUrl);
  }

  // Save Firebase Config
  const saveFirebaseBtn = document.getElementById("save-firebase-config-btn");
  if (saveFirebaseBtn) {
    saveFirebaseBtn.addEventListener("click", saveFirebaseConfig);
  }

  // Reset Demo Data Button
  const resetDataBtn = document.getElementById("reset-data-btn");
  if (resetDataBtn) {
    resetDataBtn.addEventListener("click", () => {
      if (confirm("Reset to default neighborhood dishes? Your entered items will be restored to the starting list.")) {
        dishesState = [...DEFAULT_DISHES];
        cornholeState = [...DEFAULT_CORNHOLE_TEAMS];
        volleyballState = [...DEFAULT_VOLLEYBALL_PLAYERS];
        saveDishes();
        saveCornhole();
        saveVolleyball();
        renderAll();
        showToast("Restored neighborhood demo dishes!");
      }
    });
  }
}

// ================= FORM SUBMISSION =================
function handleAddDish(e) {
  e.preventDefault();

  const contributorName = document.getElementById("contributor-name").value.trim();
  const contributorStreet = document.getElementById("contributor-street").value.trim();
  const dishName = document.getElementById("dish-name").value.trim();
  const dishCategory = document.getElementById("dish-category").value;
  const dishServings = document.getElementById("dish-servings").value;
  const dishNotes = document.getElementById("dish-notes").value.trim();

  // Dietary tags
  const dietaryCheckboxes = document.querySelectorAll('input[name="dietary"]:checked');
  const dietaryTags = Array.from(dietaryCheckboxes).map((cb) => cb.value);

  if (!contributorName || !dishName) {
    alert("Please enter your name and dish name.");
    return;
  }

  // Create new dish object
  const newDish = {
    id: "dish-" + Date.now(),
    name: dishName,
    contributor: contributorName,
    street: contributorStreet,
    category: dishCategory,
    servings: dishServings,
    dietary: dietaryTags,
    notes: dishNotes,
    isHostProvided: false,
    likes: 1,
    createdAt: Date.now()
  };

  // Prepend to list
  dishesState.unshift(newDish);
  saveDishes();

  // Reset form
  e.target.reset();

  // Render updates
  renderAll();

  // Celebratory confetti & toast feedback
  triggerCelebration();
  showToast(`Added "${dishName}" to the potluck! Thank you, ${contributorName}!`);

  // Scroll to dishes list and highlight the new item
  const container = document.getElementById("dishes-section");
  if (container) {
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  setTimeout(() => {
    const newCard = document.querySelector(`[data-dish-id="${newDish.id}"]`);
    if (newCard) {
      newCard.classList.add("ring-2", "ring-amber-500", "scale-[1.01]");
      setTimeout(() => {
        newCard.classList.remove("ring-2", "ring-amber-500", "scale-[1.01]");
      }, 2500);
    }
  }, 400);
}

// ================= ACTIONS: LIKE & DELETE =================
window.likeDish = function (id) {
  const dish = dishesState.find((d) => d.id === id);
  if (dish) {
    dish.likes = (dish.likes || 0) + 1;
    saveDishes();
    renderDishes();
    lucide.createIcons();

    // Minor confetti puff
    if (typeof confetti === "function") {
      confetti({
        particleCount: 15,
        spread: 40,
        origin: { y: 0.7 }
      });
    }
  }
};

window.deleteDish = function (id) {
  const dish = dishesState.find((d) => d.id === id);
  if (!dish) return;

  if (confirm(`Are you sure you want to remove "${dish.name}" from the potluck?`)) {
    dishesState = dishesState.filter((d) => d.id !== id);
    saveDishes();
    renderAll();
    showToast(`Removed "${dish.name}"`);
  }
};

window.removeCornholeTeam = function (id) {
  cornholeState = cornholeState.filter((t) => t.id !== id);
  saveCornhole();
  renderGames();
  renderStats();
};

window.removeVolleyballPlayer = function (id) {
  volleyballState = volleyballState.filter((p) => p.id !== id);
  saveVolleyball();
  renderGames();
  renderStats();
};

// ================= CONFETTI & NOTIFICATIONS =================
function triggerCelebration() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className =
    "toast-enter bg-stone-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-stone-700 pointer-events-auto max-w-sm";
  toast.innerHTML = `
    <span class="text-amber-400">✨</span>
    <span class="flex-grow">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("toast-enter");
    toast.classList.add("toast-leave");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ================= EXPORT & SHARING =================
function exportPotluckToCsv() {
  if (dishesState.length === 0) {
    alert("No dishes to export yet!");
    return;
  }

  const headers = ["Dish Name", "Contributor", "Street / House", "Category", "Servings", "Dietary Info", "Notes"];
  const rows = dishesState.map((d) => [
    `"${(d.name || "").replace(/"/g, '""')}"`,
    `"${(d.contributor || "").replace(/"/g, '""')}"`,
    `"${(d.street || "").replace(/"/g, '""')}"`,
    `"${(d.category || "").replace(/"/g, '""')}"`,
    `"${(d.servings || "").replace(/"/g, '""')}"`,
    `"${(d.dietary || []).join(", ").replace(/"/g, '""')}"`,
    `"${(d.notes || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `cooks_crossing_potluck_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("Exported potluck list to CSV!");
}

function copyShareableUrl() {
  try {
    // Encode current dishes into URL query string for effortless sharing across neighbors
    const cleanDishes = dishesState.slice(0, 30); // keep reasonable URL length
    const jsonStr = JSON.stringify(cleanDishes);
    const encoded = encodeURIComponent(btoa(jsonStr));
    const shareUrl = `${window.location.origin}${window.location.pathname}?party_data=${encoded}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("Copied snapshot link with current dishes to clipboard!");
    });
  } catch (e) {
    console.error("Failed to generate share URL:", e);
    showToast("Current URL ready to share!");
  }
}

function checkUrlParamsForData() {
  try {
    const params = new URLSearchParams(window.location.search);
    const partyData = params.get("party_data");
    if (partyData) {
      const decoded = atob(decodeURIComponent(partyData));
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge without losing existing user entries
        const existingIds = new Set(dishesState.map((d) => d.id));
        parsed.forEach((item) => {
          if (!existingIds.has(item.id)) {
            dishesState.push(item);
          }
        });
        saveDishes();
        showToast("Loaded shared potluck dishes from link!");
      }
    }
  } catch (e) {
    console.warn("Could not parse party_data from URL", e);
  }
}

// ================= OPTIONAL FIREBASE CLOUD SYNC =================
function initFirebaseIfConfigured() {
  try {
    const savedConfig = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
    if (!savedConfig) return;

    const config = JSON.parse(savedConfig);
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    firebaseDb = firebase.firestore();

    // Update status indicator
    const label = document.getElementById("sync-status-label");
    const icon = document.getElementById("sync-status-icon");
    if (label) label.textContent = "Live Cloud Sync";
    if (icon) icon.className = "w-4 h-4 text-emerald-500 animate-pulse";

    // Listen to real-time updates from cloud
    firebaseDb.collection("cooks_crossing_potluck").doc("current_event")
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (Array.isArray(data.dishes)) {
            dishesState = data.dishes;
            localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(dishesState));
            renderAll();
          }
        }
      });
  } catch (e) {
    console.warn("Firebase initialization skipped or failed:", e);
  }
}

function saveFirebaseConfig() {
  const input = document.getElementById("firebase-config-input");
  if (!input || !input.value.trim()) {
    localStorage.removeItem(STORAGE_KEYS.FIREBASE_CONFIG);
    showToast("Reset to browser local storage.");
    return;
  }

  try {
    const parsed = JSON.parse(input.value.trim());
    localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(parsed));
    initFirebaseIfConfigured();
    showToast("Cloud configuration saved successfully!");
  } catch (e) {
    alert("Invalid JSON format. Please paste the Firebase config object provided in the Firebase Console.");
  }
}

function syncToFirebase() {
  if (!firebaseDb) return;
  try {
    firebaseDb.collection("cooks_crossing_potluck").doc("current_event").set({
      dishes: dishesState,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {
    console.error("Failed to sync to Firebase:", e);
  }
}

// ================= UTILITIES =================
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
