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
            ar: '🎓 الأولى بكالوريا'
        },
        'nav.bac2': {
            fr: '🏆 Bac 2ème',
            ar: '🏆 الثانية بكالوريا'
        },
        'nav.contact': {
            fr: '📧 Contact',
            ar: '📧 اتصل بنا'
        },
        'nav.seconde': {
            fr: '📘 Seconde',
            ar: '📘 الثانية'
        },
        'nav.premiere': {
            fr: '📗 Première',
            ar: '📗 الأولى'
        },
        'nav.terminale': {
            fr: '📕 Terminale',
            ar: '📕 النهائية'
        },
        'nav.lycee': {
            fr: '🎓 Lycée',
            ar: '🎓 الثانوي التأهيلي'
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
        'features.title': {
            fr: 'Pourquoi MatheuxMed ?',
            ar: 'لماذا ماثوكس ميد؟'
        },
        'feature.interactive': {
            fr: 'Interactif',
            ar: 'تفاعلي'
        },
        'feature.interactive.desc': {
            fr: 'Graphiques Desmos, géométrie GeoGebra, simulations PhET',
            ar: 'رسوم بيانية Desmos، هندسة GeoGebra، محاكاة PhET'
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
            ar: 'اكسب نقاطا، افتح الأوسمة وتقدّم'
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
            ar: 'الأولى بكالوريا (علوم تجريبية/رياضية)'
        },
        'level.bac1se.desc': {
            fr: 'Limite, continuité, dérivée et fonctions exponentielles',
            ar: 'الحد والاستمرارية والمشتقة والدوال الأسية'
        },
        'level.bac1sh': {
            fr: '1ère Bac SH',
            ar: 'الأولى بكالوريا (علوم إنسانية)'
        },
        'level.bac1sh.desc': {
            fr: 'Statistiques, probabilités et algèbre linéaire',
            ar: 'الإحصائيات والاحتمالات والجبر الخطي'
        },
        'level.bac2pc': {
            fr: '2ème Bac PC',
            ar: 'الثانية بكالوريا (فيزياء وكيمياء)'
        },
        'level.bac2pc.desc': {
            fr: 'Intégrales, équations différentielles et géométrie 3D',
            ar: 'التكاملات والمعادلات التفاضلية والهندسة ثلاثية الأبعاد'
        },
        'level.bac2svt': {
            fr: '2ème Bac SVT',
            ar: 'الثانية بكالوريا (علوم الحياة والأرض)'
        },
        'level.bac2svt.desc': {
            fr: 'Calcul intégral, statistiques avancées',
            ar: 'حساب التفاضل والتكامل، الإحصائيات المتقدمة'
        },
        'level.bac2sm': {
            fr: '2ème Bac SM',
            ar: 'الثانية بكالوريا (علوم رياضية)'
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
        'gamif.guest': {
            fr: 'Apprenant',
            ar: 'متعلّم'
        },
        'page.title.home': { fr: 'MatheuxMed - Mathématiques Marocaines', ar: 'ماثوكس ميد - الرياضيات المغربية' },
        'page.title.levels': { fr: 'Niveaux - MatheuxMed', ar: 'المستويات - ماثوكس ميد' },
        'page.title.chapters': { fr: 'Chapitres - MatheuxMed', ar: 'الفصول - ماثوكس ميد' },
        'page.title.lessons': { fr: 'Leçons - MatheuxMed', ar: 'الدروس - ماثوكس ميد' },
        'page.title.lesson': { fr: 'Leçon - MatheuxMed', ar: 'الدرس - ماثوكس ميد' },
        'page.title.dashboard': { fr: 'Tableau de Bord - MatheuxMed', ar: 'لوحة التحكم - ماثوكس ميد' },
        'page.title.contact': { fr: 'Contact - MatheuxMed', ar: 'اتصل بنا - ماثوكس ميد' },
        'page.title.login': { fr: 'Connexion - MatheuxMed', ar: 'تسجيل الدخول - ماثوكس ميد' },
        'page.title.register': { fr: 'Inscription - MatheuxMed', ar: 'إنشاء حساب - ماثوكس ميد' },
        'level.selected': {
            fr: 'Niveau sélectionné! +5 XP',
            ar: 'تم اختيار المستوى! +5 نقاط'
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
        },

        // ===== Authentication UI =====
        'auth.login.title': { fr: 'Connexion', ar: 'تسجيل الدخول' },
        'auth.login.subtitle': { fr: 'Accédez à votre espace d\'apprentissage', ar: 'ادخل إلى مساحة التعلم الخاصة بك' },
        'auth.register.title': { fr: 'Créer un Compte', ar: 'إنشاء حساب' },
        'auth.register.subtitle': { fr: 'Inscrivez-vous pour commencer à apprendre', ar: 'سجّل للبدء في التعلم' },
        'auth.field.name': { fr: 'Nom Complet', ar: 'الاسم الكامل' },
        'auth.field.email': { fr: 'Email', ar: 'البريد الإلكتروني' },
        'auth.field.password': { fr: 'Mot de Passe', ar: 'كلمة المرور' },
        'auth.field.level': { fr: 'Niveau', ar: 'المستوى' },
        'auth.placeholder.name': { fr: 'Ahmed Bennani', ar: 'أحمد بناني' },
        'auth.placeholder.email': { fr: 'ahmed@example.com', ar: 'ahmed@example.com' },
        'auth.placeholder.password': { fr: 'Minimum 6 caractères', ar: '6 أحرف على الأقل' },
        'auth.placeholder.level': { fr: 'Sélectionnez votre niveau', ar: 'اختر مستواك' },
        'auth.login.button': { fr: 'Se connecter', ar: 'تسجيل الدخول' },
        'auth.register.button': { fr: 'S\'inscrire', ar: 'إنشاء الحساب' },
        'auth.toggle.toRegister': { fr: 'Vous n\'avez pas de compte?', ar: 'ليس لديك حساب؟' },
        'auth.toggle.toLogin': { fr: 'Vous avez déjà un compte?', ar: 'لديك حساب بالفعل؟' },
        'auth.link.register': { fr: 'S\'inscrire', ar: 'إنشاء حساب' },
        'auth.link.login': { fr: 'Se connecter', ar: 'تسجيل الدخول' },
        'auth.benefits.title': { fr: 'Avantages de l\'inscription', ar: 'مزايا التسجيل' },
        'auth.benefit1': { fr: 'Sauvegardez votre progrès', ar: 'احفظ تقدمك' },
        'auth.benefit2': { fr: 'Accédez aux quizzes interactifs', ar: 'الوصول إلى الاختبارات التفاعلية' },
        'auth.benefit3': { fr: 'Suivez vos scores', ar: 'تابع نتائجك' },
        'auth.benefit4': { fr: 'Débloquez les leçons premium', ar: 'افتح الدروس المتميزة' },
        'auth.benefit5': { fr: 'Recevez des recommandations', ar: 'احصل على توصيات' },
        'auth.login.infoTitle': { fr: 'Bienvenue sur MatheuxMed', ar: 'مرحبا بك في ماثوكس ميد' },
        'auth.login.infoIntro': { fr: 'Connectez-vous pour:', ar: 'سجّل الدخول من أجل:' },
        'auth.login.infoItem1': { fr: '📚 Accéder à tous les cours', ar: '📚 الولوج إلى جميع الدروس' },
        'auth.login.infoItem2': { fr: '✅ Sauvegarder votre progrès', ar: '✅ حفظ تقدّمك' },
        'auth.login.infoItem3': { fr: '📊 Voir vos statistiques', ar: '📊 الاطلاع على إحصائياتك' },
        'auth.login.infoItem4': { fr: '🎯 Suivre vos objectifs', ar: '🎯 متابعة أهدافك' },
        'auth.alert.fillAll': { fr: 'Veuillez remplir tous les champs', ar: 'يرجى ملء جميع الحقول' },
        'auth.msg.unavailable': { fr: 'Service d\'authentification indisponible. Veuillez rafraîchir la page.', ar: 'خدمة المصادقة غير متوفرة. يرجى تحديث الصفحة.' },
        'auth.err.rateLimit': { fr: 'Trop de tentatives d\'inscription. Veuillez patienter quelques minutes puis réessayer.', ar: 'محاولات تسجيل كثيرة. يرجى الانتظار بضع دقائق ثم إعادة المحاولة.' },
        'auth.err.exists': { fr: 'Un compte existe déjà avec cet email. Connectez-vous plutôt.', ar: 'يوجد حساب بالفعل بهذا البريد الإلكتروني. سجّل الدخول بدلا من ذلك.' },
        'auth.err.invalidEmail': { fr: 'Adresse email invalide. Vérifiez le format (ex: nom@domaine.com).', ar: 'البريد الإلكتروني غير صالح. تحقق من الصيغة (مثال: nom@domaine.com).' },
        'auth.err.signupDisabled': { fr: 'Les inscriptions sont temporairement désactivées.', ar: 'التسجيلات معطّلة مؤقتا.' },
        'auth.err.emailNotConfirmed': { fr: 'Votre email n\'est pas encore confirmé. Vérifiez votre boîte de réception.', ar: 'لم يتم تأكيد بريدك الإلكتروني بعد. تحقق من صندوق الوارد.' },
        'auth.err.badCredentials': { fr: 'Email ou mot de passe incorrect.', ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' },
        'auth.err.weakPassword': { fr: 'Le mot de passe est trop faible (6 caractères minimum).', ar: 'كلمة المرور ضعيفة جدا (6 أحرف على الأقل).' },
        'auth.err.registerFailed': { fr: 'Inscription impossible. Réessayez plus tard.', ar: 'تعذّر إنشاء الحساب. أعد المحاولة لاحقا.' },
        'auth.msg.registerConfirm': { fr: '✅ Compte créé! Vérifiez votre boîte email ({email}) pour confirmer votre inscription, puis connectez-vous.', ar: '✅ تم إنشاء الحساب! تحقق من بريدك الإلكتروني ({email}) لتأكيد التسجيل، ثم سجّل الدخول.' },
        'auth.msg.registerSuccess': { fr: '✅ Inscription réussie! Bienvenue {name}', ar: '✅ تم التسجيل بنجاح! مرحبا {name}' },
        'auth.msg.loginSuccess': { fr: '✅ Connexion réussie! Bienvenue {name}', ar: '✅ تم تسجيل الدخول بنجاح! مرحبا {name}' },
        'auth.msg.logoutSuccess': { fr: '✅ Déconnexion réussie', ar: '✅ تم تسجيل الخروج بنجاح' },
        'auth.err.logoutFailed': { fr: 'Déconnexion impossible', ar: 'تعذّر تسجيل الخروج' },
        'auth.err.loginRequired': { fr: 'Vous devez être connecté', ar: 'يجب تسجيل الدخول' },
        'reg.cycle.primary': { fr: 'Primaire', ar: 'الابتدائي' },
        'reg.cycle.middle': { fr: 'Collège', ar: 'الإعدادي' },
        'reg.cycle.high': { fr: 'Lycée', ar: 'الثانوي التأهيلي' },
        'reg.level.p1': { fr: '1ère Année Primaire', ar: 'السنة الأولى ابتدائي' },
        'reg.level.p2': { fr: '2ème Année Primaire', ar: 'السنة الثانية ابتدائي' },
        'reg.level.p3': { fr: '3ème Année Primaire', ar: 'السنة الثالثة ابتدائي' },
        'reg.level.p4': { fr: '4ème Année Primaire', ar: 'السنة الرابعة ابتدائي' },
        'reg.level.p5': { fr: '5ème Année Primaire', ar: 'السنة الخامسة ابتدائي' },
        'reg.level.p6': { fr: '6ème Année Primaire', ar: 'السنة السادسة ابتدائي' },
        'reg.level.c1': { fr: '1ère Année Collège', ar: 'السنة الأولى إعدادي' },
        'reg.level.c2': { fr: '2ème Année Collège', ar: 'السنة الثانية إعدادي' },
        'reg.level.c3': { fr: '3ème Année Collège', ar: 'السنة الثالثة إعدادي' },
        'reg.level.tc': { fr: 'Tronc Commun', ar: 'الجذع المشترك' },
        'reg.level.b1': { fr: '1ère Année Bac (SE/SM)', ar: 'السنة الأولى بكالوريا (علوم تجريبية/رياضية)' },
        'reg.level.b2': { fr: '2ème Année Bac (PC/SVT/SM)', ar: 'السنة الثانية بكالوريا (فيزياء/علوم الحياة والأرض/رياضية)' },
        'auth.nav.login': { fr: 'Connexion', ar: 'تسجيل الدخول' },
        'auth.nav.register': { fr: 'Inscription', ar: 'إنشاء حساب' },
        'auth.nav.logout': { fr: 'Déconnexion', ar: 'تسجيل الخروج' },
        'auth.nav.dashboard': { fr: '📊 Tableau de bord', ar: '📊 لوحة التحكم' },

        // ===== Catalog (levels / chapters / lessons) =====
        'catalog.chooseCycle': { fr: 'Choisissez votre cycle', ar: 'اختر سلكك الدراسي' },
        'catalog.explore': { fr: 'Explorer →', ar: '← استكشف' },
        'catalog.levelsCount': { fr: '{n} niveaux', ar: '{n} مستويات' },
        'catalog.chaptersCount': { fr: '{n} chapitres', ar: '{n} فصول' },
        'catalog.lessonsCount': { fr: '{n} leçons', ar: '{n} دروس' },
        'catalog.lessonCountOne': { fr: '1 leçon', ar: 'درس واحد' },
        'catalog.viewChapters': { fr: 'Voir les chapitres →', ar: '← عرض الفصول' },
        'catalog.viewLessons': { fr: 'Voir les leçons →', ar: '← عرض الدروس' },
        'catalog.accessLesson': { fr: 'Accéder à la leçon →', ar: '← الوصول إلى الدرس' },
        'catalog.backHome': { fr: '← Retour à l\'accueil', ar: '← العودة إلى الرئيسية' },
        'catalog.backLevels': { fr: '← Retour aux niveaux', ar: '← العودة إلى المستويات' },
        'catalog.backChapters': { fr: '← Retour aux chapitres', ar: '← العودة إلى الفصول' },
        'catalog.backLessons': { fr: '← Retour aux leçons', ar: '← العودة إلى الدروس' },
        'catalog.difficulty.beginner': { fr: 'Débutant', ar: 'مبتدئ' },
        'catalog.difficulty.intermediate': { fr: 'Intermédiaire', ar: 'متوسط' },
        'catalog.difficulty.advanced': { fr: 'Avancé', ar: 'متقدم' },
        'catalog.minutes': { fr: '{n} min', ar: '{n} د' },
        'catalog.errorTitle': { fr: 'Oups', ar: 'عذرا' },
        'catalog.error.category': { fr: 'Catégorie introuvable.', ar: 'السلك الدراسي غير موجود.' },
        'catalog.error.level': { fr: 'Niveau introuvable.', ar: 'المستوى غير موجود.' },
        'catalog.error.chapter': { fr: 'Chapitre introuvable.', ar: 'الفصل غير موجود.' },
        'catalog.error.lesson': { fr: 'Leçon introuvable.', ar: 'الدرس غير موجود.' },
        'catalog.error.curriculum': { fr: 'Impossible de charger le programme.', ar: 'تعذّر تحميل البرنامج.' },
        'catalog.error.chapters': { fr: 'Impossible de charger les chapitres.', ar: 'تعذّر تحميل الفصول.' },
        'catalog.error.lessons': { fr: 'Impossible de charger les leçons.', ar: 'تعذّر تحميل الدروس.' },
        'catalog.error.lessonPage': { fr: 'Impossible de charger la leçon.', ar: 'تعذّر تحميل الدرس.' },
        'catalog.notLoaded': { fr: 'Le programme n\'a pas pu être chargé.', ar: 'تعذّر تحميل البرنامج.' },
        'catalog.lessonSoon': { fr: '📝 Le contenu détaillé de cette leçon sera bientôt disponible.', ar: '📝 سيتوفر المحتوى المفصّل لهذا الدرس قريبا.' },
        'catalog.signInBanner': { fr: '💡 Connectez-vous pour sauvegarder votre progression et vos scores.', ar: '💡 سجّل الدخول لحفظ تقدّمك ونتائجك.' },

        // ===== Student profile dropdown =====
        'profile.level': { fr: 'Niveau', ar: 'المستوى' },
        'profile.points': { fr: 'Points', ar: 'النقاط' },
        'profile.lessonsCompleted': { fr: 'Leçons complétées', ar: 'الدروس المكتملة' },
        'profile.memberSince': { fr: 'Membre depuis', ar: 'عضو منذ' },
        'profile.defaultStudent': { fr: 'Étudiant', ar: 'طالب' },

        // ===== Student dashboard =====
        'dash.title': { fr: '📊 Tableau de Bord', ar: '📊 لوحة التحكم' },
        'dash.welcome': { fr: 'Bienvenue {name}!', ar: 'مرحبا {name}!' },
        'dash.profile': { fr: '👤 Profil Étudiant', ar: '👤 ملف الطالب' },
        'dash.name': { fr: 'Nom', ar: 'الاسم' },
        'dash.email': { fr: 'Email', ar: 'البريد الإلكتروني' },
        'dash.level': { fr: 'Niveau', ar: 'المستوى' },
        'dash.memberSince': { fr: 'Membre depuis', ar: 'عضو منذ' },
        'dash.stats': { fr: '📈 Statistiques', ar: '📈 الإحصائيات' },
        'dash.completedLessons': { fr: 'Leçons Complétées', ar: 'الدروس المكتملة' },
        'dash.totalPoints': { fr: 'Points Totaux', ar: 'مجموع النقاط' },
        'dash.avgScore': { fr: 'Score Moyen', ar: 'المعدل العام' },
        'dash.progressByLevel': { fr: '🎯 Progression par Niveau', ar: '🎯 التقدم حسب المستوى' },
        'dash.loadingProgress': { fr: 'Chargement de la progression…', ar: 'جارٍ تحميل التقدم…' },
        'dash.noLevel': { fr: 'Aucun niveau disponible', ar: 'لا يوجد مستوى متاح' },
        'dash.progressUnavailable': { fr: 'Progression indisponible', ar: 'التقدم غير متاح' },
        'dash.recentActivity': { fr: '📅 Activité Récente', ar: '📅 النشاط الأخير' },
        'dash.noActivity': { fr: 'Pas d\'activité récente', ar: 'لا يوجد نشاط حديث' },
        'dash.lessonsDone': { fr: '{done}/{total} leçon(s) complétée(s)', ar: '{done}/{total} درس مكتمل' },
        'dash.loginRequired': { fr: 'Vous devez être connecté pour accéder au tableau de bord', ar: 'يجب تسجيل الدخول للوصول إلى لوحة التحكم' },
        'dash.authUnavailable': { fr: 'Service d\'authentification indisponible. Veuillez rafraîchir la page.', ar: 'خدمة المصادقة غير متوفرة. يرجى تحديث الصفحة.' }
    },

    // Pick a data field localized for the current language.
    // Usage: I18N.localize(node, 'title') -> node.titleAr in Arabic, else node.title
    localize: function (node, field) {
        if (!node) return '';
        if (this.currentLanguage === 'ar') {
            const arValue = node[field + 'Ar'];
            if (arValue) return arValue;
        }
        return node[field] || '';
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
