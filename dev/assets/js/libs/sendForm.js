document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector(".footer-form .form");
    console.log(form);
    var regEx = /^\+?[78][-\(]?\d{3}\)?-?\d{3}-?\d{2}-?\d{2}$/;
    var popup1 = new Popup({
        targetSelector: '.popup-trigger',
        overlaySelector: '.popup',
        windowSelector: '.popup__window',
        closeBtnSelector: '.popup__close',
        displayPopup: 'flex',
        popupHeight: '100vh',
        popupWidth: '100%',
        disappearingTime: 600,
        disappearingType: 'linear',
        slidingTime: 500,
        slidingType: 'linear',
        slidingDir: 'top',
        //autocloseTime: 2000, //ms
        closeOnMiss: true,
        closeOnKeys: '27, 67, 88' //esc 27, c - 67, x - 88
    });
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = document.querySelector(".footer-form__input_name").value.trim(), phone = document.querySelector(".footer-form__input_phone").value.trim(), textArea = document.querySelector(".footer-form__input_textarea").value.trim();
        console.log(s);
        var n = {
            name: name,
            tel: phone,
            description: textArea,
            toString: function () {
                return "name=".concat(this.name, "&tel=").concat(this.tel, "&description=").concat(this.description);
            }
        }.toString();
        if ("" != name && "" != phone && "" != textArea && regEx.test(phone)) {
            console.log("inputPhoneValue: ".concat(phone));
            var scriptPhp = "/amoapi_landing/script.php";
            return popup1.appearance("Ваши данные успешно отправлены!"),
                function (e, t, i) {
                    if (i === void 0) { i = null; }
                    return new Promise(function (s, o) {
                        var p = new XMLHttpRequest;
                        p.open(e, t), p.responseType = "json", p.setRequestHeader("Content-Type", "application/json"), p.onerror = (function () {
                            console.log(p.response);
                        }), p.onload = (function () {
                            p.status >= 400 ? o(p.response) : s(p.response);
                        }), p.send(i);
                    });
                }("POST", scriptPhp, n).then(function (e) { return console.log(e); })["catch"](function (e) { return console.log(e); }), document.querySelector(".footer-form__input_name").value = "", document.querySelector(".footer-form__input_phone").value = "", document.querySelector(".footer-form__input_textarea").value = "", e.preventDefault(), !1;
        }
        return popup1.appearance("Заполните все поля!"), e.preventDefault(), !1;
    });
});

//# sourceMappingURL=sendForm.js.map
