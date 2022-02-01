import {Rule} from './rule';

export class BasePoll {

    /*
    protected UUID uniqueId = null; //nc + u
	protected String creator = null;	//c+u (creator not changed)
	protected Date creationDate = null; //nc + u (not changed)
	protected Date lastModified = new Date();
	protected Stage stage = null; //c+u
	protected Boolean enabled; //c+u
	protected String[] internalUserGroups = null; //opt in creation + in update if missing or null ignore , if empty array then emptying
	protected Rule rule; //required in update
	protected Double rolloutPercentage = null; //required in updateprotected String creator = null;
	protected String description = null; //opt in c+u (if missing or null in update don't change)
	protected String minVersion = null; //required in create and update
	protected String maxVersion = null; //optional
     */
    uniqueId: string;
    creator: string;
    creationDate: number;
    lastModified: number;
    stage: string;
    enabled: boolean;
    internalUserGroups: string[];
    rule: Rule;
    rolloutPercentage: number;
    description: string;


    static clone(feat: BasePoll): BasePoll {
        let toRet: BasePoll = new BasePoll();
        toRet.uniqueId = feat.uniqueId;
        toRet.creator = feat.creator;
        toRet.enabled = feat.enabled;
        toRet.lastModified = feat.lastModified;
        toRet.stage = feat.stage;
        toRet.creationDate = feat.creationDate;
        toRet.description = feat.description;
        toRet.rule = Rule.clone(feat.rule);
        toRet.rolloutPercentage = feat.rolloutPercentage;
        toRet.uniqueId = feat.uniqueId;
        toRet.internalUserGroups = BasePoll.duplicateArrayString(feat.internalUserGroups);
        return toRet;
    }

    static cloneToBasePoll(feat: BasePoll, target: BasePoll) {
        target.uniqueId = feat.uniqueId;
        target.creator = feat.creator;
        target.enabled = feat.enabled;
        target.lastModified = feat.lastModified;
        target.stage = feat.stage;
        target.creationDate = feat.creationDate;
        target.description = feat.description;
        target.rule = Rule.clone(feat.rule);
        target.rolloutPercentage = feat.rolloutPercentage;
        target.uniqueId = feat.uniqueId;
        target.internalUserGroups = BasePoll.duplicateArrayString(feat.internalUserGroups);
    }

    static duplicateArrayString(array: Array<string>): Array<string> {
        let arr = [];
        if (array != null) {
            array.forEach((x) => {
                arr.push(x);
            })
        }
        return arr;
    }

    static duplicateArray(array: Array<any>): Array<any> {
        let arr = [];
        if (array != null) {
            array.forEach((x) => {
                arr.push(Object.assign({}, x));
            })
        }
        return arr;
    }


}
