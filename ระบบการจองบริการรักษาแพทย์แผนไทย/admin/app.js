/**
 * admin/app.js - Thai Traditional Medicine Clinic Single Page Application (SPA) Logic
 * Includes Dashboard, Queue, Schedules, Patients, Medicine Inventory, Intern Hours Tracking, and Report Management System.
 */

// Application State
let currentUser = {
    username: 'admin_somchai',
    name: 'หมอสมชาย ใจดี',
    role: 'admin',
    title: 'Administrator (พท.ว.)'
};

let selectedLoginRole = 'admin';
let currentQueueViewMode = 'table';

// Medicine Inventory Dataset
let medicinesData = [
    { med_id: 1, code: "MED-001", name: "ยาลูกกลอนแก้ลมปัตฆาต", type: "ยาลูกกลอน", unit: "กระปุก (60 เม็ด)", properties: "บรรเทาอาการปวดกล้ามเนื้อ คอบ่าไหล่ กระจายลมปัตฆาต", price: 180.00, stock_qty: 8, reorder_level: 15 },
    { med_id: 2, code: "MED-002", name: "ยาหอมนวโกฐ", type: "ยาผง / ชงน้ำร้อน", unit: "ขวด (100 กรัม)", properties: "แก้ลมวิงเวียน ปรับธาตุลม บำรุงหัวใจ แก้อ่อนเพลีย", price: 250.00, stock_qty: 42, reorder_level: 10 },
    { med_id: 3, code: "MED-003", name: "น้ำมันไพลสดประคบกาย", type: "ยาทา / ถูนวด", unit: "ขวดแก้ว (60 ml)", properties: "ทาบรรเทาอาการเคล็ดขัดยอก ลดการอักเสบของกล้ามเนื้อและข้อ", price: 150.00, stock_qty: 3, reorder_level: 10 },
    { med_id: 4, code: "MED-004", name: "ยาต้มปรับสมดุลธาตุประจำฤดู", type: "ยาต้มสมุนไพรสด", unit: "ชุดสมุนไพรแห้ง", properties: "ปรับสมดุลธาตุดิน น้ำ ลม ไฟ ตามธาตุเจ้าเรือน", price: 320.00, stock_qty: 25, reorder_level: 10 },
    { med_id: 5, code: "MED-005", name: "ยาแคปซูลขมิ้นชันสกัดสด", type: "ยาแคปซูล", unit: "กล่อง (30 แคปซูล)", properties: "ขับลม บรรเทาอาการท้องอืด ท้องเฟ้อ สมานแผลในกระเพาะ", price: 120.00, stock_qty: 60, reorder_level: 20 }
];

// Intern Training Hours Dataset
let internsData = [
    {
        intern_id: 101, name: "นศ.พท. วรรณา สุขสันต์", university: "มหาวิทยาลัยมหิดล (ศิริราช)", year: "ชั้นปีที่ 4",
        target_hours: 500.0, completed_hours: 512.50, categories: { med: 150.0, massage: 220.5, pharm: 90.0, midwife: 52.0 },
        logs: [{ date: "31 ก.ค. 2026", procedure: "เผายาสมุนไพรหน้าท้อง", doctor: "พท.ว. สมชาย ใจดี", hours: 1.5 }]
    },
    {
        intern_id: 102, name: "นศ.พท. ชัยวัฒน์ มั่นคง", university: "มหาวิทยาลัยธรรมศาสตร์", year: "ชั้นปีที่ 4",
        target_hours: 500.0, completed_hours: 500.00, categories: { med: 140.0, massage: 210.0, pharm: 100.0, midwife: 50.0 },
        logs: [{ date: "31 ก.ค. 2026", procedure: "ประคบสมุนไพรสด", doctor: "พท.น. ประเสริฐ", hours: 1.5 }]
    },
    {
        intern_id: 103, name: "นศ.พท. ธนพล วิเศษศักดิ์", university: "มหาวิทยาลัยรังสิต", year: "ชั้นปีที่ 3",
        target_hours: 500.0, completed_hours: 385.00, categories: { med: 110.0, massage: 165.0, pharm: 70.0, midwife: 40.0 },
        logs: [{ date: "30 ก.ค. 2026", procedure: "อบไอน้ำสมุนไพร", doctor: "พท.ว. สมชาย", hours: 1.0 }]
    },
    {
        intern_id: 104, name: "นศ.พท. กานดา รุ่งฤดี", university: "มหาวิทยาลัยหัวเฉียวเฉลิมพระเกียรติ", year: "ชั้นปีที่ 3",
        target_hours: 500.0, completed_hours: 344.50, categories: { med: 95.0, massage: 150.0, pharm: 60.0, midwife: 39.5 },
        logs: [{ date: "29 ก.ค. 2026", procedure: "ตรวจเบื้องต้นและซักประวัติ", doctor: "พท.ว. สมชาย", hours: 1.0 }]
    }
];

