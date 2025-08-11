// Complete Gong Expansion Opportunity Tracker - Backend Service
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration - Updated for your working API structure
const GONG_CONFIG = {
  baseURL: (process.env.GONG_BASE_URL || 'https://us-47829.api.gong.io').replace(/\/$/, '') + '/v2',
  accessKey: process.env.GONG_ACCESS_KEY,
  accessKeySecret: process.env.GONG_ACCESS_KEY_SECRET
};

// Comprehensive expansion opportunity keywords - ShipBob International Focus
const EXPANSION_KEYWORDS = [
  // General Business Expansion
  'expansion', 'upgrade', 'additional features', 'more users', 'enterprise plan',
  'scale up', 'add-on', 'premium', 'increase capacity', 'grow', 'enterprise', 
  'additional modules', 'premium support', 'advanced features', 'bigger plan', 
  'professional plan',
  
  // International Trade Terms
  'DDP', 'DDU', 'delivered duty paid', 'delivered duty unpaid', 'incoterms',
  'duty paid', 'duty unpaid', 'customs clearance', 'import duties', 'export duties',
  'customs fees', 'landed cost', 'freight forwarding', 'international trade',
  
  // Cross-Border & International Shipping
  'international fulfillment', 'cross-border', 'cross border', 
  'international shipment', 'international shipping', 'international markets', 
  'shipping internationally', 'global shipping', 'worldwide shipping',
  'overseas shipping', 'transnational shipping', 'border crossing',
  'international logistics', 'global commerce', 'worldwide delivery',
  
  // Country-Specific Markets
  'canada fulfillment', 'canadian market', 'ship to canada', 'canada expansion',
  'uk fulfillment', 'united kingdom', 'ship to uk', 'british market', 'uk expansion',
  'netherlands fulfillment', 'dutch market', 'ship to netherlands', 'holland shipping',
  'australia fulfillment', 'australian market', 'ship to australia', 'aussie market',
  'european fulfillment', 'eu shipping', 'european union', 'ship to europe',
  'north america', 'oceania shipping', 'asia pacific', 'apac region',
  
  // Multi-Country Fulfillment
  'multi-country fulfillment', 'global warehousing', 'international warehouses',
  'distributed inventory', 'local fulfillment', 'in-country fulfillment',
  'regional distribution', 'global distribution network', 'worldwide warehouses',
  'multiple countries', 'international presence', 'global footprint',
  
  // Fulfillment Services
  'more inventory', 'additional fulfillment', 'peak season', 'more orders',
  'multiple warehouses', 'faster shipping', 'premium features', 
  'dedicated support', 'custom integration', 'fulfillment centers',
  'distribution centers', 'storage facilities', 'pick and pack',
  'order fulfillment', 'inventory management', 'stock management',
  
  // International Business Operations
  'global expansion', 'international growth', 'market entry', 'new markets',
  'foreign markets', 'international sales', 'global customers', 'overseas customers',
  'international business', 'global operations', 'worldwide operations',
  'cross-border commerce', 'international ecommerce', 'global retail',
  
  // Regulatory & Compliance
  'customs compliance', 'import regulations', 'export regulations', 'trade compliance',
  'international regulations', 'customs documentation', 'duty calculations',
  'tax compliance', 'vat handling', 'gst compliance', 'customs broker',
  'trade agreements', 'free trade zones', 'bonded warehouse',
  
  // Currency & Payment
  'multi-currency', 'foreign exchange', 'currency conversion', 'local currency',
  'international payments', 'cross-border payments', 'global payments',
  'foreign currency', 'exchange rates', 'currency hedging',
  
  // Speed & Service Levels
  'express international', 'fast international shipping', 'expedited shipping',
  'same day international', 'next day international', '2-day international',
  'priority international', 'standard international', 'economy international',
  'air freight', 'sea freight', 'ground shipping',
  
  // Technology & Integration
  'global api', 'international integration', 'multi-region setup',
  'global dashboard', 'worldwide tracking', 'international reporting',
  'global analytics', 'cross-border data', 'international insights',
  
  // Supply Chain
  'global supply chain', 'international supply chain', 'supply chain optimization',
  'global sourcing', 'international procurement', 'worldwide suppliers',
  'supply chain visibility', 'end-to-end fulfillment', 'omnichannel fulfillment',
  
  // Market-Specific Terms
  'localization', 'local market entry', 'regional customization', 'cultural adaptation',
  'local partnerships', 'in-market expertise', 'regional knowledge',
  'market penetration', 'competitive advantage', 'market differentiation'
];

