var $jscomp = $jscomp || {};

$jscomp.scope = {};

$jscomp.ASSUME_ES5 = !1;

$jscomp.ASSUME_NO_NATIVE_MAP = !1;

$jscomp.ASSUME_NO_NATIVE_SET = !1;

$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(b, a, h) {
    b != Array.prototype && b != Object.prototype && (b[a] = h.value);
};

$jscomp.getGlobal = function(b) {
    return "undefined" != typeof window && window === b ? b : "undefined" != typeof global && null != global ? global : b;
};

$jscomp.global = $jscomp.getGlobal(this);

$jscomp.polyfill = function(b, a, h, d) {
    if (a) {
        h = $jscomp.global;
        b = b.split(".");
        for (d = 0; d < b.length - 1; d++) {
            var f = b[d];
            f in h || (h[f] = {});
            h = h[f];
        }
        b = b[b.length - 1];
        d = h[b];
        a = a(d);
        a != d && null != a && $jscomp.defineProperty(h, b, {
            configurable: !0,
            writable: !0,
            value: a
        });
    }
};

$jscomp.underscoreProtoCanBeSet = function() {
    var b = {
        a: !0
    }, a = {};
    try {
        return a.__proto__ = b, a.a;
    } catch (h) {}
    return !1;
};

$jscomp.setPrototypeOf = "function" == typeof Object.setPrototypeOf ? Object.setPrototypeOf : $jscomp.underscoreProtoCanBeSet() ? function(b, a) {
    b.__proto__ = a;
    if (b.__proto__ !== a) throw new TypeError(b + " is not extensible");
    return b;
} : null;

$jscomp.polyfill("Object.setPrototypeOf", function(b) {
    return b || $jscomp.setPrototypeOf;
}, "es6", "es5");

$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";

$jscomp.initSymbol = function() {
    $jscomp.initSymbol = function() {};
    $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
};

$jscomp.Symbol = function() {
    var b = 0;
    return function(a) {
        return $jscomp.SYMBOL_PREFIX + (a || "") + b++;
    };
}();

$jscomp.initSymbolIterator = function() {
    $jscomp.initSymbol();
    var b = $jscomp.global.Symbol.iterator;
    b || (b = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));
    "function" != typeof Array.prototype[b] && $jscomp.defineProperty(Array.prototype, b, {
        configurable: !0,
        writable: !0,
        value: function() {
            return $jscomp.arrayIterator(this);
        }
    });
    $jscomp.initSymbolIterator = function() {};
};

$jscomp.arrayIterator = function(b) {
    var a = 0;
    return $jscomp.iteratorPrototype(function() {
        return a < b.length ? {
            done: !1,
            value: b[a++]
        } : {
            done: !0
        };
    });
};

$jscomp.iteratorPrototype = function(b) {
    $jscomp.initSymbolIterator();
    b = {
        next: b
    };
    b[$jscomp.global.Symbol.iterator] = function() {
        return this;
    };
    return b;
};

$jscomp.iteratorFromArray = function(b, a) {
    $jscomp.initSymbolIterator();
    b instanceof String && (b += "");
    var h = 0, d = {
        next: function() {
            if (h < b.length) {
                var f = h++;
                return {
                    value: a(f, b[f]),
                    done: !1
                };
            }
            d.next = function() {
                return {
                    done: !0,
                    value: void 0
                };
            };
            return d.next();
        }
    };
    d[Symbol.iterator] = function() {
        return d;
    };
    return d;
};

$jscomp.polyfill("Array.prototype.keys", function(b) {
    return b ? b : function() {
        return $jscomp.iteratorFromArray(this, function(b) {
            return b;
        });
    };
}, "es6", "es3");

$jscomp.makeIterator = function(b) {
    $jscomp.initSymbolIterator();
    var a = b[Symbol.iterator];
    return a ? a.call(b) : $jscomp.arrayIterator(b);
};

$jscomp.FORCE_POLYFILL_PROMISE = !1;

$jscomp.polyfill("Promise", function(b) {
    function a() {
        this.batch_ = null;
    }
    function h(b) {
        return b instanceof f ? b : new f(function(a, l) {
            a(b);
        });
    }
    if (b && !$jscomp.FORCE_POLYFILL_PROMISE) return b;
    a.prototype.asyncExecute = function(b) {
        null == this.batch_ && (this.batch_ = [], this.asyncExecuteBatch_());
        this.batch_.push(b);
        return this;
    };
    a.prototype.asyncExecuteBatch_ = function() {
        var b = this;
        this.asyncExecuteFunction(function() {
            b.executeBatch_();
        });
    };
    var d = $jscomp.global.setTimeout;
    a.prototype.asyncExecuteFunction = function(b) {
        d(b, 0);
    };
    a.prototype.executeBatch_ = function() {
        for (;this.batch_ && this.batch_.length; ) {
            var b = this.batch_;
            this.batch_ = [];
            for (var a = 0; a < b.length; ++a) {
                var e = b[a];
                delete b[a];
                try {
                    e();
                } catch (g) {
                    this.asyncThrow_(g);
                }
            }
        }
        this.batch_ = null;
    };
    a.prototype.asyncThrow_ = function(b) {
        this.asyncExecuteFunction(function() {
            throw b;
        });
    };
    var f = function(b) {
        this.state_ = 0;
        this.result_ = void 0;
        this.onSettledCallbacks_ = [];
        var a = this.createResolveAndReject_();
        try {
            b(a.resolve, a.reject);
        } catch (e) {
            a.reject(e);
        }
    };
    f.prototype.createResolveAndReject_ = function() {
        function b(b) {
            return function(c) {
                e || (e = !0, b.call(a, c));
            };
        }
        var a = this, e = !1;
        return {
            resolve: b(this.resolveTo_),
            reject: b(this.reject_)
        };
    };
    f.prototype.resolveTo_ = function(b) {
        if (b === this) this.reject_(new TypeError("A Promise cannot resolve to itself")); else if (b instanceof f) this.settleSameAsPromise_(b); else {
            a: switch (typeof b) {
              case "object":
                var a = null != b;
                break a;

              case "function":
                a = !0;
                break a;

              default:
                a = !1;
            }
            a ? this.resolveToNonPromiseObj_(b) : this.fulfill_(b);
        }
    };
    f.prototype.resolveToNonPromiseObj_ = function(b) {
        var a = void 0;
        try {
            a = b.then;
        } catch (e) {
            this.reject_(e);
            return;
        }
        "function" == typeof a ? this.settleSameAsThenable_(a, b) : this.fulfill_(b);
    };
    f.prototype.reject_ = function(b) {
        this.settle_(2, b);
    };
    f.prototype.fulfill_ = function(b) {
        this.settle_(1, b);
    };
    f.prototype.settle_ = function(b, a) {
        if (0 != this.state_) throw Error("Cannot settle(" + b + ", " + a | "): Promise already settled in state" + this.state_);
        this.state_ = b;
        this.result_ = a;
        this.executeOnSettledCallbacks_();
    };
    f.prototype.executeOnSettledCallbacks_ = function() {
        if (null != this.onSettledCallbacks_) {
            for (var b = this.onSettledCallbacks_, a = 0; a < b.length; ++a) b[a].call(), b[a] = null;
            this.onSettledCallbacks_ = null;
        }
    };
    var m = new a();
    f.prototype.settleSameAsPromise_ = function(b) {
        var a = this.createResolveAndReject_();
        b.callWhenSettled_(a.resolve, a.reject);
    };
    f.prototype.settleSameAsThenable_ = function(b, a) {
        var e = this.createResolveAndReject_();
        try {
            b.call(a, e.resolve, e.reject);
        } catch (g) {
            e.reject(g);
        }
    };
    f.prototype.then = function(b, a) {
        function e(b, a) {
            return "function" == typeof b ? function(a) {
                try {
                    l(b(a));
                } catch (t) {
                    c(t);
                }
            } : a;
        }
        var l, c, k = new f(function(b, a) {
            l = b;
            c = a;
        });
        this.callWhenSettled_(e(b, l), e(a, c));
        return k;
    };
    f.prototype.catch = function(b) {
        return this.then(void 0, b);
    };
    f.prototype.callWhenSettled_ = function(b, a) {
        function e() {
            switch (l.state_) {
              case 1:
                b(l.result_);
                break;

              case 2:
                a(l.result_);
                break;

              default:
                throw Error("Unexpected state: " + l.state_);
            }
        }
        var l = this;
        null == this.onSettledCallbacks_ ? m.asyncExecute(e) : this.onSettledCallbacks_.push(function() {
            m.asyncExecute(e);
        });
    };
    f.resolve = h;
    f.reject = function(b) {
        return new f(function(a, e) {
            e(b);
        });
    };
    f.race = function(b) {
        return new f(function(a, e) {
            for (var l = $jscomp.makeIterator(b), c = l.next(); !c.done; c = l.next()) h(c.value).callWhenSettled_(a, e);
        });
    };
    f.all = function(b) {
        var a = $jscomp.makeIterator(b), e = a.next();
        return e.done ? h([]) : new f(function(b, c) {
            function l(a) {
                return function(c) {
                    g[a] = c;
                    k--;
                    0 == k && b(g);
                };
            }
            var g = [], k = 0;
            do {
                g.push(void 0), k++, h(e.value).callWhenSettled_(l(g.length - 1), c), e = a.next();
            } while (!e.done);
        });
    };
    return f;
}, "es6", "es3");

$jscomp.polyfill("Object.is", function(b) {
    return b ? b : function(b, h) {
        return b === h ? 0 !== b || 1 / b === 1 / h : b !== b && h !== h;
    };
}, "es6", "es3");

$jscomp.polyfill("Array.prototype.includes", function(b) {
    return b ? b : function(b, h) {
        var a = this;
        a instanceof String && (a = String(a));
        var f = a.length;
        for (h = h || 0; h < f; h++) if (a[h] == b || Object.is(a[h], b)) return !0;
        return !1;
    };
}, "es7", "es3");

$jscomp.checkStringArgs = function(b, a, h) {
    if (null == b) throw new TypeError("The 'this' value for String.prototype." + h + " must not be null or undefined");
    if (a instanceof RegExp) throw new TypeError("First argument to String.prototype." + h + " must not be a regular expression");
    return b + "";
};

$jscomp.polyfill("String.prototype.includes", function(b) {
    return b ? b : function(b, h) {
        return -1 !== $jscomp.checkStringArgs(this, b, "includes").indexOf(b, h || 0);
    };
}, "es6", "es3");

SSHyClient = {
    MSG_DISCONNECT: 1,
    MSG_IGNORE: 2,
    MSG_UNIMPLEMENTED: 3,
    MSG_DEBUG: 4,
    MSG_SERVICE_REQUEST: 5,
    MSG_SERVICE_ACCEPT: 6,
    MSG_KEX_INIT: 20,
    MSG_NEW_KEYS: 21,
    MSG_KEXDH_INIT: 30,
    MSG_KEXDH_GEX_GROUP: 31,
    MSG_KEXDH_GEX_INIT: 32,
    MSG_KEXDH_GEX_REPLY: 33,
    MSG_KEXDH_GEX_REQUEST: 34,
    MSG_USERAUTH_REQUEST: 50,
    MSG_USERAUTH_FAILURE: 51,
    MSG_USERAUTH_SUCCESS: 52,
    MSG_USERAUTH_BANNER: 53,
    MSG_GLOBAL_REQUEST: 80,
    MSG_REQUEST_SUCCESS: 81,
    MSG_REQUEST_FAILURE: 82,
    MSG_CHANNEL_OPEN: 90,
    MSG_CHANNEL_OPEN_SUCCESS: 91,
    MSG_CHANNEL_OPEN_FAILURE: 92,
    MSG_CHANNEL_WINDOW_ADJUST: 93,
    MSG_CHANNEL_DATA: 94,
    MSG_CHANNEL_EXTENDED_DATA: 95,
    MSG_CHANNEL_EOF: 96,
    MSG_CHANNEL_CLOSE: 97,
    MSG_CHANNEL_REQUEST: 98,
    MSG_CHANNEL_SUCCESS: 99,
    MSG_CHANNEL_FAILURE: 100,
    WINDOW_SIZE: 40674,
    MAX_PACKET_SIZE: 16384,
    AES_CBC: 2,
    AES_CTR: 6,
    fishFsHintLeave: "[32",
    bashFsHintLeave: "]0;"
};

sjcl = {
    cipher: {}
};

sjcl.cipher.aes = function(b, a) {
    this._tables[0][0][0] || this._precompute();
    this.mode = a;
    var h, d, f = this._tables[0][4], m = this._tables[1];
    a = b.length;
    var l = 1;
    if (4 !== a && 6 !== a && 8 !== a) throw "invalid aes key size";
    this._key = [ h = b.slice(0), d = [] ];
    for (b = a; b < 4 * a + 28; b++) {
        var k = h[b - 1];
        if (0 === b % a || 8 === a && 4 === b % a) k = f[k >>> 24] << 24 ^ f[k >> 16 & 255] << 16 ^ f[k >> 8 & 255] << 8 ^ f[k & 255], 
        0 === b % a && (k = k << 8 ^ k >>> 24 ^ l << 24, l = l << 1 ^ 283 * (l >> 7));
        h[b] = h[b - a] ^ k;
    }
    for (a = 0; b; a++, b--) k = h[a & 3 ? b : b - 4], d[a] = 4 >= b || 4 > a ? k : m[0][f[k >>> 24]] ^ m[1][f[k >> 16 & 255]] ^ m[2][f[k >> 8 & 255]] ^ m[3][f[k & 255]];
};

sjcl.cipher.aes.MODE_CBC = 2;

sjcl.cipher.aes.MODE_CTR = 6;

sjcl.cipher.aes.prototype = {
    encrypt: function(b, a, h) {
        a = this.mode == sjcl.cipher.aes.MODE_CBC ? a : [];
        for (var d = [], f = 0; f < b.length / 16; f++) {
            var m = b.slice(16 * f, 16 * (f + 1));
            if (this.mode == sjcl.cipher.aes.MODE_CBC) {
                for (var l = 0; 16 > l; l++) m[l] ^= a[l];
                a = sjcl.codec.bytes.fromBits(this._crypt(sjcl.codec.bytes.toBits(m), 0));
            } else for (a = sjcl.codec.bytes.fromBits(this._crypt(sjcl.codec.bytes.toBits(toByteArray(h.increment())), 0)), 
            l = 0; 16 > l; l++) a[l] ^= m[l];
            d = d.concat(a);
        }
        return d;
    },
    decrypt: function(b, a) {
        for (var h = [], d = 0; d < b.length / 16; d++) {
            var f = b.slice(16 * d, 16 * (d + 1));
            ct = sjcl.codec.bytes.fromBits(this._crypt(sjcl.codec.bytes.toBits(f), 1));
            if (this.mode == sjcl.cipher.aes.MODE_CBC) {
                for (var m = 0; 16 > m; m++) ct[m] ^= a[m];
                a = f;
            }
            h = h.concat(ct);
        }
        return h;
    },
    _tables: [ [ [], [], [], [], [] ], [ [], [], [], [], [] ] ],
    _precompute: function() {
        var b = this._tables[0], a = this._tables[1], h = b[4], d = a[4], f, m, l, k = [], e = [], g;
        for (f = 0; 256 > f; f++) e[(k[f] = f << 1 ^ 283 * (f >> 7)) ^ f] = f;
        for (m = l = 0; !h[m]; m ^= g || 1, l = e[l] || 1) {
            var c = l ^ l << 1 ^ l << 2 ^ l << 3 ^ l << 4;
            c = c >> 8 ^ c & 255 ^ 99;
            h[m] = c;
            d[c] = m;
            var n = k[f = k[g = k[m]]];
            var p = 16843009 * n ^ 65537 * f ^ 257 * g ^ 16843008 * m;
            n = 257 * k[c] ^ 16843008 * c;
            for (f = 0; 4 > f; f++) b[f][m] = n = n << 24 ^ n >>> 8, a[f][c] = p = p << 24 ^ p >>> 8;
        }
        for (f = 0; 5 > f; f++) b[f] = b[f].slice(0), a[f] = a[f].slice(0);
    },
    _crypt: function(b, a) {
        if (4 !== b.length) throw "invalid aes block size";
        var h = this._key[a], d = b[0] ^ h[0], f = b[a ? 3 : 1] ^ h[1], m = b[2] ^ h[2];
        b = b[a ? 1 : 3] ^ h[3];
        var l = h.length / 4 - 2, k, e = 4, g = [ 0, 0, 0, 0 ];
        var c = this._tables[a];
        var n = c[0], p = c[1], q = c[2], r = c[3], t = c[4];
        for (k = 0; k < l; k++) {
            c = n[d >>> 24] ^ p[f >> 16 & 255] ^ q[m >> 8 & 255] ^ r[b & 255] ^ h[e];
            var y = n[f >>> 24] ^ p[m >> 16 & 255] ^ q[b >> 8 & 255] ^ r[d & 255] ^ h[e + 1];
            var v = n[m >>> 24] ^ p[b >> 16 & 255] ^ q[d >> 8 & 255] ^ r[f & 255] ^ h[e + 2];
            b = n[b >>> 24] ^ p[d >> 16 & 255] ^ q[f >> 8 & 255] ^ r[m & 255] ^ h[e + 3];
            e += 4;
            d = c;
            f = y;
            m = v;
        }
        for (k = 0; 4 > k; k++) g[a ? 3 & -k : k] = t[d >>> 24] << 24 ^ t[f >> 16 & 255] << 16 ^ t[m >> 8 & 255] << 8 ^ t[b & 255] ^ h[e++], 
        c = d, d = f, f = m, m = b, b = c;
        return g;
    }
};

sjcl.codec = {};

sjcl.codec.bytes = {
    fromBits: function(b) {
        var a = [], h = sjcl.bitArray.bitLength(b), d, f;
        for (d = 0; d < h / 8; d++) 0 === (d & 3) && (f = b[d / 4]), a.push(f >>> 24), f <<= 8;
        return a;
    },
    toBits: function(b) {
        var a = [], h, d = 0;
        for (h = 0; h < b.length; h++) d = d << 8 | b[h], 3 === (h & 3) && (a.push(d), d = 0);
        h & 3 && a.push(sjcl.bitArray.partial(8 * (h & 3), d));
        return a;
    }
};

sjcl.bitArray = {
    bitLength: function(b) {
        var a = b.length;
        return 0 === a ? 0 : 32 * (a - 1) + sjcl.bitArray.getPartial(b[a - 1]);
    },
    partial: function(b, a, h) {
        return 32 === b ? a : (h ? a | 0 : a << 32 - b) + 1099511627776 * b;
    },
    getPartial: function(b) {
        return Math.round(b / 1099511627776) || 32;
    }
};

var BigInteger = function() {
    function b(b, a, c) {
        null != b && ("number" == typeof b ? this.fromNumber(b, a, c) : null == a && "string" != typeof b ? this.fromString(b, 256) : this.fromString(b, a));
    }
    function a() {
        return new b(null);
    }
    function h(b, a, c, e, l, g) {
        for (;0 <= --g; ) {
            var k = a * this[b++] + c[e] + l;
            l = Math.floor(k / 67108864);
            c[e++] = k & 67108863;
        }
        return l;
    }
    function d(b, a, c, e, l, g) {
        var k = a & 32767;
        for (a >>= 15; 0 <= --g; ) {
            var u = this[b] & 32767, n = this[b++] >> 15, d = a * u + n * k;
            u = k * u + ((d & 32767) << 15) + c[e] + (l & 1073741823);
            l = (u >>> 30) + (d >>> 15) + a * n + (l >>> 30);
            c[e++] = u & 1073741823;
        }
        return l;
    }
    function f(b, a, c, e, l, k) {
        var g = a & 16383;
        for (a >>= 14; 0 <= --k; ) {
            var u = this[b] & 16383, n = this[b++] >> 14, d = a * u + n * g;
            u = g * u + ((d & 16383) << 14) + c[e] + l;
            l = (u >> 28) + (d >> 14) + a * n;
            c[e++] = u & 268435455;
        }
        return l;
    }
    function m(b, a) {
        b = C[b.charCodeAt(a)];
        return null == b ? -1 : b;
    }
    function l(b) {
        var c = a();
        c.fromInt(b);
        return c;
    }
    function k(b) {
        var a = 1, c;
        0 != (c = b >>> 16) && (b = c, a += 16);
        0 != (c = b >> 8) && (b = c, a += 8);
        0 != (c = b >> 4) && (b = c, a += 4);
        0 != (c = b >> 2) && (b = c, a += 2);
        0 != b >> 1 && (a += 1);
        return a;
    }
    function e(b) {
        this.m = b;
    }
    function g(b) {
        this.m = b;
        this.mp = b.invDigit();
        this.mpl = this.mp & 32767;
        this.mph = this.mp >> 15;
        this.um = (1 << b.DB - 15) - 1;
        this.mt2 = 2 * b.t;
    }
    function c(b, a) {
        return b & a;
    }
    function n(b, a) {
        return b | a;
    }
    function p(b, a) {
        return b ^ a;
    }
    function q(b, a) {
        return b & ~a;
    }
    function r() {}
    function t(b) {
        return b;
    }
    function y(c) {
        this.r2 = a();
        this.q3 = a();
        b.ONE.dlShiftTo(2 * c.t, this.r2);
        this.mu = this.r2.divide(c);
        this.m = c;
    }
    var v;
    "Microsoft Internet Explorer" == navigator.appName ? (b.prototype.am = d, v = 30) : "Netscape" != navigator.appName ? (b.prototype.am = h, 
    v = 26) : (b.prototype.am = f, v = 28);
    b.prototype.DB = v;
    b.prototype.DM = (1 << v) - 1;
    b.prototype.DV = 1 << v;
    b.prototype.FV = Math.pow(2, 52);
    b.prototype.F1 = 52 - v;
    b.prototype.F2 = 2 * v - 52;
    var C = [], z;
    v = 48;
    for (z = 0; 9 >= z; ++z) C[v++] = z;
    v = 97;
    for (z = 10; 36 > z; ++z) C[v++] = z;
    v = 65;
    for (z = 10; 36 > z; ++z) C[v++] = z;
    e.prototype.convert = function(b) {
        return 0 > b.s || 0 <= b.compareTo(this.m) ? b.mod(this.m) : b;
    };
    e.prototype.revert = function(b) {
        return b;
    };
    e.prototype.reduce = function(b) {
        b.divRemTo(this.m, null, b);
    };
    e.prototype.mulTo = function(b, a, c) {
        b.multiplyTo(a, c);
        this.reduce(c);
    };
    e.prototype.sqrTo = function(b, a) {
        b.squareTo(a);
        this.reduce(a);
    };
    g.prototype.convert = function(c) {
        var e = a();
        c.abs().dlShiftTo(this.m.t, e);
        e.divRemTo(this.m, null, e);
        0 > c.s && 0 < e.compareTo(b.ZERO) && this.m.subTo(e, e);
        return e;
    };
    g.prototype.revert = function(b) {
        var c = a();
        b.copyTo(c);
        this.reduce(c);
        return c;
    };
    g.prototype.reduce = function(b) {
        for (;b.t <= this.mt2; ) b[b.t++] = 0;
        for (var a = 0; a < this.m.t; ++a) {
            var c = b[a] & 32767, e = c * this.mpl + ((c * this.mph + (b[a] >> 15) * this.mpl & this.um) << 15) & b.DM;
            c = a + this.m.t;
            for (b[c] += this.m.am(0, e, b, a, 0, this.m.t); b[c] >= b.DV; ) b[c] -= b.DV, b[++c]++;
        }
        b.clamp();
        b.drShiftTo(this.m.t, b);
        0 <= b.compareTo(this.m) && b.subTo(this.m, b);
    };
    g.prototype.mulTo = function(b, a, c) {
        b.multiplyTo(a, c);
        this.reduce(c);
    };
    g.prototype.sqrTo = function(b, a) {
        b.squareTo(a);
        this.reduce(a);
    };
    b.prototype.copyTo = function(b) {
        for (var a = this.t - 1; 0 <= a; --a) b[a] = this[a];
        b.t = this.t;
        b.s = this.s;
    };
    b.prototype.fromInt = function(b) {
        this.t = 1;
        this.s = 0 > b ? -1 : 0;
        0 < b ? this[0] = b : -1 > b ? this[0] = b + DV : this.t = 0;
    };
    b.prototype.fromString = function(a, c) {
        if (16 == c) c = 4; else if (8 == c) c = 3; else if (256 == c) c = 8; else if (2 == c) c = 1; else if (32 == c) c = 5; else if (4 == c) c = 2; else {
            this.fromRadix(a, c);
            return;
        }
        this.s = this.t = 0;
        for (var e = a.length, l = !1, g = 0; 0 <= --e; ) {
            var k = 8 == c ? a[e] & 255 : m(a, e);
            0 > k ? "-" == a.charAt(e) && (l = !0) : (l = !1, 0 == g ? this[this.t++] = k : g + c > this.DB ? (this[this.t - 1] |= (k & (1 << this.DB - g) - 1) << g, 
            this[this.t++] = k >> this.DB - g) : this[this.t - 1] |= k << g, g += c, g >= this.DB && (g -= this.DB));
        }
        8 == c && 0 != (a[0] & 128) && (this.s = -1, 0 < g && (this[this.t - 1] |= (1 << this.DB - g) - 1 << g));
        this.clamp();
        l && b.ZERO.subTo(this, this);
    };
    b.prototype.clamp = function() {
        for (var b = this.s & this.DM; 0 < this.t && this[this.t - 1] == b; ) --this.t;
    };
    b.prototype.dlShiftTo = function(b, a) {
        var c;
        for (c = this.t - 1; 0 <= c; --c) a[c + b] = this[c];
        for (c = b - 1; 0 <= c; --c) a[c] = 0;
        a.t = this.t + b;
        a.s = this.s;
    };
    b.prototype.drShiftTo = function(b, a) {
        for (var c = b; c < this.t; ++c) a[c - b] = this[c];
        a.t = Math.max(this.t - b, 0);
        a.s = this.s;
    };
    b.prototype.lShiftTo = function(b, a) {
        var c = b % this.DB, e = this.DB - c, l = (1 << e) - 1;
        b = Math.floor(b / this.DB);
        var g = this.s << c & this.DM, k;
        for (k = this.t - 1; 0 <= k; --k) a[k + b + 1] = this[k] >> e | g, g = (this[k] & l) << c;
        for (k = b - 1; 0 <= k; --k) a[k] = 0;
        a[b] = g;
        a.t = this.t + b + 1;
        a.s = this.s;
        a.clamp();
    };
    b.prototype.rShiftTo = function(b, a) {
        a.s = this.s;
        var c = Math.floor(b / this.DB);
        if (c >= this.t) a.t = 0; else {
            b %= this.DB;
            var e = this.DB - b, l = (1 << b) - 1;
            a[0] = this[c] >> b;
            for (var g = c + 1; g < this.t; ++g) a[g - c - 1] |= (this[g] & l) << e, a[g - c] = this[g] >> b;
            0 < b && (a[this.t - c - 1] |= (this.s & l) << e);
            a.t = this.t - c;
            a.clamp();
        }
    };
    b.prototype.subTo = function(b, a) {
        for (var c = 0, e = 0, l = Math.min(b.t, this.t); c < l; ) e += this[c] - b[c], 
        a[c++] = e & this.DM, e >>= this.DB;
        if (b.t < this.t) {
            for (e -= b.s; c < this.t; ) e += this[c], a[c++] = e & this.DM, e >>= this.DB;
            e += this.s;
        } else {
            for (e += this.s; c < b.t; ) e -= b[c], a[c++] = e & this.DM, e >>= this.DB;
            e -= b.s;
        }
        a.s = 0 > e ? -1 : 0;
        -1 > e ? a[c++] = this.DV + e : 0 < e && (a[c++] = e);
        a.t = c;
        a.clamp();
    };
    b.prototype.multiplyTo = function(a, c) {
        var e = this.abs(), l = a.abs(), g = e.t;
        for (c.t = g + l.t; 0 <= --g; ) c[g] = 0;
        for (g = 0; g < l.t; ++g) c[g + e.t] = e.am(0, l[g], c, g, 0, e.t);
        c.s = 0;
        c.clamp();
        this.s != a.s && b.ZERO.subTo(c, c);
    };
    b.prototype.squareTo = function(b) {
        for (var a = this.abs(), c = b.t = 2 * a.t; 0 <= --c; ) b[c] = 0;
        for (c = 0; c < a.t - 1; ++c) {
            var e = a.am(c, a[c], b, 2 * c, 0, 1);
            (b[c + a.t] += a.am(c + 1, 2 * a[c], b, 2 * c + 1, e, a.t - c - 1)) >= a.DV && (b[c + a.t] -= a.DV, 
            b[c + a.t + 1] = 1);
        }
        0 < b.t && (b[b.t - 1] += a.am(c, a[c], b, 2 * c, 0, 1));
        b.s = 0;
        b.clamp();
    };
    b.prototype.divRemTo = function(c, e, g) {
        var l = c.abs();
        if (!(0 >= l.t)) {
            var n = this.abs();
            if (n.t < l.t) null != e && e.fromInt(0), null != g && this.copyTo(g); else {
                null == g && (g = a());
                var d = a(), f = this.s;
                c = c.s;
                var m = this.DB - k(l[l.t - 1]);
                0 < m ? (l.lShiftTo(m, d), n.lShiftTo(m, g)) : (l.copyTo(d), n.copyTo(g));
                l = d.t;
                n = d[l - 1];
                if (0 != n) {
                    var p = n * (1 << this.F1) + (1 < l ? d[l - 2] >> this.F2 : 0), h = this.FV / p;
                    p = (1 << this.F1) / p;
                    var u = 1 << this.F2, r = g.t, q = r - l, t = null == e ? a() : e;
                    d.dlShiftTo(q, t);
                    0 <= g.compareTo(t) && (g[g.t++] = 1, g.subTo(t, g));
                    b.ONE.dlShiftTo(l, t);
                    for (t.subTo(d, d); d.t < l; ) d[d.t++] = 0;
                    for (;0 <= --q; ) {
                        var A = g[--r] == n ? this.DM : Math.floor(g[r] * h + (g[r - 1] + u) * p);
                        if ((g[r] += d.am(0, A, g, q, 0, l)) < A) for (d.dlShiftTo(q, t), g.subTo(t, g); g[r] < --A; ) g.subTo(t, g);
                    }
                    null != e && (g.drShiftTo(l, e), f != c && b.ZERO.subTo(e, e));
                    g.t = l;
                    g.clamp();
                    0 < m && g.rShiftTo(m, g);
                    0 > f && b.ZERO.subTo(g, g);
                }
            }
        }
    };
    b.prototype.invDigit = function() {
        if (1 > this.t) return 0;
        var b = this[0];
        if (0 == (b & 1)) return 0;
        var a = b & 3;
        a = a * (2 - (b & 15) * a) & 15;
        a = a * (2 - (b & 255) * a) & 255;
        a = a * (2 - ((b & 65535) * a & 65535)) & 65535;
        a = a * (2 - b * a % this.DV) % this.DV;
        return 0 < a ? this.DV - a : -a;
    };
    b.prototype.isEven = function() {
        return 0 == (0 < this.t ? this[0] & 1 : this.s);
    };
    b.prototype.exp = function(c, e) {
        if (4294967295 < c || 1 > c) return b.ONE;
        var g = a(), l = a(), n = e.convert(this), d = k(c) - 1;
        for (n.copyTo(g); 0 <= --d; ) if (e.sqrTo(g, l), 0 < (c & 1 << d)) e.mulTo(l, n, g); else {
            var f = g;
            g = l;
            l = f;
        }
        return e.revert(g);
    };
    b.prototype.toString = function(b) {
        if (0 > this.s) return "-" + this.negate().toString(b);
        if (16 == b) b = 4; else if (8 == b) b = 3; else if (2 == b) b = 1; else if (32 == b) b = 5; else if (4 == b) b = 2; else return this.toRadix(b);
        var a = (1 << b) - 1, c, e = !1, g = "", l = this.t, k = this.DB - l * this.DB % b;
        if (0 < l--) for (k < this.DB && 0 < (c = this[l] >> k) && (e = !0, g = "0123456789abcdefghijklmnopqrstuvwxyz".charAt(c)); 0 <= l; ) k < b ? (c = (this[l] & (1 << k) - 1) << b - k, 
        c |= this[--l] >> (k += this.DB - b)) : (c = this[l] >> (k -= b) & a, 0 >= k && (k += this.DB, 
        --l)), 0 < c && (e = !0), e && (g += "0123456789abcdefghijklmnopqrstuvwxyz".charAt(c));
        return e ? g : "0";
    };
    b.prototype.negate = function() {
        var c = a();
        b.ZERO.subTo(this, c);
        return c;
    };
    b.prototype.abs = function() {
        return 0 > this.s ? this.negate() : this;
    };
    b.prototype.compareTo = function(b) {
        var a = this.s - b.s;
        if (0 != a) return a;
        var c = this.t;
        a = c - b.t;
        if (0 != a) return a;
        for (;0 <= --c; ) if (0 != (a = this[c] - b[c])) return a;
        return 0;
    };
    b.prototype.bitLength = function() {
        return 0 >= this.t ? 0 : this.DB * (this.t - 1) + k(this[this.t - 1] ^ this.s & this.DM);
    };
    b.prototype.mod = function(c) {
        var e = a();
        this.abs().divRemTo(c, null, e);
        0 > this.s && 0 < e.compareTo(b.ZERO) && c.subTo(e, e);
        return e;
    };
    b.prototype.modPowInt = function(b, a) {
        a = 256 > b || a.isEven() ? new e(a) : new g(a);
        return this.exp(b, a);
    };
    b.ZERO = l(0);
    b.ONE = l(1);
    r.prototype.convert = t;
    r.prototype.revert = t;
    r.prototype.mulTo = function(b, a, c) {
        b.multiplyTo(a, c);
    };
    r.prototype.sqrTo = function(b, a) {
        b.squareTo(a);
    };
    y.prototype.convert = function(b) {
        if (0 > b.s || b.t > 2 * this.m.t) return b.mod(this.m);
        if (0 > b.compareTo(this.m)) return b;
        var c = a();
        b.copyTo(c);
        this.reduce(c);
        return c;
    };
    y.prototype.revert = function(b) {
        return b;
    };
    y.prototype.reduce = function(b) {
        b.drShiftTo(this.m.t - 1, this.r2);
        b.t > this.m.t + 1 && (b.t = this.m.t + 1, b.clamp());
        this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
        for (this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); 0 > b.compareTo(this.r2); ) b.dAddOffset(1, this.m.t + 1);
        for (b.subTo(this.r2, b); 0 <= b.compareTo(this.m); ) b.subTo(this.m, b);
    };
    y.prototype.mulTo = function(b, a, c) {
        b.multiplyTo(a, c);
        this.reduce(c);
    };
    y.prototype.sqrTo = function(b, a) {
        b.squareTo(a);
        this.reduce(a);
    };
    var x = [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509 ], B = 67108864 / x[x.length - 1];
    b.prototype.chunkSize = function(b) {
        return Math.floor(Math.LN2 * this.DB / Math.log(b));
    };
    b.prototype.toRadix = function(b) {
        null == b && (b = 10);
        if (0 == this.signum() || 2 > b || 36 < b) return "0";
        var c = this.chunkSize(b);
        c = Math.pow(b, c);
        var e = l(c), g = a(), k = a(), n = "";
        for (this.divRemTo(e, g, k); 0 < g.signum(); ) n = (c + k.intValue()).toString(b).substr(1) + n, 
        g.divRemTo(e, g, k);
        return k.intValue().toString(b) + n;
    };
    b.prototype.fromRadix = function(a, c) {
        this.fromInt(0);
        null == c && (c = 10);
        for (var e = this.chunkSize(c), g = Math.pow(c, e), l = !1, k = 0, n = 0, d = 0; d < a.length; ++d) {
            var f = m(a, d);
            0 > f ? "-" == a.charAt(d) && 0 == this.signum() && (l = !0) : (n = c * n + f, ++k >= e && (this.dMultiply(g), 
            this.dAddOffset(n, 0), n = k = 0));
        }
        0 < k && (this.dMultiply(Math.pow(c, k)), this.dAddOffset(n, 0));
        l && b.ZERO.subTo(this, this);
    };
    b.prototype.fromNumber = function(a, c, e) {
        if ("number" == typeof c) if (2 > a) this.fromInt(1); else for (this.fromNumber(a, e), 
        this.testBit(a - 1) || this.bitwiseTo(b.ONE.shiftLeft(a - 1), n, this), this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(c); ) this.dAddOffset(2, 0), 
        this.bitLength() > a && this.subTo(b.ONE.shiftLeft(a - 1), this); else {
            e = [];
            var g = a & 7;
            e.length = (a >> 3) + 1;
            c.nextBytes(e);
            e[0] = 0 < g ? e[0] & (1 << g) - 1 : 0;
            this.fromString(e, 256);
        }
    };
    b.prototype.bitwiseTo = function(b, a, c) {
        var e, g = Math.min(b.t, this.t);
        for (e = 0; e < g; ++e) c[e] = a(this[e], b[e]);
        if (b.t < this.t) {
            var l = b.s & this.DM;
            for (e = g; e < this.t; ++e) c[e] = a(this[e], l);
            c.t = this.t;
        } else {
            l = this.s & this.DM;
            for (e = g; e < b.t; ++e) c[e] = a(l, b[e]);
            c.t = b.t;
        }
        c.s = a(this.s, b.s);
        c.clamp();
    };
    b.prototype.changeBit = function(a, c) {
        a = b.ONE.shiftLeft(a);
        this.bitwiseTo(a, c, a);
        return a;
    };
    b.prototype.addTo = function(b, a) {
        for (var c = 0, e = 0, g = Math.min(b.t, this.t); c < g; ) e += this[c] + b[c], 
        a[c++] = e & this.DM, e >>= this.DB;
        if (b.t < this.t) {
            for (e += b.s; c < this.t; ) e += this[c], a[c++] = e & this.DM, e >>= this.DB;
            e += this.s;
        } else {
            for (e += this.s; c < b.t; ) e += b[c], a[c++] = e & this.DM, e >>= this.DB;
            e += b.s;
        }
        a.s = 0 > e ? -1 : 0;
        0 < e ? a[c++] = e : -1 > e && (a[c++] = this.DV + e);
        a.t = c;
        a.clamp();
    };
    b.prototype.dMultiply = function(b) {
        this[this.t] = this.am(0, b - 1, this, 0, 0, this.t);
        ++this.t;
        this.clamp();
    };
    b.prototype.dAddOffset = function(b, a) {
        if (0 != b) {
            for (;this.t <= a; ) this[this.t++] = 0;
            for (this[a] += b; this[a] >= this.DV; ) this[a] -= this.DV, ++a >= this.t && (this[this.t++] = 0), 
            ++this[a];
        }
    };
    b.prototype.multiplyLowerTo = function(b, a, c) {
        var e = Math.min(this.t + b.t, a);
        c.s = 0;
        for (c.t = e; 0 < e; ) c[--e] = 0;
        var g;
        for (g = c.t - this.t; e < g; ++e) c[e + this.t] = this.am(0, b[e], c, e, 0, this.t);
        for (g = Math.min(b.t, a); e < g; ++e) this.am(0, b[e], c, e, 0, a - e);
        c.clamp();
    };
    b.prototype.multiplyUpperTo = function(b, a, c) {
        --a;
        var e = c.t = this.t + b.t - a;
        for (c.s = 0; 0 <= --e; ) c[e] = 0;
        for (e = Math.max(a - this.t, 0); e < b.t; ++e) c[this.t + e - a] = this.am(a - e, b[e], c, 0, 0, this.t + e - a);
        c.clamp();
        c.drShiftTo(1, c);
    };
    b.prototype.modInt = function(b) {
        if (0 >= b) return 0;
        var a = this.DV % b, c = 0 > this.s ? b - 1 : 0;
        if (0 < this.t) if (0 == a) c = this[0] % b; else for (var e = this.t - 1; 0 <= e; --e) c = (a * c + this[e]) % b;
        return c;
    };
    b.prototype.millerRabin = function(c) {
        var e = this.subtract(b.ONE), g = e.getLowestSetBit();
        if (0 >= g) return !1;
        var l = e.shiftRight(g);
        c = c + 1 >> 1;
        c > x.length && (c = x.length);
        for (var k = a(), n = 0; n < c; ++n) {
            k.fromInt(x[n]);
            var d = k.modPow(l, this);
            if (0 != d.compareTo(b.ONE) && 0 != d.compareTo(e)) {
                for (var f = 1; f++ < g && 0 != d.compareTo(e); ) if (d = d.modPowInt(2, this), 
                0 == d.compareTo(b.ONE)) return !1;
                if (0 != d.compareTo(e)) return !1;
            }
        }
        return !0;
    };
    b.prototype.clone = function() {
        var b = a();
        this.copyTo(b);
        return b;
    };
    b.prototype.intValue = function() {
        if (0 > this.s) {
            if (1 == this.t) return this[0] - this.DV;
            if (0 == this.t) return -1;
        } else {
            if (1 == this.t) return this[0];
            if (0 == this.t) return 0;
        }
        return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
    };
    b.prototype.byteValue = function() {
        return 0 == this.t ? this.s : this[0] << 24 >> 24;
    };
    b.prototype.shortValue = function() {
        return 0 == this.t ? this.s : this[0] << 16 >> 16;
    };
    b.prototype.signum = function() {
        return 0 > this.s ? -1 : 0 >= this.t || 1 == this.t && 0 >= this[0] ? 0 : 1;
    };
    b.prototype.toByteArray = function() {
        var b = this.t, a = [];
        a[0] = this.s;
        var c = this.DB - b * this.DB % 8, e, g = 0;
        if (0 < b--) for (c < this.DB && (e = this[b] >> c) != (this.s & this.DM) >> c && (a[g++] = e | this.s << this.DB - c); 0 <= b; ) if (8 > c ? (e = (this[b] & (1 << c) - 1) << 8 - c, 
        e |= this[--b] >> (c += this.DB - 8)) : (e = this[b] >> (c -= 8) & 255, 0 >= c && (c += this.DB, 
        --b)), 0 != (e & 128) && (e |= -256), 0 == g && (this.s & 128) != (e & 128) && ++g, 
        0 < g || e != this.s) a[g++] = e;
        return a;
    };
    b.prototype.equals = function(b) {
        return 0 == this.compareTo(b);
    };
    b.prototype.min = function(b) {
        return 0 > this.compareTo(b) ? this : b;
    };
    b.prototype.max = function(b) {
        return 0 < this.compareTo(b) ? this : b;
    };
    b.prototype.and = function(b) {
        var e = a();
        this.bitwiseTo(b, c, e);
        return e;
    };
    b.prototype.or = function(b) {
        var c = a();
        this.bitwiseTo(b, n, c);
        return c;
    };
    b.prototype.xor = function(b) {
        var c = a();
        this.bitwiseTo(b, p, c);
        return c;
    };
    b.prototype.andNot = function(b) {
        var c = a();
        this.bitwiseTo(b, q, c);
        return c;
    };
    b.prototype.not = function() {
        for (var b = a(), c = 0; c < this.t; ++c) b[c] = this.DM & ~this[c];
        b.t = this.t;
        b.s = ~this.s;
        return b;
    };
    b.prototype.shiftLeft = function(b) {
        var c = a();
        0 > b ? this.rShiftTo(-b, c) : this.lShiftTo(b, c);
        return c;
    };
    b.prototype.shiftRight = function(b) {
        var c = a();
        0 > b ? this.lShiftTo(-b, c) : this.rShiftTo(b, c);
        return c;
    };
    b.prototype.getLowestSetBit = function() {
        for (var b = 0; b < this.t; ++b) if (0 != this[b]) {
            var a = b * this.DB;
            b = this[b];
            if (0 == b) b = -1; else {
                var c = 0;
                0 == (b & 65535) && (b >>= 16, c += 16);
                0 == (b & 255) && (b >>= 8, c += 8);
                0 == (b & 15) && (b >>= 4, c += 4);
                0 == (b & 3) && (b >>= 2, c += 2);
                0 == (b & 1) && ++c;
                b = c;
            }
            return a + b;
        }
        return 0 > this.s ? this.t * this.DB : -1;
    };
    b.prototype.bitCount = function() {
        for (var b = 0, a = this.s & this.DM, c = 0; c < this.t; ++c) {
            for (var e = this[c] ^ a, g = 0; 0 != e; ) e &= e - 1, ++g;
            b += g;
        }
        return b;
    };
    b.prototype.testBit = function(b) {
        var a = Math.floor(b / this.DB);
        return a >= this.t ? 0 != this.s : 0 != (this[a] & 1 << b % this.DB);
    };
    b.prototype.setBit = function(b) {
        return this.changeBit(b, n);
    };
    b.prototype.clearBit = function(b) {
        return this.changeBit(b, q);
    };
    b.prototype.flipBit = function(b) {
        return this.changeBit(b, p);
    };
    b.prototype.add = function(b) {
        var c = a();
        this.addTo(b, c);
        return c;
    };
    b.prototype.subtract = function(b) {
        var c = a();
        this.subTo(b, c);
        return c;
    };
    b.prototype.multiply = function(b) {
        var c = a();
        this.multiplyTo(b, c);
        return c;
    };
    b.prototype.divide = function(b) {
        var c = a();
        this.divRemTo(b, c, null);
        return c;
    };
    b.prototype.remainder = function(b) {
        var c = a();
        this.divRemTo(b, null, c);
        return c;
    };
    b.prototype.divideAndRemainder = function(b) {
        var c = a(), e = a();
        this.divRemTo(b, c, e);
        return [ c, e ];
    };
    b.prototype.modPow = function(b, c) {
        var n = b.bitLength(), d = l(1);
        if (0 >= n) return d;
        var f = 18 > n ? 1 : 48 > n ? 3 : 144 > n ? 4 : 768 > n ? 5 : 6;
        c = 8 > n ? new e(c) : c.isEven() ? new y(c) : new g(c);
        var m = [], p = 3, h = f - 1, r = (1 << f) - 1;
        m[1] = c.convert(this);
        if (1 < f) for (n = a(), c.sqrTo(m[1], n); p <= r; ) m[p] = a(), c.mulTo(n, m[p - 2], m[p]), 
        p += 2;
        var q = b.t - 1, t, v = !0, u = a();
        for (n = k(b[q]) - 1; 0 <= q; ) {
            n >= h ? t = b[q] >> n - h & r : (t = (b[q] & (1 << n + 1) - 1) << h - n, 0 < q && (t |= b[q - 1] >> this.DB + n - h));
            for (p = f; 0 == (t & 1); ) t >>= 1, --p;
            0 > (n -= p) && (n += this.DB, --q);
            if (v) m[t].copyTo(d), v = !1; else {
                for (;1 < p; ) c.sqrTo(d, u), c.sqrTo(u, d), p -= 2;
                0 < p ? c.sqrTo(d, u) : (p = d, d = u, u = p);
                c.mulTo(u, m[t], d);
            }
            for (;0 <= q && 0 == (b[q] & 1 << n); ) c.sqrTo(d, u), p = d, d = u, u = p, 0 > --n && (n = this.DB - 1, 
            --q);
        }
        return c.revert(d);
    };
    b.prototype.modInverse = function(c) {
        var a = c.isEven();
        if (this.isEven() && a || 0 == c.signum()) return b.ZERO;
        for (var e = c.clone(), g = this.clone(), k = l(1), n = l(0), d = l(0), f = l(1); 0 != e.signum(); ) {
            for (;e.isEven(); ) e.rShiftTo(1, e), a ? (k.isEven() && n.isEven() || (k.addTo(this, k), 
            n.subTo(c, n)), k.rShiftTo(1, k)) : n.isEven() || n.subTo(c, n), n.rShiftTo(1, n);
            for (;g.isEven(); ) g.rShiftTo(1, g), a ? (d.isEven() && f.isEven() || (d.addTo(this, d), 
            f.subTo(c, f)), d.rShiftTo(1, d)) : f.isEven() || f.subTo(c, f), f.rShiftTo(1, f);
            0 <= e.compareTo(g) ? (e.subTo(g, e), a && k.subTo(d, k), n.subTo(f, n)) : (g.subTo(e, g), 
            a && d.subTo(k, d), f.subTo(n, f));
        }
        if (0 != g.compareTo(b.ONE)) return b.ZERO;
        if (0 <= f.compareTo(c)) return f.subtract(c);
        if (0 > f.signum()) f.addTo(c, f); else return f;
        return 0 > f.signum() ? f.add(c) : f;
    };
    b.prototype.pow = function(b) {
        return this.exp(b, new r());
    };
    b.prototype.gcd = function(b) {
        var c = 0 > this.s ? this.negate() : this.clone();
        b = 0 > b.s ? b.negate() : b.clone();
        if (0 > c.compareTo(b)) {
            var a = c;
            c = b;
            b = a;
        }
        a = c.getLowestSetBit();
        var e = b.getLowestSetBit();
        if (0 > e) return c;
        a < e && (e = a);
        for (0 < e && (c.rShiftTo(e, c), b.rShiftTo(e, b)); 0 < c.signum(); ) 0 < (a = c.getLowestSetBit()) && c.rShiftTo(a, c), 
        0 < (a = b.getLowestSetBit()) && b.rShiftTo(a, b), 0 <= c.compareTo(b) ? (c.subTo(b, c), 
        c.rShiftTo(1, c)) : (b.subTo(c, b), b.rShiftTo(1, b));
        0 < e && b.lShiftTo(e, b);
        return b;
    };
    b.prototype.isProbablePrime = function(b) {
        var c, a = this.abs();
        if (1 == a.t && a[0] <= x[x.length - 1]) {
            for (c = 0; c < x.length; ++c) if (a[0] == x[c]) return !0;
            return !1;
        }
        if (a.isEven()) return !1;
        for (c = 1; c < x.length; ) {
            for (var e = x[c], g = c + 1; g < x.length && e < B; ) e *= x[g++];
            for (e = a.modInt(e); c < g; ) if (0 == e % x[c++]) return !1;
        }
        return a.millerRabin(b);
    };
    return {
        BigInteger: b
    };
}();

