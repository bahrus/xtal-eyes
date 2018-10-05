import { XtallatX } from 'xtal-latx/xtal-latx.js';
import { define } from 'xtal-latx/define.js';

const params = 'params';
export class XtalEyes extends XtallatX(HTMLElement) {
    static get is() { return 'xtal-eyes'; }
    static get observedAttributes() {
        return super.observedAttributes.concat([params]);
    }
    _params!: string[];
    get params() {
        return this._params;
    }
    set params(nv) {
        this._params = nv;
        this.onPropsChange();
    }
    attributeChangedCallback(nm: string, ov: string, nv: string) {
        super.attributeChangedCallback(nm, ov, nv);
        switch (nm) {
            case params:
                this._params = JSON.parse(nv);
                break;
        }
        this.onPropsChange();
    }
    _conn = false;
    connectedCallback() {
        this._upgradeProperties([params]);
        this._conn = true;
        this.onPropsChange();
    }
    onPropsChange() {
        if (!this._params || !this._conn) return;
        const obj = this.getObjToObs();
        if (obj) {
            const config = {
                attributes: true,
                attributeFilter: this._params
            } as MutationObserverInit;

            this._attributeObserver = new MutationObserver(mutationRecords => {
                const values: { [key: string]: string | null } = {};
                this._params.forEach(param => {
                    values[param] = obj.getAttribute(param);
                })
                const fakeEvent = <any>{
                    mutationRecords: mutationRecords,
                    values: values,
                    source: obj
                } as Event;
                this.de('params', fakeEvent);
            });
            this._attributeObserver.observe(obj, config);
        }
    }
    _attributeObserver!: MutationObserver;
    getObjToObs() {
        let parent = this as Node | null;
        while (parent = parent!.parentNode) {
            if ((<HTMLElement>parent).nodeType === 11) {
                return (<any>parent)['host'];
            } else if ((<HTMLElement>parent).tagName.indexOf('-') > -1) {
                return parent;
            } else if ((<HTMLElement>parent).tagName === 'HTML') {
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
        window.history.pushState = (newState: any, title: string, URL: string) => {
            boundPushState(newState, title, URL);
            this.notifySrchParams();
        }
        const originalReplaceState = window.history.replaceState;
        const boundReplaceState = originalReplaceState.bind(window.history);
        window.history.replaceState = (newState: any, title: string, URL: string) => {
            boundReplaceState(newState, title, URL);
            this.notifySrchParams();
        }
        this.notifySrchParams();
    }
    _previousValues: { [key: string]: string | null } = {};
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

        })
        if (changedVal) {
            this.de('params', {
                values: this._previousValues,
            });
        }

    }

    disconnectedCallback() {
        if (this._attributeObserver) this._attributeObserver.disconnect();
    }
}
define(XtalEyes);