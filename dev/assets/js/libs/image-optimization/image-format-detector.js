// Определяем ОС
const OS = (() => {
    const platform = navigator.platform.toLowerCase();
    const iosPlatforms = ['iphone', 'ipad', 'ipod', 'ipod touch'];

    if (platform.includes('mac')) return 'MacOS';
    if (iosPlatforms.includes(platform)) return 'iOS';
    if (platform.includes('win')) return 'Windows';
    if (/android/.test(navigator.userAgent.toLowerCase())) return 'Android';
    if (/linux/.test(platform)) return 'Linux';

    return 'unknown';
})();

// Проверка поддержки webp
const canUseWebp = (() => {
    const elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d')) &&
        elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

// Проверка поддержки avif
const canUseAvif = (() => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => {
            resolve(img.width === 1 && img.height === 1);
        };
        img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
})();

// Функция для замены расширений изображений в DOM
function replaceImageExtensions() {
    // Получаем все изображения (включая те, что могут быть в PHP)
    const images = document.querySelectorAll('img[src*="assets/img"]');
    const backgrounds = document.querySelectorAll('[style*="background"]');
    
    // Обрабатываем изображения
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
            img.setAttribute('src', getOptimalImagePath(src));
        }
    });
    
    // Обрабатываем фоновые изображения в инлайн стилях
    backgrounds.forEach(element => {
        const style = element.getAttribute('style');
        if (style && style.includes('background')) {
            const newStyle = style.replace(
                /url\(['"]?([^'"]*assets\/img[^'"]*\.(?:avif|webp|jpg|jpeg|png|gif))['"]?\)/g,
                (match, url) => `url("${getOptimalImagePath(url)}")`
            );
            element.setAttribute('style', newStyle);
        }
    });
    
    // Обрабатываем PHP-специфичные элементы (если есть)
    const phpElements = document.querySelectorAll('[data-php-image]');
    phpElements.forEach(element => {
        const src = element.getAttribute('data-php-image');
        if (src) {
            element.setAttribute('data-php-image', getOptimalImagePath(src));
        }
    });
}

// Функция для определения оптимального пути изображения
function getOptimalImagePath(originalPath) {
    // Убираем расширение и получаем базовый путь
    const pathWithoutExt = originalPath.replace(/\.(avif|webp|jpg|jpeg|png|gif|svg)$/i, '');
    
    // Извлекаем имя файла из пути
    const pathParts = pathWithoutExt.split('/');
    const fileName = pathParts.pop(); // Получаем имя файла без расширения
    const basePath = pathParts.join('/'); // Получаем путь до папки с изображением
    
    // Проверяем поддержку форматов
    if (window.imageFormatSupport) {
        if (window.imageFormatSupport.avif) {
            // Если поддерживается AVIF: проверяем, есть ли уже папка avif в пути
            if (basePath.includes('/avif/')) {
                // Если путь уже содержит /avif/, просто меняем расширение
                return pathWithoutExt + '.avif';
            } else {
                // Если папки avif нет, добавляем её
                return `${basePath}/avif/${fileName}.avif`;
            }
        } else if (window.imageFormatSupport.webp) {
            // Если поддерживается WEBP: проверяем, есть ли уже папка webp в пути
            if (basePath.includes('/webp/')) {
                // Если путь уже содержит /webp/, просто меняем расширение
                return pathWithoutExt + '.webp';
            } else {
                // Если папки webp нет, добавляем её
                return `${basePath}/webp/${fileName}.webp`;
            }
        } else {
            // Если не поддерживается ни AVIF, ни WEBP: оригинальный путь
            return originalPath;
        }
    }
    
    // Если поддержка еще не определена, возвращаем оригинальный путь
    return originalPath;
}

// Основная функция инициализации
async function initImageFormatSupport() {
    try {
        const avifSupport = await canUseAvif;
        
        window.imageFormatSupport = {
            avif: avifSupport,
            webp: canUseWebp
        };
        
        // Заменяем расширения изображений
        replaceImageExtensions();
        
        console.log('Image format support:', window.imageFormatSupport);
        console.log('Using canUseWebp for webp detection:', canUseWebp);
    } catch (error) {
        console.error('Error detecting image format support:', error);
        // В случае ошибки используем webp как fallback
        window.imageFormatSupport = {
            avif: false,
            webp: canUseWebp
        };
        replaceImageExtensions();
    }
}

// Экспортируем функции
export { 
    OS, 
    canUseWebp, 
    canUseAvif, 
    replaceImageExtensions, 
    getOptimalImagePath, 
    initImageFormatSupport 
};

// Автоматически инициализируем при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageFormatSupport);
} else {
    initImageFormatSupport();
} 