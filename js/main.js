// ============================================================
//  RENDERER — you shouldn't need to edit this file.
//  All content lives in js/content.js.
// ============================================================

(function () {
  'use strict';

  var ASSETS = 'assets/';
  var VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?|$)/i;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function asset(p) {
    if (!p) return '';
    return /^(https?:)?\/\//.test(p) ? p : ASSETS + p;
  }

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function $(sel) { return document.querySelector(sel); }

  // `const` at the top level of a classic script is script-scoped, not a
  // window property, so reach for the binding directly behind a typeof guard.
  function allProjects() {
    return (typeof projects !== 'undefined' && Array.isArray(projects)) ? projects : [];
  }

  // ---------------------------------------------------------
  //  SITE
  // ---------------------------------------------------------
  function applySite() {
    var hasProjects = allProjects().length > 0;

    document.title = SITE.name + (SITE.major ? ' — ' + SITE.major + ' Portfolio' : '');

    // Simple text bindings: <element data-site="key">
    document.querySelectorAll('[data-site]').forEach(function (node) {
      var key = node.getAttribute('data-site');
      if (SITE[key]) node.textContent = SITE[key];
    });

    var intro = $('#hero-intro');
    if (intro) intro.textContent = hasProjects ? SITE.intro : SITE.introEmpty;

    // Portraits. The frame renders a monogram underneath; if the photo is
    // missing the inline onerror removes the <img> and the monogram shows.
    var mono = initials(SITE.name);
    document.querySelectorAll('.portrait-frame').forEach(function (frame) {
      if (mono) frame.setAttribute('data-monogram', mono);
      var img = frame.querySelector('img');
      if (!img) return;
      if (SITE.portrait) {
        img.alt = 'Portrait of ' + SITE.name;
        img.src = SITE.portrait;
      } else {
        img.remove();
      }
    });

    var about = $('#about-text');
    if (about) about.textContent = SITE.about || '';

    var facts = $('#about-facts');
    if (facts && Array.isArray(SITE.facts)) {
      facts.innerHTML = SITE.facts.map(function (f) {
        return '<li><strong>' + esc(f.label) + ':</strong> ' + esc(f.value) + '</li>';
      }).join('');
    }

    var footer = $('#footer-text');
    if (footer) footer.textContent = '© ' + new Date().getFullYear() + ' ' + SITE.name;

    applyLinkedIn();
  }

  // Rendered only when SITE.linkedin is filled in — never a dead link.
  function applyLinkedIn() {
    var url = (SITE.linkedin || '').trim();
    if (!url) return;

    var nav = $('#nav-links');
    if (nav) {
      var a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'LinkedIn';
      nav.appendChild(a);
    }

    var box = $('#about-buttons');
    if (box) {
      var b = document.createElement('a');
      b.href = url;
      b.target = '_blank';
      b.rel = 'noopener noreferrer';
      b.className = 'btn btn-outline';
      b.textContent = 'LinkedIn';
      box.appendChild(b);
    }

    // Keep structured data in step with what's actually on the page.
    var ld = $('#ld-person');
    if (ld) {
      try {
        var data = JSON.parse(ld.textContent);
        data.sameAs = [url];
        ld.textContent = JSON.stringify(data, null, 2);
      } catch (e) { /* malformed JSON-LD shouldn't break the page */ }
    }
  }

  // ---------------------------------------------------------
  //  PROJECTS
  // ---------------------------------------------------------
  function mediaList(p) {
    var out = [];
    (p.videos || []).forEach(function (v) { out.push({ type: 'video', src: asset(v) }); });
    (p.images || []).forEach(function (i) { out.push({ type: 'image', src: asset(i) }); });
    return out;
  }

  function renderEmptyState(carousel) {
    carousel.innerHTML =
      '<div class="carousel-empty">' +
        '<strong>In progress</strong>' +
        '<p>Projects are being built right now. The first write-ups land here soon.</p>' +
      '</div>';
  }

  function renderCard(p) {
    var card = document.createElement('div');
    card.className = 'carousel-card';

    var media = mediaList(p);
    var cover;
    if (media.length && media[0].type === 'image') {
      cover = '<img class="carousel-img" src="' + esc(media[0].src) + '" alt="' + esc(p.name) + '" loading="lazy" />';
    } else if (media.length) {
      cover = '<video class="carousel-img" src="' + esc(media[0].src) + '" muted playsinline preload="metadata"></video>';
    } else {
      cover = '<div class="carousel-img carousel-img-fallback">No media yet</div>';
    }

    card.innerHTML = cover +
      '<div class="carousel-info">' +
        '<h3>' + esc(p.name) + '</h3>' +
        (p.tagline ? '<p>' + esc(p.tagline) + '</p>' : '') +
      '</div>';

    card.addEventListener('click', function () {
      var target = document.getElementById('project-' + p.id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return card;
  }

  function renderMedia(p) {
    var media = mediaList(p);
    if (!media.length) return '';

    var first = media[0];
    return '<div class="media-carousel" data-project="' + esc(p.id) + '">' +
        '<div class="media-viewer">' + mediaTag(first, p.name) + '</div>' +
        (media.length > 1
          ? '<button class="media-nav media-nav-prev" aria-label="Previous">&#8249;</button>' +
            '<button class="media-nav media-nav-next" aria-label="Next">&#8250;</button>' +
            '<div class="media-counter">1 / ' + media.length + '</div>'
          : '') +
      '</div>';
  }

  function mediaTag(item, name) {
    return item.type === 'video'
      ? '<video src="' + esc(item.src) + '" controls muted playsinline preload="metadata"></video>'
      : '<img src="' + esc(item.src) + '" alt="' + esc(name) + '" loading="lazy" />';
  }

  function renderTimeline(p) {
    var t = p.timeline || [];
    if (!t.length) return '';

    var items = t.map(function (step, i) {
      return '<div class="timeline-item">' +
          '<img src="' + esc(asset(step.src)) + '" alt="' + esc(step.label || '') + '" loading="lazy" />' +
          '<div class="timeline-step">' + String(i + 1).padStart(2, '0') + '</div>' +
          '<div class="timeline-label">' + esc(step.label || '') + '</div>' +
        '</div>';
    }).join('');

    return '<div class="timeline-section">' +
        '<button class="timeline-toggle" type="button">' +
          'Show Build Timeline <span class="timeline-chevron">&#9662;</span>' +
        '</button>' +
        '<div class="timeline-photos"><div class="timeline-track">' + items + '</div></div>' +
      '</div>';
  }

  function renderDetail(p) {
    var section = document.createElement('section');
    section.className = 'project-detail';
    section.id = 'project-' + p.id;

    var skills = (p.skills || []).map(function (s) {
      return '<span class="skill-badge">' + esc(s) + '</span>';
    }).join('');

    var files = (p.files || []).map(function (f) {
      return '<a href="' + esc(f.url) + '" target="_blank" rel="noopener noreferrer">' + esc(f.name) + '</a>';
    }).join('');

    section.innerHTML =
      '<h2 class="project-title">' + esc(p.name) + '</h2>' +
      (p.tagline ? '<p class="project-meta">' + esc(p.tagline) + '</p>' : '<div style="height:1rem"></div>') +
      '<div class="project-layout">' +
        '<div class="project-text">' +
          (p.description ? '<p>' + p.description + '</p>' : '') +
          (skills ? '<div class="skills-header">Skills</div><div class="skills-grid">' + skills + '</div>' : '') +
          (files ? '<div class="file-links">' + files + '</div>' : '') +
        '</div>' +
        '<div>' + renderMedia(p) + renderTimeline(p) + '</div>' +
      '</div>';

    wireMedia(section, p);
    wireTimeline(section);
    return section;
  }

  function wireMedia(section, p) {
    var media = mediaList(p);
    if (media.length < 2) return;

    var viewer  = section.querySelector('.media-viewer');
    var counter = section.querySelector('.media-counter');
    var idx = 0;

    function show(next) {
      idx = (next + media.length) % media.length;
      viewer.innerHTML = mediaTag(media[idx], p.name);
      if (counter) counter.textContent = (idx + 1) + ' / ' + media.length;
    }

    section.querySelector('.media-nav-prev').addEventListener('click', function () { show(idx - 1); });
    section.querySelector('.media-nav-next').addEventListener('click', function () { show(idx + 1); });
  }

  function wireTimeline(section) {
    var btn = section.querySelector('.timeline-toggle');
    if (!btn) return;
    var panel = section.querySelector('.timeline-photos');

    btn.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      btn.classList.toggle('is-open', open);
      btn.innerHTML = (open ? 'Hide Build Timeline' : 'Show Build Timeline') +
        ' <span class="timeline-chevron">&#9662;</span>';
    });
  }

  function renderProjects() {
    var carousel = $('#carousel');
    var details  = $('#project-details');
    var cta      = $('#hero-cta');
    var list     = allProjects();

    if (!list.length) {
      if (carousel) renderEmptyState(carousel);
      return;
    }

    if (cta) cta.hidden = false;

    list.forEach(function (p) {
      if (!p || !p.id || !p.name) return;
      if (carousel) carousel.appendChild(renderCard(p));
      if (details)  details.appendChild(renderDetail(p));
    });
  }

  // ---------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    applySite();
    renderProjects();
  });
})();
