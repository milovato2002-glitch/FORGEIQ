(function(){
  function check(){
    if(window.forgeiqSupabase){
      window.forgeiqSupabase.auth.getSession().then(function(r){
        if(!r.data || !r.data.session){
          window.location.replace('/login.html?next='+encodeURIComponent(window.location.pathname));
        }
      });
    } else { setTimeout(check, 100); }
  }
  check();
})();
