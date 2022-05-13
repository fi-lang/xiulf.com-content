const LANGS = {
    'text': plain_text,
};

window.addEventListener('load', () => {
    for (let code of document.getElementsByTagName('code')) {
        if (code.parentElement.tagName === "PRE") {
            if (code.className.length == 0) {
                highlight(code, plain_text());
            } else if (LANGS.hasOwnProperty(code.className.substring(9))) {
                let lang = LANGS[code.className.substring(9)];
                highlight(code, lang());
            } else {
                highlight(code, plain_text());
            }
        }
    }
});

function highlight(code, lang) {
    let text = code.innerText;
    let parser = new Parser(code, text);

    code.innerText = "";
    lang(parser);
    parser.flush();
}

function plain_text() {
    return function(p) {
        while (!p.eof()) {
            let match;

            if ((match = p.matches(/\d+/)) !== null) {
                let n = p.start('number');
                p.advance(match[0].length);
                n.complete(p);
            } else if ((match = p.matches(/["']/)) !== null) {
                let n = p.start('string');
                p.advance();

                while (!p.eof() && !p.startsWith(match[0])) {
                    p.advance();
                }

                n.complete(p);
            } else if ((match = p.matches(/[<>/?@#$:|!~%^&*+=-]+/)) !== null) {
                let n = p.start('operator');
                p.advance(match[0].length);
                n.complete(p);
            } else {
                p.advance();
            }
        }
    };
}

class Parser {
    constructor(output, input) {
        this.output = output;
        this.input = input;
        this.node = output;
        this.pos = 0;
        this.last = 0;
    }

    start(tag) {
        let node = document.createElement('span');
        let parent = this.node;

        node.className = tag;

        this.flush();
        this.node = node;

        return new Marker(parent, this.pos);
    }

    flush() {
        if (this.pos > this.last) {
            let text = document.createTextNode(this.input.substring(this.last, this.pos));

            this.node.appendChild(text);
            this.last = this.pos;
        }
    }

    whitespace() {
        let match = this.matches(/\s+/);

        if (match !== null) {
            this.advance(match[0].length);
        }
    }

    eof() {
        return this.pos >= this.input.length;
    }

    startsWith(start) {
        return this.input.startsWith(start, this.pos);
    }

    matches(regex) {
        regex = new RegExp(regex.source, 'y');
        regex.lastIndex = this.pos;

        let exec = regex.exec(this.input);

        if (exec !== null && exec.index === this.pos) {
            return exec;
        } else {
            return null;
        }
    }

    advance(n = 1) {
        this.pos += n;
    }
}

class Marker {
    constructor(parent, start) {
        this.parent = parent;
        this.start = start;
    }

    complete(parser) {
        this.parent.appendChild(parser.node);
        parser.flush();
        parser.node = this.parent;
    }

    undo(parser) {
        this.parent.removeChild(parser.node);
        parser.last = this.start;
        parser.pos = this.start;
        parser.node = this.parent;
    }

    abandon(parser) {
        this.parent.removeChild(parser.node);
        this.parent.append(parser.node.childNodes);
        parser.last = this.start;
        parser.pos = this.start;
        parser.node = this.parent;
    }
}
