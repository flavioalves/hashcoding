exports.routes = function(map) {

    // Generic routes. Add all your routes below this line
    // feel free to remove generic routes
	//map.all(':controller/:action');
	//map.all(':controller/:action/:id');

	map.root('home#index');
	map.get('/mentions', 'mentions#index');
  map.get('/mentions/photos', 'mentions#photos');

};
