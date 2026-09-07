/**
 * AlgoLearn BST & AVL Tree Visualizer Engine
 * Dynamic SVG node rendering, balancing rotations, traversals, and search path animations.
 */

class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
        this.height = 1;
        this.x = 0;
        this.y = 0;
    }
}

const TreeVisualizer = {
    root: null,
    mode: 'bst', // 'bst' | 'avl'
    isAnimating: false,

    init() {
        this.bindEvents();
        this.generateRandomTree(7);
    },

    bindEvents() {
        const insertBtn = document.getElementById('btn-tree-insert');
        const searchBtn = document.getElementById('btn-tree-search');
        const deleteBtn = document.getElementById('btn-tree-delete');
        const valInput = document.getElementById('tree-node-val');
        const bstRadio = document.getElementById('mode-bst');
        const avlRadio = document.getElementById('mode-avl');

        if (insertBtn) {
            insertBtn.addEventListener('click', () => {
                const val = parseInt(valInput.value, 10);
                if (!isNaN(val)) {
                    this.insert(val);
                    valInput.value = '';
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const val = parseInt(valInput.value, 10);
                if (!isNaN(val)) {
                    this.search(val);
                }
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                const val = parseInt(valInput.value, 10);
                if (!isNaN(val)) {
                    this.delete(val);
                    valInput.value = '';
                }
            });
        }

        if (valInput) {
            valInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (insertBtn) insertBtn.click();
                }
            });
        }

        if (bstRadio) {
            bstRadio.addEventListener('change', () => {
                this.mode = 'bst';
                this.logStatus('Switched to Standard Binary Search Tree (BST) mode.');
            });
        }

        if (avlRadio) {
            avlRadio.addEventListener('change', () => {
                this.mode = 'avl';
                this.rebuildAsAVL();
                this.logStatus('Switched to Balanced AVL Tree mode (auto-rotations enabled).');
            });
        }
    },

    getHeight(node) {
        return node ? node.height : 0;
    },

    getBalance(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    },

    rightRotate(y) {
        const x = y.left;
        const T2 = x.right;
        x.right = y;
        y.left = T2;
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
        this.logStatus(`Performed Right Rotation (RR) on node ${y.val} around ${x.val}`);
        return x;
    },

    leftRotate(x) {
        const y = x.right;
        const T2 = y.left;
        y.left = x;
        x.right = T2;
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
        this.logStatus(`Performed Left Rotation (LL) on node ${x.val} around ${y.val}`);
        return y;
    },

    insert(val) {
        if (this.mode === 'avl') {
            this.root = this.insertAVL(this.root, val);
        } else {
            this.root = this.insertBST(this.root, val);
        }
        this.render();
        if (window.AlgoAudio) window.AlgoAudio.playTone(300 + (val % 400), 0.08, 'triangle');
        this.logStatus(`Inserted node ${val} into ${this.mode.toUpperCase()}`);
    },

    insertBST(node, val) {
        if (!node) return new TreeNode(val);
        if (val < node.val) node.left = this.insertBST(node.left, val);
        else if (val > node.val) node.right = this.insertBST(node.right, val);
        node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
        return node;
    },

    insertAVL(node, val) {
        if (!node) return new TreeNode(val);
        if (val < node.val) node.left = this.insertAVL(node.left, val);
        else if (val > node.val) node.right = this.insertAVL(node.right, val);
        else return node; // No duplicates

        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
        const balance = this.getBalance(node);

        // Left Left Case
        if (balance > 1 && val < node.left.val) return this.rightRotate(node);
        // Right Right Case
        if (balance < -1 && val > node.right.val) return this.leftRotate(node);
        // Left Right Case
        if (balance > 1 && val > node.left.val) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }
        // Right Left Case
        if (balance < -1 && val < node.right.val) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    },

    delete(val) {
        if (this.mode === 'avl') {
            this.root = this.deleteAVL(this.root, val);
        } else {
            this.root = this.deleteBST(this.root, val);
        }
        this.render();
        this.logStatus(`Deleted node ${val} from tree.`);
    },

    minValueNode(node) {
        let current = node;
        while (current.left !== null) current = current.left;
        return current;
    },

    deleteBST(node, val) {
        if (!node) return node;
        if (val < node.val) node.left = this.deleteBST(node.left, val);
        else if (val > node.val) node.right = this.deleteBST(node.right, val);
        else {
            if (!node.left) return node.right;
            else if (!node.right) return node.left;
            const temp = this.minValueNode(node.right);
            node.val = temp.val;
            node.right = this.deleteBST(node.right, temp.val);
        }
        node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
        return node;
    },

    deleteAVL(node, val) {
        if (!node) return node;
        if (val < node.val) node.left = this.deleteAVL(node.left, val);
        else if (val > node.val) node.right = this.deleteAVL(node.right, val);
        else {
            if (!node.left || !node.right) {
                const temp = node.left ? node.left : node.right;
                if (!temp) node = null;
                else node = temp;
            } else {
                const temp = this.minValueNode(node.right);
                node.val = temp.val;
                node.right = this.deleteAVL(node.right, temp.val);
            }
        }
        if (!node) return node;

        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
        const balance = this.getBalance(node);

        if (balance > 1 && this.getBalance(node.left) >= 0) return this.rightRotate(node);
        if (balance > 1 && this.getBalance(node.left) < 0) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }
        if (balance < -1 && this.getBalance(node.right) <= 0) return this.leftRotate(node);
        if (balance < -1 && this.getBalance(node.right) > 0) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }
        return node;
    },

    async search(val) {
        if (!this.root || this.isAnimating) return;
        this.isAnimating = true;
        this.logStatus(`Searching for node ${val}...`);

        let curr = this.root;
        let found = false;

        while (curr) {
            const circle = document.getElementById(`tree-node-${curr.val}`);
            if (circle) circle.classList.add('active');
            if (window.AlgoAudio) window.AlgoAudio.playTone(350 + (curr.val % 300), 0.07);

            await new Promise(r => setTimeout(r, 450));

            if (curr.val === val) {
                found = true;
                if (circle) {
                    circle.classList.remove('active');
                    circle.classList.add('found');
                }
                if (window.AlgoAudio) window.AlgoAudio.playTone(680, 0.15, 'triangle');
                this.logStatus(`Node ${val} FOUND in the tree! 🎯`);
                break;
            } else if (val < curr.val) {
                if (circle) circle.classList.remove('active');
                curr = curr.left;
            } else {
                if (circle) circle.classList.remove('active');
                curr = curr.right;
            }
        }

        if (!found) {
            this.logStatus(`Node ${val} NOT found in the tree.`);
        }

        setTimeout(() => {
            this.render();
            this.isAnimating = false;
        }, 1500);
    },

    async traverse(type) {
        if (!this.root || this.isAnimating) return;
        this.isAnimating = true;

        const path = [];
        if (type === 'inorder') {
            const inOrder = (n) => {
                if (!n) return;
                inOrder(n.left);
                path.push(n.val);
                inOrder(n.right);
            };
            inOrder(this.root);
        } else if (type === 'preorder') {
            const preOrder = (n) => {
                if (!n) return;
                path.push(n.val);
                preOrder(n.left);
                preOrder(n.right);
            };
            preOrder(this.root);
        } else if (type === 'postorder') {
            const postOrder = (n) => {
                if (!n) return;
                postOrder(n.left);
                postOrder(n.right);
                path.push(n.val);
            };
            postOrder(this.root);
        } else if (type === 'levelorder') {
            const queue = [this.root];
            while (queue.length) {
                const n = queue.shift();
                path.push(n.val);
                if (n.left) queue.push(n.left);
                if (n.right) queue.push(n.right);
            }
        }

        const out = document.getElementById('tree-traversal-output');
        if (out) {
            out.classList.remove('d-none');
            out.innerHTML = `Traversal (${type.toUpperCase()}): [ <span id="traversal-seq"></span> ]`;
        }

        const seqEl = document.getElementById('traversal-seq');

        for (let i = 0; i < path.length; i++) {
            const v = path[i];
            const circle = document.getElementById(`tree-node-${v}`);
            if (circle) circle.classList.add('active');
            if (seqEl) {
                seqEl.textContent = path.slice(0, i + 1).join(' → ');
            }
            if (window.AlgoAudio) window.AlgoAudio.playTone(300 + (i * 45), 0.08);

            await new Promise(r => setTimeout(r, 400));
            if (circle) circle.classList.remove('active');
        }

        this.logStatus(`Completed ${type.toUpperCase()} traversal: ${path.join(', ')}`);
        this.isAnimating = false;
    },

    clear() {
        this.root = null;
        this.render();
        this.logStatus('Tree cleared.');
    },

    generateRandomTree(count = 7) {
        this.clear();
        const vals = [50, 30, 70, 20, 40, 60, 80, 15, 25, 65, 85].slice(0, count);
        vals.forEach(v => this.insert(v));
    },

    rebuildAsAVL() {
        const vals = [];
        const inOrder = (n) => {
            if (!n) return;
            inOrder(n.left);
            vals.push(n.val);
            inOrder(n.right);
        };
        inOrder(this.root);
        this.root = null;
        vals.forEach(v => {
            this.root = this.insertAVL(this.root, v);
        });
        this.render();
    },

    countNodes(node) {
        if (!node) return 0;
        return 1 + this.countNodes(node.left) + this.countNodes(node.right);
    },

    logStatus(msg) {
        const log = document.getElementById('tree-status-log');
        if (log) log.textContent = msg;
    },

    render() {
        const svg = document.getElementById('tree-svg');
        const nodesCountEl = document.getElementById('tree-nodes-count');
        const heightEl = document.getElementById('tree-height-count');
        if (!svg) return;

        svg.innerHTML = '';
        if (!this.root) {
            if (nodesCountEl) nodesCountEl.textContent = 'Nodes: 0';
            if (heightEl) heightEl.textContent = 'Height: 0';
            return;
        }

        const totalNodes = this.countNodes(this.root);
        const height = this.getHeight(this.root);
        if (nodesCountEl) nodesCountEl.textContent = `Nodes: ${totalNodes}`;
        if (heightEl) heightEl.textContent = `Height: ${height}`;

        const width = 800;
        const initialY = 50;
        const levelHeight = 75;

        // Position nodes recursively
        const assignPositions = (node, depth, leftBound, rightBound) => {
            if (!node) return;
            node.x = (leftBound + rightBound) / 2;
            node.y = initialY + depth * levelHeight;
            assignPositions(node.left, depth + 1, leftBound, node.x);
            assignPositions(node.right, depth + 1, node.x, rightBound);
        };

        assignPositions(this.root, 0, 20, width - 20);

        // Draw edges
        const drawEdges = (node) => {
            if (!node) return;
            if (node.left) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', node.x);
                line.setAttribute('y1', node.y);
                line.setAttribute('x2', node.left.x);
                line.setAttribute('y2', node.left.y);
                line.setAttribute('class', 'tree-edge-line');
                svg.appendChild(line);
                drawEdges(node.left);
            }
            if (node.right) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', node.x);
                line.setAttribute('y1', node.y);
                line.setAttribute('x2', node.right.x);
                line.setAttribute('y2', node.right.y);
                line.setAttribute('class', 'tree-edge-line');
                svg.appendChild(line);
                drawEdges(node.right);
            }
        };

        drawEdges(this.root);

        // Draw nodes
        const drawNodes = (node) => {
            if (!node) return;

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', 18);
            circle.setAttribute('class', 'tree-node-circle');
            circle.setAttribute('id', `tree-node-${node.val}`);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y);
            text.setAttribute('class', 'tree-node-text');
            text.textContent = node.val;

            g.appendChild(circle);
            g.appendChild(text);
            svg.appendChild(g);

            drawNodes(node.left);
            drawNodes(node.right);
        };

        drawNodes(this.root);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    TreeVisualizer.init();
});

if (typeof window !== 'undefined') {
    window.TreeVisualizer = TreeVisualizer;
}
