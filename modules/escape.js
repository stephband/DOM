
/**
escape(string)
Escapes `string` for setting safely as HTML.
*/

var pre  = document.createElement('pre');
var text = document.createTextNode('');

pre.appendChild(text);

export default function escape(value) {
	text.textContent = value;
	return pre.innerHTML;
}
