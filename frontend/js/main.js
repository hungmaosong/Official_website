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

        // --- 1. 取得網址上的參數 (加入搜尋參數) ---
        const urlParams = new URLSearchParams(window.location.search);
        const currentCategory = urlParams.get('category'); // 例如 'figure', 'card'...
        const searchQuery = urlParams.get('search');       // 新增：取得搜尋關鍵字

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

        // 🔥 邏輯判斷：搜尋的優先權高於分類
        if (searchQuery) {
            // 如果有搜尋關鍵字，忽略分類，直接比對名稱 (轉小寫比對)
            const lowerKeyword = searchQuery.toLowerCase();
            filteredProducts = productsData.filter(p => p.name.toLowerCase().includes(lowerKeyword));
            categoryTitle = `搜尋結果 SEARCH RESULTS`;
        } 
        else if (currentCategory && currentCategory !== 'all') {
            // 過濾陣列 (如果是分類模式)
            filteredProducts = productsData.filter(p => p.category === currentCategory);
            
            // 更新標題變數
            if (categoryMap[currentCategory]) {
                categoryTitle = categoryMap[currentCategory];
            }
        }

        // --- 3. 更新頁面標題 (UX 優化) ---
        const pageTitleElement = document.querySelector('.section-title');
        if (pageTitleElement) {
            // 🔥 如果是搜尋模式，標題顯示「搜尋結果 "關鍵字"」
            if (searchQuery) {
                pageTitleElement.innerHTML = `搜尋結果 <span class="highlight">"${searchQuery}"</span>`;
            } else {
                // 把原本的 "商品 PRODUCTS" 換成 "景品模型 FIGURE"
                // 分割中英文，加上樣式
                const parts = categoryTitle.split(' ');
                if (parts.length >= 2) {
                     pageTitleElement.innerHTML = `${parts[0]} <span class="highlight">${parts.slice(1).join(' ')}</span>`;
                } else {
                     pageTitleElement.innerText = categoryTitle;
                }
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
                // 🔥 動態判斷是「分類沒庫存」還是「搜不到商品」，並保留你的中文習慣
                const emptyMessage = searchQuery ? `找不到包含「${searchQuery}」的商品` : '此分類目前沒有庫存';
                
                productsContainer.innerHTML = `
                    <div class="col-12 text-center" style="padding: 50px;">
                        <h3 class="text-muted" style="letter-spacing: 2px;">NO DATA FOUND</h3>
                        <p style="color: #64748b;">${emptyMessage}</p>
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
                                    <button class="btn btn-outline-light btn-sm view-details-btn" data-id="${product.id}" style="border-radius: 50px;">查看詳情</button>
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
                
                const isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                if (!isUserLoggedIn) {
                    const confirmLogin = confirm("⚠️ 存取被拒：請先登入系統才能加入購物車。\n\n是否立即前往登入頁面？");
                    if (confirmLogin) {
                        const isInnerPage = window.location.pathname.includes('/pages/');
                        window.location.href = isInnerPage ? 'login.html' : 'pages/login.html';
                    }
                    return; 
                }

                const btn = e.target;
                currentProduct = {
                    id: btn.getAttribute('data-id'),
                    name: btn.getAttribute('data-name'),
                    price: parseInt(btn.getAttribute('data-price')),
                    image: btn.getAttribute('data-image'),
                    // 🔥 關鍵：把庫存數量也抓下來
                    stock: parseInt(btn.getAttribute('data-stock')) 
                };

                document.getElementById('modal-product-name').textContent = currentProduct.name;
                document.getElementById('modal-product-price').textContent = `NT$${currentProduct.price}`;
                document.getElementById('modal-product-img').src = currentProduct.image;
                document.getElementById('modal-quantity').value = 1;

                cartModal.show();
            }
        });

        // B. 數量加減按鈕 (加入上限檢查)
        const btnMinus = document.getElementById('btn-minus');
        const btnPlus = document.getElementById('btn-plus');
        const inputQty = document.getElementById('modal-quantity');

        if (btnMinus && btnPlus && inputQty) {
            // 使用 onclick 避免重複綁定
            btnPlus.onclick = () => {
                // 🔥 檢查是否超過當前庫存
                if (parseInt(inputQty.value) < currentProduct.stock) {
                    inputQty.value = parseInt(inputQty.value) + 1;
                } else {
                    alert(`⚠️ 庫存不足：此商品目前僅剩 ${currentProduct.stock} 個！`);
                }
            };

            btnMinus.onclick = () => {
                if (parseInt(inputQty.value) > 1) {
                    inputQty.value = parseInt(inputQty.value) - 1;
                }
            };

            // ==========================================
            // 🔥 BUG修復：監聽輸入框的直接輸入事件 (防止手打突破庫存)
            // ==========================================
            inputQty.onchange = () => {
                let currentVal = parseInt(inputQty.value);

                // 1. 防呆檢查：如果輸入的不是數字，或者小於 1，就重置為 1
                if (isNaN(currentVal) || currentVal < 1) {
                    inputQty.value = 1;
                }

                // 2. 庫存檢查：如果輸入的值大於庫存
                if (currentVal > currentProduct.stock) {
                    alert(`⚠️ 庫存警報：您輸入的數量 (${currentVal}) 已超出目前庫存上限！系統將自動調整為最大可購買數量：${currentProduct.stock} 個。`);
                    // 強制把數值改回庫存上限
                    inputQty.value = currentProduct.stock;
                }
            };
        }

        // C. 確認加入按鈕 (將庫存資料一起存入 LocalStorage)
        const confirmBtn = document.getElementById('confirm-add-cart');
        if (confirmBtn) {
            confirmBtn.onclick = () => {
                const quantity = parseInt(document.getElementById('modal-quantity').value);
                
                let cart = JSON.parse(localStorage.getItem('techCart')) || [];
                const existingItemIndex = cart.findIndex(item => item.id === currentProduct.id);
                
                if (existingItemIndex > -1) {
                    // 🔥 檢查購物車內原有的數量 + 這次加的數量，會不會超過總庫存
                    let newQty = cart[existingItemIndex].quantity + quantity;
                    if (newQty > currentProduct.stock) {
                        alert(`⚠️ 商品庫存不足！您的購物車內已有 ${cart[existingItemIndex].quantity} 個，加上本次數量會超過庫存上限 (${currentProduct.stock})。`);
                        return; // 中斷，不存入
                    }
                    cart[existingItemIndex].quantity = newQty;
                } else {
                    cart.push({
                        id: currentProduct.id,
                        name: currentProduct.name,
                        price: currentProduct.price,
                        image: currentProduct.image,
                        quantity: quantity,
                        // 🔥 關鍵：把這個商品的總庫存一起存進購物車
                        stock: currentProduct.stock 
                    });
                }
                
                localStorage.setItem('techCart', JSON.stringify(cart));
                cartModal.hide();

                setTimeout(() => {
                    showToast(currentProduct.name, quantity);
                }, 300);
            };
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
            e.preventDefault(); // 先阻止表單送出
            
            // 抓取驗證碼輸入
            const userCode = captchaInput.value;
            const realCode = captchaDisplay.getAttribute('data-code');
            
            // 抓取帳號密碼輸入框
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            // 1. 第一關：驗證安全碼
            if (userCode !== realCode) {
                alert("⛔ 安全驗證失敗：驗證碼錯誤！");
                captchaInput.classList.add('is-invalid');
                captchaInput.value = '';
                generateCaptcha();
                return; // 驗證碼錯了就直接中斷，不往下檢查帳密
            } 

            // 2. 第二關：驗證帳號與密碼 (模擬資料庫比對)
            const userVal = usernameInput.value.trim();
            const passVal = passwordInput.value.trim();

            // 這裡設定最高權限測試帳號為 admin / 123456
            if (userVal === 'admin' && passVal === '123456') {
                // 登入成功：寫入 LocalStorage 記住身份
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', userVal);
                
                // 保留你的成功訊息
                alert("✅ 身份驗證通過！正在進入系統..."); 
                
                // 跳轉回首頁
                window.location.href = '../index.html'; 
            } else {
                // 登入失敗 (帳號或密碼錯誤)
                alert("⛔ 登入失敗：帳號或密碼錯誤！");
                passwordInput.value = ''; // 安全起見，清空密碼框
                captchaInput.value = '';  // 清空驗證碼框
                generateCaptcha();        // 登入失敗也要刷新驗證碼防止暴力破解
            }
        });
        
        captchaInput.addEventListener('input', () => {
            captchaInput.classList.remove('is-invalid');
        });
    }

    // ==========================================
    // 9. 購物車頁面渲染邏輯 (Cart Rendering)
    // ==========================================
    const cartItemsContainer = document.getElementById('cart_items');
    const totalPriceElement = document.getElementById('total_price');

    if (cartItemsContainer && totalPriceElement) {
        
        function renderCart() {
            // 從 LocalStorage 讀取資料
            let cart = JSON.parse(localStorage.getItem('techCart')) || [];
            cartItemsContainer.innerHTML = ''; // 清空原本的 HTML
            let total = 0; // 總金額預設為 0

            // 如果購物車是空的
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center empty-cart-msg">
                            <div class="py-5">
                                <div style="font-size: 3rem; color: rgba(6, 182, 212, 0.3); margin-bottom: 10px;">📦</div>
                                <p>您的購物車目前是空的</p>
                                <a href="products.html" class="btn btn-outline-tech mt-2">前往裝備庫</a>
                            </div>
                        </td>
                    </tr>
                `;
                totalPriceElement.innerText = `NT$0`;
                return;
            }

            // 如果有商品，把陣列裡的資料一行一行畫出來
            cart.forEach((item, index) => {
                const subtotal = item.price * item.quantity; // 計算單項小計
                total += subtotal; // 累加至總金額

                const tr = document.createElement('tr');
                tr.className = 'cart-item-row';
                tr.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center gap-3">
                            <div class="cart-img-box">
                                <img src="${item.image}" alt="${item.name}">
                            </div>
                            <span class="fw-bold text-white">${item.name}</span>
                        </div>
                    </td>
                    <td class="tech-text">NT$${item.price}</td>
                    <td class="tech-text">${item.quantity}</td>
                    <td class="tech-text highlight-text">NT$${subtotal}</td>
                    <td>
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-secondary btn-sm minus-item-btn" data-index="${index}" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">-</button>
                            <button class="btn btn-outline-info btn-sm plus-item-btn" data-index="${index}" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold;">+</button>
                        </div>
                    </td>
                `;
                cartItemsContainer.appendChild(tr);
            });

            // 更新右下角的發光總金額
            totalPriceElement.innerText = `NT$${total}`;

            // 🔥 綁定「增加數量」按鈕
            document.querySelectorAll('.plus-item-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemIndex = this.getAttribute('data-index');
                    updateCartQuantity(itemIndex, 1);
                });
            });

            // 🔥 綁定「減少數量」按鈕
            document.querySelectorAll('.minus-item-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemIndex = this.getAttribute('data-index');
                    updateCartQuantity(itemIndex, -1);
                });
            });
        }

        // 🔥 更新數量的邏輯 (加入庫存防護)
        function updateCartQuantity(index, change) {
            let cart = JSON.parse(localStorage.getItem('techCart')) || [];
            
            if (cart[index]) {
                let newQty = cart[index].quantity + change;

                // 🔥 檢查是否超過庫存 (只有在「增加數量」時才需要檢查)
                if (change > 0 && newQty > cart[index].stock) {
                    alert(`⚠️ 資源不足：此商品的庫存上限為 ${cart[index].stock} 個！`);
                    return; // 中斷，不執行更新
                }

                cart[index].quantity = newQty;

                if (cart[index].quantity <= 0) {
                    if(confirm("⚠ 數量已為 0，是否將此商品從購物車移除？")) {
                        cart.splice(index, 1); 
                    } else {
                        cart[index].quantity = 1; 
                    }
                }
                
                localStorage.setItem('techCart', JSON.stringify(cart));
                renderCart(); 
            }
        }

        // 頁面一載入就執行一次渲染
        renderCart();
    } // ⚠️ 購物車頁面邏輯到這裡結束

    // ==========================================
    // 🔥 10. 查看商品詳情 (Gallery Modal) - 移出購物車判斷區塊！
    // ==========================================
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('view-details-btn')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            
            // 由於 filteredProducts 可能是搜尋結果，保險起見我們去最原始的 productsData 找
            const product = productsData.find(p => p.id === productId);

            if (product) {
                // 1. 設定標題與價格
                document.getElementById('detail-modal-title').textContent = product.name;
                document.getElementById('detail-modal-price').textContent = `NT$${product.price}`;

                // 2. 準備圖片陣列：第一張強制是主圖 (image)，後面接上其他角度 (gallery)
                let images = [product.image];
                if (product.gallery && product.gallery.length > 0) {
                    images = images.concat(product.gallery);
                }

                // 3. 生成輪播圖 HTML
                const carouselContainer = document.getElementById('carousel-inner-container');
                carouselContainer.innerHTML = ''; // 先清空

                images.forEach((imgSrc, index) => {
                    const activeClass = index === 0 ? 'active' : ''; // 第一張要設定為 active
                    carouselContainer.innerHTML += `
                        <div class="carousel-item ${activeClass}">
                            <div style="background: #000; display:flex; justify-content:center; align-items:center; height: 400px; border-radius: 8px; overflow: hidden;">
                                <img src="${imgSrc}" style="max-height: 100%; max-width: 100%; object-fit: contain;" alt="${product.name} - 角度 ${index + 1}">
                            </div>
                        </div>
                    `;
                });

                // 4. 處理輪播圖的左右按鈕顯示 (如果只有1張圖，就隱藏左右按鈕)
                const prevBtn = document.querySelector('.carousel-control-prev');
                const nextBtn = document.querySelector('.carousel-control-next');
                if (images.length > 1) {
                    prevBtn.style.display = 'flex';
                    nextBtn.style.display = 'flex';
                } else {
                    prevBtn.style.display = 'none';
                    nextBtn.style.display = 'none';
                }

                // 5. 綁定詳情視窗裡的「加入購物車」按鈕
                const detailAddCartBtn = document.getElementById('detail-modal-add-cart');
                
                // 把目前這個商品的資料綁給這個按鈕，讓它能觸發我們之前寫好的加入購物車邏輯
                detailAddCartBtn.className = `btn ${product.stock === 0 ? 'btn-secondary' : 'btn-primary'} px-4 add-to-cart`;
                detailAddCartBtn.disabled = product.stock === 0;
                detailAddCartBtn.textContent = product.stock === 0 ? '補貨中...' : '加入購物車';
                
                detailAddCartBtn.setAttribute('data-id', product.id);
                detailAddCartBtn.setAttribute('data-name', product.name);
                detailAddCartBtn.setAttribute('data-price', product.price);
                detailAddCartBtn.setAttribute('data-image', product.image);
                detailAddCartBtn.setAttribute('data-stock', product.stock);

                // 點擊詳情裡的加入購物車時，要先把詳情視窗關掉，免得視窗卡視窗
                detailAddCartBtn.onclick = function() {
                    const detailModal = bootstrap.Modal.getInstance(document.getElementById('productDetailModal'));
                    if(detailModal) detailModal.hide();
                };

                // 6. 顯示詳情視窗
                const modal = new bootstrap.Modal(document.getElementById('productDetailModal'));
                modal.show();
            }
        }
    });

    // ==========================================
    // 11. 首頁動態儀表板 (Dashboard Rendering)
    // ==========================================
    const newArrivalsList = document.getElementById('new-arrivals-list');
    const highStockList = document.getElementById('high-stock-list');
    const rareItemsList = document.getElementById('rare-items-list');

    // 如果這三個區塊存在，代表我們在首頁，且 productsData 有成功載入
    if (newArrivalsList && highStockList && rareItemsList && typeof productsData !== 'undefined') {
        
        // 判斷當前路徑 (處理圖片與連結相對路徑問題)
        const isInnerPage = window.location.pathname.includes('/pages/');
        const linkPrefix = isInnerPage ? 'products.html' : 'pages/products.html';

        // 建立一個共用的迷你卡片生成器
        function createMiniCard(product, extraInfo, isAlert = false) {
            // 自動修正圖片路徑 (如果首頁在外面，把 ../ 換成 ./)
            const safeImgSrc = isInnerPage ? product.image : product.image.replace('../', './');
            const targetLink = `${linkPrefix}?search=${encodeURIComponent(product.name)}`;
            
            // 根據是否為警示狀態 (低庫存) 改變顏色
            const themeColor = isAlert ? '#ef4444' : 'var(--accent)';
            const hoverBg = isAlert ? 'rgba(239, 68, 68, 0.1)' : 'rgba(6, 182, 212, 0.1)';

            return `
                <div class="d-flex align-items-center p-2 rounded mini-dashboard-card" 
                     style="background: rgba(255,255,255,0.03); border: 1px solid transparent; cursor: pointer; transition: all 0.3s;"
                     onclick="window.location.href='${targetLink}'"
                     onmouseover="this.style.background='${hoverBg}'; this.style.borderColor='${themeColor}';"
                     onmouseout="this.style.background='rgba(255,255,255,0.03)'; this.style.borderColor='transparent';">
                    
                    <img src="${safeImgSrc}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; margin-right: 15px; border: 1px solid rgba(255,255,255,0.1);" alt="${product.name}">
                    
                    <div class="flex-grow-1">
                        <h6 class="mb-1 text-white" style="font-size: 0.95rem; font-weight: 600;">${product.name}</h6>
                        <small style="color: ${themeColor}; font-size: 0.8rem;">${extraInfo}</small>
                    </div>
                    
                    <div style="font-weight: bold; font-family: var(--font-title); color: #f8fafc;">
                        NT$${product.price}
                    </div>
                </div>
            `;
        }

        // 1. 🆕 最新到貨：抓取陣列最後 3 筆，並反轉順序 (最新的在最上面)
        const newestProducts = [...productsData].reverse().slice(0, 3);
        newArrivalsList.innerHTML = newestProducts.map(p => createMiniCard(p, `庫存: ${p.stock}`)).join('');

        // 2. ✨ 高光推薦：依照庫存數量由「高到低」排序，取前 3 名
        const highStockProducts = [...productsData].sort((a, b) => b.stock - a.stock).slice(0, 3);
        highStockList.innerHTML = highStockProducts.map(p => createMiniCard(p, `補給充足: ${p.stock} 件`)).join('');

        // 3. ⚠️ 限量稀有：過濾掉缺貨(stock=0)的，依照庫存數量由「低到高」排序，取前 3 名
        const rareProducts = [...productsData].filter(p => p.stock > 0).sort((a, b) => a.stock - b.stock).slice(0, 3);
        rareItemsList.innerHTML = rareProducts.map(p => createMiniCard(p, `⚠ 存量告急：僅剩 ${p.stock} 件！`, true)).join('');
    }

}); // 整個 DOMContentLoaded 結束