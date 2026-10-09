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
    function markError(code, detail) {
      state.ready = false;
      state.error = code;
      // WeChat's diagnostic text is useful for distinguishing signature/domain
      // failures, but never copy tokens, URLs or the full config into the DOM.
      if (typeof detail === 'string') {
        var message = detail.replace(/access_token|jsapi_ticket|signature|nonceStr|timestamp|url/ig, '[redacted]');
        state.detail = message.slice(0, 160);
      }
      try { env.dispatchEvent(new env.CustomEvent('abb:wechat-share-error', { detail: { code: code } })); } catch (ignore) {}
    }
    if (!/MicroMessenger/i.test(env.navigator.userAgent || '')) { state.error = 'not_wechat'; return state; }
    if (!payload || !payload.config) { markError('signature_unavailable'); return state; }
    if (!validData(payload.data)) { markError('invalid_share_data'); return state; }
    var apis = payload.config.jsApiList || [];
    if (apis.length !== 2 || apis.indexOf('updateAppMessageShareData') < 0 || apis.indexOf('updateTimelineShareData') < 0) {
      markError('invalid_api_list'); return state;
    }
    function configure() {
      var wx = env.wx;
      if (!wx || typeof wx.config !== 'function' || typeof wx.ready !== 'function' || typeof wx.error !== 'function') { markError('sdk_unavailable'); return; }
      try {
        wx.error(function (error) { markError('config_failed', error && error.errMsg); });
        wx.ready(function () {
          try {
            if (typeof wx.updateAppMessageShareData !== 'function' || typeof wx.updateTimelineShareData !== 'function') { markError('unsupported_wechat'); return; }
            state.ready = true;
            wx.updateAppMessageShareData({ title: payload.data.title, desc: payload.data.desc, link: payload.data.link, imgUrl: payload.data.imgUrl,
              success: function () { state.friendConfigured = true; }, fail: function (error) { markError('friend_config_failed', error && error.errMsg); } });
            wx.updateTimelineShareData({ title: payload.data.title, link: payload.data.link, imgUrl: payload.data.imgUrl,
              success: function () { state.timelineConfigured = true; }, fail: function (error) { markError('timeline_config_failed', error && error.errMsg); } });
            // These callbacks confirm metadata setup, NOT that a user shared.
          } catch (error) { markError('share_setup_failed', error && error.message); }
        });
        wx.config(payload.config);
      } catch (error) { markError('sdk_setup_failed', error && error.message); }
    }
    if (env.wx) { configure(); return state; }
    // Sharing must never block first loading, rendering or business forms.
    var script = env.document.createElement('script'), finished = false;
    script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'; script.async = true;
    var timer = env.setTimeout(function () { if (!finished) { finished = true; markError('sdk_load_timeout'); } }, 8000);
    script.onload = function () { if (finished) return; finished = true; env.clearTimeout(timer); configure(); };
    script.onerror = function () { if (finished) return; finished = true; env.clearTimeout(timer); markError('sdk_load_failed'); };
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
