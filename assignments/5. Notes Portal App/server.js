import express from 'express'
import cors from 'cors'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app=express();
const filesDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "files");
const documents = [
    { name: "Full-Stack Development", file: "FSD-Node-Draft.txt", category: "Foundations", summary: "How the browser, server, and data layer work together", accent: "coral" },
    { name: "HTML & CSS", file: "HTML-CSS-Draft.txt", category: "Web", summary: "Semantic structure, responsive layouts, and styling", accent: "gold" },
    { name: "JavaScript", file: "JavaScript-Draft.txt", category: "Programming", summary: "Core syntax, functions, arrays, and async code", accent: "blue" },
    { name: "Node.js", file: "Node-Notes-Draft.txt", category: "Backend", summary: "Runtime, modules, and non-blocking I/O", accent: "green" },
    { name: "Express", file: "Express-Notes-Draft.txt", category: "Backend", summary: "HTTP routes, middleware, and static resources", accent: "coral" },
    { name: "React", file: "React-Notes-Draft.txt", category: "Frontend", summary: "Components, props, state, and rendering", accent: "blue" },
    { name: "MongoDB", file: "MongoDB-Draft.txt", category: "Database", summary: "Collections, documents, and CRUD operations", accent: "gold" },
    { name: "Draft Notes", file: "Draft-Notes.txt", category: "Reference", summary: "A compact full-stack refresher", accent: "green" },
];

app.use(cors());

