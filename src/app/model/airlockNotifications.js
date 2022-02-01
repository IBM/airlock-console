"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirlockNotifications = exports.NotificationLimitations = void 0;
var airlockNotification_1 = require("./airlockNotification");
var NotificationLimitations = /** @class */ (function () {
    function NotificationLimitations() {
    }
    return NotificationLimitations;
}());
exports.NotificationLimitations = NotificationLimitations;
var AirlockNotifications = /** @class */ (function () {
    function AirlockNotifications() {
    }
    AirlockNotifications.clone = function (airlockNotifications) {
        if (airlockNotifications == null) {
            return null;
        }
        var toRet = new AirlockNotifications();
        toRet.lastModified = airlockNotifications.lastModified;
        toRet.seasonId = airlockNotifications.seasonId;
        toRet.configurationSchema = Object.assign({}, airlockNotifications.configurationSchema);
        if (airlockNotifications.notifications != null) {
            toRet.notifications = [];
            for (var i = 0; i < airlockNotifications.notifications.length; i++) {
                toRet.notifications.push(airlockNotification_1.AirlockNotification.clone(airlockNotifications.notifications[i]));
            }
        }
        else {
            toRet.notifications = null;
        }
        if (airlockNotifications.notificationsLimitations != null) {
            toRet.notificationsLimitations = [];
            for (var i = 0; i < airlockNotifications.notificationsLimitations.length; i++) {
                var limit = new NotificationLimitations();
                limit.minInterval = airlockNotifications.notificationsLimitations[i].minInterval;
                limit.maxNotifications = airlockNotifications.notificationsLimitations[i].maxNotifications;
                toRet.notificationsLimitations.push(limit);
            }
        }
        else {
            toRet.notificationsLimitations = null;
        }
        return toRet;
    };
    return AirlockNotifications;
}());
exports.AirlockNotifications = AirlockNotifications;
//# sourceMappingURL=airlockNotifications.js.map