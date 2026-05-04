// The Doc Lovato Method — Session gating
// Note: `__FORGEIQ_PUBLIC_PAGE__` flag and `forgeiq_*` localStorage keys preserved by design (see FORGEIQ_SESSION_NOTES.md → BRAND HISTORY).
// Loaded synchronously in <head> BEFORE any other script so unauthenticated users never see protected content.
(function(){
  if(window.__FORGEIQ_PUBLIC_PAGE__) return;
  console.log('[auth-guard] checking session on ' + window.location.pathname);

  // Hide the page until auth is confirmed. Prevents flash of protected content during the async session check.
  try {
    var hideStyle = document.createElement('style');
    hideStyle.id = '__authguard_hide';
    hideStyle.textContent = 'html{visibility:hidden!important}';
    (document.head || document.documentElement).appendChild(hideStyle);
  } catch(e){}

  var revealed = false;
  function reveal(){
    if(revealed) return;
    revealed = true;
    var s = document.getElementById('__authguard_hide');
    if(s && s.parentNode) s.parentNode.removeChild(s);
  }
  function redirect(){
    window.location.replace('/login.html?next='+encodeURIComponent(window.location.pathname));
  }

  // Hard cap: if we never resolve auth in 4s, fail closed (redirect).
  var timeoutId = setTimeout(function(){
    console.warn('[auth-guard] auth check timed out, redirecting');
    redirect();
  }, 4000);

  function check(){
    if(window.forgeiqSupabase){
      window.forgeiqSupabase.auth.getSession().then(function(r){
        clearTimeout(timeoutId);
        var hasSession = !!(r && r.data && r.data.session);
        console.log('[auth-guard] session:', hasSession ? 'FOUND' : 'NONE');
        if(hasSession){ reveal(); return; }
        // Allow guest users who have a localStorage user record (not just a token — must be a parseable user object)
        var user = null;
        try { user = JSON.parse(localStorage.getItem('forgeiq_user')); } catch(e){}
        if(user && user.id){
          console.log('[auth-guard] guest/local user found, allowing access');
          reveal();
          return;
        }
        redirect();
      }).catch(function(err){
        clearTimeout(timeoutId);
        console.error('[auth-guard] session check failed:', err);
        redirect();
      });
    } else { setTimeout(check, 50); }
  }
  check();
})();
