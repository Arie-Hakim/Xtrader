**XTrader**

מסמך אפיון מלא – גרסה 3.0

*פלטפורמה ללמידה עמוקה של אנליסטים מרשת X*

## **Version History**

| **גרסה** | **תאריך** | **שינויים עיקריים** |
| --- | --- | --- |
| 1.0 | אפריל 2026 | אפיון ראשוני – בסיס מבני |
| 2.0 | אפריל 2026 | מאחד 4 אפיונים (Claude, GPT, Grok, Gemini) + Stock Fit Agent |
| 3.0 | אפריל 2026 | למידה מ-500-1000 פוסטים, Trader-Position, Monetization, Personas, KPIs, Security, Risks, User Flows |

# **תקציר מנהלים**

*XTrader הופכת את רשת X למעבדת מחקר פיננסית: מלמדת את ה-DNA של אנליסטים מובילים, ונותנת למשקיע כלי אחד – האם מניה מסוימת מתאימה לשיטה של האנליסט הזה בתנאי השוק הנוכחיים?*

**ליבת המוצר:**

- למידה עמוקה של 500-1,000 ציוצים לכל אנליסט → פרופיל DNA מפורט

- DNA Simulator – בודק התאמה בין מניה לשיטת האנליסט

- Regime-Aware – מתאים את הניתוח למצב השוק

- שקיפות מלאה – כל תובנה מקושרת לציוץ המקורי

# **1. חזון המוצר**

XTrader אינה "מכונת איתותים" או Sentiment Aggregator. היא פלטפורמת מחקר מבוססת Agentic AI שהופכת רעש ברשת X לידע מובנה.

### **ערכי היסוד**

| **ערך** | **משמעות** |
| --- | --- |
| 🎯 איכות על כמות | רשימה מנוהלת (Curated) – לא מיליון חשבונות אקראיים |
| 🔍 שקיפות | המשתמש רואה ציוצים מקוריים וההיגיון מאחורי כל תובנה |
| 🧠 למידה | להבין איך האנליסט חושב – לא "קנה/מכור" |
| ⚡ דינמיות | התאמה למצב שוק ואופק זמן |
| 🛡️ הגנה מ-Hype | זיהוי המלצות מנופחות (Contrarian Signal) |

**הצהרת אחריות (חובה בכל מקום): ****"****מידע בלבד. אין זה ייעוץ פיננסי. ביצועי עבר אינם מבטיחים עתיד.****"**

# **2. User Personas – קהלי יעד**

4 פרסונות מרכזיות שמנחות את עיצוב המוצר:

| **פרסונה** | **תיאור** | **מה הוא רוצה** |
| --- | --- | --- |
| 🏃 Retail Trader | סוחר קמעונאי, 25-45, סחור 1-3 שנים | "מה עובד עכשיו בשוק?" – המלצות יומיות פשוטות |
| 🎓 Semi-Pro Investor | משקיע פעיל, 35-55, 5+ שנות ניסיון | "מי האנליסט שהכי מדויק?" – DNA עמוק + ביצועים |
| 🔬 Research Analyst | אנליסט מקצועי בבית השקעות | "איך סוגי חשיבה שונים מסכימים?" – Cross-type consensus |
| 💼 Portfolio Manager | מנהל תיקים קטן-בינוני | "התאמה בין מניה לסגנונות שונים" – DNA Simulator |

**ה-MVP מתמקד ב-Retail Trader + Semi-Pro Investor. Research Analyst ו-Portfolio Manager מגיעים ב-V2 עם Leaderboard ו-Performance Tracking.**

# **3. עקרונות ליבה**

חמישה עקרונות בלתי ניתנים לפשרה:

### **3.1 Separation of Concerns**

Parse Agent מחלץ בלבד. לא מחשב ציונים, לא ממליץ, לא מקבל החלטות. ההפרדה מונעת hallucinations.

### **3.2 Insight is the Atomic Unit**

כל פוסט → Insight בפורמט JSON קשיח. ה-Insight הוא החוזה של המערכת.

### **3.3 Type-Aware Extraction**

המערכת מזהה סוגי אנליסטים ומחלצת מכל אחד מידע שונה – לא כופה פורמט אחד.

### **3.4 Context Matters**

כל Insight מקבל Regime Fit ותוקף (Decay). אנליסט מעולה בשוק שורי יכול להיות חסר ערך בדובי.

