export default function Slide02() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A] text-[#FFFFFF] flex flex-col px-[8vw] pt-[6vh] font-[var(--font-body-family)]">
      <h2 className="text-[2.5vw] font-bold leading-[1.2] mb-[3.5vh]">
        Executive Summary
      </h2>
      <div className="w-[3vw] h-[0.3vh] bg-[#0D9488] mb-[3vh]" />
      <div className="space-y-[2.5vh]">
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          47% of CS students drop out. Bootcamps charge $15K+. YouTube delivers infinite tutorials and zero shipped projects.
        </p>
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          B.L.U.E.-J. is an AI coding mentor with a structured working memory system that remembers every decision, bug, and line of code across sessions.
        </p>
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          The "build your own AI clone" curriculum gives learners a tangible product and a reason to return. The J.A.R.V.I.S. mentor voice makes the experience feel like an apprenticeship, not a chatbot.
        </p>
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          We are raising $750K to reach 1,000 beta users, validate 40% week-1 retention, and expand to 2 university pilots.
        </p>
      </div>
      <div className="absolute bottom-[3vh] left-[8vw] right-[8vw] flex justify-between items-baseline text-[1.2vw] text-[#94A3B8]">
        <span>Source: Internal development; 47% attrition from CS education research</span>
        <span>2 / 10</span>
      </div>
    </div>
  );
}
