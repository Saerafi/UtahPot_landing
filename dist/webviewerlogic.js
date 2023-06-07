window.onload = () => {
    // Initialise lax.js library for parallax animations
    lax.init()

    lax.addDriver('scrollY', () => {
        return window.scrollY
    })

    const fullscreenImage = document.querySelector('.full');
    const pageOne = document.querySelector('.page-one');
    const pageTwo = document.getElementById('page-two');
    const viewerContainer = document.getElementById('viewer');

    $('.help-popup').hide();
    $('.help').click(() => {
        if ($('.help-popup').css('display') == 'none') {
            $('.help-popup').show();
        } else {
            $('.help-popup').hide();
        }
    });

    $('#viewer, #gfx-main').css('height', '64vh');
    $('#viewer, #gfx-main').css('width', '52vw');
    // On fullscreen click
    $('#fullscreen').click(() => {
        // Scale to fullscreen
        if (viewerContainer.style.height === '64vh' && viewerContainer.style.width === '52vw') {
            pageTwo.requestFullscreen();
            $('#viewer, #gfx-main').css('height', '100vh');
            $('#viewer, #gfx-main').css('width', '100vw');
            $('#viewer, #gfx-main').css('border-radius', '0px');
            fullscreenImage.src = 'dist/ico/ScreenDownsize.svg';
            // Resize back to normal
        } else {
            document.exitFullscreen();
            $('#viewer, #gfx-main').css('height', '64vh');
            $('#viewer, #gfx-main').css('width', '52vw');
            $('#viewer, #gfx-main').css('border-radius', '10px');
            fullscreenImage.src = 'dist/ico/Fullscreen.svg';
        }
    });

    $('.nav-menu').hide();
    // Navigation menu behaviour when scrolling page
    window.addEventListener('scroll', () => {
        // Initialize objects needed
        const scrollPosition = window.scrollY;
        // Show after intro
        if (scrollPosition >= pageOne.offsetHeight * 4) {
            $('.nav-menu').show();
            // Style for about page
            if (scrollPosition >= pageOne.offsetHeight * 4 && scrollPosition < pageOne.offsetHeight * 6) {
                $('.utahpot, .intr, .abt, .vwr').css('color', 'black');
                $('.nav-menu').css('border-color','black');
                // Style for viewer page
            } else {
                $('.utahpot, .intr, .abt, .vwr').css('color', 'white');
                $('.nav-menu').css('border-color','white');
            }
            // Hide on intro
        } else {
            $('.nav-menu').hide();
        }
    });
}