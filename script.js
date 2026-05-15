const { createApp } = Vue;

createApp({
    data() {
        return {
            library: typeof PHOTO_LIBRARY !== 'undefined' ? PHOTO_LIBRARY : [],
            currentUser: localStorage.getItem('user'),
            userFavorites: [],
            showAuth: false,
            isLogin: true,
            showOnlyFavorites: false,
            selectedItem: null,
            showDetail: false,

            // !!The image is searched by AI!!
            currentSlide: 0,
            carouselTimer: null,
            carouselSlides: [
                { image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000', title: 'Architecture Design', desc: 'Exploring minimalist urban structures.' },
                { image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000', title: 'Nature Exploration', desc: 'Deep diving into the misty mountain peaks.' },
                { image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000', title: 'Art Inspiration', desc: 'Creative abstract oil paintings and modern art.' },
                { image: 'https://picsum.photos/id/13/1000/450', title: 'Travel Adventure', desc: 'Capturing the golden sunset.' },
                { image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000', title: 'Fashion Style', desc: 'The latest trends in sustainable high fashion.' }
            ],

            // Phase 2: Form Validation !!AI-generated code!!
            authForm: { username: '', password: '' },
            authErrors: { username: false, password: false },

            guideItems: [
                { title: "How to Favorite?", content: "Click the heart icon on any image card or the 'Save' button in detail view." },
                { title: "Supported Formats", content: "We support high-resolution JPG/PNG images and MP4 video previews." },
                { title: "Account Security", content: "Ensure your password is at least 6 characters long for better security." },
                { title: "Copyright Notice", content: "All media content is for academic and demonstration purposes only." },
                { title: "Contact Us", content: "Reach out to Group S(Song)team via the feedback form for any inquiries." },
                { title: "Version Info", content: "Waterfall Gallery - Phase 4 (Stable Build 2026)." }
            ]
        }
    },
    // !!AI-generated code!!
    computed: {
        filteredLibrary() {
            if (this.showOnlyFavorites) {
                return this.library.filter(item => this.userFavorites.includes(item.id));
            }
            return this.library;
        }
    },
    methods: {
        // Carousel Logic
        startCarousel() {
            if (this.carouselTimer) clearInterval(this.carouselTimer);
            this.carouselTimer = setInterval(() => { this.nextSlide(); }, 3000);
        },
        pauseCarousel() { clearInterval(this.carouselTimer); },
        nextSlide() { this.currentSlide = (this.currentSlide + 1) % this.carouselSlides.length; },
        prevSlide() { this.currentSlide = (this.currentSlide - 1 + this.carouselSlides.length) % this.carouselSlides.length; },

        // Form Validation
        clearError(field) { this.authErrors[field] = false; },

        // if/else
        validateForm() {
            let isValid = true;
            if (!this.authForm.username.trim()) { this.authErrors.username = true; isValid = false; }
            if (!this.authForm.password.trim()) { this.authErrors.password = true; isValid = false; }
            return isValid;
        },

        //(Fetch/Async/Await) !!AI-generated code!!
        async handleAuth() {
            if (!this.validateForm()) {
                alert("Please fill in all required fields.");
                return;
            }

            const endpoint = this.isLogin ? 'login' : 'register';
            try {
                const res = await fetch(`http://localhost:3000/api/${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.authForm)
                });
                const data = await res.json();
                
                if (res.ok) {
                    if (this.isLogin) {
                        this.currentUser = data.username;
                        this.userFavorites = data.favorites || [];
                        localStorage.setItem('user', data.username);
                        this.showAuth = false;
                        this.authForm = { username: '', password: '' };
                    } else {
                        alert("Registration successful! Please login.");
                        this.isLogin = true;
                    }
                } else {
                    alert(data.message || "Operation failed");
                }
            } catch (err) {
                console.error("Auth Error:", err);
                alert("Server connection failed. Make sure Backend is running.");
            }
        },

        async toggleFavorite(itemId) {
            if (!this.currentUser) {
                alert("Please login first.");
                this.showAuth = true;
                return;
            }
            try {
                const res = await fetch('http://localhost:3000/api/favorites/toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: this.currentUser, itemId: itemId })
                });
                if (res.ok) {
                    const data = await res.json();
                    this.userFavorites = data.favorites;
                }
            } catch (err) { console.error("Favorite failed", err); }
        },

        // UI Controls - Fixed
        openDetail(item) {
            this.selectedItem = item;
            this.showDetail = true;
            document.body.style.overflow = 'hidden'; 
        },
        closeDetail() {
            this.showDetail = false;
            this.selectedItem = null;
            document.body.style.overflow = 'auto'; 
        },
        toggleViewMode() {
            if (!this.currentUser) { this.showAuth = true; return; }
            this.showOnlyFavorites = !this.showOnlyFavorites;
        },
        logout() {
            localStorage.removeItem('user');
            this.currentUser = null;
            this.userFavorites = [];
            this.showOnlyFavorites = false;
            document.body.style.overflow = 'auto';
            alert("Logged out successfully");
            location.reload(); 
        }
    },

    mounted() {
        if (this.currentUser) {
            fetch(`http://localhost:3000/api/favorites/${this.currentUser}`)
                .then(res => res.json())
                .then(data => this.userFavorites = data)
                .catch(() => console.log("Init load favorites failed"));
        }
        // Lifecycle Hooks
        this.startCarousel();
    }
}).mount('#app');
