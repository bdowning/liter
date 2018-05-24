import { Unit, units } from '../index';
import { expect } from 'chai';
import 'mocha';

let epsilon = 1e-9;

let baseUnits = [
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
        let props = {
            mode: 'normal',
            name: { test: 1 },
            terms: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
            customTerms: { test: 1 },
            m: <[ number, number ]>[ 1, 0 ],
        };
        let u = Unit.one().set(props);
        expect(u).to.deep.equal(props);
    });

    it('should have base units pre-populated', () => {
        let term = 0;
        let terms = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        for (let base of baseUnits) {
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

});
