document.addEventListener("DOMContentLoaded", () => {
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
