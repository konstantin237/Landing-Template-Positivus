// Система автоматического выбора оптимального формата изображений
// Проверяет поддержку браузером форматов и выбирает наименьший по размеру

class ImageFormatSelector {
    constructor() {
        this.formatSupport = {
            avif: false,
            webp: false,
            original: true // JPG/PNG всегда поддерживаются
        };
        this.init();
    }

    // Проверка поддержки AVIF
    async checkAvifSupport() {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = () => {
                resolve(img.width === 1 && img.height === 1);
            };
            img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        });
    }

    // Проверка поддержки WebP
    checkWebPSupport() {
        const elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d')) &&
            elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    // Инициализация проверки поддержки форматов
    async init() {
        console.log('🔍 Проверка поддержки форматов изображений...');
        
        this.formatSupport.webp = this.checkWebPSupport();
        this.formatSupport.avif = await this.checkAvifSupport();
        
        console.log('📊 Поддержка форматов:', this.formatSupport);
        
        // Запускаем обработку изображений
        this.processImages();
    }

    // Получение доступных форматов для изображения
    getAvailableFormats(img) {
        const formats = [];
        
        // Проверяем data-атрибуты
        if (img.dataset.avifSrc && this.formatSupport.avif) {
            formats.push({
                format: 'avif',
                src: img.dataset.avifSrc,
                priority: parseInt(img.dataset.avifPriority) || 999
            });
        }
        
        if (img.dataset.webpSrc && this.formatSupport.webp) {
            formats.push({
                format: 'webp',
                src: img.dataset.webpSrc,
                priority: parseInt(img.dataset.webpPriority) || 999
            });
        }
        
        if (img.dataset.jpgSrc) {
            formats.push({
                format: 'jpg',
                src: img.dataset.jpgSrc,
                priority: parseInt(img.dataset.jpgPriority) || 999
            });
        }
        
        if (img.dataset.pngSrc) {
            formats.push({
                format: 'png',
                src: img.dataset.pngSrc,
                priority: parseInt(img.dataset.pngPriority) || 999
            });
        }
        
        if (img.dataset.jpegSrc) {
            formats.push({
                format: 'jpeg',
                src: img.dataset.jpegSrc,
                priority: parseInt(img.dataset.jpegPriority) || 999
            });
        }
        
        if (img.dataset.gifSrc) {
            formats.push({
                format: 'gif',
                src: img.dataset.gifSrc,
                priority: parseInt(img.dataset.gifPriority) || 999
            });
        }
        
        return formats;
    }

    // Выбор оптимального формата
    selectOptimalFormat(formats) {
        if (formats.length === 0) {
            return null;
        }
        
        // Сортируем по приоритету (чем меньше число, тем выше приоритет)
        formats.sort((a, b) => a.priority - b.priority);
        
        // Возвращаем формат с наивысшим приоритетом
        return formats[0];
    }

    // Обработка одного изображения
    processImage(img) {
        const availableFormats = this.getAvailableFormats(img);
        
        if (availableFormats.length === 0) {
            console.log('⚠️ Нет доступных форматов для изображения:', img.src);
            return;
        }
        
        const optimalFormat = this.selectOptimalFormat(availableFormats);
        
        if (optimalFormat && optimalFormat.src !== img.src) {
            console.log(`🔄 Замена изображения: ${img.src} → ${optimalFormat.src} (${optimalFormat.format})`);
            img.src = optimalFormat.src;
        }
    }

    // Обработка всех изображений на странице
    processImages() {
        console.log('🖼️ Обработка изображений...');
        
        // Обрабатываем все img теги
        const images = document.querySelectorAll('img[data-avif-src], img[data-webp-src], img[data-jpg-src], img[data-png-src], img[data-jpeg-src], img[data-gif-src]');
        
        images.forEach(img => {
            this.processImage(img);
        });
        
        console.log(`✅ Обработано ${images.length} изображений`);
    }

    // Обработка динамически добавленных изображений
    observeNewImages() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Проверяем сам узел
                        if (node.tagName === 'IMG' && this.hasImageDataAttributes(node)) {
                            this.processImage(node);
                        }
                        
                        // Проверяем дочерние элементы
                        const images = node.querySelectorAll('img[data-avif-src], img[data-webp-src], img[data-jpg-src], img[data-png-src], img[data-jpeg-src], img[data-gif-src]');
                        images.forEach(img => this.processImage(img));
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👀 Наблюдение за новыми изображениями включено');
    }

    // Проверка наличия data-атрибутов изображений
    hasImageDataAttributes(element) {
        return element.dataset.avifSrc || 
               element.dataset.webpSrc || 
               element.dataset.jpgSrc || 
               element.dataset.pngSrc || 
               element.dataset.jpegSrc || 
               element.dataset.gifSrc;
    }

    // Обновление изображений (для ручного вызова)
    refresh() {
        this.processImages();
    }

    // Получение информации о поддержке форматов
    getFormatSupport() {
        return { ...this.formatSupport };
    }
}

// Создание глобального экземпляра
window.imageFormatSelector = new ImageFormatSelector();

// Наблюдение за новыми изображениями после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.imageFormatSelector.observeNewImages();
    });
} else {
    window.imageFormatSelector.observeNewImages();
}

// Экспорт для использования в модулях
export default ImageFormatSelector; 