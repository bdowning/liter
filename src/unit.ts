let baseNames = [
    'meter',
    'kilogram',
    'second',
    'ampere',
    'kelvin',
    'mole',
    'candela',
    'radian',
    'steradian',
];

let baseIndexes: { [name: string]: number } = { };
baseNames.forEach((name, i) => baseIndexes[name] = i);

export type UnitName = { [name: string]: number; };
export type UnitBaseTerms = number[];
export type UnitCustomTerms = { [name: string]: number; };
export type UnitM = [ number, number ];

export type IUnit = {
    terms?: UnitBaseTerms,
    customTerms?: UnitCustomTerms,
    name?: UnitName,
    m?: UnitM,
    mode?: string,
};


let zeroTerm: UnitBaseTerms = baseNames.map(_ => 0);

function nameCombine(n1: UnitName, n2: UnitName) {
    let names = { ...n1 };
    for (let k of Object.keys(n2))
        names[k] = (names[k] || 0) + n2[k];
    return names;
}

function customTermsCombine(t1?: UnitCustomTerms, t2?: UnitCustomTerms) {
    let customTerms: UnitCustomTerms | undefined = undefined;
    if (!t1)
        return t2;
    if (!t2)
        return t1;
    for (let t of Object.keys(t1).concat(Object.keys(t2))) {
        let term = (t1[t] || 0) + (t2[t] || 0);
        if (term) {
            if (customTerms == null)
                customTerms = { };
            customTerms[t] = term;
        }
    }
    return customTerms;
}


export class Unit {
    constructor(
        public terms: UnitBaseTerms,
        public customTerms?: UnitCustomTerms,
        public name: UnitName = { },
        public m: UnitM = [ 1, 0 ],
        public mode: string = 'normal',
    ) {
    }

    set(proto: IUnit) {
        return new Unit(
            proto.terms || this.terms,
            proto.customTerms || this.customTerms,
            proto.name || this.name,
            proto.m || this.m,
            proto.mode || this.mode,
        );
    }

    static base(name: string) {
        let baseIndex = baseIndexes[name];
        let terms = zeroTerm;
        if (baseIndex != null) {
            terms = [ ...terms ];
            terms[baseIndex] = 1;
        }
        let customTerms = baseIndex == null ? { [name]: 1 } : undefined;
        return new Unit(
            terms,
            customTerms,
            { [name]: 1 },
        );
    }

    static one(m0 = 1, m1 = 0) {
        return new Unit(
            zeroTerm,
            undefined,
            { },
            [ m0, m1 ],
        );
    }

    baseFormat() {
        let { terms, mode } = this;
        let o = [ ];
        if (mode !== 'normal')
            o.push(mode);
        for (let i = 0; i < baseNames.length; ++i) {
            if (terms[i] === 1)
                o.push(baseNames[i]);
            else if (terms[i] !== 0)
                o.push(`${baseNames[i]}^${terms[i]}`);
        }
        if (this.customTerms) {
            for (let term in this.customTerms)
                if (this.customTerms[term] === 1)
                    o.push(term)
                else if (this.customTerms[term] !== 0)
                    o.push(`${term}^${this.customTerms[term]}`);
        }
        return o.join(' ');
    }

    nameFormat() {
        let { name, m } = this;
        let o = [ ];
        for (let k of Object.keys(name)) {
            if (name[k] === 1)
                o.push(k);
            else if (typeof(name[k]) === 'number' && name[k] !== 0)
                o.push(`${k}^${name[k].toString()}`);
        }

        return o.join(' ');
    }

    private cachedTermsKey?: string;

    termsKey() {
        if (!this.cachedTermsKey) {
            let key: (number | string)[] = [ ...this.terms ];
            if (this.customTerms) {
                for (let term of Object.keys(this.customTerms).sort()) {
                    key.push(term);
                    key.push(this.customTerms[term]);
                }
            }
            this.cachedTermsKey = JSON.stringify(key);
        }
        return this.cachedTermsKey;
    }

    sameTerms(rhs: Unit) {
        for (let i = 0; i < baseNames.length; ++i) {
            if (this.terms[i] !== rhs.terms[i])
                return false;
        }
        if (this.customTerms) {
            if (!rhs.customTerms)
                return false;
            for (let t of Object.keys(this.customTerms).concat(Object.keys(rhs.customTerms))) {
                if ((this.customTerms[t] || 0) !== (rhs.customTerms[t] || 0))
                    return false;
            }
        } else {
            if (rhs.customTerms)
                return false;
        }
        return true;
    }

    isDimensionless() {
        return !this.customTerms && this.terms.every(t => t === 0);
    }

