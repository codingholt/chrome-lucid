// L U  C   I    D
// Daniel Eden wrote this code
// He also happened to write this ode
// To focus, clarity, rest, and joy
// Which, I hope, you find in this toy

// Define global funcs
function updateStore(storeKey, data) {
  let obj = {}
  obj[storeKey] = JSON.stringify(data)
  chrome.storage.sync.set(obj)
}

function readStore(storeKey, cb) {
  chrome.storage.sync.get(storeKey, result => {
    let d = null

    if (result[storeKey]) d = JSON.parse(result[storeKey])

    // Make sure we got an object back, run callback
    if (typeof d === "object") cb(d)
  })
}



// Set up constants
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const words = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eightteen",
  "nineteen",
  "twenty",
  "twenty one",
  "twenty two",
  "twenty three",
  "twenty four",
  "twenty five",
  "twenty six",
  "twenty seven",
  "twenty eight",
  "twenty nine"
];

const key = "chrome-lucid_RYwSZZKkLd4!CNX4K&8VKs7@4#f!cx"



// Set up the store for our data
// We want to track the notepad's contents and whether or not the human's current
// location is in darkness.
let defaultData = {
  notepadContent: "",
}

// >= v0.0.3 uses an object to store notepad content
// >= v1.1.2 uses chrome sync to store notepad content
// provide a fallback for older versions
readStore(key, d => {
  let data

  // Check if we got data from the chrome sync storage, if so, no fallback is needed
  if (d) {
    data = d
  } else {
    // Get the local storage
    local = localStorage.getItem(key)

    // Check if we got local storage data
    if (local) {
      // Try parsing the local storage data as JSON.
      // If it succeeds, we had an object in local storage
      try {
        data = JSON.parse(local)
        updateStore(key, local)
      } catch (e) {
        // If it fails to parse, we had the notepad content in local storage
        data = defaultData
        data.notepadContent = localStorage.getItem(key)
        updateStore(key, data)
      }

      // Delete the local storage
      localStorage.removeItem(key)
    }

    // If we couldn't get data from anywhere, set to default data
    if (!data) {
      data = defaultData
    }
  }

  start(data)
})

function listenerUpdate() {
  readStore(key, d => {
    document.querySelector(".notepad").innerHTML = d.notepadContent
  })
}



function start(data) {
  let now = new Date()
  let hours = now.getHours()
  let minutes = now.getMinutes()

  function timeInWords(hours, minutes) {
    return !minutes
      ? `${words[hours]} o' clock`
      : `${
          !(minutes % 30)
            ? "half"
            : !(minutes % 15)
            ? "quarter"
            : `${minutes <= 30 ? words[minutes] : words[60 - minutes]} ${`minute${
                minutes > 1 ? "s" : ""
              }`}`
        } ${minutes <= 30 ? "past" : "to"} ${words[minutes <= 30 ? hours : hours + 1]}`;

  }
  
  function formatHours(hours) {
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return hours;
  }
  // Greet the human
  let timeString = `${weekdays[now.getDay()]}, ${
    months[now.getMonth()]
  } ${now.getDate()}`
  let broadTime =
    now.getHours() < 12
      ? "morning"
      : now.getHours() > 17
      ? "evening"
      : "afternoon"

  let textTime  = timeInWords(formatHours(hours), minutes)

  let g = document.querySelector(".greeting")
  g.innerHTML = `Good ${broadTime}. It is ${timeString + ', '  + textTime}.`


  // Set up the notepad
  let notepad = document.querySelector(".notepad")
  notepad.innerHTML = data["notepadContent"]

  notepad.addEventListener("input", e => {
    if (notepad !== document.activeElement || !windowIsActive) return

    let obj = Object.assign(data, {
      notepadContent: notepad.value,
    })

    updateStore(key, obj)
  })

  // Allow updating content between tabs
  let windowIsActive

  let storeListener = setInterval(listenerUpdate, 1000)

  window.onfocus = function() {
    windowIsActive = true
  }

  window.onblur = function() {
    windowIsActive = false
    if (storeListener) {
      clearInterval(storeListener)
    }
    storeListener = setInterval(listenerUpdate, 1000)
  }

  notepad.addEventListener("blur", e => {
    if (storeListener) {
      clearInterval(storeListener)
    }
    storeListener = setInterval(listenerUpdate, 1000)
  })

  notepad.addEventListener("focus", e => {
    if (storeListener) {
      clearInterval(storeListener)
    }
  })

  window.addEventListener("mousewheel", scrollCapture)

  function scrollCapture(e) {
    if (e.target !== notepad) notepad.scrollTop += e.deltaY
  }
}

function search(){
  const searchQuery = googleSearch.value
  window.open(`https://www.google.com/search?q=${searchQuery}`,"_self")
}
const googleSearch  = document.getElementById('googleSearch');

googleSearch.addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.key === 'Enter') {
    search()
  }
});

