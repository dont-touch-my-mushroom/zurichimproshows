import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const slides = [
  {
    image: "https://improfestivals.com/assets/images/slider/bg-3.jpg",
    title: "Welcome to Impro Festivals",
    subtitle: "Experience the magic of improvisation",
    ctaText: "Learn More",
    ctaLink: "/about"
  },
  {
    image: "https://improfestivals.com/assets/images/slider/bg-3.jpg",
    title: "Join Our Community",
    subtitle: "Connect with fellow improvisers",
    ctaText: "Get Started",
    ctaLink: "/register"
  },
  {
    image: "https://improfestivals.com/assets/images/slider/bg-3.jpg",
    title: "Upcoming Events",
    subtitle: "Don't miss out on our next festival",
    ctaText: "View Events",
    ctaLink: "/events"
  },
  {
    image: "https://improfestivals.com/assets/images/slider/bg-3.jpg",
    title: "Workshops & Training",
    subtitle: "Enhance your improvisation skills",
    ctaText: "Browse Courses",
    ctaLink: "/workshops"
  },
  {
    image: "https://improfestivals.com/assets/images/slider/bg-3.jpg",
    title: "Support Impro Festivals",
    subtitle: "Help us grow the community",
    ctaText: "Donate",
    ctaLink: "/donate"
  }
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <Carousel className="w-full relative">
        <CarouselContent className="h-[522px]">
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <Card className="h-full border-0 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                </div>
                <CardContent className="relative flex flex-col items-center justify-center p-6 h-full text-white text-center">
                  <h2 className="text-5xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-xl mb-8">{slide.subtitle}</p>
                  <Link href={slide.ctaLink}>
                    <Button 
                      size="lg" 
                      variant="secondary"
                      className="bg-white text-black hover:bg-white/90"
                    >
                      {slide.ctaText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute inset-y-0 left-4 flex items-center">
          <CarouselPrevious className="static translate-y-0" />
        </div>
        <div className="absolute inset-y-0 right-4 flex items-center">
          <CarouselNext className="static translate-y-0" />
        </div>
      </Carousel>
      <h1 className="text-4xl font-bold text-center py-8">Upcoming Festivals</h1>
    </div>
  );
}
