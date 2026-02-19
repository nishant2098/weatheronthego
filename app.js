const locationInput = document.querySelector('#locationInput');
const searchBtn = document.querySelector('#searchBtn');
const statusBox = document.querySelector('#status');
const resultBox = document.querySelector('#result');

const placeTitle = document.querySelector('#placeTitle');
const confidenceBadge = document.querySelector('#confidenceBadge');
const sourceLine = document.querySelector('#sourceLine');
const sourceMeta = document.querySelector('#sourceMeta');

const currentTemp = document.querySelector('#currentTemp');
const currentSummary = document.querySelector('#currentSummary');
const dayNightLabel = document.querySelector('#dayNightLabel');
const tempMin = document.querySelector('#tempMin');
const tempMax = document.querySelector('#tempMax');
const rainChance = document.querySelector('#rainChance');
const windSpeed = document.querySelector('#windSpeed');
const windDir = document.querySelector('#windDir');
const forecastGrid = document.querySelector('#forecastGrid');
const metarBox = document.querySelector('#metarBox');

let map;
let marker;
let radarLayer;

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
  56: 'Freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Slight rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Freezing rain',
  71: 'Slight snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  85: 'Snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm'
};

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.add('visible');
  statusBox.style.color = isError ? '#9f2f26' : 'inherit';
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
      source: 'Likely stronger station/model blend due to denser nearby reporting infrastructure.'
    };
  }

  if (population >= 15000) {
    return {
      label: 'MEDIUM CONFIDENCE',
      className: 'medium',
      source: 'Model grid estimate with potentially limited nearby station influence.'
    };
  }

  return {
    label: 'LOWER CONFIDENCE',
    className: 'low',
    source: 'Sparse-area modeled estimate; local microclimates may differ from this grid-point view.'
  };
}

function weatherTheme(weatherCode, isDay) {
  const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95];
  const snowCodes = [71, 73, 75, 77, 85, 86];
  const cloudyCodes = [1, 2, 3, 45, 48];

  if (rainCodes.includes(weatherCode)) return 'theme-rain';
  if (snowCodes.includes(weatherCode)) return 'theme-snow';
  if (cloudyCodes.includes(weatherCode)) return 'theme-cloudy';
  return isDay ? 'theme-clear-day' : 'theme-clear-night';
}

function setDynamicTheme(weatherCode, isDay) {
  document.body.className = weatherTheme(weatherCode, isDay);
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
  url.searchParams.set('current', 'temperature_2m,weather_code,is_day,wind_speed_10m,wind_direction_10m');
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
  );
  url.searchParams.set('timezone', timezone || 'auto');
  url.searchParams.set('forecast_days', '7');

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load weather data.');

  return res.json();
}

function setupMap(lat, lon, name) {
  if (!map) {
    map = L.map('map');

    const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    });

    const satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles &copy; Esri' }
    );

    street.addTo(map);

    L.control
      .layers({ Street: street, Satellite: satellite }, {}, { position: 'topright' })
      .addTo(map);
  }

  map.setView([lat, lon], 9);

  if (marker) marker.remove();
  marker = L.marker([lat, lon]).addTo(map).bindPopup(`Data location: ${name}`).openPopup();

  if (radarLayer) radarLayer.remove();
  radarLayer = L.tileLayer('https://tilecache.rainviewer.com/v2/radar/nowcast_0/256/{z}/{x}/{y}/2/1_1.png', {
    attribution: 'Radar &copy; RainViewer',
    opacity: 0.45,
    errorTileUrl: ''
  }).addTo(map);

  sourceMeta.textContent =
    'Primary weather values are model/grid-based from Open-Meteo for this coordinate. Radar overlay is from RainViewer when tile availability permits.';
}

function renderForecast(weather) {
  forecastGrid.innerHTML = '';

  weather.daily.time.forEach((dateStr, index) => {
    const date = new Date(dateStr);
    const dayLabel = date.toLocaleDateString(undefined, { weekday: 'short' });
    const summary = WMO_MAP[weather.daily.weather_code[index]] || 'Unknown';

    const card = document.createElement('article');
    card.className = 'forecast-day';
    card.innerHTML = `
      <h4>${dayLabel}</h4>
      <p class="subtle">${dateStr}</p>
      <p><strong>${Math.round(weather.daily.temperature_2m_max[index])}°</strong> / ${Math.round(weather.daily.temperature_2m_min[index])}°</p>
      <p>${summary}</p>
      <p>Rain: ${weather.daily.precipitation_probability_max[index] ?? 0}%</p>
    `;

    forecastGrid.appendChild(card);
  });
}

async function fetchNearestMetar(lat, lon) {
  // Best-effort call. API shape can vary by provider updates.
  const url = new URL('https://aviationweather.gov/api/data/metar');
  url.searchParams.set('format', 'json');
  url.searchParams.set('hours', '2');
  url.searchParams.set('bbox', `${lon - 1},${lat - 1},${lon + 1},${lat + 1}`);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('METAR service unavailable');
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      metarBox.innerHTML =
        'No nearby METAR station report found in this area right now. (Common in remote regions.)';
      return;
    }

    const nearest = data[0];
    const station = nearest.station_id || nearest.icaoId || 'Unknown station';
    const obsTime = nearest.observation_time || nearest.obsTime || 'Unknown time';
    const raw = nearest.raw_text || nearest.rawOb || 'Raw METAR unavailable';

    metarBox.innerHTML = `
      <p><strong>Station:</strong> ${station}</p>
      <p><strong>Observed:</strong> ${obsTime}</p>
      <p><strong>Raw METAR:</strong> ${raw}</p>
      <p class="subtle">Nearest-airport station reporting is separate from the model/grid weather used above.</p>
    `;
  } catch (error) {
    metarBox.innerHTML =
      'Could not fetch METAR data at the moment. Weather forecast remains available from Open-Meteo.';
  }
}

function renderWeather(geo, weather) {
  const confidence = getConfidence(geo);
  const isDay = Boolean(weather.current.is_day);

  placeTitle.textContent = `${geo.name}, ${geo.country}`;
  confidenceBadge.textContent = confidence.label;
  confidenceBadge.className = `badge ${confidence.className}`;
  sourceLine.textContent = confidence.source;

  currentTemp.textContent = Math.round(weather.current.temperature_2m);
  currentSummary.textContent = WMO_MAP[weather.current.weather_code] || 'Unknown conditions';
  dayNightLabel.textContent = isDay ? 'Daytime conditions' : 'Nighttime conditions';
  tempMin.textContent = Math.round(weather.daily.temperature_2m_min[0]);
  tempMax.textContent = Math.round(weather.daily.temperature_2m_max[0]);
  rainChance.textContent = weather.daily.precipitation_probability_max[0] ?? 0;
  windSpeed.textContent = Math.round(weather.current.wind_speed_10m);
  windDir.textContent = Math.round(weather.current.wind_direction_10m);

  setDynamicTheme(weather.current.weather_code, isDay);
  setupMap(geo.latitude, geo.longitude, geo.name);
  renderForecast(weather);
  fetchNearestMetar(geo.latitude, geo.longitude);

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
