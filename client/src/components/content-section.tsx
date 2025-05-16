
import { useRef, useEffect, useState } from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  content: string;
}

interface ContentSectionProps {
  title: string;
  sections: Section[];
  resources?: { title: string; url: string; }[];
}

export function ContentSection({ title, sections, resources }: ContentSectionProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">{title}</h1>
      
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Table of Contents */}
        <nav className="hidden lg:block sticky top-24 h-fit">
          <div className="space-y-1">
            <p className="text-sm font-medium mb-4">Table of Contents</p>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={cn(
                  "block text-sm py-1 hover:text-primary-600 transition-colors",
                  activeSection === section.id ? "text-primary-600 font-medium" : "text-gray-600"
                )}
              >
                {section.title}
              </a>
            ))}
            {resources && (
              <a
                href="#resources"
                className={cn(
                  "block text-sm py-1 hover:text-primary-600 transition-colors",
                  activeSection === "resources" ? "text-primary-600 font-medium" : "text-gray-600"
                )}
              >
                Resources
              </a>
            )}
          </div>
        </nav>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="prose prose-lg max-w-none">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                ref={(el) => (sectionRefs.current[section.id] = el)}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              </section>
            ))}
            
            {resources && (
              <section id="resources" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Resources</h2>
                <ul>
                  {resources.map((resource, index) => (
                    <li key={index}>
                      <Link href={resource.url}>
                        <a className="text-primary-600 hover:underline">
                          {resource.title}
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
