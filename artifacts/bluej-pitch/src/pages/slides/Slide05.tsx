export default function Slide05() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A] text-[#FFFFFF] flex flex-col px-[8vw] pt-[6vh] font-[var(--font-body-family)]">
      <h2 className="text-[2.5vw] font-bold leading-[1.2] mb-[3vh]">
        Three engineered systems make the memory hard to copy
      </h2>
      <div className="w-[3vw] h-[0.3vh] bg-[#0D9488] mb-[3vh]" />
      <div className="space-y-[1.8vh]">
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">1. Memory schema.</strong> Every session is parsed into structured JSON: key decisions (confirmed / suggested / unverified / stale), code entities with ground-truth pointers, open issues with context, and project state with source attribution.
        </p>
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">2. Evaluation harness.</strong> An automated pipeline tests memory accuracy against live code. If J. claims a file was modified, the harness verifies it against the actual repo.
        </p>
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">3. Telemetry curriculum loops.</strong> Real student error patterns are fed back into the lesson graph. The curriculum adapts to what students actually struggle with, not what we guess they will.
        </p>
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">The barrier:</strong> competitors can build a chatbot in a weekend. They cannot build this system without months of R&D and a live user base to train the loop.
        </p>
      </div>
      <div className="absolute bottom-[3vh] left-[8vw] right-[8vw] flex justify-between items-baseline text-[1.2vw] text-[#94A3B8]">
        <span>Source: Internal architecture; evaluation harness in active development</span>
        <span>5 / 10</span>
      </div>
    </div>
  );
}
