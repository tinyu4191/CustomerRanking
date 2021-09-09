// Date
let date = new Date()
let thisYear = date.getFullYear()
let thisMonth = date.getMonth() + 1
let thisDate = date.getDate()
let thisDay = date.getDay()
let thisHour = date.getHours()
let thisMinutes = date.getMinutes()
let thisSeconds = date.getSeconds()
thisMonth = thisMonth < 10 ? `0${thisMonth}` : thisMonth
thisDate = thisDate < 10 ? `0${thisDate}` : thisDate
thisHour = thisHour < 10 ? `0${thisHour}` : thisHour
thisMinutes = thisMinutes < 10 ? `0${thisMinutes}` : thisMinutes
thisSeconds = thisSeconds < 10 ? `0${thisSeconds}` : thisSeconds
function getStartDate(n) {
    date.setDate(date.getDate() - n + 1)
    let yearStart = date.getFullYear()
    let monhtStart = date.getMonth() + 1
    let dateStart = date.getDate()
    return `${yearStart}/${monhtStart}/${dateStart}`
}
let startDate = getStartDate(thisDay)
function getMonthWeek(yearmonth) {
    let year = yearmonth.slice(0, 4)
    let month = Number(yearmonth.slice(4, 6)) - 1
    let d = new Date(year, month)
    let thisYearFirstDate = new Date()
    thisYearFirstDate.setMonth(0)
    thisYearFirstDate.setDate(1)
    let to = new Date(year, month + 1, 1)
    let dataGap = d.getTime() - thisYearFirstDate.getTime()
    let arr = []
    let i = Math.ceil(dataGap / (7 * 24 * 60 * 60 * 1000))
    for (let from = d; from < to; ) {
        arr.push(i)
        from.setDate(from.getDate() + 6)
        i++
    }

    return arr
}
const monthList = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
let selectYearMonth = `${thisYear}${thisMonth}`
console.log(selectYearMonth)
let monthWeek = getMonthWeek(selectYearMonth)
console.log(monthWeek)
// DOM
const chartCountWeekly = document.querySelector('.chart-count-weekly')
const trackingDate = document.querySelector('.tracking-date')
const rankContent = document.querySelector('.rank-content')
const deptTagList = document.querySelector('.dept-tag-list')
const tableCountWeekly = document.querySelector('.table-count-weekly')

function getDataJson() {
    let url = `http://tnvqis03/JsonService/jsonQuery.do?dataRequestName=cq-dashmboard-PROD-ACCOUNT-LOG001&ACCESS_TIME=${selectYearMonth}`
    return $.ajax({
        url: url,
        type: 'GET',
        dataType: 'jsonp',
        jsonp: 'jsonpCallback',
    })
}
$.when(getDataJson()).then(function (res) {
    console.log(res.length)
    let dataDashBoard = res.filter((el) => el.SERVICE_ID.includes('dashmboard'))
    console.log(dataDashBoard)

    tableCountWeekly.innerHTML = paintUsageTable(monthWeek, dataDashBoard)
})

// 千分位
function formatNum(strNum) {
    if (strNum.length <= 3) {
        return strNum
    }
    if (!/^(\+|-)?(\d+)(\.\d+)?$/.test(strNum)) {
        return strNum
    }
    let a = RegExp.$1,
        b = RegExp.$2,
        c = RegExp.$3
    let re = new RegExp()
    re.compile('(\\d)(\\d{3})(,|$)')
    while (re.test(b)) {
        b = b.replace(re, '$1,$2$3')
    }
    return a + '' + b + '' + c
}

