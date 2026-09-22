/* ============================================================
   APP — Entry point
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 SUPERBRAIN đang khởi động...');
  
  initSound();
  updateAppSize('screen-home');
  checkStudentName();
  
  const btnCheck = $('btnCheck');
  if (btnCheck) btnCheck.addEventListener('click', checkAnswer);
  
  const btnSkip = $('btnSkip');
  if (btnSkip) {
    btnSkip.addEventListener('click', () => {
      if (!answerPhase) return;
      userAnswer = '';
      recordWrong(`⏭️ Bỏ qua. Đáp án: ${currentAnswer}`);
    });
  }
  
  const answerInput = $('answer');
  if (answerInput) {
    answerInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') checkAnswer();
    });
  }
  
  const packSelect = $('packSelect');
  if (packSelect) {
    packSelect.addEventListener('change', e => {
      config.pack = parseInt(e.target.value);
    });
  }
  
  const termInput = $('termInput');
  if (termInput) {
    termInput.addEventListener('change', e => {
      let v = parseInt(e.target.value);
      if (isNaN(v) || v < 3) v = 3;
      if (v > 30) v = 30;
      config.terms = v;
      e.target.value = v;
    });
  }
  
  const nameInput = $('studentNameInput');
  if (nameInput) {
    nameInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') saveStudentInfo();
    });
  }
  
  const classInput = $('studentClassInput');
  if (classInput) {
    classInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') saveStudentInfo();
    });
  }
  
  console.log('✅ SUPERBRAIN ready!');
});

// ============ KIỂM TRA TÊN HỌC VIÊN ============
function checkStudentName() {
  const overlay = $('nameOverlay');
  const nameInput = $('studentNameInput');
  const classInput = $('studentClassInput');
  
  if (!overlay) {
    console.warn('⚠️ Không tìm thấy overlay nameOverlay');
    return;
  }
  
  let name = '';
  try {
    name = localStorage.getItem('superbrain_student_name') || '';
  } catch (e) {
    name = '';
  }
  
  console.log('👤 Tên đã lưu:', name || '(chưa có)');
  
  if (!name || name === 'Không tên' || name.trim() === '') {
    console.log('📝 Chưa có tên → Hiện overlay nhập tên');
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
    setTimeout(() => {
      if (nameInput) nameInput.focus();
    }, 100);
  } else {
    console.log('✅ Đã có tên → Ẩn overlay');
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
    
    if (nameInput) nameInput.value = name;
    let cls = '';
    try {
      cls = localStorage.getItem('superbrain_student_class') || '';
    } catch (e) {}
    if (classInput) classInput.value = cls;
    
    updateStudentInfoUI();
  }
}

// ============ LƯU THÔNG TIN HỌC VIÊN ============
function saveStudentInfo() {
  const nameInput = $('studentNameInput');
  const classInput = $('studentClassInput');
  
  const name = nameInput ? nameInput.value.trim() : '';
  const cls = classInput ? classInput.value.trim() : '';
  
  console.log('💾 Lưu tên:', name, '| Lớp:', cls);
  
  if (!name) {
    alert('Vui lòng nhập họ tên!');
    if (nameInput) nameInput.focus();
    return;
  }
  
  try {
    localStorage.setItem('superbrain_student_name', name);
    localStorage.setItem('superbrain_student_class', cls);
  } catch (e) {
    console.warn('Không lưu được vào localStorage:', e);
  }
  
  const overlay = $('nameOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
  }
  
  updateStudentInfoUI();
  
  console.log('✅ Đã lưu học viên:', name, cls ? '(Lớp ' + cls + ')' : '');
}

// ============ CẬP NHẬT UI HIỂN THỊ TÊN ============
function updateStudentInfoUI() {
  let name = '', cls = '';
  try {
    name = localStorage.getItem('superbrain_student_name') || '';
    cls = localStorage.getItem('superbrain_student_class') || '';
  } catch (e) {}
  
  const subtitle = document.querySelector('.subtitle');
  if (subtitle) {
    if (name && name !== 'Không tên') {
      subtitle.textContent = `👤 ${name}${cls ? ' - Lớp ' + cls : ''}`;
    } else {
      subtitle.textContent = 'FingerMath & Soroban';
    }
  }
}

// ============ NÚT THOÁT — Xóa dữ liệu học viên ============
function confirmLogout() {
  const name = getStudentName();
  const msg = `Bạn có chắc muốn thoát?\n\n` +
              `Tên học viên: ${name}\n\n` +
              `⚠️ LƯU Ý: Khi thoát, dữ liệu trên máy sẽ bị XÓA.\n` +
              `Điểm đã gửi lên Google Sheet sẽ được GIỮ LẠI.`;
  
  if (!confirm(msg)) return;
  
  try {
    localStorage.removeItem('superbrain_student_name');
    localStorage.removeItem('superbrain_student_class');
    localStorage.removeItem('superbrain_history');
    localStorage.removeItem('superbrain_sound_enabled');
  } catch (e) {
    console.warn('Lỗi xóa localStorage:', e);
  }
  
  console.log('🚪 Đã đăng xuất. Xóa toàn bộ dữ liệu học viên.');
  
  // Reload trang
  location.reload();
}