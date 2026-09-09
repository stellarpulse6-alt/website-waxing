let availableServices = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchServices();
  setupNavigation();
  setMinBookingDate();
});

// Fetch services list from Elysia Backend API
async function fetchServices() {
  const grid = document.getElementById('servicesGrid');
  const select = document.getElementById('bookingServiceSelect');

  try {
    const res = await fetch('/api/services');
    const json = await res.json();

    if (json.success && json.data) {
      availableServices = json.data;
      renderServicesGrid(json.data);
      populateServiceSelect(json.data);
    } else {
      grid.innerHTML = `<p class="text-center">Gagal memuat layanan.</p>`;
    }
  } catch (err) {
    console.error('Error fetching services:', err);
    grid.innerHTML = `<p class="text-center">Gagal terhubung ke server API.</p>`;
  }
}

// Render service cards in Services section
function renderServicesGrid(services) {
  const grid = document.getElementById('servicesGrid');
  if (!services || services.length === 0) {
    grid.innerHTML = `<p class="text-center">Belum ada layanan tersedia.</p>`;
    return;
  }

  grid.innerHTML = services.map(service => {
    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(Number(service.price));

    return `
      <div class="service-card">
        <div>
          <div class="service-header">
            <h3 class="service-title">${escapeHtml(service.name)}</h3>
            <span class="service-price">${formattedPrice}</span>
          </div>
          <p class="service-desc">${escapeHtml(service.description || 'Layanan waxing kualitas terbaik dengan perawatan steril.')}</p>
        </div>
        <div class="service-footer">
          <span class="service-duration">
            <i class="fa-regular fa-clock"></i> ${service.durationMinutes} Menit
          </span>
          <button class="btn btn-outline" onclick="openBookingModal(${service.id})">
            Pesan Now <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Populate modal select dropdown
function populateServiceSelect(services) {
  const select = document.getElementById('bookingServiceSelect');
  select.innerHTML = `<option value="">-- Pilih Layanan --</option>` +
    services.map(s => `<option value="${s.id}">${escapeHtml(s.name)} - Rp ${Number(s.price).toLocaleString('id-ID')} (${s.durationMinutes} mnt)</option>`).join('');
}

// Set minimum booking date to today
function setMinBookingDate() {
  const dateInput = document.getElementById('bookingDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }
}

// Modal handling
function openBookingModal(serviceId = null) {
  const modal = document.getElementById('bookingModal');
  modal.classList.add('active');
  if (serviceId) {
    document.getElementById('bookingServiceSelect').value = serviceId;
  }
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  modal.classList.remove('active');
}

// Form Submit: Booking Appointment
async function handleBookingSubmit(event) {
  event.preventDefault();
  const btn = document.getElementById('btnSubmitBooking');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Memproses...`;

  const serviceId = Number(document.getElementById('bookingServiceSelect').value);
  const bookingDate = document.getElementById('bookingDate').value;
  const bookingTime = document.getElementById('bookingTime').value + ':00';
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const email = document.getElementById('customerEmail').value.trim() || undefined;
  const notes = document.getElementById('bookingNotes').value.trim() || undefined;

  try {
    // 1. Create customer or get ID
    const customerRes = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email })
    });
    const customerData = await customerRes.json();

    if (!customerData.success) {
      throw new Error(customerData.message || 'Gagal menyimpan data pelanggan');
    }

    const customerId = customerData.data.id;

    // 2. Create booking
    const bookingRes = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        serviceId,
        bookingDate,
        bookingTime,
        status: 'pending',
        notes
      })
    });
    const bookingResult = await bookingRes.json();

    if (bookingResult.success) {
      showToast('🎉 Reservasi Berhasil! Kami akan menghubungi Anda via WhatsApp.');
      closeBookingModal();
      document.getElementById('bookingForm').reset();
      setMinBookingDate();
    } else {
      throw new Error(bookingResult.message || 'Gagal membuat reservasi');
    }
  } catch (err) {
    showToast('⚠️ ' + err.message, '#ef4444');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `Konfirmasi Booking`;
  }
}

// Form Submit: Contact
function handleContactSubmit(event) {
  event.preventDefault();
  showToast('💬 Pesan Anda berhasil terkirim. Tim kami akan segera membalas!');
  event.target.reset();
}

// Toast notification helper
function showToast(message, bgColor = '#10b981') {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.style.backgroundColor = bgColor;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 4000);
}

// Navigation mobile toggle
function setupNavigation() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '100%';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = '#fdfbf7';
      links.style.padding = '20px';
      links.style.borderBottom = '1px solid #eee7db';
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, match => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match];
  });
}
