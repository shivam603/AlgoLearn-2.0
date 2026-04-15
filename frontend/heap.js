async function heapify(ele, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) ele[left].style.background = 'blue';
    if (right < n) ele[right].style.background = 'blue';
    ele[i].style.background = 'yellow';
    await waitforme(delay);

    if (left < n && parseInt(ele[left].style.height) > parseInt(ele[largest].style.height)) {
        largest = left;
    }
    if (right < n && parseInt(ele[right].style.height) > parseInt(ele[largest].style.height)) {
        largest = right;
    }

    if (largest !== i) {
        await waitforme(delay);
        swap(ele[i], ele[largest]);
        ele[i].style.background = 'cyan';
        ele[largest].style.background = 'cyan';
        await heapify(ele, n, largest);
    } else {
        ele[i].style.background = 'cyan';
        if (left < n) ele[left].style.background = 'cyan';
        if (right < n) ele[right].style.background = 'cyan';
    }
}

async function heapSort() {
    const ele = document.querySelectorAll('.bar');
    const n = ele.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(ele, n, i);
    }

    for (let i = n - 1; i > 0; i--) {
        await waitforme(delay);
        swap(ele[0], ele[i]);
        ele[i].style.background = 'green';
        await heapify(ele, i, 0);
    }

    if (n > 0) {
        ele[0].style.background = 'green';
    }
}

const heapSortBtn = document.querySelector('.heapSort');
heapSortBtn.addEventListener('click', async function () {
    setComplexityInfo('Heap Sort');
    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    const start = Date.now();
    await heapSort();
    const duration = Date.now() - start;
    await saveHistory('Heap Sort', array, duration);
    setComplexityInfo('Heap Sort');
    enableSortingBtn();
    enableSizeSlider();
    enableNewArrayBtn();
});