const url = '../docs/Diplomski_rad_-_Birtic_Dominik.pdf';

let pdfDoc = null,
    pageNum = 1, // default number
    pageIsRendering = false, // will be true if page is rendering
    pageNumIsPending = null; // if we are fetching more pages

const scale = 1.5,
    canvas = document.querySelector("#pdf-render");
    ctx = canvas.getContext("2d");

// Render the page
const renderPage = (num) => {
    pageIsRendering = true; // page is being rendered

    // Get page
    pdfDoc.getPage(num).then((page) => {
        // Set scale
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport
        }

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;

            if(pageNumIsPending !== null){
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // Output current page
        document.querySelector("#page-num").textContent = num;
    });
};

// Check for pages rendering
const queueRenderPage = num => {
    if(pageIsRendering){
        pageNumIsPending = num;
    } else{
        renderPage(num);
    }
};

// Show Previous Page
const showPrevPage = () =>{
    if(pageNum <= 1){
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

// Show Next Page
const showNextPage = () =>{
    if(pageNum >= pdfDoc.numPages){
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

// Get Document
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    //console.log(pdfDoc);

    document.querySelector("#page-count").textContent = pdfDoc.numPages;

    renderPage(pageNum);
})
    .catch(err => {
        const div = document.createElement('div');
        div.className = 'error';
        div.appendChild(document.createTextNode(err.message));
        document.querySelector('body').insertBefore(div, canvas);

        // remove top bar
        document.querySelector('.top-bar').style.display = 'none';
    });

// Button Event
document.querySelector("#prev-page").addEventListener('click', showPrevPage);
document.querySelector("#next-page").addEventListener('click', showNextPage);