// Interactive Engine for Tier 3 Intern Dashboard - คลินิกการแพทย์แผนไทย มบส.

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 0. SESSION AUTHENTICATION & ROLE CHECK
  // ==========================================================================
  let currentUser = null;
  try {
    const storedUserStr = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
    if (storedUserStr && storedUserStr !== 'undefined') {
      currentUser = JSON.parse(storedUserStr);
    }
  } catch (err) {
    console.error('Session parse error:', err);
  }

  // Fallback to default Tier 3 Intern if no session or invalid
  if (!currentUser || typeof currentUser !== 'object') {
    currentUser = {
      email: 'intern@bsru.ac.th',
      role: 'intern',
      roleNameTH: 'นักศึกษาฝึกงาน (Tier 3: Intern)',
      name: 'นศ. ใจดี ตั้งใจเรียน'
    };
  }

  // Redirect Tier 4 Student/Patient users attempting to access intern panel
  if (currentUser.role === 'user') {
    window.location.href = 'index.html';
    return;
  }

  // Render Intern Identity in Header
  const headerProfileName = document.getElementById('headerProfileName');
  const headerRoleBadge = document.getElementById('headerRoleBadge');
  
  if (headerProfileName && currentUser.name) {
    headerProfileName.textContent = currentUser.name;
  }
  if (headerRoleBadge) {
    headerRoleBadge.textContent = currentUser.roleNameTH || 'นักศึกษาฝึกงาน (Intern)';
  }

  // ==========================================================================
  // 1. REAL-TIME THAI CLOCK FORMATTER
  // ==========================================================================
  const realtimeClockEl = document.getElementById('realtimeClockText');

  function updateThaiClock() {
    if (!realtimeClockEl) return;
    const now = new Date();

    const thaiDays = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตูลายน', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const dayName = thaiDays[now.getDay()];
    const dateNum = now.getDate();
    const monthName = thaiMonths[now.getMonth()];
    const yearBE = now.getFullYear() + 543;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    realtimeClockEl.textContent = `${dayName}ที่ ${dateNum} ${monthName} ${yearBE} เวลา ${hours}:${minutes}:${seconds} น.`;
  }

  updateThaiClock();
  setInterval(updateThaiClock, 1000);

  // Set default log date in form to today
  const logDateInput = document.getElementById('logDate');
  if (logDateInput) {
    logDateInput.value = new Date().toISOString().split('T')[0];
  }

  // ==========================================================================
  // 2. MOBILE HAMBURGER SIDEBAR TOGGLE
  // ==========================================================================
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const hamburgerBtn = document.getElementById('hamburgerBtn');

  const isMobile = () => window.innerWidth < 1024;

  if (hamburgerBtn && sidebar) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isMobile()) {
        sidebar.classList.toggle('mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.toggle('active');
      } else {
        sidebar.classList.toggle('collapsed');
      }
    });
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', () => {
      if (sidebar) sidebar.classList.remove('mobile-open');
      sidebarBackdrop.classList.remove('active');
    });
  }

  // ==========================================================================
  // 3. FUNCTIONAL TOP-RIGHT USER PROFILE DROPDOWN
  // ==========================================================================
  const profileDropdownContainer = document.getElementById('profileDropdownContainer');
  const profileDropdownBtn = document.getElementById('profileDropdownBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const openProfileSettingsBtn = document.getElementById('openProfileSettingsBtn');
  const openChangePasswordBtn = document.getElementById('openChangePasswordBtn');

  if (profileDropdownBtn && profileDropdownContainer) {
    profileDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdownContainer.classList.toggle('active');
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!profileDropdownContainer.contains(e.target)) {
        profileDropdownContainer.classList.remove('active');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('currentUser');
      localStorage.removeItem('currentUser');
      showToast('ออกจากระบบเรียบร้อยแล้ว กำลังกลับสู่หน้าล็อกอิน...', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 400);
    });
  }

  if (openProfileSettingsBtn) {
    openProfileSettingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (profileDropdownContainer) profileDropdownContainer.classList.remove('active');
      window.location.href = 'profile_settings.html';
    });
  }

  if (openChangePasswordBtn) {
    openChangePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (profileDropdownContainer) profileDropdownContainer.classList.remove('active');
      window.location.href = 'profile_settings.html';
    });
  }

  // ==========================================================================
  // 4. TAB SWITCHING (RESTRICTED TO ONLY 2 SIDEBAR MENUS: TAB-0 & TAB-1)
  // ==========================================================================
  const menuLinks = document.querySelectorAll('.sidebar-menu .menu-item-link');
  const tabContents = document.querySelectorAll('.tab-content');

  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const parentLi = link.closest('li');
      const targetTabId = link.getAttribute('data-tab');

      if (!targetTabId) return;

      document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
      if (parentLi) parentLi.classList.add('active');

      tabContents.forEach(content => {
        if (content.id === targetTabId) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });

      if (isMobile() && sidebar) {
        sidebar.classList.remove('mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
      }
    });
  });

  // ==========================================================================
  // 5. QUEUE TABLE FILTERING & LIVE SEARCH
  // ==========================================================================
  const queueFilterBtns = document.querySelectorAll('.queue-filter-btn');
  const queueSearchInput = document.getElementById('queueSearchInput');
  const queueRows = document.querySelectorAll('#queueTable tbody tr');

  queueFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      queueFilterBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'var(--color-soft-beige)';
        b.style.color = 'var(--color-dark-brown)';
        b.style.border = '1px solid var(--color-beige-dark)';
      });

      btn.classList.add('active');
      btn.style.background = 'var(--color-terracotta)';
      btn.style.color = '#ffffff';
      btn.style.border = 'none';

      const filter = btn.getAttribute('data-filter');
      filterQueueTable(filter, queueSearchInput ? queueSearchInput.value : '');
    });
  });

  if (queueSearchInput) {
    queueSearchInput.addEventListener('input', (e) => {
      const activeFilterBtn = document.querySelector('.queue-filter-btn.active');
      const currentFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
      filterQueueTable(currentFilter, e.target.value);
    });
  }

  function filterQueueTable(filter, searchQuery) {
    const query = searchQuery.trim().toLowerCase();

    queueRows.forEach(row => {
      const status = row.getAttribute('data-status');
      const rowText = row.textContent.toLowerCase();

      const matchesStatus = filter === 'all' || status === filter;
      const matchesSearch = query === '' || rowText.includes(query);

      if (matchesStatus && matchesSearch) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  // Quick Action Buttons on Queue Table
  document.addEventListener('click', (e) => {
    const logBtn = e.target.closest('.open-log-modal-btn');
    if (logBtn) {
      const patient = logBtn.getAttribute('data-patient');
      const queue = logBtn.getAttribute('data-queue');
      const service = logBtn.getAttribute('data-service');

      // Switch to Tab 1 (Log Hours System)
      const tab1Link = document.querySelector('.menu-item-link[data-tab="tab-1"]');
      if (tab1Link) tab1Link.click();

      // Pre-fill form fields
      const logPatientInput = document.getElementById('logPatient');
      const logTreatmentSelect = document.getElementById('logTreatment');

      if (logPatientInput) logPatientInput.value = `${patient} (${queue})`;
      if (logTreatmentSelect && service) {
        for (let i = 0; i < logTreatmentSelect.options.length; i++) {
          if (logTreatmentSelect.options[i].value.includes(service) || service.includes(logTreatmentSelect.options[i].value)) {
            logTreatmentSelect.selectedIndex = i;
            break;
          }
        }
      }

      showToast(`เตรียมลงบันทึกชั่วโมงสำหรับเคส ${patient} (${queue})`, 'info');
    }

    const intakeBtn = e.target.closest('.open-intake-btn');
    if (intakeBtn) {
      const patient = intakeBtn.getAttribute('data-patient');
      const queue = intakeBtn.getAttribute('data-queue');
      showToast(`เปิดแบบฟอร์มคัดกรองสัญญาณชีพ & ความดันโลหิต สำหรับเคส ${patient} (${queue})`, 'success');
    }
  });

  // ==========================================================================
  // 6. INTERACTIVE TREATMENT HOURS LOG FORM SUBMISSION
  // ==========================================================================
  const internHoursLogForm = document.getElementById('internHoursLogForm');
  const logHistoryTableBody = document.querySelector('#logHistoryTable tbody');
  const totalInternHoursText = document.getElementById('totalInternHoursText');
  const internProgressBar = document.getElementById('internProgressBar');

  let currentTotalHours = 185.5;

  if (internHoursLogForm) {
    internHoursLogForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const logDate = document.getElementById('logDate').value;
      const logShift = document.getElementById('logShift').value;
      const logDoctor = document.getElementById('logDoctor').value;
      const logPatient = document.getElementById('logPatient').value;
      const logTreatment = document.getElementById('logTreatment').value;
      const logHours = parseFloat(document.getElementById('logHours').value) || 2.0;

      // Update total hours counter
      currentTotalHours += logHours;
      if (totalInternHoursText) {
        totalInternHoursText.textContent = currentTotalHours.toFixed(1);
      }

      // Update progress bar percentage
      const progressPercent = Math.min(100, (currentTotalHours / 300) * 100);
      if (internProgressBar) {
        internProgressBar.style.width = `${progressPercent.toFixed(1)}%`;
      }

      // Format date for table
      const dateParts = logDate.split('-');
      const formattedDateStr = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${parseInt(dateParts[0]) + 543}` : logDate;

      // Prepend new row to History Table
      if (logHistoryTableBody) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
          <td>
            <strong>${formattedDateStr}</strong>
            <span style="display: block; font-size: 0.75rem; color: var(--color-muted-text);">${logShift}</span>
          </td>
          <td>
            <strong>${logPatient}</strong>
            <span style="display: block; font-size: 0.78rem; color: var(--color-muted-text);">${logTreatment}</span>
          </td>
          <td>${logDoctor}</td>
          <td><strong style="color: var(--color-terracotta);">${logHours.toFixed(1)} ชม.</strong></td>
          <td>
            <span class="badge-status pending-approval">
              <i class="fa-solid fa-hourglass-half"></i> รออาจารย์อนุมัติ
            </span>
          </td>
          <td style="text-align: center;">
            <button class="btn-action-sm" onclick="alert('ส่งข้อความแจ้งเตือนอาจารย์ผู้ควบคุม ${logDoctor} เรียบร้อยแล้ว')">
              <i class="fa-solid fa-bell"></i> เตือนอนุมัติ
            </button>
          </td>
        `;
        logHistoryTableBody.insertBefore(newRow, logHistoryTableBody.firstChild);
      }

      // Reset form & Notify user
      internHoursLogForm.reset();
      if (logDateInput) logDateInput.value = new Date().toISOString().split('T')[0];

      showToast(`บันทึกชั่วโมงปฏิบัติงาน ${logHours.toFixed(1)} ชม. (เคส ${logPatient}) เรียบร้อยแล้ว! ส่งข้อมูลให้ ${logDoctor} อนุมัติ`, 'success');
    });
  }

  // ==========================================================================
  // 7. TOAST NOTIFICATION FEEDBACK ENGINE
  // ==========================================================================
  function showToast(message, type = 'success') {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    if (toast && toastMsg) {
      toastMsg.textContent = message;
      if (toastIcon) {
        if (type === 'error') {
          toastIcon.className = 'fa-solid fa-circle-xmark';
          toastIcon.style.color = '#dc2626';
        } else if (type === 'info') {
          toastIcon.className = 'fa-solid fa-circle-info';
          toastIcon.style.color = 'var(--color-terracotta)';
        } else {
          toastIcon.className = 'fa-solid fa-circle-check';
          toastIcon.style.color = 'var(--color-accent-sage)';
        }
      }

      toast.classList.add('active');
      setTimeout(() => {
        toast.classList.remove('active');
      }, 5000);
    }
  }

});