// Comprehensive merchant mapping based on your CSV data
const MERCHANT_MAPPING = {
  // Andrew Costello's merchants
  'semaine-health': { companyName: 'Semaine Health', msm: 'Jeremy Whitaker', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 313390 },
  'grinding-gear-games-ltd': { companyName: 'Grinding Gear Games Ltd', msm: 'Brian Totten', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 347753 },
  'esther-perels-workshop': { companyName: "Esther Perel's Workshop", msm: 'Cole Shubert', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 260904 },
  'forvr-mood': { companyName: 'FORVR Mood', msm: 'Lauren Hookham', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 303984 },
  'malezia': { companyName: 'Malezia', msm: 'Octavia Czapla', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 327044 },
  'nordic-healthy-living': { companyName: 'Nordic Healthy Living', msm: 'Angelica Allen', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 298118 },
  'parentgiving': { companyName: 'Parentgiving', msm: 'Jim Spangler', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 353791 },
  'petsmont': { companyName: 'Petsmont', msm: 'Henrique Ferreira', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 364401 },
  'sfh': { companyName: 'SFH', msm: 'Maverick Morgan', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 299544 },
  'lignetics-inc': { companyName: 'Lignetics Inc.', msm: 'NoDataFound', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 383405 },
  'grvi': { companyName: 'GrŸvi', msm: 'Joe DiRusso', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 223208 },
  'equilibria': { companyName: 'Equilibria', msm: 'Nick Hendricks', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 273121 },
  'lifeforce-digital-inc': { companyName: 'Lifeforce Digital Inc.', msm: 'Richie Miller', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 280742 },
  'ezmelts-solara-labs': { companyName: 'Ezmelts - Solara Labs', msm: 'Pete Cashen', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 354489 },
  'renzos-solara-labs': { companyName: 'Renzo\'s - Solara Labs', msm: 'Pete Cashen', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 354487 },
  'solara-inc': { companyName: 'Solara Inc.', msm: 'Pete Cashen', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 354486 },
  'beast-bites-supplements-llc': { companyName: 'Beast Bites Supplements LLC', msm: 'Al Matheus', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 343149 },
  'branwyn-performance-innerwear': { companyName: 'BRANWYN | Performance Innerwear', msm: 'Mary Kate Durkin', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 281915 },
  'karaka-llc': { companyName: 'Karaka LLC', msm: 'Pete Cashen', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 204986 },
  'lullabites': { companyName: 'Lullabites', msm: 'Maverick Morgan', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 352024 },
  'quality-fragrance-oils': { companyName: 'Quality Fragrance Oils', msm: 'Nick Hendricks', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 279588 },
  'rapid-dry-towels-limited': { companyName: 'Rapid Dry Towels Limited', msm: 'Priscilla Valdez', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 276600 },
  'spikeball-inc': { companyName: 'Spikeball inc', msm: 'Mary Kate Durkin', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 287589 },
  'the-village-company': { companyName: 'The Village Company', msm: 'Aaron Hodes', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 288818 },
  'vital-source-nutrition-inc': { companyName: 'Vital Source Nutrition Inc.', msm: 'Maverick Morgan', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 352025 },
  'wicked-cushion': { companyName: 'Wicked Cushion', msm: 'Nick Hendricks', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 218429 },
  'kaizen-food-company': { companyName: 'Kaizen Food Company', msm: 'Mike Rottar', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 280774 },
  'akt-london-limited': { companyName: 'AKT London Limited', msm: 'NoDataFound', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 388008 },
  'betterme-international-limited': { companyName: 'BetterMe International Limited', msm: 'Pete Cashen', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 327896 },
  'clearstem-skincare': { companyName: 'CLEARSTEM    SKINCARE', msm: 'Joe DiRusso', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 228003 },
  'nood': { companyName: 'Nood', msm: 'Kevin Cliggett', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 261851 },
  'snow-cosmetics-llc': { companyName: 'Snow Cosmetics, LLC', msm: 'Pete Cashen', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 324703 },
  'dossier': { companyName: 'Dossier', msm: 'Ryan Bessert', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 219650 },
  'petlab-co': { companyName: 'Petlab Co', msm: 'Kevin Cliggett', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 269976 },
  'petlab-co-netherlands-bv': { companyName: 'Petlab Co Netherlands B.V.', msm: 'Kevin Marvinac', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 362301 },
  'aromatan-uk-ltd': { companyName: 'Aromatan UK Ltd', msm: 'Lauren Hookham', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 321955 },
  'aromatan-usa-inc': { companyName: 'Aromatan USA Inc', msm: 'Lauren Hookham', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 303156 },
  'hairburst-vat-gb193833086': { companyName: 'Hairburst, VAT: GB193833086', msm: 'Sam Ford', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 319689 },
  'damsco-group': { companyName: 'Damsco Group', msm: 'NoDataFound', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 384642 },
  'beanies-the-flavour-co-ltd': { companyName: 'Beanies the Flavour Co. Ltd', msm: 'Sam Ford', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 348725 },
  'elle-sera': { companyName: 'Elle Sera', msm: 'Jerod Jones', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 334430 },
  'growth-melon-ltd': { companyName: 'Growth Melon Ltd', msm: 'Matthew Keen', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 373536 },
  'ina-cosmetics-ltd-bg206957657': { companyName: 'Ina Cosmetics LTD BG206957657', msm: 'Kevin Cliggett', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 300497 },
  'ina-global-ltd-bg-206632681': { companyName: 'Ina Global LTD BG 206632681', msm: 'NoDataFound', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 300498 },
  'inaessentials-ltd-bg206627289': { companyName: 'InaEssentials LTD BG206627289', msm: 'Kevin Cliggett', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 299613 },
  'the-social-drinks-company-ltd': { companyName: 'The Social Drinks Company LTD', msm: 'Sam Ford', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 351325 },
  'epetome-hairburst': { companyName: 'Epetome (Hairburst)', msm: 'NoDataFound', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 372917 },
  'purely-elizabeth': { companyName: 'Purely Elizabeth', msm: 'Aaron Hodes', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 245155 },
  'organic-olivia': { companyName: 'Organic Olivia', msm: 'anthony gargano', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 201914 },
  'crockett-coffee': { companyName: 'Crockett Coffee', msm: 'Brian Totten', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 344037 },
  'mensa-brands-majestic-pure': { companyName: 'Mensa Brands [Majestic Pure]', msm: 'NoDataFound', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 383859 },
  'owl-labs': { companyName: 'Owl Labs', msm: 'Shipton Bogle', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 68422 },
  'treluxe': { companyName: 'TreLuxe', msm: 'NoDataFound', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 384310 },
  'epatrol': { companyName: 'E+Patrol', msm: 'NoDataFound', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 376999 },
  'perfect-supplements': { companyName: 'Perfect Supplements', msm: 'Kevin Cliggett', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 335719 },
  'bad-egg': { companyName: 'Bad Egg', msm: 'Kevin Marvinac', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 310252 },
  'montem': { companyName: 'Montem', msm: 'Joel Bebermeyer', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 66683 },
  'sidemen-usa': { companyName: 'Sidemen USA', msm: 'Kevin Marvinac', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 313874 },
  'warren-james': { companyName: 'Warren James', msm: 'Cole Shubert', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 245910 },
  'warren-james-llc': { companyName: 'Warren James LLC', msm: 'Cole Shubert', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 221965 },
  'misfits-health': { companyName: 'Misfits Health', msm: 'Bob LeGere', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 259670 },
  'jesus-loves-you-company': { companyName: 'Jesus Loves You Company', msm: 'Kevin Marvinac', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 327546 },
  'wrldinvsn-llc': { companyName: 'WRLDINVSN LLC', msm: 'Kevin Marvinac', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 356734 },
  'yerot-vica': { companyName: 'Yerot Vica', msm: 'Kevin Marvinac', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 323361 },
  'blade-hq-llc': { companyName: 'Blade HQ LLC', msm: 'Joel Bebermeyer', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 334607 },
  'constantly-varied-gear': { companyName: 'Constantly Varied Gear', msm: 'Pete Cashen', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 347907 },
  'cove': { companyName: 'COVE', msm: 'Joel Bebermeyer', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 299748 },
  'dermelect': { companyName: 'Dermelect', msm: 'Sean Morris', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 222390 },
  'drink-recess-inc': { companyName: 'Drink Recess Inc', msm: 'Luke Syens', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 278006 },
  'elwood-clothing': { companyName: 'Elwood Clothing', msm: 'Sean Morris', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 359906 },
  'epic-charter-schools': { companyName: 'Epic Charter Schools', msm: 'Sean Morris', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 357856 },
  'magic-hour': { companyName: 'Magic Hour', msm: 'Kevin Cliggett', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 342494 },
  'prymal-inc': { companyName: 'Prymal, Inc', msm: 'Melisa Ori', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 214647 },
  'freedom-rave-wear': { companyName: 'Freedom Rave Wear', msm: 'Beth Fahey', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 69346 },
  'synchro-nutritionals': { companyName: 'Synchro Nutritionals', msm: 'Shipton Bogle', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 64999 },
  'jones-road-beauty': { companyName: 'Jones Road Beauty', msm: 'NoDataFound', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 384058 },
  'blueprint-bryan-johnson': { companyName: 'Blueprint Bryan Johnson', msm: 'Bill Shipley', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 332133 },
  'dagamma-baby-doppler': { companyName: 'Dagamma Baby Doppler', msm: 'Joe DiRusso', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 292264 },
  'everyday-dose': { companyName: 'Everyday Dose', msm: 'Nick Hendricks', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 342714 },
  'postalio': { companyName: 'Postal.io', msm: 'Joel Bebermeyer', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 273593 },
  'pf-candle-co': { companyName: 'P.F. Candle Co.', msm: 'Cole Shubert', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 286036 },
  'timeless-skin-care': { companyName: 'Timeless Skin Care', msm: 'Richie Miller', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 272389 },
  'gomacro': { companyName: 'GoMacro', msm: 'Pete Cashen', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 234179 },
  'hint': { companyName: 'Hint', msm: 'Brian Hruskocy', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 356420 },
  'luna-luna-inc': { companyName: 'Luna Luna Inc', msm: 'Nick Hendricks', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 308848 },
  'nocta': { companyName: 'NOCTA', msm: 'Nick Hendricks', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 293331 },
  'pit-viper': { companyName: 'Pit Viper', msm: 'Nick Hendricks', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 276864 },
  '100-thieves': { companyName: '100 Thieves', msm: 'Joel Bebermeyer', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 215892 },
  'higround': { companyName: 'Higround', msm: 'Paul Rosen', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 271001 },
  'hostage-tape': { companyName: 'Hostage Tape', msm: 'Jim Spangler', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 330744 },
  'lolavie': { companyName: 'LolaVie', msm: 'Shipton Bogle', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 270679 },
  'arrae': { companyName: 'Arrae', msm: 'Frank Baer', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 273428 },
  'arrae-us': { companyName: 'Arrae- US', msm: 'Paul Rosen', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 368308 },
  'novos-labs': { companyName: 'NOVOS Labs', msm: 'Will Thomas', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 298573 },
  'prohealth-longevity': { companyName: 'ProHealth Longevity', msm: 'Pete Cashen', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 320027 },
  'risewell': { companyName: 'Risewell', msm: 'Nick Hendricks', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 215529 },
  'think-social-publishing-inc': { companyName: 'Think Social Publishing, Inc.', msm: 'Kevin Cliggett', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 268154 },
  'aeropress-inc': { companyName: 'AeroPress, Inc.', msm: 'Bob LeGere', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 241268 },
  'alternative-daily-gravity': { companyName: 'Alternative Daily Gravity', msm: 'Jivko Bojinov', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 357981 },
  'backyard-vitality': { companyName: 'Backyard Vitality', msm: 'Jivko Bojinov', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 357983 },
  'cleanboss-inc': { companyName: 'CleanBoss Inc', msm: 'Cole Shubert', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 283959 },
  'eat-cleaner': { companyName: 'Eat Cleaner', msm: 'Cole Shubert', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 331886 },
  'gopure': { companyName: 'Gopure', msm: 'Cole Shubert', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 372746 },
  'medik8-inc': { companyName: 'Medik8 Inc.', msm: 'Octavia Czapla', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 325722 },
  'mokai-paws': { companyName: 'Mokai Paws', msm: 'Jivko Bojinov', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 357985 },
  'particle-aesthetic-science': { companyName: 'Particle Aesthetic Science', msm: 'Luke Syens', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 288109 },
  'pwhl-canada': { companyName: 'PWHL Canada', msm: 'Sophie Skarzynski', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 351097 },
  'pwhl-us': { companyName: 'PWHL US', msm: 'Sophie Skarzynski', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 343138 },
  'upwellness': { companyName: 'Upwellness', msm: 'Kevin Marvinac', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 356503 },
  'arc-phone-accessories-bv': { companyName: 'Arc Phone Accessories B.V.', msm: 'Sam Ford', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 308000 },
  'fat-cow-skincare': { companyName: 'Fat Cow Skincare', msm: 'NoDataFound', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 374675 },
  'cara-capsules-ltd': { companyName: 'Cara Capsules Ltd.', msm: 'NoDataFound', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 383547 },
  'alogic-europe-bv': { companyName: 'ALOGIC EUROPE BV', msm: 'Kevin Marvinac', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 342607 },
  'journey': { companyName: 'Journey', msm: 'Kevin Marvinac', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 324895 },
  'artah': { companyName: 'Artah', msm: 'Sam Ford', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 283920 },
  'hello-klean': { companyName: 'Hello Klean', msm: 'Sam Ford', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 362110 },
  'justfloow': { companyName: 'JustFloow', msm: 'Julie Glendon', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 356205 },
  'feel-gud': { companyName: 'Feel Gud', msm: 'Julie Glendon', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 361868 },
  'huggerstore-ltd': { companyName: 'HUGGERSTORE LTD', msm: 'Laurence Feehan', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 374546 },
  'kurk': { companyName: 'Kurk', msm: 'Jerod Jones', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 333903 },
  'slick-gorilla': { companyName: 'Slick Gorilla', msm: 'Sam Ford', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 319140 },
  'slick-gorilla-usa': { companyName: 'Slick Gorilla USA', msm: 'Sam Ford', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 334954 },
  'westcor-uk-ltd-naledi': { companyName: 'Westcor Uk Ltd (Naledi)', msm: 'Sam Ford', sm: 'Andrew Costello', smEmail: 'acostello@shipbob.com', userID: 319799 },

  // Bryan Combest's merchants  
  'mosaic-wellness': { companyName: 'Mosaic Wellness', msm: 'Nick Hendricks', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'nisim': { companyName: 'Nisim', msm: 'Kevin Marvinac', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'ombre': { companyName: 'Ombre', msm: 'NoDataFound', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'reshoevn8r': { companyName: 'Reshoevn8r', msm: 'Pete Cashen', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'rewind-hair-color': { companyName: 'Rewind Hair Color', msm: 'Kevin Marvinac', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'bartesian': { companyName: 'Bartesian', msm: 'Pete Cashen', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'better-alt': { companyName: 'Better Alt', msm: 'Rob Leonard', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'pawcom': { companyName: 'Paw.com', msm: 'Pete Cashen', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'castle-flexx': { companyName: 'Castle Flexx', msm: 'Shipton Bogle', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'finisher-secrets': { companyName: 'Finisher Secrets', msm: 'Jeff Kline', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'alkaline-superfoods': { companyName: 'Alkaline Superfoods', msm: 'Cole Shubert', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'bare-hands': { companyName: 'Bare Hands', msm: 'Omar Abdulla', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'braintap': { companyName: 'BrainTap, Inc', msm: 'Octavia Czapla', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'deltahub': { companyName: 'DELTAHUB', msm: 'Mud Ahmed', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'donors-choose': { companyName: 'DonorsChoose', msm: 'Aaron Hodes', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },
  'sharkbanz': { companyName: 'Sharkbanz', msm: 'Joe DiRusso', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com' },

  // Bryan Combest merchants
  'finisher-secrets': { companyName: 'Finisher Secrets', msm: 'Jeff Kline', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 227724 },
  'alkaline-superfoods': { companyName: 'Alkaline Superfoods', msm: 'Cole Shubert', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 277190 },
  'bare-hands': { companyName: 'Bare Hands', msm: 'Omar Abdulla', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 292309 },
  'braintap-inc': { companyName: 'BrainTap, Inc', msm: 'Octavia Czapla', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 297287 },
  'colour-pops': { companyName: 'Colour Pops', msm: 'Kevin Marvinac', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 317778 },
  'deltahub': { companyName: 'DELTAHUB', msm: 'Mud Ahmed', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 265830 },
  'donorschoose': { companyName: 'DonorsChoose', msm: 'Aaron Hodes', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 255557 },
  'folly-enterprises': { companyName: 'Folly Enterprises', msm: 'Bob LeGere', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 282677 },
  'fray-angelico-spa': { companyName: 'Fray Angelico Spa', msm: 'Kevin Marvinac', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 248574 },
  'gut-food-by-farmacy': { companyName: 'Gut Food by Farmacy', msm: 'Bob LeGere', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 264010 },
  'hikers-co': { companyName: 'HIKERS Co.', msm: 'Luke Syens', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 271515 },
  'ikea-north-america-services-llc': { companyName: 'IKEA North America Services LLC', msm: 'Nick Hendricks', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 320471 },
  'mahoganybooks': { companyName: 'MahoganyBooks', msm: 'Aaron Hodes', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 256849 },
  'of-merch': { companyName: 'OF Merch', msm: 'Rob Leonard', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 290337 },
  'performance-lab-usa-corporation': { companyName: 'Performance Lab USA Corporation', msm: 'Matt Bradbury', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 222113 },
  'performance-labs-eu': { companyName: 'Performance Labs EU', msm: 'Sam Ford', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 330092 },
  'performance-labs-ltd': { companyName: 'Performance Labs Ltd', msm: 'James Risos', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 334183 },
  'sharkbanz': { companyName: 'Sharkbanz', msm: 'Joe DiRusso', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 64689 },
  'shop-stcg': { companyName: 'SHOP STCG', msm: 'Pete Cashen', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 250609 },
  'time-of-grace-ministry': { companyName: 'Time of Grace Ministry', msm: 'Melisa Ori', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 275997 },
  'quick-weight-loss': { companyName: 'Quick Weight Loss', msm: 'Peter Liavas', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 287361 },
  'happy-ears-ab': { companyName: 'Happy Ears AB', msm: 'Lauren Hookham', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 319978 },
  'tru-energy-skincare': { companyName: 'Tru Energy Skincare', msm: 'Cole Shubert', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 268627 },
  'oros-apparel': { companyName: 'Oros Apparel', msm: 'Athar Khan', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 367733 },
  'nusava': { companyName: 'Nusava', msm: 'Brian Totten', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 355350 },
  'medchoice': { companyName: 'Medchoice', msm: 'Debajnan', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 355351 },
  'prime-md': { companyName: 'Prime MD', msm: 'Brian Totten', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 355349 },
  'shiti-coolers': { companyName: 'SHITI Coolers', msm: 'Cole Shubert', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 281467 },
  'darren-and-phillip-us': { companyName: 'Darren and Phillip (US)', msm: 'James Risos', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 365403 },
  'darren-and-phillipau': { companyName: 'Darren and Phillip(AU)', msm: 'James Risos', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 365402 },
  'qi-enterprise-inc': { companyName: 'QI Enterprise Inc', msm: 'Stephanie Fejzuloski', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 356666 },
  'urban-intellectualscom': { companyName: 'Urban Intellectuals.com', msm: 'Kevin Marvinac', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 67386 },
  'beli': { companyName: 'Beli', msm: 'Shipton Bogle', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 270868 },
  'prolong-lash-inc': { companyName: 'Prolong Lash INC', msm: 'Luke Syens', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 280042 },
  'i-love-chamoy': { companyName: 'I Love Chamoy', msm: 'Aaron Hodes', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 331182 },
  'cheeky': { companyName: 'Cheeky', msm: 'Henrique Ferreira', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 364658 },
  'the-aviary-cocktail-book': { companyName: 'The Aviary Cocktail Book', msm: 'Mud Ahmed', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 207949 },
  'castle-flexx': { companyName: 'Castle Flexx', msm: 'Shipton Bogle', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 268878 },
  'flow-neuroscience': { companyName: 'Flow Neuroscience', msm: 'Sam Ford', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 276510 },
  'hopskipdrive': { companyName: 'HopSkipDrive', msm: 'Aaron Hodes', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 227881 },
  'jimmy-joy': { companyName: 'Jimmy Joy', msm: 'Matt Bradbury', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 203659 },
  'kanga-llc': { companyName: 'Kanga, LLC', msm: 'Pete Cashen', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 370202 },
  'lift-down': { companyName: 'Lift Down', msm: 'Mark Davis', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 283423 },
  'matchaful': { companyName: 'Matchaful', msm: 'Jim Spangler', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 267453 },
  'nio-teas': { companyName: 'Nio Teas', msm: 'Jerod Jones', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 243640 },
  'reuzip': { companyName: 'RE-U-ZIP', msm: 'Bill Shipley', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 276926 },
  'the-gottman-institute': { companyName: 'The Gottman Institute', msm: 'Frank Baer', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 322466 },
  'tune-fairweather': { companyName: 'Tune & Fairweather', msm: 'Aaron Hodes', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 238223 },
  'whiskertons': { companyName: 'Whiskertons', msm: 'Melisa Ori', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 322364 },
  'z-shipping-department': { companyName: 'Z Shipping Department', msm: 'Aaron Hodes', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 253021 },
  'mama-coco': { companyName: 'Mama Coco', msm: 'Richie Miller', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 349298 },
  'hatch-house-games-ta-mrs-wordmsith': { companyName: 'Hatch House Games TA Mrs Wordmsith', msm: 'Conor Callanan', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 201176 },
  'kea-health': { companyName: 'Kea Health', msm: 'Joel Bebermeyer', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 200672 },
  'clear-essence-cosmetics-usa': { companyName: 'CLEAR ESSENCE COSMETICS USA', msm: 'Chris Sempeles', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 320693 },
  'parametric-semiconductors': { companyName: 'Parametric Semiconductors', msm: 'Kevin Marvinac', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 256234 },
  'trestique': { companyName: 'trestique', msm: 'Melisa Ori', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 351754 },
  'alaya-naturals-llc': { companyName: 'Alaya Naturals LLC', msm: 'Mike Gongol', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 206048 },
  'algaecal-inc': { companyName: 'AlgaeCal Inc', msm: 'Bob LeGere', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 296008 },
  'analogue': { companyName: 'Analogue', msm: 'Pete Cashen', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 327962 },
  'be-a-10-llc': { companyName: 'Be A 10, LLC', msm: 'Shipton Bogle', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 247986 },
  'ex10sions-by-carolyn': { companyName: 'Ex10sions by Carolyn', msm: 'Shipton Bogle', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 235433 },
  'its-a-10-haircare': { companyName: 'Its A 10 Haircare', msm: 'Shipton Bogle', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 222963 },
  'mdalgorithms': { companyName: 'MDalgorithms', msm: 'Shipton Bogle', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 64880 },
  'mosaic-wellness': { companyName: 'Mosaic Wellness', msm: 'Nick Hendricks', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 375316 },
  'nisim': { companyName: 'Nisim', msm: 'Kevin Marvinac', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 355037 },
  'ombre': { companyName: 'Ombre', msm: 'NoDataFound', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 298523 },
  'reshoevn8r': { companyName: 'Reshoevn8r', msm: 'Pete Cashen', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 205262 },
  'rewind-hair-color': { companyName: 'Rewind Hair Color', msm: 'Kevin Marvinac', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 338654 },
  'bartesian': { companyName: 'Bartesian', msm: 'Pete Cashen', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 235468 },
  'better-alt': { companyName: 'Better Alt', msm: 'Rob Leonard', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 349435 },
  'pawcom': { companyName: 'Paw.com', msm: 'Pete Cashen', sm: 'Bryan Combest', smEmail: 'bcombest@shipbob.com', userID: 289934 },

  // Dave Haran's merchants
  'animalhouse-fitness': { companyName: 'Animalhouse Fitness', msm: 'Mud Ahmed', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 267084 },
  'brucebolt-llc': { companyName: 'BRUCE+BOLT LLC', msm: 'Aaron Hodes', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 315935 },
  'day-one-industries-llc': { companyName: 'Day One Industries LLC', msm: 'Frank Baer', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 367934 },
  'prism-health-emory': { companyName: 'Prism Health (Emory)', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 338517 },
  'ez-bombs': { companyName: 'EZ Bombs', msm: 'Pete Cashen', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 363388 },
  'friday-labs-llc': { companyName: 'Friday Labs LLC', msm: 'Brian Totten', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 325400 },
  'megababe': { companyName: 'Megababe', msm: 'Joel Bebermeyer', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 219201 },
  'prokopton-glucosegoddess': { companyName: 'Prokopton (GlucoseGoddess)', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 353166 },
  'smarthockey': { companyName: 'Smarthockey', msm: 'Sophie Skarzynski', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 343402 },
  'ttmh-po-a782327': { companyName: 'TTMH (PO# A782327)', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 314693 },
  'wellbel-inc': { companyName: 'WellBel Inc', msm: 'Mud Ahmed', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 252017 },
  'zbiotics': { companyName: 'ZBiotics', msm: 'Brian Hruskocy', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 220855 },
  'gluecose-goddess': { companyName: 'Gluecose Goddess', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 363024 },
  'danicing-elephant': { companyName: 'Danicing Elephant', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 381612 },
  'as-we-move-canada': { companyName: 'As We Move Canada', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 338122 },
  'aswemove-inc': { companyName: 'AsWeMove Inc.', msm: 'Shipton Bogle', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 260990 },
  'culturelle-ihealth-inc': { companyName: 'Culturelle i-health, INC', msm: 'Aaron Hodes', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 245227 },
  'i-health-a-division-of-dsm': { companyName: 'i  Health a Division of DSM', msm: 'Aaron Hodes', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 269315 },
  'ihealth': { companyName: 'i-Health', msm: 'Aaron Hodes', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 207760 },
  'ihealth': { companyName: 'i-Health', msm: 'Aaron Hodes', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 238222 },
  'ihealth': { companyName: 'i-Health', msm: 'Aaron Hodes', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 258824 },
  'madein': { companyName: 'MadeIn', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 353210 },
  'old-world-christmas': { companyName: 'Old World Christmas', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 356487 },
  'ovega': { companyName: 'Ovega', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 329954 },
  'swissklip-usa-inc': { companyName: 'Swissklip USA Inc', msm: 'Aaron Hodes', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 245753 },
  'swissklip-usa-inc': { companyName: 'Swissklip USA Inc', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 322851 },
  'helium-deploy': { companyName: 'Helium Deploy', msm: 'Jeremy Whitaker', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 360066 },
  'nextconception-inc-helium-ca': { companyName: 'NextConception Inc (Helium CA)', msm: 'Riddhi', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 381316 },
  'sicksciencelabs-inc': { companyName: 'ÊSickScienceÊLabs, Inc.', msm: 'Stephanie Fejzuloski', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 376186 },
  'skalli-essentials': { companyName: 'Skalli Essentials', msm: 'Henrique Ferreira', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 378338 },
  'beaubble': { companyName: 'Beaubble', msm: 'Joel Bebermeyer', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 242723 },
  'fenity-fashion-shpk': { companyName: 'FENITY FASHION SH.P.K', msm: 'Rob Leonard', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 291737 },
  'seiseidou-america-inc': { companyName: 'SEISEIDOU America, Inc.', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 221942 },
  'atg-buddies-llc': { companyName: 'ATG BUDDIES LLC', msm: 'Peter Liavas', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 290074 },
  'boho-locs': { companyName: 'Boho Locs', msm: 'Hamzah Awan', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 333332 },
  'defunkify': { companyName: 'Defunkify', msm: 'Luke Syens', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 300300 },
  'onest-health': { companyName: 'onest health', msm: 'Bill Shipley', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 286410 },
  'penny-drop-enterprises': { companyName: 'Penny Drop Enterprises', msm: 'Bradley Wettersten', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 213845 },
  'uncivilized-athletics-llc': { companyName: 'Uncivilized Athletics LLC', msm: 'Brian Totten', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 311632 },
  'solluna-by-kimberly-snyder': { companyName: 'Solluna by Kimberly Snyder', msm: 'Aaron Hodes', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 280096 },
  'addiction-sports': { companyName: 'Addiction Sports', msm: 'Octavia Czapla', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 295432 },
  'american-astronomical-society': { companyName: 'American Astronomical Society', msm: 'Bill Shipley', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 271311 },
  'hugesupplementsinc': { companyName: 'HUGESUPPLEMENTSÊINC.', msm: 'Pete Cashen', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 373103 },
  'myo-munchee-operations-pty-ltd': { companyName: 'Myo Munchee (Operations) Pty Ltd', msm: 'Conor Kitt', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 281570 },
  'supercilium-europe': { companyName: 'SUPERCILIUM EUROPE', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 365226 },
  'the-skin-deep': { companyName: 'The Skin Deep', msm: 'Brian Hruskocy', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 215783 },
  'three-arrows-nutra': { companyName: 'Three Arrows Nutra', msm: 'Shipton Bogle', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 241798 },
  'cc-beauty-llc': { companyName: 'C&C Beauty LLC', msm: 'Peter Liavas', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 278567 },
  'hotel-resort-keycards': { companyName: 'Hotel & Resort KeyCards', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 294668 },
  'bikerhelmetscom-llc': { companyName: 'Bikerhelmetscom, LLC', msm: 'Henrique Ferreira', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 358568 },
  'neon-rated-llc': { companyName: 'NEON Rated LLC', msm: 'Meyrick Lamb', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 369901 },
  'floura': { companyName: 'Floura', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 381895 },
  'snowy-care': { companyName: 'Snowy Care', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 374728 },
  'blue-plus-gold-llc-russell-blauert': { companyName: 'Blue Plus Gold LLC; Russell Blauert', msm: 'Bryan Combest', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 363966 },
  'blue-plus-gold-llc': { companyName: 'Blue Plus Gold LLC', msm: 'Riddhi', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 376614 },
  'cards-against-humanity': { companyName: 'Cards Against Humanity', msm: 'Bill Shipley', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 362233 },
  'hypeland': { companyName: 'Hypeland', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 377581 },
  'smlxl-merch': { companyName: 'SMLXL Merch', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 380906 },
  'terra-lotus': { companyName: 'Terra Lotus', msm: 'Sean Forrest', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 376133 },
  'theshowlorios-inc': { companyName: 'TheShowlorios Inc.', msm: 'Pete Cashen', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 377433 },
  'vetchy-llc': { companyName: 'Vetchy LLC', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 238751 },
  'wildflower-brands-llc': { companyName: 'Wildflower Brands, LLC', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 381094 },
  'pangaea-lumin': { companyName: 'Pangaea [Lumin]', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 383728 },
  'savannah-bananas': { companyName: 'Savannah Bananas', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 382325 },
  'pangea-holdings': { companyName: 'Pangea Holdings', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 384406 },
  'amos-sweets': { companyName: 'Amos Sweets', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 370145 },
  'primal-supplements-group-llc': { companyName: 'Primal Supplements Group LLC', msm: 'Shipton Bogle', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 371776 },
  'seeds-wow-llc': { companyName: 'Seeds Wow LLC', msm: 'Shipton Bogle', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 364667 },
  'miracle-moo-inc': { companyName: 'Miracle Moo, Inc.', msm: 'Joe DiRusso', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 347026 },
  'other-half': { companyName: 'Other Half', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 378220 },
  'seraphina': { companyName: 'Seraphina', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 353927 },
  'top-shelf': { companyName: 'Top Shelf', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 350786 },
  'brainista': { companyName: 'Brainista', msm: 'Rob Leonard', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 370445 },
  'buffbunny': { companyName: 'Buffbunny', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 292941 },
  'buffbunny-collection': { companyName: 'BUffBunny Collection', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 369945 },
  'euforia-llc': { companyName: 'Euforia, LLC', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 359876 },
  'makesy': { companyName: 'Makesy', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 352281 },
  'pr-llc': { companyName: 'PR LLC', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 347356 },
  'purity-coffee': { companyName: 'Purity Coffee', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 375963 },
  'grounds-app': { companyName: 'Grounds App', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 385680 },
  'evil-goods': { companyName: 'Evil Goods', msm: 'Pete Cashen', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 370489 },
  '1775-coffee': { companyName: '1775 Coffee', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 362737 },
  '5th-generation-defense': { companyName: '5th Generation Defense', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 364315 },
  'be-naked': { companyName: 'Be Naked', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 364533 },
  'containers-plus': { companyName: 'Containers Plus', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 272719 },
  'death-wish-coffee-company': { companyName: 'Death Wish Coffee Company', msm: 'Pete Cashen', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 281592 },
  'ej-uk': { companyName: 'EJ UK', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 369450 },
  'evry-jewels': { companyName: 'Evry Jewels', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 347915 },
  'ihb': { companyName: 'IHB', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 327974 },
  'pawsitive': { companyName: 'Pawsitive', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 362736 },
  'strong-sexy-fit': { companyName: 'Strong + Sexy Fit', msm: 'Aaron Hodes', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 260897 },
  'the-wellness-company': { companyName: 'The Wellness Company', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 328036 },
  'your-super': { companyName: 'Your Super', msm: 'Eshaan Bhatnagar', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 200409 },
  'zelenko-labs-llc': { companyName: 'Zelenko Labs LLC', msm: 'Joel Bebermeyer', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 290299 },
  'better-body-co': { companyName: 'Better Body Co', msm: 'Joe DiRusso', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 243270 },
  'advanced-bionutritionals': { companyName: 'Advanced Bionutritionals', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 313889 },
  'colleen-rothschild-beauty': { companyName: 'Colleen Rothschild Beauty', msm: 'Pete Cashen', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 277023 },
  'driveline-baseball': { companyName: 'Driveline Baseball', msm: 'Kevin Cliggett', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 265752 },
  'reliefband': { companyName: 'Reliefband', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 346518 },
  'roots-of-fight': { companyName: 'Roots of Fight', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 302977 },
  'rq-innovasion-inc': { companyName: 'RQ Innovasion Inc.', msm: 'Aaron Hodes', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 254765 },
  'systeme-41': { companyName: 'Systeme 41', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 297034 },
  'taste-salud-llc': { companyName: 'Taste Salud, LLC', msm: 'Mark Davis', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 266735 },
  'cupids-llc': { companyName: 'Cupids LLC', msm: 'Pete Cashen', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 367667 },
  'acutrack': { companyName: 'AcuTrack', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 388314 },
  'sbly': { companyName: 'SBLY', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 255732 },
  'black-claw': { companyName: 'Black Claw', msm: 'Brian Hruskocy', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 232006 },
  'earthley-wellness': { companyName: 'Earthley Wellness', msm: 'Joel Bebermeyer', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 297278 },
  'ehp-holdings': { companyName: 'EHP Holdings', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 360178 },
  'ehplabs-llc': { companyName: 'EHPLabs LLC', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 348942 },
  'fresh-beauty-studio-llc-dba-nikol-beauty': { companyName: 'Fresh Beauty Studio LLC DBA Nikol Beauty', msm: 'Sophie Skarzynski', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 216099 },
  'japonesque-llc': { companyName: 'Japonesque LLC', msm: 'Mike Gongol', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 65089 },
  'makeup-eraser': { companyName: 'MakeUp Eraser', msm: 'Nick Hendricks', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 317733 },
  'open-water': { companyName: 'Open Water', msm: 'Matt Bradbury', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 202632 },
  'the-super-patch-company-ltd-llc': { companyName: 'The Super Patch Company Ltd. LLC', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 338913 },
  'voxxlife': { companyName: 'Voxxlife', msm: 'Kevin Marvinac', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 370976 },
  'papaya-inc': { companyName: 'Papaya Inc.', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 245860 },
  'nicoles-apothecary': { companyName: 'NicoleÕs Apothecary', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 240364 },
  'asa-brands-llc': { companyName: 'ASA Brands LLC', msm: 'Jerod Jones', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 301699 },
  'catface': { companyName: 'CatFace', msm: 'Cole Shubert', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 291407 },
  'dally': { companyName: 'DALLY', msm: 'Pete Cashen', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 368658 },
  'exltd': { companyName: 'Exltd', msm: 'Jeremy Whitaker', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 354094 },
  'gush': { companyName: 'GUSH', msm: 'Pete Cashen', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 368659 },
  'lunchbox': { companyName: 'Lunchbox', msm: 'Aaron Hodes', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 220040 },
  'rasa': { companyName: 'Rasa', msm: 'Melisa Ori', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 368752 },
  'zyppah': { companyName: 'Zyppah', msm: 'Melisa Ori', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 355860 },
  'dirty-mids-llc': { companyName: 'Dirty Mids LLC', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 339423 },
  'deflorance': { companyName: 'DeFlorance', msm: 'NoDataFound', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 384424 },
  'waveform-lighting': { companyName: 'Waveform Lighting', msm: 'Brian Hruskocy', sm: 'Dave Haran', smEmail: 'dharan@shipbob.com', userID: 229966 },
  };

// Updated Solution Managers list for frontend
const SOLUTION_MANAGERS = ["Andrew Costello", "Bryan Combest", "Dave Haran"];

// Helper function to find merchant by company name or domain
function findMerchantInfo(parties, callTitle = '') {
  console.log(`🔍 Identifying merchant for call: "${callTitle}"`);
  console.log(`   Parties: ${parties?.length || 0}`);
  
  if (parties && parties.length > 0) {
    console.log(`   Participant emails:`, parties.map(p => p.emailAddress).filter(Boolean));
  }

  // Method 1: Find by email domain (if parties data available)
  if (parties && parties.length > 0) {
    const externalParty = parties.find(party => 
      party.emailAddress && !party.emailAddress.includes('@shipbob.com')
    );

    if (externalParty) {
      const domain = externalParty.emailAddress.split('@')[1];
      const domainKey = domain.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      let merchantInfo = MERCHANT_MAPPING[domainKey];
      if (merchantInfo) {
        console.log(`✅ Found merchant by domain: ${merchantInfo.companyName} (${domainKey})`);
        return { 
          ...merchantInfo, 
          email: externalParty.emailAddress, 
          method: 'domain',
          merchantId: domainKey 
        };
      }
    }
  }

  // Method 2: Find by company name in call title (most reliable for ShipBob)
  if (callTitle) {
    const titleLower = callTitle.toLowerCase();
    console.log(`   Checking title: "${titleLower}"`);
    
    // Look for merchant names in title
    for (const [key, merchant] of Object.entries(MERCHANT_MAPPING)) {
      const companyLower = merchant.companyName.toLowerCase();
      const companyWords = companyLower.split(' ');
      
      // Check for exact company name match
      if (titleLower.includes(companyLower)) {
        console.log(`✅ Found merchant by exact title match: ${merchant.companyName}`);
        return { 
          ...merchant, 
          email: parties?.find(p => !p.emailAddress?.includes('@shipbob.com'))?.emailAddress || 'unknown@merchant.com', 
          method: 'title-exact',
          merchantId: key 
        };
      }
      
      // Check for partial matches (company name words)
      if (companyWords.length > 1) {
        const wordsInTitle = companyWords.filter(word => 
          word.length > 3 && titleLower.includes(word)
        );
        
        if (wordsInTitle.length >= Math.min(2, companyWords.length)) {
          console.log(`✅ Found merchant by partial title match: ${merchant.companyName} (matched: ${wordsInTitle.join(', ')})`);
          return { 
            ...merchant, 
            email: parties?.find(p => !p.emailAddress?.includes('@shipbob.com'))?.emailAddress || 'unknown@merchant.com', 
            method: 'title-partial',
            merchantId: key 
          };
        }
      }
      
      // Check for key-based matches (slug to title)
      const keyWords = key.split('-');
      if (keyWords.length > 1) {
        const keyWordsInTitle = keyWords.filter(word => 
          word.length > 3 && titleLower.includes(word)
        );
        
        if (keyWordsInTitle.length >= Math.min(2, keyWords.length)) {
          console.log(`✅ Found merchant by key match: ${merchant.companyName} (matched key: ${key})`);
          return { 
            ...merchant, 
            email: parties?.find(p => !p.emailAddress?.includes('@shipbob.com'))?.emailAddress || 'unknown@merchant.com', 
            method: 'title-key',
            merchantId: key 
          };
        }
      }
    }
    
    // Special handling for ShipBob call format "Company <> ShipBob"
    const shipbobPattern = /(.+?)\s*<>\s*shipbob/i;
    const match = callTitle.match(shipbobPattern);
    if (match) {
      const companyFromTitle = match[1].trim().toLowerCase();
      console.log(`   Found ShipBob call pattern, company: "${companyFromTitle}"`);
      
      for (const [key, merchant] of Object.entries(MERCHANT_MAPPING)) {
        const companyLower = merchant.companyName.toLowerCase();
        
        if (companyLower.includes(companyFromTitle) || 
            companyFromTitle.includes(companyLower) ||
            key.replace(/-/g, ' ').includes(companyFromTitle) ||
            companyFromTitle.includes(key.replace(/-/g, ' '))) {
          
          console.log(`✅ Found merchant by ShipBob pattern: ${merchant.companyName}`);
          return { 
            ...merchant, 
            email: parties?.find(p => !p.emailAddress?.includes('@shipbob.com'))?.emailAddress || 'unknown@merchant.com', 
            method: 'shipbob-pattern',
            merchantId: key 
          };
        }
      }
    }
  }

  console.log(`❌ Could not identify merchant from title: "${callTitle}"`);
  return null;
}

// Check if Solution Manager was present in the call
function isSolutionManagerPresent(parties, merchantInfo) {
  if (!parties || parties.length === 0 || !merchantInfo) {
    return false;
  }

  const smName = merchantInfo.sm;
  if (!smName) {
    console.log(`⚠️ No SM mapping found for merchant: ${merchantInfo.companyName}`);
    return false;
  }

  const smPresent = parties.some(party => 
    party.name && party.name.toLowerCase().includes(smName.toLowerCase())
  );

  console.log(`SM ${smName} ${smPresent ? 'was' : 'was not'} present in call`);
  return smPresent;
}

// In-memory storage (use a database in production)
let opportunities = [];
let processedCalls = new Set();

class GongAPIService {
  constructor() {
    console.log('🔧 Initializing Gong API Service with Basic Auth');
    console.log('🔍 Checking title-based methods:');
    console.log('  - analyzeTitleForOpportunity:', typeof this.analyzeTitleForOpportunity);
    console.log('  - scanForOpportunitiesTitleBased:', typeof this.scanForOpportunitiesTitleBased);
  }

  // Get authentication headers (Basic Auth with key:secret)
  getAuthHeaders() {
    const credentials = Buffer.from(`${GONG_CONFIG.accessKey}:${GONG_CONFIG.accessKeySecret}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    };
  }

  // Get recent calls from Gong
  async getRecentCalls(fromDate = null, pageSize = 50) {
    try {
      console.log(`🔍 Fetching calls from Gong (pageSize: ${pageSize})...`);
      
      let params = { 
        pageSize,
        // Request parties (participants) data explicitly
        contentSelector: JSON.stringify({
          exposedFields: {
            parties: true,
            recording: true,
            title: true,
            content: false  // Don't need full content for listing
          }
        })
      };
      
      if (fromDate) {
        const fromDateTime = new Date(fromDate).toISOString();
        const toDateTime = new Date().toISOString();
        console.log(`📅 Date filter: ${fromDateTime} to ${toDateTime}`);
        params.fromDateTime = fromDateTime;
        params.toDateTime = toDateTime;
      }
      
      console.log(`🔗 Making API call with params:`, params);
      
      const response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
        headers: this.getAuthHeaders(),
        params
      });
  
      console.log(`📡 Response status: ${response.status}`);
      
      // FIXED: Dynamic structure detection
      const calls = response.data.records?.calls || response.data.calls || [];
      const totalRecords = response.data.records?.totalRecords || 0;
      const cursor = response.data.records?.cursor;
      
      console.log(`✅ Retrieved ${calls.length} calls (Total available: ${totalRecords})`);
      
      if (calls.length > 0) {
        console.log(`📋 Sample call:`, {
          id: calls[0].id,
          title: calls[0].title,
          started: calls[0].started,
          hasParties: !!(calls[0].parties && calls[0].parties.length > 0)
        });
      }
  
      // Enrich calls with parties data if still missing
      const callsWithParties = await this.enrichCallsWithParties(calls);
  
      return {
        calls: callsWithParties,
        totalRecords,
        cursor
      };
    } catch (error) {
      console.error('❌ Failed to fetch calls:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  }  

  // Enrich calls with participant data if missing
  async enrichCallsWithParties(calls) {
    console.log(`🔍 Enriching ${calls.length} calls with participant data...`);
    const enrichedCalls = [];
    
    for (let i = 0; i < calls.length; i++) {
      const call = calls[i];
      
      if (i % 10 === 0) {
        console.log(`📊 Enriching calls: ${i}/${calls.length}`);
      }
      
      if (!call.parties || call.parties.length === 0) {
        try {
          console.log(`🔍 Call ${call.id} missing parties data, fetching details...`);
          
          // Enhanced detail fetch with specific content selector
          const detailResponse = await axios.get(`${GONG_CONFIG.baseURL}/calls/${call.id}`, {
            headers: this.getAuthHeaders(),
            params: {
              contentSelector: JSON.stringify({
                exposedFields: {
                  parties: true,
                  recording: true,
                  title: true,
                  content: false
                }
              })
            }
          });
          
          const callData = detailResponse.data.calls?.[0] || detailResponse.data;
          
          if (callData && callData.parties) {
            const enrichedCall = { ...call, parties: callData.parties };
            enrichedCalls.push(enrichedCall);
            console.log(`✅ Enriched call ${call.id} with ${enrichedCall.parties.length} parties`);
          } else {
            // Try alternative API endpoint for parties
            try {
              const partiesResponse = await axios.get(`${GONG_CONFIG.baseURL}/calls/${call.id}/extensive`, {
                headers: this.getAuthHeaders()
              });
              
              if (partiesResponse.data.parties) {
                const enrichedCall = { ...call, parties: partiesResponse.data.parties };
                enrichedCalls.push(enrichedCall);
                console.log(`✅ Enriched call ${call.id} with ${enrichedCall.parties.length} parties (extensive endpoint)`);
              } else {
                console.log(`⚠️ Call ${call.id} still has no parties data after extensive fetch`);
                enrichedCalls.push(call);
              }
            } catch (extensiveError) {
              console.log(`⚠️ Call ${call.id} still has no parties data after detail fetch`);
              enrichedCalls.push(call);
            }
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (enrichError) {
          console.log(`❌ Could not enrich call ${call.id}:`, enrichError.message);
          enrichedCalls.push(call);
        }
      } else {
        enrichedCalls.push(call);
      }
    }
    
    console.log(`✅ Enrichment complete: ${enrichedCalls.filter(c => c.parties && c.parties.length > 0).length}/${enrichedCalls.length} calls have parties data`);
    return enrichedCalls;
  }

  // Get call transcript
  async getCallTranscript(callId) {
    try {
      console.log(`📝 Fetching transcript for call: ${callId}`);
      
      // Try primary transcript endpoint
      let response;
      try {
        response = await axios.get(`${GONG_CONFIG.baseURL}/calls/${callId}/transcript`, {
          headers: this.getAuthHeaders()
        });
      } catch (transcriptError) {
        if (transcriptError.response?.status === 404) {
          console.log(`⚠️ Transcript not found via /transcript endpoint, trying alternative...`);
          
          // Try alternative: get call content with transcript
          response = await axios.get(`${GONG_CONFIG.baseURL}/calls/${callId}`, {
            headers: this.getAuthHeaders(),
            params: {
              contentSelector: JSON.stringify({
                exposedFields: {
                  transcript: true,
                  content: true
                }
              })
            }
          });
          
          // Extract transcript from call content
          const callData = response.data.calls?.[0] || response.data;
          if (callData.transcript) {
            response.data = callData.transcript;
          } else if (callData.content) {
            // Sometimes transcript is nested in content
            response.data = callData.content;
          } else {
            throw transcriptError;
          }
        } else {
          throw transcriptError;
        }
      }
  
      if (response.data && response.data.entries) {
        console.log(`✅ Retrieved transcript with ${response.data.entries.length} entries`);
        return response.data;
      } else {
        console.log('⚠️ No transcript entries found');
        return null;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`⚠️ Transcript not found for call ${callId} (may still be processing)`);
      } else if (error.response?.status === 403) {
        console.log(`⚠️ Access denied for transcript ${callId} (may not have permission or call too old)`);
      } else {
        console.error(`❌ Failed to fetch transcript for call ${callId}:`, error.response?.data || error.message);
      }
      return null;
    }
  }

  // Analyze transcript for expansion opportunities
  analyzeTranscript(transcript, keywords = EXPANSION_KEYWORDS) {
    if (!transcript || !transcript.entries) {
      return { score: 0, detectedKeywords: [], analysis: 'No transcript available' };
    }
  
    console.log(`📝 Analyzing transcript with ${transcript.entries.length} entries`);
  
    // Combine all transcript entries with speaker context
    const fullText = transcript.entries
      .map(entry => entry.text)
      .join(' ')
      .toLowerCase();
  
    console.log(`📄 Transcript length: ${fullText.length} characters`);
  
    // Enhanced keyword detection with context
    const keywordAnalysis = {
      detectedKeywords: [],
      keywordMatches: [],
      contextSnippets: [],
      speakerAnalysis: {},
      sentimentIndicators: []
    };
  
    // Analyze each keyword
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const regex = new RegExp(`\\b${keywordLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
      const matches = fullText.match(regex);
      
      if (matches && matches.length > 0) {
        keywordAnalysis.detectedKeywords.push(keyword);
        
        // Find context around each keyword mention
        const keywordContexts = [];
        let searchStart = 0;
        let match;
        
        while ((match = regex.exec(fullText)) !== null) {
          // Get 100 characters before and after the keyword for context
          const start = Math.max(0, match.index - 100);
          const end = Math.min(fullText.length, match.index + keyword.length + 100);
          const context = fullText.substring(start, end);
          
          keywordContexts.push({
            keyword: match[0],
            context: context.trim(),
            position: match.index
          });
          
          // Prevent infinite loop
          if (regex.lastIndex === match.index) {
            regex.lastIndex++;
          }
        }
        
        keywordAnalysis.keywordMatches.push({
          keyword,
          frequency: matches.length,
          contexts: keywordContexts
        });
      }
    });
  
    // Analyze by speaker (if speaker data available)
    if (transcript.entries.some(entry => entry.speakerId)) {
      transcript.entries.forEach(entry => {
        const speakerId = entry.speakerId || 'unknown';
        if (!keywordAnalysis.speakerAnalysis[speakerId]) {
          keywordAnalysis.speakerAnalysis[speakerId] = {
            totalWords: 0,
            expansionKeywords: [],
            entries: []
          };
        }
        
        const entryText = entry.text.toLowerCase();
        const wordsInEntry = entryText.split(' ').length;
        keywordAnalysis.speakerAnalysis[speakerId].totalWords += wordsInEntry;
        
        // Check which keywords this speaker mentioned
        keywords.forEach(keyword => {
          if (entryText.includes(keyword.toLowerCase())) {
            keywordAnalysis.speakerAnalysis[speakerId].expansionKeywords.push({
              keyword,
              text: entry.text,
              timestamp: entry.start
            });
          }
        });
        
        keywordAnalysis.speakerAnalysis[speakerId].entries.push({
          text: entry.text,
          start: entry.start,
          end: entry.end
        });
      });
    }
  
    // Look for expansion sentiment indicators
    const sentimentKeywords = {
      positive: ['interested', 'excited', 'want to', 'need to', 'looking for', 'planning to', 'considering', 'exploring'],
      urgency: ['asap', 'urgent', 'quickly', 'soon', 'immediately', 'rush', 'deadline', 'time sensitive'],
      scale: ['big', 'large', 'massive', 'significant', 'major', 'substantial', 'huge', 'enormous'],
      budget: ['budget', 'cost', 'price', 'investment', 'spend', 'allocate', 'funding', 'approved']
    };
  
    Object.entries(sentimentKeywords).forEach(([category, sentiments]) => {
      sentiments.forEach(sentiment => {
        if (fullText.includes(sentiment)) {
          keywordAnalysis.sentimentIndicators.push({
            category,
            keyword: sentiment,
            impact: category === 'urgency' ? 2 : category === 'positive' ? 1.5 : 1
          });
        }
      });
    });
  
    // Calculate enhanced opportunity score
    let score = 0;
  
    // Base score from keyword frequency
    keywordAnalysis.keywordMatches.forEach(match => {
      score += match.frequency * 1.5;
    });
  
    // Boost for high-value keywords
    const highValueKeywords = [
      'enterprise', 'global expansion', 'international', 'multi-country',
      'peak season', 'scale up', 'enterprise plan', 'premium',
      'international fulfillment', 'cross-border', 'global shipping'
    ];
    
    keywordAnalysis.detectedKeywords.forEach(keyword => {
      if (highValueKeywords.some(hvk => keyword.includes(hvk) || hvk.includes(keyword))) {
        score += 3;
      }
    });
  
    // Boost for sentiment indicators
    keywordAnalysis.sentimentIndicators.forEach(indicator => {
      score += indicator.impact;
    });
  
    // Boost for multiple keyword categories
    const keywordCategories = new Set();
    keywordAnalysis.detectedKeywords.forEach(keyword => {
      if (keyword.includes('international') || keyword.includes('global') || keyword.includes('cross-border')) {
        keywordCategories.add('international');
      }
      if (keyword.includes('enterprise') || keyword.includes('premium')) {
        keywordCategories.add('enterprise');
      }
      if (keyword.includes('fulfillment') || keyword.includes('warehouse')) {
        keywordCategories.add('fulfillment');
      }
      if (keyword.includes('shipping') || keyword.includes('logistics')) {
        keywordCategories.add('shipping');
      }
    });
  
    if (keywordCategories.size > 1) {
      score += keywordCategories.size * 2; // Multi-category bonus
    }
  
    // Normalize score to 0-10 scale
    score = Math.min(10, Math.max(0, score));
  
    // Create detailed analysis summary
    const analysis = {
      score: Math.round(score * 10) / 10,
      detectedKeywords: keywordAnalysis.detectedKeywords,
      keywordMatches: keywordAnalysis.keywordMatches,
      keywordCategories: Array.from(keywordCategories),
      sentimentIndicators: keywordAnalysis.sentimentIndicators,
      speakerAnalysis: keywordAnalysis.speakerAnalysis,
      fullText: fullText.substring(0, 800), // Increased for better context
      contextSnippets: keywordAnalysis.keywordMatches.slice(0, 5).map(match => ({
        keyword: match.keyword,
        snippet: match.contexts[0]?.context.substring(0, 200) + '...'
      })),
      analysisMetrics: {
        transcriptLength: fullText.length,
        totalKeywordMentions: keywordAnalysis.keywordMatches.reduce((sum, match) => sum + match.frequency, 0),
        uniqueKeywords: keywordAnalysis.detectedKeywords.length,
        categoryDiversity: keywordCategories.size,
        hasSentimentBoost: keywordAnalysis.sentimentIndicators.length > 0
      }
    };
  
    console.log(`📊 Transcript analysis complete: Score ${analysis.score}, Keywords: ${analysis.detectedKeywords.length}, Categories: ${analysis.keywordCategories.join(', ')}`);
  
    return analysis;
  }
  


  // Extract merchant information from call - DEPRECATED, using findMerchantInfo instead
  extractMerchantInfo(parties) {
    if (!parties || parties.length === 0) {
      console.log('⚠️ No parties data - using fallback merchant identification');
      return {
        name: 'Unknown Merchant',
        email: 'unknown@merchant.com',
        merchantId: 'UNKNOWN'
      };
    }

    // Find external participant (not from ShipBob domain)
    const merchant = parties.find(party => 
      party.emailAddress && !party.emailAddress.includes('@shipbob.com')
    );

    if (!merchant) {
      console.log('⚠️ Could not identify merchant in call parties');
      return {
        name: 'Unknown Merchant',
        email: 'unknown@merchant.com',
        merchantId: 'UNKNOWN'
      };
    }

    return {
      name: merchant.name || 'Unknown Merchant',
      email: merchant.emailAddress,
      merchantId: this.getMerchantId(merchant.emailAddress)
    };
  }

  // Get merchant ID (this would typically query your CRM)
  getMerchantId(email) {
    // Mock implementation - replace with actual CRM lookup
    const domain = email?.split('@')[1];
    const mockMappings = {
      'techcorp.com': 'TECH-001',
      'growthstart.com': 'GROW-002',
      'entdynamics.com': 'ENT-003'
    };
    return mockMappings[domain] || `MERCHANT-${domain?.replace('.', '-').toUpperCase() || 'UNKNOWN'}`;
  }

  // Process a single call for expansion opportunities
  async processCall(call) {
    try {
      console.log(`\n🔍 Processing call ${call.id}: "${call.title || 'Untitled'}"`);
      
      // Skip if already processed
      if (processedCalls.has(call.id)) {
        console.log(`⏭️ Already processed call ${call.id}`);
        return null;
      }
  
      // Identify merchant first
      const merchantInfo = findMerchantInfo(call.parties, call.title);
      if (!merchantInfo) {
        processedCalls.add(call.id);
        console.log(`⏭️ Skipping call ${call.id} - could not identify merchant`);
        return null;
      }
  
      console.log(`✅ Identified merchant: ${merchantInfo.companyName} (${merchantInfo.method})`);
  
      // Check if SM was present
      const smPresent = isSolutionManagerPresent(call.parties, merchantInfo);
      if (smPresent) {
        processedCalls.add(call.id);
        console.log(`⏭️ Skipping call ${call.id} - SM ${merchantInfo.sm} was present`);
        return null;
      }
  
      // Get transcript with detailed logging
      console.log(`📝 Fetching transcript for ${merchantInfo.companyName} call...`);
      const transcript = await this.getCallTranscript(call.id);
      
      if (!transcript) {
        processedCalls.add(call.id);
        console.log(`⏭️ Skipping call ${call.id} - no transcript available`);
        return null;
      }
  
      console.log(`📄 Transcript retrieved: ${transcript.entries.length} entries, ~${transcript.entries.reduce((sum, e) => sum + e.text.split(' ').length, 0)} words`);
  
      // Analyze transcript with enhanced method
      const analysis = this.analyzeTranscript(transcript);
      
      console.log(`📊 Analysis for ${merchantInfo.companyName}:`);
      console.log(`   Score: ${analysis.score}/10`);
      console.log(`   Keywords found: [${analysis.detectedKeywords.join(', ')}]`);
      console.log(`   Keyword categories: [${analysis.keywordCategories?.join(', ') || 'none'}]`);
      console.log(`   Context snippets: ${analysis.contextSnippets?.length || 0}`);
  
      // Lower threshold for better detection during testing
      if (analysis.score < 2.0 || analysis.detectedKeywords.length === 0) {
        processedCalls.add(call.id);
        console.log(`⏭️ Skipping call ${call.id} - low opportunity score (${analysis.score}) or no keywords`);
        return null;
      }
  
      // Find MSM
      const msm = call.parties?.find(party => 
        party.emailAddress && 
        party.emailAddress.includes('@shipbob.com') &&
        !party.name?.toLowerCase().includes(merchantInfo.sm.toLowerCase())
      );
  
      const opportunity = {
        id: `OPP-${call.id}`,
        callId: call.id,
        merchant: merchantInfo.companyName,
        merchantId: merchantInfo.merchantId,
        merchantEmail: merchantInfo.email,
        callDate: new Date(call.started).toISOString().split('T')[0],
        callDuration: Math.round(call.duration / 60) + ' mins',
        callTitle: call.title || 'Untitled Call',
        msm: msm?.name || merchantInfo.msm || 'Unknown MSM',
        msmEmail: msm?.emailAddress,
        assignedSM: merchantInfo.sm,
        smEmail: merchantInfo.smEmail,
        transcript: analysis.fullText,
        detectedKeywords: analysis.detectedKeywords,
        keywordMatches: analysis.keywordMatches, // Detailed keyword analysis
        contextSnippets: analysis.contextSnippets, // Context around keywords
        opportunityScore: analysis.score,
        analysisMetrics: analysis.analysisMetrics,
        status: 'pending',
        callRecordingUrl: call.url || `https://app.gong.io/call?id=${call.id}`,
        attendees: call.parties?.map(p => p.name).filter(Boolean) || [],
        smPresent: false,
        flaggedAt: new Date().toISOString(),
        identificationMethod: merchantInfo.method
      };
  
      opportunities.push(opportunity);
      processedCalls.add(call.id);
  
      console.log(`🚩 NEW EXPANSION OPPORTUNITY: ${merchantInfo.companyName}`);
      console.log(`   Score: ${analysis.score}/10`);
      console.log(`   Top keywords: ${analysis.detectedKeywords.slice(0, 5).join(', ')}`);
      console.log(`   Context: "${analysis.contextSnippets[0]?.snippet?.substring(0, 100) || 'No context'}..."`);
      
      await this.notifySolutionManager(opportunity);
      return opportunity;
      
    } catch (error) {
      console.error(`❌ Error processing call ${call.id}:`, error.message);
      return null;
    }
  }

  // Send notification to Solution Manager
  async notifySolutionManager(opportunity) {
    try {
      console.log(`📧 Notifying ${opportunity.assignedSM} about opportunity with ${opportunity.merchant}`);
      
      // Example: Send email notification
      // await sendEmail({
      //   to: opportunity.smEmail,
      //   subject: `New Expansion Opportunity: ${opportunity.merchant}`,
      //   template: 'expansion-opportunity',
      //   data: opportunity
      // });

      // Example: Send Slack notification
      // await sendSlackMessage({
      //   channel: '@' + opportunity.assignedSM.toLowerCase().replace(' ', '.'),
      //   message: `🚩 New expansion opportunity detected with ${opportunity.merchant} (Score: ${opportunity.opportunityScore}/10)`
      // });

    } catch (error) {
      console.error('❌ Failed to send notification:', error.message);
    }
  }

  // Main scanning function
  async scanForOpportunities(daysBack = 7) {
    try {
      console.log(`\n🔍 Starting merchant-focused expansion opportunity scan for last ${daysBack} days...`);
      console.log(`📋 Tracking ${Object.keys(MERCHANT_MAPPING).length} merchants across ${SOLUTION_MANAGERS.length} Solution Managers`);
      
      const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
      const toDate = new Date();
      
      console.log(`📅 Scanning from ${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()}`);
      
      // Get all calls using the corrected method
      let allCalls = [];
      let cursor = null;
      const pageSize = 100;
      let pageCount = 0;
      const maxPages = 10; // Limit for initial testing
      
      do {
        try {
          pageCount++;
          console.log(`📄 Fetching page ${pageCount}...`);
          
          const params = {
            pageSize,
            fromDateTime: fromDate.toISOString(),
            toDateTime: toDate.toISOString()
          };
          
          if (cursor) {
            params.cursor = cursor;
          }
  
          const response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
            headers: this.getAuthHeaders(),
            params
          });
  
          // FIX: Use response.data.calls (not response.data.records.calls)
          const calls = response.data.calls || [];
          const totalRecords = response.data.records?.totalRecords || 0;
          cursor = response.data.records?.cursor;
          
          console.log(`📊 Page ${pageCount}: Retrieved ${calls.length} calls (Total in range: ${totalRecords})`);
          
          allCalls = allCalls.concat(calls);
          
          // Break conditions
          if (!cursor || calls.length === 0 || pageCount >= maxPages || allCalls.length >= 1000) {
            break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (fetchError) {
          console.error(`❌ Error fetching page ${pageCount}:`, fetchError.message);
          break;
        }
      } while (cursor && pageCount < maxPages);
  
      console.log(`📞 Total calls retrieved: ${allCalls.length}`);
  
      if (allCalls.length === 0) {
        return { 
          processedCalls: 0, 
          newOpportunities: 0, 
          totalCallsAvailable: 0,
          merchantCallsFound: 0
        };
      }
  
      // Enrich calls with participant data (this is crucial for merchant identification)
      console.log('🔍 Enriching calls with participant data...');
      const callsWithParties = await this.enrichCallsWithParties(allCalls);
      
      // Filter to merchant calls and analyze
      console.log('🎯 Filtering for tracked merchant calls...');
      const merchantCalls = [];
      const merchantStats = {};
      
      for (const call of callsWithParties) {
        const merchantInfo = findMerchantInfo(call.parties, call.title);
        if (merchantInfo) {
          merchantCalls.push({ ...call, merchantInfo });
          
          if (!merchantStats[merchantInfo.companyName]) {
            merchantStats[merchantInfo.companyName] = {
              calls: 0,
              sm: merchantInfo.sm,
              msm: merchantInfo.msm,
              callIds: []
            };
          }
          merchantStats[merchantInfo.companyName].calls++;
          merchantStats[merchantInfo.companyName].callIds.push(call.id);
        }
      }
  
      console.log(`\n📊 MERCHANT FILTERING RESULTS:`);
      console.log(`   📞 Total calls retrieved: ${allCalls.length}`);
      console.log(`   🎯 Calls with tracked merchants: ${merchantCalls.length}`);
      console.log(`   🏢 Unique merchants found: ${Object.keys(merchantStats).length}`);
      
      if (Object.keys(merchantStats).length > 0) {
        console.log(`   📋 Merchants with calls:`);
        Object.entries(merchantStats).forEach(([merchant, stats]) => {
          console.log(`      ${merchant}: ${stats.calls} calls (SM: ${stats.sm})`);
        });
      }
  
      if (merchantCalls.length === 0) {
        return { 
          processedCalls: 0, 
          newOpportunities: 0, 
          totalCallsAvailable: allCalls.length,
          merchantCallsFound: 0,
          merchantStats: {},
          warning: `Found ${allCalls.length} total calls but none were with tracked merchants.`,
          debugInfo: {
            sampleTitles: allCalls.slice(0, 10).map(c => c.title),
            trackedMerchants: Object.keys(MERCHANT_MAPPING).slice(0, 10)
          }
        };
      }
  
      // Process merchant calls for expansion opportunities
      console.log(`\n🔄 Processing ${merchantCalls.length} merchant calls for expansion opportunities...`);
      
      let newOpportunities = 0;
      let processedCount = 0;
  
      for (const call of merchantCalls) {
        try {
          if (processedCount % 5 === 0 && processedCount > 0) {
            console.log(`📊 Progress: ${processedCount}/${merchantCalls.length} merchant calls processed, ${newOpportunities} opportunities found`);
          }
          
          // Skip if already processed
          if (processedCalls.has(call.id)) {
            processedCount++;
            continue;
          }
  
          const merchantInfo = call.merchantInfo;
          
          // Check if SM was present
          const smPresent = isSolutionManagerPresent(call.parties, merchantInfo);
          if (smPresent) {
            processedCalls.add(call.id);
            console.log(`⏭️ Skipping call ${call.id} - SM ${merchantInfo.sm} was present`);
            processedCount++;
            continue;
          }
  
          // Get transcript
          const transcript = await this.getCallTranscript(call.id);
          if (!transcript) {
            processedCalls.add(call.id);
            processedCount++;
            continue;
          }
  
          // Analyze for expansion opportunities
          const analysis = this.analyzeTranscript(transcript);
          console.log(`📊 ${merchantInfo.companyName}: Score ${analysis.score}, Keywords: [${analysis.detectedKeywords.join(', ')}]`);
          
          // Check for expansion opportunity
          if (analysis.score < 2.0 || analysis.detectedKeywords.length === 0) {
            processedCalls.add(call.id);
            processedCount++;
            continue;
          }
  
          // Find MSM
          const msm = call.parties?.find(party => 
            party.emailAddress && 
            party.emailAddress.includes('@shipbob.com') &&
            !party.name?.toLowerCase().includes(merchantInfo.sm.toLowerCase())
          );
  
          const opportunity = {
            id: `OPP-${call.id}`,
            callId: call.id,
            merchant: merchantInfo.companyName,
            merchantId: merchantInfo.merchantId,
            merchantEmail: merchantInfo.email,
            callDate: new Date(call.started).toISOString().split('T')[0],
            callDuration: Math.round(call.duration / 60) + ' mins',
            callTitle: call.title || 'Untitled Call',
            msm: msm?.name || merchantInfo.msm || 'Unknown MSM',
            msmEmail: msm?.emailAddress,
            assignedSM: merchantInfo.sm,
            smEmail: merchantInfo.smEmail,
            transcript: analysis.fullText,
            detectedKeywords: analysis.detectedKeywords,
            opportunityScore: analysis.score,
            status: 'pending',
            callRecordingUrl: call.url || `https://app.gong.io/call?id=${call.id}`,
            attendees: call.parties?.map(p => p.name).filter(Boolean) || [],
            smPresent: false,
            flaggedAt: new Date().toISOString(),
            identificationMethod: merchantInfo.method
          };
  
          opportunities.push(opportunity);
          processedCalls.add(call.id);
          newOpportunities++;
  
          console.log(`🚩 NEW OPPORTUNITY: ${merchantInfo.companyName} (Score: ${analysis.score})`);
          
          await this.notifySolutionManager(opportunity);
          processedCount++;
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 150));
          
        } catch (error) {
          console.error(`❌ Error processing call ${call.id}:`, error.message);
          processedCount++;
        }
      }
  
      console.log(`\n✅ SCAN COMPLETE:`);
      console.log(`   📞 Total calls retrieved: ${allCalls.length}`);
      console.log(`   🎯 Merchant calls: ${merchantCalls.length}`);
      console.log(`   🔄 Processed: ${processedCount}`);
      console.log(`   🚩 New opportunities: ${newOpportunities}`);
      
      return { 
        processedCalls: processedCount, 
        newOpportunities,
        totalCallsAvailable: allCalls.length,
        merchantCallsFound: merchantCalls.length,
        merchantStats
      };
    } catch (error) {
      console.error('❌ Scan failed:', error.message);
      throw error;
    }
  }
}

// Initialize service
const gongService = new GongAPIService();

// Enhanced title-based opportunity scoring
function analyzeTitleForOpportunity(callTitle, merchantInfo) {
  if (!callTitle) return { score: 0, detectedKeywords: [], analysis: 'No title available' };

  const titleLower = callTitle.toLowerCase();
  
  // High-priority expansion indicators in titles
  const titleExpansionKeywords = [
    // Business expansion terms
    'expansion', 'scale', 'scaling', 'grow', 'growth', 'upgrade', 'enterprise',
    'additional', 'more', 'increase', 'bigger', 'premium', 'advanced',
    
    // International terms
    'international', 'global', 'worldwide', 'cross-border', 'multi-country',
    'canada', 'uk', 'europe', 'eu', 'australia', 'overseas',
    
    // Service expansion
    'fulfillment', 'warehousing', 'distribution', 'logistics', 'shipping',
    'inventory', 'peak season', 'holiday', 'q4', 'black friday',
    
    // Business discussions
    'strategy', 'planning', 'roadmap', 'review', 'qbr', 'quarterly',
    'proposal', 'pricing', 'quote', 'contract', 'agreement',
    
    // Implementation/setup terms
    'implementation', 'setup', 'onboarding', 'integration', 'migration',
    'new', 'launch', 'go-live', 'kickoff'
  ];

  const detectedKeywords = [];
  let score = 0;

  // Check for expansion keywords in title
  titleExpansionKeywords.forEach(keyword => {
    if (titleLower.includes(keyword)) {
      detectedKeywords.push(keyword);
      
      // Different scoring based on keyword importance
      if (['expansion', 'international', 'global', 'enterprise', 'scaling'].includes(keyword)) {
        score += 3; // High-value keywords
      } else if (['upgrade', 'additional', 'premium', 'growth', 'strategy'].includes(keyword)) {
        score += 2; // Medium-value keywords
      } else {
        score += 1; // General keywords
      }
    }
  });

  // Boost score for certain title patterns
  if (titleLower.includes('qbr') || titleLower.includes('quarterly review')) {
    score += 2; // Quarterly reviews often discuss expansion
  }
  
  if (titleLower.includes('pricing') || titleLower.includes('proposal')) {
    score += 1.5; // Pricing discussions may indicate expansion
  }

  // Normalize score to 0-10 scale
  score = Math.min(10, Math.max(0, score));

  return {
    score: Math.round(score * 10) / 10,
    detectedKeywords,
    analysis: `Title-based analysis found ${detectedKeywords.length} expansion indicators`,
    method: 'title-analysis'
  };
}

// Process call for title-based opportunities (no transcript needed)
async function processCallTitleBased(call) {
  try {
    console.log(`\n🔍 Processing call (title-based) ${call.id}: "${call.title || 'Untitled'}"`);
    
    // Skip if already processed
    if (processedCalls.has(call.id)) {
      console.log(`⏭️ Already processed call ${call.id}`);
      return null;
    }

    // Identify merchant first
    const merchantInfo = findMerchantInfo(call.parties, call.title);
    if (!merchantInfo) {
      processedCalls.add(call.id);
      console.log(`⏭️ Skipping call ${call.id} - could not identify merchant`);
      return null;
    }

    console.log(`✅ Identified merchant: ${merchantInfo.companyName} (${merchantInfo.method})`);

    // Analyze title for expansion opportunities
    const analysis = this.analyzeTitleForOpportunity(call.title, merchantInfo);
    
    console.log(`📊 Title analysis for ${merchantInfo.companyName}:`);
    console.log(`   Score: ${analysis.score}/10`);
    console.log(`   Keywords found: [${analysis.detectedKeywords.join(', ')}]`);

    // Lower threshold for title-based detection
    if (analysis.score < 1.0 || analysis.detectedKeywords.length === 0) {
      processedCalls.add(call.id);
      console.log(`⏭️ Skipping call ${call.id} - low opportunity score (${analysis.score}) or no keywords`);
      return null;
    }

    const opportunity = {
      id: `OPP-${call.id}`,
      callId: call.id,
      merchant: merchantInfo.companyName,
      merchantId: merchantInfo.merchantId,
      merchantEmail: merchantInfo.email,
      callDate: new Date(call.started).toISOString().split('T')[0],
      callDuration: Math.round(call.duration / 60) + ' mins',
      callTitle: call.title || 'Untitled Call',
      msm: merchantInfo.msm || 'Unknown MSM',
      assignedSM: merchantInfo.sm,
      smEmail: merchantInfo.smEmail,
      transcript: `Title-based analysis: "${call.title}"`, // No actual transcript
      detectedKeywords: analysis.detectedKeywords,
      opportunityScore: analysis.score,
      status: 'pending',
      callRecordingUrl: call.url || `https://app.gong.io/call?id=${call.id}`,
      attendees: ['Participants not available'], // No participant data
      smPresent: false, // Cannot determine without participant data
      flaggedAt: new Date().toISOString(),
      identificationMethod: `${merchantInfo.method} + ${analysis.method}`,
      analysisType: 'title-based', // Flag this as title-based analysis
      limitedData: true // Indicate this is based on limited data
    };

    opportunities.push(opportunity);
    processedCalls.add(call.id);

    console.log(`🚩 NEW TITLE-BASED OPPORTUNITY: ${merchantInfo.companyName}`);
    console.log(`   Score: ${analysis.score}/10`);
    console.log(`   Keywords: ${analysis.detectedKeywords.join(', ')}`);
    console.log(`   Title: "${call.title}"`);
    
    return opportunity;
    
  } catch (error) {
    console.error(`❌ Error processing call ${call.id}:`, error.message);
    return null;
  }
}

// Title-based scanning function (no transcripts needed)
async function scanForOpportunitiesTitleBased(daysBack = 7) {
  try {
    console.log(`\n🔍 Starting TITLE-BASED expansion opportunity scan for last ${daysBack} days...`);
    console.log(`📋 Tracking ${Object.keys(MERCHANT_MAPPING).length} merchants across ${SOLUTION_MANAGERS.length} Solution Managers`);
    console.log(`⚠️ Using title-based analysis (no transcripts required)`);
    
    const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const toDate = new Date();
    
    console.log(`📅 Scanning from ${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()}`);
    
    // Get all calls
    let allCalls = [];
    let cursor = null;
    const pageSize = 100;
    let pageCount = 0;
    const maxPages = 20; // Increased for title-based scanning
    
    do {
      try {
        pageCount++;
        console.log(`📄 Fetching page ${pageCount}...`);
        
        const params = {
          pageSize,
          fromDateTime: fromDate.toISOString(),
          toDateTime: toDate.toISOString()
        };
        
        if (cursor) {
          params.cursor = cursor;
        }

        const response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
          headers: this.getAuthHeaders(),
          params
        });

        // Use consistent structure - check both locations
        const calls = response.data.records?.calls || response.data.calls || [];
        const totalRecords = response.data.records?.totalRecords || 0;
        cursor = response.data.records?.cursor;
        
        console.log(`📊 Page ${pageCount}: Retrieved ${calls.length} calls (Total in range: ${totalRecords})`);
        
        allCalls = allCalls.concat(calls);
        
        // Break conditions
        if (!cursor || calls.length === 0 || pageCount >= maxPages || allCalls.length >= 2000) {
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (fetchError) {
        console.error(`❌ Error fetching page ${pageCount}:`, fetchError.message);
        break;
      }
    } while (cursor && pageCount < maxPages);

    console.log(`📞 Total calls retrieved: ${allCalls.length}`);

    if (allCalls.length === 0) {
      return { 
        processedCalls: 0, 
        newOpportunities: 0, 
        totalCallsAvailable: 0,
        merchantCallsFound: 0,
        analysisType: 'title-based'
      };
    }

    // Filter to merchant calls by title (no participant data needed)
    console.log('🎯 Filtering for tracked merchant calls by title...');
    const merchantCalls = [];
    const merchantStats = {};
    
    for (const call of allCalls) {
      const merchantInfo = findMerchantInfo(call.parties, call.title);
      if (merchantInfo) {
        merchantCalls.push({ ...call, merchantInfo });
        
        if (!merchantStats[merchantInfo.companyName]) {
          merchantStats[merchantInfo.companyName] = {
            calls: 0,
            sm: merchantInfo.sm,
            msm: merchantInfo.msm,
            callIds: []
          };
        }
        merchantStats[merchantInfo.companyName].calls++;
        merchantStats[merchantInfo.companyName].callIds.push(call.id);
      }
    }

    console.log(`\n📊 MERCHANT FILTERING RESULTS (Title-Based):`);
    console.log(`   📞 Total calls retrieved: ${allCalls.length}`);
    console.log(`   🎯 Calls with tracked merchants: ${merchantCalls.length}`);
    console.log(`   🏢 Unique merchants found: ${Object.keys(merchantStats).length}`);
    
    if (Object.keys(merchantStats).length > 0) {
      console.log(`   📋 Merchants with calls:`);
      Object.entries(merchantStats).forEach(([merchant, stats]) => {
        console.log(`      ${merchant}: ${stats.calls} calls (SM: ${stats.sm})`);
      });
    }

    if (merchantCalls.length === 0) {
      return { 
        processedCalls: 0, 
        newOpportunities: 0, 
        totalCallsAvailable: allCalls.length,
        merchantCallsFound: 0,
        merchantStats: {},
        analysisType: 'title-based',
        warning: `Found ${allCalls.length} total calls but none were with tracked merchants.`
      };
    }

    // Process merchant calls for title-based expansion opportunities
    console.log(`\n🔄 Processing ${merchantCalls.length} merchant calls for title-based expansion opportunities...`);
    
    let newOpportunities = 0;
    let processedCount = 0;

    for (const call of merchantCalls) {
      try {
        if (processedCount % 10 === 0 && processedCount > 0) {
          console.log(`📊 Progress: ${processedCount}/${merchantCalls.length} merchant calls processed, ${newOpportunities} opportunities found`);
        }
        
        const opportunity = await this.processCallTitleBased(call);
        if (opportunity) {
          newOpportunities++;
        }
        processedCount++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing call ${call.id}:`, error.message);
        processedCount++;
      }
    }

    console.log(`\n✅ TITLE-BASED SCAN COMPLETE:`);
    console.log(`   📞 Total calls retrieved: ${allCalls.length}`);
    console.log(`   🎯 Merchant calls: ${merchantCalls.length}`);
    console.log(`   🔄 Processed: ${processedCount}`);
    console.log(`   🚩 New opportunities: ${newOpportunities}`);
    console.log(`   📝 Analysis type: Title-based (no transcripts)`);
    
    return { 
      processedCalls: processedCount, 
      newOpportunities,
      totalCallsAvailable: allCalls.length,
      merchantCallsFound: merchantCalls.length,
      merchantStats,
      analysisType: 'title-based'
    };
  } catch (error) {
    console.error('❌ Title-based scan failed:', error.message);
    throw error;
  }
}

app.get('/api/test-simple', (req, res) => {
  console.log('🧪 Simple test endpoint hit');
  res.json({
    success: true,
    message: 'Server is responding',
    timestamp: new Date().toISOString(),
    availableMethods: {
      analyzeTitleForOpportunity: typeof gongService.analyzeTitleForOpportunity,
      scanForOpportunitiesTitleBased: typeof gongService.scanForOpportunitiesTitleBased
    }
  });
});

// Add test endpoint for title-based scanning
app.post('/api/test-title-based-scan', async (req, res) => {
  try {
    const { daysBack = 7, maxCalls = 50 } = req.body;
    
    console.log(`🧪 Testing title-based scan functionality with last ${daysBack} days (max ${maxCalls} calls)...`);
    
    const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const scanResults = {
      dateRange: {
        from: fromDate.toISOString(),
        to: new Date().toISOString(),
        days: daysBack
      },
      steps: [],
      issues: [],
      opportunities: [],
      analysisType: 'title-based'
    };

    // Step 1: Fetch calls
    try {
      scanResults.steps.push({ step: 1, action: 'Fetching calls from Gong API', status: 'STARTED' });
      
      const response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
        headers: gongService.getAuthHeaders(),
        params: {
          pageSize: maxCalls,
          fromDateTime: fromDate.toISOString(),
          toDateTime: new Date().toISOString()
        }
      });
      
      const calls = response.data.records?.calls || response.data.calls || [];
      
      scanResults.steps.push({ 
        step: 1, 
        action: 'Fetching calls from Gong API', 
        status: 'SUCCESS',
        data: {
          totalInRange: response.data.records?.totalRecords || 0,
          callsFetched: calls.length,
          structure: response.data.records?.calls ? 'records.calls' : 'calls'
        }
      });
      
      if (calls.length === 0) {
        scanResults.issues.push('No calls found in date range');
        return res.json({ success: false, ...scanResults });
      }

      // Step 2: Identify merchant calls (title-based)
      scanResults.steps.push({ step: 2, action: 'Identifying merchant calls by title', status: 'STARTED' });
      
      const merchantCalls = [];
      for (const call of calls) {
        const merchantInfo = findMerchantInfo(call.parties, call.title);
        if (merchantInfo) {
          merchantCalls.push({ ...call, merchantInfo });
        }
      }
      
      scanResults.steps.push({ 
        step: 2, 
        action: 'Identifying merchant calls by title', 
        status: 'SUCCESS',
        data: {
          totalCalls: calls.length,
          merchantCalls: merchantCalls.length,
          identificationRate: `${merchantCalls.length}/${calls.length}`,
          identifiedMerchants: merchantCalls.map(c => ({
            callId: c.id,
            merchant: c.merchantInfo.companyName,
            sm: c.merchantInfo.sm,
            method: c.merchantInfo.method
          }))
        }
      });

      if (merchantCalls.length === 0) {
        scanResults.issues.push('No merchant calls identified');
        return res.json({ success: false, ...scanResults });
      }

      // Step 3: Analyze titles for opportunities
      scanResults.steps.push({ step: 3, action: 'Analyzing call titles for expansion opportunities', status: 'STARTED' });
      
      for (const call of merchantCalls.slice(0, 10)) { // Test first 10 merchant calls
        const merchantInfo = call.merchantInfo;
        
        // Analyze title
        const analysis = gongService.analyzeTitleForOpportunity(call.title, merchantInfo);
        
        if (analysis.score >= 1.0 && analysis.detectedKeywords.length > 0) {
          scanResults.opportunities.push({
            callId: call.id,
            merchant: merchantInfo.companyName,
            sm: merchantInfo.sm,
            score: analysis.score,
            keywords: analysis.detectedKeywords,
            title: call.title,
            analysisType: 'title-based'
          });
        }
      }
      
      scanResults.steps.push({ 
        step: 3, 
        action: 'Analyzing call titles for expansion opportunities', 
        status: 'SUCCESS',
        data: {
          merchantCallsAnalyzed: Math.min(merchantCalls.length, 10),
          opportunitiesFound: scanResults.opportunities.length,
          analysisMethod: 'title-keywords-only'
        }
      });

      // Summary
      const summary = {
        success: true,
        totalSteps: 3,
        completedSteps: scanResults.steps.filter(s => s.status === 'SUCCESS').length,
        issues: scanResults.issues,
        opportunitiesFound: scanResults.opportunities.length,
        analysisType: 'title-based',
        recommendations: []
      };

      if (merchantCalls.length === 0) {
        summary.recommendations.push('❌ No merchants identified - check merchant mapping or call title patterns');
      } else {
        summary.recommendations.push(`✅ ${merchantCalls.length} merchant calls identified by title`);
      }
      
      if (scanResults.opportunities.length === 0) {
        summary.recommendations.push('⚠️ No expansion opportunities detected in titles - try broader date range or different keywords');
      } else {
        summary.recommendations.push(`✅ Found ${scanResults.opportunities.length} title-based expansion opportunities!`);
      }

      summary.recommendations.push('💡 This is title-based analysis only - transcripts not available');
      summary.recommendations.push('🔧 Fix API permissions for participant data and transcripts for full analysis');

      res.json({
        ...summary,
        scanResults
      });
      
    } catch (error) {
      scanResults.steps.push({ 
        step: 1, 
        action: 'Fetching calls from Gong API', 
        status: 'FAILED',
        error: error.message
      });
      
      res.status(500).json({
        success: false,
        error: error.message,
        scanResults
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add endpoint to test transcript analysis on a specific call
app.get('/api/test-transcript-analysis/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    console.log(`🧪 Testing transcript analysis for call ${callId}...`);
    
    // Get the call details
    const callResponse = await axios.get(`${GONG_CONFIG.baseURL}/calls/${callId}`, {
      headers: gongService.getAuthHeaders()
    });
    
    const call = callResponse.data;
    
    // Get the transcript
    const transcript = await gongService.getCallTranscript(callId);
    
    if (!transcript) {
      return res.json({
        success: false,
        error: 'No transcript available for this call',
        callInfo: {
          id: call.id,
          title: call.title,
          started: call.started,
          duration: call.duration
        }
      });
    }
    
    // Analyze the transcript
    const analysis = gongService.analyzeTranscript(transcript);
    
    // Get merchant info for context
    const merchantInfo = findMerchantInfo(call.parties, call.title);
    
    res.json({
      success: true,
      callInfo: {
        id: call.id,
        title: call.title,
        started: call.started,
        duration: call.duration,
        participants: call.parties?.length || 0
      },
      merchantInfo,
      transcriptInfo: {
        totalEntries: transcript.entries.length,
        totalWords: transcript.entries.reduce((sum, entry) => sum + entry.text.split(' ').length, 0),
        duration: transcript.entries.length > 0 ? 
          transcript.entries[transcript.entries.length - 1].end - transcript.entries[0].start : 0
      },
      analysis,
      recommendations: {
        isExpansionOpportunity: analysis.score >= 2.0 && analysis.detectedKeywords.length > 0,
        reasonForScore: analysis.score < 2.0 ? 'Low keyword relevance' : 
                       analysis.detectedKeywords.length === 0 ? 'No expansion keywords detected' : 
                       'Meets expansion criteria',
        suggestedActions: analysis.score >= 7 ? ['Immediate SM follow-up', 'Priority opportunity'] :
                         analysis.score >= 4 ? ['SM review recommended', 'Good expansion potential'] :
                         analysis.score >= 2 ? ['Monitor for additional signals', 'Possible opportunity'] :
                         ['Not an expansion opportunity', 'Continue regular engagement']
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API Routes

// Get all opportunities
app.get('/api/opportunities', (req, res) => {
  const { status, sm } = req.query;
  let filtered = opportunities;

  if (status && status !== 'all') {
    filtered = filtered.filter(opp => opp.status === status);
  }
  
  if (sm && sm !== 'all') {
    filtered = filtered.filter(opp => opp.assignedSM === sm);
  }

  res.json(filtered);
});

// Acknowledge opportunity
app.post('/api/opportunities/:id/acknowledge', (req, res) => {
  const opportunity = opportunities.find(opp => opp.id === req.params.id);
  if (!opportunity) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }

  opportunity.status = 'acknowledged';
  opportunity.acknowledgedAt = new Date().toISOString();
  opportunity.acknowledgedBy = req.body.acknowledgedBy;

  res.json(opportunity);
});

// Manual scan trigger
app.post('/api/scan', async (req, res) => {
  try {
    const { daysBack = 7 } = req.body;
    console.log(`🔍 Manual scan triggered for last ${daysBack} days`);
    
    const result = await gongService.scanForOpportunities(daysBack);
    res.json(result);
  } catch (error) {
    console.error('❌ Manual scan failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get keywords
app.get('/api/keywords', (req, res) => {
  res.json(EXPANSION_KEYWORDS);
});

// Add keyword
app.post('/api/keywords', (req, res) => {
  const { keyword } = req.body;
  if (keyword && !EXPANSION_KEYWORDS.includes(keyword.toLowerCase())) {
    EXPANSION_KEYWORDS.push(keyword.toLowerCase());
  }
  res.json(EXPANSION_KEYWORDS);
});

// Remove keyword
app.delete('/api/keywords/:keyword', (req, res) => {
  const index = EXPANSION_KEYWORDS.indexOf(req.params.keyword.toLowerCase());
  if (index > -1) {
    EXPANSION_KEYWORDS.splice(index, 1);
  }
  res.json(EXPANSION_KEYWORDS);
});

// Get solution managers
app.get('/api/solution-managers', (req, res) => {
  res.json(SOLUTION_MANAGERS);
});

// Test API connection
app.get('/api/test-connection', async (req, res) => {
  try {
    console.log('🧪 Testing Gong API connection with corrected call retrieval...');
    
    // Test with the corrected response structure
    const response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
      headers: gongService.getAuthHeaders(),
      params: { pageSize: 10 }
    });
    
    // FIX: Use response.data.calls instead of response.data.records.calls
    const calls = response.data.calls || [];
    const totalRecords = response.data.records?.totalRecords || 0;
    
    console.log(`📊 Corrected retrieval: ${calls.length} calls found`);
    
    // Test merchant identification on retrieved calls
    let merchantsIdentified = 0;
    let merchantDetails = [];
    
    for (const call of calls.slice(0, 5)) {
      console.log(`🔍 Analyzing call: ${call.id} - "${call.title}"`);
      console.log(`   Participants: ${call.parties?.length || 0}`);
      
      const merchantInfo = findMerchantInfo(call.parties, call.title);
      if (merchantInfo) {
        merchantsIdentified++;
        merchantDetails.push({
          callId: call.id,
          callTitle: call.title,
          callDate: call.started,
          merchantInfo: {
            company: merchantInfo.companyName,
            sm: merchantInfo.sm,
            method: merchantInfo.method,
            merchantId: merchantInfo.merchantId
          },
          participants: call.parties?.map(p => ({
            name: p.name,
            email: p.emailAddress
          })).filter(p => p.name || p.email) || []
        });
        console.log(`✅ Identified merchant: ${merchantInfo.companyName} (${merchantInfo.method})`);
      } else {
        console.log(`❌ Could not identify merchant for call ${call.id}`);
        if (call.parties) {
          console.log(`   Participants:`, call.parties.map(p => p.emailAddress || p.name));
        }
      }
    }
    
    // Test different date ranges with corrected structure
    const dateTests = [];
    for (const days of [7, 30, 60]) {
      try {
        const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const testResponse = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
          headers: gongService.getAuthHeaders(),
          params: {
            fromDateTime: fromDate.toISOString(),
            toDateTime: new Date().toISOString(),
            pageSize: 5
          }
        });
        
        const testCalls = testResponse.data.calls || [];
        
        dateTests.push({
          days,
          totalAvailable: testResponse.data.records?.totalRecords || 0,
          callsRetrieved: testCalls.length,
          sampleDates: testCalls.slice(0, 3).map(c => c.started)
        });
      } catch (error) {
        dateTests.push({
          days,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Connection test with corrected structure - found ${calls.length} calls!`,
      callRetrieval: {
        totalCallsInWorkspace: totalRecords,
        callsRetrieved: calls.length,
        structureFix: 'Now using response.data.calls instead of response.data.records.calls'
      },
      merchantTracking: {
        totalMerchantsTracked: Object.keys(MERCHANT_MAPPING).length,
        solutionManagers: SOLUTION_MANAGERS,
        merchantIdentificationRate: `${merchantsIdentified}/${calls.length} calls`,
        identifiedMerchants: merchantDetails
      },
      dateRangeTesting: dateTests,
      sampleCall: calls[0] ? {
        id: calls[0].id,
        title: calls[0].title,
        started: calls[0].started,
        duration: calls[0].duration,
        participants: calls[0].parties?.length || 0,
        hasParties: !!(calls[0].parties && calls[0].parties.length > 0),
        merchantFound: !!findMerchantInfo(calls[0].parties, calls[0].title)
      } : null,
      recommendation: calls.length > 0 
        ? "✅ Call retrieval now working! Ready to scan for expansion opportunities."
        : "⚠️ Still having issues retrieving call details."
    });
    
  } catch (error) {
    console.error('❌ Enhanced connection test failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    processedCalls: processedCalls.size,
    opportunities: opportunities.length,
    config: {
      baseURL: GONG_CONFIG.baseURL,
      hasCredentials: !!(GONG_CONFIG.accessKey && GONG_CONFIG.accessKeySecret)
    }
  });
});

// Scheduled scanning (every 2 hours during business hours, Monday-Friday)
cron.schedule('0 9-17/2 * * 1-5', async () => {
  console.log('⏰ Scheduled scan starting...');
  try {
    await gongService.scanForOpportunities();
  } catch (error) {
    console.error('❌ Scheduled scan failed:', error.message);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Gong Expansion Tracker API running on port ${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('  GET  /api/opportunities - Get all opportunities');
  console.log('  POST /api/opportunities/:id/acknowledge - Acknowledge opportunity');
  console.log('  POST /api/scan - Manual scan trigger (body: {daysBack: 30})');
  console.log('  GET  /api/test-connection - Test Gong API connection');
  console.log('  GET  /api/keywords - Get expansion keywords');
  console.log('  POST /api/keywords - Add keyword');
  console.log('  DELETE /api/keywords/:keyword - Remove keyword');
  console.log('  GET  /api/solution-managers - Get solution managers list');
  console.log('  GET  /api/health - Health check');
  console.log('');
  console.log('🔧 Configuration:');
  console.log(`  Base URL: ${GONG_CONFIG.baseURL}`);
  console.log(`  Has credentials: ${!!(GONG_CONFIG.accessKey && GONG_CONFIG.accessKeySecret)}`);
  console.log(`  Tracking ${Object.keys(MERCHANT_MAPPING).length} merchants across ${SOLUTION_MANAGERS.length} Solution Managers`);
  console.log('');
  console.log('💡 To test: curl http://localhost:3001/api/health');
  console.log('💡 To test connection: curl http://localhost:3001/api/test-connection');
  console.log('  POST /api/scan-title-based - 🆕 TITLE-BASED scan trigger');
  console.log('  POST /api/test-title-based-scan - 🆕 TEST title-based scan');
  console.log('  GET  /api/test-connection - Test Gong API connection');
});

module.exports = { app, gongService };

// Enhanced debug endpoint - add this to your server.js
app.get('/api/debug-gong', async (req, res) => {
  try {
    console.log('🔧 Starting comprehensive Gong API debug...');
    
    const debug = {
      config: {
        baseURL: GONG_CONFIG.baseURL,
        hasAccessKey: !!GONG_CONFIG.accessKey,
        hasAccessKeySecret: !!GONG_CONFIG.accessKeySecret,
        keyLength: GONG_CONFIG.accessKey ? GONG_CONFIG.accessKey.length : 0,
        secretLength: GONG_CONFIG.accessKeySecret ? GONG_CONFIG.accessKeySecret.length : 0
      },
      tests: []
    };

    // Test with corrected response handling
    try {
      console.log('📡 Testing basic API connectivity with corrected structure...');
      const headers = gongService.getAuthHeaders();
      
      const response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
        headers,
        params: { pageSize: 5 }
      });
      
      // Use the correct location for calls
      const calls = response.data.calls || [];
      
      debug.tests.push({
        test: 'Basic API Call (Corrected)',
        status: 'SUCCESS',
        data: {
          totalRecords: response.data.records?.totalRecords || 0,
          callsReturned: calls.length,
          hasRecords: !!response.data.records,
          hasCalls: !!response.data.calls,
          callsLocation: 'response.data.calls',
          cursor: response.data.records?.cursor,
          sampleCall: calls[0] ? {
            id: calls[0].id,
            title: calls[0].title,
            started: calls[0].started,
            hasParties: !!(calls[0].parties && calls[0].parties.length > 0)
          } : null
        }
      });
    } catch (error) {
      debug.tests.push({
        test: 'Basic API Call (Corrected)',
        status: 'FAILED',
        error: {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        }
      });
    }

    res.json(debug);
  } catch (error) {
    res.status(500).json({
      error: 'Debug failed',
      message: error.message
    });
  }
});

app.get('/api/test-simple', (req, res) => {
  console.log('🧪 Simple test endpoint hit');
  res.json({
    success: true,
    message: 'Server is responding',
    timestamp: new Date().toISOString(),
    availableMethods: {
      analyzeTitleForOpportunity: typeof gongService.analyzeTitleForOpportunity,
      scanForOpportunitiesTitleBased: typeof gongService.scanForOpportunitiesTitleBased
    }
  });
});

// 5. Add error logging to the new endpoints (if they exist):
app.post('/api/scan-title-based', async (req, res) => {
  console.log('🔍 Title-based scan endpoint hit'); // ← Should see this log
  try {
    const { daysBack = 7 } = req.body;
    console.log(`🔍 Manual title-based scan triggered for last ${daysBack} days`);
    
    // Check if method exists
    if (typeof gongService.scanForOpportunitiesTitleBased !== 'function') {
      console.error('❌ scanForOpportunitiesTitleBased method not found on gongService');
      return res.status(500).json({ error: 'Title-based scan method not available' });
    }
    
    const result = await gongService.scanForOpportunitiesTitleBased(daysBack);
    res.json(result);
  } catch (error) {
    console.error('❌ Manual title-based scan failed:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Enhanced test connection endpoint - replace existing one
app.get('/api/test-connection', async (req, res) => {
  try {
    console.log('🧪 Enhanced connection test starting...');
    
    // Test basic connection first
    const testResponse = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
      headers: gongService.getAuthHeaders(),
      params: { pageSize: 10 }
    });
    
    const calls = testResponse.data.records?.calls || [];
    console.log(`📞 Retrieved ${calls.length} calls from test`);
    
    // Test merchant identification
    let merchantsIdentified = 0;
    let merchantDetails = [];
    
    for (const call of calls.slice(0, 5)) {
      const merchantInfo = findMerchantInfo(call.parties, call.title);
      if (merchantInfo) {
        merchantsIdentified++;
        merchantDetails.push({
          callId: call.id,
          callTitle: call.title,
          merchantInfo: {
            company: merchantInfo.companyName,
            sm: merchantInfo.sm,
            method: merchantInfo.method
          }
        });
      }
    }
    
    // Check for any calls in different time ranges
    const timeRangeTests = [];
    for (const days of [7, 30, 60, 90]) {
      try {
        const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const rangeResponse = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
          headers: gongService.getAuthHeaders(),
          params: {
            fromDateTime: fromDate.toISOString(),
            toDateTime: new Date().toISOString(),
            pageSize: 5
          }
        });
        
        timeRangeTests.push({
          days,
          totalCalls: rangeResponse.data.records?.totalRecords || 0,
          retrievedCalls: rangeResponse.data.records?.calls?.length || 0
        });
      } catch (error) {
        timeRangeTests.push({
          days,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Enhanced connection test completed!`,
      apiHealth: {
        baseURL: GONG_CONFIG.baseURL,
        hasCredentials: !!(GONG_CONFIG.accessKey && GONG_CONFIG.accessKeySecret),
        credentialLength: {
          accessKey: GONG_CONFIG.accessKey?.length || 0,
          secret: GONG_CONFIG.accessKeySecret?.length || 0
        }
      },
      callData: {
        totalCallsAvailable: testResponse.data.records?.totalRecords || 0,
        callsRetrieved: calls.length,
        hasCalls: calls.length > 0,
        hasRecords: !!testResponse.data.records
      },
      merchantTracking: {
        totalMerchantsTracked: Object.keys(MERCHANT_MAPPING).length,
        solutionManagers: SOLUTION_MANAGERS,
        merchantIdentificationRate: `${merchantsIdentified}/${Math.min(calls.length, 5)} calls`,
        identifiedMerchants: merchantDetails
      },
      timeRangeAnalysis: timeRangeTests,
      sampleCall: calls[0] ? {
        id: calls[0].id,
        title: calls[0].title,
        started: calls[0].started,
        duration: calls[0].duration,
        participants: calls[0].parties?.length || 0,
        participantEmails: calls[0].parties?.map(p => p.emailAddress).filter(Boolean) || [],
        merchantFound: !!findMerchantInfo(calls[0].parties, calls[0].title)
      } : null,
      troubleshooting: {
        commonIssues: [
          "No calls in date range - try expanding date range",
          "Insufficient permissions - check API key permissions",
          "Wrong workspace - verify you're connected to the correct Gong workspace",
          "Date format issues - API might expect different date format"
        ],
        nextSteps: [
          "Visit /api/debug-gong for detailed debugging",
          "Check Gong admin panel for API key permissions",
          "Verify calls exist in your Gong workspace for the date range",
          "Test with broader date ranges (90+ days)"
        ]
      }
    });
    
  } catch (error) {
    console.error('❌ Enhanced connection test failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data,
      troubleshooting: {
        possibleCauses: [
          "Invalid API credentials",
          "Incorrect Gong workspace URL",
          "API key lacks sufficient permissions",
          "Network connectivity issues"
        ],
        checkList: [
          "Verify GONG_ACCESS_KEY is set correctly",
          "Verify GONG_ACCESS_KEY_SECRET is set correctly", 
          "Check GONG_BASE_URL points to your workspace",
          "Confirm API key has 'Read calls' permission in Gong"
        ]
      }
    });
  }
});
app.get('/api/preview-merchant-calls', async (req, res) => {
  try {
    const { daysBack = 60 } = req.query;
    
    console.log(`🔍 Previewing merchant calls for last ${daysBack} days...`);
    
    const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const toDate = new Date();
    
    // Get sample of calls
    const response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
      headers: gongService.getAuthHeaders(),
      params: {
        fromDateTime: fromDate.toISOString(),
        toDateTime: toDate.toISOString(),
        pageSize: 200
      }
    });
    
    const calls = response.data.calls || [];
    const totalInRange = response.data.records?.totalRecords || 0;
    
    console.log(`📊 Retrieved ${calls.length} sample calls (${totalInRange} total in range)`);
    
    // Enrich with parties
    const enrichedCalls = await gongService.enrichCallsWithParties(calls);
    
    // Analyze merchant distribution
    const merchantAnalysis = {
      totalCallsInRange: totalInRange,
      sampleCallsAnalyzed: enrichedCalls.length,
      merchantCalls: [],
      nonMerchantCalls: [],
      merchantStats: {}
    };
    
    for (const call of enrichedCalls) {
      const merchantInfo = findMerchantInfo(call.parties, call.title);
      
      if (merchantInfo) {
        merchantAnalysis.merchantCalls.push({
          callId: call.id,
          callTitle: call.title,
          callDate: call.started,
          merchant: merchantInfo.companyName,
          sm: merchantInfo.sm,
          msm: merchantInfo.msm,
          identificationMethod: merchantInfo.method,
          participants: call.parties?.map(p => p.emailAddress || p.name).filter(Boolean) || []
        });
        
        if (!merchantAnalysis.merchantStats[merchantInfo.companyName]) {
          merchantAnalysis.merchantStats[merchantInfo.companyName] = {
            calls: 0,
            sm: merchantInfo.sm,
            msm: merchantInfo.msm
          };
        }
        merchantAnalysis.merchantStats[merchantInfo.companyName].calls++;
        
      } else {
        // Sample non-merchant calls for analysis
        if (merchantAnalysis.nonMerchantCalls.length < 10) {
          merchantAnalysis.nonMerchantCalls.push({
            callId: call.id,
            callTitle: call.title,
            callDate: call.started,
            participants: call.parties?.map(p => p.emailAddress || p.name).filter(Boolean) || []
          });
        }
      }
    }
    
    res.json({
      success: true,
      dateRange: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        days: daysBack
      },
      analysis: merchantAnalysis,
      projectedMerchantCalls: Math.round((merchantAnalysis.merchantCalls.length / enrichedCalls.length) * totalInRange),
      recommendations: {
        worthScanning: merchantAnalysis.merchantCalls.length > 0,
        expectedOpportunities: `Estimated ${Math.round(merchantAnalysis.merchantCalls.length * 0.1)} - ${Math.round(merchantAnalysis.merchantCalls.length * 0.3)} expansion opportunities`,
        topMerchants: Object.entries(merchantAnalysis.merchantStats)
          .sort((a, b) => b[1].calls - a[1].calls)
          .slice(0, 5)
          .map(([name, stats]) => `${name} (${stats.calls} calls)`)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/test-merchant-identification', async (req, res) => {
  try {
    console.log('🧪 Testing merchant identification on real calls...');
    
    // Get a sample of calls
    const response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
      headers: gongService.getAuthHeaders(),
      params: { pageSize: 50 }
    });
    
    const calls = response.data.calls || [];
    console.log(`📞 Retrieved ${calls.length} calls for merchant identification test`);
    
    // Enrich with parties data
    const enrichedCalls = await gongService.enrichCallsWithParties(calls);
    
    // Test merchant identification
    const identificationResults = [];
    let identifiedCount = 0;
    
    for (const call of enrichedCalls.slice(0, 20)) { // Test first 20 calls
      const merchantInfo = findMerchantInfo(call.parties, call.title);
      
      const result = {
        callId: call.id,
        callTitle: call.title,
        callDate: call.started,
        participants: call.parties?.length || 0,
        participantEmails: call.parties?.map(p => p.emailAddress).filter(Boolean) || [],
        merchantFound: !!merchantInfo,
        merchantInfo: merchantInfo ? {
          company: merchantInfo.companyName,
          sm: merchantInfo.sm,
          msm: merchantInfo.msm,
          method: merchantInfo.method
        } : null
      };
      
      if (merchantInfo) {
        identifiedCount++;
      }
      
      identificationResults.push(result);
    }
    
    // Analyze call titles for patterns
    const titlePatterns = {};
    calls.forEach(call => {
      if (call.title) {
        const titleLower = call.title.toLowerCase();
        
        // Check for ShipBob pattern
        if (titleLower.includes('<>') && titleLower.includes('shipbob')) {
          const company = call.title.split('<>')[0].trim();
          if (!titlePatterns['shipbob-pattern']) titlePatterns['shipbob-pattern'] = [];
          titlePatterns['shipbob-pattern'].push(company);
        }
        
        // Check for other patterns
        if (titleLower.includes('shipbob')) {
          if (!titlePatterns['contains-shipbob']) titlePatterns['contains-shipbob'] = [];
          titlePatterns['contains-shipbob'].push(call.title);
        }
      }
    });
    
    res.json({
      success: true,
      testResults: {
        totalCallsTested: enrichedCalls.length,
        merchantIdentificationRate: `${identifiedCount}/${identificationResults.length}`,
        identifiedMerchants: identificationResults.filter(r => r.merchantFound),
        unidentifiedCalls: identificationResults.filter(r => !r.merchantFound).slice(0, 10),
        titlePatterns,
        recommendations: [
          identifiedCount === 0 ? "❌ No merchants identified - check merchant mapping or call title patterns" : `✅ ${identifiedCount} merchants identified`,
          titlePatterns['shipbob-pattern']?.length > 0 ? `Found ${titlePatterns['shipbob-pattern'].length} calls with ShipBob <> pattern` : "No ShipBob <> pattern found",
          "Consider adding more merchant variations to MERCHANT_MAPPING"
        ]
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/debug-scan-pipeline', async (req, res) => {
  try {
    const { daysBack = 60, maxCalls = 20 } = req.body;
    
    console.log(`🔍 DEBUGGING SCAN PIPELINE for last ${daysBack} days (max ${maxCalls} calls)...`);
    
    const debugResult = {
      timestamp: new Date().toISOString(),
      parameters: { daysBack, maxCalls },
      pipeline: {},
      issues: [],
      recommendations: []
    };

    const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // STEP 1: Test basic call retrieval
    console.log('\n🔍 STEP 1: Testing call retrieval...');
    try {
      const response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
        headers: gongService.getAuthHeaders(),
        params: {
          fromDateTime: fromDate.toISOString(),
          toDateTime: new Date().toISOString(),
          pageSize: maxCalls
        }
      });

      const calls = response.data.calls || [];
      debugResult.pipeline.step1_callRetrieval = {
        status: 'SUCCESS',
        totalCallsInRange: response.data.records?.totalRecords || 0,
        callsRetrieved: calls.length,
        sampleCallIds: calls.slice(0, 3).map(c => c.id),
        sampleTitles: calls.slice(0, 3).map(c => c.title)
      };
      console.log(`✅ Retrieved ${calls.length} calls from Gong`);

      if (calls.length === 0) {
        debugResult.issues.push('No calls found in date range');
        return res.json(debugResult);
      }

      // STEP 2: Test merchant identification
      console.log('\n🔍 STEP 2: Testing merchant identification...');
      const enrichedCalls = await gongService.enrichCallsWithParties(calls.slice(0, 10));
      
      const merchantAnalysis = {
        totalCallsAnalyzed: enrichedCalls.length,
        merchantCallsFound: 0,
        identificationMethods: {},
        merchantDetails: [],
        failedIdentifications: []
      };

      for (const call of enrichedCalls) {
        const merchantInfo = findMerchantInfo(call.parties, call.title);
        if (merchantInfo) {
          merchantAnalysis.merchantCallsFound++;
          merchantAnalysis.merchantDetails.push({
            callId: call.id,
            merchant: merchantInfo.companyName,
            sm: merchantInfo.sm,
            method: merchantInfo.method
          });
          
          if (!merchantAnalysis.identificationMethods[merchantInfo.method]) {
            merchantAnalysis.identificationMethods[merchantInfo.method] = 0;
          }
          merchantAnalysis.identificationMethods[merchantInfo.method]++;
        } else {
          merchantAnalysis.failedIdentifications.push({
            callId: call.id,
            title: call.title,
            participants: call.parties?.length || 0,
            participantEmails: call.parties?.map(p => p.emailAddress).filter(Boolean) || []
          });
        }
      }

      debugResult.pipeline.step2_merchantIdentification = {
        status: merchantAnalysis.merchantCallsFound > 0 ? 'SUCCESS' : 'ISSUE',
        ...merchantAnalysis
      };

      console.log(`📊 Merchant identification: ${merchantAnalysis.merchantCallsFound}/${enrichedCalls.length} calls identified`);

      if (merchantAnalysis.merchantCallsFound === 0) {
        debugResult.issues.push('No merchant calls identified - check merchant mapping');
        debugResult.recommendations.push('Review merchant mapping in MERCHANT_MAPPING object');
        debugResult.recommendations.push('Check if call titles follow expected patterns');
        return res.json(debugResult);
      }

      // STEP 3: Test transcript availability
      console.log('\n🔍 STEP 3: Testing transcript availability...');
      const merchantCalls = enrichedCalls.filter(call => {
        const merchantInfo = findMerchantInfo(call.parties, call.title);
        return !!merchantInfo;
      });

      const transcriptAnalysis = {
        merchantCallsTested: Math.min(merchantCalls.length, 5),
        transcriptsAvailable: 0,
        transcriptFailures: [],
        transcriptDetails: [],
        avgTranscriptLength: 0,
        totalWords: 0
      };

      for (const call of merchantCalls.slice(0, 5)) {
        console.log(`📝 Testing transcript for call ${call.id}...`);
        try {
          const transcript = await gongService.getCallTranscript(call.id);
          if (transcript && transcript.entries && transcript.entries.length > 0) {
            transcriptAnalysis.transcriptsAvailable++;
            const wordCount = transcript.entries.reduce((sum, entry) => sum + entry.text.split(' ').length, 0);
            transcriptAnalysis.totalWords += wordCount;
            transcriptAnalysis.transcriptDetails.push({
              callId: call.id,
              entries: transcript.entries.length,
              words: wordCount,
              duration: transcript.entries.length > 0 ? 
                transcript.entries[transcript.entries.length - 1].end - transcript.entries[0].start : 0
            });
            console.log(`  ✅ Transcript found: ${transcript.entries.length} entries, ~${wordCount} words`);
          } else {
            transcriptAnalysis.transcriptFailures.push({
              callId: call.id,
              reason: 'No transcript entries found',
              hasTranscript: !!transcript
            });
            console.log(`  ❌ No transcript entries for call ${call.id}`);
          }
        } catch (error) {
          transcriptAnalysis.transcriptFailures.push({
            callId: call.id,
            reason: error.message,
            status: error.response?.status
          });
          console.log(`  ❌ Transcript error for call ${call.id}: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      transcriptAnalysis.avgTranscriptLength = transcriptAnalysis.transcriptsAvailable > 0 ? 
        Math.round(transcriptAnalysis.totalWords / transcriptAnalysis.transcriptsAvailable) : 0;

      debugResult.pipeline.step3_transcriptAvailability = {
        status: transcriptAnalysis.transcriptsAvailable > 0 ? 'SUCCESS' : 'CRITICAL_ISSUE',
        ...transcriptAnalysis
      };

      console.log(`📄 Transcript availability: ${transcriptAnalysis.transcriptsAvailable}/${transcriptAnalysis.merchantCallsTested} merchant calls have transcripts`);

      if (transcriptAnalysis.transcriptsAvailable === 0) {
        debugResult.issues.push('CRITICAL: No transcripts available for merchant calls');
        debugResult.recommendations.push('Check Gong transcript processing settings');
        debugResult.recommendations.push('Verify API permissions for transcript access');
        debugResult.recommendations.push('Try calls from different date ranges');
        return res.json(debugResult);
      }

      // STEP 4: Test keyword analysis in detail
      console.log('\n🔍 STEP 4: Testing keyword analysis...');
      const keywordAnalysis = {
        keywordsToTest: EXPANSION_KEYWORDS.length,
        transcriptsAnalyzed: 0,
        keywordMatches: {},
        scoreDistribution: {},
        detailedAnalyses: []
      };

      for (const call of merchantCalls.slice(0, 3)) { // Test top 3 merchant calls with transcripts
        try {
          const transcript = await gongService.getCallTranscript(call.id);
          if (!transcript) continue;

          keywordAnalysis.transcriptsAnalyzed++;
          console.log(`\n📊 Analyzing call ${call.id} for keywords...`);
          
          // Get the full transcript text
          const fullText = transcript.entries
            .map(entry => entry.text)
            .join(' ')
            .toLowerCase();

          console.log(`  📝 Transcript length: ${fullText.length} characters, ${fullText.split(' ').length} words`);
          console.log(`  📝 First 200 chars: "${fullText.substring(0, 200)}..."`);

          // Test keyword matching manually
          let foundKeywords = [];
          let keywordDetails = {};
          
          EXPANSION_KEYWORDS.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            if (fullText.includes(keywordLower)) {
              foundKeywords.push(keyword);
              
              // Count occurrences
              const regex = new RegExp(keywordLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
              const matches = (fullText.match(regex) || []).length;
              
              keywordDetails[keyword] = {
                occurrences: matches,
                positions: []
              };

              // Find positions for context
              let index = fullText.indexOf(keywordLower);
              let contextCount = 0;
              while (index !== -1 && contextCount < 3) {
                const start = Math.max(0, index - 50);
                const end = Math.min(fullText.length, index + keyword.length + 50);
                keywordDetails[keyword].positions.push({
                  position: index,
                  context: fullText.substring(start, end)
                });
                index = fullText.indexOf(keywordLower, index + 1);
                contextCount++;
              }

              if (!keywordAnalysis.keywordMatches[keyword]) {
                keywordAnalysis.keywordMatches[keyword] = 0;
              }
              keywordAnalysis.keywordMatches[keyword]++;
            }
          });

          console.log(`  🔍 Manual keyword search found: [${foundKeywords.join(', ')}]`);

          // Now test the actual analyzeTranscript method
          const analysis = gongService.analyzeTranscript(transcript);
          console.log(`  📊 analyzeTranscript() result:`);
          console.log(`      Score: ${analysis.score}`);
          console.log(`      Keywords found: [${analysis.detectedKeywords.join(', ')}]`);
          console.log(`      Method keywords: ${analysis.detectedKeywords.length}, Manual keywords: ${foundKeywords.length}`);

          // Compare results
          const manualVsMethod = {
            manualKeywords: foundKeywords,
            methodKeywords: analysis.detectedKeywords,
            manualCount: foundKeywords.length,
            methodCount: analysis.detectedKeywords.length,
            scoreAssigned: analysis.score,
            meetsThreshold: analysis.score >= 2.0 && analysis.detectedKeywords.length > 0
          };

          keywordAnalysis.detailedAnalyses.push({
            callId: call.id,
            transcriptLength: fullText.length,
            wordCount: fullText.split(' ').length,
            manualVsMethod,
            keywordDetails,
            sampleText: fullText.substring(0, 300)
          });

          // Track score distribution
          const scoreRange = Math.floor(analysis.score);
          if (!keywordAnalysis.scoreDistribution[scoreRange]) {
            keywordAnalysis.scoreDistribution[scoreRange] = 0;
          }
          keywordAnalysis.scoreDistribution[scoreRange]++;

          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          console.log(`  ❌ Error analyzing call ${call.id}: ${error.message}`);
        }
      }

      debugResult.pipeline.step4_keywordAnalysis = {
        status: Object.keys(keywordAnalysis.keywordMatches).length > 0 ? 'SUCCESS' : 'CRITICAL_ISSUE',
        ...keywordAnalysis
      };

      // STEP 5: Test SM presence detection
      console.log('\n🔍 STEP 5: Testing SM presence detection...');
      const smAnalysis = {
        callsTested: 0,
        smPresentCalls: 0,
        smAbsentCalls: 0,
        smDetails: []
      };

      for (const call of merchantCalls.slice(0, 3)) {
        const merchantInfo = findMerchantInfo(call.parties, call.title);
        if (merchantInfo) {
          smAnalysis.callsTested++;
          const smPresent = isSolutionManagerPresent(call.parties, merchantInfo);
          
          if (smPresent) {
            smAnalysis.smPresentCalls++;
          } else {
            smAnalysis.smAbsentCalls++;
          }

          smAnalysis.smDetails.push({
            callId: call.id,
            merchant: merchantInfo.companyName,
            assignedSM: merchantInfo.sm,
            smPresent,
            participants: call.parties?.map(p => p.name).filter(Boolean) || []
          });

          console.log(`  📞 Call ${call.id}: SM ${merchantInfo.sm} ${smPresent ? 'PRESENT' : 'ABSENT'}`);
        }
      }

      debugResult.pipeline.step5_smPresence = {
        status: 'SUCCESS',
        ...smAnalysis
      };

      // Final Analysis
      console.log('\n🔍 FINAL ANALYSIS...');
      const finalAnalysis = {
        pipelineSteps: Object.keys(debugResult.pipeline).length,
        criticalIssues: debugResult.issues.filter(i => i.includes('CRITICAL')).length,
        likelyReasons: []
      };

      if (transcriptAnalysis.transcriptsAvailable === 0) {
        finalAnalysis.likelyReasons.push('PRIMARY ISSUE: No transcripts available - this explains 0 opportunities');
      }
      
      if (Object.keys(keywordAnalysis.keywordMatches).length === 0) {
        finalAnalysis.likelyReasons.push('SECONDARY ISSUE: No keywords found in available transcripts');
      }
      
      if (keywordAnalysis.scoreDistribution['0'] > 0 || keywordAnalysis.scoreDistribution['1'] > 0) {
        finalAnalysis.likelyReasons.push('POTENTIAL ISSUE: Low scores - threshold might be too high');
      }
      
      if (smAnalysis.smPresentCalls > smAnalysis.smAbsentCalls) {
        finalAnalysis.likelyReasons.push('POTENTIAL ISSUE: Most calls have SM present - these are filtered out');
      }

      debugResult.finalAnalysis = finalAnalysis;

      // Generate specific recommendations
      if (transcriptAnalysis.transcriptsAvailable === 0) {
        debugResult.recommendations.push('🚨 CRITICAL: Fix transcript access first');
        debugResult.recommendations.push('Check if call recording/transcription is enabled in Gong');
        debugResult.recommendations.push('Verify API key has transcript read permissions');
        debugResult.recommendations.push('Try different date ranges or workspace settings');
      } else if (Object.keys(keywordAnalysis.keywordMatches).length === 0) {
        debugResult.recommendations.push('🚨 CRITICAL: No keywords found in transcripts');
        debugResult.recommendations.push('Review keyword list for relevance');
        debugResult.recommendations.push('Consider broader or different keyword matching');
        debugResult.recommendations.push('Check if transcripts contain expected business language');
      } else {
        debugResult.recommendations.push('✅ Pipeline appears functional');
        debugResult.recommendations.push('Consider lowering score threshold from 2.0 to 1.0');
        debugResult.recommendations.push('Review keyword scoring algorithm');
      }

      res.json({
        success: true,
        summary: `Tested ${maxCalls} calls over ${daysBack} days`,
        debugResult
      });

    } catch (error) {
      debugResult.pipeline.step1_callRetrieval = {
        status: 'FAILED',
        error: error.message
      };
      debugResult.issues.push('Failed to retrieve calls from Gong API');
      res.status(500).json({ success: false, error: error.message, debugResult });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Debug pipeline failed'
    });
  }
});

// Also add a simplified transcript testing endpoint
app.get('/api/test-single-transcript/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    console.log(`🧪 Testing single transcript for call ${callId}...`);

    // Get call details
    const callResponse = await axios.get(`${GONG_CONFIG.baseURL}/calls/${callId}`, {
      headers: gongService.getAuthHeaders()
    });
    const call = callResponse.data.calls?.[0] || callResponse.data;

    // Get transcript
    const transcript = await gongService.getCallTranscript(callId);
    
    if (!transcript) {
      return res.json({
        success: false,
        callId,
        message: 'No transcript available',
        callInfo: {
          id: call.id,
          title: call.title,
          started: call.started,
          duration: call.duration
        }
      });
    }

    // Get full text
    const fullText = transcript.entries
      .map(entry => entry.text)
      .join(' ')
      .toLowerCase();

    // Manual keyword search
    const foundKeywords = [];
    EXPANSION_KEYWORDS.forEach(keyword => {
      if (fullText.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
      }
    });

    // Method analysis
    const analysis = gongService.analyzeTranscript(transcript);

    res.json({
      success: true,
      callId,
      callInfo: {
        id: call.id,
        title: call.title,
        started: call.started,
        duration: call.duration
      },
      transcriptInfo: {
        entries: transcript.entries.length,
        totalCharacters: fullText.length,
        totalWords: fullText.split(' ').length,
        sampleText: fullText.substring(0, 500)
      },
      keywordTesting: {
        totalKeywordsToTest: EXPANSION_KEYWORDS.length,
        manualKeywordsFound: foundKeywords,
        methodKeywordsFound: analysis.detectedKeywords,
        manualCount: foundKeywords.length,
        methodCount: analysis.detectedKeywords.length,
        scoringResult: analysis.score,
        meetsThreshold: analysis.score >= 2.0 && analysis.detectedKeywords.length > 0
      },
      discrepancy: {
        foundDifferentKeywords: foundKeywords.length !== analysis.detectedKeywords.length,
        manualNotInMethod: foundKeywords.filter(k => !analysis.detectedKeywords.includes(k)),
        methodNotInManual: analysis.detectedKeywords.filter(k => !foundKeywords.includes(k))
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add endpoint to analyze transcript patterns across multiple calls
app.get('/api/analyze-transcript-patterns', async (req, res) => {
  try {
    const { daysBack = 30, maxCalls = 20 } = req.query;
    
    console.log(`🔍 Analyzing transcript patterns across ${maxCalls} recent calls...`);
    
    const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    
    // Get recent calls
    const response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
      headers: gongService.getAuthHeaders(),
      params: {
        fromDateTime: fromDate.toISOString(),
        toDateTime: new Date().toISOString(),
        pageSize: maxCalls
      }
    });
    
    const calls = response.data.calls || [];
    const callsWithParties = await gongService.enrichCallsWithParties(calls);
    
    // Analyze transcripts for calls with tracked merchants
    const transcriptAnalysis = {
      callsAnalyzed: 0,
      merchantCalls: 0,
      transcriptsAvailable: 0,
      keywordFrequency: {},
      expansionOpportunities: [],
      commonPhrases: [],
      patternSummary: {}
    };
    
    for (const call of callsWithParties.slice(0, maxCalls)) {
      transcriptAnalysis.callsAnalyzed++;
      
      const merchantInfo = findMerchantInfo(call.parties, call.title);
      if (merchantInfo) {
        transcriptAnalysis.merchantCalls++;
        
        // Get transcript
        const transcript = await gongService.getCallTranscript(call.id);
        if (transcript) {
          transcriptAnalysis.transcriptsAvailable++;
          
          // Analyze this transcript
          const analysis = gongService.analyzeTranscript(transcript);
          
          if (analysis.score >= 2.0) {
            transcriptAnalysis.expansionOpportunities.push({
              callId: call.id,
              merchant: merchantInfo.companyName,
              score: analysis.score,
              keywords: analysis.detectedKeywords,
              snippet: analysis.contextSnippets[0]?.snippet || analysis.fullText.substring(0, 200)
            });
          }
          
          // Track keyword frequency
          analysis.detectedKeywords.forEach(keyword => {
            if (!transcriptAnalysis.keywordFrequency[keyword]) {
              transcriptAnalysis.keywordFrequency[keyword] = 0;
            }
            transcriptAnalysis.keywordFrequency[keyword]++;
          });
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Sort keywords by frequency
    const sortedKeywords = Object.entries(transcriptAnalysis.keywordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    res.json({
      success: true,
      dateRange: {
        from: fromDate.toISOString(),
        to: new Date().toISOString(),
        days: daysBack
      },
      analysis: transcriptAnalysis,
      insights: {
        transcriptAvailabilityRate: `${transcriptAnalysis.transcriptsAvailable}/${transcriptAnalysis.merchantCalls} merchant calls`,
        expansionOpportunityRate: `${transcriptAnalysis.expansionOpportunities.length}/${transcriptAnalysis.transcriptsAvailable} transcripts`,
        topKeywords: sortedKeywords.slice(0, 10),
        recommendations: [
          transcriptAnalysis.transcriptsAvailable === 0 ? "❌ No transcripts available - check transcript processing in Gong" : 
          `✅ ${transcriptAnalysis.transcriptsAvailable} transcripts analyzed`,
          
          transcriptAnalysis.expansionOpportunities.length === 0 ? "No expansion opportunities detected in sample" :
          `🚩 ${transcriptAnalysis.expansionOpportunities.length} expansion opportunities found`,
          
          sortedKeywords.length > 0 ? `Most common expansion keywords: ${sortedKeywords.slice(0, 5).map(k => k[0]).join(', ')}` :
          "No expansion keywords detected in transcripts"
        ]
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/diagnose-issues', async (req, res) => {
  try {
    console.log('🔧 Starting comprehensive issue diagnosis...');
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      issues: [],
      solutions: [],
      tests: {}
    };

    // Test 1: Basic API connectivity
    try {
      const basicResponse = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
        headers: gongService.getAuthHeaders(),
        params: { pageSize: 5 }
      });
      
      diagnosis.tests.apiConnectivity = {
        status: 'SUCCESS',
        totalRecords: basicResponse.data.records?.totalRecords || 0,
        callsReturned: (basicResponse.data.records?.calls || basicResponse.data.calls || []).length,
        hasRecordsStructure: !!basicResponse.data.records,
        hasCallsStructure: !!basicResponse.data.calls
      };
      
    } catch (error) {
      diagnosis.tests.apiConnectivity = {
        status: 'FAILED',
        error: error.message
      };
      diagnosis.issues.push('Cannot connect to Gong API');
      diagnosis.solutions.push('Check API credentials and network connectivity');
    }

    // Test 2: Call structure and participant data
    try {
      const structureResponse = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
        headers: gongService.getAuthHeaders(),
        params: { 
          pageSize: 10,
          contentSelector: JSON.stringify({
            exposedFields: {
              parties: true,
              recording: true,
              title: true
            }
          })
        }
      });
      
      const calls = structureResponse.data.records?.calls || structureResponse.data.calls || [];
      const callsWithParties = calls.filter(call => call.parties && call.parties.length > 0);
      
      diagnosis.tests.participantData = {
        status: callsWithParties.length > 0 ? 'SUCCESS' : 'ISSUE',
        totalCalls: calls.length,
        callsWithParties: callsWithParties.length,
        sampleCallWithParties: callsWithParties[0] ? {
          id: callsWithParties[0].id,
          title: callsWithParties[0].title,
          participantCount: callsWithParties[0].parties.length,
          participants: callsWithParties[0].parties.map(p => ({
            name: p.name,
            email: p.emailAddress,
            isShipBob: p.emailAddress?.includes('@shipbob.com')
          }))
        } : null
      };
      
      if (callsWithParties.length === 0) {
        diagnosis.issues.push('No participant data available in calls');
        diagnosis.solutions.push('Check Gong permissions for participant data access');
        diagnosis.solutions.push('Try enriching calls with individual call detail requests');
      }
      
    } catch (error) {
      diagnosis.tests.participantData = {
        status: 'FAILED',
        error: error.message
      };
    }

    // Test 3: Transcript availability
    try {
      const recentResponse = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
        headers: gongService.getAuthHeaders(),
        params: { 
          pageSize: 5,
          fromDateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          toDateTime: new Date().toISOString()
        }
      });
      
      const recentCalls = recentResponse.data.records?.calls || recentResponse.data.calls || [];
      let transcriptsFound = 0;
      const transcriptTests = [];
      
      for (const call of recentCalls.slice(0, 3)) {
        try {
          const transcript = await gongService.getCallTranscript(call.id);
          if (transcript) {
            transcriptsFound++;
            transcriptTests.push({
              callId: call.id,
              callTitle: call.title,
              hasTranscript: true,
              entries: transcript.entries?.length || 0
            });
          } else {
            transcriptTests.push({
              callId: call.id,
              callTitle: call.title,
              hasTranscript: false
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          transcriptTests.push({
            callId: call.id,
            callTitle: call.title,
            hasTranscript: false,
            error: error.message
          });
        }
      }
      
      diagnosis.tests.transcriptAvailability = {
        status: transcriptsFound > 0 ? 'SUCCESS' : 'ISSUE',
        totalCallsTested: transcriptTests.length,
        transcriptsFound,
        transcriptTests
      };
      
      if (transcriptsFound === 0) {
        diagnosis.issues.push('No transcripts available for recent calls');
        diagnosis.solutions.push('Check if call transcription is enabled in Gong');
        diagnosis.solutions.push('Wait for transcript processing (may take time)');
        diagnosis.solutions.push('Check API permissions for transcript access');
      }
      
    } catch (error) {
      diagnosis.tests.transcriptAvailability = {
        status: 'FAILED',
        error: error.message
      };
    }

    // Compile recommendations
    if (diagnosis.issues.length === 0) {
      diagnosis.recommendations = [
        '✅ All systems appear functional',
        'Try running a scan with recent date range',
        'Monitor for expansion opportunities'
      ];
    } else {
      diagnosis.recommendations = [
        `Found ${diagnosis.issues.length} issue(s) that need attention:`,
        ...diagnosis.issues.map(issue => `• ${issue}`),
        '',
        'Suggested solutions:',
        ...diagnosis.solutions.map(solution => `• ${solution}`)
      ];
    }

    res.json({
      success: true,
      diagnosis,
      summary: {
        issuesFound: diagnosis.issues.length,
        criticalIssues: diagnosis.issues.filter(issue => 
          issue.includes('Cannot connect') || 
          issue.includes('No participant data') ||
          issue.includes('No transcripts')
        ),
        readyToScan: diagnosis.issues.length === 0
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      diagnosis: 'Failed to complete diagnosis'
    });
  }
});

// 6. NEW ENDPOINT: Add test scan endpoint
app.post('/api/test-scan', async (req, res) => {
  try {
    const { daysBack = 7, maxCalls = 20 } = req.body;
    
    console.log(`🧪 Testing scan functionality with last ${daysBack} days (max ${maxCalls} calls)...`);
    
    const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const scanResults = {
      dateRange: {
        from: fromDate.toISOString(),
        to: new Date().toISOString(),
        days: daysBack
      },
      steps: [],
      issues: [],
      opportunities: []
    };

    // Step 1: Fetch calls with corrected structure
    try {
      scanResults.steps.push({ step: 1, action: 'Fetching calls from Gong API', status: 'STARTED' });
      
      const response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
        headers: gongService.getAuthHeaders(),
        params: {
          pageSize: maxCalls,
          fromDateTime: fromDate.toISOString(),
          toDateTime: new Date().toISOString(),
          contentSelector: JSON.stringify({
            exposedFields: {
              parties: true,
              recording: true,
              title: true
            }
          })
        }
      });
      
      // Use corrected structure
      const calls = response.data.records?.calls || response.data.calls || [];
      
      scanResults.steps.push({ 
        step: 1, 
        action: 'Fetching calls from Gong API', 
        status: 'SUCCESS',
        data: {
          totalInRange: response.data.records?.totalRecords || 0,
          callsFetched: calls.length,
          structure: response.data.records?.calls ? 'records.calls' : 'calls'
        }
      });
      
      if (calls.length === 0) {
        scanResults.issues.push('No calls found in date range');
        return res.json({ success: false, ...scanResults });
      }

      // Step 2: Enrich with participant data
      scanResults.steps.push({ step: 2, action: 'Enriching calls with participant data', status: 'STARTED' });
      
      const enrichedCalls = await gongService.enrichCallsWithParties(calls);
      const callsWithParties = enrichedCalls.filter(c => c.parties && c.parties.length > 0);
      
      scanResults.steps.push({ 
        step: 2, 
        action: 'Enriching calls with participant data', 
        status: 'SUCCESS',
        data: {
          totalCalls: enrichedCalls.length,
          callsWithParties: callsWithParties.length,
          enrichmentRate: `${callsWithParties.length}/${enrichedCalls.length}`
        }
      });

      // Step 3: Identify merchant calls
      scanResults.steps.push({ step: 3, action: 'Identifying merchant calls', status: 'STARTED' });
      
      const merchantCalls = [];
      for (const call of enrichedCalls) {
        const merchantInfo = findMerchantInfo(call.parties, call.title);
        if (merchantInfo) {
          merchantCalls.push({ ...call, merchantInfo });
        }
      }
      
      scanResults.steps.push({ 
        step: 3, 
        action: 'Identifying merchant calls', 
        status: 'SUCCESS',
        data: {
          totalCalls: enrichedCalls.length,
          merchantCalls: merchantCalls.length,
          identificationRate: `${merchantCalls.length}/${enrichedCalls.length}`,
          identifiedMerchants: merchantCalls.map(c => ({
            callId: c.id,
            merchant: c.merchantInfo.companyName,
            sm: c.merchantInfo.sm,
            method: c.merchantInfo.method
          }))
        }
      });

      if (merchantCalls.length === 0) {
        scanResults.issues.push('No merchant calls identified');
        return res.json({ success: false, ...scanResults });
      }

      // Step 4: Check for SM presence and get transcripts
      scanResults.steps.push({ step: 4, action: 'Processing merchant calls for opportunities', status: 'STARTED' });
      
      let transcriptsProcessed = 0;
      let smPresentCount = 0;
      
      for (const call of merchantCalls.slice(0, 5)) { // Test first 5 merchant calls
        const merchantInfo = call.merchantInfo;
        
        // Check SM presence
        const smPresent = isSolutionManagerPresent(call.parties, merchantInfo);
        if (smPresent) {
          smPresentCount++;
          continue;
        }
        
        // Get transcript
        try {
          const transcript = await gongService.getCallTranscript(call.id);
          if (transcript) {
            transcriptsProcessed++;
            
            // Analyze transcript
            const analysis = gongService.analyzeTranscript(transcript);
            
            if (analysis.score >= 2.0 && analysis.detectedKeywords.length > 0) {
              scanResults.opportunities.push({
                callId: call.id,
                merchant: merchantInfo.companyName,
                sm: merchantInfo.sm,
                score: analysis.score,
                keywords: analysis.detectedKeywords,
                snippet: analysis.contextSnippets[0]?.snippet || analysis.fullText.substring(0, 200)
              });
            }
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.log(`Failed to process call ${call.id}: ${error.message}`);
        }
      }
      
      scanResults.steps.push({ 
        step: 4, 
        action: 'Processing merchant calls for opportunities', 
        status: 'SUCCESS',
        data: {
          merchantCallsProcessed: Math.min(merchantCalls.length, 5),
          smPresentSkipped: smPresentCount,
          transcriptsProcessed,
          opportunitiesFound: scanResults.opportunities.length
        }
      });

      // Summary
      const summary = {
        success: true,
        totalSteps: 4,
        completedSteps: scanResults.steps.filter(s => s.status === 'SUCCESS').length,
        issues: scanResults.issues,
        opportunitiesFound: scanResults.opportunities.length,
        recommendations: []
      };

      if (callsWithParties.length === 0) {
        summary.recommendations.push('❌ No participant data - check Gong permissions or API configuration');
      }
      
      if (merchantCalls.length === 0) {
        summary.recommendations.push('❌ No merchants identified - check merchant mapping or call title patterns');
      }
      
      if (transcriptsProcessed === 0) {
        summary.recommendations.push('❌ No transcripts available - check transcript processing in Gong');
      }
      
      if (scanResults.opportunities.length === 0 && transcriptsProcessed > 0) {
        summary.recommendations.push('⚠️ No expansion opportunities detected - try broader keyword matching or different date range');
      }
      
      if (scanResults.opportunities.length > 0) {
        summary.recommendations.push(`✅ Found ${scanResults.opportunities.length} expansion opportunities!`);
      }

      res.json({
        ...summary,
        scanResults
      });
      
    } catch (error) {
      scanResults.steps.push({ 
        step: 1, 
        action: 'Fetching calls from Gong API', 
        status: 'FAILED',
        error: error.message
      });
      
      res.status(500).json({
        success: false,
        error: error.message,
        scanResults
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/debug-scan-get', async (req, res) => {
  try {
    const { daysBack = 60, maxCalls = 20 } = req.query;
    
    // Just call the same logic as the POST endpoint
    req.body = { 
      daysBack: parseInt(daysBack), 
      maxCalls: parseInt(maxCalls) 
    };
    
    // Reuse the POST logic but make it accessible via GET
    const debugResult = await runDebugPipeline(parseInt(daysBack), parseInt(maxCalls));
    
    res.json(debugResult);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Extract the debug logic into a reusable function
async function runDebugPipeline(daysBack = 60, maxCalls = 20) {
  console.log(`🔍 DEBUGGING SCAN PIPELINE for last ${daysBack} days (max ${maxCalls} calls)...`);
  
  const debugResult = {
    timestamp: new Date().toISOString(),
    parameters: { daysBack, maxCalls },
    pipeline: {},
    issues: [],
    recommendations: []
  };

  const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  try {
    // STEP 1: Test basic call retrieval
    console.log('\n🔍 STEP 1: Testing call retrieval...');
    const response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
      headers: gongService.getAuthHeaders(),
      params: {
        fromDateTime: fromDate.toISOString(),
        toDateTime: new Date().toISOString(),
        pageSize: maxCalls
      }
    });

    const calls = response.data.calls || [];
    debugResult.pipeline.step1_callRetrieval = {
      status: 'SUCCESS',
      totalCallsInRange: response.data.records?.totalRecords || 0,
      callsRetrieved: calls.length,
      sampleCallIds: calls.slice(0, 3).map(c => c.id),
      sampleTitles: calls.slice(0, 3).map(c => c.title)
    };
    console.log(`✅ Retrieved ${calls.length} calls from Gong`);

    if (calls.length === 0) {
      debugResult.issues.push('No calls found in date range');
      return debugResult;
    }

    // STEP 2: Test merchant identification
    console.log('\n🔍 STEP 2: Testing merchant identification...');
    const enrichedCalls = await gongService.enrichCallsWithParties(calls.slice(0, 10));
    
    const merchantAnalysis = {
      totalCallsAnalyzed: enrichedCalls.length,
      merchantCallsFound: 0,
      identificationMethods: {},
      merchantDetails: [],
      failedIdentifications: []
    };

    for (const call of enrichedCalls) {
      const merchantInfo = findMerchantInfo(call.parties, call.title);
      if (merchantInfo) {
        merchantAnalysis.merchantCallsFound++;
        merchantAnalysis.merchantDetails.push({
          callId: call.id,
          merchant: merchantInfo.companyName,
          sm: merchantInfo.sm,
          method: merchantInfo.method
        });
        
        if (!merchantAnalysis.identificationMethods[merchantInfo.method]) {
          merchantAnalysis.identificationMethods[merchantInfo.method] = 0;
        }
        merchantAnalysis.identificationMethods[merchantInfo.method]++;
      } else {
        merchantAnalysis.failedIdentifications.push({
          callId: call.id,
          title: call.title,
          participants: call.parties?.length || 0,
          participantEmails: call.parties?.map(p => p.emailAddress).filter(Boolean) || []
        });
      }
    }

    debugResult.pipeline.step2_merchantIdentification = {
      status: merchantAnalysis.merchantCallsFound > 0 ? 'SUCCESS' : 'ISSUE',
      ...merchantAnalysis
    };

    console.log(`📊 Merchant identification: ${merchantAnalysis.merchantCallsFound}/${enrichedCalls.length} calls identified`);

    if (merchantAnalysis.merchantCallsFound === 0) {
      debugResult.issues.push('No merchant calls identified - check merchant mapping');
      return debugResult;
    }

    // STEP 3: Test transcript availability (this is likely where the issue is)
    console.log('\n🔍 STEP 3: Testing transcript availability...');
    const merchantCalls = enrichedCalls.filter(call => {
      const merchantInfo = findMerchantInfo(call.parties, call.title);
      return !!merchantInfo;
    });

    const transcriptAnalysis = {
      merchantCallsTested: Math.min(merchantCalls.length, 3),
      transcriptsAvailable: 0,
      transcriptFailures: [],
      transcriptDetails: []
    };

    for (const call of merchantCalls.slice(0, 3)) {
      console.log(`📝 Testing transcript for call ${call.id}...`);
      try {
        const transcript = await gongService.getCallTranscript(call.id);
        if (transcript && transcript.entries && transcript.entries.length > 0) {
          transcriptAnalysis.transcriptsAvailable++;
          const wordCount = transcript.entries.reduce((sum, entry) => sum + entry.text.split(' ').length, 0);
          transcriptAnalysis.transcriptDetails.push({
            callId: call.id,
            entries: transcript.entries.length,
            words: wordCount,
            sampleText: transcript.entries.slice(0, 3).map(e => e.text).join(' ').substring(0, 200)
          });
          console.log(`  ✅ Transcript found: ${transcript.entries.length} entries, ~${wordCount} words`);
        } else {
          transcriptAnalysis.transcriptFailures.push({
            callId: call.id,
            reason: 'No transcript entries found',
            hasTranscript: !!transcript
          });
          console.log(`  ❌ No transcript entries for call ${call.id}`);
        }
      } catch (error) {
        transcriptAnalysis.transcriptFailures.push({
          callId: call.id,
          reason: error.message,
          status: error.response?.status
        });
        console.log(`  ❌ Transcript error for call ${call.id}: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    debugResult.pipeline.step3_transcriptAvailability = {
      status: transcriptAnalysis.transcriptsAvailable > 0 ? 'SUCCESS' : 'CRITICAL_ISSUE',
      ...transcriptAnalysis
    };

    console.log(`📄 Transcript availability: ${transcriptAnalysis.transcriptsAvailable}/${transcriptAnalysis.merchantCallsTested} merchant calls have transcripts`);

    return debugResult;

  } catch (error) {
    debugResult.pipeline.error = {
      status: 'FAILED',
      error: error.message,
      step: 'Initial call retrieval'
    };
    debugResult.issues.push('Failed to retrieve calls from Gong API');
    return debugResult;
  }
}

app.get('/api/test-transcript-availability', async (req, res) => {
  try {
    console.log('🔍 Testing transcript availability across different date ranges...');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      dateRangeTests: [],
      transcriptSamples: [],
      recommendations: []
    };

    // Test different date ranges (older calls more likely to have transcripts)
    const dateRangesToTest = [
      { days: 30, label: 'Last 30 days' },
      { days: 60, label: 'Last 60 days' },
      { days: 90, label: 'Last 90 days' },
      { days: 180, label: 'Last 180 days' },
      { days: 365, label: 'Last 365 days' }
    ];

    for (const range of dateRangesToTest) {
      console.log(`\n📅 Testing ${range.label}...`);
      
      try {
        const fromDate = new Date(Date.now() - range.days * 24 * 60 * 60 * 1000);
        
        const response = await axios.get(`${GONG_CONFIG.baseURL}/calls`, {
          headers: gongService.getAuthHeaders(),
          params: {
            fromDateTime: fromDate.toISOString(),
            toDateTime: new Date().toISOString(),
            pageSize: 5 // Small sample for testing
          }
        });

        const calls = response.data.calls || [];
        let transcriptsFound = 0;
        const callTests = [];

        for (const call of calls.slice(0, 3)) { // Test first 3 calls from each range
          try {
            console.log(`  📝 Testing call ${call.id} from ${call.started}...`);
            
            const transcript = await gongService.getCallTranscript(call.id);
            const hasTranscript = !!(transcript && transcript.entries && transcript.entries.length > 0);
            
            if (hasTranscript) {
              transcriptsFound++;
              
              // If we found a transcript, let's test keyword analysis on it
              const fullText = transcript.entries.map(entry => entry.text).join(' ').toLowerCase();
              const foundKeywords = [];
              
              // Test a few key expansion keywords
              const testKeywords = ['expansion', 'international', 'global', 'scaling', 'enterprise', 'upgrade', 'additional'];
              testKeywords.forEach(keyword => {
                if (fullText.includes(keyword)) {
                  foundKeywords.push(keyword);
                }
              });

              testResults.transcriptSamples.push({
                callId: call.id,
                callDate: call.started,
                callTitle: call.title,
                transcriptLength: fullText.length,
                wordCount: fullText.split(' ').length,
                foundKeywords: foundKeywords,
                sampleText: fullText.substring(0, 300) + '...'
              });
              
              console.log(`    ✅ Transcript found! ${transcript.entries.length} entries, keywords: [${foundKeywords.join(', ')}]`);
            }

            callTests.push({
              callId: call.id,
              callDate: call.started,
              callTitle: call.title,
              hasTranscript
            });

            await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting

          } catch (error) {
            console.log(`    ❌ Error getting transcript for ${call.id}: ${error.message}`);
            callTests.push({
              callId: call.id,
              callDate: call.started,
              callTitle: call.title,
              hasTranscript: false,
              error: error.message
            });
          }
        }

        testResults.dateRangeTests.push({
          range: range.label,
          days: range.days,
          totalCallsInRange: response.data.records?.totalRecords || 0,
          callsTested: callTests.length,
          transcriptsFound,
          transcriptAvailabilityRate: `${transcriptsFound}/${callTests.length}`,
          callDetails: callTests
        });

        console.log(`  📊 ${range.label}: ${transcriptsFound}/${callTests.length} transcripts available`);

        // If we found transcripts in this range, we can stop testing older ranges
        if (transcriptsFound > 0) {
          console.log(`  ✅ Found working transcripts in ${range.label} range!`);
          break;
        }

      } catch (error) {
        console.log(`  ❌ Error testing ${range.label}: ${error.message}`);
        testResults.dateRangeTests.push({
          range: range.label,
          days: range.days,
          error: error.message
        });
      }
    }

    // Generate recommendations
    const totalTranscriptsFound = testResults.dateRangeTests.reduce((sum, test) => 
      sum + (test.transcriptsFound || 0), 0
    );

    if (totalTranscriptsFound === 0) {
      testResults.recommendations = [
        '🚨 CRITICAL: No transcripts found in any date range',
        '1. Check if call recording/transcription is enabled in your Gong workspace',
        '2. Verify your API key has transcript read permissions',
        '3. Contact Gong support to confirm transcript processing status',
        '4. Try accessing transcripts through Gong UI to confirm they exist'
      ];
    } else {
      const workingRange = testResults.dateRangeTests.find(test => test.transcriptsFound > 0);
      testResults.recommendations = [
        `✅ Found ${totalTranscriptsFound} transcripts in older date ranges`,
        `🎯 Transcripts available starting from: ${workingRange.range}`,
        `💡 Suggestion: Scan calls from ${workingRange.days}+ days ago for expansion opportunities`,
        '⚠️ Recent calls may not have transcripts processed yet - try older date ranges'
      ];
    }

    res.json({
      success: true,
      summary: `Tested transcript availability across ${dateRangesToTest.length} date ranges`,
      totalTranscriptsFound,
      testResults
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Also add a quick fix to test specific call IDs that are known to have transcripts
app.get('/api/test-known-calls', async (req, res) => {
  try {
    console.log('🔍 Testing specific call IDs for transcript availability...');
    
    // Get some call IDs from your recent results
    const callIdsToTest = [
      "6333286873110222053", // Call with Brianna Amoroso
      "1165172714901064574", // Call with David David
      "4042318483589051861", // ShipBob/Berne SOW Review
      "1042548940585944376", // TENGA - US <> ShipBob
      "1593467797093975523"  // Fresh Beauty Studio call
    ];

    const testResults = [];

    for (const callId of callIdsToTest) {
      try {
        console.log(`📝 Testing transcript for call ${callId}...`);
        
        // Get call details first
        const callResponse = await axios.get(`${GONG_CONFIG.baseURL}/calls/${callId}`, {
          headers: gongService.getAuthHeaders()
        });
        
        const call = callResponse.data.calls?.[0] || callResponse.data;
        
        // Try to get transcript
        const transcript = await gongService.getCallTranscript(callId);
        
        testResults.push({
          callId,
          callTitle: call.title,
          callDate: call.started,
          duration: call.duration,
          hasTranscript: !!(transcript && transcript.entries && transcript.entries.length > 0),
          transcriptEntries: transcript?.entries?.length || 0,
          transcriptSample: transcript?.entries?.slice(0, 2).map(e => e.text).join(' ').substring(0, 200) || null
        });
        
        console.log(`  ${transcript ? '✅' : '❌'} Call ${callId}: ${transcript ? 'Has transcript' : 'No transcript'}`);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        testResults.push({
          callId,
          hasTranscript: false,
          error: error.message
        });
        console.log(`  ❌ Error testing call ${callId}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      callsTested: callIdsToTest.length,
      transcriptsFound: testResults.filter(r => r.hasTranscript).length,
      testResults
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});