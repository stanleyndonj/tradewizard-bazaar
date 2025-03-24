
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../ui-elements/SectionHeader';
import TestimonialCard from '../ui-elements/TestimonialCard';

const TestimonialsSection = () => {
  const testimonials = [
    {
      content: "The MT5 trading robot they created for me has consistently outperformed my manual trading by 23%. Their understanding of market dynamics is exceptional.",
      author: "Michael Chen",
      position: "Forex Trader, Singapore"
    },
    {
      content: "I've tried many binary robots, but none come close to the accuracy of TradeWizard's solution. Their team truly understands what professional traders need.",
      author: "Sophia Rodriguez",
      position: "Day Trader, Spain"
    },
    {
      content: "Their custom indicators have revolutionized my trading approach. I'm now able to spot opportunities I would have missed before.",
      author: "James Wilson",
      position: "Institutional Trader, UK"
    },
    {
      content: "Not only did they deliver an exceptional trading robot, but they also provided outstanding support to ensure I understood how to use it effectively.",
      author: "Aisha Patel",
      position: "Crypto Trader, UAE"
    },
    {
      content: "The performance analytics package they built helps me understand my trading patterns and improve my strategies. Worth every penny.",
      author: "Daniel Kim",
      position: "Hedge Fund Manager, South Korea"
    },
    {
      content: "After trying several trading robot providers, TradeWizard is the only one that delivered exactly what they promised - consistent results.",
      author: "Emma Thompson",
      position: "Options Trader, Australia"
    }
  ];

  const slideContainerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  // Initialize and update responsive behavior
  useEffect(() => {
    const updateDimensions = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate total slides and slide width
  useEffect(() => {
    if (slideContainerRef.current) {
      const containerWidth = slideContainerRef.current.clientWidth;
      setSlideWidth(containerWidth / slidesToShow);
      setTotalSlides(Math.ceil(testimonials.length / slidesToShow));
    }
  }, [testimonials.length, slidesToShow]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-trading-blue/5 rounded-full blur-3xl" />
      </div>
      
      <div className="section-container relative z-10">
        <SectionHeader
          subtitle="Client Testimonials"
          title="What Our Clients Say"
          description="Don't just take our word for it. Hear from traders who have transformed their results using our custom trading solutions."
          centered
        />

        <div className="relative">
          <div className="overflow-hidden" ref={slideContainerRef}>
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="min-w-full sm:min-w-[50%] lg:min-w-[33.333%]"
                >
                  <TestimonialCard {...testimonial} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full flex items-center justify-center border border-trading-blue/20 text-trading-blue hover:bg-trading-blue hover:text-white transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full flex items-center justify-center border border-trading-blue/20 text-trading-blue hover:bg-trading-blue hover:text-white transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* Indicators */}
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index 
                    ? 'w-8 bg-trading-blue' 
                    : 'bg-trading-blue/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
