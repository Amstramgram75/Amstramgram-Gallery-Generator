import main from './common/main'
import aside from './common/aside'
import code from './common/code'
import Prism from 'prismjs'

const
	w = window,
	d = document


w.addEventListener("load", function () {
	main()
	aside()
	code()
	init()
}, false)

function init() {
	console.log('INIT')
}
