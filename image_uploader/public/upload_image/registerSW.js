if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/assets/image_uploader/upload_image/sw.js', { scope: '/assets/image_uploader/upload_image/' })})}