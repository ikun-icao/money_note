// 数据存储
let records = JSON.parse(localStorage.getItem('financeRecords')) || [];
let notes = JSON.parse(localStorage.getItem('financeNotes')) || [];

// DOM元素
const addRecordBtn = document.getElementById('add-record-btn');
const addRecordModal = document.getElementById('add-record-modal');
const addRecordForm = document.getElementById('add-record-form');
const cancelBtn = document.getElementById('cancel-btn');
const todayAmount = document.getElementById('today-amount');
const todayPercentage = document.getElementById('today-percentage');
const returnChart = document.getElementById('return-chart');
const heatmap = document.getElementById('heatmap');
const notesInput = document.getElementById('notes-input');
const saveNotesBtn = document.getElementById('save-notes-btn');
const savedNotes = document.getElementById('saved-notes');

// 初始化
function init() {
    updateTodayReturn();
    renderChart();
    renderHeatmap();
    renderNotes();
}

// 更新今日收益
function updateTodayReturn() {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = records.find(record => record.date === today);
    const heroSection = document.querySelector('.hero');
    
    // 清除之前的特效
    clearEffects();
    
    if (todayRecord) {
        todayAmount.textContent = todayRecord.amount.toFixed(2);
        todayPercentage.textContent = (todayRecord.percentage >= 0 ? '+' : '') + todayRecord.percentage.toFixed(2) + '%';
        todayPercentage.style.color = todayRecord.percentage >= 0 ? '#dc3545' : '#28a745';
        
        // 根据收益情况添加特效
        if (todayRecord.amount < 0 || todayRecord.percentage < 0) {
            // 负数收益：雪花特效和冰块特效
            createSnowflakes();
            todayAmount.classList.add('ice-effect');
        } else if (todayRecord.amount > 0 || todayRecord.percentage > 0) {
            // 正数收益：花瓣特效和火焰特效
            createPetals();
            todayAmount.classList.add('fire-effect');
        }
    } else {
        todayAmount.textContent = '0.00';
        todayPercentage.textContent = '+0.00%';
        todayPercentage.style.color = '#28a745';
    }
}

// 清除特效
function clearEffects() {
    // 清除雪花和花瓣元素
    const snowflakes = document.querySelectorAll('.snowflake');
    snowflakes.forEach(snowflake => snowflake.remove());
    
    const petals = document.querySelectorAll('.petal');
    petals.forEach(petal => petal.remove());
    
    // 清除数字特效类
    todayAmount.classList.remove('ice-effect', 'fire-effect');
}

// 创建雪花特效
function createSnowflakes() {
    const heroSection = document.querySelector('.hero');
    const snowflakeCount = 50;
    
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // 随机大小
        const size = Math.random() * 5 + 2;
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        
        // 随机位置
        snowflake.style.left = `${Math.random() * 100}%`;
        
        // 随机动画持续时间
        const duration = Math.random() * 10 + 5;
        snowflake.style.animationDuration = `${duration}s`;
        
        // 随机延迟
        snowflake.style.animationDelay = `${Math.random() * 5}s`;
        
        heroSection.appendChild(snowflake);
    }
}

// 创建花瓣特效
function createPetals() {
    const heroSection = document.querySelector('.hero');
    const petalCount = 50;
    
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        
        // 随机大小
        const size = Math.random() * 8 + 4;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        
        // 随机位置
        petal.style.left = `${Math.random() * 100}%`;
        
        // 随机动画持续时间
        const duration = Math.random() * 10 + 5;
        petal.style.animationDuration = `${duration}s`;
        
        // 随机延迟
        petal.style.animationDelay = `${Math.random() * 5}s`;
        
        heroSection.appendChild(petal);
    }
}

