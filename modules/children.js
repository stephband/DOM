/**
children(node)

Returns an array of child elements of `node`.
*/

import toArray from 'fn/to-array.js';

export default function children(node) {
	// In IE and Safari, document fragments do not have .children, fall back to
	// querySelectorAll.

	// TOIDO: BUg in selector!!!
	return toArray(node.children || node.querySelectorAll('*'));
}
