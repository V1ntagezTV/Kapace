import { defineStore } from 'pinia'

interface UserState {
    nickname: string;
    roles: string[];
    loggedIn: boolean;
}

export const userStore = defineStore('store', {
    state(): UserState {
        // Попробуйте загрузить состояние из localStorage
        const savedState = localStorage.getItem('userStore');
        return savedState ? JSON.parse(savedState) : {
            nickname: '',
            roles: [],
            loggedIn: false
        }
    },
    actions: {
        LogIn(nickname: string, roles: string[]) {
            this.nickname = nickname;
            this.roles = roles;
            this.loggedIn = true;
            localStorage.setItem('userStore', JSON.stringify(this.$state));
        },

        LogOut() {
            this.loggedIn = false;
            localStorage.setItem('userStore', JSON.stringify(this.$state));
        }
    }
})