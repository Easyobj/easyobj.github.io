(() => {
  window.ABB_RUNTIME = Object.freeze({
    release: '5.10.6-home-psd-update',
    // index.php injects ABB_SERVER_STATE. Static index.html is local visual QA only.
    serverRendered:Boolean(window.ABB_SERVER_STATE)
  });
})();
