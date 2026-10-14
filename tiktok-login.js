/*
 * MindDrop — TikTok Login Kit for Web entry point.
 *
 * Builds the TikTok authorization URL and redirects the user to TikTok.
 * Only PUBLIC values live here: the client key is part of every TikTok
 * authorization URL by design. The client secret and all tokens are never
 * present on this website; the authorization code returned to callback.html
 * is exchanged server-side by the MindDrop studio.
 *
 * Reference: https://developers.tiktok.com/doc/login-kit-web
 */
(function () {
  'use strict';

  var CONFIG = {
    authorizeUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    clientKey: 'awhbiyialvj3f4k1',
    // Must match a Redirect URI registered in the TikTok developer portal exactly.
    redirectUri: 'https://yacckim-max.github.io/minddrop/callback',
    // Same scopes as the MindDrop studio (Content Posting API).
    scopes: ['user.info.basic', 'video.publish', 'video.upload'],
    stateKey: 'minddrop_tiktok_oauth_state'
  };

  function randomState() {
    var bytes = new Uint8Array(24);
    window.crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (b) {
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
  }

  function buildAuthUrl(state) {
    var params = new URLSearchParams({
      client_key: CONFIG.clientKey,
      response_type: 'code',
      scope: CONFIG.scopes.join(','),
      redirect_uri: CONFIG.redirectUri,
      state: state,
      // Always show the TikTok consent screen so users see exactly what they grant.
      disable_auto_auth: '1'
    });
    return CONFIG.authorizeUrl + '?' + params.toString();
  }

  function prepareLogin() {
    var state = randomState();
    try {
      sessionStorage.setItem(CONFIG.stateKey, JSON.stringify({ value: state, created: Date.now() }));
    } catch (e) { /* storage blocked: callback.html will report a failed security check */ }
    return buildAuthUrl(state);
  }

  function startLogin(event) {
    if (event) event.preventDefault();
    window.location.assign(prepareLogin());
  }

  window.MindDropTikTokLogin = {
    config: CONFIG,
    buildAuthUrl: buildAuthUrl,
    prepareLogin: prepareLogin,
    start: startLogin
  };

  document.addEventListener('DOMContentLoaded', function () {
    var buttons = document.querySelectorAll('[data-tiktok-login]');
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', startLogin);
    });
  });
})();
