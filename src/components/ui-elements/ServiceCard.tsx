
import { ReactNode } from 'react';

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  features: string[];
}

const ServiceCard = ({ icon, title, description, features }: ServiceCardProps) => {
  return (
    <div className="glass-card rounded-2xl p-8 transition-all duration-300 hover:shadow-elevated group">
      <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-trading-blue/10 text-trading-blue mb-6 group-hover:bg-trading-blue group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className="inline-block mr-2 mt-1 w-1.5 h-1.5 rounded-full bg-trading-blue" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceCard;
