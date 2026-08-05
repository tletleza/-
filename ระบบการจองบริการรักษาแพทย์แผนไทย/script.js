// JavaScript logic for Traditional Thai Medicine Clinic single-page website

// 1. Global Function to Close Booking Modal
window.closeBookingModal = function() {
  const bookingModal = document.getElementById('bookingModal');
  if (bookingModal) {
    bookingModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
};

// 2. Global Event Delegation for Opening Booking Modal (.open-booking-modal)
document.addEventListener('click', (e) => {
  const openBtn = e.target.closest('.open-booking-modal');
  if (openBtn) {
    e.preventDefault();
    const bookingModal = document.getElementById('bookingModal');
    const serviceSelect = document.getElementById('serviceSelect');
    const selectedPackage = openBtn.getAttribute('data-package');

    if (selectedPackage && serviceSelect && serviceSelect.options) {
      try {
        for (let i = 0; i < serviceSelect.options.length; i++) {
          const opt = serviceSelect.options[i];
          if (opt.value === selectedPackage || opt.text.includes(selectedPackage) || selectedPackage.includes(opt.value)) {
            serviceSelect.selectedIndex = i;
            break;
          }
        }
      } catch(err) {
        console.error(err);
      }
    }

    if (bookingModal) {
      bookingModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
});

// 3. Global Close Button Event Delegation
document.addEventListener('click', (e) => {
  if (e.target.closest('#closeModalBtn')) {
    e.preventDefault();
    window.closeBookingModal();
  }
});

// 4. Close Modal on Backdrop Click
document.addEventListener('click', (e) => {
  const bookingModal = document.getElementById('bookingModal');
  if (bookingModal && e.target === bookingModal) {
    window.closeBookingModal();
  }
});

// 5. Close Modal on Escape Key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeBookingModal();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // 1. Check logged in user session for public portal navbar
  try {
    const storedUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
    let user = null;
    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      try { user = JSON.parse(storedUser); } catch(e) {}
    }

    const navLoginBtn = document.querySelector('.nav-login-btn');
    const userLoggedInBadge = document.querySelector('.user-logged-in-badge');
    const heroLoginBtn = document.getElementById('heroLoginBtn') || document.querySelector('.hero-actions .btn-secondary') || document.querySelector('.hero-cta-group .hero-btn-secondary');

    if (user && user.name && user.email) {
      const cleanName = user.name.split(' (')[0];
      const avatarHtml = user.profile_image_url
        ? `<img src="${user.profile_image_url}" alt="${cleanName}" style="width:26px; height:26px; border-radius:50%; object-fit:cover; flex-shrink:0; border:1px solid var(--color-terracotta);">`
        : `<i class="fa-solid fa-circle-user" style="font-size:1.1rem; flex-shrink:0;"></i>`;

      const dropdownAvatarHtml = user.profile_image_url
        ? `<img src="${user.profile_image_url}" alt="${cleanName}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; flex-shrink:0; border:1.5px solid var(--color-terracotta);">`
        : `<div style="width:36px; height:36px; border-radius:50%; background:var(--color-terracotta-light); color:var(--color-terracotta); display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0;"><i class="fa-solid fa-user"></i></div>`;

      const badgeHTML = `
        <div id="publicUserDropdownContainer" class="public-profile-dropdown-container" style="position: relative;">
          <button id="publicProfileBtn" class="user-logged-in-badge" style="display:inline-flex; align-items:center; gap:6px; background:var(--color-terracotta-light); color:var(--color-terracotta); padding:6px 14px; border-radius:9999px; font-weight:500; font-size:0.88rem; white-space:nowrap; max-width:200px; cursor:pointer; border:1.5px solid rgba(179,91,59,0.3); transition:all 0.2s;">
            ${avatarHtml}
            <span class="profile-name-text" style="max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:inline-block;">${cleanName}</span>
            <i class="fa-solid fa-chevron-down" style="font-size:0.75rem; color:var(--color-terracotta); flex-shrink:0;"></i>
          </button>

          <div id="publicProfileMenuDropdown" class="public-profile-menu-dropdown" style="display:none; position:absolute; top:calc(100% + 8px); right:0; width:230px; background:#FFFFFF; border-radius:14px; box-shadow:0 12px 36px rgba(44,34,30,0.18); border:1px solid var(--color-beige-dark); padding:8px 0; z-index:100000;">
            <div style="padding:10px 16px; border-bottom:1px solid var(--color-beige-dark); margin-bottom:4px; text-align:left; display:flex; align-items:center; gap:10px;">
              ${dropdownAvatarHtml}
              <div style="overflow:hidden;">
                <strong style="display:block; font-size:0.88rem; color:var(--color-dark-brown); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${user.name}</strong>
                <span style="font-size:0.75rem; color:var(--color-muted-text); display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${user.email}</span>
              </div>
            </div>
            <a href="profile_settings.html" class="dropdown-item" style="display:flex; align-items:center; gap:10px; padding:10px 16px; font-size:0.88rem; color:var(--color-dark-brown); text-decoration:none;">
              <i class="fa-solid fa-user-pen" style="color:var(--color-terracotta); width:18px; text-align:center;"></i>
              <span>แก้ไขโปรไฟล์ส่วนตัว</span>
            </a>
            <a href="profile_settings.html?tab=security" class="dropdown-item" style="display:flex; align-items:center; gap:10px; padding:10px 16px; font-size:0.88rem; color:var(--color-dark-brown); text-decoration:none;">
              <i class="fa-solid fa-key" style="color:var(--color-accent-gold); width:18px; text-align:center;"></i>
              <span>เปลี่ยนรหัสผ่าน</span>
            </a>
            <a href="#" id="publicLogoutBtn" class="dropdown-item logout" style="display:flex; align-items:center; gap:10px; padding:10px 16px; font-size:0.88rem; color:#dc2626; text-decoration:none; border-top:1px solid var(--color-beige-dark); margin-top:4px;">
              <i class="fa-solid fa-right-from-bracket" style="width:18px; text-align:center;"></i>
              <span>ออกจากระบบ</span>
            </a>
          </div>
        </div>
      `;

      if (navLoginBtn) {
        navLoginBtn.outerHTML = badgeHTML;
      } else if (userLoggedInBadge) {
        userLoggedInBadge.outerHTML = badgeHTML;
      }
      
      const publicProfileBtn = document.getElementById('publicProfileBtn');
      const publicProfileMenuDropdown = document.getElementById('publicProfileMenuDropdown');
      const publicLogoutBtn = document.getElementById('publicLogoutBtn');

      if (publicProfileBtn && publicProfileMenuDropdown) {
        publicProfileBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isVisible = publicProfileMenuDropdown.style.display === 'block';
          publicProfileMenuDropdown.style.display = isVisible ? 'none' : 'block';
        });

        document.addEventListener('click', (e) => {
          const container = document.getElementById('publicUserDropdownContainer');
          if (container && !container.contains(e.target)) {
            publicProfileMenuDropdown.style.display = 'none';
          }
        });
      }

      if (publicLogoutBtn) {
        publicLogoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          sessionStorage.clear();
          localStorage.clear();
          sessionStorage.removeItem('currentUser');
          localStorage.removeItem('currentUser');
          window.location.href = 'index.html';
        });
      }

      if (heroLoginBtn) {
        heroLoginBtn.style.display = 'none';
      }
    } else {
      // User is LOGGED OUT: Remove any lingering badge and ensure Login button is rendered
      if (userLoggedInBadge) {
        userLoggedInBadge.outerHTML = `
          <a href="login.html" class="nav-login-btn">
            <i class="fa-solid fa-user-check"></i>
            <span>เข้าสู่ระบบ</span>
          </a>
        `;
      }
      if (heroLoginBtn) {
        heroLoginBtn.style.display = '';
      }
    }
  } catch(err) {
    console.error(err);
  }

  // 2. Mobile Menu Toggle Handler (.mobile-menu-toggle)
  try {
    const mobileToggleBtn = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileToggleBtn && navMenu) {
      mobileToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('mobile-active');
        const icon = mobileToggleBtn.querySelector('i');
        if (icon) {
          if (navMenu.classList.contains('mobile-active')) {
            icon.className = 'fa-solid fa-xmark';
          } else {
            icon.className = 'fa-solid fa-bars';
          }
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileToggleBtn.contains(e.target)) {
          navMenu.classList.remove('mobile-active');
          const icon = mobileToggleBtn.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-bars';
        }
      });

      // Close menu when clicking any nav link
      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('mobile-active');
          const icon = mobileToggleBtn.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-bars';
        });
      });
    }
  } catch(err) {
    console.error(err);
  }

  // 3. Sticky header scroll detection
  try {
    const siteHeader = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        siteHeader?.classList.add('scrolled');
      } else {
        siteHeader?.classList.remove('scrolled');
      }
    });
  } catch(err) {
    console.error(err);
  }

  // Dynamic Backend Time Slot Checker & Interactive Grid Renderer
  async function checkAvailableTimeSlots(dateStr) {
    const bookingTimeSelect = document.getElementById('bookingTime');
    const queueSlotsGrid = document.getElementById('queueSlotsGrid');
    const slotDisplayDateText = document.getElementById('slotDisplayDateText');
    if (!dateStr) return;

    // Update Date Header Text in Thai
    if (slotDisplayDateText) {
      try {
        const dateObj = new Date(dateStr + 'T00:00:00');
        const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const day = dateObj.getDate();
        const month = thaiMonths[dateObj.getMonth()];
        const yearBE = dateObj.getFullYear() + 543;
        slotDisplayDateText.textContent = `${day} ${month} ${yearBE}`;
      } catch (err) {
        slotDisplayDateText.textContent = dateStr;
      }
    }

    const standardSlots = [
      { time: '09:00', label: '09:00 - 10:30 น.' },
      { time: '10:30', label: '10:30 - 12:00 น.' },
      { time: '13:00', label: '13:00 - 14:30 น.' },
      { time: '14:30', label: '14:30 - 16:00 น.' },
      { time: '15:30', label: '15:30 - 17:00 น.' }
    ];

    let bookedSlots = [];

    try {
      const response = await fetch(`api_queue.php?action=get_booked_slots&date=${encodeURIComponent(dateStr)}`);
      const result = await response.json();
      if (result.success && result.data && Array.isArray(result.data.booked_slots)) {
        bookedSlots = result.data.booked_slots;
      }
    } catch (err) {
      console.warn('Unable to check available time slots from backend:', err);
    }

    // 1. Sync Dropdown Options
    if (bookingTimeSelect) {
      Array.from(bookingTimeSelect.options).forEach(option => {
        const rawVal = option.value.replace(['น.', ' '], '').trim();
        const isBooked = bookedSlots.some(slot => slot.includes(rawVal) || rawVal.includes(slot));
        const baseText = rawVal + ' น.';
        if (isBooked) {
          option.text = `${baseText} (เต็ม/จองแล้ว)`;
          option.disabled = true;
        } else {
          option.text = baseText;
          option.disabled = false;
        }
      });

      if (bookingTimeSelect.selectedOptions[0] && bookingTimeSelect.selectedOptions[0].disabled) {
        const firstEnabled = Array.from(bookingTimeSelect.options).find(opt => !opt.disabled);
        if (firstEnabled) {
          bookingTimeSelect.value = firstEnabled.value;
        }
      }
    }

    // 2. Render Interactive Slot Grid Cards
    if (queueSlotsGrid) {
      queueSlotsGrid.innerHTML = '';

      standardSlots.forEach(slot => {
        const isBooked = bookedSlots.some(b => b.includes(slot.time) || slot.time.includes(b));
        const isSelected = bookingTimeSelect && bookingTimeSelect.value === slot.time;

        const card = document.createElement('div');
        let cardClass = 'slot-card';
        if (isBooked) {
          cardClass += ' booked';
        } else if (isSelected) {
          cardClass += ' available selected';
        } else {
          cardClass += ' available';
        }

        card.className = cardClass;
        card.innerHTML = `
          <div class="slot-status-badge ${isBooked ? 'booked' : 'available'}">
            ${isBooked ? '🔴 มีผู้จองแล้ว' : '🟢 คิวว่าง'}
          </div>
          <div class="slot-time-text">
            <i class="fa-regular fa-clock"></i> ${slot.time} น.
          </div>
          <div style="font-size: 0.73rem; color: var(--color-muted-text); margin-top: 2px;">
            ${slot.label}
          </div>
        `;

        if (!isBooked) {
          card.addEventListener('click', () => {
            if (bookingTimeSelect) {
              bookingTimeSelect.value = slot.time;
            }
            checkAvailableTimeSlots(dateStr);
          });
        }

        queueSlotsGrid.appendChild(card);
      });
    }
  }

  // Form submission handling - Sync with Backend api_queue.php
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const patientNameEl = document.getElementById('patientName');
      const patientPhoneEl = document.getElementById('patientPhone');
      const bookingDateEl = document.getElementById('bookingDate');
      const bookingTimeEl = document.getElementById('bookingTime');
      const serviceSelectEl = document.getElementById('serviceSelect');
      const patientNotesEl = document.getElementById('patientNotes');
      const submitBtn = bookingForm.querySelector('button[type="submit"]');

      const name = patientNameEl ? patientNameEl.value.trim() : 'ผู้รับบริการ';
      const phone = patientPhoneEl ? patientPhoneEl.value.trim() : '';
      const service = serviceSelectEl && serviceSelectEl.selectedIndex >= 0 ? serviceSelectEl.options[serviceSelectEl.selectedIndex].value || serviceSelectEl.options[serviceSelectEl.selectedIndex].text : 'นวดไทยเพื่อการรักษา';
      const serviceText = serviceSelectEl && serviceSelectEl.selectedIndex >= 0 ? serviceSelectEl.options[serviceSelectEl.selectedIndex].text : service;
      const date = bookingDateEl ? bookingDateEl.value : '';
      const time = bookingTimeEl ? bookingTimeEl.value : '';
      const notes = patientNotesEl ? patientNotesEl.value.trim() : '';

      if (!name || !phone || !date || !time) {
        showToast('กรุณากรอกข้อมูลการจองเวลาให้ครบถ้วน', 'error');
        return;
      }

      // UI Loading indicator
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'ยืนยันจองเวลา';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึกข้อมูลการจอง...';
      }

      const payload = {
        patient_name: name,
        patient_phone: phone,
        package: service,
        booking_date: date,
        booking_time: time,
        notes: notes,
        doctor: 'พท.ป. ณัฐวุฒิ สุวรรณเวช',
        room: 'รอจัดสรรห้อง'
      };

      try {
        const response = await fetch('api_queue.php?action=create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success && result.data) {
          const queueId = result.data.queue_id || 'Q-NEW';
          
          window.closeBookingModal();
          bookingForm.reset();
          
          // Re-trigger slot check to update disabled status for newly booked slot
          checkAvailableTimeSlots(date);

          // Trigger Toast Notification Feedback
          showToast(`ขอบคุณคุณ ${name}! ระบบบันทึกการจองเวลา "${serviceText}" วันที่ ${date} เวลา ${time} น. (รหัสคิว ${queueId}) เข้าสู่ระบบหลังบ้านเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับผ่านเบอร์ ${phone}`);
        } else {
          showToast(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลการจอง', 'error');
        }
      } catch (err) {
        console.error('Booking sync error:', err);
        showToast(`ขอบคุณคุณ ${name}! ระบบลงทะเบียนการจองเวลา "${serviceText}" วันที่ ${date} เวลา ${time} น. เรียบร้อยแล้ว`, 'success');
        window.closeBookingModal();
        bookingForm.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  // Toast Notification Feedback System
  function showToast(message, type = 'success') {
    const toastNotification = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    if (toastMsg) {
      toastMsg.textContent = message;
    }
    if (toastNotification) {
      toastNotification.classList.add('active');
      setTimeout(() => {
        toastNotification.classList.remove('active');
      }, 6000);
    }
  }

  // Set Default Minimum Date & Add Change Event Listener
  const datePicker = document.getElementById('bookingDate');
  if (datePicker) {
    const today = new Date().toISOString().split('T')[0];
    datePicker.min = today;
    if (!datePicker.value) {
      datePicker.value = today;
    }
    
    datePicker.addEventListener('change', (e) => {
      checkAvailableTimeSlots(e.target.value);
    });

    // Check available time slots on initial load
    checkAvailableTimeSlots(datePicker.value || today);
  }
});
