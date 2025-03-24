
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Download, ShoppingCart } from "lucide-react";

interface Robot {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'MT5' | 'Binary';
  category: 'free' | 'paid';
  features: string[];
  imageUrl: string;
}

interface RobotProductCardProps {
  robot: Robot;
  onPurchaseClick: () => void;
}

const RobotProductCard = ({ robot, onPurchaseClick }: RobotProductCardProps) => {
  const isFree = robot.category === 'free';
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      <div className="relative">
        <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
          <img 
            src={robot.imageUrl} 
            alt={robot.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
            {robot.type}
          </Badge>
          <Badge className={isFree ? "bg-green-500" : "bg-trading-blue"}>
            {isFree ? "Free" : "Premium"}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-trading-blue" />
          {robot.name}
        </CardTitle>
        <CardDescription>{robot.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Key Features:</p>
          <ul className="text-sm space-y-1 pl-5 list-disc text-muted-foreground">
            {robot.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex flex-col items-stretch gap-3">
        <div className="flex justify-between items-center w-full">
          <div>
            {isFree ? (
              <span className="text-green-600 font-semibold">Free</span>
            ) : (
              <span className="font-semibold text-lg">
                {robot.currency} {robot.price.toFixed(2)}
              </span>
            )}
          </div>
          <Button 
            onClick={onPurchaseClick}
            className={isFree ? "bg-green-500 hover:bg-green-600" : "bg-trading-blue hover:bg-trading-darkBlue"}
          >
            {isFree ? (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Purchase
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RobotProductCard;
