import { AirlockNotification } from './airlockNotification';

export class NotificationLimitations {
    maxNotifications;
    minInterval: number;
}

export class AirlockNotifications {
    lastModified : number;
    seasonId: string;
    configurationSchema;
    notifications: AirlockNotification[];
    notificationsLimitations: NotificationLimitations[];
    static clone(airlockNotifications: AirlockNotifications) : AirlockNotifications {
        if(airlockNotifications == null){
            return null;
        }
        let toRet:AirlockNotifications = new AirlockNotifications();
        toRet.lastModified = airlockNotifications.lastModified;
        toRet.seasonId = airlockNotifications.seasonId;
        toRet.configurationSchema = Object.assign({}, airlockNotifications.configurationSchema);
        if(airlockNotifications.notifications != null){
            toRet.notifications = [];
            for(var i=0; i<airlockNotifications.notifications.length; i++){
                toRet.notifications.push(AirlockNotification.clone(airlockNotifications.notifications[i]));
            }
        }
        else{
            toRet.notifications = null
        }

        if(airlockNotifications.notificationsLimitations != null){
            toRet.notificationsLimitations = [];
            for(var i=0; i<airlockNotifications.notificationsLimitations.length; i++){
                var limit = new NotificationLimitations();
                limit.minInterval = airlockNotifications.notificationsLimitations[i].minInterval;
                limit.maxNotifications = airlockNotifications.notificationsLimitations[i].maxNotifications;
                toRet.notificationsLimitations.push(limit);
            }
        }
        else{
            toRet.notificationsLimitations = null
        }

        return toRet;
    }
}