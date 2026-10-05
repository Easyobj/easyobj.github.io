(() => {
  window.ABB_RUNTIME = Object.freeze({
    release: '5.9.8-psd-seven-prizes',
    // index.php injects ABB_SERVER_STATE before this file. Static index.html
    // does not, so GitHub Pages remains an explicit visual preview.
    serverRendered:Boolean(window.ABB_SERVER_STATE)
  });
})();
