import { Unit } from './unit';

type IEdge = {
    leftRate: Unit,
    rightRate: Unit,
};

export class UnitConversionNetwork {
    private edges: { [left: string]: { [right: string]: IEdge } } = { };

    addRate(num: number, numUnit: Unit, denom: number, denomUnit: Unit) {
        let numRate = numUnit.mul(Unit.one(num));
           
    }
};
