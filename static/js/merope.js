document.addEventListener("DOMContentLoaded", () => {
  const tocShell = document.querySelector(".merope-toc-shell");
  const toc = document.querySelector(".merope-toc");
  const tocToggle = document.querySelector(".merope-toc-toggle");
  const tocOverlay = document.querySelector(".merope-toc-overlay");
  const wideLayout = window.matchMedia("(min-width: 1320px)");

  if (tocShell && toc && tocToggle && tocOverlay) {
    const toggleIcon = tocToggle.querySelector(".merope-toc-toggle-icon");
    const toggleLabel = tocToggle.querySelector(".merope-toc-toggle-label");

    const setTocOpen = (open) => {
      tocShell.classList.toggle("is-open", open);
      tocOverlay.classList.toggle("is-open", open && !wideLayout.matches);
      document.body.classList.toggle("merope-toc-is-open", open && !wideLayout.matches);
      tocToggle.setAttribute("aria-expanded", String(open));
      tocToggle.setAttribute("aria-label", open ? "Collapse contents" : "Expand contents");
      toc.setAttribute("aria-hidden", String(!open));
      toc.inert = !open;
      if (toggleIcon) toggleIcon.textContent = open ? "‹" : "›";
      if (toggleLabel) toggleLabel.textContent = open ? "Collapse" : "Contents";
    };

    setTocOpen(wideLayout.matches);
    tocToggle.addEventListener("click", () => {
      setTocOpen(tocToggle.getAttribute("aria-expanded") !== "true");
    });
    tocOverlay.addEventListener("click", () => setTocOpen(false));

    toc.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (!wideLayout.matches) setTocOpen(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && tocToggle.getAttribute("aria-expanded") === "true") {
        setTocOpen(false);
        tocToggle.focus();
      }
    });

    wideLayout.addEventListener("change", ({ matches }) => setTocOpen(matches));
  }

  // Continuous loops play by default; a static view remains available.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("[data-geometry-demo]").forEach((demo) => {
    const toggle = demo.querySelector(".geometry-toggle");
    const images = Array.from(demo.querySelectorAll("img[data-animation]"));
    const posters = images.map((image) => image.dataset.poster || image.getAttribute("src"));
    let enabled = !reducedMotion.matches;
    let visible = true;
    let userSelected = false;

    const update = () => {
      images.forEach((image, index) => {
        const source = enabled && visible ? image.dataset.animation : posters[index];
        if (image.getAttribute("src") !== source) image.setAttribute("src", source);
      });
      toggle.textContent = enabled ? "Show reference poses" : "Play animations";
    };

    toggle.hidden = false;
    toggle.addEventListener("click", () => {
      userSelected = true;
      enabled = !enabled;
      update();
    });
    reducedMotion.addEventListener("change", ({ matches }) => {
      if (!userSelected) {
        enabled = !matches;
        update();
      }
    });
    const demoObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.15 });
    demoObserver.observe(demo);
    update();
  });

  // Show only one dataset at a time; keep native controls and reduced motion.
  const showcaseVideos = document.querySelectorAll("video[data-showcase-video]");
  const updateShowcase = (video) => {
    const rect = video.getBoundingClientRect();
    const visible = !video.closest("[hidden], details:not([open])") && rect.bottom > 0 && rect.top < window.innerHeight;
    if (visible && !reducedMotion.matches) {
      const group = video.closest("[data-sync-group]");
      if (group && Array.from(group.querySelectorAll("video")).some((item) => item.readyState < 3)) return;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };
  document.querySelectorAll("[data-driving-demo]").forEach((demo) => {
    const buttons = demo.querySelectorAll("[data-dataset]");
    const panels = demo.querySelectorAll("[data-result-panel]");
    const selectDataset = (dataset) => {
      buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.dataset === dataset)));
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.resultPanel !== dataset;
        panel.querySelectorAll("video").forEach((video) => {
          video.pause();
          video.currentTime = 0;
          updateShowcase(video);
        });
      });
    };
    demo.querySelector(".dataset-switch").hidden = false;
    buttons.forEach((button) => button.addEventListener("click", () => selectDataset(button.dataset.dataset)));
    selectDataset(buttons[0].dataset.dataset);
    demo.querySelectorAll("[data-sync-group]").forEach((group) => {
      const videos = Array.from(group.querySelectorAll("video"));
      const leader = videos[0];
      videos.forEach((video) => video.addEventListener("canplay", () => videos.forEach(updateShowcase)));
      leader.addEventListener("timeupdate", () => {
        if (group.closest("[hidden], details:not([open])") || leader.paused) return;
        videos.slice(1).forEach((video) => {
          if (Math.abs(video.currentTime - leader.currentTime) > 0.15) video.currentTime = leader.currentTime;
        });
      });
    });
  });
  document.querySelectorAll("[data-showcase-more]").forEach((details) => {
    details.addEventListener("toggle", () => {
      details.querySelectorAll("video").forEach((video) => {
        if (details.open && video.preload === "none") {
          video.preload = "auto";
          video.load();
        }
        updateShowcase(video);
      });
    });
  });
  const showcaseObserver = new IntersectionObserver(
    (entries) => entries.forEach(({ target }) => updateShowcase(target)),
    { threshold: 0.15 }
  );
  showcaseVideos.forEach((video) => showcaseObserver.observe(video));
  reducedMotion.addEventListener("change", () => showcaseVideos.forEach(updateShowcase));

  const sections = document.querySelectorAll("details.more-results");
  if (!sections.length) return;

  const playIfVisible = (video) => {
    const details = video.closest("details");
    const rect = video.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < window.innerHeight;

    if (details?.open && visible) {
      video.preload = "metadata";
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const observer = new IntersectionObserver(
    (entries) => entries.forEach(({ target }) => playIfVisible(target)),
    { threshold: 0.1 }
  );

  sections.forEach((details) => {
    const videos = details.querySelectorAll("video");
    videos.forEach((video) => observer.observe(video));

    details.addEventListener("toggle", () => {
      requestAnimationFrame(() => videos.forEach(playIfVisible));
    });
  });
});
