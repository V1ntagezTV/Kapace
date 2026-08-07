/** Russian plural for «ответ»: 1 ответ, 2 ответа, 5 ответов. */
export function formatRepliesCountLabel(count: number): string {
    const absolute = Math.abs(Math.trunc(count));
    const mod10 = absolute % 10;
    const mod100 = absolute % 100;

    let word = 'ответов';
    if (mod10 === 1 && mod100 !== 11) {
        word = 'ответ';
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        word = 'ответа';
    }

    return `${absolute} ${word}`;
}
