const masterFonts = [
        {name: 'Heritage Serif (Georgia)', val: "'Georgia', serif"},
        {name: 'Classical Serif (Palatino)', val: "'Palatino Linotype', 'Book Antiqua', serif"},
        {name: 'Old Money (Times)', val: "'Times New Roman', serif"},
        {name: 'Elite Modern (Helvetica)', val: "'Helvetica Neue', Helvetica, Arial, sans-serif"},
        {name: 'Clean Tech (Segoe)', val: "'Segoe UI', Roboto, sans-serif"},
        {name: 'Sleek Sans (Verdana)', val: "'Verdana', sans-serif"}
    ];
    document.querySelectorAll('.uni-font').forEach(sel => {
        masterFonts.forEach(f => {
            let o = document.createElement('option'); o.value = f.val; o.innerText = f.name; sel.appendChild(o);
        });
    });
    let userLogo = "";
    let globalBgImg = "";
    let slideImages = { 1: "", 2: "", 3: "", 4: "", 5: "" };
    let renderTimeout;
    let slideTemplates = { 1: "", 2: "", 3: "", 4: "", 5: "" };
    let slideLayouts = { 1: "standard", 2: "standard", 3: "standard", 4: "standard", 5: "standard" };
   
const templateConfigs = {
        "": { name: "Standard", class: "", layout: "standard", showSub: true },
        "template-quote-hero": { name: "Quote Hero", class: "template-quote-hero", layout: "standard", showSub: false },
        "template-minimal": { name: "Minimal", class: "template-minimal", layout: "standard", showSub: false },
        "template-image-focus": { name: "Image Focus", class: "template-image-focus", layout: "bridge", showSub: true },
        "template-big-number": { name: "Big Number", class: "template-big-number", layout: "standard", showSub: true },
        "template-stats-grid": { name: "Stats Grid", class: "template-stats-grid", layout: "standard", showSub: true },
        "template-timeline": { name: "Timeline", class: "template-timeline", layout: "standard", showSub: true },
        "template-split-screen": { name: "Split Screen", class: "template-split-screen", layout: "standard", showSub: true },
        "template-centered-minimal": { name: "Centered Minimal", class: "template-centered-minimal", layout: "standard", showSub: true },
        "template-editorial": { name: "Editorial", class: "template-editorial", layout: "standard", showSub: true }
    };
   
const initialSlideContent = [
        "A standard [6% CPI] is a lie. Your retirement cost is split between lifestyle and healthcare.",
        "While groceries grow at 5%, Medical Inflation in India is hitting [14% p.a.].",
        "At 14%, your healthcare costs will **Double every 5 years**. Is your SIP keeping up?",
        "Traditional plans fail because they use **Average CPI**. You need [Liability Matching].",
        "The solution? __De-risk early__. Protect your base and secure your outcome today."
    ];

