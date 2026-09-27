let raceMode = false;

function createState(id) {
    return {
        id: id,
        array: [],
        originalArray: [],
        auxArray: null,
        algorithm: 'bubble',
        isRunning: false,
        isPaused: false,
        comparisons: 0,
        swaps: 0,
        sortedIndices: new Set(),
        generator: null,
        resolvePause: null,
        viewMode: 'container'
    };
}

const state1 = createState(1);
const state2 = createState(2);
state2.algorithm = 'quick'; // Default race opponent
let state = state1; // Global active context

// Algorithm Metadata
const algorithmInfo = {
    bubble: {
        name: 'Bubble Sort',
        timeBest: 'Ω(n)',
        timeAvg: 'Θ(n²)',
        timeWorst: 'O(n²)',
        spaceComplexity: 'O(1)',
        description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Large values "bubble" to the top.',
        pseudocode: [
            "for i = 0 to n - 1",
            "  swapped = false",
            "  for j = 0 to n - i - 1",
            "    if arr[j] > arr[j + 1]",
            "      swap(arr[j], arr[j + 1])",
            "      swapped = true",
            "  if not swapped break"
        ]
    },
    selection: {
        name: 'Selection Sort',
        timeBest: 'Ω(n²)',
        timeAvg: 'Θ(n²)',
        timeWorst: 'O(n²)',
        spaceComplexity: 'O(1)',
        description: 'Divides the list into a sorted and unsorted region. Repeatedly finds the minimum element from the unsorted region and puts it at the end of the sorted region.',
        pseudocode: [
            "for i = 0 to n - 1",
            "  minIdx = i",
            "  for j = i + 1 to n",
            "    if arr[j] < arr[minIdx]",
            "      minIdx = j",
            "  if minIdx != i",
            "    swap(arr[i], arr[minIdx])"
        ]
    },
    insertion: {
        name: 'Insertion Sort',
        timeBest: 'Ω(n)',
        timeAvg: 'Θ(n²)',
        timeWorst: 'O(n²)',
        spaceComplexity: 'O(1)',
        description: 'Builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms such as quicksort, heapsort, or merge sort.',
        pseudocode: [
            "for i = 1 to n - 1",
            "  key = arr[i]; j = i - 1",
            "  while j >= 0 and arr[j] > key",
            "    arr[j + 1] = arr[j]",
            "    j = j - 1",
            "  arr[j + 1] = key"
        ]
    },
    merge: {
        name: 'Merge Sort',
        timeBest: 'Ω(n log n)',
        timeAvg: 'Θ(n log n)',
        timeWorst: 'O(n log n)',
        spaceComplexity: 'O(n)',
        description: 'Divides the unsorted list into n sublists, each containing one element, then repeatedly merges sublists to produce new sorted sublists until there is only one sorted list remaining.',
        pseudocode: [
            "mergeSort(arr, left, right)",
            "  if left >= right return",
            "  mid = Math.floor((left + right) / 2)",
            "  mergeSort(arr, left, mid)",
            "  mergeSort(arr, mid + 1, right)",
            "  merge(arr, left, mid, right)"
        ]
    },
    quick: {
        name: 'Quick Sort',
        timeBest: 'Ω(n log n)',
        timeAvg: 'Θ(n log n)',
        timeWorst: 'O(n²)',
        spaceComplexity: null,
        spaceBest: 'O(log n)',
        spaceAvg: 'O(log n)',
        spaceWorst: 'O(n)',
        description: 'Picks an element as pivot and partitions the given array around the picked pivot, placing smaller elements to the left and larger to the right.',
        pseudocode: [
            "quickSort(arr, low, high)",
            "  if low < high",
            "    pi = partition(arr, low, high)",
            "    quickSort(arr, low, pi - 1)",
            "    quickSort(arr, pi + 1, high)",
            "",
            "partition(arr, low, high)",
            "  pivot = arr[high]; i = low - 1",
            "  for j = low to high - 1",
            "    if arr[j] < pivot",
            "      i++; swap(arr[i], arr[j])",
            "  swap(arr[i + 1], arr[high])",
            "  return i + 1"
        ]
    },
    heap: {
        name: 'Heap Sort',
        timeBest: 'Ω(n log n)',
        timeAvg: 'Θ(n log n)',
        timeWorst: 'O(n log n)',
        spaceComplexity: 'O(1)',
        description: 'Can be thought of as an improved selection sort: like that algorithm, it divides its input into a sorted and an unsorted region, and it iteratively shrinks the unsorted region by extracting the largest element.',
        pseudocode: [
            "heapSort(arr, n)",
            "  for i = n / 2 - 1 down to 0",
            "    heapify(arr, n, i)",
            "  for i = n - 1 down to 1",
            "    swap(arr[0], arr[i])",
            "    heapify(arr, i, 0)",
            "",
            "heapify(arr, n, i)",
            "  largest = i",
            "  if left < n and arr[left] > arr[largest]",
            "    largest = left",
            "  if right < n and arr[right] > arr[largest]",
            "    largest = right",
            "  if largest != i",
            "    swap(arr[i], arr[largest])",
            "    heapify(arr, n, largest)"
        ]
    },
    radix: {
        name: 'Radix Sort',
        timeBest: 'Ω(nk)',
        timeAvg: 'Θ(nk)',
        timeWorst: 'O(nk)',
        spaceComplexity: 'O(n + k)',
        description: 'A non-comparative integer sorting algorithm that sorts data with integer keys by grouping keys by the individual digits which share the same significant position and value.',
        pseudocode: [
            "radixSort(arr)",
            "  max_val = max(arr)",
            "  exp = 1",
            "  while max_val / exp > 0",
            "    countingSortByDigit(arr, exp)",
            "    exp *= 10",
            "",
            "countingSortByDigit(arr, exp)",
            "  buckets = create 10 empty buckets",
            "  for each num in arr",
            "    digit = (num / exp) % 10",
            "    buckets[digit].push(num)",
            "  idx = 0",
            "  for each bucket in buckets",
            "    for each num in bucket",
            "      arr[idx++] = num"
        ]
    }
};

