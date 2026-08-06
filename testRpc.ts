import https from 'https';

const RPC = 'https://node.sidrachain.com/';

function rpcCall(method: string, params: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
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

async function test() {
  const FACTORY = '0xCFE41fb5dA87916D84E7F22889087b4Ff7163cDE';
  const WSDA = '0xE4095a910209D7BE03B55D02F40d4554B1666182';
  const AIR = '0x4cE5ef02F9aEbb80BB4e327F76DFb95eac1B69A6';

  const data = '0x1698ee82' + padAddress(AIR) + padAddress(WSDA) + padUint24(3000);
  const res = await rpcCall('eth_call', [{ to: FACTORY, data }, 'latest']);
  console.log('getPool AIR/WSDA res:', res);

  if (res?.result) {
    const pool = '0x' + res.result.slice(26);
    console.log('Pool address:', pool);

    const resSlot0 = await rpcCall('eth_call', [{ to: pool, data: '0x3850c7bd' }, 'latest']);
    console.log('slot0 res:', resSlot0);

    const resToken0 = await rpcCall('eth_call', [{ to: pool, data: '0x0efe9a77' }, 'latest']);
    console.log('token0 res:', resToken0);
  }
}

test();
