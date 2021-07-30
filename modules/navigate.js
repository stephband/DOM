
import { trigger } from './trigger.js';
import log from './log.js';

const location = window.location;

function triggerNavigate() {
    trigger('dom-navigate', window);
}

function stripHash(hash) {
    return hash.replace(/^#/, '');
}

export default function navigate(url, state = null, scroll = false) {
    // Coerce url string to URL object
    url = typeof url === 'string' ?
        /^https?\:\/\//.test(url) ?
            new URL(url) :
            new URL(url, location.href) :
        url ;

    // If not same origin navigate away from this site
    if (url.origin !== location.origin) {
        window.location.href = url;
    }

    // Make state conform to JSON serialisation - allows state to be set
    // from objects that contain functions
    const json = JSON.stringify(state);
    const statechange = json !== JSON.stringify(history.state);

    // If nothing has changed get on oor bike
    if (url.href === location.href && !statechange) {
        return;
    }

    const hash = location.hash;
    const id = stripHash(url.hash);

    log('navigate()', url,
        /*(url.pathname !== location.pathname ? 'path: "' + url.pathname + '", ' : '') +
        (url.search !== location.search ? 'params: "' + url.search + '", ' : '') + 
        (url.hash !== location.hash ? 'hash: "' + url.hash + '", ' : '') + */
        (state ? 'state: ' + json : '') 
    );

    // If only the hash has changed and state is null and scroll is true, 
    // employ location.hash to navigate, giving us automatic scroll
    if (
        url.pathname === location.pathname 
        && url.search === location.search 
        && !statechange
        && id
        && url.hash !== hash
        && scroll
    ) {
        location.hash = id;
        return;
    }

    const oldhref = location.href;
    const href = url.pathname + url.search + (id ? url.hash : '');
    state = json ? JSON.parse(json) : state ;
    history.pushState(state, document.title, href);

    // Force :target selector to update when there is a new #identifier
    if (url.hash !== hash) {
        // Move forward to the old url and back to the current location, causing  
        // :target selector to update and a popstate event.
        history.pushState(state, document.title, oldhref);
        history.back();
    }

    // Where no popstate is scheduled we nonetheless want to notify 
    // navigation change so simulate an event and pass to distributor, (and 
    // mebbe make it async to echo the behaviour of a real popstate event?)
    else {
        //Promise.resolve().then(function() {
        const result = triggerNavigate();

        // If a handler has returned false that's a signal that we don't
        // want the navigate to be handled by history
        if (result !== undefined && !result) {
            window.location.href = url;
        }
        //});
    }
}

// Listen to load and popstate (and hashchange?) events to notify when 
// navigation has occured
window.addEventListener('popstate', triggerNavigate);
window.addEventListener('DOMContentLoaded', triggerNavigate);

// Clean up empty hash URLs
window.addEventListener('hashchange', function(e) {
    /*
    A `hashchange` is received when:
    - navigation via browser buttons when the hash changes
    - navigation via typing a new hash in the URL bar
    - navigation via history.back() and .forward() when the hash changes
    - location.hash is set to something other than its current value
    */

    // Detect navigations to # and silently remove the # from the url
    if (stripHash(location.hash) === '') {
        history.replaceState(history.state, document.title, location.href.replace(/#$/, ''));
    }
});
