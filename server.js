'use strict';

const express = require('express');
const escapeHtml = require('escape-html');

const app = express();
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

const PORT = Number(process.env.PORT) || 3000;
const MAX_LENGTH = 1000;

// メモはメモリ上に保持する（再起動で消える）
const memos = [];

function renderPage(query, list) {
  const items = list.length
    ? list
        .map(
          (m) =>
            `<li><p>${escapeHtml(m.text)}</p><small>${escapeHtml(m.createdAt.toLocaleString('ja-JP'))}</small></li>`
        )
        .join('')
    : '<li>メモはありません</li>';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>メモアプリ</title>
<style>
  body { font-family: sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
  textarea, input[type=search] { width: 100%; box-sizing: border-box; }
  ul { list-style: none; padding: 0; }
  li { border-bottom: 1px solid #ddd; padding: .5rem 0; }
  li p { margin: 0 0 .25rem; white-space: pre-wrap; }
</style>
</head>
<body>
<h1>メモアプリ</h1>
<form method="post" action="/memos">
  <label for="text">新しいメモ</label>
  <textarea id="text" name="text" rows="3" maxlength="${MAX_LENGTH}" required></textarea>
  <button type="submit">追加</button>
</form>
<form method="get" action="/">
  <label for="q">検索</label>
  <input id="q" type="search" name="q" value="${escapeHtml(query)}">
  <button type="submit">検索</button>
</form>
<h2>${query ? `「${escapeHtml(query)}」の検索結果` : 'メモ一覧'}（${list.length} 件）</h2>
<ul>${items}</ul>
</body>
</html>`;
}

app.get('/', (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const lower = query.toLowerCase();
  const list = memos
    .filter((m) => !lower || m.text.toLowerCase().includes(lower))
    .slice()
    .reverse();
  res.type('html').send(renderPage(query, list));
});

app.post('/memos', (req, res) => {
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
  if (!text || text.length > MAX_LENGTH) {
    res.status(400).type('text').send(`メモは 1〜${MAX_LENGTH} 文字で入力してください`);
    return;
  }
  memos.push({ text, createdAt: new Date() });
  res.redirect(303, '/');
});

app.listen(PORT, () => {
  console.log(`Memo app listening on http://localhost:${PORT}`);
});
