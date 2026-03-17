export async function readJsonResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    const bodyText = await response.text();

    if (!bodyText) {
        return null;
    }

    if (!contentType.includes('application/json')) {
        throw new Error(bodyText);
    }

    try {
        return JSON.parse(bodyText);
    } catch {
        throw new Error(bodyText);
    }
}