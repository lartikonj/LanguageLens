import {
  users, categories, subjects, articles, articleTranslations, comments, likes, savedArticles,
  languages, categoryTranslations, subjectTranslations,
  type User, type InsertUser, type Language, type Category, type Subject, type Article,
  type ArticleTranslation, type Comment, type Like, type SavedArticle
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface CategoryWithTranslation extends Category {
  name: string;
  description?: string;
}

export interface SubjectWithTranslation extends Subject {
  name: string;
  description?: string;
  category: CategoryWithTranslation;
}

export interface ArticleWithTranslation extends Article {
  title: string;
  content: string;
  notes?: string;
  author?: {
    id: number;
    username: string;
  };
  subject: SubjectWithTranslation;
}

export interface CommentWithUser extends Comment {
  user: {
    id: number;
    username: string;
  };
  replies?: CommentWithUser[];
}

export interface ArticleTranslationWithLanguage extends ArticleTranslation {
  language: Language;
}

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Languages
  getLanguages(): Promise<Language[]>;
  getLanguageByCode(code: string): Promise<Language | undefined>;

  // Categories
  getCategoriesWithTranslations(languageCode: string): Promise<CategoryWithTranslation[]>;
  getCategoryBySlug(slug: string, languageCode: string): Promise<CategoryWithTranslation | undefined>;

  // Subjects
  getSubjectsByCategorySlug(categorySlug: string, languageCode: string): Promise<SubjectWithTranslation[]>;
  getSubjectBySlug(slug: string, languageCode: string): Promise<SubjectWithTranslation | undefined>;

  // Articles
  getArticlesBySubjectSlug(subjectSlug: string, languageCode: string): Promise<ArticleWithTranslation[]>;
  getArticleBySlug(slug: string, languageCode: string): Promise<ArticleWithTranslation | undefined>;
  getArticleTranslations(slug: string): Promise<ArticleTranslationWithLanguage[]>;

  // Comments
  getCommentsByArticleSlug(articleSlug: string): Promise<CommentWithUser[]>;
  createComment(comment: { articleId: number; userId: number; content: string; parentId?: number }): Promise<Comment>;

  // Likes
  likeArticle(articleId: number, userId: number): Promise<Like>;
  unlikeArticle(articleId: number, userId: number): Promise<void>;
  isArticleLiked(articleId: number, userId: number): Promise<boolean>;

  // Saved Articles
  saveArticle(articleId: number, userId: number): Promise<SavedArticle>;
  unsaveArticle(articleId: number, userId: number): Promise<void>;
  isArticleSaved(articleId: number, userId: number): Promise<boolean>;
  getSavedArticles(userId: number, languageCode: string): Promise<ArticleWithTranslation[]>;

  // Session store
  sessionStore: session.SessionStore;
}

export interface Article {
  id: number;
  slug: string;
  authorId: number;
  subjectId: number;
  status?: 'pending' | 'approved' | 'rejected';
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: number;
  userId: number;
  content: string;
  createdAt: Date;
  user: {
    id: number;
    username: string;
  };
}

export class MemStorage implements IStorage {
  private currentMessageId: number = 1;
  private messagesStore: Map<number, Message>;
  private usersStore: Map<number, User>;
  private languagesStore: Map<number, Language>;
  private categoriesStore: Map<number, Category>;
  private categoryTranslationsStore: Map<number, Map<number, { name: string; description?: string }>>;
  private subjectsStore: Map<number, Subject>;
  private subjectTranslationsStore: Map<number, Map<number, { name: string; description?: string }>>;
  private articlesStore: Map<number, Article>;
  private articleTranslationsStore: Map<number, Map<number, { title: string; content: string; notes?: string }>>;
  private commentsStore: Map<number, Comment>;
  private likesStore: Map<number, Like>;
  private savedArticlesStore: Map<number, SavedArticle>;

  sessionStore: session.SessionStore;

  private currentUserId: number = 1;
  private currentLanguageId: number = 1;
  private currentCategoryId: number = 1;
  private currentSubjectId: number = 1;
  private currentArticleId: number = 1;
  private currentCommentId: number = 1;
  private currentLikeId: number = 1;
  private currentSavedArticleId: number = 1;

  constructor() {
    this.usersStore = new Map();
    this.messagesStore = new Map();
    this.languagesStore = new Map();
    this.categoriesStore = new Map();
    this.categoryTranslationsStore = new Map();
    this.subjectsStore = new Map();
    this.subjectTranslationsStore = new Map();
    this.articlesStore = new Map();
    this.articleTranslationsStore = new Map();
    this.commentsStore = new Map();
    this.likesStore = new Map();
    this.savedArticlesStore = new Map();

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

    // Initialize with default data
    this.initializeData();
  }

