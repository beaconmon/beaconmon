const SCENARIOS = [
  {
    label: 'Competitor ran a flash sale',
    body: 'A competing store drops 20% sitewide on a Friday morning. You find out from a customer asking why your prices are higher. By Monday, their sale is over.',
    outcome: 'With Beaconmon: you get the alert when it goes live, not when damage is done.',
  },
  {
    label: 'Manual tab-checking every morning',
    body: 'Six competitor tabs, open, refresh, skim, close. Every day. One morning you miss a banner swap that signals a new collection is coming.',
    outcome: 'With Beaconmon: one digest lands in your inbox. Six tabs, gone.',
  },
  {
    label: 'Checkout down on Black Friday',
    body: 'Your store goes down at 9am on the biggest sales day of the year. You find out 40 minutes later when a customer emails support.',
    outcome: 'With Beaconmon: you get a text in under two minutes, before the first cart is abandoned.',
  },
];

export default function Testimonials() {
  return (
    <section className="py-[100px] border-t border-brand-line-soft">
      <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
        <div className="reveal text-center mb-12">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">
            Situations that happen every week
          </span>
          <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">
            The things you find out too late.
          </h2>
        </div>
        <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-4">
          {SCENARIOS.map(({ label, body, outcome }) => (
            <div
              key={label}
              className="reveal flex flex-col gap-4 p-7 bg-brand-bg1 border border-brand-line-soft rounded-2xl"
            >
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted m-0">
                {label}
              </p>
              <p className="text-[15px] leading-[1.6] text-brand-dim m-0 flex-1">
                {body}
              </p>
              <p className="text-[13px] leading-[1.5] text-brand-green-ink font-medium m-0 pt-3 border-t border-brand-line-soft">
                {outcome}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
