// ===== Language Switcher Component =====
// Provides UI for language selection with visual flags

const LANGUAGE_SWITCHER = {
    // Create the language switcher HTML
    render: function() {
        const languages = I18N.getAvailableLanguages();
        let switcherHTML = `<div class="language-switcher" id="language-switcher">`;
        
        Object.entries(languages).forEach(([langCode, langData]) => {
            const isActive = I18N.currentLanguage === langCode ? 'active' : '';
            switcherHTML += `
                <button 
                    class="lang-btn ${isActive}" 
                    data-lang="${langCode}" 
                    title="${langData.name}"
                    aria-label="Switch to ${langData.name}">
                    <span class="flag">${langData.flag}</span>
                    <span class="lang-name">${langData.name}</span>
                </button>
            `;
        });
        
        switcherHTML += `</div>`;
        return switcherHTML;
    },
    
    // Initialize the switcher
    init: function() {
        // Inject switcher into header
        setTimeout(() => {
            const header = document.querySelector('header');
            if (header && !document.getElementById('language-switcher')) {
                const switcher = document.createElement('div');
                switcher.innerHTML = this.render();
                header.appendChild(switcher.firstElementChild);
                this.attachEventListeners();
            }
        }, 100);
    },
    
    // Attach click listeners to language buttons
    attachEventListeners: function() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedLang = button.getAttribute('data-lang');
                this.switchLanguage(selectedLang);
            });
        });
    },
    
    // Switch language and update UI
    switchLanguage: function(lang) {
        // Set language in i18n system
        I18N.setLanguage(lang);
        
        // Update active button state
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
        
        // Update all text content that uses i18n
        this.updatePageContent();
        
        // Trigger custom event for other listeners
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    },
    
    // Update all translatable content on the page
    updatePageContent: function() {
        // Update nav items
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();
            
            // Find corresponding i18n key
            if (text.includes('Accueil') || text.includes('الرئيسية')) {
                link.textContent = I18N.t('nav.home');
            } else if (text.includes('Primaire') || text.includes('الابتدائي')) {
                link.textContent = I18N.t('nav.primary');
            } else if (text.includes('Collège') || text.includes('الإعدادي')) {
                link.textContent = I18N.t('nav.middle');
            } else if (text.includes('Tronc Commun') || text.includes('الجذع المشترك')) {
                link.textContent = I18N.t('nav.trunk');
            } else if (text.includes('Bac 1ère') || text.includes('الأول')) {
                link.textContent = I18N.t('nav.bac1');
            } else if (text.includes('Bac 2ème') || text.includes('الثاني')) {
                link.textContent = I18N.t('nav.bac2');
            } else if (text.includes('Contact') || text.includes('اتصل')) {
                link.textContent = I18N.t('nav.contact');
            }
        });
        
        // Reload page to apply all translations
        setTimeout(() => {
            location.reload();
        }, 300);
    }
};

// Initialize language switcher when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (typeof I18N !== 'undefined') {
        LANGUAGE_SWITCHER.init();
    }
});
