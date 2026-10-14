document.addEventListener('DOMContentLoaded', () => {
    const menuScreen = document.getElementById('menu-screen');
    const canvasScreen = document.getElementById('canvas-screen');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const previewBox = document.getElementById('preview-box');
    const previewDimensions = document.getElementById('preview-dimensions');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const createCanvasBtn = document.getElementById('create-canvas-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const canvasInfo = document.getElementById('canvas-info');

    const canvas = document.getElementById('art-canvas');
    const ctx = canvas.getContext('2d');
    const viewport = document.getElementById('workspace-viewport');
    const transformWrapper = document.getElementById('canvas-transform-wrapper');

    let canvasWidth = 1920;
    let canvasHeight = 1080;

    // Viewport / Touch Transformation State (Center-based)
    let scale = 1;
    let centerX = 0;
    let centerY = 0;
    let currentRotation = 0;

    let initialTouchDistance = null;
    let initialTouchAngle = null;
    let initialScale = 1;
    let initialRotation = 0;
    let initialMidX = 0;
    let initialMidY = 0;
    let initialCenterX = 0;
    let initialCenterY = 0;

    function updatePreview() {
        let w = parseInt(widthInput.value) || 1;
        let h = parseInt(heightInput.value) || 1;
        if (w < 1) w = 1;
        if (h < 1) h = 1;

        previewDimensions.textContent = `${w} × ${h}`;

        const maxDisplaySize = 100;
        let displayWidth, displayHeight;

        if (w >= h) {
            displayWidth = maxDisplaySize;
            displayHeight = (h / w) * maxDisplaySize;
        } else {
            displayHeight = maxDisplaySize;
            displayWidth = (w / h) * maxDisplaySize;
        }

        previewBox.style.width = `${displayWidth}px`;
        previewBox.style.height = `${displayHeight}px`;

        presetBtns.forEach(btn => {
            const btnW = parseInt(btn.getAttribute('data-width'));
            const btnH = parseInt(btn.getAttribute('data-height'));
            if (btnW === w && btnH === h) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    widthInput.addEventListener('input', updatePreview);
    heightInput.addEventListener('input', updatePreview);

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            widthInput.value = btn.getAttribute('data-width');
            heightInput.value = btn.getAttribute('data-height');
            updatePreview();
        });
    });

    createCanvasBtn.addEventListener('click', () => {
        canvasWidth = parseInt(widthInput.value) || 1920;
        canvasHeight = parseInt(heightInput.value) || 1080;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvasInfo.textContent = `${canvasWidth} × ${canvasHeight}`;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        menuScreen.classList.remove('active');
        canvasScreen.classList.add('active');

        fitCanvasToScreen();
    });

    backToMenuBtn.addEventListener('click', () => {
        canvasScreen.classList.remove('active');
        menuScreen.classList.add('active');
    });

    function fitCanvasToScreen() {
        const vW = viewport.clientWidth;
        const vH = viewport.clientHeight;

        // Scale so at least two edges touch the screen (fullscreen fill attempt)
        const scaleX = vW / canvasWidth;
        const scaleY = vH / canvasHeight;
        scale = Math.min(scaleX, scaleY);

        centerX = vW / 2;
        centerY = vH / 2;
        currentRotation = 0;

        updateTransform();
    }

    function updateTransform() {
        transformWrapper.style.transform = `translate(${centerX}px, ${centerY}px) scale(${scale}) rotate(${currentRotation}deg)`;
    }

    function getDistance(t1, t2) {
        return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    }

    function getAngle(t1, t2) {
        return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
    }

    viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialTouchDistance = getDistance(e.touches[0], e.touches[1]);
            initialTouchAngle = getAngle(e.touches[0], e.touches[1]);
            initialScale = scale;
            initialRotation = currentRotation;

            initialMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            initialMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            initialCenterX = centerX;
            initialCenterY = centerY;
        }
    }, { passive: false });

    viewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialTouchDistance !== null) {
            e.preventDefault();

            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const currentAngle = getAngle(e.touches[0], e.touches[1]);

            const scaleFactor = currentDistance / initialTouchDistance;
            scale = Math.max(0.1, Math.min(20, initialScale * scaleFactor));
            
            const angleDelta = currentAngle - initialTouchAngle;
            currentRotation = initialRotation + angleDelta;

            const currentMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const currentMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            
            centerX = initialCenterX + (currentMidX - initialMidX);
            centerY = initialCenterY + (currentMidY - initialMidY);

            updateTransform();
        }
    }, { passive: false });

    viewport.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialTouchDistance = null;
            initialTouchAngle = null;
        }
    });

    updatePreview();
});
