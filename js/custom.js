jQuery(function($) {
	// make external links open in a new window
  $("a[rel~='external']").click(function() {
    window.open(this.href);
    return false;
  });
});
