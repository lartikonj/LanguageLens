import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Button } from "@/components/ui/card";

export default function AboutPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>About Us | LinguaContent</title>
        <meta name="description" content="Learn about LinguaContent's mission to help people learn languages naturally through immersive multilingual content." />
        <link rel="canonical" href="https://linguacontent.com/about" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-800 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">About </span>
              <span className="block text-primary-600 dark:text-primary-500">LinguaContent</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              Learn languages naturally by enjoying content you love in multiple languages.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Our Mission
            </h2>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-3xl mx-auto text-gray-500 dark:text-gray-300">
            <p>
              At LinguaContent, we believe that language learning should be natural, enjoyable, and integrated into your everyday life. Our mission is to help language learners of all levels improve their skills by engaging with authentic, interesting content in multiple languages.
            </p>
            <p>
              Traditional language learning often focuses on memorizing grammar rules and vocabulary lists, which can feel disconnected from how we actually use language in real life. We take a different approach: immersing you in content you genuinely want to consume.
            </p>
            <p>
              By allowing you to seamlessly switch between languages or view them side by side, we help you make connections and understand meaning in context—just like you would when immersed in a foreign country.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="bg-primary-100 dark:bg-primary-900 rounded-full p-4 inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900 dark:text-white">1. Browse Content</h3>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-300">
                Explore our library of articles, stories, and other content organized by category and subject. Choose topics that genuinely interest you.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <div className="bg-primary-100 dark:bg-primary-900 rounded-full p-4 inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900 dark:text-white">2. Switch Languages</h3>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-300">
                All content is available in English, Arabic, French, Spanish, and German. Toggle between languages or view them side by side to compare and learn.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <div className="bg-primary-100 dark:bg-primary-900 rounded-full p-4 inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900 dark:text-white">3. Learn Naturally</h3>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-300">
                As you engage with content in multiple languages, you'll naturally absorb vocabulary, grammar, and cultural context without the tedium of rote memorization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Languages We Support
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              All content on LinguaContent is available in these five languages:
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">English</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">English</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Arabic</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">العربية</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">French</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Français</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Spanish</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Español</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">German</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Deutsch</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              The Benefits of Our Approach
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-gray-50 dark:bg-gray-900 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Natural Learning</h3>
                  <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                    Learn the way your brain was designed to—through context, patterns, and meaningful content, not through memorization.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-gray-50 dark:bg-gray-900 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Efficient Use of Time</h3>
                  <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                    Read about topics you're already interested in while learning a language at the same time—no need for separate study sessions.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-gray-50 dark:bg-gray-900 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Cultural Context</h3>
                  <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                    Learn not just the language but also the cultural nuances and expressions that formal language courses often miss.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 dark:bg-primary-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start learning?</span>
            <span className="block text-primary-200">Join LinguaContent today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/auth">
                <a className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50">
                  Get started
                </a>
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link href="/categories">
                <a className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-700 hover:bg-primary-800">
                  Browse content
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
