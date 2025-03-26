export interface Festival {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  country: string;
  city: string;
  dateFrom: Date;
  dateUntil: Date;
  website?: string;
  instagram?: string;
  poster?: string;
  description: string;
  slogan?: string;
  languages: string[];
  accommodationOffered: boolean;
  mixerShows: boolean;
}
