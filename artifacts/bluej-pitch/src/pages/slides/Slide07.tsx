export default function Slide07() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A] text-[#FFFFFF] flex flex-col px-[8vw] pt-[6vh] font-[var(--font-body-family)]">
      <h2 className="text-[2.5vw] font-bold leading-[1.2] mb-[3vh]">
        Four tiers capture learners from free to enterprise
      </h2>
      <div className="w-[3vw] h-[0.3vh] bg-[#0D9488] mb-[2.5vh]" />
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#334155]">
            <th className="text-[1.5vw] font-bold pb-[1.5vh] pt-[0.5vh] pr-[2vw] text-[#E2E8F0]">Tier</th>
            <th className="text-[1.5vw] font-bold pb-[1.5vh] pt-[0.5vh] pr-[2vw] text-[#E2E8F0]">Price</th>
            <th className="text-[1.5vw] font-bold pb-[1.5vh] pt-[0.5vh] text-[#E2E8F0]">Key features</th>
          </tr>
        </thead>
        <tbody className="text-[1.5vw]">
          <tr className="border-b border-[#1E293B]">
            <td className="py-[1.5vh] pr-[2vw] font-bold text-[#FFFFFF]">Free</td>
            <td className="py-[1.5vh] pr-[2vw] text-[#94A3B8]">$0</td>
            <td className="py-[1.5vh] text-[#E2E8F0]">Basic mentor (gpt-4o-mini), 1 project, 50 messages/day</td>
          </tr>
          <tr className="border-b border-[#1E293B]">
            <td className="py-[1.5vh] pr-[2vw] font-bold text-[#0D9488]">Pro</td>
            <td className="py-[1.5vh] pr-[2vw] text-[#94A3B8]">$19/month</td>
            <td className="py-[1.5vh] text-[#E2E8F0]">gpt-4o quality, unlimited, structured memory, BYOK</td>
          </tr>
          <tr className="border-b border-[#1E293B]">
            <td className="py-[1.5vh] pr-[2vw] font-bold text-[#FFFFFF]">Team</td>
            <td className="py-[1.5vh] pr-[2vw] text-[#94A3B8]">$49/seat/month</td>
            <td className="py-[1.5vh] text-[#E2E8F0]">Shared workspaces, team knowledge base, project history</td>
          </tr>
          <tr>
            <td className="py-[1.5vh] pr-[2vw] font-bold text-[#FFFFFF]">University</td>
            <td className="py-[1.5vh] pr-[2vw] text-[#94A3B8]">$99/seat/semester</td>
            <td className="py-[1.5vh] text-[#E2E8F0]">Bulk curriculum, LMS integration, grade tracking</td>
          </tr>
        </tbody>
      </table>
      <div className="mt-[3vh] space-y-[1.2vh]">
        <p className="text-[1.6vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">Unit economics:</strong> Free tier runs on gpt-4o-mini (~$0.02 per session). Pro tier uses gpt-4o only for critical generation. COGS stay below 25% of revenue at scale.
        </p>
        <p className="text-[1.6vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">Path to $30K MRR:</strong> 500 Pro users + 2 university pilots (500 seats each) = $9.5K + $49.5K = $59K/month potential.
        </p>
      </div>
      <div className="absolute bottom-[3vh] left-[8vw] right-[8vw] flex justify-between items-baseline text-[1.2vw] text-[#94A3B8]">
        <span>Source: OpenAI pricing; internal COGS estimates</span>
        <span>7 / 10</span>
      </div>
    </div>
  );
}
