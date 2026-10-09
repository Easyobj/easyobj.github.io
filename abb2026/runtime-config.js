(() => {
  window.ABB_RUNTIME = Object.freeze({
    release: '5.10.5-scene4-thanks',
    // index.php injects ABB_SERVER_STATE. Static index.html is local visual QA only.
    serverRendered:Boolean(window.ABB_SERVER_STATE)
  });
})();