document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z') {
                e.preventDefault();
                if (historyIndex > 0) loadState(historyIndex - 1);
            } else if (e.key === 'y') {
                e.preventDefault();
                if (historyIndex < history.length - 1) loadState(historyIndex + 1);
            }
        }
    });

    function applyQuickTemplate(num) {
        const templateMap = {
            1: "", 2: "template-quote-hero", 3: "template-minimal", 4: "template-image-focus",
            5: "template-big-number", 6: "template-stats-grid", 7: "template-timeline",
            8: "template-split-screen", 9: "template-centered-minimal", 10: "template-editorial"
        };
       
        const demoContent = {
            2: { h1: '"The goal is not to be rich."', sub: 'The goal is to stay rich.', body: 'Through inflation-proof income and liability matching, KalpaKuber protects what matters most: your financial freedom.', align: 'center' },
            3: { h1: 'Healthcare Inflation: 14% p.a.', sub: '', body: 'While your SIP grows at 12%, medical costs are rising at 14%. Every year, you fall behind. Traditional planning ignores this split. KalpaKuber solves it.', align: 'left' },
            5: { h1: '14%', sub: 'Annual Healthcare Inflation in India', body: 'Your medical costs will DOUBLE every 5 years. Is your retirement plan accounting for this?', align: 'center' },
            6: { h1: 'The 4 Critical Gaps', sub: 'Traditional vs KalpaKuber', body: '₹50L Corpus @ 12% SIP\n\n₹1.2Cr Healthcare @ 14% Inflation\n\nGap: ₹70L Shortfall\n\nSolution: Liability Matching', align: 'left' }
        };
       
        document.querySelectorAll('.template-thumb').forEach(t => t.classList.remove('active'));
        document.getElementById(`quick-temp-${num}`).classList.add('active');
       
        const template = templateMap[num];
        for(let i=1; i<=5; i++) {
            slideTemplates[i] = template;
            const sel = document.getElementById(`template${i}`);
            if (sel) sel.value = template;
        }
       
        if(demoContent[num]) {
            document.getElementById('inH1').value = demoContent[num].h1;
            document.getElementById('inSub').value = demoContent[num].sub;
            document.getElementById('b1').value = demoContent[num].body;
            document.getElementById('inAlign').value = demoContent[num].align;
        }
       
        debounceRender();
        saveState();
    }

    function createSlideInputs() {
        const container = document.getElementById('slideConfigs');
        const templateOptions = `
            <option value="">Standard</option>
            <option value="template-quote-hero">Quote Hero</option>
            <option value="template-minimal">Minimal (No Subhead)</option>
            <option value="template-image-focus">Image Focus</option>
            <option value="template-big-number">Big Number</option>
            <option value="template-stats-grid">Stats Grid (2x2)</option>
            <option value="template-timeline">Timeline</option>
            <option value="template-split-screen">Split Screen</option>
            <option value="template-centered-minimal">Centered Minimal</option>
            <option value="template-editorial">Editorial (2-col)</option>
        `;
       
        const layoutOptions = `
            <option value="standard">Full Width Text</option>
            <option value="bridge">Split Bridge (Text + Visual)</option>
        `;
       
        for(let i=1; i<=5; i++) {
            container.innerHTML += `
                <div class="input-group" style="background: #151515; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
                    <strong>SLIDE ${i}</strong>
                    <button class="p-btn del-btn" style="float:right;" onclick="resetSlide(${i})">Reset Slide</button>
                    <label>🎨 Visual Template</label>
                    <select id="template${i}" onchange="updateSlideTemplate(${i})">${templateOptions}</select>
                   
                    <label>Visual Layout Mode</label>
                    <select id="layout${i}" onchange="updateSlideLayout(${i})">${layoutOptions}</select>
                   
                    <label>Watermark Impact Text</label>
                    <input type="text" id="wOvr${i}" value="IMPACT" oninput="debounceRender()">
                   
                    <label>Headline Override</label>
                    <textarea id="hOvr${i}" oninput="debounceRender()"></textarea>
                   
                    <label>Sub-Head Override</label>
                    <textarea id="sOvr${i}" oninput="debounceRender()"></textarea>
                   
                    <label>CTA Override</label>
                    <textarea id="ctaOvr${i}" placeholder="Global CTA used if empty" oninput="debounceRender()"></textarea>

                    <label>Alignment Controls (Granular)</label>
                    <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                        <div>
                            <label>Heading Align</label>
                            <select id="hAlign${i}" onchange="debounceRender()">
                                <option value="global" selected>Global</option>
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        <div>
                            <label>Subhead Align</label>
                            <select id="sAlign${i}" onchange="debounceRender()">
                                <option value="global" selected>Global</option>
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        <div>
                            <label>Body Align</label>
                            <select id="bAlign${i}" onchange="debounceRender()">
                                <option value="global" selected>Global</option>
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        <div>
                            <label>CTA Align</label>
                            <select id="ctaAlign${i}" onchange="debounceRender()">
                                <option value="global" selected>Global</option>
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                    </div>
                   
                    <label>Mode <span id="dens${i}" class="density-tag"></span></label>
                    <select id="m${i}" onchange="debounceRender()">
                        <option value="text">Standard Text</option>
                        <option value="table">Table (use | )</option>
                        <option value="verdict">Verdict (VS Split)</option>
                    </select>
                   
                    <textarea id="b${i}" oninput="updateSmartMetrics(${i})">${initialSlideContent[i-1] || ''}</textarea>
                    <span id="metric${i}" class="smart-metric"></span>
                   
                    <input type="file" id="slideUpload${i}" onchange="handleSlideImg(this, ${i})">
                    <button class="p-btn del-btn" onclick="clearImage('slide', ${i})">Clear Slide Img</button>
                </div>
            `;
        }
    }

    function resetSlide(n) {
        if (!confirm(`Reset slide ${n} to initial state?`)) return;
        document.getElementById(`template${n}`).value = "";
        document.getElementById(`layout${n}`).value = "standard";
        document.getElementById(`wOvr${n}`).value = "IMPACT";
        document.getElementById(`hOvr${n}`).value = "";
        document.getElementById(`sOvr${n}`).value = "";
        document.getElementById(`ctaOvr${n}`).value = "";
        document.getElementById(`hAlign${n}`).value = "global";
        document.getElementById(`sAlign${n}`).value = "global";
        document.getElementById(`bAlign${n}`).value = "global";
        document.getElementById(`ctaAlign${n}`).value = "global";
        document.getElementById(`m${n}`).value = "text";
        document.getElementById(`b${n}`).value = initialSlideContent[n-1] || "";
        slideTemplates[n] = "";
        slideLayouts[n] = "standard";
        slideImages[n] = "";
        document.getElementById(`slideUpload${n}`).value = "";
        debounceRender();
        saveState();
    }

    function updateSlideTemplate(i) {
        slideTemplates[i] = document.getElementById(`template${i}`).value;
        const config = templateConfigs[slideTemplates[i]];
        if(config && config.layout) {
            slideLayouts[i] = config.layout;
            document.getElementById(`layout${i}`).value = config.layout;
        }
        debounceRender();
        saveState();
    }

    function updateSlideLayout(i) {
        slideLayouts[i] = document.getElementById(`layout${i}`).value;
        debounceRender();
        saveState();
    }

    function clearImage(type, index) {
        if(type === 'logo') { userLogo = ""; document.getElementById('logoUpload').value = ""; }
        else if(type === 'globalBg') { globalBgImg = ""; document.getElementById('bgUpload').value = ""; }
        else if(type === 'slide') { slideImages[index] = ""; document.getElementById(`slideUpload${index}`).value = ""; }
        debounceRender();
        saveState();
    }

    function toggleSafeZone() {
        const zones = document.querySelectorAll('.safe-zone-overlay');
        zones.forEach(z => z.style.display = z.style.display === 'block' ? 'none' : 'block');
    }

    function harmonizeColors() {
        const primary = document.getElementById('inLineColor').value;
        document.getElementById('cH').value = primary;
        document.getElementById('cS').value = primary;
        document.getElementById('inCtaBg').value = primary;
        document.getElementById('cBrand').value = primary;
        document.getElementById('inSepColor1').value = primary;
        debounceRender();
        saveState();
    }

    function updateSmartMetrics(i) {
        const text = document.getElementById(`b${i}`).value;
        const words = text.trim().split(/\s+/).length;
        const chars = text.length;
        const readingTime = Math.ceil(words / 200 * 60);
        const readability = Math.min(100, Math.max(0, 100 - (chars / 10))).toFixed(0);
        document.getElementById(`metric${i}`).innerText = `Reading Time: ${readingTime}s | Readability: ${readability}/100`;
        debounceRender();
    }

    function getBrandKitDefaults(key) {
        let kit = { c1: "#c5a059", c2: "#f3e5ab", cH: "#c5a059", bg: "#021F2D", theme: "h_royal", fb: "'Segoe UI', sans-serif" };
        if(key === 'silver') {
            kit = { c1: "#C0C0C0", c2: "#E8E8E8", cH: "#C0C0C0", bg: "#0a0a0a", theme: "h_zari", fb: "'Palatino', serif" };
        } else if(key === 'deep_ocean') {
            kit = { c1: "#1a243a", c2: "#2563eb", cH: "#60a5fa", bg: "#021F2D", theme: "h_durbar", fb: "'Segoe UI', sans-serif" };
        } else if(key === 'vedic') {
            kit = { c1: "#065f46", c2: "#c5a059", cH: "#c5a059", bg: "#146b2e", theme: "h_mandala", fb: "'Georgia', serif" };
        } else if(key === 'ruby') {
            kit = { c1: "#991b1b", c2: "#f87171", cH: "#f87171", bg: "#450a0a", theme: "h_temple", fb: "'Impact', sans-serif" };
        } else if(key === 'minimal') {
            kit = { c1: "#d1d5db", c2: "#ffffff", cH: "#111827", bg: "#f9fafb", theme: "h_ivory", fb: "'Arial', sans-serif" };
        } else if(key === 'copper') {
            kit = { c1: "#7c2d12", c2: "#c5a059", cH: "#c5a059", bg: "#2d0a00", theme: "h_copper", fb: "'Times New Roman', serif" };
        } else if(key === 'slate') {
            kit = { c1: "#334155", c2: "#94a3b8", cH: "#f1f5f9", bg: "#0f172a", theme: "d_minimal", fb: "'Verdana', sans-serif" };
        } else if(key === 'rose') {
            kit = { c1: "#881337", c2: "#fb7185", cH: "#ffffff", bg: "#4c0519", theme: "h_silk", fb: "'Palatino', serif" };
        } else if(key === 'neon') {
            kit = { c1: "#22c55e", c2: "#000000", cH: "#22c55e", bg: "#000000", theme: "h_zari", fb: "'Trebuchet MS', sans-serif" };
        }
        return kit;
    }

    function loadBrandKit() {
        const key = document.getElementById('brandKitSelect').value;
        const kit = getBrandKitDefaults(key);
        document.getElementById('inLineColor').value = kit.c1;
        document.getElementById('inLineColor2').value = kit.c2;
        document.getElementById('cH').value = kit.cH;
        document.getElementById('inColor').value = kit.bg;
        document.getElementById('inTheme').value = kit.theme;
        document.getElementById('fB_Stack').value = kit.fb;
       
        if(key === 'minimal') {
            document.getElementById('cB').value = "#111827";
            document.getElementById('cS').value = "#374151";
            document.getElementById('inCtaBg').value = "#e5e7eb";
            document.getElementById('inCtaTxt').value = "#111827";
            document.getElementById('cBrand').value = "#111827";
        } else {
            document.getElementById('cB').value = "#ffffff";
            document.getElementById('cS').value = kit.cH;
            document.getElementById('inCtaBg').value = kit.c1;
            document.getElementById('inCtaTxt').value = "#ffffff";
            document.getElementById('cBrand').value = kit.cH;
        }
        debounceRender();
        saveState();
    }

    function applyTemplate() {
        const type = document.getElementById('templateMaster').value;
        if(type === 'investment_table') {
            document.getElementById('m1').value = 'table';
            document.getElementById('b1').value = "ASSET | RETURNS | RISK \nFixed Deposit | 7.0% | Low \nEquity MF | 12.0% | High \nKalpaKuber | [Targeted] | Optimized";
        } else if(type === 'behavioral_leak') {
            document.getElementById('b1').value = "A [!!₹500 Leak!!] per day is not just coffee. \nOver 20 years, it is **₹1.2 Crores** lost. \nStop the drain today.";
        } else if(type === 'impact_quote') {
            document.getElementById('inAlign').value = 'center';
            document.getElementById('b1').value = '"The goal is not to be rich. \nThe goal is to stay rich through ++Inflation Proof++ income."';
        } else if(type === 'verdict_demo') {
            document.getElementById('m1').value = 'verdict';
            document.getElementById('b1').value = "Traditional plans ignore !!14% Inflation!!. VS KalpaKuber uses ++Liability Matching++ to secure your outcome.";
        }
        updateSmartMetrics(1);
        debounceRender();
        saveState();
    }

    function handleStaticImg(input, type) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if(type === 'logo') userLogo = e.target.result;
            debounceRender();
            saveState();
        };
        reader.readAsDataURL(input.files[0]);
    }

    function handleGlobalBg(input) {
        const reader = new FileReader();
        reader.onload = (e) => {
            globalBgImg = e.target.result;
            debounceRender();
            saveState();
        };
        reader.readAsDataURL(input.files[0]);
    }

    function handleSlideImg(input, index) {
        const reader = new FileReader();
        reader.onload = (e) => {
            slideImages[index] = e.target.result;
            debounceRender();
            saveState();
        };
        reader.readAsDataURL(input.files[0]);
    }

    function toggleUI() {
        document.getElementById('ui').classList.toggle('minimized');
    }

    function applyPlatform() {
        const p = document.getElementById('inPlatform').value;
        const root = document.documentElement;
        if(p === 'whatsapp') {
            root.style.setProperty('--card-w', '1080px');
            root.style.setProperty('--card-h', '1920px');
            root.style.setProperty('--b-lh', '1.55');
        }
        else if(p === 'twitter') {
            root.style.setProperty('--card-w', '1200px');
            root.style.setProperty('--card-h', '675px');
        }
        else if(p === 'linkedin') {
            root.style.setProperty('--card-w', '1080px');
            root.style.setProperty('--card-h', '1080px');
        }
        else {
            root.style.setProperty('--card-w', '1080px');
            root.style.setProperty('--card-h', '1350px');
        }
        debounceRender();
        saveState();
    }

    function checkDensity(text) {
        const c = text.length;
        if(c < 75) return {l: 'LOW', c: 'density-low'};
        if(c < 185) return {l: 'OK', c: 'density-ok'};
        return {l: 'HIGH', c: 'density-high'};
    }

    function process(text, mode) {
        if (!text) return "";
        let html = String(text);
        html = html
            .replace(/!!(.*?)!!/g, '<r>$1</r>')
            .replace(/\+\+(.*?)\+\+/g, '<g>$1</g>')
            .replace(/\?\?(.*?)\?\?/g, '<o>$1</o>')
            .replace(/@@(.*?)@@/g, '<b>$1</b>');
        const redList = ["Risk", "Leak", "Tax", "Inflation", "Loss", "Debt", "Shortfall"];
        const greenList = ["Growth", "Kuber", "Safety", "Income", "Profit", "SIP", "Secure", "Outcome"];
        const orangeList = ["Warning", "Alert", "Volatility", "Change"];
        const blueList = ["ARN", "SEBI", "Metric", "Calculator", "Targeted"];
        redList.forEach(w => { html = html.replace(new RegExp(`\\b${w}\\b`, 'gi'), `<r>${w}</r>`); });
        greenList.forEach(w => { html = html.replace(new RegExp(`\\b${w}\\b`, 'gi'), `<g>${w}</g>`); });
        orangeList.forEach(w => { html = html.replace(new RegExp(`\\b${w}\\b`, 'gi'), `<o>${w}</o>`); });
        blueList.forEach(w => { html = html.replace(new RegExp(`\\b${w}\\b`, 'gi'), `<b>${w}</b>`); });
        html = html
            .replace(/\*\*(.*?)\*\*/g, '<span class="bold">$1</span>')
            .replace(/__(.*?)__/g, '<span style="font-style:italic">$1</span>')
            .replace(/\[(.*?)\]/g, '<span class="shock">$1</span>');
        if (mode === 'table' && text.includes('|')) {
            const lines = text.trim().split('\n');
            let tableHtml = '<table class="kk-table">';
            lines.forEach((line, idx) => {
                const cells = line.split('|').map(c => c.trim());
                tableHtml += '<tr>';
                cells.forEach(cell => {
                    let cellContent = process(cell, 'text');
                    tableHtml += idx === 0 ? `<th>${cellContent}</th>` : `<td>${cellContent}</td>`;
                });
                tableHtml += '</tr>';
            });
            tableHtml += '</table>';
            return tableHtml;
        }
        if (mode === 'verdict' && text.includes('VS')) {
            const parts = html.split('VS');
            return `
                <div class="verdict-container">
                    <div class="verdict-box verdict-old">
                        <div class="verdict-label" style="color:#ff4d4d">The Risk</div>
                        <div style="font-size:0.95em">${parts[0].trim()}</div>
                    </div>
                    <div class="verdict-box verdict-new">
                        <div class="verdict-label" style="color:#22c55e">KalpaKuber</div>
                        <div style="font-size:0.95em">${parts[1].trim()}</div>
                    </div>
                </div>`;
        }
        return html;
    }

    function preset(action, id) {
        const key = `KK_FullState_V48_${id}`;
        const fields = ['inH1','inSub','inColor','fH','fB_Stack','fS','sH','sB','sS','inPlatform','inTheme','inTrustColor','inLineColor','inLineColor2','inBorderW','inLineW'];
        if(action === 'save') {
            const state = {};
            fields.forEach(f => state[f] = document.getElementById(f)?.value);
            state.slideTemplates = { ...slideTemplates };
            state.slideLayouts = { ...slideLayouts };
            localStorage.setItem(key, JSON.stringify(state));
            alert("Preset Saved");
            saveState();
        } else {
            const raw = localStorage.getItem(key);
            if(!raw) { alert("No preset found"); return; }
            const state = JSON.parse(raw);
            fields.forEach(f => {
                const el = document.getElementById(f);
                if (el) el.value = state[f];
            });
            if(state.slideTemplates) {
                slideTemplates = { ...state.slideTemplates };
                Object.keys(slideTemplates).forEach(i => {
                    const sel = document.getElementById(`template${i}`);
                    if (sel) sel.value = slideTemplates[i];
                });
            }
            if(state.slideLayouts) {
                slideLayouts = { ...state.slideLayouts };
                Object.keys(slideLayouts).forEach(i => {
                    const sel = document.getElementById(`layout${i}`);
                    if (sel) sel.value = slideLayouts[i];
                });
            }
            applyPlatform();
            debounceRender();
            saveState();
        }
    }

    function hexToRgba(hex, opacity) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    function debounceRender() {
        clearTimeout(renderTimeout);
        renderTimeout = setTimeout(() => {
            render();
            saveState();
        }, 120);
    }

    // ───────────────────────────────────────────────
    // NEW: Comparison Mode logic
    // ───────────────────────────────────────────────

    function toggleComparison() {
        const enabled = document.getElementById('compareEnabled').checked;
        document.getElementById('compareControls').style.display = enabled ? 'block' : 'none';
        document.getElementById('comparisonView').style.display = enabled ? 'block' : 'none';
        if (enabled) renderComparison();
    }

    function updateSplit(value) {
        const handle = document.querySelector('.slider-handle');
        if (handle) {
            handle.style.left = value + '%';
        }
    }

    function renderComparison() {
        const container = document.getElementById('compareContainer');
        if (!container) return;

        container.innerHTML = '';

        const slideA = document.getElementById('compareA').value;
        const slideB = document.getElementById('compareB').value;

        const cardA = document.getElementById(`card-${slideA}`);
        const cardB = document.getElementById(`card-${slideB}`);

        if (!cardA || !cardB) return;

        const wrapA = document.createElement('div');
        wrapA.className = 'comparison-card-wrapper';
        wrapA.innerHTML = '<div class="comparison-label">A (Before)</div>';
        wrapA.appendChild(cardA.cloneNode(true));

        const wrapB = document.createElement('div');
        wrapB.className = 'comparison-card-wrapper';
        wrapB.style.position = 'relative';
        wrapB.innerHTML = '<div class="comparison-label">B (After)</div>';
        const cloneB = cardB.cloneNode(true);
        wrapB.appendChild(cloneB);

        container.appendChild(wrapA);
        container.appendChild(wrapB);

        // Add overlay slider effect
        const sliderHtml = `
            <div class="before-after-container">
                <div class="before-after-slider">
                    <div class="slider-handle" style="left:50%;"></div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', sliderHtml);

        // Make handle draggable
        const handle = container.querySelector('.slider-handle');
        let isDragging = false;

        handle.addEventListener('mousedown', () => { isDragging = true; });
        document.addEventListener('mouseup', () => { isDragging = false; });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
            handle.style.left = percent + '%';
            document.getElementById('splitPos').value = percent;
        });
    }

    // ───────────────────────────────────────────────
    // NEW: Smart Defaults
    // ───────────────────────────────────────────────

    function applySmartDefaults(i) {
        const mode = document.getElementById(`m${i}`)?.value || 'text';
        const template = slideTemplates[i] || '';
        const body = document.getElementById(`b${i}`)?.value || '';

        // 1. Table or pipe-separated content → slightly larger body text
        if (mode === 'table' || body.includes('|')) {
            const current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--b-size')) || 2;
            document.documentElement.style.setProperty('--b-size', (current * 1.1) + 'rem');
        }

        // 2. Verdict mode → suggest center alignment (apply to CTA box for visibility)
        if (mode === 'verdict') {
            const ctaBox = document.querySelector(`#card-${i} .cta-box`);
            if (ctaBox) {
                ctaBox.style.textAlign = 'center';
                ctaBox.style.borderLeft = 'none';
                ctaBox.style.borderRight = 'none';
                ctaBox.style.borderTop = '4px solid var(--line-color)';
            }
        }

        // 3. Big number template → make headline bolder + bigger
        if (template === 'template-big-number') {
            const headline = document.querySelector(`#card-${i} .h-main`);
            if (headline) {
                headline.style.fontWeight = '900';
                headline.style.textShadow = '0 0 12px rgba(197,160,89,0.5)';
            }
        }
    }

    function resolveAlignValue(value, fallback) {
        if (!value || value === 'global') return fallback;
        return value;
    }

    function setUiMode(mode) {
        document.body.classList.toggle('ui-mode-basic', mode === 'basic');
        saveState();
    }

    function initControlSections() {
        const controls = document.getElementById('ui');
        if (!controls) return;
        const separators = Array.from(controls.querySelectorAll('.control-sep'));
        const basicKeywords = ['QUICK APPLY', 'BRAND KIT', 'SLIDE CONTENT'];
        separators.forEach((sep) => {
            const section = document.createElement('div');
            section.className = 'section';
            const label = sep.textContent || '';
            const isBasic = basicKeywords.some((keyword) => label.includes(keyword));
            section.classList.add(isBasic ? 'basic-only' : 'advanced-only');
            controls.insertBefore(section, sep);
            let current = sep;
            while (current && current.classList && !current.classList.contains('section')) {
                const next = current.nextElementSibling;
                section.appendChild(current);
                if (!next || next.classList.contains('control-sep') || next === section) break;
                current = next;
            }
        });
    }

    function render() {
        try {
            appState = collectState();
            const stage = document.getElementById('stage');
            const phone = document.getElementById('phone-slider');
            const root = document.documentElement;
            const platform = document.getElementById('inPlatform').value;
            const brandKitKey = document.getElementById('brandKitSelect').value;
            const brandKit = getBrandKitDefaults(brandKitKey);
            const bgOpacity = document.getElementById('bgOpacityInput').value;
            const trustBadgeStatus = document.getElementById('inTrust').value;
            const logoPos = document.getElementById('inLogoPos').value;
            const logoScale = document.getElementById('inLogoScale').value;
            const headingTopSpacing = document.getElementById('inHeadingTopSpacing').value;
            const headingBottomSpacing = document.getElementById('inHeadingBottomSpacing').value;
            const isWide = platform === 'twitter';
            const sepMode = document.getElementById('inSepMode').value;
            root.style.setProperty('--sep-color-1', document.getElementById('inSepColor1').value);
            root.style.setProperty('--sep-color-2', document.getElementById('inSepColor2').value);
            root.style.setProperty('--sep-thickness', document.getElementById('inSepThick').value + 'px');
            root.style.setProperty('--sep-width', document.getElementById('inSepWidth').value + '%');
            root.style.setProperty('--sep-margin', '15px');
            root.style.setProperty('--side-line-color', document.getElementById('inSideLineColor').value);
            root.style.setProperty('--side-line-width', document.getElementById('inSideLineWidth').value + 'px');
            root.style.setProperty('--horiz-line-color', document.getElementById('inHorizLineColor').value);
            root.style.setProperty('--horiz-line-height', document.getElementById('inHorizLineHeight').value + 'px');
            root.style.setProperty('--corner-color', document.getElementById('inCornerColor').value);
            root.style.setProperty('--corner-weight', document.getElementById('inCornerWeight').value + 'px');
            root.style.setProperty('--logo-scale', logoScale);
            root.style.setProperty('--h-top-margin', headingTopSpacing + 'px');
            root.style.setProperty('--h-bottom-margin', headingBottomSpacing + 'px');
            const bgOpac = document.getElementById('inBgOpac').value;
            const waterOpac = document.getElementById('inWaterOpac').value;
            root.style.setProperty('--watermark-opacity', waterOpac);
            const gapHS = document.getElementById('inGapHS').value;
            const gapSB = document.getElementById('inGapSB').value;
            root.style.setProperty('--gap-h-s', gapHS + 'px');
            root.style.setProperty('--gap-s-b', gapSB + 'px');
            root.style.setProperty('--h-font', document.getElementById('fH').value);
            root.style.setProperty('--h-color', document.getElementById('cH').value);
            root.style.setProperty('--h-size', document.getElementById('sH').value + 'rem');
            root.style.setProperty('--s-font', document.getElementById('fS').value);
            root.style.setProperty('--s-color', document.getElementById('cS').value);
            root.style.setProperty('--s-size', document.getElementById('sS').value + 'rem');
            root.style.setProperty('--b-font', document.getElementById('fB_Stack').value);
            root.style.setProperty('--b-color', document.getElementById('cB').value);
           
            let bodySize = parseFloat(document.getElementById('sB').value);
            if(platform === 'whatsapp') bodySize *= 0.9;
            root.style.setProperty('--b-size', bodySize + 'rem');
            root.style.setProperty('--b-lh', document.getElementById('lhB').value);
           
            const ctaBgHex = document.getElementById('inCtaBg').value;
            const ctaOpacity = document.getElementById('inCtaOpac').value;
            const ctaBlur = document.getElementById('inCtaBlur').value;
            root.style.setProperty('--cta-bg', hexToRgba(ctaBgHex, ctaOpacity));
            root.style.setProperty('--cta-blur', `blur(${ctaBlur}px)`);
           
            root.style.setProperty('--cta-txt', document.getElementById('inCtaTxt').value);
            root.style.setProperty('--cta-size', document.getElementById('sCTA').value + 'rem');
            root.style.setProperty('--brand-color', document.getElementById('cBrand').value);
            root.style.setProperty('--brand-size', document.getElementById('sBrand').value + 'rem');
            root.style.setProperty('--line-color', document.getElementById('inLineColor').value || brandKit.c1);
            root.style.setProperty('--line-color-2', document.getElementById('inLineColor2').value || brandKit.c2);
            root.style.setProperty('--trust-color', document.getElementById('inTrustColor').value);
            const globalAlign = document.getElementById('inAlign').value;
            root.style.setProperty('--text-align', globalAlign);
            root.style.setProperty('--border-width-main', document.getElementById('inBorderW').value + 'px');
            root.style.setProperty('--line-weight', document.getElementById('inLineW').value + 'px');
            const currentScale = platform === 'twitter' ? 0.3 : 0.33;
            const globalH1 = document.getElementById('inH1').value;
            const globalSub = document.getElementById('inSub').value;
            const globalCtaTxt = document.getElementById('ctaVal').value;
            const brandTxt = document.getElementById('brandVal').value;
            const brandTxtWithVersion = `${brandTxt} | v${APP_VERSION}`;
            const bgColorHex = document.getElementById('inColor').value;
            const bgColorFinal = hexToRgba(bgColorHex, bgOpac);
            const themeClass = document.getElementById('inTheme').value || brandKit.theme;
            const align = document.getElementById('inAlign').value;
            const dividerClass = sepMode === 'dual' ? 'kk-dual-sep' : 'divider';
            const d1 = document.getElementById('line1').checked ? `<div class="${dividerClass}"></div>` : '';
            const d2 = document.getElementById('line2').checked ? `<div class="${dividerClass}"></div>` : '';
            const d3 = document.getElementById('line3').checked ? `<div class="${dividerClass}"></div>` : '';
            const d4 = document.getElementById('line4').checked ? `<div class="${dividerClass}"></div>` : '';
            stage.innerHTML = '';
            phone.innerHTML = '';
            for(let i=1; i<=5; i++) {
                const insightText = document.getElementById(`b${i}`).value;
                const insightMode = document.getElementById(`m${i}`).value;
                const hOvr = document.getElementById(`hOvr${i}`).value;
                const sOvr = document.getElementById(`sOvr${i}`).value;
                const wOvr = document.getElementById(`wOvr${i}`).value;
                const ctaOvr = document.getElementById(`ctaOvr${i}`).value || globalCtaTxt;
               
                const slideTemplate = slideTemplates[i] || "";
                const templateConfig = templateConfigs[slideTemplate] || templateConfigs[""];
                const templateClass = templateConfig.class;
                const showSubhead = templateConfig.showSub;
                const layoutMode = slideLayouts[i] || "standard";
               
                const dData = checkDensity(insightText);
                const dTag = document.getElementById(`dens${i}`);
                if(dTag) {
                    dTag.innerText = dData.l;
                    dTag.className = 'density-tag ' + dData.c;
                }
                const autoSize = insightText.length > 250 ? bodySize * 0.8 : bodySize;
                const slideImg = slideImages[i];
               
                const wrap = document.createElement('div');
                wrap.className = 'card-wrap';
                wrap.style.position = 'relative';
                const logoContent = userLogo
                    ? `<img src="${userLogo}" style="max-height:80px;">`
                    : `<div style="font-family:serif; font-weight:bold; color:var(--line-color); font-size:1.5rem;">KALPAKUBER</div>`;
                const floatingLogoHtml = `<div class="logo-container pos-${logoPos}">${logoContent}</div>`;
               
                const headingAlign = resolveAlignValue(document.getElementById(`hAlign${i}`)?.value, globalAlign);
                const subAlign = resolveAlignValue(document.getElementById(`sAlign${i}`)?.value, globalAlign);
                const bodyAlign = resolveAlignValue(document.getElementById(`bAlign${i}`)?.value, globalAlign);
                const ctaAlign = resolveAlignValue(document.getElementById(`ctaAlign${i}`)?.value, globalAlign);

                let processedBody = `<div class="body-p" style="font-size: ${autoSize}rem; text-align: ${bodyAlign};">${process(insightText, insightMode)}</div>`;
               
                let contentLayout = processedBody;
                if(layoutMode === 'bridge' && insightMode !== 'verdict') {
                    contentLayout = `<div class="bridge-container">
                            <div class="bridge-text">${processedBody}</div>
                            <div class="bridge-visual">
                                ${slideImg ? `<img src="${slideImg}">` : '<span style="color:var(--line-color); opacity:0.3; font-size:0.8rem">CHART / IMAGE</span>'}
                            </div>
                        </div>`;
                }

                // ──────────────────────────────
                // NEW: Apply smart defaults per slide
                // ──────────────────────────────
                applySmartDefaults(i);

                const slideHtml = `
                    <div class="export-card ${themeClass} ${templateClass}" id="card-${i}" style="background-color: ${bgColorFinal}">
                        <div class="rail rail-v r-left"></div>
                        <div class="rail rail-v r-right"></div>
                        <div class="rail rail-h r-top"></div>
                        <div class="rail rail-h r-bottom"></div>
                        <div class="corner-decor c-tl"></div>
                        <div class="corner-decor c-tr"></div>
                        <div class="corner-decor c-bl"></div>
                        <div class="corner-decor c-br"></div>
                        <div class="safe-zone-overlay"></div>
                        <div class="watermark-overlay">${wOvr}</div>
                        ${floatingLogoHtml}
                        ${globalBgImg ? `<div class="card-bg-overlay" style="opacity: ${bgOpacity}"><img src="${globalBgImg}"></div>` : ''}
                        <div class="top-section"></div>
                        <div class="middle-content-area">
                            <div class="head-stack">
                                ${!isWide ? d1 : ''}
                                <h1 class="h-main" style="text-align: ${headingAlign};">${process(hOvr || globalH1, 'text')}</h1>
                                ${!isWide ? d2 : ''}
                                ${showSubhead ? `<div class="h-context" style="text-align: ${subAlign};">${process(sOvr || globalSub, 'text')}</div>` : ''}
                                ${!isWide && showSubhead ? d3 : ''}
                            </div>
                            ${contentLayout}
                        </div>
                        <div class="bottom-wrap">
                            ${d4}
                            <div class="cta-box" style="${ctaAlign === 'center' ? 'border-left:none; border-bottom:4px solid var(--line-color); text-align:center' : ctaAlign === 'right' ? 'border-left:none; border-right:5px solid var(--line-color); text-align:right' : ''}text-align:${ctaAlign};">
                                <div class="cta-text">${process(ctaOvr, 'text')}</div>
                            </div>
                            <div class="branding">${brandTxtWithVersion}</div>
                            ${trustBadgeStatus === 'show' ? `<div class="trust-badge" style="text-align:${align}">ARN 314916 | AMFI Registered Mutual Fund Distributor & INSURANCE AGENT CODE: 0275563G </div>` : ''}
                        </div>
                    </div>`;
                wrap.innerHTML = `<button class="dl-btn" onclick="exportCard('card-${i}')">Download PNG ${i}</button>${slideHtml}`;
                stage.appendChild(wrap);
               
                const pWrap = document.createElement('div');
                pWrap.className = 'phone-slide';
                pWrap.style.transform = `scale(${currentScale})`;
                pWrap.innerHTML = slideHtml;
                phone.appendChild(pWrap);
            }

            // After all cards are rendered → update comparison if enabled
            if (document.getElementById('compareEnabled').checked) {
                setTimeout(renderComparison, 100);
            }

        } catch(e) {
            console.error('Render error:', e);
            alert('Render failed: ' + e.message);
        }
    }

    initControlSections();
    createSlideInputs();
    initializeState();
    render();
    saveState(); // initial state saved
    toggleExportOnlyMode();
    setUiMode(document.getElementById('uiMode').value);

    let previewIdx = 0;
    resumePreview();
