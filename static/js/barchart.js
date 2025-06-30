// --- Bar Chart ---
let data_backs = null
let data_outs = null
let data_total_links = null

// --- Поиск backlinks --- 
function set_greatest_backs() {
    return fetch('/get_greatest_backs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: user_id
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to get greatest backs');
        }
        return response.json();
    })
    .then(data => {
        data_backs = data
        console.log(data_backs)
        return true;
    })
    .catch(error => {
        console.error('Error getting greatest backs', error);
        throw error;
    })
}

// --- Поиск outlinks --- 
function set_greatest_outs() {
    return fetch('/get_greatest_outs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: user_id
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to get greatest outs');
        }
        return response.json();
    })
    .then(data => {
        data_outs = data
        console.log(data_outs)
        return true;
    })
    .catch(error => {
        console.error('Error getting greatest outs', error);
        throw error;
    })
}

// --- Поиск total links --- 
function set_greatest_total_links() {
    return fetch('/get_greatest_total_links', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: user_id
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to get greatest total links');
        }
        return response.json();
    })
    .then(data => {
        data_total_links = data
        console.log(data_total_links)
        return true;
    })
    .catch(error => {
        console.error('Error getting greatest total links', error);
        throw error;
    })
}


function draw_bar(dataset) {
    const barChart = document.querySelector('.bar-chart')

    // находим максимум среди значений
    let max = 0;
    for (let i = 0; i < dataset.length; i++) {
        if (dataset[i][0] > max) {
          max = dataset[i][0];
        }
    }

    dataset = dataset.filter(item => item[0] !== 0)

    if (dataset.length !== 0 && max !== 0) {
        const k = 200/(max+1)

        dataset.forEach((value) => {
            // создаем столбик
            const barItem = document.createElement('a');
            barItem.href = "/note/" + value[2]
            barItem.classList.add('bar-item');
            barItem.style.height = `${value[0] * k}px`; // Масштабируем высоту
            barItem.setAttribute('data-label', value[1]);
            barChart.appendChild(barItem);

            // создаем tooltip
            const tooltip = document.createElement('div')
            tooltip.classList.add('tooltip')
            tooltip.innerHTML = value[0].toString() + ' links'
            barItem.appendChild(tooltip)
        })

        // --- create tick

        // добавляем числа на шкале
        let i = 1;
        let t = 1;
        if (max > 10) {
            t = 2
        }
        while (i <= max+1) {
            // добавляем tick
            const tick = document.createElement('div');
            tick.classList.add('tick');
            tick.style.bottom = `${i * k}px`
            tick.innerHTML = i.toString()
            barChart.appendChild(tick);

            // добаляем пунктир
            const dash = document.createElement('div')
            dash.classList.add('dash');
            dash.style.bottom = `${i * k}px`
            barChart.appendChild(dash);

            i = i + t
            console.log(i)
        }
    }

}

Promise.all([set_greatest_backs(), set_greatest_outs(), set_greatest_total_links()])
    .then(() => {
        console.log('После выполнения функций:', data_backs, data_outs)
        // Здесь вы можете работать с data_backs и data_others
        draw_bar(data_backs)

        // обработчики событий на выбор графика
        const selectItems = document.querySelectorAll('.select-item')
        console.log(selectItems)

        selectItems.forEach((element) => {
            element.addEventListener('click', function(event) {
                const variant = element.getAttribute('data-variant') 

                console.log(variant)
                
                if (variant == 'back') {
                    document.querySelector('.bar-chart').innerHTML = ""
                    document.querySelector('.bar').querySelector('.desc').innerHTML = "Заметки, которые упоминались чаще всего"
                    draw_bar(data_backs)
                }
                if (variant == 'out') {
                    document.querySelector('.bar-chart').innerHTML = ""
                    document.querySelector('.bar').querySelector('.desc').innerHTML = "Заметки, в которых больше всего ссылок"
                    draw_bar(data_outs)
                }
                if (variant == 'total') {
                    document.querySelector('.bar-chart').innerHTML = ""
                    document.querySelector('.bar').querySelector('.desc').innerHTML = "Самые связанные заметки"
                    draw_bar(data_total_links)
                }

                selectItems.forEach((elem) => {
                    elem.classList.remove('select-item-active')
                })

                element.classList.add('select-item-active')
            });
        });
    })
    .catch(error => {
        console.error('Error:', error);
    })

