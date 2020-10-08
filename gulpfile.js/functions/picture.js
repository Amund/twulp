const fs = require( 'fs' )
const path = require( 'path' )
const { config } = require( '../../package.json' )
const imageSize = require( 'image-size' )

function picture(filename, alt) {
	const file = config.picture.in + '/' + filename
	if( !fs.existsSync( file ) )
		throw new Error( 'picture file "'+file+'" doesn\'t exists' )
	alt = alt || ''

	const srcset = []
	const sizes = []
	for( const width of config.picture.sizes ) {
		srcset.push( config.picture.out + '/' + filename + '/' + width + '.webp ' + width + 'w' )
	}
	const source = `<source type="image/webp" srcset="${srcset.join(',')}">`
	const { width, height } = imageSize( file )
	const ext = path.extname( filename )
	const src = config.picture.out + '/' + filename + '/original' + ext
	const img = `<img loading="lazy" src="${src}" alt="${alt}" width="${width}" height="${height}">`

	const picture = `<picture>${source}${img}</picture>`
	return picture
}

module.exports = picture
