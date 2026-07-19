# Daily Research Agent (Telegram + Gemini, 100% free)

Har roz automatically aapke diye hue topics research karke Telegram pe bhej deta hai.
Cost: **₹0/month** (Gemini free tier + Telegram free + GitHub Actions free).

## Setup (ek baar karna hai, ~10 minute)

### Step 1: Telegram Bot banao
1. Telegram me `@BotFather` ko search karo, `/start` bhejo
2. `/newbot` bhejo, naam do (jaise `Sufiyan Research Bot`)
3. BotFather aapko ek **token** dega — jaise `123456:ABC-DEF...` — ise copy karo
4. Apne bot ko Telegram me search karke usse ek message bhejo (jaise "hi") — isse zaroori hai warna bot aapko message nahi bhej payega
5. Apna **Chat ID** pata karne ke liye browser me ye URL kholo (token apna daal ke):
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
   Response me `"chat":{"id":XXXXXXX` milega — wahi number aapka Chat ID hai

### Step 2: Gemini API Key lo (free)
1. https://aistudio.google.com/apikey pe jao
2. Google account se login karo → "Create API Key" click karo
3. Key copy kar lo

### Step 3: GitHub pe repo banao
1. GitHub pe naya repository banao (private rakh sakte ho)
2. Ye poora `daily-research-agent` folder us repo me push kar do:
   ```
   git init
   git add .
   git commit -m "daily research agent"
   git branch -M main
   git remote add origin <aapke-repo-ka-URL>
   git push -u origin main
   ```

### Step 4: Secrets add karo (keys yahan safe rehti hain)
Repo → Settings → Secrets and variables → Actions → "New repository secret" — ye 3 add karo:
- `GEMINI_API_KEY` → Step 2 wali key
- `TELEGRAM_BOT_TOKEN` → Step 1 wala token
- `TELEGRAM_CHAT_ID` → Step 1 wala chat id

### Step 5: Test run karo
Repo → "Actions" tab → "Daily Research Agent" workflow → "Run workflow" button click karo.
2 minute me aapko Telegram pe message aana chahiye.

Agar sab sahi gaya, to ye **daily 9:30 AM IST** apne aap chalega — kuch bhi karne ki zaroorat nahi.

## Naya topic add karna hai?

`config/topics.json` file kholo aur is format me naya object add karo:

```json
{
  "title": "Chhota sa title jo message me dikhega",
  "prompt": "Yahan detail me likho ki AI ko kya research karna hai — jitna specific utna accha result"
}
```

Example — kisi business ke baare me research:
```json
{
  "title": "XYZ Company Research",
  "prompt": "Research XYZ Pvt Ltd - unka business model, recent news, funding, aur growth kaisi hai, batao."
}
```

File save karke GitHub pe push kar do (`git add . && git commit -m "add topic" && git push`) — agle din se naya topic bhi aayega.

## Waqt badalna hai?

`.github/workflows/daily.yml` me ye line hai:
```
- cron: "0 4 * * *"
```
Ye UTC time me hai. IST = UTC + 5:30. Formula: chahiye time (IST) minus 5:30 = cron me daalo (UTC).
Example: 8:00 AM IST chahiye → 2:30 UTC → `cron: "30 2 * * *"`
