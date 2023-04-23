window.onload = function () {
    // Initialize objects needed for buttons logic
    const settingsBtn = document.querySelector('.settings');
    const fullBtn = document.getElementById('fullscreen');
    const inspButton = document.querySelector('.inspector');
    const setDropdown = document.getElementById('settings-dropdown');
    const inspDropdown = document.getElementById('inspector-dropdown');
    const viewerCont = document.getElementById('viewer');
    // const addonsCont = document.getElementById('addons-cont');
    const btnImage = document.querySelector('.full');
    // When options clicked
    settingsBtn.addEventListener('click', function () {
        // If menu not displayed, display it
        if (setDropdown.style.display === 'none') {
            setDropdown.style.display = 'block';
            inspDropdown.style.display = 'none';
            // If displayed, close menu
        } else {
            setDropdown.style.display = 'none';
        }
    });
    inspButton.addEventListener('click', function () {
        if (inspDropdown.style.display === 'none') {
            inspDropdown.style.display = 'block';
            setDropdown.style.display = 'none'
        } else {
            inspDropdown.style.display = 'none';
        }
    });
    // When fullscreen clicked
    fullBtn.addEventListener('click', function () {
        // If viewer not in full screen scale it
        if (viewerCont.style.height === '64%' && viewerCont.style.width === '52%') {
            viewerCont.requestFullscreen();
            viewerCont.style.height = '100%';
            viewerCont.style.width = '100%';
            viewerCont.style.borderRadius = '0px';
            // addonsCont.style.display = 'none';
            btnImage.src = 'dist/ico/ScreenDownsize.svg';
            inspDropdown.style.display = 'none';
            setDropdown.style.display = 'none';
            // Resize back to normal
        } else {
            document.exitFullscreen();
            viewerCont.style.height = '64%';
            viewerCont.style.width = '52%';
            viewerCont.style.borderRadius = '10px';
            // addonsCont.style.display = 'block';
            btnImage.src = 'dist/ico/Fullscreen.svg';
            inspDropdown.style.display = 'none';
            setDropdown.style.display = 'none';
        }
    });
}