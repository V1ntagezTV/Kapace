import { defineStore } from 'pinia'

export const EventTypes = {
    Info: 'Info',
    Warning: 'Warning',
    Error: 'Error',
    Success: 'Success',
} as const;

type EventType = (typeof EventTypes)[keyof typeof EventTypes];

type Event = {
    eventType: EventType;
    text: string;
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
        push(text: string, type: EventType) {
            this.events.push({ eventType: type, text: text });
        }
    }
})