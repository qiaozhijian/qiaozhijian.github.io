(function () {
  document.querySelectorAll('.barron-pubs').forEach(function (list) {
    var button = list.querySelector('.publication-toggle');
    var additional = list.querySelectorAll('table:not([data-selected])');
    if (!button || !additional.length) return;

    function setExpanded(expanded) {
      additional.forEach(function (paper) { paper.hidden = !expanded; });
      button.setAttribute('aria-expanded', String(expanded));
      button.textContent = expanded ? 'Show selected publications' : 'Show all publications';
    }

    button.addEventListener('click', function () {
      setExpanded(button.getAttribute('aria-expanded') !== 'true');
    });
    setExpanded(false);
    button.hidden = false;
  });
}());
