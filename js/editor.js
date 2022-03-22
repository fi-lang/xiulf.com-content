window.addEventListener('load', () => {
    new SimpleMDE({
        element: document.getElementById("editor"),
        indentWithTabs: false,
        status: false,
        tabSize: 4,
        toolbar: false,
        toolbarTips: false,
        spellChecker: false,
        autoDownloadFontAwesome: false,
    });
});
