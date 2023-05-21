const API_KEY = "<ENTER YOU API KEY>"
const CX_ID = "<ENTER YOU CX ID>";
const searchButton = document.querySelector(".search__button");
const input = document.querySelector(".search__input");
const search = searchHandler();

// event listeners
searchButton.addEventListener("click", renderResults);
input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        renderResults();
    }
});

// function definitions
function searchHandler() {
    let nextPage = 0;
    let prevPage = 0;
    return async function search(searchQuery, btnType) {
        try {
            const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&q=${searchQuery}&siteSearch=youtube.com&filter=video&start=${btnType === "next" ? nextPage : btnType === "prev" ? prevPage : 0}&num=10`);
            const data = await response.json();
            nextPage = data?.queries?.nextPage?.[0]?.startIndex ?? 0;
            prevPage = data?.queries?.previousPage?.[0]?.startIndex ?? 0;
            return data;
        } catch (err) {
            console.log("Error: ", err)
        }
    }
}

async function renderResults(btnType = 0) {
    const input = document.querySelector(".search__input");
    const resultsContainer = document.querySelector(".results");
    const searchResults = await search(input.value.trim(), btnType);
    const googleSearchButtonContainer = document.querySelector(".google-search");
    const buttons = document.querySelector(".buttons");

    resultsContainer.innerHTML = "";
    buttons.innerHTML = "";

    searchResults?.items?.forEach((result) => {
        resultsContainer.innerHTML += `
        <div class="result-card" onclick="videoClickHandler(this)" data-url=${result?.pagemap?.videoobject?.[0]?.url} data-embed-url=${result?.pagemap?.videoobject?.[0]?.embedurl}>
            <div class="result-card__image-section">
                <img class="result-card__image" src=${result?.pagemap?.videoobject?.[0]?.thumbnailurl ?? "assets/default_thumbnail.svg"} alt=""/>
                <span class="result-card__duration"></span>
            </div>
            <div class="result-card__info">
                <h2 class="result-card__title">${titleShortener(result.title)}</h2>
                <p class="result-card__channel">${result?.pagemap?.person?.[0]?.name ?? "Channel Name"}</p>
                <div class="result-card__source-info">
                    <span class="result-card__source">Youtube.com</span>
                    <span class="result-card__views">${convertToInternationalSystem(result?.pagemap?.videoobject?.[0]?.interactioncount)}</span>
                </div>
            </div>
        </div>`;
    })

    if (btnType || btnType === "prev") {
        buttons.innerHTML += `
        <button onclick="prev()" class="prev">
             <img src="assets/icons/arrow_backward.svg" alt="previous"/>
             <span>Prev</span>
        </button>
        <button onclick="next()" class="next">
             <span>Next</span>
             <img src="assets/icons/arrow_forward.svg" alt="next"/>
        </button>
        `;
        googleSearchButtonContainer.innerHTML = `
        <button class="search-on-google">
            <img src="assets/icons/search.svg" alt="search">
            Search on Google
        </button>
        `;
    } else {
        buttons.innerHTML += `
        <button onclick="next()" class="next">
             <span>Next</span>
             <img src="assets/icons/arrow_forward.svg" alt="next"/>
        </button>
        `;
        googleSearchButtonContainer.innerHTML = `
        <a href=${"https://www.google.com/search?q=" + input.value.trim()} target="_blank" class="search-on-google">
            <img src="assets/icons/search.svg" alt="search">
            Search <strong>${input.value.trim()}</strong> on Google
        </a>
        `;
    }
}

function titleShortener(value) {
    const sanitizedTitle = value.trim();

    if (sanitizedTitle.length > 46) {
        const title = sanitizedTitle.slice(0, 46);
        return title + "...";
    } else {
        return sanitizedTitle;
    }
}

function convertToInternationalSystem(val) {
    if(Math.abs(Number(val)) >= 1.0e+9){
        return (Math.abs(Number(val)) / 1.0e+9).toFixed(0) + "B";
    }

    if(Math.abs(Number(val)) >= 1.0e+6){
        return (Math.abs(Number(val)) / 1.0e+6).toFixed(0) + "M";
    }

    if(Math.abs(Number(val)) >= 1.0e+3){
        return  (Math.abs(Number(val)) / 1.0e+3).toFixed(0) + "K";
    }

    return Math.abs(Number(val));
}

function next() {
    renderResults("next");
}

function prev() {
    renderResults("prev");
}


function videoClickHandler(e) {
    const videoUrl = e.getAttribute("data-url");
    const videoEmbedUrl = e.getAttribute("data-embed-url");
    const modal = document.querySelector(".modal");
    const modalVideo = document.querySelector(".modal__video");
    const visitButton = document.querySelector(".visit");

    modalVideo.setAttribute("src", videoEmbedUrl);
    visitButton.setAttribute("href", videoUrl);
    modal.classList.remove("hide");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const modal = document.querySelector(".modal");
    modal.classList.add("hide");
    document.body.style.overflow = "auto";
}