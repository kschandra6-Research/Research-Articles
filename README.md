# K.S. Chandra Research Archive & Interactive Web Dashboard

> **Created and Hosted by K.S.Chandra 2026.**

An interactive, professional academic web dashboard designed for exploring, reading, citing, and downloading published research articles in Indian Archaeology, Art History, Megalithic Material Culture, Ancient Architecture, and Archaeoastronomy by **K.S. Chandra** (RTM Nagpur University).

---

## 🏛️ Repository Overview

This repository archives eight (8) landmark peer-reviewed research papers published between **2018 and 2021** across leading archaeological journals and academic edited volumes:

| # | Title | Journal / Volume | Year | Pages | Category |
|---|---|---|---|---|---|
| 1 | **Brick structures from Eastern Vidarbha during 5th to 8th Century CE** | *Kosala-XII*, Directorate of Culture & Archaeology, Raipur | 2021 | 197–206 | Architecture & Brick Technology |
| 2 | **A Fragmentary Lajjā Gaurī Image from Brahmapuri, Dist. Chandrapur** | *Kosala-XI*, Directorate of Culture & Archaeology, Raipur | 2020 | 134–143 | Iconography & Religious Studies |
| 3 | **Revisiting Vidarbha Megalithic Material Culture – Study of some Tools and Implements found from various Excavations in Vidarbha** | *ICON Journal of Archaeology and Culture*, Vol. 6 | 2019 | 191–206 | Megalithic & Iron Age Studies |
| 4 | **A Comparative Study of Material Culture found from Excavations at Bhokardan and Paunar** | *Human and Heritage: An Archaeological Spectrum of Asiatic Countries*, Vol. 1 | 2019 | 397–403 | Early Historic & Trade Networks |
| 5 | **A Study of Some Celestial Events Missed by Ancient Indians** | *Arnava*, Vol. VIII, No. 1 | 2019 | 73–92 | Archaeoastronomy & Ancient Science |
| 6 | **Some Historic Sites in Nagpur District - Present Status** | *Arnava*, Vol. VII, No. 2 | 2018 | 1–17 | Heritage Conservation & Field Survey |
| 7 | **A Vishnu Sculpture from Kelzar, District Wardha, Maharashtra** | *Heritage: Journal of Multidisciplinary Studies in Archaeology*, Vol. 6 | 2018 | 813–819 | Iconography & Religious Studies |
| 8 | **Paleolithic Tools in Nagpur: Recent Discovery** | *Arnava*, Vol. VII, No. 1 | 2018 | 1–17 | Prehistory & Lithic Archaeology |

---

## ⚡ Key Dashboard Features

1. **Instant Search & Multi-Filter Engine**:
   - Real-time search across titles, abstracts, keywords, authors, and journal names.
   - Filter by research category or publication year (2018, 2019, 2020, 2021).
   - Sort by newest, oldest, title A–Z, or page length.
   - Grid View & Compact List View switcher.

2. **Full-Resolution Interactive Online Reader**:
   - Built-in PDF reader modal with split-screen view:
     - Side drawer displaying structured abstract, key highlights, keywords, chronological period, and geographical region.
     - Embedded PDF viewer with page navigation, zoom, and open in new tab.
   - Read all 8 articles without needing any downloads.

3. **Session Download Restriction (Fair-Use Policy)**:
   - PDF downloads are strictly limited to **one (1) article per session** to encourage thoughtful scholarly usage while maintaining open reading access.
   - Real-time session tracking reflects the active session quota in the header banner.
   - If a user attempts to download a second article, an informative guidance modal offers instant online reading instead or option to reset session.

4. **Mandatory Citation Agreement**:
   - Before downloading, a research attribution modal appears displaying the formal academic citation.
   - Supports **Standard / Original**, **APA 7th**, **Chicago**, and **BibTeX** formats with 1-click clipboard copy.
   - Downloader must check the agreement box (`I agree to properly cite this article...`) before the download button unlocks.

5. **Master Citation Guide & BibTeX Export**:
   - A dedicated section compiling exact citations from `Citations.docx`.
   - Single-click bulk export of all 8 citations as a `.bib` file.

---

## 🚀 How to Run Locally

### Option A: 1-Click Launch (Windows)
Double-click `run_server.bat` in this folder. It will start the lightweight server and automatically launch your browser at `http://localhost:8000`.

### Option B: Python Command Line
```powershell
# Navigate to the project directory
cd "C:\Users\DuDu-PC\.gemini\antigravity\scratch\academic-articles-dashboard"

# Start the server (default port 8000)
python server.py
```
To run without automatically launching the browser, pass `--no-browser`:
```powershell
python server.py --no-browser
```

