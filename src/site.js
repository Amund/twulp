const Site = require('../gulpfile.js/Site.js')
const site = new Site()

let data = {
	title: 'Une page depuis un objet !',
	description: 'Un générateur de site à base de gulp et de twig : Twulp.',
	content: 'Lorem *ipsum* dolor sit amet...',
	qualites: ['Simple','Rapide','Fun']
}

site.route( '/index.html', 'index.twig', 'test.yml' )

module.exports = site
