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
