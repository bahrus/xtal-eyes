import { XtallatX } from 'xtal-latx/xtal-latx.js';
import { define } from 'xtal-latx/define.js';
const params = 'params';
export class XtalEyes extends XtallatX(HTMLElement) {
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
        const originalPushState = window.history.pushState;
        const boundPushState = originalPushState.bind(window.history);
        window.history.pushState = (newState, title, URL) => {
            boundPushState(newState, title, URL);
            this.notifySrchParams();
        };
        const originalReplaceState = window.history.replaceState;
        const boundReplaceState = originalReplaceState.bind(window.history);
        window.history.replaceState = (newState, title, URL) => {
            boundReplaceState(newState, title, URL);
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
//# sourceMappingURL=xtal-eyes.js.map