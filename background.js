//hardcoded number of how many top coins to fetch
//(use a large number and narrow how many coins are displayed in popup.js
let numOfTopCoins = 100;
//harcoded calue for decimal precision of prices to fetch
let decimalPrecision = 8;
//handles refresh rate of data in milliseconds
const dataRefreshRate = 60000;

//check whether new version is installed and intialize data + badges
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("This is a first install!");
    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});
//initialize badge and data
const initApp = () => {
    chrome.action.setBadgeBackgroundColor({ color:'#1B73E8'});
    // Fetch initial data and update badge when ready
    fetchBitcoinPrice()
        .then(() => updateBadgeFromCache())
        .catch(error => console.error('Initial BTC fetch failed:', error));
    getTopCoins(numOfTopCoins, decimalPrecision);
};

//retrieve the data cached for a specific key if it is still valid (less than 1 minute old)
function getCachedData(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key, `${key}_timestamp`], (result) => {
      const now = Date.now();
      const timestamp = result[`${key}_timestamp`];
      // Check if timestamp exists and is less than 1 minute old
      if (timestamp && (now - timestamp) < 60000) {
        resolve(result[key]);  // Return the cached data
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

//fetch data for the top coins
const getTopCoins = (num, precision) => {
    const cacheKey = 'topCoins';
    // Check cache first
    getCachedData(cacheKey).then(cachedData => {
        if (cachedData) {
            console.log("coin data loaded from cache");
            return cachedData;
        }
        // Cache miss - fetch fresh data
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${num}&page=1&sparkline=false&precision=${precision}`;      
        fetchWithRetry(url)
            .then(data => {
                // Set to cache only on successful fetch
                setCachedData(cacheKey, data);
                console.log("coin data refreshed at: " + 
                    new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));
            })
            .catch(error => console.error("There was a problem while fetching the coin data.", error));
    });
};

//formats the price to be shown in proper shortened version on the ext badge  
const formatPrice = n => {
    let price = n;
    let magnitude = "";
    if (price >= 1e6){
        price = (+(price / 1e6).toFixed(1)); //add '+ "M"' if logic allows longer text to fit in the badge;
        magnitude = "m";
    }     
    else if (price >= 1e3) {
        price = (+(price / 1e3).toFixed(1)); //add '+ "K"' if logic allows longer text to fit in the badge;
        magnitude = "k";
    }
    else if (price < 1e3){
        price = Math.round(price);
    }
    price = String(price);
    return price.length <= 3 ? price + magnitude : price;
};

//refresh bitcoin price to be shown in the badge 
const refreshBadge = () => {
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&precision=2";
    fetch(url)
    .then(response => {
        if (!response.ok) {throw new Error("Network response was not ok");}
        return response.json();
    })
    .then(response => {
        let price = formatPrice(response["bitcoin"]["usd"]);
        chrome.action.setBadgeText({text: price});
        console.log("badge refreshed at: " + Date.now());
    })
    .catch(error => {
        console.error("There was a problem with the badge update.", error);
    });
};

//fetch bitcoin price and store it in cache
function fetchBitcoinPrice() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
  return fetchWithRetry(url)
    .then(data => {
      setCachedData('btcPrice', data.bitcoin.usd);
    });
}

//update the badge from cached data if available
function updateBadgeFromCache() {
  getCachedData('btcPrice')
    .then(cachedPrice => {
      if (cachedPrice) {
        const formattedPrice = formatPrice(cachedPrice);
        chrome.action.setBadgeText({ text: formattedPrice });
      } else {
        fetchBitcoinPrice();
      }
    });
}

initApp();

//refresh badge data routine
setInterval(() => {
  fetchBitcoinPrice()
    .then(() => updateBadgeFromCache())
    .catch(error => console.error('BTC fetch failed:', error));}, dataRefreshRate);
//refresh coin data routine
setInterval(() => getTopCoins(numOfTopCoins, decimalPrecision), dataRefreshRate);

