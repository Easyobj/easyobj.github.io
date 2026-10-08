(function (root) {
  'use strict';
  function validData(data) {
    if (!data || typeof data.title !== 'string' || !data.title || typeof data.desc !== 'string') return false;
    try {
      var link = new URL(data.link), image = new URL(data.imgUrl);
      return /^(https?:)$/.test(link.protocol) && /^(https?:)$/.test(image.protocol)
        && !link.username && !link.password && !link.search && !link.hash
        && !image.username && !image.password && link.origin === image.origin;
    } catch (error) { return false; }
  }
  function mount(payload, environment) {
    var env = environment || root;
    var state = { ready: false, friendConfigured: false, timelineConfigured: false, error: null };
    env.ABB_WECHAT_SHARE_STATUS = state;
    if (!/MicroMessenger/i.test(env.navigator.userAgent || '')) { state.error = 'not_wechat'; return state; }
    if (!payload || !payload.config) { state.error = 'signature_unavailable'; return state; }
    if (!validData(payload.data)) { state.error = 'invalid_share_data'; return state; }
    var apis = payload.config.jsApiList || [];
    if (apis.length !== 2 || apis.indexOf('updateAppMessageShareData') < 0 || apis.indexOf('updateTimelineShareData') < 0) {
      state.error = 'invalid_api_list'; return state;
    }
    function configure() {
      var wx = env.wx;
      if (!wx || typeof wx.config !== 'function' || typeof wx.ready !== 'function' || typeof wx.error !== 'function') { state.error = 'sdk_unavailable'; return; }
      try {
        wx.error(function () { state.ready = false; state.error = 'config_failed'; });
        wx.ready(function () {
          try {
            if (typeof wx.updateAppMessageShareData !== 'function' || typeof wx.updateTimelineShareData !== 'function') { state.error = 'unsupported_wechat'; return; }
            state.ready = true;
            wx.updateAppMessageShareData({ title: payload.data.title, desc: payload.data.desc, link: payload.data.link, imgUrl: payload.data.imgUrl,
              success: function () { state.friendConfigured = true; }, fail: function () { state.error = 'friend_config_failed'; } });
            wx.updateTimelineShareData({ title: payload.data.title, link: payload.data.link, imgUrl: payload.data.imgUrl,
              success: function () { state.timelineConfigured = true; }, fail: function () { state.error = 'timeline_config_failed'; } });
            // These callbacks confirm metadata setup, NOT that a user shared.
          } catch (error) { state.error = 'share_setup_failed'; }
        });
        wx.config(payload.config);
      } catch (error) { state.error = 'sdk_setup_failed'; }
    }
    if (env.wx) { configure(); return state; }
    // Sharing must never block first loading, rendering or business forms.
    var script = env.document.createElement('script'), finished = false;
    script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'; script.async = true;
    var timer = env.setTimeout(function () { if (!finished) { finished = true; state.error = 'sdk_load_timeout'; } }, 8000);
    script.onload = function () { if (finished) return; finished = true; env.clearTimeout(timer); configure(); };
    script.onerror = function () { if (finished) return; finished = true; env.clearTimeout(timer); state.error = 'sdk_load_failed'; };
    env.document.head.appendChild(script);
    return state;
  }
  root.ABBWechatShare = { mount: mount, validData: validData };
  if (typeof module === 'object' && module.exports) module.exports = root.ABBWechatShare;
  if (root.document) {
    var node = root.document.getElementById('wechatShareData');
    if (node) {
      try { mount(JSON.parse(node.textContent)); } catch (error) { root.ABB_WECHAT_SHARE_STATUS = { ready: false, error: 'invalid_bootstrap' }; }
    }
  }
}(typeof window === 'object' ? window : globalThis));
