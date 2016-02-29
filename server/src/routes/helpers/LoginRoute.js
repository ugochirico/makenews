"use strict";
import UserRequest from "../../../src/login/UserRequest.js";
import HttpResponseHandler from "../../../../common/src/HttpResponseHandler.js";
import ClientConfig from "../../../src/config/ClientConfig.js";
import RouteLogger from "../RouteLogger.js";
import Route from "./Route.js";
import StringUtil from "../../../../common/src/util/StringUtil.js";

export default class LoginRoute extends Route {
    constructor(request, response, next) {
        super(request, response, next);
        this.userName = this.request.body.username;
        this.password = this.request.body.password;
    }

    valid() {
        if(StringUtil.isEmptyString(this.userName) || StringUtil.isEmptyString(this.password)) {
            return false;
        }
        return true;
    }

    handle() {
        try {
            if(!this.valid()) {
                return this._handleFailure({ "message": "unauthorized" });
            }
            RouteLogger.instance().info("LoginRoute::handle Login request received for the user = %s", this.request.body.username);

            let userRequest = UserRequest.instance(this.userName, this.password);
            userRequest.getAuthSessionCookie().then(authSessionCookie => {
                userRequest.getUserDetails(userRequest.extractToken(authSessionCookie), this.userName).then(userDetails => {
                    this._handleLoginSuccess(authSessionCookie, userDetails);
                }).catch(error => {
                    RouteLogger.instance().error("LoginRoute::handle Failed while fetching auth session cookie = %s", error);
                    this._handleFailure({ "message": "unauthorized" });
                });
            }).catch(error => { //eslint-disable-line
                RouteLogger.instance().error("LoginRoute::handle Failed while fetching auth session cookie");
                this._handleFailure({ "message": "unauthorized" });
            });
        } catch(error) {
            RouteLogger.instance().error("LoginRoute::handle Unexpected error = %s", error);
            this._handleFailure({ "message": "unauthorized" });
        }
    }

    _handleLoginSuccess(authSessionCookie, userDetails) {
        let dbJson = ClientConfig.instance().db();
        let jsonResponse = { "userName": this.userName, "dbParameters": dbJson };
        if(userDetails.takenTour) {
            jsonResponse.takenTour = userDetails.takenTour;
        }
        this.response.status(HttpResponseHandler.codes.OK)
            .append("Set-Cookie", authSessionCookie)
            .json(jsonResponse);

        RouteLogger.instance().info("LoginRoute::_handleLoginSuccess: Login request successful");
        RouteLogger.instance().debug("LoginRoute::_handleLoginSuccess: response = " + JSON.stringify({ "userName": this.userName, "dbParameters": dbJson }));
    }

    _handleFailure(error) {
        this.response.status(HttpResponseHandler.codes.UNAUTHORIZED);
        this.response.json(error);
    }
}
