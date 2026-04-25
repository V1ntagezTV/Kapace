import { userStore } from "@/store/UserStore";
import { ClientEventStore, EventTypes } from "@/store/ClientEventStore";

type RefreshResult = boolean;

let refreshPromise: Promise<RefreshResult> | null = null;
let authLostHandled = false;

async function callRefreshCookie(): Promise<boolean> {
  const path = `${process.env.VUE_APP_SERVER_API_ADDRESS}v1/user/refresh-cookie`;

  try {
    const response = await fetch(path, {
      method: "POST",
      credentials: "include",
      headers: new Headers({ "Content-Type": "application/json; charset=utf-8" }),
      body: JSON.stringify({}),
    });

    return response.status === 200;
  } catch {
    return false;
  }
}

async function callCookieLogoutBestEffort(): Promise<void> {
  const path = `${process.env.VUE_APP_SERVER_API_ADDRESS}v1/user/cookie-logout`;

  try {
    await fetch(path, {
      method: "POST",
      credentials: "include",
      headers: new Headers({ "Content-Type": "application/json; charset=utf-8" }),
      body: JSON.stringify({}),
    });
  } catch {
    // ignore
  }
}

export const AuthSession = {
  async refresh(): Promise<boolean> {
    if (!refreshPromise) {
      refreshPromise = callRefreshCookie().finally(() => {
        refreshPromise = null;
      });
    }

    return await refreshPromise;
  },

  async handleAuthLost(): Promise<void> {
    if (authLostHandled) {
      return;
    }
    authLostHandled = true;

    const events = ClientEventStore();
    const store = userStore();

    events.push("Сессия истекла. Войдите снова.", EventTypes.Error);

    await callCookieLogoutBestEffort();
    store.LogOut();

    // Динамический import, иначе цикл: ApiService -> AuthSession -> router -> *Service -> ApiService (TDZ)
    const { default: router } = await import("@/router");
    const currentPath = router.currentRoute.value?.fullPath ?? "/";
    if (currentPath !== "/login") {
      await router.replace({ path: "/login", query: { returnUrl: currentPath } });
    }
  },

  resetAuthLostFlagForTestsOrLogin(): void {
    authLostHandled = false;
  },
};

