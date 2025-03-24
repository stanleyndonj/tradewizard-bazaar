
interface SectionHeaderProps {
  subtitle: string;
  title: string;
  description?: string;
  centered?: boolean;
}

const SectionHeader = ({ subtitle, title, description, centered = false }: SectionHeaderProps) => {
  return (
    <div className={`max-w-2xl ${centered ? 'mx-auto text-center' : ''} mb-16`}>
      <p className="text-sm font-medium uppercase tracking-wide text-trading-blue mb-2">{subtitle}</p>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
      {description && <p className="text-lg text-muted-foreground">{description}</p>}
    </div>
  );
};

export default SectionHeader;
