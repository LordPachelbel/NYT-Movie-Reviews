jQuery(function($) {

	$("#search-form").submit(function(e) {
		e.preventDefault();
		var url = "https://api.nytimes.com/svc/movies/v2/reviews/search.json";
		url += '?' + $.param({
			'api-key': API_KEY_MOVIES
		});
		$.ajax({
			url: url,
			method: 'GET',
		}).done(function(result) {
			console.log(result);
			$("#results").text(JSON.stringify(result));
		}).fail(function(err) {
			throw err;
		});
		return false;
	});


});
