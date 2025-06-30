
function set_connected_components() {
    return fetch('/get_connected_components', {
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
            throw new Error('Failed to get connected notes');
        }
        return response.json();
    })
    .then(data => {
        data_cluster = data
        return true;
    })
    .catch(error => {
        console.error('Error getting connected notes', error);
        throw error;
    })
}

// --- Draw bubbles ---
function drawCluster(dataset) {
    const cluster = document.querySelector('.cluster')
    const clusterItems = cluster.querySelector('.items')

    console.log(clusterItems)

    const maxim = dataset[0].length
    let op = 0.9
    
    dataset.forEach((value) => {
        const item = document.createElement('div')
        item.classList.add('cluster-item')

        // работаем со стилями
        item.style.width = `${value.length * 110 / maxim}px`
        item.style.height = `${value.length * 110 / maxim}px`
        item.style.fontSize = `${value.length * 4}px`
        item.innerHTML = value.length
        item.style.opacity = `${op}`
        op -= 0.15

        // добавлям блок со списком заметок
        const clusterNotes = document.createElement('div')
        clusterNotes.classList.add('cluster-notes')
        value.forEach((elem) => {
            const clusterNote = document.createElement('a')
            clusterNote.href = "/note/" + elem[1]
            clusterNote.classList.add('cluster-note')
            clusterNote.innerHTML = elem[0]

            clusterNotes.appendChild(clusterNote)
            item.appendChild(clusterNotes)
        })

        // добавляем item к items
        clusterItems.appendChild(item)
    })
}

let data_cluster = null

Promise.all([set_connected_components(user_id)])
    .then(() => {
        console.log("Выполнилось")
        console.log(data_cluster)

        drawCluster(data_cluster)

        const clusterItems = document.querySelectorAll('.cluster-item')
        clusterItems[0].classList.add('active-cluster')
        clusterItems.forEach((clusterItem) => {
            clusterItem.addEventListener('click', function(event) {
                clusterItems.forEach((elem) => {
                    elem.classList.remove('active-cluster')
                })
                clusterItem.classList.add('active-cluster')
            })
        })
        
    })
    .catch(error => {
        console.error('Error:', error);
    })