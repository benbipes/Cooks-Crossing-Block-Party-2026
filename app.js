/**
 * Cooks Crossing Block Party & Pig Pickin' 2026
 * Interactive Potluck Coordination Script with Multi-Device Sync
 */

// ================= STORAGE KEYS =================
const STORAGE_KEYS = {
  DISHES: "cooks_crossing_dishes_v3",
  GSHEET_URL: "cooks_crossing_gsheet_url_v3",
  FIREBASE_CONFIG: "cooks_crossing_firebase_config_v3"
};

// ================= STATE MANAGEMENT =================
let dishesState = [];
let activeCategoryFilter = "all";
let activeDietaryFilters = new Set();
let searchQuery = "";
let sortMode = "newest";
let activeGSheetUrl = "";
let firebaseDb = null;
let syncPollInterval = null;

// ================= INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
  resolveCloudConfig();
  loadData();
  initCountdown();
  setupEventListeners();
  checkUrlParamsForData();
  renderAll();
  lucide.createIcons();

  // If cloud sync is active, start periodic poll for background updates
  if (activeGSheetUrl) {
    syncPollInterval = setInterval(fetchFromGoogleSheet, 25000);
  }
});

// Resolve cloud settings from config.js and localStorage
function resolveCloudConfig() {
  // Priority: config.js first (shared across all devices), then localStorage override
  if (typeof CLOUD_CONFIG !== "undefined") {
    if (CLOUD_CONFIG.googleSheetWebAppUrl && CLOUD_CONFIG.googleSheetWebAppUrl.trim()) {
      activeGSheetUrl = CLOUD_CONFIG.googleSheetWebAppUrl.trim();
    }
  }

  // Fallback to localStorage if configured on this device
  if (!activeGSheetUrl) {
    const localUrl = localStorage.getItem(STORAGE_KEYS.GSHEET_URL);
    if (localUrl && localUrl.trim()) {
      activeGSheetUrl = localUrl.trim();
    }
  }
}

// Load persistent data from LocalStorage & Cloud
function loadData() {
  // 1. Instant load from local cache
  try {
    const savedDishes = localStorage.getItem(STORAGE_KEYS.DISHES);
    if (savedDishes) {
      dishesState = JSON.parse(savedDishes);
    } else {
      dishesState = [];
    }
  } catch (e) {
    console.error("Error loading dishes from localStorage:", e);
    dishesState = [];
  }

  // 2. Fetch latest live data from Google Sheets or Firebase if configured
  if (activeGSheetUrl) {
    fetchFromGoogleSheet();
  } else {
    initFirebaseIfConfigured();
  }

  updateSyncStatusBadge();
}

function saveLocalCache() {
  try {
    localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(dishesState));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

// ================= GOOGLE SHEETS LIVE SYNC =================
function fetchFromGoogleSheet() {
  if (!activeGSheetUrl) return;

  fetch(activeGSheetUrl)
    .then((res) => res.json())
    .then((data) => {
      if (data && Array.isArray(data.dishes)) {
        // Merge with existing local dishes, avoiding duplicates
        dishesState = data.dishes;
        saveLocalCache();
        renderAll();
        updateSyncStatusBadge();
      }
    })
    .catch((err) => {
      console.warn("Could not sync with Google Sheets (check URL or permissions):", err);
    });
}

function postToGoogleSheet(dish) {
  if (!activeGSheetUrl) return;

  // Use mode: 'no-cors' with text/plain to avoid CORS preflight blocking in browsers
  fetch(activeGSheetUrl, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(dish)
  })
    .then(() => {
      // Re-fetch after 2 seconds to synchronize
      setTimeout(fetchFromGoogleSheet, 2000);
    })
    .catch((err) => {
      console.warn("Error posting dish to Google Sheet:", err);
    });
}

