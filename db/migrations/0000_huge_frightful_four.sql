CREATE TABLE "festivals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"date_from" timestamp NOT NULL,
	"date_until" timestamp NOT NULL,
	"website" text,
	"instagram" text,
	"poster" text,
	"description" text NOT NULL,
	"slogan" text,
	"languages" text[] NOT NULL,
	"accommodation_offered" boolean DEFAULT false NOT NULL,
	"mixer_shows" boolean DEFAULT false NOT NULL
);
