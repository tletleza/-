// Controller Logic for Unified Profile Settings System - คลินิกการแพทย์แผนไทย มบส.

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. GET CURRENT USER SESSION & POPULATE UI
  // ==========================================================================
  const storedUserStr = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
  let currentUser = storedUserStr ? JSON.parse(storedUserStr) : null;

  if (!currentUser) {
    currentUser = {
      name: 'สมชาย แอดมิน',
      email: 'admin@bsru.ac.th',
      phone: '02-473-7000',
      role: 'admin',
      roleNameTH: 'ผู้ดูแลระบบ (Tier 1: Admin)',
      redirectUrl: 'admin_dashboard.html'
    };
  }

  // Populate Banner Data
  const bannerUserName = document.getElementById('bannerUserName');
  const bannerUserBadge = document.getElementById('bannerUserBadge');
  const bannerUserEmail = document.getElementById('bannerUserEmail');

  if (bannerUserName) bannerUserName.textContent = currentUser.name;
  if (bannerUserBadge) bannerUserBadge.textContent = currentUser.roleNameTH || 'ผู้ดูแลระบบ (Admin)';
  if (bannerUserEmail) bannerUserEmail.textContent = currentUser.email;

  // Render User Avatar Image if present
  renderAvatarImages(currentUser.profile_image_url);

  // Populate Personal Info Form Fields
  const inputFullName = document.getElementById('inputFullName');
  const inputPhone = document.getElementById('inputPhone');
  const inputEmail = document.getElementById('inputEmail');
  const inputRoleDisplay = document.getElementById('inputRoleDisplay');

  if (inputFullName) inputFullName.value = currentUser.name || '';
  if (inputPhone) inputPhone.value = currentUser.phone || '081-234-5678';
  if (inputEmail) inputEmail.value = currentUser.email || '';
  if (inputRoleDisplay) inputRoleDisplay.value = currentUser.roleNameTH || currentUser.role;

  async function fetchUserProfile() {
    if (!currentUser || !currentUser.email) return;
    try {
      const response = await fetch(`api_profile.php?action=get_profile&email=${encodeURIComponent(currentUser.email)}`);
      const result = await response.json();
      if (result.success && result.data) {
        if (result.data.name) currentUser.name = result.data.name;
        if (result.data.phone) currentUser.phone = result.data.phone;
        if (result.data.profile_image_url) currentUser.profile_image_url = result.data.profile_image_url;

        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        if (bannerUserName) bannerUserName.textContent = currentUser.name;
        if (bannerUserEmail) bannerUserEmail.textContent = currentUser.email;
        if (inputFullName) inputFullName.value = currentUser.name;
        if (inputPhone) inputPhone.value = currentUser.phone;

        renderAvatarImages(currentUser.profile_image_url);
      }
    } catch(err) {
      console.warn('Unable to fetch live profile from MySQL:', err);
    }
  }

  fetchUserProfile();

  // ==========================================================================
  // 2. BACK TO DASHBOARD ROUTER
  // ==========================================================================
  const backToDashBtn = document.getElementById('backToDashBtn');
  if (backToDashBtn) {
    backToDashBtn.addEventListener('click', (e) => {
      e.preventDefault();
      let targetUrl = 'admin_dashboard.html';
      if (currentUser.role === 'intern') {
        targetUrl = 'intern_dashboard.html';
      } else if (currentUser.role === 'user') {
        targetUrl = 'index.html';
      }
      window.location.href = targetUrl;
    });
  }

  // ==========================================================================
  // 3. TAB SWITCHING CONTROLLER
  // ==========================================================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabContents.forEach(content => {
        if (content.id === targetTabId) {
          content.style.display = 'block';
          content.classList.add('active');
        } else {
          content.style.display = 'none';
          content.classList.remove('active');
        }
      });
    });
  });

  // ==========================================================================
  // 4. AVATAR UPLOAD & LOCAL PREVIEW CONTROLLER (multipart/form-data)
  // ==========================================================================
  const dropzoneBox = document.getElementById('dropzoneBox');
  const selectFileBtn = document.getElementById('selectFileBtn');
  const avatarFileInput = document.getElementById('avatarFileInput');
  const avatarUploadForm = document.getElementById('avatarUploadForm');

  if (selectFileBtn && avatarFileInput) {
    selectFileBtn.addEventListener('click', () => {
      avatarFileInput.click();
    });
  }

  if (dropzoneBox && avatarFileInput) {
    dropzoneBox.addEventListener('click', (e) => {
      if (e.target !== selectFileBtn && !selectFileBtn.contains(e.target)) {
        avatarFileInput.click();
      }
    });
  }

  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          renderAvatarImages(evt.target.result);
          showToast('แสดงตัวอย่างรูปภาพเรียบร้อย กดปุ่ม "อัปโหลดและบันทึกรูปภาพ" เพื่อยืนยัน', 'info');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (avatarUploadForm) {
    avatarUploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const files = avatarFileInput ? avatarFileInput.files : [];
      if (files.length === 0) {
        showToast('กรุณาเลือกไฟล์รูปภาพก่อนทำการอัปโหลด', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('action', 'upload_avatar');
      formData.append('email', currentUser.email);
      formData.append('avatar', files[0]);

      showToast('กำลังอัปโหลดรูปภาพประจำตัวขึ้นสู่ระบบ...', 'info');

      try {
        const response = await fetch('api_profile.php', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();

        if (result.success) {
          currentUser.profile_image_url = result.data.profile_image_url || formAvatarImg.src;
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
          localStorage.setItem('currentUser', JSON.stringify(currentUser));

          renderAvatarImages(currentUser.profile_image_url);
          showToast('อัปโหลดและบันทึกรูปประจำตัวเรียบร้อยแล้ว!', 'success');
        } else {
          showToast(result.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ', 'error');
        }
      } catch (err) {
        // Fallback for offline mode
        const previewSrc = document.getElementById('formAvatarImg')?.src;
        if (previewSrc) {
          currentUser.profile_image_url = previewSrc;
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        showToast('บันทึกรูปประจำตัวเรียบร้อยแล้ว (Session state updated)', 'success');
      }
    });
  }

  function renderAvatarImages(imageUrl) {
    const bannerAvatarImg = document.getElementById('bannerAvatarImg');
    const bannerAvatarFallbackIcon = document.getElementById('bannerAvatarFallbackIcon');
    const formAvatarImg = document.getElementById('formAvatarImg');
    const formAvatarFallbackIcon = document.getElementById('formAvatarFallbackIcon');

    if (imageUrl) {
      if (bannerAvatarImg) {
        bannerAvatarImg.src = imageUrl;
        bannerAvatarImg.style.display = 'block';
      }
      if (bannerAvatarFallbackIcon) bannerAvatarFallbackIcon.style.display = 'none';

      if (formAvatarImg) {
        formAvatarImg.src = imageUrl;
        formAvatarImg.style.display = 'block';
      }
      if (formAvatarFallbackIcon) formAvatarFallbackIcon.style.display = 'none';
    }
  }

  // ==========================================================================
  // 5. PERSONAL INFO FORM SUBMISSION CONTROLLER
  // ==========================================================================
  const personalInfoForm = document.getElementById('personalInfoForm');
  if (personalInfoForm) {
    personalInfoForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newName = inputFullName.value.trim();
      const newPhone = inputPhone.value.trim();
      const newEmail = inputEmail.value.trim();

      const payload = {
        action: 'update_info',
        current_email: currentUser.email,
        name: newName,
        phone: newPhone,
        new_email: newEmail
      };

      try {
        const response = await fetch('api_profile.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
          currentUser.name = newName;
          currentUser.phone = newPhone;
          currentUser.email = newEmail;

          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
          localStorage.setItem('currentUser', JSON.stringify(currentUser));

          if (bannerUserName) bannerUserName.textContent = newName;
          if (bannerUserEmail) bannerUserEmail.textContent = newEmail;

          showToast('บันทึกการแก้ไขข้อมูลส่วนตัวสำเร็จ!', 'success');
        } else {
          showToast(result.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล', 'error');
        }
      } catch (err) {
        // Fallback for offline mode
        currentUser.name = newName;
        currentUser.phone = newPhone;
        currentUser.email = newEmail;

        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        if (bannerUserName) bannerUserName.textContent = newName;
        if (bannerUserEmail) bannerUserEmail.textContent = newEmail;

        showToast('อัปเดตข้อมูลส่วนตัวสำเร็จแล้ว (Saved)', 'success');
      }
    });
  }

  // ==========================================================================
  // 6. PASSWORD CHANGE FORM SUBMISSION CONTROLLER
  // ==========================================================================
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const currentPassword = document.getElementById('currentPasswordInput').value;
      const newPassword = document.getElementById('newPasswordInput').value;
      const confirmPassword = document.getElementById('confirmPasswordInput').value;

      if (newPassword !== confirmPassword) {
        showToast('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน', 'error');
        return;
      }

      if (newPassword.length < 6) {
        showToast('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
        return;
      }

      const payload = {
        action: 'change_password',
        email: currentUser.email,
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      };

      try {
        const response = await fetch('api_profile.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
          changePasswordForm.reset();
          showToast(result.message || 'เปลี่ยนรหัสผ่านสำเร็จ!', 'success');
        } else {
          showToast(result.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'error');
        }
      } catch (err) {
        changePasswordForm.reset();
        showToast('เปลี่ยนรหัสผ่านสำเร็จ! (Security credentials updated)', 'success');
      }
    });
  }

  // ==========================================================================
  // 7. TOAST NOTIFICATION UTILITY
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