app.get("/", (_req, res) => {
    const categoryCounts = new Map();
    for (const document of documents) {
        categoryCounts.set(document.category, (categoryCounts.get(document.category) || 0) + 1);
    }

    const filters = [
        `<button class="filter is-active" type="button" data-category-filter="all" aria-pressed="true"><span>All subjects</span><span class="filter-count">${documents.length}</span></button>`,
        ...[...categoryCounts].map(([category, count]) => `<button class="filter" type="button" data-category-filter="${category}" aria-pressed="false"><span>${category}</span><span class="filter-count">${count}</span></button>`),
    ].join("");

    const noteRows = documents.map(({ name, file, category, summary, accent }, index) => {
        const available = existsSync(path.join(filesDirectory, file));
        const action = available
            ? `<a class="download" href="/download/${encodeURIComponent(file)}" aria-label="Download ${name} draft"><span>Download</span><span aria-hidden="true">&#8595;</span></a>`
            : `<span class="missing">Draft missing</span>`;

        return `<article class="note-row" data-category="${category}" data-search="${`${name} ${file} ${category} ${summary}`.toLowerCase()}">
            <span class="note-number">${String(index + 1).padStart(2, "0")}</span>
            <span class="subject-mark ${accent}" aria-hidden="true">${name.slice(0, 1)}</span>
            <div class="note-info"><h2>${name}</h2><p>${summary}</p></div>
            <span class="note-category ${accent}">${category}</span>
            <span class="note-format">TXT / DRAFT</span>
            ${action}
        </article>`;
    }).join("");

    res.send(`<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#f1f4ee">
    <title>Notes Portal - Study Library</title>
    <style>
        :root { color-scheme: light; font-family: "Trebuchet MS", sans-serif; color: #19251f; background: #f1f4ee; font-synthesis: none; }
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; background: linear-gradient(125deg, #f3f5ee 0%, #edf4f0 58%, #f5f1e9 100%); }
        button, input { font: inherit; }
        .shell { display: grid; grid-template-columns: 250px minmax(0, 1fr); min-height: 100vh; }
        .sidebar { display: flex; flex-direction: column; padding: 28px 20px 22px; background: #1c3028; color: #f5f5e9; }
        .brand { display: flex; align-items: center; gap: 12px; margin: 0 0 46px 4px; color: inherit; text-decoration: none; }
        .brand-mark { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 11px 11px 11px 3px; background: #f06a4f; color: #1c3028; font-family: Georgia, serif; font-size: 22px; font-weight: 700; }
        .brand-name { font-size: 12px; font-weight: 700; letter-spacing: 1.1px; }
        .side-label { margin: 0 0 12px 10px; color: #9db3a5; font-size: 10px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; }
        .filters { display: grid; gap: 4px; }
        .filter { display: flex; align-items: center; justify-content: space-between; min-height: 40px; padding: 0 10px; border: 0; border-radius: 5px; background: transparent; color: #d7e1d8; cursor: pointer; text-align: left; }
        .filter:hover { background: #294238; color: #fff; }
        .filter.is-active { background: #f3f5ee; color: #1c3028; font-weight: 700; }
        .filter-count { min-width: 22px; padding: 3px 5px; border-radius: 4px; background: #ffffff17; color: inherit; font-size: 11px; text-align: center; }
        .filter.is-active .filter-count { background: #dce9df; }
        .side-bottom { margin-top: auto; padding: 18px 10px 0; border-top: 1px solid #ffffff20; color: #aebfb3; font-size: 12px; line-height: 1.7; }
        .main { width: min(100% - 88px, 1120px); margin: 0 auto; padding: 46px 0 64px; }
        .topline { display: flex; justify-content: space-between; align-items: center; margin-bottom: 38px; color: #738078; font-size: 11px; font-weight: 700; letter-spacing: 1.1px; text-transform: uppercase; }
        .collection-mark { display: flex; align-items: center; gap: 8px; }
        .collection-mark::before { width: 7px; height: 7px; border-radius: 50%; background: #e87551; content: ""; }
        .term-tag { padding: 7px 9px; border: 1px solid #d2ddd5; border-radius: 4px; color: #43554a; letter-spacing: .4px; }
        .heading-row { display: flex; justify-content: space-between; align-items: end; gap: 22px; margin-bottom: 27px; }
        .eyebrow { margin: 0 0 9px; color: #c25b42; font-size: 11px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; }
        h1 { margin: 0; font-family: Georgia, serif; font-size: 42px; font-weight: 400; letter-spacing: 0; line-height: 1.12; }
        .intro { margin: 10px 0 0; color: #68766e; font-size: 14px; }
        .search { display: flex; align-items: center; gap: 12px; width: min(100%, 460px); min-height: 48px; padding: 0 14px; border: 1px solid #cfdad2; border-radius: 5px; background: #fff; }
        .search-mark { color: #537467; font-size: 18px; }
        .search input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #19251f; font-size: 14px; }
        .search input::placeholder { color: #89948e; }
        .search:focus-within { border-color: #498067; box-shadow: 0 0 0 3px #49806720; }
        .section-heading { display: flex; justify-content: space-between; align-items: baseline; margin: 34px 0 13px; }
        .section-heading h2 { margin: 0; font-family: Georgia, serif; font-size: 22px; font-weight: 400; }
        #count { color: #75827a; font-size: 12px; }
        .list-head, .note-row { display: grid; grid-template-columns: 42px 46px minmax(180px, 1fr) 120px 92px 116px; align-items: center; column-gap: 14px; }
        .list-head { padding: 0 14px 10px; color: #829087; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
        #notes { border-top: 1px solid #d5dfd7; }
        .note-row { min-height: 82px; padding: 12px 14px; border-bottom: 1px solid #d5dfd7; animation: reveal .35s both; animation-delay: calc(var(--row-index) * 35ms); }
        .note-row[hidden] { display: none; }
        .note-number { color: #8b9890; font-family: Georgia, serif; font-size: 13px; }
        .subject-mark { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 10px 10px 10px 3px; font-family: Georgia, serif; font-size: 19px; }
        .subject-mark.coral { background: #f9ddd3; color: #a64632; }
        .subject-mark.gold { background: #f8e9b9; color: #78601d; }
        .subject-mark.blue { background: #d4eaf0; color: #276073; }
        .subject-mark.green { background: #d5ead9; color: #326342; }
        .note-info { min-width: 0; }
        .note-info h2 { overflow-wrap: anywhere; margin: 0 0 5px; font-size: 14px; font-weight: 700; }
        .note-info p { overflow-wrap: anywhere; margin: 0; color: #75827a; font-size: 12px; line-height: 1.4; }
        .note-category { width: fit-content; padding: 5px 7px; border-radius: 3px; font-size: 11px; }
        .note-category.coral { background: #f9e2da; color: #9a4938; }
        .note-category.gold { background: #f7edce; color: #746026; }
        .note-category.blue { background: #dcecf0; color: #315e6c; }
        .note-category.green { background: #dfede1; color: #3c6948; }
        .note-format { color: #8b9890; font-size: 9px; font-weight: 700; letter-spacing: .8px; }
        .download { display: inline-flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 36px; padding: 0 10px; border-radius: 4px; background: #244a3a; color: #fff; font-size: 12px; font-weight: 700; text-decoration: none; }
        .download:hover { background: #d45f45; }
        .download:focus-visible, .filter:focus-visible { outline: 3px solid #ed9a62; outline-offset: 2px; }
        .missing { color: #9b5943; font-size: 11px; }
        #empty { padding: 32px 14px; border-bottom: 1px solid #d5dfd7; color: #68766e; text-align: center; }
        #empty[hidden] { display: none; }
        @keyframes reveal { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 920px) {
            .shell { grid-template-columns: 1fr; }
            .sidebar { display: block; padding: 14px 22px 12px; }
            .brand { margin: 0 0 12px; }
            .side-label, .side-bottom { display: none; }
            .filters { display: flex; gap: 5px; overflow-x: auto; padding-bottom: 2px; }
            .filter { flex: 0 0 auto; min-height: 34px; gap: 12px; white-space: nowrap; }
            .main { width: min(100% - 44px, 760px); padding-top: 32px; }
            .topline { margin-bottom: 28px; }
        }
        @media (max-width: 620px) {
            .main { width: min(100% - 32px, 560px); padding-top: 25px; }
            .topline { margin-bottom: 26px; }
            .heading-row { align-items: stretch; flex-direction: column; gap: 19px; }
            h1 { font-size: 36px; }
            .search { width: 100%; }
            .list-head { display: none; }
            .note-row { grid-template-columns: 25px 40px minmax(0, 1fr) auto; column-gap: 9px; min-height: 76px; padding: 10px 2px; }
            .subject-mark { width: 34px; height: 34px; }
            .note-category, .note-format { display: none; }
            .download { min-height: 34px; gap: 6px; padding: 0 8px; font-size: 11px; }
        }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; } }
    </style>
</head>
<body>
    <div class="shell">
        <aside class="sidebar">
            <a class="brand" href="/" aria-label="Notes Portal home"><span class="brand-mark">N</span><span class="brand-name">NOTES / PORTAL</span></a>
            <p class="side-label">Browse by subject</p>
            <nav class="filters" aria-label="Filter notes by subject">${filters}</nav>
            <div class="side-bottom">SEMESTER 03<br>FULL STACK DEVELOPMENT</div>
        </aside>
        <main class="main">
            <div class="topline"><span class="collection-mark">Personal study library</span><span class="term-tag">FSD / SEM 03</span></div>
            <div class="heading-row">
                <div><p class="eyebrow">The working collection</p><h1>Study notes</h1><p class="intro">A clear desk for the ideas you are building.</p></div>
                <label class="search"><span class="search-mark" aria-hidden="true">&#9906;</span><input id="search" type="search" placeholder="Search subjects or topics..." autocomplete="off" aria-label="Search notes"></label>
            </div>
            <section aria-labelledby="notes-title">
                <div class="section-heading"><h2 id="notes-title">Subject index</h2><span id="count" aria-live="polite"></span></div>
                <div class="list-head" aria-hidden="true"><span>No.</span><span></span><span>Subject / focus</span><span>Area</span><span>Format</span><span></span></div>
                <div id="notes">${noteRows}</div>
                <p id="empty" hidden>No subjects match this search.</p>
            </section>
        </main>
    </div>
    <script>
        const search = document.querySelector("#search");
        const notes = [...document.querySelectorAll(".note-row")];
        const filters = [...document.querySelectorAll("[data-category-filter]")];
        const count = document.querySelector("#count");
        const empty = document.querySelector("#empty");
        let activeCategory = "all";
        function filterNotes() {
            const query = search.value.trim().toLowerCase();
            let visible = 0;
            for (const note of notes) {
                const matchesSearch = note.dataset.search.includes(query);
                const matchesCategory = activeCategory === "all" || note.dataset.category === activeCategory;
                const matches = matchesSearch && matchesCategory;
                note.hidden = !matches;
                if (matches) visible += 1;
            }
            count.textContent = visible + " / " + notes.length + " subjects";
            empty.hidden = visible !== 0;
        }
        for (const filter of filters) {
            filter.addEventListener("click", () => {
                activeCategory = filter.dataset.categoryFilter;
                for (const item of filters) {
                    const isActive = item === filter;
                    item.classList.toggle("is-active", isActive);
                    item.setAttribute("aria-pressed", String(isActive));
                }
                filterNotes();
            });
        }
        search.addEventListener("input", filterNotes);
        notes.forEach((note, index) => note.style.setProperty("--row-index", index));
        filterNotes();
    </script>
</body>
</html>`);
});

app.get("/download/:file", (req, res) => {
    const document = documents.find(({ file }) => file === req.params.file);
    if (!document) return res.sendStatus(404);

    const filePath = path.join(filesDirectory, document.file);
    if (!existsSync(filePath)) return res.sendStatus(404);

    res.download(filePath, document.file);
});

app.use("/files", express.static(filesDirectory));

app.listen(5000, ()=> {
    console.log("Server running on 5000");
})