// DOM Elements
const els = {
    visualizer: document.getElementById('visualizer'),
    auxContainer: document.getElementById('auxContainer'),
    auxVisualizer: document.getElementById('auxVisualizer'),
    pseudocodeContainer: document.getElementById('pseudocodeContainer'),
    liveNotes: document.getElementById('liveNotes'),
    
    // Race Mode Elements
    visualizer2: document.getElementById('visualizer2'),
    auxContainer2: document.getElementById('auxContainer2'),
    auxVisualizer2: document.getElementById('auxVisualizer2'),
    algoSelect2: document.getElementById('algoSelect2'),
    algoSelect2Wrapper: document.getElementById('algoSelect2Wrapper'),
    raceModeBtn: document.getElementById('raceModeBtn'),
    compCount2: document.getElementById('compCount2'),
    swapCount2: document.getElementById('swapCount2'),
    raceContainer2: document.getElementById('raceContainer2'),
    player1Label: document.getElementById('player1Label'),
    player2Label: document.getElementById('player2Label'),

    algoSelect: document.getElementById('algoSelect'),
    playBtn: document.getElementById('playBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    stepBtn: document.getElementById('stepBtn'),
    resetBtn: document.getElementById('resetBtn'),
    newArrayBtn: document.getElementById('newArrayBtn'),
    arrayPattern: document.getElementById('arrayPattern'),
    speedSlider: document.getElementById('speedSlider'),
    sizeSlider: document.getElementById('sizeSlider'),
    sizeValue: document.getElementById('sizeValue'),
    viewContainerBtn: document.getElementById('viewContainerBtn'),
    viewGraphBtn: document.getElementById('viewGraphBtn'),
    customArrayInput: document.getElementById('customArrayInput'),
    loadCustomBtn: document.getElementById('loadCustomBtn'),
    compCount: document.getElementById('compCount'),
    swapCount: document.getElementById('swapCount'),
    statusText: document.getElementById('statusText'),
    algoName: document.getElementById('algoName'),
    timeBest: document.getElementById('timeBest'),
    timeAvg: document.getElementById('timeAvg'),
    timeWorst: document.getElementById('timeWorst'),
    spaceComplexity: document.getElementById('spaceComplexity'),
    spaceSingle: document.getElementById('spaceSingle'),
    spaceMultiBest: document.getElementById('spaceMultiBest'),
    spaceMultiAvg: document.getElementById('spaceMultiAvg'),
    spaceMultiWorst: document.getElementById('spaceMultiWorst'),
    spaceBest: document.getElementById('spaceBest'),
    spaceAvg: document.getElementById('spaceAvg'),
    spaceWorst: document.getElementById('spaceWorst'),
    algoDesc: document.getElementById('algoDesc')
};

// Utility to delay animation
const getDelay = () => {
    const speed = parseInt(els.speedSlider.value);
    return 1000 - (speed * 9.95);
};

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const checkPause = async () => {
    if (state.isPaused) {
        await new Promise(resolve => {
            state.resolvePause = resolve;
        });
    }
};

// Array Management
function generateArray() {
    const size = parseInt(els.sizeSlider.value);
    els.sizeValue.innerText = size;
    els.customArrayInput.value = ''; // clear custom input
    
    let newArr = [];
    const pattern = els.arrayPattern ? els.arrayPattern.value : 'random';

    if (pattern === 'few_unique') {
        const uniques = [10, 50, 150, 250, 390];
        for (let i = 0; i < size; i++) {
            newArr.push(uniques[Math.floor(Math.random() * uniques.length)]);
        }
    } else {
        for (let i = 0; i < size; i++) {
            newArr.push(Math.floor(Math.random() * 390) + 10);
        }
    }
    
    if (pattern === 'reversed') {
        newArr.sort((a, b) => b - a);
    } else if (pattern === 'nearly') {
        newArr.sort((a, b) => a - b);
        const swaps = Math.max(1, Math.floor(size * 0.15));
        for (let i = 0; i < swaps; i++) {
            let idx1 = Math.floor(Math.random() * size);
            let idx2 = Math.floor(Math.random() * size);
            [newArr[idx1], newArr[idx2]] = [newArr[idx2], newArr[idx1]];
        }
    }

    // Apply to both states
    [state1, state2].forEach(s => {
        s.array = [...newArr];
        s.originalArray = [...newArr];
        s.auxArray = null;
        s.sortedIndices.clear();
        s.comparisons = 0;
        s.swaps = 0;
        s.generator = null;
        s.isRunning = false;
        s.isPaused = false;
    });

    if (els.auxContainer) { els.auxContainer.classList.add('hidden'); els.auxContainer.classList.remove('flex'); }
    if (els.auxContainer2) { els.auxContainer2.classList.add('hidden'); els.auxContainer2.classList.remove('flex'); }

    updateStats();
    state1.generator = null;
    state2.generator = null;
    state1.isRunning = false;
    state2.isRunning = false;
    
    renderBars({}, null, 1);
    if (raceMode) renderBars({}, null, 2);
    
    setStatus('Idle', 'text-slate-300');
    updatePseudocode([]);
    els.liveNotes.innerText = 'Waiting to start animation...';
}

function loadCustomArray() {
    const input = els.customArrayInput.value;
    if (!input.trim()) return;

    const parsed = input.split(/[, ]+/)
                        .map(v => parseInt(v.trim(), 10))
                        .filter(v => !isNaN(v));
    
    if (parsed.length === 0) {
        setStatus('Invalid Input', 'text-emerald-400');
        return;
    }
    
    if (parsed.length > 100) {
        parsed.length = 100; // Limit to 100 elements
    }

    if (state1.resolvePause) state1.resolvePause();
    if (state2.resolvePause) state2.resolvePause();
    
    [state1, state2].forEach(s => {
        s.array = [...parsed];
        s.originalArray = [...parsed];
        s.auxArray = null;
        s.sortedIndices.clear();
        s.comparisons = 0;
        s.swaps = 0;
        s.isRunning = false;
        s.isPaused = false;
        s.generator = null;
    });

    if (els.auxContainer) { els.auxContainer.classList.add('hidden'); els.auxContainer.classList.remove('flex'); }
    if (els.auxContainer2) { els.auxContainer2.classList.add('hidden'); els.auxContainer2.classList.remove('flex'); }

    els.sizeSlider.value = Math.max(5, parsed.length);
    els.sizeValue.innerText = parsed.length;

    updateStats();
    renderBars({}, null, 1);
    if (raceMode) renderBars({}, null, 2);
    setStatus('Custom Array Loaded', 'text-slate-300');
    updateButtonsState();
    updatePseudocode([]);
    els.liveNotes.innerText = 'Waiting to start animation...';
}

function resetArray() {
    [state1, state2].forEach(s => {
        s.array = [...s.originalArray];
        s.auxArray = null;
        s.sortedIndices.clear();
        s.comparisons = 0;
        s.swaps = 0;
        s.isRunning = false;
        s.isPaused = false;
        s.generator = null;
    });

    if (els.auxContainer) { els.auxContainer.classList.add('hidden'); els.auxContainer.classList.remove('flex'); }
    if (els.auxContainer2) { els.auxContainer2.classList.add('hidden'); els.auxContainer2.classList.remove('flex'); }

    updateStats();
    renderBars({}, null, 1);
    if (raceMode) renderBars({}, null, 2);
    setStatus('Idle', 'text-slate-300');
    updateButtonsState();
    updatePseudocode([]);
    els.liveNotes.innerText = 'Waiting to start animation...';
}

function setViewMode(mode) {
    state.viewMode = mode;
    const activeClass = ['bg-cyan-500', 'text-white', 'shadow-md'];
    const inactiveClass = ['bg-transparent', 'text-slate-400'];
    
    if (mode === 'graph') {
        els.viewGraphBtn.classList.add(...activeClass);
        els.viewGraphBtn.classList.remove(...inactiveClass);
        els.viewContainerBtn.classList.add(...inactiveClass);
        els.viewContainerBtn.classList.remove(...activeClass);
        [els.visualizer, els.visualizer2].forEach(v => { v.classList.remove('container-view'); v.classList.add('graph-view'); });
        [els.auxVisualizer, els.auxVisualizer2].forEach(v => { if(v) { v.classList.remove('container-view'); v.classList.add('graph-view'); } });
    } else {
        els.viewContainerBtn.classList.add(...activeClass);
        els.viewContainerBtn.classList.remove(...inactiveClass);
        els.viewGraphBtn.classList.add(...inactiveClass);
        els.viewGraphBtn.classList.remove(...activeClass);
        [els.visualizer, els.visualizer2].forEach(v => { v.classList.remove('graph-view'); v.classList.add('container-view'); });
        [els.auxVisualizer, els.auxVisualizer2].forEach(v => { if(v) { v.classList.remove('graph-view'); v.classList.add('container-view'); } });
    }
    renderBars({}, null, 1);
    if (raceMode) renderBars({}, null, 2);
}

// Rendering
function renderBars(highlights = {}, partitionRange = null, targetId = 1) {
    const currentState = targetId === 1 ? state1 : state2;
    const vis = targetId === 1 ? els.visualizer : els.visualizer2;
    const auxVis = targetId === 1 ? els.auxVisualizer : els.auxVisualizer2;
    const auxCont = targetId === 1 ? els.auxContainer : els.auxContainer2;

    vis.innerHTML = '';
    if (auxVis) auxVis.innerHTML = '';
    
    // Base maxVal on originalArray so heights don't jump during operations
    const maxVal = Math.max(...(currentState.originalArray.length ? currentState.originalArray : currentState.array)) || 1;
    const showLabels = currentState.viewMode === 'container' ? currentState.array.length <= 100 : currentState.array.length <= 40;
    
    if (partitionRange) {
        vis.classList.add('has-partition');
    } else {
        vis.classList.remove('has-partition');
    }
    
    const createDivider = () => {
        const div = document.createElement('div');
        div.className = 'partition-divider';
        return div;
    };
    
    // MAIN ARRAY RENDER
    currentState.array.forEach((val, idx) => {
        if (partitionRange && idx === partitionRange[0] && idx > 0) {
            vis.appendChild(createDivider());
        }

        const card = document.createElement('div');
        card.className = 'bar';
        
        if (partitionRange && idx >= partitionRange[0] && idx <= partitionRange[1]) {
            card.classList.add('in-partition');
            if (idx === partitionRange[0]) card.classList.add('partition-start');
            if (idx === partitionRange[1]) card.classList.add('partition-end');
        }
        
        if (val !== null) {
            if (currentState.viewMode === 'graph') {
                const heightPercent = (val / maxVal) * 100;
                card.style.height = `${Math.max(Math.abs(heightPercent), 12)}%`;
            } else {
                card.style.height = 'auto';
            }
            
            if (showLabels) {
                card.innerText = val;
            }

            if (currentState.sortedIndices.has(idx)) {
                card.classList.add('bar-sorted');
            } else {
                let appliedClass = 'bar-default';
                const priority = ['swapping', 'overwrite', 'pivot', 'comparing'];
                for (const type of priority) {
                    if (highlights[type] && highlights[type].includes(idx)) {
                        appliedClass = `bar-${type}`;
                        break;
                    }
                }
                card.classList.add(appliedClass);
            }
        } else {
            card.classList.add('bar-empty');
            if (currentState.viewMode === 'graph') card.style.height = '12%';
        }
        
        vis.appendChild(card);
        
        // Split Gap Injection
        if (highlights.splitAt !== undefined && idx === highlights.splitAt) {
            const spacer = document.createElement('div');
            spacer.className = 'w-4 sm:w-12 md:w-20 shrink-0 transition-all duration-500';
            vis.appendChild(spacer);
        }
        
        if (partitionRange && idx === partitionRange[1] && idx < currentState.array.length - 1) {
            vis.appendChild(createDivider());
        }
    });

    // AUXILIARY ARRAY RENDER (Merge Sort Buffer)
    if (currentState.auxArray && auxCont && !auxCont.classList.contains('hidden')) {
        currentState.auxArray.forEach((val, idx) => {
            const card = document.createElement('div');
            card.className = 'bar';
            
            if (val !== null) {
                if (currentState.viewMode === 'graph') {
                    const heightPercent = (val / maxVal) * 100;
                    card.style.height = `${Math.max(Math.abs(heightPercent), 12)}%`;
                } else {
                    card.style.height = 'auto';
                }
                if (showLabels) card.innerText = val;
                
                if (highlights.auxOverwrite && highlights.auxOverwrite.includes(idx)) {
                    card.classList.add('bar-overwrite'); // Pink glow for aux writes
                } else if (highlights.auxPivot && highlights.auxPivot.includes(idx)) {
                    card.classList.add('bar-pivot');
                } else {
                    card.classList.add('bar-default');
                }
            } else {
                card.classList.add('bar-empty');
                if (currentState.viewMode === 'graph') card.style.height = '12%';
                
                if (highlights.auxPivot && highlights.auxPivot.includes(idx)) {
                    card.classList.add('border-purple-400', 'shadow-[0_0_10px_rgba(168,85,247,0.5)]');
                }
            }
            
            auxVis.appendChild(card);
        });
    }
}

function updatePseudocode(activeLines = []) {
    if (raceMode) {
        els.pseudocodeContainer.innerHTML = `
            <div class="flex flex-col justify-center h-full gap-4 relative z-10 w-full">
                <div class="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1 w-full shadow-lg">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <h3 class="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Player 1: ${algorithmInfo[state1.algorithm].name}</h3>
                    </div>
                    <p class="text-xs text-white font-medium min-h-[40px] leading-snug">${state1.lastMessage || 'Waiting to start...'}</p>
                </div>
                
                <div class="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1 w-full shadow-lg">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <h3 class="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Player 2: ${algorithmInfo[state2.algorithm].name}</h3>
                    </div>
                    <p class="text-xs text-white font-medium min-h-[40px] leading-snug">${state2.lastMessage || 'Waiting to start...'}</p>
                </div>
            </div>
        `;
        return;
    }
    if (els.pseudocodeContainer.dataset.algo !== state1.algorithm) {
        els.pseudocodeContainer.innerHTML = '';
        els.pseudocodeContainer.dataset.algo = state1.algorithm;
        const code = algorithmInfo[state1.algorithm].pseudocode;
        code.forEach((lineText, idx) => {
            const lineEl = document.createElement('div');
            lineEl.id = `code-line-${idx}`;
            lineEl.className = 'px-3 py-1.5 rounded transition-colors whitespace-pre text-slate-400 border-l-4 border-transparent';
            lineEl.innerText = lineText;
            els.pseudocodeContainer.appendChild(lineEl);
        });
    }
    
    const code = algorithmInfo[state1.algorithm].pseudocode;
    code.forEach((_, idx) => {
        const lineEl = document.getElementById(`code-line-${idx}`);
        if (!lineEl) return;
        
        if (activeLines.includes(idx)) {
            lineEl.classList.remove('text-slate-400', 'border-transparent');
            lineEl.classList.add('bg-gradient-to-r', 'from-cyan-500/20', 'to-blue-500/10', 'text-cyan-100', 'font-semibold', 'border-cyan-400', 'shadow-[inset_0_0_12px_rgba(99,102,241,0.15)]', 'text-glow-cyan');
        } else {
            lineEl.classList.add('text-slate-400', 'border-transparent');
            lineEl.classList.remove('bg-gradient-to-r', 'from-cyan-500/20', 'to-blue-500/10', 'text-cyan-100', 'font-semibold', 'border-cyan-400', 'shadow-[inset_0_0_12px_rgba(99,102,241,0.15)]', 'text-glow-cyan');
        }
    });
}

function updateStats() {
    els.compCount.innerText = state1.comparisons;
    els.swapCount.innerText = state1.swaps;
    if (raceMode) {
        els.compCount2.innerText = state2.comparisons;
        els.swapCount2.innerText = state2.swaps;
    }
}

function setStatus(text, colorClass) {
    els.statusText.innerText = text;
    els.statusText.className = `text-sm font-bold tracking-wide uppercase drop-shadow-md ${colorClass}`;
}

// Algorithms (Generators)
const algorithms = {
    *bubble(arr) {
        let n = arr.length;
        let swapped;
        for (let i = 0; i < n - 1; i++) {
            swapped = false;
            let p = [0, n - 1 - i];
            for (let j = 0; j < n - i - 1; j++) {
                yield { type: 'compare', highlights: { pivot: [j], comparing: [j + 1] }, partition: p, lines: [3], message: `Comparing adjacent elements: ${arr[j]} and ${arr[j+1]}` };
                if (arr[j] > arr[j + 1]) {
                    yield { type: 'swap', highlights: { swapping: [j, j + 1] }, partition: p, lines: [4, 5], message: `${arr[j]} is greater than ${arr[j+1]}, so we swap them` };
                    let temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            yield { type: 'sorted', indices: [n - i - 1], lines: [6], message: `Element ${arr[n - i - 1]} is now in its final sorted position` };
            if (!swapped) {
                for (let k = 0; k < n - i - 1; k++) {
                    yield { type: 'sorted', indices: [k], lines: [6], message: `No swaps occurred, array is fully sorted` };
                }
                break;
            }
        }
        yield { type: 'sorted', indices: [0], lines: [], message: `Element ${arr[0]} is now in its final sorted position` };
    },

    *selection(arr) {
        let n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            let p = [i, n - 1];
            for (let j = i + 1; j < n; j++) {
                yield { type: 'compare', highlights: { pivot: [minIdx], comparing: [j], overwrite: [i] }, partition: p, lines: [3], message: `Checking if ${arr[j]} is smaller than our current minimum (${arr[minIdx]})` };
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                    yield { type: 'compare', highlights: { pivot: [minIdx], comparing: [j], overwrite: [i] }, partition: p, lines: [4], message: `Found new minimum: ${arr[j]}` };
                }
            }
            if (minIdx !== i) {
                yield { type: 'swap', highlights: { swapping: [i, minIdx] }, partition: p, lines: [6], message: `Swapping minimum (${arr[minIdx]}) into the sorted section` };
                let temp = arr[i];
                arr[i] = arr[minIdx];
                arr[minIdx] = temp;
            } else {
                yield { type: 'sorted', indices: [i], lines: [], message: `${arr[i]} is already in the correct position` };
            }
            yield { type: 'sorted', indices: [i], lines: [] };
        }
        yield { type: 'sorted', indices: [n - 1], lines: [], message: `Array is fully sorted` };
    },

    *insertion(arr) {
        let n = arr.length;
        yield { type: 'sorted', indices: [0], lines: [], message: `First element is naturally sorted` };
        for (let i = 1; i < n; i++) {
            let key = arr[i];
            let j = i - 1;
            let p = [0, i];
            
            while (j >= 0) {
                yield { type: 'compare', highlights: { pivot: [j + 1], comparing: [j] }, partition: p, lines: [2], message: `Comparing ${arr[j]} with our key (${key})` };
                if (arr[j] > key) {
                    yield { type: 'overwrite', highlights: { overwrite: [j + 1], swapping: [j] }, partition: p, lines: [3, 4], message: `${arr[j]} is larger than key, shifting it right to make space` };
                    arr[j + 1] = arr[j];
                    j = j - 1;
                } else {
                    break;
                }
            }
            yield { type: 'overwrite', highlights: { pivot: [j + 1] }, partition: p, lines: [5], message: `Inserting key (${key}) into its correct sorted position` };
            arr[j + 1] = key;
            
            for(let k = 0; k <= i; k++) yield { type: 'sorted', indices: [k], lines: [] };
        }
    },

    *merge(arr) {
        // Initialize Out-of-place Array
        state.auxArray = Array(arr.length).fill(null);
        let auxCont = state.id === 1 ? els.auxContainer : els.auxContainer2;
        if (auxCont) {
            auxCont.classList.remove('hidden');
            auxCont.classList.add('flex');
        }

        function* mergeSortHelper(start, end) {
            if (start >= end) return;
            const mid = Math.floor((start + end) / 2);
            
            yield* mergeSortHelper(start, mid);
            yield* mergeSortHelper(mid + 1, end);
            
            let p = [start, end];
            yield { type: 'compare', highlights: { splitAt: mid }, partition: p, lines: [5], message: `Dividing into left array [${start} to ${mid}] and right array [${mid+1} to ${end}]` };

            let L = [];
            for(let x = start; x <= mid; x++) L.push(arr[x]);
            let R = [];
            for(let x = mid+1; x <= end; x++) R.push(arr[x]);
            
            let lIdx = 0, rIdx = 0, k = start;

            while (lIdx < L.length && rIdx < R.length) {
                yield { type: 'compare', highlights: { comparing: [start + lIdx, mid + 1 + rIdx], auxPivot: [k], splitAt: mid }, partition: p, lines: [5], message: `Comparing left element ${L[lIdx]} with right element ${R[rIdx]}` };
                
                if (L[lIdx] <= R[rIdx]) {
                    state.auxArray[k] = L[lIdx];
                    arr[start + lIdx] = null; // Vanish from left side
                    yield { type: 'overwrite', highlights: { auxOverwrite: [k], splitAt: mid }, partition: p, lines: [5], message: `${L[lIdx]} is smaller, moving it down into the sorted array` };
                    lIdx++;
                } else {
                    state.auxArray[k] = R[rIdx];
                    arr[mid + 1 + rIdx] = null; // Vanish from right side
                    yield { type: 'overwrite', highlights: { auxOverwrite: [k], splitAt: mid }, partition: p, lines: [5], message: `${R[rIdx]} is smaller, moving it down into the sorted array` };
                    rIdx++;
                }
                k++;
            }
            
            while (lIdx < L.length) {
                yield { type: 'compare', highlights: { comparing: [start + lIdx], auxPivot: [k], splitAt: mid }, partition: p, lines: [5], message: `Moving remaining left element ${L[lIdx]} down into the sorted array` };
                state.auxArray[k] = L[lIdx];
                arr[start + lIdx] = null;
                yield { type: 'overwrite', highlights: { auxOverwrite: [k], splitAt: mid }, partition: p, lines: [5] };
                lIdx++;
                k++;
            }
            
            while (rIdx < R.length) {
                yield { type: 'compare', highlights: { comparing: [mid + 1 + rIdx], auxPivot: [k], splitAt: mid }, partition: p, lines: [5], message: `Moving remaining right element ${R[rIdx]} down into the sorted array` };
                state.auxArray[k] = R[rIdx];
                arr[mid + 1 + rIdx] = null;
                yield { type: 'overwrite', highlights: { auxOverwrite: [k], splitAt: mid }, partition: p, lines: [5] };
                rIdx++;
                k++;
            }
            
            yield { type: 'compare', highlights: {}, partition: p, lines: [5], message: `Merged! Moving the final sorted array back into the middle` };
            for (let copy = start; copy <= end; copy++) {
                arr[copy] = state.auxArray[copy];
                state.auxArray[copy] = null;
                // No splitAt here, so the gap closes and they snap to the middle!
                yield { type: 'swap', highlights: { swapping: [copy] }, partition: p, lines: [5], message: `Placing ${arr[copy]} in final position` };
            }
        }
        
        yield* mergeSortHelper(0, arr.length - 1);
        
        if (auxCont) {
            auxCont.classList.add('hidden');
            auxCont.classList.remove('flex');
        }
        state.auxArray = null;
        
        for (let i = 0; i < arr.length; i++) yield { type: 'sorted', indices: [i], lines: [], message: `Array is fully sorted` };
    },

    *quick(arr) {
        function* partition(low, high) {
            let pivot = arr[high];
            let i = low - 1;
            let p = [low, high];

            for (let j = low; j <= high - 1; j++) {
                yield { type: 'compare', highlights: { pivot: [high], comparing: [j], overwrite: [i + 1] }, partition: p, lines: [9], message: `Comparing ${arr[j]} with pivot (${pivot})` };
                if (arr[j] < pivot) {
                    i++;
                    if (i !== j) {
                        yield { type: 'swap', highlights: { swapping: [i, j], pivot: [high] }, partition: p, lines: [10], message: `${arr[j]} is less than pivot, moving it to the left side` };
                        let temp = arr[i];
                        arr[i] = arr[j];
                        arr[j] = temp;
                    }
                }
            }
            if (i + 1 !== high) {
                yield { type: 'swap', highlights: { swapping: [i + 1, high] }, partition: p, lines: [11], message: `Placing pivot (${arr[high]}) in its final sorted position` };
                let temp = arr[i + 1];
                arr[i + 1] = arr[high];
                arr[high] = temp;
            }
            yield { type: 'sorted', indices: [i + 1], lines: [12], message: `Pivot ${arr[i+1]} is now sorted` };
            return i + 1;
        }

        function* quickSortHelper(low, high) {
            if (low < high) {
                let pi = yield* partition(low, high);
                yield* quickSortHelper(low, pi - 1);
                yield* quickSortHelper(pi + 1, high);
            } else if (low === high) {
                yield { type: 'sorted', indices: [low], lines: [], message: `Element ${arr[low]} is in correct position` };
            }
        }

        yield* quickSortHelper(0, arr.length - 1);
        for (let i = 0; i < arr.length; i++) yield { type: 'sorted', indices: [i], lines: [], message: `Array is fully sorted` };
    },

    *heap(arr) {
        let n = arr.length;

        function* heapify(n, i) {
            let largest = i;
            let l = 2 * i + 1;
            let r = 2 * i + 2;
            let p = [0, n - 1];

            if (l < n) {
                yield { type: 'compare', highlights: { pivot: [largest], comparing: [l] }, partition: p, lines: [9], message: `Comparing parent node ${arr[largest]} with left child ${arr[l]}` };
                if (arr[l] > arr[largest]) {
                    largest = l;
                    yield { type: 'compare', highlights: { pivot: [largest] }, partition: p, lines: [10], message: `Left child is larger, marking as new max` };
                }
            }
            if (r < n) {
                yield { type: 'compare', highlights: { pivot: [largest], comparing: [r] }, partition: p, lines: [11], message: `Comparing max so far ${arr[largest]} with right child ${arr[r]}` };
                if (arr[r] > arr[largest]) {
                    largest = r;
                    yield { type: 'compare', highlights: { pivot: [largest] }, partition: p, lines: [12], message: `Right child is larger, marking as new max` };
                }
            }

            if (largest !== i) {
                yield { type: 'swap', highlights: { swapping: [i, largest] }, partition: p, lines: [14], message: `Swapping ${arr[i]} and ${arr[largest]} to maintain max-heap property (largest goes up)` };
                let temp = arr[i];
                arr[i] = arr[largest];
                arr[largest] = temp;
                yield* heapify(n, largest);
            }
        }

        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            yield* heapify(n, i);
        }

        for (let i = n - 1; i > 0; i--) {
            let p = [0, i];
            yield { type: 'swap', highlights: { swapping: [0, i] }, partition: p, lines: [4], message: `Extracting max element (${arr[0]}) and moving it to the end of the array` };
            let temp = arr[0];
            arr[0] = arr[i];
            arr[i] = temp;
            
            yield { type: 'sorted', indices: [i], lines: [], message: `Element ${arr[i]} is now sorted` };
            yield* heapify(i, 0);
        }
        yield { type: 'sorted', indices: [0], lines: [], message: `Array is fully sorted` };
    },
    *radix(arr) {
        const n = arr.length;
        if (n === 0) return;
        
        // Find max to know number of digits
        let max_val = arr[0];
        for(let i = 1; i < n; i++) {
            if (arr[i] > max_val) max_val = arr[i];
        }
        
        let exp = 1;
        while (Math.floor(max_val / exp) > 0) {
            
            // counting sort for current digit
            let output = new Array(n).fill(0);
            let count = new Array(10).fill(0);
            
            yield { type: 'compare', highlights: {}, lines: [4, 7, 8], message: `Grouping elements by digit place (10^${Math.log10(exp)})` };
            
            for (let i = 0; i < n; i++) {
                let digit = Math.floor(arr[i] / exp) % 10;
                count[digit]++;
                yield { type: 'compare', highlights: { pivot: [i] }, lines: [9, 10, 11], message: `Element ${arr[i]} has digit ${digit}` };
            }
            
            for (let i = 1; i < 10; i++) {
                count[i] += count[i - 1];
            }
            
            // Build the output array backwards for stability
            for (let i = n - 1; i >= 0; i--) {
                let digit = Math.floor(arr[i] / exp) % 10;
                output[count[digit] - 1] = arr[i];
                count[digit]--;
            }
            
            yield { type: 'compare', highlights: {}, lines: [13, 14, 15], message: `Moving elements back from buckets to array` };
            
            // Overwrite arr with output
            for (let i = 0; i < n; i++) {
                arr[i] = output[i];
                yield { type: 'overwrite', highlights: { overwrite: [i] }, lines: [15], message: `Putting ${arr[i]} into sorted position for current digit` };
            }
            
            exp *= 10;
        }
        
        let allIndices = Array.from({length: n}, (_, i) => i);
        yield { type: 'sorted', indices: allIndices, lines: [], message: `Array is fully sorted` };
    }
};

