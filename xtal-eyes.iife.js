
    //@ts-check
    (function () {
    function define(custEl) {
    let tagName = custEl.is;
    if (customElements.get(tagName)) {
        console.warn('Already registered ' + tagName);
        return;
    }
    customElements.define(tagName, custEl);
}
const disabled = 'disabled';
/**
 * Base class for many xtal- components
 * @param superClass
 */
function XtallatX(superClass) {
    return class extends superClass {
        constructor() {
            super(...arguments);
            this._evCount = {};
        }
        static get observedAttributes() {
            return [disabled];
        }
        /**
         * Any component that emits events should not do so ef it is disabled.
         * Note that this is not enforced, but the disabled property is made available.
         * Users of this mix-in sure ensure it doesn't call "de" if this property is set to true.
         */
        get disabled() {
            return this._disabled;
        }
        set disabled(val) {
            this.attr(disabled, val, '');
        }
        /**
         * Set attribute value.
         * @param name
         * @param val
         * @param trueVal String to set attribute if true.
         */
        attr(name, val, trueVal) {
            const v = val ? 'set' : 'remove'; //verb
            this[v + 'Attribute'](name, trueVal || val);
        }
        /**
         * Turn number into string with even and odd values easy to query via css.
         * @param n
         */
        to$(n) {
            const mod = n % 2;
            return (n - mod) / 2 + '-' + mod;
        }
        /**
         * Increment event count
         * @param name
         */
        incAttr(name) {
            const ec = this._evCount;
            if (name in ec) {
                ec[name]++;
            }
            else {
                ec[name] = 0;
            }
            this.attr('data-' + name, this.to$(ec[name]));
        }
        attributeChangedCallback(name, oldVal, newVal) {
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
        de(name, detail, asIs) {
            const eventName = name + (asIs ? '' : '-changed');
            const newEvent = new CustomEvent(eventName, {
                detail: detail,
                bubbles: true,
                composed: false,
            });
            this.dispatchEvent(newEvent);
            this.incAttr(eventName);
            return newEvent;
        }
        /**
         * Needed for asynchronous loading
         * @param props Array of property names to "upgrade", without losing value set while element was Unknown
         */
        _upgradeProperties(props) {
            props.forEach(prop => {
                if (this.hasOwnProperty(prop)) {
                    let value = this[prop];
                    delete this[prop];
                    this[prop] = value;
                }
            });
        }
    };
}
const params = 'params';
class XtalEyes extends XtallatX(HTMLElement) {
    constructor() {
        super(...arguments);
        this._conn = false;
        this._previousValues = {};
    }
    static get is() { return 'xtal-eyes'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([params]);
    }
    get params() {
        return this._params;
    }
    set params(nv) {
        this._params = nv;
        this.onPropsChange();
    }
    attributeChangedCallback(nm, ov, nv) {
        super.attributeChangedCallback(nm, ov, nv);
        switch (nm) {
            case params:
                this._params = JSON.parse(nv);
                break;
        }
        this.onPropsChange();
    }
    connectedCallback() {
        this._upgradeProperties([params]);
        this._conn = true;
        this.onPropsChange();
    }
    onPropsChange() {
        if (!this._params || !this._conn)
            return;
        const obj = this.getObjToObs();
        if (obj) {
            const config = {
                attributes: true,
                attributeFilter: this._params
            };
            this._attributeObserver = new MutationObserver(mutationRecords => {
                const values = {};
                this._params.forEach(param => {
                    values[param] = obj.getAttribute(param);
                });
                const fakeEvent = {
                    mutationRecords: mutationRecords,
                    values: values,
                    source: obj
                };
                this.de('params', fakeEvent);
            });
            this._attributeObserver.observe(obj, config);
        }
    }
    getObjToObs() {
        let parent = this;
        while (parent = parent.parentNode) {
            if (parent.nodeType === 11) {
                return parent['host'];
            }
            else if (parent.tagName.indexOf('-') > -1) {
                return parent;
            }
            else if (parent.tagName === 'HTML') {
                this.watchLocation();
                return null;
            }
        }
    }
    watchLocation() {
        window.addEventListener('popstate', e => {
            this.notifySrchParams();
        });
        const oPS = window.history.pushState; //originalPushState
        const bPS = oPS.bind(window.history); //boundPushState
        history.pushState = (newState, title, URL) => {
            bPS(newState, title, URL);
            this.notifySrchParams();
        };
        const oRS = window.history.replaceState; //originalReplaceState
        const bRS = oRS.bind(window.history); //boundReplaceState
        history.replaceState = (newState, title, URL) => {
            bRS(newState, title, URL);
            this.notifySrchParams();
        };
        this.notifySrchParams();
    }
    notifySrchParams() {
        //const split = this._on.split(',');
        const searchParams = new URLSearchParams(location.search);
        let changedVal = false;
        this._params.forEach(param => {
            const searchParm = searchParams.get(param);
            if (!changedVal && (searchParm !== this._previousValues[param])) {
                changedVal = true;
                this._previousValues[param] = searchParm;
            }
        });
        if (changedVal) {
            this.de('params', {
                values: this._previousValues,
            });
        }
    }
    disconnectedCallback() {
        if (this._attributeObserver)
            this._attributeObserver.disconnect();
    }
}
define(XtalEyes);
    })();  
        