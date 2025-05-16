
import { ContentSection } from './content-section';

const CATEGORIES = {
  technology: {
    title: "Technology & Innovation",
    sections: [
      {
        id: "introduction",
        title: "Introduction to Modern Technology",
        content: `<div class="space-y-4">
          <p>Technology continues to reshape our world in unprecedented ways. From artificial intelligence to quantum computing, we're witnessing a revolution that touches every aspect of our lives.</p>
          <h3 class="text-xl font-semibold">Key Areas of Focus</h3>
          <ul class="list-disc pl-6 space-y-2">
            <li>Artificial Intelligence & Machine Learning</li>
            <li>Cloud Computing & Edge Technologies</li>
            <li>Cybersecurity & Privacy</li>
            <li>Internet of Things (IoT)</li>
          </ul>
        </div>`
      },
      {
        id: "ai-ml",
        title: "AI & Machine Learning",
        content: `<div class="space-y-4">
          <p>Artificial Intelligence and Machine Learning are transforming industries across the globe. From predictive analytics to natural language processing, these technologies are creating new possibilities.</p>
          <div class="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">Key Applications</h4>
            <ul class="list-disc pl-6 space-y-1">
              <li>Natural Language Processing</li>
              <li>Computer Vision</li>
              <li>Predictive Analytics</li>
              <li>Autonomous Systems</li>
            </ul>
          </div>
        </div>`
      }
    ],
    resources: [
      { title: "AI Research Papers", url: "/resources/ai-papers" },
      { title: "Tech News & Updates", url: "/resources/tech-news" },
      { title: "Learning Paths", url: "/resources/learning-paths" }
    ]
  },
  science: {
    title: "Science & Discovery",
    sections: [
      {
        id: "overview",
        title: "Scientific Method & Research",
        content: `<div class="space-y-4">
          <p>Science is the systematic study of the natural world through observation, experimentation, and analysis. Understanding the scientific method is crucial for all research endeavors.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-secondary-50 dark:bg-secondary-900/20 p-4 rounded-lg">
              <h4 class="font-semibold mb-2">Observation</h4>
              <p>Careful observation of phenomena is the first step in scientific inquiry.</p>
            </div>
            <div class="bg-secondary-50 dark:bg-secondary-900/20 p-4 rounded-lg">
              <h4 class="font-semibold mb-2">Experimentation</h4>
              <p>Testing hypotheses through controlled experiments validates scientific theories.</p>
            </div>
          </div>
        </div>`
      }
    ],
    resources: [
      { title: "Research Methodologies", url: "/resources/research-methods" },
      { title: "Scientific Journals", url: "/resources/journals" }
    ]
  }
};

export function CategoryContent({ category }: { category: string }) {
  const content = CATEGORIES[category as keyof typeof CATEGORIES];
  
  if (!content) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Category Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">This category is currently unavailable or under development.</p>
      </div>
    );
  }

  return (
    <ContentSection
      title={content.title}
      sections={content.sections}
      resources={content.resources}
    />
  );
}