// 渲染收益曲线
function renderChart() {
    // 按日期排序
    const sortedRecords = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedRecords.map(record => record.date);
    const amounts = sortedRecords.map(record => record.amount);
    
    if (window.chartInstance) {
        window.chartInstance.destroy();
    }
    
    // 计算总盈亏百分比
    let totalPercentage = 0;
    const percentages = sortedRecords.map(record => {
        totalPercentage += record.percentage;
        return totalPercentage;
    });
    
    window.chartInstance = new Chart(returnChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '总盈亏百分比',
                data: percentages,
                borderColor: '#000',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}

// 渲染热力图
function renderHeatmap() {
    heatmap.innerHTML = '';
    
    // 获取当前年份
    const currentYear = new Date().getFullYear();
    
    // 生成一年的日期数据
    const startDate = new Date(currentYear, 0, 1); // 1月1日
    const endDate = new Date(currentYear, 11, 31); // 12月31日
    
    // 调整到第一个星期日
    const dayOfWeek = startDate.getDay();
    const daysToAdjust = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    // 生成所有日期
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // 按周组织数据
    const weeks = [];
    let currentWeek = [];
    
    dates.forEach(date => {
        currentWeek.push(date);
        if (date.getDay() === 6) { // 星期六
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });
    
    // 添加星期几标签
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 渲染热力图
    weeks.forEach((week, weekIndex) => {
        week.forEach((date, dayIndex) => {
            if (dayIndex === 0) {
                // 添加星期几标签
                const weekdayElement = document.createElement('div');
                weekdayElement.className = 'heatmap-weekday';
                if (weekIndex % 2 === 0) { // 每隔一周显示
                    weekdayElement.textContent = weekdays[date.getDay()];
                }
                heatmap.appendChild(weekdayElement);
            }
            
            const dateString = date.toISOString().split('T')[0];
            const record = records.find(r => r.date === dateString);
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            
            if (record) {
                // 根据收益率设置颜色
                if (record.percentage > 0) {
                    // 红色系，收益率越高颜色越深
                    const intensity = Math.min(record.percentage / 5, 1); // 5%为最高强度
                    if (intensity < 0.25) {
                        cell.style.backgroundColor = '#ffd6d6';
                    } else if (intensity < 0.5) {
                        cell.style.backgroundColor = '#ff9999';
                    } else if (intensity < 0.75) {
                        cell.style.backgroundColor = '#ff6666';
                    } else {
                        cell.style.backgroundColor = '#ff3333';
                    }
                } else if (record.percentage < 0) {
                    // 绿色系，收益率越低颜色越深
                    const intensity = Math.min(Math.abs(record.percentage) / 5, 1);
                    if (intensity < 0.25) {
                        cell.style.backgroundColor = '#c6e48b';
                    } else if (intensity < 0.5) {
                        cell.style.backgroundColor = '#7bc96f';
                    } else if (intensity < 0.75) {
                        cell.style.backgroundColor = '#239a3b';
                    } else {
                        cell.style.backgroundColor = '#196127';
                    }
                } else {
                    // 无收益，灰色
                    cell.style.backgroundColor = '#e0e0e0';
                }
            } else {
                cell.style.backgroundColor = '#f0f0f0';
            }
            
            heatmap.appendChild(cell);
        });
    });
}

// 渲染笔记
function renderNotes() {
    savedNotes.innerHTML = '';
    
    notes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.innerHTML = `
            <div class="note-date">${note.date}</div>
            <div class="note-content">${note.content}</div>
        `;
        savedNotes.appendChild(noteItem);
    });
}

// 保存笔记
function saveNote() {
    const content = notesInput.value.trim();
    if (content) {
        const note = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            content: content
        };
        
        notes.push(note);
        localStorage.setItem('financeNotes', JSON.stringify(notes));
        notesInput.value = '';
        renderNotes();
    }
}

// 事件监听
addRecordBtn.addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    addRecordModal.style.display = 'block';
});

// 修改往期记录按钮事件
const editRecordBtn = document.getElementById('edit-record-btn');
editRecordBtn.addEventListener('click', () => {
    addRecordModal.style.display = 'block';
});

cancelBtn.addEventListener('click', () => {
    addRecordModal.style.display = 'none';
});

// 日期选择事件，当选择日期时自动填充现有数据
document.getElementById('date').addEventListener('change', function() {
    const selectedDate = this.value;
    const existingRecord = records.find(record => record.date === selectedDate);
    
    if (existingRecord) {
        document.getElementById('amount').value = existingRecord.amount;
        document.getElementById('percentage').value = existingRecord.percentage;
    } else {
        document.getElementById('amount').value = '';
        document.getElementById('percentage').value = '';
    }
});

addRecordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = document.getElementById('date').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const percentage = parseFloat(document.getElementById('percentage').value);
    
    // 检查是否已存在该日期的记录
    const existingIndex = records.findIndex(record => record.date === date);
    
    if (existingIndex >= 0) {
        // 更新现有记录
        records[existingIndex] = { date, amount, percentage };
    } else {
        // 添加新记录
        records.push({ date, amount, percentage });
    }
    
    localStorage.setItem('financeRecords', JSON.stringify(records));
    addRecordModal.style.display = 'none';
    updateTodayReturn();
    renderChart();
    renderHeatmap();
});

saveNotesBtn.addEventListener('click', saveNote);

// 点击模态框外部关闭
window.addEventListener('click', (e) => {
    if (e.target === addRecordModal) {
        addRecordModal.style.display = 'none';
    }
});

// 初始化应用
init();