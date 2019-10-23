"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1() {
    function n(n) {
        return ((n = n || Object.create(null)),
            {
                on: function (e, t) {
                    (n[e] || (n[e] = [])).push(t);
                },
                off: function (e, t) {
                    if (!t)
                        n[e] && (n[e].length = 0);
                    n[e] && n[e].splice(n[e].indexOf(t) >>> 0, 1);
                },
                emit: function (e, t) {
                    (n[e] || []).slice().map(function (n) {
                        n(t);
                    }),
                        (n["*"] || []).slice().map(function (n) {
                            n(e, t);
                        });
                }
            });
    }
    return n;
}
exports.default = default_1;
