import { Unit, baseUnits } from './unit';

let u = { ...baseUnits };

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
u.millimeter = u.meter.mul(Unit.one(1/1000)).rename('millimeter');
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
u.delta_degreeC = u.degreeC.delta();
u.delta_degreeF = u.degreeF.delta();

export { u as units };
