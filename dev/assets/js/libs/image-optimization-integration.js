
// Автоматическое подключение системы выбора форматов изображений
document.addEventListener('DOMContentLoaded', function() {
    // Подключаем скрипт выбора форматов
    import('./image-format-selector.js')
        .then(module => {
            console.log('Image format selector loaded successfully');
        })
        .catch(error => {
            console.error('Error loading image format selector:', error);
        });
});
