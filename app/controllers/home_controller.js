
var util = require('util');

load('application');

action(function index() {
	console.log('home#index');
	//console.log(util.inspect(req));
	render();
});