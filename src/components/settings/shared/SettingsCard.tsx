type Props = {
  id: string;
  title: string;
  accentColor?: "warm" | "gold" | "olive" | "red";
  animationDelay?: string;
  children: React.ReactNode;
};

const gradientMap = {
  warm: "from-accent-warm via-accent-gold to-transparent",
  gold: "from-accent-gold via-accent-olive to-transparent",
  olive: "from-accent-olive via-accent-warm to-transparent",
  red: "from-red-400 via-red-300 to-transparent",
};

const borderMap = {
  warm: "border-border-light",
  gold: "border-border-light",
  olive: "border-border-light",
  red: "border-red-200",
};

const titleColorMap = {
  warm: "text-accent-warm",
  gold: "text-accent-warm",
  olive: "text-accent-warm",
  red: "text-red-500",
};

export default function SettingsCard({ id, title, accentColor = "warm", animationDelay = "0s", children }: Props) {
  return (
    <section id={id} className="scroll-mt-[72px]">
      <div
        className={`bg-bg-secondary rounded-[20px] ${borderMap[accentColor]} border p-6 relative overflow-hidden animate-fade-in-up`}
        style={{ animationDelay }}
      >
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradientMap[accentColor]}`} />
        <h2 className={`text-[11px] font-semibold ${titleColorMap[accentColor]} uppercase tracking-[1px] mb-5`}>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
