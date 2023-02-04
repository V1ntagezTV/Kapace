import { createStore } from 'vuex'
import router from "@/router";


export default createStore({
  state() {
    return {loggedIn: false}
  },
  mutations: {
    LogIn(state) {
      console.log(state)
      if (state.loggedIn) {
        router.route()
      }
      state.loggedIn = true;
    },
    LogOut(state) {
      state.loggedIn = false;
    }
  }
})
