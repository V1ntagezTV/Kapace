import { defineStore } from 'pinia'

export const EventTypes = {
    Info: 'Info',
    Warning: 'Warning',
    Error: 'Error',
    Success: 'Success',
} as const;

type Event = {
    eventType: typeof EventTypes,
    text: string,
}

interface EventAction {
    events: Event[]
}

export const ClientEventStore = defineStore('client-event-store', {
    state(): EventAction {
        return {
            events: []
        };
    },
    actions: {
        push(text: string, type: typeof EventTypes) {
            this.events.push({eventType: type, text: text});
        }
    }
})