// 歌星看板 CORS proxy（只允許白名單網域）
const ALLOW = [
  'news.google.com',
  'zh.wikipedia.org',
  'ja.wikipedia.org',
  'en.wikipedia.org',
  'itunes.apple.com',
];

exports.handler = async (event) => {
  const cors = { 'Access-Control-Allow-Origin': '*' };
  const target = (event.queryStringParameters || {}).url;
  if (!target) return { statusCode: 400, headers: cors, body: 'missing url' };

  let u;
  try { u = new URL(target); } catch { return { statusCode: 400, headers: cors, body: 'bad url' }; }
  if (!ALLOW.includes(u.hostname)) return { statusCode: 403, headers: cors, body: 'host not allowed' };

  const headers = { 'User-Agent': 'Mozilla/5.0 (StarBoard; Netlify Function)' };
  if (u.hostname === 'zh.wikipedia.org') headers['Accept-Language'] = 'zh-TW';

  try {
    const r = await fetch(u.toString(), { headers });
    const body = await r.text();
    return {
      statusCode: r.status,
      headers: {
        ...cors,
        'Content-Type': r.headers.get('content-type') || 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
      },
      body,
    };
  } catch (e) {
    return { statusCode: 502, headers: cors, body: 'fetch failed: ' + e.message };
  }
};
