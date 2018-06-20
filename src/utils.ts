import { UnitM } from './unit';

export function dotM2(m2: UnitM, m1: UnitM): UnitM {
    let [ a1, b1 ] = m1, [ a2, b2 ] = m2;
    // console.log('dotM2', m2, '.', m1, '->', [ a1 * a2, a2 * b1 + b2 ]);
    return [ a1 * a2, a2 * b1 + b2 ];
}

export function dotM(mn: UnitM, ...m: UnitM[]) {
    // console.log('dotM', mn, m);
    return m.reduce((l, r) => dotM2(l, r), mn);
}

export function applyM(m: UnitM, val: number) {
    return val * m[0] + m[1];
}
