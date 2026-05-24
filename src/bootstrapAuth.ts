import { userStore } from "@/store/UserStore";
import { UserApi } from "@/api/UserApi";

/** Сверяет флаг loggedIn в сторе с реальной cookie-сессией (через getCurrent + refresh в ApiService). */
export async function bootstrapAuth(): Promise<void> {
    const store = userStore();
    if (!store.loggedIn) {
        return;
    }

    const userApi = new UserApi();
    const response = await userApi.getCurrent();

    if (response.data) {
        store.applyCurrentUser(response.data);
    }
}