### **3.5 Transparency Over Magic**

המשתמש תמיד רואה את הציוץ המקורי, הלינק ל-X, וההיגיון מאחורי כל ציון.

# **4. סוגי אנליסטים**

המערכת מזהה אוטומטית סוג האנליסט מתוך 500-1,000 הפוסטים הראשונים שלו:

| **סוג** | **תת-סוג** | **מה הוא עושה** | **מה נלמד** |
| --- | --- | --- | --- |
| 📊 Trader | Scalp | דקות-שעות, Day Trading | כניסות מהירות, VWAP, Volume |
| 📊 Trader | Swing | 1-4 שבועות | פריצות, RSI, MACD |
| 📊 Trader | Position | 1-6 חודשים | Stage Analysis, ממוצעים נעים |
| 💎 Investor | Value | חודשים-שנים | P/E, DCF, קטליסטים |
| 💎 Investor | Growth | חודשים-שנים | צמיחה, TAM, margins |
| 🌍 Macro | - | חודשים-שנים | ריביות, סקטורים, rotation |
| 🧠 Mixed | - | משתנה | שילוב של כמה גישות |

**חידוש בגרסה 3: Trader מתחלק ל-Scalp/Swing/Position. זה חשוב כי Position Trader קרוב יותר ל-Investor מאשר ל-Scalper.**

# **5. Insight Schema**

זה החוזה של המערכת. כל פוסט הופך ל-Insight בפורמט JSON קשיח.

### **5.1 טבלת השדות**

| **שדה** | **סוג** | **תיאור** |
| --- | --- | --- |
| ticker | string | סמל המניה (NVDA, TSLA) |
| analyst_type | enum | trader-scalp/swing/position, investor-value/growth, macro, mixed |
| direction | enum | bullish / bearish / neutral |
| strength | 1-10 | עד כמה האנליסט נחרץ |
| confidence | 1-10 | עד כמה ה-Parser בטוח שהבין |
| horizon | enum | scalp / swing / long_term / macro |
| reasoning | text | טקסט מזוקק בעברית |
| key_levels | object? | entry/stop/target (לטריידרים) |
| velocity.delta | int | שינוי ביטחון לעומת פוסט קודם |
| velocity.post_frequency | int | פעמים דיבר על המניה בשבוע |
| decay.half_life_days | int | 3/14/60 לפי סוג |
| regime_fit | object | התאמה לכל מצב שוק (0.0-1.0) |
| raw_data.tweet_url | string | לינק לציוץ המקורי (שקיפות) |

### **5.2 דוגמה קצרה**

{ ticker: 'NVDA', analyst_type: 'trader-swing',

  direction: 'bullish', strength: 8, confidence: 7,

  horizon: 'swing',

  key_levels: { entry: 500, stop: 485, target: 550 },

  decay: { half_life_days: 3 },

  regime_fit: { BULL_STRONG: 0.95, BEAR_STRONG: 0.05 } }

### **5.3 Decay – Half-Life לפי סוג**

| **סוג** | **Half-Life** | **הסבר** |
| --- | --- | --- |
| Trader-Scalp | 0.5-1 יום | timing קריטי מאוד |
| Trader-Swing | 3-7 ימים | המלצת פריצה פגה מהר |
| Trader-Position | 14-30 ימים | מגמה ארוכה יותר |
| Macro | 14-30 ימים | תזות מאקרו נמשכות |
| Investor | 60-90 ימים | תזת ערך ארוכת טווח |

# **6. Scoring Engine**

נוסחת הדירוג המרכזית (רצה ב-Recommender Agent):

final_score = base_score

            × regime_multiplier

            × analyst_multiplier

            × velocity_multiplier

            × freshness_multiplier

| **רכיב** | **חישוב** | **הערה** |
| --- | --- | --- |
| base_score | (strength×0.6 + confidence×0.4) / 10 | ציון בסיסי |
| regime_multiplier | regime_fit[current_regime] | התאמה למצב שוק |
| analyst_multiplier | analyst_weight (0-1) | דינמי לפי ביצועים |
| velocity_multiplier | 1 + (delta × 0.05), max=1.25 | בונוס על conviction עולה |
| freshness_multiplier | e^(-lambda × age_in_days) | Exponential decay |

