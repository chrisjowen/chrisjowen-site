// Renders the page to HTML. scripts/build.mjs calls render() with the built asset URLs.
import { LOGOS, REPOS, SITE, SKILLS } from './content.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A fact still to come from Chris: invisible on the page, findable in the source. */
const todo = (what) => `<!-- TODO(chris): ${what} -->`;

const SQUIGGLE = `<svg class="squiggle" width="74" height="10" viewBox="0 0 74 10" fill="none" aria-hidden="true"><path d="M1 7.5 5.5 2.5 10 7.5 14.5 2.5 19 7.5 23.5 2.5 28 7.5 32.5 2.5 37 7.5 41.5 2.5 46 7.5 50.5 2.5 55 7.5 59.5 2.5 64 7.5 68.5 2.5 73 7.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const ico = (name) => `<span class="ico i-${name}" aria-hidden="true"></span>`;

function logos(asset) {
	return LOGOS.map((l) => {
		if (l.wordmark) return `<span class="logo-item" title="${esc(l.name)}"><span class="wordmark">${esc(l.wordmark)}</span></span>`;
		const cls = l.colour === 'badge' ? ['badge'] : l.colour.map((c) => `c-${c}`);
		return `<span class="logo-item ${cls.join(' ')} logo-${l.key}" title="${esc(l.name)}"><img src="${asset(`logos/${l.file}`)}" alt="${esc(l.name)}" height="${l.h}" decoding="async"></span>`;
	}).join('\n      ');
}

function skills() {
	return SKILLS.map(
		(g) => `<div>
      <h4>${esc(g.group)}</h4>
      <div class="skills">
        ${g.items.map((s) => (Array.isArray(s) ? `<span class="skill">${ico(s[1])}${esc(s[0])}</span>` : `<span class="skill plain">${esc(s)}</span>`)).join('\n        ')}
      </div>
    </div>`
	).join('\n    ');
}

function repos() {
	return REPOS.map((r) => {
		const lang = r.lang ? `<span class="lang lang-${r.lang.replace(/[^a-z]/gi, '').toLowerCase()}">${esc(r.lang)}</span>` : '';
		return `<a class="repo" href="${r.url}"><b>${esc(r.name)}</b><span class="d">${esc(r.text)}</span><span class="m">${lang}<span>${esc(r.meta)}</span></span></a>`;
	}).join('\n    ');
}

/** A screenshot as a responsive <img>. */
function shot(p, alt, sizes, cls = '') {
	return `<img${cls ? ` class="${cls}"` : ''} src="${p.src}" srcset="${p.srcset}" sizes="${sizes}" width="${p.width}" height="${p.height}" loading="lazy" decoding="async" alt="${esc(alt)}">`;
}

export function render({ asset, pic, css, js, og, themeScript, csp, year }) {
	const WIDE = '(max-width: 880px) calc(100vw - 40px), 840px';
	const HALF = '(max-width: 760px) calc(100vw - 40px), 410px';
	const person = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: SITE.name,
		url: `${SITE.url}/`,
		jobTitle: 'Software architect',
		worksFor: { '@type': 'Organization', name: 'GIC' },
		address: { '@type': 'PostalAddress', addressLocality: 'Singapore' },
		sameAs: [SITE.linkedin, SITE.github, SITE.medium]
	};

	return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<title>${esc(SITE.title)}</title>
<meta name="description" content="${esc(SITE.description)}">
<meta name="author" content="${esc(SITE.name)}">
<link rel="canonical" href="${SITE.url}/">
<meta name="theme-color" content="#080d1a">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(SITE.title)}">
<meta property="og:description" content="${esc(SITE.description)}">
<meta property="og:url" content="${SITE.url}/">
<meta property="og:image" content="${SITE.url}${og.path}">
<meta property="og:image:width" content="${og.width}">
<meta property="og:image:height" content="${og.height}">
<meta property="og:image:alt" content="Chris Owen: AI platforms and agentic engineering">
<meta property="profile:first_name" content="Chris">
<meta property="profile:last_name" content="Owen">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(SITE.title)}">
<meta name="twitter:description" content="${esc(SITE.description)}">
<meta name="twitter:image" content="${SITE.url}${og.path}">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="${asset('font:outfit')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${css}">
<script>${themeScript}</script>
<script type="module" src="${js}"></script>
<script type="application/ld+json">${JSON.stringify(person)}</script>
</head>
<body>
<a class="skip" href="#top">Skip to content</a>

<header class="site-head">
  <a class="logo" href="#top" aria-label="Chris Owen, home"><i>//</i>CO</a>
  <nav class="nav" aria-label="Sections">
    <a href="#writing">Writing</a>
    <a href="#projects">Projects</a>
    <a href="#resume">Resume</a>
    <a href="#contact">Contact</a>
  </nav>
  <div class="icons">
    <a class="icon-btn" href="${SITE.github}" aria-label="GitHub">${ico('github')}</a>
    <a class="icon-btn" href="${SITE.linkedin}" aria-label="LinkedIn">${ico('linkedin')}</a>
    <button class="icon-btn" id="theme" type="button" aria-label="Toggle light and dark theme">
      <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.5a9.5 9.5 0 0 1 0 19z" fill="currentColor"/></svg>
    </button>
  </div>
</header>

<main id="top" class="container">

<!-- ============ HERO ============ -->
<section class="hero">
  <h1>Hey, I'm <span class="accent">Chris Owen</span>!</h1>
  <p class="lede">A software architect in Singapore. I work in the AI platform team at <a class="u" href="https://www.linkedin.com/company/gic">GIC</a>, helping scale and build business-focused AI agents.</p>
  <p>Before that I led GIC's internal developer platform team and started an internal community for AI-driven development. Over more than 15 years I've designed systems and helped engineering teams change how they work, at ThoughtWorks, Standard Chartered, Citi and others. Outside work I build open-source tools for crews of AI coding agents, and <a class="u" href="#writing">write</a> about what those agents need from the teams that use them.</p>
  ${SQUIGGLE}

  <div class="hero-meta">
    <div>
      <p class="label">Now</p>
      <ul class="now">
        <li>Scaling business-focused AI agents on Temporal, AgentCore and Databricks at GIC</li>
        <li>Building <a class="u" href="#projects">Wheelhouse</a>, <a class="u" href="#projects">docket</a> and <a class="u" href="#projects">improve</a></li>
        <li>Writing on agent memory, skills and process</li>
      </ul>
    </div>
    <div>
      <p class="label">Find me on</p>
      <div class="find">
        <a href="${SITE.linkedin}">${ico('linkedin')}LinkedIn</a>
        <a href="${SITE.github}">${ico('github')}GitHub</a>
        <a href="${SITE.medium}">${ico('medium')}Medium</a>
      </div>
    </div>
  </div>

  <div class="worked">
    <p class="cap">Worked at and with</p>
    ${todo('Uncharted: an official logo, to replace the text wordmark')}
    <div class="logos">
      ${logos(asset)}
    </div>
  </div>
</section>

<!-- ============ WRITING ============ -->
<section id="writing">
  <h2>Writing</h2>
  <p class="intro">Notes from building with AI agents: how they remember, how their skills should be built and tested, and why teams need clearer process once agents join them.</p>
  ${SQUIGGLE}

  <div class="features">
    <a class="feature lead" href="https://www.linkedin.com/pulse/agent-memory-really-knowledge-system-christopher-owen-v1ybc">
      <span class="kind">Article · Sep 2026</span>
      <h3>“Agent memory” is really a knowledge system</h3>
      <p>If an agent retrieves the wrong document perfectly, does it have good memory? A vector database is an index, not memory. Agents need working, semantic and episodic memory kept apart, much as people do.</p>
      <span class="more">Read on LinkedIn →</span>
    </a>
    <a class="feature" href="https://www.linkedin.com/pulse/my-leadership-failure-christopher-owen-b5yrc">
      <span class="kind">Article · Jan 2026</span>
      <h3>My leadership failure</h3>
      <p>Good engineers can compensate for loose structure; AI agents cannot. Why explicit workflows and an unambiguous definition of done matter more once agents join the team.</p>
      <span class="more">Read on LinkedIn →</span>
    </a>
    <a class="feature" href="https://www.linkedin.com/pulse/wheelhouse-giving-firstmates-ai-coding-crew-mission-control-owen-nebic">
      <span class="kind">Article · Oct 2026</span>
      <h3>Wheelhouse: mission control for an AI coding crew</h3>
      <p>Running a crew of coding agents turns a developer into a small engineering team. Seeing what that team is doing is the next problem.</p>
      <span class="more">Read on LinkedIn →</span>
    </a>
    <a class="feature" href="https://www.linkedin.com/posts/christopher-owen-70768013_self-optimising-agent-skills-recently-i-activity-7473036967849422850-Sutt">
      <span class="kind">Post · Jun 2026</span>
      <h3>Self-optimising agent skills</h3>
      <p>LLMs propose the changes, evals decide whether behaviour improved, humans review the diff. A skill becomes a small, testable package.</p>
      <span class="more">Read on LinkedIn →</span>
    </a>
  </div>

  <h3 class="sub">More notes</h3>
  <p>Shorter posts and earlier writing.</p>
  <ul class="posts">
    <li><time datetime="2026-06-18">Jun 2026</time><div><a href="https://www.linkedin.com/posts/christopher-owen-70768013_is-grep-enough-probably-ive-been-activity-7473326313513078784-Plm-">Is grep enough? Probably.</a><p>Graph-indexed code retrieval against plain grep on three real questions. Grep won on quality, speed and tokens; graphs may suit ranking and blast radius better.</p></div></li>
    <li><time datetime="2026-06-18">Jun 2026</time><div><a href="https://www.linkedin.com/posts/christopher-owen-70768013_not-all-skills-are-equal-using-a-hammer-activity-7473186028334391296-Rl8n">Not all skills are equal</a><p>Agent skills should be small, composable primitives with versions and dependencies. They need a package manager.</p></div></li>
  </ul>
  <ul class="posts small">
    <li><time datetime="2017-05-31">May 2017</time><div><a href="https://medium.com/@cowen/annotations-in-elixir-450015ecdd97">Annotations in Elixir</a><div class="src">Medium</div></div></li>
    <li><time datetime="2010-10-02">Oct 2010</time><div><a href="https://enginechris.wordpress.com/2010/10/02/instant-test-cycle-in-the-net-world/">Instant test cycle in the .NET world</a><div class="src">Blog</div></div></li>
    <li><time datetime="2009-11-23">Nov 2009</time><div><a href="https://enginechris.wordpress.com/2009/11/23/my-thoughts-on-using-dotless-and-the-less-syntax/">My thoughts on using DotLess and the Less syntax</a><div class="src">Blog</div></div></li>
  </ul>
  ${todo('Writing: LinkedIn articles older than the three public ones, and which early posts from enginechris.wordpress.com to keep')}
</section>

<!-- ============ PROJECTS ============ -->
<section id="projects">
  <h2>Agentic engineering, hands-on</h2>
  <p class="intro">Three open-source tools for working with a crew of AI coding agents: a place to talk to the crew, a memory it can trust, and a harness that improves only with your approval.</p>
  ${SQUIGGLE}

  <div class="projects">
    <article class="card wide">
      <div class="shot">
        ${shot(pic('wh-home-dark.png'), 'Wheelhouse home in dark mode: the menu, the work under way, and the Firstmate conversation with decisions as cards', WIDE, 'only-dark')}
        ${shot(pic('wh-home.png'), 'Wheelhouse home: the menu, the work under way, and the Firstmate conversation with decisions as cards', WIDE, 'only-light')}
      </div>
      <div class="card-body">
        <h3>Wheelhouse</h3>
        <p class="tagline">Run a crew of AI coding agents without living in their terminals. One calm page on your own machine to talk to <a class="u" href="https://github.com/kunchenguid/firstmate">Firstmate</a>, see what the crew is doing, answer its decisions and review real results.</p>
        <div class="chips"><span class="chip">TypeScript</span><span class="chip">Node.js</span><span class="chip">npm</span><span class="chip">MIT</span></div>
        <code class="cmd">npm install -g @chrisjowen/wheelhouse</code>
        <div class="card-links">
          <a class="pill" href="https://wheelhouse.chrisjowen.net">Full overview →</a>
          <a class="u" href="https://github.com/chrisjowen/wheelhouse">GitHub</a>
          <a class="u" href="https://www.linkedin.com/pulse/wheelhouse-giving-firstmates-ai-coding-crew-mission-control-owen-nebic">Launch article</a>
        </div>
      </div>
    </article>

    <article class="card">
      <div class="shot">${shot(pic('docket-open.png'), "docket open: the browse graph of an example case file, with an item's confidence, sources and evidence in the inspector", HALF)}</div>
      <div class="card-body">
        <h3>docket</h3>
        <p class="tagline">Local-first team memory for software repositories, for people and agents alike.</p>
        <ul>
          <li>Every fact cites where it was seen: file, lines, URL or conversation.</li>
          <li>Confidence is weighed from the evidence, never typed by hand.</li>
          <li>A Claude Code plugin reads the record first and adds to it as it works.</li>
        </ul>
        <div class="chips"><span class="chip">TypeScript</span><span class="chip">Claude Code plugin</span></div>
        <code class="cmd">npx @chrisjowen/docket setup</code>
        <div class="card-links">
          <a class="u" href="https://github.com/chrisjowen/docket">GitHub</a>
          <a class="u" href="https://www.linkedin.com/pulse/agent-memory-really-knowledge-system-christopher-owen-v1ybc">The idea behind it</a>
        </div>
      </div>
    </article>

    <article class="card">
      <div class="shot">${shot(pic('improve-overview.webp'), 'The improve overview: proposals waiting for review and why a harness review is due', HALF)}</div>
      <div class="card-body">
        <h3>improve</h3>
        <p class="tagline">Make Claude Code better at working in your repository, one approved change at a time.</p>
        <ul>
          <li>Notices repeated corrections, failing tools and untested work.</li>
          <li>Proposes small, evidenced fixes to <code>CLAUDE.md</code>, skills, hooks and settings.</li>
          <li>Nothing changes until you approve it, and every change can be rolled back.</li>
        </ul>
        <div class="chips"><span class="chip">JavaScript</span><span class="chip">Claude Code plugin</span></div>
        <code class="cmd">/plugin marketplace add chrisjowen/improve</code>
        <div class="card-links">
          <a class="u" href="https://github.com/chrisjowen/improve">GitHub</a>
        </div>
      </div>
    </article>
  </div>

  <h3 class="sub">More open source</h3>
  <p>Seventeen years of public code, from .NET and Scala through Elixir to today's agent tooling.</p>
  <div class="repos">
    ${repos()}
  </div>
  <p class="all-repos"><a class="u" href="${SITE.github}?tab=repositories">All public repositories on GitHub</a></p>
</section>

<!-- ============ RESUME ============ -->
<section id="resume">
  <h2>Resume</h2>
  <p class="intro">More than 15 years across consultancies, banks, media and insurtech: architecture, DevOps and coaching teams through change. At GIC that led from an internal developer platform and a community for AI-driven development to business-focused agents on the AI platform.</p>
  ${SQUIGGLE}

  <h3 class="sub first">Work history</h3>
  <p>Roles since 2009. <a class="u" href="${SITE.linkedin}">Full profile on LinkedIn</a></p>
  ${todo('Work history: whether to add roles before 2009')}
  <ol class="timeline">
    <li class="current">
      <div class="role">AI Platform team</div>
      ${todo('GIC, AI Platform team: role title and start date')}
      <div class="where"><a class="u" href="https://www.linkedin.com/company/gic">GIC</a><span class="dot"></span><span>🇸🇬 Singapore</span></div>
      <div class="when">Present</div>
      <ul>
        <li>Helping scale and build business-focused AI agents running on <b>Temporal</b>, <b>AgentCore</b> and <b>Databricks</b>.</li>
      </ul>
    </li>
    <li>
      <div class="role">Lead, Internal Developer Platform</div>
      ${todo('GIC, Internal Developer Platform lead: dates')}
      <div class="where"><a class="u" href="https://www.linkedin.com/company/gic">GIC</a><span class="dot"></span><span>🇸🇬 Singapore</span></div>
      <ul>
        <li>Led the team building GIC's internal developer platform: tooling, guides, automation and software blueprints.</li>
        <li>Started an internal community for AI-driven development.</li>
        <li>Spearheaded innersource libraries.</li>
        <li>Created projects to build internal CLIs, harness plugins and SDLC tooling for AI agents.</li>
      </ul>
    </li>
    <li>
      <div class="role">VP of Engineering, Embedded Team Coach</div>
      <div class="where"><span>Citi</span><span class="dot"></span><span>🇸🇬 Singapore</span></div>
      <div class="when">Mar 2022 – Jun 2023</div>
      <ul>
        <li>Part of Engineering Excellence, helping several teams modernise their technology stack and ways of working.</li>
        <li>Instructor-led workshops, hands-on coaching, architecture reviews and embedded mentoring.</li>
        <li>Supported transformation at every level, from technical leaders to business operations and developers.</li>
      </ul>
    </li>
    <li>
      <div class="role">Software Architect</div>
      <div class="where"><span>Uncharted</span><span class="dot"></span><span>🇸🇬 Singapore</span></div>
      <div class="when">May 2020 – Jan 2022</div>
      <ul>
        <li>Senior architect shaping a cloud-native, microservices, multi-tenant core insurance platform for a global insurtech.</li>
        <li>Guided delivery of the core product engine that powered the platform.</li>
        <li>Helped build the team, recruiting and mentoring new joiners.</li>
      </ul>
    </li>
    <li>
      <div class="role">DevOps Evangelist</div>
      <div class="where"><span>Standard Chartered Bank</span><span class="dot"></span><span>🇸🇬 Singapore</span></div>
      <div class="when">Sep 2017 – May 2020</div>
      <ul>
        <li>Spearheaded a two-year programme helping 30+ teams meet bank standards for Agile, DevOps and automated testing.</li>
        <li>Initiated and championed a centralised traceability platform, standard training and release audit tooling.</li>
      </ul>
    </li>
    <li>
      <div class="role">Managing Director, independent consultant</div>
      <div class="where"><span>Software Monkeys</span><span class="dot"></span><span>🇬🇧 United Kingdom</span></div>
      <div class="when">May 2011 – Sep 2017</div>
      <ul>
        <li><b>Sky</b>: internal consultant in a team of technical leaders, moving teams to a cloud-native, microservice architecture.</li>
        <li><b>Guardian News &amp; Media</b>: full-stack development on the Membership and Subscriptions platforms, mostly in Scala.</li>
        <li><b>McKinsey &amp; Co</b>: led architectural delivery of a new-to-bank account registration process for a foreign national bank.</li>
        <li><b>Equal Experts</b>: engagements for multiple clients across Europe, from delivery to onboarding and presales.</li>
        <li><b>Sensis</b>, Australia: senior developer on the core search team, rewriting the search API in Scala.</li>
      </ul>
    </li>
    <li>
      <div class="role">Consultant</div>
      <div class="where"><span>ThoughtWorks</span><span class="dot"></span><span>🇬🇧 United Kingdom</span></div>
      <div class="when">Dec 2009 – May 2011</div>
      <ul>
        <li>Delivery projects, and agile coach for several on-site developers.</li>
      </ul>
    </li>
  </ol>

  <h3 class="sub">Skills</h3>
  <p>From my CV, current work, public repositories and certifications.</p>
  <div class="skill-groups">
    ${skills()}
  </div>

  <h3 class="sub">Background</h3>
  <p>Education, certifications and the sectors I've worked in.</p>
  ${todo('Shane Auckland recommendation: confirm it may be quoted, then add it back as a fourth box')}
  <div class="boxes">
    <div class="box">
      <h4>Education</h4>
      <p><b>BSc Internet Computing, 2:1</b></p>
      <p>University of Hull, UK</p>
      ${todo('University of Hull: years')}
    </div>
    <div class="box">
      <h4>Sectors</h4>
      <p><b>Consultancies</b> – ThoughtWorks, McKinsey, Equal Experts</p>
      <p><b>Banks</b> – Standard Chartered, Citi, National Bank of Greece</p>
      <p><b>Media and telco</b> – Sky, Guardian, O2</p>
      <p><b>Insurtech and startups</b> – Uncharted and others</p>
    </div>
    <div class="box full">
      <h4>Certifications</h4>
      <p><b>Advanced Kubernetes: 1 Core Concepts</b> – LinkedIn, 2023</p>
      <p><b>Build a Blockchain and a Cryptocurrency from Scratch</b> – Udemy, 2021</p>
      <p><b>Advanced Kubernetes Workshop</b> – Learnk8s, 2019</p>
    </div>
  </div>
</section>

<!-- ============ CONTACT ============ -->
<section id="contact" class="contact">
  <h2>Get in touch</h2>
  <p class="intro">Want to talk about AI platforms, agentic engineering or one of the projects?</p>
  ${SQUIGGLE}
  <p>The best way to reach me is on <a class="u" href="${SITE.linkedin}">LinkedIn</a>.</p>
  <p>For the projects, open an issue on <a class="u" href="${SITE.github}">GitHub</a>.</p>
  ${todo('Contact email: which address to show, if any')}
</section>

</main>

<footer class="site-foot">
  <span>© ${year} Chris Owen</span>
  <span class="right"><a href="${SITE.linkedin}">LinkedIn</a><a href="${SITE.github}">GitHub</a><a href="${SITE.medium}">Medium</a></span>
</footer>
</body>
</html>
`;
}

/** The page nginx serves for anything that is not here. */
export function renderNotFound({ css, csp, themeScript }) {
	return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="robots" content="noindex">
<title>Not found · ${esc(SITE.name)}</title>
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${css}">
<script>${themeScript}</script>
</head>
<body>
<header class="site-head">
  <a class="logo" href="/" aria-label="Chris Owen, home"><i>//</i>CO</a>
</header>
<main class="container">
<section class="hero">
  <h1>Nothing <span class="accent">here</span>.</h1>
  <p class="lede">That page does not exist. <a class="u" href="/">Back to the start</a></p>
  ${SQUIGGLE}
</section>
</main>
</body>
</html>
`;
}
