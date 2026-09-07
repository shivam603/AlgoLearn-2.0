async function bubble() {
    const ele = document.querySelectorAll(".bar");
    StepTracker.reset();
    for (let i = 0; i < ele.length - 1; i++) {
        StepTracker.logPhase(`Pass ${i + 1} / ${ele.length - 1}`);
        for (let j = 0; j < ele.length - i - 1; j++) {
            ele[j].style.background = 'blue';
            ele[j + 1].style.background = 'blue';
            const valA = getValueFromHeight(ele[j].style.height);
            const valB = getValueFromHeight(ele[j + 1].style.height);
            const shouldSwap = parseInt(ele[j].style.height) > parseInt(ele[j + 1].style.height);
            StepTracker.logComparison(j, j + 1, valA, valB, shouldSwap ? 'Swap required' : 'In order');

            if (shouldSwap) {
                await waitforme(delay);
                swap(ele[j], ele[j + 1]);
            }
            ele[j].style.background = 'cyan';
            ele[j + 1].style.background = 'cyan';
        }
        ele[ele.length - 1 - i].style.background = 'green';
        StepTracker.logSorted(ele.length - 1 - i, getValueFromHeight(ele[ele.length - 1 - i].style.height));
    }
    ele[0].style.background = 'green';
    StepTracker.logSorted(0, getValueFromHeight(ele[0].style.height));
    StepTracker.logPhase('Completed');
}

const bubSortbtn = document.querySelector(".bubbleSort");
bubSortbtn.addEventListener('click', async function () {
    setComplexityInfo('Bubble Sort');
    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    const start = Date.now();
    await bubble();
    const duration = Date.now() - start;
    await saveHistory('Bubble Sort', array, duration);
    setComplexityInfo('Bubble Sort');
    enableSortingBtn();
    enableSizeSlider();
    enableNewArrayBtn();
});
