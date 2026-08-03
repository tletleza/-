/**
 * admin/common.js - High Performance Shared UI Components, Navigation, & Session Manager
 */

// Shared User Session State Cache
let currentUser = JSON.parse(sessionStorage.getItem('ttm_user')) || {
    username: 'admin_somchai',
    name: 'หมอสมชาย ใจดี',
    role: 'admin',
    title: 'Administrator (พท.ว.)'
};

// Debounce Utility for High-Performance Search & Input Filters
function debounce(func, wait = 250) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Auto Check Auth on Page Load
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    if (!currentUser && currentPage !== 'login.html') {
        window.location.href = 'login.html';
        return;
    }
});

// Render Shared Sidebar Navigation
function renderSidebar(activeTab) {
    const sidebarElement = document.getElementById('sidebarContainer');
    if (!sidebarElement) return;

    const name = currentUser ? currentUser.name : 'หมอสมชาย ใจดี';
    const role = currentUser ? currentUser.title : 'Administrator';
    const avatar = name.charAt(0);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', file: 'dashboard.html', category: 'เมนูหลัก (Main Menu)' },
        { id: 'queue', label: 'จัดการคิว (Queue)', icon: '📋', file: 'queue.html' },
        { id: 'schedules', label: 'ตารางเวร (Schedules)', icon: '📅', file: 'schedules.html' },
        { id: 'users', label: 'ผู้ป่วย (Users)', icon: '👥', file: 'users.html', category: 'ข้อมูลระบบ (Database)' },
        { id: 'interns', label: 'นักศึกษาฝึกงาน (Interns)', icon: '🎓', file: 'interns.html' },
        { id: 'medicines', label: 'คลังยา (Medicines)', icon: '💊', file: 'medicines.html' },
        { id: 'reports', label: 'รายงานสรุป (Reports)', icon: '📈', file: 'reports.html' }
    ];

    let navHtml = '';
    navItems.forEach(item => {
        if (item.category) {
            navHtml += `<div class="nav-category">${item.category}</div>`;
        }
        const isActive = activeTab === item.id ? 'active' : '';
        navHtml += `
            <a href="${item.file}" class="nav-item ${isActive}">
                <span class="nav-icon">${item.icon}</span>
                <span>${item.label}</span>
            </a>
        `;
    });

    sidebarElement.innerHTML = `
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo-icon">พท</div>
                <div>
                    <div class="sidebar-brand-name">แพทย์แผนไทย</div>
                    <div style="font-size: 0.72rem; color: var(--text-tertiary);">Clinic Management</div>
                </div>
            </div>

            <nav class="sidebar-nav">
                ${navHtml}
            </nav>

            <div class="sidebar-footer">
                <div class="user-avatar">${avatar}</div>
                <div class="user-info">
                    <div class="user-name">${name}</div>
                    <div class="user-role">${role}</div>
                </div>
                <button class="btn-logout" title="ออกจากระบบ" onclick="logout()">🚪</button>
            </div>
        </aside>
    `;
}

// Render Shared Topbar Navigation
function renderTopbar(title) {
    const topbarElement = document.getElementById('topbarContainer');
    if (!topbarElement) return;

    const todayStr = new Date().toLocaleDateString('th-TH', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    topbarElement.innerHTML = `
        <header class="topbar">
            <div class="topbar-left">
                <div class="breadcrumb">
                    <span>ระบบคลินิก</span> / <span class="breadcrumb-current">${title}</span>
                </div>
            </div>

            <div class="topbar-right">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="ค้นหาชื่อผู้ป่วย, HN, ยา..." oninput="debounce(function(){ console.log('Optimized Search Execution'); }, 300)()">
                </div>

                <div class="notification-badge" title="การแจ้งเตือน">
                    <span>🔔</span>
                    <span class="notification-dot"></span>
                </div>

                <div style="font-size: 0.85rem; font-weight: 500; color: var(--text-secondary);">
                    📅 วันนี้: ${todayStr}
                </div>
            </div>
        </header>
    `;
}

// Logout Action
function logout() {
    sessionStorage.removeItem('ttm_user');
    window.location.href = 'login.html';
}

// Global Toast Notification Engine
function showToast(message) {
    let container = document.getElementById('appToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'appToastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

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
