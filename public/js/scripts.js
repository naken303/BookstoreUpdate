function addToCart(bookId) {
    fetch(`/cart/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId: bookId }),
    })
    .then(response => response.json())
    .then(data => {
        // อัปเดตจำนวนในตะกร้า
        document.getElementById('cart-count').innerText = data.cartCount;
    })
    .catch(error => {
        console.error('Error adding to cart:', error);
    });
}

async function searchBooks(params) {
    const query = document.getElementById('search-input').value; // ดึงค่าจาก input

    // หากไม่มีคำค้นให้ซ่อนผลการค้นหาและแสดงรายการหนังสือทั้งหมด
    if (!query) {
        document.getElementById('results-container').style.display = 'block';
        document.getElementById('result').style.display = 'none'; // แสดงรายการหนังสือทั้งหมด
        return;
    } else {
        document.getElementById('results-container').style.display = 'none';
    }

    // ซ่อนรายการหนังสือทั้งหมด
    document.querySelector('.book-lists').style.display = 'none';

    await fetch(`/book/search?q=${encodeURIComponent(query)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // แสดงผลลัพธ์การค้นหา
            const resultsContainer = document.getElementById('result');
            resultsContainer.innerHTML = ''; // เคลียร์ผลการค้นหาเก่า

            const sectionElement = document.createElement('section');
            sectionElement.className = 'book-lists';

            const containerElement = document.createElement('div');
            containerElement.className = 'container';

            sectionElement.appendChild(containerElement)

            const headingTextDiv = document.createElement('div');
            headingTextDiv.className = 'heading-text';

            const heading = document.createElement('h2');
            heading.textContent = `Search by: ${query}`;

            headingTextDiv.appendChild(heading);

            containerElement.appendChild(headingTextDiv);

            const books = document.createElement('div');
            books.className = 'books';

            data.forEach(book => {
                const bookElement = document.createElement('div');
                bookElement.className = 'book-card';
                
                bookElement.innerHTML = `
                    <a href="/book/${book._id}"><img src="/images/books_cover/${book.imageUrl}" alt="Book cover" class="book-cover" onerror="this.onerror=null;this.src='/images/books_cover/default_cover.jpg';"></a>
                    <div class="book-info">
                        <div class="text-info">
                            <p class="book-title-card">${book.title}</p>
                            <p class="book-availability">คงเหลือ ${book.qty} เล่ม</p>
                            <p class="book-price">${book.price} บาท</p>
                        </div>
                        ${book.qty > 0 ? 
                            `<button class="add-to-cart-btn" onclick="addToCart('${book.id}')">Add to Cart</button>` : 
                            `<button class="add-to-cart-btn disable" disabled>Out of stock</button>`
                        }
                    </div>
                `;
                books.appendChild(bookElement)
            });
            containerElement.appendChild(books)

            resultsContainer.appendChild(sectionElement);

            // แสดงผลลัพธ์การค้นหา
            document.getElementById('result').style.display = 'block';
        })
        .catch(error => {
            console.error('Error searching books:', error);
        });
}