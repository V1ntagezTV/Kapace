import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { userStore } from '@/store/UserStore';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

export function useEditsAccess() {
    const router = useRouter();
    const eventStore = ClientEventStore();
    const currentUser = userStore();

    onMounted(async () => {
        if (currentUser.loggedIn !== true) {
            eventStore.push('Сначала необходимо авторизоваться!', EventTypes.Error as never);
            await router.push('/login');
        }
    });
}
