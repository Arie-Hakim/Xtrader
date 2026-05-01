import type { Analyst, AnalystDNA, Insight, StockFitResult } from "@/types";

export interface MockQuote {
  id: string;
  analyst_id: string;
  content: string;
  tweet_url: string;
  date: string;
}

export interface AnalystProfileData {
  analyst: Analyst;
  dna: AnalystDNA;
  insights: Insight[];
  quotes: MockQuote[];
}

// ─── Analysts ────────────────────────────────────────────────────────────────

const MOCK_ANALYSTS: Analyst[] = [
  {
    id: "a1",
    username: "StockWhisperer_IL",
    display_name: "מאיר כהן",
    avatar_url: null,
    analyst_type: "trader-swing",
    analyst_weight: 0.82,
    tweets_learned_count: 847,
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "a2",
    username: "PositionKing_Trade",
    display_name: "דני אברהם",
    avatar_url: null,
    analyst_type: "trader-position",
    analyst_weight: 0.75,
    tweets_learned_count: 623,
    created_at: "2026-01-20T00:00:00Z",
  },
  {
    id: "a3",
    username: "ValueHunter_TLV",
    display_name: "שרה גולדברג",
    avatar_url: null,
    analyst_type: "investor-value",
    analyst_weight: 0.91,
    tweets_learned_count: 1024,
    created_at: "2025-12-10T00:00:00Z",
  },
  {
    id: "a4",
    username: "GrowthMindset_IL",
    display_name: "יונתן לוי",
    avatar_url: null,
    analyst_type: "investor-growth",
    analyst_weight: 0.68,
    tweets_learned_count: 512,
    created_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "a5",
    username: "MacroView_Global",
    display_name: "רחל אדלר",
    avatar_url: null,
    analyst_type: "macro",
    analyst_weight: 0.87,
    tweets_learned_count: 934,
    created_at: "2025-11-05T00:00:00Z",
  },
  {
    id: "a6",
    username: "AlphaSeeker_IL",
    display_name: "אלון ברק",
    avatar_url: null,
    analyst_type: "mixed",
    analyst_weight: 0.73,
    tweets_learned_count: 761,
    created_at: "2026-01-08T00:00:00Z",
  },
];

// ─── DNA ─────────────────────────────────────────────────────────────────────

