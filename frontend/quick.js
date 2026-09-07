
async function partitionLomuto(ele, l, r) {
    let i = l - 1;
    ele[r].style.background = 'red';
    const pivotVal = getValueFromHeight(ele[r].style.height);
    StepTracker.logPhase(`Partitioning [${l}..${r}] with Pivot ${pivotVal}`);

    for (let j = l; j <= r - 1; j++) {
        ele[j].style.background = 'yellow';
        const valJ = getValueFromHeight(ele[j].style.height);
        const isSmaller = parseInt(ele[j].style.height) < parseInt(ele[r].style.height);
        StepTracker.logComparison(j, r, valJ, pivotVal, isSmaller ? 'Smaller than pivot' : 'Greater than pivot');

        await waitforme(delay);

        if (isSmaller) {
            i++;
            swap(ele[i], ele[j]);
            ele[i].style.background = 'orange';
            if (i !== j) ele[j].style.background = 'orange';
            await waitforme(delay);
        } else {
            ele[j].style.background = 'pink';
        }
    }
    i++;
    await waitforme(delay);
    swap(ele[i], ele[r]);
    ele[r].style.background = 'pink';
    ele[i].style.background = 'green';
    StepTracker.logSorted(i, getValueFromHeight(ele[i].style.height));

    await waitforme(delay);

    for (let k = 0; k < ele.length; k++) {
        if (ele[k].style.background !== 'green')
            ele[k].style.background = 'cyan';
    }

    return i;
}

async function quickSort(ele, l, r) {
    if (l < r) {
        let pivot_index = await partitionLomuto(ele, l, r);
        await quickSort(ele, l, pivot_index - 1);
        await quickSort(ele, pivot_index + 1, r);
    } else {
        if (l >= 0 && r >= 0 && l < ele.length && r < ele.length) {
            ele[r].style.background = 'green';
            ele[l].style.background = 'green';
            StepTracker.logSorted(r, getValueFromHeight(ele[r].style.height));
        }
    }
}

const quickSortbtn = document.querySelector(".quickSort");
quickSortbtn.addEventListener('click', async function () {
    setComplexityInfo('Quick Sort');
    let ele = document.querySelectorAll('.bar');
    let l = 0;
    let r = ele.length - 1;
    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    StepTracker.reset();
    const start = Date.now();
    await quickSort(ele, l, r);
    StepTracker.logPhase('Completed');
    const duration = Date.now() - start;
    await saveHistory('Quick Sort', array, duration);
    setComplexityInfo('Quick Sort');
    enableSortingBtn();
    enableSizeSlider();
    enableNewArrayBtn();
});