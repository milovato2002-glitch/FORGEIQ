// The Doc Lovato Method — Session gating
// Note: `__FORGEIQ_PUBLIC_PAGE__` flag and `forgeiq_*` localStorage keys preserved by design (see FORGEIQ_SESSION_NOTES.md → BRAND HISTORY).
// Loaded synchronously in <head> BEFORE any other script so unauthenticated users never see protected content.
//
// 2026-08-17 FIX: previously this polled forever for `window.forgeiqSupabase`, which was never
// assigned anywhere in the codebase (the Supabase SDK was never loaded). The poll never resolved,
// the 4s failsafe fired, and EVERY protected page redirected to /login.html — an infinite login
// loop. The SDK is now loaded in <head> before this file and assigned in supabase-config.js.
// This guard additionally degrades to the localStorage user record if the CDN is unreachable,
// so a jsDelivr outage can never lock the whole app out again.
(function(){
  if(window.__FORGEIQ_PUBLIC_PAGE__) return;

  var SDK_WAIT_MS  = 4000;  // how long to wait for window.forgeiqSupabase to appear
  var HARD_CAP_MS  = 8000;  // absolute ceiling for the whole check
  var settled      = false;
  var revealed     = false;

  console.log('[auth-guard] checking session on ' + window.location.pathname);

  // Hide the page until auth is confirmed. Prevents flash of protected content during the async check.
  try {
    var hideStyle = document.createElement('style');
    hideStyle.id = '__authguard_hide';
    hideStyle.textContent = 'html{visibility:hidden!important}';
    (document.head || document.documentElement).appendChild(hideStyle);
  } catch(e){}

  function reveal(){
    if(revealed) return;
    revealed = true;
    var s = document.getElementById('__authguard_hide');
    if(s && s.parentNode) s.parentNode.removeChild(s);
  }

  function redirect(){
    window.location.replace('/login.html?next=' + encodeURIComponent(window.location.pathname));
  }

  // A locally stored user record (real login OR guest mode). Must be a parseable object with an id.
  function localUser(){
    try {
      var u = JSON.parse(localStorage.getItem('forgeiq_user'));
      return (u && u.id) ? u : null;
    } catch(e){ return null; }
  }

  function allow(reason){
    if(settled) return;
    settled = true;
    clearTimeout(hardCap);
    console.log('[auth-guard] ALLOW (' + reason + ')');
    reveal();
  }

  function deny(reason){
    if(settled) return;
    settled = true;
    clearTimeout(hardCap);
    console.warn('[auth-guard] DENY (' + reason + ') → redirecting to login');
    redirect();
  }

  // Absolute ceiling. Prefer the local record over a hard bounce so a slow network
  // degrades to "you stay logged in" rather than "you get thrown out".
  var hardCap = setTimeout(function(){
    if(localUser()) allow('hard-cap-local-user'); else deny('hard-cap-timeout');
  }, HARD_CAP_MS);

  function checkSession(){
    try {
      window.forgeiqSupabase.auth.getSession().then(function(r){
        var hasSession = !!(r && r.data && r.data.session);
        if(hasSession) return allow('supabase-session');
        if(localUser())  return allow('local-user-no-session');
        deny('no-session-no-local-user');
      }).catch(function(err){
        console.error('[auth-guard] session check failed:', err);
        if(localUser()) allow('local-user-after-error'); else deny('session-check-error');
      });
    } catch(e){
      console.error('[auth-guard] session check threw:', e);
      if(localUser()) allow('local-user-after-throw'); else deny('session-check-threw');
    }
  }

  // Wait for the SDK client, but never forever.
  var deadline = Date.now() + SDK_WAIT_MS;
  (function waitForClient(){
    if(settled) return;
    if(window.forgeiqSupabase) return checkSession();
    if(Date.now() > deadline){
      // SDK never loaded (CDN blocked/offline). Degrade rather than lock everyone out.
      console.warn('[auth-guard] Supabase SDK unavailable after ' + SDK_WAIT_MS + 'ms');
      if(localUser()) allow('sdk-unavailable-local-user'); else deny('sdk-unavailable-no-local-user');
      return;
    }
    setTimeout(waitForClient, 50);
  })();
})();
