// js/layout.js

function loadHeader() {
    // 判斷目前層級，如果在 pages 資料夾內，圖片路徑需要多一個 "../"
    // 這是一個簡單的判斷，確保 logo 不會破圖
    const isInnerPage = window.location.pathname.includes('/pages/');
    const pathPrefix = isInnerPage ? '../' : './';
    const linkPrefix = isInnerPage ? '' : 'pages/'; 
    // 如果在首頁(外層)，連結要去 pages/products.html
    // 如果在內頁，連結直接去 products.html
    
    // 這裡我們修正邏輯：
    // 假設 index.html 在根目錄，其他在 pages/
    // 圖片：根目錄用 ./assets，內頁用 ../assets
    // 連結：根目錄去 pages/xxx.html，內頁去 xxx.html (首頁連結要特別處理)

    const imgPath = isInnerPage ? '../assets/images/' : './assets/images/';
    
    // 定義導覽列 HTML
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
                    <li><a href="${isInnerPage ? 'products.html' : 'pages/products.html'}">景品</a></li>
                    <li><a href="${isInnerPage ? 'products.html' : 'pages/products.html'}">卡片</a></li>
                    <li><a href="${isInnerPage ? 'products.html' : 'pages/products.html'}">衣服</a></li>
                    <li><a href="${isInnerPage ? 'products.html' : 'pages/products.html'}">樂器</a></li>
                    <li><a href="${isInnerPage ? 'products.html' : 'pages/products.html'}">其他</a></li>
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

    // 插入到網頁最上方
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // 重新綁定漢堡選單的事件 (因為 HTML 是後來才生出來的，必須在這裡綁定)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLeft = document.querySelector('.nav-left ul');
    if(menuToggle && navLeft){
        menuToggle.addEventListener('click', () => {
            navLeft.classList.toggle('active');
        });
    }
}

// 當網頁載入完成後，執行 loadHeader
document.addEventListener('DOMContentLoaded', loadHeader);