function updateSyncStatusBadge() {
  const icon = document.getElementById("sync-status-icon");
  const label = document.getElementById("sync-status-label");
  const modalBanner = document.getElementById("sync-modal-status-box");
  const noticeBanner = document.getElementById("cloud-sync-notice-banner");

  if (activeGSheetUrl) {
    if (icon) icon.className = "w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 animate-pulse";
    if (label) label.textContent = "Live Synced";
    if (modalBanner) {
      modalBanner.className = "bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-3.5 text-xs text-emerald-800";
      modalBanner.innerHTML = `
        <div class="flex items-center gap-2 font-bold">
          <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
          <span>Google Sheets Live Sync Connected</span>
        </div>
        <p class="text-emerald-700 mt-1">Dishes are shared in real time across all neighbors' devices!</p>
      `;
    }
    if (noticeBanner) noticeBanner.classList.add("hidden");
  } else if (firebaseDb) {
    if (icon) icon.className = "w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 animate-pulse";
    if (label) label.textContent = "Firebase Live";
    if (noticeBanner) noticeBanner.classList.add("hidden");
  } else {
    if (icon) icon.className = "w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500";
    if (label) label.textContent = "Local Mode";
    if (modalBanner) {
      modalBanner.className = "bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-3.5 text-xs text-amber-900";
      modalBanner.innerHTML = `
        <div class="flex items-center gap-2 font-bold">
          <i data-lucide="alert-circle" class="w-4 h-4 text-amber-600"></i>
          <span>Local Device Only</span>
        </div>
        <p class="text-amber-800 mt-1">Dishes are currently saved only on this phone/computer. Connect Google Sheets below so ALL neighbors see each other's dishes!</p>
      `;
    }
    if (noticeBanner) noticeBanner.classList.remove("hidden");
  }
  lucide.createIcons();
}

// ================= EVENT COUNTDOWN TIMER =================
function initCountdown() {
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
  lucide.createIcons();
}

function renderDishes() {
  const container = document.getElementById("dishes-list-container");
  const emptyState = document.getElementById("empty-dishes-state");
  const emptyTitle = document.getElementById("empty-state-title");
  const emptyDesc = document.getElementById("empty-state-desc");
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
      const matchNotes = dish.notes ? dish.notes.toLowerCase().includes(q) : false;
      if (!matchName && !matchContrib && !matchNotes) {
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
    }
    return 0;
  });

  // Render cards or empty state
  if (filtered.length === 0) {
    container.innerHTML = "";
    if (emptyState) {
      emptyState.classList.remove("hidden");
      if (dishesState.length === 0) {
        if (emptyTitle) emptyTitle.textContent = "No side dishes added yet";
        if (emptyDesc) emptyDesc.textContent = "Be the first neighbor to enter what you'll bring to the table!";
      } else {
        if (emptyTitle) emptyTitle.textContent = "No dishes match your filter";
        if (emptyDesc) emptyDesc.textContent = "Try adjusting your search query or category filters.";
      }
    }
  } else {
    if (emptyState) emptyState.classList.add("hidden");
    container.innerHTML = filtered.map((dish) => createDishCardHtml(dish)).join("");
  }

  // Update counts in category tabs & badges
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

      return `<span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${colorClass}">${tag}</span>`;
    })
    .join(" ");

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
          </div>

          <h4 class="font-display font-extrabold text-lg sm:text-xl text-stone-900 leading-snug">
            ${escapeHtml(dish.name)}
          </h4>

          <!-- Contributor -->
          <div class="flex items-center gap-2 text-xs font-medium text-stone-600 flex-wrap">
            <span class="font-bold text-stone-900 flex items-center gap-1">
              <i data-lucide="user" class="w-3.5 h-3.5 text-amber-600"></i>
              ${escapeHtml(dish.contributor)}
            </span>
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

        <!-- Right: Actions (Cheer reaction only - users not allowed to delete) -->
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

  // Top Nav Badge, Mobile Tab Badge, Dock Count & Hero Count
  const navBadge = document.getElementById("nav-dish-count-badge");
  if (navBadge) navBadge.textContent = dishesState.length;

  const mobileTabBadge = document.getElementById("mobile-tab-count-badge");
  if (mobileTabBadge) mobileTabBadge.textContent = dishesState.length;

  const dockCount = document.getElementById("dock-dish-count");
  if (dockCount) dockCount.textContent = dishesState.length;

  const heroTag = document.getElementById("hero-dish-count-tag");
  if (heroTag) heroTag.textContent = `${dishesState.length} dishes`;
}

