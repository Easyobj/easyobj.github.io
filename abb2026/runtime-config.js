(() => {
  window.ABB_RUNTIME = Object.freeze({
    release: '5.10.4-home-psd',
    // index.php injects ABB_SERVER_STATE. Static index.html is local visual QA only.
    serverRendered:Boolean(window.ABB_SERVER_STATE)
  });
})();
