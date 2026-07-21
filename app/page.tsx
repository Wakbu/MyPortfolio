const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const projects = [
  {
    number: "01",
    period: "2026.06.01 — 06.22",
    title: "해킹 방어와 관제 시스템 구축",
    role: "보안 관제 설계 · 자동화 / 기여도 50%",
    summary: "취약한 웹 서비스와 서버 인프라를 대상으로 공격 탐지, 차단, 로그 수집, 대시보드, 장애 대응 자동화까지 하나의 관제 흐름으로 연결했습니다.",
    results: [
      "Wazuh 보안 이벤트와 Prometheus 서버 지표를 Grafana에 시각화",
      "Suricata·iptables로 공격 트래픽 탐지 및 차단 흐름 검증",
      "상태 점검 Shell Script와 Discord Webhook으로 장애 대응 자동화",
    ],
    stack: ["Wazuh", "Grafana", "Prometheus", "Suricata", "GoAccess", "Shell"],
    href: "https://app.notion.com/p/6d2a1ad5169d822ea62f81d89fcd9e6b",
    featured: true,
  },
  {
    number: "02",
    period: "2026.04.07 — 04.22",
    title: "네트워크와 Linux 서버 구축",
    role: "팀장 · 네트워크 설계 · 문서화",
    summary: "기업형 인프라를 가정해 네트워크 토폴로지와 Linux 서버를 구성하고, VPN·ACL·DB 권한 등 기본 보안 정책을 함께 검토했습니다.",
    results: [
      "GNS3 기반 네트워크 토폴로지와 서버 간 통신 흐름 설계",
      "Linux 서버 구축 과정과 설정 기준을 팀 단위 문서로 표준화",
      "VPN·ACL·최소 권한 관점의 관리 접근 구조 검토",
    ],
    stack: ["GNS3", "Linux", "Routing", "VPN", "ACL", "Notion"],
    href: "https://app.notion.com/p/2aaa1ad5169d823cbc4781b854563690",
    featured: false,
  },
];

const capabilities = [
  { index: "01", title: "Security Monitoring", copy: "Wazuh, Grafana, Prometheus를 연동해 보안 이벤트와 서비스 상태를 함께 관찰합니다." },
  { index: "02", title: "Network & Linux", copy: "GNS3·Packet Tracer 기반 네트워크 구성과 Linux 서버 운영 흐름을 이해합니다." },
  { index: "03", title: "Attack Analysis", copy: "Wireshark, Suricata, iptables를 활용해 패킷과 로그에서 공격 징후를 확인합니다." },
  { index: "04", title: "Automation", copy: "Shell Script, cron, Webhook으로 반복 점검·알림·보고 과정을 자동화합니다." },
];

