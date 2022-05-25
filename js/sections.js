window.addEventListener('load', () => {
    let sections = [];

    for (let h2 of document.getElementsByTagName('h2')) {
        let id = h2.innerText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        h2.id = id;
        sections.push([h2.innerText, id, h2]);
    }

    if (sections.length != 0) {
        let nav = document.createElement('nav');
        let ul = document.createElement('ul');
        let li = document.createElement('li');

        nav.id = 'sections';
        nav.appendChild(ul);
        ul.appendChild(li);
        li.innerText = 'SECTIONS';

        for (let i = 0; i < sections.length; i++) {
            let li = document.createElement('li');
            let a = document.createElement('a');

            ul.appendChild(li);
            li.appendChild(a);
            a.innerText = sections[i][0];
            a.href = `#${sections[i][1]}`;
            sections[i] = [li, sections[i][2]];
        }

        let main = document.getElementsByTagName('main')[0];

        main.prepend(nav);
        main.classList.add('has-nav');

        if (location.hash.length != 0) {
            on_hash_change();
        } else {
            on_scroll();
        }

        function on_scroll() {
            let top = document.body.scrollTop;
            let header = sections[0][1];

            for (let [_, h2] of sections) {
                if (top >= h2.offsetTop) {
                    header = h2;
                }
            }

            if (top == document.body.scrollHeight - document.body.clientHeight && top > 0) {
                header = sections[sections.length - 1][1];
            }

            if (location.hash != `#${header.id}`) {
                history.replaceState({}, '', `#${header.id}`);
                on_hash_change();
            }
        }

        function on_hash_change() {
            for (let [li, h2] of sections) {
                if (h2.id == location.hash.substring(1)) {
                    li.classList.add('current');
                } else {
                    li.classList.remove('current');
                }
            }
        }

        document.body.addEventListener('scroll', on_scroll);
        window.addEventListener('hashchange', on_hash_change);
    }

    if (location.hash != '') {
        const el = document.getElementById(location.hash.substring(1));

        if (el != null) {
            el.scrollIntoView();
        }
    }
});
