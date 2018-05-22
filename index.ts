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

type UnitName = {
    [name: string]: number;
};
type UnitTerms = number[];
type UnitM = [ number, number ];

type IUnit = {
    name?: UnitName,
    terms?: UnitTerms,
    m?: UnitM,
    absolute?: number,
    mode?: string,
};


let zeroTerm: UnitTerms = baseNames.map(_ => 0);

function nameCombine(n1: UnitName, n2: UnitName) {
    let names = { ...n1 };
    for (let k of Object.keys(n2))
        names[k] = (names[k] || 0) + n2[k];
    return names;
}

function offsetPow(offset: number, absolute: number) {
    // console.log('offsetPow', offset, absolute, Math.sign(absolute) * (offset / Math.abs(absolute))**Math.abs(absolute));
    return Math.sign(absolute) * (offset / Math.abs(absolute))**Math.abs(absolute);
}


class Unit {
    constructor(
        private terms: number[],
        private name: UnitName = { },
        private m: UnitM = [ 1, 0 ],
        private absolute: number = 0,
        private mode: string = 'normal',
    ) {
    }

    set(proto: IUnit) {
        return new Unit(
            proto.terms || this.terms,
            proto.name || this.name,
            proto.m || this.m,
            proto.absolute != null ? proto.absolute : this.absolute,
            proto.mode || this.mode,
        );
    }

