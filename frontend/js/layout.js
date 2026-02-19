// js/layout.js

function loadHeader() {
    // 1. 判斷路徑邏輯
    const isInnerPage = window.location.pathname.includes('/pages/');
    const imgPath = isInnerPage ? '../assets/images/' : './assets/images/';
    const productLink = isInnerPage ? 'products.html' : 'pages/products.html';

    // 2. 檢查登入狀態 (讀取 LocalStorage)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username') || 'User';

    // 3. 動態決定右上角的「登入/登出」區塊 HTML
    let authHTML = '';
    if (isLoggedIn) {
        authHTML = `
            <li><span class="auth-username" style="color: #06b6d4; margin-right: 15px; font-weight: bold; letter-spacing: 1px;">[ ${username.toUpperCase()} ]</span></li>
            <li><a href="#" id="logout-btn" style="color: #ef4444; text-shadow: 0 0 5px rgba(239, 68, 68, 0.5);">登出</a></li>
        `;
    } else {
        authHTML = `<li><a href="${isInnerPage ? 'login.html' : 'pages/login.html'}">登入</a></li>`;
    }

    // 4. 定義 HTML (🔥 結構大升級：將所有選單包在 .nav-menu 中，漢堡按鈕獨立)
    const headerHTML = `
    <header>
        <div class="logo">
            <a href="${isInnerPage ? '../index.html' : 'index.html'}">
                <img src="${imgPath}logo.png" alt="網站首頁">
            </a>
        </div>
        
        <button class="menu-toggle" aria-label="切換導航">☰</button>
        
        <nav class="nav-menu">
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
                    <li><a href="${isInnerPage ? 'cart.html' : 'pages/cart.html'}" id="nav-cart-link">購物車</a></li>
                    ${authHTML}
                    <li><a href="${isInnerPage ? 'contact_us.html' : 'pages/contact_us.html'}">聯絡我們</a></li>
                </ul>
            </div>
        </nav>
    </header>
    `;

    // 5. 插入到網頁
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // 6. 綁定漢堡選單 (🔥 現在點擊會直接控制整個大選單 .nav-menu)
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu'); 

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (navMenu) navMenu.classList.toggle('active'); 
        });
    }

    // 7. 綁定「登出」按鈕的功能
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault(); 
            const confirmLogout = confirm("⚠️ 系統提示：確定要登出系統並清空目前的購物車嗎？");
            if (confirmLogout) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                localStorage.removeItem('techCart');
                alert("🚪 系統登出完畢，購物車已淨空，期待您再次回來！");
                window.location.href = isInnerPage ? '../index.html' : 'index.html';
            }
        });
    }
    
    // 8. 購物車權限攔截
    const navCartLink = document.getElementById('nav-cart-link');
    if (navCartLink) {
        navCartLink.addEventListener('click', function(e) {
            const isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isUserLoggedIn) {
                e.preventDefault(); 
                const confirmLogin = confirm("⚠️ 存取被拒：請先登入系統才能檢視購物車。\n\n是否立即前往登入頁面？");
                if (confirmLogin) {
                    window.location.href = isInnerPage ? 'login.html' : 'pages/login.html';
                }
            }
        });
    }

    // 9. 搜尋列功能
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const searchInput = this.querySelector('input');
            const keyword = searchInput.value.trim(); 
            
            if (keyword) {
                const productLink = isInnerPage ? 'products.html' : 'pages/products.html';
                window.location.href = `${productLink}?search=${encodeURIComponent(keyword)}`;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', loadHeader);