    mul2(rhs: Unit): [ Unit, UnitM, UnitM, UnitM ] {
        if (this.m[1] !== 0 || rhs.m[1] !== 0)
            throw new Error(`Can't multiply offset units`);
        let mode = this.mode;
        let terms = [ ];
        for (let i = 0; i < baseNames.length; ++i)
            terms[i] = this.terms[i] + rhs.terms[i];
        // if (terms.every(i => i == 0)) {
        //     mode = 'U/U';
        //     terms = this.terms;
        // }
        //assert(this.m[1] == 0 && rhs.m[1] == 0);
        let u = new Unit(
            terms,
            customTermsCombine(this.customTerms, rhs.customTerms),
            nameCombine(this.name, rhs.name),
            [ this.m[0] * rhs.m[0], this.m[1] + rhs.m[1] ],
            mode,
        );
        // console.log(this, rhs);
        return [ u,
                 [ 1, -(this.m[1] + rhs.m[1]) ],
                 [ 1, this.m[1] ],
                 [ 1, rhs.m[1] ] ];
    }

    mul(...rest: Unit[]) {
        return rest.reduce((l, r) => l.mul2(r)[0], this);
    }

    div(...rest: Unit[]) {
        return rest.reduce((l, r) => l.mul2(r.inv())[0], this);
    }

    inv() {
        if (this.m[1] !== 0)
            throw new Error(`Can't invert offset units`);
        let terms = [ ];
        let name: UnitName = { };
        let customTerms: UnitCustomTerms | undefined;
        for (let i = 0; i < baseNames.length; ++i)
            terms[i] = -this.terms[i] || 0;
        for (let k of Object.keys(this.name))
            name[k] = -this.name[k];
        if (this.customTerms) {
            customTerms = { };
            for (let t in this.customTerms)
                customTerms[t] = -this.customTerms[t];
        }
        //assert(this.m[1] == 0);
        return new Unit(
            terms,
            customTerms,
            name,
            [ 1 / this.m[0], -this.m[1] ],
        );
    }

    add(rhs: Unit, convert = false): [ Unit, UnitM, UnitM, UnitM ] {
        if (!this.sameTerms(rhs))
            throw new Error(`Can not add <${rhs.nameFormat()}> to <${this.nameFormat()}>`);
        if (!convert && this.m[1] !== 0 && rhs.m[1] !== 0)
            throw new Error(`Can't add offset units`);

        let lhs: Unit = this;
        let swap = false;
        if (lhs.m[1] === 0 && rhs.m[1] !== 0) {
            lhs = rhs;
            rhs = this;
            swap = true;
        }
        let scale = rhs.m[0] / lhs.m[0];
        // console.log('lhs', lhs, 'rhs', rhs);
        // console.log('scale', scale, 'm[1]', lhs.m[1], rhs.m[1]);

        let lm: UnitM = [ 1, lhs.m[1] ];
        let rm: UnitM = [ scale, scale * rhs.m[1] ];
        return [ lhs,
                 [ 1, -lhs.m[1] ],
                 swap ? rm : lm,
                 swap ? lm : rm ];
    }

    delta(): Unit {
        let name: UnitName = { };
        for (let n in this.name)
            name[`delta_${n}`] = this.name[n];
        return this.set({ name, m: [ this.m[0], 0 ] });
    }

    sub(rhs: Unit): [ Unit, UnitM, UnitM, UnitM ] {
        if (!this.sameTerms(rhs))
            throw new Error(`Can not subtract <${rhs.nameFormat()}> from <${this.nameFormat()}>`);
        let scale = rhs.m[0] / this.m[0];
        if (this.m[1] === 0 && rhs.m[1] !== 0)
            throw new Error(`Can't subtract offset from non-offset unit`);
        let u = (this.m[1] !== 0 && rhs.m[1] !== 0) ? this.delta() : this;
        return [ u,
                 [ 1, -u.m[1] ],
                 [ 1, this.m[1] ],
                 [ scale, scale * rhs.m[1] ] ];
    }

    rename(name: string) {
        return this.set({ name: { [name]: 1} });
    }

    print() {
        console.log('This ', this.nameFormat());
        console.log('  base: ', this.baseFormat());
        console.log('  terms:', this.terms, this.customTerms);
        console.log('  m:    ', this.m);
    }

    inspect() {
        return `<Unit ${this.nameFormat()}>`;
    }
}

export let baseUnits: { [name: string]: Unit } = { };

// console.log(baseNames);
// console.log(baseNames.length);
for (let i = 0; i < baseNames.length; ++i) {
    let terms = [];
    for (let j = 0; j < baseNames.length; ++j)
        terms[j] = (j === i) ? 1 : 0;
    baseUnits[baseNames[i]] = Unit.base(baseNames[i]);
}

baseUnits.one = Unit.one(1);
