// 獲取漢堡按鈕和導航項目
const menuToggle = document.querySelector('.menu-toggle');
const navLeft = document.querySelector('.nav-left ul');

// 為漢堡按鈕添加點擊事件
menuToggle.addEventListener('click', () => {
    navLeft.classList.toggle('active');
});


/////廣告區//////////廣告區//////////廣告區//////////廣告區//////////廣告區/////

// 初始化 Bootstrap 輪播功能並自動播放
var myCarousel = document.querySelector('#carouselExampleIndicators');
if (myCarousel) {
    // 初始化 Bootstrap Carousel
    var carousel = new bootstrap.Carousel(myCarousel, {
        interval: 3000,  // 每 3 秒切換一次圖片
        ride: 'carousel' // 啟用自動輪播
    });
}


/////商品頁面//////////商品頁面//////////商品頁面//////////商品頁面//////////商品頁面/////

document.addEventListener("DOMContentLoaded", () => {
    // 商品資料
    const products = [
        { name: "商品1", price: "NT$500", img: "../assets/images/sample_product.jpg", link: "#" },
        { name: "商品2", price: "NT$600", img: "../assets/images/sample_product.jpg", link: "#" },
        { name: "商品3", price: "NT$700", img: "../assets/images/sample_product.jpg", link: "#" },
        { name: "商品4", price: "NT$800", img: "../assets/images/sample_product.jpg", link: "#" },
        { name: "商品5", price: "NT$900", img: "../assets/images/sample_product.jpg", link: "#" },
        { name: "商品6", price: "NT$1000", img: "../assets/images/sample_product.jpg", link: "#" },
        { name: "商品7", price: "NT$1100", img: "../assets/images/sample_product.jpg", link: "#" },
        { name: "商品8", price: "NT$1200", img: "../assets/images/sample_product.jpg", link: "#" },
        { name: "商品9", price: "NT$1300", img: "../assets/images/sample_product.jpg", link: "#" },
        { name: "商品10", price: "NT$1400", img: "../assets/images/sample_product.jpg", link: "#" },
        { name: "商品11", price: "NT$1500", img: "../assets/images/sample_product.jpg", link: "#" },
        { name: "商品12", price: "NT$1600", img: "../assets/images/sample_product.jpg", link: "#" }
    ];

    // 分頁設置
    const itemsPerPage = 12;
    let currentPage = 1;

    // 模板元素及其父容器
    const productTemplate = document.getElementById("product-template");
    const productsRow = productTemplate.parentElement;

    if (!productTemplate) {
        console.error("找不到 product-template 元素！");
        return;
    }

    // 顯示商品
    function displayProducts() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentProducts = products.slice(startIndex, endIndex);

        // 清空商品區域
        productsRow.innerHTML = '';

        // 根據當前頁顯示商品
        currentProducts.forEach(product => {
            const productCard = productTemplate.cloneNode(true);
            productCard.style.display = "block";
            productCard.querySelector(".card-img-top").src = product.img;
            productCard.querySelector(".card-title").textContent = product.name;
            productCard.querySelector(".card-text").textContent = product.price;
            productCard.querySelector("a").href = product.link;

            // 綁定「加入購物車」按鈕事件
            const addToCartButton = productCard.querySelector(".add-to-cart");
            addToCartButton.addEventListener("click", () => openCartModal(product));

            productsRow.appendChild(productCard);
        });

        // 更新分頁按鈕可用狀態
        document.getElementById('prev-page').disabled = currentPage === 1;
        document.getElementById('next-page').disabled = currentPage * itemsPerPage >= products.length;
    }

    // 分頁按鈕
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayProducts();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage * itemsPerPage < products.length) {
            currentPage++;
            displayProducts();
        }
    });

    // 創建並顯示購物車彈出視窗
    createCartModal();
    displayProducts();  // 初始化顯示商品

    // 建立子視窗
    function createCartModal() {
        const modalHTML = `
            <div class="modal fade" id="cartModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">加入購物車</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div id="modal-product-info" class="mb-3"></div>
                            <label for="product-quantity" class="form-label">數量</label>
                            <input type="number" id="product-quantity" class="form-control" value="1" min="1">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" id="confirm-add-to-cart" class="btn btn-primary">確認加入</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML("beforeend", modalHTML);
    }

    // 開啟購物車彈出視窗
    function openCartModal(product) {
        const modal = new bootstrap.Modal(document.getElementById("cartModal"));
        const modalProductInfo = document.getElementById("modal-product-info");
        const productQuantity = document.getElementById("product-quantity");
        const confirmButton = document.getElementById("confirm-add-to-cart");

        modalProductInfo.innerHTML = `
            <p><strong>商品名稱：</strong>${product.name}</p>
            <p><strong>價格：</strong>${product.price}</p>
        `;
        productQuantity.value = 1;

        confirmButton.onclick = () => {
            const quantity = parseInt(productQuantity.value, 10);
            if (quantity > 0) {
                alert(`已加入購物車：${product.name} x ${quantity}`);
                modal.hide();
            } else {
                alert("請輸入有效的數量！");
            }
        };

        modal.show();
    }
});



