const fs = require( 'fs' )
const path = require( 'path' )
const UrlPattern = require( 'url-pattern' )
const slugify = require( 'slugify' )
const hash = require( 'object-hash' )
const YAML = require( 'yaml' )

const { config } = require( '../package.json' )

class Site {

	constructor() {
		this.pages = []
	}

	route(route, template, data) {
		const pattern = new UrlPattern(route)
		if( typeof data === 'string' )
			data = this.data( data )
		if( typeof data !== 'object' )
			throw new Error( 'data doit être de type "object" ou "array", pas "' + typeof data + '"' )
		if( !Array.isArray( data ) )
			data = [data]
		data.forEach( function( o ) {
			// slugify toutes les variables d'url
			const names = {}
			pattern.names.forEach( function( name ) {
				if( typeof o[name] === 'undefined' )
					throw new Error( 'data ne contient pas de variable :' + name )
				names[name] = slugify( o[name] ).toLowerCase()
			})
			const tpl = config.tpl + '/' + template
			if( !fs.existsSync( tpl ) )
				throw new Error( 'le template "'+tpl+'" n\'existe pas' )
			// ajout de l'objet route final
			const final = {
				path: pattern.stringify( names ),
				template: tpl,
				data: o
			}
			final.hash = hash( final, { algorithm:'md5' } )
			this.pages.push( final )
		}.bind( this ) )
	}

	getTasks( oldRoutes, routes ) {
		const tasks = {
			delete: [],
			same: [],
			build: [],
		}
		const oldRoutesMap = {}
		const routesMap = {}
		oldRoutes.forEach( function( o ) {
			oldRoutesMap[o.path] = o.hash
		} )
		// build / same
		routes.forEach( function( o ) {
			routesMap[o.path] = o.hash
			if( oldRoutesMap[o.path] && oldRoutesMap[o.path] == o.hash ) {
				tasks.same.push( o.path )
			} else {
				tasks.build.push( Object.assign({}, o ) )
			}
		})
		// delete
		for( let k in oldRoutesMap ) {
			if( !routesMap[k] )
				tasks.delete.push( k )
		}
		return tasks
	}

	data( dataPath ) {
		const file = config.data + '/' + dataPath
		if( !fs.existsSync( file ) )
			throw new Error( 'le fichier de données "'+file+'" n\'existe pas' )
		const ext = path.extname( file ).toLowerCase()
		let data, content
		switch( ext ) {
			case '.yml':
			case '.yaml':
				data = YAML.parse( fs.readFileSync( file, 'utf8' ) )
				break
			case '.json':
				data = JSON.parse( fs.readFileSync( file, 'utf8' ) )
				break
			case '.js':
				const module = '../'+file
				delete require.cache[require.resolve( module )]
				data = require( module )
				break
			default: throw new Error( 'le fichier de données avec l\'extension "'+ext+'" n\'est pas supporté (module js, yaml ou json uniquement)' )
		}
		return data
	}
	
}

module.exports = Site
