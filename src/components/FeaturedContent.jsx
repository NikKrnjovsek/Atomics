import './FeaturedContent.css'

function Section({ title, children }) {
  return (
    <section className="featured__section">
      <h3 className="featured__heading">{title}</h3>
      {children}
    </section>
  )
}

// Opisna vsebina ključne snovi iz featured.json (uporabljata jo velik infoboks in dnevnik).
// stacked – en stolpec namesto dveh (za ozek prostor v dnevniku).
function FeaturedContent({ featured, stacked = false }) {
  const { image, process, cycle } = featured

  return (
    <div className={`featured-content ${stacked ? 'featured-content--stacked' : ''}`}>
      <div className="featured__main">
        <p className="featured__intro">{featured.intro}</p>

        {featured.sections.map((section) => (
          <Section key={section.title} title={section.title}>
            <p className="featured__text">{section.text}</p>
          </Section>
        ))}

        <Section title={process.title}>
          <ol className="featured__steps">
            {process.steps.map((step, i) => (
              <li key={step.title} className="featured__step">
                <span className="featured__step-number">{i + 1}</span>
                <div>
                  <h4 className="featured__step-title">{step.title}</h4>
                  <p className="featured__text">{step.text}</p>
                  {step.equation && <p className="featured__equation">{step.equation}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {cycle && (
          <Section title={cycle.title}>
            <ol className="featured__cycle">
              {cycle.steps.map((step) => (
                <li key={step}>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}
      </div>

      <aside className="featured__side">
        <figure className="featured__figure">
          <img src={image.src} alt={image.alt} />
          <figcaption>{image.caption}</figcaption>
        </figure>

        <Section title="V številkah">
          <dl className="featured__facts">
            {featured.facts.map((fact) => (
              <div key={fact.label} className="featured__fact">
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {featured.didYouKnow && (
          <div className="featured__trivia">
            <h3 className="featured__heading">Ali si vedel?</h3>
            <ul>
              {featured.didYouKnow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <Section title="Viri">
          <ul className="featured__sources">
            {featured.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="featured__license">
            Besedilo in slika: e-učbenik Kemija 8 (eucbeniki.sio.si), licenca CC BY-NC-SA 2.5 SI.
          </p>
        </Section>
      </aside>
    </div>
  )
}

export default FeaturedContent
