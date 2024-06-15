document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pdfForm');
    const pdfFileInput = document.getElementById('pdfFile');
    const spinner = document.getElementById('spinner');
    const message = document.getElementById('message');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Show spinner while processing
        spinner.style.display = 'block';

        const pdfFile = pdfFileInput.files[0];
        if (!pdfFile) {
            showMessage('Please select a PDF file.', 'error');
            return;
        }

        try {
            const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(pdfFile));
            const pdfDocument = await loadingTask.promise;

            const imageDataURLs = [];

            for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
                const page = await pdfDocument.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.0 });

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                await page.render(renderContext).promise;

                const imageDataURL = canvas.toDataURL('image/jpeg');
                imageDataURLs.push(imageDataURL);
            }

            const formData = new FormData();
            imageDataURLs.forEach((imageDataURL, index) => {
                const blob = dataURItoBlob(imageDataURL);
                formData.append('image', blob, `page${index + 1}.jpeg`);
            });

            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showMessage('PDF converted and all images uploaded successfully.', 'success');
            } else {
                showMessage('Failed to upload images.', 'error');
            }

        } catch (error) {
            console.error('Error converting PDF:', error);
            showMessage('Error converting PDF.', 'error');
        } finally {
            spinner.style.display = 'none';
        }
    });

    function showMessage(msg, type) {
        message.textContent = msg;
        message.className = type; // Set class for styling
    }

    function dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
        }

        return new Blob([arrayBuffer], { type: mimeString });
    }
});
