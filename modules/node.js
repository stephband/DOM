
/**
type(node)

Returns one of `'element'`, `'text'`, `'comment'`, `'document'`,
`'doctype'` or `'fragment'`.
**/

var types = {
	1:  'element',
	3:  'text',
	8:  'comment',
	9:  'document',
	10: 'doctype',
	11: 'fragment'
};

export function toType(node) {
	return types[node.nodeType];
}

// Deprecated
export { toType as type };


/**
isNode(node)
Returns `true` if `node` is a node. Duck typing is fine.
**/

export function isNode(node) {
	return typeof node === 'object' && !!node.nodeType;
}

/**
isElementNode(node)
Returns `true` if `node` is an element node.
**/

export function isElementNode(node) {
	return node.nodeType === 1;
}

/**
isTextNode(node)
Returns `true` if `node` is a text node.
**/

export function isTextNode(node) {
	return node.nodeType === 3;
}

/**
isCommentNode(node)
Returns `true` if `node` is a comment.
**/

export function isCommentNode(node) {
	return node.nodeType === 8;
}

/**
isFragmentNode(node)

Returns `true` if `node` is a fragment.
**/

export function isFragmentNode(node) {
	return node.nodeType === 11;
}

/** 
isDocumentLink(node)
**/

export function isDocumentLink(link) {
	return link.origin === window.location.origin
		// IE gives us link.pathname without a leading slash, add one before comparing
		&& prefixSlash(link.pathname) === window.location.pathname;
}


// Links

function prefixSlash(str) {
	// Prefixes a slash when there is not an existing one
	return (/^\//.test(str) ? '' : '/') + str ;
}

/**
isInternalLink(node)
Returns `true` if the `href` of `node` points to a resource on the same domain
as the current document.
**/


export function isInternalLink(node) {
	var location = window.location;

		// IE does not give us a .hostname for links to
		// xxx.xxx.xxx.xxx URLs. file:// URLs don't have a hostname
		// anywhere. This logic is not foolproof, it will let through
		// links to different protocols for example
	return (!node.hostname ||
		// IE gives us the port on node.host, even where it is not
		// specified. Use node.hostname
		location.hostname === node.hostname) &&
		// IE gives us node.pathname without a leading slash, so
		// add one before comparing
		location.pathname === prefixSlash(node.pathname);
}
