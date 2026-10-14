document.addEventListener('DOMContentLoaded', () => {
    // Menu Elements
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

    // Canvas Elements
    const canvas = document.getElementById('art-canvas');
    const ctx = canvas.getContext('2d');
    const viewport = document.getElementById('workspace-viewport');
    const transformWrapper = document.getElementById('canvas-transform-wrapper');

    let canvasWidth = 1920;
    let canvasHeight = 1080;

    // Viewport / Touch Transformation State
    let scale = 1;
    let posX = 0;
    let posY = 0;

    // Touch interaction tracking variables
    let initialTouchDistance = null;
    let initialTouchAngle = null;
    let initialScale = 1;
    let initialRotation = 0;
    let currentRotation = 0;
    let initialMidX = 0;
    let initialMidY = 0;
    let initialPosX = 0;
    let initialPosY = 0;

    // --- MENU LOGIC ---
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

    // --- TRANSITION TO CANVAS WORKSPACE ---
    createCanvasBtn.addEventListener('click', () => {
        canvasWidth = parseInt(widthInput.value) || 1920;
        canvasHeight = parseInt(heightInput.value) || 1080;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvasInfo.textContent = `${canvasWidth} × ${canvasHeight}`;

        // Fill canvas default background with white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Switch screens
        menuScreen.classList.remove('active');
        canvasScreen.classList.add('active');

        // Center canvas initially in the viewport
        centerCanvas();
    });

    backToMenuBtn.addEventListener('click', () => {
        canvasScreen.classList.remove('active');
        menuScreen.classList.add('active');
    });

    function centerCanvas() {
        const vW = viewport.clientWidth;
        const vH = viewport.clientHeight;

        // Fit canvas nicely inside viewport with padding
        const scaleX = (vW * 0.8) / canvasWidth;
        const scaleY = (vH * 0.8) / canvasHeight;
        scale = Math.min(scaleX, scaleY);

        posX = (vW - canvasWidth * scale) / 2;
        posY = (vH - canvasHeight * scale) / 2;
        currentRotation = 0;

        updateTransform();
    }

    function updateTransform() {
        transformWrapper.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${currentRotation}deg)`;
    }

    // --- MULTI-TOUCH ZOOM & ROTATE GESTURES ---
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
            initialPosX = posX;
            initialPosY = posY;
        }
    }, { passive: false });

    viewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialTouchDistance !== null) {
            e.preventDefault(); // Stop default browser pinch-zoom/scroll behavior

            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const currentAngle = getAngle(e.touches[0], e.touches[1]);

            // Calculate new scale & rotation simultaneously
            const scaleFactor = currentDistance / initialTouchDistance;
            scale = Math.max(0.1, Math.min(10, initialScale * scaleFactor));
            
            let angleDelta = currentAngle - initialTouchAngle;
            currentRotation = initialRotation + angleDelta;

            // Handle panning during multi-touch midpoint movement
            const currentMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const currentMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            
            posX = initialPosX + (currentMidX - initialMidX);
            posY = initialPosY + (currentMidY - initialMidY);

            updateTransform();
        }
    }, { passive: false });

    viewport.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialTouchDistance = null;
            initialTouchAngle = null;
        }
    });

    // Initial menu setup run
    updatePreview();
});
