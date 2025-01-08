import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabase = createClient(
    'https://lfkfdizfmxzuuszmakod.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxma2ZkaXpmbXh6dXVzem1ha29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyMjU1NDAsImV4cCI6MjA0NjgwMTU0MH0.5XRn9ePxrdgCtLj0znyVXoOYs6l1fmgQaYjSNzo73Wc'
)


// 解析 Cookie 函数
function parseCookies() {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    return cookies.reduce((acc, cookie) => {
        const [key, value] = cookie.split('=');
        acc[key] = decodeURIComponent(value);
        return acc;
    }, {});
}



// 实时更新设置
function setupRealtimeUpdates(userId) {
    const channel = supabase
        .channel('realtime:users')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'users',
                filter: `user_id=eq.${userId}`
            },
            payload => {
                if (payload.eventType === "UPDATE" && payload.new) {
                    $('#currentBalance').text(`${payload.new.money} 元`);
                }
            }
        )
        .subscribe();
    return channel;
}

$(document).ready(async function () {
    const cookies = parseCookies();

    if (!cookies.auth || cookies.auth !== 'true') {
        window.location.href = '../index.html';
        return;
    }

    async function displayUserInfo() {
        try {
            const { data: userData, error } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', cookies.user_id)
                .single();

            if (error) throw error;

            $('#userId').text(userData.user_id);
            $('#userName').text(userData.name);
            $('#currentBalance').text(`${userData.money ||  0} 元`);

            setupRealtimeUpdates(cookies.user_id);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: '錯誤',
                text: `獲取用戶資訊失敗：${error.message || '未知錯誤'}`
            });
        }
    }

    await displayUserInfo();

    $('#rechargeForm').on('submit', async function (e) {
        e.preventDefault();
    
        const amount = parseInt($('#rechargeAmount').val());
    
        if (isNaN(amount) || amount < 100 || amount % 100 !== 0) {
            Swal.fire({
                icon: 'warning',
                title: '無效的金額',
                text: '請輸入 100 的倍數且不少於 100 元'
            });
            return;
        }
    
        const result = await Swal.fire({
            icon: 'question',
            title: '確認儲值',
            text: `確定要儲值 ${amount} 元嗎？`,
            showCancelButton: true,
            confirmButtonText: '確定',
            cancelButtonText: '取消'
        });
    
        if (result.isConfirmed) {
            try {
                // 获取当前余额
                const { data: currentData, error: fetchError } = await supabase
                    .from('users')
                    .select('money')
                    .eq('user_id', cookies.user_id)
                    .single();  
    
                if (fetchError) {
                    console.error('获取当前余额失败:', fetchError.message);
                    throw new Error('獲取當前用戶餘額失敗');
                }
    
                if (!currentData) {
                    throw new Error('未找到用戶資料');
                }
    
                const currentBalance = currentData?.money || 0;
                const newBalance = currentBalance + amount;

                const utterance = new SpeechSynthesisUtterance(`儲值的金額是 ${amount} 元 現在是 ${newBalance} 元`);
                speechSynthesis.speak(utterance);
                console.log('当前余额:', currentBalance);
                console.log('新余额:', newBalance);
    
                // 更新余额到 Supabase
                const { data: updatedData, error: updateError } = await supabase
                    .from('users')
                    .update({ money: newBalance })
                    .eq('user_id', cookies.user_id);
    
                if (updateError) {
                    console.error('更新余额失败:', updateError.message);
                    throw new Error(`儲值失敗，無法更新餘額：${updateError.message}`);
                }else{
                    await supabase
                        .from('deposit_log')
                        .insert({user_id:cookies.user_id,deposit:amount})
                }
                
                console.log('更新后的数据:', updatedData);

                Swal.fire({
                    icon: 'success',
                    title: '儲值成功',
                    text: `成功儲值 ${amount} 元`
                });
    
                // 更新本地显示
                $('#rechargeAmount').val('');
                $('#currentBalance').text(`${newBalance} 元`);
            } catch (error) {
                console.error('儲值錯誤:', error.message);
                Swal.fire({
                    icon: 'error',
                    title: '錯誤',
                    text: `處理儲值時發生錯誤：${error.message}`
                });
            }
        }
    });
});


