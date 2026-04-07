// =============================================
// SELECT HTML ELEMENTS
// We grab references to all elements we need
// to read from or write to in the DOM.
// =============================================
const cityInput    = document.getElementById('cityInput');
const searchBtn    = document.getElementById('searchBtn');
const weatherGrid  = document.getElementById('weatherGrid');
const loader       = document.getElementById('loader');
const errorBox     = document.getElementById('errorBox');
const filterSelect = document.getElementById('filter');
const sortSelect   = document.getElementById('sort');
const darkToggle   = document.getElementById('darkToggle');
const favoritesList = document.getElementById('favoritesList');
const htmlRoot     = document.getElementById('htmlRoot');

// =============================================
// STATE
// weatherData holds all fetched city objects.
// We use this array with HOFs to filter/sort/search.
// =============================================
let weatherData = [];

// =============================================
// DARK MODE
// We store the user's preference in localStorage
// so it persists even after page refresh.
// =============================================

// On page load, check if user previously enabled dark mode
if (localStorage.getItem('darkMode') === 'true') {
  htmlRoot.classList.add('dark');      // Apply dark styles
  darkToggle.textContent = '☀️ Light Mode'; // Update button label
}

// When dark mode button is clicked, toggle the dark class
darkToggle.addEventListener('click', function () {
  htmlRoot.classList.toggle('dark');

  // Check if dark mode is now ON or OFF
  const isDark = htmlRoot.classList.contains('dark');

  // Update button text to show what clicking will do next
  darkToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';

  // Save preference to localStorage so it survives page refresh
  localStorage.setItem('darkMode', isDark);
});

// =============================================
// FAVORITES (localStorage)
// Favorites are city names saved by the user.
// We store them as a JSON array in localStorage.
// =============================================

// Load favorites from localStorage when page loads.
// If nothing is saved yet, use an empty array.
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Render favorite buttons on page load (if any were saved before)
renderFavorites();

// =============================================
// EVENT LISTENERS
// =============================================

// Search button click → fetch weather for typed city
searchBtn.addEventListener('click', function () {
  const city = cityInput.value.trim(); // Remove extra spaces

  if (city === '') {
    alert('Please enter a city name!');
    return; // Stop here if input is empty
  }

  getWeather(city); // Call the API function
});

// Press Enter in input → same as clicking Search button
cityInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') searchBtn.click();
});

// Filter dropdown changed → re-render cards with new filter
filterSelect.addEventListener('change', renderData);

// Sort dropdown changed → re-render cards with new sort
sortSelect.addEventListener('change', renderData);

// NOTE: We removed the cityInput "input" listener from before.
// Typing in the input should ONLY be used for searching a new city,
// not for live-filtering already-added cards — that was confusing UX.

// =============================================
// API CALL FUNCTION
// Fetches weather data for a given city name.
// Uses async/await to handle the asynchronous fetch.
// =============================================
async function getWeather(city) {
  const API_KEY = '60b8af4e1acb046904817674104b2e6b';

  // Build the API URL — units=metric gives Celsius
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

  // Show loader while waiting for API response
  loader.style.display = 'block';

  // Hide any previous error
  errorBox.style.display = 'none';

  try {
    // Make the HTTP request to OpenWeatherMap
    const response = await fetch(url);

    // Parse the JSON body from the response
    const data = await response.json();

    // Hide loader now that data has arrived
    loader.style.display = 'none';

    // API returns cod: 200 for success, "404" for city not found
    if (data.cod !== 200) {
      errorBox.style.display = 'block';
      errorBox.textContent = '❌ City not found! Please try again.';
      return; // Stop further execution
    }

    // Prevent duplicate: check if this city is already in our array
    // .some() returns true if any item matches the condition
    if (weatherData.some(item => item.name === data.name)) {
      alert(`${data.name} is already added!`);
      return;
    }

    // Add the new city's data object to our array
    weatherData.push(data);

    // Clear the input field after successful search
    cityInput.value = '';

    // Re-render all cards with updated data
    renderData();

  } catch (error) {
    // This runs if the network request itself failed (e.g. no internet)
    loader.style.display = 'none';
    errorBox.style.display = 'block';
    errorBox.textContent = '🌐 Something went wrong. Check your internet!';
  }
}