// Staff Schedules Roster & Patients Data
let staffSchedulesData = [
    { id: 1, name: "พท.ว. สมชาย ใจดี", role: "doctor", license: "พท.ว. 12345", specialties: [{ name: "ออฟฟิศซินโดรม", class: "tag-office-syndrome" }, { name: "นวดราชสำนัก", class: "tag-massage" }], work_date: "2026-08-01", shift_time: "09:00 - 17:00 น.", status: "available", booked_slots: 3 },
    { id: 3, name: "นศ.พท. วรรณา สุขสันต์", role: "intern", license: "นักศึกษาฝึกงาน (ปี 4)", specialties: [{ name: "เผายาสมุนไพร", class: "tag-herbal-burn" }], work_date: "2026-08-01", shift_time: "10:00 - 18:00 น.", status: "available", booked_slots: 2 }
];

let patientsData = [
    { patient_id: 1, hn_number: "HN-20260731-001", name: "คุณสมศรี มีสุข", age_gender: "34 ปี / หญิง", phone: "081-987-6543", elemental_type: "ดิน", allergies: "ไม่มีประวัติแพ้ยา", reg_date: "2026-01-15", history: [{ date: "31 ก.ค. 2026", doctor: "พท.ว. สมชาย ใจดี", service: "นวดไทยราชสำนักแก้อาการ", soap: { subjective: "ปวดคอบ่าไหล่", objective: "กล้ามเนื้อเกร็ง", assessment: "ออฟฟิศซินโดรม", plan: "นวดราชสำนัก 60 นาที" } }] }
];

let bookingsData = [
    { booking_id: 101, booking_time: "09:00 - 10:00 น.", patient_name: "คุณสมศรี มีสุข", phone: "081-987-6543", hn_number: "HN-20260731-001", service_name: "นวดไทยราชสำนักแก้อาการ", duration_minutes: 60, staff_name: "พท.ว. สมชาย ใจดี", staff_role: "doctor", status: "completed", total_price: 850.00 }
];

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderQueueViews();
    renderSchedulesPage();
    renderUsersTable();
    renderMedicinesTable();
    renderInternsTable();
    updateDashboardMetrics();
});

// Authentication Handling
function checkAuth() {
    const loginView = document.getElementById('loginView');
    const mainLayoutView = document.getElementById('mainLayoutView');
    if (!currentUser) {
        loginView.style.display = 'flex';
        mainLayoutView.style.display = 'none';
    } else {
        loginView.style.display = 'none';
        mainLayoutView.style.display = 'flex';
        updateSidebarUser();
    }
}

function setLoginRole(role, btnElement) {
    selectedLoginRole = role;
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
}

function handleLoginSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    currentUser = {
        username: username,
        name: selectedLoginRole === 'doctor' ? 'พท.ว. สมชาย ใจดี' : (selectedLoginRole === 'intern' ? 'นศ.พท. วรรณา สุขสันต์' : 'ผู้ดูแลระบบ (Admin)'),
        role: selectedLoginRole,
        title: selectedLoginRole === 'intern' ? 'นักศึกษาฝึกงาน' : 'Administrator'
    };
    checkAuth();
    showToast(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ ${currentUser.name}`);
}

function handleLogout() {
    currentUser = null;
    checkAuth();
    showToast('ออกจากระบบเรียบร้อยแล้ว');
}

function updateSidebarUser() {
    if (currentUser) {
        document.getElementById('sidebarUserName').textContent = currentUser.name;
        document.getElementById('sidebarUserRole').textContent = currentUser.title;
        document.getElementById('sidebarAvatar').textContent = currentUser.name.charAt(0);
    }
}

// Router & Tab Switcher
function switchTab(tabId) {
    document.querySelectorAll('.tab-page').forEach(page => page.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    const targetPage = document.getElementById(`tab-${tabId}`);
    if (targetPage) targetPage.style.display = 'block';

    const targetNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (targetNav) targetNav.classList.add('active');

    const titles = {
        'dashboard': 'Dashboard',
        'queue': 'จัดการคิว (Queue & Booking Management)',
        'schedules': 'ตารางเวรปฏิบัติงาน (Doctor Schedules)',
        'users': 'ข้อมูลผู้ป่วย (User Management)',
        'interns': 'ระบบติดตามชั่วโมงฝึกงาน (Intern Hours Tracking)',
        'medicines': 'คลังยาสมุนไพรและอัปเดตสต็อก (Medicine Inventory)',
        'reports': 'ระบบรายงานและวิเคราะห์ข้อมูลคลินิก (Report Management System)'
    };
    document.getElementById('breadcrumbTitle').textContent = titles[tabId] || 'Dashboard';

    if (tabId === 'queue') renderQueueViews();
    else if (tabId === 'schedules') renderSchedulesPage();
    else if (tabId === 'users') renderUsersTable();
    else if (tabId === 'medicines') renderMedicinesTable();
    else if (tabId === 'interns') renderInternsTable();
}

// ==========================================================================
// 1. REPORT MANAGEMENT SYSTEM FUNCTIONS
// ==========================================================================
function setReportDatePreset(preset) {
    document.querySelectorAll('.date-preset-pill').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const startInput = document.getElementById('reportStartDate');
    const endInput = document.getElementById('reportEndDate');
    const today = new Date().toISOString().split('T')[0];

    if (preset === 'today') {
        startInput.value = today;
        endInput.value = today;
    } else if (preset === 'week') {
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        startInput.value = lastWeek;
        endInput.value = today;
    } else if (preset === 'month') {
        startInput.value = "2026-07-01";
        endInput.value = "2026-07-31";
    }

    applyReportDateFilter();
}

function applyReportDateFilter() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;

    showToast(`📊 อัปเดตรายงานสรุปช่วงวันที่ ${startDate} ถึง ${endDate} เรียบร้อยแล้ว`);
}

function exportToPDF() {
    showToast(`📄 กำลังส่งออกรายงานเป็นไฟล์ PDF... (TTM_Clinic_Report_July2026.pdf)`);
}

function exportToExcel() {
    showToast(`📊 กำลังส่งออกรายงานเป็นไฟล์ Excel... (TTM_Clinic_Report_July2026.xlsx)`);
}

// Medicine Inventory & Intern Tracking Functions
function renderMedicinesTable() {
    const tbody = document.getElementById('medicinesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const search = (document.getElementById('medicineSearchInput')?.value || '').toLowerCase().trim();

    const filtered = medicinesData.filter(m => m.name.toLowerCase().includes(search) || m.code.toLowerCase().includes(search));

    filtered.forEach(m => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border-color)';
        let stockBadgeHtml = m.stock_qty <= 5
            ? `<span class="stock-badge stock-critical">⚠️ เหลือน้อยมาก (${m.stock_qty})</span>`
            : (m.stock_qty <= m.reorder_level ? `<span class="stock-badge stock-low">⚠️ ต้องเติมสต็อก (${m.stock_qty})</span>` : `<span class="stock-badge stock-normal">✓ ปกติ (${m.stock_qty})</span>`);

        tr.innerHTML = `
            <td style="padding: 1rem; font-weight: 700; color: var(--primary);">${m.code}</td>
            <td style="padding: 1rem;"><div style="font-weight: 600;">${m.name}</div><div style="font-size: 0.78rem; color: var(--text-tertiary);">${m.unit}</div></td>
            <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-secondary); max-width: 260px;">${m.properties}</td>
            <td style="padding: 1rem; font-size: 0.85rem;">${m.type}</td>
            <td style="padding: 1rem; font-weight: 600;">฿${m.price.toFixed(2)}</td>
            <td style="padding: 1rem;">${stockBadgeHtml}</td>
            <td style="padding: 1rem; text-align: center;">
                <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-color: var(--primary); color: var(--primary);" onclick="openUpdateStockModal(${m.med_id})">✏️ อัปเดตสต็อก</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterMedicines() { renderMedicinesTable(); }
