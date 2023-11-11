export function makeRequest(url, method, object) {
    const result = fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(object)
    });
    return result;
}