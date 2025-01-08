import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabase = createClient(
    'https://lfkfdizfmxzuuszmakod.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxma2ZkaXpmbXh6dXVzem1ha29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyMjU1NDAsImV4cCI6MjA0NjgwMTU0MH0.5XRn9ePxrdgCtLj0znyVXoOYs6l1fmgQaYjSNzo73Wc')
console.log('Supabase Instance: ', supabase)



$(document).ready(async function () {
    const cookie = document.cookie.split(";").map(ele => ele.trim());
    // 將數據轉換為 JSON 對象
    const cookieJson = cookie.reduce((acc, item) => {
        const [key, value] = item.split('=');
        acc[key] = value;
        return acc;
    }, {});
    const { data: selects, error } = await supabase
        .from('buy_list')
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
          <td>${item.description}</td>
          <td>${item.total_cost}</td>
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
        .channel('table_changes') // 建立頻道名稱
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'buy_list', filter: `user_id=eq.${cookieJson.user_id}` },
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

    console.log('Subscribed to buy_list changes:', subscription);
}
// 輔助函數：新增、更新和移除表格資料
function addToTable(record) {
    const row = `
      <tr id="row-${record.id}">
        <td>${record.id}</td>
        <td>${record.description}</td>
        <td>${record.total_cost}</td>
        <td>${new Date(record.created_at).toLocaleString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
      </tr>
    `;
    $('#buyListTable tbody').append(row);
}

function updateTable(record) {
    $(`#row-${record.id}`).html(`
      <td>${record.id}</td>
      <td>${record.description}</td>
      <td>${record.total_cost}</td>
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