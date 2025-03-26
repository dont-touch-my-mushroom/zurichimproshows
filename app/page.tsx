import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Carousel className="w-full relative">
        <CarouselContent className="h-[400px]">
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <Card className="h-full border-0">
                <CardContent className="flex items-center justify-center p-6 h-full">
                  <div className="text-4xl font-semibold">Slide {index + 1}</div>
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
    </div>
  );
}
