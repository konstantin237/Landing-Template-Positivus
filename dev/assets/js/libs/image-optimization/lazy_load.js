"use strict";
exports.__esModule = true;
exports.lazyLoad = void 0;

function lazyLoad(selector, 
//берём все элементы с этим селектором и применяем к ним lazyLoad, 
dataAttr, //здесь хранится истинный путь до картинки/видео
config) {
    if (selector === void 0) { selector = '[data-src]'; }
    if (dataAttr === void 0) { dataAttr = 'data-src'; }
    if (config === void 0) { config = {
        rootMargin: '0px 0px 50px 0px',
        threshold: 0
    }; }
    
    // Функция для создания заглушки
    function createPlaceholder(img) {
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
            width: ${img.offsetWidth || '100%'};
            height: ${img.offsetHeight || '200px'};
            background-color: #f0f0f0;
            display: inline-block;
            position: relative;
        `;
        
        // Добавляем индикатор загрузки
        const loader = document.createElement('div');
        loader.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            border: 2px solid #ddd;
            border-top: 2px solid #333;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;
        
        // Добавляем CSS анимацию
        if (!document.querySelector('#lazy-load-styles')) {
            const style = document.createElement('style');
            style.id = 'lazy-load-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        placeholder.appendChild(loader);
        return placeholder;
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
    
    // регистрируем объект config с экземпляром
    // intersectionObserver
    var observer = new IntersectionObserver(function (entries, self) {
        //функция замены src на нужный атрибут
        function preloadImage(el) {
            var attr = el.getAttribute(dataAttr);
            if (!attr) return;
            
            // Определяем оптимальный путь с учетом поддержки форматов
            const optimalPath = getOptimalImagePath(attr);
            
            // Создаем заглушку если её нет
            if (!el.dataset.placeholderCreated) {
                const placeholder = createPlaceholder(el);
                el.style.display = 'none';
                el.parentNode.insertBefore(placeholder, el);
                el.dataset.placeholderCreated = 'true';
            }
            
            // Создаем новое изображение для предзагрузки
            const tempImg = new Image();
            tempImg.onload = function() {
                // Устанавливаем src и показываем изображение
                el.setAttribute('src', optimalPath);
                el.style.display = '';
                
                // Удаляем заглушку
                const placeholder = el.parentNode.querySelector('div[style*="background-color: #f0f0f0"]');
                if (placeholder) {
                    placeholder.remove();
                }
                
                // Добавляем класс для анимации появления
                el.style.opacity = '0';
                el.style.transition = 'opacity 0.3s ease-in-out';
                setTimeout(() => {
                    el.style.opacity = '1';
                }, 10);
            };
            
            tempImg.onerror = function() {
                // В случае ошибки загрузки, показываем оригинальное изображение
                el.setAttribute('src', attr);
                el.style.display = '';
                
                // Удаляем заглушку
                const placeholder = el.parentNode.querySelector('div[style*="background-color: #f0f0f0"]');
                if (placeholder) {
                    placeholder.remove();
                }
            };
            
            tempImg.src = optimalPath;
        }
        // перебираем все элементы
        entries.forEach(function (entry) {
            // обрабатываем только изображения, которые пересекаются.
            // isIntersecting - это свойство, предоставляемое интерфейсом
            //entry.target - сама картинка
            if (entry.isIntersecting) {
                // пользовательская функция, которая копирует путь к img
                // из data-src в src
                preloadImage(entry.target);
                // теперь изображение размещено, прекращаем наблюдение
                self.unobserve(entry.target);
            }
        });
    }, config);
    var imgs = document.querySelectorAll(selector);
    imgs.forEach(function (img) {
        observer.observe(img);
    });
}
exports.lazyLoad = lazyLoad;

//# sourceMappingURL=lazyLoad.js.map