  private initializeData(): void {
    // Add languages
    const languages = [
      { code: 'en', name: 'English', nativeName: 'English', rtl: false },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
      { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
      { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
      { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
    ];

    const languageMap = new Map<string, number>();

    languages.forEach(lang => {
      const id = this.currentLanguageId++;
      this.languagesStore.set(id, {
        id,
        ...lang,
      });
      languageMap.set(lang.code, id);
    });

    // Add categories
    const categories = [
      {
        slug: 'language-learning',
        translations: {
          en: { name: 'Language Learning', description: 'Resources for vocabulary, grammar, phrases, pronunciation, and language comparison' },
          ar: { name: 'تعلم اللغات', description: 'مصادر للمفردات والقواعد والعبارات والنطق ومقارنة اللغات' }
        }
      },
      {
        slug: 'culture-and-traditions',
        translations: {
          en: { name: 'Culture & Traditions', description: 'Explore food, holidays, clothing, etiquette, and religion' },
          ar: { name: 'الثقافة والتقاليد', description: 'استكشف الطعام والعطلات والملابس وآداب السلوك والدين' }
        }
      },
      {
        slug: 'travel-and-places',
        translations: {
          en: { name: 'Travel & Places', description: 'City guides, travel phrases, transportation, local tips, and safety' },
          ar: { name: 'السفر والأماكن', description: 'أدلة المدن وعبارات السفر والمواصلات والنصائح المحلية والسلامة' }
        }
      },
      {
        slug: 'entertainment-and-media',
        translations: {
          en: { name: 'Entertainment & Media', description: 'Movies, music, pop culture idioms, books, and celebrities' },
          ar: { name: 'الترفيه والإعلام', description: 'الأفلام والموسيقى وتعابير الثقافة الشعبية والكتب والمشاهير' }
        }
      },
      {
        slug: 'history-and-heritage',
        translations: {
          en: { name: 'History & Heritage', description: 'Historical figures, key events, ancient civilizations, and language origins' },
          ar: { name: 'التاريخ والتراث', description: 'الشخصيات التاريخية والأحداث الرئيسية والحضارات القديمة وأصول اللغة' }
        }
      },
      {
        slug: 'education-and-study',
        translations: {
          en: { name: 'Education & Study Tips', description: 'Study techniques, learning tools, flashcards, and memory methods' },
          ar: { name: 'التعليم وطرق الدراسة', description: 'تقنيات الدراسة وأدوات التعلم والبطاقات التعليمية وطرق الذاكرة' }
        }
      },
      {
        slug: 'daily-life',
        translations: {
          en: { name: 'Daily Life & Conversations', description: 'Market, healthcare, weather, appointments, and family interactions' },
          ar: { name: 'الحياة اليومية والمحادثات', description: 'السوق والرعاية الصحية والطقس والمواعيد والتفاعلات العائلية' }
        }
      },
      {
        slug: 'technology-and-innovation',
        translations: {
          en: { name: 'Technology & Innovation', description: 'AI & language, translation tools, learning platforms, and tech news' },
          ar: { name: 'التكنولوجيا والابتكار', description: 'الذكاء الاصطناعي واللغة وأدوات الترجمة ومنصات التعلم وأخبار التكنولوجيا' }
        }
      },
      {
        slug: 'career-and-business',
        translations: {
          en: { name: 'Career & Business', description: 'CV writing, business vocabulary, interview tips, and work culture' },
          ar: { name: 'المهنة والأعمال', description: 'كتابة السيرة الذاتية ومفردات الأعمال ونصائح المقابلات وثقافة العمل' }
        }
      },
      {
        slug: 'multilingual-fun',
        translations: {
          en: { name: 'Multilingual Fun & Games', description: 'Quizzes, challenges, word games, memes, and emoji phrases' },
          ar: { name: 'المرح والألعاب متعددة اللغات', description: 'الاختبارات والتحديات وألعاب الكلمات والميمات وعبارات الرموز التعبيرية' }
        }
      },
      {
        slug: 'levantine-dialect',
        translations: {
          en: { name: 'Levantine Arabic', description: 'Learn the dialect of Syria, Lebanon, Palestine, and Jordan' },
          ar: { name: 'اللهجة الشامية', description: 'تعلم لهجة سوريا ولبنان وفلسطين والأردن' }
        }
      },
      {
        slug: 'egyptian-dialect',
        translations: {
          en: { name: 'Egyptian Arabic', description: 'Master the most widely understood Arabic dialect' },
          ar: { name: 'اللهجة المصرية', description: 'إتقان اللهجة العربية الأكثر فهماً' }
        }
      },
      {
        slug: 'gulf-dialect',
        translations: {
          en: { name: 'Gulf Arabic', description: 'Learn the dialect of the Arabian Peninsula' },
          ar: { name: 'اللهجة الخليجية', description: 'تعلم لهجة شبه الجزيرة العربية' }
        }
      },
      {
        slug: 'business-arabic',
        translations: {
          en: { name: 'Business Arabic', description: 'Professional Arabic for work and commerce' },
          ar: { name: 'العربية للأعمال', description: 'العربية المهنية للعمل والتجارة' }
        }
      },
      {
        slug: 'quranic-arabic',
        translations: {
          en: { name: 'Quranic Arabic', description: 'Classical Arabic for understanding religious texts' },
          ar: { name: 'العربية القرآنية', description: 'العربية الكلاسيكية لفهم النصوص الدينية' }
        }
      },
      {
        slug: 'media-arabic',
        translations: {
          en: { name: 'Media Arabic', description: 'Arabic used in news and journalism' },
          ar: { name: 'عربية الإعلام', description: 'العربية المستخدمة في الأخبار والصحافة' }
        }
      },
      {
        slug: 'literature-poetry',
        translations: {
          en: { name: 'Literature & Poetry', description: 'Explore Arabic literature and poetic traditions' },
          ar: { name: 'الأدب والشعر', description: 'اكتشف الأدب العربي والتقاليد الشعرية' }
        }
      },
      {
        slug: 'cultural-expressions',
        translations: {
          en: { name: 'Cultural Expressions', description: 'Idioms, proverbs, and cultural wisdom' },
          ar: { name: 'التعابير الثقافية', description: 'الأمثال والحكم والتعابير الثقافية' }
        }
      },
      {
        slug: 'arabic-calligraphy',
        translations: {
          en: { name: 'Arabic Calligraphy', description: 'Learn about Arabic script and its artistic forms' },
          ar: { name: 'الخط العربي', description: 'تعلم عن الكتابة العربية وأشكالها الفنية' }
        }
      },
      {
        slug: 'travel-guide',
        translations: {
          en: { name: 'Travel Guide', description: 'Essential phrases for travelers' },
          ar: { name: 'دليل السفر', description: 'العبارات الأساسية للمسافرين' },
          fr: { name: 'Guide de Voyage', description: 'Phrases essentielles pour les voyageurs' },
          es: { name: 'Guía de Viaje', description: 'Frases esenciales para viajeros' },
          de: { name: 'Reiseführer', description: 'Wesentliche Redewendungen für Reisende' },
        }
      },
      {
        slug: 'food-and-cuisine',
        translations: {
          en: { name: 'Food and Cuisine', description: 'Culinary vocabulary and food-related expressions' },
          ar: { name: 'الطعام والمطبخ', description: 'المفردات الطهي والتعبيرات المتعلقة بالطعام' },
          fr: { name: 'Nourriture et Cuisine', description: 'Vocabulaire culinaire et expressions liées à la nourriture' },
          es: { name: 'Comida y Cocina', description: 'Vocabulario culinario y expresiones relacionadas con la comida' },
          de: { name: 'Essen und Küche', description: 'Kulinarisches Vokabular und Ausdrücke rund ums Essen' },
        }
      },
      {
        slug: 'culture-and-traditions',
        translations: {
          en: { name: 'Culture and Traditions', description: 'Learn about cultural practices and traditions' },
          ar: { name: 'الثقافة والتقاليد', description: 'تعرف على الممارسات الثقافية والتقاليد' },
          fr: { name: 'Culture et Traditions', description: 'Découvrez les pratiques culturelles et les traditions' },
          es: { name: 'Cultura y Tradiciones', description: 'Aprende sobre prácticas culturales y tradiciones' },
          de: { name: 'Kultur und Traditionen', description: 'Erfahren Sie mehr über kulturelle Praktiken und Traditionen' },
        }
      },
      {
        slug: 'business-communication',
        translations: {
          en: { name: 'Business Communication', description: 'Professional language for work and business' },
          ar: { name: 'التواصل التجاري', description: 'لغة احترافية للعمل والأعمال التجارية' },
          fr: { name: 'Communication d\'Affaires', description: 'Langage professionnel pour le travail et les affaires' },
          es: { name: 'Comunicación Empresarial', description: 'Lenguaje profesional para el trabajo y los negocios' },
          de: { name: 'Geschäftskommunikation', description: 'Professionelle Sprache für Arbeit und Geschäft' },
        }
      },
      {
        slug: 'academic-language',
        translations: {
          en: { name: 'Academic Language', description: 'Vocabulary for education and academic settings' },
          ar: { name: 'اللغة الأكاديمية', description: 'مفردات للتعليم والأوساط الأكاديمية' },
          fr: { name: 'Langage Académique', description: 'Vocabulaire pour l\'éducation et les milieux académiques' },
          es: { name: 'Lenguaje Académico', description: 'Vocabulario para educación y entornos académicos' },
          de: { name: 'Akademische Sprache', description: 'Vokabular für Bildung und akademische Umgebungen' },
        }
      },
    ];

    // Add categories and their translations
    categories.forEach(categoryData => {
      const categoryId = this.currentCategoryId++;
      const category = {
        id: categoryId,
        slug: categoryData.slug,
        createdAt: new Date(),
      };

      this.categoriesStore.set(categoryId, category);

      // Add translations for each language
      Object.entries(categoryData.translations).forEach(([langCode, translation]) => {
        const langId = languageMap.get(langCode);
        if (langId) {
          if (!this.categoryTranslationsStore.has(categoryId)) {
            this.categoryTranslationsStore.set(categoryId, new Map());
          }
          this.categoryTranslationsStore.get(categoryId)?.set(langId, translation);
        }
      });

      // Add subjects for each category
      this.addSubjectsForCategory(categoryId, categoryData.slug, languageMap);
    });
  }

  private addSubjectsForCategory(categoryId: number, categorySlug: string, languageMap: Map<string, number>): void {
    const subjectsData: { [key: string]: any } = {
      'daily-conversations': [
        {
          slug: 'greetings-and-introductions',
          translations: {
            en: { name: 'Greetings and Introductions', description: 'Common ways to greet people and introduce yourself' },
            ar: { name: 'التحيات والمقدمات', description: 'طرق شائعة لتحية الناس وتقديم نفسك' },
            fr: { name: 'Salutations et Présentations', description: 'Façons courantes de saluer les gens et de vous présenter' },
            es: { name: 'Saludos y Presentaciones', description: 'Formas comunes de saludar a la gente y presentarte' },
            de: { name: 'Begrüßungen und Vorstellungen', description: 'Übliche Arten, Leute zu begrüßen und sich vorzustellen' },
          }
        },
        {
          slug: 'shopping-and-services',
          translations: {
            en: { name: 'Shopping and Services', description: 'Useful phrases for shopping and using services' },
            ar: { name: 'التسوق والخدمات', description: 'عبارات مفيدة للتسوق واستخدام الخدمات' },
            fr: { name: 'Shopping et Services', description: 'Phrases utiles pour faire des achats et utiliser des services' },
            es: { name: 'Compras y Servicios', description: 'Frases útiles para comprar y utilizar servicios' },
            de: { name: 'Einkaufen und Dienstleistungen', description: 'Nützliche Redewendungen zum Einkaufen und zur Nutzung von Dienstleistungen' },
          }
        },
      ],
      'travel-guide': [
        {
          slug: 'at-the-airport',
          translations: {
            en: { name: 'At the Airport', description: 'Phrases to use at the airport' },
            ar: { name: 'في المطار', description: 'عبارات للاستخدام في المطار' },
            fr: { name: 'À l\'Aéroport', description: 'Phrases à utiliser à l\'aéroport' },
            es: { name: 'En el Aeropuerto', description: 'Frases para usar en el aeropuerto' },
            de: { name: 'Am Flughafen', description: 'Redewendungen für den Flughafen' },
          }
        },
        {
          slug: 'public-transportation',
          translations: {
            en: { name: 'Public Transportation', description: 'How to navigate public transport in different countries' },
            ar: { name: 'وسائل النقل العام', description: 'كيفية التنقل في وسائل النقل العام في بلدان مختلفة' },
            fr: { name: 'Transports Publics', description: 'Comment naviguer dans les transports publics dans différents pays' },
            es: { name: 'Transporte Público', description: 'Cómo navegar por el transporte público en diferentes países' },
            de: { name: 'Öffentliche Verkehrsmittel', description: 'Wie man sich in verschiedenen Ländern mit öffentlichen Verkehrsmitteln zurechtfindet' },
          }
        },
      ],
      'food-and-cuisine': [
        {
          slug: 'ordering-at-restaurants',
          translations: {
            en: { name: 'Ordering at Restaurants', description: 'Phrases to use when ordering food' },
            ar: { name: 'الطلب في المطاعم', description: 'عبارات تستخدم عند طلب الطعام' },
            fr: { name: 'Commander au Restaurant', description: 'Phrases à utiliser lors de la commande de nourriture' },
            es: { name: 'Ordenar en Restaurantes', description: 'Frases para usar al ordenar comida' },
            de: { name: 'Bestellen im Restaurant', description: 'Redewendungen zum Bestellen von Speisen' },
          }
        },
        {
          slug: 'popular-dishes',
          translations: {
            en: { name: 'Popular Dishes', description: 'Learn about famous dishes from around the world' },
            ar: { name: 'الأطباق الشعبية', description: 'تعرف على الأطباق الشهيرة من جميع أنحاء العالم' },
            fr: { name: 'Plats Populaires', description: 'Découvrez des plats célèbres du monde entier' },
            es: { name: 'Platos Populares', description: 'Aprende sobre platos famosos de todo el mundo' },
            de: { name: 'Beliebte Gerichte', description: 'Erfahren Sie mehr über berühmte Gerichte aus aller Welt' },
          }
        },
      ],
      'culture-and-traditions': [
        {
          slug: 'holidays-and-celebrations',
          translations: {
            en: { name: 'Holidays and Celebrations', description: 'Important holidays and how they are celebrated' },
            ar: { name: 'العطلات والاحتفالات', description: 'العطلات المهمة وكيفية الاحتفال بها' },
            fr: { name: 'Fêtes et Célébrations', description: 'Fêtes importantes et comment elles sont célébrées' },
            es: { name: 'Festividades y Celebraciones', description: 'Festividades importantes y cómo se celebran' },
            de: { name: 'Feiertage und Feierlichkeiten', description: 'Wichtige Feiertage und wie sie gefeiert werden' },
          }
        },
        {
          slug: 'customs-and-etiquette',
          translations: {
            en: { name: 'Customs and Etiquette', description: 'Cultural norms and expected behaviors' },
            ar: { name: 'العادات وآداب السلوك', description: 'الأعراف الثقافية والسلوكيات المتوقعة' },
            fr: { name: 'Coutumes et Étiquette', description: 'Normes culturelles et comportements attendus' },
            es: { name: 'Costumbres y Etiqueta', description: 'Normas culturales y comportamientos esperados' },
            de: { name: 'Bräuche und Etikette', description: 'Kulturelle Normen und erwartetes Verhalten' },
          }
        },
      ],
      'business-communication': [
        {
          slug: 'business-meetings',
          translations: {
            en: { name: 'Business Meetings', description: 'Language for effective meetings and presentations' },
            ar: { name: 'اجتماعات العمل', description: 'لغة للاجتماعات والعروض التقديمية الفعالة' },
            fr: { name: 'Réunions d\'Affaires', description: 'Langage pour des réunions et présentations efficaces' },
            es: { name: 'Reuniones de Negocios', description: 'Lenguaje para reuniones y presentaciones efectivas' },
            de: { name: 'Geschäftstreffen', description: 'Sprache für effektive Meetings und Präsentationen' },
          }
        },
        {
          slug: 'emails-and-correspondence',
          translations: {
            en: { name: 'Emails and Correspondence', description: 'How to write professional emails and letters' },
            ar: { name: 'البريد الإلكتروني والمراسلات', description: 'كيفية كتابة رسائل البريد الإلكتروني والخطابات المهنية' },
            fr: { name: 'Emails et Correspondance', description: 'Comment rédiger des emails et lettres professionnels' },
            es: { name: 'Correos y Correspondencia', description: 'Cómo escribir correos electrónicos y cartas profesionales' },
            de: { name: 'E-Mails und Korrespondenz', description: 'Wie man professionelle E-Mails und Briefe schreibt' },
          }
        },
      ],
      'academic-language': [
        {
          slug: 'classroom-vocabulary',
          translations: {
            en: { name: 'Classroom Vocabulary', description: 'Essential terms for educational settings' },
            ar: { name: 'مفردات الفصل الدراسي', description: 'المصطلحات الأساسية للبيئات التعليمية' },
            fr: { name: 'Vocabulaire de Classe', description: 'Termes essentiels pour les contextes éducatifs' },
            es: { name: 'Vocabulario del Aula', description: 'Términos esenciales para entornos educativos' },
            de: { name: 'Klassenzimmer-Vokabular', description: 'Wesentliche Begriffe für Bildungsumgebungen' },
          }
        },
        {
          slug: 'academic-writing',
          translations: {
            en: { name: 'Academic Writing', description: 'How to write essays and research papers' },
            ar: { name: 'الكتابة الأكاديمية', description: 'كيفية كتابة المقالات وأوراق البحث' },
            fr: { name: 'Rédaction Académique', description: 'Comment rédiger des essais et des articles de recherche' },
            es: { name: 'Escritura Académica', description: 'Cómo escribir ensayos y trabajos de investigación' },
            de: { name: 'Akademisches Schreiben', description: 'Wie man Essays und Forschungsarbeiten schreibt' },
          }
        },
      ],
    };

    if (subjectsData[categorySlug]) {
      subjectsData[categorySlug].forEach((subjectData: any) => {
        const subjectId = this.currentSubjectId++;
        const subject = {
          id: subjectId,
          slug: subjectData.slug,
          categoryId: categoryId,
          createdAt: new Date(),
        };

        this.subjectsStore.set(subjectId, subject);

        // Add translations for each language
        Object.entries(subjectData.translations).forEach(([langCode, translation]) => {
          const langId = languageMap.get(langCode);
          if (langId) {
            if (!this.subjectTranslationsStore.has(subjectId)) {
              this.subjectTranslationsStore.set(subjectId, new Map());
            }
            this.subjectTranslationsStore.get(subjectId)?.set(langId, translation as { name: string; description?: string });
          }
        });

        // Add articles for this subject
        this.addArticlesForSubject(subjectId, subjectData.slug, languageMap);
      });
    }
  }

  private addArticlesForSubject(subjectId: number, subjectSlug: string, languageMap: Map<string, number>): void {
    // Sample article content for each subject
    const articlesData: { [key: string]: any } = {
      'business-meetings': [
        {
          slug: 'effective-presentations',
          translations: {
            en: {
              title: 'Effective Business Presentations',
              content: `<h2>Communicating with Impact in Business Settings</h2>
              <p>Delivering effective presentations is a critical skill in business environments. Whether you're pitching to clients, presenting quarterly results, or leading a team meeting, clear communication is essential.</p>
              <h3>Key Phrases for Presentations</h3>
              <ul>
                <li><strong>Opening:</strong> "Thank you for the opportunity to present today.", "I'm delighted to share our findings with you."</li>
                <li><strong>Transitioning:</strong> "Moving on to our next point...", "This brings us to the question of..."</li>
                <li><strong>Handling questions:</strong> "That's an excellent question.", "I'll address that in more detail shortly."</li>
                <li><strong>Closing:</strong> "In conclusion...", "To summarize the key points..."</li>
              </ul>
              <p>Remember that non-verbal communication is just as important as the words you use. Maintain eye contact, use confident body language, and pace your delivery appropriately.</p>`,
              notes: 'Practice these phrases to build confidence in business presentations.'
            },
            ar: {
              title: 'عروض تقديمية تجارية فعالة',
              content: `<h2>التواصل بتأثير في بيئات الأعمال</h2>
              <p>تقديم عروض فعالة هو مهارة حاسمة في بيئات الأعمال. سواء كنت تقدم عرضًا للعملاء، أو تعرض نتائج ربع سنوية، أو تقود اجتماع فريق، فإن التواصل الواضح أمر ضروري.</p>
              <h3>عبارات أساسية للعروض التقديمية</h3>
              <ul>
                <li><strong>الافتتاح:</strong> "شكراً على الفرصة للتقديم اليوم."، "يسعدني مشاركة نتائجنا معكم."</li>
                <li><strong>الانتقال:</strong> "ننتقل إلى النقطة التالية..."، "هذا يقودنا إلى مسألة..."</li>
                <li><strong>التعامل مع الأسئلة:</strong> "هذا سؤال ممتاز."، "سأتناول ذلك بمزيد من التفصيل قريبًا."</li>
                <li><strong>الختام:</strong> "في الختام..."، "لتلخيص النقاط الرئيسية..."</li>
              </ul>
              <p>تذكر أن التواصل غير اللفظي مهم بقدر أهمية الكلمات التي تستخدمها. حافظ على الاتصال البصري، واستخدم لغة جسد واثقة، ونظم إيقاع التقديم بشكل مناسب.</p>`,
              notes: 'مارس هذه العبارات لبناء الثقة في العروض التقديمية التجارية.'
            },
            fr: {
              title: 'Présentations d\'Affaires Efficaces',
              content: `<h2>Communiquer avec Impact dans les Environnements d'Affaires</h2>
              <p>Réaliser des présentations efficaces est une compétence cruciale dans les environnements d'affaires. Que vous présentiez à des clients, des résultats trimestriels, ou que vous dirigiez une réunion d'équipe, une communication claire est essentielle.</p>
              <h3>Phrases Clés pour les Présentations</h3>
              <ul>
                <li><strong>Ouverture:</strong> "Merci pour l'opportunité de présenter aujourd'hui.", "Je suis ravi de partager nos résultats avec vous."</li>
                <li><strong>Transition:</strong> "Passons à notre point suivant...", "Cela nous amène à la question de..."</li>
                <li><strong>Gérer les questions:</strong> "C'est une excellente question.", "J'aborderai cela plus en détail bientôt."</li>
                <li><strong>Conclusion:</strong> "En conclusion...", "Pour résumer les points clés..."</li>
              </ul>
              <p>N'oubliez pas que la communication non verbale est tout aussi importante que les mots que vous utilisez. Maintenez un contact visuel, utilisez un langage corporel confiant, et rythmer votre présentation de façon appropriée.</p>`,
              notes: 'Pratiquez ces phrases pour renforcer la confiance dans les présentations d\'affaires.'
            },
            es: {
              title: 'Presentaciones Empresariales Efectivas',
              content: `<h2>Comunicación con Impacto en Entornos Empresariales</h2>
              <p>Realizar presentaciones efectivas es una habilidad crítica en entornos empresariales. Ya sea que estés presentando a clientes, resultados trimestrales o dirigiendo una reunión de equipo, la comunicación clara es esencial.</p>
              <h3>Frases Clave para Presentaciones</h3>
              <ul>
                <li><strong>Apertura:</strong> "Gracias por la oportunidad de presentar hoy.", "Estoy encantado de compartir nuestros hallazgos con ustedes."</li>
                <li><strong>Transición:</strong> "Pasando a nuestro siguiente punto...", "Esto nos lleva a la cuestión de..."</li>
                <li><strong>Manejo de preguntas:</strong> "Esa es una excelente pregunta.", "Abordaré eso con más detalle en breve."</li>
                <li><strong>Cierre:</strong> "En conclusión...", "Para resumir los puntos clave..."</li>
              </ul>
              <p>Recuerda que la comunicación no verbal es tan importante como las palabras que usas. Mantén el contacto visual, usa un lenguaje corporal confiado y ajusta el ritmo de tu presentación adecuadamente.</p>`,
              notes: 'Practica estas frases para desarrollar confianza en presentaciones empresariales.'
            },
            de: {
              title: 'Effektive Geschäftspräsentationen',
              content: `<h2>Wirkungsvolle Kommunikation im Geschäftsumfeld</h2>
              <p>Effektive Präsentationen zu halten ist eine entscheidende Fähigkeit im Geschäftsumfeld. Ob Sie Kunden akquirieren, Quartalsergebnisse präsentieren oder ein Teammeeting leiten - klare Kommunikation ist unerlässlich.</p>
              <h3>Schlüsselsätze für Präsentationen</h3>
              <ul>
                <li><strong>Eröffnung:</strong> "Vielen Dank für die Gelegenheit, heute zu präsentieren.", "Ich freue mich, unsere Ergebnisse mit Ihnen zu teilen."</li>
                <li><strong>Übergang:</strong> "Kommen wir zu unserem nächsten Punkt...", "Dies führt uns zur Frage..."</li>
                <li><strong>Umgang mit Fragen:</strong> "Das ist eine ausgezeichnete Frage.", "Ich werde darauf in Kürze näher eingehen."</li>
                <li><strong>Abschluss:</strong> "Zusammenfassend...", "Um die Kernpunkte zusammenzufassen..."</li>
              </ul>
              <p>Denken Sie daran, dass nonverbale Kommunikation genauso wichtig ist wie die Worte, die Sie verwenden. Halten Sie Blickkontakt, verwenden Sie selbstbewusste Körpersprache und passen Sie Ihr Sprechtempo angemessen an.</p>`,
              notes: 'Üben Sie diese Phrasen, um Selbstvertrauen bei Geschäftspräsentationen aufzubauen.'
            }
          }
        }
      ],
      'emails-and-correspondence': [
        {
          slug: 'professional-email-writing',
          translations: {
            en: {
              title: 'Writing Professional Business Emails',
              content: `<h2>Effective Email Communication</h2>
              <p>In today's digital workplace, writing clear and professional emails is an essential skill. Your email communication often shapes how colleagues and clients perceive your professionalism.</p>
              <h3>Email Structure and Phrases</h3>
              <ul>
                <li><strong>Subject line:</strong> Should be clear, concise, and specific, e.g., "Meeting Request: Q3 Budget Review"</li>
                <li><strong>Salutation:</strong> "Dear [Name]," (formal), "Hello [Name]," (semi-formal), "Hi [Name]," (informal)</li>
                <li><strong>Opening:</strong> "I hope this email finds you well.", "I'm writing regarding..."</li>
                <li><strong>Body: Keep paragraphs short and focused on one topic each</li>
                <li><strong>Closing:</strong> "Thank you for your consideration.", "I look forward to your response."</li>
                <li><strong>Sign-off:</strong> "Best regards,", "Sincerely,", "Kind regards,"</li>
              </ul>
              <p>Always proofread your emails before sending and consider your tone. Written communication lacks vocal intonation, so be careful with humor or sarcasm that might be misinterpreted.</p>`,
              notes: 'Remember to adapt your style based on your relationship with the recipient.'
            },
            ar: {
              title: 'كتابة رسائل البريد الإلكتروني المهنية',
              content: `<h2>التواصل الفعال عبر البريد الإلكتروني</h2>
              <p>في مكان العمل الرقمي اليوم، تعد كتابة رسائل البريد الإلكتروني الواضحة والمهنية مهارة أساسية. غالبًا ما يشكل تواصلك عبر البريد الإلكتروني الطريقة التي ينظر بها الزملاء والعملاء إلى احترافيتك.</p>
              <h3>هيكل البريد الإلكتروني والعبارات</h3>
              <ul>
                <li><strong>سطر الموضوع:</strong> يجب أن يكون واضحًا وموجزًا ومحددًا، مثل "طلب اجتماع: مراجعة ميزانية الربع الثالث"</li>
                <li><strong>التحية:</strong> "عزيزي [الاسم]،" (رسمي)، "مرحبًا [الاسم]،" (شبه رسمي)، "أهلاً [الاسم]،" (غير رسمي)</li>
                <li><strong>الافتتاح:</strong> "آمل أن تصلك رسالتي وأنت بخير."، "أكتب بخصوص..."</li>
                <li><strong>المحتوى:</strong> اجعل الفقرات قصيرة وركز على موضوع واحد في كل منها</li>
                <li><strong>الختام:</strong> "شكرًا لاهتمامك."، "أتطلع إلى ردك."</li>
                <li><strong>التوقيع:</strong> "مع أطيب التحيات،"، "بإخلاص،"، "تحياتي الطيبة،"</li>
              </ul>
              <p>راجع دائمًا رسائل البريد الإلكتروني قبل إرسالها وانتبه لنبرة الكلام. تفتقر الاتصالات المكتوبة إلى نبرة الصوت، لذا كن حذرًا مع الفكاهة أو السخرية التي قد يساء تفسيرها.</p>`,
              notes: 'تذكر أن تكيف أسلوبك بناءً على علاقتك مع المستلم.'
            },
            fr: {
              title: 'Rédaction d\'Emails Professionnels',
              content: `<h2>Communication Efficace par Email</h2>
              <p>Dans le milieu professionnel numérique d'aujourd'hui, la rédaction d'emails clairs et professionnels est une compétence essentielle. Votre communication par email façonne souvent la façon dont les collègues et les clients perçoivent votre professionnalisme.</p>
              <h3>Structure d'Email et Phrases</h3>
              <ul>
                <li><strong>Ligne d'objet:</strong> Doit être claire, concise et spécifique, ex. "Demande de Réunion: Révision du Budget T3"</li>
                <li><strong>Salutation:</strong> "Cher/Chère [Nom]," (formel), "Bonjour [Nom]," (semi-formel), "Salut [Nom]," (informel)</li>
                <li><strong>Ouverture:</strong> "J'espère que ce message vous trouve bien.", "Je vous écris concernant..."</li>
                <li><strong>Corps:</strong> Gardez les paragraphes courts et concentrés sur un seul sujet chacun</li>
                <li><strong>Conclusion:</strong> "Merci pour votre considération.", "J'attends votre réponse avec intérêt."</li>
                                <li><strong>Signature:</strong> "Cordialement,", "Sincèrement,", "Bien à vous,"</li>
              </ul>
              <p>Relisez toujours vos emails avant de les envoyer et considérez votre ton. La communication écrite manque d'intonation vocale, alors soyez prudent avec l'humour ou le sarcasme qui pourraient être mal interprétés.</p>`,
              notes: 'N\'oubliez pas d\'adapter votre style en fonction de votre relation avec le destinataire.'
            },
            es: {
              title: 'Redacción de Correos Electrónicos Profesionales',
              content: `<h2>Comunicación Efectiva por Correo Electrónico</h2>
              <p>En el lugar de trabajo digital actual, escribir correos electrónicos claros y profesionales es una habilidad esencial. Tu comunicación por correo electrónico a menudo determina cómo los colegas y clientes perciben tu profesionalismo.</p>
              <h3>Estructura y Frases para Correos</h3>
              <ul>
                <li><strong>Línea de asunto:</strong> Debe ser clara, concisa y específica, p.ej., "Solicitud de Reunión: Revisión del Presupuesto T3"</li>
                <li><strong>Saludo:</strong> "Estimado/a [Nombre]," (formal), "Hola [Nombre]," (semi-formal), "Hola [Nombre]," (informal)</li>
                <li><strong>Apertura:</strong> "Espero que este correo te encuentre bien.", "Te escribo con respecto a..."</li>
                <li><strong>Cuerpo:</strong> Mantén los párrafos cortos y enfocados en un solo tema cada uno</li>
                <li><strong>Cierre:</strong> "Gracias por tu consideración.", "Espero tu respuesta."</li>
                <li><strong>Despedida:</strong> "Saludos cordiales,", "Atentamente,", "Un cordial saludo,"</li>
              </ul>
              <p>Siempre revisa tus correos antes de enviarlos y considera tu tono. La comunicación escrita carece de entonación vocal, así que ten cuidado con el humor o el sarcasmo que podrían malinterpretarse.</p>`,
              notes: 'Recuerda adaptar tu estilo según tu relación con el destinatario.'
            },
            de: {
              title: 'Professionelle Geschäfts-E-Mails verfassen',
              content: `<h2>Effektive E-Mail-Kommunikation</h2>
              <p>In der heutigen digitalen Arbeitswelt ist das Verfassen klarer und professioneller E-Mails eine wesentliche Fähigkeit. Ihre E-Mail-Kommunikation prägt oft, wie Kollegen und Kunden Ihre Professionalität wahrnehmen.</p>
              <h3>E-Mail-Struktur und Phrasen</h3>
              <ul>
                <li><strong>Betreffzeile:</strong> Sollte klar, präzise und spezifisch sein, z.B. "Besprechungsanfrage: Q3-Budgetüberprüfung"</li>
                <li><strong>Anrede:</strong> "Sehr geehrte(r) [Name]," (formell), "Hallo [Name]," (halbformell), "Hi [Name]," (informell)</li>
                <li><strong>Einleitung:</strong> "Ich hoffe, diese E-Mail findet Sie wohlauf.", "Ich schreibe bezüglich..."</li>
                <li><strong>Hauptteil:</strong> Halten Sie Absätze kurz und konzentrieren Sie sich in jedem Absatz auf ein Thema</li>
                <li><strong>Abschluss:</strong> "Vielen Dank für Ihre Berücksichtigung.", "Ich freue mich auf Ihre Antwort."</li>
                <li><strong>Grußformel:</strong> "Mit freundlichen Grüßen,", "Viele Grüße,", "Herzliche Grüße,"</li>
              </ul>
              <p>Überprüfen Sie Ihre E-Mails immer vor dem Senden und achten Sie auf Ihren Tonfall. Der schriftlichen Kommunikation fehlt die stimmliche Intonation, seien Sie daher vorsichtig mit Humor oder Sarkasmus, die falsch interpretiert werden könnten.</p>`,
              notes: 'Denken Sie daran, Ihren Stil an Ihre Beziehung zum Empfänger anzupassen.'
            }
          }
        }
      ],
      'classroom-vocabulary': [
        {
          slug: 'education-terminology',
          translations: {
            en: {
              title: 'Essential Classroom and Educational Vocabulary',
              content: `<h2>Key Terms for Educational Settings</h2>
              <p>Whether you're a student studying abroad or a teacher in a multilingual environment, understanding educational terminology is crucial for effective communication in academic settings.</p>
              <h3>Common Classroom Vocabulary</h3>
              <ul>
                <li><strong>Classroom items:</strong> whiteboard, chalkboard, projector, textbook, notebook, assignment, handout</li>
                <li><strong>People:</strong> teacher, professor, lecturer, student, classmate, tutor, principal, dean</li>
                <li><strong>Activities:</strong> lecture, discussion, group work, presentation, exam, test, quiz, homework</li>
                <li><strong>Academic terms:</strong> syllabus, curriculum, semester, course, credit, major, minor, degree, thesis</li>
                <li><strong>Instructions:</strong> "Open your books to page...", "Work in pairs", "Raise your hand", "Submit your assignment by..."</li>
              </ul>
              <p>Being familiar with these terms will help you navigate educational environments more confidently and ensure you understand instructions and expectations.</p>`,
              notes: 'Educational systems vary between countries, so some terms may have different meanings depending on the context.'
            },
            ar: {
              title: 'مفردات أساسية للفصل الدراسي والتعليم',
              content: `<h2>مصطلحات أساسية للبيئات التعليمية</h2>
              <p>سواء كنت طالبًا تدرس في الخارج أو معلمًا في بيئة متعددة اللغات، فإن فهم المصطلحات التعليمية أمر بالغ الأهمية للتواصل الفعال في الأوساط الأكاديمية.</p>
              <h3>مفردات الفصل الدراسي الشائعة</h3>
              <ul>
                <li><strong>أدوات الفصل الدراسي:</strong> السبورة البيضاء، السبورة، جهاز العرض، الكتاب المدرسي، الدفتر، الواجب، النشرة</li>
                <li><strong>الأشخاص:</strong> المعلم، الأستاذ، المحاضر، الطالب، زميل الدراسة، المدرس الخصوصي، المدير، العميد</li>
                <li><strong>الأنشطة:</strong> المحاضرة، المناقشة، العمل الجماعي، العرض التقديمي، الامتحان، الاختبار، الاختبار القصير، الواجب المنزلي</li>
                <li><strong>المصطلحات الأكاديمية:</strong> المنهج الدراسي، المناهج، الفصل الدراسي، المقرر، الساعة المعتمدة، التخصص الرئيسي، التخصص الفرعي، الدرجة العلمية، الأطروحة</li>
                <li><strong>التعليمات:</strong> "افتحوا كتبكم على صفحة..."، "اعملوا في أزواج"، "ارفعوا أيديكم"، "قدموا واجبكم بحلول..."</li>
              </ul>
              <p>إن الإلمام بهذه المصطلحات سيساعدك على التنقل في البيئات التعليمية بثقة أكبر وضمان فهمك للتعليمات والتوقعات.</p>`,
              notes: 'تختلف الأنظمة التعليمية بين البلدان، لذا قد يكون لبعض المصطلحات معاني مختلفة حسب السياق.'
            },
            fr: {
              title: 'Vocabulaire Essentiel pour la Classe et l\'Éducation',
              content: `<h2>Termes Clés pour les Environnements Éducatifs</h2>
              <p>Que vous soyez un étudiant qui étudie à l'étranger ou un enseignant dans un environnement multilingue, comprendre la terminologie éducative est crucial pour une communication efficace dans les milieux académiques.</p>
              <h3>Vocabulaire Courant de Classe</h3>
              <ul>
                <li><strong>Éléments de classe:</strong> tableau blanc, tableau noir, projecteur, manuel, cahier, devoir, polycopié</li>
                <li><strong>Personnes:</strong> enseignant, professeur, conférencier, étudiant, camarade de classe, tuteur, directeur, doyen</li>
                <li><strong>Activités:</strong> cours magistral, discussion, travail de groupe, présentation, examen, test, quiz, devoirs</li>
                <li><strong>Termes académiques:</strong> syllabus, programme, semestre, cours, crédit, majeure, mineure, diplôme, thèse</li>
                <li><strong>Instructions:</strong> "Ouvrez vos livres à la page...", "Travaillez en binômes", "Levez la main", "Remettez votre devoir avant..."</li>
              </ul>
              <p>Être familier avec ces termes vous aidera à naviguer dans les environnements éducatifs avec plus d'assurance et à vous assurer que vous comprenez les instructions et les attentes.</p>`,
              notes: 'Les systèmes éducatifs varient d\'un pays à l\'autre, donc certains termes peuvent avoir des significations différentes selon le contexte.'
            },
            es: {
              title: 'Vocabulario Esencial para el Aula y la Educación',
              content: `<h2>Términos Clave para Entornos Educativos</h2>
              <p>Ya seas un estudiante estudiando en el extranjero o un profesor en un entorno multilingüe, comprender la terminología educativa es crucial para una comunicación efectiva en entornos académicos.</p>
              <h3>Vocabulario Común del Aula</h3>
              <ul>
                <li><strong>Elementos del aula:</strong> pizarra blanca, pizarra, proyector, libro de texto, cuaderno, tarea, material impreso</li>
                <li><strong>Personas:</strong> maestro, profesor, conferencista, estudiante, compañero de clase, tutor, director, decano</li>
                <li><strong>Actividades:</strong> clase magistral, discusión, trabajo en grupo, presentación, examen, prueba, cuestionario, deberes</li>
                <li><strong>Términos académicos:</strong> programa de estudios, currículo, semestre, curso, crédito, especialidad, subespecialidad, título, tesis</li>
                <li><strong>Instrucciones:</strong> "Abran sus libros en la página...", "Trabajen en parejas", "Levanten la mano", "Entreguen su tarea antes de..."</li>
              </ul>
              <p>Estar familiarizado con estos términos te ayudará a navegar por entornos educativos con más confianza y a asegurarte de que comprendes las instrucciones y expectativas.</p>`,
              notes: 'Los sistemas educativos varían entre países, por lo que algunos términos pueden tener diferentes significados dependiendo del contexto.'
            },
            de: {
              title: 'Wesentliches Vokabular für Klassenzimmer und Bildung',
              content: `<h2>Schlüsselbegriffe für Bildungsumgebungen</h2>
              <p>Ob Sie ein Student im Auslandsstudium oder ein Lehrer in einer mehrsprachigen Umgebung sind, das Verständnis der Bildungsterminologie ist entscheidend für eine effektive Kommunikation in akademischen Umgebungen.</p>
              <h3>Gebräuchliches Klassenzimmer-Vokabular</h3>
              <ul>
                <li><strong>Klassenzimmerelemente:</strong> Whiteboard, Tafel, Projektor, Lehrbuch, Notizbuch, Aufgabe, Handout</li>
                <li><strong>Personen:</strong> Lehrer, Professor, Dozent, Student, Klassenkamerad, Tutor, Schulleiter, Dekan</li>
                <li><strong>Aktivitäten:</strong> Vorlesung, Diskussion, Gruppenarbeit, Präsentation, Examen, Test, Quiz, Hausaufgaben</li>
                <li><strong>Akademische Begriffe:</strong> Lehrplan, Curriculum, Semester, Kurs, Credit, Hauptfach, Nebenfach, Abschluss, Thesis</li>
                <li><strong>Anweisungen:</strong> "Öffnen Sie Ihre Bücher auf Seite...", "Arbeiten Sie zu zweit", "Heben Sie die Hand", "Reichen Sie Ihre Aufgabe bis... ein"</li>
              </ul>
              <p>Die Vertrautheit mit diesen Begriffen wird Ihnen helfen, sich mit mehr Selbstvertrauen in Bildungsumgebungen zu bewegen und sicherzustellen, dass Sie Anweisungen und Erwartungen verstehen.</p>`,
              notes: 'Bildungssysteme variieren zwischen Ländern, daher können einige Begriffe je nach Kontext unterschiedliche Bedeutungen haben.'
            }
          }
        }
      ],
      'academic-writing': [
        {
          slug: 'research-paper-structure',
          translations: {
            en: {
              title: 'Structure and Language of Academic Research Papers',
              content: `<h2>Writing Effective Academic Papers</h2>
              <p>Academic writing requires a formal structure and specific language conventions that differ from everyday communication. Understanding these elements is essential for students and researchers.</p>
              <h3>Standard Research Paper Structure</h3>
              <ul>
                <li><strong>Abstract:</strong> A concise summary of the entire paper (150-250 words)</li>
                <li><strong>Introduction:</strong> Provides background, states the research question, and outlines the paper's structure</li>
                <li><strong>Literature Review:</strong> Examines existing research and identifies gaps in knowledge</li>
                <li><strong>Methodology:</strong> Explains how the research was conducted</li>
                <li><strong>Results/Findings:</strong> Presents data and analysis without interpretation</li>
                <li><strong>Discussion:</strong> Interprets results, connects to existing literature, and addresses limitations</li>
                <li><strong>Conclusion:</strong> Summarizes key findings and suggests further research</li>
                <li><strong>References:</strong> Lists all sources cited in the paper</li>
              </ul>
              <h3>Academic Language Features</h3>
              <ul>
                <li>Use formal language and avoid contractions (write "do not" instead of "don't")</li>
                <li>Be precise and specific with terminology</li>
                <li>Use evidence-based arguments rather than opinions</li>
                <li>Write in the third person and avoid personal pronouns when possible</li>
                <li>Use appropriate transition words to connect ideas (furthermore, however, nevertheless)</li>
              </ul>
              <p>Remember that academic writing prioritizes clarity, precision, and evidence-based argumentation.</p>`,
              notes: 'Academic writing styles vary slightly between disciplines. Consult specific style guides (APA, MLA, Chicago) for detailed formatting requirements.'
            },
            ar: {
              title: 'هيكل ولغة الأوراق البحثية الأكاديمية',
              content: `<h2>كتابة الأوراق الأكاديمية الفعالة</h2>
              <p>تتطلب الكتابة الأكاديمية هيكلًا رسميًا واتفاقيات لغوية محددة تختلف عن التواصل اليومي. فهم هذه العناصر ضروري للطلاب والباحثين.</p>
              <h3>هيكل الورقة البحثية القياسي</h3>
              <ul>
                <li><strong>الملخص:</strong> ملخص موجز للورقة بأكملها (150-250 كلمة)</li>
                <li><strong>المقدمة:</strong> تقدم خلفية، وتحدد سؤال البحث، وتوضح هيكل الورقة</li>
                <li><strong>مراجعة الأدبيات:</strong> تفحص البحوث الموجودة وتحدد الفجوات في المعرفة</li>
                <li><strong>المنهجية:</strong> تشرح كيفية إجراء البحث</li>
                <li><strong>النتائج/الاكتشافات:</strong> تعرض البيانات والتحليل دون تفسير</li>
                <li><strong>المناقشة:</strong> تفسر النتائج، وتربطها بالأدبيات الموجودة، وتعالج القيود</li>
                <li><strong>الخاتمة:</strong> تلخص النتائج الرئيسية وتقترح مزيدًا من البحوث</li>
                <li><strong>المراجع:</strong> تسرد جميع المصادر المذكورة في الورقة</li>
              </ul>
              <h3>خصائص اللغة الأكاديمية</h3>
              <ul>
                <li>استخدم لغة رسمية وتجنب الاختصارات</li>
                <li>كن دقيقًا ومحددًا في المصطلحات</li>
                <li>استخدم الحجج القائمة على الأدلة بدلاً من الآراء</li>
                <li>اكتب بصيغة الغائب وتجنب الضمائر الشخصية عندما يكون ذلك ممكنًا</li>
                <li>استخدم كلمات انتقالية مناسبة لربط الأفكار (علاوة على ذلك، مع ذلك، ومع ذلك)</li>
              </ul>
              <p>تذكر أن الكتابة الأكاديمية تعطي الأولوية للوضوح والدقة والحجج القائمة على الأدلة.</p>`,
              notes: 'تختلف أساليب الكتابة الأكاديمية قليلاً بين التخصصات. راجع أدلة الأسلوب المحددة (APA، MLA، شيكاغو) لمتطلبات التنسيق التفصيلية.'
            },
            fr: {
              title: 'Structure et Langage des Articles de Recherche Académiques',
              content: `<h2>Rédaction d'Articles Académiques Efficaces</h2>
              <p>La rédaction académique nécessite une structure formelle et des conventions linguistiques spécifiques qui diffèrent de la communication quotidienne. Comprendre ces éléments est essentiel pour les étudiants et les chercheurs.</p>
              <h3>Structure Standard d'un Article de Recherche</h3>
              <ul>
                <li><strong>Résumé:</strong> Un résumé concis de l'ensemble de l'article (150-250 mots)</li>
                <li><strong>Introduction:</strong> Fournit le contexte, énonce la question de recherche et décrit la structure de l'article</li>
                <li><strong>Revue de Littérature:</strong> Examine les recherches existantes et identifie les lacunes dans les connaissances</li>
                <li><strong>Méthodologie:</strong> Explique comment la recherche a été menée</li>
                <li><strong>Résultats/Découvertes:</strong> Présente les données et l'analyse sans interprétation</li>
                <li><strong>Discussion:</strong> Interprète les résultats, les relie à la littérature existante et aborde les limitations</li>
                <li><strong>Conclusion:</strong> Résume les principales découvertes et suggère des recherches supplémentaires</li>
                <li><strong>Références:</strong> Liste toutes les sources citées dans l'article</li>
              </ul>
              <h3>Caractéristiques du Langage Académique</h3>
              <ul>
                <li>Utilisez un langage formel et évitez les contractions (écrivez "ne pas" au lieu de "n'pas")</li>
                <li>Soyez précis et spécifique avec la terminologie</li>
                <li>Utilisez des arguments fondés sur des preuves plutôt que des opinions</li>
                <li>Écrivez à la troisième personne et évitez les pronoms personnels lorsque c'est possible</li>
                <li>Utilisez des mots de transition appropriés pour relier les idées (en outre, cependant, néanmoins)</li>
              </ul>
              <p>N'oubliez pas que l'écriture académique privilégie la clarté, la précision et l'argumentation fondée sur des preuves.</p>`,
              notes: 'Les styles d\'écriture académique varient légèrement entre les disciplines. Consultez des guides de style spécifiques (APA, MLA, Chicago) pour les exigences de formatage détaillées.'
            },
            es: {
              title: 'Estructura y Lenguaje de los Trabajos de Investigación Académicos',
              content: `<h2>Redacción de Trabajos Académicos Efectivos</h2>
              <p>La escritura académica requiere una estructura formal y convenciones lingüísticas específicas que difieren de la comunicación cotidiana. Entender estos elementos es esencial para estudiantes e investigadores.</p>
              <h3>Estructura Estándar de un Trabajo de Investigación</h3>
              <ul>
                <li><strong>Resumen:</strong> Un sumario conciso de todo el trabajo (150-250 palabras)</li>
                <li><strong>Introducción:</strong> Proporciona antecedentes, establece la pregunta de investigación y esboza la estructura del trabajo</li>
                <li><strong>Revisión de Literatura:</strong> Examina investigaciones existentes e identifica vacíos en el conocimiento</li>
                <li><strong>Metodología:</strong> Explica cómo se realizó la investigación</li>
                <li><strong>Resultados/Hallazgos:</strong> Presenta datos y análisis sin interpretación</li>
                <li><strong>Discusión:</strong> Interpreta resultados, conecta con literatura existente y aborda limitaciones</li>
                <li><strong>Conclusión:</strong> Resume hallazgos clave y sugiere investigaciones futuras</li>
                <li><strong>Referencias:</strong> Lista todas las fuentes citadas en el trabajo</li>
              </ul>
              <h3>Características del Lenguaje Académico</h3>
              <ul>
                <li>Utiliza lenguaje formal y evita contracciones</li>
                <li>Sé preciso y específico con la terminología</li>
                <li>Usa argumentos basados en evidencia en lugar de opiniones</li>
                <li>Escribe en tercera persona y evita pronombres personales cuando sea posible</li>
                <li>Utiliza palabras de transición apropiadas para conectar ideas (además, sin embargo, no obstante)</li>
              </ul>
              <p>Recuerda que la escritura académica prioriza la claridad, la precisión y la argumentación basada en evidencia.</p>`,
              notes: 'Los estilos de escritura académica varían ligeramente entre disciplinas. Consulta guías de estilo específicas (APA, MLA, Chicago) para requisitos de formato detallados.'
            },
            de: {
              title: 'Struktur und Sprache akademischer Forschungsarbeiten',
              content: `<h2>Effektive akademische Aufsätze schreiben</h2>
              <p>Akademisches Schreiben erfordert eine formelle Struktur und spezifische Sprachkonventionen, die sich von der alltäglichen Kommunikation unterscheiden. Das Verständnis dieser Elemente ist für Studierende und Forscher unerlässlich.</p>
              <h3>Standardstruktur einer Forschungsarbeit</h3>
              <ul>
                <li><strong>Abstract:</strong> Eine prägnante Zusammenfassung der gesamten Arbeit (150-250 Wörter)</li>
                <li><strong>Einleitung:</strong> Liefert Hintergrund, formuliert die Forschungsfrage und skizziert die Struktur der Arbeit</li>
                <li><strong>Literaturübersicht:</strong> Untersucht bestehende Forschung und identifiziert Wissenslücken</li>
                <li><strong>Methodik:</strong> Erklärt, wie die Forschung durchgeführt wurde</li>
                <li><strong>Ergebnisse/Befunde:</strong> Präsentiert Daten und Analyse ohne Interpretation</li>
                <li><strong>Diskussion:</strong> Interpretiert Ergebnisse, verbindet sie mit bestehender Literatur und behandelt Einschränkungen</li>
                <li><strong>Fazit:</strong> Fasst wichtige Erkenntnisse zusammen und schlägt weitere Forschung vor</li>
                <li><strong>Literaturverzeichnis:</strong> Listet alle in der Arbeit zitierten Quellen auf</li>
              </ul>
              <h3>Merkmale akademischer Sprache</h3>
              <ul>
                <li>Verwenden Sie formelle Sprache und vermeiden Sie Kontraktionen</li>
                <li>Seien Sie präzise und spezifisch mit der Terminologie</li>
                <li>Verwenden Sie evidenzbasierte Argumente anstelle von Meinungen</li>
                <li>Schreiben Sie in der dritten Person und vermeiden Sie persönliche Pronomen, wenn möglich</li>
                <li>Verwenden Sie geeignete Übergangswörter, um Ideen zu verbinden (darüber hinaus, jedoch, dennoch)</li>
              </ul>
              <p>Denken Sie daran, dass akademisches Schreiben Klarheit, Präzision und evidenzbasierte Argumentation priorisiert.</p>`,
              notes: 'Akademische Schreibstile variieren leicht zwischen verschiedenen Disziplinen. Konsultieren Sie spezifische Stilrichtlinien (APA, MLA, Chicago) für detaillierte Formatierungsanforderungen.'
            }
          }
        }
      ],
      'greetings-and-introductions': [
        {
          slug: 'common-greetings',
          translations: {
            en: {
              title: 'Common Greetings in Different Languages',
              content: `<h2>Formal and Informal Greetings</h2>
              <p>Learning how to greet people is often the first step in learning a new language. Greetings vary between formal and informal contexts, and it's important to know which to use in different situations.</p>
              <h3>English Greetings</h3>
              <ul>
                <li><strong>Formal:</strong> "Hello", "Good morning/afternoon/evening"</li>
                <li><strong>Informal:</strong> "Hi", "Hey", "What's up?"</li>
              </ul>
              <p>In English-speaking countries, people often ask "How are you?" after a greeting, but this is usually just a formality rather than a genuine question about your wellbeing.</p>`,
              notes: 'Focus on the difference between formal and informal greetings.'
            },
            ar: {
              title: 'التحيات الشائعة بلغات مختلفة',
              content: `<h2>التحيات الرسمية وغير الرسمية</h2>
              <p>تعلم كيفية تحية الناس هي غالبًا الخطوة الأولى في تعلم لغة جديدة. تختلف التحيات بين السياقات الرسمية وغير الرسمية، ومن المهم معرفة أيها تستخدم في المواقف المختلفة.</p>
              <h3>التحيات باللغة العربية</h3>
              <ul>
                <li><strong>رسمي:</strong> "السلام عليكم"، "صباح الخير/مساء الخير"</li>
                <li><strong>غير رسمي:</strong> "مرحبا"، "أهلاً"، "كيفك؟"</li>
              </ul>
              <p>في البلدان الناطقة بالعربية، غالبًا ما يسأل الناس "كيف حالك؟" بعد التحية، ولكن هذا عادة مجرد إجراء شكلي وليس سؤالًا حقيقيًا عن صحتك.</p>`,
              notes: 'ركز على الفرق بين التحيات الرسمية وغير الرسمية.'
            },
            fr: {
              title: 'Salutations courantes dans différentes langues',
              content: `<h2>Salutations formelles et informelles</h2>
              <p>Apprendre à saluer les gens est souvent la première étape dans l'apprentissage d'une nouvelle langue. Les salutations varient entre les contextes formels et informels, et il est important de savoir lesquelles utiliser dans différentes situations.</p>
              <h3>Salutations en français</h3>
              <ul>
                <li><strong>Formel:</strong> "Bonjour", "Bonsoir"</li>
                <li><strong>Informel:</strong> "Salut", "Coucou", "Ça va?"</li>
              </ul>
              <p>Dans les pays francophones, les gens demandent souvent "Comment allez-vous?" ou "Comment ça va?" après une salutation, mais c'est généralement juste une formalité plutôt qu'une question sincère sur votre bien-être.</p>`,
              notes: 'Concentrez-vous sur la différence entre les salutations formelles et informelles.'
            },
            es: {
              title: 'Saludos comunes en diferentes idiomas',
              content: `<h2>Saludos formales e informales</h2>
              <p>Aprender a saludar a las personas suele ser el primer paso para aprender un nuevo idioma. Los saludos varían entre contextos formales e informales, y es importante saber cuál usar en diferentes situaciones.</p>
              <h3>Saludos en español</h3>
              <ul>
                <li><strong>Formal:</strong> "Buenos días/tardes/noches", "Hola, ¿cómo está usted?"</li>
                <li><strong>Informal:</strong> "Hola", "¿Qué tal?", "¿Qué pasa?"</li>
              </ul>
              <p>En los países de habla hispana, la gente suele preguntar "¿Cómo estás?" después de un saludo, pero esto suele ser solo una formalidad en lugar de una pregunta genuina sobre tu bienestar.</p>`,
              notes: 'Concéntrese en la diferencia entre saludos formales e informales.'
            },
            de: {
              title: 'Gängige Begrüßungen in verschiedenen Sprachen',
              content: `<h2>Formelle und informelle Begrüßungen</h2>
              <p>Das Erlernen von Begrüßungen ist oft der erste Schritt beim Erlernen einer neuen Sprache. Begrüßungen variieren zwischen formellen und informellen Kontexten, und es ist wichtig zu wissen, welche in verschiedenen Situationen zu verwenden sind.</p>
              <h3>Deutsche Begrüßungen</h3>
              <ul>
                <li><strong>Formell:</strong> "Guten Morgen/Tag/Abend", "Grüß Gott"</li>
                <li><strong>Informell:</strong> "Hallo", "Hi", "Na?"</li>
              </ul>
              <p>In deutschsprachigen Ländern fragen die Menschen oft "Wie geht es Ihnen?" oder "Wie geht's?" nach einer Begrüßung, aber dies ist normalerweise nur eine Formalität und keine echte Frage nach Ihrem Wohlbefinden.</p>`,
              notes: 'Konzentrieren Sie sich auf den Unterschied zwischen formellen und informellen Begrüßungen.'
            }
          }
        }
      ],
      'shopping-and-services': [
        {
          slug: 'bargaining-phrases',
          translations: {
            en: {
              title: 'Essential Bargaining Phrases for Markets',
              content: `<h2>The Art of Bargaining</h2>
              <p>In many countries, bargaining is an expected part of the shopping experience, especially in markets and small shops. Learning how to negotiate prices can not only save you money but also help you engage more deeply with the local culture.</p>
              <h3>Useful Bargaining Phrases in English</h3>
              <ul>
                <li>"How much is this?"</li>
                <li>"That's too expensive."</li>
                <li>"Can you give me a better price?"</li>
                <li>"I'll give you [amount] for it."</li>
                <li>"I'm sorry, that's more than I wanted to spend."</li>
                <li>"Can you come down a little?"</li>
              </ul>
              <p>Remember, bargaining is often a friendly interaction - keep it light and respectful, and don't be afraid to walk away if you can't agree on a price.</p>`,
              notes: 'Practice these phrases before visiting a local market.'
            },
            ar: {
              title: 'عبارات المساومة الأساسية للأسواق',
              content: `<h2>فن المساومة</h2>
              <p>في العديد من البلدان، تعتبر المساومة جزءًا متوقعًا من تجربة التسوق، خاصة في الأسواق والمتاجر الصغيرة. يمكن أن يساعدك تعلم كيفية التفاوض على الأسعار ليس فقط في توفير المال ولكن أيضًا في التفاعل بشكل أعمق مع الثقافة المحلية.</p>
              <h3>عبارات مساومة مفيدة باللغة العربية</h3>
              <ul>
                <li>"كم سعر هذا؟"</li>
                <li>"هذا غالي جداً."</li>
                <li>"هل يمكنك إعطائي سعراً أفضل؟"</li>
                <li>"سأعطيك [المبلغ] مقابل ذلك."</li>
                <li>"آسف، هذا أكثر مما أردت أن أنفق."</li>
                <li>"هل يمكنك تخفيض السعر قليلاً؟"</li>
              </ul>
              <p>تذكر، المساومة غالبًا ما تكون تفاعلاً ودياً - حافظ عليها خفيفة ومحترمة، ولا تخف من المغادرة إذا لم تتمكن من الاتفاق على سعر.</p>`,
              notes: 'تدرب على هذه العبارات قبل زيارة السوق المحلي.'
            },
            fr: {
              title: 'Phrases essentielles de marchandage pour les marchés',
              content: `<h2>L'art du marchandage</h2>
              <p>Dans de nombreux pays, le marchandage fait partie intégrante de l'expérience d'achat, notamment dans les marchés et les petites boutiques. Apprendre à négocier les prix peut non seulement vous faire économiser de l'argent, mais aussi vous aider à vous engager plus profondément dans la culture locale.</p>
              <h3>Phrases utiles de marchandage en français</h3>
              <ul>
                <li>"Combien ça coûte ?"</li>
                <li>"C'est trop cher."</li>
                <li>"Pouvez-vous me faire un meilleur prix ?"</li>
                <li>"Je vous en donne [montant]."</li>
                <li>"Désolé, c'est plus que ce que je voulais dépenser."</li>
                <li>"Pouvez-vous baisser un peu le prix ?"</li>
              </ul>
              <p>N'oubliez pas que le marchandage est souvent une interaction amicale - gardez-le léger et respectueux, et n'hésitez pas à partir si vous ne pouvez pas vous mettre d'accord sur un prix.</p>`,
              notes: 'Entraînez-vous à ces phrases avant de visiter un marché local.'
            },
            es: {
              title: 'Frases esenciales para regatear en mercados',
              content: `<h2>El arte de regatear</h2>
              <p>En muchos países, regatear es una parte esperada de la experiencia de compra, especialmente en mercados y pequeñas tiendas. Aprender a negociar precios no solo puede ahorrarte dinero, sino también ayudarte a involucrarte más profundamente con la cultura local.</p>
              <h3>Frases útiles para regatear en español</h3>
              <ul>
                <li>"¿Cuánto cuesta esto?"</li>
                <li>"Es demasiado caro."</li>
                <li>"¿Puede darme un mejor precio?"</li>
                <li>"Le daré [cantidad] por esto."</li>
                <li>"Lo siento, es más de lo que quería gastar."</li>
                <li>"¿Puede bajar un poco el precio?"</li>
              </ul>
              <p>Recuerda, regatear es a menudo una interacción amistosa - mantenlo ligero y respetuoso, y no tengas miedo de irte si no puedes acordar un precio.</p>`,
              notes: 'Practica estas frases antes de visitar un mercado local.'
            },
            de: {
              title: 'Wesentliche Feilsch-Phrasen für Märkte',
              content: `<h2>Die Kunst des Feilschens</h2>
              <p>In vielen Ländern ist das Feilschen ein erwarteter Teil des Einkaufserlebnisses, besonders auf Märkten und in kleinen Geschäften. Zu lernen, wie man über Preise verhandelt, kann Ihnen nicht nur Geld sparen, sondern Ihnen auch helfen, sich tiefer mit der lokalen Kultur auseinanderzusetzen.</p>
              <h3>Nützliche Feilsch-Phrasen auf Deutsch</h3>
              <ul>
                <li>"Wie viel kostet das?"</li>
                <li>"Das ist zu teuer."</li>
                <li>"Können Sie mir einen besseren Preis machen?"</li>
                <li>"Ich gebe Ihnen [Betrag] dafür."</li>
                <li>"Es tut mir leid, das ist mehr, als ich ausgeben wollte."</li>
                <li>"Können Sie mit dem Preis etwas heruntergehen?"</li>
              </ul>
              <p>Denken Sie daran, dass Feilschen oft eine freundliche Interaktion ist - halten Sie es leicht und respektvoll, und scheuen Sie sich nicht, wegzugehen, wenn Sie sich nicht auf einen Preis einigen können.</p>`,
              notes: 'Üben Sie diese Phrasen, bevor Sie einen lokalen Markt besuchen.'
            }
          }
        }        }
      ],
      'at-the-airport': [
        {
          slug: 'airport-navigation',
          translations: {
            en: {
              title: 'Navigating Airports: Essential Vocabulary',
              content: `<h2>Key Airport Terms</h2>
              <p>Airports can be confusing places, especially in a foreign country. Knowing the right vocabulary can help you find your way around more easily.</p>
              <h3>Important Airport Vocabulary</h3>
              <ul>
                <li><strong>Check-in counter:</strong> Where you register for your flight and drop off luggage</li>
                <li><strong>Boarding pass:</strong> Document that allows you to board the plane</li>
                <li><strong>Gate:</strong> Where you board your flight</li>
                <li><strong>Departure/Arrival board:</strong> Screens showing flight information</li>
                <li><strong>Security check:</strong> Where your bags are scanned</li>
                <li><strong>Customs:</strong> Where your documents and baggage may be checked when entering a country</li>
                <li><strong>Baggage claim:</strong> Where you collect your luggage after a flight</li>
              </ul>
              <p>When in doubt, don't hesitate to ask airport staff for directions. Most international airports have staff who speak multiple languages.</p>`,
              notes: 'Memorize these terms before your next international flight.'
            },
            ar: {
              title: 'التنقل في المطارات: المفردات الأساسية',
              content: `<h2>مصطلحات المطار الرئيسية</h2>
              <p>يمكن أن تكون المطارات أماكن مربكة، خاصة في بلد أجنبي. معرفة المفردات الصحيحة يمكن أن تساعدك في العثور على طريقك بسهولة أكبر.</p>
              <h3>مفردات المطار المهمة</h3>
              <ul>
                <li><strong>مكتب تسجيل الوصول:</strong> حيث تسجل لرحلتك وتترك الأمتعة</li>
                <li><strong>بطاقة الصعود:</strong> وثيقة تسمح لك بالصعود إلى الطائرة</li>
                <li><strong>البوابة:</strong> حيث تصعد إلى رحلتك</li>
                <li><strong>لوحة المغادرة/الوصول:</strong> شاشات تعرض معلومات الرحلة</li>
                <li><strong>فحص الأمن:</strong> حيث يتم فحص حقائبك</li>
                <li><strong>الجمارك:</strong> حيث قد يتم فحص وثائقك وأمتعتك عند دخول بلد ما</li>
                <li><strong>استلام الأمتعة:</strong> حيث تجمع أمتعتك بعد رحلة</li>
              </ul>
              <p>عند الشك، لا تتردد في طلب الاتجاهات من موظفي المطار. معظم المطارات الدولية لديها موظفين يتحدثون لغات متعددة.</p>`,
              notes: 'احفظ هذه المصطلحات قبل رحلتك الدولية القادمة.'
            },
            fr: {
              title: 'Naviguer dans les aéroports : Vocabulaire essentiel',
              content: `<h2>Termes aéroportuaires clés</h2>
              <p>Les aéroports peuvent être des endroits déroutants, surtout dans un pays étranger. Connaître le vocabulaire approprié peut vous aider à vous orienter plus facilement.</p>
              <h3>Vocabulaire aéroportuaire important</h3>
              <ul>
                <li><strong>Comptoir d'enregistrement :</strong> Où vous vous enregistrez pour votre vol et déposez vos bagages</li>
                <li><strong>Carte d'embarquement :</strong> Document qui vous permet de monter à bord de l'avion</li>
                <li><strong>Porte :</strong> Où vous embarquez pour votre vol</li>
                <li><strong>Tableau des départs/arrivées :</strong> Écrans affichant les informations de vol</li>
                <li><strong>Contrôle de sécurité :</strong> Où vos bagagessont scannés</li>
                <li><strong>Douane :</strong> Où vos documents et bagages peuvent être vérifiés à l'entrée d'un pays</li>
                <li><strong>Récupération des bagages :</strong> Où vous récupérez vos bagages après un vol</li>
              </ul>
              <p>En cas de doute, n'hésitez pas à demander des directions au personnel de l'aéroport. La plupart des aéroports internationaux ont du personnel qui parle plusieurs langues.</p>`,
              notes: 'Mémorisez ces termes avant votre prochain vol international.'
            },
            es: {
              title: 'Navegando por aeropuertos: Vocabulario esencial',
              content: `<h2>Términos clave de aeropuerto</h2>
              <p>Los aeropuertos pueden ser lugares confusos, especialmente en un país extranjero. Conocer el vocabulario adecuado puede ayudarte a orientarte más fácilmente.</p>
              <h3>Vocabulario importante de aeropuerto</h3>
              <ul>
                <li><strong>Mostrador de check-in:</strong> Donde te registras para tu vuelo y dejas el equipaje</li>
                <li><strong>Tarjeta de embarque:</strong> Documento que te permite subir al avión</li>
                <li><strong>Puerta:</strong> Donde abordas tu vuelo</li>
                <li><strong>Panel de salidas/llegadas:</strong> Pantallas que muestran información de vuelos</li>
                <li><strong>Control de seguridad:</strong> Donde se escanean tus maletas</li>
                <li><strong>Aduana:</strong> Donde pueden revisar tus documentos y equipaje al entrar a un país</li>
                <li><strong>Recogida de equipaje:</strong> Donde recoges tu equipaje después de un vuelo</li>
              </ul>
              <p>En caso de duda, no dudes en pedir indicaciones al personal del aeropuerto. La mayoría de los aeropuertos internacionales tienen personal que habla varios idiomas.</p>`,
              notes: 'Memoriza estos términos antes de tu próximo vuelo internacional.'
            },
            de: {
              title: 'Navigation auf Flughäfen: Wichtiger Wortschatz',
              content: `<h2>Wichtige Flughafenbegriffe</h2>
              <p>Flughäfen können verwirrende Orte sein, besonders in einem fremden Land. Der richtige Wortschatz kann Ihnen helfen, sich leichter zurechtzufinden.</p>
              <h3>Wichtiger Flughafen-Wortschatz</h3>
              <ul>
                <li><strong>Check-in-Schalter:</strong> Wo Sie sich für Ihren Flug anmelden und Gepäck aufgeben</li>
                <li><strong>Bordkarte:</strong> Dokument, das Ihnen erlaubt, das Flugzeug zu betreten</li>
                <li><strong>Gate:</strong> Wo Sie Ihren Flug besteigen</li>
                <li><strong>Abflug-/Ankunftstafel:</strong> Bildschirme mit Fluginformationen</li>
                <li><strong>Sicherheitskontrolle:</strong> Wo Ihr Gepäck gescannt wird</li>
                <li><strong>Zoll:</strong> Wo bei der Einreise in ein Land Ihre Dokumente und Ihr Gepäck überprüft werden können</li>
                <li><strong>Gepäckausgabe:</strong> Wo Sie Ihr Gepäck nach einem Flug abholen</li>
              </ul>
              <p>Im Zweifelsfall zögern Sie nicht, das Flughafenpersonal nach dem Weg zu fragen. Die meisten internationalen Flughäfen haben Personal, das mehrere Sprachen spricht.</p>`,
              notes: 'Merken Sie sich diese Begriffe vor Ihrem nächsten internationalen Flug.'
            }
          }
        }
      ],
      'public-transportation': [
        {
          slug: 'transportation-phrases',
          translations: {
            en: {
              title: 'Essential Phrases for Public Transportation',
              content: `<h2>Getting Around on Public Transport</h2>
              <p>Using public transportation is often the best way to experience a city like a local. It's usually cheaper than taxis and gives you a more authentic experience of daily life in a foreign country.</p>
              <h3>Key Phrases for Public Transportation in English</h3>
              <ul>
                <li>"Where is the nearest bus stop/train station/subway station?"</li>
                <li>"Does this bus/train go to [destination]?"</li>
                <li>"Which platform for [destination]?"</li>
                <li>"One ticket to [destination], please."</li>
                <li>"Is this seat taken?"</li>
                <li>"Excuse me, this is my stop."</li>
                <li>"Could you tell me when we reach [destination]?"</li>
              </ul>
              <p>It's always a good idea to have a map or a transportation app on your phone as a backup, particularly in cities where you don't speak the local language fluently.</p>`,
              notes: 'Practice these phrases before using public transport in a foreign country.'
            },
            ar: {
              title: 'العبارات الأساسية لوسائل النقل العام',
              content: `<h2>التنقل بوسائل النقل العام</h2>
              <p>استخدام وسائل النقل العام هو غالبًا أفضل طريقة لتجربة المدينة مثل السكان المحليين. عادة ما تكون أرخص من سيارات الأجرة وتمنحك تجربة أكثر أصالة للحياة اليومية في بلد أجنبي.</p>
              <h3>عبارات رئيسية لوسائل النقل العام باللغة العربية</h3>
              <ul>
                <li>"أين أقرب موقف حافلات/محطة قطار/محطة مترو؟"</li>
                <li>"هل تذهب هذه الحافلة/القطار إلى [الوجهة]؟"</li>
                <li>"أي رصيف لـ [الوجهة]؟"</li>
                <li>"تذكرة واحدة إلى [الوجهة]، من فضلك."</li>
                <li>"هل هذا المقعد مشغول؟"</li>
                <li>"عفواً، هذه محطتي."</li>
                <li>"هل يمكن أن تخبرني عندما نصل إلى [الوجهة]؟"</li>
              </ul>
              <p>من الجيد دائمًا أن يكون لديك خريطة أو تطبيق نقل على هاتفك كنسخة احتياطية، خاصة في المدن التي لا تتحدث فيها اللغة المحلية بطلاقة.</p>`,
              notes: 'تدرب على هذه العبارات قبل استخدام وسائل النقل العام في بلد أجنبي.'
            },
            fr: {
              title: 'Phrases essentielles pour les transports en commun',
              content: `<h2>Se déplacer en transports en commun</h2>
              <p>Utiliser les transports en commun est souvent le meilleur moyen de vivre une ville comme un local. C'est généralement moins cher que les taxis et vous donne une expérience plus authentique de la vie quotidienne dans un pays étranger.</p>
              <h3>Phrases clés pour les transports en commun en français</h3>
              <ul>
                <li>"Où se trouve l'arrêt de bus/la gare/la station de métro la plus proche ?"</li>
                <li>"Est-ce que ce bus/train va à [destination] ?"</li>
                <li>"Quel quai pour [destination] ?"</li>
                <li>"Un billet pour [destination], s'il vous plaît."</li>
                <li>"Cette place est-elle prise ?"</li>
                <li>"Excusez-moi, c'est mon arrêt."</li>
                <li>"Pourriez-vous me dire quand nous arrivons à [destination] ?"</li>
              </ul>
              <p>C'est toujours une bonne idée d'avoir une carte ou une application de transport sur votre téléphone en secours, particulièrement dans les villes où vous ne parlez pas couramment la langue locale.</p>`,
              notes: 'Entraînez-vous à ces phrases avant d\'utiliser les transports en commun dans un pays étranger.'
            },
            es: {
              title: 'Frases esenciales para el transporte público',
              content: `<h2>Moverse en transporte público</h2>
              <p>Usar el transporte público suele ser la mejor manera de experimentar una ciudad como un local. Generalmente es más barato que los taxis y te da una experiencia más auténtica de la vida diaria en un país extranjero.</p>
              <h3>Frases clave para el transporte público en español</h3>
              <ul>
                <li>"¿Dónde está la parada de autobús/estación de tren/estación de metro más cercana?"</li>
                <li>"¿Este autobús/tren va a [destino]?"</li>
                <li>"¿Qué andén para [destino]?"</li>
                <li>"Un billete a [destino], por favor."</li>
                <li>"¿Está ocupado este asiento?"</li>
                <li>"Perdón, esta es mi parada."</li>
                <li>"¿Podría avisarme cuando lleguemos a [destino]?"</li>
              </ul>
              <p>Siempre es buena idea tener un mapa o una aplicación de transporte en tu teléfono como respaldo, especialmente en ciudades donde no hablas el idioma local con fluidez.</p>`,
              notes: 'Practica estas frases antes de usar el transporte público en un país extranjero.'
            },
            de: {
              title: 'Wesentliche Redewendungen für öffentliche Verkehrsmittel',
              content: `<h2>Unterwegs mit öffentlichen Verkehrsmitteln</h2>
              <p>Die Nutzung öffentlicher Verkehrsmittel ist oft der beste Weg, eine Stadt wie ein Einheimischer zu erleben. Es ist in der Regel billiger als Taxis und gibt Ihnen ein authentischeres Erlebnis des Alltags in einem fremden Land.</p>
              <h3>Schlüsselphrasen für öffentliche Verkehrsmittel auf Deutsch</h3>
              <ul>
                <li>"Wo ist die nächste Bushaltestelle/der nächste Bahnhof/die nächste U-Bahn-Station?"</li>
                <li>"Fährt dieser Bus/Zug nach [Ziel]?"</li>
                <li>"Welcher Bahnsteig für [Ziel]?"</li>
                <li>"Eine Fahrkarte nach [Ziel], bitte."</li>
                <li>"Ist dieser Platz besetzt?"</li>
                <li>"Entschuldigung, das ist meine Haltestelle."</li>
                <li>"Könnten Sie mir sagen, wenn wir [Ziel] erreichen?"</li>
              </ul>
              <p>Es ist immer eine gute Idee, eine Karte oder eine Verkehrs-App auf Ihrem Telefon als Backup zu haben, besonders in Städten, in denen Sie die Landessprache nicht fließend sprechen.</p>`,
              notes: 'Üben Sie diese Sätze, bevor Sie öffentliche Verkehrsmittel in einem fremden Land benutzen.'
            }
          }
        }
      ],
      'ordering-at-restaurants': [
        {
          slug: 'restaurant-phrases',
          translations: {
            en: {
              title: 'How to Order Food in a Restaurant',
              content: `<h2>Essential Restaurant Phrases</h2>
              <p>Eating out is one of the great pleasures of traveling, but it can be intimidating if you don't speak the local language. These phrases will help you navigate restaurants with confidence.</p>
              <h3>Useful Phrases for Restaurants in English</h3>
              <ul>
                <li>"A table for [number], please."</li>
                <li>"Could I see the menu, please?"</li>
                <li>"What do you recommend?"</li>
                <li>"I'd like to order ____."</li>
                <li>"I have a food allergy to ____."</li>
                <li>"Could we have the bill/check, please?"</li>
                <li>"Does the price include service?"</li>
              </ul>
              <p>In many countries, tipping practices differ. It's a good idea to research local customs before dining out so you know whether to tip and how much is appropriate.</p>`,
              notes: 'Learn these phrases to order confidently when traveling abroad.'
            },
            ar: {
              title: 'كيفية طلب الطعام في مطعم',
              content: `<h2>عبارات المطعم الأساسية</h2>
              <p>تناول الطعام في الخارج هو من أعظم متع السفر، ولكنه قد يكون مخيفًا إذا كنت لا تتحدث اللغة المحلية. ستساعدك هذه العبارات على التنقل في المطاعم بثقة.</p>
              <h3>عبارات مفيدة للمطاعم باللغة العربية</h3>
              <ul>
                <li>"طاولة لـ [عدد]، من فضلك."</li>
                <li>"هل يمكنني رؤية القائمة، من فضلك؟"</li>
                <li>"ماذا توصي؟"</li>
                <li>"أود أن أطلب ____."</li>
                <li>"لدي حساسية غذائية من ____."</li>
                <li>"هل يمكننا الحصول على الفاتورة، من فضلك؟"</li>
                <li>"هل السعر يشمل الخدمة؟"</li>
              </ul>
              <p>في العديد من البلدان، تختلف ممارسات إعطاء البقشيش. من الجيد أن تبحث في العادات المحلية قبل تناول الطعام في الخارج حتى تعرف ما إذا كان عليك إعطاء البقشيش وكم هو مناسب.</p>`,
              notes: 'تعلم هذه العبارات للطلب بثقة عند السفر إلى الخارج.'
            },
            fr: {
              title: 'Comment commander dans un restaurant',
              content: `<h2>Phrases essentielles au restaurant</h2>
              <p>Manger au restaurant est l'un des grands plaisirs du voyage, mais cela peut être intimidant si vous ne parlez pas la langue locale. Ces phrases vous aideront à naviguer dans les restaurants en toute confiance.</p>
              <h3>Phrases utiles pour les restaurants en français</h3>
              <ul>
                <li>"Une table pour [nombre], s'il vous plaît."</li>
                <li>"Puis-je voir le menu, s'il vous plaît ?"</li>
                <li>"Que recommandez-vous ?"</li>
                <li>"Je voudrais commander ____."</li>
                <li>"J'ai une allergie alimentaire à ____."</li>
                <li>"Pourrions-nous avoir l'addition, s'il vous plaît ?"</li>
                <li>"Le prix comprend-il le service ?"</li>
              </ul>
              <p>Dans de nombreux pays, les pratiques de pourboire diffèrent. C'est une bonne idée de se renseigner sur les coutumes locales avant de dîner afin de savoir s'il faut laisser un pourboire et combien est approprié.</p>`,
              notes: 'Apprenez ces phrases pour commander avec confiance lors de voyages à l\'étranger.'
            },
            es: {
              title: 'Cómo pedir comida en un restaurante',
              content: `<h2>Frases esenciales para restaurantes</h2>
              <p>Comer fuera es uno de los grandes placeres de viajar, pero puede ser intimidante si no hablas el idioma local. Estas frases te ayudarán a navegar por los restaurantes con confianza.</p>
              <h3>Frases útiles para restaurantes en español</h3>
              <ul>
                <li>"Una mesa para [número], por favor."</li>
                <li>"¿Podría ver el menú, por favor?"</li>
                <li>"¿Qué recomienda?"</li>
                <li>"Me gustaría pedir ____."</li>
                <li>"Tengo alergia alimentaria a ____."</li>
                <li>"¿Podríamos tener la cuenta, por favor?"</li>
                <li>"¿El precio incluye el servicio?"</li>
              </ul>
              <p>En muchos países, las prácticas de propina difieren. Es una buena idea investigar las costumbres locales antes de salir a comer para saber si debes dejar propina y cuánto es apropiado.</p>`,
              notes: 'Aprende estas frases para pedir con confianza cuando viajes al extranjero.'
            },
            de: {
              title: 'Wie man in einem Restaurant bestellt',
              content: `<h2>Wichtige Restaurant-Sätze</h2>
              <p>Auswärts essen zu gehen ist eines der großen Vergnügen des Reisens, kann aber einschüchternd sein, wenn Sie die lokale Sprache nicht sprechen. Diese Sätze helfen Ihnen, sich mit Selbstvertrauen in Restaurants zurechtzufinden.</p>
              <h3>Nützliche Sätze für Restaurants auf Deutsch</h3>
              <ul>
                <li>"Einen Tisch für [Anzahl], bitte."</li>
                <li>"Könnte ich bitte die Speisekarte sehen?"</li>
                <li>"Was empfehlen Sie?"</li>
                <li>"Ich möchte ____ bestellen."</li>
                <li>"Ich habe eine Lebensmittelallergie gegen ____."</li>
                <li>"Könnten wir bitte die Rechnung haben?"</li>
                <li>"Ist der Service im Preis inbegriffen?"</li>
              </ul>
              <p>In vielen Ländern unterscheiden sich die Trinkgeldpraktiken. Es ist eine gute Idee, sich vor dem Essen über lokale Gebräuche zu informieren, damit Sie wissen, ob und wie viel Trinkgeld angemessen ist.</p>`,
              notes: 'Lernen Sie diese Sätze, um bei Reisen ins Ausland selbstbewusst zu bestellen.'
            }
          }
        }
      ],
      'popular-dishes': [
        {
          slug: 'international-cuisine',
          translations: {
            en: {
              title: 'Popular Dishes Around the World',
              content: `<h2>Global Cuisine Guide</h2>
              <p>One of the best ways to experience a culture is through its food. Here's a brief guide to some iconic dishes from around the world that you might want to try during your travels.</p>
              <h3>Iconic International Dishes</h3>
              <ul>
                <li><strong>Italy:</strong> Authentic pizza, pasta carbonara, risotto</li>
                <li><strong>Japan:</strong> Sushi, ramen, tempura</li>
                <li><strong>India:</strong> Curry, tandoori chicken, masala dosa</li>
                <li><strong>Mexico:</strong> Tacos, mole poblano, chiles en nogada</li>
                <li><strong>Morocco:</strong> Tagine, couscous, pastilla</li>
                <li><strong>Thailand:</strong> Pad Thai, green curry, tom yum soup</li>
                <li><strong>France:</strong> Croissants, coq au vin, bouillabaisse</li>
              </ul>
              <p>When trying new cuisine, remember that authentic dishes may taste different from their international adaptations. Be adventurous, but also be aware of your own dietary restrictions.</p>`,
              notes: 'Research local specialties before your next trip to enhance your culinary experience.'
            },
            ar: {
              title: 'الأطباق الشعبية حول العالم',
              content: `<h2>دليل المطبخ العالمي</h2>
              <p>إحدى أفضل الطرق لتجربة ثقافة ما هي من خلال طعامها. إليك دليلًا موجزًا لبعض الأطباق الشهيرة من جميع أنحاء العالم والتي قد ترغب في تجربتها أثناء سفرك.</p>
              <h3>أطباق دولية شهيرة</h3>
              <ul>
                <li><strong>إيطاليا:</strong> البيتزا الأصلية، باستا كاربونارا، ريزوتو</li>
                <li><strong>اليابان:</strong> السوشي، الرامن، التمبورا</li>
                <li><strong>الهند:</strong> الكاري، دجاج تندوري، ماسالا دوسا</li>
                <li><strong>المكسيك:</strong> التاكو، مولي بوبلانو، تشيليز إن نوغادا</li>
                <li><strong>المغرب:</strong> الطاجين، الكسكس، البسطيلة</li>
                <li><strong>تايلاند:</strong> باد تاي، الكاري الأخضر، شوربة توم يوم</li>
                <li><strong>فرنسا:</strong> الكرواسان، كوك أو فان، بويابيس</li>
              </ul>
              <p>عند تجربة مطبخ جديد، تذكر أن الأطباق الأصلية قد تذوق مختلفة عن التكييفات الدولية الخاصة بها. كن مغامرًا، ولكن كن أيضًا على دراية بقيود النظام الغذائي الخاص بك.</p>`,
              notes: 'ابحث عن التخصصات المحلية قبل رحلتك القادمة لتعزيز تجربتك الطهي.'
            },
            fr: {
              title: 'Plats populaires à travers le monde',
              content: `<h2>Guide de la cuisine mondiale</h2>
              <p>L'une des meilleures façons de découvrir une culture est à travers sa nourriture. Voici un bref guide de quelques plats emblématiques du monde entier que vous pourriez vouloir essayer lors de vos voyages.</p>
              <h3>Plats internationaux emblématiques</h3>
              <ul>
                <li><strong>Italie :</strong> Pizza authentique, pâtes carbonara, risotto</li>
                <li><strong>Japon :</strong> Sushi, ramen, tempura</li>
                <li><strong>Inde :</strong> Curry, poulet tandoori, masala dosa</li>
                <li><strong>Mexique :</strong> Tacos, mole poblano, chiles en nogada</li>
                <li><strong>Maroc :</strong> Tajine, couscous, pastilla</li>
                <li><strong>Thaïlande :</strong> Pad Thaï, curry vert, soupe tom yum</li>
                <li><strong>France :</strong> Croissants, coq au vin, bouillabaisse</li>
              </ul>
              <p>Lorsque vous essayez une nouvelle cuisine, n'oubliez pas que les plats authentiques peuvent avoir un goût différent de leurs adaptations internationales. Soyez aventureux, mais soyez également conscient de vos propres restrictions alimentaires.</p>`,
              notes: 'Recherchez les spécialités locales avant votre prochain voyage pour améliorer votre expérience culinaire.'
            },
            es: {
              title: 'Platos populares alrededor del mundo',
              content: `<h2>Guía de cocina global</h2>
              <p>Una de las mejores maneras de experimentar una cultura es a través de su comida. Aquí hay una breve guía de algunos platos icónicos de todo el mundo que quizás quieras probar durante tus viajes.</p>
              <h3>Platos internacionales icónicos</h3>
              <ul>
                <li><strong>Italia:</strong> Pizza auténtica, pasta carbonara, risotto</li>
                <li><strong>Japón:</strong> Sushi, ramen, tempura</li>
                <li><strong>India:</strong> Curry, pollo tandoori, masala dosa</li>
                <li><strong>México:</strong> Tacos, mole poblano, chiles en nogada</li>
                <li><strong>Marruecos:</strong> Tajín, cuscús, pastilla</li>
                <li><strong>Tailandia:</strong> Pad Thai, curry verde, sopa tom yum</li>
                <li><strong>Francia:</strong> Croissants, coq au vin, bullabesa</li>
              </ul>
              <p>Al probar nueva cocina, recuerda que los platos auténticos pueden saber diferente a sus adaptaciones internacionales. Sé aventurero, pero también sé consciente de tus propias restricciones dietéticas.</p>`,
              notes: 'Investiga especialidades locales antes de tu próximo viaje para mejorar tu experiencia culinaria.'
            },
            de: {
              title: 'Beliebte Gerichte aus aller Welt',
              content: `<h2>Globaler Küchenführer</h2>
              <p>Eine der besten Möglichkeiten, eine Kultur zu erleben, ist durch ihre Speisen. Hier ist ein kurzer Leitfaden zu einigen ikonischen Gerichten aus aller Welt, die Sie auf Ihren Reisen probieren möchten.</p>
              <h3>Ikonische internationale Gerichte</h3>
              <ul>
                <li><strong>Italien:</strong> Authentische Pizza, Pasta Carbonara, Risotto</li>
                <li><strong>Japan:</strong> Sushi, Ramen, Tempura</li>
                <li><strong>Indien:</strong> Curry, Tandoori-Huhn, Masala Dosa</li>
                <li><strong>Mexiko:</strong> Tacos, Mole Poblano, Chiles en Nogada</li>
                <li><strong>Marokko:</strong> Tajine, Couscous, Pastilla</li>
                <li><strong>Thailand:</strong> Pad Thai, grünes Curry, Tom Yum Suppe</li>
                <li><strong>Frankreich:</strong> Croissants, Coq au Vin, Bouillabaisse</li>
              </ul>
              <p>Beim Ausprobieren neuer Küche sollten Sie daran denken, dass authentische Gerichte anders schmecken können als ihre internationalen Adaptionen. Seien Sie abenteuerlustig, aber achten Sie auch auf Ihre eigenen Ernährungseinschränkungen.</p>`,
              notes: 'Recherchieren Sie lokale Spezialitäten vor Ihrer nächsten Reise, um Ihr kulinarisches Erlebnis zu verbessern.'
            }
          }
        }
      ],
      'holidays-and-celebrations': [
        {
          slug: 'global-holidays',
          translations: {
            en: {
              title: 'Major Holidays Around the World',
              content: `<h2>Global Celebrations</h2>
              <p>Holidays and festivals provide a wonderful window into a culture's values, history, and traditions. Here's an overview of some major celebrations around the world.</p>
              <h3>Notable Holidays by Country/Region</h3>
              <ul>
                <li><strong>Chinese New Year:</strong> The most important holiday in Chinese culture, marking the start of the lunar new year with family reunions, special meals, and red decorations for good luck.</li>
                <li><strong>Diwali (India):</strong> The festival of lights celebrated by Hindus, Jains, and Sikhs, symbolizing the victory of light over darkness with lamps, fireworks, and sweets.</li>
                <li><strong>Ramadan & Eid al-Fitr (Islamic):</strong> A month of fasting followed by a feast celebration, emphasizing spiritual reflection and community.</li>
                <li><strong>Carnival (Brazil, Venice, New Orleans):</strong> Pre-Lenten festivities featuring parades, music, dancing, and elaborate costumes.</li>
                <li><strong>Thanksgiving (USA, Canada):</strong> A harvest festival celebrating gratitude with family gatherings and traditional foods.</li>
              </ul>
              <p>If you're traveling during a major local holiday, research in advance as it may affect business hours, transportation, and accommodation availability. However, it can also provide unique cultural experiences that aren't available at other times.</p>`,
              notes: 'Consider planning a trip to coincide with a local festival for a more immersive cultural experience.'
            },
            ar: {
              title: 'الأعياد الرئيسية حول العالم',
              content: `<h2>الاحتفالات العالمية</h2>
              <p>توفر الأعياد والمهرجانات نافذة رائعة على قيم الثقافة وتاريخها وتقاليدها. إليك نظرة عامة على بعض الاحتفالات الرئيسية حول العالم.</p>
              <h3>أعياد مشهورة حسب البلد/المنطقة</h3>
              <ul>
                <li><strong>رأس السنة الصينية:</strong> العيد الأكثر أهمية في الثقافة الصينية، ويميز بداية السنة القمرية الجديدة بلقاءات عائلية ووجبات خاصة وزينة حمراء للحظ الجيد.</li>
                <li><strong>ديوالي (الهند):</strong> مهرجان الأنوار الذي يحتفل به الهندوس والجاينيين والسيخ، ويرمز إلى انتصار النور على الظلمة بالمصابيح والألعاب النارية والحلويات.</li>
                <li><strong>رمضان وعيد الفطر (الإسلامي):</strong> شهر من الصيام يتبعه احتفال العيد، مع التركيز على التأمل الروحي والمجتمع.</li>
                <li><strong>الكرنفال (البرازيل، البندقية، نيو أورليانز):</strong> احتفالات ما قبل الصوم الكبير تتميز بالمواكب والموسيقى والرقص والأزياء المتقنة.</li>
                <li><strong>عيد الشكر (الولايات المتحدة، كندا):</strong> مهرجان الحصاد يحتفل بالامتنان مع التجمعات العائلية والأطعمة التقليدية.</li>
              </ul>
              <p>إذا كنت مسافرًا خلال عطلة محلية رئيسية، ابحث مسبقًا لأنها قد تؤثر على ساعات العمل والنقل وتوافر السكن. ومع ذلك، يمكن أن توفر أيضًا تجارب ثقافية فريدة غير متاحة في أوقات أخرى.</p>`,
              notes: 'فكر في التخطيط لرحلة لتتزامن مع مهرجان محلي للحصول على تجربة ثقافية أكثر شمولاً.'
            },
            fr: {
              title: 'Grandes fêtes à travers le monde',
              content: `<h2>Célébrations mondiales</h2>
              <p>Les jours fériés et les festivals offrent une merveilleuse fenêtre sur les valeurs, l'histoire et les traditions d'une culture. Voici un aperçu de quelques célébrations majeures à travers le monde.</p>
              <h3>Fêtes notables par pays/région</h3>
              <ul>
                <li><strong>Nouvel An chinois :</strong> La fête la plus importante dans la culture chinoise, marquant le début de la nouvelle année lunaire avec des réunions familiales, des repas spéciaux et des décorations rouges pour la chance.</li>
                <li><strong>Diwali (Inde) :</strong> La fête des lumières célébrée par les hindous, les jaïns et les sikhs, symbolisant la victoire de la lumière sur l'obscurité avec des lampes, des feux d'artifice et des sucreries.</li>
                <li><strong>Ramadan & Aïd al-Fitr (Islamique) :</strong> Un mois de jeûne suivi d'une fête, mettant l'accent sur la réflexion spirituelle et la communauté.</li>
                <li><strong>Carnaval (Brésil, Venise, Nouvelle-Orléans) :</strong> Festivités précédant le Carême avec des défilés, de la musique, de la danse et des costumes élaborés.</li>
                <li><strong>Action de grâce (États-Unis, Canada) :</strong> Une fête des récoltes célébrant la gratitude avec des rassemblements familiaux et des aliments traditionnels.</li>
              </ul>
              <p>Si vous voyagez pendant une fête locale importante, faites des recherches à l'avance car cela peut affecter les heures d'ouverture, les transports et la disponibilité des hébergements. Cependant, cela peut aussi offrir des expériences culturelles uniques qui ne sont pas disponibles à d'autres moments.</p>`,
              notes: 'Envisagez de planifier un voyage pour coïncider avec un festival local pour une expérience culturelle plus immersive.'
            },
            es: {
              title: 'Festividades principales alrededor del mundo',
              content: `<h2>Celebraciones globales</h2>
              <p>Las fiestas y festivales proporcionan una maravillosa ventana a los valores, la historia y las tradiciones de una cultura. Aquí hay una visión general de algunas celebraciones importantes en todo el mundo.</p>
              <h3>Festividades notables por país/región</h3>
              <ul>
                <li><strong>Año Nuevo Chino:</strong> La festividad más importante en la cultura china, marcando el inicio del nuevo año lunar con reuniones familiares, comidas especiales y decoraciones rojas para la buena suerte.</li>
                <li><strong>Diwali (India):</strong> El festival de las luces celebrado por hindúes, jainistas y sijs, simbolizando la victoria de la luz sobre la oscuridad con lámparas, fuegos artificiales y dulces.</li>
                <li><strong>Ramadán y Eid al-Fitr (Islámico):</strong> Un mes de ayuno seguido de una celebración festiva, enfatizando la reflexión espiritual y la comunidad.</li>
                <li><strong>Carnaval (Brasil, Venecia, Nueva Orleans):</strong> Festividades previas a la Cuaresma con desfiles, música, baile y elaborados disfraces.</li>
                <li><strong>Acción de Gracias (EE.UU., Canadá):</strong> Una fiesta de la cosecha que celebra la gratitud con reuniones familiares y comidas tradicionales.</li>
              </ul>
              <p>Si viajas durante una festividad local importante, investiga con anticipación ya que puede afectar los horarios comerciales, el transporte y la disponibilidad de alojamiento. Sin embargo, también puede proporcionar experiencias culturales únicas que no están disponibles en otros momentos.</p>`,
              notes: 'Considera planificar un viaje para que coincida con un festival local para una experiencia cultural más inmersiva.'
            },
            de: {
              title: 'Wichtige Feiertage rund um die Welt',
              content: `<h2>Globale Feierlichkeiten</h2>
              <p>Feiertage und Festivals bieten ein wunderbares Fenster in die Werte, Geschichte und Traditionen einer Kultur. Hier ist ein Überblick über einige wichtige Feierlichkeiten auf der ganzen Welt.</p>
              <h3>Bemerkenswerte Feiertage nach Land/Region</h3>
              <ul>
                <li><strong>Chinesisches Neujahr:</strong> Der wichtigste Feiertag in der chinesischen Kultur, der den Beginn des Mondneujahrs mit Familientreffen,besonderen Mahlzeiten und roten Dekorationen für Glück markiert.</li>
                <li><strong>Diwali (Indien):</strong> Das Lichterfest, das von Hindus, Jains und Sikhs gefeiert wird und mit Lampen, Feuerwerk und Süßigkeiten den Sieg des Lichts über die Dunkelheit symbolisiert.</li>
                <li><strong>Ramadan & Eid al-Fitr (Islamisch):</strong> Ein Monat des Fastens, gefolgt von einem Festmahl, das spirituelle Reflexion und Gemeinschaft betont.</li>
                <li><strong>Karneval (Brasilien, Venedig, New Orleans):</strong> Festivitäten vor der Fastenzeit mit Paraden, Musik, Tanz und aufwendigen Kostümen.</li>
                <li><strong>Thanksgiving (USA, Kanada):</strong> Ein Erntefest, das mit Familientreffen und traditionellen Speisen Dankbarkeit feiert.</li>
              </ul>
              <p>Wenn Sie während eines wichtigen lokalen Feiertags reisen, recherchieren Sie im Voraus, da dies Auswirkungen auf Geschäftszeiten, Transport und Unterkunftsverfügbarkeit haben kann. Es kann jedoch auch einzigartige kulturelle Erfahrungen bieten, die zu anderen Zeiten nicht verfügbar sind.</p>`,
              notes: 'Erwägen Sie, eine Reise so zu planen, dass sie mit einem lokalen Festival zusammenfällt, um ein intensiveres kulturelles Erlebnis zu haben.'
            }
          }
        }
      ],
      'customs-and-etiquette': [
        {
          slug: 'cultural-dos-and-donts',
          translations: {
            en: {
              title: 'Cultural Do\'s and Don\'ts Around the World',
              content: `<h2>Navigating Cultural Expectations</h2>
              <p>Understanding local customs and etiquette can help you avoid unintentional offense and show respect for the cultures you visit. Here are some important cultural considerations for various regions.</p>
              <h3>Common Cultural Considerations</h3>
              <ul>
                <li><strong>Japan:</strong> Remove shoes before entering homes, avoid sticking chopsticks upright in rice, bow when greeting.</li>
                <li><strong>Middle East:</strong> Dress modestly, use the right hand for eating and giving items, ask permission before taking photos of people.</li>
                <li><strong>India:</strong> Remove shoes before entering temples, avoid public displays of affection, use your right hand for eating and giving/receiving items.</li>
                <li><strong>Latin America:</strong> Greetings are important and often include physical contact, punctuality is less strict, relationships are valued over schedules.</li>
                <li><strong>Northern Europe:</strong> Punctuality is highly valued, personal space is respected, quieter and more reserved communication style.</li>
              </ul>
              <p>Remember that these are generalizations and individual behaviors vary. The most important thing is to approach new cultural situations with respect, humility, and a willingness to learn.</p>`,
              notes: 'Research specific etiquette for countries you plan to visit to show respect for local customs.'
            },
            ar: {
              title: 'ما يجب وما لا يجب فعله ثقافيًا حول العالم',
              content: `<h2>التنقل في التوقعات الثقافية</h2>
              <p>فهم العادات المحلية وآداب السلوك يمكن أن يساعدك على تجنب الإساءة غير المقصودة وإظهار الاحترام للثقافات التي تزورها. فيما يلي بعض الاعتبارات الثقافية المهمة لمختلف المناطق.</p>
              <h3>اعتبارات ثقافية شائعة</h3>
              <ul>
                <li><strong>اليابان:</strong> خلع الأحذية قبل دخول المنازل، تجنب وضع عيدان الطعام بشكل عمودي في الأرز، الانحناء عند التحية.</li>
                <li><strong>الشرق الأوسط:</strong> ارتداء ملابس محتشمة، استخدام اليد اليمنى للأكل وإعطاء الأشياء، طلب الإذن قبل التقاط صور للأشخاص.</li>
                <li><strong>الهند:</strong> خلع الأحذية قبل دخول المعابد، تجنب المظاهر العامة للمودة، استخدام يدك اليمنى للأكل وتقديم/استلام الأشياء.</li>
                <li><strong>أمريكا اللاتينية:</strong> التحيات مهمة وغالبًا ما تشمل الاتصال الجسدي، الدقة في المواعيد أقل صرامة، العلاقات مقدرة أكثر من الجداول الزمنية.</li>
                <li><strong>شمال أوروبا:</strong> الدقة في المواعيد مقدرة للغاية، يتم احترام المساحة الشخصية، أسلوب تواصل أكثر هدوءًا وتحفظًا.</li>
              </ul>
              <p>تذكر أن هذه تعميمات والسلوكيات الفردية تختلف. الشيء الأكثر أهمية هو مقاربة المواقف الثقافية الجديدة باحترام وتواضع واستعداد للتعلم.</p>`,
              notes: 'ابحث في آداب السلوك المحددة للبلدان التي تخطط لزيارتها لإظهار الاحترام للعادات المحلية.'
            },
            fr: {
              title: 'À faire et à ne pas faire culturellement à travers le monde',
              content: `<h2>Naviguer dans les attentes culturelles</h2>
              <p>Comprendre les coutumes locales et l'étiquette peut vous aider à éviter les offenses involontaires et à montrer du respect pour les cultures que vous visitez. Voici quelques considérations culturelles importantes pour diverses régions.</p>
              <h3>Considérations culturelles courantes</h3>
              <ul>
                <li><strong>Japon :</strong> Enlever ses chaussures avant d'entrer dans les maisons, éviter de planter les baguettes verticalement dans le riz, s'incliner en saluant.</li>
                <li><strong>Moyen-Orient :</strong> S'habiller modestement, utiliser la main droite pour manger et donner des objets, demander la permission avant de prendre des photos de personnes.</li>
                <li><strong>Inde :</strong> Enlever ses chaussures avant d'entrer dans les temples, éviter les manifestations publiques d'affection, utiliser sa main droite pour manger et donner/recevoir des objets.                <li><strong>Amérique latine :</strong> Les salutations sont importantes et incluent souvent un contact physique, la ponctualité est moins stricte, les relations sont valorisées plus que les horaires.</li>
                <li><strong>Europe du Nord :</strong> La ponctualité est très valorisée, l'espace personnel est respecté, style de communication plus calme et plus réservé.</li>
              </ul>
              <p>N'oubliez pas que ce sont des généralisations et que les comportements individuels varient. Le plus important est d'aborder les nouvelles situations culturelles avec respect, humilité et volonté d'apprendre.</p>`,
              notes: 'Recherchez l\'étiquette spécifique pour les pays que vous prévoyez de visiter afin de montrer du respect pour les coutumes locales.'
            },
            es: {
              title: 'Lo que se debe y no se debe hacer culturalmente alrededor del mundo',
              content: `<h2>Navegando por las expectativas culturales</h2>
              <p>Entender las costumbres locales y la etiqueta puede ayudarte a evitar ofensas no intencionadas y mostrar respeto por las culturas que visitas. Aquí hay algunas consideraciones culturales importantes para diversas regiones.</p>
              <h3>Consideraciones culturales comunes</h3>
              <ul>
                <li><strong>Japón:</strong> Quitarse los zapatos antes de entrar en las casas, evitar poner los palillos verticalmente en el arroz, hacer una reverencia al saludar.</li>
                <li><strong>Oriente Medio:</strong> Vestir modestamente, usar la mano derecha para comer y dar objetos, pedir permiso antes de tomar fotos de personas.</li>
                <li><strong>India:</strong> Quitarse los zapatos antes de entrar en los templos, evitar muestras públicas de afecto, usar la mano derecha para comer y dar/recibir objetos.</li>
                <li><strong>América Latina:</strong> Los saludos son importantes y a menudo incluyen contacto físico, la puntualidad es menos estricta, las relaciones son valoradas por encima de los horarios.</li>
                <li><strong>Norte de Europa:</strong> La puntualidad es muy valorada, se respeta el espacio personal, estilo de comunicación más tranquilo y reservado.</li>
              </ul>
              <p>Recuerda que estas son generalizaciones y los comportamientos individuales varían. Lo más importante es abordar nuevas situaciones culturales con respeto, humildad y disposición para aprender.</p>`,
              notes: 'Investiga la etiqueta específica para los países que planeas visitar para mostrar respeto por las costumbres locales.'
            },
            de: {
              title: 'Kulturelle Dos und Don\'ts rund um die Welt',
              content: `<h2>Navigation durch kulturelle Erwartungen</h2>
              <p>Das Verständnis lokaler Bräuche und Etikette kann Ihnen helfen, unbeabsichtigte Beleidigungen zu vermeiden und Respekt für die Kulturen zu zeigen, die Sie besuchen. Hier sind einige wichtige kulturelle Überlegungen für verschiedene Regionen.</p>
              <h3>Allgemeine kulturelle Überlegungen</h3>
              <ul>
                <li><strong>Japan:</strong> Schuhe vor dem Betreten von Häusern ausziehen, vermeiden Sie es, Essstäbchen aufrecht in Reis zu stecken, verbeugen Sie sich zur Begrüßung.</li>
                <li><strong>Naher Osten:</strong> Bescheiden kleiden, die rechte Hand zum Essen und Geben von Gegenständen verwenden, um Erlaubnis bitten, bevor Sie Fotos von Menschen machen.</li>
                <li><strong>Indien:</strong> Schuhe vor dem Betreten von Tempeln ausziehen, öffentliche Zuneigungsbekundungen vermeiden, die rechte Hand zum Essen und Geben/Nehmen von Gegenständen verwenden.</li>
                <li><strong>Lateinamerika:</strong> Begrüßungen sind wichtig und umfassen oft körperlichen Kontakt, Pünktlichkeit ist weniger streng, Beziehungen werden höher bewertet als Zeitpläne.</li>
                <li><strong>Nordeuropa:</strong> Pünktlichkeit wird sehr geschätzt, persönlicher Raum wird respektiert, ruhigerer und zurückhaltenderer Kommunikationsstil.</li>
              </ul>
              <p>Denken Sie daran, dass dies Verallgemeinerungen sind und individuelles Verhalten variiert. Das Wichtigste ist, neue kulturelle Situationen mit Respekt, Demut und Lernbereitschaft anzugehen.</p>`,
              notes: 'Recherchieren Sie spezifische Etikette für Länder, die Sie besuchen möchten, um Respekt für lokale Bräuche zu zeigen.'
            }
          }
        }
      ]
    };

    if (articlesData[subjectSlug]) {
      articlesData[subjectSlug].forEach((articleData: any) => {
        const articleId = this.currentArticleId++;
        const authorId = 1; // Default to first user

        const article = {
          id: articleId,
          slug: articleData.slug,
          subjectId: subjectId,
          authorId: authorId,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          title: '', // Will be set from translations
          content: '', // Will be set from translations
        };

        this.articlesStore.set(articleId, article);

        // Add translations for each language
        Object.entries(articleData.translations).forEach(([langCode, translation]) => {
          const langId = languageMap.get(langCode);
          if (langId) {
            if (!this.articleTranslationsStore.has(articleId)) {
              this.articleTranslationsStore.set(articleId, new Map());
            }
            this.articleTranslationsStore.get(articleId)?.set(langId, translation as { title: string; content: string; notes?: string });
          }
        });
      });
    }
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(user => user.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      ...userData,
      createdAt: new Date(),
    };
    this.usersStore.set(id, user);
    return user;
  }

  // Languages
  async getLanguages(): Promise<Language[]> {
    return Array.from(this.languagesStore.values());
  }

  async getLanguageByCode(code: string): Promise<Language | undefined> {
    return Array.from(this.languagesStore.values()).find(lang => lang.code === code);
  }

  // Categories
  async getCategoriesWithTranslations(languageCode: string): Promise<CategoryWithTranslation[]> {
    const language = await this.getLanguageByCode(languageCode);
    if (!language) {
      return [];
    }

    return Array.from(this.categoriesStore.values()).map(category => {
      const translations = this.categoryTranslationsStore.get(category.id)?.get(language.id);
      return {
        ...category,
        name: translations?.name || `Category ${category.id}`,
        description: translations?.description,
      };
    });
  }

  async getCategoryBySlug(slug: string, languageCode: string): Promise<CategoryWithTranslation | undefined> {
    const language = await this.getLanguageByCode(languageCode);
    if (!language) {
      return undefined;
    }

    const category = Array.from(this.categoriesStore.values()).find(c => c.slug === slug);
    if (!category) {
      return undefined;
    }

    const translations = this.categoryTranslationsStore.get(category.id)?.get(language.id);
    return {
      ...category,
      name: translations?.name || `Category ${category.id}`,
      description: translations?.description,
    };
  }

  // Subjects
  async getSubjectsByCategorySlug(categorySlug: string, languageCode: string): Promise<SubjectWithTranslation[]> {
    const category = await this.getCategoryBySlug(categorySlug, languageCode);
    if (!category) {
      throw new Error("Category not found");
    }

    const language = await this.getLanguageByCode(languageCode);
    if (!language) {
      return [];
    }

    return Array.from(this.subjectsStore.values())
      .filter(subject => subject.categoryId === category.id)
      .map(subject => {
        const translations = this.subjectTranslationsStore.get(subject.id)?.get(language.id);
        return {
          ...subject,
          name: translations?.name || `Subject ${subject.id}`,
          description: translations?.description,
          category,
        };
      });
  }

  async getSubjectBySlug(slug: string, languageCode: string): Promise<SubjectWithTranslation | undefined> {
    const language = await this.getLanguageByCode(languageCode);
    if (!language) {
      return undefined;
    }

    const subject = Array.from(this.subjectsStore.values()).find(s => s.slug === slug);
    if (!subject) {
      return undefined;
    }

    const category = await this.getCategoryBySlug(
      Array.from(this.categoriesStore.values()).find(c => c.id === subject.categoryId)?.slug || '', 
      languageCode
    );
    if (!category) {
      return undefined;
    }

    const translations = this.subjectTranslationsStore.get(subject.id)?.get(language.id);
    return {
      ...subject,
      name: translations?.name || `Subject ${subject.id}`,
      description: translations?.description,
      category,
    };
  }

  // Articles
  async getArticlesBySubjectSlug(subjectSlug: string, languageCode: string): Promise<ArticleWithTranslation[]> {
    const subject = await this.getSubjectBySlug(subjectSlug, languageCode);
    if (!subject) {
      throw new Error("Subject not found");
    }

    const language = await this.getLanguageByCode(languageCode);
    if (!language) {
      return [];
    }

    return Array.from(this.articlesStore.values())
      .filter(article => article.subjectId === subject.id)
      .map(article => {
        const translations = this.articleTranslationsStore.get(article.id)?.get(language.id);
        const author = article.authorId ? this.usersStore.get(article.authorId) : undefined;

        return {
          ...article,
          title: translations?.title || `Article ${article.id}`,
          content: translations?.content || '',
          notes: translations?.notes,
          author: author ? { id: author.id, username: author.username } : undefined,
          subject,
        };
      });
  }

  async getArticleBySlug(slug: string, languageCode: string): Promise<ArticleWithTranslation | undefined> {
    const language = await this.getLanguageByCode(languageCode);
    if (!language) {
      return undefined;
    }

    const article = Array.from(this.articlesStore.values()).find(a => a.slug === slug);
    if (!article) {
      return undefined;
    }

    const subject = await this.getSubjectBySlug(
      Array.from(this.subjectsStore.values()).find(s => s.id === article.subjectId)?.slug || '',
      languageCode
    );
    if (!subject) {
      return undefined;
    }

    const translations = this.articleTranslationsStore.get(article.id)?.get(language.id);
    const author = article.authorId ? this.usersStore.get(article.authorId) : undefined;

    return {
      ...article,
      title: translations?.title || `Article ${article.id}`,
      content: translations?.content || '',
      notes: translations?.notes,
      author: author ? { id: author.id, username: author.username } : undefined,
      subject,
    };
  }

  async getArticleTranslations(slug: string): Promise<ArticleTranslationWithLanguage[]> {
    const article = Array.from(this.articlesStore.values()).find(a => a.slug === slug);
    if (!article) {
      throw new Error("Article not found");
    }

    const translations = this.articleTranslationsStore.get(article.id);
    if (!translations) {
      return [];
    }

    const result: ArticleTranslationWithLanguage[] = [];
    for (const [languageId, content] of translations.entries()) {
      const language = this.languagesStore.get(languageId);
      if (language) {
        result.push({
          id: article.id, // Using article ID as a placeholder
          articleId: article.id,
          languageId,
          title: content.title,
          content: content.content,
          notes: content.notes,
          language,
        });
      }
    }

    return result;
  }

  // Comments
  async getCommentsByArticleSlug(articleSlug: string): Promise<CommentWithUser[]> {
    const article = Array.from(this.articlesStore.values()).find(a => a.slug === articleSlug);
    if (!article) {
      throw new Error("Article not found");
    }

    // Get all comments for this article
    const allComments = Array.from(this.commentsStore.values())
      .filter(comment => comment.articleId === article.id)
      .map(comment => {
        const user = this.usersStore.get(comment.userId);
        return {
          ...comment,
          user: user ? { id: user.id, username: user.username } : { id: 0, username: 'Unknown' },
          replies: []
        };
      });

    // Organize into parent-child relationships
    const parentComments: CommentWithUser[] = [];
    const childComments: { [key: number]: CommentWithUser[] } = {};

    for (const comment of allComments) {
      if (comment.parentId) {
        if (!childComments[comment.parentId]) {
          childComments[comment.parentId] = [];
        }
        childComments[comment.parentId].push(comment);
      } else {
        parentComments.push(comment);
      }
    }

    // Attach replies to parent comments
    for (const parentComment of parentComments) {
      parentComment.replies = childComments[parentComment.id] || [];
    }

    return parentComments;
  }

  async createComment(commentData: { articleId: number; userId: number; content: string; parentId?: number }): Promise<Comment> {
    const id = this.currentCommentId++;
    const comment: Comment = {
      id,
      articleId: commentData.articleId,
      userId: commentData.userId,
      content: commentData.content,
      parentId: commentData.parentId,
      createdAt: new Date(),
    };

    this.commentsStore.set(id, comment);
    return comment;
  }

  // Likes
  async likeArticle(articleId: number, userId: number): Promise<Like> {
    // Check if already liked
    const existingLike = Array.from(this.likesStore.values()).find(
      like => like.articleId === articleId && like.userId === userId
    );

    if (existingLike) {
      return existingLike;
    }

    const id = this.currentLikeId++;
    const like: Like = {
      id,
      articleId,
      userId,
      createdAt: new Date(),
    };

    this.likesStore.set(id, like);
    return like;
  }

  async unlikeArticle(articleId: number, userId: number): Promise<void> {
    const likeToRemove = Array.from(this.likesStore.values()).find(
      like => like.articleId === articleId && like.userId === userId
    );

    if (likeToRemove) {
      this.likesStore.delete(likeToRemove.id);
    }
  }

  async isArticleLiked(articleId: number, userId: number): Promise<boolean> {
    return Array.from(this.likesStore.values()).some(
      like => like.articleId === articleId && like.userId === userId
    );
  }

  // Saved Articles
  async saveArticle(articleId: number, userId: number): Promise<SavedArticle> {
    // Check if already saved
    const existingSave = Array.from(this.savedArticlesStore.values()).find(
      saved => saved.articleId === articleId && saved.userId === userId
    );

    if (existingSave) {
      return existingSave;
    }

    const id = this.currentSavedArticleId++;
    const savedArticle: SavedArticle = {
      id,
      articleId,
      userId,
      createdAt: new Date(),
    };

    this.savedArticlesStore.set(id, savedArticle);
    return savedArticle;
  }

  async unsaveArticle(articleId: number, userId: number): Promise<void> {
    const saveToRemove = Array.from(this.savedArticlesStore.values()).find(
      saved => saved.articleId === articleId && saved.userId === userId
    );

    if (saveToRemove) {
      this.savedArticlesStore.delete(saveToRemove.id);
    }
  }

  async isArticleSaved(articleId: number, userId: number): Promise<boolean> {
    return Array.from(this.savedArticlesStore.values()).some(
      saved => saved.articleId === articleId && saved.userId === userId
    );
  }

  async getPendingArticles(): Promise<ArticleWithTranslation[]> {
    const pendingArticles = Array.from(this.articlesStore.values())
      .filter(article => article.status === 'pending');
    
    const result: ArticleWithTranslation[] = [];
    for (const article of pendingArticles) {
      const articleWithTranslation = await this.getArticleBySlug(article.slug, 'en');
      if (articleWithTranslation) {
        result.push(articleWithTranslation);
      }
    }
    return result;
  }

  async approveArticle(articleId: number): Promise<void> {
    const article = this.articlesStore.get(articleId);
    if (article) {
      article.status = 'approved';
      article.publishedAt = new Date();
      this.articlesStore.set(articleId, article);
    }
  }

  async rejectArticle(articleId: number): Promise<void> {
    const article = this.articlesStore.get(articleId);
    if (article) {
      article.status = 'rejected';
      this.articlesStore.set(articleId, article);
    }
  }

  async getAdminMessages(): Promise<Message[]> {
    return Array.from(this.messagesStore.values());
  }

  async getSavedArticles(userId: number, languageCode: string): Promise<ArticleWithTranslation[]> {
    const savedArticleIds = Array.from(this.savedArticlesStore.values())
      .filter(saved => saved.userId === userId)
      .map(saved => saved.articleId);

    const result: ArticleWithTranslation[] = [];
    for (const articleId of savedArticleIds) {
      const article = this.articlesStore.get(articleId);
      if (article) {
        const articleWithTranslation = await this.getArticleBySlug(article.slug, languageCode);
        if (articleWithTranslation) {
          result.push(articleWithTranslation);
        }
      }
    }

    return result;
  }
}

export const storage = new MemStorage();