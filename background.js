//hardcoded number of how many coin list to fetch
//(use a large number and narrow how many coins are displayed in popup.js
let numOfCoinsToGet = 100;
//harcoded calue for decimal precision of prices to fetch
let decimalPrecision = 8;
//handles refresh rate of data in minutes
let dataRefreshRate = 1;
// the higer the number the more stale data is allowed to be used (in ms)
let stalenessThreshold = 50 * 1000; // 50 seconds 


// immediate first fetch only on a fresh install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('This is a first install!');
  } else if (details.reason === 'update') {
    const thisVersion = chrome.runtime.getManifest().version;
    console.log('Updated from ' + details.previousVersion + ' to ' + thisVersion + '!');
  }
  // fetch immediately on first run AND on every update
  fetchBitcoinPrice()
    .then(updateBadgeFromCache)
    .catch(e => console.error('Initial BTC fetch failed:', e));
  getCoinList(numOfCoinsToGet, decimalPrecision);
});
// set badge color + register the recurring alarm (runs on every wake)
const initApp = () => {
  chrome.action.setBadgeBackgroundColor({ color: '#1B73E8' });
  chrome.alarms.create('refreshData', { periodInMinutes: dataRefreshRate});
};

//Unified, consistent console logging for all data events
const logEvent = (timestamp, eventType, dataType, details = '') => {
  let readableTime;
  // If already a human-readable "HH:MM" or "HH:MM:SS" string, use as-is
  if (typeof timestamp === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(timestamp.trim())) {
    readableTime = timestamp.trim();
  } else {
    // Otherwise treat as epoch ms (number) or Date and format it
    const date = (timestamp instanceof Date) ? timestamp : new Date(timestamp);
    readableTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  const detailStr = details ? ` (${details})` : '';
  console.log(`[${readableTime}] ${eventType}: ${dataType}${detailStr}`);
};

//retrieve the data cached for a specific key if it is still valid (less than 1 minute old)
function getCachedData(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key, `${key}_timestamp`], (result) => {
      const now = Date.now();
      const timestamp = result[`${key}_timestamp`];
      // Check if timestamp exists and is less than 1 minute old
      if (timestamp && (now - timestamp) < stalenessThreshold) {
        resolve({ data: result[key], timestamp });
      } else {
        resolve(null);         // Return null if stale or missing
      }
    });
  });
}
//stores data in cache with a timestamp
function setCachedData(key, data) {
  const timestamp = Date.now();
  chrome.storage.local.set({
    [key]: data,
    [`${key}_timestamp`]: timestamp
  });
}

function fetchWithRetry(url, retries = 3, backoff = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response failed');
        const data = await response.json();
        resolve(data);
      } catch (error) {
        if (retries <= 0) reject(error);
        setTimeout(attempt, backoff * 2);
      }
    };
    attempt();
  });
}

//fetch data for the coin list and store it in cache
const getCoinList = (num, precision) => {
    const cacheKey = 'CoinList';
    // Check cache first
    getCachedData(cacheKey).then(cachedData => {
        if (cachedData) {
            return cachedData;
        }
        // Cache miss - fetch fresh data
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${num}&page=1&sparkline=false&precision=${precision}`;      
        fetchWithRetry(url)
            .then(data => {
                // Set to cache only on successful fetch
                logEvent(Date.now(), 'DATA_DOWNLOADED', 'Coin List', `Fetched coinlist of: ${data.length} coins.`);
                setCachedData(cacheKey, data);
            })
            .catch(error => console.error("There was a problem while fetching the coin data.", error));
    });
};

//formats the price to be shown in proper shortened version on the ext badge  
function formatPrice(value) {
  if (value >= 1e6) {
    const scaled = value / 1e6;
    let str = scaled.toPrecision(3).replace(/\.?0+$/, '');
    if ((str + 'm').length > 4) {
      str = scaled.toPrecision(2).replace(/\.?0+$/, '');
    }
    return str + 'm';
  } else if (value >= 1e3) {
    const scaled = value / 1e3;
    let str = scaled.toPrecision(3).replace(/\.?0+$/, '');
    if ((str + 'k').length > 4) {
      str = scaled.toPrecision(2).replace(/\.?0+$/, '');
    }
    return str + 'k';
  } else {
    return Math.round(value).toString();
  }
}


//fetch bitcoin price and store it in cache
function fetchBitcoinPrice() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
  return fetchWithRetry(url)
    .then(data => {
      logEvent(Date.now(), 'DATA_DOWNLOADED', 'BTC Price', `Fetched BTC price: ${data.bitcoin.usd}`);
      setCachedData('btcPrice', data.bitcoin.usd);
    });
}

//update the badge from cached data if available
function updateBadgeFromCache() {
  getCachedData('btcPrice')
    .then(cachedData => {
      if (cachedData) {
        const formattedPrice = formatPrice(cachedData.data);
        chrome.action.setBadgeText({ text: formattedPrice });
        const stalenessSec = Math.round((Date.now() - cachedData.timestamp) / 1000);
        logEvent(Date.now(), 'DATA_FROM_CACHE', 'BTC Price', `Badge refreshed - data staleness: ${stalenessSec}s`);
      } else {
        fetchBitcoinPrice();
      }
    });
}

initApp();

// Alarms to refresh data routinely 
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refreshData') {
    fetchBitcoinPrice()
      .then(updateBadgeFromCache)
      .catch(e => console.error('BTC fetch failed:', e));
    getCoinList(numOfCoinsToGet, decimalPrecision);
  }
});



