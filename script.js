(function () {
    'use strict';

    const GH_USER = 'Amirabbasjadidi';
    const DISCORD_ID = 'amirabbas_jadidi';
    const root = document.documentElement;
    const $ = (id) => document.getElementById(id);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
        remove(k) { try { localStorage.removeItem(k); } catch (e) { /* private mode */ } }
    };
    store.remove('lang'); // leftover from the bilingual version
    let motionPaused = store.get('motion') === 'off';
    const motionOff = () => reducedMotion.matches || motionPaused;

    const pageStart = Date.now();
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const wait = (ms) => sleep(motionOff() ? 0 : ms); // decorative pauses only
    const lastPick = {};
    // random item, never the same one twice in a row for the same key
    function pick(key, arr) {
        let i;
        do { i = Math.floor(Math.random() * arr.length); } while (arr.length > 1 && i === lastPick[key]);
        lastPick[key] = i;
        return arr[i];
    }
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /* ---------------- themes ---------------- */
    const THEMES = ['default', 'dracula', 'gruvbox'];
    function applyTheme(name) {
        if (!THEMES.includes(name)) return false;
        root.dataset.theme = name;
        store.set('theme', name);
        $('theme-select').value = name;
        document.querySelector('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue('--bg').trim();
        rain.color = getComputedStyle(root).getPropertyValue('--rain').trim();
        return true;
    }
    $('theme-select').addEventListener('change', (e) => applyTheme(e.target.value));

    /* ---------------- typed text ---------------- */
    const TYPED = ['Backend Developer🛠️', 'Python Developer🐍', 'JS Developer✨', 'Telegram Bot Developer🚀👨‍💻',
        'GNU/Linux Enthusiast🐧', 'FOSS Lover🔥', 'Open Source Contributor🌐', 'AI/ML Enthusiast🤖',
        'Flutter Enjoyer🦄', 'Cinephile🎬', 'Counter Strike Player⌨️🖱️'];
    const seg = window.Intl && Intl.Segmenter ? new Intl.Segmenter() : null;
    const graphemes = (s) => (seg ? Array.from(seg.segment(s), (x) => x.segment) : Array.from(s));
    function startTyped() {
        const el = $('typed-text');
        let w = 0, i = 0, deleting = false;
        (function tick() {
            if (motionOff()) { // no animation: just swap the word
                el.textContent = TYPED[w];
                w = (w + 1) % TYPED.length; i = 0; deleting = false;
                setTimeout(tick, 3000);
                return;
            }
            const g = graphemes(TYPED[w]);
            i += deleting ? -1 : 1;
            el.textContent = g.slice(0, i).join('');
            let delay = deleting ? 40 : 60;
            if (!deleting && i === g.length) { deleting = true; delay = 2000; }
            else if (deleting && i === 0) { deleting = false; w = (w + 1) % TYPED.length; delay = 300; }
            setTimeout(tick, delay);
        })();
    }

    /* ---------------- name scramble ---------------- */
    const NAME = 'Amirabbas Jadidi';
    let scrambling = false;
    function scramble(el) {
        if (motionOff() || scrambling) return;
        scrambling = true;
        const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01#$%&*<>/\\';
        const start = performance.now(), dur = 700;
        (function frame(now) {
            const p = Math.min(1, (now - start) / dur);
            const revealed = Math.floor(p * NAME.length);
            el.textContent = Array.from(NAME, (c, idx) => (idx < revealed || c === ' ' ? c : pool[Math.floor(Math.random() * pool.length)])).join('');
            if (p < 1) requestAnimationFrame(frame);
            else { el.textContent = NAME; scrambling = false; }
        })(start);
    }
    const nameEl = $('name');
    nameEl.addEventListener('mouseenter', () => scramble(nameEl));
    nameEl.addEventListener('focus', () => scramble(nameEl));

    /* ---------------- matrix rain background ---------------- */
    const rain = { on: !motionOff(), color: '#22c55e' };
    (function initRain() {
        const canvas = $('bg');
        const ctx = canvas.getContext('2d');
        const glyphs = 'アイウエオカキクケコサシスセソ01{}[]()<>=+*/#$def'.split('');
        const size = 16;
        let drops = [], last = 0;
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drops = Array.from({ length: Math.ceil(canvas.width / size) }, () => Math.random() * -50);
        }
        function draw(now) {
            requestAnimationFrame(draw);
            if (!rain.on || document.hidden || now - last < 60) return; // ~16fps keeps it cheap
            last = now;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = rain.color;
            ctx.font = size + 'px "JetBrains Mono", monospace';
            for (let i = 0; i < drops.length; i++) {
                ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * size, drops[i] * size);
                if (drops[i] * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i] += 1;
            }
        }
        rain.clear = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
        window.addEventListener('resize', resize);
        resize();
        requestAnimationFrame(draw);
    })();
    reducedMotion.addEventListener && reducedMotion.addEventListener('change', () => { rain.on = !motionOff(); if (!rain.on) rain.clear(); });

    /* ---------------- toast ---------------- */
    let toastTimer = null;
    function toast(msg, isError) {
        const el = $('toast');
        el.textContent = msg;
        el.classList.toggle('error', !!isError);
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
    }

    /* ---------------- "light mode" prank ---------------- */
    const PRANK_LINES = [
        '// TODO: implement light mode\n// (added 2019)',
        '$ sudo apt install light-mode\nE: Unable to locate package light-mode',
        'light-mode requires sudo.\nYou are not in the sudoers file. This incident will be reported.',
        'Light mode was removed in a hotfix. Nobody talks about the incident.',
        'Works on my machine. My machine is dark.',
        'git blame says this idea was yours.',
        'assert theme == "dark"  # passed',
        "HTTP 418: I'm a dark theme.",
        "Feature request closed: won't fix.",
        'Sunlight detected. Closing the blinds.',
        'if (theme === "light") theme = "dark"; // fixed',
        'You pressed it. The site pretended not to notice.',
        'This button has a 0% success rate and a 100% click rate.',
        'Light mode is in the backlog, right below "rewrite it in Rust".',
        "rm: cannot remove 'darkness': Device or resource busy",
        'This site has three themes. They are all dark.',
        'Thank you for your feedback. It has been piped to /dev/null.',
        'Segmentation fault (sun dumped)',
        'The panda flew to space looking for light mode. Space is also dark.',
        "$ git checkout -b light-mode\nfatal: we don't do that here.",
        'Light mode: merged, reverted, merged, reverted. We call it a feature.',
        'while (true) askForLightMode(); // you, apparently',
        'You have clicked this button. The button has made a note.',
        'Rule #1 of this site: we do not talk about light mode.',
        'Light mode ships in v2. There is no v2.',
        '$ chmod -x /usr/bin/sun',
        "Your eyes have been saved. You're welcome.",
        'Contrast ratio re-checked. The answer is still no.',
        'const lightMode = undefined; // as designed',
        'The matrix rain would be invisible. Think of the rain.',
        'Accessibility audit: passed. Light mode: not invited.',
        "Light mode is a frontend issue. I'm backend. Ticket reassigned.",
        'Closed as duplicate of every other time you pressed this.',
        '$ curl -X POST /api/light-mode\n403 Forbidden (nice try)',
        '> theme = "light"\n> theme\n"dark"',
        'Patch notes v1.0.1: removed the sun.',
        'Press again for a different no.'
    ];
    const prank = { el: $('prank'), text: $('prank-text'), sr: $('prank-sr'), bag: [], last: null, typing: null, hide: null, hover: false, typed: false };

    function nextPrankLine() {
        if (!prank.bag.length) {
            prank.bag = shuffle(PRANK_LINES.slice());
            // no repeat across the boundary of two shuffled rounds
            if (prank.bag[prank.bag.length - 1] === prank.last) prank.bag.unshift(prank.bag.pop());
        }
        prank.last = prank.bag.pop();
        return prank.last;
    }
    function schedulePrankHide() {
        clearTimeout(prank.hide);
        if (prank.hover || !prank.typed) return;
        prank.hide = setTimeout(hidePrank, 3500);
    }
    function hidePrank() {
        clearInterval(prank.typing);
        clearTimeout(prank.hide);
        prank.hover = false;
        if (document.activeElement === prank.el) $('light-toggle').focus(); // don't strand focus on a hidden element
        prank.el.classList.remove('show');
    }
    function showPrank() {
        const line = nextPrankLine();
        clearInterval(prank.typing);
        clearTimeout(prank.hide);
        prank.typed = false;
        prank.el.classList.add('show');
        prank.sr.textContent = line; // screen readers get the full line once
        if (motionOff()) {
            prank.text.textContent = line;
            prank.typed = true;
            schedulePrankHide();
            return;
        }
        const g = graphemes(line);
        let i = 0;
        prank.text.textContent = '';
        prank.typing = setInterval(() => {
            prank.text.textContent = g.slice(0, ++i).join('');
            if (i >= g.length) { clearInterval(prank.typing); prank.typed = true; schedulePrankHide(); }
        }, 35);
    }
    $('light-toggle').addEventListener('click', () => { showPrank(); found('light'); }); // while open: skips to the next line
    prank.el.addEventListener('click', hidePrank);
    // hovering or focusing the popup pauses the auto-dismiss
    prank.el.addEventListener('mouseenter', () => { prank.hover = true; clearTimeout(prank.hide); });
    prank.el.addEventListener('mouseleave', () => { prank.hover = false; schedulePrankHide(); });
    prank.el.addEventListener('focusin', () => { prank.hover = true; clearTimeout(prank.hide); });
    prank.el.addEventListener('focusout', () => { prank.hover = false; schedulePrankHide(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && prank.el.classList.contains('show')) hidePrank(); });

    /* ---------------- pause motion pill ---------------- */
    function setMotionPaused(paused) {
        motionPaused = paused;
        store.set('motion', paused ? 'off' : 'on');
        root.classList.toggle('still', paused);
        const b = $('motion-toggle');
        b.querySelector('.pill-icon').textContent = paused ? '▶' : '❚❚';
        b.querySelector('.pill-label').textContent = paused ? 'Resume motion' : 'Pause motion';
        rain.on = !motionOff();
        if (!rain.on) rain.clear();
    }
    $('motion-toggle').addEventListener('click', () => setMotionPaused(!motionPaused));

    /* ---------------- GitHub repos (cached) ---------------- */
    const CACHE_KEY = 'gh-repos-v1';
    const TTL = 60 * 60 * 1000; // 1h keeps us far below the 60 req/h unauthenticated limit
    let repoState = { status: 'loading', repos: [], stale: false };
    let repoPromise = null;

    function readCache() {
        try { return JSON.parse(store.get(CACHE_KEY)); } catch (e) { return null; }
    }
    function getRepos(force) {
        const cached = readCache();
        if (!force && cached && Date.now() - cached.t < TTL) return Promise.resolve({ repos: cached.repos, stale: false });
        if (repoPromise) return repoPromise;
        repoPromise = fetch(`https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=100`, {
            headers: { Accept: 'application/vnd.github+json' }
        })
            .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then((data) => {
                const repos = data
                    .filter((r) => !r.fork && !r.archived)
                    .slice(0, 6)
                    .map((r) => ({ name: r.name, desc: r.description, url: r.html_url, lang: r.language, stars: r.stargazers_count, pushed: r.pushed_at }));
                store.set(CACHE_KEY, JSON.stringify({ t: Date.now(), repos }));
                return { repos, stale: false };
            })
            .catch((err) => {
                if (cached) return { repos: cached.repos, stale: true }; // stale beats nothing
                throw err;
            })
            .finally(() => { repoPromise = null; });
        return repoPromise;
    }

    function loadProjects(force) {
        repoState = { status: 'loading', repos: [], stale: false };
        renderProjects();
        return getRepos(force)
            .then((res) => { repoState = { status: 'ok', repos: res.repos, stale: res.stale }; })
            .catch(() => { repoState = { status: 'error', repos: [], stale: false }; })
            .then(renderProjects);
    }

    function el(tag, cls, text) {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    function renderProjects() {
        const grid = $('projects-grid');
        grid.replaceChildren();
        grid.setAttribute('aria-busy', String(repoState.status === 'loading'));
        if (repoState.status === 'loading') {
            grid.append(el('p', 'sr-only', 'Loading repositories…'));
            for (let i = 0; i < 3; i++) grid.append(el('div', 'card skeleton'));
            return;
        }
        if (repoState.status === 'error') {
            const p = el('p', 'state', "Couldn't load repositories from GitHub.");
            const b = el('button', 'btn', 'Retry');
            b.type = 'button';
            b.addEventListener('click', () => loadProjects(true));
            p.append(b);
            grid.append(p);
            return;
        }
        if (!repoState.repos.length) { grid.append(el('p', 'state', 'No public repositories yet.')); return; }
        const fmt = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short' });
        repoState.repos.forEach((r) => {
            const a = el('a', 'card');
            a.href = r.url; a.target = '_blank'; a.rel = 'noopener';
            const meta = el('div', 'meta');
            if (r.lang) meta.append(el('span', 'lang', r.lang));
            meta.append(el('span', null, '★ ' + r.stars));
            meta.append(el('span', null, fmt.format(new Date(r.pushed))));
            a.append(el('h3', null, r.name), el('p', null, r.desc || 'No description'), meta);
            grid.append(a);
        });
        if (repoState.stale) grid.append(el('p', 'state', 'Showing cached data.'));
    }

    /* ---------------- terminal ---------------- */
    const out = $('term-out');
    const input = $('terminal-input');
    const history = [];
    let hIdx = 0;
    let busy = false;

    function print(text, cls) { const d = el('div', cls, text); out.append(d); out.scrollTop = out.scrollHeight; return d; }
    function printLink(label, href, text) {
        const d = el('div');
        d.append(el('span', 'mut', label));
        const a = el('a', null, text || href);
        a.href = href;
        if (!href.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
        d.append(a);
        out.append(d);
        out.scrollTop = out.scrollHeight;
    }
    async function animate(frames, ms, cls) {
        const d = print(frames[0], 'art ' + (cls || ''));
        if (motionOff()) { d.textContent = frames[frames.length - 1]; return d; }
        for (const f of frames) { d.textContent = f; out.scrollTop = out.scrollHeight; await sleep(ms); }
        return d;
    }

    /* ---------------- easter egg tracking ---------------- */
    const EGGS = ['rmrf', 'cs', 'sudo', 'exit', 'inception', 'interstellar', 'tenet', 'oppenheimer', 'dunkirk', 'batman',
        'fightclub', 'nightcity', 'linkinpark', 'metallica', 'manutd', 'realmadrid', 'ronaldo', 'f1', 'lightsout',
        'vim', 'emacs', 'rm', 'lsla', 'passwd', 'hack', 'matrix', 'make', 'panda', 'coffee', 'light'];
    function foundEggs() {
        try { return new Set(JSON.parse(store.get('eggs')) || []); } catch (e) { return new Set(); }
    }
    function found(id) {
        const s = foundEggs();
        if (s.has(id)) return;
        s.add(id);
        store.set('eggs', JSON.stringify([...s]));
        newEgg = `🥚 secret found! (${s.size}/${EGGS.length})`; // run() prints it after the output
        if (!busy) { print(newEgg, 'ok'); newEgg = null; } // e.g. triggered from the theme picker
    }
    let newEgg = null;
    const egg = (id, fn) => (args) => { found(id); return fn(args); };

    // siuu celebration: every frame is 4 lines x 7 columns so redraws never shift
    const SIUU_FRAMES = {
        stand:  ['       ', '   o   ', '  /|\\  ', '  / \\  '],
        crouch: ['       ', '       ', '  _o_  ', '  / \\  '],
        jump:   ['  \\o/  ', '   |   ', '  / \\  ', '       '],
        land:   ['       ', '   o   ', ' _/|\\_ ', '  / \\  ']
    };

    const COMMANDS = {
        help() {
            print('Available commands:', 'acc');
            [['help', 'show this list'], ['whoami', 'who is this guy?'], ['ls projects', 'latest GitHub repos'],
                ['cat skills.txt', 'what I work with'], ['neofetch', 'system info'], ['contact', 'how to reach me'],
                ['theme <name>', 'default | dracula | gruvbox'], ['eggs', 'secrets found so far'], ['clear', 'clear the screen']]
                .forEach(([c, d]) => print('  ' + c.padEnd(16) + d));
            print('There are secrets here… try some commands. 🥚', 'mut');
        },
        whoami() {
            print('Amirabbas Jadidi', 'acc');
            print('Backend developer. I build Python services and Telegram bots,');
            print('live in GNU/Linux, and believe in free & open source software.');
        },
        ls(args) {
            if (args[0] === '-la' || args[0] === '-al') {
                found('lsla');
                print([
                    'drwxr-xr-x  root  .',
                    '-rw-------  root  .bash_history      (empty, I swear)',
                    '-rw-r--r--  root  .gitignore         (contains: my mistakes)',
                    '-rw-r--r--  root  .light-mode        0 bytes',
                    '-r--------  root  .secrets           try harder 😏',
                    'drwxr-xr-x  root  projects/',
                    '-rw-r--r--  root  skills.txt'
                ].join('\n'), 'art');
                return;
            }
            if (args[0] !== 'projects') { print('projects/  skills.txt', 'acc2'); return; }
            print('Fetching from GitHub…', 'mut');
            return getRepos(false).then((res) => {
                if (!res.repos.length) { print('(empty)', 'mut'); return; }
                res.repos.forEach((r) => printLink((r.lang || '—').padEnd(12), r.url, r.name));
                if (res.stale) print('(cached — GitHub unreachable)', 'mut');
            }).catch(() => print('ls: cannot access GitHub API (rate limit or offline). Try later.', 'err'));
        },
        cat(args) {
            if (args[0] === '/etc/passwd') {
                found('passwd');
                print(['root:x:0:0:Nice try:/root:/bin/nope', 'visitor:x:1000:1000:Curious Human:/home/visitor:/bin/bash',
                    'panda:x:1337:1337:License Guardian:/bamboo:/bin/chew', '# passwords are stored in a sticky note. on my monitor.'].join('\n'), 'art mut');
                return;
            }
            if (args[0] !== 'skills.txt') { print(`cat: ${args[0] || ''}: No such file or directory`, 'err'); return; }
            [['backend ', 'Python · REST APIs · async'], ['bots    ', 'Telegram Bot API'], ['web     ', 'JavaScript · HTML/CSS'],
                ['mobile  ', 'Flutter (enjoyer)'], ['os      ', 'GNU/Linux · shell'], ['also    ', 'AI/ML curiosity · FOSS contributions']]
                .forEach(([k, v]) => { const d = print(''); d.append(el('span', 'acc2', k), document.createTextNode(v)); });
        },
        neofetch() {
            const art = ['    .--.     ', '   |o_o |    ', '   |:_/ |    ', '  //   \\ \\   ', ' (|     | )  ', "/'\\_   _/`\\  ", '\\___)=(___/  '];
            const info = [['', 'root@amirabbas'], ['', '--------------'], ['OS', 'amirabbas.os (GNU/Linux)'], ['Role', 'Backend Developer'],
                ['Shell', 'python3'], ['Langs', 'Python, JavaScript, Dart'], ['Bots', 'Telegram'], ['License', 'FOSS ♥'],
                ['Theme', root.dataset.theme]];
            for (let i = 0; i < Math.max(art.length, info.length); i++) {
                const d = print('');
                d.append(el('span', 'acc', art[i] || ' '.repeat(13)));
                const [k, v] = info[i] || ['', ''];
                if (k) d.append(el('span', 'acc2', k + ': '));
                d.append(document.createTextNode(v));
            }
        },
        contact() {
            printLink('email     ', 'mailto:abbasjadidi2008@gmail.com', 'abbasjadidi2008@gmail.com');
            printLink('github    ', 'https://github.com/Amirabbasjadidi');
            printLink('telegram  ', 'https://t.me/amirabbasjadidi');
            printLink('instagram ', 'https://www.instagram.com/amirabbas._.jadidi/');
            print('discord   ' + DISCORD_ID);
            printLink('steam     ', 'https://steamcommunity.com/id/Med1z/');
        },
        clear() { out.replaceChildren(); },
        theme(args) {
            if (!args[0]) { print('current: ' + root.dataset.theme + '  (available: ' + THEMES.join(', ') + ')'); return; }
            if (args[0] === 'light') { showPrank(); found('light'); print('theme: light mode request forwarded to management…', 'mut'); return; }
            if (applyTheme(args[0])) print('theme → ' + args[0], 'acc2');
            else print('theme: unknown theme "' + args[0] + '"', 'err');
        },
        light() { COMMANDS.theme(['light']); },
        eggs() {
            const n = foundEggs().size, total = EGGS.length;
            const bar = '█'.repeat(Math.round((n / total) * 20)).padEnd(20, '░');
            print(`🥚 secrets found: ${n}/${total}`, 'acc');
            print(bar, 'ok');
            print(n === total ? 'All of them. Respect. 🏆' : 'Keep digging. Not every secret is in help.', 'mut');
        },
        pwd() { print('/home/amirabbas'); },
        uname() { print('amirabbas.os 6.6.6-foss x86_64 GNU/Linux'); },
        date() { print(new Date().toString()); },
        echo(args) { print(args.join(' ')); },
        history() { history.forEach((h, i) => print(String(i + 1).padStart(4) + '  ' + h)); },

        /* ---- classics ---- */
        exit: egg('exit', () => print(pick('exit', [
            'logout… just kidding, there is no escape. 🐧',
            'exit: this is a website. Closing the tab is the exit.',
            'Session saved. You will be back. They always come back.'
        ]), 'mut')),
        async sudo(args) {
            const rest = args.join(' ');
            if (/^rm\s+-(rf|fr)\s+\/(\s|$|\*)/.test(rest)) { found('rmrf'); return rmrf(); }
            if (/^make\b/.test(rest)) { found('make'); print('Okay. 🥪', 'ok'); return; }
            found('sudo');
            print('[sudo] password for visitor: ', 'mut');
            await wait(600);
            print(pick('sudo', [
                'visitor is not in the sudoers file. This incident will be reported. 👮',
                'Nice try. root is on vacation.',
                'sudo: permission denied. Ask the panda. 🐼'
            ]), 'err');
        },
        rm: egg('rm', (args) => {
            if (/^-(rf|fr)$/.test(args[0]) && args[1] === '/') print('rm: Permission denied. Did you forget sudo? 😏', 'err');
            else print(pick('rm', ['rm: refusing to delete anything here.', 'rm: this file has emotional value.', 'rm: moved to trash. The trash is also read-only.']), 'err');
        }),
        make: egg('make', (args) => print(`make: *** No rule to make target '${args[0] || 'sense'}'. Stop.`, 'err')),
        vim: egg('vim', () => {
            print('~\n~\n~\n~          VIM - Vi IMproved\n~\n~', 'art acc2');
            print(pick('vim', [
                'You are now trapped in vim. Try :q … :q! … :wq … or just close the tab like the rest of us.',
                ':q → E37: No write since last change. Welcome to your new home.',
                'Day 412 in vim. I have learned to love the hjkl.',
                'vim opened. Press any key to continue. Press every key to exit.'
            ]), 'mut');
        }),
        emacs: egg('emacs', () => print(pick('emacs', [
            'emacs: a great operating system, lacking only a decent editor.',
            'Loading emacs… please wait while it boots its own OS.',
            'C-x C-c to exit. Your pinky will never forgive you.',
            'emacs is not installed. vim was watching.'
        ]), 'mut')),
        async hack() {
            found('hack');
            print('Initializing hack.exe… 💻', 'acc');
            for (let p = 0; p <= 10; p += 2) {
                await wait(220);
                print('[' + '#'.repeat(p).padEnd(10, '.') + '] ' + p * 10 + '%  ' + pick('hackstep', ['bypassing firewall', 'decrypting mainframe', 'downloading more RAM', 'reversing the polarity', 'enhancing… enhance!', 'guessing password: password']), 'ok');
            }
            print(pick('hack', [
                'ACCESS GRANTED: your own localStorage. Impressive.',
                "You're in. In what? Nobody knows.",
                'Hacked successfully. The FBI has been notified. (The FBI is a cat.)'
            ]), 'acc2');
        },
        matrix: egg('matrix', () => {
            if (motionOff()) { print('matrix: motion is paused (see the Pause motion button)', 'mut'); return; }
            rain.on = !rain.on; if (!rain.on) rain.clear();
            print('matrix ' + (rain.on ? 'on' : 'off') + ' — ' + pick('matrix', ['Follow the white rabbit. 🐇', 'There is no spoon.', 'Red pill or blue pill? I took the dark theme.', 'Déjà vu? They changed something.']), 'acc2');
        }),
        panda: egg('panda', () => print(pick('panda', [
            '🐼 The panda guards the license. CC BY-SA 4.0. Respect the panda.',
            '🐼 chewing bamboo… please hold.',
            '🐼 Fork me, but keep the panda.'
        ]), 'acc2')),
        coffee: egg('coffee', () => print('HTTP 418: I\'m a teapot. ☕ Try `tea`. (there is no tea.)', 'acc')),
        cs: egg('cs', async () => {
            print('Launching Counter-Strike…', 'acc');
            await wait(400); print('> connect de_dust2', 'mut');
            await wait(400); print('> mp_warmup_end', 'mut');
            await wait(400); print('Terrorists: RUSH B, NO STOP! 🔫', 'acc2');
            await wait(400); print(pick('cs', [
                'You were killed by a guy holding a 3-year-old AWP angle. GG.',
                'Your teammate bought a Negev. Round lost.',
                'Clutch 1v5… you got 1. The 5 got you.',
                'Bomb has been planted. In production.'
            ]), 'err');
        }),

        /* ---- Christopher Nolan ---- */
        async inception() {
            found('inception');
            const spin = ['\\|/', '|/-', '/-\\', '-\\|'];
            const frame = (s, off) => [' '.repeat(off) + '    |', ' '.repeat(off) + "  .-'-.", ' '.repeat(off) + ' ( ' + s + ' )', ' '.repeat(off) + "  '-.-'", ' '.repeat(off) + '    V'].join('\n');
            const frames = [];
            for (let i = 0; i < 24; i++) frames.push(frame(spin[i % 4], 0));
            for (let i = 0; i < 8; i++) frames.push(frame(spin[i % 4], i % 2)); // the wobble…
            await animate(frames, 110, 'acc2');
            print(pick('inception', [
                '▌ signal lost. Did it fall? You will never know.',
                '▌ the top is still spinning. Is this production or a dream of production?',
                '▌ we need to go deeper: git checkout dream/level-3',
                '▌ the totem wobbled… then the build server rebooted.'
            ]), 'mut');
        },
        interstellar: egg('interstellar', () => {
            const s = Math.round((Date.now() - pageStart) / 1000);
            const years = (s * 7) / 3600; // Miller's planet: 1 hour = 7 years
            print(`You've been on this site for ${Math.floor(s / 60)}m ${s % 60}s.`, 'acc2');
            print(`On Miller's planet that's ~${years < 1 ? Math.round(years * 365) + ' days' : years.toFixed(1) + ' years'} back on Earth.`, 'acc');
            print(pick('interstellar', [
                'Do not go gentle into that merge conflict.',
                'Love is the one thing that transcends time and space. Also tech debt.',
                'TARS, set humor to 75%. Done. That was the 75%.',
                'The bookshelf keeps knocking books down. It is just a flaky test.'
            ]), 'mut');
        }),
        tenet: egg('tenet', () => {
            const line = pick('tenet', [
                'This deploy was rolled back before it was pushed.',
                'The bug was fixed before it was reported.',
                'Read this the other way and it still makes no sense.',
                'Do not try to understand it. Feel it. Then git revert it.'
            ]);
            print(graphemes(line).reverse().join(''), 'acc2');
            print('(inverted output. or was it the input?)', 'mut');
        }),
        oppenheimer: egg('oppenheimer', () => print(pick('oppenheimer', [
            'Now I am become Deploy, destroyer of prod. 💥',
            'Theory says this commit will not ignite the atmosphere. Probability: near zero.',
            'Trinity test passed. Unit tests: still 0.',
            'They will not fear it until they understand it. They will not understand it until they read the docs.'
        ]), 'acc')),
        dunkirk: egg('dunkirk', () => {
            print('Three timelines: one week (the sprint), one day (code review), one hour (the hotfix).', 'acc2');
            print(pick('dunkirk', [
                'Evacuating every process from the beach, one small boat at a time. ⛵',
                '*ticking clock intensifies* — deadline is in 5 minutes.',
                'Home. You can see it from here. It is called "merged".'
            ]), 'mut');
        }),
        batman: egg('batman', () => {
            print('   🦇\n  /  \\   the signal is on.\n /    \\  Gotham needs a hotfix.', 'art acc');
            print(pick('batman', [
                'Why do we fall? So we can learn to write rollback scripts.',
                "I'm not the dev this repo deserves, but the one it has right now.",
                'Some devs just want to watch prod burn.',
                'It is not who I am underneath, but what I commit that defines me.'
            ]), 'mut');
        }),

        /* ---- Fight Club ---- */
        fightclub: egg('fightclub', () => print(pick('fightclub', [
            '🤐',
            'You know the rule. This command will not elaborate.',
            'Rule #1 applies to stdout too.',
            'You did not see anything. Neither did this terminal.'
        ]), 'mut')),

        /* ---- Cyberpunk 2077 ---- */
        async nightcity() {
            found('nightcity');
            print('╔════════════════════════════╗\n║  N I G H T   C I T Y  2077 ║\n╚════════════════════════════╝', 'art acc');
            for (const l of ['[netrunner] jacking in…', '[ICE] breach protocol: 1C 55 BD E9 … OK', '[braindance] loading memory: a successful Friday deploy… CORRUPTED']) {
                await wait(350); print(l, 'ok');
            }
            print(pick('nightcity', [
                'Wake up, samurai. We have a prod to burn. 🔥',
                'Johnny Silverhand is now living rent-free in /etc/hosts.',
                'Your chrome is outdated. Run `apt upgrade cyberware`.',
                'Preem deploy, choom. Zero bugs. (CI: 47 bugs)',
                'Delamain cab arrived. Destination: backlog.'
            ]), 'acc2');
        },

        /* ---- Linkin Park (titles only, no lyrics) ---- */
        linkinpark: egg('linkinpark', () => {
            print('🎸 Linkin Park — debut album: Hybrid Theory (2000)', 'acc');
            print(pick('linkinpark', [
                'Hybrid Theory: the reviewer\'s theory that your bug is both frontend AND backend.',
                'Status: Numb. 47 failing tests and I feel nothing.',
                'Deploying at Minutes to Midnight. What could go wrong?',
                'git log --grep="What I\'ve Done" → 312 results.',
                'Breaking the Habit: writing tests before the bug report.',
                'One Step Closer… to merging. Reviewer requested changes.',
                'Papercut: the one-character typo that took down staging.',
                'Meteora: the server room after a failed migration.'
            ]), 'acc2');
        }),

        /* ---- Metallica (titles only, no lyrics) ---- */
        metallica: egg('metallica', () => {
            print('🤘 Metallica — formed in Los Angeles, 1981', 'acc');
            print(pick('metallica', [
                'Master of Puppets: `kill -9` and watch every process obey.',
                'Enter Sandman: `sleep 28800` — the only cron job I never skip.',
                'Kill \'Em All: `pkill -u visitor`',
                'Ride the Lightning: deploying straight to prod on a Friday.',
                'Fade to Black: the only theme this site supports. (see: light mode button)',
                'Seek & Destroy: `grep -rn TODO .` and then… ignore them all.',
                'The Unforgiven: whoever force-pushed to main.',
                '…And Justice for All: `git blame`, but for everyone.'
            ]), 'acc2');
        }),

        /* ---- Manchester United ---- */
        manutd: egg('manutd', () => {
            print('🔴 Manchester United — Old Trafford, the Theatre of Dreams', 'acc');
            print(pick('manutd', [
                'Build still running at 90\'. Fergie time added. Finished at 90+4\'. Green. 🟢',
                'Sir Alex would have given this PR the hairdryer treatment.',
                'Theatre of Dreams: where builds dream of passing.',
                'Red Devils mode: on. 😈 Bugs: on the bench.',
                'Code review extended by Fergie time. Merge expected at 90+6\'.'
            ]), 'acc2');
        }),

        /* ---- Real Madrid ---- */
        realmadrid: egg('realmadrid', () => {
            print('⚪ ¡Hala Madrid! — record European Cup winners', 'acc');
            print(pick('realmadrid', [
                'This deploy always shows up late and still wins.',
                'CI was red for 88 minutes. Then: comeback. 🟢',
                'Down 0-2? Real Madrid treats that as the warm-up.',
                'Champions League night: prod is down, but somehow we are through to the next round.',
                'Remontada.exe completed successfully.'
            ]), 'acc2');
        }),

        /* ---- Cristiano Ronaldo ---- */
        async ronaldo() {
            found('ronaldo');
            const SIUU = 'S I U U U U U U U ! ! !';
            const fig = print('', 'art acc');
            const txt = print('', 'acc2');
            const draw = (frame, text) => { fig.textContent = frame.join('\n'); txt.textContent = text; out.scrollTop = out.scrollHeight; };
            if (motionOff()) {
                draw(SIUU_FRAMES.stand, SIUU);
            } else {
                for (const f of [SIUU_FRAMES.stand, SIUU_FRAMES.crouch, SIUU_FRAMES.jump, SIUU_FRAMES.jump]) { draw(f, ''); await sleep(260); }
                const letters = graphemes(SIUU);
                for (let i = 1; i <= letters.length; i++) { draw(SIUU_FRAMES.land, letters.slice(0, i).join('')); await sleep(70); }
                await sleep(700);
                draw(SIUU_FRAMES.stand, SIUU); // arms come down: the celebration is over
                await sleep(300);
            }
            print(pick('ronaldo', [
                'GOAT detected. 🐐 whoami → the best.',
                'CR7 does 1,000 push-ups before each git push.',
                'Bugs do not get fixed by CR7. They fix themselves out of respect.',
                '7 commits, 7 coffees, 7 green builds. Coincidence? No.',
                'Bicycle kick merged into main. Clean.',
                "Born in Madeira, raised on hat-tricks. Five Ballon d'Or. Zero merge conflicts."
            ]), 'mut');
            print('Calma, calma. 🤫 The deploy is under control.', 'mut');
        },

        /* ---- F1 / Max Verstappen ---- */
        f1: egg('f1', () => {
            print('🏎️  ' + pick('f1', [
                'Max Verstappen: youngest-ever F1 race winner, at 18 (Spain, 2016).',
                'Box box! Rebuilding node_modules… pit stop took 4 minutes. Not great.',
                '33: Max\'s original race number. Also my unread notifications.',
                'Simply lovely. 🏁 Build P1, tests P1, coffee P1.',
                'Lights out and away we go… straight into a merge conflict at turn 1.',
                'Undercut the bug: pit for fresh tests one lap earlier.',
                'Track limits exceeded: your function is 400 lines long.'
            ]), 'acc2');
            print('Feeling quick? Try `lights-out`.', 'mut');
        }),
        'lights-out': lightsOut
    };
    // aliases
    Object.assign(COMMANDS, {
        tyler: COMMANDS.fightclub, samurai: COMMANDS.nightcity, johnny: COMMANDS.nightcity, numb: COMMANDS.linkinpark,
        sandman: COMMANDS.metallica, mufc: COMMANDS.manutd, fergie: COMMANDS.manutd, hala: COMMANDS.realmadrid,
        cr7: COMMANDS.ronaldo, siuu: COMMANDS.ronaldo, siuuu: COMMANDS.ronaldo, max: COMMANDS.f1, verstappen: COMMANDS.f1,
        secrets: COMMANDS.eggs, tea: () => print('There is no tea. Only coffee. And no coffee either.', 'mut')
    });

    async function rmrf() {
        print('[sudo] password for visitor: ********', 'mut');
        await wait(500);
        for (const dir of ['/bin', '/boot', '/etc', '/home/amirabbas/projects', '/usr/lib/python3', '/var/telegram-bots']) {
            print('removing ' + dir + ' …', 'err');
            await wait(220);
        }
        document.body.classList.add('panic');
        print('Kernel panic - not syncing: Attempted to kill init! 💀', 'err');
        await wait(1200);
        document.body.classList.remove('panic');
        print('…just kidding. Nothing was deleted; this is a static page. Nice try though. 🐧', 'acc2');
    }

    /* ---------------- lights-out reaction game ---------------- */
    let game = null;
    function lightsOut() {
        found('lightsout');
        return new Promise((resolve) => {
            const row = print('', 'art err');
            const render = (k) => { row.textContent = Array.from({ length: 5 }, (_, i) => (i < k ? '(●)' : '( )')).join(' '); };
            render(0);
            print('Press Enter (or tap the terminal) when the lights go OUT.', 'mut');
            game = { phase: 'arming', row, resolve, timer: null, t0: 0 };
            let n = 0;
            // real timers on purpose: this is a game, not decoration
            game.timer = setInterval(() => {
                render(++n);
                if (n < 5) return;
                clearInterval(game.timer);
                game.timer = setTimeout(() => {
                    row.className = 'art ok';
                    row.textContent = '( ) ( ) ( ) ( ) ( )   LIGHTS OUT!';
                    game.phase = 'go';
                    game.t0 = performance.now();
                    game.timer = setTimeout(() => endGame('Too slow. The field is already at turn 3. 🐢', 'err'), 5000);
                }, 400 + Math.random() * 2600);
            }, 900);
        });
    }
    function endGame(msg, cls) {
        clearInterval(game.timer);
        clearTimeout(game.timer);
        print(msg, cls);
        const done = game.resolve;
        game = null;
        done();
    }
    function gamePress() {
        if (game.phase !== 'go') { endGame('JUMP START! 🟥 5-second penalty. Stewards are not amused.', 'err'); return; }
        const ms = Math.round(performance.now() - game.t0);
        const best = Math.min(ms, Number(store.get('lights-best')) || Infinity);
        store.set('lights-best', String(best));
        const verdict = ms < 200 ? 'Are you Max? 🏆' : ms < 300 ? 'Podium pace. 🥉' : ms < 450 ? 'Solid midfield start.' : 'Still in the garage? 🔧';
        endGame(`Reaction: ${ms} ms — ${verdict}  (best: ${best} ms)`, 'acc2');
    }
    $('terminal').addEventListener('pointerdown', () => { if (game) gamePress(); });

    async function run(raw) {
        const line = raw.trim();
        const echo = print('');
        echo.className = 'cmd';
        echo.append(el('span', 'p', 'root@amirabbas:~# '), document.createTextNode(line));
        if (!line) return;
        history.push(line);
        hIdx = history.length;
        const [cmd, ...args] = line.split(/\s+/);
        const fn = Object.prototype.hasOwnProperty.call(COMMANDS, cmd.toLowerCase()) ? COMMANDS[cmd.toLowerCase()] : null;
        if (!fn) { print(`${cmd}: command not found. Try 'help'.`, 'err'); return; }
        busy = true;
        try { await fn(args); } finally {
            busy = false;
            if (newEgg) { print(newEgg, 'ok'); newEgg = null; }
        }
    }

    $('term-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (game) { input.value = ''; gamePress(); return; }
        if (busy) return;
        const v = input.value;
        input.value = '';
        run(v);
    });

    const COMPLETIONS = Object.keys(COMMANDS).concat(['ls projects', 'ls -la', 'cat skills.txt', 'cat /etc/passwd',
        'theme default', 'theme dracula', 'theme gruvbox', 'theme light', 'sudo rm -rf /']);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' && history.length) {
            e.preventDefault(); hIdx = Math.max(0, hIdx - 1); input.value = history[hIdx];
        } else if (e.key === 'ArrowDown' && history.length) {
            e.preventDefault(); hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || '';
        } else if (e.key === 'Tab' && input.value) {
            const v = input.value;
            const options = COMPLETIONS.filter((c) => c.startsWith(v));
            if (!options.length) return; // let Tab move focus
            e.preventDefault();
            let prefix = options[0];
            for (const o of options) while (!o.startsWith(prefix)) prefix = prefix.slice(0, -1);
            if (options.length === 1) input.value = prefix;
            else if (prefix.length > v.length) input.value = prefix;
            else print(options.join('   '), 'mut');
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault(); COMMANDS.clear();
        }
    });

    // click on output focuses input, unless the user is selecting text or clicking a link
    out.addEventListener('click', (e) => {
        if (e.target.closest('a') || String(window.getSelection())) return;
        input.focus({ preventScroll: true });
    });

    $('chips').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        if (game) { gamePress(); return; }
        if (!busy) run(chip.textContent);
    });

    /* ---------------- discord ---------------- */
    $('discord-link').addEventListener('click', (e) => {
        e.preventDefault();
        const ok = () => { toast(`Discord ID copied: ${DISCORD_ID} — send me a message :)`); print('discord: ' + DISCORD_ID + ' copied to clipboard ✔', 'acc2'); };
        const fail = () => { toast(`Couldn't copy. My Discord ID: ${DISCORD_ID}`, true); print('discord: ' + DISCORD_ID + ' (copy failed, copy it by hand)', 'err'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(DISCORD_ID).then(ok, fail);
        else fail();
    });
    $('discord-link').addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } });

    /* ---------------- boot sequence (first visit only) ---------------- */
    function boot() {
        return new Promise((resolve) => {
            if (store.get('booted') || motionOff()) { resolve(); return; }
            store.set('booted', '1');
            const overlay = $('boot'), log = $('boot-log');
            const lines = ['Booting amirabbas.os ...', '', '[  OK  ] Mounted /home/amirabbas', '[  OK  ] Started python3.service',
                '[  OK  ] Started telegram-bots.target', '[  OK  ] Loaded GNU/Linux userland', '[  OK  ] Reached target FOSS.', '', 'Welcome, visitor.'];
            let i = 0, timer = null, finished = false;
            overlay.hidden = false;
            $('boot-skip').focus();
            function finish() {
                if (finished) return;
                finished = true;
                clearTimeout(timer);
                document.removeEventListener('keydown', finish);
                overlay.classList.add('done');
                setTimeout(() => { overlay.hidden = true; resolve(); }, 350);
            }
            (function next() {
                if (i >= lines.length) { timer = setTimeout(finish, 500); return; }
                log.textContent += lines[i++] + '\n';
                timer = setTimeout(next, 170);
            })();
            overlay.addEventListener('click', finish);
            document.addEventListener('keydown', finish);
        });
    }

    /* ---------------- init ---------------- */
    applyTheme(THEMES.includes(root.dataset.theme) ? root.dataset.theme : 'default');
    if (motionPaused) setMotionPaused(true); // sync the pill label with the saved choice
    startTyped();
    loadProjects(false);
    print("Welcome to amirabbas.os — type 'help' to get started.", 'mut');
    boot().then(() => scramble(nameEl));
})();
