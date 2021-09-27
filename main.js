console.log('Customer Rank')
// API host name
const hostName = 'http://tw071273p/cq-warroom/'
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
            paintChartProduct('3D')
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
    overviewContent.style.display = 'block'
    paintTableStrategy()
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

function paintTableStrategy() {
    let qs = Qs
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
    axios.post(hostName + 'getCustomer_Ranking_Month.php', qs.stringify({ Year: thisYear })).then(function (res) {
        let data = res.data
        let dataThisMonth = data.filter((el) => Number(el.Year) === thisYear && Number(el.Month) === thisMonth)
        const sortList = ['TV', 'IAVM', 'MONITOR', 'NB', 'CE', 'MP', 'TABLET', 'AA-BD4']
        let dataUnTragetRender = []
        sortList.forEach((e) => {
            let data = dataThisMonth.filter((el) => el.Application === e && el.Lamp !== 'G')
            data = data.map((el) => {
                return {
                    Year: el.Year,
                    Month: el.Month,
                    Application: el.Application,
                    Brand: el.Brand,
                    Action: el.Action,
                }
            })
            dataUnTragetRender = dataUnTragetRender.concat(data)
        })
        console.log(dataUnTragetRender)
        const overviewTbody = document.querySelector('.overview-tbody')
        const strategyBrandList = document.querySelector('.strategy-brand-list')
        let content = ''
        let contentList = ''
        dataUnTragetRender.forEach((item) => {
            contentList += `
            <li id="${item.Application}_${item.Brand.replace('*', '')}_a">${item.Application} ${item.Brand}</li>
            `
            content += `
            <tr id="${item.Application}_${item.Brand.replace('*', '')}">
                <td align="center">${item.Application}</td>
                <td align="center">${item.Brand}</td>
                <td><pre>${item.Action}</pre></td>
            </tr>
            `
        })
        strategyBrandList.innerHTML = contentList
        overviewTbody.innerHTML = content
        strategyBrandList.addEventListener('click', function (e) {
            let target = e.target
            if (target.matches('li')) {
                const id = target.id.replace('_a', '')
                console.log(id)
                $('html,body').animate(
                    {
                        scrollTop: $(`#${id}`).offset().top,
                    },
                    800
                )
            }
        })
    })
}

