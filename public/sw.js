const urlBase64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    console.log('test1')
    return outputArray;
}

const saveSubscription = async (subscription) => {
    const response = await fetch('http://localhost:3000/subscribe', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
    });
    return response;
};

self.addEventListener('activate', async (e) => {
    console.log('Service Worker activated');
    const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BEtmMjDI1V-07XqGUrl9vQeSuX8XJ0l37h-cDfTxKNqA2cqkWeK_5XD3gPUok1CAbbxvfhdfmwRPj43YAvM_SK0'),
    });
    const response = await saveSubscription(subscription);
    console.log(response);
});

self.addEventListener('push', e => {
    self.registration.showNotification(
        "Woohoo", {
        body: data.body.text(),
    });
});

// Public Key:
// BEtmMjDI1V-07XqGUrl9vQeSuX8XJ0l37h-cDfTxKNqA2cqkWeK_5XD3gPUok1CAbbxvfhdfmwRPj43YAvM_SK0

// Private Key:
// -YhQQ8aC3VvHFZZcVrD4vJd03orz28qETMaa96DzACQ