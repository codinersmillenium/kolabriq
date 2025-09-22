// Mobile menu js
const toggleMenu = () => {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('open');
};

// AOS Animation
AOS.init({
    once: true,
});

// LTR - RTL
const toggleDirection = (isFirstTime = false) => {
    let direction = window.localStorage.getItem('direction') || 'ltr';

    if (!isFirstTime) {
        direction = direction === 'ltr' ? 'rtl' : 'ltr';
    }
    window.localStorage.setItem('direction', direction);

    if (direction === 'rtl') {
        document.querySelector('html').setAttribute('dir', 'rtl');
    } else {
        document.querySelector('html').setAttribute('dir', 'ltr');
    }
    if (!isFirstTime) {
        window.location.reload();
    }
};
toggleDirection(true);

// Scroll to top amd Sticky Header
const scrollToTop = () => {
    document.documentElement.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
};

window.onscroll = function () {
    setOnScroll();
};

const setOnScroll = () => {
    let scrollpos = window.scrollY;
    if (scrollpos > 0) {
        document.getElementById('scrollToTopBtn')?.classList.remove('hidden');
        document.getElementById('header')?.classList.add('sticky-header');
    } else {
        document.getElementById('scrollToTopBtn')?.classList.add('hidden');
        document.getElementById('header')?.classList.remove('sticky-header');
    }
};
setOnScroll();

// Dark Mode
const toggleTheme = (isFirstTime = false) => {
    // let theme = window.localStorage.getItem('theme') || 'light';
    let theme = 'dark';

    console.log(theme);

    if (!isFirstTime) {
        theme = theme === 'light' ? 'dark' : 'light';
    }

    if (isFirstTime && theme === 'dark') {
        document.querySelector('#themeInput').checked = true;
    }

    window.localStorage.setItem('theme', theme);

    if (theme === 'dark') {
        document.querySelector('body').classList.add('dark');
    } else {
        document.querySelector('body').classList.remove('dark');
    }
};
toggleTheme(true);

// loader
const screen_loader = document.getElementsByClassName('screen_loader');
if (screen_loader?.length) {
    setTimeout(() => {
        document.body.removeChild(screen_loader[0]);
    }, 300);
}

// current year
const ele = document.querySelectorAll('.curr-year');
if (ele?.length) {
    const date = new Date();
    const fullyear = date.getFullYear();
    for (let i = 0; i < ele.length; i++) {
        ele[i].innerHTML = fullyear;
    }
}
