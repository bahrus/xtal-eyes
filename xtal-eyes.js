(function () {
    class XtalEyes extends HTMLElement {
        constructor() {
            super(...arguments);
            this._retries = 0;
        }
        static get is() { return 'xtal-eyes'; }
        set constantName(newVal) {
            this._constantName = newVal;
            this.setAttribute('constant-name', newVal); //debugging
        }
        get constantName() {
            return this._constantName;
        }
        connectedCallback() {
            this.getGlobalConstantName();
        }
        getGlobalConstantName() {
            const scriptTag = this.querySelector('script');
            if (!scriptTag) {
                this._retries++;
                if (this._retries < 100) {
                    setTimeout(() => {
                        this.getGlobalConstantName();
                    }, 100);
                    return;
                }
                else {
                    throw 'Cannot find script tag';
                }
            }
            const scriptString = scriptTag.innerHTML;
            const splitString = scriptString.split('=');
            const lhs = splitString[0].trim();
            const splitLHS = lhs.split(' ');
            this.constantName = splitLHS[splitLHS.length - 1];
            this._obj = eval(this.constantName);
            this._obj[XtalEyes.__cont] = this;
            this._originalPropertyNames = Object.getOwnPropertyNames(this._obj);
            this._filteredPropertyNames = this._originalPropertyNames;
            this._originalPropertyNames.forEach(name => {
                // console.log({
                //     name: name,
                //     val: this._obj[name]
                // });
                const currentVal = this._obj[name];
                Object.defineProperty(this._obj, name, {
                    get: this.getter(name),
                    set: this.setter(name),
                    enumerable: true,
                    configurable: true
                });
                this._obj[name] = currentVal;
            });
        }
        getter(ID) {
            return function () {
                return this['_' + ID];
            };
        }
        setter(ID) {
            return function (val) {
                this['_' + ID] = val;
                this[XtalEyes.__cont].validateObject();
            };
        }
        validateObject() {
            const _this = this;
            this._filteredPropertyNames = this._filteredPropertyNames.filter(name => {
                console.log(_this);
                return _this._obj[name] === null;
            });
            if (this._filteredPropertyNames.length === 0) {
                const constName = this._constantName.replace('window[', '').replace(']', '');
                document.head.dataset[constName] = this._constantName;
            }
            console.log({
                'filteredPropNames': this._filteredPropertyNames
            });
        }
    }
    XtalEyes.__cont = '__cont';
    customElements.define(XtalEyes.is, XtalEyes);
})();
//# sourceMappingURL=xtal-eyes.js.map