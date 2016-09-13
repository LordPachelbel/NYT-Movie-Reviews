jQuery(function($) {

	$("#search-form").submit(function(e) {
		e.preventDefault();

		var endpoint = "https://api.nytimes.com/svc/movies/v2/reviews/search.json";

		$.getJSON(endpoint, {
			'api-key': API_KEY_MOVIES,
			'query': 'Jaws'
		}).done(function(result) {
			console.log(result);
			//$("#results").text(JSON.stringify(result));

			var items = [];
			$.each(result.results, function(key, movieReviewObject) {
				items.push( "<li id='" + key + "'>" + movieReviewObject + "</li>" );
			});
			$( "<ul/>", {
				"class": "my-new-list",
				html: items.join("")
			}).appendTo("#results");
		}).fail(function(err) {
			throw err;
		});
		
		return false;

	});
	
});





/*$("#results").loadTemplate("templates/review.html",
    {
        author: 'Joe Bloggs',
        date: '25th May 2013',
        authorPicture: 'Authors/JoeBloggs.jpg',
        post: 'This is the contents of my post'
    },
		{overwriteCache: true}
		);
});*/
	
	
	


