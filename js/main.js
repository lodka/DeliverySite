let sidebar = false,
    menuFlag = false,
    linksBar = false;
document.addEventListener("DOMContentLoaded", function() {
    if (!localStorage.orders) {
        localStorage.orders = JSON.stringify([]);
    }
    let basketButton = $('#basket-button');
    let bodyOrders = $('.body-orders')[0];
    sessionStorage.sortType = 'name';
    sessionStorage.sortDirection = 'down';
    updateOrders();
    basketButton.addEventListener('click', moveSidebar);

    function moveSidebar(saveLocation) {
        if (!sidebar) {
            (window.innerWidth > 400) ? basketButton.style.left = "335px": basketButton.style.left = "244px";
            bodyOrders.style.left = '0px';
            sidebar = true;
        } else {
            if (window.innerWidth > 400) {
                basketButton.style.left = "-25px";
                bodyOrders.style.left = '-360px';
            } else {
                basketButton.style.left = "-17px";
                bodyOrders.style.left = '-260px';
            }
            sidebar = false;
        }
    }

    $('.home')[0].addEventListener('click', function() {
        sessionStorage.position = "home";
        sessionStorage.categorie = '';
        loadPart(sessionStorage.position, true);
    });
    $('.home')[1].addEventListener('click', function() {
        sessionStorage.position = "home";
        sessionStorage.categorie = '';
        loadPart(sessionStorage.position, true);
    });
    $('#menu').addEventListener('mouseover', function() {
        $('.navbar-dropdown')[0].style.top = '100%';
    });
    $('.navbar-links-wrap')[0].addEventListener('mouseout', function(e) {
        if (!(e.relatedTarget) ||
            (e.relatedTarget != $('.navbar-dropdown')[0] &&
                e.relatedTarget.classList[0] != 'navbar-links-wrap' &&
                e.relatedTarget.classList[0] != 'dropdown-element')) {
            $('.navbar-dropdown')[0].style.top = '-150px';
        }
    });
    $('.menu')[0].addEventListener('click', function() {
        sessionStorage.position = "menu";
        sessionStorage.categorie = 'ukrainian';
        loadData(sessionStorage.categorie, loadMenu);
    });
    $('.contact')[0].addEventListener('click', function() {
        sessionStorage.position = "contacts";
        sessionStorage.categorie = '';
        loadPart(sessionStorage.position);
    });
    $('.item-description-wrap')[0].addEventListener('click', function(e) {
        if (e.target == $('.item-description-wrap')[0]) {
            $('.item-description-wrap')[0].style.display = 'none';
        }
    }, true);
    $('.description-close-button')[0].addEventListener('click', function(e) {
        $('.item-description-wrap')[0].style.display = 'none';
    });
    $('.dropdown-element')[0].addEventListener('click', function() {
        sessionStorage.position = "menu";
        sessionStorage.categorie = 'ukrainian';
        loadData(sessionStorage.categorie, loadMenu);

    });
    $('.dropdown-element')[1].addEventListener('click', function() {
        sessionStorage.position = "menu";
        sessionStorage.categorie = 'asian';
        loadData(sessionStorage.categorie, loadMenu);

    });
    $('.dropdown-element')[2].addEventListener('click', function() {
        sessionStorage.position = "menu";
        sessionStorage.categorie = 'european';
        loadData(sessionStorage.categorie, loadMenu);

    });
    $('.dropdown-element')[3].addEventListener('click', function() {
        sessionStorage.position = "menu";
        sessionStorage.categorie = 'american';
        loadData(sessionStorage.categorie, loadMenu);

    });

    function navbar() {
        console.log('aaa')
        if (linksBar) {
            $('.navbar')[0].style.height = '60px';
            $('.navbar-links-wrap')[0].style.display = 'none';
            linksBar = false;
        } else {
            $('.navbar-links-wrap')[0].style.display = 'flex';
            $('.navbar')[0].style.height = '240px';
            linksBar = true;
        }
    }
    $('.navbar-bars')[0].addEventListener('click', navbar);

    window.onresize = function() {
        if (window.innerWidth > 950) {
            $('.navbar-links-wrap')[0].style.display = 'flex';
        }
        if (sidebar) {
            (window.innerWidth > 400) ? basketButton.style.left = "335px": basketButton.style.left = "244px";
            bodyOrders.style.left = '0px';
        } else {
            if (window.innerWidth > 400) {
                basketButton.style.left = "-25px";
                bodyOrders.style.left = '-360px';
            } else {
                basketButton.style.left = "-17px";
                bodyOrders.style.left = '-260px';
            }
        }
    }
    if (sessionStorage.position) {
        sessionStorage.categorie ? loadData(sessionStorage.categorie, loadMenu) : loadPart(sessionStorage.position, true);
    } else {
        loadPart('home', true);
    }
});