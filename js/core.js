var address = 'http://127.0.0.1:5500/';
var path = 'DeliverySite-master/';
//sugar
$ = function(query) {
    if (query[0] == '.') return document.getElementsByClassName(query.slice(1));
    else if (query[0] == '#') return document.getElementById(query.slice(1));
    else return document.getElementsByTagName(query);
}

function elem(element, cls, id) {
    let temp = document.createElement(element);
    if (cls) temp.className = cls;
    if (id) temp.setAttribute('id', id);
    return temp;
}
//logic
//loads part of the site from txt template
function loadPart(filename, reloadEvents) {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", address + path + filename + ".txt", true);
    xmlhttp.send();
    let response;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            response = xmlhttp.responseText;
            if (filename == 'home') {
                menuFlag = false;
                loadData(response, loadHome);
            } else {
                $('.body-wrap')[0].innerHTML = response;

                if (filename == 'contacts') {
                    menuFlag = false;
                    initMap();
                }
            }
            reloadEvents ? setTimeout(loadEvents, 500) : 1;
        }
    }
}

//loads data from JSON
function loadData(subject, callback) {
    if (subject && subject != "" && !(subject instanceof Array && subject[0] == "")) {
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", address + path + 'data.json', true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                data = JSON.parse(xmlhttp.responseText);
                callback(subject, data);
            }
        }
    }
}

function loadHome(response, data) {
    let top = findTop(5, data);
    response = replaceTop(response, top);
    $('.body-wrap')[0].innerHTML = response;
}
//generates menu "cards" from JSON data
function loadMenu(categorie, data) {
    menuFlag ? $('#cuisine-content').innerHTML = "" : loadPart('menu', true), menuFlag = true;
    setTimeout(function() {
        if (categorie && data) {
            data = data[categorie];
            if (sessionStorage.sortType == 'price') {
                sessionStorage.sortDirection == 'down' ?
                    data.sort(function(a, b) { return a.price - b.price; }) :
                    data.sort(function(a, b) { return b.price - a.price; });
            } else {
                sessionStorage.sortDirection == 'down' ?
                    data.sort(function(a, b) { return (a.name > b.name) ? 1 : -1; }) :
                    data.sort(function(a, b) { return (a.name < b.name) ? 1 : -1; });
            }

            let cuisineContentWrap = elem('div', 'cuisine-content-wrap');
            let tempItem, contentItemImg, contentItemText, price, img, cart, count, minus, input, plus;
            data.forEach(function(el) {
                tempItem = elem('div', 'cuisine-content-item', el.name);
                contentItemImg = elem('div', 'content-item-img');
                contentItemText = elem('div', 'content-item-text');
                priceCart = elem('form', 'cuisine-price-cart');
                price = elem('div', 'cuisine-price');
                count = elem('div', 'cuisine-count');
                minus = elem('div', 'minus noselect bold');
                input = elem('input', 'cuisine-count-input');
                plus = elem('div', 'plus noselect bold');
                cart = elem('input', 'cuisine-cart');
                img = el.vertical ? elem('img', 'vertical') : elem('img');
                img.setAttribute('src', el.img);
                input.setAttribute('type', 'text');
                input.setAttribute('value', '1');
                input.setAttribute('pattern', '[0-9]{0,3}');
                cart.setAttribute('name', el.name);
                cart.setAttribute('type', 'submit');
                cart.setAttribute('value', 'Add to cart');

                cart.innerText = 'Add to cart';
                contentItemText.innerHTML = '<p><strong>' + el.name + '</strong></p><p>' + el.desc + '</p>';
                price.innerText = el.price + ' $';
                contentItemImg.appendChild(img);
                priceCart.appendChild(price);
                minus.innerText = '-';
                plus.innerText = '+';
                count.appendChild(minus);
                count.appendChild(input);
                count.appendChild(plus);
                priceCart.appendChild(count);
                priceCart.appendChild(cart);
                contentItemText.appendChild(priceCart);
                tempItem.appendChild(contentItemImg);
                tempItem.appendChild(contentItemText);
                cuisineContentWrap.appendChild(tempItem);
                cart.addEventListener('click', function(e) {
                    e.preventDefault();
                });
            });

            $('#cuisine-content').appendChild(cuisineContentWrap);
            loadEvents();
            // window.scrollTo(0, 325);
        }
    }, 200);
}