const MOCK_DNA: AnalystDNA[] = [
  {
    id: "dna1",
    analyst_id: "a1",
    version: 3,
    profile_type: "trader-swing",
    tweets_analyzed_count: 847,
    created_at: "2026-04-01T00:00:00Z",
    profile_data: {
      core_style:
        "טריידר סווינג טכני – מחפש פריצות ממבנה קונסולידציה עם עלייה בנפח",
      preferred_indicators: ["RSI", "MACD", "נפח", "Bollinger Bands", "EMA 21"],
      typical_horizon: "1–4 שבועות",
      risk_management:
        "Stop loss של 5–8% מתחת לנקודת הכניסה. יחס סיכוי/סיכון מינימום 1:2",
      regime_performance: {
        BULL_STRONG: 0.88,
        BULL_WEAK: 0.71,
        CHOP: 0.35,
        BEAR_WEAK: 0.28,
        BEAR_STRONG: 0.15,
      },
      top_tickers: ["NVDA", "TSLA", "META", "AMZN", "AMD"],
      avg_strength: 7.4,
      avg_confidence: 6.8,
      summary_he:
        "מאיר מחפש מניות שפרצו ממבנה טכני ברור עם עלייה בנפח. הוא מעדיף שווקים שוריים ונמנע ממסחר בשוק דובי. יחס סיכוי-סיכון קפדני של לפחות 1:2 בכל עסקה.",
    },
  },
  {
    id: "dna2",
    analyst_id: "a2",
    version: 2,
    profile_type: "trader-position",
    tweets_analyzed_count: 623,
    created_at: "2026-04-05T00:00:00Z",
    profile_data: {
      core_style:
        "טריידר פוזישן – פועל לפי Stage Analysis של ויינשטיין, ממתין לאישור שלב 2",
      preferred_indicators: [
        "Stage Analysis",
        "EMA 30 שבועי",
        "RS Line",
        "נפח שבועי",
      ],
      typical_horizon: "2–6 חודשים",
      risk_management:
        "Stop בסיסי מתחת לתמיכה של Stage 1. לא מוסיף לפוזיציה מפסידה",
      regime_performance: {
        BULL_STRONG: 0.92,
        BULL_WEAK: 0.78,
        CHOP: 0.52,
        BEAR_WEAK: 0.31,
        BEAR_STRONG: 0.18,
      },
      top_tickers: ["AAPL", "MSFT", "GOOGL", "NVDA", "CRWD"],
      avg_strength: 7.1,
      avg_confidence: 7.3,
      summary_he:
        "דני פועל לפי מתודולוגיית Stage Analysis של מארק ויינשטיין. ממתין לאישור כניסה לשלב 2 לפני כל עסקה. זמן האחזקה הטיפוסי הוא 2–6 חודשים עם סבלנות גבוהה.",
    },
  },
  {
    id: "dna3",
    analyst_id: "a3",
    version: 4,
    profile_type: "investor-value",
    tweets_analyzed_count: 1024,
    created_at: "2026-04-10T00:00:00Z",
    profile_data: {
      core_style:
        "משקיע ערך קלאסי – מחפש חברות איכותיות הנסחרות מתחת לשווי הפנימי שלהן",
      preferred_indicators: [
        "P/E",
        "P/B",
        "DCF",
        "Free Cash Flow",
        "Debt/Equity",
      ],
      typical_horizon: "1–3 שנים",
      risk_management:
        "מרווח ביטחון (Margin of Safety) של 30% מינימום. גיוון בין 10–15 מניות",
      regime_performance: {
        BULL_STRONG: 0.72,
        BULL_WEAK: 0.81,
        CHOP: 0.68,
        BEAR_WEAK: 0.74,
        BEAR_STRONG: 0.65,
      },
      top_tickers: ["BRK.B", "JNJ", "BAC", "WMT", "KO"],
      avg_strength: 6.5,
      avg_confidence: 8.1,
      summary_he:
        "שרה מחפשת חברות איכותיות הנסחרות בהנחה משמעותית לערכן האמיתי. היא מחזיקה לטווח ארוך ומתעלמת מרעש שוק קצר-טווח. ביצועים יציבים גם בשווקי דובי.",
    },
  },
  {
    id: "dna4",
    analyst_id: "a4",
    version: 2,
    profile_type: "investor-growth",
    tweets_analyzed_count: 512,
    created_at: "2026-04-08T00:00:00Z",
    profile_data: {
      core_style:
        "משקיע צמיחה – מתמקד בחברות SaaS עם צמיחת הכנסות מעל 30% ו-NRR גבוה",
      preferred_indicators: [
        "ARR Growth",
        "NRR",
        "CAC/LTV",
        "Gross Margin",
        "Rule of 40",
      ],
      typical_horizon: "1–2 שנים",
      risk_management: "מגביל חשיפה ל-5% לפוזיציה. ממוצע עלות בכניסה הדרגתית",
      regime_performance: {
        BULL_STRONG: 0.91,
        BULL_WEAK: 0.63,
        CHOP: 0.41,
        BEAR_WEAK: 0.22,
        BEAR_STRONG: 0.12,
      },
      top_tickers: ["SNOW", "DDOG", "NET", "CRWD", "ZS"],
      avg_strength: 7.8,
      avg_confidence: 6.3,
      summary_he:
        "יונתן מתמחה בחברות SaaS עם מדדי צמיחה יוצאי דופן. מחפש NRR מעל 120% ו-Gross Margin מעל 70%. חשוף מאוד לשוק שורי וחלש בירידות.",
    },
  },
  {
    id: "dna5",
    analyst_id: "a5",
    version: 3,
    profile_type: "macro",
    tweets_analyzed_count: 934,
    created_at: "2026-04-12T00:00:00Z",
    profile_data: {
      core_style:
        "מנתח מאקרו – עוקב אחר ריביות, אינפלציה ודולר לזיהוי רוטציה סקטוריאלית",
      preferred_indicators: ["DXY", "US10Y", "VIX", "CPI", "PMI"],
      typical_horizon: "3–12 חודשים",
      risk_management:
        "גישה מאקרו-ראשית: מגדר עם אופציות, מפזר בין סקטורים וגיאוגרפיות",
      regime_performance: {
        BULL_STRONG: 0.69,
        BULL_WEAK: 0.83,
        CHOP: 0.72,
        BEAR_WEAK: 0.85,
        BEAR_STRONG: 0.79,
      },
      top_tickers: ["GLD", "TLT", "XLE", "UUP", "SPY"],
      avg_strength: 6.9,
      avg_confidence: 7.5,
      summary_he:
        "רחל מנתחת את התמונה המאקרו-כלכלית הגלובלית ומתרגמת אותה לרוטציה סקטוריאלית. אחת הספורות שמצליחות לייצר ביצועים גם בשוקי דובי.",
    },
  },
  {
    id: "dna6",
    analyst_id: "a6",
    version: 2,
    profile_type: "mixed",
    tweets_analyzed_count: 761,
    created_at: "2026-04-03T00:00:00Z",
    profile_data: {
      core_style:
        "גישה משולבת – מחבר ניתוח טכני עם קטליסטים פונדמנטליים לתמונה מלאה",
      preferred_indicators: [
        "EPS Surprise",
        "RS Line",
        "EMA 50",
        "Earnings Revision",
        "RSI",
      ],
      typical_horizon: "1–6 חודשים",
      risk_management:
        "משלב ניהול סיכון טכני (stop loss) עם הגנה פונדמנטלית (thesis check)",
      regime_performance: {
        BULL_STRONG: 0.84,
        BULL_WEAK: 0.76,
        CHOP: 0.61,
        BEAR_WEAK: 0.47,
        BEAR_STRONG: 0.31,
      },
      top_tickers: ["NVDA", "AAPL", "MSFT", "AMZN", "META"],
      avg_strength: 7.2,
      avg_confidence: 7.0,
      summary_he:
        "אלון משלב בין ניתוח טכני לניתוח פונדמנטלי. מחפש קטליסטים עסקיים שמגובים בתמונה טכנית חיובית. גמיש בין סגנונות ומתאים את הגישה לתנאי השוק.",
    },
  },
];

