import {Experiment} from "./experiment";

export class ExperimentsContainer {
    productId: string;
    experiments: Experiment[];
    lastModified: number;
    maxExperimentsOn: number;

    static clone(container: ExperimentsContainer): ExperimentsContainer {
        let toRet: ExperimentsContainer = new ExperimentsContainer;
        toRet.productId = container.productId;
        toRet.lastModified = container.lastModified;
        toRet.maxExperimentsOn = container.maxExperimentsOn;
        toRet.experiments = [];
        for (let exp of container.experiments) {
            let expClone = Experiment.clone(exp);
            toRet.experiments.push(expClone);
        }
        return toRet;
    }

}
