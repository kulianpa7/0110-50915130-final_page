import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabase = createClient(
    'https://lfkfdizfmxzuuszmakod.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxma2ZkaXpmbXh6dXVzem1ha29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyMjU1NDAsImV4cCI6MjA0NjgwMTU0MH0.5XRn9ePxrdgCtLj0znyVXoOYs6l1fmgQaYjSNzo73Wc')

// 獲取數據並顯示在頁面上
async function fetchPosts() {
    const { data, error } = await supabase.from('item').select('*');
    if (error) {
        console.log(error)
    } else {
        displayPosts(data);
        console.log(data)
    }
}

// 動態顯示數據
function displayPosts(posts) {
    const productList = $('#product-list');
    productList.empty(); // 清空目前的列表
    posts.forEach(post => {
        const postElement = `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="product-img">
                        <img src="${post.url}" alt="${post.names}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${post.names}</h5>
                        <p class="card-text">${post.description}</p>
                        <p class="card-text product-price">價格：NT$ ${post.cost}</p>
                        <p class="card-text"><small class="text-muted">創建時間：${new Date(post.created_at).toLocaleString()}</small></p>
                        <button type="button" class="button" onclick="handleAddToCart('${post.names}', ${post.cost}, '${post.url}')">
                            <span class="button__text">加入購物車</span>
                            <span class="button__icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" height="24" fill="none" class="svg"><line y2="19" y1="5" x2="12" x1="12"></line><line y2="12" y1="12" x2="19" x1="5"></line></svg></span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        productList.append(postElement);
    });
}

// 添加购物车侧边栏关闭逻辑
function setupCartClose() {
    $(document).on('click', '.cart-close', function () {
        $('.cart-sidebar').removeClass('open');
    });
}

// 添加移除购物项逻辑
function setupItemRemove() {
    $(document).on('click', '.cart-item-remove', function () {
        const cartItem = $(this).closest('.cart-item');
        cartItem.addClass('removing'); // 添加动画类
        setTimeout(() => {
            cartItem.remove(); // 动画结束后从 DOM 中移除
        }, 500); // 时间与 CSS 动画时长一致
    });
}

// 設置實時訂閱
function setupRealtimeUpdates() {
    const channel = supabase
        .channel('realtime:item')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'item' },
            payload => {
                console.log('Realtime update:', payload);
                fetchPosts();
            }
        )
        .subscribe();
    return channel;
}

// 在頁面加載後立即獲取並顯示數據
$(document).ready(function () {
    fetchPosts();
    setupCartClose(); 
    setupItemRemove(); 
    setupRealtimeUpdates();
});