// ─── Insights ─────────────────────────────────────────────────────────────────

const MOCK_INSIGHTS_BY_ANALYST: Record<string, Insight[]> = {
  a1: [
    {
      id: "i1a1",
      analyst_id: "a1",
      ticker: "NVDA",
      analyst_type: "trader-swing",
      direction: "bullish",
      strength: 8,
      confidence: 7,
      horizon: "swing",
      reasoning:
        "פריצה מעל התנגדות $850 עם נפח גבוה. MACD חוצה כלפי מעלה. יעד $920.",
      key_levels: { entry: 855, stop: 820, target: 920 },
      velocity: { delta: 2, post_frequency: 4 },
      decay: { half_life_days: 7 },
      regime_fit: {
        BULL_STRONG: 0.92,
        BULL_WEAK: 0.71,
        CHOP: 0.28,
        BEAR_WEAK: 0.12,
        BEAR_STRONG: 0.05,
      },
      raw_data: {
        tweet_url: "https://x.com/StockWhisperer_IL/status/1781234567890",
      },
      created_at: "2026-04-22T08:30:00Z",
    },
    {
      id: "i2a1",
      analyst_id: "a1",
      ticker: "META",
      analyst_type: "trader-swing",
      direction: "bullish",
      strength: 7,
      confidence: 8,
      horizon: "swing",
      reasoning: "חזרה מהממוצע הנע 21 עם דוחות חזקים. RSI 55 עם מקום לעלות.",
      key_levels: { entry: 510, stop: 490, target: 560 },
      velocity: { delta: 1, post_frequency: 2 },
      decay: { half_life_days: 7 },
      regime_fit: {
        BULL_STRONG: 0.85,
        BULL_WEAK: 0.65,
        CHOP: 0.3,
        BEAR_WEAK: 0.1,
        BEAR_STRONG: 0.05,
      },
      raw_data: {
        tweet_url: "https://x.com/StockWhisperer_IL/status/1781334567890",
      },
      created_at: "2026-04-20T10:15:00Z",
    },
    {
      id: "i3a1",
      analyst_id: "a1",
      ticker: "TSLA",
      analyst_type: "trader-swing",
      direction: "bearish",
      strength: 6,
      confidence: 6,
      horizon: "swing",
      reasoning:
        "שבירת תמיכה $165 עם נפח עולה. נראה כמו כניסה לשלב 4. יש להימנע.",
      key_levels: { entry: 162, stop: 172, target: 140 },
      velocity: { delta: -1, post_frequency: 3 },
      decay: { half_life_days: 5 },
      regime_fit: {
        BULL_STRONG: 0.3,
        BULL_WEAK: 0.55,
        CHOP: 0.6,
        BEAR_WEAK: 0.75,
        BEAR_STRONG: 0.8,
      },
      raw_data: {
        tweet_url: "https://x.com/StockWhisperer_IL/status/1780934567890",
      },
      created_at: "2026-04-18T14:00:00Z",
    },
  ],
  a2: [
    {
      id: "i1a2",
      analyst_id: "a2",
      ticker: "AAPL",
      analyst_type: "trader-position",
      direction: "bullish",
      strength: 7,
      confidence: 8,
      horizon: "long_term",
      reasoning:
        "AAPL נכנסת לשלב 2 לפי Stage Analysis. RS Line עולה, נפח שבועי גדל. מתאים לפוזיציה.",
      key_levels: { entry: 188, stop: 175, target: 225 },
      velocity: { delta: 1, post_frequency: 2 },
      decay: { half_life_days: 21 },
      regime_fit: {
        BULL_STRONG: 0.9,
        BULL_WEAK: 0.8,
        CHOP: 0.55,
        BEAR_WEAK: 0.25,
        BEAR_STRONG: 0.12,
      },
      raw_data: {
        tweet_url: "https://x.com/PositionKing_Trade/status/1781134567890",
      },
      created_at: "2026-04-21T09:00:00Z",
    },
    {
      id: "i2a2",
      analyst_id: "a2",
      ticker: "MSFT",
      analyst_type: "trader-position",
      direction: "bullish",
      strength: 8,
      confidence: 9,
      horizon: "long_term",
      reasoning:
        "MSFT בשלב 2 זה חצי שנה. AI tailwind חזק. EMA 30 שבועי תומך. מחזיק.",
      velocity: { delta: 0, post_frequency: 1 },
      decay: { half_life_days: 30 },
      regime_fit: {
        BULL_STRONG: 0.88,
        BULL_WEAK: 0.78,
        CHOP: 0.6,
        BEAR_WEAK: 0.35,
        BEAR_STRONG: 0.2,
      },
      raw_data: {
        tweet_url: "https://x.com/PositionKing_Trade/status/1780834567890",
      },
      created_at: "2026-04-19T11:30:00Z",
    },
    {
      id: "i3a2",
      analyst_id: "a2",
      ticker: "CRWD",
      analyst_type: "trader-position",
      direction: "bullish",
      strength: 9,
      confidence: 7,
      horizon: "long_term",
      reasoning:
        "פריצה נקייה לשיא חדש עם RS Line בשיא. ביטחון מייבר זה מגמה. כניסה לפוזיציה.",
      key_levels: { entry: 385, stop: 360, target: 460 },
      velocity: { delta: 3, post_frequency: 3 },
      decay: { half_life_days: 21 },
      regime_fit: {
        BULL_STRONG: 0.95,
        BULL_WEAK: 0.75,
        CHOP: 0.4,
        BEAR_WEAK: 0.2,
        BEAR_STRONG: 0.1,
      },
      raw_data: {
        tweet_url: "https://x.com/PositionKing_Trade/status/1780634567890",
      },
      created_at: "2026-04-17T15:45:00Z",
    },
  ],
  a3: [
    {
      id: "i1a3",
      analyst_id: "a3",
      ticker: "BRK.B",
      analyst_type: "investor-value",
      direction: "bullish",
      strength: 7,
      confidence: 9,
      horizon: "long_term",
      reasoning:
        "BRK.B נסחרת ב-10% הנחה לשווי פנימי משוערך. P/B של 1.4 אטרקטיבי היסטורית.",
      velocity: { delta: 0, post_frequency: 1 },
      decay: { half_life_days: 60 },
      regime_fit: {
        BULL_STRONG: 0.7,
        BULL_WEAK: 0.82,
        CHOP: 0.75,
        BEAR_WEAK: 0.8,
        BEAR_STRONG: 0.72,
      },
      raw_data: {
        tweet_url: "https://x.com/ValueHunter_TLV/status/1781034567890",
      },
      created_at: "2026-04-20T08:00:00Z",
    },
    {
      id: "i2a3",
      analyst_id: "a3",
      ticker: "JNJ",
      analyst_type: "investor-value",
      direction: "bullish",
      strength: 6,
      confidence: 8,
      horizon: "long_term",
      reasoning:
        "JNJ לאחר הפרדת Kenvue. FCF חזק, דיבידנד גדל 60 שנה ברציפות. תשואה נוכחית 3.2%.",
      velocity: { delta: 0, post_frequency: 1 },
      decay: { half_life_days: 90 },
      regime_fit: {
        BULL_STRONG: 0.65,
        BULL_WEAK: 0.8,
        CHOP: 0.78,
        BEAR_WEAK: 0.85,
        BEAR_STRONG: 0.8,
      },
      raw_data: {
        tweet_url: "https://x.com/ValueHunter_TLV/status/1780734567890",
      },
      created_at: "2026-04-15T10:00:00Z",
    },
    {
      id: "i3a3",
      analyst_id: "a3",
      ticker: "BAC",
      analyst_type: "investor-value",
      direction: "neutral",
      strength: 5,
      confidence: 7,
      horizon: "long_term",
      reasoning:
        "BAC זולה לפי P/B אך חשופה לריבית. ממתינה לבהירות פד לפני הגדלת פוזיציה.",
      velocity: { delta: -1, post_frequency: 1 },
      decay: { half_life_days: 60 },
      regime_fit: {
        BULL_STRONG: 0.6,
        BULL_WEAK: 0.72,
        CHOP: 0.65,
        BEAR_WEAK: 0.58,
        BEAR_STRONG: 0.45,
      },
      raw_data: {
        tweet_url: "https://x.com/ValueHunter_TLV/status/1780534567890",
      },
      created_at: "2026-04-12T09:30:00Z",
    },
  ],
  a4: [
    {
      id: "i1a4",
      analyst_id: "a4",
      ticker: "SNOW",
      analyst_type: "investor-growth",
      direction: "bullish",
      strength: 8,
      confidence: 7,
      horizon: "long_term",
      reasoning:
        "SNOW: ARR growth חזר מעל 30%, NRR של 127%. Cortex AI מוסיף TAM. קונה בירידות.",
      velocity: { delta: 2, post_frequency: 3 },
      decay: { half_life_days: 45 },
      regime_fit: {
        BULL_STRONG: 0.88,
        BULL_WEAK: 0.6,
        CHOP: 0.38,
        BEAR_WEAK: 0.18,
        BEAR_STRONG: 0.08,
      },
      raw_data: {
        tweet_url: "https://x.com/GrowthMindset_IL/status/1781234007890",
      },
      created_at: "2026-04-23T07:45:00Z",
    },
    {
      id: "i2a4",
      analyst_id: "a4",
      ticker: "DDOG",
      analyst_type: "investor-growth",
      direction: "bullish",
      strength: 9,
      confidence: 8,
      horizon: "long_term",
      reasoning:
        "DDOG: Rule of 40 של 58. NRR 116%. מוצר AI observability מוביל. לא זול אבל שווה.",
      velocity: { delta: 1, post_frequency: 2 },
      decay: { half_life_days: 45 },
      regime_fit: {
        BULL_STRONG: 0.92,
        BULL_WEAK: 0.65,
        CHOP: 0.35,
        BEAR_WEAK: 0.15,
        BEAR_STRONG: 0.07,
      },
      raw_data: {
        tweet_url: "https://x.com/GrowthMindset_IL/status/1780934007890",
      },
      created_at: "2026-04-19T12:00:00Z",
    },
    {
      id: "i3a4",
      analyst_id: "a4",
      ticker: "NET",
      analyst_type: "investor-growth",
      direction: "bullish",
      strength: 7,
      confidence: 6,
      horizon: "long_term",
      reasoning:
        "Cloudflare ממשיך לגנוב נתח שוק. SASE adoption מאיץ. Gross Margin 78%.",
      velocity: { delta: 0, post_frequency: 2 },
      decay: { half_life_days: 45 },
      regime_fit: {
        BULL_STRONG: 0.85,
        BULL_WEAK: 0.55,
        CHOP: 0.32,
        BEAR_WEAK: 0.15,
        BEAR_STRONG: 0.08,
      },
      raw_data: {
        tweet_url: "https://x.com/GrowthMindset_IL/status/1780634007890",
      },
      created_at: "2026-04-15T14:20:00Z",
    },
  ],
  a5: [
    {
      id: "i1a5",
      analyst_id: "a5",
      ticker: "GLD",
      analyst_type: "macro",
      direction: "bullish",
      strength: 9,
      confidence: 8,
      horizon: "macro",
      reasoning:
        "זהב בשיא כל הזמנים. DXY חלש + ריבית ריאלית יורדת = סביבה אידיאלית לזהב.",
      velocity: { delta: 2, post_frequency: 5 },
      decay: { half_life_days: 30 },
      regime_fit: {
        BULL_STRONG: 0.5,
        BULL_WEAK: 0.75,
        CHOP: 0.8,
        BEAR_WEAK: 0.92,
        BEAR_STRONG: 0.9,
      },
      raw_data: {
        tweet_url: "https://x.com/MacroView_Global/status/1781234560001",
      },
      created_at: "2026-04-24T07:00:00Z",
    },
    {
      id: "i2a5",
      analyst_id: "a5",
      ticker: "XLE",
      analyst_type: "macro",
      direction: "bullish",
      strength: 7,
      confidence: 7,
      horizon: "macro",
      reasoning:
        "אנרגיה: OPEC+ קוצץ ייצור, ביקוש עולמי יציב. XLE – חשיפה פשוטה לסקטור.",
      velocity: { delta: 1, post_frequency: 2 },
      decay: { half_life_days: 21 },
      regime_fit: {
        BULL_STRONG: 0.6,
        BULL_WEAK: 0.78,
        CHOP: 0.72,
        BEAR_WEAK: 0.8,
        BEAR_STRONG: 0.7,
      },
      raw_data: {
        tweet_url: "https://x.com/MacroView_Global/status/1780834560001",
      },
      created_at: "2026-04-20T09:30:00Z",
    },
    {
      id: "i3a5",
      analyst_id: "a5",
      ticker: "TLT",
      analyst_type: "macro",
      direction: "neutral",
      strength: 5,
      confidence: 6,
      horizon: "macro",
      reasoning:
        "אגח 20+ שנה: ציפיות חתוכות לריבית. TLT יכול לשמש כגידור אבל לא ממליצה על חשיפה גדולה.",
      velocity: { delta: -1, post_frequency: 2 },
      decay: { half_life_days: 14 },
      regime_fit: {
        BULL_STRONG: 0.25,
        BULL_WEAK: 0.45,
        CHOP: 0.6,
        BEAR_WEAK: 0.8,
        BEAR_STRONG: 0.88,
      },
      raw_data: {
        tweet_url: "https://x.com/MacroView_Global/status/1780534560001",
      },
      created_at: "2026-04-16T11:00:00Z",
    },
  ],
  a6: [
    {
      id: "i1a6",
      analyst_id: "a6",
      ticker: "NVDA",
      analyst_type: "mixed",
      direction: "bullish",
      strength: 9,
      confidence: 8,
      horizon: "long_term",
      reasoning:
        "NVDA: שניהם – פריצה טכנית לשיא + Blackwell ramp אמיתי. קטליסט + תמונה. מחזיק.",
      key_levels: { entry: 875, stop: 840, target: 1000 },
      velocity: { delta: 3, post_frequency: 5 },
      decay: { half_life_days: 21 },
      regime_fit: {
        BULL_STRONG: 0.95,
        BULL_WEAK: 0.72,
        CHOP: 0.45,
        BEAR_WEAK: 0.25,
        BEAR_STRONG: 0.12,
      },
      raw_data: {
        tweet_url: "https://x.com/AlphaSeeker_IL/status/1781234560099",
      },
      created_at: "2026-04-23T08:00:00Z",
    },
    {
      id: "i2a6",
      analyst_id: "a6",
      ticker: "AAPL",
      analyst_type: "mixed",
      direction: "neutral",
      strength: 5,
      confidence: 6,
      horizon: "long_term",
      reasoning:
        "AAPL: טכנית – שלב 2 מתחיל. פונדמנטלי – צמיחה איטית. מחכה לאישור AI monetization.",
      velocity: { delta: 0, post_frequency: 2 },
      decay: { half_life_days: 21 },
      regime_fit: {
        BULL_STRONG: 0.7,
        BULL_WEAK: 0.65,
        CHOP: 0.55,
        BEAR_WEAK: 0.4,
        BEAR_STRONG: 0.28,
      },
      raw_data: {
        tweet_url: "https://x.com/AlphaSeeker_IL/status/1780934560099",
      },
      created_at: "2026-04-19T10:45:00Z",
    },
    {
      id: "i3a6",
      analyst_id: "a6",
      ticker: "META",
      analyst_type: "mixed",
      direction: "bullish",
      strength: 8,
      confidence: 9,
      horizon: "swing",
      reasoning:
        "META: דוחות מעולים + פריצה טכנית + AI monetization מאיץ. כל האינדיקטורים ירוקים.",
      key_levels: { entry: 520, stop: 495, target: 590 },
      velocity: { delta: 2, post_frequency: 4 },
      decay: { half_life_days: 14 },
      regime_fit: {
        BULL_STRONG: 0.9,
        BULL_WEAK: 0.7,
        CHOP: 0.42,
        BEAR_WEAK: 0.2,
        BEAR_STRONG: 0.08,
      },
      raw_data: {
        tweet_url: "https://x.com/AlphaSeeker_IL/status/1780634560099",
      },
      created_at: "2026-04-17T16:30:00Z",
    },
  ],
};

