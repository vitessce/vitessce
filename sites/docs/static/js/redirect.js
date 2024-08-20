(function() {
    if (window.location.pathname === '/' && !window.location.hash) {
      window.location.replace('/#?edit=true');
    }
  })();