import Image from "next/image";

const Footer = () => {
  return (
    <footer className="w-full bg-primary text-primary-foreground p-8 mt-auto">
      <div className="container mx-auto flex flex-col items-center justify-center">
        <div className="w-64 h-24 relative mb-4">
          <Image
            src="https://storage.googleapis.com/improfestivals_images/logo_name_white.png"
            alt="Impro Festivals Logo"
            fill
            sizes="(max-width: 768px) 100vw, 256px"
            style={{ objectFit: "contain" }}
            priority
            unoptimized
          />
        </div>
        <p className="text-sm font-light">
          Impro Festivals Crafted with{" "}
          <span className="text-red-500" aria-label="love">
            ❤
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer; 