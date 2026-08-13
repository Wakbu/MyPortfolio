const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const projects = [
  {
    id: "project-tension",
    number: "01",
    name: "TENsion / EstMall",
    period: "2026.07.23 — 08.05",
    title: "공격 재현부터 사고 대응까지, 하나의 보안 운영 흐름으로",
    role: "팀장 · 프로젝트 총괄 · 관제 서버 구축",
    summary: "서비스 경로와 관제 경로를 분리하고 Firewall, IPS, WAF, SIEM을 계층별로 연결했습니다. 실제 웹 공격과 악성코드 분석 결과를 탐지·차단·복구 절차까지 이어서 검증했습니다.",
    outcomes: [
      "Wazuh·Grafana·ML 기반 통합 관제 환경",
      "직접 제작한 CoreWatch-Atlas 서버 모니터링",
      "악성코드 3종 정적·동적 교차 분석 및 IOC 도출",
    ],
    metrics: [
      { value: "10,154", label: "Wazuh 누적 경보" },
      { value: "3,661", label: "ML 분석 이벤트" },
      { value: "1,318", label: "이상 판정" },
    ],
    caseStudy: {
      problem: "WAF 이벤트가 여러 로그로 나뉘어 동일 공격이 중복 집계됨",
      action: "ModSecurity Unique ID 기준으로 관련 로그를 그룹화",
      result: "과대 집계를 줄이고 공격 단위 분석 기준을 명확화",
    },
    artifacts: [
      { label: "SOC 점검 스크립트", href: "/artifacts/tension-soc-health-check.sh" },
      { label: "DB 백업·복원 검증", href: "/artifacts/tension-db-backup-verify.sh" },
    ],
    stack: "Snort / ModSecurity / Wazuh / Grafana / Ghidra / Procmon",
    image: "tension-architecture.png",
    imageAlt: "EstMall 계층형 방어와 관제 경로 구성도",
    slides: "/presentations/tension/",
    notion: "https://app.notion.com/p/3ada1ad5169d80748994c47220648c27",
  },
  {
    id: "project-nextbank",
    number: "02",
    name: "NextBank",
    period: "2026.06.01 — 06.22",
    title: "분산된 보안 도구를 실제 대응 가능한 관제 체계로",
    role: "보안 관제 설계 · 자동화 / 기여도 50%",
    summary: "External·DMZ·Internal·SOC의 4계층 구조에서 공격 트래픽을 탐지하고 차단했습니다. 서버 상태, 보안 이벤트, 웹 로그를 대시보드와 Discord 알림으로 연결했습니다.",
    outcomes: [
      "Wazuh 이벤트와 Prometheus 지표 통합 시각화",
      "Suricata·iptables 탐지 및 차단 흐름 검증",
      "Shell Script·Webhook 기반 장애 대응 자동화",
    ],
    metrics: [
      { value: "7,099", label: "보안 이벤트" },
      { value: "351", label: "High Severity" },
      { value: "4,368", label: "원시 로그 Hits" },
    ],
    caseStudy: {
      problem: "iptables 선차단으로 Suricata 탐지 로그가 남지 않음",
      action: "체인 순서와 NFQUEUE 전달 구조를 점검해 탐지·차단 분리",
      result: "공격 트래픽의 탐지 기록과 차단 동작을 함께 검증",
    },
    artifacts: [
      { label: "Wazuh 복구 스크립트", href: "/artifacts/nextbank-recover-wazuh.sh" },
    ],
    stack: "Wazuh / Grafana / Prometheus / Suricata / GoAccess / Shell",
    image: "nextbank-architecture.png",
    imageAlt: "NextBank 4계층 보안 아키텍처",
    slides: "/presentations/nextbank/",
    notion: "https://app.notion.com/p/6d2a1ad5169d822ea62f81d89fcd9e6b",
  },
  {
    id: "project-shielders",
    number: "03",
    name: "Shielders",
    period: "2026.04.07 — 04.22",
    title: "기업형 네트워크와 Linux 서버의 기본을 직접 구축하며",
    role: "팀장 · 네트워크 설계 · 문서화",
    summary: "기업 환경을 가정한 토폴로지에 VLAN, VPN, ACL과 WEB·DB·DNS 서버를 구성했습니다. 중앙 로그 수집까지 연결해 운영자가 확인할 수 있는 구조로 정리했습니다.",
    outcomes: [
      "GNS3 기반 네트워크와 서버 통신 흐름 설계",
      "Linux 구축 및 설정 기준 팀 문서화",
      "rsyslog·LogAnalyzer 중앙 로그 환경 구성",
    ],
    metrics: [
      { value: "03", label: "분리 VLAN" },
      { value: "03", label: "Linux 서버 역할" },
      { value: "02", label: "검증 로그 유형" },
    ],
    caseStudy: {
      problem: "팀원별 구축 환경 차이로 최종 통합 과정에서 설정 충돌 발생",
      action: "토폴로지와 설정 기준을 공통 문서로 정리해 환경을 통일",
      result: "WEB·DB·DNS와 중앙 로그 수집 흐름을 연결해 구축 완료",
    },
    artifacts: [],
    stack: "GNS3 / Linux / Routing / VPN / ACL / rsyslog",
    image: "shielders-topology.png",
    imageAlt: "Shielders 기업형 네트워크 토폴로지",
    slides: "/presentations/shielders/",
    notion: "https://app.notion.com/p/2aaa1ad5169d823cbc4781b854563690",
  },
];

