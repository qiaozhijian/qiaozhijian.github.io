(function () {
  var button = document.querySelector('.theme-toggle');
  if (!button) return;

  function updateButton() {
    var dark = document.documentElement.dataset.theme === 'dark';
    var label = dark ? 'Switch to light mode' : 'Switch to dark mode';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  }

  button.addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('site-theme', next); } catch (error) { /* The current page still changes theme. */ }
    updateButton();
  });
  updateButton();
}());
