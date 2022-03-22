window.addEventListener('load', () => {
    const input = document.getElementById("input");
    const image = document.getElementById("image");
    const reader = new FileReader();

    image.parentElement.style.paddingTop = `max(56.25%, ${image.offsetHeight}px)`;

    reader.addEventListener('load', () => {
        image.src = reader.result;
    });

    image.addEventListener('load', () => {
        image.parentElement.style.paddingTop = `${image.offsetHeight}px`;
    });

    input.addEventListener('change', () => {
        reader.readAsDataURL(input.files[0]);
    });
});
