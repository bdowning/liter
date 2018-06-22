import { Unit, units,
         Q, q,
         UnitConversionNetwork } from '../index';
import { expect } from 'chai';
import 'mocha';

let epsilon = 1e-6;

describe('Conversion network', () => {
    it('should be creatable', () => {
        let net = new UnitConversionNetwork();
    });

    it('should be loadable with rates', () => {
        let net = new UnitConversionNetwork();
        net.addRate(42, Unit.base('thing'), 12, units.kilogram);
        net.addRate(9, Unit.base('stuff'), 9, units.pound);
    });

    it('should fail when adding duplicate rates', () => {
        let net = new UnitConversionNetwork();
        net.addRate(42, Unit.base('thing'), 12, units.kilogram);
        expect(() => net.addRate(9, Unit.base('thing'), 9, units.pound)).to.throw();
    });

    it('should produce a conversion rate', () => {
        let net = new UnitConversionNetwork();
        net.addRate(42, Unit.base('thing'), 12, units.kilogram);
        net.addRate(1, Unit.base('stuff'), 9, units.pound);
        let u = net.getConversionUnit(Unit.base('thing'), Unit.base('stuff'));
        if (!u) throw new Error('no conversion');
        expect(u.termsKey()).to.equal('[0,0,0,0,0,0,0,0,0,"stuff",1,"thing",-1]');
        let c = q(3.5, Unit.base('thing')).mul(q(1, u)).convert(Unit.base('stuff'));
        expect(c.n).to.be.closeTo(1/4.082328, epsilon);
    });

    it('should produce all valid conversion rates', () => {
        let net = new UnitConversionNetwork();
        net.addRate(42, Unit.base('thing'), 12, units.kilogram);
        net.addRate(1, Unit.base('stuff'), 9, units.pound);
        net.getConversionUnit(Unit.base('thing'), Unit.base('stuff'));
        net.getConversionUnit(Unit.base('stuff'), Unit.base('thing'));
        net.getConversionUnit(units.kilogram, Unit.base('thing'));
        net.getConversionUnit(units.kilogram, Unit.base('stuff'));
        net.getConversionUnit(Unit.base('thing'), units.kilogram);
        net.getConversionUnit(Unit.base('stuff'), units.kilogram);
    });

    it('should fail to convert where no continuity exists', () => {
        let net = new UnitConversionNetwork();
        net.addRate(42, Unit.base('thing'), 12, units.kilogram);
        net.addRate(1, Unit.base('stuff'), 9, units.ampere);
        expect(net.getConversionUnit(Unit.base('thing'), Unit.base('stuff'))).to.not.exist;
        expect(net.getConversionUnit(Unit.base('stuff'), Unit.base('thing'))).to.not.exist;
        expect(net.getConversionUnit(units.kilogram, Unit.base('thing'))).to.exist;
        expect(net.getConversionUnit(units.kilogram, Unit.base('stuff'))).to.not.exist;
        expect(net.getConversionUnit(Unit.base('thing'), units.kilogram)).to.exist;
        expect(net.getConversionUnit(Unit.base('stuff'), units.kilogram)).to.not.exist;
    });
});

