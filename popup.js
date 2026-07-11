//the number of chars to what a coin name must be abbreviated to (to contain popup width)
const maxChars = 10;
//the number of how many coins will displayed
const numOfcoinsToDisplay = 100;
// the number of max precision to decimal notation in prices
const maxPrecision = 8;
//the counter value to match coins against (can implement dynamicity)
const counterValue = "$";

//updates the dom element that show last time data was updated
const setLastUpdateTime = (lastUpdateTime) => {
  let formattedDate = lastUpdateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  let updateSpan = document.getElementById("update-time");
  updateSpan.innerText = formattedDate;
}
//returns an abbreviated and dotted string
const abbreviate = (str, length) => {
    if (str.length <= length) {
      return str;
    }
    return str.substring(0, length) + "...";
};

const formatPrice = (price, maxPrecision) => {
    if (price <= 0) {
        let formattedPrice = price.toFixed(maxPrecision);
        return formattedPrice; 
    }
    if (price > 0.01) {
        let formattedPrice = (Math.round(Number(price) * 100) / 100).toFixed(2);
        return formattedPrice.toLocaleString();
    }
    else {
        let formattedPrice = price.toFixed(1-Math.floor(Math.log(price)/Math.log(10)));
        return formattedPrice;
    }
};

//generate a coin slot with name and price for every coin in the data stored locally
const generateCoinSlots = (data, num) => {
  for (let i = 0; i < num; i++) {
    let coin = data[i];
    let price = formatPrice(coin.current_price, maxPrecision);
    let box = document.getElementById("coin-box");
    let priceCell = document.createElement("div");
    priceCell.classList.add("price-cell");
    priceCell.setAttribute("id", coin.id);
    let h3 = document.createElement("h3");
    priceCell.appendChild(h3);
    let rankSpan = document.createElement("span");
    rankSpan.classList.add("coin-rank");
    rankSpan.innerText = coin.market_cap_rank + " "; 
    h3.appendChild(rankSpan);
    let nameSpan = document.createElement("span");
    nameSpan.classList.add("coin-name");
    let link = document.createElement("a");
    link.setAttribute("href", `https://www.coingecko.com/en/coins/${coin.id}`);
    link.setAttribute("target", "_blank");
    let coinName = abbreviate(coin.name, maxChars);
      if(coinName !== coin.name) {
      let tooltip = document.createElement("div");
      tooltip.classList.add("tooltip");
      tooltip.innerText = coin.name;
      priceCell.appendChild(tooltip);
    } 
    link.innerText = coinName;
    nameSpan.appendChild(link);
    h3.appendChild(nameSpan);
    let priceSpan = document.createElement("span");
    priceSpan.classList.add("coin-price");
    priceSpan.innerText = counterValue + price;
    h3.appendChild(priceSpan);
    box.appendChild(priceCell);
  }
 };

//updates the title to show how many coins will be listed if the value is dynamic (per settings)
const updateTitle = (num) => {
  let title = document.querySelector("#title > span:first-of-type");
  title.innerText = num;
}

//retrieve the coin data (or other) stored locally by the service worker 
function getCachedData(key) {
  return new Promise((resolve) => {
    const cacheKey = key;
    const timestampKey = `${key}_timestamp`;
    chrome.storage.local.get([cacheKey, timestampKey], (result) => {
      // Check if the data actually exists in the result
      if (result[cacheKey]) {
        resolve({
          data: result[cacheKey],
          timestamp: result[timestampKey]
        });
      } else { 
        resolve(null); 
      }
    });
  });
}
//calls the functions to populate the popup with the data retrieved from cache
//(gets executed every time the popup opens)
getCachedData('topCoins').then(result => {
  if (result) {
    console.log("Data found:", result.data);
    console.log("Timestamp:", result.timestamp);
    generateCoinSlots(result.data, numOfcoinsToDisplay);
    setLastUpdateTime(result.timestamp);
    updateTitle(numofcoinsToDisplay);
  } else {
    console.log("No data found for this key");
  }
});

