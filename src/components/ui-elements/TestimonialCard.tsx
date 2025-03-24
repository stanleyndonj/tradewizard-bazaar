
interface TestimonialCardProps {
  content: string;
  author: string;
  position: string;
  image?: string;
}

const TestimonialCard = ({ content, author, position, image }: TestimonialCardProps) => {
  return (
    <div className="glass-card p-8 rounded-2xl mx-4 my-4 flex flex-col h-full">
      <blockquote className="text-lg text-balance mb-8 flex-1">
        "{content}"
      </blockquote>
      <div className="flex items-center">
        <div className="w-12 h-12 bg-trading-blue/20 rounded-full flex items-center justify-center text-trading-blue text-xl font-bold mr-4">
          {image ? (
            <img src={image} alt={author} className="w-full h-full object-cover rounded-full" />
          ) : (
            author.charAt(0)
          )}
        </div>
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-muted-foreground">{position}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
