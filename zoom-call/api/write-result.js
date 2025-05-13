// api/write-result.js

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, phone, result, receiver, memo, timestamp } = req.body;

  if (!name || !phone || !result || !timestamp) {
    return res.status(400).json({ error: 'Missing required data' });
  }

  try {
    // credentials.json 読み込み
    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const sheetId = process.env.SHEET_ID;
    const sheetName = req.headers['x-sheet-name'] || 'menuリスト';

    // 対象行の検索（A: 名前 / B: 電話番号）
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A2:B`,
    });

    const rows = readRes.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === name && row[1] === phone);

    if (rowIndex === -1) {
      return res.status(404).json({ error: '対象が見つかりません' });
    }

    const targetRow = rowIndex + 2;

    // シート1の結果更新（C〜G列）
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!C${targetRow}:G${targetRow}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[result, receiver || '', memo || '', timestamp, new Date().toLocaleString('ja-JP')]],
      },
    });

    // シート2への追記
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'シート2!A:F',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[name, phone, result, receiver || '', memo || '', timestamp]],
      },
    });

    return res.status(200).json({ message: '✅ 書き込み成功' });
  } catch (err) {
    console.error('❌ write-result.js error:', err.stack || err.message);
    return res.status(500).json({ error: '書き込み失敗' });
  }
}
