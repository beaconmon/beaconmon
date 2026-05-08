export default function LogoMark() {
  return (
    <span aria-hidden="true" className="relative inline-flex items-center justify-center w-[22px] h-[22px]">
      <span className="absolute w-[22px] h-[22px] rounded-full border-[1.5px] border-brand-green opacity-40 animate-logo-pulse" />
      <span className="absolute w-2 h-2 rounded-full bg-brand-green shadow-[0_0_10px_#00E57A]" />
    </span>
  );
}
