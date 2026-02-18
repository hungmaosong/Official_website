// js/data.js

// 這裡是用來模擬資料庫的商品清單
// 以後如果你有 100 個商品，就全部列在這裡，網頁會自動分頁
const productsData = [
    {
        id: 1,
        name: "景品模型 A",
        price: 500,
        image: "../assets/images/sample_product.jpg",
        category: "figure",
        stock: 15 // 庫存充足
    },
    {
        id: 2,
        name: "稀有卡片 B",
        price: 1200,
        image: "../assets/images/sample_product.jpg",
        category: "card",
        stock: 3  // 低庫存 (會變色)
    },
    {
        id: 3,
        name: "樂團 T-shirt",
        price: 850,
        image: "../assets/images/sample_product.jpg",
        category: "clothes",
        stock: 20
    },
    {
        id: 4,
        name: "限量吉他撥片",
        price: 150,
        image: "../assets/images/sample_product.jpg",
        category: "music",
        stock: 0  // 缺貨 (按鈕會鎖住)
    },
    {
        id: 5,
        name: "限定版海報",
        price: 300,
        image: "../assets/images/sample_product.jpg",
        category: "other",
        stock: 8
    },
    {
        id: 6,
        name: "黑膠唱片 - 經典",
        price: 2500,
        image: "../assets/images/sample_product.jpg",
        category: "music",
        stock: 5
    },
    {
        id: 7,
        name: "機械鍵盤軸體",
        price: 900,
        image: "../assets/images/sample_product.jpg",
        category: "other",
        stock: 50
    },
    {
        id: 8,
        name: "電競滑鼠墊",
        price: 450,
        image: "../assets/images/sample_product.jpg",
        category: "other",
        stock: 12
    },
    {
        id: 9,
        name: "景品模型 - 異色版",
        price: 600,
        image: "../assets/images/sample_product.jpg",
        category: "figure",
        stock: 10
    },
    {
        id: 10,
        name: "SSR 閃卡 - 龍",
        price: 3000,
        image: "../assets/images/sample_product.jpg",
        category: "card",
        stock: 1
    },
    {
        id: 11,
        name: "巡演毛巾",
        price: 400,
        image: "../assets/images/sample_product.jpg",
        category: "clothes",
        stock: 25
    },
    {
        id: 12,
        name: "簽名鼓棒",
        price: 1500,
        image: "../assets/images/sample_product.jpg",
        category: "music",
        stock: 4
    }
];