import { Unit } from './unit';
import { applyM } from './utils';
import { units } from './units';

export class Q {
    constructor(
        public n: number,
        public u: Unit
    ) {
    }

    add(rhs: Q): Q {
        let lhs: Q = this;
        if (lhs.u.isDimensionless())
            lhs = new Q(lhs.n, rhs.u);
        if (rhs.u.isDimensionless())
            rhs = new Q(rhs.n, lhs.u);
        // console.log('Q.add', lhs.u, rhs.u);
        let [ u, om, lm, rm ] = lhs.u.add(rhs.u);
        // console.log('Q.add', [ om, lm, rm ], this.n, this.u, rhs.n, rhs.u);
        return new Q(applyM(om, applyM(lm, lhs.n) + applyM(rm, rhs.n)), u);
    }

    sub(rhs: Q): Q {
        let lhs: Q = this;
        if (lhs.u.isDimensionless())
            lhs = new Q(lhs.n, rhs.u);
        if (rhs.u.isDimensionless())
            rhs = new Q(rhs.n, lhs.u);
        let [ u, om, lm, rm ] = lhs.u.sub(rhs.u);
        // console.log('Q.sub', [ om, lm, rm ], this.n, this.u, rhs.n, rhs.u);
        return new Q(applyM(om, applyM(lm, lhs.n) - applyM(rm, rhs.n)), u);
    }

    mul(rhs: Q): Q {
        let [ u, om, lm, rm ] = this.u.mul2(rhs.u);
        // console.log('Q.mul', [ om, lm, rm ], this.n, this.u, rhs.n, rhs.u);
        return new Q(applyM(om, applyM(lm, this.n) * applyM(rm, rhs.n)), u);
    }

    div(rhs: Q): Q {
        let [ u, om, lm, rm ] = this.u.mul2(rhs.u.inv());
        // console.log('Q.div', [ om, lm, rm ], this.n, this.u, rhs.n, rhs.u);
        return new Q(applyM(om, applyM(lm, this.n) / applyM(rm, rhs.n)), u);
    }

    pow(rhs: Q): Q {
        if (!rhs.u.isDimensionless())
            throw new Error('rhs of pow must be dimensionless');
        let n = rhs.n;
        if (n === 0)
            return q.one;
        let res: Q = this;
        if (n > 0) {
            for (let i = 1; i < n; ++i)
                res = res.mul(this);
        } else {
            for (let i = 0; i > n; --i)
                res = res.div(this);
        }
        return res;
    }

    convert(to: Unit) {
        // console.log('what', to);
        let [ u, om, lm, rm ] = to.add(this.u, true);
        return new Q(applyM(om, applyM(rm, this.n)), u);
    }

    setUnit(u: Unit) {
        return new Q(this.n, u);
    }

    inspect() {
        let out: any[] = [ this.n ];
        let name = this.u.nameFormat();
        if (name)
            out.push(name);
        return '<'+out.join(' ')+'>';
    }
}

function _q(num: number | Q, unit?: Unit) {
    if (num instanceof Q) {
        if (unit)
            return new Q(num.n, unit);
        return num;
    }
    return new Q(num, unit || u.one);
}

let qs: { [name: string]: Q } = {
    zero: _q(0, units.one),
};

for (let n in units)
    qs[n] = _q(1, units[n]);

export let q = Object.assign(_q, qs);

let u = units;

// let s1 = q.volt.div(q.one).mul(q(0.00014125));
// let o1 = q.volt.mul(q(2.2));

// let s2 = q.newton.div(q.volt).mul(q(0.00632));
// let o2 = q.newton.mul(q(-0.00343));

// let v = q(0x3a4b);
// console.log(v);
// v.u.print();
// v = v.mul(s1).add(o1);
// console.log(v);
// v.u.print();
// v = v.mul(s2).add(o2);
// console.log(v);
// v.u.print();
// v = v.convert(u.poundForce);
// console.log(v);
// v.u.print();

// console.log('HIHIHI');

// let s3 = q.deltaC.div(q.volt).mul(q(3.5));
// let o3 = q(15, u.degreeC);

// console.log(s3);
// console.log(o3);