function renderStats() {
  const totalDishesEl = document.getElementById("stat-total-dishes");
  const dietaryDishesEl = document.getElementById("stat-dietary-dishes");

  if (totalDishesEl) totalDishesEl.textContent = dishesState.length;

  // Count dietary dishes (Vegetarian or GF)
  const dietaryCount = dishesState.filter(
    (d) => d.dietary && (d.dietary.includes("Vegetarian") || d.dietary.includes("Gluten-Free"))
  ).length;
  if (dietaryDishesEl) dietaryDishesEl.textContent = dietaryCount;
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  // Potluck Dish Form Submission
  const dishForm = document.getElementById("potluck-dish-form");
  if (dishForm) {
    dishForm.addEventListener("submit", handleAddDish);
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

  window.openSyncModal = () => {
    if (syncModal) syncModal.classList.remove("hidden");
    // Pre-populate input with current URL
    const gInput = document.getElementById("gsheet-url-input");
    if (gInput && activeGSheetUrl) gInput.value = activeGSheetUrl;
  };
  window.closeSyncModal = () => syncModal && syncModal.classList.add("hidden");

  if (syncBtn) syncBtn.addEventListener("click", window.openSyncModal);
  if (footerSyncBtn) footerSyncBtn.addEventListener("click", window.openSyncModal);
  if (closeSyncModal) closeSyncModal.addEventListener("click", window.closeSyncModal);
  if (dismissSyncModal) dismissSyncModal.addEventListener("click", window.closeSyncModal);

  // Save Google Sheet URL
  const saveGSheetBtn = document.getElementById("save-gsheet-btn");
  if (saveGSheetBtn) {
    saveGSheetBtn.addEventListener("click", () => {
      const input = document.getElementById("gsheet-url-input");
      if (!input) return;
      const url = input.value.trim();
      if (!url) {
        activeGSheetUrl = "";
        localStorage.removeItem(STORAGE_KEYS.GSHEET_URL);
        showToast("Removed Google Sheet link. Switched to local storage.");
      } else {
        activeGSheetUrl = url;
        localStorage.setItem(STORAGE_KEYS.GSHEET_URL, url);
        fetchFromGoogleSheet();
        showToast("Connected to Google Sheet live sync!");
      }
      updateSyncStatusBadge();
    });
  }

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
}

// ================= FORM SUBMISSION =================
function handleAddDish(e) {
  e.preventDefault();

  const contributorName = document.getElementById("contributor-name").value.trim();
  const dishName = document.getElementById("dish-name").value.trim();
  const dishCategory = document.getElementById("dish-category").value;
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
    category: dishCategory,
    dietary: dietaryTags,
    notes: dishNotes,
    likes: 1,
    createdAt: Date.now()
  };

  // 1. Instant local update (zero-latency feedback)
  dishesState.unshift(newDish);
  saveLocalCache();

  // 2. Sync to cloud (Google Sheets or Firebase)
  if (activeGSheetUrl) {
    postToGoogleSheet(newDish);
  } else if (firebaseDb) {
    syncToFirebase();
  }

  // Reset form
  e.target.reset();

  // Render updates
  renderAll();

  // Celebratory confetti & toast feedback
  triggerCelebration();
  showToast(`Added "${dishName}" to the potluck! Thank you, ${contributorName}!`);

  // Switch to dishes tab on mobile so neighbor immediately sees their new dish
  mobileSwitchTab("dishes");

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

// ================= MOBILE VIEW TOGGLE / SEGMENTED CONTROL =================
window.mobileSwitchTab = function (tab) {
  const formSection = document.getElementById("dish-form-section");
  const dishesSection = document.getElementById("dishes-section");
  const tabBtnDishes = document.getElementById("tab-btn-dishes");
  const tabBtnForm = document.getElementById("tab-btn-form");

  if (!formSection || !dishesSection) return;

  if (tab === "form") {
    // Show form on mobile, hide dishes
    formSection.classList.remove("hidden");
    formSection.classList.add("block");
    dishesSection.classList.add("hidden");
    dishesSection.classList.remove("block");

    if (tabBtnForm) {
      tabBtnForm.classList.add("active");
      tabBtnForm.classList.remove("text-stone-600");
    }
    if (tabBtnDishes) {
      tabBtnDishes.classList.remove("active");
      tabBtnDishes.classList.add("text-stone-600");
    }

    formSection.scrollIntoView({ behavior: "smooth", block: "start" });

    setTimeout(() => {
      const nameInput = document.getElementById("contributor-name");
      if (nameInput) nameInput.focus();
    }, 400);
  } else {
    // Show dishes on mobile, hide form
    formSection.classList.add("hidden");
    formSection.classList.remove("block");
    dishesSection.classList.remove("hidden");
    dishesSection.classList.add("block");

    if (tabBtnDishes) {
      tabBtnDishes.classList.add("active");
      tabBtnDishes.classList.remove("text-stone-600");
    }
    if (tabBtnForm) {
      tabBtnForm.classList.remove("active");
      tabBtnForm.classList.add("text-stone-600");
    }

    const potluckMain = document.getElementById("potluck-main");
    if (potluckMain) {
      potluckMain.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  lucide.createIcons();
};

// Handle window resizing between mobile and desktop viewports
window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    const formSection = document.getElementById("dish-form-section");
    const dishesSection = document.getElementById("dishes-section");
    if (formSection) {
      formSection.classList.remove("hidden");
      formSection.classList.add("lg:block");
    }
    if (dishesSection) {
      dishesSection.classList.remove("hidden");
      dishesSection.classList.add("block");
    }
  }
});

