/* ══════════════════════════════════════
   MOHALKAR – script.js
══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── NAVBAR scroll effect ─────────── */
  const navbar = document.getElementById('mainNavbar');
  function handleNavScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ── SMOOTH scroll for nav links ──── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 10;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth'
        });
        // Close mobile menu
        const collapse = document.querySelector('#navMenu');
        if (collapse && collapse.classList.contains('show')) {
          bootstrap.Collapse.getInstance(collapse)?.hide();
        }
      }
    });
  });

  /* ── STATS COUNTER ───────────────── */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let statsAnimated = false;

  function animateStats() {
    statNumbers.forEach(el => {
      const target = +el.dataset.target;
      const duration = 1800;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current);
      }, 16);
    });
    statsAnimated = true;
  }

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    const statsObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !statsAnimated) {
        animateStats();
        statsObs.disconnect();
      }
    }, { threshold: 0.3 });
    statsObs.observe(statsSection);
  }

  /* ── REVEAL ANIMATIONS ───────────── */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, +delay);
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObs.observe(el));
  }

  /* ── SHOW MORE PROJECTS ──────────── */
  const showMoreBtn = document.getElementById('showMoreBtn');
  const extraProjects = document.querySelectorAll('.extra-project');

  if (showMoreBtn) {
    showMoreBtn.addEventListener('click', function () {
      const isHidden = extraProjects[0]?.style.display === 'none';
      extraProjects.forEach(p => {
        p.style.display = isHidden ? '' : 'none';
      });
      this.textContent = isHidden ? 'Show Less Projects' : 'Show More Projects';

      // After "Show Less", scroll so the first row (top 3 projects) is in view
      if (!isHidden) {
        const projectGrid = document.getElementById('projectGrid');
        const nav = document.getElementById('mainNavbar');
        const offset = nav ? nav.offsetHeight + 10 : 0;
        if (projectGrid) {
          window.scrollTo({
            top: projectGrid.getBoundingClientRect().top + window.scrollY - offset,
            behavior: 'smooth'
          });
        }
      }
    });
  }

  /* ── LIGHTBOX ────────────────────── */
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn    = document.getElementById('lightbox-close');

  document.querySelectorAll('.popup-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      lightboxImg.src = link.href;
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.style.display = 'none';
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ── SCROLL TO TOP ───────────────── */
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });
  }

  /* ── ENQUIRY FORM HANDLING ────────── */

  /* ── ENQUIRY FORM HANDLING ────────── */
  const enquiryForm = document.getElementById('enquiryForm');
  const enquiryStatus = document.getElementById('enquiryStatus');
  const downloadEnquiryExcelBtn = document.getElementById('downloadEnquiryExcel');
  const enquiryStorageKey = 'mohalkar_enquiries';

  // Mailto fallback: enquiry goes TO studio inbox
  const recipientEmail = 'mohalkararchitectsandplanners@gmail.com';

  function getEnquiries() {
    try {
      return JSON.parse(localStorage.getItem(enquiryStorageKey)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveEnquiry(entry) {
    const entries = getEnquiries();
    entries.push(entry);
    localStorage.setItem(enquiryStorageKey, JSON.stringify(entries));
  }

  function exportEnquiriesToExcel() {
    if (typeof XLSX === 'undefined') {
      enquiryStatus.textContent = 'Excel library failed to load.';
      enquiryStatus.className = 'enquiry-status error';
      return;
    }
    const entries = getEnquiries();
    if (!entries.length) {
      enquiryStatus.textContent = 'No enquiries available to export.';
      enquiryStatus.className = 'enquiry-status error';
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(entries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiries');
    XLSX.writeFile(workbook, 'mohalkar-enquiries.xlsx');
    enquiryStatus.textContent = `Excel downloaded successfully (${entries.length} records).`;
    enquiryStatus.className = 'enquiry-status success';
  }

  if (downloadEnquiryExcelBtn) {
    downloadEnquiryExcelBtn.addEventListener('click', exportEnquiriesToExcel);
  }

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!enquiryForm.checkValidity()) {
        enquiryStatus.textContent = 'Please fill all required fields.';
        enquiryStatus.className = 'enquiry-status error';
        enquiryForm.classList.add('was-validated');
        return;
      }

      const formData = new FormData(enquiryForm);
      const enquiryData = {
        name: (formData.get('name') || '').toString().trim(),
        email: (formData.get('email') || '').toString().trim(),
        phone: (formData.get('phone') || '').toString().trim(),
        location: (formData.get('location') || '').toString().trim(),
        type: (formData.get('type') || '').toString().trim(),
        message: (formData.get('message') || '').toString().trim()
      };

      // Save locally
      saveEnquiry({ Timestamp: new Date().toLocaleString(), ...enquiryData });

      // Update button state while sending
      const submitBtn = enquiryForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending... <i class="bi bi-hourglass-split ms-2"></i>';
      submitBtn.disabled = true;
      enquiryStatus.textContent = '';

      try {
        // Attempt to send using your send-enquiry.js backend
        const response = await fetch('/api/send-enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enquiryData)
        });

        if (!response.ok) throw new Error('Backend failed');

        enquiryStatus.textContent = 'Thank you! Your enquiry has been sent.';
        enquiryStatus.className = 'enquiry-status success';
        enquiryForm.reset();
        enquiryForm.classList.remove('was-validated');

      } catch (error) {
        // Fallback: If backend is down, open the user's default Mail Client
        console.warn('Backend send failed. Opening Mailto fallback...');

        const mailSubject = encodeURIComponent(`New Enquiry from ${enquiryData.name}`);
        const mailBody = encodeURIComponent(
          `Name: ${enquiryData.name}\n` +
          `Email: ${enquiryData.email}\n` +
          `Phone: ${enquiryData.phone}\n` +
          `Location: ${enquiryData.location}\n` +
          `Project Type: ${enquiryData.type || 'Not specified'}\n\n` +
          `Project Details:\n${enquiryData.message}`
        );

        window.location.href = `mailto:${recipientEmail}?subject=${mailSubject}&body=${mailBody}`;

        enquiryStatus.textContent = 'Opening your mail app to complete the enquiry...';
        enquiryStatus.className = 'enquiry-status success';
        enquiryForm.reset();
        enquiryForm.classList.remove('was-validated');

      } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }

  /* ── LEADERSHIP PROFILE MODAL ─────── */
  const profileOverlay   = document.getElementById('profileOverlay');
  const profilePhoto     = document.getElementById('profilePhoto');
  const profileNameEl    = document.getElementById('profileName');
  const profileTitleEl   = document.getElementById('profileTitle');
  const profileBioEl     = document.getElementById('profileBio');
  const profileCloseBtn  = document.getElementById('profileClose');

  const leaderCards = document.querySelectorAll('.leader-card');

  const profiles = {
    ceo: {
      name: 'CEO',
      title: 'Abhishek Mohalkar · Founder & Principal Architect',
      photo: '/images/ceo.png',
      fallback: '/images/ceo.png',
      bio: 'As CEO & Principal Architect, leads the overall vision of Mohalkar Architects & Planners—bringing together design, engineering and client aspirations into clear, buildable solutions. Oversees concept design, key client interactions, and major project decisions across residential, commercial and urban-scale work.'
    },
    cmd: {
      name: 'CMD',
      title: 'Sujit Mohalkar · Brand & Growth',
      photo: '/images/cmo.png',
      fallback: '/images/cmo.png',
      bio: 'As CMD, leads brand strategy, communications and growth initiatives for the studio—ensuring that every project, visual and interaction reflects the firm’s design philosophy. Works on partnerships, digital presence and client experience, helping connect the right audiences with the right services.'
    }
  };

  function openProfileModal(key) {
    if (!profileOverlay || !profiles[key]) return;
    const data = profiles[key];
    if (profileNameEl)  profileNameEl.textContent  = data.name;
    if (profileTitleEl) profileTitleEl.textContent = data.title;
    if (profileBioEl)   profileBioEl.textContent   = data.bio;
    if (profilePhoto) {
      profilePhoto.src = data.photo;
      profilePhoto.onerror = function () {
        this.onerror = null;
        this.src = data.fallback;
      };
    }
    profileOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeProfileModal() {
    if (!profileOverlay) return;
    profileOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  leaderCards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.profile;
      if (key) openProfileModal(key);
    });
  });

  if (profileCloseBtn) {
    profileCloseBtn.addEventListener('click', closeProfileModal);
  }
  if (profileOverlay) {
    profileOverlay.addEventListener('click', (e) => {
      if (e.target === profileOverlay) closeProfileModal();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && profileOverlay?.style.display === 'flex') {
      closeProfileModal();
    }
  });

});
