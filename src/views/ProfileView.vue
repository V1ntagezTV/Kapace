<template>
  <div class="col__ profile-view__main">
    <div class="profile-view__avatar-container">
      <avatar-component
        style="overflow: hidden;"
        class="m-radius-16"
        :src="userImageUrl"
      />

      <router-link :to="'/settings'">
        <base-button
          class="theater__edit fill m-border m-radius-circle body-medium "
          :variant="'outline'"
        >
          Настройки
        </base-button>
      </router-link>
    </div>
    <div class="profile-middle__main">
      <profile-menu
        :nickname="userNickname"
        :created-at="userCreatedAt"
        :tag="userId"
        :roles="userRoles"
        :email="userEmail"
      />

      <base-background :type="3" class="column profile__favorites">
        <div class="profile__favorites-header row dynamic h__space-between v__center h__padding-16">
          <p class="title-large v__padding-8">
            Избранные
          </p>

          <div class="fit-content v__center gap-8">
            <filter-chips
              class="profile__filter m3-bg-3 fit-content m-radius-16"
              text="Все"
              :class="{'profile__filter-enabled': favoritesAllCategory}"
              @click="() => {
                favoritesAllCategory = !favoritesAllCategory;
                favoritesWatchingCategory = false;
                favoriteSelectedCategory = defaultFavoriteStatus;
                loadFavorites();
              }"
            />
            <filter-chips
              class="profile__filter m3-bg-3 fit-content m-radius-16"
              text="Смотрю"
              :class="{'profile__filter-enabled': favoritesWatchingCategory}"
              @click="() => {
                favoritesWatchingCategory = !favoritesWatchingCategory;
                favoritesAllCategory = false;
                favoriteSelectedCategory = defaultFavoriteStatus;
                loadFavorites();
              }"
            />
            <base-selector
              v-model="favoriteSelectedCategory"
              :is-dropped="isFavoritesMenuDropped"
              :selectable-values="[
                FavoriteStatuses.Stash,
                FavoriteStatuses.Loved,
                FavoriteStatuses.Planned,
                FavoriteStatuses.Paused,
                FavoriteStatuses.Finished,
                FavoriteStatuses.Dropped
              ]"
              @update:model-value="() => {
                favoritesAllCategory = false;
                favoritesWatchingCategory = false;
                isFavoritesMenuDropped = false;
                loadFavorites()
              }"
            >
              <template #header>
                <filter-chips
                  :class="{'profile__filter-enabled': favoriteSelectedCategory !== defaultFavoriteStatus}"
                  class="profile__filter m3-bg-3 m-radius-16"
                  :text="favoriteSelectedCategory"
                  :enable-menu-icon="true"
                  @click="isFavoritesMenuDropped = !isFavoritesMenuDropped;"
                >
                  <template #menu-icon>
                    <material-drop-arrow />
                  </template>
                </filter-chips>
              </template>
            </base-selector>
          </div>
        </div>
        <div style="width: 100%; height: 1px; background: var(--font-gray-v1);" />

        <div class="profile__favorites-list">
          <router-link
            v-for="favorite in userFavorites"
            :key="favorite"
            class="profile__favorites-unit gap-8 dynamic row h__space-between v__center v__padding-8"
            :to="{ name: 'theater', params: { id: favorite.ContentId}}"
          >
            <div class="profile__favorite-title body-large">
              {{ favorite.Title }}
            </div>
            <div class="gap-16 row v__center">
              <div
                v-show="favorite.Stars"
                class="body-small m-radius-8 padding-8 fit-content m3-bg-2 m-border row gap-16"
              >
                <star-icon />
                <p>{{ favorite.EpisodeId }}</p>
              </div>
              <div
                v-show="favorite.Stars"
                class="body-small m-radius-8 padding-8 fit-content m3-bg-2 m-border row gap-16"
              >
                <star-icon />
                <p>{{ favorite.Stars }}</p>
              </div>
              <filter-chips
                v-show="favorite.Status && selectedFavoritesStatus === null"
                class="body-small m3-bg-2 m-border"
                :text="FavoriteStatuses[favorite.Status]"
              />
              <div class="fit-content">
                {{ getDateStr(favorite.CreatedAt) }}
              </div>
            </div>
          </router-link>
        </div>
      </base-background>
    </div>
  </div>
</template>

<script lang="ts" setup>

import ProfileMenu from "@/components/Profile/ProfileMenu.vue";
import {computed, inject, onMounted, ref} from "vue";
import {ClientEventStore, EventTypes} from "@/store/ClientEventStore";
import {userStore} from "@/store/UserStore";
import {UserApi} from "@/api/UserApi";
import BaseButton from "@/components/Base/BaseButton.vue";
import {useRouter} from "vue-router";
import {ErrorDetails} from "@/api/ApiService";
import AvatarComponent from "@/components/Profile/AvatarComponent.vue";
import {FavoriteApi, FavoriteGetList} from "@/api/FavoriteApi";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import BaseSelector from "@/components/Base/Selector/BaseSelector.vue";
import FilterChips from "@/components/UseReadyComponents/MaterialComponents/FilterChips.vue";
import MaterialDropArrow from "@/components/Icons/MaterialDropArrow.vue";
import StarIcon from "@/components/Icons/StarIcon.vue";
import {FavoriteStatus, getFavoritesStatusKeyByValue} from "@/models/FavoriteStatuses";

