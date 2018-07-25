// dom.locateable
//
// Extends the default behaviour of events for the .tip class.

import { by, get, exponentialOut as expOut, noop } from '../../fn/fn.js';
import { animate, default as dom, box, offset, events, matches, query } from '../dom.js';
import './dom-activate.js';

const selector = ".locateable, [locateable]";
const match = matches(selector);
const on    = events.on;

// Time after scroll event to consider the document is scrolling
const idleTime = 90;

// Duration and easing of scroll animation
const scrollDuration  = 0.8;
const scrollTransform = expOut(6);

// Time of latest scroll event
let scrollTime = 0;
let activeNode;
let cancel = noop;

function activate(e) {
    if (!e.default) { return; }

    var target = e.target;
    if (!match(target)) { return; }

    // If node is already active, ignore
    if (target === activeNode) { return; }

    if (activeNode) {
        if (target === activeNode) {
            return;
        }

        cancel();
        //scrollTime = e.timeStamp;
        dom.trigger('dom-deactivate', activeNode);
    }

    var t = e.timeStamp;
    var coords, safeTop;

    // Heuristic for whether we are currently actively scrolling. Checks:
    // Is scroll currently being animated OR
    // was the last scroll event ages ago ?
    // TODO: test on iOS
    if (scrollTime > t || t > scrollTime + idleTime) {
        coords     = offset(dom.view, target);
        safeTop    = dom.safe.top;
        scrollTime = t + scrollDuration * 1000;
        cancel     = animate(scrollDuration, scrollTransform, 'scrollTop', dom.view, coords[1] - safeTop);
    }

    e.default();
    activeNode = target;
}

function deactivate(e) {
    if (!e.default) { return; }

    var target = e.target;

    if (!match(target)) { return; }

    e.default();

    // If node is already active, ignore
    if (target === activeNode) {
        activeNode = undefined;
    }
}

function update() {
    var locateables = query(selector, document);
    var boxes       = locateables.map(box).sort(by(get('top')));
    var winBox      = box(window);

    var n = -1;
    while (boxes[++n]) {
        // Stop on locateable lower than the break
        if (boxes[n].top > winBox.height / 2) {
            break;
        }
    }
    --n;

    if (n < 0) { return; }
    if (n >= boxes.length) { return; }

    var node = locateables[n];

    if (activeNode) {
        if (node === activeNode) {
            return;
        }

        dom.trigger('dom-deactivate', activeNode);
    }

    dom.trigger('dom-activate', node);
}

function scroll(e) {
    // If scrollTime is in the future we are currently animating scroll,
    // best do nothing
    if (scrollTime >= e.timeStamp) { return; }
    scrollTime = e.timeStamp;
    update();
}

on(document, 'dom-activate', activate);
on(document, 'dom-deactivate', deactivate);
on(window, 'scroll', scroll);
update();

dom.activeMatchers.push(match);
