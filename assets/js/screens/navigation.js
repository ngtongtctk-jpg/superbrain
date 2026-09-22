/* ============================================================
   NAVIGATION — Chuyển màn hình + đổi kích thước app
   ============================================================ */

function goTo(screenId) {
  // Đổi màn hình active
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(screenId).classList.add('active');
  
  // Đổi kích thước .app theo màn hình
  updateAppSize(screenId);
}

// Cập nhật class kích thước cho .app
function updateAppSize(screenId) {
  const appEl = document.querySelector('.app');
  if (!appEl) return;
  
  // Xóa hết class cũ
  appEl.classList.remove('app-home', 'app-menu', 'app-config', 'app-game', 'app-result');
  
  // Gán class theo màn hình
  if (screenId === 'screen-home') {
    appEl.classList.add('app-home');
  } else if (screenId === 'screen-fingermath' || screenId === 'screen-soroban') {
    appEl.classList.add('app-menu');
  } else if (screenId === 'screen-config') {
    appEl.classList.add('app-config');
  } else if (screenId === 'screen-game') {
    appEl.classList.add('app-game');
  } else if (screenId === 'screen-result') {
    appEl.classList.add('app-result');
  }
}

function backToMenu() {
  stopAllTimers();
  goTo(lastMenuScreen);
}

function backFromConfig() {
  goTo(lastConfigScreen);
}

function togglePastBox() {
  const box = $('pastDisplay');
  const btn = $('btnShowPast');
  box.classList.toggle('show');
  btn.classList.toggle('active');
  btn.textContent = box.classList.contains('show') ? 'ẨN' : 'HIỆN';
}

function showLoading() {
  $('mainDisplay').style.display = 'none';
  $('loadingSpinner').classList.add('show');
}

function hideLoading() {
  $('mainDisplay').style.display = 'flex';
  $('loadingSpinner').classList.remove('show');
}

function stopAllTimers() {
  if (displayTimer) { clearInterval(displayTimer); displayTimer = null; }
  if (answerTimer) { clearInterval(answerTimer); answerTimer = null; }
  answerPhase = false;
}