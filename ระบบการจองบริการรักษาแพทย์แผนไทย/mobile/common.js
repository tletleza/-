/**
 * mobile/common.js - Shared Mobile Device Shell, State Manager, & Performance Engine
 */

// Local Storage Cache Manager
const MobileCache = {
    set: (key, val) => localStorage.setItem(`ttm_mob_${key}`, JSON.stringify(val)),
    get: (key) => {
        try { return JSON.parse(localStorage.getItem(`ttm_mob_${key}`)); }
        catch (e) { return null; }
    }
};

// Debounce Utility for High-Performance Search Filters
function debounce(func, wait = 200) {
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

// Simulated Haptic Vibration Feedback for Mobile Buttons
function triggerHapticFeedback() {
    if ("vibrate" in navigator) {
        try { navigator.vibrate(12); } catch (e) {}
    }
}

// Render Shared Mobile Bottom Navigation Bar
function renderMobileBottomNav(activeTab) {
    const bottomNavElement = document.getElementById('mobileBottomNav');
    if (!bottomNavElement) return;

    const navItems = [
        { id: 'screening', label: 'คัดกรอง', icon: '🏠', file: 'screening.html' },
        { id: 'services', label: 'บริการ', icon: '💆‍♀️', file: 'services.html' },
        { id: 'packages', label: 'แพ็กเกจ', icon: '🎁', file: 'packages.html' },
        { id: 'doctors', label: 'ทีมแพทย์', icon: '👨‍⚕️', file: 'doctors.html' },
        { id: 'history', label: 'ประวัติ', icon: '📜', file: 'history.html' },
        { id: 'contact', label: 'ติดต่อ', icon: '📍', file: 'contact.html' }
    ];

    let html = '';
    navItems.forEach(item => {
        const isActive = activeTab === item.id ? 'active' : '';
        html += `
            <a href="${item.file}" class="nav-bottom-item ${isActive}" style="text-decoration: none;" onclick="triggerHapticFeedback()">
                <span class="nav-bottom-icon">${item.icon}</span>
                <span>${item.label}</span>
            </a>
        `;
    });

    bottomNavElement.innerHTML = html;
}

// Global Toast Alert Engine for Mobile
function showMobileToast(message) {
    let container = document.getElementById('mobileToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'mobileToastContainer';
        document.body.appendChild(container);
    }

    triggerHapticFeedback();
    const toast = document.createElement('div');
    toast.className = 'mobile-toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
