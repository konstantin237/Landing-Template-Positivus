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



// Меняем путь до картинки на тот, что без папки /webp и с другим расширением
function iterateTags(tagsList, attr) {
    tagsList.forEach(item => {
        const dataSrc = item.getAttribute(attr);
        if (!dataSrc) return;

        const ext = item.getAttribute('data-ext') || 'jpg';
        const cleanPath = dataSrc.replace(/\/webp\//, '/').replace(/\.\w+$/, `.${ext}`);

        if (item.tagName.toLowerCase() === 'img') {
            item.setAttribute('src', cleanPath);
        } else if (item.tagName.toLowerCase() === 'source' || item.tagName.toLowerCase() === 'image') {
            item.setAttribute('href', cleanPath);
        }
    });
}

// Основная функция отмены webp
function cancelWebp(selectorList = ['img']) {
    if (!canUseWebp || OS === 'MacOS' || document.documentElement.classList.contains('no-webp')) {
        selectorList.forEach(selector => {
            const elements = document.querySelectorAll(`${selector}[data-src]`);
            iterateTags(elements, 'data-src');
        });
    } else {
        console.log('canUseWebp!');
    }
}

export { OS, canUseWebp, iterateTags, cancelWebp };


