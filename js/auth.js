window.login = (password) => {
    fetch("/login", {
        method: "POST",
        body: password,
    })
    .then(() => {
        console.log("logged in");
        location.reload(true);
    })
    .catch(() => console.error("login failed"));
};

window.logout = () => {
    fetch("/logout", {
        method: "GET",
    })
    .then(() => {
        console.log("logged out");
        location.reload(true);
    })
    .catch(() => console.error("logout failed"));
};
