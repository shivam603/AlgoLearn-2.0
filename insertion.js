async function insertion() {
    console.log('In insertion()');
    const ele = document.querySelectorAll(".bar");
    // color
    ele[0].style.background = 'green';
    for (let i = 1; i < ele.length; i++) {
        console.log('In ith loop');
        let j = i - 1;
        let key = ele[i].style.height;
        // color
        ele[i].style.background = 'blue';

        await waitforme(delay);

        while (j >= 0 && (parseInt(ele[j].style.height) > parseInt(key))) {
            console.log('In while loop');
            // color
            ele[j].style.background = 'blue';
            setBarHeight(ele[j + 1], ele[j].style.height);
            j--;

            await waitforme(delay);

            // color
            for (let k = i; k >= 0; k--) {
                ele[k].style.background = 'green';
            }
        }
        setBarHeight(ele[j + 1], key);
        // color
        ele[i].style.background = 'green';
    }
}

const inSortbtn = document.querySelector(".insertionSort");
inSortbtn.addEventListener('click', async function () {
    setComplexityInfo('Insertion Sort'); disableSortingBtn();
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


