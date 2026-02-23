#!/bin/bash
# NEAR/USD Price Oracle

echo "Fetching prices..."
CG=$(curl -s "https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd")
CG_PRICE=$(echo $CG | jq -r '.near.usd')
echo "CoinGecko: $CG_PRICE"

KC=$(curl -s "https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=NEAR-USDT")
KC_PRICE=$(echo $KC | jq -r '.data.price')
echo "KuCoin: $KC_PRICE"

KR=$(curl -s "https://api.kraken.com/0/public/Ticker?pair=NEARUSD")
KR_PRICE=$(echo $KR | jq -r '.result.NEARUSD.c[0]')
echo "Kraken: $KR_PRICE"

OKX=$(curl -s "https://www.okx.com/api/v5/market/ticker?instId=NEAR-USDT")
OKX_PRICE=$(echo $OKX | jq -r '.data[0].last')
echo "OKX: $OKX_PRICE"

echo "All prices: $CG_PRICE, $KC_PRICE, $KR_PRICE, $OKX_PRICE"
