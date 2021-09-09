console.log('Customer Rank')
// API host name
const hostName = 'http://tw071273p/'
// Date
let date = new Date()
let thisYear = date.getFullYear()
let lastYear = thisYear - 1
const monthList = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
let thisMonth = date.getMonth() + 1
// render date
const blockThisMonth = document.querySelector('.block-this-month')
const blockThisYear = document.querySelector('.block-this-year')
const tableThisYear = document.querySelector('.this-year')
const tableLastYear = document.querySelector('.last-year')
blockThisMonth.innerText = monthList[thisMonth - 1]
blockThisYear.innerText = thisYear
tableThisYear.innerText = thisYear
tableLastYear.innerText = lastYear
// DOM
const navBar = document.querySelector('.nav-bar')
const rateBu = document.querySelector('#rate-bu')
const tableRank = document.querySelector('#table-rank')
const rankCustomer = document.querySelector('#rank-customer')
const listEditor = document.querySelector('.editor')
const buTitle = document.querySelector('.bu-title')
const index = document.querySelector('.index')
const rightCol = document.querySelector('.right-col')
const titleLogo = document.querySelector('.title-logo')
const rateContent = document.querySelector('.rate-content')
const overviewContent = document.querySelector('.overview-content')
// BU APP參數
let buSelected = 'ALL'
let appSelected = 'ALL'
// clickBuCust
let arrBuCust = []
let buClicked = ''
navBar.addEventListener('click', function (params) {
    let target = params.target
    if (target.matches('.list-content')) {
        for (let i = 0; i < navBar.children.length; i++) {
            if (navBar.children[i].className === 'list-content-clicked') navBar.children[i].className = 'list-content'
        }
        target.className = 'list-content-clicked'
        // 切換版面
        changeRightCol()
        if (target.innerText !== 'Overview') {
            rateBu.innerText = target.innerText
            buClicked = target.innerText
            paintTableRank(buClicked)
        } else {
            rateBu.innerText = 'ALL'
            getOptionBU()
            paintChartAnnual()
            paintChartProduct()
            renderOverviewContent()
        }
    }
})

// backIndex 回首頁

titleLogo.addEventListener('click', function () {
    backIndex()
})

function backIndex() {
    const navBar = document.querySelector('.nav-bar')
    index.style.display = 'block'
    rightCol.style.display = 'none'
    for (let i = 0; i < navBar.children.length; i++) {
        let classList = navBar.children[i].classList
        if (classList.contains('list-content-clicked')) classList.replace('list-content-clicked', 'list-content')
    }
}

function changeRightCol() {
    index.style.display = 'none'
    rightCol.style.display = 'flex'
    rateContent.style.display = 'none'
    overviewContent.style.display = 'none'
}

