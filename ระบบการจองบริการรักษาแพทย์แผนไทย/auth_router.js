// Authentication & RBAC Verification Logic for คลินิกการแพทย์แผนไทย มบส.

// 1. Mock User Database (Database Seed for Testing 4 User Tiers)
const MOCK_USERS_DB = [
  {
    email: 'admin@bsru.ac.th',
    password: 'password123',
    role: 'admin',
    roleNameTH: 'ผู้ดูแลระบบ (Admin)',
    name: 'สมชาย แอดมิน (Somchai Admin)',
    redirectUrl: 'admin_dashboard.html'
  },
  {
    email: 'doctor@bsru.ac.th',
    password: 'password123',
    role: 'doctor',
    roleNameTH: 'แพทย์แผนไทย (Doctor)',
    name: 'พท.ป. สมหญิง รักษาดี (Dr. Somying Raksadee)',
    redirectUrl: 'admin_dashboard.html'
  },
  {
    email: 'intern@bsru.ac.th',
    password: 'password123',
    role: 'intern',
    roleNameTH: 'นักศึกษาฝึกงาน (Intern)',
    name: 'นศ. ใจดี ตั้งใจเรียน (Jaidee Tangjairean)',
    redirectUrl: 'intern_dashboard.html'
  },
  {
    email: 'student@bsru.ac.th',
    password: 'password123',
    role: 'user',
    roleNameTH: 'ผู้ใช้งานทั่วไป/นักศึกษา (Student)',
    name: 'มานะ เรียนดี (Mana Reandee)',
    redirectUrl: 'index.html'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // Password Visibility Toggle
  const toggleBtns = document.querySelectorAll('.password-toggle-touch');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
        }
      }
    });
  });

  // Role Simulator Quick-Fill Account Selector
  const roleBadgeBtns = document.querySelectorAll('.role-badge-btn');
  roleBadgeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      roleBadgeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetRole = btn.getAttribute('data-role');
      
      // Auto-fill form fields with matching mock account
      const matchedUser = MOCK_USERS_DB.find(u => u.role === targetRole);
      if (matchedUser) {
        const emailInput = document.getElementById('loginEmailInput');
        const passInput = document.getElementById('loginPasswordInput');
        if (emailInput) emailInput.value = matchedUser.email;
        if (passInput) passInput.value = matchedUser.password;
      }
    });
  });

  // Login Form Submission & Credential Verification
  const standaloneLoginForm = document.getElementById('standaloneLoginForm');
  if (standaloneLoginForm) {
    standaloneLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('loginEmailInput');
      const passwordInput = document.getElementById('loginPasswordInput');
      const errorMsgBox = document.getElementById('loginErrorMessage');
      
      const emailValue = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const passwordValue = passwordInput ? passwordInput.value.trim() : '';

      // Reset Error Message UI
      if (errorMsgBox) {
        errorMsgBox.style.display = 'none';
        errorMsgBox.textContent = '';
      }

      // 2. Authentication Verification Logic
      const authenticatedUser = MOCK_USERS_DB.find(user => 
        user.email.toLowerCase() === emailValue && user.password === passwordValue
      );

      // Handle Authentication Failure
      if (!authenticatedUser) {
        const errorText = 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';
        if (errorMsgBox) {
          errorMsgBox.textContent = errorText;
          errorMsgBox.style.display = 'block';
        }
        showToast(errorText, 'error');
        return;
      }

      // Handle Authentication Success & Instant Tier Routing
      sessionStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
      localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));

      showToast(`เข้าสู่ระบบสำเร็จ - ${authenticatedUser.roleNameTH} (ยินดีต้อนรับ คุณ${authenticatedUser.name})`, 'success');
      setTimeout(() => {
        window.location.href = authenticatedUser.redirectUrl;
      }, 300);
    });
  }

  // Forgot Password Modal Floating Overlay Handlers
  const openForgotModalBtn = document.getElementById('openForgotModalBtn');
  const closeForgotModalBtn = document.getElementById('closeForgotModalBtn');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const forgotForm = document.getElementById('forgotForm');

  if (openForgotModalBtn && forgotPasswordModal) {
    openForgotModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      forgotPasswordModal.classList.add('active');
    });
  }

  if (closeForgotModalBtn && forgotPasswordModal) {
    closeForgotModalBtn.addEventListener('click', () => {
      forgotPasswordModal.classList.remove('active');
    });
  }

  if (forgotPasswordModal) {
    forgotPasswordModal.addEventListener('click', (e) => {
      if (e.target === forgotPasswordModal) {
        forgotPasswordModal.classList.remove('active');
      }
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('forgotEmail').value.trim();
      if (!email) {
        showToast('กรุณาระบุอีเมลของคุณ', 'error');
        return;
      }
      forgotPasswordModal.classList.remove('active');
      forgotForm.reset();
      showToast(`ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง ${email} เรียบร้อยแล้ว`, 'success');
    });
  }

  // Toast Feedback System
  function showToast(message, type = 'success') {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    if (toast && toastMsg) {
      toastMsg.textContent = message;
      if (type === 'error') {
        if (toastIcon) toastIcon.className = 'fa-solid fa-circle-xmark';
        toast.style.borderLeftColor = '#EA4335';
      } else {
        if (toastIcon) toastIcon.className = 'fa-solid fa-circle-check';
        toast.style.borderLeftColor = 'var(--color-accent-sage)';
      }
      toast.classList.add('active');
    }
  }
});

// External SSO Login Handler
function handleSSOLogin(providerName) {
  const mockSSOUser = MOCK_USERS_DB.find(u => u.role === 'user');
  sessionStorage.setItem('currentUser', JSON.stringify(mockSSOUser));
  localStorage.setItem('currentUser', JSON.stringify(mockSSOUser));
  window.location.href = mockSSOUser.redirectUrl;
}
