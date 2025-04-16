import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import ProfileView from "@/views/ProfileView.vue";
import LogInView from "@/views/LogInView.vue";
import RegistrationView from "@/views/RegistrationView.vue";
import TheaterView from "@/views/TheaterView.vue";
import RestorePasswordView from "@/views/RestorePasswordView.vue";
import EpisodeView from "@/views/EpisodeView.vue";
import EditsView from "@/views/EditsView.vue";
import SettingsView from "@/views/SettingsView.vue";

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
    name: 'theater',
    path: '/theater/:id',
    component: TheaterView,
  },
  {
    name: "episode",
    path: '/episode/:content/:episode/:translation(\\d+)*',
    component: EpisodeView,
  },
  {
    name: "edit",
    path: "/edit",
    component: EditsView,
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
        name: "edit-episode",
        path: "/edit/episode/:content(\\d+)",
        component: EditsView,
      },
      {
        name: "create-episode",
        path: "/edit/episode",
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
