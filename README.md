# 📊 Sorting Visualizer

## 🧠 Overview  
**Sorting Visualizer** is an interactive web application that demonstrates how different sorting algorithms work through visual animation.  
It provides a dark-themed interface with adjustable array size and sorting speed, making it easy to understand how elements move during sorting.

---

## 🚀 Features  
- 🎨 Interactive bar-style visualization  
- ⚙️ Adjustable array size and animation speed  
- 💡 Color-coded comparisons and swaps 
- 🧩 Responsive and clean user interface  
- 🔁 Multiple sorting algorithms supported  
- 📝 Custom array input supported for user-provided values

---

## 🧮 Supported Algorithms
- 🫧 Bubble Sort  
- 🧩 Selection Sort  
- 🧱 Insertion Sort  
- ⚡ Quick Sort  
- 🌀 Merge Sort  

---

## 🛠️ Tech Stack  
| Technology | Purpose |
|-------------|----------|
| **HTML5** | Structure and layout |
| **CSS3** | Styling and animations |
| **JavaScript (ES6)** | Sorting logic and interactivity |

---

## 🖥️ Preview  
The visualizer displays an array of bars whose heights represent numerical values.  
Users can control the **size** of the array and the **speed** of the visualization using sliders.  
Each sorting algorithm animates step-by-step how the array gets sorted.

---

## 🧩 Project Structure
- `frontend/` — user interface files: `index.html`, CSS, and sorting scripts
- `backend/` — server code and Node dependencies
- `database/` — MongoDB setup details and configuration notes

## 🧩 How to Run Locally
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Sorting-Visualizer.git
   ```
2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```
3. **Start a MongoDB server**
   - Locally: `mongod --dbpath <path>`
   - Or provide a hosted connection string via `MONGO_URI`
4. **Start the backend**
   ```bash
   MONGO_URI="mongodb://127.0.0.1:27017" npm start
   ```
5. **Open the dashboard**
   Visit `http://localhost:3000`

---

## 🗄️ Database Support
This version uses MongoDB to store history for completed sort tasks. Each saved session records algorithm, array size, speed, duration, time complexity, space complexity, and timestamp.