### **6.1 Type Diversity Bonus**

if unique_analyst_types >= 3: final_score *= 1.15

if unique_analyst_types == 2: final_score *= 1.07

זה הלב – טריידר + משקיע + מאקרו שמסכימים = אישור משולש.

### **6.2 Contrarian Signal**

if sentiment_score > 80 AND insight_score < 55:

    contrarian_flag = True, final_score *= 0.6

כשהרעש גדול אבל האנליסטים הרציניים שותקים – אזהרה.

# **7. ארכיטקטורת הסוכנים**

6 סוכנים בענן Anthropic. שים לב: הסוכנים רצים לפי אירועים (event-driven), לא כל שעה.

| **סוכן** | **תפקיד** | **מתי רץ** |
| --- | --- | --- |
| 🤖 Fetcher | שולף פוסטים מ-X + סינון רעש | פעם ביום 06:00 + trigger ידני |
| 🧬 Parser | מפרק פוסטים ל-Insights | אחרי Fetch + על פוסטים חדשים |
| 📚 DNA Builder | בונה/מעדכן DNA | רק כש: אנליסט חדש / 50+ פוסטים חדשים / trigger ידני |
| 🌡️ Regime Detector | מזהה מצב שוק | כל בוקר 07:00 |
| 🎯 Recommender | קונצנזוס + דוח יומי | כל בוקר 08:00 |
| 🔍 Stock Fit | בודק התאמת מניה לאנליסט | On-demand – לפי בקשת משתמש |

**חידוש בגרסה 3: Fetcher ו-DNA Builder לא רצים ב-schedule קבוע. Fetcher פעם ביום, DNA Builder רק כשיש משהו ללמוד. חוסך 90% עלויות.**

### **7.1 איפה רואים את הסוכנים?**

ב-Claude Console (console.anthropic.com):

- Build → Skills: כל 6 ה-Skills מוצגים עם תיאור

- Managed Agents → Agents: רשימת 6 הסוכנים + סטטוס

- Managed Agents → Sessions: היסטוריית הרצות

- Managed Agents → Environments: הגדרות סביבה

- Analytics: שימוש בטוקנים, עלויות, שגיאות

# **8. Skills**

| **Skill** | **תפקיד** | **מופעל על ידי** |
| --- | --- | --- |
| analyst-classifier | מזהה סוג + תת-סוג אנליסט | Parser |
| insight-extractor | מחלץ Insight מפוסט → JSON | Parser |
| dna-builder | פרופיל DNA מ-500-1000 Insights | DNA Builder |
| regime-classifier | מגדיר Bull/Bear/Chop | Regime Agent |
| recommendation-builder | קונצנזוס + דוח עברית | Recommender |
| stock-fit-analyzer | התאמת מניה-אנליסט | Stock Fit |

# **9. DNA Simulator – הפיצ****'****ר הדגל**

הפיצ'ר הייחודי שמבדל את XTrader מכל מוצר אחר בשוק.

### **9.1 תסריט שימוש מלא**

*"**יש לי מניית NVDA ברשימת המעקב. האנליסט @qullamaggie הוא הסוחר המועדף עליי. האם NVDA מתאימה לשיטה שלו עכשיו?**"*

### **9.2 UX – מה המשתמש רואה**

┌─────────────────────────────────────────┐

│  🔍 DNA Simulator                        │

├─────────────────────────────────────────┤

│  בחר אנליסט:  [@qullamaggie ▼]          │

│  הכנס מניה:   [NVDA___]  [🔎 בדוק]     │

├─────────────────────────────────────────┤

│  ✅ התאמה חזקה: 8/10                    │

├─────────────────────────────────────────┤

│  למה זה מתאים לשיטה שלו:                │

│  ✓ פריצה מעל 500 – הכלל המרכזי שלו     │

│  ✓ Volume חריג – האינדיקטור המוביל     │

│  ✓ Stage 2 (Minervini) – תנאי הכרחי    │

│  ✓ Swing horizon – האופק המועדף        │

├─────────────────────────────────────────┤

│  סיכונים לפי השיטה שלו:                 │

│  ⚠ קרוב ל-Resistance היסטורי            │

│  ⚠ Volume היום נמוך מהממוצע             │

├─────────────────────────────────────────┤

│  💬 הציוץ הרלוונטי האחרון שלו:          │

