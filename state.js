const APP_VERSION = '86.1';
const featureFlags = {
    comparison: true,
    phonePreview: true,
    exportOnlyMode: true,
    densityMetrics: true,
    complianceLock: true
};

let appState = null;

let history = [];
let historyIndex = -1;
const MAX_HISTORY = 12;

function setVersionUI() {
    document.title = `KalpaKuber v${APP_VERSION} | Complete 10 Templates + All Features`;
    const badge = document.getElementById('versionBadge');
    if (badge) badge.innerText = `v${APP_VERSION}`;
}

function applyFeatureFlags() {
    const comparison = document.getElementById('comparisonView');
    if (comparison && !featureFlags.comparison) comparison.style.display = 'none';

    const preview = document.querySelector('.preview-phone');
    if (preview && !featureFlags.phonePreview) preview.style.display = 'none';

    const exportOnly = document.getElementById('exportOnlyMode');
    if (exportOnly && !featureFlags.exportOnlyMode) {
        exportOnly.value = 'off';
        exportOnly.disabled = true;
    }
}

function setExportOnlyActive(active) {
    document.body.classList.toggle('export-only-active', active);
}

function toggleExportOnlyMode() {
    const select = document.getElementById('exportOnlyMode');
    const isOn = select && select.value === 'on';
    setExportOnlyActive(isOn);
    saveState();
}

function collectState() {
    const inputs = {};
    document.querySelectorAll('#ui input, #ui select, #ui textarea').forEach(el => {
        if (el.id) inputs[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    return {
        inputs,
        slideTemplates: { ...slideTemplates },
        slideLayouts: { ...slideLayouts },
        slideImages: { ...slideImages },
        userLogo,
        globalBgImg
    };
}

function saveState() {
    const state = collectState();
    history = history.slice(0, historyIndex + 1);
    history.push(state);
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
    appState = state;
}

function loadState(idx) {
    if (idx < 0 || idx >= history.length) return;
    const state = history[idx];
    historyIndex = idx;
    Object.entries(state.inputs).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.type === 'checkbox') el.checked = val;
        else el.value = val;
    });
    slideTemplates = { ...state.slideTemplates };
    slideLayouts = { ...state.slideLayouts };
    slideImages = { ...state.slideImages };
    userLogo = state.userLogo || '';
    globalBgImg = state.globalBgImg || '';
    Object.keys(slideTemplates).forEach(i => {
        const sel = document.getElementById(`template${i}`);
        if (sel) sel.value = slideTemplates[i];
    });
    Object.keys(slideLayouts).forEach(i => {
        const sel = document.getElementById(`layout${i}`);
        if (sel) sel.value = slideLayouts[i];
    });
    render();
    toggleExportOnlyMode();
    appState = state;
}

function initializeState() {
    setVersionUI();
    applyFeatureFlags();
    appState = collectState();
}
