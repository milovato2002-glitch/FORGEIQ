(function(){
  console.log('[auth-guard] checking session on ' + window.location.pathname);
  if(window.__FORGEIQ_PUBLIC_PAGE__) return;
  function check(){
    if(window.forgeiqSupabase){
      window.forgeiqSupabase.auth.getSession().then(function(r){
        console.log('[auth-guard] session:', r.data && r.data.session ? 'FOUND' : 'NONE');
        if(!r.data || !r.data.session){
          // Allow guest users who have a localStorage token
          var user = null;
          try { user = JSON.parse(localStorage.getItem('forgeiq_user')); } catch(e){}
          if(user && user.id){
            console.log('[auth-guard] guest/local user found, allowing access');
            return;
          }
          window.location.replace('/login.html?next='+encodeURIComponent(window.location.pathname));
        }
      });
    } else { setTimeout(check, 100); }
  }
  check();
})();
