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

const routes = [
  {
    path: '/',
    name: 'Главная',
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
    path: "/edits",
    component: EditsView,
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "",
  linkExactActiveClass: ""
})

export default router