// Animation Controller
async function executeStep(step, targetId = 1) {
    if (!step) return;
    const currentState = targetId === 1 ? state1 : state2;
    if (step.type === 'compare') {
        currentState.comparisons++;
    } else if (step.type === 'swap' || step.type === 'overwrite') {
        currentState.swaps++;
    }
    
    if (step.type === 'sorted') {
        step.indices.forEach(i => currentState.sortedIndices.add(i));
        renderBars({}, step.partition || null, targetId); 
    } else {
        renderBars(step.highlights || {}, step.partition || null, targetId);
    }
    
    if (step.message) {
        currentState.lastMessage = step.message;
    }
    
    if (targetId === 1) {
        updatePseudocode(step.lines || []);
        
        if (step.message && !raceMode) {
            els.liveNotes.innerText = step.message;
            els.liveNotes.classList.add('text-white');
            setTimeout(() => {
                if (els.liveNotes) els.liveNotes.classList.remove('text-white');
            }, 150);
        }
    } else if (raceMode && targetId === 2) {
        // Trigger update to refresh dual feed
        updatePseudocode([]);
    }
    
    if (raceMode) {
        els.liveNotes.innerText = 'Racing! View live commentary in the right panel ?';
    }

    updateStats();
}

async function runAnimation() {
    state1.isRunning = true;
    if (raceMode) state2.isRunning = true;
    updateButtonsState();
    setStatus(raceMode ? 'Racing...' : 'Sorting...', 'text-slate-300');
    
    if (!state1.generator) {
        state = state1;
        state1.generator = algorithms[state1.algorithm](state1.array);
    }
    if (raceMode && !state2.generator) {
        state = state2;
        state2.generator = algorithms[state2.algorithm](state2.array);
    }

    try {
        while (state1.isRunning || (raceMode && state2.isRunning)) {
            await checkPause();
            if (!state1.isRunning && !state2.isRunning) break;
            
            let p1Done = true;
            let p2Done = true;

            if (state1.isRunning) {
                state = state1;
                const { value: step, done } = state1.generator.next();
                if (done) {
                    state1.isRunning = false;
                } else {
                    p1Done = false;
                    await executeStep(step, 1);
                }
            }

            if (raceMode && state2.isRunning) {
                state = state2;
                const { value: step, done } = state2.generator.next();
                if (done) {
                    state2.isRunning = false;
                } else {
                    p2Done = false;
                    await executeStep(step, 2);
                }
            }
            
            if (p1Done && p2Done) break;

            await delay(getDelay());
        }
        
        if (!state1.isRunning && (!raceMode || !state2.isRunning)) {
            setStatus(raceMode ? 'Race Complete!' : 'Sorting Complete!', 'text-slate-300');
            state1.generator = null;
            state2.generator = null;
            
            state1.array.forEach((_, i) => state1.sortedIndices.add(i));
            renderBars({}, null, 1);
            if (raceMode) {
                state2.array.forEach((_, i) => state2.sortedIndices.add(i));
                renderBars({}, null, 2);
            }
            
            updatePseudocode([]);
            if (!raceMode) els.liveNotes.innerText = 'Sorting complete!';
        }
    } catch (e) {
        console.error("Animation error:", e);
        state1.isRunning = false;
        state2.isRunning = false;
    }
    
    updateButtonsState();
}

