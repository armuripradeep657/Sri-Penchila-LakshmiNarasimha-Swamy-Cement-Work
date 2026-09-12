'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/types';

export type Language = 'en' | 'te';

// Comprehensive dictionary for UI strings
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand
    brand_name: 'PRASAD CEMENT',
    brand_subtitle: 'Precast Products',
    brand_tagline: 'Quality Precast Concrete Windows, Doors, Bricks & Pools',
    direct_factory_solutions: 'DIRECT FACTORY PRECAST CONCRETE SOLUTIONS',

    // Navigation
    nav_home: 'Home',
    nav_products: 'Products',
    nav_quote: 'Request Quote',
    nav_admin: 'Admin Dashboard',
    nav_admin_ops: 'Admin Operations',
    nav_cart: 'Cart',
    nav_login: 'Sign In',
    nav_logout: 'Sign Out',
    nav_profile: 'My Profile',
    nav_edit_profile: 'Edit My Profile',

    // Language Toggle
    lang_toggle_label: 'Language',
    lang_en: 'English',
    lang_te: 'తెలుగు',

    // Hero Section
    hero_title_1: 'Engineered Precast Concrete',
    hero_title_2: 'Built for Generations.',
    hero_desc:
      'Direct factory manufacturer of reinforced precast cement window frames, darwajas (door frames), solid/hollow bricks, and modular swimming pools. Located on Jagtial - Velgatoor Road.',
    hero_cta_browse: 'Explore Catalog',
    hero_cta_quote: 'Get Custom Quote',
    hero_stat_strength: 'M30+ Grade High Strength',
    hero_stat_dispatch: 'Direct Yard Dispatch',
    hero_stat_clients: '5,000+ Happy Builders',

    // Catalog & Categories
    cat_all: 'All Products',
    cat_window: 'Cement Windows',
    cat_door: 'Cement Doors (Darwajas)',
    cat_brick: 'Cement Bricks',
    cat_pool: 'Cement Pools',
    cat_custom: 'Custom Precast Concrete',

    // Product Card & Detail
    starting_at: 'Starting at',
    quote_on_request: 'Quote on Request',
    select_size_book: 'Select Size & Book',
    manage_stock_price: 'Manage Stock & Price',
    ready_yard_stock: 'Ready Yard Stock',
    available_sizes: 'Available Sizes',
    dimensions: 'Dimensions',
    width: 'Width',
    height: 'Height',
    depth: 'Depth / Thickness',
    unit: 'Unit',
    quantity: 'Quantity',
    min_order: 'Min. Order Quantity',
    in_stock: 'In Stock',
    made_to_order: 'Made to Order',
    out_of_stock: 'Out of Stock',
    unit_piece: 'Per Piece',
    unit_set: 'Per Set',
    unit_per_1000: 'Per 1,000 Bricks',
    unit_sqft: 'Per Sq. Ft.',
    unit_ft: 'Feet',
    unit_in: 'Inches',

    // Actions & Buttons
    btn_book_item: '✨ Book Item (Instant Yard Reservation)',
    btn_add_to_cart: 'Add to Cart',
    btn_buy_now: 'Buy Now',
    btn_call_factory: 'Call Factory Direct',
    btn_chat_whatsapp: 'Chat on WhatsApp',
    btn_add_product: 'Add New Product',
    btn_customer_quotes: 'Customer Quotes',
    btn_save_changes: 'Save Changes',
    btn_auto_fill: 'Auto-Fill',
    btn_generate_different_otp: 'Generate Different OTP',
    btn_resend_different_otp: 'Resend Different Random OTP',
    btn_verify_enter: 'Verify & Enter Portal',
    btn_send_otp: 'Send Verification OTP →',
    btn_edit_phone_email: 'Edit Phone & Email',
    btn_change_mobile: 'Change Mobile',

    // Allotment Ticket Modal
    ticket_title: 'Prasad Cement Products — Allotment Ticket',
    ticket_status_confirmed: 'Yard Allocation Reserved',
    ticket_instruction: 'Present this booking ticket at our factory yard on Jagtial - Velgatoor Road for immediate loading and dispatch.',
    ticket_dispatch_yard: 'Dispatch Yard Location',
    ticket_contact_owner: 'Contact Owner / Factory',
    ticket_close: 'Close Ticket',
    ticket_whatsapp_forward: 'Forward Booking via WhatsApp',

    // Login & Profile
    login_title: 'Sign In',
    login_subtitle: 'Sign in with your mobile number and password to access your account.',
    role_prasad: '👑 PRASAD (Admin)',
    role_owner: 'Owner',
    role_rajesh: '🏗️ Rajesh (Customer)',
    role_builder: 'Builder',
    field_mobile: 'Mobile Number',
    field_mobile_hint: 'Your registered mobile number',
    field_password: 'Password',
    field_email: 'Email Address',
    field_email_hint: 'For dispatch invoices & quotes',
    field_full_name: 'Full Name',
    field_firm_name: 'Contractor / Firm Name (Optional)',
    btn_login: 'Sign In',
    btn_register: 'Create New Account',
    no_account: "Don't have an account?",
    already_have_account: 'Already have an account?',

    // Store Info & Address
    factory_address_title: 'Factory & Manufacturing Yard',
    factory_address: 'Jagtial - Velgatoor Road, Opposite to Sudha Hospital, Velagatoor, Velagatoor Mandal, Jagtial District, Telangana - 505526',
    factory_contact_name: 'Prasad Rao (Owner)',
    factory_phone: '+91 99121 79771',
    factory_hours: 'Mon - Sat: 8:00 AM - 7:00 PM',
    copyright: '© Prasad Cement Products Industries. All Rights Reserved.',

    // Filters
    search_placeholder: 'Search windows, darwajas, bricks, pools...',
    filter_by_category: 'Filter by Category',
    sort_by: 'Sort By',
    sort_featured: 'Featured First',
    sort_price_asc: 'Price: Low to High',
    sort_price_desc: 'Price: High to Low',
    sort_name: 'Alphabetical',
  },

  te: {
    // Brand
    brand_name: 'ప్రసాద్ సిమెంట్',
    brand_subtitle: 'ప్రీకాస్ట్ ఉత్పత్తులు',
    brand_tagline: 'నాణ్యమైన ప్రీకాస్ట్ కాంక్రీట్ కిటికీలు, దర్వాజాలు, ఇటుకలు & పూల్స్',
    direct_factory_solutions: 'డైరెక్ట్ ఫ్యాక్టరీ ప్రీకాస్ట్ కాంక్రీట్ సొల్యూషన్స్',

    // Navigation
    nav_home: 'హోమ్',
    nav_products: 'ఉత్పత్తులు',
    nav_quote: 'కోట్ కోరండి',
    nav_admin: 'అడ్మిన్ డ్యాష్‌బోర్డ్',
    nav_admin_ops: 'అడ్మిన్ పనులు',
    nav_cart: 'కార్ట్',
    nav_login: 'లాగిన్',
    nav_logout: 'లాగౌట్',
    nav_profile: 'నా ప్రొఫైల్',
    nav_edit_profile: 'ప్రొఫైల్ ఎడిట్ చేయండి',

    // Language Toggle
    lang_toggle_label: 'భాష',
    lang_en: 'English',
    lang_te: 'తెలుగు',

    // Hero Section
    hero_title_1: 'నాణ్యమైన ప్రీకాస్ట్ కాంక్రీట్',
    hero_title_2: 'తరతరాల పాటు నిలిచే బలం.',
    hero_desc:
      'అధిక బలం గల ప్రీకాస్ట్ సిమెంట్ కిటికీ ఫ్రేములు, దర్వాజాలు (తలుపుల ఫ్రేములు), సాలిడ్/హాలో ఇటుకలు మరియు స్విమ్మింగ్ పూల్స్ తయారీదారులు. జగిత్యాల - వెలగటూర్ రోడ్ వద్ద లభించును.',
    hero_cta_browse: 'ఉత్పత్తులు చూడండి',
    hero_cta_quote: 'ప్రత్యేక కోట్ పొందండి',
    hero_stat_strength: 'M30+ గ్రేడ్ అధిక బలం',
    hero_stat_dispatch: 'నేరుగా యార్డ్ నుండి డిస్పాచ్',
    hero_stat_clients: '5,000+ సంతృప్తి చెందిన బిల్డర్లు',

    // Catalog & Categories
    cat_all: 'అన్ని ఉత్పత్తులు',
    cat_window: 'సిమెంట్ కిటికీలు',
    cat_door: 'సిమెంట్ దర్వాజాలు (తలుపులు)',
    cat_brick: 'సిమెంట్ ఇటుకలు',
    cat_pool: 'సిమెంట్ పూల్స్ & ట్యాంకులు',
    cat_custom: 'కస్టమ్ ప్రీకాస్ట్ కాంక్రీట్',

    // Product Card & Detail
    starting_at: 'ప్రారంభ ధర',
    quote_on_request: 'కోట్ అభ్యర్థనపై',
    select_size_book: 'సైజు ఎంచుకోండి & బుక్ చేయండి',
    manage_stock_price: 'స్టాక్ & ధర నిర్వహించండి',
    ready_yard_stock: 'యార్డ్ రెడీ స్టాక్',
    available_sizes: 'అందుబాటులో ఉన్న సైజులు',
    dimensions: 'కొలతలు',
    width: 'వెడల్పు',
    height: 'ఎత్తు',
    depth: 'మందం / లోతు',
    unit: 'యూనిట్',
    quantity: 'పరిమాణం (సంఖ్య)',
    min_order: 'కనిష్ట ఆర్డర్ పరిమాణం',
    in_stock: 'స్టాక్ అందుబాటులో ఉంది',
    made_to_order: 'ఆర్డర్ మేరకు తయారుచేయబడును',
    out_of_stock: 'స్టాక్ అయిపోయింది',
    unit_piece: 'ఒక్కో యూనిట్ (పీస్)',
    unit_set: 'సెట్',
    unit_per_1000: '1,000 ఇటుకలకు',
    unit_sqft: 'చదరపు అడుగుకు',
    unit_ft: 'అడుగులు',
    unit_in: 'అంగుళాలు',

    // Actions & Buttons
    btn_book_item: '✨ వస్తువును బుక్ చేయండి (తక్షణ యార్డ్ రిజర్వేషన్)',
    btn_add_to_cart: 'కార్ట్‌కు జోడించండి',
    btn_buy_now: 'ఇప్పుడే కొనండి',
    btn_call_factory: 'ఫ్యాక్టరీకి నేరుగా కాల్ చేయండి',
    btn_chat_whatsapp: 'వాట్సాప్‌లో సంప్రదించండి',
    btn_add_product: 'కొత్త ఉత్పత్తిని జోడించండి',
    btn_customer_quotes: 'కస్టమర్ కొటేషన్లు',
    btn_save_changes: 'మార్పులను భద్రపరచండి',
    btn_auto_fill: 'ఆటో-ఫిల్',
    btn_generate_different_otp: 'మరో కొత్త OTP పొందండి',
    btn_resend_different_otp: 'మరో కొత్త రాండమ్ OTP మళ్లీ పంపండి',
    btn_verify_enter: 'ధృవీకరించి ప్రవేశించండి',
    btn_send_otp: 'ధృవీకరణ OTP పంపండి →',
    btn_edit_phone_email: 'ఫోన్ & ఇమెయిల్ మార్చండి',
    btn_change_mobile: 'మొబైల్ మార్చండి',

    // Allotment Ticket Modal
    ticket_title: 'ప్రసాద్ సిమెంట్ ప్రొడక్ట్స్ — అలాట్‌మెంట్ టికెట్',
    ticket_status_confirmed: 'యార్డ్ అలాకేషన్ రిజర్వ్ చేయబడింది',
    ticket_instruction: 'వెంటనే సరుకు రవాణా & లోడింగ్ కొరకు జగిత్యాల - వెలగటూర్ రోడ్‌లోని మా ఫ్యాక్టరీ యార్డ్ వద్ద ఈ బుకింగ్ టికెట్ చూపించండి.',
    ticket_dispatch_yard: 'డిస్పాచ్ యార్డ్ స్థలం',
    ticket_contact_owner: 'యజమాని / ఫ్యాక్టరీని సంప్రదించండి',
    ticket_close: 'టికెట్ మూసివేయండి',
    ticket_whatsapp_forward: 'వాట్సాప్ ద్వారా బుకింగ్ పంపండి',

    // Login & Profile
    login_title: 'లాగిన్',
    login_subtitle: 'మీ ఖాతాను యాక్సెస్ చేయడానికి మీ మొబైల్ నంబర్ మరియు పాస్‌వర్డ్‌తో లాగిన్ అవ్వండి.',
    role_prasad: '👑 ప్రసాద్ (అడ్మిన్ / యజమాని)',
    role_owner: 'యజమాని',
    role_rajesh: '🏗️ రాజేష్ (కస్టమర్ / బిల్డర్)',
    role_builder: 'బిల్డర్',
    field_mobile: 'మొబైల్ నంబర్',
    field_mobile_hint: 'మీ రిజిస్టర్ చేసిన మొబైల్ నంబర్',
    field_password: 'పాస్‌వర్డ్',
    field_email: 'ఇమెయిల్ చిరునామా',
    field_email_hint: 'ఇన్‌వాయిస్‌లు మరియు కొటేషన్ల కొరకు',
    field_full_name: 'పూర్తి పేరు',
    field_firm_name: 'కాంట్రాక్టర్ / సంస్థ పేరు (ఐచ్ఛికం)',
    btn_login: 'లాగిన్ అవ్వండి',
    btn_register: 'కొత్త ఖాతా సృష్టించండి',
    no_account: 'ఖాతా లేదా?',
    already_have_account: 'ఇప్పటికే ఖాతా ఉందా?',

    // Store Info & Address
    factory_address_title: 'ఫ్యాక్టరీ & తయారీ యార్డ్',
    factory_address: 'జగిత్యాల - వెలగటూర్ రోడ్, సుధ హాస్పిటల్ ఎదురుగా, వెలగటూర్, వెలగటూర్ మండలం, జగిత్యాల జిల్లా, తెలంగాణ - 505526',
    factory_contact_name: 'ప్రసాద్ రావు (యజమాని)',
    factory_phone: '+91 99121 79771',
    factory_hours: 'సోమ - శని: ఉదయం 8:00 నుండి రాత్రి 7:00 వరకు',
    copyright: '© ప్రసాద్ సిమెంట్ ప్రొడక్ట్స్ ఇండస్ట్రీస్. సర్వ హక్కులు ప్రత్యేకించబడ్డాయి.',

    // Filters
    search_placeholder: 'కిటికీలు, దర్వాజాలు, ఇటుకలు, పూల్స్ వెతకండి...',
    filter_by_category: 'కేటగిరీ వారీగా ఫిల్టర్',
    sort_by: 'క్రమబద్ధీకరించండి',
    sort_featured: 'ముఖ్యమైనవి ముందుగా',
    sort_price_asc: 'ధర: తక్కువ నుండి ఎక్కువ',
    sort_price_desc: 'ధర: ఎక్కువ నుండి తక్కువ',
    sort_name: 'అక్షరక్రమం ప్రకారం',
  },
};