│  "אני מחכה לפריצה מעל 500 עם Volume"   │

│  📅 לפני יומיים  🔗 [לציוץ המקורי]     │

├─────────────────────────────────────────┤

│  🌡️ התאמה למצב השוק הנוכחי:             │

│  BULL_STRONG – השיטה שלו עובדת טוב פה   │

│  95% מההמלצות שלו במצב זה הצליחו        │

└─────────────────────────────────────────┘

### **9.3 איך זה עובד טכנית**

- Frontend שולח: { analyst_id, ticker } ל-backend

- Backend טוען את ה-DNA של האנליסט מ-analyst_dna

- Backend שולף נתוני מניה חיים (Yahoo Finance)

- Stock Fit Agent מריץ stock-fit-analyzer skill עם: DNA + stock data + current regime

- Agent מחזיר: fit_score, explanation_he, risks, relevant_tweet

- תוצאה נשמרת ב-stock_fit_results cache (TTL 4 שעות)

# **10. מסד הנתונים**

| **טבלה** | **תוכן עיקרי** |
| --- | --- |
| analysts | id, username, display_name, avatar_url, analyst_type, analyst_weight, tweets_learned_count |
| tweets | id, analyst_id, tweet_id, content, posted_at, is_financial, is_processed |
| analyst_dna | id, analyst_id, version, profile_type, profile_data (JSONB), tweets_analyzed_count |
| insights | id, ticker, analyst_id, insight, velocity, decay, regime_fit, raw_data (JSONB) |
| market_regimes | id, date, regime, vix_level, spy_trend, confidence |
| recommendations | id, date, ticker, final_score, consensus, contrarian_flag, reasoning_he |
| stock_fit_results | id, analyst_id, ticker, fit_score, explanation_he, expires_at (cache) |
| users | id, email, created_at, plan_type, preferences (JSONB) |

# **11. User Flows**

### **11.1 Flow 1: למידת אנליסט חדש**

משתמש מכניס @username

    ↓

Fetcher מושך 500-1000 ציוצים אחרונים

    ↓

Parser מחלץ Insights (Batch) – 2-5 דקות

    ↓

DNA Builder בונה פרופיל – 1-2 דקות

    ↓

משתמש רואה: פרופיל DNA מלא + היסטוריית Insights

### **11.2 Flow 2: בדיקת מניה לאנליסט**

משתמש נכנס לפרופיל אנליסט

    ↓

לוחץ "🔍 בדוק מניה לפי השיטה שלו"

    ↓

מזין ticker (NVDA)

    ↓

Stock Fit Agent מריץ התאמה (5-10 שניות)

    ↓

משתמש רואה: fit_score, סיבות, סיכונים, ציוץ רלוונטי

### **11.3 Flow 3: דוח בוקר**

07:00 – Regime Agent מזהה מצב שוק

    ↓

08:00 – Recommender מחשב קונצנזוס לכל המניות הפעילות

    ↓

דשבורד מתעדכן: Regime + Top Consensus

    ↓

(V2) – Push notification למשתמש

# **12. Tech Stack**

| **שכבה** | **כלי** | **למה** |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript | מהיר, RTL עברית |
| Backend | Node.js + Express | עקבי, מוכר |
| DB | PostgreSQL (Supabase) | JSONB + Auth + Realtime |
| AI – Tweets | Grok 4.1 Fast | $0.20/M, מאומן על X |
| AI – DNA/Reports | Claude Sonnet | עברית מצוינת |
| Batch | Grok Batch API | 50% חיסכון |
| X Data | Grok X Search Tool | $5/1K calls |
| Agents | Anthropic Managed Agents | ללא תחזוקת שרת |
| Queue | Redis + BullMQ | עבודות אסינכרוניות |
| Auth | Supabase Auth | רישום ציבורי |
| Deploy | Vercel + Railway | CDN + Node + DB |

### **12.1 עלות תפעול משוערת (MVP, 20 אנליסטים)**

| **רכיב** | **עלות חודשית** |
| --- | --- |
| Grok API (Batch, פעם ביום) | ~$8 |
| Claude API (DNA + Reports) | ~$12 |
| Supabase | ~$25 |
| Redis | ~$3 |
| Vercel | חינם |
| סה"כ | ~$48/חודש |

# **13. Frontend**

