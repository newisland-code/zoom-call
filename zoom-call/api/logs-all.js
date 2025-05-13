// api/logs-all.js

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // credentials.json のパスを指定
    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.SHEET_ID;

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'シート2!A2:F',
    });

    const rows = result.data.values || [];
    const logs = rows.map(row => ({
      name: row[0] || '',
      phone: row[1] || '',
      result: row[2] || '',
      receiver: row[3] || '',
      memo: row[4] || '',
      timestamp: row[5] || ''
    }));

    return res.status(200).json(logs);
  } catch (err) {
    console.error('❌ logs-all.js error:', err);
    return res.status(500).json({ error: 'ログ取得失敗' });
  }
}
