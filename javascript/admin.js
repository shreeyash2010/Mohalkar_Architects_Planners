/* ═══════════════════════════════════════════════════
   MOHALKAR – Studio Admin Portal JavaScript
   Executive Console Controller
═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Storage Keys
  const AUTH_STORAGE_KEY = 'mohalkar_current_admin_user_v1';
  const PASSCODE_KEY = 'mohalkar_admin_passcode_v2';
  const ENQUIRIES_CACHE_KEY = 'mohalkar_admin_enquiries_v2';

  // State
  let currentUser = null;
  let allProjects = [];
  let allEnquiries = [];
  let allActivity = [];
  let studioSettings = {};
  let currentTab = 'projects';
  let itemToDelete = null;
  let deleteModalInstance = null;
  let toastInstance = null;

  // DOM Elements
  const loginSection = document.getElementById('adminLoginSection');
  const dashboardSection = document.getElementById('adminDashboardSection');
  const loginForm = document.getElementById('adminLoginForm');
  const loginErrorAlert = document.getElementById('loginErrorAlert');
  const btnLogout = document.getElementById('btnLogout');
  const currentUserNameEl = document.getElementById('currentUserName');
  const currentUserRoleEl = document.getElementById('currentUserRole');
  const currentUserBadgeEl = document.getElementById('currentUserBadge');
  const clockEl = document.getElementById('liveClock');

  /* ── INITIALIZATION ────────────────────────────── */
  function init() {
    startClock();
    checkExistingAuth();
    setupEventListeners();
  }

  function startClock() {
    function update() {
      if (clockEl) {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
      }
    }
    update();
    setInterval(update, 1000);
  }

  /* ── AUTHENTICATION ────────────────────────────── */
  function checkExistingAuth() {
    try {
      const saved = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        currentUser = JSON.parse(saved);
        showDashboard();
        return;
      }
    } catch (e) {
      console.warn('Auth check error:', e);
    }
    showLogin();
  }

  function showLogin() {
    if (loginSection) loginSection.classList.remove('d-none');
    if (dashboardSection) dashboardSection.classList.add('d-none');
  }

  function showDashboard() {
    if (loginSection) loginSection.classList.add('d-none');
    if (dashboardSection) dashboardSection.classList.remove('d-none');

    if (currentUser) {
      if (currentUserNameEl) currentUserNameEl.textContent = currentUser.name;
      if (currentUserRoleEl) currentUserRoleEl.textContent = currentUser.role || 'Executive';
      if (currentUserBadgeEl) currentUserBadgeEl.textContent = currentUser.accessLevel || 'Super Admin';
    }

    // Determine tab from URL hash
    const hash = window.location.hash.replace('#', '') || 'projects';
    switchTab(hash);
    fetchAllData();
  }

  async function performLogin(passcode, username, password) {
    if (loginErrorAlert) loginErrorAlert.classList.add('d-none');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, username, password })
      });
      const data = await res.json();

      if (data.success && data.user) {
        currentUser = data.user;
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
        showDashboard();
      } else {
        throw new Error(data.error || 'Authentication rejected');
      }
    } catch (err) {
      // Client-side fallback if server offline
      const code = (passcode || '').trim();
      if (code === 'mohalkar2026' || username === 'abhishek') {
        currentUser = {
          id: 'usr-abhishek',
          name: 'Ar. Abhishek Mohalkar',
          role: 'Principal Architect',
          accessLevel: 'Super Admin',
          email: 'abhishekmohalkar.1996@gmail.com'
        };
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
        showDashboard();
      } else if (code === 'mali2026' || username === 'shreeyash') {
        currentUser = {
          id: 'usr-shreeyash',
          name: 'Shreeyash Mali',
          role: 'Associate Architect',
          accessLevel: 'Super Admin',
          email: 'shreeyash.mali.in@gmail.com'
        };
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
        showDashboard();
      } else {
        if (loginErrorAlert) {
          loginErrorAlert.textContent = 'Invalid credentials or passcode. Please try again.';
          loginErrorAlert.classList.remove('d-none');
        }
      }
    }
  }

  function handleLogout() {
    currentUser = null;
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    showLogin();
  }

  /* ── TAB NAVIGATION ────────────────────────────── */
  function switchTab(tabName) {
    const validTabs = ['projects', 'enquiries', 'insights', 'activity', 'properties'];
    if (!validTabs.includes(tabName)) tabName = 'projects';
    currentTab = tabName;
    window.location.hash = tabName;

    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.admin-tab-pane').forEach(pane => {
      if (pane.id === `tabPane-${tabName}`) {
        pane.classList.remove('d-none');
      } else {
        pane.classList.add('d-none');
      }
    });
  }

  /* ── DATA FETCHING ─────────────────────────────── */
  async function fetchAllData() {
    await Promise.all([
      fetchProjects(),
      fetchEnquiries(),
      fetchActivity(),
      fetchSettings()
    ]);
    renderAllViews();
  }

  async function fetchProjects() {
    try {
      const res = await fetch('/api/admin/projects');
      if (res.ok) {
        const data = await res.json();
        allProjects = data.data || [];
        return;
      }
    } catch (e) {
      console.warn('Projects API fetch error:', e);
    }
  }

  async function fetchEnquiries() {
    try {
      const res = await fetch('/api/admin/enquiries');
      if (res.ok) {
        const data = await res.json();
        allEnquiries = data.data || [];
      }
    } catch (e) {
      console.warn('Enquiries API fetch error:', e);
    }

    // Merge with any client-submitted enquiries in localStorage
    try {
      const local = JSON.parse(localStorage.getItem('mohalkar_enquiries')) || [];
      if (local.length) {
        local.forEach(item => {
          if (!allEnquiries.some(e => e.email === item.email && e.name === item.name)) {
            allEnquiries.unshift({
              id: 'enq-local-' + Math.random().toString(36).substr(2, 9),
              name: item.name,
              email: item.email,
              phone: item.phone,
              location: item.location,
              type: item.type || 'residential',
              budget: item.budget || 'Not specified',
              message: item.message,
              status: 'new',
              source: 'Website Local',
              timestamp: item.Timestamp || new Date().toISOString()
            });
          }
        });
      }
    } catch (err) {}
  }

  async function fetchActivity() {
    try {
      const res = await fetch('/api/admin/activity');
      if (res.ok) {
        const data = await res.json();
        allActivity = data.data || [];
      }
    } catch (e) {
      console.warn('Activity API fetch error:', e);
    }
  }

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        studioSettings = data.data || {};
      }
    } catch (e) {
      console.warn('Settings API fetch error:', e);
    }
  }

  /* ── RENDERING ─────────────────────────────────── */
  function renderAllViews() {
    updateBadges();
    renderProjects();
    renderEnquiries();
    renderInsights();
    renderActivity();
    renderSettings();
  }

  function updateBadges() {
    const projCountEl = document.getElementById('badgeProjCount');
    if (projCountEl) projCountEl.textContent = allProjects.length;

    const newEnquiriesCount = allEnquiries.filter(e => e.status === 'new').length;
    const enqBadgeEl = document.getElementById('badgeEnqCount');
    if (enqBadgeEl) {
      enqBadgeEl.textContent = newEnquiriesCount ? `${newEnquiriesCount} New` : allEnquiries.length;
    }
  }

  /* ── 1. PROJECTS VIEW ───────────────────────────── */
  let projectFilterCategory = 'all';
  let projectSearchQuery = '';

  function renderProjects() {
    const container = document.getElementById('projectsTableBody');
    if (!container) return;

    let filtered = allProjects.filter(p => {
      const matchesCat = projectFilterCategory === 'all' || p.category === projectFilterCategory;
      const q = projectSearchQuery.toLowerCase();
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || (p.tag || '').toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });

    // Update metrics
    const totalEl = document.getElementById('metricTotalProjects');
    const pubEl = document.getElementById('metricPublishedProjects');
    const draftEl = document.getElementById('metricDraftProjects');
    if (totalEl) totalEl.textContent = allProjects.length;
    if (pubEl) pubEl.textContent = allProjects.filter(p => p.status !== 'draft').length;
    if (draftEl) draftEl.textContent = allProjects.filter(p => p.status === 'draft').length;

    if (!filtered.length) {
      container.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No projects found matching filter criteria.</td></tr>`;
      return;
    }

    container.innerHTML = filtered.map(p => {
      const isDraft = p.status === 'draft';
      return `
        <tr>
          <td class="proj-img-cell">
            <div class="d-flex align-items-center gap-3">
              <img src="${p.image}" alt="${p.title}" style="width: 60px; height: 44px; object-fit: cover; border-radius: 8px; border: 1px solid var(--admin-border);" onerror="this.src='/images/arc2.jpg';" />
              <div class="d-md-none">
                <div class="fw-semibold text-white" style="font-size: 0.98rem;">${escapeHtml(p.title)}</div>
                <div class="text-muted small">${escapeHtml(p.scope || p.label || 'Portfolio Item')}</div>
              </div>
            </div>
          </td>
          <td class="d-none d-md-table-cell">
            <div class="fw-semibold text-white">${escapeHtml(p.title)}</div>
            <div class="text-muted small">${escapeHtml(p.scope || p.label || 'Portfolio Item')}</div>
          </td>
          <td>
            <div class="d-flex align-items-center justify-content-between justify-content-md-start gap-2">
              <span class="d-md-none text-muted small">Category:</span>
              <span class="badge bg-dark border border-secondary text-capitalize px-2 py-1 text-light">${escapeHtml(p.category)}</span>
            </div>
          </td>
          <td>
            <div class="d-flex align-items-center justify-content-between justify-content-md-start gap-2">
              <span class="d-md-none text-muted small">Location:</span>
              <span class="text-light"><i class="bi bi-geo-alt me-1 text-gold"></i>${escapeHtml(p.location)}</span>
            </div>
          </td>
          <td>
            <div class="d-flex align-items-center justify-content-between justify-content-md-start gap-2">
              <span class="d-md-none text-muted small">Status:</span>
              <button class="btn btn-sm ${isDraft ? 'btn-outline-secondary' : 'btn-outline-success'} py-1 px-2 toggle-publish-btn" data-id="${p.id}" data-current="${p.status}">
                <i class="bi bi-${isDraft ? 'eye-slash' : 'check-circle-fill'} me-1"></i>${isDraft ? 'Draft' : 'Published'}
              </button>
            </div>
          </td>
          <td class="text-end">
            <button class="btn btn-sm btn-dark-subtle me-1 edit-project-btn" data-id="${p.id}" title="Edit Project">
              <i class="bi bi-pencil me-1"></i><span class="d-md-none">Edit</span>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-project-btn" data-id="${p.id}" title="Delete Project">
              <i class="bi bi-trash me-1"></i><span class="d-md-none">Delete</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners
    container.querySelectorAll('.toggle-publish-btn').forEach(btn => {
      btn.addEventListener('click', () => toggleProjectPublish(btn.dataset.id, btn.dataset.current));
    });
    container.querySelectorAll('.edit-project-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditProjectModal(btn.dataset.id));
    });
    container.querySelectorAll('.delete-project-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        promptDeleteProject(btn.dataset.id);
      });
    });
  }

  async function toggleProjectPublish(id, currentStatus) {
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, actor: currentUser?.name })
      });
      if (res.ok) {
        const item = allProjects.find(p => p.id === id);
        if (item) item.status = newStatus;
        renderProjects();
        fetchActivity();
        showToast(`Project visibility updated to ${newStatus}.`, 'success');
      }
    } catch (e) {
      console.error('Error toggling publish status:', e);
    }
  }

  function promptDeleteProject(id) {
    const p = allProjects.find(item => item.id === id);
    if (!p) return;
    itemToDelete = { type: 'project', id, title: p.title };

    const titleEl = document.getElementById('deleteConfirmTitle');
    if (titleEl) {
      titleEl.innerHTML = `Are you sure you want to delete project <strong class="text-gold">"${escapeHtml(p.title)}"</strong>?`;
    }

    const modalEl = document.getElementById('deleteConfirmModal');
    if (!deleteModalInstance && window.bootstrap) {
      deleteModalInstance = new bootstrap.Modal(modalEl);
    }
    deleteModalInstance?.show();
  }

  /* ── 2. ENQUIRIES CRM VIEW ─────────────────────── */
  let enquiryStatusFilter = 'all';
  let enquirySearchQuery = '';

  function renderEnquiries() {
    const container = document.getElementById('enquiriesTableBody');
    if (!container) return;

    let filtered = allEnquiries.filter(e => {
      const matchesStatus = enquiryStatusFilter === 'all' || e.status === enquiryStatusFilter;
      const q = enquirySearchQuery.toLowerCase();
      const matchesSearch = !q ||
        (e.name || '').toLowerCase().includes(q) ||
        (e.email || '').toLowerCase().includes(q) ||
        (e.phone || '').toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q) ||
        (e.message || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });

    // Update metric counters
    const totalEl = document.getElementById('metricTotalLeads');
    const newEl = document.getElementById('metricNewLeads');
    const inProgEl = document.getElementById('metricInProgLeads');
    const closedEl = document.getElementById('metricClosedLeads');
    if (totalEl) totalEl.textContent = allEnquiries.length;
    if (newEl) newEl.textContent = allEnquiries.filter(e => e.status === 'new').length;
    if (inProgEl) inProgEl.textContent = allEnquiries.filter(e => e.status === 'in-progress' || e.status === 'contacted').length;
    if (closedEl) closedEl.textContent = allEnquiries.filter(e => e.status === 'closed' || e.status === 'quoted').length;

    if (!filtered.length) {
      container.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No client enquiries match the filters.</td></tr>`;
      return;
    }

    container.innerHTML = filtered.map(e => {
      const dateFormatted = new Date(e.timestamp || Date.now()).toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
      const cleanPhone = (e.phone || '').replace(/[^0-9]/g, '');

      return `
        <tr>
          <td>
            <div class="d-flex justify-content-between align-items-baseline">
              <div class="fw-semibold text-white" style="font-size: 1rem;">${escapeHtml(e.name)}</div>
              <span class="badge bg-dark border border-secondary text-gold d-md-none">${escapeHtml(e.budget || 'Budget N/A')}</span>
            </div>
            <div class="text-muted small">${dateFormatted} · <span class="text-faint">${escapeHtml(e.source || 'Web')}</span></div>
          </td>
          <td>
            <div class="d-flex flex-column gap-1">
              <div><a href="mailto:${e.email}" class="text-light text-decoration-none small"><i class="bi bi-envelope me-1 text-gold"></i>${escapeHtml(e.email)}</a></div>
              <div><a href="tel:${e.phone}" class="text-light text-decoration-none small"><i class="bi bi-telephone me-1 text-gold"></i>${escapeHtml(e.phone)}</a></div>
            </div>
          </td>
          <td>
            <div class="d-flex align-items-center justify-content-between justify-content-md-start gap-2">
              <span class="d-md-none text-muted small">Scope:</span>
              <div>
                <div class="text-capitalize text-white small">${escapeHtml(e.type || 'General')}</div>
                <div class="text-gold small fw-semibold d-none d-md-block">${escapeHtml(e.budget || 'Not specified')}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="d-flex align-items-center justify-content-between justify-content-md-start gap-2">
              <span class="d-md-none text-muted small">Location:</span>
              <span class="text-light"><i class="bi bi-geo-alt me-1 text-gold"></i>${escapeHtml(e.location)}</span>
            </div>
          </td>
          <td>
            <div class="d-flex align-items-center justify-content-between justify-content-md-start gap-2">
              <span class="d-md-none text-muted small">Stage:</span>
              <select class="admin-select form-select-sm enquiry-status-select" data-id="${e.id}" style="width: 140px; font-size: 0.82rem; padding: 0.35rem 0.5rem;">
                <option value="new" ${e.status === 'new' ? 'selected' : ''}>● New</option>
                <option value="contacted" ${e.status === 'contacted' ? 'selected' : ''}>● Contacted</option>
                <option value="in-progress" ${e.status === 'in-progress' ? 'selected' : ''}>● In Progress</option>
                <option value="quoted" ${e.status === 'quoted' ? 'selected' : ''}>● Quoted</option>
                <option value="closed" ${e.status === 'closed' ? 'selected' : ''}>● Closed</option>
              </select>
            </div>
          </td>
          <td>
            <div class="p-2 rounded bg-dark border border-secondary-subtle small text-light text-truncate" style="max-width: 260px;" title="${escapeHtml(e.message)}">
              ${escapeHtml(e.message)}
            </div>
          </td>
          <td class="text-end">
            <div class="d-flex justify-content-end gap-1">
              <a href="https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(e.name)},%20this%20is%20Mohalkar%20Architects%20regarding%20your%20project%20enquiry." target="_blank" class="btn btn-sm btn-outline-success px-2 py-1" title="WhatsApp Chat">
                <i class="bi bi-whatsapp"></i><span class="d-md-none ms-1">WhatsApp</span>
              </a>
              <button class="btn btn-sm btn-dark-subtle px-2 py-1 view-enquiry-btn" data-id="${e.id}" title="View Details">
                <i class="bi bi-eye"></i><span class="d-md-none ms-1">Dossier</span>
              </button>
              <button class="btn btn-sm btn-outline-danger px-2 py-1 delete-enquiry-btn" data-id="${e.id}" title="Delete Lead">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    container.querySelectorAll('.enquiry-status-select').forEach(sel => {
      sel.addEventListener('change', () => updateEnquiryStatus(sel.dataset.id, sel.value));
    });
    container.querySelectorAll('.view-enquiry-btn').forEach(btn => {
      btn.addEventListener('click', () => openEnquiryDetailsModal(btn.dataset.id));
    });
    container.querySelectorAll('.delete-enquiry-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        promptDeleteEnquiry(btn.dataset.id);
      });
    });
  }

  function showToast(message, type = 'success') {
    const toastEl = document.getElementById('adminToast');
    const toastMsg = document.getElementById('adminToastMsg');
    const toastIcon = document.getElementById('adminToastIcon');
    if (!toastEl || !toastMsg) return;

    toastMsg.textContent = message;
    if (toastIcon) {
      toastIcon.className = type === 'danger'
        ? 'bi bi-trash-fill text-danger fs-5'
        : type === 'warning'
        ? 'bi bi-exclamation-circle-fill text-warning fs-5'
        : 'bi bi-check-circle-fill text-gold fs-5';
    }

    if (!toastInstance && window.bootstrap) {
      toastInstance = new bootstrap.Toast(toastEl, { delay: 3500 });
    }
    toastInstance?.show();
  }

  function promptDeleteEnquiry(id) {
    const e = allEnquiries.find(item => item.id === id);
    if (!e) return;
    itemToDelete = { type: 'enquiry', id, title: e.name };

    const titleEl = document.getElementById('deleteConfirmTitle');
    if (titleEl) {
      titleEl.innerHTML = `Are you sure you want to delete lead from <strong class="text-gold">"${escapeHtml(e.name)}"</strong>?`;
    }

    const modalEl = document.getElementById('deleteConfirmModal');
    if (!deleteModalInstance && window.bootstrap) {
      deleteModalInstance = new bootstrap.Modal(modalEl);
    }
    deleteModalInstance?.show();
  }

  async function executeDelete() {
    if (!itemToDelete) return;
    const { type, id, title } = itemToDelete;
    deleteModalInstance?.hide();

    if (type === 'project') {
      try {
        await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      } catch (err) {}
      allProjects = allProjects.filter(item => item.id !== id);
      renderProjects();
      updateBadges();
      fetchActivity();
      showToast(`Project "${title}" deleted successfully.`, 'danger');
    } else if (type === 'enquiry') {
      try {
        await fetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' });
      } catch (err) {}

      // Clean from localStorage as well
      try {
        const local = JSON.parse(localStorage.getItem('mohalkar_enquiries')) || [];
        const target = allEnquiries.find(e => e.id === id);
        const filtered = local.filter(item => item.id !== id && (!target || (item.email !== target.email && item.name !== target.name)));
        localStorage.setItem('mohalkar_enquiries', JSON.stringify(filtered));
      } catch (e) {}

      allEnquiries = allEnquiries.filter(item => item.id !== id);
      renderEnquiries();
      updateBadges();
      fetchActivity();
      showToast(`Lead from "${title}" deleted.`, 'danger');
    }

    itemToDelete = null;
  }

  async function updateEnquiryStatus(id, newStatus) {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, actor: currentUser?.name })
      });
      if (res.ok) {
        const item = allEnquiries.find(e => e.id === id);
        if (item) item.status = newStatus;
        updateBadges();
        fetchActivity();
        showToast(`Lead stage updated to ${newStatus.toUpperCase()}.`, 'success');
      }
    } catch (e) {
      console.error('Error updating enquiry status:', e);
    }
  }

  function exportEnquiriesToExcel() {
    if (typeof XLSX === 'undefined') {
      showToast('SheetJS library is loading. Please try again.', 'warning');
      return;
    }
    if (!allEnquiries.length) {
      showToast('No client enquiries available to export.', 'warning');
      return;
    }

    const rows = allEnquiries.map((e, idx) => ({
      'Sr. No': idx + 1,
      'Date': new Date(e.timestamp || Date.now()).toLocaleString(),
      'Status': (e.status || 'new').toUpperCase(),
      'Client Name': e.name,
      'Email': e.email,
      'Phone': e.phone,
      'Location': e.location,
      'Project Type': e.type,
      'Estimated Budget': e.budget || 'Not specified',
      'Source': e.source || 'Website',
      'Project Details': e.message,
      'Internal Notes': e.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Client CRM Leads');
    XLSX.writeFile(workbook, `Mohalkar-Studio-CRM-Leads-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  /* ── 3. INSIGHTS & TELEMETRY VIEW ──────────────── */
  function renderInsights() {
    // Categories breakdown
    const catCounts = {};
    allProjects.forEach(p => {
      catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    });

    const catContainer = document.getElementById('insightsCategoryBars');
    if (catContainer) {
      const entries = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
      const max = Math.max(...Object.values(catCounts), 1);
      catContainer.innerHTML = entries.map(([cat, count]) => {
        const pct = Math.round((count / max) * 100);
        return `
          <div class="mb-3">
            <div class="d-flex justify-content-between text-muted small mb-1">
              <span class="text-capitalize text-light">${cat}</span>
              <span class="text-gold fw-semibold">${count} projects</span>
            </div>
            <div class="progress" style="height: 6px; background: var(--admin-surface-2);">
              <div class="progress-bar" style="width: ${pct}%; background: var(--admin-gold);"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Lead types breakdown
    const typeCounts = {};
    allEnquiries.forEach(e => {
      const t = e.type || 'Other';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    const typeContainer = document.getElementById('insightsLeadTypeBars');
    if (typeContainer) {
      const entries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
      const total = allEnquiries.length || 1;
      typeContainer.innerHTML = entries.map(([type, count]) => {
        const pct = Math.round((count / total) * 100);
        return `
          <div class="mb-3">
            <div class="d-flex justify-content-between text-muted small mb-1">
              <span class="text-capitalize text-light">${type}</span>
              <span class="text-gold fw-semibold">${count} (${pct}%)</span>
            </div>
            <div class="progress" style="height: 6px; background: var(--admin-surface-2);">
              <div class="progress-bar bg-info" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Cities
    const cityCounts = {};
    allEnquiries.forEach(e => {
      const loc = (e.location || 'Maharashtra').split(',')[0].trim();
      cityCounts[loc] = (cityCounts[loc] || 0) + 1;
    });
    const citiesContainer = document.getElementById('insightsCitiesList');
    if (citiesContainer) {
      citiesContainer.innerHTML = Object.entries(cityCounts).map(([city, count]) => `
        <span class="badge bg-dark border border-secondary text-light px-3 py-2 me-2 mb-2" style="font-size:0.85rem;">
          <i class="bi bi-geo-alt me-1 text-gold"></i>${city} <strong class="text-gold ms-1">(${count})</strong>
        </span>
      `).join('');
    }
  }

  /* ── 4. AUDIT ACTIVITY LOG ─────────────────────── */
  function renderActivity() {
    const container = document.getElementById('activityTimeline');
    if (!container) return;

    if (!allActivity.length) {
      container.innerHTML = `<p class="text-muted">No recent activity recorded.</p>`;
      return;
    }

    container.innerHTML = allActivity.map(act => {
      const dateFormatted = new Date(act.timestamp || Date.now()).toLocaleString('en-IN', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      return `
        <div class="timeline-item">
          <div class="timeline-dot ${act.badge || 'gold'}"></div>
          <div class="d-flex justify-content-between align-items-baseline">
            <h6 class="text-white mb-1 font-sans" style="font-size: 0.95rem;">${escapeHtml(act.action)}</h6>
            <span class="text-muted small">${dateFormatted}</span>
          </div>
          <p class="text-muted small mb-1">${escapeHtml(act.details)}</p>
          <div class="text-faint small"><i class="bi bi-person me-1"></i>${escapeHtml(act.user || 'Admin')}</div>
        </div>
      `;
    }).join('');
  }

  /* ── 5. SETTINGS & TEAM MANAGEMENT ─────────────── */
  function renderSettings() {
    const usersContainer = document.getElementById('settingsUsersList');
    if (!usersContainer) return;

    const users = studioSettings.users || [];
    usersContainer.innerHTML = users.map(u => `
      <div class="d-flex justify-content-between align-items-center p-3 mb-2 rounded border border-secondary bg-dark">
        <div class="d-flex align-items-center gap-3">
          <div class="user-chip text-gold"><i class="bi bi-shield-check"></i></div>
          <div>
            <div class="text-white fw-semibold">${escapeHtml(u.name)}</div>
            <div class="text-muted small">${escapeHtml(u.role)} · <span class="badge bg-secondary">${escapeHtml(u.accessLevel)}</span></div>
            <div class="text-muted small">${escapeHtml(u.email)} ${u.phone ? '· ' + escapeHtml(u.phone) : ''}</div>
          </div>
        </div>
        <div>
          <span class="badge bg-success">Active</span>
        </div>
      </div>
    `).join('');
  }

  /* ── MODALS & FORMS ────────────────────────────── */
  let projectModalInstance = null;
  let enquiryModalInstance = null;

  function openEditProjectModal(id) {
    const modalEl = document.getElementById('projectModal');
    if (!modalEl) return;

    const form = document.getElementById('projectForm');
    form.reset();

    if (id) {
      const p = allProjects.find(item => item.id === id);
      if (p) {
        document.getElementById('projId').value = p.id;
        document.getElementById('projTitle').value = p.title;
        document.getElementById('projCategory').value = p.category;
        document.getElementById('projLocation').value = p.location;
        document.getElementById('projImage').value = p.image;
        document.getElementById('projScope').value = p.scope || '';
        document.getElementById('projStatus').value = p.status || 'published';
        document.getElementById('projectModalTitle').textContent = 'Edit Project';
      }
    } else {
      document.getElementById('projId').value = '';
      document.getElementById('projectModalTitle').textContent = 'Add New Project';
    }

    if (!projectModalInstance && window.bootstrap) {
      projectModalInstance = new bootstrap.Modal(modalEl);
    }
    projectModalInstance?.show();
  }

  function openEnquiryDetailsModal(id) {
    const e = allEnquiries.find(item => item.id === id);
    if (!e) return;

    document.getElementById('modalEnqName').textContent = e.name;
    document.getElementById('modalEnqEmail').textContent = e.email;
    document.getElementById('modalEnqPhone').textContent = e.phone;
    document.getElementById('modalEnqLocation').textContent = e.location;
    document.getElementById('modalEnqType').textContent = e.type || 'Residential';
    document.getElementById('modalEnqBudget').textContent = e.budget || 'Not specified';
    document.getElementById('modalEnqMessage').textContent = e.message;
    document.getElementById('modalEnqDate').textContent = new Date(e.timestamp || Date.now()).toLocaleString();
    document.getElementById('modalEnqStatus').value = e.status || 'new';
    document.getElementById('modalEnqNotes').value = e.notes || '';
    document.getElementById('modalEnqId').value = e.id;

    const cleanPhone = (e.phone || '').replace(/[^0-9]/g, '');
    const waBtn = document.getElementById('modalEnqWhatsAppBtn');
    if (waBtn) {
      waBtn.href = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(e.name)},%20this%20is%20Mohalkar%20Architects%20regarding%20your%20project%20enquiry.`;
    }

    const mailBtn = document.getElementById('modalEnqMailBtn');
    if (mailBtn) {
      mailBtn.href = `mailto:${e.email}?subject=${encodeURIComponent('Mohalkar Architects – Response to your Project Enquiry')}`;
    }

    const modalEl = document.getElementById('enquiryModal');
    if (!enquiryModalInstance && window.bootstrap) {
      enquiryModalInstance = new bootstrap.Modal(modalEl);
    }
    enquiryModalInstance?.show();
  }

  /* ── EVENT LISTENERS ───────────────────────────── */
  function setupEventListeners() {
    // Login form submission
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const passcode = document.getElementById('loginPasscode').value;
        performLogin(passcode);
      });
    }

    // Logout
    if (btnLogout) {
      btnLogout.addEventListener('click', handleLogout);
    }

    // Tab buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(btn.dataset.tab);
      });
    });

    // Project filters & search
    document.querySelectorAll('.proj-cat-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.proj-cat-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        projectFilterCategory = btn.dataset.cat;
        renderProjects();
      });
    });

    const projSearchInput = document.getElementById('projSearchInput');
    if (projSearchInput) {
      projSearchInput.addEventListener('input', (e) => {
        projectSearchQuery = e.target.value;
        renderProjects();
      });
    }

    const btnNewProject = document.getElementById('btnNewProject');
    if (btnNewProject) {
      btnNewProject.addEventListener('click', () => openEditProjectModal(null));
    }

    // Project Form Save
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
      projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('projId').value;
        const projectData = {
          id: id || undefined,
          title: document.getElementById('projTitle').value,
          category: document.getElementById('projCategory').value,
          location: document.getElementById('projLocation').value,
          image: document.getElementById('projImage').value,
          scope: document.getElementById('projScope').value,
          status: document.getElementById('projStatus').value,
          actor: currentUser?.name
        };

        try {
          const res = await fetch('/api/admin/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
          });
          if (res.ok) {
            projectModalInstance?.hide();
            await fetchProjects();
            renderProjects();
            fetchActivity();
          }
        } catch (err) {
          console.error('Error saving project:', err);
        }
      });
    }

    // Enquiry search & filters
    const enqSearchInput = document.getElementById('enqSearchInput');
    if (enqSearchInput) {
      enqSearchInput.addEventListener('input', (e) => {
        enquirySearchQuery = e.target.value;
        renderEnquiries();
      });
    }

    const enqStatusFilterSelect = document.getElementById('enqStatusFilterSelect');
    if (enqStatusFilterSelect) {
      enqStatusFilterSelect.addEventListener('change', (e) => {
        enquiryStatusFilter = e.target.value;
        renderEnquiries();
      });
    }

    const btnExportExcel = document.getElementById('btnExportExcel');
    if (btnExportExcel) {
      btnExportExcel.addEventListener('click', exportEnquiriesToExcel);
    }

    // Enquiry Details Modal Save Notes
    const btnSaveEnquiryNotes = document.getElementById('btnSaveEnquiryNotes');
    if (btnSaveEnquiryNotes) {
      btnSaveEnquiryNotes.addEventListener('click', async () => {
        const id = document.getElementById('modalEnqId').value;
        const status = document.getElementById('modalEnqStatus').value;
        const notes = document.getElementById('modalEnqNotes').value;

        try {
          const res = await fetch(`/api/admin/enquiries/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, notes, actor: currentUser?.name })
          });
          if (res.ok) {
            enquiryModalInstance?.hide();
            const item = allEnquiries.find(e => e.id === id);
            if (item) {
              item.status = status;
              item.notes = notes;
            }
            renderEnquiries();
            updateBadges();
            fetchActivity();
          }
        } catch (err) {
          console.error('Error updating enquiry notes:', err);
        }
      });
    }

    // Confirm Delete Execution
    const btnExecuteDelete = document.getElementById('btnExecuteDelete');
    if (btnExecuteDelete) {
      btnExecuteDelete.addEventListener('click', executeDelete);
    }

    // Download JSON Backup
    const btnDownloadBackup = document.getElementById('btnDownloadBackup');
    if (btnDownloadBackup) {
      btnDownloadBackup.addEventListener('click', () => {
        const fullBackup = {
          exportDate: new Date().toISOString(),
          firm: 'Mohalkar Architects & Planners',
          projects: allProjects,
          enquiries: allEnquiries,
          activity: allActivity,
          settings: studioSettings
        };
        const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mohalkar-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Studio data backup downloaded successfully.', 'success');
      });
    }

    // Change Master Passcode
    const passcodeForm = document.getElementById('passcodeForm');
    if (passcodeForm) {
      passcodeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newCode = document.getElementById('newPasscode').value.trim();
        if (!newCode) return;

        try {
          const res = await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ masterPasscode: newCode, actor: currentUser?.name })
          });
          if (res.ok) {
            showToast('Master security passcode updated successfully!', 'success');
            document.getElementById('newPasscode').value = '';
            fetchActivity();
          }
        } catch (err) {
          console.error('Error updating passcode:', err);
        }
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
