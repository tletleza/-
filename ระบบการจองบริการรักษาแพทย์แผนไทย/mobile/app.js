/**
 * mobile/app.js - Thai Traditional Medicine Mobile App Single Page Application Logic
 * Includes Auth, Symptom Screening, Calendar, Summary, Treatment History, Follow-up Re-booking, Satisfaction Survey, & Clinic Contact Location.
 */

let selectedSymptoms = ['office-syndrome'];
let currentWizardStep = 1;
let selectedBookingDate = '2026-08-01';
let selectedTimeSlot = '10:00 - 11:30 น.';
let selectedDoctor = { name: 'พท.ว. สมชาย ใจดี', role: 'doctor' };
let selectedService = { name: 'นวดไทยราชสำนักแก้อาการ', price: 850.00 };
let currentStarRating = 5;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Mobile App Application Engine Loaded.');
});

// Router Switcher for Mobile Views
function switchMobilePage(pageId) {
    const views = [
        'authView', 'screeningView', 'slotSelectionView', 'bookingSummaryView',
        'bookingSuccessView', 'massageServicesView', 'packagesView', 'doctorsProfileView',
        'treatmentHistoryView', 'followUpBookingView', 'satisfactionSurveyView', 'clinicContactView'
    ];

    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    document.querySelectorAll('.nav-bottom-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-nav') === pageId);
    });

    let targetView = document.getElementById(`${pageId}View`) || document.getElementById(pageId);
    if (pageId === 'history') targetView = document.getElementById('treatmentHistoryView');
    if (pageId === 'contact') targetView = document.getElementById('clinicContactView');

    if (targetView) targetView.style.display = 'block';

    const bottomNav = document.getElementById('mobileBottomNav');
    if (bottomNav) bottomNav.style.display = (pageId === 'authView' ? 'none' : 'flex');
}

function switchAuthTab(tab) {
    const btnLogin = document.getElementById('btnTabLogin');
    const btnRegister = document.getElementById('btnTabRegister');
    const formLogin = document.getElementById('loginForm');
    const formRegister = document.getElementById('registerForm');

    if (tab === 'login') {
        btnLogin.classList.add('active');
        btnRegister.classList.remove('active');
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
    } else {
        btnRegister.classList.add('active');
        btnLogin.classList.remove('active');
        formRegister.style.display = 'block';
        formLogin.style.display = 'none';
    }
}

function handleMobileLogin(event) {
    event.preventDefault();
    showMobileToast(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณผู้ป่วย`);
    setTimeout(() => switchMobilePage('screening'), 500);
}

function handleMobileRegister(event) {
    event.preventDefault();
    showMobileToast(`🎉 ลงทะเบียนสำเร็จ!`);
    setTimeout(() => switchMobilePage('screening'), 800);
}

function goBackToAuth() {
    switchMobilePage('authView');
}

// Symptom Screening Wizard
function togglePainChip(element) {
    const symptom = element.getAttribute('data-symptom');
    element.classList.toggle('selected');
    if (element.classList.contains('selected')) {
        if (!selectedSymptoms.includes(symptom)) selectedSymptoms.push(symptom);
    } else {
        selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
    }
}

function updatePainSlider(val) {
    const scoreDisplay = document.getElementById('painScoreDisplay');
    const levelLabel = document.getElementById('painLevelLabel');
    if (scoreDisplay) scoreDisplay.textContent = val;

    if (levelLabel) {
        if (val <= 3) levelLabel.textContent = "ปวดเล็กน้อย (รู้สึกเมื่อยเป็นบางครั้ง)";
        else if (val <= 6) levelLabel.textContent = "ปวดปานกลาง (รบกวนการทำงานและการนอน)";
        else levelLabel.textContent = "ปวดรุนแรงมาก (ทรมาน มีอาการชาลามร่วมด้วย)";
    }
}

function nextWizardStep(step) {
    currentWizardStep = step;
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById(`dotStep${i}`);
        if (dot) dot.classList.toggle('active', i <= step);
        const card = document.getElementById(`wizardStep${i}`);
        if (card) card.style.display = (i === step ? 'block' : 'none');
    }
}

function matchDoctorEngine() {
    nextWizardStep(4);
    showMobileToast('✨ วิเคราะห์และจับคู่แพทย์เฉพาะทางเรียบร้อยแล้ว!');
}

function openSlotSelectionView() { switchMobilePage('slotSelection'); }

function selectBookingDate(dateStr, btnElement) {
    selectedBookingDate = dateStr;
    document.querySelectorAll('.date-pill-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
    showMobileToast(`📅 เลือกวันที่: ${dateStr}`);
}

function selectTimeSlot(timeStr, btnElement) {
    selectedTimeSlot = timeStr;
    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
}

function openBookingSummaryView() {
    document.getElementById('summaryDateTime').textContent = `วันเสาร์ที่ 1 ส.ค. (${selectedTimeSlot})`;
    document.getElementById('summaryDocName').textContent = `${selectedDoctor.name} (แพทย์)`;
    document.getElementById('summaryTotalPrice').textContent = `฿${selectedService.price.toFixed(2)}`;
    switchMobilePage('bookingSummary');
}

async function confirmBookingAction() {
    showMobileToast('⏳ กำลังยืนยันการจองคิวการรักษา...');
    setTimeout(() => {
        const queueNum = `QUEUE #Q-0${Math.floor(Math.random() * 80 + 10)}`;
        document.getElementById('ticketQueueNumber').textContent = queueNum;
        switchMobilePage('bookingSuccess');
        showMobileToast('🎉 ยืนยันการจองสำเร็จ! ได้รับหมายเลขคิวแล้ว');
    }, 800);
}

function openFollowUpView(serviceName, doctorName) {
    document.getElementById('followUpServiceName').textContent = serviceName;
    document.getElementById('followUpDocName').textContent = doctorName;
    switchMobilePage('followUpBookingView');
}

function selectFollowUpInterval(interval, btnElement) {
    document.querySelectorAll('#followUpBookingView .slot-btn').forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
}

function confirmFollowUpAction() {
    showMobileToast('🎉 บันทึกการนัดหมายติดตามอาการเรียบร้อยแล้ว!');
    setTimeout(() => switchMobilePage('history'), 800);
}

function openSurveyModal(visitTitle) {
    document.getElementById('surveyVisitTitle').textContent = `รอบการรักษา: ${visitTitle}`;
    setStarRating(5);
    document.getElementById('surveyFeedbackText').value = '';
    switchMobilePage('satisfactionSurveyView');
}

function setStarRating(rating) {
    currentStarRating = rating;
    const container = document.getElementById('starRatingContainer');
    const stars = container.querySelectorAll('.star-rating-icon');

    stars.forEach((star, index) => {
        if (index < rating) star.classList.add('active');
        else star.classList.remove('active');
    });

    const labels = ["", "ปรับปรุง (1/5)", "พอใช้ (2/5)", "ปานกลาง (3/5)", "ดีมาก (4/5)", "ดีเยี่ยมมาก (5/5 ดาว)"];
    document.getElementById('starRatingLabel').textContent = labels[rating] || "";
}

function submitSatisfactionSurvey() {
    showMobileToast('💖 ขอบพระคุณสำหรับแบบประเมินความพึงพอใจ!');
    setTimeout(() => switchMobilePage('history'), 800);
}

function showMobileToast(msg) {
    const container = document.getElementById('mobileToastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'mobile-toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