BigInteger = BigInteger.BigInteger;

SSHyClient.hash = {};

SSHyClient.hash.SHA1 = function(b) {
    this.data = b || "";
    this.digest_size = 20;
};

SSHyClient.hash.SHA1.prototype = {
    digest: function() {
        var b = toByteArray(this.data), a = bytesToWords(b), h = 8 * b.length;
        b = [];
        var d = 1732584193, f = -271733879, m = -1732584194, l = 271733878, k = -1009589776;
        a[h >> 5] |= 128 << 24 - h % 32;
        a[(h + 64 >>> 9 << 4) + 15] = h;
        for (h = 0; h < a.length; h += 16) {
            for (var e = d, g = f, c = m, n = l, p = k, q = 0; 80 > q; q++) {
                if (16 > q) b[q] = a[h + q]; else {
                    var r = b[q - 3] ^ b[q - 8] ^ b[q - 14] ^ b[q - 16];
                    b[q] = r << 1 | r >>> 31;
                }
                r = (d << 5 | d >>> 27) + k + (b[q] >>> 0) + (20 > q ? (f & m | ~f & l) + 1518500249 : 40 > q ? (f ^ m ^ l) + 1859775393 : 60 > q ? (f & m | f & l | m & l) - 1894007588 : (f ^ m ^ l) - 899497514);
                k = l;
                l = m;
                m = f << 30 | f >>> 2;
                f = d;
                d = r;
            }
            d += e;
            f += g;
            m += c;
            l += n;
            k += p;
        }
        return fromByteArray(wordsToBytes([ d, f, m, l, k ]));
    }
};

SSHyClient.hash.SHA256 = function(b) {
    this.data = b || "";
    this.digest_size = 32;
};

SSHyClient.hash.SHA256.prototype = {
    digest: function() {
        var b = toByteArray(this.data), a = [ 1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298 ], h = bytesToWords(b), d = 8 * b.length;
        b = [ 1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225 ];
        var f = [], m, l;
        h[d >> 5] |= 128 << 24 - d % 32;
        h[(d + 64 >> 9 << 4) + 15] = d;
        for (m = 0; m < h.length; m += 16) {
            d = b[0];
            var k = b[1];
            var e = b[2];
            var g = b[3];
            var c = b[4];
            var n = b[5];
            var p = b[6];
            var q = b[7];
            for (l = 0; 64 > l; l++) {
                if (16 > l) f[l] = h[l + m]; else {
                    var r = f[l - 15];
                    var t = f[l - 2];
                    f[l] = ((r << 25 | r >>> 7) ^ (r << 14 | r >>> 18) ^ r >>> 3) + (f[l - 7] >>> 0) + ((t << 15 | t >>> 17) ^ (t << 13 | t >>> 19) ^ t >>> 10) + (f[l - 16] >>> 0);
                }
                t = d & k ^ d & e ^ k & e;
                var y = (d << 30 | d >>> 2) ^ (d << 19 | d >>> 13) ^ (d << 10 | d >>> 22);
                r = (q >>> 0) + ((c << 26 | c >>> 6) ^ (c << 21 | c >>> 11) ^ (c << 7 | c >>> 25)) + (c & n ^ ~c & p) + a[l] + (f[l] >>> 0);
                t = y + t;
                q = p;
                p = n;
                n = c;
                c = g + r >>> 0;
                g = e;
                e = k;
                k = d;
                d = r + t >>> 0;
            }
            b[0] += d;
            b[1] += k;
            b[2] += e;
            b[3] += g;
            b[4] += c;
            b[5] += n;
            b[6] += p;
            b[7] += q;
        }
        return fromByteArray(wordsToBytes(b));
    }
};

SSHyClient.hash.HMAC = function(b, a, h) {
    h = digestmod = "SHA-1" == h ? SSHyClient.hash.SHA1 : SSHyClient.hash.SHA256;
    var d = new h(), f = new h();
    64 < b.length && (b = new h(b).digest());
    b += Array(64 - b.length + 1).join("\0");
    h = toByteArray(b).slice(0);
    b = toByteArray(b).slice(0);
    for (var m = 0; 64 > m; ++m) h[m] ^= 92, b[m] ^= 54;
    d.data += fromByteArray(h);
    f.data += fromByteArray(b);
    f.data += a;
    d.data += f.digest();
    return d.digest();
};

SSHyClient.hash.MD5 = function(b) {
    var a = toByteArray(b);
    b = bytesToWords(a);
    var h = 8 * a.length;
    a = 1732584193;
    for (var d = -271733879, f = -1732584194, m = 271733878, l = 0; l < b.length; l++) b[l] = (b[l] << 8 | b[l] >>> 24) & 16711935 | (b[l] << 24 | b[l] >>> 8) & 4278255360;
    b[h >>> 5] |= 128 << h % 32;
    b[(h + 64 >>> 9 << 4) + 14] = h;
    h = function(b, c, a, e, g, l, k) {
        b = b + (c & a | ~c & e) + (g >>> 0) + k;
        return (b << l | b >>> 32 - l) + c;
    };
    var k = function(b, c, a, e, g, l, k) {
        b = b + (c & e | a & ~e) + (g >>> 0) + k;
        return (b << l | b >>> 32 - l) + c;
    }, e = function(b, c, a, e, g, l, k) {
        b = b + (c ^ a ^ e) + (g >>> 0) + k;
        return (b << l | b >>> 32 - l) + c;
    }, g = function(b, c, a, e, g, l, k) {
        b = b + (a ^ (c | ~e)) + (g >>> 0) + k;
        return (b << l | b >>> 32 - l) + c;
    };
    for (l = 0; l < b.length; l += 16) {
        var c = a, n = d, p = f, q = m;
        a = h(a, d, f, m, b[l + 0], 7, -680876936);
        m = h(m, a, d, f, b[l + 1], 12, -389564586);
        f = h(f, m, a, d, b[l + 2], 17, 606105819);
        d = h(d, f, m, a, b[l + 3], 22, -1044525330);
        a = h(a, d, f, m, b[l + 4], 7, -176418897);
        m = h(m, a, d, f, b[l + 5], 12, 1200080426);
        f = h(f, m, a, d, b[l + 6], 17, -1473231341);
        d = h(d, f, m, a, b[l + 7], 22, -45705983);
        a = h(a, d, f, m, b[l + 8], 7, 1770035416);
        m = h(m, a, d, f, b[l + 9], 12, -1958414417);
        f = h(f, m, a, d, b[l + 10], 17, -42063);
        d = h(d, f, m, a, b[l + 11], 22, -1990404162);
        a = h(a, d, f, m, b[l + 12], 7, 1804603682);
        m = h(m, a, d, f, b[l + 13], 12, -40341101);
        f = h(f, m, a, d, b[l + 14], 17, -1502002290);
        d = h(d, f, m, a, b[l + 15], 22, 1236535329);
        a = k(a, d, f, m, b[l + 1], 5, -165796510);
        m = k(m, a, d, f, b[l + 6], 9, -1069501632);
        f = k(f, m, a, d, b[l + 11], 14, 643717713);
        d = k(d, f, m, a, b[l + 0], 20, -373897302);
        a = k(a, d, f, m, b[l + 5], 5, -701558691);
        m = k(m, a, d, f, b[l + 10], 9, 38016083);
        f = k(f, m, a, d, b[l + 15], 14, -660478335);
        d = k(d, f, m, a, b[l + 4], 20, -405537848);
        a = k(a, d, f, m, b[l + 9], 5, 568446438);
        m = k(m, a, d, f, b[l + 14], 9, -1019803690);
        f = k(f, m, a, d, b[l + 3], 14, -187363961);
        d = k(d, f, m, a, b[l + 8], 20, 1163531501);
        a = k(a, d, f, m, b[l + 13], 5, -1444681467);
        m = k(m, a, d, f, b[l + 2], 9, -51403784);
        f = k(f, m, a, d, b[l + 7], 14, 1735328473);
        d = k(d, f, m, a, b[l + 12], 20, -1926607734);
        a = e(a, d, f, m, b[l + 5], 4, -378558);
        m = e(m, a, d, f, b[l + 8], 11, -2022574463);
        f = e(f, m, a, d, b[l + 11], 16, 1839030562);
        d = e(d, f, m, a, b[l + 14], 23, -35309556);
        a = e(a, d, f, m, b[l + 1], 4, -1530992060);
        m = e(m, a, d, f, b[l + 4], 11, 1272893353);
        f = e(f, m, a, d, b[l + 7], 16, -155497632);
        d = e(d, f, m, a, b[l + 10], 23, -1094730640);
        a = e(a, d, f, m, b[l + 13], 4, 681279174);
        m = e(m, a, d, f, b[l + 0], 11, -358537222);
        f = e(f, m, a, d, b[l + 3], 16, -722521979);
        d = e(d, f, m, a, b[l + 6], 23, 76029189);
        a = e(a, d, f, m, b[l + 9], 4, -640364487);
        m = e(m, a, d, f, b[l + 12], 11, -421815835);
        f = e(f, m, a, d, b[l + 15], 16, 530742520);
        d = e(d, f, m, a, b[l + 2], 23, -995338651);
        a = g(a, d, f, m, b[l + 0], 6, -198630844);
        m = g(m, a, d, f, b[l + 7], 10, 1126891415);
        f = g(f, m, a, d, b[l + 14], 15, -1416354905);
        d = g(d, f, m, a, b[l + 5], 21, -57434055);
        a = g(a, d, f, m, b[l + 12], 6, 1700485571);
        m = g(m, a, d, f, b[l + 3], 10, -1894986606);
        f = g(f, m, a, d, b[l + 10], 15, -1051523);
        d = g(d, f, m, a, b[l + 1], 21, -2054922799);
        a = g(a, d, f, m, b[l + 8], 6, 1873313359);
        m = g(m, a, d, f, b[l + 15], 10, -30611744);
        f = g(f, m, a, d, b[l + 6], 15, -1560198380);
        d = g(d, f, m, a, b[l + 13], 21, 1309151649);
        a = g(a, d, f, m, b[l + 4], 6, -145523070);
        m = g(m, a, d, f, b[l + 11], 10, -1120210379);
        f = g(f, m, a, d, b[l + 2], 15, 718787259);
        d = g(d, f, m, a, b[l + 9], 21, -343485551);
        a = a + c >>> 0;
        d = d + n >>> 0;
        f = f + p >>> 0;
        m = m + q >>> 0;
    }
    var r = function(b) {
        if (b.constructor == Number) return (b << 8 | b >>> 24) & 16711935 | (b << 24 | b >>> 8) & 4278255360;
        for (var c = 0; c < b.length; c++) b[c] = r(b[c]);
        return b;
    };
    return fromByteArray(wordsToBytes(r([ a, d, f, m ])));
};

var symbols = {
    "-2": "E",
    "-1": "S",
    0: " ",
    1: ".",
    2: "o",
    3: "+",
    4: "=",
    5: "*",
    6: "B",
    7: "O",
    8: "X",
    9: "@",
    10: "%",
    11: "&",
    12: "#",
    13: "/",
    14: "^"
}, bounds = {
    width: 17,
    height: 9
};

function createBoard(b) {
    for (var a = [], h = 0; h < b.width; h++) {
        a[h] = [];
        for (var d = 0; d < b.height; d++) a[h][d] = 0;
    }
    return a;
}

function generateBoard(b) {
    var a = createBoard(bounds), h = Math.floor(bounds.width / 2), d = Math.floor(bounds.height / 2);
    a[h][d] = -1;
    b.forEach(function(b) {
        for (var f = 0; 8 > f; f += 2) {
            var l = b >> f & 3;
            switch (l) {
              case 0:
              case 1:
                0 < d && d--;
                break;

              case 2:
              case 3:
                d < bounds.height - 1 && d++;
            }
            switch (l) {
              case 0:
              case 2:
                0 < h && h--;
                break;

              case 1:
              case 3:
                h < bounds.width - 1 && h++;
            }
            0 <= a[h][d] && a[h][d]++;
        }
    });
    a[h][d] = -2;
    return a;
}

function boardToString(b) {
    result = [];
    for (var a = 0; a < bounds.height; a++) {
        result[a] = [];
        for (var h = 0; h < bounds.width; h++) result[a][h] = symbols[b[h][a]] || symbols[0];
        result[a] = "|" + result[a].join("") + "|";
    }
    result.splice(0, 0, "\n+---[ RSA2048 ]---+");
    result.push("+-----------------+");
    return result.join("\n");
}

function randomart(b) {
    for (var a = [], h = 0, d = b.length; h < d; h++) a.push("0x" + b[h]);
    document.getElementById("hostKeyImg").innerHTML = boardToString(generateBoard(a));
}

var struct = {
    pack: function(b, a) {
        var h = "";
        switch (b) {
          case "Q":
            b = new BigInteger("ff", 16);
            h += String.fromCharCode(a.shiftRight(56).and(b));
            h += String.fromCharCode(a.shiftRight(48).and(b));
            h += String.fromCharCode(a.shiftRight(40).and(b));
            h += String.fromCharCode(a.shiftRight(32).and(b));
            h += String.fromCharCode(a.shiftRight(24).and(b));
            h += String.fromCharCode(a.shiftRight(16).and(b));
            h += String.fromCharCode(a.shiftRight(8).and(b));
            h += String.fromCharCode(a.and(b));
            break;

          case "I":
            h += String.fromCharCode(a >>> 24 & 255), h += String.fromCharCode(a >>> 16 & 255), 
            h += String.fromCharCode(a >>> 8 & 255);

          case "B":
            h += String.fromCharCode(a & 255);
        }
        return h;
    },
    unpack: function(b, a) {
        var h = [], d = 0, f = 0;
        switch (b) {
          case "Q":
            f = new BigInteger("0", 10);
            f = f.add(new BigInteger(a.charCodeAt(0).toString(), 10).shiftLeft(56));
            f = f.add(new BigInteger(a.charCodeAt(1).toString(), 10).shiftLeft(48));
            f = f.add(new BigInteger(a.charCodeAt(2).toString(), 10).shiftLeft(40));
            f = f.add(new BigInteger(a.charCodeAt(3).toString(), 10).shiftLeft(32));
            f = f.add(new BigInteger(a.charCodeAt(4).toString(), 10).shiftLeft(24));
            f = f.add(new BigInteger(a.charCodeAt(5).toString(), 10).shiftLeft(16));
            f = f.add(new BigInteger(a.charCodeAt(6).toString(), 10).shiftLeft(8));
            f = f.add(new BigInteger(a.charCodeAt(7).toString(), 10).shiftLeft(0));
            h.push(f);
            break;

          case "I":
            f += a.charCodeAt(0) << 24 >>> 0, f += a.charCodeAt(1) << 16 >>> 0, f += a.charCodeAt(2) << 8 >>> 0, 
            d += 3;

          case "B":
            f += a.charCodeAt(0 + d) << 0 >>> 0, h.push(f);
        }
        return h;
    }
};

function inflate_long(b) {
    var a = new BigInteger("0", 10);
    b.length % 4 && (b = Array(4 - b.length % 4 + 1).join("\0") + b);
    for (var h = 0; h < b.length; h += 4) a = a.shiftLeft(32), a = a.add(new BigInteger(struct.unpack("I", b.substring(h, h + 4))[0].toString(), 10));
    return a;
}

function deflate_long(b, a) {
    b = "number" == typeof b ? new BigInteger(b.toString(), 10) : b.clone();
    a = void 0 == a ? !0 : a;
    for (var h = "", d = new BigInteger("-1", 10), f = new BigInteger("ffffffff", 16); !b.equals(BigInteger.ZERO) && !b.equals(d); ) h = struct.pack("I", b.and(f)) + h, 
    b = b.shiftRight(32);
    f = !1;
    for (var m = 0; m < h.length; ++m) {
        if (b.equals(BigInteger.ZERO) && "\0" != h.charAt(m)) {
            f = !0;
            break;
        }
        if (b.equals(d) && "ÿ" != h.charAt(m)) {
            f = !0;
            break;
        }
    }
    f || (m = 0, h = b.equals(BigInteger.ZERO) ? "\0" : "ÿ");
    h = h.substring(m);
    a && (b.equals(BigInteger.ZERO) && 128 <= h.charCodeAt(0) && (h = "\0" + h), b.equals(d) && 128 > h.charCodeAt(0) && (h = "ÿ" + h));
    return h;
}

function toByteArray(b) {
    for (var a = new Uint8Array(b.length), h = 0; h < b.length; h++) a[h] = b.charCodeAt(h);
    return a;
}

function fromByteArray(b) {
    return String.fromCharCode.apply(null, new Uint8Array(b));
}

function bytesToWords(b) {
    for (var a = [], h = 0, d = 0; h < b.length; h++, d += 8) a[d >>> 5] |= (b[h] & 255) << 24 - d % 32;
    return a;
}

function wordsToBytes(b) {
    for (var a = [], h = 0; h < 32 * b.length; h += 8) a.push(b[h >>> 5] >>> 24 - h % 32 & 255);
    return a;
}

function setCharAt(b, a, h) {
    return b.substring(0, a) + h + b.substring(a + 1);
}

function fromUtf8(b) {
    for (var a = "", h = toByteArray(b), d = 0; d < b.length; d++) {
        var f = b.charCodeAt(d);
        if (192 <= f && 223 >= f) {
            var m = h[++d];
            f = (f & 31) << 6 | m & 63;
        } else if (224 <= f && 239 >= f) {
            m = h[++d];
            var l = h[++d];
            f = (f & 15) << 12 | (m & 63) << 6 | l & 63;
        } else 128 <= f && (f = ".");
        a += String.fromCharCode(f);
    }
    return a;
}

function read_rng(b) {
    return String.fromCharCode.apply(null, window.crypto.getRandomValues(new Uint8Array(b)));
}

function filter(b, a) {
    b = b.split(",");
    for (var h = 0; h < b.length; ++h) if (-1 != a.indexOf(b[h])) return b[h];
}

function splitSlice(b, a) {
    a = void 0 === a ? 5e3 : a;
    for (var h = [], d = 0, f = b.length; d < f; d += a) h.push(b.slice(d, a + d));
    return h;
}

function modColorPercent(b, a) {
    var h = parseInt(b.slice(1), 16);
    b = 0 > a ? 0 : 255;
    a = 0 > a ? -1 * a : a;
    var d = h >> 16, f = h >> 8 & 255;
    h &= 255;
    return "#" + (16777216 + 65536 * (Math.round((b - d) * a) + d) + 256 * (Math.round((b - f) * a) + f) + (Math.round((b - h) * a) + h)).toString(16).slice(1);
}

function ascii2hex(b) {
    for (var a = "", h = 0; h < b.length; h++) a = 1 == b.charCodeAt(h).toString(16).length ? a + ("0" + b.charCodeAt(h).toString(16)) : a + ("" + b.charCodeAt(h).toString(16));
    return a;
}

function termBackspace(b) {
    b.write("\b");
    b.eraseRight(b.buffers._terminal.buffer.x - 1, b.buffers._terminal.buffer.y);
}

