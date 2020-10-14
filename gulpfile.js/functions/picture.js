const fs = require( 'fs' )
const path = require( 'path' )
const { config } = require( '../../package.json' )
const imageSize = require( 'image-size' )

const types = [
	{ "name": "svg", "mime": "image/svg" },
	{ "name": "avif", "mime": "image/avif" },
	{ "name": "webp", "mime": "image/webp" },
	{ "name": "jpg", "mime": "image/jpeg" },
	{ "name": "png", "mime": "image/png" },
	{ "name": "gif", "mime": "image/gif" },
]

// function picture(filename, alt) {
// 	const file = config.picture.in + '/' + filename
// 	if( !fs.existsSync( file ) )
// 		throw new Error( 'picture file "'+file+'" doesn\'t exists' )
// 	alt = alt || ''

// 	const srcset = []
// 	const sizes = []
// 	for( const width of config.picture.sizes ) {
// 		srcset.push( config.picture.out + '/' + filename + '/' + width + '.webp ' + width + 'w' )
// 	}
// 	const source = `<source type="image/webp" srcset="${srcset.join(',')}">`
// 	const { width, height } = imageSize( file )
// 	const ext = path.extname( filename )
// 	const src = config.picture.out + '/' + filename + '/original' + ext
// 	const img = `<img loading="lazy" src="${src}" alt="${alt}" width="${width}" height="${height}">`

// 	const picture = `<picture>${source}${img}</picture>`
// 	return picture
// }

function picture(filename, alt, style, crop) {
	const file = config.picture.in + '/' + filename
	alt = alt || ''
	style = style || 'default'
	crop = crop || 'center'

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

/*
https://la-cascade.io/images-responsives-picture-et-srcset/

{
	name: 'default',
	label: '',
	sources: [
		{
			type: 'webp',
			set: [480,1024,1920],
			media: '',
			sizes: '(max-width:480px) 100vw, 50vw',
		},
		{
			type: 'jpeg',
		}
	]
}

<picture>
	<source
		type="image/webp"
		srcset="{filename}/480x480-center.webp 480w,
				{filename}/1024.webp 1024w,
				{filename}/1920.webp 1920w"
		sizes="(max-width:480px) 100vw,
				50vw"
				/>
	<source
		type="image/jpeg"
		srcset="{filename}/480x480-center.webp 480w,
				{filename}/1024.webp 1024w,
				{filename}/1920.webp 1920w"
		sizes="(max-width:480px) 100vw,
				50vw"
				/>
	<img
		type="image/jpeg"
		src="small.jpg"
		alt="{alt}"
		loading="lazy"
		data-picture-style="{style}"
		/>
</picture>


*/