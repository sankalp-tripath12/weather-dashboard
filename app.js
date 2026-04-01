//Select HTML Elements
const cityInput = document.getElementById('cityInput')
const searchBtn = document.getElementById('searchBtn')
const weatherGrid = document.getElementById('weatherGrid')
const loader = document.getElementById('loader')
const errorBox = document.getElementById('errorBox')

//Listen for Button Click
searchBtn.addEventListener('click', function() {
  const city = cityInput.value.trim()
  
  if (city === '') {
    alert('Please enter a city name!')
    return
  }

  getWeather(city)
})
cityInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') searchBtn.click()
})

//Fetch Data from API
async function getWeather(city) {
  const API_KEY = '60b8af4e1acb046904817674104b2e6b'
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`

  // Show loader, hide error
  loader.style.display = 'block'
  errorBox.style.display = 'none'
  weatherGrid.innerHTML = ''

  try {
    const response = await fetch(url)
    const data = await response.json()

    // Hide loader
    loader.style.display = 'none'

    if (data.cod !== 200) {{
      errorBox.style.display = 'block'
      errorBox.textContent = 'City not found! Please try again.'
      return
    }

    displayWeather(data)

  } catch (error) {
    loader.style.display = 'none'
    errorBox.style.display = 'block'
    errorBox.textContent = 'Something went wrong. Check your internet!'
  }
}

// Display Data on Page
function displayWeather(data) {
  const card = `
    <div class="card">
      <h2>${data.name}, ${data.sys.country}</h2>
      <p>🌡️ Temperature: ${data.main.temp}°C</p>
      <p>🌤️ Condition: ${data.weather[0].main}</p>
      <p>💧 Humidity: ${data.main.humidity}%</p>
      <p>💨 Wind Speed: ${data.wind.speed} m/s</p>
    </div>
  `
  weatherGrid.innerHTML = card
}