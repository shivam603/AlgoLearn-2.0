//let delay = 30;
async function merge(ele, low, mid, high) {
    const n1 = mid - low + 1;
    const n2 = high - mid;
    let left = new Array(n1);
    let right = new Array(n2);
    StepTracker.logPhase(`Merging subarrays [${low}..${mid}] and [${mid + 1}..${high}]`);

    for (let i = 0; i < n1; i++) {
        await waitforme(delay);
        ele[low + i].style.background = 'orange';
        left[i] = ele[low + i].style.height;
    }
    for (let i = 0; i < n2; i++) {
        await waitforme(delay);
        ele[mid + 1 + i].style.background = 'yellow';
        right[i] = ele[mid + 1 + i].style.height;
    }
    await waitforme(delay);
    let i = 0, j = 0, k = low;
    while (i < n1 && j < n2) {
        await waitforme(delay);
        const valL = getValueFromHeight(left[i]);
        const valR = getValueFromHeight(right[j]);
        const leftIsSmaller = parseInt(left[i]) <= parseInt(right[j]);
        StepTracker.logComparison(low + i, mid + 1 + j, valL, valR, leftIsSmaller ? `Take left (${valL})` : `Take right (${valR})`);

        if (leftIsSmaller) {
            ele[k].style.background = (n1 + n2 === ele.length) ? 'green' : 'lightgreen';
            setBarHeight(ele[k], left[i]);
            i++;
            k++;
        } else {
            ele[k].style.background = (n1 + n2 === ele.length) ? 'green' : 'lightgreen';
            setBarHeight(ele[k], right[j]);
            j++;
            k++;
        }
    }
    while (i < n1) {
        await waitforme(delay);
        ele[k].style.background = (n1 + n2 === ele.length) ? 'green' : 'lightgreen';
        setBarHeight(ele[k], left[i]);
        i++;
        k++;
    }
    while (j < n2) {
        await waitforme(delay);
        ele[k].style.background = (n1 + n2 === ele.length) ? 'green' : 'lightgreen';
        setBarHeight(ele[k], right[j]);
        j++;
        k++;
    }
}

async function mergeSort(ele, l, r) {
    if (l >= r) return;
    const m = l + Math.floor((r - l) / 2);
    await mergeSort(ele, l, m);
    await mergeSort(ele, m + 1, r);
    await merge(ele, l, m, r);
}

const mergeSortbtn = document.querySelector(".mergeSort");
mergeSortbtn.addEventListener('click', async function () {
    setComplexityInfo('Merge Sort');
    let ele = document.querySelectorAll('.bar');
    let l = 0;
    let r = parseInt(ele.length) - 1;
    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    StepTracker.reset();
    const start = Date.now();
    await mergeSort(ele, l, r);
    StepTracker.logPhase('Completed');
    const duration = Date.now() - start;
    await saveHistory('Merge Sort', array, duration);
    setComplexityInfo('Merge Sort');
    enableSortingBtn();
    enableSizeSlider();
    enableNewArrayBtn();
});
