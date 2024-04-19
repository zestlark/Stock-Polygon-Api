const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs').promises;

const app = express();
const port = 3001;

app.use(cors());

const apiKey = 'VREWRgjkTCMTAiqZWKlEaiw6C6T1tup0';
const stockss = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'SNAP', 'TSLA', 'NVDA', 'NFLX', 'CRM', 'ADBE', 'PYPL', 'INTC', 'CSCO', 'QCOM', 'IBM', 'AMD', 'ORCL', 'TXN', 'MU', 'UBER'];

let stockData = {}

const writeInfile = async () => {
    await fs.writeFile('stockData.json', JSON.stringify(stockData, null, 2));
}

const fetchStockData = async (stock) => {
    try {
        const date = '2023-01-09';
        const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${stock}/range/1/day/${date}/${date}?apiKey=${apiKey}`);

        const openPrice = response.data.results[0]?.o || 120;
        const refreshInterval = Math.floor(Math.random() * (5 - 1 + 1)) + 1;

        stockData[stock] = {
            openPrice,
            refreshInterval,
            date: date,
        };

        setInterval(async () => await updateStockPrices(stock), refreshInterval * 1000);
        await writeInfile()
    } catch (error) {
        console.error(`Error fetching data for ${stock}:`);
    }
};

const updateStockPrices = async (stock) => {
    const openPrice = stockData[stock].openPrice
    const randomValue = (Math.random() * 10 - 5).toFixed(2);
    const updatedPrice = (parseFloat(openPrice) + parseFloat(randomValue)).toFixed(2);
    stockData[stock].openPrice = updatedPrice;
    await writeInfile()
    // console.log('updated stock ' + stock + ' price ' + updatedPrice);
};


app.get('/stock/:stockname', (req, res) => {
    const stockname = req.params.stockname.toUpperCase();

    if (stockData[stockname]) {
        res.json({ stockname, price: stockData[stockname].openPrice });
    } else {
        res.status(404).json({ error: 'Stock not found' });
    }
});

app.get('/stocklist', (req, res) => {
    res.json({ list: stockss });
});

let i = 0;

fetchStockData(stockss[i]);
const fetchallstocks = setInterval(() => {
    if (i == stockss.length - 1) {
        i = 0;
        clearInterval(fetchallstocks)
    } else {
        i++;
        fetchStockData(stockss[i]);
    }
}, 12000)


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
