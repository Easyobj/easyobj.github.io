(() => {
  const host = location.hostname.toLowerCase();
  const isGithubPages = host === 'easyobj.github.io' || host.endsWith('.github.io');
  const isLocal = host === '127.0.0.1' || host === 'localhost';
  const localBackendTest = isLocal && new URL(location.href).searchParams.get('backend') === '1';

  window.ABB_RUNTIME = Object.freeze({
    release: '5.6.1-production-preflight',
    apiBase: 'api/index.php',
    // GitHub Pages and file:// are explicit visual-preview environments.
    // The official server must use HTTPS; localhost can opt in for tests.
    apiEnabled: localBackendTest || (location.protocol === 'https:' && !isGithubPages)
  });
})();
