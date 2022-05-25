const LANGS = {
    // special languages
    'constraints': constraints,

    'text': plain_text,
    'c': c,
    'cpp': c,
    'c++': c,
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

function plain_text() {
    const l = new Language();

    const number = l.match('number', /\d+/);
    const string = l.region('string', /"/, /"/).skip(/\\"/);

    return l.finish();
}

function constraints() {
    const l = new Language();

    const ident = l.match('identifier', /(?!\d)[\w_][\w\d_]*/);
    const operator = l.match('operator', /[<>\/*?|+=!@%^&-]+/);
    const typevar = l.match('type', /\?\d+/);

    return l.finish();
}

function c() {
    const l = new Language();

    return l.finish();
}

class Language {
    constructor() {
        this.rules = {};
        this.clusters = {
            'default': [],
        };
    }

    keyword(name, ...words) {
        let rule = new KeywordRule(this, name, words);
        if (this.rules[name] === undefined) this.rules[name] = [];
        this.rules[name].push(rule);
        this.clusters.default.push(rule);
        return rule;
    }

    match(name, regex) {
        let rule = new MatchRule(this, name, regex);
        if (this.rules[name] === undefined) this.rules[name] = [];
        this.rules[name].push(rule);
        this.clusters.default.push(rule);
        return rule;
    }

    region(name, start, end) {
        let rule = new RegionRule(this, name, start, end);
        if (this.rules[name] === undefined) this.rules[name] = [];
        this.rules[name].push(rule);
        this.clusters.default.push(rule);
        return rule;
    }

    cluster(name, ...rules) {
        this.clusters[name] = [];

        for (const rule of rules) {
            if (typeof(rule) === 'string') {
                this.clusters[name].push(...this.rules[rule]);
            } else {
                this.clusters[name].push(rule);
            }
        }
    }

    finish() {
        for (const ruleset in this.rules) {
            for (const rule of this.rules[ruleset]) {
                const inner = rule.inner;
                rule.inner = [];

                for (const name of inner) {
                    if (typeof(name) === 'string') {
                        if (name.startsWith('@')) {
                            rule.inner.push(...this.clusters[name.substr(1)]);
                        } else {
                            rule.inner.push(...this.rules[name]);
                        }
                    } else {
                        rule.inner.push(name);
                    }
                }

                if (rule._next !== null && rule._next !== undefined) {
                    if (rule._next.startsWith('@')) {
                        rule._next = this.clusters[rule._next.substr(1)];
                    } else {
                        rule._next = this.rules[rule._next];
                    }
                }
            }
        }

        return this;
    }
}

class Rule {
    constructor(language, name) {
        this.language = language;
        this.name = name;
        this.inner = [];
        this._next = null;
        this._skipWhite = false;
        this._skipEmpty = false;
    }

    contained() {
        const index = this.language.clusters.default.indexOf(this);
        if (index >= 0) this.language.clusters.default.splice(index, 1);
        return this;
    }

    contains(...rules) {
        this.inner = rules;
        return this;
    }

    next(rule) {
        this._next = rule;
        return this;
    }

    skipWhite() {
        this._skipWhite = true;
        return this;
    }

    skipEmpty() {
        this._skipEmpty = true;
        return this;
    }

    match(input, startIndex, endIndex) {
        this._regex.lastIndex = startIndex;
        const match = this._regex.exec(input);
        if (match === null) return null;
        if (this._regex.lastIndex > endIndex) return null;

        return { span: [match.index, this._regex.lastIndex] };
    }
}

class KeywordRule extends Rule {
    constructor(language, name, words) {
        super(language, name);
        this._regex = new RegExp(words.join('|'), 'g');
    }
}

class MatchRule extends Rule {
    constructor(language, name, regex) {
        super(language, name);
        this._regex = new RegExp(regex.source, 'g');
    }
}

class RegionRule extends Rule {
    constructor(language, name, start, end) {
        super(language, name);
        this._start = new RegExp(start.source, 'g');
        this._end = new RegExp(end.source, 'g');
        this._skip = null;
    }

    skip(regex) {
        this._skip = new RegExp(regex.source, 'g');
        return this;
    }

    match(input, startIndex, endIndex) {
        this._start.lastIndex = startIndex;
        const start = this._start.exec(input);

        if (start === null) return null;

        if (this._skip !== null && this._skip !== undefined) {
            this._skip.lastIndex = this._start.lastIndex;
            this._end.lastIndex = this._start.lastIndex;
            let skip = this._skip.exec(input);
            let end = this._end.exec(input);
            if (end === null) return null;

            while (skip !== null && skip.index <= end.index) {
                this._end.lastIndex = this._skip.lastIndex;
                skip = this._skip.exec(input);
                end = this._end.exec(input);
                if (end === null) return null;
            }

            if (this._end.lastIndex > endIndex) return null;

            return { span: [start.index, this._end.lastIndex], inner: [this._start.lastIndex, end.index] };
        } else {
            this._end.lastIndex = this._start.lastIndex;
            const end = this._end.exec(input);
            if (end === null) return null;
            if (this._end.lastIndex > endIndex) return null;

            return { span: [start.index, this._end.lastIndex], inner: [this._start.lastIndex, end.index] };
        }
    }
}

function highlight(input, language) {
    const text = input.innerText;

    input.innerHTML = "";
    parse(input, language, language.clusters.default, text, 0, text.length);
}

function parse(el, language, rules, text, pos, end) {
    while (pos < end) {
        let match = null;
        let rule;

        for (const r of rules) {
            let m = r.match(text, pos, end);
            if (m == null) continue;

            if (match == null || m.span[0] < match.span[0] || m.span[0] == match.span[0] && m.span[1] > match.span[1]) {
                match = m;
                rule = r;
            }
        }

        if (match == null) {
            if (pos < end) {
                let t = document.createTextNode(text.slice(pos, end));
                el.appendChild(t);
            }

            break;
        } else {
            if (match.span[0] > pos) {
                let t = document.createTextNode(text.slice(pos, match.span[0]));
                el.appendChild(t);
            }

            let n = document.createElement("span");

            if (match.inner !== undefined) {
                let t1 = document.createTextNode(text.slice(match.span[0], match.inner[0]));

                n.appendChild(t1);
                parse(n, language, rule.inner, text, match.inner[0], match.inner[1]);

                let t2 = document.createTextNode(text.slice(match.inner[1], match.span[1]));

                n.appendChild(t2);
            } else {
                let t = document.createTextNode(text.slice(match.span[0], match.span[1]));

                n.appendChild(t);
            }

            n.classList.add(rule.name);
            el.appendChild(n);
            pos = match.span[1];
        }
    }
}