// Known product names map to Telugu
const productTranslations: Record<string, { name: string; description?: string }> = {
  'Standard Cement Window Frame': {
    name: 'స్టాండర్డ్ సిమెంట్ కిటికీ ఫ్రేమ్',
    description: 'ఇళ్ళు మరియు వాణిజ్య భవనాల కోసం రూపొందించిన బలమైన ప్రీకాస్ట్ సిమెంట్ కిటికీ ఫ్రేములు. గ్రిల్ లేదా గ్రిల్ లేకుండా లభించును. తుప్పు పట్టని మరియు దశాబ్దాల పాటు మన్నే నాణ్యత.',
  },
  'Ventilation Cement Window': {
    name: 'వెంటిలేషన్ సిమెంట్ కిటికీ (జాలీ)',
    description: 'స్నానాల గదులు, వంటశాలల కొరకు ప్రత్యేకంగా రూపొందించిన గాలి ప్రసరణ జాలీ కిటికీలు. భద్రత మరియు గోప్యతను కాపాడుతూ తాజా గాలిని అందిస్తుంది.',
  },
  'Single Cement Door Frame (Darwaja)': {
    name: 'సింగిల్ సిమెంట్ దర్వాజా ఫ్రేమ్ (తలుపు)',
    description: 'అధిక బలం గల ప్రీకాస్ట్ సిమెంట్ సింగిల్ దర్వాజా ఫ్రేమ్. చెదలు పట్టదు, వర్షానికి పాడవదు. ప్రధాన ద్వారాలు మరియు గదుల ప్రవేశాలకు అత్యుత్తమమైనది.',
  },
  'Double Cement Door Frame (Darwaja)': {
    name: 'డబుల్ సిమెంట్ దర్వాజా ఫ్రేమ్ (తలుపు)',
    description: 'ప్రధాన ప్రవేశ ద్వారాలు, పూజా గదులు మరియు పెద్ద గేట్ల కోసం ప్రీమియం ప్రీకాస్ట్ సిమెంట్ డబుల్ దర్వాజా ఫ్రేమ్. అద్భుతమైన నిర్మాణ అందం మరియు దృఢత్వం.',
  },
  'High-Strength Solid Cement Brick': {
    name: 'అధిక నాణ్యత గల సాలిడ్ సిమెంట్ ఇటుక',
    description: '53-గ్రేడ్ ఓపిసి సిమెంట్‌తో తయారు చేయబడిన దృఢమైన సాలిడ్ సిమెంట్ ఇటుకలు. పునాదులు మరియు బరువైన గోడల నిర్మాణాలకు అనువైనవి. తక్కువ సిమెంట్ వినియోగంతో వేగవంతమైన నిర్మాణం.',
  },
  'Solid Cement Brick': {
    name: 'సాలిడ్ సిమెంట్ ఇటుక',
    description: 'అధిక లోడ్ మోసే సామర్థ్యం గల సాలిడ్ సిమెంట్ కాంక్రీట్ ఇటుకలు. నిర్మాణాలు పటిష్టంగా ఉండటానికి సహాయపడతాయి.',
  },
  'Hollow Concrete Block': {
    name: 'హాలో కాంక్రీట్ బ్లాక్',
    description: 'తేలికపాటి మరియు వేడిని నిరోధించే హాలో కాంక్రీట్ బ్లాకులు. భవన నిర్మాణ బరువును తగ్గించడంతో పాటు ఖర్చును కూడా ఆదా చేస్తాయి.',
  },
  'Fly Ash Cement Brick': {
    name: 'ఫ్లై యాష్ సిమెంట్ ఇటుక',
    description: 'పర్యావరణ హితమైన అధిక నాణ్యత గల ఫ్లై యాష్ సిమెంట్ ఇటుకలు. మృదువైన ముగింపు మరియు సమానమైన పరిమాణాలు.',
  },
  'Modular Precast Swimming Pool': {
    name: 'మాడ్యులర్ ప్రీకాస్ట్ స్విమ్మింగ్ పూల్',
    description: 'విల్లాలు, ఫామ్‌హౌస్‌లు మరియు రెసిడెన్షియల్ గార్డెన్స్ కొరకు రెడీమేడ్ ప్రీకాస్ట్ కాంక్రీట్ స్విమ్మింగ్ పూల్ యూనిట్లు. వేగంగా ఇన్‌స్టాల్ చేయవచ్చు.',
  },
  'Precast Plunge Pool Tank': {
    name: 'ప్రీకాస్ట్ ప్లంజ్ పూల్ ట్యాంక్',
    description: 'కాంపాక్ట్ గార్డెన్ ప్లంజ్ పూల్ మరియు వాటర్ స్టోరేజ్ ట్యాంక్. వాటర్‌ప్రూఫ్ కాంక్రీట్‌తో అత్యంత నాణ్యంగా తయారు చేయబడింది.',
  },
  'Heavy Duty Precast Wall Slab 103': {
    name: 'హెవీ డ్యూటీ ప్రీకాస్ట్ వాల్ స్లాబ్ 103',
    description: 'కాంపౌండ్ గోడలు మరియు విభజనల కోసం బలమైన రీఇన్‌ఫోర్స్డ్ ప్రీకాస్ట్ వాల్ స్లాబ్. త్వరిత అమరిక మరియు సుదీర్ఘ మన్నిక.',
  },
};

