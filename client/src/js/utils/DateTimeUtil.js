"use strict";
import moment from "moment";

export default class DateTimeUtil {

    static getCreatedTime() {
        return moment().utc().valueOf();
    }
    static getLocalTimeFromUTC(dateString) {
        return moment.utc(dateString).local().format("llll");
    }
    static getUTCDateAndTime(dateString) {
        return moment(dateString).utc().format();

    }
}