// =============================================
// RENDER DATA — SEARCH + FILTER + SORT
// This is the main display logic.
// Every time filter or sort changes, this runs.
// It uses Array HOFs as required by the project.
// =============================================
function renderData() {
  // Spread operator creates a copy so we don't mutate original array
  let updatedData = [...weatherData];

  // Read current values from dropdowns
  const filterValue = filterSelect.value;
  const sortValue   = sortSelect.value;

  // --- FILTER using .filter() HOF ---
  // If user selected a specific weather type (not "all"),
  // keep only items whose weather condition matches
  if (filterValue !== 'all') {
    updatedData = updatedData.filter(function (item) {
      return item.weather[0].main === filterValue;
    });
  }

  // --- SORT using .sort() HOF ---
  // .sort() compares two items (a, b) at a time.
  // Returning a - b sorts ascending (low to high).
  // Returning b - a sorts descending (high to low).
  if (sortValue === 'asc') {
    updatedData.sort(function (a, b) {
      return a.main.temp - b.main.temp; // Low → High
    });
  } else if (sortValue === 'desc') {
    updatedData.sort(function (a, b) {
      return b.main.temp - a.main.temp; // High → Low
    });
  }

  // Pass the processed array to the display function
  displayWeather(updatedData);
}

// =============================================
// DISPLAY WEATHER CARDS
// Takes an array of weather objects and builds
// one card per city inside the weatherGrid div.
// Uses forEach() — correct HOF for DOM side effects.
// (map() is for transforming arrays, not for DOM work)
// =============================================
function displayWeather(arr) {
  // Clear previous cards before rendering new ones
  weatherGrid.innerHTML = '';

  // If no cities match the current filter, show a message
  if (arr.length === 0) {
    weatherGrid.innerHTML = '<p style="color: var(--text); text-align:center;">No cities match the current filter.</p>';
    return;
  }

  // forEach() loops over each city data object
  arr.forEach(function (data) {
    // Create a new div element for this city's card
    const card = document.createElement('div');
    card.className = 'card';

    // Check if this city is already in favorites
    const isFav = favorites.includes(data.name);

    // Build the inner HTML of the card
    card.innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <p>🌡️ Temp: ${data.main.temp}°C</p>
      <p>🌤️ Weather: ${data.weather[0].main}</p>
      <p>💧 Humidity: ${data.main.humidity}%</p>
      <p>💨 Wind: ${data.wind.speed} m/s</p>
      <button class="fav-btn" data-city="${data.name}">
        ${isFav ? '❤️ Saved' : '🤍 Save Favorite'}
      </button>
    `;

    // Append the completed card to the grid
    weatherGrid.appendChild(card);
  });

  // Attach click listeners to all favorite buttons
  // We do this AFTER cards are in the DOM
  attachFavListeners();
}

// =============================================
// FAVORITES LOGIC
// =============================================

// Attach click events to every "Save Favorite" button on the cards
function attachFavListeners() {
  // querySelectorAll returns a NodeList of all fav buttons
  const favBtns = document.querySelectorAll('.fav-btn');

  favBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // data-city attribute holds the city name for this button
      const cityName = btn.getAttribute('data-city');

      // Check if it's already saved
      const alreadySaved = favorites.includes(cityName);

      if (alreadySaved) {
        // Remove from favorites using filter() HOF
        // Keep every city that is NOT this one
        favorites = favorites.filter(function (c) {
          return c !== cityName;
        });
      } else {
        // Add to favorites
        favorites.push(cityName);
      }

      // Save updated favorites array to localStorage as a JSON string
      localStorage.setItem('favorites', JSON.stringify(favorites));

      // Re-render cards (to update button label) and favorites list
      renderData();
      renderFavorites();
    });
  });
}

// Build the favorites section below the cards
function renderFavorites() {
  // Clear current list
  favoritesList.innerHTML = '';

  // If no favorites saved, show a message
  if (favorites.length === 0) {
    favoritesList.innerHTML = '<p style="color: var(--text); font-size: 0.9rem;">No favorites saved yet.</p>';
    return;
  }

  // Create a clickable button for each saved favorite city
  // Using forEach() to loop over the favorites array
  favorites.forEach(function (cityName) {
    const btn = document.createElement('button');
    btn.className = 'fav-city-btn';
    btn.textContent = `⭐ ${cityName}`;

    // Clicking a favorite city button re-fetches its weather
    btn.addEventListener('click', function () {
      getWeather(cityName);
    });

    favoritesList.appendChild(btn);
  });
}