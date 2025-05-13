const SHEET_KEY = 'selectedSheetName';
const DEFAULT_SHEET_NAME = 'menuリスト';

function getSheetName() {
  return localStorage.getItem(SHEET_KEY) || DEFAULT_SHEET_NAME;
}

function setSheetName(name) {
  localStorage.setItem(SHEET_KEY, name);
}

async function writeResult(data) {
  const sheetName = getSheetName();
  const url = `/api/write-result?sheetName=${encodeURIComponent(sheetName)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    return text;
  } catch (err) {
    console.error('❌ 書き込みエラー:', err);
    throw err;
  }
}

async function fetchLogs(name, phone) {
  const sheetName = getSheetName();
  const url = `/api/logs?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&sheetName=${encodeURIComponent(sheetName)}`;

  try {
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error('❌ ログ取得エラー:', err);
    throw err;
  }
}

async function fetchAllLogs() {
  const sheetName = getSheetName();
  const url = `/api/logs-all?sheetName=${encodeURIComponent(sheetName)}`;

  try {
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error('❌ 全ログ取得エラー:', err);
    throw err;
  }
}

function getSheetNameOptions() {
  return [
    'menuリスト',
    'menu再架電',
    'Uberリスト',
    'Uber再架電',
    '出前館リスト'
  ];
}

function populateSheetSelector(selectEl) {
  const options = getSheetNameOptions();
  options.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    selectEl.appendChild(opt);
  });

  const current = getSheetName();
  if (options.includes(current)) {
    selectEl.value = current;
  }

  selectEl.addEventListener('change', () => {
    setSheetName(selectEl.value);
    location.reload();
  });
}