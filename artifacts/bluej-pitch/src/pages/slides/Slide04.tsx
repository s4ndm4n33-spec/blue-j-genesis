export default function Slide04() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A] text-[#FFFFFF] flex flex-col px-[8vw] pt-[6vh] font-[var(--font-body-family)]">
      <h2 className="text-[2.5vw] font-bold leading-[1.2] mb-[3vh]">
        B.L.U.E.-J. gives every learner a mentor with a memory
      </h2>
      <div className="w-[3vw] h-[0.3vh] bg-[#0D9488] mb-[3vh]" />
      <div className="space-y-[1.8vh]">
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">Structured working memory.</strong> J. remembers every key decision, code entity, open issue, and project state across sessions. Ground-truth pinned, confidence-marked, hallucination-resistant.
        </p>
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">The "Clone Yourself" curriculum.</strong> You are not just learning Python. You are building J."s clone. Every lesson produces a real commit.
        </p>
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">The J.A.R.V.I.S. mentor voice.</strong> Dry wit. English competence. "We are building something." The voice that makes learners feel like apprentices, not customers.
        </p>
        <p className="text-[1.8vw] leading-[1.45] text-[#E2E8F0]">
          <strong className="text-[#FFFFFF]">Full IDE inside the chat.</strong> Write, run, and debug code without leaving the conversation. Git integration. Export. BYOK.
        </p>
      </div>
      <div className="absolute bottom-[3vh] left-[8vw] right-[8vw] flex justify-between items-baseline text-[1.2vw] text-[#94A3B8]">
        <span>Source: Internal build; 74 days, 10 sessions, 38 commits</span>
        <span>4 / 10</span>
      </div>
    </div>
  );
}
