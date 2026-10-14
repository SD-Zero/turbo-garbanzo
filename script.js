document.addEventListener('DOMContentLoaded', () => {
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const previewBox = document.getElementById('preview-box');
    const previewDimensions = document.getElementById('preview-dimensions');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const createCanvasBtn = document.getElementById('create-canvas-btn');

    // Function to update the proportional preview box size
    function updatePreview() {
        let w = parseInt(widthInput.value) || 1;
        let h = parseInt(heightInput.value) || 1;

        // Prevent negative or zero numbers
        if (w < 1) w = 1;
        if (h < 1) h = 1;

        previewDimensions.textContent = `${w} × ${h}`;

        // Calculate aspect ratio bounding box (max width/height in px for display)
        const maxDisplaySize = 130;
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

        // Check if current inputs match any preset to highlight it
        let matched = false;
        presetBtns.forEach(btn => {
            const btnW = parseInt(btn.getAttribute('data-width'));
            const btnH = parseInt(btn.getAttribute('data-height'));
            if (btnW === w && btnH === h) {
                btn.classList.add('active');
                matched = true;
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Event listeners for manual input typing
    widthInput.addEventListener('input', updatePreview);
    heightInput.addEventListener('input', updatePreview);

    // Event listeners for clicking presets
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const w = btn.getAttribute('data-width');
            const h = btn.getAttribute('data-height');
            widthInput.value = w;
            heightInput.value = h;
            updatePreview();
        });
    });

    // Create Canvas Action (Placeholder for now)
    createCanvasBtn.addEventListener('click', () => {
        const finalWidth = widthInput.value;
        const finalHeight = heightInput.value;
        alert(`Canvas created successfully with size: ${finalWidth} × ${finalHeight} px!\n\n(Next up: We will build the actual drawing workspace!)`);
    });

    // Initial load update
    updatePreview();
});
