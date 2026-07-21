type DeckProps = {
  title: string;
  subtitle: string;
  folder: string;
  slides: number[];
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function PresentationDeck({ title, subtitle, folder, slides }: DeckProps) {
  return <main className="presentationPage">
    <nav className="presentationNav"><a href={`${basePath}/#evidence`}>← 포트폴리오로 돌아가기</a><span>{slides.length} SELECTED SLIDES</span></nav>
    <header className="presentationHero"><p className="kicker">Project Presentation</p><h1>{title}</h1><p>{subtitle}</p></header>
    <section className="slideList" aria-label={`${title} 발표자료`}>
      {slides.map((slide, index) => <figure key={slide}><div className="slideFrame"><img src={`${basePath}/presentations/${folder}/slide-${slide}.png`} alt={`${title} 발표자료 ${slide}번 슬라이드`} loading={index < 2 ? "eager" : "lazy"} /></div><figcaption><span>{String(index + 1).padStart(2, "0")}</span><span>ORIGINAL SLIDE {slide}</span></figcaption></figure>)}
    </section>
    <footer className="presentationFooter"><a href={`${basePath}/#evidence`}>프로젝트 목록으로 돌아가기 ↑</a></footer>
  </main>;
}