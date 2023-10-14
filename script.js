const cityNameElement = document.getElementById('cityNameId')
const weatherMainElement = document.getElementById('weatherMainId')
const temperatureElement = document.getElementById('temperatureId')
const cityTextboxElement = document.getElementById("cityInputId")
const forecastElement = document.getElementById("forecastId")
const citySearchButtonElement = document.getElementById("citySearchButtonId")
const errorElement = document.getElementById("errorId")


const DEFAULT_CITY = 'Stockholm,Sweden'

const API_KEY = "29e7c1a3b2d9e92ed27e8c3d97d654cd"
const fetchWeatherData = async (city) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=${API_KEY}`;
    // https://api.openweathermap.org/data/2.5/weather?q=Stockholm,Sweden&units=metric&APPID=29e7c1a3b2d9e92ed27e8c3d97d654cd
    const responseFromApi = await fetch(url);
    const responseData = await responseFromApi.json();

    // Error scenario: {"cod":"404","message":"city not found"}
    if (responseData.cod === "404") {
      errorElement.innerHTML = responseData.message
      return undefined
    }

    const weatherData = {
      cityName: responseData.name,
      description: responseData.weather[0].description,
      temperature: responseData.main.temp.toFixed(1), // round to 1 decimal place
    }

    return weatherData
  } catch (error) {
    errorElement.innerHTML = JSON.stringify(error)
  }
};

const displayWeatherData = async (city) => {
  const weatherData = await fetchWeatherData(city)

  if (weatherData === undefined) {
    return
  }

  cityNameElement.innerHTML = weatherData.cityName
  weatherMainElement.innerHTML = weatherData.description
  temperatureElement.innerHTML = `${weatherData.temperature} °C`
}

const dateToDay = (date) => {
  // https://www.w3schools.com/jsref/jsref_getday.asp
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dateObj = new Date(date);
  return weekday[dateObj.getDay()];
}

const getTodayDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = today.getFullYear();
  return `${yyyy}-${mm}-${dd}`
}

const fetchAndDisplayForecastData = (city) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&APPID=${API_KEY}`
  // https://api.openweathermap.org/data/2.5/forecast?q=Stockholm,Sweden&units=metric&APPID=29e7c1a3b2d9e92ed27e8c3d97d654cd
  fetch(url)
    .then((apiResponse) => apiResponse.json())
    .then((responseData) => {
      const forecastDataArray = responseData.list
      if (!Array.isArray(forecastDataArray)) {
        errorElement.innerHTML = 'Forecast data not available!'
        return undefined
      }

      const midDayForecastDataArray = forecastDataArray.filter(forecastData => forecastData.dt_txt.includes('12:00:00') && !forecastData.dt_txt.includes(getTodayDate()))
      if (midDayForecastDataArray.length === 4) {
        midDayForecastDataArray.push(forecastDataArray[forecastDataArray.length - 1])
      }

      const forcastDivs = midDayForecastDataArray.map(midDayForecastData => `
      <div>
        <p>${dateToDay(midDayForecastData.dt_txt)}</p>
        <p>${midDayForecastData.main.temp.toFixed()} °C</p>
      </div>
    `)
      forecastElement.innerHTML = forcastDivs.join('')
    })
    .catch((error) => errorElement.innerHTML = JSON.stringify(error))
}

citySearchButtonElement.addEventListener("click", () => {
  if (cityTextboxElement.value.trim() === '') {
    return
  }

  displayWeatherData(cityTextboxElement.value.trim())
})

displayWeatherData(DEFAULT_CITY)
fetchAndDisplayForecastData(DEFAULT_CITY)
