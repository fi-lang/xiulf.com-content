window.addEventListener('load', () => {
    for (let link of document.links) {
        if (link.hostname != location.hostname) {
            link.target = '_blank';
        }
    }
});