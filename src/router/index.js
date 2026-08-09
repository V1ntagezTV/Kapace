import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import ProfileView from "@/views/ProfileView.vue";
import LogInView from "@/views/LogInView.vue";
import RegistrationView from "@/views/RegistrationView.vue";
import TheaterView from "@/views/TheaterView.vue";
import PersonView from "@/views/PersonView.vue";
import RestorePasswordView from "@/views/RestorePasswordView.vue";
import EpisodeView from "@/views/EpisodeView.vue";
import EditsView from "@/views/EditsView.vue";
import SettingsView from "@/views/SettingsView.vue";
import PersonHistoryView from "@/views/PersonHistoryView.vue";
import ContentHistoryView from "@/views/ContentHistoryView.vue";
import WatchRoomView from "@/views/WatchRoomView.vue";

const routes = [
  {
    path: '/',
    name: 'main',
    component: HomeView
  },
  {
    path: '/search',
    name: 'Поиск',
    component: SearchView
  },
  {
    path: '/watch-room',
    name: 'watch-room',
    component: WatchRoomView,
  },
  {
    path: '/watch-room/:room',
    name: 'watch-room-room',
    component: WatchRoomView,
  },
  {
    path: '/profile',
    name: 'Профиль',
    component: ProfileView
  },
  {
    path: '/settings',
    name: 'Настройки',
    component: SettingsView
  },
  {
    path: '/login',
    name: 'Вход',
    component: LogInView,
  },
  {
    path: '/reg',
    name: 'Регистрация',
    component: RegistrationView
  },
  {
    path: '/restore',
    name: 'Восстановление пароля',
    component: RestorePasswordView,
  },
  {
    path: '/theater/:id',
    name: 'theater',
    component: TheaterView,
  },
  {
    path: '/person/:id',
    name: 'person',
    component: PersonView,
  },
  {
    path: '/person/:id/history',
    name: 'person-history',
    component: PersonHistoryView,
  },
  {
    path: '/theater/:id/history',
    name: 'content-history',
    component: ContentHistoryView,
  },
  {
    path: '/episode/:content/:episode/:translation(\\d+)*',
    name: "episode",
    component: EpisodeView,
  },
  {
    path: "/edit",
    name: "edit",
    component: EditsView,
    redirect: { name: "edit-list" },
    children: [
      {
        name: "edit-list",
        path: "/edit/list",
        component: EditsView,
      },
      {
        name: "edit-content",
        path: "/edit/content/:content(\\d+)",
        component: EditsView,
      },
      {
        name: "create-content",
        path: "/edit/content",
        component: EditsView,
      },
      {
        name: "edit-episode",
        path: "/edit/episode/:content(\\d+)/:episode(\\d+)",
        component: EditsView,
      },
      {
        name: "edit-episode-prefill",
        path: "/edit/episode/:content(\\d+)",
        component: EditsView,
      },
      {
        name: "create-episode",
        path: "/edit/episode",
        component: EditsView,
      },
      {
        name: "create-person",
        path: "/edit/person",
        component: EditsView,
      },
      {
        name: "edit-person",
        path: "/edit/person/:person(\\d+)",
        component: EditsView,
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "",
  linkExactActiveClass: ""
})

export default router
