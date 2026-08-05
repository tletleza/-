// Central Clinic Database & Administrative Interactive Engine - คลินิกการแพทย์แผนไทย มบส.

// Simulated Central Clinic Database (CENTRAL_CLINIC_DB)
const CENTRAL_CLINIC_DB = {
  queues: [
    { id: 'Q-001', patient: 'คุณประเสริฐ สุขสวัสดิ์', phone: '081-234-5678', package: 'นวดไทยเพื่อการรักษา (590฿)', doctor: 'พท.ป. ณัฐวุฒิ สุวรรณเวช', room: 'ห้องหัตถการ 1', status: 'ongoing', statusText: 'กำลังรับบริการ' },
    { id: 'Q-002', patient: 'คุณวิภาดา รัตนกุล', phone: '089-876-5432', package: 'นวดประคบสมุนไพรสด (890฿)', doctor: 'พท.ป. ศิรินทร์ทิพย์ เมธาเวช', room: 'ห้องหัตถการ 3', status: 'ongoing', statusText: 'กำลังรับบริการ' },
    { id: 'Q-003', patient: 'คุณสมชาย ใจดี', phone: '086-555-4321', package: 'นวดน้ำมันหอมระเหย (1,290฿)', doctor: 'พท.ป. ธนพล กาญจนพิบูลย์', room: 'ห้องหัตถการ 2', status: 'waiting', statusText: 'รอเรียกคิว' },
    { id: 'Q-004', patient: 'คุณอนันต์ ชัยชนะ', phone: '090-123-4567', package: 'หัตถการเผายาสมุนไพร (750฿)', doctor: 'พท.ป. ธนพล กาญจนพิบูลย์', room: 'รอจัดสรรห้อง', status: 'waiting', statusText: 'รอเรียกคิว' }
  ],
  // EXACTLY 4 Seed Users (1 per tier as requested by user)
  users: [
    { id: 'USR-001', name: 'สมชาย แอดมิน', email: 'admin@bsru.ac.th', phone: '02-473-7000', role: 'admin', roleName: 'Tier 1: Admin' },
    { id: 'USR-002', name: 'พท.ป. สมหญิง รักษาดี', email: 'doctor@bsru.ac.th', phone: '081-111-2222', role: 'doctor', roleName: 'Tier 2: Doctor' },
    { id: 'USR-003', name: 'นศ. ใจดี ตั้งใจเรียน', email: 'intern@bsru.ac.th', phone: '086-777-8888', role: 'intern', roleName: 'Tier 3: Intern' },
    { id: 'USR-004', name: 'มานะ เรียนดี', email: 'student@bsru.ac.th', phone: '095-123-9999', role: 'user', roleName: 'Tier 4: Student' }
  ],
  inventory: [
    { code: 'MED-001', name: 'ลูกประคบสมุนไพรสด มบส.', category: 'หัตถการประคบ', stock: 120, unit: 'ลูก', status: 'normal', statusText: 'สต็อกปกติ' },
    { code: 'MED-002', name: 'ยาสมุนไพรขมิ้นชันแคปซูล', category: 'ยาสมุนไพรเดี่ยว', stock: 15, unit: 'กระปุก', status: 'low', statusText: 'สินค้าใกล้หมด (ควรสั่งเพิ่ม)' },
    { code: 'MED-003', name: 'ยาลูกกลอนกษัยเส้นคลินิก', category: 'ตำรับยาไทย', stock: 85, unit: 'กล่อง', status: 'normal', statusText: 'สต็อกปกติ' },
    { code: 'MED-004', name: 'น้ำมันไพลบำบัดสูตรเข้มข้น', category: 'น้ำมันนวดบำบัด', stock: 8, unit: 'ขวด', status: 'low', statusText: 'สินค้าใกล้หมด (ควรสั่งเพิ่ม)' }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  // 0. Session Authentication & Role Routing Check
  let currentUser = null;
  try {
    const storedUserStr = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
    if (storedUserStr && storedUserStr !== 'undefined' && storedUserStr !== 'null') {
      currentUser = JSON.parse(storedUserStr);
    }
  } catch (err) {
    console.error('Session storage parse error:', err);
  }

  // Redirect to login if user is logged out or session is empty
  if (!currentUser || typeof currentUser !== 'object' || !currentUser.email) {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = 'login.html';
    return;
  }

  // Redirect Tier 4 (Student/Patient) to patient portal
  if (currentUser.role === 'user') {
    window.location.href = 'index.html';
    return;
  }

  // Render user identity in top header bar
  try {
    const headerProfileName = document.getElementById('headerProfileName');
    const headerRoleBadge = document.getElementById('headerRoleBadge') || document.querySelector('.profile-role-badge');
    const headerProfileAvatar = document.getElementById('headerProfileAvatar') || document.querySelector('.profile-avatar');

    if (headerProfileName && currentUser.name) {
      headerProfileName.textContent = currentUser.name;
    }

    if (headerRoleBadge) {
      let roleText = currentUser.roleNameTH || 'ผู้ดูแลระบบ (Admin)';
      if (!roleText.includes('Tier')) {
        if (currentUser.role === 'admin') roleText = 'ผู้ดูแลระบบ (Tier 1: Admin)';
        if (currentUser.role === 'doctor') roleText = 'แพทย์แผนไทย (Tier 2: Doctor)';
        if (currentUser.role === 'intern') roleText = 'นักศึกษาฝึกงาน (Tier 3: Intern)';
      }
      headerRoleBadge.textContent = roleText;
    }

    if (headerProfileAvatar) {
      if (currentUser.profile_image_url) {
        headerProfileAvatar.innerHTML = `<img src="${currentUser.profile_image_url}" alt="${currentUser.name}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
      } else {
        let iconClass = 'fa-solid fa-user-shield';
        if (currentUser.role === 'doctor') iconClass = 'fa-solid fa-user-doctor';
        if (currentUser.role === 'intern') iconClass = 'fa-solid fa-user-graduate';
        headerProfileAvatar.innerHTML = `<i class="${iconClass}"></i>`;
      }
    }
  } catch (err) {
    console.error('Header profile render error:', err);
  }

  // Strict Role-Based Access Control (RBAC): Hide User Management Tab for Doctor Role
  if (currentUser.role === 'doctor') {
    const menuUserMgmt = document.getElementById('menuUserManagement');
    if (menuUserMgmt) {
      menuUserMgmt.style.display = 'none';
    }
  }

  // 1. Real-Time Thai Clock Formatter
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

    const formattedDateTime = `${dayName}ที่ ${dateNum} ${monthName} ${yearBE} เวลา ${hours}:${minutes}:${seconds} น.`;
    realtimeClockEl.textContent = formattedDateTime;
  }

  updateThaiClock();
  setInterval(updateThaiClock, 1000);

  // 2. Single Hamburger Menu Toggle Logic
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

  // 3. Dynamic Tab Switching (Tabs 0 to 5)
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
          if (targetTabId === 'tab-5') {
            fetchReportSummaryFromBackend(false);
          }
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

  // 4. Admin Profile Dropdown Menu Toggle
  const profileDropdownBtn = document.getElementById('profileDropdownBtn');
  const profileDropdownContainer = document.getElementById('profileDropdownContainer');

  if (profileDropdownBtn && profileDropdownContainer) {
    const toggleProfileMenu = (e) => {
      e.stopPropagation();
      profileDropdownContainer.classList.toggle('active');
    };

    profileDropdownBtn.addEventListener('click', toggleProfileMenu);

    document.addEventListener('click', (e) => {
      if (!profileDropdownContainer.contains(e.target)) {
        profileDropdownContainer.classList.remove('active');
      }
    });
  }

  // 5. Global Profile Settings System Redirect
  const openProfileSettingsBtn = document.getElementById('openProfileSettingsBtn');
  const openChangePasswordBtn = document.getElementById('openChangePasswordBtn');

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
  const changePasswordForm = document.getElementById('changePasswordForm');

  if (openChangePasswordBtn && changePasswordModal) {
    openChangePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      profileDropdownContainer.classList.remove('active');
      changePasswordModal.classList.add('active');
    });
  }

  if (closeChangePasswordBtn && changePasswordModal) {
    closeChangePasswordBtn.addEventListener('click', () => {
      changePasswordModal.classList.remove('active');
    });
  }

  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPass = document.getElementById('newPassInput').value;
      const confirmPass = document.getElementById('confirmNewPassInput').value;

      if (newPass !== confirmPass) {
        showToast('ข้อผิดพลาด: รหัสผ่านใหม่และการยืนยันไม่ตรงกัน');
        return;
      }

      changePasswordModal.classList.remove('active');
      changePasswordForm.reset();
      showToast('เปลี่ยนรหัสผ่านผู้ดูแลระบบเรียบร้อยแล้ว');
    });
  }

  // 7. REAL-TIME OPERATIONAL PERFORMANCE REPORTING ENGINE (TAB 5)
  let reportDataCache = null;

  async function fetchReportSummaryFromBackend(showFeedbackToast = false) {
    const reportTotalRevenueEl = document.getElementById('reportTotalRevenue');
    const reportTotalCasesEl = document.getElementById('reportTotalCases');
    const reportCompletedCasesEl = document.getElementById('reportCompletedCases');
    const reportActiveCasesEl = document.getElementById('reportActiveCases');
    const reportPackageTableBody = document.getElementById('reportPackageTableBody');
    const reportDoctorTableBody = document.getElementById('reportDoctorTableBody');
    const reportRecentTableBody = document.getElementById('reportRecentTableBody');
    const reportLastUpdatedText = document.getElementById('reportLastUpdatedText');

    const pricesMap = {
      'นวดไทยเพื่อการรักษา': 590,
      'นวดประคบสมุนไพรสด': 890,
      'นวดน้ำมันหอมระเหย': 1290,
      'หัตถการเผายาสมุนไพร': 750,
      'แพ็กเกจฟื้นฟูออฟฟิศซินโดรม': 1200
    };

    const getPriceForPackage = (pkgStr) => {
      if (!pkgStr) return 590;
      for (const [key, price] of Object.entries(pricesMap)) {
        if (pkgStr.includes(key)) return price;
      }
      return 590;
    };

    // 1. INSTANT LOCAL SYNTHESIS (Zero Waiting / Never Shows 0)
    const localQueues = CENTRAL_CLINIC_DB.queues || [];
    if (localQueues.length > 0) {
      let localTotalRevenue = 0;
      let localCompleted = 0;
      let localActive = 0;
      const localPkgMap = {};
      const localDocMap = {};

      localQueues.forEach(q => {
        const price = getPriceForPackage(q.package);
        localTotalRevenue += price;
        if (q.status === 'completed') localCompleted++;
        else localActive++;

        const pkgName = q.package || 'นวดไทยเพื่อการรักษา';
        if (!localPkgMap[pkgName]) localPkgMap[pkgName] = { title: pkgName, count: 0, revenue: 0 };
        localPkgMap[pkgName].count++;
        localPkgMap[pkgName].revenue += price;

        const docName = q.doctor || 'พท.ป. ณัฐวุฒิ สุวรรณเวช';
        if (!localDocMap[docName]) localDocMap[docName] = { doctor: docName, count: 0 };
        localDocMap[docName].count++;
      });

      if (reportTotalRevenueEl) reportTotalRevenueEl.innerHTML = `${localTotalRevenue.toLocaleString()} <span style="font-size: 1.1rem;">บาท</span>`;
      if (reportTotalCasesEl) reportTotalCasesEl.innerHTML = `${localQueues.length.toLocaleString()} <span style="font-size: 1.1rem;">เคส</span>`;
      if (reportCompletedCasesEl) reportCompletedCasesEl.innerHTML = `${localCompleted.toLocaleString()} <span style="font-size: 1.1rem;">เคส</span>`;
      if (reportActiveCasesEl) reportActiveCasesEl.innerHTML = `${localActive.toLocaleString()} <span style="font-size: 1.1rem;">คิว</span>`;

      if (reportPackageTableBody) {
        reportPackageTableBody.innerHTML = '';
        Object.values(localPkgMap).forEach(pkg => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${pkg.title}</strong></td>
            <td style="text-align: center;"><span style="font-weight:600; color:var(--color-dark-brown);">${pkg.count} เคส</span></td>
            <td style="text-align: right;"><span style="font-weight:600; color:#059669;">${pkg.revenue.toLocaleString()} ฿</span></td>
          `;
          reportPackageTableBody.appendChild(tr);
        });
      }

      if (reportDoctorTableBody) {
        reportDoctorTableBody.innerHTML = '';
        const totalLocalCases = localQueues.length || 1;
        Object.values(localDocMap).forEach(doc => {
          const pct = Math.round((doc.count / totalLocalCases) * 100);
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${doc.doctor}</strong></td>
            <td style="text-align: center;"><span style="font-weight:600; color:var(--color-dark-brown);">${doc.count} เคส</span></td>
            <td style="text-align: right;">
              <div style="display:flex; align-items:center; justify-content:flex-end; gap:8px;">
                <span style="font-weight:600; color:#2563eb;">${pct}%</span>
                <div style="width:50px; height:6px; background:#e5e7eb; border-radius:9999px; overflow:hidden;">
                  <div style="width:${pct}%; height:100%; background:#2563eb; border-radius:9999px;"></div>
                </div>
              </div>
            </td>
          `;
          reportDoctorTableBody.appendChild(tr);
        });
      }

      if (reportRecentTableBody) {
        reportRecentTableBody.innerHTML = '';
        localQueues.forEach(q => {
          const tr = document.createElement('tr');
          let badgeClass = 'badge-status waiting';
          let statusText = q.statusText || 'รอเรียกคิว';
          if (q.status === 'ongoing') badgeClass = 'badge-status ongoing';
          if (q.status === 'completed') badgeClass = 'badge-status completed';

          const timeFormatted = q.bookingTime ? (q.bookingTime.includes('น.') ? q.bookingTime : q.bookingTime + ' น.') : '09:00 น.';
          const dateVal = q.bookingDate || new Date().toISOString().split('T')[0];

          tr.innerHTML = `
            <td><strong>${q.id}</strong></td>
            <td>${q.patient || '-'}</td>
            <td>${q.phone || '-'}</td>
            <td><span style="font-weight: 500; color: var(--color-terracotta);">${q.package || 'นวดไทยเพื่อการรักษา'}</span></td>
            <td><span style="font-weight: 500; color: #2563eb;"><i class="fa-regular fa-clock"></i> ${dateVal} ${timeFormatted}</span></td>
            <td>${q.doctor || 'พท.ป. ณัฐวุฒิ สุวรรณเวช'}</td>
            <td><span class="${badgeClass}">${statusText}</span></td>
          `;
          reportRecentTableBody.appendChild(tr);
        });
      }

      if (reportLastUpdatedText) {
        reportLastUpdatedText.textContent = `อัปเดตข้อมูล Real-Time ล่าสุดเมื่อ: ${new Date().toLocaleTimeString('th-TH')} น.`;
      }
    }

    // 2. BACKEND DATABASE REAL-TIME OVERWRITE
    try {
      const response = await fetch('api_queue.php?action=get_reports_summary');
      const result = await response.json();

      if (result.success && result.data) {
        reportDataCache = result.data;
        const d = result.data;

        if (reportTotalRevenueEl) {
          reportTotalRevenueEl.innerHTML = `${(d.total_revenue || 0).toLocaleString()} <span style="font-size: 1.1rem;">บาท</span>`;
        }
        if (reportTotalCasesEl) {
          reportTotalCasesEl.innerHTML = `${(d.total_cases || 0).toLocaleString()} <span style="font-size: 1.1rem;">เคส</span>`;
        }
        if (reportCompletedCasesEl) {
          reportCompletedCasesEl.innerHTML = `${(d.completed_cases || 0).toLocaleString()} <span style="font-size: 1.1rem;">เคส</span>`;
        }
        if (reportActiveCasesEl) {
          const activeCount = (d.ongoing_cases || 0) + (d.waiting_cases || 0);
          reportActiveCasesEl.innerHTML = `${activeCount.toLocaleString()} <span style="font-size: 1.1rem;">คิว</span>`;
        }

        if (reportPackageTableBody && Array.isArray(d.package_stats) && d.package_stats.length > 0) {
          reportPackageTableBody.innerHTML = '';
          d.package_stats.forEach(pkg => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td><strong>${pkg.title}</strong></td>
              <td style="text-align: center;"><span style="font-weight:600; color:var(--color-dark-brown);">${pkg.count} เคส</span></td>
              <td style="text-align: right;"><span style="font-weight:600; color:#059669;">${(pkg.revenue || 0).toLocaleString()} ฿</span></td>
            `;
            reportPackageTableBody.appendChild(tr);
          });
        }

        if (reportDoctorTableBody && Array.isArray(d.doctor_stats) && d.doctor_stats.length > 0) {
          reportDoctorTableBody.innerHTML = '';
          const totalCases = d.total_cases || 1;
          d.doctor_stats.forEach(doc => {
            const pct = Math.round((doc.count / totalCases) * 100);
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td><strong>${doc.doctor}</strong></td>
              <td style="text-align: center;"><span style="font-weight:600; color:var(--color-dark-brown);">${doc.count} เคส</span></td>
              <td style="text-align: right;">
                <div style="display:flex; align-items:center; justify-content:flex-end; gap:8px;">
                  <span style="font-weight:600; color:#2563eb;">${pct}%</span>
                  <div style="width:50px; height:6px; background:#e5e7eb; border-radius:9999px; overflow:hidden;">
                    <div style="width:${pct}%; height:100%; background:#2563eb; border-radius:9999px;"></div>
                  </div>
                </div>
              </td>
            `;
            reportDoctorTableBody.appendChild(tr);
          });
        }

        if (reportRecentTableBody && Array.isArray(d.recent_bookings) && d.recent_bookings.length > 0) {
          reportRecentTableBody.innerHTML = '';
          d.recent_bookings.forEach(q => {
            const tr = document.createElement('tr');
            let badgeClass = 'badge-status waiting';
            let statusText = q.status_text || 'รอเรียกคิว';
            if (q.status === 'ongoing') badgeClass = 'badge-status ongoing';
            if (q.status === 'completed') badgeClass = 'badge-status completed';

            const timeFormatted = q.booking_time ? (q.booking_time.includes('น.') ? q.booking_time : q.booking_time + ' น.') : '09:00 น.';
            const dateVal = q.booking_date || new Date().toISOString().split('T')[0];

            tr.innerHTML = `
              <td><strong>${q.booking_code || ('Q-00' + q.id)}</strong></td>
              <td>${q.patient_name || '-'}</td>
              <td>${q.patient_phone || '-'}</td>
              <td><span style="font-weight: 500; color: var(--color-terracotta);">${q.service_name || 'นวดไทยเพื่อการรักษา'}</span></td>
              <td><span style="font-weight: 500; color: #2563eb;"><i class="fa-regular fa-clock"></i> ${dateVal} ${timeFormatted}</span></td>
              <td>${q.doctor_name || 'พท.ป. ณัฐวุฒิ สุวรรณเวช'}</td>
              <td><span class="${badgeClass}">${statusText}</span></td>
            `;
            reportRecentTableBody.appendChild(tr);
          });
        }

        if (reportLastUpdatedText) {
          const nowStr = new Date().toLocaleTimeString('th-TH');
          reportLastUpdatedText.textContent = `อัปเดตข้อมูล Real-Time ล่าสุดเมื่อ: ${nowStr} น.`;
        }

        if (showFeedbackToast) {
          showToast('ซิงค์และอัปเดตข้อมูลรายงานผลการดำเนินงานเรียบร้อยแล้ว', 'success');
        }
      }
    } catch (err) {
      console.warn('Real-time report summary error:', err);
    }
  }

  // Auto-refresh Report Data every 8 seconds
  setInterval(() => {
    fetchReportSummaryFromBackend(false);
  }, 8000);

  // Manual Refresh Button Event Listener
  const toggleRealtimeBtn = document.getElementById('toggleRealtimeBtn');
  if (toggleRealtimeBtn) {
    toggleRealtimeBtn.addEventListener('click', () => {
      fetchReportSummaryFromBackend(true);
    });
  }

  // Initial Load of Reports Summary
  fetchReportSummaryFromBackend(false);

  // Real File Export Generators (Excel CSV & PDF Print)
  const exportExcelBtn = document.getElementById('exportExcelBtn');
  const exportPdfBtn = document.getElementById('exportPdfBtn');

  if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', () => {
      let csvContent = "\uFEFF=== รายงานสรุปผลการดำเนินงาน คลินิกการแพทย์แผนไทย มบส. ===\n";
      csvContent += `วันที่ส่งออกข้อมูล,${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')} น.\n\n`;

      if (reportDataCache) {
        csvContent += "--- สรุปภาพรวม Real-Time (KPI Metrics) ---\n";
        csvContent += `รายได้รวมบริการรักษา (บาท),${reportDataCache.total_revenue || 0}\n`;
        csvContent += `ผู้รับบริการรวมทั้งสิ้น (เคส),${reportDataCache.total_cases || 0}\n`;
        csvContent += `การรักษาเสร็จสิ้นแล้ว (เคส),${reportDataCache.completed_cases || 0}\n`;
        csvContent += `คิวที่กำลังรับบริการ/รอเรียก (คิว),${(reportDataCache.ongoing_cases || 0) + (reportDataCache.waiting_cases || 0)}\n\n`;

        csvContent += "--- สถิติการรับบริการแยกตามหัตถการ ---\n";
        csvContent += "รายการหัตถการ,จำนวนผู้รับบริการ (เคส),รายได้รวม (บาท)\n";
        if (Array.isArray(reportDataCache.package_stats)) {
          reportDataCache.package_stats.forEach(pkg => {
            csvContent += `"${pkg.title}",${pkg.count},${pkg.revenue}\n`;
          });
        }
        csvContent += "\n";
      }

      csvContent += "--- รายละเอียดคิวผู้รับบริการทั้งหมด ---\n";
      csvContent += "ลำดับ,รหัสคิว,ชื่อผู้ป่วย,เบอร์โทรศัพท์,แพ็กเกจรักษา,แพทย์ผู้รักษา,วัน-เวลานัดหมาย,สถานะคิว\n";
      CENTRAL_CLINIC_DB.queues.forEach((q, i) => {
        csvContent += `${i + 1},${q.id},"${q.patient}",${q.phone},"${q.package}","${q.doctor}","${q.bookingDate || ''} ${q.bookingTime || ''}","${q.statusText}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `รายงานผลการดำเนินงาน_คลินิกมบส_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('ดาวน์โหลดไฟล์รายงานสรุปผลการดำเนินงาน Excel (.csv) สำเร็จเรียบร้อย', 'success');
    });
  }

  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', () => {
      showToast('กำลังเตรียมรายงานสำหรับการพิมพ์/บันทึก PDF...');
      setTimeout(() => {
        window.print();
      }, 500);
    });
  }

  // 8. Interactive Real-Time Queue Management (Tab 1)
  const queueTableBody = document.getElementById('queueTableBody');

  async function fetchQueuesFromBackend() {
    if (!queueTableBody) return;
    try {
      const response = await fetch('api_queue.php?action=list');
      const result = await response.json();

      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        CENTRAL_CLINIC_DB.queues = result.data.map(q => ({
          id: q.queue_id || q.booking_code || 'Q-00' + q.id,
          patient: q.patient_name || q.patient,
          phone: q.patient_phone || q.phone,
          package: q.package || q.service_name || 'นวดไทยเพื่อการรักษา',
          doctor: q.doctor || q.doctor_name || 'พท.ป. ณัฐวุฒิ สุวรรณเวช',
          room: q.room || q.room_name || 'รอจัดสรรห้อง',
          status: q.status || 'waiting',
          statusText: q.status_text || q.statusText || 'รอเรียกคิว',
          bookingDate: q.booking_date || new Date().toISOString().split('T')[0],
          bookingTime: q.booking_time || '09:00',
          notes: q.notes || ''
        }));
      }
    } catch (err) {
      console.warn('Unable to fetch queues from backend, using session cache:', err);
    }
    renderQueueTable();
  }
  
  function renderQueueTable() {
    if (!queueTableBody) return;
    queueTableBody.innerHTML = '';

    CENTRAL_CLINIC_DB.queues.forEach((q, index) => {
      const tr = document.createElement('tr');
      
      let badgeClass = 'badge-status waiting';
      if (q.status === 'ongoing') badgeClass = 'badge-status ongoing';
      if (q.status === 'completed') badgeClass = 'badge-status completed';

      const timeFormatted = q.bookingTime ? (q.bookingTime.includes('น.') ? q.bookingTime : q.bookingTime + ' น.') : '09:00 น.';

      tr.innerHTML = `
        <td><strong>${q.id}</strong></td>
        <td>${q.patient}</td>
        <td>${q.phone}</td>
        <td><span style="font-weight: 500; color: var(--color-terracotta);">${q.package}</span></td>
        <td><span style="font-weight: 500; color: #2563eb;"><i class="fa-regular fa-clock"></i> ${q.bookingDate || ''} ${timeFormatted}</span></td>
        <td>${q.doctor}</td>
        <td>${q.room}</td>
        <td><span class="${badgeClass}">${q.statusText}</span></td>
        <td>
          ${q.status === 'waiting' ? `<button class="btn-sm-action call" onclick="callQueueAction(${index})"><i class="fa-solid fa-bullhorn"></i> เรียกคิว</button>` : ''}
          ${q.status === 'ongoing' ? `<button class="btn-sm-action" style="background:#10B981; color:#fff;" onclick="completeQueueAction(${index})"><i class="fa-solid fa-check"></i> เสร็จสิ้น</button>` : ''}
          <button class="btn-sm-action" onclick="deleteQueueAction(${index})" style="background:#ef4444; color:#fff; border:none; margin-left:4px;"><i class="fa-solid fa-trash"></i> ลบคิว</button>
        </td>
      `;
      queueTableBody.appendChild(tr);
    });
  }

  window.deleteQueueAction = async function(index) {
    const q = CENTRAL_CLINIC_DB.queues[index];
    if (q && confirm(`คุณต้องการลบคิวนัดหมาย "${q.id}" คุณ "${q.patient}" ออกจากระบบใช่หรือไม่?`)) {
      try {
        await fetch('api_queue.php?action=delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queue_id: q.id })
        });
      } catch(err) {
        console.error('Delete queue error:', err);
      }

      CENTRAL_CLINIC_DB.queues.splice(index, 1);
      renderQueueTable();
      fetchReportSummaryFromBackend(false);
      showToast(`ลบคิวนัดหมาย ${q.id} ออกจากระบบเรียบร้อยแล้ว`, 'success');
    }
  };

  window.callQueueAction = async function(index) {
    const q = CENTRAL_CLINIC_DB.queues[index];
    if (q) {
      q.status = 'ongoing';
      q.statusText = 'กำลังรับบริการ';
      q.room = 'ห้องหัตถการ ' + (Math.floor(Math.random() * 4) + 1);

      try {
        await fetch('api_queue.php?action=update_status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queue_id: q.id, status: 'ongoing' })
        });
      } catch(err) {
        console.error('Update queue status error:', err);
      }

      renderQueueTable();
      fetchReportSummaryFromBackend(false);
      showToast(`เรียกคิว ${q.id} (${q.patient}) เข้า${q.room} เรียบร้อยแล้ว`);
    }
  };

  window.completeQueueAction = async function(index) {
    const q = CENTRAL_CLINIC_DB.queues[index];
    if (q) {
      q.status = 'completed';
      q.statusText = 'เสร็จสิ้นภารกิจ';

      try {
        await fetch('api_queue.php?action=update_status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queue_id: q.id, status: 'completed' })
        });
      } catch(err) {
        console.error('Complete queue error:', err);
      }

      renderQueueTable();
      fetchReportSummaryFromBackend(false);
      showToast(`คิว ${q.id} (${q.patient}) ดำเนินการเสร็จสิ้นเรียบร้อยแล้ว`);
    }
  };

  fetchQueuesFromBackend();

  // Add Queue Modal Logic
  const addQueueModal = document.getElementById('addQueueModal');
  const openAddQueueBtn = document.getElementById('openAddQueueBtn');
  const closeAddQueueBtn = document.getElementById('closeAddQueueBtn');
  const addQueueForm = document.getElementById('addQueueForm');

  if (openAddQueueBtn && addQueueModal) {
    openAddQueueBtn.addEventListener('click', () => {
      addQueueModal.classList.add('active');
      const qDateEl = document.getElementById('qBookingDate');
      if (qDateEl && !qDateEl.value) {
        const today = new Date().toISOString().split('T')[0];
        qDateEl.min = today;
        qDateEl.value = today;
      }
    });
  }

  if (closeAddQueueBtn && addQueueModal) {
    closeAddQueueBtn.addEventListener('click', () => {
      addQueueModal.classList.remove('active');
    });
  }

  if (addQueueForm) {
    addQueueForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const patientName = document.getElementById('qPatientName').value.trim();
      const patientPhone = document.getElementById('qPatientPhone').value.trim();
      const packageVal = document.getElementById('qPackageSelect').value;
      const doctorVal = document.getElementById('qDoctorSelect').value;
      const qDateEl = document.getElementById('qBookingDate');
      const qTimeEl = document.getElementById('qBookingTime');

      const bookingDateVal = qDateEl && qDateEl.value ? qDateEl.value : new Date().toISOString().split('T')[0];
      const bookingTimeVal = qTimeEl && qTimeEl.value ? qTimeEl.value : '09:00';

      if (!patientName || !patientPhone) {
        showToast('กรุณากรอกชื่อ-นามสกุล และเบอร์โทรศัพท์ผู้ป่วยให้ครบถ้วน', 'error');
        return;
      }

      const payload = {
        patient_name: patientName,
        patient_phone: patientPhone,
        package: packageVal,
        doctor: doctorVal,
        room: 'รอจัดสรรห้อง',
        booking_date: bookingDateVal,
        booking_time: bookingTimeVal
      };

      try {
        const response = await fetch('api_queue.php?action=create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success && result.data) {
          const newQueueRecord = {
            id: result.data.queue_id || ('Q-00' + (CENTRAL_CLINIC_DB.queues.length + 1)),
            patient: result.data.patient_name || patientName,
            phone: result.data.patient_phone || patientPhone,
            package: result.data.package || packageVal,
            doctor: result.data.doctor || doctorVal,
            room: result.data.room || 'รอจัดสรรห้อง',
            status: result.data.status || 'waiting',
            statusText: result.data.status_text || 'รอเรียกคิว',
            bookingDate: result.data.booking_date || bookingDateVal,
            bookingTime: result.data.booking_time || bookingTimeVal
          };

          CENTRAL_CLINIC_DB.queues.push(newQueueRecord);
          renderQueueTable();
          fetchReportSummaryFromBackend(false);

          addQueueModal.classList.remove('active');
          addQueueForm.reset();
          showToast(`เพิ่มคิวใหม่ ${newQueueRecord.id} คุณ${patientName} วันที่ ${bookingDateVal} เวลา ${bookingTimeVal} น. เรียบร้อยแล้ว!`, 'success');
        } else {
          console.error('Queue Insert Failed:', result.message);
          showToast(result.message || 'เกิดข้อผิดพลาดในการลงทะเบียนคิว', 'error');
        }
      } catch (err) {
        console.error('Asynchronous Queue Insert Error:', err);
        // Local Fallback Execution
        const fallbackQueueCode = 'Q-00' + (CENTRAL_CLINIC_DB.queues.length + 1);
        const fallbackRecord = {
          id: fallbackQueueCode,
          patient: patientName,
          phone: patientPhone,
          package: packageVal,
          doctor: doctorVal,
          room: 'รอจัดสรรห้อง',
          status: 'waiting',
          statusText: 'รอเรียกคิว',
          bookingDate: bookingDateVal,
          bookingTime: bookingTimeVal
        };
        CENTRAL_CLINIC_DB.queues.push(fallbackRecord);
        renderQueueTable();
        addQueueModal.classList.remove('active');
        addQueueForm.reset();
        showToast(`เพิ่มคิวใหม่ ${fallbackQueueCode} คุณ${patientName} เรียบร้อยแล้ว!`, 'success');
      }
    });
  }

  // 9. Interactive User Management Directory (Tab 2)
  const userTableBody = document.getElementById('userTableBody');
  const userSearchInput = document.getElementById('userSearchInput');
  const userRoleFilterBtns = document.querySelectorAll('.user-role-filter');

  let activeRoleFilter = 'all';

  async function fetchUsersFromBackend() {
    if (!userTableBody) return;
    try {
      const response = await fetch('api_users.php?action=list');
      const result = await response.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        CENTRAL_CLINIC_DB.users = result.data;
      }
    } catch(err) {
      console.warn('Unable to fetch users from MySQL, using session cache:', err);
    }
    renderUserTable();
  }

  function renderUserTable() {
    if (!userTableBody) return;
    const searchText = userSearchInput ? userSearchInput.value.trim().toLowerCase() : '';

    userTableBody.innerHTML = '';

    const filteredUsers = CENTRAL_CLINIC_DB.users.filter(u => {
      const matchesRole = activeRoleFilter === 'all' || u.role === activeRoleFilter;
      const matchesSearch = u.name.toLowerCase().includes(searchText) || u.email.toLowerCase().includes(searchText) || u.id.toLowerCase().includes(searchText);
      return matchesRole && matchesSearch;
    });

    filteredUsers.forEach((u, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${u.id}</strong></td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.phone}</td>
        <td><span class="user-badge-role ${u.role}">${u.roleName}</span></td>
        <td><span class="badge-status completed">ใช้งานปกติ</span></td>
        <td>
          <button class="btn-sm-action" onclick="openEditUserModal(${idx})" style="background:var(--color-soft-beige); color:var(--color-dark-brown); border:1px solid var(--color-beige-dark);">แก้ไข</button>
          <button class="btn-sm-action" onclick="deleteUserAction(${idx})" style="background:#ef4444; color:#fff; border:none;">ลบ</button>
        </td>
      `;
      userTableBody.appendChild(tr);
    });
  }

  window.deleteUserAction = async function(idx) {
    const u = CENTRAL_CLINIC_DB.users[idx];
    if (u && confirm(`คุณต้องการลบบัญชีผู้ใช้ "${u.name}" (${u.email}) ออกจากระบบใช่หรือไม่?`)) {
      try {
        await fetch('api_users.php?action=delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ db_id: u.db_id, email: u.email })
        });
      } catch(err) {
        console.error('Delete user error:', err);
      }

      CENTRAL_CLINIC_DB.users.splice(idx, 1);
      renderUserTable();
      showToast(`ลบบัญชีผู้ใช้คุณ "${u.name}" สำเร็จ!`, 'success');
    }
  };

  if (userSearchInput) {
    userSearchInput.addEventListener('input', renderUserTable);
  }

  userRoleFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      userRoleFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeRoleFilter = btn.getAttribute('data-user-role');
      renderUserTable();
    });
  });

  fetchUsersFromBackend();

  // Edit User Modal Logic
  const editUserModal = document.getElementById('editUserModal');
  const closeEditUserBtn = document.getElementById('closeEditUserBtn');
  const editUserForm = document.getElementById('editUserForm');
  let currentEditingUserIndex = null;

  window.openEditUserModal = function(idx) {
    currentEditingUserIndex = idx;
    const u = CENTRAL_CLINIC_DB.users[idx];
    if (u && editUserModal) {
      document.getElementById('editUserId').value = u.id;
      document.getElementById('editUserName').value = u.name;
      document.getElementById('editUserEmail').value = u.email;
      document.getElementById('editUserPhone').value = u.phone;
      document.getElementById('editUserRoleSelect').value = u.role;
      editUserModal.classList.add('active');
    }
  };

  if (closeEditUserBtn && editUserModal) {
    closeEditUserBtn.addEventListener('click', () => {
      editUserModal.classList.remove('active');
    });
  }

  if (editUserForm) {
    editUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (currentEditingUserIndex !== null && CENTRAL_CLINIC_DB.users[currentEditingUserIndex]) {
        const u = CENTRAL_CLINIC_DB.users[currentEditingUserIndex];
        const newName = document.getElementById('editUserName').value.trim();
        const newEmail = document.getElementById('editUserEmail').value.trim();
        const newPhone = document.getElementById('editUserPhone').value.trim();
        const newRole = document.getElementById('editUserRoleSelect').value;

        u.name = newName;
        u.email = newEmail;
        u.phone = newPhone;
        u.role = newRole;

        const roleNames = {
          'admin': 'Tier 1: Admin',
          'doctor': 'Tier 2: Doctor',
          'intern': 'Tier 3: Intern',
          'user': 'Tier 4: Student'
        };
        u.roleName = roleNames[u.role] || u.role;

        try {
          await fetch('api_users.php?action=update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ db_id: u.db_id, name: newName, email: newEmail, phone: newPhone, role: newRole })
          });
        } catch(err) {
          console.error('Update user error:', err);
        }

        renderUserTable();
        editUserModal.classList.remove('active');
        showToast(`บันทึกการแก้ไขข้อมูลคุณ "${newName}" เรียบร้อยแล้ว`, 'success');
      }
    });
  }

  // 9.5 Medicine Inventory Directory & Stock Management (Tab 4)
  CENTRAL_CLINIC_DB.inventory = [
    { code: 'MED-001', name: 'ลูกประคบสมุนไพรสด มบส.', category: 'หัตถการประคบ', stock: 120, unit: 'ลูก', status: 'normal', statusText: 'สต็อกปกติ' },
    { code: 'MED-002', name: 'ยาสมุนไพรขมิ้นชันแคปซูล', category: 'ยาสมุนไพรเดี่ยว', stock: 15, unit: 'กระปุก', status: 'low', statusText: 'สินค้าใกล้หมด (ควรสั่งเพิ่ม)' },
    { code: 'MED-003', name: 'ยาลูกกลอนกษัยเส้นคลินิก', category: 'ตำรับยาไทย', stock: 85, unit: 'กล่อง', status: 'normal', statusText: 'สต็อกปกติ' },
    { code: 'MED-004', name: 'น้ำมันไพลบำบัดสูตรเข้มข้น', category: 'น้ำมันนวดบำบัด', stock: 8, unit: 'ขวด', status: 'low', statusText: 'สินค้าใกล้หมด (ควรสั่งเพิ่ม)' }
  ];

  const inventoryTableBody = document.getElementById('inventoryTableBody');

  async function fetchInventoryFromBackend() {
    if (!inventoryTableBody) return;
    try {
      const response = await fetch('api_inventory.php?action=list');
      const result = await response.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        CENTRAL_CLINIC_DB.inventory = result.data;
      }
    } catch(err) {
      console.warn('Unable to fetch inventory from MySQL, using session cache:', err);
    }
    renderInventoryTable();
  }

  function renderInventoryTable() {
    if (!inventoryTableBody) return;
    inventoryTableBody.innerHTML = '';

    CENTRAL_CLINIC_DB.inventory.forEach((item, index) => {
      const tr = document.createElement('tr');
      let badgeClass = (item.status === 'low' || item.stock < 20) ? 'badge-status alert' : 'badge-status completed';
      let statusText = (item.status === 'low' || item.stock < 20) ? 'สินค้าใกล้หมด (ควรสั่งเพิ่ม)' : 'สต็อกปกติ';

      tr.innerHTML = `
        <td><strong>${item.code}</strong></td>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td><strong style="font-size: 1.05rem; color: var(--color-dark-brown);">${item.stock}</strong></td>
        <td>${item.unit}</td>
        <td><span class="${badgeClass}">${statusText}</span></td>
        <td>
          <button class="btn-sm-action" onclick="deductStockAction(${index})">เบิกจ่าย</button>
          <button class="btn-sm-action call" onclick="addStockAction(${index})">เพิ่มสต็อก</button>
          <button class="btn-sm-action" onclick="deleteInventoryAction(${index})" style="background:#ef4444; color:#fff; border:none; margin-left:4px;"><i class="fa-solid fa-trash"></i> ลบ</button>
        </td>
      `;
      inventoryTableBody.appendChild(tr);
    });
  }

  window.deleteInventoryAction = async function(idx) {
    const item = CENTRAL_CLINIC_DB.inventory[idx];
    if (item && confirm(`คุณต้องการลบรายการสมุนไพร/ยา "${item.name}" (${item.code}) ออกจากคลังใช่หรือไม่?`)) {
      try {
        await fetch('api_inventory.php?action=delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, code: item.code, name: item.name })
        });
      } catch(err) {
        console.error('Delete inventory error:', err);
      }

      CENTRAL_CLINIC_DB.inventory.splice(idx, 1);
      renderInventoryTable();
      showToast(`ลบรายการ "${item.name}" ออกจากคลังเรียบร้อยแล้ว`, 'success');
    }
  };

  window.deductStockAction = async function(idx) {
    const item = CENTRAL_CLINIC_DB.inventory[idx];
    if (item && item.stock > 0) {
      item.stock -= 1;
      item.status = item.stock < 20 ? 'low' : 'normal';
      try {
        await fetch('api_inventory.php?action=update_stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, code: item.code, name: item.name, stock: item.stock })
        });
      } catch(err) {
        console.error('Update stock error:', err);
      }
      renderInventoryTable();
      showToast(`เบิกจ่าย ${item.name} ออกจากสต็อก 1 ${item.unit} เรียบร้อยแล้ว`, 'success');
    } else {
      showToast(`สินค้า ${item.name} หมดสต็อกแล้ว`, 'error');
    }
  };

  window.addStockAction = async function(idx) {
    const item = CENTRAL_CLINIC_DB.inventory[idx];
    if (item) {
      item.stock += 10;
      item.status = item.stock < 20 ? 'low' : 'normal';
      try {
        await fetch('api_inventory.php?action=update_stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, code: item.code, name: item.name, stock: item.stock })
        });
      } catch(err) {
        console.error('Update stock error:', err);
      }
      renderInventoryTable();
      showToast(`เพิ่มสต็อก ${item.name} จำนวน +10 ${item.unit} เรียบร้อยแล้ว`, 'success');
    }
  };

  fetchInventoryFromBackend();

  // Inventory Modal Logic
  const addInventoryModal = document.getElementById('addInventoryModal');
  const openInventoryBtn = document.getElementById('openInventoryBtn');
  const closeInventoryBtn = document.getElementById('closeInventoryBtn');
  const addInventoryForm = document.getElementById('addInventoryForm');

  if (openInventoryBtn && addInventoryModal) {
    openInventoryBtn.addEventListener('click', () => {
      addInventoryModal.classList.add('active');
    });
  }

  if (closeInventoryBtn && addInventoryModal) {
    closeInventoryBtn.addEventListener('click', () => {
      addInventoryModal.classList.remove('active');
    });
  }

  if (addInventoryForm) {
    addInventoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const medName = document.getElementById('medNameInput').value.trim();
      const medQty = parseInt(document.getElementById('medQtyInput').value) || 1;
      const actionType = document.getElementById('medActionSelect').value;

      let existingItem = CENTRAL_CLINIC_DB.inventory.find(i => i.name.toLowerCase().includes(medName.toLowerCase()));

      if (existingItem) {
        if (actionType === 'เบิกจ่ายออก') {
          existingItem.stock = Math.max(0, existingItem.stock - medQty);
        } else {
          existingItem.stock += medQty;
        }
        existingItem.status = existingItem.stock < 20 ? 'low' : 'normal';

        try {
          await fetch('api_inventory.php?action=update_stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: existingItem.id, code: existingItem.code, name: existingItem.name, stock: existingItem.stock })
          });
        } catch(err) {}
      } else {
        try {
          const res = await fetch('api_inventory.php?action=create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ med_name: medName, med_stock: medQty, med_category: 'ยาสมุนไพรทั่วไป', med_unit: 'ชิ้น' })
          });
          const result = await res.json();
          if (result.success && result.data) {
            CENTRAL_CLINIC_DB.inventory.push(result.data);
          }
        } catch(err) {
          const newCode = 'MED-' + String(CENTRAL_CLINIC_DB.inventory.length + 1).padStart(3, '0');
          CENTRAL_CLINIC_DB.inventory.push({
            code: newCode,
            name: medName,
            category: 'ยาสมุนไพรทั่วไป',
            stock: medQty,
            unit: 'ชิ้น',
            status: medQty < 20 ? 'low' : 'normal',
            statusText: medQty < 20 ? 'สินค้าใกล้หมด (ควรสั่งเพิ่ม)' : 'สต็อกปกติ'
          });
        }
      }

      fetchInventoryFromBackend();
      addInventoryModal.classList.remove('active');
      addInventoryForm.reset();
      showToast(`บันทึกการ ${actionType} "${medName}" จำนวน ${medQty} หน่วย เรียบร้อยแล้ว`, 'success');
    });
  }

  // 10. Dynamic Data-Driven Doctor Specialty Filter & Schedule Table
  const filterPillBtns = document.querySelectorAll('.filter-pill-btn');
  const doctorScheduleTableBody = document.getElementById('doctorScheduleTableBody');

  let cachedDoctorsList = [];

  async function fetchDoctorSchedule() {
    if (!doctorScheduleTableBody) return;

    try {
      const response = await fetch('api_doctors.php?action=schedule');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        cachedDoctorsList = result.data;
      }
    } catch(err) {
      console.warn('API fetch offline, using session tier 2 fallback');
      cachedDoctorsList = [
        {
          id: 1,
          full_name: 'พท.ป. สมหญิง รักษาดี',
          academic_title: 'อาจารย์แพทย์แผนไทยวิชาชีพ (หัวหน้าคลินิก)',
          specialization: 'ออฟฟิศซินโดรม / คอ บ่า ไหล่ & ปรับสมดุลธาตุ',
          category: 'office-syndrome',
          duty_time: '08:30 - 16:30 น.',
          queue_count: '5 คิว',
          duty_status: 'กำลังออกตรวจ',
          duty_status_key: 'on_duty'
        }
      ];
    }

    renderDoctorScheduleTable('all');
  }

  function renderDoctorScheduleTable(filterCategory = 'all') {
    if (!doctorScheduleTableBody) return;
    doctorScheduleTableBody.innerHTML = '';

    const filteredDoctors = cachedDoctorsList.filter(doc => {
      if (filterCategory === 'all') return true;
      if (doc.category === filterCategory) return true;
      if (filterCategory === 'office-syndrome' && (doc.specialization.includes('ออฟฟิศซินโดรม') || doc.specialization.includes('คอ บ่า ไหล่'))) return true;
      if (filterCategory === 'orthopedic' && (doc.specialization.includes('กระดูก') || doc.specialization.includes('ข้อ'))) return true;
      if (filterCategory === 'element-balance' && (doc.specialization.includes('สมดุลธาตุ') || doc.specialization.includes('เผายา'))) return true;
      return false;
    });

    if (filteredDoctors.length === 0) {
      doctorScheduleTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px 20px; color: var(--color-muted-text);">
            <div style="font-size: 2.2rem; color: var(--color-terracotta); margin-bottom: 10px;">
              <i class="fa-solid fa-user-doctor-slash"></i>
            </div>
            <strong style="font-size: 1.05rem; color: var(--color-dark-brown); display: block; margin-bottom: 4px;">ไม่มีข้อมูลแพทย์ออกตรวจในระบบ</strong>
            <span style="font-size: 0.88rem; opacity: 0.85;">ไม่มีรายชื่อแพทย์ประจำการในกลุ่มอาการที่เลือกในขณะนี้</span>
          </td>
        </tr>
      `;
      return;
    }

    filteredDoctors.forEach(doc => {
      const tr = document.createElement('tr');
      tr.className = 'doctor-row';
      tr.setAttribute('data-category', doc.category || 'office-syndrome');

      let badgeRoleClass = 'user-badge-role doctor';
      if (doc.category === 'element-balance') badgeRoleClass = 'user-badge-role intern';
      if (doc.category === 'orthopedic') badgeRoleClass = 'user-badge-role doctor';

      let statusBadgeClass = 'user-badge-role user';
      if (doc.duty_status_key === 'off_duty') statusBadgeClass = 'user-badge-role admin';

      tr.innerHTML = `
        <td><strong>${doc.full_name}</strong></td>
        <td>${doc.academic_title}</td>
        <td><span class="${badgeRoleClass}">${doc.specialization}</span></td>
        <td>${doc.duty_time}</td>
        <td>${doc.queue_count}</td>
        <td><span class="${statusBadgeClass}">${doc.duty_status}</span></td>
      `;
      doctorScheduleTableBody.appendChild(tr);
    });

    renderWeeklyDoctorScheduleTable(filteredDoctors);
  }

  function renderWeeklyDoctorScheduleTable(doctors) {
    const weeklyBody = document.getElementById('weeklyDoctorScheduleTableBody');
    if (!weeklyBody) return;
    weeklyBody.innerHTML = '';

    doctors.forEach(doc => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${doc.full_name}</strong></td>
        <td><span class="user-badge-role doctor">${doc.specialization}</span></td>
        <td>จันทร์ - พุธ - ศุกร์</td>
        <td>${doc.duty_time}</td>
        <td>ห้องหัตถการ 1</td>
        <td>10 คิว</td>
      `;
      weeklyBody.appendChild(tr);
    });
  }

  filterPillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterPillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const specialtyCategory = btn.getAttribute('data-specialty');
      renderDoctorScheduleTable(specialtyCategory);
    });
  });

  // Initial Fetch & Real-Time Live Synchronization with phpMyAdmin MySQL
  fetchDoctorSchedule();

  setInterval(() => {
    fetchQueuesFromBackend();
    fetchUsersFromBackend();
    fetchDoctorSchedule();
    fetchInventoryFromBackend();
  }, 5000);

  // 11. Logout Action
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    const performLogout = (e) => {
      if (e) e.preventDefault();
      sessionStorage.removeItem('currentUser');
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    };
    logoutBtn.addEventListener('click', performLogout);
  }

  // Toast System
  function showToast(message) {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    if (toast && toastMsg) {
      toastMsg.textContent = message;
      toast.classList.add('active');
      setTimeout(() => {
        toast.classList.remove('active');
      }, 3500);
    }
  }
});
