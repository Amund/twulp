const Twulp = require('../gulpfile.js/Twulp.js')
const site = new Twulp()

let data = {
	title: 'A page generated from a plain old js object !',
	description: 'A website generator based on gulp and twig : Twulp.',
	content: 'And the content is... **M**a**r**k**d**o**w**n r*e*a*d*y !',
	qualities: ['Simple'],
	next: { url: 'from-json.html', label: 'There is even better...'}
}

// Load data from an object, ...
site.route( '/index.html', 'page.twig', data )

// ...from a json file, ...
site.route( '/from-json.html', 'page.twig', 'test.json' )

// ...from a yaml file, ...
site.route( '/from-yaml.html', 'page.twig', 'test.yml' )

// ...or from a js module
site.route( '/from-module.html', 'page.twig', 'test.js' )


module.exports = site
