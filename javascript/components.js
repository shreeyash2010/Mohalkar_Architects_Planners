/* ═══════════════════════════════════════════════════
   components.js — Shared Navbar · Contact · Footer
   Mohalkar Architects & Planners
═══════════════════════════════════════════════════ */

(function () {
  /* ── NAVBAR ───────────────────────────────────── */
  const navHTML = `
  <nav id="mainNavbar" class="navbar navbar-expand-lg fixed-top navbar-dark-solid">
    <div class="container-xl">
      <a class="navbar-brand d-flex align-items-center gap-3" href="/index.html">
        <img src="/images/logo.jpg" alt="logo" style="height:46px;border-radius:4px;" onerror="this.style.display='none'" />
        <div>
          <div class="brand-title">MOHALKAR</div>
          <div class="brand-sub">ARCHITECTS &amp; PLANNERS</div>
        </div>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
          <li class="nav-item"><a class="nav-link" href="/index.html">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="/about.html">About</a></li>
          <li class="nav-item"><a class="nav-link" href="/expertise.html">Expertise</a></li>
          <li class="nav-item"><a class="nav-link" href="/services.html">Services</a></li>
          <li class="nav-item"><a class="nav-link" href="/projects.html">Projects</a></li>
          <li class="nav-item"><a class="nav-link" href="/enquiry.html">Contact</a></li>
          <li class="nav-item ms-lg-3">
            <a class="btn btn-nav-cta" href="/enquiry.html">Enquire Now</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>`;

  /* ── CONTACT SECTION ──────────────────────────── */
  const contactHTML = `
  <section class="contact-section shared-contact">
    <div class="container-xl">
      <div class="section-header text-center mb-5">
        <span class="section-label">Get in Touch</span>
        <h2 class="section-heading contact-heading">Let's Build Something<br>Extraordinary</h2>
      </div>
      <div class="row g-4 justify-content-center">
        <div class="col-md-6 col-lg-3">
          <div class="contact-card">
            <div class="contact-icon"><i class="bi bi-telephone-fill"></i></div>
            <h6 class="contact-type">Phone</h6>
            <p class="contact-val">+91 9146079235</p>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="contact-card">
            <div class="contact-icon"><i class="bi bi-envelope-fill"></i></div>
            <h6 class="contact-type">Email</h6>
            <a href="mailto:mohalkararchitectsandplanners@gmail.com" class="contact-val">mohalkararchitectsandplanners<br>@gmail.com</a>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="contact-card">
            <div class="contact-icon text-success"><i class="bi bi-whatsapp"></i></div>
            <h6 class="contact-type">WhatsApp</h6>
            <a href="https://wa.me/919146079235?text=Hello%20Mohalkar%20Architects,%20I%20would%20like%20to%20discuss%20a%20new%20project%20and%20request%20your%20brochure." target="_blank" rel="noopener noreferrer" class="contact-val text-success fw-semibold">Chat: +91 9146079235</a>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="contact-card">
            <div class="contact-icon"><i class="bi bi-instagram"></i></div>
            <h6 class="contact-type">Instagram</h6>
            <a href="https://www.instagram.com/abhi_mohalkar/" target="_blank" class="contact-val">@abhi_mohalkar</a>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center align-items-center gap-3 flex-wrap mt-5">
        <a href="/enquiry.html" class="btn btn-gold px-5 py-3">Send an Enquiry &nbsp;<i class="bi bi-arrow-right"></i></a>
      </div>
    </div>
  </section>`;

  /* ── FOOTER ───────────────────────────────────── */
  const footerHTML = `
  <footer class="site-footer">
    <div class="container-xl">
      <div class="row g-5">
        <div class="col-lg-4">
          <div class="footer-brand">MOHALKAR</div>
          <div class="footer-brand-sub">ARCHITECTS &amp; PLANNERS</div>
          <p class="footer-desc mt-3">Designing modern, inspiring spaces for a better tomorrow. Excellence in every line, purpose in every space.</p>
          <div class="footer-social mt-3 d-flex gap-3">
            <a href="https://www.instagram.com/abhi_mohalkar/" target="_blank"><i class="bi bi-instagram"></i></a>
            <a href="https://linkedin.com/in/" target="_blank"><i class="bi bi-linkedin"></i></a>
            <a href="mailto:mohalkararchitectsandplanners@gmail.com"><i class="bi bi-envelope"></i></a>
          </div>
        </div>
        <div class="col-lg-2 col-6">
          <h6 class="footer-col-heading">Quick Links</h6>
          <ul class="footer-links">
            <li><a href="/index.html">Home</a></li>
            <li><a href="/about.html">About Us</a></li>
            <li><a href="/expertise.html">Expertise</a></li>
            <li><a href="/services.html">Services</a></li>
            <li><a href="/projects.html">Projects</a></li>
            <li><a href="/enquiry.html">Contact &amp; Enquiry</a></li>
            <li><a href="/Mohalkar-Architects-and-Planners-Brochure.pdf" download="Mohalkar-Architects-and-Planners-Brochure.pdf" target="_blank" class="text-gold"><i class="bi bi-file-earmark-pdf-fill me-1"></i>Download Brochure</a></li>
            <li><a href="/admin.html">Admin Portal</a></li>
          </ul>
        </div>
        <div class="col-lg-3 col-6">
          <h6 class="footer-col-heading">Services</h6>
          <ul class="footer-links">
            <li><a href="/services.html"><i class="bi bi-house-gear text-gold me-2"></i>Residential Architecture</a></li>
            <li><a href="/services.html"><i class="bi bi-buildings text-gold me-2"></i>Commercial &amp; Hospitality</a></li>
            <li><a href="/services.html"><i class="bi bi-lamp text-gold me-2"></i>Interior Architecture</a></li>
            <li><a href="/services.html"><i class="bi bi-compass text-gold me-2"></i>Urban &amp; Master Planning</a></li>
            <li><a href="/services.html"><i class="bi bi-tree text-gold me-2"></i>Landscape Architecture</a></li>
            <li><a href="/services.html"><i class="bi bi-boxes text-gold me-2"></i>3D Visualization &amp; BIM</a></li>
          </ul>
        </div>
        <div class="col-lg-3">
          <h6 class="footer-col-heading">Contact Us</h6>
          <p class="footer-contact-line">
            <i class="bi bi-geo-alt"></i>
            <a href="https://www.google.com/maps/place/Mohalkar+Architects+%26+Planners/@18.4579595,75.6589568,17z/data=!3m1!4b1!4m9!1m2!10m1!1e2!3m5!1s0xade94e4662cd739b:0xe81c7bd700734a53!8m2!3d18.4579544!4d75.6615317!16s%2Fg%2F11p19rx8w9?entry=ttu&g_ep=EgoyMDI2MTAwNy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" class="footer-contact-link" title="Open Mohalkar Architects &amp; Planners on Google Maps">Studio Locations: Maharashtra, India</a>
          </p>
          <p class="footer-contact-line">
            <i class="bi bi-telephone"></i>
            <a href="tel:+919146079235" class="footer-contact-link" title="Call Mohalkar Architects &amp; Planners">+91 9146079235</a>
          </p>
          <p class="footer-contact-line">
            <i class="bi bi-envelope"></i>
            <a href="mailto:mohalkararchitectsandplanners@gmail.com" class="footer-contact-link" title="Email Mohalkar Architects &amp; Planners">mohalkararchitectsandplanners@gmail.com</a>
          </p>
          <p class="footer-contact-line">
            <i class="bi bi-instagram"></i>
            <a href="https://www.instagram.com/abhi_mohalkar/" target="_blank" rel="noopener noreferrer" class="footer-contact-link" title="Visit @abhi_mohalkar on Instagram">@abhi_mohalkar</a>
          </p>
        </div>
      </div>
      <div class="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center mt-5 pt-4 gap-3 text-center text-md-start">
        <p class="mb-0">© 2026 <strong>Abhishek Mohalkar</strong>. All rights reserved.</p>
        <div class="footer-craft-credit text-md-end">
          <span class="credit-role">Digital Architecture &amp; Web Experience Partner</span>
          <span class="credit-dot">·</span>
          <span class="credit-by">Crafted by</span>
          <a href="https://mali-web-studios.vercel.app/" target="_blank" rel="noopener noreferrer" class="credit-name">
            Mali Web Studios <i class="bi bi-arrow-up-right small"></i>
          </a>
        </div>
      </div>
    </div>
  </footer>
  <a href="#" class="scroll-top-btn visible" id="scrollTopBtn" title="Back to top">
    <i class="bi bi-arrow-up"></i>
  </a>`;

  /* ── INJECT ───────────────────────────────────── */
  const navSlot    = document.getElementById('nav-slot');
  const contactSlot = document.getElementById('contact-slot');
  const footerSlot = document.getElementById('footer-slot');

  if (navSlot)     navSlot.innerHTML     = navHTML;
  if (contactSlot) contactSlot.innerHTML = contactHTML;
  if (footerSlot)  footerSlot.innerHTML  = footerHTML;

  /* ── NAVBAR SCROLL EFFECT ─────────────────────── */
  const navbar = document.getElementById('mainNavbar');
  if (navbar) {
    /* Pages other than index have a page-hero with bg — start scrolled */
    const isInnerPage = document.body.classList.contains('inner-page');
    function updateNav() {
      if (window.scrollY > 60 || isInnerPage) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    /* Highlight current page link */
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    navbar.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href').split('/').pop().split('#')[0];
      if (href === currentPath) link.classList.add('active');
    });
  }

  /* ── SCROLL-TO-TOP ────────────────────────────── */
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── REVEAL ANIMATIONS ───────────────────────── */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add('revealed'), +delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => obs.observe(el));
  }

})();
