import {Rule} from './rule';

export class Visualization {

    /*
    private VisualizationType type;
	private String additionalMarkup;
     */
    type: string; //PIE, BAR, TEXT
    additionalMarkup: string;

    static clone(feat: Visualization): Visualization {
        let toRet: Visualization = new Visualization();
        toRet.type = feat.type;
        toRet.additionalMarkup = feat.additionalMarkup;
        return toRet;
    }


}
