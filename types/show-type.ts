export interface Show {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  showStarts: Date;
  doorsOpen: Date;
  website?: string;
  instagram?: string;
  poster?: string;
  description: string;
  slogan?: string;
  email?: string;
  groups?: string[];
  ticketsLink?: string;
  locationName?: string;
  locationLink?: string;
  ticketPrice?: string;
}