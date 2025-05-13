require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const auth = new google.auth.GoogleAuth({
  keyFile: require('path').join(__dirname, 'credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

app.post('/api/write-result', async (req, res) => {
  try {
    const { name, phone, result, memo, receiver, timestamp } = req.body;
    if (!name || !phone || !result || !timestamp) {
      return res.status(400).send('Missing required data');
    }

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const sheetId = process.env.SHEET_ID;

    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'シート1!A2:B'
    });

    const rows = readRes.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === name && row[1] === phone);
    if (rowIndex === -1) return res.status(404).send('対象が見つかりません');

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `シート1!C${rowIndex + 2}:G${rowIndex + 2}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[result, receiver || '', memo || '', timestamp, new Date().toLocaleString('ja-JP')]]
      }
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'シート2!A:F',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[name, phone, result, receiver || '', memo || '', timestamp]]
      }
    });

    res.send('✅ 書き込み成功');
  } catch (err) {
    console.error('❌ 書き込みエラー:', err);
    res.status(500).send('書き込み失敗');
  }
});

app.get('/api/logs', async (req, res) => {
  const { name, phone } = req.query;
  if (!name || !phone) return res.status(400).send('Missing parameters');

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const sheetId = process.env.SHEET_ID;

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'シート2!A2:F'
    });

    const logs = (result.data.values || []).filter(row => row[0] === name && row[1] === phone).map(row => ({
      name: row[0],
      phone: row[1],
      result: row[2],
      receiver: row[3],
      memo: row[4],
      timestamp: row[5],
    }));

    res.json(logs);
  } catch (err) {
    console.error('❌ ログ取得エラー:', err);
    res.status(500).send('ログ取得失敗');
  }
});

app.listen(3000, () => {
  console.log('✅ Server started on http://localhost:3000');
});
