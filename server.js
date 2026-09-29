'use strict';

const express = require('express');
const escapeHtml = require('escape-html');

const app = express();
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

const MAX_LENGTH = 1000;
const memos = [];

function renderPage(query, list) {
  const items = list.length === 0
    ? '<li>メモがありません</li>'
    : list.map((memo) => `<li>${escapeHtml(memo.text)} <small>(${escapeHtml(memo.createdAt)})</small></li>`).join('');

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>メモアプリ</title>
</head>
<body>
  <h1>メモアプリ</h1>
  <form method="post" action="/memos">
    <label for="text">新しいメモ</label>
    <input id="text" name="text" maxlength="${MAX_LENGTH}" required>
    <button type="submit">追加</button>
  </form>
  <form method="get" action="/">
    <label for="q">検索</label>
    <input id="q" name="q" value="${escapeHtml(query)}">
    <button type="submit">検索</button>
  </form>
  <ul>${items}</ul>
</body>
</html>`;
}

app.get('/', (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const lowered = query.toLowerCase();
  const list = query ? memos.filter((memo) => memo.text.toLowerCase().includes(lowered)) : memos;
  res.type('html').send(renderPage(query, list));
});

app.post('/memos', (req, res) => {
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
  if (text === '' || text.length > MAX_LENGTH) {
    res.status(400).type('text').send('メモは 1〜1000 文字で入力してください');
    return;
  }
  memos.push({ text, createdAt: new Date().toLocaleString('ja-JP') });
  res.redirect(303, '/');
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Memo app listening on http://localhost:${port}`);
});
