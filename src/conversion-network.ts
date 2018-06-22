import { Unit } from './unit';

type IEdge = {
    leftRate: Unit,
    rightRate: Unit,
};

export class UnitConversionNetwork {
    private edges: { [left: string]: { [right: string]: IEdge } } = { };

    private addEdge(left: string, leftRate: Unit, right: string, rightRate: Unit) {
        if (!this.edges[left])
            this.edges[left] = { };
        if (this.edges[left][right])
            throw new Error('duplicate edge');
        this.edges[left][right] = { leftRate, rightRate };
    }

    addRate(num: number, numUnit: Unit, denom: number, denomUnit: Unit) {
        this.rates = undefined;
        let numRate = numUnit.mul(Unit.one(num));
        let denomRate = denomUnit.mul(Unit.one(denom));
        this.addEdge(numUnit.termsKey(), numRate, denomUnit.termsKey(), denomRate);
        this.addEdge(denomUnit.termsKey(), denomRate, numUnit.termsKey(), numRate);
    }

    private rates?: { [key: string]: Unit | undefined };

    private computeRates() {
        if (this.rates)
            return this.rates;
        this.rates = { };
        let rates = this.rates;

        let walk = (
            fromK: string,
            leftK: string,
            pathRate: Unit,
            visited: { [x: string]: boolean },
        ) => {
            for (let rightK in this.edges[leftK]) {
                if (rightK === fromK || visited[rightK])
                    continue;
                visited[rightK] = true;
                let { leftRate, rightRate } = this.edges[leftK][rightK];
                let rate = pathRate.mul(leftRate.div(rightRate));
                if (rates[rate.termsKey()] != null)
                    throw new Error('duplicate rate');
                rates[rate.termsKey()] = rate;
                walk(fromK, rightK, rate, visited);
            }
        };

        for (let fromK in this.edges)
            walk(fromK, fromK, Unit.one(), { });

        return rates;
    }

    getConversionUnit(from: Unit, to: Unit) {
        let rates = this.computeRates();
        let rateU = to.div(from);
        return rates[rateU.termsKey()];
    }
};
