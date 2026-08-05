// Authentication & RBAC Logic for คลินิกการแพทย์แผนไทย มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา

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
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const loginPassword = document.getElementById('loginPassword');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');

  if (togglePasswordBtn && loginPassword) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
      loginPassword.setAttribute('type', type);
      togglePasswordIcon.className = type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
    });
  }

  const roleBadgeBtns = document.querySelectorAll('.role-badge-btn');
  roleBadgeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      roleBadgeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetRole = btn.getAttribute('data-role');
      const matchedUser = MOCK_USERS_DB.find(u => u.role === targetRole);
      if (matchedUser) {
        const emailInput = document.getElementById('loginEmailInput') || document.getElementById('loginEmail');
        const passInput = document.getElementById('loginPasswordInput') || document.getElementById('loginPassword');
        if (emailInput) emailInput.value = matchedUser.email;
        if (passInput) passInput.value = matchedUser.password;
      }
    });
  });

  const loginForm = document.getElementById('standaloneLoginForm') || document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('loginEmailInput') || document.getElementById('loginEmail');
      const passInput = document.getElementById('loginPasswordInput') || document.getElementById('loginPassword');
      const errorMsgBox = document.getElementById('loginErrorMessage');

      const emailVal = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const passVal = passInput ? passInput.value.trim() : '';

      if (errorMsgBox) errorMsgBox.style.display = 'none';

      const foundUser = MOCK_USERS_DB.find(u => u.email.toLowerCase() === emailVal && u.password === passVal);

      if (!foundUser) {
        if (errorMsgBox) {
          errorMsgBox.textContent = 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';
          errorMsgBox.style.display = 'block';
        }
        return;
      }

      sessionStorage.setItem('currentUser', JSON.stringify(foundUser));
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      window.location.href = foundUser.redirectUrl;
    });
  }
});

function handleSSOLogin(providerName) {
  const mockSSOUser = MOCK_USERS_DB.find(u => u.role === 'user');
  sessionStorage.setItem('currentUser', JSON.stringify(mockSSOUser));
  localStorage.setItem('currentUser', JSON.stringify(mockSSOUser));
  window.location.href = 'index.html';
}
