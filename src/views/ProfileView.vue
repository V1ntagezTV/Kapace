<template>
  <div class="profile-view__main">
    <div class="profile-view__avatar-container">
      <avatar-component :src="image" />
      <BaseButton :button-type="2">
        Добавить в друзья
      </BaseButton>
      <base-background class="profile-view__button-list">
        <div class="profile-view__button-unit">
          <p>Подписок</p>
          <p>12</p>
        </div>

        <div class="profile-view__button-unit">
          <p>Подписчиков</p>
          <p>12</p>
        </div>
      </base-background>

      <div class="profile-right-bar__main">
        статы
      </div>
    </div>
    <div class="profile-middle__main">
      <profile-menu
        :custom-status="userInfo.customStatus"
        :nickname="userInfo.nickname"
        :registration-date="userInfo.registrationDate"
        :tag="userInfo.tag"
      />


      <EventList :sort-properties="genericEventList" />
      <EventList :sort-properties="genericEventList" />
      <EventList :sort-properties="genericEventList" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AvatarComponent from "@/components/Profile/AvatarComponent.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseBackground from "@/components/Base/BaseBackground.vue";
import ProfileMenu from "@/components/Profile/ProfileMenu.vue";
import {ref} from "vue";
import {DataClass} from "@/components/Profile/ViewModels/DataClass";
import EventList from "@/components/Profile/EventList.vue";
import {Property} from "@/components/Profile/ViewModels/Property";
import {LinkPropertyType} from "@/components/Profile/ViewModels/LinkPropertyType";
import {LinkedProperty} from "@/components/Profile/ViewModels/LinkedProperty";
import {GenericSortableDataClass} from "@/components/Profile/ViewModels/GenericSortableDataClass";

const eventList = ref([
  new DataClass(BigInt(1), '20.21.2022 23:32', [
    new LinkedProperty("1nsurka", LinkPropertyType.TO_FILM, BigInt(123)),
    new Property("оценил оценил оценил оценил оценил оценил"),
    new LinkedProperty("Мастер Копья", LinkPropertyType.TO_FILM, BigInt(123)),
    new Property("в 4.5 звезд"),
  ]),
  new DataClass(BigInt(1), '20.21.2022 23:32', [
    new LinkedProperty("1nsurka", LinkPropertyType.TO_FILM, BigInt(123)),
    new Property("оценил"),
    new LinkedProperty("Мастер Копья", LinkPropertyType.TO_FILM, BigInt(123)),
    new Property("в 4.5 звезд"),
  ]),
  new DataClass(BigInt(1), '20.21.2022 23:32', [
    new LinkedProperty("1nsurka", LinkPropertyType.TO_FILM, BigInt(123)),
    new Property("оценил"),
    new LinkedProperty("Мастер Копья", LinkPropertyType.TO_FILM, BigInt(123)),
    new Property("в 4.5 звезд"),
  ]),
])

const genericEventList = new GenericSortableDataClass<DataClass>(
    eventList.value, 
    GetSortingToUsersActivities, 
    'Идентификатор'
);

const image = '/images/film_test.png';
const userInfo = {nickname: "1nsurka", registrationDate: "11.11.1111", tag: 1231, customStatus: "Jopa" }

function GetSortingToUsersActivities() {
  const sortingBy: { [key:string]: (unit: DataClass) => string | bigint | Property[] } = {}

  sortingBy['Идентификатор'] = (unit: DataClass) => unit.id
  sortingBy['Ключ'] = (unit: DataClass) => unit.key
  sortingBy['Значение'] = (unit: DataClass) => unit.value

  return sortingBy;
}
</script>

<style lang="scss" scoped>

.profile-view {
  &__main {
    padding: 20px 0;
    display: flex;
    gap: 20px;
  }

  &__avatar-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
    min-width: 255px;
  }

  &__button-list {
    padding: 8px 0;
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
    gap: 10px;
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