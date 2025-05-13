import { getSelectedSheetName } from './sheet.js';

export async function fetchLogs(name, phone) {
  const sheetName = getSelectedSheetName();
  const res = await fetch(`/api/logs?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&sheet=${encodeURIComponent(sheetName)}`);
  if (!res.ok) throw new Error('ログ取得失敗');
  return await res.json();
}

export async function fetchAllLogs() {
  const sheetName = getSelectedSheetName();
  const res = await fetch(`/api/logs-all?sheet=${encodeURIComponent(sheetName)}`);
  if (!res.ok) throw new Error('全ログ取得失敗');
  return await res.json();
}

export async function writeResult(data) {
  const sheetName = getSelectedSheetName();
  const res = await fetch('/api/write-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, sheet: sheetName })
  });
  if (!res.ok) throw new Error('保存に失敗しました');
  return await res.text();
}
