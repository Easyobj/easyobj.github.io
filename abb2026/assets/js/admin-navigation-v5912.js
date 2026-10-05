/* V5.9.12: only adjusts the native menu; routes and permissions remain in PHP. */
(function () {
  'use strict';
  var menu = document.querySelector('.admin-menu');
  if (!menu || !window.matchMedia) return;
  var mobile = window.matchMedia('(max-width: 760px)');
  function update() { menu.open = !mobile.matches; }
  update();
  if (mobile.addEventListener) mobile.addEventListener('change', update);
  else mobile.addListener(update);
}());
