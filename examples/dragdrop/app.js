(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

var fingerprint = require('./lib/fingerprint.js');
var pad = require('./lib/pad.js');
var getRandomValue = require('./lib/getRandomValue.js');

var c = 0,
  blockSize = 4,
  base = 36,
  discreteValues = Math.pow(base, blockSize);

function randomBlock () {
  return pad((getRandomValue() *
    discreteValues << 0)
    .toString(base), blockSize);
}

function safeCounter () {
  c = c < discreteValues ? c : 0;
  c++; // this is not subliminal
  return c - 1;
}

function cuid () {
  // Starting with a lowercase letter makes
  // it HTML element ID friendly.
  var letter = 'c', // hard-coded allows for sequential access

    // timestamp
    // warning: this exposes the exact date and time
    // that the uid was created.
    timestamp = (new Date().getTime()).toString(base),

    // Prevent same-machine collisions.
    counter = pad(safeCounter().toString(base), blockSize),

    // A few chars to generate distinct ids for different
    // clients (so different computers are far less
    // likely to generate the same id)
    print = fingerprint(),

    // Grab some more chars from Math.random()
    random = randomBlock() + randomBlock();

  return letter + timestamp + counter + print + random;
}

cuid.slug = function slug () {
  var date = new Date().getTime().toString(36),
    counter = safeCounter().toString(36).slice(-4),
    print = fingerprint().slice(0, 1) +
      fingerprint().slice(-1),
    random = randomBlock().slice(-2);

  return date.slice(-2) +
    counter + print + random;
};

cuid.isCuid = function isCuid (stringToCheck) {
  if (typeof stringToCheck !== 'string') return false;
  if (stringToCheck.startsWith('c')) return true;
  return false;
};

cuid.isSlug = function isSlug (stringToCheck) {
  if (typeof stringToCheck !== 'string') return false;
  var stringLength = stringToCheck.length;
  if (stringLength >= 7 && stringLength <= 10) return true;
  return false;
};

cuid.fingerprint = fingerprint;

module.exports = cuid;

},{"./lib/fingerprint.js":2,"./lib/getRandomValue.js":3,"./lib/pad.js":4}],2:[function(require,module,exports){
var pad = require('./pad.js');

var env = typeof window === 'object' ? window : self;
var globalCount = Object.keys(env).length;
var mimeTypesLength = navigator.mimeTypes ? navigator.mimeTypes.length : 0;
var clientId = pad((mimeTypesLength +
  navigator.userAgent.length).toString(36) +
  globalCount.toString(36), 4);

module.exports = function fingerprint () {
  return clientId;
};

},{"./pad.js":4}],3:[function(require,module,exports){

var getRandomValue;

var crypto = typeof window !== 'undefined' &&
  (window.crypto || window.msCrypto) ||
  typeof self !== 'undefined' &&
  self.crypto;

if (crypto) {
    var lim = Math.pow(2, 32) - 1;
    getRandomValue = function () {
        return Math.abs(crypto.getRandomValues(new Uint32Array(1))[0] / lim);
    };
} else {
    getRandomValue = Math.random;
}

module.exports = getRandomValue;

},{}],4:[function(require,module,exports){
module.exports = function pad (num, size) {
  var s = '000000000' + num;
  return s.substr(s.length - size);
};

},{}],5:[function(require,module,exports){
// This file can be required in Browserify and Node.js for automatic polyfill
// To use it:  require('es6-promise/auto');
'use strict';
module.exports = require('./').polyfill();

},{"./":6}],6:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    var then$$1 = void 0;
    try {
      then$$1 = value.then;
    } catch (error) {
      reject(promise, error);
      return;
    }
    handleMaybeThenable(promise, value, then$$1);
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = true;

  if (hasCallback) {
    try {
      value = callback(detail);
    } catch (e) {
      succeeded = false;
      error = e;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (succeeded === false) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = void 0;
      var error = void 0;
      var didError = false;
      try {
        _then = entry.then;
      } catch (e) {
        didError = true;
        error = e;
      }

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        if (didError) {
          reject(promise, error);
        } else {
          handleMaybeThenable(promise, entry, _then);
        }
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));





}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":13}],7:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var defineProperty = Object.defineProperty;
var gOPD = Object.getOwnPropertyDescriptor;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

// If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
var setProperty = function setProperty(target, options) {
	if (defineProperty && options.name === '__proto__') {
		defineProperty(target, options.name, {
			enumerable: true,
			configurable: true,
			value: options.newValue,
			writable: true
		});
	} else {
		target[options.name] = options.newValue;
	}
};

// Return undefined instead of __proto__ if '__proto__' is not an own property
var getProperty = function getProperty(obj, name) {
	if (name === '__proto__') {
		if (!hasOwn.call(obj, name)) {
			return void 0;
		} else if (gOPD) {
			// In early versions of node, obj['__proto__'] is buggy when obj has
			// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
			return gOPD(obj, name).value;
		}
	}

	return obj[name];
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = getProperty(target, name);
				copy = getProperty(options, name);

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						setProperty(target, { name: name, newValue: copy });
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};

},{}],8:[function(require,module,exports){
(function (global){
/*
 *  base64.js
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */
;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? module.exports = factory(global)
        : typeof define === 'function' && define.amd
        ? define(factory) : factory(global)
}((
    typeof self !== 'undefined' ? self
        : typeof window !== 'undefined' ? window
        : typeof global !== 'undefined' ? global
: this
), function(global) {
    'use strict';
    // existing version for noConflict()
    global = global || {};
    var _Base64 = global.Base64;
    var version = "2.5.2";
    // if node.js and NOT React Native, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        try {
            buffer = eval("require('buffer').Buffer");
        } catch (err) {
            buffer = undefined;
        }
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = function(u) {
        var isUint8Array = Object.prototype.toString.call(u) === '[object Uint8Array]';
        return isUint8Array ? u.toString('base64')
            : btoa(utob(String(u)));
    }
    var encode = function(u, urisafe) {
        return !urisafe
            ? _encode(u)
            : _encode(String(u)).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var _atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a){
        return a.replace(/\S{1,4}/g, cb_decode);
    };
    var atob = function(a) {
        return _atob(String(a).replace(/[^A-Za-z0-9\+\/]/g, ''));
    };
    var _decode = buffer ?
        buffer.from && Uint8Array && buffer.from !== Uint8Array.from
        ? function(a) {
            return (a.constructor === buffer.constructor
                    ? a : buffer.from(a, 'base64')).toString();
        }
        : function(a) {
            return (a.constructor === buffer.constructor
                    ? a : new buffer(a, 'base64')).toString();
        }
        : function(a) { return btou(_atob(a)) };
    var decode = function(a){
        return _decode(
            String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict,
        __buffer__: buffer
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    //
    // export Base64 to the namespace
    //
    if (global['Meteor']) { // Meteor.js
        Base64 = global.Base64;
    }
    // module.exports and AMD are mutually exclusive.
    // module.exports has precedence.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.Base64 = global.Base64;
    }
    else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function(){ return global.Base64 });
    }
    // that's it!
    return {Base64: global.Base64}
}));


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = throttle;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],10:[function(require,module,exports){
var wildcard = require('wildcard');
var reMimePartSplit = /[\/\+\.]/;

/**
  # mime-match

  A simple function to checker whether a target mime type matches a mime-type
  pattern (e.g. image/jpeg matches image/jpeg OR image/*).

  ## Example Usage

  <<< example.js

**/
module.exports = function(target, pattern) {
  function test(pattern) {
    var result = wildcard(pattern, target, reMimePartSplit);

    // ensure that we have a valid mime type (should have two parts)
    return result && result.length >= 2;
  }

  return pattern ? test(pattern.split(';')[0]) : test;
};

},{"wildcard":29}],11:[function(require,module,exports){
/**
* Create an event emitter with namespaces
* @name createNamespaceEmitter
* @example
* var emitter = require('./index')()
*
* emitter.on('*', function () {
*   console.log('all events emitted', this.event)
* })
*
* emitter.on('example', function () {
*   console.log('example event emitted')
* })
*/
module.exports = function createNamespaceEmitter () {
  var emitter = {}
  var _fns = emitter._fns = {}

  /**
  * Emit an event. Optionally namespace the event. Handlers are fired in the order in which they were added with exact matches taking precedence. Separate the namespace and event with a `:`
  * @name emit
  * @param {String} event – the name of the event, with optional namespace
  * @param {...*} data – up to 6 arguments that are passed to the event listener
  * @example
  * emitter.emit('example')
  * emitter.emit('demo:test')
  * emitter.emit('data', { example: true}, 'a string', 1)
  */
  emitter.emit = function emit (event, arg1, arg2, arg3, arg4, arg5, arg6) {
    var toEmit = getListeners(event)

    if (toEmit.length) {
      emitAll(event, toEmit, [arg1, arg2, arg3, arg4, arg5, arg6])
    }
  }

  /**
  * Create en event listener.
  * @name on
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.on('example', function () {})
  * emitter.on('demo', function () {})
  */
  emitter.on = function on (event, fn) {
    if (!_fns[event]) {
      _fns[event] = []
    }

    _fns[event].push(fn)
  }

  /**
  * Create en event listener that fires once.
  * @name once
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.once('example', function () {})
  * emitter.once('demo', function () {})
  */
  emitter.once = function once (event, fn) {
    function one () {
      fn.apply(this, arguments)
      emitter.off(event, one)
    }
    this.on(event, one)
  }

  /**
  * Stop listening to an event. Stop all listeners on an event by only passing the event name. Stop a single listener by passing that event handler as a callback.
  * You must be explicit about what will be unsubscribed: `emitter.off('demo')` will unsubscribe an `emitter.on('demo')` listener,
  * `emitter.off('demo:example')` will unsubscribe an `emitter.on('demo:example')` listener
  * @name off
  * @param {String} event
  * @param {Function} [fn] – the specific handler
  * @example
  * emitter.off('example')
  * emitter.off('demo', function () {})
  */
  emitter.off = function off (event, fn) {
    var keep = []

    if (event && fn) {
      var fns = this._fns[event]
      var i = 0
      var l = fns ? fns.length : 0

      for (i; i < l; i++) {
        if (fns[i] !== fn) {
          keep.push(fns[i])
        }
      }
    }

    keep.length ? this._fns[event] = keep : delete this._fns[event]
  }

  function getListeners (e) {
    var out = _fns[e] ? _fns[e] : []
    var idx = e.indexOf(':')
    var args = (idx === -1) ? [e] : [e.substring(0, idx), e.substring(idx + 1)]

    var keys = Object.keys(_fns)
    var i = 0
    var l = keys.length

    for (i; i < l; i++) {
      var key = keys[i]
      if (key === '*') {
        out = out.concat(_fns[key])
      }

      if (args.length === 2 && args[0] === key) {
        out = out.concat(_fns[key])
        break
      }
    }

    return out
  }

  function emitAll (e, fns, args) {
    var i = 0
    var l = fns.length

    for (i; i < l; i++) {
      if (!fns[i]) break
      fns[i].event = e
      fns[i].apply(fns[i], args)
    }
  }

  return emitter
}

},{}],12:[function(require,module,exports){
!function() {
    'use strict';
    function VNode() {}
    function h(nodeName, attributes) {
        var lastSimple, child, simple, i, children = EMPTY_CHILDREN;
        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
        if (attributes && null != attributes.children) {
            if (!stack.length) stack.push(attributes.children);
            delete attributes.children;
        }
        while (stack.length) if ((child = stack.pop()) && void 0 !== child.pop) for (i = child.length; i--; ) stack.push(child[i]); else {
            if ('boolean' == typeof child) child = null;
            if (simple = 'function' != typeof nodeName) if (null == child) child = ''; else if ('number' == typeof child) child = String(child); else if ('string' != typeof child) simple = !1;
            if (simple && lastSimple) children[children.length - 1] += child; else if (children === EMPTY_CHILDREN) children = [ child ]; else children.push(child);
            lastSimple = simple;
        }
        var p = new VNode();
        p.nodeName = nodeName;
        p.children = children;
        p.attributes = null == attributes ? void 0 : attributes;
        p.key = null == attributes ? void 0 : attributes.key;
        if (void 0 !== options.vnode) options.vnode(p);
        return p;
    }
    function extend(obj, props) {
        for (var i in props) obj[i] = props[i];
        return obj;
    }
    function cloneElement(vnode, props) {
        return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    function enqueueRender(component) {
        if (!component.__d && (component.__d = !0) && 1 == items.push(component)) (options.debounceRendering || defer)(rerender);
    }
    function rerender() {
        var p, list = items;
        items = [];
        while (p = list.pop()) if (p.__d) renderComponent(p);
    }
    function isSameNodeType(node, vnode, hydrating) {
        if ('string' == typeof vnode || 'number' == typeof vnode) return void 0 !== node.splitText;
        if ('string' == typeof vnode.nodeName) return !node._componentConstructor && isNamedNode(node, vnode.nodeName); else return hydrating || node._componentConstructor === vnode.nodeName;
    }
    function isNamedNode(node, nodeName) {
        return node.__n === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }
    function getNodeProps(vnode) {
        var props = extend({}, vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (void 0 !== defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function createNode(nodeName, isSvg) {
        var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
        node.__n = nodeName;
        return node;
    }
    function removeNode(node) {
        var parentNode = node.parentNode;
        if (parentNode) parentNode.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
        if ('className' === name) name = 'class';
        if ('key' === name) ; else if ('ref' === name) {
            if (old) old(null);
            if (value) value(node);
        } else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) {
            if (!value || 'string' == typeof value || 'string' == typeof old) node.style.cssText = value || '';
            if (value && 'object' == typeof value) {
                if ('string' != typeof old) for (var i in old) if (!(i in value)) node.style[i] = '';
                for (var i in value) node.style[i] = 'number' == typeof value[i] && !1 === IS_NON_DIMENSIONAL.test(i) ? value[i] + 'px' : value[i];
            }
        } else if ('dangerouslySetInnerHTML' === name) {
            if (value) node.innerHTML = value.__html || '';
        } else if ('o' == name[0] && 'n' == name[1]) {
            var useCapture = name !== (name = name.replace(/Capture$/, ''));
            name = name.toLowerCase().substring(2);
            if (value) {
                if (!old) node.addEventListener(name, eventProxy, useCapture);
            } else node.removeEventListener(name, eventProxy, useCapture);
            (node.__l || (node.__l = {}))[name] = value;
        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
            setProperty(node, name, null == value ? '' : value);
            if (null == value || !1 === value) node.removeAttribute(name);
        } else {
            var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));
            if (null == value || !1 === value) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase()); else node.removeAttribute(name); else if ('function' != typeof value) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value); else node.setAttribute(name, value);
        }
    }
    function setProperty(node, name, value) {
        try {
            node[name] = value;
        } catch (e) {}
    }
    function eventProxy(e) {
        return this.__l[e.type](options.event && options.event(e) || e);
    }
    function flushMounts() {
        var c;
        while (c = mounts.pop()) {
            if (options.afterMount) options.afterMount(c);
            if (c.componentDidMount) c.componentDidMount();
        }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
        if (!diffLevel++) {
            isSvgMode = null != parent && void 0 !== parent.ownerSVGElement;
            hydrating = null != dom && !('__preactattr_' in dom);
        }
        var ret = idiff(dom, vnode, context, mountAll, componentRoot);
        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
        if (!--diffLevel) {
            hydrating = !1;
            if (!componentRoot) flushMounts();
        }
        return ret;
    }
    function idiff(dom, vnode, context, mountAll, componentRoot) {
        var out = dom, prevSvgMode = isSvgMode;
        if (null == vnode || 'boolean' == typeof vnode) vnode = '';
        if ('string' == typeof vnode || 'number' == typeof vnode) {
            if (dom && void 0 !== dom.splitText && dom.parentNode && (!dom._component || componentRoot)) {
                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
            } else {
                out = document.createTextNode(vnode);
                if (dom) {
                    if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                    recollectNodeTree(dom, !0);
                }
            }
            out.__preactattr_ = !0;
            return out;
        }
        var vnodeName = vnode.nodeName;
        if ('function' == typeof vnodeName) return buildComponentFromVNode(dom, vnode, context, mountAll);
        isSvgMode = 'svg' === vnodeName ? !0 : 'foreignObject' === vnodeName ? !1 : isSvgMode;
        vnodeName = String(vnodeName);
        if (!dom || !isNamedNode(dom, vnodeName)) {
            out = createNode(vnodeName, isSvgMode);
            if (dom) {
                while (dom.firstChild) out.appendChild(dom.firstChild);
                if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                recollectNodeTree(dom, !0);
            }
        }
        var fc = out.firstChild, props = out.__preactattr_, vchildren = vnode.children;
        if (null == props) {
            props = out.__preactattr_ = {};
            for (var a = out.attributes, i = a.length; i--; ) props[a[i].name] = a[i].value;
        }
        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && null != fc && void 0 !== fc.splitText && null == fc.nextSibling) {
            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
        } else if (vchildren && vchildren.length || null != fc) innerDiffNode(out, vchildren, context, mountAll, hydrating || null != props.dangerouslySetInnerHTML);
        diffAttributes(out, vnode.attributes, props);
        isSvgMode = prevSvgMode;
        return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
        var j, c, f, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren ? vchildren.length : 0;
        if (0 !== len) for (var i = 0; i < len; i++) {
            var _child = originalChildren[i], props = _child.__preactattr_, key = vlen && props ? _child._component ? _child._component.__k : props.key : null;
            if (null != key) {
                keyedLen++;
                keyed[key] = _child;
            } else if (props || (void 0 !== _child.splitText ? isHydrating ? _child.nodeValue.trim() : !0 : isHydrating)) children[childrenLen++] = _child;
        }
        if (0 !== vlen) for (var i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;
            var key = vchild.key;
            if (null != key) {
                if (keyedLen && void 0 !== keyed[key]) {
                    child = keyed[key];
                    keyed[key] = void 0;
                    keyedLen--;
                }
            } else if (!child && min < childrenLen) for (j = min; j < childrenLen; j++) if (void 0 !== children[j] && isSameNodeType(c = children[j], vchild, isHydrating)) {
                child = c;
                children[j] = void 0;
                if (j === childrenLen - 1) childrenLen--;
                if (j === min) min++;
                break;
            }
            child = idiff(child, vchild, context, mountAll);
            f = originalChildren[i];
            if (child && child !== dom && child !== f) if (null == f) dom.appendChild(child); else if (child === f.nextSibling) removeNode(f); else dom.insertBefore(child, f);
        }
        if (keyedLen) for (var i in keyed) if (void 0 !== keyed[i]) recollectNodeTree(keyed[i], !1);
        while (min <= childrenLen) if (void 0 !== (child = children[childrenLen--])) recollectNodeTree(child, !1);
    }
    function recollectNodeTree(node, unmountOnly) {
        var component = node._component;
        if (component) unmountComponent(component); else {
            if (null != node.__preactattr_ && node.__preactattr_.ref) node.__preactattr_.ref(null);
            if (!1 === unmountOnly || null == node.__preactattr_) removeNode(node);
            removeChildren(node);
        }
    }
    function removeChildren(node) {
        node = node.lastChild;
        while (node) {
            var next = node.previousSibling;
            recollectNodeTree(node, !0);
            node = next;
        }
    }
    function diffAttributes(dom, attrs, old) {
        var name;
        for (name in old) if ((!attrs || null == attrs[name]) && null != old[name]) setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode);
        for (name in attrs) if (!('children' === name || 'innerHTML' === name || name in old && attrs[name] === ('value' === name || 'checked' === name ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    }
    function collectComponent(component) {
        var name = component.constructor.name;
        (components[name] || (components[name] = [])).push(component);
    }
    function createComponent(Ctor, props, context) {
        var inst, list = components[Ctor.name];
        if (Ctor.prototype && Ctor.prototype.render) {
            inst = new Ctor(props, context);
            Component.call(inst, props, context);
        } else {
            inst = new Component(props, context);
            inst.constructor = Ctor;
            inst.render = doRender;
        }
        if (list) for (var i = list.length; i--; ) if (list[i].constructor === Ctor) {
            inst.__b = list[i].__b;
            list.splice(i, 1);
            break;
        }
        return inst;
    }
    function doRender(props, state, context) {
        return this.constructor(props, context);
    }
    function setComponentProps(component, props, opts, context, mountAll) {
        if (!component.__x) {
            component.__x = !0;
            if (component.__r = props.ref) delete props.ref;
            if (component.__k = props.key) delete props.key;
            if (!component.base || mountAll) {
                if (component.componentWillMount) component.componentWillMount();
            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
            if (context && context !== component.context) {
                if (!component.__c) component.__c = component.context;
                component.context = context;
            }
            if (!component.__p) component.__p = component.props;
            component.props = props;
            component.__x = !1;
            if (0 !== opts) if (1 === opts || !1 !== options.syncComponentUpdates || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
            if (component.__r) component.__r(component);
        }
    }
    function renderComponent(component, opts, mountAll, isChild) {
        if (!component.__x) {
            var rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.__p || props, previousState = component.__s || state, previousContext = component.__c || context, isUpdate = component.base, nextBase = component.__b, initialBase = isUpdate || nextBase, initialChildComponent = component._component, skip = !1;
            if (isUpdate) {
                component.props = previousProps;
                component.state = previousState;
                component.context = previousContext;
                if (2 !== opts && component.shouldComponentUpdate && !1 === component.shouldComponentUpdate(props, state, context)) skip = !0; else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
                component.props = props;
                component.state = state;
                component.context = context;
            }
            component.__p = component.__s = component.__c = component.__b = null;
            component.__d = !1;
            if (!skip) {
                rendered = component.render(props, state, context);
                if (component.getChildContext) context = extend(extend({}, context), component.getChildContext());
                var toUnmount, base, childComponent = rendered && rendered.nodeName;
                if ('function' == typeof childComponent) {
                    var childProps = getNodeProps(rendered);
                    inst = initialChildComponent;
                    if (inst && inst.constructor === childComponent && childProps.key == inst.__k) setComponentProps(inst, childProps, 1, context, !1); else {
                        toUnmount = inst;
                        component._component = inst = createComponent(childComponent, childProps, context);
                        inst.__b = inst.__b || nextBase;
                        inst.__u = component;
                        setComponentProps(inst, childProps, 0, context, !1);
                        renderComponent(inst, 1, mountAll, !0);
                    }
                    base = inst.base;
                } else {
                    cbase = initialBase;
                    toUnmount = initialChildComponent;
                    if (toUnmount) cbase = component._component = null;
                    if (initialBase || 1 === opts) {
                        if (cbase) cbase._component = null;
                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
                    }
                }
                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
                    var baseParent = initialBase.parentNode;
                    if (baseParent && base !== baseParent) {
                        baseParent.replaceChild(base, initialBase);
                        if (!toUnmount) {
                            initialBase._component = null;
                            recollectNodeTree(initialBase, !1);
                        }
                    }
                }
                if (toUnmount) unmountComponent(toUnmount);
                component.base = base;
                if (base && !isChild) {
                    var componentRef = component, t = component;
                    while (t = t.__u) (componentRef = t).base = base;
                    base._component = componentRef;
                    base._componentConstructor = componentRef.constructor;
                }
            }
            if (!isUpdate || mountAll) mounts.unshift(component); else if (!skip) {
                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, previousContext);
                if (options.afterUpdate) options.afterUpdate(component);
            }
            if (null != component.__h) while (component.__h.length) component.__h.pop().call(component);
            if (!diffLevel && !isChild) flushMounts();
        }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
        var c = dom && dom._component, originalComponent = c, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
        while (c && !isOwner && (c = c.__u)) isOwner = c.constructor === vnode.nodeName;
        if (c && isOwner && (!mountAll || c._component)) {
            setComponentProps(c, props, 3, context, mountAll);
            dom = c.base;
        } else {
            if (originalComponent && !isDirectOwner) {
                unmountComponent(originalComponent);
                dom = oldDom = null;
            }
            c = createComponent(vnode.nodeName, props, context);
            if (dom && !c.__b) {
                c.__b = dom;
                oldDom = null;
            }
            setComponentProps(c, props, 1, context, mountAll);
            dom = c.base;
            if (oldDom && dom !== oldDom) {
                oldDom._component = null;
                recollectNodeTree(oldDom, !1);
            }
        }
        return dom;
    }
    function unmountComponent(component) {
        if (options.beforeUnmount) options.beforeUnmount(component);
        var base = component.base;
        component.__x = !0;
        if (component.componentWillUnmount) component.componentWillUnmount();
        component.base = null;
        var inner = component._component;
        if (inner) unmountComponent(inner); else if (base) {
            if (base.__preactattr_ && base.__preactattr_.ref) base.__preactattr_.ref(null);
            component.__b = base;
            removeNode(base);
            collectComponent(component);
            removeChildren(base);
        }
        if (component.__r) component.__r(null);
    }
    function Component(props, context) {
        this.__d = !0;
        this.context = context;
        this.props = props;
        this.state = this.state || {};
    }
    function render(vnode, parent, merge) {
        return diff(merge, vnode, {}, !1, parent, !1);
    }
    var options = {};
    var stack = [];
    var EMPTY_CHILDREN = [];
    var defer = 'function' == typeof Promise ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;
    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var items = [];
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = !1;
    var hydrating = !1;
    var components = {};
    extend(Component.prototype, {
        setState: function(state, callback) {
            var s = this.state;
            if (!this.__s) this.__s = extend({}, s);
            extend(s, 'function' == typeof state ? state(s, this.props) : state);
            if (callback) (this.__h = this.__h || []).push(callback);
            enqueueRender(this);
        },
        forceUpdate: function(callback) {
            if (callback) (this.__h = this.__h || []).push(callback);
            renderComponent(this, 2);
        },
        render: function() {}
    });
    var preact = {
        h: h,
        createElement: h,
        cloneElement: cloneElement,
        Component: Component,
        render: render,
        rerender: rerender,
        options: options
    };
    if ('undefined' != typeof module) module.exports = preact; else self.preact = preact;
}();

},{}],13:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],14:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty
  , undef;

/**
 * Decode a URI encoded string.
 *
 * @param {String} input The URI encoded string.
 * @returns {String|Null} The decoded string.
 * @api private
 */
function decode(input) {
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch (e) {
    return null;
  }
}

/**
 * Attempts to encode a given input.
 *
 * @param {String} input The string that needs to be encoded.
 * @returns {String|Null} The encoded string.
 * @api private
 */
function encode(input) {
  try {
    return encodeURIComponent(input);
  } catch (e) {
    return null;
  }
}

/**
 * Simple query string parser.
 *
 * @param {String} query The query string that needs to be parsed.
 * @returns {Object}
 * @api public
 */
function querystring(query) {
  var parser = /([^=?&]+)=?([^&]*)/g
    , result = {}
    , part;

  while (part = parser.exec(query)) {
    var key = decode(part[1])
      , value = decode(part[2]);

    //
    // Prevent overriding of existing properties. This ensures that build-in
    // methods like `toString` or __proto__ are not overriden by malicious
    // querystrings.
    //
    // In the case if failed decoding, we want to omit the key/value pairs
    // from the result.
    //
    if (key === null || value === null || key in result) continue;
    result[key] = value;
  }

  return result;
}

/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @param {String} prefix Optional prefix.
 * @returns {String}
 * @api public
 */
function querystringify(obj, prefix) {
  prefix = prefix || '';

  var pairs = []
    , value
    , key;

  //
  // Optionally prefix with a '?' if needed
  //
  if ('string' !== typeof prefix) prefix = '?';

  for (key in obj) {
    if (has.call(obj, key)) {
      value = obj[key];

      //
      // Edge cases where we actually want to encode the value to an empty
      // string instead of the stringified value.
      //
      if (!value && (value === null || value === undef || isNaN(value))) {
        value = '';
      }

      key = encodeURIComponent(key);
      value = encodeURIComponent(value);

      //
      // If we failed to encode the strings, we should bail out as we don't
      // want to add invalid strings to the query.
      //
      if (key === null || value === null) continue;
      pairs.push(key +'='+ value);
    }
  }

  return pairs.length ? prefix + pairs.join('&') : '';
}

//
// Expose the module.
//
exports.stringify = querystringify;
exports.parse = querystring;

},{}],15:[function(require,module,exports){
'use strict';

/**
 * Check if we're required to add a port number.
 *
 * @see https://url.spec.whatwg.org/#default-port
 * @param {Number|String} port Port number we need to check
 * @param {String} protocol Protocol we need to check against.
 * @returns {Boolean} Is it a default port for the given protocol
 * @api private
 */
module.exports = function required(port, protocol) {
  protocol = protocol.split(':')[0];
  port = +port;

  if (!port) return false;

  switch (protocol) {
    case 'http':
    case 'ws':
    return port !== 80;

    case 'https':
    case 'wss':
    return port !== 443;

    case 'ftp':
    return port !== 21;

    case 'gopher':
    return port !== 70;

    case 'file':
    return false;
  }

  return port !== 0;
};

},{}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fingerprint;

var _isReactNative = require("./isReactNative");

var _isReactNative2 = _interopRequireDefault(_isReactNative);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Generate a fingerprint for a file which will be used the store the endpoint
 *
 * @param {File} file
 * @param {Object} options
 * @param {Function} callback
 */
function fingerprint(file, options, callback) {
  if ((0, _isReactNative2.default)()) {
    return callback(null, reactNativeFingerprint(file, options));
  }

  return callback(null, ["tus-br", file.name, file.type, file.size, file.lastModified, options.endpoint].join("-"));
}

function reactNativeFingerprint(file, options) {
  var exifHash = file.exif ? hashCode(JSON.stringify(file.exif)) : "noexif";
  return ["tus-rn", file.name || "noname", file.size || "nosize", exifHash, options.endpoint].join("/");
}

function hashCode(str) {
  // from https://stackoverflow.com/a/8831937/151666
  var hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
},{"./isReactNative":18}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var isCordova = function isCordova() {
  return typeof window != "undefined" && (typeof window.PhoneGap != "undefined" || typeof window.Cordova != "undefined" || typeof window.cordova != "undefined");
};

exports.default = isCordova;
},{}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var isReactNative = function isReactNative() {
  return typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
};

exports.default = isReactNative;
},{}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * readAsByteArray converts a File object to a Uint8Array.
 * This function is only used on the Apache Cordova platform.
 * See https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html#read-a-file
 */
function readAsByteArray(chunk, callback) {
  var reader = new FileReader();
  reader.onload = function () {
    callback(null, new Uint8Array(reader.result));
  };
  reader.onerror = function (err) {
    callback(err);
  };
  reader.readAsArrayBuffer(chunk);
}

exports.default = readAsByteArray;
},{}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.newRequest = newRequest;
exports.resolveUrl = resolveUrl;

var _urlParse = require("url-parse");

var _urlParse2 = _interopRequireDefault(_urlParse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function newRequest() {
  return new window.XMLHttpRequest();
} /* global window */
function resolveUrl(origin, link) {
  return new _urlParse2.default(link, origin).toString();
}
},{"url-parse":27}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getSource = getSource;

var _isReactNative = require("./isReactNative");

var _isReactNative2 = _interopRequireDefault(_isReactNative);

var _uriToBlob = require("./uriToBlob");

var _uriToBlob2 = _interopRequireDefault(_uriToBlob);

var _isCordova = require("./isCordova");

var _isCordova2 = _interopRequireDefault(_isCordova);

var _readAsByteArray = require("./readAsByteArray");

var _readAsByteArray2 = _interopRequireDefault(_readAsByteArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileSource = function () {
  function FileSource(file) {
    _classCallCheck(this, FileSource);

    this._file = file;
    this.size = file.size;
  }

  _createClass(FileSource, [{
    key: "slice",
    value: function slice(start, end, callback) {
      // In Apache Cordova applications, a File must be resolved using
      // FileReader instances, see
      // https://cordova.apache.org/docs/en/8.x/reference/cordova-plugin-file/index.html#read-a-file
      if ((0, _isCordova2.default)()) {
        (0, _readAsByteArray2.default)(this._file.slice(start, end), function (err, chunk) {
          if (err) return callback(err);

          callback(null, chunk);
        });
        return;
      }

      callback(null, this._file.slice(start, end));
    }
  }, {
    key: "close",
    value: function close() {}
  }]);

  return FileSource;
}();

var StreamSource = function () {
  function StreamSource(reader, chunkSize) {
    _classCallCheck(this, StreamSource);

    this._chunkSize = chunkSize;
    this._buffer = undefined;
    this._bufferOffset = 0;
    this._reader = reader;
    this._done = false;
  }

  _createClass(StreamSource, [{
    key: "slice",
    value: function slice(start, end, callback) {
      if (start < this._bufferOffset) {
        callback(new Error("Requested data is before the reader's current offset"));
        return;
      }

      return this._readUntilEnoughDataOrDone(start, end, callback);
    }
  }, {
    key: "_readUntilEnoughDataOrDone",
    value: function _readUntilEnoughDataOrDone(start, end, callback) {
      var _this = this;

      var hasEnoughData = end <= this._bufferOffset + len(this._buffer);
      if (this._done || hasEnoughData) {
        var value = this._getDataFromBuffer(start, end);
        callback(null, value, value == null ? this._done : false);
        return;
      }
      this._reader.read().then(function (_ref) {
        var value = _ref.value,
            done = _ref.done;

        if (done) {
          _this._done = true;
        } else if (_this._buffer === undefined) {
          _this._buffer = value;
        } else {
          _this._buffer = concat(_this._buffer, value);
        }

        _this._readUntilEnoughDataOrDone(start, end, callback);
      }).catch(function (err) {
        callback(new Error("Error during read: " + err));
      });
    }
  }, {
    key: "_getDataFromBuffer",
    value: function _getDataFromBuffer(start, end) {
      // Remove data from buffer before `start`.
      // Data might be reread from the buffer if an upload fails, so we can only
      // safely delete data when it comes *before* what is currently being read.
      if (start > this._bufferOffset) {
        this._buffer = this._buffer.slice(start - this._bufferOffset);
        this._bufferOffset = start;
      }
      // If the buffer is empty after removing old data, all data has been read.
      var hasAllDataBeenRead = len(this._buffer) === 0;
      if (this._done && hasAllDataBeenRead) {
        return null;
      }
      // We already removed data before `start`, so we just return the first
      // chunk from the buffer.
      return this._buffer.slice(0, end - start);
    }
  }, {
    key: "close",
    value: function close() {
      if (this._reader.cancel) {
        this._reader.cancel();
      }
    }
  }]);

  return StreamSource;
}();

function len(blobOrArray) {
  if (blobOrArray === undefined) return 0;
  if (blobOrArray.size !== undefined) return blobOrArray.size;
  return blobOrArray.length;
}

/*
  Typed arrays and blobs don't have a concat method.
  This function helps StreamSource accumulate data to reach chunkSize.
*/
function concat(a, b) {
  if (a.concat) {
    // Is `a` an Array?
    return a.concat(b);
  }
  if (a instanceof Blob) {
    return new Blob([a, b], { type: a.type });
  }
  if (a.set) {
    // Is `a` a typed array?
    var c = new a.constructor(a.length + b.length);
    c.set(a);
    c.set(b, a.length);
    return c;
  }
  throw new Error("Unknown data type");
}

function getSource(input, chunkSize, callback) {
  // In React Native, when user selects a file, instead of a File or Blob,
  // you usually get a file object {} with a uri property that contains
  // a local path to the file. We use XMLHttpRequest to fetch
  // the file blob, before uploading with tus.
  if ((0, _isReactNative2.default)() && input && typeof input.uri !== "undefined") {
    (0, _uriToBlob2.default)(input.uri, function (err, blob) {
      if (err) {
        return callback(new Error("tus: cannot fetch `file.uri` as Blob, make sure the uri is correct and accessible. " + err));
      }
      callback(null, new FileSource(blob));
    });
    return;
  }

  // Since we emulate the Blob type in our tests (not all target browsers
  // support it), we cannot use `instanceof` for testing whether the input value
  // can be handled. Instead, we simply check is the slice() function and the
  // size property are available.
  if (typeof input.slice === "function" && typeof input.size !== "undefined") {
    callback(null, new FileSource(input));
    return;
  }

  if (typeof input.read === "function") {
    chunkSize = +chunkSize;
    if (!isFinite(chunkSize)) {
      callback(new Error("cannot create source for stream without a finite value for the `chunkSize` option"));
      return;
    }
    callback(null, new StreamSource(input, chunkSize));
    return;
  }

  callback(new Error("source object may only be an instance of File, Blob, or Reader in this environment"));
}
},{"./isCordova":17,"./isReactNative":18,"./readAsByteArray":19,"./uriToBlob":23}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getStorage = getStorage;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global window, localStorage */

var hasStorage = false;
try {
  hasStorage = "localStorage" in window;

  // Attempt to store and read entries from the local storage to detect Private
  // Mode on Safari on iOS (see #49)
  var key = "tusSupport";
  localStorage.setItem(key, localStorage.getItem(key));
} catch (e) {
  // If we try to access localStorage inside a sandboxed iframe, a SecurityError
  // is thrown. When in private mode on iOS Safari, a QuotaExceededError is
  // thrown (see #49)
  if (e.code === e.SECURITY_ERR || e.code === e.QUOTA_EXCEEDED_ERR) {
    hasStorage = false;
  } else {
    throw e;
  }
}

var canStoreURLs = exports.canStoreURLs = hasStorage;

var LocalStorage = function () {
  function LocalStorage() {
    _classCallCheck(this, LocalStorage);
  }

  _createClass(LocalStorage, [{
    key: "setItem",
    value: function setItem(key, value, cb) {
      cb(null, localStorage.setItem(key, value));
    }
  }, {
    key: "getItem",
    value: function getItem(key, cb) {
      cb(null, localStorage.getItem(key));
    }
  }, {
    key: "removeItem",
    value: function removeItem(key, cb) {
      cb(null, localStorage.removeItem(key));
    }
  }]);

  return LocalStorage;
}();

function getStorage() {
  return hasStorage ? new LocalStorage() : null;
}
},{}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * uriToBlob resolves a URI to a Blob object. This is used for
 * React Native to retrieve a file (identified by a file://
 * URI) as a blob.
 */
function uriToBlob(uri, done) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = "blob";
  xhr.onload = function () {
    var blob = xhr.response;
    done(null, blob);
  };
  xhr.onerror = function (err) {
    done(err);
  };
  xhr.open("GET", uri);
  xhr.send();
}

exports.default = uriToBlob;
},{}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DetailedError = function (_Error) {
  _inherits(DetailedError, _Error);

  function DetailedError(error) {
    var causingErr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var xhr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, DetailedError);

    var _this = _possibleConstructorReturn(this, (DetailedError.__proto__ || Object.getPrototypeOf(DetailedError)).call(this, error.message));

    _this.originalRequest = xhr;
    _this.causingError = causingErr;

    var message = error.message;
    if (causingErr != null) {
      message += ", caused by " + causingErr.toString();
    }
    if (xhr != null) {
      message += ", originated from request (response code: " + xhr.status + ", response text: " + xhr.responseText + ")";
    }
    _this.message = message;
    return _this;
  }

  return DetailedError;
}(Error);

exports.default = DetailedError;
},{}],25:[function(require,module,exports){
"use strict";

var _upload = require("./upload");

var _upload2 = _interopRequireDefault(_upload);

var _storage = require("./node/storage");

var storage = _interopRequireWildcard(_storage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global window */
var defaultOptions = _upload2.default.defaultOptions;


var moduleExport = {
  Upload: _upload2.default,
  canStoreURLs: storage.canStoreURLs,
  defaultOptions: defaultOptions
};

if (typeof window !== "undefined") {
  // Browser environment using XMLHttpRequest
  var _window = window,
      XMLHttpRequest = _window.XMLHttpRequest,
      Blob = _window.Blob;


  moduleExport.isSupported = XMLHttpRequest && Blob && typeof Blob.prototype.slice === "function";
} else {
  // Node.js environment using http module
  moduleExport.isSupported = true;
  // make FileStorage module available as it will not be set by default.
  moduleExport.FileStorage = storage.FileStorage;
}

// The usage of the commonjs exporting syntax instead of the new ECMAScript
// one is actually inteded and prevents weird behaviour if we are trying to
// import this module in another module using Babel.
module.exports = moduleExport;
},{"./node/storage":22,"./upload":26}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window */


// We import the files used inside the Node environment which are rewritten
// for browsers using the rules defined in the package.json


var _error = require("./error");

var _error2 = _interopRequireDefault(_error);

var _extend = require("extend");

var _extend2 = _interopRequireDefault(_extend);

var _jsBase = require("js-base64");

var _request = require("./node/request");

var _source = require("./node/source");

var _storage = require("./node/storage");

var _fingerprint = require("./node/fingerprint");

var _fingerprint2 = _interopRequireDefault(_fingerprint);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultOptions = {
  endpoint: null,
  fingerprint: _fingerprint2.default,
  resume: true,
  onProgress: null,
  onChunkComplete: null,
  onSuccess: null,
  onError: null,
  headers: {},
  chunkSize: Infinity,
  withCredentials: false,
  uploadUrl: null,
  uploadSize: null,
  overridePatchMethod: false,
  retryDelays: null,
  removeFingerprintOnSuccess: false,
  uploadLengthDeferred: false,
  urlStorage: null,
  fileReader: null,
  uploadDataDuringCreation: false
};

var Upload = function () {
  function Upload(file, options) {
    _classCallCheck(this, Upload);

    this.options = (0, _extend2.default)(true, {}, defaultOptions, options);

    // The storage module used to store URLs
    this._storage = this.options.urlStorage;

    // The underlying File/Blob object
    this.file = file;

    // The URL against which the file will be uploaded
    this.url = null;

    // The underlying XHR object for the current PATCH request
    this._xhr = null;

    // The fingerpinrt for the current file (set after start())
    this._fingerprint = null;

    // The offset used in the current PATCH request
    this._offset = null;

    // True if the current PATCH request has been aborted
    this._aborted = false;

    // The file's size in bytes
    this._size = null;

    // The Source object which will wrap around the given file and provides us
    // with a unified interface for getting its size and slice chunks from its
    // content allowing us to easily handle Files, Blobs, Buffers and Streams.
    this._source = null;

    // The current count of attempts which have been made. Null indicates none.
    this._retryAttempt = 0;

    // The timeout's ID which is used to delay the next retry
    this._retryTimeout = null;

    // The offset of the remote upload before the latest attempt was started.
    this._offsetBeforeRetry = 0;
  }

  _createClass(Upload, [{
    key: "start",
    value: function start() {
      var _this = this;

      var file = this.file;

      if (!file) {
        this._emitError(new Error("tus: no file or stream to upload provided"));
        return;
      }

      if (!this.options.endpoint && !this.options.uploadUrl) {
        this._emitError(new Error("tus: neither an endpoint or an upload URL is provided"));
        return;
      }

      if (this.options.resume && this._storage == null) {
        this._storage = (0, _storage.getStorage)();
      }

      if (this._source) {
        this._start(this._source);
      } else {
        var fileReader = this.options.fileReader || _source.getSource;
        fileReader(file, this.options.chunkSize, function (err, source) {
          if (err) {
            _this._emitError(err);
            return;
          }

          _this._source = source;
          _this._start(source);
        });
      }
    }
  }, {
    key: "_start",
    value: function _start(source) {
      var _this2 = this;

      var file = this.file;

      // First, we look at the uploadLengthDeferred option.
      // Next, we check if the caller has supplied a manual upload size.
      // Finally, we try to use the calculated size from the source object.
      if (this.options.uploadLengthDeferred) {
        this._size = null;
      } else if (this.options.uploadSize != null) {
        this._size = +this.options.uploadSize;
        if (isNaN(this._size)) {
          this._emitError(new Error("tus: cannot convert `uploadSize` option into a number"));
          return;
        }
      } else {
        this._size = source.size;
        if (this._size == null) {
          this._emitError(new Error("tus: cannot automatically derive upload's size from input and must be specified manually using the `uploadSize` option"));
          return;
        }
      }

      var retryDelays = this.options.retryDelays;
      if (retryDelays != null) {
        if (Object.prototype.toString.call(retryDelays) !== "[object Array]") {
          this._emitError(new Error("tus: the `retryDelays` option must either be an array or null"));
          return;
        } else {
          var errorCallback = this.options.onError;
          this.options.onError = function (err) {
            // Restore the original error callback which may have been set.
            _this2.options.onError = errorCallback;

            // We will reset the attempt counter if
            // - we were already able to connect to the server (offset != null) and
            // - we were able to upload a small chunk of data to the server
            var shouldResetDelays = _this2._offset != null && _this2._offset > _this2._offsetBeforeRetry;
            if (shouldResetDelays) {
              _this2._retryAttempt = 0;
            }

            var isOnline = true;
            if (typeof window !== "undefined" && "navigator" in window && window.navigator.onLine === false) {
              isOnline = false;
            }

            // We only attempt a retry if
            // - we didn't exceed the maxium number of retries, yet, and
            // - this error was caused by a request or it's response and
            // - the error is server error (i.e. no a status 4xx or a 409 or 423) and
            // - the browser does not indicate that we are offline
            var status = err.originalRequest ? err.originalRequest.status : 0;
            var isServerError = !inStatusCategory(status, 400) || status === 409 || status === 423;
            var shouldRetry = _this2._retryAttempt < retryDelays.length && err.originalRequest != null && isServerError && isOnline;

            if (!shouldRetry) {
              _this2._emitError(err);
              return;
            }

            var delay = retryDelays[_this2._retryAttempt++];

            _this2._offsetBeforeRetry = _this2._offset;
            _this2.options.uploadUrl = _this2.url;

            _this2._retryTimeout = setTimeout(function () {
              _this2.start();
            }, delay);
          };
        }
      }

      // Reset the aborted flag when the upload is started or else the
      // _startUpload will stop before sending a request if the upload has been
      // aborted previously.
      this._aborted = false;

      // The upload had been started previously and we should reuse this URL.
      if (this.url != null) {
        this._resumeUpload();
        return;
      }

      // A URL has manually been specified, so we try to resume
      if (this.options.uploadUrl != null) {
        this.url = this.options.uploadUrl;
        this._resumeUpload();
        return;
      }

      // Try to find the endpoint for the file in the storage
      if (this._hasStorage()) {
        this.options.fingerprint(file, this.options, function (err, fingerprintValue) {
          if (err) {
            _this2._emitError(err);
            return;
          }

          _this2._fingerprint = fingerprintValue;
          _this2._storage.getItem(_this2._fingerprint, function (err, resumedUrl) {
            if (err) {
              _this2._emitError(err);
              return;
            }

            if (resumedUrl != null) {
              _this2.url = resumedUrl;
              _this2._resumeUpload();
            } else {
              _this2._createUpload();
            }
          });
        });
      } else {
        // An upload has not started for the file yet, so we start a new one
        this._createUpload();
      }
    }
  }, {
    key: "abort",
    value: function abort(shouldTerminate, cb) {
      var _this3 = this;

      if (this._xhr !== null) {
        this._xhr.abort();
        this._source.close();
      }
      this._aborted = true;

      if (this._retryTimeout != null) {
        clearTimeout(this._retryTimeout);
        this._retryTimeout = null;
      }

      cb = cb || function () {};
      if (shouldTerminate) {
        Upload.terminate(this.url, this.options, function (err, xhr) {
          if (err) {
            return cb(err, xhr);
          }

          _this3._hasStorage() ? _this3._storage.removeItem(_this3._fingerprint, cb) : cb();
        });
      } else {
        cb();
      }
    }
  }, {
    key: "_hasStorage",
    value: function _hasStorage() {
      return this.options.resume && this._storage;
    }
  }, {
    key: "_emitXhrError",
    value: function _emitXhrError(xhr, err, causingErr) {
      this._emitError(new _error2.default(err, causingErr, xhr));
    }
  }, {
    key: "_emitError",
    value: function _emitError(err) {
      if (typeof this.options.onError === "function") {
        this.options.onError(err);
      } else {
        throw err;
      }
    }
  }, {
    key: "_emitSuccess",
    value: function _emitSuccess() {
      if (typeof this.options.onSuccess === "function") {
        this.options.onSuccess();
      }
    }

    /**
     * Publishes notification when data has been sent to the server. This
     * data may not have been accepted by the server yet.
     * @param  {number} bytesSent  Number of bytes sent to the server.
     * @param  {number} bytesTotal Total number of bytes to be sent to the server.
     */

  }, {
    key: "_emitProgress",
    value: function _emitProgress(bytesSent, bytesTotal) {
      if (typeof this.options.onProgress === "function") {
        this.options.onProgress(bytesSent, bytesTotal);
      }
    }

    /**
     * Publishes notification when a chunk of data has been sent to the server
     * and accepted by the server.
     * @param  {number} chunkSize  Size of the chunk that was accepted by the
     *                             server.
     * @param  {number} bytesAccepted Total number of bytes that have been
     *                                accepted by the server.
     * @param  {number} bytesTotal Total number of bytes to be sent to the server.
     */

  }, {
    key: "_emitChunkComplete",
    value: function _emitChunkComplete(chunkSize, bytesAccepted, bytesTotal) {
      if (typeof this.options.onChunkComplete === "function") {
        this.options.onChunkComplete(chunkSize, bytesAccepted, bytesTotal);
      }
    }

    /**
     * Set the headers used in the request and the withCredentials property
     * as defined in the options
     *
     * @param {XMLHttpRequest} xhr
     */

  }, {
    key: "_setupXHR",
    value: function _setupXHR(xhr) {
      this._xhr = xhr;
      setupXHR(xhr, this.options);
    }

    /**
     * Create a new upload using the creation extension by sending a POST
     * request to the endpoint. After successful creation the file will be
     * uploaded
     *
     * @api private
     */

  }, {
    key: "_createUpload",
    value: function _createUpload() {
      var _this4 = this;

      if (!this.options.endpoint) {
        this._emitError(new Error("tus: unable to create upload because no endpoint is provided"));
        return;
      }

      var xhr = (0, _request.newRequest)();
      xhr.open("POST", this.options.endpoint, true);

      xhr.onload = function () {
        if (!inStatusCategory(xhr.status, 200)) {
          _this4._emitXhrError(xhr, new Error("tus: unexpected response while creating upload"));
          return;
        }

        var location = xhr.getResponseHeader("Location");
        if (location == null) {
          _this4._emitXhrError(xhr, new Error("tus: invalid or missing Location header"));
          return;
        }

        _this4.url = (0, _request.resolveUrl)(_this4.options.endpoint, location);

        if (_this4._size === 0) {
          // Nothing to upload and file was successfully created
          _this4._emitSuccess();
          _this4._source.close();
          return;
        }

        if (_this4._hasStorage()) {
          _this4._storage.setItem(_this4._fingerprint, _this4.url, function (err) {
            if (err) {
              _this4._emitError(err);
            }
          });
        }

        if (_this4.options.uploadDataDuringCreation) {
          _this4._handleUploadResponse(xhr);
        } else {
          _this4._offset = 0;
          _this4._startUpload();
        }
      };

      xhr.onerror = function (err) {
        _this4._emitXhrError(xhr, new Error("tus: failed to create upload"), err);
      };

      this._setupXHR(xhr);
      if (this.options.uploadLengthDeferred) {
        xhr.setRequestHeader("Upload-Defer-Length", 1);
      } else {
        xhr.setRequestHeader("Upload-Length", this._size);
      }

      // Add metadata if values have been added
      var metadata = encodeMetadata(this.options.metadata);
      if (metadata !== "") {
        xhr.setRequestHeader("Upload-Metadata", metadata);
      }

      if (this.options.uploadDataDuringCreation && !this.options.uploadLengthDeferred) {
        this._offset = 0;
        this._addChunkToRequest(xhr);
      } else {
        xhr.send(null);
      }
    }

    /*
     * Try to resume an existing upload. First a HEAD request will be sent
     * to retrieve the offset. If the request fails a new upload will be
     * created. In the case of a successful response the file will be uploaded.
     *
     * @api private
     */

  }, {
    key: "_resumeUpload",
    value: function _resumeUpload() {
      var _this5 = this;

      var xhr = (0, _request.newRequest)();
      xhr.open("HEAD", this.url, true);

      xhr.onload = function () {
        if (!inStatusCategory(xhr.status, 200)) {
          if (_this5._hasStorage() && inStatusCategory(xhr.status, 400)) {
            // Remove stored fingerprint and corresponding endpoint,
            // on client errors since the file can not be found
            _this5._storage.removeItem(_this5._fingerprint, function (err) {
              if (err) {
                _this5._emitError(err);
              }
            });
          }

          // If the upload is locked (indicated by the 423 Locked status code), we
          // emit an error instead of directly starting a new upload. This way the
          // retry logic can catch the error and will retry the upload. An upload
          // is usually locked for a short period of time and will be available
          // afterwards.
          if (xhr.status === 423) {
            _this5._emitXhrError(xhr, new Error("tus: upload is currently locked; retry later"));
            return;
          }

          if (!_this5.options.endpoint) {
            // Don't attempt to create a new upload if no endpoint is provided.
            _this5._emitXhrError(xhr, new Error("tus: unable to resume upload (new upload cannot be created without an endpoint)"));
            return;
          }

          // Try to create a new upload
          _this5.url = null;
          _this5._createUpload();
          return;
        }

        var offset = parseInt(xhr.getResponseHeader("Upload-Offset"), 10);
        if (isNaN(offset)) {
          _this5._emitXhrError(xhr, new Error("tus: invalid or missing offset value"));
          return;
        }

        var length = parseInt(xhr.getResponseHeader("Upload-Length"), 10);
        if (isNaN(length) && !_this5.options.uploadLengthDeferred) {
          _this5._emitXhrError(xhr, new Error("tus: invalid or missing length value"));
          return;
        }

        // Upload has already been completed and we do not need to send additional
        // data to the server
        if (offset === length) {
          _this5._emitProgress(length, length);
          _this5._emitSuccess();
          return;
        }

        _this5._offset = offset;
        _this5._startUpload();
      };

      xhr.onerror = function (err) {
        _this5._emitXhrError(xhr, new Error("tus: failed to resume upload"), err);
      };

      this._setupXHR(xhr);
      xhr.send(null);
    }

    /**
     * Start uploading the file using PATCH requests. The file will be divided
     * into chunks as specified in the chunkSize option. During the upload
     * the onProgress event handler may be invoked multiple times.
     *
     * @api private
     */

  }, {
    key: "_startUpload",
    value: function _startUpload() {
      var _this6 = this;

      // If the upload has been aborted, we will not send the next PATCH request.
      // This is important if the abort method was called during a callback, such
      // as onChunkComplete or onProgress.
      if (this._aborted) {
        return;
      }

      var xhr = (0, _request.newRequest)();

      // Some browser and servers may not support the PATCH method. For those
      // cases, you can tell tus-js-client to use a POST request with the
      // X-HTTP-Method-Override header for simulating a PATCH request.
      if (this.options.overridePatchMethod) {
        xhr.open("POST", this.url, true);
        xhr.setRequestHeader("X-HTTP-Method-Override", "PATCH");
      } else {
        xhr.open("PATCH", this.url, true);
      }

      xhr.onload = function () {
        if (!inStatusCategory(xhr.status, 200)) {
          _this6._emitXhrError(xhr, new Error("tus: unexpected response while uploading chunk"));
          return;
        }

        _this6._handleUploadResponse(xhr);
      };

      xhr.onerror = function (err) {
        // Don't emit an error if the upload was aborted manually
        if (_this6._aborted) {
          return;
        }

        _this6._emitXhrError(xhr, new Error("tus: failed to upload chunk at offset " + _this6._offset), err);
      };

      this._setupXHR(xhr);

      xhr.setRequestHeader("Upload-Offset", this._offset);
      this._addChunkToRequest(xhr);
    }

    /**
     * _addChunktoRequest reads a chunk from the source and sends it using the
     * supplied XHR object. It will not handle the response.
     */

  }, {
    key: "_addChunkToRequest",
    value: function _addChunkToRequest(xhr) {
      var _this7 = this;

      // Test support for progress events before attaching an event listener
      if ("upload" in xhr) {
        xhr.upload.onprogress = function (e) {
          if (!e.lengthComputable) {
            return;
          }

          _this7._emitProgress(start + e.loaded, _this7._size);
        };
      }

      xhr.setRequestHeader("Content-Type", "application/offset+octet-stream");

      var start = this._offset;
      var end = this._offset + this.options.chunkSize;

      // The specified chunkSize may be Infinity or the calcluated end position
      // may exceed the file's size. In both cases, we limit the end position to
      // the input's total size for simpler calculations and correctness.
      if ((end === Infinity || end > this._size) && !this.options.uploadLengthDeferred) {
        end = this._size;
      }

      this._source.slice(start, end, function (err, value, complete) {
        if (err) {
          _this7._emitError(err);
          return;
        }

        if (_this7.options.uploadLengthDeferred) {
          if (complete) {
            _this7._size = _this7._offset + (value && value.size ? value.size : 0);
            xhr.setRequestHeader("Upload-Length", _this7._size);
          }
        }

        if (value === null) {
          xhr.send();
        } else {
          xhr.send(value);
          _this7._emitProgress(_this7._offset, _this7._size);
        }
      });
    }

    /**
     * _handleUploadResponse is used by requests that haven been sent using _addChunkToRequest
     * and already have received a response.
     */

  }, {
    key: "_handleUploadResponse",
    value: function _handleUploadResponse(xhr) {
      var _this8 = this;

      var offset = parseInt(xhr.getResponseHeader("Upload-Offset"), 10);
      if (isNaN(offset)) {
        this._emitXhrError(xhr, new Error("tus: invalid or missing offset value"));
        return;
      }

      this._emitProgress(offset, this._size);
      this._emitChunkComplete(offset - this._offset, offset, this._size);

      this._offset = offset;

      if (offset == this._size) {
        if (this.options.removeFingerprintOnSuccess && this.options.resume) {
          // Remove stored fingerprint and corresponding endpoint. This causes
          // new upload of the same file must be treated as a different file.
          this._storage.removeItem(this._fingerprint, function (err) {
            if (err) {
              _this8._emitError(err);
            }
          });
        }

        // Yay, finally done :)
        this._emitSuccess();
        this._source.close();
        return;
      }

      this._startUpload();
    }
  }], [{
    key: "terminate",
    value: function terminate(url, options, cb) {
      if (typeof options !== "function" && typeof cb !== "function") {
        throw new Error("tus: a callback function must be specified");
      }

      if (typeof options === "function") {
        cb = options;
        options = {};
      }

      var xhr = (0, _request.newRequest)();
      xhr.open("DELETE", url, true);

      xhr.onload = function () {
        if (xhr.status !== 204) {
          cb(new _error2.default(new Error("tus: unexpected response while terminating upload"), null, xhr));
          return;
        }

        cb();
      };

      xhr.onerror = function (err) {
        cb(new _error2.default(err, new Error("tus: failed to terminate upload"), xhr));
      };

      setupXHR(xhr, options);
      xhr.send(null);
    }
  }]);

  return Upload;
}();

function encodeMetadata(metadata) {
  var encoded = [];

  for (var key in metadata) {
    encoded.push(key + " " + _jsBase.Base64.encode(metadata[key]));
  }

  return encoded.join(",");
}

/**
 * Checks whether a given status is in the range of the expected category.
 * For example, only a status between 200 and 299 will satisfy the category 200.
 *
 * @api private
 */
function inStatusCategory(status, category) {
  return status >= category && status < category + 100;
}

function setupXHR(xhr, options) {
  xhr.setRequestHeader("Tus-Resumable", "1.0.0");
  var headers = options.headers || {};

  for (var name in headers) {
    xhr.setRequestHeader(name, headers[name]);
  }

  xhr.withCredentials = options.withCredentials;
}

Upload.defaultOptions = defaultOptions;

exports.default = Upload;
},{"./error":24,"./node/fingerprint":16,"./node/request":20,"./node/source":21,"./node/storage":22,"extend":7,"js-base64":8}],27:[function(require,module,exports){
(function (global){
'use strict';

var required = require('requires-port')
  , qs = require('querystringify')
  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i
  , whitespace = '[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]'
  , left = new RegExp('^'+ whitespace +'+');

/**
 * Trim a given string.
 *
 * @param {String} str String to trim.
 * @public
 */
function trimLeft(str) {
  return (str ? str : '').toString().replace(left, '');
}

/**
 * These are the parse rules for the URL parser, it informs the parser
 * about:
 *
 * 0. The char it Needs to parse, if it's a string it should be done using
 *    indexOf, RegExp using exec and NaN means set as current value.
 * 1. The property we should set when parsing this value.
 * 2. Indication if it's backwards or forward parsing, when set as number it's
 *    the value of extra chars that should be split off.
 * 3. Inherit from location if non existing in the parser.
 * 4. `toLowerCase` the resulting value.
 */
var rules = [
  ['#', 'hash'],                        // Extract from the back.
  ['?', 'query'],                       // Extract from the back.
  function sanitize(address) {          // Sanitize what is left of the address
    return address.replace('\\', '/');
  },
  ['/', 'pathname'],                    // Extract from the back.
  ['@', 'auth', 1],                     // Extract from the front.
  [NaN, 'host', undefined, 1, 1],       // Set left over value.
  [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
];

/**
 * These properties should not be copied or inherited from. This is only needed
 * for all non blob URL's as a blob URL does not include a hash, only the
 * origin.
 *
 * @type {Object}
 * @private
 */
var ignore = { hash: 1, query: 1 };

/**
 * The location object differs when your code is loaded through a normal page,
 * Worker or through a worker using a blob. And with the blobble begins the
 * trouble as the location object will contain the URL of the blob, not the
 * location of the page where our code is loaded in. The actual origin is
 * encoded in the `pathname` so we can thankfully generate a good "default"
 * location from it so we can generate proper relative URL's again.
 *
 * @param {Object|String} loc Optional default location object.
 * @returns {Object} lolcation object.
 * @public
 */
function lolcation(loc) {
  var globalVar;

  if (typeof window !== 'undefined') globalVar = window;
  else if (typeof global !== 'undefined') globalVar = global;
  else if (typeof self !== 'undefined') globalVar = self;
  else globalVar = {};

  var location = globalVar.location || {};
  loc = loc || location;

  var finaldestination = {}
    , type = typeof loc
    , key;

  if ('blob:' === loc.protocol) {
    finaldestination = new Url(unescape(loc.pathname), {});
  } else if ('string' === type) {
    finaldestination = new Url(loc, {});
    for (key in ignore) delete finaldestination[key];
  } else if ('object' === type) {
    for (key in loc) {
      if (key in ignore) continue;
      finaldestination[key] = loc[key];
    }

    if (finaldestination.slashes === undefined) {
      finaldestination.slashes = slashes.test(loc.href);
    }
  }

  return finaldestination;
}

/**
 * @typedef ProtocolExtract
 * @type Object
 * @property {String} protocol Protocol matched in the URL, in lowercase.
 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
 * @property {String} rest Rest of the URL that is not part of the protocol.
 */

/**
 * Extract protocol information from a URL with/without double slash ("//").
 *
 * @param {String} address URL we want to extract from.
 * @return {ProtocolExtract} Extracted information.
 * @private
 */
function extractProtocol(address) {
  address = trimLeft(address);
  var match = protocolre.exec(address);

  return {
    protocol: match[1] ? match[1].toLowerCase() : '',
    slashes: !!match[2],
    rest: match[3]
  };
}

/**
 * Resolve a relative URL pathname against a base URL pathname.
 *
 * @param {String} relative Pathname of the relative URL.
 * @param {String} base Pathname of the base URL.
 * @return {String} Resolved pathname.
 * @private
 */
function resolve(relative, base) {
  if (relative === '') return base;

  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
    , i = path.length
    , last = path[i - 1]
    , unshift = false
    , up = 0;

  while (i--) {
    if (path[i] === '.') {
      path.splice(i, 1);
    } else if (path[i] === '..') {
      path.splice(i, 1);
      up++;
    } else if (up) {
      if (i === 0) unshift = true;
      path.splice(i, 1);
      up--;
    }
  }

  if (unshift) path.unshift('');
  if (last === '.' || last === '..') path.push('');

  return path.join('/');
}

/**
 * The actual URL instance. Instead of returning an object we've opted-in to
 * create an actual constructor as it's much more memory efficient and
 * faster and it pleases my OCD.
 *
 * It is worth noting that we should not use `URL` as class name to prevent
 * clashes with the global URL instance that got introduced in browsers.
 *
 * @constructor
 * @param {String} address URL we want to parse.
 * @param {Object|String} [location] Location defaults for relative paths.
 * @param {Boolean|Function} [parser] Parser for the query string.
 * @private
 */
function Url(address, location, parser) {
  address = trimLeft(address);

  if (!(this instanceof Url)) {
    return new Url(address, location, parser);
  }

  var relative, extracted, parse, instruction, index, key
    , instructions = rules.slice()
    , type = typeof location
    , url = this
    , i = 0;

  //
  // The following if statements allows this module two have compatibility with
  // 2 different API:
  //
  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
  //    where the boolean indicates that the query string should also be parsed.
  //
  // 2. The `URL` interface of the browser which accepts a URL, object as
  //    arguments. The supplied object will be used as default values / fall-back
  //    for relative paths.
  //
  if ('object' !== type && 'string' !== type) {
    parser = location;
    location = null;
  }

  if (parser && 'function' !== typeof parser) parser = qs.parse;

  location = lolcation(location);

  //
  // Extract protocol information before running the instructions.
  //
  extracted = extractProtocol(address || '');
  relative = !extracted.protocol && !extracted.slashes;
  url.slashes = extracted.slashes || relative && location.slashes;
  url.protocol = extracted.protocol || location.protocol || '';
  address = extracted.rest;

  //
  // When the authority component is absent the URL starts with a path
  // component.
  //
  if (!extracted.slashes) instructions[3] = [/(.*)/, 'pathname'];

  for (; i < instructions.length; i++) {
    instruction = instructions[i];

    if (typeof instruction === 'function') {
      address = instruction(address);
      continue;
    }

    parse = instruction[0];
    key = instruction[1];

    if (parse !== parse) {
      url[key] = address;
    } else if ('string' === typeof parse) {
      if (~(index = address.indexOf(parse))) {
        if ('number' === typeof instruction[2]) {
          url[key] = address.slice(0, index);
          address = address.slice(index + instruction[2]);
        } else {
          url[key] = address.slice(index);
          address = address.slice(0, index);
        }
      }
    } else if ((index = parse.exec(address))) {
      url[key] = index[1];
      address = address.slice(0, index.index);
    }

    url[key] = url[key] || (
      relative && instruction[3] ? location[key] || '' : ''
    );

    //
    // Hostname, host and protocol should be lowercased so they can be used to
    // create a proper `origin`.
    //
    if (instruction[4]) url[key] = url[key].toLowerCase();
  }

  //
  // Also parse the supplied query string in to an object. If we're supplied
  // with a custom parser as function use that instead of the default build-in
  // parser.
  //
  if (parser) url.query = parser(url.query);

  //
  // If the URL is relative, resolve the pathname against the base URL.
  //
  if (
      relative
    && location.slashes
    && url.pathname.charAt(0) !== '/'
    && (url.pathname !== '' || location.pathname !== '')
  ) {
    url.pathname = resolve(url.pathname, location.pathname);
  }

  //
  // We should not add port numbers if they are already the default port number
  // for a given protocol. As the host also contains the port number we're going
  // override it with the hostname which contains no port number.
  //
  if (!required(url.port, url.protocol)) {
    url.host = url.hostname;
    url.port = '';
  }

  //
  // Parse down the `auth` for the username and password.
  //
  url.username = url.password = '';
  if (url.auth) {
    instruction = url.auth.split(':');
    url.username = instruction[0] || '';
    url.password = instruction[1] || '';
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? url.protocol +'//'+ url.host
    : 'null';

  //
  // The href is just the compiled result.
  //
  url.href = url.toString();
}

/**
 * This is convenience method for changing properties in the URL instance to
 * insure that they all propagate correctly.
 *
 * @param {String} part          Property we need to adjust.
 * @param {Mixed} value          The newly assigned value.
 * @param {Boolean|Function} fn  When setting the query, it will be the function
 *                               used to parse the query.
 *                               When setting the protocol, double slash will be
 *                               removed from the final url if it is true.
 * @returns {URL} URL instance for chaining.
 * @public
 */
function set(part, value, fn) {
  var url = this;

  switch (part) {
    case 'query':
      if ('string' === typeof value && value.length) {
        value = (fn || qs.parse)(value);
      }

      url[part] = value;
      break;

    case 'port':
      url[part] = value;

      if (!required(value, url.protocol)) {
        url.host = url.hostname;
        url[part] = '';
      } else if (value) {
        url.host = url.hostname +':'+ value;
      }

      break;

    case 'hostname':
      url[part] = value;

      if (url.port) value += ':'+ url.port;
      url.host = value;
      break;

    case 'host':
      url[part] = value;

      if (/:\d+$/.test(value)) {
        value = value.split(':');
        url.port = value.pop();
        url.hostname = value.join(':');
      } else {
        url.hostname = value;
        url.port = '';
      }

      break;

    case 'protocol':
      url.protocol = value.toLowerCase();
      url.slashes = !fn;
      break;

    case 'pathname':
    case 'hash':
      if (value) {
        var char = part === 'pathname' ? '/' : '#';
        url[part] = value.charAt(0) !== char ? char + value : value;
      } else {
        url[part] = value;
      }
      break;

    default:
      url[part] = value;
  }

  for (var i = 0; i < rules.length; i++) {
    var ins = rules[i];

    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? url.protocol +'//'+ url.host
    : 'null';

  url.href = url.toString();

  return url;
}

/**
 * Transform the properties back in to a valid and full URL string.
 *
 * @param {Function} stringify Optional query stringify function.
 * @returns {String} Compiled version of the URL.
 * @public
 */
function toString(stringify) {
  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

  var query
    , url = this
    , protocol = url.protocol;

  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  var result = protocol + (url.slashes ? '//' : '');

  if (url.username) {
    result += url.username;
    if (url.password) result += ':'+ url.password;
    result += '@';
  }

  result += url.host + url.pathname;

  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

  if (url.hash) result += url.hash;

  return result;
}

Url.prototype = { set: set, toString: toString };

//
// Expose the URL parser and some additional properties that might be useful for
// others or testing.
//
Url.extractProtocol = extractProtocol;
Url.location = lolcation;
Url.trimLeft = trimLeft;
Url.qs = qs;

module.exports = Url;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"querystringify":14,"requires-port":15}],28:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.WHATWGFetch = {})));
}(this, (function (exports) { 'use strict';

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = self.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new exports.DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],29:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  # wildcard

  Very simple wildcard matching, which is designed to provide the same
  functionality that is found in the
  [eve](https://github.com/adobe-webplatform/eve) eventing library.

  ## Usage

  It works with strings:

  <<< examples/strings.js

  Arrays:

  <<< examples/arrays.js

  Objects (matching against keys):

  <<< examples/objects.js

  While the library works in Node, if you are are looking for file-based
  wildcard matching then you should have a look at:

  <https://github.com/isaacs/node-glob>
**/

function WildcardMatcher(text, separator) {
  this.text = text = text || '';
  this.hasWild = ~text.indexOf('*');
  this.separator = separator;
  this.parts = text.split(separator);
}

WildcardMatcher.prototype.match = function(input) {
  var matches = true;
  var parts = this.parts;
  var ii;
  var partsCount = parts.length;
  var testParts;

  if (typeof input == 'string' || input instanceof String) {
    if (!this.hasWild && this.text != input) {
      matches = false;
    } else {
      testParts = (input || '').split(this.separator);
      for (ii = 0; matches && ii < partsCount; ii++) {
        if (parts[ii] === '*')  {
          continue;
        } else if (ii < testParts.length) {
          matches = parts[ii] === testParts[ii];
        } else {
          matches = false;
        }
      }

      // If matches, then return the component parts
      matches = matches && testParts;
    }
  }
  else if (typeof input.splice == 'function') {
    matches = [];

    for (ii = input.length; ii--; ) {
      if (this.match(input[ii])) {
        matches[matches.length] = input[ii];
      }
    }
  }
  else if (typeof input == 'object') {
    matches = {};

    for (var key in input) {
      if (this.match(key)) {
        matches[key] = input[key];
      }
    }
  }

  return matches;
};

module.exports = function(text, test, separator) {
  var matcher = new WildcardMatcher(text, separator || /[\/\.]/);
  if (typeof test != 'undefined') {
    return matcher.match(test);
  }

  return matcher;
};

},{}],30:[function(require,module,exports){
module.exports={
  "name": "@uppy/companion-client",
  "description": "Client library for communication with Companion. Intended for use in Uppy plugins.",
  "version": "1.4.4",
  "license": "MIT",
  "main": "lib/index.js",
  "types": "types/index.d.ts",
  "keywords": [
    "file uploader",
    "uppy",
    "uppy-plugin",
    "companion",
    "provider"
  ],
  "homepage": "https://uppy.io",
  "bugs": {
    "url": "https://github.com/transloadit/uppy/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/transloadit/uppy.git"
  },
  "dependencies": {
    "namespace-emitter": "^2.0.1"
  }
}

},{}],31:[function(require,module,exports){
'use strict';

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var AuthError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(AuthError, _Error);

  function AuthError() {
    var _this;

    _this = _Error.call(this, 'Authorization required') || this;
    _this.name = 'AuthError';
    _this.isAuthError = true;
    return _this;
  }

  return AuthError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

module.exports = AuthError;

},{}],32:[function(require,module,exports){
'use strict';

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var RequestClient = require('./RequestClient');

var tokenStorage = require('./tokenStorage');

var _getName = function _getName(id) {
  return id.split('-').map(function (s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(' ');
};

module.exports = /*#__PURE__*/function (_RequestClient) {
  _inheritsLoose(Provider, _RequestClient);

  function Provider(uppy, opts) {
    var _this;

    _this = _RequestClient.call(this, uppy, opts) || this;
    _this.provider = opts.provider;
    _this.id = _this.provider;
    _this.authProvider = opts.authProvider || _this.provider;
    _this.name = _this.opts.name || _getName(_this.id);
    _this.pluginId = _this.opts.pluginId;
    _this.tokenKey = "companion-" + _this.pluginId + "-auth-token";
    return _this;
  }

  var _proto = Provider.prototype;

  _proto.headers = function headers() {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      _RequestClient.prototype.headers.call(_this2).then(function (headers) {
        _this2.getAuthToken().then(function (token) {
          resolve(_extends({}, headers, {
            'uppy-auth-token': token
          }));
        });
      }).catch(reject);
    });
  };

  _proto.onReceiveResponse = function onReceiveResponse(response) {
    response = _RequestClient.prototype.onReceiveResponse.call(this, response);
    var plugin = this.uppy.getPlugin(this.pluginId);
    var oldAuthenticated = plugin.getPluginState().authenticated;
    var authenticated = oldAuthenticated ? response.status !== 401 : response.status < 400;
    plugin.setPluginState({
      authenticated: authenticated
    });
    return response;
  } // @todo(i.olarewaju) consider whether or not this method should be exposed
  ;

  _proto.setAuthToken = function setAuthToken(token) {
    return this.uppy.getPlugin(this.pluginId).storage.setItem(this.tokenKey, token);
  };

  _proto.getAuthToken = function getAuthToken() {
    return this.uppy.getPlugin(this.pluginId).storage.getItem(this.tokenKey);
  };

  _proto.authUrl = function authUrl() {
    return this.hostname + "/" + this.id + "/connect";
  };

  _proto.fileUrl = function fileUrl(id) {
    return this.hostname + "/" + this.id + "/get/" + id;
  };

  _proto.list = function list(directory) {
    return this.get(this.id + "/list/" + (directory || ''));
  };

  _proto.logout = function logout() {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      _this3.get(_this3.id + "/logout").then(function (res) {
        _this3.uppy.getPlugin(_this3.pluginId).storage.removeItem(_this3.tokenKey).then(function () {
          return resolve(res);
        }).catch(reject);
      }).catch(reject);
    });
  };

  Provider.initPlugin = function initPlugin(plugin, opts, defaultOpts) {
    plugin.type = 'acquirer';
    plugin.files = [];

    if (defaultOpts) {
      plugin.opts = _extends({}, defaultOpts, opts);
    }

    if (opts.serverUrl || opts.serverPattern) {
      throw new Error('`serverUrl` and `serverPattern` have been renamed to `companionUrl` and `companionAllowedHosts` respectively in the 0.30.5 release. Please consult the docs (for example, https://uppy.io/docs/instagram/ for the Instagram plugin) and use the updated options.`');
    }

    if (opts.companionAllowedHosts) {
      var pattern = opts.companionAllowedHosts; // validate companionAllowedHosts param

      if (typeof pattern !== 'string' && !Array.isArray(pattern) && !(pattern instanceof RegExp)) {
        throw new TypeError(plugin.id + ": the option \"companionAllowedHosts\" must be one of string, Array, RegExp");
      }

      plugin.opts.companionAllowedHosts = pattern;
    } else {
      // does not start with https://
      if (/^(?!https?:\/\/).*$/i.test(opts.companionUrl)) {
        plugin.opts.companionAllowedHosts = "https://" + opts.companionUrl.replace(/^\/\//, '');
      } else {
        plugin.opts.companionAllowedHosts = opts.companionUrl;
      }
    }

    plugin.storage = plugin.opts.storage || tokenStorage;
  };

  return Provider;
}(RequestClient);

},{"./RequestClient":33,"./tokenStorage":36}],33:[function(require,module,exports){
'use strict';

var _class, _temp;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var AuthError = require('./AuthError');

var NetworkError = require('./../../utils/lib/NetworkError'); // Remove the trailing slash so we can always safely append /xyz.


function stripSlash(url) {
  return url.replace(/\/$/, '');
}

module.exports = (_temp = _class = /*#__PURE__*/function () {
  function RequestClient(uppy, opts) {
    this.uppy = uppy;
    this.opts = opts;
    this.onReceiveResponse = this.onReceiveResponse.bind(this);
    this.allowedHeaders = ['accept', 'content-type', 'uppy-auth-token'];
    this.preflightDone = false;
  }

  var _proto = RequestClient.prototype;

  _proto.headers = function headers() {
    var userHeaders = this.opts.companionHeaders || this.opts.serverHeaders || {};
    return Promise.resolve(_extends({}, this.defaultHeaders, {}, userHeaders));
  };

  _proto._getPostResponseFunc = function _getPostResponseFunc(skip) {
    var _this = this;

    return function (response) {
      if (!skip) {
        return _this.onReceiveResponse(response);
      }

      return response;
    };
  };

  _proto.onReceiveResponse = function onReceiveResponse(response) {
    var state = this.uppy.getState();
    var companion = state.companion || {};
    var host = this.opts.companionUrl;
    var headers = response.headers; // Store the self-identified domain name for the Companion instance we just hit.

    if (headers.has('i-am') && headers.get('i-am') !== companion[host]) {
      var _extends2;

      this.uppy.setState({
        companion: _extends({}, companion, (_extends2 = {}, _extends2[host] = headers.get('i-am'), _extends2))
      });
    }

    return response;
  };

  _proto._getUrl = function _getUrl(url) {
    if (/^(https?:|)\/\//.test(url)) {
      return url;
    }

    return this.hostname + "/" + url;
  };

  _proto._json = function _json(res) {
    if (res.status === 401) {
      throw new AuthError();
    }

    if (res.status < 200 || res.status > 300) {
      var errMsg = "Failed request with status: " + res.status + ". " + res.statusText;
      return res.json().then(function (errData) {
        errMsg = errData.message ? errMsg + " message: " + errData.message : errMsg;
        errMsg = errData.requestId ? errMsg + " request-Id: " + errData.requestId : errMsg;
        throw new Error(errMsg);
      }).catch(function () {
        throw new Error(errMsg);
      });
    }

    return res.json();
  };

  _proto.preflight = function preflight(path) {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      if (_this2.preflightDone) {
        return resolve(_this2.allowedHeaders.slice());
      }

      fetch(_this2._getUrl(path), {
        method: 'OPTIONS'
      }).then(function (response) {
        if (response.headers.has('access-control-allow-headers')) {
          _this2.allowedHeaders = response.headers.get('access-control-allow-headers').split(',').map(function (headerName) {
            return headerName.trim().toLowerCase();
          });
        }

        _this2.preflightDone = true;
        resolve(_this2.allowedHeaders.slice());
      }).catch(function (err) {
        _this2.uppy.log("[CompanionClient] unable to make preflight request " + err, 'warning');

        _this2.preflightDone = true;
        resolve(_this2.allowedHeaders.slice());
      });
    });
  };

  _proto.preflightAndHeaders = function preflightAndHeaders(path) {
    var _this3 = this;

    return Promise.all([this.preflight(path), this.headers()]).then(function (_ref) {
      var allowedHeaders = _ref[0],
          headers = _ref[1];
      // filter to keep only allowed Headers
      Object.keys(headers).forEach(function (header) {
        if (allowedHeaders.indexOf(header.toLowerCase()) === -1) {
          _this3.uppy.log("[CompanionClient] excluding unallowed header " + header);

          delete headers[header];
        }
      });
      return headers;
    });
  };

  _proto.get = function get(path, skipPostResponse) {
    var _this4 = this;

    return new Promise(function (resolve, reject) {
      _this4.preflightAndHeaders(path).then(function (headers) {
        fetch(_this4._getUrl(path), {
          method: 'get',
          headers: headers,
          credentials: 'same-origin'
        }).catch(function (err) {
          if (err.name === 'AbortError') {
            throw err;
          } else {
            throw new NetworkError(err);
          }
        }).then(_this4._getPostResponseFunc(skipPostResponse)).then(function (res) {
          return _this4._json(res).then(resolve);
        }).catch(function (err) {
          err = err.isAuthError ? err : new Error("Could not get " + _this4._getUrl(path) + ". " + err);
          reject(err);
        });
      }).catch(reject);
    });
  };

  _proto.post = function post(path, data, skipPostResponse) {
    var _this5 = this;

    return new Promise(function (resolve, reject) {
      _this5.preflightAndHeaders(path).then(function (headers) {
        fetch(_this5._getUrl(path), {
          method: 'post',
          headers: headers,
          credentials: 'same-origin',
          body: JSON.stringify(data)
        }).catch(function (err) {
          if (err.name === 'AbortError') {
            throw err;
          } else {
            throw new NetworkError(err);
          }
        }).then(_this5._getPostResponseFunc(skipPostResponse)).then(function (res) {
          return _this5._json(res).then(resolve);
        }).catch(function (err) {
          err = err.isAuthError ? err : new Error("Could not post " + _this5._getUrl(path) + ". " + err);
          reject(err);
        });
      }).catch(reject);
    });
  };

  _proto.delete = function _delete(path, data, skipPostResponse) {
    var _this6 = this;

    return new Promise(function (resolve, reject) {
      _this6.preflightAndHeaders(path).then(function (headers) {
        fetch(_this6.hostname + "/" + path, {
          method: 'delete',
          headers: headers,
          credentials: 'same-origin',
          body: data ? JSON.stringify(data) : null
        }).catch(function (err) {
          if (err.name === 'AbortError') {
            throw err;
          } else {
            throw new NetworkError(err);
          }
        }).then(_this6._getPostResponseFunc(skipPostResponse)).then(function (res) {
          return _this6._json(res).then(resolve);
        }).catch(function (err) {
          err = err.isAuthError ? err : new Error("Could not delete " + _this6._getUrl(path) + ". " + err);
          reject(err);
        });
      }).catch(reject);
    });
  };

  _createClass(RequestClient, [{
    key: "hostname",
    get: function get() {
      var _this$uppy$getState = this.uppy.getState(),
          companion = _this$uppy$getState.companion;

      var host = this.opts.companionUrl;
      return stripSlash(companion && companion[host] ? companion[host] : host);
    }
  }, {
    key: "defaultHeaders",
    get: function get() {
      return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Uppy-Versions': "@uppy/companion-client=" + RequestClient.VERSION
      };
    }
  }]);

  return RequestClient;
}(), _class.VERSION = require('../package.json').version, _temp);

},{"../package.json":30,"./../../utils/lib/NetworkError":52,"./AuthError":31}],34:[function(require,module,exports){
var ee = require('namespace-emitter');

module.exports = /*#__PURE__*/function () {
  function UppySocket(opts) {
    this.opts = opts;
    this._queued = [];
    this.isOpen = false;
    this.emitter = ee();
    this._handleMessage = this._handleMessage.bind(this);
    this.close = this.close.bind(this);
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);
    this.once = this.once.bind(this);
    this.send = this.send.bind(this);

    if (!opts || opts.autoOpen !== false) {
      this.open();
    }
  }

  var _proto = UppySocket.prototype;

  _proto.open = function open() {
    var _this = this;

    this.socket = new WebSocket(this.opts.target);

    this.socket.onopen = function (e) {
      _this.isOpen = true;

      while (_this._queued.length > 0 && _this.isOpen) {
        var first = _this._queued[0];

        _this.send(first.action, first.payload);

        _this._queued = _this._queued.slice(1);
      }
    };

    this.socket.onclose = function (e) {
      _this.isOpen = false;
    };

    this.socket.onmessage = this._handleMessage;
  };

  _proto.close = function close() {
    if (this.socket) {
      this.socket.close();
    }
  };

  _proto.send = function send(action, payload) {
    // attach uuid
    if (!this.isOpen) {
      this._queued.push({
        action: action,
        payload: payload
      });

      return;
    }

    this.socket.send(JSON.stringify({
      action: action,
      payload: payload
    }));
  };

  _proto.on = function on(action, handler) {
    this.emitter.on(action, handler);
  };

  _proto.emit = function emit(action, payload) {
    this.emitter.emit(action, payload);
  };

  _proto.once = function once(action, handler) {
    this.emitter.once(action, handler);
  };

  _proto._handleMessage = function _handleMessage(e) {
    try {
      var message = JSON.parse(e.data);
      this.emit(message.action, message.payload);
    } catch (err) {
      console.log(err);
    }
  };

  return UppySocket;
}();

},{"namespace-emitter":11}],35:[function(require,module,exports){
'use strict';
/**
 * Manages communications with Companion
 */

var RequestClient = require('./RequestClient');

var Provider = require('./Provider');

var Socket = require('./Socket');

module.exports = {
  RequestClient: RequestClient,
  Provider: Provider,
  Socket: Socket
};

},{"./Provider":32,"./RequestClient":33,"./Socket":34}],36:[function(require,module,exports){
'use strict';
/**
 * This module serves as an Async wrapper for LocalStorage
 */

module.exports.setItem = function (key, value) {
  return new Promise(function (resolve) {
    localStorage.setItem(key, value);
    resolve();
  });
};

module.exports.getItem = function (key) {
  return Promise.resolve(localStorage.getItem(key));
};

module.exports.removeItem = function (key) {
  return new Promise(function (resolve) {
    localStorage.removeItem(key);
    resolve();
  });
};

},{}],37:[function(require,module,exports){
module.exports={
  "name": "@uppy/core",
  "description": "Core module for the extensible JavaScript file upload widget with support for drag&drop, resumable uploads, previews, restrictions, file processing/encoding, remote providers like Instagram, Dropbox, Google Drive, S3 and more :dog:",
  "version": "1.10.4",
  "license": "MIT",
  "main": "lib/index.js",
  "style": "dist/style.min.css",
  "types": "types/index.d.ts",
  "keywords": [
    "file uploader",
    "uppy",
    "uppy-plugin"
  ],
  "homepage": "https://uppy.io",
  "bugs": {
    "url": "https://github.com/transloadit/uppy/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/transloadit/uppy.git"
  },
  "dependencies": {
    "@uppy/store-default": "file:../store-default",
    "@uppy/utils": "file:../utils",
    "cuid": "^2.1.1",
    "lodash.throttle": "^4.1.1",
    "mime-match": "^1.0.2",
    "namespace-emitter": "^2.0.1",
    "preact": "8.2.9"
  }
}

},{}],38:[function(require,module,exports){
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var preact = require('preact');

var findDOMElement = require('./../../utils/lib/findDOMElement');
/**
 * Defer a frequent call to the microtask queue.
 */


function debounce(fn) {
  var calling = null;
  var latestArgs = null;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    latestArgs = args;

    if (!calling) {
      calling = Promise.resolve().then(function () {
        calling = null; // At this point `args` may be different from the most
        // recent state, if multiple calls happened since this task
        // was queued. So we use the `latestArgs`, which definitely
        // is the most recent call.

        return fn.apply(void 0, latestArgs);
      });
    }

    return calling;
  };
}
/**
 * Boilerplate that all Plugins share - and should not be used
 * directly. It also shows which methods final plugins should implement/override,
 * this deciding on structure.
 *
 * @param {object} main Uppy core object
 * @param {object} object with plugin options
 * @returns {Array|string} files or success/fail message
 */


module.exports = /*#__PURE__*/function () {
  function Plugin(uppy, opts) {
    this.uppy = uppy;
    this.opts = opts || {};
    this.update = this.update.bind(this);
    this.mount = this.mount.bind(this);
    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
  }

  var _proto = Plugin.prototype;

  _proto.getPluginState = function getPluginState() {
    var _this$uppy$getState = this.uppy.getState(),
        plugins = _this$uppy$getState.plugins;

    return plugins[this.id] || {};
  };

  _proto.setPluginState = function setPluginState(update) {
    var _extends2;

    var _this$uppy$getState2 = this.uppy.getState(),
        plugins = _this$uppy$getState2.plugins;

    this.uppy.setState({
      plugins: _extends({}, plugins, (_extends2 = {}, _extends2[this.id] = _extends({}, plugins[this.id], {}, update), _extends2))
    });
  };

  _proto.setOptions = function setOptions(newOpts) {
    this.opts = _extends({}, this.opts, {}, newOpts);
    this.setPluginState(); // so that UI re-renders with new options
  };

  _proto.update = function update(state) {
    if (typeof this.el === 'undefined') {
      return;
    }

    if (this._updateUI) {
      this._updateUI(state);
    }
  } // Called after every state update, after everything's mounted. Debounced.
  ;

  _proto.afterUpdate = function afterUpdate() {}
  /**
   * Called when plugin is mounted, whether in DOM or into another plugin.
   * Needed because sometimes plugins are mounted separately/after `install`,
   * so this.el and this.parent might not be available in `install`.
   * This is the case with @uppy/react plugins, for example.
   */
  ;

  _proto.onMount = function onMount() {}
  /**
   * Check if supplied `target` is a DOM element or an `object`.
   * If it’s an object — target is a plugin, and we search `plugins`
   * for a plugin with same name and return its target.
   *
   * @param {string|object} target
   *
   */
  ;

  _proto.mount = function mount(target, plugin) {
    var _this = this;

    var callerPluginName = plugin.id;
    var targetElement = findDOMElement(target);

    if (targetElement) {
      this.isTargetDOMEl = true; // API for plugins that require a synchronous rerender.

      this.rerender = function (state) {
        // plugin could be removed, but this.rerender is debounced below,
        // so it could still be called even after uppy.removePlugin or uppy.close
        // hence the check
        if (!_this.uppy.getPlugin(_this.id)) return;
        _this.el = preact.render(_this.render(state), targetElement, _this.el);

        _this.afterUpdate();
      };

      this._updateUI = debounce(this.rerender);
      this.uppy.log("Installing " + callerPluginName + " to a DOM element '" + target + "'"); // clear everything inside the target container

      if (this.opts.replaceTargetContent) {
        targetElement.innerHTML = '';
      }

      this.el = preact.render(this.render(this.uppy.getState()), targetElement);
      this.onMount();
      return this.el;
    }

    var targetPlugin;

    if (typeof target === 'object' && target instanceof Plugin) {
      // Targeting a plugin *instance*
      targetPlugin = target;
    } else if (typeof target === 'function') {
      // Targeting a plugin type
      var Target = target; // Find the target plugin instance.

      this.uppy.iteratePlugins(function (plugin) {
        if (plugin instanceof Target) {
          targetPlugin = plugin;
          return false;
        }
      });
    }

    if (targetPlugin) {
      this.uppy.log("Installing " + callerPluginName + " to " + targetPlugin.id);
      this.parent = targetPlugin;
      this.el = targetPlugin.addTarget(plugin);
      this.onMount();
      return this.el;
    }

    this.uppy.log("Not installing " + callerPluginName);
    throw new Error("Invalid target option given to " + callerPluginName + ". Please make sure that the element\n      exists on the page, or that the plugin you are targeting has been installed. Check that the <script> tag initializing Uppy\n      comes at the bottom of the page, before the closing </body> tag (see https://github.com/transloadit/uppy/issues/1042).");
  };

  _proto.render = function render(state) {
    throw new Error('Extend the render method to add your plugin to a DOM element');
  };

  _proto.addTarget = function addTarget(plugin) {
    throw new Error('Extend the addTarget method to add your plugin to another plugin\'s target');
  };

  _proto.unmount = function unmount() {
    if (this.isTargetDOMEl && this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  };

  _proto.install = function install() {};

  _proto.uninstall = function uninstall() {
    this.unmount();
  };

  return Plugin;
}();

},{"./../../utils/lib/findDOMElement":56,"preact":12}],39:[function(require,module,exports){
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Translator = require('./../../utils/lib/Translator');

var ee = require('namespace-emitter');

var cuid = require('cuid');

var throttle = require('lodash.throttle');

var prettyBytes = require('./../../utils/lib/prettyBytes');

var match = require('mime-match');

var DefaultStore = require('./../../store-default');

var getFileType = require('./../../utils/lib/getFileType');

var getFileNameAndExtension = require('./../../utils/lib/getFileNameAndExtension');

var generateFileID = require('./../../utils/lib/generateFileID');

var supportsUploadProgress = require('./supportsUploadProgress');

var _require = require('./loggers'),
    justErrorsLogger = _require.justErrorsLogger,
    debugLogger = _require.debugLogger;

var Plugin = require('./Plugin'); // Exported from here.


var RestrictionError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(RestrictionError, _Error);

  function RestrictionError() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _Error.call.apply(_Error, [this].concat(args)) || this;
    _this.isRestriction = true;
    return _this;
  }

  return RestrictionError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
/**
 * Uppy Core module.
 * Manages plugins, state updates, acts as an event bus,
 * adds/removes files and metadata.
 */


var Uppy = /*#__PURE__*/function () {
  /**
   * Instantiate Uppy
   *
   * @param {object} opts — Uppy options
   */
  function Uppy(opts) {
    var _this2 = this;

    this.defaultLocale = {
      strings: {
        addBulkFilesFailed: {
          0: 'Failed to add %{smart_count} file due to an internal error',
          1: 'Failed to add %{smart_count} files due to internal errors'
        },
        youCanOnlyUploadX: {
          0: 'You can only upload %{smart_count} file',
          1: 'You can only upload %{smart_count} files'
        },
        youHaveToAtLeastSelectX: {
          0: 'You have to select at least %{smart_count} file',
          1: 'You have to select at least %{smart_count} files'
        },
        // The default `exceedsSize2` string only combines the `exceedsSize` string (%{backwardsCompat}) with the size.
        // Locales can override `exceedsSize2` to specify a different word order. This is for backwards compat with
        // Uppy 1.9.x and below which did a naive concatenation of `exceedsSize2 + size` instead of using a locale-specific
        // substitution.
        // TODO: In 2.0 `exceedsSize2` should be removed in and `exceedsSize` updated to use substitution.
        exceedsSize2: '%{backwardsCompat} %{size}',
        exceedsSize: 'This file exceeds maximum allowed size of',
        youCanOnlyUploadFileTypes: 'You can only upload: %{types}',
        noNewAlreadyUploading: 'Cannot add new files: already uploading',
        noDuplicates: 'Cannot add the duplicate file \'%{fileName}\', it already exists',
        companionError: 'Connection with Companion failed',
        companionUnauthorizeHint: 'To unauthorize to your %{provider} account, please go to %{url}',
        failedToUpload: 'Failed to upload %{file}',
        noInternetConnection: 'No Internet connection',
        connectedToInternet: 'Connected to the Internet',
        // Strings for remote providers
        noFilesFound: 'You have no files or folders here',
        selectX: {
          0: 'Select %{smart_count}',
          1: 'Select %{smart_count}'
        },
        selectAllFilesFromFolderNamed: 'Select all files from folder %{name}',
        unselectAllFilesFromFolderNamed: 'Unselect all files from folder %{name}',
        selectFileNamed: 'Select file %{name}',
        unselectFileNamed: 'Unselect file %{name}',
        openFolderNamed: 'Open folder %{name}',
        cancel: 'Cancel',
        logOut: 'Log out',
        filter: 'Filter',
        resetFilter: 'Reset filter',
        loading: 'Loading...',
        authenticateWithTitle: 'Please authenticate with %{pluginName} to select files',
        authenticateWith: 'Connect to %{pluginName}',
        emptyFolderAdded: 'No files were added from empty folder',
        folderAdded: {
          0: 'Added %{smart_count} file from %{folder}',
          1: 'Added %{smart_count} files from %{folder}'
        }
      }
    };
    var defaultOptions = {
      id: 'uppy',
      autoProceed: false,
      allowMultipleUploads: true,
      debug: false,
      restrictions: {
        maxFileSize: null,
        maxNumberOfFiles: null,
        minNumberOfFiles: null,
        allowedFileTypes: null
      },
      meta: {},
      onBeforeFileAdded: function onBeforeFileAdded(currentFile, files) {
        return currentFile;
      },
      onBeforeUpload: function onBeforeUpload(files) {
        return files;
      },
      store: DefaultStore(),
      logger: justErrorsLogger
    }; // Merge default options with the ones set by user,
    // making sure to merge restrictions too

    this.opts = _extends({}, defaultOptions, {}, opts, {
      restrictions: _extends({}, defaultOptions.restrictions, {}, opts && opts.restrictions)
    }); // Support debug: true for backwards-compatability, unless logger is set in opts
    // opts instead of this.opts to avoid comparing objects — we set logger: justErrorsLogger in defaultOptions

    if (opts && opts.logger && opts.debug) {
      this.log('You are using a custom `logger`, but also set `debug: true`, which uses built-in logger to output logs to console. Ignoring `debug: true` and using your custom `logger`.', 'warning');
    } else if (opts && opts.debug) {
      this.opts.logger = debugLogger;
    }

    this.log("Using Core v" + this.constructor.VERSION);

    if (this.opts.restrictions.allowedFileTypes && this.opts.restrictions.allowedFileTypes !== null && !Array.isArray(this.opts.restrictions.allowedFileTypes)) {
      throw new TypeError('`restrictions.allowedFileTypes` must be an array');
    }

    this.i18nInit(); // Container for different types of plugins

    this.plugins = {};
    this.getState = this.getState.bind(this);
    this.getPlugin = this.getPlugin.bind(this);
    this.setFileMeta = this.setFileMeta.bind(this);
    this.setFileState = this.setFileState.bind(this);
    this.log = this.log.bind(this);
    this.info = this.info.bind(this);
    this.hideInfo = this.hideInfo.bind(this);
    this.addFile = this.addFile.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.pauseResume = this.pauseResume.bind(this); // ___Why throttle at 500ms?
    //    - We must throttle at >250ms for superfocus in Dashboard to work well (because animation takes 0.25s, and we want to wait for all animations to be over before refocusing).
    //    [Practical Check]: if thottle is at 100ms, then if you are uploading a file, and click 'ADD MORE FILES', - focus won't activate in Firefox.
    //    - We must throttle at around >500ms to avoid performance lags.
    //    [Practical Check] Firefox, try to upload a big file for a prolonged period of time. Laptop will start to heat up.

    this._calculateProgress = throttle(this._calculateProgress.bind(this), 500, {
      leading: true,
      trailing: true
    });
    this.updateOnlineStatus = this.updateOnlineStatus.bind(this);
    this.resetProgress = this.resetProgress.bind(this);
    this.pauseAll = this.pauseAll.bind(this);
    this.resumeAll = this.resumeAll.bind(this);
    this.retryAll = this.retryAll.bind(this);
    this.cancelAll = this.cancelAll.bind(this);
    this.retryUpload = this.retryUpload.bind(this);
    this.upload = this.upload.bind(this);
    this.emitter = ee();
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.once = this.emitter.once.bind(this.emitter);
    this.emit = this.emitter.emit.bind(this.emitter);
    this.preProcessors = [];
    this.uploaders = [];
    this.postProcessors = [];
    this.store = this.opts.store;
    this.setState({
      plugins: {},
      files: {},
      currentUploads: {},
      allowNewUpload: true,
      capabilities: {
        uploadProgress: supportsUploadProgress(),
        individualCancellation: true,
        resumableUploads: false
      },
      totalProgress: 0,
      meta: _extends({}, this.opts.meta),
      info: {
        isHidden: true,
        type: 'info',
        message: ''
      }
    });
    this._storeUnsubscribe = this.store.subscribe(function (prevState, nextState, patch) {
      _this2.emit('state-update', prevState, nextState, patch);

      _this2.updateAll(nextState);
    }); // Exposing uppy object on window for debugging and testing

    if (this.opts.debug && typeof window !== 'undefined') {
      window[this.opts.id] = this;
    }

    this._addListeners(); // Re-enable if we’ll need some capabilities on boot, like isMobileDevice
    // this._setCapabilities()

  } // _setCapabilities = () => {
  //   const capabilities = {
  //     isMobileDevice: isMobileDevice()
  //   }
  //   this.setState({
  //     ...this.getState().capabilities,
  //     capabilities
  //   })
  // }


  var _proto = Uppy.prototype;

  _proto.on = function on(event, callback) {
    this.emitter.on(event, callback);
    return this;
  };

  _proto.off = function off(event, callback) {
    this.emitter.off(event, callback);
    return this;
  }
  /**
   * Iterate on all plugins and run `update` on them.
   * Called each time state changes.
   *
   */
  ;

  _proto.updateAll = function updateAll(state) {
    this.iteratePlugins(function (plugin) {
      plugin.update(state);
    });
  }
  /**
   * Updates state with a patch
   *
   * @param {object} patch {foo: 'bar'}
   */
  ;

  _proto.setState = function setState(patch) {
    this.store.setState(patch);
  }
  /**
   * Returns current state.
   *
   * @returns {object}
   */
  ;

  _proto.getState = function getState() {
    return this.store.getState();
  }
  /**
   * Back compat for when uppy.state is used instead of uppy.getState().
   */
  ;

  /**
   * Shorthand to set state for a specific file.
   */
  _proto.setFileState = function setFileState(fileID, state) {
    var _extends2;

    if (!this.getState().files[fileID]) {
      throw new Error("Can\u2019t set state for " + fileID + " (the file could have been removed)");
    }

    this.setState({
      files: _extends({}, this.getState().files, (_extends2 = {}, _extends2[fileID] = _extends({}, this.getState().files[fileID], state), _extends2))
    });
  };

  _proto.i18nInit = function i18nInit() {
    this.translator = new Translator([this.defaultLocale, this.opts.locale]);
    this.locale = this.translator.locale;
    this.i18n = this.translator.translate.bind(this.translator);
    this.i18nArray = this.translator.translateArray.bind(this.translator);
  };

  _proto.setOptions = function setOptions(newOpts) {
    this.opts = _extends({}, this.opts, {}, newOpts, {
      restrictions: _extends({}, this.opts.restrictions, {}, newOpts && newOpts.restrictions)
    });

    if (newOpts.meta) {
      this.setMeta(newOpts.meta);
    }

    this.i18nInit();

    if (newOpts.locale) {
      this.iteratePlugins(function (plugin) {
        plugin.setOptions();
      });
    }

    this.setState(); // so that UI re-renders with new options
  };

  _proto.resetProgress = function resetProgress() {
    var defaultProgress = {
      percentage: 0,
      bytesUploaded: 0,
      uploadComplete: false,
      uploadStarted: null
    };

    var files = _extends({}, this.getState().files);

    var updatedFiles = {};
    Object.keys(files).forEach(function (fileID) {
      var updatedFile = _extends({}, files[fileID]);

      updatedFile.progress = _extends({}, updatedFile.progress, defaultProgress);
      updatedFiles[fileID] = updatedFile;
    });
    this.setState({
      files: updatedFiles,
      totalProgress: 0
    });
    this.emit('reset-progress');
  };

  _proto.addPreProcessor = function addPreProcessor(fn) {
    this.preProcessors.push(fn);
  };

  _proto.removePreProcessor = function removePreProcessor(fn) {
    var i = this.preProcessors.indexOf(fn);

    if (i !== -1) {
      this.preProcessors.splice(i, 1);
    }
  };

  _proto.addPostProcessor = function addPostProcessor(fn) {
    this.postProcessors.push(fn);
  };

  _proto.removePostProcessor = function removePostProcessor(fn) {
    var i = this.postProcessors.indexOf(fn);

    if (i !== -1) {
      this.postProcessors.splice(i, 1);
    }
  };

  _proto.addUploader = function addUploader(fn) {
    this.uploaders.push(fn);
  };

  _proto.removeUploader = function removeUploader(fn) {
    var i = this.uploaders.indexOf(fn);

    if (i !== -1) {
      this.uploaders.splice(i, 1);
    }
  };

  _proto.setMeta = function setMeta(data) {
    var updatedMeta = _extends({}, this.getState().meta, data);

    var updatedFiles = _extends({}, this.getState().files);

    Object.keys(updatedFiles).forEach(function (fileID) {
      updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
        meta: _extends({}, updatedFiles[fileID].meta, data)
      });
    });
    this.log('Adding metadata:');
    this.log(data);
    this.setState({
      meta: updatedMeta,
      files: updatedFiles
    });
  };

  _proto.setFileMeta = function setFileMeta(fileID, data) {
    var updatedFiles = _extends({}, this.getState().files);

    if (!updatedFiles[fileID]) {
      this.log('Was trying to set metadata for a file that has been removed: ', fileID);
      return;
    }

    var newMeta = _extends({}, updatedFiles[fileID].meta, data);

    updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
      meta: newMeta
    });
    this.setState({
      files: updatedFiles
    });
  }
  /**
   * Get a file object.
   *
   * @param {string} fileID The ID of the file object to return.
   */
  ;

  _proto.getFile = function getFile(fileID) {
    return this.getState().files[fileID];
  }
  /**
   * Get all files in an array.
   */
  ;

  _proto.getFiles = function getFiles() {
    var _this$getState = this.getState(),
        files = _this$getState.files;

    return Object.keys(files).map(function (fileID) {
      return files[fileID];
    });
  }
  /**
   * Check if minNumberOfFiles restriction is reached before uploading.
   *
   * @private
   */
  ;

  _proto._checkMinNumberOfFiles = function _checkMinNumberOfFiles(files) {
    var minNumberOfFiles = this.opts.restrictions.minNumberOfFiles;

    if (Object.keys(files).length < minNumberOfFiles) {
      throw new RestrictionError("" + this.i18n('youHaveToAtLeastSelectX', {
        smart_count: minNumberOfFiles
      }));
    }
  }
  /**
   * Check if file passes a set of restrictions set in options: maxFileSize,
   * maxNumberOfFiles and allowedFileTypes.
   *
   * @param {object} files Object of IDs → files already added
   * @param {object} file object to check
   * @private
   */
  ;

  _proto._checkRestrictions = function _checkRestrictions(files, file) {
    var _this$opts$restrictio = this.opts.restrictions,
        maxFileSize = _this$opts$restrictio.maxFileSize,
        maxNumberOfFiles = _this$opts$restrictio.maxNumberOfFiles,
        allowedFileTypes = _this$opts$restrictio.allowedFileTypes;

    if (maxNumberOfFiles) {
      if (Object.keys(files).length + 1 > maxNumberOfFiles) {
        throw new RestrictionError("" + this.i18n('youCanOnlyUploadX', {
          smart_count: maxNumberOfFiles
        }));
      }
    }

    if (allowedFileTypes) {
      var isCorrectFileType = allowedFileTypes.some(function (type) {
        // is this is a mime-type
        if (type.indexOf('/') > -1) {
          if (!file.type) return false;
          return match(file.type.replace(/;.*?$/, ''), type);
        } // otherwise this is likely an extension


        if (type[0] === '.') {
          return file.extension.toLowerCase() === type.substr(1).toLowerCase();
        }

        return false;
      });

      if (!isCorrectFileType) {
        var allowedFileTypesString = allowedFileTypes.join(', ');
        throw new RestrictionError(this.i18n('youCanOnlyUploadFileTypes', {
          types: allowedFileTypesString
        }));
      }
    } // We can't check maxFileSize if the size is unknown.


    if (maxFileSize && file.data.size != null) {
      if (file.data.size > maxFileSize) {
        throw new RestrictionError(this.i18n('exceedsSize2', {
          backwardsCompat: this.i18n('exceedsSize'),
          size: prettyBytes(maxFileSize)
        }));
      }
    }
  }
  /**
   * Logs an error, sets Informer message, then throws the error.
   * Emits a 'restriction-failed' event if it’s a restriction error
   *
   * @param {object | string} err — Error object or plain string message
   * @param {object} [options]
   * @param {boolean} [options.showInformer=true] — Sometimes developer might want to show Informer manually
   * @param {object} [options.file=null] — File object used to emit the restriction error
   * @param {boolean} [options.throwErr=true] — Errors shouldn’t be thrown, for example, in `upload-error` event
   * @private
   */
  ;

  _proto._showOrLogErrorAndThrow = function _showOrLogErrorAndThrow(err, _temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$showInformer = _ref.showInformer,
        showInformer = _ref$showInformer === void 0 ? true : _ref$showInformer,
        _ref$file = _ref.file,
        file = _ref$file === void 0 ? null : _ref$file,
        _ref$throwErr = _ref.throwErr,
        throwErr = _ref$throwErr === void 0 ? true : _ref$throwErr;

    var message = typeof err === 'object' ? err.message : err;
    var details = typeof err === 'object' && err.details ? err.details : ''; // Restriction errors should be logged, but not as errors,
    // as they are expected and shown in the UI.

    var logMessageWithDetails = message;

    if (details) {
      logMessageWithDetails += ' ' + details;
    }

    if (err.isRestriction) {
      this.log(logMessageWithDetails);
      this.emit('restriction-failed', file, err);
    } else {
      this.log(logMessageWithDetails, 'error');
    } // Sometimes informer has to be shown manually by the developer,
    // for example, in `onBeforeFileAdded`.


    if (showInformer) {
      this.info({
        message: message,
        details: details
      }, 'error', 5000);
    }

    if (throwErr) {
      throw typeof err === 'object' ? err : new Error(err);
    }
  };

  _proto._assertNewUploadAllowed = function _assertNewUploadAllowed(file) {
    var _this$getState2 = this.getState(),
        allowNewUpload = _this$getState2.allowNewUpload;

    if (allowNewUpload === false) {
      this._showOrLogErrorAndThrow(new RestrictionError(this.i18n('noNewAlreadyUploading')), {
        file: file
      });
    }
  }
  /**
   * Create a file state object based on user-provided `addFile()` options.
   *
   * Note this is extremely side-effectful and should only be done when a file state object will be added to state immediately afterward!
   *
   * The `files` value is passed in because it may be updated by the caller without updating the store.
   */
  ;

  _proto._checkAndCreateFileStateObject = function _checkAndCreateFileStateObject(files, file) {
    var fileType = getFileType(file);
    file.type = fileType;
    var onBeforeFileAddedResult = this.opts.onBeforeFileAdded(file, files);

    if (onBeforeFileAddedResult === false) {
      // Don’t show UI info for this error, as it should be done by the developer
      this._showOrLogErrorAndThrow(new RestrictionError('Cannot add the file because onBeforeFileAdded returned false.'), {
        showInformer: false,
        file: file
      });
    }

    if (typeof onBeforeFileAddedResult === 'object' && onBeforeFileAddedResult) {
      file = onBeforeFileAddedResult;
    }

    var fileName;

    if (file.name) {
      fileName = file.name;
    } else if (fileType.split('/')[0] === 'image') {
      fileName = fileType.split('/')[0] + '.' + fileType.split('/')[1];
    } else {
      fileName = 'noname';
    }

    var fileExtension = getFileNameAndExtension(fileName).extension;
    var isRemote = file.isRemote || false;
    var fileID = generateFileID(file);

    if (files[fileID]) {
      this._showOrLogErrorAndThrow(new RestrictionError(this.i18n('noDuplicates', {
        fileName: fileName
      })), {
        file: file
      });
    }

    var meta = file.meta || {};
    meta.name = fileName;
    meta.type = fileType; // `null` means the size is unknown.

    var size = isFinite(file.data.size) ? file.data.size : null;
    var newFile = {
      source: file.source || '',
      id: fileID,
      name: fileName,
      extension: fileExtension || '',
      meta: _extends({}, this.getState().meta, {}, meta),
      type: fileType,
      data: file.data,
      progress: {
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: size,
        uploadComplete: false,
        uploadStarted: null
      },
      size: size,
      isRemote: isRemote,
      remote: file.remote || '',
      preview: file.preview
    };

    try {
      this._checkRestrictions(files, newFile);
    } catch (err) {
      this._showOrLogErrorAndThrow(err, {
        file: newFile
      });
    }

    return newFile;
  } // Schedule an upload if `autoProceed` is enabled.
  ;

  _proto._startIfAutoProceed = function _startIfAutoProceed() {
    var _this3 = this;

    if (this.opts.autoProceed && !this.scheduledAutoProceed) {
      this.scheduledAutoProceed = setTimeout(function () {
        _this3.scheduledAutoProceed = null;

        _this3.upload().catch(function (err) {
          if (!err.isRestriction) {
            _this3.log(err.stack || err.message || err);
          }
        });
      }, 4);
    }
  }
  /**
   * Add a new file to `state.files`. This will run `onBeforeFileAdded`,
   * try to guess file type in a clever way, check file against restrictions,
   * and start an upload if `autoProceed === true`.
   *
   * @param {object} file object to add
   * @returns {string} id for the added file
   */
  ;

  _proto.addFile = function addFile(file) {
    var _extends3;

    this._assertNewUploadAllowed(file);

    var _this$getState3 = this.getState(),
        files = _this$getState3.files;

    var newFile = this._checkAndCreateFileStateObject(files, file);

    this.setState({
      files: _extends({}, files, (_extends3 = {}, _extends3[newFile.id] = newFile, _extends3))
    });
    this.emit('file-added', newFile);
    this.log("Added file: " + newFile.name + ", " + newFile.id + ", mime type: " + newFile.type);

    this._startIfAutoProceed();

    return newFile.id;
  }
  /**
   * Add multiple files to `state.files`. See the `addFile()` documentation.
   *
   * This cuts some corners for performance, so should typically only be used in cases where there may be a lot of files.
   *
   * If an error occurs while adding a file, it is logged and the user is notified. This is good for UI plugins, but not for programmatic use. Programmatic users should usually still use `addFile()` on individual files.
   */
  ;

  _proto.addFiles = function addFiles(fileDescriptors) {
    var _this4 = this;

    this._assertNewUploadAllowed(); // create a copy of the files object only once


    var files = _extends({}, this.getState().files);

    var newFiles = [];
    var errors = [];

    for (var i = 0; i < fileDescriptors.length; i++) {
      try {
        var newFile = this._checkAndCreateFileStateObject(files, fileDescriptors[i]);

        newFiles.push(newFile);
        files[newFile.id] = newFile;
      } catch (err) {
        if (!err.isRestriction) {
          errors.push(err);
        }
      }
    }

    this.setState({
      files: files
    });
    newFiles.forEach(function (newFile) {
      _this4.emit('file-added', newFile);
    });

    if (newFiles.length > 5) {
      this.log("Added batch of " + newFiles.length + " files");
    } else {
      Object.keys(newFiles).forEach(function (fileID) {
        _this4.log("Added file: " + newFiles[fileID].name + "\n id: " + newFiles[fileID].id + "\n type: " + newFiles[fileID].type);
      });
    }

    if (newFiles.length > 0) {
      this._startIfAutoProceed();
    }

    if (errors.length > 0) {
      var message = 'Multiple errors occurred while adding files:\n';
      errors.forEach(function (subError) {
        message += "\n * " + subError.message;
      });
      this.info({
        message: this.i18n('addBulkFilesFailed', {
          smart_count: errors.length
        }),
        details: message
      }, 'error', 5000);
      var err = new Error(message);
      err.errors = errors;
      throw err;
    }
  };

  _proto.removeFiles = function removeFiles(fileIDs) {
    var _this5 = this;

    var _this$getState4 = this.getState(),
        files = _this$getState4.files,
        currentUploads = _this$getState4.currentUploads;

    var updatedFiles = _extends({}, files);

    var updatedUploads = _extends({}, currentUploads);

    var removedFiles = Object.create(null);
    fileIDs.forEach(function (fileID) {
      if (files[fileID]) {
        removedFiles[fileID] = files[fileID];
        delete updatedFiles[fileID];
      }
    }); // Remove files from the `fileIDs` list in each upload.

    function fileIsNotRemoved(uploadFileID) {
      return removedFiles[uploadFileID] === undefined;
    }

    var uploadsToRemove = [];
    Object.keys(updatedUploads).forEach(function (uploadID) {
      var newFileIDs = currentUploads[uploadID].fileIDs.filter(fileIsNotRemoved); // Remove the upload if no files are associated with it anymore.

      if (newFileIDs.length === 0) {
        uploadsToRemove.push(uploadID);
        return;
      }

      updatedUploads[uploadID] = _extends({}, currentUploads[uploadID], {
        fileIDs: newFileIDs
      });
    });
    uploadsToRemove.forEach(function (uploadID) {
      delete updatedUploads[uploadID];
    });
    var stateUpdate = {
      currentUploads: updatedUploads,
      files: updatedFiles
    }; // If all files were removed - allow new uploads!

    if (Object.keys(updatedFiles).length === 0) {
      stateUpdate.allowNewUpload = true;
      stateUpdate.error = null;
    }

    this.setState(stateUpdate);

    this._calculateTotalProgress();

    var removedFileIDs = Object.keys(removedFiles);
    removedFileIDs.forEach(function (fileID) {
      _this5.emit('file-removed', removedFiles[fileID]);
    });

    if (removedFileIDs.length > 5) {
      this.log("Removed " + removedFileIDs.length + " files");
    } else {
      this.log("Removed files: " + removedFileIDs.join(', '));
    }
  };

  _proto.removeFile = function removeFile(fileID) {
    this.removeFiles([fileID]);
  };

  _proto.pauseResume = function pauseResume(fileID) {
    if (!this.getState().capabilities.resumableUploads || this.getFile(fileID).uploadComplete) {
      return;
    }

    var wasPaused = this.getFile(fileID).isPaused || false;
    var isPaused = !wasPaused;
    this.setFileState(fileID, {
      isPaused: isPaused
    });
    this.emit('upload-pause', fileID, isPaused);
    return isPaused;
  };

  _proto.pauseAll = function pauseAll() {
    var updatedFiles = _extends({}, this.getState().files);

    var inProgressUpdatedFiles = Object.keys(updatedFiles).filter(function (file) {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });
    inProgressUpdatedFiles.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: true
      });

      updatedFiles[file] = updatedFile;
    });
    this.setState({
      files: updatedFiles
    });
    this.emit('pause-all');
  };

  _proto.resumeAll = function resumeAll() {
    var updatedFiles = _extends({}, this.getState().files);

    var inProgressUpdatedFiles = Object.keys(updatedFiles).filter(function (file) {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });
    inProgressUpdatedFiles.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: false,
        error: null
      });

      updatedFiles[file] = updatedFile;
    });
    this.setState({
      files: updatedFiles
    });
    this.emit('resume-all');
  };

  _proto.retryAll = function retryAll() {
    var updatedFiles = _extends({}, this.getState().files);

    var filesToRetry = Object.keys(updatedFiles).filter(function (file) {
      return updatedFiles[file].error;
    });
    filesToRetry.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: false,
        error: null
      });

      updatedFiles[file] = updatedFile;
    });
    this.setState({
      files: updatedFiles,
      error: null
    });
    this.emit('retry-all', filesToRetry);

    var uploadID = this._createUpload(filesToRetry, {
      forceAllowNewUpload: true // create new upload even if allowNewUpload: false

    });

    return this._runUpload(uploadID);
  };

  _proto.cancelAll = function cancelAll() {
    this.emit('cancel-all');

    var _this$getState5 = this.getState(),
        files = _this$getState5.files;

    var fileIDs = Object.keys(files);

    if (fileIDs.length) {
      this.removeFiles(fileIDs);
    }

    this.setState({
      totalProgress: 0,
      error: null
    });
  };

  _proto.retryUpload = function retryUpload(fileID) {
    this.setFileState(fileID, {
      error: null,
      isPaused: false
    });
    this.emit('upload-retry', fileID);

    var uploadID = this._createUpload([fileID], {
      forceAllowNewUpload: true // create new upload even if allowNewUpload: false

    });

    return this._runUpload(uploadID);
  };

  _proto.reset = function reset() {
    this.cancelAll();
  };

  _proto._calculateProgress = function _calculateProgress(file, data) {
    if (!this.getFile(file.id)) {
      this.log("Not setting progress for a file that has been removed: " + file.id);
      return;
    } // bytesTotal may be null or zero; in that case we can't divide by it


    var canHavePercentage = isFinite(data.bytesTotal) && data.bytesTotal > 0;
    this.setFileState(file.id, {
      progress: _extends({}, this.getFile(file.id).progress, {
        bytesUploaded: data.bytesUploaded,
        bytesTotal: data.bytesTotal,
        percentage: canHavePercentage // TODO(goto-bus-stop) flooring this should probably be the choice of the UI?
        // we get more accurate calculations if we don't round this at all.
        ? Math.round(data.bytesUploaded / data.bytesTotal * 100) : 0
      })
    });

    this._calculateTotalProgress();
  };

  _proto._calculateTotalProgress = function _calculateTotalProgress() {
    // calculate total progress, using the number of files currently uploading,
    // multiplied by 100 and the summ of individual progress of each file
    var files = this.getFiles();
    var inProgress = files.filter(function (file) {
      return file.progress.uploadStarted || file.progress.preprocess || file.progress.postprocess;
    });

    if (inProgress.length === 0) {
      this.emit('progress', 0);
      this.setState({
        totalProgress: 0
      });
      return;
    }

    var sizedFiles = inProgress.filter(function (file) {
      return file.progress.bytesTotal != null;
    });
    var unsizedFiles = inProgress.filter(function (file) {
      return file.progress.bytesTotal == null;
    });

    if (sizedFiles.length === 0) {
      var progressMax = inProgress.length * 100;
      var currentProgress = unsizedFiles.reduce(function (acc, file) {
        return acc + file.progress.percentage;
      }, 0);

      var _totalProgress = Math.round(currentProgress / progressMax * 100);

      this.setState({
        totalProgress: _totalProgress
      });
      return;
    }

    var totalSize = sizedFiles.reduce(function (acc, file) {
      return acc + file.progress.bytesTotal;
    }, 0);
    var averageSize = totalSize / sizedFiles.length;
    totalSize += averageSize * unsizedFiles.length;
    var uploadedSize = 0;
    sizedFiles.forEach(function (file) {
      uploadedSize += file.progress.bytesUploaded;
    });
    unsizedFiles.forEach(function (file) {
      uploadedSize += averageSize * (file.progress.percentage || 0) / 100;
    });
    var totalProgress = totalSize === 0 ? 0 : Math.round(uploadedSize / totalSize * 100); // hot fix, because:
    // uploadedSize ended up larger than totalSize, resulting in 1325% total

    if (totalProgress > 100) {
      totalProgress = 100;
    }

    this.setState({
      totalProgress: totalProgress
    });
    this.emit('progress', totalProgress);
  }
  /**
   * Registers listeners for all global actions, like:
   * `error`, `file-removed`, `upload-progress`
   */
  ;

  _proto._addListeners = function _addListeners() {
    var _this6 = this;

    this.on('error', function (error) {
      var errorMsg = 'Unknown error';

      if (error.message) {
        errorMsg = error.message;
      }

      if (error.details) {
        errorMsg += ' ' + error.details;
      }

      _this6.setState({
        error: errorMsg
      });
    });
    this.on('upload-error', function (file, error, response) {
      var errorMsg = 'Unknown error';

      if (error.message) {
        errorMsg = error.message;
      }

      if (error.details) {
        errorMsg += ' ' + error.details;
      }

      _this6.setFileState(file.id, {
        error: errorMsg,
        response: response
      });

      _this6.setState({
        error: error.message
      });

      if (typeof error === 'object' && error.message) {
        var newError = new Error(error.message);
        newError.details = error.message;

        if (error.details) {
          newError.details += ' ' + error.details;
        }

        newError.message = _this6.i18n('failedToUpload', {
          file: file.name
        });

        _this6._showOrLogErrorAndThrow(newError, {
          throwErr: false
        });
      } else {
        _this6._showOrLogErrorAndThrow(error, {
          throwErr: false
        });
      }
    });
    this.on('upload', function () {
      _this6.setState({
        error: null
      });
    });
    this.on('upload-started', function (file, upload) {
      if (!_this6.getFile(file.id)) {
        _this6.log("Not setting progress for a file that has been removed: " + file.id);

        return;
      }

      _this6.setFileState(file.id, {
        progress: {
          uploadStarted: Date.now(),
          uploadComplete: false,
          percentage: 0,
          bytesUploaded: 0,
          bytesTotal: file.size
        }
      });
    });
    this.on('upload-progress', this._calculateProgress);
    this.on('upload-success', function (file, uploadResp) {
      if (!_this6.getFile(file.id)) {
        _this6.log("Not setting progress for a file that has been removed: " + file.id);

        return;
      }

      var currentProgress = _this6.getFile(file.id).progress;

      _this6.setFileState(file.id, {
        progress: _extends({}, currentProgress, {
          uploadComplete: true,
          percentage: 100,
          bytesUploaded: currentProgress.bytesTotal
        }),
        response: uploadResp,
        uploadURL: uploadResp.uploadURL,
        isPaused: false
      });

      _this6._calculateTotalProgress();
    });
    this.on('preprocess-progress', function (file, progress) {
      if (!_this6.getFile(file.id)) {
        _this6.log("Not setting progress for a file that has been removed: " + file.id);

        return;
      }

      _this6.setFileState(file.id, {
        progress: _extends({}, _this6.getFile(file.id).progress, {
          preprocess: progress
        })
      });
    });
    this.on('preprocess-complete', function (file) {
      if (!_this6.getFile(file.id)) {
        _this6.log("Not setting progress for a file that has been removed: " + file.id);

        return;
      }

      var files = _extends({}, _this6.getState().files);

      files[file.id] = _extends({}, files[file.id], {
        progress: _extends({}, files[file.id].progress)
      });
      delete files[file.id].progress.preprocess;

      _this6.setState({
        files: files
      });
    });
    this.on('postprocess-progress', function (file, progress) {
      if (!_this6.getFile(file.id)) {
        _this6.log("Not setting progress for a file that has been removed: " + file.id);

        return;
      }

      _this6.setFileState(file.id, {
        progress: _extends({}, _this6.getState().files[file.id].progress, {
          postprocess: progress
        })
      });
    });
    this.on('postprocess-complete', function (file) {
      if (!_this6.getFile(file.id)) {
        _this6.log("Not setting progress for a file that has been removed: " + file.id);

        return;
      }

      var files = _extends({}, _this6.getState().files);

      files[file.id] = _extends({}, files[file.id], {
        progress: _extends({}, files[file.id].progress)
      });
      delete files[file.id].progress.postprocess; // TODO should we set some kind of `fullyComplete` property on the file object
      // so it's easier to see that the file is upload…fully complete…rather than
      // what we have to do now (`uploadComplete && !postprocess`)

      _this6.setState({
        files: files
      });
    });
    this.on('restored', function () {
      // Files may have changed--ensure progress is still accurate.
      _this6._calculateTotalProgress();
    }); // show informer if offline

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', function () {
        return _this6.updateOnlineStatus();
      });
      window.addEventListener('offline', function () {
        return _this6.updateOnlineStatus();
      });
      setTimeout(function () {
        return _this6.updateOnlineStatus();
      }, 3000);
    }
  };

  _proto.updateOnlineStatus = function updateOnlineStatus() {
    var online = typeof window.navigator.onLine !== 'undefined' ? window.navigator.onLine : true;

    if (!online) {
      this.emit('is-offline');
      this.info(this.i18n('noInternetConnection'), 'error', 0);
      this.wasOffline = true;
    } else {
      this.emit('is-online');

      if (this.wasOffline) {
        this.emit('back-online');
        this.info(this.i18n('connectedToInternet'), 'success', 3000);
        this.wasOffline = false;
      }
    }
  };

  _proto.getID = function getID() {
    return this.opts.id;
  }
  /**
   * Registers a plugin with Core.
   *
   * @param {object} Plugin object
   * @param {object} [opts] object with options to be passed to Plugin
   * @returns {object} self for chaining
   */
  ;

  _proto.use = function use(Plugin, opts) {
    if (typeof Plugin !== 'function') {
      var msg = "Expected a plugin class, but got " + (Plugin === null ? 'null' : typeof Plugin) + "." + ' Please verify that the plugin was imported and spelled correctly.';
      throw new TypeError(msg);
    } // Instantiate


    var plugin = new Plugin(this, opts);
    var pluginId = plugin.id;
    this.plugins[plugin.type] = this.plugins[plugin.type] || [];

    if (!pluginId) {
      throw new Error('Your plugin must have an id');
    }

    if (!plugin.type) {
      throw new Error('Your plugin must have a type');
    }

    var existsPluginAlready = this.getPlugin(pluginId);

    if (existsPluginAlready) {
      var _msg = "Already found a plugin named '" + existsPluginAlready.id + "'. " + ("Tried to use: '" + pluginId + "'.\n") + 'Uppy plugins must have unique `id` options. See https://uppy.io/docs/plugins/#id.';

      throw new Error(_msg);
    }

    if (Plugin.VERSION) {
      this.log("Using " + pluginId + " v" + Plugin.VERSION);
    }

    this.plugins[plugin.type].push(plugin);
    plugin.install();
    return this;
  }
  /**
   * Find one Plugin by name.
   *
   * @param {string} id plugin id
   * @returns {object|boolean}
   */
  ;

  _proto.getPlugin = function getPlugin(id) {
    var foundPlugin = null;
    this.iteratePlugins(function (plugin) {
      if (plugin.id === id) {
        foundPlugin = plugin;
        return false;
      }
    });
    return foundPlugin;
  }
  /**
   * Iterate through all `use`d plugins.
   *
   * @param {Function} method that will be run on each plugin
   */
  ;

  _proto.iteratePlugins = function iteratePlugins(method) {
    var _this7 = this;

    Object.keys(this.plugins).forEach(function (pluginType) {
      _this7.plugins[pluginType].forEach(method);
    });
  }
  /**
   * Uninstall and remove a plugin.
   *
   * @param {object} instance The plugin instance to remove.
   */
  ;

  _proto.removePlugin = function removePlugin(instance) {
    this.log("Removing plugin " + instance.id);
    this.emit('plugin-remove', instance);

    if (instance.uninstall) {
      instance.uninstall();
    }

    var list = this.plugins[instance.type].slice();
    var index = list.indexOf(instance);

    if (index !== -1) {
      list.splice(index, 1);
      this.plugins[instance.type] = list;
    }

    var updatedState = this.getState();
    delete updatedState.plugins[instance.id];
    this.setState(updatedState);
  }
  /**
   * Uninstall all plugins and close down this Uppy instance.
   */
  ;

  _proto.close = function close() {
    var _this8 = this;

    this.log("Closing Uppy instance " + this.opts.id + ": removing all files and uninstalling plugins");
    this.reset();

    this._storeUnsubscribe();

    this.iteratePlugins(function (plugin) {
      _this8.removePlugin(plugin);
    });
  }
  /**
   * Set info message in `state.info`, so that UI plugins like `Informer`
   * can display the message.
   *
   * @param {string | object} message Message to be displayed by the informer
   * @param {string} [type]
   * @param {number} [duration]
   */
  ;

  _proto.info = function info(message, type, duration) {
    if (type === void 0) {
      type = 'info';
    }

    if (duration === void 0) {
      duration = 3000;
    }

    var isComplexMessage = typeof message === 'object';
    this.setState({
      info: {
        isHidden: false,
        type: type,
        message: isComplexMessage ? message.message : message,
        details: isComplexMessage ? message.details : null
      }
    });
    this.emit('info-visible');
    clearTimeout(this.infoTimeoutID);

    if (duration === 0) {
      this.infoTimeoutID = undefined;
      return;
    } // hide the informer after `duration` milliseconds


    this.infoTimeoutID = setTimeout(this.hideInfo, duration);
  };

  _proto.hideInfo = function hideInfo() {
    var newInfo = _extends({}, this.getState().info, {
      isHidden: true
    });

    this.setState({
      info: newInfo
    });
    this.emit('info-hidden');
  }
  /**
   * Passes messages to a function, provided in `opts.logger`.
   * If `opts.logger: Uppy.debugLogger` or `opts.debug: true`, logs to the browser console.
   *
   * @param {string|object} message to log
   * @param {string} [type] optional `error` or `warning`
   */
  ;

  _proto.log = function log(message, type) {
    var logger = this.opts.logger;

    switch (type) {
      case 'error':
        logger.error(message);
        break;

      case 'warning':
        logger.warn(message);
        break;

      default:
        logger.debug(message);
        break;
    }
  }
  /**
   * Obsolete, event listeners are now added in the constructor.
   */
  ;

  _proto.run = function run() {
    this.log('Calling run() is no longer necessary.', 'warning');
    return this;
  }
  /**
   * Restore an upload by its ID.
   */
  ;

  _proto.restore = function restore(uploadID) {
    this.log("Core: attempting to restore upload \"" + uploadID + "\"");

    if (!this.getState().currentUploads[uploadID]) {
      this._removeUpload(uploadID);

      return Promise.reject(new Error('Nonexistent upload'));
    }

    return this._runUpload(uploadID);
  }
  /**
   * Create an upload for a bunch of files.
   *
   * @param {Array<string>} fileIDs File IDs to include in this upload.
   * @returns {string} ID of this upload.
   */
  ;

  _proto._createUpload = function _createUpload(fileIDs, opts) {
    var _extends4;

    if (opts === void 0) {
      opts = {};
    }

    var _opts = opts,
        _opts$forceAllowNewUp = _opts.forceAllowNewUpload,
        forceAllowNewUpload = _opts$forceAllowNewUp === void 0 ? false : _opts$forceAllowNewUp;

    var _this$getState6 = this.getState(),
        allowNewUpload = _this$getState6.allowNewUpload,
        currentUploads = _this$getState6.currentUploads;

    if (!allowNewUpload && !forceAllowNewUpload) {
      throw new Error('Cannot create a new upload: already uploading.');
    }

    var uploadID = cuid();
    this.emit('upload', {
      id: uploadID,
      fileIDs: fileIDs
    });
    this.setState({
      allowNewUpload: this.opts.allowMultipleUploads !== false,
      currentUploads: _extends({}, currentUploads, (_extends4 = {}, _extends4[uploadID] = {
        fileIDs: fileIDs,
        step: 0,
        result: {}
      }, _extends4))
    });
    return uploadID;
  };

  _proto._getUpload = function _getUpload(uploadID) {
    var _this$getState7 = this.getState(),
        currentUploads = _this$getState7.currentUploads;

    return currentUploads[uploadID];
  }
  /**
   * Add data to an upload's result object.
   *
   * @param {string} uploadID The ID of the upload.
   * @param {object} data Data properties to add to the result object.
   */
  ;

  _proto.addResultData = function addResultData(uploadID, data) {
    var _extends5;

    if (!this._getUpload(uploadID)) {
      this.log("Not setting result for an upload that has been removed: " + uploadID);
      return;
    }

    var currentUploads = this.getState().currentUploads;

    var currentUpload = _extends({}, currentUploads[uploadID], {
      result: _extends({}, currentUploads[uploadID].result, data)
    });

    this.setState({
      currentUploads: _extends({}, currentUploads, (_extends5 = {}, _extends5[uploadID] = currentUpload, _extends5))
    });
  }
  /**
   * Remove an upload, eg. if it has been canceled or completed.
   *
   * @param {string} uploadID The ID of the upload.
   */
  ;

  _proto._removeUpload = function _removeUpload(uploadID) {
    var currentUploads = _extends({}, this.getState().currentUploads);

    delete currentUploads[uploadID];
    this.setState({
      currentUploads: currentUploads
    });
  }
  /**
   * Run an upload. This picks up where it left off in case the upload is being restored.
   *
   * @private
   */
  ;

  _proto._runUpload = function _runUpload(uploadID) {
    var _this9 = this;

    var uploadData = this.getState().currentUploads[uploadID];
    var restoreStep = uploadData.step;
    var steps = [].concat(this.preProcessors, this.uploaders, this.postProcessors);
    var lastStep = Promise.resolve();
    steps.forEach(function (fn, step) {
      // Skip this step if we are restoring and have already completed this step before.
      if (step < restoreStep) {
        return;
      }

      lastStep = lastStep.then(function () {
        var _extends6;

        var _this9$getState = _this9.getState(),
            currentUploads = _this9$getState.currentUploads;

        var currentUpload = currentUploads[uploadID];

        if (!currentUpload) {
          return;
        }

        var updatedUpload = _extends({}, currentUpload, {
          step: step
        });

        _this9.setState({
          currentUploads: _extends({}, currentUploads, (_extends6 = {}, _extends6[uploadID] = updatedUpload, _extends6))
        }); // TODO give this the `updatedUpload` object as its only parameter maybe?
        // Otherwise when more metadata may be added to the upload this would keep getting more parameters


        return fn(updatedUpload.fileIDs, uploadID);
      }).then(function (result) {
        return null;
      });
    }); // Not returning the `catch`ed promise, because we still want to return a rejected
    // promise from this method if the upload failed.

    lastStep.catch(function (err) {
      _this9.emit('error', err, uploadID);

      _this9._removeUpload(uploadID);
    });
    return lastStep.then(function () {
      // Set result data.
      var _this9$getState2 = _this9.getState(),
          currentUploads = _this9$getState2.currentUploads;

      var currentUpload = currentUploads[uploadID];

      if (!currentUpload) {
        return;
      }

      var files = currentUpload.fileIDs.map(function (fileID) {
        return _this9.getFile(fileID);
      });
      var successful = files.filter(function (file) {
        return !file.error;
      });
      var failed = files.filter(function (file) {
        return file.error;
      });

      _this9.addResultData(uploadID, {
        successful: successful,
        failed: failed,
        uploadID: uploadID
      });
    }).then(function () {
      // Emit completion events.
      // This is in a separate function so that the `currentUploads` variable
      // always refers to the latest state. In the handler right above it refers
      // to an outdated object without the `.result` property.
      var _this9$getState3 = _this9.getState(),
          currentUploads = _this9$getState3.currentUploads;

      if (!currentUploads[uploadID]) {
        return;
      }

      var currentUpload = currentUploads[uploadID];
      var result = currentUpload.result;

      _this9.emit('complete', result);

      _this9._removeUpload(uploadID);

      return result;
    }).then(function (result) {
      if (result == null) {
        _this9.log("Not setting result for an upload that has been removed: " + uploadID);
      }

      return result;
    });
  }
  /**
   * Start an upload for all the files that are not currently being uploaded.
   *
   * @returns {Promise}
   */
  ;

  _proto.upload = function upload() {
    var _this10 = this;

    if (!this.plugins.uploader) {
      this.log('No uploader type plugins are used', 'warning');
    }

    var files = this.getState().files;
    var onBeforeUploadResult = this.opts.onBeforeUpload(files);

    if (onBeforeUploadResult === false) {
      return Promise.reject(new Error('Not starting the upload because onBeforeUpload returned false'));
    }

    if (onBeforeUploadResult && typeof onBeforeUploadResult === 'object') {
      files = onBeforeUploadResult; // Updating files in state, because uploader plugins receive file IDs,
      // and then fetch the actual file object from state

      this.setState({
        files: files
      });
    }

    return Promise.resolve().then(function () {
      return _this10._checkMinNumberOfFiles(files);
    }).catch(function (err) {
      _this10._showOrLogErrorAndThrow(err);
    }).then(function () {
      var _this10$getState = _this10.getState(),
          currentUploads = _this10$getState.currentUploads; // get a list of files that are currently assigned to uploads


      var currentlyUploadingFiles = Object.keys(currentUploads).reduce(function (prev, curr) {
        return prev.concat(currentUploads[curr].fileIDs);
      }, []);
      var waitingFileIDs = [];
      Object.keys(files).forEach(function (fileID) {
        var file = _this10.getFile(fileID); // if the file hasn't started uploading and hasn't already been assigned to an upload..


        if (!file.progress.uploadStarted && currentlyUploadingFiles.indexOf(fileID) === -1) {
          waitingFileIDs.push(file.id);
        }
      });

      var uploadID = _this10._createUpload(waitingFileIDs);

      return _this10._runUpload(uploadID);
    }).catch(function (err) {
      _this10._showOrLogErrorAndThrow(err, {
        showInformer: false
      });
    });
  };

  _createClass(Uppy, [{
    key: "state",
    get: function get() {
      return this.getState();
    }
  }]);

  return Uppy;
}();

Uppy.VERSION = require('../package.json').version;

module.exports = function (opts) {
  return new Uppy(opts);
}; // Expose class constructor.


module.exports.Uppy = Uppy;
module.exports.Plugin = Plugin;
module.exports.debugLogger = debugLogger;

},{"../package.json":37,"./../../store-default":47,"./../../utils/lib/Translator":54,"./../../utils/lib/generateFileID":57,"./../../utils/lib/getFileNameAndExtension":63,"./../../utils/lib/getFileType":64,"./../../utils/lib/prettyBytes":72,"./Plugin":38,"./loggers":40,"./supportsUploadProgress":41,"cuid":1,"lodash.throttle":9,"mime-match":10,"namespace-emitter":11}],40:[function(require,module,exports){
var getTimeStamp = require('./../../utils/lib/getTimeStamp'); // Swallow all logs, except errors.
// default if logger is not set or debug: false


var justErrorsLogger = {
  debug: function debug() {},
  warn: function warn() {},
  error: function error() {
    var _console;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return (_console = console).error.apply(_console, ["[Uppy] [" + getTimeStamp() + "]"].concat(args));
  }
}; // Print logs to console with namespace + timestamp,
// set by logger: Uppy.debugLogger or debug: true

var debugLogger = {
  debug: function debug() {
    // IE 10 doesn’t support console.debug
    var debug = console.debug || console.log;

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    debug.call.apply(debug, [console, "[Uppy] [" + getTimeStamp() + "]"].concat(args));
  },
  warn: function warn() {
    var _console2;

    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return (_console2 = console).warn.apply(_console2, ["[Uppy] [" + getTimeStamp() + "]"].concat(args));
  },
  error: function error() {
    var _console3;

    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return (_console3 = console).error.apply(_console3, ["[Uppy] [" + getTimeStamp() + "]"].concat(args));
  }
};
module.exports = {
  justErrorsLogger: justErrorsLogger,
  debugLogger: debugLogger
};

},{"./../../utils/lib/getTimeStamp":66}],41:[function(require,module,exports){
// Edge 15.x does not fire 'progress' events on uploads.
// See https://github.com/transloadit/uppy/issues/945
// And https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12224510/
module.exports = function supportsUploadProgress(userAgent) {
  // Allow passing in userAgent for tests
  if (userAgent == null) {
    userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
  } // Assume it works because basically everything supports progress events.


  if (!userAgent) return true;
  var m = /Edge\/(\d+\.\d+)/.exec(userAgent);
  if (!m) return true;
  var edgeVersion = m[1];

  var _edgeVersion$split = edgeVersion.split('.'),
      major = _edgeVersion$split[0],
      minor = _edgeVersion$split[1];

  major = parseInt(major, 10);
  minor = parseInt(minor, 10); // Worked before:
  // Edge 40.15063.0.0
  // Microsoft EdgeHTML 15.15063

  if (major < 15 || major === 15 && minor < 15063) {
    return true;
  } // Fixed in:
  // Microsoft EdgeHTML 18.18218


  if (major > 18 || major === 18 && minor >= 18218) {
    return true;
  } // other versions don't work.


  return false;
};

},{}],42:[function(require,module,exports){
module.exports={
  "name": "@uppy/drag-drop",
  "description": "Droppable zone UI for Uppy. Drag and drop files into it to upload.",
  "version": "1.4.12",
  "license": "MIT",
  "main": "lib/index.js",
  "style": "dist/style.min.css",
  "types": "types/index.d.ts",
  "keywords": [
    "file uploader",
    "uppy",
    "uppy-plugin",
    "drag-drop",
    "drag",
    "drop",
    "dropzone",
    "upload"
  ],
  "homepage": "https://uppy.io",
  "bugs": {
    "url": "https://github.com/transloadit/uppy/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/transloadit/uppy.git"
  },
  "dependencies": {
    "@uppy/utils": "file:../utils",
    "preact": "8.2.9"
  },
  "peerDependencies": {
    "@uppy/core": "^1.0.0"
  }
}

},{}],43:[function(require,module,exports){
var _class, _temp;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var Translator = require('./../../utils/lib/Translator');

var toArray = require('./../../utils/lib/toArray');

var isDragDropSupported = require('./../../utils/lib/isDragDropSupported');

var getDroppedFiles = require('./../../utils/lib/getDroppedFiles');

var _require2 = require('preact'),
    h = _require2.h;
/**
 * Drag & Drop plugin
 *
 */


module.exports = (_temp = _class = /*#__PURE__*/function (_Plugin) {
  _inheritsLoose(DragDrop, _Plugin);

  function DragDrop(uppy, opts) {
    var _this;

    _this = _Plugin.call(this, uppy, opts) || this;
    _this.type = 'acquirer';
    _this.id = _this.opts.id || 'DragDrop';
    _this.title = 'Drag & Drop';
    _this.defaultLocale = {
      strings: {
        dropHereOr: 'Drop files here or %{browse}',
        browse: 'browse'
      }
    }; // Default options

    var defaultOpts = {
      target: null,
      inputName: 'files[]',
      width: '100%',
      height: '100%',
      note: null
    }; // Merge default options with the ones set by user

    _this.opts = _extends({}, defaultOpts, {}, opts); // Check for browser dragDrop support

    _this.isDragDropSupported = isDragDropSupported();
    _this.removeDragOverClassTimeout = null;

    _this.i18nInit(); // Bind `this` to class methods


    _this.onInputChange = _this.onInputChange.bind(_assertThisInitialized(_this));
    _this.handleDragOver = _this.handleDragOver.bind(_assertThisInitialized(_this));
    _this.handleDragLeave = _this.handleDragLeave.bind(_assertThisInitialized(_this));
    _this.handleDrop = _this.handleDrop.bind(_assertThisInitialized(_this));
    _this.addFiles = _this.addFiles.bind(_assertThisInitialized(_this));
    _this.render = _this.render.bind(_assertThisInitialized(_this));
    return _this;
  }

  var _proto = DragDrop.prototype;

  _proto.setOptions = function setOptions(newOpts) {
    _Plugin.prototype.setOptions.call(this, newOpts);

    this.i18nInit();
  };

  _proto.i18nInit = function i18nInit() {
    this.translator = new Translator([this.defaultLocale, this.uppy.locale, this.opts.locale]);
    this.i18n = this.translator.translate.bind(this.translator);
    this.i18nArray = this.translator.translateArray.bind(this.translator);
    this.setPluginState(); // so that UI re-renders and we see the updated locale
  };

  _proto.addFiles = function addFiles(files) {
    var _this2 = this;

    var descriptors = files.map(function (file) {
      return {
        source: _this2.id,
        name: file.name,
        type: file.type,
        data: file,
        meta: {
          // path of the file relative to the ancestor directory the user selected.
          // e.g. 'docs/Old Prague/airbnb.pdf'
          relativePath: file.relativePath || null
        }
      };
    });

    try {
      this.uppy.addFiles(descriptors);
    } catch (err) {
      this.uppy.log(err);
    }
  };

  _proto.onInputChange = function onInputChange(event) {
    this.uppy.log('[DragDrop] Files selected through input');
    var files = toArray(event.target.files);
    this.addFiles(files); // We clear the input after a file is selected, because otherwise
    // change event is not fired in Chrome and Safari when a file
    // with the same name is selected.
    // ___Why not use value="" on <input/> instead?
    //    Because if we use that method of clearing the input,
    //    Chrome will not trigger change if we drop the same file twice (Issue #768).

    event.target.value = null;
  };

  _proto.handleDrop = function handleDrop(event, dropCategory) {
    var _this3 = this;

    event.preventDefault();
    event.stopPropagation();
    clearTimeout(this.removeDragOverClassTimeout); // 2. Remove dragover class

    this.setPluginState({
      isDraggingOver: false
    }); // 3. Add all dropped files

    this.uppy.log('[DragDrop] Files were dropped');

    var logDropError = function logDropError(error) {
      _this3.uppy.log(error, 'error');
    };

    getDroppedFiles(event.dataTransfer, {
      logDropError: logDropError
    }).then(function (files) {
      return _this3.addFiles(files);
    });
  };

  _proto.handleDragOver = function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation(); // 1. Add a small (+) icon on drop
    // (and prevent browsers from interpreting this as files being _moved_ into the browser, https://github.com/transloadit/uppy/issues/1978)

    event.dataTransfer.dropEffect = 'copy';
    clearTimeout(this.removeDragOverClassTimeout);
    this.setPluginState({
      isDraggingOver: true
    });
  };

  _proto.handleDragLeave = function handleDragLeave(event) {
    var _this4 = this;

    event.preventDefault();
    event.stopPropagation();
    clearTimeout(this.removeDragOverClassTimeout); // Timeout against flickering, this solution is taken from drag-drop library. Solution with 'pointer-events: none' didn't work across browsers.

    this.removeDragOverClassTimeout = setTimeout(function () {
      _this4.setPluginState({
        isDraggingOver: false
      });
    }, 50);
  };

  _proto.renderHiddenFileInput = function renderHiddenFileInput() {
    var _this5 = this;

    var restrictions = this.uppy.opts.restrictions;
    return h("input", {
      class: "uppy-DragDrop-input",
      type: "file",
      tabindex: -1,
      focusable: "false",
      ref: function ref(_ref) {
        _this5.fileInputRef = _ref;
      },
      name: this.opts.inputName,
      multiple: restrictions.maxNumberOfFiles !== 1,
      accept: restrictions.allowedFileTypes,
      onchange: this.onInputChange
    });
  };

  _proto.renderArrowSvg = function renderArrowSvg() {
    return h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      class: "UppyIcon uppy-DragDrop-arrow",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16"
    }, h("path", {
      d: "M11 10V0H5v10H2l6 6 6-6h-3zm0 0",
      "fill-rule": "evenodd"
    }));
  };

  _proto.renderLabel = function renderLabel() {
    return h("div", {
      class: "uppy-DragDrop-label"
    }, this.i18nArray('dropHereOr', {
      browse: h("span", {
        class: "uppy-DragDrop-browse"
      }, this.i18n('browse'))
    }));
  };

  _proto.renderNote = function renderNote() {
    return h("span", {
      class: "uppy-DragDrop-note"
    }, this.opts.note);
  };

  _proto.render = function render(state) {
    var _this6 = this;

    var dragDropClass = "\n      uppy-Root\n      uppy-u-reset\n      uppy-DragDrop-container\n      " + (this.isDragDropSupported ? 'uppy-DragDrop--is-dragdrop-supported' : '') + "\n      " + (this.getPluginState().isDraggingOver ? 'uppy-DragDrop--isDraggingOver' : '') + "\n    ";
    var dragDropStyle = {
      width: this.opts.width,
      height: this.opts.height
    };
    return h("button", {
      type: "button",
      class: dragDropClass,
      style: dragDropStyle,
      onClick: function onClick() {
        return _this6.fileInputRef.click();
      },
      onDragOver: this.handleDragOver,
      onDragLeave: this.handleDragLeave,
      onDrop: this.handleDrop
    }, this.renderHiddenFileInput(), h("div", {
      class: "uppy-DragDrop-inner"
    }, this.renderArrowSvg(), this.renderLabel(), this.renderNote()));
  };

  _proto.install = function install() {
    this.setPluginState({
      isDraggingOver: false
    });
    var target = this.opts.target;

    if (target) {
      this.mount(target, this);
    }
  };

  _proto.uninstall = function uninstall() {
    this.unmount();
  };

  return DragDrop;
}(Plugin), _class.VERSION = require('../package.json').version, _temp);

},{"../package.json":42,"./../../core":39,"./../../utils/lib/Translator":54,"./../../utils/lib/getDroppedFiles":58,"./../../utils/lib/isDragDropSupported":69,"./../../utils/lib/toArray":74,"preact":12}],44:[function(require,module,exports){
module.exports={
  "name": "@uppy/progress-bar",
  "description": "A progress bar UI for Uppy",
  "version": "1.3.13",
  "license": "MIT",
  "main": "lib/index.js",
  "style": "dist/style.min.css",
  "types": "types/index.d.ts",
  "keywords": [
    "file uploader",
    "uppy",
    "uppy-plugin",
    "progress",
    "progress bar",
    "upload progress"
  ],
  "homepage": "https://uppy.io",
  "bugs": {
    "url": "https://github.com/transloadit/uppy/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/transloadit/uppy.git"
  },
  "dependencies": {
    "@uppy/utils": "file:../utils",
    "preact": "8.2.9"
  },
  "peerDependencies": {
    "@uppy/core": "^1.0.0"
  }
}

},{}],45:[function(require,module,exports){
var _class, _temp;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var _require2 = require('preact'),
    h = _require2.h;
/**
 * Progress bar
 *
 */


module.exports = (_temp = _class = /*#__PURE__*/function (_Plugin) {
  _inheritsLoose(ProgressBar, _Plugin);

  function ProgressBar(uppy, opts) {
    var _this;

    _this = _Plugin.call(this, uppy, opts) || this;
    _this.id = _this.opts.id || 'ProgressBar';
    _this.title = 'Progress Bar';
    _this.type = 'progressindicator'; // set default options

    var defaultOptions = {
      target: 'body',
      replaceTargetContent: false,
      fixed: false,
      hideAfterFinish: true
    }; // merge default options with the ones set by user

    _this.opts = _extends({}, defaultOptions, opts);
    _this.render = _this.render.bind(_assertThisInitialized(_this));
    return _this;
  }

  var _proto = ProgressBar.prototype;

  _proto.render = function render(state) {
    var progress = state.totalProgress || 0;
    var isHidden = progress === 100 && this.opts.hideAfterFinish;
    return h("div", {
      class: "uppy uppy-ProgressBar",
      style: {
        position: this.opts.fixed ? 'fixed' : 'initial'
      },
      "aria-hidden": isHidden
    }, h("div", {
      class: "uppy-ProgressBar-inner",
      style: {
        width: progress + '%'
      }
    }), h("div", {
      class: "uppy-ProgressBar-percentage"
    }, progress));
  };

  _proto.install = function install() {
    var target = this.opts.target;

    if (target) {
      this.mount(target, this);
    }
  };

  _proto.uninstall = function uninstall() {
    this.unmount();
  };

  return ProgressBar;
}(Plugin), _class.VERSION = require('../package.json').version, _temp);

},{"../package.json":44,"./../../core":39,"preact":12}],46:[function(require,module,exports){
module.exports={
  "name": "@uppy/store-default",
  "description": "The default simple object-based store for Uppy.",
  "version": "1.2.1",
  "license": "MIT",
  "main": "lib/index.js",
  "types": "types/index.d.ts",
  "keywords": [
    "file uploader",
    "uppy",
    "uppy-store"
  ],
  "homepage": "https://uppy.io",
  "bugs": {
    "url": "https://github.com/transloadit/uppy/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/transloadit/uppy.git"
  }
}

},{}],47:[function(require,module,exports){
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/**
 * Default store that keeps state in a simple object.
 */
var DefaultStore = /*#__PURE__*/function () {
  function DefaultStore() {
    this.state = {};
    this.callbacks = [];
  }

  var _proto = DefaultStore.prototype;

  _proto.getState = function getState() {
    return this.state;
  };

  _proto.setState = function setState(patch) {
    var prevState = _extends({}, this.state);

    var nextState = _extends({}, this.state, patch);

    this.state = nextState;

    this._publish(prevState, nextState, patch);
  };

  _proto.subscribe = function subscribe(listener) {
    var _this = this;

    this.callbacks.push(listener);
    return function () {
      // Remove the listener.
      _this.callbacks.splice(_this.callbacks.indexOf(listener), 1);
    };
  };

  _proto._publish = function _publish() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this.callbacks.forEach(function (listener) {
      listener.apply(void 0, args);
    });
  };

  return DefaultStore;
}();

DefaultStore.VERSION = require('../package.json').version;

module.exports = function defaultStore() {
  return new DefaultStore();
};

},{"../package.json":46}],48:[function(require,module,exports){
module.exports={
  "name": "@uppy/tus",
  "description": "Resumable uploads for Uppy using Tus.io",
  "version": "1.5.12",
  "license": "MIT",
  "main": "lib/index.js",
  "types": "types/index.d.ts",
  "keywords": [
    "file uploader",
    "uppy",
    "uppy-plugin",
    "upload",
    "resumable",
    "tus"
  ],
  "homepage": "https://uppy.io",
  "bugs": {
    "url": "https://github.com/transloadit/uppy/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/transloadit/uppy.git"
  },
  "dependencies": {
    "@types/tus-js-client": "^1.8.0",
    "@uppy/companion-client": "file:../companion-client",
    "@uppy/utils": "file:../utils",
    "tus-js-client": "^1.8.0"
  },
  "peerDependencies": {
    "@uppy/core": "^1.0.0"
  }
}

},{}],49:[function(require,module,exports){
var tus = require('tus-js-client');

function isCordova() {
  return typeof window !== 'undefined' && (typeof window.PhoneGap !== 'undefined' || typeof window.Cordova !== 'undefined' || typeof window.cordova !== 'undefined');
}

function isReactNative() {
  return typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative';
} // We override tus fingerprint to uppy’s `file.id`, since the `file.id`
// now also includes `relativePath` for files added from folders.
// This means you can add 2 identical files, if one is in folder a,
// the other in folder b — `a/file.jpg` and `b/file.jpg`, when added
// together with a folder, will be treated as 2 separate files.
//
// For React Native and Cordova, we let tus-js-client’s default
// fingerprint handling take charge.


module.exports = function getFingerprint(uppyFileObj) {
  return function (file, options, callback) {
    if (isCordova() || isReactNative()) {
      return tus.Upload.defaultOptions.fingerprint(file, options, callback);
    }

    var uppyFingerprint = ['tus', uppyFileObj.id, options.endpoint].join('-');
    return callback(null, uppyFingerprint);
  };
};

},{"tus-js-client":25}],50:[function(require,module,exports){
var _class, _temp;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var tus = require('tus-js-client');

var _require2 = require('./../../companion-client'),
    Provider = _require2.Provider,
    RequestClient = _require2.RequestClient,
    Socket = _require2.Socket;

var emitSocketProgress = require('./../../utils/lib/emitSocketProgress');

var getSocketHost = require('./../../utils/lib/getSocketHost');

var settle = require('./../../utils/lib/settle');

var EventTracker = require('./../../utils/lib/EventTracker');

var NetworkError = require('./../../utils/lib/NetworkError');

var isNetworkError = require('./../../utils/lib/isNetworkError');

var RateLimitedQueue = require('./../../utils/lib/RateLimitedQueue');

var getFingerprint = require('./getFingerprint');
/** @typedef {import('..').TusOptions} TusOptions */

/** @typedef {import('@uppy/core').Uppy} Uppy */

/** @typedef {import('@uppy/core').UppyFile} UppyFile */

/** @typedef {import('@uppy/core').FailedUppyFile<{}>} FailedUppyFile */

/**
 * Extracted from https://github.com/tus/tus-js-client/blob/master/lib/upload.js#L13
 * excepted we removed 'fingerprint' key to avoid adding more dependencies
 *
 * @type {TusOptions}
 */


var tusDefaultOptions = {
  endpoint: '',
  resume: true,
  onProgress: null,
  onChunkComplete: null,
  onSuccess: null,
  onError: null,
  headers: {},
  chunkSize: Infinity,
  withCredentials: false,
  uploadUrl: null,
  uploadSize: null,
  overridePatchMethod: false,
  retryDelays: null
};
/**
 * Tus resumable file uploader
 */

module.exports = (_temp = _class = /*#__PURE__*/function (_Plugin) {
  _inheritsLoose(Tus, _Plugin);

  /**
   * @param {Uppy} uppy
   * @param {TusOptions} opts
   */
  function Tus(uppy, opts) {
    var _this;

    _this = _Plugin.call(this, uppy, opts) || this;
    _this.type = 'uploader';
    _this.id = _this.opts.id || 'Tus';
    _this.title = 'Tus'; // set default options

    var defaultOptions = {
      resume: true,
      autoRetry: true,
      useFastRemoteRetry: true,
      limit: 0,
      retryDelays: [0, 1000, 3000, 5000]
    }; // merge default options with the ones set by user

    /** @type {import("..").TusOptions} */

    _this.opts = _extends({}, defaultOptions, opts);
    /**
     * Simultaneous upload limiting is shared across all uploads with this plugin.
     *
     * @type {RateLimitedQueue}
     */

    _this.requests = new RateLimitedQueue(_this.opts.limit);
    _this.uploaders = Object.create(null);
    _this.uploaderEvents = Object.create(null);
    _this.uploaderSockets = Object.create(null);
    _this.handleResetProgress = _this.handleResetProgress.bind(_assertThisInitialized(_this));
    _this.handleUpload = _this.handleUpload.bind(_assertThisInitialized(_this));
    return _this;
  }

  var _proto = Tus.prototype;

  _proto.handleResetProgress = function handleResetProgress() {
    var files = _extends({}, this.uppy.getState().files);

    Object.keys(files).forEach(function (fileID) {
      // Only clone the file object if it has a Tus `uploadUrl` attached.
      if (files[fileID].tus && files[fileID].tus.uploadUrl) {
        var tusState = _extends({}, files[fileID].tus);

        delete tusState.uploadUrl;
        files[fileID] = _extends({}, files[fileID], {
          tus: tusState
        });
      }
    });
    this.uppy.setState({
      files: files
    });
  }
  /**
   * Clean up all references for a file's upload: the tus.Upload instance,
   * any events related to the file, and the Companion WebSocket connection.
   *
   * @param {string} fileID
   */
  ;

  _proto.resetUploaderReferences = function resetUploaderReferences(fileID, opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (this.uploaders[fileID]) {
      var uploader = this.uploaders[fileID];
      uploader.abort();

      if (opts.abort) {
        // to avoid 423 error from tus server, we wait
        // to be sure the previous request has been aborted before terminating the upload
        // @todo remove the timeout when this "wait" is handled in tus-js-client internally
        setTimeout(function () {
          return uploader.abort(true);
        }, 1000);
      }

      this.uploaders[fileID] = null;
    }

    if (this.uploaderEvents[fileID]) {
      this.uploaderEvents[fileID].remove();
      this.uploaderEvents[fileID] = null;
    }

    if (this.uploaderSockets[fileID]) {
      this.uploaderSockets[fileID].close();
      this.uploaderSockets[fileID] = null;
    }
  }
  /**
   * Create a new Tus upload.
   *
   * A lot can happen during an upload, so this is quite hard to follow!
   * - First, the upload is started. If the file was already paused by the time the upload starts, nothing should happen.
   *   If the `limit` option is used, the upload must be queued onto the `this.requests` queue.
   *   When an upload starts, we store the tus.Upload instance, and an EventTracker instance that manages the event listeners
   *   for pausing, cancellation, removal, etc.
   * - While the upload is in progress, it may be paused or cancelled.
   *   Pausing aborts the underlying tus.Upload, and removes the upload from the `this.requests` queue. All other state is
   *   maintained.
   *   Cancelling removes the upload from the `this.requests` queue, and completely aborts the upload--the tus.Upload instance
   *   is aborted and discarded, the EventTracker instance is destroyed (removing all listeners).
   *   Resuming the upload uses the `this.requests` queue as well, to prevent selectively pausing and resuming uploads from
   *   bypassing the limit.
   * - After completing an upload, the tus.Upload and EventTracker instances are cleaned up, and the upload is marked as done
   *   in the `this.requests` queue.
   * - When an upload completed with an error, the same happens as on successful completion, but the `upload()` promise is rejected.
   *
   * When working on this function, keep in mind:
   *  - When an upload is completed or cancelled for any reason, the tus.Upload and EventTracker instances need to be cleaned up using this.resetUploaderReferences().
   *  - When an upload is cancelled or paused, for any reason, it needs to be removed from the `this.requests` queue using `queuedRequest.abort()`.
   *  - When an upload is completed for any reason, including errors, it needs to be marked as such using `queuedRequest.done()`.
   *  - When an upload is started or resumed, it needs to go through the `this.requests` queue. The `queuedRequest` variable must be updated so the other uses of it are valid.
   *  - Before replacing the `queuedRequest` variable, the previous `queuedRequest` must be aborted, else it will keep taking up a spot in the queue.
   *
   * @param {UppyFile} file for use with upload
   * @param {number} current file in a queue
   * @param {number} total number of files in a queue
   * @returns {Promise<void>}
   */
  ;

  _proto.upload = function upload(file, current, total) {
    var _this2 = this;

    this.resetUploaderReferences(file.id); // Create a new tus upload

    return new Promise(function (resolve, reject) {
      _this2.uppy.emit('upload-started', file);

      var optsTus = _extends({}, tusDefaultOptions, _this2.opts, // Install file-specific upload overrides.
      file.tus || {}); // We override tus fingerprint to uppy’s `file.id`, since the `file.id`
      // now also includes `relativePath` for files added from folders.
      // This means you can add 2 identical files, if one is in folder a,
      // the other in folder b.


      optsTus.fingerprint = getFingerprint(file);

      optsTus.onError = function (err) {
        _this2.uppy.log(err);

        if (isNetworkError(err.originalRequest)) {
          err = new NetworkError(err, err.originalRequest);
        }

        _this2.uppy.emit('upload-error', file, err);

        _this2.resetUploaderReferences(file.id);

        queuedRequest.done();
        reject(err);
      };

      optsTus.onProgress = function (bytesUploaded, bytesTotal) {
        _this2.onReceiveUploadUrl(file, upload.url);

        _this2.uppy.emit('upload-progress', file, {
          uploader: _this2,
          bytesUploaded: bytesUploaded,
          bytesTotal: bytesTotal
        });
      };

      optsTus.onSuccess = function () {
        var uploadResp = {
          uploadURL: upload.url
        };

        _this2.uppy.emit('upload-success', file, uploadResp);

        if (upload.url) {
          _this2.uppy.log('Download ' + upload.file.name + ' from ' + upload.url);
        }

        _this2.resetUploaderReferences(file.id);

        queuedRequest.done();
        resolve(upload);
      };

      var copyProp = function copyProp(obj, srcProp, destProp) {
        if (Object.prototype.hasOwnProperty.call(obj, srcProp) && !Object.prototype.hasOwnProperty.call(obj, destProp)) {
          obj[destProp] = obj[srcProp];
        }
      };

      var meta = {};
      var metaFields = Array.isArray(optsTus.metaFields) ? optsTus.metaFields // Send along all fields by default.
      : Object.keys(file.meta);
      metaFields.forEach(function (item) {
        meta[item] = file.meta[item];
      }); // tusd uses metadata fields 'filetype' and 'filename'

      copyProp(meta, 'type', 'filetype');
      copyProp(meta, 'name', 'filename');
      optsTus.metadata = meta;
      var upload = new tus.Upload(file.data, optsTus);
      _this2.uploaders[file.id] = upload;
      _this2.uploaderEvents[file.id] = new EventTracker(_this2.uppy);

      var queuedRequest = _this2.requests.run(function () {
        if (!file.isPaused) {
          upload.start();
        } // Don't do anything here, the caller will take care of cancelling the upload itself
        // using resetUploaderReferences(). This is because resetUploaderReferences() has to be
        // called when this request is still in the queue, and has not been started yet, too. At
        // that point this cancellation function is not going to be called.
        // Also, we need to remove the request from the queue _without_ destroying everything
        // related to this upload to handle pauses.


        return function () {};
      });

      _this2.onFileRemove(file.id, function (targetFileID) {
        queuedRequest.abort();

        _this2.resetUploaderReferences(file.id, {
          abort: !!upload.url
        });

        resolve("upload " + targetFileID + " was removed");
      });

      _this2.onPause(file.id, function (isPaused) {
        if (isPaused) {
          // Remove this file from the queue so another file can start in its place.
          queuedRequest.abort();
          upload.abort();
        } else {
          // Resuming an upload should be queued, else you could pause and then resume a queued upload to make it skip the queue.
          queuedRequest.abort();
          queuedRequest = _this2.requests.run(function () {
            upload.start();
            return function () {};
          });
        }
      });

      _this2.onPauseAll(file.id, function () {
        queuedRequest.abort();
        upload.abort();
      });

      _this2.onCancelAll(file.id, function () {
        queuedRequest.abort();

        _this2.resetUploaderReferences(file.id, {
          abort: !!upload.url
        });

        resolve("upload " + file.id + " was canceled");
      });

      _this2.onResumeAll(file.id, function () {
        queuedRequest.abort();

        if (file.error) {
          upload.abort();
        }

        queuedRequest = _this2.requests.run(function () {
          upload.start();
          return function () {};
        });
      });
    }).catch(function (err) {
      _this2.uppy.emit('upload-error', file, err);

      throw err;
    });
  }
  /**
   * @param {UppyFile} file for use with upload
   * @param {number} current file in a queue
   * @param {number} total number of files in a queue
   * @returns {Promise<void>}
   */
  ;

  _proto.uploadRemote = function uploadRemote(file, current, total) {
    var _this3 = this;

    this.resetUploaderReferences(file.id);

    var opts = _extends({}, this.opts);

    if (file.tus) {
      // Install file-specific upload overrides.
      _extends(opts, file.tus);
    }

    this.uppy.emit('upload-started', file);
    this.uppy.log(file.remote.url);

    if (file.serverToken) {
      return this.connectToServerSocket(file);
    }

    return new Promise(function (resolve, reject) {
      var Client = file.remote.providerOptions.provider ? Provider : RequestClient;
      var client = new Client(_this3.uppy, file.remote.providerOptions); // !! cancellation is NOT supported at this stage yet

      client.post(file.remote.url, _extends({}, file.remote.body, {
        endpoint: opts.endpoint,
        uploadUrl: opts.uploadUrl,
        protocol: 'tus',
        size: file.data.size,
        metadata: file.meta
      })).then(function (res) {
        _this3.uppy.setFileState(file.id, {
          serverToken: res.token
        });

        file = _this3.uppy.getFile(file.id);
        return _this3.connectToServerSocket(file);
      }).then(function () {
        resolve();
      }).catch(function (err) {
        _this3.uppy.emit('upload-error', file, err);

        reject(err);
      });
    });
  }
  /**
   * See the comment on the upload() method.
   *
   * Additionally, when an upload is removed, completed, or cancelled, we need to close the WebSocket connection. This is handled by the resetUploaderReferences() function, so the same guidelines apply as in upload().
   *
   * @param {UppyFile} file
   */
  ;

  _proto.connectToServerSocket = function connectToServerSocket(file) {
    var _this4 = this;

    return new Promise(function (resolve, reject) {
      var token = file.serverToken;
      var host = getSocketHost(file.remote.companionUrl);
      var socket = new Socket({
        target: host + "/api/" + token,
        autoOpen: false
      });
      _this4.uploaderSockets[file.id] = socket;
      _this4.uploaderEvents[file.id] = new EventTracker(_this4.uppy);

      _this4.onFileRemove(file.id, function () {
        queuedRequest.abort(); // still send pause event in case we are dealing with older version of companion
        // @todo don't send pause event in the next major release.

        socket.send('pause', {});
        socket.send('cancel', {});

        _this4.resetUploaderReferences(file.id);

        resolve("upload " + file.id + " was removed");
      });

      _this4.onPause(file.id, function (isPaused) {
        if (isPaused) {
          // Remove this file from the queue so another file can start in its place.
          queuedRequest.abort();
          socket.send('pause', {});
        } else {
          // Resuming an upload should be queued, else you could pause and then resume a queued upload to make it skip the queue.
          queuedRequest.abort();
          queuedRequest = _this4.requests.run(function () {
            socket.send('resume', {});
            return function () {};
          });
        }
      });

      _this4.onPauseAll(file.id, function () {
        queuedRequest.abort();
        socket.send('pause', {});
      });

      _this4.onCancelAll(file.id, function () {
        queuedRequest.abort(); // still send pause event in case we are dealing with older version of companion
        // @todo don't send pause event in the next major release.

        socket.send('pause', {});
        socket.send('cancel', {});

        _this4.resetUploaderReferences(file.id);

        resolve("upload " + file.id + " was canceled");
      });

      _this4.onResumeAll(file.id, function () {
        queuedRequest.abort();

        if (file.error) {
          socket.send('pause', {});
        }

        queuedRequest = _this4.requests.run(function () {
          socket.send('resume', {});
          return function () {};
        });
      });

      _this4.onRetry(file.id, function () {
        // Only do the retry if the upload is actually in progress;
        // else we could try to send these messages when the upload is still queued.
        // We may need a better check for this since the socket may also be closed
        // for other reasons, like network failures.
        if (socket.isOpen) {
          socket.send('pause', {});
          socket.send('resume', {});
        }
      });

      _this4.onRetryAll(file.id, function () {
        // See the comment in the onRetry() call
        if (socket.isOpen) {
          socket.send('pause', {});
          socket.send('resume', {});
        }
      });

      socket.on('progress', function (progressData) {
        return emitSocketProgress(_this4, progressData, file);
      });
      socket.on('error', function (errData) {
        var message = errData.error.message;

        var error = _extends(new Error(message), {
          cause: errData.error
        }); // If the remote retry optimisation should not be used,
        // close the socket—this will tell companion to clear state and delete the file.


        if (!_this4.opts.useFastRemoteRetry) {
          _this4.resetUploaderReferences(file.id); // Remove the serverToken so that a new one will be created for the retry.


          _this4.uppy.setFileState(file.id, {
            serverToken: null
          });
        } else {
          socket.close();
        }

        _this4.uppy.emit('upload-error', file, error);

        queuedRequest.done();
        reject(error);
      });
      socket.on('success', function (data) {
        var uploadResp = {
          uploadURL: data.url
        };

        _this4.uppy.emit('upload-success', file, uploadResp);

        _this4.resetUploaderReferences(file.id);

        queuedRequest.done();
        resolve();
      });

      var queuedRequest = _this4.requests.run(function () {
        socket.open();

        if (file.isPaused) {
          socket.send('pause', {});
        } // Don't do anything here, the caller will take care of cancelling the upload itself
        // using resetUploaderReferences(). This is because resetUploaderReferences() has to be
        // called when this request is still in the queue, and has not been started yet, too. At
        // that point this cancellation function is not going to be called.
        // Also, we need to remove the request from the queue _without_ destroying everything
        // related to this upload to handle pauses.


        return function () {};
      });
    });
  }
  /**
   * Store the uploadUrl on the file options, so that when Golden Retriever
   * restores state, we will continue uploading to the correct URL.
   *
   * @param {UppyFile} file
   * @param {string} uploadURL
   */
  ;

  _proto.onReceiveUploadUrl = function onReceiveUploadUrl(file, uploadURL) {
    var currentFile = this.uppy.getFile(file.id);
    if (!currentFile) return; // Only do the update if we didn't have an upload URL yet.

    if (!currentFile.tus || currentFile.tus.uploadUrl !== uploadURL) {
      this.uppy.log('[Tus] Storing upload url');
      this.uppy.setFileState(currentFile.id, {
        tus: _extends({}, currentFile.tus, {
          uploadUrl: uploadURL
        })
      });
    }
  }
  /**
   * @param {string} fileID
   * @param {function(string): void} cb
   */
  ;

  _proto.onFileRemove = function onFileRemove(fileID, cb) {
    this.uploaderEvents[fileID].on('file-removed', function (file) {
      if (fileID === file.id) cb(file.id);
    });
  }
  /**
   * @param {string} fileID
   * @param {function(boolean): void} cb
   */
  ;

  _proto.onPause = function onPause(fileID, cb) {
    this.uploaderEvents[fileID].on('upload-pause', function (targetFileID, isPaused) {
      if (fileID === targetFileID) {
        // const isPaused = this.uppy.pauseResume(fileID)
        cb(isPaused);
      }
    });
  }
  /**
   * @param {string} fileID
   * @param {function(): void} cb
   */
  ;

  _proto.onRetry = function onRetry(fileID, cb) {
    this.uploaderEvents[fileID].on('upload-retry', function (targetFileID) {
      if (fileID === targetFileID) {
        cb();
      }
    });
  }
  /**
   * @param {string} fileID
   * @param {function(): void} cb
   */
  ;

  _proto.onRetryAll = function onRetryAll(fileID, cb) {
    var _this5 = this;

    this.uploaderEvents[fileID].on('retry-all', function (filesToRetry) {
      if (!_this5.uppy.getFile(fileID)) return;
      cb();
    });
  }
  /**
   * @param {string} fileID
   * @param {function(): void} cb
   */
  ;

  _proto.onPauseAll = function onPauseAll(fileID, cb) {
    var _this6 = this;

    this.uploaderEvents[fileID].on('pause-all', function () {
      if (!_this6.uppy.getFile(fileID)) return;
      cb();
    });
  }
  /**
   * @param {string} fileID
   * @param {function(): void} cb
   */
  ;

  _proto.onCancelAll = function onCancelAll(fileID, cb) {
    var _this7 = this;

    this.uploaderEvents[fileID].on('cancel-all', function () {
      if (!_this7.uppy.getFile(fileID)) return;
      cb();
    });
  }
  /**
   * @param {string} fileID
   * @param {function(): void} cb
   */
  ;

  _proto.onResumeAll = function onResumeAll(fileID, cb) {
    var _this8 = this;

    this.uploaderEvents[fileID].on('resume-all', function () {
      if (!_this8.uppy.getFile(fileID)) return;
      cb();
    });
  }
  /**
   * @param {(UppyFile | FailedUppyFile)[]} files
   */
  ;

  _proto.uploadFiles = function uploadFiles(files) {
    var _this9 = this;

    var promises = files.map(function (file, i) {
      var current = i + 1;
      var total = files.length;

      if ('error' in file && file.error) {
        return Promise.reject(new Error(file.error));
      } else if (file.isRemote) {
        return _this9.uploadRemote(file, current, total);
      } else {
        return _this9.upload(file, current, total);
      }
    });
    return settle(promises);
  }
  /**
   * @param {string[]} fileIDs
   */
  ;

  _proto.handleUpload = function handleUpload(fileIDs) {
    var _this10 = this;

    if (fileIDs.length === 0) {
      this.uppy.log('[Tus] No files to upload');
      return Promise.resolve();
    }

    if (this.opts.limit === 0) {
      this.uppy.log('[Tus] When uploading multiple files at once, consider setting the `limit` option (to `10` for example), to limit the number of concurrent uploads, which helps prevent memory and network issues: https://uppy.io/docs/tus/#limit-0', 'warning');
    }

    this.uppy.log('[Tus] Uploading...');
    var filesToUpload = fileIDs.map(function (fileID) {
      return _this10.uppy.getFile(fileID);
    });
    return this.uploadFiles(filesToUpload).then(function () {
      return null;
    });
  };

  _proto.install = function install() {
    this.uppy.setState({
      capabilities: _extends({}, this.uppy.getState().capabilities, {
        resumableUploads: true
      })
    });
    this.uppy.addUploader(this.handleUpload);
    this.uppy.on('reset-progress', this.handleResetProgress);

    if (this.opts.autoRetry) {
      this.uppy.on('back-online', this.uppy.retryAll);
    }
  };

  _proto.uninstall = function uninstall() {
    this.uppy.setState({
      capabilities: _extends({}, this.uppy.getState().capabilities, {
        resumableUploads: false
      })
    });
    this.uppy.removeUploader(this.handleUpload);

    if (this.opts.autoRetry) {
      this.uppy.off('back-online', this.uppy.retryAll);
    }
  };

  return Tus;
}(Plugin), _class.VERSION = require('../package.json').version, _temp);

},{"../package.json":48,"./../../companion-client":35,"./../../core":39,"./../../utils/lib/EventTracker":51,"./../../utils/lib/NetworkError":52,"./../../utils/lib/RateLimitedQueue":53,"./../../utils/lib/emitSocketProgress":55,"./../../utils/lib/getSocketHost":65,"./../../utils/lib/isNetworkError":70,"./../../utils/lib/settle":73,"./getFingerprint":49,"tus-js-client":25}],51:[function(require,module,exports){
/**
 * Create a wrapper around an event emitter with a `remove` method to remove
 * all events that were added using the wrapped emitter.
 */
module.exports = /*#__PURE__*/function () {
  function EventTracker(emitter) {
    this._events = [];
    this._emitter = emitter;
  }

  var _proto = EventTracker.prototype;

  _proto.on = function on(event, fn) {
    this._events.push([event, fn]);

    return this._emitter.on(event, fn);
  };

  _proto.remove = function remove() {
    var _this = this;

    this._events.forEach(function (_ref) {
      var event = _ref[0],
          fn = _ref[1];

      _this._emitter.off(event, fn);
    });
  };

  return EventTracker;
}();

},{}],52:[function(require,module,exports){
function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var NetworkError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(NetworkError, _Error);

  function NetworkError(error, xhr) {
    var _this;

    if (xhr === void 0) {
      xhr = null;
    }

    _this = _Error.call(this, "This looks like a network error, the endpoint might be blocked by an internet provider or a firewall.\n\nSource error: [" + error + "]") || this;
    _this.isNetworkError = true;
    _this.request = xhr;
    return _this;
  }

  return NetworkError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

module.exports = NetworkError;

},{}],53:[function(require,module,exports){
/**
 * Array.prototype.findIndex ponyfill for old browsers.
 */
function findIndex(array, predicate) {
  for (var i = 0; i < array.length; i++) {
    if (predicate(array[i])) return i;
  }

  return -1;
}

function createCancelError() {
  return new Error('Cancelled');
}

module.exports = /*#__PURE__*/function () {
  function RateLimitedQueue(limit) {
    if (typeof limit !== 'number' || limit === 0) {
      this.limit = Infinity;
    } else {
      this.limit = limit;
    }

    this.activeRequests = 0;
    this.queuedHandlers = [];
  }

  var _proto = RateLimitedQueue.prototype;

  _proto._call = function _call(fn) {
    var _this = this;

    this.activeRequests += 1;
    var _done = false;
    var cancelActive;

    try {
      cancelActive = fn();
    } catch (err) {
      this.activeRequests -= 1;
      throw err;
    }

    return {
      abort: function abort() {
        if (_done) return;
        _done = true;
        _this.activeRequests -= 1;
        cancelActive();

        _this._queueNext();
      },
      done: function done() {
        if (_done) return;
        _done = true;
        _this.activeRequests -= 1;

        _this._queueNext();
      }
    };
  };

  _proto._queueNext = function _queueNext() {
    var _this2 = this;

    // Do it soon but not immediately, this allows clearing out the entire queue synchronously
    // one by one without continuously _advancing_ it (and starting new tasks before immediately
    // aborting them)
    Promise.resolve().then(function () {
      _this2._next();
    });
  };

  _proto._next = function _next() {
    if (this.activeRequests >= this.limit) {
      return;
    }

    if (this.queuedHandlers.length === 0) {
      return;
    } // Dispatch the next request, and update the abort/done handlers
    // so that cancelling it does the Right Thing (and doesn't just try
    // to dequeue an already-running request).


    var next = this.queuedHandlers.shift();

    var handler = this._call(next.fn);

    next.abort = handler.abort;
    next.done = handler.done;
  };

  _proto._queue = function _queue(fn, options) {
    var _this3 = this;

    if (options === void 0) {
      options = {};
    }

    var handler = {
      fn: fn,
      priority: options.priority || 0,
      abort: function abort() {
        _this3._dequeue(handler);
      },
      done: function done() {
        throw new Error('Cannot mark a queued request as done: this indicates a bug');
      }
    };
    var index = findIndex(this.queuedHandlers, function (other) {
      return handler.priority > other.priority;
    });

    if (index === -1) {
      this.queuedHandlers.push(handler);
    } else {
      this.queuedHandlers.splice(index, 0, handler);
    }

    return handler;
  };

  _proto._dequeue = function _dequeue(handler) {
    var index = this.queuedHandlers.indexOf(handler);

    if (index !== -1) {
      this.queuedHandlers.splice(index, 1);
    }
  };

  _proto.run = function run(fn, queueOptions) {
    if (this.activeRequests < this.limit) {
      return this._call(fn);
    }

    return this._queue(fn, queueOptions);
  };

  _proto.wrapPromiseFunction = function wrapPromiseFunction(fn, queueOptions) {
    var _this4 = this;

    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var queuedRequest;
      var outerPromise = new Promise(function (resolve, reject) {
        queuedRequest = _this4.run(function () {
          var cancelError;
          var innerPromise;

          try {
            innerPromise = Promise.resolve(fn.apply(void 0, args));
          } catch (err) {
            innerPromise = Promise.reject(err);
          }

          innerPromise.then(function (result) {
            if (cancelError) {
              reject(cancelError);
            } else {
              queuedRequest.done();
              resolve(result);
            }
          }, function (err) {
            if (cancelError) {
              reject(cancelError);
            } else {
              queuedRequest.done();
              reject(err);
            }
          });
          return function () {
            cancelError = createCancelError();
          };
        }, queueOptions);
      });

      outerPromise.abort = function () {
        queuedRequest.abort();
      };

      return outerPromise;
    };
  };

  return RateLimitedQueue;
}();

},{}],54:[function(require,module,exports){
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var has = require('./hasProperty');
/**
 * Translates strings with interpolation & pluralization support.
 * Extensible with custom dictionaries and pluralization functions.
 *
 * Borrows heavily from and inspired by Polyglot https://github.com/airbnb/polyglot.js,
 * basically a stripped-down version of it. Differences: pluralization functions are not hardcoded
 * and can be easily added among with dictionaries, nested objects are used for pluralization
 * as opposed to `||||` delimeter
 *
 * Usage example: `translator.translate('files_chosen', {smart_count: 3})`
 */


module.exports = /*#__PURE__*/function () {
  /**
   * @param {object|Array<object>} locales - locale or list of locales.
   */
  function Translator(locales) {
    var _this = this;

    this.locale = {
      strings: {},
      pluralize: function pluralize(n) {
        if (n === 1) {
          return 0;
        }

        return 1;
      }
    };

    if (Array.isArray(locales)) {
      locales.forEach(function (locale) {
        return _this._apply(locale);
      });
    } else {
      this._apply(locales);
    }
  }

  var _proto = Translator.prototype;

  _proto._apply = function _apply(locale) {
    if (!locale || !locale.strings) {
      return;
    }

    var prevLocale = this.locale;
    this.locale = _extends({}, prevLocale, {
      strings: _extends({}, prevLocale.strings, locale.strings)
    });
    this.locale.pluralize = locale.pluralize || prevLocale.pluralize;
  }
  /**
   * Takes a string with placeholder variables like `%{smart_count} file selected`
   * and replaces it with values from options `{smart_count: 5}`
   *
   * @license https://github.com/airbnb/polyglot.js/blob/master/LICENSE
   * taken from https://github.com/airbnb/polyglot.js/blob/master/lib/polyglot.js#L299
   *
   * @param {string} phrase that needs interpolation, with placeholders
   * @param {object} options with values that will be used to replace placeholders
   * @returns {string} interpolated
   */
  ;

  _proto.interpolate = function interpolate(phrase, options) {
    var _String$prototype = String.prototype,
        split = _String$prototype.split,
        replace = _String$prototype.replace;
    var dollarRegex = /\$/g;
    var dollarBillsYall = '$$$$';
    var interpolated = [phrase];

    for (var arg in options) {
      if (arg !== '_' && has(options, arg)) {
        // Ensure replacement value is escaped to prevent special $-prefixed
        // regex replace tokens. the "$$$$" is needed because each "$" needs to
        // be escaped with "$" itself, and we need two in the resulting output.
        var replacement = options[arg];

        if (typeof replacement === 'string') {
          replacement = replace.call(options[arg], dollarRegex, dollarBillsYall);
        } // We create a new `RegExp` each time instead of using a more-efficient
        // string replace so that the same argument can be replaced multiple times
        // in the same phrase.


        interpolated = insertReplacement(interpolated, new RegExp('%\\{' + arg + '\\}', 'g'), replacement);
      }
    }

    return interpolated;

    function insertReplacement(source, rx, replacement) {
      var newParts = [];
      source.forEach(function (chunk) {
        // When the source contains multiple placeholders for interpolation,
        // we should ignore chunks that are not strings, because those
        // can be JSX objects and will be otherwise incorrectly turned into strings.
        // Without this condition we’d get this: [object Object] hello [object Object] my <button>
        if (typeof chunk !== 'string') {
          return newParts.push(chunk);
        }

        split.call(chunk, rx).forEach(function (raw, i, list) {
          if (raw !== '') {
            newParts.push(raw);
          } // Interlace with the `replacement` value


          if (i < list.length - 1) {
            newParts.push(replacement);
          }
        });
      });
      return newParts;
    }
  }
  /**
   * Public translate method
   *
   * @param {string} key
   * @param {object} options with values that will be used later to replace placeholders in string
   * @returns {string} translated (and interpolated)
   */
  ;

  _proto.translate = function translate(key, options) {
    return this.translateArray(key, options).join('');
  }
  /**
   * Get a translation and return the translated and interpolated parts as an array.
   *
   * @param {string} key
   * @param {object} options with values that will be used to replace placeholders
   * @returns {Array} The translated and interpolated parts, in order.
   */
  ;

  _proto.translateArray = function translateArray(key, options) {
    var string = this.locale.strings[key];
    var hasPluralForms = typeof string === 'object';

    if (hasPluralForms) {
      if (options && typeof options.smart_count !== 'undefined') {
        var plural = this.locale.pluralize(options.smart_count);
        return this.interpolate(string[plural], options);
      } else {
        throw new Error('Attempted to use a string with plural forms, but no value was given for %{smart_count}');
      }
    }

    return this.interpolate(string, options);
  };

  return Translator;
}();

},{"./hasProperty":67}],55:[function(require,module,exports){
var throttle = require('lodash.throttle');

function _emitSocketProgress(uploader, progressData, file) {
  var progress = progressData.progress,
      bytesUploaded = progressData.bytesUploaded,
      bytesTotal = progressData.bytesTotal;

  if (progress) {
    uploader.uppy.log("Upload progress: " + progress);
    uploader.uppy.emit('upload-progress', file, {
      uploader: uploader,
      bytesUploaded: bytesUploaded,
      bytesTotal: bytesTotal
    });
  }
}

module.exports = throttle(_emitSocketProgress, 300, {
  leading: true,
  trailing: true
});

},{"lodash.throttle":9}],56:[function(require,module,exports){
var isDOMElement = require('./isDOMElement');
/**
 * Find a DOM element.
 *
 * @param {Node|string} element
 * @returns {Node|null}
 */


module.exports = function findDOMElement(element, context) {
  if (context === void 0) {
    context = document;
  }

  if (typeof element === 'string') {
    return context.querySelector(element);
  }

  if (isDOMElement(element)) {
    return element;
  }
};

},{"./isDOMElement":68}],57:[function(require,module,exports){
/**
 * Takes a file object and turns it into fileID, by converting file.name to lowercase,
 * removing extra characters and adding type, size and lastModified
 *
 * @param {object} file
 * @returns {string} the fileID
 */
module.exports = function generateFileID(file) {
  // It's tempting to do `[items].filter(Boolean).join('-')` here, but that
  // is slower! simple string concatenation is fast
  var id = 'uppy';

  if (typeof file.name === 'string') {
    id += '-' + encodeFilename(file.name.toLowerCase());
  }

  if (file.type !== undefined) {
    id += '-' + file.type;
  }

  if (file.meta && typeof file.meta.relativePath === 'string') {
    id += '-' + encodeFilename(file.meta.relativePath.toLowerCase());
  }

  if (file.data.size !== undefined) {
    id += '-' + file.data.size;
  }

  if (file.data.lastModified !== undefined) {
    id += '-' + file.data.lastModified;
  }

  return id;
};

function encodeFilename(name) {
  var suffix = '';
  return name.replace(/[^A-Z0-9]/ig, function (character) {
    suffix += '-' + encodeCharacter(character);
    return '/';
  }) + suffix;
}

function encodeCharacter(character) {
  return character.charCodeAt(0).toString(32);
}

},{}],58:[function(require,module,exports){
var webkitGetAsEntryApi = require('./utils/webkitGetAsEntryApi/index');

var fallbackApi = require('./utils/fallbackApi');
/**
 * Returns a promise that resolves to the array of dropped files (if a folder is dropped, and browser supports folder parsing - promise resolves to the flat array of all files in all directories).
 * Each file has .relativePath prop appended to it (e.g. "/docs/Prague/ticket_from_prague_to_ufa.pdf") if browser supports it. Otherwise it's undefined.
 *
 * @param {DataTransfer} dataTransfer
 * @param {Function} logDropError - a function that's called every time some folder or some file error out (e.g. because of the folder name being too long on Windows). Notice that resulting promise will always be resolved anyway.
 *
 * @returns {Promise} - Array<File>
 */


module.exports = function getDroppedFiles(dataTransfer, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$logDropError = _ref.logDropError,
      logDropError = _ref$logDropError === void 0 ? function () {} : _ref$logDropError;

  // Get all files from all subdirs. Works (at least) in Chrome, Mozilla, and Safari
  if (dataTransfer.items && dataTransfer.items[0] && 'webkitGetAsEntry' in dataTransfer.items[0]) {
    return webkitGetAsEntryApi(dataTransfer, logDropError); // Otherwise just return all first-order files
  } else {
    return fallbackApi(dataTransfer);
  }
};

},{"./utils/fallbackApi":59,"./utils/webkitGetAsEntryApi/index":62}],59:[function(require,module,exports){
var toArray = require('../../toArray'); // .files fallback, should be implemented in any browser


module.exports = function fallbackApi(dataTransfer) {
  var files = toArray(dataTransfer.files);
  return Promise.resolve(files);
};

},{"../../toArray":74}],60:[function(require,module,exports){
/**
 * Recursive function, calls the original callback() when the directory is entirely parsed.
 *
 * @param {FileSystemDirectoryReader} directoryReader
 * @param {Array} oldEntries
 * @param {Function} logDropError
 * @param {Function} callback - called with ([ all files and directories in that directoryReader ])
 */
module.exports = function getFilesAndDirectoriesFromDirectory(directoryReader, oldEntries, logDropError, _ref) {
  var onSuccess = _ref.onSuccess;
  directoryReader.readEntries(function (entries) {
    var newEntries = [].concat(oldEntries, entries); // According to the FileSystem API spec, getFilesAndDirectoriesFromDirectory() must be called until it calls the onSuccess with an empty array.

    if (entries.length) {
      setTimeout(function () {
        getFilesAndDirectoriesFromDirectory(directoryReader, newEntries, logDropError, {
          onSuccess: onSuccess
        });
      }, 0); // Done iterating this particular directory
    } else {
      onSuccess(newEntries);
    }
  }, // Make sure we resolve on error anyway, it's fine if only one directory couldn't be parsed!
  function (error) {
    logDropError(error);
    onSuccess(oldEntries);
  });
};

},{}],61:[function(require,module,exports){
/**
 * Get the relative path from the FileEntry#fullPath, because File#webkitRelativePath is always '', at least onDrop.
 *
 * @param {FileEntry} fileEntry
 *
 * @returns {string|null} - if file is not in a folder - return null (this is to be consistent with .relativePath-s of files selected from My Device). If file is in a folder - return its fullPath, e.g. '/simpsons/hi.jpeg'.
 */
module.exports = function getRelativePath(fileEntry) {
  // fileEntry.fullPath - "/simpsons/hi.jpeg" or undefined (for browsers that don't support it)
  // fileEntry.name - "hi.jpeg"
  if (!fileEntry.fullPath || fileEntry.fullPath === '/' + fileEntry.name) {
    return null;
  } else {
    return fileEntry.fullPath;
  }
};

},{}],62:[function(require,module,exports){
var toArray = require('../../../toArray');

var getRelativePath = require('./getRelativePath');

var getFilesAndDirectoriesFromDirectory = require('./getFilesAndDirectoriesFromDirectory');

module.exports = function webkitGetAsEntryApi(dataTransfer, logDropError) {
  var files = [];
  var rootPromises = [];
  /**
   * Returns a resolved promise, when :files array is enhanced
   *
   * @param {(FileSystemFileEntry|FileSystemDirectoryEntry)} entry
   * @returns {Promise} - empty promise that resolves when :files is enhanced with a file
   */

  var createPromiseToAddFileOrParseDirectory = function createPromiseToAddFileOrParseDirectory(entry) {
    return new Promise(function (resolve) {
      // This is a base call
      if (entry.isFile) {
        // Creates a new File object which can be used to read the file.
        entry.file(function (file) {
          file.relativePath = getRelativePath(entry);
          files.push(file);
          resolve();
        }, // Make sure we resolve on error anyway, it's fine if only one file couldn't be read!
        function (error) {
          logDropError(error);
          resolve();
        }); // This is a recursive call
      } else if (entry.isDirectory) {
        var directoryReader = entry.createReader();
        getFilesAndDirectoriesFromDirectory(directoryReader, [], logDropError, {
          onSuccess: function onSuccess(entries) {
            var promises = entries.map(function (entry) {
              return createPromiseToAddFileOrParseDirectory(entry);
            });
            Promise.all(promises).then(function () {
              return resolve();
            });
          }
        });
      }
    });
  }; // For each dropped item, - make sure it's a file/directory, and start deepening in!


  toArray(dataTransfer.items).forEach(function (item) {
    var entry = item.webkitGetAsEntry(); // :entry can be null when we drop the url e.g.

    if (entry) {
      rootPromises.push(createPromiseToAddFileOrParseDirectory(entry));
    }
  });
  return Promise.all(rootPromises).then(function () {
    return files;
  });
};

},{"../../../toArray":74,"./getFilesAndDirectoriesFromDirectory":60,"./getRelativePath":61}],63:[function(require,module,exports){
/**
 * Takes a full filename string and returns an object {name, extension}
 *
 * @param {string} fullFileName
 * @returns {object} {name, extension}
 */
module.exports = function getFileNameAndExtension(fullFileName) {
  var lastDot = fullFileName.lastIndexOf('.'); // these count as no extension: "no-dot", "trailing-dot."

  if (lastDot === -1 || lastDot === fullFileName.length - 1) {
    return {
      name: fullFileName,
      extension: undefined
    };
  } else {
    return {
      name: fullFileName.slice(0, lastDot),
      extension: fullFileName.slice(lastDot + 1)
    };
  }
};

},{}],64:[function(require,module,exports){
var getFileNameAndExtension = require('./getFileNameAndExtension');

var mimeTypes = require('./mimeTypes');

module.exports = function getFileType(file) {
  var fileExtension = file.name ? getFileNameAndExtension(file.name).extension : null;
  fileExtension = fileExtension ? fileExtension.toLowerCase() : null;

  if (file.type) {
    // if mime type is set in the file object already, use that
    return file.type;
  } else if (fileExtension && mimeTypes[fileExtension]) {
    // else, see if we can map extension to a mime type
    return mimeTypes[fileExtension];
  } else {
    // if all fails, fall back to a generic byte stream type
    return 'application/octet-stream';
  }
};

},{"./getFileNameAndExtension":63,"./mimeTypes":71}],65:[function(require,module,exports){
module.exports = function getSocketHost(url) {
  // get the host domain
  var regex = /^(?:https?:\/\/|\/\/)?(?:[^@\n]+@)?(?:www\.)?([^\n]+)/i;
  var host = regex.exec(url)[1];
  var socketProtocol = /^http:\/\//i.test(url) ? 'ws' : 'wss';
  return socketProtocol + "://" + host;
};

},{}],66:[function(require,module,exports){
/**
 * Returns a timestamp in the format of `hours:minutes:seconds`
 */
module.exports = function getTimeStamp() {
  var date = new Date();
  var hours = pad(date.getHours().toString());
  var minutes = pad(date.getMinutes().toString());
  var seconds = pad(date.getSeconds().toString());
  return hours + ':' + minutes + ':' + seconds;
};
/**
 * Adds zero to strings shorter than two characters
 */


function pad(str) {
  return str.length !== 2 ? 0 + str : str;
}

},{}],67:[function(require,module,exports){
module.exports = function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
};

},{}],68:[function(require,module,exports){
/**
 * Check if an object is a DOM element. Duck-typing based on `nodeType`.
 *
 * @param {*} obj
 */
module.exports = function isDOMElement(obj) {
  return obj && typeof obj === 'object' && obj.nodeType === Node.ELEMENT_NODE;
};

},{}],69:[function(require,module,exports){
/**
 * Checks if the browser supports Drag & Drop (not supported on mobile devices, for example).
 *
 * @returns {boolean}
 */
module.exports = function isDragDropSupported() {
  var div = document.createElement('div');

  if (!('draggable' in div) || !('ondragstart' in div && 'ondrop' in div)) {
    return false;
  }

  if (!('FormData' in window)) {
    return false;
  }

  if (!('FileReader' in window)) {
    return false;
  }

  return true;
};

},{}],70:[function(require,module,exports){
function isNetworkError(xhr) {
  if (!xhr) {
    return false;
  }

  return xhr.readyState !== 0 && xhr.readyState !== 4 || xhr.status === 0;
}

module.exports = isNetworkError;

},{}],71:[function(require,module,exports){
// ___Why not add the mime-types package?
//    It's 19.7kB gzipped, and we only need mime types for well-known extensions (for file previews).
// ___Where to take new extensions from?
//    https://github.com/jshttp/mime-db/blob/master/db.json
module.exports = {
  md: 'text/markdown',
  markdown: 'text/markdown',
  mp4: 'video/mp4',
  mp3: 'audio/mp3',
  svg: 'image/svg+xml',
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  yaml: 'text/yaml',
  yml: 'text/yaml',
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  tab: 'text/tab-separated-values',
  avi: 'video/x-msvideo',
  mks: 'video/x-matroska',
  mkv: 'video/x-matroska',
  mov: 'video/quicktime',
  doc: 'application/msword',
  docm: 'application/vnd.ms-word.document.macroenabled.12',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  dot: 'application/msword',
  dotm: 'application/vnd.ms-word.template.macroenabled.12',
  dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  xla: 'application/vnd.ms-excel',
  xlam: 'application/vnd.ms-excel.addin.macroenabled.12',
  xlc: 'application/vnd.ms-excel',
  xlf: 'application/x-xliff+xml',
  xlm: 'application/vnd.ms-excel',
  xls: 'application/vnd.ms-excel',
  xlsb: 'application/vnd.ms-excel.sheet.binary.macroenabled.12',
  xlsm: 'application/vnd.ms-excel.sheet.macroenabled.12',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xlt: 'application/vnd.ms-excel',
  xltm: 'application/vnd.ms-excel.template.macroenabled.12',
  xltx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  xlw: 'application/vnd.ms-excel',
  txt: 'text/plain',
  text: 'text/plain',
  conf: 'text/plain',
  log: 'text/plain',
  pdf: 'application/pdf'
};

},{}],72:[function(require,module,exports){
// Adapted from https://github.com/Flet/prettier-bytes/
// Changing 1000 bytes to 1024, so we can keep uppercase KB vs kB
// ISC License (c) Dan Flettre https://github.com/Flet/prettier-bytes/blob/master/LICENSE
module.exports = prettierBytes;

function prettierBytes(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number, got ' + typeof num);
  }

  var neg = num < 0;
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B';
  }

  var exponent = Math.min(Math.floor(Math.log(num) / Math.log(1024)), units.length - 1);
  num = Number(num / Math.pow(1024, exponent));
  var unit = units[exponent];

  if (num >= 10 || num % 1 === 0) {
    // Do not show decimals when the number is two-digit, or if the number has no
    // decimal component.
    return (neg ? '-' : '') + num.toFixed(0) + ' ' + unit;
  } else {
    return (neg ? '-' : '') + num.toFixed(1) + ' ' + unit;
  }
}

},{}],73:[function(require,module,exports){
module.exports = function settle(promises) {
  var resolutions = [];
  var rejections = [];

  function resolved(value) {
    resolutions.push(value);
  }

  function rejected(error) {
    rejections.push(error);
  }

  var wait = Promise.all(promises.map(function (promise) {
    return promise.then(resolved, rejected);
  }));
  return wait.then(function () {
    return {
      successful: resolutions,
      failed: rejections
    };
  });
};

},{}],74:[function(require,module,exports){
/**
 * Converts list into array
 */
module.exports = function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
};

},{}],75:[function(require,module,exports){
require('es6-promise/auto');

require('whatwg-fetch');

var Uppy = require('./../../../../packages/@uppy/core');

var DragDrop = require('./../../../../packages/@uppy/drag-drop');

var ProgressBar = require('./../../../../packages/@uppy/progress-bar');

var Tus = require('./../../../../packages/@uppy/tus'); // Function for displaying uploaded files


var onUploadSuccess = function onUploadSuccess(elForUploadedFiles) {
  return function (file, response) {
    var url = response.uploadURL;
    var fileName = file.name;
    document.querySelector(elForUploadedFiles).innerHTML += "<li><a href=\"" + url + "\" target=\"_blank\">" + fileName + "</a></li>";
  };
};

var uppyOne = new Uppy({
  debug: true,
  autoProceed: true
});
uppyOne.use(DragDrop, {
  target: '.example-one .for-DragDrop'
}).use(Tus, {
  endpoint: 'https://master.tus.io/files/'
}).use(ProgressBar, {
  target: '.example-one .for-ProgressBar',
  hideAfterFinish: false
}).on('upload-success', onUploadSuccess('.example-one .uploaded-files ol'));
var uppyTwo = new Uppy({
  debug: true,
  autoProceed: false
});
uppyTwo.use(DragDrop, {
  target: '.example-two .for-DragDrop'
}).use(Tus, {
  endpoint: 'https://master.tus.io/files/'
}).use(ProgressBar, {
  target: '.example-two .for-ProgressBar',
  hideAfterFinish: false
}).on('upload-success', onUploadSuccess('.example-two .uploaded-files ol'));
var uploadBtn = document.querySelector('.example-two button.upload-button');
uploadBtn.addEventListener('click', function () {
  uppyTwo.upload();
});

},{"./../../../../packages/@uppy/core":39,"./../../../../packages/@uppy/drag-drop":43,"./../../../../packages/@uppy/progress-bar":45,"./../../../../packages/@uppy/tus":50,"es6-promise/auto":5,"whatwg-fetch":28}]},{},[75])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvY3VpZC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jdWlkL2xpYi9maW5nZXJwcmludC5icm93c2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2N1aWQvbGliL2dldFJhbmRvbVZhbHVlLmJyb3dzZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvY3VpZC9saWIvcGFkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VzNi1wcm9taXNlL2F1dG8uanMiLCIuLi9ub2RlX21vZHVsZXMvZXM2LXByb21pc2UvZGlzdC9lczYtcHJvbWlzZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9leHRlbmQvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvanMtYmFzZTY0L2Jhc2U2NC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvbWltZS1tYXRjaC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9uYW1lc3BhY2UtZW1pdHRlci9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9wcmVhY3QvZGlzdC9wcmVhY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5naWZ5L2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3JlcXVpcmVzLXBvcnQvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L2Jyb3dzZXIvZmluZ2VycHJpbnQuanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L2Jyb3dzZXIvaXNDb3Jkb3ZhLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3R1cy1qcy1jbGllbnQvbGliLmVzNS9icm93c2VyL2lzUmVhY3ROYXRpdmUuanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L2Jyb3dzZXIvcmVhZEFzQnl0ZUFycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3R1cy1qcy1jbGllbnQvbGliLmVzNS9icm93c2VyL3JlcXVlc3QuanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L2Jyb3dzZXIvc291cmNlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3R1cy1qcy1jbGllbnQvbGliLmVzNS9icm93c2VyL3N0b3JhZ2UuanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L2Jyb3dzZXIvdXJpVG9CbG9iLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3R1cy1qcy1jbGllbnQvbGliLmVzNS9lcnJvci5qcyIsIi4uL25vZGVfbW9kdWxlcy90dXMtanMtY2xpZW50L2xpYi5lczUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L3VwbG9hZC5qcyIsIi4uL25vZGVfbW9kdWxlcy91cmwtcGFyc2UvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2Rpc3QvZmV0Y2gudW1kLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dpbGRjYXJkL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9wYWNrYWdlLmpzb24iLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy9BdXRoRXJyb3IuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy9Qcm92aWRlci5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvbXBhbmlvbi1jbGllbnQvc3JjL1JlcXVlc3RDbGllbnQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy9Tb2NrZXQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvbXBhbmlvbi1jbGllbnQvc3JjL3Rva2VuU3RvcmFnZS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvcmUvcGFja2FnZS5qc29uIiwiLi4vcGFja2FnZXMvQHVwcHkvY29yZS9zcmMvUGx1Z2luLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29yZS9zcmMvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL3NyYy9sb2dnZXJzLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29yZS9zcmMvc3VwcG9ydHNVcGxvYWRQcm9ncmVzcy5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2RyYWctZHJvcC9wYWNrYWdlLmpzb24iLCIuLi9wYWNrYWdlcy9AdXBweS9kcmFnLWRyb3Avc3JjL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvcHJvZ3Jlc3MtYmFyL3BhY2thZ2UuanNvbiIsIi4uL3BhY2thZ2VzL0B1cHB5L3Byb2dyZXNzLWJhci9zcmMvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9zdG9yZS1kZWZhdWx0L3BhY2thZ2UuanNvbiIsIi4uL3BhY2thZ2VzL0B1cHB5L3N0b3JlLWRlZmF1bHQvc3JjL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdHVzL3BhY2thZ2UuanNvbiIsIi4uL3BhY2thZ2VzL0B1cHB5L3R1cy9zcmMvZ2V0RmluZ2VycHJpbnQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS90dXMvc3JjL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL0V2ZW50VHJhY2tlci5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9OZXR3b3JrRXJyb3IuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvUmF0ZUxpbWl0ZWRRdWV1ZS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9UcmFuc2xhdG9yLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2VtaXRTb2NrZXRQcm9ncmVzcy5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9maW5kRE9NRWxlbWVudC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZW5lcmF0ZUZpbGVJRC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXREcm9wcGVkRmlsZXMvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvZ2V0RHJvcHBlZEZpbGVzL3V0aWxzL2ZhbGxiYWNrQXBpLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2dldERyb3BwZWRGaWxlcy91dGlscy93ZWJraXRHZXRBc0VudHJ5QXBpL2dldEZpbGVzQW5kRGlyZWN0b3JpZXNGcm9tRGlyZWN0b3J5LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2dldERyb3BwZWRGaWxlcy91dGlscy93ZWJraXRHZXRBc0VudHJ5QXBpL2dldFJlbGF0aXZlUGF0aC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXREcm9wcGVkRmlsZXMvdXRpbHMvd2Via2l0R2V0QXNFbnRyeUFwaS9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbi5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRGaWxlVHlwZS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRTb2NrZXRIb3N0LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2dldFRpbWVTdGFtcC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9oYXNQcm9wZXJ0eS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9pc0RPTUVsZW1lbnQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvaXNEcmFnRHJvcFN1cHBvcnRlZC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9pc05ldHdvcmtFcnJvci5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9taW1lVHlwZXMuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvcHJldHR5Qnl0ZXMuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvc2V0dGxlLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL3RvQXJyYXkuanMiLCJzcmMvZXhhbXBsZXMvZHJhZ2Ryb3AvYXBwLmVzNiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdHBDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDOXVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBOzs7Ozs7Ozs7Ozs7Ozs7O0lBRU0sUzs7O0FBQ0osdUJBQWU7QUFBQTs7QUFD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T0FBTyxHQUFHLElBQUksSUFBSixDQUFTO0FBQUUsRUFBQSxLQUFLLEVBQUUsSUFBVDtBQUFlLEVBQUEsV0FBVyxFQUFFO0FBQTVCLENBQVQsQ0FBaEI7QUFDQSxPQUFPLENBQ0osR0FESCxDQUNPLFFBRFAsRUFDaUI7QUFBRSxFQUFBLE1BQU0sRUFBRTtBQUFWLENBRGpCLEVBRUcsR0FGSCxDQUVPLEdBRlAsRUFFWTtBQUFFLEVBQUEsUUFBUSxFQUFFO0FBQVosQ0FGWixFQUdHLEdBSEgsQ0FHTyxXQUhQLEVBR29CO0FBQUUsRUFBQSxNQUFNLEVBQUUsK0JBQVY7QUFBMkMsRUFBQSxlQUFlLEVBQUU7QUFBNUQsQ0FIcEIsRUFJRyxFQUpILENBSU0sZ0JBSk4sRUFJd0IsZUFBZSxDQUFDLGlDQUFELENBSnZDO0FBTUEsSUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsbUNBQXZCLENBQWxCO0FBQ0EsU0FBUyxDQUFDLGdCQUFWLENBQTJCLE9BQTNCLEVBQW9DLFlBQVk7QUFDOUMsRUFBQSxPQUFPLENBQUMsTUFBUjtBQUNELENBRkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIGN1aWQuanNcbiAqIENvbGxpc2lvbi1yZXNpc3RhbnQgVUlEIGdlbmVyYXRvciBmb3IgYnJvd3NlcnMgYW5kIG5vZGUuXG4gKiBTZXF1ZW50aWFsIGZvciBmYXN0IGRiIGxvb2t1cHMgYW5kIHJlY2VuY3kgc29ydGluZy5cbiAqIFNhZmUgZm9yIGVsZW1lbnQgSURzIGFuZCBzZXJ2ZXItc2lkZSBsb29rdXBzLlxuICpcbiAqIEV4dHJhY3RlZCBmcm9tIENMQ1RSXG4gKlxuICogQ29weXJpZ2h0IChjKSBFcmljIEVsbGlvdHQgMjAxMlxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG52YXIgZmluZ2VycHJpbnQgPSByZXF1aXJlKCcuL2xpYi9maW5nZXJwcmludC5qcycpO1xudmFyIHBhZCA9IHJlcXVpcmUoJy4vbGliL3BhZC5qcycpO1xudmFyIGdldFJhbmRvbVZhbHVlID0gcmVxdWlyZSgnLi9saWIvZ2V0UmFuZG9tVmFsdWUuanMnKTtcblxudmFyIGMgPSAwLFxuICBibG9ja1NpemUgPSA0LFxuICBiYXNlID0gMzYsXG4gIGRpc2NyZXRlVmFsdWVzID0gTWF0aC5wb3coYmFzZSwgYmxvY2tTaXplKTtcblxuZnVuY3Rpb24gcmFuZG9tQmxvY2sgKCkge1xuICByZXR1cm4gcGFkKChnZXRSYW5kb21WYWx1ZSgpICpcbiAgICBkaXNjcmV0ZVZhbHVlcyA8PCAwKVxuICAgIC50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKTtcbn1cblxuZnVuY3Rpb24gc2FmZUNvdW50ZXIgKCkge1xuICBjID0gYyA8IGRpc2NyZXRlVmFsdWVzID8gYyA6IDA7XG4gIGMrKzsgLy8gdGhpcyBpcyBub3Qgc3VibGltaW5hbFxuICByZXR1cm4gYyAtIDE7XG59XG5cbmZ1bmN0aW9uIGN1aWQgKCkge1xuICAvLyBTdGFydGluZyB3aXRoIGEgbG93ZXJjYXNlIGxldHRlciBtYWtlc1xuICAvLyBpdCBIVE1MIGVsZW1lbnQgSUQgZnJpZW5kbHkuXG4gIHZhciBsZXR0ZXIgPSAnYycsIC8vIGhhcmQtY29kZWQgYWxsb3dzIGZvciBzZXF1ZW50aWFsIGFjY2Vzc1xuXG4gICAgLy8gdGltZXN0YW1wXG4gICAgLy8gd2FybmluZzogdGhpcyBleHBvc2VzIHRoZSBleGFjdCBkYXRlIGFuZCB0aW1lXG4gICAgLy8gdGhhdCB0aGUgdWlkIHdhcyBjcmVhdGVkLlxuICAgIHRpbWVzdGFtcCA9IChuZXcgRGF0ZSgpLmdldFRpbWUoKSkudG9TdHJpbmcoYmFzZSksXG5cbiAgICAvLyBQcmV2ZW50IHNhbWUtbWFjaGluZSBjb2xsaXNpb25zLlxuICAgIGNvdW50ZXIgPSBwYWQoc2FmZUNvdW50ZXIoKS50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKSxcblxuICAgIC8vIEEgZmV3IGNoYXJzIHRvIGdlbmVyYXRlIGRpc3RpbmN0IGlkcyBmb3IgZGlmZmVyZW50XG4gICAgLy8gY2xpZW50cyAoc28gZGlmZmVyZW50IGNvbXB1dGVycyBhcmUgZmFyIGxlc3NcbiAgICAvLyBsaWtlbHkgdG8gZ2VuZXJhdGUgdGhlIHNhbWUgaWQpXG4gICAgcHJpbnQgPSBmaW5nZXJwcmludCgpLFxuXG4gICAgLy8gR3JhYiBzb21lIG1vcmUgY2hhcnMgZnJvbSBNYXRoLnJhbmRvbSgpXG4gICAgcmFuZG9tID0gcmFuZG9tQmxvY2soKSArIHJhbmRvbUJsb2NrKCk7XG5cbiAgcmV0dXJuIGxldHRlciArIHRpbWVzdGFtcCArIGNvdW50ZXIgKyBwcmludCArIHJhbmRvbTtcbn1cblxuY3VpZC5zbHVnID0gZnVuY3Rpb24gc2x1ZyAoKSB7XG4gIHZhciBkYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCkudG9TdHJpbmcoMzYpLFxuICAgIGNvdW50ZXIgPSBzYWZlQ291bnRlcigpLnRvU3RyaW5nKDM2KS5zbGljZSgtNCksXG4gICAgcHJpbnQgPSBmaW5nZXJwcmludCgpLnNsaWNlKDAsIDEpICtcbiAgICAgIGZpbmdlcnByaW50KCkuc2xpY2UoLTEpLFxuICAgIHJhbmRvbSA9IHJhbmRvbUJsb2NrKCkuc2xpY2UoLTIpO1xuXG4gIHJldHVybiBkYXRlLnNsaWNlKC0yKSArXG4gICAgY291bnRlciArIHByaW50ICsgcmFuZG9tO1xufTtcblxuY3VpZC5pc0N1aWQgPSBmdW5jdGlvbiBpc0N1aWQgKHN0cmluZ1RvQ2hlY2spIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmdUb0NoZWNrICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICBpZiAoc3RyaW5nVG9DaGVjay5zdGFydHNXaXRoKCdjJykpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59O1xuXG5jdWlkLmlzU2x1ZyA9IGZ1bmN0aW9uIGlzU2x1ZyAoc3RyaW5nVG9DaGVjaykge1xuICBpZiAodHlwZW9mIHN0cmluZ1RvQ2hlY2sgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gIHZhciBzdHJpbmdMZW5ndGggPSBzdHJpbmdUb0NoZWNrLmxlbmd0aDtcbiAgaWYgKHN0cmluZ0xlbmd0aCA+PSA3ICYmIHN0cmluZ0xlbmd0aCA8PSAxMCkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmN1aWQuZmluZ2VycHJpbnQgPSBmaW5nZXJwcmludDtcblxubW9kdWxlLmV4cG9ydHMgPSBjdWlkO1xuIiwidmFyIHBhZCA9IHJlcXVpcmUoJy4vcGFkLmpzJyk7XG5cbnZhciBlbnYgPSB0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyA/IHdpbmRvdyA6IHNlbGY7XG52YXIgZ2xvYmFsQ291bnQgPSBPYmplY3Qua2V5cyhlbnYpLmxlbmd0aDtcbnZhciBtaW1lVHlwZXNMZW5ndGggPSBuYXZpZ2F0b3IubWltZVR5cGVzID8gbmF2aWdhdG9yLm1pbWVUeXBlcy5sZW5ndGggOiAwO1xudmFyIGNsaWVudElkID0gcGFkKChtaW1lVHlwZXNMZW5ndGggK1xuICBuYXZpZ2F0b3IudXNlckFnZW50Lmxlbmd0aCkudG9TdHJpbmcoMzYpICtcbiAgZ2xvYmFsQ291bnQudG9TdHJpbmcoMzYpLCA0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmaW5nZXJwcmludCAoKSB7XG4gIHJldHVybiBjbGllbnRJZDtcbn07XG4iLCJcbnZhciBnZXRSYW5kb21WYWx1ZTtcblxudmFyIGNyeXB0byA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICh3aW5kb3cuY3J5cHRvIHx8IHdpbmRvdy5tc0NyeXB0bykgfHxcbiAgdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnICYmXG4gIHNlbGYuY3J5cHRvO1xuXG5pZiAoY3J5cHRvKSB7XG4gICAgdmFyIGxpbSA9IE1hdGgucG93KDIsIDMyKSAtIDE7XG4gICAgZ2V0UmFuZG9tVmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyhjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50MzJBcnJheSgxKSlbMF0gLyBsaW0pO1xuICAgIH07XG59IGVsc2Uge1xuICAgIGdldFJhbmRvbVZhbHVlID0gTWF0aC5yYW5kb207XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UmFuZG9tVmFsdWU7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhZCAobnVtLCBzaXplKSB7XG4gIHZhciBzID0gJzAwMDAwMDAwMCcgKyBudW07XG4gIHJldHVybiBzLnN1YnN0cihzLmxlbmd0aCAtIHNpemUpO1xufTtcbiIsIi8vIFRoaXMgZmlsZSBjYW4gYmUgcmVxdWlyZWQgaW4gQnJvd3NlcmlmeSBhbmQgTm9kZS5qcyBmb3IgYXV0b21hdGljIHBvbHlmaWxsXG4vLyBUbyB1c2UgaXQ6ICByZXF1aXJlKCdlczYtcHJvbWlzZS9hdXRvJyk7XG4ndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJykucG9seWZpbGwoKTtcbiIsIi8qIVxuICogQG92ZXJ2aWV3IGVzNi1wcm9taXNlIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTQgWWVodWRhIEthdHosIFRvbSBEYWxlLCBTdGVmYW4gUGVubmVyIGFuZCBjb250cmlidXRvcnMgKENvbnZlcnNpb24gdG8gRVM2IEFQSSBieSBKYWtlIEFyY2hpYmFsZClcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9zdGVmYW5wZW5uZXIvZXM2LXByb21pc2UvbWFzdGVyL0xJQ0VOU0VcbiAqIEB2ZXJzaW9uICAgdjQuMi44KzFlNjhkY2U2XG4gKi9cblxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcblx0dHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuXHR0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuXHQoZ2xvYmFsLkVTNlByb21pc2UgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIG9iamVjdE9yRnVuY3Rpb24oeCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB4O1xuICByZXR1cm4geCAhPT0gbnVsbCAmJiAodHlwZSA9PT0gJ29iamVjdCcgfHwgdHlwZSA9PT0gJ2Z1bmN0aW9uJyk7XG59XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oeCkge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbic7XG59XG5cblxuXG52YXIgX2lzQXJyYXkgPSB2b2lkIDA7XG5pZiAoQXJyYXkuaXNBcnJheSkge1xuICBfaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG59IGVsc2Uge1xuICBfaXNBcnJheSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcbn1cblxudmFyIGlzQXJyYXkgPSBfaXNBcnJheTtcblxudmFyIGxlbiA9IDA7XG52YXIgdmVydHhOZXh0ID0gdm9pZCAwO1xudmFyIGN1c3RvbVNjaGVkdWxlckZuID0gdm9pZCAwO1xuXG52YXIgYXNhcCA9IGZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICBxdWV1ZVtsZW5dID0gY2FsbGJhY2s7XG4gIHF1ZXVlW2xlbiArIDFdID0gYXJnO1xuICBsZW4gKz0gMjtcbiAgaWYgKGxlbiA9PT0gMikge1xuICAgIC8vIElmIGxlbiBpcyAyLCB0aGF0IG1lYW5zIHRoYXQgd2UgbmVlZCB0byBzY2hlZHVsZSBhbiBhc3luYyBmbHVzaC5cbiAgICAvLyBJZiBhZGRpdGlvbmFsIGNhbGxiYWNrcyBhcmUgcXVldWVkIGJlZm9yZSB0aGUgcXVldWUgaXMgZmx1c2hlZCwgdGhleVxuICAgIC8vIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoaXMgZmx1c2ggdGhhdCB3ZSBhcmUgc2NoZWR1bGluZy5cbiAgICBpZiAoY3VzdG9tU2NoZWR1bGVyRm4pIHtcbiAgICAgIGN1c3RvbVNjaGVkdWxlckZuKGZsdXNoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2NoZWR1bGVGbHVzaCgpO1xuICAgIH1cbiAgfVxufTtcblxuZnVuY3Rpb24gc2V0U2NoZWR1bGVyKHNjaGVkdWxlRm4pIHtcbiAgY3VzdG9tU2NoZWR1bGVyRm4gPSBzY2hlZHVsZUZuO1xufVxuXG5mdW5jdGlvbiBzZXRBc2FwKGFzYXBGbikge1xuICBhc2FwID0gYXNhcEZuO1xufVxuXG52YXIgYnJvd3NlcldpbmRvdyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdW5kZWZpbmVkO1xudmFyIGJyb3dzZXJHbG9iYWwgPSBicm93c2VyV2luZG93IHx8IHt9O1xudmFyIEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID0gYnJvd3Nlckdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGJyb3dzZXJHbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcbnZhciBpc05vZGUgPSB0eXBlb2Ygc2VsZiA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJztcblxuLy8gdGVzdCBmb3Igd2ViIHdvcmtlciBidXQgbm90IGluIElFMTBcbnZhciBpc1dvcmtlciA9IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGltcG9ydFNjcmlwdHMgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8vIG5vZGVcbmZ1bmN0aW9uIHVzZU5leHRUaWNrKCkge1xuICAvLyBub2RlIHZlcnNpb24gMC4xMC54IGRpc3BsYXlzIGEgZGVwcmVjYXRpb24gd2FybmluZyB3aGVuIG5leHRUaWNrIGlzIHVzZWQgcmVjdXJzaXZlbHlcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jdWpvanMvd2hlbi9pc3N1ZXMvNDEwIGZvciBkZXRhaWxzXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICB9O1xufVxuXG4vLyB2ZXJ0eFxuZnVuY3Rpb24gdXNlVmVydHhUaW1lcigpIHtcbiAgaWYgKHR5cGVvZiB2ZXJ0eE5leHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZlcnR4TmV4dChmbHVzaCk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB1c2VTZXRUaW1lb3V0KCk7XG59XG5cbmZ1bmN0aW9uIHVzZU11dGF0aW9uT2JzZXJ2ZXIoKSB7XG4gIHZhciBpdGVyYXRpb25zID0gMDtcbiAgdmFyIG9ic2VydmVyID0gbmV3IEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGZsdXNoKTtcbiAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgbm9kZS5kYXRhID0gaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDI7XG4gIH07XG59XG5cbi8vIHdlYiB3b3JrZXJcbmZ1bmN0aW9uIHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZsdXNoO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICB9O1xufVxuXG5mdW5jdGlvbiB1c2VTZXRUaW1lb3V0KCkge1xuICAvLyBTdG9yZSBzZXRUaW1lb3V0IHJlZmVyZW5jZSBzbyBlczYtcHJvbWlzZSB3aWxsIGJlIHVuYWZmZWN0ZWQgYnlcbiAgLy8gb3RoZXIgY29kZSBtb2RpZnlpbmcgc2V0VGltZW91dCAobGlrZSBzaW5vbi51c2VGYWtlVGltZXJzKCkpXG4gIHZhciBnbG9iYWxTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZ2xvYmFsU2V0VGltZW91dChmbHVzaCwgMSk7XG4gIH07XG59XG5cbnZhciBxdWV1ZSA9IG5ldyBBcnJheSgxMDAwKTtcbmZ1bmN0aW9uIGZsdXNoKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSAyKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gcXVldWVbaV07XG4gICAgdmFyIGFyZyA9IHF1ZXVlW2kgKyAxXTtcblxuICAgIGNhbGxiYWNrKGFyZyk7XG5cbiAgICBxdWV1ZVtpXSA9IHVuZGVmaW5lZDtcbiAgICBxdWV1ZVtpICsgMV0gPSB1bmRlZmluZWQ7XG4gIH1cblxuICBsZW4gPSAwO1xufVxuXG5mdW5jdGlvbiBhdHRlbXB0VmVydHgoKSB7XG4gIHRyeSB7XG4gICAgdmFyIHZlcnR4ID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKS5yZXF1aXJlKCd2ZXJ0eCcpO1xuICAgIHZlcnR4TmV4dCA9IHZlcnR4LnJ1bk9uTG9vcCB8fCB2ZXJ0eC5ydW5PbkNvbnRleHQ7XG4gICAgcmV0dXJuIHVzZVZlcnR4VGltZXIoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB1c2VTZXRUaW1lb3V0KCk7XG4gIH1cbn1cblxudmFyIHNjaGVkdWxlRmx1c2ggPSB2b2lkIDA7XG4vLyBEZWNpZGUgd2hhdCBhc3luYyBtZXRob2QgdG8gdXNlIHRvIHRyaWdnZXJpbmcgcHJvY2Vzc2luZyBvZiBxdWV1ZWQgY2FsbGJhY2tzOlxuaWYgKGlzTm9kZSkge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlTmV4dFRpY2soKTtcbn0gZWxzZSBpZiAoQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgc2NoZWR1bGVGbHVzaCA9IHVzZU11dGF0aW9uT2JzZXJ2ZXIoKTtcbn0gZWxzZSBpZiAoaXNXb3JrZXIpIHtcbiAgc2NoZWR1bGVGbHVzaCA9IHVzZU1lc3NhZ2VDaGFubmVsKCk7XG59IGVsc2UgaWYgKGJyb3dzZXJXaW5kb3cgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICBzY2hlZHVsZUZsdXNoID0gYXR0ZW1wdFZlcnR4KCk7XG59IGVsc2Uge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlU2V0VGltZW91dCgpO1xufVxuXG5mdW5jdGlvbiB0aGVuKG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gIHZhciBwYXJlbnQgPSB0aGlzO1xuXG4gIHZhciBjaGlsZCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG5vb3ApO1xuXG4gIGlmIChjaGlsZFtQUk9NSVNFX0lEXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbWFrZVByb21pc2UoY2hpbGQpO1xuICB9XG5cbiAgdmFyIF9zdGF0ZSA9IHBhcmVudC5fc3RhdGU7XG5cblxuICBpZiAoX3N0YXRlKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzW19zdGF0ZSAtIDFdO1xuICAgIGFzYXAoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGludm9rZUNhbGxiYWNrKF9zdGF0ZSwgY2hpbGQsIGNhbGxiYWNrLCBwYXJlbnQuX3Jlc3VsdCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgfVxuXG4gIHJldHVybiBjaGlsZDtcbn1cblxuLyoqXG4gIGBQcm9taXNlLnJlc29sdmVgIHJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCBiZWNvbWUgcmVzb2x2ZWQgd2l0aCB0aGVcbiAgcGFzc2VkIGB2YWx1ZWAuIEl0IGlzIHNob3J0aGFuZCBmb3IgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICByZXNvbHZlKDEpO1xuICB9KTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgIC8vIHZhbHVlID09PSAxXG4gIH0pO1xuICBgYGBcblxuICBJbnN0ZWFkIG9mIHdyaXRpbmcgdGhlIGFib3ZlLCB5b3VyIGNvZGUgbm93IHNpbXBseSBiZWNvbWVzIHRoZSBmb2xsb3dpbmc6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgxKTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgIC8vIHZhbHVlID09PSAxXG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIHJlc29sdmVcbiAgQHN0YXRpY1xuICBAcGFyYW0ge0FueX0gdmFsdWUgdmFsdWUgdGhhdCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIGJlIHJlc29sdmVkIHdpdGhcbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2UgdGhhdCB3aWxsIGJlY29tZSBmdWxmaWxsZWQgd2l0aCB0aGUgZ2l2ZW5cbiAgYHZhbHVlYFxuKi9cbmZ1bmN0aW9uIHJlc29sdmUkMShvYmplY3QpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICBpZiAob2JqZWN0ICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdC5jb25zdHJ1Y3RvciA9PT0gQ29uc3RydWN0b3IpIHtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3Iobm9vcCk7XG4gIHJlc29sdmUocHJvbWlzZSwgb2JqZWN0KTtcbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbnZhciBQUk9NSVNFX0lEID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIpO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxudmFyIFBFTkRJTkcgPSB2b2lkIDA7XG52YXIgRlVMRklMTEVEID0gMTtcbnZhciBSRUpFQ1RFRCA9IDI7XG5cbmZ1bmN0aW9uIHNlbGZGdWxmaWxsbWVudCgpIHtcbiAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJZb3UgY2Fubm90IHJlc29sdmUgYSBwcm9taXNlIHdpdGggaXRzZWxmXCIpO1xufVxuXG5mdW5jdGlvbiBjYW5ub3RSZXR1cm5Pd24oKSB7XG4gIHJldHVybiBuZXcgVHlwZUVycm9yKCdBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuJyk7XG59XG5cbmZ1bmN0aW9uIHRyeVRoZW4odGhlbiQkMSwgdmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcikge1xuICB0cnkge1xuICAgIHRoZW4kJDEuY2FsbCh2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSwgdGhlbiQkMSkge1xuICBhc2FwKGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgdmFyIHNlYWxlZCA9IGZhbHNlO1xuICAgIHZhciBlcnJvciA9IHRyeVRoZW4odGhlbiQkMSwgdGhlbmFibGUsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHNlYWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgaWYgKHRoZW5hYmxlICE9PSB2YWx1ZSkge1xuICAgICAgICByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgIGlmIChzZWFsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc2VhbGVkID0gdHJ1ZTtcblxuICAgICAgcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgfSwgJ1NldHRsZTogJyArIChwcm9taXNlLl9sYWJlbCB8fCAnIHVua25vd24gcHJvbWlzZScpKTtcblxuICAgIGlmICghc2VhbGVkICYmIGVycm9yKSB7XG4gICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICB9XG4gIH0sIHByb21pc2UpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSkge1xuICBpZiAodGhlbmFibGUuX3N0YXRlID09PSBGVUxGSUxMRUQpIHtcbiAgICBmdWxmaWxsKHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICB9IGVsc2UgaWYgKHRoZW5hYmxlLl9zdGF0ZSA9PT0gUkVKRUNURUQpIHtcbiAgICByZWplY3QocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gIH0gZWxzZSB7XG4gICAgc3Vic2NyaWJlKHRoZW5hYmxlLCB1bmRlZmluZWQsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgIHJldHVybiByZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUsIHRoZW4kJDEpIHtcbiAgaWYgKG1heWJlVGhlbmFibGUuY29uc3RydWN0b3IgPT09IHByb21pc2UuY29uc3RydWN0b3IgJiYgdGhlbiQkMSA9PT0gdGhlbiAmJiBtYXliZVRoZW5hYmxlLmNvbnN0cnVjdG9yLnJlc29sdmUgPT09IHJlc29sdmUkMSkge1xuICAgIGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICB9IGVsc2Uge1xuICAgIGlmICh0aGVuJCQxID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoZW4kJDEpKSB7XG4gICAgICBoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbiQkMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpIHtcbiAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIHNlbGZGdWxmaWxsbWVudCgpKTtcbiAgfSBlbHNlIGlmIChvYmplY3RPckZ1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciB0aGVuJCQxID0gdm9pZCAwO1xuICAgIHRyeSB7XG4gICAgICB0aGVuJCQxID0gdmFsdWUudGhlbjtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCB2YWx1ZSwgdGhlbiQkMSk7XG4gIH0gZWxzZSB7XG4gICAgZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHVibGlzaFJlamVjdGlvbihwcm9taXNlKSB7XG4gIGlmIChwcm9taXNlLl9vbmVycm9yKSB7XG4gICAgcHJvbWlzZS5fb25lcnJvcihwcm9taXNlLl9yZXN1bHQpO1xuICB9XG5cbiAgcHVibGlzaChwcm9taXNlKTtcbn1cblxuZnVuY3Rpb24gZnVsZmlsbChwcm9taXNlLCB2YWx1ZSkge1xuICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IFBFTkRJTkcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBwcm9taXNlLl9yZXN1bHQgPSB2YWx1ZTtcbiAgcHJvbWlzZS5fc3RhdGUgPSBGVUxGSUxMRUQ7XG5cbiAgaWYgKHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCAhPT0gMCkge1xuICAgIGFzYXAocHVibGlzaCwgcHJvbWlzZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVqZWN0KHByb21pc2UsIHJlYXNvbikge1xuICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IFBFTkRJTkcpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgcHJvbWlzZS5fc3RhdGUgPSBSRUpFQ1RFRDtcbiAgcHJvbWlzZS5fcmVzdWx0ID0gcmVhc29uO1xuXG4gIGFzYXAocHVibGlzaFJlamVjdGlvbiwgcHJvbWlzZSk7XG59XG5cbmZ1bmN0aW9uIHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICB2YXIgX3N1YnNjcmliZXJzID0gcGFyZW50Ll9zdWJzY3JpYmVycztcbiAgdmFyIGxlbmd0aCA9IF9zdWJzY3JpYmVycy5sZW5ndGg7XG5cblxuICBwYXJlbnQuX29uZXJyb3IgPSBudWxsO1xuXG4gIF9zdWJzY3JpYmVyc1tsZW5ndGhdID0gY2hpbGQ7XG4gIF9zdWJzY3JpYmVyc1tsZW5ndGggKyBGVUxGSUxMRURdID0gb25GdWxmaWxsbWVudDtcbiAgX3N1YnNjcmliZXJzW2xlbmd0aCArIFJFSkVDVEVEXSA9IG9uUmVqZWN0aW9uO1xuXG4gIGlmIChsZW5ndGggPT09IDAgJiYgcGFyZW50Ll9zdGF0ZSkge1xuICAgIGFzYXAocHVibGlzaCwgcGFyZW50KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwdWJsaXNoKHByb21pc2UpIHtcbiAgdmFyIHN1YnNjcmliZXJzID0gcHJvbWlzZS5fc3Vic2NyaWJlcnM7XG4gIHZhciBzZXR0bGVkID0gcHJvbWlzZS5fc3RhdGU7XG5cbiAgaWYgKHN1YnNjcmliZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBjaGlsZCA9IHZvaWQgMCxcbiAgICAgIGNhbGxiYWNrID0gdm9pZCAwLFxuICAgICAgZGV0YWlsID0gcHJvbWlzZS5fcmVzdWx0O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3Vic2NyaWJlcnMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICBjaGlsZCA9IHN1YnNjcmliZXJzW2ldO1xuICAgIGNhbGxiYWNrID0gc3Vic2NyaWJlcnNbaSArIHNldHRsZWRdO1xuXG4gICAgaWYgKGNoaWxkKSB7XG4gICAgICBpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgfVxuICB9XG5cbiAgcHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoID0gMDtcbn1cblxuZnVuY3Rpb24gaW52b2tlQ2FsbGJhY2soc2V0dGxlZCwgcHJvbWlzZSwgY2FsbGJhY2ssIGRldGFpbCkge1xuICB2YXIgaGFzQ2FsbGJhY2sgPSBpc0Z1bmN0aW9uKGNhbGxiYWNrKSxcbiAgICAgIHZhbHVlID0gdm9pZCAwLFxuICAgICAgZXJyb3IgPSB2b2lkIDAsXG4gICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuXG4gIGlmIChoYXNDYWxsYmFjaykge1xuICAgIHRyeSB7XG4gICAgICB2YWx1ZSA9IGNhbGxiYWNrKGRldGFpbCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc3VjY2VlZGVkID0gZmFsc2U7XG4gICAgICBlcnJvciA9IGU7XG4gICAgfVxuXG4gICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICByZWplY3QocHJvbWlzZSwgY2Fubm90UmV0dXJuT3duKCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YWx1ZSA9IGRldGFpbDtcbiAgfVxuXG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykge1xuICAgIC8vIG5vb3BcbiAgfSBlbHNlIGlmIChoYXNDYWxsYmFjayAmJiBzdWNjZWVkZWQpIHtcbiAgICByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgfSBlbHNlIGlmIChzdWNjZWVkZWQgPT09IGZhbHNlKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgfSBlbHNlIGlmIChzZXR0bGVkID09PSBGVUxGSUxMRUQpIHtcbiAgICBmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgfSBlbHNlIGlmIChzZXR0bGVkID09PSBSRUpFQ1RFRCkge1xuICAgIHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdGlhbGl6ZVByb21pc2UocHJvbWlzZSwgcmVzb2x2ZXIpIHtcbiAgdHJ5IHtcbiAgICByZXNvbHZlcihmdW5jdGlvbiByZXNvbHZlUHJvbWlzZSh2YWx1ZSkge1xuICAgICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgfSwgZnVuY3Rpb24gcmVqZWN0UHJvbWlzZShyZWFzb24pIHtcbiAgICAgIHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIGUpO1xuICB9XG59XG5cbnZhciBpZCA9IDA7XG5mdW5jdGlvbiBuZXh0SWQoKSB7XG4gIHJldHVybiBpZCsrO1xufVxuXG5mdW5jdGlvbiBtYWtlUHJvbWlzZShwcm9taXNlKSB7XG4gIHByb21pc2VbUFJPTUlTRV9JRF0gPSBpZCsrO1xuICBwcm9taXNlLl9zdGF0ZSA9IHVuZGVmaW5lZDtcbiAgcHJvbWlzZS5fcmVzdWx0ID0gdW5kZWZpbmVkO1xuICBwcm9taXNlLl9zdWJzY3JpYmVycyA9IFtdO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0aW9uRXJyb3IoKSB7XG4gIHJldHVybiBuZXcgRXJyb3IoJ0FycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheScpO1xufVxuXG52YXIgRW51bWVyYXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRW51bWVyYXRvcihDb25zdHJ1Y3RvciwgaW5wdXQpIHtcbiAgICB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yID0gQ29uc3RydWN0b3I7XG4gICAgdGhpcy5wcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKG5vb3ApO1xuXG4gICAgaWYgKCF0aGlzLnByb21pc2VbUFJPTUlTRV9JRF0pIHtcbiAgICAgIG1ha2VQcm9taXNlKHRoaXMucHJvbWlzZSk7XG4gICAgfVxuXG4gICAgaWYgKGlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICB0aGlzLmxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcbiAgICAgIHRoaXMuX3JlbWFpbmluZyA9IGlucHV0Lmxlbmd0aDtcblxuICAgICAgdGhpcy5fcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcblxuICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLmxlbmd0aCB8fCAwO1xuICAgICAgICB0aGlzLl9lbnVtZXJhdGUoaW5wdXQpO1xuICAgICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVqZWN0KHRoaXMucHJvbWlzZSwgdmFsaWRhdGlvbkVycm9yKCkpO1xuICAgIH1cbiAgfVxuXG4gIEVudW1lcmF0b3IucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbiBfZW51bWVyYXRlKGlucHV0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IHRoaXMuX3N0YXRlID09PSBQRU5ESU5HICYmIGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fZWFjaEVudHJ5KGlucHV0W2ldLCBpKTtcbiAgICB9XG4gIH07XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uIF9lYWNoRW50cnkoZW50cnksIGkpIHtcbiAgICB2YXIgYyA9IHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3I7XG4gICAgdmFyIHJlc29sdmUkJDEgPSBjLnJlc29sdmU7XG5cblxuICAgIGlmIChyZXNvbHZlJCQxID09PSByZXNvbHZlJDEpIHtcbiAgICAgIHZhciBfdGhlbiA9IHZvaWQgMDtcbiAgICAgIHZhciBlcnJvciA9IHZvaWQgMDtcbiAgICAgIHZhciBkaWRFcnJvciA9IGZhbHNlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgX3RoZW4gPSBlbnRyeS50aGVuO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkaWRFcnJvciA9IHRydWU7XG4gICAgICAgIGVycm9yID0gZTtcbiAgICAgIH1cblxuICAgICAgaWYgKF90aGVuID09PSB0aGVuICYmIGVudHJ5Ll9zdGF0ZSAhPT0gUEVORElORykge1xuICAgICAgICB0aGlzLl9zZXR0bGVkQXQoZW50cnkuX3N0YXRlLCBpLCBlbnRyeS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIF90aGVuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZy0tO1xuICAgICAgICB0aGlzLl9yZXN1bHRbaV0gPSBlbnRyeTtcbiAgICAgIH0gZWxzZSBpZiAoYyA9PT0gUHJvbWlzZSQxKSB7XG4gICAgICAgIHZhciBwcm9taXNlID0gbmV3IGMobm9vcCk7XG4gICAgICAgIGlmIChkaWRFcnJvcikge1xuICAgICAgICAgIHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBlbnRyeSwgX3RoZW4pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChwcm9taXNlLCBpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChuZXcgYyhmdW5jdGlvbiAocmVzb2x2ZSQkMSkge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlJCQxKGVudHJ5KTtcbiAgICAgICAgfSksIGkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl93aWxsU2V0dGxlQXQocmVzb2x2ZSQkMShlbnRyeSksIGkpO1xuICAgIH1cbiAgfTtcblxuICBFbnVtZXJhdG9yLnByb3RvdHlwZS5fc2V0dGxlZEF0ID0gZnVuY3Rpb24gX3NldHRsZWRBdChzdGF0ZSwgaSwgdmFsdWUpIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXMucHJvbWlzZTtcblxuXG4gICAgaWYgKHByb21pc2UuX3N0YXRlID09PSBQRU5ESU5HKSB7XG4gICAgICB0aGlzLl9yZW1haW5pbmctLTtcblxuICAgICAgaWYgKHN0YXRlID09PSBSRUpFQ1RFRCkge1xuICAgICAgICByZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVzdWx0W2ldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgZnVsZmlsbChwcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgIH1cbiAgfTtcblxuICBFbnVtZXJhdG9yLnByb3RvdHlwZS5fd2lsbFNldHRsZUF0ID0gZnVuY3Rpb24gX3dpbGxTZXR0bGVBdChwcm9taXNlLCBpKSB7XG4gICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuXG4gICAgc3Vic2NyaWJlKHByb21pc2UsIHVuZGVmaW5lZCwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gZW51bWVyYXRvci5fc2V0dGxlZEF0KEZVTEZJTExFRCwgaSwgdmFsdWUpO1xuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgIHJldHVybiBlbnVtZXJhdG9yLl9zZXR0bGVkQXQoUkVKRUNURUQsIGksIHJlYXNvbik7XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIEVudW1lcmF0b3I7XG59KCk7XG5cbi8qKlxuICBgUHJvbWlzZS5hbGxgIGFjY2VwdHMgYW4gYXJyYXkgb2YgcHJvbWlzZXMsIGFuZCByZXR1cm5zIGEgbmV3IHByb21pc2Ugd2hpY2hcbiAgaXMgZnVsZmlsbGVkIHdpdGggYW4gYXJyYXkgb2YgZnVsZmlsbG1lbnQgdmFsdWVzIGZvciB0aGUgcGFzc2VkIHByb21pc2VzLCBvclxuICByZWplY3RlZCB3aXRoIHRoZSByZWFzb24gb2YgdGhlIGZpcnN0IHBhc3NlZCBwcm9taXNlIHRvIGJlIHJlamVjdGVkLiBJdCBjYXN0cyBhbGxcbiAgZWxlbWVudHMgb2YgdGhlIHBhc3NlZCBpdGVyYWJsZSB0byBwcm9taXNlcyBhcyBpdCBydW5zIHRoaXMgYWxnb3JpdGhtLlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZTEgPSByZXNvbHZlKDEpO1xuICBsZXQgcHJvbWlzZTIgPSByZXNvbHZlKDIpO1xuICBsZXQgcHJvbWlzZTMgPSByZXNvbHZlKDMpO1xuICBsZXQgcHJvbWlzZXMgPSBbIHByb21pc2UxLCBwcm9taXNlMiwgcHJvbWlzZTMgXTtcblxuICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihhcnJheSl7XG4gICAgLy8gVGhlIGFycmF5IGhlcmUgd291bGQgYmUgWyAxLCAyLCAzIF07XG4gIH0pO1xuICBgYGBcblxuICBJZiBhbnkgb2YgdGhlIGBwcm9taXNlc2AgZ2l2ZW4gdG8gYGFsbGAgYXJlIHJlamVjdGVkLCB0aGUgZmlyc3QgcHJvbWlzZVxuICB0aGF0IGlzIHJlamVjdGVkIHdpbGwgYmUgZ2l2ZW4gYXMgYW4gYXJndW1lbnQgdG8gdGhlIHJldHVybmVkIHByb21pc2VzJ3NcbiAgcmVqZWN0aW9uIGhhbmRsZXIuIEZvciBleGFtcGxlOlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZTEgPSByZXNvbHZlKDEpO1xuICBsZXQgcHJvbWlzZTIgPSByZWplY3QobmV3IEVycm9yKFwiMlwiKSk7XG4gIGxldCBwcm9taXNlMyA9IHJlamVjdChuZXcgRXJyb3IoXCIzXCIpKTtcbiAgbGV0IHByb21pc2VzID0gWyBwcm9taXNlMSwgcHJvbWlzZTIsIHByb21pc2UzIF07XG5cbiAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24oYXJyYXkpe1xuICAgIC8vIENvZGUgaGVyZSBuZXZlciBydW5zIGJlY2F1c2UgdGhlcmUgYXJlIHJlamVjdGVkIHByb21pc2VzIVxuICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgIC8vIGVycm9yLm1lc3NhZ2UgPT09IFwiMlwiXG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIGFsbFxuICBAc3RhdGljXG4gIEBwYXJhbSB7QXJyYXl9IGVudHJpZXMgYXJyYXkgb2YgcHJvbWlzZXNcbiAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgbGFiZWxpbmcgdGhlIHByb21pc2UuXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIGFsbCBgcHJvbWlzZXNgIGhhdmUgYmVlblxuICBmdWxmaWxsZWQsIG9yIHJlamVjdGVkIGlmIGFueSBvZiB0aGVtIGJlY29tZSByZWplY3RlZC5cbiAgQHN0YXRpY1xuKi9cbmZ1bmN0aW9uIGFsbChlbnRyaWVzKSB7XG4gIHJldHVybiBuZXcgRW51bWVyYXRvcih0aGlzLCBlbnRyaWVzKS5wcm9taXNlO1xufVxuXG4vKipcbiAgYFByb21pc2UucmFjZWAgcmV0dXJucyBhIG5ldyBwcm9taXNlIHdoaWNoIGlzIHNldHRsZWQgaW4gdGhlIHNhbWUgd2F5IGFzIHRoZVxuICBmaXJzdCBwYXNzZWQgcHJvbWlzZSB0byBzZXR0bGUuXG5cbiAgRXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlMSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmVzb2x2ZSgncHJvbWlzZSAxJyk7XG4gICAgfSwgMjAwKTtcbiAgfSk7XG5cbiAgbGV0IHByb21pc2UyID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXNvbHZlKCdwcm9taXNlIDInKTtcbiAgICB9LCAxMDApO1xuICB9KTtcblxuICBQcm9taXNlLnJhY2UoW3Byb21pc2UxLCBwcm9taXNlMl0pLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAvLyByZXN1bHQgPT09ICdwcm9taXNlIDInIGJlY2F1c2UgaXQgd2FzIHJlc29sdmVkIGJlZm9yZSBwcm9taXNlMVxuICAgIC8vIHdhcyByZXNvbHZlZC5cbiAgfSk7XG4gIGBgYFxuXG4gIGBQcm9taXNlLnJhY2VgIGlzIGRldGVybWluaXN0aWMgaW4gdGhhdCBvbmx5IHRoZSBzdGF0ZSBvZiB0aGUgZmlyc3RcbiAgc2V0dGxlZCBwcm9taXNlIG1hdHRlcnMuIEZvciBleGFtcGxlLCBldmVuIGlmIG90aGVyIHByb21pc2VzIGdpdmVuIHRvIHRoZVxuICBgcHJvbWlzZXNgIGFycmF5IGFyZ3VtZW50IGFyZSByZXNvbHZlZCwgYnV0IHRoZSBmaXJzdCBzZXR0bGVkIHByb21pc2UgaGFzXG4gIGJlY29tZSByZWplY3RlZCBiZWZvcmUgdGhlIG90aGVyIHByb21pc2VzIGJlY2FtZSBmdWxmaWxsZWQsIHRoZSByZXR1cm5lZFxuICBwcm9taXNlIHdpbGwgYmVjb21lIHJlamVjdGVkOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXNvbHZlKCdwcm9taXNlIDEnKTtcbiAgICB9LCAyMDApO1xuICB9KTtcblxuICBsZXQgcHJvbWlzZTIgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ3Byb21pc2UgMicpKTtcbiAgICB9LCAxMDApO1xuICB9KTtcblxuICBQcm9taXNlLnJhY2UoW3Byb21pc2UxLCBwcm9taXNlMl0pLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAvLyBDb2RlIGhlcmUgbmV2ZXIgcnVuc1xuICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIHJlYXNvbi5tZXNzYWdlID09PSAncHJvbWlzZSAyJyBiZWNhdXNlIHByb21pc2UgMiBiZWNhbWUgcmVqZWN0ZWQgYmVmb3JlXG4gICAgLy8gcHJvbWlzZSAxIGJlY2FtZSBmdWxmaWxsZWRcbiAgfSk7XG4gIGBgYFxuXG4gIEFuIGV4YW1wbGUgcmVhbC13b3JsZCB1c2UgY2FzZSBpcyBpbXBsZW1lbnRpbmcgdGltZW91dHM6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBQcm9taXNlLnJhY2UoW2FqYXgoJ2Zvby5qc29uJyksIHRpbWVvdXQoNTAwMCldKVxuICBgYGBcblxuICBAbWV0aG9kIHJhY2VcbiAgQHN0YXRpY1xuICBAcGFyYW0ge0FycmF5fSBwcm9taXNlcyBhcnJheSBvZiBwcm9taXNlcyB0byBvYnNlcnZlXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX0gYSBwcm9taXNlIHdoaWNoIHNldHRsZXMgaW4gdGhlIHNhbWUgd2F5IGFzIHRoZSBmaXJzdCBwYXNzZWRcbiAgcHJvbWlzZSB0byBzZXR0bGUuXG4qL1xuZnVuY3Rpb24gcmFjZShlbnRyaWVzKSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgaWYgKCFpc0FycmF5KGVudHJpZXMpKSB7XG4gICAgcmV0dXJuIG5ldyBDb25zdHJ1Y3RvcihmdW5jdGlvbiAoXywgcmVqZWN0KSB7XG4gICAgICByZXR1cm4gcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYW4gYXJyYXkgdG8gcmFjZS4nKSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBDb25zdHJ1Y3RvcihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgbGVuZ3RoID0gZW50cmllcy5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIENvbnN0cnVjdG9yLnJlc29sdmUoZW50cmllc1tpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICBgUHJvbWlzZS5yZWplY3RgIHJldHVybnMgYSBwcm9taXNlIHJlamVjdGVkIHdpdGggdGhlIHBhc3NlZCBgcmVhc29uYC5cbiAgSXQgaXMgc2hvcnRoYW5kIGZvciB0aGUgZm9sbG93aW5nOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHJlamVjdChuZXcgRXJyb3IoJ1dIT09QUycpKTtcbiAgfSk7XG5cbiAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAvLyBDb2RlIGhlcmUgZG9lc24ndCBydW4gYmVjYXVzZSB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCFcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gJ1dIT09QUydcbiAgfSk7XG4gIGBgYFxuXG4gIEluc3RlYWQgb2Ygd3JpdGluZyB0aGUgYWJvdmUsIHlvdXIgY29kZSBub3cgc2ltcGx5IGJlY29tZXMgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdXSE9PUFMnKSk7XG5cbiAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAvLyBDb2RlIGhlcmUgZG9lc24ndCBydW4gYmVjYXVzZSB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCFcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gJ1dIT09QUydcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgcmVqZWN0XG4gIEBzdGF0aWNcbiAgQHBhcmFtIHtBbnl9IHJlYXNvbiB2YWx1ZSB0aGF0IHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgYmUgcmVqZWN0ZWQgd2l0aC5cbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2UgcmVqZWN0ZWQgd2l0aCB0aGUgZ2l2ZW4gYHJlYXNvbmAuXG4qL1xuZnVuY3Rpb24gcmVqZWN0JDEocmVhc29uKSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG4gIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKG5vb3ApO1xuICByZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIG5lZWRzUmVzb2x2ZXIoKSB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYSByZXNvbHZlciBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3InKTtcbn1cblxuZnVuY3Rpb24gbmVlZHNOZXcoKSB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdQcm9taXNlJzogUGxlYXNlIHVzZSB0aGUgJ25ldycgb3BlcmF0b3IsIHRoaXMgb2JqZWN0IGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBjYWxsZWQgYXMgYSBmdW5jdGlvbi5cIik7XG59XG5cbi8qKlxuICBQcm9taXNlIG9iamVjdHMgcmVwcmVzZW50IHRoZSBldmVudHVhbCByZXN1bHQgb2YgYW4gYXN5bmNocm9ub3VzIG9wZXJhdGlvbi4gVGhlXG4gIHByaW1hcnkgd2F5IG9mIGludGVyYWN0aW5nIHdpdGggYSBwcm9taXNlIGlzIHRocm91Z2ggaXRzIGB0aGVuYCBtZXRob2QsIHdoaWNoXG4gIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNlJ3MgZXZlbnR1YWwgdmFsdWUgb3IgdGhlIHJlYXNvblxuICB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICBUZXJtaW5vbG9neVxuICAtLS0tLS0tLS0tLVxuXG4gIC0gYHByb21pc2VgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB3aXRoIGEgYHRoZW5gIG1ldGhvZCB3aG9zZSBiZWhhdmlvciBjb25mb3JtcyB0byB0aGlzIHNwZWNpZmljYXRpb24uXG4gIC0gYHRoZW5hYmxlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gdGhhdCBkZWZpbmVzIGEgYHRoZW5gIG1ldGhvZC5cbiAgLSBgdmFsdWVgIGlzIGFueSBsZWdhbCBKYXZhU2NyaXB0IHZhbHVlIChpbmNsdWRpbmcgdW5kZWZpbmVkLCBhIHRoZW5hYmxlLCBvciBhIHByb21pc2UpLlxuICAtIGBleGNlcHRpb25gIGlzIGEgdmFsdWUgdGhhdCBpcyB0aHJvd24gdXNpbmcgdGhlIHRocm93IHN0YXRlbWVudC5cbiAgLSBgcmVhc29uYCBpcyBhIHZhbHVlIHRoYXQgaW5kaWNhdGVzIHdoeSBhIHByb21pc2Ugd2FzIHJlamVjdGVkLlxuICAtIGBzZXR0bGVkYCB0aGUgZmluYWwgcmVzdGluZyBzdGF0ZSBvZiBhIHByb21pc2UsIGZ1bGZpbGxlZCBvciByZWplY3RlZC5cblxuICBBIHByb21pc2UgY2FuIGJlIGluIG9uZSBvZiB0aHJlZSBzdGF0ZXM6IHBlbmRpbmcsIGZ1bGZpbGxlZCwgb3IgcmVqZWN0ZWQuXG5cbiAgUHJvbWlzZXMgdGhhdCBhcmUgZnVsZmlsbGVkIGhhdmUgYSBmdWxmaWxsbWVudCB2YWx1ZSBhbmQgYXJlIGluIHRoZSBmdWxmaWxsZWRcbiAgc3RhdGUuICBQcm9taXNlcyB0aGF0IGFyZSByZWplY3RlZCBoYXZlIGEgcmVqZWN0aW9uIHJlYXNvbiBhbmQgYXJlIGluIHRoZVxuICByZWplY3RlZCBzdGF0ZS4gIEEgZnVsZmlsbG1lbnQgdmFsdWUgaXMgbmV2ZXIgYSB0aGVuYWJsZS5cblxuICBQcm9taXNlcyBjYW4gYWxzbyBiZSBzYWlkIHRvICpyZXNvbHZlKiBhIHZhbHVlLiAgSWYgdGhpcyB2YWx1ZSBpcyBhbHNvIGFcbiAgcHJvbWlzZSwgdGhlbiB0aGUgb3JpZ2luYWwgcHJvbWlzZSdzIHNldHRsZWQgc3RhdGUgd2lsbCBtYXRjaCB0aGUgdmFsdWUnc1xuICBzZXR0bGVkIHN0YXRlLiAgU28gYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCByZWplY3RzIHdpbGxcbiAgaXRzZWxmIHJlamVjdCwgYW5kIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgd2lsbFxuICBpdHNlbGYgZnVsZmlsbC5cblxuXG4gIEJhc2ljIFVzYWdlOlxuICAtLS0tLS0tLS0tLS1cblxuICBgYGBqc1xuICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIC8vIG9uIHN1Y2Nlc3NcbiAgICByZXNvbHZlKHZhbHVlKTtcblxuICAgIC8vIG9uIGZhaWx1cmVcbiAgICByZWplY3QocmVhc29uKTtcbiAgfSk7XG5cbiAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgLy8gb24gcmVqZWN0aW9uXG4gIH0pO1xuICBgYGBcblxuICBBZHZhbmNlZCBVc2FnZTpcbiAgLS0tLS0tLS0tLS0tLS0tXG5cbiAgUHJvbWlzZXMgc2hpbmUgd2hlbiBhYnN0cmFjdGluZyBhd2F5IGFzeW5jaHJvbm91cyBpbnRlcmFjdGlvbnMgc3VjaCBhc1xuICBgWE1MSHR0cFJlcXVlc3Rgcy5cblxuICBgYGBqc1xuICBmdW5jdGlvbiBnZXRKU09OKHVybCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBoYW5kbGVyO1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgeGhyLnNlbmQoKTtcblxuICAgICAgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gdGhpcy5ET05FKSB7XG4gICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5yZXNwb25zZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2dldEpTT046IGAnICsgdXJsICsgJ2AgZmFpbGVkIHdpdGggc3RhdHVzOiBbJyArIHRoaXMuc3RhdHVzICsgJ10nKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0SlNPTignL3Bvc3RzLmpzb24nKS50aGVuKGZ1bmN0aW9uKGpzb24pIHtcbiAgICAvLyBvbiBmdWxmaWxsbWVudFxuICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAvLyBvbiByZWplY3Rpb25cbiAgfSk7XG4gIGBgYFxuXG4gIFVubGlrZSBjYWxsYmFja3MsIHByb21pc2VzIGFyZSBncmVhdCBjb21wb3NhYmxlIHByaW1pdGl2ZXMuXG5cbiAgYGBganNcbiAgUHJvbWlzZS5hbGwoW1xuICAgIGdldEpTT04oJy9wb3N0cycpLFxuICAgIGdldEpTT04oJy9jb21tZW50cycpXG4gIF0pLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcbiAgICB2YWx1ZXNbMF0gLy8gPT4gcG9zdHNKU09OXG4gICAgdmFsdWVzWzFdIC8vID0+IGNvbW1lbnRzSlNPTlxuXG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfSk7XG4gIGBgYFxuXG4gIEBjbGFzcyBQcm9taXNlXG4gIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmVyXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQGNvbnN0cnVjdG9yXG4qL1xuXG52YXIgUHJvbWlzZSQxID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBQcm9taXNlKHJlc29sdmVyKSB7XG4gICAgdGhpc1tQUk9NSVNFX0lEXSA9IG5leHRJZCgpO1xuICAgIHRoaXMuX3Jlc3VsdCA9IHRoaXMuX3N0YXRlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3N1YnNjcmliZXJzID0gW107XG5cbiAgICBpZiAobm9vcCAhPT0gcmVzb2x2ZXIpIHtcbiAgICAgIHR5cGVvZiByZXNvbHZlciAhPT0gJ2Z1bmN0aW9uJyAmJiBuZWVkc1Jlc29sdmVyKCk7XG4gICAgICB0aGlzIGluc3RhbmNlb2YgUHJvbWlzZSA/IGluaXRpYWxpemVQcm9taXNlKHRoaXMsIHJlc29sdmVyKSA6IG5lZWRzTmV3KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gIFRoZSBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLFxuICB3aGljaCByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZSdzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZVxuICByZWFzb24gd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG4gICBgYGBqc1xuICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgLy8gdXNlciBpcyBhdmFpbGFibGVcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyB1c2VyIGlzIHVuYXZhaWxhYmxlLCBhbmQgeW91IGFyZSBnaXZlbiB0aGUgcmVhc29uIHdoeVxuICB9KTtcbiAgYGBgXG4gICBDaGFpbmluZ1xuICAtLS0tLS0tLVxuICAgVGhlIHJldHVybiB2YWx1ZSBvZiBgdGhlbmAgaXMgaXRzZWxmIGEgcHJvbWlzZS4gIFRoaXMgc2Vjb25kLCAnZG93bnN0cmVhbSdcbiAgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZpcnN0IHByb21pc2UncyBmdWxmaWxsbWVudFxuICBvciByZWplY3Rpb24gaGFuZGxlciwgb3IgcmVqZWN0ZWQgaWYgdGhlIGhhbmRsZXIgdGhyb3dzIGFuIGV4Y2VwdGlvbi5cbiAgIGBgYGpzXG4gIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgIHJldHVybiB1c2VyLm5hbWU7XG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICByZXR1cm4gJ2RlZmF1bHQgbmFtZSc7XG4gIH0pLnRoZW4oZnVuY3Rpb24gKHVzZXJOYW1lKSB7XG4gICAgLy8gSWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGB1c2VyTmFtZWAgd2lsbCBiZSB0aGUgdXNlcidzIG5hbWUsIG90aGVyd2lzZSBpdFxuICAgIC8vIHdpbGwgYmUgYCdkZWZhdWx0IG5hbWUnYFxuICB9KTtcbiAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknKTtcbiAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScpO1xuICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIC8vIGlmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgcmVhc29uYCB3aWxsIGJlICdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScuXG4gICAgLy8gSWYgYGZpbmRVc2VyYCByZWplY3RlZCwgYHJlYXNvbmAgd2lsbCBiZSAnYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScuXG4gIH0pO1xuICBgYGBcbiAgSWYgdGhlIGRvd25zdHJlYW0gcHJvbWlzZSBkb2VzIG5vdCBzcGVjaWZ5IGEgcmVqZWN0aW9uIGhhbmRsZXIsIHJlamVjdGlvbiByZWFzb25zIHdpbGwgYmUgcHJvcGFnYXRlZCBmdXJ0aGVyIGRvd25zdHJlYW0uXG4gICBgYGBqc1xuICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICB0aHJvdyBuZXcgUGVkYWdvZ2ljYWxFeGNlcHRpb24oJ1Vwc3RyZWFtIGVycm9yJyk7XG4gIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8gbmV2ZXIgcmVhY2hlZFxuICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIC8vIFRoZSBgUGVkZ2Fnb2NpYWxFeGNlcHRpb25gIGlzIHByb3BhZ2F0ZWQgYWxsIHRoZSB3YXkgZG93biB0byBoZXJlXG4gIH0pO1xuICBgYGBcbiAgIEFzc2ltaWxhdGlvblxuICAtLS0tLS0tLS0tLS1cbiAgIFNvbWV0aW1lcyB0aGUgdmFsdWUgeW91IHdhbnQgdG8gcHJvcGFnYXRlIHRvIGEgZG93bnN0cmVhbSBwcm9taXNlIGNhbiBvbmx5IGJlXG4gIHJldHJpZXZlZCBhc3luY2hyb25vdXNseS4gVGhpcyBjYW4gYmUgYWNoaWV2ZWQgYnkgcmV0dXJuaW5nIGEgcHJvbWlzZSBpbiB0aGVcbiAgZnVsZmlsbG1lbnQgb3IgcmVqZWN0aW9uIGhhbmRsZXIuIFRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCB0aGVuIGJlIHBlbmRpbmdcbiAgdW50aWwgdGhlIHJldHVybmVkIHByb21pc2UgaXMgc2V0dGxlZC4gVGhpcyBpcyBjYWxsZWQgKmFzc2ltaWxhdGlvbiouXG4gICBgYGBqc1xuICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgLy8gVGhlIHVzZXIncyBjb21tZW50cyBhcmUgbm93IGF2YWlsYWJsZVxuICB9KTtcbiAgYGBgXG4gICBJZiB0aGUgYXNzaW1saWF0ZWQgcHJvbWlzZSByZWplY3RzLCB0aGVuIHRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCBhbHNvIHJlamVjdC5cbiAgIGBgYGpzXG4gIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIGZ1bGZpbGxzLCB3ZSdsbCBoYXZlIHRoZSB2YWx1ZSBoZXJlXG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIHJlamVjdHMsIHdlJ2xsIGhhdmUgdGhlIHJlYXNvbiBoZXJlXG4gIH0pO1xuICBgYGBcbiAgIFNpbXBsZSBFeGFtcGxlXG4gIC0tLS0tLS0tLS0tLS0tXG4gICBTeW5jaHJvbm91cyBFeGFtcGxlXG4gICBgYGBqYXZhc2NyaXB0XG4gIGxldCByZXN1bHQ7XG4gICB0cnkge1xuICAgIHJlc3VsdCA9IGZpbmRSZXN1bHQoKTtcbiAgICAvLyBzdWNjZXNzXG4gIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgLy8gZmFpbHVyZVxuICB9XG4gIGBgYFxuICAgRXJyYmFjayBFeGFtcGxlXG4gICBgYGBqc1xuICBmaW5kUmVzdWx0KGZ1bmN0aW9uKHJlc3VsdCwgZXJyKXtcbiAgICBpZiAoZXJyKSB7XG4gICAgICAvLyBmYWlsdXJlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHN1Y2Nlc3NcbiAgICB9XG4gIH0pO1xuICBgYGBcbiAgIFByb21pc2UgRXhhbXBsZTtcbiAgIGBgYGphdmFzY3JpcHRcbiAgZmluZFJlc3VsdCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAvLyBzdWNjZXNzXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gZmFpbHVyZVxuICB9KTtcbiAgYGBgXG4gICBBZHZhbmNlZCBFeGFtcGxlXG4gIC0tLS0tLS0tLS0tLS0tXG4gICBTeW5jaHJvbm91cyBFeGFtcGxlXG4gICBgYGBqYXZhc2NyaXB0XG4gIGxldCBhdXRob3IsIGJvb2tzO1xuICAgdHJ5IHtcbiAgICBhdXRob3IgPSBmaW5kQXV0aG9yKCk7XG4gICAgYm9va3MgID0gZmluZEJvb2tzQnlBdXRob3IoYXV0aG9yKTtcbiAgICAvLyBzdWNjZXNzXG4gIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgLy8gZmFpbHVyZVxuICB9XG4gIGBgYFxuICAgRXJyYmFjayBFeGFtcGxlXG4gICBgYGBqc1xuICAgZnVuY3Rpb24gZm91bmRCb29rcyhib29rcykge1xuICAgfVxuICAgZnVuY3Rpb24gZmFpbHVyZShyZWFzb24pIHtcbiAgIH1cbiAgIGZpbmRBdXRob3IoZnVuY3Rpb24oYXV0aG9yLCBlcnIpe1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgIC8vIGZhaWx1cmVcbiAgICB9IGVsc2Uge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZmluZEJvb29rc0J5QXV0aG9yKGF1dGhvciwgZnVuY3Rpb24oYm9va3MsIGVycikge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZm91bmRCb29rcyhib29rcyk7XG4gICAgICAgICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAgICAgICBmYWlsdXJlKHJlYXNvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgfVxuICAgICAgLy8gc3VjY2Vzc1xuICAgIH1cbiAgfSk7XG4gIGBgYFxuICAgUHJvbWlzZSBFeGFtcGxlO1xuICAgYGBgamF2YXNjcmlwdFxuICBmaW5kQXV0aG9yKCkuXG4gICAgdGhlbihmaW5kQm9va3NCeUF1dGhvcikuXG4gICAgdGhlbihmdW5jdGlvbihib29rcyl7XG4gICAgICAvLyBmb3VuZCBib29rc1xuICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gIH0pO1xuICBgYGBcbiAgIEBtZXRob2QgdGhlblxuICBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZ1bGZpbGxlZFxuICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGVkXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX1cbiAgKi9cblxuICAvKipcbiAgYGNhdGNoYCBpcyBzaW1wbHkgc3VnYXIgZm9yIGB0aGVuKHVuZGVmaW5lZCwgb25SZWplY3Rpb24pYCB3aGljaCBtYWtlcyBpdCB0aGUgc2FtZVxuICBhcyB0aGUgY2F0Y2ggYmxvY2sgb2YgYSB0cnkvY2F0Y2ggc3RhdGVtZW50LlxuICBgYGBqc1xuICBmdW5jdGlvbiBmaW5kQXV0aG9yKCl7XG4gIHRocm93IG5ldyBFcnJvcignY291bGRuJ3QgZmluZCB0aGF0IGF1dGhvcicpO1xuICB9XG4gIC8vIHN5bmNocm9ub3VzXG4gIHRyeSB7XG4gIGZpbmRBdXRob3IoKTtcbiAgfSBjYXRjaChyZWFzb24pIHtcbiAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgfVxuICAvLyBhc3luYyB3aXRoIHByb21pc2VzXG4gIGZpbmRBdXRob3IoKS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICB9KTtcbiAgYGBgXG4gIEBtZXRob2QgY2F0Y2hcbiAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3Rpb25cbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfVxuICAqL1xuXG5cbiAgUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2ggPSBmdW5jdGlvbiBfY2F0Y2gob25SZWplY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0aW9uKTtcbiAgfTtcblxuICAvKipcbiAgICBgZmluYWxseWAgd2lsbCBiZSBpbnZva2VkIHJlZ2FyZGxlc3Mgb2YgdGhlIHByb21pc2UncyBmYXRlIGp1c3QgYXMgbmF0aXZlXG4gICAgdHJ5L2NhdGNoL2ZpbmFsbHkgYmVoYXZlc1xuICBcbiAgICBTeW5jaHJvbm91cyBleGFtcGxlOlxuICBcbiAgICBgYGBqc1xuICAgIGZpbmRBdXRob3IoKSB7XG4gICAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgQXV0aG9yKCk7XG4gICAgfVxuICBcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZpbmRBdXRob3IoKTsgLy8gc3VjY2VlZCBvciBmYWlsXG4gICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgcmV0dXJuIGZpbmRPdGhlckF1dGhlcigpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBhbHdheXMgcnVuc1xuICAgICAgLy8gZG9lc24ndCBhZmZlY3QgdGhlIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgICBgYGBcbiAgXG4gICAgQXN5bmNocm9ub3VzIGV4YW1wbGU6XG4gIFxuICAgIGBgYGpzXG4gICAgZmluZEF1dGhvcigpLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICByZXR1cm4gZmluZE90aGVyQXV0aGVyKCk7XG4gICAgfSkuZmluYWxseShmdW5jdGlvbigpe1xuICAgICAgLy8gYXV0aG9yIHdhcyBlaXRoZXIgZm91bmQsIG9yIG5vdFxuICAgIH0pO1xuICAgIGBgYFxuICBcbiAgICBAbWV0aG9kIGZpbmFsbHlcbiAgICBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICovXG5cblxuICBQcm9taXNlLnByb3RvdHlwZS5maW5hbGx5ID0gZnVuY3Rpb24gX2ZpbmFsbHkoY2FsbGJhY2spIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gICAgdmFyIGNvbnN0cnVjdG9yID0gcHJvbWlzZS5jb25zdHJ1Y3RvcjtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9KTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlLnRoZW4oY2FsbGJhY2ssIGNhbGxiYWNrKTtcbiAgfTtcblxuICByZXR1cm4gUHJvbWlzZTtcbn0oKTtcblxuUHJvbWlzZSQxLnByb3RvdHlwZS50aGVuID0gdGhlbjtcblByb21pc2UkMS5hbGwgPSBhbGw7XG5Qcm9taXNlJDEucmFjZSA9IHJhY2U7XG5Qcm9taXNlJDEucmVzb2x2ZSA9IHJlc29sdmUkMTtcblByb21pc2UkMS5yZWplY3QgPSByZWplY3QkMTtcblByb21pc2UkMS5fc2V0U2NoZWR1bGVyID0gc2V0U2NoZWR1bGVyO1xuUHJvbWlzZSQxLl9zZXRBc2FwID0gc2V0QXNhcDtcblByb21pc2UkMS5fYXNhcCA9IGFzYXA7XG5cbi8qZ2xvYmFsIHNlbGYqL1xuZnVuY3Rpb24gcG9seWZpbGwoKSB7XG4gIHZhciBsb2NhbCA9IHZvaWQgMDtcblxuICBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBsb2NhbCA9IGdsb2JhbDtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBsb2NhbCA9IHNlbGY7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3BvbHlmaWxsIGZhaWxlZCBiZWNhdXNlIGdsb2JhbCBvYmplY3QgaXMgdW5hdmFpbGFibGUgaW4gdGhpcyBlbnZpcm9ubWVudCcpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBQID0gbG9jYWwuUHJvbWlzZTtcblxuICBpZiAoUCkge1xuICAgIHZhciBwcm9taXNlVG9TdHJpbmcgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBwcm9taXNlVG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoUC5yZXNvbHZlKCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIHNpbGVudGx5IGlnbm9yZWRcbiAgICB9XG5cbiAgICBpZiAocHJvbWlzZVRvU3RyaW5nID09PSAnW29iamVjdCBQcm9taXNlXScgJiYgIVAuY2FzdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIGxvY2FsLlByb21pc2UgPSBQcm9taXNlJDE7XG59XG5cbi8vIFN0cmFuZ2UgY29tcGF0Li5cblByb21pc2UkMS5wb2x5ZmlsbCA9IHBvbHlmaWxsO1xuUHJvbWlzZSQxLlByb21pc2UgPSBQcm9taXNlJDE7XG5cbnJldHVybiBQcm9taXNlJDE7XG5cbn0pKSk7XG5cblxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lczYtcHJvbWlzZS5tYXBcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xudmFyIGdPUEQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuXG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uIGlzQXJyYXkoYXJyKSB7XG5cdGlmICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGFycik7XG5cdH1cblxuXHRyZXR1cm4gdG9TdHIuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuXHRpZiAoIW9iaiB8fCB0b1N0ci5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIGhhc093bkNvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc0lzUHJvdG90eXBlT2YgPSBvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc093bkNvbnN0cnVjdG9yICYmICFoYXNJc1Byb3RvdHlwZU9mKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gT3duIHByb3BlcnRpZXMgYXJlIGVudW1lcmF0ZWQgZmlyc3RseSwgc28gdG8gc3BlZWQgdXAsXG5cdC8vIGlmIGxhc3Qgb25lIGlzIG93biwgdGhlbiBhbGwgcHJvcGVydGllcyBhcmUgb3duLlxuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBvYmopIHsgLyoqLyB9XG5cblx0cmV0dXJuIHR5cGVvZiBrZXkgPT09ICd1bmRlZmluZWQnIHx8IGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG5cbi8vIElmIG5hbWUgaXMgJ19fcHJvdG9fXycsIGFuZCBPYmplY3QuZGVmaW5lUHJvcGVydHkgaXMgYXZhaWxhYmxlLCBkZWZpbmUgX19wcm90b19fIGFzIGFuIG93biBwcm9wZXJ0eSBvbiB0YXJnZXRcbnZhciBzZXRQcm9wZXJ0eSA9IGZ1bmN0aW9uIHNldFByb3BlcnR5KHRhcmdldCwgb3B0aW9ucykge1xuXHRpZiAoZGVmaW5lUHJvcGVydHkgJiYgb3B0aW9ucy5uYW1lID09PSAnX19wcm90b19fJykge1xuXHRcdGRlZmluZVByb3BlcnR5KHRhcmdldCwgb3B0aW9ucy5uYW1lLCB7XG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxuXHRcdFx0dmFsdWU6IG9wdGlvbnMubmV3VmFsdWUsXG5cdFx0XHR3cml0YWJsZTogdHJ1ZVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHRhcmdldFtvcHRpb25zLm5hbWVdID0gb3B0aW9ucy5uZXdWYWx1ZTtcblx0fVxufTtcblxuLy8gUmV0dXJuIHVuZGVmaW5lZCBpbnN0ZWFkIG9mIF9fcHJvdG9fXyBpZiAnX19wcm90b19fJyBpcyBub3QgYW4gb3duIHByb3BlcnR5XG52YXIgZ2V0UHJvcGVydHkgPSBmdW5jdGlvbiBnZXRQcm9wZXJ0eShvYmosIG5hbWUpIHtcblx0aWYgKG5hbWUgPT09ICdfX3Byb3RvX18nKSB7XG5cdFx0aWYgKCFoYXNPd24uY2FsbChvYmosIG5hbWUpKSB7XG5cdFx0XHRyZXR1cm4gdm9pZCAwO1xuXHRcdH0gZWxzZSBpZiAoZ09QRCkge1xuXHRcdFx0Ly8gSW4gZWFybHkgdmVyc2lvbnMgb2Ygbm9kZSwgb2JqWydfX3Byb3RvX18nXSBpcyBidWdneSB3aGVuIG9iaiBoYXNcblx0XHRcdC8vIF9fcHJvdG9fXyBhcyBhbiBvd24gcHJvcGVydHkuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoKSB3b3Jrcy5cblx0XHRcdHJldHVybiBnT1BEKG9iaiwgbmFtZSkudmFsdWU7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG9ialtuYW1lXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmU7XG5cdHZhciB0YXJnZXQgPSBhcmd1bWVudHNbMF07XG5cdHZhciBpID0gMTtcblx0dmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cdHZhciBkZWVwID0gZmFsc2U7XG5cblx0Ly8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvblxuXHRpZiAodHlwZW9mIHRhcmdldCA9PT0gJ2Jvb2xlYW4nKSB7XG5cdFx0ZGVlcCA9IHRhcmdldDtcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMV0gfHwge307XG5cdFx0Ly8gc2tpcCB0aGUgYm9vbGVhbiBhbmQgdGhlIHRhcmdldFxuXHRcdGkgPSAyO1xuXHR9XG5cdGlmICh0YXJnZXQgPT0gbnVsbCB8fCAodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJykpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAob3B0aW9ucyAhPSBudWxsKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRzcmMgPSBnZXRQcm9wZXJ0eSh0YXJnZXQsIG5hbWUpO1xuXHRcdFx0XHRjb3B5ID0gZ2V0UHJvcGVydHkob3B0aW9ucywgbmFtZSk7XG5cblx0XHRcdFx0Ly8gUHJldmVudCBuZXZlci1lbmRpbmcgbG9vcFxuXHRcdFx0XHRpZiAodGFyZ2V0ICE9PSBjb3B5KSB7XG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG5cdFx0XHRcdFx0aWYgKGRlZXAgJiYgY29weSAmJiAoaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBpc0FycmF5KGNvcHkpKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjb3B5SXNBcnJheSkge1xuXHRcdFx0XHRcdFx0XHRjb3B5SXNBcnJheSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHRcdHNldFByb3BlcnR5KHRhcmdldCwgeyBuYW1lOiBuYW1lLCBuZXdWYWx1ZTogZXh0ZW5kKGRlZXAsIGNsb25lLCBjb3B5KSB9KTtcblxuXHRcdFx0XHRcdC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjb3B5ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0c2V0UHJvcGVydHkodGFyZ2V0LCB7IG5hbWU6IG5hbWUsIG5ld1ZhbHVlOiBjb3B5IH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuIiwiLypcbiAqICBiYXNlNjQuanNcbiAqXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIEJTRCAzLUNsYXVzZSBMaWNlbnNlLlxuICogICAgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICpcbiAqICBSZWZlcmVuY2VzOlxuICogICAgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CYXNlNjRcbiAqL1xuOyhmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gICAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KGdsb2JhbClcbiAgICAgICAgOiB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWRcbiAgICAgICAgPyBkZWZpbmUoZmFjdG9yeSkgOiBmYWN0b3J5KGdsb2JhbClcbn0oKFxuICAgIHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGZcbiAgICAgICAgOiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvd1xuICAgICAgICA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsXG46IHRoaXNcbiksIGZ1bmN0aW9uKGdsb2JhbCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvLyBleGlzdGluZyB2ZXJzaW9uIGZvciBub0NvbmZsaWN0KClcbiAgICBnbG9iYWwgPSBnbG9iYWwgfHwge307XG4gICAgdmFyIF9CYXNlNjQgPSBnbG9iYWwuQmFzZTY0O1xuICAgIHZhciB2ZXJzaW9uID0gXCIyLjUuMlwiO1xuICAgIC8vIGlmIG5vZGUuanMgYW5kIE5PVCBSZWFjdCBOYXRpdmUsIHdlIHVzZSBCdWZmZXJcbiAgICB2YXIgYnVmZmVyO1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYnVmZmVyID0gZXZhbChcInJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlclwiKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBidWZmZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gY29uc3RhbnRzXG4gICAgdmFyIGI2NGNoYXJzXG4gICAgICAgID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuICAgIHZhciBiNjR0YWIgPSBmdW5jdGlvbihiaW4pIHtcbiAgICAgICAgdmFyIHQgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBiaW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB0W2Jpbi5jaGFyQXQoaSldID0gaTtcbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfShiNjRjaGFycyk7XG4gICAgdmFyIGZyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG4gICAgLy8gZW5jb2RlciBzdHVmZlxuICAgIHZhciBjYl91dG9iID0gZnVuY3Rpb24oYykge1xuICAgICAgICBpZiAoYy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICB2YXIgY2MgPSBjLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgICByZXR1cm4gY2MgPCAweDgwID8gY1xuICAgICAgICAgICAgICAgIDogY2MgPCAweDgwMCA/IChmcm9tQ2hhckNvZGUoMHhjMCB8IChjYyA+Pj4gNikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKDB4ODAgfCAoY2MgJiAweDNmKSkpXG4gICAgICAgICAgICAgICAgOiAoZnJvbUNoYXJDb2RlKDB4ZTAgfCAoKGNjID4+PiAxMikgJiAweDBmKSlcbiAgICAgICAgICAgICAgICAgICAgKyBmcm9tQ2hhckNvZGUoMHg4MCB8ICgoY2MgPj4+ICA2KSAmIDB4M2YpKVxuICAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgweDgwIHwgKCBjYyAgICAgICAgICYgMHgzZikpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBjYyA9IDB4MTAwMDBcbiAgICAgICAgICAgICAgICArIChjLmNoYXJDb2RlQXQoMCkgLSAweEQ4MDApICogMHg0MDBcbiAgICAgICAgICAgICAgICArIChjLmNoYXJDb2RlQXQoMSkgLSAweERDMDApO1xuICAgICAgICAgICAgcmV0dXJuIChmcm9tQ2hhckNvZGUoMHhmMCB8ICgoY2MgPj4+IDE4KSAmIDB4MDcpKVxuICAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgweDgwIHwgKChjYyA+Pj4gMTIpICYgMHgzZikpXG4gICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKDB4ODAgfCAoKGNjID4+PiAgNikgJiAweDNmKSlcbiAgICAgICAgICAgICAgICAgICAgKyBmcm9tQ2hhckNvZGUoMHg4MCB8ICggY2MgICAgICAgICAmIDB4M2YpKSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHZhciByZV91dG9iID0gL1tcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRkZdfFteXFx4MDAtXFx4N0ZdL2c7XG4gICAgdmFyIHV0b2IgPSBmdW5jdGlvbih1KSB7XG4gICAgICAgIHJldHVybiB1LnJlcGxhY2UocmVfdXRvYiwgY2JfdXRvYik7XG4gICAgfTtcbiAgICB2YXIgY2JfZW5jb2RlID0gZnVuY3Rpb24oY2NjKSB7XG4gICAgICAgIHZhciBwYWRsZW4gPSBbMCwgMiwgMV1bY2NjLmxlbmd0aCAlIDNdLFxuICAgICAgICBvcmQgPSBjY2MuY2hhckNvZGVBdCgwKSA8PCAxNlxuICAgICAgICAgICAgfCAoKGNjYy5sZW5ndGggPiAxID8gY2NjLmNoYXJDb2RlQXQoMSkgOiAwKSA8PCA4KVxuICAgICAgICAgICAgfCAoKGNjYy5sZW5ndGggPiAyID8gY2NjLmNoYXJDb2RlQXQoMikgOiAwKSksXG4gICAgICAgIGNoYXJzID0gW1xuICAgICAgICAgICAgYjY0Y2hhcnMuY2hhckF0KCBvcmQgPj4+IDE4KSxcbiAgICAgICAgICAgIGI2NGNoYXJzLmNoYXJBdCgob3JkID4+PiAxMikgJiA2MyksXG4gICAgICAgICAgICBwYWRsZW4gPj0gMiA/ICc9JyA6IGI2NGNoYXJzLmNoYXJBdCgob3JkID4+PiA2KSAmIDYzKSxcbiAgICAgICAgICAgIHBhZGxlbiA+PSAxID8gJz0nIDogYjY0Y2hhcnMuY2hhckF0KG9yZCAmIDYzKVxuICAgICAgICBdO1xuICAgICAgICByZXR1cm4gY2hhcnMuam9pbignJyk7XG4gICAgfTtcbiAgICB2YXIgYnRvYSA9IGdsb2JhbC5idG9hID8gZnVuY3Rpb24oYikge1xuICAgICAgICByZXR1cm4gZ2xvYmFsLmJ0b2EoYik7XG4gICAgfSA6IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgcmV0dXJuIGIucmVwbGFjZSgvW1xcc1xcU117MSwzfS9nLCBjYl9lbmNvZGUpO1xuICAgIH07XG4gICAgdmFyIF9lbmNvZGUgPSBmdW5jdGlvbih1KSB7XG4gICAgICAgIHZhciBpc1VpbnQ4QXJyYXkgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodSkgPT09ICdbb2JqZWN0IFVpbnQ4QXJyYXldJztcbiAgICAgICAgcmV0dXJuIGlzVWludDhBcnJheSA/IHUudG9TdHJpbmcoJ2Jhc2U2NCcpXG4gICAgICAgICAgICA6IGJ0b2EodXRvYihTdHJpbmcodSkpKTtcbiAgICB9XG4gICAgdmFyIGVuY29kZSA9IGZ1bmN0aW9uKHUsIHVyaXNhZmUpIHtcbiAgICAgICAgcmV0dXJuICF1cmlzYWZlXG4gICAgICAgICAgICA/IF9lbmNvZGUodSlcbiAgICAgICAgICAgIDogX2VuY29kZShTdHJpbmcodSkpLnJlcGxhY2UoL1srXFwvXS9nLCBmdW5jdGlvbihtMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtMCA9PSAnKycgPyAnLScgOiAnXyc7XG4gICAgICAgICAgICB9KS5yZXBsYWNlKC89L2csICcnKTtcbiAgICB9O1xuICAgIHZhciBlbmNvZGVVUkkgPSBmdW5jdGlvbih1KSB7IHJldHVybiBlbmNvZGUodSwgdHJ1ZSkgfTtcbiAgICAvLyBkZWNvZGVyIHN0dWZmXG4gICAgdmFyIHJlX2J0b3UgPSAvW1xceEMwLVxceERGXVtcXHg4MC1cXHhCRl18W1xceEUwLVxceEVGXVtcXHg4MC1cXHhCRl17Mn18W1xceEYwLVxceEY3XVtcXHg4MC1cXHhCRl17M30vZztcbiAgICB2YXIgY2JfYnRvdSA9IGZ1bmN0aW9uKGNjY2MpIHtcbiAgICAgICAgc3dpdGNoKGNjY2MubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHZhciBjcCA9ICgoMHgwNyAmIGNjY2MuY2hhckNvZGVBdCgwKSkgPDwgMTgpXG4gICAgICAgICAgICAgICAgfCAgICAoKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMSkpIDw8IDEyKVxuICAgICAgICAgICAgICAgIHwgICAgKCgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDIpKSA8PCAgNilcbiAgICAgICAgICAgICAgICB8ICAgICAoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgzKSksXG4gICAgICAgICAgICBvZmZzZXQgPSBjcCAtIDB4MTAwMDA7XG4gICAgICAgICAgICByZXR1cm4gKGZyb21DaGFyQ29kZSgob2Zmc2V0ICA+Pj4gMTApICsgMHhEODAwKVxuICAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgob2Zmc2V0ICYgMHgzRkYpICsgMHhEQzAwKSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBmcm9tQ2hhckNvZGUoXG4gICAgICAgICAgICAgICAgKCgweDBmICYgY2NjYy5jaGFyQ29kZUF0KDApKSA8PCAxMilcbiAgICAgICAgICAgICAgICAgICAgfCAoKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMSkpIDw8IDYpXG4gICAgICAgICAgICAgICAgICAgIHwgICgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDIpKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiAgZnJvbUNoYXJDb2RlKFxuICAgICAgICAgICAgICAgICgoMHgxZiAmIGNjY2MuY2hhckNvZGVBdCgwKSkgPDwgNilcbiAgICAgICAgICAgICAgICAgICAgfCAgKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMSkpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgYnRvdSA9IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgcmV0dXJuIGIucmVwbGFjZShyZV9idG91LCBjYl9idG91KTtcbiAgICB9O1xuICAgIHZhciBjYl9kZWNvZGUgPSBmdW5jdGlvbihjY2NjKSB7XG4gICAgICAgIHZhciBsZW4gPSBjY2NjLmxlbmd0aCxcbiAgICAgICAgcGFkbGVuID0gbGVuICUgNCxcbiAgICAgICAgbiA9IChsZW4gPiAwID8gYjY0dGFiW2NjY2MuY2hhckF0KDApXSA8PCAxOCA6IDApXG4gICAgICAgICAgICB8IChsZW4gPiAxID8gYjY0dGFiW2NjY2MuY2hhckF0KDEpXSA8PCAxMiA6IDApXG4gICAgICAgICAgICB8IChsZW4gPiAyID8gYjY0dGFiW2NjY2MuY2hhckF0KDIpXSA8PCAgNiA6IDApXG4gICAgICAgICAgICB8IChsZW4gPiAzID8gYjY0dGFiW2NjY2MuY2hhckF0KDMpXSAgICAgICA6IDApLFxuICAgICAgICBjaGFycyA9IFtcbiAgICAgICAgICAgIGZyb21DaGFyQ29kZSggbiA+Pj4gMTYpLFxuICAgICAgICAgICAgZnJvbUNoYXJDb2RlKChuID4+PiAgOCkgJiAweGZmKSxcbiAgICAgICAgICAgIGZyb21DaGFyQ29kZSggbiAgICAgICAgICYgMHhmZilcbiAgICAgICAgXTtcbiAgICAgICAgY2hhcnMubGVuZ3RoIC09IFswLCAwLCAyLCAxXVtwYWRsZW5dO1xuICAgICAgICByZXR1cm4gY2hhcnMuam9pbignJyk7XG4gICAgfTtcbiAgICB2YXIgX2F0b2IgPSBnbG9iYWwuYXRvYiA/IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgcmV0dXJuIGdsb2JhbC5hdG9iKGEpO1xuICAgIH0gOiBmdW5jdGlvbihhKXtcbiAgICAgICAgcmV0dXJuIGEucmVwbGFjZSgvXFxTezEsNH0vZywgY2JfZGVjb2RlKTtcbiAgICB9O1xuICAgIHZhciBhdG9iID0gZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gX2F0b2IoU3RyaW5nKGEpLnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXS9nLCAnJykpO1xuICAgIH07XG4gICAgdmFyIF9kZWNvZGUgPSBidWZmZXIgP1xuICAgICAgICBidWZmZXIuZnJvbSAmJiBVaW50OEFycmF5ICYmIGJ1ZmZlci5mcm9tICE9PSBVaW50OEFycmF5LmZyb21cbiAgICAgICAgPyBmdW5jdGlvbihhKSB7XG4gICAgICAgICAgICByZXR1cm4gKGEuY29uc3RydWN0b3IgPT09IGJ1ZmZlci5jb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgICAgICA/IGEgOiBidWZmZXIuZnJvbShhLCAnYmFzZTY0JykpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgOiBmdW5jdGlvbihhKSB7XG4gICAgICAgICAgICByZXR1cm4gKGEuY29uc3RydWN0b3IgPT09IGJ1ZmZlci5jb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgICAgICA/IGEgOiBuZXcgYnVmZmVyKGEsICdiYXNlNjQnKSkudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICA6IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGJ0b3UoX2F0b2IoYSkpIH07XG4gICAgdmFyIGRlY29kZSA9IGZ1bmN0aW9uKGEpe1xuICAgICAgICByZXR1cm4gX2RlY29kZShcbiAgICAgICAgICAgIFN0cmluZyhhKS5yZXBsYWNlKC9bLV9dL2csIGZ1bmN0aW9uKG0wKSB7IHJldHVybiBtMCA9PSAnLScgPyAnKycgOiAnLycgfSlcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9dL2csICcnKVxuICAgICAgICApO1xuICAgIH07XG4gICAgdmFyIG5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIEJhc2U2NCA9IGdsb2JhbC5CYXNlNjQ7XG4gICAgICAgIGdsb2JhbC5CYXNlNjQgPSBfQmFzZTY0O1xuICAgICAgICByZXR1cm4gQmFzZTY0O1xuICAgIH07XG4gICAgLy8gZXhwb3J0IEJhc2U2NFxuICAgIGdsb2JhbC5CYXNlNjQgPSB7XG4gICAgICAgIFZFUlNJT046IHZlcnNpb24sXG4gICAgICAgIGF0b2I6IGF0b2IsXG4gICAgICAgIGJ0b2E6IGJ0b2EsXG4gICAgICAgIGZyb21CYXNlNjQ6IGRlY29kZSxcbiAgICAgICAgdG9CYXNlNjQ6IGVuY29kZSxcbiAgICAgICAgdXRvYjogdXRvYixcbiAgICAgICAgZW5jb2RlOiBlbmNvZGUsXG4gICAgICAgIGVuY29kZVVSSTogZW5jb2RlVVJJLFxuICAgICAgICBidG91OiBidG91LFxuICAgICAgICBkZWNvZGU6IGRlY29kZSxcbiAgICAgICAgbm9Db25mbGljdDogbm9Db25mbGljdCxcbiAgICAgICAgX19idWZmZXJfXzogYnVmZmVyXG4gICAgfTtcbiAgICAvLyBpZiBFUzUgaXMgYXZhaWxhYmxlLCBtYWtlIEJhc2U2NC5leHRlbmRTdHJpbmcoKSBhdmFpbGFibGVcbiAgICBpZiAodHlwZW9mIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgbm9FbnVtID0gZnVuY3Rpb24odil7XG4gICAgICAgICAgICByZXR1cm4ge3ZhbHVlOnYsZW51bWVyYWJsZTpmYWxzZSx3cml0YWJsZTp0cnVlLGNvbmZpZ3VyYWJsZTp0cnVlfTtcbiAgICAgICAgfTtcbiAgICAgICAgZ2xvYmFsLkJhc2U2NC5leHRlbmRTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgU3RyaW5nLnByb3RvdHlwZSwgJ2Zyb21CYXNlNjQnLCBub0VudW0oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2RlKHRoaXMpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgIFN0cmluZy5wcm90b3R5cGUsICd0b0Jhc2U2NCcsIG5vRW51bShmdW5jdGlvbiAodXJpc2FmZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW5jb2RlKHRoaXMsIHVyaXNhZmUpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgIFN0cmluZy5wcm90b3R5cGUsICd0b0Jhc2U2NFVSSScsIG5vRW51bShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbmNvZGUodGhpcywgdHJ1ZSlcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vXG4gICAgLy8gZXhwb3J0IEJhc2U2NCB0byB0aGUgbmFtZXNwYWNlXG4gICAgLy9cbiAgICBpZiAoZ2xvYmFsWydNZXRlb3InXSkgeyAvLyBNZXRlb3IuanNcbiAgICAgICAgQmFzZTY0ID0gZ2xvYmFsLkJhc2U2NDtcbiAgICB9XG4gICAgLy8gbW9kdWxlLmV4cG9ydHMgYW5kIEFNRCBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlLlxuICAgIC8vIG1vZHVsZS5leHBvcnRzIGhhcyBwcmVjZWRlbmNlLlxuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cy5CYXNlNjQgPSBnbG9iYWwuQmFzZTY0O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCl7IHJldHVybiBnbG9iYWwuQmFzZTY0IH0pO1xuICAgIH1cbiAgICAvLyB0aGF0J3MgaXQhXG4gICAgcmV0dXJuIHtCYXNlNjQ6IGdsb2JhbC5CYXNlNjR9XG59KSk7XG5cbiIsIi8qKlxuICogbG9kYXNoIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyA8aHR0cHM6Ly9qcXVlcnkub3JnLz5cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS44LjMgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqL1xuXG4vKiogVXNlZCBhcyB0aGUgYFR5cGVFcnJvcmAgbWVzc2FnZSBmb3IgXCJGdW5jdGlvbnNcIiBtZXRob2RzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTkFOID0gMCAvIDA7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS4gKi9cbnZhciByZVRyaW0gPSAvXlxccyt8XFxzKyQvZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJhZCBzaWduZWQgaGV4YWRlY2ltYWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmFkSGV4ID0gL15bLStdMHhbMC05YS1mXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiaW5hcnkgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzQmluYXJ5ID0gL14wYlswMV0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb2N0YWwgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUlzT2N0YWwgPSAvXjBvWzAtN10rJC9pO1xuXG4vKiogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgd2l0aG91dCBhIGRlcGVuZGVuY3kgb24gYHJvb3RgLiAqL1xudmFyIGZyZWVQYXJzZUludCA9IHBhcnNlSW50O1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXgsXG4gICAgbmF0aXZlTWluID0gTWF0aC5taW47XG5cbi8qKlxuICogR2V0cyB0aGUgdGltZXN0YW1wIG9mIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgaGF2ZSBlbGFwc2VkIHNpbmNlXG4gKiB0aGUgVW5peCBlcG9jaCAoMSBKYW51YXJ5IDE5NzAgMDA6MDA6MDAgVVRDKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgRGF0ZVxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgdGltZXN0YW1wLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmRlZmVyKGZ1bmN0aW9uKHN0YW1wKSB7XG4gKiAgIGNvbnNvbGUubG9nKF8ubm93KCkgLSBzdGFtcCk7XG4gKiB9LCBfLm5vdygpKTtcbiAqIC8vID0+IExvZ3MgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgaXQgdG9vayBmb3IgdGhlIGRlZmVycmVkIGludm9jYXRpb24uXG4gKi9cbnZhciBub3cgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHJvb3QuRGF0ZS5ub3coKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRlYm91bmNlZCBmdW5jdGlvbiB0aGF0IGRlbGF5cyBpbnZva2luZyBgZnVuY2AgdW50aWwgYWZ0ZXIgYHdhaXRgXG4gKiBtaWxsaXNlY29uZHMgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IHRpbWUgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiB3YXNcbiAqIGludm9rZWQuIFRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgIG1ldGhvZCB0byBjYW5jZWxcbiAqIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvIGltbWVkaWF0ZWx5IGludm9rZSB0aGVtLlxuICogUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2Agc2hvdWxkIGJlIGludm9rZWQgb24gdGhlXG4gKiBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGAgdGltZW91dC4gVGhlIGBmdW5jYCBpcyBpbnZva2VkXG4gKiB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uLiBTdWJzZXF1ZW50XG4gKiBjYWxscyB0byB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYFxuICogaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIGRlYm91bmNlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy5kZWJvdW5jZWAgYW5kIGBfLnRocm90dGxlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRlYm91bmNlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9ZmFsc2VdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdhaXRdXG4gKiAgVGhlIG1heGltdW0gdGltZSBgZnVuY2AgaXMgYWxsb3dlZCB0byBiZSBkZWxheWVkIGJlZm9yZSBpdCdzIGludm9rZWQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGRlYm91bmNlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgY29zdGx5IGNhbGN1bGF0aW9ucyB3aGlsZSB0aGUgd2luZG93IHNpemUgaXMgaW4gZmx1eC5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdyZXNpemUnLCBfLmRlYm91bmNlKGNhbGN1bGF0ZUxheW91dCwgMTUwKSk7XG4gKlxuICogLy8gSW52b2tlIGBzZW5kTWFpbGAgd2hlbiBjbGlja2VkLCBkZWJvdW5jaW5nIHN1YnNlcXVlbnQgY2FsbHMuXG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgXy5kZWJvdW5jZShzZW5kTWFpbCwgMzAwLCB7XG4gKiAgICdsZWFkaW5nJzogdHJ1ZSxcbiAqICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAqIH0pKTtcbiAqXG4gKiAvLyBFbnN1cmUgYGJhdGNoTG9nYCBpcyBpbnZva2VkIG9uY2UgYWZ0ZXIgMSBzZWNvbmQgb2YgZGVib3VuY2VkIGNhbGxzLlxuICogdmFyIGRlYm91bmNlZCA9IF8uZGVib3VuY2UoYmF0Y2hMb2csIDI1MCwgeyAnbWF4V2FpdCc6IDEwMDAgfSk7XG4gKiB2YXIgc291cmNlID0gbmV3IEV2ZW50U291cmNlKCcvc3RyZWFtJyk7XG4gKiBqUXVlcnkoc291cmNlKS5vbignbWVzc2FnZScsIGRlYm91bmNlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyBkZWJvdW5jZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIGRlYm91bmNlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsYXN0QXJncyxcbiAgICAgIGxhc3RUaGlzLFxuICAgICAgbWF4V2FpdCxcbiAgICAgIHJlc3VsdCxcbiAgICAgIHRpbWVySWQsXG4gICAgICBsYXN0Q2FsbFRpbWUsXG4gICAgICBsYXN0SW52b2tlVGltZSA9IDAsXG4gICAgICBsZWFkaW5nID0gZmFsc2UsXG4gICAgICBtYXhpbmcgPSBmYWxzZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICB3YWl0ID0gdG9OdW1iZXIod2FpdCkgfHwgMDtcbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICEhb3B0aW9ucy5sZWFkaW5nO1xuICAgIG1heGluZyA9ICdtYXhXYWl0JyBpbiBvcHRpb25zO1xuICAgIG1heFdhaXQgPSBtYXhpbmcgPyBuYXRpdmVNYXgodG9OdW1iZXIob3B0aW9ucy5tYXhXYWl0KSB8fCAwLCB3YWl0KSA6IG1heFdhaXQ7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyAhIW9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuXG4gIGZ1bmN0aW9uIGludm9rZUZ1bmModGltZSkge1xuICAgIHZhciBhcmdzID0gbGFzdEFyZ3MsXG4gICAgICAgIHRoaXNBcmcgPSBsYXN0VGhpcztcblxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxlYWRpbmdFZGdlKHRpbWUpIHtcbiAgICAvLyBSZXNldCBhbnkgYG1heFdhaXRgIHRpbWVyLlxuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICAvLyBTdGFydCB0aGUgdGltZXIgZm9yIHRoZSB0cmFpbGluZyBlZGdlLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgLy8gSW52b2tlIHRoZSBsZWFkaW5nIGVkZ2UuXG4gICAgcmV0dXJuIGxlYWRpbmcgPyBpbnZva2VGdW5jKHRpbWUpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtYWluaW5nV2FpdCh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZSxcbiAgICAgICAgcmVzdWx0ID0gd2FpdCAtIHRpbWVTaW5jZUxhc3RDYWxsO1xuXG4gICAgcmV0dXJuIG1heGluZyA/IG5hdGl2ZU1pbihyZXN1bHQsIG1heFdhaXQgLSB0aW1lU2luY2VMYXN0SW52b2tlKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3VsZEludm9rZSh0aW1lKSB7XG4gICAgdmFyIHRpbWVTaW5jZUxhc3RDYWxsID0gdGltZSAtIGxhc3RDYWxsVGltZSxcbiAgICAgICAgdGltZVNpbmNlTGFzdEludm9rZSA9IHRpbWUgLSBsYXN0SW52b2tlVGltZTtcblxuICAgIC8vIEVpdGhlciB0aGlzIGlzIHRoZSBmaXJzdCBjYWxsLCBhY3Rpdml0eSBoYXMgc3RvcHBlZCBhbmQgd2UncmUgYXQgdGhlXG4gICAgLy8gdHJhaWxpbmcgZWRnZSwgdGhlIHN5c3RlbSB0aW1lIGhhcyBnb25lIGJhY2t3YXJkcyBhbmQgd2UncmUgdHJlYXRpbmdcbiAgICAvLyBpdCBhcyB0aGUgdHJhaWxpbmcgZWRnZSwgb3Igd2UndmUgaGl0IHRoZSBgbWF4V2FpdGAgbGltaXQuXG4gICAgcmV0dXJuIChsYXN0Q2FsbFRpbWUgPT09IHVuZGVmaW5lZCB8fCAodGltZVNpbmNlTGFzdENhbGwgPj0gd2FpdCkgfHxcbiAgICAgICh0aW1lU2luY2VMYXN0Q2FsbCA8IDApIHx8IChtYXhpbmcgJiYgdGltZVNpbmNlTGFzdEludm9rZSA+PSBtYXhXYWl0KSk7XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lckV4cGlyZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKTtcbiAgICBpZiAoc2hvdWxkSW52b2tlKHRpbWUpKSB7XG4gICAgICByZXR1cm4gdHJhaWxpbmdFZGdlKHRpbWUpO1xuICAgIH1cbiAgICAvLyBSZXN0YXJ0IHRoZSB0aW1lci5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHJlbWFpbmluZ1dhaXQodGltZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhaWxpbmdFZGdlKHRpbWUpIHtcbiAgICB0aW1lcklkID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gT25seSBpbnZva2UgaWYgd2UgaGF2ZSBgbGFzdEFyZ3NgIHdoaWNoIG1lYW5zIGBmdW5jYCBoYXMgYmVlblxuICAgIC8vIGRlYm91bmNlZCBhdCBsZWFzdCBvbmNlLlxuICAgIGlmICh0cmFpbGluZyAmJiBsYXN0QXJncykge1xuICAgICAgcmV0dXJuIGludm9rZUZ1bmModGltZSk7XG4gICAgfVxuICAgIGxhc3RBcmdzID0gbGFzdFRoaXMgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICBpZiAodGltZXJJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgfVxuICAgIGxhc3RJbnZva2VUaW1lID0gMDtcbiAgICBsYXN0QXJncyA9IGxhc3RDYWxsVGltZSA9IGxhc3RUaGlzID0gdGltZXJJZCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIHJldHVybiB0aW1lcklkID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiB0cmFpbGluZ0VkZ2Uobm93KCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVib3VuY2VkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCksXG4gICAgICAgIGlzSW52b2tpbmcgPSBzaG91bGRJbnZva2UodGltZSk7XG5cbiAgICBsYXN0QXJncyA9IGFyZ3VtZW50cztcbiAgICBsYXN0VGhpcyA9IHRoaXM7XG4gICAgbGFzdENhbGxUaW1lID0gdGltZTtcblxuICAgIGlmIChpc0ludm9raW5nKSB7XG4gICAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBsZWFkaW5nRWRnZShsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgICAgaWYgKG1heGluZykge1xuICAgICAgICAvLyBIYW5kbGUgaW52b2NhdGlvbnMgaW4gYSB0aWdodCBsb29wLlxuICAgICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgICAgICByZXR1cm4gaW52b2tlRnVuYyhsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGRlYm91bmNlZC5jYW5jZWwgPSBjYW5jZWw7XG4gIGRlYm91bmNlZC5mbHVzaCA9IGZsdXNoO1xuICByZXR1cm4gZGVib3VuY2VkO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB0aHJvdHRsZWQgZnVuY3Rpb24gdGhhdCBvbmx5IGludm9rZXMgYGZ1bmNgIGF0IG1vc3Qgb25jZSBwZXJcbiAqIGV2ZXJ5IGB3YWl0YCBtaWxsaXNlY29uZHMuIFRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gY29tZXMgd2l0aCBhIGBjYW5jZWxgXG4gKiBtZXRob2QgdG8gY2FuY2VsIGRlbGF5ZWQgYGZ1bmNgIGludm9jYXRpb25zIGFuZCBhIGBmbHVzaGAgbWV0aG9kIHRvXG4gKiBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS4gUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2BcbiAqIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZSBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGBcbiAqIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZCB3aXRoIHRoZSBsYXN0IGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGVcbiAqIHRocm90dGxlZCBmdW5jdGlvbi4gU3Vic2VxdWVudCBjYWxscyB0byB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHJldHVybiB0aGVcbiAqIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2AgaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzXG4gKiBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIHRocm90dGxlZCBmdW5jdGlvblxuICogaXMgaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIElmIGB3YWl0YCBpcyBgMGAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZFxuICogdW50aWwgdG8gdGhlIG5leHQgdGljaywgc2ltaWxhciB0byBgc2V0VGltZW91dGAgd2l0aCBhIHRpbWVvdXQgb2YgYDBgLlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy50aHJvdHRsZWAgYW5kIGBfLmRlYm91bmNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHRocm90dGxlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIGludm9jYXRpb25zIHRvLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHRocm90dGxlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgZXhjZXNzaXZlbHkgdXBkYXRpbmcgdGhlIHBvc2l0aW9uIHdoaWxlIHNjcm9sbGluZy5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdzY3JvbGwnLCBfLnRocm90dGxlKHVwZGF0ZVBvc2l0aW9uLCAxMDApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHJlbmV3VG9rZW5gIHdoZW4gdGhlIGNsaWNrIGV2ZW50IGlzIGZpcmVkLCBidXQgbm90IG1vcmUgdGhhbiBvbmNlIGV2ZXJ5IDUgbWludXRlcy5cbiAqIHZhciB0aHJvdHRsZWQgPSBfLnRocm90dGxlKHJlbmV3VG9rZW4sIDMwMDAwMCwgeyAndHJhaWxpbmcnOiBmYWxzZSB9KTtcbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCB0aHJvdHRsZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgdGhyb3R0bGVkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCB0aHJvdHRsZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGVhZGluZyA9IHRydWUsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICdsZWFkaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLmxlYWRpbmcgOiBsZWFkaW5nO1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cbiAgcmV0dXJuIGRlYm91bmNlKGZ1bmMsIHdhaXQsIHtcbiAgICAnbGVhZGluZyc6IGxlYWRpbmcsXG4gICAgJ21heFdhaXQnOiB3YWl0LFxuICAgICd0cmFpbGluZyc6IHRyYWlsaW5nXG4gIH0pO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIG51bWJlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIG51bWJlci5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b051bWJlcigzLjIpO1xuICogLy8gPT4gMy4yXG4gKlxuICogXy50b051bWJlcihOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IDVlLTMyNFxuICpcbiAqIF8udG9OdW1iZXIoSW5maW5pdHkpO1xuICogLy8gPT4gSW5maW5pdHlcbiAqXG4gKiBfLnRvTnVtYmVyKCczLjInKTtcbiAqIC8vID0+IDMuMlxuICovXG5mdW5jdGlvbiB0b051bWJlcih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gTkFOO1xuICB9XG4gIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICB2YXIgb3RoZXIgPSB0eXBlb2YgdmFsdWUudmFsdWVPZiA9PSAnZnVuY3Rpb24nID8gdmFsdWUudmFsdWVPZigpIDogdmFsdWU7XG4gICAgdmFsdWUgPSBpc09iamVjdChvdGhlcikgPyAob3RoZXIgKyAnJykgOiBvdGhlcjtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiArdmFsdWU7XG4gIH1cbiAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKHJlVHJpbSwgJycpO1xuICB2YXIgaXNCaW5hcnkgPSByZUlzQmluYXJ5LnRlc3QodmFsdWUpO1xuICByZXR1cm4gKGlzQmluYXJ5IHx8IHJlSXNPY3RhbC50ZXN0KHZhbHVlKSlcbiAgICA/IGZyZWVQYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgaXNCaW5hcnkgPyAyIDogOClcbiAgICA6IChyZUlzQmFkSGV4LnRlc3QodmFsdWUpID8gTkFOIDogK3ZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aHJvdHRsZTtcbiIsInZhciB3aWxkY2FyZCA9IHJlcXVpcmUoJ3dpbGRjYXJkJyk7XG52YXIgcmVNaW1lUGFydFNwbGl0ID0gL1tcXC9cXCtcXC5dLztcblxuLyoqXG4gICMgbWltZS1tYXRjaFxuXG4gIEEgc2ltcGxlIGZ1bmN0aW9uIHRvIGNoZWNrZXIgd2hldGhlciBhIHRhcmdldCBtaW1lIHR5cGUgbWF0Y2hlcyBhIG1pbWUtdHlwZVxuICBwYXR0ZXJuIChlLmcuIGltYWdlL2pwZWcgbWF0Y2hlcyBpbWFnZS9qcGVnIE9SIGltYWdlLyopLlxuXG4gICMjIEV4YW1wbGUgVXNhZ2VcblxuICA8PDwgZXhhbXBsZS5qc1xuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0LCBwYXR0ZXJuKSB7XG4gIGZ1bmN0aW9uIHRlc3QocGF0dGVybikge1xuICAgIHZhciByZXN1bHQgPSB3aWxkY2FyZChwYXR0ZXJuLCB0YXJnZXQsIHJlTWltZVBhcnRTcGxpdCk7XG5cbiAgICAvLyBlbnN1cmUgdGhhdCB3ZSBoYXZlIGEgdmFsaWQgbWltZSB0eXBlIChzaG91bGQgaGF2ZSB0d28gcGFydHMpXG4gICAgcmV0dXJuIHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoID49IDI7XG4gIH1cblxuICByZXR1cm4gcGF0dGVybiA/IHRlc3QocGF0dGVybi5zcGxpdCgnOycpWzBdKSA6IHRlc3Q7XG59O1xuIiwiLyoqXG4qIENyZWF0ZSBhbiBldmVudCBlbWl0dGVyIHdpdGggbmFtZXNwYWNlc1xuKiBAbmFtZSBjcmVhdGVOYW1lc3BhY2VFbWl0dGVyXG4qIEBleGFtcGxlXG4qIHZhciBlbWl0dGVyID0gcmVxdWlyZSgnLi9pbmRleCcpKClcbipcbiogZW1pdHRlci5vbignKicsIGZ1bmN0aW9uICgpIHtcbiogICBjb25zb2xlLmxvZygnYWxsIGV2ZW50cyBlbWl0dGVkJywgdGhpcy5ldmVudClcbiogfSlcbipcbiogZW1pdHRlci5vbignZXhhbXBsZScsIGZ1bmN0aW9uICgpIHtcbiogICBjb25zb2xlLmxvZygnZXhhbXBsZSBldmVudCBlbWl0dGVkJylcbiogfSlcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZU5hbWVzcGFjZUVtaXR0ZXIgKCkge1xuICB2YXIgZW1pdHRlciA9IHt9XG4gIHZhciBfZm5zID0gZW1pdHRlci5fZm5zID0ge31cblxuICAvKipcbiAgKiBFbWl0IGFuIGV2ZW50LiBPcHRpb25hbGx5IG5hbWVzcGFjZSB0aGUgZXZlbnQuIEhhbmRsZXJzIGFyZSBmaXJlZCBpbiB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSB3ZXJlIGFkZGVkIHdpdGggZXhhY3QgbWF0Y2hlcyB0YWtpbmcgcHJlY2VkZW5jZS4gU2VwYXJhdGUgdGhlIG5hbWVzcGFjZSBhbmQgZXZlbnQgd2l0aCBhIGA6YFxuICAqIEBuYW1lIGVtaXRcbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQg4oCTIHRoZSBuYW1lIG9mIHRoZSBldmVudCwgd2l0aCBvcHRpb25hbCBuYW1lc3BhY2VcbiAgKiBAcGFyYW0gey4uLip9IGRhdGEg4oCTIHVwIHRvIDYgYXJndW1lbnRzIHRoYXQgYXJlIHBhc3NlZCB0byB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgKiBAZXhhbXBsZVxuICAqIGVtaXR0ZXIuZW1pdCgnZXhhbXBsZScpXG4gICogZW1pdHRlci5lbWl0KCdkZW1vOnRlc3QnKVxuICAqIGVtaXR0ZXIuZW1pdCgnZGF0YScsIHsgZXhhbXBsZTogdHJ1ZX0sICdhIHN0cmluZycsIDEpXG4gICovXG4gIGVtaXR0ZXIuZW1pdCA9IGZ1bmN0aW9uIGVtaXQgKGV2ZW50LCBhcmcxLCBhcmcyLCBhcmczLCBhcmc0LCBhcmc1LCBhcmc2KSB7XG4gICAgdmFyIHRvRW1pdCA9IGdldExpc3RlbmVycyhldmVudClcblxuICAgIGlmICh0b0VtaXQubGVuZ3RoKSB7XG4gICAgICBlbWl0QWxsKGV2ZW50LCB0b0VtaXQsIFthcmcxLCBhcmcyLCBhcmczLCBhcmc0LCBhcmc1LCBhcmc2XSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBDcmVhdGUgZW4gZXZlbnQgbGlzdGVuZXIuXG4gICogQG5hbWUgb25cbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5vbignZXhhbXBsZScsIGZ1bmN0aW9uICgpIHt9KVxuICAqIGVtaXR0ZXIub24oJ2RlbW8nLCBmdW5jdGlvbiAoKSB7fSlcbiAgKi9cbiAgZW1pdHRlci5vbiA9IGZ1bmN0aW9uIG9uIChldmVudCwgZm4pIHtcbiAgICBpZiAoIV9mbnNbZXZlbnRdKSB7XG4gICAgICBfZm5zW2V2ZW50XSA9IFtdXG4gICAgfVxuXG4gICAgX2Zuc1tldmVudF0ucHVzaChmbilcbiAgfVxuXG4gIC8qKlxuICAqIENyZWF0ZSBlbiBldmVudCBsaXN0ZW5lciB0aGF0IGZpcmVzIG9uY2UuXG4gICogQG5hbWUgb25jZVxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICogQGV4YW1wbGVcbiAgKiBlbWl0dGVyLm9uY2UoJ2V4YW1wbGUnLCBmdW5jdGlvbiAoKSB7fSlcbiAgKiBlbWl0dGVyLm9uY2UoJ2RlbW8nLCBmdW5jdGlvbiAoKSB7fSlcbiAgKi9cbiAgZW1pdHRlci5vbmNlID0gZnVuY3Rpb24gb25jZSAoZXZlbnQsIGZuKSB7XG4gICAgZnVuY3Rpb24gb25lICgpIHtcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgIGVtaXR0ZXIub2ZmKGV2ZW50LCBvbmUpXG4gICAgfVxuICAgIHRoaXMub24oZXZlbnQsIG9uZSlcbiAgfVxuXG4gIC8qKlxuICAqIFN0b3AgbGlzdGVuaW5nIHRvIGFuIGV2ZW50LiBTdG9wIGFsbCBsaXN0ZW5lcnMgb24gYW4gZXZlbnQgYnkgb25seSBwYXNzaW5nIHRoZSBldmVudCBuYW1lLiBTdG9wIGEgc2luZ2xlIGxpc3RlbmVyIGJ5IHBhc3NpbmcgdGhhdCBldmVudCBoYW5kbGVyIGFzIGEgY2FsbGJhY2suXG4gICogWW91IG11c3QgYmUgZXhwbGljaXQgYWJvdXQgd2hhdCB3aWxsIGJlIHVuc3Vic2NyaWJlZDogYGVtaXR0ZXIub2ZmKCdkZW1vJylgIHdpbGwgdW5zdWJzY3JpYmUgYW4gYGVtaXR0ZXIub24oJ2RlbW8nKWAgbGlzdGVuZXIsXG4gICogYGVtaXR0ZXIub2ZmKCdkZW1vOmV4YW1wbGUnKWAgd2lsbCB1bnN1YnNjcmliZSBhbiBgZW1pdHRlci5vbignZGVtbzpleGFtcGxlJylgIGxpc3RlbmVyXG4gICogQG5hbWUgb2ZmXG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXSDigJMgdGhlIHNwZWNpZmljIGhhbmRsZXJcbiAgKiBAZXhhbXBsZVxuICAqIGVtaXR0ZXIub2ZmKCdleGFtcGxlJylcbiAgKiBlbWl0dGVyLm9mZignZGVtbycsIGZ1bmN0aW9uICgpIHt9KVxuICAqL1xuICBlbWl0dGVyLm9mZiA9IGZ1bmN0aW9uIG9mZiAoZXZlbnQsIGZuKSB7XG4gICAgdmFyIGtlZXAgPSBbXVxuXG4gICAgaWYgKGV2ZW50ICYmIGZuKSB7XG4gICAgICB2YXIgZm5zID0gdGhpcy5fZm5zW2V2ZW50XVxuICAgICAgdmFyIGkgPSAwXG4gICAgICB2YXIgbCA9IGZucyA/IGZucy5sZW5ndGggOiAwXG5cbiAgICAgIGZvciAoaTsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoZm5zW2ldICE9PSBmbikge1xuICAgICAgICAgIGtlZXAucHVzaChmbnNbaV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBrZWVwLmxlbmd0aCA/IHRoaXMuX2Zuc1tldmVudF0gPSBrZWVwIDogZGVsZXRlIHRoaXMuX2Zuc1tldmVudF1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExpc3RlbmVycyAoZSkge1xuICAgIHZhciBvdXQgPSBfZm5zW2VdID8gX2Zuc1tlXSA6IFtdXG4gICAgdmFyIGlkeCA9IGUuaW5kZXhPZignOicpXG4gICAgdmFyIGFyZ3MgPSAoaWR4ID09PSAtMSkgPyBbZV0gOiBbZS5zdWJzdHJpbmcoMCwgaWR4KSwgZS5zdWJzdHJpbmcoaWR4ICsgMSldXG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKF9mbnMpXG4gICAgdmFyIGkgPSAwXG4gICAgdmFyIGwgPSBrZXlzLmxlbmd0aFxuXG4gICAgZm9yIChpOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgaWYgKGtleSA9PT0gJyonKSB7XG4gICAgICAgIG91dCA9IG91dC5jb25jYXQoX2Zuc1trZXldKVxuICAgICAgfVxuXG4gICAgICBpZiAoYXJncy5sZW5ndGggPT09IDIgJiYgYXJnc1swXSA9PT0ga2V5KSB7XG4gICAgICAgIG91dCA9IG91dC5jb25jYXQoX2Zuc1trZXldKVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvdXRcbiAgfVxuXG4gIGZ1bmN0aW9uIGVtaXRBbGwgKGUsIGZucywgYXJncykge1xuICAgIHZhciBpID0gMFxuICAgIHZhciBsID0gZm5zLmxlbmd0aFxuXG4gICAgZm9yIChpOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoIWZuc1tpXSkgYnJlYWtcbiAgICAgIGZuc1tpXS5ldmVudCA9IGVcbiAgICAgIGZuc1tpXS5hcHBseShmbnNbaV0sIGFyZ3MpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVtaXR0ZXJcbn1cbiIsIiFmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgZnVuY3Rpb24gVk5vZGUoKSB7fVxuICAgIGZ1bmN0aW9uIGgobm9kZU5hbWUsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdmFyIGxhc3RTaW1wbGUsIGNoaWxkLCBzaW1wbGUsIGksIGNoaWxkcmVuID0gRU1QVFlfQ0hJTERSRU47XG4gICAgICAgIGZvciAoaSA9IGFyZ3VtZW50cy5sZW5ndGg7IGktLSA+IDI7ICkgc3RhY2sucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgICBpZiAoYXR0cmlidXRlcyAmJiBudWxsICE9IGF0dHJpYnV0ZXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGlmICghc3RhY2subGVuZ3RoKSBzdGFjay5wdXNoKGF0dHJpYnV0ZXMuY2hpbGRyZW4pO1xuICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMuY2hpbGRyZW47XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHN0YWNrLmxlbmd0aCkgaWYgKChjaGlsZCA9IHN0YWNrLnBvcCgpKSAmJiB2b2lkIDAgIT09IGNoaWxkLnBvcCkgZm9yIChpID0gY2hpbGQubGVuZ3RoOyBpLS07ICkgc3RhY2sucHVzaChjaGlsZFtpXSk7IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCdib29sZWFuJyA9PSB0eXBlb2YgY2hpbGQpIGNoaWxkID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChzaW1wbGUgPSAnZnVuY3Rpb24nICE9IHR5cGVvZiBub2RlTmFtZSkgaWYgKG51bGwgPT0gY2hpbGQpIGNoaWxkID0gJyc7IGVsc2UgaWYgKCdudW1iZXInID09IHR5cGVvZiBjaGlsZCkgY2hpbGQgPSBTdHJpbmcoY2hpbGQpOyBlbHNlIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgY2hpbGQpIHNpbXBsZSA9ICExO1xuICAgICAgICAgICAgaWYgKHNpbXBsZSAmJiBsYXN0U2ltcGxlKSBjaGlsZHJlbltjaGlsZHJlbi5sZW5ndGggLSAxXSArPSBjaGlsZDsgZWxzZSBpZiAoY2hpbGRyZW4gPT09IEVNUFRZX0NISUxEUkVOKSBjaGlsZHJlbiA9IFsgY2hpbGQgXTsgZWxzZSBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgIGxhc3RTaW1wbGUgPSBzaW1wbGU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHAgPSBuZXcgVk5vZGUoKTtcbiAgICAgICAgcC5ub2RlTmFtZSA9IG5vZGVOYW1lO1xuICAgICAgICBwLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgIHAuYXR0cmlidXRlcyA9IG51bGwgPT0gYXR0cmlidXRlcyA/IHZvaWQgMCA6IGF0dHJpYnV0ZXM7XG4gICAgICAgIHAua2V5ID0gbnVsbCA9PSBhdHRyaWJ1dGVzID8gdm9pZCAwIDogYXR0cmlidXRlcy5rZXk7XG4gICAgICAgIGlmICh2b2lkIDAgIT09IG9wdGlvbnMudm5vZGUpIG9wdGlvbnMudm5vZGUocCk7XG4gICAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBmdW5jdGlvbiBleHRlbmQob2JqLCBwcm9wcykge1xuICAgICAgICBmb3IgKHZhciBpIGluIHByb3BzKSBvYmpbaV0gPSBwcm9wc1tpXTtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2xvbmVFbGVtZW50KHZub2RlLCBwcm9wcykge1xuICAgICAgICByZXR1cm4gaCh2bm9kZS5ub2RlTmFtZSwgZXh0ZW5kKGV4dGVuZCh7fSwgdm5vZGUuYXR0cmlidXRlcyksIHByb3BzKSwgYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMikgOiB2bm9kZS5jaGlsZHJlbik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVucXVldWVSZW5kZXIoY29tcG9uZW50KSB7XG4gICAgICAgIGlmICghY29tcG9uZW50Ll9fZCAmJiAoY29tcG9uZW50Ll9fZCA9ICEwKSAmJiAxID09IGl0ZW1zLnB1c2goY29tcG9uZW50KSkgKG9wdGlvbnMuZGVib3VuY2VSZW5kZXJpbmcgfHwgZGVmZXIpKHJlcmVuZGVyKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVyZW5kZXIoKSB7XG4gICAgICAgIHZhciBwLCBsaXN0ID0gaXRlbXM7XG4gICAgICAgIGl0ZW1zID0gW107XG4gICAgICAgIHdoaWxlIChwID0gbGlzdC5wb3AoKSkgaWYgKHAuX19kKSByZW5kZXJDb21wb25lbnQocCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzU2FtZU5vZGVUeXBlKG5vZGUsIHZub2RlLCBoeWRyYXRpbmcpIHtcbiAgICAgICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2bm9kZSB8fCAnbnVtYmVyJyA9PSB0eXBlb2Ygdm5vZGUpIHJldHVybiB2b2lkIDAgIT09IG5vZGUuc3BsaXRUZXh0O1xuICAgICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHZub2RlLm5vZGVOYW1lKSByZXR1cm4gIW5vZGUuX2NvbXBvbmVudENvbnN0cnVjdG9yICYmIGlzTmFtZWROb2RlKG5vZGUsIHZub2RlLm5vZGVOYW1lKTsgZWxzZSByZXR1cm4gaHlkcmF0aW5nIHx8IG5vZGUuX2NvbXBvbmVudENvbnN0cnVjdG9yID09PSB2bm9kZS5ub2RlTmFtZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNOYW1lZE5vZGUobm9kZSwgbm9kZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuX19uID09PSBub2RlTmFtZSB8fCBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09IG5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldE5vZGVQcm9wcyh2bm9kZSkge1xuICAgICAgICB2YXIgcHJvcHMgPSBleHRlbmQoe30sIHZub2RlLmF0dHJpYnV0ZXMpO1xuICAgICAgICBwcm9wcy5jaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuO1xuICAgICAgICB2YXIgZGVmYXVsdFByb3BzID0gdm5vZGUubm9kZU5hbWUuZGVmYXVsdFByb3BzO1xuICAgICAgICBpZiAodm9pZCAwICE9PSBkZWZhdWx0UHJvcHMpIGZvciAodmFyIGkgaW4gZGVmYXVsdFByb3BzKSBpZiAodm9pZCAwID09PSBwcm9wc1tpXSkgcHJvcHNbaV0gPSBkZWZhdWx0UHJvcHNbaV07XG4gICAgICAgIHJldHVybiBwcm9wcztcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlTm9kZShub2RlTmFtZSwgaXNTdmcpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBpc1N2ZyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCBub2RlTmFtZSkgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGVOYW1lKTtcbiAgICAgICAgbm9kZS5fX24gPSBub2RlTmFtZTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbW92ZU5vZGUobm9kZSkge1xuICAgICAgICB2YXIgcGFyZW50Tm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgaWYgKHBhcmVudE5vZGUpIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldEFjY2Vzc29yKG5vZGUsIG5hbWUsIG9sZCwgdmFsdWUsIGlzU3ZnKSB7XG4gICAgICAgIGlmICgnY2xhc3NOYW1lJyA9PT0gbmFtZSkgbmFtZSA9ICdjbGFzcyc7XG4gICAgICAgIGlmICgna2V5JyA9PT0gbmFtZSkgOyBlbHNlIGlmICgncmVmJyA9PT0gbmFtZSkge1xuICAgICAgICAgICAgaWYgKG9sZCkgb2xkKG51bGwpO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB2YWx1ZShub2RlKTtcbiAgICAgICAgfSBlbHNlIGlmICgnY2xhc3MnID09PSBuYW1lICYmICFpc1N2Zykgbm9kZS5jbGFzc05hbWUgPSB2YWx1ZSB8fCAnJzsgZWxzZSBpZiAoJ3N0eWxlJyA9PT0gbmFtZSkge1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSB8fCAnc3RyaW5nJyA9PSB0eXBlb2YgdmFsdWUgfHwgJ3N0cmluZycgPT0gdHlwZW9mIG9sZCkgbm9kZS5zdHlsZS5jc3NUZXh0ID0gdmFsdWUgfHwgJyc7XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgJ29iamVjdCcgPT0gdHlwZW9mIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBvbGQpIGZvciAodmFyIGkgaW4gb2xkKSBpZiAoIShpIGluIHZhbHVlKSkgbm9kZS5zdHlsZVtpXSA9ICcnO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdmFsdWUpIG5vZGUuc3R5bGVbaV0gPSAnbnVtYmVyJyA9PSB0eXBlb2YgdmFsdWVbaV0gJiYgITEgPT09IElTX05PTl9ESU1FTlNJT05BTC50ZXN0KGkpID8gdmFsdWVbaV0gKyAncHgnIDogdmFsdWVbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoJ2Rhbmdlcm91c2x5U2V0SW5uZXJIVE1MJyA9PT0gbmFtZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKSBub2RlLmlubmVySFRNTCA9IHZhbHVlLl9faHRtbCB8fCAnJztcbiAgICAgICAgfSBlbHNlIGlmICgnbycgPT0gbmFtZVswXSAmJiAnbicgPT0gbmFtZVsxXSkge1xuICAgICAgICAgICAgdmFyIHVzZUNhcHR1cmUgPSBuYW1lICE9PSAobmFtZSA9IG5hbWUucmVwbGFjZSgvQ2FwdHVyZSQvLCAnJykpO1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKS5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9sZCkgbm9kZS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGV2ZW50UHJveHksIHVzZUNhcHR1cmUpO1xuICAgICAgICAgICAgfSBlbHNlIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBldmVudFByb3h5LCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICAgIChub2RlLl9fbCB8fCAobm9kZS5fX2wgPSB7fSkpW25hbWVdID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoJ2xpc3QnICE9PSBuYW1lICYmICd0eXBlJyAhPT0gbmFtZSAmJiAhaXNTdmcgJiYgbmFtZSBpbiBub2RlKSB7XG4gICAgICAgICAgICBzZXRQcm9wZXJ0eShub2RlLCBuYW1lLCBudWxsID09IHZhbHVlID8gJycgOiB2YWx1ZSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSB8fCAhMSA9PT0gdmFsdWUpIG5vZGUucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIG5zID0gaXNTdmcgJiYgbmFtZSAhPT0gKG5hbWUgPSBuYW1lLnJlcGxhY2UoL154bGluazo/LywgJycpKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlIHx8ICExID09PSB2YWx1ZSkgaWYgKG5zKSBub2RlLnJlbW92ZUF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgbmFtZS50b0xvd2VyQ2FzZSgpKTsgZWxzZSBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTsgZWxzZSBpZiAoJ2Z1bmN0aW9uJyAhPSB0eXBlb2YgdmFsdWUpIGlmIChucykgbm9kZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIG5hbWUudG9Mb3dlckNhc2UoKSwgdmFsdWUpOyBlbHNlIG5vZGUuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRQcm9wZXJ0eShub2RlLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbm9kZVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cbiAgICBmdW5jdGlvbiBldmVudFByb3h5KGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19sW2UudHlwZV0ob3B0aW9ucy5ldmVudCAmJiBvcHRpb25zLmV2ZW50KGUpIHx8IGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmbHVzaE1vdW50cygpIHtcbiAgICAgICAgdmFyIGM7XG4gICAgICAgIHdoaWxlIChjID0gbW91bnRzLnBvcCgpKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hZnRlck1vdW50KSBvcHRpb25zLmFmdGVyTW91bnQoYyk7XG4gICAgICAgICAgICBpZiAoYy5jb21wb25lbnREaWRNb3VudCkgYy5jb21wb25lbnREaWRNb3VudCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIHBhcmVudCwgY29tcG9uZW50Um9vdCkge1xuICAgICAgICBpZiAoIWRpZmZMZXZlbCsrKSB7XG4gICAgICAgICAgICBpc1N2Z01vZGUgPSBudWxsICE9IHBhcmVudCAmJiB2b2lkIDAgIT09IHBhcmVudC5vd25lclNWR0VsZW1lbnQ7XG4gICAgICAgICAgICBoeWRyYXRpbmcgPSBudWxsICE9IGRvbSAmJiAhKCdfX3ByZWFjdGF0dHJfJyBpbiBkb20pO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXQgPSBpZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCwgY29tcG9uZW50Um9vdCk7XG4gICAgICAgIGlmIChwYXJlbnQgJiYgcmV0LnBhcmVudE5vZGUgIT09IHBhcmVudCkgcGFyZW50LmFwcGVuZENoaWxkKHJldCk7XG4gICAgICAgIGlmICghLS1kaWZmTGV2ZWwpIHtcbiAgICAgICAgICAgIGh5ZHJhdGluZyA9ICExO1xuICAgICAgICAgICAgaWYgKCFjb21wb25lbnRSb290KSBmbHVzaE1vdW50cygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsLCBjb21wb25lbnRSb290KSB7XG4gICAgICAgIHZhciBvdXQgPSBkb20sIHByZXZTdmdNb2RlID0gaXNTdmdNb2RlO1xuICAgICAgICBpZiAobnVsbCA9PSB2bm9kZSB8fCAnYm9vbGVhbicgPT0gdHlwZW9mIHZub2RlKSB2bm9kZSA9ICcnO1xuICAgICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHZub2RlIHx8ICdudW1iZXInID09IHR5cGVvZiB2bm9kZSkge1xuICAgICAgICAgICAgaWYgKGRvbSAmJiB2b2lkIDAgIT09IGRvbS5zcGxpdFRleHQgJiYgZG9tLnBhcmVudE5vZGUgJiYgKCFkb20uX2NvbXBvbmVudCB8fCBjb21wb25lbnRSb290KSkge1xuICAgICAgICAgICAgICAgIGlmIChkb20ubm9kZVZhbHVlICE9IHZub2RlKSBkb20ubm9kZVZhbHVlID0gdm5vZGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb20ucGFyZW50Tm9kZSkgZG9tLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG91dCwgZG9tKTtcbiAgICAgICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoZG9tLCAhMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0Ll9fcHJlYWN0YXR0cl8gPSAhMDtcbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHZub2RlTmFtZSA9IHZub2RlLm5vZGVOYW1lO1xuICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygdm5vZGVOYW1lKSByZXR1cm4gYnVpbGRDb21wb25lbnRGcm9tVk5vZGUoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICBpc1N2Z01vZGUgPSAnc3ZnJyA9PT0gdm5vZGVOYW1lID8gITAgOiAnZm9yZWlnbk9iamVjdCcgPT09IHZub2RlTmFtZSA/ICExIDogaXNTdmdNb2RlO1xuICAgICAgICB2bm9kZU5hbWUgPSBTdHJpbmcodm5vZGVOYW1lKTtcbiAgICAgICAgaWYgKCFkb20gfHwgIWlzTmFtZWROb2RlKGRvbSwgdm5vZGVOYW1lKSkge1xuICAgICAgICAgICAgb3V0ID0gY3JlYXRlTm9kZSh2bm9kZU5hbWUsIGlzU3ZnTW9kZSk7XG4gICAgICAgICAgICBpZiAoZG9tKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGRvbS5maXJzdENoaWxkKSBvdXQuYXBwZW5kQ2hpbGQoZG9tLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgIGlmIChkb20ucGFyZW50Tm9kZSkgZG9tLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG91dCwgZG9tKTtcbiAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShkb20sICEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZmMgPSBvdXQuZmlyc3RDaGlsZCwgcHJvcHMgPSBvdXQuX19wcmVhY3RhdHRyXywgdmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChudWxsID09IHByb3BzKSB7XG4gICAgICAgICAgICBwcm9wcyA9IG91dC5fX3ByZWFjdGF0dHJfID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBhID0gb3V0LmF0dHJpYnV0ZXMsIGkgPSBhLmxlbmd0aDsgaS0tOyApIHByb3BzW2FbaV0ubmFtZV0gPSBhW2ldLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaHlkcmF0aW5nICYmIHZjaGlsZHJlbiAmJiAxID09PSB2Y2hpbGRyZW4ubGVuZ3RoICYmICdzdHJpbmcnID09IHR5cGVvZiB2Y2hpbGRyZW5bMF0gJiYgbnVsbCAhPSBmYyAmJiB2b2lkIDAgIT09IGZjLnNwbGl0VGV4dCAmJiBudWxsID09IGZjLm5leHRTaWJsaW5nKSB7XG4gICAgICAgICAgICBpZiAoZmMubm9kZVZhbHVlICE9IHZjaGlsZHJlblswXSkgZmMubm9kZVZhbHVlID0gdmNoaWxkcmVuWzBdO1xuICAgICAgICB9IGVsc2UgaWYgKHZjaGlsZHJlbiAmJiB2Y2hpbGRyZW4ubGVuZ3RoIHx8IG51bGwgIT0gZmMpIGlubmVyRGlmZk5vZGUob3V0LCB2Y2hpbGRyZW4sIGNvbnRleHQsIG1vdW50QWxsLCBoeWRyYXRpbmcgfHwgbnVsbCAhPSBwcm9wcy5kYW5nZXJvdXNseVNldElubmVySFRNTCk7XG4gICAgICAgIGRpZmZBdHRyaWJ1dGVzKG91dCwgdm5vZGUuYXR0cmlidXRlcywgcHJvcHMpO1xuICAgICAgICBpc1N2Z01vZGUgPSBwcmV2U3ZnTW9kZTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW5uZXJEaWZmTm9kZShkb20sIHZjaGlsZHJlbiwgY29udGV4dCwgbW91bnRBbGwsIGlzSHlkcmF0aW5nKSB7XG4gICAgICAgIHZhciBqLCBjLCBmLCB2Y2hpbGQsIGNoaWxkLCBvcmlnaW5hbENoaWxkcmVuID0gZG9tLmNoaWxkTm9kZXMsIGNoaWxkcmVuID0gW10sIGtleWVkID0ge30sIGtleWVkTGVuID0gMCwgbWluID0gMCwgbGVuID0gb3JpZ2luYWxDaGlsZHJlbi5sZW5ndGgsIGNoaWxkcmVuTGVuID0gMCwgdmxlbiA9IHZjaGlsZHJlbiA/IHZjaGlsZHJlbi5sZW5ndGggOiAwO1xuICAgICAgICBpZiAoMCAhPT0gbGVuKSBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgX2NoaWxkID0gb3JpZ2luYWxDaGlsZHJlbltpXSwgcHJvcHMgPSBfY2hpbGQuX19wcmVhY3RhdHRyXywga2V5ID0gdmxlbiAmJiBwcm9wcyA/IF9jaGlsZC5fY29tcG9uZW50ID8gX2NoaWxkLl9jb21wb25lbnQuX19rIDogcHJvcHMua2V5IDogbnVsbDtcbiAgICAgICAgICAgIGlmIChudWxsICE9IGtleSkge1xuICAgICAgICAgICAgICAgIGtleWVkTGVuKys7XG4gICAgICAgICAgICAgICAga2V5ZWRba2V5XSA9IF9jaGlsZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcHMgfHwgKHZvaWQgMCAhPT0gX2NoaWxkLnNwbGl0VGV4dCA/IGlzSHlkcmF0aW5nID8gX2NoaWxkLm5vZGVWYWx1ZS50cmltKCkgOiAhMCA6IGlzSHlkcmF0aW5nKSkgY2hpbGRyZW5bY2hpbGRyZW5MZW4rK10gPSBfY2hpbGQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKDAgIT09IHZsZW4pIGZvciAodmFyIGkgPSAwOyBpIDwgdmxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2Y2hpbGQgPSB2Y2hpbGRyZW5baV07XG4gICAgICAgICAgICBjaGlsZCA9IG51bGw7XG4gICAgICAgICAgICB2YXIga2V5ID0gdmNoaWxkLmtleTtcbiAgICAgICAgICAgIGlmIChudWxsICE9IGtleSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXllZExlbiAmJiB2b2lkIDAgIT09IGtleWVkW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQgPSBrZXllZFtrZXldO1xuICAgICAgICAgICAgICAgICAgICBrZXllZFtrZXldID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICBrZXllZExlbi0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNoaWxkICYmIG1pbiA8IGNoaWxkcmVuTGVuKSBmb3IgKGogPSBtaW47IGogPCBjaGlsZHJlbkxlbjsgaisrKSBpZiAodm9pZCAwICE9PSBjaGlsZHJlbltqXSAmJiBpc1NhbWVOb2RlVHlwZShjID0gY2hpbGRyZW5bal0sIHZjaGlsZCwgaXNIeWRyYXRpbmcpKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQgPSBjO1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2pdID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSBjaGlsZHJlbkxlbiAtIDEpIGNoaWxkcmVuTGVuLS07XG4gICAgICAgICAgICAgICAgaWYgKGogPT09IG1pbikgbWluKys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGlsZCA9IGlkaWZmKGNoaWxkLCB2Y2hpbGQsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgICAgIGYgPSBvcmlnaW5hbENoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKGNoaWxkICYmIGNoaWxkICE9PSBkb20gJiYgY2hpbGQgIT09IGYpIGlmIChudWxsID09IGYpIGRvbS5hcHBlbmRDaGlsZChjaGlsZCk7IGVsc2UgaWYgKGNoaWxkID09PSBmLm5leHRTaWJsaW5nKSByZW1vdmVOb2RlKGYpOyBlbHNlIGRvbS5pbnNlcnRCZWZvcmUoY2hpbGQsIGYpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXllZExlbikgZm9yICh2YXIgaSBpbiBrZXllZCkgaWYgKHZvaWQgMCAhPT0ga2V5ZWRbaV0pIHJlY29sbGVjdE5vZGVUcmVlKGtleWVkW2ldLCAhMSk7XG4gICAgICAgIHdoaWxlIChtaW4gPD0gY2hpbGRyZW5MZW4pIGlmICh2b2lkIDAgIT09IChjaGlsZCA9IGNoaWxkcmVuW2NoaWxkcmVuTGVuLS1dKSkgcmVjb2xsZWN0Tm9kZVRyZWUoY2hpbGQsICExKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVjb2xsZWN0Tm9kZVRyZWUobm9kZSwgdW5tb3VudE9ubHkpIHtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IG5vZGUuX2NvbXBvbmVudDtcbiAgICAgICAgaWYgKGNvbXBvbmVudCkgdW5tb3VudENvbXBvbmVudChjb21wb25lbnQpOyBlbHNlIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IG5vZGUuX19wcmVhY3RhdHRyXyAmJiBub2RlLl9fcHJlYWN0YXR0cl8ucmVmKSBub2RlLl9fcHJlYWN0YXR0cl8ucmVmKG51bGwpO1xuICAgICAgICAgICAgaWYgKCExID09PSB1bm1vdW50T25seSB8fCBudWxsID09IG5vZGUuX19wcmVhY3RhdHRyXykgcmVtb3ZlTm9kZShub2RlKTtcbiAgICAgICAgICAgIHJlbW92ZUNoaWxkcmVuKG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbW92ZUNoaWxkcmVuKG5vZGUpIHtcbiAgICAgICAgbm9kZSA9IG5vZGUubGFzdENoaWxkO1xuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBub2RlLnByZXZpb3VzU2libGluZztcbiAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKG5vZGUsICEwKTtcbiAgICAgICAgICAgIG5vZGUgPSBuZXh0O1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRpZmZBdHRyaWJ1dGVzKGRvbSwgYXR0cnMsIG9sZCkge1xuICAgICAgICB2YXIgbmFtZTtcbiAgICAgICAgZm9yIChuYW1lIGluIG9sZCkgaWYgKCghYXR0cnMgfHwgbnVsbCA9PSBhdHRyc1tuYW1lXSkgJiYgbnVsbCAhPSBvbGRbbmFtZV0pIHNldEFjY2Vzc29yKGRvbSwgbmFtZSwgb2xkW25hbWVdLCBvbGRbbmFtZV0gPSB2b2lkIDAsIGlzU3ZnTW9kZSk7XG4gICAgICAgIGZvciAobmFtZSBpbiBhdHRycykgaWYgKCEoJ2NoaWxkcmVuJyA9PT0gbmFtZSB8fCAnaW5uZXJIVE1MJyA9PT0gbmFtZSB8fCBuYW1lIGluIG9sZCAmJiBhdHRyc1tuYW1lXSA9PT0gKCd2YWx1ZScgPT09IG5hbWUgfHwgJ2NoZWNrZWQnID09PSBuYW1lID8gZG9tW25hbWVdIDogb2xkW25hbWVdKSkpIHNldEFjY2Vzc29yKGRvbSwgbmFtZSwgb2xkW25hbWVdLCBvbGRbbmFtZV0gPSBhdHRyc1tuYW1lXSwgaXNTdmdNb2RlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29sbGVjdENvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IubmFtZTtcbiAgICAgICAgKGNvbXBvbmVudHNbbmFtZV0gfHwgKGNvbXBvbmVudHNbbmFtZV0gPSBbXSkpLnB1c2goY29tcG9uZW50KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KEN0b3IsIHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBpbnN0LCBsaXN0ID0gY29tcG9uZW50c1tDdG9yLm5hbWVdO1xuICAgICAgICBpZiAoQ3Rvci5wcm90b3R5cGUgJiYgQ3Rvci5wcm90b3R5cGUucmVuZGVyKSB7XG4gICAgICAgICAgICBpbnN0ID0gbmV3IEN0b3IocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgQ29tcG9uZW50LmNhbGwoaW5zdCwgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5zdCA9IG5ldyBDb21wb25lbnQocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgaW5zdC5jb25zdHJ1Y3RvciA9IEN0b3I7XG4gICAgICAgICAgICBpbnN0LnJlbmRlciA9IGRvUmVuZGVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0KSBmb3IgKHZhciBpID0gbGlzdC5sZW5ndGg7IGktLTsgKSBpZiAobGlzdFtpXS5jb25zdHJ1Y3RvciA9PT0gQ3Rvcikge1xuICAgICAgICAgICAgaW5zdC5fX2IgPSBsaXN0W2ldLl9fYjtcbiAgICAgICAgICAgIGxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3Q7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvUmVuZGVyKHByb3BzLCBzdGF0ZSwgY29udGV4dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldENvbXBvbmVudFByb3BzKGNvbXBvbmVudCwgcHJvcHMsIG9wdHMsIGNvbnRleHQsIG1vdW50QWxsKSB7XG4gICAgICAgIGlmICghY29tcG9uZW50Ll9feCkge1xuICAgICAgICAgICAgY29tcG9uZW50Ll9feCA9ICEwO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5fX3IgPSBwcm9wcy5yZWYpIGRlbGV0ZSBwcm9wcy5yZWY7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50Ll9fayA9IHByb3BzLmtleSkgZGVsZXRlIHByb3BzLmtleTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50LmJhc2UgfHwgbW91bnRBbGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxNb3VudCkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxNb3VudCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcykgY29tcG9uZW50LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dCAhPT0gY29tcG9uZW50LmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5fX2MpIGNvbXBvbmVudC5fX2MgPSBjb21wb25lbnQuY29udGV4dDtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3ApIGNvbXBvbmVudC5fX3AgPSBjb21wb25lbnQucHJvcHM7XG4gICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcm9wcztcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3ggPSAhMTtcbiAgICAgICAgICAgIGlmICgwICE9PSBvcHRzKSBpZiAoMSA9PT0gb3B0cyB8fCAhMSAhPT0gb3B0aW9ucy5zeW5jQ29tcG9uZW50VXBkYXRlcyB8fCAhY29tcG9uZW50LmJhc2UpIHJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIDEsIG1vdW50QWxsKTsgZWxzZSBlbnF1ZXVlUmVuZGVyKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50Ll9fcikgY29tcG9uZW50Ll9fcihjb21wb25lbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIG9wdHMsIG1vdW50QWxsLCBpc0NoaWxkKSB7XG4gICAgICAgIGlmICghY29tcG9uZW50Ll9feCkge1xuICAgICAgICAgICAgdmFyIHJlbmRlcmVkLCBpbnN0LCBjYmFzZSwgcHJvcHMgPSBjb21wb25lbnQucHJvcHMsIHN0YXRlID0gY29tcG9uZW50LnN0YXRlLCBjb250ZXh0ID0gY29tcG9uZW50LmNvbnRleHQsIHByZXZpb3VzUHJvcHMgPSBjb21wb25lbnQuX19wIHx8IHByb3BzLCBwcmV2aW91c1N0YXRlID0gY29tcG9uZW50Ll9fcyB8fCBzdGF0ZSwgcHJldmlvdXNDb250ZXh0ID0gY29tcG9uZW50Ll9fYyB8fCBjb250ZXh0LCBpc1VwZGF0ZSA9IGNvbXBvbmVudC5iYXNlLCBuZXh0QmFzZSA9IGNvbXBvbmVudC5fX2IsIGluaXRpYWxCYXNlID0gaXNVcGRhdGUgfHwgbmV4dEJhc2UsIGluaXRpYWxDaGlsZENvbXBvbmVudCA9IGNvbXBvbmVudC5fY29tcG9uZW50LCBza2lwID0gITE7XG4gICAgICAgICAgICBpZiAoaXNVcGRhdGUpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcmV2aW91c1Byb3BzO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5zdGF0ZSA9IHByZXZpb3VzU3RhdGU7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBwcmV2aW91c0NvbnRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKDIgIT09IG9wdHMgJiYgY29tcG9uZW50LnNob3VsZENvbXBvbmVudFVwZGF0ZSAmJiAhMSA9PT0gY29tcG9uZW50LnNob3VsZENvbXBvbmVudFVwZGF0ZShwcm9wcywgc3RhdGUsIGNvbnRleHQpKSBza2lwID0gITA7IGVsc2UgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsVXBkYXRlKSBjb21wb25lbnQuY29tcG9uZW50V2lsbFVwZGF0ZShwcm9wcywgc3RhdGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5wcm9wcyA9IHByb3BzO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5zdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3AgPSBjb21wb25lbnQuX19zID0gY29tcG9uZW50Ll9fYyA9IGNvbXBvbmVudC5fX2IgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9fZCA9ICExO1xuICAgICAgICAgICAgaWYgKCFza2lwKSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyZWQgPSBjb21wb25lbnQucmVuZGVyKHByb3BzLCBzdGF0ZSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5nZXRDaGlsZENvbnRleHQpIGNvbnRleHQgPSBleHRlbmQoZXh0ZW5kKHt9LCBjb250ZXh0KSwgY29tcG9uZW50LmdldENoaWxkQ29udGV4dCgpKTtcbiAgICAgICAgICAgICAgICB2YXIgdG9Vbm1vdW50LCBiYXNlLCBjaGlsZENvbXBvbmVudCA9IHJlbmRlcmVkICYmIHJlbmRlcmVkLm5vZGVOYW1lO1xuICAgICAgICAgICAgICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBjaGlsZENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRQcm9wcyA9IGdldE5vZGVQcm9wcyhyZW5kZXJlZCk7XG4gICAgICAgICAgICAgICAgICAgIGluc3QgPSBpbml0aWFsQ2hpbGRDb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0ICYmIGluc3QuY29uc3RydWN0b3IgPT09IGNoaWxkQ29tcG9uZW50ICYmIGNoaWxkUHJvcHMua2V5ID09IGluc3QuX19rKSBzZXRDb21wb25lbnRQcm9wcyhpbnN0LCBjaGlsZFByb3BzLCAxLCBjb250ZXh0LCAhMSk7IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9Vbm1vdW50ID0gaW5zdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fY29tcG9uZW50ID0gaW5zdCA9IGNyZWF0ZUNvbXBvbmVudChjaGlsZENvbXBvbmVudCwgY2hpbGRQcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0Ll9fYiA9IGluc3QuX19iIHx8IG5leHRCYXNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdC5fX3UgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhpbnN0LCBjaGlsZFByb3BzLCAwLCBjb250ZXh0LCAhMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJDb21wb25lbnQoaW5zdCwgMSwgbW91bnRBbGwsICEwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBiYXNlID0gaW5zdC5iYXNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNiYXNlID0gaW5pdGlhbEJhc2U7XG4gICAgICAgICAgICAgICAgICAgIHRvVW5tb3VudCA9IGluaXRpYWxDaGlsZENvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvVW5tb3VudCkgY2Jhc2UgPSBjb21wb25lbnQuX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbml0aWFsQmFzZSB8fCAxID09PSBvcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2Jhc2UpIGNiYXNlLl9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZSA9IGRpZmYoY2Jhc2UsIHJlbmRlcmVkLCBjb250ZXh0LCBtb3VudEFsbCB8fCAhaXNVcGRhdGUsIGluaXRpYWxCYXNlICYmIGluaXRpYWxCYXNlLnBhcmVudE5vZGUsICEwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbEJhc2UgJiYgYmFzZSAhPT0gaW5pdGlhbEJhc2UgJiYgaW5zdCAhPT0gaW5pdGlhbENoaWxkQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYXNlUGFyZW50ID0gaW5pdGlhbEJhc2UucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2VQYXJlbnQgJiYgYmFzZSAhPT0gYmFzZVBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVBhcmVudC5yZXBsYWNlQ2hpbGQoYmFzZSwgaW5pdGlhbEJhc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0b1VubW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsQmFzZS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShpbml0aWFsQmFzZSwgITEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0b1VubW91bnQpIHVubW91bnRDb21wb25lbnQodG9Vbm1vdW50KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuYmFzZSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UgJiYgIWlzQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudFJlZiA9IGNvbXBvbmVudCwgdCA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHQgPSB0Ll9fdSkgKGNvbXBvbmVudFJlZiA9IHQpLmJhc2UgPSBiYXNlO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl9jb21wb25lbnQgPSBjb21wb25lbnRSZWY7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX2NvbXBvbmVudENvbnN0cnVjdG9yID0gY29tcG9uZW50UmVmLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNVcGRhdGUgfHwgbW91bnRBbGwpIG1vdW50cy51bnNoaWZ0KGNvbXBvbmVudCk7IGVsc2UgaWYgKCFza2lwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnREaWRVcGRhdGUpIGNvbXBvbmVudC5jb21wb25lbnREaWRVcGRhdGUocHJldmlvdXNQcm9wcywgcHJldmlvdXNTdGF0ZSwgcHJldmlvdXNDb250ZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5hZnRlclVwZGF0ZSkgb3B0aW9ucy5hZnRlclVwZGF0ZShjb21wb25lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgIT0gY29tcG9uZW50Ll9faCkgd2hpbGUgKGNvbXBvbmVudC5fX2gubGVuZ3RoKSBjb21wb25lbnQuX19oLnBvcCgpLmNhbGwoY29tcG9uZW50KTtcbiAgICAgICAgICAgIGlmICghZGlmZkxldmVsICYmICFpc0NoaWxkKSBmbHVzaE1vdW50cygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGJ1aWxkQ29tcG9uZW50RnJvbVZOb2RlKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsKSB7XG4gICAgICAgIHZhciBjID0gZG9tICYmIGRvbS5fY29tcG9uZW50LCBvcmlnaW5hbENvbXBvbmVudCA9IGMsIG9sZERvbSA9IGRvbSwgaXNEaXJlY3RPd25lciA9IGMgJiYgZG9tLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWUsIGlzT3duZXIgPSBpc0RpcmVjdE93bmVyLCBwcm9wcyA9IGdldE5vZGVQcm9wcyh2bm9kZSk7XG4gICAgICAgIHdoaWxlIChjICYmICFpc093bmVyICYmIChjID0gYy5fX3UpKSBpc093bmVyID0gYy5jb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWU7XG4gICAgICAgIGlmIChjICYmIGlzT3duZXIgJiYgKCFtb3VudEFsbCB8fCBjLl9jb21wb25lbnQpKSB7XG4gICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhjLCBwcm9wcywgMywgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICAgICAgZG9tID0gYy5iYXNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG9yaWdpbmFsQ29tcG9uZW50ICYmICFpc0RpcmVjdE93bmVyKSB7XG4gICAgICAgICAgICAgICAgdW5tb3VudENvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudCk7XG4gICAgICAgICAgICAgICAgZG9tID0gb2xkRG9tID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGMgPSBjcmVhdGVDb21wb25lbnQodm5vZGUubm9kZU5hbWUsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChkb20gJiYgIWMuX19iKSB7XG4gICAgICAgICAgICAgICAgYy5fX2IgPSBkb207XG4gICAgICAgICAgICAgICAgb2xkRG9tID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldENvbXBvbmVudFByb3BzKGMsIHByb3BzLCAxLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBkb20gPSBjLmJhc2U7XG4gICAgICAgICAgICBpZiAob2xkRG9tICYmIGRvbSAhPT0gb2xkRG9tKSB7XG4gICAgICAgICAgICAgICAgb2xkRG9tLl9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKG9sZERvbSwgITEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkb207XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVubW91bnRDb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmJlZm9yZVVubW91bnQpIG9wdGlvbnMuYmVmb3JlVW5tb3VudChjb21wb25lbnQpO1xuICAgICAgICB2YXIgYmFzZSA9IGNvbXBvbmVudC5iYXNlO1xuICAgICAgICBjb21wb25lbnQuX194ID0gITA7XG4gICAgICAgIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFVubW91bnQpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsVW5tb3VudCgpO1xuICAgICAgICBjb21wb25lbnQuYmFzZSA9IG51bGw7XG4gICAgICAgIHZhciBpbm5lciA9IGNvbXBvbmVudC5fY29tcG9uZW50O1xuICAgICAgICBpZiAoaW5uZXIpIHVubW91bnRDb21wb25lbnQoaW5uZXIpOyBlbHNlIGlmIChiYXNlKSB7XG4gICAgICAgICAgICBpZiAoYmFzZS5fX3ByZWFjdGF0dHJfICYmIGJhc2UuX19wcmVhY3RhdHRyXy5yZWYpIGJhc2UuX19wcmVhY3RhdHRyXy5yZWYobnVsbCk7XG4gICAgICAgICAgICBjb21wb25lbnQuX19iID0gYmFzZTtcbiAgICAgICAgICAgIHJlbW92ZU5vZGUoYmFzZSk7XG4gICAgICAgICAgICBjb2xsZWN0Q29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgICAgICAgICByZW1vdmVDaGlsZHJlbihiYXNlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tcG9uZW50Ll9fcikgY29tcG9uZW50Ll9fcihudWxsKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gQ29tcG9uZW50KHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX19kID0gITA7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuc3RhdGUgfHwge307XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbmRlcih2bm9kZSwgcGFyZW50LCBtZXJnZSkge1xuICAgICAgICByZXR1cm4gZGlmZihtZXJnZSwgdm5vZGUsIHt9LCAhMSwgcGFyZW50LCAhMSk7XG4gICAgfVxuICAgIHZhciBvcHRpb25zID0ge307XG4gICAgdmFyIHN0YWNrID0gW107XG4gICAgdmFyIEVNUFRZX0NISUxEUkVOID0gW107XG4gICAgdmFyIGRlZmVyID0gJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgUHJvbWlzZSA/IFByb21pc2UucmVzb2x2ZSgpLnRoZW4uYmluZChQcm9taXNlLnJlc29sdmUoKSkgOiBzZXRUaW1lb3V0O1xuICAgIHZhciBJU19OT05fRElNRU5TSU9OQUwgPSAvYWNpdHxleCg/OnN8Z3xufHB8JCl8cnBofG93c3xtbmN8bnR3fGluZVtjaF18em9vfF5vcmQvaTtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB2YXIgbW91bnRzID0gW107XG4gICAgdmFyIGRpZmZMZXZlbCA9IDA7XG4gICAgdmFyIGlzU3ZnTW9kZSA9ICExO1xuICAgIHZhciBoeWRyYXRpbmcgPSAhMTtcbiAgICB2YXIgY29tcG9uZW50cyA9IHt9O1xuICAgIGV4dGVuZChDb21wb25lbnQucHJvdG90eXBlLCB7XG4gICAgICAgIHNldFN0YXRlOiBmdW5jdGlvbihzdGF0ZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBzID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIGlmICghdGhpcy5fX3MpIHRoaXMuX19zID0gZXh0ZW5kKHt9LCBzKTtcbiAgICAgICAgICAgIGV4dGVuZChzLCAnZnVuY3Rpb24nID09IHR5cGVvZiBzdGF0ZSA/IHN0YXRlKHMsIHRoaXMucHJvcHMpIDogc3RhdGUpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSAodGhpcy5fX2ggPSB0aGlzLl9faCB8fCBbXSkucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICBlbnF1ZXVlUmVuZGVyKHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBmb3JjZVVwZGF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgKHRoaXMuX19oID0gdGhpcy5fX2ggfHwgW10pLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgcmVuZGVyQ29tcG9uZW50KHRoaXMsIDIpO1xuICAgICAgICB9LFxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge31cbiAgICB9KTtcbiAgICB2YXIgcHJlYWN0ID0ge1xuICAgICAgICBoOiBoLFxuICAgICAgICBjcmVhdGVFbGVtZW50OiBoLFxuICAgICAgICBjbG9uZUVsZW1lbnQ6IGNsb25lRWxlbWVudCxcbiAgICAgICAgQ29tcG9uZW50OiBDb21wb25lbnQsXG4gICAgICAgIHJlbmRlcjogcmVuZGVyLFxuICAgICAgICByZXJlbmRlcjogcmVyZW5kZXIsXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9O1xuICAgIGlmICgndW5kZWZpbmVkJyAhPSB0eXBlb2YgbW9kdWxlKSBtb2R1bGUuZXhwb3J0cyA9IHByZWFjdDsgZWxzZSBzZWxmLnByZWFjdCA9IHByZWFjdDtcbn0oKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByZWFjdC5qcy5tYXAiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuICAsIHVuZGVmO1xuXG4vKipcbiAqIERlY29kZSBhIFVSSSBlbmNvZGVkIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFVSSSBlbmNvZGVkIHN0cmluZy5cbiAqIEByZXR1cm5zIHtTdHJpbmd8TnVsbH0gVGhlIGRlY29kZWQgc3RyaW5nLlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoaW5wdXQucmVwbGFjZSgvXFwrL2csICcgJykpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBBdHRlbXB0cyB0byBlbmNvZGUgYSBnaXZlbiBpbnB1dC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIHN0cmluZyB0aGF0IG5lZWRzIHRvIGJlIGVuY29kZWQuXG4gKiBAcmV0dXJucyB7U3RyaW5nfE51bGx9IFRoZSBlbmNvZGVkIHN0cmluZy5cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBlbmNvZGUoaW5wdXQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGlucHV0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogU2ltcGxlIHF1ZXJ5IHN0cmluZyBwYXJzZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHF1ZXJ5IFRoZSBxdWVyeSBzdHJpbmcgdGhhdCBuZWVkcyB0byBiZSBwYXJzZWQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gcXVlcnlzdHJpbmcocXVlcnkpIHtcbiAgdmFyIHBhcnNlciA9IC8oW149PyZdKyk9PyhbXiZdKikvZ1xuICAgICwgcmVzdWx0ID0ge31cbiAgICAsIHBhcnQ7XG5cbiAgd2hpbGUgKHBhcnQgPSBwYXJzZXIuZXhlYyhxdWVyeSkpIHtcbiAgICB2YXIga2V5ID0gZGVjb2RlKHBhcnRbMV0pXG4gICAgICAsIHZhbHVlID0gZGVjb2RlKHBhcnRbMl0pO1xuXG4gICAgLy9cbiAgICAvLyBQcmV2ZW50IG92ZXJyaWRpbmcgb2YgZXhpc3RpbmcgcHJvcGVydGllcy4gVGhpcyBlbnN1cmVzIHRoYXQgYnVpbGQtaW5cbiAgICAvLyBtZXRob2RzIGxpa2UgYHRvU3RyaW5nYCBvciBfX3Byb3RvX18gYXJlIG5vdCBvdmVycmlkZW4gYnkgbWFsaWNpb3VzXG4gICAgLy8gcXVlcnlzdHJpbmdzLlxuICAgIC8vXG4gICAgLy8gSW4gdGhlIGNhc2UgaWYgZmFpbGVkIGRlY29kaW5nLCB3ZSB3YW50IHRvIG9taXQgdGhlIGtleS92YWx1ZSBwYWlyc1xuICAgIC8vIGZyb20gdGhlIHJlc3VsdC5cbiAgICAvL1xuICAgIGlmIChrZXkgPT09IG51bGwgfHwgdmFsdWUgPT09IG51bGwgfHwga2V5IGluIHJlc3VsdCkgY29udGludWU7XG4gICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIGEgcXVlcnkgc3RyaW5nIHRvIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIE9iamVjdCB0aGF0IHNob3VsZCBiZSB0cmFuc2Zvcm1lZC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBwcmVmaXggT3B0aW9uYWwgcHJlZml4LlxuICogQHJldHVybnMge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cbmZ1bmN0aW9uIHF1ZXJ5c3RyaW5naWZ5KG9iaiwgcHJlZml4KSB7XG4gIHByZWZpeCA9IHByZWZpeCB8fCAnJztcblxuICB2YXIgcGFpcnMgPSBbXVxuICAgICwgdmFsdWVcbiAgICAsIGtleTtcblxuICAvL1xuICAvLyBPcHRpb25hbGx5IHByZWZpeCB3aXRoIGEgJz8nIGlmIG5lZWRlZFxuICAvL1xuICBpZiAoJ3N0cmluZycgIT09IHR5cGVvZiBwcmVmaXgpIHByZWZpeCA9ICc/JztcblxuICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzLmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICB2YWx1ZSA9IG9ialtrZXldO1xuXG4gICAgICAvL1xuICAgICAgLy8gRWRnZSBjYXNlcyB3aGVyZSB3ZSBhY3R1YWxseSB3YW50IHRvIGVuY29kZSB0aGUgdmFsdWUgdG8gYW4gZW1wdHlcbiAgICAgIC8vIHN0cmluZyBpbnN0ZWFkIG9mIHRoZSBzdHJpbmdpZmllZCB2YWx1ZS5cbiAgICAgIC8vXG4gICAgICBpZiAoIXZhbHVlICYmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWYgfHwgaXNOYU4odmFsdWUpKSkge1xuICAgICAgICB2YWx1ZSA9ICcnO1xuICAgICAgfVxuXG4gICAgICBrZXkgPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KTtcbiAgICAgIHZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcblxuICAgICAgLy9cbiAgICAgIC8vIElmIHdlIGZhaWxlZCB0byBlbmNvZGUgdGhlIHN0cmluZ3MsIHdlIHNob3VsZCBiYWlsIG91dCBhcyB3ZSBkb24ndFxuICAgICAgLy8gd2FudCB0byBhZGQgaW52YWxpZCBzdHJpbmdzIHRvIHRoZSBxdWVyeS5cbiAgICAgIC8vXG4gICAgICBpZiAoa2V5ID09PSBudWxsIHx8IHZhbHVlID09PSBudWxsKSBjb250aW51ZTtcbiAgICAgIHBhaXJzLnB1c2goa2V5ICsnPScrIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFpcnMubGVuZ3RoID8gcHJlZml4ICsgcGFpcnMuam9pbignJicpIDogJyc7XG59XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5leHBvcnRzLnN0cmluZ2lmeSA9IHF1ZXJ5c3RyaW5naWZ5O1xuZXhwb3J0cy5wYXJzZSA9IHF1ZXJ5c3RyaW5nO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENoZWNrIGlmIHdlJ3JlIHJlcXVpcmVkIHRvIGFkZCBhIHBvcnQgbnVtYmVyLlxuICpcbiAqIEBzZWUgaHR0cHM6Ly91cmwuc3BlYy53aGF0d2cub3JnLyNkZWZhdWx0LXBvcnRcbiAqIEBwYXJhbSB7TnVtYmVyfFN0cmluZ30gcG9ydCBQb3J0IG51bWJlciB3ZSBuZWVkIHRvIGNoZWNrXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvdG9jb2wgUHJvdG9jb2wgd2UgbmVlZCB0byBjaGVjayBhZ2FpbnN0LlxuICogQHJldHVybnMge0Jvb2xlYW59IElzIGl0IGEgZGVmYXVsdCBwb3J0IGZvciB0aGUgZ2l2ZW4gcHJvdG9jb2xcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJlcXVpcmVkKHBvcnQsIHByb3RvY29sKSB7XG4gIHByb3RvY29sID0gcHJvdG9jb2wuc3BsaXQoJzonKVswXTtcbiAgcG9ydCA9ICtwb3J0O1xuXG4gIGlmICghcG9ydCkgcmV0dXJuIGZhbHNlO1xuXG4gIHN3aXRjaCAocHJvdG9jb2wpIHtcbiAgICBjYXNlICdodHRwJzpcbiAgICBjYXNlICd3cyc6XG4gICAgcmV0dXJuIHBvcnQgIT09IDgwO1xuXG4gICAgY2FzZSAnaHR0cHMnOlxuICAgIGNhc2UgJ3dzcyc6XG4gICAgcmV0dXJuIHBvcnQgIT09IDQ0MztcblxuICAgIGNhc2UgJ2Z0cCc6XG4gICAgcmV0dXJuIHBvcnQgIT09IDIxO1xuXG4gICAgY2FzZSAnZ29waGVyJzpcbiAgICByZXR1cm4gcG9ydCAhPT0gNzA7XG5cbiAgICBjYXNlICdmaWxlJzpcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gcG9ydCAhPT0gMDtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGZpbmdlcnByaW50O1xuXG52YXIgX2lzUmVhY3ROYXRpdmUgPSByZXF1aXJlKFwiLi9pc1JlYWN0TmF0aXZlXCIpO1xuXG52YXIgX2lzUmVhY3ROYXRpdmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNSZWFjdE5hdGl2ZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8qKlxuICogR2VuZXJhdGUgYSBmaW5nZXJwcmludCBmb3IgYSBmaWxlIHdoaWNoIHdpbGwgYmUgdXNlZCB0aGUgc3RvcmUgdGhlIGVuZHBvaW50XG4gKlxuICogQHBhcmFtIHtGaWxlfSBmaWxlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gZmluZ2VycHJpbnQoZmlsZSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgaWYgKCgwLCBfaXNSZWFjdE5hdGl2ZTIuZGVmYXVsdCkoKSkge1xuICAgIHJldHVybiBjYWxsYmFjayhudWxsLCByZWFjdE5hdGl2ZUZpbmdlcnByaW50KGZpbGUsIG9wdGlvbnMpKTtcbiAgfVxuXG4gIHJldHVybiBjYWxsYmFjayhudWxsLCBbXCJ0dXMtYnJcIiwgZmlsZS5uYW1lLCBmaWxlLnR5cGUsIGZpbGUuc2l6ZSwgZmlsZS5sYXN0TW9kaWZpZWQsIG9wdGlvbnMuZW5kcG9pbnRdLmpvaW4oXCItXCIpKTtcbn1cblxuZnVuY3Rpb24gcmVhY3ROYXRpdmVGaW5nZXJwcmludChmaWxlLCBvcHRpb25zKSB7XG4gIHZhciBleGlmSGFzaCA9IGZpbGUuZXhpZiA/IGhhc2hDb2RlKEpTT04uc3RyaW5naWZ5KGZpbGUuZXhpZikpIDogXCJub2V4aWZcIjtcbiAgcmV0dXJuIFtcInR1cy1yblwiLCBmaWxlLm5hbWUgfHwgXCJub25hbWVcIiwgZmlsZS5zaXplIHx8IFwibm9zaXplXCIsIGV4aWZIYXNoLCBvcHRpb25zLmVuZHBvaW50XS5qb2luKFwiL1wiKTtcbn1cblxuZnVuY3Rpb24gaGFzaENvZGUoc3RyKSB7XG4gIC8vIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzg4MzE5MzcvMTUxNjY2XG4gIHZhciBoYXNoID0gMDtcbiAgaWYgKHN0ci5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gaGFzaDtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBjaGFyID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgaGFzaCA9IChoYXNoIDw8IDUpIC0gaGFzaCArIGNoYXI7XG4gICAgaGFzaCA9IGhhc2ggJiBoYXNoOyAvLyBDb252ZXJ0IHRvIDMyYml0IGludGVnZXJcbiAgfVxuICByZXR1cm4gaGFzaDtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciBpc0NvcmRvdmEgPSBmdW5jdGlvbiBpc0NvcmRvdmEoKSB7XG4gIHJldHVybiB0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIgJiYgKHR5cGVvZiB3aW5kb3cuUGhvbmVHYXAgIT0gXCJ1bmRlZmluZWRcIiB8fCB0eXBlb2Ygd2luZG93LkNvcmRvdmEgIT0gXCJ1bmRlZmluZWRcIiB8fCB0eXBlb2Ygd2luZG93LmNvcmRvdmEgIT0gXCJ1bmRlZmluZWRcIik7XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSBpc0NvcmRvdmE7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgaXNSZWFjdE5hdGl2ZSA9IGZ1bmN0aW9uIGlzUmVhY3ROYXRpdmUoKSB7XG4gIHJldHVybiB0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gXCJzdHJpbmdcIiAmJiBuYXZpZ2F0b3IucHJvZHVjdC50b0xvd2VyQ2FzZSgpID09PSBcInJlYWN0bmF0aXZlXCI7XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSBpc1JlYWN0TmF0aXZlOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuLyoqXG4gKiByZWFkQXNCeXRlQXJyYXkgY29udmVydHMgYSBGaWxlIG9iamVjdCB0byBhIFVpbnQ4QXJyYXkuXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIG9ubHkgdXNlZCBvbiB0aGUgQXBhY2hlIENvcmRvdmEgcGxhdGZvcm0uXG4gKiBTZWUgaHR0cHM6Ly9jb3Jkb3ZhLmFwYWNoZS5vcmcvZG9jcy9lbi9sYXRlc3QvcmVmZXJlbmNlL2NvcmRvdmEtcGx1Z2luLWZpbGUvaW5kZXguaHRtbCNyZWFkLWEtZmlsZVxuICovXG5mdW5jdGlvbiByZWFkQXNCeXRlQXJyYXkoY2h1bmssIGNhbGxiYWNrKSB7XG4gIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIGNhbGxiYWNrKG51bGwsIG5ldyBVaW50OEFycmF5KHJlYWRlci5yZXN1bHQpKTtcbiAgfTtcbiAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgY2FsbGJhY2soZXJyKTtcbiAgfTtcbiAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGNodW5rKTtcbn1cblxuZXhwb3J0cy5kZWZhdWx0ID0gcmVhZEFzQnl0ZUFycmF5OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5uZXdSZXF1ZXN0ID0gbmV3UmVxdWVzdDtcbmV4cG9ydHMucmVzb2x2ZVVybCA9IHJlc29sdmVVcmw7XG5cbnZhciBfdXJsUGFyc2UgPSByZXF1aXJlKFwidXJsLXBhcnNlXCIpO1xuXG52YXIgX3VybFBhcnNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3VybFBhcnNlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gbmV3UmVxdWVzdCgpIHtcbiAgcmV0dXJuIG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcbn0gLyogZ2xvYmFsIHdpbmRvdyAqL1xuZnVuY3Rpb24gcmVzb2x2ZVVybChvcmlnaW4sIGxpbmspIHtcbiAgcmV0dXJuIG5ldyBfdXJsUGFyc2UyLmRlZmF1bHQobGluaywgb3JpZ2luKS50b1N0cmluZygpO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5leHBvcnRzLmdldFNvdXJjZSA9IGdldFNvdXJjZTtcblxudmFyIF9pc1JlYWN0TmF0aXZlID0gcmVxdWlyZShcIi4vaXNSZWFjdE5hdGl2ZVwiKTtcblxudmFyIF9pc1JlYWN0TmF0aXZlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzUmVhY3ROYXRpdmUpO1xuXG52YXIgX3VyaVRvQmxvYiA9IHJlcXVpcmUoXCIuL3VyaVRvQmxvYlwiKTtcblxudmFyIF91cmlUb0Jsb2IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdXJpVG9CbG9iKTtcblxudmFyIF9pc0NvcmRvdmEgPSByZXF1aXJlKFwiLi9pc0NvcmRvdmFcIik7XG5cbnZhciBfaXNDb3Jkb3ZhMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzQ29yZG92YSk7XG5cbnZhciBfcmVhZEFzQnl0ZUFycmF5ID0gcmVxdWlyZShcIi4vcmVhZEFzQnl0ZUFycmF5XCIpO1xuXG52YXIgX3JlYWRBc0J5dGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFkQXNCeXRlQXJyYXkpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgRmlsZVNvdXJjZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRmlsZVNvdXJjZShmaWxlKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEZpbGVTb3VyY2UpO1xuXG4gICAgdGhpcy5fZmlsZSA9IGZpbGU7XG4gICAgdGhpcy5zaXplID0gZmlsZS5zaXplO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKEZpbGVTb3VyY2UsIFt7XG4gICAga2V5OiBcInNsaWNlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNsaWNlKHN0YXJ0LCBlbmQsIGNhbGxiYWNrKSB7XG4gICAgICAvLyBJbiBBcGFjaGUgQ29yZG92YSBhcHBsaWNhdGlvbnMsIGEgRmlsZSBtdXN0IGJlIHJlc29sdmVkIHVzaW5nXG4gICAgICAvLyBGaWxlUmVhZGVyIGluc3RhbmNlcywgc2VlXG4gICAgICAvLyBodHRwczovL2NvcmRvdmEuYXBhY2hlLm9yZy9kb2NzL2VuLzgueC9yZWZlcmVuY2UvY29yZG92YS1wbHVnaW4tZmlsZS9pbmRleC5odG1sI3JlYWQtYS1maWxlXG4gICAgICBpZiAoKDAsIF9pc0NvcmRvdmEyLmRlZmF1bHQpKCkpIHtcbiAgICAgICAgKDAsIF9yZWFkQXNCeXRlQXJyYXkyLmRlZmF1bHQpKHRoaXMuX2ZpbGUuc2xpY2Uoc3RhcnQsIGVuZCksIGZ1bmN0aW9uIChlcnIsIGNodW5rKSB7XG4gICAgICAgICAgaWYgKGVycikgcmV0dXJuIGNhbGxiYWNrKGVycik7XG5cbiAgICAgICAgICBjYWxsYmFjayhudWxsLCBjaHVuayk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrKG51bGwsIHRoaXMuX2ZpbGUuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJjbG9zZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZSgpIHt9XG4gIH1dKTtcblxuICByZXR1cm4gRmlsZVNvdXJjZTtcbn0oKTtcblxudmFyIFN0cmVhbVNvdXJjZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gU3RyZWFtU291cmNlKHJlYWRlciwgY2h1bmtTaXplKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFN0cmVhbVNvdXJjZSk7XG5cbiAgICB0aGlzLl9jaHVua1NpemUgPSBjaHVua1NpemU7XG4gICAgdGhpcy5fYnVmZmVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2J1ZmZlck9mZnNldCA9IDA7XG4gICAgdGhpcy5fcmVhZGVyID0gcmVhZGVyO1xuICAgIHRoaXMuX2RvbmUgPSBmYWxzZTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhTdHJlYW1Tb3VyY2UsIFt7XG4gICAga2V5OiBcInNsaWNlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNsaWNlKHN0YXJ0LCBlbmQsIGNhbGxiYWNrKSB7XG4gICAgICBpZiAoc3RhcnQgPCB0aGlzLl9idWZmZXJPZmZzZXQpIHtcbiAgICAgICAgY2FsbGJhY2sobmV3IEVycm9yKFwiUmVxdWVzdGVkIGRhdGEgaXMgYmVmb3JlIHRoZSByZWFkZXIncyBjdXJyZW50IG9mZnNldFwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX3JlYWRVbnRpbEVub3VnaERhdGFPckRvbmUoc3RhcnQsIGVuZCwgY2FsbGJhY2spO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJfcmVhZFVudGlsRW5vdWdoRGF0YU9yRG9uZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVhZFVudGlsRW5vdWdoRGF0YU9yRG9uZShzdGFydCwgZW5kLCBjYWxsYmFjaykge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdmFyIGhhc0Vub3VnaERhdGEgPSBlbmQgPD0gdGhpcy5fYnVmZmVyT2Zmc2V0ICsgbGVuKHRoaXMuX2J1ZmZlcik7XG4gICAgICBpZiAodGhpcy5fZG9uZSB8fCBoYXNFbm91Z2hEYXRhKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuX2dldERhdGFGcm9tQnVmZmVyKHN0YXJ0LCBlbmQpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCB2YWx1ZSwgdmFsdWUgPT0gbnVsbCA/IHRoaXMuX2RvbmUgOiBmYWxzZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3JlYWRlci5yZWFkKCkudGhlbihmdW5jdGlvbiAoX3JlZikge1xuICAgICAgICB2YXIgdmFsdWUgPSBfcmVmLnZhbHVlLFxuICAgICAgICAgICAgZG9uZSA9IF9yZWYuZG9uZTtcblxuICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgIF90aGlzLl9kb25lID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChfdGhpcy5fYnVmZmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBfdGhpcy5fYnVmZmVyID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3RoaXMuX2J1ZmZlciA9IGNvbmNhdChfdGhpcy5fYnVmZmVyLCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBfdGhpcy5fcmVhZFVudGlsRW5vdWdoRGF0YU9yRG9uZShzdGFydCwgZW5kLCBjYWxsYmFjayk7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcihcIkVycm9yIGR1cmluZyByZWFkOiBcIiArIGVycikpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIl9nZXREYXRhRnJvbUJ1ZmZlclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0RGF0YUZyb21CdWZmZXIoc3RhcnQsIGVuZCkge1xuICAgICAgLy8gUmVtb3ZlIGRhdGEgZnJvbSBidWZmZXIgYmVmb3JlIGBzdGFydGAuXG4gICAgICAvLyBEYXRhIG1pZ2h0IGJlIHJlcmVhZCBmcm9tIHRoZSBidWZmZXIgaWYgYW4gdXBsb2FkIGZhaWxzLCBzbyB3ZSBjYW4gb25seVxuICAgICAgLy8gc2FmZWx5IGRlbGV0ZSBkYXRhIHdoZW4gaXQgY29tZXMgKmJlZm9yZSogd2hhdCBpcyBjdXJyZW50bHkgYmVpbmcgcmVhZC5cbiAgICAgIGlmIChzdGFydCA+IHRoaXMuX2J1ZmZlck9mZnNldCkge1xuICAgICAgICB0aGlzLl9idWZmZXIgPSB0aGlzLl9idWZmZXIuc2xpY2Uoc3RhcnQgLSB0aGlzLl9idWZmZXJPZmZzZXQpO1xuICAgICAgICB0aGlzLl9idWZmZXJPZmZzZXQgPSBzdGFydDtcbiAgICAgIH1cbiAgICAgIC8vIElmIHRoZSBidWZmZXIgaXMgZW1wdHkgYWZ0ZXIgcmVtb3Zpbmcgb2xkIGRhdGEsIGFsbCBkYXRhIGhhcyBiZWVuIHJlYWQuXG4gICAgICB2YXIgaGFzQWxsRGF0YUJlZW5SZWFkID0gbGVuKHRoaXMuX2J1ZmZlcikgPT09IDA7XG4gICAgICBpZiAodGhpcy5fZG9uZSAmJiBoYXNBbGxEYXRhQmVlblJlYWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICAvLyBXZSBhbHJlYWR5IHJlbW92ZWQgZGF0YSBiZWZvcmUgYHN0YXJ0YCwgc28gd2UganVzdCByZXR1cm4gdGhlIGZpcnN0XG4gICAgICAvLyBjaHVuayBmcm9tIHRoZSBidWZmZXIuXG4gICAgICByZXR1cm4gdGhpcy5fYnVmZmVyLnNsaWNlKDAsIGVuZCAtIHN0YXJ0KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY2xvc2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICBpZiAodGhpcy5fcmVhZGVyLmNhbmNlbCkge1xuICAgICAgICB0aGlzLl9yZWFkZXIuY2FuY2VsKCk7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFN0cmVhbVNvdXJjZTtcbn0oKTtcblxuZnVuY3Rpb24gbGVuKGJsb2JPckFycmF5KSB7XG4gIGlmIChibG9iT3JBcnJheSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gMDtcbiAgaWYgKGJsb2JPckFycmF5LnNpemUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGJsb2JPckFycmF5LnNpemU7XG4gIHJldHVybiBibG9iT3JBcnJheS5sZW5ndGg7XG59XG5cbi8qXG4gIFR5cGVkIGFycmF5cyBhbmQgYmxvYnMgZG9uJ3QgaGF2ZSBhIGNvbmNhdCBtZXRob2QuXG4gIFRoaXMgZnVuY3Rpb24gaGVscHMgU3RyZWFtU291cmNlIGFjY3VtdWxhdGUgZGF0YSB0byByZWFjaCBjaHVua1NpemUuXG4qL1xuZnVuY3Rpb24gY29uY2F0KGEsIGIpIHtcbiAgaWYgKGEuY29uY2F0KSB7XG4gICAgLy8gSXMgYGFgIGFuIEFycmF5P1xuICAgIHJldHVybiBhLmNvbmNhdChiKTtcbiAgfVxuICBpZiAoYSBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICByZXR1cm4gbmV3IEJsb2IoW2EsIGJdLCB7IHR5cGU6IGEudHlwZSB9KTtcbiAgfVxuICBpZiAoYS5zZXQpIHtcbiAgICAvLyBJcyBgYWAgYSB0eXBlZCBhcnJheT9cbiAgICB2YXIgYyA9IG5ldyBhLmNvbnN0cnVjdG9yKGEubGVuZ3RoICsgYi5sZW5ndGgpO1xuICAgIGMuc2V0KGEpO1xuICAgIGMuc2V0KGIsIGEubGVuZ3RoKTtcbiAgICByZXR1cm4gYztcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIGRhdGEgdHlwZVwiKTtcbn1cblxuZnVuY3Rpb24gZ2V0U291cmNlKGlucHV0LCBjaHVua1NpemUsIGNhbGxiYWNrKSB7XG4gIC8vIEluIFJlYWN0IE5hdGl2ZSwgd2hlbiB1c2VyIHNlbGVjdHMgYSBmaWxlLCBpbnN0ZWFkIG9mIGEgRmlsZSBvciBCbG9iLFxuICAvLyB5b3UgdXN1YWxseSBnZXQgYSBmaWxlIG9iamVjdCB7fSB3aXRoIGEgdXJpIHByb3BlcnR5IHRoYXQgY29udGFpbnNcbiAgLy8gYSBsb2NhbCBwYXRoIHRvIHRoZSBmaWxlLiBXZSB1c2UgWE1MSHR0cFJlcXVlc3QgdG8gZmV0Y2hcbiAgLy8gdGhlIGZpbGUgYmxvYiwgYmVmb3JlIHVwbG9hZGluZyB3aXRoIHR1cy5cbiAgaWYgKCgwLCBfaXNSZWFjdE5hdGl2ZTIuZGVmYXVsdCkoKSAmJiBpbnB1dCAmJiB0eXBlb2YgaW5wdXQudXJpICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgKDAsIF91cmlUb0Jsb2IyLmRlZmF1bHQpKGlucHV0LnVyaSwgZnVuY3Rpb24gKGVyciwgYmxvYikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKFwidHVzOiBjYW5ub3QgZmV0Y2ggYGZpbGUudXJpYCBhcyBCbG9iLCBtYWtlIHN1cmUgdGhlIHVyaSBpcyBjb3JyZWN0IGFuZCBhY2Nlc3NpYmxlLiBcIiArIGVycikpO1xuICAgICAgfVxuICAgICAgY2FsbGJhY2sobnVsbCwgbmV3IEZpbGVTb3VyY2UoYmxvYikpO1xuICAgIH0pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFNpbmNlIHdlIGVtdWxhdGUgdGhlIEJsb2IgdHlwZSBpbiBvdXIgdGVzdHMgKG5vdCBhbGwgdGFyZ2V0IGJyb3dzZXJzXG4gIC8vIHN1cHBvcnQgaXQpLCB3ZSBjYW5ub3QgdXNlIGBpbnN0YW5jZW9mYCBmb3IgdGVzdGluZyB3aGV0aGVyIHRoZSBpbnB1dCB2YWx1ZVxuICAvLyBjYW4gYmUgaGFuZGxlZC4gSW5zdGVhZCwgd2Ugc2ltcGx5IGNoZWNrIGlzIHRoZSBzbGljZSgpIGZ1bmN0aW9uIGFuZCB0aGVcbiAgLy8gc2l6ZSBwcm9wZXJ0eSBhcmUgYXZhaWxhYmxlLlxuICBpZiAodHlwZW9mIGlucHV0LnNsaWNlID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGlucHV0LnNpemUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjYWxsYmFjayhudWxsLCBuZXcgRmlsZVNvdXJjZShpbnB1dCkpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0eXBlb2YgaW5wdXQucmVhZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgY2h1bmtTaXplID0gK2NodW5rU2l6ZTtcbiAgICBpZiAoIWlzRmluaXRlKGNodW5rU2l6ZSkpIHtcbiAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcihcImNhbm5vdCBjcmVhdGUgc291cmNlIGZvciBzdHJlYW0gd2l0aG91dCBhIGZpbml0ZSB2YWx1ZSBmb3IgdGhlIGBjaHVua1NpemVgIG9wdGlvblwiKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNhbGxiYWNrKG51bGwsIG5ldyBTdHJlYW1Tb3VyY2UoaW5wdXQsIGNodW5rU2l6ZSkpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNhbGxiYWNrKG5ldyBFcnJvcihcInNvdXJjZSBvYmplY3QgbWF5IG9ubHkgYmUgYW4gaW5zdGFuY2Ugb2YgRmlsZSwgQmxvYiwgb3IgUmVhZGVyIGluIHRoaXMgZW52aXJvbm1lbnRcIikpO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5leHBvcnRzLmdldFN0b3JhZ2UgPSBnZXRTdG9yYWdlO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKiBnbG9iYWwgd2luZG93LCBsb2NhbFN0b3JhZ2UgKi9cblxudmFyIGhhc1N0b3JhZ2UgPSBmYWxzZTtcbnRyeSB7XG4gIGhhc1N0b3JhZ2UgPSBcImxvY2FsU3RvcmFnZVwiIGluIHdpbmRvdztcblxuICAvLyBBdHRlbXB0IHRvIHN0b3JlIGFuZCByZWFkIGVudHJpZXMgZnJvbSB0aGUgbG9jYWwgc3RvcmFnZSB0byBkZXRlY3QgUHJpdmF0ZVxuICAvLyBNb2RlIG9uIFNhZmFyaSBvbiBpT1MgKHNlZSAjNDkpXG4gIHZhciBrZXkgPSBcInR1c1N1cHBvcnRcIjtcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpKTtcbn0gY2F0Y2ggKGUpIHtcbiAgLy8gSWYgd2UgdHJ5IHRvIGFjY2VzcyBsb2NhbFN0b3JhZ2UgaW5zaWRlIGEgc2FuZGJveGVkIGlmcmFtZSwgYSBTZWN1cml0eUVycm9yXG4gIC8vIGlzIHRocm93bi4gV2hlbiBpbiBwcml2YXRlIG1vZGUgb24gaU9TIFNhZmFyaSwgYSBRdW90YUV4Y2VlZGVkRXJyb3IgaXNcbiAgLy8gdGhyb3duIChzZWUgIzQ5KVxuICBpZiAoZS5jb2RlID09PSBlLlNFQ1VSSVRZX0VSUiB8fCBlLmNvZGUgPT09IGUuUVVPVEFfRVhDRUVERURfRVJSKSB7XG4gICAgaGFzU3RvcmFnZSA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHRocm93IGU7XG4gIH1cbn1cblxudmFyIGNhblN0b3JlVVJMcyA9IGV4cG9ydHMuY2FuU3RvcmVVUkxzID0gaGFzU3RvcmFnZTtcblxudmFyIExvY2FsU3RvcmFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTG9jYWxTdG9yYWdlKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMb2NhbFN0b3JhZ2UpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKExvY2FsU3RvcmFnZSwgW3tcbiAgICBrZXk6IFwic2V0SXRlbVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRJdGVtKGtleSwgdmFsdWUsIGNiKSB7XG4gICAgICBjYihudWxsLCBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImdldEl0ZW1cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SXRlbShrZXksIGNiKSB7XG4gICAgICBjYihudWxsLCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicmVtb3ZlSXRlbVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVJdGVtKGtleSwgY2IpIHtcbiAgICAgIGNiKG51bGwsIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSkpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBMb2NhbFN0b3JhZ2U7XG59KCk7XG5cbmZ1bmN0aW9uIGdldFN0b3JhZ2UoKSB7XG4gIHJldHVybiBoYXNTdG9yYWdlID8gbmV3IExvY2FsU3RvcmFnZSgpIDogbnVsbDtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbi8qKlxuICogdXJpVG9CbG9iIHJlc29sdmVzIGEgVVJJIHRvIGEgQmxvYiBvYmplY3QuIFRoaXMgaXMgdXNlZCBmb3JcbiAqIFJlYWN0IE5hdGl2ZSB0byByZXRyaWV2ZSBhIGZpbGUgKGlkZW50aWZpZWQgYnkgYSBmaWxlOi8vXG4gKiBVUkkpIGFzIGEgYmxvYi5cbiAqL1xuZnVuY3Rpb24gdXJpVG9CbG9iKHVyaSwgZG9uZSkge1xuICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHhoci5yZXNwb25zZVR5cGUgPSBcImJsb2JcIjtcbiAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYmxvYiA9IHhoci5yZXNwb25zZTtcbiAgICBkb25lKG51bGwsIGJsb2IpO1xuICB9O1xuICB4aHIub25lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICBkb25lKGVycik7XG4gIH07XG4gIHhoci5vcGVuKFwiR0VUXCIsIHVyaSk7XG4gIHhoci5zZW5kKCk7XG59XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHVyaVRvQmxvYjsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgRGV0YWlsZWRFcnJvciA9IGZ1bmN0aW9uIChfRXJyb3IpIHtcbiAgX2luaGVyaXRzKERldGFpbGVkRXJyb3IsIF9FcnJvcik7XG5cbiAgZnVuY3Rpb24gRGV0YWlsZWRFcnJvcihlcnJvcikge1xuICAgIHZhciBjYXVzaW5nRXJyID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuICAgIHZhciB4aHIgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IG51bGw7XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRGV0YWlsZWRFcnJvcik7XG5cbiAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoRGV0YWlsZWRFcnJvci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKERldGFpbGVkRXJyb3IpKS5jYWxsKHRoaXMsIGVycm9yLm1lc3NhZ2UpKTtcblxuICAgIF90aGlzLm9yaWdpbmFsUmVxdWVzdCA9IHhocjtcbiAgICBfdGhpcy5jYXVzaW5nRXJyb3IgPSBjYXVzaW5nRXJyO1xuXG4gICAgdmFyIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgIGlmIChjYXVzaW5nRXJyICE9IG51bGwpIHtcbiAgICAgIG1lc3NhZ2UgKz0gXCIsIGNhdXNlZCBieSBcIiArIGNhdXNpbmdFcnIudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKHhociAhPSBudWxsKSB7XG4gICAgICBtZXNzYWdlICs9IFwiLCBvcmlnaW5hdGVkIGZyb20gcmVxdWVzdCAocmVzcG9uc2UgY29kZTogXCIgKyB4aHIuc3RhdHVzICsgXCIsIHJlc3BvbnNlIHRleHQ6IFwiICsgeGhyLnJlc3BvbnNlVGV4dCArIFwiKVwiO1xuICAgIH1cbiAgICBfdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICByZXR1cm4gRGV0YWlsZWRFcnJvcjtcbn0oRXJyb3IpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBEZXRhaWxlZEVycm9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX3VwbG9hZCA9IHJlcXVpcmUoXCIuL3VwbG9hZFwiKTtcblxudmFyIF91cGxvYWQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdXBsb2FkKTtcblxudmFyIF9zdG9yYWdlID0gcmVxdWlyZShcIi4vbm9kZS9zdG9yYWdlXCIpO1xuXG52YXIgc3RvcmFnZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9zdG9yYWdlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQob2JqKSB7IGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHsgcmV0dXJuIG9iajsgfSBlbHNlIHsgdmFyIG5ld09iaiA9IHt9OyBpZiAob2JqICE9IG51bGwpIHsgZm9yICh2YXIga2V5IGluIG9iaikgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgbmV3T2JqW2tleV0gPSBvYmpba2V5XTsgfSB9IG5ld09iai5kZWZhdWx0ID0gb2JqOyByZXR1cm4gbmV3T2JqOyB9IH1cblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLyogZ2xvYmFsIHdpbmRvdyAqL1xudmFyIGRlZmF1bHRPcHRpb25zID0gX3VwbG9hZDIuZGVmYXVsdC5kZWZhdWx0T3B0aW9ucztcblxuXG52YXIgbW9kdWxlRXhwb3J0ID0ge1xuICBVcGxvYWQ6IF91cGxvYWQyLmRlZmF1bHQsXG4gIGNhblN0b3JlVVJMczogc3RvcmFnZS5jYW5TdG9yZVVSTHMsXG4gIGRlZmF1bHRPcHRpb25zOiBkZWZhdWx0T3B0aW9uc1xufTtcblxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgLy8gQnJvd3NlciBlbnZpcm9ubWVudCB1c2luZyBYTUxIdHRwUmVxdWVzdFxuICB2YXIgX3dpbmRvdyA9IHdpbmRvdyxcbiAgICAgIFhNTEh0dHBSZXF1ZXN0ID0gX3dpbmRvdy5YTUxIdHRwUmVxdWVzdCxcbiAgICAgIEJsb2IgPSBfd2luZG93LkJsb2I7XG5cblxuICBtb2R1bGVFeHBvcnQuaXNTdXBwb3J0ZWQgPSBYTUxIdHRwUmVxdWVzdCAmJiBCbG9iICYmIHR5cGVvZiBCbG9iLnByb3RvdHlwZS5zbGljZSA9PT0gXCJmdW5jdGlvblwiO1xufSBlbHNlIHtcbiAgLy8gTm9kZS5qcyBlbnZpcm9ubWVudCB1c2luZyBodHRwIG1vZHVsZVxuICBtb2R1bGVFeHBvcnQuaXNTdXBwb3J0ZWQgPSB0cnVlO1xuICAvLyBtYWtlIEZpbGVTdG9yYWdlIG1vZHVsZSBhdmFpbGFibGUgYXMgaXQgd2lsbCBub3QgYmUgc2V0IGJ5IGRlZmF1bHQuXG4gIG1vZHVsZUV4cG9ydC5GaWxlU3RvcmFnZSA9IHN0b3JhZ2UuRmlsZVN0b3JhZ2U7XG59XG5cbi8vIFRoZSB1c2FnZSBvZiB0aGUgY29tbW9uanMgZXhwb3J0aW5nIHN5bnRheCBpbnN0ZWFkIG9mIHRoZSBuZXcgRUNNQVNjcmlwdFxuLy8gb25lIGlzIGFjdHVhbGx5IGludGVkZWQgYW5kIHByZXZlbnRzIHdlaXJkIGJlaGF2aW91ciBpZiB3ZSBhcmUgdHJ5aW5nIHRvXG4vLyBpbXBvcnQgdGhpcyBtb2R1bGUgaW4gYW5vdGhlciBtb2R1bGUgdXNpbmcgQmFiZWwuXG5tb2R1bGUuZXhwb3J0cyA9IG1vZHVsZUV4cG9ydDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTsgLyogZ2xvYmFsIHdpbmRvdyAqL1xuXG5cbi8vIFdlIGltcG9ydCB0aGUgZmlsZXMgdXNlZCBpbnNpZGUgdGhlIE5vZGUgZW52aXJvbm1lbnQgd2hpY2ggYXJlIHJld3JpdHRlblxuLy8gZm9yIGJyb3dzZXJzIHVzaW5nIHRoZSBydWxlcyBkZWZpbmVkIGluIHRoZSBwYWNrYWdlLmpzb25cblxuXG52YXIgX2Vycm9yID0gcmVxdWlyZShcIi4vZXJyb3JcIik7XG5cbnZhciBfZXJyb3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZXJyb3IpO1xuXG52YXIgX2V4dGVuZCA9IHJlcXVpcmUoXCJleHRlbmRcIik7XG5cbnZhciBfZXh0ZW5kMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2V4dGVuZCk7XG5cbnZhciBfanNCYXNlID0gcmVxdWlyZShcImpzLWJhc2U2NFwiKTtcblxudmFyIF9yZXF1ZXN0ID0gcmVxdWlyZShcIi4vbm9kZS9yZXF1ZXN0XCIpO1xuXG52YXIgX3NvdXJjZSA9IHJlcXVpcmUoXCIuL25vZGUvc291cmNlXCIpO1xuXG52YXIgX3N0b3JhZ2UgPSByZXF1aXJlKFwiLi9ub2RlL3N0b3JhZ2VcIik7XG5cbnZhciBfZmluZ2VycHJpbnQgPSByZXF1aXJlKFwiLi9ub2RlL2ZpbmdlcnByaW50XCIpO1xuXG52YXIgX2ZpbmdlcnByaW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpbmdlcnByaW50KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICBlbmRwb2ludDogbnVsbCxcbiAgZmluZ2VycHJpbnQ6IF9maW5nZXJwcmludDIuZGVmYXVsdCxcbiAgcmVzdW1lOiB0cnVlLFxuICBvblByb2dyZXNzOiBudWxsLFxuICBvbkNodW5rQ29tcGxldGU6IG51bGwsXG4gIG9uU3VjY2VzczogbnVsbCxcbiAgb25FcnJvcjogbnVsbCxcbiAgaGVhZGVyczoge30sXG4gIGNodW5rU2l6ZTogSW5maW5pdHksXG4gIHdpdGhDcmVkZW50aWFsczogZmFsc2UsXG4gIHVwbG9hZFVybDogbnVsbCxcbiAgdXBsb2FkU2l6ZTogbnVsbCxcbiAgb3ZlcnJpZGVQYXRjaE1ldGhvZDogZmFsc2UsXG4gIHJldHJ5RGVsYXlzOiBudWxsLFxuICByZW1vdmVGaW5nZXJwcmludE9uU3VjY2VzczogZmFsc2UsXG4gIHVwbG9hZExlbmd0aERlZmVycmVkOiBmYWxzZSxcbiAgdXJsU3RvcmFnZTogbnVsbCxcbiAgZmlsZVJlYWRlcjogbnVsbCxcbiAgdXBsb2FkRGF0YUR1cmluZ0NyZWF0aW9uOiBmYWxzZVxufTtcblxudmFyIFVwbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gVXBsb2FkKGZpbGUsIG9wdGlvbnMpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXBsb2FkKTtcblxuICAgIHRoaXMub3B0aW9ucyA9ICgwLCBfZXh0ZW5kMi5kZWZhdWx0KSh0cnVlLCB7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgLy8gVGhlIHN0b3JhZ2UgbW9kdWxlIHVzZWQgdG8gc3RvcmUgVVJMc1xuICAgIHRoaXMuX3N0b3JhZ2UgPSB0aGlzLm9wdGlvbnMudXJsU3RvcmFnZTtcblxuICAgIC8vIFRoZSB1bmRlcmx5aW5nIEZpbGUvQmxvYiBvYmplY3RcbiAgICB0aGlzLmZpbGUgPSBmaWxlO1xuXG4gICAgLy8gVGhlIFVSTCBhZ2FpbnN0IHdoaWNoIHRoZSBmaWxlIHdpbGwgYmUgdXBsb2FkZWRcbiAgICB0aGlzLnVybCA9IG51bGw7XG5cbiAgICAvLyBUaGUgdW5kZXJseWluZyBYSFIgb2JqZWN0IGZvciB0aGUgY3VycmVudCBQQVRDSCByZXF1ZXN0XG4gICAgdGhpcy5feGhyID0gbnVsbDtcblxuICAgIC8vIFRoZSBmaW5nZXJwaW5ydCBmb3IgdGhlIGN1cnJlbnQgZmlsZSAoc2V0IGFmdGVyIHN0YXJ0KCkpXG4gICAgdGhpcy5fZmluZ2VycHJpbnQgPSBudWxsO1xuXG4gICAgLy8gVGhlIG9mZnNldCB1c2VkIGluIHRoZSBjdXJyZW50IFBBVENIIHJlcXVlc3RcbiAgICB0aGlzLl9vZmZzZXQgPSBudWxsO1xuXG4gICAgLy8gVHJ1ZSBpZiB0aGUgY3VycmVudCBQQVRDSCByZXF1ZXN0IGhhcyBiZWVuIGFib3J0ZWRcbiAgICB0aGlzLl9hYm9ydGVkID0gZmFsc2U7XG5cbiAgICAvLyBUaGUgZmlsZSdzIHNpemUgaW4gYnl0ZXNcbiAgICB0aGlzLl9zaXplID0gbnVsbDtcblxuICAgIC8vIFRoZSBTb3VyY2Ugb2JqZWN0IHdoaWNoIHdpbGwgd3JhcCBhcm91bmQgdGhlIGdpdmVuIGZpbGUgYW5kIHByb3ZpZGVzIHVzXG4gICAgLy8gd2l0aCBhIHVuaWZpZWQgaW50ZXJmYWNlIGZvciBnZXR0aW5nIGl0cyBzaXplIGFuZCBzbGljZSBjaHVua3MgZnJvbSBpdHNcbiAgICAvLyBjb250ZW50IGFsbG93aW5nIHVzIHRvIGVhc2lseSBoYW5kbGUgRmlsZXMsIEJsb2JzLCBCdWZmZXJzIGFuZCBTdHJlYW1zLlxuICAgIHRoaXMuX3NvdXJjZSA9IG51bGw7XG5cbiAgICAvLyBUaGUgY3VycmVudCBjb3VudCBvZiBhdHRlbXB0cyB3aGljaCBoYXZlIGJlZW4gbWFkZS4gTnVsbCBpbmRpY2F0ZXMgbm9uZS5cbiAgICB0aGlzLl9yZXRyeUF0dGVtcHQgPSAwO1xuXG4gICAgLy8gVGhlIHRpbWVvdXQncyBJRCB3aGljaCBpcyB1c2VkIHRvIGRlbGF5IHRoZSBuZXh0IHJldHJ5XG4gICAgdGhpcy5fcmV0cnlUaW1lb3V0ID0gbnVsbDtcblxuICAgIC8vIFRoZSBvZmZzZXQgb2YgdGhlIHJlbW90ZSB1cGxvYWQgYmVmb3JlIHRoZSBsYXRlc3QgYXR0ZW1wdCB3YXMgc3RhcnRlZC5cbiAgICB0aGlzLl9vZmZzZXRCZWZvcmVSZXRyeSA9IDA7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoVXBsb2FkLCBbe1xuICAgIGtleTogXCJzdGFydFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciBmaWxlID0gdGhpcy5maWxlO1xuXG4gICAgICBpZiAoIWZpbGUpIHtcbiAgICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogbm8gZmlsZSBvciBzdHJlYW0gdG8gdXBsb2FkIHByb3ZpZGVkXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5lbmRwb2ludCAmJiAhdGhpcy5vcHRpb25zLnVwbG9hZFVybCkge1xuICAgICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiBuZWl0aGVyIGFuIGVuZHBvaW50IG9yIGFuIHVwbG9hZCBVUkwgaXMgcHJvdmlkZWRcIikpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucmVzdW1lICYmIHRoaXMuX3N0b3JhZ2UgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9zdG9yYWdlID0gKDAsIF9zdG9yYWdlLmdldFN0b3JhZ2UpKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9zb3VyY2UpIHtcbiAgICAgICAgdGhpcy5fc3RhcnQodGhpcy5fc291cmNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBmaWxlUmVhZGVyID0gdGhpcy5vcHRpb25zLmZpbGVSZWFkZXIgfHwgX3NvdXJjZS5nZXRTb3VyY2U7XG4gICAgICAgIGZpbGVSZWFkZXIoZmlsZSwgdGhpcy5vcHRpb25zLmNodW5rU2l6ZSwgZnVuY3Rpb24gKGVyciwgc291cmNlKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgX3RoaXMuX2VtaXRFcnJvcihlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIF90aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgX3RoaXMuX3N0YXJ0KHNvdXJjZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJfc3RhcnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3N0YXJ0KHNvdXJjZSkge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIHZhciBmaWxlID0gdGhpcy5maWxlO1xuXG4gICAgICAvLyBGaXJzdCwgd2UgbG9vayBhdCB0aGUgdXBsb2FkTGVuZ3RoRGVmZXJyZWQgb3B0aW9uLlxuICAgICAgLy8gTmV4dCwgd2UgY2hlY2sgaWYgdGhlIGNhbGxlciBoYXMgc3VwcGxpZWQgYSBtYW51YWwgdXBsb2FkIHNpemUuXG4gICAgICAvLyBGaW5hbGx5LCB3ZSB0cnkgdG8gdXNlIHRoZSBjYWxjdWxhdGVkIHNpemUgZnJvbSB0aGUgc291cmNlIG9iamVjdC5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkTGVuZ3RoRGVmZXJyZWQpIHtcbiAgICAgICAgdGhpcy5fc2l6ZSA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy51cGxvYWRTaXplICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fc2l6ZSA9ICt0aGlzLm9wdGlvbnMudXBsb2FkU2l6ZTtcbiAgICAgICAgaWYgKGlzTmFOKHRoaXMuX3NpemUpKSB7XG4gICAgICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogY2Fubm90IGNvbnZlcnQgYHVwbG9hZFNpemVgIG9wdGlvbiBpbnRvIGEgbnVtYmVyXCIpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NpemUgPSBzb3VyY2Uuc2l6ZTtcbiAgICAgICAgaWYgKHRoaXMuX3NpemUgPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IGNhbm5vdCBhdXRvbWF0aWNhbGx5IGRlcml2ZSB1cGxvYWQncyBzaXplIGZyb20gaW5wdXQgYW5kIG11c3QgYmUgc3BlY2lmaWVkIG1hbnVhbGx5IHVzaW5nIHRoZSBgdXBsb2FkU2l6ZWAgb3B0aW9uXCIpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHJldHJ5RGVsYXlzID0gdGhpcy5vcHRpb25zLnJldHJ5RGVsYXlzO1xuICAgICAgaWYgKHJldHJ5RGVsYXlzICE9IG51bGwpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChyZXRyeURlbGF5cykgIT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgICAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IHRoZSBgcmV0cnlEZWxheXNgIG9wdGlvbiBtdXN0IGVpdGhlciBiZSBhbiBhcnJheSBvciBudWxsXCIpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGVycm9yQ2FsbGJhY2sgPSB0aGlzLm9wdGlvbnMub25FcnJvcjtcbiAgICAgICAgICB0aGlzLm9wdGlvbnMub25FcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIC8vIFJlc3RvcmUgdGhlIG9yaWdpbmFsIGVycm9yIGNhbGxiYWNrIHdoaWNoIG1heSBoYXZlIGJlZW4gc2V0LlxuICAgICAgICAgICAgX3RoaXMyLm9wdGlvbnMub25FcnJvciA9IGVycm9yQ2FsbGJhY2s7XG5cbiAgICAgICAgICAgIC8vIFdlIHdpbGwgcmVzZXQgdGhlIGF0dGVtcHQgY291bnRlciBpZlxuICAgICAgICAgICAgLy8gLSB3ZSB3ZXJlIGFscmVhZHkgYWJsZSB0byBjb25uZWN0IHRvIHRoZSBzZXJ2ZXIgKG9mZnNldCAhPSBudWxsKSBhbmRcbiAgICAgICAgICAgIC8vIC0gd2Ugd2VyZSBhYmxlIHRvIHVwbG9hZCBhIHNtYWxsIGNodW5rIG9mIGRhdGEgdG8gdGhlIHNlcnZlclxuICAgICAgICAgICAgdmFyIHNob3VsZFJlc2V0RGVsYXlzID0gX3RoaXMyLl9vZmZzZXQgIT0gbnVsbCAmJiBfdGhpczIuX29mZnNldCA+IF90aGlzMi5fb2Zmc2V0QmVmb3JlUmV0cnk7XG4gICAgICAgICAgICBpZiAoc2hvdWxkUmVzZXREZWxheXMpIHtcbiAgICAgICAgICAgICAgX3RoaXMyLl9yZXRyeUF0dGVtcHQgPSAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaXNPbmxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgXCJuYXZpZ2F0b3JcIiBpbiB3aW5kb3cgJiYgd2luZG93Lm5hdmlnYXRvci5vbkxpbmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgIGlzT25saW5lID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdlIG9ubHkgYXR0ZW1wdCBhIHJldHJ5IGlmXG4gICAgICAgICAgICAvLyAtIHdlIGRpZG4ndCBleGNlZWQgdGhlIG1heGl1bSBudW1iZXIgb2YgcmV0cmllcywgeWV0LCBhbmRcbiAgICAgICAgICAgIC8vIC0gdGhpcyBlcnJvciB3YXMgY2F1c2VkIGJ5IGEgcmVxdWVzdCBvciBpdCdzIHJlc3BvbnNlIGFuZFxuICAgICAgICAgICAgLy8gLSB0aGUgZXJyb3IgaXMgc2VydmVyIGVycm9yIChpLmUuIG5vIGEgc3RhdHVzIDR4eCBvciBhIDQwOSBvciA0MjMpIGFuZFxuICAgICAgICAgICAgLy8gLSB0aGUgYnJvd3NlciBkb2VzIG5vdCBpbmRpY2F0ZSB0aGF0IHdlIGFyZSBvZmZsaW5lXG4gICAgICAgICAgICB2YXIgc3RhdHVzID0gZXJyLm9yaWdpbmFsUmVxdWVzdCA/IGVyci5vcmlnaW5hbFJlcXVlc3Quc3RhdHVzIDogMDtcbiAgICAgICAgICAgIHZhciBpc1NlcnZlckVycm9yID0gIWluU3RhdHVzQ2F0ZWdvcnkoc3RhdHVzLCA0MDApIHx8IHN0YXR1cyA9PT0gNDA5IHx8IHN0YXR1cyA9PT0gNDIzO1xuICAgICAgICAgICAgdmFyIHNob3VsZFJldHJ5ID0gX3RoaXMyLl9yZXRyeUF0dGVtcHQgPCByZXRyeURlbGF5cy5sZW5ndGggJiYgZXJyLm9yaWdpbmFsUmVxdWVzdCAhPSBudWxsICYmIGlzU2VydmVyRXJyb3IgJiYgaXNPbmxpbmU7XG5cbiAgICAgICAgICAgIGlmICghc2hvdWxkUmV0cnkpIHtcbiAgICAgICAgICAgICAgX3RoaXMyLl9lbWl0RXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZGVsYXkgPSByZXRyeURlbGF5c1tfdGhpczIuX3JldHJ5QXR0ZW1wdCsrXTtcblxuICAgICAgICAgICAgX3RoaXMyLl9vZmZzZXRCZWZvcmVSZXRyeSA9IF90aGlzMi5fb2Zmc2V0O1xuICAgICAgICAgICAgX3RoaXMyLm9wdGlvbnMudXBsb2FkVXJsID0gX3RoaXMyLnVybDtcblxuICAgICAgICAgICAgX3RoaXMyLl9yZXRyeVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgX3RoaXMyLnN0YXJ0KCk7XG4gICAgICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSZXNldCB0aGUgYWJvcnRlZCBmbGFnIHdoZW4gdGhlIHVwbG9hZCBpcyBzdGFydGVkIG9yIGVsc2UgdGhlXG4gICAgICAvLyBfc3RhcnRVcGxvYWQgd2lsbCBzdG9wIGJlZm9yZSBzZW5kaW5nIGEgcmVxdWVzdCBpZiB0aGUgdXBsb2FkIGhhcyBiZWVuXG4gICAgICAvLyBhYm9ydGVkIHByZXZpb3VzbHkuXG4gICAgICB0aGlzLl9hYm9ydGVkID0gZmFsc2U7XG5cbiAgICAgIC8vIFRoZSB1cGxvYWQgaGFkIGJlZW4gc3RhcnRlZCBwcmV2aW91c2x5IGFuZCB3ZSBzaG91bGQgcmV1c2UgdGhpcyBVUkwuXG4gICAgICBpZiAodGhpcy51cmwgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9yZXN1bWVVcGxvYWQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBBIFVSTCBoYXMgbWFudWFsbHkgYmVlbiBzcGVjaWZpZWQsIHNvIHdlIHRyeSB0byByZXN1bWVcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkVXJsICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy51cmwgPSB0aGlzLm9wdGlvbnMudXBsb2FkVXJsO1xuICAgICAgICB0aGlzLl9yZXN1bWVVcGxvYWQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUcnkgdG8gZmluZCB0aGUgZW5kcG9pbnQgZm9yIHRoZSBmaWxlIGluIHRoZSBzdG9yYWdlXG4gICAgICBpZiAodGhpcy5faGFzU3RvcmFnZSgpKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5maW5nZXJwcmludChmaWxlLCB0aGlzLm9wdGlvbnMsIGZ1bmN0aW9uIChlcnIsIGZpbmdlcnByaW50VmFsdWUpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBfdGhpczIuX2VtaXRFcnJvcihlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIF90aGlzMi5fZmluZ2VycHJpbnQgPSBmaW5nZXJwcmludFZhbHVlO1xuICAgICAgICAgIF90aGlzMi5fc3RvcmFnZS5nZXRJdGVtKF90aGlzMi5fZmluZ2VycHJpbnQsIGZ1bmN0aW9uIChlcnIsIHJlc3VtZWRVcmwpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgX3RoaXMyLl9lbWl0RXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzdW1lZFVybCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIF90aGlzMi51cmwgPSByZXN1bWVkVXJsO1xuICAgICAgICAgICAgICBfdGhpczIuX3Jlc3VtZVVwbG9hZCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgX3RoaXMyLl9jcmVhdGVVcGxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBbiB1cGxvYWQgaGFzIG5vdCBzdGFydGVkIGZvciB0aGUgZmlsZSB5ZXQsIHNvIHdlIHN0YXJ0IGEgbmV3IG9uZVxuICAgICAgICB0aGlzLl9jcmVhdGVVcGxvYWQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiYWJvcnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWJvcnQoc2hvdWxkVGVybWluYXRlLCBjYikge1xuICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgIGlmICh0aGlzLl94aHIgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5feGhyLmFib3J0KCk7XG4gICAgICAgIHRoaXMuX3NvdXJjZS5jbG9zZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fYWJvcnRlZCA9IHRydWU7XG5cbiAgICAgIGlmICh0aGlzLl9yZXRyeVRpbWVvdXQgIT0gbnVsbCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmV0cnlUaW1lb3V0KTtcbiAgICAgICAgdGhpcy5fcmV0cnlUaW1lb3V0ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY2IgPSBjYiB8fCBmdW5jdGlvbiAoKSB7fTtcbiAgICAgIGlmIChzaG91bGRUZXJtaW5hdGUpIHtcbiAgICAgICAgVXBsb2FkLnRlcm1pbmF0ZSh0aGlzLnVybCwgdGhpcy5vcHRpb25zLCBmdW5jdGlvbiAoZXJyLCB4aHIpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2IoZXJyLCB4aHIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIF90aGlzMy5faGFzU3RvcmFnZSgpID8gX3RoaXMzLl9zdG9yYWdlLnJlbW92ZUl0ZW0oX3RoaXMzLl9maW5nZXJwcmludCwgY2IpIDogY2IoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYigpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJfaGFzU3RvcmFnZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfaGFzU3RvcmFnZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMucmVzdW1lICYmIHRoaXMuX3N0b3JhZ2U7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIl9lbWl0WGhyRXJyb3JcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2VtaXRYaHJFcnJvcih4aHIsIGVyciwgY2F1c2luZ0Vycikge1xuICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBfZXJyb3IyLmRlZmF1bHQoZXJyLCBjYXVzaW5nRXJyLCB4aHIpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiX2VtaXRFcnJvclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZW1pdEVycm9yKGVycikge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25FcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5vbkVycm9yKGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIl9lbWl0U3VjY2Vzc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZW1pdFN1Y2Nlc3MoKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vblN1Y2Nlc3MgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzLm9wdGlvbnMub25TdWNjZXNzKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHVibGlzaGVzIG5vdGlmaWNhdGlvbiB3aGVuIGRhdGEgaGFzIGJlZW4gc2VudCB0byB0aGUgc2VydmVyLiBUaGlzXG4gICAgICogZGF0YSBtYXkgbm90IGhhdmUgYmVlbiBhY2NlcHRlZCBieSB0aGUgc2VydmVyIHlldC5cbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGJ5dGVzU2VudCAgTnVtYmVyIG9mIGJ5dGVzIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGJ5dGVzVG90YWwgVG90YWwgbnVtYmVyIG9mIGJ5dGVzIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIl9lbWl0UHJvZ3Jlc3NcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2VtaXRQcm9ncmVzcyhieXRlc1NlbnQsIGJ5dGVzVG90YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uUHJvZ3Jlc3MgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzLm9wdGlvbnMub25Qcm9ncmVzcyhieXRlc1NlbnQsIGJ5dGVzVG90YWwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFB1Ymxpc2hlcyBub3RpZmljYXRpb24gd2hlbiBhIGNodW5rIG9mIGRhdGEgaGFzIGJlZW4gc2VudCB0byB0aGUgc2VydmVyXG4gICAgICogYW5kIGFjY2VwdGVkIGJ5IHRoZSBzZXJ2ZXIuXG4gICAgICogQHBhcmFtICB7bnVtYmVyfSBjaHVua1NpemUgIFNpemUgb2YgdGhlIGNodW5rIHRoYXQgd2FzIGFjY2VwdGVkIGJ5IHRoZVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIuXG4gICAgICogQHBhcmFtICB7bnVtYmVyfSBieXRlc0FjY2VwdGVkIFRvdGFsIG51bWJlciBvZiBieXRlcyB0aGF0IGhhdmUgYmVlblxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NlcHRlZCBieSB0aGUgc2VydmVyLlxuICAgICAqIEBwYXJhbSAge251bWJlcn0gYnl0ZXNUb3RhbCBUb3RhbCBudW1iZXIgb2YgYnl0ZXMgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiX2VtaXRDaHVua0NvbXBsZXRlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9lbWl0Q2h1bmtDb21wbGV0ZShjaHVua1NpemUsIGJ5dGVzQWNjZXB0ZWQsIGJ5dGVzVG90YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uQ2h1bmtDb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5vbkNodW5rQ29tcGxldGUoY2h1bmtTaXplLCBieXRlc0FjY2VwdGVkLCBieXRlc1RvdGFsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGhlYWRlcnMgdXNlZCBpbiB0aGUgcmVxdWVzdCBhbmQgdGhlIHdpdGhDcmVkZW50aWFscyBwcm9wZXJ0eVxuICAgICAqIGFzIGRlZmluZWQgaW4gdGhlIG9wdGlvbnNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3R9IHhoclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiX3NldHVwWEhSXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cFhIUih4aHIpIHtcbiAgICAgIHRoaXMuX3hociA9IHhocjtcbiAgICAgIHNldHVwWEhSKHhociwgdGhpcy5vcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgdXBsb2FkIHVzaW5nIHRoZSBjcmVhdGlvbiBleHRlbnNpb24gYnkgc2VuZGluZyBhIFBPU1RcbiAgICAgKiByZXF1ZXN0IHRvIHRoZSBlbmRwb2ludC4gQWZ0ZXIgc3VjY2Vzc2Z1bCBjcmVhdGlvbiB0aGUgZmlsZSB3aWxsIGJlXG4gICAgICogdXBsb2FkZWRcbiAgICAgKlxuICAgICAqIEBhcGkgcHJpdmF0ZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiX2NyZWF0ZVVwbG9hZFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfY3JlYXRlVXBsb2FkKCkge1xuICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmVuZHBvaW50KSB7XG4gICAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IHVuYWJsZSB0byBjcmVhdGUgdXBsb2FkIGJlY2F1c2Ugbm8gZW5kcG9pbnQgaXMgcHJvdmlkZWRcIikpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciB4aHIgPSAoMCwgX3JlcXVlc3QubmV3UmVxdWVzdCkoKTtcbiAgICAgIHhoci5vcGVuKFwiUE9TVFwiLCB0aGlzLm9wdGlvbnMuZW5kcG9pbnQsIHRydWUpO1xuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIWluU3RhdHVzQ2F0ZWdvcnkoeGhyLnN0YXR1cywgMjAwKSkge1xuICAgICAgICAgIF90aGlzNC5fZW1pdFhockVycm9yKHhociwgbmV3IEVycm9yKFwidHVzOiB1bmV4cGVjdGVkIHJlc3BvbnNlIHdoaWxlIGNyZWF0aW5nIHVwbG9hZFwiKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxvY2F0aW9uID0geGhyLmdldFJlc3BvbnNlSGVhZGVyKFwiTG9jYXRpb25cIik7XG4gICAgICAgIGlmIChsb2NhdGlvbiA9PSBudWxsKSB7XG4gICAgICAgICAgX3RoaXM0Ll9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IGludmFsaWQgb3IgbWlzc2luZyBMb2NhdGlvbiBoZWFkZXJcIikpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzNC51cmwgPSAoMCwgX3JlcXVlc3QucmVzb2x2ZVVybCkoX3RoaXM0Lm9wdGlvbnMuZW5kcG9pbnQsIGxvY2F0aW9uKTtcblxuICAgICAgICBpZiAoX3RoaXM0Ll9zaXplID09PSAwKSB7XG4gICAgICAgICAgLy8gTm90aGluZyB0byB1cGxvYWQgYW5kIGZpbGUgd2FzIHN1Y2Nlc3NmdWxseSBjcmVhdGVkXG4gICAgICAgICAgX3RoaXM0Ll9lbWl0U3VjY2VzcygpO1xuICAgICAgICAgIF90aGlzNC5fc291cmNlLmNsb3NlKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF90aGlzNC5faGFzU3RvcmFnZSgpKSB7XG4gICAgICAgICAgX3RoaXM0Ll9zdG9yYWdlLnNldEl0ZW0oX3RoaXM0Ll9maW5nZXJwcmludCwgX3RoaXM0LnVybCwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICBfdGhpczQuX2VtaXRFcnJvcihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF90aGlzNC5vcHRpb25zLnVwbG9hZERhdGFEdXJpbmdDcmVhdGlvbikge1xuICAgICAgICAgIF90aGlzNC5faGFuZGxlVXBsb2FkUmVzcG9uc2UoeGhyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfdGhpczQuX29mZnNldCA9IDA7XG4gICAgICAgICAgX3RoaXM0Ll9zdGFydFVwbG9hZCgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgX3RoaXM0Ll9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IGZhaWxlZCB0byBjcmVhdGUgdXBsb2FkXCIpLCBlcnIpO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5fc2V0dXBYSFIoeGhyKTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkTGVuZ3RoRGVmZXJyZWQpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJVcGxvYWQtRGVmZXItTGVuZ3RoXCIsIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJVcGxvYWQtTGVuZ3RoXCIsIHRoaXMuX3NpemUpO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgbWV0YWRhdGEgaWYgdmFsdWVzIGhhdmUgYmVlbiBhZGRlZFxuICAgICAgdmFyIG1ldGFkYXRhID0gZW5jb2RlTWV0YWRhdGEodGhpcy5vcHRpb25zLm1ldGFkYXRhKTtcbiAgICAgIGlmIChtZXRhZGF0YSAhPT0gXCJcIikge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIlVwbG9hZC1NZXRhZGF0YVwiLCBtZXRhZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkRGF0YUR1cmluZ0NyZWF0aW9uICYmICF0aGlzLm9wdGlvbnMudXBsb2FkTGVuZ3RoRGVmZXJyZWQpIHtcbiAgICAgICAgdGhpcy5fb2Zmc2V0ID0gMDtcbiAgICAgICAgdGhpcy5fYWRkQ2h1bmtUb1JlcXVlc3QoeGhyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHhoci5zZW5kKG51bGwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgICogVHJ5IHRvIHJlc3VtZSBhbiBleGlzdGluZyB1cGxvYWQuIEZpcnN0IGEgSEVBRCByZXF1ZXN0IHdpbGwgYmUgc2VudFxuICAgICAqIHRvIHJldHJpZXZlIHRoZSBvZmZzZXQuIElmIHRoZSByZXF1ZXN0IGZhaWxzIGEgbmV3IHVwbG9hZCB3aWxsIGJlXG4gICAgICogY3JlYXRlZC4gSW4gdGhlIGNhc2Ugb2YgYSBzdWNjZXNzZnVsIHJlc3BvbnNlIHRoZSBmaWxlIHdpbGwgYmUgdXBsb2FkZWQuXG4gICAgICpcbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIl9yZXN1bWVVcGxvYWRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3Jlc3VtZVVwbG9hZCgpIHtcbiAgICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgICB2YXIgeGhyID0gKDAsIF9yZXF1ZXN0Lm5ld1JlcXVlc3QpKCk7XG4gICAgICB4aHIub3BlbihcIkhFQURcIiwgdGhpcy51cmwsIHRydWUpO1xuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIWluU3RhdHVzQ2F0ZWdvcnkoeGhyLnN0YXR1cywgMjAwKSkge1xuICAgICAgICAgIGlmIChfdGhpczUuX2hhc1N0b3JhZ2UoKSAmJiBpblN0YXR1c0NhdGVnb3J5KHhoci5zdGF0dXMsIDQwMCkpIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBzdG9yZWQgZmluZ2VycHJpbnQgYW5kIGNvcnJlc3BvbmRpbmcgZW5kcG9pbnQsXG4gICAgICAgICAgICAvLyBvbiBjbGllbnQgZXJyb3JzIHNpbmNlIHRoZSBmaWxlIGNhbiBub3QgYmUgZm91bmRcbiAgICAgICAgICAgIF90aGlzNS5fc3RvcmFnZS5yZW1vdmVJdGVtKF90aGlzNS5fZmluZ2VycHJpbnQsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIF90aGlzNS5fZW1pdEVycm9yKGVycik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHRoZSB1cGxvYWQgaXMgbG9ja2VkIChpbmRpY2F0ZWQgYnkgdGhlIDQyMyBMb2NrZWQgc3RhdHVzIGNvZGUpLCB3ZVxuICAgICAgICAgIC8vIGVtaXQgYW4gZXJyb3IgaW5zdGVhZCBvZiBkaXJlY3RseSBzdGFydGluZyBhIG5ldyB1cGxvYWQuIFRoaXMgd2F5IHRoZVxuICAgICAgICAgIC8vIHJldHJ5IGxvZ2ljIGNhbiBjYXRjaCB0aGUgZXJyb3IgYW5kIHdpbGwgcmV0cnkgdGhlIHVwbG9hZC4gQW4gdXBsb2FkXG4gICAgICAgICAgLy8gaXMgdXN1YWxseSBsb2NrZWQgZm9yIGEgc2hvcnQgcGVyaW9kIG9mIHRpbWUgYW5kIHdpbGwgYmUgYXZhaWxhYmxlXG4gICAgICAgICAgLy8gYWZ0ZXJ3YXJkcy5cbiAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gNDIzKSB7XG4gICAgICAgICAgICBfdGhpczUuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogdXBsb2FkIGlzIGN1cnJlbnRseSBsb2NrZWQ7IHJldHJ5IGxhdGVyXCIpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIV90aGlzNS5vcHRpb25zLmVuZHBvaW50KSB7XG4gICAgICAgICAgICAvLyBEb24ndCBhdHRlbXB0IHRvIGNyZWF0ZSBhIG5ldyB1cGxvYWQgaWYgbm8gZW5kcG9pbnQgaXMgcHJvdmlkZWQuXG4gICAgICAgICAgICBfdGhpczUuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogdW5hYmxlIHRvIHJlc3VtZSB1cGxvYWQgKG5ldyB1cGxvYWQgY2Fubm90IGJlIGNyZWF0ZWQgd2l0aG91dCBhbiBlbmRwb2ludClcIikpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFRyeSB0byBjcmVhdGUgYSBuZXcgdXBsb2FkXG4gICAgICAgICAgX3RoaXM1LnVybCA9IG51bGw7XG4gICAgICAgICAgX3RoaXM1Ll9jcmVhdGVVcGxvYWQoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb2Zmc2V0ID0gcGFyc2VJbnQoeGhyLmdldFJlc3BvbnNlSGVhZGVyKFwiVXBsb2FkLU9mZnNldFwiKSwgMTApO1xuICAgICAgICBpZiAoaXNOYU4ob2Zmc2V0KSkge1xuICAgICAgICAgIF90aGlzNS5fZW1pdFhockVycm9yKHhociwgbmV3IEVycm9yKFwidHVzOiBpbnZhbGlkIG9yIG1pc3Npbmcgb2Zmc2V0IHZhbHVlXCIpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gcGFyc2VJbnQoeGhyLmdldFJlc3BvbnNlSGVhZGVyKFwiVXBsb2FkLUxlbmd0aFwiKSwgMTApO1xuICAgICAgICBpZiAoaXNOYU4obGVuZ3RoKSAmJiAhX3RoaXM1Lm9wdGlvbnMudXBsb2FkTGVuZ3RoRGVmZXJyZWQpIHtcbiAgICAgICAgICBfdGhpczUuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogaW52YWxpZCBvciBtaXNzaW5nIGxlbmd0aCB2YWx1ZVwiKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXBsb2FkIGhhcyBhbHJlYWR5IGJlZW4gY29tcGxldGVkIGFuZCB3ZSBkbyBub3QgbmVlZCB0byBzZW5kIGFkZGl0aW9uYWxcbiAgICAgICAgLy8gZGF0YSB0byB0aGUgc2VydmVyXG4gICAgICAgIGlmIChvZmZzZXQgPT09IGxlbmd0aCkge1xuICAgICAgICAgIF90aGlzNS5fZW1pdFByb2dyZXNzKGxlbmd0aCwgbGVuZ3RoKTtcbiAgICAgICAgICBfdGhpczUuX2VtaXRTdWNjZXNzKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgX3RoaXM1Ll9vZmZzZXQgPSBvZmZzZXQ7XG4gICAgICAgIF90aGlzNS5fc3RhcnRVcGxvYWQoKTtcbiAgICAgIH07XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICBfdGhpczUuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogZmFpbGVkIHRvIHJlc3VtZSB1cGxvYWRcIiksIGVycik7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLl9zZXR1cFhIUih4aHIpO1xuICAgICAgeGhyLnNlbmQobnVsbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgdXBsb2FkaW5nIHRoZSBmaWxlIHVzaW5nIFBBVENIIHJlcXVlc3RzLiBUaGUgZmlsZSB3aWxsIGJlIGRpdmlkZWRcbiAgICAgKiBpbnRvIGNodW5rcyBhcyBzcGVjaWZpZWQgaW4gdGhlIGNodW5rU2l6ZSBvcHRpb24uIER1cmluZyB0aGUgdXBsb2FkXG4gICAgICogdGhlIG9uUHJvZ3Jlc3MgZXZlbnQgaGFuZGxlciBtYXkgYmUgaW52b2tlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKlxuICAgICAqIEBhcGkgcHJpdmF0ZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiX3N0YXJ0VXBsb2FkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9zdGFydFVwbG9hZCgpIHtcbiAgICAgIHZhciBfdGhpczYgPSB0aGlzO1xuXG4gICAgICAvLyBJZiB0aGUgdXBsb2FkIGhhcyBiZWVuIGFib3J0ZWQsIHdlIHdpbGwgbm90IHNlbmQgdGhlIG5leHQgUEFUQ0ggcmVxdWVzdC5cbiAgICAgIC8vIFRoaXMgaXMgaW1wb3J0YW50IGlmIHRoZSBhYm9ydCBtZXRob2Qgd2FzIGNhbGxlZCBkdXJpbmcgYSBjYWxsYmFjaywgc3VjaFxuICAgICAgLy8gYXMgb25DaHVua0NvbXBsZXRlIG9yIG9uUHJvZ3Jlc3MuXG4gICAgICBpZiAodGhpcy5fYWJvcnRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciB4aHIgPSAoMCwgX3JlcXVlc3QubmV3UmVxdWVzdCkoKTtcblxuICAgICAgLy8gU29tZSBicm93c2VyIGFuZCBzZXJ2ZXJzIG1heSBub3Qgc3VwcG9ydCB0aGUgUEFUQ0ggbWV0aG9kLiBGb3IgdGhvc2VcbiAgICAgIC8vIGNhc2VzLCB5b3UgY2FuIHRlbGwgdHVzLWpzLWNsaWVudCB0byB1c2UgYSBQT1NUIHJlcXVlc3Qgd2l0aCB0aGVcbiAgICAgIC8vIFgtSFRUUC1NZXRob2QtT3ZlcnJpZGUgaGVhZGVyIGZvciBzaW11bGF0aW5nIGEgUEFUQ0ggcmVxdWVzdC5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMub3ZlcnJpZGVQYXRjaE1ldGhvZCkge1xuICAgICAgICB4aHIub3BlbihcIlBPU1RcIiwgdGhpcy51cmwsIHRydWUpO1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIlgtSFRUUC1NZXRob2QtT3ZlcnJpZGVcIiwgXCJQQVRDSFwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHhoci5vcGVuKFwiUEFUQ0hcIiwgdGhpcy51cmwsIHRydWUpO1xuICAgICAgfVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIWluU3RhdHVzQ2F0ZWdvcnkoeGhyLnN0YXR1cywgMjAwKSkge1xuICAgICAgICAgIF90aGlzNi5fZW1pdFhockVycm9yKHhociwgbmV3IEVycm9yKFwidHVzOiB1bmV4cGVjdGVkIHJlc3BvbnNlIHdoaWxlIHVwbG9hZGluZyBjaHVua1wiKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgX3RoaXM2Ll9oYW5kbGVVcGxvYWRSZXNwb25zZSh4aHIpO1xuICAgICAgfTtcblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIC8vIERvbid0IGVtaXQgYW4gZXJyb3IgaWYgdGhlIHVwbG9hZCB3YXMgYWJvcnRlZCBtYW51YWxseVxuICAgICAgICBpZiAoX3RoaXM2Ll9hYm9ydGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgX3RoaXM2Ll9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IGZhaWxlZCB0byB1cGxvYWQgY2h1bmsgYXQgb2Zmc2V0IFwiICsgX3RoaXM2Ll9vZmZzZXQpLCBlcnIpO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5fc2V0dXBYSFIoeGhyKTtcblxuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJVcGxvYWQtT2Zmc2V0XCIsIHRoaXMuX29mZnNldCk7XG4gICAgICB0aGlzLl9hZGRDaHVua1RvUmVxdWVzdCh4aHIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIF9hZGRDaHVua3RvUmVxdWVzdCByZWFkcyBhIGNodW5rIGZyb20gdGhlIHNvdXJjZSBhbmQgc2VuZHMgaXQgdXNpbmcgdGhlXG4gICAgICogc3VwcGxpZWQgWEhSIG9iamVjdC4gSXQgd2lsbCBub3QgaGFuZGxlIHRoZSByZXNwb25zZS5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIl9hZGRDaHVua1RvUmVxdWVzdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfYWRkQ2h1bmtUb1JlcXVlc3QoeGhyKSB7XG4gICAgICB2YXIgX3RoaXM3ID0gdGhpcztcblxuICAgICAgLy8gVGVzdCBzdXBwb3J0IGZvciBwcm9ncmVzcyBldmVudHMgYmVmb3JlIGF0dGFjaGluZyBhbiBldmVudCBsaXN0ZW5lclxuICAgICAgaWYgKFwidXBsb2FkXCIgaW4geGhyKSB7XG4gICAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgaWYgKCFlLmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBfdGhpczcuX2VtaXRQcm9ncmVzcyhzdGFydCArIGUubG9hZGVkLCBfdGhpczcuX3NpemUpO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL29mZnNldCtvY3RldC1zdHJlYW1cIik7XG5cbiAgICAgIHZhciBzdGFydCA9IHRoaXMuX29mZnNldDtcbiAgICAgIHZhciBlbmQgPSB0aGlzLl9vZmZzZXQgKyB0aGlzLm9wdGlvbnMuY2h1bmtTaXplO1xuXG4gICAgICAvLyBUaGUgc3BlY2lmaWVkIGNodW5rU2l6ZSBtYXkgYmUgSW5maW5pdHkgb3IgdGhlIGNhbGNsdWF0ZWQgZW5kIHBvc2l0aW9uXG4gICAgICAvLyBtYXkgZXhjZWVkIHRoZSBmaWxlJ3Mgc2l6ZS4gSW4gYm90aCBjYXNlcywgd2UgbGltaXQgdGhlIGVuZCBwb3NpdGlvbiB0b1xuICAgICAgLy8gdGhlIGlucHV0J3MgdG90YWwgc2l6ZSBmb3Igc2ltcGxlciBjYWxjdWxhdGlvbnMgYW5kIGNvcnJlY3RuZXNzLlxuICAgICAgaWYgKChlbmQgPT09IEluZmluaXR5IHx8IGVuZCA+IHRoaXMuX3NpemUpICYmICF0aGlzLm9wdGlvbnMudXBsb2FkTGVuZ3RoRGVmZXJyZWQpIHtcbiAgICAgICAgZW5kID0gdGhpcy5fc2l6ZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc291cmNlLnNsaWNlKHN0YXJ0LCBlbmQsIGZ1bmN0aW9uIChlcnIsIHZhbHVlLCBjb21wbGV0ZSkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgX3RoaXM3Ll9lbWl0RXJyb3IoZXJyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX3RoaXM3Lm9wdGlvbnMudXBsb2FkTGVuZ3RoRGVmZXJyZWQpIHtcbiAgICAgICAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgICAgICAgIF90aGlzNy5fc2l6ZSA9IF90aGlzNy5fb2Zmc2V0ICsgKHZhbHVlICYmIHZhbHVlLnNpemUgPyB2YWx1ZS5zaXplIDogMCk7XG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIlVwbG9hZC1MZW5ndGhcIiwgX3RoaXM3Ll9zaXplKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICB4aHIuc2VuZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHhoci5zZW5kKHZhbHVlKTtcbiAgICAgICAgICBfdGhpczcuX2VtaXRQcm9ncmVzcyhfdGhpczcuX29mZnNldCwgX3RoaXM3Ll9zaXplKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogX2hhbmRsZVVwbG9hZFJlc3BvbnNlIGlzIHVzZWQgYnkgcmVxdWVzdHMgdGhhdCBoYXZlbiBiZWVuIHNlbnQgdXNpbmcgX2FkZENodW5rVG9SZXF1ZXN0XG4gICAgICogYW5kIGFscmVhZHkgaGF2ZSByZWNlaXZlZCBhIHJlc3BvbnNlLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiX2hhbmRsZVVwbG9hZFJlc3BvbnNlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVVcGxvYWRSZXNwb25zZSh4aHIpIHtcbiAgICAgIHZhciBfdGhpczggPSB0aGlzO1xuXG4gICAgICB2YXIgb2Zmc2V0ID0gcGFyc2VJbnQoeGhyLmdldFJlc3BvbnNlSGVhZGVyKFwiVXBsb2FkLU9mZnNldFwiKSwgMTApO1xuICAgICAgaWYgKGlzTmFOKG9mZnNldCkpIHtcbiAgICAgICAgdGhpcy5fZW1pdFhockVycm9yKHhociwgbmV3IEVycm9yKFwidHVzOiBpbnZhbGlkIG9yIG1pc3Npbmcgb2Zmc2V0IHZhbHVlXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9lbWl0UHJvZ3Jlc3Mob2Zmc2V0LCB0aGlzLl9zaXplKTtcbiAgICAgIHRoaXMuX2VtaXRDaHVua0NvbXBsZXRlKG9mZnNldCAtIHRoaXMuX29mZnNldCwgb2Zmc2V0LCB0aGlzLl9zaXplKTtcblxuICAgICAgdGhpcy5fb2Zmc2V0ID0gb2Zmc2V0O1xuXG4gICAgICBpZiAob2Zmc2V0ID09IHRoaXMuX3NpemUpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZW1vdmVGaW5nZXJwcmludE9uU3VjY2VzcyAmJiB0aGlzLm9wdGlvbnMucmVzdW1lKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIHN0b3JlZCBmaW5nZXJwcmludCBhbmQgY29ycmVzcG9uZGluZyBlbmRwb2ludC4gVGhpcyBjYXVzZXNcbiAgICAgICAgICAvLyBuZXcgdXBsb2FkIG9mIHRoZSBzYW1lIGZpbGUgbXVzdCBiZSB0cmVhdGVkIGFzIGEgZGlmZmVyZW50IGZpbGUuXG4gICAgICAgICAgdGhpcy5fc3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuX2ZpbmdlcnByaW50LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIF90aGlzOC5fZW1pdEVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBZYXksIGZpbmFsbHkgZG9uZSA6KVxuICAgICAgICB0aGlzLl9lbWl0U3VjY2VzcygpO1xuICAgICAgICB0aGlzLl9zb3VyY2UuY2xvc2UoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zdGFydFVwbG9hZCgpO1xuICAgIH1cbiAgfV0sIFt7XG4gICAga2V5OiBcInRlcm1pbmF0ZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0ZXJtaW5hdGUodXJsLCBvcHRpb25zLCBjYikge1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGNiICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHVzOiBhIGNhbGxiYWNrIGZ1bmN0aW9uIG11c3QgYmUgc3BlY2lmaWVkXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBjYiA9IG9wdGlvbnM7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cblxuICAgICAgdmFyIHhociA9ICgwLCBfcmVxdWVzdC5uZXdSZXF1ZXN0KSgpO1xuICAgICAgeGhyLm9wZW4oXCJERUxFVEVcIiwgdXJsLCB0cnVlKTtcblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHhoci5zdGF0dXMgIT09IDIwNCkge1xuICAgICAgICAgIGNiKG5ldyBfZXJyb3IyLmRlZmF1bHQobmV3IEVycm9yKFwidHVzOiB1bmV4cGVjdGVkIHJlc3BvbnNlIHdoaWxlIHRlcm1pbmF0aW5nIHVwbG9hZFwiKSwgbnVsbCwgeGhyKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2IoKTtcbiAgICAgIH07XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICBjYihuZXcgX2Vycm9yMi5kZWZhdWx0KGVyciwgbmV3IEVycm9yKFwidHVzOiBmYWlsZWQgdG8gdGVybWluYXRlIHVwbG9hZFwiKSwgeGhyKSk7XG4gICAgICB9O1xuXG4gICAgICBzZXR1cFhIUih4aHIsIG9wdGlvbnMpO1xuICAgICAgeGhyLnNlbmQobnVsbCk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFVwbG9hZDtcbn0oKTtcblxuZnVuY3Rpb24gZW5jb2RlTWV0YWRhdGEobWV0YWRhdGEpIHtcbiAgdmFyIGVuY29kZWQgPSBbXTtcblxuICBmb3IgKHZhciBrZXkgaW4gbWV0YWRhdGEpIHtcbiAgICBlbmNvZGVkLnB1c2goa2V5ICsgXCIgXCIgKyBfanNCYXNlLkJhc2U2NC5lbmNvZGUobWV0YWRhdGFba2V5XSkpO1xuICB9XG5cbiAgcmV0dXJuIGVuY29kZWQuam9pbihcIixcIik7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBzdGF0dXMgaXMgaW4gdGhlIHJhbmdlIG9mIHRoZSBleHBlY3RlZCBjYXRlZ29yeS5cbiAqIEZvciBleGFtcGxlLCBvbmx5IGEgc3RhdHVzIGJldHdlZW4gMjAwIGFuZCAyOTkgd2lsbCBzYXRpc2Z5IHRoZSBjYXRlZ29yeSAyMDAuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGluU3RhdHVzQ2F0ZWdvcnkoc3RhdHVzLCBjYXRlZ29yeSkge1xuICByZXR1cm4gc3RhdHVzID49IGNhdGVnb3J5ICYmIHN0YXR1cyA8IGNhdGVnb3J5ICsgMTAwO1xufVxuXG5mdW5jdGlvbiBzZXR1cFhIUih4aHIsIG9wdGlvbnMpIHtcbiAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJUdXMtUmVzdW1hYmxlXCIsIFwiMS4wLjBcIik7XG4gIHZhciBoZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIHx8IHt9O1xuXG4gIGZvciAodmFyIG5hbWUgaW4gaGVhZGVycykge1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIGhlYWRlcnNbbmFtZV0pO1xuICB9XG5cbiAgeGhyLndpdGhDcmVkZW50aWFscyA9IG9wdGlvbnMud2l0aENyZWRlbnRpYWxzO1xufVxuXG5VcGxvYWQuZGVmYXVsdE9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcblxuZXhwb3J0cy5kZWZhdWx0ID0gVXBsb2FkOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHJlcXVpcmVkID0gcmVxdWlyZSgncmVxdWlyZXMtcG9ydCcpXG4gICwgcXMgPSByZXF1aXJlKCdxdWVyeXN0cmluZ2lmeScpXG4gICwgc2xhc2hlcyA9IC9eW0EtWmEtel1bQS1aYS16MC05Ky0uXSo6XFwvXFwvL1xuICAsIHByb3RvY29scmUgPSAvXihbYS16XVthLXowLTkuKy1dKjopPyhcXC9cXC8pPyhbXFxTXFxzXSopL2lcbiAgLCB3aGl0ZXNwYWNlID0gJ1tcXFxceDA5XFxcXHgwQVxcXFx4MEJcXFxceDBDXFxcXHgwRFxcXFx4MjBcXFxceEEwXFxcXHUxNjgwXFxcXHUxODBFXFxcXHUyMDAwXFxcXHUyMDAxXFxcXHUyMDAyXFxcXHUyMDAzXFxcXHUyMDA0XFxcXHUyMDA1XFxcXHUyMDA2XFxcXHUyMDA3XFxcXHUyMDA4XFxcXHUyMDA5XFxcXHUyMDBBXFxcXHUyMDJGXFxcXHUyMDVGXFxcXHUzMDAwXFxcXHUyMDI4XFxcXHUyMDI5XFxcXHVGRUZGXSdcbiAgLCBsZWZ0ID0gbmV3IFJlZ0V4cCgnXicrIHdoaXRlc3BhY2UgKycrJyk7XG5cbi8qKlxuICogVHJpbSBhIGdpdmVuIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFN0cmluZyB0byB0cmltLlxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiB0cmltTGVmdChzdHIpIHtcbiAgcmV0dXJuIChzdHIgPyBzdHIgOiAnJykudG9TdHJpbmcoKS5yZXBsYWNlKGxlZnQsICcnKTtcbn1cblxuLyoqXG4gKiBUaGVzZSBhcmUgdGhlIHBhcnNlIHJ1bGVzIGZvciB0aGUgVVJMIHBhcnNlciwgaXQgaW5mb3JtcyB0aGUgcGFyc2VyXG4gKiBhYm91dDpcbiAqXG4gKiAwLiBUaGUgY2hhciBpdCBOZWVkcyB0byBwYXJzZSwgaWYgaXQncyBhIHN0cmluZyBpdCBzaG91bGQgYmUgZG9uZSB1c2luZ1xuICogICAgaW5kZXhPZiwgUmVnRXhwIHVzaW5nIGV4ZWMgYW5kIE5hTiBtZWFucyBzZXQgYXMgY3VycmVudCB2YWx1ZS5cbiAqIDEuIFRoZSBwcm9wZXJ0eSB3ZSBzaG91bGQgc2V0IHdoZW4gcGFyc2luZyB0aGlzIHZhbHVlLlxuICogMi4gSW5kaWNhdGlvbiBpZiBpdCdzIGJhY2t3YXJkcyBvciBmb3J3YXJkIHBhcnNpbmcsIHdoZW4gc2V0IGFzIG51bWJlciBpdCdzXG4gKiAgICB0aGUgdmFsdWUgb2YgZXh0cmEgY2hhcnMgdGhhdCBzaG91bGQgYmUgc3BsaXQgb2ZmLlxuICogMy4gSW5oZXJpdCBmcm9tIGxvY2F0aW9uIGlmIG5vbiBleGlzdGluZyBpbiB0aGUgcGFyc2VyLlxuICogNC4gYHRvTG93ZXJDYXNlYCB0aGUgcmVzdWx0aW5nIHZhbHVlLlxuICovXG52YXIgcnVsZXMgPSBbXG4gIFsnIycsICdoYXNoJ10sICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXh0cmFjdCBmcm9tIHRoZSBiYWNrLlxuICBbJz8nLCAncXVlcnknXSwgICAgICAgICAgICAgICAgICAgICAgIC8vIEV4dHJhY3QgZnJvbSB0aGUgYmFjay5cbiAgZnVuY3Rpb24gc2FuaXRpemUoYWRkcmVzcykgeyAgICAgICAgICAvLyBTYW5pdGl6ZSB3aGF0IGlzIGxlZnQgb2YgdGhlIGFkZHJlc3NcbiAgICByZXR1cm4gYWRkcmVzcy5yZXBsYWNlKCdcXFxcJywgJy8nKTtcbiAgfSxcbiAgWycvJywgJ3BhdGhuYW1lJ10sICAgICAgICAgICAgICAgICAgICAvLyBFeHRyYWN0IGZyb20gdGhlIGJhY2suXG4gIFsnQCcsICdhdXRoJywgMV0sICAgICAgICAgICAgICAgICAgICAgLy8gRXh0cmFjdCBmcm9tIHRoZSBmcm9udC5cbiAgW05hTiwgJ2hvc3QnLCB1bmRlZmluZWQsIDEsIDFdLCAgICAgICAvLyBTZXQgbGVmdCBvdmVyIHZhbHVlLlxuICBbLzooXFxkKykkLywgJ3BvcnQnLCB1bmRlZmluZWQsIDFdLCAgICAvLyBSZWdFeHAgdGhlIGJhY2suXG4gIFtOYU4sICdob3N0bmFtZScsIHVuZGVmaW5lZCwgMSwgMV0gICAgLy8gU2V0IGxlZnQgb3Zlci5cbl07XG5cbi8qKlxuICogVGhlc2UgcHJvcGVydGllcyBzaG91bGQgbm90IGJlIGNvcGllZCBvciBpbmhlcml0ZWQgZnJvbS4gVGhpcyBpcyBvbmx5IG5lZWRlZFxuICogZm9yIGFsbCBub24gYmxvYiBVUkwncyBhcyBhIGJsb2IgVVJMIGRvZXMgbm90IGluY2x1ZGUgYSBoYXNoLCBvbmx5IHRoZVxuICogb3JpZ2luLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKiBAcHJpdmF0ZVxuICovXG52YXIgaWdub3JlID0geyBoYXNoOiAxLCBxdWVyeTogMSB9O1xuXG4vKipcbiAqIFRoZSBsb2NhdGlvbiBvYmplY3QgZGlmZmVycyB3aGVuIHlvdXIgY29kZSBpcyBsb2FkZWQgdGhyb3VnaCBhIG5vcm1hbCBwYWdlLFxuICogV29ya2VyIG9yIHRocm91Z2ggYSB3b3JrZXIgdXNpbmcgYSBibG9iLiBBbmQgd2l0aCB0aGUgYmxvYmJsZSBiZWdpbnMgdGhlXG4gKiB0cm91YmxlIGFzIHRoZSBsb2NhdGlvbiBvYmplY3Qgd2lsbCBjb250YWluIHRoZSBVUkwgb2YgdGhlIGJsb2IsIG5vdCB0aGVcbiAqIGxvY2F0aW9uIG9mIHRoZSBwYWdlIHdoZXJlIG91ciBjb2RlIGlzIGxvYWRlZCBpbi4gVGhlIGFjdHVhbCBvcmlnaW4gaXNcbiAqIGVuY29kZWQgaW4gdGhlIGBwYXRobmFtZWAgc28gd2UgY2FuIHRoYW5rZnVsbHkgZ2VuZXJhdGUgYSBnb29kIFwiZGVmYXVsdFwiXG4gKiBsb2NhdGlvbiBmcm9tIGl0IHNvIHdlIGNhbiBnZW5lcmF0ZSBwcm9wZXIgcmVsYXRpdmUgVVJMJ3MgYWdhaW4uXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBsb2MgT3B0aW9uYWwgZGVmYXVsdCBsb2NhdGlvbiBvYmplY3QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBsb2xjYXRpb24gb2JqZWN0LlxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiBsb2xjYXRpb24obG9jKSB7XG4gIHZhciBnbG9iYWxWYXI7XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSBnbG9iYWxWYXIgPSB3aW5kb3c7XG4gIGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSBnbG9iYWxWYXIgPSBnbG9iYWw7XG4gIGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykgZ2xvYmFsVmFyID0gc2VsZjtcbiAgZWxzZSBnbG9iYWxWYXIgPSB7fTtcblxuICB2YXIgbG9jYXRpb24gPSBnbG9iYWxWYXIubG9jYXRpb24gfHwge307XG4gIGxvYyA9IGxvYyB8fCBsb2NhdGlvbjtcblxuICB2YXIgZmluYWxkZXN0aW5hdGlvbiA9IHt9XG4gICAgLCB0eXBlID0gdHlwZW9mIGxvY1xuICAgICwga2V5O1xuXG4gIGlmICgnYmxvYjonID09PSBsb2MucHJvdG9jb2wpIHtcbiAgICBmaW5hbGRlc3RpbmF0aW9uID0gbmV3IFVybCh1bmVzY2FwZShsb2MucGF0aG5hbWUpLCB7fSk7XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT09IHR5cGUpIHtcbiAgICBmaW5hbGRlc3RpbmF0aW9uID0gbmV3IFVybChsb2MsIHt9KTtcbiAgICBmb3IgKGtleSBpbiBpZ25vcmUpIGRlbGV0ZSBmaW5hbGRlc3RpbmF0aW9uW2tleV07XG4gIH0gZWxzZSBpZiAoJ29iamVjdCcgPT09IHR5cGUpIHtcbiAgICBmb3IgKGtleSBpbiBsb2MpIHtcbiAgICAgIGlmIChrZXkgaW4gaWdub3JlKSBjb250aW51ZTtcbiAgICAgIGZpbmFsZGVzdGluYXRpb25ba2V5XSA9IGxvY1trZXldO1xuICAgIH1cblxuICAgIGlmIChmaW5hbGRlc3RpbmF0aW9uLnNsYXNoZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZmluYWxkZXN0aW5hdGlvbi5zbGFzaGVzID0gc2xhc2hlcy50ZXN0KGxvYy5ocmVmKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmluYWxkZXN0aW5hdGlvbjtcbn1cblxuLyoqXG4gKiBAdHlwZWRlZiBQcm90b2NvbEV4dHJhY3RcbiAqIEB0eXBlIE9iamVjdFxuICogQHByb3BlcnR5IHtTdHJpbmd9IHByb3RvY29sIFByb3RvY29sIG1hdGNoZWQgaW4gdGhlIFVSTCwgaW4gbG93ZXJjYXNlLlxuICogQHByb3BlcnR5IHtCb29sZWFufSBzbGFzaGVzIGB0cnVlYCBpZiBwcm90b2NvbCBpcyBmb2xsb3dlZCBieSBcIi8vXCIsIGVsc2UgYGZhbHNlYC5cbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSByZXN0IFJlc3Qgb2YgdGhlIFVSTCB0aGF0IGlzIG5vdCBwYXJ0IG9mIHRoZSBwcm90b2NvbC5cbiAqL1xuXG4vKipcbiAqIEV4dHJhY3QgcHJvdG9jb2wgaW5mb3JtYXRpb24gZnJvbSBhIFVSTCB3aXRoL3dpdGhvdXQgZG91YmxlIHNsYXNoIChcIi8vXCIpLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhZGRyZXNzIFVSTCB3ZSB3YW50IHRvIGV4dHJhY3QgZnJvbS5cbiAqIEByZXR1cm4ge1Byb3RvY29sRXh0cmFjdH0gRXh0cmFjdGVkIGluZm9ybWF0aW9uLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZXh0cmFjdFByb3RvY29sKGFkZHJlc3MpIHtcbiAgYWRkcmVzcyA9IHRyaW1MZWZ0KGFkZHJlc3MpO1xuICB2YXIgbWF0Y2ggPSBwcm90b2NvbHJlLmV4ZWMoYWRkcmVzcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBwcm90b2NvbDogbWF0Y2hbMV0gPyBtYXRjaFsxXS50b0xvd2VyQ2FzZSgpIDogJycsXG4gICAgc2xhc2hlczogISFtYXRjaFsyXSxcbiAgICByZXN0OiBtYXRjaFszXVxuICB9O1xufVxuXG4vKipcbiAqIFJlc29sdmUgYSByZWxhdGl2ZSBVUkwgcGF0aG5hbWUgYWdhaW5zdCBhIGJhc2UgVVJMIHBhdGhuYW1lLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSByZWxhdGl2ZSBQYXRobmFtZSBvZiB0aGUgcmVsYXRpdmUgVVJMLlxuICogQHBhcmFtIHtTdHJpbmd9IGJhc2UgUGF0aG5hbWUgb2YgdGhlIGJhc2UgVVJMLlxuICogQHJldHVybiB7U3RyaW5nfSBSZXNvbHZlZCBwYXRobmFtZS5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmUocmVsYXRpdmUsIGJhc2UpIHtcbiAgaWYgKHJlbGF0aXZlID09PSAnJykgcmV0dXJuIGJhc2U7XG5cbiAgdmFyIHBhdGggPSAoYmFzZSB8fCAnLycpLnNwbGl0KCcvJykuc2xpY2UoMCwgLTEpLmNvbmNhdChyZWxhdGl2ZS5zcGxpdCgnLycpKVxuICAgICwgaSA9IHBhdGgubGVuZ3RoXG4gICAgLCBsYXN0ID0gcGF0aFtpIC0gMV1cbiAgICAsIHVuc2hpZnQgPSBmYWxzZVxuICAgICwgdXAgPSAwO1xuXG4gIHdoaWxlIChpLS0pIHtcbiAgICBpZiAocGF0aFtpXSA9PT0gJy4nKSB7XG4gICAgICBwYXRoLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKHBhdGhbaV0gPT09ICcuLicpIHtcbiAgICAgIHBhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBpZiAoaSA9PT0gMCkgdW5zaGlmdCA9IHRydWU7XG4gICAgICBwYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgaWYgKHVuc2hpZnQpIHBhdGgudW5zaGlmdCgnJyk7XG4gIGlmIChsYXN0ID09PSAnLicgfHwgbGFzdCA9PT0gJy4uJykgcGF0aC5wdXNoKCcnKTtcblxuICByZXR1cm4gcGF0aC5qb2luKCcvJyk7XG59XG5cbi8qKlxuICogVGhlIGFjdHVhbCBVUkwgaW5zdGFuY2UuIEluc3RlYWQgb2YgcmV0dXJuaW5nIGFuIG9iamVjdCB3ZSd2ZSBvcHRlZC1pbiB0b1xuICogY3JlYXRlIGFuIGFjdHVhbCBjb25zdHJ1Y3RvciBhcyBpdCdzIG11Y2ggbW9yZSBtZW1vcnkgZWZmaWNpZW50IGFuZFxuICogZmFzdGVyIGFuZCBpdCBwbGVhc2VzIG15IE9DRC5cbiAqXG4gKiBJdCBpcyB3b3J0aCBub3RpbmcgdGhhdCB3ZSBzaG91bGQgbm90IHVzZSBgVVJMYCBhcyBjbGFzcyBuYW1lIHRvIHByZXZlbnRcbiAqIGNsYXNoZXMgd2l0aCB0aGUgZ2xvYmFsIFVSTCBpbnN0YW5jZSB0aGF0IGdvdCBpbnRyb2R1Y2VkIGluIGJyb3dzZXJzLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGFkZHJlc3MgVVJMIHdlIHdhbnQgdG8gcGFyc2UuXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IFtsb2NhdGlvbl0gTG9jYXRpb24gZGVmYXVsdHMgZm9yIHJlbGF0aXZlIHBhdGhzLlxuICogQHBhcmFtIHtCb29sZWFufEZ1bmN0aW9ufSBbcGFyc2VyXSBQYXJzZXIgZm9yIHRoZSBxdWVyeSBzdHJpbmcuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBVcmwoYWRkcmVzcywgbG9jYXRpb24sIHBhcnNlcikge1xuICBhZGRyZXNzID0gdHJpbUxlZnQoYWRkcmVzcyk7XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFVybCkpIHtcbiAgICByZXR1cm4gbmV3IFVybChhZGRyZXNzLCBsb2NhdGlvbiwgcGFyc2VyKTtcbiAgfVxuXG4gIHZhciByZWxhdGl2ZSwgZXh0cmFjdGVkLCBwYXJzZSwgaW5zdHJ1Y3Rpb24sIGluZGV4LCBrZXlcbiAgICAsIGluc3RydWN0aW9ucyA9IHJ1bGVzLnNsaWNlKClcbiAgICAsIHR5cGUgPSB0eXBlb2YgbG9jYXRpb25cbiAgICAsIHVybCA9IHRoaXNcbiAgICAsIGkgPSAwO1xuXG4gIC8vXG4gIC8vIFRoZSBmb2xsb3dpbmcgaWYgc3RhdGVtZW50cyBhbGxvd3MgdGhpcyBtb2R1bGUgdHdvIGhhdmUgY29tcGF0aWJpbGl0eSB3aXRoXG4gIC8vIDIgZGlmZmVyZW50IEFQSTpcbiAgLy9cbiAgLy8gMS4gTm9kZS5qcydzIGB1cmwucGFyc2VgIGFwaSB3aGljaCBhY2NlcHRzIGEgVVJMLCBib29sZWFuIGFzIGFyZ3VtZW50c1xuICAvLyAgICB3aGVyZSB0aGUgYm9vbGVhbiBpbmRpY2F0ZXMgdGhhdCB0aGUgcXVlcnkgc3RyaW5nIHNob3VsZCBhbHNvIGJlIHBhcnNlZC5cbiAgLy9cbiAgLy8gMi4gVGhlIGBVUkxgIGludGVyZmFjZSBvZiB0aGUgYnJvd3NlciB3aGljaCBhY2NlcHRzIGEgVVJMLCBvYmplY3QgYXNcbiAgLy8gICAgYXJndW1lbnRzLiBUaGUgc3VwcGxpZWQgb2JqZWN0IHdpbGwgYmUgdXNlZCBhcyBkZWZhdWx0IHZhbHVlcyAvIGZhbGwtYmFja1xuICAvLyAgICBmb3IgcmVsYXRpdmUgcGF0aHMuXG4gIC8vXG4gIGlmICgnb2JqZWN0JyAhPT0gdHlwZSAmJiAnc3RyaW5nJyAhPT0gdHlwZSkge1xuICAgIHBhcnNlciA9IGxvY2F0aW9uO1xuICAgIGxvY2F0aW9uID0gbnVsbDtcbiAgfVxuXG4gIGlmIChwYXJzZXIgJiYgJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIHBhcnNlcikgcGFyc2VyID0gcXMucGFyc2U7XG5cbiAgbG9jYXRpb24gPSBsb2xjYXRpb24obG9jYXRpb24pO1xuXG4gIC8vXG4gIC8vIEV4dHJhY3QgcHJvdG9jb2wgaW5mb3JtYXRpb24gYmVmb3JlIHJ1bm5pbmcgdGhlIGluc3RydWN0aW9ucy5cbiAgLy9cbiAgZXh0cmFjdGVkID0gZXh0cmFjdFByb3RvY29sKGFkZHJlc3MgfHwgJycpO1xuICByZWxhdGl2ZSA9ICFleHRyYWN0ZWQucHJvdG9jb2wgJiYgIWV4dHJhY3RlZC5zbGFzaGVzO1xuICB1cmwuc2xhc2hlcyA9IGV4dHJhY3RlZC5zbGFzaGVzIHx8IHJlbGF0aXZlICYmIGxvY2F0aW9uLnNsYXNoZXM7XG4gIHVybC5wcm90b2NvbCA9IGV4dHJhY3RlZC5wcm90b2NvbCB8fCBsb2NhdGlvbi5wcm90b2NvbCB8fCAnJztcbiAgYWRkcmVzcyA9IGV4dHJhY3RlZC5yZXN0O1xuXG4gIC8vXG4gIC8vIFdoZW4gdGhlIGF1dGhvcml0eSBjb21wb25lbnQgaXMgYWJzZW50IHRoZSBVUkwgc3RhcnRzIHdpdGggYSBwYXRoXG4gIC8vIGNvbXBvbmVudC5cbiAgLy9cbiAgaWYgKCFleHRyYWN0ZWQuc2xhc2hlcykgaW5zdHJ1Y3Rpb25zWzNdID0gWy8oLiopLywgJ3BhdGhuYW1lJ107XG5cbiAgZm9yICg7IGkgPCBpbnN0cnVjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICBpbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uc1tpXTtcblxuICAgIGlmICh0eXBlb2YgaW5zdHJ1Y3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFkZHJlc3MgPSBpbnN0cnVjdGlvbihhZGRyZXNzKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHBhcnNlID0gaW5zdHJ1Y3Rpb25bMF07XG4gICAga2V5ID0gaW5zdHJ1Y3Rpb25bMV07XG5cbiAgICBpZiAocGFyc2UgIT09IHBhcnNlKSB7XG4gICAgICB1cmxba2V5XSA9IGFkZHJlc3M7XG4gICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHBhcnNlKSB7XG4gICAgICBpZiAofihpbmRleCA9IGFkZHJlc3MuaW5kZXhPZihwYXJzZSkpKSB7XG4gICAgICAgIGlmICgnbnVtYmVyJyA9PT0gdHlwZW9mIGluc3RydWN0aW9uWzJdKSB7XG4gICAgICAgICAgdXJsW2tleV0gPSBhZGRyZXNzLnNsaWNlKDAsIGluZGV4KTtcbiAgICAgICAgICBhZGRyZXNzID0gYWRkcmVzcy5zbGljZShpbmRleCArIGluc3RydWN0aW9uWzJdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1cmxba2V5XSA9IGFkZHJlc3Muc2xpY2UoaW5kZXgpO1xuICAgICAgICAgIGFkZHJlc3MgPSBhZGRyZXNzLnNsaWNlKDAsIGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoKGluZGV4ID0gcGFyc2UuZXhlYyhhZGRyZXNzKSkpIHtcbiAgICAgIHVybFtrZXldID0gaW5kZXhbMV07XG4gICAgICBhZGRyZXNzID0gYWRkcmVzcy5zbGljZSgwLCBpbmRleC5pbmRleCk7XG4gICAgfVxuXG4gICAgdXJsW2tleV0gPSB1cmxba2V5XSB8fCAoXG4gICAgICByZWxhdGl2ZSAmJiBpbnN0cnVjdGlvblszXSA/IGxvY2F0aW9uW2tleV0gfHwgJycgOiAnJ1xuICAgICk7XG5cbiAgICAvL1xuICAgIC8vIEhvc3RuYW1lLCBob3N0IGFuZCBwcm90b2NvbCBzaG91bGQgYmUgbG93ZXJjYXNlZCBzbyB0aGV5IGNhbiBiZSB1c2VkIHRvXG4gICAgLy8gY3JlYXRlIGEgcHJvcGVyIGBvcmlnaW5gLlxuICAgIC8vXG4gICAgaWYgKGluc3RydWN0aW9uWzRdKSB1cmxba2V5XSA9IHVybFtrZXldLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICAvL1xuICAvLyBBbHNvIHBhcnNlIHRoZSBzdXBwbGllZCBxdWVyeSBzdHJpbmcgaW4gdG8gYW4gb2JqZWN0LiBJZiB3ZSdyZSBzdXBwbGllZFxuICAvLyB3aXRoIGEgY3VzdG9tIHBhcnNlciBhcyBmdW5jdGlvbiB1c2UgdGhhdCBpbnN0ZWFkIG9mIHRoZSBkZWZhdWx0IGJ1aWxkLWluXG4gIC8vIHBhcnNlci5cbiAgLy9cbiAgaWYgKHBhcnNlcikgdXJsLnF1ZXJ5ID0gcGFyc2VyKHVybC5xdWVyeSk7XG5cbiAgLy9cbiAgLy8gSWYgdGhlIFVSTCBpcyByZWxhdGl2ZSwgcmVzb2x2ZSB0aGUgcGF0aG5hbWUgYWdhaW5zdCB0aGUgYmFzZSBVUkwuXG4gIC8vXG4gIGlmIChcbiAgICAgIHJlbGF0aXZlXG4gICAgJiYgbG9jYXRpb24uc2xhc2hlc1xuICAgICYmIHVybC5wYXRobmFtZS5jaGFyQXQoMCkgIT09ICcvJ1xuICAgICYmICh1cmwucGF0aG5hbWUgIT09ICcnIHx8IGxvY2F0aW9uLnBhdGhuYW1lICE9PSAnJylcbiAgKSB7XG4gICAgdXJsLnBhdGhuYW1lID0gcmVzb2x2ZSh1cmwucGF0aG5hbWUsIGxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgfVxuXG4gIC8vXG4gIC8vIFdlIHNob3VsZCBub3QgYWRkIHBvcnQgbnVtYmVycyBpZiB0aGV5IGFyZSBhbHJlYWR5IHRoZSBkZWZhdWx0IHBvcnQgbnVtYmVyXG4gIC8vIGZvciBhIGdpdmVuIHByb3RvY29sLiBBcyB0aGUgaG9zdCBhbHNvIGNvbnRhaW5zIHRoZSBwb3J0IG51bWJlciB3ZSdyZSBnb2luZ1xuICAvLyBvdmVycmlkZSBpdCB3aXRoIHRoZSBob3N0bmFtZSB3aGljaCBjb250YWlucyBubyBwb3J0IG51bWJlci5cbiAgLy9cbiAgaWYgKCFyZXF1aXJlZCh1cmwucG9ydCwgdXJsLnByb3RvY29sKSkge1xuICAgIHVybC5ob3N0ID0gdXJsLmhvc3RuYW1lO1xuICAgIHVybC5wb3J0ID0gJyc7XG4gIH1cblxuICAvL1xuICAvLyBQYXJzZSBkb3duIHRoZSBgYXV0aGAgZm9yIHRoZSB1c2VybmFtZSBhbmQgcGFzc3dvcmQuXG4gIC8vXG4gIHVybC51c2VybmFtZSA9IHVybC5wYXNzd29yZCA9ICcnO1xuICBpZiAodXJsLmF1dGgpIHtcbiAgICBpbnN0cnVjdGlvbiA9IHVybC5hdXRoLnNwbGl0KCc6Jyk7XG4gICAgdXJsLnVzZXJuYW1lID0gaW5zdHJ1Y3Rpb25bMF0gfHwgJyc7XG4gICAgdXJsLnBhc3N3b3JkID0gaW5zdHJ1Y3Rpb25bMV0gfHwgJyc7XG4gIH1cblxuICB1cmwub3JpZ2luID0gdXJsLnByb3RvY29sICYmIHVybC5ob3N0ICYmIHVybC5wcm90b2NvbCAhPT0gJ2ZpbGU6J1xuICAgID8gdXJsLnByb3RvY29sICsnLy8nKyB1cmwuaG9zdFxuICAgIDogJ251bGwnO1xuXG4gIC8vXG4gIC8vIFRoZSBocmVmIGlzIGp1c3QgdGhlIGNvbXBpbGVkIHJlc3VsdC5cbiAgLy9cbiAgdXJsLmhyZWYgPSB1cmwudG9TdHJpbmcoKTtcbn1cblxuLyoqXG4gKiBUaGlzIGlzIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY2hhbmdpbmcgcHJvcGVydGllcyBpbiB0aGUgVVJMIGluc3RhbmNlIHRvXG4gKiBpbnN1cmUgdGhhdCB0aGV5IGFsbCBwcm9wYWdhdGUgY29ycmVjdGx5LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXJ0ICAgICAgICAgIFByb3BlcnR5IHdlIG5lZWQgdG8gYWRqdXN0LlxuICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgICAgICAgICAgVGhlIG5ld2x5IGFzc2lnbmVkIHZhbHVlLlxuICogQHBhcmFtIHtCb29sZWFufEZ1bmN0aW9ufSBmbiAgV2hlbiBzZXR0aW5nIHRoZSBxdWVyeSwgaXQgd2lsbCBiZSB0aGUgZnVuY3Rpb25cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZWQgdG8gcGFyc2UgdGhlIHF1ZXJ5LlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV2hlbiBzZXR0aW5nIHRoZSBwcm90b2NvbCwgZG91YmxlIHNsYXNoIHdpbGwgYmVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWQgZnJvbSB0aGUgZmluYWwgdXJsIGlmIGl0IGlzIHRydWUuXG4gKiBAcmV0dXJucyB7VVJMfSBVUkwgaW5zdGFuY2UgZm9yIGNoYWluaW5nLlxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiBzZXQocGFydCwgdmFsdWUsIGZuKSB7XG4gIHZhciB1cmwgPSB0aGlzO1xuXG4gIHN3aXRjaCAocGFydCkge1xuICAgIGNhc2UgJ3F1ZXJ5JzpcbiAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHZhbHVlICYmIHZhbHVlLmxlbmd0aCkge1xuICAgICAgICB2YWx1ZSA9IChmbiB8fCBxcy5wYXJzZSkodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB1cmxbcGFydF0gPSB2YWx1ZTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAncG9ydCc6XG4gICAgICB1cmxbcGFydF0gPSB2YWx1ZTtcblxuICAgICAgaWYgKCFyZXF1aXJlZCh2YWx1ZSwgdXJsLnByb3RvY29sKSkge1xuICAgICAgICB1cmwuaG9zdCA9IHVybC5ob3N0bmFtZTtcbiAgICAgICAgdXJsW3BhcnRdID0gJyc7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgIHVybC5ob3N0ID0gdXJsLmhvc3RuYW1lICsnOicrIHZhbHVlO1xuICAgICAgfVxuXG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2hvc3RuYW1lJzpcbiAgICAgIHVybFtwYXJ0XSA9IHZhbHVlO1xuXG4gICAgICBpZiAodXJsLnBvcnQpIHZhbHVlICs9ICc6JysgdXJsLnBvcnQ7XG4gICAgICB1cmwuaG9zdCA9IHZhbHVlO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdob3N0JzpcbiAgICAgIHVybFtwYXJ0XSA9IHZhbHVlO1xuXG4gICAgICBpZiAoLzpcXGQrJC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zcGxpdCgnOicpO1xuICAgICAgICB1cmwucG9ydCA9IHZhbHVlLnBvcCgpO1xuICAgICAgICB1cmwuaG9zdG5hbWUgPSB2YWx1ZS5qb2luKCc6Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cmwuaG9zdG5hbWUgPSB2YWx1ZTtcbiAgICAgICAgdXJsLnBvcnQgPSAnJztcbiAgICAgIH1cblxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdwcm90b2NvbCc6XG4gICAgICB1cmwucHJvdG9jb2wgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgdXJsLnNsYXNoZXMgPSAhZm47XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3BhdGhuYW1lJzpcbiAgICBjYXNlICdoYXNoJzpcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICB2YXIgY2hhciA9IHBhcnQgPT09ICdwYXRobmFtZScgPyAnLycgOiAnIyc7XG4gICAgICAgIHVybFtwYXJ0XSA9IHZhbHVlLmNoYXJBdCgwKSAhPT0gY2hhciA/IGNoYXIgKyB2YWx1ZSA6IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdXJsW3BhcnRdID0gdmFsdWU7XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICB1cmxbcGFydF0gPSB2YWx1ZTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaW5zID0gcnVsZXNbaV07XG5cbiAgICBpZiAoaW5zWzRdKSB1cmxbaW5zWzFdXSA9IHVybFtpbnNbMV1dLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICB1cmwub3JpZ2luID0gdXJsLnByb3RvY29sICYmIHVybC5ob3N0ICYmIHVybC5wcm90b2NvbCAhPT0gJ2ZpbGU6J1xuICAgID8gdXJsLnByb3RvY29sICsnLy8nKyB1cmwuaG9zdFxuICAgIDogJ251bGwnO1xuXG4gIHVybC5ocmVmID0gdXJsLnRvU3RyaW5nKCk7XG5cbiAgcmV0dXJuIHVybDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIHByb3BlcnRpZXMgYmFjayBpbiB0byBhIHZhbGlkIGFuZCBmdWxsIFVSTCBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5naWZ5IE9wdGlvbmFsIHF1ZXJ5IHN0cmluZ2lmeSBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHtTdHJpbmd9IENvbXBpbGVkIHZlcnNpb24gb2YgdGhlIFVSTC5cbiAqIEBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gdG9TdHJpbmcoc3RyaW5naWZ5KSB7XG4gIGlmICghc3RyaW5naWZ5IHx8ICdmdW5jdGlvbicgIT09IHR5cGVvZiBzdHJpbmdpZnkpIHN0cmluZ2lmeSA9IHFzLnN0cmluZ2lmeTtcblxuICB2YXIgcXVlcnlcbiAgICAsIHVybCA9IHRoaXNcbiAgICAsIHByb3RvY29sID0gdXJsLnByb3RvY29sO1xuXG4gIGlmIChwcm90b2NvbCAmJiBwcm90b2NvbC5jaGFyQXQocHJvdG9jb2wubGVuZ3RoIC0gMSkgIT09ICc6JykgcHJvdG9jb2wgKz0gJzonO1xuXG4gIHZhciByZXN1bHQgPSBwcm90b2NvbCArICh1cmwuc2xhc2hlcyA/ICcvLycgOiAnJyk7XG5cbiAgaWYgKHVybC51c2VybmFtZSkge1xuICAgIHJlc3VsdCArPSB1cmwudXNlcm5hbWU7XG4gICAgaWYgKHVybC5wYXNzd29yZCkgcmVzdWx0ICs9ICc6JysgdXJsLnBhc3N3b3JkO1xuICAgIHJlc3VsdCArPSAnQCc7XG4gIH1cblxuICByZXN1bHQgKz0gdXJsLmhvc3QgKyB1cmwucGF0aG5hbWU7XG5cbiAgcXVlcnkgPSAnb2JqZWN0JyA9PT0gdHlwZW9mIHVybC5xdWVyeSA/IHN0cmluZ2lmeSh1cmwucXVlcnkpIDogdXJsLnF1ZXJ5O1xuICBpZiAocXVlcnkpIHJlc3VsdCArPSAnPycgIT09IHF1ZXJ5LmNoYXJBdCgwKSA/ICc/JysgcXVlcnkgOiBxdWVyeTtcblxuICBpZiAodXJsLmhhc2gpIHJlc3VsdCArPSB1cmwuaGFzaDtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5VcmwucHJvdG90eXBlID0geyBzZXQ6IHNldCwgdG9TdHJpbmc6IHRvU3RyaW5nIH07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIFVSTCBwYXJzZXIgYW5kIHNvbWUgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIHRoYXQgbWlnaHQgYmUgdXNlZnVsIGZvclxuLy8gb3RoZXJzIG9yIHRlc3RpbmcuXG4vL1xuVXJsLmV4dHJhY3RQcm90b2NvbCA9IGV4dHJhY3RQcm90b2NvbDtcblVybC5sb2NhdGlvbiA9IGxvbGNhdGlvbjtcblVybC50cmltTGVmdCA9IHRyaW1MZWZ0O1xuVXJsLnFzID0gcXM7XG5cbm1vZHVsZS5leHBvcnRzID0gVXJsO1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLldIQVRXR0ZldGNoID0ge30pKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgc2VhcmNoUGFyYW1zOiAnVVJMU2VhcmNoUGFyYW1zJyBpbiBzZWxmLFxuICAgIGl0ZXJhYmxlOiAnU3ltYm9sJyBpbiBzZWxmICYmICdpdGVyYXRvcicgaW4gU3ltYm9sLFxuICAgIGJsb2I6XG4gICAgICAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJlxuICAgICAgJ0Jsb2InIGluIHNlbGYgJiZcbiAgICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBuZXcgQmxvYigpO1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfTtcblxuICBmdW5jdGlvbiBpc0RhdGFWaWV3KG9iaikge1xuICAgIHJldHVybiBvYmogJiYgRGF0YVZpZXcucHJvdG90eXBlLmlzUHJvdG90eXBlT2Yob2JqKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIpIHtcbiAgICB2YXIgdmlld0NsYXNzZXMgPSBbXG4gICAgICAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQ2NEFycmF5XSdcbiAgICBdO1xuXG4gICAgdmFyIGlzQXJyYXlCdWZmZXJWaWV3ID1cbiAgICAgIEFycmF5QnVmZmVyLmlzVmlldyB8fFxuICAgICAgZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogJiYgdmlld0NsYXNzZXMuaW5kZXhPZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSkgPiAtMVxuICAgICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSk7XG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLl5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgICAgaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZXJhdG9yXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9O1xuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGhlYWRlcnMpKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKGhlYWRlclswXSwgaGVhZGVyWzFdKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIGhlYWRlcnNbbmFtZV0pO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKTtcbiAgICB2YWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKTtcbiAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLm1hcFtuYW1lXTtcbiAgICB0aGlzLm1hcFtuYW1lXSA9IG9sZFZhbHVlID8gb2xkVmFsdWUgKyAnLCAnICsgdmFsdWUgOiB2YWx1ZTtcbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldO1xuICB9O1xuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKTtcbiAgICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyB0aGlzLm1hcFtuYW1lXSA6IG51bGxcbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH07XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKTtcbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMubWFwKSB7XG4gICAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB0aGlzLm1hcFtuYW1lXSwgbmFtZSwgdGhpcyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIEhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgIGl0ZW1zLnB1c2gobmFtZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9O1xuXG4gIEhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdO1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaXRlbXMucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9O1xuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgIGl0ZW1zLnB1c2goW25hbWUsIHZhbHVlXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9O1xuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgSGVhZGVycy5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXM7XG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpO1xuICAgICAgfTtcbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpO1xuICAgICAgfTtcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpO1xuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKTtcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcik7XG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYik7XG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRBcnJheUJ1ZmZlckFzVGV4dChidWYpIHtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1Zik7XG4gICAgdmFyIGNoYXJzID0gbmV3IEFycmF5KHZpZXcubGVuZ3RoKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgY2hhcnNbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXdbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gY2hhcnMuam9pbignJylcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ1ZmZlckNsb25lKGJ1Zikge1xuICAgIGlmIChidWYuc2xpY2UpIHtcbiAgICAgIHJldHVybiBidWYuc2xpY2UoMClcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYuYnl0ZUxlbmd0aCk7XG4gICAgICB2aWV3LnNldChuZXcgVWludDhBcnJheShidWYpKTtcbiAgICAgIHJldHVybiB2aWV3LmJ1ZmZlclxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHk7XG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJztcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keTtcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5O1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHk7XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKTtcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBzdXBwb3J0LmJsb2IgJiYgaXNEYXRhVmlldyhib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5LmJ1ZmZlcik7XG4gICAgICAgIC8vIElFIDEwLTExIGNhbid0IGhhbmRsZSBhIERhdGFWaWV3IGJvZHkuXG4gICAgICAgIHRoaXMuX2JvZHlJbml0ID0gbmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pO1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIChBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSB8fCBpc0FycmF5QnVmZmVyVmlldyhib2R5KSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYm9keSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpO1xuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSkpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBjb25zdW1lZCh0aGlzKSB8fCBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUFycmF5QnVmZmVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpO1xuICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZWFkQXJyYXlCdWZmZXJBc1RleHQodGhpcy5fYm9keUFycmF5QnVmZmVyKSlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH07XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddO1xuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuICAgIHJldHVybiBtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keTtcblxuICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmw7XG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHM7XG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kO1xuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZTtcbiAgICAgIHRoaXMuc2lnbmFsID0gaW5wdXQuc2lnbmFsO1xuICAgICAgaWYgKCFib2R5ICYmIGlucHV0Ll9ib2R5SW5pdCAhPSBudWxsKSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXQ7XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBTdHJpbmcoaW5wdXQpO1xuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ3NhbWUtb3JpZ2luJztcbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycyk7XG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKTtcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGw7XG4gICAgdGhpcy5zaWduYWwgPSBvcHRpb25zLnNpZ25hbCB8fCB0aGlzLnNpZ25hbDtcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbDtcblxuICAgIGlmICgodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpICYmIGJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keSk7XG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzLCB7Ym9keTogdGhpcy5fYm9keUluaXR9KVxuICB9O1xuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKTtcbiAgICBib2R5XG4gICAgICAudHJpbSgpXG4gICAgICAuc3BsaXQoJyYnKVxuICAgICAgLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKTtcbiAgICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJyk7XG4gICAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpO1xuICAgICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUhlYWRlcnMocmF3SGVhZGVycykge1xuICAgIHZhciBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcbiAgICAvLyBSZXBsYWNlIGluc3RhbmNlcyBvZiBcXHJcXG4gYW5kIFxcbiBmb2xsb3dlZCBieSBhdCBsZWFzdCBvbmUgc3BhY2Ugb3IgaG9yaXpvbnRhbCB0YWIgd2l0aCBhIHNwYWNlXG4gICAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzcyMzAjc2VjdGlvbi0zLjJcbiAgICB2YXIgcHJlUHJvY2Vzc2VkSGVhZGVycyA9IHJhd0hlYWRlcnMucmVwbGFjZSgvXFxyP1xcbltcXHQgXSsvZywgJyAnKTtcbiAgICBwcmVQcm9jZXNzZWRIZWFkZXJzLnNwbGl0KC9cXHI/XFxuLykuZm9yRWFjaChmdW5jdGlvbihsaW5lKSB7XG4gICAgICB2YXIgcGFydHMgPSBsaW5lLnNwbGl0KCc6Jyk7XG4gICAgICB2YXIga2V5ID0gcGFydHMuc2hpZnQoKS50cmltKCk7XG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcnRzLmpvaW4oJzonKS50cmltKCk7XG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBoZWFkZXJzXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpO1xuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnO1xuICAgIHRoaXMuc3RhdHVzID0gb3B0aW9ucy5zdGF0dXMgPT09IHVuZGVmaW5lZCA/IDIwMCA6IG9wdGlvbnMuc3RhdHVzO1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDA7XG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gJ3N0YXR1c1RleHQnIGluIG9wdGlvbnMgPyBvcHRpb25zLnN0YXR1c1RleHQgOiAnT0snO1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycyk7XG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJztcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdCk7XG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKTtcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9O1xuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSk7XG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcic7XG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH07XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdO1xuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH07XG5cbiAgZXhwb3J0cy5ET01FeGNlcHRpb24gPSBzZWxmLkRPTUV4Y2VwdGlvbjtcbiAgdHJ5IHtcbiAgICBuZXcgZXhwb3J0cy5ET01FeGNlcHRpb24oKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgZXhwb3J0cy5ET01FeGNlcHRpb24gPSBmdW5jdGlvbihtZXNzYWdlLCBuYW1lKSB7XG4gICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgIHZhciBlcnJvciA9IEVycm9yKG1lc3NhZ2UpO1xuICAgICAgdGhpcy5zdGFjayA9IGVycm9yLnN0YWNrO1xuICAgIH07XG4gICAgZXhwb3J0cy5ET01FeGNlcHRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xuICAgIGV4cG9ydHMuRE9NRXhjZXB0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGV4cG9ydHMuRE9NRXhjZXB0aW9uO1xuICB9XG5cbiAgZnVuY3Rpb24gZmV0Y2goaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KTtcblxuICAgICAgaWYgKHJlcXVlc3Quc2lnbmFsICYmIHJlcXVlc3Quc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgZXhwb3J0cy5ET01FeGNlcHRpb24oJ0Fib3J0ZWQnLCAnQWJvcnRFcnJvcicpKVxuICAgICAgfVxuXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIGZ1bmN0aW9uIGFib3J0WGhyKCkge1xuICAgICAgICB4aHIuYWJvcnQoKTtcbiAgICAgIH1cblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSB8fCAnJylcbiAgICAgICAgfTtcbiAgICAgICAgb3B0aW9ucy51cmwgPSAncmVzcG9uc2VVUkwnIGluIHhociA/IHhoci5yZXNwb25zZVVSTCA6IG9wdGlvbnMuaGVhZGVycy5nZXQoJ1gtUmVxdWVzdC1VUkwnKTtcbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKTtcbiAgICAgIH07XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpO1xuICAgICAgfTtcblxuICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKTtcbiAgICAgIH07XG5cbiAgICAgIHhoci5vbmFib3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgZXhwb3J0cy5ET01FeGNlcHRpb24oJ0Fib3J0ZWQnLCAnQWJvcnRFcnJvcicpKTtcbiAgICAgIH07XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSk7XG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdvbWl0Jykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYic7XG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocmVxdWVzdC5zaWduYWwpIHtcbiAgICAgICAgcmVxdWVzdC5zaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBhYm9ydFhocik7XG5cbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIERPTkUgKHN1Y2Nlc3Mgb3IgZmFpbHVyZSlcbiAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIHJlcXVlc3Quc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgYWJvcnRYaHIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdCk7XG4gICAgfSlcbiAgfVxuXG4gIGZldGNoLnBvbHlmaWxsID0gdHJ1ZTtcblxuICBpZiAoIXNlbGYuZmV0Y2gpIHtcbiAgICBzZWxmLmZldGNoID0gZmV0Y2g7XG4gICAgc2VsZi5IZWFkZXJzID0gSGVhZGVycztcbiAgICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0O1xuICAgIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZTtcbiAgfVxuXG4gIGV4cG9ydHMuSGVhZGVycyA9IEhlYWRlcnM7XG4gIGV4cG9ydHMuUmVxdWVzdCA9IFJlcXVlc3Q7XG4gIGV4cG9ydHMuUmVzcG9uc2UgPSBSZXNwb25zZTtcbiAgZXhwb3J0cy5mZXRjaCA9IGZldGNoO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAgIyB3aWxkY2FyZFxuXG4gIFZlcnkgc2ltcGxlIHdpbGRjYXJkIG1hdGNoaW5nLCB3aGljaCBpcyBkZXNpZ25lZCB0byBwcm92aWRlIHRoZSBzYW1lXG4gIGZ1bmN0aW9uYWxpdHkgdGhhdCBpcyBmb3VuZCBpbiB0aGVcbiAgW2V2ZV0oaHR0cHM6Ly9naXRodWIuY29tL2Fkb2JlLXdlYnBsYXRmb3JtL2V2ZSkgZXZlbnRpbmcgbGlicmFyeS5cblxuICAjIyBVc2FnZVxuXG4gIEl0IHdvcmtzIHdpdGggc3RyaW5nczpcblxuICA8PDwgZXhhbXBsZXMvc3RyaW5ncy5qc1xuXG4gIEFycmF5czpcblxuICA8PDwgZXhhbXBsZXMvYXJyYXlzLmpzXG5cbiAgT2JqZWN0cyAobWF0Y2hpbmcgYWdhaW5zdCBrZXlzKTpcblxuICA8PDwgZXhhbXBsZXMvb2JqZWN0cy5qc1xuXG4gIFdoaWxlIHRoZSBsaWJyYXJ5IHdvcmtzIGluIE5vZGUsIGlmIHlvdSBhcmUgYXJlIGxvb2tpbmcgZm9yIGZpbGUtYmFzZWRcbiAgd2lsZGNhcmQgbWF0Y2hpbmcgdGhlbiB5b3Ugc2hvdWxkIGhhdmUgYSBsb29rIGF0OlxuXG4gIDxodHRwczovL2dpdGh1Yi5jb20vaXNhYWNzL25vZGUtZ2xvYj5cbioqL1xuXG5mdW5jdGlvbiBXaWxkY2FyZE1hdGNoZXIodGV4dCwgc2VwYXJhdG9yKSB7XG4gIHRoaXMudGV4dCA9IHRleHQgPSB0ZXh0IHx8ICcnO1xuICB0aGlzLmhhc1dpbGQgPSB+dGV4dC5pbmRleE9mKCcqJyk7XG4gIHRoaXMuc2VwYXJhdG9yID0gc2VwYXJhdG9yO1xuICB0aGlzLnBhcnRzID0gdGV4dC5zcGxpdChzZXBhcmF0b3IpO1xufVxuXG5XaWxkY2FyZE1hdGNoZXIucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgdmFyIG1hdGNoZXMgPSB0cnVlO1xuICB2YXIgcGFydHMgPSB0aGlzLnBhcnRzO1xuICB2YXIgaWk7XG4gIHZhciBwYXJ0c0NvdW50ID0gcGFydHMubGVuZ3RoO1xuICB2YXIgdGVzdFBhcnRzO1xuXG4gIGlmICh0eXBlb2YgaW5wdXQgPT0gJ3N0cmluZycgfHwgaW5wdXQgaW5zdGFuY2VvZiBTdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMuaGFzV2lsZCAmJiB0aGlzLnRleHQgIT0gaW5wdXQpIHtcbiAgICAgIG1hdGNoZXMgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGVzdFBhcnRzID0gKGlucHV0IHx8ICcnKS5zcGxpdCh0aGlzLnNlcGFyYXRvcik7XG4gICAgICBmb3IgKGlpID0gMDsgbWF0Y2hlcyAmJiBpaSA8IHBhcnRzQ291bnQ7IGlpKyspIHtcbiAgICAgICAgaWYgKHBhcnRzW2lpXSA9PT0gJyonKSAge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGlpIDwgdGVzdFBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgIG1hdGNoZXMgPSBwYXJ0c1tpaV0gPT09IHRlc3RQYXJ0c1tpaV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0Y2hlcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG1hdGNoZXMsIHRoZW4gcmV0dXJuIHRoZSBjb21wb25lbnQgcGFydHNcbiAgICAgIG1hdGNoZXMgPSBtYXRjaGVzICYmIHRlc3RQYXJ0cztcbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIGlucHV0LnNwbGljZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgbWF0Y2hlcyA9IFtdO1xuXG4gICAgZm9yIChpaSA9IGlucHV0Lmxlbmd0aDsgaWktLTsgKSB7XG4gICAgICBpZiAodGhpcy5tYXRjaChpbnB1dFtpaV0pKSB7XG4gICAgICAgIG1hdGNoZXNbbWF0Y2hlcy5sZW5ndGhdID0gaW5wdXRbaWldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT0gJ29iamVjdCcpIHtcbiAgICBtYXRjaGVzID0ge307XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gaW5wdXQpIHtcbiAgICAgIGlmICh0aGlzLm1hdGNoKGtleSkpIHtcbiAgICAgICAgbWF0Y2hlc1trZXldID0gaW5wdXRba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWF0Y2hlcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGV4dCwgdGVzdCwgc2VwYXJhdG9yKSB7XG4gIHZhciBtYXRjaGVyID0gbmV3IFdpbGRjYXJkTWF0Y2hlcih0ZXh0LCBzZXBhcmF0b3IgfHwgL1tcXC9cXC5dLyk7XG4gIGlmICh0eXBlb2YgdGVzdCAhPSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBtYXRjaGVyLm1hdGNoKHRlc3QpO1xuICB9XG5cbiAgcmV0dXJuIG1hdGNoZXI7XG59O1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIm5hbWVcIjogXCJAdXBweS9jb21wYW5pb24tY2xpZW50XCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJDbGllbnQgbGlicmFyeSBmb3IgY29tbXVuaWNhdGlvbiB3aXRoIENvbXBhbmlvbi4gSW50ZW5kZWQgZm9yIHVzZSBpbiBVcHB5IHBsdWdpbnMuXCIsXG4gIFwidmVyc2lvblwiOiBcIjEuNC40XCIsXG4gIFwibGljZW5zZVwiOiBcIk1JVFwiLFxuICBcIm1haW5cIjogXCJsaWIvaW5kZXguanNcIixcbiAgXCJ0eXBlc1wiOiBcInR5cGVzL2luZGV4LmQudHNcIixcbiAgXCJrZXl3b3Jkc1wiOiBbXG4gICAgXCJmaWxlIHVwbG9hZGVyXCIsXG4gICAgXCJ1cHB5XCIsXG4gICAgXCJ1cHB5LXBsdWdpblwiLFxuICAgIFwiY29tcGFuaW9uXCIsXG4gICAgXCJwcm92aWRlclwiXG4gIF0sXG4gIFwiaG9tZXBhZ2VcIjogXCJodHRwczovL3VwcHkuaW9cIixcbiAgXCJidWdzXCI6IHtcbiAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS90cmFuc2xvYWRpdC91cHB5L2lzc3Vlc1wiXG4gIH0sXG4gIFwicmVwb3NpdG9yeVwiOiB7XG4gICAgXCJ0eXBlXCI6IFwiZ2l0XCIsXG4gICAgXCJ1cmxcIjogXCJnaXQraHR0cHM6Ly9naXRodWIuY29tL3RyYW5zbG9hZGl0L3VwcHkuZ2l0XCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwibmFtZXNwYWNlLWVtaXR0ZXJcIjogXCJeMi4wLjFcIlxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxuY2xhc3MgQXV0aEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgc3VwZXIoJ0F1dGhvcml6YXRpb24gcmVxdWlyZWQnKVxuICAgIHRoaXMubmFtZSA9ICdBdXRoRXJyb3InXG4gICAgdGhpcy5pc0F1dGhFcnJvciA9IHRydWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF1dGhFcnJvclxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFJlcXVlc3RDbGllbnQgPSByZXF1aXJlKCcuL1JlcXVlc3RDbGllbnQnKVxuY29uc3QgdG9rZW5TdG9yYWdlID0gcmVxdWlyZSgnLi90b2tlblN0b3JhZ2UnKVxuXG5jb25zdCBfZ2V0TmFtZSA9IChpZCkgPT4ge1xuICByZXR1cm4gaWQuc3BsaXQoJy0nKS5tYXAoKHMpID0+IHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpKS5qb2luKCcgJylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQcm92aWRlciBleHRlbmRzIFJlcXVlc3RDbGllbnQge1xuICBjb25zdHJ1Y3RvciAodXBweSwgb3B0cykge1xuICAgIHN1cGVyKHVwcHksIG9wdHMpXG4gICAgdGhpcy5wcm92aWRlciA9IG9wdHMucHJvdmlkZXJcbiAgICB0aGlzLmlkID0gdGhpcy5wcm92aWRlclxuICAgIHRoaXMuYXV0aFByb3ZpZGVyID0gb3B0cy5hdXRoUHJvdmlkZXIgfHwgdGhpcy5wcm92aWRlclxuICAgIHRoaXMubmFtZSA9IHRoaXMub3B0cy5uYW1lIHx8IF9nZXROYW1lKHRoaXMuaWQpXG4gICAgdGhpcy5wbHVnaW5JZCA9IHRoaXMub3B0cy5wbHVnaW5JZFxuICAgIHRoaXMudG9rZW5LZXkgPSBgY29tcGFuaW9uLSR7dGhpcy5wbHVnaW5JZH0tYXV0aC10b2tlbmBcbiAgfVxuXG4gIGhlYWRlcnMgKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzdXBlci5oZWFkZXJzKCkudGhlbigoaGVhZGVycykgPT4ge1xuICAgICAgICB0aGlzLmdldEF1dGhUb2tlbigpLnRoZW4oKHRva2VuKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZShPYmplY3QuYXNzaWduKHt9LCBoZWFkZXJzLCB7ICd1cHB5LWF1dGgtdG9rZW4nOiB0b2tlbiB9KSlcbiAgICAgICAgfSlcbiAgICAgIH0pLmNhdGNoKHJlamVjdClcbiAgICB9KVxuICB9XG5cbiAgb25SZWNlaXZlUmVzcG9uc2UgKHJlc3BvbnNlKSB7XG4gICAgcmVzcG9uc2UgPSBzdXBlci5vblJlY2VpdmVSZXNwb25zZShyZXNwb25zZSlcbiAgICBjb25zdCBwbHVnaW4gPSB0aGlzLnVwcHkuZ2V0UGx1Z2luKHRoaXMucGx1Z2luSWQpXG4gICAgY29uc3Qgb2xkQXV0aGVudGljYXRlZCA9IHBsdWdpbi5nZXRQbHVnaW5TdGF0ZSgpLmF1dGhlbnRpY2F0ZWRcbiAgICBjb25zdCBhdXRoZW50aWNhdGVkID0gb2xkQXV0aGVudGljYXRlZCA/IHJlc3BvbnNlLnN0YXR1cyAhPT0gNDAxIDogcmVzcG9uc2Uuc3RhdHVzIDwgNDAwXG4gICAgcGx1Z2luLnNldFBsdWdpblN0YXRlKHsgYXV0aGVudGljYXRlZCB9KVxuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgLy8gQHRvZG8oaS5vbGFyZXdhanUpIGNvbnNpZGVyIHdoZXRoZXIgb3Igbm90IHRoaXMgbWV0aG9kIHNob3VsZCBiZSBleHBvc2VkXG4gIHNldEF1dGhUb2tlbiAodG9rZW4pIHtcbiAgICByZXR1cm4gdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLnBsdWdpbklkKS5zdG9yYWdlLnNldEl0ZW0odGhpcy50b2tlbktleSwgdG9rZW4pXG4gIH1cblxuICBnZXRBdXRoVG9rZW4gKCkge1xuICAgIHJldHVybiB0aGlzLnVwcHkuZ2V0UGx1Z2luKHRoaXMucGx1Z2luSWQpLnN0b3JhZ2UuZ2V0SXRlbSh0aGlzLnRva2VuS2V5KVxuICB9XG5cbiAgYXV0aFVybCAoKSB7XG4gICAgcmV0dXJuIGAke3RoaXMuaG9zdG5hbWV9LyR7dGhpcy5pZH0vY29ubmVjdGBcbiAgfVxuXG4gIGZpbGVVcmwgKGlkKSB7XG4gICAgcmV0dXJuIGAke3RoaXMuaG9zdG5hbWV9LyR7dGhpcy5pZH0vZ2V0LyR7aWR9YFxuICB9XG5cbiAgbGlzdCAoZGlyZWN0b3J5KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KGAke3RoaXMuaWR9L2xpc3QvJHtkaXJlY3RvcnkgfHwgJyd9YClcbiAgfVxuXG4gIGxvZ291dCAoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuZ2V0KGAke3RoaXMuaWR9L2xvZ291dGApXG4gICAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICB0aGlzLnVwcHkuZ2V0UGx1Z2luKHRoaXMucGx1Z2luSWQpLnN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLnRva2VuS2V5KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gcmVzb2x2ZShyZXMpKVxuICAgICAgICAgICAgLmNhdGNoKHJlamVjdClcbiAgICAgICAgfSkuY2F0Y2gocmVqZWN0KVxuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgaW5pdFBsdWdpbiAocGx1Z2luLCBvcHRzLCBkZWZhdWx0T3B0cykge1xuICAgIHBsdWdpbi50eXBlID0gJ2FjcXVpcmVyJ1xuICAgIHBsdWdpbi5maWxlcyA9IFtdXG4gICAgaWYgKGRlZmF1bHRPcHRzKSB7XG4gICAgICBwbHVnaW4ub3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRzLCBvcHRzKVxuICAgIH1cblxuICAgIGlmIChvcHRzLnNlcnZlclVybCB8fCBvcHRzLnNlcnZlclBhdHRlcm4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYHNlcnZlclVybGAgYW5kIGBzZXJ2ZXJQYXR0ZXJuYCBoYXZlIGJlZW4gcmVuYW1lZCB0byBgY29tcGFuaW9uVXJsYCBhbmQgYGNvbXBhbmlvbkFsbG93ZWRIb3N0c2AgcmVzcGVjdGl2ZWx5IGluIHRoZSAwLjMwLjUgcmVsZWFzZS4gUGxlYXNlIGNvbnN1bHQgdGhlIGRvY3MgKGZvciBleGFtcGxlLCBodHRwczovL3VwcHkuaW8vZG9jcy9pbnN0YWdyYW0vIGZvciB0aGUgSW5zdGFncmFtIHBsdWdpbikgYW5kIHVzZSB0aGUgdXBkYXRlZCBvcHRpb25zLmAnKVxuICAgIH1cblxuICAgIGlmIChvcHRzLmNvbXBhbmlvbkFsbG93ZWRIb3N0cykge1xuICAgICAgY29uc3QgcGF0dGVybiA9IG9wdHMuY29tcGFuaW9uQWxsb3dlZEhvc3RzXG4gICAgICAvLyB2YWxpZGF0ZSBjb21wYW5pb25BbGxvd2VkSG9zdHMgcGFyYW1cbiAgICAgIGlmICh0eXBlb2YgcGF0dGVybiAhPT0gJ3N0cmluZycgJiYgIUFycmF5LmlzQXJyYXkocGF0dGVybikgJiYgIShwYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGAke3BsdWdpbi5pZH06IHRoZSBvcHRpb24gXCJjb21wYW5pb25BbGxvd2VkSG9zdHNcIiBtdXN0IGJlIG9uZSBvZiBzdHJpbmcsIEFycmF5LCBSZWdFeHBgKVxuICAgICAgfVxuICAgICAgcGx1Z2luLm9wdHMuY29tcGFuaW9uQWxsb3dlZEhvc3RzID0gcGF0dGVyblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBkb2VzIG5vdCBzdGFydCB3aXRoIGh0dHBzOi8vXG4gICAgICBpZiAoL14oPyFodHRwcz86XFwvXFwvKS4qJC9pLnRlc3Qob3B0cy5jb21wYW5pb25VcmwpKSB7XG4gICAgICAgIHBsdWdpbi5vcHRzLmNvbXBhbmlvbkFsbG93ZWRIb3N0cyA9IGBodHRwczovLyR7b3B0cy5jb21wYW5pb25VcmwucmVwbGFjZSgvXlxcL1xcLy8sICcnKX1gXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbHVnaW4ub3B0cy5jb21wYW5pb25BbGxvd2VkSG9zdHMgPSBvcHRzLmNvbXBhbmlvblVybFxuICAgICAgfVxuICAgIH1cblxuICAgIHBsdWdpbi5zdG9yYWdlID0gcGx1Z2luLm9wdHMuc3RvcmFnZSB8fCB0b2tlblN0b3JhZ2VcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IEF1dGhFcnJvciA9IHJlcXVpcmUoJy4vQXV0aEVycm9yJylcbmNvbnN0IE5ldHdvcmtFcnJvciA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9OZXR3b3JrRXJyb3InKVxuXG4vLyBSZW1vdmUgdGhlIHRyYWlsaW5nIHNsYXNoIHNvIHdlIGNhbiBhbHdheXMgc2FmZWx5IGFwcGVuZCAveHl6LlxuZnVuY3Rpb24gc3RyaXBTbGFzaCAodXJsKSB7XG4gIHJldHVybiB1cmwucmVwbGFjZSgvXFwvJC8sICcnKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFJlcXVlc3RDbGllbnQge1xuICBzdGF0aWMgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb25cblxuICBjb25zdHJ1Y3RvciAodXBweSwgb3B0cykge1xuICAgIHRoaXMudXBweSA9IHVwcHlcbiAgICB0aGlzLm9wdHMgPSBvcHRzXG4gICAgdGhpcy5vblJlY2VpdmVSZXNwb25zZSA9IHRoaXMub25SZWNlaXZlUmVzcG9uc2UuYmluZCh0aGlzKVxuICAgIHRoaXMuYWxsb3dlZEhlYWRlcnMgPSBbJ2FjY2VwdCcsICdjb250ZW50LXR5cGUnLCAndXBweS1hdXRoLXRva2VuJ11cbiAgICB0aGlzLnByZWZsaWdodERvbmUgPSBmYWxzZVxuICB9XG5cbiAgZ2V0IGhvc3RuYW1lICgpIHtcbiAgICBjb25zdCB7IGNvbXBhbmlvbiB9ID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICBjb25zdCBob3N0ID0gdGhpcy5vcHRzLmNvbXBhbmlvblVybFxuICAgIHJldHVybiBzdHJpcFNsYXNoKGNvbXBhbmlvbiAmJiBjb21wYW5pb25baG9zdF0gPyBjb21wYW5pb25baG9zdF0gOiBob3N0KVxuICB9XG5cbiAgZ2V0IGRlZmF1bHRIZWFkZXJzICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgJ1VwcHktVmVyc2lvbnMnOiBgQHVwcHkvY29tcGFuaW9uLWNsaWVudD0ke1JlcXVlc3RDbGllbnQuVkVSU0lPTn1gXG4gICAgfVxuICB9XG5cbiAgaGVhZGVycyAoKSB7XG4gICAgY29uc3QgdXNlckhlYWRlcnMgPSB0aGlzLm9wdHMuY29tcGFuaW9uSGVhZGVycyB8fCB0aGlzLm9wdHMuc2VydmVySGVhZGVycyB8fCB7fVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuICAgICAgLi4udGhpcy5kZWZhdWx0SGVhZGVycyxcbiAgICAgIC4uLnVzZXJIZWFkZXJzXG4gICAgfSlcbiAgfVxuXG4gIF9nZXRQb3N0UmVzcG9uc2VGdW5jIChza2lwKSB7XG4gICAgcmV0dXJuIChyZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKCFza2lwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9uUmVjZWl2ZVJlc3BvbnNlKHJlc3BvbnNlKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzcG9uc2VcbiAgICB9XG4gIH1cblxuICBvblJlY2VpdmVSZXNwb25zZSAocmVzcG9uc2UpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMudXBweS5nZXRTdGF0ZSgpXG4gICAgY29uc3QgY29tcGFuaW9uID0gc3RhdGUuY29tcGFuaW9uIHx8IHt9XG4gICAgY29uc3QgaG9zdCA9IHRoaXMub3B0cy5jb21wYW5pb25VcmxcbiAgICBjb25zdCBoZWFkZXJzID0gcmVzcG9uc2UuaGVhZGVyc1xuICAgIC8vIFN0b3JlIHRoZSBzZWxmLWlkZW50aWZpZWQgZG9tYWluIG5hbWUgZm9yIHRoZSBDb21wYW5pb24gaW5zdGFuY2Ugd2UganVzdCBoaXQuXG4gICAgaWYgKGhlYWRlcnMuaGFzKCdpLWFtJykgJiYgaGVhZGVycy5nZXQoJ2ktYW0nKSAhPT0gY29tcGFuaW9uW2hvc3RdKSB7XG4gICAgICB0aGlzLnVwcHkuc2V0U3RhdGUoe1xuICAgICAgICBjb21wYW5pb246IE9iamVjdC5hc3NpZ24oe30sIGNvbXBhbmlvbiwge1xuICAgICAgICAgIFtob3N0XTogaGVhZGVycy5nZXQoJ2ktYW0nKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICBfZ2V0VXJsICh1cmwpIHtcbiAgICBpZiAoL14oaHR0cHM/OnwpXFwvXFwvLy50ZXN0KHVybCkpIHtcbiAgICAgIHJldHVybiB1cmxcbiAgICB9XG4gICAgcmV0dXJuIGAke3RoaXMuaG9zdG5hbWV9LyR7dXJsfWBcbiAgfVxuXG4gIF9qc29uIChyZXMpIHtcbiAgICBpZiAocmVzLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICB0aHJvdyBuZXcgQXV0aEVycm9yKClcbiAgICB9XG5cbiAgICBpZiAocmVzLnN0YXR1cyA8IDIwMCB8fCByZXMuc3RhdHVzID4gMzAwKSB7XG4gICAgICBsZXQgZXJyTXNnID0gYEZhaWxlZCByZXF1ZXN0IHdpdGggc3RhdHVzOiAke3Jlcy5zdGF0dXN9LiAke3Jlcy5zdGF0dXNUZXh0fWBcbiAgICAgIHJldHVybiByZXMuanNvbigpXG4gICAgICAgIC50aGVuKChlcnJEYXRhKSA9PiB7XG4gICAgICAgICAgZXJyTXNnID0gZXJyRGF0YS5tZXNzYWdlID8gYCR7ZXJyTXNnfSBtZXNzYWdlOiAke2VyckRhdGEubWVzc2FnZX1gIDogZXJyTXNnXG4gICAgICAgICAgZXJyTXNnID0gZXJyRGF0YS5yZXF1ZXN0SWQgPyBgJHtlcnJNc2d9IHJlcXVlc3QtSWQ6ICR7ZXJyRGF0YS5yZXF1ZXN0SWR9YCA6IGVyck1zZ1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpXG4gICAgICAgIH0pLmNhdGNoKCgpID0+IHsgdGhyb3cgbmV3IEVycm9yKGVyck1zZykgfSlcbiAgICB9XG4gICAgcmV0dXJuIHJlcy5qc29uKClcbiAgfVxuXG4gIHByZWZsaWdodCAocGF0aCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAodGhpcy5wcmVmbGlnaHREb25lKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRoaXMuYWxsb3dlZEhlYWRlcnMuc2xpY2UoKSlcbiAgICAgIH1cblxuICAgICAgZmV0Y2godGhpcy5fZ2V0VXJsKHBhdGgpLCB7XG4gICAgICAgIG1ldGhvZDogJ09QVElPTlMnXG4gICAgICB9KVxuICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBpZiAocmVzcG9uc2UuaGVhZGVycy5oYXMoJ2FjY2Vzcy1jb250cm9sLWFsbG93LWhlYWRlcnMnKSkge1xuICAgICAgICAgICAgdGhpcy5hbGxvd2VkSGVhZGVycyA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdhY2Nlc3MtY29udHJvbC1hbGxvdy1oZWFkZXJzJylcbiAgICAgICAgICAgICAgLnNwbGl0KCcsJykubWFwKChoZWFkZXJOYW1lKSA9PiBoZWFkZXJOYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnByZWZsaWdodERvbmUgPSB0cnVlXG4gICAgICAgICAgcmVzb2x2ZSh0aGlzLmFsbG93ZWRIZWFkZXJzLnNsaWNlKCkpXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgdGhpcy51cHB5LmxvZyhgW0NvbXBhbmlvbkNsaWVudF0gdW5hYmxlIHRvIG1ha2UgcHJlZmxpZ2h0IHJlcXVlc3QgJHtlcnJ9YCwgJ3dhcm5pbmcnKVxuICAgICAgICAgIHRoaXMucHJlZmxpZ2h0RG9uZSA9IHRydWVcbiAgICAgICAgICByZXNvbHZlKHRoaXMuYWxsb3dlZEhlYWRlcnMuc2xpY2UoKSlcbiAgICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgcHJlZmxpZ2h0QW5kSGVhZGVycyAocGF0aCkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChbdGhpcy5wcmVmbGlnaHQocGF0aCksIHRoaXMuaGVhZGVycygpXSlcbiAgICAgIC50aGVuKChbYWxsb3dlZEhlYWRlcnMsIGhlYWRlcnNdKSA9PiB7XG4gICAgICAgIC8vIGZpbHRlciB0byBrZWVwIG9ubHkgYWxsb3dlZCBIZWFkZXJzXG4gICAgICAgIE9iamVjdC5rZXlzKGhlYWRlcnMpLmZvckVhY2goKGhlYWRlcikgPT4ge1xuICAgICAgICAgIGlmIChhbGxvd2VkSGVhZGVycy5pbmRleE9mKGhlYWRlci50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMudXBweS5sb2coYFtDb21wYW5pb25DbGllbnRdIGV4Y2x1ZGluZyB1bmFsbG93ZWQgaGVhZGVyICR7aGVhZGVyfWApXG4gICAgICAgICAgICBkZWxldGUgaGVhZGVyc1toZWFkZXJdXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiBoZWFkZXJzXG4gICAgICB9KVxuICB9XG5cbiAgZ2V0IChwYXRoLCBza2lwUG9zdFJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMucHJlZmxpZ2h0QW5kSGVhZGVycyhwYXRoKS50aGVuKChoZWFkZXJzKSA9PiB7XG4gICAgICAgIGZldGNoKHRoaXMuX2dldFVybChwYXRoKSwge1xuICAgICAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJ1xuICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xuICAgICAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBOZXR3b3JrRXJyb3IoZXJyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4odGhpcy5fZ2V0UG9zdFJlc3BvbnNlRnVuYyhza2lwUG9zdFJlc3BvbnNlKSlcbiAgICAgICAgICAudGhlbigocmVzKSA9PiB0aGlzLl9qc29uKHJlcykudGhlbihyZXNvbHZlKSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgZXJyID0gZXJyLmlzQXV0aEVycm9yID8gZXJyIDogbmV3IEVycm9yKGBDb3VsZCBub3QgZ2V0ICR7dGhpcy5fZ2V0VXJsKHBhdGgpfS4gJHtlcnJ9YClcbiAgICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgICAgfSlcbiAgICAgIH0pLmNhdGNoKHJlamVjdClcbiAgICB9KVxuICB9XG5cbiAgcG9zdCAocGF0aCwgZGF0YSwgc2tpcFBvc3RSZXNwb25zZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnByZWZsaWdodEFuZEhlYWRlcnMocGF0aCkudGhlbigoaGVhZGVycykgPT4ge1xuICAgICAgICBmZXRjaCh0aGlzLl9nZXRVcmwocGF0aCksIHtcbiAgICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpXG4gICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XG4gICAgICAgICAgICAgIHRocm93IGVyclxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IE5ldHdvcmtFcnJvcihlcnIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbih0aGlzLl9nZXRQb3N0UmVzcG9uc2VGdW5jKHNraXBQb3N0UmVzcG9uc2UpKVxuICAgICAgICAgIC50aGVuKChyZXMpID0+IHRoaXMuX2pzb24ocmVzKS50aGVuKHJlc29sdmUpKVxuICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBlcnIgPSBlcnIuaXNBdXRoRXJyb3IgPyBlcnIgOiBuZXcgRXJyb3IoYENvdWxkIG5vdCBwb3N0ICR7dGhpcy5fZ2V0VXJsKHBhdGgpfS4gJHtlcnJ9YClcbiAgICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgICAgfSlcbiAgICAgIH0pLmNhdGNoKHJlamVjdClcbiAgICB9KVxuICB9XG5cbiAgZGVsZXRlIChwYXRoLCBkYXRhLCBza2lwUG9zdFJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMucHJlZmxpZ2h0QW5kSGVhZGVycyhwYXRoKS50aGVuKChoZWFkZXJzKSA9PiB7XG4gICAgICAgIGZldGNoKGAke3RoaXMuaG9zdG5hbWV9LyR7cGF0aH1gLCB7XG4gICAgICAgICAgbWV0aG9kOiAnZGVsZXRlJyxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICAgIGJvZHk6IGRhdGEgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IG51bGxcbiAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVyci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcbiAgICAgICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgTmV0d29ya0Vycm9yKGVycilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKHRoaXMuX2dldFBvc3RSZXNwb25zZUZ1bmMoc2tpcFBvc3RSZXNwb25zZSkpXG4gICAgICAgICAgLnRoZW4oKHJlcykgPT4gdGhpcy5fanNvbihyZXMpLnRoZW4ocmVzb2x2ZSkpXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGVyciA9IGVyci5pc0F1dGhFcnJvciA/IGVyciA6IG5ldyBFcnJvcihgQ291bGQgbm90IGRlbGV0ZSAke3RoaXMuX2dldFVybChwYXRoKX0uICR7ZXJyfWApXG4gICAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICAgIH0pXG4gICAgICB9KS5jYXRjaChyZWplY3QpXG4gICAgfSlcbiAgfVxufVxuIiwiY29uc3QgZWUgPSByZXF1aXJlKCduYW1lc3BhY2UtZW1pdHRlcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVXBweVNvY2tldCB7XG4gIGNvbnN0cnVjdG9yIChvcHRzKSB7XG4gICAgdGhpcy5vcHRzID0gb3B0c1xuICAgIHRoaXMuX3F1ZXVlZCA9IFtdXG4gICAgdGhpcy5pc09wZW4gPSBmYWxzZVxuICAgIHRoaXMuZW1pdHRlciA9IGVlKClcblxuICAgIHRoaXMuX2hhbmRsZU1lc3NhZ2UgPSB0aGlzLl9oYW5kbGVNZXNzYWdlLmJpbmQodGhpcylcblxuICAgIHRoaXMuY2xvc2UgPSB0aGlzLmNsb3NlLmJpbmQodGhpcylcbiAgICB0aGlzLmVtaXQgPSB0aGlzLmVtaXQuYmluZCh0aGlzKVxuICAgIHRoaXMub24gPSB0aGlzLm9uLmJpbmQodGhpcylcbiAgICB0aGlzLm9uY2UgPSB0aGlzLm9uY2UuYmluZCh0aGlzKVxuICAgIHRoaXMuc2VuZCA9IHRoaXMuc2VuZC5iaW5kKHRoaXMpXG5cbiAgICBpZiAoIW9wdHMgfHwgb3B0cy5hdXRvT3BlbiAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMub3BlbigpXG4gICAgfVxuICB9XG5cbiAgb3BlbiAoKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KHRoaXMub3B0cy50YXJnZXQpXG5cbiAgICB0aGlzLnNvY2tldC5vbm9wZW4gPSAoZSkgPT4ge1xuICAgICAgdGhpcy5pc09wZW4gPSB0cnVlXG5cbiAgICAgIHdoaWxlICh0aGlzLl9xdWV1ZWQubGVuZ3RoID4gMCAmJiB0aGlzLmlzT3Blbikge1xuICAgICAgICBjb25zdCBmaXJzdCA9IHRoaXMuX3F1ZXVlZFswXVxuICAgICAgICB0aGlzLnNlbmQoZmlyc3QuYWN0aW9uLCBmaXJzdC5wYXlsb2FkKVxuICAgICAgICB0aGlzLl9xdWV1ZWQgPSB0aGlzLl9xdWV1ZWQuc2xpY2UoMSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gKGUpID0+IHtcbiAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5vbm1lc3NhZ2UgPSB0aGlzLl9oYW5kbGVNZXNzYWdlXG4gIH1cblxuICBjbG9zZSAoKSB7XG4gICAgaWYgKHRoaXMuc29ja2V0KSB7XG4gICAgICB0aGlzLnNvY2tldC5jbG9zZSgpXG4gICAgfVxuICB9XG5cbiAgc2VuZCAoYWN0aW9uLCBwYXlsb2FkKSB7XG4gICAgLy8gYXR0YWNoIHV1aWRcblxuICAgIGlmICghdGhpcy5pc09wZW4pIHtcbiAgICAgIHRoaXMuX3F1ZXVlZC5wdXNoKHsgYWN0aW9uLCBwYXlsb2FkIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGFjdGlvbixcbiAgICAgIHBheWxvYWRcbiAgICB9KSlcbiAgfVxuXG4gIG9uIChhY3Rpb24sIGhhbmRsZXIpIHtcbiAgICB0aGlzLmVtaXR0ZXIub24oYWN0aW9uLCBoYW5kbGVyKVxuICB9XG5cbiAgZW1pdCAoYWN0aW9uLCBwYXlsb2FkKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoYWN0aW9uLCBwYXlsb2FkKVxuICB9XG5cbiAgb25jZSAoYWN0aW9uLCBoYW5kbGVyKSB7XG4gICAgdGhpcy5lbWl0dGVyLm9uY2UoYWN0aW9uLCBoYW5kbGVyKVxuICB9XG5cbiAgX2hhbmRsZU1lc3NhZ2UgKGUpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UoZS5kYXRhKVxuICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UuYWN0aW9uLCBtZXNzYWdlLnBheWxvYWQpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgfVxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBNYW5hZ2VzIGNvbW11bmljYXRpb25zIHdpdGggQ29tcGFuaW9uXG4gKi9cblxuY29uc3QgUmVxdWVzdENsaWVudCA9IHJlcXVpcmUoJy4vUmVxdWVzdENsaWVudCcpXG5jb25zdCBQcm92aWRlciA9IHJlcXVpcmUoJy4vUHJvdmlkZXInKVxuY29uc3QgU29ja2V0ID0gcmVxdWlyZSgnLi9Tb2NrZXQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgUmVxdWVzdENsaWVudCxcbiAgUHJvdmlkZXIsXG4gIFNvY2tldFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qKlxuICogVGhpcyBtb2R1bGUgc2VydmVzIGFzIGFuIEFzeW5jIHdyYXBwZXIgZm9yIExvY2FsU3RvcmFnZVxuICovXG5tb2R1bGUuZXhwb3J0cy5zZXRJdGVtID0gKGtleSwgdmFsdWUpID0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSlcbiAgICByZXNvbHZlKClcbiAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMuZ2V0SXRlbSA9IChrZXkpID0+IHtcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpKVxufVxuXG5tb2R1bGUuZXhwb3J0cy5yZW1vdmVJdGVtID0gKGtleSkgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpXG4gICAgcmVzb2x2ZSgpXG4gIH0pXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibmFtZVwiOiBcIkB1cHB5L2NvcmVcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIkNvcmUgbW9kdWxlIGZvciB0aGUgZXh0ZW5zaWJsZSBKYXZhU2NyaXB0IGZpbGUgdXBsb2FkIHdpZGdldCB3aXRoIHN1cHBvcnQgZm9yIGRyYWcmZHJvcCwgcmVzdW1hYmxlIHVwbG9hZHMsIHByZXZpZXdzLCByZXN0cmljdGlvbnMsIGZpbGUgcHJvY2Vzc2luZy9lbmNvZGluZywgcmVtb3RlIHByb3ZpZGVycyBsaWtlIEluc3RhZ3JhbSwgRHJvcGJveCwgR29vZ2xlIERyaXZlLCBTMyBhbmQgbW9yZSA6ZG9nOlwiLFxuICBcInZlcnNpb25cIjogXCIxLjEwLjRcIixcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXG4gIFwibWFpblwiOiBcImxpYi9pbmRleC5qc1wiLFxuICBcInN0eWxlXCI6IFwiZGlzdC9zdHlsZS5taW4uY3NzXCIsXG4gIFwidHlwZXNcIjogXCJ0eXBlcy9pbmRleC5kLnRzXCIsXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwiZmlsZSB1cGxvYWRlclwiLFxuICAgIFwidXBweVwiLFxuICAgIFwidXBweS1wbHVnaW5cIlxuICBdLFxuICBcImhvbWVwYWdlXCI6IFwiaHR0cHM6Ly91cHB5LmlvXCIsXG4gIFwiYnVnc1wiOiB7XG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS9pc3N1ZXNcIlxuICB9LFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiZ2l0K2h0dHBzOi8vZ2l0aHViLmNvbS90cmFuc2xvYWRpdC91cHB5LmdpdFwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkB1cHB5L3N0b3JlLWRlZmF1bHRcIjogXCJmaWxlOi4uL3N0b3JlLWRlZmF1bHRcIixcbiAgICBcIkB1cHB5L3V0aWxzXCI6IFwiZmlsZTouLi91dGlsc1wiLFxuICAgIFwiY3VpZFwiOiBcIl4yLjEuMVwiLFxuICAgIFwibG9kYXNoLnRocm90dGxlXCI6IFwiXjQuMS4xXCIsXG4gICAgXCJtaW1lLW1hdGNoXCI6IFwiXjEuMC4yXCIsXG4gICAgXCJuYW1lc3BhY2UtZW1pdHRlclwiOiBcIl4yLjAuMVwiLFxuICAgIFwicHJlYWN0XCI6IFwiOC4yLjlcIlxuICB9XG59XG4iLCJjb25zdCBwcmVhY3QgPSByZXF1aXJlKCdwcmVhY3QnKVxuY29uc3QgZmluZERPTUVsZW1lbnQgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZmluZERPTUVsZW1lbnQnKVxuXG4vKipcbiAqIERlZmVyIGEgZnJlcXVlbnQgY2FsbCB0byB0aGUgbWljcm90YXNrIHF1ZXVlLlxuICovXG5mdW5jdGlvbiBkZWJvdW5jZSAoZm4pIHtcbiAgbGV0IGNhbGxpbmcgPSBudWxsXG4gIGxldCBsYXRlc3RBcmdzID0gbnVsbFxuICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICBsYXRlc3RBcmdzID0gYXJnc1xuICAgIGlmICghY2FsbGluZykge1xuICAgICAgY2FsbGluZyA9IFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBjYWxsaW5nID0gbnVsbFxuICAgICAgICAvLyBBdCB0aGlzIHBvaW50IGBhcmdzYCBtYXkgYmUgZGlmZmVyZW50IGZyb20gdGhlIG1vc3RcbiAgICAgICAgLy8gcmVjZW50IHN0YXRlLCBpZiBtdWx0aXBsZSBjYWxscyBoYXBwZW5lZCBzaW5jZSB0aGlzIHRhc2tcbiAgICAgICAgLy8gd2FzIHF1ZXVlZC4gU28gd2UgdXNlIHRoZSBgbGF0ZXN0QXJnc2AsIHdoaWNoIGRlZmluaXRlbHlcbiAgICAgICAgLy8gaXMgdGhlIG1vc3QgcmVjZW50IGNhbGwuXG4gICAgICAgIHJldHVybiBmbiguLi5sYXRlc3RBcmdzKVxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIGNhbGxpbmdcbiAgfVxufVxuXG4vKipcbiAqIEJvaWxlcnBsYXRlIHRoYXQgYWxsIFBsdWdpbnMgc2hhcmUgLSBhbmQgc2hvdWxkIG5vdCBiZSB1c2VkXG4gKiBkaXJlY3RseS4gSXQgYWxzbyBzaG93cyB3aGljaCBtZXRob2RzIGZpbmFsIHBsdWdpbnMgc2hvdWxkIGltcGxlbWVudC9vdmVycmlkZSxcbiAqIHRoaXMgZGVjaWRpbmcgb24gc3RydWN0dXJlLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBtYWluIFVwcHkgY29yZSBvYmplY3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3Qgd2l0aCBwbHVnaW4gb3B0aW9uc1xuICogQHJldHVybnMge0FycmF5fHN0cmluZ30gZmlsZXMgb3Igc3VjY2Vzcy9mYWlsIG1lc3NhZ2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQbHVnaW4ge1xuICBjb25zdHJ1Y3RvciAodXBweSwgb3B0cykge1xuICAgIHRoaXMudXBweSA9IHVwcHlcbiAgICB0aGlzLm9wdHMgPSBvcHRzIHx8IHt9XG5cbiAgICB0aGlzLnVwZGF0ZSA9IHRoaXMudXBkYXRlLmJpbmQodGhpcylcbiAgICB0aGlzLm1vdW50ID0gdGhpcy5tb3VudC5iaW5kKHRoaXMpXG4gICAgdGhpcy5pbnN0YWxsID0gdGhpcy5pbnN0YWxsLmJpbmQodGhpcylcbiAgICB0aGlzLnVuaW5zdGFsbCA9IHRoaXMudW5pbnN0YWxsLmJpbmQodGhpcylcbiAgfVxuXG4gIGdldFBsdWdpblN0YXRlICgpIHtcbiAgICBjb25zdCB7IHBsdWdpbnMgfSA9IHRoaXMudXBweS5nZXRTdGF0ZSgpXG4gICAgcmV0dXJuIHBsdWdpbnNbdGhpcy5pZF0gfHwge31cbiAgfVxuXG4gIHNldFBsdWdpblN0YXRlICh1cGRhdGUpIHtcbiAgICBjb25zdCB7IHBsdWdpbnMgfSA9IHRoaXMudXBweS5nZXRTdGF0ZSgpXG5cbiAgICB0aGlzLnVwcHkuc2V0U3RhdGUoe1xuICAgICAgcGx1Z2luczoge1xuICAgICAgICAuLi5wbHVnaW5zLFxuICAgICAgICBbdGhpcy5pZF06IHtcbiAgICAgICAgICAuLi5wbHVnaW5zW3RoaXMuaWRdLFxuICAgICAgICAgIC4uLnVwZGF0ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHNldE9wdGlvbnMgKG5ld09wdHMpIHtcbiAgICB0aGlzLm9wdHMgPSB7IC4uLnRoaXMub3B0cywgLi4ubmV3T3B0cyB9XG4gICAgdGhpcy5zZXRQbHVnaW5TdGF0ZSgpIC8vIHNvIHRoYXQgVUkgcmUtcmVuZGVycyB3aXRoIG5ldyBvcHRpb25zXG4gIH1cblxuICB1cGRhdGUgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmVsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3VwZGF0ZVVJKSB7XG4gICAgICB0aGlzLl91cGRhdGVVSShzdGF0ZSlcbiAgICB9XG4gIH1cblxuICAvLyBDYWxsZWQgYWZ0ZXIgZXZlcnkgc3RhdGUgdXBkYXRlLCBhZnRlciBldmVyeXRoaW5nJ3MgbW91bnRlZC4gRGVib3VuY2VkLlxuICBhZnRlclVwZGF0ZSAoKSB7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBwbHVnaW4gaXMgbW91bnRlZCwgd2hldGhlciBpbiBET00gb3IgaW50byBhbm90aGVyIHBsdWdpbi5cbiAgICogTmVlZGVkIGJlY2F1c2Ugc29tZXRpbWVzIHBsdWdpbnMgYXJlIG1vdW50ZWQgc2VwYXJhdGVseS9hZnRlciBgaW5zdGFsbGAsXG4gICAqIHNvIHRoaXMuZWwgYW5kIHRoaXMucGFyZW50IG1pZ2h0IG5vdCBiZSBhdmFpbGFibGUgaW4gYGluc3RhbGxgLlxuICAgKiBUaGlzIGlzIHRoZSBjYXNlIHdpdGggQHVwcHkvcmVhY3QgcGx1Z2lucywgZm9yIGV4YW1wbGUuXG4gICAqL1xuICBvbk1vdW50ICgpIHtcblxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHN1cHBsaWVkIGB0YXJnZXRgIGlzIGEgRE9NIGVsZW1lbnQgb3IgYW4gYG9iamVjdGAuXG4gICAqIElmIGl04oCZcyBhbiBvYmplY3Qg4oCUIHRhcmdldCBpcyBhIHBsdWdpbiwgYW5kIHdlIHNlYXJjaCBgcGx1Z2luc2BcbiAgICogZm9yIGEgcGx1Z2luIHdpdGggc2FtZSBuYW1lIGFuZCByZXR1cm4gaXRzIHRhcmdldC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSB0YXJnZXRcbiAgICpcbiAgICovXG4gIG1vdW50ICh0YXJnZXQsIHBsdWdpbikge1xuICAgIGNvbnN0IGNhbGxlclBsdWdpbk5hbWUgPSBwbHVnaW4uaWRcblxuICAgIGNvbnN0IHRhcmdldEVsZW1lbnQgPSBmaW5kRE9NRWxlbWVudCh0YXJnZXQpXG5cbiAgICBpZiAodGFyZ2V0RWxlbWVudCkge1xuICAgICAgdGhpcy5pc1RhcmdldERPTUVsID0gdHJ1ZVxuXG4gICAgICAvLyBBUEkgZm9yIHBsdWdpbnMgdGhhdCByZXF1aXJlIGEgc3luY2hyb25vdXMgcmVyZW5kZXIuXG4gICAgICB0aGlzLnJlcmVuZGVyID0gKHN0YXRlKSA9PiB7XG4gICAgICAgIC8vIHBsdWdpbiBjb3VsZCBiZSByZW1vdmVkLCBidXQgdGhpcy5yZXJlbmRlciBpcyBkZWJvdW5jZWQgYmVsb3csXG4gICAgICAgIC8vIHNvIGl0IGNvdWxkIHN0aWxsIGJlIGNhbGxlZCBldmVuIGFmdGVyIHVwcHkucmVtb3ZlUGx1Z2luIG9yIHVwcHkuY2xvc2VcbiAgICAgICAgLy8gaGVuY2UgdGhlIGNoZWNrXG4gICAgICAgIGlmICghdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLmlkKSkgcmV0dXJuXG4gICAgICAgIHRoaXMuZWwgPSBwcmVhY3QucmVuZGVyKHRoaXMucmVuZGVyKHN0YXRlKSwgdGFyZ2V0RWxlbWVudCwgdGhpcy5lbClcbiAgICAgICAgdGhpcy5hZnRlclVwZGF0ZSgpXG4gICAgICB9XG4gICAgICB0aGlzLl91cGRhdGVVSSA9IGRlYm91bmNlKHRoaXMucmVyZW5kZXIpXG5cbiAgICAgIHRoaXMudXBweS5sb2coYEluc3RhbGxpbmcgJHtjYWxsZXJQbHVnaW5OYW1lfSB0byBhIERPTSBlbGVtZW50ICcke3RhcmdldH0nYClcblxuICAgICAgLy8gY2xlYXIgZXZlcnl0aGluZyBpbnNpZGUgdGhlIHRhcmdldCBjb250YWluZXJcbiAgICAgIGlmICh0aGlzLm9wdHMucmVwbGFjZVRhcmdldENvbnRlbnQpIHtcbiAgICAgICAgdGFyZ2V0RWxlbWVudC5pbm5lckhUTUwgPSAnJ1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVsID0gcHJlYWN0LnJlbmRlcih0aGlzLnJlbmRlcih0aGlzLnVwcHkuZ2V0U3RhdGUoKSksIHRhcmdldEVsZW1lbnQpXG5cbiAgICAgIHRoaXMub25Nb3VudCgpXG4gICAgICByZXR1cm4gdGhpcy5lbFxuICAgIH1cblxuICAgIGxldCB0YXJnZXRQbHVnaW5cbiAgICBpZiAodHlwZW9mIHRhcmdldCA9PT0gJ29iamVjdCcgJiYgdGFyZ2V0IGluc3RhbmNlb2YgUGx1Z2luKSB7XG4gICAgICAvLyBUYXJnZXRpbmcgYSBwbHVnaW4gKmluc3RhbmNlKlxuICAgICAgdGFyZ2V0UGx1Z2luID0gdGFyZ2V0XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBUYXJnZXRpbmcgYSBwbHVnaW4gdHlwZVxuICAgICAgY29uc3QgVGFyZ2V0ID0gdGFyZ2V0XG4gICAgICAvLyBGaW5kIHRoZSB0YXJnZXQgcGx1Z2luIGluc3RhbmNlLlxuICAgICAgdGhpcy51cHB5Lml0ZXJhdGVQbHVnaW5zKChwbHVnaW4pID0+IHtcbiAgICAgICAgaWYgKHBsdWdpbiBpbnN0YW5jZW9mIFRhcmdldCkge1xuICAgICAgICAgIHRhcmdldFBsdWdpbiA9IHBsdWdpblxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmICh0YXJnZXRQbHVnaW4pIHtcbiAgICAgIHRoaXMudXBweS5sb2coYEluc3RhbGxpbmcgJHtjYWxsZXJQbHVnaW5OYW1lfSB0byAke3RhcmdldFBsdWdpbi5pZH1gKVxuICAgICAgdGhpcy5wYXJlbnQgPSB0YXJnZXRQbHVnaW5cbiAgICAgIHRoaXMuZWwgPSB0YXJnZXRQbHVnaW4uYWRkVGFyZ2V0KHBsdWdpbilcblxuICAgICAgdGhpcy5vbk1vdW50KClcbiAgICAgIHJldHVybiB0aGlzLmVsXG4gICAgfVxuXG4gICAgdGhpcy51cHB5LmxvZyhgTm90IGluc3RhbGxpbmcgJHtjYWxsZXJQbHVnaW5OYW1lfWApXG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRhcmdldCBvcHRpb24gZ2l2ZW4gdG8gJHtjYWxsZXJQbHVnaW5OYW1lfS4gUGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHRoZSBlbGVtZW50XG4gICAgICBleGlzdHMgb24gdGhlIHBhZ2UsIG9yIHRoYXQgdGhlIHBsdWdpbiB5b3UgYXJlIHRhcmdldGluZyBoYXMgYmVlbiBpbnN0YWxsZWQuIENoZWNrIHRoYXQgdGhlIDxzY3JpcHQ+IHRhZyBpbml0aWFsaXppbmcgVXBweVxuICAgICAgY29tZXMgYXQgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZSwgYmVmb3JlIHRoZSBjbG9zaW5nIDwvYm9keT4gdGFnIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3RyYW5zbG9hZGl0L3VwcHkvaXNzdWVzLzEwNDIpLmApXG4gIH1cblxuICByZW5kZXIgKHN0YXRlKSB7XG4gICAgdGhyb3cgKG5ldyBFcnJvcignRXh0ZW5kIHRoZSByZW5kZXIgbWV0aG9kIHRvIGFkZCB5b3VyIHBsdWdpbiB0byBhIERPTSBlbGVtZW50JykpXG4gIH1cblxuICBhZGRUYXJnZXQgKHBsdWdpbikge1xuICAgIHRocm93IChuZXcgRXJyb3IoJ0V4dGVuZCB0aGUgYWRkVGFyZ2V0IG1ldGhvZCB0byBhZGQgeW91ciBwbHVnaW4gdG8gYW5vdGhlciBwbHVnaW5cXCdzIHRhcmdldCcpKVxuICB9XG5cbiAgdW5tb3VudCAoKSB7XG4gICAgaWYgKHRoaXMuaXNUYXJnZXRET01FbCAmJiB0aGlzLmVsICYmIHRoaXMuZWwucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5lbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWwpXG4gICAgfVxuICB9XG5cbiAgaW5zdGFsbCAoKSB7XG5cbiAgfVxuXG4gIHVuaW5zdGFsbCAoKSB7XG4gICAgdGhpcy51bm1vdW50KClcbiAgfVxufVxuIiwiY29uc3QgVHJhbnNsYXRvciA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9UcmFuc2xhdG9yJylcbmNvbnN0IGVlID0gcmVxdWlyZSgnbmFtZXNwYWNlLWVtaXR0ZXInKVxuY29uc3QgY3VpZCA9IHJlcXVpcmUoJ2N1aWQnKVxuY29uc3QgdGhyb3R0bGUgPSByZXF1aXJlKCdsb2Rhc2gudGhyb3R0bGUnKVxuY29uc3QgcHJldHR5Qnl0ZXMgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvcHJldHR5Qnl0ZXMnKVxuY29uc3QgbWF0Y2ggPSByZXF1aXJlKCdtaW1lLW1hdGNoJylcbmNvbnN0IERlZmF1bHRTdG9yZSA9IHJlcXVpcmUoJ0B1cHB5L3N0b3JlLWRlZmF1bHQnKVxuY29uc3QgZ2V0RmlsZVR5cGUgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2V0RmlsZVR5cGUnKVxuY29uc3QgZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24gPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24nKVxuY29uc3QgZ2VuZXJhdGVGaWxlSUQgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2VuZXJhdGVGaWxlSUQnKVxuY29uc3Qgc3VwcG9ydHNVcGxvYWRQcm9ncmVzcyA9IHJlcXVpcmUoJy4vc3VwcG9ydHNVcGxvYWRQcm9ncmVzcycpXG5jb25zdCB7IGp1c3RFcnJvcnNMb2dnZXIsIGRlYnVnTG9nZ2VyIH0gPSByZXF1aXJlKCcuL2xvZ2dlcnMnKVxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9QbHVnaW4nKSAvLyBFeHBvcnRlZCBmcm9tIGhlcmUuXG5cbmNsYXNzIFJlc3RyaWN0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yICguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncylcbiAgICB0aGlzLmlzUmVzdHJpY3Rpb24gPSB0cnVlXG4gIH1cbn1cblxuLyoqXG4gKiBVcHB5IENvcmUgbW9kdWxlLlxuICogTWFuYWdlcyBwbHVnaW5zLCBzdGF0ZSB1cGRhdGVzLCBhY3RzIGFzIGFuIGV2ZW50IGJ1cyxcbiAqIGFkZHMvcmVtb3ZlcyBmaWxlcyBhbmQgbWV0YWRhdGEuXG4gKi9cbmNsYXNzIFVwcHkge1xuICBzdGF0aWMgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb25cblxuICAvKipcbiAgICogSW5zdGFudGlhdGUgVXBweVxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0cyDigJQgVXBweSBvcHRpb25zXG4gICAqL1xuICBjb25zdHJ1Y3RvciAob3B0cykge1xuICAgIHRoaXMuZGVmYXVsdExvY2FsZSA9IHtcbiAgICAgIHN0cmluZ3M6IHtcbiAgICAgICAgYWRkQnVsa0ZpbGVzRmFpbGVkOiB7XG4gICAgICAgICAgMDogJ0ZhaWxlZCB0byBhZGQgJXtzbWFydF9jb3VudH0gZmlsZSBkdWUgdG8gYW4gaW50ZXJuYWwgZXJyb3InLFxuICAgICAgICAgIDE6ICdGYWlsZWQgdG8gYWRkICV7c21hcnRfY291bnR9IGZpbGVzIGR1ZSB0byBpbnRlcm5hbCBlcnJvcnMnXG4gICAgICAgIH0sXG4gICAgICAgIHlvdUNhbk9ubHlVcGxvYWRYOiB7XG4gICAgICAgICAgMDogJ1lvdSBjYW4gb25seSB1cGxvYWQgJXtzbWFydF9jb3VudH0gZmlsZScsXG4gICAgICAgICAgMTogJ1lvdSBjYW4gb25seSB1cGxvYWQgJXtzbWFydF9jb3VudH0gZmlsZXMnXG4gICAgICAgIH0sXG4gICAgICAgIHlvdUhhdmVUb0F0TGVhc3RTZWxlY3RYOiB7XG4gICAgICAgICAgMDogJ1lvdSBoYXZlIHRvIHNlbGVjdCBhdCBsZWFzdCAle3NtYXJ0X2NvdW50fSBmaWxlJyxcbiAgICAgICAgICAxOiAnWW91IGhhdmUgdG8gc2VsZWN0IGF0IGxlYXN0ICV7c21hcnRfY291bnR9IGZpbGVzJ1xuICAgICAgICB9LFxuICAgICAgICAvLyBUaGUgZGVmYXVsdCBgZXhjZWVkc1NpemUyYCBzdHJpbmcgb25seSBjb21iaW5lcyB0aGUgYGV4Y2VlZHNTaXplYCBzdHJpbmcgKCV7YmFja3dhcmRzQ29tcGF0fSkgd2l0aCB0aGUgc2l6ZS5cbiAgICAgICAgLy8gTG9jYWxlcyBjYW4gb3ZlcnJpZGUgYGV4Y2VlZHNTaXplMmAgdG8gc3BlY2lmeSBhIGRpZmZlcmVudCB3b3JkIG9yZGVyLiBUaGlzIGlzIGZvciBiYWNrd2FyZHMgY29tcGF0IHdpdGhcbiAgICAgICAgLy8gVXBweSAxLjkueCBhbmQgYmVsb3cgd2hpY2ggZGlkIGEgbmFpdmUgY29uY2F0ZW5hdGlvbiBvZiBgZXhjZWVkc1NpemUyICsgc2l6ZWAgaW5zdGVhZCBvZiB1c2luZyBhIGxvY2FsZS1zcGVjaWZpY1xuICAgICAgICAvLyBzdWJzdGl0dXRpb24uXG4gICAgICAgIC8vIFRPRE86IEluIDIuMCBgZXhjZWVkc1NpemUyYCBzaG91bGQgYmUgcmVtb3ZlZCBpbiBhbmQgYGV4Y2VlZHNTaXplYCB1cGRhdGVkIHRvIHVzZSBzdWJzdGl0dXRpb24uXG4gICAgICAgIGV4Y2VlZHNTaXplMjogJyV7YmFja3dhcmRzQ29tcGF0fSAle3NpemV9JyxcbiAgICAgICAgZXhjZWVkc1NpemU6ICdUaGlzIGZpbGUgZXhjZWVkcyBtYXhpbXVtIGFsbG93ZWQgc2l6ZSBvZicsXG4gICAgICAgIHlvdUNhbk9ubHlVcGxvYWRGaWxlVHlwZXM6ICdZb3UgY2FuIG9ubHkgdXBsb2FkOiAle3R5cGVzfScsXG4gICAgICAgIG5vTmV3QWxyZWFkeVVwbG9hZGluZzogJ0Nhbm5vdCBhZGQgbmV3IGZpbGVzOiBhbHJlYWR5IHVwbG9hZGluZycsXG4gICAgICAgIG5vRHVwbGljYXRlczogJ0Nhbm5vdCBhZGQgdGhlIGR1cGxpY2F0ZSBmaWxlIFxcJyV7ZmlsZU5hbWV9XFwnLCBpdCBhbHJlYWR5IGV4aXN0cycsXG4gICAgICAgIGNvbXBhbmlvbkVycm9yOiAnQ29ubmVjdGlvbiB3aXRoIENvbXBhbmlvbiBmYWlsZWQnLFxuICAgICAgICBjb21wYW5pb25VbmF1dGhvcml6ZUhpbnQ6ICdUbyB1bmF1dGhvcml6ZSB0byB5b3VyICV7cHJvdmlkZXJ9IGFjY291bnQsIHBsZWFzZSBnbyB0byAle3VybH0nLFxuICAgICAgICBmYWlsZWRUb1VwbG9hZDogJ0ZhaWxlZCB0byB1cGxvYWQgJXtmaWxlfScsXG4gICAgICAgIG5vSW50ZXJuZXRDb25uZWN0aW9uOiAnTm8gSW50ZXJuZXQgY29ubmVjdGlvbicsXG4gICAgICAgIGNvbm5lY3RlZFRvSW50ZXJuZXQ6ICdDb25uZWN0ZWQgdG8gdGhlIEludGVybmV0JyxcbiAgICAgICAgLy8gU3RyaW5ncyBmb3IgcmVtb3RlIHByb3ZpZGVyc1xuICAgICAgICBub0ZpbGVzRm91bmQ6ICdZb3UgaGF2ZSBubyBmaWxlcyBvciBmb2xkZXJzIGhlcmUnLFxuICAgICAgICBzZWxlY3RYOiB7XG4gICAgICAgICAgMDogJ1NlbGVjdCAle3NtYXJ0X2NvdW50fScsXG4gICAgICAgICAgMTogJ1NlbGVjdCAle3NtYXJ0X2NvdW50fSdcbiAgICAgICAgfSxcbiAgICAgICAgc2VsZWN0QWxsRmlsZXNGcm9tRm9sZGVyTmFtZWQ6ICdTZWxlY3QgYWxsIGZpbGVzIGZyb20gZm9sZGVyICV7bmFtZX0nLFxuICAgICAgICB1bnNlbGVjdEFsbEZpbGVzRnJvbUZvbGRlck5hbWVkOiAnVW5zZWxlY3QgYWxsIGZpbGVzIGZyb20gZm9sZGVyICV7bmFtZX0nLFxuICAgICAgICBzZWxlY3RGaWxlTmFtZWQ6ICdTZWxlY3QgZmlsZSAle25hbWV9JyxcbiAgICAgICAgdW5zZWxlY3RGaWxlTmFtZWQ6ICdVbnNlbGVjdCBmaWxlICV7bmFtZX0nLFxuICAgICAgICBvcGVuRm9sZGVyTmFtZWQ6ICdPcGVuIGZvbGRlciAle25hbWV9JyxcbiAgICAgICAgY2FuY2VsOiAnQ2FuY2VsJyxcbiAgICAgICAgbG9nT3V0OiAnTG9nIG91dCcsXG4gICAgICAgIGZpbHRlcjogJ0ZpbHRlcicsXG4gICAgICAgIHJlc2V0RmlsdGVyOiAnUmVzZXQgZmlsdGVyJyxcbiAgICAgICAgbG9hZGluZzogJ0xvYWRpbmcuLi4nLFxuICAgICAgICBhdXRoZW50aWNhdGVXaXRoVGl0bGU6ICdQbGVhc2UgYXV0aGVudGljYXRlIHdpdGggJXtwbHVnaW5OYW1lfSB0byBzZWxlY3QgZmlsZXMnLFxuICAgICAgICBhdXRoZW50aWNhdGVXaXRoOiAnQ29ubmVjdCB0byAle3BsdWdpbk5hbWV9JyxcbiAgICAgICAgZW1wdHlGb2xkZXJBZGRlZDogJ05vIGZpbGVzIHdlcmUgYWRkZWQgZnJvbSBlbXB0eSBmb2xkZXInLFxuICAgICAgICBmb2xkZXJBZGRlZDoge1xuICAgICAgICAgIDA6ICdBZGRlZCAle3NtYXJ0X2NvdW50fSBmaWxlIGZyb20gJXtmb2xkZXJ9JyxcbiAgICAgICAgICAxOiAnQWRkZWQgJXtzbWFydF9jb3VudH0gZmlsZXMgZnJvbSAle2ZvbGRlcn0nXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIGlkOiAndXBweScsXG4gICAgICBhdXRvUHJvY2VlZDogZmFsc2UsXG4gICAgICBhbGxvd011bHRpcGxlVXBsb2FkczogdHJ1ZSxcbiAgICAgIGRlYnVnOiBmYWxzZSxcbiAgICAgIHJlc3RyaWN0aW9uczoge1xuICAgICAgICBtYXhGaWxlU2l6ZTogbnVsbCxcbiAgICAgICAgbWF4TnVtYmVyT2ZGaWxlczogbnVsbCxcbiAgICAgICAgbWluTnVtYmVyT2ZGaWxlczogbnVsbCxcbiAgICAgICAgYWxsb3dlZEZpbGVUeXBlczogbnVsbFxuICAgICAgfSxcbiAgICAgIG1ldGE6IHt9LFxuICAgICAgb25CZWZvcmVGaWxlQWRkZWQ6IChjdXJyZW50RmlsZSwgZmlsZXMpID0+IGN1cnJlbnRGaWxlLFxuICAgICAgb25CZWZvcmVVcGxvYWQ6IChmaWxlcykgPT4gZmlsZXMsXG4gICAgICBzdG9yZTogRGVmYXVsdFN0b3JlKCksXG4gICAgICBsb2dnZXI6IGp1c3RFcnJvcnNMb2dnZXJcbiAgICB9XG5cbiAgICAvLyBNZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlcixcbiAgICAvLyBtYWtpbmcgc3VyZSB0byBtZXJnZSByZXN0cmljdGlvbnMgdG9vXG4gICAgdGhpcy5vcHRzID0ge1xuICAgICAgLi4uZGVmYXVsdE9wdGlvbnMsXG4gICAgICAuLi5vcHRzLFxuICAgICAgcmVzdHJpY3Rpb25zOiB7XG4gICAgICAgIC4uLmRlZmF1bHRPcHRpb25zLnJlc3RyaWN0aW9ucyxcbiAgICAgICAgLi4uKG9wdHMgJiYgb3B0cy5yZXN0cmljdGlvbnMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU3VwcG9ydCBkZWJ1ZzogdHJ1ZSBmb3IgYmFja3dhcmRzLWNvbXBhdGFiaWxpdHksIHVubGVzcyBsb2dnZXIgaXMgc2V0IGluIG9wdHNcbiAgICAvLyBvcHRzIGluc3RlYWQgb2YgdGhpcy5vcHRzIHRvIGF2b2lkIGNvbXBhcmluZyBvYmplY3RzIOKAlCB3ZSBzZXQgbG9nZ2VyOiBqdXN0RXJyb3JzTG9nZ2VyIGluIGRlZmF1bHRPcHRpb25zXG4gICAgaWYgKG9wdHMgJiYgb3B0cy5sb2dnZXIgJiYgb3B0cy5kZWJ1Zykge1xuICAgICAgdGhpcy5sb2coJ1lvdSBhcmUgdXNpbmcgYSBjdXN0b20gYGxvZ2dlcmAsIGJ1dCBhbHNvIHNldCBgZGVidWc6IHRydWVgLCB3aGljaCB1c2VzIGJ1aWx0LWluIGxvZ2dlciB0byBvdXRwdXQgbG9ncyB0byBjb25zb2xlLiBJZ25vcmluZyBgZGVidWc6IHRydWVgIGFuZCB1c2luZyB5b3VyIGN1c3RvbSBgbG9nZ2VyYC4nLCAnd2FybmluZycpXG4gICAgfSBlbHNlIGlmIChvcHRzICYmIG9wdHMuZGVidWcpIHtcbiAgICAgIHRoaXMub3B0cy5sb2dnZXIgPSBkZWJ1Z0xvZ2dlclxuICAgIH1cblxuICAgIHRoaXMubG9nKGBVc2luZyBDb3JlIHYke3RoaXMuY29uc3RydWN0b3IuVkVSU0lPTn1gKVxuXG4gICAgaWYgKHRoaXMub3B0cy5yZXN0cmljdGlvbnMuYWxsb3dlZEZpbGVUeXBlcyAmJlxuICAgICAgICB0aGlzLm9wdHMucmVzdHJpY3Rpb25zLmFsbG93ZWRGaWxlVHlwZXMgIT09IG51bGwgJiZcbiAgICAgICAgIUFycmF5LmlzQXJyYXkodGhpcy5vcHRzLnJlc3RyaWN0aW9ucy5hbGxvd2VkRmlsZVR5cGVzKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYHJlc3RyaWN0aW9ucy5hbGxvd2VkRmlsZVR5cGVzYCBtdXN0IGJlIGFuIGFycmF5JylcbiAgICB9XG5cbiAgICB0aGlzLmkxOG5Jbml0KClcblxuICAgIC8vIENvbnRhaW5lciBmb3IgZGlmZmVyZW50IHR5cGVzIG9mIHBsdWdpbnNcbiAgICB0aGlzLnBsdWdpbnMgPSB7fVxuXG4gICAgdGhpcy5nZXRTdGF0ZSA9IHRoaXMuZ2V0U3RhdGUuYmluZCh0aGlzKVxuICAgIHRoaXMuZ2V0UGx1Z2luID0gdGhpcy5nZXRQbHVnaW4uYmluZCh0aGlzKVxuICAgIHRoaXMuc2V0RmlsZU1ldGEgPSB0aGlzLnNldEZpbGVNZXRhLmJpbmQodGhpcylcbiAgICB0aGlzLnNldEZpbGVTdGF0ZSA9IHRoaXMuc2V0RmlsZVN0YXRlLmJpbmQodGhpcylcbiAgICB0aGlzLmxvZyA9IHRoaXMubG9nLmJpbmQodGhpcylcbiAgICB0aGlzLmluZm8gPSB0aGlzLmluZm8uYmluZCh0aGlzKVxuICAgIHRoaXMuaGlkZUluZm8gPSB0aGlzLmhpZGVJbmZvLmJpbmQodGhpcylcbiAgICB0aGlzLmFkZEZpbGUgPSB0aGlzLmFkZEZpbGUuYmluZCh0aGlzKVxuICAgIHRoaXMucmVtb3ZlRmlsZSA9IHRoaXMucmVtb3ZlRmlsZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5wYXVzZVJlc3VtZSA9IHRoaXMucGF1c2VSZXN1bWUuYmluZCh0aGlzKVxuXG4gICAgLy8gX19fV2h5IHRocm90dGxlIGF0IDUwMG1zP1xuICAgIC8vICAgIC0gV2UgbXVzdCB0aHJvdHRsZSBhdCA+MjUwbXMgZm9yIHN1cGVyZm9jdXMgaW4gRGFzaGJvYXJkIHRvIHdvcmsgd2VsbCAoYmVjYXVzZSBhbmltYXRpb24gdGFrZXMgMC4yNXMsIGFuZCB3ZSB3YW50IHRvIHdhaXQgZm9yIGFsbCBhbmltYXRpb25zIHRvIGJlIG92ZXIgYmVmb3JlIHJlZm9jdXNpbmcpLlxuICAgIC8vICAgIFtQcmFjdGljYWwgQ2hlY2tdOiBpZiB0aG90dGxlIGlzIGF0IDEwMG1zLCB0aGVuIGlmIHlvdSBhcmUgdXBsb2FkaW5nIGEgZmlsZSwgYW5kIGNsaWNrICdBREQgTU9SRSBGSUxFUycsIC0gZm9jdXMgd29uJ3QgYWN0aXZhdGUgaW4gRmlyZWZveC5cbiAgICAvLyAgICAtIFdlIG11c3QgdGhyb3R0bGUgYXQgYXJvdW5kID41MDBtcyB0byBhdm9pZCBwZXJmb3JtYW5jZSBsYWdzLlxuICAgIC8vICAgIFtQcmFjdGljYWwgQ2hlY2tdIEZpcmVmb3gsIHRyeSB0byB1cGxvYWQgYSBiaWcgZmlsZSBmb3IgYSBwcm9sb25nZWQgcGVyaW9kIG9mIHRpbWUuIExhcHRvcCB3aWxsIHN0YXJ0IHRvIGhlYXQgdXAuXG4gICAgdGhpcy5fY2FsY3VsYXRlUHJvZ3Jlc3MgPSB0aHJvdHRsZSh0aGlzLl9jYWxjdWxhdGVQcm9ncmVzcy5iaW5kKHRoaXMpLCA1MDAsIHsgbGVhZGluZzogdHJ1ZSwgdHJhaWxpbmc6IHRydWUgfSlcblxuICAgIHRoaXMudXBkYXRlT25saW5lU3RhdHVzID0gdGhpcy51cGRhdGVPbmxpbmVTdGF0dXMuYmluZCh0aGlzKVxuICAgIHRoaXMucmVzZXRQcm9ncmVzcyA9IHRoaXMucmVzZXRQcm9ncmVzcy5iaW5kKHRoaXMpXG5cbiAgICB0aGlzLnBhdXNlQWxsID0gdGhpcy5wYXVzZUFsbC5iaW5kKHRoaXMpXG4gICAgdGhpcy5yZXN1bWVBbGwgPSB0aGlzLnJlc3VtZUFsbC5iaW5kKHRoaXMpXG4gICAgdGhpcy5yZXRyeUFsbCA9IHRoaXMucmV0cnlBbGwuYmluZCh0aGlzKVxuICAgIHRoaXMuY2FuY2VsQWxsID0gdGhpcy5jYW5jZWxBbGwuYmluZCh0aGlzKVxuICAgIHRoaXMucmV0cnlVcGxvYWQgPSB0aGlzLnJldHJ5VXBsb2FkLmJpbmQodGhpcylcbiAgICB0aGlzLnVwbG9hZCA9IHRoaXMudXBsb2FkLmJpbmQodGhpcylcblxuICAgIHRoaXMuZW1pdHRlciA9IGVlKClcbiAgICB0aGlzLm9uID0gdGhpcy5vbi5iaW5kKHRoaXMpXG4gICAgdGhpcy5vZmYgPSB0aGlzLm9mZi5iaW5kKHRoaXMpXG4gICAgdGhpcy5vbmNlID0gdGhpcy5lbWl0dGVyLm9uY2UuYmluZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5lbWl0ID0gdGhpcy5lbWl0dGVyLmVtaXQuYmluZCh0aGlzLmVtaXR0ZXIpXG5cbiAgICB0aGlzLnByZVByb2Nlc3NvcnMgPSBbXVxuICAgIHRoaXMudXBsb2FkZXJzID0gW11cbiAgICB0aGlzLnBvc3RQcm9jZXNzb3JzID0gW11cblxuICAgIHRoaXMuc3RvcmUgPSB0aGlzLm9wdHMuc3RvcmVcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHBsdWdpbnM6IHt9LFxuICAgICAgZmlsZXM6IHt9LFxuICAgICAgY3VycmVudFVwbG9hZHM6IHt9LFxuICAgICAgYWxsb3dOZXdVcGxvYWQ6IHRydWUsXG4gICAgICBjYXBhYmlsaXRpZXM6IHtcbiAgICAgICAgdXBsb2FkUHJvZ3Jlc3M6IHN1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MoKSxcbiAgICAgICAgaW5kaXZpZHVhbENhbmNlbGxhdGlvbjogdHJ1ZSxcbiAgICAgICAgcmVzdW1hYmxlVXBsb2FkczogZmFsc2VcbiAgICAgIH0sXG4gICAgICB0b3RhbFByb2dyZXNzOiAwLFxuICAgICAgbWV0YTogeyAuLi50aGlzLm9wdHMubWV0YSB9LFxuICAgICAgaW5mbzoge1xuICAgICAgICBpc0hpZGRlbjogdHJ1ZSxcbiAgICAgICAgdHlwZTogJ2luZm8nLFxuICAgICAgICBtZXNzYWdlOiAnJ1xuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLl9zdG9yZVVuc3Vic2NyaWJlID0gdGhpcy5zdG9yZS5zdWJzY3JpYmUoKHByZXZTdGF0ZSwgbmV4dFN0YXRlLCBwYXRjaCkgPT4ge1xuICAgICAgdGhpcy5lbWl0KCdzdGF0ZS11cGRhdGUnLCBwcmV2U3RhdGUsIG5leHRTdGF0ZSwgcGF0Y2gpXG4gICAgICB0aGlzLnVwZGF0ZUFsbChuZXh0U3RhdGUpXG4gICAgfSlcblxuICAgIC8vIEV4cG9zaW5nIHVwcHkgb2JqZWN0IG9uIHdpbmRvdyBmb3IgZGVidWdnaW5nIGFuZCB0ZXN0aW5nXG4gICAgaWYgKHRoaXMub3B0cy5kZWJ1ZyAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgd2luZG93W3RoaXMub3B0cy5pZF0gPSB0aGlzXG4gICAgfVxuXG4gICAgdGhpcy5fYWRkTGlzdGVuZXJzKClcblxuICAgIC8vIFJlLWVuYWJsZSBpZiB3ZeKAmWxsIG5lZWQgc29tZSBjYXBhYmlsaXRpZXMgb24gYm9vdCwgbGlrZSBpc01vYmlsZURldmljZVxuICAgIC8vIHRoaXMuX3NldENhcGFiaWxpdGllcygpXG4gIH1cblxuICAvLyBfc2V0Q2FwYWJpbGl0aWVzID0gKCkgPT4ge1xuICAvLyAgIGNvbnN0IGNhcGFiaWxpdGllcyA9IHtcbiAgLy8gICAgIGlzTW9iaWxlRGV2aWNlOiBpc01vYmlsZURldmljZSgpXG4gIC8vICAgfVxuXG4gIC8vICAgdGhpcy5zZXRTdGF0ZSh7XG4gIC8vICAgICAuLi50aGlzLmdldFN0YXRlKCkuY2FwYWJpbGl0aWVzLFxuICAvLyAgICAgY2FwYWJpbGl0aWVzXG4gIC8vICAgfSlcbiAgLy8gfVxuXG4gIG9uIChldmVudCwgY2FsbGJhY2spIHtcbiAgICB0aGlzLmVtaXR0ZXIub24oZXZlbnQsIGNhbGxiYWNrKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBvZmYgKGV2ZW50LCBjYWxsYmFjaykge1xuICAgIHRoaXMuZW1pdHRlci5vZmYoZXZlbnQsIGNhbGxiYWNrKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZSBvbiBhbGwgcGx1Z2lucyBhbmQgcnVuIGB1cGRhdGVgIG9uIHRoZW0uXG4gICAqIENhbGxlZCBlYWNoIHRpbWUgc3RhdGUgY2hhbmdlcy5cbiAgICpcbiAgICovXG4gIHVwZGF0ZUFsbCAoc3RhdGUpIHtcbiAgICB0aGlzLml0ZXJhdGVQbHVnaW5zKHBsdWdpbiA9PiB7XG4gICAgICBwbHVnaW4udXBkYXRlKHN0YXRlKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBzdGF0ZSB3aXRoIGEgcGF0Y2hcbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IHBhdGNoIHtmb286ICdiYXInfVxuICAgKi9cbiAgc2V0U3RhdGUgKHBhdGNoKSB7XG4gICAgdGhpcy5zdG9yZS5zZXRTdGF0ZShwYXRjaClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGN1cnJlbnQgc3RhdGUuXG4gICAqXG4gICAqIEByZXR1cm5zIHtvYmplY3R9XG4gICAqL1xuICBnZXRTdGF0ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIEJhY2sgY29tcGF0IGZvciB3aGVuIHVwcHkuc3RhdGUgaXMgdXNlZCBpbnN0ZWFkIG9mIHVwcHkuZ2V0U3RhdGUoKS5cbiAgICovXG4gIGdldCBzdGF0ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIFNob3J0aGFuZCB0byBzZXQgc3RhdGUgZm9yIGEgc3BlY2lmaWMgZmlsZS5cbiAgICovXG4gIHNldEZpbGVTdGF0ZSAoZmlsZUlELCBzdGF0ZSkge1xuICAgIGlmICghdGhpcy5nZXRTdGF0ZSgpLmZpbGVzW2ZpbGVJRF0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fu4oCZdCBzZXQgc3RhdGUgZm9yICR7ZmlsZUlEfSAodGhlIGZpbGUgY291bGQgaGF2ZSBiZWVuIHJlbW92ZWQpYClcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVzOiBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMsIHtcbiAgICAgICAgW2ZpbGVJRF06IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlSURdLCBzdGF0ZSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGkxOG5Jbml0ICgpIHtcbiAgICB0aGlzLnRyYW5zbGF0b3IgPSBuZXcgVHJhbnNsYXRvcihbdGhpcy5kZWZhdWx0TG9jYWxlLCB0aGlzLm9wdHMubG9jYWxlXSlcbiAgICB0aGlzLmxvY2FsZSA9IHRoaXMudHJhbnNsYXRvci5sb2NhbGVcbiAgICB0aGlzLmkxOG4gPSB0aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlLmJpbmQodGhpcy50cmFuc2xhdG9yKVxuICAgIHRoaXMuaTE4bkFycmF5ID0gdGhpcy50cmFuc2xhdG9yLnRyYW5zbGF0ZUFycmF5LmJpbmQodGhpcy50cmFuc2xhdG9yKVxuICB9XG5cbiAgc2V0T3B0aW9ucyAobmV3T3B0cykge1xuICAgIHRoaXMub3B0cyA9IHtcbiAgICAgIC4uLnRoaXMub3B0cyxcbiAgICAgIC4uLm5ld09wdHMsXG4gICAgICByZXN0cmljdGlvbnM6IHtcbiAgICAgICAgLi4udGhpcy5vcHRzLnJlc3RyaWN0aW9ucyxcbiAgICAgICAgLi4uKG5ld09wdHMgJiYgbmV3T3B0cy5yZXN0cmljdGlvbnMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG5ld09wdHMubWV0YSkge1xuICAgICAgdGhpcy5zZXRNZXRhKG5ld09wdHMubWV0YSlcbiAgICB9XG5cbiAgICB0aGlzLmkxOG5Jbml0KClcblxuICAgIGlmIChuZXdPcHRzLmxvY2FsZSkge1xuICAgICAgdGhpcy5pdGVyYXRlUGx1Z2lucygocGx1Z2luKSA9PiB7XG4gICAgICAgIHBsdWdpbi5zZXRPcHRpb25zKClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSgpIC8vIHNvIHRoYXQgVUkgcmUtcmVuZGVycyB3aXRoIG5ldyBvcHRpb25zXG4gIH1cblxuICByZXNldFByb2dyZXNzICgpIHtcbiAgICBjb25zdCBkZWZhdWx0UHJvZ3Jlc3MgPSB7XG4gICAgICBwZXJjZW50YWdlOiAwLFxuICAgICAgYnl0ZXNVcGxvYWRlZDogMCxcbiAgICAgIHVwbG9hZENvbXBsZXRlOiBmYWxzZSxcbiAgICAgIHVwbG9hZFN0YXJ0ZWQ6IG51bGxcbiAgICB9XG4gICAgY29uc3QgZmlsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpXG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0ge31cbiAgICBPYmplY3Qua2V5cyhmaWxlcykuZm9yRWFjaChmaWxlSUQgPT4ge1xuICAgICAgY29uc3QgdXBkYXRlZEZpbGUgPSBPYmplY3QuYXNzaWduKHt9LCBmaWxlc1tmaWxlSURdKVxuICAgICAgdXBkYXRlZEZpbGUucHJvZ3Jlc3MgPSBPYmplY3QuYXNzaWduKHt9LCB1cGRhdGVkRmlsZS5wcm9ncmVzcywgZGVmYXVsdFByb2dyZXNzKVxuICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSB1cGRhdGVkRmlsZVxuICAgIH0pXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXMsXG4gICAgICB0b3RhbFByb2dyZXNzOiAwXG4gICAgfSlcblxuICAgIHRoaXMuZW1pdCgncmVzZXQtcHJvZ3Jlc3MnKVxuICB9XG5cbiAgYWRkUHJlUHJvY2Vzc29yIChmbikge1xuICAgIHRoaXMucHJlUHJvY2Vzc29ycy5wdXNoKGZuKVxuICB9XG5cbiAgcmVtb3ZlUHJlUHJvY2Vzc29yIChmbikge1xuICAgIGNvbnN0IGkgPSB0aGlzLnByZVByb2Nlc3NvcnMuaW5kZXhPZihmbilcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucHJlUHJvY2Vzc29ycy5zcGxpY2UoaSwgMSlcbiAgICB9XG4gIH1cblxuICBhZGRQb3N0UHJvY2Vzc29yIChmbikge1xuICAgIHRoaXMucG9zdFByb2Nlc3NvcnMucHVzaChmbilcbiAgfVxuXG4gIHJlbW92ZVBvc3RQcm9jZXNzb3IgKGZuKSB7XG4gICAgY29uc3QgaSA9IHRoaXMucG9zdFByb2Nlc3NvcnMuaW5kZXhPZihmbilcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucG9zdFByb2Nlc3NvcnMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG5cbiAgYWRkVXBsb2FkZXIgKGZuKSB7XG4gICAgdGhpcy51cGxvYWRlcnMucHVzaChmbilcbiAgfVxuXG4gIHJlbW92ZVVwbG9hZGVyIChmbikge1xuICAgIGNvbnN0IGkgPSB0aGlzLnVwbG9hZGVycy5pbmRleE9mKGZuKVxuICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgdGhpcy51cGxvYWRlcnMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG5cbiAgc2V0TWV0YSAoZGF0YSkge1xuICAgIGNvbnN0IHVwZGF0ZWRNZXRhID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLm1ldGEsIGRhdGEpXG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuXG4gICAgT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlSURdID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0sIHtcbiAgICAgICAgbWV0YTogT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0ubWV0YSwgZGF0YSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHRoaXMubG9nKCdBZGRpbmcgbWV0YWRhdGE6JylcbiAgICB0aGlzLmxvZyhkYXRhKVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtZXRhOiB1cGRhdGVkTWV0YSxcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXNcbiAgICB9KVxuICB9XG5cbiAgc2V0RmlsZU1ldGEgKGZpbGVJRCwgZGF0YSkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBpZiAoIXVwZGF0ZWRGaWxlc1tmaWxlSURdKSB7XG4gICAgICB0aGlzLmxvZygnV2FzIHRyeWluZyB0byBzZXQgbWV0YWRhdGEgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICcsIGZpbGVJRClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBuZXdNZXRhID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVJRF0ubWV0YSwgZGF0YSlcbiAgICB1cGRhdGVkRmlsZXNbZmlsZUlEXSA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlSURdLCB7XG4gICAgICBtZXRhOiBuZXdNZXRhXG4gICAgfSlcbiAgICB0aGlzLnNldFN0YXRlKHsgZmlsZXM6IHVwZGF0ZWRGaWxlcyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGZpbGUgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlEIFRoZSBJRCBvZiB0aGUgZmlsZSBvYmplY3QgdG8gcmV0dXJuLlxuICAgKi9cbiAgZ2V0RmlsZSAoZmlsZUlEKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlSURdXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBmaWxlcyBpbiBhbiBhcnJheS5cbiAgICovXG4gIGdldEZpbGVzICgpIHtcbiAgICBjb25zdCB7IGZpbGVzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZmlsZXMpLm1hcCgoZmlsZUlEKSA9PiBmaWxlc1tmaWxlSURdKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIG1pbk51bWJlck9mRmlsZXMgcmVzdHJpY3Rpb24gaXMgcmVhY2hlZCBiZWZvcmUgdXBsb2FkaW5nLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2NoZWNrTWluTnVtYmVyT2ZGaWxlcyAoZmlsZXMpIHtcbiAgICBjb25zdCB7IG1pbk51bWJlck9mRmlsZXMgfSA9IHRoaXMub3B0cy5yZXN0cmljdGlvbnNcbiAgICBpZiAoT2JqZWN0LmtleXMoZmlsZXMpLmxlbmd0aCA8IG1pbk51bWJlck9mRmlsZXMpIHtcbiAgICAgIHRocm93IG5ldyBSZXN0cmljdGlvbkVycm9yKGAke3RoaXMuaTE4bigneW91SGF2ZVRvQXRMZWFzdFNlbGVjdFgnLCB7IHNtYXJ0X2NvdW50OiBtaW5OdW1iZXJPZkZpbGVzIH0pfWApXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGZpbGUgcGFzc2VzIGEgc2V0IG9mIHJlc3RyaWN0aW9ucyBzZXQgaW4gb3B0aW9uczogbWF4RmlsZVNpemUsXG4gICAqIG1heE51bWJlck9mRmlsZXMgYW5kIGFsbG93ZWRGaWxlVHlwZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBmaWxlcyBPYmplY3Qgb2YgSURzIOKGkiBmaWxlcyBhbHJlYWR5IGFkZGVkXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBmaWxlIG9iamVjdCB0byBjaGVja1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2NoZWNrUmVzdHJpY3Rpb25zIChmaWxlcywgZmlsZSkge1xuICAgIGNvbnN0IHsgbWF4RmlsZVNpemUsIG1heE51bWJlck9mRmlsZXMsIGFsbG93ZWRGaWxlVHlwZXMgfSA9IHRoaXMub3B0cy5yZXN0cmljdGlvbnNcblxuICAgIGlmIChtYXhOdW1iZXJPZkZpbGVzKSB7XG4gICAgICBpZiAoT2JqZWN0LmtleXMoZmlsZXMpLmxlbmd0aCArIDEgPiBtYXhOdW1iZXJPZkZpbGVzKSB7XG4gICAgICAgIHRocm93IG5ldyBSZXN0cmljdGlvbkVycm9yKGAke3RoaXMuaTE4bigneW91Q2FuT25seVVwbG9hZFgnLCB7IHNtYXJ0X2NvdW50OiBtYXhOdW1iZXJPZkZpbGVzIH0pfWApXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFsbG93ZWRGaWxlVHlwZXMpIHtcbiAgICAgIGNvbnN0IGlzQ29ycmVjdEZpbGVUeXBlID0gYWxsb3dlZEZpbGVUeXBlcy5zb21lKCh0eXBlKSA9PiB7XG4gICAgICAgIC8vIGlzIHRoaXMgaXMgYSBtaW1lLXR5cGVcbiAgICAgICAgaWYgKHR5cGUuaW5kZXhPZignLycpID4gLTEpIHtcbiAgICAgICAgICBpZiAoIWZpbGUudHlwZSkgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgcmV0dXJuIG1hdGNoKGZpbGUudHlwZS5yZXBsYWNlKC87Lio/JC8sICcnKSwgdHlwZSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG90aGVyd2lzZSB0aGlzIGlzIGxpa2VseSBhbiBleHRlbnNpb25cbiAgICAgICAgaWYgKHR5cGVbMF0gPT09ICcuJykge1xuICAgICAgICAgIHJldHVybiBmaWxlLmV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpID09PSB0eXBlLnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9KVxuXG4gICAgICBpZiAoIWlzQ29ycmVjdEZpbGVUeXBlKSB7XG4gICAgICAgIGNvbnN0IGFsbG93ZWRGaWxlVHlwZXNTdHJpbmcgPSBhbGxvd2VkRmlsZVR5cGVzLmpvaW4oJywgJylcbiAgICAgICAgdGhyb3cgbmV3IFJlc3RyaWN0aW9uRXJyb3IodGhpcy5pMThuKCd5b3VDYW5Pbmx5VXBsb2FkRmlsZVR5cGVzJywgeyB0eXBlczogYWxsb3dlZEZpbGVUeXBlc1N0cmluZyB9KSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXZSBjYW4ndCBjaGVjayBtYXhGaWxlU2l6ZSBpZiB0aGUgc2l6ZSBpcyB1bmtub3duLlxuICAgIGlmIChtYXhGaWxlU2l6ZSAmJiBmaWxlLmRhdGEuc2l6ZSAhPSBudWxsKSB7XG4gICAgICBpZiAoZmlsZS5kYXRhLnNpemUgPiBtYXhGaWxlU2l6ZSkge1xuICAgICAgICB0aHJvdyBuZXcgUmVzdHJpY3Rpb25FcnJvcih0aGlzLmkxOG4oJ2V4Y2VlZHNTaXplMicsIHtcbiAgICAgICAgICBiYWNrd2FyZHNDb21wYXQ6IHRoaXMuaTE4bignZXhjZWVkc1NpemUnKSxcbiAgICAgICAgICBzaXplOiBwcmV0dHlCeXRlcyhtYXhGaWxlU2l6ZSlcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgYW4gZXJyb3IsIHNldHMgSW5mb3JtZXIgbWVzc2FnZSwgdGhlbiB0aHJvd3MgdGhlIGVycm9yLlxuICAgKiBFbWl0cyBhICdyZXN0cmljdGlvbi1mYWlsZWQnIGV2ZW50IGlmIGl04oCZcyBhIHJlc3RyaWN0aW9uIGVycm9yXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0IHwgc3RyaW5nfSBlcnIg4oCUIEVycm9yIG9iamVjdCBvciBwbGFpbiBzdHJpbmcgbWVzc2FnZVxuICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuc2hvd0luZm9ybWVyPXRydWVdIOKAlCBTb21ldGltZXMgZGV2ZWxvcGVyIG1pZ2h0IHdhbnQgdG8gc2hvdyBJbmZvcm1lciBtYW51YWxseVxuICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuZmlsZT1udWxsXSDigJQgRmlsZSBvYmplY3QgdXNlZCB0byBlbWl0IHRoZSByZXN0cmljdGlvbiBlcnJvclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRocm93RXJyPXRydWVdIOKAlCBFcnJvcnMgc2hvdWxkbuKAmXQgYmUgdGhyb3duLCBmb3IgZXhhbXBsZSwgaW4gYHVwbG9hZC1lcnJvcmAgZXZlbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zaG93T3JMb2dFcnJvckFuZFRocm93IChlcnIsIHsgc2hvd0luZm9ybWVyID0gdHJ1ZSwgZmlsZSA9IG51bGwsIHRocm93RXJyID0gdHJ1ZSB9ID0ge30pIHtcbiAgICBjb25zdCBtZXNzYWdlID0gdHlwZW9mIGVyciA9PT0gJ29iamVjdCcgPyBlcnIubWVzc2FnZSA6IGVyclxuICAgIGNvbnN0IGRldGFpbHMgPSAodHlwZW9mIGVyciA9PT0gJ29iamVjdCcgJiYgZXJyLmRldGFpbHMpID8gZXJyLmRldGFpbHMgOiAnJ1xuXG4gICAgLy8gUmVzdHJpY3Rpb24gZXJyb3JzIHNob3VsZCBiZSBsb2dnZWQsIGJ1dCBub3QgYXMgZXJyb3JzLFxuICAgIC8vIGFzIHRoZXkgYXJlIGV4cGVjdGVkIGFuZCBzaG93biBpbiB0aGUgVUkuXG4gICAgbGV0IGxvZ01lc3NhZ2VXaXRoRGV0YWlscyA9IG1lc3NhZ2VcbiAgICBpZiAoZGV0YWlscykge1xuICAgICAgbG9nTWVzc2FnZVdpdGhEZXRhaWxzICs9ICcgJyArIGRldGFpbHNcbiAgICB9XG4gICAgaWYgKGVyci5pc1Jlc3RyaWN0aW9uKSB7XG4gICAgICB0aGlzLmxvZyhsb2dNZXNzYWdlV2l0aERldGFpbHMpXG4gICAgICB0aGlzLmVtaXQoJ3Jlc3RyaWN0aW9uLWZhaWxlZCcsIGZpbGUsIGVycilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2cobG9nTWVzc2FnZVdpdGhEZXRhaWxzLCAnZXJyb3InKVxuICAgIH1cblxuICAgIC8vIFNvbWV0aW1lcyBpbmZvcm1lciBoYXMgdG8gYmUgc2hvd24gbWFudWFsbHkgYnkgdGhlIGRldmVsb3BlcixcbiAgICAvLyBmb3IgZXhhbXBsZSwgaW4gYG9uQmVmb3JlRmlsZUFkZGVkYC5cbiAgICBpZiAoc2hvd0luZm9ybWVyKSB7XG4gICAgICB0aGlzLmluZm8oeyBtZXNzYWdlOiBtZXNzYWdlLCBkZXRhaWxzOiBkZXRhaWxzIH0sICdlcnJvcicsIDUwMDApXG4gICAgfVxuXG4gICAgaWYgKHRocm93RXJyKSB7XG4gICAgICB0aHJvdyAodHlwZW9mIGVyciA9PT0gJ29iamVjdCcgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKSlcbiAgICB9XG4gIH1cblxuICBfYXNzZXJ0TmV3VXBsb2FkQWxsb3dlZCAoZmlsZSkge1xuICAgIGNvbnN0IHsgYWxsb3dOZXdVcGxvYWQgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuXG4gICAgaWYgKGFsbG93TmV3VXBsb2FkID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5fc2hvd09yTG9nRXJyb3JBbmRUaHJvdyhuZXcgUmVzdHJpY3Rpb25FcnJvcih0aGlzLmkxOG4oJ25vTmV3QWxyZWFkeVVwbG9hZGluZycpKSwgeyBmaWxlIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGZpbGUgc3RhdGUgb2JqZWN0IGJhc2VkIG9uIHVzZXItcHJvdmlkZWQgYGFkZEZpbGUoKWAgb3B0aW9ucy5cbiAgICpcbiAgICogTm90ZSB0aGlzIGlzIGV4dHJlbWVseSBzaWRlLWVmZmVjdGZ1bCBhbmQgc2hvdWxkIG9ubHkgYmUgZG9uZSB3aGVuIGEgZmlsZSBzdGF0ZSBvYmplY3Qgd2lsbCBiZSBhZGRlZCB0byBzdGF0ZSBpbW1lZGlhdGVseSBhZnRlcndhcmQhXG4gICAqXG4gICAqIFRoZSBgZmlsZXNgIHZhbHVlIGlzIHBhc3NlZCBpbiBiZWNhdXNlIGl0IG1heSBiZSB1cGRhdGVkIGJ5IHRoZSBjYWxsZXIgd2l0aG91dCB1cGRhdGluZyB0aGUgc3RvcmUuXG4gICAqL1xuICBfY2hlY2tBbmRDcmVhdGVGaWxlU3RhdGVPYmplY3QgKGZpbGVzLCBmaWxlKSB7XG4gICAgY29uc3QgZmlsZVR5cGUgPSBnZXRGaWxlVHlwZShmaWxlKVxuICAgIGZpbGUudHlwZSA9IGZpbGVUeXBlXG5cbiAgICBjb25zdCBvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdCA9IHRoaXMub3B0cy5vbkJlZm9yZUZpbGVBZGRlZChmaWxlLCBmaWxlcylcblxuICAgIGlmIChvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgIC8vIERvbuKAmXQgc2hvdyBVSSBpbmZvIGZvciB0aGlzIGVycm9yLCBhcyBpdCBzaG91bGQgYmUgZG9uZSBieSB0aGUgZGV2ZWxvcGVyXG4gICAgICB0aGlzLl9zaG93T3JMb2dFcnJvckFuZFRocm93KG5ldyBSZXN0cmljdGlvbkVycm9yKCdDYW5ub3QgYWRkIHRoZSBmaWxlIGJlY2F1c2Ugb25CZWZvcmVGaWxlQWRkZWQgcmV0dXJuZWQgZmFsc2UuJyksIHsgc2hvd0luZm9ybWVyOiBmYWxzZSwgZmlsZSB9KVxuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb25CZWZvcmVGaWxlQWRkZWRSZXN1bHQgPT09ICdvYmplY3QnICYmIG9uQmVmb3JlRmlsZUFkZGVkUmVzdWx0KSB7XG4gICAgICBmaWxlID0gb25CZWZvcmVGaWxlQWRkZWRSZXN1bHRcbiAgICB9XG5cbiAgICBsZXQgZmlsZU5hbWVcbiAgICBpZiAoZmlsZS5uYW1lKSB7XG4gICAgICBmaWxlTmFtZSA9IGZpbGUubmFtZVxuICAgIH0gZWxzZSBpZiAoZmlsZVR5cGUuc3BsaXQoJy8nKVswXSA9PT0gJ2ltYWdlJykge1xuICAgICAgZmlsZU5hbWUgPSBmaWxlVHlwZS5zcGxpdCgnLycpWzBdICsgJy4nICsgZmlsZVR5cGUuc3BsaXQoJy8nKVsxXVxuICAgIH0gZWxzZSB7XG4gICAgICBmaWxlTmFtZSA9ICdub25hbWUnXG4gICAgfVxuICAgIGNvbnN0IGZpbGVFeHRlbnNpb24gPSBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbihmaWxlTmFtZSkuZXh0ZW5zaW9uXG4gICAgY29uc3QgaXNSZW1vdGUgPSBmaWxlLmlzUmVtb3RlIHx8IGZhbHNlXG5cbiAgICBjb25zdCBmaWxlSUQgPSBnZW5lcmF0ZUZpbGVJRChmaWxlKVxuXG4gICAgaWYgKGZpbGVzW2ZpbGVJRF0pIHtcbiAgICAgIHRoaXMuX3Nob3dPckxvZ0Vycm9yQW5kVGhyb3cobmV3IFJlc3RyaWN0aW9uRXJyb3IodGhpcy5pMThuKCdub0R1cGxpY2F0ZXMnLCB7IGZpbGVOYW1lIH0pKSwgeyBmaWxlIH0pXG4gICAgfVxuXG4gICAgY29uc3QgbWV0YSA9IGZpbGUubWV0YSB8fCB7fVxuICAgIG1ldGEubmFtZSA9IGZpbGVOYW1lXG4gICAgbWV0YS50eXBlID0gZmlsZVR5cGVcblxuICAgIC8vIGBudWxsYCBtZWFucyB0aGUgc2l6ZSBpcyB1bmtub3duLlxuICAgIGNvbnN0IHNpemUgPSBpc0Zpbml0ZShmaWxlLmRhdGEuc2l6ZSkgPyBmaWxlLmRhdGEuc2l6ZSA6IG51bGxcbiAgICBjb25zdCBuZXdGaWxlID0ge1xuICAgICAgc291cmNlOiBmaWxlLnNvdXJjZSB8fCAnJyxcbiAgICAgIGlkOiBmaWxlSUQsXG4gICAgICBuYW1lOiBmaWxlTmFtZSxcbiAgICAgIGV4dGVuc2lvbjogZmlsZUV4dGVuc2lvbiB8fCAnJyxcbiAgICAgIG1ldGE6IHtcbiAgICAgICAgLi4udGhpcy5nZXRTdGF0ZSgpLm1ldGEsXG4gICAgICAgIC4uLm1ldGFcbiAgICAgIH0sXG4gICAgICB0eXBlOiBmaWxlVHlwZSxcbiAgICAgIGRhdGE6IGZpbGUuZGF0YSxcbiAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgIGJ5dGVzVXBsb2FkZWQ6IDAsXG4gICAgICAgIGJ5dGVzVG90YWw6IHNpemUsXG4gICAgICAgIHVwbG9hZENvbXBsZXRlOiBmYWxzZSxcbiAgICAgICAgdXBsb2FkU3RhcnRlZDogbnVsbFxuICAgICAgfSxcbiAgICAgIHNpemU6IHNpemUsXG4gICAgICBpc1JlbW90ZTogaXNSZW1vdGUsXG4gICAgICByZW1vdGU6IGZpbGUucmVtb3RlIHx8ICcnLFxuICAgICAgcHJldmlldzogZmlsZS5wcmV2aWV3XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2NoZWNrUmVzdHJpY3Rpb25zKGZpbGVzLCBuZXdGaWxlKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5fc2hvd09yTG9nRXJyb3JBbmRUaHJvdyhlcnIsIHsgZmlsZTogbmV3RmlsZSB9KVxuICAgIH1cblxuICAgIHJldHVybiBuZXdGaWxlXG4gIH1cblxuICAvLyBTY2hlZHVsZSBhbiB1cGxvYWQgaWYgYGF1dG9Qcm9jZWVkYCBpcyBlbmFibGVkLlxuICBfc3RhcnRJZkF1dG9Qcm9jZWVkICgpIHtcbiAgICBpZiAodGhpcy5vcHRzLmF1dG9Qcm9jZWVkICYmICF0aGlzLnNjaGVkdWxlZEF1dG9Qcm9jZWVkKSB7XG4gICAgICB0aGlzLnNjaGVkdWxlZEF1dG9Qcm9jZWVkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVkQXV0b1Byb2NlZWQgPSBudWxsXG4gICAgICAgIHRoaXMudXBsb2FkKCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGlmICghZXJyLmlzUmVzdHJpY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMubG9nKGVyci5zdGFjayB8fCBlcnIubWVzc2FnZSB8fCBlcnIpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSwgNClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgbmV3IGZpbGUgdG8gYHN0YXRlLmZpbGVzYC4gVGhpcyB3aWxsIHJ1biBgb25CZWZvcmVGaWxlQWRkZWRgLFxuICAgKiB0cnkgdG8gZ3Vlc3MgZmlsZSB0eXBlIGluIGEgY2xldmVyIHdheSwgY2hlY2sgZmlsZSBhZ2FpbnN0IHJlc3RyaWN0aW9ucyxcbiAgICogYW5kIHN0YXJ0IGFuIHVwbG9hZCBpZiBgYXV0b1Byb2NlZWQgPT09IHRydWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gZmlsZSBvYmplY3QgdG8gYWRkXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IGlkIGZvciB0aGUgYWRkZWQgZmlsZVxuICAgKi9cbiAgYWRkRmlsZSAoZmlsZSkge1xuICAgIHRoaXMuX2Fzc2VydE5ld1VwbG9hZEFsbG93ZWQoZmlsZSlcblxuICAgIGNvbnN0IHsgZmlsZXMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgIGNvbnN0IG5ld0ZpbGUgPSB0aGlzLl9jaGVja0FuZENyZWF0ZUZpbGVTdGF0ZU9iamVjdChmaWxlcywgZmlsZSlcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHtcbiAgICAgICAgLi4uZmlsZXMsXG4gICAgICAgIFtuZXdGaWxlLmlkXTogbmV3RmlsZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLmVtaXQoJ2ZpbGUtYWRkZWQnLCBuZXdGaWxlKVxuICAgIHRoaXMubG9nKGBBZGRlZCBmaWxlOiAke25ld0ZpbGUubmFtZX0sICR7bmV3RmlsZS5pZH0sIG1pbWUgdHlwZTogJHtuZXdGaWxlLnR5cGV9YClcblxuICAgIHRoaXMuX3N0YXJ0SWZBdXRvUHJvY2VlZCgpXG5cbiAgICByZXR1cm4gbmV3RmlsZS5pZFxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBtdWx0aXBsZSBmaWxlcyB0byBgc3RhdGUuZmlsZXNgLiBTZWUgdGhlIGBhZGRGaWxlKClgIGRvY3VtZW50YXRpb24uXG4gICAqXG4gICAqIFRoaXMgY3V0cyBzb21lIGNvcm5lcnMgZm9yIHBlcmZvcm1hbmNlLCBzbyBzaG91bGQgdHlwaWNhbGx5IG9ubHkgYmUgdXNlZCBpbiBjYXNlcyB3aGVyZSB0aGVyZSBtYXkgYmUgYSBsb3Qgb2YgZmlsZXMuXG4gICAqXG4gICAqIElmIGFuIGVycm9yIG9jY3VycyB3aGlsZSBhZGRpbmcgYSBmaWxlLCBpdCBpcyBsb2dnZWQgYW5kIHRoZSB1c2VyIGlzIG5vdGlmaWVkLiBUaGlzIGlzIGdvb2QgZm9yIFVJIHBsdWdpbnMsIGJ1dCBub3QgZm9yIHByb2dyYW1tYXRpYyB1c2UuIFByb2dyYW1tYXRpYyB1c2VycyBzaG91bGQgdXN1YWxseSBzdGlsbCB1c2UgYGFkZEZpbGUoKWAgb24gaW5kaXZpZHVhbCBmaWxlcy5cbiAgICovXG4gIGFkZEZpbGVzIChmaWxlRGVzY3JpcHRvcnMpIHtcbiAgICB0aGlzLl9hc3NlcnROZXdVcGxvYWRBbGxvd2VkKClcblxuICAgIC8vIGNyZWF0ZSBhIGNvcHkgb2YgdGhlIGZpbGVzIG9iamVjdCBvbmx5IG9uY2VcbiAgICBjb25zdCBmaWxlcyA9IHsgLi4udGhpcy5nZXRTdGF0ZSgpLmZpbGVzIH1cbiAgICBjb25zdCBuZXdGaWxlcyA9IFtdXG4gICAgY29uc3QgZXJyb3JzID0gW11cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbGVEZXNjcmlwdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbmV3RmlsZSA9IHRoaXMuX2NoZWNrQW5kQ3JlYXRlRmlsZVN0YXRlT2JqZWN0KGZpbGVzLCBmaWxlRGVzY3JpcHRvcnNbaV0pXG4gICAgICAgIG5ld0ZpbGVzLnB1c2gobmV3RmlsZSlcbiAgICAgICAgZmlsZXNbbmV3RmlsZS5pZF0gPSBuZXdGaWxlXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKCFlcnIuaXNSZXN0cmljdGlvbikge1xuICAgICAgICAgIGVycm9ycy5wdXNoKGVycilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlcyB9KVxuXG4gICAgbmV3RmlsZXMuZm9yRWFjaCgobmV3RmlsZSkgPT4ge1xuICAgICAgdGhpcy5lbWl0KCdmaWxlLWFkZGVkJywgbmV3RmlsZSlcbiAgICB9KVxuXG4gICAgaWYgKG5ld0ZpbGVzLmxlbmd0aCA+IDUpIHtcbiAgICAgIHRoaXMubG9nKGBBZGRlZCBiYXRjaCBvZiAke25ld0ZpbGVzLmxlbmd0aH0gZmlsZXNgKVxuICAgIH0gZWxzZSB7XG4gICAgICBPYmplY3Qua2V5cyhuZXdGaWxlcykuZm9yRWFjaChmaWxlSUQgPT4ge1xuICAgICAgICB0aGlzLmxvZyhgQWRkZWQgZmlsZTogJHtuZXdGaWxlc1tmaWxlSURdLm5hbWV9XFxuIGlkOiAke25ld0ZpbGVzW2ZpbGVJRF0uaWR9XFxuIHR5cGU6ICR7bmV3RmlsZXNbZmlsZUlEXS50eXBlfWApXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChuZXdGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLl9zdGFydElmQXV0b1Byb2NlZWQoKVxuICAgIH1cblxuICAgIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IG1lc3NhZ2UgPSAnTXVsdGlwbGUgZXJyb3JzIG9jY3VycmVkIHdoaWxlIGFkZGluZyBmaWxlczpcXG4nXG4gICAgICBlcnJvcnMuZm9yRWFjaCgoc3ViRXJyb3IpID0+IHtcbiAgICAgICAgbWVzc2FnZSArPSBgXFxuICogJHtzdWJFcnJvci5tZXNzYWdlfWBcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuaW5mbyh7XG4gICAgICAgIG1lc3NhZ2U6IHRoaXMuaTE4bignYWRkQnVsa0ZpbGVzRmFpbGVkJywgeyBzbWFydF9jb3VudDogZXJyb3JzLmxlbmd0aCB9KSxcbiAgICAgICAgZGV0YWlsczogbWVzc2FnZVxuICAgICAgfSwgJ2Vycm9yJywgNTAwMClcblxuICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpXG4gICAgICBlcnIuZXJyb3JzID0gZXJyb3JzXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICByZW1vdmVGaWxlcyAoZmlsZUlEcykge1xuICAgIGNvbnN0IHsgZmlsZXMsIGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSB7IC4uLmZpbGVzIH1cbiAgICBjb25zdCB1cGRhdGVkVXBsb2FkcyA9IHsgLi4uY3VycmVudFVwbG9hZHMgfVxuXG4gICAgY29uc3QgcmVtb3ZlZEZpbGVzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgIGZpbGVJRHMuZm9yRWFjaCgoZmlsZUlEKSA9PiB7XG4gICAgICBpZiAoZmlsZXNbZmlsZUlEXSkge1xuICAgICAgICByZW1vdmVkRmlsZXNbZmlsZUlEXSA9IGZpbGVzW2ZpbGVJRF1cbiAgICAgICAgZGVsZXRlIHVwZGF0ZWRGaWxlc1tmaWxlSURdXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIFJlbW92ZSBmaWxlcyBmcm9tIHRoZSBgZmlsZUlEc2AgbGlzdCBpbiBlYWNoIHVwbG9hZC5cbiAgICBmdW5jdGlvbiBmaWxlSXNOb3RSZW1vdmVkICh1cGxvYWRGaWxlSUQpIHtcbiAgICAgIHJldHVybiByZW1vdmVkRmlsZXNbdXBsb2FkRmlsZUlEXSA9PT0gdW5kZWZpbmVkXG4gICAgfVxuICAgIGNvbnN0IHVwbG9hZHNUb1JlbW92ZSA9IFtdXG4gICAgT2JqZWN0LmtleXModXBkYXRlZFVwbG9hZHMpLmZvckVhY2goKHVwbG9hZElEKSA9PiB7XG4gICAgICBjb25zdCBuZXdGaWxlSURzID0gY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLmZpbGVJRHMuZmlsdGVyKGZpbGVJc05vdFJlbW92ZWQpXG5cbiAgICAgIC8vIFJlbW92ZSB0aGUgdXBsb2FkIGlmIG5vIGZpbGVzIGFyZSBhc3NvY2lhdGVkIHdpdGggaXQgYW55bW9yZS5cbiAgICAgIGlmIChuZXdGaWxlSURzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB1cGxvYWRzVG9SZW1vdmUucHVzaCh1cGxvYWRJRClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZWRVcGxvYWRzW3VwbG9hZElEXSA9IHtcbiAgICAgICAgLi4uY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLFxuICAgICAgICBmaWxlSURzOiBuZXdGaWxlSURzXG4gICAgICB9XG4gICAgfSlcblxuICAgIHVwbG9hZHNUb1JlbW92ZS5mb3JFYWNoKCh1cGxvYWRJRCkgPT4ge1xuICAgICAgZGVsZXRlIHVwZGF0ZWRVcGxvYWRzW3VwbG9hZElEXVxuICAgIH0pXG5cbiAgICBjb25zdCBzdGF0ZVVwZGF0ZSA9IHtcbiAgICAgIGN1cnJlbnRVcGxvYWRzOiB1cGRhdGVkVXBsb2FkcyxcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXNcbiAgICB9XG5cbiAgICAvLyBJZiBhbGwgZmlsZXMgd2VyZSByZW1vdmVkIC0gYWxsb3cgbmV3IHVwbG9hZHMhXG4gICAgaWYgKE9iamVjdC5rZXlzKHVwZGF0ZWRGaWxlcykubGVuZ3RoID09PSAwKSB7XG4gICAgICBzdGF0ZVVwZGF0ZS5hbGxvd05ld1VwbG9hZCA9IHRydWVcbiAgICAgIHN0YXRlVXBkYXRlLmVycm9yID0gbnVsbFxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoc3RhdGVVcGRhdGUpXG4gICAgdGhpcy5fY2FsY3VsYXRlVG90YWxQcm9ncmVzcygpXG5cbiAgICBjb25zdCByZW1vdmVkRmlsZUlEcyA9IE9iamVjdC5rZXlzKHJlbW92ZWRGaWxlcylcbiAgICByZW1vdmVkRmlsZUlEcy5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgIHRoaXMuZW1pdCgnZmlsZS1yZW1vdmVkJywgcmVtb3ZlZEZpbGVzW2ZpbGVJRF0pXG4gICAgfSlcblxuICAgIGlmIChyZW1vdmVkRmlsZUlEcy5sZW5ndGggPiA1KSB7XG4gICAgICB0aGlzLmxvZyhgUmVtb3ZlZCAke3JlbW92ZWRGaWxlSURzLmxlbmd0aH0gZmlsZXNgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvZyhgUmVtb3ZlZCBmaWxlczogJHtyZW1vdmVkRmlsZUlEcy5qb2luKCcsICcpfWApXG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlRmlsZSAoZmlsZUlEKSB7XG4gICAgdGhpcy5yZW1vdmVGaWxlcyhbZmlsZUlEXSlcbiAgfVxuXG4gIHBhdXNlUmVzdW1lIChmaWxlSUQpIHtcbiAgICBpZiAoIXRoaXMuZ2V0U3RhdGUoKS5jYXBhYmlsaXRpZXMucmVzdW1hYmxlVXBsb2FkcyB8fFxuICAgICAgICAgdGhpcy5nZXRGaWxlKGZpbGVJRCkudXBsb2FkQ29tcGxldGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHdhc1BhdXNlZCA9IHRoaXMuZ2V0RmlsZShmaWxlSUQpLmlzUGF1c2VkIHx8IGZhbHNlXG4gICAgY29uc3QgaXNQYXVzZWQgPSAhd2FzUGF1c2VkXG5cbiAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlSUQsIHtcbiAgICAgIGlzUGF1c2VkOiBpc1BhdXNlZFxuICAgIH0pXG5cbiAgICB0aGlzLmVtaXQoJ3VwbG9hZC1wYXVzZScsIGZpbGVJRCwgaXNQYXVzZWQpXG5cbiAgICByZXR1cm4gaXNQYXVzZWRcbiAgfVxuXG4gIHBhdXNlQWxsICgpIHtcbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpXG4gICAgY29uc3QgaW5Qcm9ncmVzc1VwZGF0ZWRGaWxlcyA9IE9iamVjdC5rZXlzKHVwZGF0ZWRGaWxlcykuZmlsdGVyKChmaWxlKSA9PiB7XG4gICAgICByZXR1cm4gIXVwZGF0ZWRGaWxlc1tmaWxlXS5wcm9ncmVzcy51cGxvYWRDb21wbGV0ZSAmJlxuICAgICAgICAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlXS5wcm9ncmVzcy51cGxvYWRTdGFydGVkXG4gICAgfSlcblxuICAgIGluUHJvZ3Jlc3NVcGRhdGVkRmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgY29uc3QgdXBkYXRlZEZpbGUgPSBPYmplY3QuYXNzaWduKHt9LCB1cGRhdGVkRmlsZXNbZmlsZV0sIHtcbiAgICAgICAgaXNQYXVzZWQ6IHRydWVcbiAgICAgIH0pXG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZV0gPSB1cGRhdGVkRmlsZVxuICAgIH0pXG5cbiAgICB0aGlzLnNldFN0YXRlKHsgZmlsZXM6IHVwZGF0ZWRGaWxlcyB9KVxuICAgIHRoaXMuZW1pdCgncGF1c2UtYWxsJylcbiAgfVxuXG4gIHJlc3VtZUFsbCAoKSB7XG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgIGNvbnN0IGluUHJvZ3Jlc3NVcGRhdGVkRmlsZXMgPSBPYmplY3Qua2V5cyh1cGRhdGVkRmlsZXMpLmZpbHRlcigoZmlsZSkgPT4ge1xuICAgICAgcmV0dXJuICF1cGRhdGVkRmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkQ29tcGxldGUgJiZcbiAgICAgICAgICAgICB1cGRhdGVkRmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZFxuICAgIH0pXG5cbiAgICBpblByb2dyZXNzVXBkYXRlZEZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVdLCB7XG4gICAgICAgIGlzUGF1c2VkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IG51bGxcbiAgICAgIH0pXG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZV0gPSB1cGRhdGVkRmlsZVxuICAgIH0pXG4gICAgdGhpcy5zZXRTdGF0ZSh7IGZpbGVzOiB1cGRhdGVkRmlsZXMgfSlcblxuICAgIHRoaXMuZW1pdCgncmVzdW1lLWFsbCcpXG4gIH1cblxuICByZXRyeUFsbCAoKSB7XG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgIGNvbnN0IGZpbGVzVG9SZXRyeSA9IE9iamVjdC5rZXlzKHVwZGF0ZWRGaWxlcykuZmlsdGVyKGZpbGUgPT4ge1xuICAgICAgcmV0dXJuIHVwZGF0ZWRGaWxlc1tmaWxlXS5lcnJvclxuICAgIH0pXG5cbiAgICBmaWxlc1RvUmV0cnkuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgY29uc3QgdXBkYXRlZEZpbGUgPSBPYmplY3QuYXNzaWduKHt9LCB1cGRhdGVkRmlsZXNbZmlsZV0sIHtcbiAgICAgICAgaXNQYXVzZWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogbnVsbFxuICAgICAgfSlcbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlXSA9IHVwZGF0ZWRGaWxlXG4gICAgfSlcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXMsXG4gICAgICBlcnJvcjogbnVsbFxuICAgIH0pXG5cbiAgICB0aGlzLmVtaXQoJ3JldHJ5LWFsbCcsIGZpbGVzVG9SZXRyeSlcblxuICAgIGNvbnN0IHVwbG9hZElEID0gdGhpcy5fY3JlYXRlVXBsb2FkKGZpbGVzVG9SZXRyeSwge1xuICAgICAgZm9yY2VBbGxvd05ld1VwbG9hZDogdHJ1ZSAvLyBjcmVhdGUgbmV3IHVwbG9hZCBldmVuIGlmIGFsbG93TmV3VXBsb2FkOiBmYWxzZVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXMuX3J1blVwbG9hZCh1cGxvYWRJRClcbiAgfVxuXG4gIGNhbmNlbEFsbCAoKSB7XG4gICAgdGhpcy5lbWl0KCdjYW5jZWwtYWxsJylcblxuICAgIGNvbnN0IHsgZmlsZXMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuXG4gICAgY29uc3QgZmlsZUlEcyA9IE9iamVjdC5rZXlzKGZpbGVzKVxuICAgIGlmIChmaWxlSURzLmxlbmd0aCkge1xuICAgICAgdGhpcy5yZW1vdmVGaWxlcyhmaWxlSURzKVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdG90YWxQcm9ncmVzczogMCxcbiAgICAgIGVycm9yOiBudWxsXG4gICAgfSlcbiAgfVxuXG4gIHJldHJ5VXBsb2FkIChmaWxlSUQpIHtcbiAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlSUQsIHtcbiAgICAgIGVycm9yOiBudWxsLFxuICAgICAgaXNQYXVzZWQ6IGZhbHNlXG4gICAgfSlcblxuICAgIHRoaXMuZW1pdCgndXBsb2FkLXJldHJ5JywgZmlsZUlEKVxuXG4gICAgY29uc3QgdXBsb2FkSUQgPSB0aGlzLl9jcmVhdGVVcGxvYWQoW2ZpbGVJRF0sIHtcbiAgICAgIGZvcmNlQWxsb3dOZXdVcGxvYWQ6IHRydWUgLy8gY3JlYXRlIG5ldyB1cGxvYWQgZXZlbiBpZiBhbGxvd05ld1VwbG9hZDogZmFsc2VcbiAgICB9KVxuICAgIHJldHVybiB0aGlzLl9ydW5VcGxvYWQodXBsb2FkSUQpXG4gIH1cblxuICByZXNldCAoKSB7XG4gICAgdGhpcy5jYW5jZWxBbGwoKVxuICB9XG5cbiAgX2NhbGN1bGF0ZVByb2dyZXNzIChmaWxlLCBkYXRhKSB7XG4gICAgaWYgKCF0aGlzLmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHtmaWxlLmlkfWApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBieXRlc1RvdGFsIG1heSBiZSBudWxsIG9yIHplcm87IGluIHRoYXQgY2FzZSB3ZSBjYW4ndCBkaXZpZGUgYnkgaXRcbiAgICBjb25zdCBjYW5IYXZlUGVyY2VudGFnZSA9IGlzRmluaXRlKGRhdGEuYnl0ZXNUb3RhbCkgJiYgZGF0YS5ieXRlc1RvdGFsID4gMFxuICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgIC4uLnRoaXMuZ2V0RmlsZShmaWxlLmlkKS5wcm9ncmVzcyxcbiAgICAgICAgYnl0ZXNVcGxvYWRlZDogZGF0YS5ieXRlc1VwbG9hZGVkLFxuICAgICAgICBieXRlc1RvdGFsOiBkYXRhLmJ5dGVzVG90YWwsXG4gICAgICAgIHBlcmNlbnRhZ2U6IGNhbkhhdmVQZXJjZW50YWdlXG4gICAgICAgICAgLy8gVE9ETyhnb3RvLWJ1cy1zdG9wKSBmbG9vcmluZyB0aGlzIHNob3VsZCBwcm9iYWJseSBiZSB0aGUgY2hvaWNlIG9mIHRoZSBVST9cbiAgICAgICAgICAvLyB3ZSBnZXQgbW9yZSBhY2N1cmF0ZSBjYWxjdWxhdGlvbnMgaWYgd2UgZG9uJ3Qgcm91bmQgdGhpcyBhdCBhbGwuXG4gICAgICAgICAgPyBNYXRoLnJvdW5kKGRhdGEuYnl0ZXNVcGxvYWRlZCAvIGRhdGEuYnl0ZXNUb3RhbCAqIDEwMClcbiAgICAgICAgICA6IDBcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5fY2FsY3VsYXRlVG90YWxQcm9ncmVzcygpXG4gIH1cblxuICBfY2FsY3VsYXRlVG90YWxQcm9ncmVzcyAoKSB7XG4gICAgLy8gY2FsY3VsYXRlIHRvdGFsIHByb2dyZXNzLCB1c2luZyB0aGUgbnVtYmVyIG9mIGZpbGVzIGN1cnJlbnRseSB1cGxvYWRpbmcsXG4gICAgLy8gbXVsdGlwbGllZCBieSAxMDAgYW5kIHRoZSBzdW1tIG9mIGluZGl2aWR1YWwgcHJvZ3Jlc3Mgb2YgZWFjaCBmaWxlXG4gICAgY29uc3QgZmlsZXMgPSB0aGlzLmdldEZpbGVzKClcblxuICAgIGNvbnN0IGluUHJvZ3Jlc3MgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgIHJldHVybiBmaWxlLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWQgfHxcbiAgICAgICAgZmlsZS5wcm9ncmVzcy5wcmVwcm9jZXNzIHx8XG4gICAgICAgIGZpbGUucHJvZ3Jlc3MucG9zdHByb2Nlc3NcbiAgICB9KVxuXG4gICAgaWYgKGluUHJvZ3Jlc3MubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmVtaXQoJ3Byb2dyZXNzJywgMClcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzOiAwIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBzaXplZEZpbGVzID0gaW5Qcm9ncmVzcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUucHJvZ3Jlc3MuYnl0ZXNUb3RhbCAhPSBudWxsKVxuICAgIGNvbnN0IHVuc2l6ZWRGaWxlcyA9IGluUHJvZ3Jlc3MuZmlsdGVyKChmaWxlKSA9PiBmaWxlLnByb2dyZXNzLmJ5dGVzVG90YWwgPT0gbnVsbClcblxuICAgIGlmIChzaXplZEZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgcHJvZ3Jlc3NNYXggPSBpblByb2dyZXNzLmxlbmd0aCAqIDEwMFxuICAgICAgY29uc3QgY3VycmVudFByb2dyZXNzID0gdW5zaXplZEZpbGVzLnJlZHVjZSgoYWNjLCBmaWxlKSA9PiB7XG4gICAgICAgIHJldHVybiBhY2MgKyBmaWxlLnByb2dyZXNzLnBlcmNlbnRhZ2VcbiAgICAgIH0sIDApXG4gICAgICBjb25zdCB0b3RhbFByb2dyZXNzID0gTWF0aC5yb3VuZChjdXJyZW50UHJvZ3Jlc3MgLyBwcm9ncmVzc01heCAqIDEwMClcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgdG90YWxTaXplID0gc2l6ZWRGaWxlcy5yZWR1Y2UoKGFjYywgZmlsZSkgPT4ge1xuICAgICAgcmV0dXJuIGFjYyArIGZpbGUucHJvZ3Jlc3MuYnl0ZXNUb3RhbFxuICAgIH0sIDApXG4gICAgY29uc3QgYXZlcmFnZVNpemUgPSB0b3RhbFNpemUgLyBzaXplZEZpbGVzLmxlbmd0aFxuICAgIHRvdGFsU2l6ZSArPSBhdmVyYWdlU2l6ZSAqIHVuc2l6ZWRGaWxlcy5sZW5ndGhcblxuICAgIGxldCB1cGxvYWRlZFNpemUgPSAwXG4gICAgc2l6ZWRGaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICB1cGxvYWRlZFNpemUgKz0gZmlsZS5wcm9ncmVzcy5ieXRlc1VwbG9hZGVkXG4gICAgfSlcbiAgICB1bnNpemVkRmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgdXBsb2FkZWRTaXplICs9IGF2ZXJhZ2VTaXplICogKGZpbGUucHJvZ3Jlc3MucGVyY2VudGFnZSB8fCAwKSAvIDEwMFxuICAgIH0pXG5cbiAgICBsZXQgdG90YWxQcm9ncmVzcyA9IHRvdGFsU2l6ZSA9PT0gMFxuICAgICAgPyAwXG4gICAgICA6IE1hdGgucm91bmQodXBsb2FkZWRTaXplIC8gdG90YWxTaXplICogMTAwKVxuXG4gICAgLy8gaG90IGZpeCwgYmVjYXVzZTpcbiAgICAvLyB1cGxvYWRlZFNpemUgZW5kZWQgdXAgbGFyZ2VyIHRoYW4gdG90YWxTaXplLCByZXN1bHRpbmcgaW4gMTMyNSUgdG90YWxcbiAgICBpZiAodG90YWxQcm9ncmVzcyA+IDEwMCkge1xuICAgICAgdG90YWxQcm9ncmVzcyA9IDEwMFxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzIH0pXG4gICAgdGhpcy5lbWl0KCdwcm9ncmVzcycsIHRvdGFsUHJvZ3Jlc3MpXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGxpc3RlbmVycyBmb3IgYWxsIGdsb2JhbCBhY3Rpb25zLCBsaWtlOlxuICAgKiBgZXJyb3JgLCBgZmlsZS1yZW1vdmVkYCwgYHVwbG9hZC1wcm9ncmVzc2BcbiAgICovXG4gIF9hZGRMaXN0ZW5lcnMgKCkge1xuICAgIHRoaXMub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBsZXQgZXJyb3JNc2cgPSAnVW5rbm93biBlcnJvcidcbiAgICAgIGlmIChlcnJvci5tZXNzYWdlKSB7XG4gICAgICAgIGVycm9yTXNnID0gZXJyb3IubWVzc2FnZVxuICAgICAgfVxuXG4gICAgICBpZiAoZXJyb3IuZGV0YWlscykge1xuICAgICAgICBlcnJvck1zZyArPSAnICcgKyBlcnJvci5kZXRhaWxzXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogZXJyb3JNc2cgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbigndXBsb2FkLWVycm9yJywgKGZpbGUsIGVycm9yLCByZXNwb25zZSkgPT4ge1xuICAgICAgbGV0IGVycm9yTXNnID0gJ1Vua25vd24gZXJyb3InXG4gICAgICBpZiAoZXJyb3IubWVzc2FnZSkge1xuICAgICAgICBlcnJvck1zZyA9IGVycm9yLm1lc3NhZ2VcbiAgICAgIH1cblxuICAgICAgaWYgKGVycm9yLmRldGFpbHMpIHtcbiAgICAgICAgZXJyb3JNc2cgKz0gJyAnICsgZXJyb3IuZGV0YWlsc1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgcmVzcG9uc2VcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9KVxuXG4gICAgICBpZiAodHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyAmJiBlcnJvci5tZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IG5ld0Vycm9yID0gbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpXG4gICAgICAgIG5ld0Vycm9yLmRldGFpbHMgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgIGlmIChlcnJvci5kZXRhaWxzKSB7XG4gICAgICAgICAgbmV3RXJyb3IuZGV0YWlscyArPSAnICcgKyBlcnJvci5kZXRhaWxzXG4gICAgICAgIH1cbiAgICAgICAgbmV3RXJyb3IubWVzc2FnZSA9IHRoaXMuaTE4bignZmFpbGVkVG9VcGxvYWQnLCB7IGZpbGU6IGZpbGUubmFtZSB9KVxuICAgICAgICB0aGlzLl9zaG93T3JMb2dFcnJvckFuZFRocm93KG5ld0Vycm9yLCB7XG4gICAgICAgICAgdGhyb3dFcnI6IGZhbHNlXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zaG93T3JMb2dFcnJvckFuZFRocm93KGVycm9yLCB7XG4gICAgICAgICAgdGhyb3dFcnI6IGZhbHNlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMub24oJ3VwbG9hZCcsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogbnVsbCB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCd1cGxvYWQtc3RhcnRlZCcsIChmaWxlLCB1cGxvYWQpID0+IHtcbiAgICAgIGlmICghdGhpcy5nZXRGaWxlKGZpbGUuaWQpKSB7XG4gICAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHtmaWxlLmlkfWApXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgICBwcm9ncmVzczoge1xuICAgICAgICAgIHVwbG9hZFN0YXJ0ZWQ6IERhdGUubm93KCksXG4gICAgICAgICAgdXBsb2FkQ29tcGxldGU6IGZhbHNlLFxuICAgICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgICAgYnl0ZXNVcGxvYWRlZDogMCxcbiAgICAgICAgICBieXRlc1RvdGFsOiBmaWxlLnNpemVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbigndXBsb2FkLXByb2dyZXNzJywgdGhpcy5fY2FsY3VsYXRlUHJvZ3Jlc3MpXG5cbiAgICB0aGlzLm9uKCd1cGxvYWQtc3VjY2VzcycsIChmaWxlLCB1cGxvYWRSZXNwKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgY3VycmVudFByb2dyZXNzID0gdGhpcy5nZXRGaWxlKGZpbGUuaWQpLnByb2dyZXNzXG4gICAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgIHByb2dyZXNzOiBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50UHJvZ3Jlc3MsIHtcbiAgICAgICAgICB1cGxvYWRDb21wbGV0ZTogdHJ1ZSxcbiAgICAgICAgICBwZXJjZW50YWdlOiAxMDAsXG4gICAgICAgICAgYnl0ZXNVcGxvYWRlZDogY3VycmVudFByb2dyZXNzLmJ5dGVzVG90YWxcbiAgICAgICAgfSksXG4gICAgICAgIHJlc3BvbnNlOiB1cGxvYWRSZXNwLFxuICAgICAgICB1cGxvYWRVUkw6IHVwbG9hZFJlc3AudXBsb2FkVVJMLFxuICAgICAgICBpc1BhdXNlZDogZmFsc2VcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuX2NhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdwcmVwcm9jZXNzLXByb2dyZXNzJywgKGZpbGUsIHByb2dyZXNzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0RmlsZShmaWxlLmlkKS5wcm9ncmVzcywge1xuICAgICAgICAgIHByZXByb2Nlc3M6IHByb2dyZXNzXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdwcmVwcm9jZXNzLWNvbXBsZXRlJywgKGZpbGUpID0+IHtcbiAgICAgIGlmICghdGhpcy5nZXRGaWxlKGZpbGUuaWQpKSB7XG4gICAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHtmaWxlLmlkfWApXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgZmlsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpXG4gICAgICBmaWxlc1tmaWxlLmlkXSA9IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGUuaWRdLCB7XG4gICAgICAgIHByb2dyZXNzOiBPYmplY3QuYXNzaWduKHt9LCBmaWxlc1tmaWxlLmlkXS5wcm9ncmVzcylcbiAgICAgIH0pXG4gICAgICBkZWxldGUgZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MucHJlcHJvY2Vzc1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHsgZmlsZXM6IGZpbGVzIH0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ3Bvc3Rwcm9jZXNzLXByb2dyZXNzJywgKGZpbGUsIHByb2dyZXNzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlLmlkXS5wcm9ncmVzcywge1xuICAgICAgICAgIHBvc3Rwcm9jZXNzOiBwcm9ncmVzc1xuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbigncG9zdHByb2Nlc3MtY29tcGxldGUnLCAoZmlsZSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAke2ZpbGUuaWR9YClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBmaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICAgIGZpbGVzW2ZpbGUuaWRdID0gT2JqZWN0LmFzc2lnbih7fSwgZmlsZXNbZmlsZS5pZF0sIHtcbiAgICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGUuaWRdLnByb2dyZXNzKVxuICAgICAgfSlcbiAgICAgIGRlbGV0ZSBmaWxlc1tmaWxlLmlkXS5wcm9ncmVzcy5wb3N0cHJvY2Vzc1xuICAgICAgLy8gVE9ETyBzaG91bGQgd2Ugc2V0IHNvbWUga2luZCBvZiBgZnVsbHlDb21wbGV0ZWAgcHJvcGVydHkgb24gdGhlIGZpbGUgb2JqZWN0XG4gICAgICAvLyBzbyBpdCdzIGVhc2llciB0byBzZWUgdGhhdCB0aGUgZmlsZSBpcyB1cGxvYWTigKZmdWxseSBjb21wbGV0ZeKApnJhdGhlciB0aGFuXG4gICAgICAvLyB3aGF0IHdlIGhhdmUgdG8gZG8gbm93IChgdXBsb2FkQ29tcGxldGUgJiYgIXBvc3Rwcm9jZXNzYClcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGZpbGVzOiBmaWxlcyB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdyZXN0b3JlZCcsICgpID0+IHtcbiAgICAgIC8vIEZpbGVzIG1heSBoYXZlIGNoYW5nZWQtLWVuc3VyZSBwcm9ncmVzcyBpcyBzdGlsbCBhY2N1cmF0ZS5cbiAgICAgIHRoaXMuX2NhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuICAgIH0pXG5cbiAgICAvLyBzaG93IGluZm9ybWVyIGlmIG9mZmxpbmVcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvbmxpbmUnLCAoKSA9PiB0aGlzLnVwZGF0ZU9ubGluZVN0YXR1cygpKVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29mZmxpbmUnLCAoKSA9PiB0aGlzLnVwZGF0ZU9ubGluZVN0YXR1cygpKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZU9ubGluZVN0YXR1cygpLCAzMDAwKVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZU9ubGluZVN0YXR1cyAoKSB7XG4gICAgY29uc3Qgb25saW5lID1cbiAgICAgIHR5cGVvZiB3aW5kb3cubmF2aWdhdG9yLm9uTGluZSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgPyB3aW5kb3cubmF2aWdhdG9yLm9uTGluZVxuICAgICAgICA6IHRydWVcbiAgICBpZiAoIW9ubGluZSkge1xuICAgICAgdGhpcy5lbWl0KCdpcy1vZmZsaW5lJylcbiAgICAgIHRoaXMuaW5mbyh0aGlzLmkxOG4oJ25vSW50ZXJuZXRDb25uZWN0aW9uJyksICdlcnJvcicsIDApXG4gICAgICB0aGlzLndhc09mZmxpbmUgPSB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW1pdCgnaXMtb25saW5lJylcbiAgICAgIGlmICh0aGlzLndhc09mZmxpbmUpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdiYWNrLW9ubGluZScpXG4gICAgICAgIHRoaXMuaW5mbyh0aGlzLmkxOG4oJ2Nvbm5lY3RlZFRvSW50ZXJuZXQnKSwgJ3N1Y2Nlc3MnLCAzMDAwKVxuICAgICAgICB0aGlzLndhc09mZmxpbmUgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldElEICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRzLmlkXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgcGx1Z2luIHdpdGggQ29yZS5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IFBsdWdpbiBvYmplY3RcbiAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRzXSBvYmplY3Qgd2l0aCBvcHRpb25zIHRvIGJlIHBhc3NlZCB0byBQbHVnaW5cbiAgICogQHJldHVybnMge29iamVjdH0gc2VsZiBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHVzZSAoUGx1Z2luLCBvcHRzKSB7XG4gICAgaWYgKHR5cGVvZiBQbHVnaW4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IG1zZyA9IGBFeHBlY3RlZCBhIHBsdWdpbiBjbGFzcywgYnV0IGdvdCAke1BsdWdpbiA9PT0gbnVsbCA/ICdudWxsJyA6IHR5cGVvZiBQbHVnaW59LmAgK1xuICAgICAgICAnIFBsZWFzZSB2ZXJpZnkgdGhhdCB0aGUgcGx1Z2luIHdhcyBpbXBvcnRlZCBhbmQgc3BlbGxlZCBjb3JyZWN0bHkuJ1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtc2cpXG4gICAgfVxuXG4gICAgLy8gSW5zdGFudGlhdGVcbiAgICBjb25zdCBwbHVnaW4gPSBuZXcgUGx1Z2luKHRoaXMsIG9wdHMpXG4gICAgY29uc3QgcGx1Z2luSWQgPSBwbHVnaW4uaWRcbiAgICB0aGlzLnBsdWdpbnNbcGx1Z2luLnR5cGVdID0gdGhpcy5wbHVnaW5zW3BsdWdpbi50eXBlXSB8fCBbXVxuXG4gICAgaWYgKCFwbHVnaW5JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3VyIHBsdWdpbiBtdXN0IGhhdmUgYW4gaWQnKVxuICAgIH1cblxuICAgIGlmICghcGx1Z2luLnR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91ciBwbHVnaW4gbXVzdCBoYXZlIGEgdHlwZScpXG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RzUGx1Z2luQWxyZWFkeSA9IHRoaXMuZ2V0UGx1Z2luKHBsdWdpbklkKVxuICAgIGlmIChleGlzdHNQbHVnaW5BbHJlYWR5KSB7XG4gICAgICBjb25zdCBtc2cgPSBgQWxyZWFkeSBmb3VuZCBhIHBsdWdpbiBuYW1lZCAnJHtleGlzdHNQbHVnaW5BbHJlYWR5LmlkfScuIGAgK1xuICAgICAgICBgVHJpZWQgdG8gdXNlOiAnJHtwbHVnaW5JZH0nLlxcbmAgK1xuICAgICAgICAnVXBweSBwbHVnaW5zIG11c3QgaGF2ZSB1bmlxdWUgYGlkYCBvcHRpb25zLiBTZWUgaHR0cHM6Ly91cHB5LmlvL2RvY3MvcGx1Z2lucy8jaWQuJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZylcbiAgICB9XG5cbiAgICBpZiAoUGx1Z2luLlZFUlNJT04pIHtcbiAgICAgIHRoaXMubG9nKGBVc2luZyAke3BsdWdpbklkfSB2JHtQbHVnaW4uVkVSU0lPTn1gKVxuICAgIH1cblxuICAgIHRoaXMucGx1Z2luc1twbHVnaW4udHlwZV0ucHVzaChwbHVnaW4pXG4gICAgcGx1Z2luLmluc3RhbGwoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIG9uZSBQbHVnaW4gYnkgbmFtZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHBsdWdpbiBpZFxuICAgKiBAcmV0dXJucyB7b2JqZWN0fGJvb2xlYW59XG4gICAqL1xuICBnZXRQbHVnaW4gKGlkKSB7XG4gICAgbGV0IGZvdW5kUGx1Z2luID0gbnVsbFxuICAgIHRoaXMuaXRlcmF0ZVBsdWdpbnMoKHBsdWdpbikgPT4ge1xuICAgICAgaWYgKHBsdWdpbi5pZCA9PT0gaWQpIHtcbiAgICAgICAgZm91bmRQbHVnaW4gPSBwbHVnaW5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm91bmRQbHVnaW5cbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlIHRocm91Z2ggYWxsIGB1c2VgZCBwbHVnaW5zLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBtZXRob2QgdGhhdCB3aWxsIGJlIHJ1biBvbiBlYWNoIHBsdWdpblxuICAgKi9cbiAgaXRlcmF0ZVBsdWdpbnMgKG1ldGhvZCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMucGx1Z2lucykuZm9yRWFjaChwbHVnaW5UeXBlID0+IHtcbiAgICAgIHRoaXMucGx1Z2luc1twbHVnaW5UeXBlXS5mb3JFYWNoKG1ldGhvZClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFVuaW5zdGFsbCBhbmQgcmVtb3ZlIGEgcGx1Z2luLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gaW5zdGFuY2UgVGhlIHBsdWdpbiBpbnN0YW5jZSB0byByZW1vdmUuXG4gICAqL1xuICByZW1vdmVQbHVnaW4gKGluc3RhbmNlKSB7XG4gICAgdGhpcy5sb2coYFJlbW92aW5nIHBsdWdpbiAke2luc3RhbmNlLmlkfWApXG4gICAgdGhpcy5lbWl0KCdwbHVnaW4tcmVtb3ZlJywgaW5zdGFuY2UpXG5cbiAgICBpZiAoaW5zdGFuY2UudW5pbnN0YWxsKSB7XG4gICAgICBpbnN0YW5jZS51bmluc3RhbGwoKVxuICAgIH1cblxuICAgIGNvbnN0IGxpc3QgPSB0aGlzLnBsdWdpbnNbaW5zdGFuY2UudHlwZV0uc2xpY2UoKVxuICAgIGNvbnN0IGluZGV4ID0gbGlzdC5pbmRleE9mKGluc3RhbmNlKVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAxKVxuICAgICAgdGhpcy5wbHVnaW5zW2luc3RhbmNlLnR5cGVdID0gbGlzdFxuICAgIH1cblxuICAgIGNvbnN0IHVwZGF0ZWRTdGF0ZSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgIGRlbGV0ZSB1cGRhdGVkU3RhdGUucGx1Z2luc1tpbnN0YW5jZS5pZF1cbiAgICB0aGlzLnNldFN0YXRlKHVwZGF0ZWRTdGF0ZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVbmluc3RhbGwgYWxsIHBsdWdpbnMgYW5kIGNsb3NlIGRvd24gdGhpcyBVcHB5IGluc3RhbmNlLlxuICAgKi9cbiAgY2xvc2UgKCkge1xuICAgIHRoaXMubG9nKGBDbG9zaW5nIFVwcHkgaW5zdGFuY2UgJHt0aGlzLm9wdHMuaWR9OiByZW1vdmluZyBhbGwgZmlsZXMgYW5kIHVuaW5zdGFsbGluZyBwbHVnaW5zYClcblxuICAgIHRoaXMucmVzZXQoKVxuXG4gICAgdGhpcy5fc3RvcmVVbnN1YnNjcmliZSgpXG5cbiAgICB0aGlzLml0ZXJhdGVQbHVnaW5zKChwbHVnaW4pID0+IHtcbiAgICAgIHRoaXMucmVtb3ZlUGx1Z2luKHBsdWdpbilcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBpbmZvIG1lc3NhZ2UgaW4gYHN0YXRlLmluZm9gLCBzbyB0aGF0IFVJIHBsdWdpbnMgbGlrZSBgSW5mb3JtZXJgXG4gICAqIGNhbiBkaXNwbGF5IHRoZSBtZXNzYWdlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IG9iamVjdH0gbWVzc2FnZSBNZXNzYWdlIHRvIGJlIGRpc3BsYXllZCBieSB0aGUgaW5mb3JtZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IFt0eXBlXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW2R1cmF0aW9uXVxuICAgKi9cblxuICBpbmZvIChtZXNzYWdlLCB0eXBlID0gJ2luZm8nLCBkdXJhdGlvbiA9IDMwMDApIHtcbiAgICBjb25zdCBpc0NvbXBsZXhNZXNzYWdlID0gdHlwZW9mIG1lc3NhZ2UgPT09ICdvYmplY3QnXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGluZm86IHtcbiAgICAgICAgaXNIaWRkZW46IGZhbHNlLFxuICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICBtZXNzYWdlOiBpc0NvbXBsZXhNZXNzYWdlID8gbWVzc2FnZS5tZXNzYWdlIDogbWVzc2FnZSxcbiAgICAgICAgZGV0YWlsczogaXNDb21wbGV4TWVzc2FnZSA/IG1lc3NhZ2UuZGV0YWlscyA6IG51bGxcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCdpbmZvLXZpc2libGUnKVxuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuaW5mb1RpbWVvdXRJRClcbiAgICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICAgIHRoaXMuaW5mb1RpbWVvdXRJRCA9IHVuZGVmaW5lZFxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gaGlkZSB0aGUgaW5mb3JtZXIgYWZ0ZXIgYGR1cmF0aW9uYCBtaWxsaXNlY29uZHNcbiAgICB0aGlzLmluZm9UaW1lb3V0SUQgPSBzZXRUaW1lb3V0KHRoaXMuaGlkZUluZm8sIGR1cmF0aW9uKVxuICB9XG5cbiAgaGlkZUluZm8gKCkge1xuICAgIGNvbnN0IG5ld0luZm8gPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuaW5mbywge1xuICAgICAgaXNIaWRkZW46IHRydWVcbiAgICB9KVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaW5mbzogbmV3SW5mb1xuICAgIH0pXG4gICAgdGhpcy5lbWl0KCdpbmZvLWhpZGRlbicpXG4gIH1cblxuICAvKipcbiAgICogUGFzc2VzIG1lc3NhZ2VzIHRvIGEgZnVuY3Rpb24sIHByb3ZpZGVkIGluIGBvcHRzLmxvZ2dlcmAuXG4gICAqIElmIGBvcHRzLmxvZ2dlcjogVXBweS5kZWJ1Z0xvZ2dlcmAgb3IgYG9wdHMuZGVidWc6IHRydWVgLCBsb2dzIHRvIHRoZSBicm93c2VyIGNvbnNvbGUuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gbWVzc2FnZSB0byBsb2dcbiAgICogQHBhcmFtIHtzdHJpbmd9IFt0eXBlXSBvcHRpb25hbCBgZXJyb3JgIG9yIGB3YXJuaW5nYFxuICAgKi9cbiAgbG9nIChtZXNzYWdlLCB0eXBlKSB7XG4gICAgY29uc3QgeyBsb2dnZXIgfSA9IHRoaXMub3B0c1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnZXJyb3InOiBsb2dnZXIuZXJyb3IobWVzc2FnZSk7IGJyZWFrXG4gICAgICBjYXNlICd3YXJuaW5nJzogbG9nZ2VyLndhcm4obWVzc2FnZSk7IGJyZWFrXG4gICAgICBkZWZhdWx0OiBsb2dnZXIuZGVidWcobWVzc2FnZSk7IGJyZWFrXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9ic29sZXRlLCBldmVudCBsaXN0ZW5lcnMgYXJlIG5vdyBhZGRlZCBpbiB0aGUgY29uc3RydWN0b3IuXG4gICAqL1xuICBydW4gKCkge1xuICAgIHRoaXMubG9nKCdDYWxsaW5nIHJ1bigpIGlzIG5vIGxvbmdlciBuZWNlc3NhcnkuJywgJ3dhcm5pbmcnKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogUmVzdG9yZSBhbiB1cGxvYWQgYnkgaXRzIElELlxuICAgKi9cbiAgcmVzdG9yZSAodXBsb2FkSUQpIHtcbiAgICB0aGlzLmxvZyhgQ29yZTogYXR0ZW1wdGluZyB0byByZXN0b3JlIHVwbG9hZCBcIiR7dXBsb2FkSUR9XCJgKVxuXG4gICAgaWYgKCF0aGlzLmdldFN0YXRlKCkuY3VycmVudFVwbG9hZHNbdXBsb2FkSURdKSB7XG4gICAgICB0aGlzLl9yZW1vdmVVcGxvYWQodXBsb2FkSUQpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdOb25leGlzdGVudCB1cGxvYWQnKSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcnVuVXBsb2FkKHVwbG9hZElEKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiB1cGxvYWQgZm9yIGEgYnVuY2ggb2YgZmlsZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gZmlsZUlEcyBGaWxlIElEcyB0byBpbmNsdWRlIGluIHRoaXMgdXBsb2FkLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBJRCBvZiB0aGlzIHVwbG9hZC5cbiAgICovXG4gIF9jcmVhdGVVcGxvYWQgKGZpbGVJRHMsIG9wdHMgPSB7fSkge1xuICAgIGNvbnN0IHtcbiAgICAgIGZvcmNlQWxsb3dOZXdVcGxvYWQgPSBmYWxzZSAvLyB1cHB5LnJldHJ5QWxsIHNldHMgdGhpcyB0byB0cnVlIOKAlCB3aGVuIHJldHJ5aW5nIHdlIHdhbnQgdG8gaWdub3JlIGBhbGxvd05ld1VwbG9hZDogZmFsc2VgXG4gICAgfSA9IG9wdHNcblxuICAgIGNvbnN0IHsgYWxsb3dOZXdVcGxvYWQsIGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICBpZiAoIWFsbG93TmV3VXBsb2FkICYmICFmb3JjZUFsbG93TmV3VXBsb2FkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjcmVhdGUgYSBuZXcgdXBsb2FkOiBhbHJlYWR5IHVwbG9hZGluZy4nKVxuICAgIH1cblxuICAgIGNvbnN0IHVwbG9hZElEID0gY3VpZCgpXG5cbiAgICB0aGlzLmVtaXQoJ3VwbG9hZCcsIHtcbiAgICAgIGlkOiB1cGxvYWRJRCxcbiAgICAgIGZpbGVJRHM6IGZpbGVJRHNcbiAgICB9KVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhbGxvd05ld1VwbG9hZDogdGhpcy5vcHRzLmFsbG93TXVsdGlwbGVVcGxvYWRzICE9PSBmYWxzZSxcblxuICAgICAgY3VycmVudFVwbG9hZHM6IHtcbiAgICAgICAgLi4uY3VycmVudFVwbG9hZHMsXG4gICAgICAgIFt1cGxvYWRJRF06IHtcbiAgICAgICAgICBmaWxlSURzOiBmaWxlSURzLFxuICAgICAgICAgIHN0ZXA6IDAsXG4gICAgICAgICAgcmVzdWx0OiB7fVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB1cGxvYWRJRFxuICB9XG5cbiAgX2dldFVwbG9hZCAodXBsb2FkSUQpIHtcbiAgICBjb25zdCB7IGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcblxuICAgIHJldHVybiBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgZGF0YSB0byBhbiB1cGxvYWQncyByZXN1bHQgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXBsb2FkSUQgVGhlIElEIG9mIHRoZSB1cGxvYWQuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIERhdGEgcHJvcGVydGllcyB0byBhZGQgdG8gdGhlIHJlc3VsdCBvYmplY3QuXG4gICAqL1xuICBhZGRSZXN1bHREYXRhICh1cGxvYWRJRCwgZGF0YSkge1xuICAgIGlmICghdGhpcy5fZ2V0VXBsb2FkKHVwbG9hZElEKSkge1xuICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHJlc3VsdCBmb3IgYW4gdXBsb2FkIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHt1cGxvYWRJRH1gKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IGN1cnJlbnRVcGxvYWRzID0gdGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzXG4gICAgY29uc3QgY3VycmVudFVwbG9hZCA9IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSwge1xuICAgICAgcmVzdWx0OiBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF0ucmVzdWx0LCBkYXRhKVxuICAgIH0pXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50VXBsb2FkczogT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFVwbG9hZHMsIHtcbiAgICAgICAgW3VwbG9hZElEXTogY3VycmVudFVwbG9hZFxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiB1cGxvYWQsIGVnLiBpZiBpdCBoYXMgYmVlbiBjYW5jZWxlZCBvciBjb21wbGV0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cGxvYWRJRCBUaGUgSUQgb2YgdGhlIHVwbG9hZC5cbiAgICovXG4gIF9yZW1vdmVVcGxvYWQgKHVwbG9hZElEKSB7XG4gICAgY29uc3QgY3VycmVudFVwbG9hZHMgPSB7IC4uLnRoaXMuZ2V0U3RhdGUoKS5jdXJyZW50VXBsb2FkcyB9XG4gICAgZGVsZXRlIGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50VXBsb2FkczogY3VycmVudFVwbG9hZHNcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBhbiB1cGxvYWQuIFRoaXMgcGlja3MgdXAgd2hlcmUgaXQgbGVmdCBvZmYgaW4gY2FzZSB0aGUgdXBsb2FkIGlzIGJlaW5nIHJlc3RvcmVkLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3J1blVwbG9hZCAodXBsb2FkSUQpIHtcbiAgICBjb25zdCB1cGxvYWREYXRhID0gdGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXVxuICAgIGNvbnN0IHJlc3RvcmVTdGVwID0gdXBsb2FkRGF0YS5zdGVwXG5cbiAgICBjb25zdCBzdGVwcyA9IFtcbiAgICAgIC4uLnRoaXMucHJlUHJvY2Vzc29ycyxcbiAgICAgIC4uLnRoaXMudXBsb2FkZXJzLFxuICAgICAgLi4udGhpcy5wb3N0UHJvY2Vzc29yc1xuICAgIF1cbiAgICBsZXQgbGFzdFN0ZXAgPSBQcm9taXNlLnJlc29sdmUoKVxuICAgIHN0ZXBzLmZvckVhY2goKGZuLCBzdGVwKSA9PiB7XG4gICAgICAvLyBTa2lwIHRoaXMgc3RlcCBpZiB3ZSBhcmUgcmVzdG9yaW5nIGFuZCBoYXZlIGFscmVhZHkgY29tcGxldGVkIHRoaXMgc3RlcCBiZWZvcmUuXG4gICAgICBpZiAoc3RlcCA8IHJlc3RvcmVTdGVwKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBsYXN0U3RlcCA9IGxhc3RTdGVwLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zdCB7IGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICAgICAgY29uc3QgY3VycmVudFVwbG9hZCA9IGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXVxuICAgICAgICBpZiAoIWN1cnJlbnRVcGxvYWQpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVwZGF0ZWRVcGxvYWQgPSBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50VXBsb2FkLCB7XG4gICAgICAgICAgc3RlcDogc3RlcFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBjdXJyZW50VXBsb2FkczogT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFVwbG9hZHMsIHtcbiAgICAgICAgICAgIFt1cGxvYWRJRF06IHVwZGF0ZWRVcGxvYWRcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vIFRPRE8gZ2l2ZSB0aGlzIHRoZSBgdXBkYXRlZFVwbG9hZGAgb2JqZWN0IGFzIGl0cyBvbmx5IHBhcmFtZXRlciBtYXliZT9cbiAgICAgICAgLy8gT3RoZXJ3aXNlIHdoZW4gbW9yZSBtZXRhZGF0YSBtYXkgYmUgYWRkZWQgdG8gdGhlIHVwbG9hZCB0aGlzIHdvdWxkIGtlZXAgZ2V0dGluZyBtb3JlIHBhcmFtZXRlcnNcbiAgICAgICAgcmV0dXJuIGZuKHVwZGF0ZWRVcGxvYWQuZmlsZUlEcywgdXBsb2FkSUQpXG4gICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vIE5vdCByZXR1cm5pbmcgdGhlIGBjYXRjaGBlZCBwcm9taXNlLCBiZWNhdXNlIHdlIHN0aWxsIHdhbnQgdG8gcmV0dXJuIGEgcmVqZWN0ZWRcbiAgICAvLyBwcm9taXNlIGZyb20gdGhpcyBtZXRob2QgaWYgdGhlIHVwbG9hZCBmYWlsZWQuXG4gICAgbGFzdFN0ZXAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgdGhpcy5lbWl0KCdlcnJvcicsIGVyciwgdXBsb2FkSUQpXG4gICAgICB0aGlzLl9yZW1vdmVVcGxvYWQodXBsb2FkSUQpXG4gICAgfSlcblxuICAgIHJldHVybiBsYXN0U3RlcC50aGVuKCgpID0+IHtcbiAgICAgIC8vIFNldCByZXN1bHQgZGF0YS5cbiAgICAgIGNvbnN0IHsgY3VycmVudFVwbG9hZHMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgICAgY29uc3QgY3VycmVudFVwbG9hZCA9IGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXVxuICAgICAgaWYgKCFjdXJyZW50VXBsb2FkKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBmaWxlcyA9IGN1cnJlbnRVcGxvYWQuZmlsZUlEc1xuICAgICAgICAubWFwKChmaWxlSUQpID0+IHRoaXMuZ2V0RmlsZShmaWxlSUQpKVxuICAgICAgY29uc3Qgc3VjY2Vzc2Z1bCA9IGZpbGVzLmZpbHRlcigoZmlsZSkgPT4gIWZpbGUuZXJyb3IpXG4gICAgICBjb25zdCBmYWlsZWQgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUuZXJyb3IpXG4gICAgICB0aGlzLmFkZFJlc3VsdERhdGEodXBsb2FkSUQsIHsgc3VjY2Vzc2Z1bCwgZmFpbGVkLCB1cGxvYWRJRCB9KVxuICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgLy8gRW1pdCBjb21wbGV0aW9uIGV2ZW50cy5cbiAgICAgIC8vIFRoaXMgaXMgaW4gYSBzZXBhcmF0ZSBmdW5jdGlvbiBzbyB0aGF0IHRoZSBgY3VycmVudFVwbG9hZHNgIHZhcmlhYmxlXG4gICAgICAvLyBhbHdheXMgcmVmZXJzIHRvIHRoZSBsYXRlc3Qgc3RhdGUuIEluIHRoZSBoYW5kbGVyIHJpZ2h0IGFib3ZlIGl0IHJlZmVyc1xuICAgICAgLy8gdG8gYW4gb3V0ZGF0ZWQgb2JqZWN0IHdpdGhvdXQgdGhlIGAucmVzdWx0YCBwcm9wZXJ0eS5cbiAgICAgIGNvbnN0IHsgY3VycmVudFVwbG9hZHMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgICAgaWYgKCFjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF0pIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBjdXJyZW50VXBsb2FkID0gY3VycmVudFVwbG9hZHNbdXBsb2FkSURdXG4gICAgICBjb25zdCByZXN1bHQgPSBjdXJyZW50VXBsb2FkLnJlc3VsdFxuICAgICAgdGhpcy5lbWl0KCdjb21wbGV0ZScsIHJlc3VsdClcblxuICAgICAgdGhpcy5fcmVtb3ZlVXBsb2FkKHVwbG9hZElEKVxuXG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHJlc3VsdCBmb3IgYW4gdXBsb2FkIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHt1cGxvYWRJRH1gKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgYW4gdXBsb2FkIGZvciBhbGwgdGhlIGZpbGVzIHRoYXQgYXJlIG5vdCBjdXJyZW50bHkgYmVpbmcgdXBsb2FkZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgKi9cbiAgdXBsb2FkICgpIHtcbiAgICBpZiAoIXRoaXMucGx1Z2lucy51cGxvYWRlcikge1xuICAgICAgdGhpcy5sb2coJ05vIHVwbG9hZGVyIHR5cGUgcGx1Z2lucyBhcmUgdXNlZCcsICd3YXJuaW5nJylcbiAgICB9XG5cbiAgICBsZXQgZmlsZXMgPSB0aGlzLmdldFN0YXRlKCkuZmlsZXNcblxuICAgIGNvbnN0IG9uQmVmb3JlVXBsb2FkUmVzdWx0ID0gdGhpcy5vcHRzLm9uQmVmb3JlVXBsb2FkKGZpbGVzKVxuXG4gICAgaWYgKG9uQmVmb3JlVXBsb2FkUmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignTm90IHN0YXJ0aW5nIHRoZSB1cGxvYWQgYmVjYXVzZSBvbkJlZm9yZVVwbG9hZCByZXR1cm5lZCBmYWxzZScpKVxuICAgIH1cblxuICAgIGlmIChvbkJlZm9yZVVwbG9hZFJlc3VsdCAmJiB0eXBlb2Ygb25CZWZvcmVVcGxvYWRSZXN1bHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBmaWxlcyA9IG9uQmVmb3JlVXBsb2FkUmVzdWx0XG4gICAgICAvLyBVcGRhdGluZyBmaWxlcyBpbiBzdGF0ZSwgYmVjYXVzZSB1cGxvYWRlciBwbHVnaW5zIHJlY2VpdmUgZmlsZSBJRHMsXG4gICAgICAvLyBhbmQgdGhlbiBmZXRjaCB0aGUgYWN0dWFsIGZpbGUgb2JqZWN0IGZyb20gc3RhdGVcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBmaWxlczogZmlsZXNcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbigoKSA9PiB0aGlzLl9jaGVja01pbk51bWJlck9mRmlsZXMoZmlsZXMpKVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgdGhpcy5fc2hvd09yTG9nRXJyb3JBbmRUaHJvdyhlcnIpXG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zdCB7IGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICAgICAgLy8gZ2V0IGEgbGlzdCBvZiBmaWxlcyB0aGF0IGFyZSBjdXJyZW50bHkgYXNzaWduZWQgdG8gdXBsb2Fkc1xuICAgICAgICBjb25zdCBjdXJyZW50bHlVcGxvYWRpbmdGaWxlcyA9IE9iamVjdC5rZXlzKGN1cnJlbnRVcGxvYWRzKS5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IHByZXYuY29uY2F0KGN1cnJlbnRVcGxvYWRzW2N1cnJdLmZpbGVJRHMpLCBbXSlcblxuICAgICAgICBjb25zdCB3YWl0aW5nRmlsZUlEcyA9IFtdXG4gICAgICAgIE9iamVjdC5rZXlzKGZpbGVzKS5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5nZXRGaWxlKGZpbGVJRClcbiAgICAgICAgICAvLyBpZiB0aGUgZmlsZSBoYXNuJ3Qgc3RhcnRlZCB1cGxvYWRpbmcgYW5kIGhhc24ndCBhbHJlYWR5IGJlZW4gYXNzaWduZWQgdG8gYW4gdXBsb2FkLi5cbiAgICAgICAgICBpZiAoKCFmaWxlLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWQpICYmIChjdXJyZW50bHlVcGxvYWRpbmdGaWxlcy5pbmRleE9mKGZpbGVJRCkgPT09IC0xKSkge1xuICAgICAgICAgICAgd2FpdGluZ0ZpbGVJRHMucHVzaChmaWxlLmlkKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCB1cGxvYWRJRCA9IHRoaXMuX2NyZWF0ZVVwbG9hZCh3YWl0aW5nRmlsZUlEcylcbiAgICAgICAgcmV0dXJuIHRoaXMuX3J1blVwbG9hZCh1cGxvYWRJRClcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICB0aGlzLl9zaG93T3JMb2dFcnJvckFuZFRocm93KGVyciwge1xuICAgICAgICAgIHNob3dJbmZvcm1lcjogZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0cykge1xuICByZXR1cm4gbmV3IFVwcHkob3B0cylcbn1cblxuLy8gRXhwb3NlIGNsYXNzIGNvbnN0cnVjdG9yLlxubW9kdWxlLmV4cG9ydHMuVXBweSA9IFVwcHlcbm1vZHVsZS5leHBvcnRzLlBsdWdpbiA9IFBsdWdpblxubW9kdWxlLmV4cG9ydHMuZGVidWdMb2dnZXIgPSBkZWJ1Z0xvZ2dlclxuIiwiY29uc3QgZ2V0VGltZVN0YW1wID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2dldFRpbWVTdGFtcCcpXG5cbi8vIFN3YWxsb3cgYWxsIGxvZ3MsIGV4Y2VwdCBlcnJvcnMuXG4vLyBkZWZhdWx0IGlmIGxvZ2dlciBpcyBub3Qgc2V0IG9yIGRlYnVnOiBmYWxzZVxuY29uc3QganVzdEVycm9yc0xvZ2dlciA9IHtcbiAgZGVidWc6ICguLi5hcmdzKSA9PiB7fSxcbiAgd2FybjogKC4uLmFyZ3MpID0+IHt9LFxuICBlcnJvcjogKC4uLmFyZ3MpID0+IGNvbnNvbGUuZXJyb3IoYFtVcHB5XSBbJHtnZXRUaW1lU3RhbXAoKX1dYCwgLi4uYXJncylcbn1cblxuLy8gUHJpbnQgbG9ncyB0byBjb25zb2xlIHdpdGggbmFtZXNwYWNlICsgdGltZXN0YW1wLFxuLy8gc2V0IGJ5IGxvZ2dlcjogVXBweS5kZWJ1Z0xvZ2dlciBvciBkZWJ1ZzogdHJ1ZVxuY29uc3QgZGVidWdMb2dnZXIgPSB7XG4gIGRlYnVnOiAoLi4uYXJncykgPT4ge1xuICAgIC8vIElFIDEwIGRvZXNu4oCZdCBzdXBwb3J0IGNvbnNvbGUuZGVidWdcbiAgICBjb25zdCBkZWJ1ZyA9IGNvbnNvbGUuZGVidWcgfHwgY29uc29sZS5sb2dcbiAgICBkZWJ1Zy5jYWxsKGNvbnNvbGUsIGBbVXBweV0gWyR7Z2V0VGltZVN0YW1wKCl9XWAsIC4uLmFyZ3MpXG4gIH0sXG4gIHdhcm46ICguLi5hcmdzKSA9PiBjb25zb2xlLndhcm4oYFtVcHB5XSBbJHtnZXRUaW1lU3RhbXAoKX1dYCwgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJncykgPT4gY29uc29sZS5lcnJvcihgW1VwcHldIFske2dldFRpbWVTdGFtcCgpfV1gLCAuLi5hcmdzKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAganVzdEVycm9yc0xvZ2dlcixcbiAgZGVidWdMb2dnZXJcbn1cbiIsIi8vIEVkZ2UgMTUueCBkb2VzIG5vdCBmaXJlICdwcm9ncmVzcycgZXZlbnRzIG9uIHVwbG9hZHMuXG4vLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3RyYW5zbG9hZGl0L3VwcHkvaXNzdWVzLzk0NVxuLy8gQW5kIGh0dHBzOi8vZGV2ZWxvcGVyLm1pY3Jvc29mdC5jb20vZW4tdXMvbWljcm9zb2Z0LWVkZ2UvcGxhdGZvcm0vaXNzdWVzLzEyMjI0NTEwL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzdXBwb3J0c1VwbG9hZFByb2dyZXNzICh1c2VyQWdlbnQpIHtcbiAgLy8gQWxsb3cgcGFzc2luZyBpbiB1c2VyQWdlbnQgZm9yIHRlc3RzXG4gIGlmICh1c2VyQWdlbnQgPT0gbnVsbCkge1xuICAgIHVzZXJBZ2VudCA9IHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnID8gbmF2aWdhdG9yLnVzZXJBZ2VudCA6IG51bGxcbiAgfVxuICAvLyBBc3N1bWUgaXQgd29ya3MgYmVjYXVzZSBiYXNpY2FsbHkgZXZlcnl0aGluZyBzdXBwb3J0cyBwcm9ncmVzcyBldmVudHMuXG4gIGlmICghdXNlckFnZW50KSByZXR1cm4gdHJ1ZVxuXG4gIGNvbnN0IG0gPSAvRWRnZVxcLyhcXGQrXFwuXFxkKykvLmV4ZWModXNlckFnZW50KVxuICBpZiAoIW0pIHJldHVybiB0cnVlXG5cbiAgY29uc3QgZWRnZVZlcnNpb24gPSBtWzFdXG4gIGxldCBbbWFqb3IsIG1pbm9yXSA9IGVkZ2VWZXJzaW9uLnNwbGl0KCcuJylcbiAgbWFqb3IgPSBwYXJzZUludChtYWpvciwgMTApXG4gIG1pbm9yID0gcGFyc2VJbnQobWlub3IsIDEwKVxuXG4gIC8vIFdvcmtlZCBiZWZvcmU6XG4gIC8vIEVkZ2UgNDAuMTUwNjMuMC4wXG4gIC8vIE1pY3Jvc29mdCBFZGdlSFRNTCAxNS4xNTA2M1xuICBpZiAobWFqb3IgPCAxNSB8fCAobWFqb3IgPT09IDE1ICYmIG1pbm9yIDwgMTUwNjMpKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8vIEZpeGVkIGluOlxuICAvLyBNaWNyb3NvZnQgRWRnZUhUTUwgMTguMTgyMThcbiAgaWYgKG1ham9yID4gMTggfHwgKG1ham9yID09PSAxOCAmJiBtaW5vciA+PSAxODIxOCkpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gb3RoZXIgdmVyc2lvbnMgZG9uJ3Qgd29yay5cbiAgcmV0dXJuIGZhbHNlXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibmFtZVwiOiBcIkB1cHB5L2RyYWctZHJvcFwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiRHJvcHBhYmxlIHpvbmUgVUkgZm9yIFVwcHkuIERyYWcgYW5kIGRyb3AgZmlsZXMgaW50byBpdCB0byB1cGxvYWQuXCIsXG4gIFwidmVyc2lvblwiOiBcIjEuNC4xMlwiLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJtYWluXCI6IFwibGliL2luZGV4LmpzXCIsXG4gIFwic3R5bGVcIjogXCJkaXN0L3N0eWxlLm1pbi5jc3NcIixcbiAgXCJ0eXBlc1wiOiBcInR5cGVzL2luZGV4LmQudHNcIixcbiAgXCJrZXl3b3Jkc1wiOiBbXG4gICAgXCJmaWxlIHVwbG9hZGVyXCIsXG4gICAgXCJ1cHB5XCIsXG4gICAgXCJ1cHB5LXBsdWdpblwiLFxuICAgIFwiZHJhZy1kcm9wXCIsXG4gICAgXCJkcmFnXCIsXG4gICAgXCJkcm9wXCIsXG4gICAgXCJkcm9wem9uZVwiLFxuICAgIFwidXBsb2FkXCJcbiAgXSxcbiAgXCJob21lcGFnZVwiOiBcImh0dHBzOi8vdXBweS5pb1wiLFxuICBcImJ1Z3NcIjoge1xuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3RyYW5zbG9hZGl0L3VwcHkvaXNzdWVzXCJcbiAgfSxcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImdpdCtodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS5naXRcIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAdXBweS91dGlsc1wiOiBcImZpbGU6Li4vdXRpbHNcIixcbiAgICBcInByZWFjdFwiOiBcIjguMi45XCJcbiAgfSxcbiAgXCJwZWVyRGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkB1cHB5L2NvcmVcIjogXCJeMS4wLjBcIlxuICB9XG59XG4iLCJjb25zdCB7IFBsdWdpbiB9ID0gcmVxdWlyZSgnQHVwcHkvY29yZScpXG5jb25zdCBUcmFuc2xhdG9yID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL1RyYW5zbGF0b3InKVxuY29uc3QgdG9BcnJheSA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi90b0FycmF5JylcbmNvbnN0IGlzRHJhZ0Ryb3BTdXBwb3J0ZWQgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvaXNEcmFnRHJvcFN1cHBvcnRlZCcpXG5jb25zdCBnZXREcm9wcGVkRmlsZXMgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2V0RHJvcHBlZEZpbGVzJylcbmNvbnN0IHsgaCB9ID0gcmVxdWlyZSgncHJlYWN0JylcblxuLyoqXG4gKiBEcmFnICYgRHJvcCBwbHVnaW5cbiAqXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRHJhZ0Ryb3AgZXh0ZW5kcyBQbHVnaW4ge1xuICBzdGF0aWMgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb25cblxuICBjb25zdHJ1Y3RvciAodXBweSwgb3B0cykge1xuICAgIHN1cGVyKHVwcHksIG9wdHMpXG4gICAgdGhpcy50eXBlID0gJ2FjcXVpcmVyJ1xuICAgIHRoaXMuaWQgPSB0aGlzLm9wdHMuaWQgfHwgJ0RyYWdEcm9wJ1xuICAgIHRoaXMudGl0bGUgPSAnRHJhZyAmIERyb3AnXG5cbiAgICB0aGlzLmRlZmF1bHRMb2NhbGUgPSB7XG4gICAgICBzdHJpbmdzOiB7XG4gICAgICAgIGRyb3BIZXJlT3I6ICdEcm9wIGZpbGVzIGhlcmUgb3IgJXticm93c2V9JyxcbiAgICAgICAgYnJvd3NlOiAnYnJvd3NlJ1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZmF1bHQgb3B0aW9uc1xuICAgIGNvbnN0IGRlZmF1bHRPcHRzID0ge1xuICAgICAgdGFyZ2V0OiBudWxsLFxuICAgICAgaW5wdXROYW1lOiAnZmlsZXNbXScsXG4gICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICBub3RlOiBudWxsXG4gICAgfVxuXG4gICAgLy8gTWVyZ2UgZGVmYXVsdCBvcHRpb25zIHdpdGggdGhlIG9uZXMgc2V0IGJ5IHVzZXJcbiAgICB0aGlzLm9wdHMgPSB7IC4uLmRlZmF1bHRPcHRzLCAuLi5vcHRzIH1cblxuICAgIC8vIENoZWNrIGZvciBicm93c2VyIGRyYWdEcm9wIHN1cHBvcnRcbiAgICB0aGlzLmlzRHJhZ0Ryb3BTdXBwb3J0ZWQgPSBpc0RyYWdEcm9wU3VwcG9ydGVkKClcbiAgICB0aGlzLnJlbW92ZURyYWdPdmVyQ2xhc3NUaW1lb3V0ID0gbnVsbFxuXG4gICAgdGhpcy5pMThuSW5pdCgpXG5cbiAgICAvLyBCaW5kIGB0aGlzYCB0byBjbGFzcyBtZXRob2RzXG4gICAgdGhpcy5vbklucHV0Q2hhbmdlID0gdGhpcy5vbklucHV0Q2hhbmdlLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZURyYWdPdmVyID0gdGhpcy5oYW5kbGVEcmFnT3Zlci5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVEcmFnTGVhdmUgPSB0aGlzLmhhbmRsZURyYWdMZWF2ZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVEcm9wID0gdGhpcy5oYW5kbGVEcm9wLmJpbmQodGhpcylcbiAgICB0aGlzLmFkZEZpbGVzID0gdGhpcy5hZGRGaWxlcy5iaW5kKHRoaXMpXG4gICAgdGhpcy5yZW5kZXIgPSB0aGlzLnJlbmRlci5iaW5kKHRoaXMpXG4gIH1cblxuICBzZXRPcHRpb25zIChuZXdPcHRzKSB7XG4gICAgc3VwZXIuc2V0T3B0aW9ucyhuZXdPcHRzKVxuICAgIHRoaXMuaTE4bkluaXQoKVxuICB9XG5cbiAgaTE4bkluaXQgKCkge1xuICAgIHRoaXMudHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKFt0aGlzLmRlZmF1bHRMb2NhbGUsIHRoaXMudXBweS5sb2NhbGUsIHRoaXMub3B0cy5sb2NhbGVdKVxuICAgIHRoaXMuaTE4biA9IHRoaXMudHJhbnNsYXRvci50cmFuc2xhdGUuYmluZCh0aGlzLnRyYW5zbGF0b3IpXG4gICAgdGhpcy5pMThuQXJyYXkgPSB0aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlQXJyYXkuYmluZCh0aGlzLnRyYW5zbGF0b3IpXG4gICAgdGhpcy5zZXRQbHVnaW5TdGF0ZSgpIC8vIHNvIHRoYXQgVUkgcmUtcmVuZGVycyBhbmQgd2Ugc2VlIHRoZSB1cGRhdGVkIGxvY2FsZVxuICB9XG5cbiAgYWRkRmlsZXMgKGZpbGVzKSB7XG4gICAgY29uc3QgZGVzY3JpcHRvcnMgPSBmaWxlcy5tYXAoKGZpbGUpID0+ICh7XG4gICAgICBzb3VyY2U6IHRoaXMuaWQsXG4gICAgICBuYW1lOiBmaWxlLm5hbWUsXG4gICAgICB0eXBlOiBmaWxlLnR5cGUsXG4gICAgICBkYXRhOiBmaWxlLFxuICAgICAgbWV0YToge1xuICAgICAgICAvLyBwYXRoIG9mIHRoZSBmaWxlIHJlbGF0aXZlIHRvIHRoZSBhbmNlc3RvciBkaXJlY3RvcnkgdGhlIHVzZXIgc2VsZWN0ZWQuXG4gICAgICAgIC8vIGUuZy4gJ2RvY3MvT2xkIFByYWd1ZS9haXJibmIucGRmJ1xuICAgICAgICByZWxhdGl2ZVBhdGg6IGZpbGUucmVsYXRpdmVQYXRoIHx8IG51bGxcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIHRyeSB7XG4gICAgICB0aGlzLnVwcHkuYWRkRmlsZXMoZGVzY3JpcHRvcnMpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLnVwcHkubG9nKGVycilcbiAgICB9XG4gIH1cblxuICBvbklucHV0Q2hhbmdlIChldmVudCkge1xuICAgIHRoaXMudXBweS5sb2coJ1tEcmFnRHJvcF0gRmlsZXMgc2VsZWN0ZWQgdGhyb3VnaCBpbnB1dCcpXG4gICAgY29uc3QgZmlsZXMgPSB0b0FycmF5KGV2ZW50LnRhcmdldC5maWxlcylcbiAgICB0aGlzLmFkZEZpbGVzKGZpbGVzKVxuXG4gICAgLy8gV2UgY2xlYXIgdGhlIGlucHV0IGFmdGVyIGEgZmlsZSBpcyBzZWxlY3RlZCwgYmVjYXVzZSBvdGhlcndpc2VcbiAgICAvLyBjaGFuZ2UgZXZlbnQgaXMgbm90IGZpcmVkIGluIENocm9tZSBhbmQgU2FmYXJpIHdoZW4gYSBmaWxlXG4gICAgLy8gd2l0aCB0aGUgc2FtZSBuYW1lIGlzIHNlbGVjdGVkLlxuICAgIC8vIF9fX1doeSBub3QgdXNlIHZhbHVlPVwiXCIgb24gPGlucHV0Lz4gaW5zdGVhZD9cbiAgICAvLyAgICBCZWNhdXNlIGlmIHdlIHVzZSB0aGF0IG1ldGhvZCBvZiBjbGVhcmluZyB0aGUgaW5wdXQsXG4gICAgLy8gICAgQ2hyb21lIHdpbGwgbm90IHRyaWdnZXIgY2hhbmdlIGlmIHdlIGRyb3AgdGhlIHNhbWUgZmlsZSB0d2ljZSAoSXNzdWUgIzc2OCkuXG4gICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gbnVsbFxuICB9XG5cbiAgaGFuZGxlRHJvcCAoZXZlbnQsIGRyb3BDYXRlZ29yeSkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIGNsZWFyVGltZW91dCh0aGlzLnJlbW92ZURyYWdPdmVyQ2xhc3NUaW1lb3V0KVxuXG4gICAgLy8gMi4gUmVtb3ZlIGRyYWdvdmVyIGNsYXNzXG4gICAgdGhpcy5zZXRQbHVnaW5TdGF0ZSh7IGlzRHJhZ2dpbmdPdmVyOiBmYWxzZSB9KVxuXG4gICAgLy8gMy4gQWRkIGFsbCBkcm9wcGVkIGZpbGVzXG4gICAgdGhpcy51cHB5LmxvZygnW0RyYWdEcm9wXSBGaWxlcyB3ZXJlIGRyb3BwZWQnKVxuICAgIGNvbnN0IGxvZ0Ryb3BFcnJvciA9IChlcnJvcikgPT4ge1xuICAgICAgdGhpcy51cHB5LmxvZyhlcnJvciwgJ2Vycm9yJylcbiAgICB9XG4gICAgZ2V0RHJvcHBlZEZpbGVzKGV2ZW50LmRhdGFUcmFuc2ZlciwgeyBsb2dEcm9wRXJyb3IgfSlcbiAgICAgIC50aGVuKChmaWxlcykgPT4gdGhpcy5hZGRGaWxlcyhmaWxlcykpXG4gIH1cblxuICBoYW5kbGVEcmFnT3ZlciAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIC8vIDEuIEFkZCBhIHNtYWxsICgrKSBpY29uIG9uIGRyb3BcbiAgICAvLyAoYW5kIHByZXZlbnQgYnJvd3NlcnMgZnJvbSBpbnRlcnByZXRpbmcgdGhpcyBhcyBmaWxlcyBiZWluZyBfbW92ZWRfIGludG8gdGhlIGJyb3dzZXIsIGh0dHBzOi8vZ2l0aHViLmNvbS90cmFuc2xvYWRpdC91cHB5L2lzc3Vlcy8xOTc4KVxuICAgIGV2ZW50LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ2NvcHknXG5cbiAgICBjbGVhclRpbWVvdXQodGhpcy5yZW1vdmVEcmFnT3ZlckNsYXNzVGltZW91dClcbiAgICB0aGlzLnNldFBsdWdpblN0YXRlKHsgaXNEcmFnZ2luZ092ZXI6IHRydWUgfSlcbiAgfVxuXG4gIGhhbmRsZURyYWdMZWF2ZSAoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIGNsZWFyVGltZW91dCh0aGlzLnJlbW92ZURyYWdPdmVyQ2xhc3NUaW1lb3V0KVxuICAgIC8vIFRpbWVvdXQgYWdhaW5zdCBmbGlja2VyaW5nLCB0aGlzIHNvbHV0aW9uIGlzIHRha2VuIGZyb20gZHJhZy1kcm9wIGxpYnJhcnkuIFNvbHV0aW9uIHdpdGggJ3BvaW50ZXItZXZlbnRzOiBub25lJyBkaWRuJ3Qgd29yayBhY3Jvc3MgYnJvd3NlcnMuXG4gICAgdGhpcy5yZW1vdmVEcmFnT3ZlckNsYXNzVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5zZXRQbHVnaW5TdGF0ZSh7IGlzRHJhZ2dpbmdPdmVyOiBmYWxzZSB9KVxuICAgIH0sIDUwKVxuICB9XG5cbiAgcmVuZGVySGlkZGVuRmlsZUlucHV0ICgpIHtcbiAgICBjb25zdCByZXN0cmljdGlvbnMgPSB0aGlzLnVwcHkub3B0cy5yZXN0cmljdGlvbnNcbiAgICByZXR1cm4gKFxuICAgICAgPGlucHV0XG4gICAgICAgIGNsYXNzPVwidXBweS1EcmFnRHJvcC1pbnB1dFwiXG4gICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgdGFiaW5kZXg9ey0xfVxuICAgICAgICBmb2N1c2FibGU9XCJmYWxzZVwiXG4gICAgICAgIHJlZj17KHJlZikgPT4geyB0aGlzLmZpbGVJbnB1dFJlZiA9IHJlZiB9fVxuICAgICAgICBuYW1lPXt0aGlzLm9wdHMuaW5wdXROYW1lfVxuICAgICAgICBtdWx0aXBsZT17cmVzdHJpY3Rpb25zLm1heE51bWJlck9mRmlsZXMgIT09IDF9XG4gICAgICAgIGFjY2VwdD17cmVzdHJpY3Rpb25zLmFsbG93ZWRGaWxlVHlwZXN9XG4gICAgICAgIG9uY2hhbmdlPXt0aGlzLm9uSW5wdXRDaGFuZ2V9XG4gICAgICAvPlxuICAgIClcbiAgfVxuXG4gIHJlbmRlckFycm93U3ZnICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHN2ZyBhcmlhLWhpZGRlbj1cInRydWVcIiBmb2N1c2FibGU9XCJmYWxzZVwiIGNsYXNzPVwiVXBweUljb24gdXBweS1EcmFnRHJvcC1hcnJvd1wiIHdpZHRoPVwiMTZcIiBoZWlnaHQ9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMTYgMTZcIj5cbiAgICAgICAgPHBhdGggZD1cIk0xMSAxMFYwSDV2MTBIMmw2IDYgNi02aC0zem0wIDBcIiBmaWxsLXJ1bGU9XCJldmVub2RkXCIgLz5cbiAgICAgIDwvc3ZnPlxuICAgIClcbiAgfVxuXG4gIHJlbmRlckxhYmVsICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzcz1cInVwcHktRHJhZ0Ryb3AtbGFiZWxcIj5cbiAgICAgICAge3RoaXMuaTE4bkFycmF5KCdkcm9wSGVyZU9yJywge1xuICAgICAgICAgIGJyb3dzZTogPHNwYW4gY2xhc3M9XCJ1cHB5LURyYWdEcm9wLWJyb3dzZVwiPnt0aGlzLmkxOG4oJ2Jyb3dzZScpfTwvc3Bhbj5cbiAgICAgICAgfSl9XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuICByZW5kZXJOb3RlICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4gY2xhc3M9XCJ1cHB5LURyYWdEcm9wLW5vdGVcIj57dGhpcy5vcHRzLm5vdGV9PC9zcGFuPlxuICAgIClcbiAgfVxuXG4gIHJlbmRlciAoc3RhdGUpIHtcbiAgICBjb25zdCBkcmFnRHJvcENsYXNzID0gYFxuICAgICAgdXBweS1Sb290XG4gICAgICB1cHB5LXUtcmVzZXRcbiAgICAgIHVwcHktRHJhZ0Ryb3AtY29udGFpbmVyXG4gICAgICAke3RoaXMuaXNEcmFnRHJvcFN1cHBvcnRlZCA/ICd1cHB5LURyYWdEcm9wLS1pcy1kcmFnZHJvcC1zdXBwb3J0ZWQnIDogJyd9XG4gICAgICAke3RoaXMuZ2V0UGx1Z2luU3RhdGUoKS5pc0RyYWdnaW5nT3ZlciA/ICd1cHB5LURyYWdEcm9wLS1pc0RyYWdnaW5nT3ZlcicgOiAnJ31cbiAgICBgXG5cbiAgICBjb25zdCBkcmFnRHJvcFN0eWxlID0ge1xuICAgICAgd2lkdGg6IHRoaXMub3B0cy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5vcHRzLmhlaWdodFxuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzcz17ZHJhZ0Ryb3BDbGFzc31cbiAgICAgICAgc3R5bGU9e2RyYWdEcm9wU3R5bGV9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMuZmlsZUlucHV0UmVmLmNsaWNrKCl9XG4gICAgICAgIG9uRHJhZ092ZXI9e3RoaXMuaGFuZGxlRHJhZ092ZXJ9XG4gICAgICAgIG9uRHJhZ0xlYXZlPXt0aGlzLmhhbmRsZURyYWdMZWF2ZX1cbiAgICAgICAgb25Ecm9wPXt0aGlzLmhhbmRsZURyb3B9XG4gICAgICA+XG4gICAgICAgIHt0aGlzLnJlbmRlckhpZGRlbkZpbGVJbnB1dCgpfVxuICAgICAgICA8ZGl2IGNsYXNzPVwidXBweS1EcmFnRHJvcC1pbm5lclwiPlxuICAgICAgICAgIHt0aGlzLnJlbmRlckFycm93U3ZnKCl9XG4gICAgICAgICAge3RoaXMucmVuZGVyTGFiZWwoKX1cbiAgICAgICAgICB7dGhpcy5yZW5kZXJOb3RlKCl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9idXR0b24+XG4gICAgKVxuICB9XG5cbiAgaW5zdGFsbCAoKSB7XG4gICAgdGhpcy5zZXRQbHVnaW5TdGF0ZSh7XG4gICAgICBpc0RyYWdnaW5nT3ZlcjogZmFsc2VcbiAgICB9KVxuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMub3B0cy50YXJnZXRcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICB0aGlzLm1vdW50KHRhcmdldCwgdGhpcylcbiAgICB9XG4gIH1cblxuICB1bmluc3RhbGwgKCkge1xuICAgIHRoaXMudW5tb3VudCgpXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJuYW1lXCI6IFwiQHVwcHkvcHJvZ3Jlc3MtYmFyXCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJBIHByb2dyZXNzIGJhciBVSSBmb3IgVXBweVwiLFxuICBcInZlcnNpb25cIjogXCIxLjMuMTNcIixcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXG4gIFwibWFpblwiOiBcImxpYi9pbmRleC5qc1wiLFxuICBcInN0eWxlXCI6IFwiZGlzdC9zdHlsZS5taW4uY3NzXCIsXG4gIFwidHlwZXNcIjogXCJ0eXBlcy9pbmRleC5kLnRzXCIsXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwiZmlsZSB1cGxvYWRlclwiLFxuICAgIFwidXBweVwiLFxuICAgIFwidXBweS1wbHVnaW5cIixcbiAgICBcInByb2dyZXNzXCIsXG4gICAgXCJwcm9ncmVzcyBiYXJcIixcbiAgICBcInVwbG9hZCBwcm9ncmVzc1wiXG4gIF0sXG4gIFwiaG9tZXBhZ2VcIjogXCJodHRwczovL3VwcHkuaW9cIixcbiAgXCJidWdzXCI6IHtcbiAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS90cmFuc2xvYWRpdC91cHB5L2lzc3Vlc1wiXG4gIH0sXG4gIFwicmVwb3NpdG9yeVwiOiB7XG4gICAgXCJ0eXBlXCI6IFwiZ2l0XCIsXG4gICAgXCJ1cmxcIjogXCJnaXQraHR0cHM6Ly9naXRodWIuY29tL3RyYW5zbG9hZGl0L3VwcHkuZ2l0XCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHVwcHkvdXRpbHNcIjogXCJmaWxlOi4uL3V0aWxzXCIsXG4gICAgXCJwcmVhY3RcIjogXCI4LjIuOVwiXG4gIH0sXG4gIFwicGVlckRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAdXBweS9jb3JlXCI6IFwiXjEuMC4wXCJcbiAgfVxufVxuIiwiY29uc3QgeyBQbHVnaW4gfSA9IHJlcXVpcmUoJ0B1cHB5L2NvcmUnKVxuY29uc3QgeyBoIH0gPSByZXF1aXJlKCdwcmVhY3QnKVxuXG4vKipcbiAqIFByb2dyZXNzIGJhclxuICpcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQcm9ncmVzc0JhciBleHRlbmRzIFBsdWdpbiB7XG4gIHN0YXRpYyBWRVJTSU9OID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJykudmVyc2lvblxuXG4gIGNvbnN0cnVjdG9yICh1cHB5LCBvcHRzKSB7XG4gICAgc3VwZXIodXBweSwgb3B0cylcbiAgICB0aGlzLmlkID0gdGhpcy5vcHRzLmlkIHx8ICdQcm9ncmVzc0JhcidcbiAgICB0aGlzLnRpdGxlID0gJ1Byb2dyZXNzIEJhcidcbiAgICB0aGlzLnR5cGUgPSAncHJvZ3Jlc3NpbmRpY2F0b3InXG5cbiAgICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICB0YXJnZXQ6ICdib2R5JyxcbiAgICAgIHJlcGxhY2VUYXJnZXRDb250ZW50OiBmYWxzZSxcbiAgICAgIGZpeGVkOiBmYWxzZSxcbiAgICAgIGhpZGVBZnRlckZpbmlzaDogdHJ1ZVxuICAgIH1cblxuICAgIC8vIG1lcmdlIGRlZmF1bHQgb3B0aW9ucyB3aXRoIHRoZSBvbmVzIHNldCBieSB1c2VyXG4gICAgdGhpcy5vcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdHMpXG5cbiAgICB0aGlzLnJlbmRlciA9IHRoaXMucmVuZGVyLmJpbmQodGhpcylcbiAgfVxuXG4gIHJlbmRlciAoc3RhdGUpIHtcbiAgICBjb25zdCBwcm9ncmVzcyA9IHN0YXRlLnRvdGFsUHJvZ3Jlc3MgfHwgMFxuICAgIGNvbnN0IGlzSGlkZGVuID0gcHJvZ3Jlc3MgPT09IDEwMCAmJiB0aGlzLm9wdHMuaGlkZUFmdGVyRmluaXNoXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3M9XCJ1cHB5IHVwcHktUHJvZ3Jlc3NCYXJcIlxuICAgICAgICBzdHlsZT17eyBwb3NpdGlvbjogdGhpcy5vcHRzLmZpeGVkID8gJ2ZpeGVkJyA6ICdpbml0aWFsJyB9fVxuICAgICAgICBhcmlhLWhpZGRlbj17aXNIaWRkZW59XG4gICAgICA+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ1cHB5LVByb2dyZXNzQmFyLWlubmVyXCIgc3R5bGU9e3sgd2lkdGg6IHByb2dyZXNzICsgJyUnIH19IC8+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ1cHB5LVByb2dyZXNzQmFyLXBlcmNlbnRhZ2VcIj57cHJvZ3Jlc3N9PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuICBpbnN0YWxsICgpIHtcbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLm9wdHMudGFyZ2V0XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgdGhpcy5tb3VudCh0YXJnZXQsIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgdW5pbnN0YWxsICgpIHtcbiAgICB0aGlzLnVubW91bnQoKVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibmFtZVwiOiBcIkB1cHB5L3N0b3JlLWRlZmF1bHRcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlRoZSBkZWZhdWx0IHNpbXBsZSBvYmplY3QtYmFzZWQgc3RvcmUgZm9yIFVwcHkuXCIsXG4gIFwidmVyc2lvblwiOiBcIjEuMi4xXCIsXG4gIFwibGljZW5zZVwiOiBcIk1JVFwiLFxuICBcIm1haW5cIjogXCJsaWIvaW5kZXguanNcIixcbiAgXCJ0eXBlc1wiOiBcInR5cGVzL2luZGV4LmQudHNcIixcbiAgXCJrZXl3b3Jkc1wiOiBbXG4gICAgXCJmaWxlIHVwbG9hZGVyXCIsXG4gICAgXCJ1cHB5XCIsXG4gICAgXCJ1cHB5LXN0b3JlXCJcbiAgXSxcbiAgXCJob21lcGFnZVwiOiBcImh0dHBzOi8vdXBweS5pb1wiLFxuICBcImJ1Z3NcIjoge1xuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3RyYW5zbG9hZGl0L3VwcHkvaXNzdWVzXCJcbiAgfSxcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImdpdCtodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS5naXRcIlxuICB9XG59XG4iLCIvKipcbiAqIERlZmF1bHQgc3RvcmUgdGhhdCBrZWVwcyBzdGF0ZSBpbiBhIHNpbXBsZSBvYmplY3QuXG4gKi9cbmNsYXNzIERlZmF1bHRTdG9yZSB7XG4gIHN0YXRpYyBWRVJTSU9OID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJykudmVyc2lvblxuXG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICB0aGlzLnN0YXRlID0ge31cbiAgICB0aGlzLmNhbGxiYWNrcyA9IFtdXG4gIH1cblxuICBnZXRTdGF0ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGVcbiAgfVxuXG4gIHNldFN0YXRlIChwYXRjaCkge1xuICAgIGNvbnN0IHByZXZTdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUpXG4gICAgY29uc3QgbmV4dFN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5zdGF0ZSwgcGF0Y2gpXG5cbiAgICB0aGlzLnN0YXRlID0gbmV4dFN0YXRlXG4gICAgdGhpcy5fcHVibGlzaChwcmV2U3RhdGUsIG5leHRTdGF0ZSwgcGF0Y2gpXG4gIH1cblxuICBzdWJzY3JpYmUgKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5jYWxsYmFja3MucHVzaChsaXN0ZW5lcilcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgLy8gUmVtb3ZlIHRoZSBsaXN0ZW5lci5cbiAgICAgIHRoaXMuY2FsbGJhY2tzLnNwbGljZShcbiAgICAgICAgdGhpcy5jYWxsYmFja3MuaW5kZXhPZihsaXN0ZW5lciksXG4gICAgICAgIDFcbiAgICAgIClcbiAgICB9XG4gIH1cblxuICBfcHVibGlzaCAoLi4uYXJncykge1xuICAgIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICBsaXN0ZW5lciguLi5hcmdzKVxuICAgIH0pXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZhdWx0U3RvcmUgKCkge1xuICByZXR1cm4gbmV3IERlZmF1bHRTdG9yZSgpXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibmFtZVwiOiBcIkB1cHB5L3R1c1wiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiUmVzdW1hYmxlIHVwbG9hZHMgZm9yIFVwcHkgdXNpbmcgVHVzLmlvXCIsXG4gIFwidmVyc2lvblwiOiBcIjEuNS4xMlwiLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJtYWluXCI6IFwibGliL2luZGV4LmpzXCIsXG4gIFwidHlwZXNcIjogXCJ0eXBlcy9pbmRleC5kLnRzXCIsXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwiZmlsZSB1cGxvYWRlclwiLFxuICAgIFwidXBweVwiLFxuICAgIFwidXBweS1wbHVnaW5cIixcbiAgICBcInVwbG9hZFwiLFxuICAgIFwicmVzdW1hYmxlXCIsXG4gICAgXCJ0dXNcIlxuICBdLFxuICBcImhvbWVwYWdlXCI6IFwiaHR0cHM6Ly91cHB5LmlvXCIsXG4gIFwiYnVnc1wiOiB7XG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS9pc3N1ZXNcIlxuICB9LFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiZ2l0K2h0dHBzOi8vZ2l0aHViLmNvbS90cmFuc2xvYWRpdC91cHB5LmdpdFwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkB0eXBlcy90dXMtanMtY2xpZW50XCI6IFwiXjEuOC4wXCIsXG4gICAgXCJAdXBweS9jb21wYW5pb24tY2xpZW50XCI6IFwiZmlsZTouLi9jb21wYW5pb24tY2xpZW50XCIsXG4gICAgXCJAdXBweS91dGlsc1wiOiBcImZpbGU6Li4vdXRpbHNcIixcbiAgICBcInR1cy1qcy1jbGllbnRcIjogXCJeMS44LjBcIlxuICB9LFxuICBcInBlZXJEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHVwcHkvY29yZVwiOiBcIl4xLjAuMFwiXG4gIH1cbn1cbiIsImNvbnN0IHR1cyA9IHJlcXVpcmUoJ3R1cy1qcy1jbGllbnQnKVxuXG5mdW5jdGlvbiBpc0NvcmRvdmEgKCkge1xuICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgKFxuICAgIHR5cGVvZiB3aW5kb3cuUGhvbmVHYXAgIT09ICd1bmRlZmluZWQnIHx8XG4gICAgdHlwZW9mIHdpbmRvdy5Db3Jkb3ZhICE9PSAndW5kZWZpbmVkJyB8fFxuICAgIHR5cGVvZiB3aW5kb3cuY29yZG92YSAhPT0gJ3VuZGVmaW5lZCdcbiAgKVxufVxuXG5mdW5jdGlvbiBpc1JlYWN0TmF0aXZlICgpIHtcbiAgcmV0dXJuIHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnc3RyaW5nJyAmJlxuICAgIG5hdmlnYXRvci5wcm9kdWN0LnRvTG93ZXJDYXNlKCkgPT09ICdyZWFjdG5hdGl2ZSdcbn1cblxuLy8gV2Ugb3ZlcnJpZGUgdHVzIGZpbmdlcnByaW50IHRvIHVwcHnigJlzIGBmaWxlLmlkYCwgc2luY2UgdGhlIGBmaWxlLmlkYFxuLy8gbm93IGFsc28gaW5jbHVkZXMgYHJlbGF0aXZlUGF0aGAgZm9yIGZpbGVzIGFkZGVkIGZyb20gZm9sZGVycy5cbi8vIFRoaXMgbWVhbnMgeW91IGNhbiBhZGQgMiBpZGVudGljYWwgZmlsZXMsIGlmIG9uZSBpcyBpbiBmb2xkZXIgYSxcbi8vIHRoZSBvdGhlciBpbiBmb2xkZXIgYiDigJQgYGEvZmlsZS5qcGdgIGFuZCBgYi9maWxlLmpwZ2AsIHdoZW4gYWRkZWRcbi8vIHRvZ2V0aGVyIHdpdGggYSBmb2xkZXIsIHdpbGwgYmUgdHJlYXRlZCBhcyAyIHNlcGFyYXRlIGZpbGVzLlxuLy9cbi8vIEZvciBSZWFjdCBOYXRpdmUgYW5kIENvcmRvdmEsIHdlIGxldCB0dXMtanMtY2xpZW504oCZcyBkZWZhdWx0XG4vLyBmaW5nZXJwcmludCBoYW5kbGluZyB0YWtlIGNoYXJnZS5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0RmluZ2VycHJpbnQgKHVwcHlGaWxlT2JqKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZmlsZSwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBpZiAoaXNDb3Jkb3ZhKCkgfHwgaXNSZWFjdE5hdGl2ZSgpKSB7XG4gICAgICByZXR1cm4gdHVzLlVwbG9hZC5kZWZhdWx0T3B0aW9ucy5maW5nZXJwcmludChmaWxlLCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICB9XG5cbiAgICBjb25zdCB1cHB5RmluZ2VycHJpbnQgPSBbXG4gICAgICAndHVzJyxcbiAgICAgIHVwcHlGaWxlT2JqLmlkLFxuICAgICAgb3B0aW9ucy5lbmRwb2ludFxuICAgIF0uam9pbignLScpXG5cbiAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgdXBweUZpbmdlcnByaW50KVxuICB9XG59XG4iLCJjb25zdCB7IFBsdWdpbiB9ID0gcmVxdWlyZSgnQHVwcHkvY29yZScpXG5jb25zdCB0dXMgPSByZXF1aXJlKCd0dXMtanMtY2xpZW50JylcbmNvbnN0IHsgUHJvdmlkZXIsIFJlcXVlc3RDbGllbnQsIFNvY2tldCB9ID0gcmVxdWlyZSgnQHVwcHkvY29tcGFuaW9uLWNsaWVudCcpXG5jb25zdCBlbWl0U29ja2V0UHJvZ3Jlc3MgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZW1pdFNvY2tldFByb2dyZXNzJylcbmNvbnN0IGdldFNvY2tldEhvc3QgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2V0U29ja2V0SG9zdCcpXG5jb25zdCBzZXR0bGUgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvc2V0dGxlJylcbmNvbnN0IEV2ZW50VHJhY2tlciA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9FdmVudFRyYWNrZXInKVxuY29uc3QgTmV0d29ya0Vycm9yID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL05ldHdvcmtFcnJvcicpXG5jb25zdCBpc05ldHdvcmtFcnJvciA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9pc05ldHdvcmtFcnJvcicpXG5jb25zdCBSYXRlTGltaXRlZFF1ZXVlID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL1JhdGVMaW1pdGVkUXVldWUnKVxuY29uc3QgZ2V0RmluZ2VycHJpbnQgPSByZXF1aXJlKCcuL2dldEZpbmdlcnByaW50JylcblxuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4uJykuVHVzT3B0aW9uc30gVHVzT3B0aW9ucyAqL1xuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJ0B1cHB5L2NvcmUnKS5VcHB5fSBVcHB5ICovXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnQHVwcHkvY29yZScpLlVwcHlGaWxlfSBVcHB5RmlsZSAqL1xuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJ0B1cHB5L2NvcmUnKS5GYWlsZWRVcHB5RmlsZTx7fT59IEZhaWxlZFVwcHlGaWxlICovXG5cbi8qKlxuICogRXh0cmFjdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3R1cy90dXMtanMtY2xpZW50L2Jsb2IvbWFzdGVyL2xpYi91cGxvYWQuanMjTDEzXG4gKiBleGNlcHRlZCB3ZSByZW1vdmVkICdmaW5nZXJwcmludCcga2V5IHRvIGF2b2lkIGFkZGluZyBtb3JlIGRlcGVuZGVuY2llc1xuICpcbiAqIEB0eXBlIHtUdXNPcHRpb25zfVxuICovXG5jb25zdCB0dXNEZWZhdWx0T3B0aW9ucyA9IHtcbiAgZW5kcG9pbnQ6ICcnLFxuICByZXN1bWU6IHRydWUsXG4gIG9uUHJvZ3Jlc3M6IG51bGwsXG4gIG9uQ2h1bmtDb21wbGV0ZTogbnVsbCxcbiAgb25TdWNjZXNzOiBudWxsLFxuICBvbkVycm9yOiBudWxsLFxuICBoZWFkZXJzOiB7fSxcbiAgY2h1bmtTaXplOiBJbmZpbml0eSxcbiAgd2l0aENyZWRlbnRpYWxzOiBmYWxzZSxcbiAgdXBsb2FkVXJsOiBudWxsLFxuICB1cGxvYWRTaXplOiBudWxsLFxuICBvdmVycmlkZVBhdGNoTWV0aG9kOiBmYWxzZSxcbiAgcmV0cnlEZWxheXM6IG51bGxcbn1cblxuLyoqXG4gKiBUdXMgcmVzdW1hYmxlIGZpbGUgdXBsb2FkZXJcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUdXMgZXh0ZW5kcyBQbHVnaW4ge1xuICBzdGF0aWMgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb25cblxuICAvKipcbiAgICogQHBhcmFtIHtVcHB5fSB1cHB5XG4gICAqIEBwYXJhbSB7VHVzT3B0aW9uc30gb3B0c1xuICAgKi9cbiAgY29uc3RydWN0b3IgKHVwcHksIG9wdHMpIHtcbiAgICBzdXBlcih1cHB5LCBvcHRzKVxuICAgIHRoaXMudHlwZSA9ICd1cGxvYWRlcidcbiAgICB0aGlzLmlkID0gdGhpcy5vcHRzLmlkIHx8ICdUdXMnXG4gICAgdGhpcy50aXRsZSA9ICdUdXMnXG5cbiAgICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICByZXN1bWU6IHRydWUsXG4gICAgICBhdXRvUmV0cnk6IHRydWUsXG4gICAgICB1c2VGYXN0UmVtb3RlUmV0cnk6IHRydWUsXG4gICAgICBsaW1pdDogMCxcbiAgICAgIHJldHJ5RGVsYXlzOiBbMCwgMTAwMCwgMzAwMCwgNTAwMF1cbiAgICB9XG5cbiAgICAvLyBtZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlclxuICAgIC8qKiBAdHlwZSB7aW1wb3J0KFwiLi5cIikuVHVzT3B0aW9uc30gKi9cbiAgICB0aGlzLm9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0cylcblxuICAgIC8qKlxuICAgICAqIFNpbXVsdGFuZW91cyB1cGxvYWQgbGltaXRpbmcgaXMgc2hhcmVkIGFjcm9zcyBhbGwgdXBsb2FkcyB3aXRoIHRoaXMgcGx1Z2luLlxuICAgICAqXG4gICAgICogQHR5cGUge1JhdGVMaW1pdGVkUXVldWV9XG4gICAgICovXG4gICAgdGhpcy5yZXF1ZXN0cyA9IG5ldyBSYXRlTGltaXRlZFF1ZXVlKHRoaXMub3B0cy5saW1pdClcblxuICAgIHRoaXMudXBsb2FkZXJzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgIHRoaXMudXBsb2FkZXJFdmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgdGhpcy51cGxvYWRlclNvY2tldHMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG5cbiAgICB0aGlzLmhhbmRsZVJlc2V0UHJvZ3Jlc3MgPSB0aGlzLmhhbmRsZVJlc2V0UHJvZ3Jlc3MuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlVXBsb2FkID0gdGhpcy5oYW5kbGVVcGxvYWQuYmluZCh0aGlzKVxuICB9XG5cbiAgaGFuZGxlUmVzZXRQcm9ncmVzcyAoKSB7XG4gICAgY29uc3QgZmlsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnVwcHkuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBPYmplY3Qua2V5cyhmaWxlcykuZm9yRWFjaCgoZmlsZUlEKSA9PiB7XG4gICAgICAvLyBPbmx5IGNsb25lIHRoZSBmaWxlIG9iamVjdCBpZiBpdCBoYXMgYSBUdXMgYHVwbG9hZFVybGAgYXR0YWNoZWQuXG4gICAgICBpZiAoZmlsZXNbZmlsZUlEXS50dXMgJiYgZmlsZXNbZmlsZUlEXS50dXMudXBsb2FkVXJsKSB7XG4gICAgICAgIGNvbnN0IHR1c1N0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgZmlsZXNbZmlsZUlEXS50dXMpXG4gICAgICAgIGRlbGV0ZSB0dXNTdGF0ZS51cGxvYWRVcmxcbiAgICAgICAgZmlsZXNbZmlsZUlEXSA9IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGVJRF0sIHsgdHVzOiB0dXNTdGF0ZSB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLnVwcHkuc2V0U3RhdGUoeyBmaWxlcyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIENsZWFuIHVwIGFsbCByZWZlcmVuY2VzIGZvciBhIGZpbGUncyB1cGxvYWQ6IHRoZSB0dXMuVXBsb2FkIGluc3RhbmNlLFxuICAgKiBhbnkgZXZlbnRzIHJlbGF0ZWQgdG8gdGhlIGZpbGUsIGFuZCB0aGUgQ29tcGFuaW9uIFdlYlNvY2tldCBjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlEXG4gICAqL1xuICByZXNldFVwbG9hZGVyUmVmZXJlbmNlcyAoZmlsZUlELCBvcHRzID0ge30pIHtcbiAgICBpZiAodGhpcy51cGxvYWRlcnNbZmlsZUlEXSkge1xuICAgICAgY29uc3QgdXBsb2FkZXIgPSB0aGlzLnVwbG9hZGVyc1tmaWxlSURdXG4gICAgICB1cGxvYWRlci5hYm9ydCgpXG4gICAgICBpZiAob3B0cy5hYm9ydCkge1xuICAgICAgICAvLyB0byBhdm9pZCA0MjMgZXJyb3IgZnJvbSB0dXMgc2VydmVyLCB3ZSB3YWl0XG4gICAgICAgIC8vIHRvIGJlIHN1cmUgdGhlIHByZXZpb3VzIHJlcXVlc3QgaGFzIGJlZW4gYWJvcnRlZCBiZWZvcmUgdGVybWluYXRpbmcgdGhlIHVwbG9hZFxuICAgICAgICAvLyBAdG9kbyByZW1vdmUgdGhlIHRpbWVvdXQgd2hlbiB0aGlzIFwid2FpdFwiIGlzIGhhbmRsZWQgaW4gdHVzLWpzLWNsaWVudCBpbnRlcm5hbGx5XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdXBsb2FkZXIuYWJvcnQodHJ1ZSksIDEwMDApXG4gICAgICB9XG4gICAgICB0aGlzLnVwbG9hZGVyc1tmaWxlSURdID0gbnVsbFxuICAgIH1cbiAgICBpZiAodGhpcy51cGxvYWRlckV2ZW50c1tmaWxlSURdKSB7XG4gICAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGVJRF0ucmVtb3ZlKClcbiAgICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXSA9IG51bGxcbiAgICB9XG4gICAgaWYgKHRoaXMudXBsb2FkZXJTb2NrZXRzW2ZpbGVJRF0pIHtcbiAgICAgIHRoaXMudXBsb2FkZXJTb2NrZXRzW2ZpbGVJRF0uY2xvc2UoKVxuICAgICAgdGhpcy51cGxvYWRlclNvY2tldHNbZmlsZUlEXSA9IG51bGxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IFR1cyB1cGxvYWQuXG4gICAqXG4gICAqIEEgbG90IGNhbiBoYXBwZW4gZHVyaW5nIGFuIHVwbG9hZCwgc28gdGhpcyBpcyBxdWl0ZSBoYXJkIHRvIGZvbGxvdyFcbiAgICogLSBGaXJzdCwgdGhlIHVwbG9hZCBpcyBzdGFydGVkLiBJZiB0aGUgZmlsZSB3YXMgYWxyZWFkeSBwYXVzZWQgYnkgdGhlIHRpbWUgdGhlIHVwbG9hZCBzdGFydHMsIG5vdGhpbmcgc2hvdWxkIGhhcHBlbi5cbiAgICogICBJZiB0aGUgYGxpbWl0YCBvcHRpb24gaXMgdXNlZCwgdGhlIHVwbG9hZCBtdXN0IGJlIHF1ZXVlZCBvbnRvIHRoZSBgdGhpcy5yZXF1ZXN0c2AgcXVldWUuXG4gICAqICAgV2hlbiBhbiB1cGxvYWQgc3RhcnRzLCB3ZSBzdG9yZSB0aGUgdHVzLlVwbG9hZCBpbnN0YW5jZSwgYW5kIGFuIEV2ZW50VHJhY2tlciBpbnN0YW5jZSB0aGF0IG1hbmFnZXMgdGhlIGV2ZW50IGxpc3RlbmVyc1xuICAgKiAgIGZvciBwYXVzaW5nLCBjYW5jZWxsYXRpb24sIHJlbW92YWwsIGV0Yy5cbiAgICogLSBXaGlsZSB0aGUgdXBsb2FkIGlzIGluIHByb2dyZXNzLCBpdCBtYXkgYmUgcGF1c2VkIG9yIGNhbmNlbGxlZC5cbiAgICogICBQYXVzaW5nIGFib3J0cyB0aGUgdW5kZXJseWluZyB0dXMuVXBsb2FkLCBhbmQgcmVtb3ZlcyB0aGUgdXBsb2FkIGZyb20gdGhlIGB0aGlzLnJlcXVlc3RzYCBxdWV1ZS4gQWxsIG90aGVyIHN0YXRlIGlzXG4gICAqICAgbWFpbnRhaW5lZC5cbiAgICogICBDYW5jZWxsaW5nIHJlbW92ZXMgdGhlIHVwbG9hZCBmcm9tIHRoZSBgdGhpcy5yZXF1ZXN0c2AgcXVldWUsIGFuZCBjb21wbGV0ZWx5IGFib3J0cyB0aGUgdXBsb2FkLS10aGUgdHVzLlVwbG9hZCBpbnN0YW5jZVxuICAgKiAgIGlzIGFib3J0ZWQgYW5kIGRpc2NhcmRlZCwgdGhlIEV2ZW50VHJhY2tlciBpbnN0YW5jZSBpcyBkZXN0cm95ZWQgKHJlbW92aW5nIGFsbCBsaXN0ZW5lcnMpLlxuICAgKiAgIFJlc3VtaW5nIHRoZSB1cGxvYWQgdXNlcyB0aGUgYHRoaXMucmVxdWVzdHNgIHF1ZXVlIGFzIHdlbGwsIHRvIHByZXZlbnQgc2VsZWN0aXZlbHkgcGF1c2luZyBhbmQgcmVzdW1pbmcgdXBsb2FkcyBmcm9tXG4gICAqICAgYnlwYXNzaW5nIHRoZSBsaW1pdC5cbiAgICogLSBBZnRlciBjb21wbGV0aW5nIGFuIHVwbG9hZCwgdGhlIHR1cy5VcGxvYWQgYW5kIEV2ZW50VHJhY2tlciBpbnN0YW5jZXMgYXJlIGNsZWFuZWQgdXAsIGFuZCB0aGUgdXBsb2FkIGlzIG1hcmtlZCBhcyBkb25lXG4gICAqICAgaW4gdGhlIGB0aGlzLnJlcXVlc3RzYCBxdWV1ZS5cbiAgICogLSBXaGVuIGFuIHVwbG9hZCBjb21wbGV0ZWQgd2l0aCBhbiBlcnJvciwgdGhlIHNhbWUgaGFwcGVucyBhcyBvbiBzdWNjZXNzZnVsIGNvbXBsZXRpb24sIGJ1dCB0aGUgYHVwbG9hZCgpYCBwcm9taXNlIGlzIHJlamVjdGVkLlxuICAgKlxuICAgKiBXaGVuIHdvcmtpbmcgb24gdGhpcyBmdW5jdGlvbiwga2VlcCBpbiBtaW5kOlxuICAgKiAgLSBXaGVuIGFuIHVwbG9hZCBpcyBjb21wbGV0ZWQgb3IgY2FuY2VsbGVkIGZvciBhbnkgcmVhc29uLCB0aGUgdHVzLlVwbG9hZCBhbmQgRXZlbnRUcmFja2VyIGluc3RhbmNlcyBuZWVkIHRvIGJlIGNsZWFuZWQgdXAgdXNpbmcgdGhpcy5yZXNldFVwbG9hZGVyUmVmZXJlbmNlcygpLlxuICAgKiAgLSBXaGVuIGFuIHVwbG9hZCBpcyBjYW5jZWxsZWQgb3IgcGF1c2VkLCBmb3IgYW55IHJlYXNvbiwgaXQgbmVlZHMgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBgdGhpcy5yZXF1ZXN0c2AgcXVldWUgdXNpbmcgYHF1ZXVlZFJlcXVlc3QuYWJvcnQoKWAuXG4gICAqICAtIFdoZW4gYW4gdXBsb2FkIGlzIGNvbXBsZXRlZCBmb3IgYW55IHJlYXNvbiwgaW5jbHVkaW5nIGVycm9ycywgaXQgbmVlZHMgdG8gYmUgbWFya2VkIGFzIHN1Y2ggdXNpbmcgYHF1ZXVlZFJlcXVlc3QuZG9uZSgpYC5cbiAgICogIC0gV2hlbiBhbiB1cGxvYWQgaXMgc3RhcnRlZCBvciByZXN1bWVkLCBpdCBuZWVkcyB0byBnbyB0aHJvdWdoIHRoZSBgdGhpcy5yZXF1ZXN0c2AgcXVldWUuIFRoZSBgcXVldWVkUmVxdWVzdGAgdmFyaWFibGUgbXVzdCBiZSB1cGRhdGVkIHNvIHRoZSBvdGhlciB1c2VzIG9mIGl0IGFyZSB2YWxpZC5cbiAgICogIC0gQmVmb3JlIHJlcGxhY2luZyB0aGUgYHF1ZXVlZFJlcXVlc3RgIHZhcmlhYmxlLCB0aGUgcHJldmlvdXMgYHF1ZXVlZFJlcXVlc3RgIG11c3QgYmUgYWJvcnRlZCwgZWxzZSBpdCB3aWxsIGtlZXAgdGFraW5nIHVwIGEgc3BvdCBpbiB0aGUgcXVldWUuXG4gICAqXG4gICAqIEBwYXJhbSB7VXBweUZpbGV9IGZpbGUgZm9yIHVzZSB3aXRoIHVwbG9hZFxuICAgKiBAcGFyYW0ge251bWJlcn0gY3VycmVudCBmaWxlIGluIGEgcXVldWVcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRvdGFsIG51bWJlciBvZiBmaWxlcyBpbiBhIHF1ZXVlXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgdXBsb2FkIChmaWxlLCBjdXJyZW50LCB0b3RhbCkge1xuICAgIHRoaXMucmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoZmlsZS5pZClcblxuICAgIC8vIENyZWF0ZSBhIG5ldyB0dXMgdXBsb2FkXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtc3RhcnRlZCcsIGZpbGUpXG5cbiAgICAgIGNvbnN0IG9wdHNUdXMgPSBPYmplY3QuYXNzaWduKFxuICAgICAgICB7fSxcbiAgICAgICAgdHVzRGVmYXVsdE9wdGlvbnMsXG4gICAgICAgIHRoaXMub3B0cyxcbiAgICAgICAgLy8gSW5zdGFsbCBmaWxlLXNwZWNpZmljIHVwbG9hZCBvdmVycmlkZXMuXG4gICAgICAgIGZpbGUudHVzIHx8IHt9XG4gICAgICApXG5cbiAgICAgIC8vIFdlIG92ZXJyaWRlIHR1cyBmaW5nZXJwcmludCB0byB1cHB54oCZcyBgZmlsZS5pZGAsIHNpbmNlIHRoZSBgZmlsZS5pZGBcbiAgICAgIC8vIG5vdyBhbHNvIGluY2x1ZGVzIGByZWxhdGl2ZVBhdGhgIGZvciBmaWxlcyBhZGRlZCBmcm9tIGZvbGRlcnMuXG4gICAgICAvLyBUaGlzIG1lYW5zIHlvdSBjYW4gYWRkIDIgaWRlbnRpY2FsIGZpbGVzLCBpZiBvbmUgaXMgaW4gZm9sZGVyIGEsXG4gICAgICAvLyB0aGUgb3RoZXIgaW4gZm9sZGVyIGIuXG4gICAgICBvcHRzVHVzLmZpbmdlcnByaW50ID0gZ2V0RmluZ2VycHJpbnQoZmlsZSlcblxuICAgICAgb3B0c1R1cy5vbkVycm9yID0gKGVycikgPT4ge1xuICAgICAgICB0aGlzLnVwcHkubG9nKGVycilcblxuICAgICAgICBpZiAoaXNOZXR3b3JrRXJyb3IoZXJyLm9yaWdpbmFsUmVxdWVzdCkpIHtcbiAgICAgICAgICBlcnIgPSBuZXcgTmV0d29ya0Vycm9yKGVyciwgZXJyLm9yaWdpbmFsUmVxdWVzdClcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtZXJyb3InLCBmaWxlLCBlcnIpXG5cbiAgICAgICAgdGhpcy5yZXNldFVwbG9hZGVyUmVmZXJlbmNlcyhmaWxlLmlkKVxuICAgICAgICBxdWV1ZWRSZXF1ZXN0LmRvbmUoKVxuICAgICAgICByZWplY3QoZXJyKVxuICAgICAgfVxuXG4gICAgICBvcHRzVHVzLm9uUHJvZ3Jlc3MgPSAoYnl0ZXNVcGxvYWRlZCwgYnl0ZXNUb3RhbCkgPT4ge1xuICAgICAgICB0aGlzLm9uUmVjZWl2ZVVwbG9hZFVybChmaWxlLCB1cGxvYWQudXJsKVxuICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLXByb2dyZXNzJywgZmlsZSwge1xuICAgICAgICAgIHVwbG9hZGVyOiB0aGlzLFxuICAgICAgICAgIGJ5dGVzVXBsb2FkZWQ6IGJ5dGVzVXBsb2FkZWQsXG4gICAgICAgICAgYnl0ZXNUb3RhbDogYnl0ZXNUb3RhbFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBvcHRzVHVzLm9uU3VjY2VzcyA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdXBsb2FkUmVzcCA9IHtcbiAgICAgICAgICB1cGxvYWRVUkw6IHVwbG9hZC51cmxcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtc3VjY2VzcycsIGZpbGUsIHVwbG9hZFJlc3ApXG5cbiAgICAgICAgaWYgKHVwbG9hZC51cmwpIHtcbiAgICAgICAgICB0aGlzLnVwcHkubG9nKCdEb3dubG9hZCAnICsgdXBsb2FkLmZpbGUubmFtZSArICcgZnJvbSAnICsgdXBsb2FkLnVybClcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoZmlsZS5pZClcbiAgICAgICAgcXVldWVkUmVxdWVzdC5kb25lKClcbiAgICAgICAgcmVzb2x2ZSh1cGxvYWQpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvcHlQcm9wID0gKG9iaiwgc3JjUHJvcCwgZGVzdFByb3ApID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHNyY1Byb3ApICYmXG4gICAgICAgICAgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGRlc3RQcm9wKVxuICAgICAgICApIHtcbiAgICAgICAgICBvYmpbZGVzdFByb3BdID0gb2JqW3NyY1Byb3BdXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgbWV0YSA9IHt9XG4gICAgICBjb25zdCBtZXRhRmllbGRzID0gQXJyYXkuaXNBcnJheShvcHRzVHVzLm1ldGFGaWVsZHMpXG4gICAgICAgID8gb3B0c1R1cy5tZXRhRmllbGRzXG4gICAgICAgIC8vIFNlbmQgYWxvbmcgYWxsIGZpZWxkcyBieSBkZWZhdWx0LlxuICAgICAgICA6IE9iamVjdC5rZXlzKGZpbGUubWV0YSlcbiAgICAgIG1ldGFGaWVsZHMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBtZXRhW2l0ZW1dID0gZmlsZS5tZXRhW2l0ZW1dXG4gICAgICB9KVxuXG4gICAgICAvLyB0dXNkIHVzZXMgbWV0YWRhdGEgZmllbGRzICdmaWxldHlwZScgYW5kICdmaWxlbmFtZSdcbiAgICAgIGNvcHlQcm9wKG1ldGEsICd0eXBlJywgJ2ZpbGV0eXBlJylcbiAgICAgIGNvcHlQcm9wKG1ldGEsICduYW1lJywgJ2ZpbGVuYW1lJylcblxuICAgICAgb3B0c1R1cy5tZXRhZGF0YSA9IG1ldGFcblxuICAgICAgY29uc3QgdXBsb2FkID0gbmV3IHR1cy5VcGxvYWQoZmlsZS5kYXRhLCBvcHRzVHVzKVxuICAgICAgdGhpcy51cGxvYWRlcnNbZmlsZS5pZF0gPSB1cGxvYWRcbiAgICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZS5pZF0gPSBuZXcgRXZlbnRUcmFja2VyKHRoaXMudXBweSlcblxuICAgICAgbGV0IHF1ZXVlZFJlcXVlc3QgPSB0aGlzLnJlcXVlc3RzLnJ1bigoKSA9PiB7XG4gICAgICAgIGlmICghZmlsZS5pc1BhdXNlZCkge1xuICAgICAgICAgIHVwbG9hZC5zdGFydCgpXG4gICAgICAgIH1cbiAgICAgICAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaGVyZSwgdGhlIGNhbGxlciB3aWxsIHRha2UgY2FyZSBvZiBjYW5jZWxsaW5nIHRoZSB1cGxvYWQgaXRzZWxmXG4gICAgICAgIC8vIHVzaW5nIHJlc2V0VXBsb2FkZXJSZWZlcmVuY2VzKCkuIFRoaXMgaXMgYmVjYXVzZSByZXNldFVwbG9hZGVyUmVmZXJlbmNlcygpIGhhcyB0byBiZVxuICAgICAgICAvLyBjYWxsZWQgd2hlbiB0aGlzIHJlcXVlc3QgaXMgc3RpbGwgaW4gdGhlIHF1ZXVlLCBhbmQgaGFzIG5vdCBiZWVuIHN0YXJ0ZWQgeWV0LCB0b28uIEF0XG4gICAgICAgIC8vIHRoYXQgcG9pbnQgdGhpcyBjYW5jZWxsYXRpb24gZnVuY3Rpb24gaXMgbm90IGdvaW5nIHRvIGJlIGNhbGxlZC5cbiAgICAgICAgLy8gQWxzbywgd2UgbmVlZCB0byByZW1vdmUgdGhlIHJlcXVlc3QgZnJvbSB0aGUgcXVldWUgX3dpdGhvdXRfIGRlc3Ryb3lpbmcgZXZlcnl0aGluZ1xuICAgICAgICAvLyByZWxhdGVkIHRvIHRoaXMgdXBsb2FkIHRvIGhhbmRsZSBwYXVzZXMuXG4gICAgICAgIHJldHVybiAoKSA9PiB7fVxuICAgICAgfSlcblxuICAgICAgdGhpcy5vbkZpbGVSZW1vdmUoZmlsZS5pZCwgKHRhcmdldEZpbGVJRCkgPT4ge1xuICAgICAgICBxdWV1ZWRSZXF1ZXN0LmFib3J0KClcbiAgICAgICAgdGhpcy5yZXNldFVwbG9hZGVyUmVmZXJlbmNlcyhmaWxlLmlkLCB7IGFib3J0OiAhIXVwbG9hZC51cmwgfSlcbiAgICAgICAgcmVzb2x2ZShgdXBsb2FkICR7dGFyZ2V0RmlsZUlEfSB3YXMgcmVtb3ZlZGApXG4gICAgICB9KVxuXG4gICAgICB0aGlzLm9uUGF1c2UoZmlsZS5pZCwgKGlzUGF1c2VkKSA9PiB7XG4gICAgICAgIGlmIChpc1BhdXNlZCkge1xuICAgICAgICAgIC8vIFJlbW92ZSB0aGlzIGZpbGUgZnJvbSB0aGUgcXVldWUgc28gYW5vdGhlciBmaWxlIGNhbiBzdGFydCBpbiBpdHMgcGxhY2UuXG4gICAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgICAgdXBsb2FkLmFib3J0KClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBSZXN1bWluZyBhbiB1cGxvYWQgc2hvdWxkIGJlIHF1ZXVlZCwgZWxzZSB5b3UgY291bGQgcGF1c2UgYW5kIHRoZW4gcmVzdW1lIGEgcXVldWVkIHVwbG9hZCB0byBtYWtlIGl0IHNraXAgdGhlIHF1ZXVlLlxuICAgICAgICAgIHF1ZXVlZFJlcXVlc3QuYWJvcnQoKVxuICAgICAgICAgIHF1ZXVlZFJlcXVlc3QgPSB0aGlzLnJlcXVlc3RzLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICB1cGxvYWQuc3RhcnQoKVxuICAgICAgICAgICAgcmV0dXJuICgpID0+IHt9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgdGhpcy5vblBhdXNlQWxsKGZpbGUuaWQsICgpID0+IHtcbiAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgIHVwbG9hZC5hYm9ydCgpXG4gICAgICB9KVxuXG4gICAgICB0aGlzLm9uQ2FuY2VsQWxsKGZpbGUuaWQsICgpID0+IHtcbiAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgIHRoaXMucmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoZmlsZS5pZCwgeyBhYm9ydDogISF1cGxvYWQudXJsIH0pXG4gICAgICAgIHJlc29sdmUoYHVwbG9hZCAke2ZpbGUuaWR9IHdhcyBjYW5jZWxlZGApXG4gICAgICB9KVxuXG4gICAgICB0aGlzLm9uUmVzdW1lQWxsKGZpbGUuaWQsICgpID0+IHtcbiAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgIGlmIChmaWxlLmVycm9yKSB7XG4gICAgICAgICAgdXBsb2FkLmFib3J0KClcbiAgICAgICAgfVxuICAgICAgICBxdWV1ZWRSZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0cy5ydW4oKCkgPT4ge1xuICAgICAgICAgIHVwbG9hZC5zdGFydCgpXG4gICAgICAgICAgcmV0dXJuICgpID0+IHt9XG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtZXJyb3InLCBmaWxlLCBlcnIpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7VXBweUZpbGV9IGZpbGUgZm9yIHVzZSB3aXRoIHVwbG9hZFxuICAgKiBAcGFyYW0ge251bWJlcn0gY3VycmVudCBmaWxlIGluIGEgcXVldWVcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRvdGFsIG51bWJlciBvZiBmaWxlcyBpbiBhIHF1ZXVlXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgdXBsb2FkUmVtb3RlIChmaWxlLCBjdXJyZW50LCB0b3RhbCkge1xuICAgIHRoaXMucmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoZmlsZS5pZClcblxuICAgIGNvbnN0IG9wdHMgPSB7IC4uLnRoaXMub3B0cyB9XG4gICAgaWYgKGZpbGUudHVzKSB7XG4gICAgICAvLyBJbnN0YWxsIGZpbGUtc3BlY2lmaWMgdXBsb2FkIG92ZXJyaWRlcy5cbiAgICAgIE9iamVjdC5hc3NpZ24ob3B0cywgZmlsZS50dXMpXG4gICAgfVxuXG4gICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdGFydGVkJywgZmlsZSlcbiAgICB0aGlzLnVwcHkubG9nKGZpbGUucmVtb3RlLnVybClcblxuICAgIGlmIChmaWxlLnNlcnZlclRva2VuKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25uZWN0VG9TZXJ2ZXJTb2NrZXQoZmlsZSlcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgQ2xpZW50ID0gZmlsZS5yZW1vdGUucHJvdmlkZXJPcHRpb25zLnByb3ZpZGVyID8gUHJvdmlkZXIgOiBSZXF1ZXN0Q2xpZW50XG4gICAgICBjb25zdCBjbGllbnQgPSBuZXcgQ2xpZW50KHRoaXMudXBweSwgZmlsZS5yZW1vdGUucHJvdmlkZXJPcHRpb25zKVxuXG4gICAgICAvLyAhISBjYW5jZWxsYXRpb24gaXMgTk9UIHN1cHBvcnRlZCBhdCB0aGlzIHN0YWdlIHlldFxuICAgICAgY2xpZW50LnBvc3QoZmlsZS5yZW1vdGUudXJsLCB7XG4gICAgICAgIC4uLmZpbGUucmVtb3RlLmJvZHksXG4gICAgICAgIGVuZHBvaW50OiBvcHRzLmVuZHBvaW50LFxuICAgICAgICB1cGxvYWRVcmw6IG9wdHMudXBsb2FkVXJsLFxuICAgICAgICBwcm90b2NvbDogJ3R1cycsXG4gICAgICAgIHNpemU6IGZpbGUuZGF0YS5zaXplLFxuICAgICAgICBtZXRhZGF0YTogZmlsZS5tZXRhXG4gICAgICB9KS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgdGhpcy51cHB5LnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7IHNlcnZlclRva2VuOiByZXMudG9rZW4gfSlcbiAgICAgICAgZmlsZSA9IHRoaXMudXBweS5nZXRGaWxlKGZpbGUuaWQpXG4gICAgICAgIHJldHVybiB0aGlzLmNvbm5lY3RUb1NlcnZlclNvY2tldChmaWxlKVxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLWVycm9yJywgZmlsZSwgZXJyKVxuICAgICAgICByZWplY3QoZXJyKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFNlZSB0aGUgY29tbWVudCBvbiB0aGUgdXBsb2FkKCkgbWV0aG9kLlxuICAgKlxuICAgKiBBZGRpdGlvbmFsbHksIHdoZW4gYW4gdXBsb2FkIGlzIHJlbW92ZWQsIGNvbXBsZXRlZCwgb3IgY2FuY2VsbGVkLCB3ZSBuZWVkIHRvIGNsb3NlIHRoZSBXZWJTb2NrZXQgY29ubmVjdGlvbi4gVGhpcyBpcyBoYW5kbGVkIGJ5IHRoZSByZXNldFVwbG9hZGVyUmVmZXJlbmNlcygpIGZ1bmN0aW9uLCBzbyB0aGUgc2FtZSBndWlkZWxpbmVzIGFwcGx5IGFzIGluIHVwbG9hZCgpLlxuICAgKlxuICAgKiBAcGFyYW0ge1VwcHlGaWxlfSBmaWxlXG4gICAqL1xuICBjb25uZWN0VG9TZXJ2ZXJTb2NrZXQgKGZpbGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdG9rZW4gPSBmaWxlLnNlcnZlclRva2VuXG4gICAgICBjb25zdCBob3N0ID0gZ2V0U29ja2V0SG9zdChmaWxlLnJlbW90ZS5jb21wYW5pb25VcmwpXG4gICAgICBjb25zdCBzb2NrZXQgPSBuZXcgU29ja2V0KHsgdGFyZ2V0OiBgJHtob3N0fS9hcGkvJHt0b2tlbn1gLCBhdXRvT3BlbjogZmFsc2UgfSlcbiAgICAgIHRoaXMudXBsb2FkZXJTb2NrZXRzW2ZpbGUuaWRdID0gc29ja2V0XG4gICAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGUuaWRdID0gbmV3IEV2ZW50VHJhY2tlcih0aGlzLnVwcHkpXG5cbiAgICAgIHRoaXMub25GaWxlUmVtb3ZlKGZpbGUuaWQsICgpID0+IHtcbiAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgIC8vIHN0aWxsIHNlbmQgcGF1c2UgZXZlbnQgaW4gY2FzZSB3ZSBhcmUgZGVhbGluZyB3aXRoIG9sZGVyIHZlcnNpb24gb2YgY29tcGFuaW9uXG4gICAgICAgIC8vIEB0b2RvIGRvbid0IHNlbmQgcGF1c2UgZXZlbnQgaW4gdGhlIG5leHQgbWFqb3IgcmVsZWFzZS5cbiAgICAgICAgc29ja2V0LnNlbmQoJ3BhdXNlJywge30pXG4gICAgICAgIHNvY2tldC5zZW5kKCdjYW5jZWwnLCB7fSlcbiAgICAgICAgdGhpcy5yZXNldFVwbG9hZGVyUmVmZXJlbmNlcyhmaWxlLmlkKVxuICAgICAgICByZXNvbHZlKGB1cGxvYWQgJHtmaWxlLmlkfSB3YXMgcmVtb3ZlZGApXG4gICAgICB9KVxuXG4gICAgICB0aGlzLm9uUGF1c2UoZmlsZS5pZCwgKGlzUGF1c2VkKSA9PiB7XG4gICAgICAgIGlmIChpc1BhdXNlZCkge1xuICAgICAgICAgIC8vIFJlbW92ZSB0aGlzIGZpbGUgZnJvbSB0aGUgcXVldWUgc28gYW5vdGhlciBmaWxlIGNhbiBzdGFydCBpbiBpdHMgcGxhY2UuXG4gICAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgICAgc29ja2V0LnNlbmQoJ3BhdXNlJywge30pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUmVzdW1pbmcgYW4gdXBsb2FkIHNob3VsZCBiZSBxdWV1ZWQsIGVsc2UgeW91IGNvdWxkIHBhdXNlIGFuZCB0aGVuIHJlc3VtZSBhIHF1ZXVlZCB1cGxvYWQgdG8gbWFrZSBpdCBza2lwIHRoZSBxdWV1ZS5cbiAgICAgICAgICBxdWV1ZWRSZXF1ZXN0LmFib3J0KClcbiAgICAgICAgICBxdWV1ZWRSZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0cy5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgc29ja2V0LnNlbmQoJ3Jlc3VtZScsIHt9KVxuICAgICAgICAgICAgcmV0dXJuICgpID0+IHt9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgdGhpcy5vblBhdXNlQWxsKGZpbGUuaWQsICgpID0+IHtcbiAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgIHNvY2tldC5zZW5kKCdwYXVzZScsIHt9KVxuICAgICAgfSlcblxuICAgICAgdGhpcy5vbkNhbmNlbEFsbChmaWxlLmlkLCAoKSA9PiB7XG4gICAgICAgIHF1ZXVlZFJlcXVlc3QuYWJvcnQoKVxuICAgICAgICAvLyBzdGlsbCBzZW5kIHBhdXNlIGV2ZW50IGluIGNhc2Ugd2UgYXJlIGRlYWxpbmcgd2l0aCBvbGRlciB2ZXJzaW9uIG9mIGNvbXBhbmlvblxuICAgICAgICAvLyBAdG9kbyBkb24ndCBzZW5kIHBhdXNlIGV2ZW50IGluIHRoZSBuZXh0IG1ham9yIHJlbGVhc2UuXG4gICAgICAgIHNvY2tldC5zZW5kKCdwYXVzZScsIHt9KVxuICAgICAgICBzb2NrZXQuc2VuZCgnY2FuY2VsJywge30pXG4gICAgICAgIHRoaXMucmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoZmlsZS5pZClcbiAgICAgICAgcmVzb2x2ZShgdXBsb2FkICR7ZmlsZS5pZH0gd2FzIGNhbmNlbGVkYClcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMub25SZXN1bWVBbGwoZmlsZS5pZCwgKCkgPT4ge1xuICAgICAgICBxdWV1ZWRSZXF1ZXN0LmFib3J0KClcbiAgICAgICAgaWYgKGZpbGUuZXJyb3IpIHtcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncGF1c2UnLCB7fSlcbiAgICAgICAgfVxuICAgICAgICBxdWV1ZWRSZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0cy5ydW4oKCkgPT4ge1xuICAgICAgICAgIHNvY2tldC5zZW5kKCdyZXN1bWUnLCB7fSlcbiAgICAgICAgICByZXR1cm4gKCkgPT4ge31cbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMub25SZXRyeShmaWxlLmlkLCAoKSA9PiB7XG4gICAgICAgIC8vIE9ubHkgZG8gdGhlIHJldHJ5IGlmIHRoZSB1cGxvYWQgaXMgYWN0dWFsbHkgaW4gcHJvZ3Jlc3M7XG4gICAgICAgIC8vIGVsc2Ugd2UgY291bGQgdHJ5IHRvIHNlbmQgdGhlc2UgbWVzc2FnZXMgd2hlbiB0aGUgdXBsb2FkIGlzIHN0aWxsIHF1ZXVlZC5cbiAgICAgICAgLy8gV2UgbWF5IG5lZWQgYSBiZXR0ZXIgY2hlY2sgZm9yIHRoaXMgc2luY2UgdGhlIHNvY2tldCBtYXkgYWxzbyBiZSBjbG9zZWRcbiAgICAgICAgLy8gZm9yIG90aGVyIHJlYXNvbnMsIGxpa2UgbmV0d29yayBmYWlsdXJlcy5cbiAgICAgICAgaWYgKHNvY2tldC5pc09wZW4pIHtcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncGF1c2UnLCB7fSlcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncmVzdW1lJywge30pXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHRoaXMub25SZXRyeUFsbChmaWxlLmlkLCAoKSA9PiB7XG4gICAgICAgIC8vIFNlZSB0aGUgY29tbWVudCBpbiB0aGUgb25SZXRyeSgpIGNhbGxcbiAgICAgICAgaWYgKHNvY2tldC5pc09wZW4pIHtcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncGF1c2UnLCB7fSlcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncmVzdW1lJywge30pXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHNvY2tldC5vbigncHJvZ3Jlc3MnLCAocHJvZ3Jlc3NEYXRhKSA9PiBlbWl0U29ja2V0UHJvZ3Jlc3ModGhpcywgcHJvZ3Jlc3NEYXRhLCBmaWxlKSlcblxuICAgICAgc29ja2V0Lm9uKCdlcnJvcicsIChlcnJEYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbWVzc2FnZSB9ID0gZXJyRGF0YS5lcnJvclxuICAgICAgICBjb25zdCBlcnJvciA9IE9iamVjdC5hc3NpZ24obmV3IEVycm9yKG1lc3NhZ2UpLCB7IGNhdXNlOiBlcnJEYXRhLmVycm9yIH0pXG5cbiAgICAgICAgLy8gSWYgdGhlIHJlbW90ZSByZXRyeSBvcHRpbWlzYXRpb24gc2hvdWxkIG5vdCBiZSB1c2VkLFxuICAgICAgICAvLyBjbG9zZSB0aGUgc29ja2V04oCUdGhpcyB3aWxsIHRlbGwgY29tcGFuaW9uIHRvIGNsZWFyIHN0YXRlIGFuZCBkZWxldGUgdGhlIGZpbGUuXG4gICAgICAgIGlmICghdGhpcy5vcHRzLnVzZUZhc3RSZW1vdGVSZXRyeSkge1xuICAgICAgICAgIHRoaXMucmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoZmlsZS5pZClcbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIHNlcnZlclRva2VuIHNvIHRoYXQgYSBuZXcgb25lIHdpbGwgYmUgY3JlYXRlZCBmb3IgdGhlIHJldHJ5LlxuICAgICAgICAgIHRoaXMudXBweS5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgICAgICAgc2VydmVyVG9rZW46IG51bGxcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNvY2tldC5jbG9zZSgpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLWVycm9yJywgZmlsZSwgZXJyb3IpXG4gICAgICAgIHF1ZXVlZFJlcXVlc3QuZG9uZSgpXG4gICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgIH0pXG5cbiAgICAgIHNvY2tldC5vbignc3VjY2VzcycsIChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHVwbG9hZFJlc3AgPSB7XG4gICAgICAgICAgdXBsb2FkVVJMOiBkYXRhLnVybFxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdWNjZXNzJywgZmlsZSwgdXBsb2FkUmVzcClcbiAgICAgICAgdGhpcy5yZXNldFVwbG9hZGVyUmVmZXJlbmNlcyhmaWxlLmlkKVxuICAgICAgICBxdWV1ZWRSZXF1ZXN0LmRvbmUoKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pXG5cbiAgICAgIGxldCBxdWV1ZWRSZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0cy5ydW4oKCkgPT4ge1xuICAgICAgICBzb2NrZXQub3BlbigpXG4gICAgICAgIGlmIChmaWxlLmlzUGF1c2VkKSB7XG4gICAgICAgICAgc29ja2V0LnNlbmQoJ3BhdXNlJywge30pXG4gICAgICAgIH1cblxuICAgICAgICAvLyBEb24ndCBkbyBhbnl0aGluZyBoZXJlLCB0aGUgY2FsbGVyIHdpbGwgdGFrZSBjYXJlIG9mIGNhbmNlbGxpbmcgdGhlIHVwbG9hZCBpdHNlbGZcbiAgICAgICAgLy8gdXNpbmcgcmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoKS4gVGhpcyBpcyBiZWNhdXNlIHJlc2V0VXBsb2FkZXJSZWZlcmVuY2VzKCkgaGFzIHRvIGJlXG4gICAgICAgIC8vIGNhbGxlZCB3aGVuIHRoaXMgcmVxdWVzdCBpcyBzdGlsbCBpbiB0aGUgcXVldWUsIGFuZCBoYXMgbm90IGJlZW4gc3RhcnRlZCB5ZXQsIHRvby4gQXRcbiAgICAgICAgLy8gdGhhdCBwb2ludCB0aGlzIGNhbmNlbGxhdGlvbiBmdW5jdGlvbiBpcyBub3QgZ29pbmcgdG8gYmUgY2FsbGVkLlxuICAgICAgICAvLyBBbHNvLCB3ZSBuZWVkIHRvIHJlbW92ZSB0aGUgcmVxdWVzdCBmcm9tIHRoZSBxdWV1ZSBfd2l0aG91dF8gZGVzdHJveWluZyBldmVyeXRoaW5nXG4gICAgICAgIC8vIHJlbGF0ZWQgdG8gdGhpcyB1cGxvYWQgdG8gaGFuZGxlIHBhdXNlcy5cbiAgICAgICAgcmV0dXJuICgpID0+IHt9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU3RvcmUgdGhlIHVwbG9hZFVybCBvbiB0aGUgZmlsZSBvcHRpb25zLCBzbyB0aGF0IHdoZW4gR29sZGVuIFJldHJpZXZlclxuICAgKiByZXN0b3JlcyBzdGF0ZSwgd2Ugd2lsbCBjb250aW51ZSB1cGxvYWRpbmcgdG8gdGhlIGNvcnJlY3QgVVJMLlxuICAgKlxuICAgKiBAcGFyYW0ge1VwcHlGaWxlfSBmaWxlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cGxvYWRVUkxcbiAgICovXG4gIG9uUmVjZWl2ZVVwbG9hZFVybCAoZmlsZSwgdXBsb2FkVVJMKSB7XG4gICAgY29uc3QgY3VycmVudEZpbGUgPSB0aGlzLnVwcHkuZ2V0RmlsZShmaWxlLmlkKVxuICAgIGlmICghY3VycmVudEZpbGUpIHJldHVyblxuICAgIC8vIE9ubHkgZG8gdGhlIHVwZGF0ZSBpZiB3ZSBkaWRuJ3QgaGF2ZSBhbiB1cGxvYWQgVVJMIHlldC5cbiAgICBpZiAoIWN1cnJlbnRGaWxlLnR1cyB8fCBjdXJyZW50RmlsZS50dXMudXBsb2FkVXJsICE9PSB1cGxvYWRVUkwpIHtcbiAgICAgIHRoaXMudXBweS5sb2coJ1tUdXNdIFN0b3JpbmcgdXBsb2FkIHVybCcpXG4gICAgICB0aGlzLnVwcHkuc2V0RmlsZVN0YXRlKGN1cnJlbnRGaWxlLmlkLCB7XG4gICAgICAgIHR1czogT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudEZpbGUudHVzLCB7XG4gICAgICAgICAgdXBsb2FkVXJsOiB1cGxvYWRVUkxcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSURcbiAgICogQHBhcmFtIHtmdW5jdGlvbihzdHJpbmcpOiB2b2lkfSBjYlxuICAgKi9cbiAgb25GaWxlUmVtb3ZlIChmaWxlSUQsIGNiKSB7XG4gICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlSURdLm9uKCdmaWxlLXJlbW92ZWQnLCAoZmlsZSkgPT4ge1xuICAgICAgaWYgKGZpbGVJRCA9PT0gZmlsZS5pZCkgY2IoZmlsZS5pZClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSURcbiAgICogQHBhcmFtIHtmdW5jdGlvbihib29sZWFuKTogdm9pZH0gY2JcbiAgICovXG4gIG9uUGF1c2UgKGZpbGVJRCwgY2IpIHtcbiAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGVJRF0ub24oJ3VwbG9hZC1wYXVzZScsICh0YXJnZXRGaWxlSUQsIGlzUGF1c2VkKSA9PiB7XG4gICAgICBpZiAoZmlsZUlEID09PSB0YXJnZXRGaWxlSUQpIHtcbiAgICAgICAgLy8gY29uc3QgaXNQYXVzZWQgPSB0aGlzLnVwcHkucGF1c2VSZXN1bWUoZmlsZUlEKVxuICAgICAgICBjYihpc1BhdXNlZClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSURcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOiB2b2lkfSBjYlxuICAgKi9cbiAgb25SZXRyeSAoZmlsZUlELCBjYikge1xuICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXS5vbigndXBsb2FkLXJldHJ5JywgKHRhcmdldEZpbGVJRCkgPT4ge1xuICAgICAgaWYgKGZpbGVJRCA9PT0gdGFyZ2V0RmlsZUlEKSB7XG4gICAgICAgIGNiKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSURcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOiB2b2lkfSBjYlxuICAgKi9cbiAgb25SZXRyeUFsbCAoZmlsZUlELCBjYikge1xuICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXS5vbigncmV0cnktYWxsJywgKGZpbGVzVG9SZXRyeSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnVwcHkuZ2V0RmlsZShmaWxlSUQpKSByZXR1cm5cbiAgICAgIGNiKClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSURcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOiB2b2lkfSBjYlxuICAgKi9cbiAgb25QYXVzZUFsbCAoZmlsZUlELCBjYikge1xuICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXS5vbigncGF1c2UtYWxsJywgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnVwcHkuZ2V0RmlsZShmaWxlSUQpKSByZXR1cm5cbiAgICAgIGNiKClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSURcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOiB2b2lkfSBjYlxuICAgKi9cbiAgb25DYW5jZWxBbGwgKGZpbGVJRCwgY2IpIHtcbiAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGVJRF0ub24oJ2NhbmNlbC1hbGwnLCAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMudXBweS5nZXRGaWxlKGZpbGVJRCkpIHJldHVyblxuICAgICAgY2IoKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVJRFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk6IHZvaWR9IGNiXG4gICAqL1xuICBvblJlc3VtZUFsbCAoZmlsZUlELCBjYikge1xuICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXS5vbigncmVzdW1lLWFsbCcsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy51cHB5LmdldEZpbGUoZmlsZUlEKSkgcmV0dXJuXG4gICAgICBjYigpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyhVcHB5RmlsZSB8IEZhaWxlZFVwcHlGaWxlKVtdfSBmaWxlc1xuICAgKi9cbiAgdXBsb2FkRmlsZXMgKGZpbGVzKSB7XG4gICAgY29uc3QgcHJvbWlzZXMgPSBmaWxlcy5tYXAoKGZpbGUsIGkpID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBpICsgMVxuICAgICAgY29uc3QgdG90YWwgPSBmaWxlcy5sZW5ndGhcblxuICAgICAgaWYgKCdlcnJvcicgaW4gZmlsZSAmJiBmaWxlLmVycm9yKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoZmlsZS5lcnJvcikpXG4gICAgICB9IGVsc2UgaWYgKGZpbGUuaXNSZW1vdGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBsb2FkUmVtb3RlKGZpbGUsIGN1cnJlbnQsIHRvdGFsKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBsb2FkKGZpbGUsIGN1cnJlbnQsIHRvdGFsKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gc2V0dGxlKHByb21pc2VzKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IGZpbGVJRHNcbiAgICovXG4gIGhhbmRsZVVwbG9hZCAoZmlsZUlEcykge1xuICAgIGlmIChmaWxlSURzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy51cHB5LmxvZygnW1R1c10gTm8gZmlsZXMgdG8gdXBsb2FkJylcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdHMubGltaXQgPT09IDApIHtcbiAgICAgIHRoaXMudXBweS5sb2coXG4gICAgICAgICdbVHVzXSBXaGVuIHVwbG9hZGluZyBtdWx0aXBsZSBmaWxlcyBhdCBvbmNlLCBjb25zaWRlciBzZXR0aW5nIHRoZSBgbGltaXRgIG9wdGlvbiAodG8gYDEwYCBmb3IgZXhhbXBsZSksIHRvIGxpbWl0IHRoZSBudW1iZXIgb2YgY29uY3VycmVudCB1cGxvYWRzLCB3aGljaCBoZWxwcyBwcmV2ZW50IG1lbW9yeSBhbmQgbmV0d29yayBpc3N1ZXM6IGh0dHBzOi8vdXBweS5pby9kb2NzL3R1cy8jbGltaXQtMCcsXG4gICAgICAgICd3YXJuaW5nJ1xuICAgICAgKVxuICAgIH1cblxuICAgIHRoaXMudXBweS5sb2coJ1tUdXNdIFVwbG9hZGluZy4uLicpXG4gICAgY29uc3QgZmlsZXNUb1VwbG9hZCA9IGZpbGVJRHMubWFwKChmaWxlSUQpID0+IHRoaXMudXBweS5nZXRGaWxlKGZpbGVJRCkpXG5cbiAgICByZXR1cm4gdGhpcy51cGxvYWRGaWxlcyhmaWxlc1RvVXBsb2FkKVxuICAgICAgLnRoZW4oKCkgPT4gbnVsbClcbiAgfVxuXG4gIGluc3RhbGwgKCkge1xuICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICBjYXBhYmlsaXRpZXM6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMudXBweS5nZXRTdGF0ZSgpLmNhcGFiaWxpdGllcywge1xuICAgICAgICByZXN1bWFibGVVcGxvYWRzOiB0cnVlXG4gICAgICB9KVxuICAgIH0pXG4gICAgdGhpcy51cHB5LmFkZFVwbG9hZGVyKHRoaXMuaGFuZGxlVXBsb2FkKVxuXG4gICAgdGhpcy51cHB5Lm9uKCdyZXNldC1wcm9ncmVzcycsIHRoaXMuaGFuZGxlUmVzZXRQcm9ncmVzcylcblxuICAgIGlmICh0aGlzLm9wdHMuYXV0b1JldHJ5KSB7XG4gICAgICB0aGlzLnVwcHkub24oJ2JhY2stb25saW5lJywgdGhpcy51cHB5LnJldHJ5QWxsKVxuICAgIH1cbiAgfVxuXG4gIHVuaW5zdGFsbCAoKSB7XG4gICAgdGhpcy51cHB5LnNldFN0YXRlKHtcbiAgICAgIGNhcGFiaWxpdGllczogT2JqZWN0LmFzc2lnbih7fSwgdGhpcy51cHB5LmdldFN0YXRlKCkuY2FwYWJpbGl0aWVzLCB7XG4gICAgICAgIHJlc3VtYWJsZVVwbG9hZHM6IGZhbHNlXG4gICAgICB9KVxuICAgIH0pXG4gICAgdGhpcy51cHB5LnJlbW92ZVVwbG9hZGVyKHRoaXMuaGFuZGxlVXBsb2FkKVxuXG4gICAgaWYgKHRoaXMub3B0cy5hdXRvUmV0cnkpIHtcbiAgICAgIHRoaXMudXBweS5vZmYoJ2JhY2stb25saW5lJywgdGhpcy51cHB5LnJldHJ5QWxsKVxuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBDcmVhdGUgYSB3cmFwcGVyIGFyb3VuZCBhbiBldmVudCBlbWl0dGVyIHdpdGggYSBgcmVtb3ZlYCBtZXRob2QgdG8gcmVtb3ZlXG4gKiBhbGwgZXZlbnRzIHRoYXQgd2VyZSBhZGRlZCB1c2luZyB0aGUgd3JhcHBlZCBlbWl0dGVyLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEV2ZW50VHJhY2tlciB7XG4gIGNvbnN0cnVjdG9yIChlbWl0dGVyKSB7XG4gICAgdGhpcy5fZXZlbnRzID0gW11cbiAgICB0aGlzLl9lbWl0dGVyID0gZW1pdHRlclxuICB9XG5cbiAgb24gKGV2ZW50LCBmbikge1xuICAgIHRoaXMuX2V2ZW50cy5wdXNoKFtldmVudCwgZm5dKVxuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKGV2ZW50LCBmbilcbiAgfVxuXG4gIHJlbW92ZSAoKSB7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKFtldmVudCwgZm5dKSA9PiB7XG4gICAgICB0aGlzLl9lbWl0dGVyLm9mZihldmVudCwgZm4pXG4gICAgfSlcbiAgfVxufVxuIiwiY2xhc3MgTmV0d29ya0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvciAoZXJyb3IsIHhociA9IG51bGwpIHtcbiAgICBzdXBlcihgVGhpcyBsb29rcyBsaWtlIGEgbmV0d29yayBlcnJvciwgdGhlIGVuZHBvaW50IG1pZ2h0IGJlIGJsb2NrZWQgYnkgYW4gaW50ZXJuZXQgcHJvdmlkZXIgb3IgYSBmaXJld2FsbC5cXG5cXG5Tb3VyY2UgZXJyb3I6IFske2Vycm9yfV1gKVxuXG4gICAgdGhpcy5pc05ldHdvcmtFcnJvciA9IHRydWVcbiAgICB0aGlzLnJlcXVlc3QgPSB4aHJcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5ldHdvcmtFcnJvclxuIiwiLyoqXG4gKiBBcnJheS5wcm90b3R5cGUuZmluZEluZGV4IHBvbnlmaWxsIGZvciBvbGQgYnJvd3NlcnMuXG4gKi9cbmZ1bmN0aW9uIGZpbmRJbmRleCAoYXJyYXksIHByZWRpY2F0ZSkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHByZWRpY2F0ZShhcnJheVtpXSkpIHJldHVybiBpXG4gIH1cbiAgcmV0dXJuIC0xXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNhbmNlbEVycm9yICgpIHtcbiAgcmV0dXJuIG5ldyBFcnJvcignQ2FuY2VsbGVkJylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSYXRlTGltaXRlZFF1ZXVlIHtcbiAgY29uc3RydWN0b3IgKGxpbWl0KSB7XG4gICAgaWYgKHR5cGVvZiBsaW1pdCAhPT0gJ251bWJlcicgfHwgbGltaXQgPT09IDApIHtcbiAgICAgIHRoaXMubGltaXQgPSBJbmZpbml0eVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpbWl0ID0gbGltaXRcbiAgICB9XG5cbiAgICB0aGlzLmFjdGl2ZVJlcXVlc3RzID0gMFxuICAgIHRoaXMucXVldWVkSGFuZGxlcnMgPSBbXVxuICB9XG5cbiAgX2NhbGwgKGZuKSB7XG4gICAgdGhpcy5hY3RpdmVSZXF1ZXN0cyArPSAxXG5cbiAgICBsZXQgZG9uZSA9IGZhbHNlXG5cbiAgICBsZXQgY2FuY2VsQWN0aXZlXG4gICAgdHJ5IHtcbiAgICAgIGNhbmNlbEFjdGl2ZSA9IGZuKClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuYWN0aXZlUmVxdWVzdHMgLT0gMVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFib3J0OiAoKSA9PiB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm5cbiAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgdGhpcy5hY3RpdmVSZXF1ZXN0cyAtPSAxXG4gICAgICAgIGNhbmNlbEFjdGl2ZSgpXG4gICAgICAgIHRoaXMuX3F1ZXVlTmV4dCgpXG4gICAgICB9LFxuXG4gICAgICBkb25lOiAoKSA9PiB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm5cbiAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgdGhpcy5hY3RpdmVSZXF1ZXN0cyAtPSAxXG4gICAgICAgIHRoaXMuX3F1ZXVlTmV4dCgpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3F1ZXVlTmV4dCAoKSB7XG4gICAgLy8gRG8gaXQgc29vbiBidXQgbm90IGltbWVkaWF0ZWx5LCB0aGlzIGFsbG93cyBjbGVhcmluZyBvdXQgdGhlIGVudGlyZSBxdWV1ZSBzeW5jaHJvbm91c2x5XG4gICAgLy8gb25lIGJ5IG9uZSB3aXRob3V0IGNvbnRpbnVvdXNseSBfYWR2YW5jaW5nXyBpdCAoYW5kIHN0YXJ0aW5nIG5ldyB0YXNrcyBiZWZvcmUgaW1tZWRpYXRlbHlcbiAgICAvLyBhYm9ydGluZyB0aGVtKVxuICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5fbmV4dCgpXG4gICAgfSlcbiAgfVxuXG4gIF9uZXh0ICgpIHtcbiAgICBpZiAodGhpcy5hY3RpdmVSZXF1ZXN0cyA+PSB0aGlzLmxpbWl0KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHRoaXMucXVldWVkSGFuZGxlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgbmV4dCByZXF1ZXN0LCBhbmQgdXBkYXRlIHRoZSBhYm9ydC9kb25lIGhhbmRsZXJzXG4gICAgLy8gc28gdGhhdCBjYW5jZWxsaW5nIGl0IGRvZXMgdGhlIFJpZ2h0IFRoaW5nIChhbmQgZG9lc24ndCBqdXN0IHRyeVxuICAgIC8vIHRvIGRlcXVldWUgYW4gYWxyZWFkeS1ydW5uaW5nIHJlcXVlc3QpLlxuICAgIGNvbnN0IG5leHQgPSB0aGlzLnF1ZXVlZEhhbmRsZXJzLnNoaWZ0KClcbiAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fY2FsbChuZXh0LmZuKVxuICAgIG5leHQuYWJvcnQgPSBoYW5kbGVyLmFib3J0XG4gICAgbmV4dC5kb25lID0gaGFuZGxlci5kb25lXG4gIH1cblxuICBfcXVldWUgKGZuLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBoYW5kbGVyID0ge1xuICAgICAgZm4sXG4gICAgICBwcmlvcml0eTogb3B0aW9ucy5wcmlvcml0eSB8fCAwLFxuICAgICAgYWJvcnQ6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZGVxdWV1ZShoYW5kbGVyKVxuICAgICAgfSxcbiAgICAgIGRvbmU6ICgpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgbWFyayBhIHF1ZXVlZCByZXF1ZXN0IGFzIGRvbmU6IHRoaXMgaW5kaWNhdGVzIGEgYnVnJylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IGZpbmRJbmRleCh0aGlzLnF1ZXVlZEhhbmRsZXJzLCAob3RoZXIpID0+IHtcbiAgICAgIHJldHVybiBoYW5kbGVyLnByaW9yaXR5ID4gb3RoZXIucHJpb3JpdHlcbiAgICB9KVxuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgIHRoaXMucXVldWVkSGFuZGxlcnMucHVzaChoYW5kbGVyKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnF1ZXVlZEhhbmRsZXJzLnNwbGljZShpbmRleCwgMCwgaGFuZGxlcilcbiAgICB9XG4gICAgcmV0dXJuIGhhbmRsZXJcbiAgfVxuXG4gIF9kZXF1ZXVlIChoYW5kbGVyKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnF1ZXVlZEhhbmRsZXJzLmluZGV4T2YoaGFuZGxlcilcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLnF1ZXVlZEhhbmRsZXJzLnNwbGljZShpbmRleCwgMSlcbiAgICB9XG4gIH1cblxuICBydW4gKGZuLCBxdWV1ZU9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy5hY3RpdmVSZXF1ZXN0cyA8IHRoaXMubGltaXQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWxsKGZuKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcXVldWUoZm4sIHF1ZXVlT3B0aW9ucylcbiAgfVxuXG4gIHdyYXBQcm9taXNlRnVuY3Rpb24gKGZuLCBxdWV1ZU9wdGlvbnMpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgIGxldCBxdWV1ZWRSZXF1ZXN0XG4gICAgICBjb25zdCBvdXRlclByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHF1ZXVlZFJlcXVlc3QgPSB0aGlzLnJ1bigoKSA9PiB7XG4gICAgICAgICAgbGV0IGNhbmNlbEVycm9yXG4gICAgICAgICAgbGV0IGlubmVyUHJvbWlzZVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpbm5lclByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoZm4oLi4uYXJncykpXG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBpbm5lclByb21pc2UgPSBQcm9taXNlLnJlamVjdChlcnIpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaW5uZXJQcm9taXNlLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKGNhbmNlbEVycm9yKSB7XG4gICAgICAgICAgICAgIHJlamVjdChjYW5jZWxFcnJvcilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHF1ZXVlZFJlcXVlc3QuZG9uZSgpXG4gICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChjYW5jZWxFcnJvcikge1xuICAgICAgICAgICAgICByZWplY3QoY2FuY2VsRXJyb3IpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBxdWV1ZWRSZXF1ZXN0LmRvbmUoKVxuICAgICAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2FuY2VsRXJyb3IgPSBjcmVhdGVDYW5jZWxFcnJvcigpXG4gICAgICAgICAgfVxuICAgICAgICB9LCBxdWV1ZU9wdGlvbnMpXG4gICAgICB9KVxuXG4gICAgICBvdXRlclByb21pc2UuYWJvcnQgPSAoKSA9PiB7XG4gICAgICAgIHF1ZXVlZFJlcXVlc3QuYWJvcnQoKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0ZXJQcm9taXNlXG4gICAgfVxuICB9XG59XG4iLCJjb25zdCBoYXMgPSByZXF1aXJlKCcuL2hhc1Byb3BlcnR5JylcblxuLyoqXG4gKiBUcmFuc2xhdGVzIHN0cmluZ3Mgd2l0aCBpbnRlcnBvbGF0aW9uICYgcGx1cmFsaXphdGlvbiBzdXBwb3J0LlxuICogRXh0ZW5zaWJsZSB3aXRoIGN1c3RvbSBkaWN0aW9uYXJpZXMgYW5kIHBsdXJhbGl6YXRpb24gZnVuY3Rpb25zLlxuICpcbiAqIEJvcnJvd3MgaGVhdmlseSBmcm9tIGFuZCBpbnNwaXJlZCBieSBQb2x5Z2xvdCBodHRwczovL2dpdGh1Yi5jb20vYWlyYm5iL3BvbHlnbG90LmpzLFxuICogYmFzaWNhbGx5IGEgc3RyaXBwZWQtZG93biB2ZXJzaW9uIG9mIGl0LiBEaWZmZXJlbmNlczogcGx1cmFsaXphdGlvbiBmdW5jdGlvbnMgYXJlIG5vdCBoYXJkY29kZWRcbiAqIGFuZCBjYW4gYmUgZWFzaWx5IGFkZGVkIGFtb25nIHdpdGggZGljdGlvbmFyaWVzLCBuZXN0ZWQgb2JqZWN0cyBhcmUgdXNlZCBmb3IgcGx1cmFsaXphdGlvblxuICogYXMgb3Bwb3NlZCB0byBgfHx8fGAgZGVsaW1ldGVyXG4gKlxuICogVXNhZ2UgZXhhbXBsZTogYHRyYW5zbGF0b3IudHJhbnNsYXRlKCdmaWxlc19jaG9zZW4nLCB7c21hcnRfY291bnQ6IDN9KWBcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUcmFuc2xhdG9yIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7b2JqZWN0fEFycmF5PG9iamVjdD59IGxvY2FsZXMgLSBsb2NhbGUgb3IgbGlzdCBvZiBsb2NhbGVzLlxuICAgKi9cbiAgY29uc3RydWN0b3IgKGxvY2FsZXMpIHtcbiAgICB0aGlzLmxvY2FsZSA9IHtcbiAgICAgIHN0cmluZ3M6IHt9LFxuICAgICAgcGx1cmFsaXplOiBmdW5jdGlvbiAobikge1xuICAgICAgICBpZiAobiA9PT0gMSkge1xuICAgICAgICAgIHJldHVybiAwXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShsb2NhbGVzKSkge1xuICAgICAgbG9jYWxlcy5mb3JFYWNoKChsb2NhbGUpID0+IHRoaXMuX2FwcGx5KGxvY2FsZSkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2FwcGx5KGxvY2FsZXMpXG4gICAgfVxuICB9XG5cbiAgX2FwcGx5IChsb2NhbGUpIHtcbiAgICBpZiAoIWxvY2FsZSB8fCAhbG9jYWxlLnN0cmluZ3MpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHByZXZMb2NhbGUgPSB0aGlzLmxvY2FsZVxuICAgIHRoaXMubG9jYWxlID0gT2JqZWN0LmFzc2lnbih7fSwgcHJldkxvY2FsZSwge1xuICAgICAgc3RyaW5nczogT2JqZWN0LmFzc2lnbih7fSwgcHJldkxvY2FsZS5zdHJpbmdzLCBsb2NhbGUuc3RyaW5ncylcbiAgICB9KVxuICAgIHRoaXMubG9jYWxlLnBsdXJhbGl6ZSA9IGxvY2FsZS5wbHVyYWxpemUgfHwgcHJldkxvY2FsZS5wbHVyYWxpemVcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIHN0cmluZyB3aXRoIHBsYWNlaG9sZGVyIHZhcmlhYmxlcyBsaWtlIGAle3NtYXJ0X2NvdW50fSBmaWxlIHNlbGVjdGVkYFxuICAgKiBhbmQgcmVwbGFjZXMgaXQgd2l0aCB2YWx1ZXMgZnJvbSBvcHRpb25zIGB7c21hcnRfY291bnQ6IDV9YFxuICAgKlxuICAgKiBAbGljZW5zZSBodHRwczovL2dpdGh1Yi5jb20vYWlyYm5iL3BvbHlnbG90LmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAgICogdGFrZW4gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYWlyYm5iL3BvbHlnbG90LmpzL2Jsb2IvbWFzdGVyL2xpYi9wb2x5Z2xvdC5qcyNMMjk5XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwaHJhc2UgdGhhdCBuZWVkcyBpbnRlcnBvbGF0aW9uLCB3aXRoIHBsYWNlaG9sZGVyc1xuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB3aXRoIHZhbHVlcyB0aGF0IHdpbGwgYmUgdXNlZCB0byByZXBsYWNlIHBsYWNlaG9sZGVyc1xuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBpbnRlcnBvbGF0ZWRcbiAgICovXG4gIGludGVycG9sYXRlIChwaHJhc2UsIG9wdGlvbnMpIHtcbiAgICBjb25zdCB7IHNwbGl0LCByZXBsYWNlIH0gPSBTdHJpbmcucHJvdG90eXBlXG4gICAgY29uc3QgZG9sbGFyUmVnZXggPSAvXFwkL2dcbiAgICBjb25zdCBkb2xsYXJCaWxsc1lhbGwgPSAnJCQkJCdcbiAgICBsZXQgaW50ZXJwb2xhdGVkID0gW3BocmFzZV1cblxuICAgIGZvciAoY29uc3QgYXJnIGluIG9wdGlvbnMpIHtcbiAgICAgIGlmIChhcmcgIT09ICdfJyAmJiBoYXMob3B0aW9ucywgYXJnKSkge1xuICAgICAgICAvLyBFbnN1cmUgcmVwbGFjZW1lbnQgdmFsdWUgaXMgZXNjYXBlZCB0byBwcmV2ZW50IHNwZWNpYWwgJC1wcmVmaXhlZFxuICAgICAgICAvLyByZWdleCByZXBsYWNlIHRva2Vucy4gdGhlIFwiJCQkJFwiIGlzIG5lZWRlZCBiZWNhdXNlIGVhY2ggXCIkXCIgbmVlZHMgdG9cbiAgICAgICAgLy8gYmUgZXNjYXBlZCB3aXRoIFwiJFwiIGl0c2VsZiwgYW5kIHdlIG5lZWQgdHdvIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0LlxuICAgICAgICB2YXIgcmVwbGFjZW1lbnQgPSBvcHRpb25zW2FyZ11cbiAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICByZXBsYWNlbWVudCA9IHJlcGxhY2UuY2FsbChvcHRpb25zW2FyZ10sIGRvbGxhclJlZ2V4LCBkb2xsYXJCaWxsc1lhbGwpXG4gICAgICAgIH1cbiAgICAgICAgLy8gV2UgY3JlYXRlIGEgbmV3IGBSZWdFeHBgIGVhY2ggdGltZSBpbnN0ZWFkIG9mIHVzaW5nIGEgbW9yZS1lZmZpY2llbnRcbiAgICAgICAgLy8gc3RyaW5nIHJlcGxhY2Ugc28gdGhhdCB0aGUgc2FtZSBhcmd1bWVudCBjYW4gYmUgcmVwbGFjZWQgbXVsdGlwbGUgdGltZXNcbiAgICAgICAgLy8gaW4gdGhlIHNhbWUgcGhyYXNlLlxuICAgICAgICBpbnRlcnBvbGF0ZWQgPSBpbnNlcnRSZXBsYWNlbWVudChpbnRlcnBvbGF0ZWQsIG5ldyBSZWdFeHAoJyVcXFxceycgKyBhcmcgKyAnXFxcXH0nLCAnZycpLCByZXBsYWNlbWVudClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW50ZXJwb2xhdGVkXG5cbiAgICBmdW5jdGlvbiBpbnNlcnRSZXBsYWNlbWVudCAoc291cmNlLCByeCwgcmVwbGFjZW1lbnQpIHtcbiAgICAgIGNvbnN0IG5ld1BhcnRzID0gW11cbiAgICAgIHNvdXJjZS5mb3JFYWNoKChjaHVuaykgPT4ge1xuICAgICAgICAvLyBXaGVuIHRoZSBzb3VyY2UgY29udGFpbnMgbXVsdGlwbGUgcGxhY2Vob2xkZXJzIGZvciBpbnRlcnBvbGF0aW9uLFxuICAgICAgICAvLyB3ZSBzaG91bGQgaWdub3JlIGNodW5rcyB0aGF0IGFyZSBub3Qgc3RyaW5ncywgYmVjYXVzZSB0aG9zZVxuICAgICAgICAvLyBjYW4gYmUgSlNYIG9iamVjdHMgYW5kIHdpbGwgYmUgb3RoZXJ3aXNlIGluY29ycmVjdGx5IHR1cm5lZCBpbnRvIHN0cmluZ3MuXG4gICAgICAgIC8vIFdpdGhvdXQgdGhpcyBjb25kaXRpb24gd2XigJlkIGdldCB0aGlzOiBbb2JqZWN0IE9iamVjdF0gaGVsbG8gW29iamVjdCBPYmplY3RdIG15IDxidXR0b24+XG4gICAgICAgIGlmICh0eXBlb2YgY2h1bmsgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmV0dXJuIG5ld1BhcnRzLnB1c2goY2h1bmspXG4gICAgICAgIH1cblxuICAgICAgICBzcGxpdC5jYWxsKGNodW5rLCByeCkuZm9yRWFjaCgocmF3LCBpLCBsaXN0KSA9PiB7XG4gICAgICAgICAgaWYgKHJhdyAhPT0gJycpIHtcbiAgICAgICAgICAgIG5ld1BhcnRzLnB1c2gocmF3KVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEludGVybGFjZSB3aXRoIHRoZSBgcmVwbGFjZW1lbnRgIHZhbHVlXG4gICAgICAgICAgaWYgKGkgPCBsaXN0Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIG5ld1BhcnRzLnB1c2gocmVwbGFjZW1lbnQpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIHJldHVybiBuZXdQYXJ0c1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQdWJsaWMgdHJhbnNsYXRlIG1ldGhvZFxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHdpdGggdmFsdWVzIHRoYXQgd2lsbCBiZSB1c2VkIGxhdGVyIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzIGluIHN0cmluZ1xuICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0cmFuc2xhdGVkIChhbmQgaW50ZXJwb2xhdGVkKVxuICAgKi9cbiAgdHJhbnNsYXRlIChrZXksIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVBcnJheShrZXksIG9wdGlvbnMpLmpvaW4oJycpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgdHJhbnNsYXRpb24gYW5kIHJldHVybiB0aGUgdHJhbnNsYXRlZCBhbmQgaW50ZXJwb2xhdGVkIHBhcnRzIGFzIGFuIGFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHdpdGggdmFsdWVzIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzXG4gICAqIEByZXR1cm5zIHtBcnJheX0gVGhlIHRyYW5zbGF0ZWQgYW5kIGludGVycG9sYXRlZCBwYXJ0cywgaW4gb3JkZXIuXG4gICAqL1xuICB0cmFuc2xhdGVBcnJheSAoa2V5LCBvcHRpb25zKSB7XG4gICAgY29uc3Qgc3RyaW5nID0gdGhpcy5sb2NhbGUuc3RyaW5nc1trZXldXG4gICAgY29uc3QgaGFzUGx1cmFsRm9ybXMgPSB0eXBlb2Ygc3RyaW5nID09PSAnb2JqZWN0J1xuXG4gICAgaWYgKGhhc1BsdXJhbEZvcm1zKSB7XG4gICAgICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5zbWFydF9jb3VudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY29uc3QgcGx1cmFsID0gdGhpcy5sb2NhbGUucGx1cmFsaXplKG9wdGlvbnMuc21hcnRfY291bnQpXG4gICAgICAgIHJldHVybiB0aGlzLmludGVycG9sYXRlKHN0cmluZ1twbHVyYWxdLCBvcHRpb25zKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdHRlbXB0ZWQgdG8gdXNlIGEgc3RyaW5nIHdpdGggcGx1cmFsIGZvcm1zLCBidXQgbm8gdmFsdWUgd2FzIGdpdmVuIGZvciAle3NtYXJ0X2NvdW50fScpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuaW50ZXJwb2xhdGUoc3RyaW5nLCBvcHRpb25zKVxuICB9XG59XG4iLCJjb25zdCB0aHJvdHRsZSA9IHJlcXVpcmUoJ2xvZGFzaC50aHJvdHRsZScpXG5cbmZ1bmN0aW9uIF9lbWl0U29ja2V0UHJvZ3Jlc3MgKHVwbG9hZGVyLCBwcm9ncmVzc0RhdGEsIGZpbGUpIHtcbiAgY29uc3QgeyBwcm9ncmVzcywgYnl0ZXNVcGxvYWRlZCwgYnl0ZXNUb3RhbCB9ID0gcHJvZ3Jlc3NEYXRhXG4gIGlmIChwcm9ncmVzcykge1xuICAgIHVwbG9hZGVyLnVwcHkubG9nKGBVcGxvYWQgcHJvZ3Jlc3M6ICR7cHJvZ3Jlc3N9YClcbiAgICB1cGxvYWRlci51cHB5LmVtaXQoJ3VwbG9hZC1wcm9ncmVzcycsIGZpbGUsIHtcbiAgICAgIHVwbG9hZGVyLFxuICAgICAgYnl0ZXNVcGxvYWRlZDogYnl0ZXNVcGxvYWRlZCxcbiAgICAgIGJ5dGVzVG90YWw6IGJ5dGVzVG90YWxcbiAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGhyb3R0bGUoX2VtaXRTb2NrZXRQcm9ncmVzcywgMzAwLCB7XG4gIGxlYWRpbmc6IHRydWUsXG4gIHRyYWlsaW5nOiB0cnVlXG59KVxuIiwiY29uc3QgaXNET01FbGVtZW50ID0gcmVxdWlyZSgnLi9pc0RPTUVsZW1lbnQnKVxuXG4vKipcbiAqIEZpbmQgYSBET00gZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge05vZGV8c3RyaW5nfSBlbGVtZW50XG4gKiBAcmV0dXJucyB7Tm9kZXxudWxsfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbmRET01FbGVtZW50IChlbGVtZW50LCBjb250ZXh0ID0gZG9jdW1lbnQpIHtcbiAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudClcbiAgfVxuXG4gIGlmIChpc0RPTUVsZW1lbnQoZWxlbWVudCkpIHtcbiAgICByZXR1cm4gZWxlbWVudFxuICB9XG59XG4iLCIvKipcbiAqIFRha2VzIGEgZmlsZSBvYmplY3QgYW5kIHR1cm5zIGl0IGludG8gZmlsZUlELCBieSBjb252ZXJ0aW5nIGZpbGUubmFtZSB0byBsb3dlcmNhc2UsXG4gKiByZW1vdmluZyBleHRyYSBjaGFyYWN0ZXJzIGFuZCBhZGRpbmcgdHlwZSwgc2l6ZSBhbmQgbGFzdE1vZGlmaWVkXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGZpbGVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBmaWxlSURcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZW5lcmF0ZUZpbGVJRCAoZmlsZSkge1xuICAvLyBJdCdzIHRlbXB0aW5nIHRvIGRvIGBbaXRlbXNdLmZpbHRlcihCb29sZWFuKS5qb2luKCctJylgIGhlcmUsIGJ1dCB0aGF0XG4gIC8vIGlzIHNsb3dlciEgc2ltcGxlIHN0cmluZyBjb25jYXRlbmF0aW9uIGlzIGZhc3RcblxuICBsZXQgaWQgPSAndXBweSdcbiAgaWYgKHR5cGVvZiBmaWxlLm5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgaWQgKz0gJy0nICsgZW5jb2RlRmlsZW5hbWUoZmlsZS5uYW1lLnRvTG93ZXJDYXNlKCkpXG4gIH1cblxuICBpZiAoZmlsZS50eXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZCArPSAnLScgKyBmaWxlLnR5cGVcbiAgfVxuXG4gIGlmIChmaWxlLm1ldGEgJiYgdHlwZW9mIGZpbGUubWV0YS5yZWxhdGl2ZVBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgaWQgKz0gJy0nICsgZW5jb2RlRmlsZW5hbWUoZmlsZS5tZXRhLnJlbGF0aXZlUGF0aC50b0xvd2VyQ2FzZSgpKVxuICB9XG5cbiAgaWYgKGZpbGUuZGF0YS5zaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZCArPSAnLScgKyBmaWxlLmRhdGEuc2l6ZVxuICB9XG4gIGlmIChmaWxlLmRhdGEubGFzdE1vZGlmaWVkICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZCArPSAnLScgKyBmaWxlLmRhdGEubGFzdE1vZGlmaWVkXG4gIH1cblxuICByZXR1cm4gaWRcbn1cblxuZnVuY3Rpb24gZW5jb2RlRmlsZW5hbWUgKG5hbWUpIHtcbiAgbGV0IHN1ZmZpeCA9ICcnXG4gIHJldHVybiBuYW1lLnJlcGxhY2UoL1teQS1aMC05XS9pZywgKGNoYXJhY3RlcikgPT4ge1xuICAgIHN1ZmZpeCArPSAnLScgKyBlbmNvZGVDaGFyYWN0ZXIoY2hhcmFjdGVyKVxuICAgIHJldHVybiAnLydcbiAgfSkgKyBzdWZmaXhcbn1cblxuZnVuY3Rpb24gZW5jb2RlQ2hhcmFjdGVyIChjaGFyYWN0ZXIpIHtcbiAgcmV0dXJuIGNoYXJhY3Rlci5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDMyKVxufVxuIiwiY29uc3Qgd2Via2l0R2V0QXNFbnRyeUFwaSA9IHJlcXVpcmUoJy4vdXRpbHMvd2Via2l0R2V0QXNFbnRyeUFwaS9pbmRleCcpXG5jb25zdCBmYWxsYmFja0FwaSA9IHJlcXVpcmUoJy4vdXRpbHMvZmFsbGJhY2tBcGknKVxuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGFycmF5IG9mIGRyb3BwZWQgZmlsZXMgKGlmIGEgZm9sZGVyIGlzIGRyb3BwZWQsIGFuZCBicm93c2VyIHN1cHBvcnRzIGZvbGRlciBwYXJzaW5nIC0gcHJvbWlzZSByZXNvbHZlcyB0byB0aGUgZmxhdCBhcnJheSBvZiBhbGwgZmlsZXMgaW4gYWxsIGRpcmVjdG9yaWVzKS5cbiAqIEVhY2ggZmlsZSBoYXMgLnJlbGF0aXZlUGF0aCBwcm9wIGFwcGVuZGVkIHRvIGl0IChlLmcuIFwiL2RvY3MvUHJhZ3VlL3RpY2tldF9mcm9tX3ByYWd1ZV90b191ZmEucGRmXCIpIGlmIGJyb3dzZXIgc3VwcG9ydHMgaXQuIE90aGVyd2lzZSBpdCdzIHVuZGVmaW5lZC5cbiAqXG4gKiBAcGFyYW0ge0RhdGFUcmFuc2Zlcn0gZGF0YVRyYW5zZmVyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsb2dEcm9wRXJyb3IgLSBhIGZ1bmN0aW9uIHRoYXQncyBjYWxsZWQgZXZlcnkgdGltZSBzb21lIGZvbGRlciBvciBzb21lIGZpbGUgZXJyb3Igb3V0IChlLmcuIGJlY2F1c2Ugb2YgdGhlIGZvbGRlciBuYW1lIGJlaW5nIHRvbyBsb25nIG9uIFdpbmRvd3MpLiBOb3RpY2UgdGhhdCByZXN1bHRpbmcgcHJvbWlzZSB3aWxsIGFsd2F5cyBiZSByZXNvbHZlZCBhbnl3YXkuXG4gKlxuICogQHJldHVybnMge1Byb21pc2V9IC0gQXJyYXk8RmlsZT5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXREcm9wcGVkRmlsZXMgKGRhdGFUcmFuc2ZlciwgeyBsb2dEcm9wRXJyb3IgPSAoKSA9PiB7fSB9ID0ge30pIHtcbiAgLy8gR2V0IGFsbCBmaWxlcyBmcm9tIGFsbCBzdWJkaXJzLiBXb3JrcyAoYXQgbGVhc3QpIGluIENocm9tZSwgTW96aWxsYSwgYW5kIFNhZmFyaVxuICBpZiAoZGF0YVRyYW5zZmVyLml0ZW1zICYmIGRhdGFUcmFuc2Zlci5pdGVtc1swXSAmJiAnd2Via2l0R2V0QXNFbnRyeScgaW4gZGF0YVRyYW5zZmVyLml0ZW1zWzBdKSB7XG4gICAgcmV0dXJuIHdlYmtpdEdldEFzRW50cnlBcGkoZGF0YVRyYW5zZmVyLCBsb2dEcm9wRXJyb3IpXG4gIC8vIE90aGVyd2lzZSBqdXN0IHJldHVybiBhbGwgZmlyc3Qtb3JkZXIgZmlsZXNcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsbGJhY2tBcGkoZGF0YVRyYW5zZmVyKVxuICB9XG59XG4iLCJjb25zdCB0b0FycmF5ID0gcmVxdWlyZSgnLi4vLi4vdG9BcnJheScpXG5cbi8vIC5maWxlcyBmYWxsYmFjaywgc2hvdWxkIGJlIGltcGxlbWVudGVkIGluIGFueSBicm93c2VyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZhbGxiYWNrQXBpIChkYXRhVHJhbnNmZXIpIHtcbiAgY29uc3QgZmlsZXMgPSB0b0FycmF5KGRhdGFUcmFuc2Zlci5maWxlcylcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmaWxlcylcbn1cbiIsIi8qKlxuICogUmVjdXJzaXZlIGZ1bmN0aW9uLCBjYWxscyB0aGUgb3JpZ2luYWwgY2FsbGJhY2soKSB3aGVuIHRoZSBkaXJlY3RvcnkgaXMgZW50aXJlbHkgcGFyc2VkLlxuICpcbiAqIEBwYXJhbSB7RmlsZVN5c3RlbURpcmVjdG9yeVJlYWRlcn0gZGlyZWN0b3J5UmVhZGVyXG4gKiBAcGFyYW0ge0FycmF5fSBvbGRFbnRyaWVzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBsb2dEcm9wRXJyb3JcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gY2FsbGVkIHdpdGggKFsgYWxsIGZpbGVzIGFuZCBkaXJlY3RvcmllcyBpbiB0aGF0IGRpcmVjdG9yeVJlYWRlciBdKVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldEZpbGVzQW5kRGlyZWN0b3JpZXNGcm9tRGlyZWN0b3J5IChkaXJlY3RvcnlSZWFkZXIsIG9sZEVudHJpZXMsIGxvZ0Ryb3BFcnJvciwgeyBvblN1Y2Nlc3MgfSkge1xuICBkaXJlY3RvcnlSZWFkZXIucmVhZEVudHJpZXMoXG4gICAgKGVudHJpZXMpID0+IHtcbiAgICAgIGNvbnN0IG5ld0VudHJpZXMgPSBbLi4ub2xkRW50cmllcywgLi4uZW50cmllc11cbiAgICAgIC8vIEFjY29yZGluZyB0byB0aGUgRmlsZVN5c3RlbSBBUEkgc3BlYywgZ2V0RmlsZXNBbmREaXJlY3Rvcmllc0Zyb21EaXJlY3RvcnkoKSBtdXN0IGJlIGNhbGxlZCB1bnRpbCBpdCBjYWxscyB0aGUgb25TdWNjZXNzIHdpdGggYW4gZW1wdHkgYXJyYXkuXG4gICAgICBpZiAoZW50cmllcy5sZW5ndGgpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgZ2V0RmlsZXNBbmREaXJlY3Rvcmllc0Zyb21EaXJlY3RvcnkoZGlyZWN0b3J5UmVhZGVyLCBuZXdFbnRyaWVzLCBsb2dEcm9wRXJyb3IsIHsgb25TdWNjZXNzIH0pXG4gICAgICAgIH0sIDApXG4gICAgICAvLyBEb25lIGl0ZXJhdGluZyB0aGlzIHBhcnRpY3VsYXIgZGlyZWN0b3J5XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvblN1Y2Nlc3MobmV3RW50cmllcylcbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIE1ha2Ugc3VyZSB3ZSByZXNvbHZlIG9uIGVycm9yIGFueXdheSwgaXQncyBmaW5lIGlmIG9ubHkgb25lIGRpcmVjdG9yeSBjb3VsZG4ndCBiZSBwYXJzZWQhXG4gICAgKGVycm9yKSA9PiB7XG4gICAgICBsb2dEcm9wRXJyb3IoZXJyb3IpXG4gICAgICBvblN1Y2Nlc3Mob2xkRW50cmllcylcbiAgICB9XG4gIClcbn1cbiIsIi8qKlxuICogR2V0IHRoZSByZWxhdGl2ZSBwYXRoIGZyb20gdGhlIEZpbGVFbnRyeSNmdWxsUGF0aCwgYmVjYXVzZSBGaWxlI3dlYmtpdFJlbGF0aXZlUGF0aCBpcyBhbHdheXMgJycsIGF0IGxlYXN0IG9uRHJvcC5cbiAqXG4gKiBAcGFyYW0ge0ZpbGVFbnRyeX0gZmlsZUVudHJ5XG4gKlxuICogQHJldHVybnMge3N0cmluZ3xudWxsfSAtIGlmIGZpbGUgaXMgbm90IGluIGEgZm9sZGVyIC0gcmV0dXJuIG51bGwgKHRoaXMgaXMgdG8gYmUgY29uc2lzdGVudCB3aXRoIC5yZWxhdGl2ZVBhdGgtcyBvZiBmaWxlcyBzZWxlY3RlZCBmcm9tIE15IERldmljZSkuIElmIGZpbGUgaXMgaW4gYSBmb2xkZXIgLSByZXR1cm4gaXRzIGZ1bGxQYXRoLCBlLmcuICcvc2ltcHNvbnMvaGkuanBlZycuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0UmVsYXRpdmVQYXRoIChmaWxlRW50cnkpIHtcbiAgLy8gZmlsZUVudHJ5LmZ1bGxQYXRoIC0gXCIvc2ltcHNvbnMvaGkuanBlZ1wiIG9yIHVuZGVmaW5lZCAoZm9yIGJyb3dzZXJzIHRoYXQgZG9uJ3Qgc3VwcG9ydCBpdClcbiAgLy8gZmlsZUVudHJ5Lm5hbWUgLSBcImhpLmpwZWdcIlxuICBpZiAoIWZpbGVFbnRyeS5mdWxsUGF0aCB8fCBmaWxlRW50cnkuZnVsbFBhdGggPT09ICcvJyArIGZpbGVFbnRyeS5uYW1lKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmlsZUVudHJ5LmZ1bGxQYXRoXG4gIH1cbn1cbiIsImNvbnN0IHRvQXJyYXkgPSByZXF1aXJlKCcuLi8uLi8uLi90b0FycmF5JylcbmNvbnN0IGdldFJlbGF0aXZlUGF0aCA9IHJlcXVpcmUoJy4vZ2V0UmVsYXRpdmVQYXRoJylcbmNvbnN0IGdldEZpbGVzQW5kRGlyZWN0b3JpZXNGcm9tRGlyZWN0b3J5ID0gcmVxdWlyZSgnLi9nZXRGaWxlc0FuZERpcmVjdG9yaWVzRnJvbURpcmVjdG9yeScpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gd2Via2l0R2V0QXNFbnRyeUFwaSAoZGF0YVRyYW5zZmVyLCBsb2dEcm9wRXJyb3IpIHtcbiAgY29uc3QgZmlsZXMgPSBbXVxuXG4gIGNvbnN0IHJvb3RQcm9taXNlcyA9IFtdXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByZXNvbHZlZCBwcm9taXNlLCB3aGVuIDpmaWxlcyBhcnJheSBpcyBlbmhhbmNlZFxuICAgKlxuICAgKiBAcGFyYW0geyhGaWxlU3lzdGVtRmlsZUVudHJ5fEZpbGVTeXN0ZW1EaXJlY3RvcnlFbnRyeSl9IGVudHJ5XG4gICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIGVtcHR5IHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIDpmaWxlcyBpcyBlbmhhbmNlZCB3aXRoIGEgZmlsZVxuICAgKi9cbiAgY29uc3QgY3JlYXRlUHJvbWlzZVRvQWRkRmlsZU9yUGFyc2VEaXJlY3RvcnkgPSAoZW50cnkpID0+XG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIC8vIFRoaXMgaXMgYSBiYXNlIGNhbGxcbiAgICAgIGlmIChlbnRyeS5pc0ZpbGUpIHtcbiAgICAgICAgLy8gQ3JlYXRlcyBhIG5ldyBGaWxlIG9iamVjdCB3aGljaCBjYW4gYmUgdXNlZCB0byByZWFkIHRoZSBmaWxlLlxuICAgICAgICBlbnRyeS5maWxlKFxuICAgICAgICAgIChmaWxlKSA9PiB7XG4gICAgICAgICAgICBmaWxlLnJlbGF0aXZlUGF0aCA9IGdldFJlbGF0aXZlUGF0aChlbnRyeSlcbiAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZSlcbiAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gTWFrZSBzdXJlIHdlIHJlc29sdmUgb24gZXJyb3IgYW55d2F5LCBpdCdzIGZpbmUgaWYgb25seSBvbmUgZmlsZSBjb3VsZG4ndCBiZSByZWFkIVxuICAgICAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgbG9nRHJvcEVycm9yKGVycm9yKVxuICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICAvLyBUaGlzIGlzIGEgcmVjdXJzaXZlIGNhbGxcbiAgICAgIH0gZWxzZSBpZiAoZW50cnkuaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgY29uc3QgZGlyZWN0b3J5UmVhZGVyID0gZW50cnkuY3JlYXRlUmVhZGVyKClcbiAgICAgICAgZ2V0RmlsZXNBbmREaXJlY3Rvcmllc0Zyb21EaXJlY3RvcnkoZGlyZWN0b3J5UmVhZGVyLCBbXSwgbG9nRHJvcEVycm9yLCB7XG4gICAgICAgICAgb25TdWNjZXNzOiAoZW50cmllcykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBlbnRyaWVzLm1hcCgoZW50cnkpID0+IGNyZWF0ZVByb21pc2VUb0FkZEZpbGVPclBhcnNlRGlyZWN0b3J5KGVudHJ5KSlcbiAgICAgICAgICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKCgpID0+IHJlc29sdmUoKSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAvLyBGb3IgZWFjaCBkcm9wcGVkIGl0ZW0sIC0gbWFrZSBzdXJlIGl0J3MgYSBmaWxlL2RpcmVjdG9yeSwgYW5kIHN0YXJ0IGRlZXBlbmluZyBpbiFcbiAgdG9BcnJheShkYXRhVHJhbnNmZXIuaXRlbXMpXG4gICAgLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gaXRlbS53ZWJraXRHZXRBc0VudHJ5KClcbiAgICAgIC8vIDplbnRyeSBjYW4gYmUgbnVsbCB3aGVuIHdlIGRyb3AgdGhlIHVybCBlLmcuXG4gICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgcm9vdFByb21pc2VzLnB1c2goY3JlYXRlUHJvbWlzZVRvQWRkRmlsZU9yUGFyc2VEaXJlY3RvcnkoZW50cnkpKVxuICAgICAgfVxuICAgIH0pXG5cbiAgcmV0dXJuIFByb21pc2UuYWxsKHJvb3RQcm9taXNlcylcbiAgICAudGhlbigoKSA9PiBmaWxlcylcbn1cbiIsIi8qKlxuICogVGFrZXMgYSBmdWxsIGZpbGVuYW1lIHN0cmluZyBhbmQgcmV0dXJucyBhbiBvYmplY3Qge25hbWUsIGV4dGVuc2lvbn1cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZnVsbEZpbGVOYW1lXG4gKiBAcmV0dXJucyB7b2JqZWN0fSB7bmFtZSwgZXh0ZW5zaW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uIChmdWxsRmlsZU5hbWUpIHtcbiAgY29uc3QgbGFzdERvdCA9IGZ1bGxGaWxlTmFtZS5sYXN0SW5kZXhPZignLicpXG4gIC8vIHRoZXNlIGNvdW50IGFzIG5vIGV4dGVuc2lvbjogXCJuby1kb3RcIiwgXCJ0cmFpbGluZy1kb3QuXCJcbiAgaWYgKGxhc3REb3QgPT09IC0xIHx8IGxhc3REb3QgPT09IGZ1bGxGaWxlTmFtZS5sZW5ndGggLSAxKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IGZ1bGxGaWxlTmFtZSxcbiAgICAgIGV4dGVuc2lvbjogdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBmdWxsRmlsZU5hbWUuc2xpY2UoMCwgbGFzdERvdCksXG4gICAgICBleHRlbnNpb246IGZ1bGxGaWxlTmFtZS5zbGljZShsYXN0RG90ICsgMSlcbiAgICB9XG4gIH1cbn1cbiIsImNvbnN0IGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uID0gcmVxdWlyZSgnLi9nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbicpXG5jb25zdCBtaW1lVHlwZXMgPSByZXF1aXJlKCcuL21pbWVUeXBlcycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0RmlsZVR5cGUgKGZpbGUpIHtcbiAgbGV0IGZpbGVFeHRlbnNpb24gPSBmaWxlLm5hbWUgPyBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbihmaWxlLm5hbWUpLmV4dGVuc2lvbiA6IG51bGxcbiAgZmlsZUV4dGVuc2lvbiA9IGZpbGVFeHRlbnNpb24gPyBmaWxlRXh0ZW5zaW9uLnRvTG93ZXJDYXNlKCkgOiBudWxsXG5cbiAgaWYgKGZpbGUudHlwZSkge1xuICAgIC8vIGlmIG1pbWUgdHlwZSBpcyBzZXQgaW4gdGhlIGZpbGUgb2JqZWN0IGFscmVhZHksIHVzZSB0aGF0XG4gICAgcmV0dXJuIGZpbGUudHlwZVxuICB9IGVsc2UgaWYgKGZpbGVFeHRlbnNpb24gJiYgbWltZVR5cGVzW2ZpbGVFeHRlbnNpb25dKSB7XG4gICAgLy8gZWxzZSwgc2VlIGlmIHdlIGNhbiBtYXAgZXh0ZW5zaW9uIHRvIGEgbWltZSB0eXBlXG4gICAgcmV0dXJuIG1pbWVUeXBlc1tmaWxlRXh0ZW5zaW9uXVxuICB9IGVsc2Uge1xuICAgIC8vIGlmIGFsbCBmYWlscywgZmFsbCBiYWNrIHRvIGEgZ2VuZXJpYyBieXRlIHN0cmVhbSB0eXBlXG4gICAgcmV0dXJuICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0U29ja2V0SG9zdCAodXJsKSB7XG4gIC8vIGdldCB0aGUgaG9zdCBkb21haW5cbiAgdmFyIHJlZ2V4ID0gL14oPzpodHRwcz86XFwvXFwvfFxcL1xcLyk/KD86W15AXFxuXStAKT8oPzp3d3dcXC4pPyhbXlxcbl0rKS9pXG4gIHZhciBob3N0ID0gcmVnZXguZXhlYyh1cmwpWzFdXG4gIHZhciBzb2NrZXRQcm90b2NvbCA9IC9eaHR0cDpcXC9cXC8vaS50ZXN0KHVybCkgPyAnd3MnIDogJ3dzcydcblxuICByZXR1cm4gYCR7c29ja2V0UHJvdG9jb2x9Oi8vJHtob3N0fWBcbn1cbiIsIi8qKlxuICogUmV0dXJucyBhIHRpbWVzdGFtcCBpbiB0aGUgZm9ybWF0IG9mIGBob3VyczptaW51dGVzOnNlY29uZHNgXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0VGltZVN0YW1wICgpIHtcbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpXG4gIHZhciBob3VycyA9IHBhZChkYXRlLmdldEhvdXJzKCkudG9TdHJpbmcoKSlcbiAgdmFyIG1pbnV0ZXMgPSBwYWQoZGF0ZS5nZXRNaW51dGVzKCkudG9TdHJpbmcoKSlcbiAgdmFyIHNlY29uZHMgPSBwYWQoZGF0ZS5nZXRTZWNvbmRzKCkudG9TdHJpbmcoKSlcbiAgcmV0dXJuIGhvdXJzICsgJzonICsgbWludXRlcyArICc6JyArIHNlY29uZHNcbn1cblxuLyoqXG4gKiBBZGRzIHplcm8gdG8gc3RyaW5ncyBzaG9ydGVyIHRoYW4gdHdvIGNoYXJhY3RlcnNcbiAqL1xuZnVuY3Rpb24gcGFkIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5sZW5ndGggIT09IDIgPyAwICsgc3RyIDogc3RyXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGhhcyAob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSlcbn1cbiIsIi8qKlxuICogQ2hlY2sgaWYgYW4gb2JqZWN0IGlzIGEgRE9NIGVsZW1lbnQuIER1Y2stdHlwaW5nIGJhc2VkIG9uIGBub2RlVHlwZWAuXG4gKlxuICogQHBhcmFtIHsqfSBvYmpcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0RPTUVsZW1lbnQgKG9iaikge1xuICByZXR1cm4gb2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIG9iai5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREVcbn1cbiIsIi8qKlxuICogQ2hlY2tzIGlmIHRoZSBicm93c2VyIHN1cHBvcnRzIERyYWcgJiBEcm9wIChub3Qgc3VwcG9ydGVkIG9uIG1vYmlsZSBkZXZpY2VzLCBmb3IgZXhhbXBsZSkuXG4gKlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNEcmFnRHJvcFN1cHBvcnRlZCAoKSB7XG4gIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cbiAgaWYgKCEoJ2RyYWdnYWJsZScgaW4gZGl2KSB8fCAhKCdvbmRyYWdzdGFydCcgaW4gZGl2ICYmICdvbmRyb3AnIGluIGRpdikpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmICghKCdGb3JtRGF0YScgaW4gd2luZG93KSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKCEoJ0ZpbGVSZWFkZXInIGluIHdpbmRvdykpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0cnVlXG59XG4iLCJmdW5jdGlvbiBpc05ldHdvcmtFcnJvciAoeGhyKSB7XG4gIGlmICgheGhyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgcmV0dXJuICh4aHIucmVhZHlTdGF0ZSAhPT0gMCAmJiB4aHIucmVhZHlTdGF0ZSAhPT0gNCkgfHwgeGhyLnN0YXR1cyA9PT0gMFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTmV0d29ya0Vycm9yXG4iLCIvLyBfX19XaHkgbm90IGFkZCB0aGUgbWltZS10eXBlcyBwYWNrYWdlP1xuLy8gICAgSXQncyAxOS43a0IgZ3ppcHBlZCwgYW5kIHdlIG9ubHkgbmVlZCBtaW1lIHR5cGVzIGZvciB3ZWxsLWtub3duIGV4dGVuc2lvbnMgKGZvciBmaWxlIHByZXZpZXdzKS5cbi8vIF9fX1doZXJlIHRvIHRha2UgbmV3IGV4dGVuc2lvbnMgZnJvbT9cbi8vICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9qc2h0dHAvbWltZS1kYi9ibG9iL21hc3Rlci9kYi5qc29uXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZDogJ3RleHQvbWFya2Rvd24nLFxuICBtYXJrZG93bjogJ3RleHQvbWFya2Rvd24nLFxuICBtcDQ6ICd2aWRlby9tcDQnLFxuICBtcDM6ICdhdWRpby9tcDMnLFxuICBzdmc6ICdpbWFnZS9zdmcreG1sJyxcbiAganBnOiAnaW1hZ2UvanBlZycsXG4gIHBuZzogJ2ltYWdlL3BuZycsXG4gIGdpZjogJ2ltYWdlL2dpZicsXG4gIGhlaWM6ICdpbWFnZS9oZWljJyxcbiAgaGVpZjogJ2ltYWdlL2hlaWYnLFxuICB5YW1sOiAndGV4dC95YW1sJyxcbiAgeW1sOiAndGV4dC95YW1sJyxcbiAgY3N2OiAndGV4dC9jc3YnLFxuICB0c3Y6ICd0ZXh0L3RhYi1zZXBhcmF0ZWQtdmFsdWVzJyxcbiAgdGFiOiAndGV4dC90YWItc2VwYXJhdGVkLXZhbHVlcycsXG4gIGF2aTogJ3ZpZGVvL3gtbXN2aWRlbycsXG4gIG1rczogJ3ZpZGVvL3gtbWF0cm9za2EnLFxuICBta3Y6ICd2aWRlby94LW1hdHJvc2thJyxcbiAgbW92OiAndmlkZW8vcXVpY2t0aW1lJyxcbiAgZG9jOiAnYXBwbGljYXRpb24vbXN3b3JkJyxcbiAgZG9jbTogJ2FwcGxpY2F0aW9uL3ZuZC5tcy13b3JkLmRvY3VtZW50Lm1hY3JvZW5hYmxlZC4xMicsXG4gIGRvY3g6ICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC5kb2N1bWVudCcsXG4gIGRvdDogJ2FwcGxpY2F0aW9uL21zd29yZCcsXG4gIGRvdG06ICdhcHBsaWNhdGlvbi92bmQubXMtd29yZC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTInLFxuICBkb3R4OiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwudGVtcGxhdGUnLFxuICB4bGE6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICB4bGFtOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLmFkZGluLm1hY3JvZW5hYmxlZC4xMicsXG4gIHhsYzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gIHhsZjogJ2FwcGxpY2F0aW9uL3gteGxpZmYreG1sJyxcbiAgeGxtOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcbiAgeGxzOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcbiAgeGxzYjogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5zaGVldC5iaW5hcnkubWFjcm9lbmFibGVkLjEyJyxcbiAgeGxzbTogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5zaGVldC5tYWNyb2VuYWJsZWQuMTInLFxuICB4bHN4OiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXQnLFxuICB4bHQ6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICB4bHRtOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMicsXG4gIHhsdHg6ICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC50ZW1wbGF0ZScsXG4gIHhsdzogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gIHR4dDogJ3RleHQvcGxhaW4nLFxuICB0ZXh0OiAndGV4dC9wbGFpbicsXG4gIGNvbmY6ICd0ZXh0L3BsYWluJyxcbiAgbG9nOiAndGV4dC9wbGFpbicsXG4gIHBkZjogJ2FwcGxpY2F0aW9uL3BkZidcbn1cbiIsIi8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vRmxldC9wcmV0dGllci1ieXRlcy9cbi8vIENoYW5naW5nIDEwMDAgYnl0ZXMgdG8gMTAyNCwgc28gd2UgY2FuIGtlZXAgdXBwZXJjYXNlIEtCIHZzIGtCXG4vLyBJU0MgTGljZW5zZSAoYykgRGFuIEZsZXR0cmUgaHR0cHM6Ly9naXRodWIuY29tL0ZsZXQvcHJldHRpZXItYnl0ZXMvYmxvYi9tYXN0ZXIvTElDRU5TRVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByZXR0aWVyQnl0ZXNcblxuZnVuY3Rpb24gcHJldHRpZXJCeXRlcyAobnVtKSB7XG4gIGlmICh0eXBlb2YgbnVtICE9PSAnbnVtYmVyJyB8fCBpc05hTihudW0pKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBudW1iZXIsIGdvdCAnICsgdHlwZW9mIG51bSlcbiAgfVxuXG4gIHZhciBuZWcgPSBudW0gPCAwXG4gIHZhciB1bml0cyA9IFsnQicsICdLQicsICdNQicsICdHQicsICdUQicsICdQQicsICdFQicsICdaQicsICdZQiddXG5cbiAgaWYgKG5lZykge1xuICAgIG51bSA9IC1udW1cbiAgfVxuXG4gIGlmIChudW0gPCAxKSB7XG4gICAgcmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnIEInXG4gIH1cblxuICB2YXIgZXhwb25lbnQgPSBNYXRoLm1pbihNYXRoLmZsb29yKE1hdGgubG9nKG51bSkgLyBNYXRoLmxvZygxMDI0KSksIHVuaXRzLmxlbmd0aCAtIDEpXG4gIG51bSA9IE51bWJlcihudW0gLyBNYXRoLnBvdygxMDI0LCBleHBvbmVudCkpXG4gIHZhciB1bml0ID0gdW5pdHNbZXhwb25lbnRdXG5cbiAgaWYgKG51bSA+PSAxMCB8fCBudW0gJSAxID09PSAwKSB7XG4gICAgLy8gRG8gbm90IHNob3cgZGVjaW1hbHMgd2hlbiB0aGUgbnVtYmVyIGlzIHR3by1kaWdpdCwgb3IgaWYgdGhlIG51bWJlciBoYXMgbm9cbiAgICAvLyBkZWNpbWFsIGNvbXBvbmVudC5cbiAgICByZXR1cm4gKG5lZyA/ICctJyA6ICcnKSArIG51bS50b0ZpeGVkKDApICsgJyAnICsgdW5pdFxuICB9IGVsc2Uge1xuICAgIHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtLnRvRml4ZWQoMSkgKyAnICcgKyB1bml0XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlIChwcm9taXNlcykge1xuICBjb25zdCByZXNvbHV0aW9ucyA9IFtdXG4gIGNvbnN0IHJlamVjdGlvbnMgPSBbXVxuICBmdW5jdGlvbiByZXNvbHZlZCAodmFsdWUpIHtcbiAgICByZXNvbHV0aW9ucy5wdXNoKHZhbHVlKVxuICB9XG4gIGZ1bmN0aW9uIHJlamVjdGVkIChlcnJvcikge1xuICAgIHJlamVjdGlvbnMucHVzaChlcnJvcilcbiAgfVxuXG4gIGNvbnN0IHdhaXQgPSBQcm9taXNlLmFsbChcbiAgICBwcm9taXNlcy5tYXAoKHByb21pc2UpID0+IHByb21pc2UudGhlbihyZXNvbHZlZCwgcmVqZWN0ZWQpKVxuICApXG5cbiAgcmV0dXJuIHdhaXQudGhlbigoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3NmdWw6IHJlc29sdXRpb25zLFxuICAgICAgZmFpbGVkOiByZWplY3Rpb25zXG4gICAgfVxuICB9KVxufVxuIiwiLyoqXG4gKiBDb252ZXJ0cyBsaXN0IGludG8gYXJyYXlcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b0FycmF5IChsaXN0KSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChsaXN0IHx8IFtdLCAwKVxufVxuIiwicmVxdWlyZSgnZXM2LXByb21pc2UvYXV0bycpXG5yZXF1aXJlKCd3aGF0d2ctZmV0Y2gnKVxuY29uc3QgVXBweSA9IHJlcXVpcmUoJ0B1cHB5L2NvcmUnKVxuY29uc3QgRHJhZ0Ryb3AgPSByZXF1aXJlKCdAdXBweS9kcmFnLWRyb3AnKVxuY29uc3QgUHJvZ3Jlc3NCYXIgPSByZXF1aXJlKCdAdXBweS9wcm9ncmVzcy1iYXInKVxuY29uc3QgVHVzID0gcmVxdWlyZSgnQHVwcHkvdHVzJylcblxuLy8gRnVuY3Rpb24gZm9yIGRpc3BsYXlpbmcgdXBsb2FkZWQgZmlsZXNcbmNvbnN0IG9uVXBsb2FkU3VjY2VzcyA9IChlbEZvclVwbG9hZGVkRmlsZXMpID0+XG4gIChmaWxlLCByZXNwb25zZSkgPT4ge1xuICAgIGNvbnN0IHVybCA9IHJlc3BvbnNlLnVwbG9hZFVSTFxuICAgIGNvbnN0IGZpbGVOYW1lID0gZmlsZS5uYW1lXG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsRm9yVXBsb2FkZWRGaWxlcykuaW5uZXJIVE1MICs9XG4gICAgICBgPGxpPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2ZpbGVOYW1lfTwvYT48L2xpPmBcbiAgfVxuXG5jb25zdCB1cHB5T25lID0gbmV3IFVwcHkoeyBkZWJ1ZzogdHJ1ZSwgYXV0b1Byb2NlZWQ6IHRydWUgfSlcbnVwcHlPbmVcbiAgLnVzZShEcmFnRHJvcCwgeyB0YXJnZXQ6ICcuZXhhbXBsZS1vbmUgLmZvci1EcmFnRHJvcCcgfSlcbiAgLnVzZShUdXMsIHsgZW5kcG9pbnQ6ICdodHRwczovL21hc3Rlci50dXMuaW8vZmlsZXMvJyB9KVxuICAudXNlKFByb2dyZXNzQmFyLCB7IHRhcmdldDogJy5leGFtcGxlLW9uZSAuZm9yLVByb2dyZXNzQmFyJywgaGlkZUFmdGVyRmluaXNoOiBmYWxzZSB9KVxuICAub24oJ3VwbG9hZC1zdWNjZXNzJywgb25VcGxvYWRTdWNjZXNzKCcuZXhhbXBsZS1vbmUgLnVwbG9hZGVkLWZpbGVzIG9sJykpXG5cbmNvbnN0IHVwcHlUd28gPSBuZXcgVXBweSh7IGRlYnVnOiB0cnVlLCBhdXRvUHJvY2VlZDogZmFsc2UgfSlcbnVwcHlUd29cbiAgLnVzZShEcmFnRHJvcCwgeyB0YXJnZXQ6ICcuZXhhbXBsZS10d28gLmZvci1EcmFnRHJvcCcgfSlcbiAgLnVzZShUdXMsIHsgZW5kcG9pbnQ6ICdodHRwczovL21hc3Rlci50dXMuaW8vZmlsZXMvJyB9KVxuICAudXNlKFByb2dyZXNzQmFyLCB7IHRhcmdldDogJy5leGFtcGxlLXR3byAuZm9yLVByb2dyZXNzQmFyJywgaGlkZUFmdGVyRmluaXNoOiBmYWxzZSB9KVxuICAub24oJ3VwbG9hZC1zdWNjZXNzJywgb25VcGxvYWRTdWNjZXNzKCcuZXhhbXBsZS10d28gLnVwbG9hZGVkLWZpbGVzIG9sJykpXG5cbmNvbnN0IHVwbG9hZEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5leGFtcGxlLXR3byBidXR0b24udXBsb2FkLWJ1dHRvbicpXG51cGxvYWRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gIHVwcHlUd28udXBsb2FkKClcbn0pXG4iXX0=
