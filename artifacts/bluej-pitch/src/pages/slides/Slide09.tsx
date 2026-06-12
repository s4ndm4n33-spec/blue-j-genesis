export default function Slide09() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A] text-[#FFFFFF] flex flex-col px-[8vw] pt-[6vh] font-[var(--font-body-family)]">
      <h2 className="text-[2.5vw] font-bold leading-[1.2] mb-[3vh]">
        Raising $750K to reach 1,000 users, validate retention, and prove the model
      </h2>
      <div className="w-[3vw] h-[0.3vh] bg-[#0D9488] mb-[2.5vh]" />
      <div className="flex gap-[4vw]">
        <div className="w-[35vw] space-y-[1.5vh]">
          <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
            <strong className="text-[#FFFFFF]">Raising:</strong> $750K seed round
          </p>
          <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
            <strong className="text-[#FFFFFF]">Runway:</strong> 18 months
          </p>
          <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
            <strong className="text-[#FFFFFF]">Use of funds:</strong>
          </p>
          <ul className="text-[1.6vw] leading-[1.45] text-[#E2E8F0] list-none pl-[1vw]">
            <li className="py-[0.4vh]">60% Engineering (working memory, IDE, curriculum)</li>
            <li className="py-[0.4vh]">30% User acquisition (university partnerships, dev.to/Reddit)</li>
            <li className="py-[0.4vh]">10% Legal / IP (persona protection, trademark)</li>
          </ul>
        </div>
        <div className="flex-1 space-y-[1.5vh]">
          <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
            <strong className="text-[#FFFFFF]">Milestone 1 (3 months):</strong> 1,000 beta users, 40% DAU/MAU, cohort test complete.
          </p>
          <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
            <strong className="text-[#FFFFFF]">Milestone 2 (6 months):</strong> 10,000 users, $5K MRR, 2 university pilots.
          </p>
          <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
            <strong className="text-[#FFFFFF]">Milestone 3 (12 months):</strong> 50,000 users, $30K MRR, break-even.
          </p>
        </div>
      </div>
      <div className="absolute bottom-[3vh] left-[8vw] right-[8vw] flex justify-between items-baseline text-[1.2vw] text-[#94A3B8]">
        <span>Source: Internal financial projections</span>
        <span>9 / 10</span>
      </div>
    </div>
  );
}
