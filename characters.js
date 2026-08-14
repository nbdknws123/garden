/* ==================================================
   VƯỜN HOA HỒNG
   GOOGLE SHEET CHARACTER DATABASE
================================================== */


/* ==================================================
   GOOGLE SHEET TSV
================================================== */

const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAytUVKlMRa29kOXMn4Vuf_6SbncyBOB7km-mgFdtZkuQK-1DoSaC9jY-BMmo3nEtgjYXc1s2Akg7h/pub?output=tsv";


/* ==================================================
   DATA
================================================== */

let characters = [];

let currentCategory = "all";


/* ==================================================
   DOM
================================================== */

const grid =
    document.getElementById("characterGrid");

const searchInput =
    document.getElementById("searchInput");

const characterCount =
    document.getElementById("characterCount");

const categoryFilters =
    document.getElementById("categoryFilters");

const modal =
    document.getElementById("characterModal");

const modalContent =
    document.getElementById("modalContent");

const closeModal =
    document.getElementById("closeModal");


/* ==================================================
   LOAD GOOGLE SHEET
================================================== */

async function loadCharacters() {

    try {

        const response =
            await fetch(SHEET_URL);

        if (!response.ok) {

            throw new Error(
                "Không thể kết nối Google Sheet."
            );

        }


        const text =
            await response.text();


        characters =
            parseTSV(text);


        createCategories();

        renderCharacters();


    } catch (error) {

        console.error(error);


        grid.innerHTML = `

            <div class="loading-card error-card">

                <div class="loading-symbol">
                    !
                </div>

                <p>
                    Không thể mở dữ liệu nhân vật.
                </p>

                <small>
                    Hãy kiểm tra lại Google Sheet.
                </small>

            </div>

        `;


        characterCount.textContent =
            "KHÔNG CÓ DỮ LIỆU";

    }

}


/* ==================================================
   PARSE TSV
================================================== */

function parseTSV(text) {

    const rows =
        text
            .trim()
            .split("\n")
            .map(row =>
                row.split("\t")
            );


    if (rows.length < 2) {

        return [];

    }


    const headers =
        rows[0].map(
            header =>
                header
                    .trim()
                    .toLowerCase()
        );


    return rows
        .slice(1)
        .map(row => {

            const character = {};


            headers.forEach(
                (header, index) => {

                    character[header] =
                        (row[index] || "").trim();

                }
            );


            return character;

        })
        .filter(character => {

            return (
                character.name ||
                character["tên"] ||
                character.image ||
                character["ảnh"]
            );

        });

}


/* ==================================================
   GET VALUE
================================================== */

function getValue(
    character,
    ...keys
) {

    for (const key of keys) {

        if (
            character[key] !== undefined &&
            character[key] !== ""
        ) {

            return character[key];

        }

    }


    return "";

}


/* ==================================================
   IMAGE
================================================== */

function getImage(character) {

    return getValue(
        character,
        "image",
        "ảnh",
        "img",
        "avatar",
        "url ảnh",
        "imageurl"
    );

}


/* ==================================================
   NAME
================================================== */

function getName(character) {

    return getValue(
        character,
        "name",
        "tên",
        "character",
        "char"
    ) || "Nhân vật chưa đặt tên";

}


/* ==================================================
   DESCRIPTION
================================================== */

function getDescription(character) {

    return getValue(
        character,
        "description",
        "mô tả",
        "desc",
        "bio",
        "giới thiệu"
    );

}


/* ==================================================
   ROLEPLAY LINK
================================================== */

function getLink(character) {

    return getValue(
        character,
        "link",
        "url",
        "char link",
        "character link",
        "roleplay",
        "roleplay link"
    );

}


/* ==================================================
   TAGS
================================================== */

function getTags(character) {

    const value =
        getValue(
            character,
            "tags",
            "tag",
            "thể loại",
            "category",
            "categories"
        );


    if (!value) {

        return [];

    }


    return value
        .split(",")
        .map(
            tag =>
                tag.trim()
        )
        .filter(Boolean);

}


/* ==================================================
   CREATE CATEGORIES
================================================== */

function createCategories() {

    const allTags =
        new Set();


    characters.forEach(
        character => {

            getTags(character)
                .forEach(
                    tag => {

                        allTags.add(tag);

                    }
                );

        }
    );


    categoryFilters.innerHTML = `

        <button
            class="category-button active"
            data-category="all"
        >
            TẤT CẢ
        </button>

    `;


    allTags.forEach(
        tag => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category-button";


            button.dataset.category =
                tag;


            button.textContent =
                tag.toUpperCase();


            categoryFilters
                .appendChild(button);

        }
    );


    categoryFilters
        .querySelectorAll(
            ".category-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        categoryFilters
                            .querySelectorAll(
                                ".category-button"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        currentCategory =
                            button.dataset.category;


                        renderCharacters();

                    }
                );

            }
        );

}


/* ==================================================
   FILTER
================================================== */

