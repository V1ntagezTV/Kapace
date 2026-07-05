import { ref } from 'vue';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';

export function useVideoScriptParser() {
    const clientEventStore = ClientEventStore();

    const videoLink = ref<string>();
    const userInputVideo = ref('');
    const videoScriptIsInvalid = ref(false);

    function getVideoLinkFromUserInput(input: string): string | null {
        if (input.startsWith('<iframe') && input.endsWith('</iframe>')) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(input, 'text/html');

            if (doc.documentElement.querySelector('parsererror')) {
                return tryGetFirstLink(input);
            }

            return doc.getElementsByTagName('iframe')[0].src;
        }

        return tryGetFirstLink(input);
    }

    function tryGetFirstLink(userInput: string): string | null {
        const res = userInput.match(/(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        if (res !== null && res.length > 0) {
            return res[0];
        }

        return null;
    }

    function getVideoLink() {
        const link = getVideoLinkFromUserInput(userInputVideo.value);
        videoLink.value = link ?? undefined;
        if (link) {
            videoScriptIsInvalid.value = false;
            return;
        }

        videoScriptIsInvalid.value = true;
        clientEventStore.push('Ошибка! Не удалось вывести видео.', EventTypes.Error);
    }

    function resetVideoScript() {
        videoLink.value = undefined;
        userInputVideo.value = '';
        videoScriptIsInvalid.value = false;
    }

    return {
        videoLink,
        userInputVideo,
        videoScriptIsInvalid,
        getVideoLink,
        getVideoLinkFromUserInput,
        resetVideoScript,
    };
}
