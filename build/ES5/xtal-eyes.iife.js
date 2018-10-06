//@ts-check
(function () {
  function define(custEl) {
    var tagName = custEl.is;

    if (customElements.get(tagName)) {
      console.warn('Already registered ' + tagName);
      return;
    }

    customElements.define(tagName, custEl);
  }

  var disabled = 'disabled';
  /**
   * Base class for many xtal- components
   * @param superClass
   */

  function XtallatX(superClass) {
    return (
      /*#__PURE__*/
      function (_superClass) {
        babelHelpers.inherits(_class, _superClass);

        function _class() {
          var _this;

          babelHelpers.classCallCheck(this, _class);
          _this = babelHelpers.possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
          _this._evCount = {};
          return _this;
        }

        babelHelpers.createClass(_class, [{
          key: "attr",

          /**
           * Set attribute value.
           * @param name
           * @param val
           * @param trueVal String to set attribute if true.
           */
          value: function attr(name, val, trueVal) {
            var v = val ? 'set' : 'remove'; //verb

            this[v + 'Attribute'](name, trueVal || val);
          }
          /**
           * Turn number into string with even and odd values easy to query via css.
           * @param n
           */

        }, {
          key: "to$",
          value: function to$(n) {
            var mod = n % 2;
            return (n - mod) / 2 + '-' + mod;
          }
          /**
           * Increment event count
           * @param name
           */

        }, {
          key: "incAttr",
          value: function incAttr(name) {
            var ec = this._evCount;

            if (name in ec) {
              ec[name]++;
            } else {
              ec[name] = 0;
            }

            this.attr('data-' + name, this.to$(ec[name]));
          }
        }, {
          key: "attributeChangedCallback",
          value: function attributeChangedCallback(name, oldVal, newVal) {
            switch (name) {
              case disabled:
                this._disabled = newVal !== null;
                break;
            }
          }
          /**
           * Dispatch Custom Event
           * @param name Name of event to dispatch (with -changed if asIs is false)
           * @param detail Information to be passed with the event
           * @param asIs If true, don't append event name with '-changed'
           */

        }, {
          key: "de",
          value: function de(name, detail, asIs) {
            var eventName = name + (asIs ? '' : '-changed');
            var newEvent = new CustomEvent(eventName, {
              detail: detail,
              bubbles: true,
              composed: false
            });
            this.dispatchEvent(newEvent);
            this.incAttr(eventName);
            return newEvent;
          }
          /**
           * Needed for asynchronous loading
           * @param props Array of property names to "upgrade", without losing value set while element was Unknown
           */

        }, {
          key: "_upgradeProperties",
          value: function _upgradeProperties(props) {
            var _this2 = this;

            props.forEach(function (prop) {
              if (_this2.hasOwnProperty(prop)) {
                var value = _this2[prop];
                delete _this2[prop];
                _this2[prop] = value;
              }
            });
          }
        }, {
          key: "disabled",

          /**
           * Any component that emits events should not do so ef it is disabled.
           * Note that this is not enforced, but the disabled property is made available.
           * Users of this mix-in sure ensure it doesn't call "de" if this property is set to true.
           */
          get: function get() {
            return this._disabled;
          },
          set: function set(val) {
            this.attr(disabled, val, '');
          }
        }], [{
          key: "observedAttributes",
          get: function get() {
            return [disabled];
          }
        }]);
        return _class;
      }(superClass)
    );
  }

  var params = 'params';

  var XtalEyes =
  /*#__PURE__*/
  function (_XtallatX) {
    babelHelpers.inherits(XtalEyes, _XtallatX);

    function XtalEyes() {
      var _this3;

      babelHelpers.classCallCheck(this, XtalEyes);
      _this3 = babelHelpers.possibleConstructorReturn(this, (XtalEyes.__proto__ || Object.getPrototypeOf(XtalEyes)).apply(this, arguments));
      _this3._conn = false;
      _this3._previousValues = {};
      return _this3;
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
        var _this4 = this;

        if (!this._params || !this._conn) return;
        var obj = this.getObjToObs();

        if (obj) {
          var config = {
            attributes: true,
            attributeFilter: this._params
          };
          this._attributeObserver = new MutationObserver(function (mutationRecords) {
            var values = {};

            _this4._params.forEach(function (param) {
              values[param] = obj.getAttribute(param);
            });

            var fakeEvent = {
              mutationRecords: mutationRecords,
              values: values,
              source: obj
            };

            _this4.de('params', fakeEvent);
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
        var _this5 = this;

        window.addEventListener('popstate', function (e) {
          _this5.notifySrchParams();
        });
        var oPS = window.history.pushState; //originalPushState

        var bPS = oPS.bind(window.history); //boundPushState

        history.pushState = function (newState, title, URL) {
          bPS(newState, title, URL);

          _this5.notifySrchParams();
        };

        var oRS = window.history.replaceState; //originalReplaceState

        var bRS = oRS.bind(window.history); //boundReplaceState

        history.replaceState = function (newState, title, URL) {
          bRS(newState, title, URL);

          _this5.notifySrchParams();
        };

        this.notifySrchParams();
      }
    }, {
      key: "notifySrchParams",
      value: function notifySrchParams() {
        var _this6 = this;

        //const split = this._on.split(',');
        var searchParams = new URLSearchParams(location.search);
        var changedVal = false;

        this._params.forEach(function (param) {
          var searchParm = searchParams.get(param);

          if (!changedVal && searchParm !== _this6._previousValues[param]) {
            changedVal = true;
            _this6._previousValues[param] = searchParm;
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

  define(XtalEyes);
})();