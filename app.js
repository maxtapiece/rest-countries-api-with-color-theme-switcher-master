// =========================
// APPLICATION STATE
// =========================

const app = {
  countries: [],
  filteredCountries: [],
  selectedRegion: "",
  searchQuery: "",
  darkMode: false,
};

// =========================
// CONSTANTS
// =========================

const STORAGE_KEY = "rest-countries-theme";

// =========================
// DOM ELEMENTS
// =========================

const countriesGrid = document.getElementById("countries-grid");
const searchInput = document.getElementById("country-search");
const regionFilter = document.getElementById("region-filter");
const themeToggle = document.querySelector(".theme-toggle");
const countryDetail = document.getElementById("country-detail");
const backButton = document.querySelector(".back-btn");

// =========================
// THEME
// =========================

function updateThemeButton() {
  if (!themeToggle) return;

  themeToggle.innerHTML = app.darkMode
    ? `
      <i class="fa-solid fa-sun theme-icon" aria-hidden="true"></i>
      <span>Light Mode</span>
    `
    : `
      <i class="fa-regular fa-moon theme-icon" aria-hidden="true"></i>
      <span>Dark Mode</span>
    `;
}

function applyTheme() {
  document.body.classList.toggle("dark-theme", app.darkMode);
  updateThemeButton();
}

function loadTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  app.darkMode = savedTheme === "dark";

  applyTheme();
}

function toggleTheme() {
  app.darkMode = !app.darkMode;

  localStorage.setItem(STORAGE_KEY, app.darkMode ? "dark" : "light");

  applyTheme();
}

// =========================
// DATA
// =========================

async function loadCountries() {
  showLoadingState();

  try {
    const response = await fetch("./data.json");

    if (!response.ok) {
      throw new Error("Failed to load countries");
    }

    const countries = await response.json();

    app.countries = countries;
    app.filteredCountries = countries;

    if (countriesGrid) {
      renderCountries();
    }

    if (countryDetail) {
      renderCountryDetail();
    }
  } catch (error) {
    console.error(error);
    showErrorState();
  }
}

// =========================
// HELPERS
// =========================

function getCountryCodeFromURL() {
  const params = new URLSearchParams(window.location.search);

  return params.get("code");
}

function findCountryByCode(code) {
  return app.countries.find((country) => country.alpha3Code === code);
}

function getBorderCountries(borderCodes = []) {
  return borderCodes.map((code) => findCountryByCode(code)).filter(Boolean);
}

function formatNumber(number) {
  return number ? number.toLocaleString() : "N/A";
}

function getCountryCurrencies(country) {
  return (
    country.currencies?.map((currency) => currency.name).join(", ") || "N/A"
  );
}

function getCountryLanguages(country) {
  return (
    country.languages?.map((language) => language.name).join(", ") || "N/A"
  );
}

// =========================
// FILTERING
// =========================

function filterCountries() {
  app.filteredCountries = app.countries.filter((country) => {
    const matchesSearch = country.name
      .toLowerCase()
      .includes(app.searchQuery.toLowerCase());

    const matchesRegion =
      app.selectedRegion === "" || country.region === app.selectedRegion;

    return matchesSearch && matchesRegion;
  });

  renderCountries();
}

// =========================
// RENDERING
// =========================

function showLoadingState() {
  if (countriesGrid) {
    countriesGrid.innerHTML = `
      <p class="loading-message">Loading countries...</p>
    `;
  }

  if (countryDetail) {
    countryDetail.innerHTML = `
      <p class="loading-message">Loading country...</p>
    `;
  }
}

function showErrorState() {
  if (countriesGrid) {
    countriesGrid.innerHTML = `
      <p class="error-message">Sorry, countries could not be loaded.</p>
    `;
  }

  if (countryDetail) {
    countryDetail.innerHTML = `
      <p class="error-message">Sorry, country details could not be loaded.</p>
    `;
  }
}

function createCountryCardHTML(country) {
  return `
    <a
      href="./detail.html?code=${country.alpha3Code}"
      class="country-card"
      aria-label="View details for ${country.name}"
    >
      <img
        src="${country.flags.png}"
        alt="${country.name} flag"
        class="country-flag"
      />

      <div class="country-card-content">
        <h2 class="country-name">${country.name}</h2>

        <div class="country-info">
          <p><strong>Population:</strong> ${formatNumber(country.population)}</p>
          <p><strong>Region:</strong> ${country.region || "N/A"}</p>
          <p><strong>Capital:</strong> ${country.capital || "N/A"}</p>
        </div>
      </div>
    </a>
  `;
}

function renderCountries() {
  if (!countriesGrid) return;

  if (app.filteredCountries.length === 0) {
    countriesGrid.innerHTML = `
      <p class="empty-state">No countries found.</p>
    `;
    return;
  }

  countriesGrid.innerHTML = app.filteredCountries
    .map(createCountryCardHTML)
    .join("");
}

function createBorderCountriesHTML(borderCountries) {
  if (borderCountries.length === 0) {
    return `<p>No border countries</p>`;
  }

  return borderCountries
    .map((border) => {
      return `
        <a
          href="./detail.html?code=${border.alpha3Code}"
          class="border-link"
        >
          ${border.name}
        </a>
      `;
    })
    .join("");
}

function renderCountryDetail() {
  if (!countryDetail) return;

  const code = getCountryCodeFromURL();
  const country = findCountryByCode(code);

  if (!country) {
    countryDetail.innerHTML = `<p class="empty-state">Country not found.</p>`;
    return;
  }

  const borderCountries = getBorderCountries(country.borders);

  countryDetail.innerHTML = `
    <img
      src="${country.flags.svg}"
      alt="${country.name} flag"
      class="detail-flag"
    />

    <div class="detail-content">
      <h2 class="detail-name">${country.name}</h2>

      <div class="detail-information">
        <div class="detail-info-group">
          <p><strong>Native Name:</strong> ${country.nativeName || "N/A"}</p>
          <p><strong>Population:</strong> ${formatNumber(country.population)}</p>
          <p><strong>Region:</strong> ${country.region || "N/A"}</p>
          <p><strong>Sub Region:</strong> ${country.subregion || "N/A"}</p>
          <p><strong>Capital:</strong> ${country.capital || "N/A"}</p>
        </div>

        <div class="detail-info-group">
          <p><strong>Top Level Domain:</strong> ${
            country.topLevelDomain?.join(", ") || "N/A"
          }</p>
          <p><strong>Currencies:</strong> ${getCountryCurrencies(country)}</p>
          <p><strong>Languages:</strong> ${getCountryLanguages(country)}</p>
        </div>
      </div>

      <div class="border-section">
        <h3>Border Countries:</h3>

        <div class="border-countries">
          ${createBorderCountriesHTML(borderCountries)}
        </div>
      </div>
    </div>
  `;
}

// =========================
// EVENT HANDLERS
// =========================

function handleSearch(event) {
  app.searchQuery = event.target.value.trim();

  filterCountries();
}

function handleRegionFilter(event) {
  app.selectedRegion = event.target.value;

  filterCountries();
}

function handleBackButtonClick() {
  history.back();
}

// =========================
// EVENT LISTENERS
// =========================

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

if (searchInput) {
  searchInput.addEventListener("input", handleSearch);
}

if (regionFilter) {
  regionFilter.addEventListener("change", handleRegionFilter);
}

if (backButton) {
  backButton.addEventListener("click", handleBackButtonClick);
}

// =========================
// INITIALIZATION
// =========================

loadTheme();
loadCountries();
