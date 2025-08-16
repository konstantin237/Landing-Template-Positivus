"use strict";
exports.__esModule = true;
exports.Popup = void 0;
var Popup = /** @class */ (function () {
    function Popup(data) {
        this.triggerSelectors = data.triggerSelectors;
        this.overlaySelector = data.overlaySelector;
        this.windowSelector = data.windowSelector;
        this.closeBtnSelectors = data.closeBtnSelectors;
        this.displayPopup = data.displayPopup || 'flex';
        this.popupHeight = data.popupHeight || '100vh';
        this.popupWidth = data.popupWidth || '100%';
        this.disappearingTime = data.disappearingTime || 600; //это для transition 
        this.disappearingType = data.disappearingType || 'linear'; //это для transition 
        this.slidingTime = data.slidingTime || 500; //это для transition 
        this.slidingType = data.slidingType || 'ease'; //это для transition 
        this.slidingDir = data.slidingDir || 'top'; //откуда (с какой стороны) выедет попап если он должен выехать
        this.autocloseTime = data.autocloseTime;
        this.openOnKeys = data.openOnKeys; //должен быть массивом кнопок
        this.closeOnKeys = data.closeOnKeys; //должен быть массивом кнопок
        this.closeOnMiss = data.closeOnMiss || true; //закрыть, если клик мимо центрального окна
        this.appearType = data.appearType || 'slide'; //тип появления попапа: slide (выехать из-за границы экрана) или reveal (появится/исчезнуть по центру)
        this.popupOverlay = document.querySelector("".concat(this.overlaySelector));
        this.popupWindow = document.querySelector("".concat(this.windowSelector));
        console.log(this.appearType);
        this.init();
    }
    Popup.prototype.init = function () {
        var _this = this;
        this.hide();
        //по нажатию по триггерам будет открываться попап
        //в this.TiggerSelectors перечислены нужные селекторы для открытия попапа.
        //Проходим по ним циклом, и на каждой итерации берём все элементы на странице с каждым селектором
        //И на каждый элемент с таким селектором вешаем слушатель событий
        this.triggerSelectors.forEach(function (item, index) {
            //берём все элементы с селектором открытия попапа (сначала с первым, потом со вторым и т.д.)
            var allTriggerInstances = document.querySelectorAll(item);
            // console.log('allTriggerInstances:')
            // console.log(allTriggerInstances)
            //проходим по ним циклом
            allTriggerInstances.forEach(function (item, index) {
                console.log('trigger instance:');
                console.log(item);
                //и на каждый элемент вешаем обработчик событий
                item.addEventListener('click', _this.show.bind(_this));
                item.addEventListener('touchstart', _this.show.bind(_this));
            });
        });
        //в this.closeBtnSelectors перечислены нужные селекторы для закрытия попапа.
        //Проходим по ним циклом, и на каждой итерации берём все элементы на странице с каждым селектором
        //И на каждый элемент с таким селектором вешаем слушатель событий
        this.closeBtnSelectors.forEach(function (item, index) {
            //берём все элементы с селектором закрытия попапа (сначала с первым, потом со вторым и т.д.)
            var allCloseBtnInstances = document.querySelectorAll(item);
            // console.log('allCloseBtnInstances:')
            // console.log(allCloseBtnInstances)
            //проходим по ним циклом
            allCloseBtnInstances.forEach(function (item, index) {
                // console.log('closeBtn instance:')
                // console.log(item)
                //и на каждый элемент вешаем обработчик событий
                item.addEventListener('click', _this.hide.bind(_this));
                item.addEventListener('touchstart', _this.hide.bind(_this));
            });
        });
        if (this.closeOnMiss) {
            var popupSelector_1 = this.overlaySelector.slice(1); //without dot 
            this.popupOverlay.addEventListener('click', function (e) {
                if (e.target.classList.contains("".concat(popupSelector_1))) {
                    _this.hide();
                }
            });
            this.popupOverlay.addEventListener('touchstart', function (e) {
                if (e.target.classList.contains("".concat(popupSelector_1))) {
                    _this.hide();
                }
            });
        }
        //вешаем обработчики на клавиши на события открытия и закрытия попапа 
        var hangListeners = function (keys, event, func) {
            if (keys === void 0) { keys = false; }
            if (keys) {
                document.addEventListener(event, function (e) {
                    keys.forEach(function (item) {
                        console.log(keys);
                        if (item == e.keyCode) {
                            console.log(_this);
                            func();
                        }
                    });
                });
            }
        };
        // if (this.openOnKeys) {
        //     document.addEventListener('keydown', (e) => {
        //         this.closeOnKeys.forEach((item) => {
        //             if (parseInt(item, 10) === e.keyCode) {
        //                 this.show();
        //             }
        //         });
        //     });
        // }
        // if (this.closeOnKeys) {
        //     document.addEventListener('keydown', (e) => {
        //         this.closeOnKeys.forEach((item) => {
        //             if (parseInt(item, 10) === e.keyCode) {
        //                 this.hide();
        //             }
        //         });
        //     });
        // }
        hangListeners(this.openOnKeys, 'keydown', this.show.bind(this));
        hangListeners(this.closeOnKeys, 'keydown', this.hide.bind(this));
    };
    Popup.prototype.show = function () {
        var _this = this;
        this.popupOverlay.style.zIndex = 999999;
        if (this.appearType == 'slide') {
            this.popupWindow.style.transition = "all ".concat(this.slidingTime / 1000, "s ").concat(this.slidingType, ", height 0s ").concat(this.slidingType, " 0s");
            switch (this.slidingTime && this.slidingType && this.slidingDir) {
                case 'left':
                    this.popupWindow.style.left = '0px';
                    break;
                case 'right':
                    this.popupWindow.style.right = '0px';
                    break;
                case 'top':
                    this.popupWindow.style.top = '0px';
                    break;
                case 'bottom':
                    this.popupWindow.style.bottom = '0px';
                    break;
            }
        }
        this.popupOverlay.style.height = this.popupHeight;
        this.popupOverlay.style.width = this.popupWidth;
        this.popupOverlay.style.opacity = 1;
        this.popupOverlay.style.transition = "opacity ".concat(this.disappearingTime / 1000, "s ").concat(this.disappearingType, ", height 0s ").concat(this.disappearingType, " 0s");
        //если задано время автозакрытия, то закрыть попап прохождения времени
        if (this.autocloseTime) {
            setTimeout(function () { _this.hide(); }, this.autocloseTime);
        }
    };
    Popup.prototype.hide = function () {
        //      --- Hide Popup
        this.popupOverlay.style.height = 0;
        this.popupOverlay.style.opacity = 0;
        //      ---     
        console.log(this.popupOverlay);
        if (this.appearType == 'slide') {
            this.popupWindow.style.transition = "all ".concat(this.slidingTime / 1000, "s ").concat(this.slidingType, ", height 0s ").concat(this.slidingType, " ").concat(this.slidingTime / 1000, "s");
            switch (this.slidingDir) {
                case 'left':
                    this.popupWindow.style.left = '-100%';
                    break;
                case 'right':
                    this.popupWindow.style.right = '-100%';
                    break;
                case 'top':
                    this.popupWindow.style.top = '-100%';
                    break;
                case 'bottom':
                    this.popupWindow.style.bottom = '-100%';
                    break;
            }
        }
        this.popupOverlay.style.transition = "opacity ".concat(this.disappearingTime / 1000, "s ").concat(this.disappearingType, ", height 0s ").concat(this.disappearingType, " ").concat(this.disappearingTime / 1000, "s");
    };
    return Popup;
}());
exports.Popup = Popup;

//# sourceMappingURL=popupClass.js.map
