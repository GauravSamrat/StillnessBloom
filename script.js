 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Set Firebase debug level
        setLogLevel('debug');

        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);

        let userId = null;

        // Authentication State Listener
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                userId = user.uid;
                document.getElementById('user-info').textContent = `User ID: ${userId}`;
                await initializeFirestore();
            } else {
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Firebase auth error:", error);
                    document.getElementById('user-info').textContent = 'Authentication failed. Please try again.';
                }
            }
        });

        // Firestore Initialization and Data Loading
        async function initializeFirestore() {
            try {
                // Products data
                const productsCollectionRef = collection(db, "artifacts", appId, "public/data/products");
                onSnapshot(productsCollectionRef, (querySnapshot) => {
                    const productsContainer = document.getElementById('product-grid');
                    productsContainer.innerHTML = ''; // Clear existing products
                    if (querySnapshot.empty) {
                        // If no products exist, add some initial data
                        const initialProducts = [
                            { name: 'Aroma Diffuser', price: 49.99, imageUrl: 'https://placehold.co/400x300/a7f3d0/374151?text=Diffuser', description: 'Enhance your meditation space with calming scents.' },
                            { name: 'Meditation Journal', price: 24.99, imageUrl: 'https://placehold.co/400x300/fecaca/374151?text=Journal', description: 'A beautiful journal to record your thoughts and insights.' },
                            { name: 'Crystal Set', price: 39.99, imageUrl: 'https://placehold.co/400x300/d1d5db/374151?text=Crystals', description: 'Carefully selected crystals to amplify your practice.' }
                        ];
                        initialProducts.forEach(async (product) => {
                            await addDoc(productsCollectionRef, product);
                        });
                        return;
                    }
                    querySnapshot.forEach((doc) => {
                        const product = doc.data();
                        const productCard = document.createElement('div');
                        productCard.className = 'bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-transform transform hover:scale-105';
                        productCard.innerHTML = `
                            <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-40 object-cover rounded-md mb-4">
                            <h3 class="text-xl font-semibold mb-2">${product.name}</h3>
                            <p class="text-gray-600 mb-4">${product.description}</p>
                            <span class="text-2xl font-bold text-teal-600 mb-4">$${product.price.toFixed(2)}</span>
                            <button data-product-id="${doc.id}" data-product-name="${product.name}" class="add-to-cart-btn bg-purple-600 text-white font-bold py-2 px-6 rounded-full transition-all hover:bg-purple-700">Add to Cart</button>
                        `;
                        productsContainer.appendChild(productCard);
                    });
                    attachBuyButtonListeners();
                });
            } catch (error) {
                console.error("Error with Firestore:", error);
                document.getElementById('product-grid').innerHTML = '<p class="text-red-500">Failed to load products. Please check the console for errors.</p>';
            }
        }
        
        function attachBuyButtonListeners() {
            const buyButtons = document.querySelectorAll('.add-to-cart-btn');
            buyButtons.forEach(button => {
                button.addEventListener('click', async (e) => {
                    if (!userId) {
                        showModal('Please wait for authentication to complete before adding items to your cart.');
                        return;
                    }

                    const productId = e.target.dataset.productId;
                    const productName = e.target.dataset.productName;
                    
                    const userCartRef = collection(db, "artifacts", appId, "users", userId, "cart");
                    try {
                        await addDoc(userCartRef, {
                            productId: productId,
                            productName: productName,
                            purchasedAt: new Date(),
                            status: "pending"
                        });
                        showModal(`"${productName}" added to your cart!`);
                    } catch (error) {
                        console.error("Error adding to cart:", error);
                        showModal("Failed to add item to cart. Please try again.");
                    }
                });
            });
        }

        function showModal(message) {
            const modal = document.getElementById('modal');
            const modalMessage = document.getElementById('modal-message');
            modalMessage.textContent = message;
            modal.classList.remove('hidden');
        }

        window.closeModal = function() {
            const modal = document.getElementById('modal');
            modal.classList.add('hidden');
        }