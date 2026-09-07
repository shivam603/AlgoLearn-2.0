/**
 * AlgoLearn Linear Data Structures Sandbox Engine
 * Linked List (Singly & Doubly), Stack (LIFO), Queue (FIFO), and Hash Table (Chaining).
 */

const DataStructuresVisualizer = {
    // Linked List State
    linkedList: [15, 32, 64, 89],
    isDoubly: false,

    // Stack State
    stack: [10, 25, 50],

    // Queue State
    queue: [12, 24, 36, 48],

    // Hash Table State (7 buckets)
    hashTable: [[], [], [], [], [], [], []],

    init() {
        this.bindEvents();
        this.renderLinkedList();
        this.renderStack();
        this.renderQueue();
        this.renderHashTable();
    },

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.ds-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ds-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const target = btn.getAttribute('data-target');
                document.querySelectorAll('.ds-section-block').forEach(sec => sec.classList.add('d-none'));
                document.getElementById(`ds-section-${target}`)?.classList.remove('d-none');
            });
        });

        const singlyRadio = document.getElementById('ll-singly');
        const doublyRadio = document.getElementById('ll-doubly');

        if (singlyRadio) {
            singlyRadio.addEventListener('change', () => {
                this.isDoubly = false;
                this.renderLinkedList();
            });
        }

        if (doublyRadio) {
            doublyRadio.addEventListener('change', () => {
                this.isDoubly = true;
                this.renderLinkedList();
            });
        }
    },

    // ==========================================
    // Linked List Methods
    // ==========================================
    renderLinkedList(highlightIdx = -1) {
        const container = document.getElementById('ll-canvas-container');
        if (!container) return;
        container.innerHTML = '';

        if (!this.linkedList.length) {
            container.innerHTML = '<div class="text-muted text-center w-100 py-4">Linked List is empty. Insert a node to begin.</div>';
            return;
        }

        // Head pointer badge
        const headBadge = document.createElement('div');
        headBadge.className = 'badge bg-primary me-2';
        headBadge.textContent = 'HEAD';
        container.appendChild(headBadge);

        this.linkedList.forEach((val, idx) => {
            const nodeWrap = document.createElement('div');
            nodeWrap.className = 'd-flex align-items-center gap-1';

            const nodeBox = document.createElement('div');
            nodeBox.className = `ds-ll-node ${idx === highlightIdx ? 'ds-node-active' : ''}`;
            nodeBox.innerHTML = `
                <span class="ds-node-val">${val}</span>
                <span class="ds-node-ptr">${this.isDoubly ? 'prev|next' : 'next'}</span>
            `;

            nodeWrap.appendChild(nodeBox);

            if (idx < this.linkedList.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'ds-ll-arrow';
                arrow.innerHTML = this.isDoubly ? '⇄' : '➔';
                nodeWrap.appendChild(arrow);
            } else {
                const nullBadge = document.createElement('div');
                nullBadge.className = 'badge bg-secondary ms-1';
                nullBadge.textContent = 'NULL';
                nodeWrap.appendChild(nullBadge);
            }

            container.appendChild(nodeWrap);
        });

        document.getElementById('ds-metric-count').textContent = `Nodes: ${this.linkedList.length}`;
    },

    insertLLHead() {
        const val = parseInt(document.getElementById('ll-node-val')?.value || '10', 10);
        this.linkedList.unshift(val);
        this.renderLinkedList(0);
        if (window.AlgoAudio) window.AlgoAudio.playTone(450, 0.08, 'triangle');
        if (window.VoiceNarrator) window.VoiceNarrator.speak(`Inserted node ${val} at the head of the list.`);
    },

    insertLLTail() {
        const val = parseInt(document.getElementById('ll-node-val')?.value || '99', 10);
        this.linkedList.push(val);
        this.renderLinkedList(this.linkedList.length - 1);
        if (window.AlgoAudio) window.AlgoAudio.playTone(520, 0.08, 'triangle');
        if (window.VoiceNarrator) window.VoiceNarrator.speak(`Appended node ${val} at the tail of the list.`);
    },

    insertLLIndex() {
        const val = parseInt(document.getElementById('ll-node-val')?.value || '50', 10);
        const idx = parseInt(document.getElementById('ll-node-idx')?.value || '0', 10);
        const clampedIdx = Math.max(0, Math.min(this.linkedList.length, idx));

        this.linkedList.splice(clampedIdx, 0, val);
        this.renderLinkedList(clampedIdx);
        if (window.AlgoAudio) window.AlgoAudio.playTone(480, 0.08, 'triangle');
    },

    deleteLLHead() {
        if (!this.linkedList.length) return;
        const removed = this.linkedList.shift();
        this.renderLinkedList();
        if (window.AlgoAudio) window.AlgoAudio.playTone(220, 0.08, 'sawtooth');
        if (window.VoiceNarrator) window.VoiceNarrator.speak(`Deleted head node ${removed}.`);
    },

    deleteLLTail() {
        if (!this.linkedList.length) return;
        const removed = this.linkedList.pop();
        this.renderLinkedList();
        if (window.AlgoAudio) window.AlgoAudio.playTone(200, 0.08, 'sawtooth');
        if (window.VoiceNarrator) window.VoiceNarrator.speak(`Deleted tail node ${removed}.`);
    },

    async traverseLL() {
        for (let i = 0; i < this.linkedList.length; i++) {
            this.renderLinkedList(i);
            if (window.AlgoAudio) window.AlgoAudio.playTone(320 + (i * 40), 0.06, 'sine');
            await new Promise(r => setTimeout(r, 350));
        }
        this.renderLinkedList(-1);
    },

    clearLL() {
        this.linkedList = [];
        this.renderLinkedList();
    },

    // ==========================================
    // Stack Methods
    // ==========================================
    renderStack() {
        const bucket = document.getElementById('stack-bucket');
        const status = document.getElementById('stack-status');
        if (!bucket) return;
        bucket.innerHTML = '';

        if (!this.stack.length) {
            if (status) status.textContent = 'Stack is empty (Underflow on Pop).';
            return;
        }

        this.stack.forEach((val, idx) => {
            const item = document.createElement('div');
            item.className = 'stack-item-box';
            item.innerHTML = `<strong>${val}</strong> ${idx === this.stack.length - 1 ? '<span class="badge bg-danger ms-2">TOP</span>' : ''}`;
            bucket.appendChild(item);
        });

        if (status) status.textContent = `Stack depth: ${this.stack.length} elements (Top = ${this.stack[this.stack.length - 1]}).`;
    },

    pushStack() {
        const val = parseInt(document.getElementById('stack-val-input')?.value || Math.floor(Math.random() * 90 + 10), 10);
        if (this.stack.length >= 7) {
            alert('Stack overflow simulation (Max 7 elements).');
            return;
        }
        this.stack.push(val);
        this.renderStack();
        if (window.AlgoAudio) window.AlgoAudio.playTone(400 + (this.stack.length * 50), 0.08, 'sine');
        if (window.VoiceNarrator) window.VoiceNarrator.speak(`Pushed ${val} onto top of the stack.`);
    },

    popStack() {
        if (!this.stack.length) {
            if (window.VoiceNarrator) window.VoiceNarrator.speak('Stack underflow! Cannot pop from an empty stack.');
            return;
        }
        const popped = this.stack.pop();
        this.renderStack();
        if (window.AlgoAudio) window.AlgoAudio.playTone(220, 0.08, 'sawtooth');
        if (window.VoiceNarrator) window.VoiceNarrator.speak(`Popped ${popped} from the stack.`);
    },

    peekStack() {
        if (!this.stack.length) return;
        const top = this.stack[this.stack.length - 1];
        alert(`Stack Top element is: ${top}`);
    },

    // ==========================================
    // Queue Methods
    // ==========================================
    renderQueue() {
        const line = document.getElementById('queue-line');
        const status = document.getElementById('queue-status');
        if (!line) return;
        line.innerHTML = '';

        if (!this.queue.length) {
            if (status) status.textContent = 'Queue is empty (Underflow on Dequeue).';
            return;
        }

        this.queue.forEach((val, idx) => {
            const item = document.createElement('div');
            item.className = 'queue-item-box';
            let tag = '';
            if (idx === 0) tag = '<span class="badge bg-success ms-1">FRONT</span>';
            if (idx === this.queue.length - 1) tag += '<span class="badge bg-warning text-dark ms-1">REAR</span>';

            item.innerHTML = `<strong>${val}</strong> ${tag}`;
            line.appendChild(item);
        });

        if (status) status.textContent = `Queue size: ${this.queue.length} elements. Front = ${this.queue[0]}, Rear = ${this.queue[this.queue.length - 1]}.`;
    },

    enqueueQueue() {
        const val = parseInt(document.getElementById('queue-val-input')?.value || Math.floor(Math.random() * 90 + 10), 10);
        if (this.queue.length >= 8) {
            alert('Queue capacity full (Max 8 elements).');
            return;
        }
        this.queue.push(val);
        this.renderQueue();
        if (window.AlgoAudio) window.AlgoAudio.playTone(450, 0.08, 'triangle');
        if (window.VoiceNarrator) window.VoiceNarrator.speak(`Enqueued ${val} at the rear.`);
    },

    dequeueQueue() {
        if (!this.queue.length) return;
        const removed = this.queue.shift();
        this.renderQueue();
        if (window.AlgoAudio) window.AlgoAudio.playTone(240, 0.08, 'sawtooth');
        if (window.VoiceNarrator) window.VoiceNarrator.speak(`Dequeued ${removed} from the front.`);
    },

    peekQueue() {
        if (!this.queue.length) return;
        alert(`Queue Front element is: ${this.queue[0]}`);
    },

    // ==========================================
    // Hash Table (Chaining) Methods
    // ==========================================
    renderHashTable() {
        const container = document.getElementById('ht-buckets-container');
        if (!container) return;
        container.innerHTML = '';

        for (let i = 0; i < 7; i++) {
            const row = document.createElement('div');
            row.className = 'd-flex align-items-center gap-2 p-2 bg-white rounded border border-sky shadow-sm';

            const bucketBadge = document.createElement('div');
            bucketBadge.className = 'badge bg-sky-900 px-3 py-2';
            bucketBadge.textContent = `Bucket [${i}]`;

            const chainContainer = document.createElement('div');
            chainContainer.className = 'd-flex flex-wrap align-items-center gap-2 flex-grow-1';

            const chain = this.hashTable[i] || [];
            if (!chain.length) {
                chainContainer.innerHTML = '<span class="text-muted-custom small fst-italic">Empty bucket</span>';
            } else {
                chain.forEach((key, idx) => {
                    const node = document.createElement('div');
                    node.className = 'ds-ll-node py-1 px-2';
                    node.style.minWidth = '50px';
                    node.innerHTML = `<strong>${key}</strong>`;
                    chainContainer.appendChild(node);

                    if (idx < chain.length - 1) {
                        const arr = document.createElement('span');
                        arr.className = 'text-primary fw-bold';
                        arr.textContent = '➔';
                        chainContainer.appendChild(arr);
                    }
                });
            }

            row.appendChild(bucketBadge);
            row.appendChild(chainContainer);
            container.appendChild(row);
        }
    },

    insertHashTable() {
        const key = parseInt(document.getElementById('ht-key-input')?.value || Math.floor(Math.random() * 90 + 10), 10);
        const bucketIdx = key % 7;
        this.hashTable[bucketIdx].push(key);
        this.renderHashTable();

        if (window.AlgoAudio) window.AlgoAudio.playTone(350 + (bucketIdx * 50), 0.08, 'sine');
        if (window.VoiceNarrator) window.VoiceNarrator.speak(`Key ${key} mapped to bucket ${bucketIdx} via hash modulo 7.`);
    },

    searchHashTable() {
        const key = parseInt(document.getElementById('ht-key-input')?.value, 10);
        if (isNaN(key)) return;
        const bucketIdx = key % 7;
        const exists = this.hashTable[bucketIdx].includes(key);

        if (exists) {
            alert(`🎯 Key ${key} FOUND in Bucket [${bucketIdx}]!`);
            if (window.AlgoAudio) window.AlgoAudio.playTone(650, 0.15, 'triangle');
        } else {
            alert(`Key ${key} not present in Bucket [${bucketIdx}].`);
        }
    },

    clearHashTable() {
        this.hashTable = [[], [], [], [], [], [], []];
        this.renderHashTable();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    DataStructuresVisualizer.init();
});

if (typeof window !== 'undefined') {
    window.DataStructuresVisualizer = DataStructuresVisualizer;
}
