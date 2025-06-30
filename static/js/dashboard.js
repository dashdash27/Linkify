
// --- Count block ---
const count = document.querySelector('.count')
const line = count.querySelector('.line')
const legend = count.querySelector('.legend')
const notesCount = legend.querySelector('.notes').getAttribute('data-count')
const foldersCount = legend.querySelector('.folders').getAttribute('data-count')
const linksCount = legend.querySelector('.links').getAttribute('data-count')

// обновляем линию
const commonCount = Number(notesCount) + Number(foldersCount) + Number(linksCount)
console.log(commonCount)
line.querySelector('.notes').style.width = `${notesCount / commonCount * 100}%`
line.querySelector('.folders').style.width = `${foldersCount / commonCount * 100}%`
line.querySelector('.links').style.width = `${linksCount / commonCount * 100}%`

// --- Donut Chart ---
const donut = document.querySelector('.donut')
const donutChart = donut.querySelector('.donut-chart')
const donutPercent = Number(donutChart.getAttribute('data-percent'))
const innerRound = donut.querySelector('.inner-round')
innerRound.innerHTML = `${donutPercent}%`

if (donutPercent == 100) {
    donut.querySelector('.desc').innerHTML = "Все заметки имеют связи, отличный результат!"
}
else if (donutPercent >= 75) {
    donut.querySelector('.desc').innerHTML = "Почти все заметки связаны, это хороший показатель!"
}
else if (donutPercent >= 40) {
    donut.querySelector('.desc').innerHTML = "Это хорошо, но возможно вам стоит добавить связей)"
}
else {
    donut.querySelector('.desc').innerHTML = "Добавьте связей в ваши заметки, чтобе не потерять их!"
}

donutChart.style.background = `conic-gradient(var(--accent-color) 0% ${donutPercent}%,var(--sub-color) ${donutPercent}% 100%)`
console.log(`conic-gradient(var(--accent-color) 0% ${donutPercent}%,var(--sub-color) ${donutPercent}% 100%)`)

// заполняем список несвязанных заметок
const noConnected = document.querySelector('.no-connected')
const showLonely = document.querySelector('.show-lonely')
showLonely.addEventListener('click', () => {
    if (noConnected.style.display == "none") {
        noConnected.style.display = "block"
    }
    else {
        noConnected.style.display = "none"
    }
})