function removeOrderCard(id) {
    let orders = JSON.parse(localStorage.orders);
    for (let i = 0; i < orders.length; ++i) {
        if (orders[i].name == id) {
            orders.splice(i, 1);
            localStorage.orders = JSON.stringify(orders);
            updateOrders();
            break;
        }
    }

}

function addOrderCard(idAndCount, data) {
    let orders = JSON.parse(localStorage.orders);
    let propagationFlag = true; //flag for optimization reasons
    if (localStorage.orders != "[]") {
        orders.forEach(function(element) {
            if (element.name == idAndCount[0]) {
                element.count += idAndCount[1];
                localStorage.orders = JSON.stringify(orders);
                propagationFlag = false;
            }
        });
    }

    if (propagationFlag) {
        let categories = (sessionStorage.categorie) ? [sessionStorage.categorie] : ['ukrainian', 'asian', 'european', 'american'];
        let order;
        categories.forEach(function(categorie) {
            for (let i = 0; i < data[categorie].length; ++i) {
                if (!propagationFlag) {
                    break;
                }
                if (data[categorie][i].name == idAndCount[0]) {
                    order = {
                        count: idAndCount[1],
                        name: idAndCount[0],
                        img: data[categorie][i].img,
                        price: data[categorie][i].price,
                        vertical: data[categorie][i].vertical
                    };
                    orders.push(order);
                    localStorage.orders = JSON.stringify(orders);
                    propagationFlag = false;
                    break;
                }
            }
        });
    }
    updateOrders();
}
//updates Orders section 
function updateOrders() {
    $('#orders-items').innerHTML = '';
    if (localStorage.orders != "[]") {
        let orders = JSON.parse(localStorage.orders);
        let totalCount = 0,
            totalPrice = 0;

        orders.forEach(function(element) {
            $('#orders-items').appendChild(makeOrderCard(element));
            $('#orders-items').appendChild(elem('hr'));
            totalCount += element.count;
            totalPrice += element.price * element.count;
        });
        $('.orders-count')[0].innerText = totalCount;
        let total = elem('p', 'bold');
        let buttonWrap = elem('div', 'orders-submit-wrap');
        let button = elem('button', 'orders-submit bold');
        let input = elem('input', 'orders-phone-number bold');
        let label = elem('label');
        let form = elem('form');
        label.innerText = 'Your phone number:'
        input.setAttribute('type', 'tel');
        input.setAttribute('placeholder', '+380123456789');
        button.innerText = 'Place order';
        buttonWrap.appendChild(button);
        total.innerText = 'Total items: ' + totalCount + '\n\nTotal price: ' + totalPrice + '$';
        $('#orders-items').appendChild(total);

        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(buttonWrap);
        $('#orders-items').appendChild(form);
        $('.orders-count')[0].style.display = 'inline-block';
    } else {
        let total = elem('p', 'bold');
        total.innerText = 'Basket is empty';
        $('#orders-items').appendChild(total);
        $('.orders-count')[0].style.display = 'none';
    }
    loadEvents('order');
}
//generation of order "Card"
function makeOrderCard(data) {
    let item = elem('div', 'order-item', data.name);
    let desc = elem('div', 'order-desc');
    let name = elem('p', 'bold');
    let price = elem('p', 'bold');
    let img = elem('img');
    let close = elem('div', 'order-item-close noselect');
    close.innerText = 'X';
    name.innerText = data.name + '\nx' + data.count + '\n' + data.price + '$';
    img.setAttribute('src', data.img);
    img.className = 'vertical';

    desc.appendChild(name);
    desc.appendChild(price);
    item.appendChild(desc);
    item.appendChild(img);
    item.appendChild(close);
    return item;
}
//Shows detailed info about product
function loadDesc(id, data) {
    let categories = ['ukrainian', 'asian', 'european', 'american'];
    let propagationFlag = false;
    categories.forEach(function(categorie) {
        for (let i = 0; i < data[categorie].length; ++i) {
            if (propagationFlag) {
                break;
            }
            if (data[categorie][i].name == id) {
                $('#item-description-name').innerText = data[categorie][i].name;
                $('#item-description-img').setAttribute('src', data[categorie][i].img);
                $('#item-description-img').className = "vertical";
                $('#item-description-desc').innerText = data[categorie][i].desc;
                let info = 'Info:\n';
                data[categorie][i].info.forEach(function(elem) {
                    info += elem.name + ': ' + elem.amount + 'g\n';
                });
                $('#desc-input').setAttribute('name', data[categorie][i].name);
                $('#item-description-info').innerText = info;
                $('#desc-cuisine-price').innerText = data[categorie][i].price + '$';
                propagationFlag = true;
                break;
            }
        }
    });
    $('.item-description')[0].lastElementChild.children[1].children[1].value = 1;
    $('.item-description-wrap')[0].style.display = 'flex';
}
//for Clients Choice part
function findTop(count, data) {
    let categories = ['ukrainian', 'asian', 'european', 'american'];
    let top = []
    for (let i = 0; i < count; ++i) {
        top[i] = { price: 0, img: '', totalBuys: 0, vertical: false, name: '' };
    }
    for (let k = 0; k < categories.length; ++k) {
        data[categories[k]].forEach(function(elem) {
            for (let i = 0; i < count; ++i) {
                if (top[i].totalBuys < elem.totalBuys) {
                    top[i].totalBuys = elem.totalBuys;
                    top[i].price = elem.price;
                    top[i].img = elem.img;
                    top[i].vertical = elem.vertical;
                    top[i].name = elem.name;
                    break;
                }
            }
        });
    }
    return top;
}
//pseudo backend logic
function replaceTop(response, top) {
    try {
        for (let i = 0; i < top.length; ++i) {
            response = response.replace('$%TOP' + (i + 1),
                '<div class="carousel-2" id="' + top[i].name + '"><div class="img-wrap"><img' +
                (top[i].vertical ? ' class="vertical"' : ' ') +
                'src="' + top[i].img +
                '" alt=""></img></div><div class="price carousel-price">' +
                top[i].price +
                '$</div><div class="price carousel-top">TOP ' +
                (i + 1) +
                '</div></div>');
        }
    } finally {
        return response;
    }
}
//google maps
function initMap() {
    var spot1 = {
        lat: 50.371098,
        lng: 30.494149
    };
    var spot2 = {
        lat: 50.431206,
        lng: 30.573203
    };
    var spot3 = {
        lat: 50.397231,
        lng: 30.661871
    };
    var center = {
        lat: 50.413800,
        lng: 30.575008
    };
    var map = new google.maps.Map(
        document.getElementById('map'), {
            zoom: 11,
            center: center
        });
    var marker1 = new google.maps.Marker({
        position: spot1,
        map: map
    });
    var marker2 = new google.maps.Marker({
        position: spot2,
        map: map
    });
    var marker3 = new google.maps.Marker({
        position: spot3,
        map: map
    });
}
//big function which reloads all events(my SPA relization needs to update events after every page rerender)
function loadEvents(groups) {
    switch (groups) {
        case 'main':
            if ($('#ukrainian'))
                $('#ukrainian').addEventListener('click', function(e) {
                    sessionStorage.position = "menu";
                    sessionStorage.categorie = 'ukrainian';
                    loadData('ukrainian', loadMenu);
                    e.stopImmediatePropagation();
                });
            if ($('#asian'))
                $('#asian').addEventListener('click', function(e) {
                    sessionStorage.position = "menu";
                    sessionStorage.categorie = 'asian';
                    loadData('asian', loadMenu);
                    e.stopImmediatePropagation();
                });
            if ($('#european'))
                $('#european').addEventListener('click', function(e) {
                    sessionStorage.position = "menu";
                    sessionStorage.categorie = 'european';
                    loadData('european', loadMenu);
                    e.stopImmediatePropagation();
                });
            if ($('#american'))
                $('#american').addEventListener('click', function(e) {
                    sessionStorage.position = "menu";
                    sessionStorage.categorie = 'american';
                    loadData('american', loadMenu);
                    e.stopImmediatePropagation();
                });
            if ($('.carousel-2'))
                Array.prototype.forEach.call($('.carousel-2'), function(element) {
                    element.addEventListener('click', function(e) {
                        loadData(e.currentTarget.id, loadDesc);
                        e.stopImmediatePropagation();
                    }, true);
                });
            break;
        case 'order':
            if ($('.order-item'))
                Array.prototype.forEach.call($('.order-item'), function(element) {
                    element.addEventListener('click', function(e) {
                        loadData(e.currentTarget.id, loadDesc);
                        e.stopImmediatePropagation();
                    });
                });
            if ($('.order-item-close'))
                Array.prototype.forEach.call($('.order-item-close'), function(element) {
                    element.addEventListener('click', function(e) {
                        removeOrderCard(e.currentTarget.parentNode.id);
                        e.stopImmediatePropagation();
                        //loadData(e.currentTarget.id, loadDesc);
                    });
                });
            if (localStorage.orders != "[]")
                $('.orders-submit')[0].addEventListener('click', function() {
                    if ($('.orders-phone-number')[0].value.match(/^\+380\d{9}$/)) {
                        alert('Order submited. Wait for our courier to contact with you.');
                        localStorage.orders = "[]";
                        updateOrders();
                        if (window.innerWidth > 400) {
                            $('#basket-button').style.left = "-25px";
                            $('.body-orders')[0].style.left = '-360px';
                        } else {
                            $('#basket-button').style.left = "-17px";
                            $('.body-orders')[0].style.left = '-260px';
                        }

                        $('.body-orders')[0].style.left = '-360px';
                        sidebar = false;
                    } else {
                        alert('Please put real number.\nPattern: +380123456789');
                    }
                });
            break;
        case 'menu':
            if ($('.plus'))
                Array.prototype.forEach.call($('.plus'), function(element) {
                    element.addEventListener('click', function(e) {
                        input = element.parentNode.children[1];
                        input.value = parseInt(input.value) + 1;
                        e.stopImmediatePropagation();
                    }, true);
                });
            if ($('.minus'))
                Array.prototype.forEach.call($('.minus'), function(element) {
                    element.addEventListener('click', function(e) {
                        input = element.parentNode.children[1];
                        input.value = parseInt(input.value) ? (parseInt(input.value) - 1) : 0;
                        e.stopImmediatePropagation();
                    }, true);
                });
            if ($('.cuisine-content-item'))
                Array.prototype.forEach.call($('.cuisine-content-item'), function(element) {
                    element.addEventListener('click', function(e) {

                        if (e.target.className != "cuisine-cart" && e.target.className != "cuisine-count-input")
                            loadData(e.currentTarget.id, loadDesc);
                    });
                });
            if ($('#sort-name'))
                $('#sort-name').addEventListener('click', function(e) {
                    if (sessionStorage.sortType == 'name') {
                        if (sessionStorage.sortDirection == 'down') {
                            sessionStorage.sortDirection = 'up';
                        } else sessionStorage.sortDirection = 'down';
                        loadData(sessionStorage.categorie, loadMenu);
                        $('#sort-name').innerHTML = 'Name <i class="fas fa-sort-alpha-' + sessionStorage.sortDirection + '"></i>';
                    } else {
                        sessionStorage.sortType = 'name';
                        loadData(sessionStorage.categorie, loadMenu);
                        $('#sort-name').classList.add('bold');
                        $('#sort-price').classList.remove('bold');
                        $('#sort-name').innerHTML = 'Name <i class="fas fa-sort-alpha-' + sessionStorage.sortDirection + '"></i>';

                    }
                    e.stopImmediatePropagation();
                });
            if ($('#sort-price'))
                $('#sort-price').addEventListener('click', function(e) {
                    if (sessionStorage.sortType == 'price') {
                        if (sessionStorage.sortDirection == 'down') {
                            sessionStorage.sortDirection = 'up';
                        } else sessionStorage.sortDirection = 'down';
                        loadData(sessionStorage.categorie, loadMenu);
                        $('#sort-price').innerHTML = 'Price <i class="fas fa-sort-numeric-' + sessionStorage.sortDirection + '"></i>';
                    } else {
                        sessionStorage.sortType = 'price';
                        loadData(sessionStorage.categorie, loadMenu);
                        $('#sort-price').classList.add('bold');
                        $('#sort-name').classList.remove('bold');
                        $('#sort-price').innerHTML = 'Price <i class="fas fa-sort-numeric-' + sessionStorage.sortDirection + '"></i>';
                    }
                    e.stopImmediatePropagation();
                });
            loadEvents('main');
            break;
        case 'cart':
            Array.prototype.forEach.call($('.cuisine-cart'), function(element) {
                element.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (e.target.parentNode.children[1].children[1].value.match(/\d+/)) {
                        loadData([e.currentTarget.getAttribute('name'),
                                parseInt(e.target.parentNode.children[1].children[1].value)
                            ],
                            addOrderCard);
                    } else {
                        e.target.parentNode.children[1].children[1].value = 1;
                        alert('Please input number');
                    }
                    e.stopImmediatePropagation();
                });
            });
            break;
        default:
            loadEvents('order');
            loadEvents('menu');
            loadEvents('cart');
    }
}