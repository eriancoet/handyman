/* ===== HEADER SCROLL ===== */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

/* ===== MOBILE NAV ===== */
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
navToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});
document.querySelectorAll('.nav-list a').forEach(a => {
  a.addEventListener('click', () => mainNav.classList.remove('open'));
});

/* ===== SCROLL REVEAL ===== */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ===== BOOKING SYSTEM ===== */
let currentStep = 1;
let selectedService = '';
let selectedDate = null;
let selectedTime = '';
let currentMonthDate = new Date();
currentMonthDate.setDate(1);

const SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
const BOOKED_SLOTS = { /* simulate some booked slots */
  [fmtDate(new Date())]: ['10:00', '14:00']
};

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function goToStep(n) {
  document.querySelectorAll('.booking-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  const panel = document.getElementById(`panel-${n}`);
  const step = document.getElementById(`step-${n}`);
  if (panel) panel.classList.remove('hidden');
  if (step) {
    step.classList.add('active');
    for (let i = 1; i < n; i++) {
      const prev = document.getElementById(`step-${i}`);
      if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
    }
  }
  currentStep = n;
}

/* Service Selection */
document.querySelectorAll('input[name="service"]').forEach(r => {
  r.addEventListener('change', () => {
    selectedService = r.value;
    document.getElementById('next-1').disabled = false;
  });
});
document.getElementById('next-1').addEventListener('click', () => {
  goToStep(2);
  renderCalendar();
});

/* Calendar */
function renderCalendar() {
  const label = document.getElementById('cal-month-label');
  const grid = document.getElementById('cal-grid');
  const today = new Date();
  today.setHours(0,0,0,0);
  const y = currentMonthDate.getFullYear();
  const m = currentMonthDate.getMonth();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  label.textContent = `${monthNames[m]} ${y}`;
  grid.innerHTML = '';

  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-name'; el.textContent = d; grid.appendChild(el);
  });

  const firstDay = new Date(y, m, 1).getDay();
  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div'); el.className = 'cal-day empty'; grid.appendChild(el);
  }

  const daysInMonth = new Date(y, m+1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d);
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = d;
    const dateStr = fmtDate(date);
    const isSunday = date.getDay() === 0;
    const isPast = date < today;
    if (isPast || isSunday) {
      el.classList.add('disabled');
    } else {
      if (date.toDateString() === today.toDateString()) el.classList.add('today');
      if (selectedDate && dateStr === fmtDate(selectedDate)) el.classList.add('selected');
      el.addEventListener('click', () => {
        selectedDate = date;
        selectedTime = '';
        document.getElementById('next-2').disabled = true;
        renderCalendar();
        showTimeSlots(dateStr);
      });
    }
    grid.appendChild(el);
  }
}

function showTimeSlots(dateStr) {
  const wrap = document.getElementById('time-slots');
  const sGrid = document.getElementById('slots-grid');
  wrap.style.display = 'block';
  sGrid.innerHTML = '';
  const booked = BOOKED_SLOTS[dateStr] || [];
  SLOTS.forEach(t => {
    const el = document.createElement('div');
    el.className = 'slot';
    el.textContent = t;
    if (booked.includes(t)) {
      el.classList.add('booked');
    } else {
      el.addEventListener('click', () => {
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        selectedTime = t;
        document.getElementById('next-2').disabled = false;
      });
    }
    sGrid.appendChild(el);
  });
}

document.getElementById('cal-prev').addEventListener('click', () => {
  currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
  renderCalendar();
});
document.getElementById('cal-next').addEventListener('click', () => {
  currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
  renderCalendar();
});
document.getElementById('next-2').addEventListener('click', () => {
  goToStep(3);
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const d = selectedDate;
  document.getElementById('booking-summary').innerHTML = `
    <strong>Service:</strong> ${selectedService} &nbsp;|&nbsp;
    <strong>Date:</strong> ${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()} &nbsp;|&nbsp;
    <strong>Time:</strong> ${selectedTime}
  `;
});
document.getElementById('back-2').addEventListener('click', () => goToStep(1));
document.getElementById('back-3').addEventListener('click', () => goToStep(2));

/* Booking Form Submit */
document.getElementById('booking-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('b-name').value;
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const d = selectedDate;
  document.getElementById('success-summary').textContent =
    `${name}, your ${selectedService} appointment is confirmed for ${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} at ${selectedTime}.`;
  goToStep('success');
  document.getElementById('panel-success').classList.remove('hidden');
  document.querySelectorAll('.booking-step').forEach(s => { s.classList.remove('active'); s.classList.add('done'); });
});

/* ===== CONTACT FORM ===== */
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = document.getElementById('contact-success');
  msg.style.display = 'block';
  e.target.reset();
  setTimeout(() => msg.style.display = 'none', 4000);
});
