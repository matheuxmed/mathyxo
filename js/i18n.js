// ===== Internationalization System =====
// Handles language switching, RTL support, and regional adaptations

const I18N = {
    // Current language (stored in localStorage)
    currentLanguage: localStorage.getItem('mathyxo_language') || 'fr',
    
    // Supported languages with metadata
    languages: {
        fr: {
            name: 'Français',
            flag: '🇫🇷',
            dir: 'ltr',
            dateFormat: 'DD/MM/YYYY'
        },
        ar: {
            name: 'العربية',
            flag: '🇸🇦',
            dir: 'rtl',
            dateFormat: 'YYYY/MM/DD'
        }
    },
    
    // Translation dictionary
    translations: {
        // ===== Header & Navigation =====
        'header.siteName': {
            fr: '📐 MatheuxMed',
            ar: '📐 ماثوكس ميد'
        },
        'nav.home': {
            fr: '🏠 Accueil',
            ar: '🏠 الرئيسية'
        },
        'nav.primary': {
            fr: '📚 Primaire',
            ar: '📚 الابتدائي'
        },
        'nav.middle': {
            fr: '📖 Collège',
            ar: '📖 الإعدادي'
        },
        'nav.trunk': {
            fr: '📊 Tronc Commun',
            ar: '📊 الجذع المشترك'
        },
        'nav.bac1': {
            fr: '🎓 Bac 1ère',
            ar: '🎓 الأول بكالوريا'
        },
        'nav.bac2': {
            fr: '🏆 Bac 2ème',
            ar: '🏆 الثاني بكالوريا'
        },
        'nav.contact': {
            fr: '📧 Contact',
            ar: '📧 اتصل بنا'
        },
        
        // ===== Hero Section =====
        'hero.greeting': {
            fr: 'Bienvenue, {name}! 👋',
            ar: 'أهلا وسهلا، {name}! 👋'
        },
        'hero.stats': {
            fr: 'Vous avez {xp} XP • Niveau {level} • {lessons} leçons complétées',
            ar: 'لديك {xp} نقطة • المستوى {level} • {lessons} درس مكتمل'
        },
        'hero.tagline': {
            fr: '100% Gratuit • Interactif • En Français',
            ar: '100% مجاني • تفاعلي • بالعربية'
        },
        
        // ===== Features =====
        'feature.interactive': {
            fr: 'Interactif',
            ar: 'تفاعلي'
        },
        'feature.interactive.desc': {
            fr: 'Graphiques Desmos, géométrie GeoGebra, simulations PhET',
            ar: 'رسوم بيانية Desmos، هندسة GeoGebra، محاكاات PhET'
        },
        'feature.pedagogical': {
            fr: 'Pédagogique',
            ar: 'تربوي'
        },
        'feature.pedagogical.desc': {
            fr: 'Explications claires, exercices progressifs, quizzes intégrés',
            ar: 'شروحات واضحة، تمارين تدريجية، اختبارات متكاملة'
        },
        'feature.free': {
            fr: 'Gratuit',
            ar: 'مجاني'
        },
        'feature.free.desc': {
            fr: '100% gratuit, 0 publicité, accessible de partout',
            ar: '100% مجاني، بدون إعلانات، متاح في كل مكان'
        },
        'feature.responsive': {
            fr: 'Responsive',
            ar: 'متجاوب'
        },
        'feature.responsive.desc': {
            fr: 'Fonctionne sur desktop, tablette et téléphone',
            ar: 'يعمل على سطح المكتب والكمبيوتر اللوحي والهاتف'
        },
        'feature.gamified': {
            fr: 'Gamifié',
            ar: 'مُلعّب'
        },
        'feature.gamified.desc': {
            fr: 'Gagnez des XP, débloquez des badges et progressez',
            ar: 'اكسب نقاط، فتح الأوسمة والتقدم'
        },
        'feature.moroccan': {
            fr: 'Marocain',
            ar: 'مغربي'
        },
        'feature.moroccan.desc': {
            fr: 'Aligné avec le curriculum marocain officiel',
            ar: 'متوافق مع المناهج الرسمية المغربية'
        },
        
        // ===== Buttons & CTA =====
        'btn.start': {
            fr: 'Commencer →',
            ar: '← ابدأ'
        },
        'btn.access_lesson': {
            fr: 'Accéder à la leçon →',
            ar: '← الوصول إلى الدرس'
        },
        'btn.back': {
            fr: '← Retour à l\'accueil',
            ar: 'العودة إلى الرئيسية ←'
        },
        'btn.discover': {
            fr: 'Découvrir les Niveaux',
            ar: 'اكتشف المستويات'
        },
        'btn.contact': {
            fr: 'Nous Contacter',
            ar: 'اتصل بنا'
        },
        
        // ===== CTA Section =====
        'cta.title': {
            fr: 'Prêt à apprendre?',
            ar: 'هل أنت مستعد للتعلم؟'
        },
        'cta.subtitle': {
            fr: 'Choisissez votre niveau et commencez votre voyage éducatif',
            ar: 'اختر مستواك وابدأ رحلتك التعليمية'
        },
        
        // ===== Education Levels =====
        'level.primary1': {
            fr: '1ère Primaire',
            ar: 'الأول ابتدائي'
        },
        'level.primary1.desc': {
            fr: 'Bases des mathématiques : compter, formes et patterns',
            ar: 'أساسيات الرياضيات: العد والأشكال والأنماط'
        },
        'level.primary2': {
            fr: '2ème Primaire',
            ar: 'الثاني ابتدائي'
        },
        'level.primary2.desc': {
            fr: 'Addition, soustraction et premières opérations',
            ar: 'الجمع والطرح والعمليات الأساسية'
        },
        'level.primary3': {
            fr: '3ème Primaire',
            ar: 'الثالث ابتدائي'
        },
        'level.primary3.desc': {
            fr: 'Multiplication, division et fractions simples',
            ar: 'الضرب والقسمة والكسور البسيطة'
        },
        'level.primary4': {
            fr: '4ème Primaire',
            ar: 'الرابع ابتدائي'
        },
        'level.primary4.desc': {
            fr: 'Fractions décimales et géométrie de base',
            ar: 'الكسور العشرية والهندسة الأساسية'
        },
        'level.primary5': {
            fr: '5ème Primaire',
            ar: 'الخامس ابتدائي'
        },
        'level.primary5.desc': {
            fr: 'Nombres décimaux et géométrie plane',
            ar: 'الأعداد العشرية والهندسة المستوية'
        },
        'level.primary6': {
            fr: '6ème Primaire',
            ar: 'السادس ابتدائي'
        },
        'level.primary6.desc': {
            fr: 'Préparation au collège : statistiques simples',
            ar: 'الإعداد للإعدادي: الإحصائيات البسيطة'
        },
        'level.middle1': {
            fr: '1ère Année Collège',
            ar: 'الأول الإعدادي'
        },
        'level.middle1.desc': {
            fr: 'Nombres entiers, fractions et opérations',
            ar: 'الأعداد الصحيحة والكسور والعمليات'
        },
        'level.middle2': {
            fr: '2ème Année Collège',
            ar: 'الثاني الإعدادي'
        },
        'level.middle2.desc': {
            fr: 'Equations, proportions et géométrie',
            ar: 'المعادلات والنسب والهندسة'
        },
        'level.middle3': {
            fr: '3ème Année Collège',
            ar: 'الثالث الإعدادي'
        },
        'level.middle3.desc': {
            fr: 'Théorème de Pythagore, trigonométrie basique',
            ar: 'نظرية فيثاغورس، حساب المثلثات الأساسي'
        },
        'level.trunk': {
            fr: 'Tronc Commun',
            ar: 'الجذع المشترك'
        },
        'level.trunk.desc': {
            fr: 'Fondamentaux pour tous : équations, fonctions et géométrie',
            ar: 'الأساسيات للجميع: المعادلات والدوال والهندسة'
        },
        'level.bac1se': {
            fr: '1ère Bac SE/SM',
            ar: '1ère Bac SE/SM'
        },
        'level.bac1se.desc': {
            fr: 'Limite, continuité, dérivée et fonctions exponentielles',
            ar: 'الحد والاستمرارية والمشتقة والدوال الأسية'
        },
        'level.bac1sh': {
            fr: '1ère Bac SH',
            ar: '1ère Bac SH'
        },
        'level.bac1sh.desc': {
            fr: 'Statistiques, probabilités et algèbre linéaire',
            ar: 'الإحصائيات والاحتمالات والجبر الخطي'
        },
        'level.bac2pc': {
            fr: '2ème Bac PC',
            ar: '2ème Bac PC'
        },
        'level.bac2pc.desc': {
            fr: 'Intégrales, équations différentielles et géométrie 3D',
            ar: 'التكاملات والمعادلات التفاضلية والهندسة ثلاثية الأبعاد'
        },
        'level.bac2svt': {
            fr: '2ème Bac SVT',
            ar: '2ème Bac SVT'
        },
        'level.bac2svt.desc': {
            fr: 'Calcul intégral, statistiques avancées',
            ar: 'حساب التفاضل والتكامل، الإحصائيات المتقدمة'
        },
        'level.bac2sm': {
            fr: '2ème Bac SM',
            ar: '2ème Bac SM'
        },
        'level.bac2sm.desc': {
            fr: 'Algèbre avancée, géométrie et séries',
            ar: 'الجبر المتقدم والهندسة والسلاسل'
        },
        
        // ===== Contact Page =====
        'contact.title': {
            fr: '📧 Contactez-moi',
            ar: '📧 اتصل بي'
        },
        'contact.subtitle': {
            fr: 'Connectez-vous avec moi sur les réseaux sociaux',
            ar: 'تواصل معي على وسائل التواصل الاجتماعي'
        },
        
        // ===== Social Links =====
        'social.github': {
            fr: 'GitHub',
            ar: 'جيتهاب'
        },
        'social.email': {
            fr: 'Email',
            ar: 'البريد الإلكتروني'
        },
        'social.linkedin': {
            fr: 'LinkedIn',
            ar: 'لينكدإن'
        },
        'social.twitter': {
            fr: 'Twitter',
            ar: 'تويتر'
        },
        'social.instagram': {
            fr: 'Instagram',
            ar: 'إنستجرام'
        },
        
        // ===== Footer =====
        'footer.copyright': {
            fr: '© {year} {siteName}. Plateforme gratuite pour l\'enseignement des mathématiques.',
            ar: '© {year} {siteName}. منصة مجانية لتعليم الرياضيات.'
        },
        'footer.madeWith': {
            fr: 'Créée avec ❤️ pour les lycéens marocains',
            ar: 'تم إنشاؤها بحب ❤️ لطلاب الثانويات المغاربة'
        },
        
        // ===== Gamification =====
        'gamif.level': {
            fr: 'Niveau',
            ar: 'المستوى'
        },
        'gamif.xp': {
            fr: 'XP',
            ar: 'النقاط'
        },
        'gamif.profile': {
            fr: 'Profil',
            ar: 'الملف الشخصي'
        },
        
        // ===== Lessons (Seconde example) =====
        'lesson.seconde.title': {
            fr: '📘 Mathématiques - Seconde',
            ar: '📘 الرياضيات - الثانية'
        },
        'lesson.seconde.desc': {
            fr: 'Explorez les fondamentaux des mathématiques avec des leçons interactives',
            ar: 'استكشف أساسيات الرياضيات مع دروس تفاعلية'
        },
        'lesson.equations': {
            fr: 'Équations et Inéquations',
            ar: 'المعادلات والمتباينات'
        },
        'lesson.functions': {
            fr: 'Fonctions et Graphiques',
            ar: 'الدوال والرسوم البيانية'
        },
        'lesson.quadratic': {
            fr: 'Fonctions du Second Degré',
            ar: 'دوال الدرجة الثانية'
        },
        'lesson.vectors': {
            fr: 'Vecteurs et Géométrie Plane',
            ar: 'المتجهات والهندسة المستوية'
        },
        'lesson.geometry': {
            fr: 'Géométrie: Droites et Cercles',
            ar: 'الهندسة: الخطوط والدوائر'
        },
        'lesson.statistics': {
            fr: 'Statistiques Descriptives',
            ar: 'الإحصائيات الوصفية'
        },
        'lesson.probability': {
            fr: 'Probabilités Simples',
            ar: 'الاحتمالات البسيطة'
        },
        'lesson.transformations': {
            fr: 'Transformations Géométriques',
            ar: 'التحويلات الهندسية'
        },
        
        // ===== Tips =====
        'tips.title': {
            fr: '🎯 Conseils pour Réussir',
            ar: '🎯 نصائح النجاح'
        },
        'tips.progression': {
            fr: 'Suivi des leçons dans l\'ordre proposé',
            ar: 'اتبع الدروس بالترتيب المقترح'
        },
        'tips.explore': {
            fr: 'Explorez les outils interactifs pour mieux comprendre',
            ar: 'استكشف الأدوات التفاعلية لفهم أفضل'
        },
        'tips.quiz': {
            fr: 'Répondez aux quizzes pour valider vos acquis',
            ar: 'أجب على الاختبارات للتحقق من فهمك'
        },
        'tips.practice': {
            fr: 'Pratiquez régulièrement avec les exercices',
            ar: 'تدرب بانتظام مع التمارين'
        },
        'tips.revisit': {
            fr: 'Revisitez les concepts difficiles autant de fois que nécessaire',
            ar: 'أعد زيارة المفاهيم الصعبة كما تشاء'
        }
    },
    
    // Get translated text
    t: function(key, params = {}) {
        const lang = this.currentLanguage;
        let text = this.translations[key]?.[lang] || this.translations[key]?.['fr'] || key;
        
        // Replace parameters
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
        
        return text;
    },
    
    // Set language
    setLanguage: function(lang) {
        if (this.languages[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('mathyxo_language', lang);
            document.documentElement.lang = lang;
            document.documentElement.dir = this.languages[lang].dir;
            document.body.setAttribute('data-lang', lang);
            
            // Trigger translation update
            if (window.updatePageTranslations) {
                window.updatePageTranslations();
            }
            
            return true;
        }
        return false;
    },
    
    // Get current language info
    getLanguage: function() {
        return this.languages[this.currentLanguage];
    },
    
    // Get all available languages
    getAvailableLanguages: function() {
        return this.languages;
    },
    
    // Initialize I18N system
    init: function() {
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = this.languages[this.currentLanguage].dir;
        document.body.setAttribute('data-lang', this.currentLanguage);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    I18N.init();
});
