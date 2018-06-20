import { Unit, IUnit, baseUnits as units } from '../index';
import { expect } from 'chai';
import 'mocha';

let epsilon = 1e-9;

let baseUnitNames = [
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

describe('Unit basics', () => {
    it('should be creatable', () => {
        let props: IUnit = {
            mode: 'normal',
            name: { test: 1 },
            terms: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
            customTerms: { test: 1 },
            m: [ 1, 0 ],
        };
        let u = Unit.one().set(props);
        expect(u.mode).to.equal(props.mode);
        expect(u.name).to.deep.equal(props.name);
        expect(u.terms).to.deep.equal(props.terms);
        expect(u.customTerms).to.deep.equal(props.customTerms);
        expect(u.m).to.deep.equal(props.m);
    });

    it('should have base units pre-populated', () => {
        let term = 0;
        let terms = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        for (let base of baseUnitNames) {
            let u = units[base];
            expect(u).to.exist;
            expect(u.nameFormat()).to.equal(base);
            expect(u.baseFormat()).to.equal(base);
            terms[term] = 1;
            expect(u.terms).to.deep.equal(terms);
            terms[term++] = 0;
            expect(u.m).to.deep.equal([ 1, 0 ]);
        }
    });

    describe('Unit.one()', () => {
        it('should create a unit with appropriate m', () => {
            let u = Unit.one(42);
            expect(u.m).to.deep.equal([ 42, 0 ]);
            u = Unit.one(5/9, 32);
            expect(u.m).to.deep.equal([ 5/9, 32 ]);
        });
    });

    it('should add terms on multiplication', () => {
        let u = units.meter.mul(units.meter, units.kilogram, units.second);
        expect(u).to.exist;
        expect(u.nameFormat()).to.equal('meter^2 kilogram second');
        expect(u.baseFormat()).to.equal('meter^2 kilogram second');
    });

    it('should subtract terms on division', () => {
        let u = units.meter.div(units.kilogram, units.second, units.second);
        expect(u).to.exist;
        expect(u.nameFormat()).to.equal('meter kilogram^-1 second^-2');
        expect(u.baseFormat()).to.equal('meter kilogram^-1 second^-2');
    });

    it('should allow adding same unit', () => {
        expect(() => units.meter.add(units.meter)).to.not.throw(Error);
    });

    it('should not allow adding different unit', () => {
        expect(() => units.meter.add(units.kilogram)).to.throw(
            'Can not add <kilogram> to <meter>'
        );
    });

    it('should allow adding same unit', () => {
        expect(() => units.meter.add(units.meter)).to.not.throw();
        let [ u, om, lm, rm ] = units.meter.add(units.meter);
        expect(u).to.deep.equal(units.meter);
        for (let m of [ om, lm, rm ]) {
            expect(m[0]).to.be.closeTo(1, epsilon);
            expect(m[1]).to.be.closeTo(0, epsilon);
        }
    });

    describe('Custom bases', () => {
        it('should have correct name', () => {
            let u = Unit.base('frog');
            expect(u.nameFormat()).to.equal('frog');
            expect(u.baseFormat()).to.equal('frog');
        });

        it('should return false from isDimensionless()', () => {
            expect(Unit.base('frog').isDimensionless()).to.be.false;
        });
    });

});