// UI Controls
// UI Controls
function updateButtonsState() {
    const running = state1.isRunning || state2.isRunning;
    const paused = state1.isPaused || state2.isPaused;
    els.playBtn.disabled = running && !paused;
    els.pauseBtn.disabled = !running || paused;
    els.stepBtn.disabled = (!paused && running) || raceMode;
    els.sizeSlider.disabled = running && !paused;
    els.newArrayBtn.disabled = running && !paused;
    els.algoSelect.disabled = running && !paused;
    els.algoSelect2.disabled = running && !paused;
    els.viewContainerBtn.disabled = running && !paused;
    els.viewGraphBtn.disabled = running && !paused;
    els.customArrayInput.disabled = running && !paused;
    els.loadCustomBtn.disabled = running && !paused;
    els.raceModeBtn.disabled = running;
}

function changeAlgorithm() {
    state1.algorithm = els.algoSelect.value;
    const info = algorithmInfo[state1.algorithm];
    els.algoName.innerText = raceMode ? 'Algorithm 1 Stats' : info.name;
    els.timeBest.innerText = info.timeBest;
    els.timeAvg.innerText = info.timeAvg;
    els.timeWorst.innerText = info.timeWorst;
    els.algoDesc.innerText = raceMode ? 'Comparison metrics shown above.' : info.description;
    
    if (info.spaceBest && info.spaceWorst && info.spaceBest !== info.spaceWorst) {
        els.spaceSingle.classList.add('hidden');
        els.spaceSingle.classList.remove('flex');
        
        els.spaceMultiBest.classList.remove('hidden');
        els.spaceMultiBest.classList.add('flex');
        els.spaceMultiAvg.classList.remove('hidden');
        els.spaceMultiAvg.classList.add('flex');
        els.spaceMultiWorst.classList.remove('hidden');
        els.spaceMultiWorst.classList.add('flex');
        
        els.spaceBest.innerText = info.spaceBest;
        els.spaceAvg.innerText = info.spaceAvg;
        els.spaceWorst.innerText = info.spaceWorst;
    } else {
        els.spaceSingle.classList.remove('hidden');
        els.spaceSingle.classList.add('flex');
        
        els.spaceMultiBest.classList.add('hidden');
        els.spaceMultiBest.classList.remove('flex');
        els.spaceMultiAvg.classList.add('hidden');
        els.spaceMultiAvg.classList.remove('flex');
        els.spaceMultiWorst.classList.add('hidden');
        els.spaceMultiWorst.classList.remove('flex');
        
        els.spaceComplexity.innerText = info.spaceComplexity || info.spaceBest;
    }
    
    resetArray();
}

