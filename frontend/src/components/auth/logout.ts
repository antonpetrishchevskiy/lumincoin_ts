import {config} from "../../config/config";
import {AuthTokens} from "../utils/auth-utils";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";
import {ErrorResultResponse} from "../../types/result-response.type";

export class Logout {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType;
    readonly logoutUserName: HTMLElement | null;
    readonly logoutExitBtn: HTMLElement | null;
    isBlock: boolean;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.logoutUserName = document.getElementById("layoutUserNameBlock");
        this.logoutExitBtn = document.getElementById("exit-layout");
        if (this.logoutUserName) {
            this.logoutUserName.addEventListener("click", this.showBtnExit.bind(this));
        }
        if (this.logoutExitBtn) {
            this.logoutExitBtn.addEventListener("click", this.logout.bind(this));
        }
        this.isBlock = false;
    }

    private showBtnExit(): void {
        if (this.logoutExitBtn) {
            if (this.isBlock) {
                this.logoutExitBtn.style.display = "block";
                this.isBlock = false;
            } else {
                this.logoutExitBtn.style.display = "none";
                this.isBlock = true;
            }
        }
    }

    private async logout(e: Event): Promise<void> {
        const refreshToken = AuthTokens.getToken(AuthTokens.refreshTokenKey);

        const response: Response = await fetch(config.api + '/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                refreshToken: refreshToken,
            })
        });

        const result: ErrorResultResponse = await response.json();

        if (result && !result.error) {
            localStorage.clear();
            this.openNewRouteAutomatic('/login').then();
        }
    }
}