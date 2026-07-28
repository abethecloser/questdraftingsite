// True device-emulated full-page screenshots via Chrome DevTools Protocol.
// Usage: node scripts/shot.mjs <url> <width> <outfile> [mobile]
// Requires Chrome already launched with --remote-debugging-port=9222.
import http from 'node:http';
import fs from 'node:fs';

const [url, widthArg, outFile, ...flags] = process.argv.slice(2);
const width = parseInt(widthArg, 10);
const mobile = flags.includes('mobile');
const reduced = flags.includes('reduced');

function getJSON(path) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: 9222, path }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

const list = await getJSON('/json/list');
const page = list.find((t) => t.type === 'page') || list[0];
const wsUrl = page.webSocketDebuggerUrl;
const ws = new WebSocket(wsUrl);
let id = 0;
const pending = new Map();
function send(method, params = {}) {
  return new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}
const events = {};
function once(evt) {
  return new Promise((resolve) => (events[evt] = resolve));
}

ws.addEventListener('message', (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  } else if (msg.method && events[msg.method]) {
    const cb = events[msg.method];
    delete events[msg.method];
    cb(msg.params);
  }
});

await new Promise((r) => ws.addEventListener('open', r));
await send('Page.enable');
if (reduced) {
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
}
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height: 900,
  deviceScaleFactor: mobile ? 2 : 1,
  mobile,
  screenWidth: width,
  screenHeight: 900,
});
const loaded = once('Page.loadEventFired');
await send('Page.navigate', { url });
await loaded;
await new Promise((r) => setTimeout(r, 1400)); // let fonts/reveals/3D settle

// full-page metrics
const { cssContentSize } = await send('Page.getLayoutMetrics');
const full = await send('Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: true,
  clip: {
    x: 0,
    y: 0,
    width: cssContentSize.width,
    height: cssContentSize.height,
    scale: 1,
  },
});
fs.writeFileSync(outFile, Buffer.from(full.data, 'base64'));
console.log(
  'wrote ' + outFile + ' at layout width ' + cssContentSize.width + 'x' + Math.round(cssContentSize.height)
);
ws.close();
process.exit(0);
