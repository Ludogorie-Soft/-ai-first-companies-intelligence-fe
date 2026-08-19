"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "bg" | "en";

const translations = {
  bg: {
    // App
    appName: "Companies Intelligence",

    appTagline: "Data Enrich",

    // Auth
    login: "Вход",
    register: "Регистрация",
    email: "Имейл",
    password: "Парола",
    tenantName: "Име на фирмата",
    tenantNamePlaceholder: "напр. Людогорие Софт",
    signIn: "Влезте",
    createAccount: "Създайте акаунт",
    signingIn: "Влизане…",
    creating: "Създаване…",

    // Dashboard
    dashboard: "Табло",
    uploadTitle: "Качете CSV или Excel файл",
    uploadSubtitle: 'Файлът трябва да съдържа колона с домейни (напр. firma.bg, company.com). Имената на фирми не се поддържат.',
    uploadNoDomains: 'Файлът не съдържа валидни домейни. Всеки ред трябва да е домейн (напр. firma.bg), а не име на фирма.',
    chooseFile: "Изберете файл",
    forceRecrawl: "Принудително прекопиране",
    uploadProcess: "Качи & Обработи",
    uploading: "Качване…",
    batches: "Партиди",

    // Table headers
    file: "Файл",
    status: "Статус",
    progress: "Прогрес",
    count: "Брой",
    created: "Създадено",
    actions: "Действия",

    // Statuses
    processing: "Обработка",
    done: "Готово",
    failed: "Грешка",
    pending: "Изчакване",
    crawling: "Сканиране",

    // Actions
    view: "Преглед",
    delete: "Изтрий",
    download: "Изтегли",

    // Modal
    domain: "Домейн",
    name: "Име",
    score: "Резултат",
    emails: "Имейли",
    team: "Екип",
    personalized: "Персонализация",
    noCompanies: "Няма компании в тази партида.",
    showing: "Показване",
    of: "от",
    prev: "← Назад",
    next: "Напред →",

    // Empty / messages
    noBatches: "Все още няма партиди. Качете файл по-горе, за да започнете.",
    loading: "Зареждане…",
    confirmDelete: "Изтрийте",
    confirmDeleteMsg:
      "Това премахва партидата и нейните асоциации. Действието не може да бъде отменено.",
    batchDeleted: "Партидата е изтрита.",
    downloadFailed: "Изтеглянето неуспешно: ",
    deleteFailed: "Изтриването неуспешно: ",

    // Notifications
    verifiedBanner: "Вашият имейл е потвърден успешно.",
    registeredBanner: "Добре дошли! Изпратен е имейл за потвърждение на",
    checkInbox: ". Моля проверете входящата кутия.",
    invalidLink:
      "Тази връзка за потвърждение е невалидна или вече е използвана.",

    // Dashboard headings
    enrichmentEngine: "Domain Enrichment Engine",
    uploadDomains: "Качи домейни",
    selectFileOrDrag: "Изберете файл или го плъзнете тук",
    batchHistory: "История на партидите",
    batchId: "Партида",
    date: "Дата",
    totalDomains: "Общо домейни",
    loadingBatches: "Зареждане на партиди…",
    success: "Успех",
    logout: "Изход",
    firmographics: "Фирмография",
    techStack: "Технологии",
    contacts: "Контакти",

    // Persona search
    personaSearch: "Търсене по персона",
    personaSearchSubtitle: "Открийте организации по категория и местоположение",
    personaLabel: "Категория / персона",
    personaPlaceholder: "напр. детски градини, зъболекари, автосервизи",
    locationLabel: "Област / Град",
    locationPlaceholder: "напр. област Ловеч, гр. Варна",
    keywordsLabel: "Допълнителни ключови думи (незадължително)",
    keywordsPlaceholder: "напр. частни, общински",
    maxResultsLabel: "Максимален брой резултати",
    forceRefreshLabel: "Пресни резултати",
    forceRefreshHint: "Пропуска кеша и търси наново. Използвайте при повторно търсене — иначе се показват запазените резултати отпреди.",
    emailLanguageLabel: "Език на имейлите",
    emailLanguageBg: "Български",
    emailLanguageEn: "Английски",
    emailLanguageWebsite: "Както на сайта",
    searchStart: "Търси & Обработи",
    searching: "Търсене…",
    searchSuccess: "Търсенето е стартирано! Резултатите ще се появят в таблицата.",
    uploadTab: "Качи CSV",
    personaTab: "Търсене по персона",
    sourcePersona: "Персона",
    sourceUpload: "CSV файл",

    // Candidates tab
    resultsTab: "Резултати",
    reviewTab: "За преглед",
    candidatesTab: "Всички кандидати",
    candidateKept: "Включен",
    candidateReview: "За преглед",
    candidateFiltered: "Филтриран от AI",
    candidateBlocked: "Блокиран",
    candidateExcluded: "Изключен",
    excludeBtn: "Изключи",
    includeBtn: "Добави",
    rejectBtn: "Отхвърли",
    candidateTitle: "Заглавие",
    noCandidates: "Няма данни за кандидати. Само резултати от търсене по персона показват кандидати.",

    // Decision reasons
    reasonColumn: "Причина",
    criteriaHeading: "Критерии за решението",
    noReviewNeeded: "Нищо не чака преглед — филтърът е бил сигурен за всички намерени сайтове.",
    reviewIntro: "Тези сайтове не са категорично добри или лоши. Прегледайте ги и решете.",
    confidenceLabel: "Увереност",
    noCriteria: "Няма записани критерии за този кандидат.",

    // Decision stages
    stage_search: "Търсене",
    stage_blocklist: "Списък с агрегатори",
    stage_llm: "AI филтър",
    stage_classifier: "Анализ на страницата",
    stage_location: "Локация",
    stage_qualifier: "Финална оценка",
    stage_post_crawl: "След обхождане",

    // Decision reason codes
    reason_BLOCKLISTED_AGGREGATOR: "Известен агрегатор или каталог",
    reason_MUNICIPALITY_PAGE: "Страница на община",
    reason_DIRECTORY_OR_PORTAL: "Каталог или портал",
    reason_NEWS_ARTICLE: "Новинарска статия",
    reason_SOCIAL_PLATFORM: "Профил в социална мрежа",
    reason_OFFICIAL_REGISTRY: "Официален регистър или ведомство",
    reason_LOCATION_CONFLICT: "Възможно несъответствие в града",
    reason_LOCATION_CONFLICT_VERIFIED: "Потвърдено несъответствие в града",
    reason_LOCATION_UNKNOWN: "Не е разпознато населено място",
    reason_NOT_TARGET_ORGANIZATION: "Не е търсеният вид организация",
    reason_BELOW_CONFIDENCE_FLOOR: "Твърде ниска увереност",
    reason_NO_CONTACT_SIGNAL: "Няма сайт, имейл или телефон",
    reason_SAME_DOMAIN_AS_SOURCE: "Води обратно към списъчната страница",
    reason_NON_CRAWLABLE_PLATFORM: "Платформа, която не може да бъде обходена",
    reason_LLM_UNCERTAIN: "AI филтърът не е сигурен",
    reason_LLM_UNJUDGED: "AI филтърът не даде присъда",
    reason_FILTER_DEGRADED: "AI филтърът не отговори",
    reason_CONFLICTING_SIGNALS: "Противоречиви сигнали",
    reason_BORDERLINE_CONFIDENCE: "Гранична увереност",
    reason_MATCHES_PERSONA_AND_LOCATION: "Отговаря на търсенето",
    reason_EXTRACTED_FROM_LIST: "Извлечена от списъчна страница",
    reason_USER_INCLUDED: "Добавен ръчно",
    reason_USER_REJECTED: "Отхвърлен ръчно",

    // Re-enrich
    reEnrich: "Обогати",
    reEnriching: "Обогатяване…",
    reEnrichDone: (n: number) => `Обновени ${n} компании`,

    // Language toggle
    langToggle: "EN",

    // Settings / tenant profile
    settings: "Настройки",
    settingsTitle: "Профил за имейл кампании",
    settingsSubtitle: "Тези данни се използват като подател на персонализираните B2B писма.",
    settingsSave: "Запази",
    settingsSaving: "Запазване…",
    settingsSaved: "Настройките са запазени.",
    settingsFailed: "Грешка при запазване.",
    companyWebsite: "Уебсайт на фирмата",
    companyWebsitePlaceholder: "напр. https://ludogoriesoft.com",
    contactPersonName: "Име и фамилия",
    contactPersonNamePlaceholder: "напр. Севделин Димитров",
    contactPersonTitle: "Позиция",
    contactPersonTitlePlaceholder: "напр. Търговски директор",
    contactPersonPhone: "Телефон",
    contactPersonPhonePlaceholder: "напр. +359 887 810 738",
    senderSection: "Данни за подател",
    accountSection: "Акаунт",

    // Company data (sender products / about)
    companyDataNav: "Данни за компанията",
    companyDataTitle: "Данни за компанията",
    companyDataSubtitle: "Опишете накратко вашата компания. Тези данни се ползват при генериране на Email Subject, Outreach Message и Campaign Email — без измислени твърдения.",
    companyAboutLabel: "Описание на компанията (About us)",
    companyAboutPlaceholder: "Напр. кой сте, в какво сте специализирани, пазари, години опит…",
    companyServicesLabel: "Продукти / услуги (Services)",
    companyServicesPlaceholder: "Избройте реалните продукти и услуги, които предлагате…",
    companyPortfolioLabel: "Портфолио (Case studies)",
    companyPortfolioPlaceholder: "Кратки реални проекти, клиенти или резултати, които можете да споменете…",
    companyDataSave: "Запази",
    companyDataSaving: "Запазване…",
    companyDataSaved: "Данните за компанията са запазени.",
    companyDataFailed: "Грешка при запазване.",

    // Templates
    templatesTab: "Шаблони",
    templatesTitle: "Имейл шаблони",
    templatesSubtitle: "Управлявайте шаблони за персонализирани B2B писма",
    templatesNew: "Нов шаблон",
    templateName: "Название на шаблона",
    templateNamePlaceholder: "напр. Производствени фирми",
    templateSubject: "Тема на имейла",
    templateSubjectPlaceholder: "напр. Персонализирано решение за {{targetName}}",
    templateBody: "Съдържание",
    templateBodyPlaceholder: "Напишете шаблона тук. Използвайте {{targetName}}, {{senderCompanyName}} и др.",
    templateIsDefault: "Задай като шаблон по подразбиране",
    templateSave: "Запази шаблона",
    templateCancel: "Отказ",
    templateEdit: "Редактирай",
    templateSetDefault: "Задай default",
    templateDefaultBadge: "По подразбиране",
    templateCreated: "Шаблонът е създаден.",
    templateUpdated: "Шаблонът е обновен.",
    templateDeleted: "Шаблонът е изтрит.",
    templateDefaultSet: "Шаблонът е зададен като default.",
    noTemplates: "Все още няма шаблони. Добавете нов шаблон по-горе.",
    availablePlaceholders: "Налични placeholder-и:",
    selectTemplate: "Избери шаблон",
    templateDefault: "По подразбиране",
    templateSelectLabel: "Шаблон за имейл",

    // Review panel
    reviewProfile: "Профил",
    reviewContact: "Контакти",
    reviewTeam: "Екип",
    reviewServices: "Услуги",
    reviewHistory: "История",
    reviewAiEmail: "AI Имейл",
    reviewFounded: "Основана",
    reviewIndustry: "Индустрия",
    reviewDescription: "Описание",
    reviewLocation: "Локация",
    reviewPhones: "Телефони",
    reviewSocialLinks: "Социални мрежи",
    reviewEmailSubject: "Тема",
    reviewOpeningLine: "Начало",
    reviewValueProp: "Стойност",
    reviewFullMessage: "Пълен имейл",
    reviewCopy: "Копирай",
    reviewCopied: "Копирано!",
    reviewNoData: "Няма данни",
    reviewPosition: "Позиция",

    // Admin panel
    adminNav: "Администрация",
    adminTitle: "Управление на потребители",
    adminEmail: "Имейл",
    adminRole: "Роля",
    adminMonthlyLimit: "Месечен лимит",
    adminUsedThisMonth: "Използвани",
    adminRemaining: "Оставащи",
    adminActions: "Действия",
    adminUnlimited: "Неограничен",
    adminSave: "Запази",
    adminCancel: "Отказ",
    adminEdit: "Редактирай",
    adminSaved: "Запазено.",
    adminSaveFailed: "Грешка при запазване.",
    adminAccessDenied: "Нямате достъп до тази страница.",
    adminLoading: "Зареждане на потребители…",
    monthlyLimitExceeded: "Достигнахте месечния лимит на домейни. Свържете се с администратора за повече капацитет.",
    adminLastAdminError: "Последният администратор не може да бъде премахнат. Трябва да съществува поне един администратор.",

    // Admin tabs
    adminTabUsers: "Потребители",
    adminTabAuditLog: "Одитен журнал",

    // Audit log
    auditLogDate: "Дата",
    auditLogAdmin: "Администратор",
    auditLogTarget: "Засегнат потребител",
    auditLogAction: "Действие",
    auditLogOldValue: "Стара стойност",
    auditLogNewValue: "Нова стойност",
    auditLogLoading: "Зареждане на журнала…",
    auditLogEmpty: "Няма записи.",
    auditLogFilterAdmin: "Имейл на администратор",
    auditLogFilterTarget: "Имейл на потребител",
    auditLogFilterAction: "Действие",
    auditLogFilterAll: "Всички",
    auditLogFilterDateFrom: "От дата",
    auditLogFilterDateTo: "До дата",
    auditLogSearch: "Търси",
    auditLogClear: "Изчисти",
    auditLogNewest: "Най-нови първо",
    auditLogOldest: "Най-стари първо",
    auditLogPrev: "← Назад",
    auditLogNext: "Напред →",
    auditLogPage: "Страница",
    auditLogOf: "от",
    auditActionRoleChanged: "Промяна на роля",
    auditActionLimitChanged: "Промяна на месечен лимит",
    auditActionLimitRemoved: "Премахване на лимит",
    auditActionLimitAdded: "Добавяне на лимит",
  },
  en: {
    // App
    appName: "Companies Intelligence",

    appTagline: "Data Enrich",

    // Auth
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    tenantName: "Company Name",
    tenantNamePlaceholder: "e.g. Acme Corp",
    signIn: "Sign In",
    createAccount: "Create Account",
    signingIn: "Signing in…",
    creating: "Creating…",

    // Dashboard
    dashboard: "Dashboard",
    uploadTitle: "Upload a CSV or Excel file",
    uploadSubtitle: 'File must contain a column with domains (e.g. firma.bg, company.com). Company names are not supported.',
    uploadNoDomains: 'No valid domains found in the file. Each row must be a domain (e.g. firma.bg), not a company name.',
    chooseFile: "Choose File",
    forceRecrawl: "Force re-crawl",
    uploadProcess: "Upload & Process",
    uploading: "Uploading…",
    batches: "Batches",

    // Table headers
    file: "File",
    status: "Status",
    progress: "Progress",
    count: "Count",
    created: "Created",
    actions: "Actions",

    // Statuses
    processing: "Processing",
    done: "Done",
    failed: "Failed",
    pending: "Pending",
    crawling: "Crawling",

    // Actions
    view: "View",
    delete: "Delete",
    download: "Download",

    // Modal
    domain: "Domain",
    name: "Name",
    score: "Score",
    emails: "Emails",
    team: "Team",
    personalized: "Personalized",
    noCompanies: "No companies in this batch yet.",
    showing: "Showing",
    of: "of",
    prev: "← Prev",
    next: "Next →",

    // Empty / messages
    noBatches: "No batches yet. Upload a file above to get started.",
    loading: "Loading…",
    confirmDelete: "Delete",
    confirmDeleteMsg:
      "This removes the batch and its company associations. This action cannot be undone.",
    batchDeleted: "Batch deleted.",
    downloadFailed: "Download failed: ",
    deleteFailed: "Delete failed: ",

    // Notifications
    verifiedBanner: "Your email has been verified successfully.",
    registeredBanner: "Welcome! A confirmation email has been sent to",
    checkInbox: ". Please check your inbox.",
    invalidLink: "That confirmation link is invalid or has already been used.",

    // Dashboard headings
    enrichmentEngine: "Domain Enrichment Engine",
    uploadDomains: "Upload Domains",
    selectFileOrDrag: "Select file or drag it here",
    batchHistory: "Batch History",
    batchId: "Batch ID",
    date: "Date",
    totalDomains: "Total Domains",
    loadingBatches: "Loading batches…",
    success: "Success",
    logout: "Logout",
    firmographics: "Firmographics",
    techStack: "Tech Stack",
    contacts: "Contacts",

    // Persona search
    personaSearch: "Persona Search",
    personaSearchSubtitle: "Discover organizations by category and location",
    personaLabel: "Category / Persona",
    personaPlaceholder: "e.g. kindergartens, dentists, auto repair shops",
    locationLabel: "Oblast / City",
    locationPlaceholder: "e.g. Lovech oblast, Varna city",
    keywordsLabel: "Additional keywords (optional)",
    keywordsPlaceholder: "e.g. private, municipal",
    maxResultsLabel: "Max results",
    forceRefreshLabel: "Fresh results",
    forceRefreshHint: "Skips the cache and searches again. Use this when repeating a search — otherwise the stored results from last time are shown.",
    emailLanguageLabel: "Email language",
    emailLanguageBg: "Bulgarian",
    emailLanguageEn: "English",
    emailLanguageWebsite: "As on the website",
    searchStart: "Search & Process",
    searching: "Searching…",
    searchSuccess: "Search started! Results will appear in the table below.",
    uploadTab: "Upload CSV",
    personaTab: "Persona Search",
    sourcePersona: "Persona",
    sourceUpload: "CSV file",

    // Candidates tab
    resultsTab: "Results",
    reviewTab: "For Review",
    candidatesTab: "All Candidates",
    candidateKept: "Included",
    candidateReview: "For review",
    candidateFiltered: "Filtered by AI",
    candidateBlocked: "Blocked",
    candidateExcluded: "Excluded",
    excludeBtn: "Exclude",
    includeBtn: "Add",
    rejectBtn: "Reject",
    candidateTitle: "Title",
    noCandidates: "No candidate data. Only persona search batches show candidates.",

    // Decision reasons
    reasonColumn: "Reason",
    criteriaHeading: "Decision criteria",
    noReviewNeeded: "Nothing is waiting for review — the filter was confident about every site it found.",
    reviewIntro: "These sites are neither clearly good nor clearly bad. Review them and decide.",
    confidenceLabel: "Confidence",
    noCriteria: "No criteria were recorded for this candidate.",

    // Decision stages
    stage_search: "Search",
    stage_blocklist: "Aggregator list",
    stage_llm: "AI filter",
    stage_classifier: "Page analysis",
    stage_location: "Location",
    stage_qualifier: "Final scoring",
    stage_post_crawl: "After crawl",

    // Decision reason codes
    reason_BLOCKLISTED_AGGREGATOR: "Known aggregator or directory",
    reason_MUNICIPALITY_PAGE: "Municipality page",
    reason_DIRECTORY_OR_PORTAL: "Directory or portal",
    reason_NEWS_ARTICLE: "News article",
    reason_SOCIAL_PLATFORM: "Social media profile",
    reason_OFFICIAL_REGISTRY: "Official registry or authority",
    reason_LOCATION_CONFLICT: "Possible town mismatch",
    reason_LOCATION_CONFLICT_VERIFIED: "Confirmed town mismatch",
    reason_LOCATION_UNKNOWN: "No recognised town found",
    reason_NOT_TARGET_ORGANIZATION: "Not the kind of organization searched for",
    reason_BELOW_CONFIDENCE_FLOOR: "Confidence too low",
    reason_NO_CONTACT_SIGNAL: "No website, email or phone",
    reason_SAME_DOMAIN_AS_SOURCE: "Points back to the list page",
    reason_NON_CRAWLABLE_PLATFORM: "Platform that cannot be crawled",
    reason_LLM_UNCERTAIN: "The AI filter was not sure",
    reason_LLM_UNJUDGED: "The AI filter gave no verdict",
    reason_FILTER_DEGRADED: "The AI filter did not respond",
    reason_CONFLICTING_SIGNALS: "Conflicting signals",
    reason_BORDERLINE_CONFIDENCE: "Borderline confidence",
    reason_MATCHES_PERSONA_AND_LOCATION: "Matches the search",
    reason_EXTRACTED_FROM_LIST: "Extracted from a list page",
    reason_USER_INCLUDED: "Added manually",
    reason_USER_REJECTED: "Rejected manually",

    // Re-enrich
    reEnrich: "Re-enrich",
    reEnriching: "Enriching…",
    reEnrichDone: (n: number) => `Updated ${n} companies`,

    // Language toggle
    langToggle: "БГ",

    // Settings / tenant profile
    settings: "Settings",
    settingsTitle: "Campaign Email Profile",
    settingsSubtitle: "These details are used as the sender of personalized B2B outreach emails.",
    settingsSave: "Save",
    settingsSaving: "Saving…",
    settingsSaved: "Settings saved.",
    settingsFailed: "Failed to save settings.",
    companyWebsite: "Website",
    companyWebsitePlaceholder: "e.g. https://ludogoriesoft.com",
    contactPersonName: "Full Name",
    contactPersonNamePlaceholder: "e.g. John Smith",
    contactPersonTitle: "Position",
    contactPersonTitlePlaceholder: "e.g. Sales Director",
    contactPersonPhone: "Phone",
    contactPersonPhonePlaceholder: "e.g. +359 887 810 738",
    senderSection: "Sender Details",
    accountSection: "Account",

    // Company data (sender products / about)
    companyDataNav: "Company data",
    companyDataTitle: "Company data",
    companyDataSubtitle: "Briefly describe your company. This is used when generating Email Subject, Outreach Message, and Campaign Email — with no invented claims.",
    companyAboutLabel: "About us",
    companyAboutPlaceholder: "e.g. who you are, what you specialize in, markets, years of experience…",
    companyServicesLabel: "Products / services",
    companyServicesPlaceholder: "List the real products and services you offer…",
    companyPortfolioLabel: "Portfolio (Case studies)",
    companyPortfolioPlaceholder: "Short real projects, clients, or results you can mention…",
    companyDataSave: "Save",
    companyDataSaving: "Saving…",
    companyDataSaved: "Company data saved.",
    companyDataFailed: "Failed to save.",

    // Templates
    templatesTab: "Templates",
    templatesTitle: "Email Templates",
    templatesSubtitle: "Manage templates for personalized B2B outreach emails",
    templatesNew: "New Template",
    templateName: "Template Name",
    templateNamePlaceholder: "e.g. Manufacturing companies",
    templateSubject: "Email Subject",
    templateSubjectPlaceholder: "e.g. Custom solution for {{targetName}}",
    templateBody: "Body",
    templateBodyPlaceholder: "Write the template here. Use {{targetName}}, {{senderCompanyName}}, etc.",
    templateIsDefault: "Set as default template",
    templateSave: "Save Template",
    templateCancel: "Cancel",
    templateEdit: "Edit",
    templateSetDefault: "Set Default",
    templateDefaultBadge: "Default",
    templateCreated: "Template created.",
    templateUpdated: "Template updated.",
    templateDeleted: "Template deleted.",
    templateDefaultSet: "Template set as default.",
    noTemplates: "No templates yet. Add one above.",
    availablePlaceholders: "Available placeholders:",
    selectTemplate: "Select template",
    templateDefault: "Default",
    templateSelectLabel: "Email template",

    // Review panel
    reviewProfile: "Profile",
    reviewContact: "Contact",
    reviewTeam: "Team",
    reviewServices: "Services",
    reviewHistory: "History",
    reviewAiEmail: "AI Email",
    reviewFounded: "Founded",
    reviewIndustry: "Industry",
    reviewDescription: "Description",
    reviewLocation: "Location",
    reviewPhones: "Phones",
    reviewSocialLinks: "Social Links",
    reviewEmailSubject: "Subject",
    reviewOpeningLine: "Opening",
    reviewValueProp: "Value",
    reviewFullMessage: "Full Email",
    reviewCopy: "Copy",
    reviewCopied: "Copied!",
    reviewNoData: "No data",
    reviewPosition: "Position",

    // Admin panel
    adminNav: "Admin",
    adminTitle: "User Management",
    adminEmail: "Email",
    adminRole: "Role",
    adminMonthlyLimit: "Monthly Limit",
    adminUsedThisMonth: "Used This Month",
    adminRemaining: "Remaining",
    adminActions: "Actions",
    adminUnlimited: "Unlimited",
    adminSave: "Save",
    adminCancel: "Cancel",
    adminEdit: "Edit",
    adminSaved: "Saved.",
    adminSaveFailed: "Failed to save.",
    adminAccessDenied: "You don't have access to this page.",
    adminLoading: "Loading users…",
    monthlyLimitExceeded: "You have reached your monthly domain limit. Please contact your administrator if you need additional capacity.",
    adminLastAdminError: "The last administrator cannot be removed. At least one administrator must always exist.",

    // Admin tabs
    adminTabUsers: "Users",
    adminTabAuditLog: "Audit Log",

    // Audit log
    auditLogDate: "Date",
    auditLogAdmin: "Administrator",
    auditLogTarget: "Target User",
    auditLogAction: "Action",
    auditLogOldValue: "Old Value",
    auditLogNewValue: "New Value",
    auditLogLoading: "Loading audit log…",
    auditLogEmpty: "No records found.",
    auditLogFilterAdmin: "Admin email",
    auditLogFilterTarget: "User email",
    auditLogFilterAction: "Action",
    auditLogFilterAll: "All",
    auditLogFilterDateFrom: "From date",
    auditLogFilterDateTo: "To date",
    auditLogSearch: "Search",
    auditLogClear: "Clear",
    auditLogNewest: "Newest first",
    auditLogOldest: "Oldest first",
    auditLogPrev: "← Prev",
    auditLogNext: "Next →",
    auditLogPage: "Page",
    auditLogOf: "of",
    auditActionRoleChanged: "Changed role",
    auditActionLimitChanged: "Changed monthly limit",
    auditActionLimitRemoved: "Removed monthly limit",
    auditActionLimitAdded: "Added monthly limit",
  },
} as const;

export type Translations = (typeof translations)[Lang];

interface LangContextValue {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("bg");
  const toggleLang = () => setLang((l) => (l === "bg" ? "en" : "bg"));

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
