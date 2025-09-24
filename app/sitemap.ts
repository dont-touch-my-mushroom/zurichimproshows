import { MetadataRoute } from 'next'
import { getAllShowsAction } from '@/actions/shows-actions' // Import the action
import { SelectShow } from '@/db/schema/shows-schema' // Try SelectShow type

// Replace with your actual base URL
const URL = 'https://www.zurichshows.com'

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

  // --- Dynamic Routes (Shows) ---
  let showRoutes: MetadataRoute.Sitemap = [];
  try {
    const result = await getAllShowsAction();
    if (result.status === 'success' && Array.isArray(result.data)) {
      const shows = result.data as SelectShow[]; // Use SelectShow
      showRoutes = shows.map((show) => ({
        url: `${URL}/shows/${show.id}`, // Use show ID for the URL
        lastModified: show.updatedAt ? new Date(show.updatedAt).toISOString() : new Date().toISOString(),
        changeFrequency: 'monthly', // Or based on how often show details change
        priority: 0.9,
      }));
    } else {
      console.error("Failed to fetch shows for sitemap:", result.message);
    }
  } catch (error) {
    console.error("Error fetching shows for sitemap:", error);
  }

  return [
    ...staticRoutes,
    ...showRoutes,
    // ... add other dynamic route arrays here if needed
  ];
} 