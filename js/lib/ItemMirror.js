/*
 XooML.js - Version 0.8.0

 Copyright 2013, William Paul Jones and the Keeping Found Things Found team.

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to copy,
 distribute, run, display, perform, and modify the Software for purposes of
 academic, research, and personal use, subject to the following conditions: The
 above copyright notice and this permission notice shall be included in all copies
 or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS",
 WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
 OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE. For commercial permissions, contact williampauljones@gmail.com
*/
define("XooMLExceptions.js", [], function () {
    "use strict";
    return {
        notImplemented: "NotImplementedException",
        missingParameter: "MissingParameterException",
        nullArgument: "NullArgumentException",
        invalidType: "InvalidTypeException",
        invalidState: "InvalidStateArgument",
        xooMLUException: "XooMLUException",
        itemUException: "ItemUException",
        nonUpgradeableAssociationException: "NonUpgradeableAssociationException",
        invalidArgument: "InvalidOptionsException",
        itemAlreadyExists: "ItemAlreadyExistsException",
        itemMirrorNotCurrent: "ItemMirrorNotCurrent"
    }
}), define("XooMLConfig.js", [], function () {
    "use strict";
    return {
        schemaVersion: "0.54",
        schemaLocation: "http://kftf.ischool.washington.edu/xmlns/xooml",
        xooMLFragmentFileName: "XooML2.xml",
        maxFileLength: 50,
        createAssociationSimple: {
            displayText: !0
        },
        createAssociationLinkNonGrouping: {
            displayText: !0,
            itemURI: !0,
            localItemRequested: !1
        },
        createAssociationLinkGrouping: {
            displayText: !0,
            groupingItemURI: !0,
            xooMLDriverURI: !0
        },
        createAssociationCreate: {
            displayText: !0,
            itemName: !0,
            isGroupingItem: !0
        }
    }
}), define("XooMLUtil.js", ["./XooMLExceptions.js", "./XooMLConfig.js"], function (t) {
    "use strict";
    var e = {
        "[object Boolean]": "boolean",
        "[object Number]": "number",
        "[object String]": "string",
        "[object Function]": "function",
        "[object Array]": "array",
        "[object Date]": "date",
        "[object RegExp]": "regexp",
        "[object Object]": "object",
        "[object Error]": "error"
    },
        i = {
            hasOptions: function (e, n) {
                if (!e || !n) throw t.nullArgument;
                if (!i.isObject(e) || !i.isObject(n)) throw t.invalidType;
                var r, o, a;
                if (a = 0, !(Object.keys(n).length <= Object.keys(e).length)) return !1;
                for (r in e) if (e.hasOwnProperty(r) && (o = e[r], !n.hasOwnProperty(r))) {
                    if (o) return !1;
                    a += 1
                }
                return Object.keys(n).length <= Object.keys(e).length - a
            },
            checkCallback: function (e) {
                if (!e) throw t.nullArgument;
                if (!i.isFunction(e)) throw t.invalidType
            },
            isGUID: function (t) {
                return "string" === i.getType(t) ? !0 : !1
            },
            isArray: function (t) {
                return "array" === i.getType(t)
            },
            isObject: function (t) {
                return "object" === i.getType(t)
            },
            isFunction: function (t) {
                return null !== t
            },
            isString: function (t) {
                return "string" === i.getType(t)
            },
            isBoolean: function (t) {
                return "boolean" === i.getType(t)
            },
            generateGUID: function () {
                return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (t) {
                    var e = 0 | 16 * Math.random(),
                        i = "x" == t ? e : 8 | 3 & e;
                    return i.toString(16)
                })
            },
            getType: function (t) {
                return null == t ? String(t) : "object" == typeof t || "function" == typeof t ? e[t.toString()] || "object" : typeof t
            },
            endsWith: function (t, e) {
                return -1 !== t.indexOf(e, t.length - e.length)
            },
            clone: function (e) {
                if (null == e || "object" != typeof e) return e;
                if (e instanceof Date) {
                    var n = new Date;
                    return n.setTime(e.getTime()), n
                }
                if (e instanceof Array) {
                    for (var n = [], r = 0, o = e.length; o > r; r++) n[r] = i.clone(e[r]);
                    return n
                }
                if (e instanceof Object) {
                    var n = {};
                    for (var a in e) e.hasOwnProperty(a) && (n[a] = i.clone(e[a]));
                    return n
                }
                throw t.invalidType
            }
        };
    return i
}), define("PathDriver.js", ["./XooMLExceptions.js", "./XooMLConfig.js", "./XooMLUtil.js"], function (t, e, i) {
    "use strict";

    function n() {}
    var r, o = "/";
    return r = n.prototype, r.joinPath = function (t, e) {
        var i = this;
        return t === o ? e : (t = i._stripTrailingSlash(t), e = i._stripLeadingSlash(e), t + o + e)
    }, r.joinPathArray = function () {
        throw t.notImplemented
    }, r.splitPath = function (t) {
        return t.split(o)
    }, r.formatPath = function (t) {
        return r._stripTrailingSlash(t)
    }, r.isRoot = function (t) {
        return t === o
    }, r.getPathSeparator = function () {
        return o
    }, r._stripTrailingSlash = function (t) {
        var e;
        return t === o ? t : (e = t, i.endsWith(e, o) && (e = e.substring(0, e.length - 1)), e)
    }, r._stripLeadingSlash = function (t) {
        var e;
        return t === o ? t : (e = t, 0 === t.indexOf(o) && (e = e.substring(1)), e)
    }, new n
}), define("XooMLAssociation.js", ["./XooMLExceptions.js", "./XooMLConfig.js", "./XooMLUtil.js"], function (t, e, i) {
    "use strict";

    function n(e, n) {
        if (!i.isBoolean(e) || !i.isString(n)) throw t.invalidType;
        this._isGroupingItem = e, this._displayText = n
    }
    var r;
    return r = n.prototype, r.getIsGroupingItem = function () {
        return this._isGroupingItem
    }, r.getDisplayText = function () {
        return this._displayText
    }, n
}), define("FragmentDriver.js", ["./XooMLExceptions.js", "./XooMLConfig.js", "./XooMLUtil.js", "./PathDriver.js", "./XooMLAssociation.js"], function (t, e, i, n) {
    "use strict";

    function r(e, n) {
        if (i.checkCallback(n), !e) return n(t.nullArgument);
        if (!i.isObject(e)) return n(t.invalidType);
        var r = this;
        return i.hasOptions(M, e) ? (r._document = r._parseXML(e.xooMLFragmentString), n(!1, r)) : i.hasOptions(U, e) ? (r._document = r._createXooMLFragment(e.associations, e.xooMLUtilityURI, e.itemUtilityURI, e.syncUtilityURI, e.groupingItemURI), n(!1, r)) : n(t.missingParameter)
    }
    var o, a = "xmlns",
        s = "fragment",
        u = "fragmentNamespaceData",
        c = "schemaVersion",
        m = "schemaLocation",
        l = "itemDescribed",
        g = ".",
        f = "itemDriver",
        v = "syncDriver",
        p = "xooMLDriver",
        h = "GUIDGeneratedOnLastWrite",
        _ = "association",
        d = "associationNamespaceData",
        A = "ID",
        I = "displayText",
        D = "associatedXooMLFragment",
        b = "associatedXooMLDriver",
        x = "associatedItem",
        L = "localItem",
        y = "http://www.w3.org/2001/XMLSchema-instance",
        N = "",
        M = {
            xooMLFragmentString: !0
        },
        U = {
            associations: !0,
            xooMLUtilityURI: !0,
            itemUtilityURI: !0,
            syncUtilityURI: !0,
            groupingItemURI: !0
        };
    return o = r.prototype, o.updateETag = function (t) {
        var e, n = this;
        return e = i.generateGUID(), n._document.getElementsByTagName(s)[0].getAttribute(h), t(!1, e)
    }, o.getSchemaVersion = function (t) {
        var e = this;
        e._getAttribute(c, s, null, null, t)
    }, o.setSchemaVersion = function (t, e) {
        var i = this;
        i._setAttribute(c, t, s, null, null, e)
    }, o.getSchemaLocation = function (t) {
        var e = this;
        e._getAttribute(m, s, null, null, t)
    }, o.setSchemaLocation = function (t, e) {
        var i = this;
        i._setAttribute(m, t, s, null, null, e)
    }, o.getItemDescribed = function (t) {
        var e = this;
        e._getAttribute(l, s, null, null, t)
    }, o.setItemDescribed = function (t, e) {
        var i = this;
        i._setAttribute(l, t, s, null, null, e)
    }, o.getItemDriver = function (t) {
        var e = this;
        e._getAttribute(f, s, null, null, t)
    }, o.setItemUtility = function (t, e) {
        var i = this;
        i._setAttribute(f, t, s, null, null, e)
    }, o.getSyncDriver = function (t) {
        var e = this;
        e._getAttribute(v, s, null, null, t)
    }, o.setSyncUtility = function (t, e) {
        var i = this;
        i._setAttribute(v, t, s, null, null, e)
    }, o.getXooMLDriver = function (t) {
        var e = this;
        e._getAttribute(p, s, null, null, t)
    }, o.setXooMLUtility = function (t, e) {
        var i = this;
        i._setAttribute(p, t, s, null, null, e)
    }, o.getGUIDGeneratedOnLastWrite = function (t) {
        var e = this;
        e._getAttribute(h, s, null, null, t)
    }, o.listFragmentCommonAttributes = function (t) {
        var e = this;
        e._listAttributes(s, null, null, t)
    }, o.getAssociationDisplayText = function (t, e) {
        var i = this;
        i._getAttribute(I, _, null, t, e)
    }, o.setAssociationDisplayText = function (t, e, i) {
        var n = this;
        n._setAttribute(I, e, A, null, t, i)
    }, o.getAssociationAssociatedXooMLFragment = function (t, e) {
        var i = this;
        i._getAttribute(D, _, null, t, e)
    }, o.setAssociationAssociatedXooMLFragment = function (t, e, i) {
        var n = this;
        n._setAttribute(D, e, A, null, t, i)
    }, o.getAssociationXooMLUtility = function (t, e) {
        var i = this;
        i._getAttribute(b, _, null, t, e)
    }, o.setAssociationXooMLUtility = function (t, e, i) {
        var n = this;
        n._setAttribute(b, e, A, null, t, i)
    }, o.getAssociationLocalItem = function (t, e) {
        var i = this;
        i._getAttribute(L, _, null, t, e)
    }, o.setAssociationLocalItem = function (t, e, i) {
        var n = this;
        return n._setAttribute(L, e, A, null, t, i)
    }, o.getAssociationAssociatedItem = function (t, e) {
        var i = this;
        i._getAttribute(x, _, null, t, e)
    }, o.setAssociationAssociatedItem = function (t, e, i) {
        var n = this;
        return n._setAttribute(x, e, A, null, t, i)
    }, o.listAssociationCommonAttributes = function (t, e) {
        var i = this;
        i._listAttributes(_, null, t, e)
    }, o.getFragmentNamespaceAttribute = function (t, e, i) {
        var n = this;
        n._getAttribute(t, u, e, null, i)
    }, o.addFragmentNamespaceAttribute = function (t, e, i) {
        var n = this;
        return n._addAttribute(t, u, e, null, i)
    }, o.removeFragmentNamespaceAttribute = function (t, e, i) {
        var n = this;
        return n._removeAttribute(t, u, e, null, i)
    }, o.hasFragmentNamespace = function (t, e) {
        var i = this;
        i._hasNamespace(null, t, e)
    }, o.setFragmentNamespaceAttribute = function (t, e, i, n) {
        var r = this;
        return r._setAttribute(t, e, u, i, null, n)
    }, o.listFragmentNamespaceAttributes = function (t, e) {
        var i = this;
        i._listAttributes(u, t, null, e)
    }, o.getFragmentNamespaceData = function (t, e) {
        var i = this;
        i._getNamespaceData(s, t, null, e)
    }, o.setFragmentNamespaceData = function (t, e, i) {
        var n = this;
        n._setNamespaceData(s, e, null, t, i)
    }, o.createAssociation = function (n, r) {
        if (i.checkCallback(r), !n) return r(t.nullArgument);
        if (!i.isObject(n)) return r(t.invalidType);
        var o, a, s, u, c, m = this;
        return m._updateFragment(m._document), o = i.generateGUID(), s = i.hasOptions(e.createAssociationSimple, n), a = i.hasOptions(e.createAssociationLinkNonGrouping, n), u = i.hasOptions(e.createAssociationLinkGrouping, n), c = i.hasOptions(e.createAssociationCreate, n), s ? m._createAssociation(o, null, n.displayText, null, null, null, r) : a ? m._createAssociationLinkNonGrouping(o, n, r) : u ? m._createAssociationLinkGrouping(o, n, r) : c ? m._createAssociationCreate(o, n, r) : r(t.missingParameter)
    }, o.deleteAssociation = function (e, n) {
        if (i.checkCallback(n), !e) return n(t.nullArgument);
        if (!i.isGUID(e)) return n(t.invalidType);
        var r, o, a, s = this;
        for (o = s._document.getElementsByTagName(_), a = 0; a < o.length; a += 1) if (r = o[a], r.getAttribute(A) === e) return r.parentNode.removeChild(r), n(!1);
        return n(t.invalidArgument)
    }, o.listAssociations = function (t) {
        i.checkCallback(t);
        var e, n, r, o, a, s = this;
        for (e = [], n = s._document.getElementsByTagName(_), o = 0; o < n.length; o += 1) r = n[o], a = r.getAttribute(A), e.push(a);
        return t(!1, e)
    }, o.getAssociationNamespaceAttribute = function (t, e, i, n) {
        var r = this;
        r._getAttribute(t, d, i, e, n)
    }, o.addAssociationNamespaceAttribute = function (t, e, i, n) {
        var r = this;
        r._addAttribute(t, d, i, e, n)
    }, o.removeAssociationNamespaceAttribute = function (t, e, i, n) {
        var r = this;
        return r._removeAttribute(t, d, i, e, n)
    }, o.setAssociationNamespaceAttribute = function (t, e, i, n, r) {
        var o = this;
        return o._setAttribute(t, e, d, n, i, r)
    }, o.hasAssociationNamespace = function (t, e, i) {
        var n = this;
        n._hasNamespace(t, e, i)
    }, o.listAssociationNamespaceAttributes = function (t, e, i) {
        var n = this;
        n._listAttributes(d, e, t, i)
    }, o.getAssociationNamespaceData = function (t, e, i) {
        var n = this;
        n._getNamespaceData(d, e, t, i)
    }, o.setAssociationNamespaceData = function (t, e, i, n) {
        var r = this;
        r._setNamespaceData(d, i, e, t, n)
    }, o.toString = function (t) {
        i.checkCallback(t);
        var e, n = this;
        e = document.createElement("div"), e.appendChild(n._document.firstChild.cloneNode(!0)), t(!1, e.innerHTML)
    }, o._parseXML = function (t) {
        var e, i;
        return window.DOMParser ? (e = new DOMParser, i = e.parseFromString(t, "text/xml")) : (i = new ActiveXObject("Microsoft.XMLDOM"), i.async = !1, i.loadXML(t)), i
    }, o._createXooMLFragment = function (t, r, o, a) {
        var u, _, d, A, I, D, b = this;
        for (_ = b._parseXML("<" + s + "></" + s + ">"), u = _.firstChild, u.setAttribute("xmlns", e.schemaLocation), u.setAttribute("xmlns:xsi", y), u.setAttribute(f, o), u.setAttribute(p, r), u.setAttribute(v, a), u.setAttribute(l, g), u.setAttribute(m, e.schemaLocation), u.setAttribute(c, e.schemaVersion), u.setAttribute(h, i.generateGUID()), d = 0; d < t.length; d += 1) A = t[d], I = i.generateGUID(), D = A.getIsGroupingItem() ? n.joinPath(A.getDisplayText(), e.xooMLFragmentFileName) : null, b._createAssociation(I, D, A.getDisplayText(), A.getDisplayText(), A.getDisplayText(), u);
        return _
    }, o._createAssociation = function (t, e, i, n, r, o, a) {
        var s, u, c = this;
        return u = o || c._document.firstChild, r = r || "", n = n || "", e = e || "", s = c._parseXML("<" + _ + "/>").firstChild, s.setAttribute(A, t), s.setAttribute(x, n), s.setAttribute(I, i), s.setAttribute(L, r), s.setAttribute(D, e), s.setAttribute(b, ""), u.appendChild(s.cloneNode(!0)), a ? a(!1, t) : void 0
    }, o._createAssociationLinkNonGrouping = function (e, i, n) {
        var r = this;
        return i.localItemRequested ? n(t.notImplemented) : r._createAssociation(e, null, i.displayText, i.itemURI, null, null, n)
    }, o._createAssociationLinkGrouping = function (e, i, n) {
        return n(t.notImplemented)
    }, o._createAssociationCreate = function (t, e, i) {
        var n = this;
        e.isGroupingItem ? n._createAssociation(t, null, e.displayText, e.itemName, e.itemName, null, i) : n._createAssociation(t, null, e.displayText, e.itemName, e.itemName, null, i)
    }, o._updateFragment = function (t) {
        return t.getElementsByTagName(s)[0].getAttribute(h)
    }, o._getOrCreateElement = function (e, n, r, o) {
        if (!e) return o(t.nullArgument);
        if (r && !i.isGUID(r) || n && !i.isString(n) || !i.isString(e)) return o(t.invalidType);
        var a = this;
        return null !== r ? a._getAssociation(a._document, r, n, !0) : a._getFragment(a._document, n, !0)
    }, o._getFragment = function (t, e, i) {
        var n, r, o;
        if (!e) return t.firstChild;
        for (i = i || !0, n = t.getElementsByTagName(u), o = 0; o < n.length; o += 1) if (r = n[o], e === r.getAttribute(a)) return r;
        return i ? (r = t.createElement(u), r.setAttribute(a, e), t.getElementsByTagName(s)[0].appendChild(r), r) : null
    }, o._getAssociation = function (t, e, i, n) {
        var r, o, s, u, c, m, l = this;
        for (n = n || !0, r = t.getElementsByTagName(_), c = 0; c < r.length; c += 1) if (o = r[c], o.getAttribute(A) === e) {
            if (!i) return o;
            for (s = t.getElementsByTagName(d), m = 0; m < s.length; m += 1) if (u = s[m], u.getAttribute(a) === i && u.parentNode.getAttribute(A) == e) return u;
            return n ? l._createNewNamespaceData(t, o, d, i) : null
        }
        return n ? l._createNewAssociation(t, e, i) : null
    }, o._createNewNamespaceData = function (t, e, i, n) {
        var r;
        return r = t.createElement(i), r.setAttribute(a, n), e.appendChild(r), r
    }, o._createNewAssociation = function (t, e, i) {
        var n, r, o = this;
        return n = t.createElement(_), n.setAttribute(A, e), i && (r = o._createNewNamespaceData(t, n, d, i)), t.getElementsByTagName(s)[0].appendChild(n), i ? r : n
    }, o._getAttribute = function (t, e, i, n, r) {
        var o = this;
        o._retrieveAttribute(t, e, i, n, function (e, i) {
            if (e) throw e;
            return r(!1, i.getAttribute(t))
        })
    }, o._setAttribute = function (t, e, i, n, r, o) {
        var a = this;
        a._retrieveAttribute(t, i, n, r, function (i, n) {
            if (i) throw i;
            n.setAttribute(t, e), a._updateFragment(a._document), o(!1)
        })
    }, o._addAttribute = function (e, i, n, r, o) {
        var a = this;
        a._retrieveAttribute(e, i, n, r, function (i, n) {
            if (i) throw i;
            return n.getAttribute(e) ? o(t.invalidState) : (n.setAttribute(e, N), a._updateFragment(a._document), o(!1), void 0)
        })
    }, o._removeAttribute = function (e, i, n, r, o) {
        var a = this;
        a._retrieveAttribute(e, i, n, r, function (i, n) {
            return i ? o(i) : n.getAttribute(e) ? (n.removeAttribute(e), a._updateFragment(a._document), o(!1), void 0) : o(t.invalidState)
        })
    }, o._retrieveAttribute = function (e, n, r, o, a) {
        if (i.checkCallback(a), !e) return a(t.nullArgument);
        if (!i.isString(e)) return a(t.invalidType);
        var s, u = this;
        return s = u._getOrCreateElement(n, r, o, a), a(!1, s)
    }, o._listAttributes = function (t, e, n, r) {
        i.checkCallback(r);
        var o, a, s, u, c = this;
        for (o = c._getOrCreateElement(t, e, n, r), a = [], s = 0; s < o.attributes.length; s += 1) u = o.attributes[s], a.push(u.name);
        return r(!1, a)
    }, o._getNamespaceData = function (t, e, i, n) {
        var r, o = this;
        return r = o._getOrCreateElement(t, e, i, n), n(!1, r.innerHTML)
    }, o._setNamespaceData = function (e, n, r, o, a) {
        if (i.checkCallback(a), !o) return a(t.nullArgument);
        if (!i.isString(o)) return a(t.invalidType);
        var s, u = this;
        s = u._getOrCreateElement(e, n, r, a), s.innerHTML = o, a(!1)
    }, o._hasNamespace = function (e, n, r) {
        if (i.checkCallback(r), !n) return r(t.nullArgument);
        if (e && !i.isGUID(e)) return r(t.invalidType);
        var o, a = this;
        return o = e ? a._getAssociation(a._document, e, n, !1) : a._getFragment(a._document, n, !1), r(!1, null !== o)
    }, r
}), define("ItemDriver.js", ["./XooMLExceptions.js", "./XooMLConfig.js", "./XooMLUtil.js", "./XooMLAssociation.js"], function (t, e, i, n) {
    "use strict";

    function r(e, n) {
        if (i.checkCallback(n), !i.isObject(e)) return n(t.invalidType);
        if (!i.isFunction(n)) return n(t.invalidType);
        if (!i.hasOptions(a, e)) return n(t.missingParameter);
        var r = this;
        r._dropboxClient = e.dropboxClient, r._checkDropboxAuthenticated(r._dropboxClient) ? n(!1, r) : r._dropboxClient.authenticate(function (e) {
            return e ? n(t.itemUException, null) : n(!1, r)
        })
    }
    var o, a = {
        driverURI: !0,
        dropboxClient: !0
    },
        s = "inode/directory";
    return o = r.prototype, o.moveGroupingItem = function (t, e, i) {
        var n = this;
        n._dropboxClient.move(t, e, function (t) {
            return t ? i(t) : i(!1)
        })
    }, o.isGroupingItem = function (t, e) {
        var i = this;
        i._dropboxClient.stat(t, function (t, n) {
            return t ? i._showDropboxError(t, e) : e(!1, n.mimeType === s)
        })
    }, o.createGroupingItem = function (t, e) {
        var i = this;
        i._dropboxClient.mkdir(t, function (t, n) {
            return t ? i._showDropboxError(t, e) : e(!1, n)
        })
    }, o.createNonGroupingItem = function (t, e, i) {
        var n = this;
        n._dropboxClient.writeFile(t, e, function (t, e) {
            return t ? n._showDropboxError(t, i) : i(!1, e)
        })
    }, o.deleteGroupingItem = function (t, e) {
        var i = this;
        i._dropboxClient.remove(t, function (t, n) {
            return t ? i._showDropboxError(t, e) : e(!1, n)
        })
    }, o.deleteNonGroupingItem = function (t, e) {
        var i = this;
        i._dropboxClient.remove(t, function (t, n) {
            return t ? i._showDropboxError(t, e) : e(!1, n)
        })
    }, o.listItems = function (t, i) {
        var r = this;
        r._dropboxClient.readdir(t, function (t, o, a, u) {
            if (t) return r._showDropboxError(t, i);
            var c, m;
            for (m = [], c = 0; c < u.length; c += 1) u[c].name !== e.xooMLFragmentFileName && m.push(new n(u[c].mimeType === s, u[c].name));
            return i(!1, m)
        })
    }, o.checkExisted = function (t, e) {
        var i, n = this;
        n._dropboxClient.stat(t, function (t, r) {
            return t ? n._showDropboxError(t, e) : (i = !(null !== t && 404 === t.status) || null === t && r.isRemoved, e(!1, i))
        })
    }, o._showDropboxError = function (t, e) {
        return e(t.status)
    }, o._checkDropboxAuthenticated = function (t) {
        return 4 === t.authState
    }, r
}), define("XooMLDriver.js", ["./XooMLExceptions.js", "./XooMLConfig.js", "./XooMLUtil.js"], function (t, e, i) {
    "use strict";

    function n(e, n) {
        if (i.checkCallback(n), !i.hasOptions(o, e)) return n(t.missingParameter);
        if (!i.isObject(e)) return n(t.invalidType);
        var r = this;
        return r._dropboxClient = e.dropboxClient, r._checkDropboxAuthenticated(r._dropboxClient) ? n(!1, r) : (r._dropboxClient.authenticate(function (e) {
            return e ? n(t.xooMLUException, null) : n(!1, r)
        }), void 0)
    }
    var r, o = {
        driverURI: !0,
        dropboxClient: !0
    };
    return r = n.prototype, r.getXooMLFragment = function (t, e) {
        var i = this;
        i._dropboxClient.readFile(t, function (t, n) {
            return t ? i._showDropboxError(t, e) : (e(!1, n), void 0)
        })
    }, r.setXooMLFragment = function (t, e, i) {
        var n = this;
        n._dropboxClient.writeFile(t, e, function (t, e) {
            return t ? n._showDropboxError(t, i) : (i(!1, e), void 0)
        })
    }, r.checkExisted = function (t, e) {
        var i, n = this;
        n._dropboxClient.stat(t, function (t, r) {
            return t ? n._showDropboxError(t, e) : (i = null !== t && 404 === t.status || null === t && r.isRemoved === !0 ? !1 : !0, e(!1, i), void 0)
        })
    }, r._showDropboxError = function (t, e) {
        return e(t.status)
    }, r._checkDropboxAuthenticated = function (t) {
        return 4 === t.authState
    }, n
}), define("SyncDriver.js", ["./XooMLExceptions.js", "./XooMLConfig.js", "./XooMLUtil.js"], function () {
    "use strict";

    function t(t) {
        var e = this;
        e._itemMirror = t, e._fragmentDriver = t._fragmentDriver, e._itemDriver = t._itemDriver
    }
    var e;
    return e = t.prototype, e.sync = function (t) {
        var e, i, n = this,
            r = [];
        n._fragmentDriver.listAssociations(function (o, a) {
            return o ? t(o) : (e = a, n._itemMirror.getGroupingItemURI(function (o, a) {
                return o ? t(o) : (n._itemDriver.listItems(a, function (o, a) {
                    return o ? t(o) : (i = a, n._getLocalItems(e, i, r, 0, t), void 0)
                }), void 0)
            }), void 0)
        })
    }, e._getLocalItems = function (t, e, i, n, r) {
        var o = this;
        0 === t.length ? o._removeNonLocalItems(t, e, i, 0, r) : o._itemMirror.getAssociationLocalItem(t[n], function (a, s) {
            return a ? r(a) : (i.push(s), n++, n < t.length ? o._getLocalItems(t, e, i, n, r) : o._removeNonLocalItems(t, e, i, 0, r), void 0)
        })
    }, e._removeNonLocalItems = function (t, e, i, n, r) {
        var o = this;
        if (void 0 !== i[n] && null !== i[n] && "" !== i[n]) {
            for (var a = 0, s = 0; s < e.length; s++) if (i[n] === e[s].getDisplayText()) {
                e.splice(s, 1), a = 1;
                break
            }
            0 === a ? (console.log("Sync Remove: " + i[n]), o._fragmentDriver.deleteAssociation(t[n], function (a) {
                return a ? r(a) : (n++, n < i.length ? o._removeNonLocalItems(t, e, i, n, r) : o._createNewLocalItems(t, e, i, 0, r), void 0)
            })) : (n++, n < i.length ? o._removeNonLocalItems(t, e, i, n, r) : o._createNewLocalItems(t, e, i, 0, r))
        } else n++, n < i.length ? o._removeNonLocalItems(t, e, i, n, r) : o._createNewLocalItems(t, e, i, 0, r)
    }, e._createNewLocalItems = function (t, e, i, n, r) {
        var o = this;
        0 === e.length ? o._itemMirror._save(r) : (console.log("Sync Create: " + e[n].getDisplayText()), o._fragmentDriver.createAssociation({
            displayText: e[n].getDisplayText(),
            isGroupingItem: e[n].getIsGroupingItem(),
            itemName: e[n].getDisplayText()
        }, function (a) {
            return a ? r(a) : (n++, n < e.length ? o._createNewLocalItems(t, e, i, n, r) : o._itemMirror._save(r), void 0)
        }))
    }, t
}), define("ItemMirror", ["./XooMLExceptions.js", "./XooMLConfig.js", "./XooMLUtil.js", "./PathDriver.js", "./FragmentDriver.js", "./ItemDriver.js", "./XooMLDriver.js", "./SyncDriver.js"], function (t, e, i, n, r, o, a, s) {
    "use strict";

    function u(r, o) {
        if (i.checkCallback(o), !r) return o(t.nullArgument);
        if (!i.isObject(r)) return o(t.invalidType);
        if (!i.hasOptions(l, r) && !i.hasOptions(m, r)) return o(t.missingParameter);
        var s, u = this;
        u._xooMLDriver = null, u._itemDriver = null, u._syncDriver = null, u._fragmentDriver = null, u._parent = r.parent, u._groupingItemURI = n.formatPath(r.groupingItemURI), u._newItemMirrorOptions = r, s = n.joinPath(u._groupingItemURI, e.xooMLFragmentFileName), new a(r.xooMLDriver, function (t, e) {
            u._xooMLDriver = e, u._getItemU(s, r, function (t) {
                return t ? o(t) : (u._save(function (t) {
                    return t ? o(t) : (u._newItemMirrorOptions.hasOwnProperty("syncDriver") || (u._newItemMirrorOptions.syncDriver = {
                        utilityURI: "MirrorSyncUtility"
                    }), u._newItemMirrorOptions.groupingItemURI = null, o(!1, u))
                }), void 0)
            })
        })
    }
    var c, m = {
        groupingItemURI: !0,
        xooMLDriver: !0,
        itemDriver: !0,
        parent: !1
    },
        l = {
            groupingItemURI: !0,
            xooMLDriver: !0,
            itemDriver: !0,
            syncDriver: !0,
            readIfExists: !0,
            parent: !1
        },
        g = {
            GUID: !0,
            localItemURI: !1
        };
    return c = u.prototype, c.getGroupingItemURI = function (t) {
        var e = this;
        return t(!1, e._groupingItemURI)
    }, c.getDisplayName = function (t) {
        var e, i = this;
        return n.isRoot(i._groupingItemURI) ? e = "" : (e = n.formatPath(i._groupingItemURI), e = n.splitPath(e), e = e[e.length - 1]), t(!1, e)
    }, c.getSchemaVersion = function (t) {
        var e = this;
        e._fragmentDriver.getSchemaVersion(t)
    }, c.getSchemaLocation = function (t) {
        var e = this;
        e._fragmentDriver.getSchemaLocation(t)
    }, c.getItemDescribed = function (t) {
        var e = this;
        e._fragmentDriver.getItemDescribed(t)
    }, c.getItemDriver = function (t) {
        var e = this;
        e._fragmentDriver.getItemDriver(t)
    }, c.getSyncDriver = function (t) {
        var e = this;
        e._fragmentDriver.getSyncDriver(t)
    }, c.getXooMLDriver = function (t) {
        var e = this;
        e._fragmentDriver.getXooMLDriver(t)
    }, c.getGUIDGeneratedOnLastWrite = function (t) {
        var e = this;
        e._fragmentDriver.getGUIDGeneratedOnLastWrite(t)
    }, c.getAssociationDisplayText = function (t, e) {
        var i = this;
        i._fragmentDriver.getAssociationDisplayText(t, e)
    }, c.setAssociationDisplayText = function (t, e, i) {
        var n = this;
        n._fragmentDriver.setAssociationDisplayText(t, e, function (t) {
            n._handleSet(t, i)
        })
    }, c.getAssociationAssociatedXooMLFragment = function (t, e) {
        var i = this;
        i._fragmentDriver.getAssociationAssociatedXooMLFragment(t, e)
    }, c.getAssociationLocalItem = function (t, e) {
        var i = this;
        i._fragmentDriver.getAssociationLocalItem(t, e)
    }, c.getAssociationAssociatedItem = function (t, e) {
        var i = this;
        i._fragmentDriver.getAssociationAssociatedItem(t, e)
    }, c.getFragmentNamespaceAttribute = function (t, e, i) {
        var n = this;
        n._fragmentDriver.getFragmentNamespaceAttribute(t, e, i)
    }, c.addFragmentNamespaceAttribute = function (t, e, i) {
        var n = this;
        n._fragmentDriver.addFragmentNamespaceAttribute(t, e, i)
    }, c.removeFragmentNamespaceAttribute = function (t, e, i) {
        var n = this;
        n._fragmentDriver.removeFragmentNamespaceAttribute(t, e, i)
    }, c.hasFragmentNamespace = function (t, e) {
        var i = this;
        i._fragmentDriver.hasFragmentNamespace(t, e)
    }, c.setFragmentNamespaceAttribute = function (t, e, i, n) {
        var r = this;
        r._fragmentDriver.setFragmentNamespaceAttribute(t, e, i, function (t) {
            r._handleSet(t, n)
        })
    }, c.listFragmentNamespaceAttributes = function (t, e) {
        var i = this;
        i._fragmentDriver.listFragmentNamespaceAttributes(t, e)
    }, c.getFragmentNamespaceData = function (t, e) {
        var i = this;
        i._fragmentDriver.getFragmentNamespaceData(t, e)
    }, c.setFragmentNamespaceData = function (t, e, i) {
        var n = this;
        n._fragmentDriver.setFragmentNamespaceData(t, e, function (t) {
            n._handleSet(t, i)
        })
    }, c.createItemMirrorForAssociatedGroupingItem = function (t, i) {
        var r = this;
        r.isAssociatedItemGrouping(t, function (o, a) {
            return o ? i(o) : a ? (r._fragmentDriver.getAssociationAssociatedItem(t, function (o, a) {
                if (o) return i(o);
                var s;
                s = n.joinPath(a, e.xooMLFragmentFileName), r._fragmentDriver.setAssociationAssociatedXooMLFragment(t, s, function (t) {
                    if (t) return i(t);
                    var e, o;
                    e = n.joinPath(r._groupingItemURI, a), o = r._newItemMirrorOptions, o.groupingItemURI = e, o.readIfExists = !0, o.parent = r, new u(o, function (t, e) {
                        return t ? i(t) : (r.sync(function (t) {
                            if (t) throw t;
                            return i(!1, e)
                        }), void 0)
                    })
                })
            }), void 0) : i(!1, null)
        })
    }, c.createAssociation = function (n, r) {
        var o, a, s, u, c = this;
        if (!i.isFunction(r)) throw t.invalidType;
        return i.isObject(n) ? (o = i.hasOptions(e.createAssociationSimple, n), a = i.hasOptions(e.createAssociationLinkNonGrouping, n), s = i.hasOptions(e.createAssociationLinkGrouping, n), u = i.hasOptions(e.createAssociationCreate, n), c._fragmentDriver.createAssociation(n, function (e, i) {
            return e ? r(e) : o ? (c._createAssociationSimple(i, n, r), void 0) : a ? c._createAssociationLinkNonGrouping(i, n, r) : s ? c._createAssociationLinkGrouping(i, n, r) : u ? c._createAssociationCreate(i, n, r) : r(t.missingParameter)
        }), void 0) : r(t.invalidType)
    }, c.deleteAssociation = function (e, n) {
        var r = this;
        return i.checkCallback(n), e ? i.isGUID(e) ? (r.getAssociationLocalItem(e, function (t, i) {
            return t ? n(t) : (r._fragmentDriver.deleteAssociation(e, function (t) {
                return t ? n(t) : i ? (r._handleDataWrapperDeleteAssociation(e, i, t, n), void 0) : r._save(n)
            }), void 0)
        }), void 0) : n(t.invalidType) : n(t.nullArgument)
    }, c.upgradeAssociation = function (e, n) {
        var r = this;
        return i.checkCallback(n), i.hasOptions(g, e) ? e.hasOwnProperty("localItemURI") && !i.isString(e.localItemURI) || !i.isGUID(e.GUID) ? n(t.invalidType) : (e.hasOwnProperty("localItemURI") ? r._getSubGroupingItemURIFromDisplayText(e.GUID, e.localItemURI, n) : r.getAssociationDisplayText(e.GUID, function (t, i) {
            return t ? n(t) : (r._getSubGroupingItemURIFromDisplayText(e.GUID, i, n), void 0)
        }), void 0) : n(t.missingParameter)
    }, c.renameLocalItem = function (e, i) {
        return i(t.notImplemented)
    }, c.isAssociatedItemGrouping = function (t, e) {
        var i = this;
        i._fragmentDriver.getAssociationAssociatedItem(t, function (t, r) {
            if (t) return e(t);
            if (!r || "" === r) return e(!1, !1);
            var o;
            o = n.joinPath(i._groupingItemURI, r), i._itemDriver.isGroupingItem(o, function (t, i) {
                return t ? e(t) : e(!1, i)
            })
        })
    }, c.listAssociations = function (t) {
        var e = this;
        e._fragmentDriver.listAssociations(t)
    }, c.getAssociationNamespaceAttribute = function (t, e, i, n) {
        var r = this;
        r._fragmentDriver.getAssociationNamespaceAttribute(t, e, i, n)
    }, c.addAssociationNamespaceAttribute = function (t, e, i, n) {
        var r = this;
        r._fragmentDriver.addAssociationNamespaceAttribute(t, e, i, n)
    }, c.removeAssociationNamespaceAttribute = function (t, e, i, n) {
        var r = this;
        r._fragmentDriver.removeAssociationNamespaceAttribute(t, e, i, n)
    }, c.hasAssociationNamespace = function (t, e, i) {
        var n = this;
        n._fragmentDriver.hasAssociationNamespace(t, e, i)
    }, c.setAssociationNamespaceAttribute = function (t, e, i, n, r) {
        var o = this;
        o._fragmentDriver.setAssociationNamespaceAttribute(t, e, i, n, function (t) {
            o._handleSet(t, r)
        })
    }, c.listAssociationNamespaceAttributes = function (t, e, i) {
        var n = this;
        n._fragmentDriver.listAssociationNamespaceAttributes(t, e, i)
    }, c.getAssociationNamespaceData = function (t, e, i) {
        var n = this;
        n._fragmentDriver.getAssociationNamespaceData(t, e, i)
    }, c.setAssociationNamespaceData = function (t, e, i, n) {
        var r = this;
        r._fragmentDriver.setAssociationNamespaceData(t, e, i, function (t) {
            r._handleSet(t, n)
        })
    }, c.sync = function (t) {
        var e = this;
        e._syncDriver.sync(t)
    }, c.isCurrent = function (t) {
        var i, o, a, s = this;
        s.getGUIDGeneratedOnLastWrite(function (u, c) {
            return u ? t(u) : (i = c, a = n.joinPath(s._groupingItemURI, e.xooMLFragmentFileName), s._xooMLDriver.getXooMLFragment(a, function (e, n) {
                return e ? t(e) : (new r({
                    xooMLFragmentString: n
                }, function (e, n) {
                    n.getGUIDGeneratedOnLastWrite(function (e, n) {
                        return e ? t(e) : (o = n, t(!1, i === o), void 0)
                    })
                }), void 0)
            }), void 0)
        })
    }, c.refresh = function (t) {
        var i, r = this;
        r.isCurrent(function (o, a) {
            if (o) throw o;
            return a ? t(!1) : (i = n.joinPath(r._groupingItemURI, e.xooMLFragmentFileName), r._loadXooMLFragmentString(i, t), void 0)
        })
    }, c.toString = function (t) {
        var e = this;
        e._fragmentDriver.toString(t)
    }, c.getParent = function (t) {
        var e = this;
        return t(!1, e._parent)
    }, c._getSubGroupingItemURIFromDisplayText = function (t, i, r) {
        var o, a, s, u = this;
        o = i.length <= e.maxFileLength ? i.length : e.maxFileLength, a = i.substring(0, o), s = n.joinPath(u._groupingItemURI, a), u._itemDriver.createGroupingItem(s, function (e) {
            return e ? r(e) : (u._setAssociationLocalItemAndAssociatedItem(t, a, r), void 0)
        })
    }, c._setAssociationLocalItemAndAssociatedItem = function (t, e, i) {
        var n = this;
        n._fragmentDriver.setAssociationLocalItem(t, e, function (r) {
            return r ? i(r) : (n._fragmentDriver.setAssociationAssociatedItem(t, e, function (t) {
                return t ? i(t) : (n._save(i), void 0)
            }), void 0)
        })
    }, c._save = function (e) {
        var i = this;
        i.isCurrent(function (n, r) {
            return n ? e(n) : r ? (i._saveFragment(e), void 0) : e(t.itemMirrorNotCurrent)
        })
    }, c._saveFragment = function (t) {
        var i = this;
        i._fragmentDriver.updateETag(function (r) {
            return r ? t(r) : (i._fragmentDriver.toString(function (r, o) {
                if (r) return t(r);
                var a = n.joinPath(i._groupingItemURI, e.xooMLFragmentFileName);
                i._xooMLDriver.setXooMLFragment(a, o, function (e) {
                    return e ? t(e) : (t(!1), void 0)
                })
            }), void 0)
        })
    }, c._getItemU = function (t, e, n) {
        var r = this;
        r._itemDriver = new o(e.itemDriver, function (o, a) {
            return o ? n(o, null) : (r._itemDriver = a, i.hasOptions(l, e) ? e.readIfExists ? r._getItemUForFallbackConstructor(t, e, n) : r._getItemUNewXooMLFragment(t, e, n) : i.hasOptions(m, e) && r._loadXooMLFragmentString(t, n), void 0)
        })
    }, c._createSyncDriver = function () {
        var t = this;
        return new s(t)
    }, c._loadXooMLFragmentString = function (t, e) {
        var i = this;
        i._xooMLDriver.getXooMLFragment(t, function (t, n) {
            return t ? e(t, null) : (new r({
                xooMLFragmentString: n
            }, function (t, n) {
                return t ? e(t) : (i._fragmentDriver = n, i._syncDriver = i._createSyncDriver(), i.sync(function (t) {
                    if (t) throw t;
                    return e(!1, i)
                }), void 0)
            }), void 0)
        })
    }, c._getItemList = function (t, e) {
        var i = this;
        i._itemDriver.listItems(i._groupingItemURI, function (n, r) {
            return n ? e(n, null) : (i._createXooMLFragment(t, r, e), void 0)
        })
    }, c._createXooMLFragment = function (t, e, i) {
        var n, o = this;
        n = {
            associations: e,
            xooMLUtilityURI: t.xooMLDriver.driverURI,
            itemUtilityURI: t.itemDriver.driverURI,
            syncUtilityURI: t.syncDriver.driverURI,
            groupingItemURI: t.groupingItemURI
        }, new r(n, function (t, e) {
            return t ? i(t, null) : (o._fragmentDriver = e, o._syncDriver = o._createSyncDriver(), o._saveFragment(i), void 0)
        })
    }, c._handleExistingAssociationDelete = function (t, e, i) {
        var r, o = this;
        r = n.joinPath(o._groupingItemURI, e), o._itemDriver.isGroupingItem(r, function (n, r) {
            return n ? i(n, null) : (r === !0 ? o._removeNonGroupingItemThroughAssociation(t, e, i) : o._removeGroupingItemThroughAssociation(t, e, i), void 0)
        })
    }, c._removeNonGroupingItemThroughAssociation = function (t, e, i) {
        var r, o = this;
        r = n.joinPath(o._groupingItemURI, e), o._itemDriver.deleteNonGroupingItem(r, function (t) {
            o._handleSet(t, i)
        })
    }, c._removeGroupingItemThroughAssociation = function (t, e, i) {
        var r, o = this;
        r = n.joinPath(o._groupingItemURI, e), o._itemDriver.deleteGroupingItem(r, function (t) {
            o._handleSet(t, i)
        })
    }, c._handleSet = function (t, e) {
        if (t) return e(t, null);
        var i = this;
        i._save(e)
    }, c._getItemUForFallbackConstructor = function (t, e, i) {
        var n = this;
        n._xooMLDriver.checkExisted(t, function (r, o) {
            o === !0 ? n._loadXooMLFragmentString(t, i) : n._getItemList(e, i)
        })
    }, c._getItemUNewXooMLFragment = function (e, i, n) {
        var r = this;
        r._xooMLDriver.checkExisted(e, function (e, o) {
            return o === !0 ? n(t.itemAlreadyExists) : (r._getItemList(i, n), void 0)
        })
    }, c._createAssociationSimple = function (t, e, i) {
        var n = this;
        return n._save(function (e) {
            return i(e, t)
        })
    }, c._createAssociationLinkNonGrouping = function (e, i, n) {
        var r = this;
        return i.localItemRequested ? n(t.notImplemented) : r._save(function (t) {
            return n(t, e)
        })
    }, c._createAssociationLinkGrouping = function (e, i, n) {
        return n(t.notImplemented)
    }, c._createAssociationCreate = function (t, e, i) {
        var n = this;
        return e.isGroupingItem ? n._createAssociationGroupingItem(t, e, i) : n._createAssociationNonGroupingItem(t, e, i)
    }, c._createAssociationGroupingItem = function (t, e, i) {
        var r, o = this;
        r = n.joinPath(o._groupingItemURI, e.itemName), o._itemDriver.createGroupingItem(r, function (n, r) {
            return n || r.name !== e.itemName ? i(n, null) : o._saveAssociationAssociatedXooMLFragment(t, e, i)
        })
    }, c._saveAssociationAssociatedXooMLFragment = function (t, i, n) {
        var r = this;
        r._fragmentDriver.setAssociationAssociatedXooMLFragment(t, e.xooMLFragmentFileName, function (e) {
            return e ? n(e) : (r._save(function (e) {
                n(e, t)
            }), void 0)
        })
    }, c._createAssociationNonGroupingItem = function (e, i, n) {
        var r = this;
        r._checkExistenceFromItemDescribed(function (o, a) {
            return o ? n(o, null) : a ? n(t.itemUException) : (r._createNonGroupingItemFromItemDescribed(e, i, n), void 0)
        })
    }, c._createNonGroupingItemFromItemDescribed = function (t, e, i) {
        var r, o = this;
        r = n.joinPath(o._groupingItemURI, e.itemName), o._itemDriver.createNonGroupingItem(r, "", function (n, r) {
            return n || r.name === e.itemName ? i(n, null) : (o._save(function (e) {
                i(e, t)
            }), void 0)
        })
    }, c._checkExistenceFromItemDescribed = function (t, e) {
        var i, r = this;
        i = n.joinPath(r._groupingItemURI, t), r._itemDriver.checkExisted(i, function (t, i) {
            return t ? e(t, null) : e(t, i, r._groupingItemURI)
        })
    }, c._handleDataWrapperDeleteAssociation = function (e, i, r, o) {
        var a, s = this;
        return r ? o(r) : (a = n.joinPath(s._groupingItemURI, i), s._itemDriver.checkExisted(a, function (n, r) {
            return n ? o(n) : r === !0 ? s._handleExistingAssociationDelete(e, i, o) : o(t.invalidState)
        }), void 0)
    }, u
});