// Known variant names map to Telugu
const variantTranslations: Record<string, string> = {
  '2ft × 2ft (No Grill)': '2 అడుగులు × 2 అడుగులు (గ్రిల్ లేదు)',
  '2ft × 2ft (With Grill)': '2 అడుగులు × 2 అడుగులు (గ్రిల్ కలదు)',
  '3ft × 3ft (No Grill)': '3 అడుగులు × 3 అడుగులు (గ్రిల్ లేదు)',
  '3ft × 3ft (With Grill)': '3 అడుగులు × 3 అడుగులు (గ్రిల్ కలదు)',
  '3ft × 4ft (No Grill)': '3 అడుగులు × 4 అడుగులు (గ్రిల్ లేదు)',
  '3ft × 4ft (With Grill)': '3 అడుగులు × 4 అడుగులు (గ్రిల్ కలదు)',
  'Custom Size Window': 'కస్టమ్ సైజు కిటికీ',
  '1.5ft × 1.5ft Diamond Jali': '1.5 అడుగులు × 1.5 అడుగులు డైమండ్ జాలీ',
  '2ft × 2ft Diamond Jali': '2 అడుగులు × 2 అడుగులు డైమండ్ జాలీ',
  '2ft × 3ft Floral Jali': '2 అడుగులు × 3 అడుగులు ఫ్లోరల్ జాలీ',
  '3ft × 7ft (Frame Only)': '3 అడుగులు × 7 అడుగులు (ఫ్రేమ్ మాత్రమే)',
  '3ft × 7ft (Frame + Precast Panel)': '3 అడుగులు × 7 అడుగులు (ఫ్రేమ్ + ప్యానెల్)',
  '3.5ft × 7ft (Frame Only)': '3.5 అడుగులు × 7 అడుగులు (ఫ్రేమ్ మాత్రమే)',
  '3.5ft × 7ft (Frame + Precast Panel)': '3.5 అడుగులు × 7 అడుగులు (ఫ్రేమ్ + ప్యానెల్)',
  'Custom Size Door Frame': 'కస్టమ్ సైజు దర్వాజా ఫ్రేమ్',
  '5ft × 7ft (Frame Only)': '5 అడుగులు × 7 అడుగులు (ఫ్రేమ్ మాత్రమే)',
  '5ft × 7ft (With Precast Doors)': '5 అడుగులు × 7 అడుగులు (తలుపులతో సహా)',
  '6ft × 7ft (Frame Only)': '6 అడుగులు × 7 అడుగులు (ఫ్రేమ్ మాత్రమే)',
  'Standard (9×4×3 in) — Per Unit': 'స్టాండర్డ్ (9×4×3 అం) — ఒక్కో యూనిట్',
  'Standard (9×4×3 in) — Lot of 1000': 'స్టాండర్డ్ (9×4×3 అం) — 1000 ఇటుకల లాట్',
  'Heavy (12×6×4 in) — Per Unit': 'హెవీ (12×6×4 అం) — ఒక్కో యూనిట్',
  'Heavy (12×6×4 in) — Lot of 1000': 'హెవీ (12×6×4 అం) — 1000 ఇటుకల లాట్',
};

