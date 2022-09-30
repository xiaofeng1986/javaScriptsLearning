import fetch from 'node-fetch'

    let fundCodeList = '000051,000071,000216,000478,000563,000614,000727,000942,000968,001052,001092,001180,001469,001513,001552,001717,002656,002708,004424,004752,006327,012348,014424,050025,090010,100032,100038,110020,110022,110027,160119,161017,164906,270048,340001,502010,519915'
    let cnStockCode = "sz159920,sz159938,sz159938,sz164906,sh512880,sh512980,sh513050,sh513180,sh515180"
    let usStockCode = 'KWEB';
    let marketstackToken = '05327ef078e71229a2753ea591a42731';
    const assertPricelist = [];

async function queryValue() {

    //Query FundPrice   
    let apiResponse = await fetch('https://api.doctorxiong.club/v1/fund?code=' + fundCodeList);
    let responseData = await apiResponse.json();
    addFundToPriceList(responseData);

    // Query ExchangeRate
    let apiResponseExchangeRate = await fetch('https://openexchangerates.org/api/latest.json?app_id=2d85a84363ac401dbd674abf15a45c30');
    let responseDataExchangeRate = await apiResponseExchangeRate.json();
    let USDCNYExchangeRateTimestamp = responseDataExchangeRate.timestamp;
    let USDCNYExchangeRate = responseDataExchangeRate.rates.CNY;
    let GBPCNYExchangeRate = USDCNYExchangeRate/ responseDataExchangeRate.rates.GBP;
    let EURCNYExchangeRate = USDCNYExchangeRate/ responseDataExchangeRate.rates.EUR;
    let JPYCNYExchangeRate = USDCNYExchangeRate/ responseDataExchangeRate.rates.JPY;
    
    const assertPriceObjectEUR = new assertPrice("EURCNY", USDCNYExchangeRateTimestamp, EURCNYExchangeRate, false);
    assertPricelist.push(assertPriceObjectEUR);
    const assertPriceObjectGBP = new assertPrice("GBPCNY", USDCNYExchangeRateTimestamp, GBPCNYExchangeRate, false);
    assertPricelist.push(assertPriceObjectGBP);
    const assertPriceObjectJPY = new assertPrice("JPYCNY", USDCNYExchangeRateTimestamp, JPYCNYExchangeRate, false);
    assertPricelist.push(assertPriceObjectJPY);
    const assertPriceObjectUSD = new assertPrice("USDCNY", USDCNYExchangeRateTimestamp, USDCNYExchangeRate, false);
    assertPricelist.push(assertPriceObjectUSD);
    

    //Query CN Stock price
    let apiResponseChinaStock = await fetch('https://qt.gtimg.cn/q=' + cnStockCode) //腾讯
    let apiResponseChinaStockData = await apiResponseChinaStock.text();
    let elementsChinaStock = apiResponseChinaStockData.split(";");
    elementsChinaStock.pop();

    for (let stockRecord of elementsChinaStock) {
        let stock = stockRecord.split("~");
        let stockCode = stock[2];
        let stockDate = stock[30].substr(0, 7);
        let stockPrice = parseFloat(stock[3]);
        // console.log(stockCode + " - " + stockDate +  " - " + stockPrice);
        const assertPriceObject = new assertPrice(stockCode, stockDate, stockPrice, true);
        assertPricelist.push(assertPriceObject);
    }
    
    // Query US StockPrice
    let apiResponseStock = await fetch('http://api.marketstack.com/v1/eod/latest?access_key=05327ef078e71229a2753ea591a42731&symbols=' + usStockCode);
    let responseDataStock = await apiResponseStock.json();
    for (let record of responseDataStock.data) {
    
        let stockPrice = record.close;
        let stockSymbol = record.symbol;
        let stockDate = record.date;
        //  console.log(stockSymbol + " - " + stockDate +  " - " + stockPrice);

        const stockPriceObject = new assertPrice(stockSymbol, stockDate, stockPrice, true);
        assertPricelist.push(stockPriceObject);
    }

    // Update Crypt and Update
    let apiBTCResponseCrypt = await fetch('https://rest.coinapi.io/v1/exchangerate/BTC/USD?apikey=F5EED9BE-FF36-4E40-A10B-71331E44C042');
    let responseBTCDataCrypt = await apiBTCResponseCrypt.json();
    let BTCPrice = responseBTCDataCrypt.rate;
    let BTCDateTime = responseBTCDataCrypt.time;
    const assertPriceObjectBTC = new assertPrice("BTC", BTCDateTime, BTCPrice, true);
    assertPricelist.push(assertPriceObjectBTC);

    let apiETHResponseCrypt = await fetch('https://rest.coinapi.io/v1/exchangerate/ETH/USD?apikey=F5EED9BE-FF36-4E40-A10B-71331E44C042');
    let responseETHDataCrypt = await apiETHResponseCrypt.json();
    let ETHPrice = responseETHDataCrypt.rate;
    let ETHDateTime = responseETHDataCrypt.time;
    const assertPriceObjectETH = new assertPrice("ETH", ETHDateTime, ETHPrice, true);
    assertPricelist.push(assertPriceObjectETH);

    let apiUSDTResponseCrypt = await fetch('https://rest.coinapi.io/v1/exchangerate/USDT/USD?apikey=F5EED9BE-FF36-4E40-A10B-71331E44C042');
    let responseUSDTDataCrypt = await apiUSDTResponseCrypt.json();
    let USDTPrice = responseUSDTDataCrypt.rate;
    let USDTDateTime = responseUSDTDataCrypt.time;
    const assertPriceObjectUSDT = new assertPrice("USDT", USDTDateTime, USDTPrice, true);
    assertPricelist.push(assertPriceObjectUSDT);

    // Update Price 
    for (let assertPriceUpdatesRecord of assertPricelist) {
        console.log(assertPriceUpdatesRecord.assertCode + " - " +
             String(assertPriceUpdatesRecord.assertDate).substr(0, 10) + " -更新后净值： " +
            assertPriceUpdatesRecord.assertPrice);

    }

    for (let assertPriceUpdatesRecord of assertPricelist) {
        console.log(assertPriceUpdatesRecord.assertPrice);

    }

}


function assertPrice(code, date, price, isStockFlag) {
    this.assertCode = code;
    this.assertDate = date;
    this.assertPrice = price;
    this.isStockFlag = isStockFlag;
}

function addFundToPriceList(responseData) {
    for (let record of responseData.data) {
        let fundCode = record.code;
        let fundName = record.name;
        let fundNetworthDate = record.netWorthDate;
        let fundNetworth = record.netWorth;
        //  console.log(fundCode + " - " + fundName + " - " + fundNetworthDate +  " - " + fundNetworth);

        const assertPriceObject = new assertPrice(fundCode, fundNetworthDate, fundNetworth);
        assertPricelist.push(assertPriceObject);
    }
}

console.log( queryValue());
