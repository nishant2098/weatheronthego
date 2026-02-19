const locationInput = document.querySelector('#locationInput');
const searchBtn = document.querySelector('#searchBtn');
const statusBox = document.querySelector('#status');
const resultBox = document.querySelector('#result');

const placeTitle = document.querySelector('#placeTitle');
const confidenceBadge = document.querySelector('#confidenceBadge');
const sourceLine = document.querySelector('#sourceLine');
const currentTemp = document.querySelector('#currentTemp');
const currentSummary = document.querySelector('#currentSummary');
const tempMin = document.querySelector('#tempMin');
const tempMax = document.querySelector('#tempMax');
const rainChance = document.querySelector('#rainChance');
const windSpeed = document.querySelector('#windSpeed');
const windDir = document.querySelector('#windDir');

const WMO_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm'
};

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.add('visible');
  statusBox.style.color = isError ? '#9f2f26' : '#1c2440';
}

function clearStatus() {
  statusBox.textContent = '';
  statusBox.classList.remove('visible');
}

function getConfidence(geoResult) {
  const population = geoResult.population ?? 0;

  if (population >= 200000) {
    return {
      label: 'HIGH CONFIDENCE',
      className: 'high',
      source:
        'Data blend likely benefits from nearby weather stations + model/satellite coverage.'
    };
  }

  if (population >= 15000) {
    return {
      label: 'MEDIUM CONFIDENCE',
      className: 'medium',
      source:
        'Semi-urban or small-town estimate from model grids, potentially with limited station influence.'
    };
  }

  return {
    label: 'LOWER CONFIDENCE',
    className: 'low',
    source:
      'Sparse-area modeled estimate (useful for planning, but local microclimates may differ).'
  };
}

async function geocode(query) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to geocode location.');

  const data = await res.json();
  if (!data.results?.length) {
    throw new Error('No location found. Try a nearby district or larger town name.');
  }

  return data.results[0];
}

async function getWeather(lat, lon, timezone) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m');
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_probability_max');
  url.searchParams.set('timezone', timezone || 'auto');
  url.searchParams.set('forecast_days', '1');

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load weather data.');

  return res.json();
}

function renderWeather(geo, weather) {
  const confidence = getConfidence(geo);
  placeTitle.textContent = `${geo.name}, ${geo.country}`;
  confidenceBadge.textContent = confidence.label;
  confidenceBadge.className = `badge ${confidence.className}`;
  sourceLine.textContent = confidence.source;

  currentTemp.textContent = Math.round(weather.current.temperature_2m);
  currentSummary.textContent = WMO_MAP[weather.current.weather_code] || 'Unknown conditions';
  tempMin.textContent = Math.round(weather.daily.temperature_2m_min[0]);
  tempMax.textContent = Math.round(weather.daily.temperature_2m_max[0]);
  rainChance.textContent = weather.daily.precipitation_probability_max[0] ?? 0;
  windSpeed.textContent = Math.round(weather.current.wind_speed_10m);
  windDir.textContent = Math.round(weather.current.wind_direction_10m);

  resultBox.classList.remove('hidden');
}

async function runSearch() {
  const query = locationInput.value.trim();
  if (!query) {
    setStatus('Please enter a location name.', true);
    return;
  }

  setStatus(`Searching for "${query}" and fetching weather...`);
  resultBox.classList.add('hidden');

  try {
    const geo = await geocode(query);
    const weather = await getWeather(geo.latitude, geo.longitude, geo.timezone);
    renderWeather(geo, weather);
    clearStatus();
  } catch (error) {
    setStatus(error.message || 'Something went wrong.', true);
  }
}

searchBtn.addEventListener('click', runSearch);
locationInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') runSearch();
});
