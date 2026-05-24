import { defineStore } from 'pinia'
import type { GetCurrentResponse } from '@/api/UserApi';

const defaultImageUrl = '';

interface UserState {
    userId: number;
    nickname: string;
    email: string;
    imageUrl: string;
    roles: string[];
    loggedIn: boolean;
}

export const userStore = defineStore('store', {
    state(): UserState {
        // Попробуйте загрузить состояние из localStorage
        const savedState = localStorage.getItem('userStore');
        return savedState ? JSON.parse(savedState) : {
            userId: 0,
            nickname: '',
            roles: [],
            loggedIn: false,
            imageUrl: defaultImageUrl,
            email: ''
        };
    },
    actions: {
        applyCurrentUser(data: GetCurrentResponse) {
            this.userId = data.User.Id;
            this.nickname = data.User.Nickname;
            this.email = data.User.Email;
            this.imageUrl = data.User.ImageUrl ?? defaultImageUrl;
            this.roles = data.Roles.map((role) => role.Alias);
            this.loggedIn = true;
            localStorage.setItem('userStore', JSON.stringify(this.$state));
        },
        LogIn(userId: number, nickname: string, email: string, imageUrl: string, roles: string[]) {
            this.userId = userId;
            this.nickname = nickname;
            this.roles = roles;
            this.email = email;
            this.imageUrl = imageUrl;
            this.loggedIn = true;
            localStorage.setItem('userStore', JSON.stringify(this.$state));
        },
        LogOut() {
            this.loggedIn = false;
            localStorage.removeItem('userStore');
        },
        UpdateNickname(newNickname: string) {
            this.nickname = newNickname;
            localStorage.removeItem('userStore');
            localStorage.setItem('userStore', JSON.stringify(this.$state));
        },
        UpdateEmail(newEmail: string) {
            this.email = newEmail;
            localStorage.removeItem('userStore');
            localStorage.setItem('userStore', JSON.stringify(this.$state));
        },
        UpdateImageUrl(imageUrl: string) {
            this.imageUrl = imageUrl;
            localStorage.setItem('userStore', JSON.stringify(this.$state));
        },
    }
})