---

## 🌐 Web Hosting Guide

The dashboard is engineered with zero heavy dependencies (vanilla JavaScript, modern CSS3, and Tailwind CSS CDN), making it 100% portable for any static or dynamic web hosting platform:

### 1. GitHub Pages (Free & Instant)
1. Initialize a Git repository in this folder:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit of K.S. Chandra Academic Archive"
   ```
2. Create a new repository on [GitHub](https://github.com) (e.g. `ks-chandra-archive`).
3. Push your code:
   ```powershell
   git remote add origin https://github.com/<your-username>/ks-chandra-archive.git
   git branch -M main
   git push -u origin main
   ```
4. In GitHub repository **Settings** → **Pages**, select branch `main` and folder `/ (root)`. Click **Save**.
5. Your dashboard will be live at `https://<your-username>.github.io/ks-chandra-archive/`!

### 2. Netlify / Vercel
- **Netlify**: Drag and drop the `academic-articles-dashboard` folder directly onto [Netlify Drop](https://app.netlify.com/drop).
- **Vercel**: Run `vercel` in this directory or connect your GitHub repository.

### 3. Linux / VPS / Cloud Server (Nginx / Apache)
Place the files into `/var/www/html/` or your webroot, and enable byte-range requests for smooth PDF streaming.

---

## 📜 Academic Citations (Official Source Document)

1. **Brick structures from Eastern Vidarbha during 5th to 8th Century CE**:
   > “Brick structures from Eastern Vidarbha during 5th to 8th Century CE” - Kosala-XII, Directorate of Culture and Archaeology, Government of Chhattisgarh, Raipur, 2021: 197-206, ISSN 2229-4546.

2. **A Fragmentary Lajjā Gaurī Image from Brahmapuri, Dist. Chandrapur**:
   > ‘A Fragmentary Lajjā Gaurī Image from Brahmapuri, Dist. Chandrapur’ – Co Authored, Kosala-XI, Directorate of Culture and Archaeology, Government of Chhattisgarh, Raipur, 2020:134-143, ISSN: 2229-4546.

3. **Revisiting Vidarbha Megalithic Material Culture – Study of some Tools and Implements found from various Excavations in Vidarbha**:
   > ‘Revisiting Vidarbha Megalithic Material Culture – Study of some Tools and Implements found from various Excavations in Vidarbha’, ICON Journal of Archaeology and Culture, (An International Referred Research Journal) in honor of Prof. J.N. Pal, Wakankar Rock Art and Heritage Welfare Society, Bhopal in association with B.R. Publishing Corporation, Delhi, 2019: Vol-6, 191-206, ISSN:2347-7032.

4. **A Comparative Study of Material Culture found from Excavations at Bhokardan and Paunar**:
   > ‘A Comparative Study of Material Culture found from Excavations at Bhokardan and Paunar’, Human and Heritage: An Archaeological Spectrum of Asiatic Countries (Felicitation to Prof Ajith Kumar, Eds. Rajesh S V, Abhayan G S, Preeta Nayar and Ehsan Rahmath Elahi) (2 Vols) Volume No-I, Kerala University, 2019: 397-403, ISBN: 9788183153614.

5. **A Study of Some Celestial Events Missed by Ancient Indians**:
   > ‘A Study of Some Celestial Events Missed by Ancient Indians’, Aranava (Referred Peer Reviewed Journal) Vol-VIII, No.1, 2019: 73-92, ISSN 2320-0103.

6. **Some Historic Sites in Nagpur District- Present Status**:
   > ‘Some Historic Sites in Nagpur District- Present Status’, Aranava (Referred Peer Reviewed Journal) Vol-VII, No.2, 2018: 1-17, ISSN 2320-0103.

7. **A Vishnu Sculpture from Kelzar, District Wardha, Maharashtra**:
   > ‘A Vishnu Sculpture from Kelzar, District Wardha, Maharashtra’. –Heritage Journal of Multidisciplinary Studies in Archaeology, Vol.6, Kerala University, 2018: 813-819, ISSN 2347-5463.

8. **Paleolithic Tools in Nagpur: Recent Discovery**:
   > ‘Paleolithic Tools in Nagpur: Recent Discovery’, Aranava (Referred Peer Reviewed Journal) Vol-VII, No.1, 2018: 1-17, ISSN 2320-0103.

---

## 🏷️ Credits & Legal
**Created and Hosted by K.S.Chandra 2026.**

*All rights reserved. Copyright of original published articles belongs to their respective academic journals, societies, and book publishers. Articles are hosted for scholarly research, educational evaluation, and fair-use study.*