function openUpdateStockModal(medId) {
    const med = medicinesData.find(m => m.med_id === medId) || medicinesData[0];
    document.getElementById('stockMedId').value = med.med_id;
    document.getElementById('updateStockModal').style.display = 'flex';
}
function closeUpdateStockModal() { document.getElementById('updateStockModal').style.display = 'none'; }
function handleUpdateStockSubmit(e) { e.preventDefault(); closeUpdateStockModal(); showToast('🎉 อัปเดตสต็อกเรียบร้อยแล้ว!'); }

function renderInternsTable() {
    const tbody = document.getElementById('internsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    internsData.forEach(intern => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border-color)';
        const isTargetReached = intern.completed_hours >= intern.target_hours;
        if (isTargetReached) tr.className = 'intern-row-target-reached';

        const percent = Math.min(100, ((intern.completed_hours / intern.target_hours) * 100)).toFixed(1);
        let targetBadgeHtml = isTargetReached
            ? `<span class="badge-target-reached">🏆 ครบเกณฑ์สภา (500 ชม.)</span>`
            : `<span style="background: #FEF3C7; color: #92400E; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 600;">⏳ อยู่ระหว่างฝึกงาน</span>`;

        tr.innerHTML = `
            <td style="padding: 1rem;"><div style="font-weight: 700; color: var(--primary-dark);">${intern.name}</div></td>
            <td style="padding: 1rem;"><div>${intern.university}</div><div style="font-size: 0.78rem; color: var(--text-tertiary);">${intern.year}</div></td>
            <td style="padding: 1rem;"><div style="font-weight: 700; color: ${isTargetReached ? '#059669' : 'var(--text-primary)'};">${intern.completed_hours.toFixed(2)} / ${intern.target_hours} ชม.</div></td>
            <td style="padding: 1rem; width: 180px;"><div style="font-size: 0.8rem; font-weight: 700; text-align: right;">${percent}%</div><div class="progress-bar-bg"><div class="progress-bar-fill ${isTargetReached ? 'progress-bar-complete' : ''}" style="width: ${percent}%;"></div></div></td>
            <td style="padding: 1rem;">${targetBadgeHtml}</td>
            <td style="padding: 1rem; text-align: center;"><button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-color: var(--primary); color: var(--primary);" onclick="openInternLogbookModal(${intern.intern_id})">📜 สมุดบันทึกชั่วโมง</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function openInternLogbookModal(internId) { document.getElementById('internLogbookModal').style.display = 'flex'; }
function closeInternLogbookModal() { document.getElementById('internLogbookModal').style.display = 'none'; }

// Queue, Schedules, Patient & Helpers
function setQueueViewMode(mode) {
    currentQueueViewMode = mode;
    document.getElementById('btnViewTable')?.classList.toggle('active', mode === 'table');
    document.getElementById('btnViewKanban')?.classList.toggle('active', mode === 'kanban');
    document.getElementById('queueTableViewContainer').style.display = mode === 'table' ? 'block' : 'none';
    document.getElementById('kanbanBoardContainer').style.display = mode === 'kanban' ? 'grid' : 'none';
    renderQueueViews();
}
function renderQueueViews() { if (currentQueueViewMode === 'table') renderQueueTable(); else renderKanbanBoard(); }
function renderQueueTable() {
    const tbody = document.getElementById('tabQueueTableBody'); if (!tbody) return; tbody.innerHTML = '';
    bookingsData.forEach(item => {
        const tr = document.createElement('tr'); tr.style.borderBottom = '1px solid var(--border-color)';
        let statusHtml = item.status === 'completed' ? `<span style="background: #D1FAE5; color: #065F46; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600;">✓ เสร็จสิ้น</span>` : `<span style="background: #FEF3C7; color: #92400E; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600;">⏳ รอรับบริการ</span>`;
        tr.innerHTML = `
            <td style="padding: 1rem; font-weight: 600;">${item.booking_time}</td>
            <td style="padding: 1rem;"><div style="font-weight: 600;">${item.patient_name}</div></td>
            <td style="padding: 1rem;">${item.service_name}</td>
            <td style="padding: 1rem;">${item.staff_name}</td>
            <td style="padding: 1rem;">${statusHtml}</td>
            <td style="padding: 1rem; text-align: center;"><button class="btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="updateBookingStatus(${item.booking_id}, 'completed')">⚡ ทำรายการเสร็จสิ้น</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderKanbanBoard() {
    const colPending = document.getElementById('kanbanColPending');
    const colConfirmed = document.getElementById('kanbanColConfirmed');
    const colCompleted = document.getElementById('kanbanColCompleted');
    if (!colPending || !colConfirmed || !colCompleted) return;
    colPending.innerHTML = ''; colConfirmed.innerHTML = ''; colCompleted.innerHTML = '';
    bookingsData.forEach(item => {
        const card = document.createElement('div'); card.className = 'kanban-card';
        card.innerHTML = `<div class="card-patient-name">${item.patient_name}</div><div class="card-service-name">${item.service_name}</div>`;
        if (item.status === 'pending') colPending.appendChild(card);
        else if (item.status === 'confirmed') colConfirmed.appendChild(card);
        else colCompleted.appendChild(card);
    });
}

async function updateBookingStatus(bookingId, newStatus) {
    const booking = bookingsData.find(b => b.booking_id === bookingId);
    if (!booking) return;
    booking.status = newStatus;
    renderQueueViews();
    updateDashboardMetrics();
    showToast(`อัปเดตสถานะเป็น '${newStatus}' เรียบร้อยแล้ว`);
}

function renderSchedulesPage() {
    const grid = document.getElementById('schedulesRosterGrid'); if (!grid) return; grid.innerHTML = '';
    staffSchedulesData.forEach(staff => {
        const card = document.createElement('div'); card.className = 'staff-schedule-card';
        card.innerHTML = `<div class="staff-card-title">${staff.name}</div><div style="font-size: 0.8rem;">${staff.license}</div>`;
        grid.appendChild(card);
    });
}
function openAssignShiftModal() { document.getElementById('assignShiftModal').style.display = 'flex'; }
function closeAssignShiftModal() { document.getElementById('assignShiftModal').style.display = 'none'; }
function handleAssignShiftSubmit(e) { e.preventDefault(); closeAssignShiftModal(); showToast('🎉 จัดเวรเรียบร้อย!'); }

function renderUsersTable() {
    const tbody = document.getElementById('patientsTableBody'); if (!tbody) return; tbody.innerHTML = '';
    patientsData.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td style="padding: 1rem; font-weight: 700; color: var(--primary);">${p.hn_number}</td><td style="padding: 1rem;">${p.name}</td><td style="padding: 1rem;">${p.phone}</td><td style="padding: 1rem;">ธาตุ${p.elemental_type}</td><td style="padding: 1rem;">${p.allergies}</td><td style="padding: 1rem;">${p.reg_date}</td><td style="padding: 1rem; text-align: center;"><button class="btn-secondary" onclick="openPatientHistoryModal(${p.patient_id})">📖 ประวัติการรักษา</button></td>`;
        tbody.appendChild(tr);
    });
}
function filterPatients() { renderUsersTable(); }
function openPatientHistoryModal(patientId) { document.getElementById('patientHistoryModal').style.display = 'flex'; }
function closePatientHistoryModal() { document.getElementById('patientHistoryModal').style.display = 'none'; }

function openWalkinModal() { document.getElementById('walkinModal').style.display = 'flex'; }
function closeWalkinModal() { document.getElementById('walkinModal').style.display = 'none'; }
function updateWalkinPrice() {}
function handleWalkinSubmit(e) { e.preventDefault(); closeWalkinModal(); showToast('🎉 บันทึกการจอง Walk-in เรียบร้อย!'); }

function updateDashboardMetrics() {
    const totalBookings = bookingsData.length;
    const dashToday = document.getElementById('dashTodayBookings');
    if (dashToday) dashToday.textContent = totalBookings;
}

function showToast(message) {
    const container = document.getElementById('appToastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<div style="font-size: 1.2rem;">✨</div><div>${message}</div>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
