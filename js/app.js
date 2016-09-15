// NYT Movie Reviews API constants
var baseURL = "https://api.nytimes.com/svc/movies/v2/";
var endpoints = {
  allReviews:         "reviews/all.json",       // All reviews
  picksInTheaters:    "reviews/picks.json",     // NYT Critics' Picks currently in theaters
  keywordSearch:      "reviews/search.json",    // Keyword search
  allCritics:         "critics/all.json",       // All Times reviewers
  allFullTimeCritics: "critics/full-time.json", // All full-time Times reviewers
  allPartTimeCritics: "critics/part-time.json", // All part-time Times reviewers
  specificCritic:     "critics/"                // A specific critic. You have to complete the string like this: "critics/[reviewer name].json"
                                                // ^ For example, "critics/Stephen Holden.json"
}

var currentOffset = 0;        // The API returns results 20 at a time.
var hasMoreReviews = false;   // The API also tells you if you can get more reviews by adding 20 to the last offset value you used.


// A bunch of objects and prototypes to handle the API endpoints and query parameters. I also felt like documenting these JSDoc-style, just because.

/**
 * API query prototype. Don't invoke it directly.
 *
 * @class
 * @param {string} endpoint - Which API endpoint to call, defined in the global endpoints object.
 * @param {number} offset - Positive integer, multiple of 20.
 * @param {('by-title'|'by-publication-date'|'by-opening-date')} order - The sort order of the results.
 */
function reviewQueryObj(endpoint, offset, order) {
  this.baseURL = baseURL;     // global variable
  this.endpoint = endpoint;
  this.offset = offset;
  this.order = order;
}

/**
 * Query object prototype for getting all reviews.
 *
 * @class
 * @param {number} offset - Positive integer, multiple of 20.
 * @param {('by-title'|'by-publication-date'|'by-opening-date')} order - The sort order of the results.
 */
function allReviewsQueryObj(offset, order) {
  reviewQueryObj.call(this, endpoints.allReviews, offset, order); // endpoints is a global variable
}
allReviewsQueryObj.prototype = new reviewQueryObj();

/**
 * Query object prototype for getting all NYT Critics' Picks reviews currently in theaters.
 *
 * @class
 * @param {number} offset - Positive integer, multiple of 20.
 * @param {('by-title'|'by-publication-date'|'by-opening-date')} order - The sort order of the results.
 */
function allPicksReviewsObj(offset, order) {
  reviewQueryObj.call(this, endpoints.picksInTheaters, offset, order); // endpoints is a global variable
}
allPicksReviewsObj.prototype = new reviewQueryObj();

// query object for getting all reviews
var allReviewsQuery = new allReviewsQueryObj(currentOffset, 'by-title');
console.log(allReviewsQuery);

// query object for getting all NYT Critics' Picks currently in theaters
var allPicksReviews = new allPicksReviewsObj(currentOffset, 'by-title');
console.log(allPicksReviews);







// UI functions that show/hide and enable/disable the pager buttons
function resetPager() {
  currentOffset = 0;
  hasMoreReviews = false;
  $(".reviews-pager").hide();
}

function addPager(hasMoreReviews, currentOffset) {
  if(hasMoreReviews) {
    $(".next").removeClass("disabled");
    $(".reviews-pager").show();
  } else {
    $(".next").addClass("disabled");
  }

  if(currentOffset > 0) {
    $(".previous").removeClass("disabled");
    $(".reviews-pager").show();
  } else {
    $(".previous").addClass("disabled");
  }
}


// Main app code
jQuery(function($) {

  resetPager();

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
    if(e.originalEvent !== undefined) {
      console.log("normal submission");
      resetPager();
    } else {
      console.log("pager submission");
    }

    getReviewsFromAPI($(this));

    return false;

  });

  $(".next").click(function(e) {
    e.preventDefault();

    if(!hasMoreReviews) {
      return false;
    }
    currentOffset += 20;
    console.log("currentOffset: " + currentOffset);
    $("#search-form").submit();

    return false;
  });

  $(".previous").click(function(e) {
    e.preventDefault();

    if(currentOffset == 0) {
      return false;
    }
    currentOffset -= 20;
    console.log("currentOffset: " + currentOffset);
    $("#search-form").submit();

    return false;
  });

});






function getReviewsFromAPI(searchForm) {
  console.log(searchForm);

  var baseURL = "https://api.nytimes.com/svc/movies/v2/";
  var endpoints = {
    allReviews:       "reviews/all.json",     // All reviews
    picksInTheaters:  "reviews/picks.json",   // NYT Critics' Picks currently in theaters
    keywordSearch:    "reviews/search.json"

  }



  var endpoint = baseURL + endpoints.keywordSearch;

  var data = $.param({
    'api-key': API_KEY_MOVIES,
    'order': 'by-title',
    'offset': currentOffset
  }) + '&' + searchForm.serialize();
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
}