function paintChartAnnual(bu, app) {
    overviewContent.style.display = 'flex'
    async function annualData() {
        const data1 = await axios.get(hostName + 'getCustomer_Ranking_Year.php')
        let qs = Qs
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
        const data2 = await axios.post(hostName + 'getCustomer_Ranking_Month.php', qs.stringify({ Year: thisYear }))
        return {
            data1,
            data2,
        }
    }
    annualData().then((res) => {
        let data = res.data1.data
        if (bu) {
            if (bu !== 'ALL') data = data.filter((el) => el.BU === bu)
        }
        if (app) data = data.filter((el) => el.APPLICATION === app)
        let dataYear = Array.from(new Set(data.map((el) => el.YEAR))).sort()
        let arr = []
        let arrMarkPoint = []
        dataYear.forEach((year, index) => {
            let obj = {}
            let d
            let total
            let overTarget
            let value
            if (Number(year) !== thisYear) {
                d = data.filter((el) => el.YEAR === year)
                total = d.length

                overTarget = d.filter((el) => el.SCORE === '達標').length
                value = ((overTarget / total) * 100).toFixed(0)
            } else {
                data = res.data2.data
                if (bu) {
                    switch (bu) {
                        case 'TV':
                            data = data.filter((el) => el.Application === 'TV')
                            break
                        case 'ITI':
                            data = data.filter(
                                (el) =>
                                    el.Application === 'IAVM' || el.Application === 'MONITOR' || el.Application === 'NB'
                            )
                            break
                        case 'MD':
                            data = data.filter(
                                (el) =>
                                    el.Application === 'CE' || el.Application === 'MP' || el.Application === 'TABLET'
                            )
                            break
                        case 'AA':
                            data = data.filter((el) => el.Application === 'AA-BD4')
                            break
                        default:
                            break
                    }
                }
                if (app) data = data.filter((el) => el.Application === app)
                d = data.filter((el) => el.Year === year)
                d = d.filter((el) => Number(el.Month) === thisMonth)
                total = d.length

                overTarget = d.filter((el) => el.Lamp === 'G').length
                value = ((overTarget / total) * 100).toFixed(0)
            }
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
function paintChartProduct(theme) {
    axios.get(hostName + 'getProductAchivementRate.php').then(function (res) {
        let data = res.data

        console.log(data)
        let obj = {}
        const chartProduct = document.querySelector('.chart-product')
        theme = theme || '2D'
        if (theme === '2D') {
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
            showChartProduct(chartProduct, obj)
        } else {
            console.log(thisYear, lastYear)
            obj.xAxis = data.item
            obj.yAxis = [monthList[thisMonth - 1], lastYear]
            console.log(data.bardata)
            data.bardata.reverse()
            const value = []
            const color = ['#F4A869', '#8FB5E4', '#B4A3C8', '#E7BAB9', '#FED7B7']
            data.bardata.forEach((item, x) => {
                item.data.forEach((e, y) => {
                    value.push({
                        value: [y, x, e],
                        itemStyle: { color: color[y] },
                    })
                })
            })
            obj.value = value
            console.log(obj)
            showChartProduct3D(chartProduct, obj)
        }
    })
}

function getOptionBU() {
    axios.get(hostName + 'getCustomer_Ranking_Year.php').then(function (res) {
        let data = res.data
        console.log(data)
        let dataBU = Array.from(new Set(data.map((el) => el.BU)))
        let dataApplication = Array.from(new Set(data.map((el) => el.APPLICATION)))
        const selectorBU = document.querySelector('#selectorBU')
        const selectorApp = document.querySelector('#selectorApp')
        function renderBuOption() {
            selectorBU.innerHTML = ''
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
            let indexData = 0
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
                    let obj = {}
                    if (dataBrand[index]) {
                        obj = {
                            year: dataBrand[index].Year,
                            month: dataBrand[index].Month,
                            application: dataBrand[index].Application,
                            brand: dataBrand[index].Brand,
                        }
                    }
                    arrBuCust.push(obj)

                    if (index !== target.length - 1) {
                        if (el === 'G') {
                            row += `<div><div class="circle green ${indexData}"></div></div>`
                        } else if (el === 'Y') {
                            row += `<div><div class="circle yellow ${indexData}"></div></div>`
                        } else if (el === 'R') {
                            row += `<div><div class="circle red ${indexData}"></div></div>`
                        } else {
                            row += `<div><div class="circle null"></div></div>`
                        }
                        // index對應
                        indexData += 1
                    } else {
                        let rankLastMonth = ''
                        if (rank[index].match(/[^A-Z][^None]/)) rankLastMonth = rank[index]
                        if (el === 'G') {
                            row += `<div><div class="circle green ${indexData} last-div">${rankLastMonth}</div></div>`
                        } else if (el === 'Y') {
                            row += `<div><div class="circle yellow ${indexData} last-div">${rankLastMonth}</div></div>`
                        } else if (el === 'R') {
                            row += `<div><div class="circle red ${indexData} last-div">${rankLastMonth}</div></div>`
                        } else {
                            row += `<div><div class="circle null last-div">${rankLastMonth}</div></div>`
                        }
                        // index對應
                        indexData += 1
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
    rankDescription.innerText = `${count} out of ${total}`
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

function showChartProduct3D(dom, data) {
    let myChart = echarts.init(dom)
    console.log('3D value:', data.value)

    let option
    option = {
        // tooltip: {},
        xAxis3D: {
            name: '',
            type: 'category',
            data: data.xAxis,
        },
        yAxis3D: {
            name: '',
            type: 'category',
            data: data.yAxis,
        },
        zAxis3D: {
            name: '',
            type: 'value',
        },
        grid3D: {
            boxWidth: 200,
            boxDepth: 80,
            viewControl: {
                beta: 20,
                alpha: 25,
            },
            light: {
                main: {
                    intensity: 1.2,
                    shadow: true,
                },
                ambient: {
                    intensity: 0.3,
                },
            },
        },
        series: [
            {
                type: 'bar3D',
                data: data.value,
                shading: 'lambert',
                barSize: 20,
                label: {
                    show: true,
                    fontSize: 16,
                    borderWidth: 1,
                    color: 'black',
                    formatter: function (e) {
                        return `${e.value[2]}%`
                    },
                },
                // itemStyle: { opacity: 0.8 },
                // emphasis: {
                //     itemStyle: {
                //         opacity: 1,
                //     },
                // },
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

// 呼叫modal
const myModal = new bootstrap.Modal(document.querySelector('#mainModal'))
const modalTitle = document.querySelector('.modal-title')
const modalBody = document.querySelector('.modal-body')
tableRank.addEventListener('click', function (e) {
    if (!e.target.matches('.null')) {
        let clickedIndex = e.target.classList[2]
        let clickedItem = arrBuCust[clickedIndex]
        let year = clickedItem.year
        let month = clickedItem.month
        let monthFormat = month < 10 ? `0${month}` : month
        let application = clickedItem.application
        let brand = clickedItem.brand
        modalTitle.innerText = `${year} / ${monthFormat} ${application} ${brand}：未達標對策`

        console.log('url :', hostName + 'getBrand_Score.php')
        let qs = Qs
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
        axios
            .post(
                hostName + 'getBrand_Score.php',
                qs.stringify({ Year: year, Month: month, Application: application, Brand: brand })
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
// back to top
const backToTop = document.querySelector('#backToTop')
window.onscroll = function () {
    scrollFunction()
}

function scrollFunction() {
    if (document.body.scrollTop > 600 || document.documentElement.scrollTop > 600) {
        backToTop.style.display = 'block'
    } else {
        backToTop.style.display = 'none'
    }
}
// http://tw071273p/getCustomer_Ranking_Month.php
