// ==================== NAVIGATION ====================
const navToggle = document.getElementById('navToggle');
const navMenu = document.querySelector('.nav-menu');
const navbar = document.querySelector('.navbar');

// Toggle mobile menu
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ==================== SCROLL TO TOP ====================
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('active');
    } else {
        scrollTopBtn.classList.remove('active');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== FORM MESSAGE HANDLING ====================
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');

// Update error message handler to use the proper structure
if (errorMessage) {
    const originalDisplay = errorMessage.style.display;

    // Override the display style
    Object.defineProperty(errorMessage.style, 'display', {
        get: function() {
            return this._display || 'none';
        },
        set: function(value) {
            this._display = value;
            if (value === 'none') {
                errorMessage.classList.remove('show');
            } else {
                errorMessage.classList.add('show');
                errorMessage.style._display = 'flex';
            }
        }
    });
}

if (successMessage) {
    Object.defineProperty(successMessage.style, 'display', {
        get: function() {
            return this._display || 'none';
        },
        set: function(value) {
            this._display = value;
            if (value === 'none') {
                successMessage.classList.remove('show');
            } else {
                successMessage.classList.add('show');
                successMessage.style._display = 'flex';
            }
        }
    });
}

// ==================== SCROLL ANIMATIONS ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .product-card, .contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ==================== LOADING ANIMATION ====================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ==================== PAVER CALCULATOR ====================
const calculateBtn = document.getElementById('calculateBtn');
const calcLength = document.getElementById('calcLength');
const calcWidth = document.getElementById('calcWidth');
const lengthUnit = document.getElementById('lengthUnit');
const widthUnit = document.getElementById('widthUnit');
const paverType = document.getElementById('paverType');
const wastage = document.getElementById('wastage');

const totalArea = document.getElementById('totalArea');
const paversNeeded = document.getElementById('paversNeeded');
const wastageInfo = document.getElementById('wastageInfo');

// Paver specifications (pavers per square meter)
const paverSpecs = {
    '60': { perSqM: 40, weight: 3.5 },  // 60mm interlocking
    '80': { perSqM: 40, weight: 4.5 },  // 80mm interlocking
    '100': { perSqM: 45, weight: 5.0 }, // 100mm zig zag
    'normal': { perSqM: 50, weight: 3.0 }, // Normal pavers
    'designer': { perSqM: 45, weight: 4.0 }  // Designer pavers
};

calculateBtn.addEventListener('click', () => {
    const inlineResults = document.getElementById('inlineResults');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const successMessage = document.getElementById('success-message');

    // Hide messages by default
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    const length = parseFloat(calcLength.value);
    const width = parseFloat(calcWidth.value);
    const lengthUnitValue = lengthUnit.value;
    const widthUnitValue = widthUnit.value;
    const paverTypeValue = paverType.value;
    const wastageValue = parseFloat(wastage.value);

    // Validation
    if (!length || !width || !paverTypeValue) {
        errorText.textContent = 'Please fill in all fields including paver type';
        errorMessage.style.display = 'flex';
        inlineResults.style.display = 'none';
        return;
    }

    if (length <= 0 || width <= 0) {
        errorText.textContent = 'Please enter valid dimensions';
        errorMessage.style.display = 'flex';
        inlineResults.style.display = 'none';
        return;
    }

    // Convert to meters if needed
    let lengthInMeters = lengthUnitValue === 'feet' ? length * 0.3048 : length;
    let widthInMeters = widthUnitValue === 'feet' ? width * 0.3048 : width;

    // Calculate area
    const areaInSqM = lengthInMeters * widthInMeters;
    const areaInSqFt = areaInSqM * 10.764;

    // Get paver specifications
    const specs = paverSpecs[paverTypeValue];

    // Calculate pavers needed
    const paversBase = Math.ceil(areaInSqM * specs.perSqM);
    const paversWithWastage = Math.ceil(paversBase * (1 + wastageValue / 100));

    // Show inline results
    inlineResults.style.display = 'block';

    // Update UI with animation
    animateValue(totalArea, areaInSqFt.toFixed(1) + ' sq ft');
    animateValue(paversNeeded, paversWithWastage.toLocaleString() + ' units');

    if (wastageValue > 0) {
        wastageInfo.textContent = `Including ${wastageValue}% wastage`;
    } else {
        wastageInfo.textContent = 'No wastage added';
    }

    // Smooth scroll to results
    setTimeout(() => {
        inlineResults.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 100);
});

// Animate number changes
function animateValue(element, finalValue) {
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'transform 0.3s ease';

    setTimeout(() => {
        element.textContent = finalValue;
        element.style.transform = 'scale(1)';
    }, 150);
}

// Real-time calculation on input change (optional)
[calcLength, calcWidth, lengthUnit, widthUnit, paverType, wastage].forEach(element => {
    element.addEventListener('change', () => {
        if (calcLength.value && calcWidth.value && paverType.value) {
            calculateBtn.click();
        }
    });
});

console.log('✓ Main.js loaded successfully');
