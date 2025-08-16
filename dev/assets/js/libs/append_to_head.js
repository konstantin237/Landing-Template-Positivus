export function appendToHead(type, href) {
    if (type === 'css') {
        const css = document.createElement('link');
        css.rel = "stylesheet";
        css.href = href;
        document.head.appendChild(css);
    }
    if (type === 'js' || type === 'javascript') {
        const js = document.createElement('script');
        js.src = href;
        document.head.appendChild(js);
    }
}
