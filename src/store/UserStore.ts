import { defineStore } from 'pinia'

interface UserState {
    loggedIn: boolean;
}

export const userStore = defineStore('store', {
    state(): UserState {
        return {
            loggedIn: false
        };
    },
    actions: {
        LogIn() {
            this.loggedIn = true;
        },

        LogOut() {
            this.loggedIn = false;
        }
    }
})