export default function Home() {
  return (
    <main className="folio" id="top">
      <nav className="folioNav" aria-label="주요 메뉴">
        <a className="folioName" href="#top">최준용</a>
        <div className="folioNavLinks">
          <a href="#overview">개요</a>
          <div className="folioProjectMenu">
            <a className="folioProjectTrigger" href="#work" aria-haspopup="true">프로젝트 <span aria-hidden="true">↓</span></a>
            <div className="folioProjectDropdown" aria-label="프로젝트 바로가기">
              {projects.map((project) => (
                <a href={`#${project.id}`} key={project.id}>
                  <span>{project.number}</span>
                  <strong>{project.name}</strong>
                  <small>{project.period}</small>
                </a>
              ))}
            </div>
          </div>
          <a href="#credentials">교육·대회</a>
        </div>
        <span>Security Infrastructure</span>
      </nav>

      <header className="folioHero" id="overview">
        <div className="folioHeroMain">
          <p className="folioOverline">Portfolio / 2026</p>
          <h1>보안 인프라를<br /><em>설계하고 검증합니다.</em></h1>
        </div>
        <div className="folioHeroIntro">
          <p>도구를 나열하기보다 공격이 어디에서 탐지되고, 어떻게 차단되며, 운영자가 무엇을 확인해야 하는지 설명합니다.</p>
          <a href="#work">프로젝트 3건 보기 <span>↓</span></a>
        </div>
        <dl className="folioFacts">
          <div><dt>Project</dt><dd>03</dd></div>
          <div><dt>Training</dt><dd>736h</dd></div>
          <div><dt>GPA</dt><dd>3.95</dd></div>
          <div><dt>Focus</dt><dd>Detection<br />&amp; Response</dd></div>
        </dl>
      </header>

      <section className="folioApproach" id="approach" aria-labelledby="approachTitle">
        <header>
          <p className="folioOverline">Working notes</p>
          <h2 id="approachTitle">문제가 생긴 지점에서<br />설정을 다시 읽습니다.</h2>
        </header>
        <ol>
          <li><span>01</span><h3>로그 수집 경로 확인</h3><p>도구 설정부터 바꾸지 않고 실제 로그 파일과 이벤트 생성 지점을 먼저 확인합니다.</p></li>
          <li><span>02</span><h3>탐지와 차단 역할 분리</h3><p>Firewall, IPS, WAF가 같은 일을 반복하지 않도록 계층별 책임과 검증 기준을 구분합니다.</p></li>
          <li><span>03</span><h3>운영자가 쓸 수 있게 정리</h3><p>알림에서 끝내지 않고 확인 명령어, 대시보드, 대응 순서까지 하나의 흐름으로 남깁니다.</p></li>
        </ol>
      </section>

      <section className="folioWork" id="work" aria-labelledby="workTitle">
        <header className="folioSectionHead">
          <p>Selected projects</p>
          <h2 id="workTitle">구축 결과보다<br />판단의 근거를 보여주는 기록</h2>
        </header>

        <div className="folioProjectList">
          {projects.map((project) => (
            <article className="folioProject" id={project.id} key={project.number}>
              <header className="folioProjectHead">
                <span>{project.number}</span>
                <p>{project.name}</p>
                <time>{project.period}</time>
              </header>
              <h3>{project.title}</h3>
              <div className="folioProjectCopy">
                <p className="folioRole">{project.role}</p>
                <p className="folioSummary">{project.summary}</p>
                <dl className="folioMetrics">
                  {project.metrics.map((metric) => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}
                </dl>
                <div className="folioCaseStudy">
                  <p><span>Problem</span>{project.caseStudy.problem}</p>
                  <p><span>Action</span>{project.caseStudy.action}</p>
                  <p><span>Result</span>{project.caseStudy.result}</p>
                </div>
              </div>
              <figure className="folioProjectVisual">
                <img src={`${basePath}/evidence/${project.image}`} alt={project.imageAlt} loading="lazy" />
                <figcaption>{project.stack}</figcaption>
              </figure>
              <div className="folioProjectLinks">
                <a href={`${basePath}${project.slides}`}>발표 자료 보기 <span>↗</span></a>
                <a href={project.notion} target="_blank" rel="noreferrer">구축 기록 보기 <span>↗</span></a>
                {project.artifacts.map((artifact) => <a href={`${basePath}${artifact.href}`} key={artifact.href} download>{artifact.label} <span>↓</span></a>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="folioProof" id="credentials" aria-labelledby="profileTitle">
        <header className="folioSectionHead">
          <p>Background &amp; proof</p>
          <h2 id="profileTitle">교육과 대회에서<br />반복해서 검증한 기본기</h2>
        </header>
        <div className="folioProfileGrid">
          <div className="folioTimeline">
            <article><time>2026.03 — 08</time><div><h3>이스트캠프 가디언즈</h3><p>정보보호 및 보안 인프라 운영 관리 · 736시간 수료</p></div></article>
            <article><time>2024.03 — 2026.02</time><div><h3>성공회대학교</h3><p>컴퓨터공학 · 소프트웨어공학 복수전공 · 학점 3.95</p></div></article>
            <article><time>2025 / 2023</time><div><h3>정보처리기사 · 네트워크관리사 2급</h3><p>시스템 개발과 네트워크 운영의 기반 지식</p></div></article>
          </div>
          <div className="folioRecognition">
            <figure><img src={`${basePath}/evidence/award-ctf-second.png`} alt="인프라 10기 CTF 대회 2등 상장" loading="lazy" /><figcaption><span>Competition</span>CTF 대회 2등</figcaption></figure>
            <figure><img src={`${basePath}/evidence/award-wargame-third.png`} alt="인프라 10기 워게임 3등 상장" loading="lazy" /><figcaption><span>Competition</span>워게임 3등</figcaption></figure>
            <figure><img src={`${basePath}/evidence/completion-certificate-redacted.png`} alt="개인 식별정보를 제거한 보안 인프라 과정 수료증" loading="lazy" /><figcaption><span>Completion</span>보안 인프라 과정 수료</figcaption></figure>
          </div>
        </div>
      </section>

      <footer className="folioFooter">
        <p>다음 문제를<br />끝까지 추적할 준비가 되어 있습니다.</p>
        <div><a href="https://app.notion.com/p/2f2a1ad5169d832a9a7f818d8c8a8119" target="_blank" rel="noreferrer">Notion portfolio ↗</a><span>© 2026 JUNYONG CHOI</span></div>
      </footer>
    </main>
  );
}
