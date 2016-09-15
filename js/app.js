// Note: The API is messed up somehow because date-based queries don't return correct results, even if the queries are run from the API console on the developer website (http://developer.nytimes.com)
// For example, go to http://developer.nytimes.com/movie_reviews_v2.json#/Console/GET/reviews/search.json and put one of the following values in the publication-date field:
// 2012-05-30
// 2012-05-30;2012-05-31
// No matter what date[s] you enter, you're going to get results showing their latest reviews in descending chronological order.
// Because of this, I have not added UI elements or JavaScript code to handle searching for reviews by date


// NYT Movie Reviews API constants
var baseURL = "https://api.nytimes.com/svc/movies/v2/";
var endpoints = {
  keywordSearch:          "reviews/search.json",    // search by keyword
  publicationDateSearch:  "reviews/search.json",    // search by publication date; uses the same endpoint as the keyword search
  allReviews:             "reviews/all.json",       // get all reviews
  picksInTheaters:        "reviews/picks.json",     // get all NYT Critics' Picks currently in theaters
  allCritics:             "critics/all.json",       // get all Times reviewers
  allFullTimeCritics:     "critics/full-time.json", // get all full-time Times reviewers
  allPartTimeCritics:     "critics/part-time.json", // get all part-time Times reviewers
  specificCritic:         "critics/"                // a specific critic. You have to complete the string like this: "critics/[reviewer name].json"
                                                    // ^ for example, "critics/Stephen Holden.json"
}

// Some global variables
var currentOffset = 0;        // The API returns results 20 at a time.
var hasMoreReviews = false;   // The API also tells you if you can get more reviews by adding 20 to the last offset value you used.



// A bunch of objects and prototypes to handle the API endpoints and query parameters.
// I also felt like documenting these JSDoc-style, just because.

/**
 * API query prototype. Don't invoke it directly.
 *
 * @class
 * @param {string} endpoint - Which API endpoint to call, defined in the global endpoints object.
 * @param {number} offset - Positive integer, multiple of 20.
 * @param {('by-title'|'by-publication-date'|'by-opening-date')} order - The sort order of the results.
 */
function reviewQueryObj(endpoint, offset, order) {
  this.apiKey = API_KEY_MOVIES; // defined in a different file
  this.baseURL = baseURL;       // global variable
  this.endpoint = baseURL + endpoint;
  this.offset = offset;
  this.order = order;
  this.queryString = $.param({
    'api-key': this.apiKey,
    'offset':  this.offset,
    'order':   this.order
  });
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
  reviewQueryObj.call(this, endpoints.picksInTheaters, offset, order);
}
allPicksReviewsObj.prototype = new reviewQueryObj();

/**
 * Query object prototype for getting reviews by keyword
 *
 * @class
 * @param {number} offset - Positive integer, multiple of 20.
 * @param {('by-title'|'by-publication-date'|'by-opening-date')} order - The sort order of the results.
 * @param (string) keywords - The keyword[s] to search for.
 * @param {(Y|N)} criticsPicks - (Optional) Limits the results based on whether the movie was (Y) or was not (N) a NYT Critics' Pick.
 * @param (string) reviewer - (Optional) A reviewer's name. Limits the results to that critic's reviews.
 */
function keywordQueryObj(offset, order, keywords, criticsPicks, reviewer) { // I suppose the last two arguments could have been an object called "options"
  reviewQueryObj.call(this, endpoints.keywordSearch, offset, order);

  this.queryString += '&query=' + keywords;

  if(criticsPicks) {
    this.queryString += '&critics-pick=' + criticsPicks;
  }

  if(reviewer) {
    this.queryString += '&reviewer=' + reviewer;
  }
}



// Here is where I'd define query objects for date-based searches, but the API is broken, so I didn't bother. See the note at the top of this file.




// Some query objects for testing purposes
/*
// query object for getting all reviews
var allReviewsQueryTest = new allReviewsQueryObj(currentOffset, 'by-title');
console.log(allReviewsQueryTest);

// query object for getting all NYT Critics' Picks currently in theaters
var allPicksReviewsTest = new allPicksReviewsObj(currentOffset, 'by-title');
console.log(allPicksReviewsTest);

// query object for getting reviews by keyword
var keywordQueryTest1 = new keywordQueryObj(currentOffset, 'by-title', 'these are my keywords', '', 'A. O. Scott');
var keywordQueryTest2 = new keywordQueryObj(currentOffset, 'by-title', 'these are different keywords', 'Y');
var keywordQueryTest3 = new keywordQueryObj(currentOffset, 'by-title', 'random words');
console.log(keywordQueryTest1);
console.log(keywordQueryTest2);
console.log(keywordQueryTest3);
*/



// Functions that handle the pager UI

/** Resets the pager UI on page load and after the form is submitted (via direct user action, not via triggered submits from the pager buttons). */
function resetPager() {
  currentOffset = 0;
  hasMoreReviews = false;
  $(".reviews-pager").hide();
}

/** Displays the pager buttons if the API says there are more "pages" of data. Enables/disables buttons based on which page we're on. */
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


/** Gets reviews and display them. This function probably does too much and should be split into more functions. */
function getReviewsFromAPI() {

  var sortOrder    = $("#search-form input[name='sort-order']:checked").val();
  var keywords     = $("#query").val();
  var criticsPicks = $("#search-form input[name='critics-picks']:checked").val();
  var reviewer     = $("#reviewer").val();
  userQuery = new keywordQueryObj(currentOffset, sortOrder, keywords, criticsPicks, reviewer);

  console.log(userQuery);

  $.getJSON(userQuery.endpoint, userQuery.queryString).done(function(data) {
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
      //overwriteCache: true,   // uncomment this when you change something in the template
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

    getReviewsFromAPI();

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
