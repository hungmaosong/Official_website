// js/layout.js

function loadHeader() {
    // 1. 判斷路徑邏輯 (保留你的原創邏輯)
    const isInnerPage = window.location.pathname.includes('/pages/');
    const imgPath = isInnerPage ? '../assets/images/' : './assets/images/';
    
    // 定義商品頁的路徑變數，方便下面重複使用
    // 如果在內頁 -> products.html
    // 如果在首頁 -> pages/products.html
    const productLink = isInnerPage ? 'products.html' : 'pages/products.html';

    // 2. 定義 HTML (完全保留你的結構)
    const headerHTML = `
    <header>
        <div class="logo">
            <a href="${isInnerPage ? '../index.html' : 'index.html'}">
                <img src="${imgPath}logo.png" alt="網站首頁">
            </a>
        </div>
        <nav>
            <button class="menu-toggle" aria-label="切換導航">☰</button>
            
            <div class="nav-left">
                <ul>
                    <li><a href="${productLink}?category=figure">景品</a></li>
                    <li><a href="${productLink}?category=card">卡片</a></li>
                    <li><a href="${productLink}?category=clothes">衣服</a></li>
                    <li><a href="${productLink}?category=music">樂器</a></li>
                    <li><a href="${productLink}?category=other">其他</a></li>
                    
                    <li class="search-wrapper">
                        <form id="search-form">
                            <input type="text" placeholder="搜尋商品...">
                        </form>
                    </li>
                </ul>
            </div>

            <div class="nav-right">
                <ul>
                    <li><a href="${isInnerPage ? 'cart.html' : 'pages/cart.html'}">購物車</a></li>
                    <li><a href="${isInnerPage ? 'login.html' : 'pages/login.html'}">登入</a></li>
                    <li><a href="${isInnerPage ? 'contact_us.html' : 'pages/contact_us.html'}">聯絡我們</a></li>
                </ul>
            </div>
        </nav>
    </header>
    `;

    // 3. 插入到網頁
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // 4. 綁定漢堡選單 (保留你的 JS)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLeft = document.querySelector('.nav-left ul'); // 注意：你的 CSS 可能是控制 ul 的顯示
    
    if(menuToggle && navLeft){
        menuToggle.addEventListener('click', () => {
            // 這裡假設你的 CSS 是寫 .nav-left ul.active 或 .nav-left.active
            // 根據你的原始代碼，通常是切換 active class
            navLeft.classList.toggle('active'); 
            
            // 如果你的 CSS 是寫在 .nav-left 上，請改用下面這行：
            // document.querySelector('.nav-left').classList.toggle('active');
        });
    }
}

document.addEventListener('DOMContentLoaded', loadHeader);