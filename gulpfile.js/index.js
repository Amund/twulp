const fs = require( 'fs' )
const del = require( 'del' )
const { src, dest, watch, series, parallel } = require( 'gulp' )

const sourcemaps = require( 'gulp-sourcemaps' )
const autoprefixer = require( 'gulp-autoprefixer' )
const sass = require( 'gulp-sass' )
const cleanCss = require( 'gulp-clean-css' )
const concat = require( 'gulp-concat' )

const { terser } = require('rollup-plugin-terser')
const rollup = require('rollup')
const { nodeResolve } = require('@rollup/plugin-node-resolve')

const webp = require('gulp-webp')
const rename = require( 'gulp-rename' )
const imageSize = require( 'image-size' )
const through = require('through2')
const globParent = require('glob-parent')

const marked = require( 'marked' )
const browsersync = require( 'browser-sync' ).create()

const { config } = require( '../package.json' )

const match = {
	copy: [config.copy+'/**/*',config.copy+'/**/.*',],
	css: config.css.in+'/**/*.{css,scss}',
	js: config.js.watch+'/**/*.{js,ts,mjs}',
	data: config.data,
	tpl: config.tpl,
	in: config.in,
}

let pagesItems = []

function requireWithoutCache( module ) {
	delete require.cache[require.resolve( module )]
	return require( module )
}

function writeFileSyncRecursive( filename, content ) {
	filename.split( '/' ).slice( 0, -1 ).reduce( ( last, folder ) => {
		let folderPath = ( last ? last + '/' + folder : folder )
		if( !fs.existsSync( folderPath ) )
			fs.mkdirSync( folderPath )
		return folderPath
	}, '' )
	fs.writeFileSync( filename, content )
}

const clean = () => del( [config.out] )

const copy = () => src( match.copy ).pipe( dest( config.out ) )

const css = () =>
    src( match.css )
        .pipe( sourcemaps.init() )
        .pipe( sass( { includePaths: ['node_modules'] } ).on('error', sass.logError) )
		.pipe( cleanCss() )
		.pipe( autoprefixer( ['last 10 versions', '> 1%'] ) )
        .pipe( concat( config.css.file ) )
        .pipe( sourcemaps.write( '.' ) )
		.pipe( dest( config.css.out ) )
		.pipe( browsersync.stream() )
		
const js = () => rollup.rollup( {
		input: config.js.in,
		plugins: [nodeResolve(), terser()]
	} ).then( bundle => bundle.write( {
		file: config.js.out,
		format: 'iife',
		name: 'script',
		sourcemap: true
	} ) )
	
function picture( ok ) {
	src( config.picture.in + '/**/*.{jpg,png,gif}' )
		.pipe( through.obj( function( file, enc, callback ) {
			for( const width of config.picture.sizes ) {
				this.push( file )
				const dimensions = imageSize( file.path )
				const ratio = width / dimensions.width
				const newDimensions = { height: Math.round( dimensions.height * ratio ), width }
				// console.log(dimensions, ratio, file.path, newDimensions)
				src( file.path )
					.pipe( webp( { resize: newDimensions } ) )
					.pipe( rename( path => path.basename = width ) )
					.pipe( dest( config.out + '/' + config.picture.out + '/' + file.basename ) )
			}
			src( file.path )
				.pipe( rename( path => path.basename = 'original' ) )
				.pipe( dest( config.out + '/' + config.picture.out + '/' + file.basename ) )
			return callback()
		} ) )
	ok()
}

const pages = ( ok ) => {
	const site = requireWithoutCache( '../' + config.in )
	const oldPagesItems = [...pagesItems]
	pagesItems = [...site.pages]
	let tasks = site.getTasks( oldPagesItems, pagesItems )
	const Twig = requireWithoutCache( 'twig' )
	Twig.extendFilter( 'md', ( value ) => marked( value || '' ) )
	tasks.build.forEach( function( page ) {
		const file = config.out + page.path
		Twig.renderFile( page.template, page.data, ( err, html ) => {
			if( err ) throw new Error( err )
			writeFileSyncRecursive( file, html )
		} )
	} )
	ok()
}

const emptyPages = ( ok ) => {
	pagesItems = []
	ok()
}

const reload = ( ok ) => {
	browsersync.reload()
	ok()
}

const server = ( ok ) => {
    browsersync.init( config.browsersync )
	ok()
}

const watchers = ( ok ) => {
	watch( match.copy, series( copy, reload ) )
	watch( match.css, css )
	watch( match.js, series( js, reload ) )
	watch( match.data, series( pages, reload ) )
	watch( match.in, series( pages, reload ) )
	watch( match.tpl, series( emptyPages, pages, reload ) )
	ok()
}

const build = series( clean, parallel( picture, copy, css, js, pages ) )

const doWatch = series( parallel( watchers, build ), server )

module.exports = { clean, picture, copy, css, js, pages, build, watch:doWatch, default: doWatch }
