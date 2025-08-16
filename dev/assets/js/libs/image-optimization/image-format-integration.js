
// Автоматическое подключение скрипта определения форматов
document.addEventListener('DOMContentLoaded', function() {
    // Подключаем скрипт определения форматов
    import('./image-format-detector.js')
        .then(module => {
            console.log('Image format detector loaded successfully');
        })
        .catch(error => {
            console.error('Error loading image format detector:', error);
        });
});
