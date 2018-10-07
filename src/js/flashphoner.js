(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Flashphoner = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
(function (setImmediate){
(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (!(this instanceof Promise)) throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    return new Promise(function (resolve, reject) {
      if (!arr || typeof arr.length === 'undefined') throw new TypeError('Promise.all accepts an array');
      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);

}).call(this,require("timers").setImmediate)
},{"timers":7}],4:[function(require,module,exports){
/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');

function fixStatsType(stat) {
  return {
    inboundrtp: 'inbound-rtp',
    outboundrtp: 'outbound-rtp',
    candidatepair: 'candidate-pair',
    localcandidate: 'local-candidate',
    remotecandidate: 'remote-candidate'
  }[stat.type] || stat.type;
}

function writeMediaSection(transceiver, caps, type, stream, dtlsRole) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : dtlsRole || 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    var trackId = transceiver.rtpSender._initialTrackId ||
        transceiver.rtpSender.track.id;
    transceiver.rtpSender._initialTrackId = trackId;
    // spec.
    var msid = 'msid:' + (stream ? stream.id : '-') + ' ' +
        trackId + '\r\n';
    sdp += 'a=' + msid;
    // for Chrome. Legacy should no longer be required.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;

    // RTX
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
          ' ' + msid;
      sdp += 'a=ssrc-group:FID ' +
          transceiver.sendEncodingParameters[0].ssrc + ' ' +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          '\r\n';
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
  }
  return sdp;
}

// Edge does not like
// 1) stun: filtered after 14393 unless ?transport=udp is present
// 2) turn: that does not have all of turn:host:port?transport=udp
// 3) turn: with ipv6 addresses
// 4) turn: occurring muliple times
function filterIceServers(iceServers, edgeVersion) {
  var hasTurn = false;
  iceServers = JSON.parse(JSON.stringify(iceServers));
  return iceServers.filter(function(server) {
    if (server && (server.urls || server.url)) {
      var urls = server.urls || server.url;
      if (server.url && !server.urls) {
        console.warn('RTCIceServer.url is deprecated! Use urls instead.');
      }
      var isString = typeof urls === 'string';
      if (isString) {
        urls = [urls];
      }
      urls = urls.filter(function(url) {
        var validTurn = url.indexOf('turn:') === 0 &&
            url.indexOf('transport=udp') !== -1 &&
            url.indexOf('turn:[') === -1 &&
            !hasTurn;

        if (validTurn) {
          hasTurn = true;
          return true;
        }
        return url.indexOf('stun:') === 0 && edgeVersion >= 14393 &&
            url.indexOf('?transport=udp') === -1;
      });

      delete server.url;
      server.urls = isString ? urls[0] : urls;
      return !!urls.length;
    }
  });
}

// Determines the intersection of local and remote capabilities.
function getCommonCapabilities(localCapabilities, remoteCapabilities) {
  var commonCapabilities = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: []
  };

  var findCodecByPayloadType = function(pt, codecs) {
    pt = parseInt(pt, 10);
    for (var i = 0; i < codecs.length; i++) {
      if (codecs[i].payloadType === pt ||
          codecs[i].preferredPayloadType === pt) {
        return codecs[i];
      }
    }
  };

  var rtxCapabilityMatches = function(lRtx, rRtx, lCodecs, rCodecs) {
    var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
    var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
    return lCodec && rCodec &&
        lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
  };

  localCapabilities.codecs.forEach(function(lCodec) {
    for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
      var rCodec = remoteCapabilities.codecs[i];
      if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
          lCodec.clockRate === rCodec.clockRate) {
        if (lCodec.name.toLowerCase() === 'rtx' &&
            lCodec.parameters && rCodec.parameters.apt) {
          // for RTX we need to find the local rtx that has a apt
          // which points to the same local codec as the remote one.
          if (!rtxCapabilityMatches(lCodec, rCodec,
              localCapabilities.codecs, remoteCapabilities.codecs)) {
            continue;
          }
        }
        rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
        // number of channels is the highest common number of channels
        rCodec.numChannels = Math.min(lCodec.numChannels,
            rCodec.numChannels);
        // push rCodec so we reply with offerer payload type
        commonCapabilities.codecs.push(rCodec);

        // determine common feedback mechanisms
        rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
          for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
            if (lCodec.rtcpFeedback[j].type === fb.type &&
                lCodec.rtcpFeedback[j].parameter === fb.parameter) {
              return true;
            }
          }
          return false;
        });
        // FIXME: also need to determine .parameters
        //  see https://github.com/openpeer/ortc/issues/569
        break;
      }
    }
  });

  localCapabilities.headerExtensions.forEach(function(lHeaderExtension) {
    for (var i = 0; i < remoteCapabilities.headerExtensions.length;
         i++) {
      var rHeaderExtension = remoteCapabilities.headerExtensions[i];
      if (lHeaderExtension.uri === rHeaderExtension.uri) {
        commonCapabilities.headerExtensions.push(rHeaderExtension);
        break;
      }
    }
  });

  // FIXME: fecMechanisms
  return commonCapabilities;
}

// is action=setLocalDescription with type allowed in signalingState
function isActionAllowedInSignalingState(action, type, signalingState) {
  return {
    offer: {
      setLocalDescription: ['stable', 'have-local-offer'],
      setRemoteDescription: ['stable', 'have-remote-offer']
    },
    answer: {
      setLocalDescription: ['have-remote-offer', 'have-local-pranswer'],
      setRemoteDescription: ['have-local-offer', 'have-remote-pranswer']
    }
  }[type][action].indexOf(signalingState) !== -1;
}

function maybeAddCandidate(iceTransport, candidate) {
  // Edge's internal representation adds some fields therefore
  // not all fieldѕ are taken into account.
  var alreadyAdded = iceTransport.getRemoteCandidates()
      .find(function(remoteCandidate) {
        return candidate.foundation === remoteCandidate.foundation &&
            candidate.ip === remoteCandidate.ip &&
            candidate.port === remoteCandidate.port &&
            candidate.priority === remoteCandidate.priority &&
            candidate.protocol === remoteCandidate.protocol &&
            candidate.type === remoteCandidate.type;
      });
  if (!alreadyAdded) {
    iceTransport.addRemoteCandidate(candidate);
  }
  return !alreadyAdded;
}


function makeError(name, description) {
  var e = new Error(description);
  e.name = name;
  // legacy error codes from https://heycam.github.io/webidl/#idl-DOMException-error-names
  e.code = {
    NotSupportedError: 9,
    InvalidStateError: 11,
    InvalidAccessError: 15,
    TypeError: undefined,
    OperationError: undefined
  }[name];
  return e;
}

module.exports = function(window, edgeVersion) {
  // https://w3c.github.io/mediacapture-main/#mediastream
  // Helper function to add the track to the stream and
  // dispatch the event ourselves.
  function addTrackToStreamAndFireEvent(track, stream) {
    stream.addTrack(track);
    stream.dispatchEvent(new window.MediaStreamTrackEvent('addtrack',
        {track: track}));
  }

  function removeTrackFromStreamAndFireEvent(track, stream) {
    stream.removeTrack(track);
    stream.dispatchEvent(new window.MediaStreamTrackEvent('removetrack',
        {track: track}));
  }

  function fireAddTrack(pc, track, receiver, streams) {
    var trackEvent = new Event('track');
    trackEvent.track = track;
    trackEvent.receiver = receiver;
    trackEvent.transceiver = {receiver: receiver};
    trackEvent.streams = streams;
    window.setTimeout(function() {
      pc._dispatchEvent('track', trackEvent);
    });
  }

  var RTCPeerConnection = function(config) {
    var pc = this;

    var _eventTarget = document.createDocumentFragment();
    ['addEventListener', 'removeEventListener', 'dispatchEvent']
        .forEach(function(method) {
          pc[method] = _eventTarget[method].bind(_eventTarget);
        });

    this.canTrickleIceCandidates = null;

    this.needNegotiation = false;

    this.localStreams = [];
    this.remoteStreams = [];

    this._localDescription = null;
    this._remoteDescription = null;

    this.signalingState = 'stable';
    this.iceConnectionState = 'new';
    this.connectionState = 'new';
    this.iceGatheringState = 'new';

    config = JSON.parse(JSON.stringify(config || {}));

    this.usingBundle = config.bundlePolicy === 'max-bundle';
    if (config.rtcpMuxPolicy === 'negotiate') {
      throw(makeError('NotSupportedError',
          'rtcpMuxPolicy \'negotiate\' is not supported'));
    } else if (!config.rtcpMuxPolicy) {
      config.rtcpMuxPolicy = 'require';
    }

    switch (config.iceTransportPolicy) {
      case 'all':
      case 'relay':
        break;
      default:
        config.iceTransportPolicy = 'all';
        break;
    }

    switch (config.bundlePolicy) {
      case 'balanced':
      case 'max-compat':
      case 'max-bundle':
        break;
      default:
        config.bundlePolicy = 'balanced';
        break;
    }

    config.iceServers = filterIceServers(config.iceServers || [], edgeVersion);

    this._iceGatherers = [];
    if (config.iceCandidatePoolSize) {
      for (var i = config.iceCandidatePoolSize; i > 0; i--) {
        this._iceGatherers.push(new window.RTCIceGatherer({
          iceServers: config.iceServers,
          gatherPolicy: config.iceTransportPolicy
        }));
      }
    } else {
      config.iceCandidatePoolSize = 0;
    }

    this._config = config;

    // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
    // everything that is needed to describe a SDP m-line.
    this.transceivers = [];

    this._sdpSessionId = SDPUtils.generateSessionId();
    this._sdpSessionVersion = 0;

    this._dtlsRole = undefined; // role for a=setup to use in answers.

    this._isClosed = false;
  };

  Object.defineProperty(RTCPeerConnection.prototype, 'localDescription', {
    configurable: true,
    get: function() {
      return this._localDescription;
    }
  });
  Object.defineProperty(RTCPeerConnection.prototype, 'remoteDescription', {
    configurable: true,
    get: function() {
      return this._remoteDescription;
    }
  });

  // set up event handlers on prototype
  RTCPeerConnection.prototype.onicecandidate = null;
  RTCPeerConnection.prototype.onaddstream = null;
  RTCPeerConnection.prototype.ontrack = null;
  RTCPeerConnection.prototype.onremovestream = null;
  RTCPeerConnection.prototype.onsignalingstatechange = null;
  RTCPeerConnection.prototype.oniceconnectionstatechange = null;
  RTCPeerConnection.prototype.onconnectionstatechange = null;
  RTCPeerConnection.prototype.onicegatheringstatechange = null;
  RTCPeerConnection.prototype.onnegotiationneeded = null;
  RTCPeerConnection.prototype.ondatachannel = null;

  RTCPeerConnection.prototype._dispatchEvent = function(name, event) {
    if (this._isClosed) {
      return;
    }
    this.dispatchEvent(event);
    if (typeof this['on' + name] === 'function') {
      this['on' + name](event);
    }
  };

  RTCPeerConnection.prototype._emitGatheringStateChange = function() {
    var event = new Event('icegatheringstatechange');
    this._dispatchEvent('icegatheringstatechange', event);
  };

  RTCPeerConnection.prototype.getConfiguration = function() {
    return this._config;
  };

  RTCPeerConnection.prototype.getLocalStreams = function() {
    return this.localStreams;
  };

  RTCPeerConnection.prototype.getRemoteStreams = function() {
    return this.remoteStreams;
  };

  // internal helper to create a transceiver object.
  // (which is not yet the same as the WebRTC 1.0 transceiver)
  RTCPeerConnection.prototype._createTransceiver = function(kind, doNotAdd) {
    var hasBundleTransport = this.transceivers.length > 0;
    var transceiver = {
      track: null,
      iceGatherer: null,
      iceTransport: null,
      dtlsTransport: null,
      localCapabilities: null,
      remoteCapabilities: null,
      rtpSender: null,
      rtpReceiver: null,
      kind: kind,
      mid: null,
      sendEncodingParameters: null,
      recvEncodingParameters: null,
      stream: null,
      associatedRemoteMediaStreams: [],
      wantReceive: true
    };
    if (this.usingBundle && hasBundleTransport) {
      transceiver.iceTransport = this.transceivers[0].iceTransport;
      transceiver.dtlsTransport = this.transceivers[0].dtlsTransport;
    } else {
      var transports = this._createIceAndDtlsTransports();
      transceiver.iceTransport = transports.iceTransport;
      transceiver.dtlsTransport = transports.dtlsTransport;
    }
    if (!doNotAdd) {
      this.transceivers.push(transceiver);
    }
    return transceiver;
  };

  RTCPeerConnection.prototype.addTrack = function(track, stream) {
    if (this._isClosed) {
      throw makeError('InvalidStateError',
          'Attempted to call addTrack on a closed peerconnection.');
    }

    var alreadyExists = this.transceivers.find(function(s) {
      return s.track === track;
    });

    if (alreadyExists) {
      throw makeError('InvalidAccessError', 'Track already exists.');
    }

    var transceiver;
    for (var i = 0; i < this.transceivers.length; i++) {
      if (!this.transceivers[i].track &&
          this.transceivers[i].kind === track.kind) {
        transceiver = this.transceivers[i];
      }
    }
    if (!transceiver) {
      transceiver = this._createTransceiver(track.kind);
    }

    this._maybeFireNegotiationNeeded();

    if (this.localStreams.indexOf(stream) === -1) {
      this.localStreams.push(stream);
    }

    transceiver.track = track;
    transceiver.stream = stream;
    transceiver.rtpSender = new window.RTCRtpSender(track,
        transceiver.dtlsTransport);
    return transceiver.rtpSender;
  };

  RTCPeerConnection.prototype.addStream = function(stream) {
    var pc = this;
    if (edgeVersion >= 15025) {
      stream.getTracks().forEach(function(track) {
        pc.addTrack(track, stream);
      });
    } else {
      // Clone is necessary for local demos mostly, attaching directly
      // to two different senders does not work (build 10547).
      // Fixed in 15025 (or earlier)
      var clonedStream = stream.clone();
      stream.getTracks().forEach(function(track, idx) {
        var clonedTrack = clonedStream.getTracks()[idx];
        track.addEventListener('enabled', function(event) {
          clonedTrack.enabled = event.enabled;
        });
      });
      clonedStream.getTracks().forEach(function(track) {
        pc.addTrack(track, clonedStream);
      });
    }
  };

  RTCPeerConnection.prototype.removeTrack = function(sender) {
    if (this._isClosed) {
      throw makeError('InvalidStateError',
          'Attempted to call removeTrack on a closed peerconnection.');
    }

    if (!(sender instanceof window.RTCRtpSender)) {
      throw new TypeError('Argument 1 of RTCPeerConnection.removeTrack ' +
          'does not implement interface RTCRtpSender.');
    }

    var transceiver = this.transceivers.find(function(t) {
      return t.rtpSender === sender;
    });

    if (!transceiver) {
      throw makeError('InvalidAccessError',
          'Sender was not created by this connection.');
    }
    var stream = transceiver.stream;

    transceiver.rtpSender.stop();
    transceiver.rtpSender = null;
    transceiver.track = null;
    transceiver.stream = null;

    // remove the stream from the set of local streams
    var localStreams = this.transceivers.map(function(t) {
      return t.stream;
    });
    if (localStreams.indexOf(stream) === -1 &&
        this.localStreams.indexOf(stream) > -1) {
      this.localStreams.splice(this.localStreams.indexOf(stream), 1);
    }

    this._maybeFireNegotiationNeeded();
  };

  RTCPeerConnection.prototype.removeStream = function(stream) {
    var pc = this;
    stream.getTracks().forEach(function(track) {
      var sender = pc.getSenders().find(function(s) {
        return s.track === track;
      });
      if (sender) {
        pc.removeTrack(sender);
      }
    });
  };

  RTCPeerConnection.prototype.getSenders = function() {
    return this.transceivers.filter(function(transceiver) {
      return !!transceiver.rtpSender;
    })
    .map(function(transceiver) {
      return transceiver.rtpSender;
    });
  };

  RTCPeerConnection.prototype.getReceivers = function() {
    return this.transceivers.filter(function(transceiver) {
      return !!transceiver.rtpReceiver;
    })
    .map(function(transceiver) {
      return transceiver.rtpReceiver;
    });
  };


  RTCPeerConnection.prototype._createIceGatherer = function(sdpMLineIndex,
      usingBundle) {
    var pc = this;
    if (usingBundle && sdpMLineIndex > 0) {
      return this.transceivers[0].iceGatherer;
    } else if (this._iceGatherers.length) {
      return this._iceGatherers.shift();
    }
    var iceGatherer = new window.RTCIceGatherer({
      iceServers: this._config.iceServers,
      gatherPolicy: this._config.iceTransportPolicy
    });
    Object.defineProperty(iceGatherer, 'state',
        {value: 'new', writable: true}
    );

    this.transceivers[sdpMLineIndex].bufferedCandidateEvents = [];
    this.transceivers[sdpMLineIndex].bufferCandidates = function(event) {
      var end = !event.candidate || Object.keys(event.candidate).length === 0;
      // polyfill since RTCIceGatherer.state is not implemented in
      // Edge 10547 yet.
      iceGatherer.state = end ? 'completed' : 'gathering';
      if (pc.transceivers[sdpMLineIndex].bufferedCandidateEvents !== null) {
        pc.transceivers[sdpMLineIndex].bufferedCandidateEvents.push(event);
      }
    };
    iceGatherer.addEventListener('localcandidate',
      this.transceivers[sdpMLineIndex].bufferCandidates);
    return iceGatherer;
  };

  // start gathering from an RTCIceGatherer.
  RTCPeerConnection.prototype._gather = function(mid, sdpMLineIndex) {
    var pc = this;
    var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer.onlocalcandidate) {
      return;
    }
    var bufferedCandidateEvents =
      this.transceivers[sdpMLineIndex].bufferedCandidateEvents;
    this.transceivers[sdpMLineIndex].bufferedCandidateEvents = null;
    iceGatherer.removeEventListener('localcandidate',
      this.transceivers[sdpMLineIndex].bufferCandidates);
    iceGatherer.onlocalcandidate = function(evt) {
      if (pc.usingBundle && sdpMLineIndex > 0) {
        // if we know that we use bundle we can drop candidates with
        // ѕdpMLineIndex > 0. If we don't do this then our state gets
        // confused since we dispose the extra ice gatherer.
        return;
      }
      var event = new Event('icecandidate');
      event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};

      var cand = evt.candidate;
      // Edge emits an empty object for RTCIceCandidateComplete‥
      var end = !cand || Object.keys(cand).length === 0;
      if (end) {
        // polyfill since RTCIceGatherer.state is not implemented in
        // Edge 10547 yet.
        if (iceGatherer.state === 'new' || iceGatherer.state === 'gathering') {
          iceGatherer.state = 'completed';
        }
      } else {
        if (iceGatherer.state === 'new') {
          iceGatherer.state = 'gathering';
        }
        // RTCIceCandidate doesn't have a component, needs to be added
        cand.component = 1;
        // also the usernameFragment. TODO: update SDP to take both variants.
        cand.ufrag = iceGatherer.getLocalParameters().usernameFragment;

        var serializedCandidate = SDPUtils.writeCandidate(cand);
        event.candidate = Object.assign(event.candidate,
            SDPUtils.parseCandidate(serializedCandidate));

        event.candidate.candidate = serializedCandidate;
        event.candidate.toJSON = function() {
          return {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            usernameFragment: event.candidate.usernameFragment
          };
        };
      }

      // update local description.
      var sections = SDPUtils.getMediaSections(pc._localDescription.sdp);
      if (!end) {
        sections[event.candidate.sdpMLineIndex] +=
            'a=' + event.candidate.candidate + '\r\n';
      } else {
        sections[event.candidate.sdpMLineIndex] +=
            'a=end-of-candidates\r\n';
      }
      pc._localDescription.sdp =
          SDPUtils.getDescription(pc._localDescription.sdp) +
          sections.join('');
      var complete = pc.transceivers.every(function(transceiver) {
        return transceiver.iceGatherer &&
            transceiver.iceGatherer.state === 'completed';
      });

      if (pc.iceGatheringState !== 'gathering') {
        pc.iceGatheringState = 'gathering';
        pc._emitGatheringStateChange();
      }

      // Emit candidate. Also emit null candidate when all gatherers are
      // complete.
      if (!end) {
        pc._dispatchEvent('icecandidate', event);
      }
      if (complete) {
        pc._dispatchEvent('icecandidate', new Event('icecandidate'));
        pc.iceGatheringState = 'complete';
        pc._emitGatheringStateChange();
      }
    };

    // emit already gathered candidates.
    window.setTimeout(function() {
      bufferedCandidateEvents.forEach(function(e) {
        iceGatherer.onlocalcandidate(e);
      });
    }, 0);
  };

  // Create ICE transport and DTLS transport.
  RTCPeerConnection.prototype._createIceAndDtlsTransports = function() {
    var pc = this;
    var iceTransport = new window.RTCIceTransport(null);
    iceTransport.onicestatechange = function() {
      pc._updateIceConnectionState();
      pc._updateConnectionState();
    };

    var dtlsTransport = new window.RTCDtlsTransport(iceTransport);
    dtlsTransport.ondtlsstatechange = function() {
      pc._updateConnectionState();
    };
    dtlsTransport.onerror = function() {
      // onerror does not set state to failed by itself.
      Object.defineProperty(dtlsTransport, 'state',
          {value: 'failed', writable: true});
      pc._updateConnectionState();
    };

    return {
      iceTransport: iceTransport,
      dtlsTransport: dtlsTransport
    };
  };

  // Destroy ICE gatherer, ICE transport and DTLS transport.
  // Without triggering the callbacks.
  RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function(
      sdpMLineIndex) {
    var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer) {
      delete iceGatherer.onlocalcandidate;
      delete this.transceivers[sdpMLineIndex].iceGatherer;
    }
    var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
    if (iceTransport) {
      delete iceTransport.onicestatechange;
      delete this.transceivers[sdpMLineIndex].iceTransport;
    }
    var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
    if (dtlsTransport) {
      delete dtlsTransport.ondtlsstatechange;
      delete dtlsTransport.onerror;
      delete this.transceivers[sdpMLineIndex].dtlsTransport;
    }
  };

  // Start the RTP Sender and Receiver for a transceiver.
  RTCPeerConnection.prototype._transceive = function(transceiver,
      send, recv) {
    var params = getCommonCapabilities(transceiver.localCapabilities,
        transceiver.remoteCapabilities);
    if (send && transceiver.rtpSender) {
      params.encodings = transceiver.sendEncodingParameters;
      params.rtcp = {
        cname: SDPUtils.localCName,
        compound: transceiver.rtcpParameters.compound
      };
      if (transceiver.recvEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
      }
      transceiver.rtpSender.send(params);
    }
    if (recv && transceiver.rtpReceiver && params.codecs.length > 0) {
      // remove RTX field in Edge 14942
      if (transceiver.kind === 'video'
          && transceiver.recvEncodingParameters
          && edgeVersion < 15019) {
        transceiver.recvEncodingParameters.forEach(function(p) {
          delete p.rtx;
        });
      }
      if (transceiver.recvEncodingParameters.length) {
        params.encodings = transceiver.recvEncodingParameters;
      } else {
        params.encodings = [{}];
      }
      params.rtcp = {
        compound: transceiver.rtcpParameters.compound
      };
      if (transceiver.rtcpParameters.cname) {
        params.rtcp.cname = transceiver.rtcpParameters.cname;
      }
      if (transceiver.sendEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
      }
      transceiver.rtpReceiver.receive(params);
    }
  };

  RTCPeerConnection.prototype.setLocalDescription = function(description) {
    var pc = this;

    // Note: pranswer is not supported.
    if (['offer', 'answer'].indexOf(description.type) === -1) {
      return Promise.reject(makeError('TypeError',
          'Unsupported type "' + description.type + '"'));
    }

    if (!isActionAllowedInSignalingState('setLocalDescription',
        description.type, pc.signalingState) || pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not set local ' + description.type +
          ' in state ' + pc.signalingState));
    }

    var sections;
    var sessionpart;
    if (description.type === 'offer') {
      // VERY limited support for SDP munging. Limited to:
      // * changing the order of codecs
      sections = SDPUtils.splitSections(description.sdp);
      sessionpart = sections.shift();
      sections.forEach(function(mediaSection, sdpMLineIndex) {
        var caps = SDPUtils.parseRtpParameters(mediaSection);
        pc.transceivers[sdpMLineIndex].localCapabilities = caps;
      });

      pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
        pc._gather(transceiver.mid, sdpMLineIndex);
      });
    } else if (description.type === 'answer') {
      sections = SDPUtils.splitSections(pc._remoteDescription.sdp);
      sessionpart = sections.shift();
      var isIceLite = SDPUtils.matchPrefix(sessionpart,
          'a=ice-lite').length > 0;
      sections.forEach(function(mediaSection, sdpMLineIndex) {
        var transceiver = pc.transceivers[sdpMLineIndex];
        var iceGatherer = transceiver.iceGatherer;
        var iceTransport = transceiver.iceTransport;
        var dtlsTransport = transceiver.dtlsTransport;
        var localCapabilities = transceiver.localCapabilities;
        var remoteCapabilities = transceiver.remoteCapabilities;

        // treat bundle-only as not-rejected.
        var rejected = SDPUtils.isRejected(mediaSection) &&
            SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;

        if (!rejected && !transceiver.rejected) {
          var remoteIceParameters = SDPUtils.getIceParameters(
              mediaSection, sessionpart);
          var remoteDtlsParameters = SDPUtils.getDtlsParameters(
              mediaSection, sessionpart);
          if (isIceLite) {
            remoteDtlsParameters.role = 'server';
          }

          if (!pc.usingBundle || sdpMLineIndex === 0) {
            pc._gather(transceiver.mid, sdpMLineIndex);
            if (iceTransport.state === 'new') {
              iceTransport.start(iceGatherer, remoteIceParameters,
                  isIceLite ? 'controlling' : 'controlled');
            }
            if (dtlsTransport.state === 'new') {
              dtlsTransport.start(remoteDtlsParameters);
            }
          }

          // Calculate intersection of capabilities.
          var params = getCommonCapabilities(localCapabilities,
              remoteCapabilities);

          // Start the RTCRtpSender. The RTCRtpReceiver for this
          // transceiver has already been started in setRemoteDescription.
          pc._transceive(transceiver,
              params.codecs.length > 0,
              false);
        }
      });
    }

    pc._localDescription = {
      type: description.type,
      sdp: description.sdp
    };
    if (description.type === 'offer') {
      pc._updateSignalingState('have-local-offer');
    } else {
      pc._updateSignalingState('stable');
    }

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.setRemoteDescription = function(description) {
    var pc = this;

    // Note: pranswer is not supported.
    if (['offer', 'answer'].indexOf(description.type) === -1) {
      return Promise.reject(makeError('TypeError',
          'Unsupported type "' + description.type + '"'));
    }

    if (!isActionAllowedInSignalingState('setRemoteDescription',
        description.type, pc.signalingState) || pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not set remote ' + description.type +
          ' in state ' + pc.signalingState));
    }

    var streams = {};
    pc.remoteStreams.forEach(function(stream) {
      streams[stream.id] = stream;
    });
    var receiverList = [];
    var sections = SDPUtils.splitSections(description.sdp);
    var sessionpart = sections.shift();
    var isIceLite = SDPUtils.matchPrefix(sessionpart,
        'a=ice-lite').length > 0;
    var usingBundle = SDPUtils.matchPrefix(sessionpart,
        'a=group:BUNDLE ').length > 0;
    pc.usingBundle = usingBundle;
    var iceOptions = SDPUtils.matchPrefix(sessionpart,
        'a=ice-options:')[0];
    if (iceOptions) {
      pc.canTrickleIceCandidates = iceOptions.substr(14).split(' ')
          .indexOf('trickle') >= 0;
    } else {
      pc.canTrickleIceCandidates = false;
    }

    sections.forEach(function(mediaSection, sdpMLineIndex) {
      var lines = SDPUtils.splitLines(mediaSection);
      var kind = SDPUtils.getKind(mediaSection);
      // treat bundle-only as not-rejected.
      var rejected = SDPUtils.isRejected(mediaSection) &&
          SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;
      var protocol = lines[0].substr(2).split(' ')[2];

      var direction = SDPUtils.getDirection(mediaSection, sessionpart);
      var remoteMsid = SDPUtils.parseMsid(mediaSection);

      var mid = SDPUtils.getMid(mediaSection) || SDPUtils.generateIdentifier();

      // Reject datachannels which are not implemented yet.
      if (rejected || (kind === 'application' && (protocol === 'DTLS/SCTP' ||
          protocol === 'UDP/DTLS/SCTP'))) {
        // TODO: this is dangerous in the case where a non-rejected m-line
        //     becomes rejected.
        pc.transceivers[sdpMLineIndex] = {
          mid: mid,
          kind: kind,
          protocol: protocol,
          rejected: true
        };
        return;
      }

      if (!rejected && pc.transceivers[sdpMLineIndex] &&
          pc.transceivers[sdpMLineIndex].rejected) {
        // recycle a rejected transceiver.
        pc.transceivers[sdpMLineIndex] = pc._createTransceiver(kind, true);
      }

      var transceiver;
      var iceGatherer;
      var iceTransport;
      var dtlsTransport;
      var rtpReceiver;
      var sendEncodingParameters;
      var recvEncodingParameters;
      var localCapabilities;

      var track;
      // FIXME: ensure the mediaSection has rtcp-mux set.
      var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
      var remoteIceParameters;
      var remoteDtlsParameters;
      if (!rejected) {
        remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
            sessionpart);
        remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
            sessionpart);
        remoteDtlsParameters.role = 'client';
      }
      recvEncodingParameters =
          SDPUtils.parseRtpEncodingParameters(mediaSection);

      var rtcpParameters = SDPUtils.parseRtcpParameters(mediaSection);

      var isComplete = SDPUtils.matchPrefix(mediaSection,
          'a=end-of-candidates', sessionpart).length > 0;
      var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
          .map(function(cand) {
            return SDPUtils.parseCandidate(cand);
          })
          .filter(function(cand) {
            return cand.component === 1;
          });

      // Check if we can use BUNDLE and dispose transports.
      if ((description.type === 'offer' || description.type === 'answer') &&
          !rejected && usingBundle && sdpMLineIndex > 0 &&
          pc.transceivers[sdpMLineIndex]) {
        pc._disposeIceAndDtlsTransports(sdpMLineIndex);
        pc.transceivers[sdpMLineIndex].iceGatherer =
            pc.transceivers[0].iceGatherer;
        pc.transceivers[sdpMLineIndex].iceTransport =
            pc.transceivers[0].iceTransport;
        pc.transceivers[sdpMLineIndex].dtlsTransport =
            pc.transceivers[0].dtlsTransport;
        if (pc.transceivers[sdpMLineIndex].rtpSender) {
          pc.transceivers[sdpMLineIndex].rtpSender.setTransport(
              pc.transceivers[0].dtlsTransport);
        }
        if (pc.transceivers[sdpMLineIndex].rtpReceiver) {
          pc.transceivers[sdpMLineIndex].rtpReceiver.setTransport(
              pc.transceivers[0].dtlsTransport);
        }
      }
      if (description.type === 'offer' && !rejected) {
        transceiver = pc.transceivers[sdpMLineIndex] ||
            pc._createTransceiver(kind);
        transceiver.mid = mid;

        if (!transceiver.iceGatherer) {
          transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
              usingBundle);
        }

        if (cands.length && transceiver.iceTransport.state === 'new') {
          if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
            transceiver.iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function(candidate) {
              maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        localCapabilities = window.RTCRtpReceiver.getCapabilities(kind);

        // filter RTX until additional stuff needed for RTX is implemented
        // in adapter.js
        if (edgeVersion < 15019) {
          localCapabilities.codecs = localCapabilities.codecs.filter(
              function(codec) {
                return codec.name !== 'rtx';
              });
        }

        sendEncodingParameters = transceiver.sendEncodingParameters || [{
          ssrc: (2 * sdpMLineIndex + 2) * 1001
        }];

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        var isNewTrack = false;
        if (direction === 'sendrecv' || direction === 'sendonly') {
          isNewTrack = !transceiver.rtpReceiver;
          rtpReceiver = transceiver.rtpReceiver ||
              new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);

          if (isNewTrack) {
            var stream;
            track = rtpReceiver.track;
            // FIXME: does not work with Plan B.
            if (remoteMsid && remoteMsid.stream === '-') {
              // no-op. a stream id of '-' means: no associated stream.
            } else if (remoteMsid) {
              if (!streams[remoteMsid.stream]) {
                streams[remoteMsid.stream] = new window.MediaStream();
                Object.defineProperty(streams[remoteMsid.stream], 'id', {
                  get: function() {
                    return remoteMsid.stream;
                  }
                });
              }
              Object.defineProperty(track, 'id', {
                get: function() {
                  return remoteMsid.track;
                }
              });
              stream = streams[remoteMsid.stream];
            } else {
              if (!streams.default) {
                streams.default = new window.MediaStream();
              }
              stream = streams.default;
            }
            if (stream) {
              addTrackToStreamAndFireEvent(track, stream);
              transceiver.associatedRemoteMediaStreams.push(stream);
            }
            receiverList.push([track, rtpReceiver, stream]);
          }
        } else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track) {
          transceiver.associatedRemoteMediaStreams.forEach(function(s) {
            var nativeTrack = s.getTracks().find(function(t) {
              return t.id === transceiver.rtpReceiver.track.id;
            });
            if (nativeTrack) {
              removeTrackFromStreamAndFireEvent(nativeTrack, s);
            }
          });
          transceiver.associatedRemoteMediaStreams = [];
        }

        transceiver.localCapabilities = localCapabilities;
        transceiver.remoteCapabilities = remoteCapabilities;
        transceiver.rtpReceiver = rtpReceiver;
        transceiver.rtcpParameters = rtcpParameters;
        transceiver.sendEncodingParameters = sendEncodingParameters;
        transceiver.recvEncodingParameters = recvEncodingParameters;

        // Start the RTCRtpReceiver now. The RTPSender is started in
        // setLocalDescription.
        pc._transceive(pc.transceivers[sdpMLineIndex],
            false,
            isNewTrack);
      } else if (description.type === 'answer' && !rejected) {
        transceiver = pc.transceivers[sdpMLineIndex];
        iceGatherer = transceiver.iceGatherer;
        iceTransport = transceiver.iceTransport;
        dtlsTransport = transceiver.dtlsTransport;
        rtpReceiver = transceiver.rtpReceiver;
        sendEncodingParameters = transceiver.sendEncodingParameters;
        localCapabilities = transceiver.localCapabilities;

        pc.transceivers[sdpMLineIndex].recvEncodingParameters =
            recvEncodingParameters;
        pc.transceivers[sdpMLineIndex].remoteCapabilities =
            remoteCapabilities;
        pc.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;

        if (cands.length && iceTransport.state === 'new') {
          if ((isIceLite || isComplete) &&
              (!usingBundle || sdpMLineIndex === 0)) {
            iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function(candidate) {
              maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        if (!usingBundle || sdpMLineIndex === 0) {
          if (iceTransport.state === 'new') {
            iceTransport.start(iceGatherer, remoteIceParameters,
                'controlling');
          }
          if (dtlsTransport.state === 'new') {
            dtlsTransport.start(remoteDtlsParameters);
          }
        }

        // If the offer contained RTX but the answer did not,
        // remove RTX from sendEncodingParameters.
        var commonCapabilities = getCommonCapabilities(
          transceiver.localCapabilities,
          transceiver.remoteCapabilities);

        var hasRtx = commonCapabilities.codecs.filter(function(c) {
          return c.name.toLowerCase() === 'rtx';
        }).length;
        if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
          delete transceiver.sendEncodingParameters[0].rtx;
        }

        pc._transceive(transceiver,
            direction === 'sendrecv' || direction === 'recvonly',
            direction === 'sendrecv' || direction === 'sendonly');

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        if (rtpReceiver &&
            (direction === 'sendrecv' || direction === 'sendonly')) {
          track = rtpReceiver.track;
          if (remoteMsid) {
            if (!streams[remoteMsid.stream]) {
              streams[remoteMsid.stream] = new window.MediaStream();
            }
            addTrackToStreamAndFireEvent(track, streams[remoteMsid.stream]);
            receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
          } else {
            if (!streams.default) {
              streams.default = new window.MediaStream();
            }
            addTrackToStreamAndFireEvent(track, streams.default);
            receiverList.push([track, rtpReceiver, streams.default]);
          }
        } else {
          // FIXME: actually the receiver should be created later.
          delete transceiver.rtpReceiver;
        }
      }
    });

    if (pc._dtlsRole === undefined) {
      pc._dtlsRole = description.type === 'offer' ? 'active' : 'passive';
    }

    pc._remoteDescription = {
      type: description.type,
      sdp: description.sdp
    };
    if (description.type === 'offer') {
      pc._updateSignalingState('have-remote-offer');
    } else {
      pc._updateSignalingState('stable');
    }
    Object.keys(streams).forEach(function(sid) {
      var stream = streams[sid];
      if (stream.getTracks().length) {
        if (pc.remoteStreams.indexOf(stream) === -1) {
          pc.remoteStreams.push(stream);
          var event = new Event('addstream');
          event.stream = stream;
          window.setTimeout(function() {
            pc._dispatchEvent('addstream', event);
          });
        }

        receiverList.forEach(function(item) {
          var track = item[0];
          var receiver = item[1];
          if (stream.id !== item[2].id) {
            return;
          }
          fireAddTrack(pc, track, receiver, [stream]);
        });
      }
    });
    receiverList.forEach(function(item) {
      if (item[2]) {
        return;
      }
      fireAddTrack(pc, item[0], item[1], []);
    });

    // check whether addIceCandidate({}) was called within four seconds after
    // setRemoteDescription.
    window.setTimeout(function() {
      if (!(pc && pc.transceivers)) {
        return;
      }
      pc.transceivers.forEach(function(transceiver) {
        if (transceiver.iceTransport &&
            transceiver.iceTransport.state === 'new' &&
            transceiver.iceTransport.getRemoteCandidates().length > 0) {
          console.warn('Timeout for addRemoteCandidate. Consider sending ' +
              'an end-of-candidates notification');
          transceiver.iceTransport.addRemoteCandidate({});
        }
      });
    }, 4000);

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.close = function() {
    this.transceivers.forEach(function(transceiver) {
      /* not yet
      if (transceiver.iceGatherer) {
        transceiver.iceGatherer.close();
      }
      */
      if (transceiver.iceTransport) {
        transceiver.iceTransport.stop();
      }
      if (transceiver.dtlsTransport) {
        transceiver.dtlsTransport.stop();
      }
      if (transceiver.rtpSender) {
        transceiver.rtpSender.stop();
      }
      if (transceiver.rtpReceiver) {
        transceiver.rtpReceiver.stop();
      }
    });
    // FIXME: clean up tracks, local streams, remote streams, etc
    this._isClosed = true;
    this._updateSignalingState('closed');
  };

  // Update the signaling state.
  RTCPeerConnection.prototype._updateSignalingState = function(newState) {
    this.signalingState = newState;
    var event = new Event('signalingstatechange');
    this._dispatchEvent('signalingstatechange', event);
  };

  // Determine whether to fire the negotiationneeded event.
  RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function() {
    var pc = this;
    if (this.signalingState !== 'stable' || this.needNegotiation === true) {
      return;
    }
    this.needNegotiation = true;
    window.setTimeout(function() {
      if (pc.needNegotiation) {
        pc.needNegotiation = false;
        var event = new Event('negotiationneeded');
        pc._dispatchEvent('negotiationneeded', event);
      }
    }, 0);
  };

  // Update the ice connection state.
  RTCPeerConnection.prototype._updateIceConnectionState = function() {
    var newState;
    var states = {
      'new': 0,
      closed: 0,
      checking: 0,
      connected: 0,
      completed: 0,
      disconnected: 0,
      failed: 0
    };
    this.transceivers.forEach(function(transceiver) {
      states[transceiver.iceTransport.state]++;
    });

    newState = 'new';
    if (states.failed > 0) {
      newState = 'failed';
    } else if (states.checking > 0) {
      newState = 'checking';
    } else if (states.disconnected > 0) {
      newState = 'disconnected';
    } else if (states.new > 0) {
      newState = 'new';
    } else if (states.connected > 0) {
      newState = 'connected';
    } else if (states.completed > 0) {
      newState = 'completed';
    }

    if (newState !== this.iceConnectionState) {
      this.iceConnectionState = newState;
      var event = new Event('iceconnectionstatechange');
      this._dispatchEvent('iceconnectionstatechange', event);
    }
  };

  // Update the connection state.
  RTCPeerConnection.prototype._updateConnectionState = function() {
    var newState;
    var states = {
      'new': 0,
      closed: 0,
      connecting: 0,
      connected: 0,
      completed: 0,
      disconnected: 0,
      failed: 0
    };
    this.transceivers.forEach(function(transceiver) {
      states[transceiver.iceTransport.state]++;
      states[transceiver.dtlsTransport.state]++;
    });
    // ICETransport.completed and connected are the same for this purpose.
    states.connected += states.completed;

    newState = 'new';
    if (states.failed > 0) {
      newState = 'failed';
    } else if (states.connecting > 0) {
      newState = 'connecting';
    } else if (states.disconnected > 0) {
      newState = 'disconnected';
    } else if (states.new > 0) {
      newState = 'new';
    } else if (states.connected > 0) {
      newState = 'connected';
    }

    if (newState !== this.connectionState) {
      this.connectionState = newState;
      var event = new Event('connectionstatechange');
      this._dispatchEvent('connectionstatechange', event);
    }
  };

  RTCPeerConnection.prototype.createOffer = function() {
    var pc = this;

    if (pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createOffer after close'));
    }

    var numAudioTracks = pc.transceivers.filter(function(t) {
      return t.kind === 'audio';
    }).length;
    var numVideoTracks = pc.transceivers.filter(function(t) {
      return t.kind === 'video';
    }).length;

    // Determine number of audio and video tracks we need to send/recv.
    var offerOptions = arguments[0];
    if (offerOptions) {
      // Reject Chrome legacy constraints.
      if (offerOptions.mandatory || offerOptions.optional) {
        throw new TypeError(
            'Legacy mandatory/optional constraints not supported.');
      }
      if (offerOptions.offerToReceiveAudio !== undefined) {
        if (offerOptions.offerToReceiveAudio === true) {
          numAudioTracks = 1;
        } else if (offerOptions.offerToReceiveAudio === false) {
          numAudioTracks = 0;
        } else {
          numAudioTracks = offerOptions.offerToReceiveAudio;
        }
      }
      if (offerOptions.offerToReceiveVideo !== undefined) {
        if (offerOptions.offerToReceiveVideo === true) {
          numVideoTracks = 1;
        } else if (offerOptions.offerToReceiveVideo === false) {
          numVideoTracks = 0;
        } else {
          numVideoTracks = offerOptions.offerToReceiveVideo;
        }
      }
    }

    pc.transceivers.forEach(function(transceiver) {
      if (transceiver.kind === 'audio') {
        numAudioTracks--;
        if (numAudioTracks < 0) {
          transceiver.wantReceive = false;
        }
      } else if (transceiver.kind === 'video') {
        numVideoTracks--;
        if (numVideoTracks < 0) {
          transceiver.wantReceive = false;
        }
      }
    });

    // Create M-lines for recvonly streams.
    while (numAudioTracks > 0 || numVideoTracks > 0) {
      if (numAudioTracks > 0) {
        pc._createTransceiver('audio');
        numAudioTracks--;
      }
      if (numVideoTracks > 0) {
        pc._createTransceiver('video');
        numVideoTracks--;
      }
    }

    var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
        pc._sdpSessionVersion++);
    pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      // For each track, create an ice gatherer, ice transport,
      // dtls transport, potentially rtpsender and rtpreceiver.
      var track = transceiver.track;
      var kind = transceiver.kind;
      var mid = transceiver.mid || SDPUtils.generateIdentifier();
      transceiver.mid = mid;

      if (!transceiver.iceGatherer) {
        transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
            pc.usingBundle);
      }

      var localCapabilities = window.RTCRtpSender.getCapabilities(kind);
      // filter RTX until additional stuff needed for RTX is implemented
      // in adapter.js
      if (edgeVersion < 15019) {
        localCapabilities.codecs = localCapabilities.codecs.filter(
            function(codec) {
              return codec.name !== 'rtx';
            });
      }
      localCapabilities.codecs.forEach(function(codec) {
        // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
        // by adding level-asymmetry-allowed=1
        if (codec.name === 'H264' &&
            codec.parameters['level-asymmetry-allowed'] === undefined) {
          codec.parameters['level-asymmetry-allowed'] = '1';
        }

        // for subsequent offers, we might have to re-use the payload
        // type of the last offer.
        if (transceiver.remoteCapabilities &&
            transceiver.remoteCapabilities.codecs) {
          transceiver.remoteCapabilities.codecs.forEach(function(remoteCodec) {
            if (codec.name.toLowerCase() === remoteCodec.name.toLowerCase() &&
                codec.clockRate === remoteCodec.clockRate) {
              codec.preferredPayloadType = remoteCodec.payloadType;
            }
          });
        }
      });
      localCapabilities.headerExtensions.forEach(function(hdrExt) {
        var remoteExtensions = transceiver.remoteCapabilities &&
            transceiver.remoteCapabilities.headerExtensions || [];
        remoteExtensions.forEach(function(rHdrExt) {
          if (hdrExt.uri === rHdrExt.uri) {
            hdrExt.id = rHdrExt.id;
          }
        });
      });

      // generate an ssrc now, to be used later in rtpSender.send
      var sendEncodingParameters = transceiver.sendEncodingParameters || [{
        ssrc: (2 * sdpMLineIndex + 1) * 1001
      }];
      if (track) {
        // add RTX
        if (edgeVersion >= 15019 && kind === 'video' &&
            !sendEncodingParameters[0].rtx) {
          sendEncodingParameters[0].rtx = {
            ssrc: sendEncodingParameters[0].ssrc + 1
          };
        }
      }

      if (transceiver.wantReceive) {
        transceiver.rtpReceiver = new window.RTCRtpReceiver(
            transceiver.dtlsTransport, kind);
      }

      transceiver.localCapabilities = localCapabilities;
      transceiver.sendEncodingParameters = sendEncodingParameters;
    });

    // always offer BUNDLE and dispose on return if not supported.
    if (pc._config.bundlePolicy !== 'max-compat') {
      sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function(t) {
        return t.mid;
      }).join(' ') + '\r\n';
    }
    sdp += 'a=ice-options:trickle\r\n';

    pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      sdp += writeMediaSection(transceiver, transceiver.localCapabilities,
          'offer', transceiver.stream, pc._dtlsRole);
      sdp += 'a=rtcp-rsize\r\n';

      if (transceiver.iceGatherer && pc.iceGatheringState !== 'new' &&
          (sdpMLineIndex === 0 || !pc.usingBundle)) {
        transceiver.iceGatherer.getLocalCandidates().forEach(function(cand) {
          cand.component = 1;
          sdp += 'a=' + SDPUtils.writeCandidate(cand) + '\r\n';
        });

        if (transceiver.iceGatherer.state === 'completed') {
          sdp += 'a=end-of-candidates\r\n';
        }
      }
    });

    var desc = new window.RTCSessionDescription({
      type: 'offer',
      sdp: sdp
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.createAnswer = function() {
    var pc = this;

    if (pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createAnswer after close'));
    }

    if (!(pc.signalingState === 'have-remote-offer' ||
        pc.signalingState === 'have-local-pranswer')) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createAnswer in signalingState ' + pc.signalingState));
    }

    var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
        pc._sdpSessionVersion++);
    if (pc.usingBundle) {
      sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function(t) {
        return t.mid;
      }).join(' ') + '\r\n';
    }
    sdp += 'a=ice-options:trickle\r\n';

    var mediaSectionsInOffer = SDPUtils.getMediaSections(
        pc._remoteDescription.sdp).length;
    pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      if (sdpMLineIndex + 1 > mediaSectionsInOffer) {
        return;
      }
      if (transceiver.rejected) {
        if (transceiver.kind === 'application') {
          if (transceiver.protocol === 'DTLS/SCTP') { // legacy fmt
            sdp += 'm=application 0 DTLS/SCTP 5000\r\n';
          } else {
            sdp += 'm=application 0 ' + transceiver.protocol +
                ' webrtc-datachannel\r\n';
          }
        } else if (transceiver.kind === 'audio') {
          sdp += 'm=audio 0 UDP/TLS/RTP/SAVPF 0\r\n' +
              'a=rtpmap:0 PCMU/8000\r\n';
        } else if (transceiver.kind === 'video') {
          sdp += 'm=video 0 UDP/TLS/RTP/SAVPF 120\r\n' +
              'a=rtpmap:120 VP8/90000\r\n';
        }
        sdp += 'c=IN IP4 0.0.0.0\r\n' +
            'a=inactive\r\n' +
            'a=mid:' + transceiver.mid + '\r\n';
        return;
      }

      // FIXME: look at direction.
      if (transceiver.stream) {
        var localTrack;
        if (transceiver.kind === 'audio') {
          localTrack = transceiver.stream.getAudioTracks()[0];
        } else if (transceiver.kind === 'video') {
          localTrack = transceiver.stream.getVideoTracks()[0];
        }
        if (localTrack) {
          // add RTX
          if (edgeVersion >= 15019 && transceiver.kind === 'video' &&
              !transceiver.sendEncodingParameters[0].rtx) {
            transceiver.sendEncodingParameters[0].rtx = {
              ssrc: transceiver.sendEncodingParameters[0].ssrc + 1
            };
          }
        }
      }

      // Calculate intersection of capabilities.
      var commonCapabilities = getCommonCapabilities(
          transceiver.localCapabilities,
          transceiver.remoteCapabilities);

      var hasRtx = commonCapabilities.codecs.filter(function(c) {
        return c.name.toLowerCase() === 'rtx';
      }).length;
      if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
        delete transceiver.sendEncodingParameters[0].rtx;
      }

      sdp += writeMediaSection(transceiver, commonCapabilities,
          'answer', transceiver.stream, pc._dtlsRole);
      if (transceiver.rtcpParameters &&
          transceiver.rtcpParameters.reducedSize) {
        sdp += 'a=rtcp-rsize\r\n';
      }
    });

    var desc = new window.RTCSessionDescription({
      type: 'answer',
      sdp: sdp
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
    var pc = this;
    var sections;
    if (candidate && !(candidate.sdpMLineIndex !== undefined ||
        candidate.sdpMid)) {
      return Promise.reject(new TypeError('sdpMLineIndex or sdpMid required'));
    }

    // TODO: needs to go into ops queue.
    return new Promise(function(resolve, reject) {
      if (!pc._remoteDescription) {
        return reject(makeError('InvalidStateError',
            'Can not add ICE candidate without a remote description'));
      } else if (!candidate || candidate.candidate === '') {
        for (var j = 0; j < pc.transceivers.length; j++) {
          if (pc.transceivers[j].rejected) {
            continue;
          }
          pc.transceivers[j].iceTransport.addRemoteCandidate({});
          sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
          sections[j] += 'a=end-of-candidates\r\n';
          pc._remoteDescription.sdp =
              SDPUtils.getDescription(pc._remoteDescription.sdp) +
              sections.join('');
          if (pc.usingBundle) {
            break;
          }
        }
      } else {
        var sdpMLineIndex = candidate.sdpMLineIndex;
        if (candidate.sdpMid) {
          for (var i = 0; i < pc.transceivers.length; i++) {
            if (pc.transceivers[i].mid === candidate.sdpMid) {
              sdpMLineIndex = i;
              break;
            }
          }
        }
        var transceiver = pc.transceivers[sdpMLineIndex];
        if (transceiver) {
          if (transceiver.rejected) {
            return resolve();
          }
          var cand = Object.keys(candidate.candidate).length > 0 ?
              SDPUtils.parseCandidate(candidate.candidate) : {};
          // Ignore Chrome's invalid candidates since Edge does not like them.
          if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
            return resolve();
          }
          // Ignore RTCP candidates, we assume RTCP-MUX.
          if (cand.component && cand.component !== 1) {
            return resolve();
          }
          // when using bundle, avoid adding candidates to the wrong
          // ice transport. And avoid adding candidates added in the SDP.
          if (sdpMLineIndex === 0 || (sdpMLineIndex > 0 &&
              transceiver.iceTransport !== pc.transceivers[0].iceTransport)) {
            if (!maybeAddCandidate(transceiver.iceTransport, cand)) {
              return reject(makeError('OperationError',
                  'Can not add ICE candidate'));
            }
          }

          // update the remoteDescription.
          var candidateString = candidate.candidate.trim();
          if (candidateString.indexOf('a=') === 0) {
            candidateString = candidateString.substr(2);
          }
          sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
          sections[sdpMLineIndex] += 'a=' +
              (cand.type ? candidateString : 'end-of-candidates')
              + '\r\n';
          pc._remoteDescription.sdp =
              SDPUtils.getDescription(pc._remoteDescription.sdp) +
              sections.join('');
        } else {
          return reject(makeError('OperationError',
              'Can not add ICE candidate'));
        }
      }
      resolve();
    });
  };

  RTCPeerConnection.prototype.getStats = function(selector) {
    if (selector && selector instanceof window.MediaStreamTrack) {
      var senderOrReceiver = null;
      this.transceivers.forEach(function(transceiver) {
        if (transceiver.rtpSender &&
            transceiver.rtpSender.track === selector) {
          senderOrReceiver = transceiver.rtpSender;
        } else if (transceiver.rtpReceiver &&
            transceiver.rtpReceiver.track === selector) {
          senderOrReceiver = transceiver.rtpReceiver;
        }
      });
      if (!senderOrReceiver) {
        throw makeError('InvalidAccessError', 'Invalid selector.');
      }
      return senderOrReceiver.getStats();
    }

    var promises = [];
    this.transceivers.forEach(function(transceiver) {
      ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
          'dtlsTransport'].forEach(function(method) {
            if (transceiver[method]) {
              promises.push(transceiver[method].getStats());
            }
          });
    });
    return Promise.all(promises).then(function(allStats) {
      var results = new Map();
      allStats.forEach(function(stats) {
        stats.forEach(function(stat) {
          results.set(stat.id, stat);
        });
      });
      return results;
    });
  };

  // fix low-level stat names and return Map instead of object.
  var ortcObjects = ['RTCRtpSender', 'RTCRtpReceiver', 'RTCIceGatherer',
    'RTCIceTransport', 'RTCDtlsTransport'];
  ortcObjects.forEach(function(ortcObjectName) {
    var obj = window[ortcObjectName];
    if (obj && obj.prototype && obj.prototype.getStats) {
      var nativeGetstats = obj.prototype.getStats;
      obj.prototype.getStats = function() {
        return nativeGetstats.apply(this)
        .then(function(nativeStats) {
          var mapStats = new Map();
          Object.keys(nativeStats).forEach(function(id) {
            nativeStats[id].type = fixStatsType(nativeStats[id]);
            mapStats.set(id, nativeStats[id]);
          });
          return mapStats;
        });
      };
    }
  });

  // legacy callback shims. Should be moved to adapter.js some days.
  var methods = ['createOffer', 'createAnswer'];
  methods.forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[0] === 'function' ||
          typeof args[1] === 'function') { // legacy
        return nativeMethod.apply(this, [arguments[2]])
        .then(function(description) {
          if (typeof args[0] === 'function') {
            args[0].apply(null, [description]);
          }
        }, function(error) {
          if (typeof args[1] === 'function') {
            args[1].apply(null, [error]);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  methods = ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'];
  methods.forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[1] === 'function' ||
          typeof args[2] === 'function') { // legacy
        return nativeMethod.apply(this, arguments)
        .then(function() {
          if (typeof args[1] === 'function') {
            args[1].apply(null);
          }
        }, function(error) {
          if (typeof args[2] === 'function') {
            args[2].apply(null, [error]);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  // getStats is special. It doesn't have a spec legacy method yet we support
  // getStats(something, cb) without error callbacks.
  ['getStats'].forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[1] === 'function') {
        return nativeMethod.apply(this, arguments)
        .then(function() {
          if (typeof args[1] === 'function') {
            args[1].apply(null);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  return RTCPeerConnection;
};

},{"sdp":5}],5:[function(require,module,exports){
 /* eslint-env node */
'use strict';

// SDP helpers.
var SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(function(line) {
    return line.trim();
  });
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  var parts = blob.split('\nm=');
  return parts.map(function(part, index) {
    return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
  });
};

// returns the session description.
SDPUtils.getDescription = function(blob) {
  var sections = SDPUtils.splitSections(blob);
  return sections && sections[0];
};

// returns the individual media sections.
SDPUtils.getMediaSections = function(blob) {
  var sections = SDPUtils.splitSections(blob);
  sections.shift();
  return sections;
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(function(line) {
    return line.indexOf(prefix) === 0;
  });
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
SDPUtils.parseCandidate = function(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ');
  } else {
    parts = line.substring(10).split(' ');
  }

  var candidate = {
    foundation: parts[0],
    component: parseInt(parts[1], 10),
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7]
  };

  for (var i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        candidate.relatedAddress = parts[i + 1];
        break;
      case 'rport':
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case 'tcptype':
        candidate.tcpType = parts[i + 1];
        break;
      case 'ufrag':
        candidate.ufrag = parts[i + 1]; // for backward compability.
        candidate.usernameFragment = parts[i + 1];
        break;
      default: // extension handling, in particular ufrag
        candidate[parts[i]] = parts[i + 1];
        break;
    }
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
SDPUtils.writeCandidate = function(candidate) {
  var sdp = [];
  sdp.push(candidate.foundation);
  sdp.push(candidate.component);
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.ip);
  sdp.push(candidate.port);

  var type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
      candidate.relatedPort) {
    sdp.push('raddr');
    sdp.push(candidate.relatedAddress);
    sdp.push('rport');
    sdp.push(candidate.relatedPort);
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
    sdp.push('tcptype');
    sdp.push(candidate.tcpType);
  }
  if (candidate.usernameFragment || candidate.ufrag) {
    sdp.push('ufrag');
    sdp.push(candidate.usernameFragment || candidate.ufrag);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an ice-options line, returns an array of option tags.
// a=ice-options:foo bar
SDPUtils.parseIceOptions = function(line) {
  return line.substr(14).split(' ');
};

// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  var parts = line.substr(9).split(' ');
  var parsed = {
    payloadType: parseInt(parts.shift(), 10) // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  // legacy alias, got renamed back to channels in ORTC.
  parsed.numChannels = parsed.channels;
  return parsed;
};

// Generate an a=rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  var channels = codec.channels || codec.numChannels || 1;
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
      (channels !== 1 ? '/' + channels : '') + '\r\n';
};

// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
// a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  var parts = line.substr(9).split(' ');
  return {
    id: parseInt(parts[0], 10),
    direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
    uri: parts[1]
  };
};

// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
      (headerExtension.direction && headerExtension.direction !== 'sendrecv'
          ? '/' + headerExtension.direction
          : '') +
      ' ' + headerExtension.uri + '\r\n';
};

// Parses an ftmp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  var parsed = {};
  var kv;
  var parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (var j = 0; j < parts.length; j++) {
    kv = parts[j].trim().split('=');
    parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  var line = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
    var params = [];
    Object.keys(codec.parameters).forEach(function(param) {
      if (codec.parameters[param]) {
        params.push(param + '=' + codec.parameters[param]);
      } else {
        params.push(param);
      }
    });
    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
    type: parts.shift(),
    parameter: parts.join(' ')
  };
};
// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  var lines = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
    // FIXME: special handling for trr-int?
    codec.rtcpFeedback.forEach(function(fb) {
      lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
      (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
          '\r\n';
    });
  }
  return lines;
};

// Parses an RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  var sp = line.indexOf(' ');
  var parts = {
    ssrc: parseInt(line.substr(7, sp - 7), 10)
  };
  var colon = line.indexOf(':', sp);
  if (colon > -1) {
    parts.attribute = line.substr(sp + 1, colon - sp - 1);
    parts.value = line.substr(colon + 1);
  } else {
    parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

SDPUtils.parseSsrcGroup = function(line) {
  var parts = line.substr(13).split(' ');
  return {
    semantics: parts.shift(),
    ssrcs: parts.map(function(ssrc) {
      return parseInt(ssrc, 10);
    })
  };
};

// Extracts the MID (RFC 5888) from a media section.
// returns the MID or undefined if no mid line was found.
SDPUtils.getMid = function(mediaSection) {
  var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
  if (mid) {
    return mid.substr(6);
  }
};

SDPUtils.parseFingerprint = function(line) {
  var parts = line.substr(14).split(' ');
  return {
    algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
    value: parts[1]
  };
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
      'a=fingerprint:');
  // Note: a=setup line is ignored since we use the 'auto' role.
  // Note2: 'algorithm' is not case sensitive except in Edge.
  return {
    role: 'auto',
    fingerprints: lines.map(SDPUtils.parseFingerprint)
  };
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  var sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(function(fp) {
    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};
// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var iceParameters = {
    usernameFragment: lines.filter(function(line) {
      return line.indexOf('a=ice-ufrag:') === 0;
    })[0].substr(12),
    password: lines.filter(function(line) {
      return line.indexOf('a=ice-pwd:') === 0;
    })[0].substr(10)
  };
  return iceParameters;
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
      'a=ice-pwd:' + params.password + '\r\n';
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  var description = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
    rtcp: []
  };
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
    var pt = mline[i];
    var rtpmapline = SDPUtils.matchPrefix(
        mediaSection, 'a=rtpmap:' + pt + ' ')[0];
    if (rtpmapline) {
      var codec = SDPUtils.parseRtpMap(rtpmapline);
      var fmtps = SDPUtils.matchPrefix(
          mediaSection, 'a=fmtp:' + pt + ' ');
      // Only the first a=fmtp:<pt> is considered.
      codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
      codec.rtcpFeedback = SDPUtils.matchPrefix(
          mediaSection, 'a=rtcp-fb:' + pt + ' ')
        .map(SDPUtils.parseRtcpFb);
      description.codecs.push(codec);
      // parse FEC mechanisms from rtpmap lines.
      switch (codec.name.toUpperCase()) {
        case 'RED':
        case 'ULPFEC':
          description.fecMechanisms.push(codec.name.toUpperCase());
          break;
        default: // only RED and ULPFEC are recognized as FEC mechanisms.
          break;
      }
    }
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
    description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  var sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(function(codec) {
    if (codec.preferredPayloadType !== undefined) {
      return codec.preferredPayloadType;
    }
    return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(function(codec) {
    sdp += SDPUtils.writeRtpMap(codec);
    sdp += SDPUtils.writeFmtp(codec);
    sdp += SDPUtils.writeRtcpFb(codec);
  });
  var maxptime = 0;
  caps.codecs.forEach(function(codec) {
    if (codec.maxptime > maxptime) {
      maxptime = codec.maxptime;
    }
  });
  if (maxptime > 0) {
    sdp += 'a=maxptime:' + maxptime + '\r\n';
  }
  sdp += 'a=rtcp-mux\r\n';

  if (caps.headerExtensions) {
    caps.headerExtensions.forEach(function(extension) {
      sdp += SDPUtils.writeExtmap(extension);
    });
  }
  // FIXME: write fecMechanisms.
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  var encodingParameters = [];
  var description = SDPUtils.parseRtpParameters(mediaSection);
  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'cname';
  });
  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  var secondarySsrc;

  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
  .map(function(line) {
    var parts = line.substr(17).split(' ');
    return parts.map(function(part) {
      return parseInt(part, 10);
    });
  });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
    secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(function(codec) {
    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
      var encParam = {
        ssrc: primarySsrc,
        codecPayloadType: parseInt(codec.parameters.apt, 10)
      };
      if (primarySsrc && secondarySsrc) {
        encParam.rtx = {ssrc: secondarySsrc};
      }
      encodingParameters.push(encParam);
      if (hasRed) {
        encParam = JSON.parse(JSON.stringify(encParam));
        encParam.fec = {
          ssrc: secondarySsrc,
          mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
        };
        encodingParameters.push(encParam);
      }
    }
  });
  if (encodingParameters.length === 0 && primarySsrc) {
    encodingParameters.push({
      ssrc: primarySsrc
    });
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(7), 10);
    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
      // use formula from JSEP to convert b=AS to TIAS value.
      bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95
          - (50 * 40 * 8);
    } else {
      bandwidth = undefined;
    }
    encodingParameters.forEach(function(params) {
      params.maxBitrate = bandwidth;
    });
  }
  return encodingParameters;
};

// parses http://draft.ortc.org/#rtcrtcpparameters*
SDPUtils.parseRtcpParameters = function(mediaSection) {
  var rtcpParameters = {};

  // Gets the first SSRC. Note tha with RTX there might be multiple
  // SSRCs.
  var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
      .map(function(line) {
        return SDPUtils.parseSsrcMedia(line);
      })
      .filter(function(obj) {
        return obj.attribute === 'cname';
      })[0];
  if (remoteSsrc) {
    rtcpParameters.cname = remoteSsrc.value;
    rtcpParameters.ssrc = remoteSsrc.ssrc;
  }

  // Edge uses the compound attribute instead of reducedSize
  // compound is !reducedSize
  var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
  rtcpParameters.reducedSize = rsize.length > 0;
  rtcpParameters.compound = rsize.length === 0;

  // parses the rtcp-mux attrіbute.
  // Note that Edge does not support unmuxed RTCP.
  var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
  rtcpParameters.mux = mux.length > 0;

  return rtcpParameters;
};

// parses either a=msid: or a=ssrc:... msid lines and returns
// the id of the MediaStream and MediaStreamTrack.
SDPUtils.parseMsid = function(mediaSection) {
  var parts;
  var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
  if (spec.length === 1) {
    parts = spec[0].substr(7).split(' ');
    return {stream: parts[0], track: parts[1]};
  }
  var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(msidParts) {
    return msidParts.attribute === 'msid';
  });
  if (planB.length > 0) {
    parts = planB[0].value.split(' ');
    return {stream: parts[0], track: parts[1]};
  }
};

// Generate a session ID for SDP.
// https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
// recommends using a cryptographically random +ve 64-bit value
// but right now this should be acceptable and within the right range
SDPUtils.generateSessionId = function() {
  return Math.random().toString().substr(2, 21);
};

// Write boilder plate for start of SDP
// sessId argument is optional - if not supplied it will
// be generated randomly
// sessVersion is optional and defaults to 2
SDPUtils.writeSessionBoilerplate = function(sessId, sessVer) {
  var sessionId;
  var version = sessVer !== undefined ? sessVer : 2;
  if (sessId) {
    sessionId = sessId;
  } else {
    sessionId = SDPUtils.generateSessionId();
  }
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
      'o=thisisadapterortc ' + sessionId + ' ' + version +
        ' IN IP4 127.0.0.1\r\n' +
      's=-\r\n' +
      't=0 0\r\n';
};

SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.direction) {
    sdp += 'a=' + transceiver.direction + '\r\n';
  } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    // spec.
    var msid = 'msid:' + stream.id + ' ' +
        transceiver.rtpSender.track.id + '\r\n';
    sdp += 'a=' + msid;

    // for Chrome.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
          ' ' + msid;
      sdp += 'a=ssrc-group:FID ' +
          transceiver.sendEncodingParameters[0].ssrc + ' ' +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          '\r\n';
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
  }
  return sdp;
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  var lines = SDPUtils.splitLines(mediaSection);
  for (var i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case 'a=sendrecv':
      case 'a=sendonly':
      case 'a=recvonly':
      case 'a=inactive':
        return lines[i].substr(2);
      default:
        // FIXME: What should happen here?
    }
  }
  if (sessionpart) {
    return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

SDPUtils.getKind = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  return mline[0].substr(2);
};

SDPUtils.isRejected = function(mediaSection) {
  return mediaSection.split(' ', 2)[1] === '0';
};

SDPUtils.parseMLine = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var parts = lines[0].substr(2).split(' ');
  return {
    kind: parts[0],
    port: parseInt(parts[1], 10),
    protocol: parts[2],
    fmt: parts.slice(3).join(' ')
  };
};

SDPUtils.parseOLine = function(mediaSection) {
  var line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
  var parts = line.substr(2).split(' ');
  return {
    username: parts[0],
    sessionId: parts[1],
    sessionVersion: parseInt(parts[2], 10),
    netType: parts[3],
    addressType: parts[4],
    address: parts[5]
  };
};

// a very naive interpretation of a valid SDP.
SDPUtils.isValidSDP = function(blob) {
  if (typeof blob !== 'string' || blob.length === 0) {
    return false;
  }
  var lines = SDPUtils.splitLines(blob);
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].length < 2 || lines[i].charAt(1) !== '=') {
      return false;
    }
    // TODO: check the modifier a bit more.
  }
  return true;
};

// Expose public methods.
if (typeof module === 'object') {
  module.exports = SDPUtils;
}

},{}],6:[function(require,module,exports){
/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O[(['Active'].concat('Object').join('X'))]!=D){try{var ad=new window[(['Active'].concat('Object').join('X'))](W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?(['Active'].concat('').join('X')):"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();module.exports=swfobject;

},{}],7:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":2,"timers":7}],8:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([bth[buf[i++]], bth[buf[i++]], 
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]]]).join('');
}

module.exports = bytesToUuid;

},{}],9:[function(require,module,exports){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

},{}],10:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;

},{"./lib/bytesToUuid":8,"./lib/rng":9}],11:[function(require,module,exports){
(function (global){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

var adapterFactory = require('./adapter_factory.js');
module.exports = adapterFactory({window: global.window});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./adapter_factory.js":12}],12:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

var utils = require('./utils');
// Shimming starts here.
module.exports = function(dependencies, opts) {
  var window = dependencies && dependencies.window;

  var options = {
    shimChrome: true,
    shimFirefox: true,
    shimEdge: true,
    shimSafari: true,
  };

  for (var key in opts) {
    if (hasOwnProperty.call(opts, key)) {
      options[key] = opts[key];
    }
  }

  // Utils.
  var logging = utils.log;
  var browserDetails = utils.detectBrowser(window);

  // Uncomment the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  // require('./utils').disableLog(false);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;
  var commonShim = require('./common_shim') || null;

  // Export to the adapter global object visible in the browser.
  var adapter = {
    browserDetails: browserDetails,
    commonShim: commonShim,
    extractVersion: utils.extractVersion,
    disableLog: utils.disableLog,
    disableWarnings: utils.disableWarnings
  };

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'chrome':
      if (!chromeShim || !chromeShim.shimPeerConnection ||
          !options.shimChrome) {
        logging('Chrome shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = chromeShim;
      commonShim.shimCreateObjectURL(window);

      chromeShim.shimGetUserMedia(window);
      chromeShim.shimMediaStream(window);
      chromeShim.shimSourceObject(window);
      chromeShim.shimPeerConnection(window);
      chromeShim.shimOnTrack(window);
      chromeShim.shimAddTrackRemoveTrack(window);
      chromeShim.shimGetSendersWithDtmf(window);
      chromeShim.shimSenderReceiverGetStats(window);
      chromeShim.fixNegotiationNeeded(window);

      commonShim.shimRTCIceCandidate(window);
      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);
      break;
    case 'firefox':
      if (!firefoxShim || !firefoxShim.shimPeerConnection ||
          !options.shimFirefox) {
        logging('Firefox shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = firefoxShim;
      commonShim.shimCreateObjectURL(window);

      firefoxShim.shimGetUserMedia(window);
      firefoxShim.shimSourceObject(window);
      firefoxShim.shimPeerConnection(window);
      firefoxShim.shimOnTrack(window);
      firefoxShim.shimRemoveStream(window);
      firefoxShim.shimSenderGetStats(window);
      firefoxShim.shimReceiverGetStats(window);
      firefoxShim.shimRTCDataChannel(window);

      commonShim.shimRTCIceCandidate(window);
      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);
      break;
    case 'edge':
      if (!edgeShim || !edgeShim.shimPeerConnection || !options.shimEdge) {
        logging('MS edge shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming edge.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = edgeShim;
      commonShim.shimCreateObjectURL(window);

      edgeShim.shimGetUserMedia(window);
      edgeShim.shimPeerConnection(window);
      edgeShim.shimReplaceTrack(window);

      // the edge shim implements the full RTCIceCandidate object.

      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);
      break;
    case 'safari':
      if (!safariShim || !options.shimSafari) {
        logging('Safari shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = safariShim;
      commonShim.shimCreateObjectURL(window);

      safariShim.shimRTCIceServerUrls(window);
      safariShim.shimCreateOfferLegacy(window);
      safariShim.shimCallbacksAPI(window);
      safariShim.shimLocalStreamsAPI(window);
      safariShim.shimRemoteStreamsAPI(window);
      safariShim.shimTrackEventTransceiver(window);
      safariShim.shimGetUserMedia(window);

      commonShim.shimRTCIceCandidate(window);
      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);
      break;
    default:
      logging('Unsupported browser!');
      break;
  }

  return adapter;
};

},{"./chrome/chrome_shim":13,"./common_shim":15,"./edge/edge_shim":16,"./firefox/firefox_shim":19,"./safari/safari_shim":21,"./utils":22}],13:[function(require,module,exports){

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;

/* iterates the stats graph recursively. */
function walkStats(stats, base, resultSet) {
  if (!base || resultSet.has(base.id)) {
    return;
  }
  resultSet.set(base.id, base);
  Object.keys(base).forEach(function(name) {
    if (name.endsWith('Id')) {
      walkStats(stats, stats.get(base[name]), resultSet);
    } else if (name.endsWith('Ids')) {
      base[name].forEach(function(id) {
        walkStats(stats, stats.get(id), resultSet);
      });
    }
  });
}

/* filter getStats for a sender/receiver track. */
function filterStats(result, track, outbound) {
  var streamStatsType = outbound ? 'outbound-rtp' : 'inbound-rtp';
  var filteredResult = new Map();
  if (track === null) {
    return filteredResult;
  }
  var trackStats = [];
  result.forEach(function(value) {
    if (value.type === 'track' &&
        value.trackIdentifier === track.id) {
      trackStats.push(value);
    }
  });
  trackStats.forEach(function(trackStat) {
    result.forEach(function(stats) {
      if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
        walkStats(result, stats, filteredResult);
      }
    });
  });
  return filteredResult;
}

module.exports = {
  shimGetUserMedia: require('./getusermedia'),
  shimMediaStream: function(window) {
    window.MediaStream = window.MediaStream || window.webkitMediaStream;
  },

  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
          }
          this.addEventListener('track', this._ontrack = f);
        },
        enumerable: true,
        configurable: true
      });
      var origSetRemoteDescription =
          window.RTCPeerConnection.prototype.setRemoteDescription;
      window.RTCPeerConnection.prototype.setRemoteDescription = function() {
        var pc = this;
        if (!pc._ontrackpoly) {
          pc._ontrackpoly = function(e) {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', function(te) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = pc.getReceivers().find(function(r) {
                  return r.track && r.track.id === te.track.id;
                });
              } else {
                receiver = {track: te.track};
              }

              var event = new Event('track');
              event.track = te.track;
              event.receiver = receiver;
              event.transceiver = {receiver: receiver};
              event.streams = [e.stream];
              pc.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(function(track) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = pc.getReceivers().find(function(r) {
                  return r.track && r.track.id === track.id;
                });
              } else {
                receiver = {track: track};
              }
              var event = new Event('track');
              event.track = track;
              event.receiver = receiver;
              event.transceiver = {receiver: receiver};
              event.streams = [e.stream];
              pc.dispatchEvent(event);
            });
          };
          pc.addEventListener('addstream', pc._ontrackpoly);
        }
        return origSetRemoteDescription.apply(pc, arguments);
      };
    } else if (!('RTCRtpTransceiver' in window)) {
      utils.wrapPeerConnectionEvent(window, 'track', function(e) {
        if (!e.transceiver) {
          e.transceiver = {receiver: e.receiver};
        }
        return e;
      });
    }
  },

  shimGetSendersWithDtmf: function(window) {
    // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
    if (typeof window === 'object' && window.RTCPeerConnection &&
        !('getSenders' in window.RTCPeerConnection.prototype) &&
        'createDTMFSender' in window.RTCPeerConnection.prototype) {
      var shimSenderWithDtmf = function(pc, track) {
        return {
          track: track,
          get dtmf() {
            if (this._dtmf === undefined) {
              if (track.kind === 'audio') {
                this._dtmf = pc.createDTMFSender(track);
              } else {
                this._dtmf = null;
              }
            }
            return this._dtmf;
          },
          _pc: pc
        };
      };

      // augment addTrack when getSenders is not available.
      if (!window.RTCPeerConnection.prototype.getSenders) {
        window.RTCPeerConnection.prototype.getSenders = function() {
          this._senders = this._senders || [];
          return this._senders.slice(); // return a copy of the internal state.
        };
        var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
        window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
          var pc = this;
          var sender = origAddTrack.apply(pc, arguments);
          if (!sender) {
            sender = shimSenderWithDtmf(pc, track);
            pc._senders.push(sender);
          }
          return sender;
        };

        var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
        window.RTCPeerConnection.prototype.removeTrack = function(sender) {
          var pc = this;
          origRemoveTrack.apply(pc, arguments);
          var idx = pc._senders.indexOf(sender);
          if (idx !== -1) {
            pc._senders.splice(idx, 1);
          }
        };
      }
      var origAddStream = window.RTCPeerConnection.prototype.addStream;
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origAddStream.apply(pc, [stream]);
        stream.getTracks().forEach(function(track) {
          pc._senders.push(shimSenderWithDtmf(pc, track));
        });
      };

      var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origRemoveStream.apply(pc, [stream]);

        stream.getTracks().forEach(function(track) {
          var sender = pc._senders.find(function(s) {
            return s.track === track;
          });
          if (sender) {
            pc._senders.splice(pc._senders.indexOf(sender), 1); // remove sender
          }
        });
      };
    } else if (typeof window === 'object' && window.RTCPeerConnection &&
               'getSenders' in window.RTCPeerConnection.prototype &&
               'createDTMFSender' in window.RTCPeerConnection.prototype &&
               window.RTCRtpSender &&
               !('dtmf' in window.RTCRtpSender.prototype)) {
      var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
      window.RTCPeerConnection.prototype.getSenders = function() {
        var pc = this;
        var senders = origGetSenders.apply(pc, []);
        senders.forEach(function(sender) {
          sender._pc = pc;
        });
        return senders;
      };

      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = this._pc.createDTMFSender(this.track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        }
      });
    }
  },

  shimSenderReceiverGetStats: function(window) {
    if (!(typeof window === 'object' && window.RTCPeerConnection &&
        window.RTCRtpSender && window.RTCRtpReceiver)) {
      return;
    }

    // shim sender stats.
    if (!('getStats' in window.RTCRtpSender.prototype)) {
      var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
      if (origGetSenders) {
        window.RTCPeerConnection.prototype.getSenders = function() {
          var pc = this;
          var senders = origGetSenders.apply(pc, []);
          senders.forEach(function(sender) {
            sender._pc = pc;
          });
          return senders;
        };
      }

      var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
      if (origAddTrack) {
        window.RTCPeerConnection.prototype.addTrack = function() {
          var sender = origAddTrack.apply(this, arguments);
          sender._pc = this;
          return sender;
        };
      }
      window.RTCRtpSender.prototype.getStats = function() {
        var sender = this;
        return this._pc.getStats().then(function(result) {
          /* Note: this will include stats of all senders that
           *   send a track with the same id as sender.track as
           *   it is not possible to identify the RTCRtpSender.
           */
          return filterStats(result, sender.track, true);
        });
      };
    }

    // shim receiver stats.
    if (!('getStats' in window.RTCRtpReceiver.prototype)) {
      var origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
      if (origGetReceivers) {
        window.RTCPeerConnection.prototype.getReceivers = function() {
          var pc = this;
          var receivers = origGetReceivers.apply(pc, []);
          receivers.forEach(function(receiver) {
            receiver._pc = pc;
          });
          return receivers;
        };
      }
      utils.wrapPeerConnectionEvent(window, 'track', function(e) {
        e.receiver._pc = e.srcElement;
        return e;
      });
      window.RTCRtpReceiver.prototype.getStats = function() {
        var receiver = this;
        return this._pc.getStats().then(function(result) {
          return filterStats(result, receiver.track, false);
        });
      };
    }

    if (!('getStats' in window.RTCRtpSender.prototype &&
        'getStats' in window.RTCRtpReceiver.prototype)) {
      return;
    }

    // shim RTCPeerConnection.getStats(track).
    var origGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function() {
      var pc = this;
      if (arguments.length > 0 &&
          arguments[0] instanceof window.MediaStreamTrack) {
        var track = arguments[0];
        var sender;
        var receiver;
        var err;
        pc.getSenders().forEach(function(s) {
          if (s.track === track) {
            if (sender) {
              err = true;
            } else {
              sender = s;
            }
          }
        });
        pc.getReceivers().forEach(function(r) {
          if (r.track === track) {
            if (receiver) {
              err = true;
            } else {
              receiver = r;
            }
          }
          return r.track === track;
        });
        if (err || (sender && receiver)) {
          return Promise.reject(new DOMException(
            'There are more than one sender or receiver for the track.',
            'InvalidAccessError'));
        } else if (sender) {
          return sender.getStats();
        } else if (receiver) {
          return receiver.getStats();
        }
        return Promise.reject(new DOMException(
          'There is no sender or receiver for the track.',
          'InvalidAccessError'));
      }
      return origGetStats.apply(pc, arguments);
    };
  },

  shimSourceObject: function(window) {
    var URL = window && window.URL;

    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this._srcObject;
          },
          set: function(stream) {
            var self = this;
            // Use _srcObject as a private property for this shim
            this._srcObject = stream;
            if (this.src) {
              URL.revokeObjectURL(this.src);
            }

            if (!stream) {
              this.src = '';
              return undefined;
            }
            this.src = URL.createObjectURL(stream);
            // We need to recreate the blob url when a track is added or
            // removed. Doing it manually since we want to avoid a recursion.
            stream.addEventListener('addtrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
            stream.addEventListener('removetrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
          }
        });
      }
    }
  },

  shimAddTrackRemoveTrackWithNative: function(window) {
    // shim addTrack/removeTrack with native variants in order to make
    // the interactions with legacy getLocalStreams behave as in other browsers.
    // Keeps a mapping stream.id => [stream, rtpsenders...]
    window.RTCPeerConnection.prototype.getLocalStreams = function() {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      return Object.keys(this._shimmedLocalStreams).map(function(streamId) {
        return pc._shimmedLocalStreams[streamId][0];
      });
    };

    var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
    window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
      if (!stream) {
        return origAddTrack.apply(this, arguments);
      }
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      var sender = origAddTrack.apply(this, arguments);
      if (!this._shimmedLocalStreams[stream.id]) {
        this._shimmedLocalStreams[stream.id] = [stream, sender];
      } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
        this._shimmedLocalStreams[stream.id].push(sender);
      }
      return sender;
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function(stream) {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      stream.getTracks().forEach(function(track) {
        var alreadyExists = pc.getSenders().find(function(s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException('Track already exists.',
              'InvalidAccessError');
        }
      });
      var existingSenders = pc.getSenders();
      origAddStream.apply(this, arguments);
      var newSenders = pc.getSenders().filter(function(newSender) {
        return existingSenders.indexOf(newSender) === -1;
      });
      this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      delete this._shimmedLocalStreams[stream.id];
      return origRemoveStream.apply(this, arguments);
    };

    var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
    window.RTCPeerConnection.prototype.removeTrack = function(sender) {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      if (sender) {
        Object.keys(this._shimmedLocalStreams).forEach(function(streamId) {
          var idx = pc._shimmedLocalStreams[streamId].indexOf(sender);
          if (idx !== -1) {
            pc._shimmedLocalStreams[streamId].splice(idx, 1);
          }
          if (pc._shimmedLocalStreams[streamId].length === 1) {
            delete pc._shimmedLocalStreams[streamId];
          }
        });
      }
      return origRemoveTrack.apply(this, arguments);
    };
  },

  shimAddTrackRemoveTrack: function(window) {
    var browserDetails = utils.detectBrowser(window);
    // shim addTrack and removeTrack.
    if (window.RTCPeerConnection.prototype.addTrack &&
        browserDetails.version >= 65) {
      return this.shimAddTrackRemoveTrackWithNative(window);
    }

    // also shim pc.getLocalStreams when addTrack is shimmed
    // to return the original streams.
    var origGetLocalStreams = window.RTCPeerConnection.prototype
        .getLocalStreams;
    window.RTCPeerConnection.prototype.getLocalStreams = function() {
      var pc = this;
      var nativeStreams = origGetLocalStreams.apply(this);
      pc._reverseStreams = pc._reverseStreams || {};
      return nativeStreams.map(function(stream) {
        return pc._reverseStreams[stream.id];
      });
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function(stream) {
      var pc = this;
      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};

      stream.getTracks().forEach(function(track) {
        var alreadyExists = pc.getSenders().find(function(s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException('Track already exists.',
              'InvalidAccessError');
        }
      });
      // Add identity mapping for consistency with addTrack.
      // Unless this is being used with a stream from addTrack.
      if (!pc._reverseStreams[stream.id]) {
        var newStream = new window.MediaStream(stream.getTracks());
        pc._streams[stream.id] = newStream;
        pc._reverseStreams[newStream.id] = stream;
        stream = newStream;
      }
      origAddStream.apply(pc, [stream]);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var pc = this;
      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};

      origRemoveStream.apply(pc, [(pc._streams[stream.id] || stream)]);
      delete pc._reverseStreams[(pc._streams[stream.id] ?
          pc._streams[stream.id].id : stream.id)];
      delete pc._streams[stream.id];
    };

    window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
      var pc = this;
      if (pc.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      var streams = [].slice.call(arguments, 1);
      if (streams.length !== 1 ||
          !streams[0].getTracks().find(function(t) {
            return t === track;
          })) {
        // this is not fully correct but all we can manage without
        // [[associated MediaStreams]] internal slot.
        throw new DOMException(
          'The adapter.js addTrack polyfill only supports a single ' +
          ' stream which is associated with the specified track.',
          'NotSupportedError');
      }

      var alreadyExists = pc.getSenders().find(function(s) {
        return s.track === track;
      });
      if (alreadyExists) {
        throw new DOMException('Track already exists.',
            'InvalidAccessError');
      }

      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};
      var oldStream = pc._streams[stream.id];
      if (oldStream) {
        // this is using odd Chrome behaviour, use with caution:
        // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
        // Note: we rely on the high-level addTrack/dtmf shim to
        // create the sender with a dtmf sender.
        oldStream.addTrack(track);

        // Trigger ONN async.
        Promise.resolve().then(function() {
          pc.dispatchEvent(new Event('negotiationneeded'));
        });
      } else {
        var newStream = new window.MediaStream([track]);
        pc._streams[stream.id] = newStream;
        pc._reverseStreams[newStream.id] = stream;
        pc.addStream(newStream);
      }
      return pc.getSenders().find(function(s) {
        return s.track === track;
      });
    };

    // replace the internal stream id with the external one and
    // vice versa.
    function replaceInternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(internalStream.id, 'g'),
            externalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    function replaceExternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(externalStream.id, 'g'),
            internalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    ['createOffer', 'createAnswer'].forEach(function(method) {
      var nativeMethod = window.RTCPeerConnection.prototype[method];
      window.RTCPeerConnection.prototype[method] = function() {
        var pc = this;
        var args = arguments;
        var isLegacyCall = arguments.length &&
            typeof arguments[0] === 'function';
        if (isLegacyCall) {
          return nativeMethod.apply(pc, [
            function(description) {
              var desc = replaceInternalStreamId(pc, description);
              args[0].apply(null, [desc]);
            },
            function(err) {
              if (args[1]) {
                args[1].apply(null, err);
              }
            }, arguments[2]
          ]);
        }
        return nativeMethod.apply(pc, arguments)
        .then(function(description) {
          return replaceInternalStreamId(pc, description);
        });
      };
    });

    var origSetLocalDescription =
        window.RTCPeerConnection.prototype.setLocalDescription;
    window.RTCPeerConnection.prototype.setLocalDescription = function() {
      var pc = this;
      if (!arguments.length || !arguments[0].type) {
        return origSetLocalDescription.apply(pc, arguments);
      }
      arguments[0] = replaceExternalStreamId(pc, arguments[0]);
      return origSetLocalDescription.apply(pc, arguments);
    };

    // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

    var origLocalDescription = Object.getOwnPropertyDescriptor(
        window.RTCPeerConnection.prototype, 'localDescription');
    Object.defineProperty(window.RTCPeerConnection.prototype,
        'localDescription', {
          get: function() {
            var pc = this;
            var description = origLocalDescription.get.apply(this);
            if (description.type === '') {
              return description;
            }
            return replaceInternalStreamId(pc, description);
          }
        });

    window.RTCPeerConnection.prototype.removeTrack = function(sender) {
      var pc = this;
      if (pc.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      // We can not yet check for sender instanceof RTCRtpSender
      // since we shim RTPSender. So we check if sender._pc is set.
      if (!sender._pc) {
        throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' +
            'does not implement interface RTCRtpSender.', 'TypeError');
      }
      var isLocal = sender._pc === pc;
      if (!isLocal) {
        throw new DOMException('Sender was not created by this connection.',
            'InvalidAccessError');
      }

      // Search for the native stream the senders track belongs to.
      pc._streams = pc._streams || {};
      var stream;
      Object.keys(pc._streams).forEach(function(streamid) {
        var hasTrack = pc._streams[streamid].getTracks().find(function(track) {
          return sender.track === track;
        });
        if (hasTrack) {
          stream = pc._streams[streamid];
        }
      });

      if (stream) {
        if (stream.getTracks().length === 1) {
          // if this is the last track of the stream, remove the stream. This
          // takes care of any shimmed _senders.
          pc.removeStream(pc._reverseStreams[stream.id]);
        } else {
          // relying on the same odd chrome behaviour as above.
          stream.removeTrack(sender.track);
        }
        pc.dispatchEvent(new Event('negotiationneeded'));
      }
    };
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection && window.webkitRTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        // Translate iceTransportPolicy to iceTransports,
        // see https://code.google.com/p/webrtc/issues/detail?id=4869
        // this was fixed in M56 along with unprefixing RTCPeerConnection.
        logging('PeerConnection');
        if (pcConfig && pcConfig.iceTransportPolicy) {
          pcConfig.iceTransports = pcConfig.iceTransportPolicy;
        }

        return new window.webkitRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.webkitRTCPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      if (window.webkitRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.webkitRTCPeerConnection.generateCertificate;
          }
        });
      }
    } else {
      // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
      var OrigPeerConnection = window.RTCPeerConnection;
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (pcConfig && pcConfig.iceServers) {
          var newIceServers = [];
          for (var i = 0; i < pcConfig.iceServers.length; i++) {
            var server = pcConfig.iceServers[i];
            if (!server.hasOwnProperty('urls') &&
                server.hasOwnProperty('url')) {
              utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
              server = JSON.parse(JSON.stringify(server));
              server.urls = server.url;
              newIceServers.push(server);
            } else {
              newIceServers.push(pcConfig.iceServers[i]);
            }
          }
          pcConfig.iceServers = newIceServers;
        }
        return new OrigPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }

    var origGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(selector,
        successCallback, errorCallback) {
      var pc = this;
      var args = arguments;

      // If selector is a function then we are in the old style stats so just
      // pass back the original getStats format to avoid breaking old users.
      if (arguments.length > 0 && typeof selector === 'function') {
        return origGetStats.apply(this, arguments);
      }

      // When spec-style getStats is supported, return those when called with
      // either no arguments or the selector argument is null.
      if (origGetStats.length === 0 && (arguments.length === 0 ||
          typeof arguments[0] !== 'function')) {
        return origGetStats.apply(this, []);
      }

      var fixChromeStats_ = function(response) {
        var standardReport = {};
        var reports = response.result();
        reports.forEach(function(report) {
          var standardStats = {
            id: report.id,
            timestamp: report.timestamp,
            type: {
              localcandidate: 'local-candidate',
              remotecandidate: 'remote-candidate'
            }[report.type] || report.type
          };
          report.names().forEach(function(name) {
            standardStats[name] = report.stat(name);
          });
          standardReport[standardStats.id] = standardStats;
        });

        return standardReport;
      };

      // shim getStats with maplike support
      var makeMapStats = function(stats) {
        return new Map(Object.keys(stats).map(function(key) {
          return [key, stats[key]];
        }));
      };

      if (arguments.length >= 2) {
        var successCallbackWrapper_ = function(response) {
          args[1](makeMapStats(fixChromeStats_(response)));
        };

        return origGetStats.apply(this, [successCallbackWrapper_,
          arguments[0]]);
      }

      // promise-support
      return new Promise(function(resolve, reject) {
        origGetStats.apply(pc, [
          function(response) {
            resolve(makeMapStats(fixChromeStats_(response)));
          }, reject]);
      }).then(successCallback, errorCallback);
    };

    // add promise support -- natively available in Chrome 51
    if (browserDetails.version < 51) {
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = window.RTCPeerConnection.prototype[method];
            window.RTCPeerConnection.prototype[method] = function() {
              var args = arguments;
              var pc = this;
              var promise = new Promise(function(resolve, reject) {
                nativeMethod.apply(pc, [args[0], resolve, reject]);
              });
              if (args.length < 2) {
                return promise;
              }
              return promise.then(function() {
                args[1].apply(null, []);
              },
              function(err) {
                if (args.length >= 3) {
                  args[2].apply(null, [err]);
                }
              });
            };
          });
    }

    // promise support for createOffer and createAnswer. Available (without
    // bugs) since M52: crbug/619289
    if (browserDetails.version < 52) {
      ['createOffer', 'createAnswer'].forEach(function(method) {
        var nativeMethod = window.RTCPeerConnection.prototype[method];
        window.RTCPeerConnection.prototype[method] = function() {
          var pc = this;
          if (arguments.length < 1 || (arguments.length === 1 &&
              typeof arguments[0] === 'object')) {
            var opts = arguments.length === 1 ? arguments[0] : undefined;
            return new Promise(function(resolve, reject) {
              nativeMethod.apply(pc, [resolve, reject, opts]);
            });
          }
          return nativeMethod.apply(this, arguments);
        };
      });
    }

    // shim implicit creation of RTCSessionDescription/RTCIceCandidate
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
  },

  fixNegotiationNeeded: function(window) {
    utils.wrapPeerConnectionEvent(window, 'negotiationneeded', function(e) {
      var pc = e.target;
      if (pc.signalingState !== 'stable') {
        return;
      }
      return e;
    });
  },

  shimGetDisplayMedia: function(window, getSourceId) {
    if ('getDisplayMedia' in window.navigator) {
      return;
    }
    // getSourceId is a function that returns a promise resolving with
    // the sourceId of the screen/window/tab to be shared.
    if (typeof getSourceId !== 'function') {
      console.error('shimGetDisplayMedia: getSourceId argument is not ' +
          'a function');
      return;
    }
    navigator.getDisplayMedia = function(constraints) {
      return getSourceId(constraints)
        .then(function(sourceId) {
          constraints.video = {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
              maxFrameRate: constraints.video.frameRate || 3
            }
          };
          return navigator.mediaDevices.getUserMedia(constraints);
        });
    };
  }
};

},{"../utils.js":22,"./getusermedia":14}],14:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;

  var constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    var cc = {};
    Object.keys(c).forEach(function(key) {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      var oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        var oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(function(mix) {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  var shimConstraints_ = function(constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === 'object') {
      var remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
      remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === 'object') {
      // Shim facingMode for mobile & surface pro.
      var face = constraints.video.facingMode;
      face = face && ((typeof face === 'object') ? face : {ideal: face});
      var getSupportedFacingModeLies = browserDetails.version < 66;

      if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                    face.ideal === 'user' || face.ideal === 'environment')) &&
          !(navigator.mediaDevices.getSupportedConstraints &&
            navigator.mediaDevices.getSupportedConstraints().facingMode &&
            !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        var matches;
        if (face.exact === 'environment' || face.ideal === 'environment') {
          matches = ['back', 'rear'];
        } else if (face.exact === 'user' || face.ideal === 'user') {
          matches = ['front'];
        }
        if (matches) {
          // Look for matches in label, or use last cam for back (typical).
          return navigator.mediaDevices.enumerateDevices()
          .then(function(devices) {
            devices = devices.filter(function(d) {
              return d.kind === 'videoinput';
            });
            var dev = devices.find(function(d) {
              return matches.some(function(match) {
                return d.label.toLowerCase().indexOf(match) !== -1;
              });
            });
            if (!dev && devices.length && matches.indexOf('back') !== -1) {
              dev = devices[devices.length - 1]; // more likely the back cam
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? {exact: dev.deviceId} :
                                                        {ideal: dev.deviceId};
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging('chrome: ' + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return func(constraints);
  };

  var shimError_ = function(e) {
    if (browserDetails.version >= 64) {
      return e;
    }
    return {
      name: {
        PermissionDeniedError: 'NotAllowedError',
        PermissionDismissedError: 'NotAllowedError',
        InvalidStateError: 'NotAllowedError',
        DevicesNotFoundError: 'NotFoundError',
        ConstraintNotSatisfiedError: 'OverconstrainedError',
        TrackStartError: 'NotReadableError',
        MediaDeviceFailedDueToShutdown: 'NotAllowedError',
        MediaDeviceKillSwitchOn: 'NotAllowedError',
        TabCaptureError: 'AbortError',
        ScreenCaptureError: 'AbortError',
        DeviceCaptureError: 'AbortError'
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraint || e.constraintName,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, function(c) {
      navigator.webkitGetUserMedia(c, onSuccess, function(e) {
        if (onError) {
          onError(shimError_(e));
        }
      });
    });
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {
      getUserMedia: getUserMediaPromise_,
      enumerateDevices: function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return window.MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                kind: kinds[device.kind],
                deviceId: device.id,
                groupId: ''};
            }));
          });
        });
      },
      getSupportedConstraints: function() {
        return {
          deviceId: true, echoCancellation: true, facingMode: true,
          frameRate: true, height: true, width: true
        };
      }
    };
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return getUserMediaPromise_(constraints);
    };
  } else {
    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, function(c) {
        return origGetUserMedia(c).then(function(stream) {
          if (c.audio && !stream.getAudioTracks().length ||
              c.video && !stream.getVideoTracks().length) {
            stream.getTracks().forEach(function(track) {
              track.stop();
            });
            throw new DOMException('', 'NotFoundError');
          }
          return stream;
        }, function(e) {
          return Promise.reject(shimError_(e));
        });
      });
    };
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
    navigator.mediaDevices.addEventListener = function() {
      logging('Dummy mediaDevices.addEventListener called.');
    };
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
    navigator.mediaDevices.removeEventListener = function() {
      logging('Dummy mediaDevices.removeEventListener called.');
    };
  }
};

},{"../utils.js":22}],15:[function(require,module,exports){
/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');
var utils = require('./utils');

module.exports = {
  shimRTCIceCandidate: function(window) {
    // foundation is arbitrarily chosen as an indicator for full support for
    // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
    if (!window.RTCIceCandidate || (window.RTCIceCandidate && 'foundation' in
        window.RTCIceCandidate.prototype)) {
      return;
    }

    var NativeRTCIceCandidate = window.RTCIceCandidate;
    window.RTCIceCandidate = function(args) {
      // Remove the a= which shouldn't be part of the candidate string.
      if (typeof args === 'object' && args.candidate &&
          args.candidate.indexOf('a=') === 0) {
        args = JSON.parse(JSON.stringify(args));
        args.candidate = args.candidate.substr(2);
      }

      if (args.candidate && args.candidate.length) {
        // Augment the native candidate with the parsed fields.
        var nativeCandidate = new NativeRTCIceCandidate(args);
        var parsedCandidate = SDPUtils.parseCandidate(args.candidate);
        var augmentedCandidate = Object.assign(nativeCandidate,
            parsedCandidate);

        // Add a serializer that does not serialize the extra attributes.
        augmentedCandidate.toJSON = function() {
          return {
            candidate: augmentedCandidate.candidate,
            sdpMid: augmentedCandidate.sdpMid,
            sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
            usernameFragment: augmentedCandidate.usernameFragment,
          };
        };
        return augmentedCandidate;
      }
      return new NativeRTCIceCandidate(args);
    };
    window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;

    // Hook up the augmented candidate in onicecandidate and
    // addEventListener('icecandidate', ...)
    utils.wrapPeerConnectionEvent(window, 'icecandidate', function(e) {
      if (e.candidate) {
        Object.defineProperty(e, 'candidate', {
          value: new window.RTCIceCandidate(e.candidate),
          writable: 'false'
        });
      }
      return e;
    });
  },

  // shimCreateObjectURL must be called before shimSourceObject to avoid loop.

  shimCreateObjectURL: function(window) {
    var URL = window && window.URL;

    if (!(typeof window === 'object' && window.HTMLMediaElement &&
          'srcObject' in window.HTMLMediaElement.prototype &&
        URL.createObjectURL && URL.revokeObjectURL)) {
      // Only shim CreateObjectURL using srcObject if srcObject exists.
      return undefined;
    }

    var nativeCreateObjectURL = URL.createObjectURL.bind(URL);
    var nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
    var streams = new Map(), newId = 0;

    URL.createObjectURL = function(stream) {
      if ('getTracks' in stream) {
        var url = 'polyblob:' + (++newId);
        streams.set(url, stream);
        utils.deprecated('URL.createObjectURL(stream)',
            'elem.srcObject = stream');
        return url;
      }
      return nativeCreateObjectURL(stream);
    };
    URL.revokeObjectURL = function(url) {
      nativeRevokeObjectURL(url);
      streams.delete(url);
    };

    var dsc = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype,
                                              'src');
    Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
      get: function() {
        return dsc.get.apply(this);
      },
      set: function(url) {
        this.srcObject = streams.get(url) || null;
        return dsc.set.apply(this, [url]);
      }
    });

    var nativeSetAttribute = window.HTMLMediaElement.prototype.setAttribute;
    window.HTMLMediaElement.prototype.setAttribute = function() {
      if (arguments.length === 2 &&
          ('' + arguments[0]).toLowerCase() === 'src') {
        this.srcObject = streams.get(arguments[1]) || null;
      }
      return nativeSetAttribute.apply(this, arguments);
    };
  },

  shimMaxMessageSize: function(window) {
    if (window.RTCSctpTransport || !window.RTCPeerConnection) {
      return;
    }
    var browserDetails = utils.detectBrowser(window);

    if (!('sctp' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'sctp', {
        get: function() {
          return typeof this._sctp === 'undefined' ? null : this._sctp;
        }
      });
    }

    var sctpInDescription = function(description) {
      var sections = SDPUtils.splitSections(description.sdp);
      sections.shift();
      return sections.some(function(mediaSection) {
        var mLine = SDPUtils.parseMLine(mediaSection);
        return mLine && mLine.kind === 'application'
            && mLine.protocol.indexOf('SCTP') !== -1;
      });
    };

    var getRemoteFirefoxVersion = function(description) {
      // TODO: Is there a better solution for detecting Firefox?
      var match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
      if (match === null || match.length < 2) {
        return -1;
      }
      var version = parseInt(match[1], 10);
      // Test for NaN (yes, this is ugly)
      return version !== version ? -1 : version;
    };

    var getCanSendMaxMessageSize = function(remoteIsFirefox) {
      // Every implementation we know can send at least 64 KiB.
      // Note: Although Chrome is technically able to send up to 256 KiB, the
      //       data does not reach the other peer reliably.
      //       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
      var canSendMaxMessageSize = 65536;
      if (browserDetails.browser === 'firefox') {
        if (browserDetails.version < 57) {
          if (remoteIsFirefox === -1) {
            // FF < 57 will send in 16 KiB chunks using the deprecated PPID
            // fragmentation.
            canSendMaxMessageSize = 16384;
          } else {
            // However, other FF (and RAWRTC) can reassemble PPID-fragmented
            // messages. Thus, supporting ~2 GiB when sending.
            canSendMaxMessageSize = 2147483637;
          }
        } else if (browserDetails.version < 60) {
          // Currently, all FF >= 57 will reset the remote maximum message size
          // to the default value when a data channel is created at a later
          // stage. :(
          // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
          canSendMaxMessageSize =
            browserDetails.version === 57 ? 65535 : 65536;
        } else {
          // FF >= 60 supports sending ~2 GiB
          canSendMaxMessageSize = 2147483637;
        }
      }
      return canSendMaxMessageSize;
    };

    var getMaxMessageSize = function(description, remoteIsFirefox) {
      // Note: 65536 bytes is the default value from the SDP spec. Also,
      //       every implementation we know supports receiving 65536 bytes.
      var maxMessageSize = 65536;

      // FF 57 has a slightly incorrect default remote max message size, so
      // we need to adjust it here to avoid a failure when sending.
      // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697
      if (browserDetails.browser === 'firefox'
           && browserDetails.version === 57) {
        maxMessageSize = 65535;
      }

      var match = SDPUtils.matchPrefix(description.sdp, 'a=max-message-size:');
      if (match.length > 0) {
        maxMessageSize = parseInt(match[0].substr(19), 10);
      } else if (browserDetails.browser === 'firefox' &&
                  remoteIsFirefox !== -1) {
        // If the maximum message size is not present in the remote SDP and
        // both local and remote are Firefox, the remote peer can receive
        // ~2 GiB.
        maxMessageSize = 2147483637;
      }
      return maxMessageSize;
    };

    var origSetRemoteDescription =
        window.RTCPeerConnection.prototype.setRemoteDescription;
    window.RTCPeerConnection.prototype.setRemoteDescription = function() {
      var pc = this;
      pc._sctp = null;

      if (sctpInDescription(arguments[0])) {
        // Check if the remote is FF.
        var isFirefox = getRemoteFirefoxVersion(arguments[0]);

        // Get the maximum message size the local peer is capable of sending
        var canSendMMS = getCanSendMaxMessageSize(isFirefox);

        // Get the maximum message size of the remote peer.
        var remoteMMS = getMaxMessageSize(arguments[0], isFirefox);

        // Determine final maximum message size
        var maxMessageSize;
        if (canSendMMS === 0 && remoteMMS === 0) {
          maxMessageSize = Number.POSITIVE_INFINITY;
        } else if (canSendMMS === 0 || remoteMMS === 0) {
          maxMessageSize = Math.max(canSendMMS, remoteMMS);
        } else {
          maxMessageSize = Math.min(canSendMMS, remoteMMS);
        }

        // Create a dummy RTCSctpTransport object and the 'maxMessageSize'
        // attribute.
        var sctp = {};
        Object.defineProperty(sctp, 'maxMessageSize', {
          get: function() {
            return maxMessageSize;
          }
        });
        pc._sctp = sctp;
      }

      return origSetRemoteDescription.apply(pc, arguments);
    };
  },

  shimSendThrowTypeError: function(window) {
    if (!(window.RTCPeerConnection &&
        'createDataChannel' in window.RTCPeerConnection.prototype)) {
      return;
    }

    // Note: Although Firefox >= 57 has a native implementation, the maximum
    //       message size can be reset for all data channels at a later stage.
    //       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831

    function wrapDcSend(dc, pc) {
      var origDataChannelSend = dc.send;
      dc.send = function() {
        var data = arguments[0];
        var length = data.length || data.size || data.byteLength;
        if (dc.readyState === 'open' &&
            pc.sctp && length > pc.sctp.maxMessageSize) {
          throw new TypeError('Message too large (can send a maximum of ' +
            pc.sctp.maxMessageSize + ' bytes)');
        }
        return origDataChannelSend.apply(dc, arguments);
      };
    }
    var origCreateDataChannel =
      window.RTCPeerConnection.prototype.createDataChannel;
    window.RTCPeerConnection.prototype.createDataChannel = function() {
      var pc = this;
      var dataChannel = origCreateDataChannel.apply(pc, arguments);
      wrapDcSend(dataChannel, pc);
      return dataChannel;
    };
    utils.wrapPeerConnectionEvent(window, 'datachannel', function(e) {
      wrapDcSend(e.channel, e.target);
      return e;
    });
  }
};

},{"./utils":22,"sdp":5}],16:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');
var filterIceServers = require('./filtericeservers');
var shimRTCPeerConnection = require('rtcpeerconnection-shim');

module.exports = {
  shimGetUserMedia: require('./getusermedia'),
  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    if (window.RTCIceGatherer) {
      if (!window.RTCIceCandidate) {
        window.RTCIceCandidate = function(args) {
          return args;
        };
      }
      if (!window.RTCSessionDescription) {
        window.RTCSessionDescription = function(args) {
          return args;
        };
      }
      // this adds an additional event listener to MediaStrackTrack that signals
      // when a tracks enabled property was changed. Workaround for a bug in
      // addStream, see below. No longer required in 15025+
      if (browserDetails.version < 15025) {
        var origMSTEnabled = Object.getOwnPropertyDescriptor(
            window.MediaStreamTrack.prototype, 'enabled');
        Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
          set: function(value) {
            origMSTEnabled.set.call(this, value);
            var ev = new Event('enabled');
            ev.enabled = value;
            this.dispatchEvent(ev);
          }
        });
      }
    }

    // ORTC defines the DTMF sender a bit different.
    // https://github.com/w3c/ortc/issues/714
    if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = new window.RTCDtmfSender(this);
            } else if (this.track.kind === 'video') {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        }
      });
    }
    // Edge currently only implements the RTCDtmfSender, not the
    // RTCDTMFSender alias. See http://draft.ortc.org/#rtcdtmfsender2*
    if (window.RTCDtmfSender && !window.RTCDTMFSender) {
      window.RTCDTMFSender = window.RTCDtmfSender;
    }

    var RTCPeerConnectionShim = shimRTCPeerConnection(window,
        browserDetails.version);
    window.RTCPeerConnection = function(config) {
      if (config && config.iceServers) {
        config.iceServers = filterIceServers(config.iceServers);
      }
      return new RTCPeerConnectionShim(config);
    };
    window.RTCPeerConnection.prototype = RTCPeerConnectionShim.prototype;
  },
  shimReplaceTrack: function(window) {
    // ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
    if (window.RTCRtpSender &&
        !('replaceTrack' in window.RTCRtpSender.prototype)) {
      window.RTCRtpSender.prototype.replaceTrack =
          window.RTCRtpSender.prototype.setTrack;
    }
  }
};

},{"../utils":22,"./filtericeservers":17,"./getusermedia":18,"rtcpeerconnection-shim":4}],17:[function(require,module,exports){
/*
 *  Copyright (c) 2018 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');
// Edge does not like
// 1) stun: filtered after 14393 unless ?transport=udp is present
// 2) turn: that does not have all of turn:host:port?transport=udp
// 3) turn: with ipv6 addresses
// 4) turn: occurring muliple times
module.exports = function(iceServers, edgeVersion) {
  var hasTurn = false;
  iceServers = JSON.parse(JSON.stringify(iceServers));
  return iceServers.filter(function(server) {
    if (server && (server.urls || server.url)) {
      var urls = server.urls || server.url;
      if (server.url && !server.urls) {
        utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
      }
      var isString = typeof urls === 'string';
      if (isString) {
        urls = [urls];
      }
      urls = urls.filter(function(url) {
        var validTurn = url.indexOf('turn:') === 0 &&
            url.indexOf('transport=udp') !== -1 &&
            url.indexOf('turn:[') === -1 &&
            !hasTurn;

        if (validTurn) {
          hasTurn = true;
          return true;
        }
        return url.indexOf('stun:') === 0 && edgeVersion >= 14393 &&
            url.indexOf('?transport=udp') === -1;
      });

      delete server.url;
      server.urls = isString ? urls[0] : urls;
      return !!urls.length;
    }
  });
};

},{"../utils":22}],18:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

// Expose public methods.
module.exports = function(window) {
  var navigator = window && window.navigator;

  var shimError_ = function(e) {
    return {
      name: {PermissionDeniedError: 'NotAllowedError'}[e.name] || e.name,
      message: e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name;
      }
    };
  };

  // getUserMedia error shim.
  var origGetUserMedia = navigator.mediaDevices.getUserMedia.
      bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function(c) {
    return origGetUserMedia(c).catch(function(e) {
      return Promise.reject(shimError_(e));
    });
  };
};

},{}],19:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');

module.exports = {
  shimGetUserMedia: require('./getusermedia'),
  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.transceiver = {receiver: event.receiver};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        },
        enumerable: true,
        configurable: true
      });
    }
    if (typeof window === 'object' && window.RTCTrackEvent &&
        ('receiver' in window.RTCTrackEvent.prototype) &&
        !('transceiver' in window.RTCTrackEvent.prototype)) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function() {
          return {receiver: this.receiver};
        }
      });
    }
  },

  shimSourceObject: function(window) {
    // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this.mozSrcObject;
          },
          set: function(stream) {
            this.mozSrcObject = stream;
          }
        });
      }
    }
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    if (typeof window !== 'object' || !(window.RTCPeerConnection ||
        window.mozRTCPeerConnection)) {
      return; // probably media.peerconnection.enabled=false in about:config
    }
    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (browserDetails.version < 38) {
          // .urls is not supported in FF < 38.
          // create RTCIceServers with a single url.
          if (pcConfig && pcConfig.iceServers) {
            var newIceServers = [];
            for (var i = 0; i < pcConfig.iceServers.length; i++) {
              var server = pcConfig.iceServers[i];
              if (server.hasOwnProperty('urls')) {
                for (var j = 0; j < server.urls.length; j++) {
                  var newServer = {
                    url: server.urls[j]
                  };
                  if (server.urls[j].indexOf('turn') === 0) {
                    newServer.username = server.username;
                    newServer.credential = server.credential;
                  }
                  newIceServers.push(newServer);
                }
              } else {
                newIceServers.push(pcConfig.iceServers[i]);
              }
            }
            pcConfig.iceServers = newIceServers;
          }
        }
        return new window.mozRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.mozRTCPeerConnection.prototype;

      // wrap static methods. Currently just generateCertificate.
      if (window.mozRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.mozRTCPeerConnection.generateCertificate;
          }
        });
      }

      window.RTCSessionDescription = window.mozRTCSessionDescription;
      window.RTCIceCandidate = window.mozRTCIceCandidate;
    }

    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };

    // shim getStats with maplike support
    var makeMapStats = function(stats) {
      var map = new Map();
      Object.keys(stats).forEach(function(key) {
        map.set(key, stats[key]);
        map[key] = stats[key];
      });
      return map;
    };

    var modernStatsTypes = {
      inboundrtp: 'inbound-rtp',
      outboundrtp: 'outbound-rtp',
      candidatepair: 'candidate-pair',
      localcandidate: 'local-candidate',
      remotecandidate: 'remote-candidate'
    };

    var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(
      selector,
      onSucc,
      onErr
    ) {
      return nativeGetStats.apply(this, [selector || null])
        .then(function(stats) {
          if (browserDetails.version < 48) {
            stats = makeMapStats(stats);
          }
          if (browserDetails.version < 53 && !onSucc) {
            // Shim only promise getStats with spec-hyphens in type names
            // Leave callback version alone; misc old uses of forEach before Map
            try {
              stats.forEach(function(stat) {
                stat.type = modernStatsTypes[stat.type] || stat.type;
              });
            } catch (e) {
              if (e.name !== 'TypeError') {
                throw e;
              }
              // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
              stats.forEach(function(stat, i) {
                stats.set(i, Object.assign({}, stat, {
                  type: modernStatsTypes[stat.type] || stat.type
                }));
              });
            }
          }
          return stats;
        })
        .then(onSucc, onErr);
    };
  },

  shimSenderGetStats: function(window) {
    if (!(typeof window === 'object' && window.RTCPeerConnection &&
        window.RTCRtpSender)) {
      return;
    }
    if (window.RTCRtpSender && 'getStats' in window.RTCRtpSender.prototype) {
      return;
    }
    var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
    if (origGetSenders) {
      window.RTCPeerConnection.prototype.getSenders = function() {
        var pc = this;
        var senders = origGetSenders.apply(pc, []);
        senders.forEach(function(sender) {
          sender._pc = pc;
        });
        return senders;
      };
    }

    var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
    if (origAddTrack) {
      window.RTCPeerConnection.prototype.addTrack = function() {
        var sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }
    window.RTCRtpSender.prototype.getStats = function() {
      return this.track ? this._pc.getStats(this.track) :
          Promise.resolve(new Map());
    };
  },

  shimReceiverGetStats: function(window) {
    if (!(typeof window === 'object' && window.RTCPeerConnection &&
        window.RTCRtpSender)) {
      return;
    }
    if (window.RTCRtpSender && 'getStats' in window.RTCRtpReceiver.prototype) {
      return;
    }
    var origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
    if (origGetReceivers) {
      window.RTCPeerConnection.prototype.getReceivers = function() {
        var pc = this;
        var receivers = origGetReceivers.apply(pc, []);
        receivers.forEach(function(receiver) {
          receiver._pc = pc;
        });
        return receivers;
      };
    }
    utils.wrapPeerConnectionEvent(window, 'track', function(e) {
      e.receiver._pc = e.srcElement;
      return e;
    });
    window.RTCRtpReceiver.prototype.getStats = function() {
      return this._pc.getStats(this.track);
    };
  },

  shimRemoveStream: function(window) {
    if (!window.RTCPeerConnection ||
        'removeStream' in window.RTCPeerConnection.prototype) {
      return;
    }
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var pc = this;
      utils.deprecated('removeStream', 'removeTrack');
      this.getSenders().forEach(function(sender) {
        if (sender.track && stream.getTracks().indexOf(sender.track) !== -1) {
          pc.removeTrack(sender);
        }
      });
    };
  },

  shimRTCDataChannel: function(window) {
    // rename DataChannel to RTCDataChannel (native fix in FF60):
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1173851
    if (window.DataChannel && !window.RTCDataChannel) {
      window.RTCDataChannel = window.DataChannel;
    }
  },

  shimGetDisplayMedia: function(window, preferredMediaSource) {
    if ('getDisplayMedia' in window.navigator) {
      return;
    }
    navigator.getDisplayMedia = function(constraints) {
      if (!(constraints && constraints.video)) {
        var err = new DOMException('getDisplayMedia without video ' +
            'constraints is undefined');
        err.name = 'NotFoundError';
        // from https://heycam.github.io/webidl/#idl-DOMException-error-names
        err.code = 8;
        return Promise.reject(err);
      }
      if (constraints.video === true) {
        constraints.video = {mediaSource: preferredMediaSource};
      } else {
        constraints.video.mediaSource = preferredMediaSource;
      }
      return navigator.mediaDevices.getUserMedia(constraints);
    };
  }
};

},{"../utils":22,"./getusermedia":20}],20:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;
  var MediaStreamTrack = window && window.MediaStreamTrack;

  var shimError_ = function(e) {
    return {
      name: {
        InternalError: 'NotReadableError',
        NotSupportedError: 'TypeError',
        PermissionDeniedError: 'NotAllowedError',
        SecurityError: 'NotAllowedError'
      }[e.name] || e.name,
      message: {
        'The operation is insecure.': 'The request is not allowed by the ' +
        'user agent or the platform in the current context.'
      }[e.message] || e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
    var constraintsToFF37_ = function(c) {
      if (typeof c !== 'object' || c.require) {
        return c;
      }
      var require = [];
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = c[key] = (typeof c[key] === 'object') ?
            c[key] : {ideal: c[key]};
        if (r.min !== undefined ||
            r.max !== undefined || r.exact !== undefined) {
          require.push(key);
        }
        if (r.exact !== undefined) {
          if (typeof r.exact === 'number') {
            r. min = r.max = r.exact;
          } else {
            c[key] = r.exact;
          }
          delete r.exact;
        }
        if (r.ideal !== undefined) {
          c.advanced = c.advanced || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[key] = {min: r.ideal, max: r.ideal};
          } else {
            oc[key] = r.ideal;
          }
          c.advanced.push(oc);
          delete r.ideal;
          if (!Object.keys(r).length) {
            delete c[key];
          }
        }
      });
      if (require.length) {
        c.require = require;
      }
      return c;
    };
    constraints = JSON.parse(JSON.stringify(constraints));
    if (browserDetails.version < 38) {
      logging('spec: ' + JSON.stringify(constraints));
      if (constraints.audio) {
        constraints.audio = constraintsToFF37_(constraints.audio);
      }
      if (constraints.video) {
        constraints.video = constraintsToFF37_(constraints.video);
      }
      logging('ff37: ' + JSON.stringify(constraints));
    }
    return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
      onError(shimError_(e));
    });
  };

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      getUserMedia_(constraints, resolve, reject);
    });
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
      addEventListener: function() { },
      removeEventListener: function() { }
    };
  }
  navigator.mediaDevices.enumerateDevices =
      navigator.mediaDevices.enumerateDevices || function() {
        return new Promise(function(resolve) {
          var infos = [
            {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
            {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
          ];
          resolve(infos);
        });
      };

  if (browserDetails.version < 41) {
    // Work around http://bugzil.la/1169665
    var orgEnumerateDevices =
        navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function() {
      return orgEnumerateDevices().then(undefined, function(e) {
        if (e.name === 'NotFoundError') {
          return [];
        }
        throw e;
      });
    };
  }
  if (browserDetails.version < 49) {
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      return origGetUserMedia(c).then(function(stream) {
        // Work around https://bugzil.la/802326
        if (c.audio && !stream.getAudioTracks().length ||
            c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
          throw new DOMException('The object can not be found here.',
                                 'NotFoundError');
        }
        return stream;
      }, function(e) {
        return Promise.reject(shimError_(e));
      });
    };
  }
  if (!(browserDetails.version > 55 &&
      'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
    var remap = function(obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };

    var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      if (typeof c === 'object' && typeof c.audio === 'object') {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
        remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
      }
      return nativeGetUserMedia(c);
    };

    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        var obj = nativeGetSettings.apply(this, arguments);
        remap(obj, 'mozAutoGainControl', 'autoGainControl');
        remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
        return obj;
      };
    }

    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === 'audio' && typeof c === 'object') {
          c = JSON.parse(JSON.stringify(c));
          remap(c, 'autoGainControl', 'mozAutoGainControl');
          remap(c, 'noiseSuppression', 'mozNoiseSuppression');
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
  navigator.getUserMedia = function(constraints, onSuccess, onError) {
    if (browserDetails.version < 44) {
      return getUserMedia_(constraints, onSuccess, onError);
    }
    // Replace Firefox 44+'s deprecation warning with unprefixed version.
    utils.deprecated('navigator.getUserMedia',
        'navigator.mediaDevices.getUserMedia');
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
};

},{"../utils":22}],21:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var utils = require('../utils');

module.exports = {
  shimLocalStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getLocalStreams = function() {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        return this._localStreams;
      };
    }
    if (!('getStreamById' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getStreamById = function(id) {
        var result = null;
        if (this._localStreams) {
          this._localStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        if (this._remoteStreams) {
          this._remoteStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        return result;
      };
    }
    if (!('addStream' in window.RTCPeerConnection.prototype)) {
      var _addTrack = window.RTCPeerConnection.prototype.addTrack;
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        if (this._localStreams.indexOf(stream) === -1) {
          this._localStreams.push(stream);
        }
        var pc = this;
        stream.getTracks().forEach(function(track) {
          _addTrack.call(pc, track, stream);
        });
      };

      window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
        if (stream) {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (this._localStreams.indexOf(stream) === -1) {
            this._localStreams.push(stream);
          }
        }
        return _addTrack.call(this, track, stream);
      };
    }
    if (!('removeStream' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        var index = this._localStreams.indexOf(stream);
        if (index === -1) {
          return;
        }
        this._localStreams.splice(index, 1);
        var pc = this;
        var tracks = stream.getTracks();
        this.getSenders().forEach(function(sender) {
          if (tracks.indexOf(sender.track) !== -1) {
            pc.removeTrack(sender);
          }
        });
      };
    }
  },
  shimRemoteStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getRemoteStreams = function() {
        return this._remoteStreams ? this._remoteStreams : [];
      };
    }
    if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
        get: function() {
          return this._onaddstream;
        },
        set: function(f) {
          if (this._onaddstream) {
            this.removeEventListener('addstream', this._onaddstream);
          }
          this.addEventListener('addstream', this._onaddstream = f);
        }
      });
      var origSetRemoteDescription =
          window.RTCPeerConnection.prototype.setRemoteDescription;
      window.RTCPeerConnection.prototype.setRemoteDescription = function() {
        var pc = this;
        if (!this._onaddstreampoly) {
          this.addEventListener('track', this._onaddstreampoly = function(e) {
            e.streams.forEach(function(stream) {
              if (!pc._remoteStreams) {
                pc._remoteStreams = [];
              }
              if (pc._remoteStreams.indexOf(stream) >= 0) {
                return;
              }
              pc._remoteStreams.push(stream);
              var event = new Event('addstream');
              event.stream = stream;
              pc.dispatchEvent(event);
            });
          });
        }
        return origSetRemoteDescription.apply(pc, arguments);
      };
    }
  },
  shimCallbacksAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    var prototype = window.RTCPeerConnection.prototype;
    var createOffer = prototype.createOffer;
    var createAnswer = prototype.createAnswer;
    var setLocalDescription = prototype.setLocalDescription;
    var setRemoteDescription = prototype.setRemoteDescription;
    var addIceCandidate = prototype.addIceCandidate;

    prototype.createOffer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createOffer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    prototype.createAnswer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createAnswer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    var withCallback = function(description, successCallback, failureCallback) {
      var promise = setLocalDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setLocalDescription = withCallback;

    withCallback = function(description, successCallback, failureCallback) {
      var promise = setRemoteDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setRemoteDescription = withCallback;

    withCallback = function(candidate, successCallback, failureCallback) {
      var promise = addIceCandidate.apply(this, [candidate]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.addIceCandidate = withCallback;
  },
  shimGetUserMedia: function(window) {
    var navigator = window && window.navigator;

    if (!navigator.getUserMedia) {
      if (navigator.webkitGetUserMedia) {
        navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
      } else if (navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia) {
        navigator.getUserMedia = function(constraints, cb, errcb) {
          navigator.mediaDevices.getUserMedia(constraints)
          .then(cb, errcb);
        }.bind(navigator);
      }
    }
  },
  shimRTCIceServerUrls: function(window) {
    // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
    var OrigPeerConnection = window.RTCPeerConnection;
    window.RTCPeerConnection = function(pcConfig, pcConstraints) {
      if (pcConfig && pcConfig.iceServers) {
        var newIceServers = [];
        for (var i = 0; i < pcConfig.iceServers.length; i++) {
          var server = pcConfig.iceServers[i];
          if (!server.hasOwnProperty('urls') &&
              server.hasOwnProperty('url')) {
            utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
            server = JSON.parse(JSON.stringify(server));
            server.urls = server.url;
            delete server.url;
            newIceServers.push(server);
          } else {
            newIceServers.push(pcConfig.iceServers[i]);
          }
        }
        pcConfig.iceServers = newIceServers;
      }
      return new OrigPeerConnection(pcConfig, pcConstraints);
    };
    window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
    // wrap static methods. Currently just generateCertificate.
    if ('generateCertificate' in window.RTCPeerConnection) {
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }
  },
  shimTrackEventTransceiver: function(window) {
    // Add event.transceiver member over deprecated event.receiver
    if (typeof window === 'object' && window.RTCPeerConnection &&
        ('receiver' in window.RTCTrackEvent.prototype) &&
        // can't check 'transceiver' in window.RTCTrackEvent.prototype, as it is
        // defined for some reason even when window.RTCTransceiver is not.
        !window.RTCTransceiver) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function() {
          return {receiver: this.receiver};
        }
      });
    }
  },

  shimCreateOfferLegacy: function(window) {
    var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
    window.RTCPeerConnection.prototype.createOffer = function(offerOptions) {
      var pc = this;
      if (offerOptions) {
        if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
        }
        var audioTransceiver = pc.getTransceivers().find(function(transceiver) {
          return transceiver.sender.track &&
              transceiver.sender.track.kind === 'audio';
        });
        if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
          if (audioTransceiver.direction === 'sendrecv') {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection('sendonly');
            } else {
              audioTransceiver.direction = 'sendonly';
            }
          } else if (audioTransceiver.direction === 'recvonly') {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection('inactive');
            } else {
              audioTransceiver.direction = 'inactive';
            }
          }
        } else if (offerOptions.offerToReceiveAudio === true &&
            !audioTransceiver) {
          pc.addTransceiver('audio');
        }


        if (typeof offerOptions.offerToReceiveVideo !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
        }
        var videoTransceiver = pc.getTransceivers().find(function(transceiver) {
          return transceiver.sender.track &&
              transceiver.sender.track.kind === 'video';
        });
        if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
          if (videoTransceiver.direction === 'sendrecv') {
            videoTransceiver.setDirection('sendonly');
          } else if (videoTransceiver.direction === 'recvonly') {
            videoTransceiver.setDirection('inactive');
          }
        } else if (offerOptions.offerToReceiveVideo === true &&
            !videoTransceiver) {
          pc.addTransceiver('video');
        }
      }
      return origCreateOffer.apply(pc, arguments);
    };
  }
};

},{"../utils":22}],22:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logDisabled_ = true;
var deprecationWarnings_ = true;

/**
 * Extract browser version out of the provided user agent string.
 *
 * @param {!string} uastring userAgent string.
 * @param {!string} expr Regular expression used as match criteria.
 * @param {!number} pos position in the version string to be returned.
 * @return {!number} browser version.
 */
function extractVersion(uastring, expr, pos) {
  var match = uastring.match(expr);
  return match && match.length >= pos && parseInt(match[pos], 10);
}

// Wraps the peerconnection event eventNameToWrap in a function
// which returns the modified event object (or false to prevent
// the event).
function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
  if (!window.RTCPeerConnection) {
    return;
  }
  var proto = window.RTCPeerConnection.prototype;
  var nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    var wrappedCallback = function(e) {
      var modifiedEvent = wrapper(e);
      if (modifiedEvent) {
        cb(modifiedEvent);
      }
    };
    this._eventMap = this._eventMap || {};
    this._eventMap[cb] = wrappedCallback;
    return nativeAddEventListener.apply(this, [nativeEventName,
      wrappedCallback]);
  };

  var nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap
        || !this._eventMap[cb]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    var unwrappedCb = this._eventMap[cb];
    delete this._eventMap[cb];
    return nativeRemoveEventListener.apply(this, [nativeEventName,
      unwrappedCb]);
  };

  Object.defineProperty(proto, 'on' + eventNameToWrap, {
    get: function() {
      return this['_on' + eventNameToWrap];
    },
    set: function(cb) {
      if (this['_on' + eventNameToWrap]) {
        this.removeEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap]);
        delete this['_on' + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap] = cb);
      }
    },
    enumerable: true,
    configurable: true
  });
}

// Utility methods.
module.exports = {
  extractVersion: extractVersion,
  wrapPeerConnectionEvent: wrapPeerConnectionEvent,
  disableLog: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    logDisabled_ = bool;
    return (bool) ? 'adapter.js logging disabled' :
        'adapter.js logging enabled';
  },

  /**
   * Disable or enable deprecation warnings
   * @param {!boolean} bool set to true to disable warnings.
   */
  disableWarnings: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    deprecationWarnings_ = !bool;
    return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
  },

  log: function() {
    if (typeof window === 'object') {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log.apply(console, arguments);
      }
    }
  },

  /**
   * Shows a deprecation warning suggesting the modern and spec-compatible API.
   */
  deprecated: function(oldMethod, newMethod) {
    if (!deprecationWarnings_) {
      return;
    }
    console.warn(oldMethod + ' is deprecated, please use ' + newMethod +
        ' instead.');
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *     properties.
   */
  detectBrowser: function(window) {
    var navigator = window && window.navigator;

    // Returned result object.
    var result = {};
    result.browser = null;
    result.version = null;

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    if (navigator.mozGetUserMedia) { // Firefox.
      result.browser = 'firefox';
      result.version = extractVersion(navigator.userAgent,
          /Firefox\/(\d+)\./, 1);
    } else if (navigator.webkitGetUserMedia) {
      // Chrome, Chromium, Webview, Opera.
      // Version matches Chrome/WebRTC version.
      result.browser = 'chrome';
      result.version = extractVersion(navigator.userAgent,
          /Chrom(e|ium)\/(\d+)\./, 2);
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) { // Edge.
      result.browser = 'edge';
      result.version = extractVersion(navigator.userAgent,
          /Edge\/(\d+).(\d+)$/, 2);
    } else if (window.RTCPeerConnection &&
        navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) { // Safari.
      result.browser = 'safari';
      result.version = extractVersion(navigator.userAgent,
          /AppleWebKit\/(\d+)\./, 1);
    } else { // Default fallthrough: not supported.
      result.browser = 'Not a supported browser.';
      return result;
    }

    return result;
  }
};

},{}],23:[function(require,module,exports){
//LICENSE! This Code can be used and executed as a part of Flashphoner Web Call Server platform and having an appropriate Web Call Server license. You shall not use this code separately from Web Call Server platform. Contacts: http://flashphoner.com, support@flashphoner.com.
var requestAnimFrame=(function(){return function(callback){window.setTimeout(callback,33.333333333333336);};})();function WSPlayer(){this.f=N.Aa;this.AZ=false;}WSPlayer.prototype.init=function(K,audioContext,reinit){this.canvas=K.canvas;this.api=K.api;this.K=K;this.l();try{this.T=new AudioPlayer(audioContext);}catch(e){wsLogger.error("Failed to init audio player "+e);return;}try{this.M=new VideoRenderer(this.canvas,false,"yuv");this.M.init();}catch(e){wsLogger.error("Failed to init video renderer "+e);return;}if(!reinit){try{if(this.j){this.j.terminate();}this.j=new Worker(K.receiverPath);this.j.addEventListener("message",(function(e){switch(e.data.message){case"connection":if(e.data.status=="failed"||e.data.status=="closed"){this.stop();this.AZ=false;}break;case"AVData":var C;if(e.data.audioLength>0){this.BU=true;for(C=0;C<e.data.audio.length;C++){this.T.B9(e.data.audio[C]);}}if(e.data.videoLength>0){wsLogger.debug("Received video, frames:"+e.data.videoLength);this.BN=true;for(C=0;C<e.data.video.length;C++){this.AC.push(e.data.video[C]);}this.B2=e.data.videoLength/e.data.video.length;}var B0=this.T.BA();if(this.AC.length>0){if(this.f==N.AX){if(this.M.AT){this.R.length=0;this.q.length=0;while(this.AC.length>0){if(this.AC[0].ts<B0+50){this.AA();}else{break;}}}else if(this.q.length<2){this.AA();}}else{while(this.AA()){}}}this.j.postMessage({message:"ack",data:{seq:e.data.seq,time:Date.now(),audioReceivedLength:e.data.audioLength,videoReceivedLength:e.data.videoLength,audioCurrentTime:B0,audioBufferTimeLength:this.T.getBufferTimeLength(),videoBufferTimeLength:(this.AC.length+this.q.length+this.R.length)*this.B2}});break;default:wsLogger.error("Unknown request");}}).bind(this),false);var conf={};conf.audioChunkLength=this.T.internalBufferSize;conf.audioContextSampleRate=this.T.O.sampleRate;conf.videoWidth=K.videoWidth;conf.videoHeight=K.videoHeight;conf.urlWsServer=K.urlWsServer;conf.token=K.token;conf.audioBufferWaitFor=K.audioBufferWaitFor;conf.videoBufferWaitFor=K.videoBufferWaitFor;conf.dropDelayMultiplier=K.dropDelayMultiplier;this.j.postMessage({message:"init",data:conf});}catch(e){wsLogger.error("Failed to init stream receiver "+e);return;}}try{if(this.AL){this.AL.terminate();}this.AL=new Worker(K.decoderPath);this.AL.onmessage=(function(e){if(this.q.length==0){wsLogger.warn("No timestamp available for decoded picture, discarding");return;}e.data.sync=this.q.shift();this.R.push(e.data);if(this.f!=N.AX&&this.f!=N.Aa){if(this.R.length<5){if(this.R.length>1&&this.T.Z.length>0){if(this.T.Z[0].sync>this.R[0].sync){this.R[0]=null;this.R.shift();}}this.AA();}else{this.f=N.AX;this.T.start();requestAnimFrame(this.A9.bind(this));}}else{if(this.q.length<2){this.AA();}}}).bind(this);this.AL.postMessage({message:"init",width:K.videoWidth,height:K.videoHeight,outputGl:true});}catch(e){wsLogger.error("Failed to init video decoder "+e);return;}this.CH=0;this.CO=0;this.BI=0;this.DC=false;this.DA=0;this.AZ=true;};WSPlayer.prototype.l=function(){this.BU=false;this.BN=false;if(this.AC){this.AC.length=0;}else{this.AC=[];}if(this.q){this.q.length=0;}else{this.q=[];}if(this.R){this.R.length=0;}else{this.R=[];}this.Be=false;this.lastPlayedVideoTime=0;this.lastPlayedVideoTimestamp=0;};WSPlayer.prototype.AA=function(){if(this.AC.length>0){if(this.Be||this.AC[0].kframe){this.Be=true;if(!this.M.AT){this.q.push(this.AC[0].ts);}this.AL.postMessage({message:"decode",skip:this.M.AT,data:this.AC[0].payload},[this.AC[0].payload.buffer]);this.AC[0]=null;this.AC.shift();return true;}this.AC[0]=null;this.AC.shift();}};WSPlayer.prototype.play=function(streamId){if(!this.AZ){wsLogger.error("Can't play stream, player not initialized!");return;}this.l();this.j.postMessage({message:"play"});this.stream=streamId;this.unmute();this.f=N.BY;};WSPlayer.prototype.playFirstSound=function(){var Z=this.T.O.createBuffer(1,441,44100);var output=Z.getChannelData(0);for(var C=0;C<output.length;C++){output[C]=Math.random()*2-1;}var src=this.T.O.createBufferSource();src.buffer=Z;src.connect(this.T.O.destination);src.start(0);};WSPlayer.prototype.pause=function(){this.mute();this.j.postMessage({message:"pause"});this.f=N.CR;};WSPlayer.prototype.mute=function(){if(this.T){this.T.mute(true);}if(this.M){this.M.mute(true);}};WSPlayer.prototype.unmute=function(){if(this.T){this.T.mute(false);}if(this.M){this.M.mute(false);}};WSPlayer.prototype.resume=function(){this.l();this.f=N.BY;this.j.postMessage({message:"resume"});this.unmute();};WSPlayer.prototype.setVolume=function(volume){this.T.setVolume(volume);};WSPlayer.prototype.getVolume=function(){return this.T.getVolume();};WSPlayer.prototype.stop=function(){this.f=N.Aa;if(this.j){this.j.postMessage({message:"stop"});}if(this.T){this.T.stop();}if(this.M){this.M.stop();}this.CH=0;this.CO=0;this.BI=0;};WSPlayer.prototype.A9=function(CQ){if(this.f!=N.AX){return;}if(this.R.length>0){var Af=this.T.BA();if(Af==-1){var currentTime=Date.now();if(this.lastPlayedVideoTime==0){Af=this.R[0].sync;this.lastPlayedVideoTime=currentTime;this.lastPlayedVideoTimestamp=Af;wsLogger.log("Init Video playout without sync, currentTime "+currentTime+", timestamp "+this.lastPlayedVideoTimestamp);}else{var elapsed=currentTime-this.lastPlayedVideoTime;var rtpElapsed=this.R[0].sync-this.lastPlayedVideoTimestamp;if(elapsed>=rtpElapsed){Af=this.R[0].sync;this.lastPlayedVideoTime+=rtpElapsed;this.lastPlayedVideoTimestamp=Af;}else{Af=this.R[0].sync-1;}}}wsLogger.trace("requestVideoFrameCallback, audio player time "+Af+" callback timestamp "+CQ);if(Af-this.R[0].sync>100&&this.R.length>1){this.R.shift();}if(this.R[0].sync<=Af){this.M.CT(this.R.shift());this.BI++;if(this.BI==1){var event=new CustomEvent("playing");this.canvas.dispatchEvent(event);}}}if(this.q.length<3){this.AA();}requestAnimFrame(this.A9.bind(this));};WSPlayer.prototype.DN=function(message){if(this.Bb){if(Date.now()-this.Bb<1000){return;}}var event={status:"PLAYBACK_PROBLEM",info:message};this.api(event);this.Bb=Date.now();};WSPlayer.prototype.Bv=function(text){var U=this.M.V;if(U){var textSize=U.measureText(text);U.fillStyle="white";var rectHeight=30;U.fillRect(0,this.canvas.height/2-rectHeight/2,this.canvas.width,rectHeight);U.fillStyle="black";U.font="30pt";U.textAlign="center";U.fillText(text,this.canvas.width/2,this.canvas.height/2);}else{}};WSPlayer.prototype.DB=function(text){var U=this.M.V;if(U){U.fillStyle="red";U.font="40pt";U.fillText(text,20,this.canvas.height-20);}else{}};WSPlayer.prototype.initLogger=function(verbosity){this.verbosity=verbosity||2;var G=this;if(window.wsLogger==undefined){window.wsLogger={log:function(){if(G.verbosity>=2){window.console.log.apply(window.console,arguments);}},warn:function(){if(G.verbosity>=1){window.console.warn.apply(window.console,arguments);}},error:function(){if(G.verbosity>=0){window.console.error.apply(window.console,arguments);}},debug:function(){if(G.verbosity>=3){window.console.log.apply(window.console,arguments);}},trace:function(){if(G.verbosity>=4){window.console.log.apply(window.console,arguments);}}};}if(window.wsLogger.debug==undefined){window.wsLogger.debug=function(){if(G.verbosity>=3){window.console.log.apply(window.console,arguments);}};}if(window.wsLogger.trace==undefined){window.wsLogger.trace=function(){if(G.verbosity>=4){window.console.log.apply(window.console,arguments);}};}};WSPlayer.prototype.getStreamStatistics=function(type){if(type=="audio"){return this.BU;}else if(type=="video"){return this.BN;}};var VideoRenderer=function(canvas,Am,Ak){this.canvas=canvas;this.width=canvas.width;this.height=canvas.height;this.AB=null;this.V=null;this.Am=Am;this.Ak=Ak;this.gl=null;this.program=null;this.buffer=null;this.YTexture=null;this.CBTexture=null;this.CRTexture=null;this.RGBTexture=null;this.AM=null;this.Aq=null;this.AK=null;this.AW=null;this.AT=false;this.CG=["precision mediump float;","uniform sampler2D YTexture;","uniform sampler2D CBTexture;","uniform sampler2D CRTexture;","varying vec2 texCoord;","void main() {","float y = texture2D(YTexture, texCoord).r;","float cr = texture2D(CRTexture, texCoord).r - 0.5;","float cb = texture2D(CBTexture, texCoord).r - 0.5;","gl_FragColor = vec4(","y + 1.4 * cr,","y + -0.343 * cb - 0.711 * cr,","y + 1.765 * cb,","1.0",");","}"].join("\n");this.CI=["attribute vec2 vertex;","varying vec2 texCoord;","void main() {","texCoord = vertex;","gl_Position = vec4((vertex * 2.0 - 1.0) * vec2(1, -1), 0.0, 1.0);","}"].join("\n");this.CL=["attribute vec4 vertex;","varying vec2 tc;","void main(){","gl_Position = vertex;","tc = vertex.xy*0.5+0.5;","}"].join("\n");this.CY=["precision mediump float;","uniform sampler2D RGBTexture;","varying vec2 tc;","void main(){","gl_FragColor = texture2D(RGBTexture, tc);","}"].join("\n");};VideoRenderer.prototype.init=function(){if(!this.Am){try{var gl=this.gl=this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl");}catch(e){wsLogger.error("Failed to get webgl context, error "+e);}}if(gl){if(this.Ak=="rgba"){this.CK(gl);}else{this.CN(gl);}}else{this.V=this.canvas.getContext("2d");this.AB=this.Ay;}this.l();};VideoRenderer.prototype.CN=function(gl){this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,0,1,1,0,1,1]),gl.STATIC_DRAW);this.program=gl.createProgram();gl.attachShader(this.program,this.compileShader(gl.VERTEX_SHADER,this.CI));gl.attachShader(this.program,this.compileShader(gl.FRAGMENT_SHADER,this.CG));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS)){wsLogger.error("Failed to init WebGL! Message "+gl.getProgramInfoLog(this.program));this.V=this.canvas.getContext("2d");this.AB=this.Ay;return;}gl.useProgram(this.program);this.YTexture=this.createTexture(0,"YTexture");this.CRTexture=this.createTexture(1,"CRTexture");this.CBTexture=this.createTexture(2,"CBTexture");var vertexAttr=gl.getAttribLocation(this.program,"vertex");gl.enableVertexAttribArray(vertexAttr);gl.vertexAttribPointer(vertexAttr,2,gl.FLOAT,false,0,0);this.AB=this.CJ;};VideoRenderer.prototype.CK=function(gl){this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,1,1,-1,1,-1,-1]),gl.STATIC_DRAW);this.program=gl.createProgram();gl.attachShader(this.program,this.compileShader(gl.VERTEX_SHADER,this.CL));gl.attachShader(this.program,this.compileShader(gl.FRAGMENT_SHADER,this.CY));gl.bindAttribLocation(this.program,0,"vertex");gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS)){wsLogger.error("Failed to init WebGL! Message "+gl.getProgramInfoLog(this.program));this.V=this.canvas.getContext("2d");this.AB=this.Ay;return;}gl.useProgram(this.program);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);this.RGBTexture=this.createTexture(0,"RGBTexture");this.AB=this.CA;};VideoRenderer.prototype.l=function(){this.width=this.canvas.width;this.height=this.canvas.height;this.Aq=parseInt(this.width)+15>>4;this.AK=this.Aq<<4;this.AW=this.Aq<<3;var MaybeClampedUint8Array;if(typeof Uint8ClampedArray!=="undefined"){MaybeClampedUint8Array=Uint8ClampedArray;}else{MaybeClampedUint8Array=Uint8Array;}if(this.V){this.AM=new MaybeClampedUint8Array(this.canvas.width*this.canvas.height*4);for(var C=0,length=this.AM.length;C<length;C++){this.AM[C]=255;}}else if(this.gl){this.gl.viewport(0,0,this.width,this.height);}};VideoRenderer.prototype.stop=function(){if(this.V){var data=this.V.createImageData(this.width,this.height);this.V.putImageData(data,0,0);}else if(this.gl){this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);}};VideoRenderer.prototype.createTexture=function(index,name){var gl=this.gl;var BM=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,BM);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(gl.getUniformLocation(this.program,name),index);return BM;};VideoRenderer.prototype.compileShader=function(type,source){var gl=this.gl;var shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){throw new Error(gl.getShaderInfoLog(shader));}return shader;};VideoRenderer.prototype.isUsingWebGL=function(){return(this.gl!==null||this.gl!==undefined)&&(this.V==null||this.V==undefined);};VideoRenderer.prototype.CJ=function(frame){var gl=this.gl;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.YTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,this.AK,this.height,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,frame.y);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.CRTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,this.AW,this.height/2,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,frame.cr);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,this.CBTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,this.AW,this.height/2,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,frame.cb);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);};VideoRenderer.prototype.CA=function(data){var gl=this.gl;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.RGBTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,data.width,data.height,0,gl.RGBA,gl.UNSIGNED_BYTE,data.data);gl.drawArrays(gl.TRIANGLES,0,6);};VideoRenderer.prototype.Ay=function(frame){var data=this.V.createImageData(frame.width,frame.height);if(frame.type=="yuv"){this.By(frame);data.data.set(this.AM);}else{data.data.set(frame.data);}this.V.putImageData(data,0,0);};VideoRenderer.prototype.CT=function(frame){if(!this.AT){if(this.canvas.width!=frame.width||this.canvas.height!=frame.height){wsLogger.log("Changing canvas resolution from "+this.canvas.width+"x"+this.canvas.height+" to "+frame.width+"x"+frame.height);this.canvas.width=frame.width;this.canvas.height=frame.height;var event=new Event("resize");this.canvas.dispatchEvent(event);this.l();}this.AB(frame);}this.Bl=Date.now();};VideoRenderer.prototype.By=function(frame){var Ae=frame.y;var Bo=frame.cb;var Bn=frame.cr;var W=this.AM;var A4=0;var Av=this.AK;var BK=this.AK+(this.AK-frame.width);var Ah=0;var Bj=this.AW-(frame.width>>1);var p=0;var m=frame.width*4;var Ba=frame.width*4;var B8=frame.width>>1;var rows=frame.height>>1;var y,cb,cr,AO,AR,AP;for(var BH=0;BH<rows;BH++){for(var BQ=0;BQ<B8;BQ++){cb=Bo[Ah];cr=Bn[Ah];Ah++;AO=cr+(cr*103>>8)-179;AR=(cb*88>>8)-44+(cr*183>>8)-91;AP=cb+(cb*198>>8)-227;var A2=Ae[A4++];var Ap=Ae[A4++];W[p]=A2+AO;W[p+1]=A2-AR;W[p+2]=A2+AP;W[p+4]=Ap+AO;W[p+5]=Ap-AR;W[p+6]=Ap+AP;p+=8;var A1=Ae[Av++];var Az=Ae[Av++];W[m]=A1+AO;W[m+1]=A1-AR;W[m+2]=A1+AP;W[m+4]=Az+AO;W[m+5]=Az-AR;W[m+6]=Az+AP;m+=8;}A4+=BK;Av+=BK;p+=Ba;m+=Ba;Ah+=Bj;}};VideoRenderer.prototype.Cz=function(){return this.Bl;};VideoRenderer.prototype.mute=function(mute){if(mute){this.AT=true;}else{this.AT=false;}};function AudioPlayer(audioContext){var G=this;this.l();this.Aw=false;this.O=audioContext;this.o=audioContext.createGain();this.o.connect(audioContext.destination);this.mute(true);wsLogger.log("Sample rate "+this.O.sampleRate);var AN=[];var C;for(C=256;C<=16384;C=C*2){AN.push(C);}var BC=this.O.sampleRate/1;var AV=AN[0];var Ag=Math.abs(BC-AV);for(C=0;C<AN.length;C++){var BL=Math.abs(BC-AN[C]);if(BL<Ag){Ag=BL;AV=AN[C];}}wsLogger.log("Audio node buffer size "+AV);this.internalBufferSize=AV;this.v=this.internalBufferSize/this.O.sampleRate*1000;try{this.O.createScriptProcessor=this.O.createScriptProcessor||this.O.createJavaScriptNode;this.Aj=this.O.createScriptProcessor(this.internalBufferSize,1,1);}catch(e){wsLogger.error("JS Audio Node is not supported in this browser"+e);}this.Aj.onaudioprocess=function(event){var output=event.outputBuffer.getChannelData(0);var C;if(G.Z.length>0){var Al=G.Z.shift();for(C=0;C<output.length;C++){output[C]=Al.payload[C];}if(!G.z){G.BS=Al.sync;}else{G.BS=G.z;}G.z=Al.sync;if(!G.d){G.BW=event.playbackTime*1000;}else{G.BW=G.d;}G.d=event.playbackTime*1000;G.CV=false;}else{for(C=0;C<output.length;C++){output[C]=0;}G.CV=true;if(G.o.gain.value!=0){wsLogger.debug("No audio in audio buffer!");}}};}AudioPlayer.prototype.start=function(){if(!this.Aw){this.Aj.connect(this.o);this.Aw=true;}this.mute(false);};AudioPlayer.prototype.stop=function(){this.Aj.disconnect();this.Aw=false;this.z=undefined;this.d=undefined;this.Z=[];this.mute(true);};AudioPlayer.prototype.l=function(){if(this.Z){this.Z.length=0;}else{this.Z=[];}};AudioPlayer.prototype.C4=function(){this.l();};AudioPlayer.prototype.B9=function(CU){this.Z.push(CU);};AudioPlayer.prototype.Cy=function(){return this.Z.length;};AudioPlayer.prototype.BA=function(){if(this.z&&this.d){var time=this.O.currentTime*1000;if(time>=this.d){if(time-this.d>this.v){wsLogger.debug("No audio! "+(time-this.v-this.d));return this.z+this.v;}return time-this.d+this.z;}else{return time-this.BW+this.BS;}}return-1;};AudioPlayer.prototype.getBufferTimeLength=function(){var CW=this.O.currentTime*1000-this.d;var BZ=this.v-CW;return BZ>0?this.v*this.Z.length+BZ:this.v*this.Z.length;};AudioPlayer.prototype.C1=function(){return this.d;};AudioPlayer.prototype.mute=function(mute){if(mute){wsLogger.log("Audio player mute");this.o.gain.value=0;}else{wsLogger.log("Audio player resume");this.o.gain.value=1;}};AudioPlayer.prototype.setVolume=function(volume){this.o.gain.value=volume/100;};AudioPlayer.prototype.getVolume=function(){return this.o.gain.value*100;};var N=function(){};N.Aa="STOPPED";N.AX="PLAYING";N.CR="PAUSED";N.BY="STARTUP";exports.WSPlayer=WSPlayer;
},{}],24:[function(require,module,exports){
'use strict';

/**
 * @namespace Flashphoner.constants.SESSION_STATUS
 * @see Session
 */
var sessionStatus = {};

/**
 * Fires when {@link Session} ws socket opens.
 * @event CONNECTED
 * @memberof Flashphoner.constants.SESSION_STATUS
 */
define(sessionStatus, 'CONNECTED', 'CONNECTED');

/**
 * Fires when {@link Session} receives connect ack from REST App.
 * @event ESTABLISHED
 * @memberof Flashphoner.constants.SESSION_STATUS
 */
define(sessionStatus, 'ESTABLISHED', 'ESTABLISHED');

/**
 * Fires when {@link Session} disconnects.
 * @event DISCONNECTED
 * @memberof Flashphoner.constants.SESSION_STATUS
 */
define(sessionStatus, 'DISCONNECTED', 'DISCONNECTED');

/**
 * Fires if {@link Session} call of rest method error.
 * @event WARN
 * @memberof Flashphoner.constants.SESSION_STATUS
 */
define(sessionStatus, 'WARN', 'WARN');

/**
 * Fires if {@link Session} connection failed.
 * Some of the reasons can be network connection failed, REST App failed
 * @event FAILED
 * @memberof Flashphoner.constants.SESSION_STATUS
 */
define(sessionStatus, 'FAILED', 'FAILED');

/**
 * Fires wneh {@link Session} receives debug event
 * @event DEBUG
 * @memberof Flashphoner.constants.SESSION_STATUS
 */
define(sessionStatus, 'DEBUG', 'DEBUG');

/**
 * Fires when {@link Session} receives custom REST App message.
 *
 * @event APP_DATA
 * @memberof Flashphoner.constants.SESSION_STATUS
 */
define(sessionStatus, 'APP_DATA', 'APP_DATA');

/**
 * Fires when {@link Session} receives status of sendData operation.
 *
 * @event SEND_DATA_STATUS
 * @memberof Flashphoner.constants.SESSION_STATUS
 */
define(sessionStatus, 'SEND_DATA_STATUS', 'SEND_DATA_STATUS');

//State of newly created Session
define(sessionStatus, 'PENDING', 'PENDING');

/**
 * Fires when {@link Session} registers as sip client.
 *
 * @event APP_DATA
 * @memberof Flashphoner.constants.SESSION_STATUS
 */
define(sessionStatus, 'REGISTERED', 'REGISTERED');

/**
 * Fires when {@link Session} unregisters as sip client.
 *
 * @event APP_DATA
 * @memberof Flashphoner.constants.SESSION_STATUS
 */
define(sessionStatus, 'UNREGISTERED', 'UNREGISTERED');

define(sessionStatus, 'INCOMING_CALL', 'INCOMING_CALL');

/**
 * @namespace Flashphoner.constants.STREAM_STATUS
 * @see Stream
 */
var streamStatus = {};
//State of newly created Stream
define(streamStatus, 'NEW', 'NEW');
//State between publish/play and server response
define(streamStatus, 'PENDING', 'PENDING');

/**
 * Fires when {@link Stream} starts publishing.
 * @event PUBLISHING
 * @memberof Flashphoner.constants.STREAM_STATUS
 */
define(streamStatus, 'PUBLISHING', 'PUBLISHING');

/**
 * Fires when {@link Stream} starts playing.
 * @event PLAYING
 * @memberof Flashphoner.constants.STREAM_STATUS
 */
define(streamStatus, 'PLAYING', 'PLAYING');

/**
 * Fires if {@link Stream} paused.
 * @event PAUSED
 * @memberof Flashphoner.constants.STREAM_STATUS
 */
define(streamStatus, 'PAUSED', 'PAUSED');

/**
 * Fires if {@link Stream} was unpublished.
 * @event UNPUBLISHING
 * @memberof Flashphoner.constants.STREAM_STATUS
 */
define(streamStatus, 'UNPUBLISHED', 'UNPUBLISHED');

/**
 * Fires if {@link Stream} was stopped.
 * @event STOPPED
 * @memberof Flashphoner.constants.STREAM_STATUS
 */
define(streamStatus, 'STOPPED', 'STOPPED');

/**
 * Fires if {@link Stream} failed.
 * @event FAILED
 * @memberof Flashphoner.constants.STREAM_STATUS
 */
define(streamStatus, 'FAILED', 'FAILED');

/**
 * Fires if {@link Stream} playback problem.
 * @event PLAYBACK_PROBLEM
 * @memberof Flashphoner.constants.STREAM_STATUS
 */
define(streamStatus, 'PLAYBACK_PROBLEM', 'PLAYBACK_PROBLEM');

/**
 * Fires if {@link Stream} resize.
 * @event RESIZE
 * @memberof Flashphoner.constants.STREAM_STATUS
 */
define(streamStatus, 'RESIZE', 'RESIZE');

/**
 * Fires when {@link Stream} snapshot becomes available.
 * Snapshot is base64 encoded png available through {@link Stream.getInfo}
 * @event SNAPSHOT_COMPLETE
 * @memberof Flashphoner.constants.STREAM_STATUS
 */
define(streamStatus, 'SNAPSHOT_COMPLETE', 'SNAPSHOT_COMPLETE');

/**
 * Fires on subscribe {@link Stream} if bitrate is higher than available network bandwidth.
 * @event NOT_ENOUGH_BANDWIDTH
 * @memberof Flashphoner.constants.NOT_ENOUGH_BANDWIDTH
 */
define(streamStatus, 'NOT_ENOUGH_BANDWIDTH', 'NOT_ENOUGH_BANDWIDTH');

/**
 * @namespace Flashphoner.constants.CALL_STATUS
 * @see Call
 */
var callStatus = {};
//State of newly created Call
define(callStatus, 'NEW', 'NEW');
define(callStatus, 'RING', 'RING');
define(callStatus, 'RING_MEDIA', 'RING_MEDIA');
define(callStatus, 'HOLD', 'HOLD');
define(callStatus, 'ESTABLISHED', 'ESTABLISHED');
define(callStatus, 'FINISH', 'FINISH');
define(callStatus, 'BUSY', 'BUSY');
define(callStatus, 'SESSION_PROGRESS', 'SESSION_PROGRESS');
define(callStatus, 'FAILED', 'FAILED');
define(callStatus, 'PENDING', 'PENDING');
define(callStatus, 'TRYING', 'TRYING');

/**
* @namespace Flashphoner.constants.STREAM_STATUS_INFO
* @see Stream
*/
var streamStatusInfo = {};

/**
 * Indicates general error during ICE negotiation. Usually occurs if client is behind some exotic nat/firewall.
 * @event FAILED_BY_ICE_ERROR
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_BY_ICE_ERROR', 'Failed by ICE error');

/**
 * Timeout has been reached during ICE establishment.
 * @event FAILED_BY_ICE_TIMEOUT
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_BY_ICE_TIMEOUT', 'Failed by ICE timeout');

/**
 * ICE refresh failed on session.
 * @event FAILED_BY_KEEP_ALIVE
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_BY_KEEP_ALIVE', 'Failed by ICE keep alive');

/**
 * DTLS has wrong fingerprint.
 * @event FAILED_BY_DTLS_FINGERPRINT_ERROR
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_BY_DTLS_FINGERPRINT_ERROR', 'Failed by DTLS fingerprint error');

/**
 * Client did not send DTLS packets or packets were lost/corrupted during transmission.
 * @event FAILED_BY_DTLS_ERROR
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_BY_DTLS_ERROR', 'Failed by DTLS error');

/**
 * Indicates general HLS packetizer error, can occur during initialization or packetization (wrong input or out of disk space).
 * @event FAILED_BY_HLS_WRITER_ERROR
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_BY_HLS_WRITER_ERROR', 'Failed by HLS writer error');

/**
 * Indicates general RTMP republishing error, can occur during initialization or rtmp packetization.
 * @event FAILED_BY_RTMP_WRITER_ERROR
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_BY_RTMP_WRITER_ERROR', 'Failed by RTMP writer error');

/**
 * RTP session failed by RTP activity timer.
 * @event FAILED_BY_RTP_ACTIVITY
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_BY_RTP_ACTIVITY', 'Failed by RTP activity');

/**
 * Related session was disconnected.
 * @event STOPPED_BY_SESSION_DISCONNECT
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'STOPPED_BY_SESSION_DISCONNECT', 'Stopped by session disconnect');

/**
 * Stream was stopped by rest terminate request.
 * @event STOPPED_BY_REST_TERMINATE
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'STOPPED_BY_REST_TERMINATE', 'Stopped by rest /terminate');

/**
 * Related publisher stopped its stream or lost connection.
 * @event STOPPED_BY_PUBLISHER_STOP
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'STOPPED_BY_PUBLISHER_STOP', 'Stopped by publisher stop');

/**
 * Stop the media session by user after call was finished or unpublish stream.
 * @event STOPPED_BY_USER
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'STOPPED_BY_USER', 'Stopped by user');

/**
 * Error occurred on the stream.
 * @event FAILED_BY_ERROR
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_BY_ERROR', 'Failed by error');

/**
 * Indicates that error occurred during media session creation. This might be SDP parsing error, all ports are busy, wrong session related config etc.
 * @event FAILED_TO_ADD_STREAM_TO_PROXY
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_TO_ADD_STREAM_TO_PROXY', 'Failed to add stream to proxy');

/**
 * Stopped shapshot distributor.
 * @event DISTRIBUTOR_STOPPED
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'DISTRIBUTOR_STOPPED', 'Distributor stopped');

/**
 * Publish stream is not ready, try again later.
 * @event PUBLISH_STREAM_IS_NOT_READY
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'PUBLISH_STREAM_IS_NOT_READY', 'Publish stream is not ready');

/**
 * Stream with this name is not found, check the correct of the name.
 * @event STREAM_NOT_FOUND
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'STREAM_NOT_FOUND', 'Stream not found');

/**
 * Server already has a publish stream with the same name, try using different one.
 * @event STREAM_NAME_ALREADY_IN_USE
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'STREAM_NAME_ALREADY_IN_USE', 'Stream name is already in use');

/**
 * Error indicates that stream object received by server has empty mediaSessionId field.
 * @event MEDIASESSION_ID_NULL
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'MEDIASESSION_ID_NULL', 'MediaSessionId is null');

/**
 * Published or subscribed sessions used this MediaSessionId.
 * @event MEDIASESSION_ID_ALREADY_IN_USE
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'MEDIASESSION_ID_ALREADY_IN_USE', 'MediaSessionId is already in use');

/**
 * Session is not initialized or terminated on play ordinary stream.
 * @event SESSION_NOT_READY
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'SESSION_NOT_READY', 'Session not ready');

/**
 * Actual session does not exist.
 * @event SESSION_DOES_NOT_EXIST
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'SESSION_DOES_NOT_EXIST', 'Session does not exist');

/**
 * RTSP has wrong format on play stream, check correct of the RTSP url.
 * @event RTSP_HAS_WRONG_FORMAT
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'RTSP_HAS_WRONG_FORMAT', 'Rtsp has wrong format');

/**
 * Failed to play vod stream, this format is not supported.
 * @event FILE_HAS_WRONG_FORMAT
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FILE_HAS_WRONG_FORMAT', 'File has wrong format');

/**
 * Failed to connect to rtsp stream.
 * @event FAILED_TO_CONNECT_TO_RTSP_STREAM
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_TO_CONNECT_TO_RTSP_STREAM', 'Failed to connect to rtsp stream');

/**
 * Rtsp stream is not found, agent received "404-Not Found".
 * @event RTSP_STREAM_NOT_FOUND
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'RTSP_STREAM_NOT_FOUND', 'Rtsp stream not found');

/**
 * On shutdown RTSP agent.
 * @event RTSPAGENT_SHUTDOWN
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'RTSPAGENT_SHUTDOWN', 'RtspAgent shutdown');

/**
 * Stream failed
 * @event STREAM_FAILED
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'STREAM_FAILED', 'Stream failed');

/**
 * No common codecs on setup track, did not found corresponding trackId->mediaPort.
 * @event NO_COMMON_CODECS
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'NO_COMMON_CODECS', 'No common codecs');

/**
 * Bad referenced rtsp link, check for correct, example: rtsp://user:b@d_password@127.0.0.1/stream.
 * @event BAD_URI
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'BAD_URI', 'Bad URI');

/**
 * General VOD error, indicates that Exception occurred while reading/processing media file.
 * @event GOT_EXCEPTION_WHILE_STREAMING_FILE
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'GOT_EXCEPTION_WHILE_STREAMING_FILE', 'Got exception while streaming file');

/**
 * Requested stream shutdown.
 * @event REQUESTED_STREAM_SHUTDOWN
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'REQUESTED_STREAM_SHUTDOWN', 'Requested stream shutdown');

/**
 * Failed to create movie, file can not be read.
 * @event FAILED_TO_READ_FILE
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_TO_READ_FILE', 'Failed to read file');

/**
 * File does not exist, check filename.
 * @event FILE_NOT_FOUND
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FILE_NOT_FOUND', 'File not found');

/**
 * Server failed to establish websocket connection with origin server.
 * @event FAILED_TO_CONNECT_TO_ORIGIN_STREAM
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_TO_CONNECT_TO_ORIGIN_STREAM', 'Failed to connect to origin stream');

/**
 * CDN stream not found.
 * @event CDN_STREAM_NOT_FOUND
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'CDN_STREAM_NOT_FOUND', 'CDN stream not found');

/**
 * Indicates that provided URL protocol in stream name is invalid.
 * Valid: vod://file.mp4
 * Invalid: dov://file.mp4
 * @event FAILED_TO_GET_AGENT_STORAGE
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'FAILED_TO_GET_AGENT_STORAGE', 'Failed to get agent storage');

/**
 * Shutdown agent servicing origin stream.
 * @event AGENT_SERVICING_ORIGIN_STREAM_IS_SHUTTING_DOWN
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'AGENT_SERVICING_ORIGIN_STREAM_IS_SHUTTING_DOWN', 'Agent servicing origin stream is shutting down');

/**
 * Terminated by keep-alive on walk through subscribers.
 * @event TERMINATED_BY_KEEP_ALIVE
 * @memberof Flashphoner.constants.STREAM_STATUS_INFO
 */
define(streamStatusInfo, 'TERMINATED_BY_KEEP_ALIVE', 'Terminated by keep-alive');

/**
* @namespace Flashphoner.constants.CALL_STATUS_INFO
* @see Call
*/
var callStatusInfo = {};

/**
 * Normal call hangup.
 * @event NORMAL_CALL_CLEARING
 * @memberof Flashphoner.constants.CALL_STATUS_INFO
 */
define(callStatusInfo, 'NORMAL_CALL_CLEARING', 'Normal call clearing');

/**
 * Error occurred on session creation.
 * @event FAILED_BY_SESSION_CREATION
 * @memberof Flashphoner.constants.CALL_STATUS_INFO
 */
define(callStatusInfo, 'FAILED_BY_SESSION_CREATION', 'Failed by session creation');

/**
 * Failed by error during ICE establishment.
 * @event FAILED_BY_ICE_ERROR
 * @memberof Flashphoner.constants.CALL_STATUS_INFO
 */
define(callStatusInfo, 'FAILED_BY_ICE_ERROR', 'Failed by ICE error');

/**
 * RTP session failed by RTP activity timer.
 * @event FAILED_BY_RTP_ACTIVITY
 * @memberof Flashphoner.constants.CALL_STATUS_INFO
 */
define(callStatusInfo, 'FAILED_BY_RTP_ACTIVITY', 'Failed by RTP activity');

/**
 * FF writer was failed on RTMP.
 * @event FAILED_BY_RTMP_WRITER_ERROR
 * @memberof Flashphoner.constants.CALL_STATUS_INFO
 */
define(callStatusInfo, 'FAILED_BY_RTMP_WRITER_ERROR', 'Failed by RTMP writer error');

/**
 * DTLS wrong fingerprint.
 * @event FAILED_BY_DTLS_FINGERPRINT_ERROR
 * @memberof Flashphoner.constants.CALL_STATUS_INFO
 */
define(callStatusInfo, 'FAILED_BY_DTLS_FINGERPRINT_ERROR', 'Failed by DTLS fingerprint error');

/**
 * No common codecs in sdp
 * @event NO_COMMON_CODECS
 * @memberof Flashphoner.constants.CALL_STATUS_INFO
 */
define(callStatusInfo, 'NO_COMMON_CODECS', 'No common codecs');

/**
 * Client did not send DTLS packets or packets were lost/corrupted during transmission.
 * @event FAILED_BY_DTLS_ERROR
 * @memberof Flashphoner.constants.CALL_STATUS_INFO
 */
define(callStatusInfo, 'FAILED_BY_DTLS_ERROR', 'Failed by DTLS error');

/**
 * Error occurred during call
 * @event FAILED_BY_ERROR
 * @memberof Flashphoner.constants.CALL_STATUS_INFO
 */
define(callStatusInfo, 'FAILED_BY_ERROR', 'Failed by error');

/**
 * Call failed by request timeout
 * @event FAILED_BY_REQUEST_TIMEOUT
 * @memberof Flashphoner.constants.CALL_STATUS_INFO
 */
define(callStatusInfo, 'FAILED_BY_REQUEST_TIMEOUT', 'Failed by request timeout');

/**
* @namespace Flashphoner.constants.ERROR_INFO
*/
var errorInfo = {};

/**
 * Error if none of MediaProviders available
 * @event NONE_OF_MEDIAPROVIDERS_AVAILABLE
 * @memberof Flashphoner.constants.ERROR_INFO
 */
define(errorInfo, 'NONE_OF_MEDIAPROVIDERS_AVAILABLE', 'None of MediaProviders available');

/**
 * Error if none of preferred MediaProviders available
 * @event NONE_OF_PREFERRED_MEDIAPROVIDERS_AVAILABLE
 * @memberof Flashphoner.constants.ERROR_INFO
 */
define(errorInfo, 'NONE_OF_PREFERRED_MEDIAPROVIDERS_AVAILABLE', 'None of preferred MediaProviders available');

/**
 * Error if API is not initialized
 * @event FLASHPHONER_API_NOT_INITIALIZED
 * @memberof Flashphoner.constants.ERROR_INFO
 */
define(errorInfo, 'FLASHPHONER_API_NOT_INITIALIZED', 'Flashphoner API is not initialized');

/**
 * Error if options.urlServer is not specified
 * @event OPTIONS_URLSERVER_MUST_BE_PROVIDED
 * @memberof Flashphoner.constants.ERROR_INFO
 */
define(errorInfo, 'OPTIONS_URLSERVER_MUST_BE_PROVIDED', 'options.urlServer must be provided');

/**
 * Error if session state is not REGISTERED
 * @event INVALID_SESSION_STATE
 * @memberof Flashphoner.constants.ERROR_INFO
 */
define(errorInfo, 'INVALID_SESSION_STATE', 'Invalid session state');

/**
 * Error if no options provided
 * @event OPTIONS_MUST_BE_PROVIDED
 * @memberof Flashphoner.constants.ERROR_INFO
 */
define(errorInfo, 'OPTIONS_MUST_BE_PROVIDED', 'options must be provided');

/**
 * Error if call status is not {@link Flashphoner.constants.CALL_STATUS.NEW}
 * @event INVALID_CALL_STATE
 * @memberof Flashphoner.constants.ERROR_INFO
 */
define(errorInfo, 'INVALID_CALL_STATE', 'Invalid call state');

/**
 * Error if event is not specified
 * @event EVENT_CANT_BE_NULL
 * @memberof Flashphoner.constants.ERROR_INFO
 */
define(errorInfo, 'EVENT_CANT_BE_NULL', 'Event can\'t be null');

/**
 * Error if callback is not a valid function
 * @event CALLBACK_NEEDS_TO_BE_A_VALID_FUNCTION
 * @memberof Flashphoner.constants.ERROR_INFO
 */
define(errorInfo, 'CALLBACK_NEEDS_TO_BE_A_VALID_FUNCTION', 'Callback needs to be a valid function');

/**
 * Error if session state is not ESTABLISHED
 * @event INVALID_SESSION_STATE
 * @memberof Flashphoner.constants.ERROR_INFO
 */
define(errorInfo, 'INVALID_SESSION_STATE', 'Invalid session state');

/**
 * Error if options.name is not specified
 * @event OPTIONS_NAME_MUST_BE_PROVIDED
 * @memberof Flashphoner.constants.ERROR_INFO
 */
define(errorInfo, 'OPTIONS_NAME_MUST_BE_PROVIDED', 'options.name must be provided');

/**
 * Error if number of cams is less than 2 or already used custom stream
 * @event CAN_NOT_SWITCH_CAM
 * @memberOf Flashphoner.constants.ERROR_INFO
 */
define(errorInfo, 'CAN_NOT_SWITCH_CAM', 'Number of cams is less than 2 or already used custom stream');

/**
 * Error if number of mics is less than 2 or already used custom stream
 * @event CAN_NOT_SWITCH_MIC
 * @memberOf Flashphoner.constants.ERROR_INFO
 */
define(errorInfo, 'CAN_NOT_SWITCH_MIC', 'Number of mics is less than 2 or already used custom stream');

var mediaDeviceKind = {};

define(mediaDeviceKind, 'OUTPUT', 'output');

define(mediaDeviceKind, 'INPUT', 'input');

define(mediaDeviceKind, 'ALL', 'all');

var constants = {};
define(constants, 'SESSION_STATUS', sessionStatus);
define(constants, 'STREAM_STATUS', streamStatus);
define(constants, 'CALL_STATUS', callStatus);
define(constants, 'STREAM_STATUS_INFO', streamStatusInfo);
define(constants, 'CALL_STATUS_INFO', callStatusInfo);
define(constants, 'ERROR_INFO', errorInfo);
define(constants, 'MEDIA_DEVICE_KIND', mediaDeviceKind);

//define helper
function define(obj, name, value) {
    Object.defineProperty(obj, name, {
        value:      value,
        enumerable: true
    });
}

module.exports = constants;
},{}],25:[function(require,module,exports){
'use strict';

var swfobject = require('swfobject');
var Promise = require('promise-polyfill');
var uuid_v1 = require('uuid/v1');
var connections = {};
var flashScope;
var swfLocation = "media-provider.swf";
var DEFAULT_SDP = "v=0\r\n" +
    "o=- 1988962254 1988962254 IN IP4 0.0.0.0\r\n" +
    "c=IN IP4 0.0.0.0\r\n" +
    "t=0 0\r\n" +
    "a=sdplang:en\r\n" +
    "m=video 0 RTP/AVP 112\r\n" +
    "a=rtpmap:112 H264/90000\r\n" +
    "a=fmtp:112 packetization-mode=1; profile-level-id=420020\r\n" +
    "a=VIDEO_STATE\r\n" +
    "m=audio 0 RTP/AVP 8 0 100 102 103 104 105 106 107 108 109 110\r\n" +
    "a=rtpmap:0 PCMU/8000\r\n" +
    "a=rtpmap:8 PCMA/8000\r\n" +
    "a=rtpmap:100 SPEEX/16000\r\n" +
    "a=rtpmap:102 mpeg4-generic/48000/1\r\n" +
    "a=rtpmap:103 mpeg4-generic/8000/1\r\n" +
    "a=rtpmap:104 mpeg4-generic/11025/1\r\n" +
    "a=rtpmap:105 mpeg4-generic/12000/1\r\n" +
    "a=rtpmap:106 mpeg4-generic/16000/1\r\n" +
    "a=rtpmap:107 mpeg4-generic/22050/1\r\n" +
    "a=rtpmap:108 mpeg4-generic/24000/1\r\n" +
    "a=rtpmap:109 mpeg4-generic/32000/1\r\n" +
    "a=rtpmap:110 mpeg4-generic/44100/1\r\n" +
    "a=AUDIO_STATE\r\n";

var CACHED_INSTANCE_POSTFIX = "CACHED_FLASH_INSTANCE";
var defaultConstraints;
var logger;
var LOG_PREFIX = "flash";

var createConnection = function(options) {
    return new Promise(function(resolve, reject) {
        var id = options.id;
        var authToken = options.authToken;
        var display = options.display || options.localDisplay;
        var flashBufferTime = options.flashBufferTime || 0;

        var url = getConnectionUrl(options.mainUrl, options.flashProto, options.flashPort);

        //todo state from flash instance
        var state = function () {
            return "new";
        };

        var flash = getCacheInstance(display);
        if (flash) {
            flash.reset(id);
            flash.id = id;
            installCallback(flash, 'addLogMessage', function(message){
                logger.info(LOG_PREFIX, "Flash["+id+"]:" + message);
            });
            installCallback(flash, 'connectionStatus', function(status){
                removeCallback(flash, 'connectionStatus');
                if (status === "Success") {
                    connections[id] = exports;
                    resolve(exports);
                } else {
                    reject(new Error("Flash connection returned status " + status));
                }
            });
            flash.connect(url, authToken, options.login);
        } else {
            loadSwf(id, display, options.flashShowFullScreenButton || "false").then(function (swf) {
                installCallback(swf, 'connectionStatus', function (status) {
                    removeCallback(swf, 'connectionStatus');
                    if (status === "Success") {
                        connections[id] = exports;
                        resolve(exports);
                    } else {
                        reject(new Error("Flash connection returned status " + status));
                    }
                });
                flash = swf;
                flash.connect(url, authToken, options.login);
            }).catch(reject);
        }

        var createOffer = function (options) {
            return new Promise(function (resolve, reject) {
                var receiveAudio = options.receiveAudio == undefined ? false : options.receiveAudio;
                var receiveVideo = options.receiveVideo == undefined ? false : options.receiveVideo;
                var sendAudio = flash.isHasAudio();
                var sendVideo = flash.isHasVideo();
                var sdp = DEFAULT_SDP;
                if (receiveAudio && sendAudio) {
                    sdp = sdp.replace("AUDIO_STATE", "sendrecv");
                } else if (receiveAudio && !sendAudio) {
                    sdp = sdp.replace("AUDIO_STATE", "recvonly");
                } else if (!receiveAudio && sendAudio) {
                    sdp = sdp.replace("AUDIO_STATE", "sendonly");
                } else {
                    sdp = sdp.replace("AUDIO_STATE", "inactive");
                }
                if (receiveVideo && sendVideo) {
                    sdp = sdp.replace("VIDEO_STATE", "sendrecv");
                } else if (receiveVideo && !sendVideo) {
                    sdp = sdp.replace("VIDEO_STATE", "recvonly");
                } else if (!receiveVideo && sendVideo) {
                    sdp = sdp.replace("VIDEO_STATE", "sendonly");
                } else {
                    sdp = sdp.replace("VIDEO_STATE", "inactive");
                }
                var o = {};
                o.sdp = sdp;
                o.hasAudio = flash.isHasAudio();
                o.hasVideo = flash.isHasVideo();
                resolve(o);
            });
        };

        var createAnswer = function (options) {
            return new Promise(function (resolve, reject) {
                var receiveAudio = options.receiveAudio == undefined ? true : options.receiveAudio;
                var receiveVideo = options.receiveVideo == undefined ? false : options.receiveVideo;
                var sendAudio = flash.isHasAudio();
                var sendVideo = flash.isHasVideo();
                var sdp = DEFAULT_SDP;
                if (receiveAudio && sendAudio) {
                    sdp = sdp.replace("AUDIO_STATE", "sendrecv");
                } else if (receiveAudio && !sendAudio) {
                    sdp = sdp.replace("AUDIO_STATE", "recvonly");
                } else if (!receiveAudio && sendAudio) {
                    sdp = sdp.replace("AUDIO_STATE", "sendonly");
                } else {
                    sdp = sdp.replace("AUDIO_STATE", "inactive");
                }
                if (receiveVideo && sendVideo) {
                    sdp = sdp.replace("VIDEO_STATE", "sendrecv");
                } else if (receiveVideo && !sendVideo) {
                    sdp = sdp.replace("VIDEO_STATE", "recvonly");
                } else if (!receiveVideo && sendVideo) {
                    sdp = sdp.replace("VIDEO_STATE", "sendonly");
                } else {
                    sdp = sdp.replace("VIDEO_STATE", "inactive");
                }
                resolve(sdp);
            });
        };

        var changeAudioCodec = function(codec) {
           flash.changeAudioCodec(codec);
        };

        var setRemoteSdp = function(sdp, reinit, id) {
            logger.debug(LOG_PREFIX,"setRemoteSDP:");
            logger.debug(LOG_PREFIX,sdp);
            return new Promise(function(resolve, reject){
                var state = extractMediaState(sdp);
                if (reinit)
                    flash.updateId(id);
                flash.setup(state.incoming, state.outgoing, flash.isHasAudio(), flash.isHasVideo(), flashBufferTime, reinit);
                resolve(connections[id]);
            });
        };

        var close = function(cacheCamera) {
            if (flash) {
                flash.disconnect();
                if (!getCacheInstance(display) && flash.hasAccessToAudio() && cacheCamera) {
                    cacheInstance(flash);
                } else {
                    clearCallbacks(flash);
                    swfobject.removeSWF(flash.id);
                }
                flash = null;
            }
        };

        var getVolume = function() {
            if (flash) {
                return flash.getVolume();
            }
            return -1;
        };
        var setVolume = function(volume) {
            if (flash) {
                flash.setVolume(volume);
            }
        };
        var muteAudio = function() {
            if (flash) {
                flash.muteAudio();
            }
        };
        var unmuteAudio = function() {
            if (flash) {
                flash.unmuteAudio();
            }
        };
        var isAudioMuted = function() {
            if (flash) {
                return flash.isAudioMuted();
            }
            return true;
        };
        var muteVideo = function() {
            if (flash) {
                flash.muteVideo();
            }
        };
        var unmuteVideo = function() {
            if (flash) {
                flash.unmuteVideo();
            }
        };
        var isVideoMuted = function() {
            if (flash) {
                return flash.isVideoMuted();
            }
            return true;
        };
        var getStats = function(callbackFn) {
            if (flash) {
                var statistics = flash.getStats();
                var param;
                if (statistics.hasOwnProperty("incoming")) {
                    for (param in statistics.incoming.info) {
                        if (param.indexOf("audio") > -1) {
                            statistics.incoming.audio[param] = statistics.incoming.info[param];
                        }
                        if (param.indexOf("video") > -1) {
                            statistics.incoming.video[param] = statistics.incoming.info[param];
                        }
                    }
                    delete statistics.incoming.info;
                }
                if (statistics.hasOwnProperty("outgoing")) {
                    for (param in statistics.outgoing.info) {
                        if (param.indexOf("audio") > -1) {
                            statistics.outgoing.audio[param] = statistics.outgoing.info[param];
                        }
                        if (param.indexOf("video") > -1) {
                            statistics.outgoing.video[param] = statistics.outgoing.info[param];
                        }
                    }
                    delete statistics.outgoing.info;
                }
                statistics.type = "flash";
                callbackFn(statistics);
            }
        };

        var fullScreen = function() {
            if (flash) {
                flash.fullScreen();
            }
        };

        var switchCam = function () {
        };

        var switchMic = function () {
        };

        var setMicrophoneGain = function (volume) {
        };

        var exports = {};
        exports.state = state;
        exports.createOffer = createOffer;
        exports.createAnswer = createAnswer;
        exports.setRemoteSdp = setRemoteSdp;
        exports.changeAudioCodec = changeAudioCodec;
        exports.close = close;
        exports.setVolume = setVolume;
        exports.setMicrophoneGain = setMicrophoneGain;
        exports.getVolume = getVolume;
        exports.muteAudio = muteAudio;
        exports.unmuteAudio = unmuteAudio;
        exports.isAudioMuted = isAudioMuted;
        exports.muteVideo = muteVideo;
        exports.unmuteVideo = unmuteVideo;
        exports.isVideoMuted = isVideoMuted;
        exports.getStats = getStats;
        exports.fullScreen = fullScreen;
        exports.switchCam = switchCam;
        exports.switchMic = switchMic;
    });
};

//install global part to use flash ExternalInterface
function installFlashScope() {
    if (flashScope == undefined) {
        var globalApiObject = window.Flashphoner;
        if (globalApiObject == undefined) {
            throw new Error("Can't install global scope, there is no window.Flashphoner variable.");
        }
        globalApiObject['FlashApiScope'] = {};
        flashScope = window.Flashphoner.FlashApiScope;
    }
}

/**
 *
 * @param id This can be string representing scopeId or object element (swf)
 * @param name callback name
 * @param value callback function
 */
function installCallback(id, name, value) {
    installFlashScope();
    var scopeId = getInstanceScopeId(id);
    if (flashScope[scopeId] == undefined) {
        flashScope[scopeId] = {};
    }
    flashScope[scopeId][name] = value;
}

/**
 *
 * @param id This can be string representing scopeId or object element (swf)
 * @param name callback name
 */
function removeCallback(id, name) {
    delete flashScope[getInstanceScopeId(id)][name];
}

function cacheInstance(flash) {
    installCallback(flash, 'addLogMessage', function(message){
        logger.info(LOG_PREFIX, "Flash["+flash.id+"]:" + message);
    });
    removeCallback(flash, "connectionStatus");
    flash.reset(flash.id + CACHED_INSTANCE_POSTFIX);
    flash.id = flash.id + CACHED_INSTANCE_POSTFIX;
}

/**
 *
 * @param id This can be string representing scopeId or object element (swf)
 */
function clearCallbacks(id) {
    delete flashScope[getInstanceScopeId(id)];
}

function getInstanceScopeId(flash) {
    if (typeof flash === "string") {
        return flash;
    }
    for (var i = 0; i < flash.children.length; i++) {
        if (flash.children[i].name == "scopeId") {
            return flash.children[i].value;
        }
    }
}

var getMediaAccess = function(constraints, display) {
    return new Promise(function(resolve, reject) {
        var flash = getCacheInstance(display);
        if (!flash) {
            var id = uuid_v1() + CACHED_INSTANCE_POSTFIX;
            loadSwf(id, display).then(function (swf) {
                //todo return camera and mic id
                installCallback(swf, "accessGranted", function () {
                    removeCallback(swf, "accessGranted");
                    resolve(display);
                });
                installCallback(swf, "accessDenied", function () {
                    removeCallback(swf, "accessDenied");
                    reject(new Error("Failed to get access to audio and video"));
                });
                if (!constraints) {
                    constraints = defaultConstraints;
                }
                if (!swf.getMediaAccess(normalizeConstraints(constraints))) {
                    reject(new Error("Failed to get access to audio and video"));
                }
            });
        } else {
            installCallback(flash, "accessGranted", function () {
                removeCallback(flash, "accessGranted");
                resolve(display);
            });
            installCallback(flash, "accessDenied", function () {
                removeCallback(flash, "accessDenied");
                reject(new Error("Failed to get access to audio and video"));
            });
            if (!flash.getMediaAccess(normalizeConstraints(constraints))) {
                reject(new Error("Failed to get access to audio and video"));
            }
        }
    });
};

var releaseMedia = function(display) {
    var flash = getCacheInstance(display);
    if (flash) {
        clearCallbacks(flash);
        swfobject.removeSWF(flash.id);
        return true;
    }
    return false;
};

//swf helpers
//TODO wrap params to object
var loadSwf = function(id, display, showFullScreenButton) {
    return new Promise(function(resolve, reject){
        var swf;
        var divWrapper = document.createElement('div');
        divWrapper.id = id;
        display.appendChild(divWrapper);
        var flashvars = {
            id: id,
            showFullScreenButton: showFullScreenButton || "false"
        };
        var params = {};
        params.menu = "true";
        params.swliveconnect = "true";
        params.allowFullScreen = "true";
        params.allowscriptaccess = "always";
        params.wmode = "opaque";
        params.scopeId = id;
        var attributes = {};
        attributes.allowfullscreen = "true";
        installCallback(id, 'addLogMessage', function(message){
            logger.info(LOG_PREFIX, "Flash["+id+"]:" + message);
        });
        installCallback(id, 'initialized', function(){
            resolve(swf);
        });
        installCallback(id, 'videoResolution', function(width, height){
            swf.videoWidth = width;
            swf.videoHeight = height;
            setTimeout(function(){
                var event = new CustomEvent("resize");
                swf.dispatchEvent(event);
            }, 10);
            setTimeout(function(){
                var event = new CustomEvent("playing");
                swf.dispatchEvent(event);
            }, 10);
        });
        //todo switch from id to element (divWrapper)
        swfobject.embedSWF(swfLocation, id, "100%", "100%", "11.2.0", "expressInstall.swf", flashvars, params, attributes, function (ret) {
            swf = ret.ref;
            if (!ret.success) {
                reject(new Error("Failed to load flash media provider swf with id " + id));
            }
        });
    });
};

function getCacheInstance(display) {
    var i;
    for (i = 0; i < display.children.length; i++) {
        if (display.children[i] && display.children[i].id.indexOf(CACHED_INSTANCE_POSTFIX) != -1) {
            logger.info(LOG_PREFIX, "FOUND FLASH CACHED INSTANCE, id " + display.children[i].id);
            return display.children[i];
        }
    }
}

//sdp helper, extract state from server sdp
function extractMediaState(sdp) {
    var state = {
        incoming: false,
        outgoing: false
    };
    if (sdp.indexOf("a=sendrecv") != -1) {
        state.incoming = true;
        state.outgoing = true;
    } else if (sdp.indexOf("a=recvonly") != -1) {
        state.outgoing = true;
    } else if (sdp.indexOf("a=sendonly") != -1) {
        state.incoming = true;
    }
    return state;
}

//connection ip
function getConnectionUrl(mainUrl, proto, port) {
    var a = document.createElement('a');
    a.href = mainUrl;
    return proto +"://"+ a.hostname+":"+port+"/";
}

/**
 * Check Flash Player available
 *
 * @returns {boolean} flash player available
 */
var available = function() {
    return swfobject.hasFlashPlayerVersion("11.2.0");
};

var listDevices = function() {
    return new Promise(function(resolve, reject) {
        var display = document.createElement('div');
        display.setAttribute("style","width:1px;height:1px");
        var id = uuid_v1();
        //attach display to document, otherwise swf won't be loaded
        document.body.appendChild(display);
        loadSwf(id, display).then(function(swf){
            var list = swf.listDevices();
            //remove swf, display
            swfobject.removeSWF(id);
            document.body.removeChild(display);
            resolve(list);
        }, reject);
    });
};

function normalizeConstraints(constraints) {
    if (constraints && typeof constraints.video !== 'undefined') {
        if (constraints.video.hasOwnProperty('frameRate') && constraints.video.frameRate !== 'object') {
            var frameRate = constraints.video.frameRate;
            if (frameRate == 0 || isNaN(frameRate)) {
                delete constraints.video.frameRate;
            }
        }
        if (constraints.video === false) {
            delete constraints.video;
        } else if (constraints.video === true) {
            // Set default video constraints
            constraints.video= {
                width: 320,
                height: 240
            }
        } else {
            if (constraints.video.hasOwnProperty('width')) {
                var width = constraints.video.width;
                if (isNaN(width) || width == 0) {
                    logger.warn(LOG_PREFIX, "Width or height property has zero/NaN value, set default resolution 320x240");
                    constraints.video.width = 320;
                    constraints.video.height = 240;
                }
                if (typeof width == 'object') {
                    constraints.video.width = constraints.video.width.exact || constraints.video.width.max || constraints.video.width.min;
                }
            }
            if (constraints.video.hasOwnProperty('height')) {
                var height = constraints.video.height;
                if (isNaN(height) || height == 0) {
                    logger.warn(LOG_PREFIX, "Width or height property has zero/NaN value, set default resolution 320x240");
                    constraints.video.width = 320;
                    constraints.video.height = 240;
                }
                if (typeof height == 'object') {
                    constraints.video.height = constraints.video.height.exact || constraints.video.height.max || constraints.video.height.min;
                }
            }
        }
    }
    return constraints;
}

//CustomEvent IE polyfill
(function () {
    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();

var playFirstSound = function () {
    return true;
};

var playFirstVideo = function () {
    return true;
};

module.exports = {
    createConnection: createConnection,
    getMediaAccess: getMediaAccess,
    releaseMedia: releaseMedia,
    available: available,
    listDevices: listDevices,
    playFirstSound: playFirstSound,
    playFirstVideo: playFirstVideo,
    configure: function(configuration) {
        swfLocation = configuration.flashMediaProviderSwfLocation;
        defaultConstraints = configuration.constraints;
        logger = configuration.logger;
        logger.info(LOG_PREFIX, "Initialized");
    }
};



},{"promise-polyfill":3,"swfobject":6,"uuid/v1":10}],26:[function(require,module,exports){
'use strict';

var uuid_v1 = require('uuid/v1');
var constants = require("./constants");
var util = require('./util');
var logger = require('./util').logger;
var loggerConf = {push: false, severity: "INFO"};
var Promise = require('promise-polyfill');
var browserDetails = require('webrtc-adapter').browserDetails;
var LOG_PREFIX = "core";
var isUsingTemasysPlugin = false;

/**
 * @namespace Flashphoner
 */

var SESSION_STATUS = constants.SESSION_STATUS;
var STREAM_STATUS = constants.STREAM_STATUS;
var CALL_STATUS = constants.CALL_STATUS;
var MediaProvider = {};
var sessions = {};
var initialized = false;

/**
 * Static initializer.
 *
 * @param {Object} options Global api options
 * @param {Function=} options.mediaProvidersReadyCallback Callback of initialized WebRTC Plugin
 * @param {String=} options.flashMediaProviderSwfLocation Location of media-provider.swf file
 * @param {string=} options.preferredMediaProvider DEPRECATED: Use preferred media provider if available
 * @param {Array=} options.preferredMediaProviders Use preferred media providers order
 * @param {String=} options.receiverLocation Location of WSReceiver.js file
 * @param {String=} options.decoderLocation Location of video-worker2.js file
 * @param {String=} options.screenSharingExtensionId Chrome screen sharing extension id
 * @param {Object=} options.constraints Default local media constraints
 * @param {Object=} options.logger Enable logging
 * @throws {Error} Error if none of MediaProviders available
 * @memberof Flashphoner
 */
var init = function (options) {
    if (!initialized) {
        if (!options) {
            options = {};
        }
        loggerConf = options.logger || loggerConf;
        // init logger
        logger.init(loggerConf.severity || "INFO", loggerConf.push || false);
        var waitingTemasys = false;
        try {
            var audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn("Failed to create audio context");
        }
        var webRtcProvider = require("./webrtc-media-provider");
        if (webRtcProvider && webRtcProvider.hasOwnProperty('available') && webRtcProvider.available()) {
            MediaProvider.WebRTC = webRtcProvider;
            var webRtcConf = {
                constraints: options.constraints || getDefaultMediaConstraints(),
                extensionId: options.screenSharingExtensionId,
                audioContext: audioContext,
                logger: logger
            };
            webRtcProvider.configure(webRtcConf);
        } else {
            webRtcProvider = require("./temasys-media-provider");
            if (webRtcProvider && webRtcProvider.hasOwnProperty('available') && AdapterJS) {
                waitingTemasys = true;
                AdapterJS.webRTCReady(function (isUsingPlugin) {
                    isUsingTemasysPlugin = isUsingPlugin;
                    if (isUsingPlugin || webRtcProvider.available()) {
                        MediaProvider.WebRTC = webRtcProvider;
                        var webRtcConf = {
                            constraints: options.constraints || getDefaultMediaConstraints(),
                            extensionId: options.screenSharingExtensionId,
                            logger: logger
                        };
                        webRtcProvider.configure(webRtcConf);

                        // Just reorder media provider list
                        var _MediaProvider = {};
                        _MediaProvider.WebRTC = MediaProvider.WebRTC;
                        for (var p in MediaProvider) {
                            _MediaProvider[p] = MediaProvider[p];
                        }
                        MediaProvider = _MediaProvider;
                    }
                    if (options.mediaProvidersReadyCallback) {
                        options.mediaProvidersReadyCallback(Object.keys(MediaProvider));
                    }
                });
            }
        }

        var flashProvider = require("./flash-media-provider");
        if (flashProvider && flashProvider.hasOwnProperty('available') && flashProvider.available() &&
            (!MediaProvider.WebRTC || (options.preferredMediaProviders && options.preferredMediaProviders.indexOf("Flash") >= 0))) {
            MediaProvider.Flash = flashProvider;
            var flashConf = {
                constraints: options.constraints || getDefaultMediaConstraints(),
                flashMediaProviderSwfLocation: options.flashMediaProviderSwfLocation,
                logger: logger
            };
            flashProvider.configure(flashConf);
        }
        var mediaSourceMediaProvider = require("./media-source-media-provider");
        if (mediaSourceMediaProvider && mediaSourceMediaProvider.hasOwnProperty('available') && mediaSourceMediaProvider.available()) {
            MediaProvider.MSE = mediaSourceMediaProvider;
        }
        var websocketProvider = require("./websocket-media-provider");
        if (websocketProvider && websocketProvider.hasOwnProperty('available') && websocketProvider.available(audioContext)) {
            MediaProvider.WSPlayer = websocketProvider;
            var wsConf = {
                receiverLocation: options.receiverLocation,
                decoderLocation: options.decoderLocation,
                audioContext: audioContext,
                logger: logger
            };
            websocketProvider.configure(wsConf);
        }

        //check at least 1 provider available
        if (getMediaProviders().length == 0) {
            throw new Error('None of MediaProviders available');
        } else if (options.preferredMediaProvider) {
            if (MediaProvider.hasOwnProperty(options.preferredMediaProvider)) {
                if (getMediaProviders()[0] != options.preferredMediaProvider) {
                    // Just reorder media provider list
                    var _MediaProvider = {};
                    _MediaProvider[options.preferredMediaProvider] = MediaProvider[options.preferredMediaProvider];
                    for (var p in MediaProvider) {
                        _MediaProvider[p] = MediaProvider[p];
                    }
                    MediaProvider = _MediaProvider;
                }
            } else {
                logger.warn(LOG_PREFIX, "Preferred media provider is not available.");
            }
        }
        if (options.preferredMediaProviders && options.preferredMediaProviders.length > 0) {
            var newMediaProvider = {};
            for (var i in options.preferredMediaProviders) {
                if (options.preferredMediaProviders.hasOwnProperty(i)) {
                    var pMP = options.preferredMediaProviders[i];
                    if (MediaProvider.hasOwnProperty(pMP)) {
                        newMediaProvider[pMP] = MediaProvider[pMP];
                    }
                }
            }
            if (util.isEmptyObject(newMediaProvider)) {
                throw new Error("None of preferred MediaProviders available");
            } else {
                MediaProvider = newMediaProvider;
            }

        }
        if (!waitingTemasys && options.mediaProvidersReadyCallback) {
            options.mediaProvidersReadyCallback(Object.keys(MediaProvider));
        }
        logger.info(LOG_PREFIX, "Initialized");
        initialized = true;
    }
};

/**
 * Get available MediaProviders.
 *
 * @returns {Array} Available MediaProviders
 * @memberof Flashphoner
 */
var getMediaProviders = function () {
    return Object.keys(MediaProvider);
};

/**
 * Play audio chunk
 * @param {boolean} noise Use noise in playing
 * @memberof Flashphoner
 */

var playFirstSound = function(noise) {
    var mediaProvider = getMediaProviders()[0];
    MediaProvider[mediaProvider].playFirstSound(noise);
};

/**
 * Play video chunk
 *
 * @memberof Flashphoner
 */
var playFirstVideo = function (display, isLocal, src) {
    for (var mp in MediaProvider) {
        MediaProvider[mp].playFirstVideo(display, isLocal, src);
    }
};

/**
 * Get logger
 *
 * @returns {Object} Logger
 * @memberof Flashphoner
 */

var getLogger = function () {
    if (!initialized) {
        console.warn("Initialize API first.");
    } else {
        return logger;
    }
}

/**
 * @typedef Flashphoner.MediaDeviceList
 * @type Object
 * @property {Flashphoner.MediaDevice[]} audio Audio devices (microphones)
 * @property {Flashphoner.MediaDevice[]} video Video devices (cameras)
 */

/**
 * @typedef Flashphoner.MediaDevice
 * @type Object
 * @property {String} type Type of device: mic, camera, screen
 * @property {String} id Unique id
 * @property {String} label Device label
 */

/**
 * Get available local media devices
 *
 * @param {String=} mediaProvider Media provider that will be asked for device list
 * @param {Boolean=} labels Ask user for microphone access before getting device list.
 * This will make device label available.
 * @param {Flashphoner.constants.MEDIA_DEVICE_KIND} kind For media device kind input or output
 * @returns {Promise.<Flashphoner.MediaDeviceList>} Promise with media device list on fulfill
 * @throws {Error} Error if API is not initialized
 * @memberof Flashphoner
 */
var getMediaDevices = function (mediaProvider, labels, kind) {
    if (!initialized) {
        throw new Error("Flashphoner API is not initialized");
    }
    if (!mediaProvider) {
        mediaProvider = getMediaProviders()[0];
    }
    return MediaProvider[mediaProvider].listDevices(labels, kind);
};

/**
 * Get access to local media
 *
 * @param {Object} constraints Media constraints
 * @param {Object} constraints.audio Audio constraints
 * @param {String=} constraints.audio.deviceId Audio device id
 * @param {Object} constraints.video Video constraints
 * @param {String=} constraints.video.deviceId Video device id
 * @param {number} constraints.video.width Video width
 * @param {number} constraints.video.height Video height
 * @param {number} constraints.video.frameRate Video fps
 * @param {String} constraints.video.type Video device type: camera, screen
 * @param {String} constraints.video.mediaSource Video source type for FF: screen, window
 * @param {HTMLElement} display Div element local media should be displayed in
 * @param {String} mediaProvider Media provider type
 * @returns {Promise.<HTMLElement>} Promise with display on fulfill
 * @throws {Error} Error if API is not initialized
 * @memberof Flashphoner
 */

var getMediaAccess = function (constraints, display, mediaProvider) {
    if (!initialized) {
        throw new Error("Flashphoner API is not initialized");
    }
    if (!mediaProvider) {
        mediaProvider = getMediaProviders()[0];
    }
    return MediaProvider[mediaProvider].getMediaAccess(constraints, display);
};

//default constraints helper
var getDefaultMediaConstraints = function () {
    if (browserDetails.browser == "safari") {
        return {
            audio: true,
            video: {
                width: {min: 320, max: 640},
                height: {min: 240, max: 480}
            }
        };
    }
    else {
        return {
            audio: true,
            video: {
                width: 320,
                height: 240
            }
        }
    }
};

function getConstraintsProperty(constraints, property, defaultValue) {
    if (!constraints || !property) return defaultValue;
    var res;
    var properties = property.split(".");
    for (var prop in constraints) {
        if (prop == properties[0]) {
            res = constraints[prop];
            if (properties.length > 1) res = getConstraintsProperty(constraints[prop], properties[1], defaultValue);
        } else if (typeof constraints[prop] === "object") {
            for (var p in constraints[prop]) {
                if (p == property) res = constraints[prop][p];
            }
        }
    }
    if (typeof res === "boolean") return res;
    return res || defaultValue;
}

/**
 * Release local media
 *
 * @param {HTMLElement} display Div element with local media
 * @param {String=} mediaProvider Media provider type
 * @returns {Boolean} True if media was found and released
 * @throws {Error} Error if API is not initialized
 * @memberof Flashphoner
 */

var releaseLocalMedia = function (display, mediaProvider) {
    if (!initialized) {
        throw new Error("Flashphoner API is not initialized");
    }
    if (!mediaProvider) {
        mediaProvider = getMediaProviders()[0];
    }
    return MediaProvider[mediaProvider].releaseMedia(display);
};

/**
 * Get active sessions.
 *
 * @returns {Session[]} Array containing active sessions
 * @memberof Flashphoner
 */
var getSessions = function () {
    return util.copyObjectToArray(sessions);
};

/**
 * Get session by id.
 *
 * @param {string} id Session id
 * @returns {Session} Session
 * @memberof Flashphoner
 */
var getSession = function (id) {
    return sessions[id];
};

/**
 * Create new session and connect to server.
 *
 * @param {Object} options Session options
 * @param {string} options.urlServer Server address in form of [ws,wss]://host.domain:port
 * @param {string} options.authToken Token for auth on server with keepalived client
 * @param {Boolean=} options.keepAlive Keep alive client on server after disconnect
 * @param {string=} options.lbUrl Load-balancer address
 * @param {string=} options.flashProto Flash protocol [rtmp,rtmfp]
 * @param {Integer=} options.flashPort Flash server port [1935]
 * @param {string=} options.appKey REST App key
 * @param {Object=} options.custom User provided custom object that will be available in REST App code
 * @param {Object=} options.sipOptions Sip configuration
 * @param {Object=} options.mediaOptions Media connection configuration
 * @returns {Session} Created session
 * @throws {Error} Error if API is not initialized
 * @throws {TypeError} Error if options.urlServer is not specified
 * @memberof Flashphoner
 */
var createSession = function (options) {
    if (!initialized) {
        throw new Error("Flashphoner API is not initialized");
    }

    if (!options || !options.urlServer) {
        throw new TypeError("options.urlServer must be provided");
    }

    var id_ = uuid_v1();
    var sessionStatus = SESSION_STATUS.PENDING;
    var urlServer = options.urlServer;
    var lbUrl = options.lbUrl;
    var flashProto = options.flashProto || "rtmfp";
    var flashPort = options.flashPort || 1935;
    var appKey = options.appKey || "defaultApp";
    var mediaOptions = options.mediaOptions;
    var keepAlive = options.keepAlive;

    var cConfig;
    //SIP config
    var sipConfig;
    if (options.sipOptions) {
        sipConfig = {
            sipLogin: options.sipOptions.login,
            sipAuthenticationName: options.sipOptions.authenticationName,
            sipPassword: options.sipOptions.password,
            sipDomain: options.sipOptions.domain,
            sipOutboundProxy: options.sipOptions.outboundProxy,
            sipProxy: options.sipOptions.proxy,
            sipPort: options.sipOptions.port,
            sipRegisterRequired: options.sipOptions.registerRequired
        }
    }
    //media provider auth token received from server
    var authToken = options.authToken;
    //object for storing new and active streams
    var streams = {};
    var calls = {};
    var mediaConnections = {};
    //session to stream callbacks
    var streamRefreshHandlers = {};
    //session to call callbacks
    var callRefreshHandlers = {};
    /**
     * Represents connection to REST App.
     * Can create and store Streams.
     *
     * @see Flashphoner.createSession
     * @namespace Session
     */
    var session = {};
    //callbacks added using session.on()
    var callbacks = {};

    var wsConnection;

    if (lbUrl) {
        requestURL(lbUrl);
    } else {
        createWS(urlServer)
    }

    //todo remove
    var remoteSdpCache = {};

    //Request URL from load-balancer
    function requestURL(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.timeout = 5000;
        request.ontimeout = function () {
            logger.warn(LOG_PREFIX, "Timeout during geting url from balancer!");
            createWS(urlServer);
        }
        request.error = function () {
            logger.warn(LOG_PREFIX, "Error during geting url from balancer!")
            createWS(urlServer);
        }
        request.onload = function (e) {
            if (request.status == 200 && request.readyState == 4) {
                var result = JSON.parse(request.responseText);
                if (urlServer.indexOf("wss://") !== -1) {
                    urlServer = "wss://" + result.server + ":" + result.wss;
                } else {
                    urlServer = "ws://" + result.server + ":" + result.ws;
                }
                flashPort = result.flash;
                logger.debug(LOG_PREFIX, "Got url from load balancer " + result.server);
                createWS(urlServer);
            }
        }
        request.send();
    }

    //connect session to server
    function createWS(url) {
        wsConnection = new WebSocket(url);
        wsConnection.onerror = function () {
            onSessionStatusChange(SESSION_STATUS.FAILED);
        };
        wsConnection.onclose = function () {
            if (sessionStatus !== SESSION_STATUS.FAILED) {
                onSessionStatusChange(SESSION_STATUS.DISCONNECTED);
            }
        };
        wsConnection.onopen = function () {
            onSessionStatusChange(SESSION_STATUS.CONNECTED);
            cConfig = {
                appKey: appKey,
                mediaProviders: Object.keys(MediaProvider),
                keepAlive: keepAlive,
                authToken:authToken,
                clientVersion: "0.5.28",
                clientOSVersion: window.navigator.appVersion,
                clientBrowserVersion: window.navigator.userAgent,
                custom: options.custom
            };
            if (sipConfig) {
                util.copyObjectPropsToAnotherObject(sipConfig, cConfig);
            }
            //connect to REST App
            send("connection", cConfig);
            logger.setConnection(wsConnection);
        };
        wsConnection.onmessage = function (event) {
            var data = {};
            if (event.data instanceof Blob) {
                data.message = "binaryData";
            } else {
                data = JSON.parse(event.data);
                var obj = data.data[0];
            }
            switch (data.message) {
                case 'ping':
                    send("pong", null);
                    break;
                case 'getUserData':
                    authToken = obj.authToken;
                    cConfig = obj;
                    onSessionStatusChange(SESSION_STATUS.ESTABLISHED, obj);
                    break;
                case 'setRemoteSDP':
                    var mediaSessionId = data.data[0];
                    var sdp = data.data[1];
                    if (streamRefreshHandlers[mediaSessionId]) {
                        //pass server's sdp to stream
                        streamRefreshHandlers[mediaSessionId](null, sdp);
                    } else if (callRefreshHandlers[mediaSessionId]) {
                        //pass server's sdp to call
                        callRefreshHandlers[mediaSessionId](null, sdp);
                    } else {
                        remoteSdpCache[mediaSessionId] = sdp;
                        logger.warn(LOG_PREFIX, "Media not found, id " + mediaSessionId);
                    }
                    break;
                case 'notifyVideoFormat':
                case 'notifyStreamStatusEvent':
                    if (streamRefreshHandlers[obj.mediaSessionId]) {
                        //update stream status
                        streamRefreshHandlers[obj.mediaSessionId](obj);
                    }
                    break;
                case 'DataStatusEvent':
                    restAppCommunicator.resolveData(obj);
                    break;
                case 'OnDataEvent':
                    if (callbacks[SESSION_STATUS.APP_DATA]) {
                        callbacks[SESSION_STATUS.APP_DATA](obj);
                    }
                    break;
                case 'fail':
                    if (obj.apiMethod && obj.apiMethod == "StreamStatusEvent") {
                        if (streamRefreshHandlers[obj.id]) {
                            //update stream status
                            streamRefreshHandlers[obj.id](obj);
                        }
                    }
                    if (callbacks[SESSION_STATUS.WARN]) {
                        callbacks[SESSION_STATUS.WARN](obj);
                    }
                    break;
                case 'registered':
                    onSessionStatusChange(SESSION_STATUS.REGISTERED);
                    break;
                case 'notifyAudioCodec':
                    // This case for Flash only
                    var mediaSessionId = data.data[0];
                    var codec = data.data[1];
                    if (callRefreshHandlers[mediaSessionId]) {
                        callRefreshHandlers[mediaSessionId](null, null, codec);
                    }
                    break;
                case 'notifyTransferEvent':
                    callRefreshHandlers[obj.callId](null, null, null, obj);
                    break;
                case 'notifyTryingResponse':
                case 'hold':
                case 'ring':
                case 'talk':
                case 'finish':
                    if (callRefreshHandlers[obj.callId]) {
                        //update call status
                        callRefreshHandlers[obj.callId](obj);
                    }
                    break;
                case 'notifyIncomingCall':
                    if (callRefreshHandlers[obj.callId]) {
                        logger.error(LOG_PREFIX, "Call already exists, id " + obj.callId);
                    }
                    if (callbacks[SESSION_STATUS.INCOMING_CALL]) {
                        callbacks[SESSION_STATUS.INCOMING_CALL](createCall(obj));
                    } else {
                        //todo hangup call
                    }
                    break;
                case 'notifySessionDebugEvent':
                    logger.info(LOG_PREFIX, "Session debug status " + obj.status);
                    if (callbacks[SESSION_STATUS.DEBUG]) {
                        callbacks[SESSION_STATUS.DEBUG](obj);
                    }
                    break;
                case 'availableStream':
                    var availableStream = {};
                    availableStream.mediaSessionId = obj.id;
                    availableStream.available = obj.status;
                    if (streamRefreshHandlers[availableStream.mediaSessionId]) {
                        streamRefreshHandlers[availableStream.mediaSessionId](availableStream);
                    }
                    break;
                default:
                //logger.info(LOG_PREFIX, "Unknown server message " + data.message);
            }
        };
    }

    //WebSocket send helper
    function send(message, data) {
        wsConnection.send(JSON.stringify({
            message: message,
            data: [data]
        }));
    }

    //Session status update helper
    function onSessionStatusChange(newStatus, obj) {
        sessionStatus = newStatus;
        if (sessionStatus == SESSION_STATUS.DISCONNECTED || sessionStatus == SESSION_STATUS.FAILED) {
            //remove streams
            for (var prop in streamRefreshHandlers) {
                if (streamRefreshHandlers.hasOwnProperty(prop) && typeof streamRefreshHandlers[prop] === 'function') {
                    streamRefreshHandlers[prop]({status: STREAM_STATUS.FAILED});
                }
            }
            //remove session from list
            delete sessions[id_];
        }
        if (callbacks[sessionStatus]) {
            callbacks[sessionStatus](session, obj);
        }
    }

    /**
     * @callback sdpHook
     * @param {Object} sdp Callback options
     * @param {String} sdp.sdpString Sdp from the server
     * @returns {String} sdp New sdp
     */

    /**
     * Create call.
     *
     * @param {Object} options Call options
     * @param {string} options.callee Call remote party id
     * @param {string=} options.visibleName Call caller visible name
     * @param {Object} options.constraints Call constraints
     * @param {string} options.mediaProvider MediaProvider type to use with this call
     * @param {Boolean=} options.receiveAudio Receive audio
     * @param {Boolean=} options.receiveVideo Receive video
     * @param {Boolean=} options.cacheLocalResources Display will contain local video after call release
     * @param {HTMLElement} options.localVideoDisplay Div element local video should be displayed in
     * @param {HTMLElement} options.remoteVideoDisplay Div element remote video should be displayed in
     * @param {Object=} options.custom User provided custom object that will be available in REST App code
     * @param {Array<string>=} options.stripCodecs Array of codecs which should be stripped from SDP (WebRTC)
     * @param {sdpHook} sdpHook The callback that handles sdp from the server
     * @returns {Call} Call
     * @throws {TypeError} Error if no options provided
     * @throws {Error} Error if session state is not REGISTERED
     * @memberof Session
     * @inner
     */
    var createCall = function (options) {
        //check session state
        if (sessionStatus !== SESSION_STATUS.REGISTERED && sessionStatus !== SESSION_STATUS.ESTABLISHED) {
            logger.info(LOG_PREFIX, "Status is " + sessionStatus);
            throw new Error('Invalid session state');
        }

        //check options
        if (!options) {
            throw new TypeError("options must be provided");
        }
        var login = (appKey == 'clickToCallApp') ? '' : cConfig.sipLogin;
        var caller_ = (options.incoming) ? options.caller : login;
        var callee_ = options.callee;
        var visibleName_ = options.visibleName || login;

        var id_ = options.callId || uuid_v1();
        var mediaProvider = options.mediaProvider || getMediaProviders()[0];
        var mediaConnection;
        var localDisplay = options.localVideoDisplay;
        var remoteDisplay = options.remoteVideoDisplay;
        // Constraints
        if (options.constraints) {
            var constraints = options.constraints;
        }

        var audioOutputId;
        var audioProperty = getConstraintsProperty(constraints, "audio", undefined);
        if (typeof audioProperty === 'object') {
            audioOutputId = getConstraintsProperty(audioProperty, "outputId", 0);
        }

        var stripCodecs = options.stripCodecs || [];
        // Receive media
        var receiveAudio = (typeof options.receiveAudio !== 'undefined') ? options.receiveAudio : true;
        var receiveVideo = (typeof options.receiveVideo !== 'undefined') ? options.receiveVideo : true;

        var cacheLocalResources = options.cacheLocalResources;
        var status_ = CALL_STATUS.NEW;
        var callbacks = {};
        var hasTransferredCall = false;
        var sdpHook = options.sdpHook;
        /**
         * Represents sip call.
         *
         * @namespace Call
         * @see Session~createCall
         */
        var call = {};
        callRefreshHandlers[id_] = function (callInfo, sdp, codec, transfer) {
            if (transfer) {
                if (!mediaConnections[id_]) {
                    mediaConnections[id_] = mediaConnection;
                }
                if (transfer.status == "COMPLETED") {
                    delete mediaConnections[id_];
                }
                return;
            }

            //transferred call
            if (!mediaConnection && Object.keys(mediaConnections).length != 0) {
                for (var mc in mediaConnections) {
                    mediaConnection = mediaConnections[mc];
                    hasTransferredCall = true;
                    delete mediaConnections[mc];
                }
            }
            //set audio codec (Flash only)
            if (codec) {
                if (mediaProvider == "Flash") {
                    mediaConnection.changeAudioCodec(codec.name);
                }
                return;
            }
            //set remote sdp
            if (sdp && sdp !== '') {
                sdp = sdpHookHandler(sdp, sdpHook);
                mediaConnection.setRemoteSdp(sdp, hasTransferredCall, id_).then(function () {
                });
                return;
            }
            var event = callInfo.status;
            status_ = event;
            //release call
            if (event == CALL_STATUS.FAILED || event == CALL_STATUS.FINISH ||
                event == CALL_STATUS.BUSY) {
                delete calls[id_];
                delete callRefreshHandlers[id_];
                if (Object.keys(calls).length == 0) {
                    if (mediaConnection)
                        mediaConnection.close(cacheLocalResources);
                }
            }
            //fire call event
            if (callbacks[event]) {
                callbacks[event](call);
            }
        };

        /**
         * Initiate outgoing call.
         *
         * @throws {Error} Error if call status is not {@link Flashphoner.constants.CALL_STATUS.NEW}
         * @memberof Call
         * @name call
         * @inner
         */
        var call_ = function () {
            if (status_ !== CALL_STATUS.NEW) {
                throw new Error("Invalid call state");
            }
            status_ = CALL_STATUS.PENDING;
            var hasAudio = true;
            //get access to camera
            MediaProvider[mediaProvider].getMediaAccess(constraints, localDisplay).then(function () {
                if (status_ == CALL_STATUS.FAILED) {
                    //call failed while we were waiting for media access, release media
                    if (!cacheLocalResources) {
                        releaseLocalMedia(localDisplay, mediaProvider);
                    }
                    return;
                }
                //create mediaProvider connection
                MediaProvider[mediaProvider].createConnection({
                    id: id_,
                    localDisplay: localDisplay,
                    remoteDisplay: remoteDisplay,
                    authToken: authToken,
                    mainUrl: urlServer,
                    flashProto: flashProto,
                    flashPort: flashPort,
                    bidirectional: true,
                    login: login,
                    constraints: constraints,
                    connectionConfig: mediaOptions,
                    audioOutputId: audioOutputId
                }).then(function (newConnection) {
                    mediaConnection = newConnection;
                    return mediaConnection.createOffer({
                        sendAudio: true,
                        sendVideo: true,
                        receiveAudio: receiveAudio,
                        receiveVideo: receiveVideo,
                        stripCodecs: stripCodecs
                    });
                }).then(function (offer) {
                    send("call", {
                        callId: id_,
                        incoming: false,
                        hasVideo: offer.hasVideo,
                        hasAudio: offer.hasAudio,
                        status: status_,
                        mediaProvider: mediaProvider,
                        sdp: offer.sdp,
                        caller: login,
                        callee: callee_,
                        custom: options.custom,
                        visibleName: visibleName_
                    });
                });
            }).catch(function (error) {
                logger.error(LOG_PREFIX, error);
                status_ = CALL_STATUS.FAILED;
                callRefreshHandlers[id_]({status: CALL_STATUS.FAILED});
                hangup();
            });
        };

        /**
         * Hangup call.
         *
         * @memberof Call
         * @inner
         */
        var hangup = function () {
            if (status_ == CALL_STATUS.NEW) {
                callRefreshHandlers[id_]({status: CALL_STATUS.FAILED});
                return;
            } else if (status_ == CALL_STATUS.PENDING) {
                if (!cacheLocalResources) {
                    releaseLocalMedia(localDisplay, mediaProvider);
                }
                callRefreshHandlers[id_]({status: CALL_STATUS.FAILED});
                if (options.incoming) {
                    send("hangup", {
                        callId: id_
                    });
                }
                return;
            }

            send("hangup", {
                callId: id_
            });
            //free media provider
            if (mediaConnection) {
                mediaConnection.close(cacheLocalResources);
            }
        };

        /**
         * @callback sdpHook
         * @param {Object} sdp Callback options
         * @param {String} sdp.sdpString Sdp from the server
         * @returns {String} sdp New sdp
         */

        /**
         * Answer incoming call.
         * @param {Object} answerOptions Call options
         * @param {HTMLElement} answerOptions.localVideoDisplay Div element local video should be displayed in
         * @param {HTMLElement} answerOptions.remoteVideoDisplay Div element remote video should be displayed in
         * @param {Boolean=} answerOptions.receiveAudio Receive audio
         * @param {Boolean=} answerOptions.receiveVideo Receive video
         * @param {String=} answerOptions.constraints Answer call with constraints
         * @param {Array<string>=} answerOptions.stripCodecs Array of codecs which should be stripped from SDP (WebRTC)
         * @param {sdpHook} sdpHook The callback that handles sdp from the server
         * @throws {Error} Error if call status is not {@link Flashphoner.constants.CALL_STATUS.NEW}
         * @memberof Call
         * @name call
         * @inner
         */
        var answer = function (answerOptions) {
            if (status_ !== CALL_STATUS.NEW && status_ !== CALL_STATUS.RING) {
                throw new Error("Invalid call state");
            }
            localDisplay = answerOptions.localVideoDisplay;
            remoteDisplay = answerOptions.remoteVideoDisplay;
            constraints = answerOptions.constraints || getDefaultMediaConstraints();
            status_ = CALL_STATUS.PENDING;
            var sdp;
            var sdpHook = answerOptions.sdpHook;
            if (!remoteSdpCache[id_]) {
                logger.error(LOG_PREFIX, "No remote sdp available");
                throw new Error("No remote sdp available");
            } else {
                sdp = sdpHookHandler(remoteSdpCache[id_], sdpHook);
                delete remoteSdpCache[id_];
            }
            if (util.SDP.matchPrefix(sdp, "m=video").length == 0) {
                constraints.video = false;
            }
            var stripCodecs = answerOptions.stripCodecs || [];
            var hasAudio = true;
            //get access to camera
            MediaProvider[mediaProvider].getMediaAccess(constraints, localDisplay).then(function () {
                if (status_ == CALL_STATUS.FAILED) {
                    //call failed while we were waiting for media access, release media
                    if (!cacheLocalResources) {
                        releaseLocalMedia(localDisplay, mediaProvider);
                    }
                    return;
                }
                //create mediaProvider connection
                MediaProvider[mediaProvider].createConnection({
                    id: id_,
                    localDisplay: localDisplay,
                    remoteDisplay: remoteDisplay,
                    authToken: authToken,
                    mainUrl: urlServer,
                    flashProto: flashProto,
                    flashPort: flashPort,
                    bidirectional: true,
                    login: cConfig.sipLogin,
                    constraints: constraints,
                    connectionConfig: mediaOptions,
                    audioOutputId: audioOutputId
                }).then(function (newConnection) {
                    mediaConnection = newConnection;
                    return mediaConnection.setRemoteSdp(sdp);
                }).then(function () {
                    return mediaConnection.createAnswer({
                        receiveAudio: options.receiveAudio,
                        receiveVideo: options.receiveVideo,
                        stripCodecs: stripCodecs
                    });
                }).then(function (sdp) {
                    if (status_ != CALL_STATUS.FINISH && status_ != CALL_STATUS.FAILED) {
                        send("answer", {
                            callId: id_,
                            incoming: true,
                            hasVideo: true,
                            hasAudio: hasAudio,
                            status: status_,
                            mediaProvider: mediaProvider,
                            sdp: sdp,
                            caller: cConfig.login,
                            callee: callee_,
                            custom: options.custom
                        });
                    } else {
                        hangup();
                    }
                });
            }).catch(function (error) {
                logger.error(LOG_PREFIX, error);
                status_ = CALL_STATUS.FAILED;
                callRefreshHandlers[id_]({status: CALL_STATUS.FAILED});
            });
        };

        /**
         * Get call status.
         *
         * @returns {string} One of {@link Flashphoner.constants.CALL_STATUS}
         * @memberof Call
         * @inner
         */
        var status = function () {
            return status_;
        };

        /**
         * Get call id.
         *
         * @returns {string} Call id
         * @memberof Call
         * @inner
         */
        var id = function () {
            return id_;
        };
        /**
         * Get caller id.
         *
         * @returns {string} Caller id
         * @memberof Call
         * @inner
         */
        var caller = function () {
            return caller_;
        };
        /**
         * Get callee id.
         *
         * @returns {string} Callee id
         * @memberof Call
         * @inner
         */
        var callee = function () {
            return callee_;
        };
        /**
         * Get caller visible name.
         *
         * @returns {string} Caller visible name
         * @memberof Call
         * @inner
         */
        var visibleName = function () {
            return visibleName_;
        };
        /**
         * Media controls
         */

        /**
         * Set other oupout audio device
         *
         * @param {string} id Id of output device
         * @memberof Call
         * @inner
         */
        var setAudioOutputId = function(id) {
            audioOutputId = id;
            if (mediaConnection && mediaConnection.setAudioOutputId) {
                return mediaConnection.setAudioOutputId(id);
            }
        };

        /**
         * Set volume of remote media
         *
         * @param {number} volume Volume between 0 and 100
         * @memberof Call
         * @inner
         */
        var setVolume = function (volume) {
            if (mediaConnection) {
                mediaConnection.setVolume(volume);
            }
        };

        /**
         * Get current volume
         *
         * @returns {number} Volume or -1 if audio is not available
         * @memberof Call
         * @inner
         */
        var getVolume = function () {
            if (mediaConnection) {
                return mediaConnection.getVolume();
            }
            return -1;
        };

        /**
         * Mute outgoing audio
         *
         * @memberof Call
         * @inner
         */
        var muteAudio = function () {
            if (mediaConnection) {
                mediaConnection.muteAudio();
            }
        };

        /**
         * Unmute outgoing audio
         *
         * @memberof Call
         * @inner
         */
        var unmuteAudio = function () {
            if (mediaConnection) {
                mediaConnection.unmuteAudio();
            }
        };

        /**
         * Check outgoing audio mute state
         *
         * @returns {boolean} True if audio is muted or not available
         * @memberof Call
         * @inner
         */
        var isAudioMuted = function () {
            if (mediaConnection) {
                return mediaConnection.isAudioMuted();
            }
            return true;
        };

        /**
         * Mute outgoing video
         *
         * @memberof Call
         * @inner
         */
        var muteVideo = function () {
            if (mediaConnection) {
                mediaConnection.muteVideo();
            }
        };

        /**
         * Unmute outgoing video
         *
         * @memberof Call
         * @inner
         */
        var unmuteVideo = function () {
            if (mediaConnection) {
                mediaConnection.unmuteVideo();
            }
        };

        /**
         * Check outgoing video mute state
         *
         * @returns {boolean} True if video is muted or not available
         * @memberof Call
         * @inner
         */
        var isVideoMuted = function () {
            if (mediaConnection) {
                return mediaConnection.isVideoMuted();
            }
            return true;
        };
        /**
         * @callback callbackFn
         * @param {Object} result
         */
        /**
         * Get statistics
         *
         * @param {callbackFn} callbackFn The callback that handles response
         * @returns {Object} Call audio\video statistics
         * @memberof Call
         * @inner
         */
        var getStats = function (callbackFn) {
            if (mediaConnection) {
                mediaConnection.getStats(callbackFn);
            }
        };
        /**
         * Place call on hold
         *
         * @memberof Call
         * @inner
         */
        var hold = function () {
            send("hold", {callId: id_});
        }
        /**
         * Place call on hold for transfer
         *
         * @memberof Call
         * @inner
         */
        var holdForTransfer = function () {
            send("hold", {callId: id_, holdForTransfer: true});
        }
        /**
         * Unhold the call
         *
         * @memberof Call
         * @inner
         */
        var unhold = function () {
            send("unhold", {callId: id_});
        }
        /**
         * Send DTMF
         *
         * @param {number} number Number
         * @param {string=} type DTMF Type (RFC2833, INFO, INFO_RELAY)
         * @memberof Call
         * @inner
         */
        var sendDTMF = function (number, type) {
            send("sendDtmf", {
                callId: id_,
                type: type || "RFC2833",
                dtmf: number
            });
        }
        /**
         * Transfer call
         *
         * @param {String} traget Transfer target
         * @memberof Call
         * @inner
         */
        var transfer = function (target) {
            send("transfer", {callId: id_, target: target});
        }
        /**
         * Call event callback.
         *
         * @callback Call~eventCallback
         * @param {Call} call Call that corresponds to the event
         */

        /**
         * Add call event callback.
         *
         * @param {string} event One of {@link Flashphoner.constants.CALL_STATUS} events
         * @param {Call~eventCallback} callback Callback function
         * @returns {Call} Call callback was attached to
         * @throws {TypeError} Error if event is not specified
         * @throws {Error} Error if callback is not a valid function
         * @memberof Call
         * @inner
         */
        var on = function (event, callback) {
            if (!event) {
                throw new TypeError("Event can't be null");
            }
            if (!callback || typeof callback !== 'function') {
                throw new Error("Callback needs to be a valid function");
            }
            callbacks[event] = callback;
            return call;
        };

        /**
         * Switch camera in real-time.
         * Works only with WebRTC
         *
         * @memberOf Call
         * @inner
         * @throws {Error} Error if call status is not {@link Flashphoner.constants.CALL_STATUS.ESTABLISHED} and not {@link Flashphoner.constants.CALL_STATUS.HOLD}
         */
        var switchCam = function(deviceId) {
            if(status_ !== CALL_STATUS.ESTABLISHED && !constraints.video && status_ !== CALL_STATUS.HOLD){
                throw new Error('Invalid call state');
            }
            return mediaConnection.switchCam(deviceId);
        };

        /**
         * Switch mic in real-time.
         * Works only with WebRTC
         *
         * @memberOf Call
         * @inner
         * @throws {Error} Error if call status is not {@link Flashphoner.constants.CALL_STATUS.ESTABLISHED} and not {@link Flashphoner.constants.CALL_STATUS.HOLD}
         */
        var switchMic = function(deviceId) {
            if(status_ !== CALL_STATUS.ESTABLISHED && status_ !== CALL_STATUS.HOLD){
                throw new Error('Invalid call state');
            }
           return mediaConnection.switchMic(deviceId);
        };

        call.call = call_;
        call.answer = answer;
        call.hangup = hangup;
        call.id = id;
        call.status = status;
        call.getStats = getStats;
        call.setAudioOutputId = setAudioOutputId;
        call.setVolume = setVolume;
        call.getVolume = getVolume;
        call.muteAudio = muteAudio;
        call.unmuteAudio = unmuteAudio;
        call.isAudioMuted = isAudioMuted;
        call.muteVideo = muteVideo;
        call.unmuteVideo = unmuteVideo;
        call.isVideoMuted = isVideoMuted;
        call.caller = caller;
        call.callee = callee;
        call.visibleName = visibleName;
        call.hold = hold;
        call.holdForTransfer = holdForTransfer;
        call.unhold = unhold;
        call.sendDTMF = sendDTMF;
        call.transfer = transfer;
        call.on = on;
        call.switchCam = switchCam;
        call.switchMic = switchMic;
        calls[id_] = call;
        return call;
    };

    /**
     * @callback sdpHook
     * @param {Object} sdp Callback options
     * @param {String} sdp.sdpString Sdp from the server
     * @returns {String} sdp New sdp
     */

    /**
     * Create stream.
     *
     * @param {Object} options Stream options
     * @param {string} options.name Stream name
     * @param {Object=} options.constraints Stream constraints
     * @param {Boolean|Object} [options.constraints.audio=true] Specifies if published stream should have audio. Played stream always should have audio: the property should not be set to false in that case.
     * @param {string=} [options.constraints.audio.outputId] Set width to publish or play stream with this value
     * @param {Boolean|Object} [options.constraints.video=true] Specifies if published or played stream should have video, or sets video constraints
     * @param {Integer} [options.constraints.video.width=0] Set width to publish or play stream with this value
     * @param {Integer} [options.constraints.video.height=0] Set height to publish or play stream with this value
     * @param {Integer} [options.constraints.video.bitrate=0] DEPRECATED FOR PUBLISH: Set bitrate to publish or play stream with this value
     * @param {Integer} [options.constraints.video.minBitrate=0] Set minimal bitrate to publish stream with this value
     * @param {Integer} [options.constraints.video.maxBitrate=0] Set maximal bitrate to publish stream with this value
     * @param {Integer} [options.constraints.video.quality=0] Set quality to play stream with this value
     * @param {Boolean=} options.receiveAudio DEPRECATED: Receive audio
     * @param {Boolean=} options.receiveVideo DEPRECATED: Receive video
     * @param {Integer=} options.playWidth DEPRECATED: Set width to play stream with this value
     * @param {Integer=} options.playHeight DEPRECATED: Set height to play stream with this value
     * @param {string=} options.mediaProvider MediaProvider type to use with this stream
     * @param {Boolean} [options.record=false] Enable stream recording
     * @param {Boolean=} options.cacheLocalResources Display will contain local video after stream release
     * @param {HTMLElement} options.display Div element stream should be displayed in
     * @param {Object=} options.custom User provided custom object that will be available in REST App code
     * @param {Integer} [options.flashBufferTime=0] Specifies how long to buffer messages before starting to display the stream (Flash-only)
     * @param {Array<string>=} options.stripCodecs Array of codecs which should be stripped from SDP (WebRTC)
     * @param {string=} options.rtmpUrl Rtmp url stream should be forwarded to
     * @param {Object=} options.mediaConnectionConstraints Stream specific constraints for underlying RTCPeerConnection
     * @param {Boolean=} options.flashShowFullScreenButton Show full screen button in flash
     * @param {sdpHook} sdpHook The callback that handles sdp from the server
     * @returns {Stream} Stream
     * @throws {TypeError} Error if no options provided
     * @throws {TypeError} Error if options.name is not specified
     * @throws {Error} Error if session state is not ESTABLISHED
     * @memberof Session
     * @inner
     */
    var createStream = function (options) {

        //Array to transmit promises from stream.available() to streamRefreshHandlers
        var availableCallbacks = [];
        //check session state
        if (sessionStatus !== SESSION_STATUS.ESTABLISHED) {
            throw new Error('Invalid session state');
        }

        //check options
        if (!options) {
            throw new TypeError("options must be provided");
        }
        if (!options.name) {
            throw new TypeError("options.name must be provided");
        }

        var id_ = uuid_v1();
        var name_ = options.name;
        var mediaProvider = options.mediaProvider || getMediaProviders()[0];
        var mediaConnection;
        var display = options.display;
        // Constraints
        if (options.constraints && Object.keys(options.constraints).length != 0) {
            var constraints = options.constraints;
        }
        var mediaConnectionConstraints = options.mediaConnectionConstraints;
        // Receive media
        var receiveAudio;
        var audioOutputId;
        var audioProperty = getConstraintsProperty(constraints, "audio", undefined);
        if (typeof audioProperty === 'boolean') {
            receiveAudio = audioProperty;
        } else if (typeof audioProperty === 'object') {
            receiveAudio = true;
            var _stereo = getConstraintsProperty(audioProperty, "stereo", 0);
            var _bitrate = getConstraintsProperty(audioProperty, "bitrate", 0);
            var _fec = getConstraintsProperty(audioProperty, "fec", 0);
            audioOutputId = getConstraintsProperty(audioProperty, "outputId", 0);
            var _codecOptions = "";
            if (_bitrate) _codecOptions += "maxaveragebitrate=" + _bitrate + ";";
            if (_stereo) _codecOptions += "stereo=1;sprop-stereo=1;";
            if (_fec) _codecOptions += "useinbandfec=1;";
        } else {
            receiveAudio = (typeof options.receiveAudio !== 'undefined') ? options.receiveAudio : true;
        }
        var receiveVideo;
        var videoProperty = getConstraintsProperty(constraints, "video", undefined);
        if (typeof videoProperty === 'boolean') {
            receiveVideo = videoProperty;
        } else if (typeof videoProperty === 'object') {
            receiveVideo = true;
        } else {
            receiveVideo = (typeof options.receiveVideo !== 'undefined') ? options.receiveVideo : true;
        }
        // Bitrate
        var bitrate = getConstraintsProperty(constraints, "video.bitrate", 0);
        var minBitrate = getConstraintsProperty(constraints, "video.minBitrate", 0);
        var maxBitrate = getConstraintsProperty(constraints, "video.maxBitrate", 0);

        // Quality
        var quality = getConstraintsProperty(constraints, "video.quality", 0);
        if (quality > 100) quality = 100;
        // Play resolution
        var playWidth = (typeof options.playWidth !== 'undefined') ? options.playWidth : getConstraintsProperty(constraints, "video.width", 0);
        var playHeight = (typeof options.playHeight !== 'undefined') ? options.playHeight : getConstraintsProperty(constraints, "video.height", 0);
        var stripCodecs = options.stripCodecs || [];
        var resolution = {};

        var published_ = false;
        var record_ = options.record || false;
        var recordFileName = null;
        var cacheLocalResources = options.cacheLocalResources;
        var status_ = STREAM_STATUS.NEW;
        var rtmpUrl = options.rtmpUrl;
        var info_;
        var remoteBitrate = -1;
        var networkBandwidth = -1;
        var sdpHook = options.sdpHook;
        //callbacks added using stream.on()
        var callbacks = {};
        /**
         * Represents media stream.
         *
         * @namespace Stream
         * @see Session~createStream
         */
        var stream = {};
        streamRefreshHandlers[id_] = function (streamInfo, sdp) {
            //set remote sdp
            if (sdp && sdp !== '') {
                var _sdp = sdp;
                if (_codecOptions) _sdp = util.SDP.writeFmtp(sdp, _codecOptions, "opus");
                _sdp = sdpHookHandler(_sdp, sdpHook);
                mediaConnection.setRemoteSdp(_sdp).then(function () {
                });
                return;
            }

            if (streamInfo.available!=undefined) {
                for (var i = 0; i < availableCallbacks.length; i++) {
                    if (streamInfo.available=="true"){
                        availableCallbacks[i].resolve(stream);
                    }else{
                        availableCallbacks[i].reject(stream);
                    }
                }
                availableCallbacks=[];
                return;
            }
            
            var event = streamInfo.status;
            if (event == STREAM_STATUS.RESIZE) {
                resolution.width = streamInfo.playerVideoWidth;
                resolution.height = streamInfo.playerVideoHeight;
            } else if (event == STREAM_STATUS.SNAPSHOT_COMPLETE) {

            } else if (event == STREAM_STATUS.NOT_ENOUGH_BANDWIDTH) {
                var info = streamInfo.info.split("/");
                remoteBitrate = info[0];
                networkBandwidth = info[1];
            } else {
                status_ = event;
            }

            if (event == STREAM_STATUS.PUBLISHING) {
                if (record_) {
                    recordFileName = streamInfo.recordName;
                }
            }
            if (streamInfo.info)
                info_ = streamInfo.info;

            //release stream
            if (event == STREAM_STATUS.FAILED || event == STREAM_STATUS.STOPPED ||
                event == STREAM_STATUS.UNPUBLISHED) {

                delete streams[id_];
                delete streamRefreshHandlers[id_];
                if (mediaConnection) {
                    mediaConnection.close(cacheLocalResources);
                }
            }
            //fire stream event
            if (callbacks[event]) {
                callbacks[event](stream);
            }
        };

        /**
         * Play stream.
         *
         * @throws {Error} Error if stream status is not {@link Flashphoner.constants.STREAM_STATUS.NEW}
         * @memberof Stream
         * @inner
         */
        var play = function () {
            logger.debug(LOG_PREFIX, "Play stream " + name_);
            if (status_ !== STREAM_STATUS.NEW) {
                throw new Error("Invalid stream state");
            }
            status_ = STREAM_STATUS.PENDING;
            //create mediaProvider connection
            MediaProvider[mediaProvider].createConnection({
                id: id_,
                display: display,
                authToken: authToken,
                mainUrl: urlServer,
                flashProto: flashProto,
                flashPort: flashPort,
                flashBufferTime: options.flashBufferTime || 0,
                flashShowFullScreenButton: options.flashShowFullScreenButton || false,
                connectionConfig: mediaOptions,
                connectionConstraints: mediaConnectionConstraints,
                audioOutputId: audioOutputId
            }, streamRefreshHandlers[id_]).then(function (newConnection) {
                mediaConnection = newConnection;
                try {
                    streamRefreshHandlers[id_]({status: status_});
                } catch(e) {
                    console.warn(e);
                }
                return mediaConnection.createOffer({
                    receiveAudio: receiveAudio,
                    receiveVideo: receiveVideo,
                    stripCodecs: stripCodecs
                });
            }).then(function (offer) {
                logger.debug(LOG_PREFIX, "Offer SDP:\n" + offer.sdp);
                //request stream with offer sdp from server
                send("playStream", {
                    mediaSessionId: id_,
                    name: name_,
                    published: published_,
                    hasVideo: true,
                    hasAudio: true,
                    status: status_,
                    record: false,
                    width: playWidth,
                    height: playHeight,
                    mediaProvider: mediaProvider,
                    sdp: offer.sdp,
                    custom: options.custom,
                    bitrate: bitrate,
                    minBitrate: minBitrate,
                    maxBitrate: maxBitrate,
                    quality: quality,
                    constraints: constraints
                });
                if (offer.player) {
                    offer.player.play(id_);
                }
            }).catch(function (error) {
                //todo fire stream failed status
                throw error;
            });
        };

        /**
         * Publish stream.
         *
         * @throws {Error} Error if stream status is not {@link Flashphoner.constants.STREAM_STATUS.NEW}
         * @memberof Stream
         * @inner
         */
        var publish = function () {
            logger.debug(LOG_PREFIX, "Publish stream " + name_);
            if (status_ !== STREAM_STATUS.NEW) {
                throw new Error("Invalid stream state");
            }
            status_ = STREAM_STATUS.PENDING;
            published_ = true;
            var hasAudio = true;

            if (constraints && constraints.video && constraints.video.type && constraints.video.type == "screen") {
                hasAudio = false;
            }

            //get access to camera
            MediaProvider[mediaProvider].getMediaAccess(constraints, display).then(function () {
                if (status_ == STREAM_STATUS.FAILED) {
                    //stream failed while we were waiting for media access, release media
                    if (!cacheLocalResources) {
                        releaseLocalMedia(display, mediaProvider);
                    }
                    return;
                }
                //create mediaProvider connection
                MediaProvider[mediaProvider].createConnection({
                    id: id_,
                    display: display,
                    authToken: authToken,
                    mainUrl: urlServer,
                    flashProto: flashProto,
                    flashPort: flashPort,
                    constraints: constraints,
                    connectionConfig: mediaOptions,
                    connectionConstraints: mediaConnectionConstraints,
                    customStream: constraints && constraints.customStream ? constraints.customStream : false
                }).then(function (newConnection) {
                    mediaConnection = newConnection;
                    return mediaConnection.createOffer({
                        stripCodecs: stripCodecs
                    });
                }).then(function (offer) {
                    logger.debug(LOG_PREFIX, "Offer SDP:\n" + offer.sdp);
                    //publish stream with offer sdp to server
                    send("publishStream", {
                        mediaSessionId: id_,
                        name: name_,
                        published: published_,
                        hasVideo: offer.hasVideo,
                        hasAudio: offer.hasAudio,
                        status: status_,
                        record: record_,
                        mediaProvider: mediaProvider,
                        sdp: offer.sdp,
                        custom: options.custom,
                        bitrate: bitrate,
                        minBitrate: minBitrate,
                        maxBitrate: maxBitrate,
                        rtmpUrl: rtmpUrl,
                        constraints: constraints
                    });
                });
            }).catch(function (error) {
                logger.warn(LOG_PREFIX, error);
                stream.info = error.message;
                status_ = STREAM_STATUS.FAILED;
                //fire stream event
                if (callbacks[status_]) {
                    callbacks[status_](stream);
                }
            });
        };

        /**
         * Switch camera in real-time.
         * Works only with WebRTC
         *
         * @memberOf Stream
         * @inner
         * @throws {Error} Error if stream status is not {@link Flashphoner.constants.STREAM_STATUS.PUBLISHING}
         */
		var switchCam = function(deviceId) {
		    if(status_ !== STREAM_STATUS.PUBLISHING){
		        throw new Error('Invalid stream state');
            }
            return mediaConnection.switchCam(deviceId);
        };

        /**
         * Switch microphone in real-time.
         * Works only with WebRTC
         *
         * @memberOf Stream
         * @inner
         * @throws {Error} Error if stream status is not {@link Flashphoner.constants.STREAM_STATUS.PUBLISHING}
         */
        var switchMic = function(deviceId) {
            if(status_ !== STREAM_STATUS.PUBLISHING){
                throw new Error('Invalid stream state');
            }
            return mediaConnection.switchMic(deviceId);
        };

        /**
         * Set Microphone Gain
         *
         * @memberOf Stream
         * @inner
         * @throws {Error} Error if stream status is not {@link Flashphoner.constants.STREAM_STATUS.PUBLISHING}
         */
		var setMicrophoneGain = function (volume) {
            if(status_ !== STREAM_STATUS.PUBLISHING){
                throw new Error('Invalid stream state');
            }
		    mediaConnection.setMicrophoneGain(volume);
        };

        /**
         * Stop stream.
         *
         * @memberof Stream
         * @inner
         */
        var stop = function () {
            logger.debug(LOG_PREFIX, "Stop stream " + name_);
            if (status_ == STREAM_STATUS.NEW) {
                //trigger FAILED status
                streamRefreshHandlers[id_]({status: STREAM_STATUS.FAILED});
                return;
            } else if (status_ == STREAM_STATUS.PENDING) {
                logger.warn(LOG_PREFIX, "Stopping stream before server response " + id_);
                setTimeout(stop, 200);
                return;
            } else if (status_ == STREAM_STATUS.FAILED) {
                logger.warn(LOG_PREFIX, "Stream status FAILED");
                return;
            }
            if (published_) {
                send("unPublishStream", {
                    mediaSessionId: id_,
                    name: name_,
                    published: published_,
                    hasVideo: true,
                    hasAudio: true,
                    status: status_,
                    record: false
                });
            } else {
                send("stopStream", {
                    mediaSessionId: id_,
                    name: name_,
                    published: published_,
                    hasVideo: true,
                    hasAudio: true,
                    status: status_,
                    record: false
                });
            }
            //free media provider
            if (mediaConnection) {
                mediaConnection.close(cacheLocalResources);
            }
        };

        /**
         * Request remote stream snapshot.
         * @throws {Error} Error if stream status is not {@link Flashphoner.constants.STREAM_STATUS.NEW}
         * @memberof Stream
         * @inner
         */
        var snapshot = function () {
            logger.debug(LOG_PREFIX, "Request snapshot, stream " + name_);
            if (status_ !== STREAM_STATUS.NEW && status_ !== STREAM_STATUS.PLAYING && status_ !== STREAM_STATUS.PUBLISHING) {
                throw new Error("Invalid stream state");
            }
            send("snapshot", {
                name: name_,
                mediaSessionId: id_
            });
        };

        /**
         * Get stream status.
         *
         * @returns {string} One of {@link Flashphoner.constants.STREAM_STATUS}
         * @memberof Stream
         * @inner
         */
        var status = function () {
            return status_;
        };

        /**
         * Get stream id.
         *
         * @returns {string} Stream id
         * @memberof Stream
         * @inner
         */
        var id = function () {
            return id_;
        };

        /**
         * Get stream name.
         *
         * @returns {string} Stream name
         * @memberof Stream
         * @inner
         */
        var name = function () {
            return name_;
        };

        /**
         * Is stream published.
         *
         * @returns {Boolean} True if stream published, otherwise false
         * @memberof Stream
         * @inner
         */
        var published = function () {
            return published_;
        };

        /**
         * Get record file name
         * @returns {string} File name
         * @memberof Stream
         * @inner
         */
        var getRecordInfo = function () {
            return recordFileName;
        };

        /**
         * Get stream info
         * @returns {string} Info
         * @memberof Stream
         * @inner
         */
        var getInfo = function () {
            return info_;
        };

        /**
         * Get stream video size
         * @returns {Object} Video size
         * @memberof Stream
         * @inner
         */
        var videoResolution = function () {
            if (!published_) {
                return resolution;
            } else {
                throw new Error("This function available only on playing stream");
            }
        };

        /**
         * Media controls
         */

        /**
         * Set other oupout audio device
         *
         * @param {string} id Id of output device
         * @memberof Call
         * @inner
         */
        var setAudioOutputId = function(id) {
            audioOutputId = id;
            if (mediaConnection && mediaConnection.setAudioOutputId) {
                return mediaConnection.setAudioOutputId(id);
            }
        };

        /**
         * Set volume of remote media
         *
         * @param {number} volume Volume between 0 and 100
         * @memberof Stream
         * @inner
         */
        var setVolume = function (volume) {
            if (mediaConnection) {
                mediaConnection.setVolume(volume);
            }
        };

        /**
         * Get current volume
         *
         * @returns {number} Volume or -1 if audio is not available
         * @memberof Stream
         * @inner
         */
        var getVolume = function () {
            if (mediaConnection) {
                return mediaConnection.getVolume();
            }
            return -1;
        };

        /**
         * Mute outgoing audio
         *
         * @memberof Stream
         * @inner
         */
        var muteAudio = function () {
            if (mediaConnection) {
                mediaConnection.muteAudio();
            }
        };

        /**
         * Unmute outgoing audio
         *
         * @memberof Stream
         * @inner
         */
        var unmuteAudio = function () {
            if (mediaConnection) {
                mediaConnection.unmuteAudio();
            }
        };

        /**
         * Check outgoing audio mute state
         *
         * @returns {boolean} True if audio is muted or not available
         * @memberof Stream
         * @inner
         */
        var isAudioMuted = function () {
            if (mediaConnection) {
                return mediaConnection.isAudioMuted();
            }
            return true;
        };

        /**
         * Mute outgoing video
         *
         * @memberof Stream
         * @inner
         */
        var muteVideo = function () {
            if (mediaConnection) {
                mediaConnection.muteVideo();
            }
        };

        /**
         * Unmute outgoing video
         *
         * @memberof Stream
         * @inner
         */
        var unmuteVideo = function () {
            if (mediaConnection) {
                mediaConnection.unmuteVideo();
            }
        };

        /**
         * Check outgoing video mute state
         *
         * @returns {boolean} True if video is muted or not available
         * @memberof Stream
         * @inner
         */
        var isVideoMuted = function () {
            if (mediaConnection) {
                return mediaConnection.isVideoMuted();
            }
            return true;
        };

        /**
         * Get statistics
         *
         * @param {callbackFn} callbackFn The callback that handles response
         * @returns {Object} Stream audio\video statistics
         * @memberof Stream
         * @inner
         */
        var getStats = function (callbackFn) {
            if (mediaConnection) {
                mediaConnection.getStats(callbackFn);
            }
        };

        /**
         * Get remote bitrate reported by server, works only for subscribe Stream
         *
         * @returns {number} Remote bitrate in bps or -1
         * @memberof Stream
         * @inner
         */
        var getRemoteBitrate = function () {
            return remoteBitrate;
        };

        /**
         * Get network bandwidth reported by server, works only for subscribe Stream
         *
         * @returns {number} Network bandwidth in bps or -1
         * @memberof Stream
         * @inner
         */
        var getNetworkBandwidth = function () {
            return networkBandwidth;
        };

        /**
         * Request full screen for player stream
         * @memberof Stream
         * @inner
         */
        var fullScreen = function () {
            if (published()) {
                logger.warn(LOG_PREFIX, "Full screen is allowed only for played streams");
            } else {
                if (mediaConnection)
                    mediaConnection.fullScreen();
            }
        };

        /**
         * Stream event callback.
         *
         * @callback Stream~eventCallback
         * @param {Stream} stream Stream that corresponds to the event
         */

        /**
         * Add stream event callback.
         *
         * @param {string} event One of {@link Flashphoner.constants.STREAM_STATUS} events
         * @param {Stream~eventCallback} callback Callback function
         * @returns {Stream} Stream callback was attached to
         * @throws {TypeError} Error if event is not specified
         * @throws {Error} Error if callback is not a valid function
         * @memberof Stream
         * @inner
         */
        var on = function (event, callback) {
            if (!event) {
                throw new TypeError("Event can't be null");
            }
            if (!callback || typeof callback !== 'function') {
                throw new Error("Callback needs to be a valid function");
            }
            callbacks[event] = callback;
            return stream;
        };

        /**
         * Сhecks the availability of stream on the server
         *
         * @returns {Promise} Resolves if is stream available, otherwise rejects
         * @memberof Stream
         * @inner
         */
        var available = function(){
            return new Promise(function(resolve, reject){
                send("availableStream", {
                    mediaSessionId: id_,
                    name: name_
                });
                var promise = {};
                promise.resolve = resolve;
                promise.reject = reject;
                availableCallbacks.push(promise);
            });
        };

        stream.play = play;
        stream.publish = publish;
        stream.stop = stop;
        stream.id = id;
        stream.status = status;
        stream.name = name;
        stream.published = published;
        stream.getRecordInfo = getRecordInfo;
        stream.getInfo = getInfo;
        stream.videoResolution = videoResolution;
        stream.setAudioOutputId = setAudioOutputId;
        stream.setVolume = setVolume;
        stream.setMicrophoneGain = setMicrophoneGain;
        stream.getVolume = getVolume;
        stream.muteAudio = muteAudio;
        stream.unmuteAudio = unmuteAudio;
        stream.isAudioMuted = isAudioMuted;
        stream.muteVideo = muteVideo;
        stream.unmuteVideo = unmuteVideo;
        stream.isVideoMuted = isVideoMuted;
        stream.getStats = getStats;
        stream.snapshot = snapshot;
        stream.getNetworkBandwidth = getNetworkBandwidth;
        stream.getRemoteBitrate = getRemoteBitrate;
        stream.fullScreen = fullScreen;
        stream.on = on;
        stream.available = available;
		stream.switchCam = switchCam;
        stream.switchMic = switchMic;

        streams[id_] = stream;
        return stream;

    };

    /**
     * Disconnect session.
     *
     * @memberof Session
     * @inner
     */
    var disconnect = function () {
        if (wsConnection) {
            wsConnection.close();
        }
    };

    /**
     * Get session id
     *
     * @returns {string} session id
     * @memberof Session
     * @inner
     */
    var id = function () {
        return id_;
    };

    /**
     * Get server address
     *
     * @returns {string} Server url
     * @memberof Session
     * @inner
     */
    var getServerUrl = function () {
        return urlServer;
    };

    /**
     * Get session status
     *
     * @returns {string} One of {@link Flashphoner.constants.SESSION_STATUS}
     * @memberof Session
     * @inner
     */
    var status = function () {
        return sessionStatus;
    };

    /**
     * Get stream by id.
     *
     * @param {string} streamId Stream id
     * @returns {Stream} Stream
     * @memberof Session
     * @inner
     */
    var getStream = function (streamId) {
        return streams[streamId];
    };

    /**
     * Get streams.
     *
     * @returns {Array<Stream>} Streams
     * @memberof Session
     * @inner
     */
    var getStreams = function () {
        return util.copyObjectToArray(streams);
    };

    /**
     * Submit bug report.
     *
     * @param {Object} reportObject Report object
     * @memberof Session
     * @inner
     */
    var submitBugReport = function (reportObject) {
        send("submitBugReport", reportObject);
    }

    /**
     * Start session debug
     * @memberof Session
     * @inner
     */

    var startDebug = function () {
        logger.setPushLogs(true);
        logger.setLevel("DEBUG");
        send("sessionDebug", {command: "start"});
    }

    /**
     * Stop session debug
     * @memberof Session
     * @inner
     */

    var stopDebug = function () {
        logger.setLevel("INFO");
        send("sessionDebug", {command: "stop"});
    }

    /**
     * Session event callback.
     *
     * @callback Session~eventCallback
     * @param {Session} session Session that corresponds to the event
     */

    /**
     * Add session event callback.
     *
     * @param {string} event One of {@link Flashphoner.constants.SESSION_STATUS} events
     * @param {Session~eventCallback} callback Callback function
     * @returns {Session} Session
     * @throws {TypeError} Error if event is not specified
     * @throws {Error} Error if callback is not a valid function
     * @memberof Session
     * @inner
     */
    var on = function (event, callback) {
        if (!event) {
            throw new Error("Event can't be null", "TypeError");
        }
        if (!callback || typeof callback !== 'function') {
            throw new Error("Callback needs to be a valid function");
        }
        callbacks[event] = callback;
        return session;
    };

    var restAppCommunicator = function () {
        var pending = {};
        var exports = {};
        /**
         * Send data to REST App
         *
         * @param {Object} data Object to send
         * @returns {Promise} Resolves if data accepted, otherwise rejects
         * @memberof Session
         * @name sendData
         * @method
         * @inner
         */
        exports.sendData = function (data) {
            return new Promise(function (resolve, reject) {
                var obj = {
                    operationId: uuid_v1(),
                    payload: data
                };
                pending[obj.operationId] = {
                    FAILED: function (info) {
                        reject(info);
                    },
                    ACCEPTED: function (info) {
                        resolve(info);
                    }
                };
                send("sendData", obj);
            });
        };
        exports.resolveData = function (data) {
            if (pending[data.operationId]) {
                var handler = pending[data.operationId];
                delete pending[data.operationId];
                delete data.operationId;
                handler[data.status](data);
            }
        };
        return exports;
    }();

    var sdpHookHandler = function(sdp, sdpHook){
        if (sdpHook != undefined && typeof sdpHook == 'function') {
            var sdpObject = {sdpString: sdp};
            var newSdp = sdpHook(sdpObject);
            if (newSdp != null && newSdp != "") {
                return newSdp;
            }
            return sdp;
        }
        return sdp;
    }

    //export Session
    session.id = id;
    session.status = status;
    session.getServerUrl = getServerUrl;
    session.createStream = createStream;
    session.createCall = createCall;
    session.getStream = getStream;
    session.getStreams = getStreams;
    session.sendData = restAppCommunicator.sendData;
    session.disconnect = disconnect;
    session.submitBugReport = submitBugReport;
    session.startDebug = startDebug;
    session.stopDebug = stopDebug;
    session.on = on;

    //save interface to global map
    sessions[id_] = session;
    return session;
};

var isUsingTemasys = function () {
    return isUsingTemasysPlugin;
};

module.exports = {
    init: init,
    isUsingTemasys: isUsingTemasys,
    getMediaProviders: getMediaProviders,
    getMediaDevices: getMediaDevices,
    getMediaAccess: getMediaAccess,
    releaseLocalMedia: releaseLocalMedia,
    getSessions: getSessions,
    getSession: getSession,
    createSession: createSession,
    playFirstSound: playFirstSound,
    playFirstVideo: playFirstVideo,
    getLogger: getLogger,
    roomApi: require('./room-module'),
    constants: constants,
    /**
     * The Screensharing whitelist is no longer needed to share your screen or windows starting Firefox 52
     * https://wiki.mozilla.org/Screensharing
     */
    firefoxScreenSharingExtensionInstalled: true
};
},{"./constants":24,"./flash-media-provider":25,"./media-source-media-provider":27,"./room-module":28,"./temasys-media-provider":1,"./util":29,"./webrtc-media-provider":30,"./websocket-media-provider":31,"promise-polyfill":3,"uuid/v1":10,"webrtc-adapter":11}],27:[function(require,module,exports){
(function (global){
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.MediaSourceMediaProvider=t()}}(function(){var define,module,exports;return function(){function t(e,r,n){function i(a,s){if(!r[a]){if(!e[a]){var f="function"==typeof require&&require;if(!s&&f)return f(a,!0);if(o)return o(a,!0);var c=new Error("Cannot find module '"+a+"'");throw c.code="MODULE_NOT_FOUND",c}var u=r[a]={exports:{}};e[a][0].call(u.exports,function(t){return i(e[a][1][t]||t)},u,u.exports,t,e,r,n)}return r[a].exports}for(var o="function"==typeof require&&require,a=0;a<n.length;a++)i(n[a]);return i}return t}()({1:[function(t,e,r){e.exports=function(t,e){if(t===e)return!0;if(t.byteLength!==e.byteLength)return!1;for(var r=new DataView(t),n=new DataView(e),i=t.byteLength;i--;)if(r.getUint8(i)!==n.getUint8(i))return!1;return!0}},{}],2:[function(t,e,r){var n=r;n.bignum=t(18),n.define=t(3).define,n.base=t(5),n.constants=t(9),n.decoders=t(11),n.encoders=t(14)},{11:11,14:14,18:18,3:3,5:5,9:9}],3:[function(t,e,r){function n(t,e){this.name=t,this.body=e,this.decoders={},this.encoders={}}var i=t(2),o=t(427);r.define=function(t,e){return new n(t,e)},n.prototype._createNamed=function(e){var r;try{r=t(485).runInThisContext("(function "+this.name+"(entity) {\n  this._initNamed(entity);\n})")}catch(t){r=function(t){this._initNamed(t)}}return o(r,e),r.prototype._initNamed=function(t){e.call(this,t)},new r(this)},n.prototype._getDecoder=function(t){return t=t||"der",this.decoders.hasOwnProperty(t)||(this.decoders[t]=this._createNamed(i.decoders[t])),this.decoders[t]},n.prototype.decode=function(t,e,r){return this._getDecoder(e).decode(t,r)},n.prototype._getEncoder=function(t){return t=t||"der",this.encoders.hasOwnProperty(t)||(this.encoders[t]=this._createNamed(i.encoders[t])),this.encoders[t]},n.prototype.encode=function(t,e,r){return this._getEncoder(e).encode(t,r)}},{2:2,427:427,485:485}],4:[function(t,e,r){function n(t,e){if(a.call(this,e),!s.isBuffer(t))return void this.error("Input not Buffer");this.base=t,this.offset=0,this.length=t.length}function i(t,e){if(Array.isArray(t))this.length=0,this.value=t.map(function(t){return t instanceof i||(t=new i(t,e)),this.length+=t.length,t},this);else if("number"==typeof t){if(!(0<=t&&t<=255))return e.error("non-byte EncoderBuffer value");this.value=t,this.length=1}else if("string"==typeof t)this.value=t,this.length=s.byteLength(t);else{if(!s.isBuffer(t))return e.error("Unsupported type: "+typeof t);this.value=t,this.length=t.length}}var o=t(427),a=t(5).Reporter,s=t(50).Buffer;o(n,a),r.DecoderBuffer=n,n.prototype.save=function(){return{offset:this.offset,reporter:a.prototype.save.call(this)}},n.prototype.restore=function(t){var e=new n(this.base);return e.offset=t.offset,e.length=this.offset,this.offset=t.offset,a.prototype.restore.call(this,t.reporter),e},n.prototype.isEmpty=function(){return this.offset===this.length},n.prototype.readUInt8=function(t){return this.offset+1<=this.length?this.base.readUInt8(this.offset++,!0):this.error(t||"DecoderBuffer overrun")},n.prototype.skip=function(t,e){if(!(this.offset+t<=this.length))return this.error(e||"DecoderBuffer overrun");var r=new n(this.base);return r._reporterState=this._reporterState,r.offset=this.offset,r.length=this.offset+t,this.offset+=t,r},n.prototype.raw=function(t){return this.base.slice(t?t.offset:this.offset,this.length)},r.EncoderBuffer=i,i.prototype.join=function(t,e){return t||(t=new s(this.length)),e||(e=0),0===this.length?t:(Array.isArray(this.value)?this.value.forEach(function(r){r.join(t,e),e+=r.length}):("number"==typeof this.value?t[e]=this.value:"string"==typeof this.value?t.write(this.value,e):s.isBuffer(this.value)&&this.value.copy(t,e),e+=this.length),t)}},{427:427,5:5,50:50}],5:[function(t,e,r){var n=r;n.Reporter=t(7).Reporter,n.DecoderBuffer=t(4).DecoderBuffer,n.EncoderBuffer=t(4).EncoderBuffer,n.Node=t(6)},{4:4,6:6,7:7}],6:[function(t,e,r){function n(t,e){var r={};this._baseState=r,r.enc=t,r.parent=e||null,r.children=null,r.tag=null,r.args=null,r.reverseArgs=null,r.choice=null,r.optional=!1,r.any=!1,r.obj=!1,r.use=null,r.useDecoder=null,r.key=null,r.default=null,r.explicit=null,r.implicit=null,r.contains=null,r.parent||(r.children=[],this._wrap())}var i=t(5).Reporter,o=t(5).EncoderBuffer,a=t(5).DecoderBuffer,s=t(432),f=["seq","seqof","set","setof","objid","bool","gentime","utctime","null_","enum","int","objDesc","bitstr","bmpstr","charstr","genstr","graphstr","ia5str","iso646str","numstr","octstr","printstr","t61str","unistr","utf8str","videostr"],c=["key","obj","use","optional","explicit","implicit","def","choice","any","contains"].concat(f),u=["_peekTag","_decodeTag","_use","_decodeStr","_decodeObjid","_decodeTime","_decodeNull","_decodeInt","_decodeBool","_decodeList","_encodeComposite","_encodeStr","_encodeObjid","_encodeTime","_encodeNull","_encodeInt","_encodeBool"];e.exports=n;var h=["enc","parent","children","tag","args","reverseArgs","choice","optional","any","obj","use","alteredUse","key","default","explicit","implicit","contains"];n.prototype.clone=function(){var t=this._baseState,e={};h.forEach(function(r){e[r]=t[r]});var r=new this.constructor(e.parent);return r._baseState=e,r},n.prototype._wrap=function(){var t=this._baseState;c.forEach(function(e){this[e]=function(){var r=new this.constructor(this);return t.children.push(r),r[e].apply(r,arguments)}},this)},n.prototype._init=function(t){var e=this._baseState;s(null===e.parent),t.call(this),e.children=e.children.filter(function(t){return t._baseState.parent===this},this),s.equal(e.children.length,1,"Root node can have only one child")},n.prototype._useArgs=function(t){var e=this._baseState,r=t.filter(function(t){return t instanceof this.constructor},this);t=t.filter(function(t){return!(t instanceof this.constructor)},this),0!==r.length&&(s(null===e.children),e.children=r,r.forEach(function(t){t._baseState.parent=this},this)),0!==t.length&&(s(null===e.args),e.args=t,e.reverseArgs=t.map(function(t){if("object"!=typeof t||t.constructor!==Object)return t;var e={};return Object.keys(t).forEach(function(r){r==(0|r)&&(r|=0);var n=t[r];e[n]=r}),e}))},u.forEach(function(t){n.prototype[t]=function(){var e=this._baseState;throw new Error(t+" not implemented for encoding: "+e.enc)}}),f.forEach(function(t){n.prototype[t]=function(){var e=this._baseState,r=Array.prototype.slice.call(arguments);return s(null===e.tag),e.tag=t,this._useArgs(r),this}}),n.prototype.use=function(t){s(t);var e=this._baseState;return s(null===e.use),e.use=t,this},n.prototype.optional=function(){return this._baseState.optional=!0,this},n.prototype.def=function(t){var e=this._baseState;return s(null===e.default),e.default=t,e.optional=!0,this},n.prototype.explicit=function(t){var e=this._baseState;return s(null===e.explicit&&null===e.implicit),e.explicit=t,this},n.prototype.implicit=function(t){var e=this._baseState;return s(null===e.explicit&&null===e.implicit),e.implicit=t,this},n.prototype.obj=function(){var t=this._baseState,e=Array.prototype.slice.call(arguments);return t.obj=!0,0!==e.length&&this._useArgs(e),this},n.prototype.key=function(t){var e=this._baseState;return s(null===e.key),e.key=t,this},n.prototype.any=function(){return this._baseState.any=!0,this},n.prototype.choice=function(t){var e=this._baseState;return s(null===e.choice),e.choice=t,this._useArgs(Object.keys(t).map(function(e){return t[e]})),this},n.prototype.contains=function(t){var e=this._baseState;return s(null===e.use),e.contains=t,this},n.prototype._decode=function(t,e){var r=this._baseState;if(null===r.parent)return t.wrapResult(r.children[0]._decode(t,e));var n=r.default,i=!0,o=null;if(null!==r.key&&(o=t.enterKey(r.key)),r.optional){var s=null;if(null!==r.explicit?s=r.explicit:null!==r.implicit?s=r.implicit:null!==r.tag&&(s=r.tag),null!==s||r.any){if(i=this._peekTag(t,s,r.any),t.isError(i))return i}else{var f=t.save();try{null===r.choice?this._decodeGeneric(r.tag,t,e):this._decodeChoice(t,e),i=!0}catch(t){i=!1}t.restore(f)}}var c;if(r.obj&&i&&(c=t.enterObject()),i){if(null!==r.explicit){var u=this._decodeTag(t,r.explicit);if(t.isError(u))return u;t=u}var h=t.offset;if(null===r.use&&null===r.choice){if(r.any)var f=t.save();var d=this._decodeTag(t,null!==r.implicit?r.implicit:r.tag,r.any);if(t.isError(d))return d;r.any?n=t.raw(f):t=d}if(e&&e.track&&null!==r.tag&&e.track(t.path(),h,t.length,"tagged"),e&&e.track&&null!==r.tag&&e.track(t.path(),t.offset,t.length,"content"),n=r.any?n:null===r.choice?this._decodeGeneric(r.tag,t,e):this._decodeChoice(t,e),t.isError(n))return n;if(r.any||null!==r.choice||null===r.children||r.children.forEach(function(r){r._decode(t,e)}),r.contains&&("octstr"===r.tag||"bitstr"===r.tag)){var l=new a(n);n=this._getUse(r.contains,t._reporterState.obj)._decode(l,e)}}return r.obj&&i&&(n=t.leaveObject(c)),null===r.key||null===n&&!0!==i?null!==o&&t.exitKey(o):t.leaveKey(o,r.key,n),n},n.prototype._decodeGeneric=function(t,e,r){var n=this._baseState;return"seq"===t||"set"===t?null:"seqof"===t||"setof"===t?this._decodeList(e,t,n.args[0],r):/str$/.test(t)?this._decodeStr(e,t,r):"objid"===t&&n.args?this._decodeObjid(e,n.args[0],n.args[1],r):"objid"===t?this._decodeObjid(e,null,null,r):"gentime"===t||"utctime"===t?this._decodeTime(e,t,r):"null_"===t?this._decodeNull(e,r):"bool"===t?this._decodeBool(e,r):"objDesc"===t?this._decodeStr(e,t,r):"int"===t||"enum"===t?this._decodeInt(e,n.args&&n.args[0],r):null!==n.use?this._getUse(n.use,e._reporterState.obj)._decode(e,r):e.error("unknown tag: "+t)},n.prototype._getUse=function(t,e){var r=this._baseState;return r.useDecoder=this._use(t,e),s(null===r.useDecoder._baseState.parent),r.useDecoder=r.useDecoder._baseState.children[0],r.implicit!==r.useDecoder._baseState.implicit&&(r.useDecoder=r.useDecoder.clone(),r.useDecoder._baseState.implicit=r.implicit),r.useDecoder},n.prototype._decodeChoice=function(t,e){var r=this._baseState,n=null,i=!1;return Object.keys(r.choice).some(function(o){var a=t.save(),s=r.choice[o];try{var f=s._decode(t,e);if(t.isError(f))return!1;n={type:o,value:f},i=!0}catch(e){return t.restore(a),!1}return!0},this),i?n:t.error("Choice not matched")},n.prototype._createEncoderBuffer=function(t){return new o(t,this.reporter)},n.prototype._encode=function(t,e,r){var n=this._baseState;if(null===n.default||n.default!==t){var i=this._encodeValue(t,e,r);if(void 0!==i&&!this._skipDefault(i,e,r))return i}},n.prototype._encodeValue=function(t,e,r){var n=this._baseState;if(null===n.parent)return n.children[0]._encode(t,e||new i);var o=null;if(this.reporter=e,n.optional&&void 0===t){if(null===n.default)return;t=n.default}var a=null,s=!1;if(n.any)o=this._createEncoderBuffer(t);else if(n.choice)o=this._encodeChoice(t,e);else if(n.contains)a=this._getUse(n.contains,r)._encode(t,e),s=!0;else if(n.children)a=n.children.map(function(r){if("null_"===r._baseState.tag)return r._encode(null,e,t);if(null===r._baseState.key)return e.error("Child should have a key");var n=e.enterKey(r._baseState.key);if("object"!=typeof t)return e.error("Child expected, but input is not object");var i=r._encode(t[r._baseState.key],e,t);return e.leaveKey(n),i},this).filter(function(t){return t}),a=this._createEncoderBuffer(a);else if("seqof"===n.tag||"setof"===n.tag){if(!n.args||1!==n.args.length)return e.error("Too many args for : "+n.tag);if(!Array.isArray(t))return e.error("seqof/setof, but data is not Array");var f=this.clone();f._baseState.implicit=null,a=this._createEncoderBuffer(t.map(function(r){var n=this._baseState;return this._getUse(n.args[0],t)._encode(r,e)},f))}else null!==n.use?o=this._getUse(n.use,r)._encode(t,e):(a=this._encodePrimitive(n.tag,t),s=!0);var o;if(!n.any&&null===n.choice){var c=null!==n.implicit?n.implicit:n.tag,u=null===n.implicit?"universal":"context";null===c?null===n.use&&e.error("Tag could be omitted only for .use()"):null===n.use&&(o=this._encodeComposite(c,s,u,a))}return null!==n.explicit&&(o=this._encodeComposite(n.explicit,!1,"context",o)),o},n.prototype._encodeChoice=function(t,e){var r=this._baseState,n=r.choice[t.type];return n||s(!1,t.type+" not found in "+JSON.stringify(Object.keys(r.choice))),n._encode(t.value,e)},n.prototype._encodePrimitive=function(t,e){var r=this._baseState;if(/str$/.test(t))return this._encodeStr(e,t);if("objid"===t&&r.args)return this._encodeObjid(e,r.reverseArgs[0],r.args[1]);if("objid"===t)return this._encodeObjid(e,null,null);if("gentime"===t||"utctime"===t)return this._encodeTime(e,t);if("null_"===t)return this._encodeNull();if("int"===t||"enum"===t)return this._encodeInt(e,r.args&&r.reverseArgs[0]);if("bool"===t)return this._encodeBool(e);if("objDesc"===t)return this._encodeStr(e,t);throw new Error("Unsupported tag: "+t)},n.prototype._isNumstr=function(t){return/^[0-9 ]*$/.test(t)},n.prototype._isPrintstr=function(t){return/^[A-Za-z0-9 '\(\)\+,\-\.\/:=\?]*$/.test(t)}},{432:432,5:5}],7:[function(t,e,r){function n(t){this._reporterState={obj:null,path:[],options:t||{},errors:[]}}function i(t,e){this.path=t,this.rethrow(e)}var o=t(427);r.Reporter=n,n.prototype.isError=function(t){return t instanceof i},n.prototype.save=function(){var t=this._reporterState;return{obj:t.obj,pathLen:t.path.length}},n.prototype.restore=function(t){var e=this._reporterState;e.obj=t.obj,e.path=e.path.slice(0,t.pathLen)},n.prototype.enterKey=function(t){return this._reporterState.path.push(t)},n.prototype.exitKey=function(t){var e=this._reporterState;e.path=e.path.slice(0,t-1)},n.prototype.leaveKey=function(t,e,r){var n=this._reporterState;this.exitKey(t),null!==n.obj&&(n.obj[e]=r)},n.prototype.path=function(){return this._reporterState.path.join("/")},n.prototype.enterObject=function(){var t=this._reporterState,e=t.obj;return t.obj={},e},n.prototype.leaveObject=function(t){var e=this._reporterState,r=e.obj;return e.obj=t,r},n.prototype.error=function(t){var e,r=this._reporterState,n=t instanceof i;if(e=n?t:new i(r.path.map(function(t){return"["+JSON.stringify(t)+"]"}).join(""),t.message||t,t.stack),!r.options.partial)throw e;return n||r.errors.push(e),e},n.prototype.wrapResult=function(t){var e=this._reporterState;return e.options.partial?{result:this.isError(t)?null:t,errors:e.errors}:t},o(i,Error),i.prototype.rethrow=function(t){if(this.message=t+" at: "+(this.path||"(shallow)"),Error.captureStackTrace&&Error.captureStackTrace(this,i),!this.stack)try{throw new Error(this.message)}catch(t){this.stack=t.stack}return this}},{427:427}],8:[function(t,e,r){var n=t(9);r.tagClass={0:"universal",1:"application",2:"context",3:"private"},r.tagClassByName=n._reverse(r.tagClass),r.tag={0:"end",1:"bool",2:"int",3:"bitstr",4:"octstr",5:"null_",6:"objid",7:"objDesc",8:"external",9:"real",10:"enum",11:"embed",12:"utf8str",13:"relativeOid",16:"seq",17:"set",18:"numstr",19:"printstr",20:"t61str",21:"videostr",22:"ia5str",23:"utctime",24:"gentime",25:"graphstr",26:"iso646str",27:"genstr",28:"unistr",29:"charstr",30:"bmpstr"},r.tagByName=n._reverse(r.tag)},{9:9}],9:[function(t,e,r){var n=r;n._reverse=function(t){var e={};return Object.keys(t).forEach(function(r){(0|r)==r&&(r|=0);var n=t[r];e[n]=r}),e},n.der=t(8)},{8:8}],10:[function(t,e,r){function n(t){this.enc="der",this.name=t.name,this.entity=t,this.tree=new i,this.tree._init(t.body)}function i(t){c.Node.call(this,"der",t)}function o(t,e){var r=t.readUInt8(e);if(t.isError(r))return r;var n=h.tagClass[r>>6],i=0==(32&r);if(31==(31&r)){var o=r;for(r=0;128==(128&o);){if(o=t.readUInt8(e),t.isError(o))return o;r<<=7,r|=127&o}}else r&=31;return{cls:n,primitive:i,tag:r,tagStr:h.tag[r]}}function a(t,e,r){var n=t.readUInt8(r);if(t.isError(n))return n;if(!e&&128===n)return null;if(0==(128&n))return n;var i=127&n;if(i>4)return t.error("length octect is too long");n=0;for(var o=0;o<i;o++){n<<=8;var a=t.readUInt8(r);if(t.isError(a))return a;n|=a}return n}var s=t(427),f=t(2),c=f.base,u=f.bignum,h=f.constants.der;e.exports=n,n.prototype.decode=function(t,e){return t instanceof c.DecoderBuffer||(t=new c.DecoderBuffer(t,e)),this.tree._decode(t,e)},s(i,c.Node),i.prototype._peekTag=function(t,e,r){if(t.isEmpty())return!1;var n=t.save(),i=o(t,'Failed to peek tag: "'+e+'"');return t.isError(i)?i:(t.restore(n),i.tag===e||i.tagStr===e||i.tagStr+"of"===e||r)},i.prototype._decodeTag=function(t,e,r){var n=o(t,'Failed to decode tag of "'+e+'"');if(t.isError(n))return n;var i=a(t,n.primitive,'Failed to get length of "'+e+'"');if(t.isError(i))return i;if(!r&&n.tag!==e&&n.tagStr!==e&&n.tagStr+"of"!==e)return t.error('Failed to match tag: "'+e+'"');if(n.primitive||null!==i)return t.skip(i,'Failed to match body of: "'+e+'"');var s=t.save(),f=this._skipUntilEnd(t,'Failed to skip indefinite length body: "'+this.tag+'"');return t.isError(f)?f:(i=t.offset-s.offset,t.restore(s),t.skip(i,'Failed to match body of: "'+e+'"'))},i.prototype._skipUntilEnd=function(t,e){for(;;){var r=o(t,e);if(t.isError(r))return r;var n=a(t,r.primitive,e);if(t.isError(n))return n;var i;if(i=r.primitive||null!==n?t.skip(n):this._skipUntilEnd(t,e),t.isError(i))return i;if("end"===r.tagStr)break}},i.prototype._decodeList=function(t,e,r,n){for(var i=[];!t.isEmpty();){var o=this._peekTag(t,"end");if(t.isError(o))return o;var a=r.decode(t,"der",n);if(t.isError(a)&&o)break;i.push(a)}return i},i.prototype._decodeStr=function(t,e){if("bitstr"===e){var r=t.readUInt8();return t.isError(r)?r:{unused:r,data:t.raw()}}if("bmpstr"===e){var n=t.raw();if(n.length%2==1)return t.error("Decoding of string type: bmpstr length mismatch");for(var i="",o=0;o<n.length/2;o++)i+=String.fromCharCode(n.readUInt16BE(2*o));return i}if("numstr"===e){var a=t.raw().toString("ascii");return this._isNumstr(a)?a:t.error("Decoding of string type: numstr unsupported characters")}if("octstr"===e)return t.raw();if("objDesc"===e)return t.raw();if("printstr"===e){var s=t.raw().toString("ascii");return this._isPrintstr(s)?s:t.error("Decoding of string type: printstr unsupported characters")}return/str$/.test(e)?t.raw().toString():t.error("Decoding of string type: "+e+" unsupported")},i.prototype._decodeObjid=function(t,e,r){for(var n,i=[],o=0;!t.isEmpty();){var a=t.readUInt8();o<<=7,o|=127&a,0==(128&a)&&(i.push(o),o=0)}128&a&&i.push(o);var s=i[0]/40|0,f=i[0]%40;if(n=r?i:[s,f].concat(i.slice(1)),e){var c=e[n.join(" ")];void 0===c&&(c=e[n.join(".")]),void 0!==c&&(n=c)}return n},i.prototype._decodeTime=function(t,e){var r=t.raw().toString();if("gentime"===e)var n=0|r.slice(0,4),i=0|r.slice(4,6),o=0|r.slice(6,8),a=0|r.slice(8,10),s=0|r.slice(10,12),f=0|r.slice(12,14);else{if("utctime"!==e)return t.error("Decoding "+e+" time is not supported yet");var n=0|r.slice(0,2),i=0|r.slice(2,4),o=0|r.slice(4,6),a=0|r.slice(6,8),s=0|r.slice(8,10),f=0|r.slice(10,12);n=n<70?2e3+n:1900+n}return Date.UTC(n,i-1,o,a,s,f,0)},i.prototype._decodeNull=function(t){return null},i.prototype._decodeBool=function(t){var e=t.readUInt8();return t.isError(e)?e:0!==e},i.prototype._decodeInt=function(t,e){var r=t.raw(),n=new u(r);return e&&(n=e[n.toString(10)]||n),n},i.prototype._use=function(t,e){return"function"==typeof t&&(t=t(e)),t._getDecoder("der").tree}},{2:2,427:427}],11:[function(t,e,r){var n=r;n.der=t(10),n.pem=t(12)},{10:10,12:12}],12:[function(t,e,r){function n(t){a.call(this,t),this.enc="pem"}var i=t(427),o=t(50).Buffer,a=t(10);i(n,a),e.exports=n,n.prototype.decode=function(t,e){for(var r=t.toString().split(/[\r\n]+/g),n=e.label.toUpperCase(),i=/^-----(BEGIN|END) ([^-]+)-----$/,s=-1,f=-1,c=0;c<r.length;c++){var u=r[c].match(i);if(null!==u&&u[2]===n){if(-1!==s){if("END"!==u[1])break;f=c;break}if("BEGIN"!==u[1])break;s=c}}if(-1===s||-1===f)throw new Error("PEM section not found for: "+n);var h=r.slice(s+1,f).join("");h.replace(/[^a-z0-9\+\/=]+/gi,"");var d=new o(h,"base64");return a.prototype.decode.call(this,d,e)}},{10:10,427:427,50:50}],13:[function(t,e,r){function n(t){this.enc="der",this.name=t.name,this.entity=t,this.tree=new i,this.tree._init(t.body)}function i(t){u.Node.call(this,"der",t)}function o(t){return t<10?"0"+t:t}function a(t,e,r,n){var i;if("seqof"===t?t="seq":"setof"===t&&(t="set"),h.tagByName.hasOwnProperty(t))i=h.tagByName[t];else{if("number"!=typeof t||(0|t)!==t)return n.error("Unknown tag: "+t);i=t}return i>=31?n.error("Multi-octet tag encoding unsupported"):(e||(i|=32),i|=h.tagClassByName[r||"universal"]<<6)}var s=t(427),f=t(50).Buffer,c=t(2),u=c.base,h=c.constants.der;e.exports=n,n.prototype.encode=function(t,e){return this.tree._encode(t,e).join()},s(i,u.Node),i.prototype._encodeComposite=function(t,e,r,n){var i=a(t,e,r,this.reporter);if(n.length<128){var o=new f(2);return o[0]=i,o[1]=n.length,this._createEncoderBuffer([o,n])}for(var s=1,c=n.length;c>=256;c>>=8)s++;var o=new f(2+s);o[0]=i,o[1]=128|s;for(var c=1+s,u=n.length;u>0;c--,u>>=8)o[c]=255&u;return this._createEncoderBuffer([o,n])},i.prototype._encodeStr=function(t,e){if("bitstr"===e)return this._createEncoderBuffer([0|t.unused,t.data]);if("bmpstr"===e){for(var r=new f(2*t.length),n=0;n<t.length;n++)r.writeUInt16BE(t.charCodeAt(n),2*n);return this._createEncoderBuffer(r)}return"numstr"===e?this._isNumstr(t)?this._createEncoderBuffer(t):this.reporter.error("Encoding of string type: numstr supports only digits and space"):"printstr"===e?this._isPrintstr(t)?this._createEncoderBuffer(t):this.reporter.error("Encoding of string type: printstr supports only latin upper and lower case letters, digits, space, apostrophe, left and rigth parenthesis, plus sign, comma, hyphen, dot, slash, colon, equal sign, question mark"):/str$/.test(e)?this._createEncoderBuffer(t):"objDesc"===e?this._createEncoderBuffer(t):this.reporter.error("Encoding of string type: "+e+" unsupported")},i.prototype._encodeObjid=function(t,e,r){if("string"==typeof t){if(!e)return this.reporter.error("string objid given, but no values map found");if(!e.hasOwnProperty(t))return this.reporter.error("objid not found in values map");t=e[t].split(/[\s\.]+/g);for(var n=0;n<t.length;n++)t[n]|=0}else if(Array.isArray(t)){t=t.slice();for(var n=0;n<t.length;n++)t[n]|=0}if(!Array.isArray(t))return this.reporter.error("objid() should be either array or string, got: "+JSON.stringify(t));if(!r){if(t[1]>=40)return this.reporter.error("Second objid identifier OOB");t.splice(0,2,40*t[0]+t[1])}for(var i=0,n=0;n<t.length;n++){var o=t[n];for(i++;o>=128;o>>=7)i++}for(var a=new f(i),s=a.length-1,n=t.length-1;n>=0;n--){var o=t[n];for(a[s--]=127&o;(o>>=7)>0;)a[s--]=128|127&o}return this._createEncoderBuffer(a)},i.prototype._encodeTime=function(t,e){var r,n=new Date(t);return"gentime"===e?r=[o(n.getFullYear()),o(n.getUTCMonth()+1),o(n.getUTCDate()),o(n.getUTCHours()),o(n.getUTCMinutes()),o(n.getUTCSeconds()),"Z"].join(""):"utctime"===e?r=[o(n.getFullYear()%100),o(n.getUTCMonth()+1),o(n.getUTCDate()),o(n.getUTCHours()),o(n.getUTCMinutes()),o(n.getUTCSeconds()),"Z"].join(""):this.reporter.error("Encoding "+e+" time is not supported yet"),this._encodeStr(r,"octstr")},i.prototype._encodeNull=function(){return this._createEncoderBuffer("")},i.prototype._encodeInt=function(t,e){if("string"==typeof t){if(!e)return this.reporter.error("String int or enum given, but no values map");if(!e.hasOwnProperty(t))return this.reporter.error("Values map doesn't contain: "+JSON.stringify(t));t=e[t]}if("number"!=typeof t&&!f.isBuffer(t)){var r=t.toArray();!t.sign&&128&r[0]&&r.unshift(0),t=new f(r)}if(f.isBuffer(t)){var n=t.length;0===t.length&&n++;var i=new f(n);return t.copy(i),0===t.length&&(i[0]=0),this._createEncoderBuffer(i)}if(t<128)return this._createEncoderBuffer(t);if(t<256)return this._createEncoderBuffer([0,t]);for(var n=1,o=t;o>=256;o>>=8)n++;for(var i=new Array(n),o=i.length-1;o>=0;o--)i[o]=255&t,t>>=8;return 128&i[0]&&i.unshift(0),this._createEncoderBuffer(new f(i))},i.prototype._encodeBool=function(t){return this._createEncoderBuffer(t?255:0)},i.prototype._use=function(t,e){return"function"==typeof t&&(t=t(e)),t._getEncoder("der").tree},i.prototype._skipDefault=function(t,e,r){var n,i=this._baseState;if(null===i.default)return!1;var o=t.join();if(void 0===i.defaultBuffer&&(i.defaultBuffer=this._encodeValue(i.default,e,r).join()),o.length!==i.defaultBuffer.length)return!1;for(n=0;n<o.length;n++)if(o[n]!==i.defaultBuffer[n])return!1;return!0}},{2:2,427:427,50:50}],14:[function(t,e,r){var n=r;n.der=t(13),n.pem=t(15)},{13:13,15:15}],15:[function(t,e,r){function n(t){o.call(this,t),this.enc="pem"}var i=t(427),o=t(13);i(n,o),e.exports=n,n.prototype.encode=function(t,e){for(var r=o.prototype.encode.call(this,t),n=r.toString("base64"),i=["-----BEGIN "+e.label+"-----"],a=0;a<n.length;a+=64)i.push(n.slice(a,a+64));return i.push("-----END "+e.label+"-----"),i.join("\n")}},{13:13,427:427}],16:[function(t,e,r){(function(e){"use strict";function r(t,e,r){t[e]||Object[n](t,e,{writable:!0,configurable:!0,value:r})}if(t(375),t(469),t(52),e._babelPolyfill)throw new Error("only one instance of babel-polyfill is allowed");e._babelPolyfill=!0;var n="defineProperty";r(String.prototype,"padLeft","".padStart),r(String.prototype,"padRight","".padEnd),"pop,reverse,shift,keys,values,entries,indexOf,every,some,forEach,map,filter,find,findIndex,includes,join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,copyWithin,fill".split(",").forEach(function(t){[][t]&&r(Array,t,Function.call.bind([][t]))})}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{375:375,469:469,52:52}],17:[function(t,e,r){"use strict";function n(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=t.indexOf("=");return-1===r&&(r=e),[r,r===e?0:4-r%4]}function i(t){var e=n(t),r=e[0],i=e[1];return 3*(r+i)/4-i}function o(t,e,r){return 3*(e+r)/4-r}function a(t){for(var e,r=n(t),i=r[0],a=r[1],s=new d(o(t,i,a)),f=0,c=a>0?i-4:i,u=0;u<c;u+=4)e=h[t.charCodeAt(u)]<<18|h[t.charCodeAt(u+1)]<<12|h[t.charCodeAt(u+2)]<<6|h[t.charCodeAt(u+3)],s[f++]=e>>16&255,s[f++]=e>>8&255,s[f++]=255&e;return 2===a&&(e=h[t.charCodeAt(u)]<<2|h[t.charCodeAt(u+1)]>>4,s[f++]=255&e),1===a&&(e=h[t.charCodeAt(u)]<<10|h[t.charCodeAt(u+1)]<<4|h[t.charCodeAt(u+2)]>>2,s[f++]=e>>8&255,s[f++]=255&e),s}function s(t){return u[t>>18&63]+u[t>>12&63]+u[t>>6&63]+u[63&t]}function f(t,e,r){for(var n,i=[],o=e;o<r;o+=3)n=(t[o]<<16&16711680)+(t[o+1]<<8&65280)+(255&t[o+2]),i.push(s(n));return i.join("")}function c(t){for(var e,r=t.length,n=r%3,i=[],o=0,a=r-n;o<a;o+=16383)i.push(f(t,o,o+16383>a?a:o+16383));return 1===n?(e=t[r-1],i.push(u[e>>2]+u[e<<4&63]+"==")):2===n&&(e=(t[r-2]<<8)+t[r-1],i.push(u[e>>10]+u[e>>4&63]+u[e<<2&63]+"=")),i.join("")}r.byteLength=i,r.toByteArray=a,r.fromByteArray=c;for(var u=[],h=[],d="undefined"!=typeof Uint8Array?Uint8Array:Array,l="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",p=0,b=l.length;p<b;++p)u[p]=l[p],h[l.charCodeAt(p)]=p;h["-".charCodeAt(0)]=62,h["_".charCodeAt(0)]=63},{}],18:[function(t,e,r){!function(e,r){"use strict";function n(t,e){if(!t)throw new Error(e||"Assertion failed")}function i(t,e){t.super_=e;var r=function(){};r.prototype=e.prototype,t.prototype=new r,t.prototype.constructor=t}function o(t,e,r){if(o.isBN(t))return t;this.negative=0,this.words=null,this.length=0,this.red=null,null!==t&&("le"!==e&&"be"!==e||(r=e,e=10),this._init(t||0,e||10,r||"be"))}function a(t,e,r){for(var n=0,i=Math.min(t.length,r),o=e;o<i;o++){var a=t.charCodeAt(o)-48;n<<=4,n|=a>=49&&a<=54?a-49+10:a>=17&&a<=22?a-17+10:15&a}return n}function s(t,e,r,n){for(var i=0,o=Math.min(t.length,r),a=e;a<o;a++){var s=t.charCodeAt(a)-48;i*=n,i+=s>=49?s-49+10:s>=17?s-17+10:s}return i}function f(t){for(var e=new Array(t.bitLength()),r=0;r<e.length;r++){var n=r/26|0,i=r%26;e[r]=(t.words[n]&1<<i)>>>i}return e}function c(t,e,r){r.negative=e.negative^t.negative;var n=t.length+e.length|0;r.length=n,n=n-1|0;var i=0|t.words[0],o=0|e.words[0],a=i*o,s=67108863&a,f=a/67108864|0;r.words[0]=s;for(var c=1;c<n;c++){for(var u=f>>>26,h=67108863&f,d=Math.min(c,e.length-1),l=Math.max(0,c-t.length+1);l<=d;l++){var p=c-l|0;i=0|t.words[p],o=0|e.words[l],a=i*o+h,u+=a/67108864|0,h=67108863&a}r.words[c]=0|h,f=0|u}return 0!==f?r.words[c]=0|f:r.length--,r.strip()}function u(t,e,r){r.negative=e.negative^t.negative,r.length=t.length+e.length;for(var n=0,i=0,o=0;o<r.length-1;o++){var a=i;i=0;for(var s=67108863&n,f=Math.min(o,e.length-1),c=Math.max(0,o-t.length+1);c<=f;c++){var u=o-c,h=0|t.words[u],d=0|e.words[c],l=h*d,p=67108863&l;a=a+(l/67108864|0)|0,p=p+s|0,s=67108863&p,a=a+(p>>>26)|0,i+=a>>>26,a&=67108863}r.words[o]=s,n=a,a=i}return 0!==n?r.words[o]=n:r.length--,r.strip()}function h(t,e,r){return(new d).mulp(t,e,r)}function d(t,e){this.x=t,this.y=e}function l(t,e){this.name=t,this.p=new o(e,16),this.n=this.p.bitLength(),this.k=new o(1).iushln(this.n).isub(this.p),this.tmp=this._tmp()}function p(){l.call(this,"k256","ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f")}function b(){l.call(this,"p224","ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001")}function v(){l.call(this,"p192","ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff")}function y(){l.call(this,"25519","7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed")}function g(t){if("string"==typeof t){var e=o._prime(t);this.m=e.p,this.prime=e}else n(t.gtn(1),"modulus must be greater than 1"),this.m=t,this.prime=null}function m(t){g.call(this,t),this.shift=this.m.bitLength(),this.shift%26!=0&&(this.shift+=26-this.shift%26),this.r=new o(1).iushln(this.shift),this.r2=this.imod(this.r.sqr()),this.rinv=this.r._invmp(this.m),this.minv=this.rinv.mul(this.r).isubn(1).div(this.m),this.minv=this.minv.umod(this.r),this.minv=this.r.sub(this.minv)}"object"==typeof e?e.exports=o:r.BN=o,o.BN=o,o.wordSize=26;var w;try{w=t(20).Buffer}catch(t){}o.isBN=function(t){return t instanceof o||null!==t&&"object"==typeof t&&t.constructor.wordSize===o.wordSize&&Array.isArray(t.words)},o.max=function(t,e){return t.cmp(e)>0?t:e},o.min=function(t,e){return t.cmp(e)<0?t:e},o.prototype._init=function(t,e,r){if("number"==typeof t)return this._initNumber(t,e,r);if("object"==typeof t)return this._initArray(t,e,r);"hex"===e&&(e=16),n(e===(0|e)&&e>=2&&e<=36),t=t.toString().replace(/\s+/g,"");var i=0;"-"===t[0]&&i++,16===e?this._parseHex(t,i):this._parseBase(t,e,i),"-"===t[0]&&(this.negative=1),this.strip(),"le"===r&&this._initArray(this.toArray(),e,r)},o.prototype._initNumber=function(t,e,r){t<0&&(this.negative=1,t=-t),t<67108864?(this.words=[67108863&t],this.length=1):t<4503599627370496?(this.words=[67108863&t,t/67108864&67108863],this.length=2):(n(t<9007199254740992),this.words=[67108863&t,t/67108864&67108863,1],this.length=3),"le"===r&&this._initArray(this.toArray(),e,r)},o.prototype._initArray=function(t,e,r){if(n("number"==typeof t.length),t.length<=0)return this.words=[0],this.length=1,this;this.length=Math.ceil(t.length/3),this.words=new Array(this.length);for(var i=0;i<this.length;i++)this.words[i]=0;var o,a,s=0;if("be"===r)for(i=t.length-1,o=0;i>=0;i-=3)a=t[i]|t[i-1]<<8|t[i-2]<<16,this.words[o]|=a<<s&67108863,this.words[o+1]=a>>>26-s&67108863,(s+=24)>=26&&(s-=26,o++);else if("le"===r)for(i=0,o=0;i<t.length;i+=3)a=t[i]|t[i+1]<<8|t[i+2]<<16,this.words[o]|=a<<s&67108863,this.words[o+1]=a>>>26-s&67108863,(s+=24)>=26&&(s-=26,o++);return this.strip()},o.prototype._parseHex=function(t,e){this.length=Math.ceil((t.length-e)/6),this.words=new Array(this.length);for(var r=0;r<this.length;r++)this.words[r]=0;var n,i,o=0;for(r=t.length-6,n=0;r>=e;r-=6)i=a(t,r,r+6),this.words[n]|=i<<o&67108863,this.words[n+1]|=i>>>26-o&4194303,(o+=24)>=26&&(o-=26,n++);r+6!==e&&(i=a(t,e,r+6),this.words[n]|=i<<o&67108863,this.words[n+1]|=i>>>26-o&4194303),this.strip()},o.prototype._parseBase=function(t,e,r){this.words=[0],this.length=1;for(var n=0,i=1;i<=67108863;i*=e)n++;n--,i=i/e|0;for(var o=t.length-r,a=o%n,f=Math.min(o,o-a)+r,c=0,u=r;u<f;u+=n)c=s(t,u,u+n,e),this.imuln(i),this.words[0]+c<67108864?this.words[0]+=c:this._iaddn(c);if(0!==a){var h=1
;for(c=s(t,u,t.length,e),u=0;u<a;u++)h*=e;this.imuln(h),this.words[0]+c<67108864?this.words[0]+=c:this._iaddn(c)}},o.prototype.copy=function(t){t.words=new Array(this.length);for(var e=0;e<this.length;e++)t.words[e]=this.words[e];t.length=this.length,t.negative=this.negative,t.red=this.red},o.prototype.clone=function(){var t=new o(null);return this.copy(t),t},o.prototype._expand=function(t){for(;this.length<t;)this.words[this.length++]=0;return this},o.prototype.strip=function(){for(;this.length>1&&0===this.words[this.length-1];)this.length--;return this._normSign()},o.prototype._normSign=function(){return 1===this.length&&0===this.words[0]&&(this.negative=0),this},o.prototype.inspect=function(){return(this.red?"<BN-R: ":"<BN: ")+this.toString(16)+">"};var _=["","0","00","000","0000","00000","000000","0000000","00000000","000000000","0000000000","00000000000","000000000000","0000000000000","00000000000000","000000000000000","0000000000000000","00000000000000000","000000000000000000","0000000000000000000","00000000000000000000","000000000000000000000","0000000000000000000000","00000000000000000000000","000000000000000000000000","0000000000000000000000000"],S=[0,0,25,16,12,11,10,9,8,8,7,7,7,7,6,6,6,6,6,6,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],E=[0,0,33554432,43046721,16777216,48828125,60466176,40353607,16777216,43046721,1e7,19487171,35831808,62748517,7529536,11390625,16777216,24137569,34012224,47045881,64e6,4084101,5153632,6436343,7962624,9765625,11881376,14348907,17210368,20511149,243e5,28629151,33554432,39135393,45435424,52521875,60466176];o.prototype.toString=function(t,e){t=t||10,e=0|e||1;var r;if(16===t||"hex"===t){r="";for(var i=0,o=0,a=0;a<this.length;a++){var s=this.words[a],f=(16777215&(s<<i|o)).toString(16);o=s>>>24-i&16777215,r=0!==o||a!==this.length-1?_[6-f.length]+f+r:f+r,i+=2,i>=26&&(i-=26,a--)}for(0!==o&&(r=o.toString(16)+r);r.length%e!=0;)r="0"+r;return 0!==this.negative&&(r="-"+r),r}if(t===(0|t)&&t>=2&&t<=36){var c=S[t],u=E[t];r="";var h=this.clone();for(h.negative=0;!h.isZero();){var d=h.modn(u).toString(t);h=h.idivn(u),r=h.isZero()?d+r:_[c-d.length]+d+r}for(this.isZero()&&(r="0"+r);r.length%e!=0;)r="0"+r;return 0!==this.negative&&(r="-"+r),r}n(!1,"Base should be between 2 and 36")},o.prototype.toNumber=function(){var t=this.words[0];return 2===this.length?t+=67108864*this.words[1]:3===this.length&&1===this.words[2]?t+=4503599627370496+67108864*this.words[1]:this.length>2&&n(!1,"Number can only safely store up to 53 bits"),0!==this.negative?-t:t},o.prototype.toJSON=function(){return this.toString(16)},o.prototype.toBuffer=function(t,e){return n(void 0!==w),this.toArrayLike(w,t,e)},o.prototype.toArray=function(t,e){return this.toArrayLike(Array,t,e)},o.prototype.toArrayLike=function(t,e,r){var i=this.byteLength(),o=r||Math.max(1,i);n(i<=o,"byte array longer than desired length"),n(o>0,"Requested array length <= 0"),this.strip();var a,s,f="le"===e,c=new t(o),u=this.clone();if(f){for(s=0;!u.isZero();s++)a=u.andln(255),u.iushrn(8),c[s]=a;for(;s<o;s++)c[s]=0}else{for(s=0;s<o-i;s++)c[s]=0;for(s=0;!u.isZero();s++)a=u.andln(255),u.iushrn(8),c[o-s-1]=a}return c},Math.clz32?o.prototype._countBits=function(t){return 32-Math.clz32(t)}:o.prototype._countBits=function(t){var e=t,r=0;return e>=4096&&(r+=13,e>>>=13),e>=64&&(r+=7,e>>>=7),e>=8&&(r+=4,e>>>=4),e>=2&&(r+=2,e>>>=2),r+e},o.prototype._zeroBits=function(t){if(0===t)return 26;var e=t,r=0;return 0==(8191&e)&&(r+=13,e>>>=13),0==(127&e)&&(r+=7,e>>>=7),0==(15&e)&&(r+=4,e>>>=4),0==(3&e)&&(r+=2,e>>>=2),0==(1&e)&&r++,r},o.prototype.bitLength=function(){var t=this.words[this.length-1],e=this._countBits(t);return 26*(this.length-1)+e},o.prototype.zeroBits=function(){if(this.isZero())return 0;for(var t=0,e=0;e<this.length;e++){var r=this._zeroBits(this.words[e]);if(t+=r,26!==r)break}return t},o.prototype.byteLength=function(){return Math.ceil(this.bitLength()/8)},o.prototype.toTwos=function(t){return 0!==this.negative?this.abs().inotn(t).iaddn(1):this.clone()},o.prototype.fromTwos=function(t){return this.testn(t-1)?this.notn(t).iaddn(1).ineg():this.clone()},o.prototype.isNeg=function(){return 0!==this.negative},o.prototype.neg=function(){return this.clone().ineg()},o.prototype.ineg=function(){return this.isZero()||(this.negative^=1),this},o.prototype.iuor=function(t){for(;this.length<t.length;)this.words[this.length++]=0;for(var e=0;e<t.length;e++)this.words[e]=this.words[e]|t.words[e];return this.strip()},o.prototype.ior=function(t){return n(0==(this.negative|t.negative)),this.iuor(t)},o.prototype.or=function(t){return this.length>t.length?this.clone().ior(t):t.clone().ior(this)},o.prototype.uor=function(t){return this.length>t.length?this.clone().iuor(t):t.clone().iuor(this)},o.prototype.iuand=function(t){var e;e=this.length>t.length?t:this;for(var r=0;r<e.length;r++)this.words[r]=this.words[r]&t.words[r];return this.length=e.length,this.strip()},o.prototype.iand=function(t){return n(0==(this.negative|t.negative)),this.iuand(t)},o.prototype.and=function(t){return this.length>t.length?this.clone().iand(t):t.clone().iand(this)},o.prototype.uand=function(t){return this.length>t.length?this.clone().iuand(t):t.clone().iuand(this)},o.prototype.iuxor=function(t){var e,r;this.length>t.length?(e=this,r=t):(e=t,r=this);for(var n=0;n<r.length;n++)this.words[n]=e.words[n]^r.words[n];if(this!==e)for(;n<e.length;n++)this.words[n]=e.words[n];return this.length=e.length,this.strip()},o.prototype.ixor=function(t){return n(0==(this.negative|t.negative)),this.iuxor(t)},o.prototype.xor=function(t){return this.length>t.length?this.clone().ixor(t):t.clone().ixor(this)},o.prototype.uxor=function(t){return this.length>t.length?this.clone().iuxor(t):t.clone().iuxor(this)},o.prototype.inotn=function(t){n("number"==typeof t&&t>=0);var e=0|Math.ceil(t/26),r=t%26;this._expand(e),r>0&&e--;for(var i=0;i<e;i++)this.words[i]=67108863&~this.words[i];return r>0&&(this.words[i]=~this.words[i]&67108863>>26-r),this.strip()},o.prototype.notn=function(t){return this.clone().inotn(t)},o.prototype.setn=function(t,e){n("number"==typeof t&&t>=0);var r=t/26|0,i=t%26;return this._expand(r+1),this.words[r]=e?this.words[r]|1<<i:this.words[r]&~(1<<i),this.strip()},o.prototype.iadd=function(t){var e;if(0!==this.negative&&0===t.negative)return this.negative=0,e=this.isub(t),this.negative^=1,this._normSign();if(0===this.negative&&0!==t.negative)return t.negative=0,e=this.isub(t),t.negative=1,e._normSign();var r,n;this.length>t.length?(r=this,n=t):(r=t,n=this);for(var i=0,o=0;o<n.length;o++)e=(0|r.words[o])+(0|n.words[o])+i,this.words[o]=67108863&e,i=e>>>26;for(;0!==i&&o<r.length;o++)e=(0|r.words[o])+i,this.words[o]=67108863&e,i=e>>>26;if(this.length=r.length,0!==i)this.words[this.length]=i,this.length++;else if(r!==this)for(;o<r.length;o++)this.words[o]=r.words[o];return this},o.prototype.add=function(t){var e;return 0!==t.negative&&0===this.negative?(t.negative=0,e=this.sub(t),t.negative^=1,e):0===t.negative&&0!==this.negative?(this.negative=0,e=t.sub(this),this.negative=1,e):this.length>t.length?this.clone().iadd(t):t.clone().iadd(this)},o.prototype.isub=function(t){if(0!==t.negative){t.negative=0;var e=this.iadd(t);return t.negative=1,e._normSign()}if(0!==this.negative)return this.negative=0,this.iadd(t),this.negative=1,this._normSign();var r=this.cmp(t);if(0===r)return this.negative=0,this.length=1,this.words[0]=0,this;var n,i;r>0?(n=this,i=t):(n=t,i=this);for(var o=0,a=0;a<i.length;a++)e=(0|n.words[a])-(0|i.words[a])+o,o=e>>26,this.words[a]=67108863&e;for(;0!==o&&a<n.length;a++)e=(0|n.words[a])+o,o=e>>26,this.words[a]=67108863&e;if(0===o&&a<n.length&&n!==this)for(;a<n.length;a++)this.words[a]=n.words[a];return this.length=Math.max(this.length,a),n!==this&&(this.negative=1),this.strip()},o.prototype.sub=function(t){return this.clone().isub(t)};var k=function(t,e,r){var n,i,o,a=t.words,s=e.words,f=r.words,c=0,u=0|a[0],h=8191&u,d=u>>>13,l=0|a[1],p=8191&l,b=l>>>13,v=0|a[2],y=8191&v,g=v>>>13,m=0|a[3],w=8191&m,_=m>>>13,S=0|a[4],E=8191&S,k=S>>>13,M=0|a[5],A=8191&M,x=M>>>13,I=0|a[6],R=8191&I,B=I>>>13,T=0|a[7],P=8191&T,C=T>>>13,O=0|a[8],j=8191&O,N=O>>>13,L=0|a[9],D=8191&L,F=L>>>13,U=0|s[0],q=8191&U,z=U>>>13,V=0|s[1],G=8191&V,K=V>>>13,W=0|s[2],H=8191&W,X=W>>>13,J=0|s[3],Y=8191&J,Z=J>>>13,Q=0|s[4],$=8191&Q,tt=Q>>>13,et=0|s[5],rt=8191&et,nt=et>>>13,it=0|s[6],ot=8191&it,at=it>>>13,st=0|s[7],ft=8191&st,ct=st>>>13,ut=0|s[8],ht=8191&ut,dt=ut>>>13,lt=0|s[9],pt=8191&lt,bt=lt>>>13;r.negative=t.negative^e.negative,r.length=19,n=Math.imul(h,q),i=Math.imul(h,z),i=i+Math.imul(d,q)|0,o=Math.imul(d,z);var vt=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(vt>>>26)|0,vt&=67108863,n=Math.imul(p,q),i=Math.imul(p,z),i=i+Math.imul(b,q)|0,o=Math.imul(b,z),n=n+Math.imul(h,G)|0,i=i+Math.imul(h,K)|0,i=i+Math.imul(d,G)|0,o=o+Math.imul(d,K)|0;var yt=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(yt>>>26)|0,yt&=67108863,n=Math.imul(y,q),i=Math.imul(y,z),i=i+Math.imul(g,q)|0,o=Math.imul(g,z),n=n+Math.imul(p,G)|0,i=i+Math.imul(p,K)|0,i=i+Math.imul(b,G)|0,o=o+Math.imul(b,K)|0,n=n+Math.imul(h,H)|0,i=i+Math.imul(h,X)|0,i=i+Math.imul(d,H)|0,o=o+Math.imul(d,X)|0;var gt=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(gt>>>26)|0,gt&=67108863,n=Math.imul(w,q),i=Math.imul(w,z),i=i+Math.imul(_,q)|0,o=Math.imul(_,z),n=n+Math.imul(y,G)|0,i=i+Math.imul(y,K)|0,i=i+Math.imul(g,G)|0,o=o+Math.imul(g,K)|0,n=n+Math.imul(p,H)|0,i=i+Math.imul(p,X)|0,i=i+Math.imul(b,H)|0,o=o+Math.imul(b,X)|0,n=n+Math.imul(h,Y)|0,i=i+Math.imul(h,Z)|0,i=i+Math.imul(d,Y)|0,o=o+Math.imul(d,Z)|0;var mt=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(mt>>>26)|0,mt&=67108863,n=Math.imul(E,q),i=Math.imul(E,z),i=i+Math.imul(k,q)|0,o=Math.imul(k,z),n=n+Math.imul(w,G)|0,i=i+Math.imul(w,K)|0,i=i+Math.imul(_,G)|0,o=o+Math.imul(_,K)|0,n=n+Math.imul(y,H)|0,i=i+Math.imul(y,X)|0,i=i+Math.imul(g,H)|0,o=o+Math.imul(g,X)|0,n=n+Math.imul(p,Y)|0,i=i+Math.imul(p,Z)|0,i=i+Math.imul(b,Y)|0,o=o+Math.imul(b,Z)|0,n=n+Math.imul(h,$)|0,i=i+Math.imul(h,tt)|0,i=i+Math.imul(d,$)|0,o=o+Math.imul(d,tt)|0;var wt=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(wt>>>26)|0,wt&=67108863,n=Math.imul(A,q),i=Math.imul(A,z),i=i+Math.imul(x,q)|0,o=Math.imul(x,z),n=n+Math.imul(E,G)|0,i=i+Math.imul(E,K)|0,i=i+Math.imul(k,G)|0,o=o+Math.imul(k,K)|0,n=n+Math.imul(w,H)|0,i=i+Math.imul(w,X)|0,i=i+Math.imul(_,H)|0,o=o+Math.imul(_,X)|0,n=n+Math.imul(y,Y)|0,i=i+Math.imul(y,Z)|0,i=i+Math.imul(g,Y)|0,o=o+Math.imul(g,Z)|0,n=n+Math.imul(p,$)|0,i=i+Math.imul(p,tt)|0,i=i+Math.imul(b,$)|0,o=o+Math.imul(b,tt)|0,n=n+Math.imul(h,rt)|0,i=i+Math.imul(h,nt)|0,i=i+Math.imul(d,rt)|0,o=o+Math.imul(d,nt)|0;var _t=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(_t>>>26)|0,_t&=67108863,n=Math.imul(R,q),i=Math.imul(R,z),i=i+Math.imul(B,q)|0,o=Math.imul(B,z),n=n+Math.imul(A,G)|0,i=i+Math.imul(A,K)|0,i=i+Math.imul(x,G)|0,o=o+Math.imul(x,K)|0,n=n+Math.imul(E,H)|0,i=i+Math.imul(E,X)|0,i=i+Math.imul(k,H)|0,o=o+Math.imul(k,X)|0,n=n+Math.imul(w,Y)|0,i=i+Math.imul(w,Z)|0,i=i+Math.imul(_,Y)|0,o=o+Math.imul(_,Z)|0,n=n+Math.imul(y,$)|0,i=i+Math.imul(y,tt)|0,i=i+Math.imul(g,$)|0,o=o+Math.imul(g,tt)|0,n=n+Math.imul(p,rt)|0,i=i+Math.imul(p,nt)|0,i=i+Math.imul(b,rt)|0,o=o+Math.imul(b,nt)|0,n=n+Math.imul(h,ot)|0,i=i+Math.imul(h,at)|0,i=i+Math.imul(d,ot)|0,o=o+Math.imul(d,at)|0;var St=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(St>>>26)|0,St&=67108863,n=Math.imul(P,q),i=Math.imul(P,z),i=i+Math.imul(C,q)|0,o=Math.imul(C,z),n=n+Math.imul(R,G)|0,i=i+Math.imul(R,K)|0,i=i+Math.imul(B,G)|0,o=o+Math.imul(B,K)|0,n=n+Math.imul(A,H)|0,i=i+Math.imul(A,X)|0,i=i+Math.imul(x,H)|0,o=o+Math.imul(x,X)|0,n=n+Math.imul(E,Y)|0,i=i+Math.imul(E,Z)|0,i=i+Math.imul(k,Y)|0,o=o+Math.imul(k,Z)|0,n=n+Math.imul(w,$)|0,i=i+Math.imul(w,tt)|0,i=i+Math.imul(_,$)|0,o=o+Math.imul(_,tt)|0,n=n+Math.imul(y,rt)|0,i=i+Math.imul(y,nt)|0,i=i+Math.imul(g,rt)|0,o=o+Math.imul(g,nt)|0,n=n+Math.imul(p,ot)|0,i=i+Math.imul(p,at)|0,i=i+Math.imul(b,ot)|0,o=o+Math.imul(b,at)|0,n=n+Math.imul(h,ft)|0,i=i+Math.imul(h,ct)|0,i=i+Math.imul(d,ft)|0,o=o+Math.imul(d,ct)|0;var Et=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(Et>>>26)|0,Et&=67108863,n=Math.imul(j,q),i=Math.imul(j,z),i=i+Math.imul(N,q)|0,o=Math.imul(N,z),n=n+Math.imul(P,G)|0,i=i+Math.imul(P,K)|0,i=i+Math.imul(C,G)|0,o=o+Math.imul(C,K)|0,n=n+Math.imul(R,H)|0,i=i+Math.imul(R,X)|0,i=i+Math.imul(B,H)|0,o=o+Math.imul(B,X)|0,n=n+Math.imul(A,Y)|0,i=i+Math.imul(A,Z)|0,i=i+Math.imul(x,Y)|0,o=o+Math.imul(x,Z)|0,n=n+Math.imul(E,$)|0,i=i+Math.imul(E,tt)|0,i=i+Math.imul(k,$)|0,o=o+Math.imul(k,tt)|0,n=n+Math.imul(w,rt)|0,i=i+Math.imul(w,nt)|0,i=i+Math.imul(_,rt)|0,o=o+Math.imul(_,nt)|0,n=n+Math.imul(y,ot)|0,i=i+Math.imul(y,at)|0,i=i+Math.imul(g,ot)|0,o=o+Math.imul(g,at)|0,n=n+Math.imul(p,ft)|0,i=i+Math.imul(p,ct)|0,i=i+Math.imul(b,ft)|0,o=o+Math.imul(b,ct)|0,n=n+Math.imul(h,ht)|0,i=i+Math.imul(h,dt)|0,i=i+Math.imul(d,ht)|0,o=o+Math.imul(d,dt)|0;var kt=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(kt>>>26)|0,kt&=67108863,n=Math.imul(D,q),i=Math.imul(D,z),i=i+Math.imul(F,q)|0,o=Math.imul(F,z),n=n+Math.imul(j,G)|0,i=i+Math.imul(j,K)|0,i=i+Math.imul(N,G)|0,o=o+Math.imul(N,K)|0,n=n+Math.imul(P,H)|0,i=i+Math.imul(P,X)|0,i=i+Math.imul(C,H)|0,o=o+Math.imul(C,X)|0,n=n+Math.imul(R,Y)|0,i=i+Math.imul(R,Z)|0,i=i+Math.imul(B,Y)|0,o=o+Math.imul(B,Z)|0,n=n+Math.imul(A,$)|0,i=i+Math.imul(A,tt)|0,i=i+Math.imul(x,$)|0,o=o+Math.imul(x,tt)|0,n=n+Math.imul(E,rt)|0,i=i+Math.imul(E,nt)|0,i=i+Math.imul(k,rt)|0,o=o+Math.imul(k,nt)|0,n=n+Math.imul(w,ot)|0,i=i+Math.imul(w,at)|0,i=i+Math.imul(_,ot)|0,o=o+Math.imul(_,at)|0,n=n+Math.imul(y,ft)|0,i=i+Math.imul(y,ct)|0,i=i+Math.imul(g,ft)|0,o=o+Math.imul(g,ct)|0,n=n+Math.imul(p,ht)|0,i=i+Math.imul(p,dt)|0,i=i+Math.imul(b,ht)|0,o=o+Math.imul(b,dt)|0,n=n+Math.imul(h,pt)|0,i=i+Math.imul(h,bt)|0,i=i+Math.imul(d,pt)|0,o=o+Math.imul(d,bt)|0;var Mt=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(Mt>>>26)|0,Mt&=67108863,n=Math.imul(D,G),i=Math.imul(D,K),i=i+Math.imul(F,G)|0,o=Math.imul(F,K),n=n+Math.imul(j,H)|0,i=i+Math.imul(j,X)|0,i=i+Math.imul(N,H)|0,o=o+Math.imul(N,X)|0,n=n+Math.imul(P,Y)|0,i=i+Math.imul(P,Z)|0,i=i+Math.imul(C,Y)|0,o=o+Math.imul(C,Z)|0,n=n+Math.imul(R,$)|0,i=i+Math.imul(R,tt)|0,i=i+Math.imul(B,$)|0,o=o+Math.imul(B,tt)|0,n=n+Math.imul(A,rt)|0,i=i+Math.imul(A,nt)|0,i=i+Math.imul(x,rt)|0,o=o+Math.imul(x,nt)|0,n=n+Math.imul(E,ot)|0,i=i+Math.imul(E,at)|0,i=i+Math.imul(k,ot)|0,o=o+Math.imul(k,at)|0,n=n+Math.imul(w,ft)|0,i=i+Math.imul(w,ct)|0,i=i+Math.imul(_,ft)|0,o=o+Math.imul(_,ct)|0,n=n+Math.imul(y,ht)|0,i=i+Math.imul(y,dt)|0,i=i+Math.imul(g,ht)|0,o=o+Math.imul(g,dt)|0,n=n+Math.imul(p,pt)|0,i=i+Math.imul(p,bt)|0,i=i+Math.imul(b,pt)|0,o=o+Math.imul(b,bt)|0;var At=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(At>>>26)|0,At&=67108863,n=Math.imul(D,H),i=Math.imul(D,X),i=i+Math.imul(F,H)|0,o=Math.imul(F,X),n=n+Math.imul(j,Y)|0,i=i+Math.imul(j,Z)|0,i=i+Math.imul(N,Y)|0,o=o+Math.imul(N,Z)|0,n=n+Math.imul(P,$)|0,i=i+Math.imul(P,tt)|0,i=i+Math.imul(C,$)|0,o=o+Math.imul(C,tt)|0,n=n+Math.imul(R,rt)|0,i=i+Math.imul(R,nt)|0,i=i+Math.imul(B,rt)|0,o=o+Math.imul(B,nt)|0,n=n+Math.imul(A,ot)|0,i=i+Math.imul(A,at)|0,i=i+Math.imul(x,ot)|0,o=o+Math.imul(x,at)|0,n=n+Math.imul(E,ft)|0,i=i+Math.imul(E,ct)|0,i=i+Math.imul(k,ft)|0,o=o+Math.imul(k,ct)|0,n=n+Math.imul(w,ht)|0,i=i+Math.imul(w,dt)|0,i=i+Math.imul(_,ht)|0,o=o+Math.imul(_,dt)|0,n=n+Math.imul(y,pt)|0,i=i+Math.imul(y,bt)|0,i=i+Math.imul(g,pt)|0,o=o+Math.imul(g,bt)|0;var xt=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(xt>>>26)|0,xt&=67108863,n=Math.imul(D,Y),i=Math.imul(D,Z),i=i+Math.imul(F,Y)|0,o=Math.imul(F,Z),n=n+Math.imul(j,$)|0,i=i+Math.imul(j,tt)|0,i=i+Math.imul(N,$)|0,o=o+Math.imul(N,tt)|0,n=n+Math.imul(P,rt)|0,i=i+Math.imul(P,nt)|0,i=i+Math.imul(C,rt)|0,o=o+Math.imul(C,nt)|0,n=n+Math.imul(R,ot)|0,i=i+Math.imul(R,at)|0,i=i+Math.imul(B,ot)|0,o=o+Math.imul(B,at)|0,n=n+Math.imul(A,ft)|0,i=i+Math.imul(A,ct)|0,i=i+Math.imul(x,ft)|0,o=o+Math.imul(x,ct)|0,n=n+Math.imul(E,ht)|0,i=i+Math.imul(E,dt)|0,i=i+Math.imul(k,ht)|0,o=o+Math.imul(k,dt)|0,n=n+Math.imul(w,pt)|0,i=i+Math.imul(w,bt)|0,i=i+Math.imul(_,pt)|0,o=o+Math.imul(_,bt)|0;var It=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(It>>>26)|0,It&=67108863,n=Math.imul(D,$),i=Math.imul(D,tt),i=i+Math.imul(F,$)|0,o=Math.imul(F,tt),n=n+Math.imul(j,rt)|0,i=i+Math.imul(j,nt)|0,i=i+Math.imul(N,rt)|0,o=o+Math.imul(N,nt)|0,n=n+Math.imul(P,ot)|0,i=i+Math.imul(P,at)|0,i=i+Math.imul(C,ot)|0,o=o+Math.imul(C,at)|0,n=n+Math.imul(R,ft)|0,i=i+Math.imul(R,ct)|0,i=i+Math.imul(B,ft)|0,o=o+Math.imul(B,ct)|0,n=n+Math.imul(A,ht)|0,i=i+Math.imul(A,dt)|0,i=i+Math.imul(x,ht)|0,o=o+Math.imul(x,dt)|0,n=n+Math.imul(E,pt)|0,i=i+Math.imul(E,bt)|0,i=i+Math.imul(k,pt)|0,o=o+Math.imul(k,bt)|0;var Rt=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(Rt>>>26)|0,Rt&=67108863,n=Math.imul(D,rt),i=Math.imul(D,nt),i=i+Math.imul(F,rt)|0,o=Math.imul(F,nt),n=n+Math.imul(j,ot)|0,i=i+Math.imul(j,at)|0,i=i+Math.imul(N,ot)|0,o=o+Math.imul(N,at)|0,n=n+Math.imul(P,ft)|0,i=i+Math.imul(P,ct)|0,i=i+Math.imul(C,ft)|0,o=o+Math.imul(C,ct)|0,n=n+Math.imul(R,ht)|0,i=i+Math.imul(R,dt)|0,i=i+Math.imul(B,ht)|0,o=o+Math.imul(B,dt)|0,n=n+Math.imul(A,pt)|0,i=i+Math.imul(A,bt)|0,i=i+Math.imul(x,pt)|0,o=o+Math.imul(x,bt)|0;var Bt=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(Bt>>>26)|0,Bt&=67108863,n=Math.imul(D,ot),i=Math.imul(D,at),i=i+Math.imul(F,ot)|0,o=Math.imul(F,at),n=n+Math.imul(j,ft)|0,i=i+Math.imul(j,ct)|0,i=i+Math.imul(N,ft)|0,o=o+Math.imul(N,ct)|0,n=n+Math.imul(P,ht)|0,i=i+Math.imul(P,dt)|0,i=i+Math.imul(C,ht)|0,o=o+Math.imul(C,dt)|0,n=n+Math.imul(R,pt)|0,i=i+Math.imul(R,bt)|0,i=i+Math.imul(B,pt)|0,o=o+Math.imul(B,bt)|0;var Tt=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(Tt>>>26)|0,Tt&=67108863,n=Math.imul(D,ft),i=Math.imul(D,ct),i=i+Math.imul(F,ft)|0,o=Math.imul(F,ct),n=n+Math.imul(j,ht)|0,i=i+Math.imul(j,dt)|0,i=i+Math.imul(N,ht)|0,o=o+Math.imul(N,dt)|0,n=n+Math.imul(P,pt)|0,i=i+Math.imul(P,bt)|0,i=i+Math.imul(C,pt)|0,o=o+Math.imul(C,bt)|0;var Pt=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(Pt>>>26)|0,Pt&=67108863,n=Math.imul(D,ht),i=Math.imul(D,dt),i=i+Math.imul(F,ht)|0,o=Math.imul(F,dt),n=n+Math.imul(j,pt)|0,i=i+Math.imul(j,bt)|0,i=i+Math.imul(N,pt)|0,o=o+Math.imul(N,bt)|0;var Ct=(c+n|0)+((8191&i)<<13)|0;c=(o+(i>>>13)|0)+(Ct>>>26)|0,Ct&=67108863,n=Math.imul(D,pt),i=Math.imul(D,bt),i=i+Math.imul(F,pt)|0,o=Math.imul(F,bt);var Ot=(c+n|0)+((8191&i)<<13)|0;return c=(o+(i>>>13)|0)+(Ot>>>26)|0,Ot&=67108863,f[0]=vt,f[1]=yt,f[2]=gt,f[3]=mt,f[4]=wt,f[5]=_t,f[6]=St,f[7]=Et,f[8]=kt,f[9]=Mt,f[10]=At,f[11]=xt,f[12]=It,f[13]=Rt,f[14]=Bt,f[15]=Tt,f[16]=Pt,f[17]=Ct,f[18]=Ot,0!==c&&(f[19]=c,r.length++),r};Math.imul||(k=c),o.prototype.mulTo=function(t,e){var r=this.length+t.length;return 10===this.length&&10===t.length?k(this,t,e):r<63?c(this,t,e):r<1024?u(this,t,e):h(this,t,e)},d.prototype.makeRBT=function(t){for(var e=new Array(t),r=o.prototype._countBits(t)-1,n=0;n<t;n++)e[n]=this.revBin(n,r,t);return e},d.prototype.revBin=function(t,e,r){if(0===t||t===r-1)return t;for(var n=0,i=0;i<e;i++)n|=(1&t)<<e-i-1,t>>=1;return n},d.prototype.permute=function(t,e,r,n,i,o){for(var a=0;a<o;a++)n[a]=e[t[a]],i[a]=r[t[a]]},d.prototype.transform=function(t,e,r,n,i,o){this.permute(o,t,e,r,n,i);for(var a=1;a<i;a<<=1)for(var s=a<<1,f=Math.cos(2*Math.PI/s),c=Math.sin(2*Math.PI/s),u=0;u<i;u+=s)for(var h=f,d=c,l=0;l<a;l++){var p=r[u+l],b=n[u+l],v=r[u+l+a],y=n[u+l+a],g=h*v-d*y;y=h*y+d*v,v=g,r[u+l]=p+v,n[u+l]=b+y,r[u+l+a]=p-v,n[u+l+a]=b-y,l!==s&&(g=f*h-c*d,d=f*d+c*h,h=g)}},d.prototype.guessLen13b=function(t,e){var r=1|Math.max(e,t),n=1&r,i=0;for(r=r/2|0;r;r>>>=1)i++;return 1<<i+1+n},d.prototype.conjugate=function(t,e,r){if(!(r<=1))for(var n=0;n<r/2;n++){var i=t[n];t[n]=t[r-n-1],t[r-n-1]=i,i=e[n],e[n]=-e[r-n-1],e[r-n-1]=-i}},d.prototype.normalize13b=function(t,e){for(var r=0,n=0;n<e/2;n++){var i=8192*Math.round(t[2*n+1]/e)+Math.round(t[2*n]/e)+r;t[n]=67108863&i,r=i<67108864?0:i/67108864|0}return t},d.prototype.convert13b=function(t,e,r,i){for(var o=0,a=0;a<e;a++)o+=0|t[a],r[2*a]=8191&o,o>>>=13,r[2*a+1]=8191&o,o>>>=13;for(a=2*e;a<i;++a)r[a]=0;n(0===o),n(0==(-8192&o))},d.prototype.stub=function(t){for(var e=new Array(t),r=0;r<t;r++)e[r]=0;return e},d.prototype.mulp=function(t,e,r){var n=2*this.guessLen13b(t.length,e.length),i=this.makeRBT(n),o=this.stub(n),a=new Array(n),s=new Array(n),f=new Array(n),c=new Array(n),u=new Array(n),h=new Array(n),d=r.words;d.length=n,this.convert13b(t.words,t.length,a,n),this.convert13b(e.words,e.length,c,n),this.transform(a,o,s,f,n,i),this.transform(c,o,u,h,n,i);for(var l=0;l<n;l++){var p=s[l]*u[l]-f[l]*h[l];f[l]=s[l]*h[l]+f[l]*u[l],s[l]=p}return this.conjugate(s,f,n),this.transform(s,f,d,o,n,i),this.conjugate(d,o,n),this.normalize13b(d,n),r.negative=t.negative^e.negative,r.length=t.length+e.length,r.strip()},o.prototype.mul=function(t){var e=new o(null);return e.words=new Array(this.length+t.length),this.mulTo(t,e)},o.prototype.mulf=function(t){var e=new o(null);return e.words=new Array(this.length+t.length),h(this,t,e)},o.prototype.imul=function(t){return this.clone().mulTo(t,this)},o.prototype.imuln=function(t){n("number"==typeof t),n(t<67108864);for(var e=0,r=0;r<this.length;r++){var i=(0|this.words[r])*t,o=(67108863&i)+(67108863&e);e>>=26,e+=i/67108864|0,e+=o>>>26,this.words[r]=67108863&o}return 0!==e&&(this.words[r]=e,this.length++),this},o.prototype.muln=function(t){return this.clone().imuln(t)},o.prototype.sqr=function(){return this.mul(this)},o.prototype.isqr=function(){return this.imul(this.clone())},o.prototype.pow=function(t){var e=f(t);if(0===e.length)return new o(1);for(var r=this,n=0;n<e.length&&0===e[n];n++,r=r.sqr());if(++n<e.length)for(var i=r.sqr();n<e.length;n++,i=i.sqr())0!==e[n]&&(r=r.mul(i));return r},o.prototype.iushln=function(t){n("number"==typeof t&&t>=0);var e,r=t%26,i=(t-r)/26,o=67108863>>>26-r<<26-r;if(0!==r){var a=0;for(e=0;e<this.length;e++){var s=this.words[e]&o,f=(0|this.words[e])-s<<r;this.words[e]=f|a,a=s>>>26-r}a&&(this.words[e]=a,this.length++)}if(0!==i){for(e=this.length-1;e>=0;e--)this.words[e+i]=this.words[e];for(e=0;e<i;e++)this.words[e]=0;this.length+=i}return this.strip()},o.prototype.ishln=function(t){return n(0===this.negative),this.iushln(t)},o.prototype.iushrn=function(t,e,r){n("number"==typeof t&&t>=0);var i;i=e?(e-e%26)/26:0;var o=t%26,a=Math.min((t-o)/26,this.length),s=67108863^67108863>>>o<<o,f=r;if(i-=a,i=Math.max(0,i),f){for(var c=0;c<a;c++)f.words[c]=this.words[c];f.length=a}if(0===a);else if(this.length>a)for(this.length-=a,c=0;c<this.length;c++)this.words[c]=this.words[c+a];else this.words[0]=0,this.length=1;var u=0;for(c=this.length-1;c>=0&&(0!==u||c>=i);c--){var h=0|this.words[c];this.words[c]=u<<26-o|h>>>o,u=h&s}return f&&0!==u&&(f.words[f.length++]=u),0===this.length&&(this.words[0]=0,this.length=1),this.strip()},o.prototype.ishrn=function(t,e,r){return n(0===this.negative),this.iushrn(t,e,r)},o.prototype.shln=function(t){return this.clone().ishln(t)},o.prototype.ushln=function(t){return this.clone().iushln(t)},o.prototype.shrn=function(t){return this.clone().ishrn(t)},o.prototype.ushrn=function(t){return this.clone().iushrn(t)},o.prototype.testn=function(t){n("number"==typeof t&&t>=0);var e=t%26,r=(t-e)/26,i=1<<e;return!(this.length<=r)&&!!(this.words[r]&i)},o.prototype.imaskn=function(t){n("number"==typeof t&&t>=0);var e=t%26,r=(t-e)/26;if(n(0===this.negative,"imaskn works only with positive numbers"),this.length<=r)return this;if(0!==e&&r++,this.length=Math.min(r,this.length),0!==e){var i=67108863^67108863>>>e<<e;this.words[this.length-1]&=i}return this.strip()},o.prototype.maskn=function(t){return this.clone().imaskn(t)},o.prototype.iaddn=function(t){return n("number"==typeof t),n(t<67108864),t<0?this.isubn(-t):0!==this.negative?1===this.length&&(0|this.words[0])<t?(this.words[0]=t-(0|this.words[0]),this.negative=0,this):(this.negative=0,this.isubn(t),this.negative=1,this):this._iaddn(t)},o.prototype._iaddn=function(t){this.words[0]+=t;for(var e=0;e<this.length&&this.words[e]>=67108864;e++)this.words[e]-=67108864,e===this.length-1?this.words[e+1]=1:this.words[e+1]++;return this.length=Math.max(this.length,e+1),this},o.prototype.isubn=function(t){if(n("number"==typeof t),n(t<67108864),t<0)return this.iaddn(-t);if(0!==this.negative)return this.negative=0,this.iaddn(t),this.negative=1,this;if(this.words[0]-=t,1===this.length&&this.words[0]<0)this.words[0]=-this.words[0],this.negative=1;else for(var e=0;e<this.length&&this.words[e]<0;e++)this.words[e]+=67108864,this.words[e+1]-=1;return this.strip()},o.prototype.addn=function(t){return this.clone().iaddn(t)},o.prototype.subn=function(t){return this.clone().isubn(t)},o.prototype.iabs=function(){return this.negative=0,this},o.prototype.abs=function(){return this.clone().iabs()},o.prototype._ishlnsubmul=function(t,e,r){var i,o=t.length+r;this._expand(o);var a,s=0;for(i=0;i<t.length;i++){a=(0|this.words[i+r])+s;var f=(0|t.words[i])*e;a-=67108863&f,s=(a>>26)-(f/67108864|0),this.words[i+r]=67108863&a}for(;i<this.length-r;i++)a=(0|this.words[i+r])+s,s=a>>26,this.words[i+r]=67108863&a;if(0===s)return this.strip();for(n(-1===s),s=0,i=0;i<this.length;i++)a=-(0|this.words[i])+s,s=a>>26,this.words[i]=67108863&a;return this.negative=1,this.strip()},o.prototype._wordDiv=function(t,e){var r=this.length-t.length,n=this.clone(),i=t,a=0|i.words[i.length-1];0!==(r=26-this._countBits(a))&&(i=i.ushln(r),n.iushln(r),a=0|i.words[i.length-1]);var s,f=n.length-i.length;if("mod"!==e){s=new o(null),s.length=f+1,s.words=new Array(s.length);for(var c=0;c<s.length;c++)s.words[c]=0}var u=n.clone()._ishlnsubmul(i,1,f);0===u.negative&&(n=u,s&&(s.words[f]=1));for(var h=f-1;h>=0;h--){var d=67108864*(0|n.words[i.length+h])+(0|n.words[i.length+h-1]);for(d=Math.min(d/a|0,67108863),n._ishlnsubmul(i,d,h);0!==n.negative;)d--,n.negative=0,n._ishlnsubmul(i,1,h),n.isZero()||(n.negative^=1);s&&(s.words[h]=d)}return s&&s.strip(),n.strip(),"div"!==e&&0!==r&&n.iushrn(r),{div:s||null,mod:n}},o.prototype.divmod=function(t,e,r){if(n(!t.isZero()),this.isZero())return{div:new o(0),mod:new o(0)};var i,a,s;return 0!==this.negative&&0===t.negative?(s=this.neg().divmod(t,e),"mod"!==e&&(i=s.div.neg()),"div"!==e&&(a=s.mod.neg(),r&&0!==a.negative&&a.iadd(t)),{div:i,mod:a}):0===this.negative&&0!==t.negative?(s=this.divmod(t.neg(),e),"mod"!==e&&(i=s.div.neg()),{div:i,mod:s.mod}):0!=(this.negative&t.negative)?(s=this.neg().divmod(t.neg(),e),"div"!==e&&(a=s.mod.neg(),r&&0!==a.negative&&a.isub(t)),{div:s.div,mod:a}):t.length>this.length||this.cmp(t)<0?{div:new o(0),mod:this}:1===t.length?"div"===e?{div:this.divn(t.words[0]),mod:null}:"mod"===e?{div:null,mod:new o(this.modn(t.words[0]))}:{div:this.divn(t.words[0]),mod:new o(this.modn(t.words[0]))}:this._wordDiv(t,e)},o.prototype.div=function(t){return this.divmod(t,"div",!1).div},o.prototype.mod=function(t){return this.divmod(t,"mod",!1).mod},o.prototype.umod=function(t){return this.divmod(t,"mod",!0).mod},o.prototype.divRound=function(t){var e=this.divmod(t);if(e.mod.isZero())return e.div;var r=0!==e.div.negative?e.mod.isub(t):e.mod,n=t.ushrn(1),i=t.andln(1),o=r.cmp(n);return o<0||1===i&&0===o?e.div:0!==e.div.negative?e.div.isubn(1):e.div.iaddn(1)},o.prototype.modn=function(t){n(t<=67108863);for(var e=(1<<26)%t,r=0,i=this.length-1;i>=0;i--)r=(e*r+(0|this.words[i]))%t;return r},o.prototype.idivn=function(t){n(t<=67108863);for(var e=0,r=this.length-1;r>=0;r--){var i=(0|this.words[r])+67108864*e;this.words[r]=i/t|0,e=i%t}return this.strip()},o.prototype.divn=function(t){return this.clone().idivn(t)},o.prototype.egcd=function(t){n(0===t.negative),n(!t.isZero());var e=this,r=t.clone();e=0!==e.negative?e.umod(t):e.clone();for(var i=new o(1),a=new o(0),s=new o(0),f=new o(1),c=0;e.isEven()&&r.isEven();)e.iushrn(1),r.iushrn(1),++c;for(var u=r.clone(),h=e.clone();!e.isZero();){for(var d=0,l=1;0==(e.words[0]&l)&&d<26;++d,l<<=1);if(d>0)for(e.iushrn(d);d-- >0;)(i.isOdd()||a.isOdd())&&(i.iadd(u),a.isub(h)),i.iushrn(1),a.iushrn(1);for(var p=0,b=1;0==(r.words[0]&b)&&p<26;++p,b<<=1);if(p>0)for(r.iushrn(p);p-- >0;)(s.isOdd()||f.isOdd())&&(s.iadd(u),f.isub(h)),s.iushrn(1),f.iushrn(1);e.cmp(r)>=0?(e.isub(r),i.isub(s),a.isub(f)):(r.isub(e),s.isub(i),f.isub(a))}return{a:s,b:f,gcd:r.iushln(c)}},o.prototype._invmp=function(t){n(0===t.negative),n(!t.isZero());var e=this,r=t.clone();e=0!==e.negative?e.umod(t):e.clone();for(var i=new o(1),a=new o(0),s=r.clone();e.cmpn(1)>0&&r.cmpn(1)>0;){for(var f=0,c=1;0==(e.words[0]&c)&&f<26;++f,c<<=1);if(f>0)for(e.iushrn(f);f-- >0;)i.isOdd()&&i.iadd(s),i.iushrn(1);for(var u=0,h=1;0==(r.words[0]&h)&&u<26;++u,h<<=1);if(u>0)for(r.iushrn(u);u-- >0;)a.isOdd()&&a.iadd(s),a.iushrn(1);e.cmp(r)>=0?(e.isub(r),i.isub(a)):(r.isub(e),a.isub(i))}var d;return d=0===e.cmpn(1)?i:a,d.cmpn(0)<0&&d.iadd(t),d},o.prototype.gcd=function(t){if(this.isZero())return t.abs();if(t.isZero())return this.abs();var e=this.clone(),r=t.clone();e.negative=0,r.negative=0;for(var n=0;e.isEven()&&r.isEven();n++)e.iushrn(1),r.iushrn(1);for(;;){for(;e.isEven();)e.iushrn(1);for(;r.isEven();)r.iushrn(1);var i=e.cmp(r);if(i<0){var o=e;e=r,r=o}else if(0===i||0===r.cmpn(1))break;e.isub(r)}return r.iushln(n)},o.prototype.invm=function(t){return this.egcd(t).a.umod(t)},o.prototype.isEven=function(){return 0==(1&this.words[0])},o.prototype.isOdd=function(){return 1==(1&this.words[0])},o.prototype.andln=function(t){return this.words[0]&t},o.prototype.bincn=function(t){n("number"==typeof t);var e=t%26,r=(t-e)/26,i=1<<e;if(this.length<=r)return this._expand(r+1),this.words[r]|=i,this;for(var o=i,a=r;0!==o&&a<this.length;a++){var s=0|this.words[a];s+=o,o=s>>>26,s&=67108863,this.words[a]=s}return 0!==o&&(this.words[a]=o,this.length++),this},o.prototype.isZero=function(){return 1===this.length&&0===this.words[0]},o.prototype.cmpn=function(t){var e=t<0;if(0!==this.negative&&!e)return-1;if(0===this.negative&&e)return 1;this.strip();var r;if(this.length>1)r=1;else{e&&(t=-t),n(t<=67108863,"Number is too big");var i=0|this.words[0];r=i===t?0:i<t?-1:1}return 0!==this.negative?0|-r:r},o.prototype.cmp=function(t){if(0!==this.negative&&0===t.negative)return-1;if(0===this.negative&&0!==t.negative)return 1;var e=this.ucmp(t);return 0!==this.negative?0|-e:e},o.prototype.ucmp=function(t){if(this.length>t.length)return 1;if(this.length<t.length)return-1;for(var e=0,r=this.length-1;r>=0;r--){var n=0|this.words[r],i=0|t.words[r];if(n!==i){n<i?e=-1:n>i&&(e=1);break}}return e},o.prototype.gtn=function(t){return 1===this.cmpn(t)},o.prototype.gt=function(t){return 1===this.cmp(t)},o.prototype.gten=function(t){return this.cmpn(t)>=0},o.prototype.gte=function(t){return this.cmp(t)>=0},o.prototype.ltn=function(t){return-1===this.cmpn(t)},o.prototype.lt=function(t){return-1===this.cmp(t)},o.prototype.lten=function(t){return this.cmpn(t)<=0},o.prototype.lte=function(t){return this.cmp(t)<=0},o.prototype.eqn=function(t){return 0===this.cmpn(t)},o.prototype.eq=function(t){return 0===this.cmp(t)},o.red=function(t){return new g(t)},o.prototype.toRed=function(t){return n(!this.red,"Already a number in reduction context"),n(0===this.negative,"red works only with positives"),t.convertTo(this)._forceRed(t)},o.prototype.fromRed=function(){return n(this.red,"fromRed works only with numbers in reduction context"),this.red.convertFrom(this)},o.prototype._forceRed=function(t){return this.red=t,this},o.prototype.forceRed=function(t){return n(!this.red,"Already a number in reduction context"),this._forceRed(t)},o.prototype.redAdd=function(t){return n(this.red,"redAdd works only with red numbers"),this.red.add(this,t)},o.prototype.redIAdd=function(t){return n(this.red,"redIAdd works only with red numbers"),this.red.iadd(this,t)},o.prototype.redSub=function(t){return n(this.red,"redSub works only with red numbers"),this.red.sub(this,t)},o.prototype.redISub=function(t){return n(this.red,"redISub works only with red numbers"),this.red.isub(this,t)},o.prototype.redShl=function(t){return n(this.red,"redShl works only with red numbers"),this.red.shl(this,t)},o.prototype.redMul=function(t){return n(this.red,"redMul works only with red numbers"),this.red._verify2(this,t),this.red.mul(this,t)},o.prototype.redIMul=function(t){
return n(this.red,"redMul works only with red numbers"),this.red._verify2(this,t),this.red.imul(this,t)},o.prototype.redSqr=function(){return n(this.red,"redSqr works only with red numbers"),this.red._verify1(this),this.red.sqr(this)},o.prototype.redISqr=function(){return n(this.red,"redISqr works only with red numbers"),this.red._verify1(this),this.red.isqr(this)},o.prototype.redSqrt=function(){return n(this.red,"redSqrt works only with red numbers"),this.red._verify1(this),this.red.sqrt(this)},o.prototype.redInvm=function(){return n(this.red,"redInvm works only with red numbers"),this.red._verify1(this),this.red.invm(this)},o.prototype.redNeg=function(){return n(this.red,"redNeg works only with red numbers"),this.red._verify1(this),this.red.neg(this)},o.prototype.redPow=function(t){return n(this.red&&!t.red,"redPow(normalNum)"),this.red._verify1(this),this.red.pow(this,t)};var M={k256:null,p224:null,p192:null,p25519:null};l.prototype._tmp=function(){var t=new o(null);return t.words=new Array(Math.ceil(this.n/13)),t},l.prototype.ireduce=function(t){var e,r=t;do{this.split(r,this.tmp),r=this.imulK(r),r=r.iadd(this.tmp),e=r.bitLength()}while(e>this.n);var n=e<this.n?-1:r.ucmp(this.p);return 0===n?(r.words[0]=0,r.length=1):n>0?r.isub(this.p):r.strip(),r},l.prototype.split=function(t,e){t.iushrn(this.n,0,e)},l.prototype.imulK=function(t){return t.imul(this.k)},i(p,l),p.prototype.split=function(t,e){for(var r=Math.min(t.length,9),n=0;n<r;n++)e.words[n]=t.words[n];if(e.length=r,t.length<=9)return t.words[0]=0,void(t.length=1);var i=t.words[9];for(e.words[e.length++]=4194303&i,n=10;n<t.length;n++){var o=0|t.words[n];t.words[n-10]=(4194303&o)<<4|i>>>22,i=o}i>>>=22,t.words[n-10]=i,0===i&&t.length>10?t.length-=10:t.length-=9},p.prototype.imulK=function(t){t.words[t.length]=0,t.words[t.length+1]=0,t.length+=2;for(var e=0,r=0;r<t.length;r++){var n=0|t.words[r];e+=977*n,t.words[r]=67108863&e,e=64*n+(e/67108864|0)}return 0===t.words[t.length-1]&&(t.length--,0===t.words[t.length-1]&&t.length--),t},i(b,l),i(v,l),i(y,l),y.prototype.imulK=function(t){for(var e=0,r=0;r<t.length;r++){var n=19*(0|t.words[r])+e,i=67108863&n;n>>>=26,t.words[r]=i,e=n}return 0!==e&&(t.words[t.length++]=e),t},o._prime=function(t){if(M[t])return M[t];var e;if("k256"===t)e=new p;else if("p224"===t)e=new b;else if("p192"===t)e=new v;else{if("p25519"!==t)throw new Error("Unknown prime "+t);e=new y}return M[t]=e,e},g.prototype._verify1=function(t){n(0===t.negative,"red works only with positives"),n(t.red,"red works only with red numbers")},g.prototype._verify2=function(t,e){n(0==(t.negative|e.negative),"red works only with positives"),n(t.red&&t.red===e.red,"red works only with red numbers")},g.prototype.imod=function(t){return this.prime?this.prime.ireduce(t)._forceRed(this):t.umod(this.m)._forceRed(this)},g.prototype.neg=function(t){return t.isZero()?t.clone():this.m.sub(t)._forceRed(this)},g.prototype.add=function(t,e){this._verify2(t,e);var r=t.add(e);return r.cmp(this.m)>=0&&r.isub(this.m),r._forceRed(this)},g.prototype.iadd=function(t,e){this._verify2(t,e);var r=t.iadd(e);return r.cmp(this.m)>=0&&r.isub(this.m),r},g.prototype.sub=function(t,e){this._verify2(t,e);var r=t.sub(e);return r.cmpn(0)<0&&r.iadd(this.m),r._forceRed(this)},g.prototype.isub=function(t,e){this._verify2(t,e);var r=t.isub(e);return r.cmpn(0)<0&&r.iadd(this.m),r},g.prototype.shl=function(t,e){return this._verify1(t),this.imod(t.ushln(e))},g.prototype.imul=function(t,e){return this._verify2(t,e),this.imod(t.imul(e))},g.prototype.mul=function(t,e){return this._verify2(t,e),this.imod(t.mul(e))},g.prototype.isqr=function(t){return this.imul(t,t.clone())},g.prototype.sqr=function(t){return this.mul(t,t)},g.prototype.sqrt=function(t){if(t.isZero())return t.clone();var e=this.m.andln(3);if(n(e%2==1),3===e){var r=this.m.add(new o(1)).iushrn(2);return this.pow(t,r)}for(var i=this.m.subn(1),a=0;!i.isZero()&&0===i.andln(1);)a++,i.iushrn(1);n(!i.isZero());var s=new o(1).toRed(this),f=s.redNeg(),c=this.m.subn(1).iushrn(1),u=this.m.bitLength();for(u=new o(2*u*u).toRed(this);0!==this.pow(u,c).cmp(f);)u.redIAdd(f);for(var h=this.pow(u,i),d=this.pow(t,i.addn(1).iushrn(1)),l=this.pow(t,i),p=a;0!==l.cmp(s);){for(var b=l,v=0;0!==b.cmp(s);v++)b=b.redSqr();n(v<p);var y=this.pow(h,new o(1).iushln(p-v-1));d=d.redMul(y),h=y.redSqr(),l=l.redMul(h),p=v}return d},g.prototype.invm=function(t){var e=t._invmp(this.m);return 0!==e.negative?(e.negative=0,this.imod(e).redNeg()):this.imod(e)},g.prototype.pow=function(t,e){if(e.isZero())return new o(1).toRed(this);if(0===e.cmpn(1))return t.clone();var r=new Array(16);r[0]=new o(1).toRed(this),r[1]=t;for(var n=2;n<r.length;n++)r[n]=this.mul(r[n-1],t);var i=r[0],a=0,s=0,f=e.bitLength()%26;for(0===f&&(f=26),n=e.length-1;n>=0;n--){for(var c=e.words[n],u=f-1;u>=0;u--){var h=c>>u&1;i!==r[0]&&(i=this.sqr(i)),0!==h||0!==a?(a<<=1,a|=h,(4===++s||0===n&&0===u)&&(i=this.mul(i,r[a]),s=0,a=0)):s=0}f=26}return i},g.prototype.convertTo=function(t){var e=t.umod(this.m);return e===t?e.clone():e},g.prototype.convertFrom=function(t){var e=t.clone();return e.red=null,e},o.mont=function(t){return new m(t)},i(m,g),m.prototype.convertTo=function(t){return this.imod(t.ushln(this.shift))},m.prototype.convertFrom=function(t){var e=this.imod(t.mul(this.rinv));return e.red=null,e},m.prototype.imul=function(t,e){if(t.isZero()||e.isZero())return t.words[0]=0,t.length=1,t;var r=t.imul(e),n=r.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),i=r.isub(n).iushrn(this.shift),o=i;return i.cmp(this.m)>=0?o=i.isub(this.m):i.cmpn(0)<0&&(o=i.iadd(this.m)),o._forceRed(this)},m.prototype.mul=function(t,e){if(t.isZero()||e.isZero())return new o(0)._forceRed(this);var r=t.mul(e),n=r.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),i=r.isub(n).iushrn(this.shift),a=i;return i.cmp(this.m)>=0?a=i.isub(this.m):i.cmpn(0)<0&&(a=i.iadd(this.m)),a._forceRed(this)},m.prototype.invm=function(t){return this.imod(t._invmp(this.m).mul(this.r2))._forceRed(this)}}(void 0===e||e,this)},{20:20}],19:[function(t,e,r){function n(t){this.rand=t}var i;if(e.exports=function(t){return i||(i=new n(null)),i.generate(t)},e.exports.Rand=n,n.prototype.generate=function(t){return this._rand(t)},n.prototype._rand=function(t){if(this.rand.getBytes)return this.rand.getBytes(t);for(var e=new Uint8Array(t),r=0;r<e.length;r++)e[r]=this.rand.getByte();return e},"object"==typeof self)self.crypto&&self.crypto.getRandomValues?n.prototype._rand=function(t){var e=new Uint8Array(t);return self.crypto.getRandomValues(e),e}:self.msCrypto&&self.msCrypto.getRandomValues?n.prototype._rand=function(t){var e=new Uint8Array(t);return self.msCrypto.getRandomValues(e),e}:"object"==typeof window&&(n.prototype._rand=function(){throw new Error("Not implemented yet")});else try{var o=t(20);if("function"!=typeof o.randomBytes)throw new Error("Not supported");n.prototype._rand=function(t){return o.randomBytes(t)}}catch(t){}},{20:20}],20:[function(t,e,r){},{}],21:[function(t,e,r){function n(t){s.isBuffer(t)||(t=s.from(t));for(var e=t.length/4|0,r=new Array(e),n=0;n<e;n++)r[n]=t.readUInt32BE(4*n);return r}function i(t){for(;0<t.length;t++)t[0]=0}function o(t,e,r,n,i){for(var o,a,s,f,c=r[0],u=r[1],h=r[2],d=r[3],l=t[0]^e[0],p=t[1]^e[1],b=t[2]^e[2],v=t[3]^e[3],y=4,g=1;g<i;g++)o=c[l>>>24]^u[p>>>16&255]^h[b>>>8&255]^d[255&v]^e[y++],a=c[p>>>24]^u[b>>>16&255]^h[v>>>8&255]^d[255&l]^e[y++],s=c[b>>>24]^u[v>>>16&255]^h[l>>>8&255]^d[255&p]^e[y++],f=c[v>>>24]^u[l>>>16&255]^h[p>>>8&255]^d[255&b]^e[y++],l=o,p=a,b=s,v=f;return o=(n[l>>>24]<<24|n[p>>>16&255]<<16|n[b>>>8&255]<<8|n[255&v])^e[y++],a=(n[p>>>24]<<24|n[b>>>16&255]<<16|n[v>>>8&255]<<8|n[255&l])^e[y++],s=(n[b>>>24]<<24|n[v>>>16&255]<<16|n[l>>>8&255]<<8|n[255&p])^e[y++],f=(n[v>>>24]<<24|n[l>>>16&255]<<16|n[p>>>8&255]<<8|n[255&b])^e[y++],o>>>=0,a>>>=0,s>>>=0,f>>>=0,[o,a,s,f]}function a(t){this._key=n(t),this._reset()}var s=t(471).Buffer,f=[0,1,2,4,8,16,32,64,128,27,54],c=function(){for(var t=new Array(256),e=0;e<256;e++)t[e]=e<128?e<<1:e<<1^283;for(var r=[],n=[],i=[[],[],[],[]],o=[[],[],[],[]],a=0,s=0,f=0;f<256;++f){var c=s^s<<1^s<<2^s<<3^s<<4;c=c>>>8^255&c^99,r[a]=c,n[c]=a;var u=t[a],h=t[u],d=t[h],l=257*t[c]^16843008*c;i[0][a]=l<<24|l>>>8,i[1][a]=l<<16|l>>>16,i[2][a]=l<<8|l>>>24,i[3][a]=l,l=16843009*d^65537*h^257*u^16843008*a,o[0][c]=l<<24|l>>>8,o[1][c]=l<<16|l>>>16,o[2][c]=l<<8|l>>>24,o[3][c]=l,0===a?a=s=1:(a=u^t[t[t[d^u]]],s^=t[t[s]])}return{SBOX:r,INV_SBOX:n,SUB_MIX:i,INV_SUB_MIX:o}}();a.blockSize=16,a.keySize=32,a.prototype.blockSize=a.blockSize,a.prototype.keySize=a.keySize,a.prototype._reset=function(){for(var t=this._key,e=t.length,r=e+6,n=4*(r+1),i=[],o=0;o<e;o++)i[o]=t[o];for(o=e;o<n;o++){var a=i[o-1];o%e==0?(a=a<<8|a>>>24,a=c.SBOX[a>>>24]<<24|c.SBOX[a>>>16&255]<<16|c.SBOX[a>>>8&255]<<8|c.SBOX[255&a],a^=f[o/e|0]<<24):e>6&&o%e==4&&(a=c.SBOX[a>>>24]<<24|c.SBOX[a>>>16&255]<<16|c.SBOX[a>>>8&255]<<8|c.SBOX[255&a]),i[o]=i[o-e]^a}for(var s=[],u=0;u<n;u++){var h=n-u,d=i[h-(u%4?0:4)];s[u]=u<4||h<=4?d:c.INV_SUB_MIX[0][c.SBOX[d>>>24]]^c.INV_SUB_MIX[1][c.SBOX[d>>>16&255]]^c.INV_SUB_MIX[2][c.SBOX[d>>>8&255]]^c.INV_SUB_MIX[3][c.SBOX[255&d]]}this._nRounds=r,this._keySchedule=i,this._invKeySchedule=s},a.prototype.encryptBlockRaw=function(t){return t=n(t),o(t,this._keySchedule,c.SUB_MIX,c.SBOX,this._nRounds)},a.prototype.encryptBlock=function(t){var e=this.encryptBlockRaw(t),r=s.allocUnsafe(16);return r.writeUInt32BE(e[0],0),r.writeUInt32BE(e[1],4),r.writeUInt32BE(e[2],8),r.writeUInt32BE(e[3],12),r},a.prototype.decryptBlock=function(t){t=n(t);var e=t[1];t[1]=t[3],t[3]=e;var r=o(t,this._invKeySchedule,c.INV_SUB_MIX,c.INV_SBOX,this._nRounds),i=s.allocUnsafe(16);return i.writeUInt32BE(r[0],0),i.writeUInt32BE(r[3],4),i.writeUInt32BE(r[2],8),i.writeUInt32BE(r[1],12),i},a.prototype.scrub=function(){i(this._keySchedule),i(this._invKeySchedule),i(this._key)},e.exports.AES=a},{471:471}],22:[function(t,e,r){function n(t,e){var r=0;t.length!==e.length&&r++;for(var n=Math.min(t.length,e.length),i=0;i<n;++i)r+=t[i]^e[i];return r}function i(t,e,r){if(12===e.length)return t._finID=s.concat([e,s.from([0,0,0,1])]),s.concat([e,s.from([0,0,0,2])]);var n=new u(r),i=e.length,o=i%16;n.update(e),o&&(o=16-o,n.update(s.alloc(o,0))),n.update(s.alloc(8,0));var a=8*i,f=s.alloc(8);f.writeUIntBE(a,0,8),n.update(f),t._finID=n.state;var c=s.from(t._finID);return d(c),c}function o(t,e,r,n){f.call(this);var o=s.alloc(4,0);this._cipher=new a.AES(e);var c=this._cipher.encryptBlock(o);this._ghash=new u(c),r=i(this,r,c),this._prev=s.from(r),this._cache=s.allocUnsafe(0),this._secCache=s.allocUnsafe(0),this._decrypt=n,this._alen=0,this._len=0,this._mode=t,this._authTag=null,this._called=!1}var a=t(21),s=t(471).Buffer,f=t(51),c=t(427),u=t(26),h=t(49),d=t(27);c(o,f),o.prototype._update=function(t){if(!this._called&&this._alen){var e=16-this._alen%16;e<16&&(e=s.alloc(e,0),this._ghash.update(e))}this._called=!0;var r=this._mode.encrypt(this,t);return this._decrypt?this._ghash.update(t):this._ghash.update(r),this._len+=t.length,r},o.prototype._final=function(){if(this._decrypt&&!this._authTag)throw new Error("Unsupported state or unable to authenticate data");var t=h(this._ghash.final(8*this._alen,8*this._len),this._cipher.encryptBlock(this._finID));if(this._decrypt&&n(t,this._authTag))throw new Error("Unsupported state or unable to authenticate data");this._authTag=t,this._cipher.scrub()},o.prototype.getAuthTag=function(){if(this._decrypt||!s.isBuffer(this._authTag))throw new Error("Attempting to get auth tag in unsupported state");return this._authTag},o.prototype.setAuthTag=function(t){if(!this._decrypt)throw new Error("Attempting to set auth tag in unsupported state");this._authTag=t},o.prototype.setAAD=function(t){if(this._called)throw new Error("Attempting to set AAD in unsupported state");this._ghash.update(t),this._alen+=t.length},e.exports=o},{21:21,26:26,27:27,427:427,471:471,49:49,51:51}],23:[function(t,e,r){function n(){return Object.keys(a)}var i=t(25),o=t(24),a=t(35);r.createCipher=r.Cipher=i.createCipher,r.createCipheriv=r.Cipheriv=i.createCipheriv,r.createDecipher=r.Decipher=o.createDecipher,r.createDecipheriv=r.Decipheriv=o.createDecipheriv,r.listCiphers=r.getCiphers=n},{24:24,25:25,35:35}],24:[function(t,e,r){function n(t,e,r){d.call(this),this._cache=new i,this._last=void 0,this._cipher=new l.AES(e),this._prev=c.from(r),this._mode=t,this._autopadding=!0}function i(){this.cache=c.allocUnsafe(0)}function o(t){var e=t[15];if(e<1||e>16)throw new Error("unable to decrypt data");for(var r=-1;++r<e;)if(t[r+(16-e)]!==e)throw new Error("unable to decrypt data");if(16!==e)return t.slice(0,16-e)}function a(t,e,r){var i=u[t.toLowerCase()];if(!i)throw new TypeError("invalid suite type");if("string"==typeof r&&(r=c.from(r)),"GCM"!==i.mode&&r.length!==i.iv)throw new TypeError("invalid iv length "+r.length);if("string"==typeof e&&(e=c.from(e)),e.length!==i.key/8)throw new TypeError("invalid key length "+e.length);return"stream"===i.type?new h(i.module,e,r,!0):"auth"===i.type?new f(i.module,e,r,!0):new n(i.module,e,r)}function s(t,e){var r=u[t.toLowerCase()];if(!r)throw new TypeError("invalid suite type");var n=p(e,!1,r.key,r.iv);return a(t,n.key,n.iv)}var f=t(22),c=t(471).Buffer,u=t(34),h=t(37),d=t(51),l=t(21),p=t(410);t(427)(n,d),n.prototype._update=function(t){this._cache.add(t);for(var e,r,n=[];e=this._cache.get(this._autopadding);)r=this._mode.decrypt(this,e),n.push(r);return c.concat(n)},n.prototype._final=function(){var t=this._cache.flush();if(this._autopadding)return o(this._mode.decrypt(this,t));if(t)throw new Error("data not multiple of block length")},n.prototype.setAutoPadding=function(t){return this._autopadding=!!t,this},i.prototype.add=function(t){this.cache=c.concat([this.cache,t])},i.prototype.get=function(t){var e;if(t){if(this.cache.length>16)return e=this.cache.slice(0,16),this.cache=this.cache.slice(16),e}else if(this.cache.length>=16)return e=this.cache.slice(0,16),this.cache=this.cache.slice(16),e;return null},i.prototype.flush=function(){if(this.cache.length)return this.cache},r.createDecipher=s,r.createDecipheriv=a},{21:21,22:22,34:34,37:37,410:410,427:427,471:471,51:51}],25:[function(t,e,r){function n(t,e,r){h.call(this),this._cache=new i,this._cipher=new d.AES(e),this._prev=c.from(r),this._mode=t,this._autopadding=!0}function i(){this.cache=c.allocUnsafe(0)}function o(t,e,r){var i=s[t.toLowerCase()];if(!i)throw new TypeError("invalid suite type");if("string"==typeof e&&(e=c.from(e)),e.length!==i.key/8)throw new TypeError("invalid key length "+e.length);if("string"==typeof r&&(r=c.from(r)),"GCM"!==i.mode&&r.length!==i.iv)throw new TypeError("invalid iv length "+r.length);return"stream"===i.type?new u(i.module,e,r):"auth"===i.type?new f(i.module,e,r):new n(i.module,e,r)}function a(t,e){var r=s[t.toLowerCase()];if(!r)throw new TypeError("invalid suite type");var n=l(e,!1,r.key,r.iv);return o(t,n.key,n.iv)}var s=t(34),f=t(22),c=t(471).Buffer,u=t(37),h=t(51),d=t(21),l=t(410);t(427)(n,h),n.prototype._update=function(t){this._cache.add(t);for(var e,r,n=[];e=this._cache.get();)r=this._mode.encrypt(this,e),n.push(r);return c.concat(n)};var p=c.alloc(16,16);n.prototype._final=function(){var t=this._cache.flush();if(this._autopadding)return t=this._mode.encrypt(this,t),this._cipher.scrub(),t;if(!t.equals(p))throw this._cipher.scrub(),new Error("data not multiple of block length")},n.prototype.setAutoPadding=function(t){return this._autopadding=!!t,this},i.prototype.add=function(t){this.cache=c.concat([this.cache,t])},i.prototype.get=function(){if(this.cache.length>15){var t=this.cache.slice(0,16);return this.cache=this.cache.slice(16),t}return null},i.prototype.flush=function(){for(var t=16-this.cache.length,e=c.allocUnsafe(t),r=-1;++r<t;)e.writeUInt8(t,r);return c.concat([this.cache,e])},r.createCipheriv=o,r.createCipher=a},{21:21,22:22,34:34,37:37,410:410,427:427,471:471,51:51}],26:[function(t,e,r){function n(t){return[t.readUInt32BE(0),t.readUInt32BE(4),t.readUInt32BE(8),t.readUInt32BE(12)]}function i(t){var e=a.allocUnsafe(16);return e.writeUInt32BE(t[0]>>>0,0),e.writeUInt32BE(t[1]>>>0,4),e.writeUInt32BE(t[2]>>>0,8),e.writeUInt32BE(t[3]>>>0,12),e}function o(t){this.h=t,this.state=a.alloc(16,0),this.cache=a.allocUnsafe(0)}var a=t(471).Buffer,s=a.alloc(16,0);o.prototype.ghash=function(t){for(var e=-1;++e<t.length;)this.state[e]^=t[e];this._multiply()},o.prototype._multiply=function(){for(var t,e,r,o=n(this.h),a=[0,0,0,0],s=-1;++s<128;){for(e=0!=(this.state[~~(s/8)]&1<<7-s%8),e&&(a[0]^=o[0],a[1]^=o[1],a[2]^=o[2],a[3]^=o[3]),r=0!=(1&o[3]),t=3;t>0;t--)o[t]=o[t]>>>1|(1&o[t-1])<<31;o[0]=o[0]>>>1,r&&(o[0]=o[0]^225<<24)}this.state=i(a)},o.prototype.update=function(t){this.cache=a.concat([this.cache,t]);for(var e;this.cache.length>=16;)e=this.cache.slice(0,16),this.cache=this.cache.slice(16),this.ghash(e)},o.prototype.final=function(t,e){return this.cache.length&&this.ghash(a.concat([this.cache,s],16)),this.ghash(i([0,t,0,e])),this.state},e.exports=o},{471:471}],27:[function(t,e,r){function n(t){for(var e,r=t.length;r--;){if(255!==(e=t.readUInt8(r))){e++,t.writeUInt8(e,r);break}t.writeUInt8(0,r)}}e.exports=n},{}],28:[function(t,e,r){var n=t(49);r.encrypt=function(t,e){var r=n(e,t._prev);return t._prev=t._cipher.encryptBlock(r),t._prev},r.decrypt=function(t,e){var r=t._prev;t._prev=e;var i=t._cipher.decryptBlock(e);return n(i,r)}},{49:49}],29:[function(t,e,r){function n(t,e,r){var n=e.length,a=o(e,t._cache);return t._cache=t._cache.slice(n),t._prev=i.concat([t._prev,r?e:a]),a}var i=t(471).Buffer,o=t(49);r.encrypt=function(t,e,r){for(var o,a=i.allocUnsafe(0);e.length;){if(0===t._cache.length&&(t._cache=t._cipher.encryptBlock(t._prev),t._prev=i.allocUnsafe(0)),!(t._cache.length<=e.length)){a=i.concat([a,n(t,e,r)]);break}o=t._cache.length,a=i.concat([a,n(t,e.slice(0,o),r)]),e=e.slice(o)}return a}},{471:471,49:49}],30:[function(t,e,r){function n(t,e,r){for(var n,o,a,s=-1,f=0;++s<8;)n=t._cipher.encryptBlock(t._prev),o=e&1<<7-s?128:0,a=n[0]^o,f+=(128&a)>>s%8,t._prev=i(t._prev,r?o:a);return f}function i(t,e){var r=t.length,n=-1,i=o.allocUnsafe(t.length);for(t=o.concat([t,o.from([e])]);++n<r;)i[n]=t[n]<<1|t[n+1]>>7;return i}var o=t(471).Buffer;r.encrypt=function(t,e,r){for(var i=e.length,a=o.allocUnsafe(i),s=-1;++s<i;)a[s]=n(t,e[s],r);return a}},{471:471}],31:[function(t,e,r){function n(t,e,r){var n=t._cipher.encryptBlock(t._prev),o=n[0]^e;return t._prev=i.concat([t._prev.slice(1),i.from([r?e:o])]),o}var i=t(471).Buffer;r.encrypt=function(t,e,r){for(var o=e.length,a=i.allocUnsafe(o),s=-1;++s<o;)a[s]=n(t,e[s],r);return a}},{471:471}],32:[function(t,e,r){function n(t){var e=t._cipher.encryptBlockRaw(t._prev);return a(t._prev),e}var i=t(49),o=t(471).Buffer,a=t(27);r.encrypt=function(t,e){var r=Math.ceil(e.length/16),a=t._cache.length;t._cache=o.concat([t._cache,o.allocUnsafe(16*r)]);for(var s=0;s<r;s++){var f=n(t),c=a+16*s;t._cache.writeUInt32BE(f[0],c+0),t._cache.writeUInt32BE(f[1],c+4),t._cache.writeUInt32BE(f[2],c+8),t._cache.writeUInt32BE(f[3],c+12)}var u=t._cache.slice(0,e.length);return t._cache=t._cache.slice(e.length),i(e,u)}},{27:27,471:471,49:49}],33:[function(t,e,r){r.encrypt=function(t,e){return t._cipher.encryptBlock(e)},r.decrypt=function(t,e){return t._cipher.decryptBlock(e)}},{}],34:[function(t,e,r){var n={ECB:t(33),CBC:t(28),CFB:t(29),CFB8:t(31),CFB1:t(30),OFB:t(36),CTR:t(32),GCM:t(32)},i=t(35);for(var o in i)i[o].module=n[i[o].mode];e.exports=i},{28:28,29:29,30:30,31:31,32:32,33:33,35:35,36:36}],35:[function(t,e,r){e.exports={"aes-128-ecb":{cipher:"AES",key:128,iv:0,mode:"ECB",type:"block"},"aes-192-ecb":{cipher:"AES",key:192,iv:0,mode:"ECB",type:"block"},"aes-256-ecb":{cipher:"AES",key:256,iv:0,mode:"ECB",type:"block"},"aes-128-cbc":{cipher:"AES",key:128,iv:16,mode:"CBC",type:"block"},"aes-192-cbc":{cipher:"AES",key:192,iv:16,mode:"CBC",type:"block"},"aes-256-cbc":{cipher:"AES",key:256,iv:16,mode:"CBC",type:"block"},aes128:{cipher:"AES",key:128,iv:16,mode:"CBC",type:"block"},aes192:{cipher:"AES",key:192,iv:16,mode:"CBC",type:"block"},aes256:{cipher:"AES",key:256,iv:16,mode:"CBC",type:"block"},"aes-128-cfb":{cipher:"AES",key:128,iv:16,mode:"CFB",type:"stream"},"aes-192-cfb":{cipher:"AES",key:192,iv:16,mode:"CFB",type:"stream"},"aes-256-cfb":{cipher:"AES",key:256,iv:16,mode:"CFB",type:"stream"},"aes-128-cfb8":{cipher:"AES",key:128,iv:16,mode:"CFB8",type:"stream"},"aes-192-cfb8":{cipher:"AES",key:192,iv:16,mode:"CFB8",type:"stream"},"aes-256-cfb8":{cipher:"AES",key:256,iv:16,mode:"CFB8",type:"stream"},"aes-128-cfb1":{cipher:"AES",key:128,iv:16,mode:"CFB1",type:"stream"},"aes-192-cfb1":{cipher:"AES",key:192,iv:16,mode:"CFB1",type:"stream"},"aes-256-cfb1":{cipher:"AES",key:256,iv:16,mode:"CFB1",type:"stream"},"aes-128-ofb":{cipher:"AES",key:128,iv:16,mode:"OFB",type:"stream"},"aes-192-ofb":{cipher:"AES",key:192,iv:16,mode:"OFB",type:"stream"},"aes-256-ofb":{cipher:"AES",key:256,iv:16,mode:"OFB",type:"stream"},"aes-128-ctr":{cipher:"AES",key:128,iv:16,mode:"CTR",type:"stream"},"aes-192-ctr":{cipher:"AES",key:192,iv:16,mode:"CTR",type:"stream"},"aes-256-ctr":{cipher:"AES",key:256,iv:16,mode:"CTR",type:"stream"},"aes-128-gcm":{cipher:"AES",key:128,iv:12,mode:"GCM",type:"auth"},"aes-192-gcm":{cipher:"AES",key:192,iv:12,mode:"GCM",type:"auth"},"aes-256-gcm":{cipher:"AES",key:256,iv:12,mode:"GCM",type:"auth"}}},{}],36:[function(t,e,r){(function(e){function n(t){return t._prev=t._cipher.encryptBlock(t._prev),t._prev}var i=t(49);r.encrypt=function(t,r){for(;t._cache.length<r.length;)t._cache=e.concat([t._cache,n(t)]);var o=t._cache.slice(0,r.length);return t._cache=t._cache.slice(r.length),i(r,o)}}).call(this,t(50).Buffer)},{49:49,50:50}],37:[function(t,e,r){function n(t,e,r,n){a.call(this),this._cipher=new i.AES(e),this._prev=o.from(r),this._cache=o.allocUnsafe(0),this._secCache=o.allocUnsafe(0),this._decrypt=n,this._mode=t}var i=t(21),o=t(471).Buffer,a=t(51);t(427)(n,a),n.prototype._update=function(t){return this._mode.encrypt(this,t,this._decrypt)},n.prototype._final=function(){this._cipher.scrub()},e.exports=n},{21:21,427:427,471:471,51:51}],38:[function(t,e,r){function n(t,e){t=t.toLowerCase();var r,n;if(u[t])r=u[t].key,n=u[t].iv;else{if(!h[t])throw new TypeError("invalid suite type");r=8*h[t].key,n=h[t].iv}var i=d(e,!1,r,n);return o(t,i.key,i.iv)}function i(t,e){t=t.toLowerCase();var r,n;if(u[t])r=u[t].key,n=u[t].iv;else{if(!h[t])throw new TypeError("invalid suite type");r=8*h[t].key,n=h[t].iv}var i=d(e,!1,r,n);return a(t,i.key,i.iv)}function o(t,e,r){if(t=t.toLowerCase(),u[t])return c.createCipheriv(t,e,r);if(h[t])return new f({key:e,iv:r,mode:t});throw new TypeError("invalid suite type")}function a(t,e,r){if(t=t.toLowerCase(),u[t])return c.createDecipheriv(t,e,r);if(h[t])return new f({key:e,iv:r,mode:t,decrypt:!0});throw new TypeError("invalid suite type")}function s(){return Object.keys(h).concat(c.getCiphers())}var f=t(39),c=t(23),u=t(34),h=t(40),d=t(410);r.createCipher=r.Cipher=n,r.createCipheriv=r.Cipheriv=o,r.createDecipher=r.Decipher=i,r.createDecipheriv=r.Decipheriv=a,r.listCiphers=r.getCiphers=s},{23:23,34:34,39:39,40:40,410:410}],39:[function(t,e,r){function n(t){i.call(this);var e,r=t.mode.toLowerCase(),n=f[r];e=t.decrypt?"decrypt":"encrypt";var o=t.key;s.isBuffer(o)||(o=s.from(o)),"des-ede"!==r&&"des-ede-cbc"!==r||(o=s.concat([o,o.slice(0,8)]));var a=t.iv;s.isBuffer(a)||(a=s.from(a)),this._des=n.create({key:o,iv:a,type:e})}var i=t(51),o=t(383),a=t(427),s=t(471).Buffer,f={"des-ede3-cbc":o.CBC.instantiate(o.EDE),"des-ede3":o.EDE,"des-ede-cbc":o.CBC.instantiate(o.EDE),"des-ede":o.EDE,"des-cbc":o.CBC.instantiate(o.DES),"des-ecb":o.DES};f.des=f["des-cbc"],f.des3=f["des-ede3-cbc"],e.exports=n,a(n,i),n.prototype._update=function(t){return s.from(this._des.update(t))},n.prototype._final=function(){return s.from(this._des.final())}},{383:383,427:427,471:471,51:51}],40:[function(t,e,r){r["des-ecb"]={key:8,iv:0},r["des-cbc"]=r.des={key:8,iv:8},r["des-ede3-cbc"]=r.des3={key:24,iv:8},r["des-ede3"]={key:24,iv:0},r["des-ede-cbc"]={key:16,iv:8},r["des-ede"]={key:16,iv:0}},{}],41:[function(t,e,r){(function(r){function n(t){var e=o(t);return{blinder:e.toRed(a.mont(t.modulus)).redPow(new a(t.publicExponent)).fromRed(),unblinder:e.invm(t.modulus)}}function i(t,e){var i=n(e),o=e.modulus.byteLength(),s=(a.mont(e.modulus),new a(t).mul(i.blinder).umod(e.modulus)),f=s.toRed(a.mont(e.prime1)),c=s.toRed(a.mont(e.prime2)),u=e.coefficient,h=e.prime1,d=e.prime2,l=f.redPow(e.exponent1),p=c.redPow(e.exponent2);l=l.fromRed(),p=p.fromRed();var b=l.isub(p).imul(u).umod(h);return b.imul(d),p.iadd(b),new r(p.imul(i.unblinder).umod(e.modulus).toArray(!1,o))}function o(t){for(var e=t.modulus.byteLength(),r=new a(s(e));r.cmp(t.modulus)>=0||!r.umod(t.prime1)||!r.umod(t.prime2);)r=new a(s(e));return r}var a=t(18),s=t(454);e.exports=i,i.getr=o}).call(this,t(50).Buffer)},{18:18,454:454,50:50}],42:[function(t,e,r){e.exports=t(43)},{43:43}],43:[function(t,e,r){e.exports={sha224WithRSAEncryption:{sign:"rsa",hash:"sha224",id:"302d300d06096086480165030402040500041c"},"RSA-SHA224":{sign:"ecdsa/rsa",hash:"sha224",id:"302d300d06096086480165030402040500041c"},sha256WithRSAEncryption:{sign:"rsa",hash:"sha256",id:"3031300d060960864801650304020105000420"},"RSA-SHA256":{sign:"ecdsa/rsa",hash:"sha256",id:"3031300d060960864801650304020105000420"},sha384WithRSAEncryption:{sign:"rsa",hash:"sha384",id:"3041300d060960864801650304020205000430"},"RSA-SHA384":{sign:"ecdsa/rsa",hash:"sha384",id:"3041300d060960864801650304020205000430"},sha512WithRSAEncryption:{sign:"rsa",hash:"sha512",id:"3051300d060960864801650304020305000440"},"RSA-SHA512":{sign:"ecdsa/rsa",hash:"sha512",id:"3051300d060960864801650304020305000440"},"RSA-SHA1":{sign:"rsa",hash:"sha1",id:"3021300906052b0e03021a05000414"},"ecdsa-with-SHA1":{sign:"ecdsa",hash:"sha1",id:""},sha256:{sign:"ecdsa",hash:"sha256",id:""},sha224:{sign:"ecdsa",hash:"sha224",id:""},sha384:{sign:"ecdsa",hash:"sha384",id:""},sha512:{sign:"ecdsa",hash:"sha512",id:""},"DSA-SHA":{sign:"dsa",hash:"sha1",id:""},"DSA-SHA1":{sign:"dsa",hash:"sha1",id:""},DSA:{sign:"dsa",hash:"sha1",id:""},"DSA-WITH-SHA224":{sign:"dsa",hash:"sha224",id:""},"DSA-SHA224":{sign:"dsa",hash:"sha224",id:""},"DSA-WITH-SHA256":{sign:"dsa",hash:"sha256",id:""},"DSA-SHA256":{sign:"dsa",hash:"sha256",id:""},"DSA-WITH-SHA384":{sign:"dsa",hash:"sha384",id:""},"DSA-SHA384":{sign:"dsa",hash:"sha384",id:""},"DSA-WITH-SHA512":{sign:"dsa",hash:"sha512",id:""},"DSA-SHA512":{sign:"dsa",hash:"sha512",id:""},"DSA-RIPEMD160":{sign:"dsa",hash:"rmd160",id:""},ripemd160WithRSA:{sign:"rsa",hash:"rmd160",id:"3021300906052b2403020105000414"},"RSA-RIPEMD160":{sign:"rsa",hash:"rmd160",id:"3021300906052b2403020105000414"},md5WithRSAEncryption:{sign:"rsa",hash:"md5",id:"3020300c06082a864886f70d020505000410"},"RSA-MD5":{sign:"rsa",hash:"md5",id:"3020300c06082a864886f70d020505000410"}}},{}],44:[function(t,e,r){e.exports={"1.3.132.0.10":"secp256k1","1.3.132.0.33":"p224","1.2.840.10045.3.1.1":"p192","1.2.840.10045.3.1.7":"p256","1.3.132.0.34":"p384","1.3.132.0.35":"p521"}},{}],45:[function(t,e,r){(function(r){function n(t){f.Writable.call(this);var e=d[t];if(!e)throw new Error("Unknown message digest");this._hashType=e.hash,this._hash=s(e.hash),this._tag=e.id,this._signType=e.sign}function i(t){f.Writable.call(this);var e=d[t];if(!e)throw new Error("Unknown message digest");this._hash=s(e.hash),this._tag=e.id,this._signType=e.sign}function o(t){return new n(t)}function a(t){return new i(t)}var s=t(378),f=t(481),c=t(427),u=t(46),h=t(47),d=t(43);Object.keys(d).forEach(function(t){d[t].id=new r(d[t].id,"hex"),d[t.toLowerCase()]=d[t]}),c(n,f.Writable),n.prototype._write=function(t,e,r){this._hash.update(t),r()},n.prototype.update=function(t,e){return"string"==typeof t&&(t=new r(t,e)),this._hash.update(t),this},n.prototype.sign=function(t,e){this.end();var r=this._hash.digest(),n=u(r,t,this._hashType,this._signType,this._tag);return e?n.toString(e):n},c(i,f.Writable),i.prototype._write=function(t,e,r){this._hash.update(t),r()},i.prototype.update=function(t,e){return"string"==typeof t&&(t=new r(t,e)),this._hash.update(t),this},i.prototype.verify=function(t,e,n){"string"==typeof e&&(e=new r(e,n)),this.end();var i=this._hash.digest();return h(e,i,t,this._signType,this._tag)},e.exports={Sign:o,Verify:a,createSign:o,createVerify:a}}).call(this,t(50).Buffer)},{378:378,427:427,43:43,46:46,47:47,481:481,50:50}],46:[function(t,e,r){(function(r){function n(t,e,n,a,s){var f=v(e);if(f.curve){if("ecdsa"!==a&&"ecdsa/rsa"!==a)throw new Error("wrong private key type");return i(t,f)}if("dsa"===f.type){if("dsa"!==a)throw new Error("wrong private key type");return o(t,f,n)}if("rsa"!==a&&"ecdsa/rsa"!==a)throw new Error("wrong private key type");t=r.concat([s,t]);for(var c=f.modulus.byteLength(),u=[0,1];t.length+u.length+1<c;)u.push(255);u.push(0);for(var h=-1;++h<t.length;)u.push(t[h]);return l(u,f)}function i(t,e){var n=y[e.curve.join(".")];if(!n)throw new Error("unknown curve "+e.curve.join("."));var i=new p(n),o=i.keyFromPrivate(e.privateKey),a=o.sign(t);return new r(a.toDER())}function o(t,e,r){for(var n,i=e.params.priv_key,o=e.params.p,c=e.params.q,d=e.params.g,l=new b(0),p=f(t,c).mod(c),v=!1,y=s(i,c,t,r);!1===v;)n=u(c,y,r),l=h(d,n,o,c),v=n.invm(c).imul(p.add(i.mul(l))).mod(c),0===v.cmpn(0)&&(v=!1,l=new b(0));return a(l,v)}function a(t,e){t=t.toArray(),e=e.toArray(),128&t[0]&&(t=[0].concat(t)),128&e[0]&&(e=[0].concat(e));var n=t.length+e.length+4,i=[48,n,2,t.length];return i=i.concat(t,[2,e.length],e),new r(i)}function s(t,e,n,i){if(t=new r(t.toArray()),t.length<e.byteLength()){var o=new r(e.byteLength()-t.length);o.fill(0),t=r.concat([o,t])}var a=n.length,s=c(n,e),f=new r(a);f.fill(1);var u=new r(a);return u.fill(0),u=d(i,u).update(f).update(new r([0])).update(t).update(s).digest(),f=d(i,u).update(f).digest(),u=d(i,u).update(f).update(new r([1])).update(t).update(s).digest(),f=d(i,u).update(f).digest(),{k:u,v:f}}function f(t,e){var r=new b(t),n=(t.length<<3)-e.bitLength();return n>0&&r.ishrn(n),r}function c(t,e){t=f(t,e),t=t.mod(e);var n=new r(t.toArray());if(n.length<e.byteLength()){var i=new r(e.byteLength()-n.length);i.fill(0),n=r.concat([i,n])}return n}function u(t,e,n){var i,o;do{for(i=new r(0);8*i.length<t.bitLength();)e.v=d(n,e.k).update(e.v).digest(),i=r.concat([i,e.v]);o=f(i,t),e.k=d(n,e.k).update(e.v).update(new r([0])).digest(),e.v=d(n,e.k).update(e.v).digest()}while(-1!==o.cmp(t));return o}function h(t,e,r,n){return t.toRed(b.mont(r)).redPow(e).fromRed().mod(n)}var d=t(380),l=t(41),p=t(393).ec,b=t(18),v=t(439),y=t(44);e.exports=n,e.exports.getKey=s,e.exports.makeKey=u}).call(this,t(50).Buffer)},{18:18,380:380,393:393,41:41,439:439,44:44,50:50}],47:[function(t,e,r){(function(r){function n(t,e,n,a,f){var u=c(n);if("ec"===u.type){if("ecdsa"!==a&&"ecdsa/rsa"!==a)throw new Error("wrong public key type");return i(t,e,u)}if("dsa"===u.type){if("dsa"!==a)throw new Error("wrong public key type");return o(t,e,u)}if("rsa"!==a&&"ecdsa/rsa"!==a)throw new Error("wrong public key type");e=r.concat([f,e]);for(var h=u.modulus.byteLength(),d=[1],l=0;e.length+d.length+2<h;)d.push(255),l++;d.push(0);for(var p=-1;++p<e.length;)d.push(e[p]);d=new r(d);var b=s.mont(u.modulus);t=new s(t).toRed(b),t=t.redPow(new s(u.publicExponent)),t=new r(t.fromRed().toArray());var v=l<8?1:0;for(h=Math.min(t.length,d.length),t.length!==d.length&&(v=1),p=-1;++p<h;)v|=t[p]^d[p];return 0===v}function i(t,e,r){var n=u[r.data.algorithm.curve.join(".")];if(!n)throw new Error("unknown curve "+r.data.algorithm.curve.join("."));var i=new f(n),o=r.data.subjectPrivateKey.data;return i.verify(e,t,o)}function o(t,e,r){var n=r.data.p,i=r.data.q,o=r.data.g,f=r.data.pub_key,u=c.signature.decode(t,"der"),h=u.s,d=u.r;a(h,i),a(d,i);var l=s.mont(n),p=h.invm(i);return 0===o.toRed(l).redPow(new s(e).mul(p).mod(i)).fromRed().mul(f.toRed(l).redPow(d.mul(p).mod(i)).fromRed()).mod(n).mod(i).cmp(d)}function a(t,e){if(t.cmpn(0)<=0)throw new Error("invalid sig");if(t.cmp(e)>=e)throw new Error("invalid sig")}var s=t(18),f=t(393).ec,c=t(439),u=t(44);e.exports=n
}).call(this,t(50).Buffer)},{18:18,393:393,439:439,44:44,50:50}],48:[function(t,e,r){"use strict";function n(t){if(!t)return"utf8";for(var e;;)switch(t){case"utf8":case"utf-8":return"utf8";case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return"utf16le";case"latin1":case"binary":return"latin1";case"base64":case"ascii":case"hex":return t;default:if(e)return;t=(""+t).toLowerCase(),e=!0}}function i(t){var e=n(t);if("string"!=typeof e&&(g.isEncoding===m||!m(t)))throw new Error("Unknown encoding: "+t);return e||t}function o(t){this.encoding=i(t);var e;switch(this.encoding){case"utf16le":this.text=d,this.end=l,e=4;break;case"utf8":this.fillLast=c,e=4;break;case"base64":this.text=p,this.end=b,e=3;break;default:return this.write=v,void(this.end=y)}this.lastNeed=0,this.lastTotal=0,this.lastChar=g.allocUnsafe(e)}function a(t){return t<=127?0:t>>5==6?2:t>>4==14?3:t>>3==30?4:-1}function s(t,e,r){var n=e.length-1;if(n<r)return 0;var i=a(e[n]);return i>=0?(i>0&&(t.lastNeed=i-1),i):--n<r?0:(i=a(e[n]))>=0?(i>0&&(t.lastNeed=i-2),i):--n<r?0:(i=a(e[n]),i>=0?(i>0&&(2===i?i=0:t.lastNeed=i-3),i):0)}function f(t,e,r){if(128!=(192&e[0]))return t.lastNeed=0,"�".repeat(r);if(t.lastNeed>1&&e.length>1){if(128!=(192&e[1]))return t.lastNeed=1,"�".repeat(r+1);if(t.lastNeed>2&&e.length>2&&128!=(192&e[2]))return t.lastNeed=2,"�".repeat(r+2)}}function c(t){var e=this.lastTotal-this.lastNeed,r=f(this,t,e);return void 0!==r?r:this.lastNeed<=t.length?(t.copy(this.lastChar,e,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal)):(t.copy(this.lastChar,e,0,t.length),void(this.lastNeed-=t.length))}function u(t,e){var r=s(this,t,e);if(!this.lastNeed)return t.toString("utf8",e);this.lastTotal=r;var n=t.length-(r-this.lastNeed);return t.copy(this.lastChar,0,n),t.toString("utf8",e,n)}function h(t){var e=t&&t.length?this.write(t):"";return this.lastNeed?e+"�".repeat(this.lastTotal-this.lastNeed):e}function d(t,e){if((t.length-e)%2==0){var r=t.toString("utf16le",e);if(r){var n=r.charCodeAt(r.length-1);if(n>=55296&&n<=56319)return this.lastNeed=2,this.lastTotal=4,this.lastChar[0]=t[t.length-2],this.lastChar[1]=t[t.length-1],r.slice(0,-1)}return r}return this.lastNeed=1,this.lastTotal=2,this.lastChar[0]=t[t.length-1],t.toString("utf16le",e,t.length-1)}function l(t){var e=t&&t.length?this.write(t):"";if(this.lastNeed){var r=this.lastTotal-this.lastNeed;return e+this.lastChar.toString("utf16le",0,r)}return e}function p(t,e){var r=(t.length-e)%3;return 0===r?t.toString("base64",e):(this.lastNeed=3-r,this.lastTotal=3,1===r?this.lastChar[0]=t[t.length-1]:(this.lastChar[0]=t[t.length-2],this.lastChar[1]=t[t.length-1]),t.toString("base64",e,t.length-r))}function b(t){var e=t&&t.length?this.write(t):"";return this.lastNeed?e+this.lastChar.toString("base64",0,3-this.lastNeed):e}function v(t){return t.toString(this.encoding)}function y(t){return t&&t.length?this.write(t):""}var g=t(471).Buffer,m=g.isEncoding||function(t){switch((t=""+t)&&t.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return!0;default:return!1}};r.StringDecoder=o,o.prototype.write=function(t){if(0===t.length)return"";var e,r;if(this.lastNeed){if(void 0===(e=this.fillLast(t)))return"";r=this.lastNeed,this.lastNeed=0}else r=0;return r<t.length?e?e+this.text(t,r):this.text(t,r):e||""},o.prototype.end=h,o.prototype.text=u,o.prototype.fillLast=function(t){if(this.lastNeed<=t.length)return t.copy(this.lastChar,this.lastTotal-this.lastNeed,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal);t.copy(this.lastChar,this.lastTotal-this.lastNeed,0,t.length),this.lastNeed-=t.length}},{471:471}],49:[function(t,e,r){(function(t){e.exports=function(e,r){for(var n=Math.min(e.length,r.length),i=new t(n),o=0;o<n;++o)i[o]=e[o]^r[o];return i}}).call(this,t(50).Buffer)},{50:50}],50:[function(t,e,r){"use strict";function n(t){if(t>J)throw new RangeError('The value "'+t+'" is invalid for option "size"');var e=new Uint8Array(t);return e.__proto__=i.prototype,e}function i(t,e,r){if("number"==typeof t){if("string"==typeof e)throw new TypeError('The "string" argument must be of type string. Received type number');return f(t)}return o(t,e,r)}function o(t,e,r){if("string"==typeof t)return c(t,e);if(ArrayBuffer.isView(t))return u(t);if(null==t)throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof t);if(K(t,ArrayBuffer)||t&&K(t.buffer,ArrayBuffer))return h(t,e,r);if("number"==typeof t)throw new TypeError('The "value" argument must not be of type number. Received type number');var n=t.valueOf&&t.valueOf();if(null!=n&&n!==t)return i.from(n,e,r);var o=d(t);if(o)return o;if("undefined"!=typeof Symbol&&null!=Symbol.toPrimitive&&"function"==typeof t[Symbol.toPrimitive])return i.from(t[Symbol.toPrimitive]("string"),e,r);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof t)}function a(t){if("number"!=typeof t)throw new TypeError('"size" argument must be of type number');if(t<0)throw new RangeError('The value "'+t+'" is invalid for option "size"')}function s(t,e,r){return a(t),t<=0?n(t):void 0!==e?"string"==typeof r?n(t).fill(e,r):n(t).fill(e):n(t)}function f(t){return a(t),n(t<0?0:0|l(t))}function c(t,e){if("string"==typeof e&&""!==e||(e="utf8"),!i.isEncoding(e))throw new TypeError("Unknown encoding: "+e);var r=0|b(t,e),o=n(r),a=o.write(t,e);return a!==r&&(o=o.slice(0,a)),o}function u(t){for(var e=t.length<0?0:0|l(t.length),r=n(e),i=0;i<e;i+=1)r[i]=255&t[i];return r}function h(t,e,r){if(e<0||t.byteLength<e)throw new RangeError('"offset" is outside of buffer bounds');if(t.byteLength<e+(r||0))throw new RangeError('"length" is outside of buffer bounds');var n;return n=void 0===e&&void 0===r?new Uint8Array(t):void 0===r?new Uint8Array(t,e):new Uint8Array(t,e,r),n.__proto__=i.prototype,n}function d(t){if(i.isBuffer(t)){var e=0|l(t.length),r=n(e);return 0===r.length?r:(t.copy(r,0,0,e),r)}return void 0!==t.length?"number"!=typeof t.length||W(t.length)?n(0):u(t):"Buffer"===t.type&&Array.isArray(t.data)?u(t.data):void 0}function l(t){if(t>=J)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+J.toString(16)+" bytes");return 0|t}function p(t){return+t!=t&&(t=0),i.alloc(+t)}function b(t,e){if(i.isBuffer(t))return t.length;if(ArrayBuffer.isView(t)||K(t,ArrayBuffer))return t.byteLength;if("string"!=typeof t)throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof t);var r=t.length,n=arguments.length>2&&!0===arguments[2];if(!n&&0===r)return 0;for(var o=!1;;)switch(e){case"ascii":case"latin1":case"binary":return r;case"utf8":case"utf-8":return U(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*r;case"hex":return r>>>1;case"base64":return V(t).length;default:if(o)return n?-1:U(t).length;e=(""+e).toLowerCase(),o=!0}}function v(t,e,r){var n=!1;if((void 0===e||e<0)&&(e=0),e>this.length)return"";if((void 0===r||r>this.length)&&(r=this.length),r<=0)return"";if(r>>>=0,e>>>=0,r<=e)return"";for(t||(t="utf8");;)switch(t){case"hex":return T(this,e,r);case"utf8":case"utf-8":return x(this,e,r);case"ascii":return R(this,e,r);case"latin1":case"binary":return B(this,e,r);case"base64":return A(this,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return P(this,e,r);default:if(n)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),n=!0}}function y(t,e,r){var n=t[e];t[e]=t[r],t[r]=n}function g(t,e,r,n,o){if(0===t.length)return-1;if("string"==typeof r?(n=r,r=0):r>2147483647?r=2147483647:r<-2147483648&&(r=-2147483648),r=+r,W(r)&&(r=o?0:t.length-1),r<0&&(r=t.length+r),r>=t.length){if(o)return-1;r=t.length-1}else if(r<0){if(!o)return-1;r=0}if("string"==typeof e&&(e=i.from(e,n)),i.isBuffer(e))return 0===e.length?-1:m(t,e,r,n,o);if("number"==typeof e)return e&=255,"function"==typeof Uint8Array.prototype.indexOf?o?Uint8Array.prototype.indexOf.call(t,e,r):Uint8Array.prototype.lastIndexOf.call(t,e,r):m(t,[e],r,n,o);throw new TypeError("val must be string, number or Buffer")}function m(t,e,r,n,i){function o(t,e){return 1===a?t[e]:t.readUInt16BE(e*a)}var a=1,s=t.length,f=e.length;if(void 0!==n&&("ucs2"===(n=String(n).toLowerCase())||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(t.length<2||e.length<2)return-1;a=2,s/=2,f/=2,r/=2}var c;if(i){var u=-1;for(c=r;c<s;c++)if(o(t,c)===o(e,-1===u?0:c-u)){if(-1===u&&(u=c),c-u+1===f)return u*a}else-1!==u&&(c-=c-u),u=-1}else for(r+f>s&&(r=s-f),c=r;c>=0;c--){for(var h=!0,d=0;d<f;d++)if(o(t,c+d)!==o(e,d)){h=!1;break}if(h)return c}return-1}function w(t,e,r,n){r=Number(r)||0;var i=t.length-r;n?(n=Number(n))>i&&(n=i):n=i;var o=e.length;n>o/2&&(n=o/2);for(var a=0;a<n;++a){var s=parseInt(e.substr(2*a,2),16);if(W(s))return a;t[r+a]=s}return a}function _(t,e,r,n){return G(U(e,t.length-r),t,r,n)}function S(t,e,r,n){return G(q(e),t,r,n)}function E(t,e,r,n){return S(t,e,r,n)}function k(t,e,r,n){return G(V(e),t,r,n)}function M(t,e,r,n){return G(z(e,t.length-r),t,r,n)}function A(t,e,r){return 0===e&&r===t.length?H.fromByteArray(t):H.fromByteArray(t.slice(e,r))}function x(t,e,r){r=Math.min(t.length,r);for(var n=[],i=e;i<r;){var o=t[i],a=null,s=o>239?4:o>223?3:o>191?2:1;if(i+s<=r){var f,c,u,h;switch(s){case 1:o<128&&(a=o);break;case 2:f=t[i+1],128==(192&f)&&(h=(31&o)<<6|63&f)>127&&(a=h);break;case 3:f=t[i+1],c=t[i+2],128==(192&f)&&128==(192&c)&&(h=(15&o)<<12|(63&f)<<6|63&c)>2047&&(h<55296||h>57343)&&(a=h);break;case 4:f=t[i+1],c=t[i+2],u=t[i+3],128==(192&f)&&128==(192&c)&&128==(192&u)&&(h=(15&o)<<18|(63&f)<<12|(63&c)<<6|63&u)>65535&&h<1114112&&(a=h)}}null===a?(a=65533,s=1):a>65535&&(a-=65536,n.push(a>>>10&1023|55296),a=56320|1023&a),n.push(a),i+=s}return I(n)}function I(t){var e=t.length;if(e<=Y)return String.fromCharCode.apply(String,t);for(var r="",n=0;n<e;)r+=String.fromCharCode.apply(String,t.slice(n,n+=Y));return r}function R(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(127&t[i]);return n}function B(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(t[i]);return n}function T(t,e,r){var n=t.length;(!e||e<0)&&(e=0),(!r||r<0||r>n)&&(r=n);for(var i="",o=e;o<r;++o)i+=F(t[o]);return i}function P(t,e,r){for(var n=t.slice(e,r),i="",o=0;o<n.length;o+=2)i+=String.fromCharCode(n[o]+256*n[o+1]);return i}function C(t,e,r){if(t%1!=0||t<0)throw new RangeError("offset is not uint");if(t+e>r)throw new RangeError("Trying to access beyond buffer length")}function O(t,e,r,n,o,a){if(!i.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(e>o||e<a)throw new RangeError('"value" argument is out of bounds');if(r+n>t.length)throw new RangeError("Index out of range")}function j(t,e,r,n,i,o){if(r+n>t.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("Index out of range")}function N(t,e,r,n,i){return e=+e,r>>>=0,i||j(t,e,r,4,3.4028234663852886e38,-3.4028234663852886e38),X.write(t,e,r,n,23,4),r+4}function L(t,e,r,n,i){return e=+e,r>>>=0,i||j(t,e,r,8,1.7976931348623157e308,-1.7976931348623157e308),X.write(t,e,r,n,52,8),r+8}function D(t){if(t=t.split("=")[0],t=t.trim().replace(Z,""),t.length<2)return"";for(;t.length%4!=0;)t+="=";return t}function F(t){return t<16?"0"+t.toString(16):t.toString(16)}function U(t,e){e=e||1/0;for(var r,n=t.length,i=null,o=[],a=0;a<n;++a){if((r=t.charCodeAt(a))>55295&&r<57344){if(!i){if(r>56319){(e-=3)>-1&&o.push(239,191,189);continue}if(a+1===n){(e-=3)>-1&&o.push(239,191,189);continue}i=r;continue}if(r<56320){(e-=3)>-1&&o.push(239,191,189),i=r;continue}r=65536+(i-55296<<10|r-56320)}else i&&(e-=3)>-1&&o.push(239,191,189);if(i=null,r<128){if((e-=1)<0)break;o.push(r)}else if(r<2048){if((e-=2)<0)break;o.push(r>>6|192,63&r|128)}else if(r<65536){if((e-=3)<0)break;o.push(r>>12|224,r>>6&63|128,63&r|128)}else{if(!(r<1114112))throw new Error("Invalid code point");if((e-=4)<0)break;o.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128)}}return o}function q(t){for(var e=[],r=0;r<t.length;++r)e.push(255&t.charCodeAt(r));return e}function z(t,e){for(var r,n,i,o=[],a=0;a<t.length&&!((e-=2)<0);++a)r=t.charCodeAt(a),n=r>>8,i=r%256,o.push(i),o.push(n);return o}function V(t){return H.toByteArray(D(t))}function G(t,e,r,n){for(var i=0;i<n&&!(i+r>=e.length||i>=t.length);++i)e[i+r]=t[i];return i}function K(t,e){return t instanceof e||null!=t&&null!=t.constructor&&null!=t.constructor.name&&t.constructor.name===e.name}function W(t){return t!==t}var H=t(17),X=t(425);r.Buffer=i,r.SlowBuffer=p,r.INSPECT_MAX_BYTES=50;var J=2147483647;r.kMaxLength=J,i.TYPED_ARRAY_SUPPORT=function(){try{var t=new Uint8Array(1);return t.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===t.foo()}catch(t){return!1}}(),!i.TYPED_ARRAY_SUPPORT&&"undefined"!=typeof console&&console.error,Object.defineProperty(i.prototype,"parent",{enumerable:!0,get:function(){if(i.isBuffer(this))return this.buffer}}),Object.defineProperty(i.prototype,"offset",{enumerable:!0,get:function(){if(i.isBuffer(this))return this.byteOffset}}),"undefined"!=typeof Symbol&&null!=Symbol.species&&i[Symbol.species]===i&&Object.defineProperty(i,Symbol.species,{value:null,configurable:!0,enumerable:!1,writable:!1}),i.poolSize=8192,i.from=function(t,e,r){return o(t,e,r)},i.prototype.__proto__=Uint8Array.prototype,i.__proto__=Uint8Array,i.alloc=function(t,e,r){return s(t,e,r)},i.allocUnsafe=function(t){return f(t)},i.allocUnsafeSlow=function(t){return f(t)},i.isBuffer=function(t){return null!=t&&!0===t._isBuffer&&t!==i.prototype},i.compare=function(t,e){if(K(t,Uint8Array)&&(t=i.from(t,t.offset,t.byteLength)),K(e,Uint8Array)&&(e=i.from(e,e.offset,e.byteLength)),!i.isBuffer(t)||!i.isBuffer(e))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(t===e)return 0;for(var r=t.length,n=e.length,o=0,a=Math.min(r,n);o<a;++o)if(t[o]!==e[o]){r=t[o],n=e[o];break}return r<n?-1:n<r?1:0},i.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},i.concat=function(t,e){if(!Array.isArray(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return i.alloc(0);var r;if(void 0===e)for(e=0,r=0;r<t.length;++r)e+=t[r].length;var n=i.allocUnsafe(e),o=0;for(r=0;r<t.length;++r){var a=t[r];if(K(a,Uint8Array)&&(a=i.from(a)),!i.isBuffer(a))throw new TypeError('"list" argument must be an Array of Buffers');a.copy(n,o),o+=a.length}return n},i.byteLength=b,i.prototype._isBuffer=!0,i.prototype.swap16=function(){var t=this.length;if(t%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var e=0;e<t;e+=2)y(this,e,e+1);return this},i.prototype.swap32=function(){var t=this.length;if(t%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var e=0;e<t;e+=4)y(this,e,e+3),y(this,e+1,e+2);return this},i.prototype.swap64=function(){var t=this.length;if(t%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var e=0;e<t;e+=8)y(this,e,e+7),y(this,e+1,e+6),y(this,e+2,e+5),y(this,e+3,e+4);return this},i.prototype.toString=function(){var t=this.length;return 0===t?"":0===arguments.length?x(this,0,t):v.apply(this,arguments)},i.prototype.toLocaleString=i.prototype.toString,i.prototype.equals=function(t){if(!i.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t||0===i.compare(this,t)},i.prototype.inspect=function(){var t="",e=r.INSPECT_MAX_BYTES;return t=this.toString("hex",0,e).replace(/(.{2})/g,"$1 ").trim(),this.length>e&&(t+=" ... "),"<Buffer "+t+">"},i.prototype.compare=function(t,e,r,n,o){if(K(t,Uint8Array)&&(t=i.from(t,t.offset,t.byteLength)),!i.isBuffer(t))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof t);if(void 0===e&&(e=0),void 0===r&&(r=t?t.length:0),void 0===n&&(n=0),void 0===o&&(o=this.length),e<0||r>t.length||n<0||o>this.length)throw new RangeError("out of range index");if(n>=o&&e>=r)return 0;if(n>=o)return-1;if(e>=r)return 1;if(e>>>=0,r>>>=0,n>>>=0,o>>>=0,this===t)return 0;for(var a=o-n,s=r-e,f=Math.min(a,s),c=this.slice(n,o),u=t.slice(e,r),h=0;h<f;++h)if(c[h]!==u[h]){a=c[h],s=u[h];break}return a<s?-1:s<a?1:0},i.prototype.includes=function(t,e,r){return-1!==this.indexOf(t,e,r)},i.prototype.indexOf=function(t,e,r){return g(this,t,e,r,!0)},i.prototype.lastIndexOf=function(t,e,r){return g(this,t,e,r,!1)},i.prototype.write=function(t,e,r,n){if(void 0===e)n="utf8",r=this.length,e=0;else if(void 0===r&&"string"==typeof e)n=e,r=this.length,e=0;else{if(!isFinite(e))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");e>>>=0,isFinite(r)?(r>>>=0,void 0===n&&(n="utf8")):(n=r,r=void 0)}var i=this.length-e;if((void 0===r||r>i)&&(r=i),t.length>0&&(r<0||e<0)||e>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var o=!1;;)switch(n){case"hex":return w(this,t,e,r);case"utf8":case"utf-8":return _(this,t,e,r);case"ascii":return S(this,t,e,r);case"latin1":case"binary":return E(this,t,e,r);case"base64":return k(this,t,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return M(this,t,e,r);default:if(o)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),o=!0}},i.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var Y=4096;i.prototype.slice=function(t,e){var r=this.length;t=~~t,e=void 0===e?r:~~e,t<0?(t+=r)<0&&(t=0):t>r&&(t=r),e<0?(e+=r)<0&&(e=0):e>r&&(e=r),e<t&&(e=t);var n=this.subarray(t,e);return n.__proto__=i.prototype,n},i.prototype.readUIntLE=function(t,e,r){t>>>=0,e>>>=0,r||C(t,e,this.length);for(var n=this[t],i=1,o=0;++o<e&&(i*=256);)n+=this[t+o]*i;return n},i.prototype.readUIntBE=function(t,e,r){t>>>=0,e>>>=0,r||C(t,e,this.length);for(var n=this[t+--e],i=1;e>0&&(i*=256);)n+=this[t+--e]*i;return n},i.prototype.readUInt8=function(t,e){return t>>>=0,e||C(t,1,this.length),this[t]},i.prototype.readUInt16LE=function(t,e){return t>>>=0,e||C(t,2,this.length),this[t]|this[t+1]<<8},i.prototype.readUInt16BE=function(t,e){return t>>>=0,e||C(t,2,this.length),this[t]<<8|this[t+1]},i.prototype.readUInt32LE=function(t,e){return t>>>=0,e||C(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},i.prototype.readUInt32BE=function(t,e){return t>>>=0,e||C(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},i.prototype.readIntLE=function(t,e,r){t>>>=0,e>>>=0,r||C(t,e,this.length);for(var n=this[t],i=1,o=0;++o<e&&(i*=256);)n+=this[t+o]*i;return i*=128,n>=i&&(n-=Math.pow(2,8*e)),n},i.prototype.readIntBE=function(t,e,r){t>>>=0,e>>>=0,r||C(t,e,this.length);for(var n=e,i=1,o=this[t+--n];n>0&&(i*=256);)o+=this[t+--n]*i;return i*=128,o>=i&&(o-=Math.pow(2,8*e)),o},i.prototype.readInt8=function(t,e){return t>>>=0,e||C(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},i.prototype.readInt16LE=function(t,e){t>>>=0,e||C(t,2,this.length);var r=this[t]|this[t+1]<<8;return 32768&r?4294901760|r:r},i.prototype.readInt16BE=function(t,e){t>>>=0,e||C(t,2,this.length);var r=this[t+1]|this[t]<<8;return 32768&r?4294901760|r:r},i.prototype.readInt32LE=function(t,e){return t>>>=0,e||C(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},i.prototype.readInt32BE=function(t,e){return t>>>=0,e||C(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},i.prototype.readFloatLE=function(t,e){return t>>>=0,e||C(t,4,this.length),X.read(this,t,!0,23,4)},i.prototype.readFloatBE=function(t,e){return t>>>=0,e||C(t,4,this.length),X.read(this,t,!1,23,4)},i.prototype.readDoubleLE=function(t,e){return t>>>=0,e||C(t,8,this.length),X.read(this,t,!0,52,8)},i.prototype.readDoubleBE=function(t,e){return t>>>=0,e||C(t,8,this.length),X.read(this,t,!1,52,8)},i.prototype.writeUIntLE=function(t,e,r,n){if(t=+t,e>>>=0,r>>>=0,!n){O(this,t,e,r,Math.pow(2,8*r)-1,0)}var i=1,o=0;for(this[e]=255&t;++o<r&&(i*=256);)this[e+o]=t/i&255;return e+r},i.prototype.writeUIntBE=function(t,e,r,n){if(t=+t,e>>>=0,r>>>=0,!n){O(this,t,e,r,Math.pow(2,8*r)-1,0)}var i=r-1,o=1;for(this[e+i]=255&t;--i>=0&&(o*=256);)this[e+i]=t/o&255;return e+r},i.prototype.writeUInt8=function(t,e,r){return t=+t,e>>>=0,r||O(this,t,e,1,255,0),this[e]=255&t,e+1},i.prototype.writeUInt16LE=function(t,e,r){return t=+t,e>>>=0,r||O(this,t,e,2,65535,0),this[e]=255&t,this[e+1]=t>>>8,e+2},i.prototype.writeUInt16BE=function(t,e,r){return t=+t,e>>>=0,r||O(this,t,e,2,65535,0),this[e]=t>>>8,this[e+1]=255&t,e+2},i.prototype.writeUInt32LE=function(t,e,r){return t=+t,e>>>=0,r||O(this,t,e,4,4294967295,0),this[e+3]=t>>>24,this[e+2]=t>>>16,this[e+1]=t>>>8,this[e]=255&t,e+4},i.prototype.writeUInt32BE=function(t,e,r){return t=+t,e>>>=0,r||O(this,t,e,4,4294967295,0),this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t,e+4},i.prototype.writeIntLE=function(t,e,r,n){if(t=+t,e>>>=0,!n){var i=Math.pow(2,8*r-1);O(this,t,e,r,i-1,-i)}var o=0,a=1,s=0;for(this[e]=255&t;++o<r&&(a*=256);)t<0&&0===s&&0!==this[e+o-1]&&(s=1),this[e+o]=(t/a>>0)-s&255;return e+r},i.prototype.writeIntBE=function(t,e,r,n){if(t=+t,e>>>=0,!n){var i=Math.pow(2,8*r-1);O(this,t,e,r,i-1,-i)}var o=r-1,a=1,s=0;for(this[e+o]=255&t;--o>=0&&(a*=256);)t<0&&0===s&&0!==this[e+o+1]&&(s=1),this[e+o]=(t/a>>0)-s&255;return e+r},i.prototype.writeInt8=function(t,e,r){return t=+t,e>>>=0,r||O(this,t,e,1,127,-128),t<0&&(t=255+t+1),this[e]=255&t,e+1},i.prototype.writeInt16LE=function(t,e,r){return t=+t,e>>>=0,r||O(this,t,e,2,32767,-32768),this[e]=255&t,this[e+1]=t>>>8,e+2},i.prototype.writeInt16BE=function(t,e,r){return t=+t,e>>>=0,r||O(this,t,e,2,32767,-32768),this[e]=t>>>8,this[e+1]=255&t,e+2},i.prototype.writeInt32LE=function(t,e,r){return t=+t,e>>>=0,r||O(this,t,e,4,2147483647,-2147483648),this[e]=255&t,this[e+1]=t>>>8,this[e+2]=t>>>16,this[e+3]=t>>>24,e+4},i.prototype.writeInt32BE=function(t,e,r){return t=+t,e>>>=0,r||O(this,t,e,4,2147483647,-2147483648),t<0&&(t=4294967295+t+1),this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t,e+4},i.prototype.writeFloatLE=function(t,e,r){return N(this,t,e,!0,r)},i.prototype.writeFloatBE=function(t,e,r){return N(this,t,e,!1,r)},i.prototype.writeDoubleLE=function(t,e,r){return L(this,t,e,!0,r)},i.prototype.writeDoubleBE=function(t,e,r){return L(this,t,e,!1,r)},i.prototype.copy=function(t,e,r,n){if(!i.isBuffer(t))throw new TypeError("argument should be a Buffer");if(r||(r=0),n||0===n||(n=this.length),e>=t.length&&(e=t.length),e||(e=0),n>0&&n<r&&(n=r),n===r)return 0;if(0===t.length||0===this.length)return 0;if(e<0)throw new RangeError("targetStart out of bounds");if(r<0||r>=this.length)throw new RangeError("Index out of range");if(n<0)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),t.length-e<n-r&&(n=t.length-e+r);var o=n-r;if(this===t&&"function"==typeof Uint8Array.prototype.copyWithin)this.copyWithin(e,r,n);else if(this===t&&r<e&&e<n)for(var a=o-1;a>=0;--a)t[a+e]=this[a+r];else Uint8Array.prototype.set.call(t,this.subarray(r,n),e);return o},i.prototype.fill=function(t,e,r,n){if("string"==typeof t){if("string"==typeof e?(n=e,e=0,r=this.length):"string"==typeof r&&(n=r,r=this.length),void 0!==n&&"string"!=typeof n)throw new TypeError("encoding must be a string");if("string"==typeof n&&!i.isEncoding(n))throw new TypeError("Unknown encoding: "+n);if(1===t.length){var o=t.charCodeAt(0);("utf8"===n&&o<128||"latin1"===n)&&(t=o)}}else"number"==typeof t&&(t&=255);if(e<0||this.length<e||this.length<r)throw new RangeError("Out of range index");if(r<=e)return this;e>>>=0,r=void 0===r?this.length:r>>>0,t||(t=0);var a;if("number"==typeof t)for(a=e;a<r;++a)this[a]=t;else{var s=i.isBuffer(t)?t:i.from(t,n),f=s.length;if(0===f)throw new TypeError('The value "'+t+'" is invalid for argument "value"');for(a=0;a<r-e;++a)this[a+e]=s[a%f]}return this};var Z=/[^+\/0-9A-Za-z-_]/g},{17:17,425:425}],51:[function(t,e,r){function n(t){o.call(this),this.hashMode="string"==typeof t,this.hashMode?this[t]=this._finalOrDigest:this.final=this._finalOrDigest,this._final&&(this.__final=this._final,this._final=null),this._decoder=null,this._encoding=null}var i=t(471).Buffer,o=t(481).Transform,a=t(48).StringDecoder;t(427)(n,o),n.prototype.update=function(t,e,r){"string"==typeof t&&(t=i.from(t,e));var n=this._update(t);return this.hashMode?this:(r&&(n=this._toString(n,r)),n)},n.prototype.setAutoPadding=function(){},n.prototype.getAuthTag=function(){throw new Error("trying to get auth tag in unsupported state")},n.prototype.setAuthTag=function(){throw new Error("trying to set auth tag in unsupported state")},n.prototype.setAAD=function(){throw new Error("trying to set aad in unsupported state")},n.prototype._transform=function(t,e,r){var n;try{this.hashMode?this._update(t):this.push(this._update(t))}catch(t){n=t}finally{r(n)}},n.prototype._flush=function(t){var e;try{this.push(this.__final())}catch(t){e=t}t(e)},n.prototype._finalOrDigest=function(t){var e=this.__final()||i.alloc(0);return t&&(e=this._toString(e,t,!0)),e},n.prototype._toString=function(t,e,r){if(this._decoder||(this._decoder=new a(e),this._encoding=e),this._encoding!==e)throw new Error("can't switch encodings");var n=this._decoder.write(t);return r&&(n+=this._decoder.end()),n},e.exports=n},{427:427,471:471,48:48,481:481}],52:[function(t,e,r){t(178),e.exports=t(73).RegExp.escape},{178:178,73:73}],53:[function(t,e,r){e.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},{}],54:[function(t,e,r){var n=t(68);e.exports=function(t,e){if("number"!=typeof t&&"Number"!=n(t))throw TypeError(e);return+t}},{68:68}],55:[function(t,e,r){var n=t(176)("unscopables"),i=Array.prototype;void 0==i[n]&&t(92)(i,n,{}),e.exports=function(t){i[n][t]=!0}},{176:176,92:92}],56:[function(t,e,r){e.exports=function(t,e,r,n){if(!(t instanceof e)||void 0!==n&&n in t)throw TypeError(r+": incorrect invocation!");return t}},{}],57:[function(t,e,r){var n=t(101);e.exports=function(t){if(!n(t))throw TypeError(t+" is not an object!");return t}},{101:101}],58:[function(t,e,r){"use strict";var n=t(166),i=t(161),o=t(165);e.exports=[].copyWithin||function(t,e){var r=n(this),a=o(r.length),s=i(t,a),f=i(e,a),c=arguments.length>2?arguments[2]:void 0,u=Math.min((void 0===c?a:i(c,a))-f,a-s),h=1;for(f<s&&s<f+u&&(h=-1,f+=u-1,s+=u-1);u-- >0;)f in r?r[s]=r[f]:delete r[s],s+=h,f+=h;return r}},{161:161,165:165,166:166}],59:[function(t,e,r){"use strict";var n=t(166),i=t(161),o=t(165);e.exports=function(t){for(var e=n(this),r=o(e.length),a=arguments.length,s=i(a>1?arguments[1]:void 0,r),f=a>2?arguments[2]:void 0,c=void 0===f?r:i(f,r);c>s;)e[s++]=t;return e}},{161:161,165:165,166:166}],60:[function(t,e,r){var n=t(89);e.exports=function(t,e){var r=[];return n(t,!1,r.push,r,e),r}},{89:89}],61:[function(t,e,r){var n=t(164),i=t(165),o=t(161);e.exports=function(t){return function(e,r,a){var s,f=n(e),c=i(f.length),u=o(a,c);if(t&&r!=r){for(;c>u;)if((s=f[u++])!=s)return!0}else for(;c>u;u++)if((t||u in f)&&f[u]===r)return t||u||0;return!t&&-1}}},{161:161,164:164,165:165}],62:[function(t,e,r){var n=t(75),i=t(97),o=t(166),a=t(165),s=t(65);e.exports=function(t,e){var r=1==t,f=2==t,c=3==t,u=4==t,h=6==t,d=5==t||h,l=e||s;return function(e,s,p){for(var b,v,y=o(e),g=i(y),m=n(s,p,3),w=a(g.length),_=0,S=r?l(e,w):f?l(e,0):void 0;w>_;_++)if((d||_ in g)&&(b=g[_],v=m(b,_,y),t))if(r)S[_]=v;else if(v)switch(t){case 3:return!0;case 5:return b;case 6:return _;case 2:S.push(b)}else if(u)return!1;return h?-1:c||u?u:S}}},{165:165,166:166,65:65,75:75,97:97}],63:[function(t,e,r){var n=t(53),i=t(166),o=t(97),a=t(165);e.exports=function(t,e,r,s,f){n(e);var c=i(t),u=o(c),h=a(c.length),d=f?h-1:0,l=f?-1:1;if(r<2)for(;;){if(d in u){s=u[d],d+=l;break}if(d+=l,f?d<0:h<=d)throw TypeError("Reduce of empty array with no initial value")}for(;f?d>=0:h>d;d+=l)d in u&&(s=e(s,u[d],d,c));return s}},{165:165,166:166,53:53,97:97}],64:[function(t,e,r){var n=t(101),i=t(99),o=t(176)("species");e.exports=function(t){var e;return i(t)&&(e=t.constructor,"function"!=typeof e||e!==Array&&!i(e.prototype)||(e=void 0),n(e)&&null===(e=e[o])&&(e=void 0)),void 0===e?Array:e}},{101:101,176:176,99:99}],65:[function(t,e,r){var n=t(64);e.exports=function(t,e){return new(n(t))(e)}},{64:64}],66:[function(t,e,r){"use strict";var n=t(53),i=t(101),o=t(96),a=[].slice,s={},f=function(t,e,r){if(!(e in s)){for(var n=[],i=0;i<e;i++)n[i]="a["+i+"]";s[e]=Function("F,a","return new F("+n.join(",")+")")}return s[e](t,r)};e.exports=Function.bind||function(t){var e=n(this),r=a.call(arguments,1),s=function(){var n=r.concat(a.call(arguments));return this instanceof s?f(e,n.length,n):o(e,n,t)};return i(e.prototype)&&(s.prototype=e.prototype),s}},{101:101,53:53,96:96}],67:[function(t,e,r){var n=t(68),i=t(176)("toStringTag"),o="Arguments"==n(function(){return arguments}()),a=function(t,e){try{return t[e]}catch(t){}};e.exports=function(t){var e,r,s;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(r=a(e=Object(t),i))?r:o?n(e):"Object"==(s=n(e))&&"function"==typeof e.callee?"Arguments":s}},{176:176,68:68}],68:[function(t,e,r){var n={}.toString;e.exports=function(t){return n.call(t).slice(8,-1)}},{}],69:[function(t,e,r){"use strict";var n=t(121).f,i=t(120),o=t(140),a=t(75),s=t(56),f=t(89),c=t(105),u=t(107),h=t(147),d=t(79),l=t(115).fastKey,p=t(173),b=d?"_s":"size",v=function(t,e){var r,n=l(e);if("F"!==n)return t._i[n];for(r=t._f;r;r=r.n)if(r.k==e)return r};e.exports={getConstructor:function(t,e,r,c){var u=t(function(t,n){s(t,u,e,"_i"),t._t=e,t._i=i(null),t._f=void 0,t._l=void 0,t[b]=0,void 0!=n&&f(n,r,t[c],t)});return o(u.prototype,{clear:function(){for(var t=p(this,e),r=t._i,n=t._f;n;n=n.n)n.r=!0,n.p&&(n.p=n.p.n=void 0),delete r[n.i];t._f=t._l=void 0,t[b]=0},delete:function(t){var r=p(this,e),n=v(r,t);if(n){var i=n.n,o=n.p;delete r._i[n.i],n.r=!0,o&&(o.n=i),i&&(i.p=o),r._f==n&&(r._f=i),r._l==n&&(r._l=o),r[b]--}return!!n},forEach:function(t){p(this,e);for(var r,n=a(t,arguments.length>1?arguments[1]:void 0,3);r=r?r.n:this._f;)for(n(r.v,r.k,this);r&&r.r;)r=r.p},has:function(t){return!!v(p(this,e),t)}}),d&&n(u.prototype,"size",{get:function(){return p(this,e)[b]}}),u},def:function(t,e,r){var n,i,o=v(t,e);return o?o.v=r:(t._l=o={i:i=l(e,!0),k:e,v:r,p:n=t._l,n:void 0,r:!1},t._f||(t._f=o),n&&(n.n=o),t[b]++,"F"!==i&&(t._i[i]=o)),t},getEntry:v,setStrong:function(t,e,r){c(t,e,function(t,r){this._t=p(t,e),this._k=r,this._l=void 0},function(){for(var t=this,e=t._k,r=t._l;r&&r.r;)r=r.p;return t._t&&(t._l=r=r?r.n:t._t._f)?"keys"==e?u(0,r.k):"values"==e?u(0,r.v):u(0,[r.k,r.v]):(t._t=void 0,u(1))},r?"entries":"values",!r,!0),h(e)}}},{105:105,107:107,115:115,120:120,121:121,140:140,147:147,173:173,56:56,75:75,79:79,89:89}],70:[function(t,e,r){var n=t(67),i=t(60);e.exports=function(t){return function(){if(n(this)!=t)throw TypeError(t+"#toJSON isn't generic");return i(this)}}},{60:60,67:67}],71:[function(t,e,r){"use strict";var n=t(140),i=t(115).getWeak,o=t(57),a=t(101),s=t(56),f=t(89),c=t(62),u=t(91),h=t(173),d=c(5),l=c(6),p=0,b=function(t){return t._l||(t._l=new v)},v=function(){this.a=[]},y=function(t,e){return d(t.a,function(t){return t[0]===e})};v.prototype={get:function(t){var e=y(this,t);if(e)return e[1]},has:function(t){return!!y(this,t)},set:function(t,e){var r=y(this,t);r?r[1]=e:this.a.push([t,e])},delete:function(t){var e=l(this.a,function(e){return e[0]===t});return~e&&this.a.splice(e,1),!!~e}},e.exports={getConstructor:function(t,e,r,o){var c=t(function(t,n){s(t,c,e,"_i"),t._t=e,t._i=p++,t._l=void 0,void 0!=n&&f(n,r,t[o],t)});return n(c.prototype,{delete:function(t){if(!a(t))return!1;var r=i(t);return!0===r?b(h(this,e)).delete(t):r&&u(r,this._i)&&delete r[this._i]},has:function(t){if(!a(t))return!1;var r=i(t);return!0===r?b(h(this,e)).has(t):r&&u(r,this._i)}}),c},def:function(t,e,r){var n=i(o(e),!0);return!0===n?b(t).set(e,r):n[t._i]=r,t},ufstore:b}},{101:101,115:115,
140:140,173:173,56:56,57:57,62:62,89:89,91:91}],72:[function(t,e,r){"use strict";var n=t(90),i=t(83),o=t(141),a=t(140),s=t(115),f=t(89),c=t(56),u=t(101),h=t(85),d=t(106),l=t(148),p=t(95);e.exports=function(t,e,r,b,v,y){var g=n[t],m=g,w=v?"set":"add",_=m&&m.prototype,S={},E=function(t){var e=_[t];o(_,t,"delete"==t?function(t){return!(y&&!u(t))&&e.call(this,0===t?0:t)}:"has"==t?function(t){return!(y&&!u(t))&&e.call(this,0===t?0:t)}:"get"==t?function(t){return y&&!u(t)?void 0:e.call(this,0===t?0:t)}:"add"==t?function(t){return e.call(this,0===t?0:t),this}:function(t,r){return e.call(this,0===t?0:t,r),this})};if("function"==typeof m&&(y||_.forEach&&!h(function(){(new m).entries().next()}))){var k=new m,M=k[w](y?{}:-0,1)!=k,A=h(function(){k.has(1)}),x=d(function(t){new m(t)}),I=!y&&h(function(){for(var t=new m,e=5;e--;)t[w](e,e);return!t.has(-0)});x||(m=e(function(e,r){c(e,m,t);var n=p(new g,e,m);return void 0!=r&&f(r,v,n[w],n),n}),m.prototype=_,_.constructor=m),(A||I)&&(E("delete"),E("has"),v&&E("get")),(I||M)&&E(w),y&&_.clear&&delete _.clear}else m=b.getConstructor(e,t,v,w),a(m.prototype,r),s.NEED=!0;return l(m,t),S[t]=m,i(i.G+i.W+i.F*(m!=g),S),y||b.setStrong(m,t,v),m}},{101:101,106:106,115:115,140:140,141:141,148:148,56:56,83:83,85:85,89:89,90:90,95:95}],73:[function(t,e,r){var n=e.exports={version:"2.5.7"};"number"==typeof __e&&(__e=n)},{}],74:[function(t,e,r){"use strict";var n=t(121),i=t(139);e.exports=function(t,e,r){e in t?n.f(t,e,i(0,r)):t[e]=r}},{121:121,139:139}],75:[function(t,e,r){var n=t(53);e.exports=function(t,e,r){if(n(t),void 0===e)return t;switch(r){case 1:return function(r){return t.call(e,r)};case 2:return function(r,n){return t.call(e,r,n)};case 3:return function(r,n,i){return t.call(e,r,n,i)}}return function(){return t.apply(e,arguments)}}},{53:53}],76:[function(t,e,r){"use strict";var n=t(85),i=Date.prototype.getTime,o=Date.prototype.toISOString,a=function(t){return t>9?t:"0"+t};e.exports=n(function(){return"0385-07-25T07:06:39.999Z"!=o.call(new Date(-5e13-1))})||!n(function(){o.call(new Date(NaN))})?function(){if(!isFinite(i.call(this)))throw RangeError("Invalid time value");var t=this,e=t.getUTCFullYear(),r=t.getUTCMilliseconds(),n=e<0?"-":e>9999?"+":"";return n+("00000"+Math.abs(e)).slice(n?-6:-4)+"-"+a(t.getUTCMonth()+1)+"-"+a(t.getUTCDate())+"T"+a(t.getUTCHours())+":"+a(t.getUTCMinutes())+":"+a(t.getUTCSeconds())+"."+(r>99?r:"0"+a(r))+"Z"}:o},{85:85}],77:[function(t,e,r){"use strict";var n=t(57),i=t(167);e.exports=function(t){if("string"!==t&&"number"!==t&&"default"!==t)throw TypeError("Incorrect hint");return i(n(this),"number"!=t)}},{167:167,57:57}],78:[function(t,e,r){e.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},{}],79:[function(t,e,r){e.exports=!t(85)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},{85:85}],80:[function(t,e,r){var n=t(101),i=t(90).document,o=n(i)&&n(i.createElement);e.exports=function(t){return o?i.createElement(t):{}}},{101:101,90:90}],81:[function(t,e,r){e.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},{}],82:[function(t,e,r){var n=t(130),i=t(127),o=t(131);e.exports=function(t){var e=n(t),r=i.f;if(r)for(var a,s=r(t),f=o.f,c=0;s.length>c;)f.call(t,a=s[c++])&&e.push(a);return e}},{127:127,130:130,131:131}],83:[function(t,e,r){var n=t(90),i=t(73),o=t(92),a=t(141),s=t(75),f=function(t,e,r){var c,u,h,d,l=t&f.F,p=t&f.G,b=t&f.S,v=t&f.P,y=t&f.B,g=p?n:b?n[e]||(n[e]={}):(n[e]||{}).prototype,m=p?i:i[e]||(i[e]={}),w=m.prototype||(m.prototype={});p&&(r=e);for(c in r)u=!l&&g&&void 0!==g[c],h=(u?g:r)[c],d=y&&u?s(h,n):v&&"function"==typeof h?s(Function.call,h):h,g&&a(g,c,h,t&f.U),m[c]!=h&&o(m,c,d),v&&w[c]!=h&&(w[c]=h)};n.core=i,f.F=1,f.G=2,f.S=4,f.P=8,f.B=16,f.W=32,f.U=64,f.R=128,e.exports=f},{141:141,73:73,75:75,90:90,92:92}],84:[function(t,e,r){var n=t(176)("match");e.exports=function(t){var e=/./;try{"/./"[t](e)}catch(r){try{return e[n]=!1,!"/./"[t](e)}catch(t){}}return!0}},{176:176}],85:[function(t,e,r){e.exports=function(t){try{return!!t()}catch(t){return!0}}},{}],86:[function(t,e,r){"use strict";var n=t(92),i=t(141),o=t(85),a=t(78),s=t(176);e.exports=function(t,e,r){var f=s(t),c=r(a,f,""[t]),u=c[0],h=c[1];o(function(){var e={};return e[f]=function(){return 7},7!=""[t](e)})&&(i(String.prototype,t,u),n(RegExp.prototype,f,2==e?function(t,e){return h.call(t,this,e)}:function(t){return h.call(t,this)}))}},{141:141,176:176,78:78,85:85,92:92}],87:[function(t,e,r){"use strict";var n=t(57);e.exports=function(){var t=n(this),e="";return t.global&&(e+="g"),t.ignoreCase&&(e+="i"),t.multiline&&(e+="m"),t.unicode&&(e+="u"),t.sticky&&(e+="y"),e}},{57:57}],88:[function(t,e,r){"use strict";function n(t,e,r,c,u,h,d,l){for(var p,b,v=u,y=0,g=!!d&&s(d,l,3);y<c;){if(y in r){if(p=g?g(r[y],y,e):r[y],b=!1,o(p)&&(b=p[f],b=void 0!==b?!!b:i(p)),b&&h>0)v=n(t,e,p,a(p.length),v,h-1)-1;else{if(v>=9007199254740991)throw TypeError();t[v]=p}v++}y++}return v}var i=t(99),o=t(101),a=t(165),s=t(75),f=t(176)("isConcatSpreadable");e.exports=n},{101:101,165:165,176:176,75:75,99:99}],89:[function(t,e,r){var n=t(75),i=t(103),o=t(98),a=t(57),s=t(165),f=t(177),c={},u={},r=e.exports=function(t,e,r,h,d){var l,p,b,v,y=d?function(){return t}:f(t),g=n(r,h,e?2:1),m=0;if("function"!=typeof y)throw TypeError(t+" is not iterable!");if(o(y)){for(l=s(t.length);l>m;m++)if((v=e?g(a(p=t[m])[0],p[1]):g(t[m]))===c||v===u)return v}else for(b=y.call(t);!(p=b.next()).done;)if((v=i(b,g,p.value,e))===c||v===u)return v};r.BREAK=c,r.RETURN=u},{103:103,165:165,177:177,57:57,75:75,98:98}],90:[function(t,e,r){var n=e.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},{}],91:[function(t,e,r){var n={}.hasOwnProperty;e.exports=function(t,e){return n.call(t,e)}},{}],92:[function(t,e,r){var n=t(121),i=t(139);e.exports=t(79)?function(t,e,r){return n.f(t,e,i(1,r))}:function(t,e,r){return t[e]=r,t}},{121:121,139:139,79:79}],93:[function(t,e,r){var n=t(90).document;e.exports=n&&n.documentElement},{90:90}],94:[function(t,e,r){e.exports=!t(79)&&!t(85)(function(){return 7!=Object.defineProperty(t(80)("div"),"a",{get:function(){return 7}}).a})},{79:79,80:80,85:85}],95:[function(t,e,r){var n=t(101),i=t(146).set;e.exports=function(t,e,r){var o,a=e.constructor;return a!==r&&"function"==typeof a&&(o=a.prototype)!==r.prototype&&n(o)&&i&&i(t,o),t}},{101:101,146:146}],96:[function(t,e,r){e.exports=function(t,e,r){var n=void 0===r;switch(e.length){case 0:return n?t():t.call(r);case 1:return n?t(e[0]):t.call(r,e[0]);case 2:return n?t(e[0],e[1]):t.call(r,e[0],e[1]);case 3:return n?t(e[0],e[1],e[2]):t.call(r,e[0],e[1],e[2]);case 4:return n?t(e[0],e[1],e[2],e[3]):t.call(r,e[0],e[1],e[2],e[3])}return t.apply(r,e)}},{}],97:[function(t,e,r){var n=t(68);e.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==n(t)?t.split(""):Object(t)}},{68:68}],98:[function(t,e,r){var n=t(108),i=t(176)("iterator"),o=Array.prototype;e.exports=function(t){return void 0!==t&&(n.Array===t||o[i]===t)}},{108:108,176:176}],99:[function(t,e,r){var n=t(68);e.exports=Array.isArray||function(t){return"Array"==n(t)}},{68:68}],100:[function(t,e,r){var n=t(101),i=Math.floor;e.exports=function(t){return!n(t)&&isFinite(t)&&i(t)===t}},{101:101}],101:[function(t,e,r){e.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},{}],102:[function(t,e,r){var n=t(101),i=t(68),o=t(176)("match");e.exports=function(t){var e;return n(t)&&(void 0!==(e=t[o])?!!e:"RegExp"==i(t))}},{101:101,176:176,68:68}],103:[function(t,e,r){var n=t(57);e.exports=function(t,e,r,i){try{return i?e(n(r)[0],r[1]):e(r)}catch(e){var o=t.return;throw void 0!==o&&n(o.call(t)),e}}},{57:57}],104:[function(t,e,r){"use strict";var n=t(120),i=t(139),o=t(148),a={};t(92)(a,t(176)("iterator"),function(){return this}),e.exports=function(t,e,r){t.prototype=n(a,{next:i(1,r)}),o(t,e+" Iterator")}},{120:120,139:139,148:148,176:176,92:92}],105:[function(t,e,r){"use strict";var n=t(109),i=t(83),o=t(141),a=t(92),s=t(108),f=t(104),c=t(148),u=t(128),h=t(176)("iterator"),d=!([].keys&&"next"in[].keys()),l=function(){return this};e.exports=function(t,e,r,p,b,v,y){f(r,e,p);var g,m,w,_=function(t){if(!d&&t in M)return M[t];switch(t){case"keys":case"values":return function(){return new r(this,t)}}return function(){return new r(this,t)}},S=e+" Iterator",E="values"==b,k=!1,M=t.prototype,A=M[h]||M["@@iterator"]||b&&M[b],x=A||_(b),I=b?E?_("entries"):x:void 0,R="Array"==e?M.entries||A:A;if(R&&(w=u(R.call(new t)))!==Object.prototype&&w.next&&(c(w,S,!0),n||"function"==typeof w[h]||a(w,h,l)),E&&A&&"values"!==A.name&&(k=!0,x=function(){return A.call(this)}),n&&!y||!d&&!k&&M[h]||a(M,h,x),s[e]=x,s[S]=l,b)if(g={values:E?x:_("values"),keys:v?x:_("keys"),entries:I},y)for(m in g)m in M||o(M,m,g[m]);else i(i.P+i.F*(d||k),e,g);return g}},{104:104,108:108,109:109,128:128,141:141,148:148,176:176,83:83,92:92}],106:[function(t,e,r){var n=t(176)("iterator"),i=!1;try{var o=[7][n]();o.return=function(){i=!0},Array.from(o,function(){throw 2})}catch(t){}e.exports=function(t,e){if(!e&&!i)return!1;var r=!1;try{var o=[7],a=o[n]();a.next=function(){return{done:r=!0}},o[n]=function(){return a},t(o)}catch(t){}return r}},{176:176}],107:[function(t,e,r){e.exports=function(t,e){return{value:e,done:!!t}}},{}],108:[function(t,e,r){e.exports={}},{}],109:[function(t,e,r){e.exports=!1},{}],110:[function(t,e,r){var n=Math.expm1;e.exports=!n||n(10)>22025.465794806718||n(10)<22025.465794806718||-2e-17!=n(-2e-17)?function(t){return 0==(t=+t)?t:t>-1e-6&&t<1e-6?t+t*t/2:Math.exp(t)-1}:n},{}],111:[function(t,e,r){var n=t(114),i=Math.pow,o=i(2,-52),a=i(2,-23),s=i(2,127)*(2-a),f=i(2,-126),c=function(t){return t+1/o-1/o};e.exports=Math.fround||function(t){var e,r,i=Math.abs(t),u=n(t);return i<f?u*c(i/f/a)*f*a:(e=(1+a/o)*i,r=e-(e-i),r>s||r!=r?u*(1/0):u*r)}},{114:114}],112:[function(t,e,r){e.exports=Math.log1p||function(t){return(t=+t)>-1e-8&&t<1e-8?t-t*t/2:Math.log(1+t)}},{}],113:[function(t,e,r){e.exports=Math.scale||function(t,e,r,n,i){return 0===arguments.length||t!=t||e!=e||r!=r||n!=n||i!=i?NaN:t===1/0||t===-1/0?t:(t-e)*(i-n)/(r-e)+n}},{}],114:[function(t,e,r){e.exports=Math.sign||function(t){return 0==(t=+t)||t!=t?t:t<0?-1:1}},{}],115:[function(t,e,r){var n=t(171)("meta"),i=t(101),o=t(91),a=t(121).f,s=0,f=Object.isExtensible||function(){return!0},c=!t(85)(function(){return f(Object.preventExtensions({}))}),u=function(t){a(t,n,{value:{i:"O"+ ++s,w:{}}})},h=function(t,e){if(!i(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!o(t,n)){if(!f(t))return"F";if(!e)return"E";u(t)}return t[n].i},d=function(t,e){if(!o(t,n)){if(!f(t))return!0;if(!e)return!1;u(t)}return t[n].w},l=function(t){return c&&p.NEED&&f(t)&&!o(t,n)&&u(t),t},p=e.exports={KEY:n,NEED:!1,fastKey:h,getWeak:d,onFreeze:l}},{101:101,121:121,171:171,85:85,91:91}],116:[function(t,e,r){var n=t(208),i=t(83),o=t(150)("metadata"),a=o.store||(o.store=new(t(314))),s=function(t,e,r){var i=a.get(t);if(!i){if(!r)return;a.set(t,i=new n)}var o=i.get(e);if(!o){if(!r)return;i.set(e,o=new n)}return o},f=function(t,e,r){var n=s(e,r,!1);return void 0!==n&&n.has(t)},c=function(t,e,r){var n=s(e,r,!1);return void 0===n?void 0:n.get(t)},u=function(t,e,r,n){s(r,n,!0).set(t,e)},h=function(t,e){var r=s(t,e,!1),n=[];return r&&r.forEach(function(t,e){n.push(e)}),n},d=function(t){return void 0===t||"symbol"==typeof t?t:String(t)},l=function(t){i(i.S,"Reflect",t)};e.exports={store:a,map:s,has:f,get:c,set:u,keys:h,key:d,exp:l}},{150:150,208:208,314:314,83:83}],117:[function(t,e,r){var n=t(90),i=t(160).set,o=n.MutationObserver||n.WebKitMutationObserver,a=n.process,s=n.Promise,f="process"==t(68)(a);e.exports=function(){var t,e,r,c=function(){var n,i;for(f&&(n=a.domain)&&n.exit();t;){i=t.fn,t=t.next;try{i()}catch(n){throw t?r():e=void 0,n}}e=void 0,n&&n.enter()};if(f)r=function(){a.nextTick(c)};else if(!o||n.navigator&&n.navigator.standalone)if(s&&s.resolve){var u=s.resolve(void 0);r=function(){u.then(c)}}else r=function(){i.call(n,c)};else{var h=!0,d=document.createTextNode("");new o(c).observe(d,{characterData:!0}),r=function(){d.data=h=!h}}return function(n){var i={fn:n,next:void 0};e&&(e.next=i),t||(t=i,r()),e=i}}},{160:160,68:68,90:90}],118:[function(t,e,r){"use strict";function n(t){var e,r;this.promise=new t(function(t,n){if(void 0!==e||void 0!==r)throw TypeError("Bad Promise constructor");e=t,r=n}),this.resolve=i(e),this.reject=i(r)}var i=t(53);e.exports.f=function(t){return new n(t)}},{53:53}],119:[function(t,e,r){"use strict";var n=t(130),i=t(127),o=t(131),a=t(166),s=t(97),f=Object.assign;e.exports=!f||t(85)(function(){var t={},e={},r=Symbol(),n="abcdefghijklmnopqrst";return t[r]=7,n.split("").forEach(function(t){e[t]=t}),7!=f({},t)[r]||Object.keys(f({},e)).join("")!=n})?function(t,e){for(var r=a(t),f=arguments.length,c=1,u=i.f,h=o.f;f>c;)for(var d,l=s(arguments[c++]),p=u?n(l).concat(u(l)):n(l),b=p.length,v=0;b>v;)h.call(l,d=p[v++])&&(r[d]=l[d]);return r}:f},{127:127,130:130,131:131,166:166,85:85,97:97}],120:[function(t,e,r){var n=t(57),i=t(122),o=t(81),a=t(149)("IE_PROTO"),s=function(){},f=function(){var e,r=t(80)("iframe"),n=o.length;for(r.style.display="none",t(93).appendChild(r),r.src="javascript:",e=r.contentWindow.document,e.open(),e.write("<script>document.F=Object<\/script>"),e.close(),f=e.F;n--;)delete f.prototype[o[n]];return f()};e.exports=Object.create||function(t,e){var r;return null!==t?(s.prototype=n(t),r=new s,s.prototype=null,r[a]=t):r=f(),void 0===e?r:i(r,e)}},{122:122,149:149,57:57,80:80,81:81,93:93}],121:[function(t,e,r){var n=t(57),i=t(94),o=t(167),a=Object.defineProperty;r.f=t(79)?Object.defineProperty:function(t,e,r){if(n(t),e=o(e,!0),n(r),i)try{return a(t,e,r)}catch(t){}if("get"in r||"set"in r)throw TypeError("Accessors not supported!");return"value"in r&&(t[e]=r.value),t}},{167:167,57:57,79:79,94:94}],122:[function(t,e,r){var n=t(121),i=t(57),o=t(130);e.exports=t(79)?Object.defineProperties:function(t,e){i(t);for(var r,a=o(e),s=a.length,f=0;s>f;)n.f(t,r=a[f++],e[r]);return t}},{121:121,130:130,57:57,79:79}],123:[function(t,e,r){"use strict";e.exports=t(109)||!t(85)(function(){var e=Math.random();__defineSetter__.call(null,e,function(){}),delete t(90)[e]})},{109:109,85:85,90:90}],124:[function(t,e,r){var n=t(131),i=t(139),o=t(164),a=t(167),s=t(91),f=t(94),c=Object.getOwnPropertyDescriptor;r.f=t(79)?c:function(t,e){if(t=o(t),e=a(e,!0),f)try{return c(t,e)}catch(t){}if(s(t,e))return i(!n.f.call(t,e),t[e])}},{131:131,139:139,164:164,167:167,79:79,91:91,94:94}],125:[function(t,e,r){var n=t(164),i=t(126).f,o={}.toString,a="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],s=function(t){try{return i(t)}catch(t){return a.slice()}};e.exports.f=function(t){return a&&"[object Window]"==o.call(t)?s(t):i(n(t))}},{126:126,164:164}],126:[function(t,e,r){var n=t(129),i=t(81).concat("length","prototype");r.f=Object.getOwnPropertyNames||function(t){return n(t,i)}},{129:129,81:81}],127:[function(t,e,r){r.f=Object.getOwnPropertySymbols},{}],128:[function(t,e,r){var n=t(91),i=t(166),o=t(149)("IE_PROTO"),a=Object.prototype;e.exports=Object.getPrototypeOf||function(t){return t=i(t),n(t,o)?t[o]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?a:null}},{149:149,166:166,91:91}],129:[function(t,e,r){var n=t(91),i=t(164),o=t(61)(!1),a=t(149)("IE_PROTO");e.exports=function(t,e){var r,s=i(t),f=0,c=[];for(r in s)r!=a&&n(s,r)&&c.push(r);for(;e.length>f;)n(s,r=e[f++])&&(~o(c,r)||c.push(r));return c}},{149:149,164:164,61:61,91:91}],130:[function(t,e,r){var n=t(129),i=t(81);e.exports=Object.keys||function(t){return n(t,i)}},{129:129,81:81}],131:[function(t,e,r){r.f={}.propertyIsEnumerable},{}],132:[function(t,e,r){var n=t(83),i=t(73),o=t(85);e.exports=function(t,e){var r=(i.Object||{})[t]||Object[t],a={};a[t]=e(r),n(n.S+n.F*o(function(){r(1)}),"Object",a)}},{73:73,83:83,85:85}],133:[function(t,e,r){var n=t(130),i=t(164),o=t(131).f;e.exports=function(t){return function(e){for(var r,a=i(e),s=n(a),f=s.length,c=0,u=[];f>c;)o.call(a,r=s[c++])&&u.push(t?[r,a[r]]:a[r]);return u}}},{130:130,131:131,164:164}],134:[function(t,e,r){var n=t(126),i=t(127),o=t(57),a=t(90).Reflect;e.exports=a&&a.ownKeys||function(t){var e=n.f(o(t)),r=i.f;return r?e.concat(r(t)):e}},{126:126,127:127,57:57,90:90}],135:[function(t,e,r){var n=t(90).parseFloat,i=t(158).trim;e.exports=1/n(t(159)+"-0")!=-1/0?function(t){var e=i(String(t),3),r=n(e);return 0===r&&"-"==e.charAt(0)?-0:r}:n},{158:158,159:159,90:90}],136:[function(t,e,r){var n=t(90).parseInt,i=t(158).trim,o=t(159),a=/^[-+]?0[xX]/;e.exports=8!==n(o+"08")||22!==n(o+"0x16")?function(t,e){var r=i(String(t),3);return n(r,e>>>0||(a.test(r)?16:10))}:n},{158:158,159:159,90:90}],137:[function(t,e,r){e.exports=function(t){try{return{e:!1,v:t()}}catch(t){return{e:!0,v:t}}}},{}],138:[function(t,e,r){var n=t(57),i=t(101),o=t(118);e.exports=function(t,e){if(n(t),i(e)&&e.constructor===t)return e;var r=o.f(t);return(0,r.resolve)(e),r.promise}},{101:101,118:118,57:57}],139:[function(t,e,r){e.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},{}],140:[function(t,e,r){var n=t(141);e.exports=function(t,e,r){for(var i in e)n(t,i,e[i],r);return t}},{141:141}],141:[function(t,e,r){var n=t(90),i=t(92),o=t(91),a=t(171)("src"),s=Function.toString,f=(""+s).split("toString");t(73).inspectSource=function(t){return s.call(t)},(e.exports=function(t,e,r,s){var c="function"==typeof r;c&&(o(r,"name")||i(r,"name",e)),t[e]!==r&&(c&&(o(r,a)||i(r,a,t[e]?""+t[e]:f.join(String(e)))),t===n?t[e]=r:s?t[e]?t[e]=r:i(t,e,r):(delete t[e],i(t,e,r)))})(Function.prototype,"toString",function(){return"function"==typeof this&&this[a]||s.call(this)})},{171:171,73:73,90:90,91:91,92:92}],142:[function(t,e,r){e.exports=function(t,e){var r=e===Object(e)?function(t){return e[t]}:e;return function(e){return String(e).replace(t,r)}}},{}],143:[function(t,e,r){e.exports=Object.is||function(t,e){return t===e?0!==t||1/t==1/e:t!=t&&e!=e}},{}],144:[function(t,e,r){"use strict";var n=t(83),i=t(53),o=t(75),a=t(89);e.exports=function(t){n(n.S,t,{from:function(t){var e,r,n,s,f=arguments[1];return i(this),e=void 0!==f,e&&i(f),void 0==t?new this:(r=[],e?(n=0,s=o(f,arguments[2],2),a(t,!1,function(t){r.push(s(t,n++))})):a(t,!1,r.push,r),new this(r))}})}},{53:53,75:75,83:83,89:89}],145:[function(t,e,r){"use strict";var n=t(83);e.exports=function(t){n(n.S,t,{of:function(){for(var t=arguments.length,e=new Array(t);t--;)e[t]=arguments[t];return new this(e)}})}},{83:83}],146:[function(t,e,r){var n=t(101),i=t(57),o=function(t,e){if(i(t),!n(e)&&null!==e)throw TypeError(e+": can't set as prototype!")};e.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(e,r,n){try{n=t(75)(Function.call,t(124).f(Object.prototype,"__proto__").set,2),n(e,[]),r=!(e instanceof Array)}catch(t){r=!0}return function(t,e){return o(t,e),r?t.__proto__=e:n(t,e),t}}({},!1):void 0),check:o}},{101:101,124:124,57:57,75:75}],147:[function(t,e,r){"use strict";var n=t(90),i=t(121),o=t(79),a=t(176)("species");e.exports=function(t){var e=n[t];o&&e&&!e[a]&&i.f(e,a,{configurable:!0,get:function(){return this}})}},{121:121,176:176,79:79,90:90}],148:[function(t,e,r){var n=t(121).f,i=t(91),o=t(176)("toStringTag");e.exports=function(t,e,r){t&&!i(t=r?t:t.prototype,o)&&n(t,o,{configurable:!0,value:e})}},{121:121,176:176,91:91}],149:[function(t,e,r){var n=t(150)("keys"),i=t(171);e.exports=function(t){return n[t]||(n[t]=i(t))}},{150:150,171:171}],150:[function(t,e,r){var n=t(73),i=t(90),o=i["__core-js_shared__"]||(i["__core-js_shared__"]={});(e.exports=function(t,e){return o[t]||(o[t]=void 0!==e?e:{})})("versions",[]).push({version:n.version,mode:t(109)?"pure":"global",copyright:"© 2018 Denis Pushkarev (zloirock.ru)"})},{109:109,73:73,90:90}],151:[function(t,e,r){var n=t(57),i=t(53),o=t(176)("species");e.exports=function(t,e){var r,a=n(t).constructor;return void 0===a||void 0==(r=n(a)[o])?e:i(r)}},{176:176,53:53,57:57}],152:[function(t,e,r){"use strict";var n=t(85);e.exports=function(t,e){return!!t&&n(function(){e?t.call(null,function(){},1):t.call(null)})}},{85:85}],153:[function(t,e,r){var n=t(163),i=t(78);e.exports=function(t){return function(e,r){var o,a,s=String(i(e)),f=n(r),c=s.length;return f<0||f>=c?t?"":void 0:(o=s.charCodeAt(f),o<55296||o>56319||f+1===c||(a=s.charCodeAt(f+1))<56320||a>57343?t?s.charAt(f):o:t?s.slice(f,f+2):a-56320+(o-55296<<10)+65536)}}},{163:163,78:78}],154:[function(t,e,r){var n=t(102),i=t(78);e.exports=function(t,e,r){if(n(e))throw TypeError("String#"+r+" doesn't accept regex!");return String(i(t))}},{102:102,78:78}],155:[function(t,e,r){var n=t(83),i=t(85),o=t(78),a=/"/g,s=function(t,e,r,n){var i=String(o(t)),s="<"+e;return""!==r&&(s+=" "+r+'="'+String(n).replace(a,"&quot;")+'"'),s+">"+i+"</"+e+">"};e.exports=function(t,e){var r={};r[t]=e(s),n(n.P+n.F*i(function(){var e=""[t]('"');return e!==e.toLowerCase()||e.split('"').length>3}),"String",r)}},{78:78,83:83,85:85}],156:[function(t,e,r){var n=t(165),i=t(157),o=t(78);e.exports=function(t,e,r,a){var s=String(o(t)),f=s.length,c=void 0===r?" ":String(r),u=n(e);if(u<=f||""==c)return s;var h=u-f,d=i.call(c,Math.ceil(h/c.length));return d.length>h&&(d=d.slice(0,h)),a?d+s:s+d}},{157:157,165:165,78:78}],157:[function(t,e,r){"use strict";var n=t(163),i=t(78);e.exports=function(t){var e=String(i(this)),r="",o=n(t);if(o<0||o==1/0)throw RangeError("Count can't be negative");for(;o>0;(o>>>=1)&&(e+=e))1&o&&(r+=e);return r}},{163:163,78:78}],158:[function(t,e,r){var n=t(83),i=t(78),o=t(85),a=t(159),s="["+a+"]",f="​",c=RegExp("^"+s+s+"*"),u=RegExp(s+s+"*$"),h=function(t,e,r){var i={},s=o(function(){return!!a[t]()||f[t]()!=f}),c=i[t]=s?e(d):a[t];r&&(i[r]=c),n(n.P+n.F*s,"String",i)},d=h.trim=function(t,e){return t=String(i(t)),1&e&&(t=t.replace(c,"")),2&e&&(t=t.replace(u,"")),t};e.exports=h},{159:159,78:78,83:83,85:85}],159:[function(t,e,r){e.exports="\t\n\v\f\r   ᠎             　\u2028\u2029\ufeff"},{}],160:[function(t,e,r){var n,i,o,a=t(75),s=t(96),f=t(93),c=t(80),u=t(90),h=u.process,d=u.setImmediate,l=u.clearImmediate,p=u.MessageChannel,b=u.Dispatch,v=0,y={},g=function(){var t=+this;if(y.hasOwnProperty(t)){var e=y[t];delete y[t],e()}},m=function(t){g.call(t.data)};d&&l||(d=function(t){for(var e=[],r=1;arguments.length>r;)e.push(arguments[r++]);return y[++v]=function(){s("function"==typeof t?t:Function(t),e)},n(v),v},l=function(t){delete y[t]},"process"==t(68)(h)?n=function(t){h.nextTick(a(g,t,1))}:b&&b.now?n=function(t){b.now(a(g,t,1))}:p?(i=new p,o=i.port2,i.port1.onmessage=m,n=a(o.postMessage,o,1)):u.addEventListener&&"function"==typeof postMessage&&!u.importScripts?(n=function(t){u.postMessage(t+"","*")},u.addEventListener("message",m,!1)):n="onreadystatechange"in c("script")?function(t){f.appendChild(c("script")).onreadystatechange=function(){f.removeChild(this),g.call(t)}}:function(t){setTimeout(a(g,t,1),0)}),e.exports={set:d,clear:l}},{68:68,75:75,80:80,90:90,93:93,96:96}],161:[function(t,e,r){var n=t(163),i=Math.max,o=Math.min;e.exports=function(t,e){return t=n(t),t<0?i(t+e,0):o(t,e)}},{163:163}],162:[function(t,e,r){var n=t(163),i=t(165);e.exports=function(t){if(void 0===t)return 0;var e=n(t),r=i(e);if(e!==r)throw RangeError("Wrong length!");return r}},{163:163,165:165}],163:[function(t,e,r){var n=Math.ceil,i=Math.floor;e.exports=function(t){return isNaN(t=+t)?0:(t>0?i:n)(t)}},{}],164:[function(t,e,r){var n=t(97),i=t(78);e.exports=function(t){return n(i(t))}},{78:78,97:97}],165:[function(t,e,r){var n=t(163),i=Math.min;e.exports=function(t){return t>0?i(n(t),9007199254740991):0}},{163:163}],166:[function(t,e,r){var n=t(78);e.exports=function(t){return Object(n(t))}},{78:78}],167:[function(t,e,r){var n=t(101);e.exports=function(t,e){if(!n(t))return t;var r,i;if(e&&"function"==typeof(r=t.toString)&&!n(i=r.call(t)))return i;if("function"==typeof(r=t.valueOf)&&!n(i=r.call(t)))return i;if(!e&&"function"==typeof(r=t.toString)&&!n(i=r.call(t)))return i;throw TypeError("Can't convert object to primitive value")}},{101:101}],168:[function(t,e,r){"use strict";if(t(79)){var n=t(109),i=t(90),o=t(85),a=t(83),s=t(170),f=t(169),c=t(75),u=t(56),h=t(139),d=t(92),l=t(140),p=t(163),b=t(165),v=t(162),y=t(161),g=t(167),m=t(91),w=t(67),_=t(101),S=t(166),E=t(98),k=t(120),M=t(128),A=t(126).f,x=t(177),I=t(171),R=t(176),B=t(62),T=t(61),P=t(151),C=t(189),O=t(108),j=t(106),N=t(147),L=t(59),D=t(58),F=t(121),U=t(124),q=F.f,z=U.f,V=i.RangeError,G=i.TypeError,K=i.Uint8Array,W=Array.prototype,H=f.ArrayBuffer,X=f.DataView,J=B(0),Y=B(2),Z=B(3),Q=B(4),$=B(5),tt=B(6),et=T(!0),rt=T(!1),nt=C.values,it=C.keys,ot=C.entries,at=W.lastIndexOf,st=W.reduce,ft=W.reduceRight,ct=W.join,ut=W.sort,ht=W.slice,dt=W.toString,lt=W.toLocaleString,pt=R("iterator"),bt=R("toStringTag"),vt=I("typed_constructor"),yt=I("def_constructor"),gt=s.CONSTR,mt=s.TYPED,wt=s.VIEW,_t=B(1,function(t,e){return At(P(t,t[yt]),e)}),St=o(function(){return 1===new K(new Uint16Array([1]).buffer)[0]}),Et=!!K&&!!K.prototype.set&&o(function(){new K(1).set({})}),kt=function(t,e){var r=p(t);if(r<0||r%e)throw V("Wrong offset!");return r},Mt=function(t){if(_(t)&&mt in t)return t;throw G(t+" is not a typed array!")},At=function(t,e){if(!(_(t)&&vt in t))throw G("It is not a typed array constructor!");return new t(e)},xt=function(t,e){return It(P(t,t[yt]),e)},It=function(t,e){for(var r=0,n=e.length,i=At(t,n);n>r;)i[r]=e[r++];return i},Rt=function(t,e,r){q(t,e,{get:function(){return this._d[r]}})},Bt=function(t){var e,r,n,i,o,a,s=S(t),f=arguments.length,u=f>1?arguments[1]:void 0,h=void 0!==u,d=x(s);if(void 0!=d&&!E(d)){for(a=d.call(s),n=[],e=0;!(o=a.next()).done;e++)n.push(o.value);s=n}for(h&&f>2&&(u=c(u,arguments[2],2)),e=0,r=b(s.length),i=At(this,r);r>e;e++)i[e]=h?u(s[e],e):s[e];return i},Tt=function(){for(var t=0,e=arguments.length,r=At(this,e);e>t;)r[t]=arguments[t++];return r},Pt=!!K&&o(function(){lt.call(new K(1))}),Ct=function(){return lt.apply(Pt?ht.call(Mt(this)):Mt(this),arguments)},Ot={copyWithin:function(t,e){return D.call(Mt(this),t,e,arguments.length>2?arguments[2]:void 0)},every:function(t){return Q(Mt(this),t,arguments.length>1?arguments[1]:void 0)},fill:function(t){return L.apply(Mt(this),arguments)},filter:function(t){return xt(this,Y(Mt(this),t,arguments.length>1?arguments[1]:void 0))},find:function(t){return $(Mt(this),t,arguments.length>1?arguments[1]:void 0)},findIndex:function(t){return tt(Mt(this),t,arguments.length>1?arguments[1]:void 0)},forEach:function(t){J(Mt(this),t,arguments.length>1?arguments[1]:void 0)},indexOf:function(t){return rt(Mt(this),t,arguments.length>1?arguments[1]:void 0)},includes:function(t){return et(Mt(this),t,arguments.length>1?arguments[1]:void 0)},join:function(t){return ct.apply(Mt(this),arguments)},lastIndexOf:function(t){return at.apply(Mt(this),arguments)},map:function(t){return _t(Mt(this),t,arguments.length>1?arguments[1]:void 0)},reduce:function(t){return st.apply(Mt(this),arguments)},reduceRight:function(t){return ft.apply(Mt(this),arguments)},reverse:function(){for(var t,e=this,r=Mt(e).length,n=Math.floor(r/2),i=0;i<n;)t=e[i],e[i++]=e[--r],e[r]=t;return e},some:function(t){return Z(Mt(this),t,arguments.length>1?arguments[1]:void 0)},sort:function(t){return ut.call(Mt(this),t)},subarray:function(t,e){var r=Mt(this),n=r.length,i=y(t,n);return new(P(r,r[yt]))(r.buffer,r.byteOffset+i*r.BYTES_PER_ELEMENT,b((void 0===e?n:y(e,n))-i))}},jt=function(t,e){return xt(this,ht.call(Mt(this),t,e))},Nt=function(t){Mt(this);var e=kt(arguments[1],1),r=this.length,n=S(t),i=b(n.length),o=0;if(i+e>r)throw V("Wrong length!");for(;o<i;)this[e+o]=n[o++]},Lt={entries:function(){return ot.call(Mt(this))},keys:function(){return it.call(Mt(this))},values:function(){return nt.call(Mt(this))}},Dt=function(t,e){return _(t)&&t[mt]&&"symbol"!=typeof e&&e in t&&String(+e)==String(e)},Ft=function(t,e){return Dt(t,e=g(e,!0))?h(2,t[e]):z(t,e)},Ut=function(t,e,r){return!(Dt(t,e=g(e,!0))&&_(r)&&m(r,"value"))||m(r,"get")||m(r,"set")||r.configurable||m(r,"writable")&&!r.writable||m(r,"enumerable")&&!r.enumerable?q(t,e,r):(t[e]=r.value,t)};gt||(U.f=Ft,F.f=Ut),a(a.S+a.F*!gt,"Object",{getOwnPropertyDescriptor:Ft,defineProperty:Ut}),o(function(){dt.call({})})&&(dt=lt=function(){return ct.call(this)});var qt=l({},Ot);l(qt,Lt),d(qt,pt,Lt.values),l(qt,{slice:jt,set:Nt,constructor:function(){},toString:dt,toLocaleString:Ct}),Rt(qt,"buffer","b"),Rt(qt,"byteOffset","o"),Rt(qt,"byteLength","l"),Rt(qt,"length","e"),q(qt,bt,{get:function(){return this[mt]}}),e.exports=function(t,e,r,f){f=!!f;var c=t+(f?"Clamped":"")+"Array",h="get"+t,l="set"+t,p=i[c],y=p||{},g=p&&M(p),m=!p||!s.ABV,S={},E=p&&p.prototype,x=function(t,r){var n=t._d;return n.v[h](r*e+n.o,St)},I=function(t,r,n){var i=t._d;f&&(n=(n=Math.round(n))<0?0:n>255?255:255&n),i.v[l](r*e+i.o,n,St)},R=function(t,e){q(t,e,{get:function(){return x(this,e)},set:function(t){return I(this,e,t)},enumerable:!0})};m?(p=r(function(t,r,n,i){u(t,p,c,"_d");var o,a,s,f,h=0,l=0;if(_(r)){if(!(r instanceof H||"ArrayBuffer"==(f=w(r))||"SharedArrayBuffer"==f))return mt in r?It(p,r):Bt.call(p,r);o=r,l=kt(n,e);var y=r.byteLength;if(void 0===i){if(y%e)throw V("Wrong length!");if((a=y-l)<0)throw V("Wrong length!")}else if((a=b(i)*e)+l>y)throw V("Wrong length!");s=a/e}else s=v(r),a=s*e,o=new H(a);for(d(t,"_d",{b:o,o:l,l:a,e:s,v:new X(o)});h<s;)R(t,h++)}),E=p.prototype=k(qt),d(E,"constructor",p)):o(function(){p(1)})&&o(function(){new p(-1)})&&j(function(t){new p,new p(null),new p(1.5),new p(t)},!0)||(p=r(function(t,r,n,i){u(t,p,c);var o;return _(r)?r instanceof H||"ArrayBuffer"==(o=w(r))||"SharedArrayBuffer"==o?void 0!==i?new y(r,kt(n,e),i):void 0!==n?new y(r,kt(n,e)):new y(r):mt in r?It(p,r):Bt.call(p,r):new y(v(r))}),J(g!==Function.prototype?A(y).concat(A(g)):A(y),function(t){t in p||d(p,t,y[t])}),p.prototype=E,n||(E.constructor=p));var B=E[pt],T=!!B&&("values"==B.name||void 0==B.name),P=Lt.values;d(p,vt,!0),d(E,mt,c),d(E,wt,!0),d(E,yt,p),(f?new p(1)[bt]==c:bt in E)||q(E,bt,{get:function(){return c}}),S[c]=p,a(a.G+a.W+a.F*(p!=y),S),a(a.S,c,{BYTES_PER_ELEMENT:e}),a(a.S+a.F*o(function(){y.of.call(p,1)}),c,{from:Bt,of:Tt}),"BYTES_PER_ELEMENT"in E||d(E,"BYTES_PER_ELEMENT",e),a(a.P,c,Ot),N(c),a(a.P+a.F*Et,c,{set:Nt}),a(a.P+a.F*!T,c,Lt),n||E.toString==dt||(E.toString=dt),a(a.P+a.F*o(function(){new p(1).slice()}),c,{slice:jt}),a(a.P+a.F*(o(function(){return[1,2].toLocaleString()!=new p([1,2]).toLocaleString()})||!o(function(){E.toLocaleString.call([1,2])})),c,{toLocaleString:Ct}),O[c]=T?B:P,n||T||d(E,pt,P)}}else e.exports=function(){}},{101:101,106:106,108:108,109:109,120:120,121:121,124:124,126:126,128:128,139:139,140:140,147:147,151:151,161:161,162:162,163:163,165:165,166:166,167:167,169:169,170:170,171:171,176:176,177:177,189:189,56:56,58:58,59:59,61:61,62:62,67:67,75:75,79:79,83:83,85:85,90:90,91:91,92:92,98:98}],169:[function(t,e,r){"use strict";function n(t,e,r){var n,i,o,a=new Array(r),s=8*r-e-1,f=(1<<s)-1,c=f>>1,u=23===e?D(2,-24)-D(2,-77):0,h=0,d=t<0||0===t&&1/t<0?1:0;for(t=L(t),t!=t||t===j?(i=t!=t?1:0,n=f):(n=F(U(t)/q),t*(o=D(2,-n))<1&&(n--,o*=2),t+=n+c>=1?u/o:u*D(2,1-c),t*o>=2&&(n++,o/=2),n+c>=f?(i=0,n=f):n+c>=1?(i=(t*o-1)*D(2,e),n+=c):(i=t*D(2,c-1)*D(2,e),n=0));e>=8;a[h++]=255&i,i/=256,e-=8);for(n=n<<e|i,s+=e;s>0;a[h++]=255&n,n/=256,s-=8);return a[--h]|=128*d,a}function i(t,e,r){var n,i=8*r-e-1,o=(1<<i)-1,a=o>>1,s=i-7,f=r-1,c=t[f--],u=127&c;for(c>>=7;s>0;u=256*u+t[f],f--,s-=8);for(n=u&(1<<-s)-1,u>>=-s,s+=e;s>0;n=256*n+t[f],f--,s-=8);if(0===u)u=1-a;else{if(u===o)return n?NaN:c?-j:j;n+=D(2,e),u-=a}return(c?-1:1)*n*D(2,u-e)}function o(t){return t[3]<<24|t[2]<<16|t[1]<<8|t[0]}function a(t){return[255&t]}function s(t){return[255&t,t>>8&255]}function f(t){return[255&t,t>>8&255,t>>16&255,t>>24&255]}function c(t){return n(t,52,8)}function u(t){return n(t,23,4)}function h(t,e,r){A(t[R],e,{get:function(){return this[r]}})}function d(t,e,r,n){var i=+r,o=k(i);if(o+e>t[V])throw O(B)
;var a=t[z]._b,s=o+t[G],f=a.slice(s,s+e);return n?f:f.reverse()}function l(t,e,r,n,i,o){var a=+r,s=k(a);if(s+e>t[V])throw O(B);for(var f=t[z]._b,c=s+t[G],u=n(+i),h=0;h<e;h++)f[c+h]=u[o?h:e-h-1]}var p=t(90),b=t(79),v=t(109),y=t(170),g=t(92),m=t(140),w=t(85),_=t(56),S=t(163),E=t(165),k=t(162),M=t(126).f,A=t(121).f,x=t(59),I=t(148),R="prototype",B="Wrong index!",T=p.ArrayBuffer,P=p.DataView,C=p.Math,O=p.RangeError,j=p.Infinity,N=T,L=C.abs,D=C.pow,F=C.floor,U=C.log,q=C.LN2,z=b?"_b":"buffer",V=b?"_l":"byteLength",G=b?"_o":"byteOffset";if(y.ABV){if(!w(function(){T(1)})||!w(function(){new T(-1)})||w(function(){return new T,new T(1.5),new T(NaN),"ArrayBuffer"!=T.name})){T=function(t){return _(this,T),new N(k(t))};for(var K,W=T[R]=N[R],H=M(N),X=0;H.length>X;)(K=H[X++])in T||g(T,K,N[K]);v||(W.constructor=T)}var J=new P(new T(2)),Y=P[R].setInt8;J.setInt8(0,2147483648),J.setInt8(1,2147483649),!J.getInt8(0)&&J.getInt8(1)||m(P[R],{setInt8:function(t,e){Y.call(this,t,e<<24>>24)},setUint8:function(t,e){Y.call(this,t,e<<24>>24)}},!0)}else T=function(t){_(this,T,"ArrayBuffer");var e=k(t);this._b=x.call(new Array(e),0),this[V]=e},P=function(t,e,r){_(this,P,"DataView"),_(t,T,"DataView");var n=t[V],i=S(e);if(i<0||i>n)throw O("Wrong offset!");if(r=void 0===r?n-i:E(r),i+r>n)throw O("Wrong length!");this[z]=t,this[G]=i,this[V]=r},b&&(h(T,"byteLength","_l"),h(P,"buffer","_b"),h(P,"byteLength","_l"),h(P,"byteOffset","_o")),m(P[R],{getInt8:function(t){return d(this,1,t)[0]<<24>>24},getUint8:function(t){return d(this,1,t)[0]},getInt16:function(t){var e=d(this,2,t,arguments[1]);return(e[1]<<8|e[0])<<16>>16},getUint16:function(t){var e=d(this,2,t,arguments[1]);return e[1]<<8|e[0]},getInt32:function(t){return o(d(this,4,t,arguments[1]))},getUint32:function(t){return o(d(this,4,t,arguments[1]))>>>0},getFloat32:function(t){return i(d(this,4,t,arguments[1]),23,4)},getFloat64:function(t){return i(d(this,8,t,arguments[1]),52,8)},setInt8:function(t,e){l(this,1,t,a,e)},setUint8:function(t,e){l(this,1,t,a,e)},setInt16:function(t,e){l(this,2,t,s,e,arguments[2])},setUint16:function(t,e){l(this,2,t,s,e,arguments[2])},setInt32:function(t,e){l(this,4,t,f,e,arguments[2])},setUint32:function(t,e){l(this,4,t,f,e,arguments[2])},setFloat32:function(t,e){l(this,4,t,u,e,arguments[2])},setFloat64:function(t,e){l(this,8,t,c,e,arguments[2])}});I(T,"ArrayBuffer"),I(P,"DataView"),g(P[R],y.VIEW,!0),r.ArrayBuffer=T,r.DataView=P},{109:109,121:121,126:126,140:140,148:148,162:162,163:163,165:165,170:170,56:56,59:59,79:79,85:85,90:90,92:92}],170:[function(t,e,r){for(var n,i=t(90),o=t(92),a=t(171),s=a("typed_array"),f=a("view"),c=!(!i.ArrayBuffer||!i.DataView),u=c,h=0,d="Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array".split(",");h<9;)(n=i[d[h++]])?(o(n.prototype,s,!0),o(n.prototype,f,!0)):u=!1;e.exports={ABV:c,CONSTR:u,TYPED:s,VIEW:f}},{171:171,90:90,92:92}],171:[function(t,e,r){var n=0,i=Math.random();e.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+i).toString(36))}},{}],172:[function(t,e,r){var n=t(90),i=n.navigator;e.exports=i&&i.userAgent||""},{90:90}],173:[function(t,e,r){var n=t(101);e.exports=function(t,e){if(!n(t)||t._t!==e)throw TypeError("Incompatible receiver, "+e+" required!");return t}},{101:101}],174:[function(t,e,r){var n=t(90),i=t(73),o=t(109),a=t(175),s=t(121).f;e.exports=function(t){var e=i.Symbol||(i.Symbol=o?{}:n.Symbol||{});"_"==t.charAt(0)||t in e||s(e,t,{value:a.f(t)})}},{109:109,121:121,175:175,73:73,90:90}],175:[function(t,e,r){r.f=t(176)},{176:176}],176:[function(t,e,r){var n=t(150)("wks"),i=t(171),o=t(90).Symbol,a="function"==typeof o;(e.exports=function(t){return n[t]||(n[t]=a&&o[t]||(a?o:i)("Symbol."+t))}).store=n},{150:150,171:171,90:90}],177:[function(t,e,r){var n=t(67),i=t(176)("iterator"),o=t(108);e.exports=t(73).getIteratorMethod=function(t){if(void 0!=t)return t[i]||t["@@iterator"]||o[n(t)]}},{108:108,176:176,67:67,73:73}],178:[function(t,e,r){var n=t(83),i=t(142)(/[\\^$*+?.()|[\]{}]/g,"\\$&");n(n.S,"RegExp",{escape:function(t){return i(t)}})},{142:142,83:83}],179:[function(t,e,r){var n=t(83);n(n.P,"Array",{copyWithin:t(58)}),t(55)("copyWithin")},{55:55,58:58,83:83}],180:[function(t,e,r){"use strict";var n=t(83),i=t(62)(4);n(n.P+n.F*!t(152)([].every,!0),"Array",{every:function(t){return i(this,t,arguments[1])}})},{152:152,62:62,83:83}],181:[function(t,e,r){var n=t(83);n(n.P,"Array",{fill:t(59)}),t(55)("fill")},{55:55,59:59,83:83}],182:[function(t,e,r){"use strict";var n=t(83),i=t(62)(2);n(n.P+n.F*!t(152)([].filter,!0),"Array",{filter:function(t){return i(this,t,arguments[1])}})},{152:152,62:62,83:83}],183:[function(t,e,r){"use strict";var n=t(83),i=t(62)(6),o="findIndex",a=!0;o in[]&&Array(1)[o](function(){a=!1}),n(n.P+n.F*a,"Array",{findIndex:function(t){return i(this,t,arguments.length>1?arguments[1]:void 0)}}),t(55)(o)},{55:55,62:62,83:83}],184:[function(t,e,r){"use strict";var n=t(83),i=t(62)(5),o=!0;"find"in[]&&Array(1).find(function(){o=!1}),n(n.P+n.F*o,"Array",{find:function(t){return i(this,t,arguments.length>1?arguments[1]:void 0)}}),t(55)("find")},{55:55,62:62,83:83}],185:[function(t,e,r){"use strict";var n=t(83),i=t(62)(0),o=t(152)([].forEach,!0);n(n.P+n.F*!o,"Array",{forEach:function(t){return i(this,t,arguments[1])}})},{152:152,62:62,83:83}],186:[function(t,e,r){"use strict";var n=t(75),i=t(83),o=t(166),a=t(103),s=t(98),f=t(165),c=t(74),u=t(177);i(i.S+i.F*!t(106)(function(t){Array.from(t)}),"Array",{from:function(t){var e,r,i,h,d=o(t),l="function"==typeof this?this:Array,p=arguments.length,b=p>1?arguments[1]:void 0,v=void 0!==b,y=0,g=u(d);if(v&&(b=n(b,p>2?arguments[2]:void 0,2)),void 0==g||l==Array&&s(g))for(e=f(d.length),r=new l(e);e>y;y++)c(r,y,v?b(d[y],y):d[y]);else for(h=g.call(d),r=new l;!(i=h.next()).done;y++)c(r,y,v?a(h,b,[i.value,y],!0):i.value);return r.length=y,r}})},{103:103,106:106,165:165,166:166,177:177,74:74,75:75,83:83,98:98}],187:[function(t,e,r){"use strict";var n=t(83),i=t(61)(!1),o=[].indexOf,a=!!o&&1/[1].indexOf(1,-0)<0;n(n.P+n.F*(a||!t(152)(o)),"Array",{indexOf:function(t){return a?o.apply(this,arguments)||0:i(this,t,arguments[1])}})},{152:152,61:61,83:83}],188:[function(t,e,r){var n=t(83);n(n.S,"Array",{isArray:t(99)})},{83:83,99:99}],189:[function(t,e,r){"use strict";var n=t(55),i=t(107),o=t(108),a=t(164);e.exports=t(105)(Array,"Array",function(t,e){this._t=a(t),this._i=0,this._k=e},function(){var t=this._t,e=this._k,r=this._i++;return!t||r>=t.length?(this._t=void 0,i(1)):"keys"==e?i(0,r):"values"==e?i(0,t[r]):i(0,[r,t[r]])},"values"),o.Arguments=o.Array,n("keys"),n("values"),n("entries")},{105:105,107:107,108:108,164:164,55:55}],190:[function(t,e,r){"use strict";var n=t(83),i=t(164),o=[].join;n(n.P+n.F*(t(97)!=Object||!t(152)(o)),"Array",{join:function(t){return o.call(i(this),void 0===t?",":t)}})},{152:152,164:164,83:83,97:97}],191:[function(t,e,r){"use strict";var n=t(83),i=t(164),o=t(163),a=t(165),s=[].lastIndexOf,f=!!s&&1/[1].lastIndexOf(1,-0)<0;n(n.P+n.F*(f||!t(152)(s)),"Array",{lastIndexOf:function(t){if(f)return s.apply(this,arguments)||0;var e=i(this),r=a(e.length),n=r-1;for(arguments.length>1&&(n=Math.min(n,o(arguments[1]))),n<0&&(n=r+n);n>=0;n--)if(n in e&&e[n]===t)return n||0;return-1}})},{152:152,163:163,164:164,165:165,83:83}],192:[function(t,e,r){"use strict";var n=t(83),i=t(62)(1);n(n.P+n.F*!t(152)([].map,!0),"Array",{map:function(t){return i(this,t,arguments[1])}})},{152:152,62:62,83:83}],193:[function(t,e,r){"use strict";var n=t(83),i=t(74);n(n.S+n.F*t(85)(function(){function t(){}return!(Array.of.call(t)instanceof t)}),"Array",{of:function(){for(var t=0,e=arguments.length,r=new("function"==typeof this?this:Array)(e);e>t;)i(r,t,arguments[t++]);return r.length=e,r}})},{74:74,83:83,85:85}],194:[function(t,e,r){"use strict";var n=t(83),i=t(63);n(n.P+n.F*!t(152)([].reduceRight,!0),"Array",{reduceRight:function(t){return i(this,t,arguments.length,arguments[1],!0)}})},{152:152,63:63,83:83}],195:[function(t,e,r){"use strict";var n=t(83),i=t(63);n(n.P+n.F*!t(152)([].reduce,!0),"Array",{reduce:function(t){return i(this,t,arguments.length,arguments[1],!1)}})},{152:152,63:63,83:83}],196:[function(t,e,r){"use strict";var n=t(83),i=t(93),o=t(68),a=t(161),s=t(165),f=[].slice;n(n.P+n.F*t(85)(function(){i&&f.call(i)}),"Array",{slice:function(t,e){var r=s(this.length),n=o(this);if(e=void 0===e?r:e,"Array"==n)return f.call(this,t,e);for(var i=a(t,r),c=a(e,r),u=s(c-i),h=new Array(u),d=0;d<u;d++)h[d]="String"==n?this.charAt(i+d):this[i+d];return h}})},{161:161,165:165,68:68,83:83,85:85,93:93}],197:[function(t,e,r){"use strict";var n=t(83),i=t(62)(3);n(n.P+n.F*!t(152)([].some,!0),"Array",{some:function(t){return i(this,t,arguments[1])}})},{152:152,62:62,83:83}],198:[function(t,e,r){"use strict";var n=t(83),i=t(53),o=t(166),a=t(85),s=[].sort,f=[1,2,3];n(n.P+n.F*(a(function(){f.sort(void 0)})||!a(function(){f.sort(null)})||!t(152)(s)),"Array",{sort:function(t){return void 0===t?s.call(o(this)):s.call(o(this),i(t))}})},{152:152,166:166,53:53,83:83,85:85}],199:[function(t,e,r){t(147)("Array")},{147:147}],200:[function(t,e,r){var n=t(83);n(n.S,"Date",{now:function(){return(new Date).getTime()}})},{83:83}],201:[function(t,e,r){var n=t(83),i=t(76);n(n.P+n.F*(Date.prototype.toISOString!==i),"Date",{toISOString:i})},{76:76,83:83}],202:[function(t,e,r){"use strict";var n=t(83),i=t(166),o=t(167);n(n.P+n.F*t(85)(function(){return null!==new Date(NaN).toJSON()||1!==Date.prototype.toJSON.call({toISOString:function(){return 1}})}),"Date",{toJSON:function(t){var e=i(this),r=o(e);return"number"!=typeof r||isFinite(r)?e.toISOString():null}})},{166:166,167:167,83:83,85:85}],203:[function(t,e,r){var n=t(176)("toPrimitive"),i=Date.prototype;n in i||t(92)(i,n,t(77))},{176:176,77:77,92:92}],204:[function(t,e,r){var n=Date.prototype,i=n.toString,o=n.getTime;new Date(NaN)+""!="Invalid Date"&&t(141)(n,"toString",function(){var t=o.call(this);return t===t?i.call(this):"Invalid Date"})},{141:141}],205:[function(t,e,r){var n=t(83);n(n.P,"Function",{bind:t(66)})},{66:66,83:83}],206:[function(t,e,r){"use strict";var n=t(101),i=t(128),o=t(176)("hasInstance"),a=Function.prototype;o in a||t(121).f(a,o,{value:function(t){if("function"!=typeof this||!n(t))return!1;if(!n(this.prototype))return t instanceof this;for(;t=i(t);)if(this.prototype===t)return!0;return!1}})},{101:101,121:121,128:128,176:176}],207:[function(t,e,r){var n=t(121).f,i=Function.prototype,o=/^\s*function ([^ (]*)/;"name"in i||t(79)&&n(i,"name",{configurable:!0,get:function(){try{return(""+this).match(o)[1]}catch(t){return""}}})},{121:121,79:79}],208:[function(t,e,r){"use strict";var n=t(69),i=t(173);e.exports=t(72)("Map",function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},{get:function(t){var e=n.getEntry(i(this,"Map"),t);return e&&e.v},set:function(t,e){return n.def(i(this,"Map"),0===t?0:t,e)}},n,!0)},{173:173,69:69,72:72}],209:[function(t,e,r){var n=t(83),i=t(112),o=Math.sqrt,a=Math.acosh;n(n.S+n.F*!(a&&710==Math.floor(a(Number.MAX_VALUE))&&a(1/0)==1/0),"Math",{acosh:function(t){return(t=+t)<1?NaN:t>94906265.62425156?Math.log(t)+Math.LN2:i(t-1+o(t-1)*o(t+1))}})},{112:112,83:83}],210:[function(t,e,r){function n(t){return isFinite(t=+t)&&0!=t?t<0?-n(-t):Math.log(t+Math.sqrt(t*t+1)):t}var i=t(83),o=Math.asinh;i(i.S+i.F*!(o&&1/o(0)>0),"Math",{asinh:n})},{83:83}],211:[function(t,e,r){var n=t(83),i=Math.atanh;n(n.S+n.F*!(i&&1/i(-0)<0),"Math",{atanh:function(t){return 0==(t=+t)?t:Math.log((1+t)/(1-t))/2}})},{83:83}],212:[function(t,e,r){var n=t(83),i=t(114);n(n.S,"Math",{cbrt:function(t){return i(t=+t)*Math.pow(Math.abs(t),1/3)}})},{114:114,83:83}],213:[function(t,e,r){var n=t(83);n(n.S,"Math",{clz32:function(t){return(t>>>=0)?31-Math.floor(Math.log(t+.5)*Math.LOG2E):32}})},{83:83}],214:[function(t,e,r){var n=t(83),i=Math.exp;n(n.S,"Math",{cosh:function(t){return(i(t=+t)+i(-t))/2}})},{83:83}],215:[function(t,e,r){var n=t(83),i=t(110);n(n.S+n.F*(i!=Math.expm1),"Math",{expm1:i})},{110:110,83:83}],216:[function(t,e,r){var n=t(83);n(n.S,"Math",{fround:t(111)})},{111:111,83:83}],217:[function(t,e,r){var n=t(83),i=Math.abs;n(n.S,"Math",{hypot:function(t,e){for(var r,n,o=0,a=0,s=arguments.length,f=0;a<s;)r=i(arguments[a++]),f<r?(n=f/r,o=o*n*n+1,f=r):r>0?(n=r/f,o+=n*n):o+=r;return f===1/0?1/0:f*Math.sqrt(o)}})},{83:83}],218:[function(t,e,r){var n=t(83),i=Math.imul;n(n.S+n.F*t(85)(function(){return-5!=i(4294967295,5)||2!=i.length}),"Math",{imul:function(t,e){var r=+t,n=+e,i=65535&r,o=65535&n;return 0|i*o+((65535&r>>>16)*o+i*(65535&n>>>16)<<16>>>0)}})},{83:83,85:85}],219:[function(t,e,r){var n=t(83);n(n.S,"Math",{log10:function(t){return Math.log(t)*Math.LOG10E}})},{83:83}],220:[function(t,e,r){var n=t(83);n(n.S,"Math",{log1p:t(112)})},{112:112,83:83}],221:[function(t,e,r){var n=t(83);n(n.S,"Math",{log2:function(t){return Math.log(t)/Math.LN2}})},{83:83}],222:[function(t,e,r){var n=t(83);n(n.S,"Math",{sign:t(114)})},{114:114,83:83}],223:[function(t,e,r){var n=t(83),i=t(110),o=Math.exp;n(n.S+n.F*t(85)(function(){return-2e-17!=!Math.sinh(-2e-17)}),"Math",{sinh:function(t){return Math.abs(t=+t)<1?(i(t)-i(-t))/2:(o(t-1)-o(-t-1))*(Math.E/2)}})},{110:110,83:83,85:85}],224:[function(t,e,r){var n=t(83),i=t(110),o=Math.exp;n(n.S,"Math",{tanh:function(t){var e=i(t=+t),r=i(-t);return e==1/0?1:r==1/0?-1:(e-r)/(o(t)+o(-t))}})},{110:110,83:83}],225:[function(t,e,r){var n=t(83);n(n.S,"Math",{trunc:function(t){return(t>0?Math.floor:Math.ceil)(t)}})},{83:83}],226:[function(t,e,r){"use strict";var n=t(90),i=t(91),o=t(68),a=t(95),s=t(167),f=t(85),c=t(126).f,u=t(124).f,h=t(121).f,d=t(158).trim,l=n.Number,p=l,b=l.prototype,v="Number"==o(t(120)(b)),y="trim"in String.prototype,g=function(t){var e=s(t,!1);if("string"==typeof e&&e.length>2){e=y?e.trim():d(e,3);var r,n,i,o=e.charCodeAt(0);if(43===o||45===o){if(88===(r=e.charCodeAt(2))||120===r)return NaN}else if(48===o){switch(e.charCodeAt(1)){case 66:case 98:n=2,i=49;break;case 79:case 111:n=8,i=55;break;default:return+e}for(var a,f=e.slice(2),c=0,u=f.length;c<u;c++)if((a=f.charCodeAt(c))<48||a>i)return NaN;return parseInt(f,n)}}return+e};if(!l(" 0o1")||!l("0b1")||l("+0x1")){l=function(t){var e=arguments.length<1?0:t,r=this;return r instanceof l&&(v?f(function(){b.valueOf.call(r)}):"Number"!=o(r))?a(new p(g(e)),r,l):g(e)};for(var m,w=t(79)?c(p):"MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger".split(","),_=0;w.length>_;_++)i(p,m=w[_])&&!i(l,m)&&h(l,m,u(p,m));l.prototype=b,b.constructor=l,t(141)(n,"Number",l)}},{120:120,121:121,124:124,126:126,141:141,158:158,167:167,68:68,79:79,85:85,90:90,91:91,95:95}],227:[function(t,e,r){var n=t(83);n(n.S,"Number",{EPSILON:Math.pow(2,-52)})},{83:83}],228:[function(t,e,r){var n=t(83),i=t(90).isFinite;n(n.S,"Number",{isFinite:function(t){return"number"==typeof t&&i(t)}})},{83:83,90:90}],229:[function(t,e,r){var n=t(83);n(n.S,"Number",{isInteger:t(100)})},{100:100,83:83}],230:[function(t,e,r){var n=t(83);n(n.S,"Number",{isNaN:function(t){return t!=t}})},{83:83}],231:[function(t,e,r){var n=t(83),i=t(100),o=Math.abs;n(n.S,"Number",{isSafeInteger:function(t){return i(t)&&o(t)<=9007199254740991}})},{100:100,83:83}],232:[function(t,e,r){var n=t(83);n(n.S,"Number",{MAX_SAFE_INTEGER:9007199254740991})},{83:83}],233:[function(t,e,r){var n=t(83);n(n.S,"Number",{MIN_SAFE_INTEGER:-9007199254740991})},{83:83}],234:[function(t,e,r){var n=t(83),i=t(135);n(n.S+n.F*(Number.parseFloat!=i),"Number",{parseFloat:i})},{135:135,83:83}],235:[function(t,e,r){var n=t(83),i=t(136);n(n.S+n.F*(Number.parseInt!=i),"Number",{parseInt:i})},{136:136,83:83}],236:[function(t,e,r){"use strict";var n=t(83),i=t(163),o=t(54),a=t(157),s=1..toFixed,f=Math.floor,c=[0,0,0,0,0,0],u="Number.toFixed: incorrect invocation!",h=function(t,e){for(var r=-1,n=e;++r<6;)n+=t*c[r],c[r]=n%1e7,n=f(n/1e7)},d=function(t){for(var e=6,r=0;--e>=0;)r+=c[e],c[e]=f(r/t),r=r%t*1e7},l=function(){for(var t=6,e="";--t>=0;)if(""!==e||0===t||0!==c[t]){var r=String(c[t]);e=""===e?r:e+a.call("0",7-r.length)+r}return e},p=function(t,e,r){return 0===e?r:e%2==1?p(t,e-1,r*t):p(t*t,e/2,r)},b=function(t){for(var e=0,r=t;r>=4096;)e+=12,r/=4096;for(;r>=2;)e+=1,r/=2;return e};n(n.P+n.F*(!!s&&("0.000"!==8e-5.toFixed(3)||"1"!==.9.toFixed(0)||"1.25"!==1.255.toFixed(2)||"1000000000000000128"!==(0xde0b6b3a7640080).toFixed(0))||!t(85)(function(){s.call({})})),"Number",{toFixed:function(t){var e,r,n,s,f=o(this,u),c=i(t),v="",y="0";if(c<0||c>20)throw RangeError(u);if(f!=f)return"NaN";if(f<=-1e21||f>=1e21)return String(f);if(f<0&&(v="-",f=-f),f>1e-21)if(e=b(f*p(2,69,1))-69,r=e<0?f*p(2,-e,1):f/p(2,e,1),r*=4503599627370496,(e=52-e)>0){for(h(0,r),n=c;n>=7;)h(1e7,0),n-=7;for(h(p(10,n,1),0),n=e-1;n>=23;)d(1<<23),n-=23;d(1<<n),h(1,1),d(2),y=l()}else h(0,r),h(1<<-e,0),y=l()+a.call("0",c);return c>0?(s=y.length,y=v+(s<=c?"0."+a.call("0",c-s)+y:y.slice(0,s-c)+"."+y.slice(s-c))):y=v+y,y}})},{157:157,163:163,54:54,83:83,85:85}],237:[function(t,e,r){"use strict";var n=t(83),i=t(85),o=t(54),a=1..toPrecision;n(n.P+n.F*(i(function(){return"1"!==a.call(1,void 0)})||!i(function(){a.call({})})),"Number",{toPrecision:function(t){var e=o(this,"Number#toPrecision: incorrect invocation!");return void 0===t?a.call(e):a.call(e,t)}})},{54:54,83:83,85:85}],238:[function(t,e,r){var n=t(83);n(n.S+n.F,"Object",{assign:t(119)})},{119:119,83:83}],239:[function(t,e,r){var n=t(83);n(n.S,"Object",{create:t(120)})},{120:120,83:83}],240:[function(t,e,r){var n=t(83);n(n.S+n.F*!t(79),"Object",{defineProperties:t(122)})},{122:122,79:79,83:83}],241:[function(t,e,r){var n=t(83);n(n.S+n.F*!t(79),"Object",{defineProperty:t(121).f})},{121:121,79:79,83:83}],242:[function(t,e,r){var n=t(101),i=t(115).onFreeze;t(132)("freeze",function(t){return function(e){return t&&n(e)?t(i(e)):e}})},{101:101,115:115,132:132}],243:[function(t,e,r){var n=t(164),i=t(124).f;t(132)("getOwnPropertyDescriptor",function(){return function(t,e){return i(n(t),e)}})},{124:124,132:132,164:164}],244:[function(t,e,r){t(132)("getOwnPropertyNames",function(){return t(125).f})},{125:125,132:132}],245:[function(t,e,r){var n=t(166),i=t(128);t(132)("getPrototypeOf",function(){return function(t){return i(n(t))}})},{128:128,132:132,166:166}],246:[function(t,e,r){var n=t(101);t(132)("isExtensible",function(t){return function(e){return!!n(e)&&(!t||t(e))}})},{101:101,132:132}],247:[function(t,e,r){var n=t(101);t(132)("isFrozen",function(t){return function(e){return!n(e)||!!t&&t(e)}})},{101:101,132:132}],248:[function(t,e,r){var n=t(101);t(132)("isSealed",function(t){return function(e){return!n(e)||!!t&&t(e)}})},{101:101,132:132}],249:[function(t,e,r){var n=t(83);n(n.S,"Object",{is:t(143)})},{143:143,83:83}],250:[function(t,e,r){var n=t(166),i=t(130);t(132)("keys",function(){return function(t){return i(n(t))}})},{130:130,132:132,166:166}],251:[function(t,e,r){var n=t(101),i=t(115).onFreeze;t(132)("preventExtensions",function(t){return function(e){return t&&n(e)?t(i(e)):e}})},{101:101,115:115,132:132}],252:[function(t,e,r){var n=t(101),i=t(115).onFreeze;t(132)("seal",function(t){return function(e){return t&&n(e)?t(i(e)):e}})},{101:101,115:115,132:132}],253:[function(t,e,r){var n=t(83);n(n.S,"Object",{setPrototypeOf:t(146).set})},{146:146,83:83}],254:[function(t,e,r){"use strict";var n=t(67),i={};i[t(176)("toStringTag")]="z",i+""!="[object z]"&&t(141)(Object.prototype,"toString",function(){return"[object "+n(this)+"]"},!0)},{141:141,176:176,67:67}],255:[function(t,e,r){var n=t(83),i=t(135);n(n.G+n.F*(parseFloat!=i),{parseFloat:i})},{135:135,83:83}],256:[function(t,e,r){var n=t(83),i=t(136);n(n.G+n.F*(parseInt!=i),{parseInt:i})},{136:136,83:83}],257:[function(t,e,r){"use strict";var n,i,o,a,s=t(109),f=t(90),c=t(75),u=t(67),h=t(83),d=t(101),l=t(53),p=t(56),b=t(89),v=t(151),y=t(160).set,g=t(117)(),m=t(118),w=t(137),_=t(172),S=t(138),E=f.TypeError,k=f.process,M=k&&k.versions,A=M&&M.v8||"",x=f.Promise,I="process"==u(k),R=function(){},B=i=m.f,T=!!function(){try{var e=x.resolve(1),r=(e.constructor={})[t(176)("species")]=function(t){t(R,R)};return(I||"function"==typeof PromiseRejectionEvent)&&e.then(R)instanceof r&&0!==A.indexOf("6.6")&&-1===_.indexOf("Chrome/66")}catch(t){}}(),P=function(t){var e;return!(!d(t)||"function"!=typeof(e=t.then))&&e},C=function(t,e){if(!t._n){t._n=!0;var r=t._c;g(function(){for(var n=t._v,i=1==t._s,o=0;r.length>o;)!function(e){var r,o,a,s=i?e.ok:e.fail,f=e.resolve,c=e.reject,u=e.domain;try{s?(i||(2==t._h&&N(t),t._h=1),!0===s?r=n:(u&&u.enter(),r=s(n),u&&(u.exit(),a=!0)),r===e.promise?c(E("Promise-chain cycle")):(o=P(r))?o.call(r,f,c):f(r)):c(n)}catch(t){u&&!a&&u.exit(),c(t)}}(r[o++]);t._c=[],t._n=!1,e&&!t._h&&O(t)})}},O=function(t){y.call(f,function(){var e,r,n,i=t._v,o=j(t);if(o&&(e=w(function(){I?k.emit("unhandledRejection",i,t):(r=f.onunhandledrejection)?r({promise:t,reason:i}):(n=f.console)&&n.error&&n.error("Unhandled promise rejection",i)}),t._h=I||j(t)?2:1),t._a=void 0,o&&e.e)throw e.v})},j=function(t){return 1!==t._h&&0===(t._a||t._c).length},N=function(t){y.call(f,function(){var e;I?k.emit("rejectionHandled",t):(e=f.onrejectionhandled)&&e({promise:t,reason:t._v})})},L=function(t){var e=this;e._d||(e._d=!0,e=e._w||e,e._v=t,e._s=2,e._a||(e._a=e._c.slice()),C(e,!0))},D=function(t){var e,r=this;if(!r._d){r._d=!0,r=r._w||r;try{if(r===t)throw E("Promise can't be resolved itself");(e=P(t))?g(function(){var n={_w:r,_d:!1};try{e.call(t,c(D,n,1),c(L,n,1))}catch(t){L.call(n,t)}}):(r._v=t,r._s=1,C(r,!1))}catch(t){L.call({_w:r,_d:!1},t)}}};T||(x=function(t){p(this,x,"Promise","_h"),l(t),n.call(this);try{t(c(D,this,1),c(L,this,1))}catch(t){L.call(this,t)}},n=function(t){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1},n.prototype=t(140)(x.prototype,{then:function(t,e){var r=B(v(this,x));return r.ok="function"!=typeof t||t,r.fail="function"==typeof e&&e,r.domain=I?k.domain:void 0,this._c.push(r),this._a&&this._a.push(r),this._s&&C(this,!1),r.promise},catch:function(t){return this.then(void 0,t)}}),o=function(){var t=new n;this.promise=t,this.resolve=c(D,t,1),this.reject=c(L,t,1)},m.f=B=function(t){return t===x||t===a?new o(t):i(t)}),h(h.G+h.W+h.F*!T,{Promise:x}),t(148)(x,"Promise"),t(147)("Promise"),a=t(73).Promise,h(h.S+h.F*!T,"Promise",{reject:function(t){var e=B(this);return(0,e.reject)(t),e.promise}}),h(h.S+h.F*(s||!T),"Promise",{resolve:function(t){return S(s&&this===a?x:this,t)}}),h(h.S+h.F*!(T&&t(106)(function(t){x.all(t).catch(R)})),"Promise",{all:function(t){var e=this,r=B(e),n=r.resolve,i=r.reject,o=w(function(){var r=[],o=0,a=1;b(t,!1,function(t){var s=o++,f=!1;r.push(void 0),a++,e.resolve(t).then(function(t){f||(f=!0,r[s]=t,--a||n(r))},i)}),--a||n(r)});return o.e&&i(o.v),r.promise},race:function(t){var e=this,r=B(e),n=r.reject,i=w(function(){b(t,!1,function(t){e.resolve(t).then(r.resolve,n)})});return i.e&&n(i.v),r.promise}})},{101:101,106:106,109:109,117:117,118:118,137:137,138:138,140:140,147:147,148:148,151:151,160:160,172:172,176:176,53:53,56:56,67:67,73:73,75:75,83:83,89:89,90:90}],258:[function(t,e,r){var n=t(83),i=t(53),o=t(57),a=(t(90).Reflect||{}).apply,s=Function.apply;n(n.S+n.F*!t(85)(function(){a(function(){})}),"Reflect",{apply:function(t,e,r){var n=i(t),f=o(r);return a?a(n,e,f):s.call(n,e,f)}})},{53:53,57:57,83:83,85:85,90:90}],259:[function(t,e,r){var n=t(83),i=t(120),o=t(53),a=t(57),s=t(101),f=t(85),c=t(66),u=(t(90).Reflect||{}).construct,h=f(function(){function t(){}return!(u(function(){},[],t)instanceof t)}),d=!f(function(){u(function(){})});n(n.S+n.F*(h||d),"Reflect",{construct:function(t,e){o(t),a(e);var r=arguments.length<3?t:o(arguments[2]);if(d&&!h)return u(t,e,r);if(t==r){switch(e.length){case 0:return new t;case 1:return new t(e[0]);case 2:return new t(e[0],e[1]);case 3:return new t(e[0],e[1],e[2]);case 4:return new t(e[0],e[1],e[2],e[3])}var n=[null];return n.push.apply(n,e),new(c.apply(t,n))}var f=r.prototype,l=i(s(f)?f:Object.prototype),p=Function.apply.call(t,l,e);return s(p)?p:l}})},{101:101,120:120,53:53,57:57,66:66,83:83,85:85,90:90}],260:[function(t,e,r){var n=t(121),i=t(83),o=t(57),a=t(167);i(i.S+i.F*t(85)(function(){Reflect.defineProperty(n.f({},1,{value:1}),1,{value:2})}),"Reflect",{defineProperty:function(t,e,r){o(t),e=a(e,!0),o(r);try{return n.f(t,e,r),!0}catch(t){return!1}}})},{121:121,167:167,57:57,83:83,85:85}],261:[function(t,e,r){var n=t(83),i=t(124).f,o=t(57);n(n.S,"Reflect",{deleteProperty:function(t,e){var r=i(o(t),e);return!(r&&!r.configurable)&&delete t[e]}})},{124:124,57:57,83:83}],262:[function(t,e,r){"use strict";var n=t(83),i=t(57),o=function(t){this._t=i(t),this._i=0;var e,r=this._k=[];for(e in t)r.push(e)};t(104)(o,"Object",function(){var t,e=this,r=e._k;do{if(e._i>=r.length)return{value:void 0,done:!0}}while(!((t=r[e._i++])in e._t));return{value:t,done:!1}}),n(n.S,"Reflect",{enumerate:function(t){return new o(t)}})},{104:104,57:57,83:83}],263:[function(t,e,r){var n=t(124),i=t(83),o=t(57);i(i.S,"Reflect",{getOwnPropertyDescriptor:function(t,e){return n.f(o(t),e)}})},{124:124,57:57,83:83}],264:[function(t,e,r){var n=t(83),i=t(128),o=t(57);n(n.S,"Reflect",{getPrototypeOf:function(t){return i(o(t))}})},{128:128,57:57,83:83}],265:[function(t,e,r){function n(t,e){var r,s,u=arguments.length<3?t:arguments[2];return c(t)===u?t[e]:(r=i.f(t,e))?a(r,"value")?r.value:void 0!==r.get?r.get.call(u):void 0:f(s=o(t))?n(s,e,u):void 0}var i=t(124),o=t(128),a=t(91),s=t(83),f=t(101),c=t(57);s(s.S,"Reflect",{get:n})},{101:101,124:124,128:128,57:57,83:83,91:91}],266:[function(t,e,r){var n=t(83);n(n.S,"Reflect",{has:function(t,e){return e in t}})},{83:83}],267:[function(t,e,r){var n=t(83),i=t(57),o=Object.isExtensible;n(n.S,"Reflect",{isExtensible:function(t){return i(t),!o||o(t)}})},{57:57,83:83}],268:[function(t,e,r){var n=t(83);n(n.S,"Reflect",{ownKeys:t(134)})},{134:134,83:83}],269:[function(t,e,r){var n=t(83),i=t(57),o=Object.preventExtensions;n(n.S,"Reflect",{preventExtensions:function(t){i(t);try{return o&&o(t),!0}catch(t){return!1}}})},{57:57,83:83}],270:[function(t,e,r){var n=t(83),i=t(146);i&&n(n.S,"Reflect",{setPrototypeOf:function(t,e){i.check(t,e);try{return i.set(t,e),!0}catch(t){return!1}}})},{146:146,83:83}],271:[function(t,e,r){function n(t,e,r){var f,d,l=arguments.length<4?t:arguments[3],p=o.f(u(t),e);if(!p){if(h(d=a(t)))return n(d,e,r,l);p=c(0)}if(s(p,"value")){if(!1===p.writable||!h(l))return!1;if(f=o.f(l,e)){if(f.get||f.set||!1===f.writable)return!1;f.value=r,i.f(l,e,f)}else i.f(l,e,c(0,r));return!0}return void 0!==p.set&&(p.set.call(l,r),!0)}var i=t(121),o=t(124),a=t(128),s=t(91),f=t(83),c=t(139),u=t(57),h=t(101);f(f.S,"Reflect",{set:n})},{101:101,121:121,124:124,128:128,139:139,57:57,83:83,91:91}],272:[function(t,e,r){var n=t(90),i=t(95),o=t(121).f,a=t(126).f,s=t(102),f=t(87),c=n.RegExp,u=c,h=c.prototype,d=/a/g,l=/a/g,p=new c(d)!==d;if(t(79)&&(!p||t(85)(function(){return l[t(176)("match")]=!1,c(d)!=d||c(l)==l||"/a/i"!=c(d,"i")}))){c=function(t,e){var r=this instanceof c,n=s(t),o=void 0===e;return!r&&n&&t.constructor===c&&o?t:i(p?new u(n&&!o?t.source:t,e):u((n=t instanceof c)?t.source:t,n&&o?f.call(t):e),r?this:h,c)};for(var b=a(u),v=0;b.length>v;)!function(t){t in c||o(c,t,{configurable:!0,get:function(){return u[t]},set:function(e){u[t]=e}})}(b[v++]);h.constructor=c,c.prototype=h,t(141)(n,"RegExp",c)}t(147)("RegExp")},{102:102,121:121,126:126,141:141,147:147,176:176,79:79,85:85,87:87,90:90,95:95}],273:[function(t,e,r){t(79)&&"g"!=/./g.flags&&t(121).f(RegExp.prototype,"flags",{configurable:!0,get:t(87)})},{121:121,79:79,87:87}],274:[function(t,e,r){t(86)("match",1,function(t,e,r){return[function(r){"use strict";var n=t(this),i=void 0==r?void 0:r[e];return void 0!==i?i.call(r,n):new RegExp(r)[e](String(n))},r]})},{86:86}],275:[function(t,e,r){t(86)("replace",2,function(t,e,r){return[function(n,i){"use strict";var o=t(this),a=void 0==n?void 0:n[e];return void 0!==a?a.call(n,o,i):r.call(String(o),n,i)},r]})},{86:86}],276:[function(t,e,r){t(86)("search",1,function(t,e,r){return[function(r){"use strict";var n=t(this),i=void 0==r?void 0:r[e];return void 0!==i?i.call(r,n):new RegExp(r)[e](String(n))},r]})},{86:86}],277:[function(t,e,r){t(86)("split",2,function(e,r,n){"use strict";var i=t(102),o=n,a=[].push,s="length";if("c"=="abbc".split(/(b)*/)[1]||4!="test".split(/(?:)/,-1)[s]||2!="ab".split(/(?:ab)*/)[s]||4!=".".split(/(.?)(.?)/)[s]||".".split(/()()/)[s]>1||"".split(/.?/)[s]){var f=void 0===/()??/.exec("")[1];n=function(t,e){var r=String(this);if(void 0===t&&0===e)return[];if(!i(t))return o.call(r,t,e);var n,c,u,h,d,l=[],p=(t.ignoreCase?"i":"")+(t.multiline?"m":"")+(t.unicode?"u":"")+(t.sticky?"y":""),b=0,v=void 0===e?4294967295:e>>>0,y=new RegExp(t.source,p+"g");for(f||(n=new RegExp("^"+y.source+"$(?!\\s)",p));(c=y.exec(r))&&!((u=c.index+c[0][s])>b&&(l.push(r.slice(b,c.index)),!f&&c[s]>1&&c[0].replace(n,function(){for(d=1;d<arguments[s]-2;d++)void 0===arguments[d]&&(c[d]=void 0)}),c[s]>1&&c.index<r[s]&&a.apply(l,c.slice(1)),h=c[0][s],b=u,l[s]>=v));)y.lastIndex===c.index&&y.lastIndex++;return b===r[s]?!h&&y.test("")||l.push(""):l.push(r.slice(b)),l[s]>v?l.slice(0,v):l}}else"0".split(void 0,0)[s]&&(n=function(t,e){return void 0===t&&0===e?[]:o.call(this,t,e)});return[function(t,i){var o=e(this),a=void 0==t?void 0:t[r];return void 0!==a?a.call(t,o,i):n.call(String(o),t,i)},n]})},{102:102,86:86}],278:[function(t,e,r){"use strict";t(273);var n=t(57),i=t(87),o=t(79),a=/./.toString,s=function(e){t(141)(RegExp.prototype,"toString",e,!0)};t(85)(function(){return"/a/b"!=a.call({source:"a",flags:"b"})})?s(function(){var t=n(this);return"/".concat(t.source,"/","flags"in t?t.flags:!o&&t instanceof RegExp?i.call(t):void 0)}):"toString"!=a.name&&s(function(){return a.call(this)})},{141:141,273:273,57:57,79:79,85:85,87:87}],279:[function(t,e,r){"use strict";var n=t(69),i=t(173);e.exports=t(72)("Set",function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},{add:function(t){return n.def(i(this,"Set"),t=0===t?0:t,t)}},n)},{173:173,69:69,72:72}],280:[function(t,e,r){"use strict";t(155)("anchor",function(t){return function(e){return t(this,"a","name",e)}})},{155:155}],281:[function(t,e,r){"use strict";t(155)("big",function(t){return function(){return t(this,"big","","")}})},{155:155}],282:[function(t,e,r){"use strict";t(155)("blink",function(t){return function(){return t(this,"blink","","")}})},{155:155}],283:[function(t,e,r){"use strict";t(155)("bold",function(t){return function(){return t(this,"b","","")}})},{155:155}],284:[function(t,e,r){"use strict";var n=t(83),i=t(153)(!1);n(n.P,"String",{codePointAt:function(t){return i(this,t)}})},{153:153,83:83}],285:[function(t,e,r){"use strict";var n=t(83),i=t(165),o=t(154),a="".endsWith;n(n.P+n.F*t(84)("endsWith"),"String",{endsWith:function(t){var e=o(this,t,"endsWith"),r=arguments.length>1?arguments[1]:void 0,n=i(e.length),s=void 0===r?n:Math.min(i(r),n),f=String(t);return a?a.call(e,f,s):e.slice(s-f.length,s)===f}})},{154:154,165:165,83:83,84:84}],286:[function(t,e,r){"use strict";t(155)("fixed",function(t){return function(){return t(this,"tt","","")}})},{155:155}],287:[function(t,e,r){"use strict";t(155)("fontcolor",function(t){return function(e){return t(this,"font","color",e)}})},{155:155}],288:[function(t,e,r){"use strict";t(155)("fontsize",function(t){return function(e){return t(this,"font","size",e)}})},{155:155}],289:[function(t,e,r){var n=t(83),i=t(161),o=String.fromCharCode,a=String.fromCodePoint;n(n.S+n.F*(!!a&&1!=a.length),"String",{fromCodePoint:function(t){for(var e,r=[],n=arguments.length,a=0;n>a;){if(e=+arguments[a++],i(e,1114111)!==e)throw RangeError(e+" is not a valid code point");r.push(e<65536?o(e):o(55296+((e-=65536)>>10),e%1024+56320))}return r.join("")}})},{161:161,83:83}],290:[function(t,e,r){"use strict";var n=t(83),i=t(154);n(n.P+n.F*t(84)("includes"),"String",{includes:function(t){return!!~i(this,t,"includes").indexOf(t,arguments.length>1?arguments[1]:void 0)}})},{154:154,83:83,84:84}],291:[function(t,e,r){"use strict"
;t(155)("italics",function(t){return function(){return t(this,"i","","")}})},{155:155}],292:[function(t,e,r){"use strict";var n=t(153)(!0);t(105)(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,e=this._t,r=this._i;return r>=e.length?{value:void 0,done:!0}:(t=n(e,r),this._i+=t.length,{value:t,done:!1})})},{105:105,153:153}],293:[function(t,e,r){"use strict";t(155)("link",function(t){return function(e){return t(this,"a","href",e)}})},{155:155}],294:[function(t,e,r){var n=t(83),i=t(164),o=t(165);n(n.S,"String",{raw:function(t){for(var e=i(t.raw),r=o(e.length),n=arguments.length,a=[],s=0;r>s;)a.push(String(e[s++])),s<n&&a.push(String(arguments[s]));return a.join("")}})},{164:164,165:165,83:83}],295:[function(t,e,r){var n=t(83);n(n.P,"String",{repeat:t(157)})},{157:157,83:83}],296:[function(t,e,r){"use strict";t(155)("small",function(t){return function(){return t(this,"small","","")}})},{155:155}],297:[function(t,e,r){"use strict";var n=t(83),i=t(165),o=t(154),a="".startsWith;n(n.P+n.F*t(84)("startsWith"),"String",{startsWith:function(t){var e=o(this,t,"startsWith"),r=i(Math.min(arguments.length>1?arguments[1]:void 0,e.length)),n=String(t);return a?a.call(e,n,r):e.slice(r,r+n.length)===n}})},{154:154,165:165,83:83,84:84}],298:[function(t,e,r){"use strict";t(155)("strike",function(t){return function(){return t(this,"strike","","")}})},{155:155}],299:[function(t,e,r){"use strict";t(155)("sub",function(t){return function(){return t(this,"sub","","")}})},{155:155}],300:[function(t,e,r){"use strict";t(155)("sup",function(t){return function(){return t(this,"sup","","")}})},{155:155}],301:[function(t,e,r){"use strict";t(158)("trim",function(t){return function(){return t(this,3)}})},{158:158}],302:[function(t,e,r){"use strict";var n=t(90),i=t(91),o=t(79),a=t(83),s=t(141),f=t(115).KEY,c=t(85),u=t(150),h=t(148),d=t(171),l=t(176),p=t(175),b=t(174),v=t(82),y=t(99),g=t(57),m=t(101),w=t(164),_=t(167),S=t(139),E=t(120),k=t(125),M=t(124),A=t(121),x=t(130),I=M.f,R=A.f,B=k.f,T=n.Symbol,P=n.JSON,C=P&&P.stringify,O=l("_hidden"),j=l("toPrimitive"),N={}.propertyIsEnumerable,L=u("symbol-registry"),D=u("symbols"),F=u("op-symbols"),U=Object.prototype,q="function"==typeof T,z=n.QObject,V=!z||!z.prototype||!z.prototype.findChild,G=o&&c(function(){return 7!=E(R({},"a",{get:function(){return R(this,"a",{value:7}).a}})).a})?function(t,e,r){var n=I(U,e);n&&delete U[e],R(t,e,r),n&&t!==U&&R(U,e,n)}:R,K=function(t){var e=D[t]=E(T.prototype);return e._k=t,e},W=q&&"symbol"==typeof T.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof T},H=function(t,e,r){return t===U&&H(F,e,r),g(t),e=_(e,!0),g(r),i(D,e)?(r.enumerable?(i(t,O)&&t[O][e]&&(t[O][e]=!1),r=E(r,{enumerable:S(0,!1)})):(i(t,O)||R(t,O,S(1,{})),t[O][e]=!0),G(t,e,r)):R(t,e,r)},X=function(t,e){g(t);for(var r,n=v(e=w(e)),i=0,o=n.length;o>i;)H(t,r=n[i++],e[r]);return t},J=function(t,e){return void 0===e?E(t):X(E(t),e)},Y=function(t){var e=N.call(this,t=_(t,!0));return!(this===U&&i(D,t)&&!i(F,t))&&(!(e||!i(this,t)||!i(D,t)||i(this,O)&&this[O][t])||e)},Z=function(t,e){if(t=w(t),e=_(e,!0),t!==U||!i(D,e)||i(F,e)){var r=I(t,e);return!r||!i(D,e)||i(t,O)&&t[O][e]||(r.enumerable=!0),r}},Q=function(t){for(var e,r=B(w(t)),n=[],o=0;r.length>o;)i(D,e=r[o++])||e==O||e==f||n.push(e);return n},$=function(t){for(var e,r=t===U,n=B(r?F:w(t)),o=[],a=0;n.length>a;)!i(D,e=n[a++])||r&&!i(U,e)||o.push(D[e]);return o};q||(T=function(){if(this instanceof T)throw TypeError("Symbol is not a constructor!");var t=d(arguments.length>0?arguments[0]:void 0),e=function(r){this===U&&e.call(F,r),i(this,O)&&i(this[O],t)&&(this[O][t]=!1),G(this,t,S(1,r))};return o&&V&&G(U,t,{configurable:!0,set:e}),K(t)},s(T.prototype,"toString",function(){return this._k}),M.f=Z,A.f=H,t(126).f=k.f=Q,t(131).f=Y,t(127).f=$,o&&!t(109)&&s(U,"propertyIsEnumerable",Y,!0),p.f=function(t){return K(l(t))}),a(a.G+a.W+a.F*!q,{Symbol:T});for(var tt="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),et=0;tt.length>et;)l(tt[et++]);for(var rt=x(l.store),nt=0;rt.length>nt;)b(rt[nt++]);a(a.S+a.F*!q,"Symbol",{for:function(t){return i(L,t+="")?L[t]:L[t]=T(t)},keyFor:function(t){if(!W(t))throw TypeError(t+" is not a symbol!");for(var e in L)if(L[e]===t)return e},useSetter:function(){V=!0},useSimple:function(){V=!1}}),a(a.S+a.F*!q,"Object",{create:J,defineProperty:H,defineProperties:X,getOwnPropertyDescriptor:Z,getOwnPropertyNames:Q,getOwnPropertySymbols:$}),P&&a(a.S+a.F*(!q||c(function(){var t=T();return"[null]"!=C([t])||"{}"!=C({a:t})||"{}"!=C(Object(t))})),"JSON",{stringify:function(t){for(var e,r,n=[t],i=1;arguments.length>i;)n.push(arguments[i++]);if(r=e=n[1],(m(e)||void 0!==t)&&!W(t))return y(e)||(e=function(t,e){if("function"==typeof r&&(e=r.call(this,t,e)),!W(e))return e}),n[1]=e,C.apply(P,n)}}),T.prototype[j]||t(92)(T.prototype,j,T.prototype.valueOf),h(T,"Symbol"),h(Math,"Math",!0),h(n.JSON,"JSON",!0)},{101:101,109:109,115:115,120:120,121:121,124:124,125:125,126:126,127:127,130:130,131:131,139:139,141:141,148:148,150:150,164:164,167:167,171:171,174:174,175:175,176:176,57:57,79:79,82:82,83:83,85:85,90:90,91:91,92:92,99:99}],303:[function(t,e,r){"use strict";var n=t(83),i=t(170),o=t(169),a=t(57),s=t(161),f=t(165),c=t(101),u=t(90).ArrayBuffer,h=t(151),d=o.ArrayBuffer,l=o.DataView,p=i.ABV&&u.isView,b=d.prototype.slice,v=i.VIEW;n(n.G+n.W+n.F*(u!==d),{ArrayBuffer:d}),n(n.S+n.F*!i.CONSTR,"ArrayBuffer",{isView:function(t){return p&&p(t)||c(t)&&v in t}}),n(n.P+n.U+n.F*t(85)(function(){return!new d(2).slice(1,void 0).byteLength}),"ArrayBuffer",{slice:function(t,e){if(void 0!==b&&void 0===e)return b.call(a(this),t);for(var r=a(this).byteLength,n=s(t,r),i=s(void 0===e?r:e,r),o=new(h(this,d))(f(i-n)),c=new l(this),u=new l(o),p=0;n<i;)u.setUint8(p++,c.getUint8(n++));return o}}),t(147)("ArrayBuffer")},{101:101,147:147,151:151,161:161,165:165,169:169,170:170,57:57,83:83,85:85,90:90}],304:[function(t,e,r){var n=t(83);n(n.G+n.W+n.F*!t(170).ABV,{DataView:t(169).DataView})},{169:169,170:170,83:83}],305:[function(t,e,r){t(168)("Float32",4,function(t){return function(e,r,n){return t(this,e,r,n)}})},{168:168}],306:[function(t,e,r){t(168)("Float64",8,function(t){return function(e,r,n){return t(this,e,r,n)}})},{168:168}],307:[function(t,e,r){t(168)("Int16",2,function(t){return function(e,r,n){return t(this,e,r,n)}})},{168:168}],308:[function(t,e,r){t(168)("Int32",4,function(t){return function(e,r,n){return t(this,e,r,n)}})},{168:168}],309:[function(t,e,r){t(168)("Int8",1,function(t){return function(e,r,n){return t(this,e,r,n)}})},{168:168}],310:[function(t,e,r){t(168)("Uint16",2,function(t){return function(e,r,n){return t(this,e,r,n)}})},{168:168}],311:[function(t,e,r){t(168)("Uint32",4,function(t){return function(e,r,n){return t(this,e,r,n)}})},{168:168}],312:[function(t,e,r){t(168)("Uint8",1,function(t){return function(e,r,n){return t(this,e,r,n)}})},{168:168}],313:[function(t,e,r){t(168)("Uint8",1,function(t){return function(e,r,n){return t(this,e,r,n)}},!0)},{168:168}],314:[function(t,e,r){"use strict";var n,i=t(62)(0),o=t(141),a=t(115),s=t(119),f=t(71),c=t(101),u=t(85),h=t(173),d=a.getWeak,l=Object.isExtensible,p=f.ufstore,b={},v=function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},y={get:function(t){if(c(t)){var e=d(t);return!0===e?p(h(this,"WeakMap")).get(t):e?e[this._i]:void 0}},set:function(t,e){return f.def(h(this,"WeakMap"),t,e)}},g=e.exports=t(72)("WeakMap",v,y,f,!0,!0);u(function(){return 7!=(new g).set((Object.freeze||Object)(b),7).get(b)})&&(n=f.getConstructor(v,"WeakMap"),s(n.prototype,y),a.NEED=!0,i(["delete","has","get","set"],function(t){var e=g.prototype,r=e[t];o(e,t,function(e,i){if(c(e)&&!l(e)){this._f||(this._f=new n);var o=this._f[t](e,i);return"set"==t?this:o}return r.call(this,e,i)})}))},{101:101,115:115,119:119,141:141,173:173,62:62,71:71,72:72,85:85}],315:[function(t,e,r){"use strict";var n=t(71),i=t(173);t(72)("WeakSet",function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},{add:function(t){return n.def(i(this,"WeakSet"),t,!0)}},n,!1,!0)},{173:173,71:71,72:72}],316:[function(t,e,r){"use strict";var n=t(83),i=t(88),o=t(166),a=t(165),s=t(53),f=t(65);n(n.P,"Array",{flatMap:function(t){var e,r,n=o(this);return s(t),e=a(n.length),r=f(n,0),i(r,n,n,e,0,1,t,arguments[1]),r}}),t(55)("flatMap")},{165:165,166:166,53:53,55:55,65:65,83:83,88:88}],317:[function(t,e,r){"use strict";var n=t(83),i=t(88),o=t(166),a=t(165),s=t(163),f=t(65);n(n.P,"Array",{flatten:function(){var t=arguments[0],e=o(this),r=a(e.length),n=f(e,0);return i(n,e,e,r,0,void 0===t?1:s(t)),n}}),t(55)("flatten")},{163:163,165:165,166:166,55:55,65:65,83:83,88:88}],318:[function(t,e,r){"use strict";var n=t(83),i=t(61)(!0);n(n.P,"Array",{includes:function(t){return i(this,t,arguments.length>1?arguments[1]:void 0)}}),t(55)("includes")},{55:55,61:61,83:83}],319:[function(t,e,r){var n=t(83),i=t(117)(),o=t(90).process,a="process"==t(68)(o);n(n.G,{asap:function(t){var e=a&&o.domain;i(e?e.bind(t):t)}})},{117:117,68:68,83:83,90:90}],320:[function(t,e,r){var n=t(83),i=t(68);n(n.S,"Error",{isError:function(t){return"Error"===i(t)}})},{68:68,83:83}],321:[function(t,e,r){var n=t(83);n(n.G,{global:t(90)})},{83:83,90:90}],322:[function(t,e,r){t(144)("Map")},{144:144}],323:[function(t,e,r){t(145)("Map")},{145:145}],324:[function(t,e,r){var n=t(83);n(n.P+n.R,"Map",{toJSON:t(70)("Map")})},{70:70,83:83}],325:[function(t,e,r){var n=t(83);n(n.S,"Math",{clamp:function(t,e,r){return Math.min(r,Math.max(e,t))}})},{83:83}],326:[function(t,e,r){var n=t(83);n(n.S,"Math",{DEG_PER_RAD:Math.PI/180})},{83:83}],327:[function(t,e,r){var n=t(83),i=180/Math.PI;n(n.S,"Math",{degrees:function(t){return t*i}})},{83:83}],328:[function(t,e,r){var n=t(83),i=t(113),o=t(111);n(n.S,"Math",{fscale:function(t,e,r,n,a){return o(i(t,e,r,n,a))}})},{111:111,113:113,83:83}],329:[function(t,e,r){var n=t(83);n(n.S,"Math",{iaddh:function(t,e,r,n){var i=t>>>0,o=e>>>0,a=r>>>0;return o+(n>>>0)+((i&a|(i|a)&~(i+a>>>0))>>>31)|0}})},{83:83}],330:[function(t,e,r){var n=t(83);n(n.S,"Math",{imulh:function(t,e){var r=+t,n=+e,i=65535&r,o=65535&n,a=r>>16,s=n>>16,f=(a*o>>>0)+(i*o>>>16);return a*s+(f>>16)+((i*s>>>0)+(65535&f)>>16)}})},{83:83}],331:[function(t,e,r){var n=t(83);n(n.S,"Math",{isubh:function(t,e,r,n){var i=t>>>0,o=e>>>0,a=r>>>0;return o-(n>>>0)-((~i&a|~(i^a)&i-a>>>0)>>>31)|0}})},{83:83}],332:[function(t,e,r){var n=t(83);n(n.S,"Math",{RAD_PER_DEG:180/Math.PI})},{83:83}],333:[function(t,e,r){var n=t(83),i=Math.PI/180;n(n.S,"Math",{radians:function(t){return t*i}})},{83:83}],334:[function(t,e,r){var n=t(83);n(n.S,"Math",{scale:t(113)})},{113:113,83:83}],335:[function(t,e,r){var n=t(83);n(n.S,"Math",{signbit:function(t){return(t=+t)!=t?t:0==t?1/t==1/0:t>0}})},{83:83}],336:[function(t,e,r){var n=t(83);n(n.S,"Math",{umulh:function(t,e){var r=+t,n=+e,i=65535&r,o=65535&n,a=r>>>16,s=n>>>16,f=(a*o>>>0)+(i*o>>>16);return a*s+(f>>>16)+((i*s>>>0)+(65535&f)>>>16)}})},{83:83}],337:[function(t,e,r){"use strict";var n=t(83),i=t(166),o=t(53),a=t(121);t(79)&&n(n.P+t(123),"Object",{__defineGetter__:function(t,e){a.f(i(this),t,{get:o(e),enumerable:!0,configurable:!0})}})},{121:121,123:123,166:166,53:53,79:79,83:83}],338:[function(t,e,r){"use strict";var n=t(83),i=t(166),o=t(53),a=t(121);t(79)&&n(n.P+t(123),"Object",{__defineSetter__:function(t,e){a.f(i(this),t,{set:o(e),enumerable:!0,configurable:!0})}})},{121:121,123:123,166:166,53:53,79:79,83:83}],339:[function(t,e,r){var n=t(83),i=t(133)(!0);n(n.S,"Object",{entries:function(t){return i(t)}})},{133:133,83:83}],340:[function(t,e,r){var n=t(83),i=t(134),o=t(164),a=t(124),s=t(74);n(n.S,"Object",{getOwnPropertyDescriptors:function(t){for(var e,r,n=o(t),f=a.f,c=i(n),u={},h=0;c.length>h;)void 0!==(r=f(n,e=c[h++]))&&s(u,e,r);return u}})},{124:124,134:134,164:164,74:74,83:83}],341:[function(t,e,r){"use strict";var n=t(83),i=t(166),o=t(167),a=t(128),s=t(124).f;t(79)&&n(n.P+t(123),"Object",{__lookupGetter__:function(t){var e,r=i(this),n=o(t,!0);do{if(e=s(r,n))return e.get}while(r=a(r))}})},{123:123,124:124,128:128,166:166,167:167,79:79,83:83}],342:[function(t,e,r){"use strict";var n=t(83),i=t(166),o=t(167),a=t(128),s=t(124).f;t(79)&&n(n.P+t(123),"Object",{__lookupSetter__:function(t){var e,r=i(this),n=o(t,!0);do{if(e=s(r,n))return e.set}while(r=a(r))}})},{123:123,124:124,128:128,166:166,167:167,79:79,83:83}],343:[function(t,e,r){var n=t(83),i=t(133)(!1);n(n.S,"Object",{values:function(t){return i(t)}})},{133:133,83:83}],344:[function(t,e,r){"use strict";var n=t(83),i=t(90),o=t(73),a=t(117)(),s=t(176)("observable"),f=t(53),c=t(57),u=t(56),h=t(140),d=t(92),l=t(89),p=l.RETURN,b=function(t){return null==t?void 0:f(t)},v=function(t){var e=t._c;e&&(t._c=void 0,e())},y=function(t){return void 0===t._o},g=function(t){y(t)||(t._o=void 0,v(t))},m=function(t,e){c(t),this._c=void 0,this._o=t,t=new w(this);try{var r=e(t),n=r;null!=r&&("function"==typeof r.unsubscribe?r=function(){n.unsubscribe()}:f(r),this._c=r)}catch(e){return void t.error(e)}y(this)&&v(this)};m.prototype=h({},{unsubscribe:function(){g(this)}});var w=function(t){this._s=t};w.prototype=h({},{next:function(t){var e=this._s;if(!y(e)){var r=e._o;try{var n=b(r.next);if(n)return n.call(r,t)}catch(t){try{g(e)}finally{throw t}}}},error:function(t){var e=this._s;if(y(e))throw t;var r=e._o;e._o=void 0;try{var n=b(r.error);if(!n)throw t;t=n.call(r,t)}catch(t){try{v(e)}finally{throw t}}return v(e),t},complete:function(t){var e=this._s;if(!y(e)){var r=e._o;e._o=void 0;try{var n=b(r.complete);t=n?n.call(r,t):void 0}catch(t){try{v(e)}finally{throw t}}return v(e),t}}});var _=function(t){u(this,_,"Observable","_f")._f=f(t)};h(_.prototype,{subscribe:function(t){return new m(t,this._f)},forEach:function(t){var e=this;return new(o.Promise||i.Promise)(function(r,n){f(t);var i=e.subscribe({next:function(e){try{return t(e)}catch(t){n(t),i.unsubscribe()}},error:n,complete:r})})}}),h(_,{from:function(t){var e="function"==typeof this?this:_,r=b(c(t)[s]);if(r){var n=c(r.call(t));return n.constructor===e?n:new e(function(t){return n.subscribe(t)})}return new e(function(e){var r=!1;return a(function(){if(!r){try{if(l(t,!1,function(t){if(e.next(t),r)return p})===p)return}catch(t){if(r)throw t;return void e.error(t)}e.complete()}}),function(){r=!0}})},of:function(){for(var t=0,e=arguments.length,r=new Array(e);t<e;)r[t]=arguments[t++];return new("function"==typeof this?this:_)(function(t){var e=!1;return a(function(){if(!e){for(var n=0;n<r.length;++n)if(t.next(r[n]),e)return;t.complete()}}),function(){e=!0}})}}),d(_.prototype,s,function(){return this}),n(n.G,{Observable:_}),t(147)("Observable")},{117:117,140:140,147:147,176:176,53:53,56:56,57:57,73:73,83:83,89:89,90:90,92:92}],345:[function(t,e,r){"use strict";var n=t(83),i=t(73),o=t(90),a=t(151),s=t(138);n(n.P+n.R,"Promise",{finally:function(t){var e=a(this,i.Promise||o.Promise),r="function"==typeof t;return this.then(r?function(r){return s(e,t()).then(function(){return r})}:t,r?function(r){return s(e,t()).then(function(){throw r})}:t)}})},{138:138,151:151,73:73,83:83,90:90}],346:[function(t,e,r){"use strict";var n=t(83),i=t(118),o=t(137);n(n.S,"Promise",{try:function(t){var e=i.f(this),r=o(t);return(r.e?e.reject:e.resolve)(r.v),e.promise}})},{118:118,137:137,83:83}],347:[function(t,e,r){var n=t(116),i=t(57),o=n.key,a=n.set;n.exp({defineMetadata:function(t,e,r,n){a(t,e,i(r),o(n))}})},{116:116,57:57}],348:[function(t,e,r){var n=t(116),i=t(57),o=n.key,a=n.map,s=n.store;n.exp({deleteMetadata:function(t,e){var r=arguments.length<3?void 0:o(arguments[2]),n=a(i(e),r,!1);if(void 0===n||!n.delete(t))return!1;if(n.size)return!0;var f=s.get(e);return f.delete(r),!!f.size||s.delete(e)}})},{116:116,57:57}],349:[function(t,e,r){var n=t(279),i=t(60),o=t(116),a=t(57),s=t(128),f=o.keys,c=o.key,u=function(t,e){var r=f(t,e),o=s(t);if(null===o)return r;var a=u(o,e);return a.length?r.length?i(new n(r.concat(a))):a:r};o.exp({getMetadataKeys:function(t){return u(a(t),arguments.length<2?void 0:c(arguments[1]))}})},{116:116,128:128,279:279,57:57,60:60}],350:[function(t,e,r){var n=t(116),i=t(57),o=t(128),a=n.has,s=n.get,f=n.key,c=function(t,e,r){if(a(t,e,r))return s(t,e,r);var n=o(e);return null!==n?c(t,n,r):void 0};n.exp({getMetadata:function(t,e){return c(t,i(e),arguments.length<3?void 0:f(arguments[2]))}})},{116:116,128:128,57:57}],351:[function(t,e,r){var n=t(116),i=t(57),o=n.keys,a=n.key;n.exp({getOwnMetadataKeys:function(t){return o(i(t),arguments.length<2?void 0:a(arguments[1]))}})},{116:116,57:57}],352:[function(t,e,r){var n=t(116),i=t(57),o=n.get,a=n.key;n.exp({getOwnMetadata:function(t,e){return o(t,i(e),arguments.length<3?void 0:a(arguments[2]))}})},{116:116,57:57}],353:[function(t,e,r){var n=t(116),i=t(57),o=t(128),a=n.has,s=n.key,f=function(t,e,r){if(a(t,e,r))return!0;var n=o(e);return null!==n&&f(t,n,r)};n.exp({hasMetadata:function(t,e){return f(t,i(e),arguments.length<3?void 0:s(arguments[2]))}})},{116:116,128:128,57:57}],354:[function(t,e,r){var n=t(116),i=t(57),o=n.has,a=n.key;n.exp({hasOwnMetadata:function(t,e){return o(t,i(e),arguments.length<3?void 0:a(arguments[2]))}})},{116:116,57:57}],355:[function(t,e,r){var n=t(116),i=t(57),o=t(53),a=n.key,s=n.set;n.exp({metadata:function(t,e){return function(r,n){s(t,e,(void 0!==n?i:o)(r),a(n))}}})},{116:116,53:53,57:57}],356:[function(t,e,r){t(144)("Set")},{144:144}],357:[function(t,e,r){t(145)("Set")},{145:145}],358:[function(t,e,r){var n=t(83);n(n.P+n.R,"Set",{toJSON:t(70)("Set")})},{70:70,83:83}],359:[function(t,e,r){"use strict";var n=t(83),i=t(153)(!0);n(n.P,"String",{at:function(t){return i(this,t)}})},{153:153,83:83}],360:[function(t,e,r){"use strict";var n=t(83),i=t(78),o=t(165),a=t(102),s=t(87),f=RegExp.prototype,c=function(t,e){this._r=t,this._s=e};t(104)(c,"RegExp String",function(){var t=this._r.exec(this._s);return{value:t,done:null===t}}),n(n.P,"String",{matchAll:function(t){if(i(this),!a(t))throw TypeError(t+" is not a regexp!");var e=String(this),r="flags"in f?String(t.flags):s.call(t),n=new RegExp(t.source,~r.indexOf("g")?r:"g"+r);return n.lastIndex=o(t.lastIndex),new c(n,e)}})},{102:102,104:104,165:165,78:78,83:83,87:87}],361:[function(t,e,r){"use strict";var n=t(83),i=t(156),o=t(172);n(n.P+n.F*/Version\/10\.\d+(\.\d+)? Safari\//.test(o),"String",{padEnd:function(t){return i(this,t,arguments.length>1?arguments[1]:void 0,!1)}})},{156:156,172:172,83:83}],362:[function(t,e,r){"use strict";var n=t(83),i=t(156),o=t(172);n(n.P+n.F*/Version\/10\.\d+(\.\d+)? Safari\//.test(o),"String",{padStart:function(t){return i(this,t,arguments.length>1?arguments[1]:void 0,!0)}})},{156:156,172:172,83:83}],363:[function(t,e,r){"use strict";t(158)("trimLeft",function(t){return function(){return t(this,1)}},"trimStart")},{158:158}],364:[function(t,e,r){"use strict";t(158)("trimRight",function(t){return function(){return t(this,2)}},"trimEnd")},{158:158}],365:[function(t,e,r){t(174)("asyncIterator")},{174:174}],366:[function(t,e,r){t(174)("observable")},{174:174}],367:[function(t,e,r){var n=t(83);n(n.S,"System",{global:t(90)})},{83:83,90:90}],368:[function(t,e,r){t(144)("WeakMap")},{144:144}],369:[function(t,e,r){t(145)("WeakMap")},{145:145}],370:[function(t,e,r){t(144)("WeakSet")},{144:144}],371:[function(t,e,r){t(145)("WeakSet")},{145:145}],372:[function(t,e,r){for(var n=t(189),i=t(130),o=t(141),a=t(90),s=t(92),f=t(108),c=t(176),u=c("iterator"),h=c("toStringTag"),d=f.Array,l={CSSRuleList:!0,CSSStyleDeclaration:!1,CSSValueList:!1,ClientRectList:!1,DOMRectList:!1,DOMStringList:!1,DOMTokenList:!0,DataTransferItemList:!1,FileList:!1,HTMLAllCollection:!1,HTMLCollection:!1,HTMLFormElement:!1,HTMLSelectElement:!1,MediaList:!0,MimeTypeArray:!1,NamedNodeMap:!1,NodeList:!0,PaintRequestList:!1,Plugin:!1,PluginArray:!1,SVGLengthList:!1,SVGNumberList:!1,SVGPathSegList:!1,SVGPointList:!1,SVGStringList:!1,SVGTransformList:!1,SourceBufferList:!1,StyleSheetList:!0,TextTrackCueList:!1,TextTrackList:!1,TouchList:!1},p=i(l),b=0;b<p.length;b++){var v,y=p[b],g=l[y],m=a[y],w=m&&m.prototype;if(w&&(w[u]||s(w,u,d),w[h]||s(w,h,y),f[y]=d,g))for(v in n)w[v]||o(w,v,n[v],!0)}},{108:108,130:130,141:141,176:176,189:189,90:90,92:92}],373:[function(t,e,r){var n=t(83),i=t(160);n(n.G+n.B,{setImmediate:i.set,clearImmediate:i.clear})},{160:160,83:83}],374:[function(t,e,r){var n=t(90),i=t(83),o=t(172),a=[].slice,s=/MSIE .\./.test(o),f=function(t){return function(e,r){var n=arguments.length>2,i=!!n&&a.call(arguments,2);return t(n?function(){("function"==typeof e?e:Function(e)).apply(this,i)}:e,r)}};i(i.G+i.B+i.F*s,{setTimeout:f(n.setTimeout),setInterval:f(n.setInterval)})},{172:172,83:83,90:90}],375:[function(t,e,r){t(302),t(239),t(241),t(240),t(243),t(245),t(250),t(244),t(242),t(252),t(251),t(247),t(248),t(246),t(238),t(249),t(253),t(254),t(205),t(207),t(206),t(256),t(255),t(226),t(236),t(237),t(227),t(228),t(229),t(230),t(231),t(232),t(233),t(234),t(235),t(209),t(210),t(211),t(212),t(213),t(214),t(215),t(216),t(217),t(218),t(219),t(220),t(221),t(222),t(223),t(224),t(225),t(289),t(294),t(301),t(292),t(284),t(285),t(290),t(295),t(297),t(280),t(281),t(282),t(283),t(286),t(287),t(288),t(291),t(293),t(296),t(298),t(299),t(300),t(200),t(202),t(201),t(204),t(203),t(188),t(186),t(193),t(190),t(196),t(198),t(185),t(192),t(182),t(197),t(180),t(195),t(194),t(187),t(191),t(179),t(181),t(184),t(183),t(199),t(189),t(272),t(278),t(273),t(274),t(275),t(276),t(277),t(257),t(208),t(279),t(314),t(315),t(303),t(304),t(309),t(312),t(313),t(307),t(310),t(308),t(311),t(305),t(306),t(258),t(259),t(260),t(261),t(262),t(265),t(263),t(264),t(266),t(267),t(268),t(269),t(271),t(270),t(318),t(316),t(317),t(359),t(362),t(361),t(363),t(364),t(360),t(365),t(366),t(340),t(343),t(339),t(337),t(338),t(341),t(342),t(324),t(358),t(323),t(357),t(369),t(371),t(322),t(356),t(368),t(370),t(321),t(367),t(320),t(325),t(326),t(327),t(328),t(329),t(331),t(330),t(332),t(333),t(334),t(336),t(335),t(345),t(346),t(347),t(348),t(350),t(349),t(352),t(351),t(353),t(354),t(355),t(319),t(344),t(374),t(373),t(372),e.exports=t(73)},{179:179,180:180,181:181,182:182,183:183,184:184,185:185,186:186,187:187,188:188,189:189,190:190,191:191,192:192,193:193,194:194,195:195,196:196,197:197,198:198,199:199,200:200,201:201,202:202,203:203,204:204,205:205,206:206,207:207,208:208,209:209,210:210,211:211,212:212,213:213,214:214,215:215,216:216,217:217,218:218,219:219,220:220,221:221,222:222,223:223,224:224,225:225,226:226,227:227,228:228,229:229,230:230,231:231,232:232,233:233,234:234,235:235,236:236,237:237,238:238,239:239,240:240,241:241,242:242,243:243,244:244,245:245,246:246,247:247,248:248,249:249,250:250,251:251,252:252,253:253,254:254,255:255,256:256,257:257,258:258,259:259,260:260,261:261,262:262,263:263,264:264,265:265,266:266,267:267,268:268,269:269,270:270,271:271,272:272,273:273,274:274,275:275,276:276,277:277,278:278,279:279,280:280,281:281,282:282,283:283,284:284,285:285,286:286,287:287,288:288,289:289,290:290,291:291,292:292,293:293,294:294,295:295,296:296,297:297,298:298,299:299,300:300,301:301,302:302,303:303,304:304,305:305,306:306,307:307,308:308,309:309,310:310,311:311,312:312,313:313,314:314,315:315,316:316,317:317,318:318,319:319,320:320,321:321,322:322,323:323,324:324,325:325,326:326,327:327,328:328,329:329,330:330,331:331,332:332,333:333,334:334,335:335,336:336,337:337,338:338,339:339,340:340,341:341,342:342,343:343,344:344,345:345,346:346,347:347,348:348,349:349,350:350,351:351,352:352,353:353,354:354,355:355,356:356,357:357,358:358,359:359,360:360,361:361,362:362,363:363,364:364,365:365,366:366,367:367,368:368,369:369,370:370,371:371,372:372,373:373,374:374,73:73}],376:[function(t,e,r){(function(t){function e(t){return Array.isArray?Array.isArray(t):"[object Array]"===v(t)}function n(t){return"boolean"==typeof t}function i(t){return null===t}function o(t){return null==t}function a(t){return"number"==typeof t}function s(t){return"string"==typeof t}function f(t){return"symbol"==typeof t}function c(t){return void 0===t}function u(t){return"[object RegExp]"===v(t)}function h(t){return"object"==typeof t&&null!==t}function d(t){return"[object Date]"===v(t)}function l(t){return"[object Error]"===v(t)||t instanceof Error}function p(t){return"function"==typeof t}function b(t){return null===t||"boolean"==typeof t||"number"==typeof t||"string"==typeof t||"symbol"==typeof t||void 0===t}function v(t){return Object.prototype.toString.call(t)}r.isArray=e,r.isBoolean=n,r.isNull=i,r.isNullOrUndefined=o,r.isNumber=a,r.isString=s,r.isSymbol=f,r.isUndefined=c,r.isRegExp=u,r.isObject=h,r.isDate=d,r.isError=l,r.isFunction=p,r.isPrimitive=b,r.isBuffer=t.isBuffer}).call(this,{isBuffer:t(428)})},{428:428}],377:[function(t,e,r){(function(r){function n(t){this.curveType=s[t],this.curveType||(this.curveType={name:t}),this.curve=new o.ec(this.curveType.name),this.keys=void 0}function i(t,e,n){Array.isArray(t)||(t=t.toArray());var i=new r(t);if(n&&i.length<n){var o=new r(n-i.length);o.fill(0),i=r.concat([o,i])}return e?i.toString(e):i}var o=t(393),a=t(18);e.exports=function(t){return new n(t)};var s={secp256k1:{name:"secp256k1",byteLength:32},secp224r1:{name:"p224",byteLength:28},prime256v1:{name:"p256",byteLength:32},prime192v1:{name:"p192",byteLength:24},ed25519:{name:"ed25519",byteLength:32},secp384r1:{name:"p384",byteLength:48},secp521r1:{name:"p521",byteLength:66}};s.p224=s.secp224r1,s.p256=s.secp256r1=s.prime256v1,s.p192=s.secp192r1=s.prime192v1,s.p384=s.secp384r1,s.p521=s.secp521r1,n.prototype.generateKeys=function(t,e){return this.keys=this.curve.genKeyPair(),this.getPublicKey(t,e)},n.prototype.computeSecret=function(t,e,n){return e=e||"utf8",r.isBuffer(t)||(t=new r(t,e)),i(this.curve.keyFromPublic(t).getPublic().mul(this.keys.getPrivate()).getX(),n,this.curveType.byteLength)},n.prototype.getPublicKey=function(t,e){var r=this.keys.getPublic("compressed"===e,!0);return"hybrid"===e&&(r[r.length-1]%2?r[0]=7:r[0]=6),i(r,t)},n.prototype.getPrivateKey=function(t){return i(this.keys.getPrivate(),t)},n.prototype.setPublicKey=function(t,e){return e=e||"utf8",r.isBuffer(t)||(t=new r(t,e)),this.keys._importPublic(t),this},n.prototype.setPrivateKey=function(t,e){e=e||"utf8",r.isBuffer(t)||(t=new r(t,e));var n=new a(t);return n=n.toString(16),this.keys=this.curve.genKeyPair(),this.keys._importPrivate(n),this}}).call(this,t(50).Buffer)},{18:18,393:393,50:50}],378:[function(t,e,r){"use strict";function n(t){f.call(this,"digest"),this._hash=t}var i=t(427),o=t(430),a=t(470),s=t(474),f=t(51);i(n,f),n.prototype._update=function(t){this._hash.update(t)},n.prototype._final=function(){return this._hash.digest()},e.exports=function(t){return t=t.toLowerCase(),"md5"===t?new o:"rmd160"===t||"ripemd160"===t?new a:new n(s(t))}},{427:427,430:430,470:470,474:474,51:51}],379:[function(t,e,r){var n=t(430);e.exports=function(t){return(new n).update(t).digest()}},{430:430}],380:[function(t,e,r){"use strict";function n(t,e){a.call(this,"digest"),"string"==typeof e&&(e=s.from(e));var r="sha512"===t||"sha384"===t?128:64;if(this._alg=t,this._key=e,e.length>r){e=("rmd160"===t?new c:u(t)).update(e).digest()}else e.length<r&&(e=s.concat([e,h],r));for(var n=this._ipad=s.allocUnsafe(r),i=this._opad=s.allocUnsafe(r),o=0;o<r;o++)n[o]=54^e[o],i[o]=92^e[o];this._hash="rmd160"===t?new c:u(t),this._hash.update(n)}var i=t(427),o=t(381),a=t(51),s=t(471).Buffer,f=t(379),c=t(470),u=t(474),h=s.alloc(128);i(n,a),n.prototype._update=function(t){this._hash.update(t)},n.prototype._final=function(){var t=this._hash.digest();return("rmd160"===this._alg?new c:u(this._alg)).update(this._opad).update(t).digest()},e.exports=function(t,e){return t=t.toLowerCase(),"rmd160"===t||"ripemd160"===t?new n("rmd160",e):"md5"===t?new o(f,e):new n(t,e)}},{379:379,381:381,427:427,470:470,471:471,474:474,51:51}],381:[function(t,e,r){"use strict";function n(t,e){a.call(this,"digest"),"string"==typeof e&&(e=o.from(e)),this._alg=t,this._key=e,e.length>f?e=t(e):e.length<f&&(e=o.concat([e,s],f));for(var r=this._ipad=o.allocUnsafe(f),n=this._opad=o.allocUnsafe(f),i=0;i<f;i++)r[i]=54^e[i],n[i]=92^e[i];this._hash=[r]}var i=t(427),o=t(471).Buffer,a=t(51),s=o.alloc(128),f=64;i(n,a),n.prototype._update=function(t){this._hash.push(t)},n.prototype._final=function(){var t=this._alg(o.concat(this._hash));return this._alg(o.concat([this._opad,t]))},e.exports=n},{427:427,471:471,51:51}],382:[function(t,e,r){"use strict";r.randomBytes=r.rng=r.pseudoRandomBytes=r.prng=t(454),r.createHash=r.Hash=t(378),r.createHmac=r.Hmac=t(380);var n=t(42),i=Object.keys(n),o=["sha1","sha224","sha256","sha384","sha512","md5","rmd160"].concat(i);r.getHashes=function(){return o};var a=t(440);r.pbkdf2=a.pbkdf2,r.pbkdf2Sync=a.pbkdf2Sync;var s=t(38);r.Cipher=s.Cipher,r.createCipher=s.createCipher,r.Cipheriv=s.Cipheriv,r.createCipheriv=s.createCipheriv,r.Decipher=s.Decipher,r.createDecipher=s.createDecipher,r.Decipheriv=s.Decipheriv,r.createDecipheriv=s.createDecipheriv,r.getCiphers=s.getCiphers,r.listCiphers=s.listCiphers;var f=t(389);r.DiffieHellmanGroup=f.DiffieHellmanGroup,r.createDiffieHellmanGroup=f.createDiffieHellmanGroup,r.getDiffieHellman=f.getDiffieHellman,r.createDiffieHellman=f.createDiffieHellman,r.DiffieHellman=f.DiffieHellman;var c=t(45);r.createSign=c.createSign,r.Sign=c.Sign,r.createVerify=c.createVerify,r.Verify=c.Verify,r.createECDH=t(377);var u=t(448);r.publicEncrypt=u.publicEncrypt,r.privateEncrypt=u.privateEncrypt,r.publicDecrypt=u.publicDecrypt,r.privateDecrypt=u.privateDecrypt;var h=t(455);r.randomFill=h.randomFill,r.randomFillSync=h.randomFillSync,r.createCredentials=function(){throw new Error(["sorry, createCredentials is not implemented yet","we accept pull requests","https://github.com/crypto-browserify/crypto-browserify"].join("\n"))},r.constants={DH_CHECK_P_NOT_SAFE_PRIME:2,DH_CHECK_P_NOT_PRIME:1,DH_UNABLE_TO_CHECK_GENERATOR:4,DH_NOT_SUITABLE_GENERATOR:8,NPN_ENABLED:1,ALPN_ENABLED:1,RSA_PKCS1_PADDING:1,RSA_SSLV23_PADDING:2,RSA_NO_PADDING:3,RSA_PKCS1_OAEP_PADDING:4,RSA_X931_PADDING:5,RSA_PKCS1_PSS_PADDING:6,POINT_CONVERSION_COMPRESSED:2,POINT_CONVERSION_UNCOMPRESSED:4,POINT_CONVERSION_HYBRID:6}},{377:377,378:378,38:38,380:380,389:389,42:42,440:440,448:448,45:45,454:454,455:455}],383:[function(t,e,r){"use strict";r.utils=t(388),r.Cipher=t(385),r.DES=t(386),r.CBC=t(384),r.EDE=t(387)},{384:384,385:385,386:386,387:387,388:388}],384:[function(t,e,r){"use strict";function n(t){o.equal(t.length,8,"Invalid IV length"),this.iv=new Array(8);for(var e=0;e<this.iv.length;e++)this.iv[e]=t[e]}function i(t){function e(e){t.call(this,e),this._cbcInit()}a(e,t);for(var r=Object.keys(s),n=0;n<r.length;n++){var i=r[n];e.prototype[i]=s[i]}return e.create=function(t){return new e(t)},e}var o=t(432),a=t(427),s={};r.instantiate=i,s._cbcInit=function(){var t=new n(this.options.iv);this._cbcState=t},s._update=function(t,e,r,n){var i=this._cbcState,o=this.constructor.super_.prototype,a=i.iv;if("encrypt"===this.type){for(var s=0;s<this.blockSize;s++)a[s]^=t[e+s];o._update.call(this,a,0,r,n);for(var s=0;s<this.blockSize;s++)a[s]=r[n+s]}else{o._update.call(this,t,e,r,n);for(var s=0;s<this.blockSize;s++)r[n+s]^=a[s];for(var s=0;s<this.blockSize;s++)a[s]=t[e+s]}}},{427:427,432:432}],385:[function(t,e,r){"use strict";function n(t){this.options=t,this.type=this.options.type,this.blockSize=8,this._init(),this.buffer=new Array(this.blockSize),this.bufferOff=0}var i=t(432);e.exports=n,n.prototype._init=function(){},n.prototype.update=function(t){return 0===t.length?[]:"decrypt"===this.type?this._updateDecrypt(t):this._updateEncrypt(t)},n.prototype._buffer=function(t,e){for(var r=Math.min(this.buffer.length-this.bufferOff,t.length-e),n=0;n<r;n++)this.buffer[this.bufferOff+n]=t[e+n];return this.bufferOff+=r,r},n.prototype._flushBuffer=function(t,e){return this._update(this.buffer,0,t,e),this.bufferOff=0,this.blockSize},n.prototype._updateEncrypt=function(t){var e=0,r=0,n=(this.bufferOff+t.length)/this.blockSize|0,i=new Array(n*this.blockSize);0!==this.bufferOff&&(e+=this._buffer(t,e),
this.bufferOff===this.buffer.length&&(r+=this._flushBuffer(i,r)));for(var o=t.length-(t.length-e)%this.blockSize;e<o;e+=this.blockSize)this._update(t,e,i,r),r+=this.blockSize;for(;e<t.length;e++,this.bufferOff++)this.buffer[this.bufferOff]=t[e];return i},n.prototype._updateDecrypt=function(t){for(var e=0,r=0,n=Math.ceil((this.bufferOff+t.length)/this.blockSize)-1,i=new Array(n*this.blockSize);n>0;n--)e+=this._buffer(t,e),r+=this._flushBuffer(i,r);return e+=this._buffer(t,e),i},n.prototype.final=function(t){var e;t&&(e=this.update(t));var r;return r="encrypt"===this.type?this._finalEncrypt():this._finalDecrypt(),e?e.concat(r):r},n.prototype._pad=function(t,e){if(0===e)return!1;for(;e<t.length;)t[e++]=0;return!0},n.prototype._finalEncrypt=function(){if(!this._pad(this.buffer,this.bufferOff))return[];var t=new Array(this.blockSize);return this._update(this.buffer,0,t,0),t},n.prototype._unpad=function(t){return t},n.prototype._finalDecrypt=function(){i.equal(this.bufferOff,this.blockSize,"Not enough data to decrypt");var t=new Array(this.blockSize);return this._flushBuffer(t,0),this._unpad(t)}},{432:432}],386:[function(t,e,r){"use strict";function n(){this.tmp=new Array(2),this.keys=null}function i(t){c.call(this,t);var e=new n;this._desState=e,this.deriveKeys(e,t.key)}var o=t(432),a=t(427),s=t(383),f=s.utils,c=s.Cipher;a(i,c),e.exports=i,i.create=function(t){return new i(t)};var u=[1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];i.prototype.deriveKeys=function(t,e){t.keys=new Array(32),o.equal(e.length,this.blockSize,"Invalid key length");var r=f.readUInt32BE(e,0),n=f.readUInt32BE(e,4);f.pc1(r,n,t.tmp,0),r=t.tmp[0],n=t.tmp[1];for(var i=0;i<t.keys.length;i+=2){var a=u[i>>>1];r=f.r28shl(r,a),n=f.r28shl(n,a),f.pc2(r,n,t.keys,i)}},i.prototype._update=function(t,e,r,n){var i=this._desState,o=f.readUInt32BE(t,e),a=f.readUInt32BE(t,e+4);f.ip(o,a,i.tmp,0),o=i.tmp[0],a=i.tmp[1],"encrypt"===this.type?this._encrypt(i,o,a,i.tmp,0):this._decrypt(i,o,a,i.tmp,0),o=i.tmp[0],a=i.tmp[1],f.writeUInt32BE(r,o,n),f.writeUInt32BE(r,a,n+4)},i.prototype._pad=function(t,e){for(var r=t.length-e,n=e;n<t.length;n++)t[n]=r;return!0},i.prototype._unpad=function(t){for(var e=t[t.length-1],r=t.length-e;r<t.length;r++)o.equal(t[r],e);return t.slice(0,t.length-e)},i.prototype._encrypt=function(t,e,r,n,i){for(var o=e,a=r,s=0;s<t.keys.length;s+=2){var c=t.keys[s],u=t.keys[s+1];f.expand(a,t.tmp,0),c^=t.tmp[0],u^=t.tmp[1];var h=f.substitute(c,u),d=f.permute(h),l=a;a=(o^d)>>>0,o=l}f.rip(a,o,n,i)},i.prototype._decrypt=function(t,e,r,n,i){for(var o=r,a=e,s=t.keys.length-2;s>=0;s-=2){var c=t.keys[s],u=t.keys[s+1];f.expand(o,t.tmp,0),c^=t.tmp[0],u^=t.tmp[1];var h=f.substitute(c,u),d=f.permute(h),l=o;o=(a^d)>>>0,a=l}f.rip(o,a,n,i)}},{383:383,427:427,432:432}],387:[function(t,e,r){"use strict";function n(t,e){o.equal(e.length,24,"Invalid key length");var r=e.slice(0,8),n=e.slice(8,16),i=e.slice(16,24);this.ciphers="encrypt"===t?[c.create({type:"encrypt",key:r}),c.create({type:"decrypt",key:n}),c.create({type:"encrypt",key:i})]:[c.create({type:"decrypt",key:i}),c.create({type:"encrypt",key:n}),c.create({type:"decrypt",key:r})]}function i(t){f.call(this,t);var e=new n(this.type,this.options.key);this._edeState=e}var o=t(432),a=t(427),s=t(383),f=s.Cipher,c=s.DES;a(i,f),e.exports=i,i.create=function(t){return new i(t)},i.prototype._update=function(t,e,r,n){var i=this._edeState;i.ciphers[0]._update(t,e,r,n),i.ciphers[1]._update(r,n,r,n),i.ciphers[2]._update(r,n,r,n)},i.prototype._pad=c.prototype._pad,i.prototype._unpad=c.prototype._unpad},{383:383,427:427,432:432}],388:[function(t,e,r){"use strict";r.readUInt32BE=function(t,e){return(t[0+e]<<24|t[1+e]<<16|t[2+e]<<8|t[3+e])>>>0},r.writeUInt32BE=function(t,e,r){t[0+r]=e>>>24,t[1+r]=e>>>16&255,t[2+r]=e>>>8&255,t[3+r]=255&e},r.ip=function(t,e,r,n){for(var i=0,o=0,a=6;a>=0;a-=2){for(var s=0;s<=24;s+=8)i<<=1,i|=e>>>s+a&1;for(var s=0;s<=24;s+=8)i<<=1,i|=t>>>s+a&1}for(var a=6;a>=0;a-=2){for(var s=1;s<=25;s+=8)o<<=1,o|=e>>>s+a&1;for(var s=1;s<=25;s+=8)o<<=1,o|=t>>>s+a&1}r[n+0]=i>>>0,r[n+1]=o>>>0},r.rip=function(t,e,r,n){for(var i=0,o=0,a=0;a<4;a++)for(var s=24;s>=0;s-=8)i<<=1,i|=e>>>s+a&1,i<<=1,i|=t>>>s+a&1;for(var a=4;a<8;a++)for(var s=24;s>=0;s-=8)o<<=1,o|=e>>>s+a&1,o<<=1,o|=t>>>s+a&1;r[n+0]=i>>>0,r[n+1]=o>>>0},r.pc1=function(t,e,r,n){for(var i=0,o=0,a=7;a>=5;a--){for(var s=0;s<=24;s+=8)i<<=1,i|=e>>s+a&1;for(var s=0;s<=24;s+=8)i<<=1,i|=t>>s+a&1}for(var s=0;s<=24;s+=8)i<<=1,i|=e>>s+a&1;for(var a=1;a<=3;a++){for(var s=0;s<=24;s+=8)o<<=1,o|=e>>s+a&1;for(var s=0;s<=24;s+=8)o<<=1,o|=t>>s+a&1}for(var s=0;s<=24;s+=8)o<<=1,o|=t>>s+a&1;r[n+0]=i>>>0,r[n+1]=o>>>0},r.r28shl=function(t,e){return t<<e&268435455|t>>>28-e};var n=[14,11,17,4,27,23,25,0,13,22,7,18,5,9,16,24,2,20,12,21,1,8,15,26,15,4,25,19,9,1,26,16,5,11,23,8,12,7,17,0,22,3,10,14,6,20,27,24];r.pc2=function(t,e,r,i){for(var o=0,a=0,s=n.length>>>1,f=0;f<s;f++)o<<=1,o|=t>>>n[f]&1;for(var f=s;f<n.length;f++)a<<=1,a|=e>>>n[f]&1;r[i+0]=o>>>0,r[i+1]=a>>>0},r.expand=function(t,e,r){var n=0,i=0;n=(1&t)<<5|t>>>27;for(var o=23;o>=15;o-=4)n<<=6,n|=t>>>o&63;for(var o=11;o>=3;o-=4)i|=t>>>o&63,i<<=6;i|=(31&t)<<1|t>>>31,e[r+0]=n>>>0,e[r+1]=i>>>0};var i=[14,0,4,15,13,7,1,4,2,14,15,2,11,13,8,1,3,10,10,6,6,12,12,11,5,9,9,5,0,3,7,8,4,15,1,12,14,8,8,2,13,4,6,9,2,1,11,7,15,5,12,11,9,3,7,14,3,10,10,0,5,6,0,13,15,3,1,13,8,4,14,7,6,15,11,2,3,8,4,14,9,12,7,0,2,1,13,10,12,6,0,9,5,11,10,5,0,13,14,8,7,10,11,1,10,3,4,15,13,4,1,2,5,11,8,6,12,7,6,12,9,0,3,5,2,14,15,9,10,13,0,7,9,0,14,9,6,3,3,4,15,6,5,10,1,2,13,8,12,5,7,14,11,12,4,11,2,15,8,1,13,1,6,10,4,13,9,0,8,6,15,9,3,8,0,7,11,4,1,15,2,14,12,3,5,11,10,5,14,2,7,12,7,13,13,8,14,11,3,5,0,6,6,15,9,0,10,3,1,4,2,7,8,2,5,12,11,1,12,10,4,14,15,9,10,3,6,15,9,0,0,6,12,10,11,1,7,13,13,8,15,9,1,4,3,5,14,11,5,12,2,7,8,2,4,14,2,14,12,11,4,2,1,12,7,4,10,7,11,13,6,1,8,5,5,0,3,15,15,10,13,3,0,9,14,8,9,6,4,11,2,8,1,12,11,7,10,1,13,14,7,2,8,13,15,6,9,15,12,0,5,9,6,10,3,4,0,5,14,3,12,10,1,15,10,4,15,2,9,7,2,12,6,9,8,5,0,6,13,1,3,13,4,14,14,0,7,11,5,3,11,8,9,4,14,3,15,2,5,12,2,9,8,5,12,15,3,10,7,11,0,14,4,1,10,7,1,6,13,0,11,8,6,13,4,13,11,0,2,11,14,7,15,4,0,9,8,1,13,10,3,14,12,3,9,5,7,12,5,2,10,15,6,8,1,6,1,6,4,11,11,13,13,8,12,1,3,4,7,10,14,7,10,9,15,5,6,0,8,15,0,14,5,2,9,3,2,12,13,1,2,15,8,13,4,8,6,10,15,3,11,7,1,4,10,12,9,5,3,6,14,11,5,0,0,14,12,9,7,2,7,2,11,1,4,14,1,7,9,4,12,10,14,8,2,13,0,15,6,12,10,9,13,0,15,3,3,5,5,6,8,11];r.substitute=function(t,e){for(var r=0,n=0;n<4;n++){var o=t>>>18-6*n&63,a=i[64*n+o];r<<=4,r|=a}for(var n=0;n<4;n++){var o=e>>>18-6*n&63,a=i[256+64*n+o];r<<=4,r|=a}return r>>>0};var o=[16,25,12,11,3,20,4,15,31,17,9,6,27,14,1,22,30,24,8,18,0,5,29,23,13,19,2,26,10,21,28,7];r.permute=function(t){for(var e=0,r=0;r<o.length;r++)e<<=1,e|=t>>>o[r]&1;return e>>>0},r.padSplit=function(t,e,r){for(var n=t.toString(2);n.length<e;)n="0"+n;for(var i=[],o=0;o<e;o+=r)i.push(n.slice(o,o+r));return i.join(" ")}},{}],389:[function(t,e,r){(function(e){function n(t){var r=new e(a[t].prime,"hex"),n=new e(a[t].gen,"hex");return new s(r,n)}function i(t,r,n,a){return e.isBuffer(r)||void 0===f[r]?i(t,"binary",r,n):(r=r||"binary",a=a||"binary",n=n||new e([2]),e.isBuffer(n)||(n=new e(n,a)),"number"==typeof t?new s(o(t,n),n,!0):(e.isBuffer(t)||(t=new e(t,r)),new s(t,n,!0)))}var o=t(391),a=t(392),s=t(390),f={binary:!0,hex:!0,base64:!0};r.DiffieHellmanGroup=r.createDiffieHellmanGroup=r.getDiffieHellman=n,r.createDiffieHellman=r.DiffieHellman=i}).call(this,t(50).Buffer)},{390:390,391:391,392:392,50:50}],390:[function(t,e,r){(function(r){function n(t,e){return e=e||"utf8",r.isBuffer(t)||(t=new r(t,e)),this._pub=new f(t),this}function i(t,e){return e=e||"utf8",r.isBuffer(t)||(t=new r(t,e)),this._priv=new f(t),this}function o(t,e){var r=e.toString("hex"),n=[r,t.toString(16)].join("_");if(n in g)return g[n];var i=0;if(t.isEven()||!v.simpleSieve||!v.fermatTest(t)||!u.test(t))return i+=1,i+="02"===r||"05"===r?8:4,g[n]=i,i;u.test(t.shrn(1))||(i+=2);var o;switch(r){case"02":t.mod(h).cmp(d)&&(i+=8);break;case"05":o=t.mod(l),o.cmp(p)&&o.cmp(b)&&(i+=8);break;default:i+=4}return g[n]=i,i}function a(t,e,r){this.setGenerator(e),this.__prime=new f(t),this._prime=f.mont(this.__prime),this._primeLen=t.length,this._pub=void 0,this._priv=void 0,this._primeCode=void 0,r?(this.setPublicKey=n,this.setPrivateKey=i):this._primeCode=8}function s(t,e){var n=new r(t.toArray());return e?n.toString(e):n}var f=t(18),c=t(431),u=new c,h=new f(24),d=new f(11),l=new f(10),p=new f(3),b=new f(7),v=t(391),y=t(454);e.exports=a;var g={};Object.defineProperty(a.prototype,"verifyError",{enumerable:!0,get:function(){return"number"!=typeof this._primeCode&&(this._primeCode=o(this.__prime,this.__gen)),this._primeCode}}),a.prototype.generateKeys=function(){return this._priv||(this._priv=new f(y(this._primeLen))),this._pub=this._gen.toRed(this._prime).redPow(this._priv).fromRed(),this.getPublicKey()},a.prototype.computeSecret=function(t){t=new f(t),t=t.toRed(this._prime);var e=t.redPow(this._priv).fromRed(),n=new r(e.toArray()),i=this.getPrime();if(n.length<i.length){var o=new r(i.length-n.length);o.fill(0),n=r.concat([o,n])}return n},a.prototype.getPublicKey=function(t){return s(this._pub,t)},a.prototype.getPrivateKey=function(t){return s(this._priv,t)},a.prototype.getPrime=function(t){return s(this.__prime,t)},a.prototype.getGenerator=function(t){return s(this._gen,t)},a.prototype.setGenerator=function(t,e){return e=e||"utf8",r.isBuffer(t)||(t=new r(t,e)),this.__gen=t,this._gen=new f(t),this}}).call(this,t(50).Buffer)},{18:18,391:391,431:431,454:454,50:50}],391:[function(t,e,r){function n(){if(null!==m)return m;var t=[];t[0]=2;for(var e=1,r=3;r<1048576;r+=2){for(var n=Math.ceil(Math.sqrt(r)),i=0;i<e&&t[i]<=n&&r%t[i]!=0;i++);e!==i&&t[i]<=n||(t[e++]=r)}return m=t,t}function i(t){for(var e=n(),r=0;r<e.length;r++)if(0===t.modn(e[r]))return 0===t.cmpn(e[r]);return!0}function o(t){var e=f.mont(t);return 0===l.toRed(e).redPow(t.subn(1)).fromRed().cmpn(1)}function a(t,e){if(t<16)return new f(2===e||5===e?[140,123]:[140,39]);e=new f(e);for(var r,n;;){for(r=new f(s(Math.ceil(t/8)));r.bitLength()>t;)r.ishrn(1);if(r.isEven()&&r.iadd(d),r.testn(1)||r.iadd(l),e.cmp(l)){if(!e.cmp(p))for(;r.mod(b).cmp(v);)r.iadd(g)}else for(;r.mod(c).cmp(y);)r.iadd(g);if(n=r.shrn(1),i(n)&&i(r)&&o(n)&&o(r)&&h.test(n)&&h.test(r))return r}}var s=t(454);e.exports=a,a.simpleSieve=i,a.fermatTest=o;var f=t(18),c=new f(24),u=t(431),h=new u,d=new f(1),l=new f(2),p=new f(5),b=(new f(16),new f(8),new f(10)),v=new f(3),y=(new f(7),new f(11)),g=new f(4),m=(new f(12),null)},{18:18,431:431,454:454}],392:[function(t,e,r){e.exports={modp1:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a63a3620ffffffffffffffff"},modp2:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece65381ffffffffffffffff"},modp5:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca237327ffffffffffffffff"},modp14:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aacaa68ffffffffffffffff"},modp15:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a93ad2caffffffffffffffff"},modp16:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c934063199ffffffffffffffff"},modp17:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c93402849236c3fab4d27c7026c1d4dcb2602646dec9751e763dba37bdf8ff9406ad9e530ee5db382f413001aeb06a53ed9027d831179727b0865a8918da3edbebcf9b14ed44ce6cbaced4bb1bdb7f1447e6cc254b332051512bd7af426fb8f401378cd2bf5983ca01c64b92ecf032ea15d1721d03f482d7ce6e74fef6d55e702f46980c82b5a84031900b1c9e59e7c97fbec7e8f323a97a7e36cc88be0f1d45b7ff585ac54bd407b22b4154aacc8f6d7ebf48e1d814cc5ed20f8037e0a79715eef29be32806a1d58bb7c5da76f550aa3d8a1fbff0eb19ccb1a313d55cda56c9ec2ef29632387fe8d76e3c0468043e8f663f4860ee12bf2d5b0b7474d6e694f91e6dcc4024ffffffffffffffff"},modp18:{gen:"02",prime:"ffffffffffffffffc90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b139b22514a08798e3404ddef9519b3cd3a431b302b0a6df25f14374fe1356d6d51c245e485b576625e7ec6f44c42e9a637ed6b0bff5cb6f406b7edee386bfb5a899fa5ae9f24117c4b1fe649286651ece45b3dc2007cb8a163bf0598da48361c55d39a69163fa8fd24cf5f83655d23dca3ad961c62f356208552bb9ed529077096966d670c354e4abc9804f1746c08ca18217c32905e462e36ce3be39e772c180e86039b2783a2ec07a28fb5c55df06f4c52c9de2bcbf6955817183995497cea956ae515d2261898fa051015728e5a8aaac42dad33170d04507a33a85521abdf1cba64ecfb850458dbef0a8aea71575d060c7db3970f85a6e1e4c7abf5ae8cdb0933d71e8c94e04a25619dcee3d2261ad2ee6bf12ffa06d98a0864d87602733ec86a64521f2b18177b200cbbe117577a615d6c770988c0bad946e208e24fa074e5ab3143db5bfce0fd108e4b82d120a92108011a723c12a787e6d788719a10bdba5b2699c327186af4e23c1a946834b6150bda2583e9ca2ad44ce8dbbbc2db04de8ef92e8efc141fbecaa6287c59474e6bc05d99b2964fa090c3a2233ba186515be7ed1f612970cee2d7afb81bdd762170481cd0069127d5b05aa993b4ea988d8fddc186ffb7dc90a6c08f4df435c93402849236c3fab4d27c7026c1d4dcb2602646dec9751e763dba37bdf8ff9406ad9e530ee5db382f413001aeb06a53ed9027d831179727b0865a8918da3edbebcf9b14ed44ce6cbaced4bb1bdb7f1447e6cc254b332051512bd7af426fb8f401378cd2bf5983ca01c64b92ecf032ea15d1721d03f482d7ce6e74fef6d55e702f46980c82b5a84031900b1c9e59e7c97fbec7e8f323a97a7e36cc88be0f1d45b7ff585ac54bd407b22b4154aacc8f6d7ebf48e1d814cc5ed20f8037e0a79715eef29be32806a1d58bb7c5da76f550aa3d8a1fbff0eb19ccb1a313d55cda56c9ec2ef29632387fe8d76e3c0468043e8f663f4860ee12bf2d5b0b7474d6e694f91e6dbe115974a3926f12fee5e438777cb6a932df8cd8bec4d073b931ba3bc832b68d9dd300741fa7bf8afc47ed2576f6936ba424663aab639c5ae4f5683423b4742bf1c978238f16cbe39d652de3fdb8befc848ad922222e04a4037c0713eb57a81a23f0c73473fc646cea306b4bcbc8862f8385ddfa9d4b7fa2c087e879683303ed5bdd3a062b3cf5b3a278a66d2a13f83f44f82ddf310ee074ab6a364597e899a0255dc164f31cc50846851df9ab48195ded7ea1b1d510bd7ee74d73faf36bc31ecfa268359046f4eb879f924009438b481c6cd7889a002ed5ee382bc9190da6fc026e479558e4475677e9aa9e3050e2765694dfc81f56e880b96e7160c980dd98edd3dfffffffffffffffff"}}},{}],393:[function(t,e,r){"use strict";var n=r;n.version=t(408).version,n.utils=t(407),n.rand=t(19),n.curve=t(396),n.curves=t(399),n.ec=t(400),n.eddsa=t(403)},{19:19,396:396,399:399,400:400,403:403,407:407,408:408}],394:[function(t,e,r){"use strict";function n(t,e){this.type=t,this.p=new o(e.p,16),this.red=e.prime?o.red(e.prime):o.mont(this.p),this.zero=new o(0).toRed(this.red),this.one=new o(1).toRed(this.red),this.two=new o(2).toRed(this.red),this.n=e.n&&new o(e.n,16),this.g=e.g&&this.pointFromJSON(e.g,e.gRed),this._wnafT1=new Array(4),this._wnafT2=new Array(4),this._wnafT3=new Array(4),this._wnafT4=new Array(4);var r=this.n&&this.p.div(this.n);!r||r.cmpn(100)>0?this.redN=null:(this._maxwellTrick=!0,this.redN=this.n.toRed(this.red))}function i(t,e){this.curve=t,this.type=e,this.precomputed=null}var o=t(18),a=t(393),s=a.utils,f=s.getNAF,c=s.getJSF,u=s.assert;e.exports=n,n.prototype.point=function(){throw new Error("Not implemented")},n.prototype.validate=function(){throw new Error("Not implemented")},n.prototype._fixedNafMul=function(t,e){u(t.precomputed);var r=t._getDoubles(),n=f(e,1),i=(1<<r.step+1)-(r.step%2==0?2:1);i/=3;for(var o=[],a=0;a<n.length;a+=r.step){for(var s=0,e=a+r.step-1;e>=a;e--)s=(s<<1)+n[e];o.push(s)}for(var c=this.jpoint(null,null,null),h=this.jpoint(null,null,null),d=i;d>0;d--){for(var a=0;a<o.length;a++){var s=o[a];s===d?h=h.mixedAdd(r.points[a]):s===-d&&(h=h.mixedAdd(r.points[a].neg()))}c=c.add(h)}return c.toP()},n.prototype._wnafMul=function(t,e){var r=4,n=t._getNAFPoints(r);r=n.wnd;for(var i=n.points,o=f(e,r),a=this.jpoint(null,null,null),s=o.length-1;s>=0;s--){for(var e=0;s>=0&&0===o[s];s--)e++;if(s>=0&&e++,a=a.dblp(e),s<0)break;var c=o[s];u(0!==c),a="affine"===t.type?c>0?a.mixedAdd(i[c-1>>1]):a.mixedAdd(i[-c-1>>1].neg()):c>0?a.add(i[c-1>>1]):a.add(i[-c-1>>1].neg())}return"affine"===t.type?a.toP():a},n.prototype._wnafMulAdd=function(t,e,r,n,i){for(var o=this._wnafT1,a=this._wnafT2,s=this._wnafT3,u=0,h=0;h<n;h++){var d=e[h],l=d._getNAFPoints(t);o[h]=l.wnd,a[h]=l.points}for(var h=n-1;h>=1;h-=2){var p=h-1,b=h;if(1===o[p]&&1===o[b]){var v=[e[p],null,null,e[b]];0===e[p].y.cmp(e[b].y)?(v[1]=e[p].add(e[b]),v[2]=e[p].toJ().mixedAdd(e[b].neg())):0===e[p].y.cmp(e[b].y.redNeg())?(v[1]=e[p].toJ().mixedAdd(e[b]),v[2]=e[p].add(e[b].neg())):(v[1]=e[p].toJ().mixedAdd(e[b]),v[2]=e[p].toJ().mixedAdd(e[b].neg()));var y=[-3,-1,-5,-7,0,7,5,1,3],g=c(r[p],r[b]);u=Math.max(g[0].length,u),s[p]=new Array(u),s[b]=new Array(u);for(var m=0;m<u;m++){var w=0|g[0][m],_=0|g[1][m];s[p][m]=y[3*(w+1)+(_+1)],s[b][m]=0,a[p]=v}}else s[p]=f(r[p],o[p]),s[b]=f(r[b],o[b]),u=Math.max(s[p].length,u),u=Math.max(s[b].length,u)}for(var S=this.jpoint(null,null,null),E=this._wnafT4,h=u;h>=0;h--){for(var k=0;h>=0;){for(var M=!0,m=0;m<n;m++)E[m]=0|s[m][h],0!==E[m]&&(M=!1);if(!M)break;k++,h--}if(h>=0&&k++,S=S.dblp(k),h<0)break;for(var m=0;m<n;m++){var d,A=E[m];0!==A&&(A>0?d=a[m][A-1>>1]:A<0&&(d=a[m][-A-1>>1].neg()),S="affine"===d.type?S.mixedAdd(d):S.add(d))}}for(var h=0;h<n;h++)a[h]=null;return i?S:S.toP()},n.BasePoint=i,i.prototype.eq=function(){throw new Error("Not implemented")},i.prototype.validate=function(){return this.curve.validate(this)},n.prototype.decodePoint=function(t,e){t=s.toArray(t,e);var r=this.p.byteLength();if((4===t[0]||6===t[0]||7===t[0])&&t.length-1==2*r){6===t[0]?u(t[t.length-1]%2==0):7===t[0]&&u(t[t.length-1]%2==1);return this.point(t.slice(1,1+r),t.slice(1+r,1+2*r))}if((2===t[0]||3===t[0])&&t.length-1===r)return this.pointFromX(t.slice(1,1+r),3===t[0]);throw new Error("Unknown point format")},i.prototype.encodeCompressed=function(t){return this.encode(t,!0)},i.prototype._encode=function(t){var e=this.curve.p.byteLength(),r=this.getX().toArray("be",e);return t?[this.getY().isEven()?2:3].concat(r):[4].concat(r,this.getY().toArray("be",e))},i.prototype.encode=function(t,e){return s.encode(this._encode(e),t)},i.prototype.precompute=function(t){if(this.precomputed)return this;var e={doubles:null,naf:null,beta:null};return e.naf=this._getNAFPoints(8),e.doubles=this._getDoubles(4,t),e.beta=this._getBeta(),this.precomputed=e,this},i.prototype._hasDoubles=function(t){if(!this.precomputed)return!1;var e=this.precomputed.doubles;return!!e&&e.points.length>=Math.ceil((t.bitLength()+1)/e.step)},i.prototype._getDoubles=function(t,e){if(this.precomputed&&this.precomputed.doubles)return this.precomputed.doubles;for(var r=[this],n=this,i=0;i<e;i+=t){for(var o=0;o<t;o++)n=n.dbl();r.push(n)}return{step:t,points:r}},i.prototype._getNAFPoints=function(t){if(this.precomputed&&this.precomputed.naf)return this.precomputed.naf;for(var e=[this],r=(1<<t)-1,n=1===r?null:this.dbl(),i=1;i<r;i++)e[i]=e[i-1].add(n);return{wnd:t,points:e}},i.prototype._getBeta=function(){return null},i.prototype.dblp=function(t){for(var e=this,r=0;r<t;r++)e=e.dbl();return e}},{18:18,393:393}],395:[function(t,e,r){"use strict";function n(t){this.twisted=1!=(0|t.a),this.mOneA=this.twisted&&-1==(0|t.a),this.extended=this.mOneA,c.call(this,"edwards",t),this.a=new s(t.a,16).umod(this.red.m),this.a=this.a.toRed(this.red),this.c=new s(t.c,16).toRed(this.red),this.c2=this.c.redSqr(),this.d=new s(t.d,16).toRed(this.red),this.dd=this.d.redAdd(this.d),u(!this.twisted||0===this.c.fromRed().cmpn(1)),this.oneC=1==(0|t.c)}function i(t,e,r,n,i){c.BasePoint.call(this,t,"projective"),null===e&&null===r&&null===n?(this.x=this.curve.zero,this.y=this.curve.one,this.z=this.curve.one,this.t=this.curve.zero,this.zOne=!0):(this.x=new s(e,16),this.y=new s(r,16),this.z=n?new s(n,16):this.curve.one,this.t=i&&new s(i,16),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.y.red||(this.y=this.y.toRed(this.curve.red)),this.z.red||(this.z=this.z.toRed(this.curve.red)),this.t&&!this.t.red&&(this.t=this.t.toRed(this.curve.red)),this.zOne=this.z===this.curve.one,this.curve.extended&&!this.t&&(this.t=this.x.redMul(this.y),this.zOne||(this.t=this.t.redMul(this.z.redInvm()))))}var o=t(396),a=t(393),s=t(18),f=t(427),c=o.base,u=a.utils.assert;f(n,c),e.exports=n,n.prototype._mulA=function(t){return this.mOneA?t.redNeg():this.a.redMul(t)},n.prototype._mulC=function(t){return this.oneC?t:this.c.redMul(t)},n.prototype.jpoint=function(t,e,r,n){return this.point(t,e,r,n)},n.prototype.pointFromX=function(t,e){t=new s(t,16),t.red||(t=t.toRed(this.red));var r=t.redSqr(),n=this.c2.redSub(this.a.redMul(r)),i=this.one.redSub(this.c2.redMul(this.d).redMul(r)),o=n.redMul(i.redInvm()),a=o.redSqrt();if(0!==a.redSqr().redSub(o).cmp(this.zero))throw new Error("invalid point");var f=a.fromRed().isOdd();return(e&&!f||!e&&f)&&(a=a.redNeg()),this.point(t,a)},n.prototype.pointFromY=function(t,e){t=new s(t,16),t.red||(t=t.toRed(this.red));var r=t.redSqr(),n=r.redSub(this.c2),i=r.redMul(this.d).redMul(this.c2).redSub(this.a),o=n.redMul(i.redInvm());if(0===o.cmp(this.zero)){if(e)throw new Error("invalid point");return this.point(this.zero,t)}var a=o.redSqrt();if(0!==a.redSqr().redSub(o).cmp(this.zero))throw new Error("invalid point");return a.fromRed().isOdd()!==e&&(a=a.redNeg()),this.point(a,t)},n.prototype.validate=function(t){if(t.isInfinity())return!0;t.normalize();var e=t.x.redSqr(),r=t.y.redSqr(),n=e.redMul(this.a).redAdd(r),i=this.c2.redMul(this.one.redAdd(this.d.redMul(e).redMul(r)));return 0===n.cmp(i)},f(i,c.BasePoint),n.prototype.pointFromJSON=function(t){return i.fromJSON(this,t)},n.prototype.point=function(t,e,r,n){return new i(this,t,e,r,n)},i.fromJSON=function(t,e){return new i(t,e[0],e[1],e[2])},i.prototype.inspect=function(){return this.isInfinity()?"<EC Point Infinity>":"<EC Point x: "+this.x.fromRed().toString(16,2)+" y: "+this.y.fromRed().toString(16,2)+" z: "+this.z.fromRed().toString(16,2)+">"},i.prototype.isInfinity=function(){return 0===this.x.cmpn(0)&&(0===this.y.cmp(this.z)||this.zOne&&0===this.y.cmp(this.curve.c))},i.prototype._extDbl=function(){var t=this.x.redSqr(),e=this.y.redSqr(),r=this.z.redSqr();r=r.redIAdd(r);var n=this.curve._mulA(t),i=this.x.redAdd(this.y).redSqr().redISub(t).redISub(e),o=n.redAdd(e),a=o.redSub(r),s=n.redSub(e),f=i.redMul(a),c=o.redMul(s),u=i.redMul(s),h=a.redMul(o);return this.curve.point(f,c,h,u)},i.prototype._projDbl=function(){var t,e,r,n=this.x.redAdd(this.y).redSqr(),i=this.x.redSqr(),o=this.y.redSqr();if(this.curve.twisted){var a=this.curve._mulA(i),s=a.redAdd(o);if(this.zOne)t=n.redSub(i).redSub(o).redMul(s.redSub(this.curve.two)),e=s.redMul(a.redSub(o)),r=s.redSqr().redSub(s).redSub(s);else{var f=this.z.redSqr(),c=s.redSub(f).redISub(f);t=n.redSub(i).redISub(o).redMul(c),e=s.redMul(a.redSub(o)),r=s.redMul(c)}}else{var a=i.redAdd(o),f=this.curve._mulC(this.z).redSqr(),c=a.redSub(f).redSub(f);t=this.curve._mulC(n.redISub(a)).redMul(c),e=this.curve._mulC(a).redMul(i.redISub(o)),r=a.redMul(c)}return this.curve.point(t,e,r)},i.prototype.dbl=function(){return this.isInfinity()?this:this.curve.extended?this._extDbl():this._projDbl()},i.prototype._extAdd=function(t){var e=this.y.redSub(this.x).redMul(t.y.redSub(t.x)),r=this.y.redAdd(this.x).redMul(t.y.redAdd(t.x)),n=this.t.redMul(this.curve.dd).redMul(t.t),i=this.z.redMul(t.z.redAdd(t.z)),o=r.redSub(e),a=i.redSub(n),s=i.redAdd(n),f=r.redAdd(e),c=o.redMul(a),u=s.redMul(f),h=o.redMul(f),d=a.redMul(s);return this.curve.point(c,u,d,h)},i.prototype._projAdd=function(t){var e,r,n=this.z.redMul(t.z),i=n.redSqr(),o=this.x.redMul(t.x),a=this.y.redMul(t.y),s=this.curve.d.redMul(o).redMul(a),f=i.redSub(s),c=i.redAdd(s),u=this.x.redAdd(this.y).redMul(t.x.redAdd(t.y)).redISub(o).redISub(a),h=n.redMul(f).redMul(u);return this.curve.twisted?(e=n.redMul(c).redMul(a.redSub(this.curve._mulA(o))),r=f.redMul(c)):(e=n.redMul(c).redMul(a.redSub(o)),r=this.curve._mulC(f).redMul(c)),this.curve.point(h,e,r)},i.prototype.add=function(t){return this.isInfinity()?t:t.isInfinity()?this:this.curve.extended?this._extAdd(t):this._projAdd(t)},i.prototype.mul=function(t){return this._hasDoubles(t)?this.curve._fixedNafMul(this,t):this.curve._wnafMul(this,t)},i.prototype.mulAdd=function(t,e,r){return this.curve._wnafMulAdd(1,[this,e],[t,r],2,!1)},i.prototype.jmulAdd=function(t,e,r){return this.curve._wnafMulAdd(1,[this,e],[t,r],2,!0)},i.prototype.normalize=function(){if(this.zOne)return this;var t=this.z.redInvm();return this.x=this.x.redMul(t),this.y=this.y.redMul(t),this.t&&(this.t=this.t.redMul(t)),this.z=this.curve.one,this.zOne=!0,this},i.prototype.neg=function(){return this.curve.point(this.x.redNeg(),this.y,this.z,this.t&&this.t.redNeg())},i.prototype.getX=function(){return this.normalize(),this.x.fromRed()},i.prototype.getY=function(){return this.normalize(),this.y.fromRed()},i.prototype.eq=function(t){return this===t||0===this.getX().cmp(t.getX())&&0===this.getY().cmp(t.getY())},i.prototype.eqXToP=function(t){var e=t.toRed(this.curve.red).redMul(this.z);if(0===this.x.cmp(e))return!0;for(var r=t.clone(),n=this.curve.redN.redMul(this.z);;){if(r.iadd(this.curve.n),r.cmp(this.curve.p)>=0)return!1;if(e.redIAdd(n),0===this.x.cmp(e))return!0}},i.prototype.toP=i.prototype.normalize,i.prototype.mixedAdd=i.prototype.add},{18:18,393:393,396:396,427:427}],396:[function(t,e,r){"use strict";var n=r;n.base=t(394),n.short=t(398),n.mont=t(397),n.edwards=t(395)},{394:394,395:395,397:397,398:398}],397:[function(t,e,r){"use strict";function n(t){f.call(this,"mont",t),this.a=new a(t.a,16).toRed(this.red),this.b=new a(t.b,16).toRed(this.red),this.i4=new a(4).toRed(this.red).redInvm(),this.two=new a(2).toRed(this.red),this.a24=this.i4.redMul(this.a.redAdd(this.two))}function i(t,e,r){f.BasePoint.call(this,t,"projective"),null===e&&null===r?(this.x=this.curve.one,this.z=this.curve.zero):(this.x=new a(e,16),this.z=new a(r,16),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.z.red||(this.z=this.z.toRed(this.curve.red)))}var o=t(396),a=t(18),s=t(427),f=o.base,c=t(393),u=c.utils;s(n,f),e.exports=n,n.prototype.validate=function(t){var e=t.normalize().x,r=e.redSqr(),n=r.redMul(e).redAdd(r.redMul(this.a)).redAdd(e);return 0===n.redSqrt().redSqr().cmp(n)},s(i,f.BasePoint),n.prototype.decodePoint=function(t,e){return this.point(u.toArray(t,e),1)},n.prototype.point=function(t,e){return new i(this,t,e)},n.prototype.pointFromJSON=function(t){return i.fromJSON(this,t)},i.prototype.precompute=function(){},i.prototype._encode=function(){return this.getX().toArray("be",this.curve.p.byteLength())},i.fromJSON=function(t,e){return new i(t,e[0],e[1]||t.one)},i.prototype.inspect=function(){return this.isInfinity()?"<EC Point Infinity>":"<EC Point x: "+this.x.fromRed().toString(16,2)+" z: "+this.z.fromRed().toString(16,2)+">"},i.prototype.isInfinity=function(){return 0===this.z.cmpn(0)},i.prototype.dbl=function(){var t=this.x.redAdd(this.z),e=t.redSqr(),r=this.x.redSub(this.z),n=r.redSqr(),i=e.redSub(n),o=e.redMul(n),a=i.redMul(n.redAdd(this.curve.a24.redMul(i)));return this.curve.point(o,a)},i.prototype.add=function(){throw new Error("Not supported on Montgomery curve")},i.prototype.diffAdd=function(t,e){var r=this.x.redAdd(this.z),n=this.x.redSub(this.z),i=t.x.redAdd(t.z),o=t.x.redSub(t.z),a=o.redMul(r),s=i.redMul(n),f=e.z.redMul(a.redAdd(s).redSqr()),c=e.x.redMul(a.redISub(s).redSqr());return this.curve.point(f,c)},i.prototype.mul=function(t){for(var e=t.clone(),r=this,n=this.curve.point(null,null),i=this,o=[];0!==e.cmpn(0);e.iushrn(1))o.push(e.andln(1));for(var a=o.length-1;a>=0;a--)0===o[a]?(r=r.diffAdd(n,i),n=n.dbl()):(n=r.diffAdd(n,i),r=r.dbl());return n},i.prototype.mulAdd=function(){throw new Error("Not supported on Montgomery curve")},i.prototype.jumlAdd=function(){throw new Error("Not supported on Montgomery curve")},i.prototype.eq=function(t){return 0===this.getX().cmp(t.getX())},i.prototype.normalize=function(){return this.x=this.x.redMul(this.z.redInvm()),this.z=this.curve.one,this},i.prototype.getX=function(){return this.normalize(),this.x.fromRed()}},{18:18,393:393,396:396,427:427}],398:[function(t,e,r){"use strict";function n(t){u.call(this,"short",t),this.a=new f(t.a,16).toRed(this.red),this.b=new f(t.b,16).toRed(this.red),this.tinv=this.two.redInvm(),this.zeroA=0===this.a.fromRed().cmpn(0),this.threeA=0===this.a.fromRed().sub(this.p).cmpn(-3),this.endo=this._getEndomorphism(t),this._endoWnafT1=new Array(4),this._endoWnafT2=new Array(4)}function i(t,e,r,n){u.BasePoint.call(this,t,"affine"),null===e&&null===r?(this.x=null,this.y=null,this.inf=!0):(this.x=new f(e,16),this.y=new f(r,16),n&&(this.x.forceRed(this.curve.red),this.y.forceRed(this.curve.red)),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.y.red||(this.y=this.y.toRed(this.curve.red)),this.inf=!1)}
function o(t,e,r,n){u.BasePoint.call(this,t,"jacobian"),null===e&&null===r&&null===n?(this.x=this.curve.one,this.y=this.curve.one,this.z=new f(0)):(this.x=new f(e,16),this.y=new f(r,16),this.z=new f(n,16)),this.x.red||(this.x=this.x.toRed(this.curve.red)),this.y.red||(this.y=this.y.toRed(this.curve.red)),this.z.red||(this.z=this.z.toRed(this.curve.red)),this.zOne=this.z===this.curve.one}var a=t(396),s=t(393),f=t(18),c=t(427),u=a.base,h=s.utils.assert;c(n,u),e.exports=n,n.prototype._getEndomorphism=function(t){if(this.zeroA&&this.g&&this.n&&1===this.p.modn(3)){var e,r;if(t.beta)e=new f(t.beta,16).toRed(this.red);else{var n=this._getEndoRoots(this.p);e=n[0].cmp(n[1])<0?n[0]:n[1],e=e.toRed(this.red)}if(t.lambda)r=new f(t.lambda,16);else{var i=this._getEndoRoots(this.n);0===this.g.mul(i[0]).x.cmp(this.g.x.redMul(e))?r=i[0]:(r=i[1],h(0===this.g.mul(r).x.cmp(this.g.x.redMul(e))))}var o;return o=t.basis?t.basis.map(function(t){return{a:new f(t.a,16),b:new f(t.b,16)}}):this._getEndoBasis(r),{beta:e,lambda:r,basis:o}}},n.prototype._getEndoRoots=function(t){var e=t===this.p?this.red:f.mont(t),r=new f(2).toRed(e).redInvm(),n=r.redNeg(),i=new f(3).toRed(e).redNeg().redSqrt().redMul(r);return[n.redAdd(i).fromRed(),n.redSub(i).fromRed()]},n.prototype._getEndoBasis=function(t){for(var e,r,n,i,o,a,s,c,u,h=this.n.ushrn(Math.floor(this.n.bitLength()/2)),d=t,l=this.n.clone(),p=new f(1),b=new f(0),v=new f(0),y=new f(1),g=0;0!==d.cmpn(0);){var m=l.div(d);c=l.sub(m.mul(d)),u=v.sub(m.mul(p));var w=y.sub(m.mul(b));if(!n&&c.cmp(h)<0)e=s.neg(),r=p,n=c.neg(),i=u;else if(n&&2==++g)break;s=c,l=d,d=c,v=p,p=u,y=b,b=w}o=c.neg(),a=u;var _=n.sqr().add(i.sqr());return o.sqr().add(a.sqr()).cmp(_)>=0&&(o=e,a=r),n.negative&&(n=n.neg(),i=i.neg()),o.negative&&(o=o.neg(),a=a.neg()),[{a:n,b:i},{a:o,b:a}]},n.prototype._endoSplit=function(t){var e=this.endo.basis,r=e[0],n=e[1],i=n.b.mul(t).divRound(this.n),o=r.b.neg().mul(t).divRound(this.n),a=i.mul(r.a),s=o.mul(n.a),f=i.mul(r.b),c=o.mul(n.b);return{k1:t.sub(a).sub(s),k2:f.add(c).neg()}},n.prototype.pointFromX=function(t,e){t=new f(t,16),t.red||(t=t.toRed(this.red));var r=t.redSqr().redMul(t).redIAdd(t.redMul(this.a)).redIAdd(this.b),n=r.redSqrt();if(0!==n.redSqr().redSub(r).cmp(this.zero))throw new Error("invalid point");var i=n.fromRed().isOdd();return(e&&!i||!e&&i)&&(n=n.redNeg()),this.point(t,n)},n.prototype.validate=function(t){if(t.inf)return!0;var e=t.x,r=t.y,n=this.a.redMul(e),i=e.redSqr().redMul(e).redIAdd(n).redIAdd(this.b);return 0===r.redSqr().redISub(i).cmpn(0)},n.prototype._endoWnafMulAdd=function(t,e,r){for(var n=this._endoWnafT1,i=this._endoWnafT2,o=0;o<t.length;o++){var a=this._endoSplit(e[o]),s=t[o],f=s._getBeta();a.k1.negative&&(a.k1.ineg(),s=s.neg(!0)),a.k2.negative&&(a.k2.ineg(),f=f.neg(!0)),n[2*o]=s,n[2*o+1]=f,i[2*o]=a.k1,i[2*o+1]=a.k2}for(var c=this._wnafMulAdd(1,n,i,2*o,r),u=0;u<2*o;u++)n[u]=null,i[u]=null;return c},c(i,u.BasePoint),n.prototype.point=function(t,e,r){return new i(this,t,e,r)},n.prototype.pointFromJSON=function(t,e){return i.fromJSON(this,t,e)},i.prototype._getBeta=function(){if(this.curve.endo){var t=this.precomputed;if(t&&t.beta)return t.beta;var e=this.curve.point(this.x.redMul(this.curve.endo.beta),this.y);if(t){var r=this.curve,n=function(t){return r.point(t.x.redMul(r.endo.beta),t.y)};t.beta=e,e.precomputed={beta:null,naf:t.naf&&{wnd:t.naf.wnd,points:t.naf.points.map(n)},doubles:t.doubles&&{step:t.doubles.step,points:t.doubles.points.map(n)}}}return e}},i.prototype.toJSON=function(){return this.precomputed?[this.x,this.y,this.precomputed&&{doubles:this.precomputed.doubles&&{step:this.precomputed.doubles.step,points:this.precomputed.doubles.points.slice(1)},naf:this.precomputed.naf&&{wnd:this.precomputed.naf.wnd,points:this.precomputed.naf.points.slice(1)}}]:[this.x,this.y]},i.fromJSON=function(t,e,r){function n(e){return t.point(e[0],e[1],r)}"string"==typeof e&&(e=JSON.parse(e));var i=t.point(e[0],e[1],r);if(!e[2])return i;var o=e[2];return i.precomputed={beta:null,doubles:o.doubles&&{step:o.doubles.step,points:[i].concat(o.doubles.points.map(n))},naf:o.naf&&{wnd:o.naf.wnd,points:[i].concat(o.naf.points.map(n))}},i},i.prototype.inspect=function(){return this.isInfinity()?"<EC Point Infinity>":"<EC Point x: "+this.x.fromRed().toString(16,2)+" y: "+this.y.fromRed().toString(16,2)+">"},i.prototype.isInfinity=function(){return this.inf},i.prototype.add=function(t){if(this.inf)return t;if(t.inf)return this;if(this.eq(t))return this.dbl();if(this.neg().eq(t))return this.curve.point(null,null);if(0===this.x.cmp(t.x))return this.curve.point(null,null);var e=this.y.redSub(t.y);0!==e.cmpn(0)&&(e=e.redMul(this.x.redSub(t.x).redInvm()));var r=e.redSqr().redISub(this.x).redISub(t.x),n=e.redMul(this.x.redSub(r)).redISub(this.y);return this.curve.point(r,n)},i.prototype.dbl=function(){if(this.inf)return this;var t=this.y.redAdd(this.y);if(0===t.cmpn(0))return this.curve.point(null,null);var e=this.curve.a,r=this.x.redSqr(),n=t.redInvm(),i=r.redAdd(r).redIAdd(r).redIAdd(e).redMul(n),o=i.redSqr().redISub(this.x.redAdd(this.x)),a=i.redMul(this.x.redSub(o)).redISub(this.y);return this.curve.point(o,a)},i.prototype.getX=function(){return this.x.fromRed()},i.prototype.getY=function(){return this.y.fromRed()},i.prototype.mul=function(t){return t=new f(t,16),this._hasDoubles(t)?this.curve._fixedNafMul(this,t):this.curve.endo?this.curve._endoWnafMulAdd([this],[t]):this.curve._wnafMul(this,t)},i.prototype.mulAdd=function(t,e,r){var n=[this,e],i=[t,r];return this.curve.endo?this.curve._endoWnafMulAdd(n,i):this.curve._wnafMulAdd(1,n,i,2)},i.prototype.jmulAdd=function(t,e,r){var n=[this,e],i=[t,r];return this.curve.endo?this.curve._endoWnafMulAdd(n,i,!0):this.curve._wnafMulAdd(1,n,i,2,!0)},i.prototype.eq=function(t){return this===t||this.inf===t.inf&&(this.inf||0===this.x.cmp(t.x)&&0===this.y.cmp(t.y))},i.prototype.neg=function(t){if(this.inf)return this;var e=this.curve.point(this.x,this.y.redNeg());if(t&&this.precomputed){var r=this.precomputed,n=function(t){return t.neg()};e.precomputed={naf:r.naf&&{wnd:r.naf.wnd,points:r.naf.points.map(n)},doubles:r.doubles&&{step:r.doubles.step,points:r.doubles.points.map(n)}}}return e},i.prototype.toJ=function(){return this.inf?this.curve.jpoint(null,null,null):this.curve.jpoint(this.x,this.y,this.curve.one)},c(o,u.BasePoint),n.prototype.jpoint=function(t,e,r){return new o(this,t,e,r)},o.prototype.toP=function(){if(this.isInfinity())return this.curve.point(null,null);var t=this.z.redInvm(),e=t.redSqr(),r=this.x.redMul(e),n=this.y.redMul(e).redMul(t);return this.curve.point(r,n)},o.prototype.neg=function(){return this.curve.jpoint(this.x,this.y.redNeg(),this.z)},o.prototype.add=function(t){if(this.isInfinity())return t;if(t.isInfinity())return this;var e=t.z.redSqr(),r=this.z.redSqr(),n=this.x.redMul(e),i=t.x.redMul(r),o=this.y.redMul(e.redMul(t.z)),a=t.y.redMul(r.redMul(this.z)),s=n.redSub(i),f=o.redSub(a);if(0===s.cmpn(0))return 0!==f.cmpn(0)?this.curve.jpoint(null,null,null):this.dbl();var c=s.redSqr(),u=c.redMul(s),h=n.redMul(c),d=f.redSqr().redIAdd(u).redISub(h).redISub(h),l=f.redMul(h.redISub(d)).redISub(o.redMul(u)),p=this.z.redMul(t.z).redMul(s);return this.curve.jpoint(d,l,p)},o.prototype.mixedAdd=function(t){if(this.isInfinity())return t.toJ();if(t.isInfinity())return this;var e=this.z.redSqr(),r=this.x,n=t.x.redMul(e),i=this.y,o=t.y.redMul(e).redMul(this.z),a=r.redSub(n),s=i.redSub(o);if(0===a.cmpn(0))return 0!==s.cmpn(0)?this.curve.jpoint(null,null,null):this.dbl();var f=a.redSqr(),c=f.redMul(a),u=r.redMul(f),h=s.redSqr().redIAdd(c).redISub(u).redISub(u),d=s.redMul(u.redISub(h)).redISub(i.redMul(c)),l=this.z.redMul(a);return this.curve.jpoint(h,d,l)},o.prototype.dblp=function(t){if(0===t)return this;if(this.isInfinity())return this;if(!t)return this.dbl();if(this.curve.zeroA||this.curve.threeA){for(var e=this,r=0;r<t;r++)e=e.dbl();return e}for(var n=this.curve.a,i=this.curve.tinv,o=this.x,a=this.y,s=this.z,f=s.redSqr().redSqr(),c=a.redAdd(a),r=0;r<t;r++){var u=o.redSqr(),h=c.redSqr(),d=h.redSqr(),l=u.redAdd(u).redIAdd(u).redIAdd(n.redMul(f)),p=o.redMul(h),b=l.redSqr().redISub(p.redAdd(p)),v=p.redISub(b),y=l.redMul(v);y=y.redIAdd(y).redISub(d);var g=c.redMul(s);r+1<t&&(f=f.redMul(d)),o=b,s=g,c=y}return this.curve.jpoint(o,c.redMul(i),s)},o.prototype.dbl=function(){return this.isInfinity()?this:this.curve.zeroA?this._zeroDbl():this.curve.threeA?this._threeDbl():this._dbl()},o.prototype._zeroDbl=function(){var t,e,r;if(this.zOne){var n=this.x.redSqr(),i=this.y.redSqr(),o=i.redSqr(),a=this.x.redAdd(i).redSqr().redISub(n).redISub(o);a=a.redIAdd(a);var s=n.redAdd(n).redIAdd(n),f=s.redSqr().redISub(a).redISub(a),c=o.redIAdd(o);c=c.redIAdd(c),c=c.redIAdd(c),t=f,e=s.redMul(a.redISub(f)).redISub(c),r=this.y.redAdd(this.y)}else{var u=this.x.redSqr(),h=this.y.redSqr(),d=h.redSqr(),l=this.x.redAdd(h).redSqr().redISub(u).redISub(d);l=l.redIAdd(l);var p=u.redAdd(u).redIAdd(u),b=p.redSqr(),v=d.redIAdd(d);v=v.redIAdd(v),v=v.redIAdd(v),t=b.redISub(l).redISub(l),e=p.redMul(l.redISub(t)).redISub(v),r=this.y.redMul(this.z),r=r.redIAdd(r)}return this.curve.jpoint(t,e,r)},o.prototype._threeDbl=function(){var t,e,r;if(this.zOne){var n=this.x.redSqr(),i=this.y.redSqr(),o=i.redSqr(),a=this.x.redAdd(i).redSqr().redISub(n).redISub(o);a=a.redIAdd(a);var s=n.redAdd(n).redIAdd(n).redIAdd(this.curve.a),f=s.redSqr().redISub(a).redISub(a);t=f;var c=o.redIAdd(o);c=c.redIAdd(c),c=c.redIAdd(c),e=s.redMul(a.redISub(f)).redISub(c),r=this.y.redAdd(this.y)}else{var u=this.z.redSqr(),h=this.y.redSqr(),d=this.x.redMul(h),l=this.x.redSub(u).redMul(this.x.redAdd(u));l=l.redAdd(l).redIAdd(l);var p=d.redIAdd(d);p=p.redIAdd(p);var b=p.redAdd(p);t=l.redSqr().redISub(b),r=this.y.redAdd(this.z).redSqr().redISub(h).redISub(u);var v=h.redSqr();v=v.redIAdd(v),v=v.redIAdd(v),v=v.redIAdd(v),e=l.redMul(p.redISub(t)).redISub(v)}return this.curve.jpoint(t,e,r)},o.prototype._dbl=function(){var t=this.curve.a,e=this.x,r=this.y,n=this.z,i=n.redSqr().redSqr(),o=e.redSqr(),a=r.redSqr(),s=o.redAdd(o).redIAdd(o).redIAdd(t.redMul(i)),f=e.redAdd(e);f=f.redIAdd(f);var c=f.redMul(a),u=s.redSqr().redISub(c.redAdd(c)),h=c.redISub(u),d=a.redSqr();d=d.redIAdd(d),d=d.redIAdd(d),d=d.redIAdd(d);var l=s.redMul(h).redISub(d),p=r.redAdd(r).redMul(n);return this.curve.jpoint(u,l,p)},o.prototype.trpl=function(){if(!this.curve.zeroA)return this.dbl().add(this);var t=this.x.redSqr(),e=this.y.redSqr(),r=this.z.redSqr(),n=e.redSqr(),i=t.redAdd(t).redIAdd(t),o=i.redSqr(),a=this.x.redAdd(e).redSqr().redISub(t).redISub(n);a=a.redIAdd(a),a=a.redAdd(a).redIAdd(a),a=a.redISub(o);var s=a.redSqr(),f=n.redIAdd(n);f=f.redIAdd(f),f=f.redIAdd(f),f=f.redIAdd(f);var c=i.redIAdd(a).redSqr().redISub(o).redISub(s).redISub(f),u=e.redMul(c);u=u.redIAdd(u),u=u.redIAdd(u);var h=this.x.redMul(s).redISub(u);h=h.redIAdd(h),h=h.redIAdd(h);var d=this.y.redMul(c.redMul(f.redISub(c)).redISub(a.redMul(s)));d=d.redIAdd(d),d=d.redIAdd(d),d=d.redIAdd(d);var l=this.z.redAdd(a).redSqr().redISub(r).redISub(s);return this.curve.jpoint(h,d,l)},o.prototype.mul=function(t,e){return t=new f(t,e),this.curve._wnafMul(this,t)},o.prototype.eq=function(t){if("affine"===t.type)return this.eq(t.toJ());if(this===t)return!0;var e=this.z.redSqr(),r=t.z.redSqr();if(0!==this.x.redMul(r).redISub(t.x.redMul(e)).cmpn(0))return!1;var n=e.redMul(this.z),i=r.redMul(t.z);return 0===this.y.redMul(i).redISub(t.y.redMul(n)).cmpn(0)},o.prototype.eqXToP=function(t){var e=this.z.redSqr(),r=t.toRed(this.curve.red).redMul(e);if(0===this.x.cmp(r))return!0;for(var n=t.clone(),i=this.curve.redN.redMul(e);;){if(n.iadd(this.curve.n),n.cmp(this.curve.p)>=0)return!1;if(r.redIAdd(i),0===this.x.cmp(r))return!0}},o.prototype.inspect=function(){return this.isInfinity()?"<EC JPoint Infinity>":"<EC JPoint x: "+this.x.toString(16,2)+" y: "+this.y.toString(16,2)+" z: "+this.z.toString(16,2)+">"},o.prototype.isInfinity=function(){return 0===this.z.cmpn(0)}},{18:18,393:393,396:396,427:427}],399:[function(t,e,r){"use strict";function n(t){"short"===t.type?this.curve=new s.curve.short(t):"edwards"===t.type?this.curve=new s.curve.edwards(t):this.curve=new s.curve.mont(t),this.g=this.curve.g,this.n=this.curve.n,this.hash=t.hash,f(this.g.validate(),"Invalid curve"),f(this.g.mul(this.n).isInfinity(),"Invalid curve, G*N != O")}function i(t,e){Object.defineProperty(o,t,{configurable:!0,enumerable:!0,get:function(){var r=new n(e);return Object.defineProperty(o,t,{configurable:!0,enumerable:!0,value:r}),r}})}var o=r,a=t(412),s=t(393),f=s.utils.assert;o.PresetCurve=n,i("p192",{type:"short",prime:"p192",p:"ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff",a:"ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc",b:"64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1",n:"ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831",hash:a.sha256,gRed:!1,g:["188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012","07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811"]}),i("p224",{type:"short",prime:"p224",p:"ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001",a:"ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe",b:"b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4",n:"ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d",hash:a.sha256,gRed:!1,g:["b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21","bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34"]}),i("p256",{type:"short",prime:null,p:"ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff",a:"ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc",b:"5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b",n:"ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551",hash:a.sha256,gRed:!1,g:["6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296","4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5"]}),i("p384",{type:"short",prime:null,p:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 ffffffff",a:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 fffffffc",b:"b3312fa7 e23ee7e4 988e056b e3f82d19 181d9c6e fe814112 0314088f 5013875a c656398d 8a2ed19d 2a85c8ed d3ec2aef",n:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff c7634d81 f4372ddf 581a0db2 48b0a77a ecec196a ccc52973",hash:a.sha384,gRed:!1,g:["aa87ca22 be8b0537 8eb1c71e f320ad74 6e1d3b62 8ba79b98 59f741e0 82542a38 5502f25d bf55296c 3a545e38 72760ab7","3617de4a 96262c6f 5d9e98bf 9292dc29 f8f41dbd 289a147c e9da3113 b5f0b8c0 0a60b1ce 1d7e819d 7a431d7c 90ea0e5f"]}),i("p521",{type:"short",prime:null,p:"000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff",a:"000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffc",b:"00000051 953eb961 8e1c9a1f 929a21a0 b68540ee a2da725b 99b315f3 b8b48991 8ef109e1 56193951 ec7e937b 1652c0bd 3bb1bf07 3573df88 3d2c34f1 ef451fd4 6b503f00",n:"000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffa 51868783 bf2f966b 7fcc0148 f709a5d0 3bb5c9b8 899c47ae bb6fb71e 91386409",hash:a.sha512,gRed:!1,g:["000000c6 858e06b7 0404e9cd 9e3ecb66 2395b442 9c648139 053fb521 f828af60 6b4d3dba a14b5e77 efe75928 fe1dc127 a2ffa8de 3348b3c1 856a429b f97e7e31 c2e5bd66","00000118 39296a78 9a3bc004 5c8a5fb4 2c7d1bd9 98f54449 579b4468 17afbd17 273e662c 97ee7299 5ef42640 c550b901 3fad0761 353c7086 a272c240 88be9476 9fd16650"]}),i("curve25519",{type:"mont",prime:"p25519",p:"7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",a:"76d06",b:"1",n:"1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",hash:a.sha256,gRed:!1,g:["9"]}),i("ed25519",{type:"edwards",prime:"p25519",p:"7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",a:"-1",c:"1",d:"52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3",n:"1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",hash:a.sha256,gRed:!1,g:["216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a","6666666666666666666666666666666666666666666666666666666666666658"]});var c;try{c=t(406)}catch(t){c=void 0}i("secp256k1",{type:"short",prime:"k256",p:"ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f",a:"0",b:"7",n:"ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141",h:"1",hash:a.sha256,beta:"7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee",lambda:"5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72",basis:[{a:"3086d221a7d46bcde86c90e49284eb15",b:"-e4437ed6010e88286f547fa90abfe4c3"},{a:"114ca50f7a8e2f3f657c1108d9d44cfd8",b:"3086d221a7d46bcde86c90e49284eb15"}],gRed:!1,g:["79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798","483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",c]})},{393:393,406:406,412:412}],400:[function(t,e,r){"use strict";function n(t){if(!(this instanceof n))return new n(t);"string"==typeof t&&(f(a.curves.hasOwnProperty(t),"Unknown curve "+t),t=a.curves[t]),t instanceof a.curves.PresetCurve&&(t={curve:t}),this.curve=t.curve.curve,this.n=this.curve.n,this.nh=this.n.ushrn(1),this.g=this.curve.g,this.g=t.curve.g,this.g.precompute(t.curve.n.bitLength()+1),this.hash=t.hash||t.curve.hash}var i=t(18),o=t(424),a=t(393),s=a.utils,f=s.assert,c=t(401),u=t(402);e.exports=n,n.prototype.keyPair=function(t){return new c(this,t)},n.prototype.keyFromPrivate=function(t,e){return c.fromPrivate(this,t,e)},n.prototype.keyFromPublic=function(t,e){return c.fromPublic(this,t,e)},n.prototype.genKeyPair=function(t){t||(t={});for(var e=new o({hash:this.hash,pers:t.pers,persEnc:t.persEnc||"utf8",entropy:t.entropy||a.rand(this.hash.hmacStrength),entropyEnc:t.entropy&&t.entropyEnc||"utf8",nonce:this.n.toArray()}),r=this.n.byteLength(),n=this.n.sub(new i(2));;){var s=new i(e.generate(r));if(!(s.cmp(n)>0))return s.iaddn(1),this.keyFromPrivate(s)}},n.prototype._truncateToN=function(t,e){var r=8*t.byteLength()-this.n.bitLength();return r>0&&(t=t.ushrn(r)),!e&&t.cmp(this.n)>=0?t.sub(this.n):t},n.prototype.sign=function(t,e,r,n){"object"==typeof r&&(n=r,r=null),n||(n={}),e=this.keyFromPrivate(e,r),t=this._truncateToN(new i(t,16));for(var a=this.n.byteLength(),s=e.getPrivate().toArray("be",a),f=t.toArray("be",a),c=new o({hash:this.hash,entropy:s,nonce:f,pers:n.pers,persEnc:n.persEnc||"utf8"}),h=this.n.sub(new i(1)),d=0;!0;d++){var l=n.k?n.k(d):new i(c.generate(this.n.byteLength()));if(l=this._truncateToN(l,!0),!(l.cmpn(1)<=0||l.cmp(h)>=0)){var p=this.g.mul(l);if(!p.isInfinity()){var b=p.getX(),v=b.umod(this.n);if(0!==v.cmpn(0)){var y=l.invm(this.n).mul(v.mul(e.getPrivate()).iadd(t));if(y=y.umod(this.n),0!==y.cmpn(0)){var g=(p.getY().isOdd()?1:0)|(0!==b.cmp(v)?2:0);return n.canonical&&y.cmp(this.nh)>0&&(y=this.n.sub(y),g^=1),new u({r:v,s:y,recoveryParam:g})}}}}}},n.prototype.verify=function(t,e,r,n){t=this._truncateToN(new i(t,16)),r=this.keyFromPublic(r,n),e=new u(e,"hex");var o=e.r,a=e.s;if(o.cmpn(1)<0||o.cmp(this.n)>=0)return!1;if(a.cmpn(1)<0||a.cmp(this.n)>=0)return!1;var s=a.invm(this.n),f=s.mul(t).umod(this.n),c=s.mul(o).umod(this.n);if(!this.curve._maxwellTrick){var h=this.g.mulAdd(f,r.getPublic(),c);return!h.isInfinity()&&0===h.getX().umod(this.n).cmp(o)}var h=this.g.jmulAdd(f,r.getPublic(),c);return!h.isInfinity()&&h.eqXToP(o)},n.prototype.recoverPubKey=function(t,e,r,n){f((3&r)===r,"The recovery param is more than two bits"),e=new u(e,n);var o=this.n,a=new i(t),s=e.r,c=e.s,h=1&r,d=r>>1;if(s.cmp(this.curve.p.umod(this.curve.n))>=0&&d)throw new Error("Unable to find sencond key candinate");s=d?this.curve.pointFromX(s.add(this.curve.n),h):this.curve.pointFromX(s,h);var l=e.r.invm(o),p=o.sub(a).mul(l).umod(o),b=c.mul(l).umod(o);return this.g.mulAdd(p,s,b)},n.prototype.getKeyRecoveryParam=function(t,e,r,n){if(e=new u(e,n),null!==e.recoveryParam)return e.recoveryParam;for(var i=0;i<4;i++){var o;try{o=this.recoverPubKey(t,e,i)}catch(t){continue}if(o.eq(r))return i}throw new Error("Unable to find valid recovery factor")}},{18:18,393:393,401:401,402:402,424:424}],401:[function(t,e,r){"use strict";function n(t,e){this.ec=t,this.priv=null,this.pub=null,e.priv&&this._importPrivate(e.priv,e.privEnc),e.pub&&this._importPublic(e.pub,e.pubEnc)}var i=t(18),o=t(393),a=o.utils,s=a.assert;e.exports=n,n.fromPublic=function(t,e,r){return e instanceof n?e:new n(t,{pub:e,pubEnc:r})},n.fromPrivate=function(t,e,r){return e instanceof n?e:new n(t,{priv:e,privEnc:r})},n.prototype.validate=function(){var t=this.getPublic();return t.isInfinity()?{result:!1,reason:"Invalid public key"}:t.validate()?t.mul(this.ec.curve.n).isInfinity()?{result:!0,reason:null}:{result:!1,reason:"Public key * N != O"}:{result:!1,reason:"Public key is not a point"}},n.prototype.getPublic=function(t,e){return"string"==typeof t&&(e=t,t=null),this.pub||(this.pub=this.ec.g.mul(this.priv)),e?this.pub.encode(e,t):this.pub},n.prototype.getPrivate=function(t){return"hex"===t?this.priv.toString(16,2):this.priv},n.prototype._importPrivate=function(t,e){this.priv=new i(t,e||16),this.priv=this.priv.umod(this.ec.curve.n)},n.prototype._importPublic=function(t,e){if(t.x||t.y)return"mont"===this.ec.curve.type?s(t.x,"Need x coordinate"):"short"!==this.ec.curve.type&&"edwards"!==this.ec.curve.type||s(t.x&&t.y,"Need both x and y coordinate"),void(this.pub=this.ec.curve.point(t.x,t.y));this.pub=this.ec.curve.decodePoint(t,e)},n.prototype.derive=function(t){return t.mul(this.priv).getX()},n.prototype.sign=function(t,e,r){return this.ec.sign(t,this,e,r)},n.prototype.verify=function(t,e){return this.ec.verify(t,e,this)},n.prototype.inspect=function(){return"<Key priv: "+(this.priv&&this.priv.toString(16,2))+" pub: "+(this.pub&&this.pub.inspect())+" >"}},{18:18,393:393}],402:[function(t,e,r){"use strict";function n(t,e){if(t instanceof n)return t;this._importDER(t,e)||(h(t.r&&t.s,"Signature without r or s"),this.r=new f(t.r,16),this.s=new f(t.s,16),void 0===t.recoveryParam?this.recoveryParam=null:this.recoveryParam=t.recoveryParam)}function i(){this.place=0}function o(t,e){var r=t[e.place++];if(!(128&r))return r;for(var n=15&r,i=0,o=0,a=e.place;o<n;o++,a++)i<<=8,i|=t[a];return e.place=a,i}function a(t){for(var e=0,r=t.length-1;!t[e]&&!(128&t[e+1])&&e<r;)e++;return 0===e?t:t.slice(e)}function s(t,e){if(e<128)return void t.push(e);var r=1+(Math.log(e)/Math.LN2>>>3);for(t.push(128|r);--r;)t.push(e>>>(r<<3)&255);t.push(e)}var f=t(18),c=t(393),u=c.utils,h=u.assert;e.exports=n,n.prototype._importDER=function(t,e){t=u.toArray(t,e);var r=new i;if(48!==t[r.place++])return!1;if(o(t,r)+r.place!==t.length)return!1;if(2!==t[r.place++])return!1;var n=o(t,r),a=t.slice(r.place,n+r.place);if(r.place+=n,2!==t[r.place++])return!1;var s=o(t,r);if(t.length!==s+r.place)return!1;var c=t.slice(r.place,s+r.place);return 0===a[0]&&128&a[1]&&(a=a.slice(1)),0===c[0]&&128&c[1]&&(c=c.slice(1)),this.r=new f(a),this.s=new f(c),this.recoveryParam=null,!0},n.prototype.toDER=function(t){var e=this.r.toArray(),r=this.s.toArray();for(128&e[0]&&(e=[0].concat(e)),128&r[0]&&(r=[0].concat(r)),e=a(e),r=a(r);!(r[0]||128&r[1]);)r=r.slice(1);var n=[2];s(n,e.length),n=n.concat(e),n.push(2),s(n,r.length);var i=n.concat(r),o=[48];return s(o,i.length),o=o.concat(i),u.encode(o,t)}},{18:18,393:393}],403:[function(t,e,r){"use strict";function n(t){if(s("ed25519"===t,"only tested with ed25519 so far"),!(this instanceof n))return new n(t);var t=o.curves[t].curve;this.curve=t,this.g=t.g,this.g.precompute(t.n.bitLength()+1),this.pointClass=t.point().constructor,this.encodingLength=Math.ceil(t.n.bitLength()/8),this.hash=i.sha512}var i=t(412),o=t(393),a=o.utils,s=a.assert,f=a.parseBytes,c=t(404),u=t(405);e.exports=n,n.prototype.sign=function(t,e){t=f(t);var r=this.keyFromSecret(e),n=this.hashInt(r.messagePrefix(),t),i=this.g.mul(n),o=this.encodePoint(i),a=this.hashInt(o,r.pubBytes(),t).mul(r.priv()),s=n.add(a).umod(this.curve.n);return this.makeSignature({R:i,S:s,Rencoded:o})},n.prototype.verify=function(t,e,r){t=f(t),e=this.makeSignature(e);var n=this.keyFromPublic(r),i=this.hashInt(e.Rencoded(),n.pubBytes(),t),o=this.g.mul(e.S());return e.R().add(n.pub().mul(i)).eq(o)},n.prototype.hashInt=function(){for(var t=this.hash(),e=0;e<arguments.length;e++)t.update(arguments[e]);return a.intFromLE(t.digest()).umod(this.curve.n)},n.prototype.keyFromPublic=function(t){return c.fromPublic(this,t)},n.prototype.keyFromSecret=function(t){return c.fromSecret(this,t)},n.prototype.makeSignature=function(t){return t instanceof u?t:new u(this,t)},n.prototype.encodePoint=function(t){var e=t.getY().toArray("le",this.encodingLength);return e[this.encodingLength-1]|=t.getX().isOdd()?128:0,e},n.prototype.decodePoint=function(t){t=a.parseBytes(t);var e=t.length-1,r=t.slice(0,e).concat(-129&t[e]),n=0!=(128&t[e]),i=a.intFromLE(r);return this.curve.pointFromY(i,n)},n.prototype.encodeInt=function(t){return t.toArray("le",this.encodingLength)},n.prototype.decodeInt=function(t){return a.intFromLE(t)},n.prototype.isPoint=function(t){return t instanceof this.pointClass}},{393:393,404:404,405:405,412:412}],404:[function(t,e,r){"use strict";function n(t,e){this.eddsa=t,this._secret=s(e.secret),t.isPoint(e.pub)?this._pub=e.pub:this._pubBytes=s(e.pub)}var i=t(393),o=i.utils,a=o.assert,s=o.parseBytes,f=o.cachedProperty;n.fromPublic=function(t,e){return e instanceof n?e:new n(t,{pub:e})},n.fromSecret=function(t,e){return e instanceof n?e:new n(t,{secret:e})},n.prototype.secret=function(){return this._secret},f(n,"pubBytes",function(){return this.eddsa.encodePoint(this.pub())}),f(n,"pub",function(){return this._pubBytes?this.eddsa.decodePoint(this._pubBytes):this.eddsa.g.mul(this.priv())}),f(n,"privBytes",function(){var t=this.eddsa,e=this.hash(),r=t.encodingLength-1,n=e.slice(0,t.encodingLength);return n[0]&=248,n[r]&=127,n[r]|=64,n}),f(n,"priv",function(){return this.eddsa.decodeInt(this.privBytes())}),f(n,"hash",function(){return this.eddsa.hash().update(this.secret()).digest()}),f(n,"messagePrefix",function(){return this.hash().slice(this.eddsa.encodingLength)}),n.prototype.sign=function(t){return a(this._secret,"KeyPair can only verify"),this.eddsa.sign(t,this)},n.prototype.verify=function(t,e){return this.eddsa.verify(t,e,this)},n.prototype.getSecret=function(t){return a(this._secret,"KeyPair is public only"),o.encode(this.secret(),t)},n.prototype.getPublic=function(t){return o.encode(this.pubBytes(),t)},e.exports=n},{393:393}],405:[function(t,e,r){"use strict";function n(t,e){this.eddsa=t,"object"!=typeof e&&(e=c(e)),Array.isArray(e)&&(e={R:e.slice(0,t.encodingLength),S:e.slice(t.encodingLength)}),s(e.R&&e.S,"Signature without R or S"),t.isPoint(e.R)&&(this._R=e.R),e.S instanceof i&&(this._S=e.S),this._Rencoded=Array.isArray(e.R)?e.R:e.Rencoded,this._Sencoded=Array.isArray(e.S)?e.S:e.Sencoded}var i=t(18),o=t(393),a=o.utils,s=a.assert,f=a.cachedProperty,c=a.parseBytes;f(n,"S",function(){return this.eddsa.decodeInt(this.Sencoded())}),f(n,"R",function(){return this.eddsa.decodePoint(this.Rencoded())}),f(n,"Rencoded",function(){return this.eddsa.encodePoint(this.R())}),f(n,"Sencoded",function(){return this.eddsa.encodeInt(this.S())}),n.prototype.toBytes=function(){return this.Rencoded().concat(this.Sencoded())},n.prototype.toHex=function(){return a.encode(this.toBytes(),"hex").toUpperCase()},e.exports=n},{18:18,393:393}],406:[function(t,e,r){e.exports={doubles:{step:4,
points:[["e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a","f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821"],["8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508","11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf"],["175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739","d3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695"],["363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640","4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9"],["8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c","4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36"],["723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda","96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f"],["eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa","5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999"],["100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0","cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09"],["e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d","9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d"],["feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d","e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088"],["da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1","9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d"],["53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0","5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8"],["8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047","10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a"],["385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862","283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453"],["6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7","7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160"],["3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd","56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0"],["85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83","7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6"],["948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a","53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589"],["6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8","bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17"],["e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d","4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda"],["e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725","7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd"],["213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754","4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2"],["4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c","17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6"],["fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6","6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f"],["76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39","c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01"],["c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891","893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3"],["d895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b","febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f"],["b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03","2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7"],["e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d","eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78"],["a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070","7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1"],["90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4","e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150"],["8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da","662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82"],["e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11","1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc"],["8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e","efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b"],["e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41","2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51"],["b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef","67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45"],["d68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8","db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120"],["324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d","648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84"],["4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96","35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d"],["9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd","ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d"],["6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5","9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8"],["a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266","40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8"],["7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71","34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac"],["928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac","c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f"],["85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751","1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962"],["ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e","493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907"],["827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241","c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec"],["eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3","be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d"],["e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f","4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414"],["1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19","aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd"],["146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be","b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0"],["fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9","6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811"],["da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2","8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1"],["a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13","7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c"],["174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c","ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73"],["959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba","2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd"],["d2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151","e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405"],["64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073","d99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589"],["8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458","38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e"],["13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b","69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27"],["bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366","d3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1"],["8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa","40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482"],["8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0","620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945"],["dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787","7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573"],["f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e","ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82"]]},naf:{wnd:7,points:[["f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9","388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672"],["2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4","d8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6"],["5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc","6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da"],["acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe","cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37"],["774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb","d984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b"],["f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8","ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81"],["d7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e","581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58"],["defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34","4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77"],["2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c","85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a"],["352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5","321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c"],["2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f","2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67"],["9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714","73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402"],["daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729","a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55"],["c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db","2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482"],["6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4","e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82"],["1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5","b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396"],["605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479","2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49"],["62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d","80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf"],["80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f","1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a"],["7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb","d0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7"],["d528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9","eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933"],["49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963","758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a"],["77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74","958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6"],["f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530","e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37"],["463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b","5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e"],["f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247","cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6"],["caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1","cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476"],["2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120","4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40"],["7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435","91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61"],["754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18","673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683"],["e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8","59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5"],["186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb","3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b"],["df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f","55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417"],["5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143","efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868"],["290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba","e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a"],["af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45","f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6"],["766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a","744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996"],["59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e","c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e"],["f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8","e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d"],["7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c","30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2"],["948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519","e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e"],["7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab","100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437"],["3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca","ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311"],["d3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf","8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4"],["1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610","68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575"],["733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4","f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d"],["15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c","d56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d"],["a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940","edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629"],["e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980","a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06"],["311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3","66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374"],["34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf","9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee"],["f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63","4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1"],["d7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448","fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b"],["32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf","5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661"],["7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5","8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6"],["ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6","8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e"],["16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5","5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d"],["eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99","f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc"],["78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51","f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4"],["494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5","42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c"],["a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5","204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b"],["c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997","4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913"],["841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881","73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154"],["5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5","39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865"],["36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66","d2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc"],["336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726","ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224"],["8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede","6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e"],["1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94","60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6"],["85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31","3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511"],["29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51","b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b"],["a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252","ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2"],["4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5","cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c"],["d24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b","6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3"],["ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4","322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d"],["af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f","6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700"],["e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889","2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4"],["591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246","b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196"],["11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984","998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4"],["3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a","b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257"],["cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030","bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13"],["c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197","6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096"],["c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593","c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38"],["a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef","21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f"],["347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38","60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448"],["da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a","49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a"],["c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111","5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4"],["4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502","7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437"],["3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea","be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7"],["cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26","8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d"],["b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986","39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a"],["d4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e","62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54"],["48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4","25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77"],["dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda","ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517"],["6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859","cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10"],["e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f","f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125"],["eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c","6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e"],["13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942","fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1"],["ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a","1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2"],["b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80","5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423"],["ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d","438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8"],["8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1","cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758"],["52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63","c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375"],["e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352","6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d"],["7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193","ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec"],["5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00","9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0"],["32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58","ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c"],["e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7","d3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4"],["8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8","c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f"],["4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e","67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649"],["3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d","cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826"],["674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b","299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5"],["d32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f","f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87"],["30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6","462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b"],["be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297","62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc"],["93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a","7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c"],["b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c","ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f"],["d5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52","4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a"],["d3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb","bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46"],["463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065","bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f"],["7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917","603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03"],["74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9","cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08"],["30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3","553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8"],["9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57","712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373"],["176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66","ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3"],["75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8","9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8"],["809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721","9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1"],["1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180","4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9"]]}}},{}],407:[function(t,e,r){"use strict";function n(t,e){for(var r=[],n=1<<e+1,i=t.clone();i.cmpn(1)>=0;){var o;if(i.isOdd()){var a=i.andln(n-1);o=a>(n>>1)-1?(n>>1)-a:a,i.isubn(o)}else o=0;r.push(o);for(var s=0!==i.cmpn(0)&&0===i.andln(n-1)?e+1:1,f=1;f<s;f++)r.push(0);i.iushrn(s)}return r}function i(t,e){var r=[[],[]];t=t.clone(),e=e.clone();for(var n=0,i=0;t.cmpn(-n)>0||e.cmpn(-i)>0;){var o=t.andln(3)+n&3,a=e.andln(3)+i&3;3===o&&(o=-1),3===a&&(a=-1);var s;if(0==(1&o))s=0;else{var f=t.andln(7)+n&7;s=3!==f&&5!==f||2!==a?o:-o}r[0].push(s);var c;if(0==(1&a))c=0;else{var f=e.andln(7)+i&7;c=3!==f&&5!==f||2!==o?a:-a}r[1].push(c),2*n===s+1&&(n=1-n),2*i===c+1&&(i=1-i),t.iushrn(1),e.iushrn(1)}return r}function o(t,e,r){var n="_"+e;t.prototype[e]=function(){return void 0!==this[n]?this[n]:this[n]=r.call(this)}}function a(t){return"string"==typeof t?f.toArray(t,"hex"):t}function s(t){return new c(t,"hex","le")}var f=r,c=t(18),u=t(432),h=t(433);f.assert=u,f.toArray=h.toArray,f.zero2=h.zero2,f.toHex=h.toHex,f.encode=h.encode,f.getNAF=n,f.getJSF=i,f.cachedProperty=o,f.parseBytes=a,f.intFromLE=s},{18:18,432:432,433:433}],408:[function(t,e,r){e.exports={_args:[[{raw:"elliptic@^6.0.0",scope:null,escapedName:"elliptic",name:"elliptic",rawSpec:"^6.0.0",spec:">=6.0.0 <7.0.0",type:"range"},"/opt/TeamCityAgent/work/4711273c20832a1a/media-source-media-provider/node_modules/browserify-sign"]],_from:"elliptic@>=6.0.0 <7.0.0",_id:"elliptic@6.4.1",_inCache:!0,_location:"/elliptic",_nodeVersion:"10.5.0",_npmOperationalInternal:{host:"s3://npm-registry-packages",tmp:"tmp/elliptic_6.4.1_1533787091502_0.6309761823717674"},_npmUser:{name:"indutny",email:"fedor@indutny.com"},_npmVersion:"6.3.0",_phantomChildren:{},_requested:{raw:"elliptic@^6.0.0",scope:null,escapedName:"elliptic",name:"elliptic",rawSpec:"^6.0.0",spec:">=6.0.0 <7.0.0",type:"range"},_requiredBy:["/browserify-sign","/create-ecdh"],_resolved:"https://registry.npmjs.org/elliptic/-/elliptic-6.4.1.tgz",_shasum:"c2d0b7776911b86722c632c3c06c60f2f819939a",_shrinkwrap:null,_spec:"elliptic@^6.0.0",_where:"/opt/TeamCityAgent/work/4711273c20832a1a/media-source-media-provider/node_modules/browserify-sign",author:{name:"Fedor Indutny",email:"fedor@indutny.com"},bugs:{url:"https://github.com/indutny/elliptic/issues"},dependencies:{"bn.js":"^4.4.0",brorand:"^1.0.1","hash.js":"^1.0.0","hmac-drbg":"^1.0.0",inherits:"^2.0.1","minimalistic-assert":"^1.0.0","minimalistic-crypto-utils":"^1.0.0"},description:"EC cryptography",devDependencies:{brfs:"^1.4.3",coveralls:"^2.11.3",grunt:"^0.4.5","grunt-browserify":"^5.0.0","grunt-cli":"^1.2.0","grunt-contrib-connect":"^1.0.0","grunt-contrib-copy":"^1.0.0","grunt-contrib-uglify":"^1.0.1","grunt-mocha-istanbul":"^3.0.1","grunt-saucelabs":"^8.6.2",istanbul:"^0.4.2",jscs:"^2.9.0",jshint:"^2.6.0",mocha:"^2.1.0"},directories:{},dist:{integrity:"sha512-BsXLz5sqX8OHcsh7CqBMztyXARmGQ3LWPtGjJi6DiJHq5C/qvi9P3OqgswKSDftbu8+IoI/QDTAm2fFnQ9SZSQ==",shasum:"c2d0b7776911b86722c632c3c06c60f2f819939a",tarball:"https://registry.npmjs.org/elliptic/-/elliptic-6.4.1.tgz",fileCount:17,unpackedSize:118371,"npm-signature":"-----BEGIN PGP SIGNATURE-----\r\nVersion: OpenPGP.js v3.0.4\r\nComment: https://openpgpjs.org\r\n\r\nwsFcBAEBCAAQBQJba7vUCRA9TVsSAnZWagAA+gcP/jWaj5GmDZ0YFi/X4g5O\nx+pxu9i3HbP9YqywT7rz3XFXSaytu0LQDeDEbddl523X69tsbKfzHRTcnW8n\n2r0VjPhttRm+0RpEhBwjSIK34VkQA1xIWh2ugOToKXVCFVLM5VFDPGzbiN6x\n/hpL7gj1hoCRVmuhjnqFQ+vPKACKfv1Eq4CsRmu2focmP37kQpWQlweD/z4V\nJF4NxA33Fvp13Fl+9g4sPHyhUVsW9ojVaG3Ijn70pCaGQM18UPlbODkWQ1QX\nAgteOFjkIOtcalJk3B3qsM8GZeHEcAFvt2T73miJkHdCGNmRQS45Ede+gnj0\nlLlZJsCCKUHtTqrlprHo6AgMnBZufmytyozYAHC1/JYniazSBi2yPHtQeniR\nl69BfiRBdD2rNrMPwmCNRkMqrgel5WMGpaD0xdaFAHF1Ru2ZQFKsA7KvPGgp\nA20+LN11cCib67Pg5XDyrZ92T3yXec+6gQ3iq9d9UBZKFGl0P8ebVqq1LrUJ\na6nekwMpRISWnKcqV72XVmQdBmUWHq9VfVLsWJzVIJqtpHmUO7q74ACP3i4W\n0/F1REeI0YEhh3NjeStdDecfjlu7PY0pLQpbk2I3ms+6DO+cAfeDEev5jFBK\nwQabRNhITeT1FVtxZAcApj33fnCdqwaWr1NS00K5ZRqhDTTzPr/O4KRN4CR1\npstU\r\n=UVBB\r\n-----END PGP SIGNATURE-----\r\n"},files:["lib"],gitHead:"523da1cf71ddcfd607fbdee1858bc2af47f0e700",homepage:"https://github.com/indutny/elliptic",keywords:["EC","Elliptic","curve","Cryptography"],license:"MIT",main:"lib/elliptic.js",maintainers:[{name:"indutny",email:"fedor@indutny.com"}],name:"elliptic",optionalDependencies:{},readme:"ERROR: No README data found!",repository:{type:"git",url:"git+ssh://git@github.com/indutny/elliptic.git"},scripts:{jscs:"jscs benchmarks/*.js lib/*.js lib/**/*.js lib/**/**/*.js test/index.js",jshint:"jscs benchmarks/*.js lib/*.js lib/**/*.js lib/**/**/*.js test/index.js",lint:"npm run jscs && npm run jshint",test:"npm run lint && npm run unit",unit:"istanbul test _mocha --reporter=spec test/index.js",version:"grunt dist && git add dist/"},version:"6.4.1"}},{}],409:[function(t,e,r){function n(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function i(t){return"function"==typeof t}function o(t){return"number"==typeof t}function a(t){return"object"==typeof t&&null!==t}function s(t){return void 0===t}e.exports=n,n.EventEmitter=n,n.prototype._events=void 0,n.prototype._maxListeners=void 0,n.defaultMaxListeners=10,n.prototype.setMaxListeners=function(t){if(!o(t)||t<0||isNaN(t))throw TypeError("n must be a positive number");return this._maxListeners=t,this},n.prototype.emit=function(t){var e,r,n,o,f,c;if(this._events||(this._events={}),"error"===t&&(!this._events.error||a(this._events.error)&&!this._events.error.length)){if((e=arguments[1])instanceof Error)throw e;var u=new Error('Uncaught, unspecified "error" event. ('+e+")");throw u.context=e,u}if(r=this._events[t],s(r))return!1;if(i(r))switch(arguments.length){case 1:r.call(this);break;case 2:r.call(this,arguments[1]);break;case 3:r.call(this,arguments[1],arguments[2]);break;default:o=Array.prototype.slice.call(arguments,1),r.apply(this,o)
}else if(a(r))for(o=Array.prototype.slice.call(arguments,1),c=r.slice(),n=c.length,f=0;f<n;f++)c[f].apply(this,o);return!0},n.prototype.addListener=function(t,e){var r;if(!i(e))throw TypeError("listener must be a function");return this._events||(this._events={}),this._events.newListener&&this.emit("newListener",t,i(e.listener)?e.listener:e),this._events[t]?a(this._events[t])?this._events[t].push(e):this._events[t]=[this._events[t],e]:this._events[t]=e,a(this._events[t])&&!this._events[t].warned&&(r=s(this._maxListeners)?n.defaultMaxListeners:this._maxListeners)&&r>0&&this._events[t].length>r&&(this._events[t].warned=!0,console.trace),this},n.prototype.on=n.prototype.addListener,n.prototype.once=function(t,e){function r(){this.removeListener(t,r),n||(n=!0,e.apply(this,arguments))}if(!i(e))throw TypeError("listener must be a function");var n=!1;return r.listener=e,this.on(t,r),this},n.prototype.removeListener=function(t,e){var r,n,o,s;if(!i(e))throw TypeError("listener must be a function");if(!this._events||!this._events[t])return this;if(r=this._events[t],o=r.length,n=-1,r===e||i(r.listener)&&r.listener===e)delete this._events[t],this._events.removeListener&&this.emit("removeListener",t,e);else if(a(r)){for(s=o;s-- >0;)if(r[s]===e||r[s].listener&&r[s].listener===e){n=s;break}if(n<0)return this;1===r.length?(r.length=0,delete this._events[t]):r.splice(n,1),this._events.removeListener&&this.emit("removeListener",t,e)}return this},n.prototype.removeAllListeners=function(t){var e,r;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[t]&&delete this._events[t],this;if(0===arguments.length){for(e in this._events)"removeListener"!==e&&this.removeAllListeners(e);return this.removeAllListeners("removeListener"),this._events={},this}if(r=this._events[t],i(r))this.removeListener(t,r);else if(r)for(;r.length;)this.removeListener(t,r[r.length-1]);return delete this._events[t],this},n.prototype.listeners=function(t){return this._events&&this._events[t]?i(this._events[t])?[this._events[t]]:this._events[t].slice():[]},n.prototype.listenerCount=function(t){if(this._events){var e=this._events[t];if(i(e))return 1;if(e)return e.length}return 0},n.listenerCount=function(t,e){return t.listenerCount(e)}},{}],410:[function(t,e,r){function n(t,e,r,n){if(i.isBuffer(t)||(t=i.from(t,"binary")),e&&(i.isBuffer(e)||(e=i.from(e,"binary")),8!==e.length))throw new RangeError("salt should be Buffer with 8 byte length");for(var a=r/8,s=i.alloc(a),f=i.alloc(n||0),c=i.alloc(0);a>0||n>0;){var u=new o;u.update(c),u.update(t),e&&u.update(e),c=u.digest();var h=0;if(a>0){var d=s.length-a;h=Math.min(a,c.length),c.copy(s,d,0,h),a-=h}if(h<c.length&&n>0){var l=f.length-n,p=Math.min(n,c.length-h);c.copy(f,l,h,h+p),n-=p}}return c.fill(0),{key:s,iv:f}}var i=t(471).Buffer,o=t(430);e.exports=n},{430:430,471:471}],411:[function(t,e,r){"use strict";function n(t,e){if(!o.isBuffer(t)&&"string"!=typeof t)throw new TypeError(e+" must be a string or a buffer")}function i(t){a.call(this),this._block=o.allocUnsafe(t),this._blockSize=t,this._blockOffset=0,this._length=[0,0,0,0],this._finalized=!1}var o=t(471).Buffer,a=t(481).Transform;t(427)(i,a),i.prototype._transform=function(t,e,r){var n=null;try{this.update(t,e)}catch(t){n=t}r(n)},i.prototype._flush=function(t){var e=null;try{this.push(this.digest())}catch(t){e=t}t(e)},i.prototype.update=function(t,e){if(n(t,"Data"),this._finalized)throw new Error("Digest already called");o.isBuffer(t)||(t=o.from(t,e));for(var r=this._block,i=0;this._blockOffset+t.length-i>=this._blockSize;){for(var a=this._blockOffset;a<this._blockSize;)r[a++]=t[i++];this._update(),this._blockOffset=0}for(;i<t.length;)r[this._blockOffset++]=t[i++];for(var s=0,f=8*t.length;f>0;++s)this._length[s]+=f,(f=this._length[s]/4294967296|0)>0&&(this._length[s]-=4294967296*f);return this},i.prototype._update=function(){throw new Error("_update is not implemented")},i.prototype.digest=function(t){if(this._finalized)throw new Error("Digest already called");this._finalized=!0;var e=this._digest();void 0!==t&&(e=e.toString(t)),this._block.fill(0),this._blockOffset=0;for(var r=0;r<4;++r)this._length[r]=0;return e},i.prototype._digest=function(){throw new Error("_digest is not implemented")},e.exports=i},{427:427,471:471,481:481}],412:[function(t,e,r){var n=r;n.utils=t(423),n.common=t(413),n.sha=t(416),n.ripemd=t(415),n.hmac=t(414),n.sha1=n.sha.sha1,n.sha256=n.sha.sha256,n.sha224=n.sha.sha224,n.sha384=n.sha.sha384,n.sha512=n.sha.sha512,n.ripemd160=n.ripemd.ripemd160},{413:413,414:414,415:415,416:416,423:423}],413:[function(t,e,r){"use strict";function n(){this.pending=null,this.pendingTotal=0,this.blockSize=this.constructor.blockSize,this.outSize=this.constructor.outSize,this.hmacStrength=this.constructor.hmacStrength,this.padLength=this.constructor.padLength/8,this.endian="big",this._delta8=this.blockSize/8,this._delta32=this.blockSize/32}var i=t(423),o=t(432);r.BlockHash=n,n.prototype.update=function(t,e){if(t=i.toArray(t,e),this.pending?this.pending=this.pending.concat(t):this.pending=t,this.pendingTotal+=t.length,this.pending.length>=this._delta8){t=this.pending;var r=t.length%this._delta8;this.pending=t.slice(t.length-r,t.length),0===this.pending.length&&(this.pending=null),t=i.join32(t,0,t.length-r,this.endian);for(var n=0;n<t.length;n+=this._delta32)this._update(t,n,n+this._delta32)}return this},n.prototype.digest=function(t){return this.update(this._pad()),o(null===this.pending),this._digest(t)},n.prototype._pad=function(){var t=this.pendingTotal,e=this._delta8,r=e-(t+this.padLength)%e,n=new Array(r+this.padLength);n[0]=128;for(var i=1;i<r;i++)n[i]=0;if(t<<=3,"big"===this.endian){for(var o=8;o<this.padLength;o++)n[i++]=0;n[i++]=0,n[i++]=0,n[i++]=0,n[i++]=0,n[i++]=t>>>24&255,n[i++]=t>>>16&255,n[i++]=t>>>8&255,n[i++]=255&t}else for(n[i++]=255&t,n[i++]=t>>>8&255,n[i++]=t>>>16&255,n[i++]=t>>>24&255,n[i++]=0,n[i++]=0,n[i++]=0,n[i++]=0,o=8;o<this.padLength;o++)n[i++]=0;return n}},{423:423,432:432}],414:[function(t,e,r){"use strict";function n(t,e,r){if(!(this instanceof n))return new n(t,e,r);this.Hash=t,this.blockSize=t.blockSize/8,this.outSize=t.outSize/8,this.inner=null,this.outer=null,this._init(i.toArray(e,r))}var i=t(423),o=t(432);e.exports=n,n.prototype._init=function(t){t.length>this.blockSize&&(t=(new this.Hash).update(t).digest()),o(t.length<=this.blockSize);for(var e=t.length;e<this.blockSize;e++)t.push(0);for(e=0;e<t.length;e++)t[e]^=54;for(this.inner=(new this.Hash).update(t),e=0;e<t.length;e++)t[e]^=106;this.outer=(new this.Hash).update(t)},n.prototype.update=function(t,e){return this.inner.update(t,e),this},n.prototype.digest=function(t){return this.outer.update(this.inner.digest()),this.outer.digest(t)}},{423:423,432:432}],415:[function(t,e,r){"use strict";function n(){if(!(this instanceof n))return new n;l.call(this),this.h=[1732584193,4023233417,2562383102,271733878,3285377520],this.endian="little"}function i(t,e,r,n){return t<=15?e^r^n:t<=31?e&r|~e&n:t<=47?(e|~r)^n:t<=63?e&n|r&~n:e^(r|~n)}function o(t){return t<=15?0:t<=31?1518500249:t<=47?1859775393:t<=63?2400959708:2840853838}function a(t){return t<=15?1352829926:t<=31?1548603684:t<=47?1836072691:t<=63?2053994217:0}var s=t(423),f=t(413),c=s.rotl32,u=s.sum32,h=s.sum32_3,d=s.sum32_4,l=f.BlockHash;s.inherits(n,l),r.ripemd160=n,n.blockSize=512,n.outSize=160,n.hmacStrength=192,n.padLength=64,n.prototype._update=function(t,e){for(var r=this.h[0],n=this.h[1],s=this.h[2],f=this.h[3],l=this.h[4],g=r,m=n,w=s,_=f,S=l,E=0;E<80;E++){var k=u(c(d(r,i(E,n,s,f),t[p[E]+e],o(E)),v[E]),l);r=l,l=f,f=c(s,10),s=n,n=k,k=u(c(d(g,i(79-E,m,w,_),t[b[E]+e],a(E)),y[E]),S),g=S,S=_,_=c(w,10),w=m,m=k}k=h(this.h[1],s,_),this.h[1]=h(this.h[2],f,S),this.h[2]=h(this.h[3],l,g),this.h[3]=h(this.h[4],r,m),this.h[4]=h(this.h[0],n,w),this.h[0]=k},n.prototype._digest=function(t){return"hex"===t?s.toHex32(this.h,"little"):s.split32(this.h,"little")};var p=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13],b=[5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11],v=[11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6],y=[8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]},{413:413,423:423}],416:[function(t,e,r){"use strict";r.sha1=t(417),r.sha224=t(418),r.sha256=t(419),r.sha384=t(420),r.sha512=t(421)},{417:417,418:418,419:419,420:420,421:421}],417:[function(t,e,r){"use strict";function n(){if(!(this instanceof n))return new n;h.call(this),this.h=[1732584193,4023233417,2562383102,271733878,3285377520],this.W=new Array(80)}var i=t(423),o=t(413),a=t(422),s=i.rotl32,f=i.sum32,c=i.sum32_5,u=a.ft_1,h=o.BlockHash,d=[1518500249,1859775393,2400959708,3395469782];i.inherits(n,h),e.exports=n,n.blockSize=512,n.outSize=160,n.hmacStrength=80,n.padLength=64,n.prototype._update=function(t,e){for(var r=this.W,n=0;n<16;n++)r[n]=t[e+n];for(;n<r.length;n++)r[n]=s(r[n-3]^r[n-8]^r[n-14]^r[n-16],1);var i=this.h[0],o=this.h[1],a=this.h[2],h=this.h[3],l=this.h[4];for(n=0;n<r.length;n++){var p=~~(n/20),b=c(s(i,5),u(p,o,a,h),l,r[n],d[p]);l=h,h=a,a=s(o,30),o=i,i=b}this.h[0]=f(this.h[0],i),this.h[1]=f(this.h[1],o),this.h[2]=f(this.h[2],a),this.h[3]=f(this.h[3],h),this.h[4]=f(this.h[4],l)},n.prototype._digest=function(t){return"hex"===t?i.toHex32(this.h,"big"):i.split32(this.h,"big")}},{413:413,422:422,423:423}],418:[function(t,e,r){"use strict";function n(){if(!(this instanceof n))return new n;o.call(this),this.h=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428]}var i=t(423),o=t(419);i.inherits(n,o),e.exports=n,n.blockSize=512,n.outSize=224,n.hmacStrength=192,n.padLength=64,n.prototype._digest=function(t){return"hex"===t?i.toHex32(this.h.slice(0,7),"big"):i.split32(this.h.slice(0,7),"big")}},{419:419,423:423}],419:[function(t,e,r){"use strict";function n(){if(!(this instanceof n))return new n;y.call(this),this.h=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],this.k=g,this.W=new Array(64)}var i=t(423),o=t(413),a=t(422),s=t(432),f=i.sum32,c=i.sum32_4,u=i.sum32_5,h=a.ch32,d=a.maj32,l=a.s0_256,p=a.s1_256,b=a.g0_256,v=a.g1_256,y=o.BlockHash,g=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];i.inherits(n,y),e.exports=n,n.blockSize=512,n.outSize=256,n.hmacStrength=192,n.padLength=64,n.prototype._update=function(t,e){for(var r=this.W,n=0;n<16;n++)r[n]=t[e+n];for(;n<r.length;n++)r[n]=c(v(r[n-2]),r[n-7],b(r[n-15]),r[n-16]);var i=this.h[0],o=this.h[1],a=this.h[2],y=this.h[3],g=this.h[4],m=this.h[5],w=this.h[6],_=this.h[7];for(s(this.k.length===r.length),n=0;n<r.length;n++){var S=u(_,p(g),h(g,m,w),this.k[n],r[n]),E=f(l(i),d(i,o,a));_=w,w=m,m=g,g=f(y,S),y=a,a=o,o=i,i=f(S,E)}this.h[0]=f(this.h[0],i),this.h[1]=f(this.h[1],o),this.h[2]=f(this.h[2],a),this.h[3]=f(this.h[3],y),this.h[4]=f(this.h[4],g),this.h[5]=f(this.h[5],m),this.h[6]=f(this.h[6],w),this.h[7]=f(this.h[7],_)},n.prototype._digest=function(t){return"hex"===t?i.toHex32(this.h,"big"):i.split32(this.h,"big")}},{413:413,422:422,423:423,432:432}],420:[function(t,e,r){"use strict";function n(){if(!(this instanceof n))return new n;o.call(this),this.h=[3418070365,3238371032,1654270250,914150663,2438529370,812702999,355462360,4144912697,1731405415,4290775857,2394180231,1750603025,3675008525,1694076839,1203062813,3204075428]}var i=t(423),o=t(421);i.inherits(n,o),e.exports=n,n.blockSize=1024,n.outSize=384,n.hmacStrength=192,n.padLength=128,n.prototype._digest=function(t){return"hex"===t?i.toHex32(this.h.slice(0,12),"big"):i.split32(this.h.slice(0,12),"big")}},{421:421,423:423}],421:[function(t,e,r){"use strict";function n(){if(!(this instanceof n))return new n;B.call(this),this.h=[1779033703,4089235720,3144134277,2227873595,1013904242,4271175723,2773480762,1595750129,1359893119,2917565137,2600822924,725511199,528734635,4215389547,1541459225,327033209],this.k=T,this.W=new Array(160)}function i(t,e,r,n,i){var o=t&r^~t&i;return o<0&&(o+=4294967296),o}function o(t,e,r,n,i,o){var a=e&n^~e&o;return a<0&&(a+=4294967296),a}function a(t,e,r,n,i){var o=t&r^t&i^r&i;return o<0&&(o+=4294967296),o}function s(t,e,r,n,i,o){var a=e&n^e&o^n&o;return a<0&&(a+=4294967296),a}function f(t,e){var r=m(t,e,28),n=m(e,t,2),i=m(e,t,7),o=r^n^i;return o<0&&(o+=4294967296),o}function c(t,e){var r=w(t,e,28),n=w(e,t,2),i=w(e,t,7),o=r^n^i;return o<0&&(o+=4294967296),o}function u(t,e){var r=m(t,e,14),n=m(t,e,18),i=m(e,t,9),o=r^n^i;return o<0&&(o+=4294967296),o}function h(t,e){var r=w(t,e,14),n=w(t,e,18),i=w(e,t,9),o=r^n^i;return o<0&&(o+=4294967296),o}function d(t,e){var r=m(t,e,1),n=m(t,e,8),i=_(t,e,7),o=r^n^i;return o<0&&(o+=4294967296),o}function l(t,e){var r=w(t,e,1),n=w(t,e,8),i=S(t,e,7),o=r^n^i;return o<0&&(o+=4294967296),o}function p(t,e){var r=m(t,e,19),n=m(e,t,29),i=_(t,e,6),o=r^n^i;return o<0&&(o+=4294967296),o}function b(t,e){var r=w(t,e,19),n=w(e,t,29),i=S(t,e,6),o=r^n^i;return o<0&&(o+=4294967296),o}var v=t(423),y=t(413),g=t(432),m=v.rotr64_hi,w=v.rotr64_lo,_=v.shr64_hi,S=v.shr64_lo,E=v.sum64,k=v.sum64_hi,M=v.sum64_lo,A=v.sum64_4_hi,x=v.sum64_4_lo,I=v.sum64_5_hi,R=v.sum64_5_lo,B=y.BlockHash,T=[1116352408,3609767458,1899447441,602891725,3049323471,3964484399,3921009573,2173295548,961987163,4081628472,1508970993,3053834265,2453635748,2937671579,2870763221,3664609560,3624381080,2734883394,310598401,1164996542,607225278,1323610764,1426881987,3590304994,1925078388,4068182383,2162078206,991336113,2614888103,633803317,3248222580,3479774868,3835390401,2666613458,4022224774,944711139,264347078,2341262773,604807628,2007800933,770255983,1495990901,1249150122,1856431235,1555081692,3175218132,1996064986,2198950837,2554220882,3999719339,2821834349,766784016,2952996808,2566594879,3210313671,3203337956,3336571891,1034457026,3584528711,2466948901,113926993,3758326383,338241895,168717936,666307205,1188179964,773529912,1546045734,1294757372,1522805485,1396182291,2643833823,1695183700,2343527390,1986661051,1014477480,2177026350,1206759142,2456956037,344077627,2730485921,1290863460,2820302411,3158454273,3259730800,3505952657,3345764771,106217008,3516065817,3606008344,3600352804,1432725776,4094571909,1467031594,275423344,851169720,430227734,3100823752,506948616,1363258195,659060556,3750685593,883997877,3785050280,958139571,3318307427,1322822218,3812723403,1537002063,2003034995,1747873779,3602036899,1955562222,1575990012,2024104815,1125592928,2227730452,2716904306,2361852424,442776044,2428436474,593698344,2756734187,3733110249,3204031479,2999351573,3329325298,3815920427,3391569614,3928383900,3515267271,566280711,3940187606,3454069534,4118630271,4000239992,116418474,1914138554,174292421,2731055270,289380356,3203993006,460393269,320620315,685471733,587496836,852142971,1086792851,1017036298,365543100,1126000580,2618297676,1288033470,3409855158,1501505948,4234509866,1607167915,987167468,1816402316,1246189591];v.inherits(n,B),e.exports=n,n.blockSize=1024,n.outSize=512,n.hmacStrength=192,n.padLength=128,n.prototype._prepareBlock=function(t,e){for(var r=this.W,n=0;n<32;n++)r[n]=t[e+n];for(;n<r.length;n+=2){var i=p(r[n-4],r[n-3]),o=b(r[n-4],r[n-3]),a=r[n-14],s=r[n-13],f=d(r[n-30],r[n-29]),c=l(r[n-30],r[n-29]),u=r[n-32],h=r[n-31];r[n]=A(i,o,a,s,f,c,u,h),r[n+1]=x(i,o,a,s,f,c,u,h)}},n.prototype._update=function(t,e){this._prepareBlock(t,e);var r=this.W,n=this.h[0],d=this.h[1],l=this.h[2],p=this.h[3],b=this.h[4],v=this.h[5],y=this.h[6],m=this.h[7],w=this.h[8],_=this.h[9],S=this.h[10],A=this.h[11],x=this.h[12],B=this.h[13],T=this.h[14],P=this.h[15];g(this.k.length===r.length);for(var C=0;C<r.length;C+=2){var O=T,j=P,N=u(w,_),L=h(w,_),D=i(w,_,S,A,x),F=o(w,_,S,A,x,B),U=this.k[C],q=this.k[C+1],z=r[C],V=r[C+1],G=I(O,j,N,L,D,F,U,q,z,V),K=R(O,j,N,L,D,F,U,q,z,V);O=f(n,d),j=c(n,d),N=a(n,d,l,p,b),L=s(n,d,l,p,b,v);var W=k(O,j,N,L),H=M(O,j,N,L);T=x,P=B,x=S,B=A,S=w,A=_,w=k(y,m,G,K),_=M(m,m,G,K),y=b,m=v,b=l,v=p,l=n,p=d,n=k(G,K,W,H),d=M(G,K,W,H)}E(this.h,0,n,d),E(this.h,2,l,p),E(this.h,4,b,v),E(this.h,6,y,m),E(this.h,8,w,_),E(this.h,10,S,A),E(this.h,12,x,B),E(this.h,14,T,P)},n.prototype._digest=function(t){return"hex"===t?v.toHex32(this.h,"big"):v.split32(this.h,"big")}},{413:413,423:423,432:432}],422:[function(t,e,r){"use strict";function n(t,e,r,n){return 0===t?i(e,r,n):1===t||3===t?a(e,r,n):2===t?o(e,r,n):void 0}function i(t,e,r){return t&e^~t&r}function o(t,e,r){return t&e^t&r^e&r}function a(t,e,r){return t^e^r}function s(t){return d(t,2)^d(t,13)^d(t,22)}function f(t){return d(t,6)^d(t,11)^d(t,25)}function c(t){return d(t,7)^d(t,18)^t>>>3}function u(t){return d(t,17)^d(t,19)^t>>>10}var h=t(423),d=h.rotr32;r.ft_1=n,r.ch32=i,r.maj32=o,r.p32=a,r.s0_256=s,r.s1_256=f,r.g0_256=c,r.g1_256=u},{423:423}],423:[function(t,e,r){"use strict";function n(t,e){if(Array.isArray(t))return t.slice();if(!t)return[];var r=[];if("string"==typeof t)if(e){if("hex"===e)for(t=t.replace(/[^a-z0-9]+/gi,""),t.length%2!=0&&(t="0"+t),n=0;n<t.length;n+=2)r.push(parseInt(t[n]+t[n+1],16))}else for(var n=0;n<t.length;n++){var i=t.charCodeAt(n),o=i>>8,a=255&i;o?r.push(o,a):r.push(a)}else for(n=0;n<t.length;n++)r[n]=0|t[n];return r}function i(t){for(var e="",r=0;r<t.length;r++)e+=s(t[r].toString(16));return e}function o(t){return(t>>>24|t>>>8&65280|t<<8&16711680|(255&t)<<24)>>>0}function a(t,e){for(var r="",n=0;n<t.length;n++){var i=t[n];"little"===e&&(i=o(i)),r+=f(i.toString(16))}return r}function s(t){return 1===t.length?"0"+t:t}function f(t){return 7===t.length?"0"+t:6===t.length?"00"+t:5===t.length?"000"+t:4===t.length?"0000"+t:3===t.length?"00000"+t:2===t.length?"000000"+t:1===t.length?"0000000"+t:t}function c(t,e,r,n){var i=r-e;I(i%4==0);for(var o=new Array(i/4),a=0,s=e;a<o.length;a++,s+=4){var f;f="big"===n?t[s]<<24|t[s+1]<<16|t[s+2]<<8|t[s+3]:t[s+3]<<24|t[s+2]<<16|t[s+1]<<8|t[s],o[a]=f>>>0}return o}function u(t,e){for(var r=new Array(4*t.length),n=0,i=0;n<t.length;n++,i+=4){var o=t[n];"big"===e?(r[i]=o>>>24,r[i+1]=o>>>16&255,r[i+2]=o>>>8&255,r[i+3]=255&o):(r[i+3]=o>>>24,r[i+2]=o>>>16&255,r[i+1]=o>>>8&255,r[i]=255&o)}return r}function h(t,e){return t>>>e|t<<32-e}function d(t,e){return t<<e|t>>>32-e}function l(t,e){return t+e>>>0}function p(t,e,r){return t+e+r>>>0}function b(t,e,r,n){return t+e+r+n>>>0}function v(t,e,r,n,i){return t+e+r+n+i>>>0}function y(t,e,r,n){var i=t[e],o=t[e+1],a=n+o>>>0,s=(a<n?1:0)+r+i;t[e]=s>>>0,t[e+1]=a}function g(t,e,r,n){return(e+n>>>0<e?1:0)+t+r>>>0}function m(t,e,r,n){return e+n>>>0}function w(t,e,r,n,i,o,a,s){var f=0,c=e;return c=c+n>>>0,f+=c<e?1:0,c=c+o>>>0,f+=c<o?1:0,c=c+s>>>0,f+=c<s?1:0,t+r+i+a+f>>>0}function _(t,e,r,n,i,o,a,s){return e+n+o+s>>>0}function S(t,e,r,n,i,o,a,s,f,c){var u=0,h=e;return h=h+n>>>0,u+=h<e?1:0,h=h+o>>>0,u+=h<o?1:0,h=h+s>>>0,u+=h<s?1:0,h=h+c>>>0,u+=h<c?1:0,t+r+i+a+f+u>>>0}function E(t,e,r,n,i,o,a,s,f,c){return e+n+o+s+c>>>0}function k(t,e,r){return(e<<32-r|t>>>r)>>>0}function M(t,e,r){return(t<<32-r|e>>>r)>>>0}function A(t,e,r){return t>>>r}function x(t,e,r){return(t<<32-r|e>>>r)>>>0}var I=t(432),R=t(427);r.inherits=R,r.toArray=n,r.toHex=i,r.htonl=o,r.toHex32=a,r.zero2=s,r.zero8=f,r.join32=c,r.split32=u,r.rotr32=h,r.rotl32=d,r.sum32=l,r.sum32_3=p,r.sum32_4=b,r.sum32_5=v,r.sum64=y,r.sum64_hi=g,r.sum64_lo=m,r.sum64_4_hi=w,r.sum64_4_lo=_,r.sum64_5_hi=S,r.sum64_5_lo=E,r.rotr64_hi=k,r.rotr64_lo=M,r.shr64_hi=A,r.shr64_lo=x},{427:427,432:432}],424:[function(t,e,r){"use strict";function n(t){if(!(this instanceof n))return new n(t);this.hash=t.hash,this.predResist=!!t.predResist,this.outLen=this.hash.outSize,this.minEntropy=t.minEntropy||this.hash.hmacStrength,this._reseed=null,this.reseedInterval=null,this.K=null,this.V=null;var e=o.toArray(t.entropy,t.entropyEnc||"hex"),r=o.toArray(t.nonce,t.nonceEnc||"hex"),i=o.toArray(t.pers,t.persEnc||"hex");a(e.length>=this.minEntropy/8,"Not enough entropy. Minimum is: "+this.minEntropy+" bits"),this._init(e,r,i)}var i=t(412),o=t(433),a=t(432);e.exports=n,n.prototype._init=function(t,e,r){var n=t.concat(e).concat(r);this.K=new Array(this.outLen/8),this.V=new Array(this.outLen/8);for(var i=0;i<this.V.length;i++)this.K[i]=0,this.V[i]=1;this._update(n),this._reseed=1,this.reseedInterval=281474976710656},n.prototype._hmac=function(){return new i.hmac(this.hash,this.K)},n.prototype._update=function(t){var e=this._hmac().update(this.V).update([0]);t&&(e=e.update(t)),this.K=e.digest(),this.V=this._hmac().update(this.V).digest(),t&&(this.K=this._hmac().update(this.V).update([1]).update(t).digest(),this.V=this._hmac().update(this.V).digest())},n.prototype.reseed=function(t,e,r,n){"string"!=typeof e&&(n=r,r=e,e=null),t=o.toArray(t,e),r=o.toArray(r,n),a(t.length>=this.minEntropy/8,"Not enough entropy. Minimum is: "+this.minEntropy+" bits"),this._update(t.concat(r||[])),this._reseed=1},n.prototype.generate=function(t,e,r,n){if(this._reseed>this.reseedInterval)throw new Error("Reseed is required");"string"!=typeof e&&(n=r,r=e,e=null),r&&(r=o.toArray(r,n||"hex"),this._update(r));for(var i=[];i.length<t;)this.V=this._hmac().update(this.V).digest(),i=i.concat(this.V);var a=i.slice(0,t);return this._update(r),this._reseed++,o.encode(a,e)}},{412:412,432:432,433:433}],425:[function(t,e,r){r.read=function(t,e,r,n,i){var o,a,s=8*i-n-1,f=(1<<s)-1,c=f>>1,u=-7,h=r?i-1:0,d=r?-1:1,l=t[e+h];for(h+=d,o=l&(1<<-u)-1,l>>=-u,u+=s;u>0;o=256*o+t[e+h],h+=d,u-=8);for(a=o&(1<<-u)-1,o>>=-u,u+=n;u>0;a=256*a+t[e+h],h+=d,u-=8);if(0===o)o=1-c;else{if(o===f)return a?NaN:1/0*(l?-1:1);a+=Math.pow(2,n),o-=c}return(l?-1:1)*a*Math.pow(2,o-n)},r.write=function(t,e,r,n,i,o){var a,s,f,c=8*o-i-1,u=(1<<c)-1,h=u>>1,d=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,l=n?0:o-1,p=n?1:-1,b=e<0||0===e&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(s=isNaN(e)?1:0,a=u):(a=Math.floor(Math.log(e)/Math.LN2),e*(f=Math.pow(2,-a))<1&&(a--,f*=2),e+=a+h>=1?d/f:d*Math.pow(2,1-h),e*f>=2&&(a++,f/=2),a+h>=u?(s=0,a=u):a+h>=1?(s=(e*f-1)*Math.pow(2,i),a+=h):(s=e*Math.pow(2,h-1)*Math.pow(2,i),a=0));i>=8;t[r+l]=255&s,l+=p,s/=256,i-=8);for(a=a<<i|s,c+=i;c>0;t[r+l]=255&a,l+=p,a/=256,c-=8);t[r+l-p]|=128*b}},{}],426:[function(t,e,r){var n=[].indexOf;e.exports=function(t,e){if(n)return t.indexOf(e);for(var r=0;r<t.length;++r)if(t[r]===e)return r;return-1}},{}],427:[function(t,e,r){"function"==typeof Object.create?e.exports=function(t,e){t.super_=e,t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}})}:e.exports=function(t,e){t.super_=e;var r=function(){};r.prototype=e.prototype,t.prototype=new r,t.prototype.constructor=t}},{}],428:[function(t,e,r){function n(t){return!!t.constructor&&"function"==typeof t.constructor.isBuffer&&t.constructor.isBuffer(t)}function i(t){return"function"==typeof t.readFloatLE&&"function"==typeof t.slice&&n(t.slice(0,0))}e.exports=function(t){return null!=t&&(n(t)||i(t)||!!t._isBuffer)}},{}],429:[function(t,e,r){var n={}.toString;e.exports=Array.isArray||function(t){return"[object Array]"==n.call(t)}},{}],430:[function(t,e,r){(function(r){"use strict";function n(){u.call(this,64),this._a=1732584193,this._b=4023233417,this._c=2562383102,this._d=271733878}function i(t,e){return t<<e|t>>>32-e}function o(t,e,r,n,o,a,s){return i(t+(e&r|~e&n)+o+a|0,s)+e|0}function a(t,e,r,n,o,a,s){return i(t+(e&n|r&~n)+o+a|0,s)+e|0}function s(t,e,r,n,o,a,s){return i(t+(e^r^n)+o+a|0,s)+e|0}function f(t,e,r,n,o,a,s){return i(t+(r^(e|~n))+o+a|0,s)+e|0}var c=t(427),u=t(411),h=new Array(16);c(n,u),n.prototype._update=function(){for(var t=h,e=0;e<16;++e)t[e]=this._block.readInt32LE(4*e);var r=this._a,n=this._b,i=this._c,c=this._d;r=o(r,n,i,c,t[0],3614090360,7),c=o(c,r,n,i,t[1],3905402710,12),i=o(i,c,r,n,t[2],606105819,17),n=o(n,i,c,r,t[3],3250441966,22),r=o(r,n,i,c,t[4],4118548399,7),c=o(c,r,n,i,t[5],1200080426,12),i=o(i,c,r,n,t[6],2821735955,17),n=o(n,i,c,r,t[7],4249261313,22),r=o(r,n,i,c,t[8],1770035416,7),c=o(c,r,n,i,t[9],2336552879,12),i=o(i,c,r,n,t[10],4294925233,17),n=o(n,i,c,r,t[11],2304563134,22),r=o(r,n,i,c,t[12],1804603682,7),c=o(c,r,n,i,t[13],4254626195,12),i=o(i,c,r,n,t[14],2792965006,17),n=o(n,i,c,r,t[15],1236535329,22),r=a(r,n,i,c,t[1],4129170786,5),c=a(c,r,n,i,t[6],3225465664,9),i=a(i,c,r,n,t[11],643717713,14),n=a(n,i,c,r,t[0],3921069994,20),r=a(r,n,i,c,t[5],3593408605,5),c=a(c,r,n,i,t[10],38016083,9),i=a(i,c,r,n,t[15],3634488961,14),n=a(n,i,c,r,t[4],3889429448,20),r=a(r,n,i,c,t[9],568446438,5),c=a(c,r,n,i,t[14],3275163606,9),i=a(i,c,r,n,t[3],4107603335,14),n=a(n,i,c,r,t[8],1163531501,20),r=a(r,n,i,c,t[13],2850285829,5),c=a(c,r,n,i,t[2],4243563512,9),i=a(i,c,r,n,t[7],1735328473,14),n=a(n,i,c,r,t[12],2368359562,20),r=s(r,n,i,c,t[5],4294588738,4),c=s(c,r,n,i,t[8],2272392833,11),i=s(i,c,r,n,t[11],1839030562,16),n=s(n,i,c,r,t[14],4259657740,23),r=s(r,n,i,c,t[1],2763975236,4),c=s(c,r,n,i,t[4],1272893353,11),i=s(i,c,r,n,t[7],4139469664,16),n=s(n,i,c,r,t[10],3200236656,23),r=s(r,n,i,c,t[13],681279174,4),c=s(c,r,n,i,t[0],3936430074,11),i=s(i,c,r,n,t[3],3572445317,16),n=s(n,i,c,r,t[6],76029189,23),r=s(r,n,i,c,t[9],3654602809,4),c=s(c,r,n,i,t[12],3873151461,11),i=s(i,c,r,n,t[15],530742520,16),n=s(n,i,c,r,t[2],3299628645,23),r=f(r,n,i,c,t[0],4096336452,6),c=f(c,r,n,i,t[7],1126891415,10),i=f(i,c,r,n,t[14],2878612391,15),n=f(n,i,c,r,t[5],4237533241,21),r=f(r,n,i,c,t[12],1700485571,6),c=f(c,r,n,i,t[3],2399980690,10),i=f(i,c,r,n,t[10],4293915773,15),n=f(n,i,c,r,t[1],2240044497,21),r=f(r,n,i,c,t[8],1873313359,6),c=f(c,r,n,i,t[15],4264355552,10),i=f(i,c,r,n,t[6],2734768916,15),n=f(n,i,c,r,t[13],1309151649,21),r=f(r,n,i,c,t[4],4149444226,6),c=f(c,r,n,i,t[11],3174756917,10),i=f(i,c,r,n,t[2],718787259,15),n=f(n,i,c,r,t[9],3951481745,21),this._a=this._a+r|0,this._b=this._b+n|0,this._c=this._c+i|0,this._d=this._d+c|0},n.prototype._digest=function(){this._block[this._blockOffset++]=128,this._blockOffset>56&&(this._block.fill(0,this._blockOffset,64),this._update(),this._blockOffset=0),this._block.fill(0,this._blockOffset,56),this._block.writeUInt32LE(this._length[0],56),this._block.writeUInt32LE(this._length[1],60),this._update();var t=new r(16);return t.writeInt32LE(this._a,0),t.writeInt32LE(this._b,4),t.writeInt32LE(this._c,8),t.writeInt32LE(this._d,12),t},e.exports=n}).call(this,t(50).Buffer)},{411:411,427:427,50:50}],431:[function(t,e,r){function n(t){this.rand=t||new o.Rand}var i=t(18),o=t(19);e.exports=n,n.create=function(t){return new n(t)},n.prototype._randbelow=function(t){var e=t.bitLength(),r=Math.ceil(e/8);do{var n=new i(this.rand.generate(r))}while(n.cmp(t)>=0);return n},n.prototype._randrange=function(t,e){var r=e.sub(t);return t.add(this._randbelow(r))},n.prototype.test=function(t,e,r){var n=t.bitLength(),o=i.mont(t),a=new i(1).toRed(o);e||(e=Math.max(1,n/48|0));for(var s=t.subn(1),f=0;!s.testn(f);f++);for(var c=t.shrn(f),u=s.toRed(o);e>0;e--){var h=this._randrange(new i(2),s);r&&r(h);var d=h.toRed(o).redPow(c);if(0!==d.cmp(a)&&0!==d.cmp(u)){for(var l=1;l<f;l++){if(d=d.redSqr(),0===d.cmp(a))return!1;if(0===d.cmp(u))break}if(l===f)return!1}}return!0},n.prototype.getDivisor=function(t,e){var r=t.bitLength(),n=i.mont(t),o=new i(1).toRed(n);e||(e=Math.max(1,r/48|0));for(var a=t.subn(1),s=0;!a.testn(s);s++);for(var f=t.shrn(s),c=a.toRed(n);e>0;e--){var u=this._randrange(new i(2),a),h=t.gcd(u);if(0!==h.cmpn(1))return h;var d=u.toRed(n).redPow(f);if(0!==d.cmp(o)&&0!==d.cmp(c)){for(var l=1;l<s;l++){if(d=d.redSqr(),0===d.cmp(o))return d.fromRed().subn(1).gcd(t);if(0===d.cmp(c))break}if(l===s)return d=d.redSqr(),d.fromRed().subn(1).gcd(t)}}return!1}},{18:18,19:19}],432:[function(t,e,r){function n(t,e){if(!t)throw new Error(e||"Assertion failed")}e.exports=n,n.equal=function(t,e,r){if(t!=e)throw new Error(r||"Assertion failed: "+t+" != "+e)}},{}],433:[function(t,e,r){"use strict";function n(t,e){if(Array.isArray(t))return t.slice();if(!t)return[];var r=[];if("string"!=typeof t){for(var n=0;n<t.length;n++)r[n]=0|t[n];return r}if("hex"===e){t=t.replace(/[^a-z0-9]+/gi,""),t.length%2!=0&&(t="0"+t);for(var n=0;n<t.length;n+=2)r.push(parseInt(t[n]+t[n+1],16))}else for(var n=0;n<t.length;n++){var i=t.charCodeAt(n),o=i>>8,a=255&i;o?r.push(o,a):r.push(a)}return r}function i(t){return 1===t.length?"0"+t:t}function o(t){for(var e="",r=0;r<t.length;r++)e+=i(t[r].toString(16));return e}var a=r;a.toArray=n,a.zero2=i,a.toHex=o,a.encode=function(t,e){return"hex"===e?o(t):t}},{}],434:[function(t,e,r){(function(r){!function(n){"use strict";function i(t,e,r){var n=e&&r||0,i=0;for(e=e||[],t.toLowerCase().replace(/[0-9a-f]{2}/g,function(t){i<16&&(e[n+i++]=b[t])});i<16;)e[n+i++]=0;return e}function o(t,e){var r=e||0,n=p;return n[t[r++]]+n[t[r++]]+n[t[r++]]+n[t[r++]]+"-"+n[t[r++]]+n[t[r++]]+"-"+n[t[r++]]+n[t[r++]]+"-"+n[t[r++]]+n[t[r++]]+"-"+n[t[r++]]+n[t[r++]]+n[t[r++]]+n[t[r++]]+n[t[r++]]+n[t[r++]]}function a(t,e,r){var n=e&&r||0,i=e||[];t=t||{};var a=null!=t.clockseq?t.clockseq:m,s=null!=t.msecs?t.msecs:(new Date).getTime(),f=null!=t.nsecs?t.nsecs:_+1,c=s-w+(f-_)/1e4;if(c<0&&null==t.clockseq&&(a=a+1&16383),(c<0||s>w)&&null==t.nsecs&&(f=0),f>=1e4)throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");w=s,_=f,m=a,s+=122192928e5;var u=(1e4*(268435455&s)+f)%4294967296;i[n++]=u>>>24&255,i[n++]=u>>>16&255,i[n++]=u>>>8&255,i[n++]=255&u;var h=s/4294967296*1e4&268435455;i[n++]=h>>>8&255,i[n++]=255&h,i[n++]=h>>>24&15|16,i[n++]=h>>>16&255,i[n++]=a>>>8|128,i[n++]=255&a;for(var d=t.node||g,l=0;l<6;l++)i[n+l]=d[l];return e||o(i)}function s(t,e,r){var n=e&&r||0;"string"==typeof t&&(e="binary"===t?new l(16):null,t=null),t=t||{};var i=t.random||(t.rng||f)();if(i[6]=15&i[6]|64,i[8]=63&i[8]|128,e)for(var a=0;a<16;a++)e[n+a]=i[a];return e||o(i)}var f,c,u,h,d;n?function(){var t=n.crypto||n.msCrypto;if(!f&&t&&t.getRandomValues)try{var e=new Uint8Array(16);h=f=function(){return t.getRandomValues(e),e},f()}catch(t){}if(!f){var r=new Array(16);c=f=function(){for(var t,e=0;e<16;e++)0==(3&e)&&(t=4294967296*Math.random()),r[e]=t>>>((3&e)<<3)&255;return r},"undefined"!=typeof console&&console.warn}}():function(){if("function"==typeof t)try{var e=t(382).randomBytes;u=f=e&&function(){return e(16)},f()}catch(t){}}();for(var l="function"==typeof r?r:Array,p=[],b={},v=0;v<256;v++)p[v]=(v+256).toString(16).substr(1),b[p[v]]=v;var y=f(),g=[1|y[0],y[1],y[2],y[3],y[4],y[5]],m=16383&(y[6]<<8|y[7]),w=0,_=0,S=s;S.v1=a,S.v4=s,S.parse=i,S.unparse=o,S.BufferClass=l,S._rng=f,S._mathRNG=c,S._nodeRNG=u,S._whatwgRNG=h,void 0!==e&&e.exports?e.exports=S:"function"==typeof define&&define.amd?define(function(){return S}):(d=n.uuid,S.noConflict=function(){return n.uuid=d,S},n.uuid=S)}("undefined"!=typeof window?window:null)}).call(this,t(50).Buffer)},{382:382,50:50}],435:[function(t,e,r){e.exports={"2.16.840.1.101.3.4.1.1":"aes-128-ecb","2.16.840.1.101.3.4.1.2":"aes-128-cbc","2.16.840.1.101.3.4.1.3":"aes-128-ofb","2.16.840.1.101.3.4.1.4":"aes-128-cfb","2.16.840.1.101.3.4.1.21":"aes-192-ecb","2.16.840.1.101.3.4.1.22":"aes-192-cbc","2.16.840.1.101.3.4.1.23":"aes-192-ofb","2.16.840.1.101.3.4.1.24":"aes-192-cfb","2.16.840.1.101.3.4.1.41":"aes-256-ecb",
"2.16.840.1.101.3.4.1.42":"aes-256-cbc","2.16.840.1.101.3.4.1.43":"aes-256-ofb","2.16.840.1.101.3.4.1.44":"aes-256-cfb"}},{}],436:[function(t,e,r){"use strict";var n=t(2);r.certificate=t(437);var i=n.define("RSAPrivateKey",function(){this.seq().obj(this.key("version").int(),this.key("modulus").int(),this.key("publicExponent").int(),this.key("privateExponent").int(),this.key("prime1").int(),this.key("prime2").int(),this.key("exponent1").int(),this.key("exponent2").int(),this.key("coefficient").int())});r.RSAPrivateKey=i;var o=n.define("RSAPublicKey",function(){this.seq().obj(this.key("modulus").int(),this.key("publicExponent").int())});r.RSAPublicKey=o;var a=n.define("SubjectPublicKeyInfo",function(){this.seq().obj(this.key("algorithm").use(s),this.key("subjectPublicKey").bitstr())});r.PublicKey=a;var s=n.define("AlgorithmIdentifier",function(){this.seq().obj(this.key("algorithm").objid(),this.key("none").null_().optional(),this.key("curve").objid().optional(),this.key("params").seq().obj(this.key("p").int(),this.key("q").int(),this.key("g").int()).optional())}),f=n.define("PrivateKeyInfo",function(){this.seq().obj(this.key("version").int(),this.key("algorithm").use(s),this.key("subjectPrivateKey").octstr())});r.PrivateKey=f;var c=n.define("EncryptedPrivateKeyInfo",function(){this.seq().obj(this.key("algorithm").seq().obj(this.key("id").objid(),this.key("decrypt").seq().obj(this.key("kde").seq().obj(this.key("id").objid(),this.key("kdeparams").seq().obj(this.key("salt").octstr(),this.key("iters").int())),this.key("cipher").seq().obj(this.key("algo").objid(),this.key("iv").octstr()))),this.key("subjectPrivateKey").octstr())});r.EncryptedPrivateKey=c;var u=n.define("DSAPrivateKey",function(){this.seq().obj(this.key("version").int(),this.key("p").int(),this.key("q").int(),this.key("g").int(),this.key("pub_key").int(),this.key("priv_key").int())});r.DSAPrivateKey=u,r.DSAparam=n.define("DSAparam",function(){this.int()});var h=n.define("ECPrivateKey",function(){this.seq().obj(this.key("version").int(),this.key("privateKey").octstr(),this.key("parameters").optional().explicit(0).use(d),this.key("publicKey").optional().explicit(1).bitstr())});r.ECPrivateKey=h;var d=n.define("ECParameters",function(){this.choice({namedCurve:this.objid()})});r.signature=n.define("signature",function(){this.seq().obj(this.key("r").int(),this.key("s").int())})},{2:2,437:437}],437:[function(t,e,r){"use strict";var n=t(2),i=n.define("Time",function(){this.choice({utcTime:this.utctime(),generalTime:this.gentime()})}),o=n.define("AttributeTypeValue",function(){this.seq().obj(this.key("type").objid(),this.key("value").any())}),a=n.define("AlgorithmIdentifier",function(){this.seq().obj(this.key("algorithm").objid(),this.key("parameters").optional())}),s=n.define("SubjectPublicKeyInfo",function(){this.seq().obj(this.key("algorithm").use(a),this.key("subjectPublicKey").bitstr())}),f=n.define("RelativeDistinguishedName",function(){this.setof(o)}),c=n.define("RDNSequence",function(){this.seqof(f)}),u=n.define("Name",function(){this.choice({rdnSequence:this.use(c)})}),h=n.define("Validity",function(){this.seq().obj(this.key("notBefore").use(i),this.key("notAfter").use(i))}),d=n.define("Extension",function(){this.seq().obj(this.key("extnID").objid(),this.key("critical").bool().def(!1),this.key("extnValue").octstr())}),l=n.define("TBSCertificate",function(){this.seq().obj(this.key("version").explicit(0).int(),this.key("serialNumber").int(),this.key("signature").use(a),this.key("issuer").use(u),this.key("validity").use(h),this.key("subject").use(u),this.key("subjectPublicKeyInfo").use(s),this.key("issuerUniqueID").implicit(1).bitstr().optional(),this.key("subjectUniqueID").implicit(2).bitstr().optional(),this.key("extensions").explicit(3).seqof(d).optional())}),p=n.define("X509Certificate",function(){this.seq().obj(this.key("tbsCertificate").use(l),this.key("signatureAlgorithm").use(a),this.key("signatureValue").bitstr())});e.exports=p},{2:2}],438:[function(t,e,r){(function(r){var n=/Proc-Type: 4,ENCRYPTED[\n\r]+DEK-Info: AES-((?:128)|(?:192)|(?:256))-CBC,([0-9A-H]+)[\n\r]+([0-9A-z\n\r\+\/\=]+)[\n\r]+/m,i=/^-----BEGIN ((?:.* KEY)|CERTIFICATE)-----/m,o=/^-----BEGIN ((?:.* KEY)|CERTIFICATE)-----([0-9A-z\n\r\+\/\=]+)-----END \1-----$/m,a=t(410),s=t(23);e.exports=function(t,e){var f,c=t.toString(),u=c.match(n);if(u){var h="aes"+u[1],d=new r(u[2],"hex"),l=new r(u[3].replace(/[\r\n]/g,""),"base64"),p=a(e,d.slice(0,8),parseInt(u[1],10)).key,b=[],v=s.createDecipheriv(h,p,d);b.push(v.update(l)),b.push(v.final()),f=r.concat(b)}else{var y=c.match(o);f=new r(y[2].replace(/[\r\n]/g,""),"base64")}return{tag:c.match(i)[1],data:f}}}).call(this,t(50).Buffer)},{23:23,410:410,50:50}],439:[function(t,e,r){(function(r){function n(t){var e;"object"!=typeof t||r.isBuffer(t)||(e=t.passphrase,t=t.key),"string"==typeof t&&(t=new r(t));var n,a,f=s(t,e),c=f.tag,u=f.data;switch(c){case"CERTIFICATE":a=o.certificate.decode(u,"der").tbsCertificate.subjectPublicKeyInfo;case"PUBLIC KEY":switch(a||(a=o.PublicKey.decode(u,"der")),n=a.algorithm.algorithm.join(".")){case"1.2.840.113549.1.1.1":return o.RSAPublicKey.decode(a.subjectPublicKey.data,"der");case"1.2.840.10045.2.1":return a.subjectPrivateKey=a.subjectPublicKey,{type:"ec",data:a};case"1.2.840.10040.4.1":return a.algorithm.params.pub_key=o.DSAparam.decode(a.subjectPublicKey.data,"der"),{type:"dsa",data:a.algorithm.params};default:throw new Error("unknown key id "+n)}throw new Error("unknown key type "+c);case"ENCRYPTED PRIVATE KEY":u=o.EncryptedPrivateKey.decode(u,"der"),u=i(u,e);case"PRIVATE KEY":switch(a=o.PrivateKey.decode(u,"der"),n=a.algorithm.algorithm.join(".")){case"1.2.840.113549.1.1.1":return o.RSAPrivateKey.decode(a.subjectPrivateKey,"der");case"1.2.840.10045.2.1":return{curve:a.algorithm.curve,privateKey:o.ECPrivateKey.decode(a.subjectPrivateKey,"der").privateKey};case"1.2.840.10040.4.1":return a.algorithm.params.priv_key=o.DSAparam.decode(a.subjectPrivateKey,"der"),{type:"dsa",params:a.algorithm.params};default:throw new Error("unknown key id "+n)}throw new Error("unknown key type "+c);case"RSA PUBLIC KEY":return o.RSAPublicKey.decode(u,"der");case"RSA PRIVATE KEY":return o.RSAPrivateKey.decode(u,"der");case"DSA PRIVATE KEY":return{type:"dsa",params:o.DSAPrivateKey.decode(u,"der")};case"EC PRIVATE KEY":return u=o.ECPrivateKey.decode(u,"der"),{curve:u.parameters.value,privateKey:u.privateKey};default:throw new Error("unknown key type "+c)}}function i(t,e){var n=t.algorithm.decrypt.kde.kdeparams.salt,i=parseInt(t.algorithm.decrypt.kde.kdeparams.iters.toString(),10),o=a[t.algorithm.decrypt.cipher.algo.join(".")],s=t.algorithm.decrypt.cipher.iv,u=t.subjectPrivateKey,h=parseInt(o.split("-")[1],10)/8,d=c.pbkdf2Sync(e,n,i,h),l=f.createDecipheriv(o,d,s),p=[];return p.push(l.update(u)),p.push(l.final()),r.concat(p)}var o=t(436),a=t(435),s=t(438),f=t(23),c=t(440);e.exports=n,n.signature=o.signature}).call(this,t(50).Buffer)},{23:23,435:435,436:436,438:438,440:440,50:50}],440:[function(t,e,r){r.pbkdf2=t(441),r.pbkdf2Sync=t(444)},{441:441,444:444}],441:[function(t,e,r){(function(r,n){function i(t){if(n.process&&!n.process.browser)return Promise.resolve(!1);if(!d||!d.importKey||!d.deriveBits)return Promise.resolve(!1);if(void 0!==p[t])return p[t];s=s||h.alloc(8);var e=o(s,s,10,128,t).then(function(){return!0}).catch(function(){return!1});return p[t]=e,e}function o(t,e,r,n,i){return d.importKey("raw",t,{name:"PBKDF2"},!1,["deriveBits"]).then(function(t){return d.deriveBits({name:"PBKDF2",salt:e,iterations:r,hash:{name:i}},t,n<<3)}).then(function(t){return h.from(t)})}function a(t,e){t.then(function(t){r.nextTick(function(){e(null,t)})},function(t){r.nextTick(function(){e(t)})})}var s,f=t(443),c=t(442),u=t(444),h=t(471).Buffer,d=n.crypto&&n.crypto.subtle,l={sha:"SHA-1","sha-1":"SHA-1",sha1:"SHA-1",sha256:"SHA-256","sha-256":"SHA-256",sha384:"SHA-384","sha-384":"SHA-384","sha-512":"SHA-512",sha512:"SHA-512"},p=[];e.exports=function(t,e,s,d,p,b){"function"==typeof p&&(b=p,p=void 0),p=p||"sha1";var v=l[p.toLowerCase()];if(!v||"function"!=typeof n.Promise)return r.nextTick(function(){var r;try{r=u(t,e,s,d,p)}catch(t){return b(t)}b(null,r)});if(f(t,e,s,d),"function"!=typeof b)throw new Error("No callback provided to pbkdf2");h.isBuffer(t)||(t=h.from(t,c)),h.isBuffer(e)||(e=h.from(e,c)),a(i(v).then(function(r){return r?o(t,e,s,d,v):u(t,e,s,d,p)}),b)}}).call(this,t(446),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{442:442,443:443,444:444,446:446,471:471}],442:[function(t,e,r){(function(t){var r;if(t.browser)r="utf-8";else{r=parseInt(t.version.split(".")[0].slice(1),10)>=6?"utf-8":"binary"}e.exports=r}).call(this,t(446))},{446:446}],443:[function(t,e,r){(function(t){function r(e,r){if("string"!=typeof e&&!t.isBuffer(e))throw new TypeError(r+" must be a buffer or string")}var n=Math.pow(2,30)-1;e.exports=function(t,e,i,o){if(r(t,"Password"),r(e,"Salt"),"number"!=typeof i)throw new TypeError("Iterations not a number");if(i<0)throw new TypeError("Bad iterations");if("number"!=typeof o)throw new TypeError("Key length not a number");if(o<0||o>n||o!==o)throw new TypeError("Bad key length")}}).call(this,{isBuffer:t(428)})},{428:428}],444:[function(t,e,r){function n(t,e,r){var n=i(t),o="sha512"===t||"sha384"===t?128:64;e.length>o?e=n(e):e.length<o&&(e=h.concat([e,d],o));for(var a=h.allocUnsafe(o+l[t]),s=h.allocUnsafe(o+l[t]),f=0;f<o;f++)a[f]=54^e[f],s[f]=92^e[f];var c=h.allocUnsafe(o+r+4);a.copy(c,0,0,o),this.ipad1=c,this.ipad2=a,this.opad=s,this.alg=t,this.blocksize=o,this.hash=n,this.size=l[t]}function i(t){function e(e){return f(t).update(e).digest()}return"rmd160"===t||"ripemd160"===t?s:"md5"===t?a:e}function o(t,e,r,i,o){c(t,e,r,i),h.isBuffer(t)||(t=h.from(t,u)),h.isBuffer(e)||(e=h.from(e,u)),o=o||"sha1";var a=new n(o,t,e.length),s=h.allocUnsafe(i),f=h.allocUnsafe(e.length+4);e.copy(f,0,0,e.length);for(var d=0,p=l[o],b=Math.ceil(i/p),v=1;v<=b;v++){f.writeUInt32BE(v,e.length);for(var y=a.run(f,a.ipad1),g=y,m=1;m<r;m++){g=a.run(g,a.ipad2);for(var w=0;w<p;w++)y[w]^=g[w]}y.copy(s,d),d+=p}return s}var a=t(379),s=t(470),f=t(474),c=t(443),u=t(442),h=t(471).Buffer,d=h.alloc(128),l={md5:16,sha1:20,sha224:28,sha256:32,sha384:48,sha512:64,rmd160:20,ripemd160:20};n.prototype.run=function(t,e){return t.copy(e,this.blocksize),this.hash(e).copy(this.opad,this.blocksize),this.hash(this.opad)},e.exports=o},{379:379,442:442,443:443,470:470,471:471,474:474}],445:[function(t,e,r){(function(t){"use strict";function r(e,r,n,i){if("function"!=typeof e)throw new TypeError('"callback" argument must be a function');var o,a,s=arguments.length;switch(s){case 0:case 1:return t.nextTick(e);case 2:return t.nextTick(function(){e.call(null,r)});case 3:return t.nextTick(function(){e.call(null,r,n)});case 4:return t.nextTick(function(){e.call(null,r,n,i)});default:for(o=new Array(s-1),a=0;a<o.length;)o[a++]=arguments[a];return t.nextTick(function(){e.apply(null,o)})}}!t.version||0===t.version.indexOf("v0.")||0===t.version.indexOf("v1.")&&0!==t.version.indexOf("v1.8.")?e.exports={nextTick:r}:e.exports=t}).call(this,t(446))},{446:446}],446:[function(t,e,r){function n(){throw new Error("setTimeout has not been defined")}function i(){throw new Error("clearTimeout has not been defined")}function o(t){if(h===setTimeout)return setTimeout(t,0);if((h===n||!h)&&setTimeout)return h=setTimeout,setTimeout(t,0);try{return h(t,0)}catch(e){try{return h.call(null,t,0)}catch(e){return h.call(this,t,0)}}}function a(t){if(d===clearTimeout)return clearTimeout(t);if((d===i||!d)&&clearTimeout)return d=clearTimeout,clearTimeout(t);try{return d(t)}catch(e){try{return d.call(null,t)}catch(e){return d.call(this,t)}}}function s(){v&&p&&(v=!1,p.length?b=p.concat(b):y=-1,b.length&&f())}function f(){if(!v){var t=o(s);v=!0;for(var e=b.length;e;){for(p=b,b=[];++y<e;)p&&p[y].run();y=-1,e=b.length}p=null,v=!1,a(t)}}function c(t,e){this.fun=t,this.array=e}function u(){}var h,d,l=e.exports={};!function(){try{h="function"==typeof setTimeout?setTimeout:n}catch(t){h=n}try{d="function"==typeof clearTimeout?clearTimeout:i}catch(t){d=i}}();var p,b=[],v=!1,y=-1;l.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)e[r-1]=arguments[r];b.push(new c(t,e)),1!==b.length||v||o(f)},c.prototype.run=function(){this.fun.apply(null,this.array)},l.title="browser",l.browser=!0,l.env={},l.argv=[],l.version="",l.versions={},l.on=u,l.addListener=u,l.once=u,l.off=u,l.removeListener=u,l.removeAllListeners=u,l.emit=u,l.prependListener=u,l.prependOnceListener=u,l.listeners=function(t){return[]},l.binding=function(t){throw new Error("process.binding is not supported")},l.cwd=function(){return"/"},l.chdir=function(t){throw new Error("process.chdir is not supported")},l.umask=function(){return 0}},{}],447:[function(t,e,r){(function(t){!function(r){function n(){}function i(t,e){return function(){t.apply(e,arguments)}}function o(t){if(!(this instanceof o))throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],h(t,this)}function a(t,e){for(;3===t._state;)t=t._value;if(0===t._state)return void t._deferreds.push(e);t._handled=!0,o._immediateFn(function(){var r=1===t._state?e.onFulfilled:e.onRejected;if(null===r)return void(1===t._state?s:f)(e.promise,t._value);var n;try{n=r(t._value)}catch(t){return void f(e.promise,t)}s(e.promise,n)})}function s(t,e){try{if(e===t)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var r=e.then;if(e instanceof o)return t._state=3,t._value=e,void c(t);if("function"==typeof r)return void h(i(r,e),t)}t._state=1,t._value=e,c(t)}catch(e){f(t,e)}}function f(t,e){t._state=2,t._value=e,c(t)}function c(t){2===t._state&&0===t._deferreds.length&&o._immediateFn(function(){t._handled||o._unhandledRejectionFn(t._value)});for(var e=0,r=t._deferreds.length;e<r;e++)a(t,t._deferreds[e]);t._deferreds=null}function u(t,e,r){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof e?e:null,this.promise=r}function h(t,e){var r=!1;try{t(function(t){r||(r=!0,s(e,t))},function(t){r||(r=!0,f(e,t))})}catch(t){if(r)return;r=!0,f(e,t)}}var d=setTimeout;o.prototype.catch=function(t){return this.then(null,t)},o.prototype.then=function(t,e){var r=new this.constructor(n);return a(this,new u(t,e,r)),r},o.all=function(t){return new o(function(e,r){function n(t,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var s=a.then;if("function"==typeof s)return void s.call(a,function(e){n(t,e)},r)}i[t]=a,0==--o&&e(i)}catch(t){r(t)}}if(!t||void 0===t.length)throw new TypeError("Promise.all accepts an array");var i=Array.prototype.slice.call(t);if(0===i.length)return e([]);for(var o=i.length,a=0;a<i.length;a++)n(a,i[a])})},o.resolve=function(t){return t&&"object"==typeof t&&t.constructor===o?t:new o(function(e){e(t)})},o.reject=function(t){return new o(function(e,r){r(t)})},o.race=function(t){return new o(function(e,r){for(var n=0,i=t.length;n<i;n++)t[n].then(e,r)})},o._immediateFn="function"==typeof t&&function(e){t(e)}||function(t){d(t,0)},o._unhandledRejectionFn=function(t){"undefined"!=typeof console&&console},o._setImmediateFn=function(t){o._immediateFn=t},o._setUnhandledRejectionFn=function(t){o._unhandledRejectionFn=t},void 0!==e&&e.exports?e.exports=o:r.Promise||(r.Promise=o)}(this)}).call(this,t(483).setImmediate)},{483:483}],448:[function(t,e,r){r.publicEncrypt=t(451),r.privateDecrypt=t(450),r.privateEncrypt=function(t,e){return r.publicEncrypt(t,e,!0)},r.publicDecrypt=function(t,e){return r.privateDecrypt(t,e,!0)}},{450:450,451:451}],449:[function(t,e,r){(function(r){function n(t){var e=new r(4);return e.writeUInt32BE(t,0),e}var i=t(378);e.exports=function(t,e){for(var o,a=new r(""),s=0;a.length<e;)o=n(s++),a=r.concat([a,i("sha1").update(t).update(o).digest()]);return a.slice(0,e)}}).call(this,t(50).Buffer)},{378:378,50:50}],450:[function(t,e,r){(function(r){function n(t,e){var n=(t.modulus,t.modulus.byteLength()),i=(e.length,h("sha1").update(new r("")).digest()),a=i.length;if(0!==e[0])throw new Error("decryption error");var c=e.slice(1,a+1),u=e.slice(a+1),d=f(c,s(u,a)),l=f(u,s(d,n-a-1));if(o(i,l.slice(0,a)))throw new Error("decryption error");for(var p=a;0===l[p];)p++;if(1!==l[p++])throw new Error("decryption error");return l.slice(p)}function i(t,e,r){for(var n=e.slice(0,2),i=2,o=0;0!==e[i++];)if(i>=e.length){o++;break}var a=e.slice(2,i-1);e.slice(i-1,i);if(("0002"!==n.toString("hex")&&!r||"0001"!==n.toString("hex")&&r)&&o++,a.length<8&&o++,o)throw new Error("decryption error");return e.slice(i)}function o(t,e){t=new r(t),e=new r(e);var n=0,i=t.length;t.length!==e.length&&(n++,i=Math.min(t.length,e.length));for(var o=-1;++o<i;)n+=t[o]^e[o];return n}var a=t(439),s=t(449),f=t(453),c=t(18),u=t(41),h=t(378),d=t(452);e.exports=function(t,e,o){var s;s=t.padding?t.padding:o?1:4;var f=a(t),h=f.modulus.byteLength();if(e.length>h||new c(e).cmp(f.modulus)>=0)throw new Error("decryption error");var l;l=o?d(new c(e),f):u(e,f);var p=new r(h-l.length);if(p.fill(0),l=r.concat([p,l],h),4===s)return n(f,l);if(1===s)return i(f,l,o);if(3===s)return l;throw new Error("unknown padding")}}).call(this,t(50).Buffer)},{18:18,378:378,41:41,439:439,449:449,452:452,453:453,50:50}],451:[function(t,e,r){(function(r){function n(t,e){var n=t.modulus.byteLength(),i=e.length,o=f("sha1").update(new r("")).digest(),a=o.length,d=2*a;if(i>n-d-2)throw new Error("message too long");var l=new r(n-i-d-2);l.fill(0);var p=n-a-1,b=s(a),v=u(r.concat([o,l,new r([1]),e],p),c(b,p)),y=u(b,c(v,a));return new h(r.concat([new r([0]),y,v],n))}function i(t,e,n){var i=e.length,a=t.modulus.byteLength();if(i>a-11)throw new Error("message too long");var s;return n?(s=new r(a-i-3),s.fill(255)):s=o(a-i-3),new h(r.concat([new r([0,n?1:2]),s,new r([0]),e],a))}function o(t,e){for(var n,i=new r(t),o=0,a=s(2*t),f=0;o<t;)f===a.length&&(a=s(2*t),f=0),(n=a[f++])&&(i[o++]=n);return i}var a=t(439),s=t(454),f=t(378),c=t(449),u=t(453),h=t(18),d=t(452),l=t(41);e.exports=function(t,e,r){var o;o=t.padding?t.padding:r?1:4;var s,f=a(t);if(4===o)s=n(f,e);else if(1===o)s=i(f,e,r);else{if(3!==o)throw new Error("unknown padding");if(s=new h(e),s.cmp(f.modulus)>=0)throw new Error("data too long for modulus")}return r?l(s,f):d(s,f)}}).call(this,t(50).Buffer)},{18:18,378:378,41:41,439:439,449:449,452:452,453:453,454:454,50:50}],452:[function(t,e,r){(function(r){function n(t,e){return new r(t.toRed(i.mont(e.modulus)).redPow(new i(e.publicExponent)).fromRed().toArray())}var i=t(18);e.exports=n}).call(this,t(50).Buffer)},{18:18,50:50}],453:[function(t,e,r){e.exports=function(t,e){for(var r=t.length,n=-1;++n<r;)t[n]^=e[n];return t}},{}],454:[function(t,e,r){(function(r,n){"use strict";function i(){throw new Error("Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11")}function o(t,e){if(t>65536)throw new Error("requested too many random bytes");var i=new n.Uint8Array(t);t>0&&s.getRandomValues(i);var o=a.from(i.buffer);return"function"==typeof e?r.nextTick(function(){e(null,o)}):o}var a=t(471).Buffer,s=n.crypto||n.msCrypto;s&&s.getRandomValues?e.exports=o:e.exports=i}).call(this,t(446),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{446:446,471:471}],455:[function(t,e,r){(function(e,n){"use strict";function i(){throw new Error("secure random number generation not supported by this browser\nuse chrome, FireFox or Internet Explorer 11")}function o(t,e){if("number"!=typeof t||t!==t)throw new TypeError("offset must be a number");if(t>b||t<0)throw new TypeError("offset must be a uint32");if(t>l||t>e)throw new RangeError("offset out of range")}function a(t,e,r){if("number"!=typeof t||t!==t)throw new TypeError("size must be a number");if(t>b||t<0)throw new TypeError("size must be a uint32");if(t+e>r||t>l)throw new RangeError("buffer too small")}function s(t,e,r,i){if(!(d.isBuffer(t)||t instanceof n.Uint8Array))throw new TypeError('"buf" argument must be a Buffer or Uint8Array');if("function"==typeof e)i=e,e=0,r=t.length;else if("function"==typeof r)i=r,r=t.length-e;else if("function"!=typeof i)throw new TypeError('"cb" argument must be a function');return o(e,t.length),a(r,e,t.length),f(t,e,r,i)}function f(t,r,n,i){if(e.browser){var o=t.buffer,a=new Uint8Array(o,r,n);return p.getRandomValues(a),i?void e.nextTick(function(){i(null,t)}):t}return i?void h(n,function(e,n){if(e)return i(e);n.copy(t,r),i(null,t)}):(h(n).copy(t,r),t)}function c(t,e,r){if(void 0===e&&(e=0),!(d.isBuffer(t)||t instanceof n.Uint8Array))throw new TypeError('"buf" argument must be a Buffer or Uint8Array');return o(e,t.length),void 0===r&&(r=t.length-e),a(r,e,t.length),f(t,e,r)}var u=t(471),h=t(454),d=u.Buffer,l=u.kMaxLength,p=n.crypto||n.msCrypto,b=Math.pow(2,32)-1;p&&p.getRandomValues||!e.browser?(r.randomFill=s,r.randomFillSync=c):(r.randomFill=i,r.randomFillSync=i)}).call(this,t(446),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{446:446,454:454,471:471}],456:[function(t,e,r){e.exports=t(457)},{457:457}],457:[function(t,e,r){"use strict";function n(t){if(!(this instanceof n))return new n(t);c.call(this,t),u.call(this,t),t&&!1===t.readable&&(this.readable=!1),t&&!1===t.writable&&(this.writable=!1),this.allowHalfOpen=!0,t&&!1===t.allowHalfOpen&&(this.allowHalfOpen=!1),this.once("end",i)}function i(){this.allowHalfOpen||this._writableState.ended||a.nextTick(o,this)}function o(t){t.end()}var a=t(445),s=Object.keys||function(t){var e=[];for(var r in t)e.push(r);return e};e.exports=n;var f=t(376);f.inherits=t(427);var c=t(459),u=t(461);f.inherits(n,c);for(var h=s(u.prototype),d=0;d<h.length;d++){var l=h[d];n.prototype[l]||(n.prototype[l]=u.prototype[l])}Object.defineProperty(n.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),Object.defineProperty(n.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&void 0!==this._writableState&&(this._readableState.destroyed&&this._writableState.destroyed)},set:function(t){void 0!==this._readableState&&void 0!==this._writableState&&(this._readableState.destroyed=t,this._writableState.destroyed=t)}}),n.prototype._destroy=function(t,e){this.push(null),this.end(),a.nextTick(e,t)}},{376:376,427:427,445:445,459:459,461:461}],458:[function(t,e,r){"use strict";function n(t){if(!(this instanceof n))return new n(t);i.call(this,t)}e.exports=n;var i=t(460),o=t(376);o.inherits=t(427),o.inherits(n,i),n.prototype._transform=function(t,e,r){r(null,t)}},{376:376,427:427,460:460}],459:[function(t,e,r){(function(r,n){"use strict";function i(t){return L.from(t)}function o(t){return L.isBuffer(t)||t instanceof D}function a(t,e,r){if("function"==typeof t.prependListener)return t.prependListener(e,r);t._events&&t._events[e]?O(t._events[e])?t._events[e].unshift(r):t._events[e]=[r,t._events[e]]:t.on(e,r)}function s(e,r){C=C||t(457),e=e||{};var n=r instanceof C;this.objectMode=!!e.objectMode,n&&(this.objectMode=this.objectMode||!!e.readableObjectMode);var i=e.highWaterMark,o=e.readableHighWaterMark,a=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(o||0===o)?o:a,this.highWaterMark=Math.floor(this.highWaterMark),this.buffer=new V,this.length=0,this.pipes=null,this.pipesCount=0,this.flowing=null,this.ended=!1,this.endEmitted=!1,this.reading=!1,this.sync=!0,this.needReadable=!1,this.emittedReadable=!1,this.readableListening=!1,this.resumeScheduled=!1,this.destroyed=!1,this.defaultEncoding=e.defaultEncoding||"utf8",this.awaitDrain=0,this.readingMore=!1,this.decoder=null,this.encoding=null,e.encoding&&(z||(z=t(482).StringDecoder),this.decoder=new z(e.encoding),this.encoding=e.encoding)}function f(e){if(C=C||t(457),!(this instanceof f))return new f(e);this._readableState=new s(e,this),this.readable=!0,e&&("function"==typeof e.read&&(this._read=e.read),"function"==typeof e.destroy&&(this._destroy=e.destroy)),N.call(this)}function c(t,e,r,n,o){var a=t._readableState;if(null===e)a.reading=!1,b(t,a);else{var s;o||(s=h(a,e)),s?t.emit("error",s):a.objectMode||e&&e.length>0?("string"==typeof e||a.objectMode||Object.getPrototypeOf(e)===L.prototype||(e=i(e)),n?a.endEmitted?t.emit("error",new Error("stream.unshift() after end event")):u(t,a,e,!0):a.ended?t.emit("error",new Error("stream.push() after EOF")):(a.reading=!1,a.decoder&&!r?(e=a.decoder.write(e),a.objectMode||0!==e.length?u(t,a,e,!1):g(t,a)):u(t,a,e,!1))):n||(a.reading=!1)}return d(a)}function u(t,e,r,n){e.flowing&&0===e.length&&!e.sync?(t.emit("data",r),t.read(0)):(e.length+=e.objectMode?1:r.length,n?e.buffer.unshift(r):e.buffer.push(r),e.needReadable&&v(t)),g(t,e)}function h(t,e){var r;return o(e)||"string"==typeof e||void 0===e||t.objectMode||(r=new TypeError("Invalid non-string/buffer chunk")),r}function d(t){return!t.ended&&(t.needReadable||t.length<t.highWaterMark||0===t.length)}function l(t){return t>=W?t=W:(t--,t|=t>>>1,t|=t>>>2,t|=t>>>4,t|=t>>>8,t|=t>>>16,t++),t}function p(t,e){return t<=0||0===e.length&&e.ended?0:e.objectMode?1:t!==t?e.flowing&&e.length?e.buffer.head.data.length:e.length:(t>e.highWaterMark&&(e.highWaterMark=l(t)),t<=e.length?t:e.ended?e.length:(e.needReadable=!0,0))}function b(t,e){if(!e.ended){if(e.decoder){var r=e.decoder.end();r&&r.length&&(e.buffer.push(r),e.length+=e.objectMode?1:r.length)}e.ended=!0,v(t)}}function v(t){var e=t._readableState;e.needReadable=!1,e.emittedReadable||(q("emitReadable",e.flowing),e.emittedReadable=!0,e.sync?P.nextTick(y,t):y(t))}function y(t){q("emit readable"),t.emit("readable"),k(t)}function g(t,e){e.readingMore||(e.readingMore=!0,P.nextTick(m,t,e))}function m(t,e){for(var r=e.length;!e.reading&&!e.flowing&&!e.ended&&e.length<e.highWaterMark&&(q("maybeReadMore read 0"),t.read(0),r!==e.length);)r=e.length;e.readingMore=!1}function w(t){return function(){var e=t._readableState;q("pipeOnDrain",e.awaitDrain),e.awaitDrain&&e.awaitDrain--,0===e.awaitDrain&&j(t,"data")&&(e.flowing=!0,k(t))}}function _(t){q("readable nexttick read 0"),t.read(0)}function S(t,e){e.resumeScheduled||(e.resumeScheduled=!0,P.nextTick(E,t,e))}function E(t,e){e.reading||(q("resume read 0"),t.read(0)),e.resumeScheduled=!1,e.awaitDrain=0,t.emit("resume"),k(t),e.flowing&&!e.reading&&t.read(0)}function k(t){var e=t._readableState;for(q("flow",e.flowing);e.flowing&&null!==t.read(););}function M(t,e){if(0===e.length)return null;var r;return e.objectMode?r=e.buffer.shift():!t||t>=e.length?(r=e.decoder?e.buffer.join(""):1===e.buffer.length?e.buffer.head.data:e.buffer.concat(e.length),e.buffer.clear()):r=A(t,e.buffer,e.decoder),r}function A(t,e,r){var n;return t<e.head.data.length?(n=e.head.data.slice(0,t),e.head.data=e.head.data.slice(t)):n=t===e.head.data.length?e.shift():r?x(t,e):I(t,e),n}function x(t,e){var r=e.head,n=1,i=r.data;for(t-=i.length;r=r.next;){var o=r.data,a=t>o.length?o.length:t;if(a===o.length?i+=o:i+=o.slice(0,t),0===(t-=a)){a===o.length?(++n,r.next?e.head=r.next:e.head=e.tail=null):(e.head=r,r.data=o.slice(a));break}++n}return e.length-=n,i}function I(t,e){var r=L.allocUnsafe(t),n=e.head,i=1;for(n.data.copy(r),t-=n.data.length;n=n.next;){var o=n.data,a=t>o.length?o.length:t;if(o.copy(r,r.length-t,0,a),0===(t-=a)){a===o.length?(++i,n.next?e.head=n.next:e.head=e.tail=null):(e.head=n,n.data=o.slice(a));break}++i}return e.length-=i,r}function R(t){var e=t._readableState;if(e.length>0)throw new Error('"endReadable()" called on non-empty stream');e.endEmitted||(e.ended=!0,P.nextTick(B,e,t))}function B(t,e){t.endEmitted||0!==t.length||(t.endEmitted=!0,e.readable=!1,e.emit("end"))}function T(t,e){for(var r=0,n=t.length;r<n;r++)if(t[r]===e)return r;return-1}var P=t(445);e.exports=f;var C,O=t(429);f.ReadableState=s;var j=(t(409).EventEmitter,function(t,e){return t.listeners(e).length}),N=t(464),L=t(471).Buffer,D=n.Uint8Array||function(){},F=t(376);F.inherits=t(427);var U=t(20),q=void 0;q=U&&U.debuglog?U.debuglog("stream"):function(){};var z,V=t(462),G=t(463);F.inherits(f,N);var K=["error","close","destroy","pause","resume"];Object.defineProperty(f.prototype,"destroyed",{get:function(){return void 0!==this._readableState&&this._readableState.destroyed},set:function(t){this._readableState&&(this._readableState.destroyed=t)}}),f.prototype.destroy=G.destroy,f.prototype._undestroy=G.undestroy,f.prototype._destroy=function(t,e){this.push(null),e(t)},f.prototype.push=function(t,e){var r,n=this._readableState;return n.objectMode?r=!0:"string"==typeof t&&(e=e||n.defaultEncoding,e!==n.encoding&&(t=L.from(t,e),e=""),r=!0),c(this,t,e,!1,r)},f.prototype.unshift=function(t){return c(this,t,null,!0,!1)},f.prototype.isPaused=function(){return!1===this._readableState.flowing},f.prototype.setEncoding=function(e){return z||(z=t(482).StringDecoder),this._readableState.decoder=new z(e),this._readableState.encoding=e,this};var W=8388608;f.prototype.read=function(t){q("read",t),t=parseInt(t,10);var e=this._readableState,r=t;if(0!==t&&(e.emittedReadable=!1),0===t&&e.needReadable&&(e.length>=e.highWaterMark||e.ended))return q("read: emitReadable",e.length,e.ended),0===e.length&&e.ended?R(this):v(this),null;if(0===(t=p(t,e))&&e.ended)return 0===e.length&&R(this),null;var n=e.needReadable;q("need readable",n),(0===e.length||e.length-t<e.highWaterMark)&&(n=!0,q("length less than watermark",n)),e.ended||e.reading?(n=!1,q("reading or ended",n)):n&&(q("do read"),e.reading=!0,e.sync=!0,0===e.length&&(e.needReadable=!0),this._read(e.highWaterMark),e.sync=!1,e.reading||(t=p(r,e)));var i;return i=t>0?M(t,e):null,null===i?(e.needReadable=!0,t=0):e.length-=t,0===e.length&&(e.ended||(e.needReadable=!0),r!==t&&e.ended&&R(this)),null!==i&&this.emit("data",i),i},f.prototype._read=function(t){this.emit("error",new Error("_read() is not implemented"))},f.prototype.pipe=function(t,e){function n(t,e){q("onunpipe"),t===d&&e&&!1===e.hasUnpiped&&(e.hasUnpiped=!0,o())}function i(){q("onend"),t.end()}function o(){q("cleanup"),t.removeListener("close",c),t.removeListener("finish",u),t.removeListener("drain",v),t.removeListener("error",f),t.removeListener("unpipe",n),d.removeListener("end",i),d.removeListener("end",h),d.removeListener("data",s),y=!0,!l.awaitDrain||t._writableState&&!t._writableState.needDrain||v()}function s(e){q("ondata"),g=!1,!1!==t.write(e)||g||((1===l.pipesCount&&l.pipes===t||l.pipesCount>1&&-1!==T(l.pipes,t))&&!y&&(q("false write response, pause",d._readableState.awaitDrain),d._readableState.awaitDrain++,g=!0),d.pause())}function f(e){q("onerror",e),h(),t.removeListener("error",f),0===j(t,"error")&&t.emit("error",e)}function c(){t.removeListener("finish",u),h()}function u(){q("onfinish"),t.removeListener("close",c),h()}function h(){q("unpipe"),d.unpipe(t)}var d=this,l=this._readableState;switch(l.pipesCount){case 0:l.pipes=t;break;case 1:l.pipes=[l.pipes,t];break;default:l.pipes.push(t)}l.pipesCount+=1,q("pipe count=%d opts=%j",l.pipesCount,e);var p=(!e||!1!==e.end)&&t!==r.stdout&&t!==r.stderr,b=p?i:h;l.endEmitted?P.nextTick(b):d.once("end",b),t.on("unpipe",n);var v=w(d);t.on("drain",v);var y=!1,g=!1;return d.on("data",s),a(t,"error",f),t.once("close",c),t.once("finish",u),t.emit("pipe",d),l.flowing||(q("pipe resume"),d.resume()),t},f.prototype.unpipe=function(t){var e=this._readableState,r={hasUnpiped:!1};if(0===e.pipesCount)return this;if(1===e.pipesCount)return t&&t!==e.pipes?this:(t||(t=e.pipes),e.pipes=null,e.pipesCount=0,e.flowing=!1,t&&t.emit("unpipe",this,r),this);if(!t){var n=e.pipes,i=e.pipesCount;e.pipes=null,e.pipesCount=0,e.flowing=!1;for(var o=0;o<i;o++)n[o].emit("unpipe",this,r);return this}var a=T(e.pipes,t);return-1===a?this:(e.pipes.splice(a,1),e.pipesCount-=1,1===e.pipesCount&&(e.pipes=e.pipes[0]),t.emit("unpipe",this,r),this)},f.prototype.on=function(t,e){var r=N.prototype.on.call(this,t,e)
;if("data"===t)!1!==this._readableState.flowing&&this.resume();else if("readable"===t){var n=this._readableState;n.endEmitted||n.readableListening||(n.readableListening=n.needReadable=!0,n.emittedReadable=!1,n.reading?n.length&&v(this):P.nextTick(_,this))}return r},f.prototype.addListener=f.prototype.on,f.prototype.resume=function(){var t=this._readableState;return t.flowing||(q("resume"),t.flowing=!0,S(this,t)),this},f.prototype.pause=function(){return q("call pause flowing=%j",this._readableState.flowing),!1!==this._readableState.flowing&&(q("pause"),this._readableState.flowing=!1,this.emit("pause")),this},f.prototype.wrap=function(t){var e=this,r=this._readableState,n=!1;t.on("end",function(){if(q("wrapped end"),r.decoder&&!r.ended){var t=r.decoder.end();t&&t.length&&e.push(t)}e.push(null)}),t.on("data",function(i){if(q("wrapped data"),r.decoder&&(i=r.decoder.write(i)),(!r.objectMode||null!==i&&void 0!==i)&&(r.objectMode||i&&i.length)){e.push(i)||(n=!0,t.pause())}});for(var i in t)void 0===this[i]&&"function"==typeof t[i]&&(this[i]=function(e){return function(){return t[e].apply(t,arguments)}}(i));for(var o=0;o<K.length;o++)t.on(K[o],this.emit.bind(this,K[o]));return this._read=function(e){q("wrapped _read",e),n&&(n=!1,t.resume())},this},Object.defineProperty(f.prototype,"readableHighWaterMark",{enumerable:!1,get:function(){return this._readableState.highWaterMark}}),f._fromList=M}).call(this,t(446),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{20:20,376:376,409:409,427:427,429:429,445:445,446:446,457:457,462:462,463:463,464:464,471:471,482:482}],460:[function(t,e,r){"use strict";function n(t,e){var r=this._transformState;r.transforming=!1;var n=r.writecb;if(!n)return this.emit("error",new Error("write callback called multiple times"));r.writechunk=null,r.writecb=null,null!=e&&this.push(e),n(t);var i=this._readableState;i.reading=!1,(i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark)}function i(t){if(!(this instanceof i))return new i(t);s.call(this,t),this._transformState={afterTransform:n.bind(this),needTransform:!1,transforming:!1,writecb:null,writechunk:null,writeencoding:null},this._readableState.needReadable=!0,this._readableState.sync=!1,t&&("function"==typeof t.transform&&(this._transform=t.transform),"function"==typeof t.flush&&(this._flush=t.flush)),this.on("prefinish",o)}function o(){var t=this;"function"==typeof this._flush?this._flush(function(e,r){a(t,e,r)}):a(this,null,null)}function a(t,e,r){if(e)return t.emit("error",e);if(null!=r&&t.push(r),t._writableState.length)throw new Error("Calling transform done when ws.length != 0");if(t._transformState.transforming)throw new Error("Calling transform done when still transforming");return t.push(null)}e.exports=i;var s=t(457),f=t(376);f.inherits=t(427),f.inherits(i,s),i.prototype.push=function(t,e){return this._transformState.needTransform=!1,s.prototype.push.call(this,t,e)},i.prototype._transform=function(t,e,r){throw new Error("_transform() is not implemented")},i.prototype._write=function(t,e,r){var n=this._transformState;if(n.writecb=r,n.writechunk=t,n.writeencoding=e,!n.transforming){var i=this._readableState;(n.needTransform||i.needReadable||i.length<i.highWaterMark)&&this._read(i.highWaterMark)}},i.prototype._read=function(t){var e=this._transformState;null!==e.writechunk&&e.writecb&&!e.transforming?(e.transforming=!0,this._transform(e.writechunk,e.writeencoding,e.afterTransform)):e.needTransform=!0},i.prototype._destroy=function(t,e){var r=this;s.prototype._destroy.call(this,t,function(t){e(t),r.emit("close")})}},{376:376,427:427,457:457}],461:[function(t,e,r){(function(r,n,i){"use strict";function o(t){var e=this;this.next=null,this.entry=null,this.finish=function(){x(e,t)}}function a(t){return O.from(t)}function s(t){return O.isBuffer(t)||t instanceof j}function f(){}function c(e,r){R=R||t(457),e=e||{};var n=r instanceof R;this.objectMode=!!e.objectMode,n&&(this.objectMode=this.objectMode||!!e.writableObjectMode);var i=e.highWaterMark,a=e.writableHighWaterMark,s=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(a||0===a)?a:s,this.highWaterMark=Math.floor(this.highWaterMark),this.finalCalled=!1,this.needDrain=!1,this.ending=!1,this.ended=!1,this.finished=!1,this.destroyed=!1;var f=!1===e.decodeStrings;this.decodeStrings=!f,this.defaultEncoding=e.defaultEncoding||"utf8",this.length=0,this.writing=!1,this.corked=0,this.sync=!0,this.bufferProcessing=!1,this.onwrite=function(t){g(r,t)},this.writecb=null,this.writelen=0,this.bufferedRequest=null,this.lastBufferedRequest=null,this.pendingcb=0,this.prefinished=!1,this.errorEmitted=!1,this.bufferedRequestCount=0,this.corkedRequestsFree=new o(this)}function u(e){if(R=R||t(457),!(L.call(u,this)||this instanceof R))return new u(e);this._writableState=new c(e,this),this.writable=!0,e&&("function"==typeof e.write&&(this._write=e.write),"function"==typeof e.writev&&(this._writev=e.writev),"function"==typeof e.destroy&&(this._destroy=e.destroy),"function"==typeof e.final&&(this._final=e.final)),C.call(this)}function h(t,e){var r=new Error("write after end");t.emit("error",r),I.nextTick(e,r)}function d(t,e,r,n){var i=!0,o=!1;return null===r?o=new TypeError("May not write null values to stream"):"string"==typeof r||void 0===r||e.objectMode||(o=new TypeError("Invalid non-string/buffer chunk")),o&&(t.emit("error",o),I.nextTick(n,o),i=!1),i}function l(t,e,r){return t.objectMode||!1===t.decodeStrings||"string"!=typeof e||(e=O.from(e,r)),e}function p(t,e,r,n,i,o){if(!r){var a=l(e,n,i);n!==a&&(r=!0,i="buffer",n=a)}var s=e.objectMode?1:n.length;e.length+=s;var f=e.length<e.highWaterMark;if(f||(e.needDrain=!0),e.writing||e.corked){var c=e.lastBufferedRequest;e.lastBufferedRequest={chunk:n,encoding:i,isBuf:r,callback:o,next:null},c?c.next=e.lastBufferedRequest:e.bufferedRequest=e.lastBufferedRequest,e.bufferedRequestCount+=1}else b(t,e,!1,s,n,i,o);return f}function b(t,e,r,n,i,o,a){e.writelen=n,e.writecb=a,e.writing=!0,e.sync=!0,r?t._writev(i,e.onwrite):t._write(i,o,e.onwrite),e.sync=!1}function v(t,e,r,n,i){--e.pendingcb,r?(I.nextTick(i,n),I.nextTick(M,t,e),t._writableState.errorEmitted=!0,t.emit("error",n)):(i(n),t._writableState.errorEmitted=!0,t.emit("error",n),M(t,e))}function y(t){t.writing=!1,t.writecb=null,t.length-=t.writelen,t.writelen=0}function g(t,e){var r=t._writableState,n=r.sync,i=r.writecb;if(y(r),e)v(t,r,n,e,i);else{var o=S(r);o||r.corked||r.bufferProcessing||!r.bufferedRequest||_(t,r),n?B(m,t,r,o,i):m(t,r,o,i)}}function m(t,e,r,n){r||w(t,e),e.pendingcb--,n(),M(t,e)}function w(t,e){0===e.length&&e.needDrain&&(e.needDrain=!1,t.emit("drain"))}function _(t,e){e.bufferProcessing=!0;var r=e.bufferedRequest;if(t._writev&&r&&r.next){var n=e.bufferedRequestCount,i=new Array(n),a=e.corkedRequestsFree;a.entry=r;for(var s=0,f=!0;r;)i[s]=r,r.isBuf||(f=!1),r=r.next,s+=1;i.allBuffers=f,b(t,e,!0,e.length,i,"",a.finish),e.pendingcb++,e.lastBufferedRequest=null,a.next?(e.corkedRequestsFree=a.next,a.next=null):e.corkedRequestsFree=new o(e),e.bufferedRequestCount=0}else{for(;r;){var c=r.chunk,u=r.encoding,h=r.callback;if(b(t,e,!1,e.objectMode?1:c.length,c,u,h),r=r.next,e.bufferedRequestCount--,e.writing)break}null===r&&(e.lastBufferedRequest=null)}e.bufferedRequest=r,e.bufferProcessing=!1}function S(t){return t.ending&&0===t.length&&null===t.bufferedRequest&&!t.finished&&!t.writing}function E(t,e){t._final(function(r){e.pendingcb--,r&&t.emit("error",r),e.prefinished=!0,t.emit("prefinish"),M(t,e)})}function k(t,e){e.prefinished||e.finalCalled||("function"==typeof t._final?(e.pendingcb++,e.finalCalled=!0,I.nextTick(E,t,e)):(e.prefinished=!0,t.emit("prefinish")))}function M(t,e){var r=S(e);return r&&(k(t,e),0===e.pendingcb&&(e.finished=!0,t.emit("finish"))),r}function A(t,e,r){e.ending=!0,M(t,e),r&&(e.finished?I.nextTick(r):t.once("finish",r)),e.ended=!0,t.writable=!1}function x(t,e,r){var n=t.entry;for(t.entry=null;n;){var i=n.callback;e.pendingcb--,i(r),n=n.next}e.corkedRequestsFree?e.corkedRequestsFree.next=t:e.corkedRequestsFree=t}var I=t(445);e.exports=u;var R,B=!r.browser&&["v0.10","v0.9."].indexOf(r.version.slice(0,5))>-1?i:I.nextTick;u.WritableState=c;var T=t(376);T.inherits=t(427);var P={deprecate:t(484)},C=t(464),O=t(471).Buffer,j=n.Uint8Array||function(){},N=t(463);T.inherits(u,C),c.prototype.getBuffer=function(){for(var t=this.bufferedRequest,e=[];t;)e.push(t),t=t.next;return e},function(){try{Object.defineProperty(c.prototype,"buffer",{get:P.deprecate(function(){return this.getBuffer()},"_writableState.buffer is deprecated. Use _writableState.getBuffer instead.","DEP0003")})}catch(t){}}();var L;"function"==typeof Symbol&&Symbol.hasInstance&&"function"==typeof Function.prototype[Symbol.hasInstance]?(L=Function.prototype[Symbol.hasInstance],Object.defineProperty(u,Symbol.hasInstance,{value:function(t){return!!L.call(this,t)||this===u&&(t&&t._writableState instanceof c)}})):L=function(t){return t instanceof this},u.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe, not readable"))},u.prototype.write=function(t,e,r){var n=this._writableState,i=!1,o=!n.objectMode&&s(t);return o&&!O.isBuffer(t)&&(t=a(t)),"function"==typeof e&&(r=e,e=null),o?e="buffer":e||(e=n.defaultEncoding),"function"!=typeof r&&(r=f),n.ended?h(this,r):(o||d(this,n,t,r))&&(n.pendingcb++,i=p(this,n,o,t,e,r)),i},u.prototype.cork=function(){this._writableState.corked++},u.prototype.uncork=function(){var t=this._writableState;t.corked&&(t.corked--,t.writing||t.corked||t.finished||t.bufferProcessing||!t.bufferedRequest||_(this,t))},u.prototype.setDefaultEncoding=function(t){if("string"==typeof t&&(t=t.toLowerCase()),!(["hex","utf8","utf-8","ascii","binary","base64","ucs2","ucs-2","utf16le","utf-16le","raw"].indexOf((t+"").toLowerCase())>-1))throw new TypeError("Unknown encoding: "+t);return this._writableState.defaultEncoding=t,this},Object.defineProperty(u.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),u.prototype._write=function(t,e,r){r(new Error("_write() is not implemented"))},u.prototype._writev=null,u.prototype.end=function(t,e,r){var n=this._writableState;"function"==typeof t?(r=t,t=null,e=null):"function"==typeof e&&(r=e,e=null),null!==t&&void 0!==t&&this.write(t,e),n.corked&&(n.corked=1,this.uncork()),n.ending||n.finished||A(this,n,r)},Object.defineProperty(u.prototype,"destroyed",{get:function(){return void 0!==this._writableState&&this._writableState.destroyed},set:function(t){this._writableState&&(this._writableState.destroyed=t)}}),u.prototype.destroy=N.destroy,u.prototype._undestroy=N.undestroy,u.prototype._destroy=function(t,e){this.end(),e(t)}}).call(this,t(446),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},t(483).setImmediate)},{376:376,427:427,445:445,446:446,457:457,463:463,464:464,471:471,483:483,484:484}],462:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e,r){t.copy(e,r)}var o=t(471).Buffer,a=t(20);e.exports=function(){function t(){n(this,t),this.head=null,this.tail=null,this.length=0}return t.prototype.push=function(t){var e={data:t,next:null};this.length>0?this.tail.next=e:this.head=e,this.tail=e,++this.length},t.prototype.unshift=function(t){var e={data:t,next:this.head};0===this.length&&(this.tail=e),this.head=e,++this.length},t.prototype.shift=function(){if(0!==this.length){var t=this.head.data;return 1===this.length?this.head=this.tail=null:this.head=this.head.next,--this.length,t}},t.prototype.clear=function(){this.head=this.tail=null,this.length=0},t.prototype.join=function(t){if(0===this.length)return"";for(var e=this.head,r=""+e.data;e=e.next;)r+=t+e.data;return r},t.prototype.concat=function(t){if(0===this.length)return o.alloc(0);if(1===this.length)return this.head.data;for(var e=o.allocUnsafe(t>>>0),r=this.head,n=0;r;)i(r.data,e,n),n+=r.data.length,r=r.next;return e},t}(),a&&a.inspect&&a.inspect.custom&&(e.exports.prototype[a.inspect.custom]=function(){var t=a.inspect({length:this.length});return this.constructor.name+" "+t})},{20:20,471:471}],463:[function(t,e,r){"use strict";function n(t,e){var r=this,n=this._readableState&&this._readableState.destroyed,i=this._writableState&&this._writableState.destroyed;return n||i?(e?e(t):!t||this._writableState&&this._writableState.errorEmitted||a.nextTick(o,this,t),this):(this._readableState&&(this._readableState.destroyed=!0),this._writableState&&(this._writableState.destroyed=!0),this._destroy(t||null,function(t){!e&&t?(a.nextTick(o,r,t),r._writableState&&(r._writableState.errorEmitted=!0)):e&&e(t)}),this)}function i(){this._readableState&&(this._readableState.destroyed=!1,this._readableState.reading=!1,this._readableState.ended=!1,this._readableState.endEmitted=!1),this._writableState&&(this._writableState.destroyed=!1,this._writableState.ended=!1,this._writableState.ending=!1,this._writableState.finished=!1,this._writableState.errorEmitted=!1)}function o(t,e){t.emit("error",e)}var a=t(445);e.exports={destroy:n,undestroy:i}},{445:445}],464:[function(t,e,r){e.exports=t(409).EventEmitter},{409:409}],465:[function(t,e,r){e.exports=t(466).PassThrough},{466:466}],466:[function(t,e,r){r=e.exports=t(459),r.Stream=r,r.Readable=r,r.Writable=t(461),r.Duplex=t(457),r.Transform=t(460),r.PassThrough=t(458)},{457:457,458:458,459:459,460:460,461:461}],467:[function(t,e,r){e.exports=t(466).Transform},{466:466}],468:[function(t,e,r){e.exports=t(461)},{461:461}],469:[function(t,e,r){(function(t){!function(t){"use strict";function r(t,e,r,n){var o=e&&e.prototype instanceof i?e:i,a=Object.create(o.prototype),s=new l(n||[]);return a._invoke=c(t,r,s),a}function n(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}function i(){}function o(){}function a(){}function s(t){["next","throw","return"].forEach(function(e){t[e]=function(t){return this._invoke(e,t)}})}function f(e){function r(t,i,o,a){var s=n(e[t],e,i);if("throw"!==s.type){var f=s.arg,c=f.value;return c&&"object"==typeof c&&g.call(c,"__await")?Promise.resolve(c.__await).then(function(t){r("next",t,o,a)},function(t){r("throw",t,o,a)}):Promise.resolve(c).then(function(t){f.value=t,o(f)},a)}a(s.arg)}function i(t,e){function n(){return new Promise(function(n,i){r(t,e,n,i)})}return o=o?o.then(n,n):n()}"object"==typeof t.process&&t.process.domain&&(r=t.process.domain.bind(r));var o;this._invoke=i}function c(t,e,r){var i=M;return function(o,a){if(i===x)throw new Error("Generator is already running");if(i===I){if("throw"===o)throw a;return b()}for(r.method=o,r.arg=a;;){var s=r.delegate;if(s){var f=u(s,r);if(f){if(f===R)continue;return f}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if(i===M)throw i=I,r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);i=x;var c=n(t,e,r);if("normal"===c.type){if(i=r.done?I:A,c.arg===R)continue;return{value:c.arg,done:r.done}}"throw"===c.type&&(i=I,r.method="throw",r.arg=c.arg)}}}function u(t,e){var r=t.iterator[e.method];if(r===v){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=v,u(t,e),"throw"===e.method))return R;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return R}var i=n(r,t.iterator,e.arg);if("throw"===i.type)return e.method="throw",e.arg=i.arg,e.delegate=null,R;var o=i.arg;return o?o.done?(e[t.resultName]=o.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=v),e.delegate=null,R):o:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,R)}function h(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function d(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function l(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(h,this),this.reset(!0)}function p(t){if(t){var e=t[w];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var r=-1,n=function e(){for(;++r<t.length;)if(g.call(t,r))return e.value=t[r],e.done=!1,e;return e.value=v,e.done=!0,e};return n.next=n}}return{next:b}}function b(){return{value:v,done:!0}}var v,y=Object.prototype,g=y.hasOwnProperty,m="function"==typeof Symbol?Symbol:{},w=m.iterator||"@@iterator",_=m.asyncIterator||"@@asyncIterator",S=m.toStringTag||"@@toStringTag",E="object"==typeof e,k=t.regeneratorRuntime;if(k)return void(E&&(e.exports=k));k=t.regeneratorRuntime=E?e.exports:{},k.wrap=r;var M="suspendedStart",A="suspendedYield",x="executing",I="completed",R={},B={};B[w]=function(){return this};var T=Object.getPrototypeOf,P=T&&T(T(p([])));P&&P!==y&&g.call(P,w)&&(B=P);var C=a.prototype=i.prototype=Object.create(B);o.prototype=C.constructor=a,a.constructor=o,a[S]=o.displayName="GeneratorFunction",k.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===o||"GeneratorFunction"===(e.displayName||e.name))},k.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,a):(t.__proto__=a,S in t||(t[S]="GeneratorFunction")),t.prototype=Object.create(C),t},k.awrap=function(t){return{__await:t}},s(f.prototype),f.prototype[_]=function(){return this},k.AsyncIterator=f,k.async=function(t,e,n,i){var o=new f(r(t,e,n,i));return k.isGeneratorFunction(e)?o:o.next().then(function(t){return t.done?t.value:o.next()})},s(C),C[S]="Generator",C[w]=function(){return this},C.toString=function(){return"[object Generator]"},k.keys=function(t){var e=[];for(var r in t)e.push(r);return e.reverse(),function r(){for(;e.length;){var n=e.pop();if(n in t)return r.value=n,r.done=!1,r}return r.done=!0,r}},k.values=p,l.prototype={constructor:l,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=v,this.done=!1,this.delegate=null,this.method="next",this.arg=v,this.tryEntries.forEach(d),!t)for(var e in this)"t"===e.charAt(0)&&g.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=v)},stop:function(){this.done=!0;var t=this.tryEntries[0],e=t.completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(t){function e(e,n){return o.type="throw",o.arg=t,r.next=e,n&&(r.method="next",r.arg=v),!!n}if(this.done)throw t;for(var r=this,n=this.tryEntries.length-1;n>=0;--n){var i=this.tryEntries[n],o=i.completion;if("root"===i.tryLoc)return e("end");if(i.tryLoc<=this.prev){var a=g.call(i,"catchLoc"),s=g.call(i,"finallyLoc");if(a&&s){if(this.prev<i.catchLoc)return e(i.catchLoc,!0);if(this.prev<i.finallyLoc)return e(i.finallyLoc)}else if(a){if(this.prev<i.catchLoc)return e(i.catchLoc,!0)}else{if(!s)throw new Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return e(i.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&g.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var i=n;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var o=i?i.completion:{};return o.type=t,o.arg=e,i?(this.method="next",this.next=i.finallyLoc,R):this.complete(o)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),R},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),d(r),R}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var i=n.arg;d(r)}return i}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,r){return this.delegate={iterator:p(t),resultName:e,nextLoc:r},"next"===this.method&&(this.arg=v),R}}}("object"==typeof t?t:"object"==typeof window?window:"object"==typeof self?self:this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],470:[function(t,e,r){"use strict";function n(){d.call(this,64),this._a=1732584193,this._b=4023233417,this._c=2562383102,this._d=271733878,this._e=3285377520}function i(t,e){return t<<e|t>>>32-e}function o(t,e,r,n,o,a,s,f){return i(t+(e^r^n)+a+s|0,f)+o|0}function a(t,e,r,n,o,a,s,f){return i(t+(e&r|~e&n)+a+s|0,f)+o|0}function s(t,e,r,n,o,a,s,f){return i(t+((e|~r)^n)+a+s|0,f)+o|0}function f(t,e,r,n,o,a,s,f){return i(t+(e&n|r&~n)+a+s|0,f)+o|0}function c(t,e,r,n,o,a,s,f){return i(t+(e^(r|~n))+a+s|0,f)+o|0}var u=t(50).Buffer,h=t(427),d=t(411),l=new Array(16),p=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13],b=[5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11],v=[11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6],y=[8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11],g=[0,1518500249,1859775393,2400959708,2840853838],m=[1352829926,1548603684,1836072691,2053994217,0];h(n,d),n.prototype._update=function(){for(var t=l,e=0;e<16;++e)t[e]=this._block.readInt32LE(4*e);for(var r=0|this._a,n=0|this._b,u=0|this._c,h=0|this._d,d=0|this._e,w=0|this._a,_=0|this._b,S=0|this._c,E=0|this._d,k=0|this._e,M=0;M<80;M+=1){var A,x;M<16?(A=o(r,n,u,h,d,t[p[M]],g[0],v[M]),x=c(w,_,S,E,k,t[b[M]],m[0],y[M])):M<32?(A=a(r,n,u,h,d,t[p[M]],g[1],v[M]),x=f(w,_,S,E,k,t[b[M]],m[1],y[M])):M<48?(A=s(r,n,u,h,d,t[p[M]],g[2],v[M]),x=s(w,_,S,E,k,t[b[M]],m[2],y[M])):M<64?(A=f(r,n,u,h,d,t[p[M]],g[3],v[M]),x=a(w,_,S,E,k,t[b[M]],m[3],y[M])):(A=c(r,n,u,h,d,t[p[M]],g[4],v[M]),x=o(w,_,S,E,k,t[b[M]],m[4],y[M])),r=d,d=h,h=i(u,10),u=n,n=A,w=k,k=E,E=i(S,10),S=_,_=x}var I=this._b+u+E|0;this._b=this._c+h+k|0,this._c=this._d+d+w|0,this._d=this._e+r+_|0,this._e=this._a+n+S|0,this._a=I},n.prototype._digest=function(){this._block[this._blockOffset++]=128,this._blockOffset>56&&(this._block.fill(0,this._blockOffset,64),this._update(),this._blockOffset=0),this._block.fill(0,this._blockOffset,56),this._block.writeUInt32LE(this._length[0],56),this._block.writeUInt32LE(this._length[1],60),this._update();var t=u.alloc?u.alloc(20):new u(20);return t.writeInt32LE(this._a,0),t.writeInt32LE(this._b,4),t.writeInt32LE(this._c,8),t.writeInt32LE(this._d,12),t.writeInt32LE(this._e,16),t},e.exports=n},{411:411,427:427,50:50}],471:[function(t,e,r){function n(t,e){for(var r in t)e[r]=t[r]}function i(t,e,r){return a(t,e,r)}var o=t(50),a=o.Buffer;a.from&&a.alloc&&a.allocUnsafe&&a.allocUnsafeSlow?e.exports=o:(n(o,r),r.Buffer=i),n(a,i),i.from=function(t,e,r){if("number"==typeof t)throw new TypeError("Argument must not be a number");return a(t,e,r)},i.alloc=function(t,e,r){if("number"!=typeof t)throw new TypeError("Argument must be a number");var n=a(t);return void 0!==e?"string"==typeof r?n.fill(e,r):n.fill(e):n.fill(0),n},i.allocUnsafe=function(t){if("number"!=typeof t)throw new TypeError("Argument must be a number");return a(t)},i.allocUnsafeSlow=function(t){if("number"!=typeof t)throw new TypeError("Argument must be a number");return o.SlowBuffer(t)}},{50:50}],472:[function(t,e,r){"use strict";var n={};n.generateIdentifier=function(){return Math.random().toString(36).substr(2,10)},n.localCName=n.generateIdentifier(),n.splitLines=function(t){return t.trim().split("\n").map(function(t){return t.trim()})},n.splitSections=function(t){return t.split("\nm=").map(function(t,e){return(e>0?"m="+t:t).trim()+"\r\n"})},n.getDescription=function(t){var e=n.splitSections(t);return e&&e[0]},n.getMediaSections=function(t){var e=n.splitSections(t);return e.shift(),e},n.matchPrefix=function(t,e){return n.splitLines(t).filter(function(t){return 0===t.indexOf(e)})},n.parseCandidate=function(t){var e;e=0===t.indexOf("a=candidate:")?t.substring(12).split(" "):t.substring(10).split(" ");for(var r={foundation:e[0],component:parseInt(e[1],10),protocol:e[2].toLowerCase(),priority:parseInt(e[3],10),ip:e[4],port:parseInt(e[5],10),type:e[7]},n=8;n<e.length;n+=2)switch(e[n]){case"raddr":r.relatedAddress=e[n+1];break;case"rport":r.relatedPort=parseInt(e[n+1],10);break;case"tcptype":r.tcpType=e[n+1];break;case"ufrag":r.ufrag=e[n+1],r.usernameFragment=e[n+1];break;default:r[e[n]]=e[n+1]}return r},n.writeCandidate=function(t){var e=[];e.push(t.foundation),e.push(t.component),e.push(t.protocol.toUpperCase()),e.push(t.priority),e.push(t.ip),e.push(t.port);var r=t.type;return e.push("typ"),e.push(r),"host"!==r&&t.relatedAddress&&t.relatedPort&&(e.push("raddr"),e.push(t.relatedAddress),e.push("rport"),e.push(t.relatedPort)),t.tcpType&&"tcp"===t.protocol.toLowerCase()&&(e.push("tcptype"),e.push(t.tcpType)),(t.usernameFragment||t.ufrag)&&(e.push("ufrag"),e.push(t.usernameFragment||t.ufrag)),"candidate:"+e.join(" ")},n.parseIceOptions=function(t){return t.substr(14).split(" ")},n.parseRtpMap=function(t){var e=t.substr(9).split(" "),r={payloadType:parseInt(e.shift(),10)};return e=e[0].split("/"),r.name=e[0],r.clockRate=parseInt(e[1],10),r.channels=3===e.length?parseInt(e[2],10):1,r.numChannels=r.channels,r},n.writeRtpMap=function(t){var e=t.payloadType;void 0!==t.preferredPayloadType&&(e=t.preferredPayloadType);var r=t.channels||t.numChannels||1;return"a=rtpmap:"+e+" "+t.name+"/"+t.clockRate+(1!==r?"/"+r:"")+"\r\n"},n.parseExtmap=function(t){var e=t.substr(9).split(" ");return{id:parseInt(e[0],10),direction:e[0].indexOf("/")>0?e[0].split("/")[1]:"sendrecv",uri:e[1]}},n.writeExtmap=function(t){return"a=extmap:"+(t.id||t.preferredId)+(t.direction&&"sendrecv"!==t.direction?"/"+t.direction:"")+" "+t.uri+"\r\n"},n.parseFmtp=function(t){for(var e,r={},n=t.substr(t.indexOf(" ")+1).split(";"),i=0;i<n.length;i++)e=n[i].trim().split("="),r[e[0].trim()]=e[1];return r},n.writeFmtp=function(t){var e="",r=t.payloadType;if(void 0!==t.preferredPayloadType&&(r=t.preferredPayloadType),t.parameters&&Object.keys(t.parameters).length){var n=[];Object.keys(t.parameters).forEach(function(e){t.parameters[e]?n.push(e+"="+t.parameters[e]):n.push(e)}),e+="a=fmtp:"+r+" "+n.join(";")+"\r\n"}return e},n.parseRtcpFb=function(t){var e=t.substr(t.indexOf(" ")+1).split(" ");return{type:e.shift(),parameter:e.join(" ")}},n.writeRtcpFb=function(t){var e="",r=t.payloadType;return void 0!==t.preferredPayloadType&&(r=t.preferredPayloadType),t.rtcpFeedback&&t.rtcpFeedback.length&&t.rtcpFeedback.forEach(function(t){e+="a=rtcp-fb:"+r+" "+t.type+(t.parameter&&t.parameter.length?" "+t.parameter:"")+"\r\n"}),e},n.parseSsrcMedia=function(t){var e=t.indexOf(" "),r={ssrc:parseInt(t.substr(7,e-7),10)},n=t.indexOf(":",e);return n>-1?(r.attribute=t.substr(e+1,n-e-1),r.value=t.substr(n+1)):r.attribute=t.substr(e+1),r},n.parseSsrcGroup=function(t){var e=t.substr(13).split(" ");return{semantics:e.shift(),ssrcs:e.map(function(t){return parseInt(t,10)})}},n.getMid=function(t){var e=n.matchPrefix(t,"a=mid:")[0];if(e)return e.substr(6)},n.parseFingerprint=function(t){var e=t.substr(14).split(" ");return{algorithm:e[0].toLowerCase(),value:e[1]}},n.getDtlsParameters=function(t,e){return{role:"auto",fingerprints:n.matchPrefix(t+e,"a=fingerprint:").map(n.parseFingerprint)}},n.writeDtlsParameters=function(t,e){var r="a=setup:"+e+"\r\n";return t.fingerprints.forEach(function(t){r+="a=fingerprint:"+t.algorithm+" "+t.value+"\r\n"}),r},n.getIceParameters=function(t,e){var r=n.splitLines(t);return r=r.concat(n.splitLines(e)),{usernameFragment:r.filter(function(t){return 0===t.indexOf("a=ice-ufrag:")})[0].substr(12),password:r.filter(function(t){return 0===t.indexOf("a=ice-pwd:")})[0].substr(10)}},n.writeIceParameters=function(t){return"a=ice-ufrag:"+t.usernameFragment+"\r\na=ice-pwd:"+t.password+"\r\n"},n.parseRtpParameters=function(t){for(var e={codecs:[],headerExtensions:[],fecMechanisms:[],rtcp:[]},r=n.splitLines(t),i=r[0].split(" "),o=3;o<i.length;o++){var a=i[o],s=n.matchPrefix(t,"a=rtpmap:"+a+" ")[0];if(s){var f=n.parseRtpMap(s),c=n.matchPrefix(t,"a=fmtp:"+a+" ");switch(f.parameters=c.length?n.parseFmtp(c[0]):{},f.rtcpFeedback=n.matchPrefix(t,"a=rtcp-fb:"+a+" ").map(n.parseRtcpFb),e.codecs.push(f),f.name.toUpperCase()){case"RED":case"ULPFEC":e.fecMechanisms.push(f.name.toUpperCase())}}}return n.matchPrefix(t,"a=extmap:").forEach(function(t){e.headerExtensions.push(n.parseExtmap(t))}),e},n.writeRtpDescription=function(t,e){var r="";r+="m="+t+" ",r+=e.codecs.length>0?"9":"0",r+=" UDP/TLS/RTP/SAVPF ",r+=e.codecs.map(function(t){return void 0!==t.preferredPayloadType?t.preferredPayloadType:t.payloadType}).join(" ")+"\r\n",r+="c=IN IP4 0.0.0.0\r\n",r+="a=rtcp:9 IN IP4 0.0.0.0\r\n",e.codecs.forEach(function(t){r+=n.writeRtpMap(t),r+=n.writeFmtp(t),r+=n.writeRtcpFb(t)});var i=0;return e.codecs.forEach(function(t){t.maxptime>i&&(i=t.maxptime)}),i>0&&(r+="a=maxptime:"+i+"\r\n"),r+="a=rtcp-mux\r\n",e.headerExtensions&&e.headerExtensions.forEach(function(t){r+=n.writeExtmap(t)}),r},n.parseRtpEncodingParameters=function(t){var e,r=[],i=n.parseRtpParameters(t),o=-1!==i.fecMechanisms.indexOf("RED"),a=-1!==i.fecMechanisms.indexOf("ULPFEC"),s=n.matchPrefix(t,"a=ssrc:").map(function(t){return n.parseSsrcMedia(t)}).filter(function(t){return"cname"===t.attribute}),f=s.length>0&&s[0].ssrc,c=n.matchPrefix(t,"a=ssrc-group:FID").map(function(t){return t.substr(17).split(" ").map(function(t){return parseInt(t,10)})});c.length>0&&c[0].length>1&&c[0][0]===f&&(e=c[0][1]),i.codecs.forEach(function(t){if("RTX"===t.name.toUpperCase()&&t.parameters.apt){var n={ssrc:f,codecPayloadType:parseInt(t.parameters.apt,10)};f&&e&&(n.rtx={ssrc:e}),r.push(n),o&&(n=JSON.parse(JSON.stringify(n)),n.fec={ssrc:e,mechanism:a?"red+ulpfec":"red"},r.push(n))}}),0===r.length&&f&&r.push({ssrc:f});var u=n.matchPrefix(t,"b=");return u.length&&(u=0===u[0].indexOf("b=TIAS:")?parseInt(u[0].substr(7),10):0===u[0].indexOf("b=AS:")?1e3*parseInt(u[0].substr(5),10)*.95-16e3:void 0,r.forEach(function(t){t.maxBitrate=u})),r},n.parseRtcpParameters=function(t){var e={},r=n.matchPrefix(t,"a=ssrc:").map(function(t){return n.parseSsrcMedia(t)}).filter(function(t){return"cname"===t.attribute})[0];r&&(e.cname=r.value,e.ssrc=r.ssrc);var i=n.matchPrefix(t,"a=rtcp-rsize");e.reducedSize=i.length>0,e.compound=0===i.length;var o=n.matchPrefix(t,"a=rtcp-mux");return e.mux=o.length>0,e},n.parseMsid=function(t){var e,r=n.matchPrefix(t,"a=msid:");if(1===r.length)return e=r[0].substr(7).split(" "),{stream:e[0],track:e[1]};var i=n.matchPrefix(t,"a=ssrc:").map(function(t){return n.parseSsrcMedia(t)}).filter(function(t){return"msid"===t.attribute});return i.length>0?(e=i[0].value.split(" "),{stream:e[0],track:e[1]}):void 0},n.generateSessionId=function(){return Math.random().toString().substr(2,21)},n.writeSessionBoilerplate=function(t,e){var r=void 0!==e?e:2;return"v=0\r\no=thisisadapterortc "+(t||n.generateSessionId())+" "+r+" IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n"},n.writeMediaSection=function(t,e,r,i){var o=n.writeRtpDescription(t.kind,e);if(o+=n.writeIceParameters(t.iceGatherer.getLocalParameters()),o+=n.writeDtlsParameters(t.dtlsTransport.getLocalParameters(),"offer"===r?"actpass":"active"),o+="a=mid:"+t.mid+"\r\n",t.direction?o+="a="+t.direction+"\r\n":t.rtpSender&&t.rtpReceiver?o+="a=sendrecv\r\n":t.rtpSender?o+="a=sendonly\r\n":t.rtpReceiver?o+="a=recvonly\r\n":o+="a=inactive\r\n",t.rtpSender){var a="msid:"+i.id+" "+t.rtpSender.track.id+"\r\n";o+="a="+a,o+="a=ssrc:"+t.sendEncodingParameters[0].ssrc+" "+a,t.sendEncodingParameters[0].rtx&&(o+="a=ssrc:"+t.sendEncodingParameters[0].rtx.ssrc+" "+a,o+="a=ssrc-group:FID "+t.sendEncodingParameters[0].ssrc+" "+t.sendEncodingParameters[0].rtx.ssrc+"\r\n")}
return o+="a=ssrc:"+t.sendEncodingParameters[0].ssrc+" cname:"+n.localCName+"\r\n",t.rtpSender&&t.sendEncodingParameters[0].rtx&&(o+="a=ssrc:"+t.sendEncodingParameters[0].rtx.ssrc+" cname:"+n.localCName+"\r\n"),o},n.getDirection=function(t,e){for(var r=n.splitLines(t),i=0;i<r.length;i++)switch(r[i]){case"a=sendrecv":case"a=sendonly":case"a=recvonly":case"a=inactive":return r[i].substr(2)}return e?n.getDirection(e):"sendrecv"},n.getKind=function(t){return n.splitLines(t)[0].split(" ")[0].substr(2)},n.isRejected=function(t){return"0"===t.split(" ",2)[1]},n.parseMLine=function(t){var e=n.splitLines(t),r=e[0].substr(2).split(" ");return{kind:r[0],port:parseInt(r[1],10),protocol:r[2],fmt:r.slice(3).join(" ")}},n.parseOLine=function(t){var e=n.matchPrefix(t,"o=")[0],r=e.substr(2).split(" ");return{username:r[0],sessionId:r[1],sessionVersion:parseInt(r[2],10),netType:r[3],addressType:r[4],address:r[5]}},n.isValidSDP=function(t){if("string"!=typeof t||0===t.length)return!1;for(var e=n.splitLines(t),r=0;r<e.length;r++)if(e[r].length<2||"="!==e[r].charAt(1))return!1;return!0},"object"==typeof e&&(e.exports=n)},{}],473:[function(t,e,r){function n(t,e){this._block=i.alloc(t),this._finalSize=e,this._blockSize=t,this._len=0}var i=t(471).Buffer;n.prototype.update=function(t,e){"string"==typeof t&&(e=e||"utf8",t=i.from(t,e));for(var r=this._block,n=this._blockSize,o=t.length,a=this._len,s=0;s<o;){for(var f=a%n,c=Math.min(o-s,n-f),u=0;u<c;u++)r[f+u]=t[s+u];a+=c,s+=c,a%n==0&&this._update(r)}return this._len+=o,this},n.prototype.digest=function(t){var e=this._len%this._blockSize;this._block[e]=128,this._block.fill(0,e+1),e>=this._finalSize&&(this._update(this._block),this._block.fill(0));var r=8*this._len;if(r<=4294967295)this._block.writeUInt32BE(r,this._blockSize-4);else{var n=(4294967295&r)>>>0,i=(r-n)/4294967296;this._block.writeUInt32BE(i,this._blockSize-8),this._block.writeUInt32BE(n,this._blockSize-4)}this._update(this._block);var o=this._hash();return t?o.toString(t):o},n.prototype._update=function(){throw new Error("_update must be implemented by subclass")},e.exports=n},{471:471}],474:[function(t,e,r){var r=e.exports=function(t){t=t.toLowerCase();var e=r[t];if(!e)throw new Error(t+" is not supported (we accept pull requests)");return new e};r.sha=t(475),r.sha1=t(476),r.sha224=t(477),r.sha256=t(478),r.sha384=t(479),r.sha512=t(480)},{475:475,476:476,477:477,478:478,479:479,480:480}],475:[function(t,e,r){function n(){this.init(),this._w=h,f.call(this,64,56)}function i(t){return t<<5|t>>>27}function o(t){return t<<30|t>>>2}function a(t,e,r,n){return 0===t?e&r|~e&n:2===t?e&r|e&n|r&n:e^r^n}var s=t(427),f=t(473),c=t(471).Buffer,u=[1518500249,1859775393,-1894007588,-899497514],h=new Array(80);s(n,f),n.prototype.init=function(){return this._a=1732584193,this._b=4023233417,this._c=2562383102,this._d=271733878,this._e=3285377520,this},n.prototype._update=function(t){for(var e=this._w,r=0|this._a,n=0|this._b,s=0|this._c,f=0|this._d,c=0|this._e,h=0;h<16;++h)e[h]=t.readInt32BE(4*h);for(;h<80;++h)e[h]=e[h-3]^e[h-8]^e[h-14]^e[h-16];for(var d=0;d<80;++d){var l=~~(d/20),p=i(r)+a(l,n,s,f)+c+e[d]+u[l]|0;c=f,f=s,s=o(n),n=r,r=p}this._a=r+this._a|0,this._b=n+this._b|0,this._c=s+this._c|0,this._d=f+this._d|0,this._e=c+this._e|0},n.prototype._hash=function(){var t=c.allocUnsafe(20);return t.writeInt32BE(0|this._a,0),t.writeInt32BE(0|this._b,4),t.writeInt32BE(0|this._c,8),t.writeInt32BE(0|this._d,12),t.writeInt32BE(0|this._e,16),t},e.exports=n},{427:427,471:471,473:473}],476:[function(t,e,r){function n(){this.init(),this._w=d,c.call(this,64,56)}function i(t){return t<<1|t>>>31}function o(t){return t<<5|t>>>27}function a(t){return t<<30|t>>>2}function s(t,e,r,n){return 0===t?e&r|~e&n:2===t?e&r|e&n|r&n:e^r^n}var f=t(427),c=t(473),u=t(471).Buffer,h=[1518500249,1859775393,-1894007588,-899497514],d=new Array(80);f(n,c),n.prototype.init=function(){return this._a=1732584193,this._b=4023233417,this._c=2562383102,this._d=271733878,this._e=3285377520,this},n.prototype._update=function(t){for(var e=this._w,r=0|this._a,n=0|this._b,f=0|this._c,c=0|this._d,u=0|this._e,d=0;d<16;++d)e[d]=t.readInt32BE(4*d);for(;d<80;++d)e[d]=i(e[d-3]^e[d-8]^e[d-14]^e[d-16]);for(var l=0;l<80;++l){var p=~~(l/20),b=o(r)+s(p,n,f,c)+u+e[l]+h[p]|0;u=c,c=f,f=a(n),n=r,r=b}this._a=r+this._a|0,this._b=n+this._b|0,this._c=f+this._c|0,this._d=c+this._d|0,this._e=u+this._e|0},n.prototype._hash=function(){var t=u.allocUnsafe(20);return t.writeInt32BE(0|this._a,0),t.writeInt32BE(0|this._b,4),t.writeInt32BE(0|this._c,8),t.writeInt32BE(0|this._d,12),t.writeInt32BE(0|this._e,16),t},e.exports=n},{427:427,471:471,473:473}],477:[function(t,e,r){function n(){this.init(),this._w=f,a.call(this,64,56)}var i=t(427),o=t(478),a=t(473),s=t(471).Buffer,f=new Array(64);i(n,o),n.prototype.init=function(){return this._a=3238371032,this._b=914150663,this._c=812702999,this._d=4144912697,this._e=4290775857,this._f=1750603025,this._g=1694076839,this._h=3204075428,this},n.prototype._hash=function(){var t=s.allocUnsafe(28);return t.writeInt32BE(this._a,0),t.writeInt32BE(this._b,4),t.writeInt32BE(this._c,8),t.writeInt32BE(this._d,12),t.writeInt32BE(this._e,16),t.writeInt32BE(this._f,20),t.writeInt32BE(this._g,24),t},e.exports=n},{427:427,471:471,473:473,478:478}],478:[function(t,e,r){function n(){this.init(),this._w=p,h.call(this,64,56)}function i(t,e,r){return r^t&(e^r)}function o(t,e,r){return t&e|r&(t|e)}function a(t){return(t>>>2|t<<30)^(t>>>13|t<<19)^(t>>>22|t<<10)}function s(t){return(t>>>6|t<<26)^(t>>>11|t<<21)^(t>>>25|t<<7)}function f(t){return(t>>>7|t<<25)^(t>>>18|t<<14)^t>>>3}function c(t){return(t>>>17|t<<15)^(t>>>19|t<<13)^t>>>10}var u=t(427),h=t(473),d=t(471).Buffer,l=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],p=new Array(64);u(n,h),n.prototype.init=function(){return this._a=1779033703,this._b=3144134277,this._c=1013904242,this._d=2773480762,this._e=1359893119,this._f=2600822924,this._g=528734635,this._h=1541459225,this},n.prototype._update=function(t){for(var e=this._w,r=0|this._a,n=0|this._b,u=0|this._c,h=0|this._d,d=0|this._e,p=0|this._f,b=0|this._g,v=0|this._h,y=0;y<16;++y)e[y]=t.readInt32BE(4*y);for(;y<64;++y)e[y]=c(e[y-2])+e[y-7]+f(e[y-15])+e[y-16]|0;for(var g=0;g<64;++g){var m=v+s(d)+i(d,p,b)+l[g]+e[g]|0,w=a(r)+o(r,n,u)|0;v=b,b=p,p=d,d=h+m|0,h=u,u=n,n=r,r=m+w|0}this._a=r+this._a|0,this._b=n+this._b|0,this._c=u+this._c|0,this._d=h+this._d|0,this._e=d+this._e|0,this._f=p+this._f|0,this._g=b+this._g|0,this._h=v+this._h|0},n.prototype._hash=function(){var t=d.allocUnsafe(32);return t.writeInt32BE(this._a,0),t.writeInt32BE(this._b,4),t.writeInt32BE(this._c,8),t.writeInt32BE(this._d,12),t.writeInt32BE(this._e,16),t.writeInt32BE(this._f,20),t.writeInt32BE(this._g,24),t.writeInt32BE(this._h,28),t},e.exports=n},{427:427,471:471,473:473}],479:[function(t,e,r){function n(){this.init(),this._w=f,a.call(this,128,112)}var i=t(427),o=t(480),a=t(473),s=t(471).Buffer,f=new Array(160);i(n,o),n.prototype.init=function(){return this._ah=3418070365,this._bh=1654270250,this._ch=2438529370,this._dh=355462360,this._eh=1731405415,this._fh=2394180231,this._gh=3675008525,this._hh=1203062813,this._al=3238371032,this._bl=914150663,this._cl=812702999,this._dl=4144912697,this._el=4290775857,this._fl=1750603025,this._gl=1694076839,this._hl=3204075428,this},n.prototype._hash=function(){function t(t,r,n){e.writeInt32BE(t,n),e.writeInt32BE(r,n+4)}var e=s.allocUnsafe(48);return t(this._ah,this._al,0),t(this._bh,this._bl,8),t(this._ch,this._cl,16),t(this._dh,this._dl,24),t(this._eh,this._el,32),t(this._fh,this._fl,40),e},e.exports=n},{427:427,471:471,473:473,480:480}],480:[function(t,e,r){function n(){this.init(),this._w=y,p.call(this,128,112)}function i(t,e,r){return r^t&(e^r)}function o(t,e,r){return t&e|r&(t|e)}function a(t,e){return(t>>>28|e<<4)^(e>>>2|t<<30)^(e>>>7|t<<25)}function s(t,e){return(t>>>14|e<<18)^(t>>>18|e<<14)^(e>>>9|t<<23)}function f(t,e){return(t>>>1|e<<31)^(t>>>8|e<<24)^t>>>7}function c(t,e){return(t>>>1|e<<31)^(t>>>8|e<<24)^(t>>>7|e<<25)}function u(t,e){return(t>>>19|e<<13)^(e>>>29|t<<3)^t>>>6}function h(t,e){return(t>>>19|e<<13)^(e>>>29|t<<3)^(t>>>6|e<<26)}function d(t,e){return t>>>0<e>>>0?1:0}var l=t(427),p=t(473),b=t(471).Buffer,v=[1116352408,3609767458,1899447441,602891725,3049323471,3964484399,3921009573,2173295548,961987163,4081628472,1508970993,3053834265,2453635748,2937671579,2870763221,3664609560,3624381080,2734883394,310598401,1164996542,607225278,1323610764,1426881987,3590304994,1925078388,4068182383,2162078206,991336113,2614888103,633803317,3248222580,3479774868,3835390401,2666613458,4022224774,944711139,264347078,2341262773,604807628,2007800933,770255983,1495990901,1249150122,1856431235,1555081692,3175218132,1996064986,2198950837,2554220882,3999719339,2821834349,766784016,2952996808,2566594879,3210313671,3203337956,3336571891,1034457026,3584528711,2466948901,113926993,3758326383,338241895,168717936,666307205,1188179964,773529912,1546045734,1294757372,1522805485,1396182291,2643833823,1695183700,2343527390,1986661051,1014477480,2177026350,1206759142,2456956037,344077627,2730485921,1290863460,2820302411,3158454273,3259730800,3505952657,3345764771,106217008,3516065817,3606008344,3600352804,1432725776,4094571909,1467031594,275423344,851169720,430227734,3100823752,506948616,1363258195,659060556,3750685593,883997877,3785050280,958139571,3318307427,1322822218,3812723403,1537002063,2003034995,1747873779,3602036899,1955562222,1575990012,2024104815,1125592928,2227730452,2716904306,2361852424,442776044,2428436474,593698344,2756734187,3733110249,3204031479,2999351573,3329325298,3815920427,3391569614,3928383900,3515267271,566280711,3940187606,3454069534,4118630271,4000239992,116418474,1914138554,174292421,2731055270,289380356,3203993006,460393269,320620315,685471733,587496836,852142971,1086792851,1017036298,365543100,1126000580,2618297676,1288033470,3409855158,1501505948,4234509866,1607167915,987167468,1816402316,1246189591],y=new Array(160);l(n,p),n.prototype.init=function(){return this._ah=1779033703,this._bh=3144134277,this._ch=1013904242,this._dh=2773480762,this._eh=1359893119,this._fh=2600822924,this._gh=528734635,this._hh=1541459225,this._al=4089235720,this._bl=2227873595,this._cl=4271175723,this._dl=1595750129,this._el=2917565137,this._fl=725511199,this._gl=4215389547,this._hl=327033209,this},n.prototype._update=function(t){for(var e=this._w,r=0|this._ah,n=0|this._bh,l=0|this._ch,p=0|this._dh,b=0|this._eh,y=0|this._fh,g=0|this._gh,m=0|this._hh,w=0|this._al,_=0|this._bl,S=0|this._cl,E=0|this._dl,k=0|this._el,M=0|this._fl,A=0|this._gl,x=0|this._hl,I=0;I<32;I+=2)e[I]=t.readInt32BE(4*I),e[I+1]=t.readInt32BE(4*I+4);for(;I<160;I+=2){var R=e[I-30],B=e[I-30+1],T=f(R,B),P=c(B,R);R=e[I-4],B=e[I-4+1];var C=u(R,B),O=h(B,R),j=e[I-14],N=e[I-14+1],L=e[I-32],D=e[I-32+1],F=P+N|0,U=T+j+d(F,P)|0;F=F+O|0,U=U+C+d(F,O)|0,F=F+D|0,U=U+L+d(F,D)|0,e[I]=U,e[I+1]=F}for(var q=0;q<160;q+=2){U=e[q],F=e[q+1];var z=o(r,n,l),V=o(w,_,S),G=a(r,w),K=a(w,r),W=s(b,k),H=s(k,b),X=v[q],J=v[q+1],Y=i(b,y,g),Z=i(k,M,A),Q=x+H|0,$=m+W+d(Q,x)|0;Q=Q+Z|0,$=$+Y+d(Q,Z)|0,Q=Q+J|0,$=$+X+d(Q,J)|0,Q=Q+F|0,$=$+U+d(Q,F)|0;var tt=K+V|0,et=G+z+d(tt,K)|0;m=g,x=A,g=y,A=M,y=b,M=k,k=E+Q|0,b=p+$+d(k,E)|0,p=l,E=S,l=n,S=_,n=r,_=w,w=Q+tt|0,r=$+et+d(w,Q)|0}this._al=this._al+w|0,this._bl=this._bl+_|0,this._cl=this._cl+S|0,this._dl=this._dl+E|0,this._el=this._el+k|0,this._fl=this._fl+M|0,this._gl=this._gl+A|0,this._hl=this._hl+x|0,this._ah=this._ah+r+d(this._al,w)|0,this._bh=this._bh+n+d(this._bl,_)|0,this._ch=this._ch+l+d(this._cl,S)|0,this._dh=this._dh+p+d(this._dl,E)|0,this._eh=this._eh+b+d(this._el,k)|0,this._fh=this._fh+y+d(this._fl,M)|0,this._gh=this._gh+g+d(this._gl,A)|0,this._hh=this._hh+m+d(this._hl,x)|0},n.prototype._hash=function(){function t(t,r,n){e.writeInt32BE(t,n),e.writeInt32BE(r,n+4)}var e=b.allocUnsafe(64);return t(this._ah,this._al,0),t(this._bh,this._bl,8),t(this._ch,this._cl,16),t(this._dh,this._dl,24),t(this._eh,this._el,32),t(this._fh,this._fl,40),t(this._gh,this._gl,48),t(this._hh,this._hl,56),e},e.exports=n},{427:427,471:471,473:473}],481:[function(t,e,r){function n(){i.call(this)}e.exports=n;var i=t(409).EventEmitter;t(427)(n,i),n.Readable=t(466),n.Writable=t(468),n.Duplex=t(456),n.Transform=t(467),n.PassThrough=t(465),n.Stream=n,n.prototype.pipe=function(t,e){function r(e){t.writable&&!1===t.write(e)&&c.pause&&c.pause()}function n(){c.readable&&c.resume&&c.resume()}function o(){u||(u=!0,t.end())}function a(){u||(u=!0,"function"==typeof t.destroy&&t.destroy())}function s(t){if(f(),0===i.listenerCount(this,"error"))throw t}function f(){c.removeListener("data",r),t.removeListener("drain",n),c.removeListener("end",o),c.removeListener("close",a),c.removeListener("error",s),t.removeListener("error",s),c.removeListener("end",f),c.removeListener("close",f),t.removeListener("close",f)}var c=this;c.on("data",r),t.on("drain",n),t._isStdio||e&&!1===e.end||(c.on("end",o),c.on("close",a));var u=!1;return c.on("error",s),t.on("error",s),c.on("end",f),c.on("close",f),t.on("close",f),t.emit("pipe",c),t}},{409:409,427:427,456:456,465:465,466:466,467:467,468:468}],482:[function(t,e,r){"use strict";function n(t){if(!t)return"utf8";for(var e;;)switch(t){case"utf8":case"utf-8":return"utf8";case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return"utf16le";case"latin1":case"binary":return"latin1";case"base64":case"ascii":case"hex":return t;default:if(e)return;t=(""+t).toLowerCase(),e=!0}}function i(t){var e=n(t);if("string"!=typeof e&&(g.isEncoding===m||!m(t)))throw new Error("Unknown encoding: "+t);return e||t}function o(t){this.encoding=i(t);var e;switch(this.encoding){case"utf16le":this.text=d,this.end=l,e=4;break;case"utf8":this.fillLast=c,e=4;break;case"base64":this.text=p,this.end=b,e=3;break;default:return this.write=v,void(this.end=y)}this.lastNeed=0,this.lastTotal=0,this.lastChar=g.allocUnsafe(e)}function a(t){return t<=127?0:t>>5==6?2:t>>4==14?3:t>>3==30?4:t>>6==2?-1:-2}function s(t,e,r){var n=e.length-1;if(n<r)return 0;var i=a(e[n]);return i>=0?(i>0&&(t.lastNeed=i-1),i):--n<r||-2===i?0:(i=a(e[n]))>=0?(i>0&&(t.lastNeed=i-2),i):--n<r||-2===i?0:(i=a(e[n]),i>=0?(i>0&&(2===i?i=0:t.lastNeed=i-3),i):0)}function f(t,e,r){if(128!=(192&e[0]))return t.lastNeed=0,"�";if(t.lastNeed>1&&e.length>1){if(128!=(192&e[1]))return t.lastNeed=1,"�";if(t.lastNeed>2&&e.length>2&&128!=(192&e[2]))return t.lastNeed=2,"�"}}function c(t){var e=this.lastTotal-this.lastNeed,r=f(this,t,e);return void 0!==r?r:this.lastNeed<=t.length?(t.copy(this.lastChar,e,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal)):(t.copy(this.lastChar,e,0,t.length),void(this.lastNeed-=t.length))}function u(t,e){var r=s(this,t,e);if(!this.lastNeed)return t.toString("utf8",e);this.lastTotal=r;var n=t.length-(r-this.lastNeed);return t.copy(this.lastChar,0,n),t.toString("utf8",e,n)}function h(t){var e=t&&t.length?this.write(t):"";return this.lastNeed?e+"�":e}function d(t,e){if((t.length-e)%2==0){var r=t.toString("utf16le",e);if(r){var n=r.charCodeAt(r.length-1);if(n>=55296&&n<=56319)return this.lastNeed=2,this.lastTotal=4,this.lastChar[0]=t[t.length-2],this.lastChar[1]=t[t.length-1],r.slice(0,-1)}return r}return this.lastNeed=1,this.lastTotal=2,this.lastChar[0]=t[t.length-1],t.toString("utf16le",e,t.length-1)}function l(t){var e=t&&t.length?this.write(t):"";if(this.lastNeed){var r=this.lastTotal-this.lastNeed;return e+this.lastChar.toString("utf16le",0,r)}return e}function p(t,e){var r=(t.length-e)%3;return 0===r?t.toString("base64",e):(this.lastNeed=3-r,this.lastTotal=3,1===r?this.lastChar[0]=t[t.length-1]:(this.lastChar[0]=t[t.length-2],this.lastChar[1]=t[t.length-1]),t.toString("base64",e,t.length-r))}function b(t){var e=t&&t.length?this.write(t):"";return this.lastNeed?e+this.lastChar.toString("base64",0,3-this.lastNeed):e}function v(t){return t.toString(this.encoding)}function y(t){return t&&t.length?this.write(t):""}var g=t(471).Buffer,m=g.isEncoding||function(t){switch((t=""+t)&&t.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return!0;default:return!1}};r.StringDecoder=o,o.prototype.write=function(t){if(0===t.length)return"";var e,r;if(this.lastNeed){if(void 0===(e=this.fillLast(t)))return"";r=this.lastNeed,this.lastNeed=0}else r=0;return r<t.length?e?e+this.text(t,r):this.text(t,r):e||""},o.prototype.end=h,o.prototype.text=u,o.prototype.fillLast=function(t){if(this.lastNeed<=t.length)return t.copy(this.lastChar,this.lastTotal-this.lastNeed,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal);t.copy(this.lastChar,this.lastTotal-this.lastNeed,0,t.length),this.lastNeed-=t.length}},{471:471}],483:[function(t,e,r){(function(e,n){function i(t,e){this._id=t,this._clearFn=e}var o=t(446).nextTick,a=Function.prototype.apply,s=Array.prototype.slice,f={},c=0;r.setTimeout=function(){return new i(a.call(setTimeout,window,arguments),clearTimeout)},r.setInterval=function(){return new i(a.call(setInterval,window,arguments),clearInterval)},r.clearTimeout=r.clearInterval=function(t){t.close()},i.prototype.unref=i.prototype.ref=function(){},i.prototype.close=function(){this._clearFn.call(window,this._id)},r.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},r.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},r._unrefActive=r.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},r.setImmediate="function"==typeof e?e:function(t){var e=c++,n=!(arguments.length<2)&&s.call(arguments,1);return f[e]=!0,o(function(){f[e]&&(n?t.apply(null,n):t.call(null),r.clearImmediate(e))}),e},r.clearImmediate="function"==typeof n?n:function(t){delete f[t]}}).call(this,t(483).setImmediate,t(483).clearImmediate)},{446:446,483:483}],484:[function(t,e,r){(function(t){function r(t,e){function r(){if(!i){if(n("throwDeprecation"))throw new Error(e);n("traceDeprecation"),i=!0}return t.apply(this,arguments)}if(n("noDeprecation"))return t;var i=!1;return r}function n(e){try{if(!t.localStorage)return!1}catch(t){return!1}var r=t.localStorage[e];return null!=r&&"true"===String(r).toLowerCase()}e.exports=r}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],485:[function(_dereq_,module,exports){function Context(){}var indexOf=_dereq_(426),Object_keys=function(t){if(Object.keys)return Object.keys(t);var e=[];for(var r in t)e.push(r);return e},forEach=function(t,e){if(t.forEach)return t.forEach(e);for(var r=0;r<t.length;r++)e(t[r],r,t)},defineProp=function(){try{return Object.defineProperty({},"_",{}),function(t,e,r){Object.defineProperty(t,e,{writable:!0,enumerable:!1,configurable:!0,value:r})}}catch(t){return function(t,e,r){t[e]=r}}}(),globals=["Array","Boolean","Date","Error","EvalError","Function","Infinity","JSON","Math","NaN","Number","Object","RangeError","ReferenceError","RegExp","String","SyntaxError","TypeError","URIError","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","eval","isFinite","isNaN","parseFloat","parseInt","undefined","unescape"];Context.prototype={};var Script=exports.Script=function(t){if(!(this instanceof Script))return new Script(t);this.code=t};Script.prototype.runInContext=function(t){if(!(t instanceof Context))throw new TypeError("needs a 'context' argument.");var e=document.createElement("iframe");e.style||(e.style={}),e.style.display="none",document.body.appendChild(e);var r=e.contentWindow,n=r.eval,i=r.execScript;!n&&i&&(i.call(r,"null"),n=r.eval),forEach(Object_keys(t),function(e){r[e]=t[e]}),forEach(globals,function(e){t[e]&&(r[e]=t[e])});var o=Object_keys(r),a=n.call(r,this.code);return forEach(Object_keys(r),function(e){(e in t||-1===indexOf(o,e))&&(t[e]=r[e])}),forEach(globals,function(e){e in t||defineProp(t,e,r[e])}),document.body.removeChild(e),a},Script.prototype.runInThisContext=function(){return eval(this.code)},Script.prototype.runInNewContext=function(t){var e=Script.createContext(t),r=this.runInContext(e);return forEach(Object_keys(e),function(r){t[r]=e[r]}),r},forEach(Object_keys(Script.prototype),function(t){exports[t]=Script[t]=function(e){var r=Script(e);return r[t].apply(r,[].slice.call(arguments,1))}}),exports.createScript=function(t){return exports.Script(t)},exports.createContext=Script.createContext=function(t){var e=new Context;return"object"==typeof t&&forEach(Object_keys(t),function(r){e[r]=t[r]}),e}},{426:426}],486:[function(t,e,r){var n=arguments[3],i=arguments[4],o=arguments[5],a=JSON.stringify;e.exports=function(t,e){function r(t){v[t]=!0;for(var e in i[t][1]){var n=i[t][1][e];v[n]||r(n)}}for(var s,f=Object.keys(o),c=0,u=f.length;c<u;c++){var h=f[c],d=o[h].exports;if(d===t||d&&d.default===t){s=h;break}}if(!s){s=Math.floor(Math.pow(16,8)*Math.random()).toString(16);for(var l={},c=0,u=f.length;c<u;c++){var h=f[c];l[h]=h}i[s]=["function(require,module,exports){"+t+"(self); }",l]}var p=Math.floor(Math.pow(16,8)*Math.random()).toString(16),b={};b[s]=s,i[p]=["function(require,module,exports){var f = require("+a(s)+");(f.default ? f.default : f)(self);}",b];var v={};r(p);var y="("+n+")({"+Object.keys(v).map(function(t){return a(t)+":["+i[t][0]+","+a(i[t][1])+"]"}).join(",")+"},{},["+a(p)+"])",g=window.URL||window.webkitURL||window.mozURL||window.msURL,m=new Blob([y],{type:"text/javascript"});if(e&&e.bare)return m;var w=g.createObjectURL(m),_=new Worker(w);return _.objectURL=w,_}},{}],487:[function(t,e,r){"use strict";Object.defineProperty(r,"__esModule",{value:!0});r.ErrorTypes={NETWORK_ERROR:"networkError",MEDIA_ERROR:"mediaError",MUX_ERROR:"muxError",BUFFER_ERROR:"bufferError",OTHER_ERROR:"otherError"},r.ErrorDetails={FRAG_PARSING_ERROR:"fragParsingError",REMUX_ALLOC_ERROR:"remuxAllocError",BUFFER_ADD_CODEC_ERROR:"bufferAddCodecError",BUFFER_APPEND_ERROR:"bufferAppendError",BUFFER_APPENDING_ERROR:"bufferAppendingError",INTERNAL_EXCEPTION:"internalException"}},{}],488:[function(t,e,r){"use strict";e.exports={TRANSPORT_CONNECTED:"transportConnected",TRANSPORT_DISCONNECTED:"transportDisconnected",FRAG_LOADED:"fragLoaded",FRAG_PARSING_INIT_SEGMENT:"fragParsingInitSegment",FRAG_PARSING_DATA:"fragParsingData",INIT_PTS_FOUND:"initPtsFound",FRAG_PARSED:"fragParsed",TS_RESET:"tsReset",ERROR:"providerError"}},{}],489:[function(t,e,r){"use strict";e.exports=t(499).default},{499:499}],490:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0});var i=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),o=function(){function t(){n(this,t)}return i(t,null,[{key:"getSilentFrame",value:function(t,e){switch(t){case"mp4a.40.2":if(1===e)return new Uint8Array([0,200,0,128,35,128]);if(2===e)return new Uint8Array([33,0,73,144,2,25,0,35,128]);if(3===e)return new Uint8Array([0,200,0,128,32,132,1,38,64,8,100,0,142]);if(4===e)return new Uint8Array([0,200,0,128,32,132,1,38,64,8,100,0,128,44,128,8,2,56]);if(5===e)return new Uint8Array([0,200,0,128,32,132,1,38,64,8,100,0,130,48,4,153,0,33,144,2,56]);if(6===e)return new Uint8Array([0,200,0,128,32,132,1,38,64,8,100,0,130,48,4,153,0,33,144,2,0,178,0,32,8,224]);break;default:if(1===e)return new Uint8Array([1,64,34,128,163,78,230,128,186,8,0,0,0,28,6,241,193,10,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,94]);if(2===e)return new Uint8Array([1,64,34,128,163,94,230,128,186,8,0,0,0,0,149,0,6,241,161,10,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,94]);if(3===e)return new Uint8Array([1,64,34,128,163,94,230,128,186,8,0,0,0,0,149,0,6,241,161,10,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,94])}return null}}]),t}();r.default=o},{}],491:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0}),r.AACParser=void 0;var i=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),o=t(502);r.AACParser=function(){function t(){n(this,t)}return i(t,null,[{key:"parseAudioSpecificConfig",value:function(e){var r=void 0;r=e.byteLength?new o.BitArray(e):e;var n=r.bitpos+8*(r.src.byteOffset+r.bytepos),i=r.readBits(5);this.codec="mp4a.40."+i;var a=r.readBits(4);15==a&&r.skipBits(24);var s=r.readBits(4);return{config:(0,o.bitSlice)(new Uint8Array(r.src.buffer),n,n+16),codec:"mp4a.40."+i,samplerate:t.SampleRates[a],channels:s}}},{key:"parseStreamMuxConfig",value:function(e){var r=new o.BitArray(e);if(!r.readBits(1))return r.skipBits(14),t.parseAudioSpecificConfig(r)}},{key:"SampleRates",get:function(){return[96e3,88200,64e3,48e3,44100,32e3,24e3,22050,16e3,12e3,11025,8e3,7350]}}]),t}()},{502:502}],492:[function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0});var o=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),a=t(503),s=n(a),f=t(504),c=n(f),u=t(497),h=n(u),d=t(493),l=n(d),p=t(491),b=t(505),v=t(488),y=n(v),g=t(1),m=function(){function t(e,r){i(this,t),this.observer=e,this.remuxer=new h.default(e,{}),this.audioConfig=t.defaultAACConfig(),this.sps=[],this.pps=[],this.lengthHeaderSize=4,this.hasAudio=!0,this.hasVideo=!0,this.videoTs=0,this.avBuffer=null,this.config=r,this.tracks={audio:{samples:[],container:"video/mp2t",dropped:0,sequenceNumber:0,id:0,inputTimeScale:1e3,len:0,type:"audio"},video:{samples:[],container:"video/mp2t",dropped:0,sequenceNumber:0,id:0,inputTimeScale:1e3,type:"video"},id3:{samples:[]},text:{samples:[]}}}return o(t,[{key:"setAvailableMedia",value:function(t,e){b.logger.log("Set available media, audio "+t+" video "+e),this.hasAudio=t,this.hasVideo=e}},{key:"onData",value:function(t){null==this.avBuffer&&(this.avBuffer=new _({hasAudio:this.hasAudio,hasVideo:this.hasVideo,fragmentLengthMs:this.config.fragmentLengthMs,cutByIFrameOnly:this.config.cutByIFrameOnly}));var e,r=new s.default(t),n=r.readByte(),i=r.readInt(),o=r.readInt();9==n?(e=this.onVideo(r,o,i))&&this.avBuffer.pushVideo(e):8==n&&(e=this.onAudio(r,o,i))&&this.avBuffer.pushAudio(e),this.flush()}},{key:"onVideo",value:function(e,r,n){var i=e.readByte();switch(0==this.videoTs&&(this.videoTs=n),Math.abs(n-this.videoTs)>5e3?(b.logger.log("Video ts drop "+(n-this.videoTs)),this.avBuffer.flush(),this.remuxer.resetInitSegment(),this.videoTs=0,this.observer.trigger(y.default.TS_RESET)):n<this.videoTs&&b.logger.warn("Non monotonic video ts "+this.videoTs+" -> "+n),this.videoTs=n,i){case 23:var o=e.readByte();if(0==o){e.skipBytes(3);var a=(e.readByte(),e.sliceAsUint8Array(e.readerIndex(),3));a[0],a[1],a[2];this.tracks.video.codec="avc1."+c.default.hexDump(a).toUpperCase(),this.lengthHeaderSize=1+(3&e.readByte());for(var s=31&e.readByte(),f=[],u=0;u<s;u++)f.push(t.readNalFromAVCCFormat(e,2));for(var h=31&e.readByte(),d=[],l=0;l<h;l++)d.push(t.readNalFromAVCCFormat(e,2));this.onVideoConfig(f,d,n)}else if(1==o){e.skipBytes(3);var p=t.readNalus(e,this.lengthHeaderSize);if(p)return new w(p,!0,n,n)}else b.logger.warn("Unknown inner type "+o);break;case 39:e.skipBytes(4);var v=t.readNalus(e,this.lengthHeaderSize);if(v)return new w(v,!1,n,n);break;default:b.logger.warn("Unknown AVC type "+i)}}},{key:"onAudio",value:function(t,e,r){if(0!=t.readByte())return{unit:t.sliceAsUint8Array(t.readerIndex(),e-1),pts:r,dts:r};for(var n=t.sliceAsUint8Array(t.readerIndex(),e-1),i=p.AACParser.parseAudioSpecificConfig(n),o=[],a=0;a<i.config.byteLength;a++)o[a]=i.config[a];i.config=o,this.onAudioConfig(i)}},{key:"onAudioConfig",value:function(t){this.audioConfig=t,this.tracks.audio.codec=t.codec,this.tracks.audio.channelCount=t.channels,this.tracks.audio.config=t.config,this.tracks.audio.channelCount=t.channels,this.tracks.audio.timescale=t.samplerate,this.tracks.audio.samplerate=t.samplerate,this.tracks.audio.isAAC=!0}},{key:"onVideoConfig",value:function(t,e,r){this.avBuffer.onVideoConfig({sps:t,pps:e},r)}},{key:"flush",value:function(){for(var t=this.avBuffer.getFragments();t.length>0;){var e=t.shift();if(e.configChanged){var r=new l.default(e.config.video.sps[0]),n=r.readSPS();this.tracks.video.width==n.width&&this.tracks.video.height==n.height||(b.logger.log("Video resolution changed "+this.tracks.video.width+"x"+this.tracks.video.height+" => "+n.width+"x"+n.height),this.remuxer.resetInitSegment())}if(e.audio.length>0){for(var i=this.tracks.audio,o=e.audio,a=this.audioConfig,s=0,f=0;f<o.length;f++)s+=o[f].unit.byteLength;i.samples=o,i.duration=(o[o.length-1].pts-o[0].pts)/1e3,i.codec=a.codec,i.config=a.config,i.channelCount=a.channels,i.samplerate=a.samplerate,i.isAAC=!0,i.len=s,i.sequenceNumber++,b.logger.log("audio: duration "+this.tracks.audio.duration+", startPts "+this.tracks.audio.samples[0].pts+" endPts "+this.tracks.audio.samples[this.tracks.audio.samples.length-1].pts)}if(e.video.length>0){if(!e.config.video)continue;var c=this.tracks.video,u=e.video,h=new l.default(e.config.video.sps[0]),d=h.readSPS();c.samples=u,c.duration=(u[u.length-1].pts-u[0].pts)/1e3,c.width=d.width,c.height=d.height,c.pixelRatio=d.pixelRatio,c.pps=e.config.video.pps,c.sps=e.config.video.sps,c.sequenceNumber++,b.logger.log("video: duration "+this.tracks.video.duration+", startPts "+this.tracks.video.samples[0].pts+" endPts "+this.tracks.video.samples[this.tracks.video.samples.length-1].pts+" samples "+u.length)}e.audio.length>0&&e.video.length>0?this.tracks.video.duration=this.tracks.audio.duration:e.video.length>0&&0==e.audio.length&&(this.tracks.audio.duration=this.tracks.video.duration),this.remuxer.remux(this.tracks.audio,this.tracks.video,this.tracks.id3,this.tracks.text,0)}}}],[{key:"buffered",value:function(t){if(t.length>1){var e=t[0];return t[t.length-1].pts-e.pts}return 0}},{key:"readNalFromAVCCFormat",value:function(t,e){if(t.readableBytes()>e){var r=0;switch(e){case 2:r=t.readShort();break;case 4:r=t.readInt()}return t.readableBytes()<r?void b.logger.error("Length bigger then buffer "+t.readableBytes()+" "+r):t.sliceAsUint8Array(t.readerIndex(),r)}}},{key:"readNalus",value:function(e,r){for(var n=[];e.readableBytes()>0;){var i=t.readNalFromAVCCFormat(e,r);if(void 0!==i)n.push({data:i,type:31&i[0]});else if(e.readableBytes()>0)return void b.logger.warn("Failed to read nal")}if(n.length>0)return n}},{key:"defaultAACConfig",value:function(){var t=new Uint8Array(new ArrayBuffer(4));t[0]=17,t[1]=144,t[2]=86,t[3]=229,t[4]=0;for(var e=p.AACParser.parseAudioSpecificConfig(t),r=[],n=0;n<e.config.byteLength;n++)r[n]=e.config[n];return e.config=r,e}}]),t}();r.default=m
;var w=function t(e,r,n,o){i(this,t),this.pts=n,this.dts=o,this.units=e,this.key=r,this.frame=!0,this.id=0,this.length=0;var a=!0,s=!1,f=void 0;try{for(var c,u=e[Symbol.iterator]();!(a=(c=u.next()).done);a=!0){var h=c.value;this.length+=h.data.length}}catch(t){s=!0,f=t}finally{try{!a&&u.return&&u.return()}finally{if(s)throw f}}},_=function(){function t(e){i(this,t),this.hasAudio=e.hasAudio,this.hasVideo=e.hasVideo,this.fragmentLengthMs=e.fragmentLengthMs,this.mediaConfig={audio:null,video:null},this.video=[],this.audio=[],this.aligned=!1,this.cutByIFrameOnly=e.cutByIFrameOnly}return o(t,[{key:"pushAudio",value:function(t){this.audio.push(t)}},{key:"pushVideo",value:function(t){if(this.video.length>0){var e=this.video[this.video.length-1];e.duration=t.pts-e.pts}this.video.push(t)}},{key:"onAudioConfig",value:function(t){this.mediaConfig.audio=t}},{key:"onVideoConfig",value:function(t,e){var r={key:"config",pts:e,config:t,duration:-1};this.pushVideo(r)}},{key:"flush",value:function(){return this.aligned=!1,{audio:this.flushAudio(),video:this.flushVideo()}}},{key:"flushAudio",value:function(){if(this.hasAudio)return this.cut(this.audio.length,-1)}},{key:"flushVideo",value:function(){if(this.hasVideo)return this.cut(-1,this.video.length)}},{key:"getFragments",value:function(){for(var t=[];this.bufferedEnough();)if(this.hasAudio&&!this.hasVideo)t.push(this.cut(this.audio.length,-1));else if(!this.hasAudio&&this.hasVideo){var e=void 0,r=this.fragmentByIFrame();if(void 0!==r)e=this.cut(-1,r.index-1);else{if(this.cutByIFrameOnly)break;e=this.cut(-1,this.video.length)}t.push(e)}else{if(!this.aligned){var n=this.alignBufferBeforeStartup();n&&t.push(n);break}var i=this.fragmentByIFrame();if(void 0!==i){var o=i.index-1,a=(this.video[o].pts,this.findIndex(this.audio,i.pts-20,1/0)),s=a?this.audio[a].pts:-1;if(!(s>-1)){b.logger.log("Failed to fragment at: v "+o+" a "+a);break}t.push(this.cut(a,o)),b.logger.log("Fragment by iframe")}else{if(this.cutByIFrameOnly)break;var f=this.findSyncPoint(this.video.length);if(!f)break;t.push(f)}}return t}},{key:"alignBufferBeforeStartup",value:function(){if(!this.aligned){var t=this.findIFrame(0);if(t<0)return void b.logger.warn("IFrame missing on startup");var e=this.video[t].pts,r=this.findIndex(this.audio,e,e+50);if(void 0==r){if(!(this.audio.length>0&&this.audio[this.audio.length-1].pts>e))return void b.logger.log("not enough audio");r=0}else b.logger.log("aindex "+r);var n=this.audio[r].pts,i=e-n;if(i<-100){b.logger.log("align buffer missing audio "+-i);var o=this.findIndex(this.video,n-20,n);return this.aligned=!0,this.cut(-1,o)}i>100?(b.logger.log("align buffer missing video "+i),this.cut(r,-1),b.logger.log("Buffer aligned, dropped a:"+r+" v:"+t+"apts "+this.audio[r].pts+" vpts "+e)):(b.logger.log("audio pts / video pts "+this.audio[r].pts+"/"+e),this.cut(r-1,t-1),b.logger.log("stream aligned")),this.aligned=!0}}},{key:"findSyncPoint",value:function(t){for(var e=this.findIndex(this.video,this.video[0].pts+this.fragmentLengthMs,1/0),r=1,n=void 0;e<t;e++)if(!(e<3)){for(var i=this.video[e].pts;r<this.audio.length;){if(!(this.audio[r].pts<i)){this.audio[r]-i>i-this.audio[r-1]&&r--;break}r++}if(!this.audio[r])break;var o=this.audio[r].pts;if(e>=this.video.length-2)r--;else if(!(this.video[e].duration>2*this.video[e-1].duration||this.video[e].duration>2*this.video[e+1].duration)){if(Math.abs(i-o)<100){n=this.cut(r,e);break}r--}}return n}},{key:"cut",value:function(t,e){t>-1&&t++,e>-1&&e++;var r=this.audio.splice(0,t),n=this.video.splice(0,e),i=!1;if(n[0]&&"config"==n[0].key){var o=n.shift();if(this.mediaConfig.video){var a=this.mediaConfig.video.sps[0],s=o.config.sps[0];g(a.buffer,s.buffer)||(i=!0,this.mediaConfig.video=o.config)}else this.mediaConfig.video=o.config}return this.cutByIFrameOnly&&r[0]&&n[0]&&(n[n.length-1].pts=r[r.length-1].pts),{audio:r,video:n,config:this.mediaConfig,configChanged:i}}},{key:"fragmentByIFrame",value:function(){var t=this.findIFrame(1);if(t>0)return{index:t,pts:this.video[t].pts}}},{key:"findIFrame",value:function(t){for(var e=t;e<this.video.length;e++)if("config"==this.video[e].key)return e;return-1}},{key:"findIndex",value:function(t,e,r){for(var n=0;n<t.length;n++){var i=t[n].pts;if(i>=e&&i<=r)return n;if(i>r)break}}},{key:"bufferedEnough",value:function(){var t=!this.hasAudio||this.buffered(this.audio)>=this.fragmentLengthMs,e=!this.hasVideo||this.buffered(this.video)>=this.fragmentLengthMs&&this.video.length>2;return t&&e}},{key:"buffered",value:function(t){if(t.length>1){var e=t[0];return t[t.length-1].pts-e.pts}return 0}}]),t}()},{1:1,488:488,491:491,493:493,497:497,503:503,504:504,505:505}],493:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0});var i=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),o=t(505),a=function(){function t(e){n(this,t),this.data=e,this.bytesAvailable=e.byteLength,this.word=0,this.bitsAvailable=0}return i(t,[{key:"loadWord",value:function(){var t=this.data,e=this.bytesAvailable,r=t.byteLength-e,n=new Uint8Array(4),i=Math.min(4,e);if(0===i)throw new Error("no bytes available");n.set(t.subarray(r,r+i)),this.word=new DataView(n.buffer).getUint32(0),this.bitsAvailable=8*i,this.bytesAvailable-=i}},{key:"skipBits",value:function(t){var e;this.bitsAvailable>t?(this.word<<=t,this.bitsAvailable-=t):(t-=this.bitsAvailable,e=t>>3,t-=e>>3,this.bytesAvailable-=e,this.loadWord(),this.word<<=t,this.bitsAvailable-=t)}},{key:"readBits",value:function(t){var e=Math.min(this.bitsAvailable,t),r=this.word>>>32-e;return t>32&&o.logger.error("Cannot read more than 32 bits at a time"),this.bitsAvailable-=e,this.bitsAvailable>0?this.word<<=e:this.bytesAvailable>0&&this.loadWord(),e=t-e,e>0&&this.bitsAvailable?r<<e|this.readBits(e):r}},{key:"skipLZ",value:function(){var t;for(t=0;t<this.bitsAvailable;++t)if(0!=(this.word&2147483648>>>t))return this.word<<=t,this.bitsAvailable-=t,t;return this.loadWord(),t+this.skipLZ()}},{key:"skipUEG",value:function(){this.skipBits(1+this.skipLZ())}},{key:"skipEG",value:function(){this.skipBits(1+this.skipLZ())}},{key:"readUEG",value:function(){var t=this.skipLZ();return this.readBits(t+1)-1}},{key:"readEG",value:function(){var t=this.readUEG();return 1&t?1+t>>>1:-1*(t>>>1)}},{key:"readBoolean",value:function(){return 1===this.readBits(1)}},{key:"readUByte",value:function(){return this.readBits(8)}},{key:"readUShort",value:function(){return this.readBits(16)}},{key:"readUInt",value:function(){return this.readBits(32)}},{key:"skipScalingList",value:function(t){var e,r,n=8,i=8;for(e=0;e<t;e++)0!==i&&(r=this.readEG(),i=(n+r+256)%256),n=0===i?n:i}},{key:"readSPS",value:function(){var t,e,r,n,i,o,a,s=0,f=0,c=0,u=0,h=this.readUByte.bind(this),d=this.readBits.bind(this),l=this.readUEG.bind(this),p=this.readBoolean.bind(this),b=this.skipBits.bind(this),v=this.skipEG.bind(this),y=this.skipUEG.bind(this),g=this.skipScalingList.bind(this);if(h(),t=h(),d(5),b(3),h(),y(),100===t||110===t||122===t||244===t||44===t||83===t||86===t||118===t||128===t){var m=l();if(3===m&&b(1),y(),y(),b(1),p())for(o=3!==m?8:12,a=0;a<o;a++)p()&&g(a<6?16:64)}y();var w=l();if(0===w)l();else if(1===w)for(b(1),v(),v(),e=l(),a=0;a<e;a++)v();y(),b(1),r=l(),n=l(),i=d(1),0===i&&b(1),b(1),p()&&(s=l(),f=l(),c=l(),u=l());var _=[1,1];if(p()&&p()){switch(h()){case 1:_=[1,1];break;case 2:_=[12,11];break;case 3:_=[10,11];break;case 4:_=[16,11];break;case 5:_=[40,33];break;case 6:_=[24,11];break;case 7:_=[20,11];break;case 8:_=[32,11];break;case 9:_=[80,33];break;case 10:_=[18,11];break;case 11:_=[15,11];break;case 12:_=[64,33];break;case 13:_=[160,99];break;case 14:_=[4,3];break;case 15:_=[3,2];break;case 16:_=[2,1];break;case 255:_=[h()<<8|h(),h()<<8|h()]}}return{width:Math.ceil(16*(r+1)-2*s-2*f),height:(2-i)*(n+1)*16-(i?2:4)*(c+u),pixelRatio:_}}},{key:"readSliceType",value:function(){return this.readUByte(),this.readUEG(),this.readUEG()}}]),t}();r.default=a},{505:505}],494:[function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0});var o=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),a=t(495),s=n(a),f=t(492),c=n(f),u=t(498),h=n(u),d=t(501),l=n(d),p=t(500),b=t(488),v=n(b),y=t(409),g=n(y),m=t(505),w=t(447),_=t(434),S=function(){function e(r){i(this,e);var n=this.observer=new g.default;n.trigger=function(t){for(var e=arguments.length,r=Array(e>1?e-1:0),i=1;i<e;i++)r[i-1]=arguments[i];n.emit.apply(n,[t].concat(r))},n.off=function(t){for(var e=arguments.length,r=Array(e>1?e-1:0),i=1;i<e;i++)r[i-1]=arguments[i];n.removeListener.apply(n,[t].concat(r))},this.on=n.on.bind(n),this.off=n.off.bind(n),this.trigger=n.trigger.bind(n);try{(0,m.enableLogs)(!0===r.debug)}catch(t){}if(r.enableWorker&&"undefined"!=typeof Worker){m.logger.log("using webworker");var o=void 0;try{var a=t(486);o=this.w=a(s.default),this.onwmsg=this.onWorkerMessage.bind(this),o.addEventListener("message",this.onwmsg),o.onerror=function(t){this.trigger(v.default.ERROR,{type:"worker",info:t.message+" ("+t.filename+":"+t.lineno+")"})},o.postMessage({cmd:"init",config:JSON.stringify(r)})}catch(t){m.logger.error("error while initializing DemuxerWorker, fallback on DemuxerInline"),o&&URL.revokeObjectURL(o.objectURL)}}else this.demuxer=new c.default(this,r.connectionConstraints),r.useFileLoader?this.transport=new p.MediaFileReader(this,r,this.demuxer):this.transport=new l.default(this,r,this.demuxer);this.id=r.id,this.display=r.display,this.video=e.getCacheInstance(this.display),this.video||(this.video=document.createElement("video"),this.display.appendChild(this.video)),this.video.id=this.id,this.mse=new h.default(this,this.video),this.on(v.default.TS_RESET,function(t){m.logger.warn("TS_RESET"),this.mse.release(),this.mse=new h.default(this,this.video)}.bind(this)),this.on(v.default.ERROR,function(t){m.logger.error("Error "+t.type+" info "+t.info),this.close()}.bind(this))}return o(e,[{key:"createOffer",value:function(t){return w.resolve({sdp:"v=0\r\no=- 1988962254 1988962254 IN IP4 0.0.0.0\r\nc=IN IP4 0.0.0.0\r\nt=0 0\r\na=sdplang:en\r\nm=video 0 RTP/AVP 112\r\na=rtpmap:112 H264/90000\r\na=fmtp:112 packetization-mode=1; profile-level-id=420020\r\na=recvonly\r\nm=audio 0 RTP/AVP 108 96 97 98 99 100 102 103 104\r\na=rtpmap:108 mpeg4-generic/48000/1\r\na=rtpmap:96 mpeg4-generic/8000/1\r\na=rtpmap:97 mpeg4-generic/11025/1\r\na=rtpmap:98 mpeg4-generic/12000/1\r\na=rtpmap:99 mpeg4-generic/16000/1\r\na=rtpmap:100 mpeg4-generic/22050/1\r\na=rtpmap:104 mpeg4-generic/24000/1\r\na=rtpmap:102 mpeg4-generic/32000/1\r\na=rtpmap:103 mpeg4-generic/44100/1\r\na=recvonly\r\n"})}},{key:"setRemoteSdp",value:function(e){for(var r=t(472),n=!0,i=!0,o=r.splitSections(e),a=0;a<o.length;a++)if(r.isRejected(o[a]))switch(r.getKind(o[a])){case"audio":n=!1;break;case"video":i=!1}return this.w?this.w.postMessage({cmd:"connect",config:JSON.stringify({audio:n,video:i})}):(this.demuxer.setAvailableMedia(n,i),this.transport.connect()),w.resolve()}},{key:"close",value:function(){this.w&&(this.w.postMessage({cmd:"close"}),this.w.removeEventListener("message",this.onwmsg),this.w.terminate(),this.w=null),this.transport&&this.transport.disconnect(),this.mse.release(),this.video.src=null,this.video.id=this.video.id+"-REMOTE_CACHED_VIDEO"}},{key:"setVolume",value:function(t){this.video&&(this.video.volume=t/100)}},{key:"getVolume",value:function(){return this.video?100*this.video.volume:-1}},{key:"fullScreen",value:function(){var t=this.video;t&&(document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement||document.msFullscreenElement?document.exitFullscreen?document.exitFullscreen():document.msExitFullscreen?document.msExitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitExitFullscreen&&document.webkitExitFullscreen():t.requestFullscreen?t.requestFullscreen():t.msRequestFullscreen?t.msRequestFullscreen():t.mozRequestFullScreen?t.mozRequestFullScreen():t.webkitRequestFullscreen&&t.webkitRequestFullscreen())}},{key:"onWorkerMessage",value:function(t){var e=t.data;switch(e.event){case"init":URL.revokeObjectURL(this.w.objectURL);break;case v.default.FRAG_PARSING_DATA:e.data.data1=new Uint8Array(e.data1),e.data2&&(e.data.data2=new Uint8Array(e.data2));default:e.data=e.data||{},e.data.frag=this.frag,e.data.id=this.id,this.trigger(e.event,e.data)}}}],[{key:"getCacheInstance",value:function(t){var e=void 0;for(e=0;e<t.children.length;e++)if(t.children[e]&&(-1!=t.children[e].id.indexOf("-LOCAL_CACHED_VIDEO")||-1!=t.children[e].id.indexOf("-REMOTE_CACHED_VIDEO")))return t.children[e]}},{key:"playFirstVideo",value:function(t,e,r){if(!this.getCacheInstance(t)){var n=document.createElement("video");n.setAttribute("playsinline",""),n.setAttribute("webkit-playsinline",""),t.appendChild(n),n.id=_.v1()+(e?"-LOCAL_CACHED_VIDEO":"-REMOTE_CACHED_VIDEO"),n.src=r||"../../dependencies/media/preloader.mp4",n.play()}}}]),e}();r.default=S},{409:409,434:434,447:447,472:472,486:486,488:488,492:492,495:495,498:498,500:500,501:501,505:505}],495:[function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(r,"__esModule",{value:!0}),t(16);var i=t(492),o=n(i),a=t(501),s=n(a),f=t(488),c=n(f),u=t(409),h=n(u),d=t(505),l=function(t){var e=new h.default;e.trigger=function(t){for(var r=arguments.length,n=Array(r>1?r-1:0),i=1;i<r;i++)n[i-1]=arguments[i];e.emit.apply(e,[t,t].concat(n))},e.off=function(t){for(var r=arguments.length,n=Array(r>1?r-1:0),i=1;i<r;i++)n[i-1]=arguments[i];e.removeListener.apply(e,[t].concat(n))};var r=function(e,r){t.postMessage({event:e,data:r})};t.addEventListener("message",function(n){var i=n.data;switch(i.cmd){case"init":var a=JSON.parse(i.config);t.demuxer=new o.default(e,a.connectionConstraints),t.transport=new s.default(e,a,t.demuxer);try{(0,d.enableLogs)(!0===a.debug)}catch(t){}r("init",null);break;case"connect":var f=JSON.parse(i.config);t.demuxer.setAvailableMedia(f.audio,f.video),t.transport.connect();break;case"close":t.transport.disconnect()}}),e.on(c.default.FRAG_PARSING_INIT_SEGMENT,r),e.on(c.default.FRAG_PARSED,r),e.on(c.default.ERROR,r),e.on(c.default.INIT_PTS_FOUND,r),e.on(c.default.TS_RESET,r),e.on(c.default.FRAG_PARSING_DATA,function(e,r){var n=[],i={event:e,data:r};r.data1&&(i.data1=r.data1.buffer,n.push(r.data1.buffer),delete r.data1),r.data2&&(i.data2=r.data2.buffer,n.push(r.data2.buffer),delete r.data2),t.postMessage(i,n)})};r.default=l},{16:16,409:409,488:488,492:492,501:501,505:505}],496:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0});var i=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),o=Math.pow(2,32)-1,a=function(){function t(){n(this,t)}return i(t,null,[{key:"init",value:function(){t.types={avc1:[],avcC:[],btrt:[],dinf:[],dref:[],esds:[],ftyp:[],hdlr:[],mdat:[],mdhd:[],mdia:[],mfhd:[],minf:[],moof:[],moov:[],mp4a:[],".mp3":[],mvex:[],mvhd:[],pasp:[],sdtp:[],stbl:[],stco:[],stsc:[],stsd:[],stsz:[],stts:[],tfdt:[],tfhd:[],traf:[],trak:[],trun:[],trex:[],tkhd:[],vmhd:[],smhd:[]};var e;for(e in t.types)t.types.hasOwnProperty(e)&&(t.types[e]=[e.charCodeAt(0),e.charCodeAt(1),e.charCodeAt(2),e.charCodeAt(3)]);var r=new Uint8Array([0,0,0,0,0,0,0,0,118,105,100,101,0,0,0,0,0,0,0,0,0,0,0,0,86,105,100,101,111,72,97,110,100,108,101,114,0]),n=new Uint8Array([0,0,0,0,0,0,0,0,115,111,117,110,0,0,0,0,0,0,0,0,0,0,0,0,83,111,117,110,100,72,97,110,100,108,101,114,0]);t.HDLR_TYPES={video:r,audio:n};var i=new Uint8Array([0,0,0,0,0,0,0,1,0,0,0,12,117,114,108,32,0,0,0,1]),o=new Uint8Array([0,0,0,0,0,0,0,0]);t.STTS=t.STSC=t.STCO=o,t.STSZ=new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0]),t.VMHD=new Uint8Array([0,0,0,1,0,0,0,0,0,0,0,0]),t.SMHD=new Uint8Array([0,0,0,0,0,0,0,0]),t.STSD=new Uint8Array([0,0,0,0,0,0,0,1]);var a=new Uint8Array([105,115,111,109]),s=new Uint8Array([97,118,99,49]),f=new Uint8Array([0,0,0,1]);t.FTYP=t.box(t.types.ftyp,a,f,a,s),t.DINF=t.box(t.types.dinf,t.box(t.types.dref,i))}},{key:"box",value:function(t){for(var e,r=Array.prototype.slice.call(arguments,1),n=8,i=r.length,o=i;i--;)n+=r[i].byteLength;for(e=new Uint8Array(n),e[0]=n>>24&255,e[1]=n>>16&255,e[2]=n>>8&255,e[3]=255&n,e.set(t,4),i=0,n=8;i<o;i++)e.set(r[i],n),n+=r[i].byteLength;return e}},{key:"hdlr",value:function(e){return t.box(t.types.hdlr,t.HDLR_TYPES[e])}},{key:"mdat",value:function(e){return t.box(t.types.mdat,e)}},{key:"mdhd",value:function(e,r){r*=e;var n=Math.floor(r/(o+1)),i=Math.floor(r%(o+1));return t.box(t.types.mdhd,new Uint8Array([1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,3,e>>24&255,e>>16&255,e>>8&255,255&e,n>>24,n>>16&255,n>>8&255,255&n,i>>24,i>>16&255,i>>8&255,255&i,85,196,0,0]))}},{key:"mdia",value:function(e){return t.box(t.types.mdia,t.mdhd(e.timescale,e.duration),t.hdlr(e.type),t.minf(e))}},{key:"mfhd",value:function(e){return t.box(t.types.mfhd,new Uint8Array([0,0,0,0,e>>24,e>>16&255,e>>8&255,255&e]))}},{key:"minf",value:function(e){return"audio"===e.type?t.box(t.types.minf,t.box(t.types.smhd,t.SMHD),t.DINF,t.stbl(e)):t.box(t.types.minf,t.box(t.types.vmhd,t.VMHD),t.DINF,t.stbl(e))}},{key:"moof",value:function(e,r,n){return t.box(t.types.moof,t.mfhd(e),t.traf(n,r))}},{key:"moov",value:function(e){for(var r=e.length,n=[];r--;)n[r]=t.trak(e[r]);return t.box.apply(null,[t.types.moov,t.mvhd(e[0].timescale,e[0].duration)].concat(n).concat(t.mvex(e)))}},{key:"mvex",value:function(e){for(var r=e.length,n=[];r--;)n[r]=t.trex(e[r]);return t.box.apply(null,[t.types.mvex].concat(n))}},{key:"mvhd",value:function(e,r){r*=e;var n=Math.floor(r/(o+1)),i=Math.floor(r%(o+1)),a=new Uint8Array([1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,3,e>>24&255,e>>16&255,e>>8&255,255&e,n>>24,n>>16&255,n>>8&255,255&n,i>>24,i>>16&255,i>>8&255,255&i,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255]);return t.box(t.types.mvhd,a)}},{key:"sdtp",value:function(e){var r,n,i=e.samples||[],o=new Uint8Array(4+i.length);for(n=0;n<i.length;n++)r=i[n].flags,o[n+4]=r.dependsOn<<4|r.isDependedOn<<2|r.hasRedundancy;return t.box(t.types.sdtp,o)}},{key:"stbl",value:function(e){return t.box(t.types.stbl,t.stsd(e),t.box(t.types.stts,t.STTS),t.box(t.types.stsc,t.STSC),t.box(t.types.stsz,t.STSZ),t.box(t.types.stco,t.STCO))}},{key:"avc1",value:function(e){var r,n,i,o=[],a=[];for(r=0;r<e.sps.length;r++)n=e.sps[r],i=n.byteLength,o.push(i>>>8&255),o.push(255&i),o=o.concat(Array.prototype.slice.call(n));for(r=0;r<e.pps.length;r++)n=e.pps[r],i=n.byteLength,a.push(i>>>8&255),a.push(255&i),a=a.concat(Array.prototype.slice.call(n));var s=t.box(t.types.avcC,new Uint8Array([1,o[3],o[4],o[5],255,224|e.sps.length].concat(o).concat([e.pps.length]).concat(a))),f=e.width,c=e.height,u=e.pixelRatio[0],h=e.pixelRatio[1];return t.box(t.types.avc1,new Uint8Array([0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,f>>8&255,255&f,c>>8&255,255&c,0,72,0,0,0,72,0,0,0,0,0,0,0,1,18,100,97,105,108,121,109,111,116,105,111,110,47,104,108,115,46,106,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,17,17]),s,t.box(t.types.btrt,new Uint8Array([0,28,156,128,0,45,198,192,0,45,198,192])),t.box(t.types.pasp,new Uint8Array([u>>24,u>>16&255,u>>8&255,255&u,h>>24,h>>16&255,h>>8&255,255&h])))}},{key:"esds",value:function(t){var e=t.config.length;return new Uint8Array([0,0,0,0,3,23+e,0,1,0,4,15+e,64,21,0,0,0,0,0,0,0,0,0,0,0,5].concat([e]).concat(t.config).concat([6,1,2]))}},{key:"mp4a",value:function(e){var r=e.samplerate;return t.box(t.types.mp4a,new Uint8Array([0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,e.channelCount,0,16,0,0,0,0,r>>8&255,255&r,0,0]),t.box(t.types.esds,t.esds(e)))}},{key:"mp3",value:function(e){var r=e.samplerate;return t.box(t.types[".mp3"],new Uint8Array([0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,e.channelCount,0,16,0,0,0,0,r>>8&255,255&r,0,0]))}},{key:"stsd",value:function(e){return"audio"===e.type?e.isAAC||"mp3"!==e.codec?t.box(t.types.stsd,t.STSD,t.mp4a(e)):t.box(t.types.stsd,t.STSD,t.mp3(e)):t.box(t.types.stsd,t.STSD,t.avc1(e))}},{key:"tkhd",value:function(e){var r=e.id,n=e.duration*e.timescale,i=e.width,a=e.height,s=Math.floor(n/(o+1)),f=Math.floor(n%(o+1));return t.box(t.types.tkhd,new Uint8Array([1,0,0,7,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,3,r>>24&255,r>>16&255,r>>8&255,255&r,0,0,0,0,s>>24,s>>16&255,s>>8&255,255&s,f>>24,f>>16&255,f>>8&255,255&f,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,i>>8&255,255&i,0,0,a>>8&255,255&a,0,0]))}},{key:"traf",value:function(e,r){var n=t.sdtp(e),i=e.id,a=Math.floor(r/(o+1)),s=Math.floor(r%(o+1));return t.box(t.types.traf,t.box(t.types.tfhd,new Uint8Array([0,0,0,0,i>>24,i>>16&255,i>>8&255,255&i])),t.box(t.types.tfdt,new Uint8Array([1,0,0,0,a>>24,a>>16&255,a>>8&255,255&a,s>>24,s>>16&255,s>>8&255,255&s])),t.trun(e,n.length+16+20+8+16+8+8),n)}},{key:"trak",value:function(e){return e.duration=e.duration||4294967295,t.box(t.types.trak,t.tkhd(e),t.mdia(e))}},{key:"trex",value:function(e){var r=e.id;return t.box(t.types.trex,new Uint8Array([0,0,0,0,r>>24,r>>16&255,r>>8&255,255&r,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1]))}},{key:"trun",value:function(e,r){var n,i,o,a,s,f,c=e.samples||[],u=c.length,h=12+16*u,d=new Uint8Array(h);for(r+=8+h,d.set([0,0,15,1,u>>>24&255,u>>>16&255,u>>>8&255,255&u,r>>>24&255,r>>>16&255,r>>>8&255,255&r],0),n=0;n<u;n++)i=c[n],o=i.duration,a=i.size,s=i.flags,f=i.cts,d.set([o>>>24&255,o>>>16&255,o>>>8&255,255&o,a>>>24&255,a>>>16&255,a>>>8&255,255&a,s.isLeading<<2|s.dependsOn,s.isDependedOn<<6|s.hasRedundancy<<4|s.paddingValue<<1|s.isNonSync,61440&s.degradPrio,15&s.degradPrio,f>>>24&255,f>>>16&255,f>>>8&255,255&f],12+16*n);return t.box(t.types.trun,d)}},{key:"initSegment",value:function(e){t.types||t.init();var r,n=t.moov(e);return r=new Uint8Array(t.FTYP.byteLength+n.byteLength),r.set(t.FTYP),r.set(n,t.FTYP.byteLength),r}}]),t}();r.default=a},{}],497:[function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0});var o=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),a=t(490),s=n(a),f=t(505),c=t(496),u=n(c),h=t(487),d=t(488),l=n(d),p=function(){function t(e,r,n,o){i(this,t),this.observer=e,this.config=r,this.typeSupported=n;var a=navigator.userAgent;this.isSafari=o&&o.indexOf("Apple")>-1&&a&&!a.match("CriOS"),this.ISGenerated=!1}return o(t,[{key:"destroy",value:function(){}},{key:"resetTimeStamp",value:function(t){this._initPTS=this._initDTS=t}},{key:"resetInitSegment",value:function(){this.ISGenerated=!1}},{key:"remux",value:function(t,e,r,n,i,o,a){if(this.ISGenerated||this.generateIS(t,e,i),this.ISGenerated)if(t.samples.length){t.timescale||(f.logger.warn("regenerate InitSegment as audio detected"),this.generateIS(t,e,i));var s=this.remuxAudio(t,i,o,a);if(e.samples.length){var c=void 0;s&&(c=s.endPTS-s.startPTS),e.timescale||(f.logger.warn("regenerate InitSegment as video detected"),this.generateIS(t,e,i)),this.remuxVideo(e,i,o,c)}}else{var u=void 0;e.samples.length&&(u=this.remuxVideo(e,i,o)),u&&t.codec&&(f.logger.log("Remux empty audio"),this.remuxEmptyAudio(t,i,o,u))}r.samples.length&&this.remuxID3(r,i),n.samples.length&&this.remuxText(n,i),this.observer.trigger(l.default.FRAG_PARSED)}},{key:"generateIS",value:function(t,e,r){var n,i,o=this.observer,a=t.samples,s=e.samples,c=this.typeSupported,d="audio/mp4",p={},b={tracks:p},v=void 0===this._initPTS;if(v&&(n=i=1/0),t.config&&(t.timescale=t.samplerate,f.logger.log("audio sampling rate : "+t.samplerate),t.isAAC||(c.mpeg?(d="audio/mpeg",t.codec=""):c.mp3&&(t.codec="mp3")),p.audio={container:d,codec:t.codec,initSegment:!t.isAAC&&c.mpeg?new Uint8Array:u.default.initSegment([t]),metadata:{channelCount:t.channelCount}},v&&a[0]&&(n=i=a[0].pts-t.inputTimeScale*r)),e.sps&&e.pps&&s.length){var y=e.inputTimeScale;e.timescale=y,p.video={container:"video/mp4",codec:e.codec,initSegment:u.default.initSegment([e]),metadata:{width:e.width,height:e.height}},v&&(n=Math.min(n,s[0].pts-y*r),i=Math.min(i,s[0].dts-y*r),this.observer.trigger(l.default.INIT_PTS_FOUND,{initPTS:n}))}Object.keys(p).length?(o.trigger(l.default.FRAG_PARSING_INIT_SEGMENT,b),this.ISGenerated=!0,v&&(this._initPTS=n,this._initDTS=i)):o.trigger(l.default.ERROR,{type:h.ErrorTypes.MEDIA_ERROR,details:h.ErrorDetails.FRAG_PARSING_ERROR,fatal:!1,reason:"no audio/video samples found"})}},{key:"remuxVideo",value:function(t,e,r,n){var i,o,a,s,c,d,p,b=8,v=t.timescale,y=t.samples,g=[],m=y.length,w=this._PTSNormalize,_=this._initDTS;y.sort(function(t,e){var r=t.dts-e.dts,n=t.pts-e.pts;return r||(n||t.id-e.id)});var S=y.reduce(function(t,e){return Math.max(Math.min(t,e.pts-e.dts),-18e3)},0);if(S<0){f.logger.warn("PTS < DTS detected in video samples, shifting DTS by "+Math.round(S/90)+" ms to overcome this issue");for(var E=0;E<y.length;E++)y[E].dts+=S}var k=void 0;k=r?this.nextAvcDts:e*v;var M=y[0];c=Math.max(w(M.dts-_,k),0),s=Math.max(w(M.pts-_,k),0);var A=Math.round((c-k)/90);r&&A&&(A>1?f.logger.log("AVC:"+A+" ms hole between fragments detected,filling it"):A<-1&&f.logger.log("AVC:"+-A+" ms overlapping between fragments detected"),c=k,y[0].dts=c+_,s=Math.max(s-A,k),y[0].pts=s+_,f.logger.log("Video/PTS/DTS adjusted: "+Math.round(s/90)+"/"+Math.round(c/90)+",delta:"+A+" ms")),M=y[y.length-1],p=Math.max(w(M.dts-_,k),0),d=Math.max(w(M.pts-_,k),0),d=Math.max(d,p);var x=this.isSafari;x&&(i=Math.round((p-c)/(y.length-1)));for(var I=0,R=0,B=0;B<m;B++){for(var T=y[B],P=T.units,C=P.length,O=0,j=0;j<C;j++)O+=P[j].data.length;R+=O,I+=C,T.length=O,T.dts=x?c+B*i:Math.max(w(T.dts-_,k),c),T.pts=Math.max(w(T.pts-_,k),T.dts)}var N=R+4*I+8;try{o=new Uint8Array(N)}catch(t){return void this.observer.trigger(l.default.ERROR,{type:h.ErrorTypes.MUX_ERROR,details:h.ErrorDetails.REMUX_ALLOC_ERROR,fatal:!1,bytes:N,reason:"fail allocating video mdat "+N})}var L=new DataView(o.buffer);L.setUint32(0,N),o.set(u.default.types.mdat,4);for(var D=0;D<m;D++){for(var F=y[D],U=F.units,q=0,z=void 0,V=0,G=U.length;V<G;V++){var K=U[V],W=K.data,H=K.data.byteLength;L.setUint32(b,H),b+=4,o.set(W,b),b+=H,q+=4+H}if(x)z=Math.max(0,i*Math.round((F.pts-F.dts)/i));else{if(D<m-1)i=y[D+1].dts-F.dts;else{var X=this.config,J=F.dts-y[D>0?D-1:D].dts;if(X.stretchShortVideoTrack){var Y=X.maxBufferHole,Z=X.maxSeekHole,Q=Math.floor(Math.min(Y,Z)*v),$=(n?s+n*v:this.nextAudioPts)-F.pts;$>Q?(i=$-J,i<0&&(i=J),f.logger.log("It is approximately "+$/90+" ms to the next segment; using duration "+i/90+" ms for the last video frame.")):i=J}else i=J}z=Math.round(F.pts-F.dts)}g.push({size:q,duration:i,cts:z,flags:{isLeading:0,isDependedOn:0,hasRedundancy:0,degradPrio:0,dependsOn:F.key?2:1,isNonSync:F.key?0:1}})}this.nextAvcDts=p+i;var tt=t.dropped;if(t.len=0,t.nbNalu=0,t.dropped=0,g.length&&navigator.userAgent.toLowerCase().indexOf("chrome")>-1){var et=g[0].flags;et.dependsOn=2,et.isNonSync=0}t.samples=g,a=u.default.moof(t.sequenceNumber++,c,t),t.samples=[];var rt={data1:a,data2:o,startPTS:s/v,endPTS:(d+i)/v,startDTS:c/v,endDTS:this.nextAvcDts/v,type:"video",nb:g.length,dropped:tt};return this.observer.trigger(l.default.FRAG_PARSING_DATA,rt),rt}},{key:"remuxAudio",value:function(t,e,r,n){var i,o,a,c,d,p,b,v,y,g,m,w,_,S,E,k,M=t.inputTimeScale,A=t.timescale,x=M/A,I=t.isAAC?1024:1152,R=I*x,B=this._PTSNormalize,T=this._initDTS,P=!t.isAAC&&this.typeSupported.mpeg,C=P?0:8,O=[],j=[];if(t.samples.sort(function(t,e){return t.pts-e.pts}),j=t.samples,k=this.nextAudioPts,r|=j.length&&k&&(n&&Math.abs(e-k/M)<.1||Math.abs(j[0].pts-k-T)<20*R),r||(k=e*M),n&&t.isAAC)for(var N=0,L=k;N<j.length;){var D=j[N],F=B(D.pts-T,k),U=F-L,q=Math.abs(1e3*U/M);if(U<=-R)f.logger.warn("Dropping 1 audio frame @ "+(L/M).toFixed(3)+"s due to "+q+" ms overlap."),j.splice(N,1),t.len-=D.unit.length;else if(U>=R&&q<1e4&&L){var z=Math.round(U/R);f.logger.warn("Injecting "+z+" audio frame @ "+(L/M).toFixed(3)+"s due to "+Math.round(1e3*U/M)+" ms gap.");for(var V=0;V<z;V++)E=L+T,E=Math.max(E,T),S=s.default.getSilentFrame(t.manifestCodec||t.codec,t.channelCount),S||(f.logger.log("Unable to get silent frame for given audio codec; duplicating last frame instead."),S=D.unit.subarray()),j.splice(N,0,{unit:S,pts:E,dts:E}),t.len+=S.length,L+=R,N+=1;D.pts=D.dts=L+T,L+=R,N+=1}else Math.abs(U),L+=R,D.pts=D.dts=0===N?T+k:j[N-1].pts+R,N+=1}for(var G=0,K=j.length;G<K;G++){if(o=j[G],c=o.unit,g=o.pts-T,m=o.dts-T,void 0!==y)w=B(g,y),_=B(m,y),a.duration=Math.round((_-y)/x);else{w=B(g,k),_=B(m,k);var W=Math.round(1e3*(w-k)/M),H=0;if(r&&t.isAAC&&W){if(W>0&&W<1e4)H=Math.round((w-k)/R),f.logger.log(W+" ms hole between AAC samples detected,filling it"),H>0&&(S=s.default.getSilentFrame(t.manifestCodec||t.codec,t.channelCount),S||(S=c.subarray()),t.len+=H*S.length);else if(W<-12){f.logger.log("drop overlapping AAC sample, expected/parsed/delta:"+(k/M).toFixed(3)+"s/"+(w/M).toFixed(3)+"s/"+-W+"ms"),t.len-=c.byteLength;continue}w=_=k}if(b=Math.max(0,w),v=Math.max(0,_),!(t.len>0))return void f.logger.log("no audio samples");var X=P?t.len:t.len+8;try{d=new Uint8Array(X)}catch(t){return f.logger.error("got error "+t),void this.observer.trigger(l.default.ERROR,{type:h.ErrorTypes.MUX_ERROR,details:h.ErrorDetails.REMUX_ALLOC_ERROR,fatal:!1,bytes:X,reason:"fail allocating audio mdat "+X})}P||(i=new DataView(d.buffer),i.setUint32(0,X),d.set(u.default.types.mdat,4));for(var J=0;J<H;J++)E=w-(H-J)*R,S=s.default.getSilentFrame(t.manifestCodec||t.codec,t.channelCount),S||(f.logger.log("Unable to get silent frame for given audio codec; duplicating this frame instead."),S=c.subarray()),d.set(S,C),C+=S.byteLength,a={size:S.byteLength,cts:0,duration:1024,flags:{isLeading:0,isDependedOn:0,hasRedundancy:0,degradPrio:0,dependsOn:1}},O.push(a)}d.set(c,C);var Y=c.byteLength;C+=Y,a={size:Y,cts:0,duration:0,flags:{isLeading:0,isDependedOn:0,hasRedundancy:0,degradPrio:0,dependsOn:1}},O.push(a),y=_}var Z=0,Q=O.length;if(Q>=2&&(Z=O[Q-2].duration,a.duration=Z),Q){this.nextAudioPts=w+x*Z,t.len=0,t.samples=O,p=P?new Uint8Array:u.default.moof(t.sequenceNumber++,v/x,t),t.samples=[];var $={data1:p,data2:d,startPTS:b/M,endPTS:this.nextAudioPts/M,startDTS:v/M,endDTS:(_+x*Z)/M,type:"audio",nb:Q};return this.observer.trigger(l.default.FRAG_PARSING_DATA,$),$}return null}},{key:"remuxEmptyAudio",value:function(t,e,r,n){var i=t.inputTimeScale,o=t.samplerate?t.samplerate:i,a=i/o,c=this.nextAudioPts,u=(void 0!==c?c:n.startDTS*i)+this._initDTS,h=n.endDTS*i+this._initDTS,d=1024*a,l=Math.ceil((h-u)/d),p=s.default.getSilentFrame(t.manifestCodec||t.codec,t.channelCount);if(f.logger.warn("remux empty Audio"),!p)return void f.logger.warn("Unable to remuxEmptyAudio since we were unable to get a silent frame for given audio codec!");for(var b=[],v=0;v<l;v++){var y=u+v*d;b.push({unit:p,pts:y,dts:y}),t.len+=p.length}t.samples=b,this.remuxAudio(t,e,r)}},{key:"remuxID3",value:function(t,e){var r,n=t.samples.length,i=t.inputTimeScale,o=this._initPTS,a=this._initDTS;if(n){for(var s=0;s<n;s++)r=t.samples[s],r.pts=(r.pts-o)/i,r.dts=(r.dts-a)/i;this.observer.trigger(l.default.FRAG_PARSING_METADATA,{
samples:t.samples})}t.samples=[],e=e}},{key:"remuxText",value:function(t,e){t.samples.sort(function(t,e){return t.pts-e.pts});var r,n=t.samples.length,i=t.inputTimeScale,o=this._initPTS;if(n){for(var a=0;a<n;a++)r=t.samples[a],r.pts=(r.pts-o)/i;this.observer.trigger(l.default.FRAG_PARSING_USERDATA,{samples:t.samples})}t.samples=[],e=e}},{key:"_PTSNormalize",value:function(t,e){var r;if(void 0===e)return t;for(r=e<t?-8589934592:8589934592;Math.abs(t-e)>4294967296;)t+=r;return t}}]),t}();r.default=p},{487:487,488:488,490:490,496:496,505:505}],498:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0});var i=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),o=t(505),a=t(488),s=function(t){return t&&t.__esModule?t:{default:t}}(a),f=t(487),c=function(){function t(e,r,i,o){n(this,t),this.observer=e,this.video=r,(this.mediaSource=new MediaSource).addEventListener("sourceopen",this.onSourceOpen.bind(this)),this.video.src=URL.createObjectURL(this.mediaSource),this.sourceBuffer=[],e.on(s.default.FRAG_PARSING_INIT_SEGMENT,function(t){this.onBufferCodecs(t.tracks),t.tracks.video&&this.append({startPTS:0,endPTS:0,data1:t.tracks.video.initSegment,type:"video"}),t.tracks.audio&&this.append({startPTS:0,endPTS:0,data1:t.tracks.audio.initSegment,type:"audio"})}.bind(this)),e.on(s.default.FRAG_PARSING_DATA,function(t){if(this.video.currentTime>0&&this.video.readyState<4){var e=!1,r=!1,n=1/0;if(this.sourceBuffer.audio){var i=this.sourceBuffer.audio.buffered;if(i.length>0){var o=i.start(i.length-1),a=i.end(i.length-1);a-o>1&&(e=!0,n=a)}}else e=!0;if(this.sourceBuffer.video){var s=this.sourceBuffer.video.buffered;if(s.length>0){var f=s.start(s.length-1),c=s.end(s.length-1);c-f>1&&(c<n&&(n=c),r=!0)}}else r=!0;if(e&&r){var u=n-this.video.currentTime;if(u>3){var h=n-1;this.video.currentTime=h}}}this.append(t,t.type)}.bind(this)),this.audioBuffer=new u("audio"),this.videoBuffer=new u("video"),this.updating=!1,this.pendingTracks={},this.tracks={},this.removed=[]}return i(t,[{key:"createBuffers",value:function(t){var e='video/mp4; codecs="'+codec+'"';MediaSource.isTypeSupported(e)?(this.mediaSource=new MediaSource,this.mime=e,this.video.src=URL.createObjectURL(this.mediaSource),this.mediaSource.addEventListener("sourceopen",this.onSourceOpen.bind(this))):this.observer.trigger(s.default.ERROR,{type:f.ErrorTypes.BUFFER_ERROR,info:"Failed to create buffer, codec is not supported "+codec})}},{key:"createSourceBuffers",value:function(t){var e=this.sourceBuffer,r=this.mediaSource;for(var n in t)if(!e[n]){var i=t[n],a=i.codec,c=i.container+";codecs="+a;o.logger.log("creating sourceBuffer("+c+")");try{var u=e[n]=r.addSourceBuffer(c);u.addEventListener("updateend",this.onSourceUpdateEnd.bind(this)),u.addEventListener("error",this.onSourceError.bind(this)),this.tracks[n]={codec:a,container:i.container},i.buffer=u}catch(t){o.logger.error("error while trying to add sourceBuffer:"+t.message),this.observer.trigger(s.default.ERROR,{type:f.ErrorTypes.MEDIA_ERROR,details:f.ErrorDetails.BUFFER_ADD_CODEC_ERROR,fatal:!1,err:t,mimeType:c})}}}},{key:"onBufferCodecs",value:function(t){if(0===Object.keys(this.sourceBuffer).length){for(var e in t)this.pendingTracks[e]=t[e];var r=this.mediaSource;r&&"open"===r.readyState&&this.checkPendingTracks()}}},{key:"append",value:function(t,e){"audio"==t.type?this.audioBuffer.append(t):"video"==t.type&&this.videoBuffer.append(t),this.doAppending()}},{key:"doAppending",value:function(){this.audioBuffer.ready()&&(this.audioBuffer.flushed?this.appendTo("audio",this.audioBuffer.next())&&this.audioBuffer.poll():this.audioBuffer.buffered()>2&&(!this.sourceBuffer.video||this.videoBuffer.flushed||this.videoBuffer.buffered()>2)&&this.appendTo("audio",this.audioBuffer.next())&&(this.audioBuffer.poll(),this.audioBuffer.flushed=!0)),this.videoBuffer.ready()&&(this.videoBuffer.flushed?this.appendTo("video",this.videoBuffer.next())&&this.videoBuffer.poll():this.videoBuffer.buffered()>2&&(!this.sourceBuffer.audio||this.audioBuffer.flushed||this.audioBuffer.buffered()>2)&&this.appendTo("video",this.videoBuffer.next())&&(this.videoBuffer.poll(),this.videoBuffer.flushed=!0))}},{key:"appendTo",value:function(t,e){if(e){if(this.sourceBuffer[t]&&!this.sourceBuffer[t].updating)try{return e.data1?(this.sourceBuffer[t].appendBuffer(e.data1),e.data1=null,null==e.data2):(e.data2&&this.sourceBuffer[t].appendBuffer(e.data2),!0)}catch(e){22==e.code?(o.logger.error("Failed to append data to buffer "+t+" error "+e),this.cleanBuffer(t)):o.logger.error(e)}return!1}}},{key:"cleanBuffer",value:function(t){if(!this.sourceBuffer[t].updating){var e=this.video.currentTime,r=this.sourceBuffer[t].buffered;if(r.length>0){var n=r.end(0),i=e>n+300?0:n-e+300,a=e>n?0:60,s=r.start(0);if(s<this.removed[t])return;if(n-i<=s||n-i-s<a)return;this.removed[t]=n-i,o.logger.log("Removing buffered "+t+" start "+s+" end "+(n-i)+" currentTime "+e),this.sourceBuffer[t].remove(s,n-i)}}}},{key:"onSourceOpen",value:function(t){o.logger.log("media source opened");var e=this.mediaSource;e&&(e.removeEventListener("sourceopen",this.onSourceOpen),this.video.play()),this.checkPendingTracks()}},{key:"checkPendingTracks",value:function(){var t=this.pendingTracks;Object.keys(t).length&&(this.createSourceBuffers(t),this.pendingTracks={},this.doAppending())}},{key:"onSourceUpdateEnd",value:function(t){this.sourceBuffer.audio&&this.cleanBuffer("audio"),this.sourceBuffer.video&&this.cleanBuffer("video"),this.doAppending()}},{key:"onSourceError",value:function(t){this.observer.trigger(s.default.ERROR,{type:f.ErrorTypes.BUFFER_ERROR,info:t})}},{key:"release",value:function(){this.video&&(this.sourceBuffer={},URL.revokeObjectURL(this.video.src),this.video.removeAttribute("src"),this.video.load(),this.video=null)}}]),t}();r.default=c;var u=function(){function t(e){n(this,t),this.samples=[],this.start=-1,this.end=0,this.flushed=!1,this.type=e}return i(t,[{key:"buffered",value:function(){return this.end-this.start}},{key:"append",value:function(t){this.samples.push(t),-1==this.start&&(this.start=t.startPTS),this.end=t.endPTS}},{key:"next",value:function(){return this.samples[0]}},{key:"poll",value:function(){var t=this.samples.shift();return 0==this.samples.length?(this.start=-1,this.end=0):(this.start=this.samples[0].startPTS,this.end=this.samples[this.samples.length-1].endPTS),t}},{key:"ready",value:function(){return this.buffered()>0}}]),t}()},{487:487,488:488,505:505}],499:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0});var i=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}();t(16);var o=t(494),a=function(t){return t&&t.__esModule?t:{default:t}}(o),s=t(447),f=function(){function t(){n(this,t)}return i(t,null,[{key:"createConnection",value:function(t){void 0===t.enableWorker&&(t.enableWorker=!0),void 0===t.connectionConstraints?t.connectionConstraints={fragmentLengthMs:100,cutByIFrameOnly:!1}:(void 0===t.connectionConstraints.fragmentLengthMs&&(t.connectionConstraints.fragmentLengthMs=100),void 0===t.connectionConstraints.cutByIFrameOnly&&(t.connectionConstraints.cutByIFrameOnly=!1));var e=new a.default(t);return s.resolve(e)}},{key:"getMediaAccess",value:function(){return new s(function(t,e){e(new Error("This provider doesn't support getMediaAccess"))})}},{key:"releaseMedia",value:function(){return!1}},{key:"available",value:function(){return"MediaSource"in window}},{key:"listDevices",value:function(){return new s(function(t,e){e(new Error("This provider doesn't support listDevices"))})}},{key:"configure",value:function(t){}},{key:"playFirstSound",value:function(){}},{key:"playFirstVideo",value:function(t,e){a.default.playFirstVideo(t,e)}}]),t}();r.default=f},{16:16,447:447,494:494}],500:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0});var i=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}();r.MediaFileReader=function(){function t(e,r,i){n(this,t),this.observer=e,this.elementId=r.mainUrl,document.getElementById(this.elementId).addEventListener("change",this.handleFileSelect.bind(this),!1),this.demuxer=i}return i(t,[{key:"handleFileSelect",value:function(t){var e=t.target.files,r=e[0],n=new FileReader,i=this.demuxer;n.onload=function(t){return function(t){for(var e=new DataView(t.target.result),r=0;r<t.target.result.byteLength;){var n=e.getInt32(r+5),o=t.target.result.slice(r,r+n+9);r+=9,r+=n,i.onData(o)}}}(),n.readAsArrayBuffer(r)}},{key:"disconnect",value:function(){}}]),t}()},{}],501:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0});var i=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),o=t(488),a=(function(t){t&&t.__esModule}(o),t(487)),s=function(){function t(e,r,i){n(this,t),this.mediaConnection=e,this.url=r.mainUrl,this.token=r.authToken,this.state="NEW",this.socket=null,this.demuxer=i}return i(t,[{key:"connect",value:function(){var t=this;this.state="CONNECTING",this.socket=new WebSocket(this.url),this.socket.binaryType="arraybuffer",this.socket.onopen=this.onConnected.bind(this),this.socket.onmessage=function(e){if(e.data instanceof ArrayBuffer)t.demuxer.onData(e.data);else{switch(JSON.parse(e.data).message){case"ping":var r={};r.message="pong",t.socket.send(JSON.stringify(r))}}},this.socket.onerror=function(e){t.state="ERROR",t.mediaConnection.trigger(Event.ERROR,{type:a.ErrorTypes.NETWORK_ERROR,info:e})},this.socket.onclose=this.onDisconnected.bind(this)}},{key:"disconnect",value:function(){"CONNECTING"!=this.state&&"CONNECTED"!=this.state||this.socket.close()}},{key:"onConnected",value:function(){var t={};t.message="connectMediaTransport",t.data=[{authToken:this.token}],this.socket.send(JSON.stringify(t)),this.state="CONNECTED",this.mediaConnection.trigger(Event.TRANSPORT_CONNECTED,{})}},{key:"onDisconnected",value:function(){this.state="CLOSED",this.mediaConnection.trigger(Event.TRANSPORT_DISCONNECTED,{})}}]),t}();r.default=s},{487:487,488:488}],502:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){var r=new Uint8Array((0|t.byteLength)+(0|e.byteLength));return r.set(t,0),r.set(e,0|t.byteLength),r}function o(t,e){return new Promise(function(r,n){var i=new Blob([t,e]),o=new FileReader;o.addEventListener("loadend",function(){r()}),o.readAsArrayBuffer(i)})}function a(t){for(var e=window.atob(t),r=e.length,n=new Uint8Array(r),i=0;i<r;i++)n[i]=e.charCodeAt(i);return n.buffer}function s(t){for(var e=t.length>>1,r=new Uint8Array(e),n=0;n<e;n++)r[n]=parseInt(t.substr(n<<1,2),16);return r}function f(t){for(var e=0,r=arguments.length,n=Array(r>1?r-1:0),i=1;i<r;i++)n[i-1]=arguments[i];var o=!0,a=!1,s=void 0;try{for(var f,c=n[Symbol.iterator]();!(o=(f=c.next()).done);o=!0){e+=f.value.length}}catch(t){a=!0,s=t}finally{try{!o&&c.return&&c.return()}finally{if(a)throw s}}var u=new t(e),h=0,d=!0,l=!1,p=void 0;try{for(var b,v=n[Symbol.iterator]();!(d=(b=v.next()).done);d=!0){var y=b.value;u.set(y,h),h+=y.length}}catch(t){l=!0,p=t}finally{try{!d&&v.return&&v.return()}finally{if(l)throw p}}return u}function c(t){for(var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:8*t.byteLength,n=Math.ceil((r-e)/8),i=new Uint8Array(n),o=e>>>3,a=(r>>>3)-1,s=7&e,f=8-s,c=8-r&7,u=0;u<n;++u){var h=0;u<a&&(h=t[o+u+1]>>f,u==a-1&&c<8&&(h>>=c,h<<=c)),i[u]=t[o+u]<<s|h}return i}Object.defineProperty(r,"__esModule",{value:!0});var u=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}();r.appendByteArray=i,r.appendByteArrayAsync=o,r.base64ToArrayBuffer=a,r.hexToByteArray=s,r.concatenate=f,r.bitSlice=c;r.BitArray=function(){function t(e){n(this,t),this.src=new DataView(e.buffer,e.byteOffset,e.byteLength),this.bitpos=0,this.byte=this.src.getUint8(0),this.bytepos=0}return u(t,[{key:"readBits",value:function(t){if(32<(0|t)||0==(0|t))throw new Error("too big");for(var e=0,r=t;r>0;--r)e=(0|e)<<1|(0|this.byte)>>8-++this.bitpos&1,(0|this.bitpos)>=8&&(this.byte=this.src.getUint8(++this.bytepos),this.bitpos&=7);return e}},{key:"skipBits",value:function(t){return this.bitpos+=7&(0|t),this.bytepos+=(0|t)>>>3,this.bitpos>7&&(this.bitpos&=7,++this.bytepos),this.finished()?this.bytepos-this.src.byteLength-this.src.bitpos:(this.byte=this.src.getUint8(this.bytepos),0)}},{key:"finished",value:function(){return this.bytepos>=this.src.byteLength}}]),t}()},{}],503:[function(t,e,r){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(r,"__esModule",{value:!0});var i=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),o=function(){function t(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;n(this,t),this.array=e,this.view=new DataView(e),this.i=r,this.length=e.byteLength-r}return i(t,[{key:"readByte",value:function(){if(this.length-this.i<1)return void logger.error("Buffer end reached");var t=this.view.getInt8(this.i);return this.i++,t}},{key:"readInt",value:function(){if(this.length-this.i<4)return void logger.error("Buffer end reached");var t=this.view.getInt32(this.i);return this.i+=4,t}},{key:"readShort",value:function(){if(this.length-this.i<2)return void logger.error("Buffer end reached");var t=this.view.getInt16(this.i);return this.i+=2,t}},{key:"skipBytes",value:function(t){this.i+=t}},{key:"readableBytes",value:function(){return this.length-this.i}},{key:"sliceAsUint8Array",value:function(t,e){var r=this.array.slice(t,t+e);return this.i+=e,new Uint8Array(r)}},{key:"readerIndex",value:function(){return this.i}},{key:"resetReaderIndex",value:function(){this.i=this.array.byteLength-this.length}}]),t}();r.default=o},{}],504:[function(t,e,r){"use strict";var n={hexDump:function(t){var e,r="";for(e=0;e<t.length;e++){var n=t[e].toString(16);n.length<2&&(n="0"+n),r+=n}return r}};e.exports=n},{}],505:[function(t,e,r){"use strict";function n(){}function i(t,e){return e="["+t+"] > "+e}function o(t){var e=self.console[t];return e?function(){for(var r=arguments.length,n=Array(r),o=0;o<r;o++)n[o]=arguments[o];n[0]&&(n[0]=i(t,n[0])),e.apply(self.console,n)}:n}function a(t){for(var e=arguments.length,r=Array(e>1?e-1:0),n=1;n<e;n++)r[n-1]=arguments[n];r.forEach(function(e){c[e]=t[e]?t[e].bind(t):o(e)})}Object.defineProperty(r,"__esModule",{value:!0});var s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},f={trace:n,debug:n,log:n,warn:n,info:n,error:n},c=f;r.enableLogs=function(t){if(!0===t||"object"===(void 0===t?"undefined":s(t))){a(t,"debug","log","info","warn","error");try{c.log()}catch(t){c=f}}else c=f},r.logger=c},{}]},{},[489])(489)});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],28:[function(require,module,exports){
'use strict';
var SESSION_STATUS = require('./constants').SESSION_STATUS;
var STREAM_STATUS = require('./constants').STREAM_STATUS;
var Promise = require('promise-polyfill');
var util = require('./util');
var uuid_v1 = require('uuid/v1');
var ROOM_REST_APP = "roomApp";

/**
 * Room api based on core api
 *
 * @namespace roomApi
 */

/**
 * Initialize connection
 *
 * @param {Object} options session options
 * @param {String} options.urlServer Server address in form of [ws,wss]://host.domain:port
 * @param {String} options.username Username to login with
 * @returns {roomApi.Session}
 * @memberof roomApi
 * @method connect
 */
var appSession = function(options) {
    /**
     * Represents connection to room api app
     *
     * @namespace roomApi.Session
     */
    var callbacks = {};
    var rooms = {};
    var username_ = options.username;
    var exports;
    var roomHandlers = {};
    var session = Flashphoner.createSession({
        urlServer: options.urlServer,
        mediaOptions: options.mediaOptions,
        appKey: (options.appKey && options.appKey.length!=0) ? options.appKey: ROOM_REST_APP,
        custom: {
            login: options.username,
            token: options.token
        }
    }).on(SESSION_STATUS.ESTABLISHED, function(session){
        if (callbacks[session.status()]) {
            callbacks[session.status()](exports);
        }
    }).on(SESSION_STATUS.APP_DATA, function(data){
        if (roomHandlers[data.payload.roomName]) {
            roomHandlers[data.payload.roomName](data.payload);
        } else {
            console.warn("Failed to find room");
        }
    }).on(SESSION_STATUS.DISCONNECTED, sessionDied).on(SESSION_STATUS.FAILED, sessionDied);

    //teardown helper
    function sessionDied(session) {
        if (callbacks[session.status()]) {
            callbacks[session.status()](exports);
        }
    }

    /**
     * Disconnect session
     *
     * @memberof roomApi.Session
     * @inner
     */
    var disconnect = function(){
        session.disconnect();
    };

    /**
     * Get session status
     *
     * @returns {string} One of {@link Flashphoner.constants.SESSION_STATUS}
     * @memberof roomApi.Session
     * @inner
     */
    var status = function() {
        return session.status();
    };

    /**
     * Get session id
     *
     * @returns {string} session id
     * @memberof roomApi.Session
     * @inner
     */
    var id = function() {
        return session.id();
    };

    /**
     * Get server address
     *
     * @returns {string} Server url
     * @memberof roomApi.Session
     * @inner
     */
    var getServerUrl = function() {
        return session.getServerUrl();
    };

    /**
     * Get session username
     *
     * @returns {string} username
     * @memberof roomApi.Session
     * @inner
     */
    var username = function() {
        return username_;
    };

    /**
     * Get rooms
     *
     * @returns {roomApi.Room[]}
     * @memberof roomApi.Session
     * @inner
     */
    var getRooms = function(){
        return util.copyObjectToArray(rooms);
    };


    /**
     * Add session event callback.
     *
     * @param {string} event One of {@link Flashphoner.constants.SESSION_STATUS} events
     * @param {Session~eventCallback} callback Callback function
     * @returns {roomApi.Session} Session
     * @throws {TypeError} Error if event is not specified
     * @throws {Error} Error if callback is not a valid function
     * @memberof roomApi.Session
     * @inner
     */
    var on = function(event, callback) {
        if (!event) {
            throw new Error("Event can't be null", "TypeError");
        }
        if (!callback || typeof callback !== 'function') {
            throw new Error("Callback needs to be a valid function");
        }
        callbacks[event] = callback;
        return exports;
    };

    /**
     * Join room
     *
     * @param {Object} options Room options
     * @param {String} options.name Room name
     * @returns {roomApi.Room}
     * @memberof roomApi.Session
     * @inner
     */
    var join = function(options) {
        /**
         * Room
         *
         * @namespace roomApi.Room
         */
        var room = {};
        var name_ = options.name;
        var participants = {};
        var callbacks = {};
        var stateStreams = {};
        roomHandlers[name_] = function(data) {
            /**
             * Room participant
             *
             * @namespace roomApi.Room.Participant
             */
            var participant;
            if (data.name == "STATE") {
                if (data.info) {
                    for (var i = 0; i < data.info.length; i++) {
                        participantFromState(data.info[i]);
                    }
                    stateStreams = {};
                }
                if (callbacks["STATE"]) {
                    callbacks["STATE"](room);
                }
            } else if (data.name == "JOINED") {
                participants[data.info] = {
                    streams: {},
                    name: function(){
                        return data.info;
                    },
                    sendMessage: attachSendMessage(data.info),
                    getStreams: function() { return util.copyObjectToArray(this.streams);}
                };
                if (callbacks["JOINED"]) {
                    callbacks["JOINED"](participants[data.info]);
                }
            } else if (data.name == "LEFT") {
                participant = participants[data.info];
                delete participants[data.info];
                if (callbacks["LEFT"]) {
                    callbacks["LEFT"](participant);
                }
            } else if (data.name == "PUBLISHED") {
                participant = participants[data.info.login];
                participant.streams[data.info.name] = {
                    play: play(data.info.name),
                    stop: stop(data.info.name),
                    id: id(data.info.name),
                    streamName: function() {return data.info.name}
                };
                if (callbacks["PUBLISHED"]) {
                    callbacks["PUBLISHED"](participant);
                }
            } else if (data.name == "FAILED" || data.name == "UNPUBLISHED") {
                participant = participants[data.info.login];
                if (participant != null)
                    delete participant.streams[data.info.name];
            } else if (data.name == "MESSAGE") {
                if (callbacks["MESSAGE"]) {
                    callbacks["MESSAGE"]({
                        from: participants[data.info.from],
                        text: data.info.text
                    });
                }
            }
        };

        //participant creation helper
        function participantFromState(state) {
            var participant = {};

            if (state.hasOwnProperty("login")) {
                var login = state.login;
                var streamName = state.name;
                stateStreams[streamName] = {
                    /**
                     * Play participant stream
                     *
                     * @param {HTMLElement} display Div element stream should be displayed in
                     * @returns {Stream} Local stream object
                     * @memberof roomApi.Room.Participant.Stream
                     * @inner
                     */
                    play: play(streamName),
                    /**
                     * Stop participant stream
                     *
                     * @memberof roomApi.Room.Participant.Stream
                     * @inner
                     */
                    stop: stop(streamName),
                    /**
                     * Get participant stream id
                     *
                     * @returns {String} Stream id
                     * @memberof roomApi.Room.Participant.Stream
                     * @inner
                     */
                    id: id(streamName),
                    /**
                     * Get participant stream name
                     *
                     * @returns {String} Stream name
                     * @memberof roomApi.Room.Participant.Stream
                     * @inner
                     */
                    streamName: function(){return streamName}
                };

                if (participants[login] != null) {
                    participant = participants[login];
                } else {
                    participant = {
                        streams: {},
                        /**
                         * Get participant name
                         *
                         * @returns {String} Participant name
                         * @memberof roomApi.Room.Participant
                         * @inner
                         */
                        name: function(){
                            return login;
                        },
                        /**
                         * Send message to participant
                         *
                         * @param {String} message Message to send
                         * @param {Function} error Error callback
                         * @memberof roomApi.Room.Participant
                         * @inner
                         */
                        sendMessage: attachSendMessage(login),
                        /**
                         * Get participant streams
                         *
                         * @returns {Array<roomApi.Room.Participant.Stream>} Streams
                         * @memberof roomApi.Room.Participant
                         * @inner
                         */
                        getStreams: function() { return util.copyObjectToArray(this.streams);}
                    };
                    participants[participant.name()] = participant;
                }
                /**
                 * Room participant
                 *
                 * @namespace roomApi.Room.Participant.Stream
                 */
            } else {
                participant = {
                    streams: {},
                    name: function(){
                        return state;
                    },
                    sendMessage: attachSendMessage(state),
                    getStreams: function() {return util.copyObjectToArray(this.streams);}
                }
            }
            if (Object.keys(stateStreams).length !=0 ) {
                for (var k in stateStreams) {
                    if (stateStreams.hasOwnProperty(k)) {
                        participant.streams[k] = stateStreams[k];
                        delete stateStreams[k];
                    }
                }
            }
            participants[participant.name()] = participant;
            return participant;
        }

        /**
         * Get room name
         *
         * @returns {String} Room name
         * @memberof roomApi.Room
         * @inner
         */
        var name = function() {
            return name_;
        };

        /**
         * Leave room
         *
         * @returns {Promise<room>}
         * @memberof roomApi.Room
         * @inner
         */
        var leave = function() {
            return new Promise(function(resolve, reject){
                sendAppCommand("leave", {name: name_}).then(function(){
                    cleanUp();
                    resolve(room);
                }, function(){
                    cleanUp();
                    reject(room);
                });

                function cleanUp() {
                    //clear streams
                    var streams = session.getStreams();
                    for (var i = 0; i < streams.length; i++) {
                        if (streams[i].name().indexOf(name_ + "-" + username_) !== -1 && streams[i].status() != STREAM_STATUS.UNPUBLISHED) {
                            streams[i].stop();
                        } else if (streams[i].name().indexOf(name_) !== -1 && streams[i].status() != STREAM_STATUS.STOPPED) {
                            streams[i].stop();
                        }
                    }
                    delete roomHandlers[name_];
                    delete rooms[name_];
                }
            });
        };

        /**
         * Publish stream inside room
         *
         * @param {Object} options Stream options
         * @param {string=} options.name Stream name
         * @param {Object=} options.constraints Stream constraints
         * @param {Boolean=} options.record Enable stream recording
         * @param {Boolean=} options.cacheLocalResources Display will contain local video after stream release
         * @param {HTMLElement} options.display Div element stream should be displayed in
         * @returns {Stream}
         * @memberof roomApi.Room
         * @inner
         */
        var publish = function(options) {
            options.name = (options.name) ? (name_ + "-" + username_ + "-" + uuid_v1().substr(0,4) + "-" + options.name) : (name_ + "-" + username_ + "-" + uuid_v1().substr(0,4));
            options.cacheLocalResources = (typeof options.cacheLocalResources === "boolean") ? options.cacheLocalResources : true;
            options.custom = {name: name_};
            var stream = session.createStream(options);
            stream.publish();
            return stream;
        };

        /**
         * Add room event callback.
         *
         * @param {string} event One of {@link roomApi.events} events
         * @param {roomApi.Room~eventCallback} callback Callback function
         * @returns {roomApi.Room} room
         * @throws {TypeError} Error if event is not specified
         * @throws {Error} Error if callback is not a valid function
         * @memberof roomApi.Room
         * @inner
         */
        var on = function(event, callback) {
            if (!event) {
                throw new Error("Event can't be null", "TypeError");
            }
            if (!callback || typeof callback !== 'function') {
                throw new Error("Callback needs to be a valid function");
            }
            callbacks[event] = callback;
            return room;
        };

        /**
         * Get participants
         *
         * @returns {roomApi.Room.Participant}
         * @memberof roomApi.Room
         * @inner
         */
        var getParticipants = function() {
            return util.copyObjectToArray(participants);
        };

        //participant helpers
        function play(streamName) {
            return function(display){
                var stream = session.createStream({name: streamName, display: display, custom: {name: name_}});
                stream.play();
                return stream;
            }
        }

        function stop(streamName) {
            return function() {
                var streams = session.getStreams();
                for (var i = 0; i < streams.length; i++) {
                    if (streams[i].name() == streamName && streams[i].status() != STREAM_STATUS.UNPUBLISHED) {
                        streams[i].stop();
                    }
                }
            }
        }

        function id(streamName) {
            return function() {
                var streams = session.getStreams();
                for (var i = 0; i < streams.length; i++) {
                    if (streams[i].name() == streamName)
                        return streams[i].id();
                }
            }
        }

        function attachSendMessage(recipientName) {
            return function(text, error) {
                var message = {
                    roomConfig: {
                        name: name_
                    },
                    to: recipientName,
                    text: text
                };
                sendAppCommand("sendMessage", message).then(function(){}, function(){
                    if (error) {
                        error();
                    }
                });
            }
        }

        //sendData helper
        function sendAppCommand(commandName, data) {
            var command = {
                command: commandName,
                options: data
            };
            return session.sendData(command);
        }

        sendAppCommand("join", {name: name_}).then(function(){}, function(info){
            if (callbacks["FAILED"]) {
                callbacks["FAILED"](room, info.info);
            }
        });
        room.name = name;
        room.leave = leave;
        room.publish = publish;
        room.getParticipants = getParticipants;
        room.on = on;
        rooms[name_] = room;
        return room;
    };


    exports =  {
        disconnect: disconnect,
        id: id,
        getServerUrl: getServerUrl,
        username: username,
        status: status,
        getRooms: getRooms,
        join: join,
        on: on
    };
    return exports;
};

var events = {
    STATE: "STATE",
    JOINED: "JOINED",
    LEFT: "LEFT",
    PUBLISHED: "PUBLISHED",
    MESSAGE: "MESSAGE",
    FAILED: "FAILED"
};

module.exports = {
    connect: appSession,
    events: events
};
},{"./constants":24,"./util":29,"promise-polyfill":3,"uuid/v1":10}],29:[function(require,module,exports){
'use strict';

module.exports = {

    isEmptyObject: function( obj ) {
        for ( var name in obj ) {
            return false;
        }
        return true;
    },

    /**
     * Copy values of object own properties to array.
     *
     * @param obj
     * @returns {Array}
     */
    copyObjectToArray: function(obj) {
        var ret = [];
        for (var prop in obj) {
            if(obj.hasOwnProperty(prop)) {
                ret.push(obj[prop]);
            }
        }
        return ret;
    },
    /**
     * Copy src properties to dst object.
     * Will overwrite dst prop with src prop in case of dst prop exist.
     */
    copyObjectPropsToAnotherObject: function(src, dst) {
        for (var prop in src) {
            if(src.hasOwnProperty(prop)) {
                dst[prop] = src[prop];
            }
        }
    },
    browser: function() {
        var browser;
        var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
        if (isAndroid)
            browser = "Android";
        var isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isiOS)
            browser = "iOS";
        // Opera 8.0+
        var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        if (isOpera)
            browser = "Opera";
        // Firefox 1.0+
        var isFirefox = typeof InstallTrigger !== 'undefined';
        if (isFirefox)
            browser = "Firefox";
        // At least Safari 3+: "[object HTMLElementConstructor]"
        var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        if (isSafari)
            browser = "Safari";
        // Internet Explorer 6-11
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        if (isIE)
            browser = "IE";
        // Edge 20+
        var isEdge = !isIE && !!window.StyleMedia;
        if (isEdge)
            browser = "Edge";
        // Chrome 1+
        var isChrome = !!window.chrome && !!window.chrome.webstore;
        if (isChrome)
            browser = "Chrome";
        return browser;
    },
    processRtcStatsReport: function(browser, report) {
        var result = {};
        if (browser == "chrome") {
            /**
             * Report types: googComponent, googCandidatePair, googCertificate, googLibjingleSession, googTrack, ssrc
             */
            var gotResult = false;
            if (report.type && report.type == "googCandidatePair") {
                //check if this is active pair
                if (report.googActiveConnection == "true") {
                    gotResult = true;
                }
            }

            if (report.type && report.type == "ssrc") {
                gotResult = true;
            }

            if (gotResult) {
                for (var k in report) {
                    if (report.hasOwnProperty(k)) {
                        result[k] = report[k];
                    }
                }
            }
            return result;
        } else if (browser == "firefox") {
            /**
             * RTCStatsReport http://mxr.mozilla.org/mozilla-central/source/dom/webidl/RTCStatsReport.webidl
             */

            if (report.type && (report.type == "outboundrtp" || report.type == "inboundrtp") && report.id.indexOf("rtcp") == -1) {
                result = {};
                for (var k in report) {
                    if (report.hasOwnProperty(k)) {
                        result[k] = report[k];
                    }
                }
            }

            return result;
        } else { return result };
    },
    Browser: {
        isIE: function () {
            return /*@cc_on!@*/false || !!document.documentMode;
        },
        isFirefox: function () {
            return typeof InstallTrigger !== 'undefined';
        },
        isChrome: function () {
            return !!window.chrome && !!window.chrome.webstore;
        },
        isEdge: function () {
            return !isIE && !!window.StyleMedia;
        },
        isOpera: function () {
            return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        },
        isiOS: function () {
            return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        },
        isSafari: function () {
            return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        },
        isAndroid: function () {
            return navigator.userAgent.toLowerCase().indexOf("android") > -1;
        },
        isSafariWebRTC: function () {
            return navigator.mediaDevices && Browser.isSafari();
        }
    },
    SDP: {
        matchPrefix: function(sdp,prefix) {
            var parts = sdp.trim().split('\n').map(function(line) {
                return line.trim();
            });
            return parts.filter(function(line) {
                return line.indexOf(prefix) === 0;
            });
        },
        writeFmtp: function (sdp, param, codec) {
            var sdpArray = sdp.split("\n");
            var i;
            for (i = 0; i < sdpArray.length; i++) {
                if (sdpArray[i].search(codec) != -1 && sdpArray[i].indexOf("a=rtpmap") == 0) {
                    sdpArray[i] += "\r\na=fmtp:" + sdpArray[i].match(/[0-9]+/)[0] + " " + param + "\r";
                }
            }
            //normalize sdp after modifications
            var result = "";
            for (i = 0; i < sdpArray.length; i++) {
                if (sdpArray[i] != "") {
                    result += sdpArray[i] + "\n";
                }
            }
            return result;
        }
    },
    logger: {
        init: function (verbosity, enablePushLogs) {
            switch (verbosity.toUpperCase()) {
                case "DEBUG":
                    this.verbosity = 3;
                    break;
                case "INFO":
                    this.verbosity = 2;
                    break;
                case "ERROR":
                    this.verbosity = 0;
                    break;
                case "WARN":
                    this.verbosity = 1;
                    break;
                case "TRACE":
                    this.verbosity = 4;
                    break;
                default :
                    this.verbosity = 2;
            };
            this.date = function() {
                return new Date().toTimeString().split(" ")[0];
            };
            this.enablePushLogs = enablePushLogs;
            var delayedLogs = [];
            this.pushLogs = function(log) {
                if (this.wsConnection && this.enablePushLogs) {
                    if (delayedLogs.length) {
                        for (var i = 0; i<delayedLogs.length; i++) {
                            this.wsConnection.send(JSON.stringify({
                                message: "pushLogs",
                                data: [{logs: delayedLogs[i]}]
                            }));
                        }

                    }
                    delayedLogs = [];
                    this.wsConnection.send(JSON.stringify({
                        message: "pushLogs",
                        data: [{logs: log}]
                    }));
                } else {
                    // Save logs to send it later
                    delayedLogs.push(log);
                }
            }
        },
        info: function (src, text) {
            var prefix = this.date() + " INFO " + src + " - ";
            this.pushLogs(prefix + JSON.stringify(text) + '\n');
            if (this.verbosity >= 2)
                console.log(prefix,text);
        },
        debug: function (src, text) {
            var prefix = this.date() + " DEBUG " + src + " - ";
            this.pushLogs(prefix + JSON.stringify(text) + '\n');
            if (this.verbosity >= 3)
                console.log(prefix,text);
        },
        trace: function (src, text) {
            var prefix = this.date() + " TRACE " + src + " - ";
            this.pushLogs(prefix + JSON.stringify(text) + '\n');
            if (this.verbosity >= 4)
                console.log(prefix,text);
        },
        warn: function (src, text) {
            var prefix = this.date() + " WARN " + src + " - ";
            this.pushLogs(prefix + JSON.stringify(text) + '\n');
            if (this.verbosity >= 1)
                console.warn(prefix,text);
        },
        error: function (src, text) {
            var prefix = this.date() + " ERROR " + src + " - ";
            this.pushLogs(prefix + JSON.stringify(text) + '\n');
            if (this.verbosity >= 0)
                console.error(prefix,text);
        },
        setConnection: function(connection) {
            this.wsConnection = connection;

        },
        setPushLogs: function(pushLogs) {
            this.enablePushLogs = pushLogs;
        },
        setLevel: function(level) {
            switch (level.toUpperCase()) {
                case "DEBUG":
                    this.verbosity = 3;
                    break;
                case "INFO":
                    this.verbosity = 2;
                    break;
                case "ERROR":
                    this.verbosity = 0;
                    break;
                case "WARN":
                    this.verbosity = 1;
                    break;
                case "TRACE":
                    this.verbosity = 4;
                    break;
                default :
                    this.verbosity = 2;
            };
        }
    },
    stripCodecs: function(sdp, codecs) {
        if (!codecs.length) return sdp;

        var sdpArray = sdp.split("\n");
        var codecsArray = codecs.split(",");

        //search and delete codecs line
        var pt = [];
        var i;
        for (var p = 0; p < codecsArray.length; p++) {
            codecsArray[p] = codecsArray[p].toUpperCase();
            console.log("Searching for codec " + codecsArray[p]);
            for (i = 0; i < sdpArray.length; i++) {
                if (sdpArray[i].search(codecsArray[p]) != -1 && sdpArray[i].indexOf("a=rtpmap") == 0) {
                    console.log(codecsArray[p] + " detected");
                    pt.push(sdpArray[i].match(/[0-9]+/)[0]);
                    sdpArray[i] = "";
                }
            }
        }
        if (pt.length) {
            //searching for fmtp
            for (p = 0; p < pt.length; p++) {
                for (i = 0; i < sdpArray.length; i++) {
                    if (sdpArray[i].search("a=fmtp:" + pt[p]) != -1 || sdpArray[i].search("a=rtcp-fb:" + pt[p]) != -1) {
                        sdpArray[i] = "";
                    }
                }
            }

            //delete entries from m= line
            for (i = 0; i < sdpArray.length; i++) {
                if (sdpArray[i].search("m=audio") != -1 || sdpArray[i].search("m=video") != -1) {
                    var mLineSplitted = sdpArray[i].split(" ");
                    var newMLine = "";
                    for (var m = 0; m < mLineSplitted.length; m++) {
                        if (pt.indexOf(mLineSplitted[m].trim()) == -1 || m <= 2) {
                            newMLine += mLineSplitted[m];
                            if (m < mLineSplitted.length - 1) {
                                newMLine = newMLine + " ";
                            }
                        }
                    }
                    sdpArray[i] = newMLine;
                }
            }
        }

        //normalize sdp after modifications
        var result = "";
        for (i = 0; i < sdpArray.length; i++) {
            if (sdpArray[i] != "") {
                result += sdpArray[i] + "\n";
            }
        }
        return result;
    }

};
},{}],30:[function(require,module,exports){
'use strict';

var adapter = require('webrtc-adapter');
var uuid_v1 = require('uuid/v1');
var util = require('./util');
var connections = {};
var LOCAL_CACHED_VIDEO = "-LOCAL_CACHED_VIDEO";
var REMOTE_CACHED_VIDEO = "-REMOTE_CACHED_VIDEO";
var extensionId;
var defaultConstraints;
var logger;
var LOG_PREFIX = "webrtc";
var audioContext;
var microphoneGain;
var constants = require('./constants');


var createConnection = function (options) {
    return new Promise(function (resolve, reject) {

        var id = options.id;
        var connectionConfig = options.connectionConfig || {"iceServers": []};
        var connectionConstraints = options.connectionConstraints || {};
        if (!connectionConstraints.hasOwnProperty("optional")) {
            connectionConstraints.optional = [{"DtlsSrtpKeyAgreement": true}];
        }
        connectionConfig.bundlePolicy = "max-compat";
        var connection = new RTCPeerConnection(connectionConfig, connectionConstraints);
        //unidirectional display
        var display = options.display;
        //bidirectional local
        var localDisplay = options.localDisplay;
        //bidirectional remote
        var remoteDisplay = options.remoteDisplay;
        var bidirectional = options.bidirectional;
        var localVideo;
        var remoteVideo;
        var videoCams = [];
        var switchCamCount = 0;
        var mics = [];
        var switchMicCount = 0;
        var customStream = options.customStream;
        var currentAudioTrack;
        var constraints = options.constraints ? options.constraints : {};

        if (bidirectional) {
            localVideo = getCacheInstance(localDisplay);
            if(localVideo) {
                //made for safari, if sip call without audio and video, because function playFirstVideo() creates a video element
                if(localVideo.srcObject) {
                    localVideo.id = id + "-local";
                    connection.addStream(localVideo.srcObject);
                } else {
                    localVideo = null;
                }
            }
            remoteVideo = getCacheInstance(remoteDisplay);
            if (!remoteVideo) {
                remoteVideo = document.createElement('video');
                remoteDisplay.appendChild(remoteVideo);
            }
            remoteVideo.id = id + "-remote";

            if (options.audioOutputId  && typeof remoteVideo.setSinkId !== "undefined") {
                remoteVideo.setSinkId(options.audioOutputId);
            }
            /**
             * Workaround for Android 6, 7, Chrome 61.
             * https://bugs.chromium.org/p/chromium/issues/detail?id=769622
             */
            remoteVideo.style = "border-radius: 1px";
        } else {
            var cachedVideo = getCacheInstance(display);
            if (!cachedVideo || cachedVideo.id.indexOf(REMOTE_CACHED_VIDEO) !== -1 || !cachedVideo.srcObject) {
                if (cachedVideo) {
                    remoteVideo = cachedVideo;
                } else {
                    remoteVideo = document.createElement('video');
                    display.appendChild(remoteVideo);
                }
                remoteVideo.id = id;
                if (options.audioOutputId && typeof remoteVideo.setSinkId !== "undefined") {
                    remoteVideo.setSinkId(options.audioOutputId);
                }
                /**
                 * Workaround for Android 6, 7, Chrome 61.
                 * https://bugs.chromium.org/p/chromium/issues/detail?id=769622
                 */
                remoteVideo.style = "border-radius: 1px";
            } else {
                localVideo = cachedVideo;
                localVideo.id = id;
                connection.addStream(localVideo.srcObject);
            }
        }
        if (localVideo) {
            var videoTrack = localVideo.srcObject.getVideoTracks()[0];
            if (videoTrack) {
                listDevices(false).then(function (devices) {
                    devices.video.forEach(function (device) {
                        if (videoTrack.label === device.label) {
                            switchCamCount = videoCams.length;
                        }
                        videoCams.push(device.id);
                    })
                });
            }
            var audioTrack = localVideo.srcObject.getAudioTracks()[0];
            if (audioTrack) {
                listDevices(false).then(function (devices) {
                    devices.audio.forEach(function (device) {
                        if (audioTrack.label === device.label) {
                            switchMicCount = mics.length;
                        }
                        mics.push(device.id);
                    })
                });
            }
        }
        connection.ontrack = function (event) {
            if (remoteVideo) {
                remoteVideo.srcObject = event.streams[0];
                remoteVideo.onloadedmetadata = function (e) {
                    if (remoteVideo) {
                        remoteVideo.play();
                    }
                };
            }
        };
        connection.onremovestream = function (event) {
            if (remoteVideo) {
                remoteVideo.pause();
            }
        };
        connection.onsignalingstatechange = function (event) {
        };
        connection.oniceconnectionstatechange = function (event) {
        };
        var state = function () {
            return connection.signalingState;
        };
        var close = function (cacheCamera) {
            if (remoteVideo) {
                removeVideoElement(remoteVideo);
                remoteVideo.id = remoteVideo.id + REMOTE_CACHED_VIDEO;
                remoteVideo = null;
            }
            if (localVideo && !getCacheInstance((localDisplay || display)) && cacheCamera) {
                localVideo.id = localVideo.id + LOCAL_CACHED_VIDEO;
                unmuteAudio();
                unmuteVideo();
                localVideo = null;
            } else if (localVideo) {
                localVideo.id = localVideo.id + LOCAL_CACHED_VIDEO;
                removeVideoElement(localVideo);
                localVideo = null;
            }
            if (connection.signalingState !== "closed") {
                connection.close();
            }
            delete connections[id];
        };
        var createOffer = function (options) {
            return new Promise(function (resolve, reject) {
                var hasAudio = true;
                var hasVideo = true;
                if (localVideo) {
                    if (!localVideo.srcObject.getAudioTracks()[0]) {
                        hasAudio = false;
                    }
                    if (!localVideo.srcObject.getVideoTracks()[0]) {
                        hasVideo = false;
                        options.receiveVideo = false;
                    }
                } else if (adapter.browserDetails.browser == "safari") {
                    if (options.receiveAudio) {
                        connection.addTransceiver('audio');
                    }
                    if (options.receiveVideo) {
                        connection.addTransceiver('video');
                    }
                }
                var constraints = {
                    offerToReceiveAudio: options.receiveAudio ? 1 : 0,
                    offerToReceiveVideo: options.receiveVideo ? 1 : 0
                };
                //create offer and set local sdp
                connection.createOffer(constraints).then(function (offer) {
                    connection.setLocalDescription(offer).then(function () {
                        var o = {};
                        o.sdp = util.stripCodecs(offer.sdp, options.stripCodecs);
                        o.hasAudio = hasAudio;
                        o.hasVideo = hasVideo;
                        resolve(o);
                    });
                });
            });
        };
        var createAnswer = function (options) {
            return new Promise(function (resolve, reject) {
                //create offer and set local sdp
                connection.createAnswer().then(function (answer) {
                    connection.setLocalDescription(answer).then(function () {
                        resolve(util.stripCodecs(answer.sdp, options.stripCodecs));
                    });
                });
            });
        };
        var changeAudioCodec = function (codec) {
            return false;
        };
        var setRemoteSdp = function (sdp) {
            logger.debug(LOG_PREFIX, "setRemoteSDP:");
            logger.debug(LOG_PREFIX, sdp);
            return new Promise(function (resolve, reject) {
                var sdpType;
                if (connection.signalingState == 'have-local-offer') {
                    sdpType = 'answer';
                } else {
                    sdpType = 'offer';
                }
                var rtcSdp = new RTCSessionDescription({
                    type: sdpType,
                    sdp: sdp
                });
                connection.setRemoteDescription(rtcSdp).then(function () {
                    //use in edge for ice
                    if (adapter.browserDetails.browser == "edge") {
                        // var sdpArray = sdp.split("\n");
                        // var i;
                        // for (i = 0; i < sdpArray.length; i++) {
                        //     if (sdpArray[i].indexOf("m=video") == 0) {
                        //         break;
                        //     }
                        //     if (sdpArray[i].indexOf("a=candidate:1 1") == 0 || sdpArray[i].indexOf("a=candidate:2 1") == 0) {
                        //         var rtcIceCandidate = new RTCIceCandidate({
                        //             candidate: sdpArray[i],
                        //             sdpMid: "audio",
                        //             sdpMLineIndex: 0
                        //         });
                        //         connection.addIceCandidate(rtcIceCandidate);
                        //     }
                        // }
                        // var video = false;
                        // for (i = 0; i < sdpArray.length; i++) {
                        //     if (sdpArray[i].indexOf("m=video") == 0) {
                        //         video = true;
                        //     }
                        //     if (video && (sdpArray[i].indexOf("a=candidate:1 1") == 0 || sdpArray[i].indexOf("a=candidate:2 1") == 0)) {
                        //         var rtcIceCandidate2 = new RTCIceCandidate({
                        //             candidate: sdpArray[i],
                        //             sdpMid: "video",
                        //             sdpMLineIndex: 1
                        //         });
                        //         connection.addIceCandidate(rtcIceCandidate2);
                        //     }
                        // }
                        connection.addIceCandidate(null);
                    }
                    resolve();
                }).catch(function (error) {
                    reject(error);
                });
            });
        };

        var setAudioOutputId = function (id) {
            if (remoteVideo) {
                return remoteVideo.setSinkId(id);
            }
        };

        var getVolume = function () {
            if (remoteVideo && remoteVideo.srcObject && remoteVideo.srcObject.getAudioTracks().length > 0) {
                //return remoteVideo.srcObject.getAudioTracks()[0].volume * 100;
                return remoteVideo.volume * 100;
            }
            return -1;
        };

        var setVolume = function (volume) {
            if (remoteVideo && remoteVideo.srcObject && remoteVideo.srcObject.getAudioTracks().length > 0) {
                remoteVideo.volume = volume / 100;
            }
        };

        var setMicrophoneGain = function (volume) {
            if (microphoneGain) {
                microphoneGain.gain.value = volume / 100;
            }
        };

        var muteAudio = function () {
            if (localVideo && localVideo.srcObject && localVideo.srcObject.getAudioTracks().length > 0) {
                localVideo.srcObject.getAudioTracks()[0].enabled = false;
            }
        };
        var unmuteAudio = function () {
            if (localVideo && localVideo.srcObject && localVideo.srcObject.getAudioTracks().length > 0) {
                localVideo.srcObject.getAudioTracks()[0].enabled = true;
            }
        };

        var isAudioMuted = function () {
            if (localVideo && localVideo.srcObject && localVideo.srcObject.getAudioTracks().length > 0) {
                return !localVideo.srcObject.getAudioTracks()[0].enabled;
            }
            return true;
        };
        var muteVideo = function () {
            if (localVideo && localVideo.srcObject && localVideo.srcObject.getVideoTracks().length > 0) {
                localVideo.srcObject.getVideoTracks()[0].enabled = false;
            }
        };
        var unmuteVideo = function () {
            if (localVideo && localVideo.srcObject && localVideo.srcObject.getVideoTracks().length > 0) {
                localVideo.srcObject.getVideoTracks()[0].enabled = true;
            }
        };
        var isVideoMuted = function () {
            if (localVideo && localVideo.srcObject && localVideo.srcObject.getVideoTracks().length > 0) {
                return !localVideo.srcObject.getVideoTracks()[0].enabled;
            }
            return true;
        };
        var getStats = function (callbackFn) {
            var browser = adapter.browserDetails.browser;
            if (connection && (browser == 'chrome' || browser == 'firefox' || browser == 'safari')) {
                var result = {outboundStream:{}, inboundStream:{}, otherStats:[]};
                result.type = browser;
                connection.getStats(null).then(function (stats) {
                    if (stats) {
                        stats.forEach(function (stat) {
                            if (stat.type == 'outbound-rtp' && !stat.isRemote) {
                                if (stat.mediaType == 'audio') {
                                    result.outboundStream.audioStats = stat;
                                } else if (stat.mediaType == 'video') {
                                    result.outboundStream.videoStats = stat;
                                } else {
                                    result.otherStats.push(stat);
                                }
                            } else if (stat.type == 'inbound-rtp' && !stat.isRemote) {
                                //safari does not have a mediaType variable for incoming statistics
                                if (stat.mediaType == 'audio' || (browser == 'safari' && stat.id.indexOf('Audio') != -1)) {
                                    result.inboundStream.audioStats = stat;
                                } else if (stat.mediaType == 'video' || (browser == 'safari' && stat.id.indexOf('Video') != -1)) {
                                    result.inboundStream.videoStats = stat;
                                } else {
                                    result.otherStats.push(stat);
                                }
                            } else {
                                result.otherStats.push(stat);
                            }
                        });
                        callbackFn(result);
                    }
                });
            }
        };

        var fullScreen = function () {
            var video = document.getElementById(id);
            if (video) {
                if (!document.fullscreenElement && !document.mozFullScreenElement &&
                    !document.webkitFullscreenElement && !document.msFullscreenElement) {
                    if (video.requestFullscreen) {
                        video.requestFullscreen();
                    } else if (video.msRequestFullscreen) {
                        video.msRequestFullscreen();
                    } else if (video.mozRequestFullScreen) {
                        video.mozRequestFullScreen();
                    } else if (video.webkitRequestFullscreen) {
                        video.webkitRequestFullscreen();
                    } else if (video.webkitEnterFullscreen) {
                        video.webkitEnterFullscreen();
                        //hack for iOS safari. Video is getting paused when switching from fullscreen to normal mode.
                        video.addEventListener("pause", function(){
                            video.play();
                        });
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }
            }
        };

        var switchCam = function (deviceId) {
            return new Promise(function(resolve,reject) {
                if (localVideo && localVideo.srcObject && videoCams.length > 1 && !customStream) {
                    connection.getSenders().forEach(function (sender) {
                        if (sender.track.kind === 'audio') return;
                        switchCamCount = (switchCamCount + 1) % videoCams.length;
                        sender.track.stop();
                        var cam = (typeof deviceId !== "undefined") ? deviceId : videoCams[switchCamCount];
                        //use the settings that were set during connection initiation
                        var clonedConstraints = Object.assign({}, constraints);
                        clonedConstraints.video.deviceId = {exact: cam};
                        clonedConstraints.audio = false;
                        navigator.mediaDevices.getUserMedia(clonedConstraints).then(function (newStream) {
                            var newVideoTrack = newStream.getVideoTracks()[0];
                            newVideoTrack.enabled = localVideo.srcObject.getVideoTracks()[0].enabled;
                            var audioTrack = localVideo.srcObject.getAudioTracks()[0];
                            sender.replaceTrack(newVideoTrack);
                            localVideo.srcObject = newStream;
                            // On Safari mobile _newStream_ doesn't contain audio track, so we need to add track from previous stream
                            if (localVideo.srcObject.getAudioTracks().length == 0 && audioTrack) {
                                localVideo.srcObject.addTrack(audioTrack);
                            }
                            logger.info("Switch camera to " + cam);
                            resolve(cam);
                        }).catch(function (reason) {
                            logger.error(LOG_PREFIX, reason);
                            reject(reason);
                        });
                    });
                } else {
                    reject(constants.ERROR_INFO.CAN_NOT_SWITCH_CAM);
                }
            });

        };

        var switchMic = function (deviceId) {
            return new Promise(function(resolve,reject) {
                if (localVideo && localVideo.srcObject && mics.length > 1 && !customStream) {
                    connection.getSenders().forEach(function (sender) {
                        if (sender.track.kind === 'video') return;
                        switchMicCount = (switchMicCount + 1) % mics.length;
                        sender.track.stop();
                        if(microphoneGain) {
                            microphoneGain.release();
                        }
                        var mic = (typeof deviceId !== "undefined") ? deviceId : mics[switchMicCount];
                        //use the settings that were set during connection initiation
                        var clonedConstraints = Object.assign({}, constraints);
                        clonedConstraints.audio.deviceId = {exact: mic};
                        clonedConstraints.video = false;
                        navigator.mediaDevices.getUserMedia(clonedConstraints).then(function (newStream) {
                            if(microphoneGain) {
                                var currentGain = microphoneGain.gain.value;
                                microphoneGain = createGainNode(newStream);
                                microphoneGain.gain.value = currentGain;
                            }
                            var newAudioTrack = newStream.getAudioTracks()[0];
                            newAudioTrack.enabled = localVideo.srcObject.getAudioTracks()[0].enabled;
                            currentAudioTrack = newAudioTrack;
                            sender.replaceTrack(newAudioTrack);
                            var videoTrack = localVideo.srcObject.getVideoTracks()[0];
                            localVideo.srcObject = newStream;
                            if(videoTrack) {
                                localVideo.srcObject.addTrack(videoTrack);
                            }
                            logger.info("Switch mic to " + mic);
                            resolve(mic);
                        }).catch(function (reason) {
                            logger.error(LOG_PREFIX, reason);
                            reject(reason);
                        });
                    });
                } else {
                    reject(constants.ERROR_INFO.CAN_NOT_SWITCH_MIC);
                }
            });
        };

        var exports = {};
        exports.state = state;
        exports.createOffer = createOffer;
        exports.createAnswer = createAnswer;
        exports.setRemoteSdp = setRemoteSdp;
        exports.changeAudioCodec = changeAudioCodec;
        exports.close = close;
        exports.setAudioOutputId = setAudioOutputId;
        exports.setVolume = setVolume;
        exports.setMicrophoneGain = setMicrophoneGain;
        exports.getVolume = getVolume;
        exports.muteAudio = muteAudio;
        exports.unmuteAudio = unmuteAudio;
        exports.isAudioMuted = isAudioMuted;
        exports.muteVideo = muteVideo;
        exports.unmuteVideo = unmuteVideo;
        exports.isVideoMuted = isVideoMuted;
        exports.getStats = getStats;
        exports.fullScreen = fullScreen;
        exports.switchCam = switchCam;
        exports.switchMic = switchMic;
        connections[id] = exports;
        resolve(exports);
    });
};


var mixAudioTracks = function (stream1, stream2) {
    var stream1Sound = audioContext.createMediaStreamSource(stream1);
    var stream2Sound = audioContext.createMediaStreamSource(stream2);
    var destination = audioContext.createMediaStreamDestination();
    var newStream = destination.stream;
    stream1Sound.connect(destination);
    stream2Sound.connect(destination);
    return newStream.getAudioTracks()[0];
};

var getMediaAccess = function (constraints, display) {
    return new Promise(function (resolve, reject) {
        if (!constraints) {
            constraints = defaultConstraints;
            var cacheInstance = getCacheInstance(display);
            if (cacheInstance && cacheInstance.srcObject) {
                resolve(display);
                return;
            }
        } else {
            constraints = normalizeConstraints(constraints);
            releaseMedia(display);
        }
        if(!constraints.video && !constraints.audio && !constraints.customStream) {
            resolve(display);
            return;
        }
        //check if this is screen sharing
        if (constraints.video && constraints.video.type && constraints.video.type == "screen") {
            delete constraints.video.type;
            getScreenDeviceId(constraints).then(function (screenSharingConstraints) {
                //copy constraints
                constraints.sourceId = screenSharingConstraints.sourceId;
                constraints.systemSound = screenSharingConstraints.systemSoundAccess;
                delete screenSharingConstraints.sourceId;
                delete screenSharingConstraints.systemSoundAccess;

                for (var prop in screenSharingConstraints) {
                    if (screenSharingConstraints.hasOwnProperty(prop)) {
                        constraints.video[prop] = screenSharingConstraints[prop];
                    }
                }
                if (adapter.browserDetails.browser == "chrome") {
                    delete constraints.video.frameRate;
                    delete constraints.video.height;
                    delete constraints.video.width;
                }
                getAccess(constraints, true);
            }, reject);
        } else {
            getAccess(constraints);
        }

        function getAccess(constraints, screenShare) {
            logger.info(LOG_PREFIX, constraints);
            var requestAudioConstraints = null;
            if (screenShare) {
                if (constraints.audio && adapter.browserDetails.browser == "chrome") {
                    requestAudioConstraints = constraints.audio;
                    delete constraints.audio;
                }
                if (constraints.systemSound) {
                    constraints.audio = {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: constraints.sourceId,
                            echoCancellation: true
                        },
                        optional: []
                    };
                    delete constraints.systemSound;
                }
            }
            if (constraints.customStream) {
                //get tracks if we have at least one defined constraint
                if (constraints.audio || constraints.video) {
                    //remove customStream from constraints before passing to GUM
                    var normalizedConstraints = {
                        audio: constraints.audio ? constraints.audio : false,
                        video: constraints.video ? constraints.video : false
                    };
                    navigator.getUserMedia(normalizedConstraints, function (stream) {
                        //add resulting tracks to customStream
                        stream.getTracks().forEach(function (track) {
                            constraints.customStream.addTrack(track);
                        });
                        //display customStream
                        loadVideo(display, constraints.customStream, screenShare, requestAudioConstraints, resolve, constraints);
                    }, reject);
                } else {
                    //display customStream
                    loadVideo(display, constraints.customStream, screenShare, requestAudioConstraints, resolve, constraints);
                }
            } else {
                navigator.getUserMedia(constraints, function (stream) {
                    loadVideo(display, stream, screenShare, requestAudioConstraints, resolve, constraints);
                }, reject);
            }
        }
    });
};

var loadVideo = function (display, stream, screenShare, requestAudioConstraints, resolve, constraints) {
    var video = getCacheInstance(display);
    if (!video) {
        video = document.createElement('video');
        display.appendChild(video);
    }
    if (stream.getAudioTracks().length > 0 && adapter.browserDetails.browser == "chrome") {
        microphoneGain = createGainNode(stream);
    }
    video.id = uuid_v1() + LOCAL_CACHED_VIDEO;
    video.srcObject = stream;
    //mute audio
    video.muted = true;
    video.onloadedmetadata = function (e) {
        if (screenShare && !window.chrome) {
            setScreenResolution(video, stream, constraints);
        }
        video.play();
    };
    if (constraints.systemSound && adapter.browserDetails.browser == "chrome") {
        addSystemSound();
    } else {
        resolveCallback();
    }

    function resolveCallback() {
        // This hack for chrome only, firefox supports screen-sharing + audio natively
        if (requestAudioConstraints && adapter.browserDetails.browser == "chrome") {
            logger.info(LOG_PREFIX, "Request for audio stream");
            navigator.getUserMedia({audio: requestAudioConstraints}, function (stream) {
                logger.info(LOG_PREFIX, "Got audio stream, add it to video stream");
                if (video.srcObject.getAudioTracks()[0]) {
                    var mixedTrack = mixAudioTracks(stream, video.srcObject);
                    var originalTrack = video.srcObject.getAudioTracks()[0];
                    video.srcObject.removeTrack(originalTrack);
                    video.srcObject.addTrack(mixedTrack);
                } else {
                    video.srcObject.addTrack(stream.getAudioTracks()[0]);
                }
                resolve(display);
            });
        } else {
            resolve(display);
        }
    }

    function addSystemSound() {
        chrome.runtime.sendMessage(extensionId, {type: "isInstalled"}, function (response) {
            if (response) {
                chrome.runtime.sendMessage(extensionId, {type: "getSourceId"}, function (response) {
                    if (response.error) {
                        resolveCallback();
                        logger.error(LOG_PREFIX, response.error);
                    } else {
                        if (response.systemSoundAccess) {
                            var constraints = {
                                audio: {
                                    mandatory: {
                                        chromeMediaSource: 'desktop',
                                        chromeMediaSourceId: response.sourceId,
                                        echoCancellation: true
                                    },
                                    optional: []
                                },
                                video: {
                                    mandatory: {
                                        chromeMediaSource: 'desktop',
                                        chromeMediaSourceId: response.sourceId
                                    },
                                    optional: []
                                }
                            };
                            navigator.getUserMedia(constraints, function (audioStream) {
                                if (stream.getAudioTracks().length > 0) {
                                    var originalAudioTrack = stream.getAudioTracks()[0];
                                    var mixedTrack = mixAudioTracks(stream, audioStream);
                                    stream.addTrack(mixedTrack);
                                    stream.removeTrack(originalAudioTrack);
                                } else {
                                    stream.addTrack(audioStream.getAudioTracks()[0]);
                                }
                                resolveCallback();
                            }, function (reason) {
                                resolveCallback();
                                logger.error(LOG_PREFIX, reason);
                            });
                        } else {
                            resolveCallback();
                            logger.error(LOG_PREFIX, "System sound: access is denied by the user");
                        }
                    }
                });
            } else {
                resolveCallback();
            }
        });
    }
};

var createGainNode = function (stream) {
    var audioCtx = audioContext;
    var source = audioCtx.createMediaStreamSource(stream);
    var gainNode = audioCtx.createGain();
    var destination = audioCtx.createMediaStreamDestination();
    var outputStream = destination.stream;
    source.connect(gainNode);
    gainNode.connect(destination);
    var sourceAudioTrack = stream.getAudioTracks()[0];
    gainNode.sourceAudioTrack = sourceAudioTrack;
    gainNode.release = function () {
        this.sourceAudioTrack.stop();
        this.disconnect();
    };
    stream.addTrack(outputStream.getAudioTracks()[0]);
    stream.removeTrack(sourceAudioTrack);
    return gainNode;
};

//Fix to set screen resolution for screen sharing in Firefox
var setScreenResolution = function (video, stream, constraints) {
    var newHeight;
    var newWidth;
    var videoRatio;
    if (video.videoWidth > video.videoHeight) {
        videoRatio = video.videoWidth / video.videoHeight;
        newHeight = constraints.video.videoWidth / videoRatio;
        newWidth = constraints.video.videoWidth;
    } else {
        videoRatio = video.videoHeight / video.videoWidth;
        newWidth = constraints.video.videoHeight / videoRatio;
        newHeight = constraints.video.videoHeight;
    }
    console.log("videoRatio === " + videoRatio);
    stream.getVideoTracks()[0].applyConstraints({height: newHeight, width: newWidth});
};

var getScreenDeviceId = function (constraints) {
    return new Promise(function (resolve, reject) {
        var o = {};
        if (window.chrome) {
            chrome.runtime.sendMessage(extensionId, {type: "isInstalled"}, function (response) {
                if (response) {
                    o.maxWidth = constraints.video.width;
                    o.maxHeight = constraints.video.height;
                    o.maxFrameRate = constraints.video.frameRate.max;
                    o.chromeMediaSource = "desktop";
                    chrome.runtime.sendMessage(extensionId, {type: "getSourceId"}, function (response) {
                        if (response.error) {
                            reject(new Error("Screen access denied"));
                        } else {
                            o.chromeMediaSourceId = response.sourceId;
                            resolve({
                                mandatory: o,
                                sourceId: response.sourceId,
                                systemSoundAccess: response.systemSoundAccess
                            });
                        }
                    });
                } else {
                    reject(new Error("Screen sharing extension is not available"));
                }
            });
        } else {
            //firefox case
            o.mediaSource = constraints.video.mediaSource;

            o.width = {};
            o.height = {};
            o.frameRate = {
                min: constraints.video.frameRate.max,
                max: constraints.video.frameRate.max
            };
            o.videoWidth = constraints.video.width;
            o.videoHeight = constraints.video.height;
            resolve(o);
        }
    });
};

var releaseMedia = function (display) {
    var video = getCacheInstance(display);
    if (video) {
        removeVideoElement(video);
        return true;
    }
    return false;
};

function getCacheInstance(display) {
    if (!display) return;
    var i;
    for (i = 0; i < display.children.length; i++) {
        if (display.children[i] && (display.children[i].id.indexOf(LOCAL_CACHED_VIDEO) != -1 || display.children[i].id.indexOf(REMOTE_CACHED_VIDEO) != -1)) {
            logger.info(LOG_PREFIX, "FOUND WEBRTC CACHED INSTANCE, id " + display.children[i].id);
            return display.children[i];
        }
    }
}

function removeVideoElement(video) {
    if (video.srcObject) {
        //pause
        video.pause();
        //stop media tracks
        var tracks = video.srcObject.getTracks();
        for (var i = 0; i < tracks.length; i++) {
            tracks[i].stop();
            if(video.id.indexOf(LOCAL_CACHED_VIDEO) != -1 && tracks[i].kind == 'audio' && microphoneGain) {
                microphoneGain.release();
            }
        }
        video.srcObject = null;
    }
}

/**
 * Check WebRTC available
 *
 * @returns {boolean} webrtc available
 */
var available = function () {
    //return (adapter.browserDetails.browser != "edge") ? navigator.getUserMedia && RTCPeerConnection : false;
    return ('getUserMedia' in navigator && 'RTCPeerConnection' in window);
};

var listDevices = function (labels, kind) {
    if (!kind) {
        kind = constants.MEDIA_DEVICE_KIND.INPUT;
    } else if (kind == "all") {
        kind = "";
    }
    var getConstraints = function (devices) {
        var constraints = {};
        for (var i = 0; i < devices.length; i++) {
            var device = devices[i];
            if (device.kind.indexOf("audio"+ kind) === 0) {
                constraints.audio = true;
            } else if (device.kind.indexOf("video"+ kind) === 0) {
                constraints.video = true;
            } else {
                logger.debug(LOG_PREFIX, "unknown device " + device.kind + " id " + device.deviceId);
            }
        }
        return constraints;
    };

    var getList = function (devices) {
        var list = {
            audio: [],
            video: []
        };
        for (var i = 0; i < devices.length; i++) {
            var device = devices[i];
            var ret = {
                id: device.deviceId,
                label: device.label
            };
            var micCount = 0;
            var camCount = 0;
            if (device.kind.indexOf("audio" + kind) === 0 && device.deviceId != "communications") {
                ret.type = (device.kind == "audioinput") ? "mic" : "speaker";
                if (ret.type == "mic" && ret.label == "") {
                    ret.label = 'microphone' + ++micCount;
                }
                list.audio.push(ret);
            } else if (device.kind.indexOf("video" + kind) === 0) {
                if (ret.label == "") {
                    ret.label = 'camera' + ++camCount;
                }
                ret.type = "camera";
                list.video.push(ret);
            } else {
                logger.debug(LOG_PREFIX, "unknown device " + device.kind + " id " + device.deviceId);
            }
        }
        return list;
    };

    return new Promise(function (resolve, reject) {
        if(kind === constants.MEDIA_DEVICE_KIND.OUTPUT && adapter.browserDetails.browser !== "chrome") {
            reject({message: "Only supported in chrome"});
        } else {
            navigator.mediaDevices.enumerateDevices().then(function (devices) {
                if (labels) {
                    var display = document.createElement("div");
                    getMediaAccess(getConstraints(devices), display).then(function () {
                        navigator.mediaDevices.enumerateDevices().then(function (devicesWithLabales) {
                            resolve(getList(devicesWithLabales));
                            releaseMedia(display);
                        }, reject);
                    }, reject);
                } else {
                    resolve(getList(devices));
                }
            }, reject);
        }
    });
};

function normalizeConstraints(constraints) {
    if (constraints.video) {
        if (constraints.video.hasOwnProperty('frameRate') && typeof constraints.video.frameRate !== 'object') {
            // Set default FPS value
            var frameRate = (constraints.video.frameRate == 0) ? 30 : constraints.video.frameRate;
            constraints.video.frameRate = {
                ideal: frameRate
            }
        }
        if (constraints.video === true) {
            constraints.video = {};
        }
        if (typeof constraints.video === 'object') {
            var width = constraints.video.width;
            var height = constraints.video.height;
            if (adapter.browserDetails.browser == "safari") {
                if (!width || !height) {
                    constraints.video.width = {min: 320, max: 640};
                    constraints.video.height = {min: 240, max: 480};
                } else if (typeof width !== 'object' || typeof height !== 'object') {
                    constraints.video.width = {min: width, max: width};
                    constraints.video.height = {min: height, max: height};
                }
            } else if (isNaN(width) || width === 0 || isNaN(height) || height === 0) {
                constraints.video.width = 320;
                constraints.video.height = 240;
            }
        }
    }

    if (constraints.audio) {
        // The WebRTC AEC implementation doesn't work well on stereophonic sound and makes mono on output
        if (constraints.audio.stereo) {
            constraints.audio.echoCancellation = false;
            constraints.audio.googEchoCancellation = false
        }
    }
    return constraints;
}

var playFirstSound = function () {
    if (audioContext) {
        var buffer = audioContext.createBuffer(1, 441, 44100);
        var output = buffer.getChannelData(0);
        for (var i = 0; i < output.length; i++) {
            output[i] = 0;
        }
        var source = audioContext.createBufferSource();
        source.buffer = buffer;
        // Connect to output (speakers)
        source.connect(audioContext.destination);
        // Play sound
        if (source.start) {
            source.start(0);
        } else if (source.play) {
            source.play(0);
        } else if (source.noteOn) {
            source.noteOn(0);
        }
        return true;
    }
    return false;
};

var playFirstVideo = function (display, isLocal, src) {
    if (!getCacheInstance(display)) {
        var video = document.createElement('video');
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        display.appendChild(video);
        video.id = uuid_v1() + (isLocal ? LOCAL_CACHED_VIDEO : REMOTE_CACHED_VIDEO);
        if (src) {
            video.src = src;
        } else {
            video.src = "../../dependencies/media/preloader.mp4";
        }
        video.play();
    }
};

module.exports = {
    createConnection: createConnection,
    getMediaAccess: getMediaAccess,
    releaseMedia: releaseMedia,
    listDevices: listDevices,
    playFirstSound: playFirstSound,
    playFirstVideo: playFirstVideo,
    available: available,
    configure: function (configuration) {
        extensionId = configuration.extensionId;
        defaultConstraints = configuration.constraints;
        audioContext = configuration.audioContext;
        logger = configuration.logger;
        logger.info(LOG_PREFIX, "Initialized");
    }
};
},{"./constants":24,"./util":29,"uuid/v1":10,"webrtc-adapter":11}],31:[function(require,module,exports){
'use strict';

var WSPlayer = require('./WSPlayer').WSPlayer;
var util = require('./util');
var WSPlayer_ = new WSPlayer();
var connections = {};
var receiverLocation = "./WSReceiver2.js";
var decoderLocation = "./video-worker2.js";
var DEFAULT_SDP = "v=0\r\n" +
    "o=- 1988962254 1988962254 IN IP4 0.0.0.0\r\n" +
    "c=IN IP4 0.0.0.0\r\n" +
    "t=0 0\r\n" +
    "a=sdplang:en\r\n" +
    "m=video 0 RTP/AVP 32\r\n" +
    "a=rtpmap:32 MPV/90000\r\n" +
    "a=recvonly\r\n" +
    "m=audio 0 RTP/AVP 0\r\n" +
    "a=rtpmap:0 PCMU/8000\r\n" +
    "a=recvonly\r\n";

var logger;
var LOG_PREFIX = "websocket";
var audioContext;

var createConnection = function(options, handlers) {
    return new Promise(function(resolve, reject) {
        var id = options.id;
        var display = options.display;

        var canvas = document.createElement("canvas");
        display.appendChild(canvas);
        canvas.id = id;

        var createOffer = function(options) {
            return new Promise(function (resolve, reject) {
                var o ={};
                o.sdp = DEFAULT_SDP;
                o.player = WSPlayer_;
                resolve(o);
            });
        };
        var setRemoteSdp = function(sdp) {
            return new Promise(function (resolve,reject){
                resolve();
            });
        };
        var close = function() {
            WSPlayer_.stop();
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
            delete connections[id];
        };
        var setVolume = function(volume) {
            WSPlayer_.setVolume(volume);
        };
        var getVolume = function() {
            if (WSPlayer_) {
                return WSPlayer_.getVolume();
            }
            return -1;
        };
        var fullScreen = function() {
            if (canvas) {
                if (!document.fullscreenElement && !document.mozFullScreenElement &&
                    !document.webkitFullscreenElement && !document.msFullscreenElement) {
                    if (canvas.requestFullscreen) {
                        canvas.requestFullscreen();
                    } else if (canvas.msRequestFullscreen) {
                        canvas.msRequestFullscreen();
                    } else if (canvas.mozRequestFullScreen) {
                        canvas.mozRequestFullScreen();
                    } else if (canvas.webkitRequestFullscreen) {
                        canvas.webkitRequestFullscreen();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }
            }
        }

        try {

            var config = {};
            config.urlWsServer = options.mainUrl;
            config.token = options.authToken;
            config.receiverPath = receiverLocation;
            config.decoderPath = decoderLocation;
            config.streamId = id;
            config.api = handlers;
            config.canvas = canvas;
            config.videoWidth = 320;
            config.videoHeight = 240;
            config.startWithVideoOnly = false;
            config.keepLastFrame = false;

            var reinit = false;
            if (WSPlayer_.initialized) {
                reinit = true;
            }
            WSPlayer_.initLogger(0);
            WSPlayer_.init(config, audioContext, reinit);
        } catch (e) {
            reject(new Error('Failed to init stream receiver ' + e));
        }
        var exports = {};
        exports.createOffer = createOffer;
        exports.setRemoteSdp = setRemoteSdp;
        exports.close = close;
        exports.setVolume = setVolume;
        exports.getVolume = getVolume;
        exports.fullScreen = fullScreen;
        connections[id] = exports;
        resolve(connections[id]);
    });
};

// return Promise(reject)
var getMediaAccess = function() {
    return new Promise(function(resolve, reject) {
        reject(new Error("This provider doesn't support getMediaAccess"));
    });
};

var listDevices = function() {
    return new Promise(function(resolve, reject) {
       reject(new Error("This provider doesn't support listDevices"));
    });
};

// always false
var releaseMedia = function() {
    return false;
};

var playFirstSound = function(noise) {
    var audioBuffer = audioContext.createBuffer(1, 441, 44100);
    var output = audioBuffer.getChannelData(0);
    for (var i = 0; i < output.length; i++) {
        if (noise) {
            output[i] = Math.random() * 2 - 1;
        } else {
            output[i] = 0;
        }
    }
    var src = audioContext.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(audioContext.destination);
    src.start(0);
};

var playFirstVideo = function() {
    return true;
};

/**
 * Check WebSocket available
 *
 * @returns {boolean} WSPlayer available
 */
var available = function(audioContext){
    return (audioContext) ? true : false;
};

module.exports = {
    createConnection: createConnection,
    getMediaAccess: getMediaAccess,
    releaseMedia: releaseMedia,
    available: available,
    listDevices: listDevices,
    playFirstSound: playFirstSound,
    playFirstVideo: playFirstVideo,
    configure: function(configuration) {
        audioContext = configuration.audioContext;
        receiverLocation = configuration.receiverLocation || receiverLocation;
        decoderLocation = configuration.decoderLocation || decoderLocation;
        logger = configuration.logger;
        logger.info(LOG_PREFIX, "Initialized");
    }
};
},{"./WSPlayer":23,"./util":29}]},{},[26])(26)
});
