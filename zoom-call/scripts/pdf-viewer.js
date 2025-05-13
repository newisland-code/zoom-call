export function populateDocumentOptions() {
  const select = document.getElementById('documentSelect');
  const options = [
    { label: '選択してください', value: '' },
    { label: '営業トークスクリプト', value: '/documents/script1.pdf' },
    { label: 'Q&A対応集', value: '/documents/qna.docx' },
    { label: '申込案内', value: '/documents/entry-guide.pdf' }
  ];

  for (const opt of options) {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    select.appendChild(option);
  }

  select.addEventListener('change', () => {
    const viewer = document.getElementById('documentViewer');
    const selected = select.value;
    if (!selected) {
      viewer.innerHTML = '';
      return;
    }

    if (selected.endsWith('.pdf')) {
      viewer.innerHTML = `<iframe src="${selected}" width="100%" height="600px"></iframe>`;
    } else {
      viewer.innerHTML = `<a href="${selected}" target="_blank">📄 ${selected.split('/').pop()} を開く</a>`;
    }
  });
}
