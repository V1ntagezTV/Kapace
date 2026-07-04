/**
 * Верхняя граница для клиентских ID.
 * JS number и JSON.parse без кавычек теряют точность выше этого значения.
 * ~9e15 вариантов — достаточно для client-generated ID.
 */
const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

/** Генерирует ID, безопасный для JSON/number/long на всём пути запроса. */
export function generateBigIntId(): bigint {
    const randomValues = crypto.getRandomValues(new Uint32Array(2));
    const candidate = (BigInt(randomValues[0]) << BigInt(32)) | BigInt(randomValues[1]);

    return (candidate % MAX_SAFE_BIGINT) + BigInt(1);
}
