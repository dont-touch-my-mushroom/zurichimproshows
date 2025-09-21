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
import { FestivalCard } from "@/components/card/festival-card";
import { getUpcomingFestivalsAction, getPastFestivalsAction } from "@/actions/festivals-actions";
import { SelectFestival } from "@/db/schema/festivals-schema";

const slides = [
  {
    image: "/bg-3.jpg",
    title: "Impro Festivals all around the world",
    subtitle: "Check the upcoming dates",
    ctaText: "Festivals",
    ctaLink: "/list"
  },
  {
    image: "/bg-3.jpg",
    title: "You say Improv, I say Impro",
    subtitle: "But we understand each other",
    ctaText: "Advertise your festival",
    ctaLink: "/festival-form"
  },
];

export default async function Home() {
  // Fetch upcoming festivals
  const today = new Date();
  console.log("Debug - Today's date:", today.toISOString());
  const upcomingResponse = await getUpcomingFestivalsAction(today);
  const upcomingFestivals = (upcomingResponse.status === "success" ? upcomingResponse.data : []) as SelectFestival[];
  
  // Fetch past festivals
  const pastResponse = await getPastFestivalsAction(today, 10);
  const pastFestivals = (pastResponse.status === "success" ? pastResponse.data : []) as SelectFestival[];

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
      <div className="container mx-auto pb-12">
        {upcomingFestivals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingFestivals.map((festival) => (
              <FestivalCard key={festival.id} festival={festival} />
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-muted-foreground">No upcoming festivals scheduled at this time.</p>
        )}
        
        <div className="flex justify-center mt-8">
          <Link href="/list">
            <Button size="lg">View All Festivals</Button>
          </Link>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-center py-8">Past Festivals</h1>
      <div className="container mx-auto pb-12">
        {pastFestivals.length > 0 ? (
          <div className="relative">
            <Carousel className="w-full" 
              opts={{ 
                dragFree: true,
                watchDrag: false
              }}>
              <CarouselContent>
                {pastFestivals.map((festival) => (
                  <CarouselItem key={festival.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 pointer-events-auto">
                      <FestivalCard festival={festival} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* Mobile arrows - overlaid */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 md:hidden pointer-events-none">
                <CarouselPrevious className="static translate-y-0 pointer-events-auto" />
                <CarouselNext className="static translate-y-0 pointer-events-auto" />
              </div>
              {/* Desktop arrows - sides */}
              <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-4 pointer-events-none">
                <CarouselPrevious className="static translate-y-0 pointer-events-auto" />
                <CarouselNext className="static translate-y-0 pointer-events-auto" />
              </div>
            </Carousel>
          </div>
        ) : (
          <p className="text-center text-lg text-muted-foreground">No past festivals found.</p>
        )}

        <div className="flex justify-center mt-8">
          <Link href="/list">
            <Button size="lg" variant="outline">View All Festivals</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
