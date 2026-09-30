import {AuthTokens} from "../utils/auth-utils";
import {OpenNewRouteAutomaticType} from "../../types/openNewRouteAutomatic.type";
import {Response} from "../utils/response-utils";

export class Logout {
    readonly openNewRouteAutomatic: OpenNewRouteAutomaticType;
    readonly logoutUserName: HTMLElement | null;
    readonly logoutExitBtn: HTMLButtonElement | null;

    constructor(openNewRouteAutomatic: OpenNewRouteAutomaticType) {
        this.openNewRouteAutomatic = openNewRouteAutomatic;
        this.logoutUserName = document.getElementById("layoutUserNameBlock");
        this.logoutExitBtn = document.getElementById("exit-layout") as HTMLButtonElement | null;

        this.logoutUserName?.addEventListener("click", () => this.showBtnExit());
        this.logoutExitBtn?.addEventListener("click", (event) => {
            this.logout(event).catch((error) => console.error('Logout error:', error));
        });
    }

    private showBtnExit(): void {
        if (!this.logoutExitBtn) {
            return;
        }

        this.logoutExitBtn.hidden = !this.logoutExitBtn.hidden;
    }

    private async logout(_event: Event): Promise<void> {
        const refreshToken = AuthTokens.getToken(AuthTokens.refreshTokenKey);

        try {
            if (refreshToken) {
                await Response.getElementsFromBackend(
                    'POST',
                    '/logout',
                    null,
                    {refreshToken}
                );
            }
        } finally {
            AuthTokens.clearSession();
            await this.openNewRouteAutomatic('/login');
        }
    }
}
