(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = null;
    hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("constants.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by rafaelkallis on 04.11.16.
 */

var PREPARE = exports.PREPARE = 'PREPARE';
var YES = exports.YES = 'YES';
var NO = exports.NO = 'NO';
var COMMIT = exports.COMMIT = 'COMMIT';
var ABORT = exports.ABORT = 'ABORT';
var ACK = exports.ACK = 'ACK';
var TIMEOUT = exports.TIMEOUT = 'TIMEOUT';
var BUG_NO = exports.BUG_NO = 1;
var BUG_TIMEOUT = exports.BUG_TIMEOUT = 2;
var SUCCESS_MSG = exports.SUCCESS_MSG = 'OK\n';
var FAIL_MSG = exports.FAIL_MSG = 'ABORTED\n';
var SUCCESS = exports.SUCCESS = 'SUCCESS';
var FAIL = exports.FAIL = 'FAIL';
});

require.register("coordinator.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Coordinator = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require('bluebird');

var _observable = require('./observable');

var _constants = require('./constants');

var _errors = require('./errors');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by rafaelkallis on 03.11.16.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Coordinator = exports.Coordinator = function (_Observable) {
    _inherits(Coordinator, _Observable);

    function Coordinator() {
        _classCallCheck(this, Coordinator);

        var _this = _possibleConstructorReturn(this, (Coordinator.__proto__ || Object.getPrototypeOf(Coordinator)).call(this));

        _this._active = true;
        _this._subordinates = [];
        _this._log_listeners = [];
        _this._pending_abort = {};
        _this._pending_commit = {};
        return _this;
    }

    _createClass(Coordinator, [{
        key: 'listen',
        value: function listen(log_listener) {
            this._log_listeners.push(log_listener);
        }
    }, {
        key: '_log',
        value: function _log(entry) {
            var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            this._log_listeners.forEach(function (log_listener) {
                return log_listener(entry, duration);
            });
            return _bluebird.Promise.resolve();
        }
    }, {
        key: 'perform_transaction',
        value: function perform_transaction(transaction, delay, bugs) {
            var _this2 = this;

            this._prepare(transaction, delay, bugs).catch(_errors.PrepareNoVoteError, _errors.SubordinateNotActiveError, function (err) {
                return _this2._abort(transaction, delay, bugs).then(function () {
                    return _bluebird.Promise.reject(err);
                });
            }).then(function () {
                return _this2._commit(transaction, delay, bugs);
            }).catch(_errors.PrepareNoVoteError, _errors.CoordinatorNotActiveError, _errors.SubordinateNotActiveError, this._ignore);
        }
    }, {
        key: 'toggle',
        value: function toggle() {
            var _this3 = this;

            if (this.active = !this.active) {
                _bluebird.Promise.all(Object.keys(this._pending_commit).map(function (transaction_id) {
                    return _this3._pending_commit[transaction_id];
                }).map(function (transaction_info) {
                    return _this3._log(transaction_info.transaction.id + ': Recovering Commit').then(function () {
                        return _this3._commit(transaction_info.transaction, transaction_info.delay, transaction_info.bugs);
                    });
                }));

                _bluebird.Promise.all(Object.keys(this._pending_abort).map(function (transaction_id) {
                    return _this3._pending_abort[transaction_id];
                }).map(function (transaction_info) {
                    return _this3._log(transaction_info.transaction.id + ': Recovering Abort').then(function () {
                        return _this3._abort(transaction_info.transaction, transaction_info.delay, transaction_info.bugs);
                    });
                }));
            }
            return this.active;
        }
    }, {
        key: 'attach_subordinate',
        value: function attach_subordinate(subordinate) {
            this.subordinates = this.subordinates.concat(subordinate);
        }
    }, {
        key: '_prepare',
        value: function _prepare(transaction, delay, bugs) {
            var _this4 = this;

            return this.is_active().then(function () {
                return _this4._log(transaction.id + ': Sending Prepare', delay);
            }).then(function () {
                return transaction.phase = _constants.PREPARE;
            }).then(function () {
                var coord_crash_sending_idx = bugs.indexOf('coord-crash-prepare-sending');
                var coord_crash_sending = coord_crash_sending_idx != -1;
                if (coord_crash_sending) {
                    bugs.splice(coord_crash_sending_idx, 1);
                    setTimeout(function () {
                        return _this4.active = false;
                    }, delay * 0.5);
                }
            }).then(function () {
                var coord_crash_receiving_idx = bugs.indexOf('coord-crash-prepare-receiving');
                var coord_crash_receiving = coord_crash_receiving_idx != -1;
                if (coord_crash_receiving) {
                    bugs.splice(coord_crash_receiving_idx, 1);
                    setTimeout(function () {
                        return _this4.active = false;
                    }, delay * 1.5);
                }
            }).then(function () {
                return _bluebird.Promise.all(_this4.subordinates.map(function (sub) {
                    return _this4.is_active().then(function () {
                        var sub_crash_receiving_idx = bugs.indexOf('sub-crash-prepare-receiving');
                        var sub_crash_receiving = sub_crash_receiving_idx != -1;
                        if (sub_crash_receiving && Math.random() < 0.6) {
                            bugs.splice(sub_crash_receiving_idx, 1);
                            setTimeout(function () {
                                return sub.active = false;
                            }, delay * 0.5);
                        }
                    }).then(function () {
                        var sub_crash_sending_idx = bugs.indexOf('sub-crash-prepare-sending');
                        var sub_crash_sending = sub_crash_sending_idx != -1;
                        if (sub_crash_sending && Math.random() < 0.6) {
                            bugs.splice(sub_crash_sending_idx, 1);
                            setTimeout(function () {
                                return sub.active = false;
                            }, delay * 1.5);
                        }
                    }).delay(delay).then(function () {
                        return _this4.is_active();
                    }).then(function () {
                        return sub.prepare(transaction, delay, bugs);
                    });
                }));
            });
        }
    }, {
        key: '_commit',
        value: function _commit(transaction, delay, bugs) {
            var _this5 = this;

            return this.is_active().then(function () {
                return _this5._log(transaction.id + ': Sending Commit', delay);
            }).then(function () {
                return transaction.phase = _constants.COMMIT;
            }).then(function () {
                return _this5._pending_commit[transaction.id] = { transaction: transaction, delay: delay, bugs: bugs };
            }).then(function () {
                var coord_crash_sending_idx = bugs.indexOf('coord-crash-commit-sending');
                var coord_crash_sending = coord_crash_sending_idx != -1;
                if (coord_crash_sending) {
                    setTimeout(function () {
                        return _this5.active = false;
                    }, delay * 0.5);
                    bugs.splice(coord_crash_sending_idx, 1);
                }
            }).then(function () {
                var coord_crash_receiving_idx = bugs.indexOf('coord-crash-commit-receiving');
                var coord_crash_receiving = coord_crash_receiving_idx != -1;
                if (coord_crash_receiving) {
                    setTimeout(function () {
                        return _this5.active = false;
                    }, delay * 1.5);
                    bugs.splice(coord_crash_receiving_idx, 1);
                }
            }).then(function () {
                return _bluebird.Promise.all(_this5.subordinates.map(function (sub) {
                    return _this5._commit_sub(sub, transaction, delay, bugs);
                }));
            }).then(function () {
                return _this5.is_active();
            }).then(function () {
                return delete _this5._pending_commit[transaction.id];
            }).then(function () {
                return _this5._log(transaction.id + ': Completed');
            }).then(function () {
                return transaction.phase = "Finished";
            });
        }
    }, {
        key: '_commit_sub',
        value: function _commit_sub(sub, transaction, delay, bugs) {
            var _this6 = this;

            var attempt_n = 0;
            var attempt_commit = function attempt_commit() {
                return _this6.is_active().then(function () {
                    if (attempt_n > 0) {
                        return _this6._log(transaction.id + ': retrying Commit on ' + sub.id + ' (' + attempt_n + ' attempt)', delay);
                    }
                }).then(function () {
                    var sub_crash_receiving_idx = bugs.indexOf('sub-crash-commit-receiving');
                    var sub_crash_receiving = sub_crash_receiving_idx != -1;
                    if (sub_crash_receiving && Math.random() < 0.6) {
                        bugs.splice(sub_crash_receiving_idx, 1);
                        setTimeout(function () {
                            return sub.active = false;
                        }, delay * 0.5);
                    }
                }).then(function () {
                    var sub_crash_sending_idx = bugs.indexOf('sub-crash-commit-sending');
                    var sub_crash_sending = sub_crash_sending_idx != -1;
                    if (sub_crash_sending && Math.random() < 0.6) {
                        bugs.splice(sub_crash_sending_idx, 1);
                        setTimeout(function () {
                            return sub.active = false;
                        }, delay * 1.5);
                    }
                }).delay(delay).then(function () {
                    return _this6.is_active();
                }).then(function () {
                    return sub.commit(transaction, delay, bugs);
                }).catch(_errors.SubordinateNotActiveError, function () {
                    return _bluebird.Promise.delay(Coordinator._exponential_backoff(++attempt_n)).then(function () {
                        return attempt_commit();
                    });
                });
            };

            return attempt_commit();
        }
    }, {
        key: '_abort',
        value: function _abort(transaction, delay, bugs) {
            var _this7 = this;

            return this.is_active().then(function () {
                return _this7._log(transaction.id + ': Sending Abort', delay);
            }).then(function () {
                return transaction.phase = _constants.ABORT;
            }).then(function () {
                return _this7._pending_abort[transaction.id] = { transaction: transaction, delay: delay, bugs: bugs };
            }).then(function () {
                var coord_crash_sending_idx = bugs.indexOf('coord-crash-abort-sending');
                var coord_crash_sending = coord_crash_sending_idx != -1;
                if (coord_crash_sending) {
                    setTimeout(function () {
                        return _this7.active = false;
                    }, delay * 0.5);
                    bugs.splice(coord_crash_sending_idx, 1);
                }
            }).then(function () {
                var coord_crash_receiving_idx = bugs.indexOf('coord-crash-abort-receiving');
                var coord_crash_receiving = coord_crash_receiving_idx != -1;
                if (coord_crash_receiving) {
                    setTimeout(function () {
                        return _this7.active = false;
                    }, delay * 1.5);
                    bugs.splice(coord_crash_receiving_idx, 1);
                }
            }).then(function () {
                return _bluebird.Promise.all(_this7.subordinates.map(function (sub) {
                    return _this7._abort_sub(sub, transaction, delay, bugs);
                }));
            }).then(function () {
                return _this7.is_active();
            }).then(function () {
                return delete _this7._pending_abort[transaction.id];
            }).then(function () {
                return _this7._log(transaction.id + ': Completed');
            }).then(function () {
                return transaction.phase = "Aborted";
            });
        }
    }, {
        key: '_abort_sub',
        value: function _abort_sub(sub, transaction, delay, bugs) {
            var _this8 = this;

            var attempt_n = 0;
            var attempt_abort = function attempt_abort() {
                return _this8.is_active().then(function () {
                    if (attempt_n > 0) {
                        return _this8._log(transaction.id + ': retrying Abort on ' + sub.id + ' (' + attempt_n + ')', delay);
                    }
                }).then(function () {
                    var sub_crash_receiving_idx = bugs.indexOf('sub-crash-abort-receiving');
                    var sub_crash_receiving = sub_crash_receiving_idx != -1;
                    if (sub_crash_receiving && Math.random() < 0.6) {
                        bugs.splice(sub_crash_receiving_idx, 1);
                        setTimeout(function () {
                            return sub.active = false;
                        }, delay * 0.5);
                    }
                }).then(function () {
                    var sub_crash_sending_idx = bugs.indexOf('sub-crash-abort-sending');
                    var sub_crash_sending = sub_crash_sending_idx != -1;
                    if (sub_crash_sending && Math.random() < 0.6) {
                        bugs.splice(sub_crash_sending_idx, 1);
                        setTimeout(function () {
                            return sub.active = false;
                        }, delay * 1.5);
                    }
                }).delay(delay).then(function () {
                    return _this8.is_active();
                }).then(function () {
                    return sub.abort(transaction, delay, bugs);
                }).catch(_errors.SubordinateNotActiveError, function () {
                    return _bluebird.Promise.delay(Coordinator._exponential_backoff(++attempt_n)).then(function () {
                        return attempt_abort();
                    });
                });
            };
            return attempt_abort();
        }
    }, {
        key: 'is_active',
        value: function is_active() {
            return this.active ? _bluebird.Promise.resolve() : _bluebird.Promise.reject(new _errors.CoordinatorNotActiveError());
        }
    }, {
        key: '_ignore',
        value: function _ignore(err) {
            return _bluebird.Promise.resolve();
        }
    }, {
        key: 'active',
        get: function get() {
            return this._active;
        },
        set: function set(active) {
            if (this.active !== active) {
                this._active = active;
                this._log(active ? "Online" : "Offline");
                this._notify();
            }
        }
    }, {
        key: 'subordinates',
        get: function get() {
            return this._subordinates;
        },
        set: function set(subordinates) {
            if (this.subordinates !== subordinates) {
                this._subordinates = subordinates;
                this._notify();
            }
        }
    }], [{
        key: '_exponential_backoff',
        value: function _exponential_backoff(attempt) {
            return 500 * Math.pow(2, attempt);
        }
    }]);

    return Coordinator;
}(_observable.Observable);

;
});