$(document).ready(async function () {
    const cookie = document.cookie.split(";").map(ele => ele.trim());
    // 將數據轉換為 JSON 對象
    const cookieJson = cookie.reduce((acc, item) => {
        const [key, value] = item.split('=');
        acc[key] = value;
        return acc;
    }, {});
    const { data: selects, error } = await supabase
        .from('deposit_log')
        .select('*') // 獲取所有欄位
        .eq('user_id', cookieJson.user_id); // 使用條件篩選

    if (error) {
        console.error('Error fetching data:', error.message);
        return;
    }

    // 動態生成表格數據
    const tableData = selects.map(item => {
        return `
        <tr>
          <td>${item.id}</td>
          <td>${item.deposit}</td>
          <td>${new Date(item.created_at).toLocaleString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        </tr>
      `;
    }).join('');

    // 將資料插入到表格的 tbody
    $('#buyListTable tbody').html(tableData);

    // 初始化 DataTable
    $('#buyListTable').DataTable({
        language: {
            search: "搜尋:", // 自定義搜尋框提示
            lengthMenu: "顯示 _MENU_ 項資料", // 自定義每頁顯示選項
            info: "顯示第 _START_ 至 _END_ 項資料，共 _TOTAL_ 項", // 資料顯示資訊
            infoEmpty: "顯示 0 至 0 項資料，共 0 項", // 當無資料時的顯示
            infoFiltered: "(篩選自 _MAX_ 項資料)", // 篩選後的資料顯示
            paginate: {
                first: "首頁", // 頁面選擇中的首頁文字
                previous: "上一頁", // 頁面選擇中的上一頁文字
                next: "下一頁", // 頁面選擇中的下一頁文字
                last: "尾頁" // 頁面選擇中的尾頁文字
            },
            zeroRecords: "沒有找到匹配的資料", // 當資料沒有匹配時的提示
            emptyTable: "資料表格為空", // 當表格無資料時的提示
            loadingRecords: "載入中...", // 載入資料的提示文字
            processing: "處理中..." // 處理中的提示文字
        }
    });

    refresh()
});
function refresh() {
    const cookie = document.cookie.split(";").map(ele => ele.trim());
    const cookieJson = cookie.reduce((acc, item) => {
        const [key, value] = item.split('=');
        acc[key] = value;
        return acc;
    }, {});

    // 訂閱資料表
    const subscription = supabase
        .channel('table_changeses') // 建立頻道名稱
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'deposit_log', filter: `user_id=eq.${cookieJson.user_id}` },
            (payload) => {
                console.log('Change received!', payload);
                if (payload.eventType === 'INSERT') {
                    addToTable(payload.new);
                } else if (payload.eventType === 'UPDATE') {
                    updateTable(payload.new);
                } else if (payload.eventType === 'DELETE') {
                    removeFromTable(payload.old);
                }
            }
        )
        .subscribe();

    console.log('Subscribed to deposit_log changes:', subscription);
}
// 輔助函數：新增、更新和移除表格資料
function addToTable(record) {
    const row = `
      <tr id="row-${record.id}">
        <td>${record.id}</td>
        <td>${record.deposit}</td>
        <td>${new Date(record.created_at).toLocaleString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
      </tr>
    `;
    $('#buyListTable tbody').append(row);
}

function updateTable(record) {
    $(`#row-${record.id}`).html(`
      <td>${record.id}</td>
      <td>${record.deposit}</td>
      <td>${new Date(record.created_at).toLocaleString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
    `);
}

function removeFromTable(record) {
    $(`#row-${record.id}`).remove();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log(sessionStorage)
    if (sessionStorage.animationPlayed === 'false') {
        $('body').addClass('play-blur-animation');
      sessionStorage.setItem('animationPlayed', 'true');
    }
  });