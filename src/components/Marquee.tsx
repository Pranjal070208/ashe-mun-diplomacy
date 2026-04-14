const words = "DELIBERATE · DEBATE · DELIVER · ASHE MUN · DIPLOMACY · LEADERSHIP · ";

const Marquee = () => (
  <div className="w-full overflow-hidden border-y border-secondary/20 bg-background py-4">
    <div className="animate-marquee whitespace-nowrap flex">
      {[0, 1].map((i) => (
        <span key={i} className="font-heading text-secondary text-sm md:text-base tracking-[0.3em] uppercase">
          {words.repeat(4)}
        </span>
      ))}
    </div>
  </div>
);

export default Marquee;