(function(b) {
    "object" === typeof exports && "undefined" !== typeof module ? module.exports = b() : "function" === typeof define && define.amd ? define([], b) : ("undefined" !== typeof window ? window : "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : this).Terminal = b();
})(function() {
    return function f(a, h, d) {
        function m(e, g) {
            if (!h[e]) {
                if (!a[e]) {
                    var c = "function" == typeof require && require;
                    if (!g && c) return c(e, !0);
                    if (l) return l(e, !0);
                    g = Error("Cannot find module '" + e + "'");
                    throw g.code = "MODULE_NOT_FOUND", g;
                }
                g = h[e] = {
                    exports: {}
                };
                a[e][0].call(g.exports, function(c) {
                    var g = a[e][1][c];
                    return m(g ? g : c);
                }, g, g.exports, f, a, h, d);
            }
            return h[e].exports;
        }
        for (var l = "function" == typeof require && require, k = 0; k < d.length; k++) m(d[k]);
        return m;
    }({
        1: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var f = a("./utils/CircularList");
            d.CHAR_DATA_ATTR_INDEX = 0;
            d.CHAR_DATA_CHAR_INDEX = 1;
            d.CHAR_DATA_WIDTH_INDEX = 2;
            d.CHAR_DATA_CODE_INDEX = 3;
            d.MAX_BUFFER_SIZE = 4294967295;
            a = function() {
                function a(a, k) {
                    this._terminal = a;
                    this._hasScrollback = k;
                    this.clear();
                }
                Object.defineProperty(a.prototype, "lines", {
                    get: function() {
                        return this._lines;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                Object.defineProperty(a.prototype, "hasScrollback", {
                    get: function() {
                        return this._hasScrollback && this.lines.maxLength > this._terminal.rows;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                Object.defineProperty(a.prototype, "isCursorInViewport", {
                    get: function() {
                        var a = this.ybase + this.y - this.ydisp;
                        return 0 <= a && a < this._terminal.rows;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                a.prototype._getCorrectBufferLength = function(a) {
                    if (!this._hasScrollback) return a;
                    a += this._terminal.options.scrollback;
                    return a > d.MAX_BUFFER_SIZE ? d.MAX_BUFFER_SIZE : a;
                };
                a.prototype.fillViewportRows = function() {
                    if (0 === this._lines.length) for (var a = this._terminal.rows; a--; ) this.lines.push(this._terminal.blankLine());
                };
                a.prototype.clear = function() {
                    this.x = this.y = this.ybase = this.ydisp = 0;
                    this._lines = new f.CircularList(this._getCorrectBufferLength(this._terminal.rows));
                    this.scrollTop = 0;
                    this.scrollBottom = this._terminal.rows - 1;
                    this.setupTabStops();
                };
                a.prototype.resize = function(a, k) {
                    var e = this._getCorrectBufferLength(k);
                    e > this._lines.maxLength && (this._lines.maxLength = e);
                    if (0 < this._lines.length) {
                        if (this._terminal.cols < a) for (var g = [ this._terminal.defAttr, " ", 1, 32 ], c = 0; c < this._lines.length; c++) for (;this._lines.get(c).length < a; ) this._lines.get(c).push(g);
                        g = 0;
                        if (this._terminal.rows < k) for (c = this._terminal.rows; c < k; c++) this._lines.length < k + this.ybase && (0 < this.ybase && this._lines.length <= this.ybase + this.y + g + 1 ? (this.ybase--, 
                        g++, 0 < this.ydisp && this.ydisp--) : this._lines.push(this._terminal.blankLine(void 0, void 0, a))); else for (c = this._terminal.rows; c > k; c--) this._lines.length > k + this.ybase && (this._lines.length > this.ybase + this.y + 1 ? this._lines.pop() : (this.ybase++, 
                        this.ydisp++));
                        e < this._lines.maxLength && (c = this._lines.length - e, 0 < c && (this._lines.trimStart(c), 
                        this.ybase = Math.max(this.ybase - c, 0), this.ydisp = Math.max(this.ydisp - c, 0)), 
                        this._lines.maxLength = e);
                        this.x = Math.min(this.x, a - 1);
                        this.y = Math.min(this.y, k - 1);
                        g && (this.y += g);
                        this.savedY = Math.min(this.savedY, k - 1);
                        this.savedX = Math.min(this.savedX, a - 1);
                        this.scrollTop = 0;
                    }
                    this.scrollBottom = k - 1;
                };
                a.prototype.translateBufferLineToString = function(a, k, e, g) {
                    void 0 === e && (e = 0);
                    void 0 === g && (g = null);
                    var c = "", l = this.lines.get(a);
                    if (!l) return "";
                    a = e;
                    null === g && (g = l.length);
                    for (var f = g, m = 0; m < l.length; m++) {
                        var h = l[m];
                        c += h[d.CHAR_DATA_CHAR_INDEX];
                        0 === h[d.CHAR_DATA_WIDTH_INDEX] ? (e >= m && a--, g >= m && f--) : 1 < h[d.CHAR_DATA_CHAR_INDEX].length && (e > m && (a += h[d.CHAR_DATA_CHAR_INDEX].length - 1), 
                        g > m && (f += h[d.CHAR_DATA_CHAR_INDEX].length - 1));
                    }
                    return k && (k = c.search(/\s+$/), -1 !== k && (f = Math.min(f, k)), f <= a) ? "" : c.substring(a, f);
                };
                a.prototype.setupTabStops = function(a) {
                    null != a ? this.tabs[a] || (a = this.prevStop(a)) : (this.tabs = {}, a = 0);
                    for (;a < this._terminal.cols; a += this._terminal.options.tabStopWidth) this.tabs[a] = !0;
                };
                a.prototype.prevStop = function(a) {
                    null == a && (a = this.x);
                    for (;!this.tabs[--a] && 0 < a; ) ;
                    return a >= this._terminal.cols ? this._terminal.cols - 1 : 0 > a ? 0 : a;
                };
                a.prototype.nextStop = function(a) {
                    null == a && (a = this.x);
                    for (;!this.tabs[++a] && a < this._terminal.cols; ) ;
                    return a >= this._terminal.cols ? this._terminal.cols - 1 : 0 > a ? 0 : a;
                };
                return a;
            }();
            d.Buffer = a;
        }, {
            "./utils/CircularList": 32
        } ],
        2: [ function(a, h, d) {
            var f = this && this.__extends || function() {
                var a = Object.setPrototypeOf || {
                    __proto__: []
                } instanceof Array && function(a, e) {
                    a.__proto__ = e;
                } || function(a, e) {
                    for (var g in e) e.hasOwnProperty(g) && (a[g] = e[g]);
                };
                return function(k, e) {
                    function g() {
                        this.constructor = k;
                    }
                    a(k, e);
                    k.prototype = null === e ? Object.create(e) : (g.prototype = e.prototype, new g());
                };
            }();
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var m = a("./Buffer");
            a = function(a) {
                function k(e) {
                    var g = a.call(this) || this;
                    g._terminal = e;
                    g._normal = new m.Buffer(g._terminal, !0);
                    g._normal.fillViewportRows();
                    g._alt = new m.Buffer(g._terminal, !1);
                    g._activeBuffer = g._normal;
                    g.setupTabStops();
                    return g;
                }
                f(k, a);
                Object.defineProperty(k.prototype, "alt", {
                    get: function() {
                        return this._alt;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                Object.defineProperty(k.prototype, "active", {
                    get: function() {
                        return this._activeBuffer;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                Object.defineProperty(k.prototype, "normal", {
                    get: function() {
                        return this._normal;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                k.prototype.activateNormalBuffer = function() {
                    this._activeBuffer !== this._normal && (this._alt.clear(), this._activeBuffer = this._normal, 
                    this.emit("activate", {
                        activeBuffer: this._normal,
                        inactiveBuffer: this._alt
                    }));
                };
                k.prototype.activateAltBuffer = function() {
                    this._activeBuffer !== this._alt && (this._alt.fillViewportRows(), this._activeBuffer = this._alt, 
                    this.emit("activate", {
                        activeBuffer: this._alt,
                        inactiveBuffer: this._normal
                    }));
                };
                k.prototype.resize = function(a, g) {
                    this._normal.resize(a, g);
                    this._alt.resize(a, g);
                };
                k.prototype.setupTabStops = function(a) {
                    this._normal.setupTabStops(a);
                    this._alt.setupTabStops(a);
                };
                return k;
            }(a("./EventEmitter").EventEmitter);
            d.BufferSet = a;
        }, {
            "./Buffer": 1,
            "./EventEmitter": 7
        } ],
        3: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            d.wcwidth = function(a) {
                function d(a, e) {
                    var c = 0, g = e.length - 1;
                    if (a < e[0][0] || a > e[g][1]) return !1;
                    for (;g >= c; ) {
                        var k = c + g >> 1;
                        if (a > e[k][1]) c = k + 1; else if (a < e[k][0]) g = k - 1; else return !0;
                    }
                    return !1;
                }
                var l = [ [ 768, 879 ], [ 1155, 1158 ], [ 1160, 1161 ], [ 1425, 1469 ], [ 1471, 1471 ], [ 1473, 1474 ], [ 1476, 1477 ], [ 1479, 1479 ], [ 1536, 1539 ], [ 1552, 1557 ], [ 1611, 1630 ], [ 1648, 1648 ], [ 1750, 1764 ], [ 1767, 1768 ], [ 1770, 1773 ], [ 1807, 1807 ], [ 1809, 1809 ], [ 1840, 1866 ], [ 1958, 1968 ], [ 2027, 2035 ], [ 2305, 2306 ], [ 2364, 2364 ], [ 2369, 2376 ], [ 2381, 2381 ], [ 2385, 2388 ], [ 2402, 2403 ], [ 2433, 2433 ], [ 2492, 2492 ], [ 2497, 2500 ], [ 2509, 2509 ], [ 2530, 2531 ], [ 2561, 2562 ], [ 2620, 2620 ], [ 2625, 2626 ], [ 2631, 2632 ], [ 2635, 2637 ], [ 2672, 2673 ], [ 2689, 2690 ], [ 2748, 2748 ], [ 2753, 2757 ], [ 2759, 2760 ], [ 2765, 2765 ], [ 2786, 2787 ], [ 2817, 2817 ], [ 2876, 2876 ], [ 2879, 2879 ], [ 2881, 2883 ], [ 2893, 2893 ], [ 2902, 2902 ], [ 2946, 2946 ], [ 3008, 3008 ], [ 3021, 3021 ], [ 3134, 3136 ], [ 3142, 3144 ], [ 3146, 3149 ], [ 3157, 3158 ], [ 3260, 3260 ], [ 3263, 3263 ], [ 3270, 3270 ], [ 3276, 3277 ], [ 3298, 3299 ], [ 3393, 3395 ], [ 3405, 3405 ], [ 3530, 3530 ], [ 3538, 3540 ], [ 3542, 3542 ], [ 3633, 3633 ], [ 3636, 3642 ], [ 3655, 3662 ], [ 3761, 3761 ], [ 3764, 3769 ], [ 3771, 3772 ], [ 3784, 3789 ], [ 3864, 3865 ], [ 3893, 3893 ], [ 3895, 3895 ], [ 3897, 3897 ], [ 3953, 3966 ], [ 3968, 3972 ], [ 3974, 3975 ], [ 3984, 3991 ], [ 3993, 4028 ], [ 4038, 4038 ], [ 4141, 4144 ], [ 4146, 4146 ], [ 4150, 4151 ], [ 4153, 4153 ], [ 4184, 4185 ], [ 4448, 4607 ], [ 4959, 4959 ], [ 5906, 5908 ], [ 5938, 5940 ], [ 5970, 5971 ], [ 6002, 6003 ], [ 6068, 6069 ], [ 6071, 6077 ], [ 6086, 6086 ], [ 6089, 6099 ], [ 6109, 6109 ], [ 6155, 6157 ], [ 6313, 6313 ], [ 6432, 6434 ], [ 6439, 6440 ], [ 6450, 6450 ], [ 6457, 6459 ], [ 6679, 6680 ], [ 6912, 6915 ], [ 6964, 6964 ], [ 6966, 6970 ], [ 6972, 6972 ], [ 6978, 6978 ], [ 7019, 7027 ], [ 7616, 7626 ], [ 7678, 7679 ], [ 8203, 8207 ], [ 8234, 8238 ], [ 8288, 8291 ], [ 8298, 8303 ], [ 8400, 8431 ], [ 12330, 12335 ], [ 12441, 12442 ], [ 43014, 43014 ], [ 43019, 43019 ], [ 43045, 43046 ], [ 64286, 64286 ], [ 65024, 65039 ], [ 65056, 65059 ], [ 65279, 65279 ], [ 65529, 65531 ] ], k = [ [ 68097, 68099 ], [ 68101, 68102 ], [ 68108, 68111 ], [ 68152, 68154 ], [ 68159, 68159 ], [ 119143, 119145 ], [ 119155, 119170 ], [ 119173, 119179 ], [ 119210, 119213 ], [ 119362, 119364 ], [ 917505, 917505 ], [ 917536, 917631 ], [ 917760, 917999 ] ], e = a.control | 0, g = null;
                return function(c) {
                    c |= 0;
                    if (32 > c) return e | 0;
                    if (127 > c) return 1;
                    var n;
                    if (!(n = g)) {
                        g = "undefined" === typeof Uint32Array ? Array(4096) : new Uint32Array(4096);
                        for (n = 0; 4096 > n; ++n) {
                            for (var f = 0, m = 16; m--; ) {
                                f <<= 2;
                                var h = 16 * n + m;
                                h = 0 === h ? a.nul : 32 > h || 127 <= h && 160 > h ? a.control : d(h, l) ? 0 : 4352 <= h && (4447 >= h || 9001 === h || 9002 === h || 11904 <= h && 42191 >= h && 12351 !== h || 44032 <= h && 55203 >= h || 63744 <= h && 64255 >= h || 65040 <= h && 65049 >= h || 65072 <= h && 65135 >= h || 65280 <= h && 65376 >= h || 65504 <= h && 65510 >= h) ? 2 : 1;
                                f |= h;
                            }
                            g[n] = f;
                        }
                        n = g;
                    }
                    if (65536 > c) return n[c >> 4] >> ((c & 15) << 1) & 3;
                    c = d(c, k) ? 0 : 131072 <= c && 196605 >= c || 196608 <= c && 262141 >= c ? 2 : 1;
                    return c;
                };
            }({
                nul: 0,
                control: 0
            });
        }, {} ],
        4: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            d.CHARSETS = {};
            d.DEFAULT_CHARSET = d.CHARSETS.B;
            d.CHARSETS["0"] = {
                "`": "◆",
                a: "▒",
                b: "\t",
                c: "\f",
                d: "\r",
                e: "\n",
                f: "°",
                g: "±",
                h: "␤",
                i: "\v",
                j: "┘",
                k: "┐",
                l: "┌",
                m: "└",
                n: "┼",
                o: "⎺",
                p: "⎻",
                q: "─",
                r: "⎼",
                s: "⎽",
                t: "├",
                u: "┤",
                v: "┴",
                w: "┬",
                x: "│",
                y: "≤",
                z: "≥",
                "{": "π",
                "|": "≠",
                "}": "£",
                "~": "·"
            };
            d.CHARSETS.A = {
                "#": "£"
            };
            d.CHARSETS.B = null;
            d.CHARSETS["4"] = {
                "#": "£",
                "@": "¾",
                "[": "ij",
                "\\": "½",
                "]": "|",
                "{": "¨",
                "|": "f",
                "}": "¼",
                "~": "´"
            };
            d.CHARSETS.C = d.CHARSETS["5"] = {
                "[": "Ä",
                "\\": "Ö",
                "]": "Å",
                "^": "Ü",
                "`": "é",
                "{": "ä",
                "|": "ö",
                "}": "å",
                "~": "ü"
            };
            d.CHARSETS.R = {
                "#": "£",
                "@": "à",
                "[": "°",
                "\\": "ç",
                "]": "§",
                "{": "é",
                "|": "ù",
                "}": "è",
                "~": "¨"
            };
            d.CHARSETS.Q = {
                "@": "à",
                "[": "â",
                "\\": "ç",
                "]": "ê",
                "^": "î",
                "`": "ô",
                "{": "é",
                "|": "ù",
                "}": "è",
                "~": "û"
            };
            d.CHARSETS.K = {
                "@": "§",
                "[": "Ä",
                "\\": "Ö",
                "]": "Ü",
                "{": "ä",
                "|": "ö",
                "}": "ü",
                "~": "ß"
            };
            d.CHARSETS.Y = {
                "#": "£",
                "@": "§",
                "[": "°",
                "\\": "ç",
                "]": "é",
                "`": "ù",
                "{": "à",
                "|": "ò",
                "}": "è",
                "~": "ì"
            };
            d.CHARSETS.E = d.CHARSETS["6"] = {
                "@": "Ä",
                "[": "Æ",
                "\\": "Ø",
                "]": "Å",
                "^": "Ü",
                "`": "ä",
                "{": "æ",
                "|": "ø",
                "}": "å",
                "~": "ü"
            };
            d.CHARSETS.Z = {
                "#": "£",
                "@": "§",
                "[": "¡",
                "\\": "Ñ",
                "]": "¿",
                "{": "°",
                "|": "ñ",
                "}": "ç"
            };
            d.CHARSETS.H = d.CHARSETS["7"] = {
                "@": "É",
                "[": "Ä",
                "\\": "Ö",
                "]": "Å",
                "^": "Ü",
                "`": "é",
                "{": "ä",
                "|": "ö",
                "}": "å",
                "~": "ü"
            };
            d.CHARSETS["="] = {
                "#": "ù",
                "@": "à",
                "[": "é",
                "\\": "ç",
                "]": "ê",
                "^": "î",
                _: "è",
                "`": "ô",
                "{": "ä",
                "|": "ö",
                "}": "ü",
                "~": "û"
            };
        }, {} ],
        5: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = function() {
                function a(a, l, k) {
                    this.textarea = a;
                    this.compositionView = l;
                    this.terminal = k;
                    this.isSendingComposition = this.isComposing = !1;
                    this.compositionPosition = {
                        start: null,
                        end: null
                    };
                }
                a.prototype.compositionstart = function() {
                    this.isComposing = !0;
                    this.compositionPosition.start = this.textarea.value.length;
                    this.compositionView.textContent = "";
                    this.compositionView.classList.add("active");
                };
                a.prototype.compositionupdate = function(a) {
                    var l = this;
                    this.compositionView.textContent = a.data;
                    this.updateCompositionElements();
                    setTimeout(function() {
                        l.compositionPosition.end = l.textarea.value.length;
                    }, 0);
                };
                a.prototype.compositionend = function() {
                    this.finalizeComposition(!0);
                };
                a.prototype.keydown = function(a) {
                    if (this.isComposing || this.isSendingComposition) {
                        if (229 === a.keyCode || 16 === a.keyCode || 17 === a.keyCode || 18 === a.keyCode) return !1;
                        this.finalizeComposition(!1);
                    }
                    return 229 === a.keyCode ? (this.handleAnyTextareaChanges(), !1) : !0;
                };
                a.prototype.finalizeComposition = function(a) {
                    var l = this;
                    this.compositionView.classList.remove("active");
                    this.isComposing = !1;
                    this.clearTextareaPosition();
                    if (a) {
                        var k = this.compositionPosition.start, e = this.compositionPosition.end;
                        this.isSendingComposition = !0;
                        setTimeout(function() {
                            if (l.isSendingComposition) {
                                l.isSendingComposition = !1;
                                var a = l.isComposing ? l.textarea.value.substring(k, e) : l.textarea.value.substring(k);
                                l.terminal.handler(a);
                            }
                        }, 0);
                    } else this.isSendingComposition = !1, a = this.textarea.value.substring(this.compositionPosition.start, this.compositionPosition.end), 
                    this.terminal.handler(a);
                };
                a.prototype.handleAnyTextareaChanges = function() {
                    var a = this, l = this.textarea.value;
                    setTimeout(function() {
                        if (!a.isComposing) {
                            var k = a.textarea.value.replace(l, "");
                            0 < k.length && a.terminal.handler(k);
                        }
                    }, 0);
                };
                a.prototype.updateCompositionElements = function(a) {
                    var l = this;
                    if (this.isComposing) {
                        if (this.terminal.buffer.isCursorInViewport) {
                            var k = Math.ceil(this.terminal.charMeasure.height * this.terminal.options.lineHeight), e = this.terminal.buffer.y * k, g = this.terminal.buffer.x * this.terminal.charMeasure.width;
                            this.compositionView.style.left = g + "px";
                            this.compositionView.style.top = e + "px";
                            this.compositionView.style.height = k + "px";
                            this.compositionView.style.lineHeight = k + "px";
                            k = this.compositionView.getBoundingClientRect();
                            this.textarea.style.left = g + "px";
                            this.textarea.style.top = e + "px";
                            this.textarea.style.width = k.width + "px";
                            this.textarea.style.height = k.height + "px";
                            this.textarea.style.lineHeight = k.height + "px";
                        }
                        a || setTimeout(function() {
                            return l.updateCompositionElements(!0);
                        }, 0);
                    }
                };
                a.prototype.clearTextareaPosition = function() {
                    this.textarea.style.left = "";
                    this.textarea.style.top = "";
                };
                return a;
            }();
            d.CompositionHelper = a;
        }, {} ],
        6: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = d.C0 || (d.C0 = {});
            a.NUL = "\0";
            a.SOH = "";
            a.STX = "";
            a.ETX = "";
            a.EOT = "";
            a.ENQ = "";
            a.ACK = "";
            a.BEL = "";
            a.BS = "\b";
            a.HT = "\t";
            a.LF = "\n";
            a.VT = "\v";
            a.FF = "\f";
            a.CR = "\r";
            a.SO = "";
            a.SI = "";
            a.DLE = "";
            a.DC1 = "";
            a.DC2 = "";
            a.DC3 = "";
            a.DC4 = "";
            a.NAK = "";
            a.SYN = "";
            a.ETB = "";
            a.CAN = "";
            a.EM = "";
            a.SUB = "";
            a.ESC = "";
            a.FS = "";
            a.GS = "";
            a.RS = "";
            a.US = "";
            a.SP = " ";
            a.DEL = "";
        }, {} ],
        7: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = function() {
                function a() {
                    this._events = this._events || {};
                }
                a.prototype.on = function(a, l) {
                    this._events[a] = this._events[a] || [];
                    this._events[a].push(l);
                };
                a.prototype.off = function(a, l) {
                    if (this._events[a]) {
                        a = this._events[a];
                        for (var k = a.length; k--; ) if (a[k] === l) {
                            a.splice(k, 1);
                            break;
                        }
                    }
                };
                a.prototype.removeAllListeners = function(a) {
                    this._events[a] && delete this._events[a];
                };
                a.prototype.emit = function(a) {
                    for (var l = [], k = 1; k < arguments.length; k++) l[k - 1] = arguments[k];
                    if (this._events[a]) {
                        k = this._events[a];
                        for (var e = 0; e < k.length; e++) k[e].apply(this, l);
                    }
                };
                a.prototype.listeners = function(a) {
                    return this._events[a] || [];
                };
                a.prototype.destroy = function() {
                    this._events = {};
                };
                return a;
            }();
            d.EventEmitter = a;
        }, {} ],
        8: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var f = a("./EscapeSequences"), m = a("./Charsets"), l = a("./Buffer"), k = a("./renderer/Types"), e = a("./CharWidth");
            a = function() {
                function a(a) {
                    this._terminal = a;
                }
                a.prototype.addChar = function(a, g) {
                    if (" " <= a) {
                        g = e.wcwidth(g);
                        this._terminal.charset && this._terminal.charset[a] && (a = this._terminal.charset[a]);
                        var c = this._terminal.buffer.y + this._terminal.buffer.ybase;
                        if (!g && this._terminal.buffer.x) this._terminal.buffer.lines.get(c)[this._terminal.buffer.x - 1] && (this._terminal.buffer.lines.get(c)[this._terminal.buffer.x - 1][l.CHAR_DATA_WIDTH_INDEX] ? (this._terminal.buffer.lines.get(c)[this._terminal.buffer.x - 1][l.CHAR_DATA_CHAR_INDEX] += a, 
                        this._terminal.buffer.lines.get(c)[this._terminal.buffer.x - 1][3] = a.charCodeAt(0)) : this._terminal.buffer.lines.get(c)[this._terminal.buffer.x - 2] && (this._terminal.buffer.lines.get(c)[this._terminal.buffer.x - 2][l.CHAR_DATA_CHAR_INDEX] += a, 
                        this._terminal.buffer.lines.get(c)[this._terminal.buffer.x - 2][3] = a.charCodeAt(0)), 
                        this._terminal.updateRange(this._terminal.buffer.y)); else {
                            if (this._terminal.buffer.x + g - 1 >= this._terminal.cols) if (this._terminal.wraparoundMode) this._terminal.buffer.x = 0, 
                            this._terminal.buffer.y++, this._terminal.buffer.y > this._terminal.buffer.scrollBottom ? (this._terminal.buffer.y--, 
                            this._terminal.scroll(!0)) : this._terminal.buffer.lines.get(this._terminal.buffer.y).isWrapped = !0; else if (2 === g) return;
                            c = this._terminal.buffer.y + this._terminal.buffer.ybase;
                            if (this._terminal.insertMode) for (var k = 0; k < g; ++k) 0 === this._terminal.buffer.lines.get(this._terminal.buffer.y + this._terminal.buffer.ybase).pop()[l.CHAR_DATA_WIDTH_INDEX] && this._terminal.buffer.lines.get(c)[this._terminal.cols - 2] && 2 === this._terminal.buffer.lines.get(c)[this._terminal.cols - 2][l.CHAR_DATA_WIDTH_INDEX] && (this._terminal.buffer.lines.get(c)[this._terminal.cols - 2] = [ this._terminal.curAttr, " ", 1, 32 ]), 
                            this._terminal.buffer.lines.get(c).splice(this._terminal.buffer.x, 0, [ this._terminal.curAttr, " ", 1, 32 ]);
                            this._terminal.buffer.lines.get(c)[this._terminal.buffer.x] = [ this._terminal.curAttr, a, g, a.charCodeAt(0) ];
                            this._terminal.buffer.x++;
                            this._terminal.updateRange(this._terminal.buffer.y);
                            2 === g && (this._terminal.buffer.lines.get(c)[this._terminal.buffer.x] = [ this._terminal.curAttr, "", 0, void 0 ], 
                            this._terminal.buffer.x++);
                        }
                    }
                };
                a.prototype.bell = function() {
                    this._terminal.bell();
                };
                a.prototype.lineFeed = function() {
                    this._terminal.convertEol && (this._terminal.buffer.x = 0);
                    this._terminal.buffer.y++;
                    this._terminal.buffer.y > this._terminal.buffer.scrollBottom && (this._terminal.buffer.y--, 
                    this._terminal.scroll());
                    this._terminal.buffer.x >= this._terminal.cols && this._terminal.buffer.x--;
                    this._terminal.emit("linefeed");
                };
                a.prototype.carriageReturn = function() {
                    this._terminal.buffer.x = 0;
                };
                a.prototype.backspace = function() {
                    0 < this._terminal.buffer.x && this._terminal.buffer.x--;
                };
                a.prototype.tab = function() {
                    this._terminal.buffer.x = this._terminal.buffer.nextStop();
                };
                a.prototype.shiftOut = function() {
                    this._terminal.setgLevel(1);
                };
                a.prototype.shiftIn = function() {
                    this._terminal.setgLevel(0);
                };
                a.prototype.insertChars = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    for (var c = this._terminal.buffer.y + this._terminal.buffer.ybase, e = this._terminal.buffer.x, g = [ this._terminal.eraseAttr(), " ", 1, 32 ]; a-- && e < this._terminal.cols; ) this._terminal.buffer.lines.get(c).splice(e++, 0, g), 
                    this._terminal.buffer.lines.get(c).pop();
                };
                a.prototype.cursorUp = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    this._terminal.buffer.y -= a;
                    0 > this._terminal.buffer.y && (this._terminal.buffer.y = 0);
                };
                a.prototype.cursorDown = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    this._terminal.buffer.y += a;
                    this._terminal.buffer.y >= this._terminal.rows && (this._terminal.buffer.y = this._terminal.rows - 1);
                    this._terminal.buffer.x >= this._terminal.cols && this._terminal.buffer.x--;
                };
                a.prototype.cursorForward = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    this._terminal.buffer.x += a;
                    this._terminal.buffer.x >= this._terminal.cols && (this._terminal.buffer.x = this._terminal.cols - 1);
                };
                a.prototype.cursorBackward = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    this._terminal.buffer.x >= this._terminal.cols && this._terminal.buffer.x--;
                    this._terminal.buffer.x -= a;
                    0 > this._terminal.buffer.x && (this._terminal.buffer.x = 0);
                };
                a.prototype.cursorNextLine = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    this._terminal.buffer.y += a;
                    this._terminal.buffer.y >= this._terminal.rows && (this._terminal.buffer.y = this._terminal.rows - 1);
                    this._terminal.buffer.x = 0;
                };
                a.prototype.cursorPrecedingLine = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    this._terminal.buffer.y -= a;
                    0 > this._terminal.buffer.y && (this._terminal.buffer.y = 0);
                    this._terminal.buffer.x = 0;
                };
                a.prototype.cursorCharAbsolute = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    this._terminal.buffer.x = a - 1;
                };
                a.prototype.cursorPosition = function(a) {
                    var c = a[0] - 1;
                    a = 2 <= a.length ? a[1] - 1 : 0;
                    0 > c ? c = 0 : c >= this._terminal.rows && (c = this._terminal.rows - 1);
                    0 > a ? a = 0 : a >= this._terminal.cols && (a = this._terminal.cols - 1);
                    this._terminal.buffer.x = a;
                    this._terminal.buffer.y = c;
                };
                a.prototype.cursorForwardTab = function(a) {
                    for (a = a[0] || 1; a--; ) this._terminal.buffer.x = this._terminal.buffer.nextStop();
                };
                a.prototype.eraseInDisplay = function(a) {
                    switch (a[0]) {
                      case 0:
                        this._terminal.eraseRight(this._terminal.buffer.x, this._terminal.buffer.y);
                        for (a = this._terminal.buffer.y + 1; a < this._terminal.rows; a++) this._terminal.eraseLine(a);
                        break;

                      case 1:
                        this._terminal.eraseLeft(this._terminal.buffer.x, this._terminal.buffer.y);
                        for (a = this._terminal.buffer.y; a--; ) this._terminal.eraseLine(a);
                        break;

                      case 2:
                        for (a = this._terminal.rows; a--; ) this._terminal.eraseLine(a);
                        break;

                      case 3:
                        a = this._terminal.buffer.lines.length - this._terminal.rows, 0 < a && (this._terminal.buffer.lines.trimStart(a), 
                        this._terminal.buffer.ybase = Math.max(this._terminal.buffer.ybase - a, 0), this._terminal.buffer.ydisp = Math.max(this._terminal.buffer.ydisp - a, 0), 
                        this._terminal.emit("scroll", 0));
                    }
                };
                a.prototype.eraseInLine = function(a) {
                    switch (a[0]) {
                      case 0:
                        this._terminal.eraseRight(this._terminal.buffer.x, this._terminal.buffer.y);
                        break;

                      case 1:
                        this._terminal.eraseLeft(this._terminal.buffer.x, this._terminal.buffer.y);
                        break;

                      case 2:
                        this._terminal.eraseLine(this._terminal.buffer.y);
                    }
                };
                a.prototype.insertLines = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    for (var c = this._terminal.buffer.y + this._terminal.buffer.ybase, e = this._terminal.rows - 1 + this._terminal.buffer.ybase - (this._terminal.rows - 1 - this._terminal.buffer.scrollBottom) + 1; a--; ) this._terminal.buffer.lines.splice(e - 1, 1), 
                    this._terminal.buffer.lines.splice(c, 0, this._terminal.blankLine(!0));
                    this._terminal.updateRange(this._terminal.buffer.y);
                    this._terminal.updateRange(this._terminal.buffer.scrollBottom);
                };
                a.prototype.deleteLines = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    var c = this._terminal.buffer.y + this._terminal.buffer.ybase;
                    var e = this._terminal.rows - 1 - this._terminal.buffer.scrollBottom;
                    for (e = this._terminal.rows - 1 + this._terminal.buffer.ybase - e; a--; ) this._terminal.buffer.lines.splice(c, 1), 
                    this._terminal.buffer.lines.splice(e, 0, this._terminal.blankLine(!0));
                    this._terminal.updateRange(this._terminal.buffer.y);
                    this._terminal.updateRange(this._terminal.buffer.scrollBottom);
                };
                a.prototype.deleteChars = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    for (var c = this._terminal.buffer.y + this._terminal.buffer.ybase, e = [ this._terminal.eraseAttr(), " ", 1, 32 ]; a--; ) this._terminal.buffer.lines.get(c).splice(this._terminal.buffer.x, 1), 
                    this._terminal.buffer.lines.get(c).push(e);
                    this._terminal.updateRange(this._terminal.buffer.y);
                };
                a.prototype.scrollUp = function(a) {
                    for (a = a[0] || 1; a--; ) this._terminal.buffer.lines.splice(this._terminal.buffer.ybase + this._terminal.buffer.scrollTop, 1), 
                    this._terminal.buffer.lines.splice(this._terminal.buffer.ybase + this._terminal.buffer.scrollBottom, 0, this._terminal.blankLine());
                    this._terminal.updateRange(this._terminal.buffer.scrollTop);
                    this._terminal.updateRange(this._terminal.buffer.scrollBottom);
                };
                a.prototype.scrollDown = function(a) {
                    for (a = a[0] || 1; a--; ) this._terminal.buffer.lines.splice(this._terminal.buffer.ybase + this._terminal.buffer.scrollBottom, 1), 
                    this._terminal.buffer.lines.splice(this._terminal.buffer.ybase + this._terminal.buffer.scrollTop, 0, this._terminal.blankLine());
                    this._terminal.updateRange(this._terminal.buffer.scrollTop);
                    this._terminal.updateRange(this._terminal.buffer.scrollBottom);
                };
                a.prototype.eraseChars = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    for (var c = this._terminal.buffer.y + this._terminal.buffer.ybase, e = this._terminal.buffer.x, g = [ this._terminal.eraseAttr(), " ", 1, 32 ]; a-- && e < this._terminal.cols; ) this._terminal.buffer.lines.get(c)[e++] = g;
                };
                a.prototype.cursorBackwardTab = function(a) {
                    for (a = a[0] || 1; a--; ) this._terminal.buffer.x = this._terminal.buffer.prevStop();
                };
                a.prototype.charPosAbsolute = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    this._terminal.buffer.x = a - 1;
                    this._terminal.buffer.x >= this._terminal.cols && (this._terminal.buffer.x = this._terminal.cols - 1);
                };
                a.prototype.HPositionRelative = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    this._terminal.buffer.x += a;
                    this._terminal.buffer.x >= this._terminal.cols && (this._terminal.buffer.x = this._terminal.cols - 1);
                };
                a.prototype.repeatPrecedingCharacter = function(a) {
                    a = a[0] || 1;
                    for (var c = this._terminal.buffer.lines.get(this._terminal.buffer.ybase + this._terminal.buffer.y), e = c[this._terminal.buffer.x - 1] || [ this._terminal.defAttr, " ", 1, 32 ]; a--; ) c[this._terminal.buffer.x++] = e;
                };
                a.prototype.sendDeviceAttributes = function(a) {
                    0 < a[0] || (this._terminal.prefix ? ">" === this._terminal.prefix && (this._terminal.is("xterm") ? this._terminal.send(f.C0.ESC + "[>0;276;0c") : this._terminal.is("rxvt-unicode") ? this._terminal.send(f.C0.ESC + "[>85;95;0c") : this._terminal.is("linux") ? this._terminal.send(a[0] + "c") : this._terminal.is("screen") && this._terminal.send(f.C0.ESC + "[>83;40003;0c")) : this._terminal.is("xterm") || this._terminal.is("rxvt-unicode") || this._terminal.is("screen") ? this._terminal.send(f.C0.ESC + "[?1;2c") : this._terminal.is("linux") && this._terminal.send(f.C0.ESC + "[?6c"));
                };
                a.prototype.linePosAbsolute = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    this._terminal.buffer.y = a - 1;
                    this._terminal.buffer.y >= this._terminal.rows && (this._terminal.buffer.y = this._terminal.rows - 1);
                };
                a.prototype.VPositionRelative = function(a) {
                    a = a[0];
                    1 > a && (a = 1);
                    this._terminal.buffer.y += a;
                    this._terminal.buffer.y >= this._terminal.rows && (this._terminal.buffer.y = this._terminal.rows - 1);
                    this._terminal.buffer.x >= this._terminal.cols && this._terminal.buffer.x--;
                };
                a.prototype.HVPosition = function(a) {
                    1 > a[0] && (a[0] = 1);
                    1 > a[1] && (a[1] = 1);
                    this._terminal.buffer.y = a[0] - 1;
                    this._terminal.buffer.y >= this._terminal.rows && (this._terminal.buffer.y = this._terminal.rows - 1);
                    this._terminal.buffer.x = a[1] - 1;
                    this._terminal.buffer.x >= this._terminal.cols && (this._terminal.buffer.x = this._terminal.cols - 1);
                };
                a.prototype.tabClear = function(a) {
                    a = a[0];
                    0 >= a ? delete this._terminal.buffer.tabs[this._terminal.buffer.x] : 3 === a && (this._terminal.buffer.tabs = {});
                };
                a.prototype.setMode = function(a) {
                    if (1 < a.length) for (var c = 0; c < a.length; c++) this.setMode([ a[c] ]); else if (!this._terminal.prefix) switch (a[0]) {
                      case 4:
                        this._terminal.insertMode = !0;
                    } else if ("?" === this._terminal.prefix) switch (a[0]) {
                      case 1:
                        this._terminal.applicationCursor = !0;
                        break;

                      case 2:
                        this._terminal.setgCharset(0, m.DEFAULT_CHARSET);
                        this._terminal.setgCharset(1, m.DEFAULT_CHARSET);
                        this._terminal.setgCharset(2, m.DEFAULT_CHARSET);
                        this._terminal.setgCharset(3, m.DEFAULT_CHARSET);
                        break;

                      case 3:
                        this._terminal.savedCols = this._terminal.cols;
                        this._terminal.resize(132, this._terminal.rows);
                        break;

                      case 6:
                        this._terminal.originMode = !0;
                        break;

                      case 7:
                        this._terminal.wraparoundMode = !0;
                        break;

                      case 66:
                        this._terminal.log("Serial port requested application keypad.");
                        this._terminal.applicationKeypad = !0;
                        this._terminal.viewport.syncScrollArea();
                        break;

                      case 9:
                      case 1e3:
                      case 1002:
                      case 1003:
                        this._terminal.x10Mouse = 9 === a[0];
                        this._terminal.vt200Mouse = 1e3 === a[0];
                        this._terminal.normalMouse = 1e3 < a[0];
                        this._terminal.mouseEvents = !0;
                        this._terminal.element.classList.add("enable-mouse-events");
                        this._terminal.selectionManager.disable();
                        this._terminal.log("Binding to mouse events.");
                        break;

                      case 1004:
                        this._terminal.sendFocus = !0;
                        break;

                      case 1005:
                        this._terminal.utfMouse = !0;
                        break;

                      case 1006:
                        this._terminal.sgrMouse = !0;
                        break;

                      case 1015:
                        this._terminal.urxvtMouse = !0;
                        break;

                      case 25:
                        this._terminal.cursorHidden = !1;
                        break;

                      case 1049:
                      case 47:
                      case 1047:
                        this._terminal.buffers.activateAltBuffer();
                        this._terminal.viewport.syncScrollArea();
                        this._terminal.showCursor();
                        break;

                      case 2004:
                        this._terminal.bracketedPasteMode = !0;
                    }
                };
                a.prototype.resetMode = function(a) {
                    if (1 < a.length) for (var c = 0; c < a.length; c++) this.resetMode([ a[c] ]); else if (!this._terminal.prefix) switch (a[0]) {
                      case 4:
                        this._terminal.insertMode = !1;
                    } else if ("?" === this._terminal.prefix) switch (a[0]) {
                      case 1:
                        this._terminal.applicationCursor = !1;
                        break;

                      case 3:
                        132 === this._terminal.cols && this._terminal.savedCols && this._terminal.resize(this._terminal.savedCols, this._terminal.rows);
                        delete this._terminal.savedCols;
                        break;

                      case 6:
                        this._terminal.originMode = !1;
                        break;

                      case 7:
                        this._terminal.wraparoundMode = !1;
                        break;

                      case 66:
                        this._terminal.log("Switching back to normal keypad.");
                        this._terminal.applicationKeypad = !1;
                        this._terminal.viewport.syncScrollArea();
                        break;

                      case 9:
                      case 1e3:
                      case 1002:
                      case 1003:
                        this._terminal.x10Mouse = !1;
                        this._terminal.vt200Mouse = !1;
                        this._terminal.normalMouse = !1;
                        this._terminal.mouseEvents = !1;
                        this._terminal.element.classList.remove("enable-mouse-events");
                        this._terminal.selectionManager.enable();
                        break;

                      case 1004:
                        this._terminal.sendFocus = !1;
                        break;

                      case 1005:
                        this._terminal.utfMouse = !1;
                        break;

                      case 1006:
                        this._terminal.sgrMouse = !1;
                        break;

                      case 1015:
                        this._terminal.urxvtMouse = !1;
                        break;

                      case 25:
                        this._terminal.cursorHidden = !0;
                        break;

                      case 1049:
                      case 47:
                      case 1047:
                        this._terminal.buffers.activateNormalBuffer();
                        this._terminal.refresh(0, this._terminal.rows - 1);
                        this._terminal.viewport.syncScrollArea();
                        this._terminal.showCursor();
                        break;

                      case 2004:
                        this._terminal.bracketedPasteMode = !1;
                    }
                };
                a.prototype.charAttributes = function(a) {
                    if (1 === a.length && 0 === a[0]) this._terminal.curAttr = this._terminal.defAttr; else {
                        for (var c = a.length, e = this._terminal.curAttr >> 18, g = this._terminal.curAttr >> 9 & 511, l = this._terminal.curAttr & 511, d, f = 0; f < c; f++) d = a[f], 
                        30 <= d && 37 >= d ? g = d - 30 : 40 <= d && 47 >= d ? l = d - 40 : 90 <= d && 97 >= d ? (d += 8, 
                        g = d - 90) : 100 <= d && 107 >= d ? (d += 8, l = d - 100) : 0 === d ? (e = this._terminal.defAttr >> 18, 
                        g = this._terminal.defAttr >> 9 & 511, l = this._terminal.defAttr & 511) : 1 === d ? e |= k.FLAGS.BOLD : 4 === d ? e |= k.FLAGS.UNDERLINE : 5 === d ? e |= k.FLAGS.BLINK : 7 === d ? e |= k.FLAGS.INVERSE : 8 === d ? e |= k.FLAGS.INVISIBLE : 2 === d ? e |= k.FLAGS.DIM : 22 === d ? (e &= ~k.FLAGS.BOLD, 
                        e &= ~k.FLAGS.DIM) : 24 === d ? e &= ~k.FLAGS.UNDERLINE : 25 === d ? e &= ~k.FLAGS.BLINK : 27 === d ? e &= ~k.FLAGS.INVERSE : 28 === d ? e &= ~k.FLAGS.INVISIBLE : 39 === d ? g = this._terminal.defAttr >> 9 & 511 : 49 === d ? l = this._terminal.defAttr & 511 : 38 === d ? 2 === a[f + 1] ? (f += 2, 
                        g = this._terminal.matchColor(a[f] & 255, a[f + 1] & 255, a[f + 2] & 255), -1 === g && (g = 511), 
                        f += 2) : 5 === a[f + 1] && (f += 2, g = d = a[f] & 255) : 48 === d ? 2 === a[f + 1] ? (f += 2, 
                        l = this._terminal.matchColor(a[f] & 255, a[f + 1] & 255, a[f + 2] & 255), -1 === l && (l = 511), 
                        f += 2) : 5 === a[f + 1] && (f += 2, l = d = a[f] & 255) : 100 === d ? (g = this._terminal.defAttr >> 9 & 511, 
                        l = this._terminal.defAttr & 511) : this._terminal.error("Unknown SGR attribute: %d.", d);
                        this._terminal.curAttr = e << 18 | g << 9 | l;
                    }
                };
                a.prototype.deviceStatus = function(a) {
                    if (!this._terminal.prefix) switch (a[0]) {
                      case 5:
                        this._terminal.send(f.C0.ESC + "[0n");
                        break;

                      case 6:
                        this._terminal.send(f.C0.ESC + "[" + (this._terminal.buffer.y + 1) + ";" + (this._terminal.buffer.x + 1) + "R");
                    } else if ("?" === this._terminal.prefix) switch (a[0]) {
                      case 6:
                        this._terminal.send(f.C0.ESC + "[?" + (this._terminal.buffer.y + 1) + ";" + (this._terminal.buffer.x + 1) + "R");
                    }
                };
                a.prototype.softReset = function(a) {
                    this._terminal.cursorHidden = !1;
                    this._terminal.insertMode = !1;
                    this._terminal.originMode = !1;
                    this._terminal.wraparoundMode = !0;
                    this._terminal.applicationKeypad = !1;
                    this._terminal.viewport.syncScrollArea();
                    this._terminal.applicationCursor = !1;
                    this._terminal.buffer.scrollTop = 0;
                    this._terminal.buffer.scrollBottom = this._terminal.rows - 1;
                    this._terminal.curAttr = this._terminal.defAttr;
                    this._terminal.buffer.x = this._terminal.buffer.y = 0;
                    this._terminal.charset = null;
                    this._terminal.glevel = 0;
                    this._terminal.charsets = [ null ];
                };
                a.prototype.setCursorStyle = function(a) {
                    a = 1 > a[0] ? 1 : a[0];
                    switch (a) {
                      case 1:
                      case 2:
                        this._terminal.setOption("cursorStyle", "block");
                        break;

                      case 3:
                      case 4:
                        this._terminal.setOption("cursorStyle", "underline");
                        break;

                      case 5:
                      case 6:
                        this._terminal.setOption("cursorStyle", "bar");
                    }
                    this._terminal.setOption("cursorBlink", 1 === a % 2);
                };
                a.prototype.setScrollRegion = function(a) {
                    this._terminal.prefix || (this._terminal.buffer.scrollTop = (a[0] || 1) - 1, this._terminal.buffer.scrollBottom = (a[1] && a[1] <= this._terminal.rows ? a[1] : this._terminal.rows) - 1, 
                    this._terminal.buffer.x = 0, this._terminal.buffer.y = 0);
                };
                a.prototype.saveCursor = function(a) {
                    this._terminal.buffer.savedX = this._terminal.buffer.x;
                    this._terminal.buffer.savedY = this._terminal.buffer.y;
                };
                a.prototype.restoreCursor = function(a) {
                    this._terminal.buffer.x = this._terminal.buffer.savedX || 0;
                    this._terminal.buffer.y = this._terminal.buffer.savedY || 0;
                };
                return a;
            }();
            d.InputHandler = a;
        }, {
            "./Buffer": 1,
            "./CharWidth": 3,
            "./Charsets": 4,
            "./EscapeSequences": 6,
            "./renderer/Types": 28
        } ],
        9: [ function(a, h, d) {
            var f = this && this.__extends || function() {
                var a = Object.setPrototypeOf || {
                    __proto__: []
                } instanceof Array && function(a, c) {
                    a.__proto__ = c;
                } || function(a, c) {
                    for (var e in c) c.hasOwnProperty(e) && (a[e] = c[e]);
                };
                return function(e, c) {
                    function g() {
                        this.constructor = e;
                    }
                    a(e, c);
                    e.prototype = null === c ? Object.create(c) : (g.prototype = c.prototype, new g());
                };
            }();
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var m = a("./Types"), l = a("./input/MouseZoneManager"), k = /(?:^|[^\da-z\.-]+)((https?:\/\/)((([\da-z\.-]+)\.([a-z\.]{2,6}))|((\d{1,3}\.){3}\d{1,3})|(localhost))(:\d{1,5})?(\/[\/\w\.\-%~]*)*(\?[0-9\w\[\]\(\)\/\?\!#@$%&'*+,:;~\=\.\-]*)?(#[0-9\w\[\]\(\)\/\?\!#@$%&'*+,:;~\=\.\-]*)?)($|[^\/\w\.\-%]+)/;
            a = function(a) {
                function e(c) {
                    var e = a.call(this) || this;
                    e._terminal = c;
                    e._linkMatchers = [];
                    e._nextLinkMatcherId = 0;
                    e._rowsToLinkify = {
                        start: null,
                        end: null
                    };
                    e.registerLinkMatcher(k, null, {
                        matchIndex: 1
                    });
                    return e;
                }
                f(e, a);
                e.prototype.attachToDom = function(a) {
                    this._mouseZoneManager = a;
                };
                e.prototype.linkifyRows = function(a, g) {
                    var c = this;
                    this._mouseZoneManager && (null === this._rowsToLinkify.start ? (this._rowsToLinkify.start = a, 
                    this._rowsToLinkify.end = g) : (this._rowsToLinkify.start = Math.min(this._rowsToLinkify.start, a), 
                    this._rowsToLinkify.end = Math.max(this._rowsToLinkify.end, g)), this._mouseZoneManager.clearAll(a, g), 
                    this._rowsTimeoutId && clearTimeout(this._rowsTimeoutId), this._rowsTimeoutId = setTimeout(function() {
                        return c._linkifyRows();
                    }, e.TIME_BEFORE_LINKIFY));
                };
                e.prototype._linkifyRows = function() {
                    this._rowsTimeoutId = null;
                    for (var a = this._rowsToLinkify.start; a <= this._rowsToLinkify.end; a++) this._linkifyRow(a);
                    this._rowsToLinkify.start = null;
                    this._rowsToLinkify.end = null;
                };
                e.prototype.setHypertextLinkHandler = function(a) {
                    this._linkMatchers[0].handler = a;
                };
                e.prototype.setHypertextValidationCallback = function(a) {
                    this._linkMatchers[0].validationCallback = a;
                };
                e.prototype.registerLinkMatcher = function(a, e, g) {
                    void 0 === g && (g = {});
                    if (0 !== this._nextLinkMatcherId && !e) throw Error("handler must be defined");
                    a = {
                        id: this._nextLinkMatcherId++,
                        regex: a,
                        handler: e,
                        matchIndex: g.matchIndex,
                        validationCallback: g.validationCallback,
                        hoverTooltipCallback: g.tooltipCallback,
                        hoverLeaveCallback: g.leaveCallback,
                        willLinkActivate: g.willLinkActivate,
                        priority: g.priority || 0
                    };
                    this._addLinkMatcherToList(a);
                    return a.id;
                };
                e.prototype._addLinkMatcherToList = function(a) {
                    if (0 === this._linkMatchers.length) this._linkMatchers.push(a); else {
                        for (var c = this._linkMatchers.length - 1; 0 <= c; c--) if (a.priority <= this._linkMatchers[c].priority) {
                            this._linkMatchers.splice(c + 1, 0, a);
                            return;
                        }
                        this._linkMatchers.splice(0, 0, a);
                    }
                };
                e.prototype.deregisterLinkMatcher = function(a) {
                    for (var c = 1; c < this._linkMatchers.length; c++) if (this._linkMatchers[c].id === a) return this._linkMatchers.splice(c, 1), 
                    !0;
                    return !1;
                };
                e.prototype._linkifyRow = function(a) {
                    var c = this._terminal.buffer.ydisp + a;
                    if (!(c >= this._terminal.buffer.lines.length)) {
                        c = this._terminal.buffer.translateBufferLineToString(c, !1);
                        for (var e = 0; e < this._linkMatchers.length; e++) this._doLinkifyRow(a, c, this._linkMatchers[e]);
                    }
                };
                e.prototype._doLinkifyRow = function(a, e, g, k) {
                    var c = this;
                    void 0 === k && (k = 0);
                    var d = e.match(g.regex);
                    if (d && 0 !== d.length) {
                        var l = d["number" !== typeof g.matchIndex ? 0 : g.matchIndex], f = e.indexOf(l);
                        g.validationCallback ? g.validationCallback(l, function(e) {
                            c._rowsTimeoutId || e && c._addLink(k + f, a, l, g);
                        }) : this._addLink(k + f, a, l, g);
                        d = f + l.length;
                        e = e.substr(d);
                        0 < e.length && this._doLinkifyRow(a, e, g, k + d);
                    }
                };
                e.prototype._addLink = function(a, e, g, k) {
                    var c = this;
                    this._mouseZoneManager.add(new l.MouseZone(a + 1, a + 1 + g.length, e + 1, function(a) {
                        if (k.handler) return k.handler(a, g);
                        window.open(g, "_blank");
                    }, function(k) {
                        c.emit(m.LinkHoverEventTypes.HOVER, {
                            x: a,
                            y: e,
                            length: g.length
                        });
                        c._terminal.element.style.cursor = "pointer";
                    }, function(d) {
                        c.emit(m.LinkHoverEventTypes.TOOLTIP, {
                            x: a,
                            y: e,
                            length: g.length
                        });
                        k.hoverTooltipCallback && k.hoverTooltipCallback(d, g);
                    }, function() {
                        c.emit(m.LinkHoverEventTypes.LEAVE, {
                            x: a,
                            y: e,
                            length: g.length
                        });
                        c._terminal.element.style.cursor = "";
                        k.hoverLeaveCallback && k.hoverLeaveCallback();
                    }, function(a) {
                        return k.willLinkActivate ? k.willLinkActivate(a, g) : !0;
                    }));
                };
                e.TIME_BEFORE_LINKIFY = 200;
                return e;
            }(a("./EventEmitter").EventEmitter);
            d.Linkifier = a;
        }, {
            "./EventEmitter": 7,
            "./Types": 14,
            "./input/MouseZoneManager": 18
        } ],
        10: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var f = a("./EscapeSequences"), m = a("./Charsets"), l = {};
            l[f.C0.BEL] = function(a, c) {
                return c.bell();
            };
            l[f.C0.LF] = function(a, c) {
                return c.lineFeed();
            };
            l[f.C0.VT] = l[f.C0.LF];
            l[f.C0.FF] = l[f.C0.LF];
            l[f.C0.CR] = function(a, c) {
                return c.carriageReturn();
            };
            l[f.C0.BS] = function(a, c) {
                return c.backspace();
            };
            l[f.C0.HT] = function(a, c) {
                return c.tab();
            };
            l[f.C0.SO] = function(a, c) {
                return c.shiftOut();
            };
            l[f.C0.SI] = function(a, c) {
                return c.shiftIn();
            };
            l[f.C0.ESC] = function(a, e) {
                return a.setState(c.ESCAPED);
            };
            var k = {
                "[": function(a, e) {
                    e.params = [];
                    e.currentParam = 0;
                    a.setState(c.CSI_PARAM);
                },
                "]": function(a, e) {
                    e.params = [];
                    e.currentParam = 0;
                    a.setState(c.OSC);
                },
                P: function(a, e) {
                    e.params = [];
                    e.currentParam = 0;
                    a.setState(c.DCS);
                },
                _: function(a, e) {
                    a.setState(c.IGNORE);
                },
                "^": function(a, e) {
                    a.setState(c.IGNORE);
                },
                c: function(a, c) {
                    c.reset();
                },
                E: function(a, e) {
                    e.buffer.x = 0;
                    e.index();
                    a.setState(c.NORMAL);
                },
                D: function(a, e) {
                    e.index();
                    a.setState(c.NORMAL);
                },
                M: function(a, e) {
                    e.reverseIndex();
                    a.setState(c.NORMAL);
                },
                "%": function(a, e) {
                    e.setgLevel(0);
                    e.setgCharset(0, m.DEFAULT_CHARSET);
                    a.setState(c.NORMAL);
                    a.skipNextChar();
                }
            };
            k[f.C0.CAN] = function(a) {
                return a.setState(c.NORMAL);
            };
            var e = {
                "?": function(a) {
                    return a.setPrefix("?");
                },
                ">": function(a) {
                    return a.setPrefix(">");
                },
                "!": function(a) {
                    return a.setPrefix("!");
                },
                0: function(a) {
                    return a.setParam(10 * a.getParam());
                },
                1: function(a) {
                    return a.setParam(10 * a.getParam() + 1);
                },
                2: function(a) {
                    return a.setParam(10 * a.getParam() + 2);
                },
                3: function(a) {
                    return a.setParam(10 * a.getParam() + 3);
                },
                4: function(a) {
                    return a.setParam(10 * a.getParam() + 4);
                },
                5: function(a) {
                    return a.setParam(10 * a.getParam() + 5);
                },
                6: function(a) {
                    return a.setParam(10 * a.getParam() + 6);
                },
                7: function(a) {
                    return a.setParam(10 * a.getParam() + 7);
                },
                8: function(a) {
                    return a.setParam(10 * a.getParam() + 8);
                },
                9: function(a) {
                    return a.setParam(10 * a.getParam() + 9);
                },
                $: function(a) {
                    return a.setPostfix("$");
                },
                '"': function(a) {
                    return a.setPostfix('"');
                },
                " ": function(a) {
                    return a.setPostfix(" ");
                },
                "'": function(a) {
                    return a.setPostfix("'");
                },
                ";": function(a) {
                    return a.finalizeParam();
                }
            };
            e[f.C0.CAN] = function(a) {
                return a.setState(c.NORMAL);
            };
            var g = {
                "@": function(a, c, e) {
                    return a.insertChars(c);
                },
                A: function(a, c, e) {
                    return a.cursorUp(c);
                },
                B: function(a, c, e) {
                    return a.cursorDown(c);
                },
                C: function(a, c, e) {
                    return a.cursorForward(c);
                },
                D: function(a, c, e) {
                    return a.cursorBackward(c);
                },
                E: function(a, c, e) {
                    return a.cursorNextLine(c);
                },
                F: function(a, c, e) {
                    return a.cursorPrecedingLine(c);
                },
                G: function(a, c, e) {
                    return a.cursorCharAbsolute(c);
                },
                H: function(a, c, e) {
                    return a.cursorPosition(c);
                },
                I: function(a, c, e) {
                    return a.cursorForwardTab(c);
                },
                J: function(a, c, e) {
                    return a.eraseInDisplay(c);
                },
                K: function(a, c, e) {
                    return a.eraseInLine(c);
                },
                L: function(a, c, e) {
                    return a.insertLines(c);
                },
                M: function(a, c, e) {
                    return a.deleteLines(c);
                },
                P: function(a, c, e) {
                    return a.deleteChars(c);
                },
                S: function(a, c, e) {
                    return a.scrollUp(c);
                },
                T: function(a, c, e) {
                    2 > c.length && !e && a.scrollDown(c);
                },
                X: function(a, c, e) {
                    return a.eraseChars(c);
                },
                Z: function(a, c, e) {
                    return a.cursorBackwardTab(c);
                },
                "`": function(a, c, e) {
                    return a.charPosAbsolute(c);
                },
                a: function(a, c, e) {
                    return a.HPositionRelative(c);
                },
                b: function(a, c, e) {
                    return a.repeatPrecedingCharacter(c);
                },
                c: function(a, c, e) {
                    return a.sendDeviceAttributes(c);
                },
                d: function(a, c, e) {
                    return a.linePosAbsolute(c);
                },
                e: function(a, c, e) {
                    return a.VPositionRelative(c);
                },
                f: function(a, c, e) {
                    return a.HVPosition(c);
                },
                g: function(a, c, e) {
                    return a.tabClear(c);
                },
                h: function(a, c, e) {
                    return a.setMode(c);
                },
                l: function(a, c, e) {
                    return a.resetMode(c);
                },
                m: function(a, c, e) {
                    return a.charAttributes(c);
                },
                n: function(a, c, e) {
                    return a.deviceStatus(c);
                },
                p: function(a, c, e) {
                    switch (e) {
                      case "!":
                        a.softReset(c);
                    }
                },
                q: function(a, c, e, g) {
                    " " === g && a.setCursorStyle(c);
                },
                r: function(a, c) {
                    return a.setScrollRegion(c);
                },
                s: function(a, c) {
                    return a.saveCursor(c);
                },
                u: function(a, c) {
                    return a.restoreCursor(c);
                }
            };
            g[f.C0.CAN] = function(a, e, g, k, d) {
                return d.setState(c.NORMAL);
            };
            var c;
            (function(a) {
                a[a.NORMAL = 0] = "NORMAL";
                a[a.ESCAPED = 1] = "ESCAPED";
                a[a.CSI_PARAM = 2] = "CSI_PARAM";
                a[a.CSI = 3] = "CSI";
                a[a.OSC = 4] = "OSC";
                a[a.CHARSET = 5] = "CHARSET";
                a[a.DCS = 6] = "DCS";
                a[a.IGNORE = 7] = "IGNORE";
            })(c = d.ParserState || (d.ParserState = {}));
            a = function() {
                function a(a, e) {
                    this._inputHandler = a;
                    this._terminal = e;
                    this._state = c.NORMAL;
                }
                a.prototype.parse = function(a) {
                    var d = a.length, h = this._terminal.buffer.x, n = this._terminal.buffer.y;
                    this._terminal.debug && this._terminal.log("data: " + a);
                    this._position = 0;
                    this._terminal.surrogate_high && (a = this._terminal.surrogate_high + a, this._terminal.surrogate_high = "");
                    for (;this._position < d; this._position++) {
                        var p = a[this._position];
                        var v = a.charCodeAt(this._position);
                        if (55296 <= v && 56319 >= v) {
                            var C = a.charCodeAt(this._position + 1);
                            if (isNaN(C)) {
                                this._terminal.surrogate_high = p;
                                continue;
                            }
                            v = 1024 * (v - 55296) + (C - 56320) + 65536;
                            p += a.charAt(this._position + 1);
                        }
                        if (!(56320 <= v && 57343 >= v)) switch (this._state) {
                          case c.NORMAL:
                            if (p in l) l[p](this, this._inputHandler); else this._inputHandler.addChar(p, v);
                            break;

                          case c.ESCAPED:
                            if (p in k) {
                                k[p](this, this._terminal);
                                break;
                            }
                            switch (p) {
                              case "(":
                              case ")":
                              case "*":
                              case "+":
                              case "-":
                              case ".":
                                switch (p) {
                                  case "(":
                                    this._terminal.gcharset = 0;
                                    break;

                                  case ")":
                                    this._terminal.gcharset = 1;
                                    break;

                                  case "*":
                                    this._terminal.gcharset = 2;
                                    break;

                                  case "+":
                                    this._terminal.gcharset = 3;
                                    break;

                                  case "-":
                                    this._terminal.gcharset = 1;
                                    break;

                                  case ".":
                                    this._terminal.gcharset = 2;
                                }
                                this._state = c.CHARSET;
                                break;

                              case "/":
                                this._terminal.gcharset = 3;
                                this._state = c.CHARSET;
                                this._position--;
                                break;

                              case "N":
                                this._state = c.NORMAL;
                                break;

                              case "O":
                                this._state = c.NORMAL;
                                break;

                              case "n":
                                this._terminal.setgLevel(2);
                                this._state = c.NORMAL;
                                break;

                              case "o":
                                this._terminal.setgLevel(3);
                                this._state = c.NORMAL;
                                break;

                              case "|":
                                this._terminal.setgLevel(3);
                                this._state = c.NORMAL;
                                break;

                              case "}":
                                this._terminal.setgLevel(2);
                                this._state = c.NORMAL;
                                break;

                              case "~":
                                this._terminal.setgLevel(1);
                                this._state = c.NORMAL;
                                break;

                              case "7":
                                this._inputHandler.saveCursor();
                                this._state = c.NORMAL;
                                break;

                              case "8":
                                this._inputHandler.restoreCursor();
                                this._state = c.NORMAL;
                                break;

                              case "#":
                                this._state = c.NORMAL;
                                this._position++;
                                break;

                              case "H":
                                this._terminal.tabSet();
                                this._state = c.NORMAL;
                                break;

                              case "=":
                                this._terminal.log("Serial port requested application keypad.");
                                this._terminal.applicationKeypad = !0;
                                this._terminal.viewport && this._terminal.viewport.syncScrollArea();
                                this._state = c.NORMAL;
                                break;

                              case ">":
                                this._terminal.log("Switching back to normal keypad.");
                                this._terminal.applicationKeypad = !1;
                                this._terminal.viewport && this._terminal.viewport.syncScrollArea();
                                this._state = c.NORMAL;
                                break;

                              default:
                                this._state = c.NORMAL, this._terminal.error("Unknown ESC control: %s.", p);
                            }
                            break;

                          case c.CHARSET:
                            p in m.CHARSETS ? (v = m.CHARSETS[p], "/" === p && this.skipNextChar()) : v = m.DEFAULT_CHARSET;
                            this._terminal.setgCharset(this._terminal.gcharset, v);
                            this._terminal.gcharset = null;
                            this._state = c.NORMAL;
                            break;

                          case c.OSC:
                            if (p === f.C0.ESC || p === f.C0.BEL) {
                                p === f.C0.ESC && this._position++;
                                this._terminal.params.push(this._terminal.currentParam);
                                switch (this._terminal.params[0]) {
                                  case 0:
                                  case 1:
                                  case 2:
                                    this._terminal.params[1] && (this._terminal.title = this._terminal.params[1], this._terminal.handleTitle(this._terminal.title));
                                }
                                this._terminal.params = [];
                                this._terminal.currentParam = 0;
                                this._state = c.NORMAL;
                            } else this._terminal.params.length ? this._terminal.currentParam += p : "0" <= p && "9" >= p ? this._terminal.currentParam = 10 * this._terminal.currentParam + p.charCodeAt(0) - 48 : ";" === p && (this._terminal.params.push(this._terminal.currentParam), 
                            this._terminal.currentParam = "");
                            break;

                          case c.CSI_PARAM:
                            if (p in e) {
                                e[p](this);
                                break;
                            }
                            this.finalizeParam();
                            this._state = c.CSI;

                          case c.CSI:
                            p in g ? (this._terminal.debug && this._terminal.log("CSI " + (this._terminal.prefix ? this._terminal.prefix : "") + " " + (this._terminal.params ? this._terminal.params.join(";") : "") + " " + (this._terminal.postfix ? this._terminal.postfix : "") + " " + p), 
                            g[p](this._inputHandler, this._terminal.params, this._terminal.prefix, this._terminal.postfix, this)) : this._terminal.error("Unknown CSI code: %s.", p);
                            this._state = c.NORMAL;
                            this._terminal.prefix = "";
                            this._terminal.postfix = "";
                            break;

                          case c.DCS:
                            if (p === f.C0.ESC || p === f.C0.BEL) {
                                p === f.C0.ESC && this._position++;
                                switch (this._terminal.prefix) {
                                  case "":
                                    break;

                                  case "$q":
                                    p = this._terminal.currentParam;
                                    v = !1;
                                    switch (p) {
                                      case '"q':
                                        p = '0"q';
                                        break;

                                      case '"p':
                                        p = '61"p';
                                        break;

                                      case "r":
                                        p = "" + (this._terminal.buffer.scrollTop + 1) + ";" + (this._terminal.buffer.scrollBottom + 1) + "r";
                                        break;

                                      case "m":
                                        p = "0m";
                                        break;

                                      default:
                                        this._terminal.error("Unknown DCS Pt: %s.", p), p = "";
                                    }
                                    this._terminal.send(f.C0.ESC + "P" + +v + "$r" + p + f.C0.ESC + "\\");
                                    break;

                                  case "+p":
                                    break;

                                  case "+q":
                                    p = this._terminal.currentParam;
                                    v = !1;
                                    this._terminal.send(f.C0.ESC + "P" + +v + "+r" + p + f.C0.ESC + "\\");
                                    break;

                                  default:
                                    this._terminal.error("Unknown DCS prefix: %s.", this._terminal.prefix);
                                }
                                this._terminal.currentParam = 0;
                                this._terminal.prefix = "";
                                this._state = c.NORMAL;
                            } else this._terminal.currentParam ? this._terminal.currentParam += p : this._terminal.prefix || "$" === p || "+" === p ? 2 === this._terminal.prefix.length ? this._terminal.currentParam = p : this._terminal.prefix += p : this._terminal.currentParam = p;
                            break;

                          case c.IGNORE:
                            if (p === f.C0.ESC || p === f.C0.BEL) p === f.C0.ESC && this._position++, this._state = c.NORMAL;
                        }
                    }
                    this._terminal.buffer.x === h && this._terminal.buffer.y === n || this._terminal.emit("cursormove");
                    return this._state;
                };
                a.prototype.setState = function(a) {
                    this._state = a;
                };
                a.prototype.setPrefix = function(a) {
                    this._terminal.prefix = a;
                };
                a.prototype.setPostfix = function(a) {
                    this._terminal.postfix = a;
                };
                a.prototype.setParam = function(a) {
                    this._terminal.currentParam = a;
                };
                a.prototype.getParam = function() {
                    return this._terminal.currentParam;
                };
                a.prototype.finalizeParam = function() {
                    this._terminal.params.push(this._terminal.currentParam);
                    this._terminal.currentParam = 0;
                };
                a.prototype.skipNextChar = function() {
                    this._position++;
                };
                return a;
            }();
            d.Parser = a;
        }, {
            "./Charsets": 4,
            "./EscapeSequences": 6
        } ],
        11: [ function(a, h, d) {
            var f = this && this.__extends || function() {
                var a = Object.setPrototypeOf || {
                    __proto__: []
                } instanceof Array && function(a, c) {
                    a.__proto__ = c;
                } || function(a, c) {
                    for (var e in c) c.hasOwnProperty(e) && (a[e] = c[e]);
                };
                return function(c, e) {
                    function g() {
                        this.constructor = c;
                    }
                    a(c, e);
                    c.prototype = null === e ? Object.create(e) : (g.prototype = e.prototype, new g());
                };
            }();
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var m = a("./utils/MouseHelper"), l = a("./shared/utils/Browser");
            h = a("./EventEmitter");
            var k = a("./SelectionModel"), e = a("./Buffer"), g = a("./handlers/AltClickHandler");
            a = String.fromCharCode(160);
            var c = new RegExp(a, "g"), n;
            (function(a) {
                a[a.NORMAL = 0] = "NORMAL";
                a[a.WORD = 1] = "WORD";
                a[a.LINE = 2] = "LINE";
            })(n || (n = {}));
            a = function(a) {
                function d(c, e) {
                    var g = a.call(this) || this;
                    g._terminal = c;
                    g._charMeasure = e;
                    g._enabled = !0;
                    g._initListeners();
                    g.enable();
                    g._model = new k.SelectionModel(c);
                    g._activeSelectionMode = n.NORMAL;
                    return g;
                }
                f(d, a);
                Object.defineProperty(d.prototype, "_buffer", {
                    get: function() {
                        return this._terminal.buffers.active;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                d.prototype._initListeners = function() {
                    var a = this;
                    this._mouseMoveListener = function(c) {
                        return a._onMouseMove(c);
                    };
                    this._mouseUpListener = function(c) {
                        return a._onMouseUp(c);
                    };
                    this._trimListener = function(c) {
                        return a._onTrim(c);
                    };
                    this.initBuffersListeners();
                };
                d.prototype.initBuffersListeners = function() {
                    var a = this;
                    this._terminal.buffer.lines.on("trim", this._trimListener);
                    this._terminal.buffers.on("activate", function(c) {
                        return a._onBufferActivate(c);
                    });
                };
                d.prototype.disable = function() {
                    this.clearSelection();
                    this._enabled = !1;
                };
                d.prototype.enable = function() {
                    this._enabled = !0;
                };
                Object.defineProperty(d.prototype, "selectionStart", {
                    get: function() {
                        return this._model.finalSelectionStart;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                Object.defineProperty(d.prototype, "selectionEnd", {
                    get: function() {
                        return this._model.finalSelectionEnd;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                Object.defineProperty(d.prototype, "hasSelection", {
                    get: function() {
                        var a = this._model.finalSelectionStart, c = this._model.finalSelectionEnd;
                        return a && c ? a[0] !== c[0] || a[1] !== c[1] : !1;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                Object.defineProperty(d.prototype, "selectionText", {
                    get: function() {
                        var a = this._model.finalSelectionStart, e = this._model.finalSelectionEnd;
                        if (!a || !e) return "";
                        var g = [];
                        g.push(this._buffer.translateBufferLineToString(a[1], !0, a[0], a[1] === e[1] ? e[0] : null));
                        for (var d = a[1] + 1; d <= e[1] - 1; d++) {
                            var k = this._buffer.lines.get(d), f = this._buffer.translateBufferLineToString(d, !0);
                            k.isWrapped ? g[g.length - 1] += f : g.push(f);
                        }
                        a[1] !== e[1] && (k = this._buffer.lines.get(e[1]), f = this._buffer.translateBufferLineToString(e[1], !0, 0, e[0]), 
                        k.isWrapped ? g[g.length - 1] += f : g.push(f));
                        return g.map(function(a) {
                            return a.replace(c, " ");
                        }).join(l.isMSWindows ? "\r\n" : "\n");
                    },
                    enumerable: !0,
                    configurable: !0
                });
                d.prototype.clearSelection = function() {
                    this._model.clearSelection();
                    this._removeMouseDownListeners();
                    this.refresh();
                };
                d.prototype.refresh = function(a) {
                    var c = this;
                    this._refreshAnimationFrame || (this._refreshAnimationFrame = window.requestAnimationFrame(function() {
                        return c._refresh();
                    }));
                    l.isLinux && a && this.selectionText.length && this.emit("newselection", this.selectionText);
                };
                d.prototype._refresh = function() {
                    this._refreshAnimationFrame = null;
                    this.emit("refresh", {
                        start: this._model.finalSelectionStart,
                        end: this._model.finalSelectionEnd
                    });
                };
                d.prototype.isClickInSelection = function(a) {
                    a = this._getMouseBufferCoords(a);
                    var c = this._model.finalSelectionStart, e = this._model.finalSelectionEnd;
                    return c && e ? a[1] > c[1] && a[1] < e[1] || c[1] === e[1] && a[1] === c[1] && a[0] > c[0] && a[0] < e[0] || c[1] < e[1] && a[1] === e[1] && a[0] < e[0] : !1;
                };
                d.prototype.selectWordAtCursor = function(a) {
                    if (a = this._getMouseBufferCoords(a)) this._selectWordAt(a, !1), this._model.selectionEnd = null, 
                    this.refresh(!0);
                };
                d.prototype.selectAll = function() {
                    this._model.isSelectAllActive = !0;
                    this.refresh();
                    this._terminal.emit("selection");
                };
                d.prototype._onTrim = function(a) {
                    this._model.onTrim(a) && this.refresh();
                };
                d.prototype._getMouseBufferCoords = function(a) {
                    a = this._terminal.mouseHelper.getCoords(a, this._terminal.screenElement, this._charMeasure, this._terminal.options.lineHeight, this._terminal.cols, this._terminal.rows, !0);
                    if (!a) return null;
                    a[0]--;
                    a[1]--;
                    a[1] += this._terminal.buffer.ydisp;
                    return a;
                };
                d.prototype._getMouseEventScrollAmount = function(a) {
                    a = m.MouseHelper.getCoordsRelativeToElement(a, this._terminal.screenElement)[1];
                    var c = this._terminal.rows * Math.ceil(this._charMeasure.height * this._terminal.options.lineHeight);
                    if (0 <= a && a <= c) return 0;
                    a > c && (a -= c);
                    a = Math.min(Math.max(a, -50), 50);
                    a /= 50;
                    return a / Math.abs(a) + Math.round(14 * a);
                };
                d.prototype.shouldForceSelection = function(a) {
                    return l.isMac ? a.altKey : a.shiftKey;
                };
                d.prototype.onMouseDown = function(a) {
                    this._mouseDownTimeStamp = a.timeStamp;
                    if ((2 !== a.button || !this.hasSelection) && 0 === a.button) {
                        if (!this._enabled) {
                            if (!this.shouldForceSelection(a)) return;
                            a.stopPropagation();
                        }
                        a.preventDefault();
                        this._dragScrollAmount = 0;
                        this._enabled && a.shiftKey ? this._onIncrementalClick(a) : 1 === a.detail ? this._onSingleClick(a) : 2 === a.detail ? this._onDoubleClick(a) : 3 === a.detail && this._onTripleClick(a);
                        this._addMouseDownListeners();
                        this.refresh(!0);
                    }
                };
                d.prototype._addMouseDownListeners = function() {
                    var a = this;
                    this._terminal.element.ownerDocument.addEventListener("mousemove", this._mouseMoveListener);
                    this._terminal.element.ownerDocument.addEventListener("mouseup", this._mouseUpListener);
                    this._dragScrollIntervalTimer = setInterval(function() {
                        return a._dragScroll();
                    }, 50);
                };
                d.prototype._removeMouseDownListeners = function() {
                    this._terminal.element.ownerDocument.removeEventListener("mousemove", this._mouseMoveListener);
                    this._terminal.element.ownerDocument.removeEventListener("mouseup", this._mouseUpListener);
                    clearInterval(this._dragScrollIntervalTimer);
                    this._dragScrollIntervalTimer = null;
                };
                d.prototype._onIncrementalClick = function(a) {
                    this._model.selectionStart && (this._model.selectionEnd = this._getMouseBufferCoords(a));
                };
                d.prototype._onSingleClick = function(a) {
                    this._model.selectionStartLength = 0;
                    this._model.isSelectAllActive = !1;
                    this._activeSelectionMode = n.NORMAL;
                    this._model.selectionStart = this._getMouseBufferCoords(a);
                    this._model.selectionStart && (this._model.selectionEnd = null, (a = this._buffer.lines.get(this._model.selectionStart[1])) && (a.length >= this._model.selectionStart[0] || 0 === a[this._model.selectionStart[0]][e.CHAR_DATA_WIDTH_INDEX] && this._model.selectionStart[0]++));
                };
                d.prototype._onDoubleClick = function(a) {
                    if (a = this._getMouseBufferCoords(a)) this._activeSelectionMode = n.WORD, this._selectWordAt(a, !0);
                };
                d.prototype._onTripleClick = function(a) {
                    if (a = this._getMouseBufferCoords(a)) this._activeSelectionMode = n.LINE, this._selectLineAt(a[1]);
                };
                d.prototype._onMouseMove = function(a) {
                    a.stopImmediatePropagation();
                    var c = this._model.selectionEnd ? [ this._model.selectionEnd[0], this._model.selectionEnd[1] ] : null;
                    this._model.selectionEnd = this._getMouseBufferCoords(a);
                    this._model.selectionEnd ? (this._activeSelectionMode === n.LINE ? this._model.selectionEnd[0] = this._model.selectionEnd[1] < this._model.selectionStart[1] ? 0 : this._terminal.cols : this._activeSelectionMode === n.WORD && this._selectToWordAt(this._model.selectionEnd), 
                    this._dragScrollAmount = this._getMouseEventScrollAmount(a), 0 < this._dragScrollAmount ? this._model.selectionEnd[0] = this._terminal.cols : 0 > this._dragScrollAmount && (this._model.selectionEnd[0] = 0), 
                    this._model.selectionEnd[1] < this._buffer.lines.length && (a = this._buffer.lines.get(this._model.selectionEnd[1])[this._model.selectionEnd[0]]) && 0 === a[e.CHAR_DATA_WIDTH_INDEX] && this._model.selectionEnd[0]++, 
                    c && c[0] === this._model.selectionEnd[0] && c[1] === this._model.selectionEnd[1] || this.refresh(!0)) : this.refresh(!0);
                };
                d.prototype._dragScroll = function() {
                    this._dragScrollAmount && (this._terminal.scrollLines(this._dragScrollAmount, !1), 
                    this._model.selectionEnd = 0 < this._dragScrollAmount ? [ this._terminal.cols - 1, Math.min(this._terminal.buffer.ydisp + this._terminal.rows, this._terminal.buffer.lines.length - 1) ] : [ 0, this._terminal.buffer.ydisp ], 
                    this.refresh());
                };
                d.prototype._onMouseUp = function(a) {
                    var c = a.timeStamp - this._mouseDownTimeStamp;
                    this._removeMouseDownListeners();
                    1 >= this.selectionText.length && 500 > c ? new g.AltClickHandler(a, this._terminal).move() : this.hasSelection && this._terminal.emit("selection");
                };
                d.prototype._onBufferActivate = function(a) {
                    this.clearSelection();
                    a.inactiveBuffer.lines.off("trim", this._trimListener);
                    a.activeBuffer.lines.on("trim", this._trimListener);
                };
                d.prototype._convertViewportColToCharacterIndex = function(a, c) {
                    for (var g = c[0], d = 0; c[0] >= d; d++) {
                        var k = a[d];
                        0 === k[e.CHAR_DATA_WIDTH_INDEX] ? g-- : 1 < k[e.CHAR_DATA_CHAR_INDEX].length && c[0] !== d && (g += k[e.CHAR_DATA_CHAR_INDEX].length - 1);
                    }
                    return g;
                };
                d.prototype.setSelection = function(a, c, e) {
                    this._model.clearSelection();
                    this._removeMouseDownListeners();
                    this._model.selectionStart = [ a, c ];
                    this._model.selectionStartLength = e;
                    this.refresh();
                };
                d.prototype._getWordAt = function(a, c) {
                    var g = this._buffer.lines.get(a[1]);
                    if (!g) return null;
                    var d = this._buffer.translateBufferLineToString(a[1], !1), k = this._convertViewportColToCharacterIndex(g, a), l = k, f = a[0] - k, m = 0, h = 0, n = 0, p = 0;
                    if (" " === d.charAt(k)) {
                        for (;0 < k && " " === d.charAt(k - 1); ) k--;
                        for (;l < d.length && " " === d.charAt(l + 1); ) l++;
                    } else {
                        var q = a[0];
                        a = a[0];
                        0 === g[q][e.CHAR_DATA_WIDTH_INDEX] && (m++, q--);
                        2 === g[a][e.CHAR_DATA_WIDTH_INDEX] && (h++, a++);
                        1 < g[a][e.CHAR_DATA_CHAR_INDEX].length && (p += g[a][e.CHAR_DATA_CHAR_INDEX].length - 1, 
                        l += g[a][e.CHAR_DATA_CHAR_INDEX].length - 1);
                        for (;0 < q && 0 < k && !this._isCharWordSeparator(g[q - 1]); ) {
                            var r = g[q - 1];
                            0 === r[e.CHAR_DATA_WIDTH_INDEX] ? (m++, q--) : 1 < r[e.CHAR_DATA_CHAR_INDEX].length && (n += r[e.CHAR_DATA_CHAR_INDEX].length - 1, 
                            k -= r[e.CHAR_DATA_CHAR_INDEX].length - 1);
                            k--;
                            q--;
                        }
                        for (;a < g.length && l + 1 < d.length && !this._isCharWordSeparator(g[a + 1]); ) r = g[a + 1], 
                        2 === r[e.CHAR_DATA_WIDTH_INDEX] ? (h++, a++) : 1 < r[e.CHAR_DATA_CHAR_INDEX].length && (p += r[e.CHAR_DATA_CHAR_INDEX].length - 1, 
                        l += r[e.CHAR_DATA_CHAR_INDEX].length - 1), l++, a++;
                    }
                    l++;
                    g = k + f - m + n;
                    m = Math.min(this._terminal.cols, l - k + m + h - n - p);
                    return c || "" !== d.slice(k, l).trim() ? {
                        start: g,
                        length: m
                    } : null;
                };
                d.prototype._selectWordAt = function(a, c) {
                    if (c = this._getWordAt(a, c)) this._model.selectionStart = [ c.start, a[1] ], this._model.selectionStartLength = c.length;
                };
                d.prototype._selectToWordAt = function(a) {
                    var c = this._getWordAt(a, !0);
                    c && (this._model.selectionEnd = [ this._model.areSelectionValuesReversed() ? c.start : c.start + c.length, a[1] ]);
                };
                d.prototype._isCharWordSeparator = function(a) {
                    return 0 === a[e.CHAR_DATA_WIDTH_INDEX] ? !1 : 0 <= " ()[]{}'\"".indexOf(a[e.CHAR_DATA_CHAR_INDEX]);
                };
                d.prototype._selectLineAt = function(a) {
                    this._model.selectionStart = [ 0, a ];
                    this._model.selectionStartLength = this._terminal.cols;
                };
                return d;
            }(h.EventEmitter);
            d.SelectionManager = a;
        }, {
            "./Buffer": 1,
            "./EventEmitter": 7,
            "./SelectionModel": 12,
            "./handlers/AltClickHandler": 16,
            "./shared/utils/Browser": 30,
            "./utils/MouseHelper": 33
        } ],
        12: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = function() {
                function a(a) {
                    this._terminal = a;
                    this.clearSelection();
                }
                a.prototype.clearSelection = function() {
                    this.selectionEnd = this.selectionStart = null;
                    this.isSelectAllActive = !1;
                    this.selectionStartLength = 0;
                };
                Object.defineProperty(a.prototype, "finalSelectionStart", {
                    get: function() {
                        return this.isSelectAllActive ? [ 0, 0 ] : this.selectionEnd && this.selectionStart ? this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart : this.selectionStart;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                Object.defineProperty(a.prototype, "finalSelectionEnd", {
                    get: function() {
                        return this.isSelectAllActive ? [ this._terminal.cols, this._terminal.buffer.ybase + this._terminal.rows - 1 ] : this.selectionStart ? !this.selectionEnd || this.areSelectionValuesReversed() ? [ this.selectionStart[0] + this.selectionStartLength, this.selectionStart[1] ] : this.selectionStartLength && this.selectionEnd[1] === this.selectionStart[1] ? [ Math.max(this.selectionStart[0] + this.selectionStartLength, this.selectionEnd[0]), this.selectionEnd[1] ] : this.selectionEnd : null;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                a.prototype.areSelectionValuesReversed = function() {
                    var a = this.selectionStart, d = this.selectionEnd;
                    return a && d ? a[1] > d[1] || a[1] === d[1] && a[0] > d[0] : !1;
                };
                a.prototype.onTrim = function(a) {
                    this.selectionStart && (this.selectionStart[1] -= a);
                    this.selectionEnd && (this.selectionEnd[1] -= a);
                    if (this.selectionEnd && 0 > this.selectionEnd[1]) return this.clearSelection(), 
                    !0;
                    this.selectionStart && 0 > this.selectionStart[1] && (this.selectionStart[1] = 0);
                    return !1;
                };
                return a;
            }();
            d.SelectionModel = a;
        }, {} ],
        13: [ function(a, h, d) {
            var f = this && this.__extends || function() {
                var a = Object.setPrototypeOf || {
                    __proto__: []
                } instanceof Array && function(a, c) {
                    a.__proto__ = c;
                } || function(a, c) {
                    for (var e in c) c.hasOwnProperty(e) && (a[e] = c[e]);
                };
                return function(c, e) {
                    function g() {
                        this.constructor = c;
                    }
                    a(c, e);
                    c.prototype = null === e ? Object.create(e) : (g.prototype = e.prototype, new g());
                };
            }();
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var m = a("./BufferSet"), l = a("./Buffer"), k = a("./CompositionHelper");
            h = a("./EventEmitter");
            var e = a("./Viewport"), g = a("./handlers/Clipboard"), c = a("./EscapeSequences"), n = a("./InputHandler"), p = a("./Parser"), q = a("./renderer/Renderer"), r = a("./Linkifier"), t = a("./SelectionManager"), y = a("./utils/CharMeasure"), v = a("./shared/utils/Browser"), C = a("./utils/MouseHelper"), z = a("./utils/Sounds"), x = a("./renderer/ColorManager"), B = a("./input/MouseZoneManager"), u = "undefined" !== typeof window ? window.document : null, A = {
                cols: 80,
                rows: 24,
                convertEol: !1,
                termName: "xterm",
                cursorBlink: !1,
                cursorStyle: "block",
                bellSound: z.BELL_SOUND,
                bellStyle: "none",
                enableBold: !0,
                fontFamily: "courier-new, courier, monospace",
                fontSize: 15,
                fontWeight: "normal",
                fontWeightBold: "bold",
                lineHeight: 1,
                letterSpacing: 0,
                scrollback: 1e3,
                screenKeys: !1,
                debug: !1,
                macOptionIsMeta: !1,
                cancelEvents: !1,
                disableStdin: !1,
                useFlowControl: !1,
                allowTransparency: !1,
                tabStopWidth: 8,
                theme: null,
                rightClickSelectsWord: v.isMac
            };
            a = function(a) {
                function d(c) {
                    void 0 === c && (c = {});
                    var e = a.call(this) || this;
                    e.browser = v;
                    e.options = c;
                    e.setup();
                    return e;
                }
                f(d, a);
                d.prototype.setup = function() {
                    var a = this;
                    Object.keys(A).forEach(function(c) {
                        null == a.options[c] && (a.options[c] = A[c]);
                        a[c] = a.options[c];
                    });
                    this.parent = u ? u.body : null;
                    this.cols = this.options.cols;
                    this.rows = this.options.rows;
                    if (this.options.handler) this.on("data", this.options.handler);
                    this.cursorState = 0;
                    this.cursorHidden = !1;
                    this.sendDataQueue = "";
                    this.customKeyEventHandler = null;
                    this.insertMode = this.originMode = this.applicationCursor = this.applicationKeypad = !1;
                    this.wraparoundMode = !0;
                    this.bracketedPasteMode = !1;
                    this.gcharset = this.charset = null;
                    this.glevel = 0;
                    this.charsets = [ null ];
                    this.writable = this.readable = !0;
                    this.curAttr = this.defAttr = 131840;
                    this.params = [];
                    this.currentParam = 0;
                    this.postfix = this.prefix = "";
                    this.writeBuffer = [];
                    this.writeStopped = this.xoffSentToCatchUp = this.writeInProgress = !1;
                    this.surrogateHigh = "";
                    this.userScrolling = !1;
                    this.inputHandler = new n.InputHandler(this);
                    this.parser = new p.Parser(this.inputHandler, this);
                    this.renderer = this.renderer || null;
                    this.selectionManager = this.selectionManager || null;
                    this.linkifier = this.linkifier || new r.Linkifier(this);
                    this._mouseZoneManager = this._mouseZoneManager || null;
                    this.buffers = new m.BufferSet(this);
                    this.selectionManager && (this.selectionManager.clearSelection(), this.selectionManager.initBuffersListeners());
                };
                Object.defineProperty(d.prototype, "buffer", {
                    get: function() {
                        return this.buffers.active;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                d.prototype.eraseAttr = function() {
                    return this.defAttr & -512 | this.curAttr & 511;
                };
                d.prototype.focus = function() {
                    this.textarea && this.textarea.focus();
                };
                Object.defineProperty(d.prototype, "isFocused", {
                    get: function() {
                        return u.activeElement === this.textarea;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                d.prototype.getOption = function(a) {
                    if (!(a in A)) throw Error('No option with key "' + a + '"');
                    return "undefined" !== typeof this.options[a] ? this.options[a] : this[a];
                };
                d.prototype.setOption = function(a, c) {
                    if (!(a in A)) throw Error('No option with key "' + a + '"');
                    switch (a) {
                      case "bellStyle":
                        c || (c = "none");
                        break;

                      case "cursorStyle":
                        c || (c = "block");
                        break;

                      case "fontWeight":
                        c || (c = "normal");
                        break;

                      case "fontWeightBold":
                        c || (c = "bold");
                        break;

                      case "lineHeight":
                        if (1 > c) {
                            console.warn(a + " cannot be less than 1, value: " + c);
                            return;
                        }

                      case "tabStopWidth":
                        if (1 > c) {
                            console.warn(a + " cannot be less than 1, value: " + c);
                            return;
                        }
                        break;

                      case "theme":
                        if (this.renderer) {
                            this._setTheme(c);
                            return;
                        }
                        break;

                      case "scrollback":
                        c = Math.min(c, l.MAX_BUFFER_SIZE);
                        if (0 > c) {
                            console.warn(a + " cannot be less than 0, value: " + c);
                            return;
                        }
                        if (this.options[a] !== c) {
                            var e = this.rows + c;
                            if (this.buffer.lines.length > e) {
                                e = this.buffer.lines.length - e;
                                var d = 0 > this.buffer.ydisp - e;
                                this.buffer.lines.trimStart(e);
                                this.buffer.ybase = Math.max(this.buffer.ybase - e, 0);
                                this.buffer.ydisp = Math.max(this.buffer.ydisp - e, 0);
                                d && this.refresh(0, this.rows - 1);
                            }
                        }
                    }
                    this[a] = c;
                    this.options[a] = c;
                    switch (a) {
                      case "fontFamily":
                      case "fontSize":
                        this.renderer.clear();
                        this.charMeasure.measure(this.options);
                        break;

                      case "enableBold":
                      case "letterSpacing":
                      case "lineHeight":
                      case "fontWeight":
                      case "fontWeightBold":
                        a = "fontWeight" === a || "fontWeightBold" === a || "enableBold" === a, this.renderer.clear(), 
                        this.renderer.onResize(this.cols, this.rows, a), this.refresh(0, this.rows - 1);

                      case "scrollback":
                        this.buffers.resize(this.cols, this.rows);
                        this.viewport.syncScrollArea();
                        break;

                      case "tabStopWidth":
                        this.buffers.setupTabStops();
                        break;

                      case "bellSound":
                      case "bellStyle":
                        this.syncBellSound();
                    }
                    if (this.renderer) this.renderer.onOptionsChanged();
                };
                d.prototype._onTextAreaFocus = function() {
                    this.sendFocus && this.send(c.C0.ESC + "[I");
                    this.element.classList.add("focus");
                    this.showCursor();
                    this.emit("focus");
                };
                d.prototype.blur = function() {
                    return this.textarea.blur();
                };
                d.prototype._onTextAreaBlur = function() {
                    this.refresh(this.buffer.y, this.buffer.y);
                    this.sendFocus && this.send(c.C0.ESC + "[O");
                    this.element.classList.remove("focus");
                    this.emit("blur");
                };
                d.prototype.initGlobal = function() {
                    var a = this;
                    this.bindKeys();
                    w(this.element, "copy", function(c) {
                        a.hasSelection() && g.copyHandler(c, a, a.selectionManager);
                    });
                    var c = function(c) {
                        return g.pasteHandler(c, a);
                    };
                    w(this.textarea, "paste", c);
                    w(this.element, "paste", c);
                    v.isFirefox ? w(this.element, "mousedown", function(c) {
                        2 === c.button && g.rightClickHandler(c, a.textarea, a.selectionManager, a.options.rightClickSelectsWord);
                    }) : w(this.element, "contextmenu", function(c) {
                        g.rightClickHandler(c, a.textarea, a.selectionManager, a.options.rightClickSelectsWord);
                    });
                    v.isLinux && w(this.element, "auxclick", function(c) {
                        1 === c.button && g.moveTextAreaUnderMouseCursor(c, a.textarea);
                    });
                };
                d.prototype.bindKeys = function() {
                    var a = this, c = this;
                    w(this.element, "keydown", function(a) {
                        u.activeElement === this && c._keyDown(a);
                    }, !0);
                    w(this.element, "keypress", function(a) {
                        u.activeElement === this && c._keyPress(a);
                    }, !0);
                    w(this.element, "keyup", function(c) {
                        16 !== c.keyCode && 17 !== c.keyCode && 18 !== c.keyCode && a.focus();
                    }, !0);
                    w(this.textarea, "keydown", function(c) {
                        a._keyDown(c);
                    }, !0);
                    w(this.textarea, "keypress", function(c) {
                        a._keyPress(c);
                        a.textarea.value = "";
                    }, !0);
                    w(this.textarea, "compositionstart", function() {
                        return a.compositionHelper.compositionstart();
                    });
                    w(this.textarea, "compositionupdate", function(c) {
                        return a.compositionHelper.compositionupdate(c);
                    });
                    w(this.textarea, "compositionend", function() {
                        return a.compositionHelper.compositionend();
                    });
                    this.on("refresh", function() {
                        return a.compositionHelper.updateCompositionElements();
                    });
                    this.on("refresh", function(c) {
                        return a.queueLinkification(c.start, c.end);
                    });
                };
                d.prototype.open = function(a) {
                    var c = this;
                    this.parent = a || this.parent;
                    if (!this.parent) throw Error("Terminal requires a parent element.");
                    this.context = this.parent.ownerDocument.defaultView;
                    this.document = this.parent.ownerDocument;
                    this.body = this.document.body;
                    this.element = this.document.createElement("div");
                    this.element.classList.add("terminal");
                    this.element.classList.add("xterm");
                    this.element.setAttribute("tabindex", "0");
                    this.parent.appendChild(this.element);
                    a = u.createDocumentFragment();
                    this.viewportElement = u.createElement("div");
                    this.viewportElement.classList.add("xterm-viewport");
                    a.appendChild(this.viewportElement);
                    this.viewportScrollArea = u.createElement("div");
                    this.viewportScrollArea.classList.add("xterm-scroll-area");
                    this.viewportElement.appendChild(this.viewportScrollArea);
                    this.screenElement = u.createElement("div");
                    this.screenElement.classList.add("xterm-screen");
                    this.helperContainer = u.createElement("div");
                    this.helperContainer.classList.add("xterm-helpers");
                    this.screenElement.appendChild(this.helperContainer);
                    a.appendChild(this.screenElement);
                    this._mouseZoneManager = new B.MouseZoneManager(this);
                    this.on("scroll", function() {
                        return c._mouseZoneManager.clearAll();
                    });
                    this.linkifier.attachToDom(this._mouseZoneManager);
                    this.textarea = u.createElement("textarea");
                    this.textarea.classList.add("xterm-helper-textarea");
                    this.textarea.setAttribute("autocorrect", "off");
                    this.textarea.setAttribute("autocapitalize", "off");
                    this.textarea.setAttribute("spellcheck", "false");
                    this.textarea.tabIndex = 0;
                    this.textarea.addEventListener("focus", function() {
                        return c._onTextAreaFocus();
                    });
                    this.textarea.addEventListener("blur", function() {
                        return c._onTextAreaBlur();
                    });
                    this.helperContainer.appendChild(this.textarea);
                    this.compositionView = u.createElement("div");
                    this.compositionView.classList.add("composition-view");
                    this.compositionHelper = new k.CompositionHelper(this.textarea, this.compositionView, this);
                    this.helperContainer.appendChild(this.compositionView);
                    this.charSizeStyleElement = u.createElement("style");
                    this.helperContainer.appendChild(this.charSizeStyleElement);
                    this.charMeasure = new y.CharMeasure(u, this.helperContainer);
                    this.syncBellSound();
                    this.element.appendChild(a);
                    this.renderer = new q.Renderer(this, this.options.theme);
                    this.options.theme = null;
                    this.viewport = new e.Viewport(this, this.viewportElement, this.viewportScrollArea, this.charMeasure);
                    this.viewport.onThemeChanged(this.renderer.colorManager.colors);
                    this.on("cursormove", function() {
                        return c.renderer.onCursorMove();
                    });
                    this.on("resize", function() {
                        return c.renderer.onResize(c.cols, c.rows, !1);
                    });
                    this.on("blur", function() {
                        return c.renderer.onBlur();
                    });
                    this.on("focus", function() {
                        return c.renderer.onFocus();
                    });
                    this.charMeasure.on("charsizechanged", function() {
                        return c.renderer.onResize(c.cols, c.rows, !0);
                    });
                    this.renderer.on("resize", function(a) {
                        return c.viewport.syncScrollArea();
                    });
                    this.selectionManager = new t.SelectionManager(this, this.charMeasure);
                    this.element.addEventListener("mousedown", function(a) {
                        return c.selectionManager.onMouseDown(a);
                    });
                    this.selectionManager.on("refresh", function(a) {
                        return c.renderer.onSelectionChanged(a.start, a.end);
                    });
                    this.selectionManager.on("newselection", function(a) {
                        c.textarea.value = a;
                        c.textarea.focus();
                        c.textarea.select();
                    });
                    this.on("scroll", function() {
                        c.viewport.syncScrollArea();
                        c.selectionManager.refresh();
                    });
                    this.viewportElement.addEventListener("scroll", function() {
                        return c.selectionManager.refresh();
                    });
                    this.mouseHelper = new C.MouseHelper(this.renderer);
                    this.charMeasure.measure(this.options);
                    this.refresh(0, this.rows - 1);
                    this.initGlobal();
                    this.bindMouse();
                };
                d.prototype._setTheme = function(a) {
                    a = this.renderer.setTheme(a);
                    if (this.viewport) this.viewport.onThemeChanged(a);
                };
                d.applyAddon = function(a) {
                    a.apply(d);
                };
                d.prototype.bindMouse = function() {
                    function a(a) {
                        switch (a.overrideType || a.type) {
                          case "mousedown":
                            var c = null != a.button ? +a.button : null != a.which ? a.which - 1 : null;
                            v.isMSIE && (c = 1 === c ? 0 : 4 === c ? 1 : c);
                            break;

                          case "mouseup":
                            c = 3;
                            break;

                          case "DOMMouseScroll":
                            c = 0 > a.detail ? 64 : 65;
                            break;

                          case "wheel":
                            c = 0 < a.wheelDeltaY ? 64 : 65;
                        }
                        var e = a.shiftKey ? 4 : 0;
                        var d = a.metaKey ? 8 : 0;
                        var k = a.ctrlKey ? 16 : 0;
                        e = e | d | k;
                        f.vt200Mouse ? e &= k : f.normalMouse || (e = 0);
                        c = 32 + (e << 2) + c;
                        if (k = f.mouseHelper.getRawByteCoords(a, f.screenElement, f.charMeasure, f.options.lineHeight, f.cols, f.rows)) switch (g(c, k), 
                        a.overrideType || a.type) {
                          case "mousedown":
                            h = c;
                            break;

                          case "mouseup":
                            h = 32;
                        }
                    }
                    function e(a) {
                        var c = h;
                        (a = f.mouseHelper.getRawByteCoords(a, f.screenElement, f.charMeasure, f.options.lineHeight, f.cols, f.rows)) && g(c + 32, a);
                    }
                    function d(a, c) {
                        f.utfMouse ? 2047 === c ? a.push(0) : 127 > c ? a.push(c) : (2047 < c && (c = 2047), 
                        a.push(192 | c >> 6), a.push(128 | c & 63)) : 255 === c ? a.push(0) : (127 < c && (c = 127), 
                        a.push(c));
                    }
                    function g(a, e) {
                        if (f.vt300Mouse) {
                            a &= 3;
                            e.x -= 32;
                            e.y -= 32;
                            var g = c.C0.ESC + "[24";
                            if (0 === a) g += "1"; else if (1 === a) g += "3"; else if (2 === a) g += "5"; else {
                                if (3 === a) return;
                                g += "0";
                            }
                            g += "~[" + e.x + "," + e.y + "]\r";
                            f.send(g);
                        } else f.decLocator ? (a &= 3, e.x -= 32, e.y -= 32, 0 === a ? a = 2 : 1 === a ? a = 4 : 2 === a ? a = 6 : 3 === a && (a = 3), 
                        f.send(c.C0.ESC + "[" + a + ";" + (3 === a ? 4 : 0) + ";" + e.y + ";" + e.x + ";" + e.page || "0&w")) : f.urxvtMouse ? (e.x -= 32, 
                        e.y -= 32, e.x++, e.y++, f.send(c.C0.ESC + "[" + a + ";" + e.x + ";" + e.y + "M")) : f.sgrMouse ? (e.x -= 32, 
                        e.y -= 32, f.send(c.C0.ESC + "[<" + ((3 === (a & 3) ? a & -4 : a) - 32) + ";" + e.x + ";" + e.y + (3 === (a & 3) ? "m" : "M"))) : (g = [], 
                        d(g, a), d(g, e.x), d(g, e.y), f.send(c.C0.ESC + "[M" + String.fromCharCode.apply(String, g)));
                    }
                    var k = this, l = this.element, f = this, h = 32;
                    w(l, "mousedown", function(c) {
                        c.preventDefault();
                        k.focus();
                        if (k.mouseEvents && !k.selectionManager.shouldForceSelection(c)) {
                            a(c);
                            if (k.vt200Mouse) return c.overrideType = "mouseup", a(c), k.cancel(c);
                            k.normalMouse && w(k.document, "mousemove", e);
                            if (!k.x10Mouse) {
                                var d = function(c) {
                                    a(c);
                                    if (k.normalMouse) {
                                        var g = void 0;
                                        void 0 === g && (g = !1);
                                        k.document.removeEventListener("mousemove", e, g);
                                    }
                                    g = void 0;
                                    void 0 === g && (g = !1);
                                    k.document.removeEventListener("mouseup", d, g);
                                    return k.cancel(c);
                                };
                                w(k.document, "mouseup", d);
                            }
                            return k.cancel(c);
                        }
                    });
                    w(l, "wheel", function(c) {
                        !k.mouseEvents || k.x10Mouse || k.vt300Mouse || k.decLocator || (a(c), c.preventDefault());
                    });
                    w(l, "wheel", function(a) {
                        if (!k.mouseEvents) return k.viewport.onWheel(a), k.cancel(a);
                    });
                    w(l, "touchstart", function(a) {
                        if (!k.mouseEvents) return k.viewport.onTouchStart(a), k.cancel(a);
                    });
                    w(l, "touchmove", function(a) {
                        if (!k.mouseEvents) return k.viewport.onTouchMove(a), k.cancel(a);
                    });
                };
                d.prototype.destroy = function() {
                    a.prototype.destroy.call(this);
                    this.writable = this.readable = !1;
                    this.handler = function() {};
                    this.write = function() {};
                    this.element && this.element.parentNode && this.element.parentNode.removeChild(this.element);
                };
                d.prototype.refresh = function(a, c) {
                    this.renderer && this.renderer.queueRefresh(a, c);
                };
                d.prototype.queueLinkification = function(a, c) {
                    this.linkifier && this.linkifier.linkifyRows(a, c);
                };
                d.prototype.showCursor = function() {
                    this.cursorState || (this.cursorState = 1, this.refresh(this.buffer.y, this.buffer.y));
                };
                d.prototype.scroll = function(a) {
                    a = this.blankLine(void 0, a);
                    var c = this.buffer.ybase + this.buffer.scrollTop, e = this.buffer.ybase + this.buffer.scrollBottom;
                    0 === this.buffer.scrollTop ? (c = this.buffer.lines.length === this.buffer.lines.maxLength, 
                    e === this.buffer.lines.length - 1 ? this.buffer.lines.push(a) : this.buffer.lines.splice(e + 1, 0, a), 
                    c) ? this.userScrolling && (this.buffer.ydisp = Math.max(this.buffer.ydisp - 1, 0)) : (this.buffer.ybase++, 
                    this.userScrolling || this.buffer.ydisp++) : (this.buffer.lines.shiftElements(c + 1, e - c + 1 - 1, -1), 
                    this.buffer.lines.set(e, a));
                    this.userScrolling || (this.buffer.ydisp = this.buffer.ybase);
                    this.updateRange(this.buffer.scrollTop);
                    this.updateRange(this.buffer.scrollBottom);
                    this.emit("scroll", this.buffer.ydisp);
                };
                d.prototype.scrollLines = function(a, c) {
                    if (0 > a) {
                        if (0 === this.buffer.ydisp) return;
                        this.userScrolling = !0;
                    } else a + this.buffer.ydisp >= this.buffer.ybase && (this.userScrolling = !1);
                    var e = this.buffer.ydisp;
                    this.buffer.ydisp = Math.max(Math.min(this.buffer.ydisp + a, this.buffer.ybase), 0);
                    e !== this.buffer.ydisp && (c || this.emit("scroll", this.buffer.ydisp), this.refresh(0, this.rows - 1));
                };
                d.prototype.scrollPages = function(a) {
                    this.scrollLines(a * (this.rows - 1));
                };
                d.prototype.scrollToTop = function() {
                    this.scrollLines(-this.buffer.ydisp);
                };
                d.prototype.scrollToBottom = function() {
                    this.scrollLines(this.buffer.ybase - this.buffer.ydisp);
                };
                d.prototype.write = function(a) {
                    var e = this;
                    this.writeBuffer.push(a);
                    this.options.useFlowControl && !this.xoffSentToCatchUp && 5 <= this.writeBuffer.length && (this.send(c.C0.DC3), 
                    this.xoffSentToCatchUp = !0);
                    !this.writeInProgress && 0 < this.writeBuffer.length && (this.writeInProgress = !0, 
                    setTimeout(function() {
                        e.innerWrite();
                    }));
                };
                d.prototype.innerWrite = function() {
                    for (var a = this, e = this.writeBuffer.splice(0, 300); 0 < e.length; ) {
                        var d = e.shift();
                        this.xoffSentToCatchUp && 0 === e.length && 0 === this.writeBuffer.length && (this.send(c.C0.DC1), 
                        this.xoffSentToCatchUp = !1);
                        this.refreshEnd = this.refreshStart = this.buffer.y;
                        d = this.parser.parse(d);
                        this.parser.setState(d);
                        this.updateRange(this.buffer.y);
                        this.refresh(this.refreshStart, this.refreshEnd);
                    }
                    0 < this.writeBuffer.length ? setTimeout(function() {
                        return a.innerWrite();
                    }, 0) : this.writeInProgress = !1;
                };
                d.prototype.writeln = function(a) {
                    this.write(a + "\r\n");
                };
                d.prototype.attachCustomKeyEventHandler = function(a) {
                    this.customKeyEventHandler = a;
                };
                d.prototype.setHypertextLinkHandler = function(a) {
                    if (!this.linkifier) throw Error("Cannot attach a hypertext link handler before Terminal.open is called");
                    this.linkifier.setHypertextLinkHandler(a);
                    this.refresh(0, this.rows - 1);
                };
                d.prototype.setHypertextValidationCallback = function(a) {
                    if (!this.linkifier) throw Error("Cannot attach a hypertext validation callback before Terminal.open is called");
                    this.linkifier.setHypertextValidationCallback(a);
                    this.refresh(0, this.rows - 1);
                };
                d.prototype.registerLinkMatcher = function(a, c, e) {
                    return this.linkifier ? (a = this.linkifier.registerLinkMatcher(a, c, e), this.refresh(0, this.rows - 1), 
                    a) : 0;
                };
                d.prototype.deregisterLinkMatcher = function(a) {
                    this.linkifier && this.linkifier.deregisterLinkMatcher(a) && this.refresh(0, this.rows - 1);
                };
                d.prototype.hasSelection = function() {
                    return this.selectionManager ? this.selectionManager.hasSelection : !1;
                };
                d.prototype.getSelection = function() {
                    return this.selectionManager ? this.selectionManager.selectionText : "";
                };
                d.prototype.clearSelection = function() {
                    this.selectionManager && this.selectionManager.clearSelection();
                };
                d.prototype.selectAll = function() {
                    this.selectionManager && this.selectionManager.selectAll();
                };
                d.prototype._keyDown = function(a) {
                    if (this.customKeyEventHandler && !1 === this.customKeyEventHandler(a)) return !1;
                    if (!this.compositionHelper.keydown(a)) return this.buffer.ybase !== this.buffer.ydisp && this.scrollToBottom(), 
                    !1;
                    var e = this._evaluateKeyEscapeSequence(a);
                    e.key === c.C0.DC3 ? this.writeStopped = !0 : e.key === c.C0.DC1 && (this.writeStopped = !1);
                    if (e.scrollLines) return this.scrollLines(e.scrollLines), this.cancel(a, !0);
                    if (this._isThirdLevelShift(this.browser, a)) return !0;
                    e.cancel && this.cancel(a, !0);
                    if (!e.key) return !0;
                    this.emit("keydown", a);
                    this.emit("key", e.key, a);
                    this.showCursor();
                    this.handler(e.key);
                    return this.cancel(a, !0);
                };
                d.prototype._isThirdLevelShift = function(a, c) {
                    a = a.isMac && !this.options.macOptionIsMeta && c.altKey && !c.ctrlKey && !c.metaKey || a.isMSWindows && c.altKey && c.ctrlKey && !c.metaKey;
                    return "keypress" === c.type ? a : a && (!c.keyCode || 47 < c.keyCode);
                };
                d.prototype._evaluateKeyEscapeSequence = function(a) {
                    var e = {
                        cancel: !1,
                        key: void 0,
                        scrollLines: void 0
                    }, d = (a.shiftKey ? 1 : 0) | (a.altKey ? 2 : 0) | (a.ctrlKey ? 4 : 0) | (a.metaKey ? 8 : 0);
                    switch (a.keyCode) {
                      case 0:
                        "UIKeyInputUpArrow" === a.key ? e.key = this.applicationCursor ? c.C0.ESC + "OA" : c.C0.ESC + "[A" : "UIKeyInputLeftArrow" === a.key ? e.key = this.applicationCursor ? c.C0.ESC + "OD" : c.C0.ESC + "[D" : "UIKeyInputRightArrow" === a.key ? e.key = this.applicationCursor ? c.C0.ESC + "OC" : c.C0.ESC + "[C" : "UIKeyInputDownArrow" === a.key && (e.key = this.applicationCursor ? c.C0.ESC + "OB" : c.C0.ESC + "[B");
                        break;

                      case 8:
                        if (a.shiftKey) {
                            e.key = c.C0.BS;
                            break;
                        } else if (a.altKey) {
                            e.key = c.C0.ESC + c.C0.DEL;
                            break;
                        }
                        e.key = c.C0.DEL;
                        break;

                      case 9:
                        if (a.shiftKey) {
                            e.key = c.C0.ESC + "[Z";
                            break;
                        }
                        e.key = c.C0.HT;
                        e.cancel = !0;
                        break;

                      case 13:
                        e.key = c.C0.CR;
                        e.cancel = !0;
                        break;

                      case 27:
                        e.key = c.C0.ESC;
                        e.cancel = !0;
                        break;

                      case 37:
                        d ? (e.key = c.C0.ESC + "[1;" + (d + 1) + "D", e.key === c.C0.ESC + "[1;3D" && (e.key = this.browser.isMac ? c.C0.ESC + "b" : c.C0.ESC + "[1;5D")) : e.key = this.applicationCursor ? c.C0.ESC + "OD" : c.C0.ESC + "[D";
                        break;

                      case 39:
                        d ? (e.key = c.C0.ESC + "[1;" + (d + 1) + "C", e.key === c.C0.ESC + "[1;3C" && (e.key = this.browser.isMac ? c.C0.ESC + "f" : c.C0.ESC + "[1;5C")) : e.key = this.applicationCursor ? c.C0.ESC + "OC" : c.C0.ESC + "[C";
                        break;

                      case 38:
                        d ? (e.key = c.C0.ESC + "[1;" + (d + 1) + "A", e.key === c.C0.ESC + "[1;3A" && (e.key = c.C0.ESC + "[1;5A")) : e.key = this.applicationCursor ? c.C0.ESC + "OA" : c.C0.ESC + "[A";
                        break;

                      case 40:
                        d ? (e.key = c.C0.ESC + "[1;" + (d + 1) + "B", e.key === c.C0.ESC + "[1;3B" && (e.key = c.C0.ESC + "[1;5B")) : e.key = this.applicationCursor ? c.C0.ESC + "OB" : c.C0.ESC + "[B";
                        break;

                      case 45:
                        a.shiftKey || a.ctrlKey || (e.key = c.C0.ESC + "[2~");
                        break;

                      case 46:
                        e.key = d ? c.C0.ESC + "[3;" + (d + 1) + "~" : c.C0.ESC + "[3~";
                        break;

                      case 36:
                        e.key = d ? c.C0.ESC + "[1;" + (d + 1) + "H" : this.applicationCursor ? c.C0.ESC + "OH" : c.C0.ESC + "[H";
                        break;

                      case 35:
                        e.key = d ? c.C0.ESC + "[1;" + (d + 1) + "F" : this.applicationCursor ? c.C0.ESC + "OF" : c.C0.ESC + "[F";
                        break;

                      case 33:
                        a.shiftKey ? e.scrollLines = -(this.rows - 1) : e.key = c.C0.ESC + "[5~";
                        break;

                      case 34:
                        a.shiftKey ? e.scrollLines = this.rows - 1 : e.key = c.C0.ESC + "[6~";
                        break;

                      case 112:
                        e.key = d ? c.C0.ESC + "[1;" + (d + 1) + "P" : c.C0.ESC + "OP";
                        break;

                      case 113:
                        e.key = d ? c.C0.ESC + "[1;" + (d + 1) + "Q" : c.C0.ESC + "OQ";
                        break;

                      case 114:
                        e.key = d ? c.C0.ESC + "[1;" + (d + 1) + "R" : c.C0.ESC + "OR";
                        break;

                      case 115:
                        e.key = d ? c.C0.ESC + "[1;" + (d + 1) + "S" : c.C0.ESC + "OS";
                        break;

                      case 116:
                        e.key = d ? c.C0.ESC + "[15;" + (d + 1) + "~" : c.C0.ESC + "[15~";
                        break;

                      case 117:
                        e.key = d ? c.C0.ESC + "[17;" + (d + 1) + "~" : c.C0.ESC + "[17~";
                        break;

                      case 118:
                        e.key = d ? c.C0.ESC + "[18;" + (d + 1) + "~" : c.C0.ESC + "[18~";
                        break;

                      case 119:
                        e.key = d ? c.C0.ESC + "[19;" + (d + 1) + "~" : c.C0.ESC + "[19~";
                        break;

                      case 120:
                        e.key = d ? c.C0.ESC + "[20;" + (d + 1) + "~" : c.C0.ESC + "[20~";
                        break;

                      case 121:
                        e.key = d ? c.C0.ESC + "[21;" + (d + 1) + "~" : c.C0.ESC + "[21~";
                        break;

                      case 122:
                        e.key = d ? c.C0.ESC + "[23;" + (d + 1) + "~" : c.C0.ESC + "[23~";
                        break;

                      case 123:
                        e.key = d ? c.C0.ESC + "[24;" + (d + 1) + "~" : c.C0.ESC + "[24~";
                        break;

                      default:
                        !a.ctrlKey || a.shiftKey || a.altKey || a.metaKey ? this.browser.isMac && !this.options.macOptionIsMeta || !a.altKey || a.ctrlKey || a.metaKey ? this.browser.isMac && !a.altKey && !a.ctrlKey && a.metaKey && 65 === a.keyCode && this.selectAll() : 65 <= a.keyCode && 90 >= a.keyCode ? e.key = c.C0.ESC + String.fromCharCode(a.keyCode + 32) : 192 === a.keyCode ? e.key = c.C0.ESC + "`" : 48 <= a.keyCode && 57 >= a.keyCode && (e.key = c.C0.ESC + (a.keyCode - 48)) : 65 <= a.keyCode && 90 >= a.keyCode ? e.key = String.fromCharCode(a.keyCode - 64) : 32 === a.keyCode ? e.key = String.fromCharCode(0) : 51 <= a.keyCode && 55 >= a.keyCode ? e.key = String.fromCharCode(a.keyCode - 51 + 27) : 56 === a.keyCode ? e.key = String.fromCharCode(127) : 219 === a.keyCode ? e.key = String.fromCharCode(27) : 220 === a.keyCode ? e.key = String.fromCharCode(28) : 221 === a.keyCode && (e.key = String.fromCharCode(29));
                    }
                    return e;
                };
                d.prototype.setgLevel = function(a) {
                    this.glevel = a;
                    this.charset = this.charsets[a];
                };
                d.prototype.setgCharset = function(a, c) {
                    this.charsets[a] = c;
                    this.glevel === a && (this.charset = c);
                };
                d.prototype._keyPress = function(a) {
                    if (this.customKeyEventHandler && !1 === this.customKeyEventHandler(a)) return !1;
                    this.cancel(a);
                    if (a.charCode) var c = a.charCode; else if (null == a.which) c = a.keyCode; else if (0 !== a.which && 0 !== a.charCode) c = a.which; else return !1;
                    if (!c || (a.altKey || a.ctrlKey || a.metaKey) && !this._isThirdLevelShift(this.browser, a)) return !1;
                    c = String.fromCharCode(c);
                    this.emit("keypress", c, a);
                    this.emit("key", c, a);
                    this.showCursor();
                    this.handler(c);
                    return !0;
                };
                d.prototype.send = function(a) {
                    var c = this;
                    this.sendDataQueue || setTimeout(function() {
                        c.handler(c.sendDataQueue);
                        c.sendDataQueue = "";
                    }, 1);
                    this.sendDataQueue += a;
                };
                d.prototype.bell = function() {
                    var a = this;
                    this.emit("bell");
                    this.soundBell() && this.bellAudioElement.play();
                    this.visualBell() && (this.element.classList.add("visual-bell-active"), clearTimeout(this.visualBellTimer), 
                    this.visualBellTimer = window.setTimeout(function() {
                        a.element.classList.remove("visual-bell-active");
                    }, 200));
                };
                d.prototype.log = function(a, c) {
                    this.options.debug && this.context.console && this.context.console.log && this.context.console.log(a, c);
                };
                d.prototype.error = function(a, c) {
                    this.options.debug && this.context.console && this.context.console.error && this.context.console.error(a, c);
                };
                d.prototype.resize = function(a, c) {
                    isNaN(a) || isNaN(c) || (a === this.cols && c === this.rows ? this.charMeasure.width && this.charMeasure.height || this.charMeasure.measure(this.options) : (1 > a && (a = 1), 
                    1 > c && (c = 1), this.buffers.resize(a, c), this.cols = a, this.rows = c, this.buffers.setupTabStops(this.cols), 
                    this.charMeasure.measure(this.options), this.refresh(0, this.rows - 1), this.emit("resize", {
                        cols: a,
                        rows: c
                    })));
                };
                d.prototype.updateRange = function(a) {
                    a < this.refreshStart && (this.refreshStart = a);
                    a > this.refreshEnd && (this.refreshEnd = a);
                };
                d.prototype.maxRange = function() {
                    this.refreshStart = 0;
                    this.refreshEnd = this.rows - 1;
                };
                d.prototype.eraseRight = function(a, c) {
                    var e = this.buffer.lines.get(this.buffer.ybase + c);
                    if (e) {
                        for (var d = [ this.eraseAttr(), " ", 1, 32 ]; a < this.cols; a++) e[a] = d;
                        this.updateRange(c);
                    }
                };
                d.prototype.eraseLeft = function(a, c) {
                    var e = this.buffer.lines.get(this.buffer.ybase + c);
                    if (e) {
                        var d = [ this.eraseAttr(), " ", 1, 32 ];
                        for (a++; a--; ) e[a] = d;
                        this.updateRange(c);
                    }
                };
                d.prototype.clear = function() {
                    if (0 !== this.buffer.ybase || 0 !== this.buffer.y) {
                        this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y));
                        this.buffer.lines.length = 1;
                        this.buffer.ydisp = 0;
                        this.buffer.ybase = 0;
                        this.buffer.y = 0;
                        for (var a = 1; a < this.rows; a++) this.buffer.lines.push(this.blankLine());
                        this.refresh(0, this.rows - 1);
                        this.emit("scroll", this.buffer.ydisp);
                    }
                };
                d.prototype.eraseLine = function(a) {
                    this.eraseRight(0, a);
                };
                d.prototype.blankLine = function(a, c, e) {
                    a = [ a ? this.eraseAttr() : this.defAttr, " ", 1, 32 ];
                    var d = [];
                    c && (d.isWrapped = c);
                    e = e || this.cols;
                    for (c = 0; c < e; c++) d[c] = a;
                    return d;
                };
                d.prototype.ch = function(a) {
                    return a ? [ this.eraseAttr(), " ", 1, 32 ] : [ this.defAttr, " ", 1, 32 ];
                };
                d.prototype.is = function(a) {
                    return 0 === (this.options.termName + "").indexOf(a);
                };
                d.prototype.handler = function(a) {
                    this.options.disableStdin || (this.selectionManager && this.selectionManager.hasSelection && this.selectionManager.clearSelection(), 
                    this.buffer.ybase !== this.buffer.ydisp && this.scrollToBottom(), this.emit("data", a));
                };
                d.prototype.handleTitle = function(a) {
                    this.emit("title", a);
                };
                d.prototype.index = function() {
                    this.buffer.y++;
                    this.buffer.y > this.buffer.scrollBottom && (this.buffer.y--, this.scroll());
                    this.buffer.x >= this.cols && this.buffer.x--;
                };
                d.prototype.reverseIndex = function() {
                    this.buffer.y === this.buffer.scrollTop ? (this.buffer.lines.shiftElements(this.buffer.y + this.buffer.ybase, this.buffer.scrollBottom - this.buffer.scrollTop, 1), 
                    this.buffer.lines.set(this.buffer.y + this.buffer.ybase, this.blankLine(!0)), this.updateRange(this.buffer.scrollTop), 
                    this.updateRange(this.buffer.scrollBottom)) : this.buffer.y--;
                };
                d.prototype.reset = function() {
                    this.options.rows = this.rows;
                    this.options.cols = this.cols;
                    var a = this.customKeyEventHandler, c = this.inputHandler;
                    this.setup();
                    this.customKeyEventHandler = a;
                    this.inputHandler = c;
                    this.refresh(0, this.rows - 1);
                    this.viewport.syncScrollArea();
                };
                d.prototype.tabSet = function() {
                    this.buffer.tabs[this.buffer.x] = !0;
                };
                d.prototype.cancel = function(a, c) {
                    if (this.options.cancelEvents || c) return a.preventDefault(), a.stopPropagation(), 
                    !1;
                };
                d.prototype.matchColor = function(a, c, e) {
                    var d = a << 16 | c << 8 | e;
                    if (null != E[d]) a = E[d]; else {
                        for (var g = Infinity, k = -1, l = 0, f, h, m; l < D.length; l++) {
                            f = D[l];
                            h = f[0];
                            m = f[1];
                            f = f[2];
                            h = Math.pow(30 * (a - h), 2) + Math.pow(59 * (c - m), 2) + Math.pow(11 * (e - f), 2);
                            if (0 === h) {
                                k = l;
                                break;
                            }
                            h < g && (g = h, k = l);
                        }
                        a = E[d] = k;
                    }
                    return a;
                };
                d.prototype.visualBell = function() {
                    return !1;
                };
                d.prototype.soundBell = function() {
                    return "sound" === this.options.bellStyle;
                };
                d.prototype.syncBellSound = function() {
                    this.element && (this.soundBell() && this.bellAudioElement ? this.bellAudioElement.setAttribute("src", this.options.bellSound) : this.soundBell() ? (this.bellAudioElement = u.createElement("audio"), 
                    this.bellAudioElement.setAttribute("preload", "auto"), this.bellAudioElement.setAttribute("src", this.options.bellSound), 
                    this.helperContainer.appendChild(this.bellAudioElement)) : this.bellAudioElement && this.helperContainer.removeChild(this.bellAudioElement));
                };
                return d;
            }(h.EventEmitter);
            d.Terminal = a;
            var w = function(a, c, e, d) {
                Array.isArray(a) || (a = [ a ]);
                a.forEach(function(a) {
                    a.addEventListener(c, e, d || !1);
                });
            }, D = function() {
                for (var a = x.DEFAULT_ANSI_COLORS.map(function(a) {
                    a = a.substring(1);
                    return [ parseInt(a.substring(0, 2), 16), parseInt(a.substring(2, 4), 16), parseInt(a.substring(4, 6), 16) ];
                }), c = [ 0, 95, 135, 175, 215, 255 ], e = 0; 216 > e; e++) a.push([ c[e / 36 % 6 | 0], c[e / 6 % 6 | 0], c[e % 6] ]);
                for (e = 0; 24 > e; e++) c = 8 + 10 * e, a.push([ c, c, c ]);
                return a;
            }(), E = {};
        }, {
            "./Buffer": 1,
            "./BufferSet": 2,
            "./CompositionHelper": 5,
            "./EscapeSequences": 6,
            "./EventEmitter": 7,
            "./InputHandler": 8,
            "./Linkifier": 9,
            "./Parser": 10,
            "./SelectionManager": 11,
            "./Viewport": 15,
            "./handlers/Clipboard": 17,
            "./input/MouseZoneManager": 18,
            "./renderer/ColorManager": 21,
            "./renderer/Renderer": 25,
            "./shared/utils/Browser": 30,
            "./utils/CharMeasure": 31,
            "./utils/MouseHelper": 33,
            "./utils/Sounds": 35
        } ],
        14: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = d.LinkHoverEventTypes || (d.LinkHoverEventTypes = {});
            a.HOVER = "linkhover";
            a.TOOLTIP = "linktooltip";
            a.LEAVE = "linkleave";
        }, {} ],
        15: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = function() {
                function a(a, d, k, e) {
                    var g = this;
                    this.terminal = a;
                    this.viewportElement = d;
                    this.scrollArea = k;
                    this.charMeasure = e;
                    this.lastRecordedBufferHeight = this.lastRecordedViewportHeight = this.lastRecordedBufferLength = this.currentRowHeight = this.scrollBarWidth = 0;
                    this.scrollBarWidth = this.viewportElement.offsetWidth - this.scrollArea.offsetWidth || 15;
                    this.viewportElement.addEventListener("scroll", this.onScroll.bind(this));
                    setTimeout(function() {
                        return g.syncScrollArea();
                    }, 0);
                }
                a.prototype.onThemeChanged = function(a) {
                    this.viewportElement.style.backgroundColor = a.background;
                };
                a.prototype.refresh = function() {
                    if (0 < this.charMeasure.height) {
                        this.currentRowHeight = this.terminal.renderer.dimensions.scaledCellHeight / window.devicePixelRatio;
                        this.lastRecordedViewportHeight = this.viewportElement.offsetHeight;
                        var a = Math.round(this.currentRowHeight * this.lastRecordedBufferLength) + (this.lastRecordedViewportHeight - this.terminal.renderer.dimensions.canvasHeight);
                        this.lastRecordedBufferHeight !== a && (this.lastRecordedBufferHeight = a, this.scrollArea.style.height = this.lastRecordedBufferHeight + "px");
                    }
                };
                a.prototype.syncScrollArea = function() {
                    this.lastRecordedBufferLength !== this.terminal.buffer.lines.length ? (this.lastRecordedBufferLength = this.terminal.buffer.lines.length, 
                    this.refresh()) : this.lastRecordedViewportHeight !== this.terminal.renderer.dimensions.canvasHeight ? this.refresh() : this.terminal.renderer.dimensions.scaledCellHeight / window.devicePixelRatio !== this.currentRowHeight && this.refresh();
                    var a = this.terminal.buffer.ydisp * this.currentRowHeight;
                    this.viewportElement.scrollTop !== a && (this.viewportElement.scrollTop = a);
                };
                a.prototype.onScroll = function(a) {
                    this.viewportElement.offsetParent && this.terminal.scrollLines(Math.round(this.viewportElement.scrollTop / this.currentRowHeight) - this.terminal.buffer.ydisp, !0);
                };
                a.prototype.onWheel = function(a) {
                    if (0 !== a.deltaY) {
                        var d = 1;
                        a.deltaMode === WheelEvent.DOM_DELTA_LINE ? d = this.currentRowHeight : a.deltaMode === WheelEvent.DOM_DELTA_PAGE && (d = this.currentRowHeight * this.terminal.rows);
                        this.viewportElement.scrollTop += a.deltaY * d;
                        a.preventDefault();
                    }
                };
                a.prototype.onTouchStart = function(a) {
                    this.lastTouchY = a.touches[0].pageY;
                };
                a.prototype.onTouchMove = function(a) {
                    var d = this.lastTouchY - a.touches[0].pageY;
                    this.lastTouchY = a.touches[0].pageY;
                    0 !== d && (this.viewportElement.scrollTop += d, a.preventDefault());
                };
                return a;
            }();
            d.Viewport = a;
        }, {} ],
        16: [ function(a, h, d) {
            function f(a, e) {
                a = Math.floor(a);
                for (var d = "", c = 0; c < a; c++) d += e;
                return d;
            }
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var m = a("../EscapeSequences"), l;
            (function(a) {
                a.Up = "A";
                a.Down = "B";
                a.Right = "C";
                a.Left = "D";
            })(l || (l = {}));
            a = function() {
                function a(a, d) {
                    this._mouseEvent = a;
                    this._terminal = d;
                    this._lines = this._terminal.buffer.lines;
                    this._startCol = this._terminal.buffer.x;
                    this._startRow = this._terminal.buffer.y;
                    a = this._terminal.mouseHelper.getCoords(this._mouseEvent, this._terminal.element, this._terminal.charMeasure, this._terminal.options.lineHeight, this._terminal.cols, this._terminal.rows, !1).map(function(a) {
                        return a - 1;
                    });
                    this._endCol = a[0];
                    this._endRow = a[1];
                }
                a.prototype.move = function() {
                    this._mouseEvent.altKey && this._terminal.send(this._arrowSequences());
                };
                a.prototype._arrowSequences = function() {
                    return this._resetStartingRow() + this._moveToRequestedRow() + this._moveToRequestedCol();
                };
                a.prototype._resetStartingRow = function() {
                    this._wrappedRowsForRow(this._endRow);
                    return 0 === this._moveToRequestedRow().length ? "" : f(this._bufferLine(this._startCol, this._startRow, this._startCol, this._startRow - this._wrappedRowsForRow(this._startRow), !1).length, this._sequence(l.Left));
                };
                a.prototype._moveToRequestedRow = function() {
                    var a = this._startRow - this._wrappedRowsForRow(this._startRow), d = this._endRow - this._wrappedRowsForRow(this._endRow);
                    a = Math.abs(a - d) - this._wrappedRowsCount();
                    return f(a, this._sequence(this._verticalDirection()));
                };
                a.prototype._moveToRequestedCol = function() {
                    var a = 0 < this._moveToRequestedRow().length ? this._endRow - this._wrappedRowsForRow(this._endRow) : this._startRow;
                    var d = this._endRow, c = this._horizontalDirection();
                    return f(this._bufferLine(this._startCol, a, this._endCol, d, c === l.Right).length, this._sequence(c));
                };
                a.prototype._wrappedRowsCount = function() {
                    for (var a = 0, d = this._startRow - this._wrappedRowsForRow(this._startRow), c = this._endRow - this._wrappedRowsForRow(this._endRow), k = 0; k < Math.abs(d - c); k++) {
                        var f = this._verticalDirection() === l.Up ? -1 : 1;
                        this._lines.get(d + f * k).isWrapped && a++;
                    }
                    return a;
                };
                a.prototype._wrappedRowsForRow = function(a) {
                    for (var e = 0, c = this._lines.get(a).isWrapped; c && 0 <= a && a < this._terminal.rows; ) e++, 
                    a--, c = this._lines.get(a).isWrapped;
                    return e;
                };
                a.prototype._horizontalDirection = function() {
                    var a = 0 < this._moveToRequestedRow().length ? this._endRow - this._wrappedRowsForRow(this._endRow) : this._startRow;
                    return this._startCol < this._endCol && a <= this._endRow || this._startCol >= this._endCol && a < this._endRow ? l.Right : l.Left;
                };
                a.prototype._verticalDirection = function() {
                    return this._startRow > this._endRow ? l.Up : l.Down;
                };
                a.prototype._bufferLine = function(a, d, c, k, l) {
                    for (var e = a, g = ""; e !== c || d !== k; ) e += l ? 1 : -1, l && e > this._terminal.cols - 1 ? (g += this._terminal.buffer.translateBufferLineToString(d, !1, a, e), 
                    a = e = 0, d++) : !l && 0 > e && (g += this._terminal.buffer.translateBufferLineToString(d, !1, 0, a + 1), 
                    a = e = this._terminal.cols - 1, d--);
                    return g + this._terminal.buffer.translateBufferLineToString(d, !1, a, e);
                };
                a.prototype._sequence = function(a) {
                    return m.C0.ESC + (this._terminal.applicationCursor ? "O" : "[") + a;
                };
                return a;
            }();
            d.AltClickHandler = a;
        }, {
            "../EscapeSequences": 6
        } ],
        17: [ function(a, h, d) {
            function f(a, e) {
                return e ? a.replace(/\r?\n/g, "\r") : a;
            }
            function m(a, e) {
                return e ? "[200~" + a + "[201~" : a;
            }
            function l(a, e) {
                e.style.position = "fixed";
                e.style.width = "20px";
                e.style.height = "20px";
                e.style.left = a.clientX - 10 + "px";
                e.style.top = a.clientY - 10 + "px";
                e.style.zIndex = "1000";
                e.focus();
                setTimeout(function() {
                    e.style.position = null;
                    e.style.width = null;
                    e.style.height = null;
                    e.style.left = null;
                    e.style.top = null;
                    e.style.zIndex = null;
                }, 200);
            }
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            d.prepareTextForTerminal = f;
            d.bracketTextForPaste = m;
            d.copyHandler = function(a, e, d) {
                e.browser.isMSIE ? window.clipboardData.setData("Text", d.selectionText) : a.clipboardData.setData("text/plain", d.selectionText);
                a.preventDefault();
            };
            d.pasteHandler = function(a, e) {
                a.stopPropagation();
                var d = function(c) {
                    c = f(c, e.browser.isMSWindows);
                    c = m(c, e.bracketedPasteMode);
                    e.handler(c);
                    e.textarea.value = "";
                    e.emit("paste", c);
                    e.cancel(a);
                };
                if (e.browser.isMSIE) {
                    if (window.clipboardData) {
                        var c = window.clipboardData.getData("Text");
                        d(c);
                    }
                } else a.clipboardData && (c = a.clipboardData.getData("text/plain"), d(c));
            };
            d.moveTextAreaUnderMouseCursor = l;
            d.rightClickHandler = function(a, e, d, c) {
                l(a, e);
                c && !d.isClickInSelection(a) && d.selectWordAtCursor(a);
                e.value = d.selectionText;
                e.select();
            };
        }, {} ],
        18: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = function() {
                function a(a) {
                    var d = this;
                    this._terminal = a;
                    this._zones = [];
                    this._areZonesActive = !1;
                    this._currentZone = this._tooltipTimeout = null;
                    this._lastHoverCoords = [ null, null ];
                    this._terminal.element.addEventListener("mousedown", function(a) {
                        return d._onMouseDown(a);
                    });
                    this._mouseMoveListener = function(a) {
                        return d._onMouseMove(a);
                    };
                    this._clickListener = function(a) {
                        return d._onClick(a);
                    };
                }
                a.prototype.add = function(a) {
                    this._zones.push(a);
                    1 === this._zones.length && this._activate();
                };
                a.prototype.clearAll = function(a, d) {
                    if (0 !== this._zones.length) {
                        d || (a = 0, d = this._terminal.rows - 1);
                        for (var k = 0; k < this._zones.length; k++) {
                            var e = this._zones[k];
                            e.y > a && e.y <= d + 1 && (this._currentZone && this._currentZone === e && (this._currentZone.leaveCallback(), 
                            this._currentZone = null), this._zones.splice(k--, 1));
                        }
                        0 === this._zones.length && this._deactivate();
                    }
                };
                a.prototype._activate = function() {
                    this._areZonesActive || (this._areZonesActive = !0, this._terminal.element.addEventListener("mousemove", this._mouseMoveListener), 
                    this._terminal.element.addEventListener("click", this._clickListener));
                };
                a.prototype._deactivate = function() {
                    this._areZonesActive && (this._areZonesActive = !1, this._terminal.element.removeEventListener("mousemove", this._mouseMoveListener), 
                    this._terminal.element.removeEventListener("click", this._clickListener));
                };
                a.prototype._onMouseMove = function(a) {
                    if (this._lastHoverCoords[0] !== a.pageX || this._lastHoverCoords[1] !== a.pageY) this._onHover(a), 
                    this._lastHoverCoords = [ a.pageX, a.pageY ];
                };
                a.prototype._onHover = function(a) {
                    var d = this, k = this._findZoneEventAt(a);
                    k !== this._currentZone && (this._currentZone && (this._currentZone.leaveCallback(), 
                    this._currentZone = null, this._tooltipTimeout && clearTimeout(this._tooltipTimeout)), 
                    k && (this._currentZone = k, k.hoverCallback && k.hoverCallback(a), this._tooltipTimeout = setTimeout(function() {
                        return d._onTooltip(a);
                    }, 500)));
                };
                a.prototype._onTooltip = function(a) {
                    this._tooltipTimeout = null;
                    var d = this._findZoneEventAt(a);
                    d && d.tooltipCallback && d.tooltipCallback(a);
                };
                a.prototype._onMouseDown = function(a) {
                    if (this._areZonesActive) {
                        var d = this._findZoneEventAt(a);
                        d && d.willLinkActivate(a) && (a.preventDefault(), a.stopImmediatePropagation());
                    }
                };
                a.prototype._onClick = function(a) {
                    var d = this._findZoneEventAt(a);
                    d && (d.clickCallback(a), a.preventDefault(), a.stopImmediatePropagation());
                };
                a.prototype._findZoneEventAt = function(a) {
                    a = this._terminal.mouseHelper.getCoords(a, this._terminal.screenElement, this._terminal.charMeasure, this._terminal.options.lineHeight, this._terminal.cols, this._terminal.rows);
                    if (!a) return null;
                    for (var d = 0; d < this._zones.length; d++) {
                        var k = this._zones[d];
                        if (k.y === a[1] && k.x1 <= a[0] && k.x2 > a[0]) return k;
                    }
                    return null;
                };
                return a;
            }();
            d.MouseZoneManager = a;
            a = function() {
                return function(a, d, l, k, e, g, c, h) {
                    this.x1 = a;
                    this.x2 = d;
                    this.y = l;
                    this.clickCallback = k;
                    this.hoverCallback = e;
                    this.tooltipCallback = g;
                    this.leaveCallback = c;
                    this.willLinkActivate = h;
                };
            }();
            d.MouseZone = a;
        }, {} ],
        19: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var f = a("./CharAtlas"), m = a("../Buffer");
            d.INVERTED_DEFAULT_COLOR = -1;
            a = function() {
                function a(a, e, d, c, l) {
                    this._container = a;
                    this._alpha = c;
                    this._colors = l;
                    this._scaledCharTop = this._scaledCharLeft = this._scaledCellHeight = this._scaledCellWidth = this._scaledCharHeight = this._scaledCharWidth = 0;
                    this._canvas = document.createElement("canvas");
                    this._canvas.classList.add("xterm-" + e + "-layer");
                    this._canvas.style.zIndex = d.toString();
                    this._initCanvas();
                    this._container.appendChild(this._canvas);
                }
                a.prototype._initCanvas = function() {
                    this._ctx = this._canvas.getContext("2d", {
                        alpha: this._alpha
                    });
                    this._alpha || this.clearAll();
                };
                a.prototype.onOptionsChanged = function(a) {};
                a.prototype.onBlur = function(a) {};
                a.prototype.onFocus = function(a) {};
                a.prototype.onCursorMove = function(a) {};
                a.prototype.onGridChanged = function(a, e, d) {};
                a.prototype.onSelectionChanged = function(a, e, d) {};
                a.prototype.onThemeChanged = function(a, e) {
                    this._refreshCharAtlas(a, e);
                };
                a.prototype.setTransparency = function(a, e) {
                    if (e !== this._alpha) {
                        var d = this._canvas;
                        this._alpha = e;
                        this._canvas = this._canvas.cloneNode();
                        this._initCanvas();
                        this._container.replaceChild(this._canvas, d);
                        this._refreshCharAtlas(a, this._colors);
                        this.onGridChanged(a, 0, a.rows - 1);
                    }
                };
                a.prototype._refreshCharAtlas = function(a, e) {
                    var d = this;
                    0 >= this._scaledCharWidth && 0 >= this._scaledCharHeight || (this._charAtlas = null, 
                    a = f.acquireCharAtlas(a, e, this._scaledCharWidth, this._scaledCharHeight), a instanceof HTMLCanvasElement ? this._charAtlas = a : a.then(function(a) {
                        return d._charAtlas = a;
                    }));
                };
                a.prototype.resize = function(a, e, d) {
                    this._scaledCellWidth = e.scaledCellWidth;
                    this._scaledCellHeight = e.scaledCellHeight;
                    this._scaledCharWidth = e.scaledCharWidth;
                    this._scaledCharHeight = e.scaledCharHeight;
                    this._scaledCharLeft = e.scaledCharLeft;
                    this._scaledCharTop = e.scaledCharTop;
                    this._canvas.width = e.scaledCanvasWidth;
                    this._canvas.height = e.scaledCanvasHeight;
                    this._canvas.style.width = e.canvasWidth + "px";
                    this._canvas.style.height = e.canvasHeight + "px";
                    this._alpha || this.clearAll();
                    d && this._refreshCharAtlas(a, this._colors);
                };
                a.prototype.fillCells = function(a, e, d, c) {
                    this._ctx.fillRect(a * this._scaledCellWidth, e * this._scaledCellHeight, d * this._scaledCellWidth, c * this._scaledCellHeight);
                };
                a.prototype.fillBottomLineAtCells = function(a, e, d) {
                    void 0 === d && (d = 1);
                    this._ctx.fillRect(a * this._scaledCellWidth, (e + 1) * this._scaledCellHeight - window.devicePixelRatio - 1, d * this._scaledCellWidth, window.devicePixelRatio);
                };
                a.prototype.fillLeftLineAtCell = function(a, e) {
                    this._ctx.fillRect(a * this._scaledCellWidth, e * this._scaledCellHeight, window.devicePixelRatio, this._scaledCellHeight);
                };
                a.prototype.strokeRectAtCell = function(a, e, d, c) {
                    this._ctx.lineWidth = window.devicePixelRatio;
                    this._ctx.strokeRect(a * this._scaledCellWidth + window.devicePixelRatio / 2, e * this._scaledCellHeight + window.devicePixelRatio / 2, d * this._scaledCellWidth - window.devicePixelRatio, c * this._scaledCellHeight - window.devicePixelRatio);
                };
                a.prototype.clearAll = function() {
                    this._alpha ? this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height) : (this._ctx.fillStyle = this._colors.background, 
                    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height));
                };
                a.prototype.clearCells = function(a, e, d, c) {
                    this._alpha ? this._ctx.clearRect(a * this._scaledCellWidth, e * this._scaledCellHeight, d * this._scaledCellWidth, c * this._scaledCellHeight) : (this._ctx.fillStyle = this._colors.background, 
                    this._ctx.fillRect(a * this._scaledCellWidth, e * this._scaledCellHeight, d * this._scaledCellWidth, c * this._scaledCellHeight));
                };
                a.prototype.fillCharTrueColor = function(a, e, d, c) {
                    this._ctx.font = this._getFont(a, !1);
                    this._ctx.textBaseline = "top";
                    this._clipRow(a, c);
                    this._ctx.fillText(e[m.CHAR_DATA_CHAR_INDEX], d * this._scaledCellWidth + this._scaledCharLeft, c * this._scaledCellHeight + this._scaledCharTop);
                };
                a.prototype.drawChar = function(a, e, d, c, l, h, m, r, t, y) {
                    var g = 0;
                    256 > m ? g = m + 2 : t && a.options.enableBold && (g = 1);
                    this._charAtlas && 256 > d && (1 < g && 16 > m && (8 > m || t) || 256 <= m) && 256 <= r ? (e = this._scaledCharWidth + f.CHAR_ATLAS_CELL_SPACING, 
                    c = this._scaledCharHeight + f.CHAR_ATLAS_CELL_SPACING, y && (this._ctx.globalAlpha = .5), 
                    t && !a.options.enableBold && 1 < g && (g -= 8), this._ctx.drawImage(this._charAtlas, d * e, g * c, e, this._scaledCharHeight, l * this._scaledCellWidth + this._scaledCharLeft, h * this._scaledCellHeight + this._scaledCharTop, e, this._scaledCharHeight)) : this._drawUncachedChar(a, e, c, m, l, h, t && a.options.enableBold, y);
                };
                a.prototype._drawUncachedChar = function(a, e, g, c, l, f, h, m) {
                    this._ctx.save();
                    this._ctx.font = this._getFont(a, h);
                    this._ctx.textBaseline = "top";
                    this._ctx.fillStyle = c === d.INVERTED_DEFAULT_COLOR ? this._colors.background : 256 > c ? this._colors.ansi[c] : this._colors.foreground;
                    this._clipRow(a, f);
                    m && (this._ctx.globalAlpha = .5);
                    this._ctx.fillText(e, l * this._scaledCellWidth + this._scaledCharLeft, f * this._scaledCellHeight + this._scaledCharTop);
                    this._ctx.restore();
                };
                a.prototype._clipRow = function(a, e) {
                    this._ctx.beginPath();
                    this._ctx.rect(0, e * this._scaledCellHeight, a.cols * this._scaledCellWidth, this._scaledCellHeight);
                    this._ctx.clip();
                };
                a.prototype._getFont = function(a, e) {
                    return (e ? a.options.fontWeightBold : a.options.fontWeight) + " " + a.options.fontSize * window.devicePixelRatio + "px " + a.options.fontFamily;
                };
                return a;
            }();
            d.BaseRenderLayer = a;
        }, {
            "../Buffer": 1,
            "./CharAtlas": 20
        } ],
        20: [ function(a, h, d) {
            function f(a, d, c, k) {
                k = {
                    foreground: k.foreground,
                    background: k.background,
                    cursor: null,
                    cursorAccent: null,
                    selection: null,
                    ansi: k.ansi.slice(0, 16)
                };
                return {
                    scaledCharWidth: a,
                    scaledCharHeight: d,
                    fontFamily: c.options.fontFamily,
                    fontSize: c.options.fontSize,
                    fontWeight: c.options.fontWeight,
                    fontWeightBold: c.options.fontWeightBold,
                    allowTransparency: c.options.allowTransparency,
                    colors: k
                };
            }
            function m(a, d) {
                for (var c = 0; c < a.colors.ansi.length; c++) if (a.colors.ansi[c] !== d.colors.ansi[c]) return !1;
                return a.fontFamily === d.fontFamily && a.fontSize === d.fontSize && a.fontWeight === d.fontWeight && a.fontWeightBold === d.fontWeightBold && a.allowTransparency === d.allowTransparency && a.scaledCharWidth === d.scaledCharWidth && a.scaledCharHeight === d.scaledCharHeight && a.colors.foreground === d.colors.foreground && a.colors.background === d.colors.background;
            }
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var l = a("../shared/CharAtlasGenerator");
            d.CHAR_ATLAS_CELL_SPACING = 1;
            var k = [];
            d.acquireCharAtlas = function(a, d, c, h) {
                for (var e = f(c, h, a, d), g = 0; g < k.length; g++) {
                    var n = k[g], t = n.ownedBy.indexOf(a);
                    if (0 <= t) {
                        if (m(n.config, e)) return n.bitmap;
                        1 === n.ownedBy.length ? k.splice(g, 1) : n.ownedBy.splice(t, 1);
                        break;
                    }
                }
                for (g = 0; g < k.length; g++) if (n = k[g], m(n.config, e)) return n.ownedBy.push(a), 
                n.bitmap;
                a = {
                    bitmap: l.generateCharAtlas(window, function(a, c) {
                        var e = document.createElement("canvas");
                        e.width = a;
                        e.height = c;
                        return e;
                    }, {
                        scaledCharWidth: c,
                        scaledCharHeight: h,
                        fontSize: a.options.fontSize,
                        fontFamily: a.options.fontFamily,
                        fontWeight: a.options.fontWeight,
                        fontWeightBold: a.options.fontWeightBold,
                        background: d.background,
                        foreground: d.foreground,
                        ansiColors: d.ansi,
                        devicePixelRatio: window.devicePixelRatio,
                        allowTransparency: a.options.allowTransparency
                    }),
                    config: e,
                    ownedBy: [ a ]
                };
                k.push(a);
                return a.bitmap;
            };
        }, {
            "../shared/CharAtlasGenerator": 29
        } ],
        21: [ function(a, h, d) {
            function f(a) {
                a = a.toString(16);
                return 2 > a.length ? "0" + a : a;
            }
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            d.DEFAULT_ANSI_COLORS = "#2e3436 #cc0000 #4e9a06 #c4a000 #3465a4 #75507b #06989a #d3d7cf #555753 #ef2929 #8ae234 #fce94f #729fcf #ad7fa8 #34e2e2 #eeeeec".split(" ");
            a = function() {
                function a() {
                    for (var a = d.DEFAULT_ANSI_COLORS.slice(), k = [ 0, 95, 135, 175, 215, 255 ], e = 0; 216 > e; e++) {
                        var g = f(k[e / 36 % 6 | 0]), c = f(k[e / 6 % 6 | 0]), h = f(k[e % 6]);
                        a.push("#" + g + c + h);
                    }
                    for (e = 0; 24 > e; e++) k = f(8 + 10 * e), a.push("#" + k + k + k);
                    this.colors = {
                        foreground: "#ffffff",
                        background: "#000000",
                        cursor: "#ffffff",
                        cursorAccent: "#000000",
                        selection: "rgba(255, 255, 255, 0.3)",
                        ansi: a
                    };
                }
                a.prototype.setTheme = function(a) {
                    this.colors.foreground = a.foreground || "#ffffff";
                    this.colors.background = a.background || "#000000";
                    this.colors.cursor = a.cursor || "#ffffff";
                    this.colors.cursorAccent = a.cursorAccent || "#000000";
                    this.colors.selection = a.selection || "rgba(255, 255, 255, 0.3)";
                    this.colors.ansi[0] = a.black || d.DEFAULT_ANSI_COLORS[0];
                    this.colors.ansi[1] = a.red || d.DEFAULT_ANSI_COLORS[1];
                    this.colors.ansi[2] = a.green || d.DEFAULT_ANSI_COLORS[2];
                    this.colors.ansi[3] = a.yellow || d.DEFAULT_ANSI_COLORS[3];
                    this.colors.ansi[4] = a.blue || d.DEFAULT_ANSI_COLORS[4];
                    this.colors.ansi[5] = a.magenta || d.DEFAULT_ANSI_COLORS[5];
                    this.colors.ansi[6] = a.cyan || d.DEFAULT_ANSI_COLORS[6];
                    this.colors.ansi[7] = a.white || d.DEFAULT_ANSI_COLORS[7];
                    this.colors.ansi[8] = a.brightBlack || d.DEFAULT_ANSI_COLORS[8];
                    this.colors.ansi[9] = a.brightRed || d.DEFAULT_ANSI_COLORS[9];
                    this.colors.ansi[10] = a.brightGreen || d.DEFAULT_ANSI_COLORS[10];
                    this.colors.ansi[11] = a.brightYellow || d.DEFAULT_ANSI_COLORS[11];
                    this.colors.ansi[12] = a.brightBlue || d.DEFAULT_ANSI_COLORS[12];
                    this.colors.ansi[13] = a.brightMagenta || d.DEFAULT_ANSI_COLORS[13];
                    this.colors.ansi[14] = a.brightCyan || d.DEFAULT_ANSI_COLORS[14];
                    this.colors.ansi[15] = a.brightWhite || d.DEFAULT_ANSI_COLORS[15];
                };
                return a;
            }();
            d.ColorManager = a;
        }, {} ],
        22: [ function(a, h, d) {
            var f = this && this.__extends || function() {
                var a = Object.setPrototypeOf || {
                    __proto__: []
                } instanceof Array && function(a, d) {
                    a.__proto__ = d;
                } || function(a, d) {
                    for (var c in d) d.hasOwnProperty(c) && (a[c] = d[c]);
                };
                return function(e, d) {
                    function c() {
                        this.constructor = e;
                    }
                    a(e, d);
                    e.prototype = null === d ? Object.create(d) : (c.prototype = d.prototype, new c());
                };
            }();
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var m = a("../Buffer");
            a = function(a) {
                function e(e, c, d) {
                    e = a.call(this, e, "cursor", c, !0, d) || this;
                    e._state = {
                        x: null,
                        y: null,
                        isFocused: null,
                        style: null,
                        width: null
                    };
                    e._cursorRenderers = {
                        bar: e._renderBarCursor.bind(e),
                        block: e._renderBlockCursor.bind(e),
                        underline: e._renderUnderlineCursor.bind(e)
                    };
                    return e;
                }
                f(e, a);
                e.prototype.resize = function(e, c, d) {
                    a.prototype.resize.call(this, e, c, d);
                    this._state = {
                        x: null,
                        y: null,
                        isFocused: null,
                        style: null,
                        width: null
                    };
                };
                e.prototype.reset = function(a) {
                    this._clearCursor();
                    this._cursorBlinkStateManager && (this._cursorBlinkStateManager.dispose(), this._cursorBlinkStateManager = null, 
                    this.onOptionsChanged(a));
                };
                e.prototype.onBlur = function(a) {
                    this._cursorBlinkStateManager && this._cursorBlinkStateManager.pause();
                    a.refresh(a.buffer.y, a.buffer.y);
                };
                e.prototype.onFocus = function(a) {
                    this._cursorBlinkStateManager ? this._cursorBlinkStateManager.resume(a) : a.refresh(a.buffer.y, a.buffer.y);
                };
                e.prototype.onOptionsChanged = function(a) {
                    var c = this;
                    a.options.cursorBlink ? this._cursorBlinkStateManager || (this._cursorBlinkStateManager = new l(a, function() {
                        c._render(a, !0);
                    })) : (this._cursorBlinkStateManager && (this._cursorBlinkStateManager.dispose(), 
                    this._cursorBlinkStateManager = null), a.refresh(a.buffer.y, a.buffer.y));
                };
                e.prototype.onCursorMove = function(a) {
                    this._cursorBlinkStateManager && this._cursorBlinkStateManager.restartBlinkAnimation(a);
                };
                e.prototype.onGridChanged = function(a, c, e) {
                    !this._cursorBlinkStateManager || this._cursorBlinkStateManager.isPaused ? this._render(a, !1) : this._cursorBlinkStateManager.restartBlinkAnimation(a);
                };
                e.prototype._render = function(a, c) {
                    if (!a.cursorState || a.cursorHidden) this._clearCursor(); else {
                        var e = a.buffer.ybase + a.buffer.y;
                        c = e - a.buffer.ydisp;
                        if (0 > c || c >= a.rows) this._clearCursor(); else if (e = a.buffer.lines.get(e)[a.buffer.x]) if (a.isFocused) if (this._cursorBlinkStateManager && !this._cursorBlinkStateManager.isCursorVisible) this._clearCursor(); else {
                            if (this._state) {
                                if (this._state.x === a.buffer.x && this._state.y === c && this._state.isFocused === a.isFocused && this._state.style === a.options.cursorStyle && this._state.width === e[m.CHAR_DATA_WIDTH_INDEX]) return;
                                this._clearCursor();
                            }
                            this._ctx.save();
                            this._cursorRenderers[a.options.cursorStyle || "block"](a, a.buffer.x, c, e);
                            this._ctx.restore();
                            this._state.x = a.buffer.x;
                            this._state.y = c;
                            this._state.isFocused = !1;
                            this._state.style = a.options.cursorStyle;
                            this._state.width = e[m.CHAR_DATA_WIDTH_INDEX];
                        } else this._clearCursor(), this._ctx.save(), this._ctx.fillStyle = this._colors.cursor, 
                        this._renderBlurCursor(a, a.buffer.x, c, e), this._ctx.restore(), this._state.x = a.buffer.x, 
                        this._state.y = c, this._state.isFocused = !1, this._state.style = a.options.cursorStyle, 
                        this._state.width = e[m.CHAR_DATA_WIDTH_INDEX];
                    }
                };
                e.prototype._clearCursor = function() {
                    this._state && (this.clearCells(this._state.x, this._state.y, this._state.width, 1), 
                    this._state = {
                        x: null,
                        y: null,
                        isFocused: null,
                        style: null,
                        width: null
                    });
                };
                e.prototype._renderBarCursor = function(a, c, e, d) {
                    this._ctx.save();
                    this._ctx.fillStyle = this._colors.cursor;
                    this.fillLeftLineAtCell(c, e);
                    this._ctx.restore();
                };
                e.prototype._renderBlockCursor = function(a, c, e, d) {
                    this._ctx.save();
                    this._ctx.fillStyle = this._colors.cursor;
                    this.fillCells(c, e, d[m.CHAR_DATA_WIDTH_INDEX], 1);
                    this._ctx.fillStyle = this._colors.cursorAccent;
                    this.fillCharTrueColor(a, d, c, e);
                    this._ctx.restore();
                };
                e.prototype._renderUnderlineCursor = function(a, c, e, d) {
                    this._ctx.save();
                    this._ctx.fillStyle = this._colors.cursor;
                    this.fillBottomLineAtCells(c, e);
                    this._ctx.restore();
                };
                e.prototype._renderBlurCursor = function(a, c, e, d) {
                    this._ctx.save();
                    this._ctx.strokeStyle = this._colors.cursor;
                    this.strokeRectAtCell(c, e, d[m.CHAR_DATA_WIDTH_INDEX], 1);
                    this._ctx.restore();
                };
                return e;
            }(a("./BaseRenderLayer").BaseRenderLayer);
            d.CursorRenderLayer = a;
            var l = function() {
                function a(a, d) {
                    this.renderCallback = d;
                    this.isCursorVisible = !0;
                    a.isFocused && this._restartInterval();
                }
                Object.defineProperty(a.prototype, "isPaused", {
                    get: function() {
                        return !(this._blinkStartTimeout || this._blinkInterval);
                    },
                    enumerable: !0,
                    configurable: !0
                });
                a.prototype.dispose = function() {
                    this._blinkInterval && (window.clearInterval(this._blinkInterval), this._blinkInterval = null);
                    this._blinkStartTimeout && (window.clearTimeout(this._blinkStartTimeout), this._blinkStartTimeout = null);
                    this._animationFrame && (window.cancelAnimationFrame(this._animationFrame), this._animationFrame = null);
                };
                a.prototype.restartBlinkAnimation = function(a) {
                    var e = this;
                    this.isPaused || (this._animationTimeRestarted = Date.now(), this.isCursorVisible = !0, 
                    this._animationFrame || (this._animationFrame = window.requestAnimationFrame(function() {
                        e.renderCallback();
                        e._animationFrame = null;
                    })));
                };
                a.prototype._restartInterval = function(a) {
                    var e = this;
                    void 0 === a && (a = 600);
                    this._blinkInterval && window.clearInterval(this._blinkInterval);
                    this._blinkStartTimeout = setTimeout(function() {
                        if (e._animationTimeRestarted) {
                            var a = 600 - (Date.now() - e._animationTimeRestarted);
                            e._animationTimeRestarted = null;
                            if (0 < a) {
                                e._restartInterval(a);
                                return;
                            }
                        }
                        e.isCursorVisible = !1;
                        e._animationFrame = window.requestAnimationFrame(function() {
                            e.renderCallback();
                            e._animationFrame = null;
                        });
                        e._blinkInterval = setInterval(function() {
                            if (e._animationTimeRestarted) {
                                var a = 600 - (Date.now() - e._animationTimeRestarted);
                                e._animationTimeRestarted = null;
                                e._restartInterval(a);
                            } else e.isCursorVisible = !e.isCursorVisible, e._animationFrame = window.requestAnimationFrame(function() {
                                e.renderCallback();
                                e._animationFrame = null;
                            });
                        }, 600);
                    }, a);
                };
                a.prototype.pause = function() {
                    this.isCursorVisible = !0;
                    this._blinkInterval && (window.clearInterval(this._blinkInterval), this._blinkInterval = null);
                    this._blinkStartTimeout && (window.clearTimeout(this._blinkStartTimeout), this._blinkStartTimeout = null);
                    this._animationFrame && (window.cancelAnimationFrame(this._animationFrame), this._animationFrame = null);
                };
                a.prototype.resume = function(a) {
                    this._animationTimeRestarted = null;
                    this._restartInterval();
                    this.restartBlinkAnimation(a);
                };
                return a;
            }();
        }, {
            "../Buffer": 1,
            "./BaseRenderLayer": 19
        } ],
        23: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = function() {
                function a() {
                    this.cache = [];
                }
                a.prototype.resize = function(a, d) {
                    for (var k = 0; k < a; k++) {
                        this.cache.length <= k && this.cache.push([]);
                        for (var e = this.cache[k].length; e < d; e++) this.cache[k].push(null);
                        this.cache[k].length = d;
                    }
                    this.cache.length = a;
                };
                a.prototype.clear = function() {
                    for (var a = 0; a < this.cache.length; a++) for (var d = 0; d < this.cache[a].length; d++) this.cache[a][d] = null;
                };
                return a;
            }();
            d.GridCache = a;
        }, {} ],
        24: [ function(a, h, d) {
            var f = this && this.__extends || function() {
                var a = Object.setPrototypeOf || {
                    __proto__: []
                } instanceof Array && function(a, e) {
                    a.__proto__ = e;
                } || function(a, e) {
                    for (var d in e) e.hasOwnProperty(d) && (a[d] = e[d]);
                };
                return function(d, e) {
                    function g() {
                        this.constructor = d;
                    }
                    a(d, e);
                    d.prototype = null === e ? Object.create(e) : (g.prototype = e.prototype, new g());
                };
            }();
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var m = a("../Types");
            a = function(a) {
                function d(e, d, c, k) {
                    var g = a.call(this, e, "link", d, !0, c) || this;
                    g._state = null;
                    k.linkifier.on(m.LinkHoverEventTypes.HOVER, function(a) {
                        return g._onLinkHover(a);
                    });
                    k.linkifier.on(m.LinkHoverEventTypes.LEAVE, function(a) {
                        return g._onLinkLeave(a);
                    });
                    return g;
                }
                f(d, a);
                d.prototype.resize = function(e, d, c) {
                    a.prototype.resize.call(this, e, d, c);
                    this._state = null;
                };
                d.prototype.reset = function(a) {
                    this._clearCurrentLink();
                };
                d.prototype._clearCurrentLink = function() {
                    this._state && (this.clearCells(this._state.x, this._state.y, this._state.length, 1), 
                    this._state = null);
                };
                d.prototype._onLinkHover = function(a) {
                    this._ctx.fillStyle = this._colors.foreground;
                    this.fillBottomLineAtCells(a.x, a.y, a.length);
                    this._state = a;
                };
                d.prototype._onLinkLeave = function(a) {
                    this._clearCurrentLink();
                };
                return d;
            }(a("./BaseRenderLayer").BaseRenderLayer);
            d.LinkRenderLayer = a;
        }, {
            "../Types": 14,
            "./BaseRenderLayer": 19
        } ],
        25: [ function(a, h, d) {
            var f = this && this.__extends || function() {
                var a = Object.setPrototypeOf || {
                    __proto__: []
                } instanceof Array && function(a, c) {
                    a.__proto__ = c;
                } || function(a, c) {
                    for (var e in c) c.hasOwnProperty(e) && (a[e] = c[e]);
                };
                return function(c, e) {
                    function d() {
                        this.constructor = c;
                    }
                    a(c, e);
                    c.prototype = null === e ? Object.create(e) : (d.prototype = e.prototype, new d());
                };
            }();
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var m = a("./TextRenderLayer"), l = a("./SelectionRenderLayer"), k = a("./CursorRenderLayer"), e = a("./ColorManager"), g = a("./LinkRenderLayer");
            h = a("../EventEmitter");
            var c = a("../utils/ScreenDprMonitor");
            a = function(a) {
                function d(d, f) {
                    var h = a.call(this) || this;
                    h._terminal = d;
                    h._refreshRowsQueue = [];
                    h._refreshAnimationFrame = null;
                    h._isPaused = !1;
                    h._needsFullRefresh = !1;
                    h.colorManager = new e.ColorManager();
                    f && h.colorManager.setTheme(f);
                    h._renderLayers = [ new m.TextRenderLayer(h._terminal.screenElement, 0, h.colorManager.colors, h._terminal.options.allowTransparency), new l.SelectionRenderLayer(h._terminal.screenElement, 1, h.colorManager.colors), new g.LinkRenderLayer(h._terminal.screenElement, 2, h.colorManager.colors, h._terminal), new k.CursorRenderLayer(h._terminal.screenElement, 3, h.colorManager.colors) ];
                    h.dimensions = {
                        scaledCharWidth: null,
                        scaledCharHeight: null,
                        scaledCellWidth: null,
                        scaledCellHeight: null,
                        scaledCharLeft: null,
                        scaledCharTop: null,
                        scaledCanvasWidth: null,
                        scaledCanvasHeight: null,
                        canvasWidth: null,
                        canvasHeight: null,
                        actualCellWidth: null,
                        actualCellHeight: null
                    };
                    h._devicePixelRatio = window.devicePixelRatio;
                    h._updateDimensions();
                    h.onOptionsChanged();
                    h._screenDprMonitor = new c.ScreenDprMonitor();
                    h._screenDprMonitor.setListener(function() {
                        return h.onWindowResize(window.devicePixelRatio);
                    });
                    "IntersectionObserver" in window && new IntersectionObserver(function(a) {
                        return h.onIntersectionChange(a[0]);
                    }, {
                        threshold: 0
                    }).observe(h._terminal.element);
                    return h;
                }
                f(d, a);
                d.prototype.onIntersectionChange = function(a) {
                    this._isPaused = 0 === a.intersectionRatio;
                    !this._isPaused && this._needsFullRefresh && this._terminal.refresh(0, this._terminal.rows - 1);
                };
                d.prototype.onWindowResize = function(a) {
                    this._devicePixelRatio !== a && (this._devicePixelRatio = a, this.onResize(this._terminal.cols, this._terminal.rows, !0));
                };
                d.prototype.setTheme = function(a) {
                    var c = this;
                    this.colorManager.setTheme(a);
                    this._renderLayers.forEach(function(a) {
                        a.onThemeChanged(c._terminal, c.colorManager.colors);
                        a.reset(c._terminal);
                    });
                    this._isPaused ? this._needsFullRefresh = !0 : this._terminal.refresh(0, this._terminal.rows - 1);
                    return this.colorManager.colors;
                };
                d.prototype.onResize = function(a, c, e) {
                    var d = this;
                    this._updateDimensions();
                    this._renderLayers.forEach(function(a) {
                        return a.resize(d._terminal, d.dimensions, e);
                    });
                    this._isPaused ? this._needsFullRefresh = !0 : this._terminal.refresh(0, this._terminal.rows - 1);
                    this._terminal.screenElement.style.width = this.dimensions.canvasWidth + this._terminal.viewport.scrollBarWidth + "px";
                    this._terminal.screenElement.style.height = window.innerHeight + "px";
                    this.emit("resize", {
                        width: this.dimensions.canvasWidth,
                        height: this.dimensions.canvasHeight
                    });
                };
                d.prototype.onCharSizeChanged = function() {
                    this.onResize(this._terminal.cols, this._terminal.rows, !0);
                };
                d.prototype.onBlur = function() {
                    var a = this;
                    this._runOperation(function(c) {
                        return c.onBlur(a._terminal);
                    });
                };
                d.prototype.onFocus = function() {
                    var a = this;
                    this._runOperation(function(c) {
                        return c.onFocus(a._terminal);
                    });
                };
                d.prototype.onSelectionChanged = function(a, c) {
                    var e = this;
                    this._runOperation(function(d) {
                        return d.onSelectionChanged(e._terminal, a, c);
                    });
                };
                d.prototype.onCursorMove = function() {
                    var a = this;
                    this._runOperation(function(c) {
                        return c.onCursorMove(a._terminal);
                    });
                };
                d.prototype.onOptionsChanged = function() {
                    var a = this;
                    this._runOperation(function(c) {
                        return c.onOptionsChanged(a._terminal);
                    });
                };
                d.prototype.clear = function() {
                    var a = this;
                    this._runOperation(function(c) {
                        return c.reset(a._terminal);
                    });
                };
                d.prototype._runOperation = function(a) {
                    this._isPaused ? this._needsFullRefresh = !0 : this._renderLayers.forEach(function(c) {
                        return a(c);
                    });
                };
                d.prototype.queueRefresh = function(a, c) {
                    this._isPaused ? this._needsFullRefresh = !0 : (this._refreshRowsQueue.push({
                        start: a,
                        end: c
                    }), this._refreshAnimationFrame || (this._refreshAnimationFrame = window.requestAnimationFrame(this._refreshLoop.bind(this))));
                };
                d.prototype._refreshLoop = function() {
                    var a = this;
                    if (4 < this._refreshRowsQueue.length) {
                        var c = 0;
                        var e = this._terminal.rows - 1;
                    } else {
                        c = this._refreshRowsQueue[0].start;
                        e = this._refreshRowsQueue[0].end;
                        for (var d = 1; d < this._refreshRowsQueue.length; d++) this._refreshRowsQueue[d].start < c && (c = this._refreshRowsQueue[d].start), 
                        this._refreshRowsQueue[d].end > e && (e = this._refreshRowsQueue[d].end);
                    }
                    this._refreshRowsQueue = [];
                    this._refreshAnimationFrame = null;
                    c = Math.max(c, 0);
                    e = Math.min(e, this._terminal.rows - 1);
                    this._renderLayers.forEach(function(d) {
                        return d.onGridChanged(a._terminal, c, e);
                    });
                    this._terminal.emit("refresh", {
                        start: c,
                        end: e
                    });
                };
                d.prototype._updateDimensions = function() {
                    this._terminal.charMeasure.width && this._terminal.charMeasure.height && (this.dimensions.scaledCharWidth = Math.floor(this._terminal.charMeasure.width * window.devicePixelRatio), 
                    this.dimensions.scaledCharHeight = Math.ceil(this._terminal.charMeasure.height * window.devicePixelRatio), 
                    this.dimensions.scaledCellHeight = Math.floor(this.dimensions.scaledCharHeight * this._terminal.options.lineHeight), 
                    this.dimensions.scaledCharTop = 1 === this._terminal.options.lineHeight ? 0 : Math.round((this.dimensions.scaledCellHeight - this.dimensions.scaledCharHeight) / 2), 
                    this.dimensions.scaledCellWidth = this.dimensions.scaledCharWidth + Math.round(this._terminal.options.letterSpacing), 
                    this.dimensions.scaledCharLeft = Math.floor(this._terminal.options.letterSpacing / 2), 
                    this.dimensions.scaledCanvasHeight = this._terminal.rows * this.dimensions.scaledCellHeight, 
                    this.dimensions.scaledCanvasWidth = this._terminal.cols * this.dimensions.scaledCellWidth, 
                    this.dimensions.canvasHeight = Math.round(this.dimensions.scaledCanvasHeight / window.devicePixelRatio), 
                    this.dimensions.canvasWidth = Math.round(this.dimensions.scaledCanvasWidth / window.devicePixelRatio), 
                    this.dimensions.actualCellHeight = this.dimensions.canvasHeight / this._terminal.rows, 
                    this.dimensions.actualCellWidth = this.dimensions.canvasWidth / this._terminal.cols);
                };
                return d;
            }(h.EventEmitter);
            d.Renderer = a;
        }, {
            "../EventEmitter": 7,
            "../utils/ScreenDprMonitor": 34,
            "./ColorManager": 21,
            "./CursorRenderLayer": 22,
            "./LinkRenderLayer": 24,
            "./SelectionRenderLayer": 26,
            "./TextRenderLayer": 27
        } ],
        26: [ function(a, h, d) {
            var f = this && this.__extends || function() {
                var a = Object.setPrototypeOf || {
                    __proto__: []
                } instanceof Array && function(a, d) {
                    a.__proto__ = d;
                } || function(a, d) {
                    for (var e in d) d.hasOwnProperty(e) && (a[e] = d[e]);
                };
                return function(d, k) {
                    function e() {
                        this.constructor = d;
                    }
                    a(d, k);
                    d.prototype = null === k ? Object.create(k) : (e.prototype = k.prototype, new e());
                };
            }();
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = function(a) {
                function d(d, e, g) {
                    d = a.call(this, d, "selection", e, !0, g) || this;
                    d._state = {
                        start: null,
                        end: null
                    };
                    return d;
                }
                f(d, a);
                d.prototype.resize = function(d, e, g) {
                    a.prototype.resize.call(this, d, e, g);
                    this._state = {
                        start: null,
                        end: null
                    };
                };
                d.prototype.reset = function(a) {
                    this._state.start && this._state.end && (this._state = {
                        start: null,
                        end: null
                    }, this.clearAll());
                };
                d.prototype.onSelectionChanged = function(a, e, d) {
                    if (this._state.start !== e && this._state.end !== d && (this.clearAll(), e && d)) {
                        var c = e[1] - a.buffer.ydisp, g = d[1] - a.buffer.ydisp, f = Math.max(c, 0), k = Math.min(g, a.rows - 1);
                        if (!(f >= a.rows || 0 > k)) {
                            c = c === f ? e[0] : 0;
                            var l = f === k ? d[0] : a.cols;
                            this._ctx.fillStyle = this._colors.selection;
                            this.fillCells(c, f, l - c, 1);
                            this.fillCells(0, f + 1, a.cols, Math.max(k - f - 1, 0));
                            f !== k && this.fillCells(0, k, g === k ? d[0] : a.cols, 1);
                            this._state.start = [ e[0], e[1] ];
                            this._state.end = [ d[0], d[1] ];
                        }
                    }
                };
                return d;
            }(a("./BaseRenderLayer").BaseRenderLayer);
            d.SelectionRenderLayer = a;
        }, {
            "./BaseRenderLayer": 19
        } ],
        27: [ function(a, h, d) {
            var f = this && this.__extends || function() {
                var a = Object.setPrototypeOf || {
                    __proto__: []
                } instanceof Array && function(a, e) {
                    a.__proto__ = e;
                } || function(a, e) {
                    for (var c in e) e.hasOwnProperty(c) && (a[c] = e[c]);
                };
                return function(c, e) {
                    function d() {
                        this.constructor = c;
                    }
                    a(c, e);
                    c.prototype = null === e ? Object.create(e) : (d.prototype = e.prototype, new d());
                };
            }();
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var m = a("../Buffer"), l = a("./Types"), k = a("./GridCache"), e = a("./BaseRenderLayer");
            a = function(a) {
                function c(c, e, d, g) {
                    c = a.call(this, c, "text", e, g, d) || this;
                    c._characterOverlapCache = {};
                    c._state = new k.GridCache();
                    return c;
                }
                f(c, a);
                c.prototype.resize = function(c, e, d) {
                    a.prototype.resize.call(this, c, e, d);
                    d = this._getFont(c, !1);
                    if (this._characterWidth !== e.scaledCharWidth || this._characterFont !== d) this._characterWidth = e.scaledCharWidth, 
                    this._characterFont = d, this._characterOverlapCache = {};
                    this._state.clear();
                    this._state.resize(c.cols, c.rows);
                };
                c.prototype.reset = function(a) {
                    this._state.clear();
                    this.clearAll();
                };
                c.prototype.onGridChanged = function(a, c, d) {
                    if (0 !== this._state.cache.length) for (;c <= d; c++) {
                        var g = a.buffer.lines.get(c + a.buffer.ydisp);
                        this.clearCells(0, c, a.cols, 1);
                        for (var f = 0; f < a.cols; f++) {
                            var k = g[f], h = k[m.CHAR_DATA_CODE_INDEX], n = k[m.CHAR_DATA_CHAR_INDEX], p = k[m.CHAR_DATA_ATTR_INDEX], q = k[m.CHAR_DATA_WIDTH_INDEX];
                            if (0 !== q && !(32 === h && 0 < f && this._isOverlapping(g[f - 1]))) {
                                var B = p >> 18, u = p & 511, A = 256 <= u, w = B & l.FLAGS.INVISIBLE, D = B & l.FLAGS.INVERSE;
                                !h || 32 === h && A && !D || w || (0 !== q && this._isOverlapping(k) && f < g.length - 1 && 32 === g[f + 1][m.CHAR_DATA_CODE_INDEX] && (q = 2), 
                                k = p >> 9 & 511, D && (D = u, u = k, k = D, 256 === k && (k = e.INVERTED_DEFAULT_COLOR), 
                                257 === u && (u = e.INVERTED_DEFAULT_COLOR)), 256 > u && (this._ctx.save(), this._ctx.fillStyle = u === e.INVERTED_DEFAULT_COLOR ? this._colors.foreground : this._colors.ansi[u], 
                                this.fillCells(f, c, q, 1), this._ctx.restore()), this._ctx.save(), B & l.FLAGS.BOLD && (this._ctx.font = this._getFont(a, !0), 
                                8 > k && (k += 8)), B & l.FLAGS.UNDERLINE && (this._ctx.fillStyle = k === e.INVERTED_DEFAULT_COLOR ? this._colors.background : 256 > k ? this._colors.ansi[k] : this._colors.foreground, 
                                this.fillBottomLineAtCells(f, c)), this.drawChar(a, n, h, q, f, c, k, u, !!(B & l.FLAGS.BOLD), !!(B & l.FLAGS.DIM)), 
                                this._ctx.restore());
                            }
                        }
                    }
                };
                c.prototype.onOptionsChanged = function(a) {
                    this.setTransparency(a, a.options.allowTransparency);
                };
                c.prototype._isOverlapping = function(a) {
                    if (1 !== a[m.CHAR_DATA_WIDTH_INDEX] || 256 > a[m.CHAR_DATA_CODE_INDEX]) return !1;
                    a = a[m.CHAR_DATA_CHAR_INDEX];
                    if (this._characterOverlapCache.hasOwnProperty(a)) return this._characterOverlapCache[a];
                    this._ctx.save();
                    this._ctx.font = this._characterFont;
                    var c = Math.floor(this._ctx.measureText(a).width) > this._characterWidth;
                    this._ctx.restore();
                    return this._characterOverlapCache[a] = c;
                };
                c.prototype._clearChar = function(a, c) {
                    var e = 1, d = this._state.cache[a][c];
                    d && 2 === d[m.CHAR_DATA_WIDTH_INDEX] && (e = 2);
                    this.clearCells(a, c, e, 1);
                };
                return c;
            }(e.BaseRenderLayer);
            d.TextRenderLayer = a;
        }, {
            "../Buffer": 1,
            "./BaseRenderLayer": 19,
            "./GridCache": 23,
            "./Types": 28
        } ],
        28: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = d.FLAGS || (d.FLAGS = {});
            a[a.BOLD = 1] = "BOLD";
            a[a.UNDERLINE = 2] = "UNDERLINE";
            a[a.BLINK = 4] = "BLINK";
            a[a.INVERSE = 8] = "INVERSE";
            a[a.INVISIBLE = 16] = "INVISIBLE";
            a[a.DIM = 32] = "DIM";
        }, {} ],
        29: [ function(a, h, d) {
            function f(a, e, d, c) {
                for (var g = 0; g < a.data.length; g += 4) a.data[g] === e && a.data[g + 1] === d && a.data[g + 2] === c && (a.data[g + 3] = 0);
            }
            function m(a, e) {
                return a + " " + e.fontSize * e.devicePixelRatio + "px " + e.fontFamily;
            }
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            var l = a("./utils/Browser");
            d.CHAR_ATLAS_CELL_SPACING = 1;
            d.generateCharAtlas = function(a, e, g) {
                var c = g.scaledCharWidth + d.CHAR_ATLAS_CELL_SPACING, k = g.scaledCharHeight + d.CHAR_ATLAS_CELL_SPACING, h = e(255 * c, 18 * k);
                e = h.getContext("2d", {
                    alpha: g.allowTransparency
                });
                e.fillStyle = g.background;
                e.fillRect(0, 0, h.width, h.height);
                e.save();
                e.fillStyle = g.foreground;
                e.font = m(g.fontWeight, g);
                e.textBaseline = "top";
                for (var q = 0; 256 > q; q++) e.save(), e.beginPath(), e.rect(q * c, 0, c, k), e.clip(), 
                e.fillText(String.fromCharCode(q), q * c, 0), e.restore();
                e.save();
                e.font = m(g.fontWeightBold, g);
                for (q = 0; 256 > q; q++) e.save(), e.beginPath(), e.rect(q * c, k, c, k), e.clip(), 
                e.fillText(String.fromCharCode(q), q * c, k), e.restore();
                e.restore();
                e.font = m(g.fontWeight, g);
                for (var r = 0; 16 > r; r++) {
                    8 === r && (e.font = m(g.fontWeightBold, g));
                    var t = (r + 2) * k;
                    for (q = 0; 256 > q; q++) e.save(), e.beginPath(), e.rect(q * c, t, c, k), e.clip(), 
                    e.fillStyle = g.ansiColors[r], e.fillText(String.fromCharCode(q), q * c, t), e.restore();
                }
                e.restore();
                if (!("createImageBitmap" in a) || l.isFirefox) return h instanceof HTMLCanvasElement ? h : new Promise(function(a) {
                    return a(h.transferToImageBitmap());
                });
                c = e.getImageData(0, 0, h.width, h.height);
                k = parseInt(g.background.substr(1, 2), 16);
                e = parseInt(g.background.substr(3, 2), 16);
                g = parseInt(g.background.substr(5, 2), 16);
                f(c, k, e, g);
                return a.createImageBitmap(c);
            };
        }, {
            "./utils/Browser": 30
        } ],
        30: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            h = (a = "undefined" === typeof navigator ? !0 : !1) ? "node" : navigator.userAgent;
            a = a ? "node" : navigator.platform;
            d.isFirefox = !!~h.indexOf("Firefox");
            d.isMSIE = !!~h.indexOf("MSIE") || !!~h.indexOf("Trident");
            h = 0 <= [ "Macintosh", "MacIntel", "MacPPC", "Mac68K" ].indexOf(a);
            d.isMac = h;
            d.isIpad = "iPad" === a;
            d.isIphone = "iPhone" === a;
            h = 0 <= [ "Windows", "Win16", "Win32", "WinCE" ].indexOf(a);
            d.isMSWindows = h;
            d.isLinux = 0 <= a.indexOf("Linux");
        }, {} ],
        31: [ function(a, h, d) {
            var f = this && this.__extends || function() {
                var a = Object.setPrototypeOf || {
                    __proto__: []
                } instanceof Array && function(a, d) {
                    a.__proto__ = d;
                } || function(a, d) {
                    for (var e in d) d.hasOwnProperty(e) && (a[e] = d[e]);
                };
                return function(d, f) {
                    function e() {
                        this.constructor = d;
                    }
                    a(d, f);
                    d.prototype = null === f ? Object.create(f) : (e.prototype = f.prototype, new e());
                };
            }();
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = function(a) {
                function d(d, e) {
                    var g = a.call(this) || this;
                    g._document = d;
                    g._parentElement = e;
                    g._measureElement = g._document.createElement("span");
                    g._measureElement.style.position = "absolute";
                    g._measureElement.style.top = "0";
                    g._measureElement.style.left = "-9999em";
                    g._measureElement.style.lineHeight = "normal";
                    g._measureElement.textContent = "W";
                    g._measureElement.setAttribute("aria-hidden", "true");
                    g._parentElement.appendChild(g._measureElement);
                    return g;
                }
                f(d, a);
                Object.defineProperty(d.prototype, "width", {
                    get: function() {
                        return this._width;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                Object.defineProperty(d.prototype, "height", {
                    get: function() {
                        return this._height;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                d.prototype.measure = function(a) {
                    this._measureElement.style.fontFamily = a.fontFamily;
                    this._measureElement.style.fontSize = a.fontSize + "px";
                    a = this._measureElement.getBoundingClientRect();
                    0 === a.width || 0 === a.height || this._width === a.width && this._height === a.height || (this._width = a.width, 
                    this._height = Math.ceil(a.height), this.emit("charsizechanged"));
                };
                return d;
            }(a("../EventEmitter").EventEmitter);
            d.CharMeasure = a;
        }, {
            "../EventEmitter": 7
        } ],
        32: [ function(a, h, d) {
            var f = this && this.__extends || function() {
                var a = Object.setPrototypeOf || {
                    __proto__: []
                } instanceof Array && function(a, d) {
                    a.__proto__ = d;
                } || function(a, d) {
                    for (var e in d) d.hasOwnProperty(e) && (a[e] = d[e]);
                };
                return function(d, f) {
                    function e() {
                        this.constructor = d;
                    }
                    a(d, f);
                    d.prototype = null === f ? Object.create(f) : (e.prototype = f.prototype, new e());
                };
            }();
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = function(a) {
                function d(d) {
                    var e = a.call(this) || this;
                    e._maxLength = d;
                    e._array = Array(e._maxLength);
                    e._startIndex = 0;
                    e._length = 0;
                    return e;
                }
                f(d, a);
                Object.defineProperty(d.prototype, "maxLength", {
                    get: function() {
                        return this._maxLength;
                    },
                    set: function(a) {
                        if (this._maxLength !== a) {
                            for (var e = Array(a), d = 0; d < Math.min(a, this.length); d++) e[d] = this._array[this._getCyclicIndex(d)];
                            this._array = e;
                            this._maxLength = a;
                            this._startIndex = 0;
                        }
                    },
                    enumerable: !0,
                    configurable: !0
                });
                Object.defineProperty(d.prototype, "length", {
                    get: function() {
                        return this._length;
                    },
                    set: function(a) {
                        if (a > this._length) for (var e = this._length; e < a; e++) this._array[e] = void 0;
                        this._length = a;
                    },
                    enumerable: !0,
                    configurable: !0
                });
                Object.defineProperty(d.prototype, "forEach", {
                    get: function() {
                        var a = this;
                        return function(e) {
                            for (var d = a.length, c = 0; c < d; c++) e(a.get(c), c);
                        };
                    },
                    enumerable: !0,
                    configurable: !0
                });
                d.prototype.get = function(a) {
                    return this._array[this._getCyclicIndex(a)];
                };
                d.prototype.set = function(a, e) {
                    this._array[this._getCyclicIndex(a)] = e;
                };
                d.prototype.push = function(a) {
                    this._array[this._getCyclicIndex(this._length)] = a;
                    this._length === this._maxLength ? (this._startIndex++, this._startIndex === this._maxLength && (this._startIndex = 0), 
                    this.emit("trim", 1)) : this._length++;
                };
                d.prototype.pop = function() {
                    return this._array[this._getCyclicIndex(this._length-- - 1)];
                };
                d.prototype.splice = function(a, e) {
                    for (var d = [], c = 2; c < arguments.length; c++) d[c - 2] = arguments[c];
                    if (e) {
                        for (c = a; c < this._length - e; c++) this._array[this._getCyclicIndex(c)] = this._array[this._getCyclicIndex(c + e)];
                        this._length -= e;
                    }
                    if (d && d.length) {
                        for (c = this._length - 1; c >= a; c--) this._array[this._getCyclicIndex(c + d.length)] = this._array[this._getCyclicIndex(c)];
                        for (c = 0; c < d.length; c++) this._array[this._getCyclicIndex(a + c)] = d[c];
                        this._length + d.length > this.maxLength ? (d = this._length + d.length - this.maxLength, 
                        this._startIndex += d, this._length = this.maxLength, this.emit("trim", d)) : this._length += d.length;
                    }
                };
                d.prototype.trimStart = function(a) {
                    a > this._length && (a = this._length);
                    this._startIndex += a;
                    this._length -= a;
                    this.emit("trim", a);
                };
                d.prototype.shiftElements = function(a, e, d) {
                    if (!(0 >= e)) {
                        if (0 > a || a >= this._length) throw Error("start argument out of range");
                        if (0 > a + d) throw Error("Cannot shift elements in list beyond index 0");
                        if (0 < d) {
                            for (var c = e - 1; 0 <= c; c--) this.set(a + c + d, this.get(a + c));
                            a = a + e + d - this._length;
                            if (0 < a) for (this._length += a; this._length > this.maxLength; ) this._length--, 
                            this._startIndex++, this.emit("trim", 1);
                        } else for (c = 0; c < e; c++) this.set(a + c + d, this.get(a + c));
                    }
                };
                d.prototype._getCyclicIndex = function(a) {
                    return (this._startIndex + a) % this.maxLength;
                };
                return d;
            }(a("../EventEmitter").EventEmitter);
            d.CircularList = a;
        }, {
            "../EventEmitter": 7
        } ],
        33: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = function() {
                function a(a) {
                    this._renderer = a;
                }
                a.getCoordsRelativeToElement = function(a, d) {
                    if (null == a.pageX) return null;
                    var f = d, e = a.pageX;
                    for (a = a.pageY; d; ) e -= d.offsetLeft, a -= d.offsetTop, d = d.offsetParent;
                    for (d = f; d && d !== d.ownerDocument.body; ) e += d.scrollLeft, a += d.scrollTop, 
                    d = d.parentElement;
                    return [ e, a ];
                };
                a.prototype.getCoords = function(d, f, h, e, g, c, n) {
                    if (!h.width || !h.height) return null;
                    d = a.getCoordsRelativeToElement(d, f);
                    if (!d) return null;
                    d[0] = Math.ceil((d[0] + (n ? this._renderer.dimensions.actualCellWidth / 2 : 0)) / this._renderer.dimensions.actualCellWidth);
                    d[1] = Math.ceil(d[1] / this._renderer.dimensions.actualCellHeight);
                    d[0] = Math.min(Math.max(d[0], 1), g + (n ? 1 : 0));
                    d[1] = Math.min(Math.max(d[1], 1), c);
                    return d;
                };
                a.prototype.getRawByteCoords = function(a, d, f, e, g, c) {
                    a = this.getCoords(a, d, f, e, g, c);
                    return {
                        x: a[0] + 32,
                        y: a[1] + 32
                    };
                };
                return a;
            }();
            d.MouseHelper = a;
        }, {} ],
        34: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = function() {
                function a() {}
                a.prototype.setListener = function(a) {
                    var d = this;
                    this._listener && this.clearListener();
                    this._listener = a;
                    this._outerListener = function() {
                        d._listener(window.devicePixelRatio, d._currentDevicePixelRatio);
                        d._updateDpr();
                    };
                    this._updateDpr();
                };
                a.prototype._updateDpr = function() {
                    this._resolutionMediaMatchList && this._resolutionMediaMatchList.removeListener(this._outerListener);
                    this._currentDevicePixelRatio = window.devicePixelRatio;
                    this._resolutionMediaMatchList = window.matchMedia("screen and (resolution: " + window.devicePixelRatio + "dppx)");
                    this._resolutionMediaMatchList.addListener(this._outerListener);
                };
                a.prototype.clearListener = function() {
                    this._listener && (this._resolutionMediaMatchList.removeListener(this._outerListener), 
                    this._outerListener = this._listener = null);
                };
                return a;
            }();
            d.ScreenDprMonitor = a;
        }, {} ],
        35: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            d.BELL_SOUND = "data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQBAADpAFgCwAMlBZoG/wdmCcoKRAypDQ8PbRDBEQQTOxRtFYcWlBePGIUZXhoiG88bcBz7HHIdzh0WHlMeZx51HmkeUx4WHs8dah0AHXwc3hs9G4saxRnyGBIYGBcQFv8U4RPAEoYRQBACD70NWwwHC6gJOwjWBloF7gOBAhABkf8b/qv8R/ve+Xf4Ife79W/0JfPZ8Z/wde9N7ijtE+wU6xvqM+lb6H7nw+YX5mrlxuQz5Mzje+Ma49fioeKD4nXiYeJy4pHitOL04j/jn+MN5IPkFOWs5U3mDefM55/ogOl36m7rdOyE7abuyu8D8Unyj/Pg9D/2qfcb+Yn6/vuK/Qj/lAAlAg==";
        }, {} ],
        36: [ function(a, h, d) {
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            a = a("./Terminal");
            h.exports = a.Terminal;
        }, {
            "./Terminal": 13
        } ]
    }, {}, [ 36 ])(36);
});

(function(b) {
    "object" === typeof exports && "undefined" !== typeof module ? module.exports = b() : "function" === typeof define && define.amd ? define([], b) : ("undefined" !== typeof window ? window : "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : this).fit = b();
})(function() {
    return function f(a, h, d) {
        function m(e, g) {
            if (!h[e]) {
                if (!a[e]) {
                    var c = "function" == typeof require && require;
                    if (!g && c) return c(e, !0);
                    if (l) return l(e, !0);
                    g = Error("Cannot find module '" + e + "'");
                    throw g.code = "MODULE_NOT_FOUND", g;
                }
                g = h[e] = {
                    exports: {}
                };
                a[e][0].call(g.exports, function(c) {
                    var d = a[e][1][c];
                    return m(d ? d : c);
                }, g, g.exports, f, a, h, d);
            }
            return h[e].exports;
        }
        for (var l = "function" == typeof require && require, k = 0; k < d.length; k++) m(d[k]);
        return m;
    }({
        1: [ function(a, h, d) {
            function f(a) {
                if (!a.element.parentElement) return null;
                var d = window.getComputedStyle(a.element.parentElement), e = parseInt(d.getPropertyValue("height"));
                d = Math.max(0, parseInt(d.getPropertyValue("width")));
                var f = window.getComputedStyle(a.element), c = parseInt(f.getPropertyValue("padding-top")), h = parseInt(f.getPropertyValue("padding-bottom")), l = parseInt(f.getPropertyValue("padding-right"));
                f = parseInt(f.getPropertyValue("padding-left"));
                return {
                    cols: Math.floor((d - (l + f) - a.viewport.scrollBarWidth) / a.renderer.dimensions.actualCellWidth),
                    rows: Math.floor((e - (c + h)) / a.renderer.dimensions.actualCellHeight)
                };
            }
            function m(a) {
                a.screenElement.style.height = window.innerHeight;
                var d = f(a);
                d && (a.resize(d.cols, d.rows), document.getElementById("termCols").value = d.cols, 
                document.getElementById("termRows").value = d.rows, transport.auth.mod_pty("window-change", a.cols, a.rows));
            }
            Object.defineProperty(d, "__esModule", {
                value: !0
            });
            d.proposeGeometry = f;
            d.fit = m;
            d.apply = function(a) {
                a.prototype.proposeGeometry = function() {
                    return f(this);
                };
                a.prototype.fit = function() {
                    m(this);
                };
            };
        }, {} ]
    }, {}, [ 1 ])(1);
});

SSHyClient.auth = function(b) {
    this.parceler = b;
    this.authenticated = null;
    this.awaitingAuthentication = !1;
    this.hostname = wsproxyURL ? wsproxyURL.split("/")[2].split(":")[0] : "";
    this.termUsername = "";
    this.termPassword = void 0;
    // this.termUsername = wsUserName ? wsUserName : "";
    // this.termPassword = wsUserPass ? wsUserPass : void 0;
    this.failedAttempts = 0;
    this.channelOpened = !1;
};

SSHyClient.auth.prototype = {
    request_auth: function() {
        var b = new SSHyClient.Message();
        b.add_bytes(String.fromCharCode(SSHyClient.MSG_SERVICE_REQUEST));
        b.add_string("ssh-userauth");
        this.parceler.send(b);
    },
    ssh_connection: function() {
        if (this.termUsername && this.termPassword) {
            var b = new SSHyClient.Message();
            b.add_bytes(String.fromCharCode(SSHyClient.MSG_USERAUTH_REQUEST));
            b.add_string(this.termUsername);
            b.add_string("ssh-connection");
            b.add_string("password");
            b.add_boolean(!1);
            b.add_string(this.termPassword);
            this.awaitingAuthentication = !0;
            this.parceler.send(b);
        } else term || startxtermjs();
    },
    auth_success: function(b) {
        b && (document.title = this.termUsername + "@" + this.hostname, this.termUsername = "", 
        this.termPassword = void 0, term || startxtermjs(), transport.settings.setKeepAlive(240), 
        document.getElementById("keepAlive").value = 240, this.open_channel("session"));
    },
    open_channel: function(b, a) {
        a = new SSHyClient.Message();
        a.add_bytes(String.fromCharCode(SSHyClient.MSG_CHANNEL_OPEN));
        a.add_string(b);
        a.add_int(1);
        a.add_int(SSHyClient.WINDOW_SIZE);
        a.add_int(SSHyClient.MAX_PACKET_SIZE);
        this.parceler.send(a);
    },
    mod_pty: function(b, a, h, d) {
        if (this.channelOpened) {
            var f = new SSHyClient.Message();
            f.add_bytes(String.fromCharCode(SSHyClient.MSG_CHANNEL_REQUEST));
            f.add_int(0);
            f.add_string(b);
            f.add_boolean(!1);
            d && f.add_string(d);
            f.add_int(a);
            f.add_int(h);
            f.add_int(0);
            f.add_int(0);
            d && f.add_string("");
            this.parceler.send(f);
            d && this.invoke_shell();
        }
    },
    invoke_shell: function() {
        var b = new SSHyClient.Message();
        b.add_bytes(String.fromCharCode(SSHyClient.MSG_CHANNEL_REQUEST));
        b.add_int(0);
        b.add_string("shell");
        b.add_boolean(!1);
        this.parceler.send(b);
        void 0 === this.termPassword ? term.write("\n\r") : startxtermjs();
    },
    authFailure: function() {
        term ? (term.write("Access Denied\r\n"), 5 <= ++this.failedAttempts ? (term.write("Too many failed authentication attempts"), 
        transport.disconnect()) : (term.write(this.termUsername + "@" + this.hostname + "'s password:"), 
        this.termPassword = "")) : display_error("Invalid Username or Password");
    }
};

SSHyClient.crypto = {};

SSHyClient.crypto.AES = function(b, a, h, d) {
    this.cipher = new sjcl.cipher.aes(sjcl.codec.bytes.toBits(toByteArray(b)), a);
    this.mode = a;
    this.mode == SSHyClient.AES_CBC && (this.iv = toByteArray(h));
    this.counter = d;
};

SSHyClient.crypto.AES.prototype = {
    encrypt: function(b) {
        b = this.cipher.encrypt(toByteArray(b), this.iv, this.counter);
        this.mode == SSHyClient.AES_CBC && (this.iv = b.slice(-16));
        return fromByteArray(b);
    },
    decrypt: function(b) {
        b = toByteArray(b);
        if (this.mode == SSHyClient.AES_CBC) {
            var a = this.cipher.decrypt(b, this.iv);
            this.iv = b.slice(-16);
        } else a = this.cipher.encrypt(b, this.iv, this.counter);
        return fromByteArray(a);
    }
};

SSHyClient.crypto.counter = function(b, a) {
    a = void 0 === a ? 1 : a;
    this.blocksize = b / 8;
    this.overflow = 0;
    0 === a ? this.value = new array(this.blocksize + 1).join("ÿ") : (b = deflate_long(a.subtract(BigInteger.ONE), !1), 
    this.value = Array(this.blocksize - b.length + 1).join("\0") + b);
};

SSHyClient.crypto.counter.prototype = {
    increment: function() {
        for (var b = this.blocksize; b--; ) {
            var a = String.fromCharCode((this.value.charCodeAt(b) + 1) % 256);
            this.value = setCharAt(this.value, b, a);
            if ("\0" != a) return this.value;
        }
        b = deflate_long(this.overflow, !1);
        return this.value = Array(this.blocksize - b.length + 1).join("\0") + b;
    }
};

SSHyClient.kex = {
    K: null,
    H: null,
    sessionId: null
};

function verifyKey(b, a) {
    if (!new SSHyClient.RSAKey(new SSHyClient.Message(b)).verify(SSHyClient.kex.H, new SSHyClient.Message(a))) throw transport.disconnect(), 
    "RSA signature verification failed, disconnecting.";
}

SSHyClient.kex.DiffieHellman = function(b, a, h) {
    this.transport = b;
    this.SHAVersion = h;
    this.group = a;
    void 0 === this.group ? (this.p = this.q = this.g = this.x = this.e = this.f = null, 
    this.minBits = 1024, this.maxBits = 8192, this.preferredBits = 2048) : (1 === this.group ? this.P = new BigInteger("FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE65381FFFFFFFFFFFFFFFF", 16) : 14 === this.group && (this.P = new BigInteger("FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AACAA68FFFFFFFFFFFFFFFF", 16)), 
    this.x = this.e = this.f = new BigInteger("0", 10), this.G = new BigInteger("2", 10));
};

SSHyClient.kex.DiffieHellman.prototype = {
    start: function() {
        var b = new SSHyClient.Message();
        void 0 === this.group ? (b.add_bytes(String.fromCharCode(SSHyClient.MSG_KEXDH_GEX_REQUEST)), 
        b.add_int(this.minBits), b.add_int(this.preferredBits), b.add_int(this.maxBits)) : (this.x = inflate_long(read_rng(128)), 
        this.e = this.G.modPow(this.x, this.P), b.add_bytes(String.fromCharCode(SSHyClient.MSG_KEXDH_INIT)), 
        b.add_mpint(this.e));
        this.transport.send_packet(b);
    },
    parse_reply: function(b, a) {
        void 0 === this.group && b == SSHyClient.MSG_KEXDH_GEX_GROUP ? this.parse_gex_group(a) : this.handleDHReply(a);
    },
    handleDHReply: function(b) {
        b = new SSHyClient.Message(b);
        var a = b.get_string();
        if (transport.settings.rsaCheckEnabled) {
            var h = wsproxyURL.split("/")[3], d = ascii2hex(a), f = ascii2hex(SSHyClient.hash.MD5(a)).match(/.{2}/g);
            randomart(f);
            var m = localStorage.getItem(h);
            if (m) {
                if (m != d) if (confirm("WARNING - POTENTIAL SECURITY BREACH!\r\n\nThe servers host key does not match the one SSHy has cached in local storage. This means that either the server administrator has changed the host key, or you have actually connected to another computer pretending to be the server.\r\nThe new rsa2 key fingerprint is:\r\nssh-rsa 2048 " + f.join(":") + "\r\nIf you were expecting this change and trust the new key, hit `Ok` to add the key to SSHy's cache and carry on connecting.\r\nIf you do not trust this new key, hit `Cancel` to abandon the connection")) localStorage.setItem(h, d); else throw ws.close(), 
                "Error: Locally stored rsa key does not match remote key";
            } else if (confirm("The server's host key is not cached in local storage. You have no guarentee that the server is the computer you think it is.\n\rThe server's rsa2 key finterprint is:\r\nssh-rsa 2048 " + f.join(":") + "\r\nIf you trust the host, hit `Ok` to add the key to SSHy's cache and carry on connecting.\r\nIf you do not trust this host, hit `Cancel` to abandon the connection")) localStorage.setItem(h, d); else throw ws.close(), 
            "User has declined the rsa-key and closed the connection";
        }
        this.f = b.get_mpint();
        b = b.get_string();
        h = this.f.modPow(this.x, this.p);
        d = new SSHyClient.Message();
        d.add_string(this.transport.local_version);
        d.add_string(this.transport.remote_version);
        d.add_string(this.transport.local_kex_message);
        d.add_string(this.transport.remote_kex_message);
        d.add_string(a);
        void 0 === this.group && (d.add_int(this.minBits), d.add_int(this.preferredBits), 
        d.add_int(this.maxBits), d.add_mpint(this.p), d.add_mpint(this.g));
        d.add_mpint(this.e);
        d.add_mpint(this.f);
        d.add_mpint(h);
        SSHyClient.kex.K = h;
        SSHyClient.kex.sessionId = SSHyClient.kex.H = "SHA-1" == this.SHAVersion ? new SSHyClient.hash.SHA1(d.toString()).digest() : new SSHyClient.hash.SHA256(d.toString()).digest();
        transport.settings.rsaCheckEnabled && verifyKey(a, b);
        this.transport.send_new_keys();
    },
    generate_x: function() {
        var b = this.p.subtract(BigInteger.ONE);
        b = b.divide(new BigInteger("2", 10));
        var a = deflate_long(b, 0), h = a[0].charCodeAt(0);
        a = a.length;
        for (var d = 255; !(h & 128); ) h <<= 1, d >>= 1;
        for (;!(h = read_rng(a), h = String.fromCharCode(h[0].charCodeAt(0) & d) + h.substring(1), 
        h = inflate_long(h, 1), 0 < h.compareTo(BigInteger.ONE) && 0 < b.compareTo(h)); ) ;
        this.x = h;
    },
    parse_gex_group: function(b) {
        b = new SSHyClient.Message(b);
        this.p = b.get_mpint();
        this.g = b.get_mpint();
        this.generate_x();
        this.e = this.g.modPow(this.x, this.p);
        b = new SSHyClient.Message();
        b.add_bytes(String.fromCharCode(SSHyClient.MSG_KEXDH_GEX_INIT));
        b.add_mpint(this.e);
        this.transport.send_packet(b);
    }
};

SSHyClient.Message = function(b) {
    this.position = 0;
    this.packet = void 0 === b ? String() : String(b);
};

SSHyClient.Message.prototype = {
    toString: function() {
        return this.packet;
    },
    get_bytes: function(b) {
        var a = this.packet.substring(this.position, this.position + b);
        this.position += b;
        return a.length < b && 1048576 > b ? a + Array(b - a.length + 1).join("\0") : a;
    },
    get_int: function() {
        return struct.unpack("I", this.get_bytes(4))[0];
    },
    get_string: function() {
        return this.get_bytes(this.get_int());
    },
    get_mpint: function() {
        return inflate_long(this.get_string());
    },
    add_bytes: function(b) {
        this.packet += b;
        return this;
    },
    add_boolean: function(b) {
        this.add_bytes(!0 === b ? "" : "\0");
        return this;
    },
    add_int: function(b) {
        this.packet += struct.pack("I", b);
        return this;
    },
    add_mpint: function(b) {
        this.add_string(deflate_long(b));
        return this;
    },
    add_string: function(b) {
        this.add_int(b.length);
        this.packet += b;
        return this;
    }
};

SSHyClient.parceler = function(b, a) {
    this.socket = b;
    this.transport = a;
    this.encrypting = !1;
    this.hmacSHAVersion = this.inbound_iv = this.inbound_enc_key = this.inbound_mac_key = this.inbound_cipher = this.outbound_enc_iv = this.outbound_enc_key = this.outbound_mac_key = this.outbound_cipher = null;
    this.outbound_sequence_num = this.inbound_sequence_num = this.macSize = 0;
    this.block_size = 8;
    this.prevHeader = this.inbound_buffer = "";
    this.windowSize = SSHyClient.WINDOW_SIZE;
    this.recieveData = this.transmitData = 0;
};

SSHyClient.parceler.prototype = {
    send: function(b) {
        packet = this.pack_message(b.toString());
        this.encrypting && (packet = this.outbound_cipher.encrypt(packet) + SSHyClient.hash.HMAC(this.outbound_mac_key, struct.pack("I", this.outbound_sequence_num) + packet, this.hmacSHAVersion));
        this.socket.sendB64(packet);
        this.outbound_sequence_num++;
    },
    pack_message: function(b) {
        var a = 3 + this.block_size - (b.length + 8) % this.block_size;
        b = struct.pack("I", b.length + a + 1) + struct.pack("B", a) + b;
        return b += this.encrypting ? read_rng(a) : Array(a + 1).join("\0");
    },
    handle: function(b) {
        this.recieveData += b.length;
        this.transport.settings.setNetTraffic(transport.parceler.recieveData, !0);
        if (this.encrypting) this.inbound_buffer += b, this.decrypt(); else if (this.transport.remote_version) this.inbound_buffer += b, 
        this.decrypt(b); else this.transport.handler_table[0](this.transport, b);
    },
    decrypt: function() {
        for (var b = " ", a; null !== b; ) {
            if (this.prevHeader) a = this.prevHeader, this.prevHeader = ""; else {
                a = this.read_ibuffer();
                if (!a) break;
                this.encrypting && (a = this.inbound_cipher.decrypt(a));
            }
            var h = struct.unpack("I", a.substring(0, 4))[0], d = a.substring(4);
            b = this.read_ibuffer(h + this.macSize - d.length);
            if (!b) {
                this.prevHeader = a;
                break;
            }
            a = b.substring(0, h - d.length);
            this.encrypting && (a = this.inbound_cipher.decrypt(a));
            a = d + a;
            if (this.macSize) {
                d = b.substring(h - d.length);
                var f = struct.pack("I", this.inbound_sequence_num) + struct.pack("I", h) + a;
                if (SSHyClient.hash.HMAC(this.inbound_mac_key, f, this.hmacSHAVersion) != d) throw this.transport.disconnect(), 
                "Inbound MAC verification failed - Mismatched MAC";
            }
            this.inbound_sequence_num++;
            this.windowSize -= h;
            0 >= this.windowSize && this.transport.winAdjust();
            this.transport.handle_dec(a);
        }
    },
    read_ibuffer: function(b) {
        b = void 0 === b ? this.block_size : b;
        if (this.inbound_buffer.length < b) return null;
        var a = this.inbound_buffer.substring(0, b);
        this.inbound_buffer = this.inbound_buffer.substring(b);
        return a;
    }
};

SSHyClient.RSAKey = function(b) {
    b.get_string();
    this.e = b.get_mpint();
    this.n = b.get_mpint();
};

SSHyClient.RSAKey.prototype = {
    pkcs1imify: function(b) {
        return "\0" + Array(deflate_long(this.n, 0).length - 15 - b.length - 3 + 1).join("ÿ") + "\x000!0\t+\0" + b;
    },
    verify: function(b, a) {
        if ("ssh-rsa" != a.get_string()) return !1;
        a = inflate_long(a.get_string(), !0);
        b = inflate_long(this.pkcs1imify(new SSHyClient.hash.SHA1(b).digest()), !0);
        return a.modPow(this.e, this.n).equals(b);
    }
};

SSHyClient.settings = function() {
    this.localEcho = 0;
    this.fsHintEnter = "[?1";
    this.fsHintLeave = SSHyClient.bashFsHintLeave;
    this.autoEchoState = !1;
    this.autoEchoTimeout = 0;
    this.blockedKeys = [ ":" ];
    this.keepAliveInterval = void 0;
    this.fontSize = 16;
    this.colorTango = !0;
    this.colorNames = Object.keys(this.colorSchemes);
    this.colorCounter = 0;
    this.shellString = "";
    this.sidenavElementState = 0;
    this.rxElement = document.getElementById("rxTraffic");
    this.txElement = document.getElementById("txTraffic");
    this.autoEchoElement = document.getElementById("autoEchoState");
    this.rsaCheckEnabled = !0;
};

SSHyClient.settings.prototype = {
    colorSchemes: [ [ "Solarized", {
        background: "#002b36",
        black: "#002b36",
        red: "#dc322f",
        green: "#859900",
        yellow: "#b58900",
        blue: "#268bd2",
        magenta: "#6c71c4",
        cyan: "#2aa198",
        white: "#93a1a1",
        brightBlack: "#657b83",
        brightRed: "#dc322f",
        brightGreen: "#859900",
        brightYellow: "#b58900",
        brightBlue: "#268bd2",
        brightMagenta: "#6c71c4",
        brightCyan: "#2aa198",
        brightWhite: "#fdf6e3",
        cursor: "#93a1a1",
        foreground: "#93a1a1"
    } ], [ "Material", {
        background: "#263238",
        black: "#263238",
        red: "#ff9800",
        green: "#8bc34a",
        yellow: "#ffc107",
        blue: "#03a9f4",
        magenta: "#e91e63",
        cyan: "#009688",
        white: "#cfd8dc",
        brightBlack: "#37474f",
        brightRed: "#ffa74d",
        brightGreen: "#9ccc65",
        brightYellow: "#ffa000",
        brightBlue: "#81d4fa",
        brightMagenta: "#ad1457",
        brightCyan: "#26a69a",
        brightWhite: "#eceff1",
        cursor: "#eceff1",
        foreground: "#eceff1"
    } ], [ "Monokai", {
        background: "#272822",
        black: "#272822",
        red: "#dc2566",
        green: "#8fc029",
        yellow: "#d4c96e",
        blue: "#55bcce",
        magenta: "#9358fe",
        cyan: "#56b7a5",
        white: "#acada1",
        brightBlack: "#76715e",
        brightRed: "#fa2772",
        brightGreen: "#a7e22e",
        brightYellow: "#e7db75",
        brightBlue: "#66d9ee",
        brightMagenta: "#ae82ff",
        brightCyan: "#66efd5",
        brightWhite: "#cfd0c2",
        cursor: "#f1ebeb",
        foreground: "#f1ebeb"
    } ], [ "Ashes", {
        background: "#1c2023",
        black: "#1c2023",
        red: "#c7ae95",
        green: "#95c7ae",
        yellow: "#aec795",
        blue: "#ae95c7",
        magenta: "#c795ae",
        cyan: "#95aec7",
        white: "#c7ccd1",
        brightBlack: "#747c84",
        brightRed: "#c7ae95",
        brightGreen: "#95c7ae",
        brightYellow: "#aec795",
        brightBlue: "#ae95c7",
        brightMagenta: "#c795ae",
        brightCyan: "#95aec7",
        brightWhite: "#f3f4f5",
        cursor: "#c7ccd1",
        foreground: "#c7ccd1"
    } ], [ "Google", {
        background: "#ffffff",
        black: "#ffffff",
        red: "#cc342b",
        green: "#198844",
        yellow: "#fba922",
        blue: "#3971ed",
        magenta: "#a36ac7",
        cyan: "#3971ed",
        white: "#c5c8c6",
        brightBlack: "#969896",
        brightRed: "#cc342b",
        brightGreen: "#198844",
        brightYellow: "#fba922",
        brightBlue: "#3971ed",
        brightMagenta: "#a36ac7",
        brightCyan: "#3971ed",
        brightWhite: "#ffffff",
        cursor: "#373b41",
        foreground: "#373b41"
    } ], [ "Mono Light", {
        background: "#f7f7f7",
        black: "#f7f7f7",
        red: "#7c7c7c",
        green: "#8e8e8e",
        yellow: "#a0a0a0",
        blue: "#686868",
        magenta: "#747474",
        cyan: "#868686",
        white: "#b9b9b9",
        brightBlack: "#525252",
        brightRed: "#7c7c7c",
        brightGreen: "#8e8e8e",
        brightYellow: "#a0a0a0",
        brightBlue: "#686868",
        brightMagenta: "#747474",
        brightCyan: "#868686",
        brightWhite: "#f7f7f7",
        cursor: "#464646",
        foreground: "#464646"
    } ], [ "Mono Dark", {
        background: "#000000",
        black: "#000000",
        red: "#6b6b6b",
        green: "#c4c4c4",
        yellow: "#b3b3b3",
        blue: "#999999",
        magenta: "#717171",
        cyan: "#8a8a8a",
        white: "#b5cabb",
        brightBlack: "#202020",
        brightRed: "#464646",
        brightGreen: "#f8f8f8",
        brightYellow: "#eeeeee",
        brightBlue: "#7c7c7c",
        brightMagenta: "#adadad",
        brightCyan: "#c0c0c0",
        brightWhite: "#99ac9e",
        cursor: "#ffffff",
        foreground: "#ffffff"
    } ], [ "Tango", {} ] ],
    testShell: function(b) {
        -1 === b.substring(0, 2).indexOf("]") && (0 === this.shellString.length || 7 < this.shellString.length) ? this.shellString = "" : (this.shellString += b, 
        7 > this.shellString.length || (-1 !== this.shellString.indexOf("]0;fish") ? (this.shellString = "", 
        this.fsHintLeave = SSHyClient.fishFsHintLeave) : -1 !== this.shellString.indexOf("@") && (this.shellString = "", 
        this.fsHintLeave = SSHyClient.bashFsHintLeave)));
    },
    setLocalEcho: function(b) {
        this.localEcho = Math.min(Math.max(this.localEcho += b, 0), 2);
        document.getElementById("currentLEcho").innerHTML = [ "Force Off", "Auto", "Force On" ][this.localEcho];
        b = document.getElementById("autoEchoState");
        1 === this.localEcho ? (b.style.visibility = "visible", b.innerHTML = "State: " + (!1 === this.autoEchoState ? "Disabled" : "Enabled")) : b.style.visibility = "hidden";
    },
    parseLocalEcho: function(b) {
        if (1 === this.localEcho) {
            var a = performance.now();
            if (!(100 > a - this.autoEchoTimeout)) if (b = b.substring(0, 64), !this.autoEchoState) -1 != b.indexOf(this.fsHintLeave) && -1 != b.indexOf("@") && (this.autoEchoState = !0, 
            this.autoEchoElement.innerHTML = "State: Enabled", this.autoEchoTimeout = a); else if (-1 != b.indexOf(this.fsHintEnter) || -1 != b.toLowerCase().indexOf("password")) this.autoEchoState = !1, 
            this.autoEchoElement.innerHTML = "State: Disabled", this.autoEchoTimeout = a;
        }
    },
    parseKey: function(b) {
        1 === this.localEcho && !1 === this.autoEchoState || 1 < b.key.length || this.blockedKeys.includes(b.key) || b.altKey || b.ctrlKey || b.metaKey || (transport.lastKey || term.write(b.key), 
        transport.lastKey += b.key);
    },
    setKeepAlive: function(b) {
        b = void 0 === b ? 0 : 1e3 * Math.floor(b);
        if (0 === b || void 0 !== this.keepAliveInterval) if (clearInterval(this.keepAliveInterval), 
        this.keepAliveInterval = void 0, !b) return;
        this.keepAliveInterval = setInterval(transport.keepAlive, b);
    },
    setColorScheme: function(b) {
        var a = document.styleSheets[0], h = this.colorSchemes[b][0];
        b = this.colorSchemes[b][1];
        term && term._setTheme(b);
        if (!this.colorTango) for (i = 0; 4 > i; i++) a.deleteRule(13);
        "Tango" === h ? (this.colorTango = !0, document.getElementById("currentColor").innerHTML = "Tango") : (a.insertRule("html, body {background-color: " + b.background + " !important;}", 13), 
        a.insertRule(".sidenav {background-color: " + modColorPercent(b.background, -.2) + " !important;}", 13), 
        a.insertRule(".brightgreen {color: " + b.brightGreen + " !important;}", 13), a.insertRule(".brightyellow {color: " + b.brightYellow + " !important;}", 13), 
        this.colorTango = !1, document.getElementById("currentColor").innerHTML = void 0 === h ? "Custom" : h);
    },
    importXresources: function() {
        var b = new FileReader(), a = document.getElementById("Xresources").files[0];
        b.readAsText(a);
        b.onload = function() {
            var h = b.result.split("\n");
            h = h.sort(new Intl.Collator(void 0, {
                numeric: !0,
                sensitivity: "base"
            }).compare);
            colScheme = [];
            for (var d = 0; d < h.length; d++) {
                var f = h[d].match(/#([0-9a-f]{3}){1,2}/gi);
                if (f && (colScheme.push(f[0]), 19 <= colScheme.length)) break;
            }
            if (19 !== colScheme.length) return alert("Uploaded file could not be parsed correctly.");
            colScheme = {
                background: colScheme[0],
                black: colScheme[1],
                red: colScheme[2],
                green: colScheme[3],
                yellow: colScheme[4],
                blue: colScheme[5],
                magenta: colScheme[6],
                cyan: colScheme[7],
                white: colScheme[8],
                brightBlack: colScheme[9],
                brightRed: colScheme[10],
                brightGreen: colScheme[11],
                brightYellow: colScheme[12],
                brightBlue: colScheme[13],
                brightMagenta: colScheme[14],
                brightCyan: colScheme[15],
                brightWhite: colScheme[16],
                cursor: colScheme[17],
                foreground: colScheme[18]
            };
            colName = ".Xresources" === a.name ? "custom" : a.name.split(".")[0];
            transport.settings.colorSchemes.push([ colName, colScheme ]);
            transport.settings.colorNames = Object.keys(transport.settings.colorSchemes);
            transport.settings.setColorScheme(transport.settings.colorSchemes.length - 1);
        };
    },
    cycleColorSchemes: function(b) {
        this.colorCounter = 0 === b ? --this.colorCounter : ++this.colorCounter;
        if (this.colorCounter > this.colorNames.length - 1 || 0 > this.colorCounter) this.colorCounter = 1 === b ? 0 : this.colorNames.length - 1;
        this.setColorScheme(this.colorCounter);
    },
    modFontSize: function(b) {
        this.fontSize += b;
        term.setOption("fontSize", this.fontSize);
        document.getElementById("currentFontSize").innerHTML = transport.settings.fontSize + "px";
        term.fit();
        transport.auth.mod_pty("window-change", term.cols, term.rows);
    },
    modTerm: function(b, a) {
        b ? term.resize(term.cols, a) : term.resize(a, term.rows);
        transport.auth.mod_pty("window-change", term.cols, term.rows);
    },
    setNetTraffic: function(b, a) {
        if (this.sidenavElementState) {
            switch (!0) {
              case 1024 > b:
                b += "Bytes";
                break;

              case 1024 <= b && 1048576 > b:
                b = (b / 1024).toFixed(3) + "KB";
                break;

              case 1048576 <= b && 1073741824 > b:
                b = (b / 1048576).toFixed(3) + "MB";
                break;

              default:
                b = (b / 1073741824).toFixed(3) + "GB";
            }
            element = !0 === a ? this.rxElement : this.txElement;
            element.innerHTML = b;
        }
    }
};

var ws, transport, term = null;

window.msCrypto && (window.crypto = {}, window.crypto.getRandomValues = function(b) {
    return window.msCrypto.getRandomValues(b);
}, Uint8Array.prototype.slice || Object.defineProperty(Uint8Array.prototype, "slice", {
    value: Array.prototype.slice
}));

var resizeInterval;

window.onload = function() {
    document.body.innerHTML += '<div id="settingsNav" class="sidenav">\n\t\t\t\t\t\t\t\t\t<a href="javascript:;" class="closebtn" onclick="toggleNav(0)">&times;</a>\n\t\t\t\t\t\t\t\t\t<span class="title large">Terminal Options</span>\n\t\t\t\t\t\t\t\t\t<hr>\n\t\t\t\t\t\t\t\t\t<span class="title" style="padding-top:20px">Font Size</span>\n\t\t\t\t\t\t\t\t\t<a class="leftarrow" href="javascript:;" onclick="transport.settings.modFontSize(-1)"><--</a>\n\t\t\t\t\t\t\t\t\t<span class="middle" id="currentFontSize">16px</span>\n\t\t\t\t\t\t\t\t\t<a class="rightarrow" href="javascript:;" onclick="transport.settings.modFontSize(1)">--\x3e</a>\n\t\t\t\t\t\t\t\t\t<span class="title" style="padding-top:40px">Terminal Size</span>\n\t\t\t\t\t\t\t\t\t<span class="leftarrow">Cols:\n\t\t\t\t\t\t\t\t\t\t<input type="number" id="termCols" min="5" oninput="transport.settings.modTerm(0, this.value)">\n\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t<span class="rightarrow">Rows:\n\t\t\t\t\t\t\t\t\t\t<input type="number" id="termRows" min="5" oninput="transport.settings.modTerm(1, this.value)">\n\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t<span class="title" style="padding-top:60px;">Local Echo</span>\n\t\t\t\t\t\t\t\t\t<a class="leftarrow" href="javascript:;" onclick="transport.settings.setLocalEcho(-1)"><--</a>\n\t\t\t\t\t\t\t\t\t<a class="rightarrow" href="javascript:;" onclick="transport.settings.setLocalEcho(1)">--\x3e</a>\n\t\t\t\t\t\t\t\t\t<div class="fileUpload btn btn-primary nomargin">\n\t\t\t\t\t\t\t\t\t\t<span class="tooltiptext" style="visibility:visible;" id="autoEchoState">State: Enabled</span>\n\t\t\t\t\t\t\t\t\t\t<span class="middle" id="currentLEcho">Force Off</span>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<span class="title" style="padding-top:50px">Colours</span>\n\t\t\t\t\t\t\t\t\t<a class="leftarrow" href="javascript:;" onclick="transport.settings.cycleColorSchemes(0)"><--</a>\n\t\t\t\t\t\t\t\t\t<span class="middle" id="currentColor">Monokai</span>\n\t\t\t\t\t\t\t\t\t<a class="rightarrow" href="javascript:;" onclick="transport.settings.cycleColorSchemes(1)">--\x3e</a>\n\t\t\t\t\t\t\t\t\t<div class="fileUpload btn btn-primary">\n\t\t\t\t\t\t\t\t\t\t<span class="tooltiptext">Format: Xresources</span>\n\t\t\t\t\t\t\t\t\t\t<span class="middle" style="width:220px;">Upload</span>\n\t\t\t\t\t\t\t\t\t\t<input type="file" title=" " id="Xresources" class="upload" onchange="transport.settings.importXresources()" />\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<span class="title" style="padding-top:20px;">Keep Alive</span>\n\t\t\t\t\t\t\t\t\t<div class="fileUpload btn btn-primary">\n\t\t\t\t\t\t\t\t\t\t<span class="tooltiptext">0 to disable</span>\n\t\t\t\t\t\t\t\t\t\t<input type="number" class="large" id="keepAlive" onchange="transport.settings.setKeepAlive(this.value);" placeholder="0">\n\t\t\t\t\t\t\t\t\t\t<span style="font-size:16px;"> seconds</span>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<span class="title" style="padding-top:20px;">Network Traffic</span>\n\t\t\t\t\t\t\t\t\t<div class="netTraffic">\n\t\t\t\t\t\t\t\t\t\t<span class="leftarrow brightgreen">rx: <span id="rxTraffic"></span></span>\n\t\t\t\t\t\t\t\t\t\t<span class="rightarrow brightyellow">tx: <span id="txTraffic"></span></span>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div id="hostKey" style="display: none;">\n\t\t\t\t\t\t\t\t        <span class="title" style="padding-top:20px;">Host Key</span>\n\t\t\t\t\t\t\t\t        <span id="hostKeyImg" class="hostKeyImg"></span>\n\t\t\t\t\t\t\t\t    </div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<span id="gear" class="gear" style="visibility:visible;" onclick="toggleNav(250)">&#9881</span>';
    fit.apply(Terminal);
    startSSHy();
};

window.onresize = function() {
    clearTimeout(resizeInterval);
    resizeInterval = setTimeout(resize, 400);
};

window.onbeforeunload = function() {
    (ws || transport) && transport.disconnect();
};

function resize() {
    term && term.fit();
}

function toggleNav(b) {
    document.getElementById("settingsNav").style.width = b;
    if (transport.settings.sidenavElementState = b) transport.settings.setNetTraffic(transport.parceler.recieveData, !0), 
    transport.settings.setNetTraffic(transport.parceler.transmitData, !1);
    b = document.getElementById("gear").style;
    b.visibility = "hidden" === b.visibility ? "visible" : "hidden";
}

function startSSHy() {
    document.title = "SSHy Client";
    ws = new WebSocket(wsproxyURL, "base64");
    ws.onopen = function(b) {
        transport = new SSHyClient.Transport(ws);
        transport.settings.rsaCheckEnabled = !1;
    };
    ws.onmessage = function(b) {
        transport.parceler.handle(atob(b.data));
    };
    ws.onclose = function(b) {
        term ? transport.closing || (term.write("\n\n\rWebsocket connection to " + transport.auth.hostname + " was unexpectedly closed."), 
        transport.settings.keepAliveInterval || term.write("\n\n\rThis was likely caused by he remote SSH server timing out the session due to inactivity.\r\n- Session Keep Alive interval can be set in the settings to prevent this behaviour.")) : (termInit(), 
        term.write("WebSocket connection failed: Error in connection establishment: code " + b.code));
    };
    ws.sendB64 = function(b) {
        this.send(btoa(b));
        transport.parceler.transmitData += b.length;
        transport.settings.setNetTraffic(transport.parceler.transmitData, !1);
    };
}

function termInit() {
    term = new Terminal({
        cols: 80,
        rows: 24
    });
    term.open(document.getElementById("terminal"), !0);
    term.fit();
    term.focus();
    document.getElementById("termCols").value = term.cols;
    document.getElementById("termRows").value = term.rows;
    transport.settings.setColorScheme(1);
}

function startxtermjs() {
    termInit();
    transport.auth.authenticated || term.write("Login as: ");
    term.textarea.onkeydown = function(b) {
        if (ws && transport && !(5 <= transport.auth.failedAttempts) && !transport.auth.awaitingAuthentication) {
            var a = b.char && 1 == b.char.length ? b.char : b.key;
            if (!(1 < a.length && (b.altKey || b.ctrlKey || b.metaKey || b.shiftKey) && "Backspace" != a)) {
                if (transport.auth.authenticated) {
                    if (1 == a.length && (!(b.altKey || b.ctrlKey || b.metaKey) || b.altKey && b.ctrlKey)) var h = a; else if (1 == a.length && b.shiftKey && b.ctrlKey) {
                        if ("V" != b.key) {
                            b.preventDefault();
                            return;
                        }
                    } else h = term._evaluateKeyEscapeSequence(b).key;
                    transport.settings.localEcho && transport.settings.parseKey(b);
                    return null === h ? null : transport.expect_key(h);
                }
                if (!(b.altKey || b.ctrlKey || b.metaKey || 1 < a.length && 13 != b.keyCode && 8 != b.keyCode)) switch (b.keyCode) {
                  case 8:
                    void 0 === transport.auth.termPassword ? 0 < transport.auth.termUsername.length && (termBackspace(term), 
                    transport.auth.termUsername = transport.auth.termUsername.slice(0, transport.auth.termUsername.length - 1)) : transport.auth.termPassword = transport.auth.termPassword.slice(0, transport.auth.termPassword.length - 1);
                    break;

                  case 13:
                    void 0 === transport.auth.termPassword ? (term.write("\n\r" + transport.auth.termUsername + "@" + transport.auth.hostname + "'s password:"), 
                    transport.auth.termPassword = "") : (term.write("\n\r"), transport.auth.ssh_connection());
                    break;

                  default:
                    void 0 === transport.auth.termPassword ? (transport.auth.termUsername += a, term.write(a)) : transport.auth.termPassword += a;
                }
            }
        }
    };
    term.textarea.onpaste = function(b) {
        var a;
        window.clipboardData && window.clipboardData.getData ? a = window.clipboardData.getData("Text") : b.clipboardData && b.clipboardData.getData && (a = b.clipboardData.getData("text/plain"));
        if (a) if (1e6 > a.length) if (5e3 < a.length) for (a = splitSlice(a), b = 0; b < a.length; b++) transport.expect_key(a[b]); else transport.expect_key(a); else alert("Error: Pasting large strings is not permitted.");
    };
}

SSHyClient.Transport = function(b, a) {
    this.local_version = "SSH-2.0-SSHyClient";
    this.remote_version = "";
    this.remote_kex_message = this.local_kex_message = null;
    this.preferred_algorithms = "diffie-hellman-group-exchange-sha256,diffie-hellman-group-exchange-sha1,diffie-hellman-group14-sha256,diffie-hellman-group14-sha1,diffie-hellman-group1-sha256,diffie-hellman-group1-sha1 ssh-rsa aes128-ctr hmac-sha2-256,hmac-sha1 none ".split(" ");
    this.preferred_hash = this.preferred_mac = this.preferred_kex = null;
    this.parceler = new SSHyClient.parceler(b, this);
    this.auth = new SSHyClient.auth(this.parceler);
    this.settings = void 0 === a ? new SSHyClient.settings() : a;
    this.lastKey = "";
    this.closing = !1;
};

SSHyClient.Transport.prototype = {
    kex_info: {
        "diffie-hellman-group1-sha1": function(b) {
            return new SSHyClient.kex.DiffieHellman(b, 1, "SHA-1");
        },
        "diffie-hellman-group14-sha1": function(b) {
            return new SSHyClient.kex.DiffieHellman(b, 14, "SHA-1");
        },
        "diffie-hellman-group-exchange-sha1": function(b) {
            return new SSHyClient.kex.DiffieHellman(b, void 0, "SHA-1");
        },
        "diffie-hellman-group1-sha256": function(b) {
            return new SSHyClient.kex.DiffieHellman(b, 1, "SHA-256");
        },
        "diffie-hellman-group14-sha256": function(b) {
            return new SSHyClient.kex.DiffieHellman(b, 14, "SHA-256");
        },
        "diffie-hellman-group-exchange-sha256": function(b) {
            return new SSHyClient.kex.DiffieHellman(b, void 0, "SHA-256");
        }
    },
    mac_info: {
        "hmac-sha1": function(b) {
            b.parceler.hmacSHAVersion = "SHA-1";
            b.preferred_hash = 20;
        },
        "hmac-sha2-256": function(b) {
            b.parceler.hmacSHAVersion = "SHA-256";
            b.preferred_hash = 32;
        }
    },
    handler_table: {
        0: function(b, a) {
            b.parceler.socket.sendB64(b.local_version + "\r\n");
            b.remote_version = a.slice(0, a.length - 2);
            b.send_kex_init();
        },
        1: function(b, a) {
            b.disconnect();
        },
        2: function(b, a) {},
        3: function(b, a) {},
        6: function(b, a) {
            "ssh-userauth" == new SSHyClient.Message(a.slice(1)).get_string() && b.auth.ssh_connection();
        },
        20: function(b, a) {
            b.parse_kex_reply(a);
            b.remote_kex_message = a;
            b.preferred_kex.start();
        },
        21: function(b) {
            b.activate_encryption();
        },
        31: function(b, a) {
            b.preferred_kex.parse_reply(31, a.slice(1));
        },
        33: function(b, a) {
            b.preferred_kex.parse_reply(33, a.slice(1));
        },
        51: function(b, a) {
            b.auth.awaitingAuthentication = !1;
            b.auth.authFailure();
        },
        52: function(b, a) {
            b.auth.authenticated = !0;
            b.auth.awaitingAuthentication = !1;
            b.auth.auth_success(!0);
        },
        80: function(b, a) {},
        91: function(b, a) {
            b.auth.channelOpened = !0;
            resize();
            b.auth.mod_pty("pty-req", term.cols, term.rows, "xterm");
        },
        93: function(b, a) {},
        94: function(b, a) {
            a = a.slice(9);
            if (b.settings.localEcho && (b.settings.testShell(a), b.settings.parseLocalEcho(a), 
            b.lastKey)) {
                if (a == b.lastKey.substring(0, 1)) {
                    b.lastKey = b.lastKey.slice(1);
                    return;
                }
                b.lastKey = b.lastKey.slice(1);
                term.write("\b");
            }
            term.write(fromUtf8(a));
        },
        96: function(b, a) {},
        97: function(b, a) {
            b.disconnect();
        },
        98: function(b, a) {}
    },
    winAdjust: function() {
        var b = new SSHyClient.Message();
        b.add_bytes(String.fromCharCode(SSHyClient.MSG_CHANNEL_WINDOW_ADJUST));
        b.add_int(0);
        b.add_int(SSHyClient.WINDOW_SIZE);
        this.send_packet(b.toString());
        this.parceler.windowSize = SSHyClient.WINDOW_SIZE;
    },
    disconnect: function(b) {
        this.closing = !0;
        b = void 0 === b ? 11 : b;
        var a = new SSHyClient.Message();
        a.add_bytes(String.fromCharCode(SSHyClient.MSG_DISCONNECT));
        a.add_int(b);
        this.send_packet(a.toString());
        ws.close();
        term.write("\r\nConnection to " + this.auth.hostname + " closed. Code - " + b);
    },
    keepAlive: function() {
        if (3 !== ws.readyState) {
            var b = new SSHyClient.Message();
            b.add_bytes(String.fromCharCode(SSHyClient.MSG_IGNORE));
            b.add_string("");
            transport.send_packet(b.toString());
        }
    },
    cut_padding: function(b) {
        return b.substring(1, b.length - b[0].charCodeAt(0));
    },
    send_packet: function(b) {
        this.parceler.send(b);
    },
    send_kex_init: function() {
        var b = new SSHyClient.Message();
        b.add_bytes(String.fromCharCode(SSHyClient.MSG_KEX_INIT));
        b.add_bytes(read_rng(16));
        b.add_string(this.preferred_algorithms[0]);
        b.add_string(this.preferred_algorithms[1]);
        for (var a = 2; 6 > a; a++) b.add_string(this.preferred_algorithms[a]), b.add_string(this.preferred_algorithms[a]);
        b.add_boolean(!1);
        b.add_int(0);
        this.local_kex_message = b = b.toString();
        this.send_packet(b);
    },
    parse_kex_reply: function(b) {
        b = new SSHyClient.Message(b);
        b.get_bytes(17);
        var a = filter(this.preferred_algorithms[0], b.get_string().split(",")), h = filter(this.preferred_algorithms[1], b.get_string().split(","));
        b.get_string();
        var d = filter(this.preferred_algorithms[2], b.get_string().split(","));
        b.get_string();
        b = filter(this.preferred_algorithms[3], b.get_string().split(","));
        if (!(a && h && d && b)) throw "Chosen Algs = kex=" + a + ", keys=" + h + ", cipher=" + d + ", mac=" + b;
        this.preferred_kex = this.kex_info[a](this);
        this.preferred_mac = this.mac_info[b](this);
    },
    generate_key: function(b, a) {
        var h = new SSHyClient.Message();
        h.add_mpint(SSHyClient.kex.K);
        h.add_bytes(SSHyClient.kex.H);
        h.add_bytes(b);
        h.add_bytes(SSHyClient.kex.sessionId);
        return "SHA-1" == this.preferred_kex.SHAVersion ? new SSHyClient.hash.SHA1(h.toString()).digest().substring(0, a) : new SSHyClient.hash.SHA256(h.toString()).digest().substring(0, a);
    },
    activate_encryption: function() {
        this.parceler.block_size = 16;
        this.parceler.macSize = this.preferred_hash;
        this.parceler.outbound_enc_iv = this.generate_key("A", this.parceler.block_size, this.preferred_kex.SHAVersion);
        this.parceler.outbound_enc_key = this.generate_key("C", this.parceler.block_size, this.preferred_kex.SHAVersion);
        this.parceler.outbound_mac_key = this.generate_key("E", this.parceler.macSize, this.preferred_kex.SHAVersion);
        this.parceler.outbound_cipher = new SSHyClient.crypto.AES(this.parceler.outbound_enc_key, SSHyClient.AES_CTR, this.parceler.outbound_enc_iv, new SSHyClient.crypto.counter(8 * this.parceler.block_size, inflate_long(this.parceler.outbound_enc_iv)));
        this.parceler.inbound_enc_iv = this.generate_key("B", this.parceler.block_size, this.preferred_kex.SHAVersion);
        this.parceler.inbound_enc_key = this.generate_key("D", this.parceler.block_size, this.preferred_kex.SHAVersion);
        this.parceler.inbound_mac_key = this.generate_key("F", this.parceler.macSize, this.preferred_kex.SHAVersion);
        this.parceler.inbound_cipher = new SSHyClient.crypto.AES(this.parceler.inbound_enc_key, SSHyClient.AES_CTR, this.parceler.inbound_enc_iv, new SSHyClient.crypto.counter(8 * this.parceler.block_size, inflate_long(this.parceler.inbound_enc_iv)));
        this.parceler.encrypting = !0;
        this.auth.request_auth();
    },
    handle_dec: function(b) {
        b = this.cut_padding(b);
        try {
            this.handler_table[b.substring(0, 1).charCodeAt(0)](this, b);
        } catch (a) {
            console.log(a), console.log("Error! code - " + b.substring(0, 1).charCodeAt(0) + " does not exist!");
        }
    },
    str_to_bytes: function(b) {
        return unescape(encodeURIComponent(b));
    },
    expect_key: function(b) {
        if (b) {
            var a = new SSHyClient.Message();
            a.add_bytes(String.fromCharCode(SSHyClient.MSG_CHANNEL_DATA));
            a.add_int(0);
            a.add_string(this.str_to_bytes(b.toString()));
            this.parceler.send(a);
        }
    },
    send_new_keys: function(b) {
        b = new SSHyClient.Message();
        b.add_bytes(String.fromCharCode(SSHyClient.MSG_NEW_KEYS));
        this.send_packet(b);
    }
};