import { useEffect, useState } from 'react';
import { profile, stats, experience, projects, skills, extras, sections } from './data';
import { useReveal, useTyped, useCountUp, useTheme, useScrollSpy } from './hooks';
import ContactForm from './ContactForm';

function Stat({ n, suffix, label }: (typeof stats)[number]) {
  const [ref, val] = useCountUp(n);
  return (
    <div className="card stat">
      <b ref={ref} data-testid="stat">{val}{suffix}</b>
      <span>{label}</span>
    </div>
  );
}

function Tilt({ children }: { children: React.ReactNode }) {
  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
  };
  return <div className="card rv" data-testid="project" onMouseMove={move} onMouseLeave={(e) => (e.currentTarget.style.transform = '')}>{children}</div>;
}

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const typed = useTyped(profile.roles);
  const [menu, setMenu] = useState(false);
  const active = useScrollSpy(sections.map((s) => s.id));
  useReveal();
  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; }, [menu]);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <div className="blob b1" /><div className="blob b2" />
      <nav>
        <a href="#top" className="logo" aria-label="Home"><b>VK<span style={{ color: 'var(--ac)' }}>.</span></b></a>
        <div className={`l${menu ? ' open' : ''}`} data-testid="nav-links">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'active' : ''} onClick={() => setMenu(false)}>{s.label}</a>
          ))}
        </div>
        <div className="tools">
          <button id="tg" onClick={toggleTheme} aria-label="Toggle theme" data-testid="theme-toggle">{theme === 'dark' ? '☀' : '☾'}</button>
          <button className="burger" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)} data-testid="burger">☰</button>
        </div>
      </nav>
      <main id="main">
        <section className="hero" id="top">
          <div>
            <span className="tag"><i />Open to opportunities · {profile.location}</span>
            <h1>Hi, I’m <span className="gr">{profile.name}</span></h1>
            <div className="role">I build <span data-testid="typed">{typed}</span><em /></div>
            <p className="lead">{profile.lead}</p>
            <div className="cta">
              <a className="btn p" href="#work">View my work</a>
              <a className="btn" href="/resume.pdf" download="Vivekanand_Kurane_Resume.pdf" data-testid="resume">Download résumé</a>
              <a className="btn" href="#contact">Get in touch</a>
            </div>
          </div>
          <div className="ph">
            <img src="/profile.jpg" alt={`Portrait of ${profile.name}`} width={640} height={771} fetchPriority="high" />
            <span className="chip c1">⚡ LangGraph · FastAPI</span><span className="chip c2">🅰️ Angular · Next.js</span>
          </div>
        </section>

        <section id="about" className="rv"><div className="sub">About</div><h2>Full-stack roots, agentic AI focus</h2>
          <p className="muted">{profile.about}</p>
          <div className="stats">{stats.map((s) => <Stat key={s.label} {...s} />)}</div>
        </section>

        <section id="exp"><div className="sub rv">Experience</div><h2 className="rv">Where I’ve worked</h2>
          <div className="tl">
            {experience.map((j) => (
              <div className="card rv" key={j.title + j.period} data-testid="job">
                <div className="hd"><h3>{j.title}</h3><small>{j.period}</small></div>
                <div className="co">{j.company}</div>
                <ul>{j.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section id="work"><div className="sub rv">Projects</div><h2 className="rv">Selected work</h2>
          <div className="grid">
            {projects.map((p) => (
              <Tilt key={p.name}>
                <h3>{p.name}</h3><div className="co">{p.meta}</div>
                <p className="muted" style={{ margin: 0 }}>{p.text}</p>
                {p.tags.map((t) => <span className="pill" key={t}>{t}</span>)}
              </Tilt>
            ))}
          </div>
        </section>

        <section id="skills"><div className="sub rv">Skills</div><h2 className="rv">Toolbox</h2>
          <div className="grid">
            {skills.map((g) => (
              <div className="card sk rv" key={g.group} data-testid="skill-group"><h3>{g.group}</h3>
                {g.items.map((i) => <span className="pill" key={i}>{i}</span>)}
              </div>
            ))}
          </div>
          <div className="grid">
            {extras.map((x) => (
              <div className="card rv" key={x.title}><h3>{x.title}</h3><ul>{x.items.map((i) => <li key={i}>{i}</li>)}</ul></div>
            ))}
          </div>
        </section>

        <section id="contact" className="rv">
          <div className="card ct"><div className="sub">Contact</div><h2>Let’s build something great</h2>
            <p className="muted">Open to conversations about agentic AI, full-stack engineering and new roles.</p>
            <div className="cta" style={{ justifyContent: 'center', marginBottom: 28 }}>
              <a className="btn" href={`mailto:${profile.email}`}>{profile.email}</a>
              <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <footer>© {new Date().getFullYear()} {profile.name} · {profile.location}</footer>
    </>
  );
}