const router = useRouter()
const eventStore = ClientEventStore();
const currentUser = userStore();
const userApi = inject<UserApi>('user-api');
const favoritesApi = inject<FavoriteApi>('favorite-api');

const FavoriteStatuses = {
  Stash: 'Общее',
  Loved: 'Любимое',
  Planned: 'В планах',
  Watching: 'В процессе',
  Paused: 'Отложено',
  Finished: 'Завершено',
  Dropped: 'Брошено'
} as const;

const defaultFavoriteStatus = "Категория";
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
const userFavorites = ref<FavoriteGetList[]>([]);
const formatter = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});


const selectedFavoritesStatus = computed(() => {
  let selectedStatus: FavoriteStatus | null = null;
  if (favoritesAllCategory.value) {
    selectedStatus = null;
  } else if (favoritesWatchingCategory.value) {
    selectedStatus = FavoriteStatus.Watching;
  } else if (favoriteSelectedCategory.value !== defaultFavoriteStatus) {
    selectedStatus = (getFavoritesStatusKeyByValue(favoriteSelectedCategory.value)) as FavoriteStatus;
  }

  return selectedStatus;
})

onMounted(async () => {
  if (currentUser.loggedIn !== true) {
    eventStore.push('Сначала необходимо авторизоваться!', EventTypes.Error as typeof EventTypes);
    await router.push('/login');
    return;
  }

  await loadCurrentUser();
  await loadFavorites();
});



function getDateStr(dateNum: number): string {
  const date = new Date(dateNum);
  return formatter.format(date) + " " + date.toLocaleDateString();
}

async function loadFavorites() {
  const favorites = await favoritesApi.getList(selectedFavoritesStatus.value, 10, 0);
  userFavorites.value = favorites.data.Favorites ?? [];
}

async function loadCurrentUser() {
  try {
    const userResponse = (await userApi.getCurrent())
      .onBusinessError((errorDetails: ErrorDetails) => {
        eventStore.push(errorDetails.Message, EventTypes.Error)
        if (errorDetails.ErrorCode === 'Unauthorized') {
          currentUser.LogOut();
          router.push('/login')
        }
      })
      .onException(() => eventStore.push('Ошибка сервера! Попробуйте снова позже.', EventTypes.Error));

    if (!userResponse.data) {
      return;
    }

    const user = userResponse.data;
    userId.value = user.User.Id;
    userNickname.value = user.User.Nickname;
    userCreatedAt.value = getDateStr(user.User.CreatedAt);
    userRoles.value = user.Roles.map(x => x.Alias);
    userEmail.value = user.User.Email;
  } catch (e) {
    console.log(e);
  }
}
</script>

<style lang="scss" scoped>
.profile {
  &__favorites-header {
    min-height: 64px;
    height: fit-content;
  }
  &__filter {
    width: fit-content;

    &:hover {
      background: var(--surface-container-highest90);
    }
  }
  &__filter-enabled {
    background: var(--primary40);
    color: white;

    &:hover {
      background: var(--primary50);
    }
  }

  &__favorites-list {
    padding-top: 8px;
    padding-bottom: 16px;
    overflow: hidden;
  }

  &__favorite-title {
    text-align: start;
    width: fit-content;
  }

  &__favorites-unit {
    display: flex;
    min-height: 48px;
    min-width: 0;
    height: fit-content;
    padding-left: 16px;
    padding-right: 16px;
    color: #49454F;

    &:hover {
      color: var(--primary40);
      background: color-mix(in srgb, var(--primary40) 8%, transparent);
    }
  }
  &__tag-name {
    display: flex;
    color: #969BAB;
    margin: 0;
  }

  &__tag-value {
    margin: 0;
  }
}

.profile-view {
  @media (min-width: 0px) {
    &__main {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: 20px 0;
    }
  }
  @media (min-width: 720px) {
    &__main {
      display: grid;
      grid-template-columns: 255px 1fr;
      gap: 20px;
      margin: 20px 0;
    }
  }

  &__avatar-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
  }

  &__button-unit {
    display: flex;
    justify-content: space-between;
    padding: 8px 20px;

    font-weight: 600;
    color: var(--primary);

    & p {
      margin: 0;
    }

    &:hover {
      background: #F4F5F7;
      cursor: pointer;
    }
  }
}

.profile-middle {
  &__main {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 20px;
  }
}

.profile-right-bar {
  &__main {
    display: flex;
    flex-direction: column;
    background: #6686B3;
    min-width: 255px;
  }
}

</style>