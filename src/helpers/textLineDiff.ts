export type DiffLineType = 'removed' | 'added' | 'unchanged';

export type DiffLine = {
    type: DiffLineType;
    text: string;
};

function splitLines(value: string | null | undefined): string[] {
    if (!value) {
        return [];
    }

    return value.split('\n');
}

function buildLcsTable(oldLines: string[], newLines: string[]): number[][] {
    const rows = oldLines.length + 1;
    const cols = newLines.length + 1;
    const table: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            if (oldLines[i - 1] === newLines[j - 1]) {
                table[i][j] = table[i - 1][j - 1] + 1;
            } else {
                table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
            }
        }
    }

    return table;
}

export function computeLineDiff(oldValue: string | null | undefined, newValue: string | null | undefined): DiffLine[] {
    const oldLines = splitLines(oldValue);
    const newLines = splitLines(newValue);

    if (oldLines.length === 0 && newLines.length === 0) {
        return [];
    }

    if (oldLines.length === 0) {
        return newLines.map(text => ({ type: 'added', text }));
    }

    if (newLines.length === 0) {
        return oldLines.map(text => ({ type: 'removed', text }));
    }

    const table = buildLcsTable(oldLines, newLines);
    const result: DiffLine[] = [];
    let i = oldLines.length;
    let j = newLines.length;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
            result.unshift({ type: 'unchanged', text: oldLines[i - 1] });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
            result.unshift({ type: 'added', text: newLines[j - 1] });
            j--;
        } else {
            result.unshift({ type: 'removed', text: oldLines[i - 1] });
            i--;
        }
    }

    return result;
}
