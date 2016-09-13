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
					reviewLink: review.link.url,
					reviewImage: review.multimedia.src,
					reviewAlt: review.link.suggested_link_text,
					reviewTitle: review.display_title,
					reviewCriticsPick: review.critics_pick
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
