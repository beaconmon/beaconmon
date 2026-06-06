// TODO: replace placeholder names, stores, and quotes with real testimonials before public launch

const TESTIMONIALS = [
  {
    quote:
      'We caught a competitor running a 20% off sitewide sale the morning it launched. Had a matching promo live by noon. We used to find out from customers.',
    name: 'Sarah K.',
    role: 'Operations Lead',
    store: 'TheLighterPack.com',
    initials: 'SK',
  },
  {
    quote:
      'I was checking six competitor tabs every morning. Beaconmon replaced all of it with one digest. Took me ten minutes to set up.',
    name: 'Marcus T.',
    role: 'Founder',
    store: 'NordicShade.com',
    initials: 'MT',
  },
  {
    quote:
      'Our checkout went down on Black Friday morning and we got alerted before a single customer complained. That alone paid for a full year.',
    name: 'Priya M.',
    role: 'Head of Growth',
    store: 'BloomCraft.com',
    initials: 'PM',
  },
];

export default function Testimonials() {
  return (
    <section className="py-[100px] border-t border-brand-line-soft">
      <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
        <div className="reveal text-center mb-12">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">
            From the stores using it
          </span>
          <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">
            What ecommerce teams say.
          </h2>
        </div>
        <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-4">
          {TESTIMONIALS.map(({ quote, name, role, store, initials }) => (
            <div
              key={name}
              className="reveal flex flex-col gap-5 p-7 bg-brand-bg1 border border-brand-line-soft rounded-2xl"
            >
              <blockquote className="text-[15px] leading-[1.6] text-brand-dim m-0 flex-1">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div
                  aria-hidden
                  className="w-9 h-9 rounded-full bg-brand-bg3 border border-brand-line flex items-center justify-center text-[12px] font-bold text-brand-green-ink shrink-0"
                >
                  {initials}
                </div>
                <div>
                  <p className="text-[14px] font-semibold m-0">{name}</p>
                  <p className="text-[12px] text-brand-muted m-0">
                    {role} · {store}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