| **#** | **דף** | **עדיפות** |
| --- | --- | --- |
| 1 | 👥 אנליסטים – רשת כרטיסים + חיפוש + הוספה | MVP |
| 2 | 👤 פרופיל אנליסט – DNA + Insights + ציטוטים ⭐ | MVP |
| 3 | 🔍 DNA Simulator – בדיקת מניה | MVP |
| 4 | 🏠 דשבורד – מצב שוק + קונצנזוס | MVP |
| 5 | ⚖️ השוואה | V2 |
| 6 | 📊 Leaderboard | V2 |
| 7 | ⚙️ הגדרות | MVP |

# **14. Monetization**

מודל רווח מדורג – Freemium → Pro → Enterprise.

| **תוכנית** | **מחיר** | **כולל** |
| --- | --- | --- |
| 🆓 Free | $0/חודש | 3 אנליסטים, 5 בדיקות מניה ביום, דוח בוקר בסיסי |
| ⭐ Pro | $29/חודש | אנליסטים ללא הגבלה, בדיקות ללא הגבלה, השוואות, Alerts |
| 💼 Team | $99/חודש | עד 5 משתמשים, Leaderboard, Analytics |
| 🏢 Enterprise | לפי הצעה | API גישה, White-label, Custom analysts, SLA |

### **14.1 מקורות הכנסה משניים**

- API ציבורי – תשלום לפי שימוש (B2B)

- White-label לבתי השקעות (B2B)

- Affiliate – שיתוף פעולה עם ברוקרים (TradeStation, Interactive Brokers)

# **15. Success Metrics / KPIs**

איך נדע שה-MVP הצליח:

| **מדד** | **יעד MVP** | **מדידה** |
| --- | --- | --- |
| Active Analysts Learned | 20+ | ספירה ב-DB |
| User Retention (D30) | 70%+ | Analytics |
| DNA Simulator Uses/User/Week | 5+ | Event tracking |
| NPS Score | 45+ | Survey אחרי 30 יום |
| Avg tweets per analyst | 700+ | מה-DB |
| Agent success rate | 95%+ | Monitoring |
| Conversion Free→Pro | 5%+ | Stripe analytics |

# **16. Risks ****&**** Mitigations**

| **סיכון** | **השפעה** | **מיטיגציה** |
| --- | --- | --- |
| Hallucinations ב-Parser | שגיאות בחילוץ → ציונים שגויים | JSON Schema קשיח + confidence field + human review |
| עלויות API מתפוצצות | עלויות מתגלגלות עם גידול המשתמשים | Batch API + Cache אגרסיבי + Rate limiting |
| Legal / Regulatory | חשיפה משפטית על "המלצות" | Disclaimer חזק + "לימוד לא ייעוץ" + ייעוץ משפטי |
| Data Accuracy | אנליסטים משקרים / טועים | Performance tracking + Leaderboard + Contrarian Signal |
| X API Rate Limits | חוסם שליפה | Grok X Search + Cache + Batch |
| אנליסט מוחק ציוצים | DNA מבוסס על מידע שנעלם | שמירת content מקומי ב-DB |
| AI Model Drift | Grok/Claude משנים התנהגות | Versioning + regression tests |
| Competitor Entry | חברה גדולה תעתיק | Execution + Community + Curated List |

# **17. Security ****&**** Privacy**

### **17.1 Data Handling**

- ציוצים ציבוריים בלבד – אין גישה ל-private accounts

- שמירת ציוצים ב-DB (לא רק references) – למקרה שימחקו

- GDPR compliance – זכות למחיקה, זכות לעיון

- נתוני משתמשים מוצפנים (at-rest + in-transit)

### **17.2 Authentication**

- Supabase Auth – OAuth (Google, Apple) + Magic Link

- 2FA אופציונלי לחשבונות Pro+

- JWT tokens עם expiration קצר

### **17.3 API Security**

- Rate limiting per user

- API keys hashed ב-DB

- CORS restrictions

- Input validation על כל endpoint

### **17.4 Secrets Management**

- GROK_API_KEY, CLAUDE_API_KEY – server-side only

- Supabase Vault לסודות רגישים

- אין keys בקוד client

# **18. Roadmap**

