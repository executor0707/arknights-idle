import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const token = process.env.GH_TOKEN;
const repo = 'executor0707/arknights-idle';
const api = `https://api.github.com/repos/${repo}`;
const headers = { authorization: `token ${token}`, 'user-agent': 'RhodesIdleDeploy/1.0', accept: 'application/vnd.github+json' };

async function gh(method, url, body) {
  const r = await fetch(api + url, { method, headers: { ...headers, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  if (!r.ok) throw new Error(`${method} ${url} ${r.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

function diffFiles(cwd, base) {
  const out = execFileSync('git', ['diff', '--name-status', `${base}..HEAD`], { cwd, encoding: 'utf8' });
  return out.trim().split(/\r?\n/).filter(Boolean).map(line => {
    const [status, ...rest] = line.split('\t');
    return { status, file: rest.join('\t') };
  });
}

async function pushTree(ref, cwd, message) {
  const base = (await gh('GET', `/git/ref/heads/${ref}`)).object.sha;
  const baseCommit = await gh('GET', `/git/commits/${base}`);
  // The local history may not contain the API-created remote commit; use the
  // equivalent local commit for the changed-file diff only.
  const changes = diffFiles(cwd, process.env.DIFF_BASE || base);
  const entries = [];
  for (const { status, file } of changes) {
    const full = path.join(cwd, file);
    if (status === 'D') { entries.push({ path: file, mode: '100644', type: 'blob', sha: null }); continue; }
    const content = fs.readFileSync(full);
    const blob = await gh('POST', '/git/blobs', { content: content.toString('base64'), encoding: 'base64' });
    entries.push({ path: file, mode: '100644', type: 'blob', sha: blob.sha });
    console.log('blob', file, blob.sha.slice(0, 7));
  }
  const tree = await gh('POST', '/git/trees', { base_tree: baseCommit.tree.sha, tree: entries });
  const commit = await gh('POST', '/git/commits', {
    message,
    tree: tree.sha,
    parents: [base],
    author: { name: 'DSH Agent', email: 'dsh@localhost' },
    committer: { name: 'DSH Agent', email: 'dsh@localhost' },
  });
  await gh('PATCH', `/git/refs/heads/${ref}`, { sha: commit.sha, force: true });
  console.log(ref, base.slice(0, 7), '->', commit.sha.slice(0, 7), 'files', entries.length);
  return commit.sha;
}

const which = process.argv[2];
if (which === 'main') await pushTree('main', process.cwd(), 'Add two scale sliders and attack lock');
else if (which === 'pages') await pushTree('gh-pages', path.join(process.cwd(), '.cache/pages-deploy-v4'), 'Deploy two scale sliders and attack lock');
else throw new Error('usage: main|pages');
