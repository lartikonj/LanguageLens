
import { ContentSection } from './content-section';

const CATEGORIES = {
  technology: {
    title: "Technology",
    sections: [
      {
        id: "intro",
        title: "Introduction to Technology",
        content: `<p>Technology encompasses the tools, innovations, and methods that shape our modern world...</p>`
      },
      {
        id: "ai",
        title: "Artificial Intelligence",
        content: `<p>AI is transforming how we live, work, and interact...</p>`
      },
      {
        id: "web",
        title: "Web Development",
        content: `<p>Web development is the backbone of our digital experiences...</p>`
      }
    ],
    resources: [
      { title: "Learn to Code", url: "/learn-code" },
      { title: "Tech News", url: "/tech-news" }
    ]
  },
  science: {
    title: "Science",
    sections: [
      {
        id: "intro",
        title: "What is Science?",
        content: `<p>Science is the systematic study of the natural world...</p>`
      },
      {
        id: "physics",
        title: "Physics",
        content: `<p>Physics explores the fundamental laws of the universe...</p>`
      }
    ],
    resources: [
      { title: "Scientific Method", url: "/scientific-method" },
      { title: "Research Papers", url: "/research" }
    ]
  },
  // Add more categories as needed
};

export function CategoryContent({ category }: { category: string }) {
  const content = CATEGORIES[category as keyof typeof CATEGORIES];
  
  if (!content) {
    return <div>Category not found</div>;
  }

  return (
    <ContentSection
      title={content.title}
      sections={content.sections}
      resources={content.resources}
    />
  );
}
