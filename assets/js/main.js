// graph
const MainGraphCanvas = document.getElementById("main-graph")
const MainGraphCTX = MainGraphCanvas.getContext("2d")

// buttons
const CasesGraphButton = document.getElementById("cases-btn")
const DeathsGraphButton = document.getElementById("deaths-btn")

// text
const LastUpdatedText = document.getElementById("text-last-updated")

// data
let apiData = []
let dataLabels = []
let dailyCases = []
let sevenDayAverageCases = []
let dailyDeaths = []
let sevenDayAverageDeaths = []

// graphs enum
const DataGraph = {
    CASES: "cases",
    DEATHS: "deaths"
}

let currentGraph = DataGraph.CASES
let MainGraph = null

const DataURL = `https://api.coronavirus.data.gov.uk/v1/data?filters=areaType=overview&structure={"date":"date","areaName":"areaName","areaCode":"areaCode","newCasesByPublishDate":"newCasesByPublishDate","newDeaths28DaysByPublishDate":"newDeaths28DaysByPublishDate"}`
// const DataURL = "./assets/data/data.json"


window.addEventListener("load", () => {
    // get data from api
    fetch(DataURL, {
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => calculateData(data))
        .then(drawGraph)
        .catch(err => console.warn(err))
})

// button event listeners
CasesGraphButton.addEventListener("click", () => changeGraph(DataGraph.CASES));
DeathsGraphButton.addEventListener("click", () => changeGraph(DataGraph.DEATHS));

const changeGraph = (graph) => {
    currentGraph = graph
    drawGraph()
}

const calculateData = data => {
    // update last updated text with date, cases and deaths
    const lastUpdatedData = data.data[0];
    LastUpdatedText.innerText = `${lastUpdatedData.date} with ${lastUpdatedData.newCasesByPublishDate} cases and ${lastUpdatedData.newDeaths28DaysByPublishDate} deaths`

    // sort data points from oldest to newest to plot data correctly
    apiData = data.data
    apiData.sort((a, b) => new Date(a.date) - new Date(b.date))

    // extract dates as labels
    dataLabels = apiData.map(x => x.date)

    // cases data
    dailyCases = apiData.map(x => x.newCasesByPublishDate)
    sevenDayAverageCases = new Array(dailyCases.length)
    sevenDayAverageCases.fill(0)

    // calculate cases 7 day average
    for (let i = 6; i < dailyCases.length; i++) {
        const sumPastSeven = dailyCases[i] +
            dailyCases[i - 1] + dailyCases[i - 2] +
            dailyCases[i - 3] + dailyCases[i - 4] +
            dailyCases[i - 5] + dailyCases[i - 6]
        const avgPastSeven = sumPastSeven / 7
        const roundedAverage = Math.round(avgPastSeven)
        sevenDayAverageCases[i] = roundedAverage
    }

    // deaths data
    dailyDeaths = apiData.map(x => x.newDeaths28DaysByPublishDate)
    sevenDayAverageDeaths = new Array(dailyDeaths.length).fill(0)
    sevenDayAverageDeaths.fill(0)

    // calculate deaths 7 day average
    for (let i = 6; i < dailyDeaths.length; i++) {
        const sumPastSeven = dailyDeaths[i] +
            dailyDeaths[i - 1] + dailyDeaths[i - 2] +
            dailyDeaths[i - 3] + dailyDeaths[i - 4] +
            dailyDeaths[i - 5] + dailyDeaths[i - 6]
        const avgPastSeven = sumPastSeven / 7
        const roundedAverage = Math.round(avgPastSeven)
        sevenDayAverageDeaths[i] = roundedAverage
    }
}

const drawGraph = () => {
    if (MainGraph != null) MainGraph.destroy();

    let datasets = []

    switch (currentGraph) {
        case DataGraph.CASES:
            // 7-day average
            datasets.push({
                label: '7-Day Average',
                data: sevenDayAverageCases,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: 'rgb(0, 0, 0)',
                type: "line",
                borderWidth: 1,
                pointRadius: 0
            })

            // daily cases
            datasets.push({
                label: 'Daily Cases',
                data: dailyCases,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)'
            })

            break;

        case DataGraph.DEATHS:
            // 7-day average
            datasets.push({
                label: '7-Day Average',
                data: sevenDayAverageDeaths,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: 'rgb(0, 0, 0)',
                type: "line",
                borderWidth: 1,
                pointRadius: 0
            })

            // daily deaths
            datasets.push({
                label: 'Daily Deaths',
                backgroundColor: 'rgb(51, 150, 255)',
                borderColor: 'rgb(0, 128, 255)',
                data: dailyDeaths
            })
            break;
    }


    MainGraph = new Chart(MainGraphCTX, {
        // The type of chart we want to create
        type: 'bar',

        // The data for our dataset
        data: {
            labels: dataLabels,
            datasets: datasets
        },

        // Configuration options go here
        options: {
            elements: {
                line: {
                    tension: 0 // disables bezier curves
                }
            },
            devicePixelRatio: 3
        }
    })
}