// ─── Quotes ───────────────────────────────────────────────────────────────────

const MOCK_QUOTES: Record<string, MockQuote[]> = {
  a1: [
    {
      id: "q1a1",
      analyst_id: "a1",
      content:
        "שוק שורי לא מת על עלייה בנפח – הוא מת על שחיקה שקטה. שימו לב לנפח.",
      tweet_url: "https://x.com/StockWhisperer_IL/status/1770000000001",
      date: "2026-03-10",
    },
    {
      id: "q2a1",
      analyst_id: "a1",
      content: "כל פריצה בלי נפח היא הזמנה למלכודת שורים. אני מחכה לאישור.",
      tweet_url: "https://x.com/StockWhisperer_IL/status/1770000000002",
      date: "2026-02-28",
    },
    {
      id: "q3a1",
      analyst_id: "a1",
      content: "1:2 יחס סיכוי-סיכון זה לא הצעה. זה כללי בית. כל עסקה.",
      tweet_url: "https://x.com/StockWhisperer_IL/status/1770000000003",
      date: "2026-02-15",
    },
  ],
  a2: [
    {
      id: "q1a2",
      analyst_id: "a2",
      content:
        "Stage 1 זה הממתין. Stage 2 זה הכסף. רוב הטעויות הן כניסה מוקדמת מדי.",
      tweet_url: "https://x.com/PositionKing_Trade/status/1770000000004",
      date: "2026-03-05",
    },
    {
      id: "q2a2",
      analyst_id: "a2",
      content:
        "RS Line חייבת לעלות לפני המניה, לא אחריה. זה ההבדל בין מובילה לפיגרת.",
      tweet_url: "https://x.com/PositionKing_Trade/status/1770000000005",
      date: "2026-02-20",
    },
    {
      id: "q3a2",
      analyst_id: "a2",
      content:
        "הסבלנות היא הכלי הכי חשוב בארסנל שלי. רוב הרווחים מגיעים מ-20% מהעסקאות.",
      tweet_url: "https://x.com/PositionKing_Trade/status/1770000000006",
      date: "2026-01-30",
    },
  ],
  a3: [
    {
      id: "q1a3",
      analyst_id: "a3",
      content:
        "Margin of Safety זה לא פרנויה – זה ביטוח שאתה לא משלם עליו כלום.",
      tweet_url: "https://x.com/ValueHunter_TLV/status/1770000000007",
      date: "2026-03-15",
    },
    {
      id: "q2a3",
      analyst_id: "a3",
      content: "חברה מעולה במחיר הוגן עדיפה על חברה הוגנת במחיר מעולה. תמיד.",
      tweet_url: "https://x.com/ValueHunter_TLV/status/1770000000008",
      date: "2026-02-25",
    },
    {
      id: "q3a3",
      analyst_id: "a3",
      content: "FCF לא משקר. הכל השאר – ניתן לעיצוב. Free Cash Flow זה האמת.",
      tweet_url: "https://x.com/ValueHunter_TLV/status/1770000000009",
      date: "2026-02-01",
    },
  ],
  a4: [
    {
      id: "q1a4",
      analyst_id: "a4",
      content:
        "NRR מעל 120% אומר שהלקוחות הקיימים גדלים יותר מהירידה. זה ה-moat האמיתי.",
      tweet_url: "https://x.com/GrowthMindset_IL/status/1770000000010",
      date: "2026-03-20",
    },
    {
      id: "q2a4",
      analyst_id: "a4",
      content:
        "Rule of 40 זה הבדיקה האחת שאני עושה ראשון. מתחת ל-40? אני עוזב.",
      tweet_url: "https://x.com/GrowthMindset_IL/status/1770000000011",
      date: "2026-03-01",
    },
    {
      id: "q3a4",
      analyst_id: "a4",
      content: "הכי קשה בהשקעות צמיחה: לא למכור מוקדם מדי את המנצחים הגדולים.",
      tweet_url: "https://x.com/GrowthMindset_IL/status/1770000000012",
      date: "2026-02-10",
    },
  ],
  a5: [
    {
      id: "q1a5",
      analyst_id: "a5",
      content:
        "כשהדולר חלש, הזהב חזק, ואגרות החוב עולות – זה לא מקרה. זה מאקרו.",
      tweet_url: "https://x.com/MacroView_Global/status/1770000000013",
      date: "2026-04-01",
    },
    {
      id: "q2a5",
      analyst_id: "a5",
      content:
        "VIX מעל 25 זו הזדמנות, לא אזהרה. הפחד של אחרים הוא ה-alpha שלי.",
      tweet_url: "https://x.com/MacroView_Global/status/1770000000014",
      date: "2026-03-12",
    },
    {
      id: "q3a5",
      analyst_id: "a5",
      content: "הפד לא קובע את השוק – הפד מגיב לשוק. הבינו את ההבדל הזה.",
      tweet_url: "https://x.com/MacroView_Global/status/1770000000015",
      date: "2026-02-18",
    },
  ],
  a6: [
    {
      id: "q1a6",
      analyst_id: "a6",
      content:
        "טכנית בלי פונדמנטל זה ניחוש. פונדמנטל בלי טכנית זה אורך רוח. ביחד – זה edge.",
      tweet_url: "https://x.com/AlphaSeeker_IL/status/1770000000016",
      date: "2026-04-05",
    },
    {
      id: "q2a6",
      analyst_id: "a6",
      content:
        "EPS surprise + פריצה טכנית = השילוב שאני הכי אוהב. שניהם ביחד, לא אחד מהם.",
      tweet_url: "https://x.com/AlphaSeeker_IL/status/1770000000017",
      date: "2026-03-22",
    },
    {
      id: "q3a6",
      analyst_id: "a6",
      content:
        "גמישות היא המיומנות הכי חשובה. השוק תמיד יפתיע – השאלה היא אם אתה מוכן.",
      tweet_url: "https://x.com/AlphaSeeker_IL/status/1770000000018",
      date: "2026-02-28",
    },
  ],
};