require.register("errors.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by rafaelkallis on 03.11.16.
 */

var PrepareNoVoteError = exports.PrepareNoVoteError = function PrepareNoVoteError() {
  _classCallCheck(this, PrepareNoVoteError);
};

;

var NotActiveError = exports.NotActiveError = function NotActiveError() {
  _classCallCheck(this, NotActiveError);
};

;

var CoordinatorNotActiveError = exports.CoordinatorNotActiveError = function CoordinatorNotActiveError() {
  _classCallCheck(this, CoordinatorNotActiveError);
};

;

var SubordinateNotActiveError = exports.SubordinateNotActiveError = function SubordinateNotActiveError() {
  _classCallCheck(this, SubordinateNotActiveError);
};

;

PrepareNoVoteError.prototype = Object.create(Error.prototype);
NotActiveError.prototype = Object.create(Error.prototype);
CoordinatorNotActiveError.prototype = Object.create(Error.prototype);
SubordinateNotActiveError.prototype = Object.create(Error.prototype);
});

require.register("explosion.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Explosion = exports.Explosion = function () {
    function Explosion(parent_element) {
        _classCallCheck(this, Explosion);

        this._parent_element = parent_element;
    }

    _createClass(Explosion, [{
        key: 'boom',
        value: function boom() {
            var _this = this;

            var explosion = document.createElement('div');
            this._parent_element.appendChild(explosion);
            explosion.classList.add('explosion');
            setTimeout(function () {
                return _this._parent_element.removeChild(explosion);
            }, 1000);
        }
    }]);

    return Explosion;
}();
});

