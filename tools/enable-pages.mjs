const token = process.env.GH_TOKEN;
if (!token) throw new Error('GH_TOKEN required');
const repo = 'executor0707/arknights-idle';
async function api(path, method = 'GET', body) {
  const res = await fetch('https://api.github.com' + path, {
    method,
    headers: { authorization: 'token ' + token, 'user-agent': 'RhodesIslandIdle', accept: 'application/vnd.github+json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}
let cur = await api(`/repos/${repo}/pages`);
console.log('pages current', cur.status, cur.data?.html_url || cur.data?.message);
if (cur.status === 404) {
  const created = await api(`/repos/${repo}/pages`, 'POST', { source: { branch: 'gh-pages', path: '/' } });
  console.log('pages create', created.status, created.data?.html_url || created.data?.message);
} else {
  const upd = await api(`/repos/${repo}/pages`, 'PUT', { source: { branch: 'gh-pages', path: '/' } });
  console.log('pages update', upd.status, upd.data?.html_url || upd.data?.message);
}
