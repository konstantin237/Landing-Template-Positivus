// import { a, Slider } from './vars.js';
// import { Popup } from './libs/popupClass.js';
// import { appendToHead } from './libs/appendToHead.js';
//в JS можно использовать импорты, чтобы переменные, объекты и классы хранить в одном файле,
//а использовать их - в другом
//такая запись работает если запускать через OpenServer, если залить на хостинг 
//ИЛИ если запустить через браузер с отключённым CORS.
//Включённый CORS блокирует импорты в локальных файлах и разрешает импорты только через http или другие схемы.
//Отключать CORS не безопасно
//в файл, в который идёт импорт другого файла, добавить type='module'
document.addEventListener('DOMContentLoaded', function () {
    //подключаем маску телефона для поля с телефоном
    //imask подключается по CDN до secondScripts
    var phone = document.querySelector('.form__input_phone');
    var mask = IMask(phone, { mask: '+{7}(000)000-00-00' });
    console.log($(".slider"));
    $('.slider').slick({
        dots: true, arrows: true
    });
    //активируем попап (я его в вёрстке пока не добавил)
    var popup = new Popup({
        overlaySelector: '.popup_overlay',
        windowSelector: '.popup__window',
        //если один селектор, всё равно в массиве отправить его. 
        //Массив, потому что их может быть несколько
        //для closeBtnSelectors и closeOnKeys тоже самое
        //триггеры:
        triggerSelectors: ['.popup-trigger'],
        closeBtnSelectors: ['.popup__close', '.popup__send'],
        openOnKeys: [],
        closeOnKeys: [27],
        appearType: 'slide'
    });
});

//# sourceMappingURL=secondScripts.js.map
