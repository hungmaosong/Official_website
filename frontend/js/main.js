// js/main.js

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. 輪播圖功能 (只在有輪播圖的頁面執行)
    // ==========================================
    var myCarousel = document.querySelector('#carouselExampleIndicators');
    if (myCarousel) {
        new bootstrap.Carousel(myCarousel, {
            interval: 3000,
            ride: 'carousel'
        });
    }

   // ==========================================
    // 2. 商品列表渲染功能 (含分類篩選)
    // ==========================================
    const productsContainer = document.getElementById("products-container");
    
    if (productsContainer) {
        
        if (typeof productsData === 'undefined') {
            productsContainer.innerHTML = '<p class="text-white text-center">Data Error</p>';
            return;
        }

        // --- 1. 取得網址上的分類參數 ---
        const urlParams = new URLSearchParams(window.location.search);
        const currentCategory = urlParams.get('category'); // 例如 'figure', 'card'...

        // --- 2. 篩選資料 ---
        let filteredProducts = productsData;
        let categoryTitle = "全部商品 ALL PRODUCTS";

        // 定義分類名稱對照表 (用來顯示標題)
        const categoryMap = {
            'figure': '景品模型 FIGURE',
            'card': '稀有卡片 CARD',
            'clothes': '潮流服飾 APPAREL',
            'music': '音樂周邊 MUSIC GEAR',
            'other': '其他配件 OTHERS'
        };

        if (currentCategory && currentCategory !== 'all') {
            // 過濾陣列
            filteredProducts = productsData.filter(p => p.category === currentCategory);
            
            // 更新標題變數
            if (categoryMap[currentCategory]) {
                categoryTitle = categoryMap[currentCategory];
            }
        }

        // --- 3. 更新頁面標題 (UX 優化) ---
        const pageTitleElement = document.querySelector('.section-title');
        if (pageTitleElement) {
            // 把原本的 "商品 PRODUCTS" 換成 "景品模型 FIGURE"
            // 分割中英文，加上樣式
            const parts = categoryTitle.split(' ');
            if (parts.length >= 2) {
                 pageTitleElement.innerHTML = `${parts[0]} <span class="highlight">${parts.slice(1).join(' ')}</span>`;
            } else {
                 pageTitleElement.innerText = categoryTitle;
            }
        }

        // --- 4. 渲染邏輯 (使用 filteredProducts 而不是 productsData) ---
        const itemsPerPage = 8;
        let currentPage = 1;

        function renderProducts(page) {
            productsContainer.innerHTML = "";
            
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            // 注意：這裡改成用 filteredProducts
            const currentItems = filteredProducts.slice(startIndex, endIndex);

            if(currentItems.length === 0) {
                productsContainer.innerHTML = `
                    <div class="col-12 text-center" style="padding: 50px;">
                        <h3 class="text-muted" style="letter-spacing: 2px;">NO DATA FOUND</h3>
                        <p style="color: #64748b;">此分類目前沒有庫存</p>
                        <a href="products.html" class="btn btn-outline-light mt-3">返回全部商品</a>
                    </div>`;
                // 隱藏分頁按鈕
                document.querySelector('.pagination-tech').style.display = 'none';
                return;
            } else {
                // 有資料就顯示分頁按鈕
                const pagination = document.querySelector('.pagination-tech');
                if(pagination) pagination.style.display = 'flex';
            }

            // 生成卡片 HTML (跟之前一樣)
            currentItems.forEach(product => {
                // 判斷庫存
                let stockHTML = '';
                let btnState = '';
                let btnText = '加入購物車';
                let btnClass = 'btn-primary';

                if (product.stock === 0) {
                    stockHTML = `<span class="stock-badge out-of-stock">庫存不足 OUT OF STOCK</span>`;
                    btnState = 'disabled';
                    btnText = '補貨中...';
                    btnClass = 'btn-secondary';
                } else if (product.stock <= 5) {
                    stockHTML = `<span class="stock-badge low-stock">剩餘庫存: ${product.stock} (稀有!)</span>`;
                } else {
                    stockHTML = `<span class="stock-badge normal-stock">庫存充足: ${product.stock}</span>`;
                }

                const productHTML = `
                    <div class="col-12 col-md-6 col-lg-3">
                        <div class="tech-card h-100 d-flex flex-column">
                            <div class="card-img-wrapper">
                                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                                <div class="img-overlay"></div>
                            </div>
                            <div class="card-body-tech d-flex flex-column flex-grow-1">
                                <h5 class="card-title mb-1" style="color: #fff; font-weight: 600;">${product.name}</h5>
                                <div class="price-tag mb-2" style="color: var(--accent);">NT$${product.price}</div>
                                <div class="mb-3">${stockHTML}</div>
                                <div class="mt-auto d-grid gap-2">
                                    <button class="btn btn-outline-light btn-sm" style="border-radius: 50px;">查看詳情</button>
                                    <button class="btn ${btnClass} btn-sm add-to-cart" ${btnState}
                                        data-id="${product.id}" data-name="${product.name}"
                                        data-price="${product.price}" data-image="${product.image}" data-stock="${product.stock}"
                                        style="border-radius: 50px; border:none;">${btnText}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                productsContainer.insertAdjacentHTML('beforeend', productHTML);
            });

            updatePaginationButtons();
        }

        // 更新分頁按鈕 (依據篩選後的數量)
        function updatePaginationButtons() {
            const prevBtn = document.getElementById('prev-page');
            const nextBtn = document.getElementById('next-page');
            const pageInfo = document.getElementById('page-info');

            if(prevBtn && nextBtn) {
                prevBtn.disabled = currentPage === 1;
                // 注意：這裡是用 filteredProducts.length
                nextBtn.disabled = currentPage * itemsPerPage >= filteredProducts.length;
                if(pageInfo) pageInfo.innerText = `PAGE 0${currentPage}`;
            }
        }

        // 綁定分頁點擊
        document.getElementById('prev-page')?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts(currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
            if (currentPage * itemsPerPage < filteredProducts.length) {
                currentPage++;
                renderProducts(currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // 初次執行
        renderProducts(currentPage);
    }

    // ==========================================
    // 3. 購物車互動功能 (Tech Modal & Toast)
    // ==========================================
    
    // 只有當頁面上有 cartModal 時才執行這段邏輯
    const cartModalEl = document.getElementById('cartModal');
    if (cartModalEl) {
        
        // 初始化 Bootstrap Modal
        const cartModal = new bootstrap.Modal(cartModalEl);
        
        // 暫存當前選擇的商品
        let currentProduct = {};

        // A. 打開視窗 (事件委派)
        document.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('add-to-cart')) {
                const btn = e.target;
                
                // 抓取按鈕上的資料
                currentProduct = {
                    id: btn.getAttribute('data-id'),
                    name: btn.getAttribute('data-name'),
                    price: btn.getAttribute('data-price'),
                    image: btn.getAttribute('data-image')
                };

                // 填入資料到 Modal
                document.getElementById('modal-product-name').textContent = currentProduct.name;
                document.getElementById('modal-product-price').textContent = `NT$${currentProduct.price}`;
                document.getElementById('modal-product-img').src = currentProduct.image;
                
                // 重置數量
                document.getElementById('modal-quantity').value = 1;

                // 顯示視窗
                cartModal.show();
            }
        });

        // B. 數量加減按鈕
        const btnMinus = document.getElementById('btn-minus');
        const btnPlus = document.getElementById('btn-plus');
        const inputQty = document.getElementById('modal-quantity');

        if (btnMinus && btnPlus && inputQty) {
            btnPlus.addEventListener('click', () => {
                inputQty.value = parseInt(inputQty.value) + 1;
            });

            btnMinus.addEventListener('click', () => {
                if (parseInt(inputQty.value) > 1) {
                    inputQty.value = parseInt(inputQty.value) - 1;
                }
            });
        }

        // C. 確認加入按鈕
        const confirmBtn = document.getElementById('confirm-add-cart');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                const quantity = parseInt(document.getElementById('modal-quantity').value);
                
                // --- 未來這裡會加入 localStorage 儲存邏輯 ---
                console.log(`[系統] 加入購物車: ${currentProduct.name} x ${quantity}`);

                // 關閉視窗
                cartModal.hide();

                // 顯示通知
                setTimeout(() => {
                    showToast(currentProduct.name, quantity);
                }, 300);
            });
        }
    }

    // D. 通知顯示函式 (Toast)
    function showToast(productName, quantity) {
        const toast = document.getElementById('cart-toast');
        const msg = document.getElementById('toast-message');
        
        if (toast && msg) {
            msg.textContent = `已將 ${quantity} 個「${productName}」加入購物車`;
            toast.classList.add('show');
            
            // 3秒後自動消失
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // ==========================================
    // 4. 登入頁密碼顯示切換
    // ==========================================
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            // 切換 type 屬性
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // 切換圖示
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    // ==========================================
    // 5. 安全驗證碼邏輯 (Captcha System)
    // ==========================================
    const captchaDisplay = document.getElementById('captcha-code');
    const captchaInput = document.getElementById('captcha-input');
    const refreshBtn = document.getElementById('refresh-captcha');
    const loginForm = document.querySelector('#login_block form');

    // 隨機產生 4 位數驗證碼
    function generateCaptcha() {
        if (!captchaDisplay) return;
        
        const randomNum = Math.floor(Math.random() * 10000);
        const code = randomNum.toString().padStart(4, '0');
        
        captchaDisplay.innerText = code;
        captchaDisplay.setAttribute('data-code', code);
    }

    // 初始化
    generateCaptcha();

    // 點擊刷新按鈕
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            captchaDisplay.style.opacity = '0.5';
            setTimeout(() => {
                generateCaptcha();
                captchaDisplay.style.opacity = '1';
                captchaInput.value = '';
                captchaInput.focus();
            }, 200);
        });
    }

    // 攔截表單登入
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userCode = captchaInput.value;
            const realCode = captchaDisplay.getAttribute('data-code');

            if (userCode !== realCode) {
                alert("⛔ 安全驗證失敗：驗證碼錯誤！");
                captchaInput.classList.add('is-invalid');
                captchaInput.value = '';
                generateCaptcha();
            } else {
                alert("✅ 身份驗證通過！正在進入系統...");
                // 這裡之後會接真正的登入跳轉
            }
        });
        
        captchaInput.addEventListener('input', () => {
            captchaInput.classList.remove('is-invalid');
        });
    }
});