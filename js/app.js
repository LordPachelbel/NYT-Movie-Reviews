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
				templateData = null;
				templateData = {
					// these are things I couldn't figure out how to refer to in the template
					reviewLink: review.link.url,
					reviewAlt: review.link.suggested_link_text,
					reviewImage: (review.multimedia !== null) ? review.multimedia.src : 'images/no-image.gif',
				};
				//console.log(templateData);
				$.extend(review, templateData);
				//$("#results").loadTemplate("templates/review.html", templateData, {isFile: true, append: true});
			});

			$("#results").loadTemplate("templates/review.html", result.results, {isFile: true});
 			
		}).fail(function(err) {
			throw err;
		});
		
		return false;

	});
	
});
