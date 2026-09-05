const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const errorBox = document.querySelector('#form-error');
async function submitAuth(event, path) {
  event.preventDefault(); errorBox.textContent = '';
  try { const data = await api(path, { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); window.location.href = data.user ? '/dashboard.html' : '/'; }
  catch (error) { errorBox.textContent = error.message; }
}
if (loginForm) loginForm.addEventListener('submit', (event) => submitAuth(event, '/auth/login'));
if (registerForm) registerForm.addEventListener('submit', (event) => submitAuth(event, '/auth/register'));
