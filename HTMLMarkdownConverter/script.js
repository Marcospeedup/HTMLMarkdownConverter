const userInput = document.getElementById("markdown-input");
const htmlOutput = document.getElementById("html-output");
const htmlPreview = document.getElementById("preview");
const themeToggle = document.getElementById("theme-toggle");
const copyBtn = document.getElementById("copy-btn");
const charCount = document.querySelector(".char-count");

// Themes to Toggle
const initTheme = () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️ Light Mode";
    }
};

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Copy text to Clipboard
copyBtn.addEventListener("click", () => {
    const text = htmlOutput.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "✅ Copied!";
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
});

// Character input Count
userInput.addEventListener("input", () => {
    charCount.textContent = `${userInput.value.length} characters`;
});

// regex for strong text
const strongPattern = /\*{2}.+?\*{2}|_{2}.+?_{2}/g;
const strongPatternText = /(?<=\*{2}|_{2}).+?(?=\*{2}|_{2})/g;

// regex for italic text
const italicPattern = /(?<!\*)\*(?!\*).+?(?<!\*)\*(?!\*)|(?<!_)_(?!_).+?(?<!_)_(?!_)/g;
const italicPatternText = /(?<=\*|_).+?(?=\*|_)/g;

// receiving user input as string and returns string with strongs converted to HTML
const strongsConverter = (input) => {
    let outputArr = [];
    let inputArr = input.split("\n");
    inputArr.forEach((line) => {
        if (strongPattern.test(line)) {
            let newLine = line.replace(strongPattern, (match) => {
                let strongText = match.slice(2, -2);
                return `<strong>${strongText}</strong>`;
            });
            outputArr.push(newLine);
        } else {
            outputArr.push(line);
        }
    });
    let outputStr = outputArr.join("\n");
    return outputStr;
};

const italicsConverter = (input) => {
    let outputArr = [];
    let inputArr = input.split("\n");
    inputArr.forEach((line) => {
        if (italicPattern.test(line)) {
            let newLine = line.replace(italicPattern, (match) => {
                let italicText = match.slice(1, -1);
                return `<em>${italicText}</em>`;
            });
            outputArr.push(newLine);
        } else {
            outputArr.push(line);
        }
    });
    let outputStr = outputArr.join("\n");
    return outputStr;
};

const convertMarkdown = () => {
    let originalInput = userInput.value;
    let inputStrongs = strongsConverter(originalInput);
    let inputItalics = italicsConverter(inputStrongs);
    let input = inputItalics.split("\n");
    let outputArr = [];
    
    input.forEach((line) => {
        if (line == "") {
            outputArr.push("");
        } else if (line.match(/^\s?#{1,3}\s.+$/g)) {
            // Headers
            let headerLevelNum = line.match(/^#+/)[0].length;
            let capturedHeaderText = line.match(/(?<=^\s?#{1,3}\s).+$/g);
            outputArr.push(`<h${headerLevelNum}>${capturedHeaderText}</h${headerLevelNum}>`);
        } else if (line.match(/^\s?>\s.+$/g)) {
            // Blockquotes
            let capturedQuote = line.match(/(?<=^\s?>\s).+$/g);
            outputArr.push(`<blockquote>${capturedQuote}</blockquote>`);
        } else if (line.match(/!\[.+\]\(.+\)/g)) {
            // Images
            let capturedImgText = line.match(/(?<=!\[)[^\]]+/g);
            let capturedImgSrc = line.match(/(?<=\()[^\)]+/g);
            outputArr.push(`<img src="${capturedImgSrc}" alt="${capturedImgText}">`);
        } else if (line.match(/\[.+\]\(.+\)/g)) {
            // Links
            let capturedLinkText = line.match(/(?<=\[)[^\]]+/g);
            let capturedLinkUrl = line.match(/(?<=\()[^\)]+/g);
            outputArr.push(`<a href="${capturedLinkUrl}">${capturedLinkText}</a>`);
        } else {
            outputArr.push(line);
        }
    });
    
    return outputArr.join("\n");
};

// event listener
userInput.addEventListener('input', () => {
    let output = convertMarkdown();
    htmlOutput.innerText = output;
    htmlPreview.innerHTML = output;
});

// Initialize theme on page load
initTheme();