;require.register("initialize.js", function(exports, require, module) {
'use strict';

var _coordinator = require('./coordinator');

var _subordinate = require('./subordinate');

var _transaction = require('./transaction');

var _errors = require('./errors');

var _notification = require('./notification');

var _explosion = require('./explosion');

var Promise = require('bluebird');

document.addEventListener('DOMContentLoaded', function () {
    // do your setup here
    console.log('Initialized app');
    Promise.each(Array.from(document.getElementsByTagName('katex')), function (element) {
        return katex.render(element.innerHTML, element);
    });
    document.getElementById('start-transaction-button').addEventListener('click', function () {
        return start_transaction();
    });
    window.onkeydown = function (event) {
        return event.keyCode == 13 && start_transaction();
    };

    var delay_value = document.getElementById('duration-value');
    var delay_slider = document.getElementById('duration-input');
    delay_slider.addEventListener('change', function () {
        delay_value.innerText = 'Delay: ' + delay_slider.value;
    });

    bind_log_updater('coordinator-log', coordinator);
    bind_log_updater('subordinate1-log', sub1);
    bind_log_updater('subordinate2-log', sub2);
    bind_log_updater('subordinate3-log', sub3);

    var coordinator_active_button = document.getElementById('coordinator-active-button');
    var sub1_active_button = document.getElementById('subordinate1-active-button');
    var sub2_active_button = document.getElementById('subordinate2-active-button');
    var sub3_active_button = document.getElementById('subordinate3-active-button');

    coordinator_active_button.addEventListener('click', function () {
        return coordinator.toggle();
    });
    sub1_active_button.addEventListener('click', function () {
        return sub1.toggle();
    });
    sub2_active_button.addEventListener('click', function () {
        return sub2.toggle();
    });
    sub3_active_button.addEventListener('click', function () {
        return sub3.toggle();
    });

    var coordinator_explosion = new _explosion.Explosion(document.getElementById('coordinator-explosion'));
    var subordinate1_explosion = new _explosion.Explosion(document.getElementById('subordinate1-explosion'));
    var subordinate2_explosion = new _explosion.Explosion(document.getElementById('subordinate2-explosion'));
    var subordinate3_explosion = new _explosion.Explosion(document.getElementById('subordinate3-explosion'));

    coordinator.observe(function (coordinator) {
        return !coordinator.active && coordinator_explosion.boom() || coordinator_active_button.classList.toggle('button-outline');
    });
    sub1.observe(function (sub1) {
        return !sub1.active && subordinate1_explosion.boom() || sub1_active_button.classList.toggle('button-outline');
    });
    sub2.observe(function (sub2) {
        return !sub2.active && subordinate2_explosion.boom() || sub2_active_button.classList.toggle('button-outline');
    });
    sub3.observe(function (sub3) {
        return !sub3.active && subordinate3_explosion.boom() || sub3_active_button.classList.toggle('button-outline');
    });
});

var sub1 = new _subordinate.Subordinate(1);
var sub2 = new _subordinate.Subordinate(2);
var sub3 = new _subordinate.Subordinate(3);

var coordinator = new _coordinator.Coordinator();

coordinator.attach_subordinate(sub1);
coordinator.attach_subordinate(sub2);
coordinator.attach_subordinate(sub3);

function start_transaction() {
    var bugs = [];
    document.getElementById('sub-vote-no').checked && bugs.push('sub-vote-no');
    document.getElementById('sub-crash-prepare-receiving').checked && bugs.push('sub-crash-prepare-receiving');
    document.getElementById('sub-crash-prepare-sending').checked && bugs.push('sub-crash-prepare-sending');
    document.getElementById('sub-crash-commit-receiving').checked && bugs.push('sub-crash-commit-receiving');
    document.getElementById('sub-crash-commit-sending').checked && bugs.push('sub-crash-commit-sending');
    document.getElementById('sub-crash-abort-receiving').checked && bugs.push('sub-crash-abort-receiving');
    document.getElementById('sub-crash-abort-sending').checked && bugs.push('sub-crash-abort-sending');
    document.getElementById('coord-crash-prepare-receiving').checked && bugs.push('coord-crash-prepare-receiving');
    document.getElementById('coord-crash-prepare-sending').checked && bugs.push('coord-crash-prepare-sending');
    document.getElementById('coord-crash-commit-receiving').checked && bugs.push('coord-crash-commit-receiving');
    document.getElementById('coord-crash-commit-sending').checked && bugs.push('coord-crash-commit-sending');
    document.getElementById('coord-crash-abort-receiving').checked && bugs.push('coord-crash-abort-receiving');
    document.getElementById('coord-crash-abort-sending').checked && bugs.push('coord-crash-abort-sending');

    var delay = document.getElementById('duration-input').value;
    var transaction = new _transaction.Transaction('some_payload');
    var notification = null;
    var log = document.getElementById('transaction-log');

    transaction.observe(function (transaction) {
        if (!notification) {
            notification = new _notification.Notification(transaction.id + ': ' + transaction.phase);
            log.appendChild(notification.element);
            log.scrollTop = log.scrollHeight;
        } else {
            notification.text = transaction.id + ': ' + transaction.phase;
        }
    });

    coordinator.perform_transaction(transaction, delay, bugs);
}

function ready(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function bind_log_updater(log_id, active_observable) {
    active_observable.listen(function (log_entry, duration) {
        var log = document.getElementById(log_id);
        var notification = new _notification.Notification(log_entry, duration);
        log.appendChild(notification.element);
        log.scrollTop = log.scrollHeight;
        active_observable.observe(function (active_observable) {
            return !active_observable.active && notification.stop_progress();
        });
    });
}
});

;require.register("notification.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var increment = 10;
var pi = 3.14159265;

var Notification = exports.Notification = function () {
    function Notification() {
        var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var duration = arguments[1];

        _classCallCheck(this, Notification);

        this._element = document.createElement('div');
        this._element.classList.add('progress-outter');

        this._p = document.createElement('p');
        this._p.classList.add('progress-text');
        this._p.innerText = text;
        this._element.appendChild(this._p);

        this._inner = document.createElement('div');
        this._inner.classList.add('progress-inner');
        this._element.appendChild(this._inner);

        this._is_progress_active = false;

        duration && this.start_progress(duration);
    }

    _createClass(Notification, [{
        key: 'start_progress',
        value: function start_progress(duration) {
            var _this = this;

            if (!this._is_progress_active) {
                (function () {
                    _this._is_progress_active = true;
                    _this._inner.style.width = '0';
                    var ms_passed = 100;
                    _this._interval = setInterval(function () {
                        ms_passed += increment;
                        _this._inner.style.width = 50 * (1 + Math.cos(pi + pi * Math.min(ms_passed / duration, 1))) + '%';
                        if (ms_passed > duration) {
                            _this.stop_progress();
                        }
                    }, increment);
                })();
            }
        }
    }, {
        key: 'stop_progress',
        value: function stop_progress() {
            if (this._is_progress_active) {
                clearInterval(this._interval);
                this._is_progress_active = false;
            }
        }
    }, {
        key: 'text',
        get: function get() {
            return this._p.innerText;
        },
        set: function set(text) {
            if (this._p.innerText !== text) {
                this._p.innerText = text;
            }
        }
    }, {
        key: 'element',
        get: function get() {
            return this._element;
        }
    }]);

    return Notification;
}();
});

