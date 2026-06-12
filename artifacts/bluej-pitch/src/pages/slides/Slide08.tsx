export default function Slide08() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#0A0A0A] text-[#FFFFFF] flex flex-col px-[8vw] pt-[6vh] font-[var(--font-body-family)]">
      <h2 className="text-[2.5vw] font-bold leading-[1.2] mb-[3vh]">
        74 days in, 89 users, 303 messages — early signals validate the learning loop
      </h2>
      <div className="w-[3vw] h-[0.3vh] bg-[#0D9488] mb-[3vh]" />
      <div className="flex gap-[5vw] mt-[1vh]">
        <div className="flex-1 space-y-[1.5vh]">
          <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
            <strong className="text-[#FFFFFF]">Usage to date:</strong> 89 total users since 20 Apr 2026; 303 messages across 26 chat sessions.
          </p>
          <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
            <strong className="text-[#FFFFFF]">Current activity:</strong> 52 users active in the last 7 days.
          </p>
          <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
            <strong className="text-[#FFFFFF]">Live features:</strong> Full chat, IDE, Git integration, curriculum, gamification, structured working memory, voice I/O, BYOK, export, persona.
          </p>
          <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
            <strong className="text-[#FFFFFF]">Tech stack:</strong> React + Vite + Express + PostgreSQL + Drizzle + OpenAI + Zustand.
          </p>
        </div>
        <div className="flex-1 space-y-[1.5vh]">
          <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
            <strong className="text-[#FFFFFF]">Retention target:</strong> 40% of beta users return within 7 days of first session.
          </p>
          <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
            <strong className="text-[#FFFFFF]">Validation experiment:</strong> Cohort test of 50 users, 2-week free access, then a 5-day gap, then measure return rate.
          </p>
          <p className="text-[1.7vw] leading-[1.45] text-[#E2E8F0]">
            <strong className="text-[#FFFFFF]">Benchmark:</strong> Industry standard for coding tools is 15-25% week-1 retention.
          </p>
          <p className="text-[1.4vw] leading-[1.45] text-[#94A3B8] italic">
            Retention will be reported as D1/D7/D30 cohort retention once we have full event instrumentation.
          </p>
        </div>
      </div>
      <div className="absolute bottom-[3vh] left-[8vw] right-[8vw] flex justify-between items-baseline text-[1.2vw] text-[#94A3B8]">
        <span>Source: Internal development metrics (production database, live as of June 2026); retention benchmark from industry standards</span>
        <span>8 / 10</span>
      </div>
    </div>
  );
}
