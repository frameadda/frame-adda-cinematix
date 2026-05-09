// script.js
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Sticky Navbar & Shrink Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- 2. Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- 3. Scroll Reveal Animations (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Unobserve to keep them visible once animated in
                observer.unobserve(entry.target);
            }
        });
    };

    const revealOptions = {
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    
    revealElements.forEach(el => revealObserver.observe(el));

    // --- 3. Minimal Creative Photo Lab Background (Three.js) ---
    const canvas = document.getElementById('canvas-bg');
    
    if (typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x030403, 0.04); 
        
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 25;

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // --- Generate Polaroid Frame Texture via Canvas ---
        const createPolaroidTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 256; 
            canvas.height = 320;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fillRect(0, 0, 256, 320);
            ctx.clearRect(16, 16, 256 - 32, 320 - 16 - 64);
            
            return new THREE.CanvasTexture(canvas);
        };
        const frameTexture = createPolaroidTexture();

        // --- Create Floating Frames ---
        const framesGroup = new THREE.Group();
        const frameCount = 12; // Reduced from 20 for performance
        
        const frameMat = new THREE.MeshStandardMaterial({
            map: frameTexture,
            transparent: true,
            side: THREE.DoubleSide,
            roughness: 0.2,
            metalness: 0.4
        });
        
        const frameGeo = new THREE.PlaneGeometry(3, 3.75);
        const frames = [];

        for(let i=0; i<frameCount; i++) {
            const frame = new THREE.Mesh(frameGeo, frameMat);
            frame.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30 - 5);
            frame.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * 0.5);
            frame.userData = {
                rotSpeedX: (Math.random() - 0.5) * 0.005,
                rotSpeedY: (Math.random() - 0.5) * 0.005,
                rotSpeedZ: (Math.random() - 0.5) * 0.002,
                driftX: (Math.random() - 0.5) * 0.02,
                driftY: (Math.random() - 0.5) * 0.02,
            };
            framesGroup.add(frame);
            frames.push(frame);
        }
        scene.add(framesGroup);

        // --- Micro Studio Dust ---
        const dustGeo = new THREE.BufferGeometry();
        const dustCount = 150;
        const dustPos = new Float32Array(dustCount * 3);
        for(let i = 0; i < dustCount * 3; i++) {
            dustPos[i] = (Math.random() - 0.5) * 60;
        }
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        const dustMat = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xA8E6CF, /* Mint Green Dust */
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        const dustSystem = new THREE.Points(dustGeo, dustMat);
        scene.add(dustSystem);

        // --- Creative Studio Lighting (Dynamic) ---
        scene.add(new THREE.AmbientLight(0xffffff, 0.3));
        
        const studioLight1 = new THREE.PointLight(0xA8E6CF, 2, 50);
        studioLight1.position.set(10, 20, 10);
        scene.add(studioLight1);
        
        const studioLight2 = new THREE.PointLight(0xFFFFFF, 1.5, 60);
        studioLight2.position.set(-15, -10, 5);
        scene.add(studioLight2);

        // --- Live Animation: Camera Flash ---
        const paparazziFlash = new THREE.PointLight(0xffffff, 0, 100);
        paparazziFlash.position.set(0, 5, 5);
        scene.add(paparazziFlash);

        // --- 3D Studio Element: Camera Lens Aperture Ring ---
        const ringGeo = new THREE.TorusGeometry(15, 0.05, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: 0xA8E6CF, 
            transparent: true, 
            opacity: 0.15,
            wireframe: true
        });
        const lensRing = new THREE.Mesh(ringGeo, ringMat);
        lensRing.position.z = -10;
        scene.add(lensRing);
        
        const ringGeo2 = new THREE.TorusGeometry(10, 0.02, 16, 100);
        const lensRing2 = new THREE.Mesh(ringGeo2, ringMat);
        lensRing2.position.z = -5;
        scene.add(lensRing2);

        // --- Smooth Mouse Parallax ---
        let targetX = 0;
        let targetY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            targetX = (event.clientX - windowHalfX) * 0.002;
            targetY = (event.clientY - windowHalfY) * 0.002;
        });

        function animate() {
            try {
                requestAnimationFrame(animate);

                // Drift frames
                frames.forEach(frame => {
                    frame.rotation.x += frame.userData.rotSpeedX;
                    frame.rotation.y += frame.userData.rotSpeedY;
                    frame.rotation.z += frame.userData.rotSpeedZ;
                    frame.position.x += frame.userData.driftX;
                    frame.position.y += frame.userData.driftY;
                    
                    if(frame.position.x > 30) frame.position.x = -30;
                    if(frame.position.x < -30) frame.position.x = 30;
                    if(frame.position.y > 25) frame.position.y = -25;
                    if(frame.position.y < -25) frame.position.y = 25;
                });

                dustSystem.rotation.y += 0.0005;
                dustSystem.rotation.x += 0.0002;

                camera.position.x += (targetX * 5 - camera.position.x) * 0.02;
                camera.position.y += (-targetY * 5 - camera.position.y) * 0.02;
                camera.lookAt(0, 0, 0);

                if (paparazziFlash.intensity > 0) {
                    paparazziFlash.intensity -= 1.5;
                }
                if (Math.random() > 0.995 && paparazziFlash.intensity <= 0) {
                    paparazziFlash.intensity = 30 + Math.random() * 20;
                    paparazziFlash.position.set(
                        (Math.random() - 0.5) * 30,
                        (Math.random() - 0.5) * 30,
                        (Math.random() - 0.5) * 20
                    );
                }

                const time = Date.now() * 0.0005;
                studioLight1.position.x = Math.sin(time * 0.7) * 20;
                studioLight1.position.y = Math.cos(time * 0.5) * 20;
                studioLight2.position.x = Math.cos(time * 0.3) * 25;
                studioLight2.position.y = Math.sin(time * 0.6) * 25;

                lensRing.rotation.z += 0.001;
                lensRing.scale.x = 1 + Math.sin(time * 0.5) * 0.05;
                lensRing.scale.y = 1 + Math.sin(time * 0.5) * 0.05;
                lensRing2.rotation.z -= 0.002;

                renderer.render(scene, camera);
            } catch (e) {
                console.error("ThreeJS Animation Error:", e);
            }
        }
        animate();
        
        // Handle Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    } else {
        console.warn('Three.js not loaded');
    }

    // --- 4. Interactive Logo Spin ---
    const logos = document.querySelectorAll('.brand-logo-anim');
    logos.forEach(logo => {
        logo.addEventListener('click', (e) => {
            // Toggle the fast spinning animation class
            logo.classList.toggle('spinning');
            
            // Prevent the link from jumping to the top of the page if they just wanted to spin it
            e.preventDefault();
        });
    });

    // --- 5. Video Gallery Modal Logic ---
    const filmCards = document.querySelectorAll('.film-card');
    const videoModal = document.getElementById('videoModal');
    const videoModalOverlay = document.getElementById('videoModalOverlay');
    const closeVideoModalBtn = document.getElementById('closeVideoModal');
    const modalVideoPlayer = document.getElementById('modalVideoPlayer');

    function openModal(videoSrc) {
        if (!videoModal || !modalVideoPlayer) return;
        
        // Update the video source and load it
        modalVideoPlayer.src = videoSrc;
        modalVideoPlayer.load();
        
        // Show modal and start playing
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop background scroll
        
        // Error handling if video file doesn't exist
        modalVideoPlayer.play().catch(e => console.log("Video source might not be valid yet:", e));
    }

    function closeModal() {
        if (!videoModal || !modalVideoPlayer) return;
        
        // Hide modal and pause video
        videoModal.classList.remove('active');
        document.body.style.overflow = '';
        modalVideoPlayer.pause();
        
        // Wait for animation frame to empty source so it doesn't keep buffering
        setTimeout(() => {
            modalVideoPlayer.src = "";
        }, 400); // 400ms is the CSS transition duration
    }

    // Expose openModal to global scope so it can be called directly if needed
    window.openModal = openModal;

    filmCards.forEach(card => {
        // Find the watch button inside the card
        const watchBtn = card.querySelector('.watch-btn-floating');
        const videoFile = card.getAttribute('data-video');
        
        // Attach click to the whole card
        card.addEventListener('click', (e) => {
            if (videoFile) openModal(videoFile);
        });

        // Also explicitly attach to the watch button and stop propagation to avoid double firing
        if (watchBtn) {
            watchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (videoFile) openModal(videoFile);
            });
        }
    });

    if (closeVideoModalBtn) closeVideoModalBtn.addEventListener('click', closeModal);
    if (videoModalOverlay) videoModalOverlay.addEventListener('click', closeModal);

    // --- 6. AI Chatbot Logic ---
    const chatBubble = document.getElementById('aiChatBubble');
    const chatTooltip = document.getElementById('aiChatTooltip');
    const chatWindow = document.getElementById('aiChatWindow');
    const chatClose = document.getElementById('aiChatClose');
    const chatMessages = document.getElementById('aiChatMessages');
    const chatForm = document.getElementById('aiChatForm');
    const chatInput = document.getElementById('aiChatInput');
    const quickReplies = document.querySelectorAll('.ai-chip');

    let chatOpened = false;

    if(chatBubble) {
        chatBubble.addEventListener('click', () => {
            if(chatTooltip) chatTooltip.classList.add('hide');
            chatWindow.classList.toggle('active');
            if(!chatOpened) {
                // First time open greeting
                setTimeout(() => {
                    appendMessage("bot", "Hello! Welcome to Frame Adda Cinematix 🎬. I am your AI Virtual Assistant. How can I help you today?");
                }, 400);
                chatOpened = true;
            }
        });
    }

    if(chatClose) {
        chatClose.addEventListener('click', () => {
            chatWindow.classList.remove('active');
        });
    }

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-msg', sender);
        msgDiv.innerHTML = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function processBotResponse(query) {
        const q = query.toLowerCase();
        let response = "Thank you for reaching out! Please fill out our <a href='#contact' onclick='document.getElementById(\"aiChatClose\").click()' style='color:var(--accent); text-decoration:underline;'>Contact Form</a> and our expert team will contact you shortly.";
        
        if(q.includes('wedding')) {
            response = "For **Wedding Films** 💍, we offer highly aesthetic storytelling focusing on cinematic realism. Our packages start from traditional coverage to premium commercial-grade shoots. Let's discuss your dates via the contact form!";
        } else if(q.includes('commercial') || q.includes('shoot')) {
            response = "Looking to elevate your brand? 🎥 Our **Commercial Shoots** include dynamic lighting setups, drone aerials, and cinematic aesthetics. Please share your project details.";
        } else if(q.includes('location') || q.includes('where')) {
            response = "📍 **Locations:** We travel across India! We specialize in locations like Gujarat (Junagadh, Kutch, Bhavnath, Girnar) and Rajasthan (Udaipur, Jaipur).";
        } else if(q.includes('price') || q.includes('cost') || q.includes('package')) {
            response = "Every visual story is unique! Drop your details in the contact form, and we'll send over our detailed pricing brochure.";
        } else if(q.includes('hi') || q.includes('hello')) {
            response = "Hey! Ready to create some breathtaking visuals?";
        }

        // Simulate typing delay
        setTimeout(() => {
            appendMessage("bot", response);
        }, 700);
    }

    if(chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if(!text) return;
            
            appendMessage("user", text);
            chatInput.value = '';
            
            processBotResponse(text);
        });
    }

    quickReplies.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            appendMessage("user", btn.innerText);
            processBotResponse(query);
            // Hide replies after one is clicked to keep it clean
            const qContainer = document.getElementById('aiQuickReplies');
            if(qContainer) qContainer.style.display = 'none';
        });
    });



    // --- 7. Logo Camera Flash Animation ---
    const logoLinks = document.querySelectorAll('.logo-link, .brand-logo-anim');
    
    // Create the flash div once and append to body
    const flashDiv = document.createElement('div');
    flashDiv.classList.add('camera-flash');
    document.body.appendChild(flashDiv);

    logoLinks.forEach(logo => {
        logo.addEventListener('click', (e) => {
            // Only prevent default if it's an anchor tag to prevent hard jumps
            if(logo.tagName.toLowerCase() === 'a') {
                e.preventDefault();
            }

            // Remove class, trigger reflow, add class (restarts animation perfectly)
            flashDiv.classList.remove('flash-active');
            void flashDiv.offsetWidth; 
            flashDiv.classList.add('flash-active');

            // Scroll to top smoothly
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        });
    });

    // --- 8. Contact Form to Email Routing (Background AJAX) ---
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const msgInput = document.getElementById('message');
            
            if(!nameInput || !emailInput || !msgInput) return;
            
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = msgInput.value.trim();

            if(!name || !email || !message) {
                alert('Please fill in all details (Name, Email, Message) before sending!');
                return;
            }

            // UI Feedback Loading
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
            submitBtn.style.pointerEvents = 'none';

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        access_key: "4c0e1301-678d-4fdf-896b-675588c0ebde",
                        subject: `New Inquiry from Frame Adda Website - ${name}`,
                        name: name,
                        email: email,
                        message: message,
                        from_name: "Frame Adda Website"
                    })
                });

                const result = await response.json();
                if(response.status == 200) {
                    // Success
                    submitBtn.innerHTML = 'Message Sent! <i class="fa-solid fa-check"></i>';
                    submitBtn.style.background = 'var(--secondary)';
                    
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.pointerEvents = 'auto';
                        submitBtn.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
                        
                        nameInput.value = '';
                        emailInput.value = '';
                        msgInput.value = '';
                    }, 4000);
                } else {
                    submitBtn.innerHTML = 'Error! Try Again <i class="fa-solid fa-circle-xmark"></i>';
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.pointerEvents = 'auto';
                    }, 3000);
                }
            } catch (error) {
                console.error(error);
                submitBtn.innerHTML = 'Error! Check Network';
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.pointerEvents = 'auto';
                }, 3000);
            }
        });
    }

    // --- Zero-Gravity Scatter Parallax ---
    const parallaxCards = document.querySelectorAll('.film-card');
    let scrollY = window.scrollY;
    let isTicking = false;

    const updateParallax = () => {
        parallaxCards.forEach(card => {
            const speed = parseFloat(card.getAttribute('data-speed')) || 0;
            // Negative means it scrolls slower, positive means faster
            const yPos = -(scrollY * speed);
            // Update the custom CSS variable, keeping the rotation intact
            card.style.setProperty('--parallax-y', `${yPos}px`);
        });
        isTicking = false;
    };

    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        if (!isTicking) {
            window.requestAnimationFrame(updateParallax);
            isTicking = true;
        }
    }, { passive: true });

    // Initial trigger
    updateParallax();

    // --- Custom Interactive Cursor ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (cursorDot && cursorFollower) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Instantly move the dot
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        // Smooth follow animation for the outer circle
        const animateCursor = () => {
            followerX += (mouseX - followerX) * 0.15; // easing
            followerY += (mouseY - followerY) * 0.15;
            
            cursorFollower.style.left = `${followerX}px`;
            cursorFollower.style.top = `${followerY}px`;
            
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Expand cursor on hoverable elements
        const hoverables = document.querySelectorAll('a, button, .film-card');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    // --- Magnetic Buttons Physics ---
    const magnetics = document.querySelectorAll('.magnetic');
    magnetics.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Pull the button towards the mouse (max 20px)
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            // Snap back to center
            btn.style.transform = `translate(0px, 0px)`;
        });
    });

});