function renderOverviewContent() {
    overviewContent.style.display = 'flex'
    let qs = Qs
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
    axios.post(hostName + 'getCustomer_Ranking_Month.php', qs.stringify({ Year: thisYear })).then(function (res) {
        let data = res.data
        let dataThisYear = data.filter((el) => el.Year === String(thisYear))
        let dataLastMonth = (function () {
            let month = dataThisYear.map((el) => el.Month)
            month = Array.from(new Set(month))
            let lastMonth = month[month.length - 1]
            let data = dataThisYear.filter((el) => el.Month === lastMonth)
            return data
        })()
        let countOverTarget = dataLastMonth.filter((el) => el.Lamp === 'G').length
        let total = dataLastMonth.length
        calRankRate(countOverTarget, total)
        renderOutOf(countOverTarget, total)
    })
}
function paintChartAnnual(bu, app) {
    overviewContent.style.display = 'flex'
    axios.get(hostName + 'getCustomer_Ranking_Year.php').then(function (res) {
        let data = res.data
        if (bu) {
            if (bu !== 'ALL') data = data.filter((el) => el.BU === bu)
        }
        if (app) data = data.filter((el) => el.APPLICATION === app)
        let dataYear = Array.from(new Set(data.map((el) => el.YEAR))).sort()
        let arr = []
        let arrMarkPoint = []
        dataYear.forEach((year, index) => {
            let obj = {}
            let d = data.filter((el) => el.YEAR === year)
            let total = d.length
            let overTarget = d.filter((el) => el.SCORE === '達標').length
            let value = ((overTarget / total) * 100).toFixed(0)
            obj.value = `${value}%`
            obj.yAxis = value
            obj.xAxis = index
            if (index === dataYear.length - 1) obj.itemStyle = { color: '#FFC300' }
            arr.push(value)
            arrMarkPoint.push(obj)
        })
        let obj = {}
        obj.xAxis = dataYear
        obj.value = arr
        obj.markPoint = arrMarkPoint
        const chartAnnual = document.querySelector('.chart-annual')
        showCustomer_Ranking_YearChart(chartAnnual, obj)
    })
}
function paintChartProduct() {
    axios.get(hostName + 'cq-warroom/getProductAchivementRate.php').then(function (res) {
        let data = res.data
        let obj = {}
        obj.xAxis = data.item
        data.bardata.forEach((d) => {
            if (d.name === 'Last_M') d.name = monthList[thisMonth - 2]
            else if (d.name == 'This_M') d.name = monthList[thisMonth - 1]
            d.type = 'bar'
            d.label = {
                show: true,
                position: 'top',
                formatter: '{c}%',
            }
        })
        obj.series = data.bardata
        console.log(obj.series)
        const chartProduct = document.querySelector('.chart-product')
        showChartProduct(chartProduct, obj)
    })
}

function getOptionBU() {
    axios.get(hostName + 'getCustomer_Ranking_Year.php').then(function (res) {
        let data = res.data
        console.log(data)
        let dataBU = Array.from(new Set(data.map((el) => el.BU)))
        let dataApplication = Array.from(new Set(data.map((el) => el.APPLICATION)))
        console.log('BU', dataBU)
        console.log('App', dataApplication)
        const selectorBU = document.querySelector('#selectorBU')
        const selectorApp = document.querySelector('#selectorApp')
        function renderBuOption() {
            dataBU.forEach((bu, index) => {
                if (index === 0) selectorBU.innerHTML += '<option value="ALL">ALL</option>'
                selectorBU.innerHTML += `
            <option value="${bu}">${bu}</option>
            `
            })
        }
        function renderAppOption(data) {
            selectorApp.innerHTML = ''
            data = data || dataApplication
            data.forEach((app, index) => {
                if (index === 0) selectorApp.innerHTML += '<option value="ALL">ALL</option>'
                selectorApp.innerHTML += `
                    <option value="${app}">${app}</option>
                    `
            })
        }
        renderBuOption()
        renderAppOption()

        selectorBU.addEventListener('change', function (params) {
            let bu = params.target.value
            if (bu !== 'ALL') {
                let dataBU = data.filter((el) => el.BU === bu)
                let dataApplicationNew = Array.from(new Set(dataBU.map((el) => el.APPLICATION)))
                renderAppOption(dataApplicationNew)
                buSelected = bu
                paintChartAnnual(buSelected)
            } else {
                buSelected = 'ALL'
                renderAppOption()
                paintChartAnnual()
            }
        })
        selectorApp.addEventListener('change', function (params) {
            let app = params.target.value
            if (app !== 'ALL') {
                appSelected = app
                paintChartAnnual(buSelected, appSelected)
            } else {
                appSelected = 'ALL'
                paintChartAnnual(buSelected)
            }
        })
    })
}