function changeAlgorithm2() {
    state2.algorithm = els.algoSelect2.value;
    resetArray();
}

function toggleRaceMode() {
    raceMode = !raceMode;
    if (raceMode) {
        els.raceModeBtn.innerHTML = '🏁 Race Mode: ON';
        els.raceModeBtn.classList.add('bg-white/20', 'border-white/40', 'text-white');
        els.raceContainer2.classList.remove('hidden');
        els.raceContainer2.classList.add('flex');
        els.algoSelect2Wrapper.classList.remove('hidden');
        els.player1Label.classList.remove('hidden');
        els.compCount2.classList.remove('hidden');
        els.swapCount2.classList.remove('hidden');
    } else {
        els.raceModeBtn.innerHTML = '🏎️ Race Mode: OFF';
        els.raceModeBtn.classList.remove('bg-white/20', 'border-white/40', 'text-white');
        els.raceContainer2.classList.add('hidden');
        els.raceContainer2.classList.remove('flex');
        els.algoSelect2Wrapper.classList.add('hidden');
        els.player1Label.classList.add('hidden');
        els.compCount2.classList.add('hidden');
        els.swapCount2.classList.add('hidden');
    }
    changeAlgorithm();
}

// Event Listeners
els.raceModeBtn.addEventListener('click', toggleRaceMode);
els.algoSelect.addEventListener('change', changeAlgorithm);
els.algoSelect2.addEventListener('change', changeAlgorithm2);
els.viewContainerBtn.addEventListener('click', () => setViewMode('container'));
els.viewGraphBtn.addEventListener('click', () => setViewMode('graph'));

