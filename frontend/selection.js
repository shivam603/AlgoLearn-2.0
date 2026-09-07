async function selection() {
    const ele = document.querySelectorAll(".bar");
    StepTracker.reset();
    for (let i = 0; i < ele.length; i++) {
        StepTracker.logPhase(`Finding minimum for position ${i}`);
        let min_index = i;
        ele[i].style.background = 'blue';
        for (let j = i + 1; j < ele.length; j++) {
            ele[j].style.background = 'red';
            const valJ = getValueFromHeight(ele[j].style.height);
            const valMin = getValueFromHeight(ele[min_index].style.height);
            const isNewMin = parseInt(ele[j].style.height) < parseInt(ele[min_index].style.height);
            StepTracker.logComparison(j, min_index, valJ, valMin, isNewMin ? 'New minimum found' : 'Not smaller');

            await waitforme(delay);
            if (isNewMin) {
                if (min_index !== i) {
                    ele[min_index].style.background = 'cyan';
                }
                min_index = j;
            } else {
                ele[j].style.background = 'cyan';
            }
        }
        await waitforme(delay);
        swap(ele[min_index], ele[i]);
        ele[min_index].style.background = 'cyan';
        ele[i].style.background = 'green';
        StepTracker.logSorted(i, getValueFromHeight(ele[i].style.height));
    }
    StepTracker.logPhase('Completed');
}

const selectionSortbtn = document.querySelector(".selectionSort");
selectionSortbtn.addEventListener('click', async function () {
    setComplexityInfo('Selection Sort');
    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    const start = Date.now();
    await selection();
    const duration = Date.now() - start;
    await saveHistory('Selection Sort', array, duration);
    setComplexityInfo('Selection Sort');
    enableSortingBtn();
    enableSizeSlider();
    enableNewArrayBtn();
});