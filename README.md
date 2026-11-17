# Twinkle.Shop

অনলাইন শপের কাস্টমার সাইট (একটাই ফাইল: `index.html`), GitHub Pages-এ চলে।

| ফাইল | কাজ |
|---|---|
| `index.html` | পুরো সাইট |
| `generate-seo.mjs` | পণ্যের তালিকা থেকে `sitemap.xml` ও `robots.txt` বানায় |
| `.github/workflows/seo.yml` | প্রতি ৬ ঘণ্টায় ওই স্ক্রিপ্ট নিজে চালায় |
| `sitemap.xml`, `robots.txt` | স্ক্রিপ্ট নিজে বানায়, হাতে বদলাবেন না |
| `googleXXXX.html` | Google Search Console যাচাইয়ের ফাইল (আপনার নিজের পাওয়া) |

অ্যাডমিন ফাইল এই রিপোতে রাখবেন না।