;require.register("observable.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by rafaelkallis on 08.11.16.
 */

var Observable = exports.Observable = function () {
    function Observable() {
        _classCallCheck(this, Observable);

        this._observers = [];
    }

    _createClass(Observable, [{
        key: "observe",
        value: function observe(observer) {
            this._observers = this._observers.concat(observer);
        }
    }, {
        key: "_notify",
        value: function _notify() {
            var _this = this;

            this._observers.forEach(function (observer) {
                return _this._notify_observer(observer);
            });
        }
    }, {
        key: "_notify_observer",
        value: function _notify_observer(observer) {
            observer(this);
        }
    }]);

    return Observable;
}();
});

;require.register("subordinate.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Subordinate = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require('./constants');

var _errors = require('./errors');

var _observable = require('./observable');

var _bluebird = require('bluebird');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by rafaelkallis on 03.11.16.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Subordinate = exports.Subordinate = function (_Observable) {
    _inherits(Subordinate, _Observable);

    function Subordinate(id) {
        _classCallCheck(this, Subordinate);

        var _this = _possibleConstructorReturn(this, (Subordinate.__proto__ || Object.getPrototypeOf(Subordinate)).call(this));

        _this._id = id;
        _this._active = true;
        _this._log_listeners = [];
        return _this;
    }

    _createClass(Subordinate, [{
        key: 'listen',
        value: function listen(log_listener) {
            this._log_listeners.push(log_listener);
        }
    }, {
        key: '_log',
        value: function _log(entry) {
            var _this2 = this;

            var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            return new _bluebird.Promise(function (resolve) {
                _this2._log_listeners.forEach(function (log_listener) {
                    return log_listener(entry, duration);
                });
                resolve();
            });
        }
    }, {
        key: 'toggle',
        value: function toggle() {
            this.active = !this.active;
        }
    }, {
        key: 'is_active',
        value: function is_active() {
            return this.active ? _bluebird.Promise.resolve() : _bluebird.Promise.reject(new _errors.SubordinateNotActiveError());
        }
    }, {
        key: 'prepare',
        value: function prepare(transaction, delay, bugs) {
            var _this3 = this;

            var vote_no = bugs.includes('sub-vote-no') && Math.random() < 0.5;
            return this.is_active().then(function () {
                if (!vote_no) {
                    return _this3._log(transaction.id + ': YES', delay);
                } else {
                    return _this3._log(transaction.id + ': NO', delay);
                }
            }).delay(delay).then(function () {
                return _this3.is_active();
            }).then(function () {
                if (!vote_no) {
                    return _bluebird.Promise.resolve();
                } else {
                    return _bluebird.Promise.reject(new _errors.PrepareNoVoteError());
                }
            });
        }
    }, {
        key: 'commit',
        value: function commit(transaction, delay, bugs) {
            var _this4 = this;

            return this.is_active().then(function () {
                return _this4._log(transaction.id + ': ACK', delay);
            }).delay(delay).then(function () {
                return _this4.is_active();
            });
        }
    }, {
        key: 'abort',
        value: function abort(transaction, delay, bugs) {
            var _this5 = this;

            return this.is_active().then(function () {
                return _this5._log(transaction.id + ': ACK', delay);
            }).delay(delay).then(function () {
                return _this5.is_active();
            });
        }
    }, {
        key: 'active',
        get: function get() {
            return this._active;
        },
        set: function set(active) {
            if (this.active !== active) {
                this._active = active;
                this._notify();
                this._log(this.active ? "Online" : "Offline");
            }
        }
    }, {
        key: 'id',
        get: function get() {
            return this._id;
        }
    }]);

    return Subordinate;
}(_observable.Observable);
});

;require.register("transaction.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Transaction = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _observable = require('./observable');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var transaction_id_sequence = 0;

var Transaction = exports.Transaction = function (_Observable) {
    _inherits(Transaction, _Observable);

    function Transaction(payload) {
        _classCallCheck(this, Transaction);

        var _this = _possibleConstructorReturn(this, (Transaction.__proto__ || Object.getPrototypeOf(Transaction)).call(this));

        _this._id = transaction_id_sequence++;
        _this._payload = payload;
        _this._phase = '';
        return _this;
    }

    _createClass(Transaction, [{
        key: 'id',
        get: function get() {
            return this._id;
        }
    }, {
        key: 'payload',
        get: function get() {
            return this._payload;
        }
    }, {
        key: 'phase',
        get: function get() {
            return this._phase;
        },
        set: function set(phase) {
            if (this._phase !== phase) {
                this._phase = phase;
                this._notify();
            }
        }
    }]);

    return Transaction;
}(_observable.Observable);
});

;require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map