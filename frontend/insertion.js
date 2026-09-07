async function insertion() {
    const ele = document.querySelectorAll(".bar");
    StepTracker.reset();
    ele[0].style.background = 'green';
    StepTracker.logSorted(0, getValueFromHeight(ele[0].style.height));

    for (let i = 1; i < ele.length; i++) {
        let j = i - 1;
        let key = ele[i].style.height;
        const keyVal = getValueFromHeight(key);
        StepTracker.logPhase(`Inserting element at index ${i} (${keyVal})`);
        ele[i].style.background = 'blue';

        await waitforme(delay);

        while (j >= 0) {
            const valJ = getValueFromHeight(ele[j].style.height);
            const needsShift = parseInt(ele[j].style.height) > parseInt(key);
            StepTracker.logComparison(j, i, valJ, keyVal, needsShift ? 'Shifting right' : 'Correct position found');

            if (!needsShift) break;

            ele[j].style.background = 'blue';
            setBarHeight(ele[j + 1], ele[j].style.height);
            j--;

            await waitforme(delay);

            for (let k = i; k >= 0; k--) {
                ele[k].style.background = 'green';
            }
        }
        setBarHeight(ele[j + 1], key);
        ele[i].style.background = 'green';
        StepTracker.logSorted(j + 1, keyVal);
    }
    StepTracker.logPhase('Completed');
}

const inSortbtn = document.querySelector(".insertionSort");
inSortbtn.addEventListener('click', async function () {
    setComplexityInfo('Insertion Sort');
    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    const start = Date.now();
    await insertion();
    const duration = Date.now() - start;
    await saveHistory('Insertion Sort', array, duration);
    setComplexityInfo('Insertion Sort');
    enableSortingBtn();
    enableSizeSlider();
    enableNewArrayBtn();
});
