/* ============================================================
   CHART SCREEN — Vẽ biểu đồ lịch sử bằng Canvas thuần
   - Trục Y: 0, 20, 40, 60, 80, 100 (%)
   - Trục X: 10 ngày gần nhất (DD-MM)
   - Mỗi điểm có ký hiệu + màu theo mode
   ============================================================ */

function showResultChart() {
  goTo('screen-chart');
  // Đợi DOM render xong mới vẽ
  setTimeout(() => renderChart(), 100);
}

function renderChart() {
  const canvas = $('chartCanvas');
  if (!canvas) return;
  
  const container = canvas.parentElement;
  const W = container.clientWidth - 32;
  const H = container.clientHeight - 32;
  
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);
  
  // Padding
  const P = { top: 30, right: 30, bottom: 50, left: 55 };
  const chartW = W - P.left - P.right;
  const chartH = H - P.top - P.bottom;
  
  // Lấy 10 ngày gần nhất
  const today = new Date();
  const days = [];
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    days.push({
      date: d,
      label: dd + '-' + mm,
      key: d.getFullYear() + '-' + mm + '-' + dd
    });
  }
  
  // Vẽ nền chart
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(P.left, P.top, chartW, chartH);
  
  // ============ VẼ TRỤC Y ============
  ctx.font = '11px Segoe UI';
  ctx.fillStyle = '#666';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  
  const yValues = [0, 20, 40, 60, 80, 100];
  yValues.forEach(val => {
    const y = P.top + chartH - (val / 100) * chartH;
    
    // Đường kẻ ngang
    ctx.beginPath();
    ctx.moveTo(P.left, y);
    ctx.lineTo(P.left + chartW, y);
    ctx.strokeStyle = val === 0 ? '#9ca3af' : '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Label %
    ctx.fillStyle = '#666';
    ctx.fillText(val + '%', P.left - 8, y);
  });
  
  // ============ VẼ TRỤC X ============
  const dayCount = days.length;
  const stepX = dayCount > 1 ? chartW / (dayCount - 1) : chartW;
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#666';
  
  days.forEach((day, i) => {
    const x = P.left + i * stepX;
    
    // Vạch nhỏ
    ctx.beginPath();
    ctx.moveTo(x, P.top + chartH);
    ctx.lineTo(x, P.top + chartH + 5);
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Label ngày
    ctx.fillStyle = '#666';
    ctx.font = '10px Segoe UI';
    ctx.fillText(day.label, x, P.top + chartH + 10);
  });
  
  // Label trục X
  ctx.font = 'bold 12px Segoe UI';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Ngày', P.left + chartW / 2, P.top + chartH + 28);
  
  // ============ VẼ DỮ LIỆU ============
  const history = getHistory();
  
  if (history.length === 0) {
    ctx.font = '14px Segoe UI';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Chưa có dữ liệu luyện tập', P.left + chartW / 2, P.top + chartH / 2);
    renderLegend([]);
    return;
  }
  
  // Group theo (ngày, mode)
  const grouped = {};
  history.forEach(rec => {
    const recDate = new Date(rec.date);
    const dd = String(recDate.getDate()).padStart(2, '0');
    const mm = String(recDate.getMonth() + 1).padStart(2, '0');
    const key = recDate.getFullYear() + '-' + mm + '-' + dd;
    const groupKey = key + '|' + rec.mode;
    
    if (!grouped[groupKey]) {
      grouped[groupKey] = { dayKey: key, mode: rec.mode, values: [] };
    }
    grouped[groupKey].values.push(rec.percent);
  });
  
  // Vẽ từng điểm
  Object.values(grouped).forEach(group => {
    const dayIdx = days.findIndex(d => d.key === group.dayKey);
    if (dayIdx < 0) return;
    
    const x = P.left + dayIdx * stepX;
    const avg = Math.round(group.values.reduce((a,b) => a + b, 0) / group.values.length);
    const y = P.top + chartH - (avg / 100) * chartH;
    
    const color = getModeColor(group.mode);
    const symbol = getModeSymbol(group.mode);
    
    // Vẽ vòng tròn nền trắng cho dễ nhìn
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fill();
    
    // Vẽ ký hiệu
    ctx.font = 'bold 20px Segoe UI';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x, y);
    
    // Label % phía trên
    ctx.font = 'bold 10px Segoe UI';
    ctx.fillStyle = color;
    ctx.textBaseline = 'bottom';
    ctx.fillText(avg + '%', x, y - 14);
  });
  
  // Render legend
  renderLegend(history);
}

// Render legend (danh sách ký hiệu + tên)
function renderLegend(history) {
  const legendEl = $('chartLegend');
  if (!legendEl) return;
  
  // Lấy các mode duy nhất có trong history
  const uniqueModes = [...new Set(history.map(r => r.mode))];
  
  // Nếu chưa có dữ liệu → hiện tất cả mode (preview)
  const modesToShow = uniqueModes.length > 0
    ? uniqueModes
    : Object.keys(MODE_SYMBOLS);
  
  legendEl.innerHTML = modesToShow.map(mode => {
    const color = getModeColor(mode);
    const symbol = getModeSymbol(mode);
    const name = getModeName(mode);
    return `
      <div class="legend-item">
        <span class="legend-icon" style="color:${color};">${symbol}</span>
        <span>${name}</span>
      </div>
    `;
  }).join('');
}

// Vẽ lại khi resize cửa sổ
window.addEventListener('resize', () => {
  if ($('screen-chart').classList.contains('active')) {
    clearTimeout(window._chartResizeTimer);
    window._chartResizeTimer = setTimeout(renderChart, 200);
  }
});