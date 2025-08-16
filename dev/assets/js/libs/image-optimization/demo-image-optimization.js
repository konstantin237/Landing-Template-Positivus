
// Демонстрационная система выбора форматов изображений
console.log('🎯 Демонстрация системы оптимизации изображений');

// Проверка поддержки форматов
const formatSupport = {
    avif: false,
    webp: false,
    original: true
};

// Проверка WebP
function checkWebPSupport() {
    const elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d')) &&
        elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Проверка AVIF
async function checkAvifSupport() {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => {
            resolve(img.width === 1 && img.height === 1);
        };
        img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
}

// Основная функция
async function initImageOptimization() {
    console.log('🔍 Проверка поддержки форматов...');
    
    formatSupport.webp = checkWebPSupport();
    formatSupport.avif = await checkAvifSupport();
    
    console.log('📊 Поддержка форматов:', formatSupport);
    
    // Обрабатываем изображения
    const images = document.querySelectorAll('img[data-avif-src]');
    
    images.forEach(img => {
        console.log('🖼️ Обработка изображения:', img.src);
        
        const availableFormats = [];
        
        // Проверяем доступные форматы
        if (img.dataset.avifSrc && formatSupport.avif) {
            availableFormats.push({
                format: 'AVIF',
                src: img.dataset.avifSrc,
                priority: parseInt(img.dataset.avifPriority)
            });
        }
        
        if (img.dataset.webpSrc && formatSupport.webp) {
            availableFormats.push({
                format: 'WebP',
                src: img.dataset.webpSrc,
                priority: parseInt(img.dataset.webpPriority)
            });
        }
        
        if (img.dataset.jpgSrc) {
            availableFormats.push({
                format: 'JPG',
                src: img.dataset.jpgSrc,
                priority: parseInt(img.dataset.jpgPriority)
            });
        }
        
        // Выбираем оптимальный формат
        if (availableFormats.length > 0) {
            availableFormats.sort((a, b) => a.priority - b.priority);
            const optimal = availableFormats[0];
            
            console.log(`✅ Выбран формат: ${optimal.format} (приоритет: ${optimal.priority})`);
            
            if (optimal.src !== img.src) {
                console.log(`🔄 Замена: ${img.src} → ${optimal.src}`);
                img.src = optimal.src;
            }
        }
    });
    
    console.log('✅ Обработка изображений завершена');
}

// Запускаем при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageOptimization);
} else {
    initImageOptimization();
}
