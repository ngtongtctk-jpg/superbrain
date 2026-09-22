/* ============================================================
   RESULT SCREEN — Bảng kết quả + Lưu lịch sử
   ============================================================ */

function showResult() {
  stopAllTimers();
  
  // Render bảng
  const tbody = $('resultBody');
  tbody.innerHTML = '';
  
  history.forEach((item, idx) => {
    const tr = document.createElement('tr');
    const icon = item.isCorrect ? '<span class="tick">✓</span>' : '<span class="cross">✗</span>';
    const ansDisp = (item.answer === '—' || item.answer === '') ? '' : item.answer;
    tr.innerHTML = `<td>${idx+1}</td><td>${item.question}</td><td>${ansDisp}</td><td>${item.correct}</td><td>${icon}</td>`;
    tbody.appendChild(tr);
  });
  
  const percent = totalQuestions > 0 ? Math.round(score / totalQuestions * 100) : 0;
  $('summaryText').textContent = `Tổng: ${score}/${totalQuestions}`;
  $('summaryPercent').textContent = `(${percent}%)`;
  
  // ⭐ LƯU LỊCH SỬ
  addHistoryRecord({
    mode: currentMode,
    subject: currentMode.startsWith('fm') ? 'fingermath' : 'soroban',
    percent: percent,
    score: score,
    total: totalQuestions,
    date: new Date().toISOString()
  });
  
  goTo('screen-result');
}

function restartGame() {
  score = 0; wrong = 0; streak = 0;
  currentQuestionIndex = 0; history = [];
  reviewQueue = [];
  if (currentMode === 'fm-review' || currentMode === 'sb-add-review') buildReviewQueue();
  $('score').textContent = 0;
  $('streak').textContent = 0;
  $('totalDisplay').textContent = totalQuestions;
  goTo('screen-game');
  prepareFirstQuestion();
}