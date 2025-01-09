// 初始化 ECharts
var chart = echarts.init(document.getElementById('main'));
var chart2 = echarts.init(document.getElementById('main2'));

// 設定圖表的配置
var option = {
    title: {
        text: '遊樂園總人數',
        left: 'center',
        textStyle: {
            color: '#fff' // 正確的方式設定文字顏色
        }
    },
    tooltip: {
        trigger: 'axis',
    },
    legend: {
        data: ['遊樂園總人數'],
        top: '10%',
        textStyle: {
            color: '#fff' // 設定文字顏色為白色
        }
    },
    xAxis: {
        type: 'category',
        data: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: '{value}'
        }
    },
    xAxis: {
        type: 'category',
        data: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
        axisLabel: {
            color: 'black', // 文字顏色
            backgroundColor: 'lightblue', // 背景顏色
            borderRadius: 3, // 背景圓角
            padding: [4, 6] // 內邊距
        }
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: '  {value}',
            color: 'black', // 文字顏色
            backgroundColor: 'lightblue', // 背景顏色
            borderRadius: 6, // 背景圓角
            padding: [4, 8] // 內邊距
        }
    },
    series: [{
        name: '遊樂園總人數',
        type: 'line',
        data: [132, 821, 203, 444, 122, 182, 891],
        smooth: false,
        label: {
            show: true,
            position: 'top', // 顯示在數據點上方
            formatter: '{c} 人', // 顯示數據值
            fontSize: 12,
            color: 'black', // 字體顏色
            backgroundColor: 'white', // 背景顏色
            borderRadius: 3, // 背景圓角
            padding: [4, 6] // 背景內邊距 [垂直, 水平]
        },
        itemStyle: {
            color: '#5470C6' // 折線顏色
        }
    }]
};

// 使用設定的配置繪製圖表
chart.setOption(option);

// 初始化圖表
var chart2 = echarts.init(document.getElementById('main2'));

// 設定圖表的配置
var option = {
    title: {
        text: '園內總消費金額分佈',
        left: 'center',
        textStyle: {
            color: '#fff' // 正確的方式設定文字顏色
        }
    },
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} 元 ({d}%)'
    },
    legend: {
        orient: 'vertical',
        left: 'left',
        data: ['門票', '飲食', '遊樂設施', '停車費', '其他'],
        textStyle: {
            color: '#fff' // 設定文字顏色為白色
        }
    },
    series: [{
        name: '消費項目',
        type: 'pie',
        radius: ['40%', '90%'], // 內徑 40%、外徑 70%（環形圖效果）
        label: {
            show: true,
            position: 'inside', // 將文字顯示在扇區內
            formatter: '{b}\n{c} 元 ({d}%)', // 顯示名稱、金額和百分比
            fontSize: 12,
            color: '#fff' // 設置文字顏色（適合深色背景）
        },
        data: [
            { value: 238, name: '門票' },
            { value: 12, name: '飲食' },
            { value: 38, name: '遊樂設施' },
            { value: 12, name: '停車費' },
            { value: 68, name: '其他' }
        ],
        emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    }]
};

// 使用設定的配置繪製圖表
chart2.setOption(option);