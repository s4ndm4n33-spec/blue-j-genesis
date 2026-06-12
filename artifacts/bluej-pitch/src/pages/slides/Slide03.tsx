export default function Slide03() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A] text-[#FFFFFF] flex flex-col px-[8vw] pt-[6vh] font-[var(--font-body-family)]">
      <h2 className="text-[2.5vw] font-bold leading-[1.2] mb-[3vh]">
        Coding education leaves 47% of learners behind, with nothing to show
      </h2>
      <div className="w-[3vw] h-[0.3vh] bg-[#0D9488] mb-[3vh]" />
      <div className="space-y-[1.8vh]">
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">Syntax is taught. Engineering is not.</strong> Platforms teach loops and variables, not how to debug a 500-line codebase or refactor with confidence.
        </p>
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">No continuity between sessions.</strong> Every lesson starts from zero. Tutors forget your project. You explain your code for the 10th time.
        </p>
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">No real output.</strong> You finish with a certificate, not a project you would put on GitHub.
        </p>
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">The result:</strong> 47% of CS students drop out before graduation. Bootcamps charge $15K+. The gap between "I can write code" and "I can build software" is the widest chasm in tech education.
        </p>
      </div>
      <div className="absolute bottom-[3vh] left-[8vw] right-[8vw] flex justify-between items-baseline text-[1.2vw] text-[#94A3B8]">
        <span>Source: National Center for Education Statistics; bootcamp pricing from Course Report 2025</span>
        <span>3 / 10</span>
      </div>
    </div>
  );
}
