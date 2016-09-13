jQuery(function($) {

	$.addTemplateFormatter({
		reviewLink: function(value) {
			return value.url;
		},
		/*image_src: function (value) {
			return value.src;
		},
		image_src: function (value) {
			return value.src;
		},*/
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

		var endpoint = "https://api.nytimes.com/svc/movies/v2/reviews/search.json";

		var data = $.param({
			'api-key': API_KEY_MOVIES,
			'order': 'by-title'
		}) + '&' + $(this).serialize();
		//console.log(data);

		$.getJSON(endpoint, data).done(function(result) {
			//console.log(result);
			
		  $.each(result.results, function(key, review) {
				console.log(key);
				//console.log(review);
				templateData = {
					// the stuff I couldn't figure out how to refer to in the template
					reviewLink: review.link.url,
					reviewAlt: review.link.suggested_link_text,
					reviewImage: (review.multimedia !== null) ? review.multimedia.src : 'images/no-image.gif',

					// the stuff that always worked
					display_title: review.display_title,
					critics_pick: review.critics_pick,
					mpaa_rating: review.mpaa_rating,
					publication_date: review.publication_date,
					headline: review.headline,
					summary_short: review.summary_short
				};
				console.log(templateData);
				$("#results").loadTemplate("templates/review.html", templateData, {isFile: true, append: true});
			});

			//$("#results").loadTemplate("templates/review.html", result.results, {isFile: true});
 			
		}).fail(function(err) {
			throw err;
		});
		
		return false;

	});
	
});
