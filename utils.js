export function dotM2(m2, m1) {
    let [ a1, b1 ] = m1, [ a2, b2 ] = m2;
    console.log('dotM2', m2, '.', m1, '->', [ a1 * a2, a2 * b1 + b2 ]);
    return [ a1 * a2, a2 * b1 + b2 ];
}

export function dotM(mn, ...m) {
    console.log('dotM', mn, m);
    return m.reduce((l, r) => dotM2(l, r), mn);
}

export function applyM(m, val) {
    return val * m[0] + m[1];
}