function paintTableRank(buClicked) {
    rateContent.style.display = 'block'
    let qs = Qs
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
    axios.post(hostName + 'getCustomer_Ranking_Month.php', qs.stringify({ Year: thisYear })).then(function (res) {
        let data = res.data
        let dataBu = (function (bu) {
            let bus = []
            if (bu === 'TV') {
                bus.push('TV')
            } else if (bu === 'ITI') {
                bus.push('IAVM', 'MONITOR', 'NB')
            } else if (bu === 'MD') {
                bus.push('CE', 'MP', 'TABLET')
            } else if (bu === 'AA') {
                bus.push('AA-BD4')
            }
            let arr = []
            bus.forEach((bu) => {
                let dataBu = data.filter((el) => el.Application === bu)
                arr = arr.concat(dataBu)
            })
            return arr
        })(buClicked)
        let dataCustomer = dataBu.map((el) => el.Brand)
        dataCustomer = Array.from(new Set(dataCustomer))
        let dataApp = dataBu.map((el) => el.Application)
        dataApp = Array.from(new Set(dataApp))
        let row = ''
        let rowCust = ''
        let rowEditor = ''
        let rowBuTitle = ''
        let type = 'odd'
        let countOverTarget = 0
        let totalCust = 0
        let countUnderTarget = 0

        arrBuCust.length = 0
        dataApp.forEach((bu) => {
            let count = 0
            dataCustomer.forEach((brand, indexBu) => {
                let dataBrand = dataBu.filter((el) => el.Application == bu && el.Brand === brand)
                if (dataBrand.length < 1) return ''
                let level = dataBrand.map((el) => el.Lamp)
                let target = dataBrand.map((el) => el.Lamp)
                let rank = dataBrand.map((el) => el.Rank)
                if (target[target.length - 1] === 'G') countOverTarget += 1
                else countUnderTarget += 1
                for (let i = level.length; i < 24; i++) {
                    level.push('')
                }
                row += '<div class="table-row">'
                level.forEach((el, index) => {
                    if (index !== target.length - 1) {
                        if (el === 'G') {
                            row += '<div><div class="circle green"></div></div>'
                        } else if (el === 'Y') {
                            row += '<div><div class="circle yellow"></div></div>'
                        } else if (el === 'R') {
                            row += '<div><div class="circle red"></div></div>'
                        } else {
                            row += '<div><div class="circle null"></div></div>'
                        }
                    } else {
                        arrBuCust.push(`${bu}_${brand}`)
                        let rankLastMonth = ''
                        if (rank[index].match(/[^A-Z][^None]/)) rankLastMonth = rank[index]
                        if (el === 'G') {
                            row += `<div><div class="circle green last-div ${indexBu}">${rankLastMonth}</div></div>`
                        } else if (el === 'Y') {
                            row += `<div><div class="circle yellow last-div ${indexBu}">${rankLastMonth}</div></div>`
                        } else if (el === 'R') {
                            row += `<div><div class="circle red last-div ${indexBu}">${rankLastMonth}</div></div>`
                        } else {
                            row += `<div><div class="circle null last-div ${indexBu}">${rankLastMonth}</div></div>`
                        }
                    }
                })
                row += '</div>'
                rowCust += `<div>${brand}</div>`
                rowEditor += '<div class="flex-center-center"><i class="fas fa-edit"></i></div>'
                count += 1
                totalCust += 1
            })
            if (type === 'odd') {
                rowBuTitle += `<div style="height:${count * 3}vw">${bu}</div>`
                type = 'even'
            } else {
                rowBuTitle += `<div style="height:${count * 3}vw; background-color:#BCBCD2;">${bu}</div>`
                type = 'odd'
            }
        })
        tableRank.innerHTML = row
        rankCustomer.innerHTML = rowCust
        listEditor.innerHTML = rowEditor
        buTitle.innerHTML = rowBuTitle

        calRankRate(countOverTarget, totalCust)
        renderOutOf(countOverTarget, totalCust)
    })
}
paintTableRank(buClicked)
function calRankRate(count, total) {
    const rankRate = document.querySelector('.rank-rate')
    let rate = (count / total) * 100
    rankRate.innerText = `${rate.toFixed(0)}%`
}
function renderOutOf(count, total) {
    const rankDescription = document.querySelector('.rank-description')
    rankDescription.innerText = `${count} in of ${total}`
}

