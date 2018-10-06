import { XtallatX } from "./node_modules/xtal-latx/xtal-latx.js";
import { define } from "./node_modules/xtal-latx/define.js";
var params = 'params';
export var XtalEyes =
/*#__PURE__*/
function (_XtallatX) {
  babelHelpers.inherits(XtalEyes, _XtallatX);

  function XtalEyes() {
    var _this;

    babelHelpers.classCallCheck(this, XtalEyes);
    _this = babelHelpers.possibleConstructorReturn(this, (XtalEyes.__proto__ || Object.getPrototypeOf(XtalEyes)).apply(this, arguments));
    _this._conn = false;
    _this._previousValues = {};
    return _this;
  }

  babelHelpers.createClass(XtalEyes, [{
    key: "attributeChangedCallback",
    value: function attributeChangedCallback(nm, ov, nv) {
      babelHelpers.get(XtalEyes.prototype.__proto__ || Object.getPrototypeOf(XtalEyes.prototype), "attributeChangedCallback", this).call(this, nm, ov, nv);

      switch (nm) {
        case params:
          this._params = JSON.parse(nv);
          break;
      }

      this.onPropsChange();
    }
  }, {
    key: "connectedCallback",
    value: function connectedCallback() {
      this._upgradeProperties([params]);

      this._conn = true;
      this.onPropsChange();
    }
  }, {
    key: "onPropsChange",
    value: function onPropsChange() {
      var _this2 = this;

      if (!this._params || !this._conn) return;
      var obj = this.getObjToObs();

      if (obj) {
        var config = {
          attributes: true,
          attributeFilter: this._params
        };
        this._attributeObserver = new MutationObserver(function (mutationRecords) {
          var values = {};

          _this2._params.forEach(function (param) {
            values[param] = obj.getAttribute(param);
          });

          var fakeEvent = {
            mutationRecords: mutationRecords,
            values: values,
            source: obj
          };

          _this2.de('params', fakeEvent);
        });

        this._attributeObserver.observe(obj, config);
      }
    }
  }, {
    key: "getObjToObs",
    value: function getObjToObs() {
      var parent = this;

      while (parent = parent.parentNode) {
        if (parent.nodeType === 11) {
          return parent['host'];
        } else if (parent.tagName.indexOf('-') > -1) {
          return parent;
        } else if (parent.tagName === 'HTML') {
          this.watchLocation();
          return null;
        }
      }
    }
  }, {
    key: "watchLocation",
    value: function watchLocation() {
      var _this3 = this;

      window.addEventListener('popstate', function (e) {
        _this3.notifySrchParams();
      });
      var oPS = window.history.pushState; //originalPushState

      var bPS = oPS.bind(window.history); //boundPushState

      history.pushState = function (newState, title, URL) {
        bPS(newState, title, URL);

        _this3.notifySrchParams();
      };

      var oRS = window.history.replaceState; //originalReplaceState

      var bRS = oRS.bind(window.history); //boundReplaceState

      history.replaceState = function (newState, title, URL) {
        bRS(newState, title, URL);

        _this3.notifySrchParams();
      };

      this.notifySrchParams();
    }
  }, {
    key: "notifySrchParams",
    value: function notifySrchParams() {
      var _this4 = this;

      //const split = this._on.split(',');
      var searchParams = new URLSearchParams(location.search);
      var changedVal = false;

      this._params.forEach(function (param) {
        var searchParm = searchParams.get(param);

        if (!changedVal && searchParm !== _this4._previousValues[param]) {
          changedVal = true;
          _this4._previousValues[param] = searchParm;
        }
      });

      if (changedVal) {
        this.de('params', {
          values: this._previousValues
        });
      }
    }
  }, {
    key: "disconnectedCallback",
    value: function disconnectedCallback() {
      if (this._attributeObserver) this._attributeObserver.disconnect();
    }
  }, {
    key: "params",
    get: function get() {
      return this._params;
    },
    set: function set(nv) {
      this._params = nv;
      this.onPropsChange();
    }
  }], [{
    key: "is",
    get: function get() {
      return 'xtal-eyes';
    }
  }, {
    key: "observedAttributes",
    get: function get() {
      return babelHelpers.get(XtalEyes.__proto__ || Object.getPrototypeOf(XtalEyes), "observedAttributes", this).concat([params]);
    }
  }]);
  return XtalEyes;
}(XtallatX(HTMLElement));
define(XtalEyes); //# sourceMappingURL=xtal-eyes.js.map