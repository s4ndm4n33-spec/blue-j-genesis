export default function Slide06() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A] text-[#FFFFFF] flex flex-col px-[8vw] pt-[6vh] font-[var(--font-body-family)]">
      <h2 className="text-[2.5vw] font-bold leading-[1.2] mb-[3vh]">
        The $17.4B coding education market is expanding, and AI mentors are the fastest segment
      </h2>
      <div className="w-[3vw] h-[0.3vh] bg-[#0D9488] mb-[3vh]" />
      <div className="flex gap-[4vw] mt-[1vh]">
        <div className="flex-1">
          <p className="text-[3vw] font-bold text-[#0D9488] leading-[1]">$17.4B</p>
          <p className="text-[1.4vw] text-[#94A3B8] mt-[0.5vh]">Global coding education TAM (2026)</p>
        </div>
        <div className="flex-1">
          <p className="text-[3vw] font-bold text-[#0D9488] leading-[1]">$4.2B</p>
          <p className="text-[1.4vw] text-[#94A3B8] mt-[0.5vh]">Self-directed learners (SAM)</p>
        </div>
        <div className="flex-1">
          <p className="text-[3vw] font-bold text-[#0D9488] leading-[1]">3.0M</p>
          <p className="text-[1.4vw] text-[#94A3B8] mt-[0.5vh]">Annual learners (bootcamp + self-taught)</p>
        </div>
      </div>
      <div className="mt-[4vh] space-y-[1.5vh]">
        <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">Bootcamp market:</strong> 500K annual enrollments at $15K average. High cost, high dropout, low completion.
        </p>
        <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">Self-taught market:</strong> 2.5M learners using YouTube, Codecademy, and ChatGPT. No structure, no continuity, no project.
        </p>
        <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">AI mentor segment:</strong> Cursor, Windsurf, and GitHub Copilot serve professional engineers. No product serves learners with a teaching-first architecture.
        </p>
      </div>
      <div className="absolute bottom-[3vh] left-[8vw] right-[8vw] flex justify-between items-baseline text-[1.2vw] text-[#94A3B8]">
        <span>Source: HolonIQ Global EdTech 2026; Course Report 2025; Stack Overflow Developer Survey 2025</span>
        <span>6 / 10</span>
      </div>
    </div>
  );
}