function showCustomer_Ranking_YearChart(dom, data) {
    let myChart = echarts.init(dom)

    let option

    option = {
        grid: {
            top: '20%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.xAxis,
            axisLabel: {
                show: true,
                textStyle: {
                    fontSize: 16,
                },
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}%',
                textStyle: {
                    fontSize: 14,
                },
            },
        },
        series: [
            {
                name: '達標率',
                type: 'line',
                itemStyle: {
                    color: '#03A9F4',
                },
                data: data.value,
                markPoint: {
                    symbolSize: 70,
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                color: '#03A9F4',
                            },
                        },
                    },
                    data: data.markPoint,
                },
            },
        ],
    }
    myChart.setOption(option)
    setTimeout(function () {
        window.addEventListener('resize', () => {
            myChart.resize()
        })
    }, 200)
}

function showChartProduct(dom, data) {
    let myChart = echarts.init(dom)

    let option

    option = {
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow',
            },
        },
        legend: {
            left: 'right',
        },
        grid: {
            top: '10%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: [
            {
                type: 'category',
                data: data.xAxis,
            },
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    formatter: '{value}%',
                    textStyle: {
                        fontSize: 14,
                    },
                },
            },
        ],
        series: data.series,
    }

    myChart.setOption(option)
    setTimeout(function () {
        window.addEventListener('resize', () => {
            myChart.resize()
        })
    }, 200)
}

// 呼叫modal
const myModal = new bootstrap.Modal(document.querySelector('#mainModal'))
const modalTitle = document.querySelector('.modal-title')
const modalBody = document.querySelector('.modal-body')
tableRank.addEventListener('click', function (e) {
    if (e.target.matches('.last-div')) {
        console.log(arrBuCust)
        let clickedIndex = e.target.classList[3]
        let clickedName = arrBuCust[clickedIndex].split('_')
        let buName = clickedName[0]
        let custName = clickedName[1]
        modalTitle.innerText = `${buName} ${custName}：未達標對策`
        let qs = Qs
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
        axios
            .post(
                hostName + 'getBrand_Score.php',
                qs.stringify({ Year: thisYear, Month: thisMonth, Application: buName, Brand: custName })
            )
            .then(function (res) {
                let data = res.data
                let content = ''
                let theadContent = ''
                let tbodyContent = ''
                if (!Array.isArray(data)) return (modalBody.innerHTML = data)
                content += '<table class="table-modal">'
                theadContent = `
                <thead>
                    <tr>
                        <th class="text-center" nowrap="nowrap">客戶</th>
                        <th nowrap="nowrap">項目</th>
                        <th class="text-center" nowrap="nowrap">目標</th>
                        <th class="text-center" nowrap="nowrap">成績</th>
                        <th class="text-center" nowrap="nowrap">總分</th>
                        <th class="text-center" nowrap="nowrap">得分</th>
                        <th class="text-center" nowrap="nowrap">燈號</th>
                        <th nowrap="nowrap">未達標對策</th>
                    </tr>
                </thead>
                `
                content += theadContent

                tbodyContent += '<tbody>'
                data.forEach((item, index) => {
                    let sign = ''
                    if (item.Lamp === 'G') {
                        sign = '<div class="green sign-circle"><div>'
                    } else if (item.Lamp === 'Y') {
                        sign = '<div class="yellow sign-circle"><div>'
                    } else if (item.Lamp === 'R') {
                        sign = '<div class="red sign-circle"><div>'
                    }
                    tbodyContent += `
                  <tr>
                    <td class="text-center">${item.Brand}</td>
                    <td>${item.Items}</td>
                    <td class="text-center">${item.Target}</td>
                    <td class="text-center">${item.Value}</td>
                    <td class="text-center">${item.Total_Score}</td>
                    <td class="text-center">${item.Get_Score}</td>
                    <td align="center">${sign}</td>
                  `
                    if (index === 0) {
                        tbodyContent += `
                          <td rowspan="${data.length}"><pre style="font-size:14px">${item.Action}</pre></td>
                        `
                    }
                    tbodyContent += '</tr>'
                })
                content += tbodyContent

                content += '</table>'
                modalBody.innerHTML = content
            })
        myModal.show()
    }
})
// http://tw071273p/getCustomer_Ranking_Month.php
