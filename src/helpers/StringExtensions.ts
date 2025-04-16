export class StringExtensions {
    static isNullOrEmpty(value: string) : boolean {
        return !value || value.trim().length === 0;
    }

    /**
     * Метод для валидации email-адреса с использованием регулярного выражения.
     * ^[^\s@]+ — строка должна начинаться с одного или более символов, кроме пробела и @.
     * @[^\s@]+ — после @ должен быть один или более символов, кроме пробела и @.
     * \.[^\s@]+$ — после точки должен быть один или более символов, кроме пробела и @, и строка должна заканчиваться на этом.
     * @param email - Строка, содержащая email-адрес.
     * @returns Возвращает true, если email валиден, и false в противном случае.
     */
    static validateEmail(email: string): boolean {
        if (!email || email.length === 0) return false;

        // Регулярное выражение для проверки email-адреса
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Метод для проверки, состоит ли строка только из английских букв и чисел.
     * @param input - Строка для проверки.
     * @returns Возвращает true, если строка состоит только из английских букв и чисел, и false в противном случае.
     */
    static validateAlphanumeric(input: string): boolean {
        // Регулярное выражение для проверки строки на английские буквы и числа
        const alphanumericRegex = /^[A-Za-z0-9]+$/;
        return alphanumericRegex.test(input);
    }

    /**
     * Метод для форматирования даты в строковый вид. (например 21:53 09.03.2025)
     */
    static getDateStr(dateNum: number) : string {
        const date = new Date(dateNum);
        const formatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

        return formatter.format(date) + " " + date.toLocaleDateString();
    }

    static validateNickname(input: string): boolean {
        // Пустая строка не проходит проверку
        if (input.length === 0) return true;

        // Разрешённые символы
        const allowedSymbols = new Set(['.', '/', '-', '_']);

        for (const char of input) {
            const isLetter =
                (char >= 'a' && char <= 'z') ||
                (char >= 'A' && char <= 'Z');

            const isDigit = char >= '0' && char <= '9';
            const isSymbol = allowedSymbols.has(char);

            if (!(isLetter || isDigit || isSymbol)) {
                return false;
            }
        }

        return true;
    }
}