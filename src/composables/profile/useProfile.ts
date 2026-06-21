import type { ErrorDetails } from '@/api/ApiService';
import type { FavoriteGetList } from '@/api/FavoriteApi';
import { FavoriteApi } from '@/api/FavoriteApi';
import { UserApi } from '@/api/UserApi';
import { resolveUserAvatarSrc } from '@/helpers/UserAvatarResolver';
import { FavoriteStatus, FavoriteStatuses, getFavoritesStatusKeyByValue } from '@/models/FavoriteStatuses';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { userStore } from '@/store/UserStore';
import { computed, inject, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const defaultFavoriteStatus = 'Категория';

export function useProfile() {
    const router = useRouter();
    const eventStore = ClientEventStore();
    const currentUser = userStore();
    const injectedUserApi = inject<UserApi>('user-api');
    const injectedFavoritesApi = inject<FavoriteApi>('favorite-api');
    if (!injectedUserApi || !injectedFavoritesApi) {
        throw new Error('Profile: провайдеры user-api или favorite-api не найдены');
    }
    const userApi = injectedUserApi;
    const favoritesApi = injectedFavoritesApi;

    const favoriteSelectedCategory = ref<string>(defaultFavoriteStatus);
    const isFavoritesMenuDropped = ref(false);
    const favoritesAllCategory = ref(false);
    const favoritesWatchingCategory = ref(false);

    const userId = ref<number>();
    const userNickname = ref<string>();
    const userCreatedAt = ref<string>();
    const userRoles = ref<string[]>();
    const userEmail = ref<string>();
    const userImageUrl = ref<string>();
    const avatarDisplaySrc = computed(() =>
        userImageUrl.value ?? resolveUserAvatarSrc(currentUser.imageUrl)
    );
    const userFavorites = ref<FavoriteGetList[]>([]);
    const formatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const selectedFavoritesStatus = computed(() => {
        let selectedStatus: FavoriteStatus | null = null;
        if (favoritesAllCategory.value) {
            selectedStatus = null;
        } else if (favoritesWatchingCategory.value) {
            selectedStatus = FavoriteStatus.Watching;
        } else if (favoriteSelectedCategory.value !== defaultFavoriteStatus) {
            const statusKey = getFavoritesStatusKeyByValue(favoriteSelectedCategory.value);
            if (statusKey !== undefined) {
                selectedStatus = FavoriteStatus[statusKey];
            }
        }

        return selectedStatus;
    });

    onMounted(async () => {
        if (currentUser.loggedIn !== true) {
            eventStore.push('Сначала необходимо авторизоваться!', EventTypes.Error as never);
            await router.push('/login');
            return;
        }

        await loadCurrentUser();
        await loadFavorites();
    });

    function getDateStr(dateNum: number): string {
        const date = new Date(dateNum);
        return formatter.format(date) + ' ' + date.toLocaleDateString();
    }

    async function loadFavorites() {
        const favorites = await favoritesApi.getList(
            selectedFavoritesStatus.value as FavoriteStatus,
            0,
            0
        );
        userFavorites.value = favorites.data?.Favorites ?? [];
    }

    async function loadCurrentUser() {
        try {
            const userResponse = (await userApi.getCurrent())
                .onBusinessError((errorDetails: ErrorDetails) => {
                    if (errorDetails.ErrorCode === 'Unauthorized') {
                        return;
                    }
                    eventStore.push(errorDetails.Message, EventTypes.Error);
                })
                .onException(() => eventStore.push('Ошибка сервера! Попробуйте снова позже.', EventTypes.Error));

            if (!userResponse.data) {
                return;
            }

            const user = userResponse.data;
            currentUser.applyCurrentUser(user);
            userId.value = user.User.Id;
            userNickname.value = user.User.Nickname;
            userCreatedAt.value = getDateStr(user.User.CreatedAt);
            userRoles.value = user.Roles.map((x) => x.Alias);
            userEmail.value = user.User.Email;
            userImageUrl.value = resolveUserAvatarSrc(user.User.ImageUrl);
        } catch (e) {
            console.log(e);
        }
    }

    function selectAllCategory() {
        favoritesAllCategory.value = !favoritesAllCategory.value;
        favoritesWatchingCategory.value = false;
        favoriteSelectedCategory.value = defaultFavoriteStatus;
        void loadFavorites();
    }

    function selectWatchingCategory() {
        favoritesWatchingCategory.value = !favoritesWatchingCategory.value;
        favoritesAllCategory.value = false;
        favoriteSelectedCategory.value = defaultFavoriteStatus;
        void loadFavorites();
    }

    function onFavoriteCategoryChange(value: string) {
        favoriteSelectedCategory.value = value;
        favoritesAllCategory.value = false;
        favoritesWatchingCategory.value = false;
        isFavoritesMenuDropped.value = false;
        void loadFavorites();
    }

    function toggleFavoritesMenu() {
        isFavoritesMenuDropped.value = !isFavoritesMenuDropped.value;
    }

    return {
        userId,
        userNickname,
        userCreatedAt,
        userRoles,
        userEmail,
        avatarDisplaySrc,
        userFavorites,
        favoriteSelectedCategory,
        isFavoritesMenuDropped,
        favoritesAllCategory,
        favoritesWatchingCategory,
        selectedFavoritesStatus,
        FavoriteStatuses,
        defaultFavoriteStatus,
        getDateStr,
        selectAllCategory,
        selectWatchingCategory,
        onFavoriteCategoryChange,
        toggleFavoritesMenu,
    };
}
