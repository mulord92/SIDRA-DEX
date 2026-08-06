import https from 'https';
import fs from 'fs';
import { SIDRA_ALL_86_TOKENS } from './src/server/dataProviders/sidraTokensCatalog.js';

const RPC = 'https://node.sidrachain.com/';
const FACTORY = '0xCFE41fb5dA87916D84E7F22889087b4Ff7163cDE';
const WSDA = '0xE4095a910209D7BE03B55D02F40d4554B1666182';

function rpcBatchCall(requests: any[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(requests);
    const req = https.request(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function padAddress(addr: string): string {
  return addr.toLowerCase().replace('0x', '').padStart(64, '0');
}

function padUint24(num: number): string {
  return num.toString(16).padStart(64, '0');
}

function sqrtToPrice(sqrtPriceX96: bigint): number {
  try {
    const ratio = Number((sqrtPriceX96 * sqrtPriceX96 * 10n ** 18n) / (2n ** 192n)) / 1e18;
    return isFinite(ratio) && ratio > 0 ? ratio : 0;
  } catch { return 0; }
}

async function fetchAllLivePrices() {
  const catalog = SIDRA_ALL_86_TOKENS;
  console.log(`Starting RPC fetch for all ${catalog.length} tokens...`);

  // Step 1: Batch getPool calls for fee tiers 3000, 500, 10000
  const getPoolRequests: any[] = [];
  let reqId = 1;

  for (const t of catalog) {
    if (t.symbol === 'SDA' || t.symbol === 'WSDA') continue;
    const addr = t.address;
    [3000, 500, 10000].forEach(fee => {
      const data = '0x1698ee82' + padAddress(addr) + padAddress(WSDA) + padUint24(fee);
      getPoolRequests.push({ jsonrpc: '2.0', id: reqId++, method: 'eth_call', params: [{ to: FACTORY, data }, 'latest'] });
    });
  }

  console.log(`Sending ${getPoolRequests.length} getPool RPC batch requests...`);
  const poolResponses = await rpcBatchCall(getPoolRequests);
  console.log(`Received ${poolResponses.length} pool responses.`);

  const tokenPoolMap: Record<string, string> = {};
  let respIdx = 0;

  for (const t of catalog) {
    if (t.symbol === 'SDA' || t.symbol === 'WSDA') continue;
    // Check responses for fee 3000, 500, 10000
    const r3000 = poolResponses[respIdx++];
    const r500 = poolResponses[respIdx++];
    const r10000 = poolResponses[respIdx++];

    const isValidPool = (r: any) => r?.result && r.result !== '0x' && r.result !== '0x0000000000000000000000000000000000000000000000000000000000000000';

    if (isValidPool(r3000)) {
      tokenPoolMap[t.symbol] = '0x' + r3000.result.slice(26);
    } else if (isValidPool(r500)) {
      tokenPoolMap[t.symbol] = '0x' + r500.result.slice(26);
    } else if (isValidPool(r10000)) {
      tokenPoolMap[t.symbol] = '0x' + r10000.result.slice(26);
    }
  }

  console.log('Found pools for tokens:', Object.keys(tokenPoolMap).length);

  // Step 2: Batch slot0 calls for all found pools
  const slot0Requests: any[] = [];
  const tokenListWithPools = Object.keys(tokenPoolMap);

  tokenListWithPools.forEach((symbol, idx) => {
    const pool = tokenPoolMap[symbol];
    slot0Requests.push({ jsonrpc: '2.0', id: idx + 1, method: 'eth_call', params: [{ to: pool, data: '0x3850c7bd' }, 'latest'] });
  });

  console.log(`Sending ${slot0Requests.length} slot0 RPC batch requests...`);
  const slot0Responses = await rpcBatchCall(slot0Requests);

  const prices: Record<string, number> = {
    'SDA': 1.0,
    'WSDA': 1.0
  };

  tokenListWithPools.forEach((symbol, idx) => {
    const resp = slot0Responses[idx];
    if (resp?.result && resp.result !== '0x') {
      const sqrtHex = '0x' + resp.result.slice(2, 66);
      const sqrtBigInt = BigInt(sqrtHex);
      let p = sqrtToPrice(sqrtBigInt);

      const tokenObj = catalog.find(c => c.symbol === symbol)!;
      // In Uniswap V3, if token < WSDA, p is token1/token0 so price in WSDA is 1/p
      if (tokenObj.address.toLowerCase() < WSDA.toLowerCase()) {
        p = p > 0 ? 1 / p : 0;
      }

      if (p > 0) {
        prices[symbol] = Number(p.toFixed(6));
      }
    }
  });

  console.log('--- Live Token Prices in SDA from SidraDEX Pools ---');
  console.log(JSON.stringify(prices, null, 2));

  fs.writeFileSync('live_prices.json', JSON.stringify(prices, null, 2));
}

fetchAllLivePrices();