// v = q(0x3a4b);
// console.log(v);
// v.u.print();
// v = v.mul(s1).add(o1);
// console.log(v);
// v.u.print();
// console.log(v.mul(s3));
// v = v.mul(s3).add(o3);
// console.log(v);
// v.u.print();

// let s4 = q.deltaC.div(q.volt).mul(q(10));
// let s5 = q.volt.div(q.deltaC).mul(q(1/10));

// console.log(s4);
// s4.u.print();

// console.log(q(2.5, u.volt).mul(s4));


// console.log(s5);
// s5.u.print();
// console.log(q(25, u.degreeC).mul(s5));

// console.log(q.degreeF.add(q.degreeC));
// console.log(q.degreeC.add(q.degreeF));

// console.log(q.degreeC.convert(u.degreeF));
// console.log(q.degreeF.convert(u.degreeC));
// console.log(q.degreeC.sub(q(0, u.degreeC)).convert(u.degreeF));
// console.log(q.degreeF.sub(q(0, u.degreeF)).convert(u.degreeC));

// console.log(u.deltaC.mul(u.deltaC));

// console.log(q(10, u.degreeC).mul(q(10, u.degreeC)));
// console.log(q(10, u.degreeC).mul(q(10, u.deltaC)));
// console.log(q(10, u.deltaC).mul(q(10, u.deltaC)));

// console.log(q(10, u.degreeC).mul(q(10, u.degreeC)).div(q(10, u.degreeC)));
// console.log(q(10, u.degreeC).mul(q(10, u.deltaC)).div(q(10, u.deltaC)));
// console.log(q(10, u.degreeC).mul(q(10, u.deltaC)).div(q(10, u.degreeC)));
// console.log(q(10, u.deltaC).mul(q(10, u.deltaC)).div(q(10, u.deltaC)));

// console.log(q(10, u.degreeC).mul(q(20, u.degreeC)).div(q(10, u.degreeC)));
// console.log(q(10, u.degreeC).mul(q(20, u.degreeC)).div(q(20, u.degreeC)));
// console.log(q(10, u.deltaC).mul(q(20, u.deltaC)).div(q(10, u.deltaC)));
// console.log(q(10, u.deltaC).mul(q(20, u.deltaC)).div(q(20, u.deltaC)));

// console.log(q(10, u.degreeC).mul(q(10, u.degreeF)));
// console.log(q(10, u.degreeC).mul(q(10, u.degreeF)).div(q(10, u.degreeC)));
// console.log(q(10, u.degreeC).mul(q(10, u.degreeF)).div(q(10, u.degreeF)));

// console.log(q(10, u.degreeC).mul(q(10, u.deltaF)).div(q(10, u.degreeC)));
// console.log(q(10, u.deltaC).mul(q(10, u.degreeF)).div(q(10, u.degreeF)));

// console.log(q(20, u.degreeC).mul(q(20, u.degreeC)).convert(u.kelvin.mul(u.kelvin)));

// console.log(q(10, u.degreeC).mul(q(10, u.degreeF)).convert(u.kelvin.mul(u.kelvin)));

// console.log(q(10, u.degreeC).mul(q(10, u.degreeF)).div(q(10, u.kelvin)).convert(u.degreeC));
// console.log(q(10, u.deltaC).mul(q(10, u.deltaF)).div(q(10, u.kelvin)).convert(u.deltaF));

// console.log(q(0, u.degreeF).mul(q(0, u.degreeF)).convert(u.deltaF.mul(u.degreeF)).div(q(0, u.degreeF)));
// console.log(q(0, u.degreeC).mul(q(0, u.degreeC)));

// console.log(q(1).div(q(1).div(q(0, u.degreeF)).convert(u.degreeC.inv())));

// console.log(q(10, u.degreeC.mul(u.degreeC)).add(q(10, u.deltaF.mul(u.deltaF))).div(q(10, u.deltaF)).convert(u.degreeF));

// console.log(q(1).div(q.degreeC));

// console.log(q(0, u.degreeC), q(0, u.deltaC));
// console.log(q(0, u.deltaC).add(q(2, u.degreeF)));
// console.log(q(2, u.degreeF).add(q(0, u.deltaC)));
// console.log(q(0, u.degreeC).convert(u.degreeF));
// console.log(q(0, u.degreeF).convert(u.degreeC));

// console.log(q(q(47.5, u.microstrain));
