const marked = require( 'marked' )
const md = ( value ) => marked( value || '' )

module.exports = md
