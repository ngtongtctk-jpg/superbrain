/* ============================================================
   HISTORY — Lưu lịch sử + Gửi lên Google Sheets
   ============================================================ */

const HISTORY_KEY = 'superbrain_history';

// ⭐ URL Google Apps Script Web App
const API_URL = 'https://script.google.com/macros/s/AKfycbw2zViZ1sMm8lTBX4pMbT23dQ7uTIkWB9LcSe_oUlF_LBEkKR7atQX3s9bWaDmT-QuH9w/exec';

// ============ ĐỌC / GHI LỊCH SỬ ============
function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Lỗi đọc lịch sử:', e);
    return [];
  }
}

function saveHistory(arr) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn('Lỗi lưu lịch sử:', e);
  }
}

// ============ THÊM BẢN GHI MỚI ============
function addHistoryRecord(data) {
  // 1. Lưu vào localStorage
  const list = getHistory();
  list.push(data);
  saveHistory(list);
  
  // 2. Gửi lên Google Sheets
  sendToGoogleSheets(data);
}

// ============ GỬI LÊN GOOGLE SHEETS ============
function sendToGoogleSheets(data) {
  if (!API_URL || API_URL.includes('AKfycb...')) {
    console.warn('⚠️ Chưa cấu hình API_URL');
    return;
  }
  
  const payload = {
    name: getStudentName(),
    subject: data.subject === 'fingermath' ? 'FingerMath' : 'Soroban',
    mode: getModeName(data.mode),
    score: data.score,
    total: data.total,
    percent: data.percent,
    date: data.date,
    className: getStudentClass()
  };
  
  console.log('📤 Đang gửi lên Google Sheets:', payload);
  
  fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(() => {
    console.log('✅ Đã gửi điểm lên Google Sheets');
  })
  .catch(err => {
    console.warn('⚠️ Không gửi được (có thể do mạng):', err);
  });
}

// ============ QUẢN LÝ TÊN HỌC VIÊN ============
function getStudentName() {
  try {
    return localStorage.getItem('superbrain_student_name') || 'Không tên';
  } catch (e) {
    return 'Không tên';
  }
}

function setStudentName(name) {
  try {
    localStorage.setItem('superbrain_student_name', name);
  } catch (e) {}
}

function getStudentClass() {
  try {
    return localStorage.getItem('superbrain_student_class') || '';
  } catch (e) {
    return '';
  }
}

function setStudentClass(cls) {
  try {
    localStorage.setItem('superbrain_student_class', cls);
  } catch (e) {}
}

// ============ KÝ HIỆU + MÀU SẮC CHO BIỂU ĐỒ ============
const MODE_SYMBOLS = {
  'fm-basic': '◆', 'fm-lb-plus': '✚', 'fm-lb-minus': '▬',
  'fm-bb-plus': '■', 'fm-bb-minus': '★', 'fm-review': '▲',
  'fm-flash-1': '●', 'fm-flash-2': '●',
  'sb-add-basic': '◆', 'sb-add-lb-plus': '✚', 'sb-add-lb-minus': '▬',
  'sb-add-bb-plus': '■', 'sb-add-bb-minus': '★', 'sb-add-review': '▲',
  'sb-flash': '●', 'sb-mul': '⬢', 'sb-div': '▼'
};

const MODE_NAMES = {
  'fm-basic': '[FG]Basic', 'fm-lb-plus': '[FG]LB+', 'fm-lb-minus': '[FG]LB-',
  'fm-bb-plus': '[FG]BB+', 'fm-bb-minus': '[FG]BB-', 'fm-review': '[FG]Multi',
  'fm-flash-1': '[FG]Flash', 'fm-flash-2': '[FG]Flash',
  'sb-add-basic': '[SP]Basic', 'sb-add-lb-plus': '[SP]LB+', 'sb-add-lb-minus': '[SP]LB-',
  'sb-add-bb-plus': '[SP]BB+', 'sb-add-bb-minus': '[SP]BB-', 'sb-add-review': '[SP]Multi',
  'sb-flash': '[SP]Flash', 'sb-mul': '[SP]Mul', 'sb-div': '[SP]Div'
};

const SUBJECT_COLORS = {
  'fingermath': '#2563eb',
  'soroban': '#65a343'
};

function getModeColor(mode) {
  return mode.startsWith('fm') ? SUBJECT_COLORS.fingermath : SUBJECT_COLORS.soroban;
}

function getModeSymbol(mode) {
  return MODE_SYMBOLS[mode] || '●';
}

function getModeName(mode) {
  return MODE_NAMES[mode] || mode;
}