// ================= ACTIONS: LIKE (UPVOTE) =================
window.likeDish = function (id) {
  const dish = dishesState.find((d) => d.id === id);
  if (dish) {
    dish.likes = (dish.likes || 0) + 1;
    saveLocalCache();
    renderDishes();
    lucide.createIcons();

    // Send like update to cloud if available
    if (activeGSheetUrl) {
      fetch(activeGSheetUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "like", id: id })
      }).catch(() => {});
    }

    if (typeof confetti === "function") {
      confetti({
        particleCount: 15,
        spread: 40,
        origin: { y: 0.7 }
      });
    }
  }
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
    alert("No dishes entered yet to export!");
    return;
  }

  const headers = ["Dish Name", "Contributor", "Category", "Dietary Info", "Notes"];
  const rows = dishesState.map((d) => [
    `"${(d.name || "").replace(/"/g, '""')}"`,
    `"${(d.contributor || "").replace(/"/g, '""')}"`,
    `"${(d.category || "").replace(/"/g, '""')}"`,
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
    const cleanDishes = dishesState.slice(0, 30);
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
        const existingIds = new Set(dishesState.map((d) => d.id));
        parsed.forEach((item) => {
          if (!existingIds.has(item.id)) {
            dishesState.push(item);
          }
        });
        saveLocalCache();
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
    let config = null;
    if (typeof CLOUD_CONFIG !== "undefined" && CLOUD_CONFIG.firebaseConfig) {
      config = CLOUD_CONFIG.firebaseConfig;
    }
    if (!config) {
      const savedConfig = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
      if (savedConfig) config = JSON.parse(savedConfig);
    }
    if (!config) return;

    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    firebaseDb = firebase.firestore();

    updateSyncStatusBadge();

    firebaseDb.collection("cooks_crossing_potluck").doc("current_event")
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (Array.isArray(data.dishes)) {
            dishesState = data.dishes;
            saveLocalCache();
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
    firebaseDb = null;
    updateSyncStatusBadge();
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