function getFilteredCharacters() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    return characters.filter(
        character => {

            const name =
                getName(character)
                    .toLowerCase();


            const description =
                getDescription(character)
                    .toLowerCase();


            const tags =
                getTags(character)
                    .join(" ")
                    .toLowerCase();


            const matchesSearch =
                !keyword ||
                name.includes(keyword) ||
                description.includes(keyword) ||
                tags.includes(keyword);


            const matchesCategory =
                currentCategory === "all" ||
                getTags(character)
                    .some(
                        tag =>
                            tag.toLowerCase() ===
                            currentCategory.toLowerCase()
                    );


            return (
                matchesSearch &&
                matchesCategory
            );

        }
    );

}


/* ==================================================
   RENDER
================================================== */

function renderCharacters() {

    const filtered =
        getFilteredCharacters();


    characterCount.textContent =
        `${filtered.length} NHÂN VẬT`;


    if (filtered.length === 0) {

        grid.innerHTML = `

            <div class="loading-card">

                <div class="loading-symbol">
                    ♢
                </div>

                <p>
                    Chưa tìm thấy đóa hồng này.
                </p>

            </div>

        `;

        return;

    }


    grid.innerHTML = "";


    filtered.forEach(
        character => {

            const card =
                createCharacterCard(
                    character
                );


            grid.appendChild(card);

        }
    );

}


/* ==================================================
   CREATE CHARACTER CARD
================================================== */

function createCharacterCard(character) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "character-card";


    const image =
        getImage(character);


    const name =
        getName(character);


    const description =
        getDescription(character);


    const tags =
        getTags(character);


    const link =
        getLink(character);


    card.innerHTML = `

        <div class="character-image">

            ${
                image
                    ? `
                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            loading="lazy"
                        >
                    `
                    : `
                        <div class="no-image">
                            ✦
                        </div>
                    `
            }

            <div class="image-overlay"></div>

        </div>


        <div class="character-info">

            <div class="character-tags">

                ${
                    tags
                        .slice(0, 3)
                        .map(
                            tag =>
                                `<span>${escapeHTML(tag)}</span>`
                        )
                        .join("")
                }

            </div>


            <h2>
                ${escapeHTML(name)}
            </h2>


            ${
                description
                    ? `
                        <p>
                            ${escapeHTML(
                                description
                            )}
                        </p>
                    `
                    : ""
            }


            <button
                class="character-open"
                type="button"
            >
                XEM NHÂN VẬT
                <span>→</span>
            </button>

        </div>

    `;


    const openButton =
        card.querySelector(
            ".character-open"
        );


    /* ==================================================
       BUTTON ACTION
    ================================================== */

    openButton.addEventListener(
        "click",
        () => {

            /*
             * Nếu char có link:
             * mở trang roleplay.
             */

            if (link) {

                window.open(
                    link,
                    "_blank",
                    "noopener,noreferrer"
                );

                return;

            }


            /*
             * Nếu char chưa có link:
             * vẫn mở modal như cũ.
             */

            openCharacter(
                character
            );

        }
    );


    return card;

}


/* ==================================================
   MODAL
================================================== */

function openCharacter(character) {

    const image =
        getImage(character);


    const name =
        getName(character);


    const description =
        getDescription(character);


    const tags =
        getTags(character);


    const link =
        getLink(character);


    modalContent.innerHTML = `

        ${
            image
                ? `
                    <img
                        class="modal-image"
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(name)}"
                    >
                `
                : ""
        }


        <div class="modal-text">

            <div class="character-tags">

                ${
                    tags
                        .map(
                            tag =>
                                `<span>${escapeHTML(tag)}</span>`
                        )
                        .join("")
                }

            </div>


            <h2>
                ${escapeHTML(name)}
            </h2>


            <div class="modal-description">

                ${
                    description
                        ? escapeHTML(
                            description
                        )
                        : "Chưa có mô tả."
                }

            </div>


            ${
                link
                    ? `
                        <div
                            style="
                                margin-top: 30px;
                            "
                        >

                            <a
                                href="${escapeHTML(link)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="character-open"
                                style="
                                    display: inline-flex;
                                    align-items: center;
                                    gap: 8px;
                                    text-decoration: none;
                                "
                            >
                                DẠO CÙNG NHÂN VẬT
                                <span>→</span>
                            </a>

                        </div>
                    `
                    : ""
            }

        </div>

    `;


    modal.classList.add("show");


    document.body.style.overflow =
        "hidden";

}


/* ==================================================
   CLOSE MODAL
================================================== */

function closeCharacterModal() {

    modal.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}


closeModal.addEventListener(
    "click",
    closeCharacterModal
);


modal
    .querySelector(
        ".modal-overlay"
    )
    .addEventListener(
        "click",
        closeCharacterModal
    );


/* ==================================================
   SEARCH
================================================== */

searchInput.addEventListener(
    "input",
    renderCharacters
);


/* ==================================================
   ESCAPE HTML
================================================== */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==================================================
   START
================================================== */

loadCharacters();
