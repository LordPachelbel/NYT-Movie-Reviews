jQuery(function($) {
  // make external links open in a new window
  $("a[rel~='external']").click(function() {
    window.open(this.href);
    return false;
  });

  $(".back-to-top").click(function(e) {
    e.preventDefault();
    $("html, body").animate({ scrollTop: 0 }, "fast");
    return false;
  });
});
