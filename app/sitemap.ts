import { MetadataRoute } from 'next'
import { getAllFestivalsAction } from '@/actions/festivals-actions' // Import the action
import { SelectFestival } from '@/db/schema/festivals-schema' // Try SelectFestival type

// Replace with your actual base URL
const URL = 'https://www.improfestivals.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // --- Static Routes ---
  const staticRoutes: MetadataRoute.Sitemap = [
    '/', 
    // Add other static routes here, e.g., '/about', '/contact', '/list'
    '/list' // Assuming /list is a static page
  ].map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly', // Adjust frequency as needed ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')
    priority: route === '/' ? 1 : 0.8, // Prioritize homepage
  }));

  // --- Dynamic Routes (Festivals) ---
  let festivalRoutes: MetadataRoute.Sitemap = [];
  try {
    const result = await getAllFestivalsAction();
    if (result.status === 'success' && Array.isArray(result.data)) {
      const festivals = result.data as SelectFestival[]; // Use SelectFestival
      festivalRoutes = festivals.map((festival) => ({
        url: `${URL}/festivals/${festival.id}`, // Use festival ID for the URL
        lastModified: festival.updatedAt ? new Date(festival.updatedAt).toISOString() : new Date().toISOString(),
        changeFrequency: 'monthly', // Or based on how often festival details change
        priority: 0.9,
      }));
    } else {
      console.error("Failed to fetch festivals for sitemap:", result.message);
    }
  } catch (error) {
    console.error("Error fetching festivals for sitemap:", error);
  }

  return [
    ...staticRoutes,
    ...festivalRoutes,
    // ... add other dynamic route arrays here if needed
  ];
} 