// render 使用率Table
function paintUsageTable(monthWeek, data) {
    // let dept = Array.from(new Set(data.map((el) => el.DEPT_NO)))
    // console.log(dept)
    const deptList = ['8Q51', '8Q56', '8Q55', '9P01']
    const deptNameList = ['CQE一處', 'CQE二處', 'CQE三處', 'AA處']
    let content = ''
    let theadContent = `
    <tr>
        <th>部門名稱</th>
    `
    let tbodyContent = ''
    // thead
    monthWeek.forEach((week) => {
        theadContent += `<th>W${week}</th>`
    })
    theadContent += `
        <th>總計</th>
    </tr>
    `

    // tbody
    deptList.forEach((dept, index) => {
        let countTotal = 0
        tbodyContent += `
        <tr>
            <td>${deptNameList[index]}</td>
        `
        monthWeek.forEach((week) => {
            let d = data.filter((el) => el.DEPT_NO === dept)
            d = d.filter((el) => Number(el.WEEK) === week)
            let dtotal = (function calcTotal() {
                let n = 0
                d.forEach((el) => {
                    n += el['COUNT(L.COMP_ID)']
                })
                return n
            })()
            tbodyContent += `
                <td>${formatNum(dtotal)}</td>
            `
            countTotal += dtotal
        })
        tbodyContent += `
            <td>${formatNum(countTotal)}</td>
        </tr>
        `
    })
    content = theadContent + tbodyContent

    return content
}

// paint 趨勢圖
function paintChart(dom) {
    let myChart = echarts.init(dom)
    let option

    option = {
        color: ['#007BFF', '#FAC937', '#28A745', '#DC3545'],
        xAxis: {
            type: 'category',
            data: ['8/23', '8/24', '8/25', '8/26', '8/27'],
        },
        grid: {
            top: '15%',
            bottom: '20%',
            right: '5%',
        },
        yAxis: {
            type: 'value',
        },
        legend: {
            show: true,
            data: ['CQE1', 'CQE2', 'CQE3', 'AA'],
        },
        tooltip: {
            trigger: 'axis',
        },
        series: [
            {
                name: 'CQE1',
                data: [150, 230, 224, 218, 135],
                type: 'line',
            },
            {
                name: 'CQE2',
                data: [230, 230, 135, 218, 135],
                type: 'line',
            },
            {
                name: 'CQE3',
                data: [110, 230, 224, 102, 135],
                type: 'line',
            },
            {
                name: 'AA',
                data: [68, 230, 10, 350, 135],
                type: 'line',
            },
        ],
    }

    myChart.setOption(option)
    setTimeout(function () {
        window.onresize = function () {
            myChart.resize()
        }
    }, 200)
}
paintChart(chartCountWeekly)

// render 資料截止時間
function renderTrackingDate() {
    return `資料截至 ${thisYear}/${thisMonth}/${thisDate} ${thisHour}:${thisMinutes}:${thisSeconds}`
}
trackingDate.innerHTML = renderTrackingDate()

// render使用排行
function renderRankItem(n) {
    for (let i = 1; i < n; i++) {
        rankContent.innerHTML += `
    <div class="rank-item">
        <div class="item-header rank-3">${i + 5}th</div>
        <div class="person-name">方嘉進</div>
        <div class="person-count">123<span class="times">次</span></div>
    </div>
    `
    }
}
renderRankItem(10)

// event 切換部門
deptTagList.addEventListener('click', function (e) {
    let target = e.target
    if (target.matches('.dept-tag')) {
        const rankHeader = document.querySelector('.rank-header')
        const rankDept = document.querySelector('.rank-dept')
        let dept = target.innerText
        let rankHeaderList = rankHeader.classList
        if (rankHeaderList.contains('cqe-1')) rankHeaderList.remove('cqe-1')
        else if (rankHeaderList.contains('cqe-2')) rankHeaderList.remove('cqe-2')
        else if (rankHeaderList.contains('cqe-3')) rankHeaderList.remove('cqe-3')
        else if (rankHeaderList.contains('aa')) rankHeaderList.remove('aa')
        if (dept === 'CQ1') {
            rankHeaderList.add('cqe-1')
            rankDept.innerText = 'CQE一處'
        } else if (dept === 'CQ2') {
            rankHeaderList.add('cqe-2')
            rankDept.innerText = 'CQE二處'
        } else if (dept === 'CQ3') {
            rankHeaderList.add('cqe-3')
            rankDept.innerText = 'CQE三處'
        } else if (dept === 'AA') {
            rankHeaderList.add('aa')
            rankDept.innerText = 'AA處'
        }
    }
})
