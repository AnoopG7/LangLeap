/**
 * LangLeap Documentation & Presentation Portal — JavaScript Controller
 * Features: Top Navbar ScrollSpy, Slide Presentation Mode,
 * Fullscreen Diagram Modal with Zoom, Pan & Open in New Tab, and SQL Copy.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.doc-section');
  const searchInput = document.getElementById('globalSearch');
  const btnPresentation = document.getElementById('btnPresentation');
  const btnPrevSlide = document.getElementById('btnPrevSlide');
  const btnNextSlide = document.getElementById('btnNextSlide');
  const btnExitPresentation = document.getElementById('btnExitPresentation');
  const slideCounter = document.getElementById('slideCounter');
  const btnCopySQL = document.getElementById('btnCopySQL');

  // Modal elements
  const diagramModal = document.getElementById('diagramModal');
  const modalTitle = document.getElementById('modalDiagramTitle');
  const modalSvgContainer = document.getElementById('modalSvgContainer');
  const modalBody = document.getElementById('diagramModalBody') || document.querySelector('.diagram-modal-body');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnZoomReset = document.getElementById('btnZoomReset');
  const btnOpenNewTab = document.getElementById('btnOpenNewTab');
  const btnPanLeft = document.getElementById('btnPanLeft');
  const btnPanRight = document.getElementById('btnPanRight');
  const btnPanUp = document.getElementById('btnPanUp');
  const btnPanDown = document.getElementById('btnPanDown');
  const zoomLevelDisplay = document.getElementById('zoomLevelDisplay');

  let currentSlideIndex = 0;
  let currentZoom = 1.0;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let currentSvgDataUrl = '';

  // Initialize Mermaid with clean neutral light theme
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
      themeVariables: {
        darkMode: false,
        background: '#ffffff',
        primaryColor: '#f5f3ec',
        primaryTextColor: '#1e201b',
        primaryBorderColor: '#cbcaa8',
        lineColor: '#53554e',
        secondaryColor: '#fcfbf8',
        tertiaryColor: '#edebe4'
      }
    });
  }

  // Navbar Click Smooth Scroll
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').replace('#', '');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL hash without jump
        history.pushState(null, null, `#${targetId}`);
        updateActiveNav(link);
      }
    });
  });

  function updateActiveNav(activeLink) {
    navLinks.forEach(l => l.classList.remove('active'));
    activeLink.classList.add('active');
  }

  // ScrollSpy: Highlight active navbar item as user scrolls
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        const matchingLink = document.querySelector(`.nav-link[href="#${id}"]`);
        if (matchingLink) {
          updateActiveNav(matchingLink);
        }
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));

  // ==========================================================================
  // Diagram Modal & Interactive Zoom / Pan / Open Image in Tab
  // ==========================================================================
  function setupDiagramActions() {
    const diagramCanvases = document.querySelectorAll('.diagram-canvas');
    diagramCanvases.forEach((canvas, index) => {
      const caption = canvas.querySelector('.diagram-caption');
      const mermaidDiv = canvas.querySelector('.mermaid');
      if (!caption || !mermaidDiv) return;

      // Extract title
      const titleSpan = caption.querySelector('span:first-child');
      const diagramTitle = titleSpan ? titleSpan.innerText : `Diagram ${index + 1}`;

      // Create Actions container if not exists
      let actions = caption.querySelector('.diagram-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'diagram-actions';

        const btnZoom = document.createElement('button');
        btnZoom.className = 'btn-diagram-zoom';
        btnZoom.innerHTML = '🔍 Zoom / Open as Image';
        btnZoom.title = 'Open full-screen interactive zoom viewer';
        btnZoom.addEventListener('click', () => openDiagramModal(mermaidDiv, diagramTitle));

        actions.appendChild(btnZoom);
        caption.appendChild(actions);
      }
    });
  }

  // Run diagram setup after initial Mermaid render
  setTimeout(setupDiagramActions, 600);

  function updateTransform() {
    modalSvgContainer.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
    if (zoomLevelDisplay) {
      zoomLevelDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
    }
  }

  function panBy(dx, dy) {
    panX += dx;
    panY += dy;
    updateTransform();
  }

  function resetView() {
    currentZoom = 1.0;
    panX = 0;
    panY = 0;
    updateTransform();
  }

  function openDiagramModal(mermaidDiv, title) {
    const svg = mermaidDiv.querySelector('svg');
    if (!svg) {
      alert('Diagram is still rendering. Please wait a second and try again.');
      return;
    }

    modalTitle.innerText = title;
    modalSvgContainer.innerHTML = '';
    resetView();

    // Clone SVG into modal
    const clonedSvg = svg.cloneNode(true);
    clonedSvg.style.maxWidth = 'none';
    clonedSvg.style.height = 'auto';
    clonedSvg.style.minWidth = '680px';
    modalSvgContainer.appendChild(clonedSvg);

    // Prepare Data URL for Open in New Tab
    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    currentSvgDataUrl = URL.createObjectURL(svgBlob);

    diagramModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDiagramModal() {
    diagramModal.classList.remove('open');
    document.body.style.overflow = '';
    isPanning = false;
    if (currentSvgDataUrl) {
      URL.revokeObjectURL(currentSvgDataUrl);
      currentSvgDataUrl = '';
    }
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeDiagramModal);
  if (diagramModal) {
    diagramModal.addEventListener('click', (e) => {
      if (e.target === diagramModal) closeDiagramModal();
    });
  }

  // Pan Direction Buttons
  if (btnPanLeft) btnPanLeft.addEventListener('click', () => panBy(120, 0));
  if (btnPanRight) btnPanRight.addEventListener('click', () => panBy(-120, 0));
  if (btnPanUp) btnPanUp.addEventListener('click', () => panBy(0, 120));
  if (btnPanDown) btnPanDown.addEventListener('click', () => panBy(0, -120));

  // Zoom Button Controls
  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      if (currentZoom < 4.5) {
        currentZoom = parseFloat((currentZoom + 0.25).toFixed(2));
        updateTransform();
      }
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      if (currentZoom > 0.3) {
        currentZoom = parseFloat((currentZoom - 0.25).toFixed(2));
        updateTransform();
      }
    });
  }

  if (btnZoomReset) {
    btnZoomReset.addEventListener('click', resetView);
  }

  if (btnOpenNewTab) {
    btnOpenNewTab.addEventListener('click', () => {
      if (currentSvgDataUrl) {
        window.open(currentSvgDataUrl, '_blank');
      }
    });
  }

  // Full 2D Mouse Drag Panning
  if (modalBody) {
    modalBody.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Only primary mouse button
      isPanning = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
      modalBody.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        if (modalBody) modalBody.style.cursor = 'grab';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      panX = Math.round(e.clientX - startX);
      panY = Math.round(e.clientY - startY);
      updateTransform();
    });

    // Mouse wheel zoom
    modalBody.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
      const nextZoom = Math.min(Math.max(0.3, currentZoom + zoomFactor), 4.5);
      currentZoom = parseFloat(nextZoom.toFixed(2));
      updateTransform();
    }, { passive: false });

    // Double-click toggle (100% <-> 175%)
    modalBody.addEventListener('dblclick', () => {
      if (currentZoom === 1.0 && panX === 0 && panY === 0) {
        currentZoom = 1.75;
      } else {
        resetView();
      }
      updateTransform();
    });

    // Touch support (trackpads / touchscreens)
    let touchStartX = 0;
    let touchStartY = 0;

    modalBody.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isPanning = true;
        touchStartX = e.touches[0].clientX - panX;
        touchStartY = e.touches[0].clientY - panY;
      }
    }, { passive: true });

    modalBody.addEventListener('touchmove', (e) => {
      if (!isPanning || e.touches.length !== 1) return;
      panX = Math.round(e.touches[0].clientX - touchStartX);
      panY = Math.round(e.touches[0].clientY - touchStartY);
      updateTransform();
    }, { passive: true });

    modalBody.addEventListener('touchend', () => {
      isPanning = false;
    });
  }

  // ==========================================================================
  // Presentation Deck Controller
  // ==========================================================================
  const sectionIds = Array.from(sections).map(s => s.id);

  function togglePresentationMode(enable) {
    if (enable) {
      document.body.classList.add('presentation-mode');
      currentSlideIndex = 0;
      goToSlide(0);
    } else {
      document.body.classList.remove('presentation-mode');
    }
  }

  function goToSlide(index) {
    if (index >= 0 && index < sections.length) {
      currentSlideIndex = index;
      const targetSec = sections[currentSlideIndex];
      targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (slideCounter) {
        slideCounter.textContent = `Section ${currentSlideIndex + 1} of ${sections.length}`;
      }
    }
  }

  if (btnPresentation) {
    btnPresentation.addEventListener('click', () => {
      const isMode = document.body.classList.contains('presentation-mode');
      togglePresentationMode(!isMode);
    });
  }

  if (btnExitPresentation) {
    btnExitPresentation.addEventListener('click', () => {
      togglePresentationMode(false);
    });
  }

  if (btnNextSlide) {
    btnNextSlide.addEventListener('click', () => {
      if (currentSlideIndex < sections.length - 1) {
        goToSlide(currentSlideIndex + 1);
      }
    });
  }

  if (btnPrevSlide) {
    btnPrevSlide.addEventListener('click', () => {
      if (currentSlideIndex > 0) {
        goToSlide(currentSlideIndex - 1);
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (diagramModal && diagramModal.classList.contains('open')) {
      if (e.key === 'Escape') {
        closeDiagramModal();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        panBy(0, 80);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        panBy(0, -80);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        panBy(80, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        panBy(-80, 0);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        if (currentZoom < 4.5) {
          currentZoom = parseFloat((currentZoom + 0.25).toFixed(2));
          updateTransform();
        }
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        if (currentZoom > 0.3) {
          currentZoom = parseFloat((currentZoom - 0.25).toFixed(2));
          updateTransform();
        }
      } else if (e.key === '0' || e.key.toLowerCase() === 'r') {
        e.preventDefault();
        resetView();
      }
      return;
    }

    if (document.body.classList.contains('presentation-mode')) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        if (currentSlideIndex < sections.length - 1) goToSlide(currentSlideIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentSlideIndex > 0) goToSlide(currentSlideIndex - 1);
      } else if (e.key === 'Escape') {
        togglePresentationMode(false);
      }
    }
  });

  // Global Search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const allRows = document.querySelectorAll('tbody tr, .column-item');
      if (!query) {
        allRows.forEach(el => el.style.opacity = '1');
        return;
      }
      allRows.forEach(row => {
        const text = row.innerText.toLowerCase();
        if (text.includes(query)) {
          row.style.opacity = '1';
          row.style.backgroundColor = 'rgba(3, 105, 161, 0.08)';
        } else {
          row.style.opacity = '0.3';
          row.style.backgroundColor = '';
        }
      });
    });
  }

  // Interactive 5x5 Matrix Click
  const matrixCells = document.querySelectorAll('.matrix-cell[data-risk-id]');
  matrixCells.forEach(cell => {
    cell.addEventListener('click', () => {
      const riskId = cell.getAttribute('data-risk-id');
      const targetRow = document.getElementById(`row-${riskId}`);
      if (targetRow) {
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetRow.style.transition = 'all 0.5s ease';
        targetRow.style.backgroundColor = 'rgba(194, 65, 12, 0.15)';
        setTimeout(() => {
          targetRow.style.backgroundColor = '';
        }, 2000);
      }
    });
  });

  // Copy SQL Button
  if (btnCopySQL) {
    btnCopySQL.addEventListener('click', () => {
      const sqlCode = document.getElementById('sqlDdlCode').innerText;
      navigator.clipboard.writeText(sqlCode).then(() => {
        const orig = btnCopySQL.innerText;
        btnCopySQL.innerText = 'Copied!';
        setTimeout(() => {
          btnCopySQL.innerText = orig;
        }, 2000);
      });
    });
  }
});
