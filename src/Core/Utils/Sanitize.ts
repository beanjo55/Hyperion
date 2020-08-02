

export function sanitizeQuotes(input: string): string{
    return input.replace(/“/, "\"").replace(/”/, "\"");
}