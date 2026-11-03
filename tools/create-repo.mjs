const token = process.env.GH_TOKEN;
if (!token) throw new Error('GH_TOKEN required');
const api = async (path, method = 'GET', body) => {
  const res = await fetch('https://api.github.com' + path, {
    method,
    headers: { authorization: 'token ' + token, 'user-agent': 'RhodesIslandIdle', accept: 'application/vnd.github+json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
};
const user = await api('/user');
console.log('user', user.data.login);
const repoName = 'arknights-idle';
let repo = await api(`/repos/${user.data.login}/${repoName}`);
if (repo.status === 404) {
  const created = await api('/user/repos', 'POST', {
    name: repoName,
    description: '明日方舟同人放置游戏 — 罗德岛值守协议',
    private: false,
    has_issues: true,
    has_projects: false,
    has_wiki: false,
    auto_init: false,
  });
  console.log('create', created.status, created.data.full_name || created.data.message);
  repo = created;
} else {
  console.log('exists', repo.status, repo.data.full_name);
}
console.log('pages_url', repo.data.html_url);
