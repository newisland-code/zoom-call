const loginForm = document.getElementById('login-form');
const rememberToggle = document.getElementById('remember-toggle');

const ID = 'NI';
const PASSWORD = 'newisland2022';

// 保存されたログイン情報があれば入力欄に自動反映
window.onload = () => {
const savedId = localStorage.getItem('login_id');
const savedPw = localStorage.getItem('login_pw');
const remember = localStorage.getItem('remember_login');

if (remember === 'true' && savedId && savedPw) {
document.getElementById('login-id').value = savedId;
document.getElementById('login-password').value = savedPw;
rememberToggle.checked = true;
}
};

loginForm.addEventListener('submit', (e) => {
e.preventDefault();

const id = document.getElementById('login-id').value.trim();
const pw = document.getElementById('login-password').value.trim();
const remember = rememberToggle.checked;

if (id === ID && pw === PASSWORD) {
if (remember) {
localStorage.setItem('login_id', id);
localStorage.setItem('login_pw', pw);
localStorage.setItem('remember_login', 'true');
} else {
localStorage.removeItem('login_id');
localStorage.removeItem('login_pw');
localStorage.removeItem('remember_login');
}
window.location.href = '/single.html';
} else {
alert('ログインIDまたはパスワードが間違っています');
}
});