| **שלב** | **זמן** | **תוכן** |
| --- | --- | --- |
| MVP | 6-8 שבועות | DB + 6 Agents + 6 Skills + 4 דפים + 20 אנליסטים + Free plan |
| V1.5 | חודש 3 | Pro plan + Subscription (Stripe) + Curated List מלאה |
| V2 | חודש 4-5 | Performance tracking + Leaderboard + השוואה + Personalization |
| V3 | חודש 6-8 | Mobile App + Alerts + API + Team plan |
| V4 | חודש 9+ | White-label + Enterprise + אנליסטים ישראלים + TASE |

# **19. Curated List – קריטריונים ודוגמאות**

### **19.1 קריטריונים לבחירת אנליסט**

- מינימום 1,000 עוקבים (המקצועיים לא מפחדים מתמיכה)

- מינימום 500 ציוצים פיננסיים ב-6 חודשים אחרונים

- Engagement rate > 1% (תגובות + retweets)

- לפחות שנת פעילות ב-X

- תוכן פיננסי > 70% (לא פוליטי או אישי)

- סגנון ברור – לא "קוקטייל" של הכל

### **19.2 דוגמאות התחלתיות (לאישור)**

| **סוג** | **שם** | **תת-סוג** |
| --- | --- | --- |
| 📊 Trader | @qullamaggie | Swing/Breakout |
| 📊 Trader | @Upticken | Swing |
| 📊 Trader | @TraderStewie | Swing + Options |
| 📊 Trader | @Trader_mcaruso | Scalp |
| 💎 Investor | @BrianFeroldi | Growth |
| 💎 Investor | @modestproposal1 | Value |
| 🌍 Macro | @LynAldenContact | Macro |
| 🌍 Macro | @RaoulGMI | Macro |
| 🧠 Mixed | @unusual_whales | Flow + News |
| 🧠 Mixed | @zerohedge | Macro + News |

הערה: הרשימה לאישור. יש לבדוק כל חשבון ידנית + לוודא שהוא פעיל.

# **20. הצעדים הבאים – סדר הבנייה**

| **#** | **משימה** | **תיאור** |
| --- | --- | --- |
| 1 | Parse Agent Prompt | Production-grade prompt – הלב |
| 2 | DB Schema (SQL) | 8 טבלאות + indexes + constraints |
| 3 | Fetcher Agent | Grok X Search + סינון + שליפת 500-1000 ציוצים |
| 4 | Parser Agent | Batch API + insight-extractor |
| 5 | DNA Builder | פרופיל DNA מהיסטוריה |
| 6 | Stock Fit Agent | הפיצ'ר הדגל |
| 7 | Frontend MVP | 4 דפים ראשונים |
| 8 | Regime + Recommender | דוח בוקר |

# **נספח – Glossary (מילון מונחים)**

| **מונח** | **הסבר** |
| --- | --- |
| Analyst DNA | פרופיל מלא של אנליסט – סגנון, אינדיקטורים, העדפות |
| Insight | יחידת מידע מובנית שנוצרת מפוסט – הבסיס של המערכת |
| Regime | מצב שוק – BULL_STRONG / BULL_WEAK / CHOP / BEAR_WEAK / BEAR_STRONG |
| Regime Fit | התאמה של Insight למצב שוק (0.0-1.0) |
| Velocity | קצב שינוי בביטחון האנליסט |
| Decay | קצב דעיכת רלוונטיות של Insight |
| Half-life | זמן שלוקח ל-Insight לאבד חצי מהערך |
| Contrarian Signal | זיהוי Hype – sentiment גבוה + conviction נמוך |
| Type Diversity | מדד להסכמה בין סוגי אנליסטים שונים |
| DNA Simulator | הפיצ'ר הייחודי – בודק התאמה בין מניה לאנליסט |
| Curated List | רשימת אנליסטים מנוהלת ולא חופשית |
| Managed Agent | סוכן AI שרץ בענן Anthropic, ללא תחזוקת שרת |
| Skill | הוראות קבועות לסוכן (פרומפט עם פורמט) |
| Batch API | עיבוד מספר בקשות במקביל במחיר מוזל 50% |
| Stage Analysis | שיטת Minervini – 4 שלבים (Basing/Advance/Topping/Decline) |

*גרסה: 3.0 | תאריך: אפריל 2026 | סטטוס: מוכן לפיתוח*

*מאחד: Claude + GPT + Grok + Gemini specs + הערות ליטוש*