// ─── Stock Fit Results ────────────────────────────────────────────────────────

const MOCK_FIT_RESULTS: StockFitResult[] = [
  {
    id: "fit1",
    analyst_id: "a1",
    ticker: "NVDA",
    fit_score: 8.7,
    explanation_he:
      "NVDA מתאימה מאוד לשיטת מאיר. המניה פרצה ממבנה קונסולידציה עם נפח גבוה, MACD חיובי ו-RSI ב-62 עם מקום לעלות. התבנית הטכנית היא בדיוק מה שמאיר מחפש.",
    risks_he: [
      "שוק כולו בירידות עלול למשוך גם NVDA",
      "ציפיות גבוהות מאוד כבר מגולמות במחיר",
      "CHOP regime יפגע בביצועי הסווינג",
    ],
    relevant_tweet_url: "https://x.com/StockWhisperer_IL/status/1781234567890",
    relevant_tweet_content:
      "NVDA פורצת $850 עם נפח ענק. MACD חוצה. יעד $920. זה הסטאפ שחיכיתי לו.",
    current_regime: "BULL_STRONG",
    expires_at: "2026-04-29T08:30:00Z",
    created_at: "2026-04-22T08:30:00Z",
  },
  {
    id: "fit2",
    analyst_id: "a3",
    ticker: "NVDA",
    fit_score: 3.2,
    explanation_he:
      "NVDA אינה מתאימה לגישת הערך של שרה. המניה נסחרת ב-P/E של 65 – גבוה מאוד ביחס לממוצע ההיסטורי. אין מרווח ביטחון. שרה לא רוכשת מניות ספקולטיביות.",
    risks_he: [
      "P/E של 65 ללא מרווח ביטחון",
      "תמחור מניח צמיחה מושלמת לנצח",
      "כל אכזבה בדוחות תגרור ירידה חדה",
    ],
    relevant_tweet_url: "https://x.com/ValueHunter_TLV/status/1780334567890",
    relevant_tweet_content:
      "NVDA מדהימה כחברה. אבל P/E 65? אני לא מוצאת כאן מרווח ביטחון. זה לא ה-DNA שלי.",
    current_regime: "BULL_STRONG",
    expires_at: "2026-05-22T08:30:00Z",
    created_at: "2026-04-22T08:30:00Z",
  },
  {
    id: "fit3",
    analyst_id: "a5",
    ticker: "GLD",
    fit_score: 9.1,
    explanation_he:
      "זהב הוא ההמלצה המאקרו האולטימטיבית של רחל כרגע. DXY בחולשה, ריבית ריאלית יורדת, מתח גיאופוליטי גבוה. כל הגורמים המאקרו מצביעים על המשך עלייה בזהב.",
    risks_he: [
      "היפוך פתאומי בדולר עלול להכאיב",
      "ריבית ריאלית עולה לפתע תשנה את התמונה",
    ],
    relevant_tweet_url: "https://x.com/MacroView_Global/status/1781234560001",
    relevant_tweet_content:
      "זהב בשיא כל הזמנים. DXY שבור. ריבית ריאלית שלילית. המאקרו ברור – זהב ממשיך.",
    current_regime: "BULL_WEAK",
    expires_at: "2026-05-24T07:00:00Z",
    created_at: "2026-04-24T07:00:00Z",
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getMockAnalysts(): Analyst[] {
  return MOCK_ANALYSTS;
}

export function getMockAnalystByUsername(
  username: string,
): AnalystProfileData | null {
  const analyst = MOCK_ANALYSTS.find((a) => a.username === username);
  if (!analyst) return null;

  const dna = MOCK_DNA.find((d) => d.analyst_id === analyst.id);
  if (!dna) return null;

  return {
    analyst,
    dna,
    insights: MOCK_INSIGHTS_BY_ANALYST[analyst.id] ?? [],
    quotes: MOCK_QUOTES[analyst.id] ?? [],
  };
}

export function getMockInsightsByTicker(ticker: string): Insight[] {
  return Object.values(MOCK_INSIGHTS_BY_ANALYST)
    .flat()
    .filter((i) => i.ticker.toUpperCase() === ticker.toUpperCase());
}

export function getMockStockFitResult(
  analystId: string,
  ticker: string,
): StockFitResult {
  const pre = MOCK_FIT_RESULTS.find(
    (r) =>
      r.analyst_id === analystId &&
      r.ticker.toUpperCase() === ticker.toUpperCase(),
  );
  if (pre) return pre;

  const analyst = MOCK_ANALYSTS.find((a) => a.id === analystId);
  const score = parseFloat(
    (analyst
      ? analyst.analyst_weight * 10 * 0.7 + Math.random() * 2
      : 5
    ).toFixed(1),
  );

  return {
    id: `fit-${analystId}-${ticker}`,
    analyst_id: analystId,
    ticker: ticker.toUpperCase(),
    fit_score: Math.min(10, score),
    explanation_he: `${ticker.toUpperCase()} נבדקה מול ה-DNA של ${analyst?.display_name ?? "האנליסט"}. ניתוח מבוסס על ${analyst?.tweets_learned_count ?? 500}+ ציוצים שנלמדו.`,
    risks_he: [
      "נתונים זמניים – ממתין לבדיקה מעמיקה",
      "יש לאמת מול מצב השוק הנוכחי",
    ],
    current_regime: "BULL_STRONG",
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  };
}
