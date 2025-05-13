// fetch-call-logs.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ZOOM_TOKEN = process.env.ZOOM_TOKEN;
const ZOOM_USER_ID = process.env.ZOOM_USER_ID;

app.get('/api/call-logs', async (req, res) => {
  const { from, to } = req.query;

  try {
    const response = await axios.get('https://api.zoom.us/v2/phone/call_logs', {
      headers: {
        Authorization: `Bearer ${ZOOM_TOKEN}`
      },
      params: {
        page_size: 20,
        from: from || getToday(),
        to: to || getToday()
      }
    });

    const logs = response.data.call_logs || [];
    res.json(logs);
  } catch (err) {
    console.error('❌ Zoom Call Log Error:', err.response?.data || err.message);
    res.status(500).send('ログ取得失敗');
  }
});

function getToday() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

app.listen(3100, () => {
  console.log('✅ Zoom Call Log Fetcher running on http://localhost:3100');
});
