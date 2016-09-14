jQuery(function($) {

  var currentOffset = 0;
  var hasMoreReviews = false;
  $(".reviews-footer").hide();

  $.addTemplateFormatter({
    datePrettyFormatter: function(value, template) {
      return new Date(value).toDateString();
    },
    upperCaseFormatter: function(value, template) {
      return value.toUpperCase();
    },
    lowerCaseFormatter: function(value, template) {
      return value.toLowerCase();
    },
    sameCaseFormatter: function(value, template) {
      if(template == "upper") {
        return value.toUpperCase();
      } else {
        return value.toLowerCase();
      }
    }
  });

  $("#search-form").submit(function(e) {
    e.preventDefault();
    //console.log(e);

    if(e.isTrigger === null) {
      console.log("normal submission");
    } else {
      console.log("pager submission");
    }
    
    
    var endpoint = "https://api.nytimes.com/svc/movies/v2/reviews/search.json";

    var data = $.param({
      'api-key': API_KEY_MOVIES,
      'order': 'by-title'
    }) + '&' + $(this).serialize();
    //console.log(data);

    $.getJSON(endpoint, data).done(function(data) {
      console.log(data);

      hasMoreReviews = data.has_more;
      
      if(data.num_results == 0) {
        $("#results").html("<p>No results found.</p>")
        return false;
      }

      $.each(data.results, function(key, review) {

        templateData = null;
        templateData = {
          reviewLink: review.link.url,
          reviewTitle: review.link.suggested_link_text,
          reviewAlt: review.link.suggested_link_text,
          reviewImage: (review.multimedia !== null) ? review.multimedia.src : 'images/no-image.gif',
          criticsPick: (review.critics_pick == 1) ? '<span class="glyphicon glyphicon-star" title="NYT Critics\' Pick"></span>' : ''
        };

        $.extend(review, templateData);
        //console.log(review);

      });

      $("#results").loadTemplate("templates/review.html", data.results, {
        isFile: true,
        success: addPager(hasMoreReviews, currentOffset),
        bindingOptions: {
          ignoreUndefined: true,
          ignoreNull: true,
          ignoreEmptyString: true
        }
      });

    }).fail(function(err) {
      console.log(err);
    });
    
    return false;

  });

  $(".next").click(function(e) {
    e.preventDefault();

    currentOffset += 20;
    console.log(currentOffset);
    $("#search-form").submit();

    return false;
  });

  $(".previous").click(function(e) {
    e.preventDefault();

    currentOffset -= 20;
    console.log(currentOffset);
    $("#search-form").submit();

    return false;
  });

});

function addPager(hasMoreReviews, currentOffset) {
  if(hasMoreReviews) {
    $(".next").removeClass("disabled");
  } else {
    $(".next").addClass("disabled");
  }

  if(currentOffset > 0) {
    $(".previous").removeClass("disabled");
  } else {
    $(".previous").addClass("disabled");
  }

  $(".reviews-footer").show();
}