// Word-by-word converter for dynamic user-added product names
function translateDynamicText(text: string): string {
  if (!text) return text;
  let res = text;
  const wordMap: [RegExp, string][] = [
    [/\bCement\b/gi, 'సిమెంట్'],
    [/\bWindow\b/gi, 'కిటికీ'],
    [/\bWindows\b/gi, 'కిటికీలు'],
    [/\bDoor\b/gi, 'దర్వాజా'],
    [/\bDoors\b/gi, 'దర్వాజాలు'],
    [/\bBrick\b/gi, 'ఇటుక'],
    [/\bBricks\b/gi, 'ఇటుకలు'],
    [/\bPool\b/gi, 'పూల్'],
    [/\bPools\b/gi, 'పూల్స్'],
    [/\bPrecast\b/gi, 'ప్రీకాస్ట్'],
    [/\bConcrete\b/gi, 'కాంక్రీట్'],
    [/\bFrame\b/gi, 'ఫ్రేమ్'],
    [/\bFrames\b/gi, 'ఫ్రేములు'],
    [/\bWall\b/gi, 'గోడ'],
    [/\bSlab\b/gi, 'స్లాబ్'],
    [/\bSlabs\b/gi, 'స్లాబ్‌లు'],
    [/\bPole\b/gi, 'స్తంభం'],
    [/\bPoles\b/gi, 'స్తంభాలు'],
    [/\bPipe\b/gi, 'పైపు'],
    [/\bPipes\b/gi, 'పైపులు'],
    [/\bReinforced\b/gi, 'రీఇన్‌ఫోర్స్డ్'],
    [/\bHeavy Duty\b/gi, 'హెవీ డ్యూటీ'],
    [/\bStandard\b/gi, 'స్టాండర్డ్'],
    [/\bVentilation\b/gi, 'వెంటిలేషన్'],
    [/\bSolid\b/gi, 'సాలిడ్'],
    [/\bHollow\b/gi, 'హాలో'],
    [/\bBlock\b/gi, 'బ్లాక్'],
    [/\bBlocks\b/gi, 'బ్లాక్‌లు'],
    [/\bSingle\b/gi, 'సింగిల్'],
    [/\bDouble\b/gi, 'డబుల్'],
    [/\bPer Unit\b/gi, 'ఒక్కో యూనిట్'],
    [/\bPer Piece\b/gi, 'ఒక్కో పీస్'],
    [/\bLot of\b/gi, 'లాట్'],
    [/\bft\b/gi, 'అడుగులు'],
    [/\bin\b/gi, 'అంగుళాలు'],
  ];

  for (const [pattern, replacement] of wordMap) {
    res = res.replace(pattern, replacement);
  }
  return res;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  localizeProduct: (product: Product) => Product;
  localizeVariant: (variant: ProductVariant) => ProductVariant;
  localizeCategory: (cat: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Check saved language in localStorage
    const saved = localStorage.getItem('pcp_language') as Language | null;
    if (saved === 'en' || saved === 'te') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pcp_language', lang);
  };

  const t = (key: string, fallback?: string): string => {
    const dict = translations[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to English if Telugu key missing
    if (translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  const localizeProduct = (product: Product): Product => {
    if (language === 'en') return product;

    const known = productTranslations[product.name];
    const localizedName = known?.name || translateDynamicText(product.name);
    const localizedDesc = known?.description || translateDynamicText(product.description);

    const localizedVariants = product.variants?.map((v) => localizeVariant(v)) || [];

    return {
      ...product,
      name: localizedName,
      description: localizedDesc,
      variants: localizedVariants,
    };
  };

  const localizeVariant = (variant: ProductVariant): ProductVariant => {
    if (language === 'en') return variant;

    const known = variantTranslations[variant.name];
    const localizedName = known || translateDynamicText(variant.name);

    return {
      ...variant,
      name: localizedName,
    };
  };

  const localizeCategory = (cat: string): string => {
    if (language === 'en') {
      switch (cat) {
        case 'WINDOW': return 'Cement Windows';
        case 'DOOR': return 'Cement Doors (Darwajas)';
        case 'BRICK': return 'Cement Bricks';
        case 'POOL': return 'Cement Pools';
        default: return cat;
      }
    } else {
      switch (cat) {
        case 'WINDOW': return 'సిమెంట్ కిటికీలు';
        case 'DOOR': return 'సిమెంట్ దర్వాజాలు (తలుపులు)';
        case 'BRICK': return 'సిమెంట్ ఇటుకలు';
        case 'POOL': return 'సిమెంట్ పూల్స్ & ట్యాంకులు';
        default: return translateDynamicText(cat);
      }
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        localizeProduct,
        localizeVariant,
        localizeCategory,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
