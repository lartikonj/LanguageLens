import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Available languages
const resources = {
  en: {
    translation: {
      // Common navigation
      "nav.home": "Home",
      "nav.categories": "Categories",
      "nav.about": "About",
      "nav.profile": "Profile",
      "nav.login": "Log in",
      "nav.signup": "Sign up",
      "nav.logout": "Log out",

      // User authentication
      "auth.welcome": "Welcome to LinguaContent",
      "auth.login.title": "Log in to your account",
      "auth.login.subtitle": "Welcome back! Please enter your credentials to access your account.",
      "auth.register.title": "Create an account",
      "auth.register.subtitle": "Join our community to enhance your language learning journey.",
      "auth.username": "Username",
      "auth.email": "Email address",
      "auth.password": "Password",
      "auth.confirmPassword": "Confirm password",
      "auth.rememberMe": "Remember me",
      "auth.forgotPassword": "Forgot your password?",
      "auth.loginButton": "Log in",
      "auth.signupButton": "Sign up",
      "auth.loginQuestion": "Already have an account?",
      "auth.signupQuestion": "Don't have an account?",
      "auth.or": "or continue with",
      "auth.termsAgree": "I agree to the Terms and Privacy Policy",

      // Languages
      "language.name": "English",
      "language.en": "English",
      "language.fr": "French",
      "language.es": "Spanish",
      "language.de": "German",
      "language.ar": "Arabic",

      // View modes
      "viewMode.single": "Single View",
      "viewMode.dual": "Dual View",
      "viewMode.toggle": "Paragraph Toggle",

      // Article actions
      "article.like": "Like",
      "article.save": "Save",
      "article.share": "Share",
      "article.readMore": "Read more",
      "article.relatedArticles": "Related articles",
      "article.availableIn": "Available in",
      "article.languages": "languages",
      "article.notes": "Notes & References",
      "article.comments": "Comments",
      "article.postComment": "Post Comment",
      "article.reply": "Reply",
      "article.loadMore": "Load more comments",
      "article.addComment": "Add a comment...",

      // Error messages
      "error.login": "Invalid email or password",
      "error.register": "Registration failed",
      "error.comment": "Failed to post comment",
      "error.required": "This field is required",
      "error.email": "Please enter a valid email address",
      "error.passwordMatch": "Passwords must match",
      "error.minLength": "Must be at least {{length}} characters",
      "error.termsRequired": "You must agree to the terms and privacy policy",

      // Success messages
      "success.login": "Successfully logged in",
      "success.register": "Account created successfully",
      "success.logout": "Successfully logged out",
      "success.commentPosted": "Comment posted successfully",
      "success.articleSaved": "Article saved to your favorites",
      "success.articleUnsaved": "Article removed from your favorites",
      "success.articleLiked": "Article liked",
      "success.articleUnliked": "Article unliked",

      // Filters and categories
      "filter.latest": "Latest",
      "filter.popular": "Popular",
      "filter.category": "Category",
      "filter.language": "Language",

      // Profile page
      "profile.savedArticles": "Saved Articles",
      "profile.recentActivity": "Recent Activity",
      "profile.settings": "Settings",
      "profile.comments": "Your Comments",
      "profile.noSavedArticles": "You haven't saved any articles yet",
      "profile.noComments": "You haven't posted any comments yet",

      // Footer
      "footer.about": "About",
      "footer.categories": "Categories",
      "footer.terms": "Terms",
      "footer.privacy": "Privacy",
      "footer.contact": "Contact Us",
      "footer.copyright": "© 2023 LinguaContent. All rights reserved.",

      // 404 page
      "notFound.title": "Page Not Found",
      "notFound.message": "The page you are looking for doesn't exist.",
      "notFound.button": "Back to Home",

      // Breadcrumbs
      "breadcrumbs.home": "Home",

      // About page
      "about.title": "About LinguaContent",
      "about.subtitle": "Learn languages naturally through immersive content",
      "about.description": "LinguaContent is a platform designed to help you learn languages naturally by engaging with content that interests you. Our multilingual approach allows you to switch between languages easily, reinforcing your understanding and vocabulary.",
      "about.method.title": "Our Method",
      "about.method.description": "We believe that the most effective way to learn a language is through immersion in authentic content. By reading, watching, or listening to material that genuinely interests you in multiple languages, you develop a more intuitive understanding of language patterns."
    }
  },
  fr: {
    translation: {
      // Common navigation
      "nav.home": "Accueil",
      "nav.categories": "Catégories",
      "nav.about": "À propos",
      "nav.profile": "Profil",
      "nav.login": "Connexion",
      "nav.signup": "S'inscrire",
      "nav.logout": "Déconnexion",

      // User authentication
      "auth.welcome": "Bienvenue sur LinguaContent",
      "auth.login.title": "Connectez-vous à votre compte",
      "auth.login.subtitle": "Bon retour ! Veuillez entrer vos identifiants pour accéder à votre compte.",
      "auth.register.title": "Créer un compte",
      "auth.register.subtitle": "Rejoignez notre communauté pour améliorer votre apprentissage des langues.",
      "auth.username": "Nom d'utilisateur",
      "auth.email": "Adresse e-mail",
      "auth.password": "Mot de passe",
      "auth.confirmPassword": "Confirmer le mot de passe",
      "auth.rememberMe": "Se souvenir de moi",
      "auth.forgotPassword": "Mot de passe oublié ?",
      "auth.loginButton": "Se connecter",
      "auth.signupButton": "S'inscrire",
      "auth.loginQuestion": "Vous avez déjà un compte ?",
      "auth.signupQuestion": "Vous n'avez pas de compte ?",
      "auth.or": "ou continuer avec",
      "auth.termsAgree": "J'accepte les Conditions et la Politique de confidentialité",

      // Languages
      "language.name": "Français",
      "language.en": "Anglais",
      "language.fr": "Français",
      "language.es": "Espagnol",
      "language.de": "Allemand",
      "language.ar": "Arabe",

      // View modes
      "viewMode.single": "Vue unique",
      "viewMode.dual": "Vue double",
      "viewMode.toggle": "Basculer paragraphe",

      // Article actions
      "article.like": "J'aime",
      "article.save": "Sauvegarder",
      "article.share": "Partager",
      "article.readMore": "Lire plus",
      "article.relatedArticles": "Articles liés",
      "article.availableIn": "Disponible en",
      "article.languages": "langues",
      "article.notes": "Notes et références",
      "article.comments": "Commentaires",
      "article.postComment": "Publier commentaire",
      "article.reply": "Répondre",
      "article.loadMore": "Charger plus de commentaires",
      "article.addComment": "Ajouter un commentaire...",

      // Error messages
      "error.login": "Email ou mot de passe invalide",
      "error.register": "L'inscription a échoué",
      "error.comment": "Échec de la publication du commentaire",
      "error.required": "Ce champ est obligatoire",
      "error.email": "Veuillez entrer une adresse e-mail valide",
      "error.passwordMatch": "Les mots de passe doivent correspondre",
      "error.minLength": "Doit contenir au moins {{length}} caractères",
      "error.termsRequired": "Vous devez accepter les conditions et la politique de confidentialité",

      // Success messages
      "success.login": "Connexion réussie",
      "success.register": "Compte créé avec succès",
      "success.logout": "Déconnexion réussie",
      "success.commentPosted": "Commentaire publié avec succès",
      "success.articleSaved": "Article enregistré dans vos favoris",
      "success.articleUnsaved": "Article retiré de vos favoris",
      "success.articleLiked": "Article aimé",
      "success.articleUnliked": "Je n'aime plus cet article",

      // Filters and categories
      "filter.latest": "Plus récent",
      "filter.popular": "Populaire",
      "filter.category": "Catégorie",
      "filter.language": "Langue",

      // Profile page
      "profile.savedArticles": "Articles sauvegardés",
      "profile.recentActivity": "Activité récente",
      "profile.settings": "Paramètres",
      "profile.comments": "Vos commentaires",
      "profile.noSavedArticles": "Vous n'avez pas encore sauvegardé d'articles",
      "profile.noComments": "Vous n'avez pas encore publié de commentaires",

      // Footer
      "footer.about": "À propos",
      "footer.categories": "Catégories",
      "footer.terms": "Conditions",
      "footer.privacy": "Confidentialité",
      "footer.contact": "Contactez-nous",
      "footer.copyright": "© 2023 LinguaContent. Tous droits réservés.",

      // 404 page
      "notFound.title": "Page non trouvée",
      "notFound.message": "La page que vous recherchez n'existe pas.",
      "notFound.button": "Retour à l'accueil",

      // Breadcrumbs
      "breadcrumbs.home": "Accueil",

      // About page
      "about.title": "À propos de LinguaContent",
      "about.subtitle": "Apprenez les langues naturellement grâce à un contenu immersif",
      "about.description": "LinguaContent est une plateforme conçue pour vous aider à apprendre les langues naturellement en vous engageant avec du contenu qui vous intéresse. Notre approche multilingue vous permet de passer facilement d'une langue à l'autre, renforçant votre compréhension et votre vocabulaire.",
      "about.method.title": "Notre méthode",
      "about.method.description": "Nous pensons que la façon la plus efficace d'apprendre une langue est l'immersion dans un contenu authentique. En lisant, regardant ou écoutant du matériel qui vous intéresse vraiment dans plusieurs langues, vous développez une compréhension plus intuitive des modèles linguistiques."
    }
  },
  es: {
    translation: {
      // Common navigation
      "nav.home": "Inicio",
      "nav.categories": "Categorías",
      "nav.about": "Acerca de",
      "nav.profile": "Perfil",
      "nav.login": "Iniciar sesión",
      "nav.signup": "Registrarse",
      "nav.logout": "Cerrar sesión",

      // User authentication
      "auth.welcome": "Bienvenido a LinguaContent",
      "auth.login.title": "Iniciar sesión en su cuenta",
      "auth.login.subtitle": "¡Bienvenido de nuevo! Por favor, introduzca sus credenciales para acceder a su cuenta.",
      "auth.register.title": "Crear una cuenta",
      "auth.register.subtitle": "Únase a nuestra comunidad para mejorar su aprendizaje de idiomas.",
      "auth.username": "Nombre de usuario",
      "auth.email": "Dirección de correo electrónico",
      "auth.password": "Contraseña",
      "auth.confirmPassword": "Confirmar contraseña",
      "auth.rememberMe": "Recordarme",
      "auth.forgotPassword": "¿Olvidó su contraseña?",
      "auth.loginButton": "Iniciar sesión",
      "auth.signupButton": "Registrarse",
      "auth.loginQuestion": "¿Ya tiene una cuenta?",
      "auth.signupQuestion": "¿No tiene una cuenta?",
      "auth.or": "o continuar con",
      "auth.termsAgree": "Acepto los Términos y la Política de Privacidad",

      // Languages
      "language.name": "Español",
      "language.en": "Inglés",
      "language.fr": "Francés",
      "language.es": "Español",
      "language.de": "Alemán",
      "language.ar": "Árabe",

      // View modes
      "viewMode.single": "Vista única",
      "viewMode.dual": "Vista dual",
      "viewMode.toggle": "Alternar párrafo",

      // Article actions
      "article.like": "Me gusta",
      "article.save": "Guardar",
      "article.share": "Compartir",
      "article.readMore": "Leer más",
      "article.relatedArticles": "Artículos relacionados",
      "article.availableIn": "Disponible en",
      "article.languages": "idiomas",
      "article.notes": "Notas y referencias",
      "article.comments": "Comentarios",
      "article.postComment": "Publicar comentario",
      "article.reply": "Responder",
      "article.loadMore": "Cargar más comentarios",
      "article.addComment": "Añadir un comentario...",

      // Error messages
      "error.login": "Email o contraseña no válidos",
      "error.register": "El registro ha fallado",
      "error.comment": "No se pudo publicar el comentario",
      "error.required": "Este campo es obligatorio",
      "error.email": "Por favor, introduzca una dirección de correo electrónico válida",
      "error.passwordMatch": "Las contraseñas deben coincidir",
      "error.minLength": "Debe tener al menos {{length}} caracteres",
      "error.termsRequired": "Debe aceptar los términos y la política de privacidad",

      // Success messages
      "success.login": "Sesión iniciada con éxito",
      "success.register": "Cuenta creada con éxito",
      "success.logout": "Sesión cerrada con éxito",
      "success.commentPosted": "Comentario publicado con éxito",
      "success.articleSaved": "Artículo guardado en sus favoritos",
      "success.articleUnsaved": "Artículo eliminado de sus favoritos",
      "success.articleLiked": "Te gusta este artículo",
      "success.articleUnliked": "Ya no te gusta este artículo",

      // Filters and categories
      "filter.latest": "Más reciente",
      "filter.popular": "Popular",
      "filter.category": "Categoría",
      "filter.language": "Idioma",

      // Profile page
      "profile.savedArticles": "Artículos guardados",
      "profile.recentActivity": "Actividad reciente",
      "profile.settings": "Configuración",
      "profile.comments": "Sus comentarios",
      "profile.noSavedArticles": "Aún no ha guardado ningún artículo",
      "profile.noComments": "Aún no ha publicado ningún comentario",

      // Footer
      "footer.about": "Acerca de",
      "footer.categories": "Categorías",
      "footer.terms": "Términos",
      "footer.privacy": "Privacidad",
      "footer.contact": "Contáctenos",
      "footer.copyright": "© 2023 LinguaContent. Todos los derechos reservados.",

      // 404 page
      "notFound.title": "Página no encontrada",
      "notFound.message": "La página que está buscando no existe.",
      "notFound.button": "Volver al inicio",

      // Breadcrumbs
      "breadcrumbs.home": "Inicio",

      // About page
      "about.title": "Acerca de LinguaContent",
      "about.subtitle": "Aprenda idiomas de forma natural mediante contenido inmersivo",
      "about.description": "LinguaContent es una plataforma diseñada para ayudarlo a aprender idiomas de forma natural a través de contenido que le interesa. Nuestro enfoque multilingüe le permite cambiar entre idiomas fácilmente, reforzando su comprensión y vocabulario.",
      "about.method.title": "Nuestro método",
      "about.method.description": "Creemos que la forma más efectiva de aprender un idioma es a través de la inmersión en contenido auténtico. Al leer, ver o escuchar material que genuinamente le interesa en múltiples idiomas, desarrolla una comprensión más intuitiva de los patrones del lenguaje."
    }
  },
  de: {
    translation: {
      // Common navigation
      "nav.home": "Startseite",
      "nav.categories": "Kategorien",
      "nav.about": "Über uns",
      "nav.profile": "Profil",
      "nav.login": "Anmelden",
      "nav.signup": "Registrieren",
      "nav.logout": "Abmelden",

      // User authentication
      "auth.welcome": "Willkommen bei LinguaContent",
      "auth.login.title": "Melden Sie sich bei Ihrem Konto an",
      "auth.login.subtitle": "Willkommen zurück! Bitte geben Sie Ihre Anmeldedaten ein, um auf Ihr Konto zuzugreifen.",
      "auth.register.title": "Konto erstellen",
      "auth.register.subtitle": "Treten Sie unserer Gemeinschaft bei, um Ihre Sprachlernreise zu verbessern.",
      "auth.username": "Benutzername",
      "auth.email": "E-Mail-Adresse",
      "auth.password": "Passwort",
      "auth.confirmPassword": "Passwort bestätigen",
      "auth.rememberMe": "Angemeldet bleiben",
      "auth.forgotPassword": "Passwort vergessen?",
      "auth.loginButton": "Anmelden",
      "auth.signupButton": "Registrieren",
      "auth.loginQuestion": "Haben Sie bereits ein Konto?",
      "auth.signupQuestion": "Haben Sie kein Konto?",
      "auth.or": "oder fortfahren mit",
      "auth.termsAgree": "Ich stimme den Nutzungsbedingungen und Datenschutzrichtlinien zu",

      // Languages
      "language.name": "Deutsch",
      "language.en": "Englisch",
      "language.fr": "Französisch",
      "language.es": "Spanisch",
      "language.de": "Deutsch",
      "language.ar": "Arabisch",

      // View modes
      "viewMode.single": "Einzelansicht",
      "viewMode.dual": "Doppelansicht",
      "viewMode.toggle": "Absatz umschalten",

      // Article actions
      "article.like": "Gefällt mir",
      "article.save": "Speichern",
      "article.share": "Teilen",
      "article.readMore": "Weiterlesen",
      "article.relatedArticles": "Verwandte Artikel",
      "article.availableIn": "Verfügbar in",
      "article.languages": "Sprachen",
      "article.notes": "Anmerkungen & Referenzen",
      "article.comments": "Kommentare",
      "article.postComment": "Kommentar posten",
      "article.reply": "Antworten",
      "article.loadMore": "Mehr Kommentare laden",
      "article.addComment": "Kommentar hinzufügen...",

      // Error messages
      "error.login": "Ungültige E-Mail oder Passwort",
      "error.register": "Registrierung fehlgeschlagen",
      "error.comment": "Kommentar konnte nicht gepostet werden",
      "error.required": "Dieses Feld ist erforderlich",
      "error.email": "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      "error.passwordMatch": "Passwörter müssen übereinstimmen",
      "error.minLength": "Muss mindestens {{length}} Zeichen lang sein",
      "error.termsRequired": "Sie müssen den Nutzungsbedingungen und Datenschutzrichtlinien zustimmen",

      // Success messages
      "success.login": "Erfolgreich angemeldet",
      "success.register": "Konto erfolgreich erstellt",
      "success.logout": "Erfolgreich abgemeldet",
      "success.commentPosted": "Kommentar erfolgreich gepostet",
      "success.articleSaved": "Artikel zu Ihren Favoriten hinzugefügt",
      "success.articleUnsaved": "Artikel aus Ihren Favoriten entfernt",
      "success.articleLiked": "Artikel gefällt Ihnen",
      "success.articleUnliked": "Artikel gefällt Ihnen nicht mehr",

      // Filters and categories
      "filter.latest": "Neueste",
      "filter.popular": "Beliebt",
      "filter.category": "Kategorie",
      "filter.language": "Sprache",

      // Profile page
      "profile.savedArticles": "Gespeicherte Artikel",
      "profile.recentActivity": "Neueste Aktivitäten",
      "profile.settings": "Einstellungen",
      "profile.comments": "Ihre Kommentare",
      "profile.noSavedArticles": "Sie haben noch keine Artikel gespeichert",
      "profile.noComments": "Sie haben noch keine Kommentare gepostet",

      // Footer
      "footer.about": "Über uns",
      "footer.categories": "Kategorien",
      "footer.terms": "Nutzungsbedingungen",
      "footer.privacy": "Datenschutz",
      "footer.contact": "Kontakt",
      "footer.copyright": "© 2023 LinguaContent. Alle Rechte vorbehalten.",

      // 404 page
      "notFound.title": "Seite nicht gefunden",
      "notFound.message": "Die gesuchte Seite existiert nicht.",
      "notFound.button": "Zurück zur Startseite",

      // Breadcrumbs
      "breadcrumbs.home": "Startseite",

      // About page
      "about.title": "Über LinguaContent",
      "about.subtitle": "Lernen Sie Sprachen natürlich durch immersive Inhalte",
      "about.description": "LinguaContent ist eine Plattform, die Ihnen hilft, Sprachen auf natürliche Weise zu lernen, indem Sie sich mit Inhalten beschäftigen, die Sie interessieren. Unser mehrsprachiger Ansatz ermöglicht es Ihnen, einfach zwischen Sprachen zu wechseln und so Ihr Verständnis und Ihren Wortschatz zu stärken.",
      "about.method.title": "Unsere Methode",
      "about.method.description": "Wir glauben, dass der effektivste Weg, eine Sprache zu lernen, das Eintauchen in authentische Inhalte ist. Indem Sie Material in mehreren Sprachen lesen, ansehen oder anhören, das Sie wirklich interessiert, entwickeln Sie ein intuitiveres Verständnis für Sprachmuster."
    }
  },
  ar: {
    translation: {
      // Common navigation
      "nav.home": "الرئيسية",
      "nav.categories": "الفئات",
      "nav.about": "حول",
      "nav.profile": "الملف الشخصي",
      "nav.login": "تسجيل الدخول",
      "nav.signup": "إنشاء حساب",
      "nav.logout": "تسجيل الخروج",

      // User authentication
      "auth.welcome": "مرحبًا بك في LinguaContent",
      "auth.login.title": "تسجيل الدخول إلى حسابك",
      "auth.login.subtitle": "مرحبًا بعودتك! الرجاء إدخال بيانات اعتماد للوصول إلى حسابك.",
      "auth.register.title": "إنشاء حساب",
      "auth.register.subtitle": "انضم إلى مجتمعنا لتعزيز رحلة تعلم اللغة الخاصة بك.",
      "auth.username": "اسم المستخدم",
      "auth.email": "البريد الإلكتروني",
      "auth.password": "كلمة المرور",
      "auth.confirmPassword": "تأكيد كلمة المرور",
      "auth.rememberMe": "تذكرني",
      "auth.forgotPassword": "نسيت كلمة المرور؟",
      "auth.loginButton": "تسجيل الدخول",
      "auth.signupButton": "إنشاء حساب",
      "auth.loginQuestion": "هل لديك حساب بالفعل؟",
      "auth.signupQuestion": "ليس لديك حساب؟",
      "auth.or": "أو متابعة باستخدام",
      "auth.termsAgree": "أوافق على الشروط وسياسة الخصوصية",

      // Languages
      "language.name": "العربية",
      "language.en": "الإنجليزية",
      "language.fr": "الفرنسية",
      "language.es": "الإسبانية",
      "language.de": "الألمانية",
      "language.ar": "العربية",

      // View modes
      "viewMode.single": "عرض مفرد",
      "viewMode.dual": "عرض مزدوج",
      "viewMode.toggle": "تبديل الفقرات",

      // Article actions
      "article.like": "إعجاب",
      "article.save": "حفظ",
      "article.share": "مشاركة",
      "article.readMore": "قراءة المزيد",
      "article.relatedArticles": "مقالات ذات صلة",
      "article.availableIn": "متوفر باللغات",
      "article.languages": "لغات",
      "article.notes": "ملاحظات ومراجع",
      "article.comments": "التعليقات",
      "article.postComment": "نشر تعليق",
      "article.reply": "رد",
      "article.loadMore": "تحميل المزيد من التعليقات",
      "article.addComment": "أضف تعليقًا...",

      // Error messages
      "error.login": "بريد إلكتروني أو كلمة مرور غير صالحة",
      "error.register": "فشل التسجيل",
      "error.comment": "فشل نشر التعليق",
      "error.required": "هذا الحقل مطلوب",
      "error.email": "الرجاء إدخال عنوان بريد إلكتروني صالح",
      "error.passwordMatch": "يجب أن تتطابق كلمات المرور",
      "error.minLength": "يجب أن يكون على الأقل {{length}} أحرف",
      "error.termsRequired": "يجب أن توافق على الشروط وسياسة الخصوصية",

      // Success messages
      "success.login": "تم تسجيل الدخول بنجاح",
      "success.register": "تم إنشاء الحساب بنجاح",
      "success.logout": "تم تسجيل الخروج بنجاح",
      "success.commentPosted": "تم نشر التعليق بنجاح",
      "success.articleSaved": "تم حفظ المقال في المفضلة",
      "success.articleUnsaved": "تمت إزالة المقال من المفضلة",
      "success.articleLiked": "أعجبك المقال",
      "success.articleUnliked": "لم يعد يعجبك المقال",

      // Filters and categories
      "filter.latest": "الأحدث",
      "filter.popular": "الأكثر شعبية",
      "filter.category": "الفئة",
      "filter.language": "اللغة",

      // Profile page
      "profile.savedArticles": "المقالات المحفوظة",
      "profile.recentActivity": "النشاط الأخير",
      "profile.settings": "الإعدادات",
      "profile.comments": "تعليقاتك",
      "profile.noSavedArticles": "لم تقم بحفظ أي مقالات بعد",
      "profile.noComments": "لم تقم بنشر أي تعليقات بعد",

      // Footer
      "footer.about": "حول",
      "footer.categories": "الفئات",
      "footer.terms": "الشروط",
      "footer.privacy": "الخصوصية",
      "footer.contact": "اتصل بنا",
      "footer.copyright": "© 2023 LinguaContent. جميع الحقوق محفوظة.",

      // 404 page
      "notFound.title": "الصفحة غير موجودة",
      "notFound.message": "الصفحة التي تبحث عنها غير موجودة.",
      "notFound.button": "العودة إلى الرئيسية",

      // Breadcrumbs
      "breadcrumbs.home": "الرئيسية",

      // About page
      "about.title": "حول LinguaContent",
      "about.subtitle": "تعلم اللغات بشكل طبيعي من خلال المحتوى الغامر",
      "about.description": "LinguaContent هي منصة مصممة لمساعدتك على تعلم اللغات بشكل طبيعي من خلال التفاعل مع المحتوى الذي يهمك. نهجنا متعدد اللغات يسمح لك بالتبديل بين اللغات بسهولة، مما يعزز فهمك ومفرداتك.",
      "about.method.title": "طريقتنا",
      "about.method.description": "نعتقد أن الطريقة الأكثر فعالية لتعلم لغة هي من خلال الانغماس في المحتوى الأصيل. من خلال قراءة أو مشاهدة أو الاستماع إلى المواد التي تهمك حقًا بلغات متعددة، تطور فهمًا أكثر بديهية لأنماط اللغة."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
