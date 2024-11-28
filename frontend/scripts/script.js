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
var carousel = new bootstrap.Carousel(myCarousel, {
  interval: 3000,  // 每 3 秒切換一次圖片
  ride: 'carousel' // 啟用自動輪播
});



