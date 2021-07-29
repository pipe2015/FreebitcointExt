console.log('online-status');

function reloadPage() {
    window.location.reload();
    window.removeEventListener('online', reloadPage);
}

if (!window.navigator.onLine) {
    console.log('offline');
    window.addEventListener('online', reloadPage);
}

