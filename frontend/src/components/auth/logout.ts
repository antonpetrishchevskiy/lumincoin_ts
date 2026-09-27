import {config} from "../../config/config";
import {AuthTokens} from "../utils/auth-utils";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";

export class Logout {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType;
    readonly logoutUserName: HTMLElement | null;
    readonly logoutExitBtn: HTMLElement | null;
    private isBlock = false;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.logoutUserName = document.getElementById("layoutUserNameBlock");
        this.logoutExitBtn = document.getElementById("exit-layout");

        this.logoutUserName?.addEventListener("click", () => this.showBtnExit());
        this.logoutExitBtn?.addEventListener("click", (event) => {
            this.logout(event).catch((error) => console.error('Logout error:', error));
        });
    }

    private showBtnExit(): void {
        if (!this.logoutExitBtn) {
            return;
        }

        this.logoutExitBtn.style.display = this.isBlock ? "block" : "none";
        this.isBlock = !this.isBlock;
    }

    private async logout(_event: Event): Promise<void> {
        const refreshToken = AuthTokens.getToken(AuthTokens.refreshTokenKey);

        try {
            if (refreshToken) {
                await fetch(config.api + '/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({refreshToken}),
                });
            }
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            AuthTokens.clearSession();
            await this.openNewRouteAutomatic('/login');
        }
    }
}
