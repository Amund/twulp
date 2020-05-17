const fs = require('fs')
const del = require('del')
const { src, dest, watch, series, parallel } = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const cleanCss = require('gulp-clean-css')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const marked = require('marked')
const browsersync = require('browser-sync').create()

const { config } = require('../package.json')
const debug = false

let pagesItems = []

function writeFileSyncRecursive(filename, content) {
	filename.split( '/' ).slice( 0, -1 ).reduce( (last, folder) => {
		let folderPath = ( last ? last + '/' + folder : folder )
		if( !fs.existsSync( folderPath ) )
			fs.mkdirSync( folderPath )
		return folderPath
	},'');
	fs.writeFileSync(filename, content)
}

const clean = () => del([config.out])

function copy(ok) {
	return src(config.copy.in)
		.pipe(dest(config.copy.out))
}

const css = () =>
    src(config.css.in)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCss())
        .pipe(concat(config.css.file))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(config.css.out))
		
const js = () =>
	src(config.js.in)
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(concat(config.js.file))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(config.js.out))

const pages = (ok) => {
	const siteScript = '../src/site.js'
	delete require.cache[require.resolve( siteScript )]
	const oldPagesItems = [...pagesItems]
	site = require( siteScript )
	// console.log( site )
	pagesItems = [...site.pages]
	let tasks = site.getTasks( oldPagesItems, pagesItems )
	// console.log( tasks )

	delete require.cache[require.resolve( 'twig' )]
	const Twig = require('twig')
	Twig.extendFilter( 'md', (value) => marked(value))
	tasks.build.forEach( function(page) {
		const file = config.tpl.out + page.path
		// console.log(page.data)
		Twig.renderFile(page.template, page.data, (err, html) => {
			if( err )
				throw new Error( err )
			writeFileSyncRecursive( file, html )
		})
	})
	ok()
}

const forceAllPages = (ok) => {
	pagesItems = []
	ok()
}

const reload = (ok) => {
	browsersync.reload()
	ok()
}

exports.clean = clean
exports.copy = copy
exports.css = css
exports.js = js
exports.pages = pages

exports.default = series(clean, parallel(copy, css, js, pages))

exports.watch = function(ok) {
	exports.default()
	watch(config.copy.in, series(copy, reload))
	watch(config.css.in, series(css, reload))
	watch(config.js.in, series(js, reload))
	watch([config.in+'/site.js',config.data], series(pages, reload))
	watch(config.tpl.in, series(forceAllPages, pages, reload))
    browsersync.init({
		logLevel: 'silent',
        server: {
			baseDir: config.out,
			serveStaticOptions: {
				index: 'index.html',
				extensions: ["html"]
			}
		},
        // proxy: "test.local",
        port: 44320
	})
	ok()
}

exports.compile = function(ok) {
	series(pages)
	watch([config.in+'/site.js',config.data], series(pages))
	watch(config.tpl.in, series(forceAllPages, pages))
	ok()
}