    static one(m0 = 1, m1 = 0) {
        return new Unit(
            zeroTerm,
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
        return o.join(' ');
    }

    nameFormat() {
        let { name, m, absolute } = this;
        let o = [ ];
        for (let k of Object.keys(name)) {
            if (name[k] === 1)
                o.push(k);
            else if (typeof(name[k]) === 'number' && name[k] !== 0)
                o.push(`${k}^${name[k].toString()}`);
        }
        if (m[1] !== 0) {
            if (absolute)
                o.push('[A]');
            else
                o.push('[R]');
        }

        return o.join(' ');
    }

    sameTerms(rhs: Unit) {
        for (let i = 0; i < baseNames.length; ++i) {
            if (this.terms[i] !== rhs.terms[i])
                return false;
        }
        return true;
    }

    isDimensionless() {
        return this.terms.every(t => t === 0);
    }

    mul2(rhs: Unit): [ Unit, UnitM, UnitM, UnitM ] {
        let mode = this.mode;
        let terms = [ ];
        for (let i = 0; i < baseNames.length; ++i)
            terms[i] = this.terms[i] + rhs.terms[i];
        if (terms.every(i => i == 0)) {
            mode = 'U/U';
            terms = this.terms;
        }
        let absolute = this.absolute + rhs.absolute;
        //assert(this.m[1] == 0 && rhs.m[1] == 0);
        let u = new Unit(
            terms,
            nameCombine(this.name, rhs.name),
            [ this.m[0] * rhs.m[0], this.m[1] + rhs.m[1] ],
            absolute,
            mode,
        );
        // console.log(this, rhs);
        return [ u,
                 [ 1, -offsetPow(this.m[1] + rhs.m[1], absolute) ],
                 [ 1, offsetPow(this.m[1], this.absolute) ],
                 [ 1, offsetPow(rhs.m[1], rhs.absolute) ] ];
    }

    mul(...rest: Unit[]) {
        return rest.reduce((l, r) => l.mul2(r)[0], this);
    }

    div(...rest: Unit[]) {
        return rest.reduce((l, r) => l.mul2(r.inv())[0], this);
    }

    inv() {
        let terms = [ ];
        let name: UnitName = { };
        for (let i = 0; i < baseNames.length; ++i)
            terms[i] = -this.terms[i] || 0;
        for (let k of Object.keys(this.name))
            name[k] = -this.name[k];
        //assert(this.m[1] == 0);
        return new Unit(
            terms,
            name,
            [ 1 / this.m[0], -this.m[1] ],
            -this.absolute,
        );
    }

    add(rhs: Unit, forceAbs?: number): [ Unit, UnitM, UnitM, UnitM ] {
        if (!this.sameTerms(rhs))
            throw new Error(`Can not add <${rhs.nameFormat()}> to <${this.nameFormat()}>`);

        let scale = rhs.m[0] / this.m[0];
        let absolute = this.absolute ? this.absolute : rhs.absolute;
        console.log('this', this, 'rhs', rhs);
        console.log('scale', scale, 'absolute', absolute, 'm[1]', this.m[1], rhs.m[1]);
        if (forceAbs != null)
            absolute = forceAbs;
        let u = this.set({ absolute });

        console.log([ u,
                 [ 1, -offsetPow(this.m[1], absolute) ],
                 [ 1, offsetPow(this.m[1], this.absolute) ],
                 [ scale, scale * offsetPow(rhs.m[1], rhs.absolute) ] ]);
        return [ u,
                 [ 1, -offsetPow(this.m[1], absolute) ],
                 [ 1, offsetPow(this.m[1], this.absolute) ],
                 [ scale, scale * offsetPow(rhs.m[1], rhs.absolute) ] ];
    }

    sub(rhs: Unit): [ Unit, UnitM, UnitM, UnitM ] {
        if (!this.sameTerms(rhs))
            throw new Error(`Can not subtract <${rhs.nameFormat()}> from <${this.nameFormat()}>`);
        let scale = rhs.m[0] / this.m[0];
        let absolute = this.absolute ? this.absolute : rhs.absolute;
        if (this.absolute && rhs.absolute)
            absolute = 0;
        let u = this.set({ absolute });
        return [ u,
                 [ 1, -offsetPow(this.m[1], absolute) ],
                 [ 1, offsetPow(this.m[1], this.absolute) ],
                 [ scale, scale * offsetPow(rhs.m[1], rhs.absolute) ] ];
    }

    rename(name: string) {
        return this.set({ name: { [name]: 1} });
    }

    print() {
        console.log('This ', this.nameFormat());
        console.log('  base: ', this.baseFormat());
        console.log('  terms:', this.terms);
        console.log('  m:    ', this.m);
    }

    inspect() {
        return `<Unit ${this.nameFormat()}>`;
    }
}

let u: { [name: string]: Unit } = { };


// console.log(baseNames);
// console.log(baseNames.length);
for (let i = 0; i < baseNames.length; ++i) {
    let terms = [];
    for (let j = 0; j < baseNames.length; ++j)
        terms[j] = (j === i) ? 1 : 0;
    u[baseNames[i]] = new Unit(
        terms,
        { [baseNames[i]]: 1 },
        [ 1, 0 ],
    );
}

u.deltaKelvin = u.kelvin;
u.kelvin = u.deltaKelvin.set({ absolute: 1 });

u.one = Unit.one(1);

u.hertz = u.one.div(u.second).rename('hertz');
u.newton = u.kilogram.mul(u.meter.div(u.second, u.second)).rename('newton');
u.pascal = u.newton.div(u.meter, u.meter).rename('pascal');
u.joule = u.newton.mul(u.meter).rename('joule');
u.watt = u.joule.div(u.second).rename('watt');
u.coulomb = u.second.mul(u.ampere).rename('coulomb');
u.volt = u.watt.div(u.ampere).rename('volt');
u.farad = u.coulomb.div(u.volt).rename('volt');
u.ohm = u.volt.div(u.ampere).rename('ohm');
u.siemens = u.one.div(u.ohm).rename('siemens');
u.weber = u.joule.div(u.ampere).rename('weber');
u.tesla = u.volt.mul(u.second).div(u.meter, u.meter).rename('tesla');
u.henry = u.volt.mul(u.second).div(u.ampere).rename('henry');
u.lumen = u.candela.mul(u.steradian).rename('lumen');
u.lux = u.lumen.div(u.meter, u.meter).rename('lux');

u.sqMeter = u.meter.mul(u.meter);
u.mPerS = u.meter.div(u.second);
u.mPerSS = u.mPerS.div(u.second);

u.gram = u.kilogram.mul(Unit.one(1/1000)).rename('gram');
u.centimeter = u.meter.mul(Unit.one(1/100)).rename('centimeter');
u.kilometer = u.meter.mul(Unit.one(1000)).rename('kilometer');
u.inch = u.centimeter.mul(Unit.one(2.54)).rename('inch');
u.foot = u.inch.mul(Unit.one(12)).rename('foot');
u.mile = u.foot.mul(Unit.one(5280)).rename('mile');
u.minute = u.second.mul(Unit.one(60)).rename('minute');
u.hour = u.minute.mul(Unit.one(60)).rename('hour');
u.sqMeter = u.meter.mul(u.meter);
u.sqFoot = u.foot.mul(u.foot);
u.kmPH = u.kilometer.div(u.hour);
u.mPH = u.mile.div(u.hour);
u.degree = u.radian.mul(Unit.one(Math.PI / 180)).rename('degree');
u.turn = u.degree.mul(Unit.one(360)).rename('turn');
u.rpm = u.turn.div(u.minute);
u.micrometer = u.meter.div(Unit.one(1000000)).rename('micrometer');

u.microstrain = u.micrometer.div(u.meter);

u.g = u.mPerSS.mul(Unit.one(9.80665)).rename('g');

u.pound = u.kilogram.mul(Unit.one(0.45359237)).rename('pound');
u.ounce = u.pound.mul(Unit.one(1/16)).rename('ounce');
u.grain = u.pound.mul(Unit.one(1/7000)).rename('grain');

u.kilogramForce = u.kilogram.mul(u.g).rename('kilogramForce');
u.poundForce = u.pound.mul(u.g).rename('poundForce');

u.decimeter = u.centimeter.mul(Unit.one(10)).rename('decimeter');

u.liter = u.decimeter.mul(u.decimeter, u.decimeter).rename('liter');

u.gallon = u.liter.mul(Unit.one(3.785)).rename('gallon');
u.quart = u.gallon.mul(Unit.one(1/4)).rename('quart');
u.pint = u.quart.mul(Unit.one(1/2)).rename('pint');
u.fluidOunce = u.pint.mul(Unit.one(1/6)).rename('fluidOunce');

u.PSI = u.poundForce.div(u.inch, u.inch).rename('PSI');

u.degreeC = u.kelvin.set({ m: [ 1, 273.15 ] }).rename('degreeC');
u.degreeF = u.kelvin.set({ m: [ 5/9, 459.67 ] }).rename('degreeF');
u.degreeR = u.kelvin.set({ m: [ 5/9, 0 ] }).rename('degreeR');
u.deltaC = u.degreeC.set({ absolute: 0 });
u.deltaF = u.degreeF.set({ absolute: 0 });

u['°C'] = u.degreeC.rename('°C');
u['°F'] = u.degreeF.rename('°F');
u['Δ°C'] = u.deltaC.rename('Δ°C');
u['Δ°F'] = u.deltaF.rename('Δ°F');

console.log(u);

for (let k of Object.keys(u)) {
    console.log(u[k]);
    u[k].print();
}

// printUnit(u.lux.mul(u.volt, u.degree, u.tesla, u.pascal, u.foot, u.minute));

export { Unit, u as units };
