import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ListItem {
  title: string;
  description: string;
  content: string;
}

const items: ListItem[] = [
  {
    title: "Card 1",
    description: "Description for card 1",
    content: "This is the content for card 1"
  },
  {
    title: "Card 2",
    description: "Description for card 2",
    content: "This is the content for card 2"
  },
  {
    title: "Card 3",
    description: "Description for card 3",
    content: "This is the content for card 3"
  },
  // Add more items as needed
];

export default function ListPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">List Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{item.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 