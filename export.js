async function waitForImages(element) {
        const images = Array.from(element.querySelectorAll('img'));
        if (images.length === 0) return;
        await Promise.all(images.map((img) => {
            if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
            if (img.decode) {
                return img.decode().catch(() => undefined);
            }
            return new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            });
        }));
    }

    async function waitForFonts() {
        if (document.fonts && document.fonts.ready) {
            try {
                await document.fonts.ready;
            } catch (err) {
                console.warn('Font readiness check failed:', err);
            }
        }
    }

    async function waitForNextFrame() {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }

    async function forceRedraw(element) {
        if (!element) return;
        const prevTransform = element.style.transform;
        element.style.transform = `${prevTransform ? prevTransform + ' ' : ''}translateZ(0)`;
        void element.offsetHeight;
        await waitForNextFrame();
        element.style.transform = prevTransform;
        void element.offsetHeight;
    }

    async function prepareForCapture(el) {
        await waitForFonts();
        await waitForImages(el);
        await forceRedraw(el);
        await waitForNextFrame();
    }

    let previewTimer = null;
    let isExporting = false;
    let cancelExportRequested = false;

    function pausePreview() {
        if (previewTimer) {
            clearInterval(previewTimer);
            previewTimer = null;
        }
    }

    function resumePreview() {
        if (!previewTimer) {
            previewTimer = setInterval(() => {
                const slider = document.getElementById('phone-slider');
                if(slider) {
                    previewIdx = (previewIdx + 1) % 5;
                    slider.style.transform = `translateX(-${previewIdx * 20}%)`;
                }
            }, 3800);
        }
    }

    function getExportScale() {
        const select = document.getElementById('exportQuality');
        const raw = select ? Number(select.value) : 3;
        return Number.isFinite(raw) ? raw : 3;
    }

    function showExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) modal.classList.add('active');
    }

    function hideExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) modal.classList.remove('active');
    }

    function updateExportModal(step, total, label) {
        const status = document.getElementById('exportStatus');
        const bar = document.getElementById('exportProgressBar');
        if (status) status.innerText = label || `Exporting ${step} of ${total}...`;
        if (bar) {
            const pct = total > 0 ? Math.min(100, Math.round((step / total) * 100)) : 0;
            bar.style.width = `${pct}%`;
        }
    }

    function cancelExport() {
        cancelExportRequested = true;
        updateExportModal(0, 1, 'Cancelling export...');
    }

    function getExportClone(el) {
        const sandbox = document.getElementById('exportSandbox');
        if (!sandbox) return el;
        sandbox.innerHTML = '';
        const clone = el.cloneNode(true);
        clone.id = `export-${el.id}`;
        clone.classList.add('export-clone');
        if (featureFlags && featureFlags.complianceLock) {
            let badge = clone.querySelector('.trust-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'trust-badge';
                badge.innerText = 'ARN 314916 | AMFI Registered Mutual Fund Distributor & INSURANCE AGENT CODE: 0275563G';
                const bottomWrap = clone.querySelector('.bottom-wrap');
                if (bottomWrap) bottomWrap.appendChild(badge);
            }
            if (badge) {
                badge.style.display = 'block';
                badge.classList.add('locked');
            }
        }
        if (document.getElementById('exportOnlyMode')?.value === 'on') {
            clone.querySelectorAll('.safe-zone-overlay').forEach((node) => node.remove());
        }
        sandbox.appendChild(clone);
        return clone;
    }

    async function startExport(totalSlides = 1, label = 'Preparing export...') {
        if (isExporting) return false;
        isExporting = true;
        cancelExportRequested = false;
        pausePreview();
        showExportModal();
        updateExportModal(0, totalSlides, label);
        return true;
    }

    function finishExport() {
        isExporting = false;
        cancelExportRequested = false;
        resumePreview();
        hideExportModal();
    }

    async function captureCard(el, scaleValue) {
        const clone = getExportClone(el);
        await prepareForCapture(clone);
        const canvas = await html2canvas(clone, {
            scale: scaleValue,
            useCORS: true,
            allowTaint: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: clone.scrollWidth,
            windowHeight: clone.scrollHeight,
            backgroundColor: null,
            onclone: (clonedDoc) => {
                // Copy all CSS variables from root
                const originalRoot = document.documentElement;
                const clonedRoot = clonedDoc.documentElement;
                const style = window.getComputedStyle(originalRoot);
                for (let i = 0; i < style.length; i++) {
                    const name = style[i];
                    if (name.startsWith('--')) {
                        const value = style.getPropertyValue(name);
                        clonedRoot.style.setProperty(name, value);
                    }
                }
                // Also force background on the card itself
                const clonedCard = clonedDoc.getElementById(clone.id);
                if (clonedCard) {
                    clonedCard.style.backgroundColor = window.getComputedStyle(el).backgroundColor;
                }
            }
        });
        const sandbox = document.getElementById('exportSandbox');
        if (sandbox) sandbox.innerHTML = '';
        return canvas;
    }

    async function exportCard(id) {
        try {
            if (!(await startExport(1, 'Preparing PNG export...'))) return;
            const el = document.getElementById(id);
            if(!el) throw new Error('Card element not found');
            const scaleValue = getExportScale();
            updateExportModal(1, 1, 'Rendering PNG...');
            const canvas = await captureCard(el, scaleValue);
           
            const link = document.createElement('a');
            link.download = `KalpaKuber-${id.replace('card-','slide-')}.png`;
            link.href = canvas.toDataURL("image/png", 1.0);
            link.click();
            canvas.width = 0;
            canvas.height = 0;
        } catch (err) {
            console.error('Export error:', err);
            if (err && err.message === 'Export canceled by user') {
                updateExportModal(0, 1, 'Export canceled.');
            } else {
                alert("Export failed: " + err.message);
            }
        } finally {
            finishExport();
        }
    }

    async function exportAllPDF(btn) {
        try {
            const totalSlides = 5;
            if (!(await startExport(totalSlides, 'Preparing PDF export...'))) return;
            const { jsPDF } = window.jspdf;
            if(!jsPDF) throw new Error('jsPDF library not loaded');
            const pdf = new jsPDF('p', 'pt', [1080, 1350]);
            const buttonEl = btn || document.activeElement;
            const originalText = buttonEl ? buttonEl.innerText : '';
            if (buttonEl) buttonEl.innerText = "PREPARING PDF...";
           
            await waitForNextFrame();
           
            const scaleValue = getExportScale();
            for (let i = 1; i <= totalSlides; i++) {
                if (cancelExportRequested) throw new Error('Export canceled by user');
                const el = document.getElementById(`card-${i}`);
                if (!el) continue;
                updateExportModal(i, totalSlides, `Rendering PDF ${i}/${totalSlides}...`);
                const canvas = await captureCard(el, scaleValue);
                const imgData = canvas.toDataURL('image/jpeg', 0.92);
                if (i > 1) pdf.addPage([1080, 1350], 'p');
                pdf.addImage(imgData, 'JPEG', 0, 0, 1080, 1350);
                canvas.width = 0;
                canvas.height = 0;
            }
            pdf.save("KalpaKuber_Deck.pdf");
            if (buttonEl) buttonEl.innerText = originalText;
        } catch(e) {
            console.error('PDF export error:', e);
            if (e && e.message === 'Export canceled by user') {
                updateExportModal(0, 1, 'Export canceled.');
            } else {
                alert('PDF export failed: ' + e.message);
            }
        } finally {
            finishExport();
        }
    }

    async function exportAll(btn) {
        try {
            const totalSlides = 5;
            if (!(await startExport(totalSlides, 'Preparing batch export...'))) return;
            const buttonEl = btn || document.activeElement;
            const originalText = buttonEl ? buttonEl.innerText : '';
            if (buttonEl) buttonEl.innerText = "EXPORTING...";
           
            const scaleValue = getExportScale();
            for(let i=1; i<=totalSlides; i++) {
                if (cancelExportRequested) throw new Error('Export canceled by user');
                if (buttonEl) buttonEl.innerText = `EXPORTING ${i}/${totalSlides}...`;
                updateExportModal(i, totalSlides, `Rendering PNG ${i}/${totalSlides}...`);
                const el = document.getElementById(`card-${i}`);
                if (!el) continue;
                const canvas = await captureCard(el, scaleValue);
                const link = document.createElement('a');
                link.download = `KalpaKuber-slide-${i}.png`;
                link.href = canvas.toDataURL("image/png", 1.0);
                link.click();
                canvas.width = 0;
                canvas.height = 0;
                await new Promise(r => setTimeout(r, 3000));
            }
           
            if (buttonEl) buttonEl.innerText = originalText;
        } catch(e) {
            console.error('Batch export error:', e);
            if (e && e.message === 'Export canceled by user') {
                updateExportModal(0, 1, 'Export canceled.');
            } else {
                alert('Batch export failed: ' + e.message);
            }
        } finally {
            finishExport();
        }
    }
