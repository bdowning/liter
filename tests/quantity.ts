import { Unit, units, Q, q } from '../index';
import { expect } from 'chai';
import 'mocha';

let epsilon = 1e-9;

describe('Quantity conversions', () => {
    it('should allow simple conversions', () => {
        let res = q(1, units.inch).convert(units.millimeter);
        expect(res.n).to.be.closeTo(25.4, epsilon);
    });

    it('should handle disparate area multiplies', () => {
        let res = q(10, units.foot).mul(q(10, units.meter)).convert(units.sqMeter);
        expect(res.n).to.be.closeTo(30.48, epsilon);
    });

    it('should handle offset conversions', () => {
        let res = q(25, units.degreeC).convert(units.degreeF);
        expect(res.n).to.be.closeTo(77, epsilon);
    });

    it('should handle offset subtractions to delta', () => {
        let res = q(25, units.degreeC).sub(q(20, units.degreeC));
        expect(res.u.nameFormat()).to.equal('delta_degreeC');
        expect(res.n).to.be.closeTo(5, epsilon);
        expect(res.convert(units.kelvin).n).to.be.closeTo(5, epsilon);
    });

    it('should handle offset and relative addition', () => {
        let delta5C = q(25, units.degreeC).sub(q(20, units.degreeC));
        let aPlusD = q(70, units.degreeF).add(delta5C);
        let dPlusA = delta5C.add(q(70, units.degreeF));
        expect(aPlusD.u.nameFormat()).to.equal('degreeF');
        expect(aPlusD.n).to.be.closeTo(79, epsilon);
        expect(dPlusA.u.nameFormat()).to.equal('degreeF');
        expect(dPlusA.n).to.be.closeTo(79, epsilon);
    });

    it('should disallow offset addition', () => {
        expect(() => q(70, units.degreeF).add(q(5, units.degreeC)))
            .to.throw(Error);
    });

    it('should disallow offset multiplication', () => {
        expect(() => q(70, units.degreeF).mul(q(5, units.degreeC)))
            .to.throw(Error);
    });

});