els.loadCustomBtn.addEventListener('click', loadCustomArray);
els.customArrayInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadCustomArray();
});

els.playBtn.addEventListener('click', () => {
    if (state1.isPaused || state2.isPaused) {
        state1.isPaused = false;
        state2.isPaused = false;
        if (state1.resolvePause) { state1.resolvePause(); state1.resolvePause = null; }
        if (state2.resolvePause) { state2.resolvePause(); state2.resolvePause = null; }
    } else {
        runAnimation();
    }
    updateButtonsState();
    setStatus(raceMode ? 'Racing...' : 'Sorting...', 'text-slate-300');
});

els.pauseBtn.addEventListener('click', () => {
    state1.isPaused = true;
    state2.isPaused = true;
    updateButtonsState();
    setStatus('Paused', 'text-slate-300');
});

els.stepBtn.addEventListener('click', async () => {
    if (raceMode) return;
    if (!state1.isRunning) {
        state1.isRunning = true;
        state1.isPaused = true;
        state1.generator = algorithms[state1.algorithm](state1.array);
    }
    
    if (state1.generator) {
        const { value: step, done } = state1.generator.next();
        if (!done) {
            await executeStep(step, 1);
            setStatus('Paused (Stepping)', 'text-slate-300');
        } else {
            state1.generator = null;
            state1.isRunning = false;
            state1.isPaused = false;
            state1.array.forEach((_, i) => state1.sortedIndices.add(i));
            renderBars({}, null, 1);
            updatePseudocode([]);
            setStatus('Sorted!', 'text-white');
            els.liveNotes.innerText = 'Sorting complete!';
        }
    }
    updateButtonsState();
});

els.resetBtn.addEventListener('click', () => {
    if (state1.resolvePause) state1.resolvePause();
    if (state2.resolvePause) state2.resolvePause();
    resetArray();
});

els.newArrayBtn.addEventListener('click', () => {
    if (state1.resolvePause) state1.resolvePause();
    if (state2.resolvePause) state2.resolvePause();
    generateArray();
});

if (els.arrayPattern) {
    els.arrayPattern.addEventListener('change', () => {
        if (state1.resolvePause) state1.resolvePause();
        if (state2.resolvePause) state2.resolvePause();
        generateArray();
    });
}

els.sizeSlider.addEventListener('input', () => {
    els.sizeValue.innerText = els.sizeSlider.value;
    generateArray();
});

// Initialize
changeAlgorithm();
changeAlgorithm2();
setViewMode('container');
generateArray();


