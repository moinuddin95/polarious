const checkPermission = () => {
    if(!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
    }  
}
const registerSW = async () => {
    const registration = await navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker registered successfully');
            return registration;
        })
        .catch(err => {
            console.error('Service Worker registration failed' + err);
        });
}

const requestNotificationPermission = async () => {
    const permission = await window.Notification.requestPermission();
    if(permission !== 'granted') {
        throw new Error('Permission not granted for Notification');
    }
    else{
        new Notification('Thanks for granting permission!');
    }
}

async function main(){
    checkPermission();
    await registerSW();
    await requestNotificationPermission();
}

main();