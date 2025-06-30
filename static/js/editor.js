let lastActiveBlock = null;

    document.addEventListener('focusin', (event) => {
        if (event.target.classList.contains('editable-block')) {
            lastActiveBlock = event.target;
            console.log(lastActiveBlock)
        }
    });

    function formatText(command) {
        document.execCommand(command, false, null);
    }

    let selectedColor = 'yellow';

    function highlightText() {
        document.execCommand('HiliteColor', false, selectedColor);
        setTimeout(() => {
            if (lastActiveBlock) {
                lastActiveBlock.focus();
            }
        }, 0);
    }

    const colorPalette = document.getElementById('colorPalette');
    const colorSwatches = document.querySelectorAll('.color-swatch-wrapper');
    console.log(colorSwatches)

    colorSwatches.forEach( (elem) => {
        const swatch = elem.querySelector('.color-swatch');
        console.log("swatch", swatch)

        swatch.addEventListener('mouseup', function() {
            selectedColor = swatch.style.backgroundColor;

            colorSwatches.forEach( (colorSwatch) => {
                colorSwatch.classList.remove('active-color')
            });

            elem.classList.toggle('active-color')
            //highlightText()
        });

    });