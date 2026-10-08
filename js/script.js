/* =========================================================
   Website logic
   ========================================================= */
   

import { store } from './data/company.js';
import { products } from './data/products.js';
import { combos } from './data/combos.js';
import { quantityOffers } from './data/offers.js';


const CART_KEY = 'aqui-encuentras-mas-cart';

const $ = (s, p = document) => p.querySelector(s);

const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const inView = location.pathname.includes('/view/');

const asset = p =>
    !p
        ? ''
        : (/^(https?:)?\/\//i.test(p) || p.startsWith('/')
            ? p
            : `${inView ? '../' : ''}${p.replace(/^\.\.?\//, '')}`);

const norm = v =>
    String(v ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

const slug = v =>
    norm(v).replace(/\s+/g, '-');

const money = (n, c = 'CUP') =>
    !n
        ? 'Consultar'
        : `${new Intl.NumberFormat('es-CU').format(n)} ${c}`;

const status = s =>
    ({
        available: 'Disponible',
        out_of_stock: 'Agotado',
        unavailable: 'No disponible'
    }[s] || s || 'Consultar');

const visible = a =>
    a.filter(x => x.visible === true);


function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(c) {
    localStorage.setItem(CART_KEY, JSON.stringify(c));

    updateCart();
    renderCart();
    renderCheckout();
}

function updateCart() {
    $$('[data-cart-count]').forEach(
        e => e.textContent = getCart().reduce((n, x) => n + x.quantity, 0)
    );
}

function add(item) {
    const c = getCart();
    const old = c.find(
        x => x.type === item.type && x.id === item.id
    );

    old
        ? old.quantity += item.quantity
        : c.push(item);

    saveCart(c);
}

function changeQuantity(i, amount) {
    const c = getCart();
    const item = c[i];

    if (!item) {
        return;
    }

    item.quantity += amount;

    if (item.quantity <= 0) {
        c.splice(i, 1);
    }

    saveCart(c);
}

function remove(i) {
    const c = getCart();

    if (!c[i]) {
        return;
    }

    c.splice(i, 1);

    saveCart(c);
}

function clear() {
    localStorage.removeItem(CART_KEY);

    updateCart();
    renderCart();
    renderCheckout();
}

function openCart() {
    $('[data-cart]')?.classList.add('is-open');
    $('[data-cart-overlay]')?.classList.add('is-visible');
    document.body.classList.add('cart-open');

    renderCart();
}

function closeCart() {
    $('[data-cart]')?.classList.remove('is-open');
    $('[data-cart-overlay]')?.classList.remove('is-visible');
    document.body.classList.remove('cart-open');
}


function product(id) {
    return products.find(x => x.id === id);
}



function productCard(p) {
    const ok = p.status === 'available';

    return `
        <article
            class="product-card"
            data-name="${norm(p.name)}"
            data-category="${slug(p.category)}"
        >
            <div class="product-card__media">
                <span class="product-card__category">
                    ${p.category}
                </span>

                <img
                    src="${asset(p.image)}"
                    alt="${p.name}"
                    loading="lazy"
                    onerror="this.closest('.product-card__media').classList.add('image-missing')"
                >

                <span class="product-card__status ${ok ? 'is-available' : ''}">
                    ${status(p.status)}
                </span>
            </div>

            <div class="product-card__body">
                <div>
                    <h3>${p.name}</h3>

                    <p>
                        ${p.description || 'Información disponible por WhatsApp.'}
                    </p>
                </div>

                <div class="product-card__bottom">
                    <strong>
                        ${money(p.price, p.currency)}
                    </strong>

                    <button
                        class="button button--dark button--small"
                        data-add-product="${p.id}"
                        ${ok ? '' : 'disabled'}
                    >
                        ${ok ? 'Añadir' : 'Agotado'}
                    </button>
                </div>
            </div>
        </article>
    `;
}

function comboCard(c) {
    const ok = c.status === 'available';

    return `
        <article
            class="combo-card"
            data-name="${norm(c.name)}"
            data-category="${slug(c.category)}"
        >
            <div class="combo-card__media">
                <img
                    src="${asset(c.image)}"
                    alt="${c.name}"
                    loading="lazy"
                    onerror="this.closest('.combo-card__media').classList.add('image-missing')"
                >
            </div>

            <div class="combo-card__content">
                <div class="combo-card__top">
                    <span class="eyebrow">
                        Combo
                    </span>

                    <span>
                        ${c.id.replace('combo-', '#')}
                    </span>
                </div>

                <div class="combo-card__products">
                    ${c.products
                        .map(x => {
                            const p = product(x.productId);

                            return `
                                <div class="combo-product">
                                    <strong>
                                        ${p?.name || 'Producto'}
                                    </strong>

                                    <span>
                                        ${x.quantity}${x.um ? ` ${x.um}` : ''}
                                    </span>
                                </div>
                            `;
                        })
                        .join('')}
                </div>

                <div class="combo-card__footer">
                    <div>
                        <small>
                            Precio del combo
                        </small>

                        <strong>
                            ${money(c.price, c.currency)}
                        </strong>
                    </div>

                    <button
                        class="button button--yellow button--small"
                        data-consult-combo="${c.id}"
                        ${ok ? '' : 'disabled'}
                    >
                        ${ok ? 'Consultar' : 'Agotado'}
                    </button>
                </div>
            </div>
        </article>
    `;
}

function comboCatalogCard(c) {
    const ok = c.status === 'available';

    return `
        <article class="combo-catalog-card">
            <div class="combo-catalog-card__media">
                <img
                    src="${asset(c.post)}"
                    alt="${c.name || 'Combo'}"
                    loading="lazy"
                    onerror="this.closest('.combo-catalog-card__media').classList.add('image-missing')"
                >
            </div>

            <div class="combo-catalog-card__action">
                <button
                    class="button button--yellow button--small"
                    type="button"
                    data-consult-combo="${c.id}"
                    ${ok ? '' : 'disabled'}
                >
                    ${ok ? 'Consultar' : 'Agotado'}
                </button>
            </div>
        </article>
    `;
}

function offerCard(o) {
    const ok = o.status === 'available';

    return `
        <article
            class="offer-card"
            data-name="${norm(o.name)}"
            data-category="${slug(o.category)}"
        >
            <div>
                <span class="offer-card__badge">
                    Oferta
                </span>

                <h3>
                    ${o.name}
                </h3>

                <p>
                    ${o.quantity} unidades
                </p>
            </div>

            <div class="offer-card__footer">
                <div>
                    <small>
                        Precio según cantidad
                    </small>
                </div>

                <button
                    class="button button--dark button--dark__alternative button--small"
                    data-consult-offer="${o.id}"
                    ${ok ? '' : 'disabled'}
                >
                    ${ok ? 'Consultar' : 'Agotado'}
                </button>
            </div>
        </article>
    `;
}


function bindCards() {
    $$(
        '#featured-products [data-add-product], #catalog-grid [data-add-product]'
    ).forEach(
        b => b.onclick = () => {
            const p = product(b.dataset.addProduct);

            add({
                type: 'product',
                typeLabel: 'Producto',
                id: p.id,
                name: p.name,
                quantity: 1,
                unitLabel: p.um,
                detail: p.description,
                price: p.price,
                currency: p.currency
            });
        }
    );

    $$(
        '#featured-combos [data-consult-combo], #catalog-grid [data-consult-combo]'
    ).forEach(
        b => b.onclick = () => {
            const c = combos.find(
                x => x.id === b.dataset.consultCombo
            );

            if (!c) {
                return;
            }

            const n = phone('combos');

            if (!n) {
                alert('No hay un número de WhatsApp configurado para consultas.');
                return;
            }

            const message = [
                `Hola, quiero consultar sobre el combo ${c.name}.`,
                '',
                'CONSULTA DE COMBO',
                '=============================',
                `Combo: ${c.name}`,
                '',
                'Quisiera conocer disponibilidad, precio y condiciones.',
            ]
                .join('\n');

            window.open(
                `https://wa.me/${n}?text=${encodeURIComponent(message)}`,
                '_blank',
                'noopener,noreferrer'
            );
        }
    );

    $$(
        '#featured-offers [data-consult-offer], #catalog-grid [data-consult-offer]'
    ).forEach(
        b => b.onclick = () => {
            const o = quantityOffers.find(
                x => x.id === b.dataset.consultOffer
            );

            if (!o) {
                return;
            }

            const n = phone('offers');

            if (!n) {
                alert('No hay un número de WhatsApp configurado para consultas.');
                return;
            }

            const message = [
                `Hola, quiero consultar sobre la oferta ${o.name}.`,
                '',
                '*CONSULTA DE OFERTA*',
                '=============================',
                `Oferta: ${o.name}`,
                `Cantidad: ${o.quantity} unidades`,
                '',
                'Quisiera conocer disponibilidad, precio según cantidad y condiciones.',
            ]
                .join('\n');

            window.open(
                `https://wa.me/${n}?text=${encodeURIComponent(message)}`,
                '_blank',
                'noopener,noreferrer'
            );
        }
    );
}


function renderCart() {
    const box = $('[data-cart-items]');
    const empty = $('[data-cart-empty]');
    const footer = $('[data-cart-footer]');

    if (!box) {
        return;
    }

    const c = getCart();

    box.innerHTML = '';

    if (!c.length) {
        empty?.removeAttribute('hidden');
        footer?.setAttribute('hidden', '');

        return;
    }

    empty?.setAttribute('hidden', '');
    footer?.removeAttribute('hidden');

    c.forEach((x, i) => {
        const e = document.createElement('article');

        e.className = 'cart-item';

        e.innerHTML = `
            <div class="cart-item__name">
                ${x.name}
            </div>

            <div class="cart-item__subtotal">
                ${
                    x.price > 0
                        ? money(
                            x.price * x.quantity,
                            x.currency
                        )
                        : 'Consultar'
                }
            </div>

            <button
                type="button"
                class="cart-item__remove"
                data-remove="${i}"
                aria-label="Eliminar ${x.name}"
                title="Eliminar ${x.name}"
            >
                <img
                    src="${asset('image/delete.png')}"
                    alt=""
                >
            </button>

            <div class="cart-item__unit-price">
                Precio unitario:
                ${money(x.price, x.currency)}
            </div>

            <div class="cart-item__controls">

                <div class="cart-item__quantity">

                    <button
                        type="button"
                        class="cart-item__quantity-button"
                        data-decrease="${i}"
                        aria-label="Disminuir cantidad"
                    >
                        −
                    </button>

                    <span class="cart-item__quantity-value">
                        ${x.quantity} ${x.unitLabel || ''}
                    </span>

                    <button
                        type="button"
                        class="cart-item__quantity-button"
                        data-increase="${i}"
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>

                </div>

            </div>
        `;

        box.appendChild(e);
    });

    $$('[data-decrease]', box).forEach(
        b => b.onclick = () =>
            changeQuantity(
                Number(b.dataset.decrease),
                -1
            )
    );

    $$('[data-increase]', box).forEach(
        b => b.onclick = () =>
            changeQuantity(
                Number(b.dataset.increase),
                1
            )
    );

    $$('[data-remove]', box).forEach(
        b => b.onclick = () =>
            remove(Number(b.dataset.remove))
    );


    /* =====================================================
       CART TOTAL
       ===================================================== */

    const total = $('[data-cart-total]');

    if (!total) {
        return;
    }

    const hasUnknownPrice = c.some(
        x => !x.price || x.price <= 0
    );

    if (hasUnknownPrice) {
        total.textContent = 'Consultar';
        return;
    }

    const totals = {};

    c.forEach(x => {
        const currency = x.currency || 'CUP';

        if (!totals[currency]) {
            totals[currency] = 0;
        }

        totals[currency] +=
            Number(x.price) * Number(x.quantity);
    });

    const totalEntries = Object.entries(totals);

    total.textContent = totalEntries
        .map(
            ([currency, amount]) =>
                money(amount, currency)
        )
        .join(' · ');
}



/* =========================================================
   CHECKOUT
   ========================================================= */

function checkoutItem(x) {
    return `
        <article class="checkout-item">

            <div>
                <strong class="checkout-item__name">
                    ${x.name}
                </strong>

                <div class="checkout-item__quantity">
                    Cantidad:
                    ${x.quantity}
                    ${x.unitLabel || ''}
                </div>
            </div>

            <strong class="checkout-item__subtotal">
                ${
                    x.price > 0
                        ? money(
                            x.price * x.quantity,
                            x.currency
                        )
                        : 'Consultar'
                }
            </strong>

        </article>
    `;
}


function renderCheckout() {

    const items = $('[data-checkout-items]');
    const empty = $('[data-checkout-empty]');
    const summary = $('[data-checkout-summary]');
    const subtotal = $('[data-checkout-subtotal]');
    const total = $('[data-checkout-total]');

    if (!items) {
        return;
    }

    const c = getCart();

    items.innerHTML = '';


    /* =====================================================
       CARRITO VACÍO
       ===================================================== */

    if (!c.length) {

        empty?.removeAttribute('hidden');
        summary?.setAttribute('hidden', '');

        return;
    }


    empty?.setAttribute('hidden', '');
    summary?.removeAttribute('hidden');


    /* =====================================================
       PRODUCTOS
       ===================================================== */

    items.innerHTML = c
        .map(checkoutItem)
        .join('');


    /* =====================================================
       SUBTOTAL
       ===================================================== */

    const hasUnknownPrice = c.some(
        x => !x.price || x.price <= 0
    );

    if (hasUnknownPrice) {

        if (subtotal) {
            subtotal.textContent = 'Consultar';
        }

        if (total) {
            total.textContent = 'Consultar';
        }

        return;
    }


    const totals = {};

    c.forEach(x => {

        const currency = x.currency || 'CUP';

        if (!totals[currency]) {
            totals[currency] = 0;
        }

        totals[currency] +=
            Number(x.price) * Number(x.quantity);

    });


    const totalEntries = Object.entries(totals);


    const formatted = totalEntries
        .map(
            ([currency, amount]) =>
                money(amount, currency)
        )
        .join(' · ');


    if (subtotal) {
        subtotal.textContent = formatted;
    }

    /*
     * La mensajería todavía no tiene precio confirmado.
     * Por eso el total tampoco puede considerarse definitivo.
     */

    if (total) {
        total.textContent = 'Por confirmar';
    }

}



function orderMessage(customer) {

    const c = getCart();

    const hasUnknownPrice = c.some(
        x => !x.price || x.price <= 0
    );


    /* =====================================================
       SUBTOTAL
       ===================================================== */

    let subtotal = 'Consultar';

    if (!hasUnknownPrice) {

        const totals = {};

        c.forEach(x => {

            const currency = x.currency || 'CUP';

            if (!totals[currency]) {
                totals[currency] = 0;
            }

            totals[currency] +=
                Number(x.price) * Number(x.quantity);

        });

        subtotal = Object.entries(totals)
            .map(
                ([currency, amount]) =>
                    money(amount, currency)
            )
            .join(' · ');
    }


    /* =====================================================
       PRODUCTOS
       ===================================================== */

    const productsText = c.flatMap((x, i) => {

        const amount =
            x.price > 0
                ? money(
                    x.price * x.quantity,
                    x.currency
                )
                : 'Consultar';

        return [
            `${i + 1}. ${x.name}`,
            `   Cantidad: ${x.quantity} ${x.unitLabel || ''}`.trim(),
            `   Monto: ${amount}`,
            ''
        ];

    });


    /* =====================================================
       DATOS DEL CLIENTE
       ===================================================== */

    const customerText = [
        ' ',
        '*DATOS DEL CLIENTE*',
        '==============================',
        `Nombre: ${customer.name}`,
        `Dirección: ${customer.address}`,
        `Punto de referencia: ${customer.reference}`,
        customer.observations
            ? `Observaciones: ${customer.observations}`
            : ''
    ];


    /* =====================================================
       MENSAJE FINAL
       ===================================================== */

    return [
        `Hola, quiero realizar un pedido en ${store.name}.`,
        '',
        '*VALE DE PEDIDO*',
        '=============================',
        '',
        ...productsText,
        '',
        '=============================',
        `SUBTOTAL: ${subtotal}`,
        '',
        'MENSAJERÍA: Por confirmar',
        '',
        'TOTAL: Por confirmar',
        '',
        '',
        ...customerText,
        '',
        '',
        '=============================',
        '',
        'Solicito confirmación de disponibilidad, precio final y condiciones del pedido.',
        'El pedido queda *PENDIENTE* hasta recibir confirmación de un agente de la tienda.',
        'El costo de la mensajería será informado por el agente.'
    ]
        .filter(Boolean)
        .join('\n');
}



function submitCheckout(form) {

    const c = getCart();

    if (!c.length) {
        return;
    }


    /* =====================================================
       DATOS DEL CLIENTE
       ===================================================== */

    const formData = new FormData(form);

    const customer = {
        name: String(
            formData.get('name') || ''
        ).trim(),

        address: String(
            formData.get('address') || ''
        ).trim(),

        reference: String(
            formData.get('reference') || ''
        ).trim(),

        observations: String(
            formData.get('observations') || ''
        ).trim()
    };


    /* =====================================================
       VALIDACIÓN
       ===================================================== */

    if (
        !customer.name ||
        !customer.address ||
        !customer.reference
    ) {

        alert(
            'Completa los campos obligatorios antes de continuar.'
        );

        return;
    }


    /* =====================================================
       WHATSAPP
       ===================================================== */

    const n = phone('orders');

    if (!n) {

        alert(
            'No hay un número de WhatsApp configurado para pedidos.'
        );

        return;
    }


    /* =====================================================
       MENSAJE
       ===================================================== */

    const message = orderMessage(customer);


    /* =====================================================
       ABRIR WHATSAPP
       ===================================================== */

    window.open(
        `https://wa.me/${n}?text=${encodeURIComponent(message)}`,
        '_blank',
        'noopener,noreferrer'
    );


    /* =====================================================
       LIMPIAR CARRITO
       ===================================================== */

    clear();
}




function phone(kind) {
    return String(
        store?.whatsapp?.[kind]?.number || ''
    ).replace(/\D/g, '');
}

function sendOrder() {

    const c = getCart();

    if (!c.length) {
        return;
    }

    window.location.href =
        inView
            ? 'checkout.html'
            : 'view/checkout.html';

}


function renderHome() {
    const p = $('#featured-products');
    const c = $('#featured-combos');
    const o = $('#featured-offers');

    if (p) {
        p.innerHTML = products
            .filter(x => x.visible === true)
            .filter(x => x.outstanding === true)
            .slice(0, 8)
            .map(productCard)
            .join('');
    }

    if (c) {
        c.innerHTML = combos
            .filter(x => x.visible === true)
            .filter(x => x.outstanding === true)
            .map(comboCard)
            .join('');
    }

    if (o) {
        o.innerHTML = quantityOffers
            .filter(x => x.visible === true)
            .filter(x => x.outstanding === true)
            .map(offerCard)
            .join('');
    }

    bindCards();
}


function renderCatalog() {
    const grid = $('#catalog-grid');
    const filters = $('#catalog-filters');

    if (!grid || !filters) {
        return;
    }

    const items = [
        ...visible(products),
        ...visible(combos),
        ...visible(quantityOffers)
    ];

    const cats = [
        ...new Map(
            items.map(x => [
                slug(x.category),
                x.category
            ])
        ).entries()
    ];

    filters.innerHTML = `
        <button
            class="filter-button is-active"
            data-filter="all"
        >
            Todos
        </button>

        ${cats
            .map(
                ([s, n]) => `
                    <button
                        class="filter-button"
                        data-filter="${s}"
                    >
                        ${n}
                    </button>
                `
            )
            .join('')}
    `;

    let active = 'all';
    let query = '';

    const draw = () => {
        const list = items.filter(
            x =>
                (active === 'all' ||
                    slug(x.category) === active) &&
                norm(
                    `${x.name} ${x.category} ${x.description || ''}`
                ).includes(norm(query))
        );

        grid.innerHTML = list.length
            ? list
                .map(
                    x =>
                        products.includes(x)
                            ? productCard(x)
                            : combos.includes(x)
                                ? comboCatalogCard(x)
                                : offerCard(x)
                )
                .join('')
            : `
                <div class="empty-state">
                    <span>
                        00
                    </span>

                    <h3>
                        No encontramos resultados.
                    </h3>

                    <p>
                        Prueba con otro término o categoría.
                    </p>
                </div>
            `;

        $('#catalog-result').textContent =
            `${list.length} ${
                list.length === 1
                    ? 'resultado'
                    : 'resultados'
            }`;

        bindCards();
    };

    $$('[data-filter]', filters).forEach(
        b => b.onclick = () => {
            $$('[data-filter]', filters).forEach(
                x => x.classList.remove('is-active')
            );

            b.classList.add('is-active');

            active = b.dataset.filter;

            draw();
        }
    );

    $('[data-catalog-search]')?.addEventListener(
        'input',
        e => {
            query = e.target.value;
            draw();
        }
    );

    draw();
}


function storeInfo() {

    $$('[data-store-name]').forEach(
        e => e.textContent = store.name
    );


    const address = [
        store.address?.street,
        store.address?.city,
        store.address?.province
    ]
        .filter(Boolean)
        .join(', ') || 'Dirección pendiente';


    $$('[data-store-address]').forEach(e => {

        e.textContent = address;

        if (store.address?.link) {
            e.href = store.address.link;
            e.target = '_blank';
            e.rel = 'noopener noreferrer';
        }

    });


    $$('[data-store-opening]').forEach(
        e => e.textContent = store.schedule?.opening || ''
    );


    $$('[data-store-closing]').forEach(
        e => e.textContent = store.schedule?.closing || ''
    );


    const links = {
        offers: 'data-whatsapp-offers',
        combos: 'data-whatsapp-combos',
        orders: 'data-whatsapp-orders',
        support: 'data-whatsapp-support'
    };


    Object.entries(links).forEach(
        ([k, a]) =>
            $$(`[${a}]`).forEach(e => {

                const n = phone(k);

                if (n) {

                    const message =
                        k === 'support'
                            ? 'Hola, quisiera obtener información sobre sus productos.'
                            : '';

                    e.href =
                        `https://wa.me/${n}` +
                        (
                            message
                                ? `?text=${encodeURIComponent(message)}`
                                : ''
                        );

                    e.target = '_blank';
                    e.rel = 'noopener noreferrer';
                }

            })
    );


    $$('[data-whatsapp-channel]').forEach(e => {

        if (store?.whatsapp?.channel?.url) {
            e.href = store.whatsapp.channel.url;
            e.target = '_blank';
            e.rel = 'noopener noreferrer';
        }

    });


    $$('[data-whatsapp-group]').forEach(e => {

        if (store?.whatsapp?.group?.url) {
            e.href = store.whatsapp.group.url;
            e.target = '_blank';
            e.rel = 'noopener noreferrer';
        }

    });

}

function lazyMap() {
    const map = $('[data-map]');

    if (!map || !store?.address?.embed) {
        return;
    }

    const load = () => {
        if (map.dataset.loaded) {
            return;
        }

        const iframe = document.createElement('iframe');

        iframe.src = store.address.embed;
        iframe.title = `Ubicación de ${store.name}`;
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';

        map.replaceChildren(iframe);
        map.dataset.loaded = 'true';
    };

    const observer = new IntersectionObserver(
        entries => {
            if (entries[0].isIntersecting) {
                load();
                observer.disconnect();
            }
        },
        {
            rootMargin: '500px'
        }
    );

    observer.observe(map);
}








document.addEventListener(
    'DOMContentLoaded',
    () => {
        storeInfo();
        renderHome();
        renderCatalog();
        updateCart();
        renderCart();
        renderCheckout();
        lazyMap();

        $('[data-cart-toggle]')
            ?.addEventListener('click', openCart);

        $('[data-cart-close]')
            ?.addEventListener('click', closeCart);

        $('[data-cart-overlay]')
            ?.addEventListener('click', closeCart);

        $('[data-clear-cart]')
            ?.addEventListener('click', clear);

        $('[data-whatsapp-order]')
            ?.addEventListener('click', sendOrder);

        const checkoutForm = $('[data-checkout-form]');

        checkoutForm?.addEventListener(
            'submit',
            e => {
                e.preventDefault();

                submitCheckout(checkoutForm);
            }
        );

        const menuButton = $('[data-menu-toggle]');
        const mobileMenu = $('[data-mobile-menu]');

        menuButton?.addEventListener('click', () => {
            const isOpen = mobileMenu?.classList.toggle('is-open');

            menuButton.classList.toggle('is-open', isOpen);

            menuButton.setAttribute(
                'aria-expanded',
                String(isOpen)
            );
        });

        $$('[data-mobile-menu] a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu?.classList.remove('is-open');
                menuButton?.classList.remove('is-open');

                menuButton?.setAttribute(
                    'aria-expanded',
                    'false'
                );
            });
        });

        $$('[data-year]').forEach(
            e => e.textContent = new Date().getFullYear()
        );

        document.addEventListener(
            'keydown',
            e => {
                if (e.key === 'Escape') {
                    closeCart();
                }
            }
        );
    }
);