export default function Home() {
  return (
    <main>
      <div className="shell">
        <nav className="nav" aria-label="주요 메뉴">
          <a className="brand" href="#top" aria-label="최준용 포트폴리오 홈">JUNYONG CHOI<span aria-hidden="true" /></a>
          <div className="navLinks">
            <a href="#projects">Projects</a><a href="#evidence">Evidence</a><a href="#awards">Awards</a><a href="#background">Background</a>
            <span className="status">Security Infrastructure</span>
          </div>
        </nav>

        <section className="hero" id="top" aria-labelledby="headline">
          <div className="heroTitle">
            <p className="eyebrow">Security Infrastructure Engineer · Seoul</p>
            <h1 id="headline">공격을 탐지하고,<br /><em>운영이 멈추지 않게.</em></h1>
          </div>
          <div className="intro">
            <p>로그가 생성되는 지점부터 탐지, 분석, 알림, 대응까지 이어지는 흐름을 설계합니다. 문제를 직접 확인하고 기록하며 더 안정적인 운영 방식으로 개선합니다.</p>
            <a className="cta" href="#projects">프로젝트 살펴보기 <span aria-hidden="true">↘</span></a>
          </div>
        </section>

        <section className="signalBar" aria-label="포트폴리오 주요 정보">
          <div><strong>02</strong><span>Security Projects</span></div>
          <div><strong>736H</strong><span>Infrastructure Training</span></div>
          <div><strong>02</strong><span>Technical Certificates</span></div>
          <p>탐지와 대응을 도구별 작업이 아닌 하나의 운영 흐름으로 바라봅니다.</p>
        </section>

        <section className="projects section" id="projects" aria-labelledby="projectTitle">
          <header className="sectionHead"><div><p className="kicker">Selected Work</p><h2 id="projectTitle">직접 구축하고<br />검증한 보안 인프라</h2></div><span>2026 / 02 Projects</span></header>
          <div className="projectGrid">
            {projects.map((project) => (
              <article className={`projectCard ${project.featured ? "projectCard--featured" : ""}`} key={project.number}>
                <div className="projectTop"><span>{project.number} / CASE STUDY</span><span>{project.period}</span></div>
                <div className="projectBody">
                  <p className="projectRole">{project.role}</p>
                  <h3>{project.title}</h3>
                  <p className="projectSummary">{project.summary}</p>
                  <ul>{project.results.map((result) => <li key={result}>{result}</li>)}</ul>
                </div>
                <div className="projectBottom">
                  <div className="tags">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
                  <a href={project.href} target="_blank" rel="noreferrer" aria-label={`${project.title} 노션 상세 페이지 열기`}>Case study ↗</a>
                </div>
              </article>
            ))}
          </div>
        </section>


        <section className="evidenceSection" id="evidence" aria-labelledby="evidenceTitle">
          <header className="sectionHead"><div><p className="kicker">Project Evidence</p><h2 id="evidenceTitle">설계와 구축을 보여주는<br />실제 프로젝트 기록</h2></div><span>04 VISUALS / PPT SOURCE</span></header>
          <div className="evidenceList">
            <article className="evidenceProject"><div className="evidenceMeta"><span>01 / SHIELDERS</span><span>NETWORK · LINUX · LOG</span></div><div className="evidenceCopy"><p className="projectRole">팀장 · 네트워크 설계 · 문서화</p><h3>기업형 네트워크와 중앙 로그 환경</h3><p>VLAN 부서망, VPN·ACL, WEB·DB·DNS 서버와 rsyslog·LogAnalyzer의 연결 구조를 실제 발표 자료로 확인할 수 있습니다.</p></div><div className="evidenceGallery"><figure><img src={`${basePath}/evidence/shielders-topology.png`} alt="Shielders 전체 네트워크 구성도" loading="lazy" /><figcaption>01 — 전체 네트워크 구성도</figcaption></figure><figure><img src={`${basePath}/evidence/shielders-monitoring.png`} alt="Shielders 로그 모니터링 구성도" loading="lazy" /><figcaption>02 — 중앙 로그 모니터링 구성</figcaption></figure></div><a className="notionCaseLink" href="https://app.notion.com/p/2aaa1ad5169d823cbc4781b854563690" target="_blank" rel="noreferrer">Notion에서 상세 과정 보기 ↗</a></article>
            <article className="evidenceProject"><div className="evidenceMeta"><span>02 / NEXTBANK</span><span>SOC · SIEM · AUTOMATION</span></div><div className="evidenceCopy"><p className="projectRole">보안 관제센터(ELK) · 기여도 50%</p><h3>4계층 방어와 통합 보안 관제</h3><p>External·DMZ·Internal·SOC 구조와 Wazuh·Grafana·Discord로 이어지는 탐지·시각화·알림 결과를 실제 화면으로 제시합니다.</p></div><div className="evidenceGallery"><figure><img src={`${basePath}/evidence/nextbank-architecture.png`} alt="NextBank 4계층 보안 아키텍처" loading="lazy" /><figcaption>01 — 4계층 보안 아키텍처</figcaption></figure><figure><img src={`${basePath}/evidence/nextbank-soc.png`} alt="NextBank 통합 관제 결과" loading="lazy" /><figcaption>02 — 통합 관제와 실시간 알림</figcaption></figure></div><a className="notionCaseLink" href="https://app.notion.com/p/6d2a1ad5169d822ea62f81d89fcd9e6b" target="_blank" rel="noreferrer">Notion에서 상세 과정 보기 ↗</a></article>
          </div>
        </section>
        <section className="capabilities section" id="capabilities" aria-labelledby="capabilityTitle">
          <header className="sectionHead compact"><div><p className="kicker">Capabilities</p><h2 id="capabilityTitle">도구보다 흐름을 이해하는 역량</h2></div></header>
          <div className="capabilityGrid">
            {capabilities.map((item) => <article key={item.index}><span>{item.index}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}
          </div>
        </section>

        <section className="problem section" aria-labelledby="problemTitle">
          <div className="problemIntro"><p className="kicker">How I Work</p><h2 id="problemTitle">문제를 그냥 넘기지 않고,<br />로그와 설정에서 원인을 찾습니다.</h2></div>
          <div className="problemCases">
            <article><span>LOG PIPELINE</span><h3>수집되지 않는 웹 로그</h3><p>실제 Apache 로그 경로와 파일명을 확인해 Wazuh Agent 설정을 수정하고 수집 흐름을 정상화했습니다.</p></article>
            <article><span>TRAFFIC CONTROL</span><h3>탐지와 차단 순서 충돌</h3><p>iptables 룰 순서와 NFQUEUE 전달 구조를 점검해 Suricata 탐지와 차단 흐름을 분리해 검증했습니다.</p></article>
            <article><span>OPERATIONS</span><h3>알림에서 대응까지</h3><p>장애 유형만 알리지 않고 확인 명령어까지 Discord에 전달해 초기 대응 시간을 줄이는 구조로 개선했습니다.</p></article>
          </div>
        </section>


        <section className="awardsSection" id="awards" aria-labelledby="awardsTitle">
          <header className="sectionHead"><div><p className="kicker">Recognition</p><h2 id="awardsTitle">교육 과정에서 증명한<br />실전 문제 해결 역량</h2></div><span>2026 / 02 AWARDS</span></header>
          <div className="awardGrid"><article><div className="awardImage"><img src={`${basePath}/evidence/award-ctf-second.png`} alt="인프라 10기 CTF 대회 2등 상장" loading="lazy" /></div><p>01 / CTF COMPETITION</p><h3>CTF 대회 2등</h3></article><article><div className="awardImage"><img src={`${basePath}/evidence/award-wargame-third.png`} alt="인프라 10기 워게임 3등 상장" loading="lazy" /></div><p>02 / WARGAME</p><h3>워게임 3등</h3></article></div>
        </section>
        <section className="background section" id="background" aria-labelledby="backgroundTitle">
          <header className="sectionHead compact"><div><p className="kicker">Background</p><h2 id="backgroundTitle">배움의 기반</h2></div></header>
          <div className="backgroundGrid">
            <div className="timeline">
              <article><span>2026.03 — PRESENT</span><h3>이스트캠프 가디언즈</h3><p>정보보호 및 보안 인프라 운영 관리 · 네트워크, Linux, 보안 관제 실무 교육</p></article>
              <article><span>2024.03 — 2026.02</span><h3>성공회대학교</h3><p>컴퓨터공학 · 소프트웨어공학 복수전공</p></article>
            </div>
            <div className="certs">
              <p className="kicker">Certificates</p>
              <div><strong>정보처리기사</strong><span>2025</span></div>
              <div><strong>네트워크관리사 2급</strong><span>2023</span></div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div><p className="kicker">Next Step</p><h2>안정적인 운영을 만드는<br /><em>보안 엔지니어로.</em></h2></div>
          <div className="footerLinks"><p>프로젝트의 자세한 구축 과정과 문제 해결 기록은 Notion에서 확인할 수 있습니다.</p><a href="https://app.notion.com/p/2f2a1ad5169d832a9a7f818d8c8a8119" target="_blank" rel="noreferrer">Notion portfolio ↗</a></div>
          <p className="copyright">© 2026 JUNYONG CHOI · SECURITY INFRASTRUCTURE PORTFOLIO</p>
        </footer>
      </div>
    </main>
  );
}
