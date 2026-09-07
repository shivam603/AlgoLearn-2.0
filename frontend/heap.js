async function heapify(ele, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) ele[left].style.background = 'blue';
    if (right < n) ele[right].style.background = 'blue';
    ele[i].style.background = 'yellow';
    await waitforme(delay);

    if (left < n) {
        const valLeft = getValueFromHeight(ele[left].style.height);
        const valLargest = getValueFromHeight(ele[largest].style.height);
        const isBigger = parseInt(ele[left].style.height) > parseInt(ele[largest].style.height);
        StepTracker.logComparison(left, largest, valLeft, valLargest, isBigger ? 'Left child larger' : 'Root larger');
        if (isBigger) largest = left;
    }
    if (right < n) {
        const valRight = getValueFromHeight(ele[right].style.height);
        const valLargest = getValueFromHeight(ele[largest].style.height);
        const isBigger = parseInt(ele[right].style.height) > parseInt(ele[largest].style.height);
        StepTracker.logComparison(right, largest, valRight, valLargest, isBigger ? 'Right child larger' : 'Current largest holds');
        if (isBigger) largest = right;
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
    StepTracker.logPhase('Building Max-Heap');

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(ele, n, i);
    }

    StepTracker.logPhase('Extracting Max Element from Heap');
    for (let i = n - 1; i > 0; i--) {
        await waitforme(delay);
        swap(ele[0], ele[i]);
        ele[i].style.background = 'green';
        StepTracker.logSorted(i, getValueFromHeight(ele[i].style.height));
        await heapify(ele, i, 0);
    }

    if (n > 0) {
        ele[0].style.background = 'green';
        StepTracker.logSorted(0, getValueFromHeight(ele[0].style.height));
    }
    StepTracker.logPhase('Completed');
}

const heapSortBtn = document.querySelector('.heapSort');
heapSortBtn.addEventListener('click', async function () {
    setComplexityInfo('Heap Sort');
    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    StepTracker.reset();
    const start = Date.now();
    await heapSort();
    const duration = Date.now() - start;
    await saveHistory('Heap Sort', array, duration);
    setComplexityInfo('Heap Sort');
    enableSortingBtn();
    enableSizeSlider();
    enableNewArrayBtn();
});